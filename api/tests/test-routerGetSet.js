"use strict"

// Low-priority TODO: remove the dependency on the renderer here.
import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import browserMock from "../../test-utils/browserMock";
import throttleMocker from "../../test-utils/throttleMock";

import apiMountRedraw from "../../api/mount-redraw";
import coreRenderer from "../../render/render";
import apiRouter from "../../api/router";

describe("route.get/route.set", () => {
	[{protocol: "http:", hostname: "localhost"}, {protocol: "file:", hostname: "/"}].forEach((env) => {
		["#", "?", "", "#!", "?!", "/foo"].forEach((prefix) => {
			describe("using prefix `" + prefix + "` starting on " + env.protocol + "//" + env.hostname, () => {
				let $window, root, mountRedraw, route, throttleMock;

				beforeEach(() => {
					$window = browserMock(env);
					throttleMock = throttleMocker();
					$window.setTimeout = setTimeout;

					root = $window.document.body;

					mountRedraw = apiMountRedraw(coreRenderer($window), throttleMock.schedule, console);
					route = apiRouter($window, mountRedraw);
					route.prefix = prefix;
				});

				afterEach(() => {
					expect(throttleMock.queueLength()).toBe(0);
				});

				test("gets route", () => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {"/test": {view: function() {}}});

					expect(route.get()).toBe("/test");
				});

				test("gets route w/ params", () => {
					$window.location.href = prefix + "/other/x/y/z?c=d#e=f";

					route(root, "/other/x/y/z?c=d#e=f", {
						"/test": {view: function() {}},
						"/other/:a/:b...": {view: function() {}},
					});

					expect(route.get()).toBe("/other/x/y/z?c=d#e=f");
				});

				test("gets route w/ escaped unicode", () => {
					$window.location.href = prefix + encodeURI("/ö/é/å?ö=ö#ö=ö");

					route(root, "/ö/é/å?ö=ö#ö=ö", {
						"/test": {view: function() {}},
						"/ö/:a/:b...": {view: function() {}},
					});

					expect(route.get()).toBe("/ö/é/å?ö=ö#ö=ö");
				});

				test("gets route w/ unicode", () => {
					$window.location.href = prefix + "/ö/é/å?ö=ö#ö=ö";

					route(root, "/ö/é/å?ö=ö#ö=ö", {
						"/test": {view: function() {}},
						"/ö/:a/:b...": {view: function() {}},
					});

					expect(route.get()).toBe("/ö/é/å?ö=ö#ö=ö");
				});

				test("sets path asynchronously", (done) => {
					$window.location.href = prefix + "/a";
					const spy1 = mock(() => {});
					const spy2 = mock(() => {});

					route(root, "/a", {
						"/a": {view: spy1},
						"/b": {view: spy2},
					});

					expect(spy1.mock.calls.length).toBe(1);
					expect(spy2.mock.calls.length).toBe(0);
					route.set("/b");
					expect(spy1.mock.calls.length).toBe(1);
					expect(spy2.mock.calls.length).toBe(0);
					setTimeout(() => {
						throttleMock.fire();

						expect(spy1.mock.calls.length).toBe(1);
						expect(spy2.mock.calls.length).toBe(1);
						done();
					});
				});

				test("sets fallback asynchronously", (done) => {
					$window.location.href = prefix + "/b";
					const spy1 = mock(() => {});
					const spy2 = mock(() => {});

					route(root, "/a", {
						"/a": {view: spy1},
						"/b": {view: spy2},
					});

					expect(spy1.mock.calls.length).toBe(0);
					expect(spy2.mock.calls.length).toBe(1);
					route.set("/c");
					expect(spy1.mock.calls.length).toBe(0);
					expect(spy2.mock.calls.length).toBe(1);
					setTimeout(() => {
						// Yep, before even the throttle mechanism takes hold.
						expect(route.get()).toBe("/b");
						setTimeout(() => {
							// Yep, before even the throttle mechanism takes hold.
							expect(route.get()).toBe("/a");
							throttleMock.fire();

							expect(spy1.mock.calls.length).toBe(1);
							expect(spy2.mock.calls.length).toBe(1);
							done();
						});
					});
				});

				test("exposes new route asynchronously", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other/:a/:b...": {view: function() {}},
					});

					route.set("/other/x/y/z?c=d#e=f");
					setTimeout(() => {
						// Yep, before even the throttle mechanism takes hold.
						expect(route.get()).toBe("/other/x/y/z?c=d#e=f");
						throttleMock.fire();
						done();
					});
				});

				test("exposes new escaped unicode route asynchronously", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/ö": {view: function() {}},
					});

					route.set(encodeURI("/ö?ö=ö#ö=ö"));
					setTimeout(() => {
						// Yep, before even the throttle mechanism takes hold.
						expect(route.get()).toBe("/ö?ö=ö#ö=ö");
						throttleMock.fire();
						done();
					});
				});

				test("exposes new unescaped unicode route asynchronously", (done) => {
					$window.location.href = "file://" + prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/ö": {view: function() {}},
					});

					route.set("/ö?ö=ö#ö=ö");
					setTimeout(() => {
						// Yep, before even the throttle mechanism takes hold.
						expect(route.get()).toBe("/ö?ö=ö#ö=ö");
						throttleMock.fire();
						done();
					});
				});

				test("exposes new route asynchronously on fallback mode", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other/:a/:b...": {view: function() {}},
					});

					route.set("/other/x/y/z?c=d#e=f");
					setTimeout(() => {
						// Yep, before even the throttle mechanism takes hold.
						expect(route.get()).toBe("/other/x/y/z?c=d#e=f");
						throttleMock.fire();
						done();
					});
				});

				test("sets route via pushState/onpopstate", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other/:a/:b...": {view: function() {}},
					});

					setTimeout(() => {
						$window.history.pushState(null, null, prefix + "/other/x/y/z?c=d#e=f");
						$window.onpopstate();

						setTimeout(() => {
							// Yep, before even the throttle mechanism takes hold.
							expect(route.get()).toBe("/other/x/y/z?c=d#e=f");
							throttleMock.fire();

							done();
						});
					});
				});

				test("sets parameterized route", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other/:a/:b...": {view: function() {}},
					});

					route.set("/other/:a/:b", {a: "x", b: "y/z", c: "d", e: "f"});
					setTimeout(() => {
						// Yep, before even the throttle mechanism takes hold.
						expect(route.get()).toBe("/other/x/y%2Fz?c=d&e=f");
						throttleMock.fire();
						done();
					});
				});

				test("replace:true works", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other": {view: function() {}},
					});

					route.set("/other", null, {replace: true});

					setTimeout(() => {
						throttleMock.fire();
						$window.history.back();
						expect($window.location.href).toBe(env.protocol + "//" + (env.hostname === "/" ? "" : env.hostname) + "/");
						done();
					});
				});

				test("replace:false works", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other": {view: function() {}},
					});

					route.set("/other", null, {replace: false});

					setTimeout(() => {
						throttleMock.fire();
						$window.history.back();
						const slash = prefix[0] === "/" ? "" : "/";
						expect($window.location.href).toBe(env.protocol + "//" + (env.hostname === "/" ? "" : env.hostname) + slash + (prefix ? prefix + "/" : "") + "test");
						done();
					});
				});

				test("state works", (done) => {
					$window.location.href = prefix + "/test";
					route(root, "/test", {
						"/test": {view: function() {}},
						"/other": {view: function() {}},
					});

					route.set("/other", null, {state: {a: 1}});
					setTimeout(() => {
						throttleMock.fire();
						expect($window.history.state).toEqual({a: 1});
						done();
					});
				});
			});
		});
	});
});
