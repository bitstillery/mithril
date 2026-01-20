import { describe, test, expect } from "bun:test"
import callAsync from "../../test-utils/callAsync.js"

describe("callAsync", () => {
	test("works", (done) => {
		let count = 0
		callAsync(function() {
			expect(count).toBe(1)
			done()
		})
		count++
	})
	test("gets called before setTimeout", (done) => {
		let timeout: ReturnType<typeof setTimeout>
		callAsync(function() {
			clearTimeout(timeout)
			done()
		})
		timeout = setTimeout(function() {
			throw new Error("callAsync was called too slow")
		}, 5)
	})
})
