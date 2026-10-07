import {join} from 'path'

import {
    createSSRResponse,
    createSessionUpdateHandler,
    getBunProcessedTemplate,
    createBunSSRConfig,
    MemorySessionStore,
    extractSessionId,
} from '../../src/server'
import {copyGlobalStatesToContext} from '../../src/state/state'

import htmlTemplate from './public/index.html'
import {routes} from './routes'
import {initStore} from './store'
import type {AppState} from './store'

const PORT = 3000

// Create in-memory session store instance
const sessionStore = new MemorySessionStore()

// Clean up expired sessions every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(
        () => {
            sessionStore.cleanup()
        },
        1000 * 60 * 5,
    )
}

/** What the session update handler stores under `session_data`: the client's session tier. */
interface StoredSession {
    user?: {id?: string | null; name?: string; role?: string}
    serverData?: string
    lastServerUpdate?: number
}

function resolveSessionId(req: Request): string {
    const sessionId = extractSessionId(req)
    return sessionId && sessionStore.getSession(sessionId) ? sessionId : sessionStore.createSession(null)
}

// For demo purposes the user is simulated; in production, decode a JWT to get the user ID.
function getSessionData(sessionId: string | undefined): Partial<AppState> {
    const session = sessionId ? sessionStore.getSession(sessionId) : null
    const sessionData = (session?.data.session_data ?? {}) as StoredSession

    return {
        session: {
            user: {
                id: session?.userId || sessionData.user?.id || null,
                name: sessionData.user?.name || (session?.userId ? `User ${session.userId}` : ''),
                role: sessionData.user?.role || (session?.userId ? 'user' : ''),
            },
            serverData: sessionData.serverData || '',
            lastServerUpdate: sessionData.lastServerUpdate || Date.now(),
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
                createRequestContext: (req) => ({sessionId: resolveSessionId(req), stateRegistry: new Map()}),
                initRequestContext: (context) => {
                    // Module-level states register globally; copying them in puts them in this request's SSR state.
                    copyGlobalStatesToContext(context)
                    initStore(getSessionData(context.sessionId))
                },
                getHtmlTemplate: getProcessedTemplate,
            })
        }

        // Bun serves the template route and its bundled assets before fetch is called.
        return new Response('Not Found', {status: 404})
    },
})

console.log(`Server running at http://localhost:${server.port}`)
