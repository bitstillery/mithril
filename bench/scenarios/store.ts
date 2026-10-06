/**
 * Store persistence: `load` at startup and `save` after each change worth keeping.
 *
 * The shape is an app's persistent store: identity and settings saved to localStorage, a lookup
 * of cached per-page data, tab state in sessionStorage, and temporary keys never persisted. A window
 * with in-memory storage stands in for the browser, so both paths run all their tiers.
 *
 * Run: bun run bench store
 */
import {bench, summary} from 'mitata'

import {clearStateRegistry} from '../../index'
import {Store} from '../../store'
import {localStorageMock, sessionStorageMock, setupWindowMock} from '../../test-utils/storage-mock'

setupWindowMock()
clearStateRegistry()

function saved() {
    return {
        identity: {token: '', user: {id: 0, first_name: '', language: 'en'}},
        language: 'en',
        lookup: {} as Record<string, unknown>,
        settings: {columns: ['name', 'price', 'stock'], density: 'comfortable', page_size: 25, theme: 'light'},
    }
}

function temporary() {
    return {
        env: {layout: 'desktop', uri: '/', width: 1400},
        loading: false,
        notifications: [] as string[],
        panels: {filters: {collapsed: false}, sidebar: {collapsed: true}},
    }
}

function tab() {
    return {session_id: '', last_route: '/'}
}

const stored = {
    identity: {token: 'abc', user: {id: 7, first_name: 'Ada', language: 'en'}},
    language: 'en',
    lookup: Object.fromEntries(
        Array.from({length: 20}, (_, i) => [`/items/${i}`, {modified: Date.now(), sort: 'name', page: i}]),
    ),
    settings: {columns: ['name', 'price'], density: 'compact', page_size: 50, theme: 'dark'},
}

function seed() {
    localStorageMock.clear()
    sessionStorageMock.clear()
    localStorageMock.setItem('store', JSON.stringify(stored))
    sessionStorageMock.setItem('store', JSON.stringify({session_id: 's1', last_route: '/items'}))
}

seed()
const loaded = new Store()
loaded.load(saved(), temporary(), tab())

summary(() => {
    bench('store — load (saved, temporary, tab, 20 lookup entries)', function* () {
        const store = new Store()
        yield () => store.load(saved(), temporary(), tab())
    })
    bench('store — save (all tiers)', () => loaded.save())
    bench('store — clean_lookup (nothing expired)', () => loaded.clean_lookup())
})
