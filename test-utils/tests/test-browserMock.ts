'use strict'

import {describe, test, expect, beforeEach, mock} from 'bun:test'

import browserMock from '../../test-utils/browserMock'
import callAsync from '../../test-utils/callAsync'

describe('browserMock', () => {
    let $window

    beforeEach(() => {
        $window = browserMock()
    })

    test('Mocks DOM, pushState and XHR', () => {
        expect($window.location).not.toBe(undefined)
        expect($window.document).not.toBe(undefined)
        expect($window.XMLHttpRequest).not.toBe(undefined)
    })

    test('$window.onhashchange can be reached from the pushStateMock functions', async() => {
        $window.onhashchange = mock(() => {})
        $window.location.hash = '#a'

        await new Promise(resolve => {
            callAsync(() => {
                expect($window.onhashchange.mock.calls.length).toBe(1)
                resolve()
            })
        })
    })

    test('$window.onpopstate can be reached from the pushStateMock functions', () => {
        $window.onpopstate = mock(() => {})
        $window.history.pushState(null, null, '#a')
        $window.history.back()

        expect($window.onpopstate.mock.calls.length).toBe(1)
    })

    test('$window.onunload can be reached from the pushStateMock functions', () => {
        $window.onunload = mock(() => {})
        $window.location.href = '/a'

        expect($window.onunload.mock.calls.length).toBe(1)
    })
})
