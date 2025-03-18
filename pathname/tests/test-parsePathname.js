"use strict"

import { describe, test, expect } from "bun:test";
import parsePathname from "../../pathname/parse";

describe("parsePathname", () => {
	test("parses empty string", () => {
		const data = parsePathname("")
		expect(data).toEqual({
			path: "/",
			params: {}
		})
	})

	test("parses query at start", () => {
		const data = parsePathname("?a=b&c=d")
		expect(data).toEqual({
			path: "/",
			params: {a: "b", c: "d"}
		})
	})

	test("ignores hash at start", () => {
		const data = parsePathname("#a=b&c=d")
		expect(data).toEqual({
			path: "/",
			params: {}
		})
	})

	test("parses query, ignores hash at start", () => {
		const data = parsePathname("?a=1&b=2#c=3&d=4")
		expect(data).toEqual({
			path: "/",
			params: {a: "1", b: "2"}
		})
	})

	test("parses root", () => {
		const data = parsePathname("/")
		expect(data).toEqual({
			path: "/",
			params: {}
		})
	})

	test("parses root + query at start", () => {
		const data = parsePathname("/?a=b&c=d")
		expect(data).toEqual({
			path: "/",
			params: {a: "b", c: "d"}
		})
	})

	test("parses root, ignores hash at start", () => {
		const data = parsePathname("/#a=b&c=d")
		expect(data).toEqual({
			path: "/",
			params: {}
		})
	})

	test("parses root + query, ignores hash at start", () => {
		const data = parsePathname("/?a=1&b=2#c=3&d=4")
		expect(data).toEqual({
			path: "/",
			params: {a: "1", b: "2"}
		})
	})

	test("parses route", () => {
		const data = parsePathname("/route/foo")
		expect(data).toEqual({
			path: "/route/foo",
			params: {}
		})
	})

	test("parses route + empty query", () => {
		const data = parsePathname("/route/foo?")
		expect(data).toEqual({
			path: "/route/foo",
			params: {}
		})
	})

	test("parses route + empty hash", () => {
		const data = parsePathname("/route/foo?")
		expect(data).toEqual({
			path: "/route/foo",
			params: {}
		})
	})

	test("parses route + empty query + empty hash", () => {
		const data = parsePathname("/route/foo?#")
		expect(data).toEqual({
			path: "/route/foo",
			params: {}
		})
	})

	test("parses route + query", () => {
		const data = parsePathname("/route/foo?a=1&b=2")
		expect(data).toEqual({
			path: "/route/foo",
			params: {a: "1", b: "2"}
		})
	})

	test("parses route + hash", () => {
		const data = parsePathname("/route/foo?c=3&d=4")
		expect(data).toEqual({
			path: "/route/foo",
			params: {c: "3", d: "4"}
		})
	})

	test("parses route + query, ignores hash", () => {
		const data = parsePathname("/route/foo?a=1&b=2#c=3&d=4")
		expect(data).toEqual({
			path: "/route/foo",
			params: {a: "1", b: "2"}
		})
	})

	test("parses route + query, ignores hash with lots of junk slashes", () => {
		const data = parsePathname("//route/////foo//?a=1&b=2#c=3&d=4")
		expect(data).toEqual({
			path: "/route/foo/",
			params: {a: "1", b: "2"}
		})
	})

	test("doesn't comprehend protocols", () => {
		const data = parsePathname("https://example.com/foo/bar")
		expect(data).toEqual({
			path: "/https:/example.com/foo/bar",
			params: {}
		})
	})
})
