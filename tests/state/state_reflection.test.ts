import {describe, test, expect} from 'bun:test'

import {state, watch} from '../../src/state/state'
import {serializeStore} from '../../src/ssr/serialize'

import type {StateInternals} from '../../src/state/state'

describe('state reflection', () => {
    test('own keys list the target keys, then a $ key per signal', () => {
        const s = state({a: 1, b: {c: 2}, items: [1, 2]})
        expect(Reflect.ownKeys(s)).toEqual(['a', 'b', 'items', '$a', '$b', '$items'])
        expect(Object.keys(s)).toEqual(['a', 'b', 'items'])
        const enumerated: string[] = []
        for (const key in s) enumerated.push(key)
        expect(enumerated).toEqual(['a', 'b', 'items'])
    })

    test('an added key is listed after the existing ones, a deleted key no longer', () => {
        const s = state<{a?: number; b: number; d?: number}>({a: 1, b: 2})
        s.d = 4
        expect(Reflect.ownKeys(s)).toEqual(['a', 'b', 'd', '$a', '$b', '$d'])
        delete s.a
        expect(Reflect.ownKeys(s)).toEqual(['b', 'd', '$b', '$d'])
    })

    test('a function added as a key, which the target never gets, is listed after the $ keys', () => {
        const s = state<{a: number; f?: () => number}>({a: 1})
        s.f = function () {
            return 1
        }
        expect(Reflect.ownKeys(s)).toEqual(['a', '$a', 'f', '$f'])
    })

    test('a key re-added to the signal map moves its $ key to the end', () => {
        const s = state({a: 1, b: 2})
        ;(s as StateInternals).__signalMap!.delete('a')
        s.a = 3
        expect(Reflect.ownKeys(s)).toEqual(['a', 'b', '$b', '$a'])
    })

    test('integer, $-prefixed and symbol keys keep their order and are not duplicated', () => {
        const sym = Symbol('s')
        const initial = {x: 1, $y: 2, [sym]: 3, 10: 'n'}
        const s = state(initial)
        expect(Reflect.ownKeys(s)).toEqual(['10', 'x', '$y', sym, '$10', '$x', '$$y'])
    })

    test('a $ key colliding with a target key is listed once', () => {
        const s = state({a: 1, $a: 2})
        expect(Reflect.ownKeys(s)).toEqual(['a', '$a', '$$a'])
    })

    test('a key added to the initial object after creation is listed, without a $ key', () => {
        const initial: Record<string, number> = {x: 1}
        const s = state(initial)
        initial.late = 2
        expect(Reflect.ownKeys(s)).toEqual(['x', 'late', '$x'])
    })

    test('property descriptors: a data key is enumerable, its $ key not, an unknown key has none', () => {
        const s = state({a: 1, b: {c: 2}})
        expect(Object.getOwnPropertyDescriptor(s, 'a')).toEqual({
            value: undefined,
            writable: true,
            enumerable: true,
            configurable: true,
        })
        expect(Object.getOwnPropertyDescriptor(s, '$b')).toEqual({
            value: undefined,
            writable: false,
            enumerable: false,
            configurable: true,
        })
        expect(Object.getOwnPropertyDescriptor(s, 'zz')).toBeUndefined()
        expect(Object.getOwnPropertyDescriptor(s, '$zz')).toBeUndefined()
    })

    test("'in' answers for keys, their $ keys and the internals", () => {
        const s = state<{b?: number; c?: number}>({b: 1})
        delete s.b
        s.c = 2
        expect(['b' in s, 'c' in s, '$c' in s, '$zz' in s, '__isState' in s, 'toString' in s]).toEqual([
            false,
            true,
            true,
            false,
            true,
            true,
        ])
    })

    test('JSON and spread see the enumerable keys with their values', () => {
        const s = state({a: 1, b: {c: 2}, items: [1, 2], f: () => 3})
        expect(JSON.stringify(s)).toBe('{"a":1,"b":{"c":2},"items":[1,2],"f":3}')
        expect({...s.b}).toEqual<{c: number}>({c: 2})
    })

    test('an array lists its indices and length', () => {
        const s = state({items: [1, 2]})
        expect(Reflect.ownKeys(s.items)).toEqual(['0', '1', 'length'])
    })
})

describe('state original keys', () => {
    test('are the keys at creation, one Set for the life of the state', () => {
        const s = state<{a?: number; b: {c: number}; d?: number}>({a: 1, b: {c: 2}})
        const keys = (s as StateInternals).__originalKeys!
        expect(keys).toBeInstanceOf(Set)
        expect([...keys]).toEqual(['a', 'b'])
        s.d = 4
        delete s.a
        expect((s as StateInternals).__originalKeys).toBe(keys)
        expect([...keys]).toEqual(['a', 'b'])
        expect([...(s.b as StateInternals).__originalKeys!]).toEqual(['c'])
    })

    test('keep a key added to a nested state out of its serialization, unless it started empty', () => {
        const s = state<{filters: {page: number; extra?: boolean}; lookup: Record<string, {sort: string} | undefined>}>({
            filters: {page: 1},
            lookup: {},
        })
        s.filters.extra = true
        s.lookup.path = {sort: 'name'}
        expect(serializeStore(s)).toEqual({filters: {page: 1}, lookup: {path: {sort: 'name'}}})
    })
})

describe('state array notifications', () => {
    const mutations: [string, (items: any) => unknown][] = [
        ['push', (items) => items.push(4)],
        ['pop', (items) => items.pop()],
        ['shift', (items) => items.shift()],
        ['unshift', (items) => items.unshift(0)],
        ['splice', (items) => items.splice(1, 1, 9)],
        // oxlint-disable-next-line unicorn/no-array-sort -- the in-place mutator is what's under test
        ['sort', (items) => items.sort((a: number, b: number) => b - a)],
        // oxlint-disable-next-line unicorn/no-array-reverse -- the in-place mutator is what's under test
        ['reverse', (items) => items.reverse()],
        ['fill', (items) => items.fill(0)],
        ['copyWithin', (items) => items.copyWithin(0, 1)],
        ['index assignment', (items) => (items[1] = 7)],
        ['length', (items) => (items.length = 1)],
    ]
    for (const [name, mutate] of mutations) {
        test(`${name} notifies the property's watcher once`, () => {
            const s = state({items: [3, 1, 2]})
            let calls = 0
            watch(s.$items, () => calls++)
            mutate(s.items)
            expect(calls).toBe(1)
        })
    }

    test('a collected computed that read an array is dropped by its next mutation', async () => {
        const s = state({items: [1, 2, 3]})
        const sig = s.$items
        const before = sig._subscribers?.size ?? 0
        const computeds: WeakRef<object>[] = []
        ;(() => {
            for (let i = 0; i < 10; i++) {
                const s2 = state({total: () => s.items.length})
                void s2.total
                computeds.push(new WeakRef(s2.$total))
            }
        })()
        for (let i = 0; i < 5; i++) Bun.gc(true)
        await new Promise((resolve) => setTimeout(resolve, 0))
        for (let i = 0; i < 5; i++) Bun.gc(true)
        // The engine may keep one alive a while; whatever it collected must be gone after the push.
        const alive = computeds.filter((ref) => ref.deref() !== undefined).length
        expect(alive).toBeLessThan(10)

        s.items.push(4)

        expect(sig._subscribers?.size ?? 0).toBe(before + alive)
    })
})
