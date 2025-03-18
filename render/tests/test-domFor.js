"use strict"

import { describe, test, expect, beforeEach, mock } from "bun:test";
import callAsync from "../../test-utils/callAsync";
import components from "../../test-utils/components";
import domMock from "../../test-utils/domMock";
import vdom from "../render";
import m from "../hyperscript";
import fragment from "../fragment";
import { domFor } from "../../render/domFor";

describe("domFor(vnode)", function() {
	let $window, root, render;
	beforeEach(function() {
		$window = domMock();
		root = $window.document.createElement("div");
		render = vdom($window);
	});

	test("works for simple vnodes", function() {
		render(root, m("div", {oncreate(vnode){
			let n = 0;
			for (const dom of domFor(vnode)) {
				expect(dom).toBe(root.firstChild);
				expect(++n).toBe(1);
			}
		}}));
	});

	test("works for fragments", function () {
		render(root, fragment({
			oncreate(vnode){
				let n = 0;
				for (const dom of domFor(vnode)) {
					expect(dom).toBe(root.childNodes[n]);
					n++;
				}
				expect(n).toBe(2);
			}
		}, [
			m("a"),
			m("b")
		]));
	});

	test("works in fragments with children that have delayed removal", function() {
		function oncreate(vnode){
			expect(root.childNodes.length).toBe(3);
			expect(root.childNodes[0].nodeName).toBe("A");
			expect(root.childNodes[1].nodeName).toBe("B");
			expect(root.childNodes[2].nodeName).toBe("C");

			const iter = domFor(vnode);
			expect(iter.next()).toEqual({done:false, value: root.childNodes[0]});
			expect(iter.next()).toEqual({done:false, value: root.childNodes[1]});
			expect(iter.next()).toEqual({done:false, value: root.childNodes[2]});
			expect(iter.next().done).toBe(true);
			expect(root.childNodes.length).toBe(3);
		}
		function onupdate(vnode) {
			// the b node is still present in the DOM
			expect(root.childNodes.length).toBe(3);
			const nodeNames = Array.from(root.childNodes).map(node => node.nodeName);
			expect(nodeNames).toContain("A");
			expect(nodeNames).toContain("B");
			expect(nodeNames).toContain("C");

			const iter = domFor(vnode);
			const aIndex = nodeNames.indexOf("A");
			const cIndex = nodeNames.indexOf("C");

			expect(iter.next()).toEqual({done:false, value: root.childNodes[aIndex]});
			expect(iter.next()).toEqual({done:false, value: root.childNodes[cIndex]});
			expect(iter.next().done).toBe(true);
			expect(root.childNodes.length).toBe(3);
		}

		render(root, fragment(
			{oncreate, onupdate},
			[
				m("a"),
				m("b", {onbeforeremove(){return {then(){}, finally(){}}}}),
				m("c")
			]
		));
		render(root, fragment(
			{oncreate, onupdate},
			[
				m("a"),
				null,
				m("c"),
			]
		));
	});

	test("works in onbeforeremove and onremove", function (done) {
		const onbeforeremove = mock(function onbeforeremove(vnode){
			expect(root.childNodes.length).toBe(1);
			expect(root.childNodes[0].nodeName).toBe("A");
			const iter = domFor(vnode);
			expect(iter.next()).toEqual({done:false, value: root.childNodes[0]});
			expect(iter.next().done).toBe(true);
			expect(root.childNodes.length).toBe(1);
			return {then(resolve){resolve();}};
		});
		const onremove = mock(function onremove(vnode){
			expect(root.childNodes.length).toBe(1);
			expect(root.childNodes[0].nodeName).toBe("A");
			const iter = domFor(vnode);
			expect(iter.next()).toEqual({done:false, value: root.childNodes[0]});
			expect(iter.next().done).toBe(true);
			expect(root.childNodes.length).toBe(1);
		});
		render(root, [m("a", {onbeforeremove, onremove})]);
		render(root, []);

		expect(onbeforeremove.mock.calls.length).toBe(1);
		expect(onremove.mock.calls.length).toBe(0);
		callAsync(function(){
			expect(onremove.mock.calls.length).toBe(1);
			done();
		});
	});

	test("works multiple vnodes with onbeforeremove (#3007, 1/6, BCA)", function (done) {
		let thenCBA, thenCBB, thenCBC;
		const onbeforeremoveA = mock(function onbeforeremove(){
			return {then(resolve){thenCBA = resolve;}};
		});
		const onbeforeremoveB = mock(function onbeforeremove(){
			return {then(resolve){thenCBB = resolve;}};
		});
		const onbeforeremoveC = mock(function onbeforeremove(){
			return {then(resolve){thenCBC = resolve;}};
		});
		// to avoid updating internal nodes only, vnodes have key attributes
		const A = fragment({key: 1, onbeforeremove: onbeforeremoveA}, [m("a1"), m("a2")]);
		const B = fragment({key: 2, onbeforeremove: onbeforeremoveB}, [m("b1"), m("b2")]);
		const C = fragment({key: 3, onbeforeremove: onbeforeremoveC}, [m("c1"), m("c2")]);

		render(root, [A]);
		expect(onbeforeremoveA.mock.calls.length).toBe(0);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [B]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [C]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, []);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(1);

		// not resolved
		expect(root.childNodes.length).toBe(6);
		expect(root.childNodes[0].nodeName).toBe("A1");
		expect(root.childNodes[1].nodeName).toBe("A2");
		expect(root.childNodes[2].nodeName).toBe("B1");
		expect(root.childNodes[3].nodeName).toBe("B2");
		expect(root.childNodes[4].nodeName).toBe("C1");
		expect(root.childNodes[5].nodeName).toBe("C2");

		const iterA = domFor(A);
		expect(iterA.next().value.nodeName).toBe("A1");
		expect(iterA.next().value.nodeName).toBe("A2");
		expect(iterA.next().done).toBe(true);

		const iterB = domFor(B);
		expect(iterB.next().value.nodeName).toBe("B1");
		expect(iterB.next().value.nodeName).toBe("B2");
		expect(iterB.next().done).toBe(true);

		const iterC = domFor(C);
		expect(iterC.next().value.nodeName).toBe("C1");
		expect(iterC.next().value.nodeName).toBe("C2");
		expect(iterC.next().done).toBe(true);

		callAsync(function(){
			// not resolved yet
			expect(root.childNodes.length).toBe(6);
			expect(root.childNodes[0].nodeName).toBe("A1");
			expect(root.childNodes[1].nodeName).toBe("A2");
			expect(root.childNodes[2].nodeName).toBe("B1");
			expect(root.childNodes[3].nodeName).toBe("B2");
			expect(root.childNodes[4].nodeName).toBe("C1");
			expect(root.childNodes[5].nodeName).toBe("C2");

			const iterA = domFor(A);
			expect(iterA.next().value.nodeName).toBe("A1");
			expect(iterA.next().value.nodeName).toBe("A2");
			expect(iterA.next().done).toBe(true);

			const iterB = domFor(B);
			expect(iterB.next().value.nodeName).toBe("B1");
			expect(iterB.next().value.nodeName).toBe("B2");
			expect(iterB.next().done).toBe(true);

			const iterC = domFor(C);
			expect(iterC.next().value.nodeName).toBe("C1");
			expect(iterC.next().value.nodeName).toBe("C2");
			expect(iterC.next().done).toBe(true);

			// resolve B
			thenCBB();
			callAsync(function(){
				expect(root.childNodes.length).toBe(4);
				expect(root.childNodes[0].nodeName).toBe("A1");
				expect(root.childNodes[1].nodeName).toBe("A2");
				expect(root.childNodes[2].nodeName).toBe("C1");
				expect(root.childNodes[3].nodeName).toBe("C2");

				const iterA = domFor(A);
				expect(iterA.next().value.nodeName).toBe("A1");
				expect(iterA.next().value.nodeName).toBe("A2");
				expect(iterA.next().done).toBe(true);

				const iterC = domFor(C);
				expect(iterC.next().value.nodeName).toBe("C1");
				expect(iterC.next().value.nodeName).toBe("C2");
				expect(iterC.next().done).toBe(true);

				// resolve C
				thenCBC();
				callAsync(function(){
					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("A1");
					expect(root.childNodes[1].nodeName).toBe("A2");

					const iterA = domFor(A);
					expect(iterA.next().value.nodeName).toBe("A1");
					expect(iterA.next().value.nodeName).toBe("A2");
					expect(iterA.next().done).toBe(true);

					// resolve A
					thenCBA();
					callAsync(function(){
						expect(root.childNodes.length).toBe(0);
						done();
					});
				});
			});
		});
	});

	test("works multiple vnodes with onbeforeremove (#3007, 2/6, CAB)", function (done) {
		let thenCBA, thenCBB, thenCBC;
		const onbeforeremoveA = mock(function onbeforeremove(){
			return {then(resolve){thenCBA = resolve;}};
		});
		const onbeforeremoveB = mock(function onbeforeremove(){
			return {then(resolve){thenCBB = resolve;}};
		});
		const onbeforeremoveC = mock(function onbeforeremove(){
			return {then(resolve){thenCBC = resolve;}};
		});
		// to avoid updating internal nodes only, vnodes have key attributes
		const A = fragment({key: 1, onbeforeremove: onbeforeremoveA}, [m("a1"), m("a2")]);
		const B = fragment({key: 2, onbeforeremove: onbeforeremoveB}, [m("b1"), m("b2")]);
		const C = fragment({key: 3, onbeforeremove: onbeforeremoveC}, [m("c1"), m("c2")]);

		render(root, [A]);
		expect(onbeforeremoveA.mock.calls.length).toBe(0);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [B]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [C]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, []);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(1);

		// not resolved
		expect(root.childNodes.length).toBe(6);
		expect(root.childNodes[0].nodeName).toBe("A1");
		expect(root.childNodes[1].nodeName).toBe("A2");
		expect(root.childNodes[2].nodeName).toBe("B1");
		expect(root.childNodes[3].nodeName).toBe("B2");
		expect(root.childNodes[4].nodeName).toBe("C1");
		expect(root.childNodes[5].nodeName).toBe("C2");

		const iterA = domFor(A);
		expect(iterA.next().value.nodeName).toBe("A1");
		expect(iterA.next().value.nodeName).toBe("A2");
		expect(iterA.next().done).toBe(true);

		const iterB = domFor(B);
		expect(iterB.next().value.nodeName).toBe("B1");
		expect(iterB.next().value.nodeName).toBe("B2");
		expect(iterB.next().done).toBe(true);

		const iterC = domFor(C);
		expect(iterC.next().value.nodeName).toBe("C1");
		expect(iterC.next().value.nodeName).toBe("C2");
		expect(iterC.next().done).toBe(true);

		callAsync(function(){
			// not resolved yet
			expect(root.childNodes.length).toBe(6);
			expect(root.childNodes[0].nodeName).toBe("A1");
			expect(root.childNodes[1].nodeName).toBe("A2");
			expect(root.childNodes[2].nodeName).toBe("B1");
			expect(root.childNodes[3].nodeName).toBe("B2");
			expect(root.childNodes[4].nodeName).toBe("C1");
			expect(root.childNodes[5].nodeName).toBe("C2");

			const iterA = domFor(A);
			expect(iterA.next().value.nodeName).toBe("A1");
			expect(iterA.next().value.nodeName).toBe("A2");
			expect(iterA.next().done).toBe(true);

			const iterB = domFor(B);
			expect(iterB.next().value.nodeName).toBe("B1");
			expect(iterB.next().value.nodeName).toBe("B2");
			expect(iterB.next().done).toBe(true);

			const iterC = domFor(C);
			expect(iterC.next().value.nodeName).toBe("C1");
			expect(iterC.next().value.nodeName).toBe("C2");
			expect(iterC.next().done).toBe(true);

			// resolve C
			thenCBC();
			callAsync(function(){
				expect(root.childNodes.length).toBe(4);
				expect(root.childNodes[0].nodeName).toBe("A1");
				expect(root.childNodes[1].nodeName).toBe("A2");
				expect(root.childNodes[2].nodeName).toBe("B1");
				expect(root.childNodes[3].nodeName).toBe("B2");

				const iterB = domFor(B);
				expect(iterB.next().value.nodeName).toBe("B1");
				expect(iterB.next().value.nodeName).toBe("B2");
				expect(iterB.next().done).toBe(true);

				const iterA = domFor(A);
				expect(iterA.next().value.nodeName).toBe("A1");
				expect(iterA.next().value.nodeName).toBe("A2");
				expect(iterA.next().done).toBe(true);

				// resolve A
				thenCBA();
				callAsync(function(){
					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("B1");
					expect(root.childNodes[1].nodeName).toBe("B2");

					const iterB = domFor(B);
					expect(iterB.next().value.nodeName).toBe("B1");
					expect(iterB.next().value.nodeName).toBe("B2");
					expect(iterB.next().done).toBe(true);

					// resolve B
					thenCBB();
					callAsync(function(){
						expect(root.childNodes.length).toBe(0);
						done();
					});
				});
			});
		});
	});

	test("works multiple vnodes with onbeforeremove (#3007, 3/6, ABC)", function (done) {
		let thenCBA, thenCBB, thenCBC;
		const onbeforeremoveA = mock(function onbeforeremove(){
			return {then(resolve){thenCBA = resolve;}};
		});
		const onbeforeremoveB = mock(function onbeforeremove(){
			return {then(resolve){thenCBB = resolve;}};
		});
		const onbeforeremoveC = mock(function onbeforeremove(){
			return {then(resolve){thenCBC = resolve;}};
		});
		// to avoid updating internal nodes only, vnodes have key attributes
		const A = fragment({key: 1, onbeforeremove: onbeforeremoveA}, [m("a1"), m("a2")]);
		const B = fragment({key: 2, onbeforeremove: onbeforeremoveB}, [m("b1"), m("b2")]);
		const C = fragment({key: 3, onbeforeremove: onbeforeremoveC}, [m("c1"), m("c2")]);

		render(root, [A]);
		expect(onbeforeremoveA.mock.calls.length).toBe(0);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [B]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [C]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, []);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(1);

		// not resolved
		expect(root.childNodes.length).toBe(6);
		expect(root.childNodes[0].nodeName).toBe("A1");
		expect(root.childNodes[1].nodeName).toBe("A2");
		expect(root.childNodes[2].nodeName).toBe("B1");
		expect(root.childNodes[3].nodeName).toBe("B2");
		expect(root.childNodes[4].nodeName).toBe("C1");
		expect(root.childNodes[5].nodeName).toBe("C2");

		const iterA = domFor(A);
		expect(iterA.next().value.nodeName).toBe("A1");
		expect(iterA.next().value.nodeName).toBe("A2");
		expect(iterA.next().done).toBe(true);

		const iterB = domFor(B);
		expect(iterB.next().value.nodeName).toBe("B1");
		expect(iterB.next().value.nodeName).toBe("B2");
		expect(iterB.next().done).toBe(true);

		const iterC = domFor(C);
		expect(iterC.next().value.nodeName).toBe("C1");
		expect(iterC.next().value.nodeName).toBe("C2");
		expect(iterC.next().done).toBe(true);

		callAsync(function(){
			// not resolved yet
			expect(root.childNodes.length).toBe(6);
			expect(root.childNodes[0].nodeName).toBe("A1");
			expect(root.childNodes[1].nodeName).toBe("A2");
			expect(root.childNodes[2].nodeName).toBe("B1");
			expect(root.childNodes[3].nodeName).toBe("B2");
			expect(root.childNodes[4].nodeName).toBe("C1");
			expect(root.childNodes[5].nodeName).toBe("C2");

			const iterA = domFor(A);
			expect(iterA.next().value.nodeName).toBe("A1");
			expect(iterA.next().value.nodeName).toBe("A2");
			expect(iterA.next().done).toBe(true);

			const iterB = domFor(B);
			expect(iterB.next().value.nodeName).toBe("B1");
			expect(iterB.next().value.nodeName).toBe("B2");
			expect(iterB.next().done).toBe(true);

			const iterC = domFor(C);
			expect(iterC.next().value.nodeName).toBe("C1");
			expect(iterC.next().value.nodeName).toBe("C2");
			expect(iterC.next().done).toBe(true);

			// resolve A
			thenCBA();
			callAsync(function(){
				expect(root.childNodes.length).toBe(4);
				expect(root.childNodes[0].nodeName).toBe("B1");
				expect(root.childNodes[1].nodeName).toBe("B2");
				expect(root.childNodes[2].nodeName).toBe("C1");
				expect(root.childNodes[3].nodeName).toBe("C2");

				const iterB = domFor(B);
				expect(iterB.next().value.nodeName).toBe("B1");
				expect(iterB.next().value.nodeName).toBe("B2");
				expect(iterB.next().done).toBe(true);

				const iterC = domFor(C);
				expect(iterC.next().value.nodeName).toBe("C1");
				expect(iterC.next().value.nodeName).toBe("C2");
				expect(iterC.next().done).toBe(true);

				// resolve B
				thenCBB();
				callAsync(function(){
					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("C1");
					expect(root.childNodes[1].nodeName).toBe("C2");

					const iterC = domFor(C);
					expect(iterC.next().value.nodeName).toBe("C1");
					expect(iterC.next().value.nodeName).toBe("C2");
					expect(iterC.next().done).toBe(true);

					// resolve C
					thenCBC();
					callAsync(function(){
						expect(root.childNodes.length).toBe(0);
						done();
					});
				});
			});
		});
	});

	test("works multiple vnodes with onbeforeremove (#3007, 4/6, ACB)", function (done) {
		let thenCBA, thenCBB, thenCBC;
		const onbeforeremoveA = mock(function onbeforeremove(){
			return {then(resolve){thenCBA = resolve;}};
		});
		const onbeforeremoveB = mock(function onbeforeremove(){
			return {then(resolve){thenCBB = resolve;}};
		});
		const onbeforeremoveC = mock(function onbeforeremove(){
			return {then(resolve){thenCBC = resolve;}};
		});
		// to avoid updating internal nodes only, vnodes have key attributes
		const A = fragment({key: 1, onbeforeremove: onbeforeremoveA}, [m("a1"), m("a2")]);
		const B = fragment({key: 2, onbeforeremove: onbeforeremoveB}, [m("b1"), m("b2")]);
		const C = fragment({key: 3, onbeforeremove: onbeforeremoveC}, [m("c1"), m("c2")]);

		render(root, [A]);
		expect(onbeforeremoveA.mock.calls.length).toBe(0);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [B]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [C]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, []);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(1);

		// not resolved
		expect(root.childNodes.length).toBe(6);
		expect(root.childNodes[0].nodeName).toBe("A1");
		expect(root.childNodes[1].nodeName).toBe("A2");
		expect(root.childNodes[2].nodeName).toBe("B1");
		expect(root.childNodes[3].nodeName).toBe("B2");
		expect(root.childNodes[4].nodeName).toBe("C1");
		expect(root.childNodes[5].nodeName).toBe("C2");

		const iterA = domFor(A);
		expect(iterA.next().value.nodeName).toBe("A1");
		expect(iterA.next().value.nodeName).toBe("A2");
		expect(iterA.next().done).toBe(true);

		const iterB = domFor(B);
		expect(iterB.next().value.nodeName).toBe("B1");
		expect(iterB.next().value.nodeName).toBe("B2");
		expect(iterB.next().done).toBe(true);

		const iterC = domFor(C);
		expect(iterC.next().value.nodeName).toBe("C1");
		expect(iterC.next().value.nodeName).toBe("C2");
		expect(iterC.next().done).toBe(true);

		callAsync(function(){
			// not resolved yet
			expect(root.childNodes.length).toBe(6);
			expect(root.childNodes[0].nodeName).toBe("A1");
			expect(root.childNodes[1].nodeName).toBe("A2");
			expect(root.childNodes[2].nodeName).toBe("B1");
			expect(root.childNodes[3].nodeName).toBe("B2");
			expect(root.childNodes[4].nodeName).toBe("C1");
			expect(root.childNodes[5].nodeName).toBe("C2");

			const iterA = domFor(A);
			expect(iterA.next().value.nodeName).toBe("A1");
			expect(iterA.next().value.nodeName).toBe("A2");
			expect(iterA.next().done).toBe(true);

			const iterB = domFor(B);
			expect(iterB.next().value.nodeName).toBe("B1");
			expect(iterB.next().value.nodeName).toBe("B2");
			expect(iterB.next().done).toBe(true);

			const iterC = domFor(C);
			expect(iterC.next().value.nodeName).toBe("C1");
			expect(iterC.next().value.nodeName).toBe("C2");
			expect(iterC.next().done).toBe(true);

			// resolve A
			thenCBA();
			callAsync(function(){
				expect(root.childNodes.length).toBe(4);
				expect(root.childNodes[0].nodeName).toBe("B1");
				expect(root.childNodes[1].nodeName).toBe("B2");
				expect(root.childNodes[2].nodeName).toBe("C1");
				expect(root.childNodes[3].nodeName).toBe("C2");

				const iterB = domFor(B);
				expect(iterB.next().value.nodeName).toBe("B1");
				expect(iterB.next().value.nodeName).toBe("B2");
				expect(iterB.next().done).toBe(true);

				const iterC = domFor(C);
				expect(iterC.next().value.nodeName).toBe("C1");
				expect(iterC.next().value.nodeName).toBe("C2");
				expect(iterC.next().done).toBe(true);

				// resolve C
				thenCBC();
				callAsync(function(){
					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("B1");
					expect(root.childNodes[1].nodeName).toBe("B2");

					const iterC = domFor(B);
					expect(iterC.next().value.nodeName).toBe("B1");
					expect(iterC.next().value.nodeName).toBe("B2");
					expect(iterC.next().done).toBe(true);

					// resolve B
					thenCBB();
					callAsync(function(){
						expect(root.childNodes.length).toBe(0);
						done();
					});
				});
			});
		});
	});

	test("works multiple vnodes with onbeforeremove (#3007, 5/6, BAC)", function (done) {
		let thenCBA, thenCBB, thenCBC;
		const onbeforeremoveA = mock(function onbeforeremove(){
			return {then(resolve){thenCBA = resolve;}};
		});
		const onbeforeremoveB = mock(function onbeforeremove(){
			return {then(resolve){thenCBB = resolve;}};
		});
		const onbeforeremoveC = mock(function onbeforeremove(){
			return {then(resolve){thenCBC = resolve;}};
		});
		// to avoid updating internal nodes only, vnodes have key attributes
		const A = fragment({key: 1, onbeforeremove: onbeforeremoveA}, [m("a1"), m("a2")]);
		const B = fragment({key: 2, onbeforeremove: onbeforeremoveB}, [m("b1"), m("b2")]);
		const C = fragment({key: 3, onbeforeremove: onbeforeremoveC}, [m("c1"), m("c2")]);

		render(root, [A]);
		expect(onbeforeremoveA.mock.calls.length).toBe(0);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [B]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [C]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, []);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(1);

		// not resolved
		expect(root.childNodes.length).toBe(6);
		expect(root.childNodes[0].nodeName).toBe("A1");
		expect(root.childNodes[1].nodeName).toBe("A2");
		expect(root.childNodes[2].nodeName).toBe("B1");
		expect(root.childNodes[3].nodeName).toBe("B2");
		expect(root.childNodes[4].nodeName).toBe("C1");
		expect(root.childNodes[5].nodeName).toBe("C2");

		const iterA = domFor(A);
		expect(iterA.next().value.nodeName).toBe("A1");
		expect(iterA.next().value.nodeName).toBe("A2");
		expect(iterA.next().done).toBe(true);

		const iterB = domFor(B);
		expect(iterB.next().value.nodeName).toBe("B1");
		expect(iterB.next().value.nodeName).toBe("B2");
		expect(iterB.next().done).toBe(true);

		const iterC = domFor(C);
		expect(iterC.next().value.nodeName).toBe("C1");
		expect(iterC.next().value.nodeName).toBe("C2");
		expect(iterC.next().done).toBe(true);

		callAsync(function(){
			// not resolved yet
			expect(root.childNodes.length).toBe(6);
			expect(root.childNodes[0].nodeName).toBe("A1");
			expect(root.childNodes[1].nodeName).toBe("A2");
			expect(root.childNodes[2].nodeName).toBe("B1");
			expect(root.childNodes[3].nodeName).toBe("B2");
			expect(root.childNodes[4].nodeName).toBe("C1");
			expect(root.childNodes[5].nodeName).toBe("C2");

			const iterA = domFor(A);
			expect(iterA.next().value.nodeName).toBe("A1");
			expect(iterA.next().value.nodeName).toBe("A2");
			expect(iterA.next().done).toBe(true);

			const iterB = domFor(B);
			expect(iterB.next().value.nodeName).toBe("B1");
			expect(iterB.next().value.nodeName).toBe("B2");
			expect(iterB.next().done).toBe(true);

			const iterC = domFor(C);
			expect(iterC.next().value.nodeName).toBe("C1");
			expect(iterC.next().value.nodeName).toBe("C2");
			expect(iterC.next().done).toBe(true);

			// resolve B
			thenCBB();
			callAsync(function(){
				expect(root.childNodes.length).toBe(4);
				expect(root.childNodes[0].nodeName).toBe("A1");
				expect(root.childNodes[1].nodeName).toBe("A2");
				expect(root.childNodes[2].nodeName).toBe("C1");
				expect(root.childNodes[3].nodeName).toBe("C2");

				const iterB = domFor(A);
				expect(iterB.next().value.nodeName).toBe("A1");
				expect(iterB.next().value.nodeName).toBe("A2");
				expect(iterB.next().done).toBe(true);

				const iterC = domFor(C);
				expect(iterC.next().value.nodeName).toBe("C1");
				expect(iterC.next().value.nodeName).toBe("C2");
				expect(iterC.next().done).toBe(true);

				// resolve A
				thenCBA();
				callAsync(function(){
					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("C1");
					expect(root.childNodes[1].nodeName).toBe("C2");

					const iterC = domFor(C);
					expect(iterC.next().value.nodeName).toBe("C1");
					expect(iterC.next().value.nodeName).toBe("C2");
					expect(iterC.next().done).toBe(true);

					// resolve C
					thenCBC();
					callAsync(function(){
						expect(root.childNodes.length).toBe(0);
						done();
					});
				});
			});
		});
	});

	test("works multiple vnodes with onbeforeremove (#3007, 6/6, CBA)", function (done) {
		let thenCBA, thenCBB, thenCBC;
		const onbeforeremoveA = mock(function onbeforeremove(){
			return {then(resolve){thenCBA = resolve;}};
		});
		const onbeforeremoveB = mock(function onbeforeremove(){
			return {then(resolve){thenCBB = resolve;}};
		});
		const onbeforeremoveC = mock(function onbeforeremove(){
			return {then(resolve){thenCBC = resolve;}};
		});
		// to avoid updating internal nodes only, vnodes have key attributes
		const A = fragment({key: 1, onbeforeremove: onbeforeremoveA}, [m("a1"), m("a2")]);
		const B = fragment({key: 2, onbeforeremove: onbeforeremoveB}, [m("b1"), m("b2")]);
		const C = fragment({key: 3, onbeforeremove: onbeforeremoveC}, [m("c1"), m("c2")]);

		render(root, [A]);
		expect(onbeforeremoveA.mock.calls.length).toBe(0);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [B]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(0);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, [C]);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(0);

		render(root, []);
		expect(onbeforeremoveA.mock.calls.length).toBe(1);
		expect(onbeforeremoveB.mock.calls.length).toBe(1);
		expect(onbeforeremoveC.mock.calls.length).toBe(1);

		// not resolved
		expect(root.childNodes.length).toBe(6);
		expect(root.childNodes[0].nodeName).toBe("A1");
		expect(root.childNodes[1].nodeName).toBe("A2");
		expect(root.childNodes[2].nodeName).toBe("B1");
		expect(root.childNodes[3].nodeName).toBe("B2");
		expect(root.childNodes[4].nodeName).toBe("C1");
		expect(root.childNodes[5].nodeName).toBe("C2");

		const iterA = domFor(A);
		expect(iterA.next().value.nodeName).toBe("A1");
		expect(iterA.next().value.nodeName).toBe("A2");
		expect(iterA.next().done).toBe(true);

		const iterB = domFor(B);
		expect(iterB.next().value.nodeName).toBe("B1");
		expect(iterB.next().value.nodeName).toBe("B2");
		expect(iterB.next().done).toBe(true);

		const iterC = domFor(C);
		expect(iterC.next().value.nodeName).toBe("C1");
		expect(iterC.next().value.nodeName).toBe("C2");
		expect(iterC.next().done).toBe(true);

		callAsync(function(){
			// not resolved yet
			expect(root.childNodes.length).toBe(6);
			expect(root.childNodes[0].nodeName).toBe("A1");
			expect(root.childNodes[1].nodeName).toBe("A2");
			expect(root.childNodes[2].nodeName).toBe("B1");
			expect(root.childNodes[3].nodeName).toBe("B2");
			expect(root.childNodes[4].nodeName).toBe("C1");
			expect(root.childNodes[5].nodeName).toBe("C2");

			const iterA = domFor(A);
			expect(iterA.next().value.nodeName).toBe("A1");
			expect(iterA.next().value.nodeName).toBe("A2");
			expect(iterA.next().done).toBe(true);

			const iterB = domFor(B);
			expect(iterB.next().value.nodeName).toBe("B1");
			expect(iterB.next().value.nodeName).toBe("B2");
			expect(iterB.next().done).toBe(true);

			const iterC = domFor(C);
			expect(iterC.next().value.nodeName).toBe("C1");
			expect(iterC.next().value.nodeName).toBe("C2");
			expect(iterC.next().done).toBe(true);

			// resolve C
			thenCBC();
			callAsync(function(){
				expect(root.childNodes.length).toBe(4);
				expect(root.childNodes[0].nodeName).toBe("A1");
				expect(root.childNodes[1].nodeName).toBe("A2");
				expect(root.childNodes[2].nodeName).toBe("B1");
				expect(root.childNodes[3].nodeName).toBe("B2");

				const iterB = domFor(A);
				expect(iterB.next().value.nodeName).toBe("A1");
				expect(iterB.next().value.nodeName).toBe("A2");
				expect(iterB.next().done).toBe(true);

				const iterC = domFor(B);
				expect(iterC.next().value.nodeName).toBe("B1");
				expect(iterC.next().value.nodeName).toBe("B2");
				expect(iterC.next().done).toBe(true);

				// resolve B
				thenCBB();
				callAsync(function(){
					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("A1");
					expect(root.childNodes[1].nodeName).toBe("A2");

					const iterC = domFor(A);
					expect(iterC.next().value.nodeName).toBe("A1");
					expect(iterC.next().value.nodeName).toBe("A2");
					expect(iterC.next().done).toBe(true);

					// resolve A
					thenCBA();
					callAsync(function(){
						expect(root.childNodes.length).toBe(0);
						done();
					});
				});
			});
		});
	});

	components.forEach(function(cmp){
		const {kind, create: createComponent} = cmp;
		describe(kind, function(){
			test("works for components that return one element", function() {
				const C = createComponent({
					view(){return m("div");},
					oncreate(vnode){
						let n = 0;
						for (const dom of domFor(vnode)) {
							expect(dom).toBe(root.firstChild);
							expect(++n).toBe(1);
						}
					}
				});
				render(root, m(C));
			});

			test("works for components that return fragments", function () {
				const oncreate = mock(function oncreate(vnode){
					expect(root.childNodes.length).toBe(3);
					expect(root.childNodes[0].nodeName).toBe("A");
					expect(root.childNodes[1].nodeName).toBe("B");
					expect(root.childNodes[2].nodeName).toBe("C");

					const iter = domFor(vnode);
					expect(iter.next()).toEqual({done:false, value: root.childNodes[0]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[1]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[2]});
					expect(iter.next().done).toBe(true);
					expect(root.childNodes.length).toBe(3);
				});
				const C = createComponent({
					view({children}){return children;},
					oncreate
				});
				render(root, m(C, [
					m("a"),
					m("b"),
					m("c")
				]));
				expect(oncreate.mock.calls.length).toBe(1);
			});

			test("works for components that return fragments with delayed removal", function () {
				const onbeforeremove = mock(function onbeforeremove(){return {then(){}, finally(){}}})
				const oncreate = mock(function oncreate(vnode){
					expect(root.childNodes.length).toBe(3);
					expect(root.childNodes[0].nodeName).toBe("A");
					expect(root.childNodes[1].nodeName).toBe("B");
					expect(root.childNodes[2].nodeName).toBe("C");

					const iter = domFor(vnode);
					expect(iter.next()).toEqual({done:false, value: root.childNodes[0]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[1]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[2]});
					expect(iter.next().done).toBe(true);
					expect(root.childNodes.length).toBe(3);
				});
				const onupdate = mock(function onupdate(vnode) {
					expect(root.childNodes.length).toBe(3);
					const nodeNames = Array.from(root.childNodes).map(node => node.nodeName);
					expect(nodeNames).toContain("A");
					expect(nodeNames).toContain("B");
					expect(nodeNames).toContain("C");

					const iter = domFor(vnode);
					const aIndex = nodeNames.indexOf("A");
					const cIndex = nodeNames.indexOf("C");

					expect(iter.next()).toEqual({done:false, value: root.childNodes[aIndex]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[cIndex]});
					expect(iter.next().done).toBe(true);
					expect(root.childNodes.length).toBe(3);
				});
				const C = createComponent({
					view({children}){return children},
					oncreate,
					onupdate
				});
				render(root, m(C, [
					m("a"),
					m("b", {onbeforeremove}),
					m("c")
				]));
				render(root, m(C, [
					m("a"),
					null,
					m("c")
				]));
				expect(oncreate.mock.calls.length).toBe(1);
				expect(onupdate.mock.calls.length).toBe(1);
				expect(onbeforeremove.mock.calls.length).toBe(1);
			});
			test("works in state.onbeforeremove and attrs.onbeforeremove", function () {
				const onbeforeremove = mock(function onbeforeremove(vnode){
					expect(root.childNodes.length).toBe(3);
					expect(root.childNodes[0].nodeName).toBe("A");
					expect(root.childNodes[1].nodeName).toBe("B");
					expect(root.childNodes[2].nodeName).toBe("C");
					const iter = domFor(vnode);
					expect(iter.next()).toEqual({done:false, value: root.childNodes[0]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[1]});
					expect(iter.next()).toEqual({done:false, value: root.childNodes[2]});
					expect(iter.next().done).toBe(true);
					expect(root.childNodes.length).toBe(3);
					return {then(){}, finally(){}}
				});
				const C = createComponent({
					view({children}){return children},
					onbeforeremove
				});
				render(root, m(C, {onbeforeremove}, [
					m("a"),
					m("b"),
					m("c")
				]));
				render(root, []);

				expect(onbeforeremove.mock.calls.length).toBe(2);
			});
		});
	});
});
