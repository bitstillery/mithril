import {describe, test, expect} from 'bun:test'

import {signal, computed, effect} from '../../src/state/signal'
import {state} from '../../src/state/state'

import type {Signal} from '../../src/state/signal'

/** Builds an object in a frame of its own, drops it, collects, and tells whether it survived. */
function collectable(make: () => object): boolean {
    let ref: WeakRef<object> | undefined
    ;(() => {
        ref = new WeakRef(make())
    })()
    for (let i = 0; i < 5; i++) Bun.gc(true)
    return ref!.deref() === undefined
}

function subscriberCount(sig: Signal<unknown>): number {
    return sig._subscribers?.size ?? 0
}

describe('signal memory', () => {
    test('a dropped computed that read a long-lived signal can be collected', () => {
        const source = signal(1)
        expect(
            collectable(() => {
                const doubled = computed(() => source.value * 2)
                void doubled.value
                return doubled
            }),
        ).toBe(true)
    })

    test('a dropped state with a computed reading a long-lived signal can be collected', () => {
        const source = signal(1)
        expect(
            collectable(() => {
                const local = state({doubled: () => source.value * 2})
                void local.doubled
                return local
            }),
        ).toBe(true)
    })

    test('a long-lived signal sheds the subscription of a collected computed on its next change', () => {
        const source = signal(1)
        const before = subscriberCount(source)
        ;(() => {
            for (let i = 0; i < 20; i++) void computed(() => source.value * i).value
        })()
        for (let i = 0; i < 5; i++) Bun.gc(true)
        source.value = 2
        expect(subscriberCount(source)).toBe(before)
    })

    test('a watched computed keeps notifying when nothing else references it', () => {
        const source = signal(1)
        const seen: number[] = []
        ;(() => {
            computed(() => source.value * 2).watch((value) => seen.push(value))
        })()
        for (let i = 0; i < 5; i++) Bun.gc(true)
        source.value = 2
        expect(seen).toEqual([4])
    })

    test('an effect on a computed keeps running when nothing else references the computed', () => {
        const source = signal(1)
        const seen: number[] = []
        ;(() => {
            const doubled = computed(() => source.value * 2)
            effect(() => {
                seen.push(doubled.value)
            })
        })()
        for (let i = 0; i < 5; i++) Bun.gc(true)
        source.value = 2
        expect(seen).toEqual([2, 4])
    })

    test('a disposed effect unsubscribes from the signals it read', () => {
        const source = signal(1)
        const before = subscriberCount(source)
        const dispose = effect(() => {
            void source.value
        })
        expect(subscriberCount(source)).toBe(before + 1)
        dispose()
        expect(subscriberCount(source)).toBe(before)
    })

    test('an effect unsubscribes from a signal its last run no longer read', () => {
        const useA = signal(true)
        const a = signal(1)
        let runs = 0
        effect(() => {
            runs++
            if (useA.value) void a.value
        })
        useA.value = false
        expect(runs).toBe(2)
        a.value = 2
        expect(runs).toBe(2)
        expect(subscriberCount(a)).toBe(0)
    })

    test('a computed is not marked dirty by a signal it no longer reads', () => {
        const useA = signal(true)
        const a = signal(1)
        const b = signal(10)
        const picked = computed(() => (useA.value ? a.value : b.value))
        const seen: number[] = []
        picked.watch((value) => seen.push(value))

        useA.value = false
        a.value = 2
        b.value = 20
        expect(seen).toEqual([10, 20])
    })
})
