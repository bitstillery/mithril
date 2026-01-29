import {join} from 'path'
import {readFile} from 'fs/promises'

import {
	createSSRResponse,
	getBunProcessedTemplate,
	shouldHandleBunAssets,
	MemorySessionStore,
	extractSessionId,
} from '../../server'

// Don't import HTML as HTMLBundle - Bun tries to resolve assets as modules
// Instead, we'll read it as a string and process it ourselves
import {getRoutes} from './routes'
import type {SSRAccessContext} from '../../ssrContext'

const PORT = 3000

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

// Read HTML template as string (not as HTMLBundle to avoid module resolution issues)
let htmlTemplateCache: string | null = null

async function getProcessedTemplate(): Promise<string> {
	if (htmlTemplateCache) {
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
		// Serve static assets
		'/style.css': Bun.file(join(staticAssetsDir, 'style.css')),
		'/logo.svg': Bun.file(join(staticAssetsDir, 'logo.svg')),
		'/favicon.png': Bun.file(join(staticAssetsDir, 'favicon.png')),
		'/app.js': Bun.file(join(staticAssetsDir, 'app.js')),
	},
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname
		
		// Handle template route for HMR - serve HTML without Bun processing it as HTMLBundle
		// This avoids Bun trying to resolve assets as modules
		if (pathname === '/__template__') {
			const templateFile = Bun.file(join(staticAssetsDir, 'index.html'))
			return new Response(templateFile, {
				headers: {
					'Content-Type': 'text/html',
				},
			})
		}

		// Handle Bun's internal assets (HMR, etc.)
		if (shouldHandleBunAssets(pathname)) {
			return undefined // Let Bun handle it
		}

		// Static assets are handled by routes, so they shouldn't reach here
		// But if they do, let Bun handle them
		const staticAssets = ['/style.css', '/logo.svg', '/favicon.png', '/app.js']
		if (staticAssets.includes(pathname)) {
			return undefined // Let Bun handle via routes
		}

		// Handle SSR routes
		if (pathname === '/' || routes[pathname]) {
			try {
				console.log('[Server] Handling SSR route:', pathname)
				console.log('[Server] Route exists:', !!routes[pathname])
				const response = await createSSRResponse(pathname, req, {
					routes,
					createRequestContext: (req: Request): SSRAccessContext => {
						const {sessionId, sessionData} = getSessionData(req)
						console.log('[Server] Creating request context, sessionId:', sessionId)
						return {
							sessionId,
							sessionData,
							stateRegistry: new Map(),
							store: null,
						}
					},
					initRequestContext: async () => {
						console.log('[Server] Initializing request context')
						// No store initialization needed for docs site
					},
					getHtmlTemplate: getProcessedTemplate,
				})
				console.log('[Server] SSR response created, status:', response.status)
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
