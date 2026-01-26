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

	test('updates state values', () => {
		const s = state({count: 0}, 'testState.updateValues')
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
		const s = state({
			items: [1, 2, 3],
		}, 'testState.dollarPrefixArray')
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
		const s = state({count: 0} as any, 'testState.dynamicProperty')
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
	
	describe('array mutations', () => {
		test('splice replaces array contents correctly', () => {
			const s = state({items: [1, 2, 3]}, 'testState.spliceReplace')
			const originalArray = s.items
			
			s.items.splice(0, s.items.length, 4, 5, 6)
			
			expect(s.items).toBe(originalArray) // Reference should be kept
			expect(s.items).toEqual([4, 5, 6])
			expect(s.items.length).toBe(3)
		})
		
		test('splice does not result in empty array', () => {
			const s = state({items: [1, 2, 3]}, 'testState.spliceNotEmpty')
			
			s.items.splice(0, s.items.length, 10, 20, 30)
			
			expect(s.items.length).toBe(3)
			expect(s.items).not.toEqual([])
			expect(s.items[0]).toBe(10)
			expect(s.items[1]).toBe(20)
			expect(s.items[2]).toBe(30)
		})
		
		test('splice handles empty replacement', () => {
			const s = state({items: [1, 2, 3]}, 'testState.spliceEmpty')
			
			s.items.splice(0, s.items.length)
			
			expect(s.items.length).toBe(0)
			expect(s.items).toEqual([])
		})
		
		test('splice returns removed items', () => {
			const s = state({items: [1, 2, 3, 4, 5]}, 'testState.spliceReturn')
			
			const removed = s.items.splice(1, 2)
			
			expect(removed).toEqual([2, 3])
			expect(s.items).toEqual([1, 4, 5])
		})
		
		test('splice handles partial replacement', () => {
			const s = state({items: [1, 2, 3, 4, 5]}, 'testState.splicePartial')
			
			s.items.splice(2, 2, 10, 11, 12)
			
			expect(s.items).toEqual([1, 2, 10, 11, 12, 5])
		})
		
		test('includes and indexOf work correctly with reactive arrays', () => {
			const s = state({selection: []}, 'testState.arraySearch')
			
			// Initially empty
			expect(s.selection.includes('option1')).toBe(false)
			expect(s.selection.indexOf('option1')).toBe(-1)
			
			// Add items via splice (simulating CheckboxGroup behavior)
			s.selection.splice(0, s.selection.length, 'option1', 'option2')
			expect(s.selection.length).toBe(2)
			expect(s.selection.includes('option1')).toBe(true)
			expect(s.selection.includes('option2')).toBe(true)
			expect(s.selection.indexOf('option1')).toBe(0)
			expect(s.selection.indexOf('option2')).toBe(1)
			
			// Update selection (simulating checkbox uncheck)
			s.selection.splice(0, s.selection.length, 'option2')
			expect(s.selection.length).toBe(1)
			expect(s.selection.includes('option1')).toBe(false)
			expect(s.selection.includes('option2')).toBe(true)
			expect(s.selection.indexOf('option1')).toBe(-1)
			expect(s.selection.indexOf('option2')).toBe(0)
		})
		
		test('array methods return unwrapped values', () => {
			const s = state({items: ['a', 'b', 'c']}, 'testState.arrayMethods')
			
			// Search methods
			expect(s.items.includes('b')).toBe(true)
			expect(s.items.indexOf('b')).toBe(1)
			expect(s.items.lastIndexOf('c')).toBe(2)
			
			// Return methods
			expect(s.items.join(', ')).toBe('a, b, c')
			expect(s.items.toString()).toBe('a,b,c')
			expect(s.items.slice(0, 2)).toEqual(['a', 'b'])
			expect(s.items.concat(['d'])).toEqual(['a', 'b', 'c', 'd'])
			
			// Iterator methods
			expect(Array.from(s.items.values())).toEqual(['a', 'b', 'c'])
			expect(Array.from(s.items.keys())).toEqual([0, 1, 2])
			expect(Array.from(s.items.entries())).toEqual([[0, 'a'], [1, 'b'], [2, 'c']])
		})
		
		test('splice works with nested arrays', () => {
			const s = state({
				filter: {
					options: [['a', 'A'], ['b', 'B']],
				},
			}, 'testState.spliceNested')
			
			s.filter.options.splice(0, s.filter.options.length, ['c', 'C'], ['d', 'D'])
			
			expect(s.filter.options.length).toBe(2)
			expect(s.filter.options[0]).toEqual(['c', 'C'])
			expect(s.filter.options[1]).toEqual(['d', 'D'])
		})
		
		test('push adds items correctly', () => {
			const s = state({items: [1, 2, 3]}, 'testState.push')
			const originalArray = s.items
			
			s.items.push(4, 5)
			
			expect(s.items).toBe(originalArray)
			expect(s.items).toEqual([1, 2, 3, 4, 5])
			expect(s.items.length).toBe(5)
		})
		
		test('pop removes and returns last item', () => {
			const s = state({items: [1, 2, 3]}, 'testState.pop')
			
			const popped = s.items.pop()
			
			expect(popped).toBe(3)
			expect(s.items).toEqual([1, 2])
		})
		
		test('unshift adds items to beginning', () => {
			const s = state({items: [1, 2, 3]}, 'testState.unshift')
			const originalArray = s.items
			
			s.items.unshift(0, -1)
			
			expect(s.items).toBe(originalArray)
			expect(s.items).toEqual([0, -1, 1, 2, 3])
		})
		
		test('shift removes and returns first item', () => {
			const s = state({items: [1, 2, 3]}, 'testState.shift')
			
			const shifted = s.items.shift()
			
			expect(shifted).toBe(1)
			expect(s.items).toEqual([2, 3])
		})
	})

	test('requires name parameter', () => {
		// State name is required for SSR serialization
		expect(() => {
			state({count: 0})
		}).toThrow('State name is required')
	})
})
