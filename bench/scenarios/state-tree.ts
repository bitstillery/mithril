/**
 * State shapes and operations as an app performs them, outside a render.
 *
 * `state.ts` measures flat creation and reads; this covers what it leaves out: creating a
 * component-sized state with nesting and arrays, the array mutators on a long-lived list, writes to
 * nested keys, adding and deleting keys, enumerating a state, serializing it and watching it.
 * Lists and states are created once outside the bench bodies, so these measure steady state.
 *
 * Run: bun run bench state-tree
 */
import {bench, summary} from 'mitata'

import {state, watch, clearStateRegistry} from '../../index'
import {serializeStore} from '../../render/ssrState'

clearStateRegistry()

/** A state as a list page's component keeps it: scalars, a nested filter object, rows and a lookup. */
function make_component_state(rows: number) {
    return state({
        collapsed: false,
        filters: {page: 1, query: '', sort: {by: 'name', direction: 'asc'}},
        loading: false,
        lookup: {} as Record<string, {label: string}>,
        rows: Array.from({length: rows}, (_, i) => ({id: i, name: `row ${i}`, selected: false})),
        selected: null as number | null,
        title: 'Items',
        total: rows,
    })
}

summary(() => {
    bench('create — 10 flat keys', () => state({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10}))
    bench('create — component state, 0 rows', () => make_component_state(0))
    bench('create — component state, 20 rows', () => make_component_state(20))
})

const list = state({items: Array.from({length: 100}, (_, i) => i)})
const rows = make_component_state(100)
let tick = 0

summary(() => {
    bench('array — push + pop (100 items)', () => {
        list.items.push(tick++)
        return list.items.pop()
    })
    bench('array — splice remove + insert one (100 items)', () => {
        const removed = list.items.splice(50, 1)
        list.items.splice(50, 0, removed[0]!)
    })
    bench('array — index assignment (100 items)', () => {
        list.items[50] = tick++
    })
    bench('array — sort with comparator (100 items)', () => {
        list.items.sort(tick++ % 2 ? (a, b) => a - b : (a, b) => b - a)
    })
    bench('array — sort rows by field (100 objects)', () => {
        rows.rows.sort(tick++ % 2 ? (a, b) => a.id - b.id : (a, b) => b.id - a.id)
    })
    // oxlint-disable-next-line unicorn/no-array-reverse -- the in-place mutator is what's measured
    bench('array — reverse (100 items)', () => list.items.reverse())
})

summary(() => {
    bench('write — nested key, depth 3', () => {
        rows.filters.sort.direction = tick++ % 2 ? 'asc' : 'desc'
    })
    bench('write — replace a nested object', () => {
        rows.filters.sort = {by: 'name', direction: tick++ % 2 ? 'asc' : 'desc'} as typeof rows.filters.sort
    })
    bench('write — add + delete a key', () => {
        rows.lookup.k = {label: 'x'} as (typeof rows.lookup)['k']
        delete rows.lookup.k
    })
})

summary(() => {
    bench('enumerate — Object.keys (8 keys)', () => Object.keys(rows))
    bench("enumerate — 'in' check", () => 'title' in rows)
    bench('serialize — component state, 20 rows', function* () {
        const s = make_component_state(20)
        yield () => serializeStore(s)
    })
})

const watched = state({count: 0, items: [1, 2, 3]})
summary(() => {
    bench('watch — setup + teardown', () => {
        const unwatch = watch(watched.$count, () => {})
        unwatch()
    })
    bench('watch — array push notifies the property watcher', function* () {
        const s = state({items: [] as number[]})
        let seen = 0
        watch(s.$items, () => seen++)
        yield () => {
            s.items.push(1)
            s.items.pop()
            return seen
        }
    })
})
