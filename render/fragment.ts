import Vnode from "./vnode.js"
import hyperscriptVnode from "./hyperscriptVnode.js"

export default function fragment(attrs: any, ...children: any[]): any {
	const vnode = hyperscriptVnode(attrs, children)

	if (vnode.attrs == null) vnode.attrs = {}
	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}
