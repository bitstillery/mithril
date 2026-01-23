import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$store, store} from '../store'

// Component demonstrating persistent vs volatile vs session state
export class StorePersistence extends MithrilTsxComponent {
	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Store: Persistence Types</h2>
				<p>Demonstrates different persistence types in Store:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li><strong>Persistent</strong> - Saved to localStorage, survives page reloads</li>
					<li><strong>Volatile</strong> - Not saved, resets on page reload</li>
					<li><strong>Session</strong> - Saved to sessionStorage, survives reloads but clears when tab closes</li>
				</ul>

				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
					<div style="background: #e8f5e9; padding: 15px; border-radius: 4px;">
						<h3 style="margin-top: 0; font-size: 14px; color: #2e7d32;">Persistent State</h3>
						<p style="font-size: 11px; color: #666; margin-bottom: 10px;">
							Saved to localStorage - survives page reloads
						</p>
						<div style="margin-bottom: 10px;">
							<label style="display: block; font-size: 12px; margin-bottom: 5px;">
								Username:
								<input
									type="text"
									value={$store.persistentData.username}
									oninput={(e: Event) => {
										const target = e.target as HTMLInputElement
										$store.persistentData.username = target.value
									}}
									style="width: 100%; padding: 4px; margin-top: 5px;"
								/>
							</label>
							<label style="display: block; font-size: 12px; margin-top: 10px; margin-bottom: 5px;">
								Theme:
								<select
									value={$store.persistentData.theme}
									onchange={(e: Event) => {
										const target = e.target as HTMLSelectElement
										$store.persistentData.theme = target.value
									}}
									style="width: 100%; padding: 4px; margin-top: 5px;"
								>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
									<option value="auto">Auto</option>
								</select>
							</label>
							<label style="display: flex; align-items: center; font-size: 12px; margin-top: 10px;">
								<input
									type="checkbox"
									checked={$store.persistentData.preferences.notifications}
									onchange={(e: Event) => {
										const target = e.target as HTMLInputElement
										$store.persistentData.preferences.notifications = target.checked
									}}
									style="margin-right: 5px;"
								/>
								Enable notifications
							</label>
						</div>
					</div>

					<div style="background: #fff3e0; padding: 15px; border-radius: 4px;">
						<h3 style="margin-top: 0; font-size: 14px; color: #e65100;">Volatile State</h3>
						<p style="font-size: 11px; color: #666; margin-bottom: 10px;">
							Not saved - resets on page reload
						</p>
						<div style="margin-bottom: 10px;">
							<label style="display: block; font-size: 12px; margin-bottom: 5px;">
								Current View:
								<input
									type="text"
									value={$store.volatileData.currentView}
									oninput={(e: Event) => {
										const target = e.target as HTMLInputElement
										$store.volatileData.currentView = target.value
									}}
									style="width: 100%; padding: 4px; margin-top: 5px;"
								/>
							</label>
							<label style="display: block; font-size: 12px; margin-top: 10px; margin-bottom: 5px;">
								Temp Message:
								<input
									type="text"
									value={$store.volatileData.tempMessage}
									oninput={(e: Event) => {
										const target = e.target as HTMLInputElement
										$store.volatileData.tempMessage = target.value
									}}
									style="width: 100%; padding: 4px; margin-top: 5px;"
								/>
							</label>
						</div>
					</div>
				</div>

				<div style="background: #f3e5f5; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
					<h3 style="margin-top: 0; font-size: 14px; color: #6a1b9a;">Session State</h3>
					<p style="font-size: 11px; color: #666; margin-bottom: 10px;">
						Saved to sessionStorage - survives reloads but clears when tab closes
					</p>
					<div style="font-size: 12px;">
						<p>Session ID: <code>{$store.session?.sessionId || 'Not set'}</code></p>
						<p>Login Time: <code>
							{$store.session?.loginTime 
								? new Date($store.session.loginTime).toLocaleString() 
								: 'Not set'}
						</code></p>
						<p>Last Activity: <code>
							{$store.session?.lastActivity 
								? new Date($store.session.lastActivity).toLocaleString() 
								: 'Not set'}
						</code></p>
						<button
							onclick={() => {
								if (!$store.session) {
									// Initialize session if it doesn't exist
									$store.session = {
										sessionId: `session-${Date.now()}`,
										loginTime: Date.now(),
										lastActivity: Date.now(),
									}
								} else {
									$store.session.lastActivity = Date.now()
								}
								store.save()
							}}
							style="margin-top: 10px; padding: 6px 12px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer;"
						>
							Update Last Activity
						</button>
					</div>
				</div>

				<div style="display: flex; gap: 10px;">
					<button
						onclick={() => {
							store.save()
							alert('State saved! Persistent and session data will survive reloads.')
						}}
						style="background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
					>
						💾 Save State
					</button>
					<button
						onclick={() => {
							if (confirm('Reload page? Persistent data will be restored, volatile data will reset.')) {
								window.location.reload()
							}
						}}
						style="background: #2196f3; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
					>
						🔄 Test Reload
					</button>
				</div>

				<div style="background: #fff3e0; padding: 15px; border-radius: 4px; font-size: 11px; margin-top: 15px;">
					<strong>💡 Tip:</strong> Store uses <code>blueprint()</code> to determine what gets saved.
					<br />
					Only properties in the <code>persistent</code> template are saved to localStorage.
					<br />
					Properties in the <code>session</code> template are saved to sessionStorage.
					<br />
					Properties in the <code>volatile</code> template are never saved.
				</div>
			</div>
		)
	}
}
