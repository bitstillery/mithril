import {describe, test, expect, beforeEach, mock} from 'bun:test'

import callAsync from '../../test-utils/callAsync'
import components from '../../test-utils/components'
import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'

describe('onbeforeremove', () => {
    let $window, root, render
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    test('does not call onbeforeremove when creating', () => {
        const create = mock(() => {})
        const vnode = m('div', {onbeforeremove: create})

        render(root, vnode)

        expect(create.mock.calls.length).toBe(0)
    })

    test('does not call onbeforeremove when updating', () => {
        const create = mock(() => {})
        const update = mock(() => {})
        const vnode = m('div', {onbeforeremove: create})
        const updated = m('div', {onbeforeremove: update})

        render(root, vnode)
        render(root, updated)

        expect(create.mock.calls.length).toBe(0)
        expect(update.mock.calls.length).toBe(0)
    })

    test('calls onbeforeremove when removing element', (done) => {
        const vnode = m('div', {onbeforeremove: remove})

        render(root, vnode)
        render(root, [])

        function remove(node) {
            expect(node).toBe(vnode)
            expect(this).toBe(vnode.state)
            expect(this != null && typeof this === 'object').toBe(true)
            expect(root.childNodes.length).toBe(1)
            expect(root.firstChild).toBe(vnode.dom)

            callAsync(() => {
                expect(root.childNodes.length).toBe(0)
                done()
            })
        }
    })

    test('calls onbeforeremove when removing fragment', (done) => {
        const vnode = fragment({onbeforeremove: remove}, m('div'))

        render(root, vnode)
        render(root, [])

        function remove(node) {
            expect(node).toBe(vnode)
            expect(root.childNodes.length).toBe(1)
            expect(root.firstChild).toBe(vnode.dom)

            callAsync(() => {
                expect(root.childNodes.length).toBe(0)
                done()
            })
        }
    })

    test('calls onremove after onbeforeremove resolves', (done) => {
        const spy = mock(() => {})
        const vnode = fragment({onbeforeremove: onbeforeremove, onremove: spy}, 'a')

        render(root, vnode)
        render(root, [])

        function onbeforeremove(node) {
            expect(node).toBe(vnode)
            expect(root.childNodes.length).toBe(1)
            expect(root.firstChild).toBe(vnode.dom)
            expect(spy.mock.calls.length).toBe(0)

            callAsync(() => {
                expect(root.childNodes.length).toBe(0)
                expect(spy.mock.calls.length).toBe(1)
                done()
            })
        }
    })

    test('does not set onbeforeremove as an event handler', () => {
        const remove = mock(() => {})
        const vnode = m('div', {onbeforeremove: remove})

        render(root, vnode)

        expect(vnode.dom.onbeforeremove).toBe(undefined)
        expect(vnode.dom.attributes['onbeforeremove']).toBe(undefined)
    })

    test('does not leave elements out of order during removal', (done) => {
        const remove = function() {return Promise.resolve()}
        const vnodes = [m('div', {key: 1, onbeforeremove: remove}, '1'), m('div', {key: 2, onbeforeremove: remove}, '2')]
        const updated = m('div', {key: 2, onbeforeremove: remove}, '2')

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(2)
        expect(root.firstChild.firstChild.nodeValue).toBe('1')

        callAsync(() => {
            expect(root.childNodes.length).toBe(1)
            expect(root.firstChild.firstChild.nodeValue).toBe('2')
            done()
        })
    })

    test('handles thenable objects (#2592)', (done) => {
        const remove = function() {return {then: function(resolve) {resolve()}}}
        const vnodes = m('div', {key: 1, onbeforeremove: remove}, 'a')
        const updated = []

        render(root, vnodes)
        render(root, updated)

        expect(root.childNodes.length).toBe(1)
        expect(root.firstChild.firstChild.nodeValue).toBe('a')

        callAsync(() => {
            expect(root.childNodes.length).toBe(0)
            done()
        })
    })

    components.forEach(function(cmp) {
        describe(cmp.kind, () => {
            const createComponent = cmp.create

            test('finalizes the remove phase asynchronously when promise is returned synchronously from both attrs- and tag.onbeforeremove', (done) => {
                const onremove = mock(() => {})
                const onbeforeremove = function() {return Promise.resolve()}
                const component = createComponent({
                    onbeforeremove: onbeforeremove,
                    onremove: onremove,
                    view: function() {},
                })
                render(root, m(component, {onbeforeremove: onbeforeremove, onremove: onremove}))
                render(root, [])
                callAsync(() => {
                    expect(onremove.mock.calls.length).toBe(2) // once for `tag`, once for `attrs`
                    done()
                })
            })

            test('awaits promise resolution before removing the node', (done) => {
                const view = mock(() => {})
                const onremove = mock(() => {})
                const onbeforeremove = function() {return new Promise(function(resolve) {callAsync(resolve)})}
                const component = createComponent({
                    onbeforeremove: onbeforeremove,
                    onremove: onremove,
                    view: view,
                })
                render(root, m(component))
                render(root, [])

                expect(onremove.mock.calls.length).toBe(0)
                callAsync(() => {
                    callAsync(() => {
                        expect(onremove.mock.calls.length).toBe(1)
                        done()
                    })
                })
            })
        })
    })
})
