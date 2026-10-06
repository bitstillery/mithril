// @ts-nocheck
// Pins buildQueryString's output so a faster builder can't drift from it.
import {describe, test, expect} from 'bun:test'

import buildQueryString from '../../querystring/build'

const cases: Array<[string, unknown, string]> = [
    ['{}', {}, ''],
    ['{a: 1}', {a: 1}, 'a=1'],
    ["{a: 'b c', 'd e': 'f'}", {a: 'b c', 'd e': 'f'}, 'a=b%20c&d%20e=f'],
    ['{a: null}', {a: null}, 'a'],
    ['{a: undefined}', {a: undefined}, 'a'],
    ["{a: ''}", {a: ''}, 'a'],
    ['{a: true, b: false}', {a: true, b: false}, 'a=true&b=false'],
    ['{a: [1, 2]}', {a: [1, 2]}, 'a=1,2'],
    ['{a: []}', {a: []}, ''],
    ["{a: [null, 'x', undefined]}", {a: [null, 'x', undefined]}, 'a=,x,'],
    ["{a: ['x,y', 'z']}", {a: ['x,y', 'z']}, 'a=x%2Cy,z'],
    ['{a: {b: 1, c: {d: 2}}}', {a: {b: 1, c: {d: 2}}}, 'a%5Bb%5D=1&a%5Bc%5D%5Bd%5D=2'],
    ['{a: {}}', {a: {}}, ''],
    ['{a: 0, b: NaN}', {a: 0, b: NaN}, 'a=0&b=NaN'],
    [
        'Object.create({x: 1}, {y: {value: 2, enumerable: true}})',
        Object.create({x: 1}, {y: {value: 2, enumerable: true}}),
        'y=2&x=1',
    ],
    ['[1, 2]', [1, 2], ''],
    ["'str'", 'str', ''],
    ['null', null, ''],
    ['{a: {b: [1, 2]}}', {a: {b: [1, 2]}}, 'a%5Bb%5D=1,2'],
    ['{a: [{b: 1}]}', {a: [{b: 1}]}, 'a=%5Bobject%20Object%5D'],
    ["{b: 1, 2: 'x', 1: 'y'}", {b: 1, 2: 'x', 1: 'y'}, '1=y&2=x&b=1'],
    ["{q: '✓ é'}", {q: '✓ é'}, 'q=%E2%9C%93%20%C3%A9'],
    ['Object.create(null)', Object.create(null), ''],
    ["{'a&b': 'c=d', e: '#?/'}", {'a&b': 'c=d', e: '#?/'}, 'a%26b=c%3Dd&e=%23%3F%2F'],
    [
        "{page: 2, sort: 'name', tags: ['red', 'green'], filter: {status: 'active'}}",
        {page: 2, sort: 'name', tags: ['red', 'green'], filter: {status: 'active'}},
        'page=2&sort=name&tags=red,green&filter%5Bstatus%5D=active',
    ],
]

describe('buildQueryString', () => {
    for (const [name, input, expected] of cases) {
        test(name, () => {
            expect(buildQueryString(input)).toBe(expected)
        })
    }
    test('a null-prototype object with keys', () => {
        const input = Object.create(null)
        input.a = 1
        expect(buildQueryString(input)).toBe('a=1')
    })
    test('an empty key still gets its separator', () => {
        expect(buildQueryString({'': null, a: 1})).toBe('&a=1')
        expect(buildQueryString({a: 1, '': null})).toBe('a=1&')
        expect(buildQueryString({'': null})).toBe('')
        expect(buildQueryString({'': [null]})).toBe('=')
    })
    test('a lone surrogate throws', () => {
        expect(() => buildQueryString({a: '\ud800'})).toThrow(URIError)
        expect(() => buildQueryString({a: ['x', '\ud800']})).toThrow(URIError)
    })
    test('converts an object value to a string once', () => {
        let calls = 0
        const value = {
            toString() {
                calls++
                return 'x y'
            },
        }
        expect(buildQueryString({a: [value]})).toBe('a=x%20y')
        expect(calls).toBe(1)
    })
    test('a class instance is not a plain object', () => {
        class Params {
            a = 1
        }
        expect(buildQueryString(new Params())).toBe('a=1')
    })
})
