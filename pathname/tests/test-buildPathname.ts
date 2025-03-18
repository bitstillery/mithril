'use strict'

import {describe, test, expect} from 'bun:test';

import buildPathname from '../../pathname/build';

describe('buildPathname', () => {
    function runTest(prefix) {
        test('returns path if no params', () => {
            const string = buildPathname(prefix + '/route/foo', undefined);

            expect(string).toBe(prefix + '/route/foo');
        });
        test('skips interpolation if no params', () => {
            const string = buildPathname(prefix + '/route/:id', undefined);

            expect(string).toBe(prefix + '/route/:id');
        });
        test('appends query strings', () => {
            const string = buildPathname(prefix + '/route/foo', {a: 'b', c: 1});

            expect(string).toBe(prefix + '/route/foo?a=b&c=1');
        });
        test('inserts template parameters at end', () => {
            const string = buildPathname(prefix + '/route/:id', {id: '1'});

            expect(string).toBe(prefix + '/route/1');
        });
        test('inserts template parameters at beginning', () => {
            const string = buildPathname(prefix + '/:id/foo', {id: '1'});

            expect(string).toBe(prefix + '/1/foo');
        });
        test('inserts template parameters at middle', () => {
            const string = buildPathname(prefix + '/route/:id/foo', {id: '1'});

            expect(string).toBe(prefix + '/route/1/foo');
        });
        test('inserts variadic paths', () => {
            const string = buildPathname(prefix + '/route/:foo...', {foo: 'id/1'});

            expect(string).toBe(prefix + '/route/id/1');
        });
        test('inserts variadic paths with initial slashes', () => {
            const string = buildPathname(prefix + '/route/:foo...', {foo: '/id/1'});

            expect(string).toBe(prefix + '/route//id/1');
        });
        test('skips template parameters at end if param missing', () => {
            const string = buildPathname(prefix + '/route/:id', {param: 1});

            expect(string).toBe(prefix + '/route/:id?param=1');
        });
        test('skips template parameters at beginning if param missing', () => {
            const string = buildPathname(prefix + '/:id/foo', {param: 1});

            expect(string).toBe(prefix + '/:id/foo?param=1');
        });
        test('skips template parameters at middle if param missing', () => {
            const string = buildPathname(prefix + '/route/:id/foo', {param: 1});

            expect(string).toBe(prefix + '/route/:id/foo?param=1');
        });
        test('skips variadic template parameters if param missing', () => {
            const string = buildPathname(prefix + '/route/:foo...', {param: '/id/1'});

            expect(string).toBe(prefix + '/route/:foo...?param=%2Fid%2F1');
        });
        test('handles escaped values', () => {
            const data = buildPathname(prefix + '/route/:foo', {foo: ';:@&=+$,/?%#'});

            expect(data).toBe(prefix + '/route/%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23');
        });
        test('handles unicode', () => {
            const data = buildPathname(prefix + '/route/:ö', {ö: 'ö'});

            expect(data).toBe(prefix + '/route/%C3%B6');
        });
        test('handles zero', () => {
            const string = buildPathname(prefix + '/route/:a', {a: 0});

            expect(string).toBe(prefix + '/route/0');
        });
        test('handles false', () => {
            const string = buildPathname(prefix + '/route/:a', {a: false});

            expect(string).toBe(prefix + '/route/false');
        });
        test('handles dashes', () => {
            const string = buildPathname(prefix + '/:lang-:region/route', {
                lang: 'en',
                region: 'US',
            });

            expect(string).toBe(prefix + '/en-US/route');
        });
        test('handles dots', () => {
            const string = buildPathname(prefix + '/:file.:ext/view', {
                file: 'image',
                ext: 'png',
            });

            expect(string).toBe(prefix + '/image.png/view');
        });
        test('merges query strings', () => {
            const string = buildPathname(prefix + '/item?a=1&b=2', {c: 3});

            expect(string).toBe(prefix + '/item?a=1&b=2&c=3');
        });
        test('merges query strings with other parameters', () => {
            const string = buildPathname(prefix + '/item/:id?a=1&b=2', {id: 'foo', c: 3});

            expect(string).toBe(prefix + '/item/foo?a=1&b=2&c=3');
        });
        test('consumes template parameters without modifying query string', () => {
            const string = buildPathname(prefix + '/item/:id?a=1&b=2', {id: 'foo'});

            expect(string).toBe(prefix + '/item/foo?a=1&b=2');
        });
    }

    describe('absolute', () => { runTest(''); });
    describe('relative', () => { runTest('..'); });
    describe('absolute + domain', () => { runTest('https://example.com'); });
    describe('absolute + `file:`', () => { runTest('file://'); });
});
