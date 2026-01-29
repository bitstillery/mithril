import {MithrilTsxComponent, Vnode} from '../../../index'
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

export class DocPageComponent extends MithrilTsxComponent<DocPageAttrs> {
	view(vnode: Vnode<DocPageAttrs>) {
		return m(Layout as any, {
			page: vnode.attrs.page,
			routePath: vnode.attrs.routePath,
			navGuides: vnode.attrs.navGuides,
			navMethods: vnode.attrs.navMethods,
			version: vnode.attrs.version,
		})
	}
}
