/// <reference types="bun-types" />

import type {Vnode} from '../../src/render/vnode'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [key: string]: any
        }
        interface Element extends Vnode {}
        interface ElementAttributesProperty {
            __tsx_attrs: any
        }
    }
}
