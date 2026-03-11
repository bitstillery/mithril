/**
 * Hyperscript / vnode creation benchmarks.
 */
import {bench, summary} from 'mitata'
import m from '../../index'

bench('hyperscript-create (12 cells)', () => {
    const cells = Array.from({length: 12}, (_, i) => m('td', {key: `cell-${i}`}, `cell-${i}`))
    m('tr', {key: 'row'}, cells)
})

summary(() => {
    bench('hyperscript-create (rows)', function* (s: {get: (k: string) => unknown}) {
        const rows = s.get('rows') as number
        yield () => {
            const cells = Array.from({length: 12}, (_, i) => m('td', {key: `cell-${i}`}, `cell-${i}`))
            for (let r = 0; r < rows; r++) {
                m('tr', {key: `row-${r}`}, cells)
            }
        }
    }).range('rows', 1, 50)
})
