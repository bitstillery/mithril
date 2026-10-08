import Vnode from './render/vnode'
import {getSignalComponents, isRedrawnBy, type Signal} from './state/signal'
import {getStateMaps} from './render/render'

import type {ComponentType, Children, RenderRoot, RenderVnode, Vnode as VnodeType} from './render/vnode'

export interface Render {
    (root: Element, vnodes: Children | VnodeType | null, redraw?: () => void): void
    /** Re-renders a mounted component vnode in place; false when it can't, so the caller redraws more. */
    component?: (vnode: RenderVnode, redraw?: () => void) => boolean
}

/** A component to redraw is given by the component, or by the state of a vnode it rendered. */
export interface Redraw {
    (component?: object): void
    sync(): void
    signal?: (signal: Signal<unknown>) => void
    /** Redraws several components in one pass, grouped by parent element. */
    redrawComponents?: (components: Set<object>) => void
}

export interface Mount {
    (root: Element, component: ComponentType | null): void
}

interface Schedule {
    (fn: () => void): void
}

interface Console {
    error: (e: unknown) => void
}

interface MountRedraw {
    mount: Mount
    redraw: Redraw
}

export default function mountRedrawFactory(render: Render, schedule: Schedule, console: Console): MountRedraw {
    const subscriptions: Array<Element | ComponentType> = []
    const componentToElement = new WeakMap<object, Element>()
    let pending = false
    let offset = -1

    function sync() {
        for (offset = 0; offset < subscriptions.length; offset += 2) {
            try {
                render(
                    subscriptions[offset] as Element,
                    Vnode(subscriptions[offset + 1] as ComponentType, null, null, null, null, null),
                    redraw,
                )
            } catch (e) {
                console.error(e)
            }
        }
        offset = -1
    }

    function renderInPlace(vnode: RenderVnode | undefined): boolean {
        if (vnode == null || render.component == null) return false
        try {
            return render.component(vnode, redraw)
        } catch (e) {
            console.error(e)
            return false
        }
    }

    function redrawComponent(componentOrState: object) {
        // componentOrState might be vnode.state (from signal tracking) or component object
        // Try to find the actual component object if it's vnode.state
        const {stateToComponentMap, stateToDomMap, stateToVnodeMap} = getStateMaps()
        const resolved = stateToComponentMap.get(componentOrState)
        const component = resolved !== undefined ? resolved : componentOrState

        // First try: find element in componentToElement (for m.mount components)
        // Check this first to ensure synchronous redraws for m.mount components
        const element = componentToElement.get(component)
        if (element) {
            try {
                render(element, Vnode(component as ComponentType, null, null, null, null, null), redraw)
                // If render succeeds, we're done
                return
            } catch (e) {
                console.error(e)
                // If render fails, continue to next check (fall through)
            }
        }

        // Second try: targeted redraw for nested components (stateToDomMap path)
        // Only check this if componentToElement didn't find anything (not an m.mount component)
        const nestedElement = stateToDomMap.get(componentOrState)
        if (nestedElement !== undefined) {
            const vnodeInfo = stateToVnodeMap.get(componentOrState)
            if (renderInPlace(vnodeInfo)) return
            if (nestedElement?.isConnected && component != null && vnodeInfo != null) {
                const parent = nestedElement.parentElement
                const oldVnodes = parent != null ? (parent as RenderRoot).vnodes : null
                if (parent != null && Array.isArray(oldVnodes) && oldVnodes.length > 0) {
                    const i = oldVnodes.findIndex((v) => v?.state === componentOrState)
                    if (i >= 0) {
                        const {key, attrs} = vnodeInfo
                        const newVnodes = [...oldVnodes]
                        newVnodes[i] = Vnode(component as ComponentType, key ?? null, attrs ?? null, null, null, null)
                        try {
                            render(parent, newVnodes, redraw)
                            return
                        } catch (e) {
                            console.error(e)
                            // Fall through to full sync on error
                        }
                    }
                }
            }
            // Fallback: full sync for RouterRoot correctness or when targeted path fails
            if (!pending) {
                pending = true
                schedule(function () {
                    pending = false
                    sync()
                })
                return
            }
        }

        // Third try: find element in subscriptions
        const index = subscriptions.indexOf(component as ComponentType)
        if (index >= 0 && index % 2 === 1) {
            const rootElement = subscriptions[index - 1] as Element
            try {
                render(rootElement, Vnode(component as ComponentType, null, null, null, null, null), redraw)
                // If render succeeds, we're done
                return
            } catch (e) {
                console.error(e)
                // If render fails, continue to fallback (fall through)
            }
        }

        // Final fallback: component not found - trigger global redraw
        // This handles edge cases where component tracking failed
        if (!pending) {
            pending = true
            schedule(function () {
                pending = false
                sync()
            })
        }
    }

    function redrawComponents(components: Set<object>) {
        const {stateToComponentMap, stateToDomMap, stateToVnodeMap} = getStateMaps()
        const mountRoots: object[] = []
        const nested = new Set<object>()

        for (const c of components) {
            const component = stateToComponentMap.get(c) ?? c
            if (componentToElement.get(component)) {
                mountRoots.push(c)
            } else if (!renderInPlace(stateToVnodeMap.get(c))) {
                nested.add(c)
            }
        }

        for (const c of mountRoots) {
            redrawComponent(c)
        }

        if (nested.size === 0) return

        // Group nested components by parent element
        const parentToStates = new Map<Element, Set<object>>()
        for (const state of nested) {
            const el = stateToDomMap.get(state)
            const parent = el?.parentElement
            if (!parent || !el?.isConnected) {
                // Can't do targeted redraw, fall back to full sync
                if (!pending) {
                    pending = true
                    schedule(function () {
                        pending = false
                        sync()
                    })
                }
                return
            }
            let set = parentToStates.get(parent)
            if (!set) {
                set = new Set()
                parentToStates.set(parent, set)
            }
            set.add(state)
        }

        for (const [parent, states] of parentToStates) {
            const oldVnodes = (parent as RenderRoot).vnodes
            if (!Array.isArray(oldVnodes) || oldVnodes.length === 0) {
                if (!pending) {
                    pending = true
                    schedule(function () {
                        pending = false
                        sync()
                    })
                }
                return
            }

            const newVnodes = [...oldVnodes]
            let allFound = true
            for (const state of states) {
                const i = oldVnodes.findIndex((v) => v?.state === state)
                if (i < 0) {
                    allFound = false
                    break
                }
                const component = stateToComponentMap.get(state) ?? state
                const vnodeInfo = stateToVnodeMap.get(state)
                if (!vnodeInfo) {
                    allFound = false
                    break
                }
                const {key, attrs} = vnodeInfo
                newVnodes[i] = Vnode(component as ComponentType, key ?? null, attrs ?? null, null, null, null)
            }

            if (!allFound) {
                if (!pending) {
                    pending = true
                    schedule(function () {
                        pending = false
                        sync()
                    })
                }
                return
            }

            try {
                render(parent, newVnodes, redraw)
            } catch (e) {
                console.error(e)
                if (!pending) {
                    pending = true
                    schedule(function () {
                        pending = false
                        sync()
                    })
                }
            }
        }
    }

    function redraw(component?: object) {
        // Component-level redraw
        if (component !== undefined) {
            redrawComponent(component)
            return
        }

        // Global redraw (backward compatibility)
        if (!pending) {
            pending = true
            schedule(function () {
                pending = false
                sync()
            })
        }
    }

    redraw.sync = sync
    redraw.redrawComponents = redrawComponents

    // Export function to redraw components affected by signal changes
    redraw.signal = function (signal: Signal<unknown>) {
        const components = getSignalComponents(signal)
        if (components) {
            // A copy: each redraw re-registers its component with the signals it reads, which would
            // otherwise add it back to the set being walked.
            for (const component of Array.from(components)) if (isRedrawnBy(component, signal)) redrawComponent(component)
        }
    }

    function mount(root: Element, component: ComponentType | null) {
        if (component != null && (component as {view?: unknown}).view == null && typeof component !== 'function') {
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
