import {signal, computed, Signal, ComputedSignal} from './signal'

// WeakMap to store parent signal references for arrays
const arrayParentSignalMap = new WeakMap<any, Signal<any>>()

// Type guard to check if value is a Signal
function isSignal<T>(value: any): value is Signal<T> {
	return value instanceof Signal || value instanceof ComputedSignal
}

// Type guard to check if value is already a state (has been wrapped)
function isState(value: any): boolean {
	return value && typeof value === 'object' && (value as any).__isState === true
}

/**
 * Check if a value is a get/set descriptor object (like JavaScript property descriptors)
 * Used to detect computed properties defined as { get: () => T, set?: (value: T) => void }
 */
function isGetSetDescriptor(value: any): boolean {
	return value && typeof value === 'object' && 
	       (typeof value.get === 'function' || typeof value.set === 'function')
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
// Stores both state instance and original initial state (with computed properties)
interface StateRegistryEntry {
	state: any
	initial: any
}

const stateRegistry = new Map<string, StateRegistryEntry>()

/**
 * Register a state for SSR serialization
 * Called automatically when state is created with a name
 * @param name - Unique name for the state
 * @param stateInstance - The state instance to register
 * @param initial - Original initial state (with computed properties) for restoration
 */
export function registerState(name: string, stateInstance: any, initial: any): void {
	if (!name || typeof name !== 'string' || name.trim() === '') {
		throw new Error('State name is required and must be a non-empty string')
	}
	
	// Warn in development if name collision detected
	if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
		if (stateRegistry.has(name)) {
			console.warn(`State name collision detected: "${name}". Last registered state will be used.`)
		}
	}
	
	stateRegistry.set(name, {state: stateInstance, initial})
}

/**
 * Update the registry entry for an existing state
 * Used by Store to update its "initial" state after load() is called
 * @param stateInstance - The state instance to update
 * @param initial - New initial state (merged templates for Store)
 */
export function updateStateRegistry(stateInstance: any, initial: any): void {
	// Find the registry entry for this state and update its initial value
	for (const [name, entry] of stateRegistry.entries()) {
		if (entry.state === stateInstance) {
			stateRegistry.set(name, {state: stateInstance, initial})
			return
		}
	}
	// If not found, this is an error case - state should be registered
	throw new Error('State instance not found in registry. State must be registered before updating.')
}

/**
 * Get all registered states
 * Returns Map of state names to registry entries (state instance and initial state)
 */
export function getRegisteredStates(): Map<string, StateRegistryEntry> {
	return stateRegistry
}

/**
 * Clear the state registry (useful for testing or after serialization)
 */
export function clearStateRegistry(): void {
	stateRegistry.clear()
}

/**
 * Deep signal state - wraps objects/arrays with Proxy to make them reactive
 * @param initial - Initial state object
 * @param name - Required name for SSR serialization (must be non-empty string)
 */
export function state<T extends Record<string, any>>(initial: T, name: string): State<T> {
	// Validate name parameter
	if (!name || typeof name !== 'string' || name.trim() === '') {
		throw new Error('State name is required and must be a non-empty string')
	}
	const signalMap = new Map<string, Signal<any> | ComputedSignal<any>>()
	const stateCache = new WeakMap<object, any>()

	// Convert initial values to signals
	// parentSignalMap is optional - if provided, nested states will use it
	// If not provided, each nested state gets its own signalMap
	function initializeSignals(obj: any, parentSignalMap?: Map<string, Signal<any> | ComputedSignal<any>>): any {
		if (obj === null || typeof obj !== 'object') {
			return obj
		}

		// Check if already wrapped
		if (isState(obj)) {
			return obj
		}

		// Check cache
		if (stateCache.has(obj)) {
			return stateCache.get(obj)
		}

		// Handle arrays
		if (Array.isArray(obj)) {
			// Arrays don't get their own signalMap - they use the parent's
			// Nested objects AND arrays should be recursively wrapped
			const signals = obj.map(item => {
				if (typeof item === 'object' && item !== null) {
					// Recursively wrap nested objects AND arrays in Proxies
					return initializeSignals(item, undefined)
				}
				return toSignal(item)
			})
			
			// List of mutating array methods that should trigger the parent signal
			const mutatingMethods = ['splice', 'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'fill', 'copyWithin']
			
			// Wrap the signals array directly (not a copy) so mutations stay in sync
			// Store parent signal reference directly on the Proxy for reliable lookup
			const wrapped = new Proxy(signals, {
				get(target, prop) {
					if (prop === '__isState') return true
					if (prop === '__signals') return signals
					if (prop === '__parentSignal') {
						// Allow accessing parent signal directly for debugging
						return arrayParentSignalMap.get(wrapped) || (wrapped as any)._parentSignal
					}
					if (prop === Symbol.toStringTag) return 'Array' // Make Array.isArray() work
					if (prop === Symbol.iterator) {
						// Provide custom iterator that unwraps Signal values
						return function* () {
							for (let i = 0; i < signals.length; i++) {
								const sig = signals[i]
								yield isSignal(sig) ? sig.value : sig
							}
						}
					}
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
					
					// For array methods that iterate (map, filter, forEach, etc.), bind to wrapped Proxy
					// so they go through our get trap for element access
					if (typeof value === 'function' && Array.isArray(target)) {
						// Array iteration methods need to use the Proxy so element access is unwrapped
						const iterationMethods = ['map', 'filter', 'forEach', 'some', 'every', 'find', 'findIndex', 'reduce', 'reduceRight']
						// Search methods also need unwrapped values for comparison
						const searchMethods = ['includes', 'indexOf', 'lastIndexOf']
						// Methods that return new arrays or strings need unwrapped values
						const returnMethods = ['slice', 'concat', 'flat', 'flatMap', 'join', 'toString', 'toLocaleString']
						// Iterator methods need unwrapped values
						const iteratorMethods = ['entries', 'keys', 'values']
						if (iterationMethods.includes(propStr) || searchMethods.includes(propStr) || 
							returnMethods.includes(propStr) || iteratorMethods.includes(propStr)) {
							return value.bind(wrapped)
						}
					}
					
					// Intercept mutating methods to trigger parent signal
					if (typeof value === 'function' && mutatingMethods.includes(propStr)) {
						return function(...args: any[]) {
							// For splice, we need to handle it specially to convert new items to signals
							if (propStr === 'splice') {
								const start = args[0] ?? 0
								const deleteCount = args[1] ?? (signals.length - start)
								const newItems = args.slice(2)
								
								// Convert new items - nested arrays/objects become Proxies, primitives become Signals
								const newSignals = newItems.map(item => {
									if (typeof item === 'object' && item !== null) {
										// Wrap objects/arrays in Proxies (NOT in Signals - the Proxy IS the value)
										return initializeSignals(item, undefined)
									}
									return toSignal(item)
								})
								
								// Update the signals array (target is signals array)
								const removed = signals.splice(start, deleteCount, ...newSignals)
								
								// Look up parent signal AFTER mutation to ensure we have the latest reference
								// This ensures we get the signal even if it was stored after accessing the method
								// Try WeakMap first, then fallback to direct property access
								const parentSignal = arrayParentSignalMap.get(wrapped) || (wrapped as any)._parentSignal
								
								// Trigger parent signal if it exists
								// Notify subscribers directly since the array reference hasn't changed
								if (parentSignal) {
									// Access the signal's internal subscribers and notify them
									const subscribers = (parentSignal as any)._subscribers
									if (subscribers) {
										subscribers.forEach((fn: () => void) => {
											try {
												fn()
											} catch(e) {
												console.error('Error in signal subscriber:', e)
											}
										})
									}
									// Also trigger component redraws if callback is set
									// __redrawCallback is set on the signal function itself
									if ((signal as any).__redrawCallback) {
										;(signal as any).__redrawCallback(parentSignal)
									}
								}
								
								// Return removed items (unwrapped)
								return removed.map(sig => isSignal(sig) ? sig.value : sig)
							} else {
								// For other mutating methods, convert new items to signals first
								let result
								if (propStr === 'push' || propStr === 'unshift') {
									const newItems = args
									// Convert new items - nested arrays/objects become Proxies, primitives become Signals
									const newSignals = newItems.map(item => {
										if (typeof item === 'object' && item !== null) {
											// Wrap objects/arrays in Proxies (NOT in Signals - the Proxy IS the value)
											return initializeSignals(item, undefined)
										}
										return toSignal(item)
									})
									if (propStr === 'push') {
										result = signals.push(...newSignals)
									} else {
										result = signals.unshift(...newSignals)
									}
								} else if (propStr === 'pop' || propStr === 'shift') {
									// Call on signals array directly and unwrap result
									if (propStr === 'pop') {
										const sig = signals.pop()
										result = sig !== undefined ? (isSignal(sig) ? sig.value : sig) : undefined
									} else {
										const sig = signals.shift()
										result = sig !== undefined ? (isSignal(sig) ? sig.value : sig) : undefined
									}
								} else if (propStr === 'reverse' || propStr === 'sort') {
									// For reverse/sort, apply to signals array
									if (propStr === 'reverse') {
										result = signals.reverse()
									} else {
										// sort needs a comparator function that works on signals
										const comparator = args[0]
										if (comparator) {
											result = signals.sort((a, b) => {
												const aVal = isSignal(a) ? a.value : a
												const bVal = isSignal(b) ? b.value : b
												return comparator(aVal, bVal)
											})
										} else {
											result = signals.sort((a, b) => {
												const aVal = isSignal(a) ? a.value : a
												const bVal = isSignal(b) ? b.value : b
												return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
											})
										}
									}
								} else if (propStr === 'fill') {
									const fillValue = args[0]
									const start = args[1] ?? 0
									const end = args[2] ?? signals.length
									const fillSignal = toSignal(fillValue)
									for (let i = start; i < end; i++) {
										signals[i] = fillSignal
									}
									result = signals.length
								} else {
									// For other methods, just apply to target
									result = value.apply(target, args)
								}
								
								// Trigger parent signal if it exists (look up again in case it was stored)
								const currentParentSignal = arrayParentSignalMap.get(wrapped) || (wrapped as any)._parentSignal
								if (currentParentSignal) {
									// Notify subscribers directly since the array reference hasn't changed
									const subscribers = (currentParentSignal as any)._subscribers
									if (subscribers) {
										subscribers.forEach((fn: () => void) => {
											try {
												fn()
											} catch(e) {
												console.error('Error in signal subscriber:', e)
											}
										})
									}
									// Also trigger component redraws if callback is set
									// __redrawCallback is set on the signal function itself
									if ((signal as any).__redrawCallback) {
										;(signal as any).__redrawCallback(currentParentSignal)
									}
								}
								
								return result
							}
						}
					}
					
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
							} else {
								signals[index] = toSignal(value)
							}
							// Trigger parent signal on element assignment (look up when called)
							const parentSignal = arrayParentSignalMap.get(wrapped) || (wrapped as any)._parentSignal
							if (parentSignal) {
								// Notify subscribers directly since the array reference hasn't changed
								const subscribers = (parentSignal as any)._subscribers
								if (subscribers) {
									subscribers.forEach((fn: () => void) => {
										try {
											fn()
										} catch(e) {
											console.error('Error in signal subscriber:', e)
										}
									})
								}
								// Also trigger component redraws if callback is set
								if ((signal as any).__redrawCallback) {
									;(signal as any).__redrawCallback(parentSignal)
								}
							}
							return true
						} else if (prop === 'length') {
							signals.length = Number(value)
							// Trigger parent signal on length change (look up when called)
							const parentSignal = arrayParentSignalMap.get(wrapped) || (wrapped as any)._parentSignal
							if (parentSignal) {
								// Notify subscribers directly since the array reference hasn't changed
								const subscribers = (parentSignal as any)._subscribers
								if (subscribers) {
									subscribers.forEach((fn: () => void) => {
										try {
											fn()
										} catch(e) {
											console.error('Error in signal subscriber:', e)
										}
									})
								}
								// Also trigger component redraws if callback is set
								if ((signal as any).__redrawCallback) {
									;(signal as any).__redrawCallback(parentSignal)
								}
							}
							return true
						}
					}
					return Reflect.set(target, prop, value)
				},
				ownKeys(_target) {
					// Return array indices as keys for proper enumeration (needed for Bun's toEqual)
					const keys: (string | symbol)[] = []
					for (let i = 0; i < signals.length; i++) {
						keys.push(String(i))
					}
					keys.push('length')
					return keys
				},
				getOwnPropertyDescriptor(target, prop) {
					// Provide property descriptors for array indices (needed for Bun's toEqual)
					if (typeof prop === 'string' && !isNaN(Number(prop))) {
						const index = Number(prop)
						if (index >= 0 && index < signals.length) {
							return {
								enumerable: true,
								configurable: true,
								value: (() => {
									const sig = signals[index]
									return isSignal(sig) ? sig.value : sig
								})(),
								writable: true,
							}
						}
					}
					if (prop === 'length') {
						return {
							enumerable: false,
							configurable: false,
							value: signals.length,
							writable: true,
						}
					}
					return Reflect.getOwnPropertyDescriptor(target, prop)
				},
			})
			stateCache.set(obj, wrapped)
			return wrapped
		}

		// Handle objects
		// Store original keys for SSR serialization (to distinguish nested state keys from parent keys)
		const originalKeys = new Set(Object.keys(obj))
		// Each nested state gets its own signalMap (unless parentSignalMap is explicitly provided)
		// This prevents nested states from sharing the parent's signalMap
		const nestedSignalMap = parentSignalMap || new Map<string, Signal<any> | ComputedSignal<any>>()
		const wrapped = new Proxy(obj, {
			get(target, prop) {
				if (prop === '__originalKeys') return originalKeys
				if (prop === '__isState') return true
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
							} else if (isGetSetDescriptor(originalValue)) {
								// Get/set descriptor -> computed signal from get function
								if (typeof originalValue.get === 'function') {
									const computedSig = computed(() => {
										return originalValue.get.call(wrapped)
									})
									nestedSignalMap.set(key, computedSig)
								} else {
									// Only setter, no getter - treat as regular signal with undefined initial value
									const sig = signal(undefined)
									nestedSignalMap.set(key, sig)
								}
							} else if (typeof originalValue === 'object' && originalValue !== null) {
							// Get the already-wrapped state from the wrapped object
							// Don't call initializeSignals again as it would create a new wrapped array
								const nestedState = (wrapped as any)[key]
								if (nestedState === undefined) {
								// Fallback: initialize if not already wrapped
									const initialized = initializeSignals(originalValue, undefined)
									const sig = signal(initialized)
									if (Array.isArray(initialized)) {
										arrayParentSignalMap.set(initialized, sig)
									}
									nestedSignalMap.set(key, sig)
								} else {
									const sig = signal(nestedState)
									// Store parent signal reference for arrays
									if (Array.isArray(nestedState)) {
										arrayParentSignalMap.set(nestedState, sig)
									}
									nestedSignalMap.set(key, sig)
								}
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
								// Call the function in the context of the state
								return originalValue.call(wrapped)
							})
							nestedSignalMap.set(key, computedSig)
						} else if (isGetSetDescriptor(originalValue)) {
							// Get/set descriptor -> computed signal from get function
							if (typeof originalValue.get === 'function') {
								const computedSig = computed(() => {
									return originalValue.get.call(wrapped)
								})
								nestedSignalMap.set(key, computedSig)
							} else {
								// Only setter, no getter - treat as regular signal with undefined initial value
								const sig = signal(undefined)
								nestedSignalMap.set(key, sig)
							}
						} else if (typeof originalValue === 'object' && originalValue !== null) {
							// Nested object -> recursive state with its own signalMap
							const nestedState = initializeSignals(originalValue, undefined)
							const sig = signal(nestedState)
							// Store parent signal reference for arrays
							if (Array.isArray(nestedState)) {
								arrayParentSignalMap.set(nestedState, sig)
							}
							nestedSignalMap.set(key, sig)
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
					const value = sig.value
					// Always ensure parent signal is stored for arrays (in case it wasn't stored during initialization)
					// Check for wrapped arrays by looking for __isState and __signals properties
					// Array.isArray() may return false for Proxies, so we check __isState instead
					if (value && typeof value === 'object') {
						if ((value as any).__isState === true && Array.isArray((value as any).__signals)) {
							// This is a wrapped array - store parent signal
							arrayParentSignalMap.set(value, sig as Signal<any>)
							// Also store directly on the Proxy as a fallback
							;(value as any)._parentSignal = sig as Signal<any>
						} else if (Array.isArray(value)) {
							// Regular array (shouldn't happen but just in case)
							arrayParentSignalMap.set(value, sig as Signal<any>)
						}
					}
					return value
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
					// This allows tests to corrupt the state for error handling tests
					Reflect.set(target, prop, value)
					return true
				}
				
				// Prevent setting other internal properties
				if (key === '__isState' || key === '__originalKeys' || key === '__signals') {
					// Silently ignore attempts to set internal properties
					return true
				}
				
				// Check if the original property was a get/set descriptor
				const originalValue = Reflect.get(target, prop)
				if (isGetSetDescriptor(originalValue)) {
					// Handle get/set descriptor
					if (typeof originalValue.set === 'function') {
						// Call the setter function
						originalValue.set.call(wrapped, value)
						return true
					} else if (typeof originalValue.get === 'function') {
						// Read-only property (get but no set)
						throw new Error(`Cannot set read-only computed property "${key}"`)
					}
				}
				
				// Check if the new value being set is a get/set descriptor
				if (isGetSetDescriptor(value)) {
					// Replace with computed signal from get function
					if (typeof value.get === 'function') {
						const computedSig = computed(() => {
							return value.get.call(wrapped)
						})
						nestedSignalMap.set(key, computedSig)
						// Also update the target so setter can be found later
						Reflect.set(target, prop, value)
						return true
					} else {
						// Only setter, no getter - treat as regular signal with undefined initial value
						const sig = signal(undefined)
						nestedSignalMap.set(key, sig)
						Reflect.set(target, prop, value)
						return true
					}
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
							// Nested object -> recursive state with its own signalMap
							const nestedState = initializeSignals(value, undefined)
							// Store parent signal reference for arrays
							if (Array.isArray(nestedState)) {
								arrayParentSignalMap.set(nestedState, sig as Signal<any>)
							}
							;(sig as Signal<any>).value = nestedState
						} else {
							;(sig as Signal<any>).value = value
						}
					} else {
						// Replace computed with regular signal
						if (typeof value === 'object' && value !== null && Array.isArray(value)) {
							const nestedState = initializeSignals(value, undefined)
							const sig = signal(nestedState)
							arrayParentSignalMap.set(nestedState, sig)
							nestedSignalMap.set(key, sig)
						} else {
							nestedSignalMap.set(key, toSignal(value))
						}
					}
				} else {
					// Create new signal
					if (typeof value === 'object' && value !== null) {
						const nestedState = initializeSignals(value, undefined)
						const sig = signal(nestedState)
						// Store parent signal reference for arrays
						if (Array.isArray(nestedState)) {
							arrayParentSignalMap.set(nestedState, sig)
						}
						nestedSignalMap.set(key, sig)
					} else {
						nestedSignalMap.set(key, toSignal(value))
					}
				}

				return true
			},
			has(target, prop) {
				if (prop === '__isState' || prop === '__signalMap') return true
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
							enumerable: false,
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
			deleteProperty(target, prop) {
				const key = String(prop)
				
				// Update the signal to undefined to notify subscribers
				if (nestedSignalMap.has(key)) {
					const sig = nestedSignalMap.get(key)
					if (sig && !(sig instanceof ComputedSignal)) {
						// Set signal value to undefined to notify subscribers
						;(sig as Signal<any>).value = undefined
					}
					// Remove from the signal map
					nestedSignalMap.delete(key)
				}
				
				// Delete from target
				return Reflect.deleteProperty(target, prop)
			},
		})

		stateCache.set(obj, wrapped)
		return wrapped
	}

	const wrapped = initializeSignals(initial) as State<T>
	
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
					} else if (isGetSetDescriptor(value)) {
						// Get/set descriptor -> computed signal from get function
						if (typeof value.get === 'function') {
							const computedSig = computed(() => {
								return value.get.call(wrapped)
							})
							signalMap.set(key, computedSig)
						} else {
							// Only setter, no getter - treat as regular signal with undefined initial value
							const sig = signal(undefined)
							signalMap.set(key, sig)
						}
					} else if (typeof value === 'object' && value !== null) {
						// Get the already-wrapped state from stateCache (bypass Proxy to get the actual wrapped value)
						// This ensures we get the same wrapped array that was created during initializeSignals
						const nestedState = stateCache.has(value) ? stateCache.get(value) : initializeSignals(value, undefined)
						const sig = signal(nestedState)
						// Always store parent signal reference for arrays
						// Check for wrapped arrays by looking for __isState and __signals properties
						// Array.isArray() may return false for Proxies, so we check __isState instead
						if (nestedState && typeof nestedState === 'object' && 
							((nestedState as any).__isState === true && Array.isArray((nestedState as any).__signals))) {
							arrayParentSignalMap.set(nestedState, sig)
							// Also store directly on the Proxy as a fallback
							;(nestedState as any)._parentSignal = sig
						} else if (Array.isArray(nestedState)) {
							// Fallback for regular arrays (shouldn't happen but just in case)
							arrayParentSignalMap.set(nestedState, sig)
						}
						signalMap.set(key, sig)
					} else {
						const sig = toSignal(value)
						signalMap.set(key, sig)
					}
				}
			}
		}
	}
	
	// Register state for SSR serialization
	// Store original initial state (with computed properties) for restoration after deserialization
	registerState(name, wrapped, initial)
	
	return wrapped
}

/**
 * State type - reactive object with signal-based properties
 * 
 * Supports:
 * - Regular access: `state.prop` returns unwrapped value
 * - Signal access: `state.$prop` returns Signal instance (handled at runtime)
 * - Functions become computed signals
 * - Nested objects become State instances
 * 
 * Note: The $ prefix access is handled via Proxy at runtime.
 * TypeScript's type system cannot fully express the $ prefix pattern,
 * but the implementation correctly handles it.
 */
export type State<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends (...args: any[]) => infer R
		? R // Function properties return computed value
		: T[K] extends Record<string, any>
			? State<T[K]> // Nested objects become states
			: T[K] // Primitive values
} & {
	// Index signature for $ prefix access (runtime only, not fully typed)
	[key: string]: any
}

/**
 * Watch a signal for changes
 * @param signal - The signal to watch
 * @param callback - Callback function called when signal value changes
 * @returns Unsubscribe function
 */
export function watch<T>(
	signal: Signal<T> | ComputedSignal<T>,
	callback: (newValue: T, oldValue: T) => void,
): () => void {
	return signal.watch(callback)
}
