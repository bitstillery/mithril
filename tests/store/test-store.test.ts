import {describe, test, expect, beforeEach} from 'bun:test'
import {store} from '../../store'
import {Signal} from '../../signal'

describe('store', () => {
	test('creates store with initial values', () => {
		const s = store({count: 0, name: 'test'})
		expect(s.count).toBe(0)
		expect(s.name).toBe('test')
	})

	test('updates store values', () => {
		const s = store({count: 0})
		s.count = 10
		expect(s.count).toBe(10)
	})

	test('handles nested objects', () => {
		const s = store({
			user: {
				name: 'John',
				email: 'john@example.com',
			},
		})
		expect(s.user.name).toBe('John')
		expect(s.user.email).toBe('john@example.com')
		s.user.name = 'Jane'
		expect(s.user.name).toBe('Jane')
	})

	test('handles arrays', () => {
		const s = store({
			items: [1, 2, 3],
		})
		expect(s.items.length).toBe(3)
		expect(s.items[0]).toBe(1)
		s.items[0] = 10
		expect(s.items[0]).toBe(10)
	})

	test('converts function properties to computed signals', () => {
		const s = store({
			count: 0,
			doubled: () => s.count * 2,
		})
		expect(s.doubled).toBe(0)
		s.count = 5
		expect(s.doubled).toBe(10)
	})

	test('supports _ prefix for computed properties (backward compatibility)', () => {
		const s = store({
			count: 0,
			_doubled: () => s.count * 2,
		})
		expect(s._doubled).toBe(0)
		s.count = 5
		expect(s._doubled).toBe(10)
	})

	test('$ prefix returns raw signal object', () => {
		const s = store({count: 0})
		const countSignal = s.$count
		expect(countSignal).toBeInstanceOf(Signal)
		expect(countSignal.value).toBe(0)
		s.count = 10
		expect(countSignal.value).toBe(10)
	})

	test('$ prefix works for nested properties', () => {
		const s = store({
			user: {
				name: 'John',
			},
		})
		const nameSignal = s.user.$name
		expect(nameSignal).toBeInstanceOf(Signal)
		expect(nameSignal.value).toBe('John')
		s.user.name = 'Jane'
		expect(nameSignal.value).toBe('Jane')
	})

	test('$ prefix works for array elements', () => {
		const s = store({
			items: [1, 2, 3],
		})
		const firstSignal = s.items.$0
		expect(firstSignal).toBeInstanceOf(Signal)
		expect(firstSignal.value).toBe(1)
		s.items[0] = 10
		expect(firstSignal.value).toBe(10)
	})

	test('pre-initializes signals for immediate $ access', () => {
		const s = store({count: 0})
		// Should work even if count hasn't been accessed yet
		const countSignal = s.$count
		expect(countSignal).toBeInstanceOf(Signal)
		expect(countSignal.value).toBe(0)
	})

	test('handles dynamic property assignment', () => {
		const s = store({count: 0} as any)
		s.newProp = 'test'
		expect(s.newProp).toBe('test')
		const newSignal = s.$newProp
		expect(newSignal).toBeInstanceOf(Signal)
		expect(newSignal.value).toBe('test')
	})

	test('handles array push/pop operations', () => {
		const s = store({items: [1, 2, 3]})
		// Note: Array methods need to be handled via assignment for now
		// Direct push/pop may not work due to Proxy wrapping
		s.items = [...s.items, 4]
		expect(s.items.length).toBe(4)
		expect(s.items[3]).toBe(4)
		s.items = s.items.slice(0, -1)
		expect(s.items.length).toBe(3)
	})
})
