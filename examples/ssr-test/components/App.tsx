/// <reference path="../jsx.d.ts" />

import m from '@bitstillery/mithril'

import {routes} from '../routes'

interface AppAttrs {
	initialPath?: string
}

export const App = {
	oninit: (vnode: any) => {
		// Listen for popstate events (back/forward button)
		if (typeof window !== 'undefined') {
			window.addEventListener('popstate', () => {
				m.redraw()
			})
		}
	},

	view: (vnode: any) => {
		const attrs = (vnode.attrs || {}) as AppAttrs

		// Determine current route
		let currentPath = '/'

		if (typeof window !== 'undefined') {
			// Client-side: read from window.location
			currentPath = window.location.pathname
		} else {
			// Server-side: use initialPath from attrs
			currentPath = attrs?.initialPath || '/'
		}

		const currentRoute = routes[currentPath] || routes['/']
		const CurrentComponent = currentRoute.component

		const navigate = (path: string) => {
			if (typeof window !== 'undefined') {
				window.history.pushState(null, '', path)
				// Trigger a redraw to update the view
				m.redraw()
			}
		}

		return <div class="container">
			<h1>Mithril SSR Test</h1>
			<nav>
				<a
					href="/"
					onclick={(e: MouseEvent) => {
						if (typeof window !== 'undefined') {
							e.preventDefault()
							navigate('/')
						}
					}}
					class={currentPath === '/' ? 'active' : ''}
				>
					Home
				</a>
				<a
					href="/async"
					onclick={(e: MouseEvent) => {
						if (typeof window !== 'undefined') {
							e.preventDefault()
							navigate('/async')
						}
					}}
					class={currentPath === '/async' ? 'active' : ''}
				>
					Async Data
				</a>
			</nav>
			<main>
				<CurrentComponent />
			</main>
		</div>		
	},
}
