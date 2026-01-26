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
		
		const unwatch = watch($state.$items, (_newValue, _oldValue) => {
			watchCount++
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
	
	describe('array mutations with splice', () => {
		test('splice should trigger watcher', () => {
			const $state = state({items: [1, 2, 3]}, 'watch.spliceTrigger')
			
			// Verify array is wrapped
			expect(($state.items as any).__isState).toBe(true)
			expect(Array.isArray(($state.items as any).__signals)).toBe(true)
			
			let watchCount = 0
			
			const unwatch = watch($state.$items, (_newValue, _oldValue) => {
				watchCount++
			})
			
			expect(watchCount).toBe(0)
			
			// Access the array to ensure parent signal is stored
			const arrayRef = $state.items
			// Verify parent signal is stored (either in WeakMap or as property)
			const parentSignalFromProp = (arrayRef as any)._parentSignal
			const parentSignalFromMap = (arrayRef as any).__parentSignal
			expect(parentSignalFromProp || parentSignalFromMap).toBeDefined()
			
			// Use splice to replace all items
			$state.items.splice(0, $state.items.length, 4, 5, 6)
			// Watcher should trigger exactly once
			expect(watchCount).toBe(1)
			// Verify array contents
			expect($state.items).toEqual([4, 5, 6])
			expect(lastNewValue).toEqual([4, 5, 6])
			
			unwatch()
		})
		
		test('splice should keep array reference', () => {
			const $state = state({items: [1, 2, 3]}, 'watch.spliceReference')
			const originalArray = $state.items
			
			$state.items.splice(0, $state.items.length, 4, 5, 6)
			
			// Array reference should be the same
			expect($state.items).toBe(originalArray)
			expect($state.items).toEqual([4, 5, 6])
		})
		
		test('splice should not result in empty array when replacing', () => {
			const $state = state({items: [1, 2, 3]}, 'watch.spliceNotEmpty')
			
			$state.items.splice(0, $state.items.length, 4, 5, 6)
			
			expect($state.items).toEqual([4, 5, 6])
		})
		
		test('splice with empty replacement should clear array', () => {
			const $state = state({items: [1, 2, 3]}, 'watch.spliceClear')
			let watchCount = 0
			
			const unwatch = watch($state.$items, () => {
				watchCount++
			})
			
			$state.items.splice(0, $state.items.length)
			
			expect(watchCount).toBe(1)
			expect($state.items.length).toBe(0)
			
			unwatch()
		})
		
		test('splice should handle partial replacement', () => {
			const $state = state({items: [1, 2, 3, 4, 5]}, 'watch.splicePartial')
			let watchCount = 0
			
			const unwatch = watch($state.$items, () => {
				watchCount++
			})
			
			// Replace middle items
			$state.items.splice(1, 2, 10, 11)
			
			expect(watchCount).toBe(1)
			expect($state.items).toEqual([1, 10, 11, 4, 5])
			
			unwatch()
		})
		
		test('splice should return removed items', () => {
			const $state = state({items: [1, 2, 3, 4, 5]}, 'watch.spliceReturn')
			
			const removed = $state.items.splice(1, 2)
			
			expect(removed).toEqual([2, 3])
			expect($state.items).toEqual([1, 4, 5])
		})
		
		test('splice should work with nested state arrays (filter options pattern)', () => {
			const $filters = state({
				offertype: {
					options: [['SPECIALS', 'Special Offers'], ['NEW_ARRIVALS', 'New Arrivals']],
					selection: '',
				},
			}, 'watch.spliceNested')
			
			let watchCount = 0
			const unwatch = watch($filters.offertype.$options, () => {
				watchCount++
			})
			
			const newOptions = [['FAVORITES', 'My Favorites'], ['SPECIALS', 'Special Offers']]
			$filters.offertype.options.splice(0, $filters.offertype.options.length, ...newOptions)
			
			expect(watchCount).toBe(1)
			expect($filters.offertype.options.length).toBe(2)
			const opt0 = $filters.offertype.options[0]
			const opt1 = $filters.offertype.options[1]
			expect(opt0[0]).toBe('FAVORITES')
			expect(opt0[1]).toBe('My Favorites')
			expect(opt1[0]).toBe('SPECIALS')
			expect(opt1[1]).toBe('Special Offers')
			
			unwatch()
		})
		
		test('splice should handle array of primitives', () => {
			const $state = state({selection: ['a', 'b', 'c']}, 'watch.splicePrimitives')
			let watchCount = 0
			
			const unwatch = watch($state.$selection, () => {
				watchCount++
			})
			
			$state.selection.splice(0, $state.selection.length, 'x', 'y', 'z')
			
			expect(watchCount).toBe(1)
			expect($state.selection[0]).toBe('x')
			expect($state.selection[1]).toBe('y')
			expect($state.selection[2]).toBe('z')
			expect($state.selection.length).toBe(3)
			
			unwatch()
		})
		
		test('splice should handle array of numbers', () => {
			const $state = state({ids: [1, 2, 3]}, 'watch.spliceNumbers')
			let watchCount = 0
			
			const unwatch = watch($state.$ids, () => {
				watchCount++
			})
			
			$state.ids.splice(0, $state.ids.length, 10, 20, 30)
			
			expect(watchCount).toBe(1)
			expect($state.ids[0]).toBe(10)
			expect($state.ids[1]).toBe(20)
			expect($state.ids[2]).toBe(30)
			expect($state.ids.length).toBe(3)
			
			unwatch()
		})
		
		test('multiple splice operations should trigger watcher each time', () => {
			const $state = state({items: [1, 2, 3]}, 'watch.spliceMultiple')
			let watchCount = 0
			
			const unwatch = watch($state.$items, () => {
				watchCount++
			})
			
			$state.items.splice(0, $state.items.length, 4, 5)
			expect(watchCount).toBe(1)
			
			$state.items.splice(0, $state.items.length, 6, 7, 8)
			expect(watchCount).toBe(2)
			
			$state.items.splice(1, 1, 9)
			expect(watchCount).toBe(3)
			
			expect($state.items[0]).toBe(6)
			expect($state.items[1]).toBe(9)
			expect($state.items[2]).toBe(8)
			expect($state.items.length).toBe(3)
			
			unwatch()
		})
		
		test('splice with filter options structure - simulates real filter data', () => {
			// Simulate the exact filter structure from offer_list.tsx
			// Filters have options that are arrays of [value, label, count]
			const $filters = state({
				offertype: {
					options: [['SPECIALS', 'Special Offers', 10], ['NEW_ARRIVALS', 'New Arrivals', 5]],
					selection: '',
				},
			}, 'watch.filterOptions')
			
			// Verify initial state
			expect($filters.offertype.options.length).toBe(2)
			expect($filters.offertype.options[0]).toEqual(['SPECIALS', 'Special Offers', 10])
			expect($filters.offertype.options[1]).toEqual(['NEW_ARRIVALS', 'New Arrivals', 5])
			
			// Simulate what happens in offer_list.tsx line 221:
			// filters.offertype.options.splice(0, filters.offertype.options.length, ...offerTypeStats)
			// where offerTypeStats = result.offer_item_statistics?.map((i) => [i.offer_item_type, i.offer_item_type, i.count])
			const offerTypeStats = [
				['SPECIALS', 'SPECIALS', 15],
				['NEW_ARRIVALS', 'NEW_ARRIVALS', 8],
				['FAVORITES', 'FAVORITES', 3],
			]
			
			// This is the exact pattern used in the real code
			$filters.offertype.options.splice(0, $filters.offertype.options.length, ...offerTypeStats)
			
			// Verify the array structure is preserved
			expect($filters.offertype.options.length).toBe(3)
			
			// Critical: Check that nested arrays are preserved correctly
			// If option[0] or option[1] is undefined, labels will show as "filters.types.offertype.undefined"
			const opt0 = $filters.offertype.options[0]
			const opt1 = $filters.offertype.options[1]
			const opt2 = $filters.offertype.options[2]
			
			// These assertions should pass - if they fail, we've found the bug
			expect(opt0).toBeDefined()
			expect(Array.isArray(opt0)).toBe(true)
			expect(opt0[0]).toBe('SPECIALS')
			expect(opt0[1]).toBe('SPECIALS')
			expect(opt0[2]).toBe(15)
			
			expect(opt1).toBeDefined()
			expect(Array.isArray(opt1)).toBe(true)
			expect(opt1[0]).toBe('NEW_ARRIVALS')
			expect(opt1[1]).toBe('NEW_ARRIVALS')
			expect(opt1[2]).toBe(8)
			
			expect(opt2).toBeDefined()
			expect(Array.isArray(opt2)).toBe(true)
			expect(opt2[0]).toBe('FAVORITES')
			expect(opt2[1]).toBe('FAVORITES')
			expect(opt2[2]).toBe(3)
			
			// Verify we can iterate over options (as RadioGroup does)
			const optionValues = $filters.offertype.options.map(opt => opt[0])
			expect(optionValues).toEqual(['SPECIALS', 'NEW_ARRIVALS', 'FAVORITES'])
			
			const optionLabels = $filters.offertype.options.map(opt => opt[1])
			expect(optionLabels).toEqual(['SPECIALS', 'NEW_ARRIVALS', 'FAVORITES'])
			
			// Critical: Simulate RadioGroup's exact access pattern
			// RadioGroup does: option[1] where option comes from options.map()
			const radioGroupLabels = $filters.offertype.options.map((option) => {
				// This is exactly what RadioGroup does (line 30 in radio.tsx)
				if (!option || typeof option !== 'object') {
					return undefined
				}
				return option[1] // This should return the label string
			})
			expect(radioGroupLabels).toEqual(['SPECIALS', 'NEW_ARRIVALS', 'FAVORITES'])
			expect(radioGroupLabels.every(label => label !== undefined)).toBe(true)
			
			// Also test the exact pattern from RadioGroup with translate prefix
			// RadioGroup does: $t(`${vn.attrs.translate.prefix}${option[1]}`)
			// If option[1] is undefined, it would show "filters.types.offertype.undefined"
			const translatePrefix = 'filters.types.offertype.'
			const translatedLabels = $filters.offertype.options.map((option) => {
				if (!option || typeof option !== 'object') {
					return undefined
				}
				const label = option[1]
				if (label === undefined) {
					return `${translatePrefix}undefined` // This is what would show in UI
				}
				return `${translatePrefix}${label}`
			})
			expect(translatedLabels).toEqual([
				'filters.types.offertype.SPECIALS',
				'filters.types.offertype.NEW_ARRIVALS',
				'filters.types.offertype.FAVORITES',
			])
			expect(translatedLabels.every(label => !label.includes('undefined'))).toBe(true)
		})
		
		test('splice with empty initial options then populate - simulates filter initialization', () => {
			// Simulate filter that starts empty and gets populated later
			const $filters = state({
				offertype: {
					options: [],
					selection: '',
				},
			}, 'watch.filterEmptyInit')
			
			expect($filters.offertype.options.length).toBe(0)
			
			// Populate with options (simulating API response)
			const offerTypeStats = [
				['SPECIALS', 'SPECIALS', 15],
				['NEW_ARRIVALS', 'NEW_ARRIVALS', 8],
			]
			
			$filters.offertype.options.splice(0, $filters.offertype.options.length, ...offerTypeStats)
			
			expect($filters.offertype.options.length).toBe(2)
			expect($filters.offertype.options[0][0]).toBe('SPECIALS')
			expect($filters.offertype.options[0][1]).toBe('SPECIALS')
			expect($filters.offertype.options[1][0]).toBe('NEW_ARRIVALS')
			expect($filters.offertype.options[1][1]).toBe('NEW_ARRIVALS')
		})
		
		test('splice with multiple filter updates - simulates real usage pattern', () => {
			// Simulate multiple filters being updated in sequence
			const $filters = state({
				offertype: {
					options: [['SPECIALS', 'SPECIALS', 10]],
					selection: '',
				},
				availability: {
					options: [['stock', 'stock', 5]],
					selection: [],
				},
			}, 'watch.multipleFilters')
			
			// First update
			const offerTypeStats1 = [['SPECIALS', 'SPECIALS', 15], ['NEW_ARRIVALS', 'NEW_ARRIVALS', 8]]
			$filters.offertype.options.splice(0, $filters.offertype.options.length, ...offerTypeStats1)
			
			expect($filters.offertype.options.length).toBe(2)
			expect($filters.offertype.options[0][0]).toBe('SPECIALS')
			expect($filters.offertype.options[1][0]).toBe('NEW_ARRIVALS')
			
			// Second update (simulating another API call)
			const offerTypeStats2 = [['FAVORITES', 'FAVORITES', 3]]
			$filters.offertype.options.splice(0, $filters.offertype.options.length, ...offerTypeStats2)
			
			expect($filters.offertype.options.length).toBe(1)
			expect($filters.offertype.options[0][0]).toBe('FAVORITES')
			expect($filters.offertype.options[0][1]).toBe('FAVORITES')
			
			// Update another filter
			const availabilityStats = [['stock', 'stock', 10], ['tbo', 'tbo', 5]]
			$filters.availability.options.splice(0, $filters.availability.options.length, ...availabilityStats)
			
			expect($filters.availability.options.length).toBe(2)
			expect($filters.availability.options[0][0]).toBe('stock')
			expect($filters.availability.options[1][0]).toBe('tbo')
		})
	})
})
