import {readFile} from 'fs/promises'

import m from '../server'
import {runWithContextAsync} from '../ssrContext'

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
export async function createSSRResponse(
	pathname: string,
	req: Request,
	options: SSROptions,
): Promise<Response> {
	const context = options.createRequestContext(req)

	return runWithContextAsync(context, async() => {
		try {
			await options.initRequestContext(context)

			globalThis.__SSR_URL__ = req.url

			logger.debug('Resolving route', {
				pathname,
				routesAvailable: Object.keys(options.routes),
				routeExists: !!options.routes[pathname],
			})

			const result = await m.route.resolve(pathname, options.routes, m.renderToString)

			const appHtml = typeof result === 'string' ? result : result.html
			const serializedState = typeof result === 'string' ? {} : result.state

			logger.debug('Route resolution result', {
				pathname,
				resultType: typeof result === 'string' ? 'string' : 'object',
				htmlLength: appHtml?.length || 0,
				htmlPreview: appHtml?.substring(0, 200) || 'empty',
				stateSize: JSON.stringify(serializedState).length,
			})

			if (!appHtml || appHtml.trim() === '' || appHtml.trim() === '<div></div>') {
				logger.warn('Empty/minimal HTML rendered', {
					pathname,
					method: req.method,
					sessionId: context.sessionId,
					htmlPreview: appHtml?.substring(0, 100) || 'null/undefined',
				})
			} else {
				logger.info(`Rendered ${appHtml.length} characters`, {
					pathname,
					method: req.method,
					sessionId: context.sessionId,
					htmlSize: appHtml.length,
					htmlPreview: appHtml.substring(0, 300),
				})
			}

			let html = await options.getHtmlTemplate()

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
				const elementName = tagMatch ? tagMatch[1] : (closingTagName || 'div')
				return `${openingTag}${appHtml}</${elementName}>`
			})

			const stateScriptId = options.stateScriptId || '__SSR_STATE__'
			const stateScript = `<script id="${stateScriptId}" type="application/json">${JSON.stringify(serializedState)}</script>`
			html = html.replace('</head>', `${stateScript}</head>`)

			const sessionId = context.sessionId ?? ''
			logger.debug('SSR response created', {
				pathname,
				method: req.method,
				sessionId,
				htmlSize: html.length,
				stateSize: JSON.stringify(serializedState).length,
			})
			
			return new Response(html, {
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'text/html; charset=utf-8',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax`,
				},
			})
		} catch(error) {
			logger.error('SSR request failed', error, {
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
	return async(req: Request): Promise<Response> => {
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
			
			logger.debug('Session updated', {
				method: req.method,
				sessionId,
			})
			
			return new Response(JSON.stringify({success: true}), {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				headers: {'Content-Type': 'application/json'},
			})
		} catch(error) {
			logger.error('Failed to update session', error, {
				method: req.method,
				sessionId,
			})
			return new Response('Internal Server Error', {status: 500})
		}
	}
}
