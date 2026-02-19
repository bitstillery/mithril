import m from '../../index'
import {DocLoader} from './components/doc-loader'
import type {ComponentType, Vnode} from '../../index'
import type {RouteResolver} from '../../api/router'

// Map of route paths to markdown file names (extensionless for clean client-side routing)
const routeMap: Record<string, string> = {
    '/': 'index',
    '/setup': 'setup',
    '/support': 'support',
    '/jsx': 'jsx',
    '/animation': 'animation',
    '/testing': 'testing',
    '/examples': 'examples',
    '/paths': 'paths',
    '/vnodes': 'vnodes',
    '/components': 'components',
    '/lifecycle-methods': 'lifecycle-methods',
    '/keys': 'keys',
    '/autoredraw': 'autoredraw',
    '/credits': 'credits',
    '/code-of-conduct': 'code-of-conduct',
    '/api': 'api',
    '/hyperscript': 'hyperscript',
    '/render': 'render',
    '/mount': 'mount',
    '/route': 'route',
    '/parseQueryString': 'parseQueryString',
    '/buildQueryString': 'buildQueryString',
    '/buildPathname': 'buildPathname',
    '/parsePathname': 'parsePathname',
    '/trust': 'trust',
    '/fragment': 'fragment',
    '/redraw': 'redraw',
    '/censor': 'censor',
    '/signals': 'signals',
    '/state': 'state',
    '/store': 'store',
    '/ssr': 'ssr',
}

function createRoute(routePath: string, docName: string): RouteResolver {
    return {
        render: (vnode: Vnode) => {
            const actualRoutePath = vnode.attrs?.routePath || routePath
            const result = m(DocLoader as unknown as any, {
                key: actualRoutePath,
                routePath: actualRoutePath,
                docName,
            })
            if (!result || !result.tag) {
                return m('div', `Error loading route: ${routePath}`)
            }
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
