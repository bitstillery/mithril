import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

import type {NavSection} from '../store'

interface NavSectionsAttrs {
    sections: NavSection[]
    routePath?: string
    pageToc?: string
}

const RouteLink = m.route.Link as any

function normalizePath(p: string): string {
    return (p || '/').replace(/\/$/, '') || '/'
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
        <a href={link.href} target='_blank' rel='noreferrer noopener'>
            {link.text}
        </a>
    ) : (
        <RouteLink href={path}>{link.text}</RouteLink>
    )
}

export class NavSections extends MithrilComponent<NavSectionsAttrs> {
    view(vnode: Vnode<NavSectionsAttrs>) {
        const {sections = [], routePath = '', pageToc} = vnode.attrs ?? {}
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
                                        m('div', {
                                            class: `docs-nav-link${active ? ' docs-nav-link--active' : ''}`,
                                        }, renderNavLink(link)),
                                    ]
                                    if (active && pageToc) {
                                        items.push(m('div', {class: 'docs-nav-page-toc'}, m.trust(pageToc)))
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
