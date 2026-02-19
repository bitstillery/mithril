import m from '../../index'
import {DocLoader} from './components/doc-loader'
import type {ComponentType, Vnode} from '../../index'
import type {RouteResolver} from '../../api/router'

// Map of route paths to markdown file names (extensionless for clean client-side routing)
const routeMap: Record<string, string> = {
    '/': 'index',
    '/installation': 'installation',
    '/simple-application': 'simple-application',
    '/learning-mithril': 'learning-mithril',
    '/support': 'support',
    '/jsx': 'jsx',
    '/es6': 'es6',
    '/animation': 'animation',
    '/testing': 'testing',
    '/examples': 'examples',
    '/integrating-libs': 'integrating-libs',
    '/paths': 'paths',
    '/vnodes': 'vnodes',
    '/components': 'components',
    '/lifecycle-methods': 'lifecycle-methods',
    '/keys': 'keys',
    '/autoredraw': 'autoredraw',
    '/contributing': 'contributing',
    '/credits': 'credits',
    '/code-of-conduct': 'code-of-conduct',
    '/framework-comparison': 'framework-comparison',
    '/archives': 'archives',
    '/api': 'api',
    '/hyperscript': 'hyperscript',
    '/render': 'render',
    '/mount': 'mount',
    '/route': 'route',
    '/request': 'request',
    '/parseQueryString': 'parseQueryString',
    '/buildQueryString': 'buildQueryString',
    '/buildPathname': 'buildPathname',
    '/parsePathname': 'parsePathname',
    '/trust': 'trust',
    '/fragment': 'fragment',
    '/redraw': 'redraw',
    '/censor': 'censor',
    '/stream': 'stream',
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
