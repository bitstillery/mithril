import {state, State} from './state'

// Utility functions for Store class
function is_object(v: any): boolean {
	return v && typeof v === 'object' && !Array.isArray(v)
}

function copy_object<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj))
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

	constructor(options: {lookup_ttl?: number} = {lookup_ttl: DEFAULT_LOOKUP_TTL}) {
		this.lookup_ttl = options.lookup_ttl || DEFAULT_LOOKUP_TTL
		// Initialize with empty state, will be loaded later
		this.stateInstance = state({} as T, 'store.default')
		
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
			merge_deep(store_state, {session: session_state})
		}

		const final_state = merge_deep(store_state, copy_object(volatile))
		
		// Update the state instance by assigning all properties recursively
		// This ensures nested objects are properly updated in the reactive state
		function updateState(target: any, source: any) {
			for (const key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					if (is_object(source[key]) && is_object(target[key])) {
						updateState(target[key], source[key])
					} else {
						target[key] = source[key]
					}
				}
			}
		}
		updateState(this.stateInstance, final_state)
	}

	save() {
		// Create a plain object copy of state for blueprint (to avoid proxy issues)
		const statePlain = JSON.parse(JSON.stringify(this.stateInstance))
		this.set('store', this.blueprint(statePlain, copy_object(this.templates.persistent)))
		this.set_session('store', this.blueprint((statePlain as any).session || {}, copy_object(this.templates.session)))
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
