import {ComputedSignal} from '../signal'
import {getRegisteredStores} from '../store'

import type {Store} from '../store'

/**
 * Check if a value is a store (has __isStore flag)
 */
function isStore(value: any): boolean {
	return value && typeof value === 'object' && (value as any).__isStore === true
}

/**
 * Serialize a single store to plain object
 * Extracts signal values by accessing store properties directly
 */
export function serializeStore(store: Store<any>): any {
	if (!isStore(store)) {
		throw new Error('Value is not a store')
	}

	const result: Record<string, any> = {}
	const visited = new WeakSet<object>()

	function serializeValue(value: any): any {
		// Handle null/undefined
		if (value === null || value === undefined) {
			return value
		}

		// Handle primitives
		if (typeof value !== 'object') {
			return value
		}

		// Handle circular references
		if (visited.has(value)) {
			return null // Circular reference - serialize as null
		}

		// Handle stores (nested stores and arrays)
		if (isStore(value)) {
			visited.add(value)
			
			// Check if this is an array store
			const signals = (value as any).__signals
			if (signals && Array.isArray(signals)) {
				// Array store - serialize each element
				const arrayResult = signals.map((signal: any) => {
					if (signal instanceof ComputedSignal) {
						return undefined
					}
					const sigValue = signal && typeof signal === 'object' && 'value' in signal ? signal.value : signal
					return serializeValue(sigValue)
				}).filter((item: any) => item !== undefined)
				visited.delete(value)
				return arrayResult
			}
			
			// Object store - serialize by accessing properties directly through proxy
			// This naturally only gets the store's own properties
			const nestedResult: Record<string, any> = {}
			for (const key in value) {
				if (key.startsWith('$') || key === '__isStore' || key === '__signalMap' || key === '__signals') {
					continue
				}
				try {
					const propValue = (value as any)[key]
					// Skip computed signals (functions)
					if (!(propValue instanceof ComputedSignal)) {
						nestedResult[key] = serializeValue(propValue)
					}
				} catch {
					// Skip if access fails
					continue
				}
			}
			visited.delete(value)
			return nestedResult
		}

		// Handle plain arrays
		if (Array.isArray(value)) {
			visited.add(value)
			const arrayResult = value.map(item => serializeValue(item))
			visited.delete(value)
			return arrayResult
		}

		// Handle plain objects
		visited.add(value)
		const objResult: Record<string, any> = {}
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				objResult[key] = serializeValue(value[key])
			}
		}
		visited.delete(value)
		return objResult
	}

	// Serialize by iterating over store properties directly
	// This goes through the proxy and naturally gets only this store's properties
	for (const key in store) {
		if (key.startsWith('$') || key === '__isStore' || key === '__signalMap' || key === '__signals') {
			continue
		}
		try {
			const value = (store as any)[key]
			// Skip computed signals (they're functions, recreated on client)
			if (!(value instanceof ComputedSignal)) {
				result[key] = serializeValue(value)
			}
		} catch {
			// Skip if access fails
			continue
		}
	}

	return result
}

/**
 * Deserialize state into a store
 * Restores signal values from serialized data
 */
export function deserializeStore(store: Store<any>, serialized: any): void {
	if (!isStore(store)) {
		throw new Error('Value is not a store')
	}

	if (!serialized || typeof serialized !== 'object') {
		return
	}

	const signalMap = (store as any).__signalMap as Map<string, any>
	if (!signalMap) {
		return
	}

	function deserializeValue(value: any): any {
		// Handle null/undefined
		if (value === null || value === undefined) {
			return value
		}

		// Handle primitives
		if (typeof value !== 'object') {
			return value
		}

		// Handle arrays
		if (Array.isArray(value)) {
			return value.map(item => deserializeValue(item))
		}

		// Handle plain objects (could be nested stores)
		// Check if this looks like a serialized store (has store-like structure)
		// For now, treat all objects as plain objects - nested stores will be handled
		// when they're assigned to store properties
		const objResult: Record<string, any> = {}
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				objResult[key] = deserializeValue(value[key])
			}
		}
		return objResult
	}

	// Deserialize each key in serialized data
	for (const key in serialized) {
		if (Object.prototype.hasOwnProperty.call(serialized, key)) {
			const serializedValue = serialized[key]
			const deserializedValue = deserializeValue(serializedValue)

			// Check if signal exists in store
			if (signalMap.has(key)) {
				const signal = signalMap.get(key)
				// Don't update ComputedSignal (they're read-only)
				if (signal && !(signal instanceof ComputedSignal)) {
					signal.value = deserializedValue
				}
			} else {
				// Signal doesn't exist - use proxy setter to create it
				;(store as any)[key] = deserializedValue
			}
		}
	}
}

/**
 * Serialize all registered stores
 * Returns a Record mapping store names to serialized state
 */
export function serializeAllStates(): Record<string, any> {
	const registeredStores = getRegisteredStores()
	const result: Record<string, any> = {}

	for (const [name, store] of registeredStores.entries()) {
		try {
			result[name] = serializeStore(store)
		} catch (error) {
			// Log error but continue with other stores
			console.error(`Error serializing store "${name}":`, error)
		}
	}

	return result
}

/**
 * Deserialize all states from serialized data
 * Restores state into registered stores
 */
export function deserializeAllStates(serialized: Record<string, any>): void {
	if (!serialized || typeof serialized !== 'object') {
		return
	}

	const registeredStores = getRegisteredStores()

	for (const [name, serializedState] of Object.entries(serialized)) {
		const store = registeredStores.get(name)
		
		if (!store) {
			// Store not registered on client - warn in development
			if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
				console.warn(`Store "${name}" not found in registry. Skipping deserialization.`)
			}
			continue
		}

		try {
			deserializeStore(store, serializedState)
		} catch (error) {
			// Log error but continue with other stores
			console.error(`Error deserializing store "${name}":`, error)
		}
	}
}
