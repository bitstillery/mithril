import {describe, test, expect, beforeEach} from 'bun:test'

import browserMock from './browser_mock'
import callAsync from './call_async'
import {spy} from './test_helpers'

import type {BrowserMockWindow} from './browser_mock'

describe('browserMock', () => {
    let $window: BrowserMockWindow
    beforeEach(() => {
        $window = browserMock()
    })

    test('Mocks DOM and pushState', () => {
        expect($window.location).not.toBe(undefined)
        expect($window.document).not.toBe(undefined)
    })
    test('$window.onhashchange can be reached from the pushStateMock functions', (done) => {
        $window.onhashchange = spy()
        $window.location.hash = '#a'

        callAsync(function () {
            expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(1)
            done()
        } as any)
    })
    test('$window.onpopstate can be reached from the pushStateMock functions', () => {
        $window.onpopstate = spy()
        $window.history.pushState(null, null, '#a')
        $window.history.back()

        expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
    })
    test('$window.onunload can be reached from the pushStateMock functions', () => {
        $window.onunload = spy()
        $window.location.href = '/a'

        expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(1)
    })
})
