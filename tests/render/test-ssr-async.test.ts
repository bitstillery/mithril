import {describe, test, expect} from 'bun:test'

import mServer from '../../server'

import type {ComponentVnode} from '../../index'

const m = mServer

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('renderToString with async oninit', () => {
    test('runs oninit and views depth-first, an async oninit delaying only its own view', async () => {
        const calls: string[] = []
        const Sync = {
            oninit: (vnode: ComponentVnode<{name: string}>) => void calls.push(`init ${vnode.attrs.name}`),
            view: (vnode: ComponentVnode<{name: string}>) => (calls.push(`view ${vnode.attrs.name}`), m('i', vnode.attrs.name)),
        }
        const Async = {
            oninit: async (vnode: ComponentVnode<{name: string}>) => {
                calls.push(`init ${vnode.attrs.name}`)
                await delay(1)
            },
            view: (vnode: ComponentVnode<{name: string}>) => (calls.push(`view ${vnode.attrs.name}`), m('b', vnode.attrs.name)),
        }

        const result = await m.renderToString(
            m('div', m(Sync, {name: 'a'}), m(Async, {name: 'b'}), m('p', m(Sync, {name: 'c'})), m(Async, {name: 'd'})),
        )

        expect(result.html).toBe('<div><i>a</i><b>b</b><p><i>c</i></p><b>d</b></div>')
        expect(calls).toEqual(['init a', 'view a', 'init b', 'init c', 'view c', 'init d', 'view b', 'view d'])
    })

    test('runs sibling async oninit hooks concurrently', async () => {
        let running = 0
        let overlap = 0
        const Slow = {
            oninit: async () => {
                running++
                overlap = Math.max(overlap, running)
                await delay(5)
                running--
            },
            view: () => m('span', 'x'),
        }

        const result = await m.renderToString(m('div', m(Slow), m(Slow), m(Slow)))

        expect(result.html).toBe('<div><span>x</span><span>x</span><span>x</span></div>')
        expect(overlap).toBe(3)
    })

    test('a view that throws rejects the render, after its siblings rendered', async () => {
        const rendered: string[] = []
        const Ok = {view: (vnode: ComponentVnode<{name: string}>) => (rendered.push(vnode.attrs.name), m('i'))}
        const Broken = {
            view: () => {
                throw new Error('broken view')
            },
        }

        // bun-types declares rejects.toThrow() void, but it returns the promise the test must await.
        // oxlint-disable-next-line typescript/await-thenable
        await expect(m.renderToString(m('div', m(Ok, {name: 'a'}), m(Broken), m(Ok, {name: 'b'})))).rejects.toThrow('broken view')
        expect(rendered).toEqual(['a', 'b'])
    })

    test('a rejecting oninit still renders the view', async () => {
        const Failing = {
            oninit: () => Promise.reject(new Error('load failed')),
            view: () => m('p', 'fallback'),
        }

        const result = await m.renderToString(m(Failing))

        expect(result.html).toBe('<p>fallback</p>')
    })

    test('keeps the output order when async and sync siblings mix at several levels', async () => {
        const Later = {
            oninit: () => delay(2),
            view: (vnode: ComponentVnode<{text: string}>) => m('em', vnode.attrs.text),
        }

        const result = await m.renderToString([
            m('h1', 'title'),
            m('ul', [m('li', m(Later, {text: '1'})), m('li', '2'), m('li', m(Later, {text: '3'}))]),
            m.fragment(null, m(Later, {text: 'f'}), 'tail'),
        ])

        expect(result.html).toBe('<h1>title</h1><ul><li><em>1</em></li><li>2</li><li><em>3</em></li></ul><em>f</em>tail')
    })
})
