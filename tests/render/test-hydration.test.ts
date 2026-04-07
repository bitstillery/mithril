// @ts-nocheck
/**
 * Hydration test suite: verifies that client-side rendering correctly reuses
 * server-rendered DOM. Covers positional adoption of elements, text nodes,
 * fragments, components, and SSR text-node merging.
 */
import {describe, test, expect, beforeEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFactory from '../../render/render'
import m from '../../render/hyperscript'
import mServer from '../../server'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** domMock elements lack `children`; Mithril hydration checks `children.length`. */
function shimChildren(el: any) {
    if (el == null || typeof el !== 'object') return
    if (el.nodeType === 1 && !Object.getOwnPropertyDescriptor(el, 'children')) {
        Object.defineProperty(el, 'children', {
            configurable: true,
            get() {
                return this.childNodes.filter((n: any) => n.nodeType === 1)
            },
        })
    }
}

/** Recursively add `children` getter to every element in the tree. */
function shimTree(el: any) {
    if (el == null || el.nodeType !== 1) return
    shimChildren(el)
    for (let i = 0; i < el.childNodes.length; i++) shimTree(el.childNodes[i])
}

/** Collect all text content (recursive). */
function textOf(el: any): string {
    let out = ''
    for (let i = 0; i < el.childNodes.length; i++) {
        const n = el.childNodes[i]
        if (n.nodeType === 3) out += n.nodeValue
        else if (n.nodeType === 1) out += textOf(n)
    }
    return out
}

/** Element children only. */
function elementsOf(el: any): any[] {
    return el.childNodes.filter((n: any) => n.nodeType === 1)
}

/** Find element by tag recursively (first match). */
function findByTag(el: any, tag: string): any {
    if (el.nodeType === 1) {
        const t = (el.tagName || el.nodeName || '').toLowerCase()
        if (t === tag) return el
    }
    for (let i = 0; i < (el.childNodes?.length ?? 0); i++) {
        const found = findByTag(el.childNodes[i], tag)
        if (found) return found
    }
    return null
}

/** Find element by class name recursively (first match). */
function findByClass(el: any, cls: string): any {
    if (el.nodeType === 1 && (el.className || '').split(' ').includes(cls)) return el
    for (let i = 0; i < (el.childNodes?.length ?? 0); i++) {
        const found = findByClass(el.childNodes[i], cls)
        if (found) return found
    }
    return null
}

/**
 * Render SSR HTML into `root` via `innerHTML`, shim the tree, and return the
 * render function. This simulates the browser receiving SSR markup before the
 * client JS hydrates.
 */
function prepareHydration($window: any, root: any, html: string) {
    root.innerHTML = html
    shimTree(root)
    return renderFactory($window)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('hydration', () => {
    let $window: any, root: any

    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        shimChildren(root)
    })

    // -----------------------------------------------------------------------
    // 1. Basic element reuse
    // -----------------------------------------------------------------------

    describe('element reuse', () => {
        test('reuses a single matching element', () => {
            const render = prepareHydration($window, root, '<div>hello</div>')
            const ssrDiv = root.childNodes[0]

            render(root, m('div', 'hello'))

            expect(elementsOf(root).length).toBe(1)
            expect(root.childNodes[0]).toBe(ssrDiv)
            expect(textOf(root)).toBe('hello')
        })

        test('reuses nested elements', () => {
            const render = prepareHydration($window, root, '<div><span>inner</span></div>')
            const ssrDiv = root.childNodes[0]
            const ssrSpan = ssrDiv.childNodes[0]

            render(root, m('div', m('span', 'inner')))

            expect(root.childNodes[0]).toBe(ssrDiv)
            expect(ssrDiv.childNodes[0]).toBe(ssrSpan)
            expect(textOf(root)).toBe('inner')
        })

        test('reuses multiple sibling elements', () => {
            const render = prepareHydration(
                $window,
                root,
                '<div class="a">one</div><div class="b">two</div><div class="c">three</div>',
            )
            const [a, b, c] = [root.childNodes[0], root.childNodes[1], root.childNodes[2]]

            render(root, [m('div.a', 'one'), m('div.b', 'two'), m('div.c', 'three')])

            expect(root.childNodes[0]).toBe(a)
            expect(root.childNodes[1]).toBe(b)
            expect(root.childNodes[2]).toBe(c)
        })

        test('updates attributes on reused elements', () => {
            const render = prepareHydration($window, root, '<div class="server" id="x">hi</div>')

            render(root, m('div', {class: 'client', id: 'y'}, 'hi'))

            const el = elementsOf(root)[0]
            expect(el.className).toBe('client')
            expect(el.getAttribute('id')).toBe('y')
        })
    })

    // -----------------------------------------------------------------------
    // 2. Text node handling
    // -----------------------------------------------------------------------

    describe('text nodes', () => {
        test('reuses a single text node', () => {
            const render = prepareHydration($window, root, '<p>hello</p>')
            const p = root.childNodes[0]
            const ssrText = p.childNodes[0]

            render(root, m('p', 'hello'))

            expect(p.childNodes[0]).toBe(ssrText)
            expect(textOf(p)).toBe('hello')
        })

        test('patches text content when value differs', () => {
            const render = prepareHydration($window, root, '<p>server</p>')

            render(root, m('p', 'client'))

            expect(textOf(root)).toBe('client')
        })

        test('handles adjacent text vnodes from a single SSR text node (text splitting)', () => {
            // SSR output: <blockquote>"hello world"</blockquote>
            // The browser parses this as ONE text node: `\u201Chello world\u201D`
            // Client vnode tree has THREE text children: `\u201C`, `hello world`, `\u201D`
            const render = prepareHydration($window, root, '<blockquote>\u201Chello world\u201D</blockquote>')
            const bq = root.childNodes[0]
            expect(bq.childNodes.length).toBe(1) // single merged text node

            render(root, m('blockquote', ['\u201C', 'hello world', '\u201D']))

            // After hydration: content must match, no duplication
            expect(textOf(bq)).toBe('\u201Chello world\u201D')
        })

        test('does not duplicate text when SSR has merged adjacent text nodes', () => {
            // This is the bug that caused "1,500+1,500+" in the portal
            const render = prepareHydration($window, root, '<span>1,500+</span>')
            const span = root.childNodes[0]

            render(root, m('span', '1,500+'))

            expect(textOf(span)).toBe('1,500+')
            // Must not have duplicate text nodes
            expect(span.childNodes.length).toBe(1)
        })

        test('handles number children as text', () => {
            const render = prepareHydration($window, root, '<span>42</span>')

            render(root, m('span', 42))

            expect(textOf(root)).toBe('42')
        })
    })

    // -----------------------------------------------------------------------
    // 3. Fragment hydration
    // -----------------------------------------------------------------------

    describe('fragments', () => {
        test('hydrates a top-level fragment (array return)', () => {
            const render = prepareHydration($window, root, '<div class="a">one</div><div class="b">two</div>')
            const [a, b] = [root.childNodes[0], root.childNodes[1]]

            render(root, [m('div.a', 'one'), m('div.b', 'two')])

            expect(root.childNodes[0]).toBe(a)
            expect(root.childNodes[1]).toBe(b)
        })

        test('hydrates keyed fragment children', () => {
            const render = prepareHydration($window, root, '<div class="x">x</div><div class="y">y</div><div class="z">z</div>')

            render(root, [m('div.x', {key: 1}, 'x'), m('div.y', {key: 2}, 'y'), m('div.z', {key: 3}, 'z')])

            expect(elementsOf(root).length).toBe(3)
            expect(textOf(root)).toBe('xyz')
        })

        test('fragment inside element (component returning array)', () => {
            // Simulates LayoutPortal returning [div.main, div.notifications, VersionChecker]
            const render = prepareHydration(
                $window,
                root,
                '<section><div class="main">main</div><div class="notif">notif</div></section>',
            )
            const section = root.childNodes[0]
            const mainDiv = section.childNodes[0]
            const notifDiv = section.childNodes[1]

            const Layout = {
                view: () => m('section', [m('div.main', 'main'), m('div.notif', 'notif')]),
            }

            render(root, m(Layout))

            expect(root.childNodes[0]).toBe(section)
            expect(section.childNodes[0]).toBe(mainDiv)
            expect(section.childNodes[1]).toBe(notifDiv)
        })
    })

    // -----------------------------------------------------------------------
    // 4. Component hydration
    // -----------------------------------------------------------------------

    describe('components', () => {
        test('component reuses SSR element', () => {
            const render = prepareHydration($window, root, '<div class="comp">content</div>')
            const ssrDiv = root.childNodes[0]

            const Comp = {view: () => m('div.comp', 'content')}
            render(root, m(Comp))

            expect(root.childNodes[0]).toBe(ssrDiv)
            expect(textOf(root)).toBe('content')
        })

        test('nested components reuse DOM', () => {
            const render = prepareHydration($window, root, '<div class="outer"><span class="inner">deep</span></div>')
            const outerDiv = root.childNodes[0]
            const innerSpan = outerDiv.childNodes[0]

            const Inner = {view: () => m('span.inner', 'deep')}
            const Outer = {view: () => m('div.outer', m(Inner))}
            render(root, m(Outer))

            expect(root.childNodes[0]).toBe(outerDiv)
            expect(outerDiv.childNodes[0]).toBe(innerSpan)
        })

        test('component returning array (fragment) reuses SSR DOM', () => {
            // This is the LayoutPortal pattern: component view returns an array
            const render = prepareHydration($window, root, '<div class="main">content</div><div class="aside">sidebar</div>')
            const mainDiv = root.childNodes[0]
            const asideDiv = root.childNodes[1]

            const Layout = {
                view: () => [m('div.main', 'content'), m('div.aside', 'sidebar')],
            }
            render(root, m(Layout))

            expect(root.childNodes[0]).toBe(mainDiv)
            expect(root.childNodes[1]).toBe(asideDiv)
            expect(elementsOf(root).length).toBe(2)
        })

        test('component with keyed array return reuses SSR DOM', () => {
            const render = prepareHydration(
                $window,
                root,
                '<div class="main">main</div><div class="notif">notifications</div><div class="ver">version</div>',
            )
            const [main, notif, ver] = [root.childNodes[0], root.childNodes[1], root.childNodes[2]]

            const Layout = {
                view: () => [
                    m('div.main', {key: 'main'}, 'main'),
                    m('div.notif', {key: 'notif'}, 'notifications'),
                    m('div.ver', {key: 'ver'}, 'version'),
                ],
            }
            render(root, m(Layout))

            expect(root.childNodes[0]).toBe(main)
            expect(root.childNodes[1]).toBe(notif)
            expect(root.childNodes[2]).toBe(ver)
        })

        test('oninit is called during hydration', () => {
            const render = prepareHydration($window, root, '<div>hello</div>')
            let called = false

            const Comp = {
                oninit: () => {
                    called = true
                },
                view: () => m('div', 'hello'),
            }
            render(root, m(Comp))

            expect(called).toBe(true)
        })

        test('oncreate is called during hydration', () => {
            const render = prepareHydration($window, root, '<div>hello</div>')
            let called = false

            const Comp = {
                oncreate: () => {
                    called = true
                },
                view: () => m('div', 'hello'),
            }
            render(root, m(Comp))

            expect(called).toBe(true)
        })
    })

    // -----------------------------------------------------------------------
    // 5. Complex real-world patterns
    // -----------------------------------------------------------------------

    describe('real-world patterns', () => {
        test('layout wrapping a page component (RouteResolver pattern)', () => {
            // SSR produces: <div id="layout"><span id="page">page text</span></div>
            const render = prepareHydration($window, root, '<div id="layout"><span id="page">page text</span></div>')
            const layoutEl = root.childNodes[0]
            const pageEl = layoutEl.childNodes[0]

            const Page = {view: () => m('span', {id: 'page'}, 'page text')}
            const Layout = {view: (vnode) => m('div', {id: 'layout'}, vnode.children)}
            const resolver = {
                render: (vnode) => m(Layout, {}, vnode),
            }
            const pageVnode = m(Page)
            render(root, resolver.render(pageVnode))

            expect(root.childNodes[0]).toBe(layoutEl)
            expect(layoutEl.childNodes[0]).toBe(pageEl)
            expect(textOf(root)).toBe('page text')
        })

        test('conditional content (logged in vs anonymous)', () => {
            // SSR renders the anonymous view
            const render = prepareHydration($window, root, '<div class="page"><h1>Welcome</h1><p>Please log in</p></div>')

            // Client also renders anonymous view (same content)
            const isLoggedIn = false
            render(
                root,
                m('div.page', [m('h1', 'Welcome'), isLoggedIn ? m('div.dashboard', 'Dashboard') : m('p', 'Please log in')]),
            )

            expect(textOf(findByTag(root, 'h1'))).toBe('Welcome')
            expect(textOf(findByTag(root, 'p'))).toBe('Please log in')
        })

        test('list of items with mixed text and elements', () => {
            const render = prepareHydration($window, root, '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>')
            const ul = root.childNodes[0]
            const lis = elementsOf(ul)

            render(root, m('ul', [m('li', 'Item 1'), m('li', 'Item 2'), m('li', 'Item 3')]))

            expect(elementsOf(ul).length).toBe(3)
            expect(ul.childNodes[0]).toBe(lis[0])
            expect(ul.childNodes[1]).toBe(lis[1])
            expect(ul.childNodes[2]).toBe(lis[2])
        })

        test('deeply nested component tree', () => {
            const render = prepareHydration(
                $window,
                root,
                '<div class="a"><div class="b"><div class="c"><span>leaf</span></div></div></div>',
            )
            const a = root.childNodes[0]
            const b = a.childNodes[0]
            const c = b.childNodes[0]
            const span = c.childNodes[0]

            const C = {view: () => m('div.c', m('span', 'leaf'))}
            const B = {view: () => m('div.b', m(C))}
            const A = {view: () => m('div.a', m(B))}
            render(root, m(A))

            expect(root.childNodes[0]).toBe(a)
            expect(a.childNodes[0]).toBe(b)
            expect(b.childNodes[0]).toBe(c)
            expect(c.childNodes[0]).toBe(span)
            expect(textOf(span)).toBe('leaf')
        })

        test('element with mixed element and text children', () => {
            // <p>Hello <strong>world</strong> today</p>
            // SSR: one text "Hello ", one <strong>, one text " today"
            const render = prepareHydration($window, root, '<p>Hello <strong>world</strong> today</p>')
            const p = root.childNodes[0]

            render(root, m('p', ['Hello ', m('strong', 'world'), ' today']))

            expect(textOf(p)).toBe('Hello world today')
            expect(findByTag(p, 'strong')).not.toBeNull()
            expect(textOf(findByTag(p, 'strong'))).toBe('world')
        })

        test('component with empty view during hydration', () => {
            const render = prepareHydration($window, root, '<div>placeholder</div>')

            const Empty = {view: () => null}
            // Should not throw
            expect(() => render(root, m(Empty))).not.toThrow()
        })
    })

    // -----------------------------------------------------------------------
    // 6. SSR → client round-trip (using renderToString + hydrate)
    // -----------------------------------------------------------------------

    describe('SSR round-trip', () => {
        test('simple element survives SSR → hydration', async () => {
            const vnode = m('div', {id: 'app'}, m('h1', 'Hello'))
            const result = await mServer.renderToString(vnode)
            const html = typeof result === 'string' ? result : result.html

            const render = prepareHydration($window, root, html)
            render(root, m('div', {id: 'app'}, m('h1', 'Hello')))

            expect(elementsOf(root).length).toBe(1)
            expect(textOf(findByTag(root, 'h1'))).toBe('Hello')
        })

        test('component survives SSR → hydration', async () => {
            const Card = {
                view: (vnode) => m('div.card', [m('h2', vnode.attrs.title), m('p', vnode.attrs.body)]),
            }
            const ssrVnode = m(Card, {title: 'Title', body: 'Body text'})
            const result = await mServer.renderToString(ssrVnode)
            const html = typeof result === 'string' ? result : result.html

            const render = prepareHydration($window, root, html)
            render(root, m(Card, {title: 'Title', body: 'Body text'}))

            expect(textOf(findByTag(root, 'h2'))).toBe('Title')
            expect(textOf(findByTag(root, 'p'))).toBe('Body text')
        })

        test('adjacent text runs survive SSR → hydration without duplication', async () => {
            const Quote = {
                view: (vnode) => m('blockquote', ['\u201C', vnode.attrs.text, '\u201D']),
            }
            const ssrVnode = m(Quote, {text: 'Be yourself'})
            const result = await mServer.renderToString(ssrVnode)
            const html = typeof result === 'string' ? result : result.html

            const render = prepareHydration($window, root, html)
            render(root, m(Quote, {text: 'Be yourself'}))

            const bq = findByTag(root, 'blockquote')
            expect(textOf(bq)).toBe('\u201CBe yourself\u201D')
        })

        test('layout + page round-trip preserves DOM', async () => {
            const Page = {view: () => m('main', m('p', 'page content'))}
            const Layout = {
                view: (vnode) => [m('header', 'header'), m('div.content', vnode.children), m('footer', 'footer')],
            }
            const tree = m(Layout, {}, m(Page))
            const result = await mServer.renderToString(tree)
            const html = typeof result === 'string' ? result : result.html

            const render = prepareHydration($window, root, html)
            render(root, m(Layout, {}, m(Page)))

            expect(findByTag(root, 'header')).not.toBeNull()
            expect(findByTag(root, 'footer')).not.toBeNull()
            expect(textOf(findByTag(root, 'p'))).toBe('page content')
        })

        test('component returning keyed array round-trip', async () => {
            const Multi = {
                view: () => [
                    m('div', {key: 'a', class: 'a'}, 'alpha'),
                    m('div', {key: 'b', class: 'b'}, 'beta'),
                    m('div', {key: 'c', class: 'c'}, 'gamma'),
                ],
            }
            const result = await mServer.renderToString(m(Multi))
            const html = typeof result === 'string' ? result : result.html

            const render = prepareHydration($window, root, html)
            render(root, m(Multi))

            expect(elementsOf(root).length).toBe(3)
            expect(textOf(findByClass(root, 'a'))).toBe('alpha')
            expect(textOf(findByClass(root, 'b'))).toBe('beta')
            expect(textOf(findByClass(root, 'c'))).toBe('gamma')
        })
    })

    // -----------------------------------------------------------------------
    // 7. Subsequent renders after hydration (update cycle)
    // -----------------------------------------------------------------------

    describe('post-hydration updates', () => {
        test('update after hydration works normally', () => {
            const render = prepareHydration($window, root, '<div>initial</div>')

            render(root, m('div', 'initial'))
            expect(textOf(root)).toBe('initial')

            // Second render is a normal update (not hydration)
            render(root, m('div', 'updated'))
            expect(textOf(root)).toBe('updated')
        })

        test('adding children after hydration', () => {
            const render = prepareHydration($window, root, '<ul><li>one</li></ul>')

            render(root, m('ul', [m('li', 'one')]))
            expect(elementsOf(findByTag(root, 'ul')).length).toBe(1)

            render(root, m('ul', [m('li', 'one'), m('li', 'two')]))
            expect(elementsOf(findByTag(root, 'ul')).length).toBe(2)
        })

        test('removing children after hydration', () => {
            const render = prepareHydration($window, root, '<ul><li>one</li><li>two</li><li>three</li></ul>')

            render(root, m('ul', [m('li', 'one'), m('li', 'two'), m('li', 'three')]))
            expect(elementsOf(findByTag(root, 'ul')).length).toBe(3)

            render(root, m('ul', [m('li', 'one')]))
            expect(elementsOf(findByTag(root, 'ul')).length).toBe(1)
        })

        test('component state persists through update after hydration', () => {
            const render = prepareHydration($window, root, '<div>0</div>')
            let count = 0

            const Counter = {
                view: () => m('div', String(count)),
            }

            render(root, m(Counter))
            expect(textOf(root)).toBe('0')

            count = 5
            render(root, m(Counter))
            expect(textOf(root)).toBe('5')
        })
    })

    // -----------------------------------------------------------------------
    // 8. Edge cases & regression guards
    // -----------------------------------------------------------------------

    describe('edge cases', () => {
        test('empty root does not trigger hydration', () => {
            const render = renderFactory($window)
            shimChildren(root)

            render(root, m('div', 'fresh'))

            expect(textOf(root)).toBe('fresh')
        })

        test('whitespace text nodes between elements are tolerated', () => {
            // Browsers often insert whitespace text nodes between elements
            const render = prepareHydration($window, root, '<div class="a">a</div> <div class="b">b</div>')

            render(root, [m('div.a', 'a'), m('div.b', 'b')])

            expect(elementsOf(root).length).toBe(2)
            expect(textOf(findByClass(root, 'a'))).toBe('a')
            expect(textOf(findByClass(root, 'b'))).toBe('b')
        })

        test('null/undefined children in vnode array', () => {
            const render = prepareHydration($window, root, '<div>text</div>')

            expect(() => render(root, [null, m('div', 'text'), undefined])).not.toThrow()
            expect(elementsOf(root).length).toBe(1)
        })

        test('boolean children are ignored', () => {
            const render = prepareHydration($window, root, '<div>hello</div>')

            render(root, m('div', [false, 'hello', true]))

            expect(textOf(root)).toBe('hello')
        })

        test('tag mismatch is handled without throwing', () => {
            // SSR has <span>, client expects <div> — a genuine mismatch.
            // The mismatch-recovery path (tested in test-ssr-hydration-mismatch)
            // handles cleanup; here we just verify it doesn't throw.
            const render = prepareHydration($window, root, '<span>content</span>')

            expect(() => render(root, m('div', 'content'))).not.toThrow()
        })

        test('extra SSR children are cleaned up', () => {
            // SSR has more children than client expects
            const render = prepareHydration($window, root, '<div><p>keep</p><p>remove me</p></div>')

            render(root, m('div', m('p', 'keep')))

            const div = elementsOf(root)[0]
            expect(elementsOf(div).length).toBe(1)
            expect(textOf(div)).toBe('keep')
        })

        test('fewer SSR children than client expects', () => {
            const render = prepareHydration($window, root, '<div><p>one</p></div>')

            render(root, m('div', [m('p', 'one'), m('p', 'two')]))

            const div = elementsOf(root)[0]
            expect(elementsOf(div).length).toBe(2)
            expect(textOf(div)).toContain('one')
            expect(textOf(div)).toContain('two')
        })
    })
})
