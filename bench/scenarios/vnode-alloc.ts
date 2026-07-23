/**
 * Preallocation strategy for the render hot paths.
 *
 * `render/vnode.ts` (normalizeChildren) and `render/render.ts` (updateNodes' `oldIndices`) both
 * preallocate an array and then fill every slot. The strategy matters far more than it looks:
 * `Array.from({length: n})` is not holey and walks the array-like/iterator path, which V8 handles much
 * worse than a plain `new Array(n)`.
 *
 * This benchmark exists because that optimization was silently undone once by an `oxlint --fix` run
 * (commit 178ba3c6) and nothing caught it — types passed, tests passed, only speed changed. Correctness
 * is pinned in tests/render/test-vnode-normalization.test.ts; the cost is documented here.
 *
 * Run: bun run bench vnode-alloc
 *
 * NOTE: run this on V8 (node) as well as Bun before drawing conclusions — JSC narrows the gap to ~2x
 * while V8 shows ~15x, so a Bun-only measurement makes the difference look not worth fixing.
 */
import {bench, summary} from 'mitata'

import Vnode from '../../render/vnode'

const LEN = 12
const CHILDREN = Array.from({length: LEN}, (_, i) => `cell-${i}`)
const INDICES = 24

summary(() => {
    bench('prealloc: new Array(n)', () => {
        // The whole point of the comparison, so the rule this benchmark exists to justify is suppressed
        // rather than obeyed.
        // oxlint-disable-next-line eslint-plugin-unicorn/no-new-array
        const out = new Array(LEN)
        for (let i = 0; i < LEN; i++) out[i] = CHILDREN[i]
        return out
    })

    bench('prealloc: Array.from({length: n})', () => {
        const out = Array.from({length: LEN})
        for (let i = 0; i < LEN; i++) out[i] = CHILDREN[i]
        return out
    })
})

summary(() => {
    // oxlint-disable-next-line eslint-plugin-unicorn/no-new-array
    bench('fill -1: new Array(n).fill(-1)', () => new Array(INDICES).fill(-1))
    bench('fill -1: Array.from({length: n}, () => -1)', () => Array.from({length: INDICES}, () => -1))
})

// The real thing, so the isolated numbers above can be sanity-checked against the function they justify.
summary(() => {
    bench('normalizeChildren (12 primitives)', () => Vnode.normalizeChildren(CHILDREN))

    bench('normalizeChildren (rows)', function* (s: {get: (k: string) => unknown}) {
        const rows = s.get('rows') as number
        yield () => {
            for (let r = 0; r < rows; r++) Vnode.normalizeChildren(CHILDREN)
        }
    }).range('rows', 1, 50)
})
