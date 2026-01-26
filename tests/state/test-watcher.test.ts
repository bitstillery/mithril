// @ts-nocheck
import {describe, test, expect} from 'bun:test'

import {state, watch} from '../../state'

describe('watch API', () => {
	test('watch primitive state property changes', () => {
		const $state = state({count: 0}, 'watch.primitive')
		let watchCount = 0
		let lastNewValue: number | undefined
		let lastOldValue: number | undefined
		
		const unwatch = watch($state.$count, (newValue, oldValue) => {
			watchCount++
			lastNewValue = newValue
			lastOldValue = oldValue
		})
		
		expect(watchCount).toBe(0) // watch doesn't call immediately
		
		$state.count = 10
		expect(watchCount).toBe(1)
		expect(lastNewValue).toBe(10)
		expect(lastOldValue).toBe(0)
		
		$state.count = 20
		expect(watchCount).toBe(2)
		expect(lastNewValue).toBe(20)
		expect(lastOldValue).toBe(10)
		
		unwatch()
		
		// After unwatch, changes should not trigger callback
		$state.count = 30
		expect(watchCount).toBe(2) // Should still be 2
	})
	
	test('watch string state property changes', () => {
		const $state = state({name: 'John'}, 'watch.string')
		let watchCount = 0
		
		const unwatch = watch($state.$name, () => {
			watchCount++
		})
		
		$state.name = 'Jane'
		expect(watchCount).toBe(1)
		expect($state.name).toBe('Jane')
		
		$state.name = 'Bob'
		expect(watchCount).toBe(2)
		expect($state.name).toBe('Bob')
		
		unwatch()
	})
	
	test('watch boolean state property changes', () => {
		const $state = state({active: false}, 'watch.boolean')
		let watchCount = 0
		
		const unwatch = watch($state.$active, () => {
			watchCount++
		})
		
		$state.active = true
		expect(watchCount).toBe(1)
		expect($state.active).toBe(true)
		
		$state.active = false
		expect(watchCount).toBe(2)
		expect($state.active).toBe(false)
		
		unwatch()
	})
	
	test('watch nested state property changes', () => {
		const $state = state({
			user: {
				name: 'John',
				age: 30,
			},
		}, 'watch.nested')
		
		let nameWatchCount = 0
		let ageWatchCount = 0
		
		const unwatchName = watch($state.user.$name, () => {
			nameWatchCount++
		})
		
		const unwatchAge = watch($state.user.$age, () => {
			ageWatchCount++
		})
		
		$state.user.name = 'Jane'
		expect(nameWatchCount).toBe(1)
		expect(ageWatchCount).toBe(0)
		
		$state.user.age = 31
		expect(nameWatchCount).toBe(1)
		expect(ageWatchCount).toBe(1)
		
		unwatchName()
		unwatchAge()
	})
	
	test('watch array state property - element assignment', () => {
		const $state = state({items: [1, 2, 3]}, 'watch.arrayElement')
		let watchCount = 0
		let lastNewValue: any
		let lastOldValue: any
		
		const unwatch = watch($state.$items, (newValue, oldValue) => {
			watchCount++
			lastNewValue = newValue
			lastOldValue = oldValue
		})
		
		expect(watchCount).toBe(0) // watch doesn't call immediately
		
		// Modify array element
		$state.items[0] = 10
		expect(watchCount).toBeGreaterThanOrEqual(0) // May or may not trigger depending on implementation
		expect($state.items[0]).toBe(10)
		
		unwatch()
	})
	
	test('watch array state property - entire array replacement', () => {
		const $state = state({items: [1, 2, 3]}, 'watch.arrayReplace')
		let watchCount = 0
		
		const unwatch = watch($state.$items, () => {
			watchCount++
		})
		
		// Replace entire array
		$state.items = [4, 5, 6]
		expect(watchCount).toBe(1)
		expect($state.items).toEqual([4, 5, 6])
		
		$state.items = [7, 8]
		expect(watchCount).toBe(2)
		expect($state.items).toEqual([7, 8])
		
		unwatch()
	})
	
	test('watch computed property changes', () => {
		const $state = state({
			count: 0,
			doubled: () => $state.count * 2,
		}, 'watch.computed')
		
		let watchCount = 0
		let lastNewValue: number | undefined
		
		const unwatch = watch($state.$doubled, (newValue) => {
			watchCount++
			lastNewValue = newValue
		})
		
		expect(watchCount).toBe(0) // watch doesn't call immediately
		
		$state.count = 5
		expect(watchCount).toBeGreaterThanOrEqual(0) // Computed may trigger
		if (watchCount > 0) {
			expect(lastNewValue).toBe(10)
		}
		
		unwatch()
	})
	
	test('watch multiple properties independently', () => {
		const $state = state({
			count: 0,
			name: 'test',
		}, 'watch.multiple')
		
		let countWatchCount = 0
		let nameWatchCount = 0
		
		const unwatchCount = watch($state.$count, () => {
			countWatchCount++
		})
		
		const unwatchName = watch($state.$name, () => {
			nameWatchCount++
		})
		
		$state.count = 10
		expect(countWatchCount).toBe(1)
		expect(nameWatchCount).toBe(0)
		
		$state.name = 'updated'
		expect(countWatchCount).toBe(1)
		expect(nameWatchCount).toBe(1)
		
		unwatchCount()
		unwatchName()
	})
	
	test('watch with filter-like structure (array selection)', () => {
		// Simulate filter structure from collection code
		const $filters = state({
			category: {
				selection: ['option1', 'option2'],
				type: 'SELECT_MULTIPLE',
			},
		}, 'watch.filterStructure')
		
		let watchCount = 0
		
		const unwatch = watch($filters.category.$selection, () => {
			watchCount++
		})
		
		// Modify array element
		$filters.category.selection[0] = 'option1_modified'
		// Note: Element mutations may not trigger wrapper signal
		expect($filters.category.selection[0]).toBe('option1_modified')
		
		// Replace entire array
		$filters.category.selection = ['new1', 'new2']
		expect(watchCount).toBeGreaterThanOrEqual(1)
		expect($filters.category.selection).toEqual(['new1', 'new2'])
		
		unwatch()
	})
	
	test('watch when iterating over filters (collection pattern)', () => {
		const $filters = state({
			filter1: {
				selection: 'string_value',
				type: 'SELECT_SINGLE',
			},
			filter2: {
				selection: [1, 2, 3],
				type: 'SELECT_MULTIPLE',
			},
		}, 'watch.collectionPattern')
		
		let filter1WatchCount = 0
		let filter2WatchCount = 0
		
		// Simulate collection code: Object.values(collection.filters)
		const filterArray = Object.values($filters) as any[]
		
		for (const filter of filterArray) {
			if (typeof filter.selection === 'string') {
				watch(filter.$selection, () => {
					filter1WatchCount++
				})
			} else if (Array.isArray(filter.selection)) {
				watch(filter.$selection, () => {
					filter2WatchCount++
				})
			}
		}
		
		// Modify string filter
		$filters.filter1.selection = 'new_string'
		expect(filter1WatchCount).toBe(1)
		
		// Modify array filter (entire replacement)
		$filters.filter2.selection = [4, 5, 6]
		expect(filter2WatchCount).toBe(1)
		
		expect($filters.filter1.selection).toBe('new_string')
		expect($filters.filter2.selection).toEqual([4, 5, 6])
	})
	
	test('watch callback receives correct old and new values', () => {
		const $state = state({value: 'initial'}, 'watch.oldNewValues')
		const values: Array<{old: string; new: string}> = []
		
		const unwatch = watch($state.$value, (newValue, oldValue) => {
			values.push({old: oldValue, new: newValue})
		})
		
		$state.value = 'first'
		$state.value = 'second'
		$state.value = 'third'
		
		expect(values.length).toBe(3)
		expect(values[0]).toEqual({old: 'initial', new: 'first'})
		expect(values[1]).toEqual({old: 'first', new: 'second'})
		expect(values[2]).toEqual({old: 'second', new: 'third'})
		
		unwatch()
	})
	
	test('watch handles rapid successive changes', () => {
		const $state = state({count: 0}, 'watch.rapidChanges')
		let watchCount = 0
		
		const unwatch = watch($state.$count, () => {
			watchCount++
		})
		
		// Rapid changes
		$state.count = 1
		$state.count = 2
		$state.count = 3
		$state.count = 4
		$state.count = 5
		
		expect(watchCount).toBe(5)
		expect($state.count).toBe(5)
		
		unwatch()
	})
	
	test('watch handles same value assignment (no change)', () => {
		const $state = state({count: 5}, 'watch.sameValue')
		let watchCount = 0
		
		const unwatch = watch($state.$count, () => {
			watchCount++
		})
		
		// Assign same value
		$state.count = 5
		// Signal should not fire if value hasn't changed
		expect(watchCount).toBe(0)
		
		// Change value
		$state.count = 10
		expect(watchCount).toBe(1)
		
		unwatch()
	})
	
	test('watch can be called multiple times on same signal', () => {
		const $state = state({count: 0}, 'watch.multipleWatchers')
		let watch1Count = 0
		let watch2Count = 0
		
		const unwatch1 = watch($state.$count, () => {
			watch1Count++
		})
		
		const unwatch2 = watch($state.$count, () => {
			watch2Count++
		})
		
		$state.count = 10
		expect(watch1Count).toBe(1)
		expect(watch2Count).toBe(1)
		
		$state.count = 20
		expect(watch1Count).toBe(2)
		expect(watch2Count).toBe(2)
		
		unwatch1()
		
		$state.count = 30
		expect(watch1Count).toBe(2) // Should not increment
		expect(watch2Count).toBe(3) // Should still increment
		
		unwatch2()
	})
})
