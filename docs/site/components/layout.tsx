import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {DocPage} from '../markdown'

import {DocsSidebar} from './docs-sidebar'
import {Sandbox} from './sandbox'

import type {NavSection} from '../store'

interface LayoutAttrs {
    page: DocPage
    routePath?: string
    navGuides?: NavSection[]
    navMethods?: NavSection[]
    version?: string
}

const apiPagePatterns = [
    'hyperscript',
    'render',
    'mount',
    'route',
    'request',
    'parseQueryString',
    'buildQueryString',
    'buildPathname',
    'parsePathname',
    'trust',
    'fragment',
    'redraw',
    'censor',
    'stream',
]

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

        globalThis.m = m
        console.log('M', m)

        const isApiPage = currentPath.startsWith('/api') || apiPagePatterns.some((p) => currentPath.includes(p))
        const navSections = isApiPage ? navMethods : navGuides

        return (
            <div class='docs-container'>
                <header>
                    <section class='header-section'>
                        <div class='header-brand'>
                            <a class='hamburger' href='javascript:;'>
                                ≡
                            </a>
                            <h1>
                                <img src='/logo.svg' alt='Mithril' />
                                Mithril <span class='version'>v{version}</span>
                            </h1>
                        </div>
                        <nav>
                            {m(m.route.Link, {href: '/'}, 'Guide')}
                            {m(m.route.Link, {href: '/api'}, 'API')}
                            <a href='https://mithril.zulipchat.com/'>Chat</a>
                            <a href='https://github.com/MithrilJS/mithril.js'>GitHub</a>
                        </nav>
                    </section>
                </header>
                <div class='docs-body'>
                    {m(DocsSidebar as any, {sections: navSections, pageToc: page.pageToc})}
                    <main>
                        <div class='body'>
                            {m.trust(page.content)}
                            <div class='footer'>
                                <div>License: MIT. © Mithril Contributors.</div>
                                <div>
                                    <a
                                        href={`https://github.com/MithrilJS/docs/edit/main/docs/${currentPath === '/' ? 'index' : currentPath.slice(1)}.md`}
                                    >
                                        Edit
                                    </a>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    oncreate(vnode: Vnode<LayoutAttrs>) {
        this.highlightCode()
    }

    onupdate(vnode: Vnode<LayoutAttrs>) {
        this.highlightCode()
    }

    highlightCode() {
        if (typeof window === 'undefined') return
        const body = document.querySelector('.body')
        if (!body) return

        if (typeof (globalThis as any).Prism !== 'undefined') {
            ;(globalThis as any).Prism.highlightAllUnder(body)
        }

        // Wrap JS code blocks in Sandbox component (live preview to be added later)
        const blocks = body.querySelectorAll('pre code.language-js, pre code.language-javascript')
        ;[].forEach.call(blocks, (codeEl: HTMLElement) => {
            const pre = codeEl.parentElement
            if (!pre) return
            const html = pre.outerHTML
            const wrapper = document.createElement('div')
            pre.parentNode!.insertBefore(wrapper, pre)
            pre.remove()
            m.render(wrapper, m(Sandbox as any, {content: html}))
        })
    }
}
