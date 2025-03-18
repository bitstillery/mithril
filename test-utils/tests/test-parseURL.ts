'use strict'

import {describe, test, expect} from 'bun:test'

import parseURL from '../../test-utils/parseURL'

describe('parseURL', () => {
    const root = {protocol: 'http:', hostname: 'localhost', port: '', pathname: '/'}

    describe('full URL', () => {
        test('parses full http URL', () => {
            const data = parseURL('http://www.google.com:80/test?a=b#c')
            expect(data.protocol).toBe('http:')
            expect(data.hostname).toBe('www.google.com')
            expect(data.port).toBe('80')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('parses full websocket URL', () => {
            const data = parseURL('ws://www.google.com:80/test?a=b#c')
            expect(data.protocol).toBe('ws:')
            expect(data.hostname).toBe('www.google.com')
            expect(data.port).toBe('80')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('parses full URL omitting optionals', () => {
            const data = parseURL('http://www.google.com')
            expect(data.protocol).toBe('http:')
            expect(data.hostname).toBe('www.google.com')
            expect(data.port).toBe('')
            expect(data.pathname).toBe('/')
            expect(data.search).toBe('')
            expect(data.hash).toBe('')
        })
    })

    describe('absolute path', () => {
        test('parses absolute path', () => {
            const data = parseURL('/test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('parses absolute path omitting optionals', () => {
            const data = parseURL('/test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })
    })

    describe('relative path', () => {
        test('parses relative URL', () => {
            const data = parseURL('test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('parses relative URL omitting optionals', () => {
            const data = parseURL('test', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('')
            expect(data.hash).toBe('')
        })

        test('parses relative URL with dot', () => {
            const data = parseURL('././test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('parses relative URL with dotdot', () => {
            const data = parseURL('foo/bar/../../test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('clamps invalid dotdot', () => {
            const data = parseURL('../../test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('clamps invalid dotdot after dot', () => {
            const data = parseURL('./../../test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })

        test('clamps invalid dotdot after valid path', () => {
            const data = parseURL('a/../../test?a=b#c', root)
            expect(data.protocol).toBe(root.protocol)
            expect(data.hostname).toBe(root.hostname)
            expect(data.port).toBe(root.port)
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a=b')
            expect(data.hash).toBe('#c')
        })
    })

    describe('edge cases', () => {
        test('handles hash w/ question mark', () => {
            const data = parseURL('http://www.google.com/test#a?c')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('')
            expect(data.hash).toBe('#a?c')
        })

        test('handles hash w/ slash', () => {
            const data = parseURL('http://www.google.com/test#a/c')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('')
            expect(data.hash).toBe('#a/c')
        })

        test('handles hash w/ colon', () => {
            const data = parseURL('http://www.google.com/test#a:c')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('')
            expect(data.hash).toBe('#a:c')
        })

        test('handles search w/ slash', () => {
            const data = parseURL('http://www.google.com/test?a/c')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a/c')
            expect(data.hash).toBe('')
        })

        test('handles search w/ colon', () => {
            const data = parseURL('http://www.google.com/test?a:c')
            expect(data.pathname).toBe('/test')
            expect(data.search).toBe('?a:c')
            expect(data.hash).toBe('')
        })

        test('handles pathname w/ colon', () => {
            const data = parseURL('http://www.google.com/a:b')
            expect(data.pathname).toBe('/a:b')
        })
    })
})
