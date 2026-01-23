import m from '../../index'
import {Counter} from './components/counter'
import {TodoList} from './components/todo_list'
import {UserProfile} from './components/user_profile'
import {StoreDebugger} from './components/store_debugger'
import {SignalPropExample} from './components/signal_prop_example'
import {SignalMethods} from './components/signal_methods'
import {Effects} from './components/effects'
import {ArraySignals} from './components/array_signals'
import {DynamicProperties} from './components/dynamic_properties'
import {NestedAccess} from './components/nested_access'

// Main application component
export const App = {
	view() {
		return (
			<div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
				<h1>Mithril Store Example</h1>
				<p style="font-size: 14px; color: #666;">
					Comprehensive demonstration of Mithril's signal-based store system.
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
						<StoreDebugger />
						<SignalPropExample />
						<SignalMethods />
						<Effects />
					</div>
				</div>
			</div>
		)
	},
}
