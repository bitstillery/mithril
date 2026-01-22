import {describe, test, expect} from 'bun:test'

import decodeURIComponentSafe from '../../util/decodeURIComponentSafe'

describe('decodeURIComponentSafe', () => {
	test('non-string type (compared to decodeURIComponent)', () => {
		expect(decodeURIComponentSafe()).toBe(decodeURIComponent())
		expect(decodeURIComponentSafe(null!)).toBe(decodeURIComponent(null!))
		expect(decodeURIComponentSafe(0 as any)).toBe(decodeURIComponent(0 as any))
		expect(decodeURIComponentSafe(true as any)).toBe(decodeURIComponent(true as any))
		expect(decodeURIComponentSafe(false as any)).toBe(decodeURIComponent(false as any))
		expect(decodeURIComponentSafe({} as any)).toBe(decodeURIComponent({} as any))
		expect(decodeURIComponentSafe([] as any)).toBe(decodeURIComponent([] as any))
		expect(decodeURIComponentSafe(function() {} as any)).toBe(decodeURIComponent(function() {} as any))
	})

	test('non-percent-encoded string', () => {
		expect(decodeURIComponentSafe('')).toBe('')
		expect(decodeURIComponentSafe('1')).toBe('1')
		expect(decodeURIComponentSafe('abc')).toBe('abc')
		expect(decodeURIComponentSafe('😃')).toBe('😃')
	})

	test('percent-encoded ASCII', () => {
		for (let i = 0; i < 128; i++) {
			const char = String.fromCharCode(i)
			const uenc = '%' + Number(i).toString(16).padStart(2, '0').toUpperCase()
			const lenc = '%' + Number(i).toString(16).padStart(2, '0').toLowerCase()
			const uout = decodeURIComponentSafe(uenc)
			const lout = decodeURIComponentSafe(lenc)
			expect(char).toBe(uout)
			expect(char).toBe(lout)
		}
	})

	test('all code points (without surrogates)', () => {
		const ranges: Array<[number, number]> = [
			[0x0000, 0xD7FF],
			/* [0xD800, 0xDFFF], */
			[0xE000, 0x10FFFF],
		]
		for (const [lo, hi] of ranges) {
			for (let cp = lo; cp <= hi; cp++) {
				const char = String.fromCodePoint(cp)
				// including ASCII characters not encoded by encodeURIComponent
				const enc = encodeURIComponent(char)
				const out = decodeURIComponentSafe(enc)
				expect(char).toBe(out)
			}
		}
	})

	test('invalid byte sequences', () => {
		// `80-BF`: Continuation byte, invalid as start
		expect(decodeURIComponentSafe('%7F')).not.toBe('%7F')
		expect(decodeURIComponentSafe('%80')).toBe('%80')
		expect(decodeURIComponentSafe('%BF')).toBe('%BF')

		// `C0-C1 80-BF`: Overlong encoding for U+0000-U+007F
		expect(decodeURIComponentSafe('%C0%80')).toBe('%C0%80') // U+0000
		expect(decodeURIComponentSafe('%C1%BF')).toBe('%C1%BF') // U+007F
		expect(decodeURIComponentSafe('%C2%80')).not.toBe('%C2%80') // U+0080

		// `E0 80-9F 80-BF`: Overlong encoding for U+0080-U+07FF
		expect(decodeURIComponentSafe('%DF%BF')).not.toBe('%DF%BF') // U+07FF
		expect(decodeURIComponentSafe('%E0%80%80')).toBe('%E0%80%80') // U+0000
		expect(decodeURIComponentSafe('%E0%9F%BF')).toBe('%E0%9F%BF') // U+07FF
		expect(decodeURIComponentSafe('%E0%A0%80')).not.toBe('%E0%A0%80') // U+0800

		// `ED A0-BF 80-BF`: Encoding for UTF-16 surrogate U+D800-U+DFFF
		expect(decodeURIComponentSafe('%ED%9F%BF')).not.toBe('%ED%9F%BF') // U+D7FF
		expect(decodeURIComponentSafe('%ED%A0%80')).toBe('%ED%A0%80') // U+D800
		expect(decodeURIComponentSafe('%ED%AF%BF')).toBe('%ED%AF%BF') // U+DBFF
		expect(decodeURIComponentSafe('%ED%B0%80')).toBe('%ED%B0%80') // U+DC00
		expect(decodeURIComponentSafe('%ED%BF%BF')).toBe('%ED%BF%BF') // U+DFFF
		expect(decodeURIComponentSafe('%EE%80%80')).not.toBe('%EE%80%80') // U+E000

		// `F0 80-8F 80-BF 80-BF`: Overlong encoding for U+0800-U+FFFF
		expect(decodeURIComponentSafe('%EF%BF%BF')).not.toBe('%EF%BF%BF') // U+FFFF
		expect(decodeURIComponentSafe('%F0%80%80%80')).toBe('%F0%80%80%80') // U+0000
		expect(decodeURIComponentSafe('%E0%80%9F%BF')).toBe('%E0%80%9F%BF') // U+07FF
		expect(decodeURIComponentSafe('%E0%80%A0%80')).toBe('%E0%80%A0%80') // U+0800
		expect(decodeURIComponentSafe('%F0%8F%BF%BF')).toBe('%F0%8F%BF%BF') // U+FFFF
		expect(decodeURIComponentSafe('%F0%90%80%80')).not.toBe('%F0%90%80%80') // U+10000

		// `F4 90-BF`: RFC 3629 restricted UTF-8 to only code points UTF-16 could encode.
		expect(decodeURIComponentSafe('%F4%8F%BF%BF')).not.toBe('%F4%8F%BF%BF') // U+10FFFF
		expect(decodeURIComponentSafe('%F4%90%80%80')).toBe('%F4%90%80%80') // U+110000
		expect(decodeURIComponentSafe('%F4%BF%BF%BF')).toBe('%F4%BF%BF%BF') // U+13FFFF

		// `F5-FF`: RFC 3629 restricted UTF-8 to only code points UTF-16 could encode.
		expect(decodeURIComponentSafe('%F5')).toBe('%F5')
		expect(decodeURIComponentSafe('%FF')).toBe('%FF')
		expect(decodeURIComponentSafe('%F5%80%80%80')).toBe('%F5%80%80%80') // U+140000
		expect(decodeURIComponentSafe('%FF%8F%BF%BF')).toBe('%FF%8F%BF%BF')
	})

	test('malformed URI sequence', () => {
		// "%" only
		expect(() => decodeURIComponent('%')).toThrow(URIError)
		expect(decodeURIComponentSafe('%')).toBe('%')
		// "%" with one digit
		expect(() => decodeURIComponent('%1')).toThrow(URIError)
		expect(decodeURIComponentSafe('%1')).toBe('%1')
		// "%" with non-hexadecimal
		expect(() => decodeURIComponent('%G0')).toThrow(URIError)
		expect(decodeURIComponentSafe('%G0')).toBe('%G0')
		// "%" in string
		expect(() => decodeURIComponent('x%y')).toThrow(URIError)
		expect(decodeURIComponentSafe('x%y')).toBe('x%y')
		// Overlong encoding
		expect(() => decodeURIComponent('%E0%80%AF')).toThrow(URIError)
		expect(decodeURIComponentSafe('%E0%80%AF')).toBe('%E0%80%AF')
		// surrogate
		expect(() => decodeURIComponent('%ED%A0%80')).toThrow(URIError)
		expect(decodeURIComponentSafe('%ED%A0%80')).toBe('%ED%A0%80')
	})
})
