"use strict"

import { describe, test, expect, beforeEach } from "bun:test";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";
import m from "../../render/hyperscript";

describe("createElement", () => {
	let $window, root, render;
	beforeEach(() => {
		$window = domMock();
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	test("creates element", () => {
		const vnode = m("div");
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("DIV");
	});

	test("creates attr", () => {
		const vnode = m("div", {id: "a", title: "b"});
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("DIV");
		expect(vnode.dom.attributes["id"].value).toBe("a");
		expect(vnode.dom.attributes["title"].value).toBe("b");
	});

	test("creates style", () => {
		const vnode = m("div", {style: {backgroundColor: "red"}});
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("DIV");
		expect(vnode.dom.style.backgroundColor).toBe("red");
	});

	test("allows css vars in style", () => {
		const vnode = m("div", {style: {"--css-var": "red"}});
		render(root, vnode);

		expect(vnode.dom.style["--css-var"]).toBe("red");
	});

	test("allows css vars in style with uppercase letters", () => {
		const vnode = m("div", {style: {"--cssVar": "red"}});
		render(root, vnode);

		expect(vnode.dom.style["--cssVar"]).toBe("red");
	});

	test("creates children", () => {
		const vnode = m("div", m("a"), m("b"));
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("DIV");
		expect(vnode.dom.childNodes.length).toBe(2);
		expect(vnode.dom.childNodes[0].nodeName).toBe("A");
		expect(vnode.dom.childNodes[1].nodeName).toBe("B");
	});

	test("creates attrs and children", () => {
		const vnode = m("div", {id: "a", title: "b"}, m("a"), m("b"));
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("DIV");
		expect(vnode.dom.attributes["id"].value).toBe("a");
		expect(vnode.dom.attributes["title"].value).toBe("b");
		expect(vnode.dom.childNodes.length).toBe(2);
		expect(vnode.dom.childNodes[0].nodeName).toBe("A");
		expect(vnode.dom.childNodes[1].nodeName).toBe("B");
	});

	/* eslint-disable no-script-url */
	test("creates svg", () => {
		const vnode = m("svg",
			m("a", {"xlink:href": "javascript:;"}),
			m("foreignObject", m("body", {xmlns: "http://www.w3.org/1999/xhtml"}))
		);
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("svg");
		expect(vnode.dom.namespaceURI).toBe("http://www.w3.org/2000/svg");
		expect(vnode.dom.firstChild.nodeName).toBe("a");
		expect(vnode.dom.firstChild.namespaceURI).toBe("http://www.w3.org/2000/svg");
		expect(vnode.dom.firstChild.attributes["href"].value).toBe("javascript:;");
		expect(vnode.dom.firstChild.attributes["href"].namespaceURI).toBe("http://www.w3.org/1999/xlink");
		expect(vnode.dom.childNodes[1].nodeName).toBe("foreignObject");
		expect(vnode.dom.childNodes[1].firstChild.nodeName).toBe("body");
		expect(vnode.dom.childNodes[1].firstChild.namespaceURI).toBe("http://www.w3.org/1999/xhtml");
	});
	/* eslint-enable no-script-url */

	test("sets attributes correctly for svg", () => {
		const vnode = m("svg", {viewBox: "0 0 100 100"});
		render(root, vnode);

		expect(vnode.dom.attributes["viewBox"].value).toBe("0 0 100 100");
	});

	test("creates mathml", () => {
		const vnode = m("math", m("mrow"));
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("math");
		expect(vnode.dom.namespaceURI).toBe("http://www.w3.org/1998/Math/MathML");
		expect(vnode.dom.firstChild.nodeName).toBe("mrow");
		expect(vnode.dom.firstChild.namespaceURI).toBe("http://www.w3.org/1998/Math/MathML");
	});
});
