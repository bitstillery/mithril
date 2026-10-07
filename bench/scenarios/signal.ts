/**
 * Signal / targeted redraw benchmarks.
 */
import {bench} from 'mitata'
import domMock from '../../tests/helpers/dom_mock'
import m, {state} from '../../src/index'

const $window = domMock()
const root = $window.document.createElement('div') as unknown as Element

const CounterComponent = {
    view(vnode: any) {
        const s = vnode.attrs.state as {count: number}
        return m('span', s.count)
    },
}

bench('signal-redraw (mount + update + sync)', () => {
    const s = state({count: 0})
    m.mount(root, {
        view: () => m(CounterComponent as any, {state: s}),
    })
    s.count++
    m.redraw.sync()
})
