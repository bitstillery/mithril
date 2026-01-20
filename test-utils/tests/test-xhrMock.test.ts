import { describe, test, expect, beforeEach } from "bun:test"
import xhrMock from "../../test-utils/xhrMock.js"

describe("xhrMock", () => {
	let $window: any
	beforeEach(() => {
		$window = xhrMock()
	})

	describe("xhr", () => {
		test("works", (done) => {
			$window.$defineRoutes({
				"GET /item": function(request: any) {
					expect(request.url).toBe("/item")
					return {status: 200, responseText: "test"}
				}
			})
			const xhr = new $window.XMLHttpRequest()
			xhr.open("GET", "/item")
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					expect(xhr.status).toBe(200)
					expect(xhr.responseText).toBe("test")
					done()
				}
			}
			xhr.send()
		})
		test("works w/ search", (done) => {
			$window.$defineRoutes({
				"GET /item": function(request: any) {
					expect(request.query).toBe("?a=b")
					return {status: 200, responseText: "test"}
				}
			})
			const xhr = new $window.XMLHttpRequest()
			xhr.open("GET", "/item?a=b")
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					done()
				}
			}
			xhr.send()
		})
		test("works w/ body", (done) => {
			$window.$defineRoutes({
				"POST /item": function(request: any) {
					expect(request.body).toBe("a=b")
					return {status: 200, responseText: "test"}
				}
			})
			const xhr = new $window.XMLHttpRequest()
			xhr.open("POST", "/item")
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					done()
				}
			}
			xhr.send("a=b")
		})
		test("passes event to onreadystatechange", (done) => {
			$window.$defineRoutes({
				"GET /item": function(request: any) {
					expect(request.url).toBe("/item")
					return {status: 200, responseText: "test"}
				}
			})
			const xhr = new $window.XMLHttpRequest()
			xhr.open("GET", "/item")
			xhr.onreadystatechange = function(ev: any) {
				expect(ev.target).toBe(xhr)
				if (xhr.readyState === 4) {
					done()
				}
			}
			xhr.send()
		})
		test("handles routing error", (done) => {
			const xhr = new $window.XMLHttpRequest()
			xhr.open("GET", "/nonexistent")
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					expect(xhr.status).toBe(500)
					done()
				}
			}
			xhr.send("a=b")
		})
		test("Setting a header twice merges the header", () => {
			// Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
			const xhr = new $window.XMLHttpRequest()
			xhr.open("POST", "/test")
			xhr.setRequestHeader("Content-Type", "foo")
			xhr.setRequestHeader("Content-Type", "bar")
			expect(xhr.getRequestHeader("Content-Type")).toBe("foo, bar")
		})
	})
})
