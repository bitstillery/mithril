import { signal, computed, Signal, ComputedSignal, setCurrentComponent, getCurrentComponent } from './signal'
import type { ComponentType } from './render/vnode'

// Type guard to check if value is a Signal
function isSignal<T>(value: any): value is Signal<T> {
	return value instanceof Signal || value instanceof ComputedSignal
}

// Type guard to check if value is already a store (has been wrapped)
function isStore(value: any): boolean {
	return value && typeof value === 'object' && (value as any).__isStore === true
}

/**
 * Convert a value to a signal if it's not already one
 */
function toSignal<T>(value: T): Signal<T> | ComputedSignal<T> {
	if (isSignal(value)) {
		return value as Signal<T> | ComputedSignal<T>
	}
	if (typeof value === 'function') {
		// Function properties become computed signals
		return computed(value as () => T)
	}
	return signal(value)
}

// State registry for SSR serialization
// Stores register themselves here when created
const stateRegistry = new Map<string, any>()

/**
 * Register a store for SSR serialization
 * Called automatically when store is created with a name
 */
export function registerStore(name: string, store: any): void {
	if (!name || typeof name !== 'string' || name.trim() === '') {
		throw new Error('Store name is required and must be a non-empty string')
	}
	
	// Warn in development if name collision detected
	if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
		if (stateRegistry.has(name)) {
			console.warn(`Store name collision detected: "${name}". Last registered store will be used.`)
		}
	}
	
	stateRegistry.set(name, store)
}

/**
 * Get all registered stores
 */
export function getRegisteredStores(): Map<string, any> {
	return stateRegistry
}

/**
 * Clear the state registry (useful for testing or after serialization)
 */
export function clearStoreRegistry(): void {
	stateRegistry.clear()
}

/**
 * Deep signal store - wraps objects/arrays with Proxy to make them reactive
 * @param initial - Initial state object
 * @param name - Required name for SSR serialization (must be non-empty string)
 */
export function store<T extends Record<string, any>>(initial: T, name: string): Store<T> {
	// Validate name parameter
	if (!name || typeof name !== 'string' || name.trim() === '') {
		throw new Error('Store name is required and must be a non-empty string')
	}
	const signalMap = new Map<string, Signal<any> | ComputedSignal<any>>()
	const storeCache = new WeakMap<object, any>()

	// Convert initial values to signals
	// parentSignalMap is optional - if provided, nested stores will use it (for backward compatibility with existing code)
	// If not provided, each nested store gets its own signalMap
	function initializeSignals(obj: any, parentSignalMap?: Map<string, Signal<any> | ComputedSignal<any>>): any {
		if (obj === null || typeof obj !== 'object') {
			return obj
		}

		// Check if already wrapped
		if (isStore(obj)) {
			return obj
		}

		// Check cache
		if (storeCache.has(obj)) {
			return storeCache.get(obj)
		}

		// Handle arrays
		if (Array.isArray(obj)) {
			// Arrays don't get their own signalMap - they use the parent's
			// But nested objects inside arrays should get their own signalMaps
			const signals = obj.map(item => {
				if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
					// Create nested store with its own signalMap (pass undefined to create new one)
					return initializeSignals(item, undefined)
				}
				return toSignal(item)
			})
			const wrapped = new Proxy([...signals], {
				get(target, prop) {
					if (prop === '__isStore') return true
					if (prop === '__signals') return signals
					if (prop === 'length') return signals.length
					
					const propStr = String(prop)
					
					// Check for $ prefix convention (deepsignal-style: returns raw signal)
					if (propStr.startsWith('$') && propStr.length > 1) {
						const indexStr = propStr.slice(1)
						if (!isNaN(Number(indexStr))) {
							const index = Number(indexStr)
							if (index >= 0 && index < signals.length) {
								const sig = signals[index]
								return isSignal(sig) ? sig : sig
							}
						}
						return undefined
					}
					
					if (typeof prop === 'string' && !isNaN(Number(prop))) {
						const index = Number(prop)
						if (index >= 0 && index < signals.length) {
							const sig = signals[index]
							return isSignal(sig) ? sig.value : sig
						}
					}
					const value = Reflect.get(target, prop)
					if (typeof value === 'function') {
						return value.bind(target)
					}
					return value
				},
				set(target, prop, value) {
					if (typeof prop === 'string' && !isNaN(Number(prop))) {
						const index = Number(prop)
						if (index >= 0 && index < signals.length) {
							const sig = signals[index]
							if (isSignal(sig)) {
								sig.value = value
								return true
							} else {
								signals[index] = toSignal(value)
								return true
							}
						} else if (prop === 'length') {
							signals.length = Number(value)
							return true
						}
					}
					return Reflect.set(target, prop, value)
				},
			})
			storeCache.set(obj, wrapped)
			return wrapped
		}

		// Handle objects
		// Store original keys for SSR serialization (to distinguish nested store keys from parent keys)
		const originalKeys = new Set(Object.keys(obj))
		// Each nested store gets its own signalMap (unless parentSignalMap is explicitly provided)
		// This prevents nested stores from sharing the parent's signalMap
		const nestedSignalMap = parentSignalMap || new Map<string, Signal<any> | ComputedSignal<any>>()
		const wrapped = new Proxy(obj, {
			get(target, prop) {
				if (prop === '__originalKeys') return originalKeys
				if (prop === '__isStore') return true
				// Check if __signalMap was explicitly set to null (for error testing)
				// If so, return null; otherwise return the nestedSignalMap
				if (prop === '__signalMap') {
					const explicitValue = Reflect.get(target, '__signalMap')
					return explicitValue !== undefined ? explicitValue : nestedSignalMap
				}
				
				const propStr = String(prop)
				
				// Check for $ prefix convention (deepsignal-style: returns raw signal)
				if (propStr.startsWith('$') && propStr.length > 1) {
					const key = propStr.slice(1) // Remove $ prefix
					
					// Ensure signal exists - initialize if needed
					// Use the same initialization logic as regular property access
					if (!nestedSignalMap.has(key)) {
						// First try to get from target (original object)
						const originalValue = Reflect.get(target, key)
						if (originalValue !== undefined) {
							if (typeof originalValue === 'function') {
								const computedSig = computed(() => {
									return originalValue.call(wrapped)
								})
								nestedSignalMap.set(key, computedSig)
							} else if (typeof originalValue === 'object' && originalValue !== null) {
								// Create nested store with its own signalMap
								const nestedStore = initializeSignals(originalValue, undefined)
								nestedSignalMap.set(key, signal(nestedStore))
							} else {
								const sig = toSignal(originalValue)
								nestedSignalMap.set(key, sig)
							}
						} else {
							// Property doesn't exist - return undefined
							return undefined
						}
					}
					
					// Return raw signal object (not the value)
					return nestedSignalMap.get(key)
				}
				
				const key = propStr
				
				// Check if we have a signal for this property
				if (!nestedSignalMap.has(key)) {
					// Try to get from target first (original object properties)
					const originalValue = Reflect.get(target, prop)
					if (originalValue !== undefined) {
						// Initialize signal for this property
						if (typeof originalValue === 'function') {
							// Function property -> computed signal
							const computedSig = computed(() => {
								// Call the function in the context of the store
								return originalValue.call(wrapped)
							})
							nestedSignalMap.set(key, computedSig)
						} else if (typeof originalValue === 'object' && originalValue !== null) {
							// Nested object -> recursive store with its own signalMap
							const nestedStore = initializeSignals(originalValue, undefined)
							nestedSignalMap.set(key, signal(nestedStore))
						} else {
							// Primitive value -> signal
							const sig = toSignal(originalValue)
							nestedSignalMap.set(key, sig)
						}
					} else {
						// Property doesn't exist in original object
						// Check if it's a computed property that was added dynamically
						// For now, return undefined
					}
				}

				const sig = nestedSignalMap.get(key)
				if (sig) {
					// Access signal.value to track component dependency
					return sig.value
				}

				// Fallback to original property
				return Reflect.get(target, prop)
			},
			set(target, prop, value) {
				const key = String(prop)
				
				// Allow setting __signalMap to null for testing error cases
				// But we'll check if it's actually a Map when serializing/deserializing
				if (key === '__signalMap') {
					// Store the value directly on the target (bypass proxy)
					// This allows tests to corrupt the store for error handling tests
					Reflect.set(target, prop, value)
					return true
				}
				
				// Prevent setting other internal properties
				if (key === '__isStore' || key === '__originalKeys' || key === '__signals') {
					// Silently ignore attempts to set internal properties
					return true
				}
				
				// Skip computed properties (functions)
				if (typeof value === 'function') {
					// Replace computed signal
					const computedSig = computed(() => {
						return value.call(wrapped)
					})
					nestedSignalMap.set(key, computedSig)
					return true
				}

				// Update or create signal
				if (nestedSignalMap.has(key)) {
					const sig = nestedSignalMap.get(key)
					if (sig && !(sig instanceof ComputedSignal)) {
						if (typeof value === 'object' && value !== null) {
							// Nested object -> recursive store with its own signalMap
							const nestedStore = initializeSignals(value, undefined)
							;(sig as Signal<any>).value = nestedStore
						} else {
							;(sig as Signal<any>).value = value
						}
					} else {
						// Replace computed with regular signal
						nestedSignalMap.set(key, toSignal(value))
					}
				} else {
					// Create new signal
					if (typeof value === 'object' && value !== null) {
						const nestedStore = initializeSignals(value, undefined)
						nestedSignalMap.set(key, signal(nestedStore))
					} else {
						nestedSignalMap.set(key, toSignal(value))
					}
				}

				return true
			},
			has(target, prop) {
				if (prop === '__isStore' || prop === '__signalMap') return true
				const propStr = String(prop)
				// Check for $ prefix
				if (propStr.startsWith('$') && propStr.length > 1) {
					const key = propStr.slice(1)
					return nestedSignalMap.has(key) || Reflect.has(target, key)
				}
				return nestedSignalMap.has(propStr) || Reflect.has(target, prop)
			},
			ownKeys(target) {
				const keys = new Set(Reflect.ownKeys(target))
				nestedSignalMap.forEach((_, key) => {
					keys.add(key)
					keys.add('$' + key) // Also include $ prefix keys
				})
				return Array.from(keys)
			},
			getOwnPropertyDescriptor(target, prop) {
				const propStr = String(prop)
				// Handle $ prefix
				if (propStr.startsWith('$') && propStr.length > 1) {
					const key = propStr.slice(1)
					if (nestedSignalMap.has(key)) {
						return {
							enumerable: true,
							configurable: true,
						}
					}
				}
				if (nestedSignalMap.has(propStr)) {
					return {
						enumerable: true,
						configurable: true,
					}
				}
				return Reflect.getOwnPropertyDescriptor(target, prop)
			},
		})

		storeCache.set(obj, wrapped)
		return wrapped
	}

	const wrapped = initializeSignals(initial) as Store<T>
	
	// Pre-initialize all signals from the initial object so they're available immediately
	// This ensures $s.$property works even if $s.property hasn't been accessed yet
	if (typeof initial === 'object' && initial !== null && !Array.isArray(initial)) {
		for (const key in initial) {
			if (Object.prototype.hasOwnProperty.call(initial, key)) {
				if (!signalMap.has(key)) {
					const value = initial[key]
					if (typeof value === 'function') {
						const computedSig = computed(() => {
							return value.call(wrapped)
						})
						signalMap.set(key, computedSig)
					} else if (typeof value === 'object' && value !== null) {
						// Create nested store with its own signalMap
						const nestedStore = initializeSignals(value, undefined)
						signalMap.set(key, signal(nestedStore))
					} else {
						const sig = toSignal(value)
						signalMap.set(key, sig)
					}
				}
			}
		}
	}
	
	// Register store for SSR serialization
	registerStore(name, wrapped)
	
	return wrapped
}

/**
 * Store type - reactive object with signal-based properties
 * 
 * Supports:
 * - Regular access: `store.prop` returns unwrapped value
 * - Signal access: `store.$prop` returns Signal instance (handled at runtime)
 * - Functions become computed signals
 * - Nested objects become Store instances
 * 
 * Note: The $ prefix access is handled via Proxy at runtime.
 * TypeScript's type system cannot fully express the $ prefix pattern,
 * but the implementation correctly handles it.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Store<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends (...args: any[]) => infer R
		? R  // Function properties return computed value
		: T[K] extends Record<string, any>
		? Store<T[K]>  // Nested objects become stores
		: T[K]  // Primitive values
} & {
	// Index signature for $ prefix access (runtime only, not fully typed)
	[key: string]: any
}
/* eslint-enable @typescript-eslint/no-explicit-any */
