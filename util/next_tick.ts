/**
 * Isomorphic next_tick utility
 * 
 * Returns a Promise that resolves after the current execution stack completes.
 * 
 * - In browser: Uses queueMicrotask for optimal performance, falls back to Promise.resolve()
 * - In SSR: Resolves immediately since SSR rendering is synchronous and there's no event loop
 * 
 * @returns Promise that resolves on the next tick
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
async function next_tick(): Promise<void> {
	// Check if we're in SSR mode
	if (typeof globalThis !== 'undefined' && (globalThis as any).__SSR_MODE__) {
		// In SSR mode, resolve immediately since SSR rendering is synchronous
		// and there's no event loop to defer to
		return Promise.resolve()
	}

	// Browser mode: use queueMicrotask for optimal performance
	if (typeof queueMicrotask !== 'undefined') {
		return new Promise<void>((resolve) => {
			queueMicrotask(resolve)
		})
	}

	// Fallback: use Promise.resolve() for older environments
	if (typeof Promise !== 'undefined' && Promise.resolve) {
		return Promise.resolve()
	}

	// Last resort: setTimeout (shouldn't happen in modern environments)
	if (typeof setTimeout !== 'undefined') {
		return new Promise<void>((resolve: () => void) => {
			setTimeout(resolve, 0)
		})
	}

	// If nothing is available, resolve immediately
	// This should never happen in practice, but TypeScript needs a return
	return Promise.resolve() as Promise<void>
}

export default next_tick
export {next_tick}
