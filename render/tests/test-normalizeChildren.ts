import {describe, test, expect} from 'bun:test';

import Vnode from '../../render/vnode';

describe('normalizeChildren', () => {
    test('normalizes arrays into fragments', () => {
        const children = Vnode.normalizeChildren([[]])

        expect(children[0].tag).toBe('[')
        expect(children[0].children.length).toBe(0)
    })

    test('normalizes strings into text nodes', () => {
        const children = Vnode.normalizeChildren(['a'])

        expect(children[0].tag).toBe('#')
        expect(children[0].children).toBe('a')
    })

    test('normalizes `false` values into `null`s', () => {
        const children = Vnode.normalizeChildren([false])

        expect(children[0]).toBe(null)
    })

    test('allows all keys', () => {
        const children = Vnode.normalizeChildren([
            {key: 1},
            {key: 2},
        ])

        expect(children).toEqual([{key: 1}, {key: 2}])
    })

    test('allows no keys', () => {
        const children = Vnode.normalizeChildren([
            {data: 1},
            {data: 2},
        ])

        expect(children).toEqual([{data: 1}, {data: 2}])
    })

    test('disallows mixed keys, starting with key', () => {
        expect(() => {
            Vnode.normalizeChildren([
                {key: 1},
                {data: 2},
            ])
        }).toThrow(TypeError)
    })

    test('disallows mixed keys, starting with no key', () => {
        expect(() => {
            Vnode.normalizeChildren([
                {data: 1},
                {key: 2},
            ])
        }).toThrow(TypeError)
    })
})
