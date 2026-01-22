import Vnode from '../render/vnode'
import {getSignalComponents, type Signal} from '../signal'

import type {ComponentType, Children, Vnode as VnodeType} from '../render/vnode'

export interface Render {
	(root: Element, vnodes: Children | VnodeType | null, redraw?: () => void): void
}

export interface Redraw {
	(component?: ComponentType): void
	sync(): void
	signal?: (signal: Signal<any>) => void
}

export interface Mount {
	(root: Element, component: ComponentType | null): void
}

interface Schedule {
	(fn: () => void): void
}

interface Console {
	error: (e: any) => void
}

interface MountRedraw {
	mount: Mount
	redraw: Redraw
}

export default function mountRedrawFactory(render: Render, schedule: Schedule, console: Console): MountRedraw {
	const subscriptions: Array<Element | ComponentType> = []
	const componentToElement = new WeakMap<ComponentType, Element>()
	let pending = false
	let offset = -1

	function sync() {
		for (offset = 0; offset < subscriptions.length; offset += 2) {
			try { render(subscriptions[offset] as Element, Vnode(subscriptions[offset + 1] as ComponentType, null, null, null, null, null), redraw) }
			catch(e) { console.error(e) }
		}
		offset = -1
	}

	function redrawComponent(componentOrState: ComponentType) {
		// componentOrState might be vnode.state (from signal tracking) or component object
		// Try to find the actual component object if it's vnode.state
		let component = componentOrState
		const stateToComponentMap = (globalThis as any).__mithrilStateToComponent as WeakMap<any, ComponentType> | undefined
		if (stateToComponentMap && stateToComponentMap.has(componentOrState)) {
			component = stateToComponentMap.get(componentOrState)!
		}
		
		const element = componentToElement.get(component)
		if (element) {
			try {
				render(element, Vnode(component, null, null, null, null, null), redraw)
			} catch(e) {
				console.error(e)
			}
		} else {
			// Fallback: find element in subscriptions
			const index = subscriptions.indexOf(component)
			if (index >= 0 && index % 2 === 1) {
				const rootElement = subscriptions[index - 1] as Element
				try {
					render(rootElement, Vnode(component, null, null, null, null, null), redraw)
				} catch(e) {
					console.error(e)
				}
			}
		}
	}

	function redraw(component?: ComponentType) {
		// Component-level redraw
		if (component !== undefined) {
			redrawComponent(component)
			return
		}

		// Global redraw (backward compatibility)
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	// Export function to redraw components affected by signal changes
	;(redraw as any).signal = function(signal: Signal<any>) {
		const components = getSignalComponents(signal)
		if (components) {
			components.forEach(component => {
				redrawComponent(component)
			})
		}
	}

	function mount(root: Element, component: ComponentType | null) {
		if (component != null && (component as any).view == null && typeof component !== 'function') {
			throw new TypeError('m.mount expects a component, not a vnode.')
		}

		const index = subscriptions.indexOf(root)
		if (index >= 0) {
			const oldComponent = subscriptions[index + 1] as ComponentType
			if (oldComponent) {
				componentToElement.delete(oldComponent)
			}
			subscriptions.splice(index, 2)
			if (index <= offset) offset -= 2
			render(root, [])
		}

		if (component != null) {
			subscriptions.push(root, component)
			componentToElement.set(component, root)
			render(root, Vnode(component, null, null, null, null, null), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}
