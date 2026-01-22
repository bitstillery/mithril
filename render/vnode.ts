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

export interface Component<Attrs = Record<string, any>, State = any> {
	oninit?: (vnode: Vnode<Attrs, State>) => void
	oncreate?: (vnode: Vnode<Attrs, State>) => void
	onbeforeupdate?: (vnode: Vnode<Attrs, State>, old: Vnode<Attrs, State>) => boolean | void
	onupdate?: (vnode: Vnode<Attrs, State>) => void
	onbeforeremove?: (vnode: Vnode<Attrs, State>) => Promise<any> | void
	onremove?: (vnode: Vnode<Attrs, State>) => void
	view: (vnode: Vnode<Attrs, State>) => Children | Vnode | null
}

export interface ComponentFactory<Attrs = Record<string, any>, State = any> {
	(...args: any[]): Component<Attrs, State>
	view?: (vnode: Vnode<Attrs, State>) => Children | Vnode | null
}

export type ComponentType<Attrs = Record<string, any>, State = any> = 
	| Component<Attrs, State>
	| ComponentFactory<Attrs, State>
	| (() => Component<Attrs, State>)
	| (new (...args: any[]) => MithrilTsxComponent<Attrs>)

/**
 * Abstract base class for TSX/JSX class-based components
 * Similar to mithril-tsx-component package
 */
export abstract class MithrilTsxComponent<Attrs = Record<string, any>> {
	oninit?(vnode: Vnode<Attrs>): void
	oncreate?(vnode: Vnode<Attrs>): void
	onbeforeupdate?(vnode: Vnode<Attrs>, old: Vnode<Attrs>): boolean | void
	onupdate?(vnode: Vnode<Attrs>): void
	onbeforeremove?(vnode: Vnode<Attrs>): Promise<any> | void
	onremove?(vnode: Vnode<Attrs>): void
	abstract view(vnode: Vnode<Attrs>): Children
}

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
