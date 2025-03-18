import {describe, test, expect, beforeEach} from 'bun:test';

import domMock from '../../test-utils/domMock';
import renderFn from '../../render/render';

describe('createText', () => {
    let $window, root, render;
    beforeEach(() => {
        $window = domMock();
        root = $window.document.createElement('div');
        render = renderFn($window)
    });

    test('creates string', () => {
        const vnode = 'a';
        render(root, vnode);

        expect(root.firstChild.nodeName).toBe('#text');
        expect(root.firstChild.nodeValue).toBe('a');
    });

    test('creates falsy string', () => {
        const vnode = '';
        render(root, vnode);

        expect(root.firstChild.nodeName).toBe('#text');
        expect(root.firstChild.nodeValue).toBe('');
    });

    test('creates number', () => {
        const vnode = 1;
        render(root, vnode);

        expect(root.firstChild.nodeName).toBe('#text');
        expect(root.firstChild.nodeValue).toBe('1');
    });

    test('creates falsy number', () => {
        const vnode = 0;
        render(root, vnode);

        expect(root.firstChild.nodeName).toBe('#text');
        expect(root.firstChild.nodeValue).toBe('0');
    });

    test('ignores true boolean', () => {
        const vnode = true;
        render(root, vnode);

        expect(root.childNodes.length).toBe(0);
    });

    test('creates false boolean', () => {
        const vnode = false;
        render(root, vnode);

        expect(root.childNodes.length).toBe(0);
    });

    test('creates spaces', () => {
        const vnode = '   ';
        render(root, vnode);

        expect(root.firstChild.nodeName).toBe('#text');
        expect(root.firstChild.nodeValue).toBe('   ');
    });

    test('ignores html', () => {
        const vnode = '<a></a>&trade;';
        render(root, vnode);

        expect(root.firstChild.nodeName).toBe('#text');
        expect(root.firstChild.nodeValue).toBe('<a></a>&trade;');
    });
});
