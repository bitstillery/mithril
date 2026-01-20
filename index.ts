import hyperscript from "./hyperscript.js"
import mountRedraw from "./api/mount-redraw.js"
import requestFactory from "./request/request.js"
import routerFactory from "./api/router.js"
import renderFactory from "./render/render.js"
import parseQueryString from "./querystring/parse.js"
import buildQueryString from "./querystring/build.js"
import parsePathname from "./pathname/parse.js"
import buildPathname from "./pathname/build.js"
import Vnode from "./render/vnode.js"
import censor from "./util/censor.js"
import domFor from "./render/domFor.js"
import type { MithrilStatic, Hyperscript } from "./index.d.ts"

const mountRedrawInstance = mountRedraw(
	renderFactory(),
	typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame.bind(window) : setTimeout,
	console
)

const request = requestFactory(
	typeof window !== "undefined" ? window : null,
	mountRedrawInstance.redraw
)

const router = routerFactory(
	typeof window !== "undefined" ? window : null,
	mountRedrawInstance
)

const m: MithrilStatic & Hyperscript = function m(this: any) {
	return hyperscript.apply(this, arguments as any)
} as any

m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = "["
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
