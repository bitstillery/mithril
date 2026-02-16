import type {Vnode} from './render/vnode'

declare global {
	namespace JSX {
		/** JSX elements from hyperscript always have attrs set (at least {}). */
		interface Element extends Omit<Vnode, 'attrs'> {
			attrs: Record<string, any>
		}
		interface IntrinsicElements {
			[elemName: string]: any
		}
		interface ElementAttributesProperty {
			__tsx_attrs: any
		}
	}
}
