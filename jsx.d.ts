import type {Vnode, VnodeDOM} from './render/vnode'

/**
 * The event a handler receives. Mithril calls the handler on the element it sits on, so that element is the
 * `currentTarget`; setting `redraw = false` skips the redraw that follows the handler.
 */
export type ElementEvent<E extends Event, T extends Element> = E & {currentTarget: T; redraw?: boolean}

/** Returning `false` prevents the default action and stops propagation; a returned promise redraws again once it settles. */
type EventHandler<E extends Event, T extends Element> = (this: T, event: ElementEvent<E, T>) => unknown

type EventHandlers<T extends Element> = {
    [K in keyof GlobalEventHandlersEventMap as `on${K}`]?:
        | EventHandler<GlobalEventHandlersEventMap[K], T>
        | EventListenerObject
        | null
        | undefined
}

type ElementVnode<T extends Element> = VnodeDOM & {dom: T}

interface LifecycleAttrs<T extends Element> {
    key?: string | number | null | undefined
    oninit?: ((vnode: Vnode) => unknown) | null | undefined
    oncreate?: ((vnode: ElementVnode<T>) => unknown) | null | undefined
    onbeforeupdate?: ((vnode: ElementVnode<T>, old: ElementVnode<T>) => boolean | void) | null | undefined
    onupdate?: ((vnode: ElementVnode<T>) => unknown) | null | undefined
    onbeforeremove?: ((vnode: ElementVnode<T>) => Promise<unknown> | void) | null | undefined
    onremove?: ((vnode: ElementVnode<T>) => unknown) | null | undefined
}

/** The attrs of an element: typed event handlers and lifecycle hooks, any other attribute or property as is. */
export type ElementAttrs<T extends Element> = EventHandlers<T> & LifecycleAttrs<T> & {[attr: string]: unknown}

/** A fragment's attrs: its key and lifecycle hooks; `vnode.dom` is its first DOM node. */
export interface FragmentAttrs {
    key?: string | number | null | undefined
    oninit?: ((vnode: Vnode) => unknown) | null | undefined
    oncreate?: ((vnode: Vnode) => unknown) | null | undefined
    onbeforeupdate?: ((vnode: Vnode, old: Vnode) => boolean | void) | null | undefined
    onupdate?: ((vnode: Vnode) => unknown) | null | undefined
    onbeforeremove?: ((vnode: Vnode) => Promise<unknown> | void) | null | undefined
    onremove?: ((vnode: Vnode) => unknown) | null | undefined
}

/** An SVG tag that shares its name with an HTML one (`a`, `script`, `style`, `title`) types as the HTML element. */
type IntrinsicElementMap = HTMLElementTagNameMap & Omit<SVGElementTagNameMap, keyof HTMLElementTagNameMap>
type IntrinsicElementAttrs = {[K in keyof IntrinsicElementMap]: ElementAttrs<IntrinsicElementMap[K]>}

declare global {
    namespace JSX {
        /** JSX elements from hyperscript always have attrs set (at least {}). */
        interface Element extends Omit<Vnode, 'attrs'> {
            attrs: object
        }
        interface IntrinsicElements extends IntrinsicElementAttrs {}
        // Only the property's name counts: TypeScript reads a class component's attrs off it.
        interface ElementAttributesProperty {
            __tsx_attrs: unknown
        }
    }
}
