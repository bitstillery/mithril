import m from '../../index'

import {Home} from './components/home'
import {AsyncData} from './components/async_data'
import {Layout} from './components/layout'

import type {ComponentType, Vnode} from '../../index'
import type {RouteResolver} from '../../api/router'

function createRoute(component: ComponentType, routePath: string): RouteResolver {
	return {
		render: (vnode: Vnode) => {
			// Use routePath from router's vnode attrs (passed by route.resolve)
			// Fallback to routePath parameter if not in vnode attrs
			const actualRoutePath = vnode.attrs?.routePath || routePath
			// Use route path as key to ensure Layout recreation on route change
			// Pass routePath as attr so Layout can use it for CurrentComponent key and active state
			return m(Layout as unknown as any, {key: actualRoutePath, routePath: actualRoutePath, component: component as any})
		},
	}
}

export const routes: Record<string, ComponentType | RouteResolver> = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'/': createRoute(Home as unknown as ComponentType, '/'),
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'/async': createRoute(AsyncData as unknown as ComponentType, '/async'),
}
