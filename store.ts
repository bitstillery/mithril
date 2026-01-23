import {state, State, updateStateRegistry} from './state'
import {serializeStore, deserializeStore} from './render/ssrState'
import {ComputedSignal} from './signal'

// Helper function to restore computed properties (same as in ssrState.ts)
function restoreComputedProperties(state: State<any>, initial: any): void {
	if (!initial || typeof initial !== 'object') {
		return
	}
	
	function is_object(v: any): boolean {
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
						if (!targetState || !targetState[keys[i]]) {
							// Nested state doesn't exist yet, skip
							return
						}
						targetState = targetState[keys[i]]
					}
					if (targetState) {
						targetState[key] = value
					}
				} else if (is_object(value)) {
					// Recursively restore nested computed properties
					const nestedPrefix = prefix ? `${prefix}.${key}` : key
					restore(value, target, nestedPrefix)
				}
			}
		}
	}
	
	restore(initial, state)
}

// Utility functions for Store class
function isState(value: any): boolean {
	return value && typeof value === 'object' && (value as any).__isState === true
}

function is_object(v: any): boolean {
	return v && typeof v === 'object' && !Array.isArray(v)
}

function copy_object<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * Deep copy object while preserving functions (computed properties)
 * Used for merging templates that may contain computed properties
 */
function copy_object_preserve_functions<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') {
		return obj
	}
	
	if (Array.isArray(obj)) {
		return obj.map(item => copy_object_preserve_functions(item)) as T
	}
	
	if (typeof obj === 'function') {
		return obj as T
	}
	
	const result: any = {}
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = (obj as any)[key]
			if (typeof value === 'function') {
				// Preserve functions (computed properties)
				result[key] = value
			} else {
				// Deep copy other values
				result[key] = copy_object_preserve_functions(value)
			}
		}
	}
	return result as T
}

function merge_deep(target: any, ...sources: any[]): any {
	if (!sources.length) return target
	const source = sources.shift()

	if (is_object(target) && is_object(source)) {
		for (const key in source) {
			if (Array.isArray(source[key]) && Array.isArray(target[key])) {
				// Splice the contents of source[key] into target[key]
				target[key].splice(0, target[key].length, ...source[key])
			} else if (is_object(source[key])) {
				if (!target[key]) Object.assign(target, {[key]: {}})
				merge_deep(target[key], source[key])
			} else {
				Object.assign(target, {[key]: source[key]})
			}
		}
	}

	return merge_deep(target, ...sources)
}

const DEFAULT_LOOKUP_VERIFY_INTERVAL = 1000 * 10 // 10 seconds
const DEFAULT_LOOKUP_TTL = 1000 * 60 * 60 * 24 // 1 day

// Counter for generating unique store instance names
let storeInstanceCounter = 0

/**
 * Store class - wraps state() with persistence functionality
 * Provides load/save/blueprint methods for localStorage/sessionStorage persistence
 */
export class Store<T extends Record<string, any> = Record<string, any>> {
	private stateInstance: State<T>
	private templates = {
		persistent: {} as Partial<T>,
		volatile: {} as Partial<T>,
		session: {} as Partial<T>,
	}
	private lookup_verify_interval: number | null = null
	private lookup_ttl: number
	private computedPropertiesSetup?: () => void

	constructor(options: {lookup_ttl?: number} = {lookup_ttl: DEFAULT_LOOKUP_TTL}) {
		this.lookup_ttl = options.lookup_ttl || DEFAULT_LOOKUP_TTL
		// Initialize with empty state, will be loaded later
		// Generate unique name for each Store instance to avoid collisions
		const instanceName = `store.instance.${storeInstanceCounter++}`
		this.stateInstance = state({} as T, instanceName)
		
		if (typeof window !== 'undefined' && !this.lookup_verify_interval) {
			// Check every 10 seconds for outdated lookup paths. This is
			// to keep the lookup store clean.
			this.lookup_verify_interval = window.setInterval(() => {
				this.clean_lookup()
			}, DEFAULT_LOOKUP_VERIFY_INTERVAL)
		}
	}

	get state(): State<T> {
		return this.stateInstance
	}

	/**
	 * Merge deep on object `state`, but only the key/values in `blueprint`.
	 */
	blueprint(state: T, blueprint: Partial<T>): Partial<T> {
		const result: any = {}
		for (const key of Object.keys(blueprint)) {
			if (Object.prototype.hasOwnProperty.call(state, key)) {
				const blueprintValue = (blueprint as any)[key]
				const stateValue = (state as any)[key]
				if ((!Array.isArray(blueprintValue) && blueprintValue !== null) && is_object(blueprintValue)) {
					// (!) Convention: The contents of a state key with the name 'lookup' is
					// always one-one copied from the state, instead of being
					// blueprinted per-key. This is to accomodate key/value
					// lookups, without having to define each key in the
					// state's persistent section.
					if (key === 'lookup') {
						result[key] = copy_object(stateValue)
					} else {
						result[key] = this.blueprint(stateValue, blueprintValue)
					}
				} else {
					result[key] = stateValue
				}
			}
		}
		return result as Partial<T>
	}

	clean_lookup() {
		let store_modified = false
		const lookup = (this.stateInstance as any).lookup
		if (!lookup) return
		
		// Build a new lookup object with only valid entries
		const newLookup: Record<string, any> = {}
		// Get keys first to avoid iteration issues when deleting
		// Filter out $ prefix keys added by reactive proxy
		const keys = Object.keys(lookup).filter(k => !k.startsWith('$') && k !== '__isState' && k !== '__signalMap')
		for (const key of keys) {
			const value = lookup[key]
			// Previously stored values may not have a modified timestamp.
			// Set it now, and let it be cleaned up after the interval.
			if (!value || !is_object(value)) {
				// Skip invalid entries
				store_modified = true
			} else {
				if (!(value as any).modified) {
					(value as any).modified = Date.now()
					store_modified = true
				}
				if ((value as any).modified >= (Date.now() - this.lookup_ttl)) {
					// Keep entries that are not expired
					newLookup[key] = value
				} else {
					console.info(`[store] removing outdated lookup path: ${key}`)
					store_modified = true
				}
			}
		}
		if (store_modified) {
			// Replace lookup with cleaned version
			(this.stateInstance as any).lookup = newLookup
			this.save()
		}
	}

	/**
	 * Get key from local storage. If the item does not exist or
	 * cannot be retrieved, the default "{}" is returned.
	 */
	get(key: string): string {
		if (typeof window === 'undefined') return '{}'
		try {
			return window.localStorage.getItem(key) || '{}'
		} catch {
			return '{}'
		}
	}

	get_session_storage(key: string): string {
		if (typeof window === 'undefined') return '{}'
		try {
			return window.sessionStorage.getItem(key) || '{}'
		} catch {
			return '{}'
		}
	}

	load(persistent: Partial<T>, volatile: Partial<T>, session: Partial<T> = {} as Partial<T>) {
		const restored_state = {
			session: this.get_session_storage('store'),
			store: this.get('store'),
		}

		this.templates = {
			persistent,
			session,
			volatile,
		}

		try {
			restored_state.store = JSON.parse(restored_state.store)
			restored_state.session = JSON.parse(restored_state.session)
		} catch(err) {
			console.log(`[store] failed to parse store/session: ${err}`)
		}

		const store_state = merge_deep(copy_object(this.templates.persistent), copy_object(restored_state.store))
		// override with previous identity for a better version bump experience.
		if (restored_state.store && typeof restored_state.store === 'object' && 'identity' in restored_state.store) {
			store_state.identity = (restored_state.store as any).identity
		}
		let session_state

		if (!restored_state.session) {
			console.log('[store] loading session state from local store')
			session_state = merge_deep(copy_object(this.templates.session), store_state.session)
		} else {
			console.log('[store] restoring existing session state')
			session_state = merge_deep(copy_object(this.templates.session), copy_object(restored_state.session))
		}
		
		// Always merge session_state into store_state to ensure it's included in final_state
		merge_deep(store_state, {session: session_state})

		// Merge volatile into store_state to create final_state
		// Note: copy_object removes functions, but volatile data shouldn't have functions anyway
		// (computed properties are handled separately via mergedInitial)
		const final_state = merge_deep(store_state, copy_object(volatile))
		
		// Merge templates (including computed properties) into "merged initial state"
		// This will be stored in registry so computed properties can be automatically restored
		// Use copy_object_preserve_functions to deep copy while preserving functions
		// Note: session template structure needs to match final_state structure (nested under 'session')
		const mergedInitialPersistent = copy_object_preserve_functions(persistent)
		const mergedInitialVolatile = copy_object_preserve_functions(volatile)
		// Session template is merged into store_state.session, so wrap it in {session: ...}
		const mergedInitialSession = session && Object.keys(session).length > 0 ? {session: copy_object_preserve_functions(session)} : {}
		const mergedInitial = merge_deep(
			mergedInitialPersistent,
			mergedInitialVolatile,
			mergedInitialSession
		)
		
		// Update registry entry to store merged templates as "initial" state
		// This allows deserializeAllStates() to automatically restore computed properties
		updateStateRegistry(this.stateInstance, mergedInitial)
		
		// Use deserializeStore() instead of custom updateState()
		// This ensures consistency with SSR deserialization mechanism
		deserializeStore(this.stateInstance, final_state)
		
		// Restore computed properties from merged templates
		// This ensures computed properties are available immediately after load()
		// Note: mergedInitial contains all templates (persistent, volatile, session) with computed properties
		restoreComputedProperties(this.stateInstance, mergedInitial)
		
		// Note: setupComputedProperties() callback is no longer needed, but kept for backward compatibility
		if (this.computedPropertiesSetup) {
			this.computedPropertiesSetup()
		}
	}
	
	/**
	 * Register a function to set up computed properties after each load()
	 * This ensures computed properties are always available, even after reloading from storage
	 */
	setupComputedProperties(setupFn: () => void): void {
		this.computedPropertiesSetup = setupFn
		// Call immediately to set up computed properties for current state
		setupFn()
	}

	save() {
		// Use SSR serialization which properly handles State objects and skips ComputedSignal properties
		// This is the same mechanism used for SSR, ensuring consistency
		const statePlain = serializeStore(this.stateInstance)
		this.set('store', this.blueprint(statePlain, copy_object(this.templates.persistent)))
		
		// Serialize session state if it exists
		// Match the original implementation: blueprint(this.state.session, this.templates.session)
		const sessionState = (this.stateInstance as any).session
		if (sessionState) {
			// Get the session template - unwrap if it's nested under a 'session' key
			// The template might be: { session: { sessionId, ... } } or { sessionId, ... }
			// The state is always: { sessionId, ... }
			const sessionTemplate = (this.templates.session as any).session || this.templates.session
			
			// Check if session is a State object
			if (isState(sessionState)) {
				const sessionPlain = serializeStore(sessionState)
				// blueprint expects both arguments to have the same structure
				this.set_session('store', this.blueprint(sessionPlain, copy_object(sessionTemplate)))
			} else {
				// Plain object session
				this.set_session('store', this.blueprint(sessionState, copy_object(sessionTemplate)))
			}
		} else {
			// No session state - save empty session based on template structure
			const sessionTemplate = (this.templates.session as any).session || this.templates.session
			if (sessionTemplate && Object.keys(sessionTemplate).length > 0) {
				this.set_session('store', this.blueprint({} as any, copy_object(sessionTemplate)))
			} else {
				this.set_session('store', {})
			}
		}
	}

	set(key: string, item: object): void {
		if (typeof window === 'undefined') return
		try {
			return window.localStorage.setItem(key, JSON.stringify(item))
		} catch(err) {
			console.error('Cannot use Local Storage; continue without.', err)
		}
	}

	set_session(key: string, item: object): void {
		if (typeof window === 'undefined') return
		try {
			return window.sessionStorage.setItem(key, JSON.stringify(item))
		} catch(err) {
			console.error('Cannot use Session Storage; continue without.', err)
		}
	}
}
