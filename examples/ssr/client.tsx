/// <reference path="./jsx.d.ts" />

import m from '../../index'
import {deserializeAllStates} from '../../render/ssrState'

import {routes} from './routes'
import {initStore, $store} from './store'

// Set prefix to empty string for pathname-based routing (not hash-based)
m.route.prefix = ''

// Initialize store FIRST so it's registered before SSR deserialization
// This ensures computed properties can be restored after deserialization
// Session data comes from SSR state (will be hydrated by deserializeAllStates)
initStore({})

// Read and restore SSR state after store is registered
// This will hydrate the store state and restore computed properties
	const ssrStateScript = document.getElementById('__SSR_STATE__')
	if (ssrStateScript && ssrStateScript.textContent) {
		try {
			const serializedState = JSON.parse(ssrStateScript.textContent)
			deserializeAllStates(serializedState)
		} catch (error) {
			console.error('Error deserializing SSR state:', error)
		}
	}

// Client-side routing with isomorphic router
m.route(document.getElementById('app')!, '/', routes)
