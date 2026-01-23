import {join} from 'path'

import {
	createSSRResponse,
	createSessionUpdateHandler,
	getBunProcessedTemplate,
	createBunSSRConfig,
	shouldHandleBunAssets,
	MemorySessionStore,
	extractSessionId,
} from '../../server'

import htmlTemplate from './public/index.html'
import {routes} from './routes'
import {initStore} from './store'

const PORT = 3000

// Create in-memory session store instance
const sessionStore = new MemorySessionStore()

// Clean up expired sessions every 5 minutes
if (typeof setInterval !== 'undefined') {
	setInterval(() => {
		sessionStore.cleanup()
	}, 1000 * 60 * 5)
}

// Helper function to get session data from request
// Returns both session data and sessionId
function getSessionData(req: Request): {sessionData: Partial<any>, sessionId: string} {
	// Extract session ID from cookie or create new session
	let sessionId = extractSessionId(req)
	
	// For demo purposes, simulate user authentication
	// In production, decode JWT token to get user ID
	const userId = sessionId ? sessionStore.getSession(sessionId)?.userId : null
	
	// Create or retrieve session
	if (!sessionId || !sessionStore.getSession(sessionId)) {
		sessionId = sessionStore.createSession(userId || null)
	}
	
	const session = sessionStore.getSession(sessionId)
	
	// Read session_data from sessionStore if it exists
	// sessionData structure: { user: {...}, serverData: '...', lastServerUpdate: ... }
	const sessionData = session?.data.session_data || {}
	
	// Return session data for Store.load()
	return {
		sessionId,
		sessionData: {
			session: {
				user: {
					id: session?.userId || sessionData.user?.id || null,
					name: sessionData.user?.name || (session?.userId ? `User ${session.userId}` : ''),
					role: sessionData.user?.role || (session?.userId ? 'user' : ''),
				},
				serverData: sessionData.serverData || session?.data.serverData || `Server data for session ${sessionId}`,
				lastServerUpdate: sessionData.lastServerUpdate || Date.now(),
			},
		},
	}
}

// Helper function to get Bun's processed HTML template
async function getProcessedTemplate(): Promise<string> {
	const templatePath = join(import.meta.dir, 'public', 'index.html')
	return await getBunProcessedTemplate(PORT, templatePath)
}

// Create session update handler using abstracted utility
const handleSessionUpdate = createSessionUpdateHandler(sessionStore, extractSessionId)

// Create Bun server configuration with template route for HMR
const bunConfig = createBunSSRConfig({
	port: PORT,
	templatePath: join(import.meta.dir, 'public', 'index.html'),
	templateRoute: '/__template__',
	htmlTemplate: htmlTemplate,
})

const server = Bun.serve({
	...bunConfig,
	async fetch(req) {
		const url = new URL(req.url)
		const pathname = url.pathname

		// Handle Bun's internal assets (HMR, etc.)
		if (shouldHandleBunAssets(pathname)) {
			return undefined // Let Bun handle it
		}

		// Handle API endpoints
		if (pathname === '/api/session' && req.method === 'POST') {
			return await handleSessionUpdate(req)
		}

		// Handle SSR routes (including root)
		// Check if this is a route we want to SSR
		// This must come BEFORE returning undefined, so we intercept SSR routes
		if (pathname === '/' || pathname === '/async' || pathname === '/store' || routes[pathname]) {
			return await createSSRResponse(pathname, req, {
				routes,
				initStore,
				getSessionData,
				getHtmlTemplate: getProcessedTemplate,
			})
		}

		// For other routes (like client.tsx, __template__), return undefined to let Bun handle them
		return undefined
	},
})

console.log(`Server running at http://localhost:${server.port}`)
