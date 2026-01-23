import {ComputedSignal} from '../signal'
import {getRegisteredStates} from '../state'

import type {State} from '../state'

/**
 * Check if a value is a state (has __isState flag)
 */
function isState(value: any): boolean {
	return value && typeof value === 'object' && (value as any).__isState === true
}

/**
 * Serialize a single state to plain object
 * Extracts signal values by accessing state properties directly
 */
export function serializeStore(state: State<any>): any {
	if (!isState(state)) {
		throw new Error('Value is not a state')
	}

	const result: Record<string, any> = {}
	const visited = new WeakSet<object>()
	
	// Add the root state to visited first to detect circular refs
	visited.add(state)
	
	// Check if signalMap exists and is a Map - if not, this is an error case
	const signalMap = (state as any).__signalMap
	if (!signalMap || !(signalMap instanceof Map)) {
		// Throw error so serializeAllStates can catch it and skip this state
		throw new Error('State signalMap is null, undefined, or not a Map instance')
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

		// Handle states (nested states and arrays)
		if (isState(value)) {
			
			// Check if this is an array state
			const signals = (value as any).__signals
			if (signals && Array.isArray(signals)) {
				// Array state - serialize each element
				const arrayResult = signals.map((signal: any) => {
					if (signal instanceof ComputedSignal) {
						return undefined
					}
					// Get the actual value from the signal
					// If it's a Signal instance, get its value; otherwise it's already the value (could be a state)
					let sigValue: any
					// Check if it's a Signal instance (has value property and is an instance of Signal/ComputedSignal)
					if (signal && typeof signal === 'object' && 'value' in signal && !isState(signal)) {
						sigValue = signal.value
					} else {
					// It's either a primitive or a state (nested object)
						sigValue = signal
					}
					// If sigValue is a state (nested object in array), serialize it
					// This will use __originalKeys to filter parent keys
					const serialized = serializeValue(sigValue)
					// If circular reference was detected, it returns null - keep it
					return serialized
				}).filter((item: any) => item !== undefined)
				return arrayResult
			}
			
			// Object state - serialize by accessing properties directly through proxy
			// Use originalKeys to filter out parent state keys
			const nestedResult: Record<string, any> = {}
			const nestedOriginalKeys = (value as any).__originalKeys as Set<string> | undefined
			
			for (const key in value) {
				if (key.startsWith('$') || key === '__isState' || key === '__signalMap' || key === '__signals' || key === '__originalKeys') {
					continue
				}
				
				// For nested states, only serialize keys that belong to this state (not parent keys)
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

	// Serialize by iterating over state properties directly
	// For top-level state, serialize all keys (including dynamically added ones)
	// Use $ prefix to check if property is a ComputedSignal
	for (const key in state) {
		if (key.startsWith('$') || key === '__isState' || key === '__signalMap' || key === '__signals' || key === '__originalKeys') {
			continue
		}
		
		try {
			// Check if this is a ComputedSignal by accessing $key
			const signal = (state as any)['$' + key]
			if (signal instanceof ComputedSignal) {
				// Skip computed signals (they're functions, recreated on client)
				continue
			}
			
			const value = (state as any)[key]
			result[key] = serializeValue(value)
		} catch {
			// Skip if access fails
			continue
		}
	}

	return result
}

/**
 * Deserialize state into a state
 * Restores signal values from serialized data
 */
export function deserializeStore(state: State<any>, serialized: any): void {
	if (!isState(state)) {
		throw new Error('Value is not a state')
	}

	if (!serialized || typeof serialized !== 'object') {
		return
	}

	const signalMap = (state as any).__signalMap as Map<string, any>
	if (!signalMap || !(signalMap instanceof Map)) {
		// Throw error so deserializeAllStates can catch it and skip this state
		throw new Error('State signalMap is null, undefined, or not a Map instance')
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

		// Handle plain objects (could be nested states)
		// Check if this looks like a serialized state (has state-like structure)
		// For now, treat all objects as plain objects - nested states will be handled
		// when they're assigned to state properties
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

			// Check if signal exists in state
			if (signalMap && signalMap.has(key)) {
				const signal = signalMap.get(key)
				// Don't update ComputedSignal (they're read-only)
				if (signal && !(signal instanceof ComputedSignal)) {
					signal.value = deserializedValue
				}
			} else {
				// Signal doesn't exist - use proxy setter to create it
				// But only if signalMap exists (error case: signalMap is null)
				// If signalMap is null, we can't create new signals, so skip
				if (signalMap) {
					;(state as any)[key] = deserializedValue
				}
				// If signalMap is null, skip this key (error case)
			}
		}
	}
}

/**
 * Serialize all registered states
 * Returns a Record mapping state names to serialized state
 */
export function serializeAllStates(): Record<string, any> {
	const registeredStates = getRegisteredStates()
	const result: Record<string, any> = {}

	for (const [name, entry] of registeredStates.entries()) {
		try {
			result[name] = serializeStore(entry.state)
		} catch(error) {
			// Log error but continue with other states
			console.error(`Error serializing state "${name}":`, error)
		}
	}

	return result
}

/**
 * Deserialize all states from serialized data
 * Restores state into registered states
 */
/**
 * Restore computed properties from initial state
 * Extracts function properties and sets them on state instance
 * State proxy will automatically convert them to ComputedSignal instances
 */
function restoreComputedProperties(state: State<any>, initial: any): void {
	if (!initial || typeof initial !== 'object') {
		return
	}
	
	function isObject(v: any): boolean {
		return v && typeof v === 'object' && !Array.isArray(v)
	}
	
	function restore(obj: any, target: any, prefix: string = ''): void {
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const value = obj[key]
				
				if (typeof value === 'function') {
					// Set function property - state proxy will convert to ComputedSignal
					const keys = prefix ? prefix.split('.').filter(k => k) : []
					let targetState = target
					for (let i = 0; i < keys.length; i++) {
						if (!targetState[keys[i]]) {
							// Nested state doesn't exist yet, skip
							return
						}
						targetState = targetState[keys[i]]
					}
					// Clear any existing signal in signalMap so function is re-initialized as ComputedSignal
					if (targetState && typeof targetState === 'object' && (targetState as any).__isState) {
						const signalMap = (targetState as any).__signalMap
						if (signalMap && signalMap instanceof Map) {
							signalMap.delete(key)
						}
					}
					targetState[key] = value
				} else if (isObject(value)) {
					// Recursively restore nested computed properties
					const nestedPrefix = prefix ? `${prefix}.${key}` : key
					restore(value, target, nestedPrefix)
				}
			}
		}
	}
	
	restore(initial, state)
}

export function deserializeAllStates(serialized: Record<string, any>): void {
	if (!serialized || typeof serialized !== 'object') {
		return
	}

	const registeredStates = getRegisteredStates()

	// First, deserialize all states
	for (const [name, serializedState] of Object.entries(serialized)) {
		const entry = registeredStates.get(name)
		
		if (!entry) {
			// State not registered on client - warn in development
			// @ts-expect-error - process is a Node.js global, not available in browser
			if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
				console.warn(`State "${name}" not found in registry. Skipping deserialization.`)
			}
			continue
		}

		try {
			// Filter out saved and tab properties - they should NOT be overwritten by SSR
			// According to ADR-0007: saved and tab state are preserved, only temporary and session are overwritten
			const filteredState: Record<string, any> = {}
			for (const key in serializedState) {
				if (Object.prototype.hasOwnProperty.call(serializedState, key)) {
					// Skip 'saved' and 'tab' top-level properties
					if (key !== 'saved' && key !== 'tab') {
						filteredState[key] = serializedState[key]
					}
				}
			}
			deserializeStore(entry.state, filteredState)
		} catch(error) {
			// Log error but continue with other states
			console.error(`Error deserializing state "${name}":`, error)
		}
	}
	
	// After deserializing, restore computed properties from original initial states
	// This ensures computed properties work after SSR deserialization
	for (const [name, entry] of registeredStates.entries()) {
		try {
			restoreComputedProperties(entry.state, entry.initial)
		} catch(error) {
			// Log error but continue with other states
			console.error(`Error restoring computed properties for state "${name}":`, error)
		}
	}
}
