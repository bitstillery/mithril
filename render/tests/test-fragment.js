"use strict"

import { describe, test, expect } from "bun:test";
import fragment from "../../render/fragment";
import m from "../../render/hyperscript";

function fragmentStr() {
	const args = [].slice.call(arguments);
	args.unshift("[");
	return m.apply(null, args);
}

function runTest(name, fragment) {
	describe(name, () => {
		test("works", () => {
			const attrs = {foo: 5};
			const child = m("p");
			const frag = fragment(attrs, child);

			expect(frag.tag).toBe("[");

			expect(Array.isArray(frag.children)).toBe(true);
			expect(frag.children.length).toBe(1);
			expect(frag.children[0]).toBe(child);

			expect(frag.attrs).toBe(attrs);

			expect(frag.key).toBe(undefined);
		});

		test("supports keys", () => {
			const attrs = {key: 7};
			const frag = fragment(attrs, []);
			expect(frag.tag).toBe("[");

			expect(Array.isArray(frag.children)).toBe(true);
			expect(frag.children.length).toBe(0);

			expect(frag.attrs).toBe(attrs);
			expect(frag.attrs.key).toBe(7);

			expect(frag.key).toBe(7);
		});

		describe("children with no attrs", () => {
			test("handles string single child", () => {
				const vnode = fragment(["a"]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("a");
			});

			test("handles falsy string single child", () => {
				const vnode = fragment([""]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("");
			});

			test("handles number single child", () => {
				const vnode = fragment([1]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("1");
			});

			test("handles falsy number single child", () => {
				const vnode = fragment([0]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("0");
			});

			test("handles boolean single child", () => {
				const vnode = fragment([true]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles falsy boolean single child", () => {
				const vnode = fragment([false]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles null single child", () => {
				const vnode = fragment([null]);

				expect(vnode.children[0]).toBe(null);
			});

			test("handles undefined single child", () => {
				const vnode = fragment([undefined]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles multiple string children", () => {
				const vnode = fragment(["", "a"]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("");
				expect(vnode.children[1].tag).toBe("#");
				expect(vnode.children[1].children).toBe("a");
			});

			test("handles multiple number children", () => {
				const vnode = fragment([0, 1]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("0");
				expect(vnode.children[1].tag).toBe("#");
				expect(vnode.children[1].children).toBe("1");
			});

			test("handles multiple boolean children", () => {
				const vnode = fragment([false, true]);

				expect(vnode.children).toEqual([null, null]);
			});

			test("handles multiple null/undefined child", () => {
				const vnode = fragment([null, undefined]);

				expect(vnode.children).toEqual([null, null]);
			});

			test("handles falsy number single child without attrs", () => {
				const vnode = fragment(0);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("0");
			});
		});

		describe("children with attrs", () => {
			test("handles string single child", () => {
				const vnode = fragment({}, ["a"]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("a");
			});

			test("handles falsy string single child", () => {
				const vnode = fragment({}, [""]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("");
			});

			test("handles number single child", () => {
				const vnode = fragment({}, [1]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("1");
			});

			test("handles falsy number single child", () => {
				const vnode = fragment({}, [0]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("0");
			});

			test("handles boolean single child", () => {
				const vnode = fragment({}, [true]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles falsy boolean single child", () => {
				const vnode = fragment({}, [false]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles null single child", () => {
				const vnode = fragment({}, [null]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles undefined single child", () => {
				const vnode = fragment({}, [undefined]);

				expect(vnode.children).toEqual([null]);
			});

			test("handles multiple string children", () => {
				const vnode = fragment({}, ["", "a"]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("");
				expect(vnode.children[1].tag).toBe("#");
				expect(vnode.children[1].children).toBe("a");
			});

			test("handles multiple number children", () => {
				const vnode = fragment({}, [0, 1]);

				expect(vnode.children[0].tag).toBe("#");
				expect(vnode.children[0].children).toBe("0");
				expect(vnode.children[1].tag).toBe("#");
				expect(vnode.children[1].children).toBe("1");
			});

			test("handles multiple boolean children", () => {
				const vnode = fragment({}, [false, true]);

				expect(vnode.children).toEqual([null, null]);
			});

			test("handles multiple null/undefined child", () => {
				const vnode = fragment({}, [null, undefined]);

				expect(vnode.children).toEqual([null, null]);
			});
		});
	});
}

runTest("fragment", fragment);
runTest("fragment-string-selector", fragmentStr);
