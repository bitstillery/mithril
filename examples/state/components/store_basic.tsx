import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$store, store} from '../store'

// Component demonstrating basic Store usage with load/save
export class StoreBasic extends MithrilTsxComponent {
	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Store: Basic Usage</h2>
				<p>Demonstrates Store class with load/save functionality:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li><code>store.load()</code> - Loads state from templates and localStorage</li>
					<li><code>store.save()</code> - Saves persistent state to localStorage</li>
					<li><code>store.state</code> - Access reactive state (works like state())</li>
					<li>Store wraps state() and adds persistence capabilities</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<h3 style="font-size: 14px;">Counter (persists across reloads):</h3>
					<p style="font-size: 18px; font-weight: bold;">Count: {$store.count}</p>
					<div style="display: flex; gap: 10px; margin-bottom: 10px;">
						<button onclick={() => $store.count++}>Increment</button>
						<button onclick={() => $store.count--}>Decrement</button>
						<button onclick={() => $store.count = 0}>Reset</button>
					</div>
					<button
						onclick={() => {
							store.save()
							alert('State saved to localStorage! Reload the page to see persistence.')
						}}
						style="background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
					>
						💾 Save to localStorage
					</button>
				</div>

				<div style="background: #e3f2fd; padding: 15px; border-radius: 4px; font-size: 11px;">
					<strong>💡 Tip:</strong> Store automatically saves when you call <code>store.save()</code>.
					<br />
					Only properties defined in the <code>persistent</code> template are saved.
					<br />
					Try incrementing the counter, saving, then reloading the page!
				</div>
			</div>
		)
	}
}
