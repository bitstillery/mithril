import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

import type {NavSection} from '../store'

interface NavSectionsAttrs {
    sections: NavSection[]
}

const RouteLink = m.route.Link as any

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
        const {sections = []} = vnode.attrs ?? {}
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
                                {section.links.map((link) => (
                                    <div class='docs-nav-link'>{renderNavLink(link)}</div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
