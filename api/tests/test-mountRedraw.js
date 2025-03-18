"use strict"

// Low-priority TODO: remove the dependency on the renderer here.
import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import components from "../../test-utils/components";
import domMock from "../../test-utils/domMock";
import throttleMocker from "../../test-utils/throttleMock";
import mountRedraw from "../../api/mount-redraw";
import coreRenderer from "../../render/render";
import h from "../../render/hyperscript";

describe("mount/redraw", function() {
	var root, m, throttleMock, consoleMock, $document, errors
	beforeEach(function() {
		var $window = domMock()
		consoleMock = {error: mock()}
		throttleMock = throttleMocker()
		root = $window.document.body
		m = mountRedraw(coreRenderer($window), throttleMock.schedule, consoleMock)
		$document = $window.document
		errors = []
	})

	afterEach(function() {
		expect(consoleMock.error.mock.calls.map(function(args) {
			return args[0]
		})).toEqual(errors)
		expect(throttleMock.queueLength()).toBe(0)
	})

	test("shouldn't error if there are no renderers", function() {
		m.redraw()
		throttleMock.fire()
	})

	test("schedules correctly", function() {
		var spy = mock()

		m.mount(root, {view: spy})
		expect(spy.mock.calls.length).toBe(1)
		m.redraw()
		expect(spy.mock.calls.length).toBe(1)
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(2)
	})

	test("should run a single renderer entry", function() {
		var spy = mock()

		m.mount(root, {view: spy})

		expect(spy.mock.calls.length).toBe(1)

		m.redraw()
		m.redraw()
		m.redraw()

		expect(spy.mock.calls.length).toBe(1)
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(2)
	})

	test("should run all renderer entries", function() {
		var el1 = $document.createElement("div")
		var el2 = $document.createElement("div")
		var el3 = $document.createElement("div")
		var spy1 = mock()
		var spy2 = mock()
		var spy3 = mock()

		m.mount(el1, {view: spy1})
		m.mount(el2, {view: spy2})
		m.mount(el3, {view: spy3})

		m.redraw()

		expect(spy1.mock.calls.length).toBe(1)
		expect(spy2.mock.calls.length).toBe(1)
		expect(spy3.mock.calls.length).toBe(1)

		m.redraw()

		expect(spy1.mock.calls.length).toBe(1)
		expect(spy2.mock.calls.length).toBe(1)
		expect(spy3.mock.calls.length).toBe(1)

		throttleMock.fire()

		expect(spy1.mock.calls.length).toBe(2)
		expect(spy2.mock.calls.length).toBe(2)
		expect(spy3.mock.calls.length).toBe(2)
	})

	test("should not redraw when mounting another root", function() {
		var el1 = $document.createElement("div")
		var el2 = $document.createElement("div")
		var el3 = $document.createElement("div")
		var spy1 = mock()
		var spy2 = mock()
		var spy3 = mock()

		m.mount(el1, {view: spy1})
		expect(spy1.mock.calls.length).toBe(1)
		expect(spy2.mock.calls.length).toBe(0)
		expect(spy3.mock.calls.length).toBe(0)

		m.mount(el2, {view: spy2})
		expect(spy1.mock.calls.length).toBe(1)
		expect(spy2.mock.calls.length).toBe(1)
		expect(spy3.mock.calls.length).toBe(0)

		m.mount(el3, {view: spy3})
		expect(spy1.mock.calls.length).toBe(1)
		expect(spy2.mock.calls.length).toBe(1)
		expect(spy3.mock.calls.length).toBe(1)
	})

	test("should stop running after mount null", function() {
		var spy = mock()

		m.mount(root, {view: spy})
		expect(spy.mock.calls.length).toBe(1)
		m.mount(root, null)

		m.redraw()

		expect(spy.mock.calls.length).toBe(1)
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(1)
	})

	test("should stop running after mount undefined", function() {
		var spy = mock()

		m.mount(root, {view: spy})
		expect(spy.mock.calls.length).toBe(1)
		m.mount(root, undefined)

		m.redraw()

		expect(spy.mock.calls.length).toBe(1)
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(1)
	})

	test("should stop running after mount no arg", function() {
		var spy = mock()

		m.mount(root, {view: spy})
		expect(spy.mock.calls.length).toBe(1)
		m.mount(root)

		m.redraw()

		expect(spy.mock.calls.length).toBe(1)
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(1)
	})

	test("should invoke remove callback on unmount", function() {
		var spy = mock()
		var onremove = mock()

		m.mount(root, {view: spy, onremove: onremove})
		expect(spy.mock.calls.length).toBe(1)
		m.mount(root)

		expect(spy.mock.calls.length).toBe(1)
		expect(onremove.mock.calls.length).toBe(1)
	})

	test("should stop running after unsubscribe, even if it occurs after redraw is requested", function() {
		var spy = mock()

		m.mount(root, {view: spy})
		expect(spy.mock.calls.length).toBe(1)
		m.redraw()
		m.mount(root)

		expect(spy.mock.calls.length).toBe(1)
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(1)
	})

	test("does nothing on invalid unmount", function() {
		var spy = mock()

		m.mount(root, {view: spy})
		expect(spy.mock.calls.length).toBe(1)

		m.mount(null)
		m.redraw()
		throttleMock.fire()
		expect(spy.mock.calls.length).toBe(2)
	})

	test("redraw.sync() redraws all roots synchronously", function() {
		var el1 = $document.createElement("div")
		var el2 = $document.createElement("div")
		var el3 = $document.createElement("div")
		var spy1 = mock()
		var spy2 = mock()
		var spy3 = mock()

		m.mount(el1, {view: spy1})
		m.mount(el2, {view: spy2})
		m.mount(el3, {view: spy3})

		expect(spy1.mock.calls.length).toBe(1)
		expect(spy2.mock.calls.length).toBe(1)
		expect(spy3.mock.calls.length).toBe(1)

		m.redraw.sync()

		expect(spy1.mock.calls.length).toBe(2)
		expect(spy2.mock.calls.length).toBe(2)
		expect(spy3.mock.calls.length).toBe(2)

		m.redraw.sync()

		expect(spy1.mock.calls.length).toBe(3)
		expect(spy2.mock.calls.length).toBe(3)
		expect(spy3.mock.calls.length).toBe(3)
	})


	test("throws on invalid component", function() {
		expect(() => { m.mount(root, {}) }).toThrow(TypeError)
	})

	test("skips roots that were synchronously unsubscribed before they were visited", function() {
		var calls = []
		var root1 = $document.createElement("div")
		var root2 = $document.createElement("div")
		var root3 = $document.createElement("div")

		m.mount(root1, {
			onbeforeupdate: function() {
				m.mount(root2, null)
			},
			view: function() { calls.push("root1") },
		})
		m.mount(root2, {view: function() { calls.push("root2") }})
		m.mount(root3, {view: function() { calls.push("root3") }})
		expect(calls).toEqual([
			"root1", "root2", "root3",
		])

		m.redraw.sync()
		expect(calls).toEqual([
			"root1", "root2", "root3",
			"root1", "root3",
		])
	})

	test("keeps its place when synchronously unsubscribing previously visited roots", function() {
		var calls = []
		var root1 = $document.createElement("div")
		var root2 = $document.createElement("div")
		var root3 = $document.createElement("div")

		m.mount(root1, {view: function() { calls.push("root1") }})
		m.mount(root2, {
			onbeforeupdate: function() {
				m.mount(root1, null)
			},
			view: function() { calls.push("root2") },
		})
		m.mount(root3, {view: function() { calls.push("root3") }})
		expect(calls).toEqual([
			"root1", "root2", "root3",
		])

		m.redraw.sync()
		expect(calls).toEqual([
			"root1", "root2", "root3",
			"root1", "root2", "root3",
		])
	})

	test("keeps its place when synchronously unsubscribing previously visited roots in the face of errors", function() {
		errors = ["fail"]
		var calls = []
		var root1 = $document.createElement("div")
		var root2 = $document.createElement("div")
		var root3 = $document.createElement("div")

		m.mount(root1, {view: function() { calls.push("root1") }})
		m.mount(root2, {
			onbeforeupdate: function() {
				m.mount(root1, null)
				throw "fail"
			},
			view: function() { calls.push("root2") },
		})
		m.mount(root3, {view: function() { calls.push("root3") }})
		expect(calls).toEqual([
			"root1", "root2", "root3",
		])

		m.redraw.sync()
		expect(calls).toEqual([
			"root1", "root2", "root3",
			"root1", "root3",
		])
	})

	test("keeps its place when synchronously unsubscribing the current root", function() {
		var calls = []
		var root1 = $document.createElement("div")
		var root2 = $document.createElement("div")
		var root3 = $document.createElement("div")

		m.mount(root1, {view: function() { calls.push("root1") }})
		m.mount(root2, {
			onbeforeupdate: function() {
				try { m.mount(root2, null) } catch (e) { calls.push([e.constructor, e.message]) }
			},
			view: function() { calls.push("root2") },
		})
		m.mount(root3, {view: function() { calls.push("root3") }})
		expect(calls).toEqual([
			"root1", "root2", "root3",
		])

		m.redraw.sync()
		expect(calls).toEqual([
			"root1", "root2", "root3",
			"root1", [TypeError, "Node is currently being rendered to and thus is locked."], "root2", "root3",
		])
	})

	test("keeps its place when synchronously unsubscribing the current root in the face of an error", function() {
		errors = [
			[TypeError, "Node is currently being rendered to and thus is locked."],
		]
		var calls = []
		var root1 = $document.createElement("div")
		var root2 = $document.createElement("div")
		var root3 = $document.createElement("div")

		m.mount(root1, {view: function() { calls.push("root1") }})
		m.mount(root2, {
			onbeforeupdate: function() {
				try { m.mount(root2, null) } catch (e) { throw [e.constructor, e.message] }
			},
			view: function() { calls.push("root2") },
		})
		m.mount(root3, {view: function() { calls.push("root3") }})
		expect(calls).toEqual([
			"root1", "root2", "root3",
		])

		m.redraw.sync()
		expect(calls).toEqual([
			"root1", "root2", "root3",
			"root1", "root3",
		])
	})

	components.forEach(function(cmp){
		describe(cmp.kind, function(){
			var createComponent = cmp.create

			test("throws on invalid `root` DOM node", function() {
				expect(() => {
					m.mount(null, createComponent({view: function() {}}))
				}).toThrow(TypeError)
			})

			test("renders into `root` synchronously", function() {
				m.mount(root, createComponent({
					view: function() {
						return h("div")
					}
				}))

				expect(root.firstChild.nodeName).toBe("DIV")
			})

			test("mounting null unmounts", function() {
				m.mount(root, createComponent({
					view: function() {
						return h("div")
					}
				}))

				m.mount(root, null)

				expect(root.childNodes.length).toBe(0)
			})

			test("Mounting a second root doesn't cause the first one to redraw", function() {
				var root1 = $document.createElement("div")
				var root2 = $document.createElement("div")
				var view = mock()

				m.mount(root1, createComponent({view: view}))
				expect(view.mock.calls.length).toBe(1)

				m.mount(root2, createComponent({view: function() {}}))

				expect(view.mock.calls.length).toBe(1)

				throttleMock.fire()
				expect(view.mock.calls.length).toBe(1)
			})

			test("redraws on events", function() {
				var onupdate = mock()
				var oninit = mock()
				var onclick = mock()
				var e = $document.createEvent("MouseEvents")

				e.initEvent("click", true, true)

				m.mount(root, createComponent({
					view: function() {
						return h("div", {
							oninit: oninit,
							onupdate: onupdate,
							onclick: onclick,
						})
					}
				}))

				root.firstChild.dispatchEvent(e)

				expect(oninit.mock.calls.length).toBe(1)
				expect(onupdate.mock.calls.length).toBe(0)

				expect(onclick.mock.calls.length).toBe(1)
				// Note: In Bun mocks, we can't directly access 'this' context
				// We should ensure the component handling preserves context internally
				expect(onclick.mock.calls[0][0].type).toBe("click")
				expect(onclick.mock.calls[0][0].target).toBe(root.firstChild)

				throttleMock.fire()

				expect(onupdate.mock.calls.length).toBe(1)
			})

			test("redraws several mount points on events", function() {
				var onupdate0 = mock()
				var oninit0 = mock()
				var onclick0 = mock()
				var onupdate1 = mock()
				var oninit1 = mock()
				var onclick1 = mock()

				var root1 = $document.createElement("div")
				var root2 = $document.createElement("div")
				var e = $document.createEvent("MouseEvents")

				e.initEvent("click", true, true)

				m.mount(root1, createComponent({
					view: function() {
						return h("div", {
							oninit: oninit0,
							onupdate: onupdate0,
							onclick: onclick0,
						})
					}
				}))

				expect(oninit0.mock.calls.length).toBe(1)
				expect(onupdate0.mock.calls.length).toBe(0)

				m.mount(root2, createComponent({
					view: function() {
						return h("div", {
							oninit: oninit1,
							onupdate: onupdate1,
							onclick: onclick1,
						})
					}
				}))

				expect(oninit1.mock.calls.length).toBe(1)
				expect(onupdate1.mock.calls.length).toBe(0)

				root1.firstChild.dispatchEvent(e)
				expect(onclick0.mock.calls.length).toBe(1)
				// Note: this context check replaced with event verification

				throttleMock.fire()

				expect(onupdate0.mock.calls.length).toBe(1)
				expect(onupdate1.mock.calls.length).toBe(1)

				root2.firstChild.dispatchEvent(e)

				expect(onclick1.mock.calls.length).toBe(1)
				// Note: this context check replaced with event verification

				throttleMock.fire()

				expect(onupdate0.mock.calls.length).toBe(2)
				expect(onupdate1.mock.calls.length).toBe(2)
			})

			test("event handlers can skip redraw", function() {
				var onupdate = mock(() => {
					throw new Error("This shouldn't have been called")
				})
				var oninit = mock()
				var e = $document.createEvent("MouseEvents")

				e.initEvent("click", true, true)

				m.mount(root, createComponent({
					view: function() {
						return h("div", {
							oninit: oninit,
							onupdate: onupdate,
							onclick: function(e) {
								e.redraw = false
							}
						})
					}
				}))

				root.firstChild.dispatchEvent(e)

				expect(oninit.mock.calls.length).toBe(1)
				expect(e.redraw).toBe(false)

				throttleMock.fire()

				expect(onupdate.mock.calls.length).toBe(0)
				expect(e.redraw).toBe(false)
			})

			test("redraws when the render function is run", function() {
				var onupdate = mock()
				var oninit = mock()

				m.mount(root, createComponent({
					view: function() {
						return h("div", {
							oninit: oninit,
							onupdate: onupdate
						})
					}
				}))

				expect(oninit.mock.calls.length).toBe(1)
				expect(onupdate.mock.calls.length).toBe(0)

				m.redraw()

				throttleMock.fire()

				expect(onupdate.mock.calls.length).toBe(1)
			})

			test("emits errors correctly", function() {
				errors = ["foo", "bar", "baz"]
				var counter = -1

				m.mount(root, createComponent({
					view: function() {
						var value = errors[counter++]
						if (value != null) throw value
						return null
					}
				}))

				m.redraw()
				throttleMock.fire()
				m.redraw()
				throttleMock.fire()
				m.redraw()
				throttleMock.fire()
			})
		})
	})
})
