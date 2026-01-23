import m from '../../index'
import {state} from '../../index'
import {Counter} from './components/counter'
import {TodoList} from './components/todo_list'
import {UserProfile} from './components/user_profile'
import {StateDebugger} from './components/state_debugger'
import {SignalPropExample} from './components/signal_prop_example'
import {SignalMethods} from './components/signal_methods'
import {Effects} from './components/effects'
import {ArraySignals} from './components/array_signals'
import {DynamicProperties} from './components/dynamic_properties'
import {NestedAccess} from './components/nested_access'
import {StoreBasic} from './components/store_basic'
import {StorePersistence} from './components/store_persistence'
import {StoreTodos} from './components/store_todos'

// Helper function to get tab from URL hash
function getTabFromHash(): 'state' | 'store' {
	if (typeof window === 'undefined') return 'state'
	const hash = window.location.hash.slice(1) // Remove the #
	return hash === 'store' ? 'store' : 'state'
}

// Helper function to update URL hash
function updateHash(tab: 'state' | 'store') {
	if (typeof window === 'undefined') return
	const hash = tab === 'store' ? '#store' : '#state'
	if (window.location.hash !== hash) {
		window.location.hash = hash
	}
}

// Tab state - initialize from URL hash
const tabState = state({
	activeTab: getTabFromHash() as 'state' | 'store',
}, 'app.tabs')

// Listen for hash changes (back/forward buttons, manual URL changes)
if (typeof window !== 'undefined') {
	window.addEventListener('hashchange', () => {
		tabState.activeTab = getTabFromHash()
		m.redraw()
	})
}

// Main application component
export const App = {
	view() {
		return (
			<div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
				<h1>Mithril State & Store Examples</h1>
				<p style="font-size: 14px; color: #666; margin-bottom: 20px;">
					Comprehensive demonstration of Mithril's signal-based state system and Store persistence.
					Each component only re-renders when its dependencies change (fine-grained reactivity).
				</p>
				
				{/* Tab Navigation */}
				<div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0;">
					<button
						onclick={() => {
							tabState.activeTab = 'state'
							updateHash('state')
						}}
						style={{
							padding: '12px 24px',
							fontSize: '16px',
							fontWeight: tabState.activeTab === 'state' ? 'bold' : 'normal',
							background: tabState.activeTab === 'state' ? '#2196f3' : 'transparent',
							color: tabState.activeTab === 'state' ? 'white' : '#666',
							border: 'none',
							borderBottom: tabState.activeTab === 'state' ? '3px solid #2196f3' : '3px solid transparent',
							cursor: 'pointer',
							transition: 'all 0.2s',
						}}
					>
						State Examples
					</button>
					<button
						onclick={() => {
							tabState.activeTab = 'store'
							updateHash('store')
						}}
						style={{
							padding: '12px 24px',
							fontSize: '16px',
							fontWeight: tabState.activeTab === 'store' ? 'bold' : 'normal',
							background: tabState.activeTab === 'store' ? '#2196f3' : 'transparent',
							color: tabState.activeTab === 'store' ? 'white' : '#666',
							border: 'none',
							borderBottom: tabState.activeTab === 'store' ? '3px solid #2196f3' : '3px solid transparent',
							cursor: 'pointer',
							transition: 'all 0.2s',
						}}
					>
						Store Examples
					</button>
				</div>

				{/* State Examples Tab */}
				{tabState.activeTab === 'state' && (
					<div>
						<p style="font-size: 14px; color: #666; margin-bottom: 20px;">
							Demonstration of Mithril's signal-based state system.
							Each component only re-renders when its dependencies change (fine-grained reactivity).
						</p>
						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
							<div>
								<Counter />
								<TodoList />
								<UserProfile />
								<NestedAccess />
								<ArraySignals />
								<DynamicProperties />
							</div>
							<div>
								<StateDebugger />
								<SignalPropExample />
								<SignalMethods />
								<Effects />
							</div>
						</div>
					</div>
				)}

				{/* Store Examples Tab */}
				{tabState.activeTab === 'store' && (
					<div>
						<p style="font-size: 14px; color: #666; margin-bottom: 20px;">
							Store wraps state() and adds persistence capabilities (localStorage/sessionStorage).
							These examples demonstrate how Store differs from basic state().
						</p>
						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
							<div>
								<StoreBasic />
								<StoreTodos />
							</div>
							<div>
								<StorePersistence />
							</div>
						</div>
					</div>
				)}
			</div>
		)
	},
}
