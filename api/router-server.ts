import Vnode from '../render/vnode'
import hyperscript from '../render/hyperscript'
import decodeURIComponentSafe from '../util/decodeURIComponentSafe'
import parsePathname from '../pathname/parse'
import compileTemplate from '../pathname/compileTemplate'

import type {RouteResolver} from '../index'

interface RenderToString {
	(vnodes: any): Promise<string>
}

export default function routerServerFactory(renderToString: RenderToString) {
	// Compile route templates
	function compileRoutes(routes: Record<string, any>): Array<{
		route: string
		component: any
		check: (data: {path: string; params: Record<string, any>}) => boolean
	}> {
		const compiled: Array<{
			route: string
			component: any
			check: (data: {path: string; params: Record<string, any>}) => boolean
		}> = []
		
		for (const route in routes) {
			const component = routes[route]
			const template = compileTemplate(route)
			const check = (data: {path: string; params: Record<string, any>}) => {
				return template(data)
			}
			compiled.push({route, component, check})
		}
		
		return compiled
	}
	
	// Resolve route and render component
	async function resolveRoute(
		pathname: string,
		routes: Record<string, any>,
		prefix: string = '',
	): Promise<string> {
		const path = decodeURIComponentSafe(pathname).slice(prefix.length)
		const data = parsePathname(path)
		
		const compiled = compileRoutes(routes)
		
		// Find matching route
		for (const {route, component, check} of compiled) {
			if (check(data)) {
				let payload = component
				
				// Handle RouteResolver
				if (payload && typeof payload === 'object' && 'onmatch' in payload) {
					const resolver = payload as RouteResolver
					if (resolver.onmatch) {
						const result = resolver.onmatch(data.params, pathname, route)
						if (result instanceof Promise) {
							payload = await result
						} else if (result !== undefined) {
							payload = result
						}
					}
					
					// If resolver has render, use it
					if (resolver.render) {
						const vnode = Vnode(payload, data.params.key, data.params)
						return await renderToString(resolver.render(vnode))
					}
				}
				
				// Render component
				if (payload != null && (typeof payload.view === 'function' || typeof payload === 'function')) {
					const vnode = hyperscript(payload, data.params)
					return await renderToString(vnode)
				}
				
				// Fallback to div
				const vnode = hyperscript('div', data.params)
				return await renderToString(vnode)
			}
		}
		
		// No route found
		throw new Error(`No route found for ${pathname}`)
	}
	
	return {
		resolve: resolveRoute,
	}
}
