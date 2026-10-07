/**
 * An app-shaped redraw: many small components whose views read state and render elements with a
 * handful of attrs, an event handler and text. Measures what a no-op redraw of a real page costs.
 */
import {bench} from 'mitata'
import domMock from '../../tests/helpers/dom_mock'
import m, {state} from '../../src/index'

const $window = domMock()

const $s = state({
    user: {name: 'Ada', role: 'admin'},
    filters: {query: '', page: 1, size: 20},
    items: Array.from({length: 40}, (_, i) => ({id: i, title: `Item ${i}`, price: i * 3, active: i % 3 === 0})),
})

const onclick = () => {}

const Badge = {
    view: (v: any) => m('span.badge', {className: v.attrs.active ? 'on' : 'off', title: v.attrs.label}, v.attrs.label),
}

const Row = {
    view: (v: any) => {
        const item = v.attrs.item
        return m('li.row', {key: item.id, onclick, 'data-id': item.id}, [
            m('span.title', item.title),
            m('span.price', {style: {color: item.active ? 'green' : 'gray'}}, item.price),
            m(Badge, {active: item.active, label: $s.user.role}),
            $s.filters.query ? m('em', $s.filters.query) : null,
        ])
    },
}

const Header = {
    view: () => m('header', [m('h1', $s.user.name), m('input', {value: $s.filters.query, oninput: onclick})]),
}

const App = {
    view: () =>
        m('main', [
            m(Header),
            m(
                'ul',
                $s.items.map((item: any) => m(Row, {key: item.id, item})),
            ),
            m('footer', `page ${$s.filters.page} of ${$s.filters.size}`),
        ]),
}

const root = $window.document.createElement('div') as unknown as Element
m.render(root, m(App))

bench('app-redraw-unchanged (40 rows, state reads)', () => {
    m.render(root, m(App))
})

const createRoot = $window.document.createElement('div') as unknown as Element
bench('app-create+remove (40 rows)', () => {
    m.render(createRoot, m(App))
    m.render(createRoot, null)
})
