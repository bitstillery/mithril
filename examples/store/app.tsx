import m from '../../index'
import {Counter} from './components/counter'
import {TodoList} from './components/todo_list'
import {UserProfile} from './components/user_profile'
import {StoreDebugger} from './components/store_debugger'
import {SignalPropExample} from './components/signal_prop_example'

// Main application component
export const App = {
	view() {
		return (
			<div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
				<h1>Mithril Signals Example</h1>
				<p>This example demonstrates fine-grained reactivity with signals.</p>
				<p>Each component only re-renders when its dependencies change.</p>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
					<div>
						<Counter />
						<TodoList />
						<UserProfile />
						<SignalPropExample />
					</div>
					<div>
						<StoreDebugger />
					</div>
				</div>
			</div>
		)
	},
}
