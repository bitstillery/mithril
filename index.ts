import hyperscript from './render/hyperscript'
import mountRedrawFactory from './api/mount-redraw'
import routerFactory from './api/router'
import renderFactory from './render/render'
import parseQueryString from './querystring/parse'
import buildQueryString from './querystring/build'
import parsePathname from './pathname/parse'
import buildPathname from './pathname/build'
import VnodeFactory, {MithrilTsxComponent} from './render/vnode'
import censor from './util/censor'
import next_tick from './util/next_tick'
import domFor from './render/domFor'
import {signal, computed, effect, Signal, ComputedSignal, setSignalRedrawCallback, getSignalComponents} from './signal'
import {state, watch, registerState, getRegisteredStates} from './state'

import type {Vnode, Children, ComponentType} from './render/vnode'
import type {Hyperscript} from './render/hyperscript'
import type {Route, RouteResolver, RedirectObject} from './api/router'
import type {Render, Redraw, Mount} from './api/mount-redraw'

export interface MithrilStatic {
	m: Hyperscript
	trust: (html: string) => Vnode
	fragment: (attrs: Record<string, any> | null, ...children: Children[]) => Vnode
	Fragment: string
	mount: Mount
	route: Route & ((root: Element, defaultRoute: string, routes: Record<string, ComponentType | RouteResolver>) => void) & {redirect: (path: string) => RedirectObject}
	render: Render
	redraw: Redraw
	parseQueryString: (queryString: string) => Record<string, any>
	buildQueryString: (values: Record<string, any>) => string
	parsePathname: (pathname: string) => {path: string; params: Record<string, any>}
	buildPathname: (template: string, params: Record<string, any>) => string
	vnode: typeof VnodeFactory
	censor: (attrs: Record<string, any>, extras?: string[]) => Record<string, any>
	next_tick: () => Promise<void>
	domFor: (vnode: Vnode) => Generator<Node, void, unknown>
}

const mountRedrawInstance = mountRedrawFactory(
	renderFactory(),
	typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
	console,
)

const router = routerFactory(
	typeof window !== 'undefined' ? window : null,
	mountRedrawInstance,
)

const m: MithrilStatic & Hyperscript = function m(this: any) {
	return hyperscript.apply(this, arguments as any)
} as unknown as MithrilStatic & Hyperscript

m.m = hyperscript as Hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.Fragment = '['
m.mount = mountRedrawInstance.mount
m.route = router as Route & typeof router & {redirect: (path: string) => RedirectObject}
m.render = renderFactory()
m.redraw = mountRedrawInstance.redraw
m.parseQueryString = parseQueryString
m.buildQueryString = buildQueryString
m.parsePathname = parsePathname
m.buildPathname = buildPathname
m.vnode = VnodeFactory
m.censor = censor
m.next_tick = next_tick
m.domFor = domFor

// Set up signal-to-component redraw integration
setSignalRedrawCallback((sig: Signal<any>) => {
	const components = getSignalComponents(sig)
	if (components) {
		components.forEach(component => {
			// Use the component-level redraw
			m.redraw(component as any)
		})
	}
})

// Export signals API
export {signal, computed, effect, Signal, ComputedSignal, state, watch, registerState, getRegisteredStates}
export type {State} from './state'

// Export Store class
export {Store} from './store'

// Export SSR utilities
export {serializeStore, deserializeStore, serializeAllStates, deserializeAllStates} from './render/ssrState'

// Export SSR request context (for per-request store and state registry)
export {getSSRContext, runWithContext, runWithContextAsync} from './ssrContext'
export type {SSRAccessContext} from './ssrContext'

// Export next_tick utility
export {next_tick} from './util/next_tick'

// Export component and vnode types
export type {Vnode, Children, Component, ComponentFactory, ComponentType} from './render/vnode'
// Export MithrilTsxComponent as a value (class) so it can be extended at runtime
export {MithrilTsxComponent}
export type {Hyperscript} from './render/hyperscript'
export type {Route, RouteResolver, RedirectObject} from './api/router'
export type {Render, Redraw, Mount} from './api/mount-redraw'

export default m
