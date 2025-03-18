import { describe, test, expect, beforeEach, mock } from "bun:test";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";
import m from "../../render/hyperscript";

describe("updateElement", () => {
	let $window, root, render;
	beforeEach(() => {
		$window = domMock();
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	test("updates attr", () => {
		const vnode = m("a", {id: "b"});
		const updated = m("a", {id: "c"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom).toBe(vnode.dom);
		expect(updated.dom).toBe(root.firstChild);
		expect(updated.dom.attributes["id"].value).toBe("c");
	});

	test("adds attr", () => {
		const vnode = m("a", {id: "b"});
		const updated = m("a", {id: "c", title: "d"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom).toBe(vnode.dom);
		expect(updated.dom).toBe(root.firstChild);
		expect(updated.dom.attributes["title"].value).toBe("d");
	});

	test("adds attr from empty attrs", () => {
		const vnode = m("a");
		const updated = m("a", {title: "d"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom).toBe(vnode.dom);
		expect(updated.dom).toBe(root.firstChild);
		expect(updated.dom.attributes["title"].value).toBe("d");
	});

	test("removes attr", () => {
		const vnode = m("a", {id: "b", title: "d"});
		const updated = m("a", {id: "c"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom).toBe(vnode.dom);
		expect(updated.dom).toBe(root.firstChild);
		expect("title" in updated.dom.attributes).toBe(false);
	});

	test("removes class", () => {
		const vnode = m("a", {id: "b", className: "d"});
		const updated = m("a", {id: "c"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom).toBe(vnode.dom);
		expect(updated.dom).toBe(root.firstChild);
		expect("class" in updated.dom.attributes).toBe(false);
	});

	test("creates style object", () => {
		const vnode = m("a");
		const updated = m("a", {style: {backgroundColor: "green"}});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("creates style string", () => {
		const vnode = m("a");
		const updated = m("a", {style: "background-color:green"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("updates style from object to object", () => {
		const vnode = m("a", {style: {backgroundColor: "red"}});
		const updated = m("a", {style: {backgroundColor: "green"}});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("updates style from object to string", () => {
		const vnode = m("a", {style: {backgroundColor: "red"}});
		const updated = m("a", {style: "background-color:green;"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("handles noop style change when style is string", () => {
		const vnode = m("a", {style: "background-color:green;"});
		const updated = m("a", {style: "background-color:green;"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("handles noop style change when style is object", () => {
		const vnode = m("a", {style: {backgroundColor: "red"}});
		const updated = m("a", {style: {backgroundColor: "red"}});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("red");
	});

	test("updates style from string to object", () => {
		const vnode = m("a", {style: "background-color:red;"});
		const updated = m("a", {style: {backgroundColor: "green"}});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("updates style from string to string", () => {
		const vnode = m("a", {style: "background-color:red;"});
		const updated = m("a", {style: "background-color:green;"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("green");
	});

	test("removes style from object to object", () => {
		const vnode = m("a", {style: {backgroundColor: "red", border: "1px solid red"}});
		const updated = m("a", {style: {backgroundColor: "red"}});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("red");
		expect(updated.dom.style.border).toBe("");
	});

	test("removes style from string to object", () => {
		const vnode = m("a", {style: "background-color:red;border:1px solid red"});
		const updated = m("a", {style: {backgroundColor: "red"}});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("red");
		expect(updated.dom.style.border).not.toBe("1px solid red");
	});

	test("removes style from object to string", () => {
		const vnode = m("a", {style: {backgroundColor: "red", border: "1px solid red"}});
		const updated = m("a", {style: "background-color:red"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("red");
		expect(updated.dom.style.border).toBe("");
	});

	test("removes style from string to string", () => {
		const vnode = m("a", {style: "background-color:red;border:1px solid red"});
		const updated = m("a", {style: "background-color:red"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.style.backgroundColor).toBe("red");
		expect(updated.dom.style.border).toBe("");
	});

	test("does not re-render element styles for equivalent style objects", () => {
		let style = {color: "gold"};
		const vnode = m("a", {style: style});

		render(root, vnode);

		root.firstChild.style.color = "red";
		style = {color: "gold"};
		const updated = m("a", {style: style});
		render(root, updated);

		expect(updated.dom.style.color).toBe("red");
	});

	test("setting style to `null` removes all styles", () => {
		const vnode = m("p", {style: "background-color: red"});
		const updated = m("p", {style: null});

		render(root, vnode);

		expect("style" in vnode.dom.attributes).toBe(true);
		expect(vnode.dom.attributes.style.value).toBe("background-color: red;");

		render(root, updated);

		//browsers disagree here
		try {
			expect(updated.dom.attributes.style.value).toBe("");
		} catch (e) {
			expect("style" in updated.dom.attributes).toBe(false);
		}
	});

	test("setting style to `undefined` removes all styles", () => {
		const vnode = m("p", {style: "background-color: red"});
		const updated = m("p", {style: undefined});

		render(root, vnode);

		expect("style" in vnode.dom.attributes).toBe(true);
		expect(vnode.dom.attributes.style.value).toBe("background-color: red;");

		render(root, updated);

		//browsers disagree here
		try {
			expect(updated.dom.attributes.style.value).toBe("");
		} catch (e) {
			expect("style" in updated.dom.attributes).toBe(false);
		}
	});

	test("not setting style removes all styles", () => {
		const vnode = m("p", {style: "background-color: red"});
		const updated = m("p");

		render(root, vnode);

		expect("style" in vnode.dom.attributes).toBe(true);
		expect(vnode.dom.attributes.style.value).toBe("background-color: red;");

		render(root, updated);

		//browsers disagree here
		try {
			expect(updated.dom.attributes.style.value).toBe("");
		} catch (e) {
			expect("style" in updated.dom.attributes).toBe(false);
		}
	});

	test("use style property setter only when cameCase keys", () => {
		const spySetProperty = mock(() => {});
		const spyRemoveProperty = mock(() => {});
		const spyDashed1 = mock(() => {});
		const spyDashed2 = mock(() => {});
		const spyDashed3 = mock(() => {});
		const spyCamelCase1 = mock(() => {});
		const spyCamelCase2 = mock(() => {});

		render(root, m("a"));
		const el = root.firstChild;

		el.style.setProperty = spySetProperty;
		el.style.removeProperty = spyRemoveProperty;
		Object.defineProperties(el.style, {
			/* eslint-disable accessor-pairs */
			"background-color": {set: spyDashed1},
			"-webkit-border-radius": {set: spyDashed2},
			"--foo": {set: spyDashed3},
			backgroundColor: {set: spyCamelCase1},
			color: {set: spyCamelCase2}
			/* eslint-enable accessor-pairs */
		});

		// sets dashed properties
		render(root, m("a", {
			style: {
				"background-color": "red",
				"-webkit-border-radius": "10px",
				"--foo": "bar"
			}
		}));
		expect(spySetProperty.mock.calls.length).toBe(3);
		expect(spySetProperty.mock.calls[0]).toEqual(["background-color", "red"]);
		expect(spySetProperty.mock.calls[1]).toEqual(["-webkit-border-radius", "10px"]);
		expect(spySetProperty.mock.calls[2]).toEqual(["--foo", "bar"]);

		// sets camelCase properties and removes dashed properties
		render(root, m("a", {
			style: {
				backgroundColor: "green",
				color: "red",
			}
		}));
		expect(spyCamelCase1.mock.calls.length).toBe(1);
		expect(spyCamelCase2.mock.calls.length).toBe(1);
		expect(spyCamelCase1.mock.calls[0]).toEqual(["green"]);
		expect(spyCamelCase2.mock.calls[0]).toEqual(["red"]);
		expect(spyRemoveProperty.mock.calls.length).toBe(3);
		expect(spyRemoveProperty.mock.calls[0]).toEqual(["background-color"]);
		expect(spyRemoveProperty.mock.calls[1]).toEqual(["-webkit-border-radius"]);
		expect(spyRemoveProperty.mock.calls[2]).toEqual(["--foo"]);

		// updates "color" and removes "backgroundColor"
		render(root, m("a", {style: {color: "blue"}}));
		expect(spyCamelCase1.mock.calls.length).toBe(2); // set and remove
		expect(spyCamelCase2.mock.calls.length).toBe(2); // set and update
		expect(spyCamelCase1.mock.calls[1]).toEqual([""]);
		expect(spyCamelCase2.mock.calls[1]).toEqual(["blue"]);

		// unchanged by camelCase properties
		expect(spySetProperty.mock.calls.length).toBe(3);
		expect(spyRemoveProperty.mock.calls.length).toBe(3);

		// never calls dashed property setter
		expect(spyDashed1.mock.calls.length).toBe(0);
		expect(spyDashed2.mock.calls.length).toBe(0);
		expect(spyDashed3.mock.calls.length).toBe(0);
	});

	test("replaces el", () => {
		const vnode = m("a");
		const updated = m("b");

		render(root, vnode);
		render(root, updated);

		expect(updated.dom).toBe(root.firstChild);
		expect(updated.dom.nodeName).toBe("B");
	});

	test("updates svg class", () => {
		const vnode = m("svg", {className: "a"});
		const updated = m("svg", {className: "b"});

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.attributes["class"].value).toBe("b");
	});

	test("updates svg child", () => {
		const vnode = m("svg", m("circle"));
		const updated = m("svg", m("line"));

		render(root, vnode);
		render(root, updated);

		expect(updated.dom.firstChild.namespaceURI).toBe("http://www.w3.org/2000/svg");
	});

	test("doesn't restore since we're not recycling", () => {
		const vnode = m("div", {key: 1});
		const updated = m("div", {key: 2});

		render(root, vnode);
		const a = vnode.dom;

		render(root, updated);

		render(root, vnode);
		const c = vnode.dom;

		expect(root.childNodes.length).toBe(1);
		expect(a).not.toBe(c); // this used to be a recycling pool test
	});

	test("doesn't restore since we're not recycling (via map)", () => {
		const a = m("div", {key: 1});
		const b = m("div", {key: 2});
		const c = m("div", {key: 3});
		const d = m("div", {key: 4});
		const e = m("div", {key: 5});
		const f = m("div", {key: 6});

		render(root, [a, b, c]);
		const x = root.childNodes[1];

		render(root, d);

		render(root, [e, b, f]);
		const y = root.childNodes[1];

		expect(root.childNodes.length).toBe(3);
		expect(x).not.toBe(y); // this used to be a recycling pool test
	});

	describe("element node with `is` attribute", () => {
		test("recreate element node with `is` attribute (set `is`)", () => {
			const vnode = m("a");
			const updated = m("a", {is: "bar"});

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("bar");
		});

		test("recreate element node without `is` attribute (remove `is`)", () => {
			const vnode = m("a", {is: "foo"});
			const updated = m("a");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe(null);
		});

		test("recreate element node with `is` attribute (same tag, different `is`)", () => {
			const vnode = m("a", {is: "foo"});
			const updated = m("a", {is: "bar"});

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("bar");
		});

		test("recreate element node with `is` attribute (different tag, same `is`)", () => {
			const vnode = m("a", {is: "foo"});
			const updated = m("b", {is: "foo"});

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("B");
			expect(updated.dom.getAttribute("is")).toBe("foo");
		});

		test("recreate element node with `is` attribute (different tag, different `is`)", () => {
			const vnode = m("a", {is: "foo"});
			const updated = m("b", {is: "bar"});

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("B");
			expect(updated.dom.getAttribute("is")).toBe("bar");
		});

		test("keep element node with `is` attribute (same tag, same `is`)", () => {
			const vnode = m("a", {is: "foo"});
			const updated = m("a", {is: "foo"}, "x");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("foo");
			expect(updated.dom.firstChild.nodeValue).toBe("x");
		});

		test("recreate element node with `is` attribute (set `is`, CSS selector)", () => {
			const vnode = m("a");
			const updated = m("a[is=bar]");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("bar");
		});

		test("recreate element node without `is` attribute (remove `is`, CSS selector)", () => {
			const vnode = m("a[is=foo]");
			const updated = m("a");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe(null);
		});

		test("recreate element node with `is` attribute (same tag, different `is`, CSS selector)", () => {
			const vnode = m("a[is=foo]");
			const updated = m("a[is=bar]");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("bar");
		});

		test("recreate element node with `is` attribute (different tag, same `is`, CSS selector)", () => {
			const vnode = m("a[is=foo]");
			const updated = m("b[is=foo]");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("B");
			expect(updated.dom.getAttribute("is")).toBe("foo");
		});

		test("recreate element node with `is` attribute (different tag, different `is`, CSS selector)", () => {
			const vnode = m("a[is=foo]");
			const updated = m("b[is=bar]");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).not.toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("B");
			expect(updated.dom.getAttribute("is")).toBe("bar");
		});

		test("keep element node with `is` attribute (same tag, same `is`, CSS selector)", () => {
			const vnode = m("a[is=foo]");
			const updated = m("a[is=foo]", "x");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("foo");
			expect(updated.dom.firstChild.nodeValue).toBe("x");
		});

		test("keep element node with `is` attribute (same tag, same `is`, from attrs to CSS selector)", () => {
			const vnode = m("a", {is: "foo"});
			const updated = m("a[is=foo]", "x");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("foo");
			expect(updated.dom.firstChild.nodeValue).toBe("x");
		});

		test("keep element node with `is` attribute (same tag, same `is`, from CSS selector to attrs)", () => {
			const vnode = m("a[is=foo]");
			const updated = m("a", {is: "foo"}, "x");

			render(root, vnode);
			render(root, updated);

			expect(vnode.dom).toBe(root.firstChild);
			expect(updated.dom).toBe(root.firstChild);
			expect(updated.dom.nodeName).toBe("A");
			expect(updated.dom.getAttribute("is")).toBe("foo");
			expect(updated.dom.firstChild.nodeValue).toBe("x");
		});
	});
});
