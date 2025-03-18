import { describe, test, expect, beforeEach } from "bun:test"
import domMock from "../../test-utils/domMock"
import renderFn from "../../render/render";

describe("updateText", () => {
	let $window, root, render;
	beforeEach(() => {
		$window = domMock();
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	test("updates to string", () => {
		const vnode = "a";
		const updated = "b";

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("b");
	});

	test("updates to falsy string", () => {
		const vnode = "a";
		const updated = "";

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("");
	});

	test("updates from falsy string", () => {
		const vnode = "";
		const updated = "b";

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("b");
	});

	test("updates to number", () => {
		const vnode = "a";
		const updated = 1;

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("1");
	});

	test("updates to falsy number", () => {
		const vnode = "a";
		const updated = 0;

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("0");
	});

	test("updates from falsy number", () => {
		const vnode = 0;
		const updated = "b";

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("b");
	});

	test("updates to boolean", () => {
		const vnode = "a";
		const updated = true;

		render(root, vnode);
		render(root, updated);

		expect(root.childNodes.length).toBe(0);
	});

	test("updates to falsy boolean", () => {
		const vnode = "a";
		const updated = false;

		render(root, vnode);
		render(root, updated);

		expect(root.childNodes.length).toBe(0);
	});

	test("updates from falsy boolean", () => {
		const vnode = false;
		const updated = "b";

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("b");
	});
});
