"use strict"

import { describe, test, expect } from "bun:test";
import parseQueryString from "../../querystring/parse";

describe("parseQueryString", () => {
	test("works", () => {
		const data = parseQueryString("?aaa=bbb")
		expect(data).toEqual({aaa: "bbb"})
	})

	test("parses empty string", () => {
		const data = parseQueryString("")
		expect(data).toEqual({})
	})

	test("parses flat object", () => {
		const data = parseQueryString("?a=b&c=d")
		expect(data).toEqual({a: "b", c: "d"})
	})

	test("handles escaped values", () => {
		const data = parseQueryString("?%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23=%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23")
		expect(data).toEqual({";:@&=+$,/?%#": ";:@&=+$,/?%#"})
	})

	test("handles wrongly escaped values", () => {
		const data = parseQueryString("?test=%c5%a1%e8ZM%80%82H")
		expect(data).toEqual({test: "%c5%a1%e8ZM%80%82H"})
	})

	test("handles escaped slashes followed by a number", () => {
		const data = parseQueryString("?hello=%2Fen%2F1")
		expect(data.hello).toBe("/en/1")
	})

	test("handles escaped square brackets", () => {
		const data = parseQueryString("?a%5B%5D=b")
		expect(data).toEqual({"a": ["b"]})
	})

	test("handles escaped unicode", () => {
		const data = parseQueryString("?%C3%B6=%C3%B6")
		expect(data).toEqual({"ö": "ö"})
	})

	test("handles unicode", () => {
		const data = parseQueryString("?ö=ö")
		expect(data).toEqual({"ö": "ö"})
	})

	test("parses without question mark", () => {
		const data = parseQueryString("a=b&c=d")
		expect(data).toEqual({a: "b", c: "d"})
	})

	test("parses nested object", () => {
		const data = parseQueryString("a[b]=x&a[c]=y")
		expect(data).toEqual({a: {b: "x", c: "y"}})
	})

	test("parses deep nested object", () => {
		const data = parseQueryString("a[b][c]=x&a[b][d]=y")
		expect(data).toEqual({a: {b: {c: "x", d: "y"}}})
	})

	test("parses nested array", () => {
		const data = parseQueryString("a[0]=x&a[1]=y")
		expect(data).toEqual({a: ["x", "y"]})
	})

	test("parses deep nested array", () => {
		const data = parseQueryString("a[0][0]=x&a[0][1]=y")
		expect(data).toEqual({a: [["x", "y"]]})
	})

	test("parses deep nested object in array", () => {
		const data = parseQueryString("a[0][c]=x&a[0][d]=y")
		expect(data).toEqual({a: [{c: "x", d: "y"}]})
	})

	test("parses deep nested array in object", () => {
		const data = parseQueryString("a[b][0]=x&a[b][1]=y")
		expect(data).toEqual({a: {b: ["x", "y"]}})
	})

	test("parses array without index", () => {
		const data = parseQueryString("a[]=x&a[]=y&b[]=w&b[]=z")
		expect(data).toEqual({a: ["x", "y"], b: ["w", "z"]})
	})

	test("casts booleans", () => {
		const data = parseQueryString("a=true&b=false")
		expect(data).toEqual({a: true, b: false})
	})

	test("does not cast numbers", () => {
		const data = parseQueryString("a=1&b=-2.3&c=0x10&d=1e2&e=Infinity")
		expect(data).toEqual({a: "1", b: "-2.3", c: "0x10", d: "1e2", e: "Infinity"})
	})

	test("does not cast NaN", () => {
		const data = parseQueryString("a=NaN")
		expect(data.a).toBe("NaN")
	})

	test("does not casts Date", () => {
		const data = parseQueryString("a=1970-01-01")
		expect(typeof data.a).toBe("string")
		expect(data.a).toBe("1970-01-01")
	})

	test("does not cast empty string to number", () => {
		const data = parseQueryString("a=")
		expect(data).toEqual({a: ""})
	})

	test("does not cast void to number", () => {
		const data = parseQueryString("a")
		expect(data).toEqual({a: ""})
	})

	test("prefers later values", () => {
		const data = parseQueryString("a=1&b=2&a=3")
		expect(data).toEqual({a: "3", b: "2"})
	})

	test("doesn't pollute prototype directly, censors `__proto__`", () => {
		const prev = Object.prototype.toString
		const data = parseQueryString("a=b&__proto__%5BtoString%5D=123")
		expect(Object.prototype.toString).toBe(prev)
		expect(data).toEqual({a: "b"})
	})

	test("doesn't pollute prototype indirectly, retains `constructor`", () => {
		const prev = Object.prototype.toString
		const data = parseQueryString("a=b&constructor%5Bprototype%5D%5BtoString%5D=123")
		expect(Object.prototype.toString).toBe(prev)
		// The deep matcher is borked here.
		expect(Object.keys(data)).toEqual(["a", "constructor"])
		expect(data.a).toBe("b")
		expect(data.constructor).toEqual({prototype: {toString: "123"}})
	})
})
