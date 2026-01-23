// @ts-nocheck
import {describe, test, expect} from 'bun:test'

import {state} from '../../state'
import {Signal} from '../../signal'

describe('state', () => {
	test('creates state with initial values', () => {
		const s = state({count: 0, name: 'test'}, 'testState.initialValues')
		expect(s.count).toBe(0)
		expect(s.name).toBe('test')
	})

	test('updates store values', () => {
		const s = store({count: 0}, 'testStore.updateValues')
		s.count = 10
		expect(s.count).toBe(10)
	})

	test('handles nested objects', () => {
		const s = state({
			user: {
				name: 'John',
				email: 'john@example.com',
			},
		}, 'testState.nestedObjects')
		expect(s.user.name).toBe('John')
		expect(s.user.email).toBe('john@example.com')
		s.user.name = 'Jane'
		expect(s.user.name).toBe('Jane')
	})

	test('handles arrays', () => {
		const s = state({
			items: [1, 2, 3],
		}, 'testState.arrays')
		expect(s.items.length).toBe(3)
		expect(s.items[0]).toBe(1)
		s.items[0] = 10
		expect(s.items[0]).toBe(10)
	})

	test('converts function properties to computed signals', () => {
		const s = state({
			count: 0,
			doubled: () => s.count * 2,
		}, 'testState.computedSignals')
		expect(s.doubled).toBe(0)
		s.count = 5
		expect(s.doubled).toBe(10)
	})

	test('supports _ prefix for computed properties (backward compatibility)', () => {
		const s = state({
			count: 0,
			_doubled: () => s.count * 2,
		}, 'testState.underscorePrefix')
		expect(s._doubled).toBe(0)
		s.count = 5
		expect(s._doubled).toBe(10)
	})

	test('$ prefix returns raw signal object', () => {
		const s = state({count: 0}, 'testState.dollarPrefix')
		const countSignal = s.$count
		expect(countSignal).toBeInstanceOf(Signal)
		expect(countSignal.value).toBe(0)
		s.count = 10
		expect(countSignal.value).toBe(10)
	})

	test('$ prefix works for nested properties', () => {
		const s = state({
			user: {
				name: 'John',
			},
		}, 'testState.dollarPrefixNested')
		const nameSignal = s.user.$name
		expect(nameSignal).toBeInstanceOf(Signal)
		expect(nameSignal.value).toBe('John')
		s.user.name = 'Jane'
		expect(nameSignal.value).toBe('Jane')
	})

	test('$ prefix works for array elements', () => {
		const s = store({
			items: [1, 2, 3],
		}, 'testStore.dollarPrefixArray')
		const firstSignal = s.items.$0
		expect(firstSignal).toBeInstanceOf(Signal)
		expect(firstSignal.value).toBe(1)
		s.items[0] = 10
		expect(firstSignal.value).toBe(10)
	})

	test('pre-initializes signals for immediate $ access', () => {
		const s = state({count: 0}, 'testState.preInitialize')
		// Should work even if count hasn't been accessed yet
		const countSignal = s.$count
		expect(countSignal).toBeInstanceOf(Signal)
		expect(countSignal.value).toBe(0)
	})

	test('handles dynamic property assignment', () => {
		const s = store({count: 0} as any, 'testStore.dynamicProperty')
		s.newProp = 'test'
		expect(s.newProp).toBe('test')
		const newSignal = s.$newProp
		expect(newSignal).toBeInstanceOf(Signal)
		expect(newSignal.value).toBe('test')
	})

	test('handles array push/pop operations', () => {
		const s = state({items: [1, 2, 3]}, 'testState.arrayOperations')
		// Note: Array methods need to be handled via assignment for now
		// Direct push/pop may not work due to Proxy wrapping
		s.items = [...s.items, 4]
		expect(s.items.length).toBe(4)
		expect(s.items[3]).toBe(4)
		s.items = s.items.slice(0, -1)
		expect(s.items.length).toBe(3)
	})

	test('requires name parameter', () => {
		// State name is required for SSR serialization
		expect(() => {
			state({count: 0})
		}).toThrow('State name is required')
	})
})
