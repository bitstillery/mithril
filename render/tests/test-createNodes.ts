import {describe, test, expect, beforeEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'
import trust from '../../render/trust'

describe('createNodes', function() {
    let $window, root, render

    beforeEach(function() {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    test('creates nodes', function() {
        const vnodes = [
            m('a'),
            'b',
            trust('c'),
            fragment('d'),
        ]
        render(root, vnodes)

        expect(root.childNodes.length).toBe(4)
        expect(root.childNodes[0].nodeName).toBe('A')
        expect(root.childNodes[1].nodeValue).toBe('b')
        expect(root.childNodes[2].nodeValue).toBe('c')
        expect(root.childNodes[3].nodeValue).toBe('d')
    })

    test('ignores null', function() {
        const vnodes = [
            m('a'),
            'b',
            null,
            trust('c'),
            fragment('d'),
        ]
        render(root, vnodes)

        expect(root.childNodes.length).toBe(4)
        expect(root.childNodes[0].nodeName).toBe('A')
        expect(root.childNodes[1].nodeValue).toBe('b')
        expect(root.childNodes[2].nodeValue).toBe('c')
        expect(root.childNodes[3].nodeValue).toBe('d')
    })

    test('ignores undefined', function() {
        const vnodes = [
            m('a'),
            'b',
            undefined,
            trust('c'),
            fragment('d'),
        ]
        render(root, vnodes)

        expect(root.childNodes.length).toBe(4)
        expect(root.childNodes[0].nodeName).toBe('A')
        expect(root.childNodes[1].nodeValue).toBe('b')
        expect(root.childNodes[2].nodeValue).toBe('c')
        expect(root.childNodes[3].nodeValue).toBe('d')
    })
})
