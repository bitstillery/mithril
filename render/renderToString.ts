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
	
	// Call oninit without waitFor (sync mode)
	if (typeof state.oninit === 'function') {
		try {
			// Call oninit but don't wait for it or track promises
			state.oninit(vnode)
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
		const results = await Promise.all(
			children.map(child => serializeNode(child, options, promiseTracker, isServer)),
		)
		return results.join('')
	}
	
	// Component
	if (typeof tag !== 'string') {
		return await serializeComponent(vnode, options, promiseTracker, isServer)
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
			const results = await Promise.all(
				children.map(child => serializeNode(child as VnodeType | null, options, promiseTracker, isServer)),
			)
			html += results.join('')
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
		// Call oninit with waitFor if on server
		if (isServer && typeof state.oninit === 'function') {
			const waitFor = (promise: Promise<any>) => {
				promiseTracker.waitFor(promise)
			}
			try {
				const result = state.oninit(vnode, waitFor)
				// If oninit returns a promise, wait for it (but don't add to tracker twice)
				if (result && typeof result.then === 'function') {
					// The promise might already be tracked via waitFor, but we still need to await it
					await result
				}
			} catch(_e) {
				// Ignore errors in oninit for now
			}
		}
	
		// Call view (bind this to state)
		instance = Vnode.normalize(view.call(state, vnode))
		if (instance === vnode) {
			throw Error('A view cannot return the vnode it received as argument')
		}
	} finally {
		// Clear current component after rendering
		clearCurrentComponent()
	}
	
	vnode.instance = instance
	
	// Serialize the instance
	if (instance != null) {
		return serializeNode(instance, options, promiseTracker, isServer)
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
	): Promise<{html: string, state: Record<string, any>}> {
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
		}
		
		// Serialize all registered stores
		const state = serializeAllStates()
		
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
