// @ts-nocheck
import {describe, test, expect, beforeEach} from 'bun:test'

import {state, clearStateRegistry, registerState} from '../../src/state/state'
import {serializeStore, deserializeStore, serializeAllStates} from '../../src/ssr/serialize'

// Pins the exact serialized form (keys, order, dropped and nulled values), so optimizations of the
// serializer can't change the `__SSR_STATE__` payload.
describe('SSR state serialization output', () => {
    beforeEach(() => {
        clearStateRegistry()
    })

    function storeLike() {
        const s = state({
            b: 1,
            a: 'x',
            2: 'two',
            1: 'one',
            nil: null,
            undef: undefined,
            list: [1, undefined, null, 'x', {id: 1, deep: {v: [1, 2]}}, [3, [4]]],
            user: {name: 'A', roles: ['r'], prefs: {}},
            lookup: {},
            date: new Date(0),
            map: new Map([[1, 2]]),
            total() {
                return this.b + 1
            },
            rw: {
                get() {
                    return 5
                },
                set() {},
            },
            $raw: 'dollar',
        })
        s.lookup['/p'] = {t: 1}
        s.added = {z: [1]}
        s.user.extra = 'dropped: not an original key of a non-empty nested state'
        s.shared1 = {k: 1}
        s.shared2 = s.shared1
        s.self = s
        return s
    }

    test('serializes keys in order, skipping computeds, $-keys and repeated objects', () => {
        const serialized = serializeStore(storeLike())
        expect(JSON.stringify(serialized)).toBe(
            '{"1":"one","2":"two","b":1,"a":"x","nil":null,"list":[1,null,"x",{"id":1,"deep":{"v":[1,2]}},[3,[4]]],' +
                '"user":{"name":"A","roles":["r"],"prefs":{}},"lookup":{"/p":{"t":1}},"date":{},"map":{},' +
                '"added":{"z":[1]},"shared1":{"k":1},"shared2":null,"self":null}',
        )
        expect(Object.keys(serialized)).toEqual([
            '1',
            '2',
            'b',
            'a',
            'nil',
            'undef',
            'list',
            'user',
            'lookup',
            'date',
            'map',
            'added',
            'shared1',
            'shared2',
            'self',
        ])
        expect(serialized.undef).toBeUndefined()
        expect(serialized.list).toHaveLength(5)
    })

    test('serializes enumerable keys a state inherits from its prototype', () => {
        const s = state(Object.assign(Object.create({inherited: 'yes'}), {own: 1}))
        expect(JSON.stringify(serializeStore(s))).toBe('{"own":1,"inherited":"yes"}')
    })

    test('serializes state arrays after mutation', () => {
        const s = state({items: [{a: 1}, {a: 2}]})
        s.items.push({a: 3})
        s.items[0] = {a: 0, b: [1]}
        s.items.splice(1, 0, 'str', 7)
        expect(JSON.stringify(serializeStore(s))).toBe('{"items":[{"a":0,"b":[1]},"str",7,{"a":2},{"a":3}]}')
    })

    test('serializes plain objects held as values without their inherited keys', () => {
        class Point {
            constructor(x, y) {
                this.x = x
                this.y = y
            }
            get len() {
                return 1
            }
        }
        const plain = Object.create({inherited: 1})
        plain.own = 2
        const s = state({point: null, plain: null})
        // Assigned through a raw signal, so they stay plain values instead of becoming nested state.
        s.$point.value = new Point(1, 2)
        s.$plain.value = plain
        expect(JSON.stringify(serializeStore(s))).toBe('{"point":{"x":1,"y":2},"plain":{"own":2}}')
    })

    test('serializeAllStates serializes every registered state and skips broken ones', () => {
        const one = state({a: [{b: 1}]})
        const two = state({
            c: 'd',
            e() {
                return 1
            },
        })
        const broken = state({x: 1})
        broken.__signalMap = null
        registerState('one', one, {})
        registerState('broken', broken, {})
        registerState('two', two, {})
        const error = console.error
        console.error = () => {}
        try {
            expect(JSON.stringify(serializeAllStates())).toBe('{"one":{"a":[{"b":1}]},"two":{"c":"d"}}')
        } finally {
            console.error = error
        }
    })

    test('a round trip through deserializeStore restores the same serialized state', () => {
        const source = storeLike()
        const serialized = JSON.parse(JSON.stringify(serializeStore(source)))
        const target = state({
            b: 0,
            a: '',
            user: {name: '', roles: [], prefs: {}},
            lookup: {},
            total() {
                return this.b * 10
            },
        })
        deserializeStore(target, serialized)
        expect(JSON.stringify(serializeStore(target))).toBe(
            '{"1":"one","2":"two","b":1,"a":"x","user":{"name":"A","roles":["r"],"prefs":{}},"lookup":{"/p":{"t":1}},' +
                '"nil":null,"list":[1,null,"x",{"id":1,"deep":{"v":[1,2]}},[3,[4]]],"date":{},"map":{},' +
                '"added":{"z":[1]},"shared1":{"k":1},"shared2":null,"self":null}',
        )
        expect(target.total).toBe(10)
        expect(target.user.$name.value).toBe('A')
        expect(target.list[3].$id.value).toBe(1)
    })
})
