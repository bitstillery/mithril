import m from '../../index'
import {DocLoader} from './components/doc-loader'
import type {ComponentType, Vnode} from '../../index'
import type {RouteResolver} from '../../api/router'

// Map of route paths to markdown file names
const routeMap: Record<string, string> = {
	'/': 'index',
	'/installation.html': 'installation',
	'/simple-application.html': 'simple-application',
	'/learning-mithril.html': 'learning-mithril',
	'/support.html': 'support',
	'/jsx.html': 'jsx',
	'/es6.html': 'es6',
	'/animation.html': 'animation',
	'/testing.html': 'testing',
	'/examples.html': 'examples',
	'/integrating-libs.html': 'integrating-libs',
	'/paths.html': 'paths',
	'/vnodes.html': 'vnodes',
	'/components.html': 'components',
	'/lifecycle-methods.html': 'lifecycle-methods',
	'/keys.html': 'keys',
	'/autoredraw.html': 'autoredraw',
	'/contributing.html': 'contributing',
	'/credits.html': 'credits',
	'/code-of-conduct.html': 'code-of-conduct',
	'/framework-comparison.html': 'framework-comparison',
	'/archives.html': 'archives',
	'/api.html': 'api',
	'/hyperscript.html': 'hyperscript',
	'/render.html': 'render',
	'/mount.html': 'mount',
	'/route.html': 'route',
	'/request.html': 'request',
	'/parseQueryString.html': 'parseQueryString',
	'/buildQueryString.html': 'buildQueryString',
	'/buildPathname.html': 'buildPathname',
	'/parsePathname.html': 'parsePathname',
	'/trust.html': 'trust',
	'/fragment.html': 'fragment',
	'/redraw.html': 'redraw',
	'/censor.html': 'censor',
	'/stream.html': 'stream',
}

function createRoute(routePath: string, docName: string): RouteResolver {
	return {
		render: (vnode: Vnode) => {
			// Use routePath from router's vnode attrs (passed by route.resolve)
			const actualRoutePath = vnode.attrs?.routePath || routePath
			console.log('[createRoute] Rendering route:', routePath, 'docName:', docName, 'actualRoutePath:', actualRoutePath)
			// Return DocLoader component which will load data in oninit
			const result = m(DocLoader as unknown as any, {
				key: actualRoutePath,
				routePath: actualRoutePath,
				docName,
			})
			// Ensure we always return a valid vnode
			if (!result || !result.tag) {
				console.error('[createRoute] Invalid vnode returned for route:', routePath, 'result:', result)
				return m('div', `Error loading route: ${routePath}`)
			}
			console.log('[createRoute] Created vnode for route:', routePath, 'tag type:', typeof result.tag === 'string' ? result.tag : 'component')
			return result
		},
	}
}

export function getRoutes(): Record<string, ComponentType | RouteResolver> {
	const routes: Record<string, ComponentType | RouteResolver> = {}
	
	for (const [path, docName] of Object.entries(routeMap)) {
		routes[path] = createRoute(path, docName)
	}
	
	return routes
}
