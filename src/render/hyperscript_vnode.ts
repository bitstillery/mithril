import Vnode from './vnode'

import type {RenderChildren, RenderVnode} from './vnode'

// Note: the processing of variadic parameters is perf-sensitive.
//
// In native ES6, it might be preferable to define hyperscript and fragment
// factories with a final ...args parameter and call hyperscriptVnode(...args),
// since modern engines can optimize spread calls.
//
// However, benchmarks showed this was not faster. As a result, spread is used
// only in the parameter lists of hyperscript and fragment, while an array is
// passed to hyperscriptVnode.
// `attrs` is the second argument to `m()`: an attrs object, or already the first child (a vnode, a
// primitive or an array). The children come back as passed; hyperscript normalizes an element's.
export default function hyperscriptVnode(attrs: unknown, children: unknown[]): RenderVnode {
    if (attrs == null || (typeof attrs === 'object' && (attrs as RenderVnode).tag == null && !Array.isArray(attrs))) {
        if (children.length === 1 && Array.isArray(children[0])) children = children[0]
    } else {
        children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
        attrs = undefined
    }

    return Vnode(
        '',
        (attrs && (attrs as Record<string, unknown>).key) as RenderVnode['key'],
        attrs as Record<string, unknown> | undefined,
        children as RenderChildren,
        null,
        null,
    )
}
