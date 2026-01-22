import m from '../../../index'

interface AsyncDataState {
	data?: string
	loading: boolean
}

export const AsyncData = {
	oninit: async(vnode: any, waitFor?: (p: Promise<any>) => void) => {
		vnode.state.loading = true

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

		vnode.state.data = await dataPromise
		vnode.state.loading = false
	},

	view: (vnode: any) => {
		const state = vnode.state as AsyncDataState

		if (state.loading) {
			return <div>Loading...</div>
		}

		return <div>
            <h2>Async Data Component</h2>
            <p>{state.data || 'No data'}</p>
            <p>
                <strong>Note: </strong>
                This component fetches data on the server using waitFor.
            </p>
        </div>
	},
}
