import {MithrilComponent} from '../../../src/index'
import type {Vnode} from '../../../src/index'
import m from '../../../src/index'
import {Layout} from './layout'
import type {DocPage} from '../markdown'

interface DocPageAttrs {
    page: DocPage
    pendingPage?: DocPage
    onTransitionEnd?: () => void
    routePath?: string
    navGuides?: string
    navMethods?: string
    version?: string
}

export class DocPageComponent extends MithrilComponent<DocPageAttrs> {
    view(vnode: Vnode<DocPageAttrs>) {
        const attrs = (vnode.attrs ?? {}) as DocPageAttrs
        if (!attrs.page) {
            return m('div', 'No page data')
        }
        return m(Layout as any, {
            page: attrs.page,
            pendingPage: attrs.pendingPage,
            onTransitionEnd: attrs.onTransitionEnd,
            routePath: attrs.routePath,
            navGuides: attrs.navGuides,
            navMethods: attrs.navMethods,
            version: attrs.version,
        })
    }
}
