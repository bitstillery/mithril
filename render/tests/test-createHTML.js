import { describe, test, expect, beforeEach } from "bun:test";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";
import m from "../../render/hyperscript";
import trust from "../../render/trust";

describe("createHTML", () => {
	let $window, root, render;
	beforeEach(() => {
		$window = domMock();
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	test("creates HTML", () => {
		const vnode = trust("<a></a>");
		render(root, vnode);

		expect(vnode.dom.nodeName).toBe("A");
	});

	test("creates text HTML", () => {
		const vnode = trust("a");
		render(root, vnode);

		expect(vnode.dom.nodeValue).toBe("a");
	});

	test("handles empty HTML", () => {
		const vnode = trust("");
		render(root, vnode);

		expect(vnode.dom).toBe(null);
		expect(vnode.domSize).toBe(0);
	});

	test("handles multiple children in HTML", () => {
		const vnode = trust("<a></a><b></b>");
		render(root, vnode);

		expect(vnode.domSize).toBe(2);
		expect(vnode.dom.nodeName).toBe("A");
		expect(vnode.dom.nextSibling.nodeName).toBe("B");
	});

	test("handles valid html tags", () => {
		//FIXME body,head,html,frame,frameset are not supported
		//FIXME keygen is broken in Firefox
		const tags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", /*"body",*/ "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", /*"frame", "frameset",*/ "h1", "h2", "h3", "h4", "h5", "h6", /*"head",*/ "header", "hr", /*"html",*/ "i", "iframe", "img", "input", "ins", "kbd", /*"keygen", */"label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];

		tags.forEach((tag) => {
			const vnode = trust("<" + tag + " />");
			render(root, vnode);

			expect(vnode.dom.nodeName).toBe(tag.toUpperCase());
		});
	});

	test("creates SVG", () => {
		const vnode = trust("<g></g>");
		render(root, m("svg", vnode));

		expect(vnode.dom.nodeName).toBe("g");
		expect(vnode.dom.namespaceURI).toBe("http://www.w3.org/2000/svg");
	});

	test("creates text SVG", () => {
		const vnode = trust("a");
		render(root, m("svg", vnode));

		expect(vnode.dom.nodeValue).toBe("a");
	});

	test("handles empty SVG", () => {
		const vnode = trust("");
		render(root, m("svg", vnode));

		expect(vnode.dom).toBe(null);
		expect(vnode.domSize).toBe(0);
	});

	test("handles multiple children in SVG", () => {
		const vnode = trust("<g></g><text></text>");
		render(root, m("svg", vnode));

		expect(vnode.domSize).toBe(2);
		expect(vnode.dom.nodeName).toBe("g");
		expect(vnode.dom.namespaceURI).toBe("http://www.w3.org/2000/svg");
		expect(vnode.dom.nextSibling.nodeName).toBe("text");
		expect(vnode.dom.nextSibling.namespaceURI).toBe("http://www.w3.org/2000/svg");
	});

	test("creates the dom correctly with a contenteditable parent", () => {
		const div = m("div", {contenteditable: true}, trust("<a></a>"));

		render(root, div);
		const tags = [];
		for (let i = 0; i < div.dom.childNodes.length; i++) {
			tags.push(div.dom.childNodes[i].nodeName);
		}
		expect(tags).toEqual(["A"]);
	});
});
