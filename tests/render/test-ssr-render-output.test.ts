import {describe, test, expect} from 'bun:test'

import m from '../../server'

import type {ComponentVnode} from '../../index'

// Pins the exact HTML the server renderer produces, so optimizations of it can't change a byte.
describe('renderToString output', () => {
    async function rejection(render: Promise<unknown>): Promise<string> {
        try {
            await render
        } catch (error) {
            return (error as Error).message
        }
        return 'resolved'
    }

    async function both(
        vnodes: Parameters<typeof m.renderToStringSync>[0],
        options?: Parameters<typeof m.renderToStringSync>[1],
    ) {
        const {html} = await m.renderToString(vnodes, options)
        expect(m.renderToStringSync(vnodes, options)).toBe(html)
        return html
    }

    test('escapes text and attribute values', async () => {
        const html = await both(
            m('div', {title: `a&b "c" 'd' <e> & &amp;`, 'data-x': 'plain'}, [
                `x < y & z > w "q" 'r' &amp;`,
                m('span', 42),
                0,
                '',
            ]),
        )
        expect(html).toBe(
            '<div title="a&amp;b &quot;c&quot; &#39;d&#39; &lt;e&gt; &amp; &amp;amp;" data-x="plain">' +
                'x &lt; y &amp; z &gt; w "q" \'r\' &amp;amp;<span>42</span>0</div>',
        )
    })

    test('escapes non-string attribute and text values after converting them', async () => {
        const html = await both(m('p', {'data-n': 3.5, 'data-z': 0, tabindex: -1}, [1e21, -0, NaN]))
        expect(html).toBe('<p data-n="3.5" data-z="0" tabindex="-1">1e+210NaN</p>')
    })

    test('serializes, renames and skips attributes', async () => {
        const fn = () => {}
        const html = await both(
            m('input', {
                key: 'k',
                className: 'a b',
                oninit: 'string-hook',
                oncreate: fn,
                onupdate: 'x',
                onremove: 'x',
                onbeforeremove: 'x',
                onbeforeupdate: 'x',
                onclick: fn,
                onchange: 'alert("hi")',
                one: 'kept',
                checked: true,
                disabled: false,
                nothing: null,
                missing: undefined,
                style: {backgroundColor: 'red', fontSize: '12px', WebkitTransform: 'none', 'margin-top': 1},
                'data-json': {a: [1, '<2>'], b: 'q"q'},
                list: ['x', 'y'],
                value: 'v',
            }),
        )
        expect(html).toBe(
            '<input class="a b" onchange="alert(&quot;hi&quot;)" one="kept" checked ' +
                'style="background-color: red; font-size: 12px; -webkit-transform: none; margin-top: 1" ' +
                'data-json="{&quot;a&quot;:[1,&quot;&lt;2&gt;&quot;],&quot;b&quot;:&quot;q\\&quot;q&quot;}" ' +
                'list="[&quot;x&quot;,&quot;y&quot;]" value="v">',
        )
    })

    test('merges selector classes and class attrs as hyperscript does', async () => {
        const html = await both(m('div.a#i[data-s=1]', {class: 'b', className: 'c'}))
        expect(html).toBe('<div id="i" data-s="1" class="a b"></div>')
    })

    test('escapes style values', async () => {
        const html = await both(m('div', {style: {content: '"<x>"', fontFamily: "'A' & B"}}))
        expect(html).toBe('<div style="content: &quot;&lt;x&gt;&quot;; font-family: &#39;A&#39; &amp; B"></div>')
    })

    test('renders void elements per mode', async () => {
        const tree = [m('br'), m('IMG', {src: 'a.png'}), m('input', 'ignored'), m('div'), m('Hr')]
        expect(await both(tree)).toBe('<br><IMG src="a.png"><input>ignored<div></div><Hr>')
        expect(await both(tree, {strict: true})).toBe('<br><IMG src="a.png"><input><div></div><Hr>')
        expect(await both(tree, {xml: true})).toBe('<br /><IMG src="a.png" /><input /><div></div><Hr />')
    })

    test('renders trusted HTML, fragments and holes', async () => {
        const html = await both([
            m.trust('<b>&raw</b>'),
            m.fragment({}, ['a', m('i', 'b'), null, false, true, undefined, m.fragment({}, ['c', m.fragment({}, ['d'])])]),
            null,
            'e',
            m.fragment({}, []),
        ])
        expect(html).toBe('<b>&raw</b>a<i>b</i>cde')
    })

    test('uses custom escape functions', async () => {
        const html = await both(m('a', {href: '/x?a=1&b=2'}, 'T&C'), {
            escapeAttribute: (v) => `[${String(v)}]`,
            escapeText: (v) => `{${String(v)}}`,
        })
        expect(html).toBe('<a href="[/x?a=1&b=2]">{T&C}</a>')
    })

    test('renders object, closure and class components with their attrs and children', async () => {
        const ObjectComponent = {
            view: (vnode: ComponentVnode<{label: string}>) => m('em', vnode.attrs.label, vnode.children),
        }
        function Closure(initial: ComponentVnode<{n: number}>) {
            const start = initial.attrs.n
            return {view: (vnode: ComponentVnode<{n: number}>) => m('b', `${start}/${vnode.attrs.n}`)}
        }
        class ClassComponent {
            name = 'cls'
            view() {
                return [m('u', this.name), m(ObjectComponent, {label: 'inner'}, 'kid')]
            }
        }
        const NullView = {view: () => null}
        const html = await both(
            m('section', [m(ObjectComponent, {label: 'x<'}), m(Closure, {n: 2}), m(ClassComponent), m(NullView), 'end']),
        )
        expect(html).toBe('<section><em>x&lt;</em><b>2/2</b><u>cls</u><em>innerkid</em>end</section>')
    })

    test('a component without a view renders nothing', async () => {
        const NoView = () => ({oninit() {}})
        expect(await both(m('p', m(NoView as never)))).toBe('<p></p>')
    })

    test('a view that returns its own vnode throws', async () => {
        const Self = {view: (vnode: ComponentVnode) => vnode}
        expect(await rejection(m.renderToString(m('div', m(Self))))).toBe(
            'A view cannot return the vnode it received as argument',
        )
        expect(() => m.renderToStringSync(m('div', m(Self)))).toThrow('A view cannot return the vnode it received as argument')
    })

    test('an error thrown by a view rejects the render', async () => {
        const Broken = {
            view: () => {
                throw new Error('broken view')
            },
        }
        expect(await rejection(m.renderToString(m('div', [m('p', 'a'), m(Broken)])))).toBe('broken view')
    })

    test('a sibling after a throwing view is still rendered', async () => {
        const calls: string[] = []
        const Broken = {
            view: () => {
                calls.push('broken')
                throw new Error('broken view')
            },
        }
        const After = {
            oninit: () => {
                calls.push('after.oninit')
            },
            view: () => {
                calls.push('after.view')
                return m('i')
            },
        }
        expect(await rejection(m.renderToString(m('div', [m(Broken), m(After)])))).toBe('broken view')
        expect(calls).toEqual(['broken', 'after.oninit', 'after.view'])
    })

    test('errors thrown by oninit are swallowed', async () => {
        const Throwing = {
            oninit: () => {
                throw new Error('oninit failed')
            },
            view: () => m('p', 'still here'),
        }
        const Rejecting = {
            oninit: () => Promise.reject(new Error('async oninit failed')),
            view: () => m('p', 'also here'),
        }
        const {html} = await m.renderToString([m(Throwing), m(Rejecting)])
        expect(html).toBe('<p>still here</p><p>also here</p>')
        expect(m.renderToStringSync(m(Throwing))).toBe('<p>still here</p>')
    })

    test('oninit gets the SSR context and its vnode', async () => {
        const seen: unknown[] = []
        const C = {
            // The SSR renderer passes a context argument the component type doesn't declare.
            oninit(...args: unknown[]) {
                seen.push((args[0] as ComponentVnode<{a: number}>).attrs.a, args[1])
            },
            view: () => 'x',
        }
        await m.renderToString(m(C, {a: 1}))
        m.renderToStringSync(m(C, {a: 2}))
        expect(seen).toEqual([1, {isSSR: true, isHydrating: false}, 2, {isSSR: true, isHydrating: false}])
    })

    test('awaits async oninit before the view, in the same order as before', async () => {
        const log: string[] = []
        const tick = () => Promise.resolve()
        function make(name: string, delay: 'sync' | 'micro' | 'timer', children: () => unknown[] = () => []) {
            return {
                oninit() {
                    log.push(`${name}.oninit`)
                    if (delay === 'micro') {
                        return tick().then(() => {
                            log.push(`${name}.resolved`)
                        })
                    }
                    if (delay === 'timer') {
                        return new Promise<void>((resolve) =>
                            setTimeout(() => {
                                log.push(`${name}.resolved`)
                                resolve()
                            }, 1),
                        )
                    }
                    return undefined
                },
                view() {
                    log.push(`${name}.view`)
                    return m('div', {id: name}, children() as never)
                },
            }
        }
        const D = make('D', 'sync')
        const C = make('C', 'micro', () => [m(D)])
        const B = make('B', 'timer', () => [m(C), 'b'])
        const E = make('E', 'micro')
        const A = make('A', 'sync', () => [m(B), m(E), m(make('F', 'sync'))])

        const {html} = await m.renderToString([m(A), m(make('G', 'micro'))])
        expect(html).toBe(
            '<div id="A"><div id="B"><div id="C"><div id="D"></div></div>b</div><div id="E"></div><div id="F"></div></div><div id="G"></div>',
        )
        expect(log).toEqual([
            'A.oninit',
            'A.view',
            'B.oninit',
            'E.oninit',
            'F.oninit',
            'F.view',
            'G.oninit',
            'E.resolved',
            'G.resolved',
            'E.view',
            'G.view',
            'B.resolved',
            'B.view',
            'C.oninit',
            'C.resolved',
            'C.view',
            'D.oninit',
            'D.view',
        ])
    })

    test('the sync renderer does not wait for async oninit', () => {
        let resolved = false
        const C = {
            oninit: () =>
                Promise.resolve().then(() => {
                    resolved = true
                }),
            view: () => m('p', resolved ? 'loaded' : 'loading'),
        }
        expect(m.renderToStringSync(m(C))).toBe('<p>loading</p>')
    })

    test('a page of nested components renders identically through both renderers', async () => {
        const Row = {
            view: (vnode: ComponentVnode<{key: number; i: number}>) =>
                m('tr', {key: vnode.attrs.i, class: vnode.attrs.i % 2 ? 'odd' : 'even'}, [
                    m('td', {style: {textAlign: 'right'}}, vnode.attrs.i),
                    m('td', `<${vnode.attrs.i}> & co`),
                    m('td', m('input[type=checkbox]', {checked: vnode.attrs.i % 3 === 0, onclick: () => {}})),
                ]),
        }
        const Table = {
            view: () =>
                m(
                    'table',
                    m(
                        'tbody',
                        [0, 1, 2, 3].map((i) => m(Row, {key: i, i})),
                    ),
                ),
        }
        expect(await both(m(Table))).toBe(
            '<table><tbody>' +
                '<tr class="even"><td style="text-align: right">0</td><td>&lt;0&gt; &amp; co</td><td><input type="checkbox" checked></td></tr>' +
                '<tr class="odd"><td style="text-align: right">1</td><td>&lt;1&gt; &amp; co</td><td><input type="checkbox"></td></tr>' +
                '<tr class="even"><td style="text-align: right">2</td><td>&lt;2&gt; &amp; co</td><td><input type="checkbox"></td></tr>' +
                '<tr class="odd"><td style="text-align: right">3</td><td>&lt;3&gt; &amp; co</td><td><input type="checkbox" checked></td></tr>' +
                '</tbody></table>',
        )
    })
})
