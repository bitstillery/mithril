import { describe, test, expect } from "bun:test";
import m from "../../render/hyperscript";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";

describe("component children", () => {
	const $window = domMock();
	const root = $window.document.createElement("div");
	const render = renderFn($window)

	describe("component children", () => {
		const component = {
			view: function (vnode) {
				return vnode.children;
			}
		};

		const vnode = m(component, "a");

		render(root, vnode);

		test("are not normalized on ingestion", () => {
			expect(vnode.children[0]).toBe("a");
		});

		test("are normalized upon view interpolation", () => {
			expect(vnode.instance.children.length).toBe(1);
			expect(vnode.instance.children[0].tag).toBe("#");
			expect(vnode.instance.children[0].children).toBe("a");
		});
	});
});
