import { describe, test, expect, beforeEach, mock } from "bun:test";
import components from "../../test-utils/components";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";
import m from "../../render/hyperscript";
import fragment from "../../render/fragment";

describe("onbeforeupdate", function() {
	let $window, root, render;
	beforeEach(function() {
		$window = domMock();
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	test("prevents update in element", function() {
		const onbeforeupdate = function() {return false};
		const vnode = m("div", {id: "a", onbeforeupdate: onbeforeupdate});
		const updated = m("div", {id: "b", onbeforeupdate: onbeforeupdate});

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.attributes["id"].value).toBe("a");
	});

	test("prevents update in fragment", function() {
		const onbeforeupdate = function() {return false};
		const vnode = fragment({onbeforeupdate: onbeforeupdate}, "a");
		const updated = fragment({onbeforeupdate: onbeforeupdate}, "b");

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.nodeValue).toBe("a");
	});

	test("does not prevent update if returning true", function() {
		const onbeforeupdate = function() {return true};
		const vnode = m("div", {id: "a", onbeforeupdate: onbeforeupdate});
		const updated = m("div", {id: "b", onbeforeupdate: onbeforeupdate});

		render(root, vnode);
		render(root, updated);

		expect(root.firstChild.attributes["id"].value).toBe("b");
	});

	test("accepts arguments for comparison", function() {
		let count = 0;
		const vnode = m("div", {id: "a", onbeforeupdate: onbeforeupdate});
		const updated = m("div", {id: "b", onbeforeupdate: onbeforeupdate});

		render(root, vnode);
		render(root, updated);

		function onbeforeupdate(vnode, old) {
			count++;

			expect(old.attrs.id).toBe("a");
			expect(vnode.attrs.id).toBe("b");

			return old.attrs.id !== vnode.attrs.id;
		}

		expect(count).toBe(1);
		expect(root.firstChild.attributes["id"].value).toBe("b");
	});

	test("is not called on creation", function() {
		let count = 0;
		const vnode = m("div", {id: "a", onbeforeupdate: onbeforeupdate});

		render(root, vnode);

		function onbeforeupdate() {
			count++;
			return true;
		}

		expect(count).toBe(0);
	});

	test("is called only once on update", function() {
		let count = 0;
		const vnode = m("div", {id: "a", onbeforeupdate: onbeforeupdate});
		const updated = m("div", {id: "b", onbeforeupdate: onbeforeupdate});

		render(root, vnode);
		render(root, updated);

		function onbeforeupdate() {
			count++;
			return true;
		}

		expect(count).toBe(1);
	});

	test("doesn't fire on recycled nodes", function() {
		const onbeforeupdate = mock(() => {});
		const vnodes = [m("div", {key: 1})];
		const temp = [];
		const updated = [m("div", {key: 1, onbeforeupdate: onbeforeupdate})];

		render(root, vnodes);
		render(root, temp);
		render(root, updated);

		expect(vnodes[0].dom).not.toBe(updated[0].dom); // this used to be a recycling pool test
		expect(updated[0].dom.nodeName).toBe("DIV");
		expect(onbeforeupdate.mock.calls.length).toBe(0);
	});

	components.forEach(function(cmp){
		describe(cmp.kind, function(){
			const createComponent = cmp.create;

			test("prevents update in component", function() {
				const component = createComponent({
					onbeforeupdate: function() {return false},
					view: function(vnode) {
						return m("div", vnode.children);
					},
				});
				const vnode = m(component, "a");
				const updated = m(component, "b");

				render(root, vnode);
				render(root, updated);

				expect(root.firstChild.firstChild.nodeValue).toBe("a");
			});

			test("prevents update if returning false in component and false in vnode", function() {
				const component = createComponent({
					onbeforeupdate: function() {return false},
					view: function(vnode) {
						return m("div", {id: vnode.attrs.id});
					},
				});
				const vnode = m(component, {id: "a", onbeforeupdate: function() {return false}});
				const updated = m(component, {id: "b", onbeforeupdate: function() {return false}});

				render(root, vnode);
				render(root, updated);

				expect(root.firstChild.attributes["id"].value).toBe("a");
			});

			test("does not prevent update if returning true in component and true in vnode", function() {
				const component = createComponent({
					onbeforeupdate: function() {return true},
					view: function(vnode) {
						return m("div", {id: vnode.attrs.id});
					},
				});
				const vnode = m(component, {id: "a", onbeforeupdate: function() {return true}});
				const updated = m(component, {id: "b", onbeforeupdate: function() {return true}});

				render(root, vnode);
				render(root, updated);

				expect(root.firstChild.attributes["id"].value).toBe("b");
			});

			test("prevents update if returning false in component but true in vnode", function() {
				const component = createComponent({
					onbeforeupdate: function() {return false},
					view: function(vnode) {
						return m("div", {id: vnode.attrs.id});
					},
				});
				const vnode = m(component, {id: "a", onbeforeupdate: function() {return true}});
				const updated = m(component, {id: "b", onbeforeupdate: function() {return true}});

				render(root, vnode);
				render(root, updated);

				expect(root.firstChild.attributes["id"].value).toBe("a");
			});

			test("prevents update if returning true in component but false in vnode", function() {
				const component = createComponent({
					onbeforeupdate: function() {return true},
					view: function(vnode) {
						return m("div", {id: vnode.attrs.id});
					},
				});
				const vnode = m(component, {id: "a", onbeforeupdate: function() {return false}});
				const updated = m(component, {id: "b", onbeforeupdate: function() {return false}});

				render(root, vnode);
				render(root, updated);

				expect(root.firstChild.attributes["id"].value).toBe("a");
			});

			test("does not prevent update if returning true from component", function() {
				const component = createComponent({
					onbeforeupdate: function() {return true},
					view: function(vnode) {
						return m("div", vnode.attrs);
					},
				});
				const vnode = m(component, {id: "a"});
				const updated = m(component, {id: "b"});

				render(root, vnode);
				render(root, updated);

				expect(root.firstChild.attributes["id"].value).toBe("b");
			});

			test("accepts arguments for comparison in component", function() {
				const component = createComponent({
					onbeforeupdate: onbeforeupdate,
					view: function(vnode) {
						return m("div", vnode.attrs);
					},
				});
				let count = 0;
				const vnode = m(component, {id: "a"});
				const updated = m(component, {id: "b"});

				render(root, vnode);
				render(root, updated);

				function onbeforeupdate(vnode, old) {
					count++;

					expect(old.attrs.id).toBe("a");
					expect(vnode.attrs.id).toBe("b");

					return old.attrs.id !== vnode.attrs.id;
				}

				expect(count).toBe(1);
				expect(root.firstChild.attributes["id"].value).toBe("b");
			});

			test("is not called on component creation", function() {
				createComponent({
					onbeforeupdate: onbeforeupdate,
					view: function(vnode) {
						return m("div", vnode.attrs);
					},
				});

				let count = 0;
				const vnode = m("div", {id: "a"});

				render(root, vnode);

				function onbeforeupdate() {
					count++;
					return true;
				}

				expect(count).toBe(0);
			});

			test("is called only once on component update", function() {
				const component = createComponent({
					onbeforeupdate: onbeforeupdate,
					view: function(vnode) {
						return m("div", vnode.attrs);
					},
				});

				let count = 0;
				const vnode = m(component, {id: "a"});
				const updated = m(component, {id: "b"});

				render(root, vnode);
				render(root, updated);

				function onbeforeupdate() {
					count++;
					return true;
				}

				expect(count).toBe(1);
			});
		});
	});

	// https://github.com/MithrilJS/mithril.js/issues/2067
	describe("after prevented update", function() {
		test("old attributes are retained", function() {
			render(root, [
				m("div", {"id": "foo", onbeforeupdate: function() { return true }})
			]);
			render(root, [
				m("div", {"id": "bar", onbeforeupdate: function() { return false }})
			]);
			render(root, [
				m("div", {"id": "bar", onbeforeupdate: function() { return true }})
			]);
			expect(root.firstChild.attributes["id"].value).toBe("bar");
		});

		test("old children is retained", function() {
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m("div")
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return false }},
					m("div", m("div"))
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m("div", m("div"))
				)
			);
			expect(root.firstChild.firstChild.childNodes.length).toBe(1);
		});

		test("old text is retained", function() {
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m("div")
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return false }},
					m("div", "foo")
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m("div", "foo")
				)
			);
			expect(root.firstChild.firstChild.firstChild.nodeValue).toBe("foo");
		});

		test("updating component children doesn't error", function() {
			const Child = {
				view(v) {
					return m("div",
						v.attrs.foo ? m("div") : null
					);
				}
			};

			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m(Child, {foo: false})
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return false }},
					m(Child, {foo: false})
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m(Child, {foo: true})
				)
			);
			expect(root.firstChild.firstChild.childNodes.length).toBe(1);
		});

		test("adding dom children doesn't error", function() {
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m("div")
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return false }},
					m("div")
				)
			);
			render(root,
				m("div", {onbeforeupdate: function() { return true }},
					m("div", m("div"))
				)
			);
			expect(root.firstChild.firstChild.childNodes.length).toBe(1);
		});
	});
});
