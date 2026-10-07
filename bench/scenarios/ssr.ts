/**
 * Server-side rendering and SSR state serialization benchmarks.
 */
import {bench} from 'mitata'

import {serializeStore, deserializeStore, serializeAllStates} from '../../src/ssr/serialize'
import {state, clearStateRegistry, registerState} from '../../src/state/state'

import type {ComponentVnode} from '../../src/render/vnode'

const noop = () => {}

// The server entry logs a banner on import; keep it out of the benchmark output.
const log = console.log
console.log = noop
const {default: mServer, createSSRResponse} = await import('../../src/server')
console.log = log

clearStateRegistry()

const m = mServer

interface Row {
    id: number
    name: string
    price: number
    inStock: boolean
    tags: string[]
}

const rows: Row[] = Array.from({length: 30}, (_, i) => ({
    id: i,
    name: `Product <${i}> & "friends"`,
    price: 10 + i * 1.5,
    inStock: i % 3 !== 0,
    tags: ['new', i % 2 ? 'sale' : 'regular'],
}))

const NavLink = {
    view: (vnode: ComponentVnode<{key?: string; href: string; active: boolean}>) =>
        m('li.nav-item', {className: vnode.attrs.active ? 'active' : ''}, [
            m('a', {href: vnode.attrs.href, onclick: noop, 'data-nav': vnode.attrs.href}, vnode.children),
        ]),
}

const ProductRow = {
    view: (vnode: ComponentVnode<{key?: number; row: Row}>) => {
        const row = vnode.attrs.row
        return m('tr.product', {key: row.id, class: row.inStock ? 'in-stock' : 'sold-out', 'data-id': row.id}, [
            m('td.name', {title: row.name}, row.name),
            m(
                'td.price',
                {style: {textAlign: 'right', fontWeight: row.inStock ? 'bold' : 'normal'}},
                `€ ${row.price.toFixed(2)}`,
            ),
            m(
                'td.tags',
                row.tags.map((tag) => m('span.tag', {key: tag}, tag)),
            ),
            m('td.actions', [
                m('input[type=checkbox]', {checked: row.inStock, disabled: !row.inStock, onchange: noop}),
                m('button.btn', {type: 'button', onclick: noop, 'aria-label': `Add ${row.name}`}, 'Add'),
            ]),
        ])
    },
}

const Page = {
    view: () =>
        m('.layout', {id: 'page'}, [
            m('header.top', [
                m('img.logo', {src: '/logo.svg', alt: 'Logo & co'}),
                m(
                    'ul.nav',
                    ['/', '/shop', '/about', '/contact'].map((href, i) =>
                        m(NavLink, {key: href, href, active: i === 1}, `Link ${i}`),
                    ),
                ),
            ]),
            m('main.content', [
                m('h1', 'Products & <offers>'),
                m('p.intro', 'Prices include VAT. "Sale" items ship within 2 days.'),
                m('table.products', [
                    m(
                        'thead',
                        m(
                            'tr',
                            ['Name', 'Price', 'Tags', ''].map((h) => m('th', h)),
                        ),
                    ),
                    m(
                        'tbody',
                        rows.map((row) => m(ProductRow, {key: row.id, row})),
                    ),
                ]),
                m.trust('<hr>'),
            ]),
            m('footer', [m('br'), m('small', '© 2026 <example>')]),
        ]),
}

bench('ssr renderToString (page, ~400 vnodes)', async () => {
    await mServer.renderToString(m(Page))
})

bench('ssr renderToStringSync (page, ~400 vnodes)', () => {
    mServer.renderToStringSync(m(Page))
})

function storeShape() {
    return {
        user: {id: 7, name: 'Ada', email: 'ada@example.org', roles: ['admin', 'editor'], prefs: {theme: 'dark', lang: 'en'}},
        products: Array.from({length: 100}, (_, i) => ({
            id: i,
            name: `Product ${i}`,
            price: i * 2.5,
            tags: ['a', 'b', 'c'],
            meta: {created: '2026-01-01', stock: i % 7, flags: {featured: i % 5 === 0}},
        })),
        lookup: {} as Record<string, unknown>,
        filters: {query: '', page: 1, sort: 'name', categories: [1, 2, 3]},
        total: function (this: {products: {price: number}[]}) {
            return this.products.length
        },
    }
}

const store = state(storeShape())
for (let i = 0; i < 20; i++) store.lookup[`/path/${i}`] = {title: `Page ${i}`, items: [i, i + 1]}
const serialized = serializeStore(store)

bench('ssr serializeStore (store, 100 products)', () => {
    serializeStore(store)
})

const hydrateTarget = state(storeShape())
bench('ssr deserializeStore (store, 100 products)', () => {
    deserializeStore(hydrateTarget, serialized)
})

clearStateRegistry()
for (let i = 0; i < 5; i++) {
    const s = state({
        id: i,
        items: Array.from({length: 20}, (_, j) => ({id: j, label: `item ${j}`, done: j % 2 === 0})),
        settings: {open: false, size: 'm', nested: {depth: 2, list: ['x', 'y']}},
    })
    registerState(`module${i}`, s, {})
}

bench('ssr serializeAllStates (5 states x 20 items)', () => {
    serializeAllStates()
})

const template =
    '<!doctype html><html><head><meta charset="utf-8"><title>App</title><link rel="stylesheet" href="/app.css"></head>' +
    '<body><div id="app"></div><script type="module" src="/app.js"></script></body></html>'
const ssrOptions = {
    routes: {'/shop': Page},
    createRequestContext: () => ({stateRegistry: new Map()}),
    initRequestContext: (context: {stateRegistry: Map<string, unknown>}) => {
        registerState('page', state({rows: rows.slice(0, 10)}), {})
        void context
    },
    getHtmlTemplate: () => Promise.resolve(template),
}
const request = new Request('http://localhost/shop')

bench('ssr createSSRResponse (page + state + template)', async () => {
    console.log = noop
    try {
        await createSSRResponse('/shop', request, ssrOptions)
    } finally {
        console.log = log
    }
})
