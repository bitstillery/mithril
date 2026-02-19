import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

import {NavSections} from './nav-sections'

import type {NavSection} from '../store'

interface DocsSidebarAttrs {
    sections: NavSection[]
    pageToc?: string
    routePath?: string
}

/**
 * Left sidebar navigation for the docs site. Renders the site nav (Getting Started,
 * Resources, etc.) and optionally the page TOC in a fixed-width column that
 * aligns with the main content area.
 */
export class DocsSidebar extends MithrilComponent<DocsSidebarAttrs> {
    view(vnode: Vnode<DocsSidebarAttrs>) {
        const {sections = [], pageToc, routePath} = vnode.attrs ?? {}
        const hasContent = sections?.length
        if (!hasContent) return null
        return m(
            'aside',
            {class: 'docs-sidebar'},
            m(NavSections as any, {sections, routePath, pageToc}),
        )
    }
}
