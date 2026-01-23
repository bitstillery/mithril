import {MithrilTsxComponent, Vnode, Signal} from '../../../index'
import m from '../../../index'
import {$s} from '../state'

// Component demonstrating array signal access via $ prefix
export class ArraySignals extends MithrilTsxComponent {
	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Array Signal Access</h2>
				<p>Demonstrates accessing signals/stores for array elements using <code>$</code> prefix:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li><code>$s.todos[0]</code> - Access array element value (store or primitive)</li>
					<li><code>$s.todos.$0</code> - Access raw signal/store for first element</li>
					<li>Primitive elements return Signal instances (have <code>.peek()</code>)</li>
					<li>Object elements become stores directly (no Signal wrapper)</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<h3 style="font-size: 14px;">Todos:</h3>
					{$s.todos.length > 0 ? (
						<ul>
							{$s.todos.map((todo: any, index: number) => {
								// Access signal/store for this array element via $ prefix
								const elementSignal = ($s.todos as any)[`$${index}`]
								// Array elements that are objects become stores (not wrapped in Signal)
								// Array elements that are primitives are wrapped in Signal
								const isSignal = elementSignal && typeof elementSignal.peek === 'function'
								const displayValue = isSignal 
									? elementSignal.peek() 
									: elementSignal // If it's a store, use it directly
								
								return (
									<li key={todo.id} style="margin-bottom: 8px;">
										<div style="display: flex; align-items: center; gap: 10px;">
											<span>{todo.text}</span>
											<span style="font-size: 11px; color: #666;">
												({isSignal ? 'Signal' : 'Store'} value: {typeof displayValue === 'object' ? displayValue?.text : String(displayValue)})
											</span>
										</div>
									</li>
								)
							})}
						</ul>
					) : (
						<p style="color: #999;">No todos yet</p>
					)}
				</div>

				<div style="margin-bottom: 15px;">
					<button
						onclick={() => {
							const newId = Math.max(...$s.todos.map((t: any) => t.id), 0) + 1
							$s.todos = [...$s.todos, {id: newId, text: `Todo ${newId}`, completed: false}]
						}}
					>
						Add Todo
					</button>
					<button
						onclick={() => {
							if ($s.todos.length > 0) {
								$s.todos[0].text = `Updated: ${Date.now()}`
							}
						}}
					>
						Update First Todo
					</button>
				</div>

				<div style="background: #fff3e0; padding: 15px; border-radius: 4px; font-size: 11px;">
					<strong>💡 Tip:</strong> Array elements that are objects become stores themselves:
					<br />
					<code style="background: white; padding: 2px 4px; border-radius: 2px;">
						$s.todos[0].text
					</code>
					{' '}automatically tracks changes reactively.
					<br />
					<code style="background: white; padding: 2px 4px; border-radius: 2px;">
						$s.todos.$0
					</code>
					{' '}returns the store directly (not wrapped in Signal), while primitive elements return Signal instances.
				</div>
			</div>
		)
	}
}
