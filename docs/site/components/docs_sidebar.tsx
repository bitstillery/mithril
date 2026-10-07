import {MithrilComponent} from '../../../src/index'
import type {Vnode} from '../../../src/index'
import m from '../../../src/index'

import {NavSections} from './nav_sections'

import type {NavSection} from '../store'

interface DocsSidebarAttrs {
    sections: NavSection[]
    pageToc?: string | undefined
    pageTocHeadings?: Array<{id: string; raw: string}> | undefined
    routePath?: string | undefined
    activeAnchorId?: string | undefined
}

/**
 * Left sidebar navigation for the docs site. Renders the site nav (Getting Started,
 * Resources, etc.) and optionally the page TOC in a fixed-width column that
 * aligns with the main content area.
 */
export class DocsSidebar extends MithrilComponent<DocsSidebarAttrs> {
    view(vnode: Vnode<DocsSidebarAttrs>) {
        const {sections = [], pageToc, pageTocHeadings, routePath, activeAnchorId} = vnode.attrs ?? {}
        const hasContent = sections?.length
        if (!hasContent) return null
        const basePath = routePath ? routePath.split('#')[0] || '/' : '/'
        return m(
            'div',
            {class: 'docs-sidebar-wrapper'},
            m(
                'aside',
                {class: 'docs-sidebar'},
                m(NavSections as any, {sections, routePath, pageToc, pageTocHeadings, activeAnchorId, basePath}),
            ),
        )
    }
}
