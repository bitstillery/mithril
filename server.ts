import hyperscript from './render/hyperscript'
import {renderToStringFactory} from './render/renderToString'
import routerFactory from './api/router'
import parseQueryString from './querystring/parse'
import buildQueryString from './querystring/build'
import parsePathname from './pathname/parse'
import buildPathname from './pathname/build'
import Vnode from './render/vnode'
import censor from './util/censor'

import type {MithrilStatic, Hyperscript} from './index'
import type {Redraw} from './api/mount-redraw'

// Create server-side renderer
const {renderToString, renderToStringSync} = renderToStringFactory()

// Create isomorphic router instance (null window for server, mock mountRedraw)
const router = routerFactory(null, {
	mount: () => {
		throw new Error('m.mount is not available on server. Use m.route.resolve instead.')
	},
	redraw: () => {
		throw new Error('m.redraw is not available on server.')
	},
})

// Set prefix to empty string for pathname-based routing (not hash-based)
router.prefix = ''

// Expose resolve method and Link component for server-side routing
const routerServer = {
	resolve: router.resolve.bind(router),
	Link: router.Link,
	prefix: router.prefix,
	get: router.get.bind(router),
	set: router.set.bind(router),
	param: router.param.bind(router),
	params: router.params,
	link: router.link.bind(router),
}

// Server-side Mithril instance
const mServer: MithrilStatic & Hyperscript & {
	renderToString: typeof renderToString
	renderToStringSync: typeof renderToStringSync
	route: typeof routerServer
} = function m(this: any) {
	return hyperscript.apply(this, arguments as any)
} as unknown as MithrilStatic & Hyperscript & {
	renderToString: typeof renderToString
	renderToStringSync: typeof renderToStringSync
	route: typeof routerServer
}

mServer.m = hyperscript as Hyperscript
mServer.trust = hyperscript.trust
mServer.fragment = hyperscript.fragment
mServer.Fragment = '['
mServer.renderToString = renderToString
mServer.renderToStringSync = renderToStringSync
mServer.route = routerServer as any
mServer.parseQueryString = parseQueryString
mServer.buildQueryString = buildQueryString
mServer.parsePathname = parsePathname
mServer.buildPathname = buildPathname
mServer.vnode = Vnode
mServer.censor = censor

// Placeholder implementations for server (not used but needed for type compatibility)
mServer.mount = () => {
	throw new Error('m.mount is not available on server. Use m.renderToString instead.')
}
mServer.render = () => {
	throw new Error('m.render is not available on server. Use m.renderToString instead.')
}
mServer.redraw = Object.assign(() => {
	throw new Error('m.redraw is not available on server.')
}, {
	sync: () => {
		throw new Error('m.redraw.sync is not available on server.')
	},
}) as Redraw

export default mServer

// Export SSR server utilities
export * from './server/session'
export * from './server/ssr'
