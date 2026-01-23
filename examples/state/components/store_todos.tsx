import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$store, store} from '../store'

interface Todo {
	id: number
	text: string
	completed: boolean
}

// Component demonstrating Store with todos (persistent data)
export class StoreTodos extends MithrilTsxComponent {
	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Store: Persistent Todos</h2>
				<p>Demonstrates Store with persistent todo list:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li>Todos are stored in persistent state</li>
					<li>They survive page reloads when saved</li>
					<li>Store.state provides reactive access (like state())</li>
					<li>Computed properties work the same way</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<div style="background: #e8f5e9; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
						<p style="margin: 0; font-size: 14px;">
							<strong>Total:</strong> {$store.totalTodos} | 
							<strong> Completed:</strong> {$store.completedTodos} | 
							<strong> Remaining:</strong> {$store.totalTodos - $store.completedTodos}
						</p>
					</div>

					<ul style="list-style: none; padding: 0; margin-bottom: 15px;">
						{$store.todos.map((todo: Todo) => (
							<li key={todo.id} style="margin-bottom: 8px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
								<label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
									<input
										type="checkbox"
										checked={todo.completed}
										onchange={(e: Event) => {
											const target = e.target as HTMLInputElement
											todo.completed = target.checked
										}}
									/>
									<span style={{textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1}}>
										{todo.text}
									</span>
								</label>
							</li>
						))}
					</ul>

					<div style="display: flex; gap: 10px; margin-bottom: 10px;">
						<input
							type="text"
							id="new-todo-input"
							placeholder="Add a new todo..."
							style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
							onkeydown={(e: KeyboardEvent) => {
								if (e.key === 'Enter') {
									const target = e.target as HTMLInputElement
									const text = target.value.trim()
									if (text) {
										const newId = Math.max(...$store.todos.map((t: Todo) => t.id), 0) + 1
										$store.todos = [...$store.todos, {id: newId, text, completed: false}]
										target.value = ''
									}
								}
							}}
						/>
						<button
							onclick={() => {
								const input = document.getElementById('new-todo-input') as HTMLInputElement
								const text = input.value.trim()
								if (text) {
									const newId = Math.max(...$store.todos.map((t: Todo) => t.id), 0) + 1
									$store.todos = [...$store.todos, {id: newId, text, completed: false}]
									input.value = ''
								}
							}}
							style="padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;"
						>
							Add
						</button>
					</div>

					<div style="display: flex; gap: 10px;">
						<button
							onclick={() => {
								$store.todos = $store.todos.filter((t: Todo) => !t.completed)
							}}
							style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;"
						>
							Remove Completed
						</button>
						<button
							onclick={() => {
								store.save()
								alert('Todos saved! They will persist across page reloads.')
							}}
							style="padding: 6px 12px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;"
						>
							💾 Save Todos
						</button>
					</div>
				</div>

				<div style="background: #e3f2fd; padding: 15px; border-radius: 4px; font-size: 11px;">
					<strong>💡 Tip:</strong> Todos are part of persistent state, so they'll be saved to localStorage.
					<br />
					Try adding some todos, saving, then reloading the page - they'll still be there!
					<br />
					Store.state provides the same reactive API as state(), so computed properties work seamlessly.
				</div>
			</div>
		)
	}
}
