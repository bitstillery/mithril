import {readFile} from 'fs/promises'
import {join} from 'path'

import m from '../../server'

// Import HTML template for Bun's fullstack dev server
// Bun automatically processes <script> tags in HTML and bundles TypeScript/JSX files
import htmlTemplate from './public/index.html'
import {routes} from './routes'

const PORT = 3000

// Helper function to create SSR route handler
function createSSRRoute(pathname: string) {
	return async function(_req: Request) {
		try {
			// Use isomorphic router to resolve route and render SSR content
			const appHtml = await m.route.resolve(pathname, routes, m.renderToString)

			// Get Bun's processed HTML by fetching from the base route
			// This gets us Bun's processed HTML with HMR support
			const baseUrl = `http://localhost:${PORT}/`
			let html: string
			
			try {
				const processedResponse = await fetch(baseUrl)
				if (processedResponse.ok) {
					html = await processedResponse.text()
				} else {
					// Fallback: read the HTML template file
					const templatePath = join(import.meta.dir, 'public', 'index.html')
					html = await readFile(templatePath, 'utf-8')
				}
			} catch {
				// Fallback: read the HTML template file
				const templatePath = join(import.meta.dir, 'public', 'index.html')
				html = await readFile(templatePath, 'utf-8')
			}

			// Replace the empty app div with server-rendered HTML
			html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)

			// Return full HTML document with SSR content
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
	}
}

const server = Bun.serve({
	port: PORT,
	// Enable Bun's built-in development mode
	// Disable HMR to avoid errors - we're fine with page reloads
	development: {
		hmr: false, // Disable Hot Module Replacement (prevents errors)
		console: false, // Don't echo console logs (optional)
	},
	routes: {
		// Use Bun's fullstack dev server for HTML processing
		// Bun will process the HTML and add HMR support automatically
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'/': htmlTemplate,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'/async': createSSRRoute('/async'),
	},
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname

		// Handle Bun's internal assets (HMR, etc.)
		if (pathname.startsWith('/_bun/')) {
			return undefined // Let Bun handle it
		}

		// Root route is handled by Bun's routes (htmlTemplate)
		if (pathname === '/') {
			return undefined // Let Bun's routes handle it
		}

		// Handle other routes with SSR (fallback)
		try {
			// Use isomorphic router to resolve route and render SSR content
			const appHtml = await m.route.resolve(pathname, routes, m.renderToString)

			// Get Bun's processed HTML by fetching from the base route
			const baseUrl = `http://localhost:${PORT}/`
			let html: string
			
			try {
				const processedResponse = await fetch(baseUrl)
				if (processedResponse.ok) {
					html = await processedResponse.text()
				} else {
					// Fallback: read the HTML template file
					const templatePath = join(import.meta.dir, 'public', 'index.html')
					html = await readFile(templatePath, 'utf-8')
				}
			} catch {
				// Fallback: read the HTML template file
				const templatePath = join(import.meta.dir, 'public', 'index.html')
				html = await readFile(templatePath, 'utf-8')
			}

			// Replace the empty app div with server-rendered HTML
			html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)

			// Return full HTML document with SSR content
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
