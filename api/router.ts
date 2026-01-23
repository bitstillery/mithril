import Vnode from '../render/vnode'
import hyperscript from '../render/hyperscript'
import decodeURIComponentSafe from '../util/decodeURIComponentSafe'
import buildPathname from '../pathname/build'
import parsePathname from '../pathname/parse'
import compileTemplate from '../pathname/compileTemplate'
import censor from '../util/censor'

import type {ComponentType, Vnode as VnodeType} from '../render/vnode'

export interface RouteResolver<Attrs = Record<string, any>, State = any> {
	onmatch?: (args: Attrs, requestedPath: string, route: string) => ComponentType<Attrs, State> | Promise<ComponentType<Attrs, State>> | void
	render?: (vnode: VnodeType<Attrs, State>) => VnodeType
}

export type SSRState = Record<string, any>
export type SSRResult = string | {html: string, state: SSRState}

export interface Route {
	(path: string, params?: Record<string, any>, shouldReplaceHistory?: boolean): void
	(path: string, component: ComponentType, shouldReplaceHistory?: boolean): void
	set: (path: string, params?: Record<string, any>, data?: any) => void
	get: () => string | undefined
	prefix: string
	link: (vnode: VnodeType) => string
	param: (key?: string) => any
	params: Record<string, any>
	Link: ComponentType
	resolve: (
		pathname: string,
		routes: Record<string, ComponentType | RouteResolver | {component: ComponentType | RouteResolver}>,
		renderToString: (vnodes: any) => Promise<SSRResult>,
		prefix?: string,
	) => Promise<SSRResult>
}

interface MountRedraw {
	mount: (root: Element, component: ComponentType | null) => void
	redraw: () => void
}

interface RouteOptions {
	replace?: boolean
	state?: any
	title?: string | null
}

export default function router($window: any, mountRedraw: MountRedraw) {
	let p = Promise.resolve()

	let scheduled = false

	let ready = false
	let hasBeenResolved = false

	let dom: Element | undefined
	let compiled: Array<{route: string; component: any; check: (data: {path: string; params: Record<string, any>}) => boolean}> | undefined
	let fallbackRoute: string | undefined

	let currentResolver: RouteResolver | null = null
	let component: ComponentType | string = 'div'
	let attrs: Record<string, any> = {}
	let currentPath: string | undefined
	let lastUpdate: ((comp: any) => void) | null = null

	const RouterRoot: ComponentType = {
		onremove: function() {
			ready = hasBeenResolved = false
			$window.removeEventListener('popstate', fireAsync, false)
		},
		view: function() {
			// The route has already been resolved.
			// Therefore, the following early return is not needed.
			// if (!hasBeenResolved) return

			// Use currentPath as key to ensure component recreation on route change
			// Pass currentPath in attrs so RouteResolver.render can use it for routePath
			const routeAttrs = {...attrs, routePath: currentPath || attrs.routePath, key: currentPath || attrs.key}
			const vnode = Vnode(component, currentPath || attrs.key, routeAttrs, null, null, null)
			if (currentResolver) return currentResolver.render!(vnode as any)
			// Wrap in a fragment to preserve existing key semantics
			return [vnode]
		},
	}

	const SKIP = route.SKIP = {}

	function resolveRoute() {
		scheduled = false
		// Consider the pathname holistically. The prefix might even be invalid,
		// but that's not our problem.
		let prefix = $window.location.hash
		if (route.prefix[0] !== '#') {
			prefix = $window.location.search + prefix
			if (route.prefix[0] !== '?') {
				prefix = $window.location.pathname + prefix
				if (prefix[0] !== '/') prefix = '/' + prefix
			}
		}
		const path = decodeURIComponentSafe(prefix).slice(route.prefix.length)
		const data = parsePathname(path)

		Object.assign(data.params, $window.history.state || {})

		function reject(e: any) {
			console.error(e)
			route.set(fallbackRoute!, null, {replace: true})
		}

		loop(0)
		function loop(i: number) {
			if (!compiled) return
			for (; i < compiled.length; i++) {
				if (compiled[i].check(data)) {
					let payload = compiled[i].component
					const matchedRoute = compiled[i].route
					const localComp = payload
					const update = lastUpdate = function(comp: any) {
						if (update !== lastUpdate) return
						if (comp === SKIP) return loop(i + 1)
						// If comp is a RouteResolver with render, set currentResolver instead of component
						if (comp && typeof comp === 'object' && comp.render && !comp.view && typeof comp !== 'function') {
							currentResolver = comp
							component = 'div' // Placeholder, won't be used since currentResolver.render will be called
						} else {
							currentResolver = null
							component = comp != null && (typeof comp.view === 'function' || typeof comp === 'function') ? comp : 'div'
						}
						attrs = data.params
						currentPath = path
						lastUpdate = null
						if (hasBeenResolved) mountRedraw.redraw()
						else {
							hasBeenResolved = true
							mountRedraw.mount(dom!, RouterRoot)
						}
					}
					// There's no understating how much I *wish* I could
					// use `async`/`await` here...
					if (payload.view || typeof payload === 'function') {
						payload = {}
						update(localComp)
					}
					else if (payload.onmatch) {
						p.then(function() {
							return payload.onmatch!(data.params, path, matchedRoute)
						}).then(update, path === fallbackRoute ? null : reject)
					}
					else if (payload.render) {
						// RouteResolver with render method - update with resolver itself
						update(payload)
					}
					else update('div')
					return
				}
			}

			if (path === fallbackRoute) {
				throw new Error('Could not resolve default route ' + fallbackRoute + '.')
			}
			route.set(fallbackRoute!, null, {replace: true})
		}
	}

	function fireAsync() {
		if (!scheduled) {
			scheduled = true
			// TODO: just do `mountRedraw.redraw()` here and elide the timer
			// dependency. Note that this will muck with tests a *lot*, so it's
			// not as easy of a change as it sounds.
			setTimeout(resolveRoute)
		}
	}

	function route(root: Element, defaultRoute: string, routes: Record<string, ComponentType | RouteResolver>) {
		if (!root) throw new TypeError('DOM element being rendered to does not exist.')

		compiled = Object.keys(routes).map(function(routePath) {
			if (routePath[0] !== '/') throw new SyntaxError('Routes must start with a \'/\'.')
			if ((/:([^\/\.-]+)(\.{3})?:/).test(routePath)) {
				throw new SyntaxError('Route parameter names must be separated with either \'/\', \'.\', or \'-\'.')
			}
			return {
				route: routePath,
				component: routes[routePath],
				check: compileTemplate(routePath),
			}
		})
		fallbackRoute = defaultRoute
		if (defaultRoute != null) {
			const defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function(i) { return i.check(defaultData) })) {
				throw new ReferenceError('Default route doesn\'t match any known routes.')
			}
		}
		dom = root

		$window.addEventListener('popstate', fireAsync, false)

		ready = true

		// The RouterRoot component is mounted when the route is first resolved.
		resolveRoute()
	}
	route.set = function(path: string, data: Record<string, any> | null, options?: RouteOptions) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null

		path = buildPathname(path, data || {})
		if (ready) {
			fireAsync()
			const state = options ? options.state : null
			const title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}
	route.get = function() {return currentPath}
	route.prefix = '#!'
	route.link = function(vnode: VnodeType) {
		return route.Link.view(vnode)
	}
	route.Link = {
		view: function(vnode: VnodeType) {
			// Omit the used parameters from the rendered element - they are
			// internal. Also, censor the various lifecycle methods.
			//
			// We don't strip the other parameters because for convenience we
			// let them be specified in the selector as well.
			const child = hyperscript(
				vnode.attrs?.selector || 'a',
				censor(vnode.attrs || {}, ['options', 'params', 'selector', 'onclick']),
				vnode.children,
			)
			let options: RouteOptions | undefined
			let onclick: any
			let href: string

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs!.disabled = Boolean(child.attrs!.disabled)) {
				child.attrs!.href = null
				child.attrs!['aria-disabled'] = 'true'
				// If you *really* do want add `onclick` on a disabled link, use
				// an `oncreate` hook to add it.
			} else {
				options = vnode.attrs?.options
				onclick = vnode.attrs?.onclick
				// Easier to build it now to keep it isomorphic.
				href = buildPathname(child.attrs!.href || '', vnode.attrs?.params || {})
				// Make Link isomorphic - use empty prefix on server for pathname routing
				// On server ($window is null): always use empty prefix for clean URLs
				// On client: use route.prefix (which may be '#!' for hash routing or '' for pathname routing)
				// This ensures SSR generates clean pathname URLs while client can use hash routing if configured
				const linkPrefix = ($window == null) ? '' : route.prefix
				child.attrs!.href = linkPrefix + href
				child.attrs!.onclick = function(e: any) {
					let result: any
					if (typeof onclick === 'function') {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== 'object') {
						// do nothing
					} else if (typeof onclick.handleEvent === 'function') {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === '_self') &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						// Safely call preventDefault - event might be wrapped by Mithril
						if (typeof e.preventDefault === 'function') {
							e.preventDefault()
						} else if (e.originalEvent && typeof e.originalEvent.preventDefault === 'function') {
							e.originalEvent.preventDefault()
						}
						(e as any).redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key?: string) {
		return attrs && key != null ? attrs[key] : attrs
	}
	route.params = attrs

	// Server-side route resolution (isomorphic)
	route.resolve = async function(
		pathname: string,
		routes: Record<string, ComponentType | RouteResolver | {component: ComponentType | RouteResolver}>,
		renderToString: (vnodes: any) => Promise<string>,
		prefix: string = '',
	): Promise<string> {
		// Save current prefix and set to provided prefix for SSR
		// This ensures Link components use the correct prefix during server-side rendering
		const savedPrefix = route.prefix
		route.prefix = prefix
		try {
			// Compile routes (same logic as in route() function)
			const compiled = Object.keys(routes).map(function(routePath) {
				if (routePath[0] !== '/') throw new SyntaxError('Routes must start with a \'/\'.')
				if ((/:([^\/\.-]+)(\.{3})?:/).test(routePath)) {
					throw new SyntaxError('Route parameter names must be separated with either \'/\', \'.\', or \'-\'.')
				}
				// Handle both formats: direct component/resolver or {component: ...}
				const routeValue = routes[routePath]
				const component = (routeValue && typeof routeValue === 'object' && 'component' in routeValue)
					? (routeValue as {component: ComponentType | RouteResolver}).component
					: routeValue as ComponentType | RouteResolver
				return {
					route: routePath,
					component: component,
					check: compileTemplate(routePath),
				}
			})

			// Parse pathname
			const path = decodeURIComponentSafe(pathname).slice(prefix.length)
			const data = parsePathname(path)

			// Find matching route
			for (const {route: matchedRoute, component, check} of compiled) {
				if (check(data)) {
					let payload = component

					// Handle RouteResolver
					if (payload && typeof payload === 'object' && ('onmatch' in payload || 'render' in payload)) {
						const resolver = payload as RouteResolver
						if (resolver.onmatch) {
							const result = resolver.onmatch(data.params, pathname, matchedRoute)
							if (result instanceof Promise) {
								payload = await result
							} else if (result !== undefined) {
								payload = result
							}
						}

						// If resolver has render, use it
						if (resolver.render) {
							// Pass matchedRoute path in attrs so Layout component can use it for SSR
							const routeAttrs = {...data.params, routePath: matchedRoute}
							const vnode = Vnode(payload, data.params.key, routeAttrs, null, null, null)
							const result = await renderToString(resolver.render(vnode))
						// Handle both string (backward compatibility) and {html, state} return types
						return typeof result === 'string' ? result : result
						}
					}

					// Render component
					// Check if payload is a ComponentType (not a RouteResolver)
					const isComponentType = payload != null && (
						typeof payload === 'function' ||
						(typeof payload === 'object' && 'view' in payload && typeof (payload as any).view === 'function')
					)
					if (isComponentType) {
						const vnode = hyperscript(payload as ComponentType, data.params)
						const result = await renderToString(vnode)
						// Handle both string (backward compatibility) and {html, state} return types
						return typeof result === 'string' ? result : result
					}

					// Fallback to div
					const vnode = hyperscript('div', data.params)
					return await renderToString(vnode)
				}
			}

			// No route found
			throw new Error(`No route found for ${pathname}`)
		} finally {
			// Restore original prefix
			route.prefix = savedPrefix
		}
	}

	return route as unknown as Route & ((root: Element, defaultRoute: string, routes: Record<string, ComponentType | RouteResolver>) => void)
}
