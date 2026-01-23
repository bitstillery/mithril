import {MithrilTsxComponent, Vnode, effect} from '../../../index'
import m from '../../../index'
import {$s} from '../state'

// Component demonstrating effects
export class Effects extends MithrilTsxComponent {
	private cleanup?: () => void
	private effectLog: string[] = []
	private effectCount = 0

	oninit() {
		// Create an effect that runs when dependencies change
		this.cleanup = effect(() => {
			this.effectCount++
			const message = `[Effect #${this.effectCount}] Count: ${$s.count}, Total Todos: ${$s.totalTodos}`
			this.effectLog.push(message)
			
			// Limit log size
			if (this.effectLog.length > 10) {
				this.effectLog.shift()
			}
			
			m.redraw(this)
			
			// Return cleanup function (optional)
			return () => {
				// Cleanup runs before effect re-runs
			}
		})
	}

	onremove() {
		// Clean up effect
		if (this.cleanup) {
			this.cleanup()
		}
	}

	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Effects</h2>
				<p>Demonstrates the <code>effect()</code> function for reactive side effects:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li>Effects run automatically when dependencies change</li>
					<li>Effects can return cleanup functions</li>
					<li>Useful for side effects like logging, API calls, DOM manipulation</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<p>Count: {$s.count}</p>
					<p>Total Todos: {$s.totalTodos}</p>
					<button onclick={() => $s.count++}>Change Count</button>
					<button
						onclick={() => {
							const newId = Math.max(...$s.todos.map((t: any) => t.id), 0) + 1
							$s.todos = [...$s.todos, {id: newId, text: `Todo ${newId}`, completed: false}]
						}}
					>
						Add Todo (triggers effect)
					</button>
				</div>

				<div style="background: #e8f5e9; padding: 15px; border-radius: 4px;">
					<h3 style="margin-top: 0; font-size: 14px; color: #2e7d32;">Effect Log:</h3>
					<div style="font-family: monospace; font-size: 11px; line-height: 1.6;">
						{this.effectLog.length === 0 ? (
							<div style="color: #999;">Effect will run when dependencies change...</div>
						) : (
							this.effectLog.map((msg, i) => (
								<div key={i} style="margin-bottom: 4px; color: #1b5e20;">
									{msg}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		)
	}
}
