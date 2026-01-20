/// <reference types="bun-types" />

import type {Vnode} from '@bitstillery/mithril'

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[key: string]: any
		}
		interface Element extends Vnode {}
	}
}

export {}
