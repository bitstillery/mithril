import m from '../../../index'
import { $s } from '../store'

// Simple counter component demonstrating signal usage
export const Counter = {
	view() {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Counter</h2>
				<p>Count: {$s.count}</p>
				<button onclick={() => $s.count++}>Increment</button>
				<button onclick={() => $s.count--}>Decrement</button>
				<button onclick={() => $s.count = 0}>Reset</button>
			</div>
		)
	},
}
