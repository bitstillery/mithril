const Vnode = function(tag, key, attrs, children, text, dom) {
    return {
        tag: tag,
        key: key,
        attrs: attrs,
        children: children,
        text: text,
        dom: dom,
        is: undefined,
        domSize: undefined,
        state: undefined,
        events: undefined,
        instance: undefined,
    }
}
Vnode.normalize = function(node) {
    if (Array.isArray(node)) return Vnode('[', undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
    // eslint-disable-next-line eqeqeq
    if (node == null || typeof node === 'boolean') return null
    if (typeof node === 'object') return node
    return Vnode('#', undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
    const len = input.length

    if (len === 0) return []

    const children = new Array(len)
    let isKeyed = false

    // eslint-disable-next-line eqeqeq
    if (len > 0 && input[0] != null) {
        // eslint-disable-next-line eqeqeq
        isKeyed = input[0].key != null
    }

    for (let i = 0; i < len; i++) {
        const child = input[i]

        // eslint-disable-next-line eqeqeq
        if (i > 0 && isKeyed !== (child != null && child.key != null)) {
            throw new TypeError(
                isKeyed
                    ? 'In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole.'
                    : 'In fragments, vnodes must either all have keys or none have keys.',
            )
        }

        children[i] = Vnode.normalize(child)
    }

    return children
}

export default Vnode
