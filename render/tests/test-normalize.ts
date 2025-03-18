import {describe, test, expect} from 'bun:test';

import Vnode from '../../render/vnode';

describe('normalize', () => {
    test('normalizes array into fragment', () => {
        const node = Vnode.normalize([])

        expect(node.tag).toBe('[')
        expect(node.children.length).toBe(0)
    })

    test('normalizes nested array into fragment', () => {
        const node = Vnode.normalize([[]])

        expect(node.tag).toBe('[')
        expect(node.children.length).toBe(1)
        expect(node.children[0].tag).toBe('[')
        expect(node.children[0].children.length).toBe(0)
    })

    test('normalizes string into text node', () => {
        const node = Vnode.normalize('a')

        expect(node.tag).toBe('#')
        expect(node.children).toBe('a')
    })

    test('normalizes falsy string into text node', () => {
        const node = Vnode.normalize('')

        expect(node.tag).toBe('#')
        expect(node.children).toBe('')
    })

    test('normalizes number into text node', () => {
        const node = Vnode.normalize(1)

        expect(node.tag).toBe('#')
        expect(node.children).toBe('1')
    })

    test('normalizes falsy number into text node', () => {
        const node = Vnode.normalize(0)

        expect(node.tag).toBe('#')
        expect(node.children).toBe('0')
    })

    test('normalizes `true` to `null`', () => {
        const node = Vnode.normalize(true)

        expect(node).toBe(null)
    })

    test('normalizes `false` to `null`', () => {
        const node = Vnode.normalize(false)

        expect(node).toBe(null)
    })
})
