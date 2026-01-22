import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'

interface AsyncDataAttrs {
	waitFor?: (p: Promise<any>) => void
}

export class AsyncData extends MithrilTsxComponent<AsyncDataAttrs> {
	data?: string
	loading = false

	async oninit(vnode: Vnode<AsyncDataAttrs>) {
		const waitFor = vnode.attrs?.waitFor
		this.loading = true

		// Simulate async data fetching
		const dataPromise = new Promise<string>((resolve) => {
			setTimeout(() => {
				resolve('Data loaded from server!')
			}, 100)
		})

		// On server, waitFor ensures server waits for this promise
		if (waitFor) {
			waitFor(dataPromise)
		}

		this.data = await dataPromise
		this.loading = false
	}

	view(vnode: Vnode<AsyncDataAttrs>) {
		if (this.loading) {
			return <div>Loading...</div>
		}

		return <div>
			<h2>Async Data Component</h2>
			<p>{this.data || 'No data'}</p>
			<p>
				<strong>Note: </strong>
				This component fetches data on the server using waitFor.
			</p>
		</div>
	}
}
