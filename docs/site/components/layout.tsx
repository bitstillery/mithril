import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {DocPage} from '../markdown'

interface LayoutAttrs {
	page: DocPage
	routePath?: string
	navGuides?: string
	navMethods?: string
	version?: string
}

export class Layout extends MithrilComponent<LayoutAttrs> {
	view(vnode: Vnode<LayoutAttrs>) {
		const isServer = typeof window === 'undefined'
		const {page, navGuides = '', navMethods = '', version = '2.3.8'} = vnode.attrs
		console.log('[Layout] view called, isServer:', isServer, 'has page:', !!page, 'has content:', !!(page?.content), 'content length:', page?.content?.length || 0)
		
		if (!page || !page.content) {
			console.log('[Layout] No page or content, rendering loading state')
			return m('div', 'Loading...')
		}
		
		const currentPath = vnode.attrs.routePath || (typeof window !== 'undefined' ? m.route.get() : null) || '/'
		
		// Determine which nav to show based on current path
		const isApiPage = currentPath.startsWith('/api') || currentPath.includes('hyperscript') || currentPath.includes('render') || currentPath.includes('mount') || currentPath.includes('route') || currentPath.includes('request') || currentPath.includes('parseQueryString') || currentPath.includes('buildQueryString') || currentPath.includes('buildPathname') || currentPath.includes('parsePathname') || currentPath.includes('trust') || currentPath.includes('fragment') || currentPath.includes('redraw') || currentPath.includes('censor') || currentPath.includes('stream')
		const navContent = isApiPage ? navMethods : navGuides
		
		return <>
			<header>
				<section>
					<a class="hamburger" href="javascript:;">≡</a>
					<h1>
						<img src="/logo.svg" alt="Mithril" />
						Mithril <span class="version">v{version}</span>
					</h1>
					<nav>
						<m.route.Link href="/" selector="a">Guide</m.route.Link>
						<m.route.Link href="/api.html" selector="a">API</m.route.Link>
						<a href="https://mithril.zulipchat.com/">Chat</a>
						<a href="https://github.com/MithrilJS/mithril.js">GitHub</a>
					</nav>
					{navContent && navContent.trim() ? m.trust(navContent) : null}
				</section>
			</header>
			<main>
				<div class="body">
					{m.trust(page.content)}
					<div class="footer">
						<div>License: MIT. &copy; Mithril Contributors.</div>
						<div><a href={`https://github.com/MithrilJS/docs/edit/main/docs/${currentPath.replace('.html', '.md').replace(/^\//, '')}`}>Edit</a></div>
					</div>
				</div>
			</main>
		</>
	}
	
	oncreate(vnode: Vnode<LayoutAttrs>) {
		// Setup hamburger menu
		const hamburger = document.querySelector('.hamburger')
		if (hamburger) {
			hamburger.addEventListener('click', () => {
				document.body.className = document.body.className === 'navigating' ? '' : 'navigating'
			})
		}
		
		// Setup nav menu close on click
		const navList = document.querySelector('h1 + ul')
		if (navList) {
			navList.addEventListener('click', () => {
				document.body.className = ''
			})
		}
	}
}
