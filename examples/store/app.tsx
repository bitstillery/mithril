import m from '../../index'

import {Counter} from './components/Counter'
import {TodoList} from './components/TodoList'
import {UserProfile} from './components/UserProfile'
import {StoreDebugger} from './components/StoreDebugger'
import {SignalPropExample} from './components/SignalPropExample'

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
