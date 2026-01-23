// @ts-nocheck
import {describe, test, expect, beforeEach, afterEach} from 'bun:test'

import {Store} from '../../store'
import {clearStateRegistry, getRegisteredStates} from '../../state'
import {deserializeAllStates, serializeAllStates} from '../../render/ssrState'

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {}
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString()
		},
		removeItem: (key: string) => {
			delete store[key]
		},
		clear: () => {
			store = {}
		},
	}
})()

const sessionStorageMock = (() => {
	let store: Record<string, string> = {}
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString()
		},
		removeItem: (key: string) => {
			delete store[key]
		},
		clear: () => {
			store = {}
		},
	}
})()

// Setup global window if it doesn't exist (for Node.js test environment)
if (typeof window === 'undefined') {
	;(global as any).window = {
		localStorage: localStorageMock,
		sessionStorage: sessionStorageMock,
		setInterval: (_fn: () => void, _delay: number) => {
			// Return a mock interval ID
			return 1
		},
		clearInterval: () => {},
	}
}

describe('Store', () => {
	let originalConsoleError: typeof console.error
	let originalConsoleLog: typeof console.log

	beforeEach(() => {
		// Suppress console.error and console.log in tests - these are informational
		// and don't indicate test failures
		originalConsoleError = console.error
		originalConsoleLog = console.log
		console.error = () => {}
		console.log = () => {}

		// Clear state registry to avoid name collisions
		clearStateRegistry()
		// Setup mocks
		if (typeof window !== 'undefined') {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
				writable: true,
			})
			Object.defineProperty(window, 'sessionStorage', {
				value: sessionStorageMock,
				writable: true,
			})
		}
		localStorageMock.clear()
		sessionStorageMock.clear()
	})

	afterEach(() => {
		// Restore original console methods
		console.error = originalConsoleError
		console.log = originalConsoleLog
	})

	afterEach(() => {
		// Clean up any intervals
		if (typeof window !== 'undefined' && window.clearInterval) {
			// Clear any intervals that might have been set
			for (let i = 1; i < 10000; i++) {
				window.clearInterval(i)
			}
		}
	})

	describe('Store Initialization', () => {
		test('creates store with default lookup TTL', () => {
			const store = new Store()
			expect(store).toBeInstanceOf(Store)
			expect(store.state).toBeDefined()
		})

		test('creates store with custom lookup TTL', () => {
			const customTTL = 1000 * 60 * 30 // 30 minutes
			const store = new Store({lookup_ttl: customTTL})
			expect(store).toBeInstanceOf(Store)
		})

		test('store.state returns reactive state instance', () => {
			const store = new Store()
			const state = store.state
			expect(state).toBeDefined()
			// State should be reactive (has __isState flag)
			expect((state as any).__isState).toBe(true)
		})
	})

	describe('Store.load()', () => {
		test('loads state from templates when storage is empty', () => {
			const store = new Store()
			const saved = {count: 0, name: 'initial'}
			const temporary = {temp: 'value'}
			const tab = {sessionId: 'abc123'}

			store.load(saved, temporary, tab)

			expect(store.state.count).toBe(0)
			expect(store.state.name).toBe('initial')
			expect(store.state.temp).toBe('value')
			expect((store.state as any).tab.sessionId).toBe('abc123')
		})

		test('loads state from localStorage when available', () => {
			localStorageMock.setItem('store', JSON.stringify({
				count: 42,
				name: 'restored',
			}))

			const store = new Store()
			const saved = {count: 0, name: 'initial'}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)

			expect(store.state.count).toBe(42)
			expect(store.state.name).toBe('restored')
		})

		test('loads tab state from sessionStorage when available', () => {
			sessionStorageMock.setItem('store', JSON.stringify({
				sessionId: 'restored-session',
			}))

			const store = new Store()
			const saved = {}
			const temporary = {}
			const tab = {sessionId: 'new-session'}

			store.load(saved, temporary, tab)

			expect((store.state as any).tab.sessionId).toBe('restored-session')
		})

		test('merges saved template with localStorage data', () => {
			localStorageMock.setItem('store', JSON.stringify({
				count: 100,
				// name is not in localStorage, should come from template
			}))

			const store = new Store()
			const saved = {count: 0, name: 'template-name'}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)

			expect(store.state.count).toBe(100) // From localStorage
			expect(store.state.name).toBe('template-name') // From template
		})

		test('preserves identity from localStorage for version bumps', () => {
			localStorageMock.setItem('store', JSON.stringify({
				count: 0,
				identity: 'old-identity-123',
			}))

			const store = new Store()
			const saved = {count: 0}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)

			expect((store.state as any).identity).toBe('old-identity-123')
		})

		test('handles invalid JSON in localStorage gracefully', () => {
			localStorageMock.setItem('store', 'invalid json{')

			const store = new Store()
			const saved = {count: 0}
			const temporary = {}
			const tab = {}

			// Should not throw, should use template values
			store.load(saved, temporary, tab)
			expect(store.state.count).toBe(0)
		})

		test('handles nested objects correctly', () => {
			localStorageMock.setItem('store', JSON.stringify({
				user: {
					name: 'John',
					email: 'john@example.com',
				},
			}))

			const store = new Store()
			const saved = {
				user: {
					name: '',
					email: '',
				},
			}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)

			expect(store.state.user.name).toBe('John')
			expect(store.state.user.email).toBe('john@example.com')
		})

		test('temporary data overrides saved data', () => {
			localStorageMock.setItem('store', JSON.stringify({
				count: 100,
			}))

			const store = new Store()
			const saved = {count: 0}
			const temporary = {count: 999} // Should override
			const tab = {}

			store.load(saved, temporary, tab)

			expect(store.state.count).toBe(999)
		})
	})

	describe('Store.save()', () => {
		test('saves saved data to localStorage', () => {
			const store = new Store()
			const saved = {count: 0, name: 'test'}
			const temporary = {temp: 'value'}
			const tab = {}

			store.load(saved, temporary, tab)
			store.state.count = 42
			store.state.name = 'updated'
			store.save()

			const savedData = JSON.parse(localStorageMock.getItem('store') || '{}')
			expect(savedData.count).toBe(42)
			expect(savedData.name).toBe('updated')
			expect(savedData.temp).toBeUndefined() // Temporary should not be saved
		})

		test('saves tab data to sessionStorage', () => {
			const store = new Store()
			const saved = {}
			const temporary = {}
			const tab = {sessionId: 'abc123'}

			store.load(saved, temporary, tab)
			;(store.state as any).tab.sessionId = 'updated-session'
			store.save()

			const savedData = JSON.parse(sessionStorageMock.getItem('store') || '{}')
			expect(savedData.sessionId).toBe('updated-session')
		})

		test('only saves keys defined in saved template', () => {
			const store = new Store()
			const saved = {count: 0} // Only count should be saved
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			store.state.count = 42
			;(store.state as any).extraProperty = 'should not be saved'
			store.save()

			const savedData = JSON.parse(localStorageMock.getItem('store') || '{}')
			expect(savedData.count).toBe(42)
			expect(savedData.extraProperty).toBeUndefined()
		})

		test('handles save errors gracefully', () => {
			// Mock localStorage.setItem to throw
			const originalSetItem = localStorageMock.setItem
			localStorageMock.setItem = () => {
				throw new Error('Storage quota exceeded')
			}

			const store = new Store()
			const saved = {count: 0}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			// Should not throw
			store.save()

			// Restore original
			localStorageMock.setItem = originalSetItem
		})
	})

	describe('Store.blueprint()', () => {
		test('extracts only keys defined in blueprint', () => {
			const store = new Store()
			const state = {
				count: 42,
				name: 'test',
				extra: 'should not be in result',
			}
			const blueprint = {
				count: 0,
				name: '',
			}

			const result = store.blueprint(state as any, blueprint)

			expect(result.count).toBe(42)
			expect(result.name).toBe('test')
			expect(result.extra).toBeUndefined()
		})

		test('handles nested objects recursively', () => {
			const store = new Store()
			const state = {
				user: {
					name: 'John',
					email: 'john@example.com',
					extra: 'should not be in result',
				},
			}
			const blueprint = {
				user: {
					name: '',
					email: '',
				},
			}

			const result = store.blueprint(state as any, blueprint)

			expect(result.user.name).toBe('John')
			expect(result.user.email).toBe('john@example.com')
			expect(result.user.extra).toBeUndefined()
		})

		test('handles lookup key specially (one-one copy)', () => {
			const store = new Store()
			const state = {
				lookup: {
					key1: {value: 'value1', modified: Date.now()},
					key2: {value: 'value2', modified: Date.now()},
					key3: {value: 'value3', modified: Date.now()},
				},
			}
			const blueprint = {
				lookup: {},
			}

			const result = store.blueprint(state as any, blueprint)

			// Lookup should be copied entirely, not blueprinted per-key
			expect(result.lookup).toEqual(state.lookup)
			expect(result.lookup.key1).toBeDefined()
			expect(result.lookup.key2).toBeDefined()
			expect(result.lookup.key3).toBeDefined()
		})

		test('handles arrays correctly', () => {
			const store = new Store()
			const state = {
				items: [1, 2, 3],
			}
			const blueprint = {
				items: [],
			}

			const result = store.blueprint(state as any, blueprint)

			expect(result.items).toEqual([1, 2, 3])
		})

		test('only includes keys that exist in state', () => {
			const store = new Store()
			const state = {
				count: 42,
			}
			const blueprint = {
				count: 0,
				missing: '',
			}

			const result = store.blueprint(state as any, blueprint)

			expect(result.count).toBe(42)
			expect(result.missing).toBeUndefined()
		})
	})

	describe('Store.clean_lookup()', () => {
		test('removes invalid lookup entries', () => {
			const store = new Store()
			const saved = {lookup: {
				valid: {value: 'test', modified: Date.now()},
				invalid: null,
				invalid2: 'not an object',
			}}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			
			// Verify initial state
			expect((store.state as any).lookup.valid).toBeDefined()
			expect((store.state as any).lookup.invalid).toBe(null)
			expect((store.state as any).lookup.invalid2).toBe('not an object')
			
			store.clean_lookup()

			// After cleanup, invalid entries should be removed
			// Verify by checking saved state (clean_lookup calls save())
			const savedData = JSON.parse(localStorageMock.getItem('store') || '{}')
			expect(savedData.lookup).toBeDefined()
			expect(savedData.lookup.valid).toBeDefined()
			expect(savedData.lookup.invalid).toBeUndefined()
			expect(savedData.lookup.invalid2).toBeUndefined()
		})

		test('adds modified timestamp to entries without one', () => {
			const store = new Store()
			const saved = {lookup: {}}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			const now = Date.now()
			;(store.state as any).lookup = {
				entry: {value: 'test'},
			}

			store.clean_lookup()

			expect((store.state as any).lookup.entry.modified).toBeDefined()
			expect(typeof (store.state as any).lookup.entry.modified).toBe('number')
			expect((store.state as any).lookup.entry.modified).toBeGreaterThanOrEqual(now)
		})

		test('removes entries older than TTL', () => {
			const store = new Store({lookup_ttl: 1000}) // 1 second TTL
			const saved = {lookup: {
				old: {value: 'old', modified: Date.now() - 2000}, // 2 seconds ago
				new: {value: 'new', modified: Date.now()}, // Just now
			}}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			
			// Verify initial state
			expect((store.state as any).lookup.old).toBeDefined()
			expect((store.state as any).lookup.new).toBeDefined()
			
			store.clean_lookup()

			// After cleanup, old entry should be removed
			// Verify by checking saved state (clean_lookup calls save())
			const savedData = JSON.parse(localStorageMock.getItem('store') || '{}')
			expect(savedData.lookup).toBeDefined()
			expect(savedData.lookup.old).toBeUndefined()
			expect(saved.lookup.new).toBeDefined()
			expect(saved.lookup.new.value).toBe('new')
		})

		test('does nothing if lookup does not exist', () => {
			const store = new Store()
			const saved = {}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			// No lookup property

			// Should not throw
			store.clean_lookup()
		})

		test('calls save() when lookup is modified', () => {
			const store = new Store()
			const saved = {lookup: {}}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)
			;(store.state as any).lookup = {
				invalid: null,
			}

			// Clear localStorage before clean_lookup
			localStorageMock.clear()
			store.clean_lookup()

			// Verify save was called by checking if localStorage was updated
			const savedData = localStorageMock.getItem('store')
			expect(savedData).not.toBeNull()
		})
	})

		describe('Store.get() and Store.get_tab_storage()', () => {
		test('get() returns localStorage value', () => {
			localStorageMock.setItem('test-key', 'test-value')
			const store = new Store()
			expect(store.get('test-key')).toBe('test-value')
		})

		test('get() returns "{}" when key does not exist', () => {
			const store = new Store()
			expect(store.get('non-existent')).toBe('{}')
		})

		test('get_tab_storage() returns sessionStorage value', () => {
			sessionStorageMock.setItem('test-key', 'test-value')
			const store = new Store()
			expect(store.get_tab_storage('test-key')).toBe('test-value')
		})

		test('get_tab_storage() returns "{}" when key does not exist', () => {
			const store = new Store()
			expect(store.get_tab_storage('non-existent')).toBe('{}')
		})
	})

		describe('Store.set() and Store.set_tab()', () => {
		test('set() saves to localStorage', () => {
			const store = new Store()
			store.set('test-key', {count: 42})
			const savedData = JSON.parse(localStorageMock.getItem('test-key') || '{}')
			expect(savedData.count).toBe(42)
		})

		test('set_tab() saves to sessionStorage', () => {
			const store = new Store()
			store.set_tab('test-key', {sessionId: 'abc123'})
			const savedData = JSON.parse(sessionStorageMock.getItem('test-key') || '{}')
			expect(savedData.sessionId).toBe('abc123')
		})

		test('set() handles errors gracefully', () => {
			const originalSetItem = localStorageMock.setItem
			localStorageMock.setItem = () => {
				throw new Error('Storage error')
			}

			const store = new Store()
			// Should not throw - error is caught and handled gracefully
			store.set('test-key', {count: 42})

			localStorageMock.setItem = originalSetItem
		})
	})

	describe('Integration Tests', () => {
		test('complete flow: load, modify, save, reload', () => {
			const store1 = new Store()
			const saved = {count: 0, name: 'initial'}
			const temporary = {}
			const tab = {}

			// Load initial state
			store1.load(saved, temporary, tab)
			expect(store1.state.count).toBe(0)

			// Modify state
			store1.state.count = 100
			store1.state.name = 'updated'

			// Save
			store1.save()

			// Create new store and reload
			const store2 = new Store()
			store2.load(saved, temporary, tab)

			// Should have saved values
			expect(store2.state.count).toBe(100)
			expect(store2.state.name).toBe('updated')
		})

		test('temporary data is not persisted', () => {
			const store1 = new Store()
			const saved = {count: 0}
			const temporary = {temp: 'temporary'}
			const tab = {}

			store1.load(saved, temporary, tab)
			store1.state.count = 42
			;(store1.state as any).temp = 'modified-temp'
			store1.save()

			// Reload
			const store2 = new Store()
			store2.load(saved, {}, tab) // No temporary data

			expect(store2.state.count).toBe(42) // Saved
			expect((store2.state as any).temp).toBeUndefined() // Temporary not saved
		})
	})

	describe('Unified Deserialization and Computed Properties', () => {
		test('computed properties defined in templates are automatically restored after load()', () => {
			const store = new Store<{
				count: number
				doubled: () => number
			}>()

			const saved = {count: 0}
			const temporary = {
				doubled: function(this: {count: number}) {
					return this.count * 2
				},
			}
			const tab = {}

			store.load(saved, temporary, tab)

			// Debug: Check if doubled is in signalMap
			const signalMap = (store.state as any).__signalMap
			expect(signalMap).toBeDefined()
			expect(signalMap.has('doubled')).toBe(true)
			
			// Computed property should be automatically restored and work
			expect(store.state.doubled).toBe(0) // 0 * 2 = 0
			
			store.state.count = 5
			expect(store.state.doubled).toBe(10) // 5 * 2 = 10
		})

		test('computed properties work after SSR deserialization', () => {
			// Simulate server-side: create store and populate data
			const serverStore = new Store<{
				count: number
				doubled: () => number
			}>()

			const saved = {count: 0}
			const temporary = {
				doubled: function(this: {count: number}) {
					return this.count * 2
				},
			}
			const tab = {}

			serverStore.load(saved, temporary, tab)
			serverStore.state.count = 10

			// Serialize on server - get the store's state name from registry
			const registered = getRegisteredStates()
			const serverStoreEntry = Array.from(registered.entries()).find(entry => entry[1].state === serverStore.state)
			const serverStoreName = serverStoreEntry![0]
			const serialized = serializeAllStates()

			// Simulate client-side: create fresh store with same templates
			clearStateRegistry()
			const clientStore = new Store<{
				count: number
				doubled: () => number
			}>()

			clientStore.load(saved, temporary, tab)

			// Get client store name and update serialized data to use client store name
			const clientRegistered = getRegisteredStates()
			const clientStoreEntry = Array.from(clientRegistered.entries()).find(entry => entry[1].state === clientStore.state)
			const clientStoreName = clientStoreEntry![0]
			
			// Update serialized data to use client store name
			const updatedSerialized: Record<string, any> = {}
			updatedSerialized[clientStoreName] = serialized[serverStoreName]

			// Deserialize on client
			deserializeAllStates(updatedSerialized)

			// Client state should have server data
			expect(clientStore.state.count).toBe(10)
			// Computed property should be automatically restored and work
			expect(clientStore.state.doubled).toBe(20) // 10 * 2 = 20

			// Update count - computed property should still work
			clientStore.state.count = 5
			expect(clientStore.state.doubled).toBe(10) // 5 * 2 = 10
		})

		test('computed properties can be defined in saved template', () => {
			const store = new Store<{
				count: number
				squared: () => number
			}>()

			const saved = {
				count: 0,
				squared: function(this: {count: number}) {
					return this.count * this.count
				},
			}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)

			store.state.count = 4
			expect(store.state.squared).toBe(16) // 4 * 4 = 16
		})

		test('computed properties can be defined in tab template', () => {
			const store = new Store<{
				tab: {
					sessionId: string
					isValid: () => boolean
				}
			}>()

			const saved = {}
			const temporary = {}
			// Tab template structure: tab data is nested under 'tab' key
			// This matches how Store.load() merges tab_state into store_state
			const tab = {
				sessionId: 'abc123',
				isValid: function(this: {sessionId: string}) {
					return this.sessionId && this.sessionId.length > 0
				},
			}

			store.load(saved, temporary, tab)

			// sessionId should be set (tab template is merged into store_state.tab)
			expect((store.state as any).tab.sessionId).toBe('abc123')
			// Computed property should work
			expect((store.state as any).tab.isValid).toBe(true)
		})

		test('computed properties work with nested state', () => {
			const store = new Store<{
				user: {
					name: string
					fullName: () => string
				}
			}>()

			const saved = {
				user: {
					name: 'John',
					fullName: function(this: {name: string}) {
						return `Mr. ${this.name}`
					},
				},
			}
			const temporary = {}
			const tab = {}

			store.load(saved, temporary, tab)

			expect(store.state.user.fullName).toBe('Mr. John')
			
			store.state.user.name = 'Jane'
			expect(store.state.user.fullName).toBe('Mr. Jane')
		})

		test('registry entry is updated with merged templates after load()', () => {
			const store = new Store<{
				count: number
				doubled: () => number
			}>()

			const saved = {count: 0}
			const temporary = {
				doubled: function(this: {count: number}) {
					return this.count * 2
				},
			}
			const tab = {}

			store.load(saved, temporary, tab)

			// Check registry entry
			const registered = getRegisteredStates()
			const storeEntry = Array.from(registered.values()).find(entry => entry.state === store.state)
			
			expect(storeEntry).toBeDefined()
			expect(storeEntry?.initial).toBeDefined()
			expect(storeEntry?.initial.count).toBe(0)
			expect(typeof storeEntry?.initial.doubled).toBe('function')
		})

		test('computed properties persist across multiple load() calls', () => {
			const store = new Store<{
				count: number
				doubled: () => number
			}>()

			const saved = {count: 0}
			const temporary = {
				doubled: function(this: {count: number}) {
					return this.count * 2
				},
			}
			const tab = {}

			// First load
			store.load(saved, temporary, tab)
			store.state.count = 5
			expect(store.state.doubled).toBe(10)

			// Save and reload
			store.save()
			store.load(saved, temporary, tab)

			// Computed property should still work after reload
			expect(store.state.count).toBe(5) // Restored from localStorage
			expect(store.state.doubled).toBe(10) // Computed property still works
		})
	})
})
