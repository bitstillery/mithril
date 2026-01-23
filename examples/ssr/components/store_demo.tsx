import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$store, store} from '../store'

export class StoreDemo extends MithrilTsxComponent {
	view() {
		return <div class="store-demo">
			<h2>Store State Types Demo</h2>
			<p>This demo shows how different state types work with SSR:</p>
			
			<div class="state-section">
				<h3>Saved State (localStorage)</h3>
				<p>Survives browser restarts. Not overwritten by SSR.</p>
				<div class="state-display">
					<label>Username:</label>
					<input
						type="text"
						value={$store.saved.username}
						oninput={(e: Event) => {
							$store.saved.username = (e.target as HTMLInputElement).value
							m.redraw()
						}}
					/>
					<p>Visit Count: {$store.saved.visitCount}</p>
					<button onclick={() => {
						$store.saved.visitCount++
						store.save()
						m.redraw()
					}}>Increment Visit Count</button>
				</div>
			</div>

			<div class="state-section">
				<h3>Temporary State (not persisted)</h3>
				<p>Resets on page reload. Overwritten by SSR.</p>
				<div class="state-display">
					<p>Click Count: {$store.temporary.clickCount}</p>
					<button onclick={() => {
						$store.temporary.clickCount++
						m.redraw()
					}}>Increment Click Count</button>
					<p>Message: {$store.temporary.message}</p>
					<input
						type="text"
						value={$store.temporary.message}
						placeholder="Enter message"
						oninput={(e: Event) => {
							$store.temporary.message = (e.target as HTMLInputElement).value
							m.redraw()
						}}
					/>
				</div>
			</div>

			<div class="state-section">
				<h3>Tab State (sessionStorage)</h3>
				<p>Survives page reloads. Clears when tab closes. Not overwritten by SSR.</p>
				<div class="state-display">
					<p>Session ID: {$store.tab.sessionId}</p>
					<p>Last Activity: {new Date($store.tab.lastActivity).toLocaleString()}</p>
					<p>Tab Data: {$store.tab.tabSpecificData}</p>
					<button onclick={() => {
						$store.tab.lastActivity = Date.now()
						$store.tab.tabSpecificData = `Updated at ${new Date().toLocaleTimeString()}`
						store.save()
						m.redraw()
					}}>Update Tab Activity</button>
				</div>
			</div>

			<div class="state-section">
				<h3>Session State (server-side)</h3>
				<p>Comes from server via SSR. Overwritten by SSR. Not stored in localStorage.</p>
				<div class="state-display">
					<p>User ID: {$store.session.user.id || 'Not authenticated'}</p>
					<p>User Name: {$store.session.user.name || 'Guest'}</p>
					<p>Role: {$store.session.user.role || 'None'}</p>
					<p>Server Data: {$store.session.serverData || 'No server data'}</p>
					<p>Last Server Update: {$store.session.lastServerUpdate ? new Date($store.session.lastServerUpdate).toLocaleString() : 'Never'}</p>
					<p>Authenticated: {$store.isAuthenticated ? 'Yes' : 'No'}</p>
					<p>Display Name: {$store.displayName}</p>
				</div>
			</div>

			<div class="state-section">
				<h3>State Precedence Test</h3>
				<p>After SSR hydration:</p>
				<ul>
					<li>✅ Saved state: Preserved (not overwritten)</li>
					<li>✅ Tab state: Preserved (not overwritten)</li>
					<li>⚠️ Temporary state: Overwritten by SSR</li>
					<li>⚠️ Session state: Overwritten by SSR (comes from server)</li>
				</ul>
				<button onclick={() => {
					// Reload page to test SSR hydration
					if (typeof window !== 'undefined') {
						window.location.reload()
					}
				}}>Reload Page (Test SSR Hydration)</button>
			</div>

			<style>{`
				.store-demo {
					padding: 20px;
				}
				.state-section {
					margin: 20px 0;
					padding: 15px;
					border: 1px solid #ddd;
					border-radius: 5px;
				}
				.state-section h3 {
					margin-top: 0;
					color: #333;
				}
				.state-display {
					margin-top: 10px;
				}
				.state-display label {
					display: inline-block;
					width: 100px;
					margin-right: 10px;
				}
				.state-display input {
					padding: 5px;
					margin: 5px 0;
				}
				.state-display button {
					padding: 8px 15px;
					margin: 5px 5px 5px 0;
					background: #007bff;
					color: white;
					border: none;
					border-radius: 3px;
					cursor: pointer;
				}
				.state-display button:hover {
					background: #0056b3;
				}
				.state-display p {
					margin: 5px 0;
				}
			`}</style>
		</div>
	}
}
