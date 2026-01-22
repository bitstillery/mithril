import hyperscript from './render/hyperscript'
import {renderToStringFactory} from './render/renderToString'
import routerServerFactory from './api/router-server'
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

// Create server-side router
const routerServer = routerServerFactory(renderToString)

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
