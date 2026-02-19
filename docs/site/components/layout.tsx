import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {DocPage} from '../markdown'

import {CodeBlock} from './code-block'
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
                    <div>License: MIT. © Mithril Contributors. <a href='https://www.npmjs.com/package/@bitstillery/mithril'><img src='https://img.shields.io/npm/v/@bitstillery/mithril' alt='npm' /></a></div>
                    <div>
                        <a
                            href={`https://github.com/bitstillery/mithril/edit/main/docs/site/content/${path === '/' ? 'index' : (path ?? '').slice(1)}.md`}
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
    'parseQueryString',
    'buildQueryString',
    'buildPathname',
    'parsePathname',
    'trust',
    'fragment',
    'redraw',
    'censor',
    'signals',
    'state',
    'store',
    'ssr',
]

const HASH_NAV_DEBOUNCE_MS = 500

export class Layout extends MithrilComponent<LayoutAttrs> {
    activeAnchorId: string | null = null
    private scrollSpyRaf = 0
    private scrollSpyBound: (() => void) | null = null
    private lastHashChangeAt = 0

    oncreate(vnode: Vnode<LayoutAttrs>) {
        this.setupScrollSpy()
        this.highlightCode(vnode)
    }

    onupdate(vnode: Vnode<LayoutAttrs>) {
        this.setupScrollSpy()
        this.highlightCode(vnode)
    }

    onremove() {
        if (this.scrollSpyBound) {
            window.removeEventListener('scroll', this.scrollSpyBound)
        }
        window.removeEventListener('hashchange', this.hashChangeBound)
    }

    hashChangeBound = () => {
        this.lastHashChangeAt = Date.now()
        const hashId = window.location.hash.slice(1)
        if (this.activeAnchorId !== hashId) {
            this.activeAnchorId = hashId || null
            m.redraw()
        }
    }

    runScrollSpy = () => {
        if (this.scrollSpyRaf) return
        this.scrollSpyRaf = requestAnimationFrame(() => {
            this.scrollSpyRaf = 0
            if (Date.now() - this.lastHashChangeAt < HASH_NAV_DEBOUNCE_MS) return
            const mainEl = document.querySelector('main')
            if (!mainEl) return
            const headings = mainEl.querySelectorAll('.body h2[id], .body h3[id], .body h4[id]')
            if (headings.length === 0) return
            const viewportTop = 120
            let active: string | null = null
            for (let i = headings.length - 1; i >= 0; i--) {
                const el = headings[i] as HTMLElement
                if (el.getBoundingClientRect().top <= viewportTop) {
                    active = el.id
                    break
                }
            }
            if (!active && headings.length > 0) {
                for (let i = 0; i < headings.length; i++) {
                    const el = headings[i] as HTMLElement
                    if (el.getBoundingClientRect().top > viewportTop) {
                        active = (headings[Math.max(0, i - 1)] as HTMLElement).id
                        break
                    }
                }
                if (!active) {
                    active = (headings[headings.length - 1] as HTMLElement).id
                }
            }
            if (this.activeAnchorId !== active) {
                this.activeAnchorId = active
                const url = window.location.pathname + window.location.search + (active ? `#${active}` : '')
                history.replaceState(null, '', url)
                m.redraw()
            }
        })
    }

    setupScrollSpy() {
        if (typeof window === 'undefined') return
        if (!this.scrollSpyBound) {
            this.scrollSpyBound = () => this.runScrollSpy()
            window.addEventListener('scroll', this.scrollSpyBound)
            window.addEventListener('hashchange', this.hashChangeBound)
        }
        const hashId = window.location.hash.slice(1)
        if (hashId) {
            this.lastHashChangeAt = Date.now()
            this.activeAnchorId = hashId
            m.redraw()
        }
        this.runScrollSpy()
        setTimeout(() => this.runScrollSpy(), 150)
    }

    view(vnode: Vnode<LayoutAttrs>) {
        const attrs = (vnode.attrs ?? {}) as LayoutAttrs
        const {page, pendingPage, onTransitionEnd, navGuides = [], navMethods = [], version = '3.0.0-AA'} = attrs

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
                            {m(m.route.Link, {
                                href: '/',
                                class: !isApiPage && currentPath !== '/support' ? 'active' : undefined,
                            }, 'Guide')}
                            {m(m.route.Link, {
                                href: '/api',
                                class: isApiPage ? 'active' : undefined,
                            }, 'API')}
                            {m(m.route.Link, {
                                href: '/support',
                                class: currentPath === '/support' ? 'active' : undefined,
                            }, 'Support')}
                            <a href='https://github.com/bitstillery/mithril'>GitHub</a>
                        </nav>
                    </section>
                </header>
                <div class='docs-body'>
                    <DocsSidebar sections={navSections} pageToc={displayPage.pageToc} pageTocHeadings={displayPage.pageTocHeadings} routePath={currentPath} activeAnchorId={this.activeAnchorId} />
                    <main>{mainContent}</main>
                </div>
            </div>
        )
    }

    highlightCode(vnode: Vnode<LayoutAttrs>) {
        if (typeof window === 'undefined') return
        const bodies = document.querySelectorAll('.body')
        bodies.forEach((body) => {
            // Replace interactive js/jsx blocks with Sandbox (CodeMirror editor + preview)
            const sandboxBlocks = body.querySelectorAll(
                'pre code.language-js, pre code.language-javascript, pre code.language-jsx, pre code.language-tsx',
            )
            ;[].forEach.call(sandboxBlocks, (codeEl: HTMLElement) => {
                if (codeEl.closest('.docs-sandbox')) return
                const pre = codeEl.parentElement
                if (!pre) return
                const code = codeEl.textContent ?? ''
                const isJsx = codeEl.classList.contains('language-jsx') || codeEl.classList.contains('language-tsx')
                const lang = isJsx ? ('jsx' as const) : ('js' as const)
                const wrapper = document.createElement('div')
                pre.parentNode!.insertBefore(wrapper, pre)
                pre.remove()
                m.render(wrapper, m(Sandbox as any, {code, lang}))
            })

            // Replace static code blocks with CodeBlock (view-only CodeMirror, no line numbers)
            const staticBlocks = body.querySelectorAll('pre code[class*="language-"]')
            ;[].forEach.call(staticBlocks, (codeEl: HTMLElement) => {
                if (codeEl.closest('.docs-sandbox') || codeEl.closest('.docs-code-block')) return
                const isJs = codeEl.classList.contains('language-js') ||
                    codeEl.classList.contains('language-javascript') ||
                    codeEl.classList.contains('language-jsx') ||
                    codeEl.classList.contains('language-tsx')
                if (isJs) return
                const langMatch = codeEl.className.match(/language-(\w+)/)
                const lang = langMatch ? langMatch[1] : ''
                const pre = codeEl.parentElement
                if (!pre || !pre.parentNode) return
                const code = codeEl.textContent ?? ''
                const wrapper = document.createElement('div')
                pre.parentNode.insertBefore(wrapper, pre)
                pre.remove()
                m.render(wrapper, m(CodeBlock as any, {code, lang}))
            })
        })
    }
}
