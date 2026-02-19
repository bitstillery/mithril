import {join} from 'path'

import {serve} from 'bun'
import {
    createSSRResponse,
    createBunSSRConfig,
    getBunProcessedTemplate,
    shouldHandleBunAssets,
    MemorySessionStore,
    extractSessionId,
} from '../../server'

import sourceTemplate from './index.html'
import builtTemplate from './public/index.html'
import {getRoutes} from './routes'
import {loadMarkdownFromDocs} from './markdown'
import {getNavGuides, getNavMethods, getNavGuidesStructure, getNavMethodsStructure} from './nav'
import type {SSRAccessContext} from '../../ssrContext'

// In dev: use source HTML so Bun can serve client.tsx with HMR. In prod: use built output.
const isDev = process.env.NODE_ENV !== 'production'
const htmlTemplate = isDev ? sourceTemplate : builtTemplate

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

async function getProcessedTemplate(): Promise<string> {
    const templatePath = isDev ? join(import.meta.dir, 'index.html') : join(import.meta.dir, 'public', 'index.html')
    return getBunProcessedTemplate(PORT, templatePath)
}

// Initialize routes
const routes = getRoutes()

const staticAssetsDir = join(import.meta.dir, 'public')
const bunConfig = createBunSSRConfig({
    port: PORT,
    templatePath: isDev ? join(import.meta.dir, 'index.html') : join(import.meta.dir, 'public', 'index.html'),
    templateRoute: '/__template__',
    htmlTemplate,
})

// Match bun_example: "/*": index as catch-all so Bun serves client.tsx with HMR
// @ts-expect-error Bun types overload requires websocket when development is set
const server = serve({
    ...bunConfig,
    routes: {
        ...bunConfig.routes,
        '/style.css': Bun.file(join(import.meta.dir, 'style.css')),
        '/logo.svg': Bun.file(join(staticAssetsDir, 'logo.svg')),
        '/app.js': Bun.file(join(staticAssetsDir, 'app.js')),
    },
    ...(isDev && {development: {hmr: true, console: true}}),
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
            return undefined // Let Bun handle internally
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
                            'Content-Type': pathname.endsWith('.js')
                                ? 'application/javascript'
                                : pathname.endsWith('.css')
                                  ? 'text/css'
                                  : 'application/octet-stream',
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

        // Unmatched routes
        return new Response('Not Found', {status: 404})
    },
})

console.log(`Server running at http://localhost:${server.port}`)
