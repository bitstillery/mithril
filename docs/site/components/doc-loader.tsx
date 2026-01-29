import {MithrilTsxComponent, Vnode, Component} from '../../../index'
import m from '../../../index'
import {DocPageComponent} from './doc-page'
import {loadMarkdownFromDocs} from '../markdown'
import {getNavGuides, getNavMethods} from '../nav'

interface DocLoaderAttrs {
	docName: string
	routePath: string
}

export class DocLoader extends MithrilTsxComponent<DocLoaderAttrs> {
	private page: any = null
	private navGuides: string = ''
	private navMethods: string = ''
	private loading: boolean = true
	private error: string | null = null

	async oninit(vnode: Vnode<DocLoaderAttrs>) {
		const isServer = typeof window === 'undefined'
		console.log('[DocLoader] oninit called, isServer:', isServer, 'docName:', vnode.attrs.docName, 'routePath:', vnode.attrs.routePath)
		
		// On client (browser), skip loading - data should come from SSR hydration
		// The HTML is already rendered by the server, we just need to hydrate
		if (!isServer) {
			console.log('[DocLoader] Client-side: skipping data load, relying on SSR')
			this.loading = false
			this.page = null // Will be set if needed for client-side nav
			return
		}
		
		// Server-side: load the markdown files
		try {
			console.log('[DocLoader] Server-side: Loading doc:', vnode.attrs.docName, 'path:', vnode.attrs.routePath)
			const [page, navGuides, navMethods] = await Promise.all([
				loadMarkdownFromDocs(vnode.attrs.docName),
				getNavGuides(),
				getNavMethods(),
			])
			
			console.log('[DocLoader] Server-side: Loaded results - page:', page ? `yes (title: ${page.title}, content length: ${page.content.length})` : 'no', 
				'navGuides:', navGuides.length, 'chars', 'navMethods:', navMethods.length, 'chars')
			
			if (!page) {
				this.error = `Page "${vnode.attrs.routePath}" not found`
				console.error('[DocLoader] Server-side: Page not found:', vnode.attrs.docName)
			} else {
				this.page = page
				this.navGuides = navGuides
				this.navMethods = navMethods
				console.log('[DocLoader] Server-side: Data loaded successfully')
			}
		} catch (err) {
			console.error('[DocLoader] Server-side: Error loading:', err)
			if (err instanceof Error) {
				console.error('[DocLoader] Server-side: Error stack:', err.stack)
			}
			this.error = err instanceof Error ? err.message : 'Unknown error'
		} finally {
			this.loading = false
			console.log('[DocLoader] Server-side: oninit complete, loading:', this.loading, 'has page:', !!this.page, 'error:', this.error)
		}
	}

	view(vnode: Vnode<DocLoaderAttrs>) {
		const isServer = typeof window === 'undefined'
		console.log('[DocLoader] view called, isServer:', isServer, 'loading:', this.loading, 'has page:', !!this.page, 'error:', this.error)
		
		// On client, if we don't have page data, try to extract it from SSR state or show placeholder
		// For now, on client we'll render a placeholder that will be replaced by hydration
		if (!isServer && !this.page && !this.loading) {
			console.log('[DocLoader] Client-side: No page data, rendering placeholder')
			// Client-side: render a placeholder that matches SSR structure
			// The actual content should already be in the DOM from SSR
			return m('div', {style: 'display: none'}, 'Hydrating...')
		}
		
		if (this.loading) {
			console.log('[DocLoader] Still loading, rendering loading state')
			return m('div', 'Loading...')
		}
		
		if (this.error || !this.page) {
			console.log('[DocLoader] Error or no page, rendering 404')
			return m('div', [
				m('h1', '404 - Page Not Found'),
				m('p', this.error || `The page "${vnode.attrs.routePath}" could not be found.`),
			])
		}
		
		console.log('[DocLoader] Rendering DocPageComponent with page title:', this.page.title)
		const result = m(DocPageComponent as any, {
			page: this.page,
			routePath: vnode.attrs.routePath,
			navGuides: this.navGuides,
			navMethods: this.navMethods,
		})
		if (!result || !result.tag) {
			console.error('[DocLoader] Invalid vnode from DocPageComponent, result:', result)
			return m('div', 'Error rendering page')
		}
		console.log('[DocLoader] DocPageComponent vnode created, tag:', typeof result.tag === 'string' ? result.tag : result.tag.name || 'component')
		return result
	}
}
