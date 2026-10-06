// @ts-nocheck
// Pins buildPathname's output, quirks included, so a faster builder can't drift from it.
import {describe, test, expect} from 'bun:test'

import buildPathname from '../../pathname/build'

const cases: Array<[string, string, unknown, string]> = [
    ['/a', '{}', {}, '/a'],
    ['/a/:id', '{id: 1}', {id: 1}, '/a/1'],
    ['/a/:id', "{id: 'x y/z'}", {id: 'x y/z'}, '/a/x%20y%2Fz'],
    ['/a/:id', '{}', {}, '/a/:id'],
    ['/a/:id', '{id: null}', {id: null}, '/a/:id'],
    ['/a/:p...', "{p: 'b/c d'}", {p: 'b/c d'}, '/a/b/c d'],
    ['/a/:id', '{id: 1, q: 2}', {id: 1, q: 2}, '/a/1?q=2'],
    ['/a?x=1', '{y: 2}', {y: 2}, '/a?x=1&y=2'],
    ['/a?x=1#h', '{y: 2}', {y: 2}, '/a?x=1&y=2#h'],
    ['/a#h', '{y: 2}', {y: 2}, '/a?y=2#h'],
    ['/a#h', '{}', {}, '/a#h'],
    ['/a?x=1#h', '{}', {}, '/a?x=1#h'],
    ['/a?x=1', '{}', {}, '/a?x=1'],
    ['/a/:p...', "{p: 'b?c=1#d'}", {p: 'b?c=1#d'}, '/a/b??c=1#d'],
    ['/a/:p...', "{p: 'b?c=1'}", {p: 'b?c=1'}, '/a/b??c=1'],
    ['/a?x=1/:p...', "{p: 'b?c=1#d'}", {p: 'b?c=1#d'}, '/a?x=1/:p...&p=b%3Fc%3D1%23d'],
    ['/a#x?y', '{}', {}, '/a#x?y&#x'],
    ['/a#x?y', '{z: 1}', {z: 1}, '/a&z=1#x?y&#x'],
    ['/:a.:b', "{a: 1, b: 'json'}", {a: 1, b: 'json'}, '/1.json'],
    ['/:a-:b', "{a: 'en', b: 'US'}", {a: 'en', b: 'US'}, '/en-US'],
    ['', '{}', {}, ''],
    ['/a', '{arr: [1, 2]}', {arr: [1, 2]}, '/a?arr=1,2'],
    ['/a', 'null', null, '/a'],
    ['/a/:id/:id', '{id: 3}', {id: 3}, '/a/3/3'],
    ['/a/:id', '{id: 0}', {id: 0}, '/a/0'],
    ['/a/:id', '{id: false}', {id: false}, '/a/false'],
    ['/a/:id', 'Object.create({id: 5})', Object.create({id: 5}), '/a/5'],
    ['/a/:id', '{id: 1, x: undefined}', {id: 1, x: undefined}, '/a/1?x'],
    ['a/:x', "{x: 'y'}", {x: 'y'}, 'a/y'],
    ['/a/:x?b=2', '{x: 1, c: 3}', {x: 1, c: 3}, '/a/1?b=2&c=3'],
    ['/a', 'Object.create({x: 1})', Object.create({x: 1}), '/a'],
    ['/a/:id', "{id: 1, id2: 2, ':id': 3}", {id: 1, id2: 2, ':id': 3}, '/a/1?id2=2&%3Aid=3'],
    ['/settings/profile', '{}', {}, '/settings/profile'],
    ['/a/:b', "{b: 'c', a: {d: 1}}", {b: 'c', a: {d: 1}}, '/a/c?a%5Bd%5D=1'],
    ['/a:', '{}', {}, '/a:'],
    ['/a/:', "{'': 1}", {'': 1}, '/a/:?=1'],
    ['/a/:id', '{1: 2, id: 3, b: 4}', {1: 2, id: 3, b: 4}, '/a/3?1=2&b=4'],
]

describe('buildPathname', () => {
    for (const [template, name, params, expected] of cases) {
        test(`${JSON.stringify(template)} with ${name}`, () => {
            expect(buildPathname(template, params)).toBe(expected)
        })
    }
    test('adjacent parameters throw', () => {
        expect(() => buildPathname('/a:b:c', {})).toThrow(SyntaxError)
        expect(() => buildPathname('/a:b:c', null)).toThrow(SyntaxError)
    })
    test('leaves params untouched', () => {
        const params = {id: 1, q: 2}
        buildPathname('/a/:id', params)
        expect(params).toEqual({id: 1, q: 2})
    })
})
