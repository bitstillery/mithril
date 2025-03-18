"use strict"

import { describe, test, expect, beforeEach, mock } from "bun:test";
import components from "../../test-utils/components";
import domMock from "../../test-utils/domMock";
import renderFn from "../../render/render";
import m from "../../render/hyperscript";

describe("component", () => {
	let $window, root, render;

	beforeEach(() => {
		$window = domMock({ spy: mock });
		root = $window.document.createElement("div");
		render = renderFn($window)
	});

	components.forEach((cmp) => {
		describe(cmp.kind, () => {
			const createComponent = cmp.create;

			describe("basics", () => {
				test("works", () => {
					const component = createComponent({
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});
					const node = m(component);

					render(root, node);

					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("receives arguments", () => {
					const component = createComponent({
						view: function(vnode) {
							return m("div", vnode.attrs, vnode.children);
						}
					});
					const node = m(component, {id: "a"}, "b");

					render(root, node);

					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("updates", () => {
					const component = createComponent({
						view: function(vnode) {
							return m("div", vnode.attrs, vnode.children);
						}
					});
					render(root, [m(component, {id: "a"}, "b")]);
					render(root, [m(component, {id: "c"}, "d")]);

					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("c");
					expect(root.firstChild.firstChild.nodeValue).toBe("d");
				});

				test("updates root from null", () => {
					let visible = false;
					const component = createComponent({
						view: function() {
							return visible ? m("div") : null;
						}
					});
					render(root, m(component));
					visible = true;
					render(root, m(component));

					expect(root.firstChild.nodeName).toBe("DIV");
				});

				test("updates root from primitive", () => {
					let visible = false;
					const component = createComponent({
						view: function() {
							return visible ? m("div") : false;
						}
					});
					render(root, m(component));
					visible = true;
					render(root, m(component));

					expect(root.firstChild.nodeName).toBe("DIV");
				});

				test("updates root to null", () => {
					let visible = true;
					const component = createComponent({
						view: function() {
							return visible ? m("div") : null;
						}
					});
					render(root, m(component));
					visible = false;
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("updates root to primitive", () => {
					let visible = true;
					const component = createComponent({
						view: function() {
							return visible ? m("div") : false;
						}
					});
					render(root, m(component));
					visible = false;
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("updates root from null to null", () => {
					const component = createComponent({
						view: function() {
							return null;
						}
					});
					render(root, m(component));
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("removes", () => {
					const component = createComponent({
						view: function() {
							return m("div");
						}
					});
					const div = m("div", {key: 2});
					render(root, [m(component, {key: 1}), div]);
					render(root, div);

					expect(root.childNodes.length).toBe(1);
					expect(root.firstChild).toBe(div.dom);
				});

				test("svg works when creating across component boundary", () => {
					const component = createComponent({
						view: function() {
							return m("g");
						}
					});
					render(root, m("svg", m(component)));

					expect(root.firstChild.firstChild.namespaceURI).toBe("http://www.w3.org/2000/svg");
				});

				test("svg works when updating across component boundary", () => {
					const component = createComponent({
						view: function() {
							return m("g");
						}
					});
					render(root, m("svg", m(component)));
					render(root, m("svg", m(component)));

					expect(root.firstChild.firstChild.namespaceURI).toBe("http://www.w3.org/2000/svg");
				});
			});

			describe("return value", () => {
				test("can return fragments", () => {
					const component = createComponent({
						view: function() {
							return [
								m("label"),
								m("input"),
							];
						}
					});
					render(root, m(component));

					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("LABEL");
					expect(root.childNodes[1].nodeName).toBe("INPUT");
				});

				test("can return string", () => {
					const component = createComponent({
						view: function() {
							return "a";
						}
					});
					render(root, m(component));

					expect(root.firstChild.nodeType).toBe(3);
					expect(root.firstChild.nodeValue).toBe("a");
				});

				test("can return falsy string", () => {
					const component = createComponent({
						view: function() {
							return "";
						}
					});
					render(root, m(component));

					expect(root.firstChild.nodeType).toBe(3);
					expect(root.firstChild.nodeValue).toBe("");
				});

				test("can return number", () => {
					const component = createComponent({
						view: function() {
							return 1;
						}
					});
					render(root, m(component));

					expect(root.firstChild.nodeType).toBe(3);
					expect(root.firstChild.nodeValue).toBe("1");
				});

				test("can return falsy number", () => {
					const component = createComponent({
						view: function() {
							return 0;
						}
					});
					render(root, m(component));

					expect(root.firstChild.nodeType).toBe(3);
					expect(root.firstChild.nodeValue).toBe("0");
				});

				test("can return `true`", () => {
					const component = createComponent({
						view: function() {
							return true;
						}
					});
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("can return `false`", () => {
					const component = createComponent({
						view: function() {
							return false;
						}
					});
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("can return null", () => {
					const component = createComponent({
						view: function() {
							return null;
						}
					});
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("can return undefined", () => {
					const component = createComponent({
						view: function() {
							return undefined;
						}
					});
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("throws a custom error if it returns itself when created", () => {
					// A view that returns its vnode would otherwise trigger an infinite loop
					let threw = false;
					const component = createComponent({
						view: function(vnode) {
							return vnode;
						}
					});
					try {
						render(root, m(component));
					}
					catch (e) {
						threw = true;
						expect(e instanceof Error).toBe(true);
						// Call stack exception is a RangeError
						expect(e instanceof RangeError).toBe(false);
					}
					expect(threw).toBe(true);
				});

				test("throws a custom error if it returns itself when updated", () => {
					// A view that returns its vnode would otherwise trigger an infinite loop
					let threw = false;
					let init = true;
					const oninit = mock(() => {});
					const component = createComponent({
						oninit: oninit,
						view: function(vnode) {
							if (init) return init = false
							else return vnode
						}
					});
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);

					try {
						render(root, m(component));
					}
					catch (e) {
						threw = true;
						expect(e instanceof Error).toBe(true);
						// Call stack exception is a RangeError
						expect(e instanceof RangeError).toBe(false);
					}
					expect(threw).toBe(true);
					expect(oninit.mock.calls.length).toBe(1);
				});

				test("can update when returning fragments", () => {
					const component = createComponent({
						view: function() {
							return [
								m("label"),
								m("input"),
							];
						}
					});
					render(root, m(component));
					render(root, m(component));

					expect(root.childNodes.length).toBe(2);
					expect(root.childNodes[0].nodeName).toBe("LABEL");
					expect(root.childNodes[1].nodeName).toBe("INPUT");
				});

				test("can update when returning primitive", () => {
					const component = createComponent({
						view: function() {
							return "a";
						}
					});
					render(root, m(component));
					render(root, m(component));

					expect(root.firstChild.nodeType).toBe(3);
					expect(root.firstChild.nodeValue).toBe("a");
				});

				test("can update when returning null", () => {
					const component = createComponent({
						view: function() {
							return null;
						}
					});
					render(root, m(component));
					render(root, m(component));

					expect(root.childNodes.length).toBe(0);
				});

				test("can remove when returning fragments", () => {
					const component = createComponent({
						view: function() {
							return [
								m("label"),
								m("input"),
							];
						}
					});
					const div = m("div", {key: 2});
					render(root, [m(component, {key: 1}), div]);

					render(root, [m("div", {key: 2})]);

					expect(root.childNodes.length).toBe(1);
					expect(root.firstChild).toBe(div.dom);
				});

				test("can remove when returning primitive", () => {
					const component = createComponent({
						view: function() {
							return "a";
						}
					});
					const div = m("div", {key: 2});
					render(root, [m(component, {key: 1}), div]);

					render(root, [m("div", {key: 2})]);

					expect(root.childNodes.length).toBe(1);
					expect(root.firstChild).toBe(div.dom);
				});
			});

			describe("lifecycle", () => {
				test("calls oninit", () => {
					let called = 0;
					const component = createComponent({
						oninit: function(vnode) {
							called++;

							expect(vnode.tag).toBe(component);
							expect(vnode.dom).toBe(undefined);
							expect(root.childNodes.length).toBe(0);
						},
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});

					render(root, m(component));

					expect(called).toBe(1);
					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("calls oninit when returning fragment", () => {
					let called = 0;
					const component = createComponent({
						oninit: function(vnode) {
							called++;

							expect(vnode.tag).toBe(component);
							expect(vnode.dom).toBe(undefined);
							expect(root.childNodes.length).toBe(0);
						},
						view: function() {
							return [m("div", {id: "a"}, "b")];
						}
					});

					render(root, m(component));

					expect(called).toBe(1);
					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("calls oninit before view", () => {
					let viewCalled = false;
					const component = createComponent({
						view: function() {
							viewCalled = true;
							return m("div", {id: "a"}, "b");
						},
						oninit: function() {
							expect(viewCalled).toBe(false);
						},
					});

					render(root, m(component));
				});

				test("does not calls oninit on redraw", () => {
					let init = mock(() => {});
					const component = createComponent({
						view: function() {
							return m("div", {id: "a"}, "b");
						},
						oninit: init,
					});

					function view() {
						return m(component);
					}

					render(root, view());
					render(root, view());

					expect(init.mock.calls.length).toBe(1);
				});

				test("calls oncreate", () => {
					let called = 0;
					const component = createComponent({
						oncreate: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});

					render(root, m(component));

					expect(called).toBe(1);
					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("does not calls oncreate on redraw", () => {
					let create = mock(() => {});
					const component = createComponent({
						view: function() {
							return m("div", {id: "a"}, "b");
						},
						oncreate: create,
					});

					function view() {
						return m(component);
					}

					render(root, view());
					render(root, view());

					expect(create.mock.calls.length).toBe(1);
				});

				test("calls oncreate when returning fragment", () => {
					let called = 0;
					const component = createComponent({
						oncreate: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});

					render(root, m(component));

					expect(called).toBe(1);
					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("calls onupdate", () => {
					let called = 0;
					const component = createComponent({
						onupdate: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});

					render(root, m(component));

					expect(called).toBe(0);

					render(root, m(component));

					expect(called).toBe(1);
					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("calls onupdate when returning fragment", () => {
					let called = 0;
					const component = createComponent({
						onupdate: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return [m("div", {id: "a"}, "b")];
						}
					});

					render(root, m(component));

					expect(called).toBe(0);

					render(root, m(component));

					expect(called).toBe(1);
					expect(root.firstChild.nodeName).toBe("DIV");
					expect(root.firstChild.attributes["id"].value).toBe("a");
					expect(root.firstChild.firstChild.nodeValue).toBe("b");
				});

				test("calls onremove", () => {
					let called = 0;
					const component = createComponent({
						onremove: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});

					render(root, m(component));

					expect(called).toBe(0);

					render(root, []);

					expect(called).toBe(1);
					expect(root.childNodes.length).toBe(0);
				});

				test("calls onremove when returning fragment", () => {
					let called = 0;
					const component = createComponent({
						onremove: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return [m("div", {id: "a"}, "b")];
						}
					});

					render(root, m(component));

					expect(called).toBe(0);

					render(root, []);

					expect(called).toBe(1);
					expect(root.childNodes.length).toBe(0);
				});

				test("calls onbeforeremove", () => {
					let called = 0;
					const component = createComponent({
						onbeforeremove: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return m("div", {id: "a"}, "b");
						}
					});

					render(root, m(component));

					expect(called).toBe(0);

					render(root, []);

					expect(called).toBe(1);
					expect(root.childNodes.length).toBe(0);
				});

				test("calls onbeforeremove when returning fragment", () => {
					let called = 0;
					const component = createComponent({
						onbeforeremove: function(vnode) {
							called++;

							expect(vnode.dom).not.toBe(undefined);
							expect(vnode.dom).toBe(root.firstChild);
							expect(root.childNodes.length).toBe(1);
						},
						view: function() {
							return [m("div", {id: "a"}, "b")];
						}
					});

					render(root, m(component));

					expect(called).toBe(0);

					render(root, []);

					expect(called).toBe(1);
					expect(root.childNodes.length).toBe(0);
				});

				test("does not recycle when there's an onupdate", () => {
					const component = createComponent({
						onupdate: function() {},
						view: function() {
							return m("div");
						}
					});
					const vnode = m(component, {key: 1});
					const updated = m(component, {key: 1});

					render(root, vnode);
					render(root, []);
					render(root, updated);

					expect(vnode.dom).not.toBe(updated.dom);
				});

				test("lifecycle timing megatest (for a single component)", () => {
					const methods = {
						view: mock(() => {
							return "";
						})
					};
					const attrs = {};
					const hooks = [
						"oninit", "oncreate", "onbeforeupdate",
						"onupdate", "onbeforeremove", "onremove"
					];

					hooks.forEach((hook) => {
						if (hook === "onbeforeupdate") {
							// the component's `onbeforeupdate` is called after the `attrs`' one
							attrs[hook] = mock(() => {
								expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length + 1);
							});
							methods[hook] = mock(() => {
								expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
							});
						} else {
							// the other component hooks are called before the `attrs` ones
							methods[hook] = mock(() => {
								expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length - 1);
							});
							attrs[hook] = mock(() => {
								expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
							});
						}
					});

					const component = createComponent(methods);

					expect(methods.view.mock.calls.length).toBe(0);
					expect(methods.oninit.mock.calls.length).toBe(0);
					expect(methods.oncreate.mock.calls.length).toBe(0);
					expect(methods.onbeforeupdate.mock.calls.length).toBe(0);
					expect(methods.onupdate.mock.calls.length).toBe(0);
					expect(methods.onbeforeremove.mock.calls.length).toBe(0);
					expect(methods.onremove.mock.calls.length).toBe(0);

					hooks.forEach((hook) => {
						expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
					});

					render(root, [m(component, attrs)]);

					expect(methods.view.mock.calls.length).toBe(1);
					expect(methods.oninit.mock.calls.length).toBe(1);
					expect(methods.oncreate.mock.calls.length).toBe(1);
					expect(methods.onbeforeupdate.mock.calls.length).toBe(0);
					expect(methods.onupdate.mock.calls.length).toBe(0);
					expect(methods.onbeforeremove.mock.calls.length).toBe(0);
					expect(methods.onremove.mock.calls.length).toBe(0);

					hooks.forEach((hook) => {
						expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
					});

					render(root, [m(component, attrs)]);

					expect(methods.view.mock.calls.length).toBe(2);
					expect(methods.oninit.mock.calls.length).toBe(1);
					expect(methods.oncreate.mock.calls.length).toBe(1);
					expect(methods.onbeforeupdate.mock.calls.length).toBe(1);
					expect(methods.onupdate.mock.calls.length).toBe(1);
					expect(methods.onbeforeremove.mock.calls.length).toBe(0);
					expect(methods.onremove.mock.calls.length).toBe(0);

					hooks.forEach((hook) => {
						expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
					});

					render(root, []);

					expect(methods.view.mock.calls.length).toBe(2);
					expect(methods.oninit.mock.calls.length).toBe(1);
					expect(methods.oncreate.mock.calls.length).toBe(1);
					expect(methods.onbeforeupdate.mock.calls.length).toBe(1);
					expect(methods.onupdate.mock.calls.length).toBe(1);
					expect(methods.onbeforeremove.mock.calls.length).toBe(1);
					expect(methods.onremove.mock.calls.length).toBe(1);

					hooks.forEach((hook) => {
						expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
					});
				});

				test("hook state and arguments validation", () => {
					const methods = {
						view: mock(function(vnode) {
							expect(this).toBe(vnode.state);
							return "";
						})
					};
					const attrs = {};
					const hooks = [
						"oninit", "oncreate", "onbeforeupdate",
						"onupdate", "onbeforeremove", "onremove"
					];
					hooks.forEach((hook) => {
						attrs[hook] = mock(function(vnode) {
							expect(this).toBe(vnode.state);
						});
						methods[hook] = mock(function(vnode) {
							expect(this).toBe(vnode.state);
						});
					});

					const component = createComponent(methods);

					render(root, [m(component, attrs)]);
					render(root, [m(component, attrs)]);
					render(root, []);

					hooks.forEach((hook) => {
						expect(attrs[hook].mock.calls.length).toBe(methods[hook].mock.calls.length);
					});

					expect(methods.view.mock.calls.length).toBe(2);
					expect(methods.oninit.mock.calls.length).toBe(1);
					expect(methods.oncreate.mock.calls.length).toBe(1);
					expect(methods.onbeforeupdate.mock.calls.length).toBe(1);
					expect(methods.onupdate.mock.calls.length).toBe(1);
					expect(methods.onbeforeremove.mock.calls.length).toBe(1);
					expect(methods.onremove.mock.calls.length).toBe(1);

					hooks.forEach((hook) => {
						expect(methods[hook].mock.calls.length).toBe(attrs[hook].mock.calls.length);
					});
				});

				test("no recycling occurs (was: recycled components get a fresh state)", () => {
					let step = 0;
					let firstState;
					const view = mock((vnode) => {
						if (step === 0) {
							firstState = vnode.state;
						} else {
							expect(vnode.state).not.toBe(firstState);
						}
						return m("div");
					});
					const component = createComponent({view: view});

					render(root, [m("div", m(component, {key: 1}))]);
					const child = root.firstChild.firstChild;
					render(root, []);
					step = 1;
					render(root, [m("div", m(component, {key: 1}))]);

					expect(child).not.toBe(root.firstChild.firstChild); // this used to be a recycling pool test
					expect(view.mock.calls.length).toBe(2);
				});
			});

			describe("state", () => {
				test("initializes state", () => {
					const data = {a: 1};
					const component = createComponent(createComponent({
						data: data,
						oninit: init,
						view: function() {
							return "";
						}
					}));

					render(root, m(component));

					function init(vnode) {
						expect(vnode.state.data).toBe(data);
					}
				});

				test("state proxies to the component object/prototype", () => {
					const body = {a: 1};
					const data = [body];
					const component = createComponent(createComponent({
						data: data,
						oninit: init,
						view: function() {
							return "";
						}
					}));

					render(root, m(component));

					function init(vnode) {
						expect(vnode.state.data).toBe(data);
						expect(vnode.state.data[0]).toBe(body);
					}
				});
			});
		});
	});

	describe("Tests specific to certain component kinds", () => {
		describe("state", () => {
			test("POJO", () => {
				const data = {};
				const component = {
					data: data,
					oninit: init,
					view: function() {
						return "";
					}
				};

				render(root, m(component));

				function init(vnode) {
					expect(vnode.state.data).toBe(data);

					//inherits state via prototype
					component.x = 1;
					expect(vnode.state.x).toBe(1);
				}
			});

			test("Constructible", () => {
				const oninit = mock(() => {});

				// Create a proper constructor function instead of a mock
				function Component(vnode) {
					expect(vnode.state).toBe(undefined);
					expect(oninit.mock.calls.length).toBe(0);
				}

				// Mock the view method
				Component.prototype.view = mock(function() {
					expect(this instanceof Component).toBe(true);
					return "";
				});

				Component.prototype.oninit = oninit;

				// Spy on the constructor
				const constructorSpy = mock(Component);

				render(root, [m(Component, {oninit: oninit})]);
				render(root, [m(Component, {oninit: oninit})]);
				render(root, []);

				expect(Component.prototype.view.mock.calls.length).toBe(2);
				expect(oninit.mock.calls.length).toBe(2);
			});

			test("Closure", () => {
				let state;
				const oninit = mock(() => {});
				const view = mock(function() {
					expect(this).toBe(state);
					return "";
				});
				const component = mock(function(vnode) {
					expect(vnode.state).toBe(undefined);
					expect(oninit.mock.calls.length).toBe(0);
					return state = {
						view: view
					};
				});

				render(root, [m(component, {oninit: oninit})]);
				render(root, [m(component, {oninit: oninit})]);
				render(root, []);

				expect(component.mock.calls.length).toBe(1);
				expect(oninit.mock.calls.length).toBe(1);
				expect(view.mock.calls.length).toBe(2);
			});
		});
	});
});
