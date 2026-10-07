import {setCurrentComponent, clearCurrentComponent, clearComponentDependencies, resetComponentDependencies} from '../state/signal'
import {logHydrationError, resetHydrationErrorCount} from './hydration_debug'

import Vnode from './vnode'
import delayedRemoval from './delayed_removal'
import domFor from './dom_for'
import cachedAttrsIsStaticMap from './cached_attrs_is_static'

import type {
    Children,
    ComponentTag,
    ComponentType,
    EventDict,
    Hook,
    LifecycleSource,
    RenderChildren,
    RenderRoot,
    RenderVnode,
    Vnode as VnodeType,
} from './vnode'

// Module-level maps for component/state-to-DOM tracking (used by mount_redraw for signal redraws)
const stateToDomMap = new WeakMap<object, Node>()
const stateToComponentMap = new WeakMap<object, ComponentType>()
/** The component vnode that is in the tree now, which a targeted redraw patches in place. */
const stateToVnodeMap = new WeakMap<object, RenderVnode>()

/** Marks a component's view (or closure) while it is being initialized, so a re-entrant init is skipped. */
type ReentrancySentinel = {$$reentrantLock$$?: true | null}

/** The style declaration's properties by camelCase name, as an attrs `style` object sets them. */
type StyleProperties = CSSStyleDeclaration & Record<string, string>

/** An attrs `style` object: property names (camelCase or dash-case) to values. */
type StyleObject = Record<string, unknown>

/** An element as attrs reach it: form-control state, and any other DOM property by name. */
type ElementDom = Element &
    ElementCSSInlineStyle & {value?: string | null; selectedIndex?: number; type?: string} & Record<string, unknown>

/** An element vnode once its DOM node exists, as the attribute and event code handles it. */
type ElementVnode = RenderVnode & {tag: string; dom: ElementDom}

export function getStateMaps() {
    return {stateToDomMap, stateToComponentMap, stateToVnodeMap}
}

export default function renderFactory() {
    const nameSpace: Record<string, string> = {
        svg: 'http://www.w3.org/2000/svg',
        math: 'http://www.w3.org/1998/Math/MathML',
    }

    let currentRedraw: (() => void) | undefined
    let currentRender: object | undefined

    function getDocument(dom: Node): Document {
        return dom.ownerDocument!
    }

    function getNameSpace(vnode: RenderVnode): string | undefined {
        return ((vnode.attrs && vnode.attrs.xmlns) as string | undefined) || nameSpace[vnode.tag as string]
    }

    // sanity check to discourage people from doing `vnode.state = ...`
    function checkState(vnode: RenderVnode, original: unknown) {
        if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.")
    }

    // Note: the hook is passed as the `this` argument to allow proxying the
    // arguments without requiring a full array allocation to do so. It also
    // takes advantage of the fact the current `vnode` is the first argument in
    // all lifecycle methods.
    function callHook(this: unknown, vnode: RenderVnode, ...args: unknown[]): unknown {
        if (this == null || typeof (this as Hook).apply !== 'function') {
            const tagName = typeof vnode?.tag === 'function' ? vnode.tag?.name : vnode?.tag
            throw new TypeError(
                `callHook: expected a function with .apply (e.g. component.view), got ${String(tagName ?? vnode?.tag)}. Check that the component has a view.`,
            )
        }
        const original = vnode.state
        try {
            return (this as Hook).apply(original, [vnode, ...args])
        } finally {
            checkState(vnode, original)
        }
    }

    // IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
    // inside an iframe. Catch and swallow this error, and heavy-handidly return null.
    function activeElement(dom: Node): Element | null {
        try {
            return getDocument(dom).activeElement
        } catch (_e) {
            return null
        }
    }
    // Positional hydration: walk existing DOM children in order, adopting each
    // to the corresponding vnode. Handles text-node merging (SSR concatenates
    // adjacent text runs into one node) and component/fragment recursion.
    // Returns the next unprocessed DOM sibling (or null when exhausted).
    function hydrateNode(
        parent: Element,
        vnode: RenderVnode | null | undefined,
        hooks: Array<() => void>,
        ns: string | undefined,
        cursor: Node | null,
    ): Node | null {
        if (vnode == null) return cursor
        const tag = vnode.tag

        if (typeof tag === 'string') {
            switch (tag) {
                case '#': {
                    // Text vnode
                    if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks, true)
                    const expected = String(vnode.children)
                    if (cursor && cursor.nodeType === 3) {
                        // Reuse existing text node; patch value if it differs
                        vnode.dom = cursor
                        if ((cursor as Text).nodeValue !== expected) {
                            ;(cursor as Text).nodeValue = expected
                        }
                        return cursor.nextSibling
                    }
                    // No matching text node — create one
                    const textNode = getDocument(parent).createTextNode(expected)
                    parent.insertBefore(textNode, cursor)
                    vnode.dom = textNode
                    return cursor
                }
                case '<': {
                    // Trust HTML vnode — skip the corresponding DOM range.
                    // Fall through to non-hydration creation (rare in hydration).
                    vnode.state = {}
                    if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks, true)
                    createHTML(parent, vnode, ns, cursor)
                    return cursor
                }
                case '[': {
                    // Fragment vnode
                    vnode.state = {}
                    if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks, true)
                    let c = cursor
                    if (vnode.children != null) {
                        for (let i = 0; i < vnode.children.length; i++) {
                            c = hydrateNode(parent, (vnode.children as RenderChildren)[i], hooks, ns, c)
                        }
                    }
                    vnode.dom = (vnode.children as RenderChildren | undefined)?.[0]?.dom ?? null
                    let size = 0
                    if (vnode.children) {
                        for (let i = 0; i < vnode.children.length; i++) {
                            const child = (vnode.children as RenderChildren)[i]
                            if (child != null) size += child.domSize ?? (child.dom ? 1 : 0)
                        }
                    }
                    vnode.domSize = size
                    return c
                }
                default: {
                    // Element vnode
                    vnode.state = {}
                    if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks, true)
                    // Find matching element (skip whitespace text nodes)
                    let el: Element | null = null
                    let scan: Node | null = cursor
                    while (scan) {
                        if (scan.nodeType === 1) {
                            const candidateTag = ((scan as Element).tagName || (scan as Element).nodeName || '').toLowerCase()
                            if (candidateTag === tag.toLowerCase()) {
                                el = scan as Element
                                break
                            }
                            break // tag mismatch — don't skip ahead indefinitely
                        }
                        // Skip whitespace-only text nodes between elements
                        if (scan.nodeType === 3 && scan.nodeValue && scan.nodeValue.trim() === '') {
                            scan = scan.nextSibling
                            continue
                        }
                        break
                    }
                    if (el) {
                        vnode.dom = el
                        ns = getNameSpace(vnode) || ns
                        if (vnode.attrs != null) setAttrs(vnode as ElementVnode, vnode.attrs, ns)
                        if (!maybeSetContentEditable(vnode as ElementVnode)) {
                            if (vnode.children != null) {
                                hydrateElementChildren(el, vnode.children as RenderChildren, hooks, ns)
                            }
                        }
                        vnode.domSize = 1
                        return el.nextSibling
                    }
                    // No matching element — create from scratch
                    createElement(parent, vnode, hooks, ns, cursor)
                    return cursor
                }
            }
        }

        // Component vnode
        initComponent(vnode, hooks, true)
        if (vnode.instance != null) {
            const nextCursor = hydrateNode(parent, vnode.instance, hooks, ns, cursor)
            vnode.dom = vnode.instance.dom
            vnode.domSize = vnode.instance.domSize
            return nextCursor
        }
        vnode.domSize = 0
        return cursor
    }

    function hydrateElementChildren(
        element: Element,
        children: RenderChildren,
        hooks: Array<() => void>,
        ns: string | undefined,
    ) {
        let cursor: Node | null = element.firstChild
        for (let i = 0; i < children.length; i++) {
            cursor = hydrateNode(element, children[i], hooks, ns, cursor)
        }
        // Remove leftover DOM nodes that weren't claimed by any vnode
        while (cursor) {
            const next: Node | null = cursor.nextSibling
            try {
                element.removeChild(cursor)
            } catch (_e) {
                // already removed
            }
            cursor = next
        }
    }

    // create
    function createNodes(
        parent: Element | DocumentFragment,
        vnodes: RenderChildren,
        start: number,
        end: number,
        hooks: Array<() => void>,
        nextSibling: Node | null,
        ns: string | undefined,
        isHydrating: boolean = false,
        matchedNodes: Set<Node> | null = null,
    ) {
        // Track which DOM nodes we've matched during hydration to avoid reusing the same node twice
        // Create a new set if not provided and we're hydrating at the root level
        const createdMatchedNodes = matchedNodes == null && isHydrating && nextSibling == null
        if (createdMatchedNodes) {
            matchedNodes = new Set<Node>()
        }
        for (let i = start; i < end; i++) {
            const vnode = vnodes[i]
            if (vnode != null) {
                createNode(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes)
            }
        }
        // After creating/matching all nodes, remove any unmatched nodes that remain
        // Only do this at the root level to avoid removing nodes that are part of matched subtrees
        if (createdMatchedNodes && matchedNodes && parent.firstChild && nextSibling == null) {
            let node: Node | null = parent.firstChild
            while (node) {
                const next: Node | null = node.nextSibling
                if (!matchedNodes.has(node)) {
                    try {
                        parent.removeChild(node)
                    } catch (e) {
                        const error = e as Error
                        logHydrationError(
                            'removeChild (root level cleanup)',
                            null, // No vnode at root level
                            parent instanceof Element ? parent : null,
                            error,
                            {parent: parent instanceof Element ? parent : undefined, node, matchedNodes},
                        )
                        // Don't re-throw - we've already logged the error with all details
                        // Re-throwing causes the browser to log the DOMException stack trace
                    }
                }
                node = next
            }
        }
    }
    function createNode(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        ns: string | undefined,
        nextSibling: Node | null,
        isHydrating: boolean = false,
        matchedNodes: Set<Node> | null = null,
    ) {
        const tag = vnode.tag
        if (typeof tag === 'string') {
            vnode.state = {}
            if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks, isHydrating)
            switch (tag) {
                case '#':
                    createText(parent, vnode, nextSibling, isHydrating, matchedNodes)
                    break
                case '<':
                    createHTML(parent, vnode, ns, nextSibling)
                    break
                case '[':
                    createFragment(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes)
                    break
                default:
                    createElement(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes)
            }
        } else createComponent(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes)
    }
    function createText(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        nextSibling: Node | null,
        isHydrating: boolean = false,
        matchedNodes: Set<Node> | null = null,
    ) {
        let textNode: Text
        if (isHydrating && parent.firstChild && nextSibling == null && matchedNodes) {
            // During hydration, try to reuse existing text node
            // Normalize text for comparison (trim whitespace differences)
            const expectedText = String(vnode.children || '').trim()
            let candidate: Node | null = parent.firstChild
            while (candidate) {
                if (candidate.nodeType === 3 && !matchedNodes.has(candidate)) {
                    const candidateText = candidate as Text
                    const candidateValue = candidateText.nodeValue || ''
                    // Exact match preferred, but also accept trimmed match for whitespace differences
                    if (candidateValue === String(vnode.children) || (expectedText && candidateValue.trim() === expectedText)) {
                        textNode = candidateText
                        matchedNodes.add(textNode)
                        // Update text content if there's a minor difference (whitespace normalization)
                        if (candidateValue !== String(vnode.children)) {
                            textNode.nodeValue = String(vnode.children)
                        }
                        // Don't remove/reinsert - just reuse the existing node in place
                        break
                    }
                }
                candidate = candidate.nextSibling
            }
            // If no matching text node found, create new one; mark it matched so root cleanup keeps it
            if (!textNode!) {
                textNode = getDocument(parent).createTextNode(vnode.children as string)
                insertDOM(parent, textNode, nextSibling)
                matchedNodes.add(textNode)
            }
        } else {
            textNode = getDocument(parent).createTextNode(vnode.children as string)
            insertDOM(parent, textNode, nextSibling)
        }
        vnode.dom = textNode
    }
    const possibleParents: Record<string, string> = {
        caption: 'table',
        thead: 'table',
        tbody: 'table',
        tfoot: 'table',
        tr: 'tbody',
        th: 'tr',
        td: 'tr',
        colgroup: 'table',
        col: 'colgroup',
    }
    function createHTML(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        ns: string | undefined,
        nextSibling: Node | null,
    ) {
        const match = (vnode.children as string).match(/^\s*?<(\w+)/im) || []
        // not using the proper parent makes the child element(s) vanish.
        //     var div = document.createElement("div")
        //     div.innerHTML = "<td>i</td><td>j</td>"
        //     console.log(div.innerHTML)
        // --> "ij", no <td> in sight.
        let temp = getDocument(parent as Element).createElement(possibleParents[match[1]!] || 'div')
        if (ns === 'http://www.w3.org/2000/svg') {
            temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + vnode.children + '</svg>'
            temp = temp.firstChild as HTMLElement
        } else {
            temp.innerHTML = vnode.children as string
        }
        vnode.dom = temp.firstChild
        vnode.domSize = temp.childNodes.length
        const fragment = getDocument(parent).createDocumentFragment()
        let child: Node | null
        while ((child = temp.firstChild) != null) {
            fragment.appendChild(child)
        }
        insertDOM(parent, fragment, nextSibling)
    }
    function createFragment(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        ns: string | undefined,
        nextSibling: Node | null,
        isHydrating: boolean = false,
        matchedNodes: Set<Node> | null = null,
    ) {
        if (isHydrating && matchedNodes) {
            // During hydration, render children directly into the real parent so they
            // can match existing SSR DOM nodes. Using a DocumentFragment would isolate
            // the children from the parent's childNodes, preventing any reuse.
            const childCountBefore = parent.childNodes.length
            if (vnode.children != null) {
                const children = vnode.children as RenderChildren
                createNodes(parent, children, 0, children.length, hooks, nextSibling, ns, isHydrating, matchedNodes)
            }
            // Fragment's dom/domSize must reflect the children that were placed
            vnode.dom = (vnode.children as RenderChildren | undefined)?.[0]?.dom ?? null
            let size = 0
            if (vnode.children) {
                for (let i = 0; i < vnode.children.length; i++) {
                    const child = (vnode.children as RenderChildren)[i]
                    if (child != null) size += child.domSize ?? (child.dom ? 1 : 0)
                }
            }
            vnode.domSize = size
        } else {
            const fragment = getDocument(parent).createDocumentFragment()
            if (vnode.children != null) {
                const children = vnode.children as RenderChildren
                createNodes(fragment, children, 0, children.length, hooks, null, ns, isHydrating, matchedNodes)
            }
            vnode.dom = fragment.firstChild
            vnode.domSize = fragment.childNodes.length
            insertDOM(parent, fragment, nextSibling)
        }
    }
    function createElement(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        ns: string | undefined,
        nextSibling: Node | null,
        isHydrating: boolean = false,
        matchedNodes: Set<Node> | null = null,
    ) {
        const tag = vnode.tag as string
        const attrs = vnode.attrs
        const is = vnode.is

        ns = getNameSpace(vnode) || ns

        let element: Element
        if (isHydrating && parent.firstChild && nextSibling == null && matchedNodes) {
            // During hydration, try to reuse existing DOM node
            // Only match if we're appending (nextSibling == null) to preserve order
            // Find the first unmatched child element that matches the tag
            // More lenient matching: skip text nodes and comments, allow tag name case differences
            let candidate: Node | null = parent.firstChild
            let fallbackCandidate: Element | null = null
            while (candidate) {
                // Skip text nodes, comments, and already matched nodes
                if (candidate.nodeType === 1 && !matchedNodes.has(candidate)) {
                    const candidateEl = candidate as Element
                    // Case-insensitive tag matching (browsers normalize to uppercase for some tags)
                    // Use tagName if available, fallback to nodeName (for DOM mocks)
                    const candidateTag = candidateEl.tagName || candidateEl.nodeName
                    if (candidateTag && candidateTag.toLowerCase() === tag.toLowerCase()) {
                        // Prefer exact match (is attribute matches if specified)
                        if (!is || candidateEl.getAttribute('is') === is) {
                            element = candidateEl
                            matchedNodes.add(element)
                            // Don't remove/reinsert - just reuse the existing node in place
                            break
                        }
                        // Keep track of first matching tag as fallback (even if is attribute doesn't match)
                        if (!fallbackCandidate) {
                            fallbackCandidate = candidateEl
                        }
                    }
                }
                candidate = candidate.nextSibling
            }
            // If no exact match found but we have a fallback, use it
            // This handles cases where is attribute differs but tag matches
            if (!element! && fallbackCandidate) {
                element = fallbackCandidate
                matchedNodes.add(element)
            }
            // If still no matching element found, create new one; mark it matched so root cleanup keeps it
            if (!element!) {
                element = ns
                    ? is
                        ? getDocument(parent as Element).createElementNS(ns, tag, {is: is})
                        : getDocument(parent as Element).createElementNS(ns, tag)
                    : is
                      ? getDocument(parent as Element).createElement(tag, {is: is})
                      : getDocument(parent as Element).createElement(tag)
                insertDOM(parent, element, nextSibling)
                matchedNodes.add(element)
            }
        } else {
            // Normal creation path
            element = ns
                ? is
                    ? getDocument(parent as Element).createElementNS(ns, tag, {is: is})
                    : getDocument(parent as Element).createElementNS(ns, tag)
                : is
                  ? getDocument(parent as Element).createElement(tag, {is: is})
                  : getDocument(parent as Element).createElement(tag)
            insertDOM(parent, element, nextSibling)
        }
        vnode.dom = element

        if (attrs != null) {
            setAttrs(vnode as ElementVnode, attrs, ns)
        }

        if (!maybeSetContentEditable(vnode as ElementVnode)) {
            if (vnode.children != null) {
                const children = vnode.children as RenderChildren
                if (isHydrating && element.firstChild) {
                    // Positional adoption: walk existing DOM children in order, assigning
                    // each to the corresponding vnode. This avoids the content-matching
                    // approach which breaks when SSR merges adjacent text nodes.
                    hydrateElementChildren(element, children, hooks, ns)
                } else {
                    createNodes(element, children, 0, children.length, hooks, null, ns)
                }
                if (vnode.tag === 'select' && attrs != null) setLateSelectAttrs(vnode as ElementVnode, attrs)
            }
        }
    }
    function initComponent(vnode: RenderVnode, hooks: Array<() => void>, isHydrating: boolean = false) {
        let sentinel: ReentrancySentinel
        if (typeof (vnode.tag as ComponentTag).view === 'function') {
            vnode.state = Object.create(vnode.tag as ComponentTag) as LifecycleSource
            sentinel = vnode.state.view as ReentrancySentinel
            if (sentinel.$$reentrantLock$$ != null) return
            sentinel.$$reentrantLock$$ = true
        } else {
            vnode.state = void 0
            sentinel = vnode.tag as ComponentTag & ReentrancySentinel
            if (sentinel.$$reentrantLock$$ != null) return
            sentinel.$$reentrantLock$$ = true
            vnode.state =
                (vnode.tag as ComponentTag).prototype != null && typeof (vnode.tag as ComponentTag).prototype!.view === 'function'
                    ? new (vnode.tag as ComponentTag)(vnode)
                    : (vnode.tag as ComponentTag)(vnode)
        }
        initLifecycle(vnode.state, vnode, hooks, isHydrating)
        if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks, isHydrating)

        // Track component for signal dependency tracking
        // Store mapping from vnode.state to vnode.tag (component object) for redraw
        if (vnode.state && vnode.tag && !isHydrating) {
            stateToComponentMap.set(vnode.state, vnode.tag as ComponentType)
        }
        // Always track component dependencies for signal tracking (even during hydration)
        // This allows signals to know which components depend on them
        // We only skip oninit during hydration, not signal tracking
        // Only set currentComponent if vnode.state exists (it might be undefined for some component types)
        if (vnode.state != null) {
            setCurrentComponent(vnode.state)
        }
        try {
            vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
        } finally {
            if (vnode.state != null) {
                clearCurrentComponent()
            }
        }
        if (vnode.instance === vnode) throw Error('A view cannot return the vnode it received as argument')
        sentinel.$$reentrantLock$$ = null
    }
    function createComponent(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        ns: string | undefined,
        nextSibling: Node | null,
        isHydrating: boolean = false,
        matchedNodes: Set<Node> | null = null,
    ) {
        initComponent(vnode, hooks, isHydrating)
        if (vnode.instance != null) {
            createNode(parent, vnode.instance, hooks, ns, nextSibling, isHydrating, matchedNodes)
            vnode.dom = vnode.instance.dom
            vnode.domSize = vnode.instance.domSize

            // Store component's DOM element and vnode info for fine-grained redraw (not during hydration)
            if (vnode.state && vnode.dom && !isHydrating) {
                stateToDomMap.set(vnode.state, vnode.dom)
                stateToVnodeMap.set(vnode.state, vnode)
            }
        } else {
            vnode.domSize = 0
        }
    }

    // update
    function updateNodes(
        parent: Element | DocumentFragment,
        old: RenderChildren | null | undefined,
        vnodes: RenderChildren | null | undefined,
        hooks: Array<() => void>,
        nextSibling: Node | null,
        ns: string | undefined,
        isHydrating: boolean = false,
    ) {
        if (old === vnodes || (old == null && vnodes == null)) return
        else if (old == null || old.length === 0)
            createNodes(parent, vnodes!, 0, vnodes!.length, hooks, nextSibling, ns, isHydrating)
        else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
        else {
            const isOldKeyed = old[0] != null && old[0].key != null
            const isKeyed = vnodes[0] != null && vnodes[0].key != null
            let start = 0,
                oldStart = 0,
                o: RenderVnode | null | undefined,
                v: RenderVnode | null | undefined
            if (isOldKeyed !== isKeyed) {
                removeNodes(parent, old, 0, old.length)
                createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns, isHydrating)
            } else if (!isKeyed) {
                // Don't index past the end of either list (causes deopts).
                const commonLength = old.length < vnodes.length ? old.length : vnodes.length
                // Rewind if necessary to the first non-null index on either side.
                // We could alternatively either explicitly create or remove nodes when `start !== oldStart`
                // but that would be optimizing for sparse lists which are more rare than dense ones.
                while (oldStart < old.length && old[oldStart] == null) oldStart++
                while (start < vnodes.length && vnodes[start] == null) start++
                start = start < oldStart ? start : oldStart
                for (; start < commonLength; start++) {
                    o = old[start]
                    v = vnodes[start]
                    if (o === v || (o == null && v == null)) continue
                    else if (o == null)
                        createNode(parent, v!, hooks, ns, getNextSibling(old, start + 1, old.length, nextSibling), isHydrating)
                    else if (v == null) removeNode(parent, o)
                    else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, old.length, nextSibling), ns, isHydrating)
                }
                if (old.length > commonLength) removeNodes(parent, old, start, old.length)
                if (vnodes.length > commonLength)
                    createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns, isHydrating)
            } else {
                // keyed diff
                let oldEnd = old.length - 1,
                    end = vnodes.length - 1,
                    oe: RenderVnode | null | undefined,
                    ve: RenderVnode | null | undefined,
                    topSibling: Node | null

                // bottom-up
                while (oldEnd >= oldStart && end >= start) {
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    if (oe == null || ve == null || oe.key !== ve.key) break
                    if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating)
                    if (ve.dom != null) nextSibling = ve.dom
                    ;(oldEnd--, end--)
                }
                // top-down
                while (oldEnd >= oldStart && end >= start) {
                    o = old[oldStart]
                    v = vnodes[start]
                    if (o == null || v == null || o.key !== v.key) break
                    ;(oldStart++, start++)
                    if (o !== v)
                        updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, oldEnd + 1, nextSibling), ns, isHydrating)
                }
                // swaps and list reversals
                while (oldEnd >= oldStart && end >= start) {
                    if (start === end) break
                    o = old[oldStart]
                    ve = vnodes[end]
                    oe = old[oldEnd]
                    v = vnodes[start]
                    if (o == null || ve == null || oe == null || v == null || o.key !== ve.key || oe.key !== v.key) break
                    topSibling = getNextSibling(old, oldStart, oldEnd, nextSibling)
                    moveDOM(parent, oe, topSibling)
                    if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns, isHydrating)
                    if (++start <= --end) moveDOM(parent, o, nextSibling)
                    if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns, isHydrating)
                    if (ve.dom != null) nextSibling = ve.dom
                    oldStart++
                    oldEnd--
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    o = old[oldStart]
                    v = vnodes[start]
                }
                // bottom up once again
                while (oldEnd >= oldStart && end >= start) {
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    if (oe == null || ve == null || oe.key !== ve.key) break
                    if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating)
                    if (ve.dom != null) nextSibling = ve.dom
                    ;(oldEnd--, end--)
                    oe = old[oldEnd]
                    ve = vnodes[end]
                }
                if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
                else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns, isHydrating)
                else {
                    // inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
                    const originalNextSibling = nextSibling
                    let pos = 2147483647,
                        matched = 0
                    // See the note in vnode.ts's normalizeChildren: `Array.from({length: n}, () => -1)`
                    // is ~14x slower than this on V8 (~146ms vs ~10ms for 200k calls at 24 entries),
                    // since it adds a per-element mapper call on top of the slower allocation path.
                    // oxlint-disable-next-line no-new-array
                    const oldIndices = new Array(end - start + 1).fill(-1) as number[]
                    const map = Object.create(null) as Record<string, number>
                    for (let i = start; i <= end; i++) {
                        if (vnodes[i] != null) map[vnodes[i]!.key!] = i
                    }
                    for (let i = oldEnd; i >= oldStart; i--) {
                        oe = old[i]
                        if (oe == null) continue
                        const newIndex = map[oe.key!]
                        if (newIndex != null) {
                            pos = newIndex < pos ? newIndex : -1 // becomes -1 if nodes were re-ordered
                            oldIndices[newIndex - start] = i
                            ve = vnodes[newIndex]
                            old[i] = null
                            if (oe !== ve) updateNode(parent, oe, ve!, hooks, nextSibling, ns, isHydrating)
                            if (ve != null && ve.dom != null) nextSibling = ve.dom
                            matched++
                        }
                    }
                    nextSibling = originalNextSibling
                    if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
                    if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns, isHydrating)
                    else {
                        if (pos === -1) {
                            // the indices of the indices of the items that are part of the
                            // longest increasing subsequence in the oldIndices list
                            const lisIndices = makeLisIndices(oldIndices)
                            let li = lisIndices.length - 1
                            for (let i = end; i >= start; i--) {
                                ve = vnodes[i]
                                if (ve == null) continue
                                if (oldIndices[i - start] === -1) createNode(parent, ve, hooks, ns, nextSibling, isHydrating)
                                else {
                                    if (lisIndices[li] === i - start) li--
                                    else moveDOM(parent, ve, nextSibling)
                                }
                                if (ve.dom != null) nextSibling = ve.dom
                            }
                        } else {
                            for (let i = end; i >= start; i--) {
                                ve = vnodes[i]
                                if (ve == null) continue
                                if (oldIndices[i - start] === -1) createNode(parent, ve, hooks, ns, nextSibling, isHydrating)
                                if (ve.dom != null) nextSibling = ve.dom
                            }
                        }
                    }
                }
            }
        }
    }
    function updateNode(
        parent: Element | DocumentFragment,
        old: RenderVnode,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        nextSibling: Node | null,
        ns: string | undefined,
        isHydrating: boolean = false,
    ) {
        const oldTag = old.tag,
            tag = vnode.tag
        // Key change: different keys mean different logical nodes → remove old, create new.
        // Critical when a component returns a single keyed child (e.g. router resolving to DocLoader).
        if (oldTag === tag && old.is === vnode.is && old.key === vnode.key) {
            vnode.state = old.state
            vnode.events = old.events
            if (shouldNotUpdate(vnode, old)) {
                // The skipped vnode still replaces `old` in the tree, so a later targeted redraw must patch it.
                if (typeof oldTag !== 'string' && vnode.state != null && stateToVnodeMap.has(vnode.state))
                    stateToVnodeMap.set(vnode.state, vnode)
                return
            }
            if (typeof oldTag === 'string') {
                if (vnode.attrs != null) {
                    updateLifecycle(vnode.attrs, vnode, hooks)
                }
                switch (oldTag) {
                    case '#':
                        updateText(old, vnode)
                        break
                    case '<':
                        updateHTML(parent, old, vnode, ns, nextSibling)
                        break
                    case '[':
                        updateFragment(parent, old, vnode, hooks, nextSibling, ns, isHydrating)
                        break
                    default:
                        updateElement(old, vnode, hooks, ns, isHydrating)
                }
            } else updateComponent(parent, old, vnode, hooks, nextSibling, ns, isHydrating)
        } else {
            removeNode(parent, old, vnode) // Pass new vnode for context
            createNode(parent, vnode, hooks, ns, nextSibling, isHydrating)
        }
    }
    function updateText(old: RenderVnode, vnode: RenderVnode) {
        if (old.children!.toString() !== vnode.children!.toString()) {
            old.dom!.nodeValue = vnode.children as string
        }
        vnode.dom = old.dom
    }
    function updateHTML(
        parent: Element | DocumentFragment,
        old: RenderVnode,
        vnode: RenderVnode,
        ns: string | undefined,
        nextSibling: Node | null,
    ) {
        if (old.children !== vnode.children) {
            removeDOM(parent, old)
            createHTML(parent, vnode, ns, nextSibling)
        } else {
            vnode.dom = old.dom
            vnode.domSize = old.domSize
        }
    }
    function updateFragment(
        parent: Element | DocumentFragment,
        old: RenderVnode,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        nextSibling: Node | null,
        ns: string | undefined,
        isHydrating: boolean = false,
    ) {
        updateNodes(parent, old.children as RenderChildren, vnode.children as RenderChildren, hooks, nextSibling, ns, isHydrating)
        let domSize = 0
        const children = vnode.children as RenderChildren | undefined
        vnode.dom = null
        if (children != null) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                if (child != null && child.dom != null) {
                    if (vnode.dom == null) vnode.dom = child.dom
                    domSize += child.domSize || 1
                }
            }
        }
        vnode.domSize = domSize
    }
    function updateElement(
        old: RenderVnode,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        ns: string | undefined,
        isHydrating: boolean = false,
    ) {
        const element = (vnode.dom = old.dom) as Element
        ns = getNameSpace(vnode) || ns

        if (old.attrs != vnode.attrs || (vnode.attrs != null && !cachedAttrsIsStaticMap.get(vnode.attrs))) {
            updateAttrs(vnode as ElementVnode, old.attrs, vnode.attrs, ns)
        }
        if (!maybeSetContentEditable(vnode as ElementVnode)) {
            updateNodes(element, old.children as RenderChildren, vnode.children as RenderChildren, hooks, null, ns, isHydrating)
        }
    }
    function updateComponent(
        parent: Element | DocumentFragment,
        old: RenderVnode,
        vnode: RenderVnode,
        hooks: Array<() => void>,
        nextSibling: Node | null,
        ns: string | undefined,
        isHydrating: boolean = false,
    ) {
        // Track component for signal dependency tracking
        // Store mapping from vnode.state to vnode.tag (component object) for redraw
        if (vnode.state && vnode.tag && !isHydrating) {
            stateToComponentMap.set(vnode.state, vnode.tag as ComponentType)
        }
        // Always track component dependencies for signal tracking (even during hydration)
        // This allows signals to know which components depend on them
        // We only skip oninit during hydration, not signal tracking
        // Only set currentComponent if vnode.state exists (it might be undefined for some component types)
        if (vnode.state != null) {
            // The view registers again what it reads now; a signal only the previous render read
            // shouldn't keep redrawing it.
            resetComponentDependencies(vnode.state)
            setCurrentComponent(vnode.state)
        }
        try {
            vnode.instance = Vnode.normalize(callHook.call(vnode.state!.view, vnode))
        } finally {
            if (vnode.state != null) {
                clearCurrentComponent()
            }
        }
        if (vnode.instance === vnode) throw Error('A view cannot return the vnode it received as argument')
        updateLifecycle(vnode.state!, vnode, hooks)
        if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
        if (vnode.instance != null) {
            if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling, isHydrating)
            else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns, isHydrating)
            vnode.dom = vnode.instance.dom
            vnode.domSize = vnode.instance.domSize

            // Store component's DOM element and vnode info for fine-grained redraw (not during hydration)
            if (vnode.state && vnode.dom && !isHydrating) {
                stateToDomMap.set(vnode.state, vnode.dom)
                stateToVnodeMap.set(vnode.state, vnode)
            }
        } else {
            if (old.instance != null) removeNode(parent, old.instance)
            vnode.domSize = 0
        }
    }
    // Lifted from ivi https://github.com/ivijs/ivi/
    // takes a list of unique numbers (-1 is special and can
    // occur multiple times) and returns an array with the indices
    // of the items that are part of the longest increasing
    // subsequence
    const lisTemp: number[] = []
    // Every index read below is in range: i < a.length, `result` is never empty and holds
    // indices into `a`, and `lisTemp` mirrors `a`'s length.
    function makeLisIndices(a: number[]): number[] {
        const result = [0]
        let u = 0,
            v = 0
        const il = (lisTemp.length = a.length)
        for (let i = 0; i < il; i++) lisTemp[i] = a[i]!
        for (let i = 0; i < il; ++i) {
            if (a[i] === -1) continue
            const j = result[result.length - 1]!
            if (a[j]! < a[i]!) {
                lisTemp[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                // Fast integer average without overflow.

                const c = (u >>> 1) + (v >>> 1) + (u & v & 1)
                if (a[result[c]!]! < a[i]!) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (a[i]! < a[result[u]!]!) {
                if (u > 0) lisTemp[i] = result[u - 1]!
                result[u] = i
            }
        }
        u = result.length
        v = result[u - 1]!
        while (u-- > 0) {
            result[u] = v
            v = lisTemp[v]!
        }
        lisTemp.length = 0
        return result
    }

    function getNextSibling(vnodes: RenderChildren, i: number, end: number, nextSibling: Node | null): Node | null {
        for (; i < end; i++) {
            if (vnodes[i] != null && vnodes[i]!.dom != null) return vnodes[i]!.dom!
        }
        return nextSibling
    }

    // This handles fragments with zombie children (removed from vdom, but persisted in DOM through onbeforeremove)
    function moveDOM(parent: Element | DocumentFragment, vnode: RenderVnode, nextSibling: Node | null) {
        if (vnode.dom != null) {
            let target: Node
            if (vnode.domSize == null || vnode.domSize === 1) {
                // don't allocate for the common case
                target = vnode.dom
            } else {
                target = getDocument(parent).createDocumentFragment()
                for (const dom of domFor(vnode)) target.appendChild(dom)
            }
            insertDOM(parent, target, nextSibling)
        }
    }

    function insertDOM(parent: Element | DocumentFragment, dom: Node, nextSibling: Node | null) {
        if (nextSibling != null) parent.insertBefore(dom, nextSibling)
        else parent.appendChild(dom)
    }

    function maybeSetContentEditable(vnode: ElementVnode): boolean {
        if (
            vnode.attrs == null ||
            (vnode.attrs.contenteditable == null && // attribute
                vnode.attrs.contentEditable == null) // property
        )
            return false
        const children = vnode.children
        if (children != null && children.length === 1 && (children as RenderChildren)[0]!.tag === '<') {
            const content = (children as RenderChildren)[0]!.children as string
            if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
        } else if (children != null && children.length !== 0) throw new Error('Child node of a contenteditable must be trusted.')
        return true
    }

    // remove
    function removeNodes(parent: Element | DocumentFragment, vnodes: RenderChildren, start: number, end: number) {
        for (let i = start; i < end; i++) {
            const vnode = vnodes[i]
            if (vnode != null) removeNode(parent, vnode)
        }
    }
    function tryBlockRemove(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        source: LifecycleSource,
        counter: {v: number},
    ) {
        const original = vnode.state
        const result = callHook.call(source.onbeforeremove, vnode)
        if (result == null) return

        const generation = currentRender
        for (const dom of domFor(vnode)) delayedRemoval.set(dom, generation)
        counter.v++

        void Promise.resolve(result).finally(function () {
            checkState(vnode, original)
            tryResumeRemove(parent, vnode, counter)
        })
    }
    function tryResumeRemove(
        parent: Element | DocumentFragment,
        vnode: RenderVnode,
        counter: {v: number},
        newVnode?: RenderVnode,
    ) {
        if (--counter.v === 0) {
            onremove(vnode)
            removeDOM(parent, vnode, newVnode)
        }
    }
    function removeNode(parent: Element | DocumentFragment, vnode: RenderVnode, newVnode?: RenderVnode) {
        const counter = {v: 1}
        if (typeof vnode.tag !== 'string' && typeof vnode.state!.onbeforeremove === 'function')
            tryBlockRemove(parent, vnode, vnode.state!, counter)
        if (vnode.attrs && typeof vnode.attrs.onbeforeremove === 'function') tryBlockRemove(parent, vnode, vnode.attrs, counter)
        tryResumeRemove(parent, vnode, counter, newVnode)
    }
    function removeDOM(parent: Element | DocumentFragment, vnode: RenderVnode, newVnode?: RenderVnode) {
        if (vnode.dom == null) return
        if (vnode.domSize == null || vnode.domSize === 1) {
            // Check if node is still a child before attempting removal
            const node = vnode.dom
            if (parent.contains && parent.contains(node)) {
                // Verify node is actually a direct or indirect child
                try {
                    parent.removeChild(node)
                } catch (e) {
                    const error = e as Error
                    // Check if node was already removed (not a child anymore)
                    if (!parent.contains || !parent.contains(node)) {
                        // Node already removed, skip silently
                        return
                    }
                    logHydrationError('removeDOM (single node)', vnode, parent instanceof Element ? parent : null, error, {
                        parent: parent instanceof Element ? parent : undefined,
                        node: vnode.dom,
                        oldVnode: vnode,
                        newVnode: newVnode,
                    })
                    // Don't re-throw - we've already logged the error with all details
                    // Re-throwing causes the browser to log the DOMException stack trace
                }
            }
            // Node not in parent, already removed - skip silently
        } else {
            for (const dom of domFor(vnode)) {
                // Check if node is still a child before attempting removal
                if (parent.contains && parent.contains(dom)) {
                    try {
                        parent.removeChild(dom)
                    } catch (e) {
                        const error = e as Error
                        // Check if node was already removed (not a child anymore)
                        if (!parent.contains || !parent.contains(dom)) {
                            // Node already removed, skip silently
                            continue
                        }
                        logHydrationError('removeDOM (multiple nodes)', vnode, parent instanceof Element ? parent : null, error, {
                            parent: parent instanceof Element ? parent : undefined,
                            node: dom,
                            oldVnode: vnode,
                            newVnode: newVnode,
                        })
                        // Don't re-throw - we've already logged the error with all details
                        // Re-throwing causes the browser to log the DOMException stack trace
                    }
                }
                // Node not in parent, already removed - skip silently
            }
        }
    }

    function onremove(vnode: RenderVnode) {
        // Clean up signal dependencies and state maps when component is removed
        if (typeof vnode.tag !== 'string' && vnode.state != null) {
            clearComponentDependencies(vnode.state)
            stateToDomMap.delete(vnode.state)
            stateToComponentMap.delete(vnode.state)
            stateToVnodeMap.delete(vnode.state)
        }
        if (typeof vnode.tag !== 'string' && typeof vnode.state!.onremove === 'function')
            callHook.call(vnode.state!.onremove, vnode)
        if (vnode.attrs && typeof vnode.attrs.onremove === 'function') callHook.call(vnode.attrs.onremove, vnode)
        if (typeof vnode.tag !== 'string') {
            if (vnode.instance != null) onremove(vnode.instance)
        } else {
            if (vnode.events != null) vnode.events._ = null
            const children = vnode.children
            if (Array.isArray(children)) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i]
                    if (child != null) onremove(child)
                }
            }
        }
    }

    // attrs
    function setAttrs(vnode: ElementVnode, attrs: Record<string, unknown>, ns: string | undefined) {
        for (const key in attrs) {
            setAttr(vnode, key, null, attrs[key], ns)
        }
    }
    function setAttr(vnode: ElementVnode, key: string, old: unknown, value: unknown, ns: string | undefined) {
        if (
            key === 'key' ||
            value == null ||
            isLifecycleMethod(key) ||
            (old === value && !isFormAttribute(vnode, key) && typeof value !== 'object')
        )
            return
        if (key[0] === 'o' && key[1] === 'n') return updateEvent(vnode, key, value)
        // The DOM coerces attribute values to strings.
        if (key.slice(0, 6) === 'xlink:') vnode.dom.setAttributeNS('http://www.w3.org/1999/xlink', key.slice(6), value as string)
        else if (key === 'style') updateStyle(vnode.dom, old, value)
        else if (hasPropertyKey(vnode, key, ns)) {
            if (key === 'value') {
                // Only do the coercion if we're actually going to check the value.
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
                if (vnode.tag === 'input' && vnode.attrs!.type === 'file' && '' + value !== '') {
                    console.error('`value` is read-only on file inputs!')
                    return
                }
            }
            // If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
            if (vnode.tag === 'input' && key === 'type') vnode.dom.setAttribute(key, value as string)
            else vnode.dom[key] = value
        } else {
            if (typeof value === 'boolean') {
                if (value) vnode.dom.setAttribute(key, '')
                else vnode.dom.removeAttribute(key)
            } else vnode.dom.setAttribute(key === 'className' ? 'class' : key, value as string)
        }
    }
    function removeAttr(vnode: ElementVnode, key: string, old: unknown, ns: string | undefined) {
        if (key === 'key' || old == null || isLifecycleMethod(key)) return
        if (key[0] === 'o' && key[1] === 'n') updateEvent(vnode, key, undefined)
        else if (key === 'style') updateStyle(vnode.dom, old, null)
        else if (
            hasPropertyKey(vnode, key, ns) &&
            key !== 'className' &&
            key !== 'title' && // creates "null" as title
            !(
                key === 'value' &&
                (vnode.tag === 'option' ||
                    (vnode.tag === 'select' && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement(vnode.dom)))
            ) &&
            !(vnode.tag === 'input' && key === 'type')
        ) {
            vnode.dom[key] = null
        } else {
            const nsLastIndex = key.indexOf(':')
            if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
            if (old !== false) vnode.dom.removeAttribute(key === 'className' ? 'class' : key)
        }
    }
    function setLateSelectAttrs(vnode: ElementVnode, attrs: Record<string, unknown>) {
        if ('value' in attrs) {
            if (attrs.value === null) {
                if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
            } else {
                const normalized = '' + attrs.value
                if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
                    vnode.dom.value = normalized
                }
            }
        }
        if ('selectedIndex' in attrs) setAttr(vnode, 'selectedIndex', null, attrs.selectedIndex, undefined)
    }
    function updateAttrs(
        vnode: ElementVnode,
        old: Record<string, unknown> | null | undefined,
        attrs: Record<string, unknown> | null | undefined,
        ns: string | undefined,
    ) {
        // Some attributes may NOT be case-sensitive (e.g. data-***),
        // so removal should be done first to prevent accidental removal for newly setting values.
        let val: unknown
        if (old != null) {
            if (old === attrs && !cachedAttrsIsStaticMap.has(attrs)) {
                // Diagnostic: log element tag and attrs to identify the source
                console.warn(
                    "Don't reuse attrs object, use new object for every redraw, this will throw in next major",
                    'element:',
                    vnode.tag,
                    'attrs keys:',
                    attrs != null ? Object.keys(attrs) : [],
                    'dom:',
                    vnode.dom,
                )
            }
            for (const key in old) {
                if ((val = old[key]) != null && (attrs == null || attrs[key] == null)) {
                    removeAttr(vnode, key, val, ns)
                }
            }
        }
        if (attrs != null) {
            for (const key in attrs) {
                setAttr(vnode, key, old && old[key], attrs[key], ns)
            }
        }
    }
    function isFormAttribute(vnode: ElementVnode, attr: string): boolean {
        return (
            attr === 'value' ||
            attr === 'checked' ||
            attr === 'selectedIndex' ||
            (attr === 'selected' &&
                (vnode.dom === activeElement(vnode.dom) ||
                    (vnode.tag === 'option' && vnode.dom.parentNode === activeElement(vnode.dom))))
        )
    }
    function isLifecycleMethod(attr: string): boolean {
        return (
            attr === 'oninit' ||
            attr === 'oncreate' ||
            attr === 'onupdate' ||
            attr === 'onremove' ||
            attr === 'onbeforeremove' ||
            attr === 'onbeforeupdate'
        )
    }
    function hasPropertyKey(vnode: ElementVnode, key: string, ns: string | undefined): boolean {
        // Filter out namespaced keys
        return (ns === undefined &&
            // If it's a custom element, just keep it.
            (vnode.tag.indexOf('-') > -1 ||
                vnode.is ||
                // If it's a normal element, let's try to avoid a few browser bugs.
                (key !== 'href' && key !== 'list' && key !== 'form' && key !== 'width' && key !== 'height')) && // && key !== "type"
            // Defer the property check until *after* we check everything.
            key in vnode.dom) as boolean
    }

    // style
    function updateStyle(element: ElementCSSInlineStyle, old: unknown, style: unknown) {
        if (old === style) {
            // Styles are equivalent, do nothing.
        } else if (style == null) {
            // New style is missing, just clear it.
            element.style.cssText = ''
        } else if (typeof style !== 'object') {
            // New style is a string, let engine deal with patching.
            element.style.cssText = style as string
        } else if (old == null || typeof old !== 'object') {
            // `old` is missing or a string, `style` is an object.
            element.style.cssText = ''
            // Add new style properties
            for (const key in style) {
                const value = (style as StyleObject)[key]
                if (value != null) {
                    if (key.includes('-')) element.style.setProperty(key, String(value))
                    else (element.style as StyleProperties)[key] = String(value)
                }
            }
        } else {
            // Both old & new are (different) objects.
            // Remove style properties that no longer exist
            // Style properties may have two cases(dash-case and camelCase),
            // so removal should be done first to prevent accidental removal for newly setting values.
            for (const key in old) {
                if ((old as StyleObject)[key] != null && (style as StyleObject)[key] == null) {
                    if (key.includes('-')) element.style.removeProperty(key)
                    else (element.style as StyleProperties)[key] = ''
                }
            }
            // Update style properties that have changed
            for (const key in style) {
                let value = (style as StyleObject)[key]
                if (value != null && (value = String(value)) !== String((old as StyleObject)[key])) {
                    if (key.includes('-')) element.style.setProperty(key, value as string)
                    else (element.style as StyleProperties)[key] = value as string
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
    function EventDict(this: EventDict) {
        // Save this, so the current redraw is correctly tracked.
        this._ = currentRedraw
    }
    EventDict.prototype = Object.create(null) as EventDict
    EventDict.prototype.handleEvent = function (this: EventDict, ev: Event & {redraw?: boolean}) {
        const handler: unknown = this['on' + ev.type]
        let result: unknown
        if (typeof handler === 'function') result = handler.call(ev.currentTarget, ev)
        else if (typeof (handler as EventListenerObject).handleEvent === 'function')
            (handler as EventListenerObject).handleEvent(ev)
        const self = this
        if (self._ != null) {
            if (ev.redraw !== false) (0, self._)()
            if (result != null && typeof (result as PromiseLike<unknown>).then === 'function') {
                void Promise.resolve(result).then(function () {
                    if (self._ != null && ev.redraw !== false) (0, self._)()
                })
            }
        }
        if (result === false) {
            ev.preventDefault()
            ev.stopPropagation()
        }
    }

    // event
    function updateEvent(vnode: ElementVnode, key: string, value: unknown) {
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
            vnode.events = new (EventDict as unknown as new () => EventDict)()
            vnode.dom.addEventListener(key.slice(2), vnode.events, false)
            vnode.events[key] = value
        }
    }

    // lifecycle
    function initLifecycle(source: LifecycleSource, vnode: RenderVnode, hooks: Array<() => void>, isHydrating: boolean = false) {
        // Always call oninit, but pass context so components can make intelligent decisions
        // Components can check context.isSSR or context.isHydrating to conditionally load data
        if (typeof source.oninit === 'function') {
            const context = {
                isSSR: false,
                isHydrating: isHydrating,
            }
            const result = callHook.call(source.oninit, vnode, context)
            // Auto-redraw when async oninit completes (client-side only).
            // Capture currentRedraw now — the closure variable is cleared in
            // render()'s finally block before the microtask fires.
            if (result != null && typeof (result as PromiseLike<unknown>).then === 'function' && currentRedraw != null) {
                const capturedRedraw = currentRedraw
                void Promise.resolve(result).then(function () {
                    capturedRedraw()
                })
            }
        }
        if (typeof source.oncreate === 'function') hooks.push(callHook.bind(source.oncreate, vnode))
    }
    function updateLifecycle(source: LifecycleSource, vnode: RenderVnode, hooks: Array<() => void>) {
        if (typeof source.onupdate === 'function') hooks.push(callHook.bind(source.onupdate, vnode))
    }
    function shouldNotUpdate(vnode: RenderVnode, old: RenderVnode): boolean {
        updateCheck: {
            if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === 'function') {
                const force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
                if (force !== undefined && !force) break updateCheck
            }
            if (typeof vnode.tag !== 'string' && typeof vnode.state!.onbeforeupdate === 'function') {
                const force = callHook.call(vnode.state!.onbeforeupdate, vnode, old)
                if (force !== undefined && !force) break updateCheck
            }
            return false
        }
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

    let currentDOM: Element | null = null

    /** An element vnode, whose DOM node an update with the same tag, key and `is` keeps. */
    function isElementVnode(vnode: RenderVnode | null | undefined): vnode is RenderVnode & {tag: string} {
        if (vnode == null || typeof vnode.tag !== 'string') return false
        return vnode.tag !== '#' && vnode.tag !== '[' && vnode.tag !== '<'
    }

    /**
     * Re-renders one mounted component where it stands, without diffing anything above it. Only a
     * view that returned and returns again the same element qualifies: its DOM node is then kept, so
     * the parent and ancestor vnodes that hold that node stay valid. Returns false when the component
     * does not qualify, after its view may already have run, so the caller falls back to a full redraw.
     */
    function renderComponent(vnode: RenderVnode, redraw?: () => void): boolean {
        const state = vnode.state
        const old = vnode.instance
        if (state == null || currentDOM != null || !isElementVnode(old)) return false
        const element = old.dom as Element | null | undefined
        const parent = element?.parentNode as Element | DocumentFragment | null | undefined
        if (element == null || parent == null || !element.isConnected) return false

        const prevRedraw = currentRedraw
        const hooks: Array<() => void> = []
        const active = activeElement(element)
        currentDOM = element
        currentRedraw = redraw
        currentRender = {}
        try {
            resetComponentDependencies(state)
            setCurrentComponent(state)
            let instance: RenderVnode | null
            try {
                instance = Vnode.normalize(callHook.call(state.view, vnode))
            } finally {
                clearCurrentComponent()
            }
            if (instance === vnode) throw Error('A view cannot return the vnode it received as argument')
            if (!isElementVnode(instance) || instance.tag !== old.tag || instance.key !== old.key || instance.is !== old.is) {
                return false
            }
            vnode.instance = instance
            updateLifecycle(state, vnode, hooks)
            if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
            const ns = element.namespaceURI === 'http://www.w3.org/1999/xhtml' ? undefined : (element.namespaceURI ?? undefined)
            updateNode(parent, old, instance, hooks, null, ns)
        } finally {
            currentRedraw = prevRedraw
            currentDOM = null
        }
        if (active != null && activeElement(element) !== active && typeof (active as HTMLElement).focus === 'function')
            (active as HTMLElement).focus()
        for (let i = 0; i < hooks.length; i++) hooks[i]!()
        return true
    }

    function render(dom: Element, vnodes: Children | VnodeType | null, redraw?: () => void) {
        if (!dom) throw new TypeError('DOM element being rendered to does not exist.')
        if (currentDOM != null && dom.contains(currentDOM)) {
            throw new TypeError('Node is currently being rendered to and thus is locked.')
        }
        const prevRedraw = currentRedraw
        const prevDOM = currentDOM
        const hooks: Array<() => void> = []
        const active = activeElement(dom)
        const namespace = dom.namespaceURI

        currentDOM = dom
        currentRedraw = typeof redraw === 'function' ? redraw : undefined
        currentRender = {}
        // Reset hydration error counter at start of each render cycle
        resetHydrationErrorCount()
        try {
            // Detect hydration: DOM has children but no vnodes tracked
            // Only check children for Element nodes (DocumentFragment doesn't have children property)
            let isHydrating =
                (dom as RenderRoot).vnodes == null &&
                dom.nodeType === 1 && // Element node
                'children' in dom &&
                dom.children.length > 0

            // First time rendering into a node clears it out (unless hydrating)
            if (!isHydrating && (dom as RenderRoot).vnodes == null) dom.textContent = ''
            const normalized = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
            updateNodes(
                dom,
                (dom as RenderRoot).vnodes,
                normalized,
                hooks,
                null,
                (namespace === 'http://www.w3.org/1999/xhtml' ? undefined : namespace) as string | undefined,
                isHydrating,
            )

            ;(dom as RenderRoot).vnodes = normalized
            // `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
            if (active != null && activeElement(dom) !== active && typeof (active as HTMLElement).focus === 'function')
                (active as HTMLElement).focus()
            for (let i = 0; i < hooks.length; i++) hooks[i]!()
        } finally {
            currentRedraw = prevRedraw
            currentDOM = prevDOM
        }
    }

    return Object.assign(render, {component: renderComponent})
}
