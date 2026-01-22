import {readFile} from 'fs/promises'
import {join} from 'path'

import m from '../../server'

import {App} from './components/app'	

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname

		// Handle static assets
		if (pathname === '/app.js' || pathname === '/index.html') {
			const file = Bun.file(`public${pathname}`)
			if (await file.exists()) {
				return new Response(file, {
					headers: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						'Content-Type': pathname.endsWith('.js') ? 'application/javascript' : 'text/html',
					},
				})
			}
		}

		try {
			// Render App component with current pathname
			const appHtml = await (m as any).renderToString(m(App, {initialPath: pathname}))

			// Read the static HTML template
			const templatePath = join(import.meta.dir, 'public', 'index.html')
			let html = await readFile(templatePath, 'utf-8')

			// Replace the empty app div with server-rendered HTML
			html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)

			// Return full HTML document
			return new Response(html, {
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'text/html; charset=utf-8',
				},
			})
		} catch(error) {
			console.error('SSR Error:', error)
			return new Response('Internal Server Error', {status: 500})
		}
	},
})

console.log(`Server running at http://localhost:${server.port}`)
