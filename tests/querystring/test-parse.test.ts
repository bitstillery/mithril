// @ts-nocheck
// Pins parseQueryString's output, quirks included, so a faster parser can't drift from it.
import {describe, test, expect} from 'bun:test'

import parseQueryString from '../../querystring/parse'

const cases: Array<[string, unknown]> = [
    ['', {}],
    ['?', {'0': ''}],
    ['?a=1', {a: '1'}],
    ['a=b', {a: 'b'}],
    ['a=1&b=2', {a: '1', b: '2'}],
    ['a', {a: ''}],
    ['a=', {a: ''}],
    ['a=b=c', {a: ''}],
    ['=x', {'0': 'x'}],
    ['=x&=y', {'0': 'x', '1': 'y'}],
    ['a=true&b=false', {a: true, b: false}],
    ['a%20b=c%20d', {'a b': 'c d'}],
    ['a=%E2%9C%93', {a: '✓'}],
    ['a=%ZZ', {a: '%ZZ'}],
    ['a=%', {a: '%'}],
    ['a=%C0%80', {a: '%C0%80'}],
    ['a[]=1&a[]=2', {a: ['1', '2']}],
    ['a[0]=x&a[1]=y', {a: ['x', 'y']}],
    ['a[b]=1&a[c]=2', {a: {b: '1', c: '2'}}],
    ['a[b][c]=1', {a: {b: {c: '1'}}}],
    ['a[b][]=1&a[b][]=2', {a: {b: ['1', '2']}}],
    ['__proto__[x]=1', {}],
    ['__proto__=1', {}],
    ['constructor[prototype][x]=1', {constructor: {prototype: {x: '1'}}}],
    ['a]b=1', {a: {b: '1'}}],
    ['a[=1', {a: '1'}],
    ['a]=1', {a: ['1']}],
    ['a=1&a=2', {a: '2'}],
    ['tags=red,green', {tags: 'red,green'}],
    ['a+b=c+d', {'a+b': 'c+d'}],
    ['a=1&&b=2', {'0': '', a: '1', b: '2'}],
    ['toString=x', {toString: 'x'}],
    ['0=a&1=b', {'0': 'a', '1': 'b'}],
    ['a%5B%5D=1&a%5B%5D=2', {a: ['1', '2']}],
    ['a[]=1&a=2', {a: '2'}],
    ['%5F%5Fproto%5F%5F=1', {}],
    ['x[]=1&=2&y[]=3', {'0': '2', x: ['1'], y: ['3']}],
    ['a=1&b', {a: '1', b: ''}],
    ['a=%3D&b=%26', {a: '=', b: '&'}],
    ['q=hello%20world&page=2&sort=name', {q: 'hello world', page: '2', sort: 'name'}],
    ['flag=TRUE&x=true1', {flag: 'TRUE', x: 'true1'}],
]

describe('parseQueryString', () => {
    for (const [input, expected] of cases) {
        test(JSON.stringify(input), () => {
            expect(parseQueryString(input)).toEqual(expected)
        })
    }
    test('a=1&a[]=2 throws', () => {
        expect(() => parseQueryString('a=1&a[]=2')).toThrow(TypeError)
    })
    test('null and undefined give an empty object', () => {
        expect(parseQueryString(null)).toEqual({})
        expect(parseQueryString(undefined)).toEqual({})
    })
    test('key order follows the string, with integer keys first', () => {
        expect(Object.keys(parseQueryString('b=1&a=2&1=x&c=3'))).toEqual(['1', 'b', 'a', 'c'])
    })
    test('a returned object has the ordinary prototype', () => {
        expect(Object.getPrototypeOf(parseQueryString('a=1'))).toBe(Object.prototype)
    })
    test('never pollutes Object.prototype', () => {
        parseQueryString('__proto__[polluted]=1&constructor[prototype][polluted]=1&__proto__=x')
        expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    })
})
