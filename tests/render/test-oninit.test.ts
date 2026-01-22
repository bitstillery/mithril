// @ts-nocheck
import {describe, test, expect, beforeEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFactory from '../../render/render'
import m from '../../render/hyperscript'
import fragment from '../../render/fragment'
import {spy} from '../../test-utils/test-helpers'

describe('oninit', () => {
	let $window: any, root: any, render: any
	beforeEach(() => {
		$window = domMock()
		root = $window.document.createElement('div')
		render = renderFactory($window)
	})

	test('calls oninit when creating element', () => {
		const callback = spy()
		const vnode = m('div', {oninit: callback})

		render(root, vnode)

		expect(callback.callCount).toBe(1)
		expect((callback as any).this).toBe(vnode.state)
		expect((callback as any).args[0]).toBe(vnode)
	})
	test('calls oninit when creating fragment', () => {
		const callback = spy()
		const vnode = fragment({oninit: callback})

		render(root, vnode)

		expect(callback.callCount).toBe(1)
		expect((callback as any).this).toBe(vnode.state)
		expect((callback as any).args[0]).toBe(vnode)
	})
	test('calls oninit when replacing keyed', () => {
		const createDiv = spy()
		const createA = spy()
		const vnode = m('div', {key: 1, oninit: createDiv})
		const updated = m('a', {key: 1, oninit: createA})

		render(root, vnode)
		render(root, updated)

		expect(createDiv.callCount).toBe(1)
		expect((createDiv as any).this).toBe(vnode.state)
		expect((createDiv as any).args[0]).toBe(vnode)
		expect(createA.callCount).toBe(1)
		expect((createA as any).this).toBe(updated.state)
		expect((createA as any).args[0]).toBe(updated)
	})
	test('does not call oninit when noop', () => {
		const create = spy()
		const update = spy()
		const vnode = m('div', {oninit: create})
		const updated = m('div', {oninit: update})

		render(root, vnode)
		render(root, updated)

		expect(create.callCount).toBe(1)
		expect((create as any).this).toBe(vnode.state)
		expect((create as any).args[0]).toBe(vnode)
		expect(update.callCount).toBe(0)
	})
	test('does not call oninit when updating attr', () => {
		const create = spy()
		const update = spy()
		const vnode = m('div', {oninit: create})
		const updated = m('div', {oninit: update, id: 'a'})

		render(root, vnode)
		render(root, updated)

		expect(create.callCount).toBe(1)
		expect((create as any).this).toBe(vnode.state)
		expect((create as any).args[0]).toBe(vnode)
		expect(update.callCount).toBe(0)
	})
	test('does not call oninit when updating children', () => {
		const create = spy()
		const update = spy()
		const vnode = m('div', {oninit: create}, m('a'))
		const updated = m('div', {oninit: update}, m('b'))

		render(root, vnode)
		render(root, updated)

		expect(create.callCount).toBe(1)
		expect((create as any).this).toBe(vnode.state)
		expect((create as any).args[0]).toBe(vnode)
		expect(update.callCount).toBe(0)
	})
	test('does not call oninit when updating keyed', () => {
		const create = spy()
		const update = spy()
		const vnode = m('div', {key: 1, oninit: create})
		const otherVnode = m('a', {key: 2})
		const updated = m('div', {key: 1, oninit: update})
		const otherUpdated = m('a', {key: 2})

		render(root, [vnode, otherVnode])
		render(root, [otherUpdated, updated])

		expect(create.callCount).toBe(1)
		expect((create as any).this).toBe(vnode.state)
		expect((create as any).args[0]).toBe(vnode)
		expect(update.callCount).toBe(0)
	})
	test('does not call oninit when removing', () => {
		const create = spy()
		const vnode = m('div', {oninit: create})

		render(root, vnode)
		render(root, [])

		expect(create.callCount).toBe(1)
		expect((create as any).this).toBe(vnode.state)
		expect((create as any).args[0]).toBe(vnode)
	})
	test('calls oninit when recycling', () => {
		const create = spy()
		const update = spy()
		const vnode = m('div', {key: 1, oninit: create})
		const updated = m('div', {key: 1, oninit: update})

		render(root, vnode)
		render(root, [])
		render(root, updated)

		expect(create.callCount).toBe(1)
		expect((create as any).this).toBe(vnode.state)
		expect((create as any).args[0]).toBe(vnode)
		expect(update.callCount).toBe(1)
		expect((update as any).this).toBe(updated.state)
		expect((update as any).args[0]).toBe(updated)
	})
	test('calls oninit at the same step as onupdate', () => {
		const create = spy()
		const update = spy()
		const callback = spy()
		const vnode = m('div', {onupdate: create})
		const updated = m('div', {onupdate: update}, m('a', {oninit: callback}))

		render(root, vnode)
		render(root, updated)

		expect(create.callCount).toBe(0)
		expect(update.callCount).toBe(1)
		expect((update as any).this).toBe(vnode.state)
		expect((update as any).args[0]).toBe(updated)
		expect(callback.callCount).toBe(1)
		expect((callback as any).this).toBe(updated.children[0].state)
		expect((callback as any).args[0]).toBe(updated.children[0])
	})
	test('calls oninit before full DOM creation', () => {
		let called = false
		const vnode = m('div',
			m('a', {oninit: create},
				m('b'),
			),
		)

		render(root, vnode)

		function create(vnode: any) {
			called = true

			expect(vnode.dom).toBe(undefined)
			expect(root.childNodes.length).toBe(1)
		}
		expect(called).toBe(true)
	})
	test('does not set oninit as an event handler', () => {
		const create = spy()
		const vnode = m('div', {oninit: create})

		render(root, vnode)

		expect(vnode.dom.oninit).toBe(undefined)
		expect(vnode.dom.attributes['oninit']).toBe(undefined)
	})

	test('No spurious oninit calls in mapped keyed diff when the pool is involved (#1992)', () => {
		const oninit1 = spy()
		const oninit2 = spy()
		const oninit3 = spy()

		render(root, [
			m('p', {key: 1, oninit: oninit1}),
			m('p', {key: 2, oninit: oninit2}),
			m('p', {key: 3, oninit: oninit3}),
		])
		render(root, [
			m('p', {key: 1, oninit: oninit1}),
			m('p', {key: 3, oninit: oninit3}),
		])
		render(root, [
			m('p', {key: 3, oninit: oninit3}),
		])

		expect(oninit1.callCount).toBe(1)
		expect(oninit2.callCount).toBe(1)
		expect(oninit3.callCount).toBe(1)
	})
})
