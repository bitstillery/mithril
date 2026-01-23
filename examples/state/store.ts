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

// Computed properties are now automatically restored after load() and SSR deserialization
// They can be defined directly in templates - no manual setup needed!

// Initialize store with templates
// This should be called once when the app starts
export function initStore() {
	const saved: Partial<AppState> = {
		count: 0, // Count is saved - it will be saved to localStorage
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

	const temporary: Partial<AppState> = {
		volatileData: {
			currentView: 'home',
			tempMessage: '',
		},
		// Computed properties can be defined directly in templates!
		// They are automatically restored after load() and SSR deserialization
		totalTodos: () => store.state.todos.length,
		completedTodos: () => store.state.todos.filter((t: Todo) => t.completed).length,
	}

	const tab: Partial<AppState> = {
		session: {
			sessionId: `session-${Date.now()}`,
			loginTime: Date.now(),
			lastActivity: Date.now(),
		},
	}

	// Load store with templates
	// Computed properties defined in templates are automatically restored
	store.load(saved, temporary, tab)
}

// Initialize store on module load (synchronously)
if (typeof window !== 'undefined') {
	initStore()
}

// Export state accessor
// Computed properties are automatically available after load()
export const $store = store.state
