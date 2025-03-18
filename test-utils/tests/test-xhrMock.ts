'use strict'

import {describe, test, expect, beforeEach} from 'bun:test';

import xhrMock from '../../test-utils/xhrMock';

describe('xhrMock', () => {
    let $window;

    beforeEach(() => {
        $window = xhrMock();
    });

    describe('xhr', () => {
        test('works', async() => {
            $window.$defineRoutes({
                'GET /item': function(request) {
                    expect(request.url).toBe('/item');
                    return {status: 200, responseText: 'test'};
                },
            });

            const xhr = new $window.XMLHttpRequest();

            return new Promise((resolve) => {
                xhr.open('GET', '/item');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        expect(xhr.status).toBe(200);
                        expect(xhr.responseText).toBe('test');
                        resolve();
                    }
                };
                xhr.send();
            });
        });

        test('works w/ search', async() => {
            $window.$defineRoutes({
                'GET /item': function(request) {
                    expect(request.query).toBe('?a=b');
                    return {status: 200, responseText: 'test'};
                },
            });

            const xhr = new $window.XMLHttpRequest();

            return new Promise((resolve) => {
                xhr.open('GET', '/item?a=b');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        resolve();
                    }
                };
                xhr.send();
            });
        });

        test('works w/ body', async() => {
            $window.$defineRoutes({
                'POST /item': function(request) {
                    expect(request.body).toBe('a=b');
                    return {status: 200, responseText: 'test'};
                },
            });

            const xhr = new $window.XMLHttpRequest();

            return new Promise((resolve) => {
                xhr.open('POST', '/item');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        resolve();
                    }
                };
                xhr.send('a=b');
            });
        });

        test('passes event to onreadystatechange', async() => {
            $window.$defineRoutes({
                'GET /item': function(request) {
                    expect(request.url).toBe('/item');
                    return {status: 200, responseText: 'test'};
                },
            });

            const xhr = new $window.XMLHttpRequest();

            return new Promise((resolve) => {
                xhr.open('GET', '/item');
                xhr.onreadystatechange = function(ev) {
                    expect(ev.target).toBe(xhr);
                    if (xhr.readyState === 4) {
                        resolve();
                    }
                };
                xhr.send();
            });
        });

        test('handles routing error', async() => {
            const xhr = new $window.XMLHttpRequest();

            return new Promise((resolve) => {
                xhr.open('GET', '/nonexistent');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        expect(xhr.status).toBe(500);
                        resolve();
                    }
                };
                xhr.send('a=b');
            });
        });

        test('Setting a header twice merges the header', () => {
            // Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
            const xhr = new $window.XMLHttpRequest();
            xhr.open('POST', '/test');
            xhr.setRequestHeader('Content-Type', 'foo');
            xhr.setRequestHeader('Content-Type', 'bar');
            expect(xhr.getRequestHeader('Content-Type')).toBe('foo, bar');
        });
    });
});
