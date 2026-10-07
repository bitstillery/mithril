import {allowComputed, state, updateStateRegistry} from './state'
import type {State, DeepPartial, StateInternals} from './state'
import {serializeStore, deserializeStore} from '../ssr/serialize'

/** A JSON-like object the store copies, merges and persists. */
type PlainObject = Record<string, unknown>

/** The tab tier's template is the shape of `state.tab`, written flat, because load() mounts it there. */
export type TabTemplate<T> = T extends {tab?: infer U extends object} ? DeepPartial<U> : object

// Helper function to restore computed properties (same as in ssr/serialize.ts)
function restoreComputedProperties(state: object, initial: unknown): void {
    if (!initial || typeof initial !== 'object') {
        return
    }

    function is_object(v: unknown): v is PlainObject {
        return (v && typeof v === 'object' && !Array.isArray(v)) as boolean
    }

    // `obj` is a part of the initial state; `target` is always the root state, walked by `prefix`.
    function restore(obj: PlainObject, target: PlainObject, prefix: string = ''): void {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key]

                if (typeof value === 'function') {
                    // Set function property - state proxy will convert to ComputedSignal
                    const keys = prefix ? prefix.split('.').filter((k) => k) : []
                    let targetState = target
                    for (let i = 0; i < keys.length; i++) {
                        if (!targetState || !targetState[keys[i]!]) {
                            // Nested state doesn't exist yet, skip
                            return
                        }
                        targetState = targetState[keys[i]!] as PlainObject
                    }
                    if (targetState) {
                        // Clear any existing signal in signalMap so function is re-initialized as ComputedSignal
                        if (typeof targetState === 'object' && (targetState as StateInternals).__isState) {
                            const signalMap = (targetState as StateInternals).__signalMap
                            if (signalMap && signalMap instanceof Map) {
                                signalMap.delete(key)
                            }
                        }
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

    restore(initial as PlainObject, state as PlainObject)
}

// Utility functions for Store class
function isState(value: unknown): boolean {
    return (value && typeof value === 'object' && (value as StateInternals).__isState === true) as boolean
}

function is_object(v: unknown): v is PlainObject {
    return (v && typeof v === 'object' && !Array.isArray(v)) as boolean
}

function copy_object<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T
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
        return (obj as unknown[]).map((item) => copy_object_preserve_functions(item)) as T
    }

    if (typeof obj === 'function') {
        return obj
    }

    const result: PlainObject = {}
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value: unknown = obj[key]
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

// Merges each source into `target` in place and returns it; a non-object source is skipped.
function merge_deep(target: object, ...sources: unknown[]): PlainObject {
    if (!sources.length) return target as PlainObject
    const source = sources.shift()

    if (is_object(target) && is_object(source)) {
        for (const key in source) {
            if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                // Splice the contents of source[key] into target[key]
                ;(target[key] as unknown[]).splice(0, (target[key] as unknown[]).length, ...(source[key] as unknown[]))
            } else if (is_object(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}})
                merge_deep(target[key] as object, source[key])
            } else {
                Object.assign(target, {[key]: source[key]})
            }
        }
    }

    return merge_deep(target, ...sources)
}

const DEFAULT_LOOKUP_VERIFY_INTERVAL = 1000 * 10 // 10 seconds
const DEFAULT_LOOKUP_TTL = 1000 * 60 * 60 * 24 // 1 day
const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year, in seconds
// Browsers cap a single cookie at ~4KB; stay well under so we never silently drop a write
// or bloat every request. The cookie tier is for small, render-affecting preferences only.
const MAX_COOKIE_BYTES = 3500

// Counter for generating unique store instance names
let storeInstanceCounter = 0

/**
 * Store class - wraps state() with persistence functionality
 * Provides load/save/blueprint methods for localStorage/sessionStorage persistence
 *
 * State types:
 * - saved: localStorage (survives browser restarts)
 * - temporary: not persisted (resets on reload)
 * - tab: sessionStorage (survives page reloads, clears when tab closes)
 * - session: server-side session storage (optional, off by default; requires backend, hydrated via SSR)
 * - cookie: a single JSON cookie (optional, off by default). Unlike localStorage, a cookie is sent
 *   on the SSR document request, so the server can render with these values and avoid a hydration
 *   flash. For small, render-affecting preferences only (≤MAX_COOKIE_BYTES) — never large or
 *   growing data (it ships on every request).
 */
export class Store<T extends object = PlainObject> {
    private stateInstance: State<T>
    private templates = {
        saved: {} as DeepPartial<T>,
        temporary: {} as DeepPartial<T>,
        tab: {} as TabTemplate<T>,
        session: {} as DeepPartial<T>,
        cookie: {} as DeepPartial<T>,
    }
    private lookup_verify_interval: number | null = null
    private lookup_ttl: number
    private storageKey: string
    private tabStorageKey: string
    private cookieKey: string
    private cookieMaxAge: number

    constructor(
        options: {
            lookup_ttl?: number
            storageKey?: string
            tabStorageKey?: string
            cookieKey?: string
            cookieMaxAge?: number
        } = {lookup_ttl: DEFAULT_LOOKUP_TTL},
    ) {
        this.lookup_ttl = options.lookup_ttl || DEFAULT_LOOKUP_TTL
        this.storageKey = options.storageKey ?? 'store'
        this.tabStorageKey = options.tabStorageKey ?? this.storageKey
        this.cookieKey = options.cookieKey ?? 'store_prefs'
        this.cookieMaxAge = options.cookieMaxAge ?? DEFAULT_COOKIE_MAX_AGE
        // Initialize with empty state, will be loaded later (computeds stay deferred until ready() is called)
        const instanceName = `store.instance.${storeInstanceCounter++}`
        this.stateInstance = state({} as T, instanceName, {deferComputed: true})

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
     * Allow evaluation of computed properties. Call after load() and app setup
     * (e.g. after $s, context, or route are ready) so computeds that depend on them can run.
     */
    ready(): void {
        allowComputed(this.stateInstance)
    }

    /**
     * Merge deep on object `state`, but only the key/values in `blueprint`.
     */
    blueprint<B extends object>(state: unknown, blueprint: B): DeepPartial<B> {
        if (state == null || typeof state !== 'object') {
            return {} as DeepPartial<B>
        }
        const result: PlainObject = {}
        for (const key of Object.keys(blueprint)) {
            // Use `in` so Mithril state proxies (signal-backed roots) are not skipped; `hasOwnProperty`
            // can be false for keys that only exist on the proxy’s `has` / signal map.
            if (!(key in state)) {
                continue
            }
            const blueprintValue = (blueprint as PlainObject)[key]
            const stateValue = (state as PlainObject)[key]
            if (!Array.isArray(blueprintValue) && blueprintValue !== null && is_object(blueprintValue)) {
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
        return result as DeepPartial<B>
    }

    clean_lookup() {
        // Skip during SSR (server-side rendering in Bun)
        // Check both window existence and __SSR_MODE__ flag for safety
        if (typeof window === 'undefined' || globalThis.__SSR_MODE__) {
            return
        }

        let store_modified = false
        const lookup = (this.stateInstance as PlainObject).lookup as PlainObject | undefined
        if (!lookup) return

        // Build a new lookup object with only valid entries
        const newLookup: PlainObject = {}
        // Get keys first to avoid iteration issues when deleting
        // Filter out $ prefix keys added by reactive proxy
        const keys = Object.keys(lookup).filter((k) => !k.startsWith('$') && k !== '__isState' && k !== '__signalMap')
        for (const key of keys) {
            const value = lookup[key]
            // Previously stored values may not have a modified timestamp.
            // Set it now, and let it be cleaned up after the interval.
            if (!value || !is_object(value)) {
                // Skip invalid entries
                store_modified = true
            } else {
                if (!value.modified) {
                    value.modified = Date.now()
                    store_modified = true
                }
                if ((value.modified as number) >= Date.now() - this.lookup_ttl) {
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
            ;(this.stateInstance as PlainObject).lookup = newLookup
            void this.save()
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

    get_tab_storage(key: string): string {
        if (typeof window === 'undefined') return '{}'
        try {
            return window.sessionStorage.getItem(key) || '{}'
        } catch {
            return '{}'
        }
    }

    load(
        saved: DeepPartial<T>,
        temporary: DeepPartial<T>,
        tab: TabTemplate<T> = {} as TabTemplate<T>,
        session: DeepPartial<T> = {} as DeepPartial<T>,
        cookie: DeepPartial<T> = {} as DeepPartial<T>,
    ) {
        // The raw JSON strings, replaced by what they parse to.
        const restored_state: {tab: unknown; store: unknown} = {
            tab: this.get_tab_storage(this.tabStorageKey),
            store: this.get(this.storageKey),
        }

        this.templates = {
            saved,
            temporary,
            tab,
            session,
            cookie,
        }

        try {
            restored_state.store = JSON.parse(restored_state.store as string)
            restored_state.tab = JSON.parse(restored_state.tab as string)
        } catch (err) {
            console.log(`[store] failed to parse store/tab: ${String(err)}`)
        }

        const store_state = merge_deep(copy_object(this.templates.saved), copy_object(restored_state.store ?? {}))
        // override with previous identity for a better version bump experience.
        if (restored_state.store && typeof restored_state.store === 'object' && 'identity' in restored_state.store) {
            store_state.identity = (restored_state.store as PlainObject).identity
        }
        // A fresh tab has empty sessionStorage; it then starts from the localStorage copy the saved tier
        // keeps when its template declares `tab`, so a new tab opens where the last one was saved.
        const restored_tab = restored_state.tab
        const tab_source =
            is_object(restored_tab) && Object.keys(restored_tab).length > 0 ? copy_object(restored_tab) : store_state.tab
        const tab_state = merge_deep(copy_object(this.templates.tab), tab_source)

        // Always merge tab_state into store_state to ensure it's included in final_state
        merge_deep(store_state, {tab: tab_state})

        // Merge temporary into store_state
        // Note: copy_object removes functions, but temporary data shouldn't have functions anyway
        // (computed properties are handled separately via mergedInitial)
        const temp_state = merge_deep(store_state, copy_object(temporary))

        // Merge session into temp_state to create final_state
        // Session state comes from server (SSR), not localStorage
        const final_state = merge_deep(temp_state, copy_object(session))

        // Merge cookie state last so it wins for its keys. On the client we read the actual cookie
        // from document.cookie; during SSR there is no document, so the caller passes the
        // request-derived values as the `cookie` template (same pattern as session/sessionTemplate).
        const cookie_state = merge_deep(copy_object(cookie), this.get_cookie(this.cookieKey))
        merge_deep(final_state, cookie_state)

        // Merge templates (including computed properties) into "merged initial state"
        // This will be stored in registry so computed properties can be automatically restored
        // Use copy_object_preserve_functions to deep copy while preserving functions
        // Note: tab template structure needs to match final_state structure (nested under 'tab')
        const mergedInitialSaved = copy_object_preserve_functions(saved)
        const mergedInitialTemporary = copy_object_preserve_functions(temporary)
        // Tab template is merged into store_state.tab, so wrap it in {tab: ...}
        const mergedInitialTab = tab && Object.keys(tab).length > 0 ? {tab: copy_object_preserve_functions(tab)} : {}
        // Session template is merged directly (no nesting needed, structure matches final_state)
        const mergedInitialSession = copy_object_preserve_functions(session)
        // Cookie template is merged directly too (structure matches final_state)
        const mergedInitialCookie = copy_object_preserve_functions(cookie)
        const mergedInitial = merge_deep(
            mergedInitialSaved,
            mergedInitialTemporary,
            mergedInitialTab,
            mergedInitialSession,
            mergedInitialCookie,
        )

        // Update registry entry to store merged templates as "initial" state
        // This allows deserializeAllStates() to automatically restore computed properties
        updateStateRegistry(this.stateInstance, mergedInitial)

        // Use deserializeStore() instead of custom updateState()
        // This ensures consistency with SSR deserialization mechanism
        deserializeStore(this.stateInstance, final_state)

        // Restore computed properties from merged templates
        // This ensures computed properties are available immediately after load()
        // Note: mergedInitial contains all templates (saved, temporary, tab, session) with computed properties
        restoreComputedProperties(this.stateInstance, mergedInitial)

        // Open the deferred-computed gate so computeds can run after load
        this.ready()
    }

    /**
     * Persist state to storage. When no options are passed, saves to localStorage (saved),
     * sessionStorage (tab), and the cookie tier (when a cookie template is registered). Session
     * (server-side) is off by default; pass { session: true } to persist it.
     */
    async save(options?: {saved?: boolean; tab?: boolean; session?: boolean; cookie?: boolean}): Promise<void> {
        // Skip saving during SSR (server-side rendering in Bun)
        // On the server, there's no localStorage/sessionStorage and no need to persist state
        if (globalThis.__SSR_MODE__) {
            return
        }

        // Default: write to localStorage, sessionStorage and cookie when no options; session is opt-in
        const writeLocalStorage = options?.saved ?? options === undefined
        const writeSessionStorage = options?.tab ?? options === undefined
        const writeCookie = options?.cookie ?? options === undefined
        const writeSessionApi = options?.session === true

        const statePlain = serializeStore(this.stateInstance)

        // Write to localStorage (persistent across browser restarts)
        if (writeLocalStorage && this.templates.saved) {
            this.set(this.storageKey, this.blueprint(statePlain, copy_object(this.templates.saved)))
        }

        // Lookup is always persisted to localStorage when present, regardless of writeLocalStorage.
        // This ensures cached values (e.g. filter/sort state) are never lost when save() is called.
        if (statePlain.lookup) {
            this.persist_lookup_to_local_storage(statePlain)
        }

        // Write cookie-backed preferences (small, SSR-visible). Only when a cookie template is
        // registered, so consumers that don't opt in never get an empty cookie written.
        if (writeCookie && this.templates.cookie && Object.keys(this.templates.cookie).length > 0) {
            this.set_cookie(this.cookieKey, this.blueprint(statePlain, copy_object(this.templates.cookie)))
        }

        // Write to sessionStorage (tab-scoped, cleared when tab closes)
        if (writeSessionStorage && this.templates.tab) {
            const tabState = (this.stateInstance as PlainObject).tab as object | undefined
            if (tabState) {
                const tabPlain = isState(tabState) ? serializeStore(tabState) : tabState
                this.set_tab(this.tabStorageKey, this.blueprint(tabPlain, copy_object(this.templates.tab)))
            } else {
                this.set_tab(this.tabStorageKey, {})
            }
        }

        // Save to session API (session state) - async by nature
        // Only save session on client side (not during SSR)
        if (
            writeSessionApi &&
            this.templates.session &&
            Object.keys(this.templates.session).length > 0 &&
            typeof window !== 'undefined'
        ) {
            const sessionData = this.blueprint(statePlain, copy_object(this.templates.session))

            // Call API endpoint with batched session updates
            const endpoint = '/api/session'
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(sessionData),
            })

            if (!response.ok) {
                throw new Error(`Failed to save session state: ${response.statusText}`)
            }
        }
    }

    /**
     * Merge lookup from state into localStorage and write. Ensures lookup is always persisted
     * whenever save() is called and state contains lookup.
     */
    private persist_lookup_to_local_storage(statePlain: PlainObject): void {
        if (typeof window === 'undefined') return
        try {
            const existing = this.get(this.storageKey)
            let storeData: PlainObject = {}
            try {
                storeData = (JSON.parse(existing) as PlainObject | null) || {}
            } catch {
                storeData = {}
            }
            storeData.lookup = copy_object(statePlain.lookup || {})
            window.localStorage.setItem(this.storageKey, JSON.stringify(storeData))
        } catch (err) {
            console.error('Cannot persist lookup to Local Storage; continue without.', err)
        }
    }

    set(key: string, item: object): void {
        if (typeof window === 'undefined') return
        try {
            return window.localStorage.setItem(key, JSON.stringify(item))
        } catch (err) {
            console.error('Cannot use Local Storage; continue without.', err)
        }
    }

    /**
     * Read and parse the JSON cookie tier. Returns {} when there is no document (SSR), the cookie
     * is absent, or it cannot be parsed. During SSR the request cookie is injected via the `cookie`
     * template in load() instead, so this only does real work in the browser.
     */
    get_cookie(key: string): Record<string, unknown> {
        if (typeof document === 'undefined') return {}
        try {
            const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]*)`))
            if (!match) return {}
            const parsed: unknown = JSON.parse(decodeURIComponent(match[1]!))
            return parsed && typeof parsed === 'object' ? (parsed as PlainObject) : {}
        } catch {
            return {}
        }
    }

    /**
     * Write the cookie tier as a single JSON cookie. Skips the write (with a warning) when the
     * serialized value would exceed MAX_COOKIE_BYTES, so we never silently corrupt requests.
     */
    set_cookie(key: string, item: object): void {
        if (typeof document === 'undefined') return
        try {
            const value = encodeURIComponent(JSON.stringify(item))
            if (value.length > MAX_COOKIE_BYTES) {
                console.warn(
                    `[store] cookie '${key}' is ${value.length} bytes, over the ${MAX_COOKIE_BYTES} limit; skipping write. Keep the cookie tier small.`,
                )
                return
            }
            // Conditional so plain-http dev hosts can still write the cookie at all.
            const secure = location.protocol === 'https:' ? '; Secure' : ''
            document.cookie = `${key}=${value}; Path=/; SameSite=Lax${secure}; Max-Age=${this.cookieMaxAge}`
        } catch (err) {
            console.error('Cannot write cookie; continue without.', err)
        }
    }

    set_tab(key: string, item: object): void {
        if (typeof window === 'undefined') return
        try {
            return window.sessionStorage.setItem(key, JSON.stringify(item))
        } catch (err) {
            console.error('Cannot use Session Storage; continue without.', err)
        }
    }
}
