import {describe, test, expect, beforeEach, afterEach, spyOn} from 'bun:test'

import type {Mock} from 'bun:test'

import {state} from '../../src/state/state'
import {logger} from '../../src/log/logger'
import m, {MithrilComponent} from '../../src/index'
import domMock from '../helpers/dom_mock'

const task = () => new Promise((resolve) => setTimeout(resolve, 0))
const frames = (n: number) => new Promise((resolve) => setTimeout(resolve, 16 * n + 8))

describe('signal redraws that never settle', () => {
    let $window: any
    let root: Element
    let warn: Mock<typeof logger.warn>

    beforeEach(() => {
        $window = domMock()
        globalThis.window = $window
        // Connected, so a nested component is redrawn in place: microtask after microtask, as in a browser.
        root = $window.document.createElement('div')
        $window.document.body.appendChild(root)
        warn = spyOn(logger, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        m.mount(root, null)
        warn.mockRestore()
    })

    test('a view that writes state it read yields to the browser and is warned about once', async () => {
        const collection = {state: state({items: [] as number[], other: 0})}
        let renders = 0
        let looping = true
        class OrderTable extends MithrilComponent {
            view() {
                renders++
                if (looping) collection.state.items.splice(0, collection.state.items.length, 1, 2)
                return m(
                    'ul',
                    collection.state.items.map((i) => m('li', i)),
                )
            }
        }
        m.mount(root, {view: () => m('main', m('section', m(OrderTable)), m('p', collection.state.other))})
        const mounted = renders

        collection.state.other = 1
        await task()
        // Bounded within the task instead of running until the tab is killed.
        expect(renders - mounted).toBeLessThanOrEqual(12)

        const afterTask = renders
        await frames(3)
        expect(renders - afterTask).toBeLessThanOrEqual(5)

        const loopWarnings = warn.mock.calls.filter(([message]) => message.includes('without the browser painting'))
        expect(loopWarnings.length).toBe(1)
        expect(loopWarnings[0]![0]).toContain('OrderTable')

        looping = false
        await frames(3)
        const settled = renders
        await frames(3)
        expect(renders).toBe(settled)
    })

    test('a throttled component redraws normally again once it stops looping', async () => {
        const s = state({items: [] as number[], label: 'a'})
        let looping = true
        let renders = 0
        class Looper extends MithrilComponent {
            view() {
                renders++
                if (looping) s.items.splice(0, s.items.length, renders)
                return m('span', s.label)
            }
        }
        m.mount(root, {view: () => m('main', m('section', m(Looper)))})
        s.label = 'b'
        await task()
        looping = false
        await frames(4)

        const before = renders
        s.label = 'c'
        await task()
        expect(renders).toBe(before + 1)
        expect(root.childNodes[0]!.childNodes[0]!.childNodes[0]!.childNodes[0]!.nodeValue).toBe('c')
    })

    test('a burst of separate writes is not throttled', async () => {
        const s = state({count: 0})
        let renders = 0
        class Counter extends MithrilComponent {
            view() {
                renders++
                return m('span', s.count)
            }
        }
        m.mount(root, {view: () => m('main', m('section', m(Counter)))})
        const mounted = renders
        for (let i = 1; i <= 8; i++) {
            s.count = i
            await Promise.resolve()
            await Promise.resolve()
        }
        expect(renders - mounted).toBe(8)
        expect(warn).not.toHaveBeenCalled()
    })

    test('a view writing state other components read is warned about', async () => {
        const s = state({seen: 0, other: 0})
        class Writer extends MithrilComponent {
            view() {
                s.seen = s.other + 1
                return m('i')
            }
        }
        class Reader extends MithrilComponent {
            view() {
                return m('b', s.seen)
            }
        }
        m.mount(root, {view: () => m('main', m('section', m(Reader)), m('section', m(Writer)), m('p', s.other))})
        s.other = 1
        await task()
        const messages = warn.mock.calls.map(([message]) => message)
        expect(messages.some((message) => message.startsWith("Writer's view wrote state other components read"))).toBe(true)
    })
})

describe('signal redraws a render already covered', () => {
    let $window: any
    let root: Element

    beforeEach(() => {
        $window = domMock()
        globalThis.window = $window
        root = $window.document.createElement('div')
        $window.document.body.appendChild(root)
    })

    afterEach(() => {
        m.mount(root, null)
    })

    test("a child reading what its parent's view wrote renders once per parent render", async () => {
        const s = state({rows: [] as number[], tick: 0})
        let childRenders = 0
        class Rows extends MithrilComponent {
            view() {
                childRenders++
                return m(
                    'ul',
                    s.rows.map((row) => m('li', row)),
                )
            }
        }
        class Page extends MithrilComponent {
            view() {
                s.$rows.value = [s.tick]
                return m('div', m(Rows))
            }
        }
        const warn = spyOn(logger, 'warn').mockImplementation(() => {})
        m.mount(root, {view: () => m('main', m(Page))})
        expect(childRenders).toBe(1)

        s.tick = 1
        await task()
        expect(childRenders).toBe(2)
        warn.mockRestore()
    })

    test('state written right before a synchronous redraw renders once', async () => {
        const s = state({count: 0})
        let renders = 0
        class Counter extends MithrilComponent {
            view() {
                renders++
                return m('span', s.count)
            }
        }
        m.mount(root, {view: () => m('main', m('section', m(Counter)))})
        expect(renders).toBe(1)

        s.count = 1
        m.redraw.sync()
        await task()
        expect(renders).toBe(2)
        expect(root.childNodes[0]!.childNodes[0]!.childNodes[0]!.childNodes[0]!.nodeValue).toBe('1')

        s.count = 2
        await task()
        expect(renders).toBe(3)
    })
})
