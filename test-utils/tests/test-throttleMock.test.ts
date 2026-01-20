import { describe, test, expect } from "bun:test"
import throttleMock from "../../test-utils/throttleMock.js"
import { spy } from "../test-helpers.js"

describe("throttleMock", () => {
	test("schedules one callback", () => {
		const throttleMockInstance = throttleMock()
		const spyFn = spy()

		expect(throttleMockInstance.queueLength()).toBe(0)
		throttleMockInstance.schedule(spyFn)
		expect(throttleMockInstance.queueLength()).toBe(1)
		expect(spyFn.callCount).toBe(0)
		throttleMockInstance.fire()
		expect(throttleMockInstance.queueLength()).toBe(0)
		expect(spyFn.callCount).toBe(1)
	})
	test("schedules two callbacks", () => {
		const throttleMockInstance = throttleMock()
		const spy1 = spy()
		const spy2 = spy()

		expect(throttleMockInstance.queueLength()).toBe(0)
		throttleMockInstance.schedule(spy1)
		expect(throttleMockInstance.queueLength()).toBe(1)
		expect(spy1.callCount).toBe(0)
		expect(spy2.callCount).toBe(0)
		throttleMockInstance.schedule(spy2)
		expect(throttleMockInstance.queueLength()).toBe(2)
		expect(spy1.callCount).toBe(0)
		expect(spy2.callCount).toBe(0)
		throttleMockInstance.fire()
		expect(throttleMockInstance.queueLength()).toBe(0)
		expect(spy1.callCount).toBe(1)
		expect(spy2.callCount).toBe(1)
	})
})
