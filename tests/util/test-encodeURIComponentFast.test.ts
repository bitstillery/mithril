// @ts-nocheck
import {describe, test, expect} from 'bun:test'

import encodeURIComponentFast from '../../util/encodeURIComponentFast'

function outcome(fn: () => string): string {
    try {
        return 'ok:' + fn()
    } catch (e) {
        return 'throws:' + e.name
    }
}

describe('encodeURIComponentFast', () => {
    test('matches encodeURIComponent for every UTF-16 code unit, lone surrogates included', () => {
        for (let c = 0; c <= 0xffff; c++) {
            const input = 'a' + String.fromCharCode(c) + 'b'
            expect(outcome(() => encodeURIComponentFast(input))).toBe(outcome(() => encodeURIComponent(input)))
        }
    })

    test('matches encodeURIComponent for astral code points', () => {
        for (const cp of [0x10000, 0x1f603, 0x10ffff]) {
            const input = String.fromCodePoint(cp)
            expect(encodeURIComponentFast(input)).toBe(encodeURIComponent(input))
        }
    })

    test('matches encodeURIComponent for non-strings', () => {
        const values = [
            0,
            -1,
            1.5,
            1e21,
            -0,
            NaN,
            Infinity,
            true,
            false,
            null,
            undefined,
            {},
            [1, 2],
            {toString: () => 'a b'},
            10n,
            function () {},
        ]
        for (const value of values) {
            expect(outcome(() => encodeURIComponentFast(value))).toBe(outcome(() => encodeURIComponent(value)))
        }
    })

    test('a symbol throws, like encodeURIComponent', () => {
        expect(() => encodeURIComponentFast(Symbol('x'))).toThrow(TypeError)
    })

    test('converts an object to a string once', () => {
        let calls = 0
        const value = {
            toString() {
                calls++
                return 'x'
            },
        }
        expect(encodeURIComponentFast(value)).toBe('x')
        expect(calls).toBe(1)
    })
})
