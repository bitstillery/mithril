'use strict'

import {describe, test, expect} from 'bun:test';

import parsePathname from '../../pathname/parse';
import compileTemplate from '../../pathname/compileTemplate';

describe('compileTemplate', () => {
    test('checks empty string', () => {
        var data = parsePathname('/')
        expect(compileTemplate('/')(data)).toBe(true)
        expect(data.params).toEqual({})
    })
    test('checks identical match', () => {
        var data = parsePathname('/foo')
        expect(compileTemplate('/foo')(data)).toBe(true)
        expect(data.params).toEqual({})
    })
    test('checks identical mismatch', () => {
        var data = parsePathname('/bar')
        expect(compileTemplate('/foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks single parameter', () => {
        var data = parsePathname('/1')
        expect(compileTemplate('/:id')(data)).toBe(true)
        expect(data.params).toEqual({id: '1'})
    })
    test('checks single variadic parameter', () => {
        var data = parsePathname('/some/path')
        expect(compileTemplate('/:id...')(data)).toBe(true)
        expect(data.params).toEqual({id: 'some/path'})
    })
    test('checks single parameter with extra match', () => {
        var data = parsePathname('/1/foo')
        expect(compileTemplate('/:id/foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1'})
    })
    test('checks single parameter with extra mismatch', () => {
        var data = parsePathname('/1/bar')
        expect(compileTemplate('/:id/foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks single variadic parameter with extra match', () => {
        var data = parsePathname('/some/path/foo')
        expect(compileTemplate('/:id.../foo')(data)).toBe(true)
        expect(data.params).toEqual({id: 'some/path'})
    })
    test('checks single variadic parameter with extra mismatch', () => {
        var data = parsePathname('/some/path/bar')
        expect(compileTemplate('/:id.../foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple parameters', () => {
        var data = parsePathname('/1/2')
        expect(compileTemplate('/:id/:name')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks incomplete multiple parameters', () => {
        var data = parsePathname('/1')
        expect(compileTemplate('/:id/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple parameters with extra match', () => {
        var data = parsePathname('/1/2/foo')
        expect(compileTemplate('/:id/:name/foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks multiple parameters with extra mismatch', () => {
        var data = parsePathname('/1/2/bar')
        expect(compileTemplate('/:id/:name/foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple parameters, last variadic, with extra match', () => {
        var data = parsePathname('/1/some/path/foo')
        expect(compileTemplate('/:id/:name.../foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: 'some/path'})
    })
    test('checks multiple parameters, last variadic, with extra mismatch', () => {
        var data = parsePathname('/1/some/path/bar')
        expect(compileTemplate('/:id/:name.../foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters', () => {
        var data = parsePathname('/1/sep/2')
        expect(compileTemplate('/:id/sep/:name')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks incomplete multiple separated parameters', () => {
        var data = parsePathname('/1')
        expect(compileTemplate('/:id/sep/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
        data = parsePathname('/1/sep')
        expect(compileTemplate('/:id/sep/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters missing sep', () => {
        var data = parsePathname('/1/2')
        expect(compileTemplate('/:id/sep/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters with extra match', () => {
        var data = parsePathname('/1/sep/2/foo')
        expect(compileTemplate('/:id/sep/:name/foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks multiple separated parameters with extra mismatch', () => {
        var data = parsePathname('/1/sep/2/bar')
        expect(compileTemplate('/:id/sep/:name/foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters, last variadic, with extra match', () => {
        var data = parsePathname('/1/sep/some/path/foo')
        expect(compileTemplate('/:id/sep/:name.../foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: 'some/path'})
    })
    test('checks multiple separated parameters, last variadic, with extra mismatch', () => {
        var data = parsePathname('/1/sep/some/path/bar')
        expect(compileTemplate('/:id/sep/:name.../foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple parameters + prefix', () => {
        var data = parsePathname('/route/1/2')
        expect(compileTemplate('/route/:id/:name')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks incomplete multiple parameters + prefix', () => {
        var data = parsePathname('/route/1')
        expect(compileTemplate('/route/:id/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple parameters + prefix with extra match', () => {
        var data = parsePathname('/route/1/2/foo')
        expect(compileTemplate('/route/:id/:name/foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks multiple parameters + prefix with extra mismatch', () => {
        var data = parsePathname('/route/1/2/bar')
        expect(compileTemplate('/route/:id/:name/foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple parameters + prefix, last variadic, with extra match', () => {
        var data = parsePathname('/route/1/some/path/foo')
        expect(compileTemplate('/route/:id/:name.../foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: 'some/path'})
    })
    test('checks multiple parameters + prefix, last variadic, with extra mismatch', () => {
        var data = parsePathname('/route/1/some/path/bar')
        expect(compileTemplate('/route/:id/:name.../foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters + prefix', () => {
        var data = parsePathname('/route/1/sep/2')
        expect(compileTemplate('/route/:id/sep/:name')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks incomplete multiple separated parameters + prefix', () => {
        var data = parsePathname('/route/1')
        expect(compileTemplate('/route/:id/sep/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
        var data = parsePathname('/route/1/sep')
        expect(compileTemplate('/route/:id/sep/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters + prefix missing sep', () => {
        var data = parsePathname('/route/1/2')
        expect(compileTemplate('/route/:id/sep/:name')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters + prefix with extra match', () => {
        var data = parsePathname('/route/1/sep/2/foo')
        expect(compileTemplate('/route/:id/sep/:name/foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: '2'})
    })
    test('checks multiple separated parameters + prefix with extra mismatch', () => {
        var data = parsePathname('/route/1/sep/2/bar')
        expect(compileTemplate('/route/:id/sep/:name/foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks multiple separated parameters + prefix, last variadic, with extra match', () => {
        var data = parsePathname('/route/1/sep/some/path/foo')
        expect(compileTemplate('/route/:id/sep/:name.../foo')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', name: 'some/path'})
    })
    test('checks multiple separated parameters + prefix, last variadic, with extra mismatch', () => {
        var data = parsePathname('/route/1/sep/some/path/bar')
        expect(compileTemplate('/route/:id/sep/:name.../foo')(data)).toBe(false)
        expect(data.params).toEqual({})
    })
    test('checks query params match', () => {
        var data = parsePathname('/route/1?foo=bar')
        expect(compileTemplate('/route/:id?foo=bar')(data)).toBe(true)
        expect(data.params).toEqual({id: '1', foo: 'bar'})
    })
    test('checks query params mismatch', () => {
        var data = parsePathname('/route/1?foo=bar')
        expect(compileTemplate('/route/:id?foo=1')(data)).toBe(false)
        expect(data.params).toEqual({foo: 'bar'})
        expect(compileTemplate('/route/:id?bar=foo')(data)).toBe(false)
        expect(data.params).toEqual({foo: 'bar'})
    })
    test('checks dot before dot', () => {
        var data = parsePathname('/file.test.png/edit')
        expect(compileTemplate('/:file.:ext/edit')(data)).toBe(true)
        expect(data.params).toEqual({file: 'file.test', ext: 'png'})
    })
    test('checks dash before dot', () => {
        var data = parsePathname('/file-test.png/edit')
        expect(compileTemplate('/:file.:ext/edit')(data)).toBe(true)
        expect(data.params).toEqual({file: 'file-test', ext: 'png'})
    })
    test('checks dot before dash', () => {
        var data = parsePathname('/file.test-png/edit')
        expect(compileTemplate('/:file-:ext/edit')(data)).toBe(true)
        expect(data.params).toEqual({file: 'file.test', ext: 'png'})
    })
    test('checks dash before dash', () => {
        var data = parsePathname('/file-test-png/edit')
        expect(compileTemplate('/:file-:ext/edit')(data)).toBe(true)
        expect(data.params).toEqual({file: 'file-test', ext: 'png'})
    })
})
