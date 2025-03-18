"use strict"

import { describe, test, expect, beforeEach, mock } from "bun:test";
import domMock from "../../test-utils/domMock";
import vdom from "../../render/render";
import m from "../../render/hyperscript";
import trust from "../../render/trust";

describe("attributes", () => {
	let $window, root, render;

	beforeEach(() => {
		$window = domMock();
		root = $window.document.body;
		render = vdom($window);
	});

	describe("basics", () => {
		test("works (create/update/remove)", () => {
			const a = m("div");
			const b = m("div", {id: "test"});
			const c = m("div");

			render(root, a);
			expect(a.dom.hasAttribute("id")).toBe(false);

			render(root, b);
			expect(b.dom.getAttribute("id")).toBe("test");

			render(root, c);
			expect(c.dom.hasAttribute("id")).toBe(false);
		});

		test("undefined attr is equivalent to a lack of attr", () => {
			const a = m("div", {id: undefined});
			const b = m("div", {id: "test"});
			const c = m("div", {id: undefined});

			render(root, a);
			expect(a.dom.hasAttribute("id")).toBe(false);

			render(root, b);
			expect(b.dom.hasAttribute("id")).toBe(true);
			expect(b.dom.getAttribute("id")).toBe("test");

			// #1804
			render(root, c);
			expect(c.dom.hasAttribute("id")).toBe(false);
		});
	});

	describe("customElements", () => {
		test("when vnode is customElement without property, custom setAttribute called", () => {
			const f = $window.document.createElement;
			const spies = [];

			$window.document.createElement = function(tag, is) {
				const el = f(tag, is);
				const spy = mock(el.setAttribute);
				el.setAttribute = spy;
				spies.push(spy);
				spy.elem = el;
				return el;
			};

			render(root, [
				m("input", {value: "hello"}),
				m("input", {value: "hello"}),
				m("input", {value: "hello"}),
				m("custom-element", {custom: "x"}),
				m("input", {is: "something-special", custom: "x"}),
				m("custom-element", {is: "something-special", custom: "x"})
			]);

			expect(spies[1].mock.calls.length).toBe(0);
			expect(spies[0].mock.calls.length).toBe(0);
			expect(spies[2].mock.calls.length).toBe(0);
			expect(spies[3].mock.calls).toEqual([["custom", "x"]]);
			expect(spies[4].mock.calls).toEqual([
				["is", "something-special"],
				["custom", "x"]
			]);
			expect(spies[5].mock.calls).toEqual([
				["is", "something-special"],
				["custom", "x"]
			]);
		});

		test("when vnode is customElement with property, custom setAttribute not called", () => {
			const f = $window.document.createElement;
			const spies = [];
			const getters = [];
			const setters = [];

			$window.document.createElement = function(tag, is) {
				const el = f(tag, is);
				const spy = mock(el.setAttribute);
				el.setAttribute = spy;
				spies.push(spy);
				spy.elem = el;
				if (tag === "custom-element" || is && is.is === "something-special") {
					let custom = "foo";
					const getter = mock(function () { return custom; });
					const setter = mock(function (value) { custom = value; });
					Object.defineProperty(el, "custom", {
						configurable: true,
						enumerable: true,
						get: getter,
						set: setter
					});
					getters.push(getter);
					setters.push(setter);
				}
				return el;
			};

			render(root, [
				m("input", {value: "hello"}),
				m("input", {value: "hello"}),
				m("input", {value: "hello"}),
				m("custom-element", {custom: "x"}),
				m("input", {is: "something-special", custom: "x"}),
				m("custom-element", {is: "something-special", custom: "x"})
			]);

			expect(spies[0].mock.calls.length).toBe(0);
			expect(spies[1].mock.calls.length).toBe(0);
			expect(spies[2].mock.calls.length).toBe(0);
			expect(spies[3].mock.calls.length).toBe(0);
			expect(spies[4].mock.calls.length).toBe(1);
			expect(spies[5].mock.calls.length).toBe(1);
			expect(getters[0].mock.calls.length).toBe(0);
			expect(getters[1].mock.calls.length).toBe(0);
			expect(getters[2].mock.calls.length).toBe(0);
			expect(setters[0].mock.calls).toEqual([["x"]]);
			expect(setters[1].mock.calls).toEqual([["x"]]);
			expect(setters[2].mock.calls).toEqual([["x"]]);
		});
	});

	describe("input readonly", () => {
		test("when input readonly is true, attribute is present", () => {
			const a = m("input", {readonly: true});
			render(root, a);
			expect(a.dom.attributes["readonly"].value).toBe("");
		});

		test("when input readonly is false, attribute is not present", () => {
			const a = m("input", {readonly: false});
			render(root, a);
			expect(a.dom.attributes["readonly"]).toBe(undefined);
		});
	});

	describe("input checked", () => {
		test("when input checked is true, attribute is not present", () => {
			const a = m("input", {checked: true});
			render(root, a);
			expect(a.dom.checked).toBe(true);
			expect(a.dom.attributes["checked"]).toBe(undefined);
		});

		test("when input checked is false, attribute is not present", () => {
			const a = m("input", {checked: false});
			render(root, a);
			expect(a.dom.checked).toBe(false);
			expect(a.dom.attributes["checked"]).toBe(undefined);
		});

		test("after input checked is changed by 3rd party, it can still be changed by render", () => {
			const a = m("input", {checked: false});
			const b = m("input", {checked: true});

			render(root, a);
			a.dom.checked = true; //setting the javascript property makes the value no longer track the state of the attribute
			a.dom.checked = false;

			render(root, b);
			expect(a.dom.checked).toBe(true);
			expect(a.dom.attributes["checked"]).toBe(undefined);
		});
	});

	describe("input.value", () => {
		test("can be set as text", () => {
			const a = m("input", {value: "test"});
			render(root, a);
			expect(a.dom.value).toBe("test");
		});

		test("a lack of attribute removes `value`", () => {
			const a = m("input");
			const b = m("input", {value: "test"});
			const c = m("input");

			render(root, a);
			expect(a.dom.value).toBe("");

			render(root, b);
			expect(a.dom.value).toBe("test");

			// https://github.com/MithrilJS/mithril.js/issues/1804#issuecomment-304521235
			render(root, c);
			expect(a.dom.value).toBe("");
		});

		test("can be set as number", () => {
			const a = m("input", {value: 1});
			render(root, a);
			expect(a.dom.value).toBe("1");
		});

		test("null becomes the empty string", () => {
			const a = m("input", {value: null});
			const b = m("input", {value: "test"});
			const c = m("input", {value: null});

			render(root, a);
			expect(a.dom.value).toBe("");
			expect(a.dom.getAttribute("value")).toBe(null);

			render(root, b);
			expect(b.dom.value).toBe("test");
			expect(b.dom.getAttribute("value")).toBe(null);

			render(root, c);
			expect(c.dom.value).toBe("");
			expect(c.dom.getAttribute("value")).toBe(null);
		});

		test("'' and 0 are different values", () => {
			const a = m("input", {value: 0});
			const b = m("input", {value: ""});
			const c = m("input", {value: 0});

			render(root, a);
			expect(a.dom.value).toBe("0");

			render(root, b);
			expect(b.dom.value).toBe("");

			// #1595 redux
			render(root, c);
			expect(c.dom.value).toBe("0");
		});

		test("isn't set when equivalent to the previous value and focused", () => {
			const $window = domMock({spy: mock});
			const root = $window.document.body;
			const render = vdom($window);

			const a = m("input");
			const b = m("input", {value: "1"});
			const c = m("input", {value: "1"});
			const d = m("input", {value: 1});
			const e = m("input", {value: 2});

			render(root, a);
			const spies = $window.__getSpies(a.dom);
			a.dom.focus();

			expect(spies.valueSetter.mock.calls.length).toBe(0);

			render(root, b);
			expect(b.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, c);
			expect(c.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, d);
			expect(d.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, e);
			expect(d.dom.value).toBe("2");
			expect(spies.valueSetter.mock.calls.length).toBe(2);
		});
	});

	describe("input.type", () => {
		test("the input.type setter is never used", () => {
			const $window = domMock({spy: mock});
			const root = $window.document.body;
			const render = vdom($window);

			const a = m("input", {type: "radio"});
			const b = m("input", {type: "text"});
			const c = m("input");

			render(root, a);
			const spies = $window.__getSpies(a.dom);

			expect(spies.typeSetter.mock.calls.length).toBe(0);
			expect(a.dom.getAttribute("type")).toBe("radio");

			render(root, b);
			expect(spies.typeSetter.mock.calls.length).toBe(0);
			expect(b.dom.getAttribute("type")).toBe("text");

			render(root, c);
			expect(spies.typeSetter.mock.calls.length).toBe(0);
			expect(c.dom.hasAttribute("type")).toBe(false);
		});
	});

	describe("textarea.value", () => {
		test("can be removed by not passing a value", () => {
			const a = m("textarea", {value:"x"});
			const b = m("textarea");

			render(root, a);
			expect(a.dom.value).toBe("x");

			// https://github.com/MithrilJS/mithril.js/issues/1804#issuecomment-304521235
			render(root, b);
			expect(b.dom.value).toBe("");
		});

		test("isn't set when equivalent to the previous value and focused", () => {
			const $window = domMock({spy: mock});
			const root = $window.document.body;
			const render = vdom($window);

			const a = m("textarea");
			const b = m("textarea", {value: "1"});
			const c = m("textarea", {value: "1"});
			const d = m("textarea", {value: 1});
			const e = m("textarea", {value: 2});

			render(root, a);
			const spies = $window.__getSpies(a.dom);
			a.dom.focus();

			expect(spies.valueSetter.mock.calls.length).toBe(0);

			render(root, b);
			expect(b.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, c);
			expect(c.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, d);
			expect(d.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, e);
			expect(d.dom.value).toBe("2");
			expect(spies.valueSetter.mock.calls.length).toBe(2);
		});
	});

	describe("link href", () => {
		test("when link href is true, attribute is present", () => {
			const a = m("a", {href: true});
			render(root, a);
			expect(a.dom.attributes["href"]).not.toBe(undefined);
		});

		test("when link href is false, attribute is not present", () => {
			const a = m("a", {href: false});
			render(root, a);
			expect(a.dom.attributes["href"]).toBe(undefined);
		});
	});

	describe("canvas width and height", () => {
		test("uses attribute API", () => {
			const canvas = m("canvas", {width: "100%"});
			render(root, canvas);
			expect(canvas.dom.attributes["width"].value).toBe("100%");
			expect(canvas.dom.width).toBe(100);
		});
	});

	describe("svg", () => {
		test("when className is specified then it should be added as a class", () => {
			const a = m("svg", {className: "test"});
			render(root, a);
			expect(a.dom.attributes["class"].value).toBe("test");
		});

		/* eslint-disable no-script-url */
		test("handles xlink:href", () => {
			let vnode = m("svg", {ns: "http://www.w3.org/2000/svg"},
				m("a", {ns: "http://www.w3.org/2000/svg", "xlink:href": "javascript:;"})
			);
			render(root, vnode);

			expect(vnode.dom.nodeName).toBe("svg");
			expect(vnode.dom.firstChild.attributes["href"].value).toBe("javascript:;");
			expect(vnode.dom.firstChild.attributes["href"].namespaceURI).toBe("http://www.w3.org/1999/xlink");

			vnode = m("svg", {ns: "http://www.w3.org/2000/svg"},
				m("a", {ns: "http://www.w3.org/2000/svg"})
			);
			render(root, vnode);

			expect(vnode.dom.nodeName).toBe("svg");
			expect("href" in vnode.dom.firstChild.attributes).toBe(false);
		});
		/* eslint-enable no-script-url */
	});

	describe("option.value", () => {
		test("can be set as text", () => {
			const a = m("option", {value: "test"});
			render(root, a);
			expect(a.dom.value).toBe("test");
		});

		test("can be set as number", () => {
			const a = m("option", {value: 1});
			render(root, a);
			expect(a.dom.value).toBe("1");
		});

		test("null removes the attribute", () => {
			const a = m("option", {value: null});
			const b = m("option", {value: "test"});
			const c = m("option", {value: null});

			render(root, a);
			expect(a.dom.value).toBe("");
			expect(a.dom.hasAttribute("value")).toBe(false);

			render(root, b);
			expect(b.dom.value).toBe("test");
			expect(b.dom.getAttribute("value")).toBe("test");

			render(root, c);
			expect(c.dom.value).toBe("");
			expect(c.dom.hasAttribute("value")).toBe(false);
		});

		test("'' and 0 are different values", () => {
			const a = m("option", {value: 0}, "");
			const b = m("option", {value: ""}, "");
			const c = m("option", {value: 0}, "");

			render(root, a);
			expect(a.dom.value).toBe("0");

			render(root, b);
			expect(a.dom.value).toBe("");

			// #1595 redux
			render(root, c);
			expect(c.dom.value).toBe("0");
		});

		test("isn't set when equivalent to the previous value", () => {
			const $window = domMock({spy: mock});
			const root = $window.document.body;
			const render = vdom($window);

			const a = m("option");
			const b = m("option", {value: "1"});
			const c = m("option", {value: "1"});
			const d = m("option", {value: 1});
			const e = m("option", {value: 2});

			render(root, a);
			const spies = $window.__getSpies(a.dom);

			expect(spies.valueSetter.mock.calls.length).toBe(0);

			render(root, b);
			expect(b.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, c);
			expect(c.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, d);
			expect(d.dom.value).toBe("1");
			expect(spies.valueSetter.mock.calls.length).toBe(1);

			render(root, e);
			expect(d.dom.value).toBe("2");
			expect(spies.valueSetter.mock.calls.length).toBe(2);
		});
	});

	describe("select.value", () => {
		function makeSelect(value) {
			const attrs = (arguments.length === 0) ? {} : {value: value};
			return m("select", attrs,
				m("option", {value: "1"}),
				m("option", {value: "2"}),
				m("option", {value: "a"}),
				m("option", {value: "0"}),
				m("option", {value: ""})
			);
		}

		test("can be set as text", () => {
			const a = makeSelect();
			const b = makeSelect("2");
			const c = makeSelect("a");

			render(root, a);
			expect(a.dom.value).toBe("1");
			expect(a.dom.selectedIndex).toBe(0);

			render(root, b);
			expect(b.dom.value).toBe("2");
			expect(b.dom.selectedIndex).toBe(1);

			render(root, c);
			expect(c.dom.value).toBe("a");
			expect(c.dom.selectedIndex).toBe(2);
		});

		test("setting null unsets the value", () => {
			const a = makeSelect(null);
			render(root, a);
			expect(a.dom.value).toBe("");
			expect(a.dom.selectedIndex).toBe(-1);
		});

		test("values are type converted", () => {
			const a = makeSelect(1);
			const b = makeSelect(2);

			render(root, a);
			expect(a.dom.value).toBe("1");
			expect(a.dom.selectedIndex).toBe(0);

			render(root, b);
			expect(b.dom.value).toBe("2");
			expect(b.dom.selectedIndex).toBe(1);
		});

		test("'' and 0 are different values when focused", () => {
			const a = makeSelect("");
			const b = makeSelect(0);

			render(root, a);
			a.dom.focus();
			expect(a.dom.value).toBe("");

			// #1595 redux
			render(root, b);
			expect(b.dom.value).toBe("0");
		});

		test("'' and null are different values when focused", () => {
			const a = makeSelect("");
			const b = makeSelect(null);
			const c = makeSelect("");

			render(root, a);
			a.dom.focus();

			expect(a.dom.value).toBe("");
			expect(a.dom.selectedIndex).toBe(4);

			render(root, b);
			expect(b.dom.value).toBe("");
			expect(b.dom.selectedIndex).toBe(-1);

			render(root, c);
			expect(c.dom.value).toBe("");
			expect(c.dom.selectedIndex).toBe(4);
		});

		test("updates with the same value do not re-set the attribute if the select has focus", () => {
			const $window = domMock({spy: mock});
			const root = $window.document.body;
			const render = vdom($window);

			const a = makeSelect();
			const b = makeSelect("1");
			const c = makeSelect(1);
			const d = makeSelect("2");

			render(root, a);
			const spies = $window.__getSpies(a.dom);
			a.dom.focus();

			expect(spies.valueSetter.mock.calls.length).toBe(0);
			expect(a.dom.value).toBe("1");

			render(root, b);
			expect(spies.valueSetter.mock.calls.length).toBe(0);
			expect(b.dom.value).toBe("1");

			render(root, c);
			expect(spies.valueSetter.mock.calls.length).toBe(0);
			expect(c.dom.value).toBe("1");

			render(root, d);
			expect(spies.valueSetter.mock.calls.length).toBe(1);
			expect(d.dom.value).toBe("2");
		});
	});

	describe("contenteditable throws on untrusted children", () => {
		test("including elements", () => {
			const div = m("div", {contenteditable: true}, m("script", {src: "http://evil.com"}));
			let succeeded = false;

			try {
				render(root, div);
				succeeded = true;
			}
			catch(e) {
				// ignore
			}

			expect(succeeded).toBe(false);
		});

		test("tolerating empty children", () => {
			const div = m("div", {contenteditable: true});
			let succeeded = false;

			try {
				render(root, div);
				succeeded = true;
			}
			catch(e) {
				// ignore
			}

			expect(succeeded).toBe(true);
		});

		test("tolerating trusted content", () => {
			const div = m("div", {contenteditable: true}, trust("<a></a>"));
			let succeeded = false;

			try {
				render(root, div);
				succeeded = true;
			}
			catch(e) {
				// ignore
			}

			expect(succeeded).toBe(true);
		});
	});

	describe("mutate attr object", () => {
		test("warn when reusing attrs object", () => {
			const originalConsoleWarn = console.warn;
			console.warn = mock(() => {});

			const attrs = {className: "on"};
			render(root, {tag: "input", attrs});

			attrs.className = "off";
			render(root, {tag: "input", attrs});

			expect(console.warn.mock.calls.length).toBe(1);
			expect(console.warn.mock.calls[0][0]).toBe("Don't reuse attrs object, use new object for every redraw, this will throw in next major");

			console.warn = originalConsoleWarn;
		});
	});
});
