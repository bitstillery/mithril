/**
 * Isomorphic URI API - works in both SSR (server) and browser contexts
 */

/**
 * Get the current full URL (href)
 * Returns window.location.href in browser, or server's request URL during SSR
 */
export function getCurrentUrl(): string {
	// Prefer browser location when available (more direct)
	if (typeof window !== 'undefined' && window.location) {
		return window.location.href
	}
	
	// Fall back to SSR server URL (when client code runs on server)
	if (typeof globalThis !== 'undefined' && (globalThis as any).__SSR_URL__) {
		return (globalThis as any).__SSR_URL__
	}
	
	// Fallback (shouldn't happen)
	return ''
}

/**
 * Parse a URL string into its components
 */
function parseUrl(url: string): URL {
	try {
		return new URL(url)
	} catch {
		// Fallback for relative URLs
		return new URL(url, 'http://localhost')
	}
}

/**
 * Get the current pathname
 */
export function getPathname(): string {
	// Prefer browser location when available (more direct)
	if (typeof window !== 'undefined' && window.location) {
		return window.location.pathname || '/'
	}
	
	// Fall back to parsing SSR URL
	const url = getCurrentUrl()
	if (!url) return '/'
	
	const parsed = parseUrl(url)
	return parsed.pathname || '/'
}

/**
 * Get the current search string (query string)
 */
export function getSearch(): string {
	// Prefer browser location when available (more direct)
	if (typeof window !== 'undefined' && window.location) {
		return window.location.search || ''
	}
	
	// Fall back to parsing SSR URL
	const url = getCurrentUrl()
	if (!url) return ''
	
	const parsed = parseUrl(url)
	return parsed.search || ''
}

/**
 * Get the current hash
 */
export function getHash(): string {
	// Prefer browser location when available (more direct)
	if (typeof window !== 'undefined' && window.location) {
		return window.location.hash || ''
	}
	
	// Fall back to parsing SSR URL
	const url = getCurrentUrl()
	if (!url) return ''
	
	const parsed = parseUrl(url)
	return parsed.hash || ''
}

/**
 * Get a Location-like object with all properties
 * Compatible with browser Location API
 */
export interface IsomorphicLocation {
	href: string
	pathname: string
	search: string
	hash: string
	origin?: string
	host?: string
	hostname?: string
	port?: string
	protocol?: string
}

export function getLocation(): IsomorphicLocation {
	const url = getCurrentUrl()
	if (!url) {
		return {
			href: '',
			pathname: '/',
			search: '',
			hash: '',
		}
	}
	
	const parsed = parseUrl(url)
	return {
		href: parsed.href,
		pathname: parsed.pathname || '/',
		search: parsed.search || '',
		hash: parsed.hash || '',
		origin: parsed.origin,
		host: parsed.host,
		hostname: parsed.hostname,
		port: parsed.port,
		protocol: parsed.protocol,
	}
}
