import {describe, test, expect, beforeEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'

describe('updateFragment', () => {
    let $window, root, render
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    test('updates fragment', () => {
        const vnode = fragment(m('a'))
        const updated = fragment(m('b'))

        render(root, vnode)
        render(root, updated)

        expect(updated.dom).toBe(root.firstChild)
        expect(updated.dom.nodeName).toBe('B')
    })

    test('adds els', () => {
        const vnode = fragment()
        const updated = fragment(m('a'), m('b'))

        render(root, vnode)
        render(root, updated)

        expect(updated.dom).toBe(root.firstChild)
        expect(updated.domSize).toBe(2)
        expect(root.childNodes.length).toBe(2)
        expect(root.childNodes[0].nodeName).toBe('A')
        expect(root.childNodes[1].nodeName).toBe('B')
    })

    test('removes els', () => {
        const vnode = fragment(m('a'), m('b'))
        const updated = fragment()

        render(root, vnode)
        render(root, updated)

        expect(updated.dom).toBe(null)
        expect(updated.domSize).toBe(0)
        expect(root.childNodes.length).toBe(0)
    })

    test('updates from childless fragment', () => {
        const vnode = fragment()
        const updated = fragment(m('a'))

        render(root, vnode)
        render(root, updated)

        expect(updated.dom).toBe(root.firstChild)
        expect(updated.dom.nodeName).toBe('A')
    })

    test('updates to childless fragment', () => {
        const vnode = fragment(m('a'))
        const updated = fragment()

        render(root, vnode)
        render(root, updated)

        expect(updated.dom).toBe(null)
        expect(root.childNodes.length).toBe(0)
    })
})
