"use strict"

import { describe, test, expect, mock } from "bun:test";
import m from "../../render/hyperscript";

describe("hyperscript", () => {
	describe("selector", () => {
		test("throws on null selector", () => {
			expect(() => m(null)).toThrow();
		})
		test("throws on non-string selector w/o a view property", () => {
			expect(() => m({})).toThrow();
		})
		test("handles tag in selector", () => {
			const vnode = m("a")

			expect(vnode.tag).toBe("a")
		})
		test("class and className normalization", () => {
			expect(m("a", {
				class: null
			}).attrs).toEqual({
				class: null
			})
			expect(m("a", {
				class: undefined
			}).attrs).toEqual({
				class: null
			})
			expect(m("a", {
				class: false
			}).attrs).toEqual({
				class: null,
				className: false
			})
			expect(m("a", {
				class: true
			}).attrs).toEqual({
				class: null,
				className: true
			})
			expect(m("a.x", {
				class: null
			}).attrs).toEqual({
				class: null,
				className: "x"
			})
			expect(m("a.x", {
				class: undefined
			}).attrs).toEqual({
				class: null,
				className: "x undefined"
			})
			expect(m("a.x", {
				class: false
			}).attrs).toEqual({
				class: null,
				className: "x false"
			})
			expect(m("a.x", {
				class: true
			}).attrs).toEqual({
				class: null,
				className: "x true"
			})
			expect(m("a", {
				className: null
			}).attrs).toEqual({
				className: null
			})
			expect(m("a", {
				className: undefined
			}).attrs).toEqual({
				className: undefined
			})
			expect(m("a", {
				className: false
			}).attrs).toEqual({
				className: false
			})
			expect(m("a", {
				className: true
			}).attrs).toEqual({
				className: true
			})
			expect(m("a.x", {
				className: null
			}).attrs).toEqual({
				className: "x"
			})
			expect(m("a.x", {
				className: undefined
			}).attrs).toEqual({
				className: "x undefined"
			})
			expect(m("a.x", {
				className: false
			}).attrs).toEqual({
				className: "x false"
			})
			expect(m("a.x", {
				class: false,
				className: true
			}).attrs).toEqual({
				class: null,
				className: "x false"
			})
		})
		test("handles class in selector", () => {
			const vnode = m(".a")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.className).toContain("a")
		})
		test("handles many classes in selector", () => {
			const vnode = m(".a.b.c")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.className).toContain("a b c")
		})
		test("handles id in selector", () => {
			const vnode = m("#a")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.id).toBe("a")
		})
		test("handles attr in selector", () => {
			const vnode = m("[a=b]")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
		})
		test("handles many attrs in selector", () => {
			const vnode = m("[a=b][c=d]")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
			expect(vnode.attrs.c).toBe("d")
		})
		test("handles attr w/ spaces in selector", () => {
			const vnode = m("[a = b]")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
		})
		test("handles attr w/ quotes in selector", () => {
			const vnode = m("[a='b']")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
		})
		test("handles attr w/ quoted square bracket", () => {
			const vnode = m("[x][a='[b]'].c")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.x).toBe(true)
			expect(vnode.attrs.a).toBe("[b]")
			expect(vnode.attrs.className).toContain("c")
		})
		test("handles attr w/ unmatched square bracket", () => {
			const vnode = m("[a=']'].c")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("]")
			expect(vnode.attrs.className).toContain("c")
		})
		test("handles attr w/ quoted square bracket and quote", () => {
			const vnode = m("[a='[b\"\\']'].c") // `[a='[b"\']']`

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("[b\"']") // `[b"']`
			expect(vnode.attrs.className).toContain("c")
		})
		test("handles attr w/ quoted square containing escaped square bracket", () => {
			const vnode = m("[a='[\\]]'].c") // `[a='[\]]']`

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("[\\]]") // `[\]]`
			expect(vnode.attrs.className).toContain("c")
		})
		test("handles attr w/ backslashes", () => {
			const vnode = m("[a='\\\\'].c") // `[a='\\']`

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("\\")
			expect(vnode.attrs.className).toContain("c")
		})
		test("handles attr w/ quotes and spaces in selector", () => {
			const vnode = m("[a = 'b']")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
		})
		test("handles many attr w/ quotes and spaces in selector", () => {
			const vnode = m("[a = 'b'][c = 'd']")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
			expect(vnode.attrs.c).toBe("d")
		})
		test("handles tag, class, attrs in selector", () => {
			const vnode = m("a.b[c = 'd']")

			expect(vnode.tag).toBe("a")
			expect(vnode.attrs.className).toContain("b")
			expect(vnode.attrs.c).toBe("d")
		})
		test("handles tag, mixed classes, attrs in selector", () => {
			const vnode = m("a.b[c = 'd'].e[f = 'g']")

			expect(vnode.tag).toBe("a")
			expect(vnode.attrs.className).toContain("b e")
			expect(vnode.attrs.c).toBe("d")
			expect(vnode.attrs.f).toBe("g")
		})
		test("handles attr without value", () => {
			const vnode = m("[a]")

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe(true)
		})
		test("handles explicit empty string value for input", () => {
			const vnode = m('input[value=""]')

			expect(vnode.tag).toBe("input")
			expect(vnode.attrs.value).toBe("")
		})
		test("handles explicit empty string value for option", () => {
			const vnode = m('option[value=""]')

			expect(vnode.tag).toBe("option")
			expect(vnode.attrs.value).toBe("")
		})
	})
	describe("attrs", () => {
		test("handles string attr", () => {
			const vnode = m("div", {a: "b"})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
		})
		test("handles falsy string attr", () => {
			const vnode = m("div", {a: ""})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("")
		})
		test("handles number attr", () => {
			const vnode = m("div", {a: 1})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe(1)
		})
		test("handles falsy number attr", () => {
			const vnode = m("div", {a: 0})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe(0)
		})
		test("handles boolean attr", () => {
			const vnode = m("div", {a: true})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe(true)
		})
		test("handles falsy boolean attr", () => {
			const vnode = m("div", {a: false})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe(false)
		})
		test("handles only key in attrs", () => {
			const vnode = m("div", {key:"a"})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs).toEqual({key:"a"})
			expect(vnode.key).toBe("a")
		})
		test("handles many attrs", () => {
			const vnode = m("div", {a: "b", c: "d"})

			expect(vnode.tag).toBe("div")
			expect(vnode.attrs.a).toBe("b")
			expect(vnode.attrs.c).toBe("d")
		})
		test("handles className attrs property", () => {
			const vnode = m("div", {className: "a"})

			expect(vnode.attrs.className).toBe("a")
		})
		test("handles 'class' as a verbose attribute declaration", () => {
			const vnode = m("[class=a]")

			expect(vnode.attrs.className).toContain("a")
		})
		test("handles merging classes w/ class property", () => {
			const vnode = m(".a", {class: "b"})

			expect(vnode.attrs.className).toBe("a b")
		})
		test("handles merging classes w/ className property", () => {
			const vnode = m(".a", {className: "b"})

			expect(vnode.attrs.className).toBe("a b")
		})
	})
	describe("custom element attrs", () => {
		test("handles string attr", () => {
			const vnode = m("custom-element", {a: "b"})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe("b")
		})
		test("handles falsy string attr", () => {
			const vnode = m("custom-element", {a: ""})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe("")
		})
		test("handles number attr", () => {
			const vnode = m("custom-element", {a: 1})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe(1)
		})
		test("handles falsy number attr", () => {
			const vnode = m("custom-element", {a: 0})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe(0)
		})
		test("handles boolean attr", () => {
			const vnode = m("custom-element", {a: true})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe(true)
		})
		test("handles falsy boolean attr", () => {
			const vnode = m("custom-element", {a: false})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe(false)
		})
		test("handles only key in attrs", () => {
			const vnode = m("custom-element", {key:"a"})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs).toEqual({key:"a"})
			expect(vnode.key).toBe("a")
		})
		test("handles many attrs", () => {
			const vnode = m("custom-element", {a: "b", c: "d"})

			expect(vnode.tag).toBe("custom-element")
			expect(vnode.attrs.a).toBe("b")
			expect(vnode.attrs.c).toBe("d")
		})
		test("handles className attrs property", () => {
			const vnode = m("custom-element", {className: "a"})

			expect(vnode.attrs.className).toBe("a")
		})
		test("casts className using toString like browsers", () => {
			const className = {
				valueOf: () => ".valueOf",
				toString: () => "toString"
			}
			const vnode = m("custom-element" + className, {className: className})

			expect(vnode.attrs.className).toBe("valueOf .valueOf")
		})
	})
	describe("children", () => {
		test("handles string single child", () => {
			const vnode = m("div", {}, ["a"])

			expect(vnode.children[0].children).toBe("a")
		})
		test("handles falsy string single child", () => {
			const vnode = m("div", {}, [""])

			expect(vnode.children[0].children).toBe("")
		})
		test("handles number single child", () => {
			const vnode = m("div", {}, [1])

			expect(vnode.children[0].children).toBe("1")
		})
		test("handles falsy number single child", () => {
			const vnode = m("div", {}, [0])

			expect(vnode.children[0].children).toBe("0")
		})
		test("handles boolean single child", () => {
			const vnode = m("div", {}, [true])

			expect(vnode.children).toEqual([null])
		})
		test("handles falsy boolean single child", () => {
			const vnode = m("div", {}, [false])

			expect(vnode.children).toEqual([null])
		})
		test("handles null single child", () => {
			const vnode = m("div", {}, [null])

			expect(vnode.children).toEqual([null])
		})
		test("handles undefined single child", () => {
			const vnode = m("div", {}, [undefined])

			expect(vnode.children).toEqual([null])
		})
		test("handles multiple string children", () => {
			const vnode = m("div", {}, ["", "a"])

			expect(vnode.children[0].tag).toBe("#")
			expect(vnode.children[0].children).toBe("")
			expect(vnode.children[1].tag).toBe("#")
			expect(vnode.children[1].children).toBe("a")
		})
		test("handles multiple number children", () => {
			const vnode = m("div", {}, [0, 1])

			expect(vnode.children[0].tag).toBe("#")
			expect(vnode.children[0].children).toBe("0")
			expect(vnode.children[1].tag).toBe("#")
			expect(vnode.children[1].children).toBe("1")
		})
		test("handles multiple boolean children", () => {
			const vnode = m("div", {}, [false, true])

			expect(vnode.children).toEqual([null, null])
		})
		test("handles multiple null/undefined child", () => {
			const vnode = m("div", {}, [null, undefined])

			expect(vnode.children).toEqual([null, null])
		})
		test("handles falsy number single child without attrs", () => {
			const vnode = m("div", 0)

			expect(vnode.children[0].children).toBe("0")
		})
	})
	describe("permutations", () => {
		test("handles null attr and children", () => {
			const vnode = m("div", null, [m("a"), m("b")])

			expect(vnode.children.length).toBe(2)
			expect(vnode.children[0].tag).toBe("a")
			expect(vnode.children[1].tag).toBe("b")
		})
		test("handles null attr and child unwrapped", () => {
			const vnode = m("div", null, m("a"))

			expect(vnode.children.length).toBe(1)
			expect(vnode.children[0].tag).toBe("a")
		})
		test("handles null attr and children unwrapped", () => {
			const vnode = m("div", null, m("a"), m("b"))

			expect(vnode.children.length).toBe(2)
			expect(vnode.children[0].tag).toBe("a")
			expect(vnode.children[1].tag).toBe("b")
		})
		test("handles attr and children", () => {
			const vnode = m("div", {a: "b"}, [m("i"), m("s")])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].tag).toBe("i")
			expect(vnode.children[1].tag).toBe("s")
		})
		test("handles attr and child unwrapped", () => {
			const vnode = m("div", {a: "b"}, m("i"))

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].tag).toBe("i")
		})
		test("handles attr and children unwrapped", () => {
			const vnode = m("div", {a: "b"}, m("i"), m("s"))

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].tag).toBe("i")
			expect(vnode.children[1].tag).toBe("s")
		})
		test("handles attr and text children", () => {
			const vnode = m("div", {a: "b"}, ["c", "d"])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].tag).toBe("#")
			expect(vnode.children[0].children).toBe("c")
			expect(vnode.children[1].tag).toBe("#")
			expect(vnode.children[1].children).toBe("d")
		})
		test("handles attr and single string text child", () => {
			const vnode = m("div", {a: "b"}, ["c"])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].children).toBe("c")
		})
		test("handles attr and single falsy string text child", () => {
			const vnode = m("div", {a: "b"}, [""])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].children).toBe("")
		})
		test("handles attr and single number text child", () => {
			const vnode = m("div", {a: "b"}, [1])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].children).toBe("1")
		})
		test("handles attr and single falsy number text child", () => {
			const vnode = m("div", {a: "b"}, [0])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].children).toBe("0")
		})
		test("handles attr and single boolean text child", () => {
			const vnode = m("div", {a: "b"}, [true])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children).toEqual([null])
		})
		test("handles attr and single falsy boolean text child", () => {
			const vnode = m("div", {a: "b"}, [0])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].children).toBe("0")
		})
		test("handles attr and single false boolean text child", () => {
			const vnode = m("div", {a: "b"}, [false])

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children).toEqual([null])
		})
		test("handles attr and single text child unwrapped", () => {
			const vnode = m("div", {a: "b"}, "c")

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].children).toBe("c")
		})
		test("handles attr and text children unwrapped", () => {
			const vnode = m("div", {a: "b"}, "c", "d")

			expect(vnode.attrs.a).toBe("b")
			expect(vnode.children[0].tag).toBe("#")
			expect(vnode.children[0].children).toBe("c")
			expect(vnode.children[1].tag).toBe("#")
			expect(vnode.children[1].children).toBe("d")
		})
		test("handles children without attr", () => {
			const vnode = m("div", [m("i"), m("s")])

			expect(vnode.attrs).toEqual({})
			expect(vnode.children[0].tag).toBe("i")
			expect(vnode.children[1].tag).toBe("s")
		})
		test("handles child without attr unwrapped", () => {
			const vnode = m("div", m("i"))

			expect(vnode.attrs).toEqual({})
			expect(vnode.children[0].tag).toBe("i")
		})
		test("handles children without attr unwrapped", () => {
			const vnode = m("div", m("i"), m("s"))

			expect(vnode.attrs).toEqual({})
			expect(vnode.children[0].tag).toBe("i")
			expect(vnode.children[1].tag).toBe("s")
		})
		test("handles shared attrs", () => {
			const attrs = {a: "b"}

			const nodeA = m(".a", attrs)
			const nodeB = m(".b", attrs)

			expect(nodeA.attrs.className).toContain("a")
			expect(nodeA.attrs.a).toBe("b")

			expect(nodeB.attrs.className).toContain("b")
			expect(nodeB.attrs.a).toBe("b")
		})
		test("handles shared empty attrs (#2821)", () => {
			const attrs = {}

			const nodeA = m(".a", attrs)
			const nodeB = m(".b", attrs)

			expect(nodeA.attrs.className).toContain("a")
			expect(nodeB.attrs.className).toContain("b")
		})
		test("doesnt modify passed attributes object", () => {
			const attrs = {a: "b"}
			m(".a", attrs)
			expect(attrs).toEqual({a: "b"})
		})
		test("non-nullish attr takes precedence over selector", () => {
			const vnode = m("[a=b]", {a: "c"})
			expect(vnode.attrs.a).toBe("c")
		})
		test("null attr takes precedence over selector", () => {
			const vnode = m("[a=b]", {a: null})
			expect(vnode.attrs.a).toBe(null)
		})
		test("undefined attr takes precedence over selector", () => {
			const vnode = m("[a=b]", {a: undefined})
			expect(vnode.attrs.a).toBe(undefined)
		})
		test("handles fragment children without attr unwrapped", () => {
			const vnode = m("div", [m("i")], [m("s")])

			expect(vnode.children[0].tag).toBe("[")
			expect(vnode.children[0].children[0].tag).toBe("i")
			expect(vnode.children[1].tag).toBe("[")
			expect(vnode.children[1].children[0].tag).toBe("s")
		})
		test("handles children with nested array", () => {
			const vnode = m("div", [[m("i"), m("s")]])

			expect(vnode.children[0].tag).toBe("[")
			expect(vnode.children[0].children[0].tag).toBe("i")
			expect(vnode.children[0].children[1].tag).toBe("s")
		})
		test("handles children with deeply nested array", () => {
			const vnode = m("div", [[[m("i"), m("s")]]])

			expect(vnode.children[0].tag).toBe("[")
			expect(vnode.children[0].children[0].tag).toBe("[")
			expect(vnode.children[0].children[0].children[0].tag).toBe("i")
			expect(vnode.children[0].children[0].children[1].tag).toBe("s")
		})
	})
	describe("components", () => {
		test("works with POJOs", () => {
			const component = {
				view: function() {}
			}
			const vnode = m(component, {id: "a"}, "b")

			expect(vnode.tag).toBe(component)
			expect(vnode.attrs.id).toBe("a")
			expect(vnode.children.length).toBe(1)
			expect(vnode.children[0]).toBe("b")
		})
		test("works with constructibles", () => {
			function Component() {}
			Component.prototype.view = function() {}

			const vnode = m(Component, {id: "a"}, "b")

			expect(vnode.tag).toBe(Component)
			expect(vnode.attrs.id).toBe("a")
			expect(vnode.children.length).toBe(1)
			expect(vnode.children[0]).toBe("b")
		})
		test("works with closures", () => {
			const component = mock(() => {})

			const vnode = m(component, {id: "a"}, "b")

			expect(component.mock.calls.length).toBe(0)

			expect(vnode.tag).toBe(component)
			expect(vnode.attrs.id).toBe("a")
			expect(vnode.children.length).toBe(1)
			expect(vnode.children[0]).toBe("b")
		})
	})
})
