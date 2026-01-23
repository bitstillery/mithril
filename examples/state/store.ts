import {Store} from '../../index'

interface Todo {
	id: number
	text: string
	completed: boolean
}

interface AppState {
	count: number
	persistentData: {
		username: string
		theme: string
		preferences: {
			notifications: boolean
			language: string
		}
	}
	volatileData: {
		currentView: string
		tempMessage: string
	}
	session: {
		sessionId: string
		loginTime: number
		lastActivity: number
	}
	todos: Todo[]
	totalTodos: () => number
	completedTodos: () => number
}

// Create Store instance
export const store = new Store<AppState>()

// Helper function to set computed properties on the state
// This will be called automatically after every load() via setupComputedProperties()
function setupComputedProperties() {
	// Set computed properties directly on the state
	// The state proxy will convert these functions into ComputedSignal instances
	store.state.totalTodos = () => store.state.todos.length
	store.state.completedTodos = () => store.state.todos.filter((t: Todo) => t.completed).length
}

// Initialize store with templates
// This should be called once when the app starts
export function initStore() {
	const persistent: Partial<AppState> = {
		persistentData: {
			username: 'Guest',
			theme: 'light',
			preferences: {
				notifications: true,
				language: 'en',
			},
		},
		todos: [
			{id: 1, text: 'Learn Mithril Store', completed: false},
			{id: 2, text: 'Understand persistence', completed: false},
		],
	}

	const volatile: Partial<AppState> = {
		count: 0,
		volatileData: {
			currentView: 'home',
			tempMessage: '',
		},
		// Note: Computed properties (functions) cannot be in templates because
		// they are not serializable. Store uses the same SSR serialization mechanism
		// (serializeStore) which automatically skips ComputedSignal properties.
		// They must be set directly on the state after loading, just like in SSR.
	}

	const session: Partial<AppState> = {
		session: {
			sessionId: `session-${Date.now()}`,
			loginTime: Date.now(),
			lastActivity: Date.now(),
		},
	}

	// Register computed properties setup function BEFORE load
	// This ensures the setup function is registered and will be called after load
	store.setupComputedProperties(setupComputedProperties)
	
	store.load(persistent, volatile, session)
	
	// Ensure computed properties are set immediately after load
	// (setupComputedProperties should have already been called by load(), but ensure it's set)
	setupComputedProperties()
}

// Initialize store on module load (synchronously)
if (typeof window !== 'undefined') {
	initStore()
}

// Export state accessor
// Note: Computed properties are set synchronously in initStore() above,
// so they will be available when components import $store
export const $store = store.state
