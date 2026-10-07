import {describe, test, expect} from 'bun:test'

import m from '../../server'
import {createSSRResponse} from '../../server/ssr'

describe('createSSRResponse', () => {
    test('a state string holding a closing script tag stays inside the state script', async () => {
        const text = '</script><script>alert(1)</script><!--'
        const response = await createSSRResponse('/', new Request('http://localhost/'), {
            routes: {'/': {view: () => m('p', 'page')}},
            createRequestContext: () => ({stateRegistry: new Map(), ssrStateMeta: {text}}),
            initRequestContext: () => {},
            getHtmlTemplate: () => Promise.resolve('<html><head></head><body><div id="app"></div></body></html>'),
        })
        const html = await response.text()

        const scripts = html.match(/<script id="__SSR_STATE__" type="application\/json">([^]*?)<\/script>/)
        expect(html.match(/<script/g)).toHaveLength(1)
        expect(JSON.parse(scripts![1]!)).toEqual({__meta: {text}})
    })
})
