import hasOwn from '../util/hasOwn'

import Vnode from './vnode'
import hyperscriptVnode from './hyperscriptVnode'
import emptyAttrs from './emptyAttrs'
import cachedAttrsIsStaticMap from './cachedAttrsIsStaticMap'
import trust from './trust'
import fragment from './fragment'

import type {ComponentType, Children, Vnode as VnodeType} from './vnode'

export interface Hyperscript {
	(selector: string, ...children: Children[]): VnodeType
	(selector: string, attrs: Record<string, any>, ...children: Children[]): VnodeType
	<Attrs, State>(component: ComponentType<Attrs, State>, ...children: Children[]): VnodeType<Attrs, State>
	<Attrs, State>(component: ComponentType<Attrs, State>, attrs: Attrs, ...children: Children[]): VnodeType<Attrs, State>
	trust(html: string): VnodeType
	fragment(attrs: Record<string, any> | null, ...children: Children[]): VnodeType
	Fragment: string
}

const selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
const selectorCache: Record<string, {tag: string; attrs: Record<string, any>; is?: string}> = Object.create(null)

function isEmpty(object: Record<string, any>): boolean {
	for (const key in object) if (hasOwn.call(object, key)) return false
	return true
}

function isFormAttributeKey(key: string): boolean {
	return key === 'value' || key === 'checked' || key === 'selectedIndex' || key === 'selected'
}

function compileSelector(selector: string): {tag: string; attrs: Record<string, any>; is?: string} {
	let match: RegExpExecArray | null
	let tag = 'div'
	const classes: string[] = []
	let attrs: Record<string, any> = {}
	let isStatic = true
	while ((match = selectorParser.exec(selector)) !== null) {
		const type = match[1]
		const value = match[2]
		if (type === '' && value !== '') tag = value
		else if (type === '#') attrs.id = value
		else if (type === '.') classes.push(value)
		else if (match[3][0] === '[') {
			let attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, '$1').replace(/\\\\/g, '\\')
			if (match[4] === 'class') classes.push(attrValue)
			else {
				attrs[match[4]] = attrValue === '' ? attrValue : attrValue || true
				if (isFormAttributeKey(match[4])) isStatic = false
			}
		}
	}
	if (classes.length > 0) attrs.className = classes.join(' ')
	if (isEmpty(attrs)) attrs = emptyAttrs
	else cachedAttrsIsStaticMap.set(attrs, isStatic)
	return selectorCache[selector] = {tag: tag, attrs: attrs, is: attrs.is}
}

function execSelector(state: {tag: string; attrs: Record<string, any>; is?: string}, vnode: any): any {
	vnode.tag = state.tag

	let attrs = vnode.attrs
	if (attrs == null) {
		vnode.attrs = state.attrs
		vnode.is = state.is
		return vnode
	}

	if (hasOwn.call(attrs, 'class')) {
		if (attrs.class != null) attrs.className = attrs.class
		attrs.class = null
	}

	if (state.attrs !== emptyAttrs) {
		const className = attrs.className
		attrs = Object.assign({}, state.attrs, attrs)

		if (state.attrs.className != null) attrs.className =
			className != null
				? String(state.attrs.className) + ' ' + String(className)
				: state.attrs.className
	}

	// workaround for #2622 (reorder keys in attrs to set "type" first)
	// The DOM does things to inputs based on the "type", so it needs set first.
	// See: https://github.com/MithrilJS/mithril.js/issues/2622
	if (state.tag === 'input' && hasOwn.call(attrs, 'type')) {
		attrs = Object.assign({type: attrs.type}, attrs)
	}

	// This reduces the complexity of the evaluation of "is" within the render function.
	vnode.is = attrs.is

	vnode.attrs = attrs

	return vnode
}

function hyperscript(selector: string | ComponentType, attrs?: Record<string, any> | null, ...children: Children[]): any {
	if (selector == null || typeof selector !== 'string' && typeof selector !== 'function' && typeof (selector as any).view !== 'function') {
		throw Error('The selector must be either a string or a component.')
	}

	const vnode = hyperscriptVnode(attrs, children)

	if (typeof selector === 'string') {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== '[') return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	if (vnode.attrs == null) vnode.attrs = {}
	vnode.tag = selector
	return vnode
}

hyperscript.trust = trust

hyperscript.fragment = fragment
hyperscript.Fragment = '['

export default hyperscript
