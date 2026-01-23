import {MithrilTsxComponent, Vnode, Signal} from '../../../index'
import m from '../../../index'
import {$s} from '../store'

// Component demonstrating Signal methods: subscribe, watch, peek
export class SignalMethods extends MithrilTsxComponent {
	private unsubscribeCount?: () => void
	private unsubscribeWatch?: () => void
	private logMessages: string[] = []

	oninit() {
		// Subscribe to count changes
		const countSignal = $s.$count as Signal<number>
		this.unsubscribeCount = countSignal.subscribe(() => {
			this.logMessages.push(`[Subscribe] Count changed to: ${countSignal.value}`)
			m.redraw(this)
		})

		// Watch count changes (provides old and new values)
		this.unsubscribeWatch = countSignal.watch((newValue, oldValue) => {
			this.logMessages.push(`[Watch] Count: ${oldValue} → ${newValue}`)
			m.redraw(this)
		})

		// Initial log
		this.logMessages.push('Signal methods initialized')
	}

	onremove() {
		// Clean up subscriptions
		if (this.unsubscribeCount) {
			this.unsubscribeCount()
		}
		if (this.unsubscribeWatch) {
			this.unsubscribeWatch()
		}
	}

	view(vnode: Vnode) {
		const countSignal = $s.$count as Signal<number>
		
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Signal Methods</h2>
				<p>Demonstrates Signal API methods:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li><code>signal.subscribe(callback)</code> - Subscribe to changes</li>
					<li><code>signal.watch(callback)</code> - Watch with old/new values</li>
					<li><code>signal.peek()</code> - Access value without subscribing</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<p>Current count: {$s.count}</p>
					<p>Peek (no subscription): {countSignal.peek()}</p>
					<button onclick={() => $s.count++}>Increment</button>
					<button onclick={() => $s.count--}>Decrement</button>
				</div>

				<div style="background: #f5f5f5; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto;">
					<h3 style="margin-top: 0; font-size: 14px;">Event Log:</h3>
					<div style="font-family: monospace; font-size: 11px; line-height: 1.6;">
						{this.logMessages.length === 0 ? (
							<div style="color: #999;">No events yet...</div>
						) : (
							this.logMessages.map((msg, i) => (
								<div key={i} style="margin-bottom: 4px; color: #333;">
									{msg}
								</div>
							))
						)}
					</div>
					{this.logMessages.length > 0 && (
						<button
							onclick={() => {
								this.logMessages = []
								m.redraw(this)
							}}
							style="margin-top: 10px; font-size: 11px;"
						>
							Clear Log
						</button>
					)}
				</div>
			</div>
		)
	}
}
