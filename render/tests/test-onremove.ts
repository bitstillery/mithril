import {describe, test, expect, beforeEach, mock} from 'bun:test'

import components from '../../test-utils/components'
import domMock from '../../test-utils/domMock'
import vdom from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'
import callAsync from '../../test-utils/callAsync'

describe('onremove', () => {
    let $window, root, render
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = vdom($window)
    })

    test('does not call onremove when creating', () => {
        const create = mock(() => {})
        const update = mock(() => {})
        const vnode = m('div', {onremove: create})
        const updated = m('div', {onremove: update})

        render(root, vnode)
        render(root, updated)

        expect(create.mock.calls.length).toBe(0)
    })

    test('does not call onremove when updating', () => {
        const create = mock(() => {})
        const update = mock(() => {})
        const vnode = m('div', {onremove: create})
        const updated = m('div', {onremove: update})

        render(root, vnode)
        render(root, updated)

        expect(create.mock.calls.length).toBe(0)
        expect(update.mock.calls.length).toBe(0)
    })

    test('calls onremove when removing element', () => {
        const remove = mock(function(vnode) {
            // Using function to preserve this context
            expect(this).toBe(vnode.state)
        })
        const vnode = m('div', {onremove: remove})

        render(root, vnode)
        render(root, [])

        expect(remove.mock.calls.length).toBe(1)
        expect(remove.mock.calls[0][0]).toBe(vnode)
    })

    test('calls onremove when removing fragment', () => {
        const remove = mock(function(vnode) {
            // Using function to preserve this context
            expect(this).toBe(vnode.state)
        })
        const vnode = fragment({onremove: remove})

        render(root, vnode)
        render(root, [])

        expect(remove.mock.calls.length).toBe(1)
        expect(remove.mock.calls[0][0]).toBe(vnode)
    })

    test('does not set onremove as an event handler', () => {
        const remove = mock(() => {})
        const vnode = m('div', {onremove: remove})

        render(root, vnode)

        expect(vnode.dom.onremove).toBe(undefined)
        expect(vnode.dom.attributes['onremove']).toBe(undefined)
        expect(vnode.events).toBe(undefined)
    })

    test('calls onremove on keyed nodes', () => {
        const remove = mock(() => {})
        const vnodes = [m('div', {key: 1})]
        const temp = [m('div', {key: 2, onremove: remove})]
        const updated = [m('div', {key: 1})]

        render(root, vnodes)
        render(root, temp)
        render(root, updated)

        expect(vnodes[0].dom).not.toBe(updated[0].dom) // this used to be a recycling pool test
        expect(remove.mock.calls.length).toBe(1)
    })

    test('does not recycle when there\'s an onremove', () => {
        const remove = mock(() => {})
        const vnode = m('div', {key: 1, onremove: remove})
        const updated = m('div', {key: 1, onremove: remove})

        render(root, vnode)
        render(root, [])
        render(root, updated)

        expect(vnode.dom).not.toBe(updated.dom)
    })

    components.forEach((cmp) => {
        describe(cmp.kind, () => {
            const createComponent = cmp.create

            test('calls onremove on nested component', () => {
                const spy = mock(() => {})
                const comp = createComponent({
                    view: function() {return m(outer)},
                })
                const outer = createComponent({
                    view: function() {return m(inner)},
                })
                const inner = createComponent({
                    onremove: spy,
                    view: function() {return m('div')},
                })
                render(root, m(comp))
                render(root, null)

                expect(spy.mock.calls.length).toBe(1)
            })

            test('calls onremove on nested component child', () => {
                const spy = mock(() => {})
                const comp = createComponent({
                    view: function() {return m(outer)},
                })
                const outer = createComponent({
                    view: function() {return m(inner, m('a', {onremove: spy}))},
                })
                const inner = createComponent({
                    view: function(vnode) {return m('div', vnode.children)},
                })
                render(root, m(comp))
                render(root, null)

                expect(spy.mock.calls.length).toBe(1)
            })

            test('doesn\'t call onremove on children when the corresponding view returns null (after removing the parent)', () => {
                let threw = false
                const spy = mock(() => {})
                const parent = createComponent({
                    view: function() {},
                })
                const child = createComponent({
                    view: function() {},
                    onremove: spy,
                })
                render(root, m(parent, m(child)))
                try {
                    render(root, null)
                } catch (e) {
                    threw = e
                }

                expect(spy.mock.calls.length).toBe(0)
                expect(threw).toBe(false)
            })

            test('doesn\'t call onremove on children when the corresponding view returns null (after removing the children)', () => {
                let threw = false
                const spy = mock(() => {})
                const parent = createComponent({
                    view: function() {},
                })
                const child = createComponent({
                    view: function() {},
                    onremove: spy,
                })
                render(root, m(parent, m(child)))
                try {
                    render(root, m(parent))
                } catch (e) {
                    threw = true
                }

                expect(spy.mock.calls.length).toBe(0)
                expect(threw).toBe(false)
            })

            test('onremove doesn\'t fire on nodes that go from pool to pool (#1990)', () => {
                const onremove = mock(() => {})

                render(root, [m('div', m('div')), m('div', m('div', {onremove: onremove}))])
                render(root, [m('div', m('div'))])
                render(root, [])

                expect(onremove.mock.calls.length).toBe(0)
            })

            test('doesn\'t fire when removing the children of a node that\'s brought back from the pool (#1991 part 2)', () => {
                const onremove = mock(() => {})
                const vnode = m('div', {key: 1}, m('div', {onremove: onremove}))
                const temp = m('div', {key: 2})
                const updated = m('div', {key: 1}, m('p'))

                render(root, vnode)
                render(root, temp)
                render(root, updated)

                expect(vnode.dom).not.toBe(updated.dom) // this used to be a recycling pool test
                expect(onremove.mock.calls.length).toBe(1)
            })

            // Warning: this test is complicated because it's replicating a race condition.
            test('removes correct nodes in fragment when child delays removal, parent removes, then child resolves', (done) => {
                // Custom assertion - we need to test the entire tree for consistency.
                const template = (tpl) => (root) => {
                    const expected = []

                    for (let i = 0; i < tpl.length; i++) {
                        const name = tpl[i][0]
                        const text = tpl[i][1]
                        expected.push({
                            name: name,
                            firstType: name === '#text' ? null : '#text',
                            text: text,
                        })
                    }

                    const actual = []
                    const list = root.firstChild.childNodes
                    for (let i = 0; i < list.length; i++) {
                        const current = list[i]
                        const textNode = current.childNodes.length === 1
                            ? current.firstChild
                            : current
                        actual.push({
                            name: current.nodeName,
                            firstType: textNode === current ? null : textNode.nodeName,
                            text: textNode.nodeValue,
                        })
                    }
					
                    const actualStr = JSON.stringify(actual, null, '  ')
                    const expectedStr = JSON.stringify(expected, null, '  ')
                    return {
                        pass: actualStr === expectedStr,
                        message: `${expectedStr}\n  expected, got\n${actualStr}`,
                    }
                }
				
                let thenCB1
                let thenCB2
                const C = createComponent({
                    view({children}) {return children},
                    onbeforeremove() {
                        return {then(resolve) {thenCB1 = resolve}}
                    },
                })
				
                function update(id, showParent, showChild) {
                    const removeParent = mock(() => {})
                    const removeSyncChild = mock(() => {})
                    const removeAsyncChild = mock(() => {})

                    render(root,
                        m('div',
                            showParent && fragment(
                                {onremove: removeParent},
                                m('a', {onremove: removeSyncChild}, 'sync child'),
                                showChild && m(C, {
                                    onbeforeremove: function() {
                                        return {then(resolve) {thenCB2 = resolve}}
                                    },
                                    onremove: removeAsyncChild,
                                }, m('div', id)),
                            ),
                        ),
                    )
                    return {removeAsyncChild, removeParent, removeSyncChild}
                }

                const hooks1 = update('1', true, true)
                expect(root).toMatchObject(template([
                    ['A', 'sync child'],
                    ['DIV', '1'],
                ]))
                expect(thenCB1).toBe(undefined)
                expect(thenCB2).toBe(undefined)

                const hooks2 = update('2', true, false)

                expect(root).toMatchObject(template([
                    ['A', 'sync child'],
                    ['DIV', '1'],
                ]))
                expect(thenCB1).toBe(undefined)
                expect(thenCB2).toBe(undefined)

                // Promises (micro-tasks) are processed before the callAsync callback.
                callAsync(() => {
                    expect(typeof thenCB1).toBe('function')
                    expect(typeof thenCB2).toBe('function')

                    const original1 = thenCB1
                    const original2 = thenCB2

                    const hooks3 = update('3', true, true)

                    expect(root).toMatchObject(template([
                        ['A', 'sync child'],
                        ['DIV', '1'],
                        ['DIV', '3'],
                    ]))

                    expect(hooks3.removeParent.mock.calls.length).toBe(0)
                    expect(hooks3.removeSyncChild.mock.calls.length).toBe(0)
                    expect(hooks3.removeAsyncChild.mock.calls.length).toBe(0)
                    expect(thenCB1).toBe(original1)
                    expect(thenCB2).toBe(original2)

                    const hooks4 = update('4', false, true)

                    expect(root).toMatchObject(template([
                        ['DIV', '1'],
                    ]))

                    expect(hooks3.removeParent.mock.calls.length).toBe(1)
                    expect(hooks3.removeSyncChild.mock.calls.length).toBe(1)
                    expect(hooks3.removeAsyncChild.mock.calls.length).toBe(1)
                    expect(hooks3.removeParent.mock.calls[0][0].tag).toBe('[')
                    expect(thenCB1).toBe(original1)
                    expect(thenCB2).toBe(original2)

                    const hooks5 = update('5', true, true)

                    expect(root).toMatchObject(template([
                        ['DIV', '1'],
                        ['A', 'sync child'],
                        ['DIV', '5'],
                    ]))
                    expect(thenCB1).toBe(original1)
                    expect(thenCB2).toBe(original2)

                    expect(hooks1.removeAsyncChild.mock.calls.length).toBe(0)

                    expect(hooks2.removeParent.mock.calls.length).toBe(0)
                    expect(hooks2.removeSyncChild.mock.calls.length).toBe(1)
                    expect(hooks2.removeAsyncChild.mock.calls.length).toBe(0)

                    thenCB1()

                    expect(hooks1.removeAsyncChild.mock.calls.length).toBe(0)
                    callAsync(() => {
                        expect(hooks1.removeAsyncChild.mock.calls.length).toBe(0)

                        thenCB2()

                        expect(hooks1.removeAsyncChild.mock.calls.length).toBe(0)
                        callAsync(() => {
                            expect(hooks1.removeAsyncChild.mock.calls.length).toBe(1)

                            expect(root).toMatchObject(template([
                                ['A', 'sync child'],
                                ['DIV', '5'],
                            ]))
                            expect(thenCB1).toBe(original1)
                            expect(thenCB2).toBe(original2)

                            const hooks6 = update('6', true, true)

                            expect(root).toMatchObject(template([
                                ['A', 'sync child'],
                                ['DIV', '6'],
                            ]))
                            expect(thenCB1).toBe(original1)
                            expect(thenCB2).toBe(original2)

                            // final tally
                            expect(hooks1.removeParent.mock.calls.length).toBe(0)
                            expect(hooks1.removeSyncChild.mock.calls.length).toBe(1)
                            expect(hooks1.removeAsyncChild.mock.calls.length).toBe(1)

                            expect(hooks2.removeParent.mock.calls.length).toBe(0)
                            expect(hooks2.removeSyncChild.mock.calls.length).toBe(1)
                            expect(hooks2.removeAsyncChild.mock.calls.length).toBe(0)

                            expect(hooks3.removeParent.mock.calls.length).toBe(1)
                            expect(hooks3.removeSyncChild.mock.calls.length).toBe(1)
                            expect(hooks3.removeAsyncChild.mock.calls.length).toBe(1)

                            expect(hooks4.removeParent.mock.calls.length).toBe(0)
                            expect(hooks4.removeSyncChild.mock.calls.length).toBe(0)
                            expect(hooks4.removeAsyncChild.mock.calls.length).toBe(0)

                            expect(hooks5.removeParent.mock.calls.length).toBe(0)
                            expect(hooks5.removeSyncChild.mock.calls.length).toBe(0)
                            expect(hooks5.removeAsyncChild.mock.calls.length).toBe(0)

                            expect(hooks6.removeParent.mock.calls.length).toBe(0)
                            expect(hooks6.removeSyncChild.mock.calls.length).toBe(0)
                            expect(hooks6.removeAsyncChild.mock.calls.length).toBe(0)

                            done()
                        })
                    })
                })
            })
        })
    })
})
