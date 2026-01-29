import {setCurrentComponent, clearCurrentComponent} from '../signal'

import {serializeAllStates} from './ssrState'
import Vnode from './vnode'

import type {Vnode as VnodeType, Children} from '../index'

// Void elements that don't have closing tags
const VOID_ELEMENTS = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
	'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
])

export interface RenderToStringOptions {
	escapeAttribute?: (value: any) => string
	escapeText?: (value: any) => string
	strict?: boolean // Close all empty tags
	xml?: boolean // XML mode (implies strict)
}

// Default escape functions
function escapeAttributeDefault(value: any): string {
	const str = String(value)
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

function escapeTextDefault(value: any): string {
	const str = String(value)
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

function isVoidElement(tag: string): boolean {
	return VOID_ELEMENTS.has(tag.toLowerCase())
}

// Promise tracker for async data fetching
class PromiseTracker {
	private promises: Promise<any>[] = []

	waitFor(promise: Promise<any>) {
		this.promises.push(promise)
	}

	async waitAll(): Promise<void> {
		if (this.promises.length > 0) {
			await Promise.all(this.promises)
			this.promises = []
		}
	}

	hasPromises(): boolean {
		return this.promises.length > 0
	}

	reset() {
		this.promises = []
	}
}

// Serialize attributes to HTML string
function serializeAttributes(
	attrs: Record<string, any> | null | undefined,
	options: Required<RenderToStringOptions>,
): string {
	if (!attrs) return ''
	
	const parts: string[] = []
	
	for (const key in attrs) {
		const value = attrs[key]
		
		// Skip lifecycle hooks and special attributes
		if (
			key === 'key' ||
			key === 'oninit' ||
			key === 'oncreate' ||
			key === 'onupdate' ||
			key === 'onremove' ||
			key === 'onbeforeremove' ||
			key === 'onbeforeupdate' ||
			key.startsWith('on') && typeof value === 'function'
		) {
			continue
		}
		
		if (value == null) continue
		
		// Handle className -> class
		const attrName = key === 'className' ? 'class' : key
		
		if (typeof value === 'boolean') {
			if (value) {
				parts.push(attrName)
			}
		} else if (typeof value === 'object') {
			// Handle style objects
			if (key === 'style') {
				const styleStr = Object.entries(value)
					.map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
					.join('; ')
				parts.push(`${attrName}="${options.escapeAttribute(styleStr)}"`)
			} else {
				// For other objects, stringify
				parts.push(`${attrName}="${options.escapeAttribute(JSON.stringify(value))}"`)
			}
		} else {
			parts.push(`${attrName}="${options.escapeAttribute(value)}"`)
		}
	}
	
	return parts.length > 0 ? ' ' + parts.join(' ') : ''
}

// Serialize text node
function serializeText(
	text: string | number,
	options: Required<RenderToStringOptions>,
): string {
	return options.escapeText(text)
}

// Serialize component (sync version - no async handling)
function serializeComponentSync(
	vnode: VnodeType,
	options: Required<RenderToStringOptions>,
	promiseTracker: PromiseTracker,
): string {
	const component = vnode.tag as any
	
	// Initialize component state
	let state: any
	let view: ((vnode: any) => any) | undefined
	
	if (typeof component.view === 'function') {
		// Component object
		state = Object.create(component)
		view = state.view
	} else {
		// Component factory/class
		if (component.prototype && typeof component.prototype.view === 'function') {
			state = new component(vnode)
		} else {
			state = component(vnode)
		}
		view = state.view
	}
	
	if (!view) {
		return ''
	}
	
	vnode.state = state
	
	// Call oninit with context (sync mode - don't await)
	if (typeof state.oninit === 'function') {
		try {
			const context = {
				isSSR: true,
				isHydrating: false,
			}
			// Call oninit but don't wait for it (sync mode)
			state.oninit(vnode, context)
		} catch(_e) {
			// Ignore errors
		}
	}
	
	// Call view (bind this to state)
	const instance = Vnode.normalize(view.call(state, vnode))
	if (instance === vnode) {
		throw Error('A view cannot return the vnode it received as argument')
	}
	
	vnode.instance = instance
	
	// Serialize the instance
	if (instance != null) {
		return serializeNodeSync(instance, options, promiseTracker)
	}
	
	return ''
}

// Serialize a single vnode to HTML string (sync version)
function serializeNodeSync(
	vnode: VnodeType | null,
	options: Required<RenderToStringOptions>,
	promiseTracker: PromiseTracker,
): string {
	if (vnode == null) return ''
	
	const tag = vnode.tag
	
	// Text node
	if (tag === '#') {
		return serializeText(vnode.children as string | number, options)
	}
	
	// HTML/trust node
	if (tag === '<') {
		return vnode.children as string
	}
	
	// Fragment
	if (tag === '[') {
		const children = vnode.children as (VnodeType | null)[]
		if (!children) return ''
		return children
			.map(child => serializeNodeSync(child, options, promiseTracker))
			.join('')
	}
	
	// Component
	if (typeof tag !== 'string') {
		return serializeComponentSync(vnode, options, promiseTracker)
	}
	
	// Element
	const attrs = serializeAttributes(vnode.attrs, options)
	const children = vnode.children as Children
	
	let html = `<${tag}${attrs}`
	
	const isVoid = isVoidElement(tag)
	const shouldSelfClose = (options.strict || options.xml) && isVoid
	
	if (shouldSelfClose) {
		html += options.xml ? ' />' : '>'
		return html
	}
	
	html += '>'
	
	// Serialize children
	if (children != null) {
		if (Array.isArray(children)) {
			html += children
				.map(child => serializeNodeSync(child as VnodeType | null, options, promiseTracker))
				.join('')
		} else if (typeof children === 'string' || typeof children === 'number') {
			html += serializeText(children, options)
		} else if (children != null) {
			html += serializeNodeSync(children as unknown as VnodeType, options, promiseTracker)
		}
	}
	
	// Always close non-void elements
	if (!isVoid) {
		html += `</${tag}>`
	}
	
	return html
}

// Serialize a single vnode to HTML string
async function serializeNode(
	vnode: VnodeType | null,
	options: Required<RenderToStringOptions>,
	promiseTracker: PromiseTracker,
	isServer: boolean,
): Promise<string> {
	if (vnode == null) {
		if (isServer) {
			console.log(`[serializeNode] vnode is null, returning empty string`)
		}
		return ''
	}
	
	const tag = vnode.tag
	if (isServer && typeof tag !== 'string' && tag !== '#' && tag !== '<' && tag !== '[') {
		console.log(`[serializeNode] Processing vnode with tag type:`, typeof tag === 'function' ? 'function' : (typeof tag === 'object' ? 'object' : String(tag)))
	}
	
	// Text node
	if (tag === '#') {
		return serializeText(vnode.children as string | number, options)
	}
	
	// HTML/trust node
	if (tag === '<') {
		return vnode.children as string
	}
	
	// Fragment
	if (tag === '[') {
		const children = vnode.children as (VnodeType | null)[]
		if (isServer) {
			console.log(`[serializeNode] Fragment detected, children type: ${Array.isArray(children) ? 'array' : typeof children}, length: ${Array.isArray(children) ? children.length : 'N/A'}`)
			if (Array.isArray(children)) {
				console.log(`[serializeNode] Fragment children array:`, children.map((c, i) => 
					c ? (typeof c.tag === 'string' ? `${i}:${c.tag}` : `${i}:component`) : `${i}:null`
				).join(', '))
			}
		}
		if (!children) {
			if (isServer) {
				console.log(`[serializeNode] Fragment has no children (null/undefined), returning empty string`)
			}
			return ''
		}
		if (!Array.isArray(children)) {
			if (isServer) {
				console.log(`[serializeNode] Fragment children is not an array (type: ${typeof children}), treating as single child`)
			}
			// If children is not an array, treat it as a single child
			const result = await serializeNode(children as VnodeType, options, promiseTracker, isServer)
			if (isServer) {
				console.log(`[serializeNode] Fragment single child serialized, length: ${result.length}`)
			}
			return result
		}
		const results = await Promise.all(
			children.map((child, idx) => {
				if (isServer) {
					console.log(`[serializeNode] Fragment child ${idx}:`, child ? (typeof child.tag === 'string' ? `element:${child.tag}` : (typeof child.tag === 'function' ? 'component-function' : 'component-object')) : 'null')
				}
				return serializeNode(child, options, promiseTracker, isServer)
			}),
		)
		const joined = results.join('')
		if (isServer) {
			console.log(`[serializeNode] Fragment serialized, ${children.length} children -> ${joined.length} chars`)
			if (joined.length === 0) {
				console.log(`[serializeNode] WARNING: Fragment serialized to empty string despite having ${children.length} children!`)
			}
		}
		return joined
	}
	
	// Component
	if (typeof tag !== 'string') {
		if (isServer) {
			console.log(`[serializeNode] Component vnode, tag type:`, typeof tag === 'function' ? 'function' : (typeof tag === 'object' && tag !== null ? 'object' : String(tag)))
		}
		return await serializeComponent(vnode, options, promiseTracker, isServer)
	}
	
	// Element
	const attrs = serializeAttributes(vnode.attrs, options)
	const children = vnode.children as Children
	
	if (isServer) {
		console.log(`[serializeNode] Element: ${tag}, has children:`, children != null, 
			Array.isArray(children) ? `array[${children.length}]` : 
			(typeof children === 'string' ? `string[${children.length}]` : 
			(typeof children === 'object' ? 'object' : 'null')))
	}
	
	let html = `<${tag}${attrs}`
	
	const isVoid = isVoidElement(tag)
	const shouldSelfClose = (options.strict || options.xml) && isVoid
	
	if (shouldSelfClose) {
		html += options.xml ? ' />' : '>'
		return html
	}
	
	html += '>'
	
	// Serialize children
	if (children != null) {
		if (Array.isArray(children)) {
			if (isServer) {
				console.log(`[serializeNode] Element ${tag} has array children, serializing ${children.length} items`)
			}
			const results = await Promise.all(
				children.map((child, idx) => {
					if (isServer) {
						console.log(`[serializeNode] Element ${tag} child ${idx}:`, child ? (typeof child === 'string' ? 'string' : (typeof (child as any)?.tag === 'string' ? `element:${(child as any).tag}` : 'component')) : 'null')
					}
					return serializeNode(child as VnodeType | null, options, promiseTracker, isServer)
				}),
			)
			const childrenHtml = results.join('')
			if (isServer) {
				console.log(`[serializeNode] Element ${tag} children serialized, length: ${childrenHtml.length}`)
			}
			html += childrenHtml
		} else if (typeof children === 'string' || typeof children === 'number') {
			html += serializeText(children, options)
		} else if (children != null) {
			html += await serializeNode(children as unknown as VnodeType, options, promiseTracker, isServer)
		}
	}
	
	// Always close non-void elements
	if (!isVoid) {
		html += `</${tag}>`
	}
	
	if (isServer) {
		console.log(`[serializeNode] Element ${tag} serialized, total length: ${html.length}`)
	}
	
	return html
}

// Serialize component
async function serializeComponent(
	vnode: VnodeType,
	options: Required<RenderToStringOptions>,
	promiseTracker: PromiseTracker,
	isServer: boolean,
): Promise<string> {
	const component = vnode.tag as any
	
	// Initialize component state
	let state: any
	let view: ((vnode: any) => any) | undefined
	
	if (typeof component.view === 'function') {
		// Component object
		state = Object.create(component)
		view = state.view
	} else {
		// Component factory/class
		if (component.prototype && typeof component.prototype.view === 'function') {
			state = new component(vnode)
		} else {
			state = component(vnode)
		}
		view = state.view
	}
	
	if (!view) {
		return ''
	}
	
	vnode.state = state
	
	// Set current component for signal tracking (needed for store access during SSR)
	// This ensures store properties can track component dependencies correctly
	setCurrentComponent(state)
	
	let instance: any
	try {
		// Call oninit with context if on server
		if (isServer && typeof state.oninit === 'function') {
			const context = {
				isSSR: true,
				isHydrating: false,
			}
			try {
				const result = state.oninit(vnode, context)
				// If oninit returns a promise, await it
				if (result && typeof result.then === 'function') {
					await result
				}
			} catch(_e) {
				// Ignore errors in oninit for now
			}
		}
	
		// Call view (bind this to state)
		const viewResult = view.call(state, vnode)
		if (isServer) {
			const componentName = component.name || (component.constructor?.name) || (typeof component === 'function' ? component.name : 'Unknown')
			console.log(`[renderToString] Component ${componentName} view returned:`, 
				Array.isArray(viewResult) ? `array[${viewResult.length}]` : 
				(viewResult?.tag === '[' ? 'fragment' : 
				(typeof viewResult?.tag === 'string' ? `element:${viewResult.tag}` : 
				(typeof viewResult?.tag === 'function' ? 'component' : 
				(typeof viewResult === 'object' && viewResult !== null ? 'object' : String(viewResult))))))
		}
		
		instance = Vnode.normalize(viewResult)
		if (instance === vnode) {
			throw Error('A view cannot return the vnode it received as argument')
		}
		
		// Debug logging for SSR
		if (isServer) {
			const componentName = component.name || (component.constructor?.name) || (typeof component === 'function' ? component.name : 'Unknown')
			const instanceType = Array.isArray(instance) ? 'array (NOT NORMALIZED!)' : (instance?.tag === '[' ? 'fragment' : (typeof instance?.tag === 'string' ? `element:${instance.tag}` : (instance?.tag ? 'component' : 'null')))
			console.log(`[renderToString] Component ${componentName} normalized, instance type: ${instanceType}`, 
				Array.isArray(instance) ? `array length: ${instance.length} - WARNING: Array not normalized!` : 
				(instance?.tag === '[' ? `fragment children: ${(instance.children as any[])?.length || 0}, children type: ${Array.isArray(instance.children) ? 'array' : typeof instance.children}` : 
				(instance?.tag === '<' ? `trust HTML length: ${(instance.children as string)?.length || 0}` : 
				(instance?.tag ? `tag: ${instance.tag}` : 'null/undefined'))))
			
			// If it's a fragment, log the children details
			if (instance?.tag === '[' && Array.isArray(instance.children)) {
				console.log(`[renderToString] Fragment children details:`, instance.children.map((child, idx) => 
					child ? (typeof child.tag === 'string' ? `${idx}:element:${child.tag}` : `${idx}:component`) : `${idx}:null`
				).join(', '))
			}
		}
	} finally {
		// Clear current component after rendering
		clearCurrentComponent()
	}

	vnode.instance = instance

	// Serialize the instance
	if (instance != null) {
		// Handle arrays (JSX fragments) - normalize them to fragment vnodes
		let instanceToSerialize = instance
		if (Array.isArray(instance)) {
			if (isServer) {
				console.log(`[renderToString] Instance is array with ${instance.length} children, normalizing to fragment`)
			}
			instanceToSerialize = Vnode('[', undefined, undefined, Vnode.normalizeChildren(instance) as Children, undefined, undefined)
		}
		
		const result = await serializeNode(instanceToSerialize, options, promiseTracker, isServer)
		if (isServer) {
			console.log(`[renderToString] Serialized component instance, result length: ${result.length}, preview: ${result.substring(0, 200)}`)
		}
		return result
	}
	
	if (isServer) {
		console.log(`[renderToString] Component instance is null/undefined, returning empty string`)
	}
	return ''
}

export function renderToStringFactory() {
	const defaultOptions: Required<RenderToStringOptions> = {
		escapeAttribute: escapeAttributeDefault,
		escapeText: escapeTextDefault,
		strict: false,
		xml: false,
	}
	
	// Async version (waits for promises)
	async function renderToString(
		vnodes: Children | VnodeType | null,
		options?: RenderToStringOptions,
	): Promise<{html: string; state: Record<string, any>}> {
		const opts: Required<RenderToStringOptions> = {
			...defaultOptions,
			...options,
			escapeAttribute: options?.escapeAttribute || defaultOptions.escapeAttribute,
			escapeText: options?.escapeText || defaultOptions.escapeText,
		}
		
		// Normalize vnodes
		const normalized = Vnode.normalizeChildren(
			Array.isArray(vnodes) ? vnodes : [vnodes],
		)
		
		console.log('[renderToString] Called with vnodes:', 
			Array.isArray(vnodes) ? `array[${vnodes.length}]` : 
			(vnodes?.tag === '[' ? 'fragment' : 
			(typeof vnodes?.tag === 'string' ? `element:${vnodes.tag}` : 
			(typeof vnodes?.tag === 'function' ? 'component' : 
			(typeof vnodes?.tag === 'object' && vnodes?.tag ? 'component-object' : 'null/undefined')))))
		console.log('[renderToString] Normalized to', normalized.length, 'vnodes')
		
		const promiseTracker = new PromiseTracker()
		
		// First pass: render and collect promises
		let html = ''
		const htmlParts: Promise<string>[] = []
		for (const vnode of normalized) {
			if (vnode != null) {
				htmlParts.push(serializeNode(vnode, opts, promiseTracker, true))
			}
		}
		html = (await Promise.all(htmlParts)).join('')
		
		console.log('[renderToString] First pass complete, html length:', html.length, 'has promises:', promiseTracker.hasPromises())
		
		// Wait for all promises
		if (promiseTracker.hasPromises()) {
			await promiseTracker.waitAll()
			
			// Second pass: re-render after promises resolve
			promiseTracker.reset()
			html = ''
			const htmlParts2: Promise<string>[] = []
			for (const vnode of normalized) {
				if (vnode != null) {
					htmlParts2.push(serializeNode(vnode, opts, promiseTracker, true))
				}
			}
			html = (await Promise.all(htmlParts2)).join('')
			console.log('[renderToString] Second pass complete, html length:', html.length)
		}
		
		// Serialize all registered stores
		const state = serializeAllStates()
		
		console.log('[renderToString] Final result, html length:', html.length, 'state size:', JSON.stringify(state).length)
		
		return {html, state}
	}
	
	// Sync version (no promise waiting)
	function renderToStringSync(
		vnodes: Children | VnodeType | null,
		options?: RenderToStringOptions,
	): string {
		const opts: Required<RenderToStringOptions> = {
			...defaultOptions,
			...options,
			escapeAttribute: options?.escapeAttribute || defaultOptions.escapeAttribute,
			escapeText: options?.escapeText || defaultOptions.escapeText,
		}
		
		const normalized = Vnode.normalizeChildren(
			Array.isArray(vnodes) ? vnodes : [vnodes],
		)
		
		const promiseTracker = new PromiseTracker()
		
		// For sync version, we need to handle async functions synchronously
		// This means we won't wait for promises, but we'll still render what we can
		let html = ''
		for (const vnode of normalized) {
			if (vnode != null) {
				// In sync mode, we can't await, so we'll render synchronously
				// Components with async oninit won't have their data, but that's expected
				const result = serializeNodeSync(vnode, opts, promiseTracker)
				html += result
			}
		}
		
		return html
	}
	
	return {
		renderToString,
		renderToStringSync,
	}
}
