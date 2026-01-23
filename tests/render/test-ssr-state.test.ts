// @ts-nocheck
import {describe, test, expect, beforeEach} from 'bun:test'

import {state, clearStateRegistry, getRegisteredStates} from '../../state'
import {serializeStore, deserializeStore, serializeAllStates, deserializeAllStates} from '../../render/ssrState'

describe('SSR State Serialization', () => {
	beforeEach(() => {
		// Clear registry before each test to avoid collisions
		clearStateRegistry()
	})

	describe('State Registration', () => {
		test('states register themselves automatically when created with a name', () => {
			const myState = state({count: 0}, 'myState')
			const registered = getRegisteredStates()
			expect(registered.has('myState')).toBe(true)
			expect(registered.get('myState')).toBe(myState)
		})

		test('state creation throws error if name is missing', () => {
			expect(() => {
				state({count: 0})
			}).toThrow('State name is required')
		})

		test('state creation throws error if name is empty string', () => {
			expect(() => {
				state({count: 0}, '')
			}).toThrow('State name is required')
		})

		test('multiple states can be registered with different names', () => {
			const state1 = state({count: 0}, 'state1')
			const state2 = state({name: 'test'}, 'state2')
			const registered = getRegisteredStates()
			expect(registered.has('state1')).toBe(true)
			expect(registered.has('state2')).toBe(true)
			expect(registered.get('state1')).toBe(state1)
			expect(registered.get('state2')).toBe(state2)
		})

		test('states with same name overwrite previous registration (with warning in dev)', () => {
			state({count: 0}, 'duplicate')
			const state2 = state({count: 1}, 'duplicate')
			const registered = getRegisteredStates()
			expect(registered.has('duplicate')).toBe(true)
			expect(registered.get('duplicate')).toBe(state2) // Last one wins
		})
	})

	describe('State Serialization', () => {
		test('serializeStore extracts signal values from state', () => {
			const myState = state({
				count: 0,
				name: 'test',
				active: true,
			}, 'myStore')

			const serialized = serializeStore(myState)

			expect(serialized).toEqual({
				count: 0,
				name: 'test',
				active: true,
			})
		})

		test('serializeStore skips ComputedSignal instances', () => {
			const myState = state({
				count: 0,
				doubled: () => myState.count * 2,
			}, 'myState')

			const serialized = serializeStore(myState)

			// Computed signal should not be in serialized output
			expect(serialized.count).toBe(0)
			expect(serialized.doubled).toBeUndefined()
		})

		test('serializeStore handles nested states recursively', () => {
			const myState = state({
				count: 0,
				user: {
					name: 'John',
					email: 'john@example.com',
				},
			}, 'myState')

			const serialized = serializeStore(myState)

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
			const myState = state({
				items: [1, 2, 3],
			}, 'myState')

			const serialized = serializeStore(myState)

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

			const serialized = serializeStore(myState)

			// Each object in the array becomes a nested store and is serialized
			expect(serialized).toEqual({
				users: [
					{name: 'Alice', age: 30},
					{name: 'Bob', age: 25},
				],
			})
		})

		test('serializeStore handles null and undefined values', () => {
			const myState = state({
				nullValue: null,
				undefinedValue: undefined,
				count: 0,
			}, 'myState')

			const serialized = serializeStore(myState)

			expect(serialized.nullValue).toBe(null)
			expect(serialized.undefinedValue).toBe(undefined)
			expect(serialized.count).toBe(0)
		})

		test('serializeStore handles circular references', () => {
			const myState = state({
				name: 'test',
			}, 'myState')

			// Create circular reference
			myState.ref = myState

			const serialized = serializeStore(myState)

			// Circular reference is broken (serialized as null)
			expect(serialized.name).toBe('test')
			expect(serialized.ref).toBe(null)
		})
	})

	describe('State Deserialization', () => {
		test('deserializeStore restores signal values into state', () => {
			const myState = state({
				count: 0,
				name: 'initial',
			}, 'myState')

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

			deserializeStore(myState, serialized)

			expect(myState.count).toBe(10)
			expect(myState.newProp).toBe('new value')
		})

		test('deserializeStore handles nested states recursively', () => {
			const myState = state({
				count: 0,
				user: {
					name: 'Initial',
					email: 'initial@example.com',
				},
			}, 'myState')

			const serialized = {
				count: 5,
				user: {
					name: 'Restored',
					email: 'restored@example.com',
				},
			}

			deserializeStore(myState, serialized)

			expect(myState.count).toBe(5)
			expect(myState.user.name).toBe('Restored')
			expect(myState.user.email).toBe('restored@example.com')
		})

		test('deserializeStore handles arrays', () => {
			const myState = state({
				items: [1, 2, 3],
			}, 'myState')

			const serialized = {
				items: [10, 20, 30],
			}

			deserializeStore(myState, serialized)

			expect(myState.items).toEqual([10, 20, 30])
		})

		test('deserializeStore does not update ComputedSignal values', () => {
			const myState = state({
				count: 0,
				doubled: () => myState.count * 2,
			}, 'myState')

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

			expect(allStates.state1).toEqual({count: 1})
			expect(allStates.state2).toEqual({name: 'test'})
		})

		test('serializeAllStates handles errors gracefully', () => {
			state({count: 1}, 'goodState')
			// Create a bad state that will cause serialization to fail
			const badState = state({count: 2}, 'badState')
			// Corrupt the state's signalMap
			badState.__signalMap = null

			const allStates = serializeAllStates()

			// Good state is still serialized
			expect(allStates.goodState).toEqual({count: 1})
			// Bad state is not included (error logged but not thrown)
			expect(allStates.badState).toBeUndefined()
		})
	})

	describe('Deserializing All States', () => {
		test('deserializeAllStates restores all states from serialized data', () => {
			const state1 = state({count: 0}, 'state1')
			const state2 = state({name: 'initial'}, 'state2')

			const serialized = {
				state1: {count: 42},
				state2: {name: 'restored'},
			}

			deserializeAllStates(serialized)

			expect(state1.count).toBe(42)
			expect(state2.name).toBe('restored')
		})

		test('deserializeAllStates skips states not found in registry', () => {
			const state1 = state({count: 0}, 'state1')

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
			serverState.data = 'Data loaded from server!'
			serverState.loading = false

			// Serialize on server
			const serializedState = serializeAllStates()

			// Simulate client-side: create fresh state with same name
			clearStateRegistry()
			const clientState = state({
				loading: true,
				data: undefined,
			}, 'AsyncData.state')

			// Deserialize on client
			deserializeAllStates(serializedState)

			// Client state should have server data
			expect(clientState.loading).toBe(false)
			expect(clientState.data).toBe('Data loaded from server!')
		})

		test('multiple states in SSR flow', () => {
			// Server-side
			state({count: 10}, 'Counter.state')
			state({user: {name: 'John'}}, 'User.state')

			const serialized = serializeAllStates()

			// Client-side
			clearStateRegistry()
			const clientState1 = state({count: 0}, 'Counter.state')
			const clientState2 = state({user: {name: ''}}, 'User.state')

			deserializeAllStates(serialized)

			expect(clientState1.count).toBe(10)
			expect(clientState2.user.name).toBe('John')
		})
	})

	describe('Edge Cases', () => {
		test('serializeStore throws error if value is not a state', () => {
			expect(() => {
				serializeStore({count: 0})
			}).toThrow('Value is not a state')
		})

		test('deserializeStore throws error if value is not a state', () => {
			expect(() => {
				deserializeStore({count: 0}, {count: 1})
			}).toThrow('Value is not a state')
		})

		test('deserializeStore handles empty serialized data', () => {
			const myState = state({count: 0}, 'myState')
			deserializeStore(myState, {})
			expect(myState.count).toBe(0) // Unchanged
		})

		test('deserializeStore handles null serialized data', () => {
			const myState = state({count: 0}, 'myState')
			deserializeStore(myState, null)
			expect(myState.count).toBe(0) // Unchanged
		})
	})
})
