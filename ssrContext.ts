/**
 * Request-scoped SSR context using AsyncLocalStorage (Node/Bun).
 * Each SSR request runs inside runWithContext(); code that needs the current
 * request's store or state registry calls getSSRContext() and gets that
 * request's context. No globals, safe under concurrent requests.
 * In the browser, getSSRContext() returns undefined and runWithContext just runs fn.
 */
type StorageLike = {
	getStore(): SSRAccessContext | undefined
	run<T>(context: SSRAccessContext, fn: () => T): T
}

let ssrStorage: StorageLike

try {
	const {AsyncLocalStorage} = require('node:async_hooks') as {AsyncLocalStorage: new () => StorageLike}
	ssrStorage = new AsyncLocalStorage()
} catch {
	// Browser or environment without node:async_hooks; no request context
	ssrStorage = {
		getStore: () => undefined,
		run: (_context, fn) => fn(),
	}
}

/**
 * Data for a single SSR request. Created per request; only visible to code
 * that runs inside the same runWithContext() call.
 */
export interface SSRAccessContext {
	store?: any
	/** Per-request state registry for serialization; fresh Map per request. */
	stateRegistry: Map<string, {state: any; initial: any}>
	sessionId?: string
	sessionData?: any
}

/**
 * Returns the current SSR request context, or undefined if we're not inside
 * a runWithContext() call (e.g. on the client or outside SSR).
 */
export function getSSRContext(): SSRAccessContext | undefined {
	return ssrStorage.getStore()
}

/**
 * Runs fn with context as the current SSR context. Used by the server so that
 * getSSRContext() returns this request's context for the duration of fn.
 */
export function runWithContext<T>(context: SSRAccessContext, fn: () => T): T {
	return ssrStorage.run(context, fn)
}

/**
 * Same as runWithContext but for async functions.
 */
export async function runWithContextAsync<T>(
	context: SSRAccessContext,
	fn: () => Promise<T>,
): Promise<T> {
	return ssrStorage.run(context, fn)
}
