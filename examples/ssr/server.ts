import {readFile} from 'fs/promises'
import {join} from 'path'

import m from '../../server'

import htmlTemplate from './public/index.html'
import {routes} from './routes'

const PORT = 3000

// Helper function to get Bun's processed HTML template
// This ensures HMR scripts and proper asset serving work
async function getProcessedTemplate(): Promise<string> {
	// Fetch from Bun's route handler to get processed template with HMR scripts
	// Use a special route that Bun processes but we don't use for SSR
	const templateUrl = `http://localhost:${PORT}/__template__`
	try {
		const response = await fetch(templateUrl)
		if (response.ok) {
			return await response.text()
		}
	} catch {
		// Fallback: read template file directly (won't have HMR, but will work)
	}
	
	const templatePath = join(import.meta.dir, 'public', 'index.html')
	return await readFile(templatePath, 'utf-8')
}

// Helper function to create SSR response
async function createSSRResponse(pathname: string): Promise<Response> {
	try {
		// Use isomorphic router to resolve route and render SSR content
		const appHtml = await m.route.resolve(pathname, routes, m.renderToString)

		// Get Bun's processed HTML template (with HMR scripts)
		let html = await getProcessedTemplate()

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

const server = Bun.serve({
	port: PORT,
	routes: {
		// Let Bun process the HTML template for HMR and asset serving
		// Use a special route that we don't use for SSR, so fetch handler can intercept SSR routes
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'/__template__': htmlTemplate,
	},
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname

		// Handle Bun's internal assets (HMR, etc.)
		if (pathname.startsWith('/_bun/')) {
			return undefined // Let Bun handle it
		}

		// Handle SSR routes (including root)
		// Check if this is a route we want to SSR
		// This must come BEFORE returning undefined, so we intercept SSR routes
		if (pathname === '/' || pathname === '/async' || routes[pathname]) {
			return await createSSRResponse(pathname)
		}

		// For other routes (like client.tsx, __template__), return undefined to let Bun handle them
		return undefined
	},
})

console.log(`Server running at http://localhost:${server.port}`)
