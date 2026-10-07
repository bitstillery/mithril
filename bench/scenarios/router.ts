/**
 * Router, pathname/querystring helpers and component-level redraw benchmarks.
 */
import {bench, do_not_optimize} from 'mitata'
import domMock from '../../tests/helpers/dom_mock'
import renderFactory from '../../src/render/render'
import mountRedrawFactory from '../../src/mount_redraw'
import compileTemplate from '../../src/router/pathname/compile_template'
import decodeURIComponentSafe from '../../src/util/decode_uri_component_safe'
import censor from '../../src/util/censor'
import m from '../../src/index'

import type {ComponentVnode} from '../../src/render/vnode'

// A route table the size of a mid-sized app: static pages, params, a variadic catch-all last.
const routes = [
    '/',
    '/login',
    '/logout',
    '/signup',
    '/about',
    '/contact',
    '/pricing',
    '/docs',
    '/docs/:section',
    '/docs/:section/:page',
    '/blog',
    '/blog/:slug',
    '/blog/tag/:tag',
    '/users',
    '/users/new',
    '/users/:id',
    '/users/:id/edit',
    '/users/:id/posts',
    '/users/:id/posts/:postId',
    '/orders',
    '/orders/:id',
    '/orders/:id/invoice.:format',
    '/products',
    '/products/:category',
    '/products/:category/:id',
    '/cart',
    '/checkout',
    '/settings',
    '/settings/:tab',
    '/files/:path...',
]
const compiled = routes.map((route) => ({route, check: compileTemplate(route)}))

// Mirrors resolveRoute(): decode the URL, split off the query, then try each route in order.
function match(url: string) {
    const data = m.parsePathname(decodeURIComponentSafe(url))
    for (let i = 0; i < compiled.length; i++) {
        if (compiled[i]!.check(data)) return compiled[i]!.route
    }
    return null
}

bench('route-match static, late in 30 routes (/settings)', () => {
    do_not_optimize(match('/settings'))
})

bench('route-match params + query (/users/42/posts/7?tab=comments&page=2)', () => {
    do_not_optimize(match('/users/42/posts/7?tab=comments&page=2'))
})

bench('route-match variadic, last of 30 (/files/a/b/c.txt)', () => {
    do_not_optimize(match('/files/a/b/c.txt'))
})

const query = 'page=2&sort=name&dir=desc&q=hello%20world&archived=false&tags=red,green&filter[status]=active&ids[]=1&ids[]=2'
bench('parseQueryString (9 params, nested + array keys)', () => {
    do_not_optimize(m.parseQueryString(query))
})

const flatQuery = 'page=2&sort=name&dir=desc&q=hello%20world&archived=false&view=grid'
bench('parseQueryString (6 flat params)', () => {
    do_not_optimize(m.parseQueryString(flatQuery))
})

const queryParams = {
    page: 2,
    sort: 'name',
    dir: 'desc',
    q: 'hello world',
    archived: false,
    tags: ['red', 'green'],
    filter: {status: 'active', owner: 'me'},
}
bench('buildQueryString (7 params, array + object)', () => {
    do_not_optimize(m.buildQueryString(queryParams))
})

const pathParams = {id: 42, postId: 7, tab: 'comments'}
bench('buildPathname (2 path params + 1 query)', () => {
    do_not_optimize(m.buildPathname('/users/:id/posts/:postId', pathParams))
})

const noParams = {}
bench('buildPathname (static href, no params)', () => {
    do_not_optimize(m.buildPathname('/settings/profile', noParams))
})

bench('decodeURIComponentSafe (plain path)', () => {
    do_not_optimize(decodeURIComponentSafe('/users/42/posts/7?tab=comments&page=2'))
})

const linkAttrs = {href: '/users/:id', params: {id: 42}, class: 'nav-link', title: 'Profile', options: {replace: true}}
bench('censor (Link attrs with extras)', () => {
    do_not_optimize(censor(linkAttrs, ['options', 'params', 'selector', 'onclick', 'onafternavigate']))
})

// A nav bar redrawn with unchanged output: Link.view, buildPathname and the attr diff every time.
const $window = domMock()
const render = renderFactory()
const navRoot = $window.document.createElement('div')
const Nav = {
    view: () =>
        m(
            'nav',
            routes.slice(0, 20).map((href, i) => m(m.route.Link, {key: i, href, class: 'nav-link'}, href)),
        ),
}
render(navRoot, m(Nav))
bench('redraw nav (20 m.route.Link, unchanged)', () => {
    render(navRoot, m(Nav))
})

const ParamNav = {
    view: () =>
        m(
            'nav',
            Array.from({length: 20}, (_, i) =>
                m(m.route.Link, {key: i, href: '/users/:id/posts/:postId', params: {id: i, postId: 7}}, 'post'),
            ),
        ),
}
const paramNavRoot = $window.document.createElement('div')
render(paramNavRoot, m(ParamNav))
bench('redraw nav (20 m.route.Link with params, unchanged)', () => {
    render(paramNavRoot, m(ParamNav))
})

// Component-level redraws, as signals request them: one mounted component, and a few among siblings.
const mountRedraw = mountRedrawFactory(renderFactory(), (fn) => setTimeout(fn), console)
const mountRoot = $window.document.createElement('div')
let mountedText = 0
const Mounted = {view: () => m('div.counter', m('span', 'count'), m('b', mountedText))}
mountRedraw.mount(mountRoot, Mounted)
bench('redraw(component) of an m.mount component', () => {
    mountedText++
    mountRedraw.redraw(Mounted)
})

const siblingRoot = $window.document.createElement('div')
const siblingStates: object[] = []
let siblingTick = 0
const Sibling = {
    oninit(vnode: ComponentVnode<{i: number; key?: number}>) {
        siblingStates.push(vnode.state as object)
    },
    view: (vnode: ComponentVnode<{i: number; key?: number}>) => m('div.row', m('span', vnode.attrs.i), m('b', siblingTick)),
}
const siblingRender = renderFactory()
const siblingRedraw = mountRedrawFactory(siblingRender, (fn) => setTimeout(fn), console).redraw
siblingRender(
    siblingRoot,
    Array.from({length: 50}, (_, i) => m(Sibling, {key: i, i})),
    siblingRedraw,
)
// The targeted path only runs for elements attached to the document, which the DOM mock doesn't model.
for (const node of siblingRoot.childNodes as unknown as Array<Record<string, unknown>>) {
    node.isConnected = true
    node.parentElement = siblingRoot
}
const fiveSiblings = new Set(siblingStates.filter((_, i) => i % 10 === 3))
bench('redrawComponents (5 of 50 keyed siblings)', () => {
    siblingTick++
    siblingRedraw.redrawComponents!(fiveSiblings)
})
bench('redraw(state) (1 of 50 keyed siblings)', () => {
    siblingTick++
    siblingRedraw(siblingStates[25]!)
})
