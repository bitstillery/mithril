// Type definitions for Mithril components and vnodes

export interface Vnode<Attrs = Record<string, any>, State = any> {
	tag: string | Component<Attrs, State> | (() => Component<Attrs, State>)
	key?: string | number | null
	attrs?: Attrs
	children?: Children
	text?: string | number
	dom?: Node | null
	is?: string
	domSize?: number
	state?: State
	events?: Record<string, any>
	instance?: any
}

export type Children = Vnode[] | string | number | boolean | null | undefined

/**
 * Vnode passed to component lifecycle methods - attrs is always defined (Mithril passes at least {}).
 * Use this so vnode.attrs is never undefined in view/oninit/oncreate etc.
 */
export type ComponentVnode<Attrs = Record<string, any>, State = any> = Omit<Vnode<Attrs, State>, 'attrs'> & {attrs: Attrs}

export interface Component<Attrs = Record<string, any>, State = any> {
	oninit?: (vnode: ComponentVnode<Attrs, State>) => void
	oncreate?: (vnode: ComponentVnode<Attrs, State>) => void
	onbeforeupdate?: (vnode: ComponentVnode<Attrs, State>, old: ComponentVnode<Attrs, State>) => boolean | void
	onupdate?: (vnode: ComponentVnode<Attrs, State>) => void
	onbeforeremove?: (vnode: ComponentVnode<Attrs, State>) => Promise<any> | void
	onremove?: (vnode: ComponentVnode<Attrs, State>) => void
	view: (vnode: ComponentVnode<Attrs, State>) => Children | Vnode | null
}

export interface ComponentFactory<Attrs = Record<string, any>, State = any> {
	(...args: any[]): Component<Attrs, State>
	view?: (vnode: ComponentVnode<Attrs, State>) => Children | Vnode | null
}

export type ComponentType<Attrs = Record<string, any>, State = any> = 
	| Component<Attrs, State>
	| ComponentFactory<Attrs, State>
	| (() => Component<Attrs, State>)
	| (new (...args: any[]) => MithrilComponent<Attrs>)

/**
 * Abstract base class for TSX/JSX class-based components.
 * Assign view as a property so TypeScript infers vnode from the template: view = (vnode) => { ... }
 */
export abstract class MithrilComponent<Attrs = Record<string, any>> {
	/** Required for JSX attribute type-checking - do not use directly */
	private readonly __tsx_attrs!: Attrs & {key?: string | number}

	oninit?(vnode: ComponentVnode<Attrs>): void
	oncreate?(vnode: ComponentVnode<Attrs>): void
	onbeforeupdate?(vnode: ComponentVnode<Attrs>, old: ComponentVnode<Attrs>): boolean | void
	onupdate?(vnode: ComponentVnode<Attrs>): void
	onbeforeremove?(vnode: ComponentVnode<Attrs>): Promise<any> | void
	onremove?(vnode: ComponentVnode<Attrs>): void
	/** Implement in subclass: view(vnode) { ... } - annotate vnode as m.Vnode<Attrs> */
	abstract view(vnode: ComponentVnode<Attrs>): Children | Vnode | null
}

/** Helper type for Vnode of a component - use when this['Vnode'] is not available */
export type VnodeOf<T> = T extends MithrilComponent<infer A> ? ComponentVnode<A> : never

function Vnode(tag: any, key: string | number | null | undefined, attrs: Record<string, any> | null | undefined, children: Children | null | undefined, text: string | number | null | undefined, dom: Node | null | undefined): Vnode {
	return {tag: tag, key: key ?? undefined, attrs: attrs ?? undefined, children: children ?? undefined, text: text ?? undefined, dom: dom ?? undefined, is: undefined, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
const normalize = function(node: any): Vnode | null {
	if (Array.isArray(node)) return Vnode('[', undefined, undefined, normalizeChildren(node) as Children, undefined, undefined)
	if (node == null || typeof node === 'boolean') return null
	if (typeof node === 'object') return node
	return Vnode('#', undefined, undefined, String(node), undefined, undefined)
}

const normalizeChildren = function(input: any[]): (Vnode | null)[] {
	// Preallocate the array length (initially holey) and fill every index immediately in order.
	// Benchmarking shows better performance on V8.
	const children = new Array(input.length)
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
		throw new TypeError(children.includes(null)
			? 'In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole.'
			: 'In fragments, vnodes must either all have keys or none have keys.',
		)
	}
	return children
}

;(Vnode as any).normalize = normalize
;(Vnode as any).normalizeChildren = normalizeChildren

export default Vnode as typeof Vnode & {
	normalize: typeof normalize
	normalizeChildren: typeof normalizeChildren
}
