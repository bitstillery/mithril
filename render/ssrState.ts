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
	
	// Add the root store to visited first to detect circular refs
	visited.add(store)
	
	// Early return if signalMap is null (error case)
	const signalMap = (store as any).__signalMap
	if (!signalMap) {
		return {}
	}

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
		// Check before adding to visited to avoid false positives
		if (visited.has(value)) {
			return null // Circular reference - serialize as null
		}
		
		// Mark as visited BEFORE processing to detect circular refs
		visited.add(value)

		// Handle stores (nested stores and arrays)
		if (isStore(value)) {
			
			// Check if this is an array store
			const signals = (value as any).__signals
			if (signals && Array.isArray(signals)) {
				// Array store - serialize each element
				const arrayResult = signals.map((signal: any) => {
					if (signal instanceof ComputedSignal) {
						return undefined
					}
				// Get the actual value from the signal
				// If it's a Signal instance, get its value; otherwise it's already the value (could be a store)
				let sigValue: any
				// Check if it's a Signal instance (has value property and is an instance of Signal/ComputedSignal)
				if (signal && typeof signal === 'object' && 'value' in signal && !isStore(signal)) {
					sigValue = signal.value
				} else {
					// It's either a primitive or a store (nested object)
					sigValue = signal
				}
				// If sigValue is a store (nested object in array), serialize it
				// This will use __originalKeys to filter parent keys
				const serialized = serializeValue(sigValue)
					// If circular reference was detected, it returns null - keep it
					return serialized
				}).filter((item: any) => item !== undefined)
				return arrayResult
			}
			
			// Object store - serialize by accessing properties directly through proxy
			// Use originalKeys to filter out parent store keys
			const nestedResult: Record<string, any> = {}
			const nestedOriginalKeys = (value as any).__originalKeys as Set<string> | undefined
			
			for (const key in value) {
				if (key.startsWith('$') || key === '__isStore' || key === '__signalMap' || key === '__signals' || key === '__originalKeys') {
					continue
				}
				
				// For nested stores, only serialize keys that belong to this store (not parent keys)
				if (nestedOriginalKeys && !nestedOriginalKeys.has(key)) {
					continue
				}
				
				try {
					// Check if this is a ComputedSignal by accessing $key
					const signal = (value as any)['$' + key]
					if (signal instanceof ComputedSignal) {
						// Skip computed signals
						continue
					}
					
					const propValue = (value as any)[key]
					const serialized = serializeValue(propValue)
					// Include null values (they might be circular ref markers)
					nestedResult[key] = serialized
				} catch {
					// Skip if access fails
					continue
				}
			}
			// Don't delete from visited here - it will be cleaned up when we finish serializing this value
			return nestedResult
		}

		// Handle plain arrays
		if (Array.isArray(value)) {
			const arrayResult = value.map(item => serializeValue(item))
			return arrayResult
		}

		// Handle plain objects
		const objResult: Record<string, any> = {}
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				const serialized = serializeValue(value[key])
				// Include null values (they might be circular ref markers)
				objResult[key] = serialized
			}
		}
		// Don't delete from visited - let it be cleaned up naturally
		return objResult
	}

	// Serialize by iterating over store properties directly
	// For top-level store, serialize all keys (including dynamically added ones)
	// Use $ prefix to check if property is a ComputedSignal
	for (const key in store) {
		if (key.startsWith('$') || key === '__isStore' || key === '__signalMap' || key === '__signals' || key === '__originalKeys') {
			continue
		}
		
		try {
			// Check if this is a ComputedSignal by accessing $key
			const signal = (store as any)['$' + key]
			if (signal instanceof ComputedSignal) {
				// Skip computed signals (they're functions, recreated on client)
				continue
			}
			
			const value = (store as any)[key]
			result[key] = serializeValue(value)
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
			if (signalMap && signalMap.has(key)) {
				const signal = signalMap.get(key)
				// Don't update ComputedSignal (they're read-only)
				if (signal && !(signal instanceof ComputedSignal)) {
					signal.value = deserializedValue
				}
			} else {
				// Signal doesn't exist - use proxy setter to create it
				// But only if signalMap exists (error case: signalMap is null)
				if (signalMap) {
					;(store as any)[key] = deserializedValue
				}
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
