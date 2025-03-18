"use strict"

import { describe, test, expect, beforeEach, mock } from "bun:test";
import domMock from "../../test-utils/domMock";
import vdom from "../../render/render";
import m from "../../render/hyperscript";
import fragment from "../../render/fragment";

describe("oncreate", () => {
	let $window, root, render;

	beforeEach(() => {
		$window = domMock();
		root = $window.document.createElement("div");
		render = vdom($window);
	});

	test("calls oncreate when creating element", () => {
		const callback = mock(() => {});
		const vnode = m("div", {oncreate: callback});

		render(root, vnode);

		expect(callback.mock.calls.length).toBe(1);
		// Note: this context is not directly trackable in Bun mocks
		expect(callback.mock.calls[0][0]).toBe(vnode);
	});

	test("calls oncreate when creating fragment", () => {
		const callback = mock(() => {});
		const vnode = fragment({oncreate: callback});

		render(root, vnode);

		expect(callback.mock.calls.length).toBe(1);
		expect(callback.mock.calls[0][0]).toBe(vnode);
	});

	test("calls oncreate when replacing keyed", () => {
		const createDiv = mock(() => {});
		const createA = mock(() => {});
		const vnode = m("div", {key: 1, oncreate: createDiv});
		const updated = m("a", {key: 1, oncreate: createA});

		render(root, vnode);
		render(root, updated);

		expect(createDiv.mock.calls.length).toBe(1);
		expect(createDiv.mock.calls[0][0]).toBe(vnode);
		expect(createA.mock.calls.length).toBe(1);
		expect(createA.mock.calls[0][0]).toBe(updated);
	});

	test("does not call oncreate when noop", () => {
		const create = mock(() => {});
		const update = mock(() => {});
		const vnode = m("div", {oncreate: create});
		const updated = m("div", {oncreate: update});

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(1);
		expect(create.mock.calls[0][0]).toBe(vnode);
		expect(update.mock.calls.length).toBe(0);
	});

	test("does not call oncreate when updating attr", () => {
		const create = mock(() => {});
		const update = mock(() => {});
		const vnode = m("div", {oncreate: create});
		const updated = m("div", {oncreate: update, id: "a"});

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(1);
		expect(create.mock.calls[0][0]).toBe(vnode);
		expect(update.mock.calls.length).toBe(0);
	});

	test("does not call oncreate when updating children", () => {
		const create = mock(() => {});
		const update = mock(() => {});
		const vnode = m("div", {oncreate: create}, m("a"));
		const updated = m("div", {oncreate: update}, m("b"));

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(1);
		expect(create.mock.calls[0][0]).toBe(vnode);
		expect(update.mock.calls.length).toBe(0);
	});

	test("does not call oncreate when updating keyed", () => {
		const create = mock(() => {});
		const update = mock(() => {});
		const vnode = m("div", {key: 1, oncreate: create});
		const otherVnode = m("a", {key: 2});
		const updated = m("div", {key: 1, oncreate: update});
		const otherUpdated = m("a", {key: 2});

		render(root, [vnode, otherVnode]);
		render(root, [otherUpdated, updated]);

		expect(create.mock.calls.length).toBe(1);
		expect(create.mock.calls[0][0]).toBe(vnode);
		expect(update.mock.calls.length).toBe(0);
	});

	test("does not call oncreate when removing", () => {
		const create = mock(() => {});
		const vnode = m("div", {oncreate: create});

		render(root, vnode);
		render(root, []);

		expect(create.mock.calls.length).toBe(1);
		expect(create.mock.calls[0][0]).toBe(vnode);
	});

	test("does not recycle when there's an oncreate", () => {
		const create = mock(() => {});
		const update = mock(() => {});
		const vnode = m("div", {key: 1, oncreate: create});
		const updated = m("div", {key: 1, oncreate: update});

		render(root, vnode);
		render(root, []);
		render(root, updated);

		expect(vnode.dom).not.toBe(updated.dom);
		expect(create.mock.calls.length).toBe(1);
		expect(create.mock.calls[0][0]).toBe(vnode);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
	});

	test("calls oncreate at the same step as onupdate", () => {
		const create = mock(() => {});
		const update = mock(() => {});
		const callback = mock(() => {});
		const vnode = m("div", {onupdate: create});
		const updated = m("div", {onupdate: update}, m("a", {oncreate: callback}));

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
		expect(callback.mock.calls.length).toBe(1);
		expect(callback.mock.calls[0][0]).toBe(updated.children[0]);
	});

	test("calls oncreate on unkeyed that falls into reverse list diff code path", () => {
		const create = mock(() => {});
		render(root, m("p", m("div")));
		render(root, m("div", {oncreate: create}, m("div")));

		expect(create.mock.calls.length).toBe(1);
	});

	test("calls oncreate on unkeyed that falls into forward list diff code path", () => {
		const create = mock(() => {});
		render(root, [m("div"), m("p")]);
		render(root, [m("div"), m("div", {oncreate: create})]);

		expect(create.mock.calls.length).toBe(1);
	});

	test("calls oncreate after full DOM creation", () => {
		let created = false;
		const vnode = m("div",
			m("a", {oncreate: create},
				m("b")
			)
		);

		render(root, vnode);

		function create(vnode) {
			created = true;

			expect(vnode.dom.parentNode).not.toBe(null);
			expect(vnode.dom.childNodes.length).toBe(1);
		}
		expect(created).toBe(true);
	});

	test("does not set oncreate as an event handler", () => {
		const create = mock(() => {});
		const vnode = m("div", {oncreate: create});

		render(root, vnode);

		expect(vnode.dom.oncreate).toBe(undefined);
		expect(vnode.dom.attributes["oncreate"]).toBe(undefined);
	});

	test("calls oncreate on recycle", () => {
		const create = mock(() => {});
		const vnodes = m("div", {key: 1, oncreate: create});
		const temp = [];
		const updated = m("div", {key: 1, oncreate: create});

		render(root, vnodes);
		render(root, temp);
		render(root, updated);

		expect(create.mock.calls.length).toBe(2);
	});
});
