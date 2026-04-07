// SSR and hydration utilities

import {logger} from '../server/logger'

// Development-only hydration debugging
export const HYDRATION_DEBUG = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

// Throttle hydration error logging to avoid performance issues
let hydrationErrorCount = 0
const MAX_HYDRATION_ERRORS = 10 // Limit number of errors logged per render cycle

export interface HydrationMismatchSummary {
    kind: 'unmatched_dom_child_removed' | 'remove_child_failed'
    parentDom: string
    parentVnode: string
    removed: string
}

const hydrationMismatchSummaries: HydrationMismatchSummary[] = []
const MAX_HYDRATION_MISMATCH_SUMMARIES = 32

// Reset error count at the start of each render cycle
export function resetHydrationErrorCount(): void {
    hydrationErrorCount = 0
    hydrationMismatchSummaries.length = 0
}

export function getComponentName(vnode: any): string {
    if (!vnode) return 'Unknown'
    if (typeof vnode.tag === 'string') return vnode.tag
    if (vnode.tag?.name) return vnode.tag.name
    if (vnode.tag?.displayName) return vnode.tag.displayName
    if (vnode.state?.constructor?.name) return vnode.state.constructor.name
    return 'Unknown'
}

// Format a DOM element as an opening tag string
function formatDOMElement(el: Element): {tagName: string; openTag: string; closeTag: string} {
    const tagName = el.tagName.toLowerCase()
    let openTag = `<${tagName}`

    // Add important attributes
    if (el.id) {
        openTag += ` id="${el.id}"`
    }
    if (el.className && typeof el.className === 'string') {
        const classes = el.className
            .split(' ')
            .filter((c) => c)
            .slice(0, 3)
            .join(' ')
        if (classes) {
            openTag += ` className="${classes}${el.className.split(' ').length > 3 ? '...' : ''}"`
        }
    }

    openTag += '>'
    return {tagName, openTag, closeTag: `</${tagName}>`}
}

export function formatVDOMTree(
    vnode: any,
    maxDepth: number = 6,
    currentDepth: number = 0,
    showComponentInstance: boolean = true,
): string {
    if (!vnode || currentDepth >= maxDepth) return ''

    const indent = '  '.repeat(currentDepth)

    // Handle text nodes
    if (vnode.tag === '#') {
        const text = String(vnode.children || vnode.text || '').substring(0, 50)
        return `${indent}"${text}${String(vnode.children || vnode.text || '').length > 50 ? '...' : ''}"`
    }

    // Handle fragments
    if (vnode.tag === '[') {
        if (!vnode.children || !Array.isArray(vnode.children) || vnode.children.length === 0) {
            return `${indent}[fragment]`
        }
        const validChildren = vnode.children.filter((c: any) => c != null).slice(0, 8)
        let result = `${indent}[fragment]\n`
        for (const child of validChildren) {
            result += formatVDOMTree(child, maxDepth, currentDepth + 1, showComponentInstance) + '\n'
        }
        if (vnode.children.filter((c: any) => c != null).length > 8) {
            result += `${indent}  ... (${vnode.children.filter((c: any) => c != null).length - 8} more)\n`
        }
        return result.trimEnd()
    }

    const isComponent = typeof vnode.tag !== 'string'
    const tagName = isComponent ? getComponentName(vnode) : vnode.tag

    let result = `${indent}<${tagName}`

    // Add key if present
    if (vnode.attrs?.key) {
        result += ` key="${vnode.attrs.key}"`
    }

    // Add a few important attributes for debugging
    if (vnode.attrs) {
        const importantAttrs = ['id', 'class', 'className']
        for (const attr of importantAttrs) {
            if (vnode.attrs[attr]) {
                const value = typeof vnode.attrs[attr] === 'string' ? vnode.attrs[attr] : String(vnode.attrs[attr])
                result += ` ${attr}="${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"`
                break // Only show first important attr to keep it concise
            }
        }
    }

    result += '>'

    // For components, show their rendered instance (what the component actually renders)
    // This gives us parent context without performance cost
    if (isComponent && showComponentInstance && vnode.instance && currentDepth < maxDepth - 1) {
        const instanceTree = formatVDOMTree(vnode.instance, maxDepth, currentDepth + 1, showComponentInstance)
        if (instanceTree) {
            result += '\n' + instanceTree
        }
    }

    // Add children
    if (vnode.children && Array.isArray(vnode.children) && currentDepth < maxDepth - 1) {
        const validChildren = vnode.children.filter((c: any) => c != null).slice(0, 10)
        if (validChildren.length > 0) {
            result += '\n'
            for (const child of validChildren) {
                if (typeof child === 'string' || typeof child === 'number') {
                    const text = String(child).substring(0, 50)
                    result += `${indent}  "${text}${String(child).length > 50 ? '...' : ''}"\n`
                } else {
                    const childTree = formatVDOMTree(child, maxDepth, currentDepth + 1, showComponentInstance)
                    if (childTree) {
                        result += childTree + '\n'
                    }
                }
            }
            if (vnode.children.filter((c: any) => c != null).length > 10) {
                result += `${indent}  ... (${vnode.children.filter((c: any) => c != null).length - 10} more children)\n`
            }
        }
    } else if (vnode.text != null) {
        const text = String(vnode.text).substring(0, 50)
        result += ` "${text}${String(vnode.text).length > 50 ? '...' : ''}"`
    }

    result += `${indent}</${tagName}>`

    return result
}

// Combine DOM parent chain with VDOM structure into a single HTML-like tree
function formatCombinedStructure(parent: Element | Node | null, vnode: any, maxParents: number = 4): string {
    if (!parent && !vnode) return ''

    // Collect DOM parents (from outermost to innermost)
    const domElements: {openTag: string; closeTag: string}[] = []
    let current: Node | null = parent
    let depth = 0

    while (current && depth < maxParents) {
        if (current.nodeType === 1) {
            // Element node
            const el = current as Element
            // Skip html and body tags - they're not useful context
            if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                domElements.unshift(formatDOMElement(el))
            }
        }
        current = current.parentElement || current.parentNode
        depth++
    }

    // Build the combined output
    const lines: string[] = []

    // Opening tags for DOM parents
    domElements.forEach((el, i) => {
        lines.push('  '.repeat(i) + el.openTag)
    })

    // VDOM structure (indented inside the DOM parents)
    if (vnode) {
        const vdomIndent = domElements.length
        const vdomTree = formatVDOMTree(vnode, 4, 0, true)
        if (vdomTree) {
            // Indent each line of the VDOM tree
            const vdomLines = vdomTree.split('\n')
            vdomLines.forEach((line) => {
                lines.push('  '.repeat(vdomIndent) + line)
            })
        }
    }

    // Closing tags for DOM parents (in reverse order)
    for (let i = domElements.length - 1; i >= 0; i--) {
        lines.push('  '.repeat(i) + domElements[i].closeTag)
    }

    return lines.join('\n')
}

function buildComponentPath(vnode: any, context?: {oldVnode?: any; newVnode?: any}): string[] {
    const path: string[] = []

    const traverseVnode = (v: any, depth: number = 0): boolean => {
        if (!v || depth > 10) return false

        const name = getComponentName(v)
        const isComponent =
            typeof v.tag !== 'string' && name !== 'Unknown' && name !== 'Component' && name !== 'AnonymousComponent'

        if (isComponent) {
            path.push(name)
        }

        if (v.instance && depth < 2) {
            if (traverseVnode(v.instance, depth + 1)) return true
        }

        if (v.children && Array.isArray(v.children) && depth < 2) {
            for (let i = 0; i < Math.min(v.children.length, 3); i++) {
                const child = v.children[i]
                if (child && traverseVnode(child, depth + 1)) return true
            }
        }

        return false
    }

    if (context?.newVnode) {
        traverseVnode(context.newVnode)
        if (path.length > 0) return path
    }
    if (context?.oldVnode) {
        traverseVnode(context.oldVnode)
        if (path.length > 0) return path
    }

    if (vnode) {
        traverseVnode(vnode)
    }

    return path
}

/** Short label for a DOM node during hydration debug (tag, text preview, or node type). */
export function describeHydrationDomNode(node: Node, textPreviewMax = 80): string {
    if (node.nodeType === 3) {
        const raw = (node as Text).nodeValue ?? ''
        const normalized = raw.replace(/\s+/g, ' ').trim()
        const excerpt = normalized.length > textPreviewMax ? `${normalized.slice(0, textPreviewMax)}…` : normalized
        return `text "${excerpt}"`
    }
    if (node.nodeType === 1) {
        const el = node as Element
        const tag = el.tagName.toLowerCase()
        const id = el.id ? `#${el.id}` : ''
        let cls = ''
        if (el.className && typeof el.className === 'string') {
            const parts = el.className.split(/\s+/).filter(Boolean).slice(0, 4)
            if (parts.length) cls = `.${parts.join('.')}`
        }
        return `<${tag}${id}${cls}>`
    }
    if (node.nodeType === 8) {
        const c = (node as Comment).data?.replace(/\s+/g, ' ').trim() ?? ''
        const excerpt = c.length > textPreviewMax ? `${c.slice(0, textPreviewMax)}…` : c
        return `comment "${excerpt}"`
    }
    return `${node.nodeName}[nodeType=${node.nodeType}]`
}

/** Opening-tag style summary for a parent element (hydration debug). */
export function describeHydrationParentElement(el: Element): string {
    const {openTag} = formatDOMElement(el)
    return openTag
}

export function recordHydrationMismatchSummary(
    kind: HydrationMismatchSummary['kind'],
    parentVnode: any,
    parentEl: Element,
    removed: Node,
    updateStats: boolean,
): void {
    if (updateStats) {
        updateHydrationStats(parentVnode)
    }
    if (hydrationMismatchSummaries.length >= MAX_HYDRATION_MISMATCH_SUMMARIES) {
        return
    }
    hydrationMismatchSummaries.push({
        kind,
        parentDom: describeHydrationParentElement(parentEl),
        parentVnode: formatComponentHierarchy(parentVnode),
        removed: describeHydrationDomNode(removed),
    })
}

/** Returns buffered mismatch summaries from the current render and clears the buffer. */
export function takeHydrationMismatchSummaries(): HydrationMismatchSummary[] {
    const out = hydrationMismatchSummaries.slice()
    hydrationMismatchSummaries.length = 0
    return out
}

export function formatComponentHierarchy(vnode: any, context?: {oldVnode?: any; newVnode?: any}): string {
    if (!vnode) return 'Unknown'

    const path = buildComponentPath(vnode, context)
    const immediateName = getComponentName(vnode)
    const isElement = typeof vnode.tag === 'string'

    if (path.length > 0) {
        const pathStr = path.join(' → ')
        if (isElement && immediateName !== path[path.length - 1]) {
            return `${immediateName} in ${pathStr}`
        } else {
            return pathStr
        }
    }

    return immediateName
}

export interface HydrationErrorContext {
    parent?: Element
    node?: Node
    matchedNodes?: Set<Node>
    oldVnode?: any
    newVnode?: any
}

export function logHydrationError(
    operation: string,
    vnode: any,
    _element: Element | null,
    error: Error,
    context?: HydrationErrorContext,
): void {
    // Update hydration statistics
    updateHydrationStats(vnode)

    // Throttle error logging to avoid performance issues
    hydrationErrorCount++
    if (hydrationErrorCount > MAX_HYDRATION_ERRORS) {
        if (hydrationErrorCount === MAX_HYDRATION_ERRORS + 1) {
            const topComponents = Array.from(hydrationStats.componentMismatches.entries())
                .toSorted((a: [string, number], b: [string, number]) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]: [string, number]) => `${name}: ${count}`)
                .join(', ')

            logger.warn(
                `hydration errors throttled: more than ${MAX_HYDRATION_ERRORS} errors detected. suppressing further logs to improve performance.`,
                {
                    totalMismatches: hydrationStats.totalMismatches,
                    topComponents: topComponents || 'none',
                },
            )
        }
        return
    }

    // Build user-friendly component hierarchy
    const componentHierarchy = formatComponentHierarchy(vnode, context)

    // Log hydration error with structured context
    const logContext: Record<string, any> = {
        componentPath: componentHierarchy,
        operation,
    }

    if (context?.node) {
        logContext.affectedNode = context.node.nodeType === 1 ? `${(context.node as Element).tagName.toLowerCase()}` : 'text'
    }

    // Include structure info in debug mode
    if (HYDRATION_DEBUG) {
        const vnodeToShow = context?.oldVnode || vnode || context?.newVnode
        try {
            const combinedStructure = formatCombinedStructure(context?.parent || null, vnodeToShow, 4)
            if (combinedStructure) {
                logContext.structure = combinedStructure
            }
        } catch (_e) {
            // Fallback: try to show at least the VDOM structure
            if (vnodeToShow) {
                try {
                    const vdomTree = formatVDOMTree(vnodeToShow, 4, 0, true)
                    if (vdomTree) {
                        logContext.vdomStructure = vdomTree
                    }
                } catch (_e2) {
                    logContext.component = getComponentName(vnodeToShow)
                }
            }
        }

        // Show what's being removed vs what's replacing it (if both exist)
        if (context?.oldVnode && context?.newVnode) {
            try {
                const oldTree = formatVDOMTree(context.oldVnode, 3)
                const newTree = formatVDOMTree(context.newVnode, 3)
                if (oldTree) logContext.removing = oldTree
                if (newTree) logContext.replacingWith = newTree
            } catch (_e) {
                // Silently fail if formatting doesn't work
            }
        }
    }

    if (operation.includes('removeChild') || operation.includes('removeDOM')) {
        logContext.handledGracefully = true
    }

    logger.error(`hydration error: ${operation}`, error, logContext)
}

// Track hydration statistics for debugging
interface HydrationStats {
    totalMismatches: number
    componentMismatches: Map<string, number>
    lastMismatchTime: number
}

let hydrationStats: HydrationStats = {
    totalMismatches: 0,
    componentMismatches: new Map(),
    lastMismatchTime: 0,
}

export function getHydrationStats(): HydrationStats {
    return {...hydrationStats, componentMismatches: new Map(hydrationStats.componentMismatches)}
}

export function resetHydrationStats(): void {
    hydrationStats = {
        totalMismatches: 0,
        componentMismatches: new Map(),
        lastMismatchTime: 0,
    }
}

// Update stats when hydration error occurs
function updateHydrationStats(vnode: any): void {
    hydrationStats.totalMismatches++
    hydrationStats.lastMismatchTime = Date.now()
    const componentName = getComponentName(vnode)
    const currentCount = hydrationStats.componentMismatches.get(componentName) || 0
    hydrationStats.componentMismatches.set(componentName, currentCount + 1)
}
