import Vnode from '../render/vnode'
import hasOwn from '../util/hasOwn'

import hyperscriptVnode from './hyperscriptVnode'

var SELECTOR_PARSER = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var SELECTOR_CACHE = Object.create(null)

function is_empty(object) {
    return Object.keys(object).length === 0
}

function compileSelector(selector) {
    var match, tag = 'div', classes = [], attrs = {}
    while (match = SELECTOR_PARSER.exec(selector)) {
        var type = match[1], value = match[2]
        if (type === '' && value !== '') tag = value
        else if (type === '#') attrs.id = value
        else if (type === '.') classes.push(value)
        else if (match[3][0] === '[') {
            var attrValue = match[6]
            if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, '$1').replace(/\\\\/g, '\\')
            if (match[4] === 'class') classes.push(attrValue)
            else attrs[match[4]] = attrValue === '' ? attrValue : attrValue || true
        }
    }
    if (classes.length > 0) attrs.className = classes.join(' ')
    if (is_empty(attrs)) attrs = null
    return SELECTOR_CACHE[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
    var attrs = vnode.attrs
    var hasClass = hasOwn.call(attrs, 'class')
    var className = hasClass ? attrs.class : attrs.className

    vnode.tag = state.tag

    if (state.attrs !== null) {
        attrs = Object.assign({}, state.attrs, attrs)

        if (className !== null || state.attrs.className !== null) {
            if (className !== null && state.attrs.className !== null) {
                attrs.className = state.attrs.className + ' ' + className
            } else if (className !== null) {
                attrs.className = className
            } else {
                attrs.className = state.attrs.className
            }
        }
    } else if (className !== null) {
        attrs.className = className
    }

    if (hasClass) attrs.class = null

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

function hyperscript(selector) {
    // Cache typeof checks to avoid repeated property access
    const selectorType = typeof selector
    const isString = selectorType === 'string'
    const isFunction = selectorType === 'function'
    const hasView = selector !== null && selectorType === 'object' && typeof selector.view === 'function'

    if (selector === null || !(isString || isFunction || hasView)) {
        throw Error('The selector must be either a string or a component.')
    }

    var vnode = hyperscriptVnode.apply(1, arguments)

    if (isString) {
        vnode.children = Vnode.normalizeChildren(vnode.children)
        // Cache lookup result to avoid double lookup when selector is not in cache
        const cached = SELECTOR_CACHE[selector] || compileSelector(selector)
        if (selector !== '[') return execSelector(cached, vnode)
    }

    vnode.tag = selector
    return vnode
}

module.exports = hyperscript
