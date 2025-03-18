import {describe, test, expect, beforeEach, mock} from 'bun:test'

import components from '../../test-utils/components'
import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'
import trust from '../../render/trust'

function vnodify(str) {
    return str.split(',').map(function(k) {return m(k, {key: k})})
}

describe('updateNodes', () => {
    let $window, root, render
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    test('handles el noop', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const updated = [m('a', {key: 1}), m('b', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('handles el noop without key', () => {
        const vnodes = [m('a'), m('b')]
        const updated = [m('a'), m('b')]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('handles text noop', () => {
        const vnodes = 'a'
        const updated = 'a'

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(root.firstChild.nodeValue).toBe('a')
    })

    test('handles text noop w/ type casting', () => {
        const vnodes = 1
        const updated = '1'

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(root.firstChild.nodeValue).toBe('1')
    })

    test('handles falsy text noop w/ type casting', () => {
        const vnodes = 0
        const updated = '0'

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0].nodeValue).toBe('0')
    })

    test('handles html noop', () => {
        const vnodes = trust('a')
        const updated = trust('a')

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0].nodeValue).toBe('a')
        expect(updated.dom).toBe(root.childNodes[0])
    })

    test('handles fragment noop', () => {
        const vnodes = fragment(m('a'))
        const updated = fragment(m('a'))

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(updated.dom.nodeName).toBe('A')
        expect(updated.dom).toBe(root.childNodes[0])
    })

    test('handles fragment noop w/ text child', () => {
        const vnodes = fragment('a')
        const updated = fragment('a')

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(updated.dom.nodeValue).toBe('a')
        expect(updated.dom).toBe(root.childNodes[0])
    })

    test('handles undefined to null noop', () => {
        const vnodes = [null, m('div')]
        const updated = [undefined, m('div')]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
    })

    test('reverses els w/ even count', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4})]
        const updated = [m('s', {key: 4}), m('i', {key: 3}), m('b', {key: 2}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(4)
        expect(updated[0].dom.nodeName).toBe('S')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('B')
        expect(updated[2].dom).toBe(root.childNodes[2])
        expect(updated[3].dom.nodeName).toBe('A')
        expect(updated[3].dom).toBe(root.childNodes[3])
    })

    test('reverses els w/ odd count', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3})]
        const updated = [m('i', {key: 3}), m('b', {key: 2}), m('a', {key: 1})]
        const expectedTags = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)
        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('I')
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[2].dom.nodeName).toBe('A')
        expect(tagNames).toEqual(expectedTags)
    })

    test('creates el at start', () => {
        const vnodes = [m('a', {key: 1})]
        const updated = [m('b', {key: 2}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('B')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('creates el at end', () => {
        const vnodes = [m('a', {key: 1})]
        const updated = [m('a', {key: 1}), m('b', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('creates el in middle', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const updated = [m('a', {key: 1}), m('i', {key: 3}), m('b', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('B')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('creates el while reversing', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const updated = [m('b', {key: 2}), m('i', {key: 3}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('B')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('A')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('deletes el at start', () => {
        const vnodes = [m('b', {key: 2}), m('a', {key: 1})]
        const updated = [m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
    })

    test('deletes el at end', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const updated = [m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
    })

    test('deletes el at middle', () => {
        const vnodes = [m('a', {key: 1}), m('i', {key: 3}), m('b', {key: 2})]
        const updated = [m('a', {key: 1}), m('b', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('deletes el while reversing', () => {
        const vnodes = [m('a', {key: 1}), m('i', {key: 3}), m('b', {key: 2})]
        const updated = [m('b', {key: 2}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('B')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('creates, deletes, reverses els at same time', () => {
        const vnodes = [m('a', {key: 1}), m('i', {key: 3}), m('b', {key: 2})]
        const updated = [m('b', {key: 2}), m('a', {key: 1}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('B')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('S')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('creates, deletes, reverses els at same time with \'__proto__\' key', () => {
        const vnodes = [m('a', {key: '__proto__'}), m('i', {key: 3}), m('b', {key: 2})]
        const updated = [m('b', {key: 2}), m('a', {key: '__proto__'}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('B')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('S')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('adds to empty fragment followed by el', () => {
        const vnodes = [fragment({key: 1}), m('b', {key: 2})]
        const updated = [fragment({key: 1}, m('a')), m('b', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].children[0].dom.nodeName).toBe('A')
        expect(updated[0].children[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('reverses followed by el', () => {
        const vnodes = [fragment({key: 1}, m('a', {key: 2}), m('b', {key: 3})), m('i', {key: 4})]
        const updated = [fragment({key: 1}, m('b', {key: 3}), m('a', {key: 2})), m('i', {key: 4})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].children[0].dom.nodeName).toBe('B')
        expect(updated[0].children[0].dom).toBe(root.childNodes[0])
        expect(updated[0].children[1].dom.nodeName).toBe('A')
        expect(updated[0].children[1].dom).toBe(root.childNodes[1])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[2])
    })

    test('updates empty fragment to html without key', () => {
        const vnodes = fragment()
        const updated = trust('<a></a><b></b>')

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated.dom.nodeName).toBe('A')
        expect(updated.dom).toBe(root.childNodes[0])
        expect(updated.domSize).toBe(2)
        expect(updated.dom.nextSibling.nodeName).toBe('B')
        expect(updated.dom.nextSibling).toBe(root.childNodes[1])
    })

    test('updates empty html to fragment without key', () => {
        const vnodes = trust()
        const updated = fragment(m('a'), m('b'))

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated.dom.nodeName).toBe('A')
        expect(updated.dom).toBe(root.childNodes[0])
        expect(updated.domSize).toBe(2)
        expect(updated.dom.nextSibling.nodeName).toBe('B')
        expect(updated.dom.nextSibling).toBe(root.childNodes[1])
    })

    test('updates fragment to html without key', () => {
        const vnodes = fragment(m('a'), m('b'))
        const updated = trust('<i></i><s></s>')

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated.dom.nodeName).toBe('I')
        expect(updated.dom).toBe(root.childNodes[0])
        expect(updated.domSize).toBe(2)
        expect(updated.dom.nextSibling.nodeName).toBe('S')
        expect(updated.dom.nextSibling).toBe(root.childNodes[1])
    })

    test('updates html to fragment without key', () => {
        const vnodes = trust('<a></a><b></b>')
        const updated = fragment(m('i'), m('s'))

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated.dom.nodeName).toBe('I')
        expect(updated.dom).toBe(root.childNodes[0])
        expect(updated.domSize).toBe(2)
        expect(updated.dom.nextSibling.nodeName).toBe('S')
        expect(updated.dom.nextSibling).toBe(root.childNodes[1])
    })

    test('populates fragment followed by el keyed', () => {
        const vnodes = [fragment({key: 1}), m('i', {key: 2})]
        const updated = [fragment({key: 1}, m('a'), m('b')), m('i', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[0].domSize).toBe(2)
        expect(updated[0].dom.nextSibling.nodeName).toBe('B')
        expect(updated[0].dom.nextSibling).toBe(root.childNodes[1])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[2])
    })

    test('throws if fragment followed by null then el on first render keyed', () => {
        const vnodes = [fragment({key: 1}), null, m('i', {key: 2})]

        expect(() => { render(root, vnodes) }).toThrow(TypeError)
    })

    test('throws if fragment followed by null then el on next render keyed', () => {
        const vnodes = [fragment({key: 1}), m('i', {key: 2})]
        const updated = [fragment({key: 1}, m('a'), m('b')), null, m('i', {key: 2})]

        render(root, vnodes)
        expect(() => { render(root, updated) }).toThrow(TypeError)
    })

    test('populates childless fragment replaced followed by el keyed', () => {
        const vnodes = [fragment({key: 1}), m('i', {key: 2})]
        const updated = [fragment({key: 1}, m('a'), m('b')), m('i', {key: 2})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[0].domSize).toBe(2)
        expect(updated[0].dom.nextSibling.nodeName).toBe('B')
        expect(updated[0].dom.nextSibling).toBe(root.childNodes[1])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[2])
    })

    test('throws if childless fragment replaced followed by null then el keyed', () => {
        const vnodes = [fragment({key: 1}), m('i', {key: 2})]
        const updated = [fragment({key: 1}, m('a'), m('b')), null, m('i', {key: 2})]

        render(root, vnodes)
        expect(() => { render(root, updated) }).toThrow(TypeError)
    })

    test('moves from end to start', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4})]
        const updated = [m('s', {key: 4}), m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(4)
        expect(updated[0].dom.nodeName).toBe('S')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('B')
        expect(updated[2].dom).toBe(root.childNodes[2])
        expect(updated[3].dom.nodeName).toBe('I')
        expect(updated[3].dom).toBe(root.childNodes[3])
    })

    test('moves from start to end', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4})]
        const updated = [m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(4)
        expect(updated[0].dom.nodeName).toBe('B')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('S')
        expect(updated[2].dom).toBe(root.childNodes[2])
        expect(updated[3].dom.nodeName).toBe('A')
        expect(updated[3].dom).toBe(root.childNodes[3])
    })

    test('removes then recreate', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4})]
        const temp = []
        const updated = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(4)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('I')
        expect(updated[2].dom).toBe(root.childNodes[2])
        expect(updated[3].dom.nodeName).toBe('S')
        expect(updated[3].dom).toBe(root.childNodes[3])
    })

    test('removes then recreate reversed', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3}), m('s', {key: 4})]
        const temp = []
        const updated = [m('s', {key: 4}), m('i', {key: 3}), m('b', {key: 2}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(4)
        expect(updated[0].dom.nodeName).toBe('S')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('B')
        expect(updated[2].dom).toBe(root.childNodes[2])
        expect(updated[3].dom.nodeName).toBe('A')
        expect(updated[3].dom).toBe(root.childNodes[3])
    })

    test('removes then recreate smaller', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('a', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
    })

    test('removes then recreate bigger', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('I')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('removes then create different', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('i', {key: 3}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('I')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('S')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('removes then create different smaller', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('i', {key: 3})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(updated[0].dom.nodeName).toBe('I')
        expect(updated[0].dom).toBe(root.childNodes[0])
    })

    test('cached keyed nodes move when the list is reversed', () => {
        const a = m('a', {key: 'a'})
        const b = m('b', {key: 'b'})
        const c = m('c', {key: 'c'})
        const d = m('d', {key: 'd'})

        render(root, [a, b, c, d])
        render(root, [d, c, b, a])

        expect(root.childNodes.length).toBe(4)
        expect(root.childNodes[0].nodeName).toBe('D')
        expect(root.childNodes[1].nodeName).toBe('C')
        expect(root.childNodes[2].nodeName).toBe('B')
        expect(root.childNodes[3].nodeName).toBe('A')
    })

    test('cached keyed nodes move when diffed via the map', () => {
        const onupdate = mock(() => {})
        const a = m('a', {key: 'a', onupdate: onupdate})
        const b = m('b', {key: 'b', onupdate: onupdate})
        const c = m('c', {key: 'c', onupdate: onupdate})
        const d = m('d', {key: 'd', onupdate: onupdate})

        render(root, [a, b, c, d])
        render(root, [b, d, a, c])

        expect(root.childNodes.length).toBe(4)
        expect(root.childNodes[0].nodeName).toBe('B')
        expect(root.childNodes[1].nodeName).toBe('D')
        expect(root.childNodes[2].nodeName).toBe('A')
        expect(root.childNodes[3].nodeName).toBe('C')
        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('removes then create different bigger', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('i', {key: 3}), m('s', {key: 4}), m('div', {key: 5})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('I')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('S')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('DIV')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('removes then create mixed', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('a', {key: 1}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('S')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('removes then create mixed reversed', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('s', {key: 4}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('S')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('removes then create mixed smaller', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3})]
        const temp = []
        const updated = [m('a', {key: 1}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('S')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('removes then create mixed smaller reversed', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2}), m('i', {key: 3})]
        const temp = []
        const updated = [m('s', {key: 4}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('S')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('A')
        expect(updated[1].dom).toBe(root.childNodes[1])
    })

    test('removes then create mixed bigger', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('a', {key: 1}), m('i', {key: 3}), m('s', {key: 4})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('S')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('removes then create mixed bigger reversed', () => {
        const vnodes = [m('a', {key: 1}), m('b', {key: 2})]
        const temp = []
        const updated = [m('s', {key: 4}), m('i', {key: 3}), m('a', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(3)
        expect(updated[0].dom.nodeName).toBe('S')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('I')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[2].dom.nodeName).toBe('A')
        expect(updated[2].dom).toBe(root.childNodes[2])
    })

    test('change type, position and length', () => {
        const vnodes = m('div',
            undefined,
            m('#', 'a'),
        )
        const updated = m('div',
            fragment(m('#', 'b')),
            undefined,
            undefined,
        )

        render(root, vnodes)
        render(root, updated)

        expect(root.firstChild.childNodes.length).toBe(1)
    })

    test('removes then recreates then reverses children', () => {
        const vnodes = [m('a', {key: 1}, m('i', {key: 3}), m('s', {key: 4})), m('b', {key: 2})]
        const temp1 = []
        const temp2 = [m('a', {key: 1}, m('i', {key: 3}), m('s', {key: 4})), m('b', {key: 2})]
        const updated = [m('a', {key: 1}, m('s', {key: 4}), m('i', {key: 3})), m('b', {key: 2})]

        render(root, vnodes)
        render(root, temp1)
        render(root, temp2)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(updated[0].dom.nodeName).toBe('A')
        expect(updated[0].dom).toBe(root.childNodes[0])
        expect(updated[1].dom.nodeName).toBe('B')
        expect(updated[1].dom).toBe(root.childNodes[1])
        expect(updated[0].dom.childNodes.length).toBe(2)
        expect(updated[0].dom.childNodes[0].nodeName).toBe('S')
        expect(updated[0].dom.childNodes[1].nodeName).toBe('I')
    })

    test('removes then recreates nested', () => {
        const vnodes = [m('a', {key: 1}, m('a', {key: 3}, m('a', {key: 5})), m('a', {key: 4}, m('a', {key: 5}))), m('a', {key: 2})]
        const temp = []
        const updated = [m('a', {key: 1}, m('a', {key: 3}, m('a', {key: 5})), m('a', {key: 4}, m('a', {key: 5}))), m('a', {key: 2})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(root.childNodes[0].childNodes.length).toBe(2)
        expect(root.childNodes[0].childNodes[0].childNodes.length).toBe(1)
        expect(root.childNodes[0].childNodes[1].childNodes.length).toBe(1)
        expect(root.childNodes[1].childNodes.length).toBe(0)
    })

    test('doesn\'t recycle', () => {
        const vnodes = [m('div', {key: 1})]
        const temp = []
        const updated = [m('div', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(vnodes[0].dom).not.toBe(updated[0].dom)
        expect(updated[0].dom.nodeName).toBe('DIV')
    })

    test('doesn\'t recycle when not keyed', () => {
        const vnodes = [m('div')]
        const temp = []
        const updated = [m('div')]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(vnodes[0].dom).not.toBe(updated[0].dom)
        expect(updated[0].dom.nodeName).toBe('DIV')
    })

    test('doesn\'t recycle deep', () => {
        const vnodes = [m('div', m('a', {key: 1}))]
        const temp = [m('div')]
        const updated = [m('div', m('a', {key: 1}))]

        render(root, vnodes)

        const oldChild = vnodes[0].dom.firstChild

        render(root, temp)
        render(root, updated)

        expect(oldChild).not.toBe(updated[0].dom.firstChild)
        expect(updated[0].dom.firstChild.nodeName).toBe('A')
    })

    test('mixed unkeyed tags are not broken by recycle', () => {
        const vnodes = [m('a'), m('b')]
        const temp = [m('b')]
        const updated = [m('a'), m('b')]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(root.childNodes[0].nodeName).toBe('A')
        expect(root.childNodes[1].nodeName).toBe('B')
    })

    test('mixed unkeyed vnode types are not broken by recycle', () => {
        const vnodes = [fragment(m('a')), m('b')]
        const temp = [m('b')]
        const updated = [fragment(m('a')), m('b')]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(root.childNodes[0].nodeName).toBe('A')
        expect(root.childNodes[1].nodeName).toBe('B')
    })

    test('onremove doesn\'t fire from nodes in the pool (#1990)', () => {
        const onremove = mock(() => {})
        render(root, [
            m('div', m('div', {onremove: onremove})),
            m('div', m('div', {onremove: onremove})),
        ])
        render(root, [
            m('div', m('div', {onremove: onremove})),
        ])
        render(root, [])

        expect(onremove.mock.calls.length).toBe(2)
    })

    test('cached, non-keyed nodes skip diff', () => {
        const onupdate = mock(() => {})
        const cached = m('a', {onupdate: onupdate})

        render(root, cached)
        render(root, cached)

        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('cached, keyed nodes skip diff', () => {
        const onupdate = mock(() => {})
        const cached = m('a', {key: 'a', onupdate: onupdate})

        render(root, cached)
        render(root, cached)

        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('keyed cached elements are re-initialized when brought back from the pool (#2003)', () => {
        const onupdate = mock(() => {})
        const oncreate = mock(() => {})
        const cached = m('B', {key: 1},
            m('A', {oncreate: oncreate, onupdate: onupdate}, 'A'),
        )
        render(root, m('div', cached))
        render(root, [])
        render(root, m('div', cached))

        expect(oncreate.mock.calls.length).toBe(2)
        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('unkeyed cached elements are re-initialized when brought back from the pool (#2003)', () => {
        const onupdate = mock(() => {})
        const oncreate = mock(() => {})
        const cached = m('B',
            m('A', {oncreate: oncreate, onupdate: onupdate}, 'A'),
        )
        render(root, m('div', cached))
        render(root, [])
        render(root, m('div', cached))

        expect(oncreate.mock.calls.length).toBe(2)
        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('keyed cached elements are re-initialized when brought back from nested pools (#2003)', () => {
        const onupdate = mock(() => {})
        const oncreate = mock(() => {})
        const cached = m('B', {key: 1},
            m('A', {oncreate: oncreate, onupdate: onupdate}, 'A'),
        )
        render(root, m('div', cached))
        render(root, m('div'))
        render(root, [])
        render(root, m('div', cached))

        expect(oncreate.mock.calls.length).toBe(2)
        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('unkeyed cached elements are re-initialized when brought back from nested pools (#2003)', () => {
        const onupdate = mock(() => {})
        const oncreate = mock(() => {})
        const cached = m('B',
            m('A', {oncreate: oncreate, onupdate: onupdate}, 'A'),
        )
        render(root, m('div', cached))
        render(root, m('div'))
        render(root, [])
        render(root, m('div', cached))

        expect(oncreate.mock.calls.length).toBe(2)
        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('null stays in place', () => {
        // Create a unique value we can use to identify the DOM node
        const uniqueAttribute = 'test-' + Math.random()

        const vnodes = [
            m('div'),
            m('a', {'data-test': uniqueAttribute}),
        ]

        const temp = [
            null,
            m('a', {'data-test': uniqueAttribute}),
        ]

        const updated = [
            m('div'),
            m('a', {'data-test': uniqueAttribute}),
        ]

        render(root, vnodes)
        const beforeNodeName = vnodes[1].dom.nodeName
        const beforeAttribute = vnodes[1].dom.getAttribute('data-test')

        render(root, temp)
        render(root, updated)

        // Verify that the node properties match instead of comparing DOM references
        expect(updated[1].dom.nodeName).toBe(beforeNodeName)
        expect(updated[1].dom.getAttribute('data-test')).toBe(beforeAttribute)
        expect(updated[1].dom.getAttribute('data-test')).toBe(uniqueAttribute)
        expect(root.childNodes.length).toBe(2)
        expect(root.childNodes[1].nodeName).toBe(beforeNodeName)
    })

    test('null stays in place if not first', () => {
        // Create a unique value we can use to identify the DOM node
        const uniqueAttribute = 'test-' + Math.random()

        const vnodes = [
            m('b'),
            m('div'),
            m('a', {'data-test': uniqueAttribute}),
        ]

        const temp = [
            m('b'),
            null,
            m('a', {'data-test': uniqueAttribute}),
        ]

        const updated = [
            m('b'),
            m('div'),
            m('a', {'data-test': uniqueAttribute}),
        ]

        render(root, vnodes)
        const beforeNodeName = vnodes[2].dom.nodeName
        const beforeAttribute = vnodes[2].dom.getAttribute('data-test')

        render(root, temp)
        render(root, updated)

        // Verify that the node properties match instead of comparing DOM references
        expect(updated[2].dom.nodeName).toBe(beforeNodeName)
        expect(updated[2].dom.getAttribute('data-test')).toBe(beforeAttribute)
        expect(updated[2].dom.getAttribute('data-test')).toBe(uniqueAttribute)
        expect(root.childNodes.length).toBe(3)
        expect(root.childNodes[2].nodeName).toBe(beforeNodeName)
    })

    test('node is recreated if key changes to undefined', () => {
        const vnode = m('b', {key: 1})
        const updated = m('b')

        render(root, vnode)
        render(root, updated)

        expect(vnode.dom).not.toBe(updated.dom)
    })

    test('don\'t add back elements from fragments that are restored from the pool #1991', () => {
        render(root, [
            fragment(),
            fragment(),
        ])
        render(root, [
            fragment(),
            fragment(
                m('div'),
            ),
        ])
        render(root, [
            fragment(null),
        ])
        render(root, [
            fragment(),
            fragment(),
        ])

        expect(root.childNodes.length).toBe(0)
    })

    test('don\'t add back elements from fragments that are being removed #1991', () => {
        render(root, [
            fragment(),
            m('p'),
        ])
        render(root, [
            fragment(
                m('div', 5),
            ),
        ])
        render(root, [
            fragment(),
            fragment(),
        ])

        expect(root.childNodes.length).toBe(0)
    })

    test('handles null values in unkeyed lists of different length (#2003)', () => {
        const oncreate = mock(() => {})
        const onremove = mock(() => {})
        const onupdate = mock(() => {})

        render(root, [m('div', {oncreate: oncreate, onremove: onremove, onupdate: onupdate}), null])
        render(root, [null, m('div', {oncreate: oncreate, onremove: onremove, onupdate: onupdate}), null])

        expect(oncreate.mock.calls.length).toBe(2)
        expect(onremove.mock.calls.length).toBe(1)
        expect(onupdate.mock.calls.length).toBe(0)
    })

    test('supports changing the element of a keyed element in a list when traversed bottom-up', () => {
        try {
            render(root, [m('a', {key: 2})])
            render(root, [m('b', {key: 1}), m('b', {key: 2})])

            expect(root.childNodes.length).toBe(2)
            expect(root.childNodes[0].nodeName).toBe('B')
            expect(root.childNodes[1].nodeName).toBe('B')
        } catch (e) {
            expect(e).toBe(null)
        }
    })

    test('supports changing the element of a keyed element in a list when looking up nodes using the map', () => {
        try {
            render(root, [m('x', {key: 1}), m('y', {key: 2}), m('z', {key: 3})])
            render(root, [m('b', {key: 2}), m('c', {key: 1}), m('d', {key: 4}), m('e', {key: 3})])

            expect(root.childNodes.length).toBe(4)
            expect(root.childNodes[0].nodeName).toBe('B')
            expect(root.childNodes[1].nodeName).toBe('C')
            expect(root.childNodes[2].nodeName).toBe('D')
            expect(root.childNodes[3].nodeName).toBe('E')
        } catch (e) {
            expect(e).toBe(null)
        }
    })

    test('don\'t fetch the nextSibling from the pool', () => {
        render(root, [fragment(m('div', {key: 1}), m('div', {key: 2})), m('p')])
        render(root, [fragment(), m('p')])
        render(root, [fragment(m('div', {key: 2}), m('div', {key: 1})), m('p')])

        const tagNames = [].map.call(root.childNodes, function(el) {return el.nodeName.toLowerCase()})
        expect(tagNames).toEqual(['div', 'div', 'p'])
    })

    test('minimizes DOM operations when scrambling a keyed lists', () => {
        const vnodes = vnodify('a,b,c,d')
        const updated = vnodify('b,a,d,c')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(2)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('minimizes DOM operations when reversing a keyed lists with an odd number of items', () => {
        const vnodes = vnodify('a,b,c,d')
        const updated = vnodify('d,c,b,a')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(3)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('minimizes DOM operations when reversing a keyed lists with an even number of items', () => {
        const vnodes = [m('a', {key: 'a'}), m('b', {key: 'b'}), m('c', {key: 'c'})]
        const updated = [m('c', {key: 'c'}), m('b', {key: 'b'}), m('a', {key: 'a'})]
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(2)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('minimizes DOM operations when scrambling a keyed lists with prefixes and suffixes', () => {
        const vnodes = vnodify('i,a,b,c,d,j')
        const updated = vnodify('i,b,a,d,c,j')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(2)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('minimizes DOM operations when reversing a keyed lists with an odd number of items with prefixes and suffixes', () => {
        const vnodes = vnodify('i,a,b,c,d,j')
        const updated = vnodify('i,d,c,b,a,j')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(3)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('minimizes DOM operations when reversing a keyed lists with an even number of items with prefixes and suffixes', () => {
        const vnodes = vnodify('i,a,b,c,j')
        const updated = vnodify('i,c,b,a,j')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(2)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('scrambling sample 1', () => {
        const vnodes = vnodify('k0,k1,k2,k3,k4,k5,k6,k7,k8,k9')
        const updated = vnodify('k4,k1,k2,k9,k0,k3,k6,k5,k8,k7')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(5)
        expect(tagNames).toEqual(expectedTagNames)
    })

    test('scrambling sample 2', () => {
        const vnodes = vnodify('k0,k1,k2,k3,k4,k5,k6,k7,k8,k9')
        const updated = vnodify('b,d,k1,k0,k2,k3,k4,a,c,k5,k6,k7,k8,k9')
        const expectedTagNames = updated.map(function(vn) {return vn.tag})

        render(root, vnodes)

        root.appendChild = mock(root.appendChild)
        root.insertBefore = mock(root.insertBefore)

        render(root, updated)

        const tagNames = [].map.call(root.childNodes, function(n) {return n.nodeName.toLowerCase()})

        expect(root.appendChild.mock.calls.length + root.insertBefore.mock.calls.length).toBe(5)
        expect(tagNames).toEqual(expectedTagNames)
    })

    components.forEach(function(cmp) {
        describe(cmp.kind, () => {
            const createComponent = cmp.create

            test('fragment child toggles from null when followed by null component then tag', () => {
                const component = createComponent({view: function() {return null}})
                const vnodes = [fragment(m('a'), m(component), m('b'))]
                const temp = [fragment(null, m(component), m('b'))]
                const updated = [fragment(m('a'), m(component), m('b'))]

                render(root, vnodes)
                render(root, temp)
                render(root, updated)

                expect(root.childNodes.length).toBe(2)
                expect(root.childNodes[0].nodeName).toBe('A')
                expect(root.childNodes[1].nodeName).toBe('B')
            })

            test('fragment child toggles from null in component when followed by null component then tag', () => {
                let flag = true
                const a = createComponent({view: function() {return flag ? m('a') : null}})
                const b = createComponent({view: function() {return null}})
                const vnodes = [fragment(m(a), m(b), m('s'))]
                const temp = [fragment(m(a), m(b), m('s'))]
                const updated = [fragment(m(a), m(b), m('s'))]

                render(root, vnodes)
                flag = false
                render(root, temp)
                flag = true
                render(root, updated)

                expect(root.childNodes.length).toBe(2)
                expect(root.childNodes[0].nodeName).toBe('A')
                expect(root.childNodes[1].nodeName).toBe('S')
            })

            test('removing a component that returns a fragment doesn\'t throw', () => {
                const component = createComponent({
                    view: function() {return fragment(m('a'), m('b'))},
                })

                try {
                    render(root, [m(component)])
                    render(root, [])

                    expect(root.childNodes.length).toBe(0)
                } catch (e) {
                    expect(e).toBe(null)
                }
            })
        })
    })
})
