import {serializeAllStates} from './ssrState'
import Vnode from './vnode'

import type {Children, ComponentTag, Hook, LifecycleSource, RenderChildren, RenderVnode, Vnode as VnodeType} from './vnode'

// Void elements that don't have closing tags
const VOID_ELEMENTS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
])

export interface RenderToStringOptions {
    escapeAttribute?: (value: unknown) => string
    escapeText?: (value: unknown) => string
    strict?: boolean // Close all empty tags
    xml?: boolean // XML mode (implies strict)
}

// Default escape functions. A single scan that copies runs of safe characters beats one regex
// replace per character class, and returns the string itself when nothing needs escaping.
function escapeAttributeDefault(value: unknown): string {
    const str = String(value)
    let out = ''
    let last = 0
    for (let i = 0; i < str.length; i++) {
        let entity: string
        switch (str.charCodeAt(i)) {
            case 38:
                entity = '&amp;'
                break
            case 34:
                entity = '&quot;'
                break
            case 39:
                entity = '&#39;'
                break
            case 60:
                entity = '&lt;'
                break
            case 62:
                entity = '&gt;'
                break
            default:
                continue
        }
        if (last !== i) out += str.slice(last, i)
        out += entity
        last = i + 1
    }
    if (last === 0) return str
    return last === str.length ? out : out + str.slice(last)
}

function escapeTextDefault(value: unknown): string {
    const str = String(value)
    let out = ''
    let last = 0
    for (let i = 0; i < str.length; i++) {
        let entity: string
        switch (str.charCodeAt(i)) {
            case 38:
                entity = '&amp;'
                break
            case 60:
                entity = '&lt;'
                break
            case 62:
                entity = '&gt;'
                break
            default:
                continue
        }
        if (last !== i) out += str.slice(last, i)
        out += entity
        last = i + 1
    }
    if (last === 0) return str
    return last === str.length ? out : out + str.slice(last)
}

function isVoidElement(tag: string): boolean {
    return VOID_ELEMENTS.has(tag.toLowerCase())
}

// Promise tracker for async data fetching
class PromiseTracker {
    private promises: Promise<unknown>[] = []

    waitFor(promise: Promise<unknown>) {
        this.promises.push(promise)
    }

    async waitAll(): Promise<void> {
        if (this.promises.length > 0) {
            await Promise.all(this.promises)
            this.promises = []
        }
    }

    hasPromises(): boolean {
        return this.promises.length > 0
    }

    reset() {
        this.promises = []
    }
}

// Serialize attributes to HTML string
function serializeAttributes(
    attrs: Record<string, unknown> | null | undefined,
    options: Required<RenderToStringOptions>,
): string {
    if (!attrs) return ''

    const parts: string[] = []

    for (const key in attrs) {
        const value = attrs[key]

        // Skip lifecycle hooks and special attributes
        if (
            key === 'key' ||
            key === 'oninit' ||
            key === 'oncreate' ||
            key === 'onupdate' ||
            key === 'onremove' ||
            key === 'onbeforeremove' ||
            key === 'onbeforeupdate' ||
            (key.startsWith('on') && typeof value === 'function')
        ) {
            continue
        }

        if (value == null) continue

        // Handle className -> class
        const attrName = key === 'className' ? 'class' : key

        if (typeof value === 'boolean') {
            if (value) {
                parts.push(attrName)
            }
        } else if (typeof value === 'object') {
            // Handle style objects
            if (key === 'style') {
                const styleStr = Object.entries(value)
                    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
                    .join('; ')
                parts.push(`${attrName}="${options.escapeAttribute(styleStr)}"`)
            } else {
                // For other objects, stringify
                parts.push(`${attrName}="${options.escapeAttribute(JSON.stringify(value))}"`)
            }
        } else {
            parts.push(`${attrName}="${options.escapeAttribute(value)}"`)
        }
    }

    return parts.length > 0 ? ' ' + parts.join(' ') : ''
}

// Serialize text node
function serializeText(text: string | number, options: Required<RenderToStringOptions>): string {
    return options.escapeText(text)
}

// Serialize component (sync version - no async handling)
function serializeComponentSync(
    vnode: RenderVnode,
    options: Required<RenderToStringOptions>,
    promiseTracker: PromiseTracker,
): string {
    const component = vnode.tag as ComponentTag

    // Initialize component state
    let state: LifecycleSource
    let view: Hook | undefined

    if (typeof component.view === 'function') {
        // Component object
        state = Object.create(component) as LifecycleSource
        view = state.view as Hook | undefined
    } else {
        // Component factory/class
        if (component.prototype && typeof component.prototype.view === 'function') {
            state = new component(vnode)
        } else {
            state = component(vnode)
        }
        view = state.view as Hook | undefined
    }

    if (!view) {
        return ''
    }

    vnode.state = state

    // Call oninit with context (sync mode - don't await)
    if (typeof state.oninit === 'function') {
        try {
            const context = {
                isSSR: true,
                isHydrating: false,
            }
            // Call oninit but don't wait for it (sync mode)
            ;(state.oninit as Hook)(vnode, context)
        } catch (_e) {
            // Ignore errors
        }
    }

    // Call view (bind this to state)
    const instance = Vnode.normalize(view.call(state, vnode))
    if (instance === vnode) {
        throw Error('A view cannot return the vnode it received as argument')
    }

    vnode.instance = instance

    // Serialize the instance
    if (instance != null) {
        return serializeNodeSync(instance, options, promiseTracker)
    }

    return ''
}

// Serialize a single vnode to HTML string (sync version)
function serializeNodeSync(
    vnode: RenderVnode | null,
    options: Required<RenderToStringOptions>,
    promiseTracker: PromiseTracker,
): string {
    if (vnode == null) return ''

    const tag = vnode.tag

    // Text node
    if (tag === '#') {
        return serializeText(vnode.children as string | number, options)
    }

    // HTML/trust node
    if (tag === '<') {
        return vnode.children as string
    }

    // Fragment
    if (tag === '[') {
        const children = vnode.children as RenderChildren
        if (!children) return ''
        let html = ''
        for (let i = 0; i < children.length; i++) html += serializeNodeSync(children[i] ?? null, options, promiseTracker)
        return html
    }

    // Component
    if (typeof tag !== 'string') {
        return serializeComponentSync(vnode, options, promiseTracker)
    }

    // Element
    const attrs = serializeAttributes(vnode.attrs, options)
    const children = vnode.children

    let html = `<${tag}${attrs}`

    const isVoid = isVoidElement(tag)
    const shouldSelfClose = (options.strict || options.xml) && isVoid

    if (shouldSelfClose) {
        html += options.xml ? ' />' : '>'
        return html
    }

    html += '>'

    // Serialize children
    if (children != null) {
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) html += serializeNodeSync(children[i] ?? null, options, promiseTracker)
        } else if (typeof children === 'string' || typeof children === 'number') {
            html += serializeText(children, options)
        } else if (children != null) {
            html += serializeNodeSync(children, options, promiseTracker)
        }
    }

    // Always close non-void elements
    if (!isVoid) {
        html += `</${tag}>`
    }

    return html
}

// Serialize a single vnode to HTML string
async function serializeNode(
    vnode: RenderVnode | null,
    options: Required<RenderToStringOptions>,
    promiseTracker: PromiseTracker,
    isServer: boolean,
): Promise<string> {
    if (vnode == null) return ''

    const tag = vnode.tag

    // Text node
    if (tag === '#') {
        return serializeText(vnode.children as string | number, options)
    }

    // HTML/trust node
    if (tag === '<') {
        return vnode.children as string
    }

    // Fragment
    if (tag === '[') {
        const children = vnode.children as RenderChildren
        if (!children) return ''
        const results = await Promise.all(children.map((child) => serializeNode(child, options, promiseTracker, isServer)))
        return results.join('')
    }

    // Component
    if (typeof tag !== 'string') {
        return await serializeComponent(vnode, options, promiseTracker, isServer)
    }

    // Element
    const attrs = serializeAttributes(vnode.attrs, options)
    const children = vnode.children

    let html = `<${tag}${attrs}`

    const isVoid = isVoidElement(tag)
    const shouldSelfClose = (options.strict || options.xml) && isVoid

    if (shouldSelfClose) {
        html += options.xml ? ' />' : '>'
        return html
    }

    html += '>'

    // Serialize children
    if (children != null) {
        if (Array.isArray(children)) {
            const results = await Promise.all(children.map((child) => serializeNode(child, options, promiseTracker, isServer)))
            html += results.join('')
        } else if (typeof children === 'string' || typeof children === 'number') {
            html += serializeText(children, options)
        } else if (children != null) {
            html += await serializeNode(children, options, promiseTracker, isServer)
        }
    }

    // Always close non-void elements
    if (!isVoid) {
        html += `</${tag}>`
    }

    return html
}

// Serialize component
async function serializeComponent(
    vnode: RenderVnode,
    options: Required<RenderToStringOptions>,
    promiseTracker: PromiseTracker,
    isServer: boolean,
): Promise<string> {
    const component = vnode.tag as ComponentTag

    // Initialize component state
    let state: LifecycleSource
    let view: Hook | undefined

    if (typeof component.view === 'function') {
        // Component object
        state = Object.create(component) as LifecycleSource
        view = state.view as Hook | undefined
    } else {
        // Component factory/class
        if (component.prototype && typeof component.prototype.view === 'function') {
            state = new component(vnode)
        } else {
            state = component(vnode)
        }
        view = state.view as Hook | undefined
    }

    if (!view) {
        return ''
    }

    vnode.state = state

    // No component tracking: nothing redraws on the server, and a long-lived signal would keep every
    // rendered component reachable through its tracking set, one more per request.

    // Call oninit with context if on server
    if (isServer && typeof state.oninit === 'function') {
        const context = {
            isSSR: true,
            isHydrating: false,
        }
        try {
            const result = (state.oninit as Hook)(vnode, context)
            // If oninit returns a promise, await it
            if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
                await (result as PromiseLike<unknown>)
            }
        } catch (_e) {
            // Ignore errors in oninit for now
        }
    }

    // Call view (bind this to state)
    const instance = Vnode.normalize(view.call(state, vnode))
    if (instance === vnode) {
        throw Error('A view cannot return the vnode it received as argument')
    }

    vnode.instance = instance

    // Serialize the instance
    if (instance != null) {
        return serializeNode(instance, options, promiseTracker, isServer)
    }

    return ''
}

export function renderToStringFactory() {
    const defaultOptions: Required<RenderToStringOptions> = {
        escapeAttribute: escapeAttributeDefault,
        escapeText: escapeTextDefault,
        strict: false,
        xml: false,
    }

    // Async version (waits for promises)
    async function renderToString(
        vnodes: Children | VnodeType | null,
        options?: RenderToStringOptions,
    ): Promise<{html: string; state: Record<string, unknown>}> {
        const opts: Required<RenderToStringOptions> = {
            ...defaultOptions,
            ...options,
            escapeAttribute: options?.escapeAttribute || defaultOptions.escapeAttribute,
            escapeText: options?.escapeText || defaultOptions.escapeText,
        }

        // Normalize vnodes
        const normalized = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])

        const promiseTracker = new PromiseTracker()

        // First pass: render and collect promises
        let html = ''
        const htmlParts: Promise<string>[] = []
        for (const vnode of normalized) {
            if (vnode != null) {
                htmlParts.push(serializeNode(vnode, opts, promiseTracker, true))
            }
        }
        html = (await Promise.all(htmlParts)).join('')

        // Wait for all promises
        if (promiseTracker.hasPromises()) {
            await promiseTracker.waitAll()

            // Second pass: re-render after promises resolve
            promiseTracker.reset()
            html = ''
            const htmlParts2: Promise<string>[] = []
            for (const vnode of normalized) {
                if (vnode != null) {
                    htmlParts2.push(serializeNode(vnode, opts, promiseTracker, true))
                }
            }
            html = (await Promise.all(htmlParts2)).join('')
        }

        // Serialize all registered stores
        const state = serializeAllStates()

        return {html, state}
    }

    // Sync version (no promise waiting)
    function renderToStringSync(vnodes: Children | VnodeType | null, options?: RenderToStringOptions): string {
        const opts: Required<RenderToStringOptions> = {
            ...defaultOptions,
            ...options,
            escapeAttribute: options?.escapeAttribute || defaultOptions.escapeAttribute,
            escapeText: options?.escapeText || defaultOptions.escapeText,
        }

        const normalized = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])

        const promiseTracker = new PromiseTracker()

        // For sync version, we need to handle async functions synchronously
        // This means we won't wait for promises, but we'll still render what we can
        let html = ''
        for (const vnode of normalized) {
            if (vnode != null) {
                // In sync mode, we can't await, so we'll render synchronously
                // Components with async oninit won't have their data, but that's expected
                const result = serializeNodeSync(vnode, opts, promiseTracker)
                html += result
            }
        }

        return html
    }

    return {
        renderToString,
        renderToStringSync,
    }
}
