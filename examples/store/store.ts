import {store} from '../../index'

interface Todo {
	id: number
	text: string
	completed: boolean
}

// Example store setup
// Note: store() requires a name parameter for SSR serialization support
export const $s = store({
	count: 0,
	user: {
		name: 'John Doe',
		email: 'john@example.com',
	},
	todos: [
		{id: 1, text: 'Learn Mithril Signals', completed: false},
		{id: 2, text: 'Build example app', completed: false},
	] as Todo[],
	// Computed property (function - no prefix needed)
	totalTodos: () => $s.todos.length,
	completedTodos: () => $s.todos.filter((t: Todo) => t.completed).length,
	// Computed with _ prefix (backward compatibility)
	_incompleteTodos: () => $s.todos.filter((t: Todo) => !t.completed).length,
}, 'store.example')
