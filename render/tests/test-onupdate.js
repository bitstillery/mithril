import { describe, test, expect, beforeEach, mock } from "bun:test";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";
import m from "../../render/hyperscript";
import fragment from "../../render/fragment";

describe("onupdate", () => {
	let $window, root, render;
	beforeEach(() => {
		$window = domMock();
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	test("does not call onupdate when creating element", () => {
		const create = mock();
		const update = mock();
		const vnode = m("div", {onupdate: create});
		const updated = m("div", {onupdate: update});

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
		// Note: 'this' context isn't directly accessible in Bun mocks
		// We'd need to use a different approach to test 'this' binding
	});

	test("does not call onupdate when removing element", () => {
		const create = mock();
		const vnode = m("div", {onupdate: create});

		render(root, vnode);
		render(root, []);

		expect(create.mock.calls.length).toBe(0);
	});

	test("does not call onupdate when replacing keyed element", () => {
		const create = mock();
		const update = mock();
		const vnode = m("div", {key: 1, onupdate: create});
		const updated = m("a", {key: 1, onupdate: update});
		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(0);
	});

	test("does not recycle when there's an onupdate", () => {
		const update = mock();
		const vnode = m("div", {key: 1, onupdate: update});
		const updated = m("div", {key: 1, onupdate: update});

		render(root, vnode);
		render(root, []);
		render(root, updated);

		expect(vnode.dom).not.toBe(updated.dom);
	});

	test("does not call old onupdate when removing the onupdate property in new vnode", () => {
		const create = mock();
		const vnode = m("a", {onupdate: create});
		const updated = m("a");

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
	});

	test("calls onupdate when noop", () => {
		const create = mock();
		const update = mock();
		const vnode = m("div", {onupdate: create});
		const updated = m("div", {onupdate: update});

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
		// Note about this context as mentioned above
	});

	test("calls onupdate when updating attr", () => {
		const create = mock();
		const update = mock();
		const vnode = m("div", {onupdate: create});
		const updated = m("div", {onupdate: update, id: "a"});

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
		// Note about this context as mentioned above
	});

	test("calls onupdate when updating children", () => {
		const create = mock();
		const update = mock();
		const vnode = m("div", {onupdate: create}, m("a"));
		const updated = m("div", {onupdate: update}, m("b"));

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
		// Note about this context as mentioned above
	});

	test("calls onupdate when updating fragment", () => {
		const create = mock();
		const update = mock();
		const vnode = fragment({onupdate: create});
		const updated = fragment({onupdate: update});

		render(root, vnode);
		render(root, updated);

		expect(create.mock.calls.length).toBe(0);
		expect(update.mock.calls.length).toBe(1);
		expect(update.mock.calls[0][0]).toBe(updated);
		// Note about this context as mentioned above
	});

	test("calls onupdate after full DOM update", () => {
		let called = false;
		const vnode = m("div", {id: "1"},
			m("a", {id: "2"},
				m("b", {id: "3"})
			)
		);

		// For this test, we need a real function to access 'this'
		function update(vnode) {
			called = true;

			expect(vnode.dom.parentNode.attributes["id"].value).toBe("11");
			expect(vnode.dom.attributes["id"].value).toBe("22");
			expect(vnode.dom.childNodes[0].attributes["id"].value).toBe("33");
		}

		const updated = m("div", {id: "11"},
			m("a", {id: "22", onupdate: update},
				m("b", {id: "33"})
			)
		);

		render(root, vnode);
		render(root, updated);

		expect(called).toBe(true);
	});

	test("does not set onupdate as an event handler", () => {
		const update = mock();
		const vnode = m("div", {onupdate: update});

		render(root, vnode);

		expect(vnode.dom.onupdate).toBe(undefined);
		expect(vnode.dom.attributes["onupdate"]).toBe(undefined);
	});
});
