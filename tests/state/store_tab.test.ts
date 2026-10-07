import {describe, test, expect, beforeEach} from 'bun:test'

import {Store} from '../../src/state/store'
import {clearStateRegistry} from '../../src/state/state'
import {localStorageMock, sessionStorageMock, setupWindowMock} from '../helpers/storage_mock'

interface TabAppState {
    count: number
    tab: {filter: string; page: number}
}

function readJson(raw: string | null): unknown {
    return raw === null ? null : JSON.parse(raw)
}

describe('Store tab tier', () => {
    beforeEach(() => {
        globalThis.__SSR_MODE__ = false
        setupWindowMock()
        localStorageMock.clear()
        sessionStorageMock.clear()
        clearStateRegistry()
    })

    test('a new tab seeds its tab state from the copy the saved tier keeps in localStorage', () => {
        localStorageMock.setItem('store', JSON.stringify({count: 3, tab: {filter: 'open', page: 2}}))
        const store = new Store<TabAppState>()

        store.load({count: 0, tab: {filter: 'all', page: 1}}, {}, {filter: 'all', page: 1})

        expect(store.state.count).toBe(3)
        expect(store.state.tab.filter).toBe('open')
        expect(store.state.tab.page).toBe(2)
    })

    test('the tab’s own sessionStorage wins over the localStorage copy', () => {
        localStorageMock.setItem('store', JSON.stringify({tab: {filter: 'open', page: 2}}))
        sessionStorageMock.setItem('store', JSON.stringify({filter: 'closed', page: 5}))
        const store = new Store<TabAppState>()

        store.load({tab: {filter: 'all', page: 1}}, {}, {filter: 'all', page: 1})

        expect(store.state.tab.filter).toBe('closed')
        expect(store.state.tab.page).toBe(5)
    })

    test('without a tab key in the saved template a new tab starts from the tab template', () => {
        localStorageMock.setItem('store', JSON.stringify({count: 1}))
        const store = new Store<TabAppState>()

        store.load({count: 0}, {}, {filter: 'all', page: 1})

        expect(store.state.tab.filter).toBe('all')
        expect(store.state.tab.page).toBe(1)
    })

    test('a flat tab template is mounted under state.tab and saved back to sessionStorage', async () => {
        const store = new Store<TabAppState>()
        store.load({count: 0}, {}, {filter: 'all', page: 1})

        store.state.tab.filter = 'mine'
        await store.save()

        expect(readJson(sessionStorageMock.getItem('store'))).toEqual({filter: 'mine', page: 1})
    })

    test('a tab template with its own `tab` key is saved as written, not unwrapped', async () => {
        const store = new Store<{tab: {tab: string; page: number}}>()
        store.load({}, {}, {tab: 'inbox', page: 1})

        store.state.tab.page = 4
        await store.save()

        expect(store.state.tab.tab).toBe('inbox')
        expect(readJson(sessionStorageMock.getItem('store'))).toEqual({tab: 'inbox', page: 4})
    })
})
