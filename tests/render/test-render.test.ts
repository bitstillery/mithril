// @ts-nocheck
import {describe, test, expect, beforeEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFactory from '../../render/render'
import m from '../../render/hyperscript'
import {spy} from '../../test-utils/test-helpers'

describe('render', () => {
	let $window: any, root: any, render: any
	beforeEach(() => {
		$window = domMock()
		root = $window.document.createElement('div')
		render = renderFactory($window)
	})

	test('initializes without DOM', () => {
		renderFactory()
	})

	test('renders plain text', () => {
		render(root, 'a')
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].nodeValue).toBe('a')
	})

	test('updates plain text', () => {
		render(root, 'a')
		render(root, 'b')
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].nodeValue).toBe('b')
	})

	test('renders a number', () => {
		render(root, 1)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].nodeValue).toBe('1')
	})

	test('updates a number', () => {
		render(root, 1)
		render(root, 2)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].nodeValue).toBe('2')
	})

	test('overwrites existing content', () => {
		const vnodes: any[] = []

		root.appendChild($window.document.createElement('div'))

		render(root, vnodes)

		expect(root.childNodes.length).toBe(0)
	})

	test('throws on invalid root node', () => {
		let threw = false
		try {
			render(null, [])
		} catch(_e) {
			threw = true
		}
		expect(threw).toBe(true)
	})

	test('does not enter infinite loop when oninit triggers render and view throws with an object literal component', (done) => {
		const A = {
			oninit: init,
			view: function() {throw new Error('error')},
		}
		function run() {
			render(root, m(A))
		}
		function init() {
			setTimeout(function() {
				let threwInner = false
				try {run()} catch(_e) {threwInner = true}

				expect(threwInner).toBe(false)
				done()
			}, 0)
		}

		let threwOuter = false
		try {run()} catch(_e) {threwOuter = true}

		expect(threwOuter).toBe(true)
	})
	test('does not try to re-initialize a constructibe component whose view has thrown', () => {
		const oninit = spy()
		const onbeforeupdate = spy()
		function A() {}
		A.prototype.view = function() {throw new Error('error')}
		A.prototype.oninit = oninit
		A.prototype.onbeforeupdate = onbeforeupdate
		let throwCount = 0

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)
	})
	test('does not try to re-initialize a constructible component whose oninit has thrown', () => {
		const oninit = spy(function() {throw new Error('error')})
		const onbeforeupdate = spy()
		function A() {}
		A.prototype.view = function() {}
		A.prototype.oninit = oninit
		A.prototype.onbeforeupdate = onbeforeupdate
		let throwCount = 0

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)
	})
	test('does not try to re-initialize a constructible component whose constructor has thrown', () => {
		const oninit = spy()
		const onbeforeupdate = spy()
		function A() {throw new Error('error')}
		A.prototype.view = function() {}
		A.prototype.oninit = oninit
		A.prototype.onbeforeupdate = onbeforeupdate
		let throwCount = 0

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(0)
		expect(onbeforeupdate.callCount).toBe(0)

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(0)
		expect(onbeforeupdate.callCount).toBe(0)
	})
	test('does not try to re-initialize a closure component whose view has thrown', () => {
		const oninit = spy()
		const onbeforeupdate = spy()
		function A() {
			return {
				view: function() {throw new Error('error')},
				oninit: oninit,
				onbeforeupdate: onbeforeupdate,
			}
		}
		let throwCount = 0
		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)
	})
	test('does not try to re-initialize a closure component whose oninit has thrown', () => {
		const oninit = spy(function() {throw new Error('error')})
		const onbeforeupdate = spy()
		function A() {
			return {
				view: function() {},
				oninit: oninit,
				onbeforeupdate: onbeforeupdate,
			}
		}
		let throwCount = 0
		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
		expect(oninit.callCount).toBe(1)
		expect(onbeforeupdate.callCount).toBe(0)
	})
	test('does not try to re-initialize a closure component whose closure has thrown', () => {
		function A() {
			throw new Error('error')
		}
		let throwCount = 0
		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)

		try {render(root, m(A))} catch(_e) {throwCount++}

		expect(throwCount).toBe(1)
	})
	test('lifecycle methods work in keyed children of recycled keyed', () => {
		const createA = spy()
		const updateA = spy()
		const removeA = spy()
		const createB = spy()
		const updateB = spy()
		const removeB = spy()
		const a = function() {
			return m('div', {key: 1},
				m('div', {key: 11, oncreate: createA, onupdate: updateA, onremove: removeA}),
				m('div', {key: 12}),
			)
		}
		const b = function() {
			return m('div', {key: 2},
				m('div', {key: 21, oncreate: createB, onupdate: updateB, onremove: removeB}),
				m('div', {key: 22}),
			)
		}
		render(root, a())
		render(root, b())
		render(root, a())

		expect(createA.callCount).toBe(2)
		expect(updateA.callCount).toBe(0)
		expect(removeA.callCount).toBe(1)
		expect(createB.callCount).toBe(1)
		expect(updateB.callCount).toBe(0)
		expect(removeB.callCount).toBe(1)
	})
	test('lifecycle methods work in unkeyed children of recycled keyed', () => {
		const createA = spy()
		const updateA = spy()
		const removeA = spy()
		const createB = spy()
		const updateB = spy()
		const removeB = spy()
		const a = function() {
			return m('div', {key: 1},
				m('div', {oncreate: createA, onupdate: updateA, onremove: removeA}),
			)
		}
		const b = function() {
			return m('div', {key: 2},
				m('div', {oncreate: createB, onupdate: updateB, onremove: removeB}),
			)
		}
		render(root, a())
		render(root, b())
		render(root, a())

		expect(createA.callCount).toBe(2)
		expect(updateA.callCount).toBe(0)
		expect(removeA.callCount).toBe(1)
		expect(createB.callCount).toBe(1)
		expect(updateB.callCount).toBe(0)
		expect(removeB.callCount).toBe(1)
	})
	test('update lifecycle methods work on children of recycled keyed', () => {
		const createA = spy()
		const updateA = spy()
		const removeA = spy()
		const createB = spy()
		const updateB = spy()
		const removeB = spy()

		const a = function() {
			return m('div', {key: 1},
				m('div', {oncreate: createA, onupdate: updateA, onremove: removeA}),
			)
		}
		const b = function() {
			return m('div', {key: 2},
				m('div', {oncreate: createB, onupdate: updateB, onremove: removeB}),
			)
		}
		render(root, a())
		render(root, a())
		expect(createA.callCount).toBe(1)
		expect(updateA.callCount).toBe(1)
		expect(removeA.callCount).toBe(0)

		render(root, b())
		expect(createA.callCount).toBe(1)
		expect(updateA.callCount).toBe(1)
		expect(removeA.callCount).toBe(1)

		render(root, a())
		render(root, a())

		expect(createA.callCount).toBe(2)
		expect(updateA.callCount).toBe(2)
		expect(removeA.callCount).toBe(1)
	})
	test('svg namespace is preserved in keyed diff (#1820)', () => {
		// note that this only exerciese one branch of the keyed diff algo
		let svg = m('svg',
			m('g', {key: 0}),
			m('g', {key: 1}),
		)
		render(root, svg)

		expect(svg.dom.namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(svg.dom.childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(svg.dom.childNodes[1].namespaceURI).toBe('http://www.w3.org/2000/svg')

		svg = m('svg',
			m('g', {key: 1, x: 1}),
			m('g', {key: 2, x: 2}),
		)
		render(root, svg)

		expect(svg.dom.namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(svg.dom.childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(svg.dom.childNodes[1].namespaceURI).toBe('http://www.w3.org/2000/svg')
	})
	test('the namespace of the root is passed to children', () => {
		render(root, m('svg'))
		expect(root.childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
		render(root.childNodes[0], m('g'))
		expect(root.childNodes[0].childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
	})
	test('does not allow reentrant invocations', () => {
		const thrown: string[] = []
		function A() {
			let updated = false
			try {render(root, m(A))} catch(_e) {thrown.push('construct')}
			return {
				oninit: function() {
					try {render(root, m(A))} catch(_e) {thrown.push('oninit')}
				},
				oncreate: function() {
					try {render(root, m(A))} catch(_e) {thrown.push('oncreate')}
				},
				onbeforeupdate: function() {
					try {render(root, m(A))} catch(_e) {thrown.push('onbeforeupdate')}
				},
				onupdate: function() {
					if (updated) return
					updated = true
					try {render(root, m(A))} catch(_e) {thrown.push('onupdate')}
				},
				onbeforeremove: function() {
					try {render(root, m(A))} catch(_e) {thrown.push('onbeforeremove')}
				},
				onremove: function() {
					try {render(root, m(A))} catch(_e) {thrown.push('onremove')}
				},
				view: function() {
					try {render(root, m(A))} catch(_e) {thrown.push('view')}
				},
			}
		}
		render(root, m(A))
		expect(thrown).toEqual([
			'construct',
			'oninit',
			'view',
			'oncreate',
		])
		render(root, m(A))
		expect(thrown).toEqual([
			'construct',
			'oninit',
			'view',
			'oncreate',
			'onbeforeupdate',
			'view',
			'onupdate',
		])
		render(root, [])
		expect(thrown).toEqual([
			'construct',
			'oninit',
			'view',
			'oncreate',
			'onbeforeupdate',
			'view',
			'onupdate',
			'onbeforeremove',
			'onremove',
		])
	})
})
