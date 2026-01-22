import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'

interface LayoutAttrs {
	component: any
	routePath?: string
}

export class Layout extends MithrilTsxComponent<LayoutAttrs> {
	view(vnode: Vnode<LayoutAttrs>) {
		// Use routePath from attrs (passed by router) for SSR compatibility
		// On server, m.route.get() doesn't work, so we use routePath prop
		// On client, m.route.get() works, but routePath ensures consistency
		const currentPath = vnode.attrs.routePath || (typeof window !== 'undefined' ? m.route.get() : null) || '/'
		const CurrentComponent = vnode.attrs.component
		// Use routePath as key to ensure component is recreated when route changes
		const componentKey = vnode.attrs.routePath || currentPath

		return <div class="container">
			<h1>Mithril SSR Test</h1>
			<nav>
				<m.route.Link href="/" selector="a" class={currentPath === '/' ? 'active' : ''}>
					Home
				</m.route.Link>
				{' '}
				<m.route.Link href="/async" selector="a" class={currentPath === '/async' ? 'active' : ''}>
					Async Data
				</m.route.Link>
			</nav>
			<main>
				<CurrentComponent key={componentKey} />
			</main>
		</div>
	}
}
