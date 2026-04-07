// @ts-nocheck
/**
 * Client-side router behavior: inner route vnode key, keyed resolver fragment (m-route-*) only
 * after `remount: true`, remount nonce, and history.state merging. Uses browserMock + pathname routing
 * (prefix ""). Initial mount omits the fragment wrapper so DOM matches SSR `renderToString`.
 */
import {describe, test, expect, beforeEach, afterEach} from 'bun:test'

import browserMock from '../test-utils/browserMock'
import routerFactory from '../api/router'
import mountRedrawFactory from '../api/mount-redraw'
import renderFactory from '../render/render'
import hyperscript from '../render/hyperscript'

function flush() {
    return new Promise((r) => setTimeout(r, 0))
}

function lastMRouteKey(keys: string[]) {
    const m = keys.filter((k) => k.startsWith('m-route-'))
    return m[m.length - 1]
}

describe('router (client)', () => {
    let savedWindow: typeof globalThis.window
    let origFragment: typeof hyperscript.fragment
    let mRouteFragmentKeys: string[]

    beforeEach(() => {
        savedWindow = globalThis.window
        mRouteFragmentKeys = []
        origFragment = hyperscript.fragment
        hyperscript.fragment = function (attrs: Record<string, any> | null, ...rest: any[]) {
            if (attrs && typeof attrs.key === 'string' && attrs.key.startsWith('m-route-')) {
                mRouteFragmentKeys.push(attrs.key)
            }
            return origFragment.call(hyperscript, attrs, ...rest)
        }
    })

    afterEach(() => {
        hyperscript.fragment = origFragment
        globalThis.window = savedWindow
    })

    function setup() {
        const $window = browserMock()
        globalThis.window = $window
        const root = $window.document.createElement('div')
        const mountRedraw = mountRedrawFactory(renderFactory($window), setTimeout, console)
        const route = routerFactory($window, mountRedraw)
        route.prefix = ''
        return {$window, root, route}
    }

    test('RouteResolver render receives inner vnode with undefined key; initial output has no m-route-* fragment (SSR hydration parity)', () => {
        const innerKeys: Array<string | null | undefined> = []
        const resolver = {
            render(vnode: any) {
                innerKeys.push(vnode.key)
                return hyperscript('div', {id: 'page'}, 'ok')
            },
        }
        const {$window, root, route} = setup()
        $window.location.href = 'http://localhost/a'

        route(root, '/a', {
            '/a': resolver,
            '/b': resolver,
        })

        expect(innerKeys[innerKeys.length - 1]).toBeUndefined()
        expect(lastMRouteKey(mRouteFragmentKeys)).toBeUndefined()
    })

    test('ordinary navigations omit m-route fragment; remount: true wraps with m-route-1', async () => {
        const resolver = {
            render() {
                return hyperscript('div', 'x')
            },
        }
        const {$window, root, route} = setup()
        $window.location.href = 'http://localhost/a'

        route(root, '/a', {
            '/a': resolver,
            '/b': resolver,
        })

        expect(lastMRouteKey(mRouteFragmentKeys)).toBeUndefined()

        await route.set('/b', null)
        await flush()
        expect(lastMRouteKey(mRouteFragmentKeys)).toBeUndefined()

        await route.set('/a', {q: 1}, null)
        await flush()
        expect(lastMRouteKey(mRouteFragmentKeys)).toBeUndefined()

        await route.set('/a', {q: 2}, {remount: true})
        await flush()
        expect(lastMRouteKey(mRouteFragmentKeys)).toBe('m-route-1')
    })

    test('history.state merges into params only for plain objects', async () => {
        const resolver = {
            render() {
                return hyperscript('div', 'x')
            },
        }
        const {$window, root, route} = setup()
        $window.location.href = 'http://localhost/a'

        route(root, '/a', {
            '/a': resolver,
        })

        await route.set('/a', null, {state: {fromHistory: 1}})
        await flush()
        expect(route.param('fromHistory')).toBe(1)

        await route.set('/a', null, {state: 'not-merged'})
        await flush()
        expect(route.param('fromHistory')).toBeUndefined()

        await route.set('/a', null, {state: [1, 2]})
        await flush()
        expect(route.param('0')).toBeUndefined()
    })
})
