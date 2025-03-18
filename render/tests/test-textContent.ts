import {describe, test, expect, beforeEach} from 'bun:test';

import domMock from '../../test-utils/domMock';
import renderFn from '../../render/render';
import m from '../../render/hyperscript';

describe('textContent', () => {
    let $window, root, render;
    beforeEach(() => {
        $window = domMock();
        root = $window.document.createElement('div');
        render = renderFn($window)
    });

    test('ignores null', () => {
        const vnode = m('a', null);

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('ignores undefined', () => {
        const vnode = m('a', undefined);

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('creates string', () => {
        const vnode = m('a', 'a');

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('a');
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('creates falsy string', () => {
        const vnode = m('a', '');

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('');
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('creates number', () => {
        const vnode = m('a', 1);

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('1');
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('creates falsy number', () => {
        const vnode = m('a', 0);

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('0');
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('creates boolean', () => {
        const vnode = m('a', true);

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('creates falsy boolean', () => {
        const vnode = m('a', false);

        render(root, vnode);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(vnode.dom).toBe(root.childNodes[0]);
    });

    test('updates to string', () => {
        const vnode = m('a', 'a');
        const updated = m('a', 'b');

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('b');
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates to falsy string', () => {
        const vnode = m('a', 'a');
        const updated = m('a', '');

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('');
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates to number', () => {
        const vnode = m('a', 'a');
        const updated = m('a', 1);

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('1');
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates to falsy number', () => {
        const vnode = m('a', 'a');
        const updated = m('a', 0);

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('0');
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates true to nothing', () => {
        const vnode = m('a', 'a');
        const updated = m('a', true);

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates false to nothing', () => {
        const vnode = m('a', 'a');
        const updated = m('a', false);

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates with typecasting', () => {
        const vnode = m('a', '1');
        const updated = m('a', 1);

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('1');
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates from without text to with text', () => {
        const vnode = m('a');
        const updated = m('a', 'b');

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes[0].nodeValue).toBe('b');
        expect(updated.dom).toBe(root.childNodes[0]);
    });

    test('updates from with text to without text', () => {
        const vnode = m('a', 'a');
        const updated = m('a');

        render(root, vnode);
        render(root, updated);

        expect(root.childNodes.length).toBe(1);
        expect(vnode.dom.childNodes.length).toBe(0);
        expect(updated.dom).toBe(root.childNodes[0]);
    });
});
