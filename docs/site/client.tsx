import m from '../../index'
import {deserializeAllStates, deserializeStore} from '../../render/ssrState'

import {getRoutes} from './routes'

import {$s} from './store'

const app = document.getElementById('app')
if (!app) throw new Error('Missing #app element')

// Store already loaded by initStore() in store module. Single load keeps state.perf stable.
// Restore docs from SSR for hydration. Skip full Store deserialize so perf stays from localStorage.
const ssrStateScript = document.getElementById('__SSR_STATE__')
if (ssrStateScript?.textContent) {
    try {
        const ssrState = JSON.parse(ssrStateScript.textContent)
        deserializeAllStates(ssrState, {skipStates: new Set([$s.state])})
        // Merge docs from SSR store into $s.state.docs (hydration)
        const storeEntry = Object.values(ssrState).find(
            (s): s is {perf: unknown; docs: unknown} => s != null && typeof s === 'object' && 'perf' in s && 'docs' in s,
        )
        if (storeEntry?.docs) {
            deserializeStore($s.state, {docs: storeEntry.docs})
        }
    } catch (err) {
        console.warn('Failed to deserialize SSR state:', err)
    }
}

const routes = getRoutes()

m.route.prefix = ''

try {
    m.route(app, '/', routes)
} catch (err) {
    app.innerHTML = `<div style="padding:20px;font-family:sans-serif">
		<h1>Error loading docs</h1>
		<pre style="background:#f5f5f5;padding:10px;overflow:auto">${String(err instanceof Error ? err.message : err)}</pre>
	</div>`
    throw err
}
