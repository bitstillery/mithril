import {join} from 'path'
import {readFile} from 'fs/promises'
import {
	createSSRResponse,
	shouldHandleBunAssets,
	MemorySessionStore,
	extractSessionId,
} from '../../server'

// HTML entry for Bun dev server - Bun bundles client.tsx with HMR
import templateHtml from './index.html'
import {getRoutes} from './routes'
import {loadMarkdownFromDocs} from './markdown'
import {getNavGuides, getNavMethods, getNavGuidesStructure, getNavMethodsStructure} from './nav'
import type {SSRAccessContext} from '../../ssrContext'

const PORT = 3000
const isDev = process.env.NODE_ENV !== 'production'

// Create in-memory session store instance
const sessionStore = new MemorySessionStore()

// Helper function to get session data from request
function getSessionData(req: Request): {sessionData: Partial<any>; sessionId: string} {
	// Extract session ID from cookie or create new session
	let sessionId = extractSessionId(req)
	
	// Create or retrieve session
	if (!sessionId || !sessionStore.getSession(sessionId)) {
		sessionId = sessionStore.createSession(null)
	}
	
	const session = sessionStore.getSession(sessionId)
	const sessionData = session?.data.session_data || {}
	
	return {
		sessionId,
		sessionData: {},
	}
}

let htmlTemplateCache: string | null = null

async function getProcessedTemplate(): Promise<string> {
	// In dev, don't cache - Bun rebundles on each request for HMR
	if (htmlTemplateCache && !isDev) {
		return htmlTemplateCache
	}

	const templatePath = join(import.meta.dir, 'public', 'index.html')
	try {
		// Try to get processed template from Bun's route (for HMR)
		const templateUrl = `http://localhost:${PORT}/__template__`
		const response = await fetch(templateUrl)
		if (response.ok) {
			htmlTemplateCache = await response.text()
			return htmlTemplateCache
		}
	} catch {
		// Fallback: read template file directly
	}
	
	htmlTemplateCache = await readFile(templatePath, 'utf-8')
	return htmlTemplateCache
}

// Initialize routes
const routes = getRoutes()

// Serve static assets via routes
const staticAssetsDir = join(import.meta.dir, 'public')

const server = Bun.serve({
	port: PORT,
	routes: {
		// Bun dev: HTML import bundles client.tsx with HMR. SSR fetches this for template.
		'/__template__': templateHtml,
		'/style.css': Bun.file(join(staticAssetsDir, 'style.css')),
		'/logo.svg': Bun.file(join(staticAssetsDir, 'logo.svg')),
		'/app.js': Bun.file(join(staticAssetsDir, 'app.js')),
	},
	development: isDev,
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname

		// API: serve doc content for client-side loading (when SSR data isn't available)
		const apiDocsMatch = pathname.match(/^\/api\/docs\/([^/]+)$/)
		if (apiDocsMatch) {
			const docName = apiDocsMatch[1]
			try {
				const [page, navGuides, navMethods, navGuidesStructure, navMethodsStructure] = await Promise.all([
					loadMarkdownFromDocs(docName),
					getNavGuides(),
					getNavMethods(),
					getNavGuidesStructure(),
					getNavMethodsStructure(),
				])
				if (!page) {
					return new Response(JSON.stringify({error: 'Page not found'}), {
						status: 404,
						headers: {'Content-Type': 'application/json'},
					})
				}
				return new Response(JSON.stringify({page, navGuides, navMethods, navGuidesStructure, navMethodsStructure}), {
					headers: {'Content-Type': 'application/json'},
				})
			} catch (error) {
				console.error('[Server] API docs error:', error)
				return new Response(JSON.stringify({error: 'Failed to load doc'}), {
					status: 500,
					headers: {'Content-Type': 'application/json'},
				})
			}
		}

		// Handle Bun's internal assets (HMR, etc.)
		if (shouldHandleBunAssets(pathname)) {
			return undefined // Let Bun handle it
		}

		// Serve static files from public/ (chunk-*.js, chunk-*.css, etc from Bun HTML build)
		if (pathname.startsWith('/') && !pathname.includes('..') && pathname.length > 1) {
			const staticPath = join(staticAssetsDir, pathname.slice(1))
			try {
				const file = Bun.file(staticPath)
				const stat = await file.stat()
				if (stat && stat.size > 0) {
					return new Response(file, {
						headers: {
							'Content-Type': pathname.endsWith('.js') ? 'application/javascript' :
								pathname.endsWith('.css') ? 'text/css' : 'application/octet-stream',
						},
					})
				}
			} catch {
				// File doesn't exist, continue
			}
		}

		// Static assets (style.css, logo.svg, app.js) are handled by routes
		const staticAssets = ['/style.css', '/logo.svg', '/app.js']
		if (staticAssets.includes(pathname)) {
			return undefined // Let Bun handle via routes
		}

		// Handle SSR routes
		if (pathname === '/' || routes[pathname]) {
			try {
				const response = await createSSRResponse(pathname, req, {
					routes,
					createRequestContext: (req: Request): SSRAccessContext => {
						const {sessionId, sessionData} = getSessionData(req)
						return {
							sessionId,
							sessionData,
							stateRegistry: new Map(),
							store: null,
						}
					},
					initRequestContext: async () => {
						// No store initialization needed for docs site
					},
					getHtmlTemplate: getProcessedTemplate,
				})
				return response
			} catch (error) {
				console.error('[Server] SSR error:', error)
				if (error instanceof Error) {
					console.error('[Server] Error stack:', error.stack)
				}
				return new Response('Internal Server Error', {status: 500})
			}
		}

		// For other routes, return undefined to let Bun handle them
		return undefined
	},
})

console.log(`Server running at http://localhost:${server.port}`)
