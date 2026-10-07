import {describe, test, expect, beforeEach} from 'bun:test'

import {state, clearStateRegistry} from '../../src/state/state'
import {serializeStore, serializeAllStates, deserializeAllStates} from '../../src/ssr/serialize'

describe('serializeStore values', () => {
    beforeEach(() => {
        clearStateRegistry()
    })

    test('a Date serializes as its ISO string, as JSON.stringify would', () => {
        const when = new Date('2026-10-07T09:30:00.000Z')
        const s = state({when, nested: {when}}, 'dates')

        const serialized = serializeStore(s)

        expect(serialized.when).toBe('2026-10-07T09:30:00.000Z')
        expect(serialized.nested).toEqual({when: '2026-10-07T09:30:00.000Z'})
        expect(JSON.parse(JSON.stringify(serialized))).toEqual(serialized)
    })

    test('a Map serializes as its entries and a Set as its values', () => {
        const s = state(
            {
                byId: new Map<string, {name: string}>([
                    ['a', {name: 'Ann'}],
                    ['b', {name: 'Bob'}],
                ]),
                tags: new Set(['x', 'y']),
            },
            'collections',
        )

        const serialized = serializeStore(s)

        expect(serialized.byId).toEqual([
            ['a', {name: 'Ann'}],
            ['b', {name: 'Bob'}],
        ])
        expect(serialized.tags).toEqual(['x', 'y'])
        expect(new Map(serialized.byId as [string, {name: string}][]).get('b')).toEqual({name: 'Bob'})
    })

    test('an object reachable under two keys serializes fully at both', () => {
        const shared = {id: 1, label: 'shared'}
        const s = state({first: shared, second: shared, list: [shared, shared]}, 'shared')

        const serialized = serializeStore(s)

        expect(serialized.first).toEqual({id: 1, label: 'shared'})
        expect(serialized.second).toEqual({id: 1, label: 'shared'})
        expect(serialized.list).toEqual([
            {id: 1, label: 'shared'},
            {id: 1, label: 'shared'},
        ])
    })

    test('a shared plain object inside a plain value serializes fully at both places', () => {
        const shared = {id: 2}
        const s = state({holder: new Map([['k', {a: shared, b: shared}]])}, 'sharedInMap')

        const serialized = serializeStore(s)

        expect(serialized.holder).toEqual([['k', {a: {id: 2}, b: {id: 2}}]])
    })

    test('a real cycle is still broken with null', () => {
        const node: {name: string; self?: unknown} = {name: 'node'}
        node.self = node
        const s = state({node}, 'cycle')

        const serialized = serializeStore(s)

        expect(serialized.node).toEqual({name: 'node', self: null})
    })

    test('the output round-trips through deserializeAllStates', () => {
        const shared = {id: 3}
        state({a: shared, b: shared, when: new Date(0), tags: new Set([1, 2])}, 'roundTrip')
        const payload = JSON.parse(JSON.stringify(serializeAllStates())) as Record<string, unknown>

        clearStateRegistry()
        const client = state({a: {id: 0}, b: {id: 0}, when: '' as string, tags: [] as number[]}, 'roundTrip')
        deserializeAllStates(payload)

        expect(client.a.id).toBe(3)
        expect(client.b.id).toBe(3)
        expect(client.when).toBe('1970-01-01T00:00:00.000Z')
        expect(client.tags).toEqual([1, 2])
    })
})
