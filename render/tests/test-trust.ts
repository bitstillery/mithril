import {describe, test, expect} from 'bun:test';

import trust from '../../render/trust';

describe('trust', () => {
    test('works with html', () => {
        const vnode = trust('<a></a>')

        expect(vnode.tag).toBe('<')
        expect(vnode.children).toBe('<a></a>')
    })

    test('works with text', () => {
        const vnode = trust('abc')

        expect(vnode.tag).toBe('<')
        expect(vnode.children).toBe('abc')
    })

    test('casts null to empty string', () => {
        const vnode = trust(null)

        expect(vnode.tag).toBe('<')
        expect(vnode.children).toBe('')
    })

    test('casts undefined to empty string', () => {
        const vnode = trust(undefined)

        expect(vnode.tag).toBe('<')
        expect(vnode.children).toBe('')
    })
})
