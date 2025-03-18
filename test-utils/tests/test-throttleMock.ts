'use strict'

import {describe, test, expect, mock} from 'bun:test';

import throttleMocker from '../../test-utils/throttleMock';

describe('throttleMock', () => {
    test('schedules one callback', () => {
        const throttleMock = throttleMocker()
        const spy = mock(() => {})

        expect(throttleMock.queueLength()).toBe(0)
        throttleMock.schedule(spy)
        expect(throttleMock.queueLength()).toBe(1)
        expect(spy.mock.calls.length).toBe(0)
        throttleMock.fire()
        expect(throttleMock.queueLength()).toBe(0)
        expect(spy.mock.calls.length).toBe(1)
    })

    test('schedules two callbacks', () => {
        const throttleMock = throttleMocker()
        const spy1 = mock(() => {})
        const spy2 = mock(() => {})

        expect(throttleMock.queueLength()).toBe(0)
        throttleMock.schedule(spy1)
        expect(throttleMock.queueLength()).toBe(1)
        expect(spy1.mock.calls.length).toBe(0)
        expect(spy2.mock.calls.length).toBe(0)
        throttleMock.schedule(spy2)
        expect(throttleMock.queueLength()).toBe(2)
        expect(spy1.mock.calls.length).toBe(0)
        expect(spy2.mock.calls.length).toBe(0)
        throttleMock.fire()
        expect(throttleMock.queueLength()).toBe(0)
        expect(spy1.mock.calls.length).toBe(1)
        expect(spy2.mock.calls.length).toBe(1)
    })
})
