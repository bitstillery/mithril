// @ts-nocheck
import {describe, test, expect, beforeEach} from 'bun:test'

import browserMock from './browser_mock'
import callAsync from './call_async'
import {spy} from './test_helpers'

describe('browserMock', () => {
    let $window: any
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
            expect($window.onhashchange.callCount).toBe(1)
            done()
        } as any)
    })
    test('$window.onpopstate can be reached from the pushStateMock functions', () => {
        $window.onpopstate = spy()
        $window.history.pushState(null, null, '#a')
        $window.history.back()

        expect($window.onpopstate.callCount).toBe(1)
    })
    test('$window.onunload can be reached from the pushStateMock functions', () => {
        $window.onunload = spy()
        $window.location.href = '/a'

        expect($window.onunload.callCount).toBe(1)
    })
})
