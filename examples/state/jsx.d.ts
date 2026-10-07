import type {Vnode} from '../../src/render/vnode'

declare global {
    namespace JSX {
        interface Element extends Vnode {}
        interface IntrinsicElements {
            [elemName: string]: any
        }
        interface ElementAttributesProperty {
            __tsx_attrs: any
        }
    }
}
