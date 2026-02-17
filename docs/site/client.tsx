import m from '../../index'
import {deserializeAllStates} from '../../render/ssrState'

import {getRoutes} from './routes'

// Import store so $docs is registered before deserialization
import './store'

const app = document.getElementById('app')
if (!app) throw new Error('Missing #app element')

// Restore SSR state before mounting so hydration matches
const ssrStateScript = document.getElementById('__SSR_STATE__')
if (ssrStateScript?.textContent) {
	try {
		deserializeAllStates(JSON.parse(ssrStateScript.textContent))
	} catch(err) {
		console.warn('Failed to deserialize SSR state:', err)
	}
}

const routes = getRoutes()

m.route.prefix = ''

try {
	m.route(app, '/', routes)
} catch(err) {
	app.innerHTML = `<div style="padding:20px;font-family:sans-serif">
		<h1>Error loading docs</h1>
		<pre style="background:#f5f5f5;padding:10px;overflow:auto">${String(err instanceof Error ? err.message : err)}</pre>
	</div>`
	throw err
}
