// @ts-nocheck
/**
 * Vnode normalization and the keyed-diff reorder path.
 *
 * These two hot paths preallocate with `new Array(n)` and then fill every slot:
 *
 *   render/vnode.ts   normalizeChildren  →  new Array(input.length)
 *   render/render.ts  updateNodes        →  new Array(end - start + 1).fill(-1)
 *
 * That choice is deliberate and benchmarked (see bench/scenarios/vnode-alloc.ts): on V8,
 * `Array.from({length: n})` is roughly 15x slower, because it is not holey and walks the
 * array-like/iterator path. It has already been silently reverted once by an `oxlint --fix` run
 * (commit 178ba3c6), which nothing caught — types passed, tests passed, only speed changed.
 *
 * So this file does two jobs:
 *   1. Pin the OBSERVABLE behaviour that makes `new Array(n)` safe — above all that every slot really
 *      is filled. A preallocated array whose loop misses an index leaves a hole, and a hole is not
 *      `null`: it changes `in`, `includes`, iteration and the keyed/unkeyed consistency check.
 *   2. Guard the allocation itself at the source level, so the next autofix fails loudly here instead
 *      of quietly costing ~50ms per 60 redraws in the portal.
 *
 * The perf number itself is deliberately NOT asserted — a timing threshold in the test suite would be
 * flaky on shared CI. It lives in the benchmark; this file only protects the shape of the code.
 */
import {describe, test, expect, beforeEach} from 'bun:test'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'

import domMock from '../../test-utils/domMock'
import renderFactory from '../../render/render'
import m from '../../render/hyperscript'
import Vnode from '../../render/vnode'

const REPO_ROOT = join(import.meta.dir, '..', '..')

describe('normalizeChildren', () => {
    test('returns one entry per input, with no holes', () => {
        // The property that makes a preallocated `new Array(n)` correct: every index is assigned, so
        // the result is dense. `Array.from({length: n})` would also be dense, which is exactly why a
        // linter swap looks harmless and is not.
        const input = ['a', 1, null, undefined, false, m('div')]
        const children = Vnode.normalizeChildren(input)

        expect(children.length).toBe(input.length)
        for (let i = 0; i < input.length; i++) {
            expect(i in children).toBe(true)
        }
        expect(Object.keys(children).length).toBe(input.length)
    })

    test('normalizes empty input to an empty array', () => {
        const children = Vnode.normalizeChildren([])
        expect(children.length).toBe(0)
        expect(Object.keys(children).length).toBe(0)
    })

    test('maps nullish and boolean holes to null, not to array holes', () => {
        const children = Vnode.normalizeChildren([null, undefined, false, true])
        expect(children).toEqual([null, null, null, null])
        // A genuine hole would make this false while `toEqual` above still passed.
        expect(children.every((_, i) => i in children)).toBe(true)
    })

    test('wraps primitives as text vnodes', () => {
        const children = Vnode.normalizeChildren(['a', 1, 0, ''])
        expect(children.map((c) => c.tag)).toEqual(['#', '#', '#', '#'])
        expect(children.map((c) => c.children)).toEqual(['a', '1', '0', ''])
    })

    test('wraps nested arrays as fragment vnodes and normalizes them recursively', () => {
        const children = Vnode.normalizeChildren([['a', null]])
        expect(children.length).toBe(1)
        expect(children[0].tag).toBe('[')
        expect(children[0].children.length).toBe(2)
        expect(children[0].children[0].tag).toBe('#')
        expect(children[0].children[1]).toBe(null)
    })

    test('passes object vnodes through untouched', () => {
        const vnode = m('div')
        expect(Vnode.normalizeChildren([vnode])[0]).toBe(vnode)
    })

    test('accepts an all-keyed list', () => {
        const children = Vnode.normalizeChildren([m('div', {key: 'a'}), m('div', {key: 'b'})])
        expect(children.map((c) => c.key)).toEqual(['a', 'b'])
    })

    test('rejects a mix of keyed and unkeyed children', () => {
        expect(() => Vnode.normalizeChildren([m('div', {key: 'a'}), m('div')])).toThrow(TypeError)
    })

    test('rejects keyed children mixed with holes', () => {
        // Counting keyed entries while normalizing is what detects this; a miscounted or partially
        // filled array would let it slip through.
        expect(() => Vnode.normalizeChildren([m('div', {key: 'a'}), null])).toThrow(TypeError)
    })
})

describe('keyed reordering (updateNodes oldIndices path)', () => {
    let $window: any, root: any, render: any
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFactory($window)
    })

    const keyed = (keys: string[]) => keys.map((k) => m('div', {key: k}, k))
    const texts = () => Array.from(root.childNodes, (n: any) => n.childNodes[0].nodeValue)

    test('reverses a keyed list while preserving DOM identity', () => {
        render(root, keyed(['a', 'b', 'c']))
        const before = Array.from(root.childNodes)

        render(root, keyed(['c', 'b', 'a']))

        expect(texts()).toEqual(['c', 'b', 'a'])
        // The whole point of the keyed path: nodes move, they are not rebuilt. `oldIndices` is what
        // tracks that, and it relies on being pre-filled with -1 rather than left undefined.
        expect(root.childNodes[0]).toBe(before[2])
        expect(root.childNodes[1]).toBe(before[1])
        expect(root.childNodes[2]).toBe(before[0])
    })

    test('shuffles a longer keyed list while preserving DOM identity', () => {
        const keys = ['a', 'b', 'c', 'd', 'e', 'f']
        render(root, keyed(keys))
        const by_key = new Map(keys.map((k, i) => [k, root.childNodes[i]]))

        const shuffled = ['d', 'a', 'f', 'c', 'e', 'b']
        render(root, keyed(shuffled))

        expect(texts()).toEqual(shuffled)
        shuffled.forEach((k, i) => expect(root.childNodes[i]).toBe(by_key.get(k)))
    })

    test('handles insertions among reordered keys', () => {
        render(root, keyed(['a', 'b', 'c']))
        const a = root.childNodes[0]

        render(root, keyed(['c', 'x', 'a', 'y', 'b']))

        expect(texts()).toEqual(['c', 'x', 'a', 'y', 'b'])
        expect(root.childNodes[2]).toBe(a)
    })

    test('handles removals among reordered keys', () => {
        render(root, keyed(['a', 'b', 'c', 'd', 'e']))
        const c = root.childNodes[2]

        render(root, keyed(['e', 'c']))

        expect(texts()).toEqual(['e', 'c'])
        expect(root.childNodes[1]).toBe(c)
    })

    test('replaces a keyed list with a disjoint one', () => {
        render(root, keyed(['a', 'b', 'c']))
        render(root, keyed(['x', 'y', 'z']))
        expect(texts()).toEqual(['x', 'y', 'z'])
    })

    test('empties and refills a keyed list', () => {
        render(root, keyed(['a', 'b']))
        render(root, [])
        expect(root.childNodes.length).toBe(0)
        render(root, keyed(['a', 'b']))
        expect(texts()).toEqual(['a', 'b'])
    })
})

/**
 * Strip comments so the guard below inspects code rather than prose — the comments at those very sites
 * name `Array.from({length: n})` in order to warn against it, and would otherwise trip the check.
 *
 * Approximate on purpose (a `//` inside a string literal would be mangled); it is only ever used for the
 * two narrow assertions below, never to produce runnable source.
 */
function strip_comments(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

describe('hot-path allocation guard', () => {
    // Source-level, on purpose. The failure mode being defended against is a linter rewriting the
    // allocation — which changes no behaviour and so cannot be caught by a behavioural test.
    const sources = [
        {expect_fill: false, file: 'render/vnode.ts', fn: 'normalizeChildren'},
        {expect_fill: true, file: 'render/render.ts', fn: 'updateNodes'},
    ]

    for (const {expect_fill, file, fn} of sources) {
        test(`${file} (${fn}) preallocates with new Array, not Array.from`, () => {
            const code = strip_comments(readFileSync(join(REPO_ROOT, file), 'utf8'))

            expect(code).toContain(expect_fill ? 'new Array(end - start + 1).fill(-1)' : 'new Array(input.length)')
            // `Array.from({length: n})` is ~15x slower on V8 here. If a lint autofix reintroduces it,
            // fail with a pointer to why rather than losing the optimization silently again.
            expect(code).not.toMatch(/Array\.from\(\{\s*length:/)
        })
    }
})
