// @ts-nocheck
import {describe, test, expect} from 'bun:test'

import censor from '../../util/censor'

describe('censor', () => {
	describe('magic missing, no extras', () => {
		test('returns new object', () => {
			const original = {one: 'two'}
			const censored = censor(original)
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {one: 'two'}
			censor(original)
			expect(original).toEqual({one: 'two'})
		})
	})

	describe('magic present, no extras', () => {
		test('returns new object', () => {
			const original = {
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			const censored = censor(original)
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			censor(original)
			expect(original).toEqual({
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			})
		})
	})

	describe('magic missing, null extras', () => {
		test('returns new object', () => {
			const original = {one: 'two'}
			const censored = censor(original, null)
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {one: 'two'}
			censor(original, null)
			expect(original).toEqual({one: 'two'})
		})
	})

	describe('magic present, null extras', () => {
		test('returns new object', () => {
			const original = {
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			const censored = censor(original, null)
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			censor(original, null)
			expect(original).toEqual({
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			})
		})
	})

	describe('magic missing, extras missing', () => {
		test('returns new object', () => {
			const original = {one: 'two'}
			const censored = censor(original, ['extra'])
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {one: 'two'}
			censor(original, ['extra'])
			expect(original).toEqual({one: 'two'})
		})
	})

	describe('magic present, extras missing', () => {
		test('returns new object', () => {
			const original = {
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			const censored = censor(original, ['extra'])
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			censor(original, ['extra'])
			expect(original).toEqual({
				one: 'two',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			})
		})
	})

	describe('magic missing, extras present', () => {
		test('returns new object', () => {
			const original = {
				one: 'two',
				extra: 'test',
			}
			const censored = censor(original, ['extra'])
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {
				one: 'two',
				extra: 'test',
			}
			censor(original, ['extra'])
			expect(original).toEqual({
				one: 'two',
				extra: 'test',
			})
		})
	})

	describe('magic present, extras present', () => {
		test('returns new object', () => {
			const original = {
				one: 'two',
				extra: 'test',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			const censored = censor(original, ['extra'])
			expect(censored).not.toBe(original)
			expect(censored).toEqual({one: 'two'})
		})
		test('does not modify original object', () => {
			const original = {
				one: 'two',
				extra: 'test',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			}
			censor(original, ['extra'])
			expect(original).toEqual({
				one: 'two',
				extra: 'test',
				key: 'test',
				oninit: 'test',
				oncreate: 'test',
				onbeforeupdate: 'test',
				onupdate: 'test',
				onbeforeremove: 'test',
				onremove: 'test',
			})
		})
	})
})
