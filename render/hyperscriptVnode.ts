import Vnode from "./vnode.js"
import type { Children } from "../index.js"

// Note: the processing of variadic parameters is perf-sensitive.
//
// In native ES6, it might be preferable to define hyperscript and fragment
// factories with a final ...args parameter and call hyperscriptVnode(...args),
// since modern engines can optimize spread calls.
//
// However, benchmarks showed this was not faster. As a result, spread is used
// only in the parameter lists of hyperscript and fragment, while an array is
// passed to hyperscriptVnode.
export default function hyperscriptVnode(attrs: any, children: any[]): any {
	if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
		if (children.length === 1 && Array.isArray(children[0])) children = children[0]
	} else {
		children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
		attrs = undefined
	}

	return Vnode("", attrs && attrs.key, attrs, children)
}
