/**
 * State / proxy benchmarks.
 */
import {bench, summary} from 'mitata'
import {state, watch, clearStateRegistry} from '../../index'

clearStateRegistry()

bench('state-create (flat 10 keys)', () => {
    state({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10})
})

summary(() => {
    bench('state-create (keys)', function* (s: {get: (k: string) => unknown}) {
        const keys = s.get('keys') as number
        const obj: Record<string, number> = {}
        for (let i = 0; i < keys; i++) obj[`k${i}`] = i
        yield () => state(obj)
    }).range('keys', 5, 50)
})

bench('state-read (1000 reads)', () => {
    const s = state({count: 0, name: 'test'})
    for (let i = 0; i < 1000; i++) {
        const _ = s.count
        const __ = s.name
    }
})

bench('state-nested (depth 3 read)', () => {
    const s = state({a: {b: {c: 1}}})
    for (let i = 0; i < 1000; i++) {
        const _ = s.a.b.c
    }
})

bench('state-write (1000 writes)', () => {
    const s = state({count: 0})
    for (let i = 0; i < 1000; i++) {
        s.count = i
    }
})

bench('state-computed (read after write)', () => {
    const s = state({
        count: 0,
        doubled: function (this: {count: number}) {
            return this.count * 2
        },
    })
    s.count++
    const _ = s.doubled
})

bench('state-array-push (100 pushes)', () => {
    const s = state({items: [] as number[]})
    for (let i = 0; i < 100; i++) {
        s.items.push(i)
    }
})

bench('state-array-map (100 items)', () => {
    const s = state({items: Array.from({length: 100}, (_, i) => i)})
    const _ = s.items.map((x: number) => x * 2)
})

bench('watch-subscribe (setup + notify)', () => {
    const sig = state({x: 0}).$x
    const cb = () => {}
    watch(sig, cb)
    sig.value = 1
})
