// Type definitions for Mithril components and vnodes

export interface Vnode<Attrs = object, State = unknown> {
    tag: string | ComponentType<Attrs, State>
    key?: string | number | null | undefined
    attrs?: Attrs | undefined
    children?: Children | undefined
    text?: string | number | undefined
    dom?: Node | null | undefined
    is?: string | undefined
    domSize?: number | undefined
    state?: State | undefined
    events?: Record<string, unknown> | undefined
    /** A component's rendered tree. */
    instance?: Vnode | null | undefined
}

/** Single child - Vnode/Element, primitives, or null/undefined */
export type Child = Vnode | string | number | boolean | null | undefined
/** Children: single child, array of children, or primitives. Arrays may contain false (conditionally hidden). */
export type Children = Child | Child[]

/** Vnode with dom guaranteed (oncreate/onupdate lifecycle) */
export type VnodeDOM<Attrs = object, State = unknown> = ComponentVnode<Attrs, State> & {dom: Element}

/**
 * Vnode passed to component lifecycle methods - attrs is always defined (Mithril passes at least {}).
 * Use this so vnode.attrs is never undefined in view/oninit/oncreate etc.
 */
export type ComponentVnode<Attrs = object, State = unknown> = Omit<Vnode<Attrs, State>, 'attrs'> & {attrs: Attrs}

/**
 * The hooks are declared as methods, not function-typed properties: under `strictFunctionTypes` a
 * property's parameters are checked contravariantly, so `Component<{name: string}>` would not be a
 * `Component<Record<string, any>>` and `m(Icon, attrs)` could not be passed where `Children` is expected.
 * Method parameters are bivariant, which matches how Mithril really calls them — with the vnode it
 * built for that component.
 */
export interface Component<Attrs = object, State = unknown> {
    oninit?(vnode: ComponentVnode<Attrs, State>): void
    oncreate?(vnode: ComponentVnode<Attrs, State>): void
    onbeforeupdate?(vnode: ComponentVnode<Attrs, State>, old: ComponentVnode<Attrs, State>): boolean | void
    onupdate?(vnode: ComponentVnode<Attrs, State>): void
    onbeforeremove?(vnode: ComponentVnode<Attrs, State>): Promise<unknown> | void
    onremove?(vnode: ComponentVnode<Attrs, State>): void
    view(vnode: ComponentVnode<Attrs, State>): Children | Vnode | null
}

export interface ComponentFactory<Attrs = object, State = unknown> {
    (...args: never[]): Component<Attrs, State>
    view?(vnode: ComponentVnode<Attrs, State>): Children | Vnode | null
}

export type ComponentType<Attrs = object, State = unknown> =
    | Component<Attrs, State>
    | ComponentFactory<Attrs, State>
    | (() => Component<Attrs, State>)
    | (new (...args: never[]) => MithrilComponent<Attrs>)
    | (new (...args: never[]) => Component<Attrs, State>)

/**
 * Abstract base class for TSX/JSX class-based components.
 * Assign view as a property so TypeScript infers vnode from the template: view = (vnode) => { ... }
 */
export abstract class MithrilComponent<Attrs = object> {
    /** Required for JSX attribute type-checking - do not use directly */
    private readonly __tsx_attrs!: (unknown extends Attrs ? Record<string, unknown> : Attrs) & {key?: string | number | null}

    oninit?(vnode: ComponentVnode<Attrs>): void
    oncreate?(vnode: ComponentVnode<Attrs>): void
    onbeforeupdate?(vnode: ComponentVnode<Attrs>, old: ComponentVnode<Attrs>): boolean | void
    onupdate?(vnode: ComponentVnode<Attrs>): void
    onbeforeremove?(vnode: ComponentVnode<Attrs>): Promise<unknown> | void
    onremove?(vnode: ComponentVnode<Attrs>): void
    /** Implement in subclass: view(vnode) { ... } - annotate vnode as m.Vnode<Attrs> */
    abstract view(vnode: ComponentVnode<Attrs>): Children | Vnode | null
}

/** Helper type for Vnode of a component - use when this['Vnode'] is not available */
export type VnodeOf<T> = T extends MithrilComponent<infer A> ? ComponentVnode<A> : never

/** A view or lifecycle hook as the renderer calls it: on the vnode's state, with the vnode first. */
export type Hook = (this: unknown, ...args: unknown[]) => unknown

/**
 * What the renderer reads off a vnode's state, or off its attrs: the hooks a component or element may
 * define. Each is checked to be a function before it is called. An element's state is an empty object.
 */
export interface LifecycleSource {
    view?: unknown
    oninit?: unknown
    oncreate?: unknown
    onbeforeupdate?: unknown
    onupdate?: unknown
    onbeforeremove?: unknown
    onremove?: unknown
}

/**
 * An element's event listener: one object registered for all its `on*` handlers, holding them by
 * attribute name, plus the redraw of the render that set them.
 */
export type EventDict = {_: (() => void) | null | undefined; handleEvent(ev: Event): void} & {[handler: string]: unknown}

/**
 * A vnode as the renderer handles it. Hyperscript normalizes an element's or fragment's children into
 * `RenderChildren`, and text and trusted-HTML vnodes carry their content as a string. A component's
 * children stay as the caller passed them, for its view; the renderer never reads those.
 */
export interface RenderVnode {
    tag: string | ComponentType
    key?: string | number | null | undefined
    attrs?: Record<string, unknown> | undefined
    children?: RenderChildren | string | undefined
    text?: string | number | undefined
    dom?: Node | null | undefined
    is?: string | undefined
    domSize?: number | undefined
    state?: LifecycleSource | undefined
    events?: EventDict | undefined
    instance?: RenderVnode | null | undefined
}

/** A component as the renderer instantiates it: an object with a view, a class, or a closure returning one. */
export type ComponentTag = {
    view?: unknown
    prototype?: {view?: unknown}
    (vnode: RenderVnode): LifecycleSource
    new (vnode: RenderVnode): LifecycleSource
}

/** An element's or fragment's children once normalized; a hole stays null. */
export type RenderChildren = (RenderVnode | null)[]

/** A DOM node the renderer has rendered into, holding the vnodes it rendered there. */
export type RenderRoot = Element & {vnodes?: RenderChildren | null}

function Vnode(
    tag: string | ComponentType,
    key: string | number | null | undefined,
    attrs: Record<string, unknown> | null | undefined,
    children: RenderChildren | string | null | undefined,
    text: string | number | null | undefined,
    dom: Node | null | undefined,
): RenderVnode {
    return {
        tag: tag,
        key: key ?? undefined,
        attrs: attrs ?? undefined,
        children: children ?? undefined,
        text: text ?? undefined,
        dom: dom ?? undefined,
        is: undefined,
        domSize: undefined,
        state: undefined,
        events: undefined,
        instance: undefined,
    }
}
// An object is taken to be a vnode: that is what a view or child may return besides primitives and arrays.
const normalize = function (node: unknown): RenderVnode | null {
    if (Array.isArray(node)) return Vnode('[', undefined, undefined, normalizeChildren(node), undefined, undefined)
    if (node == null || typeof node === 'boolean') return null
    if (typeof node === 'object') return node as RenderVnode
    return Vnode('#', undefined, undefined, String(node), undefined, undefined)
}

const normalizeChildren = function (input: readonly unknown[]): RenderChildren {
    // Preallocate the array length (initially holey) and fill every index immediately in order.
    // Benchmarking shows better performance on V8.
    //
    // Do NOT let a linter rewrite this to `Array.from({length: n})`: that is not holey, it walks the
    // array-like/iterator path, and on V8 it is ~15x slower here (measured on node 22: ~98ms vs ~6.4ms
    // for 200k calls at 12 children). This is the hottest function in a portal render profile, so the
    // difference is not academic — it was silently lost once already to an oxlint autofix.
    // oxlint-disable-next-line no-new-array
    const children = new Array(input.length) as RenderChildren
    // Count the number of keyed normalized vnodes for consistency check.
    // Note: this is a perf-sensitive check.
    // Fun fact: merging the loop like this is somehow faster than splitting
    // the check within updateNodes(), noticeably so.
    let numKeyed = 0
    for (let i = 0; i < input.length; i++) {
        children[i] = normalize(input[i])
        if (children[i] !== null && children[i]!.key != null) numKeyed++
    }
    if (numKeyed !== 0 && numKeyed !== input.length) {
        throw new TypeError(
            children.includes(null)
                ? 'In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole.'
                : 'In fragments, vnodes must either all have keys or none have keys.',
        )
    }
    return children
}

export default Object.assign(Vnode, {normalize, normalizeChildren})
