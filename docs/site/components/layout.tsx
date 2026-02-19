import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {DocPage} from '../markdown'

import {DocsSidebar} from './docs-sidebar'
import {Sandbox} from './sandbox'

import type {NavSection} from '../store'

interface LayoutAttrs {
    page: DocPage
    pendingPage?: DocPage
    onTransitionEnd?: () => void
    routePath?: string
    navGuides?: NavSection[]
    navMethods?: NavSection[]
    version?: string
}

/** Wraps body content and prevents re-patching when path and content are unchanged.
 * This preserves Sandbox DOM (including user edits and preview iframes) during redraws. */
const BodyContentWrapper = {
    onbeforeupdate(
        vnode: Vnode<{page: DocPage; path: string; extraClass: string}>,
        old: Vnode<{page: DocPage; path: string; extraClass: string}>,
    ) {
        const oa = old?.attrs
        if (!oa) return true
        const {path, page} = vnode.attrs ?? {}
        const {path: oldPath, page: oldPage} = oa
        if (path !== oldPath) return true
        if (page?.content !== oldPage?.content) return true
        return false
    },
    view(vnode: Vnode<{page: DocPage; path: string; extraClass: string}>) {
        const {page = {} as DocPage, path = '', extraClass = ''} = vnode.attrs ?? {}
        return (
            <div class={`body ${extraClass}`} key={path}>
                {m.trust(page?.content ?? '')}
                <div class='footer'>
                    <div>License: MIT. © Mithril Contributors.</div>
                    <div>
                        <a
                            href={`https://github.com/MithrilJS/docs/edit/main/docs/${path === '/' ? 'index' : (path ?? '').slice(1)}.md`}
                        >
                            Edit
                        </a>
                    </div>
                </div>
            </div>
        )
    },
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
        const attrs = (vnode.attrs ?? {}) as LayoutAttrs
        const {page, pendingPage, onTransitionEnd, navGuides = [], navMethods = [], version = '2.3.8'} = attrs

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

        ;(globalThis as any).m = m

        const isApiPage = currentPath.startsWith('/api') || apiPagePatterns.some((p) => currentPath.includes(p))
        const navSections = isApiPage ? navMethods : navGuides
        const displayPage = pendingPage ?? page
        const isCrossfade = !!pendingPage

        const bodyContent = (p: DocPage, path: string, extraClass: string) =>
            m(BodyContentWrapper as any, {page: p, path, extraClass})

        const mainContent = isCrossfade ? (
            <div
                class='body-crossfade'
                oncreate={(vnode: any) => {
                    const el = vnode.dom.querySelector('.body-next')
                    if (el && onTransitionEnd) {
                        el.addEventListener('animationend', onTransitionEnd, {once: true})
                    }
                }}
            >
                {bodyContent(page, currentPath, 'body-current')}
                {bodyContent(pendingPage!, currentPath, 'body-next')}
            </div>
        ) : (
            bodyContent(page, currentPath, '')
        )

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
                    <DocsSidebar sections={navSections} pageToc={displayPage.pageToc} />
                    <main>{mainContent}</main>
                </div>
            </div>
        )
    }

    oncreate(vnode: Vnode<LayoutAttrs>) {
        this.highlightCode(vnode)
    }

    onupdate(vnode: Vnode<LayoutAttrs>) {
        this.highlightCode(vnode)
    }

    highlightCode(vnode: Vnode<LayoutAttrs>) {
        if (typeof window === 'undefined') return
        const bodies = document.querySelectorAll('.body')
        bodies.forEach((body) => {
            if (typeof (globalThis as any).Prism !== 'undefined') {
                ;(globalThis as any).Prism.highlightAllUnder(body)
            }

            const blocks = body.querySelectorAll('pre code.language-js, pre code.language-javascript, pre code.language-jsx')
            ;[].forEach.call(blocks, (codeEl: HTMLElement) => {
                if (codeEl.closest('.docs-sandbox')) return
                const pre = codeEl.parentElement
                if (!pre) return
                const code = codeEl.textContent ?? ''
                const lang = codeEl.classList.contains('language-jsx') ? ('jsx' as const) : ('js' as const)
                const wrapper = document.createElement('div')
                pre.parentNode!.insertBefore(wrapper, pre)
                pre.remove()
                m.render(wrapper, m(Sandbox as any, {code, lang}))
            })
        })
    }
}
