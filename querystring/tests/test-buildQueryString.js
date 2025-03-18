"use strict"

import { describe, test, expect } from "bun:test";
import buildQueryString from "../../querystring/build";

describe("buildQueryString", () => {
	test("handles flat object", () => {
		const string = buildQueryString({a: "b", c: 1})

		expect(string).toBe("a=b&c=1")
	})

	test("handles escaped values", () => {
		const data = buildQueryString({";:@&=+$,/?%#": ";:@&=+$,/?%#"})

		expect(data).toBe("%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23=%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23")
	})

	test("handles unicode", () => {
		const data = buildQueryString({"ö": "ö"})

		expect(data).toBe("%C3%B6=%C3%B6")
	})

	test("handles nested object", () => {
		const string = buildQueryString({a: {b: 1, c: 2}})

		expect(string).toBe("a%5Bb%5D=1&a%5Bc%5D=2")
	})

	test("handles deep nested object", () => {
		const string = buildQueryString({a: {b: {c: 1, d: 2}}})

		expect(string).toBe("a%5Bb%5D%5Bc%5D=1&a%5Bb%5D%5Bd%5D=2")
	})

	test("handles nested array", () => {
		const string = buildQueryString({a: ["x", "y"]})

		expect(string).toBe("a%5B0%5D=x&a%5B1%5D=y")
	})

	test("handles array w/ dupe values", () => {
		const string = buildQueryString({a: ["x", "x"]})

		expect(string).toBe("a%5B0%5D=x&a%5B1%5D=x")
	})

	test("handles deep nested array", () => {
		const string = buildQueryString({a: [["x", "y"]]})

		expect(string).toBe("a%5B0%5D%5B0%5D=x&a%5B0%5D%5B1%5D=y")
	})

	test("handles deep nested array in object", () => {
		const string = buildQueryString({a: {b: ["x", "y"]}})

		expect(string).toBe("a%5Bb%5D%5B0%5D=x&a%5Bb%5D%5B1%5D=y")
	})

	test("handles deep nested object in array", () => {
		const string = buildQueryString({a: [{b: 1, c: 2}]})

		expect(string).toBe("a%5B0%5D%5Bb%5D=1&a%5B0%5D%5Bc%5D=2")
	})

	test("handles date", () => {
		const string = buildQueryString({a: new Date(0)})

		expect(string).toBe("a=" + encodeURIComponent(new Date(0).toString()))
	})

	test("turns null into value-less string (like jQuery)", () => {
		const string = buildQueryString({a: null})

		expect(string).toBe("a")
	})

	test("turns undefined into value-less string (like jQuery)", () => {
		const string = buildQueryString({a: undefined})

		expect(string).toBe("a")
	})

	test("turns empty string into value-less string (like jQuery)", () => {
		const string = buildQueryString({a: ""})

		expect(string).toBe("a")
	})

	test("handles zero", () => {
		const string = buildQueryString({a: 0})

		expect(string).toBe("a=0")
	})

	test("handles false", () => {
		const string = buildQueryString({a: false})

		expect(string).toBe("a=false")
	})
})
