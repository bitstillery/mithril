import {MithrilTsxComponent, Vnode, state} from '../../../index'
import m from '../../../index'

// Local state for this component
const componentState = state({
	loading: false,
	data: undefined as string | undefined,
}, 'AsyncData.state')

export class AsyncData extends MithrilTsxComponent {
	async oninit(vnode: Vnode) {
		componentState.loading = true

		// Simulate async data fetching
		const dataPromise = new Promise<string>((resolve) => {
			setTimeout(() => {
				resolve('Data loaded from server!')
			}, 100)
		})

		// Server-side: renderToString awaits async oninit before rendering view
		// Client-side: auto-redraw when async oninit completes (except during hydration)
		// State changes automatically trigger redraws, no manual m.redraw() needed
		componentState.data = await dataPromise
		componentState.loading = false
	}

	view(vnode: Vnode): any {
		if (componentState.loading) {
			return <div>Loading...</div>
		}

		return <div>
			<h2>Async Data Component</h2>
			<p>{componentState.data || 'No data'}</p>
			<p>
				<strong>Note: </strong>
				This component fetches data asynchronously. On the server, renderToString awaits async oninit before rendering.
			</p>
		</div>
	}
}
