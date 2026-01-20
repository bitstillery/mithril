// Type definitions for Mithril

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

export interface Hyperscript {
	(selector: string, ...children: Children[]): Vnode
	(selector: string, attrs: Record<string, any>, ...children: Children[]): Vnode
	<Attrs, State>(component: ComponentType<Attrs, State>, ...children: Children[]): Vnode<Attrs, State>
	<Attrs, State>(component: ComponentType<Attrs, State>, attrs: Attrs, ...children: Children[]): Vnode<Attrs, State>
	trust(html: string): Vnode
	fragment(attrs: Record<string, any> | null, ...children: Children[]): Vnode
	Fragment: string
}

export interface RouteResolver<Attrs = Record<string, any>, State = any> {
	onmatch?: (args: Attrs, requestedPath: string, route: string) => ComponentType<Attrs, State> | Promise<ComponentType<Attrs, State>> | void
	render?: (vnode: Vnode<Attrs, State>) => Vnode
}

export interface Route {
	(path: string, params?: Record<string, any>, shouldReplaceHistory?: boolean): void
	(path: string, component: ComponentType, shouldReplaceHistory?: boolean): void
	set: (path: string, params?: Record<string, any>, data?: any) => void
	get: () => string
	prefix: (prefix: string) => void
	link: (vnode: Vnode) => string
	param: (key?: string) => any
	params: Record<string, any>
}

export interface Render {
	(root: Element, vnodes: Children | Vnode | null): void
}

export interface Redraw {
	(): void
	sync(): void
}

export interface Mount {
	(root: Element, component: ComponentType | null): void
}

export interface MithrilStatic {
	m: Hyperscript
	trust: (html: string) => Vnode
	fragment: (attrs: Record<string, any> | null, ...children: Children[]) => Vnode
	Fragment: string
	mount: Mount
	route: Route
	render: Render
	redraw: Redraw
	parseQueryString: (queryString: string) => Record<string, any>
	buildQueryString: (values: Record<string, any>) => string
	parsePathname: (pathname: string) => { path: string, params: Record<string, any> }
	buildPathname: (template: string, params: Record<string, any>) => string
	vnode: {
		(tag: string | ComponentType, key: string | number | null | undefined, attrs: Record<string, any> | null | undefined, children: Children | null | undefined, text: string | number | null | undefined, dom: Node | null | undefined): Vnode
		normalize: (node: any) => Vnode | null
		normalizeChildren: (input: any[]) => (Vnode | null)[]
	}
	censor: (obj: any, censor: (key: string, value: any) => boolean) => any
	domFor: (dom: Node) => Vnode | null
}

declare const m: MithrilStatic & Hyperscript

export default m
