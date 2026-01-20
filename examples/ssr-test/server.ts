import m from '@bitstillery/mithril/server'

import {App} from './components/App'
import {Document} from './index'

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname

		// Handle static assets (if any)
		if (pathname.startsWith('/static/')) {
			// Serve static files
			return new Response('Not found', {status: 404})
		}

		try {
			// Render App component with current pathname
			const appHtml = await (m as any).renderToString(m(App, {initialPath: pathname}))

			// Render full HTML document
			const html = await (m as any).renderToString(
				m(Document, {
					title: 'Mithril SSR Test',
					appHtml,
				})
			)

			// Return full HTML document
			return new Response(
				`<!DOCTYPE html>${html}`,
				{
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
					},
				},
			)
		} catch (error) {
			console.error('SSR Error:', error)
			return new Response('Internal Server Error', {status: 500})
		}
	},
})

console.log(`Server running at http://localhost:${server.port}`)
