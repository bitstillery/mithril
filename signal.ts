// Core signal primitive for fine-grained reactivity

// Current effect context for dependency tracking
let currentEffect: (() => void) | null = null

// Component-to-signal dependency tracking
const componentSignalMap = new WeakMap<any, Set<Signal<any>>>()
const signalComponentMap = new WeakMap<Signal<any>, Set<any>>()

// Current component context for component-to-signal dependency tracking
let currentComponent: any = null

export function setCurrentComponent(component: any) {
	currentComponent = component
}

export function clearCurrentComponent() {
	currentComponent = null
}

export function getCurrentComponent() {
	return currentComponent
}

export function trackComponentSignal(component: any, signal: Signal<any>) {
	if (!componentSignalMap.has(component)) {
		componentSignalMap.set(component, new Set())
	}
	componentSignalMap.get(component)!.add(signal)

	if (!signalComponentMap.has(signal)) {
		signalComponentMap.set(signal, new Set())
	}
	signalComponentMap.get(signal)!.add(component)
}

export function getComponentSignals(component: any): Set<Signal<any>> | undefined {
	return componentSignalMap.get(component)
}

export function getSignalComponents(signal: Signal<any>): Set<any> | undefined {
	return signalComponentMap.get(signal)
}

export function clearComponentDependencies(component: any) {
	const signals = componentSignalMap.get(component)
	if (signals) {
		signals.forEach(signal => {
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

// Set up callback for signal-to-component redraw integration
export function setSignalRedrawCallback(callback: (signal: Signal<any>) => void) {
	(signal as any).__redrawCallback = callback
}

/**
 * Signal class - reactive primitive that tracks subscribers
 */
export class Signal<T> {
	private _value: T
	private _subscribers: Set<() => void> = new Set()

	constructor(initial: T) {
		this._value = initial
	}

	get value(): T {
		// Track access during render/effect
		if (currentEffect) {
			this._subscribers.add(currentEffect)
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
			// Notify all subscribers
			this._subscribers.forEach(fn => {
				try {
					fn()
				} catch(e) {
					console.error('Error in signal subscriber:', e)
				}
			})
			// Trigger component redraws for affected components
			// This is set up in index.ts after m.redraw is created
			if ((signal as any).__redrawCallback) {
				;(signal as any).__redrawCallback(this)
			}
		}
	}

	/**
	 * Subscribe to signal changes
	 */
	subscribe(callback: () => void): () => void {
		this._subscribers.add(callback)
		return () => {
			this._subscribers.delete(callback)
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
	private _dependencies: Set<Signal<any>> = new Set()
	private _isDirty = true
	private _cachedValue!: T

	constructor(compute: () => T) {
		super(null as any) // Will be computed on first access
		this._compute = compute
	}

	get value(): T {
		if (this._isDirty) {
			// Clear old dependencies
			this._dependencies.forEach(dep => {
				dep.subscribe(() => this._markDirty())?.() // Unsubscribe old
			})
			this._dependencies.clear()

			// Track dependencies during computation
			const previousEffect = currentEffect
			currentEffect = () => {
				this._markDirty()
			}

			try {
				this._cachedValue = this._compute()
				// Re-subscribe to new dependencies
				// Dependencies are tracked via the compute function accessing signals
			} finally {
				currentEffect = previousEffect
			}

			this._isDirty = false
		}
		return this._cachedValue
	}

	private _markDirty() {
		if (!this._isDirty) {
			this._isDirty = true
			// Notify subscribers that computed value changed
			;(this as any)._subscribers.forEach((fn: () => void) => {
				try {
					fn()
				} catch(e) {
					console.error('Error in computed signal subscriber:', e)
				}
			})
		}
	}

	set value(_newValue: T) {
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
			} catch(e) {
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
		} catch(e) {
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
			} catch(e) {
				console.error('Error in effect cleanup:', e)
			}
		}
		// Note: We can't unsubscribe from signals here because we don't track them
		// This is a limitation - in a full implementation, we'd track signal subscriptions
	}
}
