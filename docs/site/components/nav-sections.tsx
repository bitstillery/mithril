import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

import type {NavSection} from '../store'

interface NavSectionsAttrs {
	sections: NavSection[]
}

function navLink(link: {text: string; href: string; external?: boolean}) {
	const path = link.href.startsWith('/') ? link.href : `/${link.href}`
	return link.external
		? m('a', {href: link.href, target: '_blank', rel: 'noreferrer noopener'}, link.text)
		: m(m.route.Link, {href: path}, link.text)
}

export class NavSections extends MithrilComponent<NavSectionsAttrs> {
	view(vnode: Vnode<NavSectionsAttrs>) {
		const {sections = []} = vnode.attrs ?? {}
		if (!sections?.length) return null
		return m(
			'ul',
			sections.map((section: NavSection) => {
				if (section.links.length === 0) {
					return m('li', section.title)
				}
				if (section.links.length === 1) {
					return m('li', navLink(section.links[0]))
				}
				return m('li', [
					section.title,
					m('ul', section.links.map((link) => m('li', navLink(link)))),
				])
			}),
		)
	}
}
