/// <reference types="bun-types" />

import type {Vnode} from '../../index'

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[key: string]: any
		}
		interface Element extends Vnode {}
	}
}

export {}
