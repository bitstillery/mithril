import {describe, test, expect, beforeEach, mock} from 'bun:test';

import domMock from '../../test-utils/domMock';
import renderFn from '../../render/render';
import m from '../../render/hyperscript';
import fragment from '../../render/fragment';

describe('oninit', () => {
    let $window, root, render;
    beforeEach(() => {
        $window = domMock();
        root = $window.document.createElement('div');
        render = renderFn($window)
    });

    test('calls oninit when creating element', () => {
        const callback = mock(() => {});
        const vnode = m('div', {oninit: callback});

        render(root, vnode);

        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toBe(vnode);
    });

    test('calls oninit when creating fragment', () => {
        const callback = mock(() => {});
        const vnode = fragment({oninit: callback});

        render(root, vnode);

        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toBe(vnode);
    });

    test('calls oninit when replacing keyed', () => {
        const createDiv = mock(() => {});
        const createA = mock(() => {});
        const vnode = m('div', {key: 1, oninit: createDiv});
        const updated = m('a', {key: 1, oninit: createA});

        render(root, vnode);
        render(root, updated);

        expect(createDiv.mock.calls.length).toBe(1);
        expect(createDiv.mock.calls[0][0]).toBe(vnode);
        expect(createA.mock.calls.length).toBe(1);
        expect(createA.mock.calls[0][0]).toBe(updated);
    });

    test('does not call oninit when noop', () => {
        const create = mock(() => {});
        const update = mock(() => {});
        const vnode = m('div', {oninit: create});
        const updated = m('div', {oninit: update});

        render(root, vnode);
        render(root, updated);

        expect(create.mock.calls.length).toBe(1);
        expect(create.mock.calls[0][0]).toBe(vnode);
        expect(update.mock.calls.length).toBe(0);
    });

    test('does not call oninit when updating attr', () => {
        const create = mock(() => {});
        const update = mock(() => {});
        const vnode = m('div', {oninit: create});
        const updated = m('div', {oninit: update, id: 'a'});

        render(root, vnode);
        render(root, updated);

        expect(create.mock.calls.length).toBe(1);
        expect(create.mock.calls[0][0]).toBe(vnode);
        expect(update.mock.calls.length).toBe(0);
    });

    test('does not call oninit when updating children', () => {
        const create = mock(() => {});
        const update = mock(() => {});
        const vnode = m('div', {oninit: create}, m('a'));
        const updated = m('div', {oninit: update}, m('b'));

        render(root, vnode);
        render(root, updated);

        expect(create.mock.calls.length).toBe(1);
        expect(create.mock.calls[0][0]).toBe(vnode);
        expect(update.mock.calls.length).toBe(0);
    });

    test('does not call oninit when updating keyed', () => {
        const create = mock(() => {});
        const update = mock(() => {});
        const vnode = m('div', {key: 1, oninit: create});
        const otherVnode = m('a', {key: 2});
        const updated = m('div', {key: 1, oninit: update});
        const otherUpdated = m('a', {key: 2});

        render(root, [vnode, otherVnode]);
        render(root, [otherUpdated, updated]);

        expect(create.mock.calls.length).toBe(1);
        expect(create.mock.calls[0][0]).toBe(vnode);
        expect(update.mock.calls.length).toBe(0);
    });

    test('does not call oninit when removing', () => {
        const create = mock(() => {});
        const vnode = m('div', {oninit: create});

        render(root, vnode);
        render(root, []);

        expect(create.mock.calls.length).toBe(1);
        expect(create.mock.calls[0][0]).toBe(vnode);
    });

    test('calls oninit when recycling', () => {
        const create = mock(() => {});
        const update = mock(() => {});
        const vnode = m('div', {key: 1, oninit: create});
        const updated = m('div', {key: 1, oninit: update});

        render(root, vnode);
        render(root, []);
        render(root, updated);

        expect(create.mock.calls.length).toBe(1);
        expect(create.mock.calls[0][0]).toBe(vnode);
        expect(update.mock.calls.length).toBe(1);
        expect(update.mock.calls[0][0]).toBe(updated);
    });

    test('calls oninit at the same step as onupdate', () => {
        const create = mock(() => {});
        const update = mock(() => {});
        const callback = mock(() => {});
        const vnode = m('div', {onupdate: create});
        const updated = m('div', {onupdate: update}, m('a', {oninit: callback}));

        render(root, vnode);
        render(root, updated);

        expect(create.mock.calls.length).toBe(0);
        expect(update.mock.calls.length).toBe(1);
        expect(update.mock.calls[0][0]).toBe(updated);
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toBe(updated.children[0]);
    });

    test('calls oninit before full DOM creation', () => {
        let called = false;

        function create(vnode) {
            called = true;

            expect(vnode.dom).toBe(undefined);
            expect(root.childNodes.length).toBe(1);
        }

        const vnode = m('div',
            m('a', {oninit: create},
                m('b'),
            ),
        );

        render(root, vnode);
        expect(called).toBe(true);
    });

    test('does not set oninit as an event handler', () => {
        const create = mock(() => {});
        const vnode = m('div', {oninit: create});

        render(root, vnode);

        expect(vnode.dom.oninit).toBe(undefined);
        expect(vnode.dom.attributes['oninit']).toBe(undefined);
    });

    test('No spurious oninit calls in mapped keyed diff when the pool is involved (#1992)', () => {
        const oninit1 = mock(() => {});
        const oninit2 = mock(() => {});
        const oninit3 = mock(() => {});

        render(root, [
            m('p', {key: 1, oninit: oninit1}),
            m('p', {key: 2, oninit: oninit2}),
            m('p', {key: 3, oninit: oninit3}),
        ]);
        render(root, [
            m('p', {key: 1, oninit: oninit1}),
            m('p', {key: 3, oninit: oninit3}),
        ]);
        render(root, [
            m('p', {key: 3, oninit: oninit3}),
        ]);

        expect(oninit1.mock.calls.length).toBe(1);
        expect(oninit2.mock.calls.length).toBe(1);
        expect(oninit3.mock.calls.length).toBe(1);
    });
});
