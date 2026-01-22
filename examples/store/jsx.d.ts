import type {Vnode} from '../../index'

declare global {
	namespace JSX {
		interface Element extends Vnode {}
		interface IntrinsicElements {
			[elemName: string]: any
		}
	}
}
