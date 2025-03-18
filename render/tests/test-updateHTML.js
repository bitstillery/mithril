"use strict"

import { describe, test, beforeEach, expect } from "bun:test"
import domMock from "../../test-utils/domMock"
import vdom from "../../render/render"
import m from "../../render/hyperscript"
import trust from "../../render/trust"

describe("updateHTML", () => {
	let $window, root, render
	beforeEach(() => {
		$window = domMock()
		root = $window.document.createElement("div")
		render = vdom($window)
	})

	test("updates html", () => {
		const vnode = trust("a")
		const updated = trust("b")

		render(root, vnode)
		render(root, updated)

		expect(updated.dom).toBe(root.firstChild)
		expect(updated.domSize).toBe(1)
		expect(updated.dom.nodeValue).toBe("b")
	})

	test("adds html", () => {
		const vnode = trust("")
		const updated = trust("<a></a><b></b>")

		render(root, vnode)
		render(root, updated)

		expect(updated.domSize).toBe(2)
		expect(updated.dom).toBe(root.firstChild)
		expect(root.childNodes.length).toBe(2)
		expect(root.childNodes[0].nodeName).toBe("A")
		expect(root.childNodes[1].nodeName).toBe("B")
	})

	test("removes html", () => {
		const vnode = trust("<a></a><b></b>")
		const updated = trust("")

		render(root, vnode)
		render(root, updated)

		expect(updated.dom).toBe(null)
		expect(updated.domSize).toBe(0)
		expect(root.childNodes.length).toBe(0)
	})

	function childKeysOf(elem, key) {
		const keys = key.split(".")
		const result = []
		for (let i = 0; i < elem.childNodes.length; i++) {
			let child = elem.childNodes[i]
			for (let j = 0; j < keys.length; j++) child = child[keys[j]]
			result.push(child)
		}
		return result
	}

	test("updates the dom correctly with a contenteditable parent", () => {
		const div = m("div", {contenteditable: true}, trust("<a></a>"))

		render(root, div)
		expect(childKeysOf(div.dom, "nodeName")).toEqual(["A"])
	})

	test("updates dom with multiple text children", () => {
		const vnode = ["a", trust("<a></a>"), trust("<b></b>")]
		const replacement = ["a", trust("<c></c>"), trust("<d></d>")]

		render(root, vnode)
		render(root, replacement)

		expect(childKeysOf(root, "nodeName")).toEqual(["#text", "C", "D"])
	})

	test("updates dom with multiple text children in other parents", () => {
		const vnode = [
			m("div", "a", trust("<a></a>")),
			m("div", "b", trust("<b></b>")),
		]
		const replacement = [
			m("div", "c", trust("<c></c>")),
			m("div", "d", trust("<d></d>")),
		]

		render(root, vnode)
		render(root, replacement)

		expect(childKeysOf(root, "nodeName")).toEqual(["DIV", "DIV"])
		expect(childKeysOf(root.childNodes[0], "nodeName")).toEqual(["#text", "C"])
		expect(root.childNodes[0].firstChild.nodeValue).toBe("c")
		expect(childKeysOf(root.childNodes[1], "nodeName")).toEqual(["#text", "D"])
		expect(root.childNodes[1].firstChild.nodeValue).toBe("d")
	})

	test("correctly diffs if followed by another trusted vnode", () => {
		render(root, [
			trust("<span>A</span>"),
			trust("<span>A</span>"),
		])
		expect(childKeysOf(root, "nodeName")).toEqual(["SPAN", "SPAN"])
		expect(childKeysOf(root, "firstChild.nodeValue")).toEqual(["A", "A"])

		render(root, [
			trust("<span>B</span>"),
			trust("<span>A</span>"),
		])
		expect(childKeysOf(root, "nodeName")).toEqual(["SPAN", "SPAN"])
		expect(childKeysOf(root, "firstChild.nodeValue")).toEqual(["B", "A"])

		render(root, [
			trust("<span>B</span>"),
			trust("<span>B</span>"),
		])
		expect(childKeysOf(root, "nodeName")).toEqual(["SPAN", "SPAN"])
		expect(childKeysOf(root, "firstChild.nodeValue")).toEqual(["B", "B"])
	})
})
