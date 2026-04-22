import {readFile} from 'fs/promises'

import m from '../server'
import {runWithContextAsync} from '../ssrContext'

import {formatSsrPageSummaryLine, utf8ByteLength} from './logger'
import {extractSessionId} from './session'
import {logger} from './ssrLogger'

import type {SessionStore} from './session'
import type {SSRAccessContext} from '../ssrContext'

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    var __SSR_MODE__: boolean | undefined
    // eslint-disable-next-line @typescript-eslint/naming-convention
    var __SSR_URL__: string | undefined
}

globalThis.__SSR_MODE__ = true

function ssrMetricsBreakdownEnabled(): boolean {
    return process.env.MITHRIL_SSR_METRICS === '1'
}

export interface SSROptions {
    routes: Record<string, any>
    /** Create per-request context (store, stateRegistry, sessionId, sessionData). */
    createRequestContext: (req: Request) => SSRAccessContext
    /** Load store and register state for this request; runs inside request context. */
    initRequestContext: (context: SSRAccessContext) => void | Promise<void>
    getHtmlTemplate: () => Promise<string>
    appSelector?: string // Default: '#app'
    stateScriptId?: string // Default: '__SSR_STATE__'
}

export interface BunSSRConfig {
    port: number
    templatePath: string
    templateRoute?: string // Default: '/__template__'
    htmlTemplate: any // Bun route handler
}

/**
 * Helper function to get Bun's processed HTML template with HMR scripts
 * This ensures HMR scripts and proper asset serving work in development
 */
export async function getBunProcessedTemplate(
    port: number,
    templatePath: string,
    templateRoute: string = '/__template__',
): Promise<string> {
    // Fetch from Bun's route handler to get processed template with HMR scripts
    // Use a special route that Bun processes but we don't use for SSR
    const templateUrl = `http://localhost:${port}${templateRoute}`
    try {
        const response = await fetch(templateUrl)
        if (response.ok) {
            return await response.text()
        }
    } catch {
        // Fallback: read template file directly (won't have HMR, but will work)
    }

    return await readFile(templatePath, 'utf-8')
}

/**
 * Helper to check if a pathname is a Bun internal asset (should be handled by Bun)
 */
export function shouldHandleBunAssets(pathname: string): boolean {
    return pathname.startsWith('/_bun/')
}

/**
 * Create Bun.serve() configuration with template route for HMR support
 */
export function createBunSSRConfig(config: BunSSRConfig) {
    return {
        port: config.port,
        routes: {
            // Let Bun process the HTML template for HMR and asset serving
            // Use a special route that we don't use for SSR, so fetch handler can intercept SSR routes
            [config.templateRoute || '/__template__']: config.htmlTemplate,
        },
    }
}

/**
 * Create SSR response with serialized state and session cookie.
 * Runs the whole request inside runWithContextAsync so getSSRContext() returns
 * this request's context; initRequestContext then loads the store and registers state.
 */
export async function createSSRResponse(pathname: string, req: Request, options: SSROptions): Promise<Response> {
    const context = options.createRequestContext(req)

    return runWithContextAsync(context, async () => {
        try {
            const t0 = performance.now()
            await options.initRequestContext(context)
            const t1 = performance.now()

            globalThis.__SSR_URL__ = req.url

            const routeCount = Object.keys(options.routes).length
            logger.debug('resolving route', {pathname, routeCount, routeExists: !!options.routes[pathname]})

            const result = await m.route.resolve(pathname, options.routes, m.renderToString)
            const t2 = performance.now()

            const appHtml = typeof result === 'string' ? result : result.html
            const baseSerializedState = typeof result === 'string' ? {} : result.state
            const meta = context.ssrStateMeta
            const serializedState =
                meta && Object.keys(meta).length > 0 ? {...baseSerializedState, __meta: meta} : baseSerializedState
            const htmlLength = appHtml?.length || 0

            logger.debug('route resolved', {pathname, htmlLength, resultType: typeof result === 'string' ? 'string' : 'object'})

            const emptyHtml = !appHtml || appHtml.trim() === '' || appHtml.trim() === '<div></div>'
            if (emptyHtml) {
                logger.warn('empty html rendered', {pathname})
            }

            let html = await options.getHtmlTemplate()
            const t3 = performance.now()

            const appSelector = options.appSelector || '#app'

            let openingTagPattern: string
            if (appSelector.startsWith('#')) {
                const id = appSelector.slice(1)
                openingTagPattern = `<([a-zA-Z][a-zA-Z0-9]*)\\s+id="${id}"([^>]*)>`
            } else if (appSelector.startsWith('.')) {
                const className = appSelector.slice(1)
                openingTagPattern = `<([a-zA-Z][a-zA-Z0-9]*)([^>]*\\s+class="[^"]*\\b${className}\\b[^"]*"[^>]*)>`
            } else {
                openingTagPattern = `<${appSelector}([^>]*)>`
            }

            const fullPattern = new RegExp(`(${openingTagPattern})\\s*</([a-zA-Z][a-zA-Z0-9]*)>`, 'i')
            html = html.replace(fullPattern, (_match, openingTag, closingTagName) => {
                const tagMatch = openingTag.match(/^<([a-zA-Z][a-zA-Z0-9]*)/)
                const elementName = tagMatch ? tagMatch[1] : closingTagName || 'div'
                return `${openingTag}${appHtml}</${elementName}>`
            })

            const stateScriptId = options.stateScriptId || '__SSR_STATE__'
            const stateJson = JSON.stringify(serializedState)
            const stateScript = `<script id="${stateScriptId}" type="application/json">${stateJson}</script>`
            html = html.replace('</head>', `${stateScript}</head>`)

            const t4 = performance.now()

            if (!emptyHtml) {
                const msTotal = t4 - t0
                const bytesHtml = utf8ByteLength(html)
                const bytesState = utf8ByteLength(stateJson)
                logger.infoRaw(
                    formatSsrPageSummaryLine({
                        bytesHtml,
                        bytesState,
                        method: req.method,
                        msTotal,
                        pathname,
                    }),
                )
                if (ssrMetricsBreakdownEnabled()) {
                    logger.debug('ssr phases', {
                        ms_init_context: Math.round((t1 - t0) * 100) / 100,
                        ms_route_render: Math.round((t2 - t1) * 100) / 100,
                        ms_template_fetch: Math.round((t3 - t2) * 100) / 100,
                        ms_template_merge: Math.round((t4 - t3) * 100) / 100,
                        pathname,
                    })
                }
            }

            const sessionId = context.sessionId ?? ''

            return new Response(html, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'text/html; charset=utf-8',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax`,
                },
            })
        } catch (error) {
            logger.error('ssr request failed', error, {
                pathname,
                method: req.method,
                sessionId: context.sessionId,
            })
            return new Response('Internal Server Error', {status: 500})
        }
    })
}

/**
 * Create session update API handler factory
 * Returns a handler function for POST /api/session requests
 */
export function createSessionUpdateHandler(
    sessionStore: SessionStore,
    extractSessionIdFn: (req: Request) => string | null = extractSessionId,
): (req: Request) => Promise<Response> {
    return async (req: Request): Promise<Response> => {
        const sessionId = extractSessionIdFn(req)

        if (!sessionId) {
            return new Response('No session ID', {status: 401})
        }

        try {
            const body = await req.json()
            // Blueprint extracts { session: {...} }, so body.session contains the actual session data
            // body structure: { session: { user: {...}, serverData: '...', lastServerUpdate: ... } }
            const sessionData = body.session_data || body.session || {} // Support both session_data and session for compatibility

            // Update session store with new session state
            // Store under session_data key in sessionStore.data
            // sessionData structure: { user: {...}, serverData: '...', lastServerUpdate: ... }
            sessionStore.updateSession(sessionId, {session_data: sessionData})

            logger.debug('session updated', {
                method: req.method,
                sessionId,
            })

            return new Response(JSON.stringify({success: true}), {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: {'Content-Type': 'application/json'},
            })
        } catch (error) {
            logger.error('failed to update session', error, {
                method: req.method,
                sessionId,
            })
            return new Response('Internal Server Error', {status: 500})
        }
    }
}
