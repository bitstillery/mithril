'use strict'

export const delayedRemoval = new WeakMap()

export function *domFor(vnode) {
    // To avoid unintended mangling of the internal bundler,
    // parameter destructuring is not used here.
    var dom = vnode.dom
    var domSize = vnode.domSize
    var generation = delayedRemoval.get(dom)
    if (dom != null) do {
        var nextSibling = dom.nextSibling

        if (delayedRemoval.get(dom) === generation) {
            yield dom
            domSize--
        }

        dom = nextSibling
    }
    while (domSize)
}
