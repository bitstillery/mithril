import {describe, test, expect, beforeEach} from 'bun:test'

import {signal, computed, getSignalComponents} from '../../src/state/signal'
import {state, watch} from '../../src/state/state'
import m from '../../src/index'
import domMock from '../helpers/dom_mock'
import throttleMock from '../helpers/throttle_mock'

describe('Signal Integration - Component Redraws', () => {
    let $window: any
    let root: Element
    let mockThrottle: any

    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        mockThrottle = throttleMock()
        // Override requestAnimationFrame to use throttleMock
        $window.requestAnimationFrame = mockThrottle.schedule
        if (typeof global !== 'undefined') {
            global.window = $window
            global.requestAnimationFrame = mockThrottle.schedule
        }
    })

    test('component redraws when signal changes', async () => {
        const s = signal(0)
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                return m('div', s.value)
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('0')

        s.value = 10
        await m.nextTick() // Wait for batched redraw microtask
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('10')
    })

    test('only affected component redraws (fine-grained)', async () => {
        const s1 = signal(0)
        const s2 = signal('a')

        let renderCount1 = 0
        let renderCount2 = 0

        const Component1 = {
            view() {
                renderCount1++
                return m('div', s1.value)
            },
        }

        const Component2 = {
            view() {
                renderCount2++
                return m('div', s2.value)
            },
        }

        const root1 = $window.document.createElement('div')
        const root2 = $window.document.createElement('div')

        m.mount(root1, Component1)
        m.mount(root2, Component2)

        expect(renderCount1).toBe(1)
        expect(renderCount2).toBe(1)

        // Change s1 - only Component1 should redraw
        s1.value = 10
        await m.nextTick()
        expect(renderCount1).toBe(2)
        expect(renderCount2).toBe(1) // Should not redraw

        // Change s2 - only Component2 should redraw
        s2.value = 'b'
        await m.nextTick()
        expect(renderCount1).toBe(2) // Should not redraw again
        expect(renderCount2).toBe(2)
    })

    test('component cleanup removes signal dependencies', () => {
        const s = signal(0)
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                return m('div', s.value)
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)

        // Unmount component
        m.mount(root, null)

        // Change signal - component should not redraw
        s.value = 10
        expect(renderCount).toBe(1) // Should still be 1
    })

    test('multiple components can use same signal', async () => {
        const s = signal(0)

        let renderCount1 = 0
        let renderCount2 = 0

        const Component1 = {
            view() {
                renderCount1++
                return m('div', `C1: ${s.value}`)
            },
        }

        const Component2 = {
            view() {
                renderCount2++
                return m('div', `C2: ${s.value}`)
            },
        }

        const root1 = $window.document.createElement('div')
        const root2 = $window.document.createElement('div')

        m.mount(root1, Component1)
        m.mount(root2, Component2)

        expect(renderCount1).toBe(1)
        expect(renderCount2).toBe(1)

        // Change signal - both should redraw (batched; merged targeted or full sync)
        s.value = 10
        await m.nextTick()
        mockThrottle.fire() // Run any scheduled sync (old path); no-op when merged targeted redraw runs inline
        expect(renderCount1).toBe(2)
        expect(renderCount2).toBe(2)
    })

    test('computed signal triggers component redraw', async () => {
        const a = signal(1)
        const b = signal(2)
        const sum = computed(() => a.value + b.value)

        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                return m('div', sum.value)
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('3')

        // Change dependency - component should redraw (batched)
        a.value = 10
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('12')
    })

    test('m.redraw.signal redraws each mounted component that read the signal once', () => {
        const count = signal(0)
        const renders = {a: 0, b: 0}
        const counter = (name: 'a' | 'b') => ({
            view() {
                renders[name]++
                return m('span', String(count.value))
            },
        })
        const otherRoot = $window.document.createElement('div')
        m.mount(root, counter('a'))
        m.mount(otherRoot, counter('b'))
        m.redraw.signal!(count)
        expect(renders).toEqual({a: 2, b: 2})
        m.mount(otherRoot, null)
    })

    test('a component is not redrawn by a signal its last render no longer read', async () => {
        const showCount = signal(true)
        const count = signal(0)
        let renderCount = 0
        m.mount(root, {
            view() {
                renderCount++
                return m('div', showCount.value ? String(count.value) : 'hidden')
            },
        })

        showCount.value = false
        await m.nextTick()
        expect(renderCount).toBe(2)

        count.value = 1
        await m.nextTick()
        expect(renderCount).toBe(2)

        showCount.value = true
        await m.nextTick()
        expect(renderCount).toBe(3)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('1')
    })

    test('a signal read repeatedly between other reads redraws once, until no render reads it', async () => {
        const items = signal([1, 2, 3])
        const label = signal('a')
        const showLabel = signal(true)
        let renderCount = 0
        m.mount(root, {
            view() {
                renderCount++
                return m(
                    'ul',
                    items.value.map((item) => m('li', showLabel.value ? `${label.value}${item}` : String(item))),
                )
            },
        })
        expect(root.childNodes[0]!.childNodes[2]!.childNodes[0]!.nodeValue).toBe('a3')

        label.value = 'b'
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.childNodes[0]!.nodeValue).toBe('b1')

        showLabel.value = false
        await m.nextTick()
        expect(renderCount).toBe(3)

        label.value = 'c'
        await m.nextTick()
        expect(renderCount).toBe(3)
    })

    test('a view that writes state before reading it does not redraw itself', async () => {
        const s = state({items: [1, 2, 3] as number[], other: 0})
        let renderCount = 0
        m.mount(root, {
            view() {
                renderCount++
                if (renderCount > 20) return m('div', 'runaway')
                s.$items.value = [1, 2, 3]
                return m('div', `${s.items.length}-${s.other}`)
            },
        })

        s.other = 1
        for (let i = 0; i < 5; i++) await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('3-1')

        // Written outside a render, the same signal still redraws the component that read it.
        s.$items.value = [1, 2]
        for (let i = 0; i < 5; i++) await m.nextTick()
        expect(renderCount).toBe(3)
    })

    test('a view that renders another tree keeps tracking what it reads afterwards', async () => {
        const before = signal(0)
        const after = signal(0)
        const inner = signal(0)
        const otherRoot = $window.document.createElement('div')
        let outerRenders = 0
        let innerRenders = 0
        const Inner = {
            view() {
                innerRenders++
                return m('i', inner.value)
            },
        }
        m.mount(root, {
            view() {
                outerRenders++
                const first = before.value
                m.render(otherRoot, m(Inner))
                return m('div', `${first}-${after.value}`)
            },
        })
        expect(outerRenders).toBe(1)

        after.value = 1
        await m.nextTick()
        expect(outerRenders).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('0-1')

        before.value = 1
        await m.nextTick()
        expect(outerRenders).toBe(3)

        // Each signal links only the component whose view read it.
        expect(innerRenders).toBe(3)
        const [outerState] = getSignalComponents(after)!
        const [innerState] = getSignalComponents(inner)!
        expect(getSignalComponents(after)!.size).toBe(1)
        expect(getSignalComponents(inner)!.size).toBe(1)
        expect(outerState).not.toBe(innerState)
        expect(getSignalComponents(before)!.has(outerState!)).toBe(true)
    })

    test('computed already cached when a component reads it still redraws the component', async () => {
        const a = signal(1)
        const doubled = computed(() => a.value * 2)
        expect(doubled.value).toBe(2) // cached before any component reads it

        let renderCount = 0
        m.mount(root, {
            view() {
                renderCount++
                return m('div', doubled.value)
            },
        })
        expect(renderCount).toBe(1)

        a.value = 5
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('10')
    })
})

describe('Store Integration - Component Redraws', () => {
    let $window: any
    let root: Element
    let mockThrottle: any

    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        mockThrottle = throttleMock()
        $window.requestAnimationFrame = mockThrottle.schedule
        if (typeof global !== 'undefined') {
            global.window = $window
            global.requestAnimationFrame = mockThrottle.schedule
        }
    })

    test('component redraws when state property changes', async () => {
        const $s = state({count: 0}, 'signalIntegration.stateProperty')
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                return m('div', $s.count)
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('0')

        $s.count = 10
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('10')
    })

    test('component redraws when nested state property changes', async () => {
        const $s = state(
            {
                user: {
                    name: 'John',
                },
            },
            'signalIntegration.nestedStateProperty',
        )
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                return m('div', $s.user.name)
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('John')

        $s.user.name = 'Jane'
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('Jane')
    })

    test('component redraws when new key is added to nested object', async () => {
        const $s = state(
            {
                form: {} as Record<string, boolean>,
            },
            'signalIntegration.nestedObjectKeyAddition',
        )
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                const keys = Object.keys($s.form)
                return m('div', keys.length > 0 ? keys.join(',') : 'empty')
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('empty')

        // Simulate merge_deep adding keys (e.g. API response)
        $s.form['campaign_a'] = true
        $s.form['campaign_b'] = false
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('campaign_a,campaign_b')
    })

    test('component redraws when key is removed from nested object', async () => {
        const $s = state(
            {
                form: {a: true, b: false, c: true} as Record<string, boolean>,
            },
            'signalIntegration.nestedObjectKeyRemoval',
        )
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                const keys = Object.keys($s.form)
                return m('div', keys.join(','))
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('a,b,c')

        delete $s.form['b']
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('a,c')
    })

    test('child watcher on raw nested array signal works without priming accessor read', async () => {
        const $filters = state(
            {
                range: {
                    selection: [0, 100],
                },
            },
            'signalIntegration.rawNestedArrayNoPriming',
        )

        let childWatchCount = 0

        const Child = {
            oncreate(vnode: any) {
                vnode.state.unwatch = watch(vnode.attrs.model, () => {
                    childWatchCount++
                })
            },
            onremove(vnode: any) {
                vnode.state.unwatch?.()
            },
            view(vnode: any) {
                return m(
                    'button',
                    {
                        onclick: () => {
                            vnode.attrs.model.value.splice(0, vnode.attrs.model.value.length, 10, 90)
                        },
                    },
                    'Update',
                )
            },
        }

        const Parent = {
            view() {
                return m('div', [
                    m(Child, {model: $filters.range.$selection}),
                    m('span', `${$filters.range.selection[0]}-${$filters.range.selection[1]}`),
                ])
            },
        }

        m.mount(root, Parent)
        expect(root.childNodes[0]!.childNodes[1]!.childNodes[0]!.nodeValue).toBe('0-100')

        const clickEvent = $window.document.createEvent('MouseEvents')
        clickEvent.initEvent('click', true, true)
        ;(root.childNodes[0]!.childNodes[0] as HTMLButtonElement).dispatchEvent(clickEvent)
        await m.nextTick()

        expect(childWatchCount).toBe(1)
        expect(root.childNodes[0]!.childNodes[1]!.childNodes[0]!.nodeValue).toBe('10-90')
    })

    test('component redraws when computed property changes', async () => {
        const $s = state(
            {
                count: 0,
                doubled: () => $s.count * 2,
            },
            'signalIntegration.computedProperty',
        )
        let renderCount = 0

        const Component = {
            view() {
                renderCount++
                return m('div', $s.doubled)
            },
        }

        m.mount(root, Component)
        expect(renderCount).toBe(1)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('0')

        $s.count = 5
        await m.nextTick()
        expect(renderCount).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.nodeValue).toBe('10')
    })

    test('only component using changed property redraws', async () => {
        const $s = state(
            {
                count: 0,
                name: 'test',
            },
            'signalIntegration.multipleComponents',
        )

        let renderCount1 = 0
        let renderCount2 = 0

        const Component1 = {
            view() {
                renderCount1++
                return m('div', $s.count)
            },
        }

        const Component2 = {
            view() {
                renderCount2++
                return m('div', $s.name)
            },
        }

        const root1 = $window.document.createElement('div')
        const root2 = $window.document.createElement('div')

        m.mount(root1, Component1)
        m.mount(root2, Component2)

        expect(renderCount1).toBe(1)
        expect(renderCount2).toBe(1)

        // Change count - only Component1 should redraw
        $s.count = 10
        await m.nextTick()
        expect(renderCount1).toBe(2)
        expect(renderCount2).toBe(1) // Should not redraw

        // Change name - only Component2 should redraw
        $s.name = 'updated'
        await m.nextTick()
        expect(renderCount1).toBe(2) // Should not redraw again
        expect(renderCount2).toBe(2)
    })
})
