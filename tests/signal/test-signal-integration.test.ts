import {describe, test, expect, beforeEach} from 'bun:test'

import {signal, computed} from '../../signal'
import {store as storeFn} from '../../store'
import m from '../../index'
import domMock from '../../test-utils/domMock'
import throttleMock from '../../test-utils/throttleMock'

describe('Signal Integration - Component Redraws', () => {
	let $window: any
	let root: Element
	let mockThrottle: any

	beforeEach(() => {
		$window = domMock()
		root = $window.document.createElement('div')
		mockThrottle = throttleMock()
		// Override requestAnimationFrame to use throttleMock
		$window.requestAnimationFrame = mockThrottle.schedule
		if (typeof global !== 'undefined') {
			global.window = $window
			global.requestAnimationFrame = mockThrottle.schedule
		}
	})

	test('component redraws when signal changes', () => {
		const s = signal(0)
		let renderCount = 0

		const Component = {
			view() {
				renderCount++
				return m('div', s.value)
			},
		}

		m.mount(root, Component)
		expect(renderCount).toBe(1)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('0')

		s.value = 10
		// Component-level redraw should happen synchronously
		expect(renderCount).toBe(2)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('10')
	})

	test('only affected component redraws (fine-grained)', () => {
		const s1 = signal(0)
		const s2 = signal('a')

		let renderCount1 = 0
		let renderCount2 = 0

		const Component1 = {
			view() {
				renderCount1++
				return m('div', s1.value)
			},
		}

		const Component2 = {
			view() {
				renderCount2++
				return m('div', s2.value)
			},
		}

		const root1 = $window.document.createElement('div')
		const root2 = $window.document.createElement('div')

		m.mount(root1, Component1)
		m.mount(root2, Component2)

		expect(renderCount1).toBe(1)
		expect(renderCount2).toBe(1)

		// Change s1 - only Component1 should redraw (synchronously)
		s1.value = 10
		expect(renderCount1).toBe(2)
		expect(renderCount2).toBe(1) // Should not redraw

		// Change s2 - only Component2 should redraw (synchronously)
		s2.value = 'b'
		expect(renderCount1).toBe(2) // Should not redraw again
		expect(renderCount2).toBe(2)
	})

	test('component cleanup removes signal dependencies', () => {
		const s = signal(0)
		let renderCount = 0

		const Component = {
			view() {
				renderCount++
				return m('div', s.value)
			},
		}

		m.mount(root, Component)
		expect(renderCount).toBe(1)

		// Unmount component
		m.mount(root, null)

		// Change signal - component should not redraw
		s.value = 10
		expect(renderCount).toBe(1) // Should still be 1
	})

	test('multiple components can use same signal', () => {
		const s = signal(0)

		let renderCount1 = 0
		let renderCount2 = 0

		const Component1 = {
			view() {
				renderCount1++
				return m('div', `C1: ${s.value}`)
			},
		}

		const Component2 = {
			view() {
				renderCount2++
				return m('div', `C2: ${s.value}`)
			},
		}

		const root1 = $window.document.createElement('div')
		const root2 = $window.document.createElement('div')

		m.mount(root1, Component1)
		m.mount(root2, Component2)

		expect(renderCount1).toBe(1)
		expect(renderCount2).toBe(1)

		// Change signal - both should redraw (synchronously)
		s.value = 10
		expect(renderCount1).toBe(2)
		expect(renderCount2).toBe(2)
	})

	test('computed signal triggers component redraw', () => {
		const a = signal(1)
		const b = signal(2)
		const sum = computed(() => a.value + b.value)

		let renderCount = 0

		const Component = {
			view() {
				renderCount++
				return m('div', sum.value)
			},
		}

		m.mount(root, Component)
		expect(renderCount).toBe(1)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('3')

		// Change dependency - component should redraw (synchronously)
		a.value = 10
		expect(renderCount).toBe(2)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('12')
	})
})

describe('Store Integration - Component Redraws', () => {
	let $window: any
	let root: Element
	let mockThrottle: any

	beforeEach(() => {
		$window = domMock()
		root = $window.document.createElement('div')
		mockThrottle = throttleMock()
		$window.requestAnimationFrame = mockThrottle.schedule
		if (typeof global !== 'undefined') {
			global.window = $window
			global.requestAnimationFrame = mockThrottle.schedule
		}
	})

	test('component redraws when store property changes', () => {
		const $s = storeFn({count: 0})
		let renderCount = 0

		const Component = {
			view() {
				renderCount++
				return m('div', $s.count)
			},
		}

		m.mount(root, Component)
		expect(renderCount).toBe(1)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('0')

		$s.count = 10
		// Component-level redraw should happen synchronously
		expect(renderCount).toBe(2)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('10')
	})

	test('component redraws when nested store property changes', () => {
		const $s = storeFn({
			user: {
				name: 'John',
			},
		})
		let renderCount = 0

		const Component = {
			view() {
				renderCount++
				return m('div', $s.user.name)
			},
		}

		m.mount(root, Component)
		expect(renderCount).toBe(1)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('John')

		$s.user.name = 'Jane'
		// Component-level redraw should happen synchronously
		expect(renderCount).toBe(2)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('Jane')
	})

	test('component redraws when computed property changes', () => {
		const $s = storeFn({
			count: 0,
			doubled: () => $s.count * 2,
		})
		let renderCount = 0

		const Component = {
			view() {
				renderCount++
				return m('div', $s.doubled)
			},
		}

		m.mount(root, Component)
		expect(renderCount).toBe(1)
		expect(root.childNodes.length).toBe(1)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('0')

		$s.count = 5
		// Component-level redraw should happen synchronously
		expect(renderCount).toBe(2)
		expect(root.childNodes[0].childNodes[0].nodeValue).toBe('10')
	})

	test('only component using changed property redraws', () => {
		const $s = storeFn({
			count: 0,
			name: 'test',
		})

		let renderCount1 = 0
		let renderCount2 = 0

		const Component1 = {
			view() {
				renderCount1++
				return m('div', $s.count)
			},
		}

		const Component2 = {
			view() {
				renderCount2++
				return m('div', $s.name)
			},
		}

		const root1 = $window.document.createElement('div')
		const root2 = $window.document.createElement('div')

		m.mount(root1, Component1)
		m.mount(root2, Component2)

		expect(renderCount1).toBe(1)
		expect(renderCount2).toBe(1)

		// Change count - only Component1 should redraw (synchronously)
		$s.count = 10
		expect(renderCount1).toBe(2)
		expect(renderCount2).toBe(1) // Should not redraw

		// Change name - only Component2 should redraw (synchronously)
		$s.name = 'updated'
		expect(renderCount1).toBe(2) // Should not redraw again
		expect(renderCount2).toBe(2)
	})
})
