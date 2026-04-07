// @ts-nocheck
/**
 * End-to-end check: SSR emits HTML via `route.resolve` + `renderToString`, then the **client**
 * router mounts into a root with that markup (hydration). If the client wraps the route in an extra
 * fragment that does not exist in the string, hydration can leave an empty root — see RouterRoot.
 */
import {describe, test, expect, afterEach} from 'bun:test'

import browserMock from '../test-utils/browserMock'
import routerFactory from '../api/router'
import mountRedrawFactory from '../api/mount-redraw'
import renderFactory from '../render/render'
import hyperscript from '../render/hyperscript'
import mServer from '../server'

function flush() {
    return new Promise<void>((r) => setTimeout(r, 0))
}

/** `domMock` elements have `childNodes` but no `children`; Mithril hydration checks `children.length`. */
function add_element_children_shim(el: any) {
    if (el == null || typeof el !== 'object') {
        return
    }
    Object.defineProperty(el, 'children', {
        configurable: true,
        get() {
            return el.childNodes.filter((n: any) => n.nodeType === 1)
        },
    })
}

function shim_element_tree_for_hydration(el: any) {
    if (el == null || el.nodeType !== 1) {
        return
    }
    add_element_children_shim(el)
    for (let i = 0; i < el.childNodes.length; i++) {
        shim_element_tree_for_hydration(el.childNodes[i])
    }
}

function find_element_by_id(el: any, id: string): any {
    if (el == null || el.nodeType !== 1) {
        return null
    }
    if (el.getAttribute && el.getAttribute('id') === id) {
        return el
    }
    for (let i = 0; i < el.childNodes.length; i++) {
        const f = find_element_by_id(el.childNodes[i], id)
        if (f) {
            return f
        }
    }
    return null
}

describe('router: hydrate into SSR HTML from route.resolve', () => {
    let savedWindow: typeof globalThis.window
    let savedSSR: boolean | undefined

    afterEach(() => {
        globalThis.window = savedWindow
        globalThis.__SSR_MODE__ = savedSSR
    })

    test('layout + page RouteResolver: root still has layout and inner text after client mount', async () => {
        savedWindow = globalThis.window
        savedSSR = globalThis.__SSR_MODE__
        globalThis.__SSR_MODE__ = false

        const layout = {
            view: (vnode) => hyperscript('div', {id: 'layout'}, vnode.children),
        }
        const page = {
            view: () => hyperscript('span', {id: 'inner'}, 'page-inner'),
        }
        const resolver = {
            onmatch: () => page,
            render: (vnode) => hyperscript(layout, {}, vnode),
        }
        const routes = {'/': resolver}

        const result = await mServer.route.resolve('/', routes, mServer.renderToString)
        const html = typeof result === 'string' ? result : result.html
        expect(html).toContain('page-inner')
        expect(html).toContain('layout')

        const $window = browserMock()
        globalThis.window = $window
        const root = $window.document.createElement('div')
        root.innerHTML = html
        shim_element_tree_for_hydration(root)

        expect(root.childNodes.length).toBeGreaterThan(0)

        const mountRedraw = mountRedrawFactory(renderFactory($window), setTimeout, console)
        const route = routerFactory($window, mountRedraw)
        route.prefix = ''
        $window.location.href = 'http://localhost/'

        route(root, '/', routes)
        await flush()
        await flush()

        const layout_el = find_element_by_id(root, 'layout')
        const inner_el = find_element_by_id(root, 'inner')
        expect(layout_el).not.toBeNull()
        expect(inner_el).not.toBeNull()
        expect(String(inner_el.firstChild?.nodeValue ?? '')).toContain('page-inner')
    })
})
