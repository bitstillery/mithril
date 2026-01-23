// @ts-nocheck
import {describe, test, expect, beforeEach} from 'bun:test'

import {store, clearStoreRegistry, getRegisteredStores} from '../../store'
import {serializeStore, deserializeStore, serializeAllStates, deserializeAllStates} from '../../render/ssrState'

describe('SSR State Serialization', () => {
	beforeEach(() => {
		// Clear registry before each test to avoid collisions
		clearStoreRegistry()
	})

	describe('Store Registration', () => {
		test('stores register themselves automatically when created with a name', () => {
			const myStore = store({count: 0}, 'myStore')
			const registered = getRegisteredStores()
			expect(registered.has('myStore')).toBe(true)
			expect(registered.get('myStore')).toBe(myStore)
		})

		test('store creation throws error if name is missing', () => {
			expect(() => {
				store({count: 0})
			}).toThrow('Store name is required')
		})

		test('store creation throws error if name is empty string', () => {
			expect(() => {
				store({count: 0}, '')
			}).toThrow('Store name is required')
		})

		test('multiple stores can be registered with different names', () => {
			const store1 = store({count: 0}, 'store1')
			const store2 = store({name: 'test'}, 'store2')
			const registered = getRegisteredStores()
			expect(registered.has('store1')).toBe(true)
			expect(registered.has('store2')).toBe(true)
			expect(registered.get('store1')).toBe(store1)
			expect(registered.get('store2')).toBe(store2)
		})

		test('stores with same name overwrite previous registration (with warning in dev)', () => {
			store({count: 0}, 'duplicate')
			const store2 = store({count: 1}, 'duplicate')
			const registered = getRegisteredStores()
			expect(registered.has('duplicate')).toBe(true)
			expect(registered.get('duplicate')).toBe(store2) // Last one wins
		})
	})

	describe('Store Serialization', () => {
		test('serializeStore extracts signal values from store', () => {
			const myStore = store({
				count: 0,
				name: 'test',
				active: true,
			}, 'myStore')

			const serialized = serializeStore(myStore)

			expect(serialized).toEqual({
				count: 0,
				name: 'test',
				active: true,
			})
		})

		test('serializeStore skips ComputedSignal instances', () => {
			const myStore = store({
				count: 0,
				doubled: () => myStore.count * 2,
			}, 'myStore')

			const serialized = serializeStore(myStore)

			// Computed signal should not be in serialized output
			expect(serialized.count).toBe(0)
			expect(serialized.doubled).toBeUndefined()
		})

		test('serializeStore handles nested stores recursively', () => {
			const myStore = store({
				count: 0,
				user: {
					name: 'John',
					email: 'john@example.com',
				},
			}, 'myStore')

			const serialized = serializeStore(myStore)

			// Nested store structure is preserved
			expect(serialized).toEqual({
				count: 0,
				user: {
					name: 'John',
					email: 'john@example.com',
				},
			})
		})

		test('serializeStore handles arrays', () => {
			const myStore = store({
				items: [1, 2, 3],
			}, 'myStore')

			const serialized = serializeStore(myStore)

			expect(serialized).toEqual({
				items: [1, 2, 3],
			})
		})

		test('serializeStore handles arrays containing stores', () => {
			const myStore = store({
				users: [
					{name: 'Alice', age: 30},
					{name: 'Bob', age: 25},
				],
			}, 'myStore')

			const serialized = serializeStore(myStore)

			// Each object in the array becomes a nested store and is serialized
			expect(serialized).toEqual({
				users: [
					{name: 'Alice', age: 30},
					{name: 'Bob', age: 25},
				],
			})
		})

		test('serializeStore handles null and undefined values', () => {
			const myStore = store({
				nullValue: null,
				undefinedValue: undefined,
				count: 0,
			}, 'myStore')

			const serialized = serializeStore(myStore)

			expect(serialized.nullValue).toBe(null)
			expect(serialized.undefinedValue).toBe(undefined)
			expect(serialized.count).toBe(0)
		})

		test('serializeStore handles circular references', () => {
			const myStore = store({
				name: 'test',
			}, 'myStore')

			// Create circular reference
			myStore.ref = myStore

			const serialized = serializeStore(myStore)

			// Circular reference is broken (serialized as null)
			expect(serialized.name).toBe('test')
			expect(serialized.ref).toBe(null)
		})
	})

	describe('Store Deserialization', () => {
		test('deserializeStore restores signal values into store', () => {
			const myStore = store({
				count: 0,
				name: 'initial',
			}, 'myStore')

			const serialized = {
				count: 42,
				name: 'restored',
			}

			deserializeStore(myStore, serialized)

			expect(myStore.count).toBe(42)
			expect(myStore.name).toBe('restored')
		})

		test('deserializeStore creates new signals for properties that did not exist', () => {
			const myStore = store({
				count: 0,
			}, 'myStore')

			const serialized = {
				count: 10,
				newProp: 'new value',
			}

			deserializeStore(myStore, serialized)

			expect(myStore.count).toBe(10)
			expect(myStore.newProp).toBe('new value')
		})

		test('deserializeStore handles nested stores recursively', () => {
			const myStore = store({
				count: 0,
				user: {
					name: 'Initial',
					email: 'initial@example.com',
				},
			}, 'myStore')

			const serialized = {
				count: 5,
				user: {
					name: 'Restored',
					email: 'restored@example.com',
				},
			}

			deserializeStore(myStore, serialized)

			expect(myStore.count).toBe(5)
			expect(myStore.user.name).toBe('Restored')
			expect(myStore.user.email).toBe('restored@example.com')
		})

		test('deserializeStore handles arrays', () => {
			const myStore = store({
				items: [1, 2, 3],
			}, 'myStore')

			const serialized = {
				items: [10, 20, 30],
			}

			deserializeStore(myStore, serialized)

			expect(myStore.items).toEqual([10, 20, 30])
		})

		test('deserializeStore does not update ComputedSignal values', () => {
			const myStore = store({
				count: 0,
				doubled: () => myStore.count * 2,
			}, 'myStore')

			// Initial state
			expect(myStore.doubled).toBe(0)

			const serialized = {
				count: 5,
				doubled: 999, // This should be ignored
			}

			deserializeStore(myStore, serialized)

			// Count is updated
			expect(myStore.count).toBe(5)
			// Doubled is recomputed, not set from serialized data
			expect(myStore.doubled).toBe(10)
		})
	})

	describe('Serializing All States', () => {
		test('serializeAllStates serializes all registered stores', () => {
			store({count: 1}, 'store1')
			store({name: 'test'}, 'store2')

			const allStates = serializeAllStates()

			expect(allStates.store1).toEqual({count: 1})
			expect(allStates.store2).toEqual({name: 'test'})
		})

		test('serializeAllStates handles errors gracefully', () => {
			store({count: 1}, 'goodStore')
			// Create a bad store that will cause serialization to fail
			const badStore = store({count: 2}, 'badStore')
			// Corrupt the store's signalMap
			badStore.__signalMap = null

			const allStates = serializeAllStates()

			// Good store is still serialized
			expect(allStates.goodStore).toEqual({count: 1})
			// Bad store is not included (error logged but not thrown)
			expect(allStates.badStore).toBeUndefined()
		})
	})

	describe('Deserializing All States', () => {
		test('deserializeAllStates restores all stores from serialized data', () => {
			const store1 = store({count: 0}, 'store1')
			const store2 = store({name: 'initial'}, 'store2')

			const serialized = {
				store1: {count: 42},
				store2: {name: 'restored'},
			}

			deserializeAllStates(serialized)

			expect(store1.count).toBe(42)
			expect(store2.name).toBe('restored')
		})

		test('deserializeAllStates skips stores not found in registry', () => {
			const store1 = store({count: 0}, 'store1')

			const serialized = {
				store1: {count: 10},
				missingStore: {count: 999},
			}

			deserializeAllStates(serialized)

			// Existing store is updated
			expect(store1.count).toBe(10)
			// Missing store is skipped (warning logged)
		})

		test('deserializeAllStates handles errors gracefully', () => {
			const goodStore = store({count: 0}, 'goodStore')
			const badStore = store({count: 0}, 'badStore')
			// Corrupt the bad store's signalMap
			badStore.__signalMap = null

			const serialized = {
				goodStore: {count: 42},
				badStore: {count: 100},
			}

			deserializeAllStates(serialized)

			// Good store is still restored
			expect(goodStore.count).toBe(42)
			// Bad store is not updated (error occurred)
			expect(badStore.count).toBe(0)
		})
	})

	describe('SSR Flow Integration', () => {
		test('complete SSR flow: serialize on server, deserialize on client', () => {
			// Simulate server-side: create store and populate data
			const serverStore = store({
				loading: false,
				data: 'Server data',
			}, 'AsyncData.state')

			// Simulate async data loading
			serverStore.data = 'Data loaded from server!'
			serverStore.loading = false

			// Serialize on server
			const serializedState = serializeAllStates()

			// Simulate client-side: create fresh store with same name
			clearStoreRegistry()
			const clientStore = store({
				loading: true,
				data: undefined,
			}, 'AsyncData.state')

			// Deserialize on client
			deserializeAllStates(serializedState)

			// Client store should have server data
			expect(clientStore.loading).toBe(false)
			expect(clientStore.data).toBe('Data loaded from server!')
		})

		test('multiple stores in SSR flow', () => {
			// Server-side
			store({count: 10}, 'Counter.store')
			store({user: {name: 'John'}}, 'User.store')

			const serialized = serializeAllStates()

			// Client-side
			clearStoreRegistry()
			const clientStore1 = store({count: 0}, 'Counter.store')
			const clientStore2 = store({user: {name: ''}}, 'User.store')

			deserializeAllStates(serialized)

			expect(clientStore1.count).toBe(10)
			expect(clientStore2.user.name).toBe('John')
		})
	})

	describe('Edge Cases', () => {
		test('serializeStore throws error if value is not a store', () => {
			expect(() => {
				serializeStore({count: 0})
			}).toThrow('Value is not a store')
		})

		test('deserializeStore throws error if value is not a store', () => {
			expect(() => {
				deserializeStore({count: 0}, {count: 1})
			}).toThrow('Value is not a store')
		})

		test('deserializeStore handles empty serialized data', () => {
			const myStore = store({count: 0}, 'myStore')
			deserializeStore(myStore, {})
			expect(myStore.count).toBe(0) // Unchanged
		})

		test('deserializeStore handles null serialized data', () => {
			const myStore = store({count: 0}, 'myStore')
			deserializeStore(myStore, null)
			expect(myStore.count).toBe(0) // Unchanged
		})
	})
})
