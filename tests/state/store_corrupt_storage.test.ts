import {describe, test, expect, beforeEach, afterEach, spyOn} from 'bun:test'
import type {Mock} from 'bun:test'

import {Store} from '../../src/state/store'
import {clearStateRegistry} from '../../src/state/state'
import {localStorageMock, sessionStorageMock, setupWindowMock} from '../helpers/storage_mock'

interface AppState {
    count: number
    theme: string
    tab: {filter: string; page: number}
}

describe('Store with corrupt storage', () => {
    let warn: Mock<typeof console.warn>

    beforeEach(() => {
        globalThis.__SSR_MODE__ = false
        setupWindowMock()
        localStorageMock.clear()
        sessionStorageMock.clear()
        clearStateRegistry()
        warn = spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        warn.mockRestore()
    })

    test('corrupt localStorage falls back to the saved template and still loads the tab tier', () => {
        localStorageMock.setItem('store', '{not json')
        sessionStorageMock.setItem('store', JSON.stringify({filter: 'closed', page: 5}))
        const store = new Store<AppState>()

        store.load({count: 0, theme: 'light'}, {}, {filter: 'all', page: 1})

        expect(store.state.count).toBe(0)
        expect(store.state.theme).toBe('light')
        expect(store.state.tab.filter).toBe('closed')
        expect(store.state.tab.page).toBe(5)
        expect(warn).toHaveBeenCalledTimes(1)
    })

    test('corrupt sessionStorage falls back to the tab template and still loads the saved tier', () => {
        localStorageMock.setItem('store', JSON.stringify({count: 3, theme: 'dark'}))
        sessionStorageMock.setItem('store', '{not json')
        const store = new Store<AppState>()

        store.load({count: 0, theme: 'light'}, {}, {filter: 'all', page: 1})

        expect(store.state.count).toBe(3)
        expect(store.state.theme).toBe('dark')
        expect(store.state.tab.filter).toBe('all')
        expect(store.state.tab.page).toBe(1)
        expect(warn).toHaveBeenCalledTimes(1)
    })
})
