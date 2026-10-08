import './jsx.d.ts'
import hyperscript from './render/hyperscript'
import mountRedrawFactory from './mount_redraw'
import routerFactory from './router/router'
import renderFactory from './render/render'
import parseQueryString from './router/querystring/parse'
import buildQueryString from './router/querystring/build'
import parsePathname from './router/pathname/parse'
import buildPathname from './router/pathname/build'
import VnodeFactory, {MithrilComponent} from './render/vnode'
import censor from './util/censor'
import nextTick from './util/next_tick'
import domFor from './render/dom_for'
import {getStateMaps} from './render/render'
import {logger} from './log/logger'
import {
    signal,
    computed,
    effect,
    Signal,
    ComputedSignal,
    setSignalRedrawCallback,
    getSignalComponents,
    getCurrentComponent,
    isRedrawnBy,
} from './state/signal'
import {
    state,
    watch,
    registerState,
    getRegisteredStates,
    clearStateRegistry,
    copyGlobalStatesToContext,
    allowComputed,
} from './state/state'

import type {Vnode, Children, ComponentType} from './render/vnode'
import type {Hyperscript} from './render/hyperscript'
import type {Route, RouteParams} from './router/router'
import type {Render, Redraw, Mount} from './mount_redraw'
import type {FragmentAttrs} from './jsx.d.ts'

export interface MithrilStatic {
    m: Hyperscript
    trust: (html: string) => Vnode
    fragment: (attrs: FragmentAttrs | null, ...children: Children[]) => Vnode
    Fragment: string
    mount: Mount
    route: Route
    render: Render
    redraw: Redraw
    parseQueryString: (queryString: string) => RouteParams
    buildQueryString: (values: object) => string
    parsePathname: (pathname: string) => {path: string; params: RouteParams}
    buildPathname: (template: string, params: object) => string
    vnode: typeof VnodeFactory
    censor: <T extends object>(attrs: T, extras?: string[] | null) => Partial<T>
    nextTick: () => Promise<void>
    domFor: (vnode: Vnode) => Generator<Node, void, unknown>
}

const mountRedrawInstance = mountRedrawFactory(
    renderFactory(),
    typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
    console,
)

const router = routerFactory(typeof window !== 'undefined' ? window : null, mountRedrawInstance)

// `arguments` rather than a rest parameter: m() is the hottest call, and this keeps it allocation-free.
const m: MithrilStatic & Hyperscript = function m(this: unknown) {
    return hyperscript.apply(this, arguments as unknown as Parameters<typeof hyperscript>)
} as unknown as MithrilStatic & Hyperscript

m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = '['
m.mount = mountRedrawInstance.mount
m.route = router
m.render = renderFactory()
m.redraw = mountRedrawInstance.redraw
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.parsePathname = parsePathname
m.buildPathname = buildPathname
m.vnode = VnodeFactory
m.censor = censor
m.nextTick = nextTick
m.domFor = domFor

// Set up signal-to-component redraw integration with batching.
// Collects all components needing redraw in the current tick, then flushes once via queueMicrotask.
// Avoids N synchronous redraws when many signals fire (e.g. 50% of 800 rows).
const pendingRedrawComponents = new Set<object>()
let redrawScheduled = false

// The browser can't paint between microtasks, so a component whose redraw queues another of itself
// (its view or a hook writing state it reads) would freeze the page. One redrawn more often than this
// within a single task is redrawn at most once per frame instead, until a frame passes without it.
const REDRAWS_PER_TASK = 10
let redrawsThisTask: Map<object, number> | null = null
const throttledComponents = new Set<object>()
let frameRedrawComponents = new Set<object>()
let frameRedrawScheduled = false
const scheduleFrame: (fn: () => void) => void =
    typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : (fn) => setTimeout(fn, 16)

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
// Each warning is given once per component.
const warnedLoop = new WeakSet<object>()
const warnedViewWrite = new WeakSet<object>()

/** A component's name for a warning, and the element it renders, which the console links to. */
function describeComponent(component: object): {name: string; element: Node | null} {
    const vnode = getStateMaps().stateToVnodeMap.get(component)
    const tag = vnode?.tag
    const constructor = (component as {constructor?: {name?: string}}).constructor
    const name =
        typeof tag === 'function' && tag.name
            ? tag.name
            : constructor && constructor !== Object && constructor.name
              ? constructor.name
              : 'A component'
    return {name, element: vnode?.dom ?? null}
}

function warnOnce(warned: WeakSet<object>, component: object, message: (name: string) => string): void {
    if (warned.has(component)) return
    warned.add(component)
    const {name, element} = describeComponent(component)
    logger.warn(message(name), {element})
}

function redrawNow(components: Set<object>): void {
    if (components.size === 1) {
        m.redraw(components.values().next().value)
    } else if (components.size > 1) {
        const fn = m.redraw.redrawComponents
        if (fn) fn(components)
        else m.redraw()
    }
}

function deferToFrame(component: object): void {
    frameRedrawComponents.add(component)
    if (!frameRedrawScheduled) {
        frameRedrawScheduled = true
        scheduleFrame(flushFrameRedraws)
    }
}

function flushFrameRedraws(): void {
    const components = frameRedrawComponents
    frameRedrawComponents = new Set()
    frameRedrawScheduled = false
    for (const component of throttledComponents) if (!components.has(component)) throttledComponents.delete(component)
    redrawNow(components)
    // One more frame releases what stopped looping, even if it asks for no further redraw.
    if (throttledComponents.size > 0 && !frameRedrawScheduled) {
        frameRedrawScheduled = true
        scheduleFrame(flushFrameRedraws)
    }
}

/** False when the component's redraw has to wait for the next frame. */
function mayRedrawNow(component: object): boolean {
    if (throttledComponents.has(component)) {
        deferToFrame(component)
        return false
    }
    if (redrawsThisTask === null) {
        const counts = (redrawsThisTask = new Map())
        setTimeout(() => {
            if (redrawsThisTask === counts) redrawsThisTask = null
        }, 0)
    }
    const count = (redrawsThisTask.get(component) ?? 0) + 1
    redrawsThisTask.set(component, count)
    if (count <= REDRAWS_PER_TASK) return true
    throttledComponents.add(component)
    warnOnce(
        warnedLoop,
        component,
        (name) =>
            `${name} redrew ${REDRAWS_PER_TASK} times without the browser painting, so its redraws now wait for the next frame. Its view or a lifecycle hook probably writes state it reads; move that write to oninit, an event handler or the code that loads the data.`,
    )
    deferToFrame(component)
    return false
}

function flushPendingRedraws() {
    const components = new Set<object>()
    for (const component of pendingRedrawComponents) if (mayRedrawNow(component)) components.add(component)
    pendingRedrawComponents.clear()
    redrawScheduled = false
    redrawNow(components)
}

setSignalRedrawCallback((sig: Signal<unknown>) => {
    const components = getSignalComponents(sig)
    if (components && components.size > 0) {
        let redraws = 0
        components.forEach((c) => {
            if (isRedrawnBy(c, sig)) {
                pendingRedrawComponents.add(c)
                redraws++
            }
        })
        const view = getCurrentComponent()
        if (DEV && view !== null && redraws > 0) {
            const self = components.has(view) && isRedrawnBy(view, sig)
            warnOnce(
                warnedViewWrite,
                view,
                (name) =>
                    `${name}'s view wrote state ${self ? 'it read, so it redraws itself after every render' : 'other components read, so they redraw after every render of it'}. A view should only read state; write it in oninit, an event handler or the code that loads the data.`,
            )
        }
        if (!redrawScheduled && pendingRedrawComponents.size > 0) {
            redrawScheduled = true
            queueMicrotask(flushPendingRedraws)
        }
    }
})

// Export signals API
export {
    signal,
    computed,
    effect,
    Signal,
    ComputedSignal,
    state,
    watch,
    registerState,
    getRegisteredStates,
    clearStateRegistry,
    allowComputed,
}
export type {DeepPartial, State, StateArray, StateOptions, StateSignals, Unwatch} from './state/state'

// Export Store class
export {Store} from './state/store'
export type {TabTemplate} from './state/store'

// Export SSR utilities
export {serializeStore, deserializeStore, serializeAllStates, deserializeAllStates} from './ssr/serialize'
export type {DeserializeOptions} from './ssr/serialize'

// Export SSR request context (for per-request store and state registry)
export {getSSRContext, runWithContext, runWithContextAsync, cleanupWatchers} from './ssr/context'
export type {SSRAccessContext} from './ssr/context'

// Export isomorphic logger
export {logger, Logger} from './log/logger'
export type {LogContext} from './log/logger'

// Export nextTick utility
export {nextTick} from './util/next_tick'

// Export URI utilities
export {getCurrentUrl, getPathname, getSearch, getHash, getLocation} from './router/uri'
export type {IsomorphicLocation} from './router/uri'

// Export component and vnode types
export type {
    Vnode,
    ComponentVnode,
    Children,
    Child,
    VnodeDOM,
    Component,
    ComponentFactory,
    ComponentType,
    VnodeOf,
} from './render/vnode'
export {MithrilComponent}
export type {Hyperscript} from './render/hyperscript'
export type {ElementAttrs, ElementEvent} from './jsx.d.ts'
export type {
    LinkAttrs,
    LinkComponent,
    Route,
    RouteOptions,
    RouteParams,
    RouteParamValue,
    RouteResolver,
    RedirectObject,
    SSRResult,
    SSRState,
} from './router/router'
export type {Render, Redraw, Mount} from './mount_redraw'

// Namespace merge: enables m.Vnode<Attrs> and m.Children when using import m from '@bitstillery/mithril'
// m.Vnode uses ComponentVnode so vnode.attrs is always defined in component lifecycle methods
declare namespace m {
    type Vnode<Attrs = object, State = unknown> = import('./render/vnode').ComponentVnode<Attrs, State>
    type VnodeDOM<Attrs = object, State = unknown> = import('./render/vnode').VnodeDOM<Attrs, State>
    type Children = import('./render/vnode').Children
    type ChildArray = import('./render/vnode').Child[]
}

export default m
