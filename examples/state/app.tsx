import m from '../../index'
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

// Main application component
export const App = {
	view() {
		return (
			<div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
				<h1>Mithril State Example</h1>
				<p style="font-size: 14px; color: #666;">
					Comprehensive demonstration of Mithril's signal-based state system.
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
				<div style="margin-top: 20px; border-top: 2px solid #ccc; padding-top: 20px;">
					<h2 style="margin-top: 0;">Store Examples (Persistence)</h2>
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
			</div>
		)
	},
}
