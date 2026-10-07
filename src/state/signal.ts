// Core signal primitive for fine-grained reactivity

import {getSSRContext, runWithContext} from '../ssr/context'

/**
 * A subscriber returns DROP to be removed from the set it was called from: a computed's weak
 * subscription does once the computed has been collected.
 */
const DROP = Symbol('drop subscriber')
// Marks a computed's subscription on its dependencies, which doesn't keep the computed alive. A tag
// rather than a WeakSet entry: adding one costs about six times as much, once per computed.
const WEAK = Symbol('weak subscriber')
type Subscriber = (() => unknown) & {[WEAK]?: true}

// Current effect context for dependency tracking
let currentEffect: Subscriber | null = null
/**
 * The signals an effect or computation read on its last run, overwritten in place by the next run so
 * it can unsubscribe from the ones it no longer reads. A run usually reads the same signals in the
 * same order, so a read only compares with the entry at its position; what a run displaces is kept
 * aside and checked once it ends.
 */
class Sources {
    private items: Signal<unknown>[] = []
    private cursor = 0
    private displaced: Signal<unknown>[] | null = null

    begin(): void {
        this.cursor = 0
        this.displaced = null
    }

    record(source: Signal<unknown>): void {
        const i = this.cursor
        const items = this.items
        // A repeat of the previous read, as in a loop over one signal, isn't recorded again.
        if (i > 0 && items[i - 1] === source) return
        if (i < items.length) {
            const previous = items[i]!
            if (previous !== source) {
                ;(this.displaced ??= []).push(previous)
                items[i] = source
            }
        } else {
            items.push(source)
        }
        this.cursor = i + 1
    }

    /**
     * Unsubscribes from what the run displaced and didn't read anywhere else. Only removals:
     * re-adding to a set a notification may be walking would visit it again.
     */
    end(subscriber: Subscriber): void {
        const items = this.items
        if (this.cursor < items.length) {
            const unread = items.splice(this.cursor)
            if (this.displaced) for (const source of unread) this.displaced.push(source)
            else this.displaced = unread
        }
        if (this.displaced) {
            const kept = new Set(items)
            for (const source of this.displaced) if (!kept.has(source)) source._unsubscribe(subscriber)
            this.displaced = null
        }
    }

    /** Unsubscribes from everything, as a disposed effect does. */
    clear(subscriber: Subscriber): void {
        for (const source of this.items) source._unsubscribe(subscriber)
        this.items = []
        this.cursor = 0
    }
}

// The sources of the running effect or computation.
let currentSources: Sources | null = null

// Computeds a watcher or effect observes. A dependency holds a computed only weakly, so an observed
// one is kept here: dropping every other reference must not silence its observers.
const observedComputeds = new Set<ComputedSignal<unknown>>()

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

/** Runs a subscriber in the SSR context, if any, and removes it when it asks to be dropped. */
function notify(subscribers: Set<Subscriber> | null, label: string): void {
    const context = subscribers && subscribers.size > 0 ? getSSRContext() : undefined
    subscribers?.forEach((fn) => {
        try {
            if ((context ? runWithContext(context, fn) : fn()) === DROP) subscribers.delete(fn)
        } catch (e) {
            console.error(label, e)
        }
    })
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
    _subscribers: Set<Subscriber> | null = null

    constructor(initial: T) {
        this._value = initial
    }

    get value(): T {
        // Track access during render/effect
        if (currentEffect) {
            ;(this._subscribers ??= new Set()).add(currentEffect)
            currentSources?.record(this)
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
        notify(this._subscribers, 'Error in signal subscriber:')
        // Trigger component redraws for affected components
        // This is set up in index.ts after m.redraw is created
        if (redrawCallback) redrawCallback(this)
    }

    /**
     * Subscribe to signal changes
     */
    subscribe(callback: () => void): () => void {
        ;(this._subscribers ??= new Set()).add(callback)
        this._subscribersChanged()
        return () => {
            this._unsubscribe(callback)
        }
    }

    /** Internal: removes a subscriber, as an effect does from a signal it no longer reads. */
    _unsubscribe(callback: Subscriber): void {
        if (this._subscribers?.delete(callback)) this._subscribersChanged()
    }

    /** Internal: lets a computed note whether anything still observes it. */
    protected _subscribersChanged(): void {}

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
    // The signals the last computation read. Created on the first computation, like the subscription
    // below: state() makes a computed for every function property, read or not.
    private _sources: Sources | null = null
    // The subscription the computed holds on its dependencies. One closure for its whole life, so
    // re-subscribing on a recompute is a no-op rather than another Set entry. It holds the computed
    // only weakly: a dependency must not keep alive a computed nothing else uses.
    private _markDirtyEffect: Subscriber | null = null

    constructor(compute: () => T) {
        super(null as T) // Will be computed on first access
        this._compute = compute
    }

    private _createMarkDirtyEffect(): Subscriber {
        const self = new WeakRef<ComputedSignal<T>>(this)
        const markDirty: Subscriber = () => {
            const computed = self.deref()
            if (computed === undefined) return DROP
            computed._markDirty()
            return undefined
        }
        markDirty[WEAK] = true
        return markDirty
    }

    override get value(): T {
        // Track access by other computed signals - this enables computed-to-computed dependency chains
        // When computed B accesses computed A, A should notify B when A's dependencies change
        if (currentEffect) {
            ;(this._subscribers ??= new Set()).add(currentEffect)
            currentSources?.record(this)
            if (!currentEffect[WEAK]) observedComputeds.add(this)
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
            const previousSources = currentSources
            const previousComponent = currentComponent
            const sources = (this._sources ??= new Sources())
            const markDirtyEffect = (this._markDirtyEffect ??= this._createMarkDirtyEffect())
            sources.begin()
            currentEffect = markDirtyEffect
            currentSources = sources
            currentComponent = null

            try {
                this._cachedValue = this._compute()
            } finally {
                currentEffect = previousEffect
                currentSources = previousSources
                currentComponent = previousComponent
            }
            sources.end(markDirtyEffect)

            this._isDirty = false
        }
        return this._cachedValue
    }

    private _markDirty() {
        if (!this._isDirty) {
            this._isDirty = true
            notify(this._subscribers, 'Error in computed signal subscriber:')
            if (redrawCallback) redrawCallback(this)
        }
    }

    /**
     * The current value, without subscribing the running effect or component: computes it when a
     * dependency changed. The base class's `_value` is never set on a computed.
     */
    protected override _subscribersChanged(): void {
        let observed = false
        if (this._subscribers) {
            for (const subscriber of this._subscribers) {
                if (!subscriber[WEAK]) {
                    observed = true
                    break
                }
            }
        }
        if (observed) observedComputeds.add(this)
        else observedComputeds.delete(this)
    }

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
    let cleanup: (() => void) | null = null
    let isActive = true
    // The signals the last run read, so the next run (and disposal) can unsubscribe from them.
    const sources = new Sources()

    const effectFn = (): unknown => {
        if (!isActive) return DROP

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
        const previousEffect = currentEffect
        const previousSources = currentSources
        sources.begin()
        currentEffect = effectFn
        currentSources = sources
        try {
            const result: unknown = fn()
            // If fn returns a cleanup function, store it
            if (typeof result === 'function') {
                cleanup = result as () => void
            }
        } catch (e) {
            console.error('Error in effect:', e)
        } finally {
            currentEffect = previousEffect
            currentSources = previousSources
        }
        sources.end(effectFn)
        return undefined
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
        sources.clear(effectFn)
    }
}
