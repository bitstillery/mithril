import Vnode from "../render/vnode.js"
import type { ComponentType } from "../index.js"

interface Render {
	(root: Element, vnodes: any, redraw?: () => void): void
}

interface Schedule {
	(fn: () => void): void
}

interface Console {
	error: (e: any) => void
}

interface MountRedraw {
	mount: (root: Element, component: ComponentType | null) => void
	redraw: (() => void) & {sync: () => void}
}

export default function mountRedrawFactory(render: Render, schedule: Schedule, console: Console): MountRedraw {
	const subscriptions: Array<Element | ComponentType> = []
	let pending = false
	let offset = -1

	function sync() {
		for (offset = 0; offset < subscriptions.length; offset += 2) {
			try { render(subscriptions[offset] as Element, Vnode(subscriptions[offset + 1] as ComponentType), redraw) }
			catch (e) { console.error(e) }
		}
		offset = -1
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root: Element, component: ComponentType | null) {
		if (component != null && (component as any).view == null && typeof component !== "function") {
			throw new TypeError("m.mount expects a component, not a vnode.")
		}

		const index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			if (index <= offset) offset -= 2
			render(root, [])
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}
