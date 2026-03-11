import './jsx.d.ts'
import hyperscript from './render/hyperscript'
import mountRedrawFactory from './api/mount-redraw'
import routerFactory from './api/router'
import renderFactory from './render/render'
import parseQueryString from './querystring/parse'
import buildQueryString from './querystring/build'
import parsePathname from './pathname/parse'
import buildPathname from './pathname/build'
import VnodeFactory, {MithrilComponent} from './render/vnode'
import censor from './util/censor'
import nextTick from './util/next_tick'
import domFor from './render/domFor'
import {signal, computed, effect, Signal, ComputedSignal, setSignalRedrawCallback, getSignalComponents} from './signal'
import {state, watch, registerState, getRegisteredStates, clearStateRegistry, copyGlobalStatesToContext} from './state'

import type {Vnode, Children, ComponentType} from './render/vnode'
import type {Hyperscript} from './render/hyperscript'
import type {Route, RouteResolver, RedirectObject} from './api/router'
import type {Render, Redraw, Mount} from './api/mount-redraw'

export interface MithrilStatic {
    m: Hyperscript
    trust: (html: string) => Vnode
    fragment: (attrs: Record<string, any> | null, ...children: Children[]) => Vnode
    Fragment: string
    mount: Mount
    route: Route &
        ((root: Element, defaultRoute: string, routes: Record<string, ComponentType | RouteResolver>) => void) & {
            redirect: (path: string) => RedirectObject
        }
    render: Render
    redraw: Redraw
    parseQueryString: (queryString: string) => Record<string, any>
    buildQueryString: (values: Record<string, any>) => string
    parsePathname: (pathname: string) => {path: string; params: Record<string, any>}
    buildPathname: (template: string, params: Record<string, any>) => string
    vnode: typeof VnodeFactory
    censor: (attrs: Record<string, any>, extras?: string[]) => Record<string, any>
    nextTick: () => Promise<void>
    domFor: (vnode: Vnode) => Generator<Node, void, unknown>
}

const mountRedrawInstance = mountRedrawFactory(
    renderFactory(),
    typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
    console,
)

const router = routerFactory(typeof window !== 'undefined' ? window : null, mountRedrawInstance)

const m: MithrilStatic & Hyperscript = function m(this: any) {
    return hyperscript.apply(this, arguments as any)
} as unknown as MithrilStatic & Hyperscript

m.m = hyperscript as Hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = '['
m.mount = mountRedrawInstance.mount
m.route = router as Route & typeof router & {redirect: (path: string) => RedirectObject}
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
let pendingRedrawComponents = new Set<any>()
let redrawScheduled = false

function flushPendingRedraws() {
    const components = new Set(pendingRedrawComponents)
    pendingRedrawComponents.clear()
    redrawScheduled = false
    if (components.size === 1) {
        m.redraw(components.values().next().value)
    } else if (components.size > 1) {
        const fn = (m.redraw as any).redrawComponents
        if (fn) fn(components)
        else m.redraw()
    }
}

setSignalRedrawCallback((sig: Signal<any>) => {
    const components = getSignalComponents(sig)
    if (components && components.size > 0) {
        components.forEach((c) => pendingRedrawComponents.add(c))
        if (!redrawScheduled) {
            redrawScheduled = true
            queueMicrotask(flushPendingRedraws)
        }
    }
})

// Export signals API
export {signal, computed, effect, Signal, ComputedSignal, state, watch, registerState, getRegisteredStates, clearStateRegistry}
export type {State, StateOptions, StateSignals, Unwatch} from './state'

// Export Store class
export {Store} from './store'

// Export SSR utilities
export {serializeStore, deserializeStore, serializeAllStates, deserializeAllStates} from './render/ssrState'
export type {DeserializeOptions} from './render/ssrState'

// Export SSR request context (for per-request store and state registry)
export {getSSRContext, runWithContext, runWithContextAsync, cleanupWatchers} from './ssrContext'
export type {SSRAccessContext} from './ssrContext'

// Export isomorphic logger
export {logger, Logger} from './server/logger'
export type {LogContext} from './server/logger'

// Export nextTick utility
export {nextTick} from './util/next_tick'

// Export URI utilities
export {getCurrentUrl, getPathname, getSearch, getHash, getLocation} from './util/uri'
export type {IsomorphicLocation} from './util/uri'

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
export type {Route, RouteResolver, RedirectObject} from './api/router'
export type {Render, Redraw, Mount} from './api/mount-redraw'

// Namespace merge: enables m.Vnode<Attrs> and m.Children when using import m from '@bitstillery/mithril'
// m.Vnode uses ComponentVnode so vnode.attrs is always defined in component lifecycle methods
declare namespace m {
    type Vnode<Attrs = Record<string, any>, State = any> = import('./render/vnode').ComponentVnode<Attrs, State>
    type VnodeDOM<Attrs = Record<string, any>, State = any> = import('./render/vnode').VnodeDOM<Attrs, State>
    type Children = import('./render/vnode').Children
    type ChildArray = import('./render/vnode').Child[]
}

export default m
