import Vnode from '../render/vnode'

import hyperscriptVnode from './hyperscriptVnode'

export default function() {
    var vnode = hyperscriptVnode.apply(0, arguments)

    vnode.tag = '['
    vnode.children = Vnode.normalizeChildren(vnode.children)
    return vnode
}
