import hyperscript from './hyperscript'
import mountRedraw from './api/mount-redraw'
import requestFactory from './request/request'
import routerFactory from './api/router'
import renderFactory from './render/render'
import parseQueryString from './querystring/parse'
import buildQueryString from './querystring/build'
import parsePathname from './pathname/parse'
import buildPathname from './pathname/build'
import Vnode from './render/vnode'
import censor from './util/censor'
import domFor from './render/domFor'

import type {MithrilStatic, Hyperscript} from './index.d.ts'

const mountRedrawInstance = mountRedraw(
	renderFactory(),
	typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
	console,
)

const request = requestFactory(
	typeof window !== 'undefined' ? window : null,
	mountRedrawInstance.redraw,
)

const router = routerFactory(
	typeof window !== 'undefined' ? window : null,
	mountRedrawInstance,
)

const m: MithrilStatic & Hyperscript = function m(this: any) {
	return hyperscript.apply(this, arguments as any)
} as any

m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = '['
m.mount = mountRedrawInstance.mount
m.route = router
m.render = renderFactory()
m.redraw = mountRedrawInstance.redraw
m.request = request.request
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.parsePathname = parsePathname
m.buildPathname = buildPathname
m.vnode = Vnode
m.censor = censor
m.domFor = domFor

export default m
