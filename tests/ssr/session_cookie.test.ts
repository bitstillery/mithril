import {describe, test, expect} from 'bun:test'

import m from '../../src/server'
import {createSSRResponse} from '../../src/ssr/response'

import type {SSRAccessContext} from '../../src/ssr/context'

function respond(req: Request, sessionId?: string): Promise<Response> {
    return createSSRResponse('/', req, {
        routes: {'/': {view: () => m('p', 'page')}},
        createRequestContext: (): SSRAccessContext => ({stateRegistry: new Map(), sessionId}),
        initRequestContext: () => {},
        getHtmlTemplate: () => Promise.resolve('<html><head></head><body><div id="app"></div></body></html>'),
    })
}

describe('createSSRResponse session cookie', () => {
    test('no session id sets no cookie, so an existing session cookie survives', async () => {
        const response = await respond(new Request('https://example.test/'))

        expect(response.status).toBe(200)
        expect(response.headers.get('Set-Cookie')).toBeNull()
    })

    test('a session id is set HttpOnly without Secure on plain http', async () => {
        const response = await respond(new Request('http://localhost/'), 'abc')

        const cookie = response.headers.get('Set-Cookie')
        expect(cookie).toBe('sessionId=abc; Path=/; HttpOnly; SameSite=Lax')
    })

    test('a session id is set Secure on https', async () => {
        const response = await respond(new Request('https://example.test/'), 'abc')

        expect(response.headers.get('Set-Cookie')).toBe('sessionId=abc; Path=/; HttpOnly; SameSite=Lax; Secure')
    })

    test('a session id is set Secure behind a proxy that terminated https', async () => {
        const req = new Request('http://127.0.0.1:3000/', {headers: {'X-Forwarded-Proto': 'https'}})
        const response = await respond(req, 'abc')

        expect(response.headers.get('Set-Cookie')).toBe('sessionId=abc; Path=/; HttpOnly; SameSite=Lax; Secure')
    })
})
