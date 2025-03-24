import Vnode from '../render/vnode'
import {delayedRemoval, domFor} from '../render/domFor'

const keyMapCache = new WeakMap()

export default function() {
    const NAME_SPACE = {
        svg: 'http://www.w3.org/2000/svg',
        math: 'http://www.w3.org/1998/Math/MathML',
    }

    let currentRedraw
    let currentRender

    function getDocument(dom) {
        return dom.ownerDocument
    }

    function getNameSpace(vnode) {
        return vnode.attrs && vnode.attrs.xmlns || NAME_SPACE[vnode.tag]
    }

    // sanity check to discourage people from doing `vnode.state = ...`
    function checkState(vnode, original) {
        if (vnode.state !== original) throw new Error('\'vnode.state\' must not be modified.')
    }

    // Note: the hook is passed as the `this` argument to allow proxying the
    // arguments without requiring a full array allocation to do so. It also
    // takes advantage of the fact the current `vnode` is the first argument in
    // all lifecycle methods.
    function callHook(vnode) {
        var original = vnode.state
        try {
            return this.apply(original, arguments)
        } finally {
            checkState(vnode, original)
        }
    }

    // IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
    // inside an iframe. Catch and swallow this error, and heavy-handidly return null.
    function activeAlement(dom) {
        try {
            return getDocument(dom).activeElement
        } catch (e) {
            return null
        }
    }
    // create
    function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
        if (end - start === 1) {
            // Optimize single node case
            const vnode = vnodes[start]
            if (vnode !== null && vnode !== undefined) {
                createNode(parent, vnode, hooks, ns, nextSibling)
            }
            return
        }

        // For multiple nodes, consider using a document fragment
        // if there are more than a certain threshold of nodes
        if (end - start > 3) {
            const fragment = getDocument(parent).createDocumentFragment()
            for (let i = start; i < end; i++) {
                const vnode = vnodes[i]
                if (vnode !== null && vnode !== undefined) {
                    createNode(fragment, vnode, hooks, ns, null)
                }
            }
            insertDOM(parent, fragment, nextSibling)
            return
        }

        // Original implementation for small number of nodes
        for (let i = start; i < end; i++) {
            const vnode = vnodes[i]
            if (vnode !== null && vnode !== undefined) {
                createNode(parent, vnode, hooks, ns, nextSibling)
            }
        }
    }
    function createNode(parent, vnode, hooks, ns, nextSibling) {
        var tag = vnode.tag
        if (typeof tag === 'string') {
            vnode.state = {}
            if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
            switch (tag) {
            case '#': createText(parent, vnode, nextSibling); break
            case '<': createHTML(parent, vnode, ns, nextSibling); break
            case '[': createFragment(parent, vnode, hooks, ns, nextSibling); break
            default: createElement(parent, vnode, hooks, ns, nextSibling)
            }
        }
        else createComponent(parent, vnode, hooks, ns, nextSibling)
    }
    function createText(parent, vnode, nextSibling) {
        vnode.dom = getDocument(parent).createTextNode(vnode.children)
        insertDOM(parent, vnode.dom, nextSibling)
    }
    var possibleParents = {caption: 'table', thead: 'table', tbody: 'table', tfoot: 'table', tr: 'tbody', th: 'tr', td: 'tr', colgroup: 'table', col: 'colgroup'}
    function createHTML(parent, vnode, ns, nextSibling) {
        var match = vnode.children.match(/^\s*?<(\w+)/im) || []
        // not using the proper parent makes the child element(s) vanish.
        //     var div = document.createElement("div")
        //     div.innerHTML = "<td>i</td><td>j</td>"
        //     console.log(div.innerHTML)
        // --> "ij", no <td> in sight.
        var temp = getDocument(parent).createElement(possibleParents[match[1]] || 'div')
        if (ns === 'http://www.w3.org/2000/svg') {
            temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + vnode.children + '</svg>'
            temp = temp.firstChild
        } else {
            temp.innerHTML = vnode.children
        }
        vnode.dom = temp.firstChild
        vnode.domSize = temp.childNodes.length
        // Capture nodes to remove, so we don't confuse them.
        var fragment = getDocument(parent).createDocumentFragment()
        var child
        // eslint-disable-next-line no-cond-assign
        while (child = temp.firstChild) {
            fragment.appendChild(child)
        }
        insertDOM(parent, fragment, nextSibling)
    }
    function createFragment(parent, vnode, hooks, ns, nextSibling) {
        var fragment = getDocument(parent).createDocumentFragment()
        if (vnode.children != null) {
            var children = vnode.children
            createNodes(fragment, children, 0, children.length, hooks, null, ns)
        }
        vnode.dom = fragment.firstChild
        vnode.domSize = fragment.childNodes.length
        insertDOM(parent, fragment, nextSibling)
    }
    function createElement(parent, vnode, hooks, ns, nextSibling) {
        var tag = vnode.tag
        var attrs = vnode.attrs
        var is = vnode.is

        ns = getNameSpace(vnode) || ns

        var element = ns ?
            is ? getDocument(parent).createElementNS(ns, tag, {is: is}) : getDocument(parent).createElementNS(ns, tag) :
            is ? getDocument(parent).createElement(tag, {is: is}) : getDocument(parent).createElement(tag)
        vnode.dom = element

        if (attrs != null) {
            setAttrs(vnode, attrs, ns)
        }

        insertDOM(parent, element, nextSibling)

        if (!maybeSetContentEditable(vnode)) {
            if (vnode.children != null) {
                var children = vnode.children
                createNodes(element, children, 0, children.length, hooks, null, ns)
                if (vnode.tag === 'select' && attrs != null) setLateSelectAttrs(vnode, attrs)
            }
        }
    }
    function initComponent(vnode, hooks) {
        var sentinel
        if (typeof vnode.tag.view === 'function') {
            vnode.state = Object.create(vnode.tag)
            sentinel = vnode.state.view
            if (sentinel.$$reentrantLock$$ != null) return
            sentinel.$$reentrantLock$$ = true
        } else {
            vnode.state = void 0
            sentinel = vnode.tag
            if (sentinel.$$reentrantLock$$ != null) return
            sentinel.$$reentrantLock$$ = true
            vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === 'function') ? new vnode.tag(vnode) : vnode.tag(vnode)
        }
        initLifecycle(vnode.state, vnode, hooks)
        if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
        vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
        if (vnode.instance === vnode) throw Error('A view cannot return the vnode it received as argument')
        sentinel.$$reentrantLock$$ = null
    }
    function createComponent(parent, vnode, hooks, ns, nextSibling) {
        initComponent(vnode, hooks)
        if (vnode.instance != null) {
            createNode(parent, vnode.instance, hooks, ns, nextSibling)
            vnode.dom = vnode.instance.dom
            vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
        }
        else {
            vnode.domSize = 0
        }
    }

    // update
    /**
     * @param {Element|Fragment} parent - the parent element
     * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
     *                               this part of the tree
     * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
     * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
     * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
     *                                       fragment that is not the last item in its
     *                                       parent
     * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
     * @returns void
     */
    // This function diffs and patches lists of vnodes, both keyed and unkeyed.
    //
    // We will:
    //
    // 1. describe its general structure
    // 2. focus on the diff algorithm optimizations
    // 3. discuss DOM node operations.

    // ## Overview:
    //
    // The updateNodes() function:
    // - deals with trivial cases
    // - determines whether the lists are keyed or unkeyed based on the first non-null node
    //   of each list.
    // - diffs them and patches the DOM if needed (that's the brunt of the code)
    // - manages the leftovers: after diffing, are there:
    //   - old nodes left to remove?
    // 	 - new nodes to insert?
    // 	 deal with them!
    //
    // The lists are only iterated over once, with an exception for the nodes in `old` that
    // are visited in the fourth part of the diff and in the `removeNodes` loop.

    // ## Diffing
    //
    // Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
    // may be good for context on longest increasing subsequence-based logic for moving nodes.
    //
    // In order to diff keyed lists, one has to
    //
    // 1) match nodes in both lists, per key, and update them accordingly
    // 2) create the nodes present in the new list, but absent in the old one
    // 3) remove the nodes present in the old list, but absent in the new one
    // 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
    //
    // To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
    // over the new list and for each new vnode, find the corresponding vnode in the old list using
    // the map.
    // 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
    // and must be created.
    // For the removals, we actually remove the nodes that have been updated from the old list.
    // The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
    // The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
    // algorithm.
    //
    // the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
    // from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
    // corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
    //  match the above lists, for example).
    //
    // In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
    // can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
    //
    // @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
    // the longest increasing subsequence *of old nodes still present in the new list*).
    //
    // It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
    // and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
    // the `LIS` and a temporary one to create the LIS).
    //
    // So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
    // the LIS and can be updated without moving them.
    //
    // If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
    // the exception of the last node if the list is fully reversed).
    //
    // ## Finding the next sibling.
    //
    // `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
    // When the list is being traversed top-down, at any index, the DOM nodes up to the previous
    // vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
    // list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
    //
    // In the other scenarios (swaps, upwards traversal, map-based diff),
    // the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
    // bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
    // as the next sibling (cached in the `nextSibling` variable).

    // ## DOM node moves
    //
    // In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
    // this is not the case if the node moved (second and fourth part of the diff algo). We move
    // the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
    // variable rather than fetching it using `getNextSibling()`.

    function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
        if (old === vnodes || (old === null && vnodes === null)) return
        else if (old === null || old === undefined || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
        else if (vnodes === null || vnodes === undefined || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
        else {
            const isOldKeyed = old[0] !== null && old[0] !== undefined && old[0].key !== null
            const isKeyed = vnodes[0] !== null && vnodes[0] !== undefined && vnodes[0].key !== null
            let start = 0, oldStart = 0
            if (!isOldKeyed) while (oldStart < old.length && (old[oldStart] === null || old[oldStart] === undefined)) oldStart++
            if (!isKeyed) while (start < vnodes.length && (vnodes[start] === null || vnodes[start] === undefined)) start++
            if (isOldKeyed !== isKeyed) {
                removeNodes(parent, old, oldStart, old.length)
                createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
            } else if (!isKeyed) {
                // Don't index past the end of either list (causes deopts).
                var commonLength = old.length < vnodes.length ? old.length : vnodes.length
                // Rewind if necessary to the first non-null index on either side.
                // We could alternatively either explicitly create or remove nodes when `start !== oldStart`
                // but that would be optimizing for sparse lists which are more rare than dense ones.
                start = start < oldStart ? start : oldStart
                for (; start < commonLength; start++) {
                    o = old[start]
                    v = vnodes[start]
                    if (o === v || o === null && v === null) continue
                    else if (o === null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
                    else if (v === null) removeNode(parent, o)
                    else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
                }
                if (old.length > commonLength) removeNodes(parent, old, start, old.length)
                if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
            } else {
                // keyed diff
                var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

                // bottom-up
                while (oldEnd >= oldStart && end >= start) {
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    // Skip null nodes and handle edge cases
                    if (oe === null || oe === undefined || ve === null || ve === undefined) {
                        if (oe === null || oe === undefined) oldEnd--
                        if (ve === null || ve === undefined) end--
                        continue
                    }
                    if (oe.key !== ve.key) break
                    if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
                    if (ve.dom !== null && ve.dom !== undefined) nextSibling = ve.dom
                    oldEnd--, end--
                }
                // top-down
                while (oldEnd >= oldStart && end >= start) {
                    o = old[oldStart]
                    v = vnodes[start]
                    // Skip null nodes and handle edge cases
                    if (o === null || o === undefined || v === null || v === undefined) {
                        if (o === null || o === undefined) oldStart++
                        if (v === null || v === undefined) start++
                        continue
                    }
                    if (o.key !== v.key) break
                    oldStart++, start++
                    if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
                }
                // swaps and list reversals
                while (oldEnd >= oldStart && end >= start) {
                    if (start === end) break
                    if (o === null || o === undefined || ve === null || ve === undefined) break
                    if (o.key !== ve.key || oe === null || oe === undefined || oe.key !== v.key) break
                    topSibling = getNextSibling(old, oldStart, nextSibling)
                    moveDOM(parent, oe, topSibling)
                    if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
                    if (++start <= --end) moveDOM(parent, o, nextSibling)
                    if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
                    if (ve.dom !== null && ve.dom !== undefined) nextSibling = ve.dom
                    oldStart++; oldEnd--
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    o = old[oldStart]
                    v = vnodes[start]
                }
                // bottom up once again
                while (oldEnd >= oldStart && end >= start) {
                    if (oe === null || oe === undefined || ve === null || ve === undefined) break
                    if (oe.key !== ve.key) break
                    if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
                    if (ve.dom !== null && ve.dom !== undefined) nextSibling = ve.dom
                    oldEnd--, end--
                    oe = old[oldEnd]
                    ve = vnodes[end]
                }
                if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
                else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
                else {
                    // inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
                    var originalNextSibling = nextSibling
                    var vnodesLength = end - start + 1
                    var oldIndices = new Array(vnodesLength) 
                    var li = 0
                    var i = 0
                    var pos = 2147483647
                    var matched = 0
                    var lisIndices
                    
                    for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
                    for (i = end; i >= start; i--) {
                        if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
                        ve = vnodes[i]
                        var oldIndex = map[ve.key]
                        if (oldIndex != null) {
                            pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
                            oldIndices[i - start] = oldIndex
                            oe = old[oldIndex]
                            old[oldIndex] = null
                            if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
                            if (ve.dom !== null && ve.dom !== undefined) nextSibling = ve.dom
                            matched++
                        }
                    }
                    nextSibling = originalNextSibling
                    if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
                    if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
                    else {
                        if (pos === -1) {
                            // the indices of the indices of the items that are part of the
                            // longest increasing subsequence in the oldIndices list
                            lisIndices = makeLisIndices(oldIndices)
                            li = lisIndices.length - 1
                            for (i = end; i >= start; i--) {
                                v = vnodes[i]
                                if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling)
                                else {
                                    if (lisIndices[li] === i - start) li--
                                    else moveDOM(parent, v, nextSibling)
                                }
                                if (v.dom !== null && v.dom !== undefined) nextSibling = vnodes[i].dom
                            }
                        } else {
                            for (i = end; i >= start; i--) {
                                v = vnodes[i]
                                if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling)
                                if (v.dom !== null && v.dom !== undefined) nextSibling = vnodes[i].dom
                            }
                        }
                    }
                }
            }
        }
    }
    function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
        if (!old || !vnode) {
            if (old) removeNode(parent, old)
            if (vnode) createNode(parent, vnode, hooks, ns, nextSibling)
            return
        }

        var oldTag = old.tag, tag = vnode.tag
        if (oldTag === tag && old.is === vnode.is) {
            vnode.state = old.state
            vnode.events = old.events
            if (shouldNotUpdate(vnode, old)) return
            if (typeof oldTag === 'string') {
                if (vnode.attrs != null) {
                    updateLifecycle(vnode.attrs, vnode, hooks)
                }
                switch (oldTag) {
                case '#': updateText(old, vnode); break
                case '<': updateHTML(parent, old, vnode, ns, nextSibling); break
                case '[': updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
                default: updateElement(old, vnode, hooks, ns)
                }
            }
            else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
        }
        else {
            removeNode(parent, old)
            createNode(parent, vnode, hooks, ns, nextSibling)
        }
    }
    function updateText(old, vnode) {
        if (old.children.toString() !== vnode.children.toString()) {
            old.dom.nodeValue = vnode.children
        }
        vnode.dom = old.dom
    }
    function updateHTML(parent, old, vnode, ns, nextSibling) {
        if (old.children !== vnode.children) {
            removeDOM(parent, old)
            createHTML(parent, vnode, ns, nextSibling)
        }
        else {
            vnode.dom = old.dom
            vnode.domSize = old.domSize
        }
    }
    function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
        updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
        var domSize = 0, children = vnode.children
        vnode.dom = null
        if (children != null) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i]
                if (child != null && child.dom != null) {
                    if (vnode.dom == null) vnode.dom = child.dom
                    domSize += child.domSize || 1
                }
            }
            if (domSize !== 1) vnode.domSize = domSize
        }
    }
    function updateElement(old, vnode, hooks, ns) {
        var element = vnode.dom = old.dom
        ns = getNameSpace(vnode) || ns

        updateAttrs(vnode, old.attrs, vnode.attrs, ns)
        if (!maybeSetContentEditable(vnode)) {
            updateNodes(element, old.children, vnode.children, hooks, null, ns)
        }
    }
    function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
        vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
        if (vnode.instance === vnode) throw Error('A view cannot return the vnode it received as argument')
        updateLifecycle(vnode.state, vnode, hooks)
        if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
        if (vnode.instance != null) {
            if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
            else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
            vnode.dom = vnode.instance.dom
            vnode.domSize = vnode.instance.domSize
        }
        else if (old.instance != null) {
            removeNode(parent, old.instance)
            vnode.dom = undefined
            vnode.domSize = 0
        }
        else {
            vnode.dom = old.dom
            vnode.domSize = old.domSize
        }
    }
    function getKeyMap(vnodes, start, end) {
        // Check cache first
        if (keyMapCache.has(vnodes)) {
            const cache = keyMapCache.get(vnodes)
            if (cache.start === start && cache.end === end) {
                return cache.map
            }
        }

        const map = Object.create(null)
        for (let i = start; i < end; i++) {
            const vnode = vnodes[i]
            if (vnode !== null && vnode !== undefined) {
                const key = vnode.key
                if (key !== null && key !== undefined) {
                    map[key] = i
                }
            }
        }

        // Cache the result (limit cache size in production)
        keyMapCache.set(vnodes, {start, end, map})
        return map
    }
    // Use a pool of arrays for LIS calculations to reduce GC pressure
    const lisArrayPool = {
        temp: [],
        result: [],
    }

    function makeLisIndices(a:any[]) {
        const length = a.length
        
        // Reuse arrays from pool instead of creating new ones
        const result = lisArrayPool.result
        const temp = lisArrayPool.temp
        
        // Reset/prepare arrays
        result.length = 1
        result[0] = 0
        
        // Ensure temp array has enough capacity
        if (temp.length < length) {
            temp.length = Math.max(length, temp.length * 2)
        }
        
        // Copy input array values to temp
        for (let i = 0; i < length; i++) {
            temp[i] = a[i]
        }
        
        // Main LIS algorithm with optimized inner loop
        for (let i = 0; i < length; ++i) {
            if (a[i] === -1) continue
            
            const j = result[result.length - 1]
            
            // Fast path for appending to end of sequence
            if (a[j] < a[i]) {
                temp[i] = j
                result.push(i)
                continue
            }
            
            // Binary search to find insertion position
            // This is faster than the bit shifting approach for modern JS engines
            let u = 0
            let v = result.length - 1
            
            while (u < v) {
                // Use >>> 0 to ensure positive integer division
                const c = (u + v) >>> 1
                if (a[result[c]] < a[i]) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            
            if (a[i] < a[result[u]]) {
                if (u > 0) temp[i] = result[u - 1]
                result[u] = i
            }
        }
        
        // Backtrack to build result
        const actualResult = new Array(result.length)
        let u = result.length
        let v = result[u - 1]
        
        while (u-- > 0) {
            actualResult[u] = v
            v = temp[v]
        }
        
        return actualResult
    }

    function getNextSibling(vnodes, i, nextSibling) {
        const len = vnodes.length

        // Fast path: check if we're at the end
        if (i >= len) return nextSibling

        // Fast path: check next element first (common case)
        const vnode = vnodes[i]
        if (vnode !== null && vnode !== undefined && vnode.dom !== null && vnode.dom !== undefined) {
            return vnode.dom
        }

        // Use binary search to find next DOM node instead of linear scan
        // This is more efficient for large arrays of vnodes
        let start = i + 1
        let end = len - 1
        
        // Quick check at the end (often has DOM nodes)
        if (end >= start) {
            const lastVnode = vnodes[end]
            if (lastVnode !== null && lastVnode !== undefined && 
                lastVnode.dom !== null && lastVnode.dom !== undefined) {
                // If only scanning a few elements, just do linear scan from start
                if (end - start < 5) {
                    for (let j = start; j < end; j++) {
                        const vn = vnodes[j]
                        if (vn !== null && vn !== undefined && 
                            vn.dom !== null && vn.dom !== undefined) {
                            return vn.dom
                        }
                    }
                } else {
                    // For longer ranges, try binary search to find first DOM-containing node
                    while (start <= end) {
                        const mid = Math.floor((start + end) / 2)
                        const midVnode = vnodes[mid]
                        
                        if (midVnode !== null && midVnode !== undefined &&
                            midVnode.dom !== null && midVnode.dom !== undefined) {
                            // Found a DOM node, but there might be earlier ones
                            end = mid - 1
                        } else {
                            // No DOM node here, look in higher half
                            start = mid + 1
                        }
                    }
                    
                    // start is now the index of the first DOM-containing node
                    if (start < len) {
                        const firstDomVnode = vnodes[start]
                        if (firstDomVnode !== null && firstDomVnode !== undefined &&
                            firstDomVnode.dom !== null && firstDomVnode.dom !== undefined) {
                            return firstDomVnode.dom
                        }
                    }
                }
                
                // If we couldn't find an earlier one, use the last one we checked
                return lastVnode.dom
            }
        }
        
        // Default to provided nextSibling if no DOM nodes found
        return nextSibling
    }

    // This handles fragments with zombie children (removed from vdom, but persisted in DOM through onbeforeremove)
    function moveDOM(parent, vnode, nextSibling) {
        if (vnode.dom != null) {
            // Fast path: most nodes are single nodes, not fragments
            if (vnode.domSize == null || vnode.domSize === 1) {
                // Avoid function call overhead for common case
                const target = vnode.dom
                if (nextSibling != null) parent.insertBefore(target, nextSibling)
                else parent.appendChild(target)
                return
            }
            
            // Optimization for small fragments
            const domCount = vnode.domSize || 0
            if (domCount <= 3) {
                // For small fragments, direct insertions are faster than fragment creation
                let currentSibling = nextSibling
                let nodes = Array.from(domFor(vnode))
                
                // Insert in reverse order so each node becomes the nextSibling
                for (let i = nodes.length - 1; i >= 0; i--) {
                    if (nextSibling != null) parent.insertBefore(nodes[i], currentSibling)
                    else parent.appendChild(nodes[i])
                    currentSibling = nodes[i]
                }
                return
            }
            
            // For larger fragments, use document fragment
            const target = getDocument(parent).createDocumentFragment()
            for (const dom of domFor(vnode)) {
                target.appendChild(dom)
            }
            if (nextSibling != null) parent.insertBefore(target, nextSibling)
            else parent.appendChild(target)
        }
    }

    function insertDOM(parent, dom, nextSibling) {
        // Direct DOM operations are faster than function calls
        if (nextSibling != null) parent.insertBefore(dom, nextSibling)
        else parent.appendChild(dom)
    }

    function maybeSetContentEditable(vnode) {
        if (vnode.attrs == null || (
            vnode.attrs.contenteditable == null && // attribute
            vnode.attrs.contentEditable == null // property
        )) return false
        var children = vnode.children
        if (children != null && children.length === 1 && children[0].tag === '<') {
            var content = children[0].children
            if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
        }
        else if (children != null && children.length !== 0) throw new Error('Child node of a contenteditable must be trusted.')
        return true
    }

    // remove
    function removeNodes(parent, vnodes, start, end) {
        // Fast path: nothing to remove
        if (start >= end) return
        
        // Fast path: Remove a single node (common case)
        if (end - start === 1) {
            const vnode = vnodes[start]
            if (vnode != null) removeNode(parent, vnode)
            return
        }
        
        // Batch removal for multiple nodes - use fragment for batching when needed
        // For large node counts, batch DOM operations for better performance
        if (end - start > 10) {
            // Fast path: get nodes to remove directly without individual function calls
            // This avoids a lot of per-node overhead
            const nodesToRemove = []
            const counters = []
            
            // First stage: collect nodes and set up counters
            for (let i = start; i < end; i++) {
                const vnode = vnodes[i]
                if (vnode != null) {
                    // Check for onbeforeremove hooks
                    let counter = {v: 1}
                    let needsDelayedRemoval = false
                    
                    if (typeof vnode.tag !== 'string' && typeof vnode.state.onbeforeremove === 'function') {
                        needsDelayedRemoval = true
                    }
                    if (vnode.attrs && typeof vnode.attrs.onbeforeremove === 'function') {
                        needsDelayedRemoval = true
                    }
                    
                    if (needsDelayedRemoval) {
                        // If it needs delayed removal, handle it separately
                        removeNode(parent, vnode)
                    } else {
                        // Otherwise batch it for efficient removal
                        if (vnode.dom) {
                            // Collect all DOM nodes for batch removal
                            if (vnode.domSize != null && vnode.domSize > 1) {
                                for (const dom of domFor(vnode)) {
                                    nodesToRemove.push(dom)
                                }
                            } else if (vnode.dom) {
                                nodesToRemove.push(vnode.dom)
                            }
                        }
                        // Call onremove hooks
                        onremove(vnode)
                    }
                }
            }
            
            // Second stage: batch remove all collected nodes
            // This minimizes DOM reflows
            if (nodesToRemove.length > 0) {
                for (let i = 0; i < nodesToRemove.length; i++) {
                    parent.removeChild(nodesToRemove[i])
                }
            }
        } else {
            // For smaller node counts, use standard removal
            for (let i = start; i < end; i++) {
                const vnode = vnodes[i]
                if (vnode != null) removeNode(parent, vnode)
            }
        }
    }
    function tryBlockRemove(parent, vnode, source, counter) {
        var original = vnode.state
        var result = callHook.call(source.onbeforeremove, vnode)
        if (result == null) return

        var generation = currentRender
        for (var dom of domFor(vnode)) delayedRemoval.set(dom, generation)
        counter.v++

        Promise.resolve(result).finally(function() {
            checkState(vnode, original)
            tryResumeRemove(parent, vnode, counter)
        })
    }
    function tryResumeRemove(parent, vnode, counter) {
        if (--counter.v === 0) {
            onremove(vnode)
            removeDOM(parent, vnode)
        }
    }
    function removeNode(parent, vnode) {
        var counter = {v: 1}
        if (typeof vnode.tag !== 'string' && typeof vnode.state.onbeforeremove === 'function') tryBlockRemove(parent, vnode, vnode.state, counter)
        if (vnode.attrs && typeof vnode.attrs.onbeforeremove === 'function') tryBlockRemove(parent, vnode, vnode.attrs, counter)
        tryResumeRemove(parent, vnode, counter)
    }
    function removeDOM(parent, vnode) {
        if (vnode.dom == null) return
        
        if (vnode.domSize == null) {
            // Fast path - single node removal
            parent.removeChild(vnode.dom)
        } else if (vnode.domSize <= 3) {
            // Fast path for small node counts - avoid iterator overhead
            const nodes = Array.from(domFor(vnode))
            for (let i = 0; i < nodes.length; i++) {
                parent.removeChild(nodes[i])
            }
        } else {
            // Use the iterator for larger node counts
            for (const dom of domFor(vnode)) {
                parent.removeChild(dom)
            }
        }
    }

    function onremove(vnode) {
        if (typeof vnode.tag !== 'string' && typeof vnode.state.onremove === 'function') callHook.call(vnode.state.onremove, vnode)
        if (vnode.attrs && typeof vnode.attrs.onremove === 'function') callHook.call(vnode.attrs.onremove, vnode)
        if (typeof vnode.tag !== 'string') {
            if (vnode.instance != null) onremove(vnode.instance)
        } else {
            var children = vnode.children
            if (Array.isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i]
                    if (child != null) onremove(child)
                }
            }
        }
    }

    // attrs
    function setAttrs(vnode, attrs, ns) {
        for (var key in attrs) {
            setAttr(vnode, key, null, attrs[key], ns)
        }
    }
    function setAttr(vnode, key, old, value, ns) {
        if (key === 'key' || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== 'object') return
        if (key[0] === 'o' && key[1] === 'n') return updateEvent(vnode, key, value)
        if (key.slice(0, 6) === 'xlink:') vnode.dom.setAttributeNS('http://www.w3.org/1999/xlink', key.slice(6), value)
        else if (key === 'style') updateStyle(vnode.dom, old, value)
        else if (hasPropertyKey(vnode, key, ns)) {
            if (key === 'value') {
                // Only do the coercion if we're actually going to check the value.
                /* eslint-disable no-implicit-coercion */
                // setting input[value] to same value by typing on focused element moves cursor to end in Chrome
                // setting input[type=file][value] to same value causes an error to be generated if it's non-empty
                // minlength/maxlength validation isn't performed on script-set values(#2256)
                if ((vnode.tag === 'input' || vnode.tag === 'textarea') && vnode.dom.value === '' + value) return
                // setting select[value] to same value while having select open blinks select dropdown in Chrome
                if (vnode.tag === 'select' && old !== null && vnode.dom.value === '' + value) return
                // setting option[value] to same value while having select open blinks select dropdown in Chrome
                if (vnode.tag === 'option' && old !== null && vnode.dom.value === '' + value) return
                // setting input[type=file][value] to different value is an error if it's non-empty
                // Not ideal, but it at least works around the most common source of uncaught exceptions for now.
                // eslint-disable-next-line no-console
                if (vnode.tag === 'input' && vnode.attrs.type === 'file' && '' + value !== '') { console.error('`value` is read-only on file inputs!'); return }
                /* eslint-enable no-implicit-coercion */
            }
            // If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
            if (vnode.tag === 'input' && key === 'type') vnode.dom.setAttribute(key, value)
            else vnode.dom[key] = value
        } else {
            if (typeof value === 'boolean') {
                if (value) vnode.dom.setAttribute(key, '')
                else vnode.dom.removeAttribute(key)
            }
            else vnode.dom.setAttribute(key === 'className' ? 'class' : key, value)
        }
    }
    function removeAttr(vnode, key, old, ns) {
        if (key === 'key' || old == null || isLifecycleMethod(key)) return
        if (key[0] === 'o' && key[1] === 'n') updateEvent(vnode, key, undefined)
        else if (key === 'style') updateStyle(vnode.dom, old, null)
        else if (
            hasPropertyKey(vnode, key, ns)
            && key !== 'className'
            && key !== 'title' // creates "null" as title
            && !(
                key === 'value' &&
                (vnode.tag === 'option'	|| vnode.tag === 'select' && vnode.dom.selectedIndex === -1 && vnode.dom === activeAlement(vnode.dom))
            )
            && !(vnode.tag === 'input' && key === 'type')
        ) {
            vnode.dom[key] = null
        } else {
            var nsLastIndex = key.indexOf(':')
            if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
            if (old !== false) vnode.dom.removeAttribute(key === 'className' ? 'class' : key)
        }
    }
    function setLateSelectAttrs(vnode, attrs) {
        if ('value' in attrs) {
            if (attrs.value === null) {
                if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
            } else {
                var normalized = '' + attrs.value // eslint-disable-line no-implicit-coercion
                if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
                    vnode.dom.value = normalized
                }
            }
        }
        if ('selectedIndex' in attrs) setAttr(vnode, 'selectedIndex', null, attrs.selectedIndex, undefined)
    }
    function updateAttrs(vnode, old, attrs, ns) {
        // Some attributes may NOT be case-sensitive (e.g. data-***),
        // so removal should be done first to prevent accidental removal for newly setting values.
        var val
        if (old != null) {
            if (old === attrs) {
                // eslint-disable-next-line no-console
                console.warn('Don\'t reuse attrs object, use new object for every redraw, this will throw in next major')
            }
            for (var key in old) {
                // eslint-disable-next-line no-cond-assign
                if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
                    removeAttr(vnode, key, val, ns)
                }
            }
        }
        if (attrs != null) {
            for (var _key in attrs) {
                setAttr(vnode, _key, old && old[_key], attrs[_key], ns)
            }
        }
    }
    function isFormAttribute(vnode, attr) {
        return attr === 'value' || attr === 'checked' || attr === 'selectedIndex' || attr === 'selected' && vnode.dom === activeAlement(vnode.dom) || vnode.tag === 'option' && vnode.dom.parentNode === activeAlement(vnode.dom)
    }
    function isLifecycleMethod(attr) {
        return attr === 'oninit' || attr === 'oncreate' || attr === 'onupdate' || attr === 'onremove' || attr === 'onbeforeremove' || attr === 'onbeforeupdate'
    }
    function hasPropertyKey(vnode, key, ns) {
        // Filter out namespaced keys
        return ns === undefined && (
        // If it's a custom element, just keep it.
            vnode.tag.indexOf('-') > -1 || vnode.is ||
            // If it's a normal element, let's try to avoid a few browser bugs.
            key !== 'href' && key !== 'list' && key !== 'form' && key !== 'width' && key !== 'height'// && key !== "type"
            // Defer the property check until *after* we check everything.
        ) && key in vnode.dom
    }

    // style
    function updateStyle(element, old, style) {
        // Skip if identical references
        if (old === style) return

        // Clear style completely if new style is null
        if (style === null || style === undefined) {
            element.style.cssText = ''
            return
        }

        // Handle string style
        if (typeof style !== 'object') {
            element.style.cssText = style
            return
        }

        // Handle case where old style doesn't exist or is a string
        if (old === null || old === undefined || typeof old !== 'object') {
            // Fast path: Set all styles at once when possible
            if (Object.keys(style).every((key) => !key.includes('-'))) {
                let cssText = ''
                for (const key in style) {
                    const value = style[key]
                    if (value !== null && value !== undefined) {
                        cssText += `${key}: ${value}; `
                    }
                }
                element.style.cssText = cssText
                return
            }

            // Handle styles with custom properties
            element.style.cssText = ''
            for (const key in style) {
                const value = style[key]
                if (value !== null && value !== undefined) {
                    if (key.includes('-')) {
                        element.style.setProperty(key, String(value))
                    } else {
                        element.style[key] = String(value)
                    }
                }
            }
            return
        }

        // Both old & new are objects - use efficient diffing
        // Fast path: check if objects are shallow equal (common case)
        let different = false
        for (const key in old) {
            if (!(key in style) || old[key] !== style[key]) {
                different = true
                break
            }
        }

        if (!different) {
            for (const key in style) {
                if (!(key in old)) {
                    different = true
                    break
                }
            }
        }

        if (!different) return

        // Objects differ - calculate changes efficiently
        // 1. Remove old properties not in new style
        for (const key in old) {
            if (!(key in style) || style[key] === null || style[key] === undefined) {
                if (key.includes('-')) {
                    element.style.removeProperty(key)
                } else {
                    element.style[key] = ''
                }
            }
        }

        // 2. Add/update new properties
        for (const key in style) {
            const value = style[key]
            const oldValue = key in old ? old[key] : null
            if (value !== null && value !== undefined && value !== oldValue) {
                if (key.includes('-')) {
                    element.style.setProperty(key, String(value))
                } else {
                    element.style[key] = String(value)
                }
            }
        }
    }

    // Here's an explanation of how this works:
    // 1. The event names are always (by design) prefixed by `on`.
    // 2. The EventListener interface accepts either a function or an object
    //    with a `handleEvent` method.
    // 3. The object does not inherit from `Object.prototype`, to avoid
    //    any potential interference with that (e.g. setters).
    // 4. The event name is remapped to the handler before calling it.
    // 5. In function-based event handlers, `ev.target === this`. We replicate
    //    that below.
    // 6. In function-based event handlers, `return false` prevents the default
    //    action and stops event propagation. We replicate that below.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    function EventDict() {
        // Save this, so the current redraw is correctly tracked.
        this._ = currentRedraw
    }
    EventDict.prototype = Object.create(null)
    EventDict.prototype.handleEvent = function(ev) {
        var handler = this['on' + ev.type]
        var result
        if (typeof handler === 'function') result = handler.call(ev.currentTarget, ev)
        else if (typeof handler.handleEvent === 'function') handler.handleEvent(ev)
        if (this._ && ev.redraw !== false) (0, this._)()
        if (result === false) {
            ev.preventDefault()
            ev.stopPropagation()
        }
    }

    function updateEvent(vnode, key, value) {
        if (vnode.events != null) {
            vnode.events._ = currentRedraw
            if (vnode.events[key] === value) return
            if (value != null && (typeof value === 'function' || typeof value === 'object')) {
                if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
                vnode.events[key] = value
            } else {
                if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
                vnode.events[key] = undefined
            }
        } else if (value != null && (typeof value === 'function' || typeof value === 'object')) {
            vnode.events = new EventDict()
            vnode.dom.addEventListener(key.slice(2), vnode.events, false)
            vnode.events[key] = value
        }
    }

    function initLifecycle(source, vnode, hooks) {
        if (typeof source.oninit === 'function') callHook.call(source.oninit, vnode)
        if (typeof source.oncreate === 'function') hooks.push(callHook.bind(source.oncreate, vnode))
    }
    function updateLifecycle(source, vnode, hooks) {
        if (typeof source.onupdate === 'function') hooks.push(callHook.bind(source.onupdate, vnode))
    }
    function shouldNotUpdate(vnode, old) {
        do {
            if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === 'function') {
                let force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
                if (force !== undefined && !force) break
            }
            if (typeof vnode.tag !== 'string' && typeof vnode.state.onbeforeupdate === 'function') {
                let force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
                if (force !== undefined && !force) break
            }
            return false
        } while (false) // eslint-disable-line no-constant-condition
        vnode.dom = old.dom
        vnode.domSize = old.domSize
        vnode.instance = old.instance
        // One would think having the actual latest attributes would be ideal,
        // but it doesn't let us properly diff based on our current internal
        // representation. We have to save not only the old DOM info, but also
        // the attributes used to create it, as we diff *that*, not against the
        // DOM directly (with a few exceptions in `setAttr`). And, of course, we
        // need to save the children and text as they are conceptually not
        // unlike special "attributes" internally.
        vnode.attrs = old.attrs
        vnode.children = old.children
        vnode.text = old.text
        return true
    }

    var currentDOM

    return function(dom, vnodes, redraw) {
        if (!dom) throw new TypeError('DOM element being rendered to does not exist.')

        if (currentDOM != null && dom.contains(currentDOM)) {
            throw new TypeError('Node is currently being rendered to and thus is locked.')
        }

        const prevRedraw = currentRedraw
        const prevDOM = currentDOM
        const hooks: (() => void)[] = []

        // Pre-calculate these values
        const active = activeAlement(dom)
        const namespace = dom.namespaceURI
        const isSvg = namespace === 'http://www.w3.org/2000/svg'
        const nsToPass = isSvg ? namespace : undefined

        currentDOM = dom
        currentRedraw = typeof redraw === 'function' ? redraw : undefined
        currentRender = {}

        try {
            // First time rendering
            if (dom.vnodes == null) {
                dom.textContent = ''
            }

            // Performance: Avoid extra normalization if already an array
            const vnodesToNormalize = Array.isArray(vnodes) ? vnodes : [vnodes]
            const normalizedVnodes = Vnode.normalizeChildren(vnodesToNormalize)

            // Call updateNodes with pre-calculated namespace
            updateNodes(dom, dom.vnodes, normalizedVnodes, hooks, null, nsToPass)
            dom.vnodes = normalizedVnodes

            // Fast-path: skip focus if nothing to focus
            if (active != null && active !== activeAlement(dom) && typeof active.focus === 'function') {
                active.focus()
            }

            // Execute hooks in batch for better performance
            const hooksLength = hooks.length
            for (let i = 0; i < hooksLength; i++) {
                hooks[i]()
            }
        } finally {
            currentRedraw = prevRedraw
            currentDOM = prevDOM
        }
    }
}
