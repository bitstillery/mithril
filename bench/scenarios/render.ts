/**
 * Render / VDOM benchmarks (create, update, full redraw).
 */
import {bench, summary} from 'mitata'
import domMock from '../../test-utils/domMock'
import renderFactory from '../../render/render'
import m from '../../index'

const $window = domMock()
const root = $window.document.createElement('div')
const render = renderFactory()

bench('render-create (100 divs)', () => {
    const vnodes = Array.from({length: 100}, (_, i) => m('div', {key: i}, `item-${i}`))
    render(root, vnodes)
})

summary(() => {
    bench('render-create (nodes)', function* (s: {get: (k: string) => unknown}) {
        const n = s.get('nodes') as number
        yield () => {
            const vnodes = Array.from({length: n}, (_, i) => m('div', {key: i}, `item-${i}`))
            render(root, vnodes)
        }
    }).range('nodes', 10, 100)
})

bench('render-update-keyed (100 items)', () => {
    const vnodes = Array.from({length: 100}, (_, i) => m('div', {key: i}, `item-${i}-${Date.now()}`))
    render(root, vnodes)
})

bench('render-update-unkeyed (100 items)', () => {
    const vnodes = Array.from({length: 100}, (_, i) => m('div', `item-${i}-${Date.now()}`))
    render(root, vnodes)
})

const RowComponent = {
    view(vnode: any) {
        return m(
            'tr',
            vnode.attrs.cells.map((c: string, i: number) => m('td', {key: i}, c)),
        )
    },
}

const TableComponent = {
    view(vnode: any) {
        const {rows} = vnode.attrs
        return m(
            'table',
            m(
                'tbody',
                rows.map((cells: string[], i: number) => m(RowComponent as any, {key: i, cells})),
            ),
        )
    },
}

bench('full-redraw (10x10 table)', () => {
    const rows = Array.from({length: 10}, (_, r) => Array.from({length: 10}, (_, c) => `r${r}-c${c}-${Date.now()}`))
    render(root, m(TableComponent as any, {rows}))
})
