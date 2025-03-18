import _mountRedraw from './api/mount-redraw'
import hyperscript from './render/hyperscript'
import request from './request/request'
import {domFor} from './render/domFor'
import _route from './api/router'
import _render from './render/render'
import parseQueryString from './querystring/parse'
import buildQueryString from './querystring/build'
import parsePathname from './pathname/parse'
import buildPathname from './pathname/build'
import vnode from './render/vnode'
import censor from './util/censor'
import trust from './render/trust'
import fragment from './render/fragment'

hyperscript.trust = trust
hyperscript.fragment = fragment

const render = _render(window)
const mountRedraw = _mountRedraw(render, requestAnimationFrame, console)
const route = _route(window, mountRedraw)

const m = function m() { 
    return hyperscript.apply(this, arguments) 
}
m.m = hyperscript
m.trust = trust
m.fragment = fragment
m.Fragment = '['
m.mount = mountRedraw.mount
m.route = route
m.render = render
m.redraw = mountRedraw.redraw
m.request = request.request
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.parsePathname = parsePathname
m.buildPathname = buildPathname
m.vnode = vnode
m.censor = censor
m.domFor = domFor

export default m
