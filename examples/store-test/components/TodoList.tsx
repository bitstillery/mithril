import m from '../../../index'
import { $s } from '../store'

// Todo list component demonstrating computed properties
export const TodoList = {
	view() {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Todo List</h2>
				<p>Total: {$s.totalTodos}</p>
				<p>Completed: {$s.completedTodos}</p>
				<p>Incomplete: {$s._incompleteTodos}</p>
				<ul>
					{$s.todos.map((todo: any) => (
						<li key={todo.id} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
							<input
								type="checkbox"
								checked={todo.completed}
								onchange={(e: any) => {
									todo.completed = e.target.checked
								}}
							/>
							{todo.text}
						</li>
					))}
				</ul>
				<button
					onclick={() => {
						const newId = Math.max(...$s.todos.map((t: any) => t.id), 0) + 1
						$s.todos = [...$s.todos, { id: newId, text: `Todo ${newId}`, completed: false }]
					}}
				>
					Add Todo
				</button>
			</div>
		)
	},
}
