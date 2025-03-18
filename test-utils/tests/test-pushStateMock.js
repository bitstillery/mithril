"use strict"

import { describe, test, expect, beforeEach, mock } from "bun:test"
import pushStateMock from "../../test-utils/pushStateMock"
import callAsync from "../../test-utils/callAsync"

describe("pushStateMock", () => {
	let $window
	beforeEach(() => {
		$window = pushStateMock()
	})

	describe("initial state", () => {
		test("has url on page load", () => {
			expect($window.location.href).toBe("http://localhost/")
		})
	})

	describe("set href", () => {
		test("changes url on location.href change", () => {
			const old = $window.location.href
			$window.location.href = "http://localhost/a"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a")
		})

		test("changes url on relative location.href change", () => {
			const old = $window.location.href
			$window.location.href = "a"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a")
			expect($window.location.pathname).toBe("/a")
		})

		test("changes url on dotdot location.href change", () => {
			$window.location.href = "a"
			const old = $window.location.href
			$window.location.href = ".."

			expect(old).toBe("http://localhost/a")
			expect($window.location.href).toBe("http://localhost/")
			expect($window.location.pathname).toBe("/")
		})

		test("changes url on deep dotdot location.href change", () => {
			$window.location.href = "a/b/c"
			const old = $window.location.href
			$window.location.href = ".."

			expect(old).toBe("http://localhost/a/b/c")
			expect($window.location.href).toBe("http://localhost/a")
			expect($window.location.pathname).toBe("/a")
		})

		test("does not change url on dotdot location.href change from root", () => {
			const old = $window.location.href
			$window.location.href = ".."

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/")
			expect($window.location.pathname).toBe("/")
		})

		test("changes url on dot relative location.href change", () => {
			const old = $window.location.href
			$window.location.href = "a"
			$window.location.href = "./b"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/b")
			expect($window.location.pathname).toBe("/b")
		})

		test("does not change url on dot location.href change", () => {
			const old = $window.location.href
			$window.location.href = "a"
			$window.location.href = "."

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a")
			expect($window.location.pathname).toBe("/a")
		})

		test("changes url on hash-only location.href change", () => {
			const old = $window.location.href
			$window.location.href = "#a"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/#a")
			expect($window.location.hash).toBe("#a")
		})

		test("changes url on search-only location.href change", () => {
			const old = $window.location.href
			$window.location.href = "?a"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/?a")
			expect($window.location.search).toBe("?a")
		})

		test("changes hash on location.href change", () => {
			const old = $window.location.href
			$window.location.href = "http://localhost/a#b"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a#b")
			expect($window.location.hash).toBe("#b")
		})

		test("changes search on location.href change", () => {
			const old = $window.location.href
			$window.location.href = "http://localhost/a?b"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a?b")
			expect($window.location.search).toBe("?b")
		})

		test("changes search and hash on location.href change", () => {
			const old = $window.location.href
			$window.location.href = "http://localhost/a?b#c"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a?b#c")
			expect($window.location.search).toBe("?b")
			expect($window.location.hash).toBe("#c")
		})

		test("handles search with search and hash", () => {
			const old = $window.location.href
			$window.location.href = "http://localhost/a?b?c#d"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a?b?c#d")
			expect($window.location.search).toBe("?b?c")
			expect($window.location.hash).toBe("#d")
		})

		test("handles hash with search and hash", () => {
			const old = $window.location.href
			$window.location.href = "http://localhost/a#b?c#d"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a#b?c#d")
			expect($window.location.search).toBe("")
			expect($window.location.hash).toBe("#b?c#d")
		})
	})

	describe("set search", () => {
		test("changes url on location.search change", () => {
			const old = $window.location.href
			$window.location.search = "?b"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/?b")
			expect($window.location.search).toBe("?b")
		})
	})

	describe("set hash", () => {
		test("changes url on location.hash change", () => {
			const old = $window.location.href
			$window.location.hash = "#b"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/#b")
			expect($window.location.hash).toBe("#b")
		})
	})

	describe("set pathname", () => {
		test("changes url on location.pathname change", () => {
			const old = $window.location.href
			$window.location.pathname = "/a"

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a")
			expect($window.location.pathname).toBe("/a")
		})
	})

	describe("set protocol", () => {
		test("setting protocol throws", () => {
			try {
				$window.location.protocol = "https://"
				throw new Error("Expected an error")
			}
			catch (e) {
				expect(e).toBeTruthy()
			}
		})
	})

	describe("set port", () => {
		test("setting origin changes href", () => {
			const old = $window.location.href
			$window.location.port = "81"

			expect(old).toBe("http://localhost/")
			expect($window.location.port).toBe("81")
			expect($window.location.href).toBe("http://localhost:81/")
		})
	})

	describe("set hostname", () => {
		test("setting hostname changes href", () => {
			const old = $window.location.href
			$window.location.hostname = "127.0.0.1"

			expect(old).toBe("http://localhost/")
			expect($window.location.hostname).toBe("127.0.0.1")
			expect($window.location.href).toBe("http://127.0.0.1/")
		})
	})

	describe("set origin", () => {
		test("setting origin is ignored", () => {
			const old = $window.location.href
			$window.location.origin = "http://127.0.0.1"

			expect(old).toBe("http://localhost/")
			expect($window.location.origin).toBe("http://localhost")
		})
	})

	describe("set host", () => {
		test("setting host is ignored", () => {
			const old = $window.location.href
			$window.location.host = "http://127.0.0.1"

			expect(old).toBe("http://localhost/")
			expect($window.location.host).toBe("localhost")
		})
	})

	describe("pushState", () => {
		test("changes url on pushstate", () => {
			const old = $window.location.href
			$window.history.pushState(null, null, "http://localhost/a")

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/a")
		})

		test("changes search on pushstate", () => {
			const old = $window.location.href
			$window.history.pushState(null, null, "http://localhost/?a")

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/?a")
			expect($window.location.search).toBe("?a")
		})

		test("changes search on relative pushstate", () => {
			const old = $window.location.href
			$window.history.pushState(null, null, "?a")

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/?a")
			expect($window.location.search).toBe("?a")
		})

		test("changes hash on pushstate", () => {
			const old = $window.location.href
			$window.history.pushState(null, null, "http://localhost/#a")

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/#a")
			expect($window.location.hash).toBe("#a")
		})

		test("changes hash on relative pushstate", () => {
			const old = $window.location.href
			$window.history.pushState(null, null, "#a")

			expect(old).toBe("http://localhost/")
			expect($window.location.href).toBe("http://localhost/#a")
			expect($window.location.hash).toBe("#a")
		})
	})

	describe("onpopstate", () => {
		test("history.back() without history does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("history.back() after pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "http://localhost/a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
			expect($window.onpopstate.mock.calls[0][0].type).toBe("popstate")
		})

		test("history.back() after relative pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
		})

		test("history.back() after search pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "http://localhost/?a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
		})

		test("history.back() after relative search pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "?a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
		})

		test("history.back() after hash pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "http://localhost/#a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
		})

		test("history.back() after relative hash pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "#a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
		})

		test("history.back() after replacestate does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.replaceState(null, null, "http://localhost/a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("history.back() after relative replacestate does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.replaceState(null, null, "a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("history.back() after relative search replacestate does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.replaceState(null, null, "?a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("history.back() after relative hash replacestate does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.replaceState(null, null, "#a")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("history.forward() after pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "http://localhost/a")
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
		})

		test("history.forward() after relative pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "a")
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
		})

		test("history.forward() after search pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "http://localhost/?a")
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
		})

		test("history.forward() after relative search pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "?a")
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
		})

		test("history.forward() after hash pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "http://localhost/#a")
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
		})

		test("history.forward() after relative hash pushstate triggers onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.pushState(null, null, "#a")
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
		})

		test("history.forward() without history does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("history navigation without history does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.back()
			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("reverse history navigation without history does not trigger onpopstate", () => {
			$window.onpopstate = mock()
			$window.history.forward()
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(0)
		})

		test("onpopstate has correct url during call", () => {
			return new Promise((done) => {
				$window.location.href = "a"
				$window.onpopstate = function() {
					expect($window.location.href).toBe("http://localhost/a")
					done()
				}
				$window.history.pushState(null, null, "b")
				$window.history.back()
			})
		})

		test("replaceState does not break forward history", () => {
			$window.onpopstate = mock()

			$window.history.pushState(null, null, "b")
			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
			expect($window.location.href).toBe("http://localhost/")

			$window.history.replaceState(null, null, "a")

			expect($window.location.href).toBe("http://localhost/a")

			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(2)
			expect($window.location.href).toBe("http://localhost/b")
		})

		test("pushstate retains state", () => {
			$window.onpopstate = mock()

			$window.history.pushState({a: 1}, null, "#a")
			$window.history.pushState({b: 2}, null, "#b")

			expect($window.onpopstate.mock.calls.length).toBe(0)

			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(1)
			expect($window.onpopstate.mock.calls[0][0].type).toBe("popstate")
			expect($window.onpopstate.mock.calls[0][0].state).toEqual({a: 1})

			$window.history.back()

			expect($window.onpopstate.mock.calls.length).toBe(2)
			expect($window.onpopstate.mock.calls[1][0].type).toBe("popstate")
			expect($window.onpopstate.mock.calls[1][0].state).toBe(null)

			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(3)
			expect($window.onpopstate.mock.calls[2][0].type).toBe("popstate")
			expect($window.onpopstate.mock.calls[2][0].state).toEqual({a: 1})

			$window.history.forward()

			expect($window.onpopstate.mock.calls.length).toBe(4)
			expect($window.onpopstate.mock.calls[3][0].type).toBe("popstate")
			expect($window.onpopstate.mock.calls[3][0].state).toEqual({b: 2})
		})

		test("replacestate replaces state", () => {
			function pop(e) {
				expect(e.state).toEqual({a: 1})
				expect($window.history.state).toEqual({a: 1})
			}

			$window.onpopstate = mock(pop)

			$window.history.replaceState({a: 1}, null, "a")

			expect($window.history.state).toEqual({a: 1})

			$window.history.pushState(null, null, "a")
			$window.history.back()
		})
	})

	describe("onhashchance", () => {
		test("onhashchange triggers on location.href change", () => {
			return new Promise((done) => {
				$window.onhashchange = mock()
				$window.location.href = "http://localhost/#a"

				callAsync(() => {
					expect($window.onhashchange.mock.calls.length).toBe(1)
					expect($window.onhashchange.mock.calls[0][0].type).toBe("hashchange")
					done()
				})
			})
		})

		test("onhashchange triggers on relative location.href change", () => {
			return new Promise((done) => {
				$window.onhashchange = mock()
				$window.location.href = "#a"

				callAsync(() => {
					expect($window.onhashchange.mock.calls.length).toBe(1)
					done()
				})
			})
		})

		test("onhashchange triggers on location.hash change", () => {
			return new Promise((done) => {
				$window.onhashchange = mock()
				$window.location.hash = "#a"

				callAsync(() => {
					expect($window.onhashchange.mock.calls.length).toBe(1)
					done()
				})
			})
		})

		test("onhashchange does not trigger on page change", () => {
			return new Promise((done) => {
				$window.onhashchange = mock()
				$window.location.href = "http://localhost/a"

				callAsync(() => {
					expect($window.onhashchange.mock.calls.length).toBe(0)
					done()
				})
			})
		})

		test("onhashchange does not trigger on page change with different hash", () => {
			return new Promise((done) => {
				$window.location.href = "http://localhost/#a"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.location.href = "http://localhost/a#b"

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(0)
						done()
					})
				})
			})
		})

		test("onhashchange does not trigger on page change with same hash", () => {
			return new Promise((done) => {
				$window.location.href = "http://localhost/#b"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.location.href = "http://localhost/a#b"

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(0)
						done()
					})
				})
			})
		})

		test("onhashchange triggers on history.back()", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(1)
						done()
					})
				})
			})
		})

		test("onhashchange triggers on history.forward()", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()
					callAsync(() => {
						$window.history.forward()

						callAsync(() => {
							expect($window.onhashchange.mock.calls.length).toBe(2)
							done()
						})
					})
				})
			})
		})

		test("onhashchange triggers once when the hash changes twice in a single tick", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()
					$window.history.forward()

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(1)
						done()
					})
				})
			})
		})

		test("onhashchange does not trigger on history.back() that causes page change with different hash", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				$window.location.href = "a#b"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(0)
						done()
					})
				})
			})
		})

		test("onhashchange does not trigger on history.back() that causes page change with same hash", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				$window.location.href = "a#a"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(0)
						done()
					})
				})
			})
		})

		test("onhashchange does not trigger on history.forward() that causes page change with different hash", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				$window.location.href = "a#b"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()
					$window.history.forward()

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(0)
						done()
					})
				})
			})
		})

		test("onhashchange does not trigger on history.forward() that causes page change with same hash", () => {
			return new Promise((done) => {
				$window.location.href = "#a"
				$window.location.href = "a#b"
				callAsync(() => {
					$window.onhashchange = mock()
					$window.history.back()
					$window.history.forward()

					callAsync(() => {
						expect($window.onhashchange.mock.calls.length).toBe(0)
						done()
					})
				})
			})
		})
	})

	describe("onunload", () => {
		test("onunload triggers on location.href change", () => {
			$window.onunload = mock()
			$window.location.href = "http://localhost/a"

			expect($window.onunload.mock.calls.length).toBe(1)
			expect($window.onunload.mock.calls[0][0].type).toBe("unload")
		})

		test("onunload triggers on relative location.href change", () => {
			$window.onunload = mock()
			$window.location.href = "a"

			expect($window.onunload.mock.calls.length).toBe(1)
		})

		test("onunload triggers on search change via location.href", () => {
			$window.onunload = mock()
			$window.location.href = "http://localhost/?a"

			expect($window.onunload.mock.calls.length).toBe(1)
		})

		test("onunload triggers on relative search change via location.href", () => {
			$window.onunload = mock()
			$window.location.href = "?a"

			expect($window.onunload.mock.calls.length).toBe(1)
		})

		test("onunload does not trigger on hash change via location.href", () => {
			$window.onunload = mock()
			$window.location.href = "http://localhost/#a"

			expect($window.onunload.mock.calls.length).toBe(0)
		})

		test("onunload does not trigger on relative hash change via location.href", () => {
			$window.onunload = mock()
			$window.location.href = "#a"

			expect($window.onunload.mock.calls.length).toBe(0)
		})

		test("onunload does not trigger on hash-only history.back()", () => {
			$window.location.href = "#a"
			$window.onunload = mock()
			$window.history.back()

			expect($window.onunload.mock.calls.length).toBe(0)
		})

		test("onunload does not trigger on hash-only history.forward()", () => {
			$window.location.href = "#a"
			$window.history.back()
			$window.onunload = mock()
			$window.history.forward()

			expect($window.onunload.mock.calls.length).toBe(0)
		})

		test("onunload has correct url during call via location.href change", () => {
			return new Promise((done) => {
				$window.onunload = function() {
					expect($window.location.href).toBe("http://localhost/")
					done()
				}
				$window.location.href = "a"
			})
		})

		test("onunload has correct url during call via location.search change", () => {
			return new Promise((done) => {
				$window.onunload = function() {
					expect($window.location.href).toBe("http://localhost/")
					done()
				}
				$window.location.search = "?a"
			})
		})
	})
})
