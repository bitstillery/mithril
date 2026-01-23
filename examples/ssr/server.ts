import {readFile} from 'fs/promises'
import {join} from 'path'

import m from '../../server'

import htmlTemplate from './public/index.html'
import {routes} from './routes'
import {initStore} from './store'
import {sessionStore} from './sessionStore'
import {clearStateRegistry} from '../../state'

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

// Helper function to extract session ID from request
function extractSessionId(req: Request): string | null {
	const cookies = req.headers.get('cookie') || ''
	const sessionIdMatch = cookies.match(/sessionId=([^;]+)/)
	return sessionIdMatch ? sessionIdMatch[1] : null
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

// Handle session state update API endpoint
async function handleSessionUpdate(req: Request): Promise<Response> {
	const sessionId = extractSessionId(req)
	
	if (!sessionId) {
		return new Response('No session ID', { status: 401 })
	}
	
	try {
		const body = await req.json()
		// Blueprint extracts { session: {...} }, so body.session contains the actual session data
		// body structure: { session: { user: {...}, serverData: '...', lastServerUpdate: ... } }
		const sessionData = body.session_data || body.session || {}  // Support both session_data and session for compatibility
		
		// Update session store with new session state
		// Store under session_data key in sessionStore.data
		// sessionData structure: { user: {...}, serverData: '...', lastServerUpdate: ... }
		sessionStore.updateSession(sessionId, { session_data: sessionData })
		
		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' }
		})
	} catch (error) {
		console.error('Error updating session:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}

// Helper function to create SSR response
async function createSSRResponse(pathname: string, req: Request): Promise<Response> {
	try {
		// Clear state registry before each SSR request to avoid collisions
		clearStateRegistry()
		
		// Initialize store with session data before SSR
		// This ensures session state is available during server-side rendering
		const {sessionData, sessionId: currentSessionId} = getSessionData(req)
		initStore(sessionData)
		
		// Use isomorphic router to resolve route and render SSR content
		const result = await m.route.resolve(pathname, routes, m.renderToString)
		
		// renderToString now returns {html, state}
		const appHtml = typeof result === 'string' ? result : result.html
		const serializedState = typeof result === 'string' ? {} : result.state

		// Get Bun's processed HTML template (with HMR scripts)
		let html = await getProcessedTemplate()

		// Replace the empty app div with server-rendered HTML
		html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)

		// Inject serialized state into HTML
		const stateScript = `<script id="__SSR_STATE__" type="application/json">${JSON.stringify(serializedState)}</script>`
		html = html.replace('</head>', `${stateScript}</head>`)

		// Set session cookie using the sessionId from getSessionData()
		// This ensures the cookie matches the session that was used for SSR

		// Return full HTML document with SSR content
		return new Response(html, {
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'Content-Type': 'text/html; charset=utf-8',
				'Set-Cookie': `sessionId=${currentSessionId}; Path=/; HttpOnly; SameSite=Lax`,
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

		// Handle API endpoints
		if (pathname === '/api/session' && req.method === 'POST') {
			return await handleSessionUpdate(req)
		}

		// Handle SSR routes (including root)
		// Check if this is a route we want to SSR
		// This must come BEFORE returning undefined, so we intercept SSR routes
		if (pathname === '/' || pathname === '/async' || pathname === '/store' || routes[pathname]) {
			return await createSSRResponse(pathname, req)
		}

		// For other routes (like client.tsx, __template__), return undefined to let Bun handle them
		return undefined
	},
})

console.log(`Server running at http://localhost:${server.port}`)
