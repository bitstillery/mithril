'use strict'

import {describe, test, expect, beforeEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'

describe('createFragment', () => {
    let $window, root, render
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    test('creates fragment', () => {
        const vnode = fragment(m('a'))
        render(root, vnode)

        expect(vnode.dom.nodeName).toBe('A')
    })

    test('handles empty fragment', () => {
        const vnode = fragment()
        render(root, vnode)

        expect(vnode.dom).toBe(null)
        expect(vnode.domSize).toBe(0)
    })

    test('handles childless fragment', () => {
        const vnode = fragment()
        render(root, vnode)

        expect(vnode.dom).toBe(null)
        expect(vnode.domSize).toBe(0)
    })

    test('handles multiple children', () => {
        const vnode = fragment(m('a'), m('b'))
        render(root, vnode)

        expect(vnode.domSize).toBe(2)
        expect(vnode.dom.nodeName).toBe('A')
        expect(vnode.dom.nextSibling.nodeName).toBe('B')
    })

    test('handles td', () => {
        const vnode = fragment(m('td'))
        render(root, vnode)

        expect(vnode.dom).not.toBe(null)
        expect(vnode.dom.nodeName).toBe('TD')
    })
})
