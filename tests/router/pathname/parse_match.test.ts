// Pins parsePathname and compileTemplate, so faster route matching can't drift from them.
import {describe, test, expect} from 'bun:test'

import parsePathname from '../../../src/router/pathname/parse'
import compileTemplate from '../../../src/router/pathname/compile_template'

import type {RouteParams} from '../../../src/router/querystring/parse'

const parseCases: Array<[string, {path: string; params: RouteParams}]> = [
    ['', {path: '/', params: {}}],
    ['a', {path: '/a', params: {}}],
    ['/a', {path: '/a', params: {}}],
    ['//a//b', {path: '/a/b', params: {}}],
    ['/a?b=1', {path: '/a', params: {b: '1'}}],
    ['/a#h', {path: '/a', params: {}}],
    ['/a?b=1#h', {path: '/a', params: {b: '1'}}],
    ['/a#h?b=1', {path: '/a#h', params: {}}],
    ['a?', {path: '/a', params: {}}],
    ['?x=1', {path: '/', params: {x: '1'}}],
    ['/a/', {path: '/a/', params: {}}],
    ['///', {path: '/', params: {}}],
    ['#h', {path: '/', params: {}}],
    ['/a?b=1&c[]=2', {path: '/a', params: {b: '1', c: ['2']}}],
]

// [template, url, matches, params after the check]
const matchCases: Array<[string, string, boolean, RouteParams]> = [
    ['/', '/', true, {}],
    ['/', '/a', false, {}],
    ['/', '', true, {}],
    ['/a', '/a', true, {}],
    ['/a', '/a/', true, {}],
    ['/a', '/a//', true, {}],
    ['/a', '/A', false, {}],
    ['/a', '/ab', false, {}],
    ['/a', '/xa', false, {}],
    ['/a/', '/a', false, {}],
    ['/a/', '/a/', true, {}],
    ['/a.b', '/axb', false, {}],
    ['/a.b', '/a.b', true, {}],
    ['/a/:id', '/a/1', true, {id: '1'}],
    ['/a/:id', '/a/1/', true, {id: '1'}],
    ['/a/:id', '/a/', false, {}],
    ['/a/:id', '/a/1/2', false, {}],
    ['/a/:id', '/a/x%20y', true, {id: 'x y'}],
    ['/files/:p...', '/files/a/b', true, {p: 'a/b'}],
    ['/files/:p...', '/files/', true, {p: ''}],
    ['/files/:p...', '/files', false, {}],
    ['/files/:p...', '/files/a%20b', true, {p: 'a%20b'}],
    ['/:file.:ext', '/x.json', true, {file: 'x', ext: 'json'}],
    ['/:file.:ext', '/x.y.json', true, {file: 'x.y', ext: 'json'}],
    ['/:lang-:locale', '/en-US', true, {lang: 'en', locale: 'US'}],
    ['/a?x=1', '/a?x=1', true, {x: '1'}],
    ['/a?x=1', '/a?x=2', false, {x: '2'}],
    ['/a?x=1', '/a', false, {}],
    ['/a/(b)', '/a/(b)', true, {}],
    ['/a$', '/a$', true, {}],
    ['/a+', '/a+', true, {}],
    ['/a+', '/aa', false, {}],
    ['/a:/b', '/a:/b', true, {}],
    ['/a/:id', '/a/1?id=2', true, {id: '1'}],
    ['/a', '/a?x=1', true, {x: '1'}],
    ['/a b', '/a b', true, {}],
    ['/a\nb', '/a\nb', true, {}],
    ['/a\nb', '/anb', false, {}],
    ['/a[b]', '/a[b]', true, {}],
    ['/a{2}', '/a{2}', true, {}],
    ['/a{2}', '/aa', false, {}],
    ['/a^b|c', '/a^b|c', true, {}],
    ['/a\\b', '/a\\b', true, {}],
    ['/a*', '/a*', true, {}],
    ['/a*', '/abc', false, {}],
    ['', '/', true, {}],
    ['a', '/a', true, {}],
    ['/a//b', '/a/b', true, {}],
    ['/a/b', '/a/b/', true, {}],
    ['/a/b', '/a/b//', true, {}],
]

describe('parsePathname', () => {
    for (const [input, expected] of parseCases) {
        test(JSON.stringify(input), () => {
            expect(parsePathname(input)).toEqual(expected)
        })
    }
})

describe('compileTemplate', () => {
    for (const [template, url, matches, params] of matchCases) {
        test(`${JSON.stringify(template)} against ${JSON.stringify(url)}`, () => {
            const data = parsePathname(url)
            expect(compileTemplate(template)(data)).toBe(matches)
            expect(data.params).toEqual(params)
        })
    }
    test('a malformed escape in a parameter throws', () => {
        expect(() => compileTemplate('/a/:id')(parsePathname('/a/%E0%A4%A'))).toThrow(URIError)
    })
    test('a check can be reused across paths', () => {
        const check = compileTemplate('/users/:id')
        expect(check(parsePathname('/users/1'))).toBe(true)
        expect(check(parsePathname('/posts/1'))).toBe(false)
        const data = parsePathname('/users/2')
        expect(check(data)).toBe(true)
        expect(data.params).toEqual({id: '2'})
    })
})
