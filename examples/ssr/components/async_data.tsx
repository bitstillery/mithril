import {MithrilTsxComponent, Vnode, store} from '../../../index'
import m from '../../../index'

// Local store for this component's state
const state = store({
	loading: false,
	data: undefined as string | undefined,
}, 'AsyncData.state')

export class AsyncData extends MithrilTsxComponent {
	async oninit(vnode: Vnode) {
		state.loading = true

		// Simulate async data fetching
		const dataPromise = new Promise<string>((resolve) => {
			setTimeout(() => {
				resolve('Data loaded from server!')
			}, 100)
		})

		// Server-side: renderToString awaits async oninit before rendering view
		// Client-side: auto-redraw when async oninit completes (except during hydration)
		// Store changes automatically trigger redraws, no manual m.redraw() needed
		state.data = await dataPromise
		state.loading = false
	}

	view(vnode: Vnode): any {
		if (state.loading) {
			return <div>Loading...</div>
		}

		return <div>
			<h2>Async Data Component</h2>
			<p>{state.data || 'No data'}</p>
			<p>
				<strong>Note: </strong>
				This component fetches data asynchronously. On the server, renderToString awaits async oninit before rendering.
			</p>
		</div>
	}
}
