import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

import type {NavSection} from '../store'
import type {TocHeading} from '../markdown'

interface NavSectionsAttrs {
    sections: NavSection[]
    routePath?: string
    pageToc?: string
    pageTocHeadings?: TocHeading[]
    activeAnchorId?: string
    basePath?: string
}

const RouteLink = m.route.Link as any

function normalizePath(p: string): string {
    const path = (p || '/').split('#')[0]
    return path.replace(/\/$/, '') || '/'
}

function isLinkActive(linkHref: string, currentPath: string): boolean {
    if (!currentPath) return false
    const path = normalizePath(linkHref)
    const current = normalizePath(currentPath)
    if (path === '/') return current === '/'
    return current === path || current.startsWith(path + '/')
}

function renderNavLink(link: {text: string; href: string; external?: boolean}) {
    const path = link.href.startsWith('/') ? link.href : `/${link.href}`
    return link.external ? (
        <a href={link.href} target='_blank' rel='noreferrer noopener' class='docs-nav-link-external' title='Opens in new tab'>
            {link.text}
        </a>
    ) : (
        <RouteLink href={path}>{link.text}</RouteLink>
    )
}

export class NavSections extends MithrilComponent<NavSectionsAttrs> {
    view(vnode: Vnode<NavSectionsAttrs>) {
        const {sections = [], routePath = '', pageToc, pageTocHeadings, activeAnchorId, basePath} = vnode.attrs ?? {}
        if (!sections?.length) return null
        return (
            <div class='docs-nav-sections'>
                {sections.map((section: NavSection) => {
                    if (section.links.length === 0) {
                        return <div class='docs-nav-section-title'>{section.title}</div>
                    }
                    return (
                        <div class='docs-nav-section'>
                            <strong class='docs-nav-section-label'>{section.title}</strong>
                            <div class='docs-nav-links'>
                                {section.links.flatMap((link) => {
                                    const href = link.href.startsWith('/') ? link.href : `/${link.href}`
                                    const active = isLinkActive(href, routePath)
                                    const items: Vnode[] = [
                                        m(
                                            'div',
                                            {
                                                class: `docs-nav-link${active ? ' docs-nav-link--active' : ''}`,
                                            },
                                            renderNavLink(link),
                                        ),
                                    ]
                                    if (active && (pageToc || pageTocHeadings?.length)) {
                                        const toc =
                                            pageTocHeadings?.length && basePath
                                                ? m(
                                                      'ul',
                                                      {class: 'docs-sidebar-toc'},
                                                      pageTocHeadings.map((h) =>
                                                          m(
                                                              'li',
                                                              m(
                                                                  'a',
                                                                  {
                                                                      href: `${basePath}#${h.id}`,
                                                                      class:
                                                                          activeAnchorId === h.id ? 'docs-toc-link--active' : '',
                                                                  },
                                                                  h.raw,
                                                              ),
                                                          ),
                                                      ),
                                                  )
                                                : pageToc
                                                  ? m('div', {class: 'docs-nav-page-toc'}, m.trust(pageToc))
                                                  : null
                                        if (toc) items.push(m('div', {class: 'docs-nav-page-toc'}, toc))
                                    }
                                    return items
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
