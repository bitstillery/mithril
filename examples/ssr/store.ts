import {Store} from '../../index'
import {registerState, getRegisteredStates, updateStateRegistry} from '../../state'

// Define the application state interface
interface AppState {
	// Saved state (localStorage) - survives browser restarts
	saved: {
		username: string
		theme: string
		visitCount: number
	}
	
	// Temporary state (not persisted) - resets on reload
	temporary: {
		currentView: string
		message: string
		clickCount: number
	}
	
	// Tab state (sessionStorage) - survives page reloads, clears when tab closes
	tab: {
		sessionId: string
		lastActivity: number
		tabSpecificData: string
	}
	
	// Session state (server-side) - comes from server, hydrated via SSR
	session: {
		user: {
			id: string | null
			name: string
			role: string
		}
		serverData: string
		lastServerUpdate: number
	}
	
	// Computed properties
	displayName: () => string
	isAuthenticated: () => boolean
}

// Create Store instance
export const store = new Store<AppState>()

// Initialize store with templates
export function initStore(sessionData: Partial<AppState> = {}) {
	const saved: Partial<AppState> = {
		saved: {
			username: 'Guest',
			theme: 'light',
			visitCount: 0,
		},
	}

	const temporary: Partial<AppState> = {
		temporary: {
			currentView: 'home',
			message: '',
			clickCount: 0,
		},
		// Computed properties defined in templates are automatically restored
		displayName: function(this: AppState) {
			return this.session.user.name || this.saved.username
		},
		isAuthenticated: function(this: AppState) {
			return !!this.session.user.id
		},
	}

	const tab: Partial<AppState> = {
		tab: {
			sessionId: `tab-${Date.now()}`,
			lastActivity: Date.now(),
			tabSpecificData: 'Tab-specific data',
		},
	}

	// Session template - properties defined here are server-bound
	// Session data comes from server (SSR), not localStorage
	const session: Partial<AppState> = {
		session: {
			user: {
				id: null,
				name: '',
				role: '',
			},
			serverData: '',
			lastServerUpdate: 0,
		},
		// Merge server-provided session data
		...sessionData,
	}

	// Register store state BEFORE load() so updateStateRegistry() in load() can find it
	// Create a temporary mergedInitial that includes computed properties
	// This will be updated by load() with the correct mergedInitial
	const tempMergedInitial = {
		saved: saved.saved,
		temporary: temporary.temporary,
		tab: tab.tab,
		session: session.session,
		displayName: temporary.displayName,
		isAuthenticated: temporary.isAuthenticated,
	}
	
	// Check if state is already registered (e.g., from previous request)
	const registeredStates = getRegisteredStates()
	if (!registeredStates.has('appStore')) {
		// Register state before load() so updateStateRegistry() in load() can find it
		// load() will update this with the correct mergedInitial
		registerState('appStore', store.state, tempMergedInitial)
	}
	
	// Load store with templates (this will call updateStateRegistry() internally)
	// load() creates mergedInitial the same way and updates the registry
	store.load(saved, temporary, tab, session)
	
	// After load(), the registry entry has the correct mergedInitial with computed properties
	// deserializeAllStates() will use this to restore computed properties
}

// Export state accessor
export const $store = store.state
