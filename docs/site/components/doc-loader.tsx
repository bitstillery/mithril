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
		try {
			console.log('[DocLoader] Loading doc:', vnode.attrs.docName, 'path:', vnode.attrs.routePath)
			const [page, navGuides, navMethods] = await Promise.all([
				loadMarkdownFromDocs(vnode.attrs.docName),
				getNavGuides(),
				getNavMethods(),
			])
			
			console.log('[DocLoader] Loaded page:', page ? 'yes' : 'no', 'navGuides:', navGuides.length, 'navMethods:', navMethods.length)
			
			if (!page) {
				this.error = `Page "${vnode.attrs.routePath}" not found`
				console.error('[DocLoader] Page not found:', vnode.attrs.docName)
			} else {
				this.page = page
				this.navGuides = navGuides
				this.navMethods = navMethods
			}
		} catch (err) {
			console.error('[DocLoader] Error loading:', err)
			this.error = err instanceof Error ? err.message : 'Unknown error'
		} finally {
			this.loading = false
		}
	}

	view(vnode: Vnode<DocLoaderAttrs>) {
		console.log('[DocLoader] view called, loading:', this.loading, 'has page:', !!this.page, 'error:', this.error)
		
		if (this.loading) {
			console.log('[DocLoader] Rendering loading state')
			return m('div', 'Loading...')
		}
		
		if (this.error || !this.page) {
			console.log('[DocLoader] Rendering error/404 state')
			return m('div', [
				m('h1', '404 - Page Not Found'),
				m('p', this.error || `The page "${vnode.attrs.routePath}" could not be found.`),
			])
		}
		
		console.log('[DocLoader] Rendering DocPageComponent')
		return m(DocPageComponent as any, {
			page: this.page,
			routePath: vnode.attrs.routePath,
			navGuides: this.navGuides,
			navMethods: this.navMethods,
		})
	}
}
