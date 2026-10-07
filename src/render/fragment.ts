import Vnode from './vnode'
import hyperscriptVnode from './hyperscript_vnode'

import type {RenderVnode} from './vnode'

export default function fragment(attrs: unknown, ...children: unknown[]): RenderVnode {
    const vnode = hyperscriptVnode(attrs, children)

    if (vnode.attrs == null) vnode.attrs = {}
    vnode.tag = '['
    vnode.children = Vnode.normalizeChildren(vnode.children as unknown[])
    return vnode
}
