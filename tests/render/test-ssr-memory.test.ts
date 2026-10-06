import {describe, test, expect} from 'bun:test'

import mServer from '../../server'
import {signal, getSignalComponents} from '../../signal'

import type {ComponentVnode} from '../../index'

describe('SSR memory', () => {
    test('a server render does not register its components with the signals they read', async () => {
        const title = signal('hello')
        const Page = {view: () => mServer('h1', title.value)}

        for (let i = 0; i < 3; i++) {
            await mServer.renderToString(mServer(Page))
        }

        expect(getSignalComponents(title)?.size ?? 0).toBe(0)
    })

    test('a long-lived signal does not keep a rendered component state alive', async () => {
        const title = signal('hello')
        let stateRef: WeakRef<object> | undefined

        await (async () => {
            const Page = {
                oninit(vnode: ComponentVnode) {
                    stateRef = new WeakRef(vnode.state as object)
                },
                view: () => mServer('h1', title.value),
            }
            await mServer.renderToString(mServer(Page))
        })()
        // Let the finished render's async frames go before collecting.
        await new Promise((resolve) => setTimeout(resolve, 0))
        for (let i = 0; i < 5; i++) Bun.gc(true)

        expect(stateRef?.deref()).toBeUndefined()
    })
})
