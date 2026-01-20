import delayedRemoval from './delayedRemoval'

import type {Vnode} from '../index'

function* domFor(vnode: Vnode): Generator<Node, void, unknown> {
	// To avoid unintended mangling of the internal bundler,
	// parameter destructuring is not used here.
	let dom = vnode.dom
	let domSize = vnode.domSize
	const generation = delayedRemoval.get(dom!)
	if (dom != null) do {
		const nextSibling = dom.nextSibling

		if (delayedRemoval.get(dom) === generation) {
			yield dom
			domSize!--
		}

		dom = nextSibling as Node | null
	}
	while (domSize)
}

export default domFor
