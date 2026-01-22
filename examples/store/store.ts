import { store } from '../../index'

// Example store setup
export const $s = store({
	count: 0,
	user: {
		name: 'John Doe',
		email: 'john@example.com',
	},
	todos: [
		{ id: 1, text: 'Learn Mithril Signals', completed: false },
		{ id: 2, text: 'Build example app', completed: false },
	] as any[],
	// Computed property (function - no prefix needed)
	totalTodos: () => $s.todos.length,
	completedTodos: () => $s.todos.filter((t: any) => t.completed).length,
	// Computed with _ prefix (backward compatibility)
	_incompleteTodos: () => $s.todos.filter((t: any) => !t.completed).length,
})
