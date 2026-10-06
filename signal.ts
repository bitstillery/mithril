// Core signal primitive for fine-grained reactivity

import {getSSRContext, runWithContext} from './ssrContext'

// Current effect context for dependency tracking
let currentEffect: (() => void) | null = null

// Component-to-signal dependency tracking. A component is identified by its vnode state.
const componentSignalMap = new WeakMap<object, Set<Signal<unknown>>>()
const signalComponentMap = new WeakMap<Signal<unknown>, Set<object>>()

// Current component context for component-to-signal dependency tracking
let currentComponent: object | null = null

// Redraws the components that read a signal; index.ts sets it up once m.redraw exists.
let redrawCallback: ((signal: Signal<unknown>) => void) | null = null

export function setCurrentComponent(component: object) {
    currentComponent = component
}

export function clearCurrentComponent() {
    currentComponent = null
}

export function getCurrentComponent() {
    return currentComponent
}

export function trackComponentSignal(component: object, signal: Signal<unknown>) {
    let set = componentSignalMap.get(component)
    if (!set) {
        set = new Set()
        componentSignalMap.set(component, set)
    }
    if (set.has(signal)) return
    set.add(signal)

    let compSet = signalComponentMap.get(signal)
    if (!compSet) {
        compSet = new Set()
        signalComponentMap.set(signal, compSet)
    }
    compSet.add(component)
}

export function getComponentSignals(component: object): Set<Signal<unknown>> | undefined {
    return componentSignalMap.get(component)
}

export function getSignalComponents(signal: Signal<unknown>): Set<object> | undefined {
    return signalComponentMap.get(signal)
}

export function clearComponentDependencies(component: object) {
    const signals = componentSignalMap.get(component)
    if (signals) {
        signals.forEach((signal) => {
            const components = signalComponentMap.get(signal)
            if (components) {
                components.delete(component)
                if (components.size === 0) {
                    signalComponentMap.delete(signal)
                }
            }
        })
        componentSignalMap.delete(component)
    }
}

/**
 * Unregisters a component from the signals it read, before it renders again and registers what it
 * reads then. Unlike clearComponentDependencies() it keeps the sets: the next render mostly reads
 * the same signals, and reusing them saves allocating new ones on every redraw.
 */
export function resetComponentDependencies(component: object) {
    const signals = componentSignalMap.get(component)
    if (signals) {
        for (const signal of signals) signalComponentMap.get(signal)?.delete(component)
        signals.clear()
    }
}

// Set up callback for signal-to-component redraw integration
export function setSignalRedrawCallback(callback: (signal: Signal<unknown>) => void) {
    redrawCallback = callback
}

/** Redraws the components that read `signal`, once redrawing is set up. */
export function requestSignalRedraw(signal: Signal<unknown>): void {
    if (redrawCallback) redrawCallback(signal)
}

/**
 * Signal class - reactive primitive that tracks subscribers
 */
export class Signal<T> {
    private _value: T
    /**
     * Internal: state.ts notifies these directly when an array it holds mutates in place. Created on
     * the first subscription: most signals never get one, and state() makes a signal per key.
     */
    _subscribers: Set<() => void> | null = null

    constructor(initial: T) {
        this._value = initial
    }

    get value(): T {
        // Track access during render/effect
        if (currentEffect) {
            ;(this._subscribers ??= new Set()).add(currentEffect)
        }
        // Track component dependency
        if (currentComponent) {
            trackComponentSignal(currentComponent, this)
        }
        return this._value
    }

    set value(newValue: T) {
        if (this._value !== newValue) {
            this._value = newValue
            this.trigger()
        }
    }

    /**
     * Notify subscribers and trigger redraws without changing the value.
     * Use when the value is an object/array that was mutated in place (e.g. keys added/removed).
     */
    trigger(): void {
        // Notify all subscribers; the SSR context is only looked up when there is one to run.
        const subscribers = this._subscribers
        const context = subscribers && subscribers.size > 0 ? getSSRContext() : undefined
        subscribers?.forEach((fn) => {
            try {
                // Always run watchers - wrap in SSR context if available
                if (context) {
                    // Run watcher inside SSR context, similar to events
                    runWithContext(context, () => {
                        fn()
                    })
                } else {
                    fn()
                }
            } catch (e) {
                console.error('Error in signal subscriber:', e)
            }
        })
        // Trigger component redraws for affected components
        // This is set up in index.ts after m.redraw is created
        if (redrawCallback) redrawCallback(this)
    }

    /**
     * Subscribe to signal changes
     */
    subscribe(callback: () => void): () => void {
        ;(this._subscribers ??= new Set()).add(callback)
        return () => {
            if (this._subscribers) {
                this._subscribers.delete(callback)
            }
        }
    }

    /**
     * Watch signal changes (convenience method)
     */
    watch(callback: (newValue: T, oldValue: T) => void): () => void {
        let oldValue = this._value
        const unsubscribe = this.subscribe(() => {
            const newValue = this._value
            callback(newValue, oldValue)
            oldValue = newValue
        })
        return unsubscribe
    }

    /**
     * Peek at value without subscribing
     */
    peek(): T {
        return this._value
    }
}

/**
 * Computed signal - automatically recomputes when dependencies change
 */
export class ComputedSignal<T> extends Signal<T> {
    private _compute: () => T
    private _isDirty = true
    private _cachedValue!: T
    // One closure for the computed's whole life: a dependency holds its subscribers in a Set, so
    // re-subscribing on every recompute is a no-op instead of another entry the Set keeps (and that
    // a notification in progress would also visit).
    private _markDirtyEffect = () => {
        this._markDirty()
    }

    constructor(compute: () => T) {
        super(null as T) // Will be computed on first access
        this._compute = compute
    }

    override get value(): T {
        // Track access by other computed signals - this enables computed-to-computed dependency chains
        // When computed B accesses computed A, A should notify B when A's dependencies change
        if (currentEffect) {
            ;(this._subscribers ??= new Set()).add(currentEffect)
        }
        // A component reading this computed redraws when it goes dirty, whether or not this read
        // recomputes it: a cached read touches none of the dependencies.
        if (currentComponent) {
            trackComponentSignal(currentComponent, this)
        }

        if (this._isDirty) {
            // The dependencies the computation reads mark this computed dirty; the component reading
            // it is tracked on the computed above, not on them.
            const previousEffect = currentEffect
            const previousComponent = currentComponent
            currentEffect = this._markDirtyEffect
            currentComponent = null

            try {
                this._cachedValue = this._compute()
            } finally {
                currentEffect = previousEffect
                currentComponent = previousComponent
            }

            this._isDirty = false
        }
        return this._cachedValue
    }

    private _markDirty() {
        if (!this._isDirty) {
            this._isDirty = true
            // Notify subscribers that computed value changed
            const subscribers = this._subscribers
            const context = subscribers && subscribers.size > 0 ? getSSRContext() : undefined
            subscribers?.forEach((fn: () => void) => {
                try {
                    if (context) {
                        // Run watcher inside SSR context, similar to events
                        runWithContext(context, () => {
                            fn()
                        })
                    } else {
                        fn()
                    }
                } catch (e) {
                    console.error('Error in computed signal subscriber:', e)
                }
            })
            if (redrawCallback) redrawCallback(this)
        }
    }

    /**
     * The current value, without subscribing the running effect or component: computes it when a
     * dependency changed. The base class's `_value` is never set on a computed.
     */
    override peek(): T {
        const previousEffect = currentEffect
        const previousComponent = currentComponent
        currentEffect = null
        currentComponent = null
        try {
            return this.value
        } finally {
            currentEffect = previousEffect
            currentComponent = previousComponent
        }
    }

    /**
     * Calls back when a dependency changes. Reading the value there recomputes it, which also lets the
     * next change notify again: a computed only notifies on going from clean to dirty.
     */
    override watch(callback: (newValue: T, oldValue: T) => void): () => void {
        let oldValue = this.peek()
        return this.subscribe(() => {
            const newValue = this.peek()
            callback(newValue, oldValue)
            oldValue = newValue
        })
    }

    /**
     * Mark this computed as dirty so it will recompute on next value access.
     * Used by the state layer when opening the deferred-computed gate (allowComputed).
     */
    markDirty(): void {
        this._markDirty()
    }

    override set value(_newValue: T) {
        throw new Error('Computed signals are read-only')
    }
}

/**
 * Create a signal
 */
export function signal<T>(initial: T): Signal<T> {
    return new Signal(initial)
}

/**
 * Create a computed signal
 */
export function computed<T>(compute: () => T): ComputedSignal<T> {
    return new ComputedSignal(compute)
}

/**
 * Create an effect that runs when dependencies change
 */
export function effect(fn: () => void): () => void {
    const previousEffect = currentEffect
    let cleanup: (() => void) | null = null
    let isActive = true

    const effectFn = () => {
        if (!isActive) return

        // Run cleanup if exists
        if (cleanup) {
            try {
                cleanup()
            } catch (e) {
                console.error('Error in effect cleanup:', e)
            }
            cleanup = null
        }

        // Track dependencies
        currentEffect = effectFn
        try {
            const result = fn()
            // If fn returns a cleanup function, store it
            if (typeof result === 'function') {
                cleanup = result
            }
        } catch (e) {
            console.error('Error in effect:', e)
        } finally {
            currentEffect = previousEffect
        }
    }

    // Run effect immediately
    effectFn()

    // Return cleanup function
    return () => {
        isActive = false
        if (cleanup) {
            try {
                cleanup()
            } catch (e) {
                console.error('Error in effect cleanup:', e)
            }
        }
        // Note: We can't unsubscribe from signals here because we don't track them
        // This is a limitation - in a full implementation, we'd track signal subscriptions
    }
}
