import m from '../../../index'
import { $s } from '../store'

// Store debugger component - shows current store state and updates in real-time
export const StoreDebugger = {
	view() {
		// Access all store properties to track changes (fine-grained reactivity)
		// This component will automatically re-render when any accessed signal changes
		const count = $s.count
		const userName = $s.user.name
		const userEmail = $s.user.email
		const todos = $s.todos
		const totalTodos = $s.totalTodos
		const completedTodos = $s.completedTodos
		const incompleteTodos = $s._incompleteTodos

		// Build store state object for JSON display
		const storeState = {
			count,
			user: {
				name: userName,
				email: userEmail,
			},
			todos: todos.map((todo: any) => ({
				id: todo.id,
				text: todo.text,
				completed: todo.completed,
			})),
			computed: {
				totalTodos,
				completedTodos,
				_incompleteTodos: incompleteTodos,
			},
		}

		return (
			<div style="padding: 20px; border: 2px solid #4CAF50; margin: 10px; background: #f9f9f9; font-family: monospace; position: sticky; top: 20px;">
				<h2 style="margin-top: 0; color: #4CAF50; display: flex; align-items: center; gap: 8px;">
					🔍 Store Debugger
					<span style="font-size: 12px; font-weight: normal; color: #666;">
						(updates automatically)
					</span>
				</h2>
				
				<div style="background: white; padding: 15px; border-radius: 4px; overflow-x: auto; max-height: 400px; overflow-y: auto; border: 1px solid #ddd;">
					<pre style="margin: 0; font-size: 11px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">
{JSON.stringify(storeState, null, 2)}
					</pre>
				</div>

				<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
					<h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Quick Stats</h3>
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
						<div style="padding: 8px; background: #e3f2fd; border-radius: 4px;">
							<strong style="color: #1976d2;">Count:</strong> {count}
						</div>
						<div style="padding: 8px; background: #fff3e0; border-radius: 4px;">
							<strong style="color: #f57c00;">Total Todos:</strong> {totalTodos}
						</div>
						<div style="padding: 8px; background: #e8f5e9; border-radius: 4px;">
							<strong style="color: #388e3c;">Completed:</strong> {completedTodos}
						</div>
						<div style="padding: 8px; background: #fce4ec; border-radius: 4px;">
							<strong style="color: #c2185b;">Incomplete:</strong> {incompleteTodos}
						</div>
					</div>
					<div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 11px;">
						<strong>User:</strong> {userName} <span style="color: #666;">({userEmail})</span>
					</div>
				</div>

				<div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 4px; font-size: 11px; color: #2e7d32;">
					<strong>💡 Tip:</strong> This component demonstrates fine-grained reactivity. 
					It only re-renders when the signals it accesses change.
				</div>
			</div>
		)
	},
}
