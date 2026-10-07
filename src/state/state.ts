import {signal, computed, Signal, ComputedSignal} from './signal'
import {getSSRContext} from '../ssr/context'

import type {Hook} from '../render/vnode'

type AnySignal = Signal<unknown> | ComputedSignal<unknown>
export type SignalMap = Map<string, AnySignal>

/** What a state proxy answers besides its data: its signals, and the signal of the parent holding it. */
export interface StateInternals {
    __isState?: true
    __signalMap?: SignalMap | null
    __signals?: unknown[]
    __originalKeys?: Set<string>
    _parentSignal?: Signal<unknown>
    allowComputed?: () => void
}

/** A `{get, set}` property: reads as a computed of `get`, writes through `set`. */
interface GetSetDescriptor {
    get?: (this: unknown) => unknown
    set?: (this: unknown, value: unknown) => void
}

// WeakMap to store parent signal references for arrays
const arrayParentSignalMap = new WeakMap<object, Signal<unknown>>()

// Deferred computed evaluation: gate computeds until allowComputed() is called
const stateDeferredFlags = new WeakMap<object, {allowed: boolean}>()
// Store __rootState in a WeakMap to avoid proxy get recursion when reading it off the proxy
const stateRootMap = new WeakMap<object, object>()

function getDeferredAllowed(stateObj: object | undefined): boolean {
    const root = (stateObj && (stateRootMap.get(stateObj) ?? stateObj)) || stateObj
    const flags = root ? stateDeferredFlags.get(root) : undefined
    return !flags || flags.allowed
}

function createStateComputed<T>(wrapped: object | undefined, computeFn: () => T, shouldDefer: boolean): ComputedSignal<T> {
    if (!shouldDefer) return computed(computeFn)
    return computed(() => {
        if (!getDeferredAllowed(wrapped)) return undefined as T
        return computeFn()
    })
}

/** Recursively mark all ComputedSignals in a state tree dirty (used when opening deferred gate). */
function markAllComputedsDirty(stateObj: StateInternals | undefined): void {
    if (!stateObj || !stateObj.__isState) return
    const signalMap = stateObj.__signalMap
    if (signalMap && signalMap instanceof Map) {
        signalMap.forEach((sig) => {
            if (sig instanceof ComputedSignal) {
                sig.markDirty()
            } else if (sig && typeof sig === 'object' && sig.value && (sig.value as StateInternals).__isState) {
                markAllComputedsDirty(sig.value)
            }
        })
    }
    // Arrays use __signals instead of __signalMap; recurse into nested state elements
    const signals = stateObj.__signals
    if (Array.isArray(signals)) {
        for (const sig of signals) {
            if (sig && typeof sig === 'object' && (sig as StateInternals).__isState) {
                markAllComputedsDirty(sig)
            } else if (sig && typeof sig === 'object' && !isSignal(sig)) {
                // Array elements that are Proxies (not signals) - they're nested states
                markAllComputedsDirty(sig)
            }
        }
    }
}

/**
 * Notifies the signal holding a state array that the array changed in place: its reference didn't,
 * so the signal can't tell by itself. Through `trigger()`, so a collected computed's subscription is
 * dropped as on any other change.
 */
function notifyArrayParent(array: object): void {
    const parentSignal = arrayParentSignalMap.get(array) || (array as StateInternals)._parentSignal
    if (parentSignal) parentSignal.trigger()
}

/** Links a nested state or array to the signal holding it, which it notifies when it changes in place. */
function linkArrayParentSignal(value: unknown, sig: AnySignal): void {
    if (!value || typeof value !== 'object') return
    if ((value as StateInternals).__isState === true && Array.isArray((value as StateInternals).__signals)) {
        arrayParentSignalMap.set(value, sig)
        ;(value as StateInternals)._parentSignal = sig
    } else if (Array.isArray(value)) {
        arrayParentSignalMap.set(value, sig)
    } else if ((value as StateInternals).__isState === true) {
        // Nested object proxies: notify parent when keys are added/removed
        arrayParentSignalMap.set(value, sig)
    }
}

// Type guard to check if value is a Signal
function isSignal<T>(value: unknown): value is Signal<T> {
    // A ComputedSignal is a Signal too.
    return value instanceof Signal
}

/**
 * Array methods that read every element run on a plain array of the unwrapped values: a native
 * method walking the proxy instead pays a trap per index, five times the cost of the whole copy.
 */
const copyingArrayMethods = new Set([
    'map',
    'filter',
    'forEach',
    'reduce',
    'reduceRight',
    'flatMap',
    'concat',
    'flat',
    'join',
    'toString',
    'toLocaleString',
    // ES2023 copy-with-mutate methods
    'toSorted',
    'toReversed',
    'toSpliced',
])
/** The callback's array argument is the state array itself, not the copy, as with the native method. */
const elementCallbackMethods = new Set(['map', 'filter', 'forEach', 'flatMap'])
const accumulatorCallbackMethods = new Set(['reduce', 'reduceRight'])

// Mutating array methods, which notify the signal holding the array.
const mutatingArrayMethods = new Set(['splice', 'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'fill', 'copyWithin'])

/**
 * Array methods bound to the state array's proxy, so the elements they read come through the get
 * trap unwrapped. They stop early or read a range, so a copy of every element would also track
 * the elements they never read.
 */
const proxiedArrayMethods = new Set([
    'some',
    'every',
    'find',
    'findIndex',
    'includes',
    'indexOf',
    'lastIndexOf',
    'slice',
    'entries',
    'keys',
    'values',
])

// Type guard to check if value is already a state (has been wrapped)
function isState(value: unknown): boolean {
    return (value && typeof value === 'object' && (value as StateInternals).__isState === true) as boolean
}

/**
 * Built-ins whose methods need their internal slots. A proxy has none, and the get trap calls a
 * function-valued property with the proxy as `this`, so a proxied Date or Map throws on every method
 * call (and a Map's `get`/`set` read as a get/set descriptor). They are held as a signal's value
 * instead, and replaced wholesale to notify.
 */
function isOpaqueObject(value: object): boolean {
    return (
        value instanceof Date ||
        value instanceof Map ||
        value instanceof Set ||
        value instanceof WeakMap ||
        value instanceof WeakSet ||
        value instanceof RegExp ||
        value instanceof Promise ||
        value instanceof ArrayBuffer ||
        ArrayBuffer.isView(value)
    )
}

/**
 * Check if a value is a get/set descriptor object (like JavaScript property descriptors)
 * Used to detect computed properties defined as { get: () => T, set?: (value: T) => void }
 */
function isGetSetDescriptor(value: unknown): value is GetSetDescriptor {
    return (value &&
        typeof value === 'object' &&
        !isOpaqueObject(value) &&
        (typeof (value as GetSetDescriptor).get === 'function' ||
            typeof (value as GetSetDescriptor).set === 'function')) as boolean
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
export interface StateRegistryEntry {
    state: object
    initial: unknown
}

const globalStateRegistry = new Map<string, StateRegistryEntry>()

/**
 * Returns the registry to use: per-request registry when inside an SSR
 * runWithContext(), otherwise the global registry (client or tests).
 */
function getCurrentStateRegistry(): Map<string, StateRegistryEntry> {
    const ctx = getSSRContext()
    if (ctx?.stateRegistry) {
        return ctx.stateRegistry
    }
    return globalStateRegistry
}

/**
 * Register a state for SSR serialization
 * Called automatically when state is created with a name
 * @param name - Unique name for the state
 * @param stateInstance - The state instance to register
 * @param initial - Original initial state (with computed properties) for restoration
 */
export function registerState(name: string, stateInstance: object, initial: unknown): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error('State name is required and must be a non-empty string')
    }

    const registry = getCurrentStateRegistry()

    // Warn in development if name collision detected
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        if (registry.has(name)) {
            console.warn(`State name collision detected: "${name}". Last registered state will be used.`)
        }
    }

    registry.set(name, {state: stateInstance, initial})
}

/**
 * Update the registry entry for an existing state
 * Used by Store to update its "initial" state after load() is called
 * @param stateInstance - The state instance to update
 * @param initial - New initial state (merged templates for Store)
 */
export function updateStateRegistry(stateInstance: object, initial: unknown): void {
    const registry = getCurrentStateRegistry()
    // Find the registry entry for this state and update its initial value
    for (const [name, entry] of registry.entries()) {
        if (entry.state === stateInstance) {
            registry.set(name, {state: stateInstance, initial})
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
    return getCurrentStateRegistry()
}

/**
 * Copy states from global registry to SSR context.
 * Used when app modules load at startup (registering to global) but SSR needs
 * them in the per-request context for serialization.
 */
export function copyGlobalStatesToContext(context: {stateRegistry: Map<string, StateRegistryEntry>}): void {
    for (const [name, entry] of globalStateRegistry.entries()) {
        context.stateRegistry.set(name, entry)
    }
}

/**
 * Clear the state registry (useful for testing or after serialization).
 * Clears the current registry (per-request in SSR, global on client).
 */
export function clearStateRegistry(): void {
    getCurrentStateRegistry().clear()
}

export interface StateOptions {
    /** When true, computed properties are not evaluated until allowComputed() is called. */
    deferComputed?: boolean
}

/**
 * Deep signal state - wraps objects/arrays with Proxy to make them reactive
 * @param initial - Initial state object
 * @param name - Optional name for SSR serialization/hydration. When omitted, state is not registered (suitable for client-only apps).
 * @param options - Optional. deferComputed: when true, computeds return undefined until allowComputed() is called.
 */
export function state<T extends object>(initial: T, name?: string, options?: StateOptions): State<T> {
    const stateCache = new WeakMap<object, object>()
    const deferComputed = !!options?.deferComputed

    // Context passed through recursive initializeSignals for deferred computeds and root reference
    interface InitContext {
        deferComputed: boolean
        rootState?: object | undefined
    }

    // Convert initial values to signals
    // parentSignalMap is optional - if provided, nested states will use it
    // If not provided, each nested state gets its own signalMap
    // An object or array comes back as its state proxy; anything else as it is.
    function initializeSignals(obj: object, parentSignalMap?: SignalMap, context?: InitContext): object
    function initializeSignals(obj: unknown, parentSignalMap?: SignalMap, context?: InitContext): unknown
    function initializeSignals(obj: unknown, parentSignalMap?: SignalMap, context?: InitContext): unknown {
        if (obj === null || typeof obj !== 'object' || isOpaqueObject(obj)) {
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
            // Init, push/unshift, splice and index assignment all wrap through here, so an element typed as
            // `State<E>` is one: objects and arrays become their own state proxy (the proxy is the element, not a
            // signal around it), everything else a signal.
            const toElement = (item: unknown): unknown => {
                if (typeof item === 'object' && item !== null) {
                    return initializeSignals(item, undefined, context)
                }
                return toSignal(item)
            }
            // Arrays don't get their own signalMap - they use the parent's
            const signals: unknown[] = obj.map(toElement)

            // Wrap the signals array directly (not a copy) so mutations stay in sync
            // Store parent signal reference directly on the Proxy for reliable lookup
            const wrapped = new Proxy(signals, {
                get(target, prop) {
                    // The common read: an element by index, as every iteration does. A key past the
                    // end, or not a number after all, falls through to the handling below.
                    if (typeof prop === 'string') {
                        const first = prop.charCodeAt(0)
                        if (first >= 48 && first <= 57) {
                            const index = Number(prop)
                            if (index < signals.length) {
                                const sig = signals[index]
                                return isSignal(sig) ? sig.value : sig
                            }
                        }
                    }
                    if (prop === '__isState') return true
                    if (prop === '__signals') return signals
                    if (prop === '__parentSignal') {
                        // Allow accessing parent signal directly for debugging
                        return arrayParentSignalMap.get(wrapped) || (wrapped as StateInternals)._parentSignal
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

                    const value: unknown = Reflect.get(target, prop)

                    // For array methods that iterate (map, filter, forEach, etc.), bind to wrapped Proxy
                    // so they go through our get trap for element access
                    if (typeof value === 'function' && copyingArrayMethods.has(propStr)) {
                        return function (...args: unknown[]) {
                            // Preallocated and filled in order, as in vnode.ts's normalizeChildren.
                            // oxlint-disable-next-line no-new-array
                            const plain = new Array(signals.length) as unknown[]
                            for (let i = 0; i < signals.length; i++) {
                                const sig = signals[i]
                                plain[i] = isSignal(sig) ? sig.value : sig
                            }
                            const callback = args[0]
                            if (typeof callback === 'function') {
                                if (elementCallbackMethods.has(propStr)) {
                                    args[0] = function (this: unknown, element: unknown, index: number) {
                                        return (callback as Hook).call(this, element, index, wrapped)
                                    }
                                } else if (accumulatorCallbackMethods.has(propStr)) {
                                    args[0] = (accumulator: unknown, element: unknown, index: number) =>
                                        (callback as Hook)(accumulator, element, index, wrapped)
                                }
                            }
                            return (value as Hook).apply(plain, args)
                        }
                    }
                    if (typeof value === 'function' && proxiedArrayMethods.has(propStr)) {
                        return (value as Hook).bind(wrapped)
                    }

                    // Intercept mutating methods to trigger parent signal
                    if (typeof value === 'function' && mutatingArrayMethods.has(propStr)) {
                        return function (...args: unknown[]) {
                            // For splice, we need to handle it specially to convert new items to signals
                            if (propStr === 'splice') {
                                const start = (args[0] as number | undefined) ?? 0
                                const deleteCount = (args[1] as number | undefined) ?? signals.length - start
                                const newItems = args.slice(2)

                                const newSignals = newItems.map(toElement)

                                // Update the signals array (target is signals array)
                                const removed = signals.splice(start, deleteCount, ...newSignals)

                                notifyArrayParent(wrapped)

                                // Return removed items (unwrapped)
                                return removed.map((sig) => (isSignal(sig) ? sig.value : sig))
                            } else {
                                // For other mutating methods, convert new items to signals first
                                let result: unknown
                                if (propStr === 'push' || propStr === 'unshift') {
                                    const newItems = args
                                    const newSignals = newItems.map(toElement)
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
                                        signals.reverse()
                                    } else {
                                        // sort needs a comparator function that works on signals
                                        const comparator = args[0] as ((a: unknown, b: unknown) => number) | undefined
                                        if (comparator) {
                                            signals.sort((a, b) => {
                                                const aVal = isSignal(a) ? a.value : a
                                                const bVal = isSignal(b) ? b.value : b
                                                return comparator(aVal, bVal)
                                            })
                                        } else {
                                            signals.sort((a, b) => {
                                                const aVal = isSignal(a) ? a.value : a
                                                const bVal = isSignal(b) ? b.value : b
                                                // Like `<` on the values themselves: numbers numerically, anything else as strings.
                                                return (aVal as string) < (bVal as string)
                                                    ? -1
                                                    : (aVal as string) > (bVal as string)
                                                      ? 1
                                                      : 0
                                            })
                                        }
                                    }
                                    // Return wrapped Proxy (not raw signals array) so chained calls like
                                    // .sort().map() receive unwrapped values in the callback
                                    result = wrapped
                                } else if (propStr === 'fill') {
                                    const fillValue = args[0]
                                    const start = (args[1] as number | undefined) ?? 0
                                    const end = (args[2] as number | undefined) ?? signals.length
                                    // A wrap per slot, so no two slots share a signal. An object fill value still reads
                                    // back as one shared element in every slot, as native fill shares the reference:
                                    // `toElement` returns the cached proxy for the same object.
                                    for (let i = start; i < end; i++) {
                                        signals[i] = toElement(fillValue)
                                    }
                                    result = signals.length
                                } else {
                                    // For other methods, just apply to target
                                    result = value.apply(target, args)
                                }

                                notifyArrayParent(wrapped)

                                return result
                            }
                        }
                    }

                    if (typeof value === 'function') {
                        return (value as Hook).bind(target)
                    }
                    return value
                },
                set(target, prop, value) {
                    if (typeof prop === 'string' && !isNaN(Number(prop))) {
                        const index = Number(prop)
                        // Assigning past the end (`arr[arr.length] = x`) appends, so it wraps and notifies like push.
                        if ((index >= 0 && index < signals.length) || (Number.isInteger(index) && index >= signals.length)) {
                            const sig = signals[index]
                            // A primitive over a primitive keeps the element's signal, so `arr.$i` subscribers see it.
                            if (isSignal(sig) && (typeof value !== 'object' || value === null)) {
                                sig.value = value
                            } else {
                                signals[index] = toElement(value)
                            }
                            notifyArrayParent(wrapped)
                            return true
                        }
                    }
                    if (prop === 'length') {
                        const previousLength = signals.length
                        const result = Reflect.set(target, prop, value)
                        // Resizing adds or drops elements without going through a mutator, so it notifies like splice.
                        if (signals.length !== previousLength) notifyArrayParent(wrapped)
                        return result
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
        // Store original keys for SSR serialization (to distinguish nested state keys from parent keys).
        // Kept as the array, and made a Set only when asked for: a Set costs several times the memory.
        const originalKeyList = Object.keys(obj)
        let originalKeys: Set<string> | undefined
        // Each nested state gets its own signalMap (unless parentSignalMap is explicitly provided)
        // This prevents nested states from sharing the parent's signalMap
        const nestedSignalMap = parentSignalMap || new Map<string, AnySignal>()
        // Assigned the proxy below; the closures here only run once it is.
        let wrapped: object | undefined
        const getChildContext = (): InitContext | undefined =>
            context ? {...context, rootState: stateRootMap.get(wrapped!) ?? wrapped} : undefined

        const createPropertySignal = (originalValue: unknown): AnySignal => {
            if (typeof originalValue === 'function') {
                return createStateComputed(wrapped, () => (originalValue as Hook).call(wrapped), !!context?.deferComputed)
            }
            if (isGetSetDescriptor(originalValue)) {
                if (typeof originalValue.get === 'function') {
                    return createStateComputed(wrapped, () => originalValue.get!.call(wrapped), !!context?.deferComputed)
                }
                return signal(undefined)
            }
            if (typeof originalValue === 'object' && originalValue !== null) {
                const nestedState = initializeSignals(originalValue, undefined, getChildContext())
                const sig = signal(nestedState)
                if (nestedState && (nestedState as StateInternals).__isState) {
                    stateRootMap.set(nestedState, stateRootMap.get(wrapped!) ?? wrapped!)
                }
                linkArrayParentSignal(nestedState, sig)
                return sig
            }
            return toSignal(originalValue)
        }

        const ensurePropertySignal = (target: object, prop: string | symbol, key: string) => {
            // One Map lookup, not two. This runs on EVERY property read of every state object — the
            // hottest path in the framework — and after the first access the signal always exists, so the
            // old `has()` + `get()` pair doubled the cost of the common case.
            //
            // `get()` returning undefined is an exact substitute for `!has()`: createPropertySignal never
            // returns undefined (it always yields a Signal, falling back to `signal(undefined)`), and the
            // early return below stores nothing.
            const existing = nestedSignalMap.get(key)
            if (existing !== undefined) {
                return existing
            }
            const originalValue: unknown = Reflect.get(target, prop)
            if (originalValue === undefined) return undefined
            const created = createPropertySignal(originalValue)
            nestedSignalMap.set(key, created)
            return created
        }
        wrapped = new Proxy(obj, {
            get(target, prop) {
                // The common read: a data property whose signal exists. The internal names below are
                // never data keys, so looking this up first doesn't shadow them.
                if (typeof prop === 'string') {
                    const existing = nestedSignalMap.get(prop)
                    if (existing !== undefined) return existing.value
                }
                if (prop === '__originalKeys') return (originalKeys ??= new Set(originalKeyList))
                if (prop === '__isState') return true
                // Check if __signalMap was explicitly set to null (for error testing)
                // If so, return null; otherwise return the nestedSignalMap
                if (prop === '__signalMap') {
                    const explicitValue: unknown = Reflect.get(target, '__signalMap')
                    return explicitValue !== undefined ? explicitValue : nestedSignalMap
                }
                if (prop === '__rootState') return stateRootMap.get(wrapped!) ?? wrapped
                // allowComputed() opens the deferred-computed gate and marks all computeds dirty
                if (prop === 'allowComputed') {
                    return function allowComputed(this: object | undefined) {
                        const root = (this && (stateRootMap.get(this) ?? this)) || this
                        const flags = root ? stateDeferredFlags.get(root) : undefined
                        if (flags) flags.allowed = true
                        markAllComputedsDirty(root)
                    }
                }

                // Property keys are already strings in virtually every access; `String()` on a symbol is
                // the rare path, so don't make the common one pay for the conversion.
                const propStr = typeof prop === 'string' ? prop : String(prop)

                // Check for $ prefix convention (deepsignal-style: returns raw signal)
                if (propStr.startsWith('$') && propStr.length > 1) {
                    const key = propStr.slice(1) // Remove $ prefix

                    const sig = ensurePropertySignal(target, key, key)
                    if (!sig) return undefined

                    // Re-link array-backed values so mutations (splice, push) notify subscribers.
                    // Needed when $prop is accessed before .prop (e.g. watcher setup before render).
                    if (sig && !(sig instanceof ComputedSignal)) {
                        linkArrayParentSignal(sig.peek(), sig)
                    }

                    // Return raw signal object (not the value)
                    return sig
                }

                const key = propStr

                const sig = ensurePropertySignal(target, prop, key)
                if (sig) {
                    // Access signal.value to track component dependency
                    return sig.value
                }

                // Fallback to original property
                return Reflect.get(target, prop) as unknown
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
                const originalValue: unknown = Reflect.get(target, prop)
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
                        const computedSig = createStateComputed(wrapped, () => value.get!.call(wrapped), !!context?.deferComputed)
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
                    const computedSig = createStateComputed(
                        wrapped,
                        () => (value as Hook).call(wrapped),
                        !!context?.deferComputed,
                    )
                    nestedSignalMap.set(key, computedSig)
                    return true
                }

                // Update or create signal
                if (nestedSignalMap.has(key)) {
                    const sig = nestedSignalMap.get(key)
                    if (sig && !(sig instanceof ComputedSignal)) {
                        if (typeof value === 'object' && value !== null) {
                            const nestedState = initializeSignals(value, undefined, getChildContext())
                            if (nestedState && (nestedState as StateInternals).__isState) {
                                stateRootMap.set(nestedState, stateRootMap.get(wrapped!) ?? wrapped!)
                            }
                            linkArrayParentSignal(nestedState, sig)
                            sig.value = nestedState
                        } else {
                            sig.value = value
                        }
                    } else {
                        // Replace computed with regular signal
                        nestedSignalMap.set(key, createPropertySignal(value))
                    }
                } else {
                    // Create new signal (new key added to object)
                    nestedSignalMap.set(key, createPropertySignal(value))
                    // Mirror the key on the target so devtools show it when expanding <target>
                    Reflect.set(target, prop, value)
                    // Notify parent so subscribers see the key addition
                    const parentSignal = arrayParentSignalMap.get(wrapped!) || (wrapped as StateInternals)._parentSignal
                    if (parentSignal && typeof parentSignal.trigger === 'function') {
                        parentSignal.trigger()
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
                        writable: true,
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
                        sig.value = undefined
                    }
                    // Remove from the signal map
                    nestedSignalMap.delete(key)
                    // Notify parent so subscribers see the key removal
                    const parentSignal = arrayParentSignalMap.get(wrapped!) || (wrapped as StateInternals)._parentSignal
                    if (parentSignal && typeof parentSignal.trigger === 'function') {
                        parentSignal.trigger()
                    }
                }

                // Delete from target
                return Reflect.deleteProperty(target, prop)
            },
        })

        stateRootMap.set(wrapped, context?.rootState ?? wrapped)
        stateCache.set(obj, wrapped)
        for (const key of originalKeyList) {
            if (!nestedSignalMap.has(key)) {
                nestedSignalMap.set(key, createPropertySignal((obj as Record<string, unknown>)[key]))
            }
        }
        return wrapped
    }

    const initContext: InitContext | undefined = deferComputed ? {deferComputed: true} : undefined
    const wrapped = initializeSignals(initial, undefined, initContext) as State<T>
    stateRootMap.set(wrapped, wrapped)
    if (deferComputed) {
        stateDeferredFlags.set(wrapped, {allowed: false})
    }

    // Register state for SSR serialization when name is provided (required for hydration)
    if (name && typeof name === 'string' && name.trim() !== '') {
        registerState(name, wrapped, initial)
    }

    return wrapped
}

/** The built-ins `isOpaqueObject` keeps out of the proxy: state holds them as they are. */
type OpaqueObject =
    | Date
    | Map<unknown, unknown>
    | Set<unknown>
    | WeakMap<WeakKey, unknown>
    | WeakSet<WeakKey>
    | RegExp
    | Promise<unknown>
    | ArrayBuffer
    | ArrayBufferView

/**
 * A value as state hands it out: a function reads as its computed result, an object (or array) as its
 * own State. Distributes over a union, so a nullable object (`Foo | null`) is still a State with its
 * `$` signals once it is set.
 */
type StateValue<V> = V extends (...args: never[]) => infer R ? R : V extends OpaqueObject ? V : V extends object ? State<V> : V

/**
 * A property as state hands it out. Unlike an array element it doesn't distribute over a union, so a
 * nullable object (`Foo | null`) stays its plain shape and a plain `Foo` can be written to it, as in 3.9.
 * A `{get, set}` descriptor reads as its computed value.
 */
type StateProp<V> = [V] extends [never]
    ? V
    : [V] extends [(...args: never[]) => infer R]
      ? R
      : [V] extends [{get: () => infer R; set: (value: never) => void}]
        ? R
        : [V] extends [OpaqueObject]
          ? V
          : [V] extends [object]
            ? State<V>
            : V

/**
 * Mapped type that adds $prop for each key, returning the Signal for that property.
 * - Primitives: $prop => Signal<T[K]>
 * - Nested objects: $prop => Signal<State<T[K]>>
 * - Functions: $prop => ComputedSignal of the getter's return type
 */
export type StateSignals<T extends object> = {
    // Only for declared keys: a record's index signature would otherwise gain a `$${string}` twin, and every
    // lookup by a `string` key would read as `Value | Signal<Value>`.
    [K in keyof T as K extends string ? (string extends K ? never : `$${K}`) : never]: T[K] extends (...args: never[]) => infer R
        ? ComputedSignal<R>
        : Signal<StateProp<T[K]>>
}

export type StateArray<Elem> = Omit<Array<StateValue<Elem>>, 'fill' | 'push' | 'splice' | 'unshift'> & {
    fill(value: Elem, start?: number, end?: number): StateArray<Elem>
    push(...items: Elem[]): number
    splice(start: number, deleteCount?: number, ...items: Elem[]): StateValue<Elem>[]
    unshift(...items: Elem[]): number
}

export type State<T extends object> = T extends (infer Elem)[]
    ? StateArray<Elem>
    : {[K in keyof T]: StateProp<T[K]>} & StateSignals<T>

/**
 * A partial of a state shape at every depth, for the persistence tiers of a Store: each tier fills in
 * part of a nested object (`saved` some keys of `exact`, `temporary` the rest). Arrays and computed
 * getters are replaced wholesale, never merged element-wise.
 */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
    ? T
    : T extends readonly unknown[]
      ? T
      : T extends object
        ? {[K in keyof T]?: DeepPartial<T[K]>}
        : T

/**
 * Opens the deferred-computed gate of a state built with `deferComputed` and marks its
 * computeds dirty. The gate is a proxy trap rather than a key of the state, so it isn't on `State<T>`.
 */
export function allowComputed(stateInstance: object): void {
    ;(stateInstance as StateInternals).allowComputed?.()
}

/** Function returned by watch() to remove the watcher */
export type Unwatch = () => void

/**
 * Watch a signal for changes
 * @param signal - The signal to watch
 * @param callback - Callback function called when signal value changes
 * @returns Unsubscribe function
 */
export function watch<T>(signal: Signal<T> | ComputedSignal<T>, callback: (newValue: T, oldValue: T) => void): Unwatch {
    const unwatch = signal.watch(callback)

    // Register watcher in SSR context for cleanup at end of request
    if (globalThis.__SSR_MODE__) {
        const context = getSSRContext()
        if (context) {
            if (!context.watchers) {
                context.watchers = []
            }
            context.watchers.push(unwatch)
            // During SSR, fire watcher immediately with current value to catch any changes
            // that happened before watcher registration (e.g., from restore_filters_sort)
            // Use Promise.resolve().then() to defer execution until after unwatch is returned,
            // so callbacks that reference unwatch won't cause ReferenceError
            void Promise.resolve().then(() => {
                try {
                    const currentValue = signal.peek()
                    callback(currentValue, currentValue)
                } catch (e) {
                    console.error('Error firing initial watcher callback:', e)
                }
            })
        }
    }

    return unwatch
}
