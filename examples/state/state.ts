import {state} from '../../src/index'

import type {State} from '../../src/index'

interface Todo {
    id: number
    text: string
    completed: boolean
}

interface ExampleState {
    count: number
    user: {name: string; email: string}
    todos: Todo[]
    totalTodos: () => number
    completedTodos: () => number
    incompleteTodos: () => number
    // Absent until the dynamic-properties demo adds them at runtime.
    dynamicValue?: number
    timestamp?: string
}

// Annotated because the computeds read $s inside its own initializer.
export const $s: State<ExampleState> = state<ExampleState>(
    {
        count: 0,
        user: {
            name: 'John Doe',
            email: 'john@example.com',
        },
        todos: [
            {id: 1, text: 'Learn Mithril Signals', completed: false},
            {id: 2, text: 'Build example app', completed: false},
        ],
        totalTodos: () => $s.todos.length,
        completedTodos: () => $s.todos.filter((t) => t.completed).length,
        incompleteTodos: () => $s.todos.filter((t) => !t.completed).length,
    },
    'state.example',
)
