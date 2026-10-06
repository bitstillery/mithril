import delayedRemoval from './delayedRemoval'

import type {Vnode} from './vnode'

function* domFor(vnode: Vnode): Generator<Node, void, unknown> {
    // To avoid unintended mangling of the internal bundler,
    // parameter destructuring is not used here.
    let dom = vnode.dom
    let domSize = vnode.domSize
    const generation = delayedRemoval.get(dom!)
    do {
        const nextSibling = dom!.nextSibling

        if (delayedRemoval.get(dom!) === generation) {
            yield dom!
            domSize!--
        }

        dom = nextSibling
    } while (domSize)
}

export default domFor
