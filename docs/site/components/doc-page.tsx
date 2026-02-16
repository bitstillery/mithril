import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {Layout} from './layout'
import {DocPage} from '../markdown'

interface DocPageAttrs {
	page: DocPage
	routePath?: string
	navGuides?: string
	navMethods?: string
	version?: string
}

export class DocPageComponent extends MithrilComponent<DocPageAttrs> {
	view(vnode: Vnode<DocPageAttrs>) {
		const isServer = typeof window === 'undefined'
		console.log('[DocPageComponent] view called, isServer:', isServer, 'has page:', !!vnode.attrs.page)
		
		if (!vnode.attrs.page) {
			console.log('[DocPageComponent] No page data, rendering error')
			return m('div', 'No page data')
		}
		
		console.log('[DocPageComponent] Rendering Layout with page title:', vnode.attrs.page.title)
		const result = m(Layout as any, {
			page: vnode.attrs.page,
			routePath: vnode.attrs.routePath,
			navGuides: vnode.attrs.navGuides,
			navMethods: vnode.attrs.navMethods,
			version: vnode.attrs.version,
		})
		console.log('[DocPageComponent] Layout vnode created')
		return result
	}
}
