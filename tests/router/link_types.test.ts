import {expect, test} from 'bun:test'

import m from '../../src/index'

import type {Children} from '../../src/index'

test('m(m.route.Link, attrs) is a child like any component vnode', () => {
    // A type-level check: the vnode's attrs must infer as LinkAttrs, not LinkAttrs | undefined.
    const link: Children = m(m.route.Link, {href: '/x'}, 'x')
    const links: Children[] = ['/a', '/b'].map((href) => m(m.route.Link, {href}, href))

    expect(link).toBeTruthy()
    expect(links.length).toBe(2)
})
