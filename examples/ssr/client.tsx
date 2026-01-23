/// <reference path="./jsx.d.ts" />

import m from '../../index'
import {deserializeAllStates} from '../../render/ssrState'

import {routes} from './routes'

// Set prefix to empty string for pathname-based routing (not hash-based)
m.route.prefix = ''

// Read and restore SSR state before mounting
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
