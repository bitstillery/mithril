import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {DocPage} from '../markdown'

import {NavSections} from './nav-sections'

import type {NavSection} from '../store'

interface LayoutAttrs {
	page: DocPage
	routePath?: string
	navGuides?: NavSection[]
	navMethods?: NavSection[]
	version?: string
}

const apiPagePatterns = ['hyperscript', 'render', 'mount', 'route', 'request', 'parseQueryString', 'buildQueryString', 'buildPathname', 'parsePathname', 'trust', 'fragment', 'redraw', 'censor', 'stream']

export class Layout extends MithrilComponent<LayoutAttrs> {
	view(vnode: Vnode<LayoutAttrs>) {
		const attrs = vnode.attrs ?? {}
		const {page, navGuides = [], navMethods = [], version = '2.3.8'} = attrs

		if (!page || !page.content) {
			return m('div', 'Loading...')
		}

		let currentPath = attrs.routePath || '/'
		if (currentPath === '/' && typeof window !== 'undefined' && m.route?.get) {
			try {
				currentPath = m.route.get() || currentPath
			} catch {
				/* use default */
			}
		}

		const isApiPage = currentPath.startsWith('/api') || apiPagePatterns.some((p) => currentPath.includes(p))
		const navSections = isApiPage ? navMethods : navGuides

		return (
			<>
				<header>
					<section>
						<a class="hamburger" href="javascript:;">≡</a>
						<h1>
							<img src="/logo.svg" alt="Mithril" />
							Mithril <span class="version">v{version}</span>
						</h1>
						<nav>
							{m(m.route.Link, {href: '/'}, 'Guide')}
							{m(m.route.Link, {href: '/api.html'}, 'API')}
							<a href="https://mithril.zulipchat.com/">Chat</a>
							<a href="https://github.com/MithrilJS/mithril.js">GitHub</a>
						</nav>
						{navSections?.length ? m(NavSections as any, {sections: navSections}) : null}
					</section>
				</header>
				<main>
					<div class="body">
						{m.trust(page.content)}
						<div class="footer">
							<div>License: MIT. © Mithril Contributors.</div>
							<div><a href={`https://github.com/MithrilJS/docs/edit/main/docs/${currentPath.replace('.html', '.md').replace(/^\//, '')}`}>Edit</a></div>
						</div>
					</div>
				</main>
			</>
		)
	}
	
	oncreate(_vnode: Vnode<LayoutAttrs>) {
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
