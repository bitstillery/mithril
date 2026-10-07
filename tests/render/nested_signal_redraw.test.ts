import {describe, test, expect, beforeEach, afterEach} from 'bun:test'

import m, {MithrilComponent, state} from '../../src/index'
import domMock from '../helpers/dom_mock'

import type {Child, Vnode} from '../../src/index'
import type {MockNode, MockWindow} from '../helpers/dom_mock'

interface Row {
    name: string
    count: number
    cells: string[]
}

interface RowState {
    row: Row
}

// `m(Component, attrs)` does not type `key` for a component's attrs, so the attrs declare it.
interface CellAttrs {
    key?: string
    text?: string
}

interface RowAttrs {
    key?: string
    rowState: RowState
}

/**
 * domMock nodes lack `parentElement` and `isConnected`, which the targeted redraw reads; each element
 * gets both, derived from `parentNode` as a browser does.
 */
function connectedDomMock(): MockWindow {
    const $window = domMock()
    const doc = $window.document
    const createElement = doc.createElement.bind(doc)
    doc.createElement = (tag: string) => {
        const element = createElement(tag)
        Object.defineProperties(element, {
            parentElement: {
                get(this: MockNode) {
                    return this.parentNode?.nodeType === 1 ? this.parentNode : null
                },
            },
            isConnected: {
                get(this: MockNode) {
                    let node: MockNode | null = this
                    while (node.parentNode != null) node = node.parentNode
                    return node === doc.documentElement
                },
            },
        })
        return element
    }
    return $window
}

/** A redraw that falls back to a full sync runs on the scheduler (a timer or a frame), not the microtask. */
async function settle(): Promise<void> {
    await m.nextTick()
    await new Promise((resolve) => setTimeout(resolve, 40))
}

describe('signal-driven redraw of components nested in plain elements', () => {
    let renders: Map<string, number>
    let rows: RowState[]
    let root: MockNode
    let frozen: boolean

    class Cell extends MithrilComponent<CellAttrs> {
        view(vnode: Vnode<CellAttrs>) {
            return m('td', vnode.attrs?.text ?? '')
        }
    }

    class TableRow extends MithrilComponent<RowAttrs> {
        override onbeforeupdate() {
            return !frozen
        }
        view(vnode: Vnode<RowAttrs>) {
            const row = vnode.attrs!.rowState.row
            renders.set(row.name, (renders.get(row.name) ?? 0) + 1)
            const cells: Child[] = row.cells.map((text, i) => m(Cell, {key: `c${i}`, text}))
            return m('tr', {class: 'row'}, [
                m('td.name', {key: 'name'}, row.name),
                m('td.count', {key: 'count'}, String(row.count)),
                ...cells,
            ])
        }
    }

    class Table extends MithrilComponent {
        view() {
            return m('div.demo', [
                m('table', [
                    m(
                        'tbody',
                        rows.map((rowState, i) => m(TableRow, {key: `row-${i}`, rowState})),
                    ),
                ]),
            ])
        }
    }

    function cellText(rowIndex: number, cellIndex: number): string {
        const tbody = root.childNodes[0]!.childNodes[0]!.childNodes[0]!
        return tbody.childNodes[rowIndex]!.childNodes[cellIndex]!.childNodes[0]!.nodeValue ?? ''
    }

    beforeEach(() => {
        const $window = connectedDomMock()
        root = $window.document.createElement('div')
        $window.document.body.appendChild(root)
        renders = new Map()
        frozen = false
        rows = Array.from({length: 6}, (_, i) => state({row: {name: `item-${i}`, count: i, cells: ['a', 'b']}}))
    })

    afterEach(() => {
        m.mount(root as unknown as Element, null)
    })

    test('changing one row redraws only that row', async () => {
        m.mount(root as unknown as Element, Table)
        renders.clear()

        rows[2]!.row = {name: 'item-2', count: 42, cells: ['x', 'y']}
        await settle()

        expect(Object.fromEntries(renders)).toEqual({'item-2': 1})
        expect(cellText(2, 1)).toBe('42')
        expect(cellText(2, 2)).toBe('x')
        expect(cellText(3, 1)).toBe('3')
    })

    test('changing several rows in one tick redraws only those rows', async () => {
        m.mount(root as unknown as Element, Table)
        renders.clear()

        rows[0]!.row = {name: 'item-0', count: 10, cells: ['a', 'b']}
        rows[4]!.row = {name: 'item-4', count: 14, cells: ['a', 'b', 'c']}
        await settle()

        expect(Object.fromEntries(renders)).toEqual({'item-0': 1, 'item-4': 1})
        expect(cellText(0, 1)).toBe('10')
        expect(cellText(4, 1)).toBe('14')
        expect(cellText(4, 4)).toBe('c')
    })

    test('a later full redraw sees the targeted update and keeps the DOM', async () => {
        m.mount(root as unknown as Element, Table)
        rows[1]!.row = {name: 'item-1', count: 11, cells: ['p', 'q']}
        await settle()
        const tbody = root.childNodes[0]!.childNodes[0]!.childNodes[0]!
        const tr = tbody.childNodes[1]
        renders.clear()

        m.redraw.sync()

        expect(renders.size).toBe(6)
        expect(tbody.childNodes[1]).toBe(tr)
        expect(cellText(1, 1)).toBe('11')
        expect(cellText(1, 2)).toBe('p')
    })

    test('a row its parent skipped through onbeforeupdate is patched as it now stands in the tree', async () => {
        m.mount(root as unknown as Element, Table)
        frozen = true
        m.redraw.sync()

        rows[3]!.row = {name: 'item-3', count: 33, cells: ['a', 'b', 'c']}
        await settle()
        frozen = false
        m.redraw.sync()

        const tbody = root.childNodes[0]!.childNodes[0]!.childNodes[0]!
        expect(tbody.childNodes[3]!.childNodes).toHaveLength(5)
        expect(cellText(3, 1)).toBe('33')
        expect(cellText(3, 4)).toBe('c')
    })
})

describe('signal-driven redraw that cannot stay in place', () => {
    let root: MockNode

    beforeEach(() => {
        const $window = connectedDomMock()
        root = $window.document.createElement('div')
        $window.document.body.appendChild(root)
    })

    afterEach(() => {
        m.mount(root as unknown as Element, null)
    })

    test('a component whose root element changes is redrawn through its ancestors', async () => {
        const toggle = state({open: false})
        const lead = state({shown: false})
        class Badge extends MithrilComponent {
            view() {
                return toggle.open ? m('p', 'open') : m('span', 'closed')
            }
        }
        class Wrapper extends MithrilComponent {
            view() {
                return m(Badge)
            }
        }
        class Page extends MithrilComponent {
            view() {
                return m('section', [lead.shown ? m('i', 'lead') : null, m(Wrapper)])
            }
        }
        m.mount(root as unknown as Element, Page)

        toggle.open = true
        await settle()
        lead.shown = true
        await settle()

        const section = root.childNodes[0]!
        expect(section.childNodes).toHaveLength(2)
        expect((section.childNodes[0] as unknown as {nodeName: string}).nodeName).toBe('I')
        expect((section.childNodes[1] as unknown as {nodeName: string}).nodeName).toBe('P')
        expect(section.childNodes[1]!.childNodes[0]!.nodeValue).toBe('open')
    })
})
