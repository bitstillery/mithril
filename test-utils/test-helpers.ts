// @ts-nocheck
// Helper to provide ospec-like spy functionality for Bun test
import {mock} from 'bun:test'

export function spy<T extends (...args: any[]) => any>(fn?: T): T & {callCount: number; this: any; args: any[]} {
	const spyFn = mock(fn || (() => {}) as T)
	const wrappedSpy = function(this: any, ...args: any[]) {
		return spyFn.apply(this, args)
	} as T & {callCount: number; this: any; args: any[]}
	
	Object.defineProperty(wrappedSpy, 'callCount', {
		get() {
			return spyFn.mock.calls.length
		},
		enumerable: true,
		configurable: true,
	})
	
	Object.defineProperty(wrappedSpy, 'this', {
		get() {
			if (spyFn.mock.calls.length === 0) return undefined
			const lastContext = spyFn.mock.contexts[spyFn.mock.calls.length - 1]
			// Bun's mock.contexts might return internal objects, so we need to handle that
			if (lastContext && typeof lastContext === 'object' && !('toString' in lastContext) || lastContext === globalThis || lastContext === global) {
				return undefined
			}
			return lastContext
		},
		enumerable: true,
		configurable: true,
	})
	
	Object.defineProperty(wrappedSpy, 'args', {
		get() {
			return spyFn.mock.calls.length > 0 ? spyFn.mock.calls[spyFn.mock.calls.length - 1] : []
		},
		enumerable: true,
		configurable: true,
	})
	
	// Copy mock property for compatibility
	Object.defineProperty(wrappedSpy, 'mock', {
		get() {
			return spyFn.mock
		},
		enumerable: false,
		configurable: true,
	})
	
	return wrappedSpy
}
