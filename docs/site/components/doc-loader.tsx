import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$docs} from '../store'
import {DocPageComponent} from './doc-page'

interface DocLoaderAttrs {
    docName: string
    routePath: string
}

export class DocLoader extends MithrilComponent<DocLoaderAttrs> {
    async oninit(vnode: Vnode<DocLoaderAttrs>) {
        const attrs = vnode.attrs!
        const isServer = typeof window === 'undefined'

        if (isServer) {
            // Dynamic import: markdown and nav use fs/promises - not available in browser bundle
            const {loadMarkdownFromDocs} = await import('../markdown')
            const {getNavGuides, getNavMethods, getNavGuidesStructure, getNavMethodsStructure} = await import('../nav')
            try {
                const [page, , , navGuidesStructure, navMethodsStructure] = await Promise.all([
                    loadMarkdownFromDocs(attrs.docName),
                    getNavGuides(),
                    getNavMethods(),
                    getNavGuidesStructure(),
                    getNavMethodsStructure(),
                ])
                if (!page) {
                    $docs.error = `Page "${attrs.routePath}" not found`
                } else {
                    $docs.page = page
                    ;($docs as any).navGuides = navGuidesStructure
                    ;($docs as any).navMethods = navMethodsStructure
                    $docs.routePath = attrs.routePath
                }
            } catch (err) {
                $docs.error = err instanceof Error ? err.message : 'Unknown error'
            } finally {
                $docs.loading = false
            }
        } else {
            // Skip fetch if we already have SSR data for this route (hydration)
            if ($docs.routePath === attrs.routePath && $docs.page && !$docs.loading) {
                return
            }
            $docs.loading = true
            $docs.error = null
            try {
                const res = await fetch(`/api/docs/${attrs.docName}`)
                if (!res.ok) {
                    $docs.error = `Page "${attrs.routePath}" not found`
                } else {
                    const {page, navGuidesStructure, navMethodsStructure} = await res.json()
                    $docs.page = page
                    ;($docs as any).navGuides = navGuidesStructure ?? []
                    ;($docs as any).navMethods = navMethodsStructure ?? []
                    $docs.routePath = attrs.routePath
                }
            } catch (err) {
                $docs.error = err instanceof Error ? err.message : 'Unknown error'
            } finally {
                $docs.loading = false
                m.redraw()
            }
        }
    }

    view() {
        if ($docs.loading) {
            return m('div', 'Loading...')
        }
        if ($docs.error || !$docs.page) {
            return m('div', [
                m('h1', '404 - Page Not Found'),
                m('p', $docs.error || `The page "${$docs.routePath}" could not be found.`),
            ])
        }
        return m(DocPageComponent as any, {
            page: $docs.page,
            routePath: $docs.routePath,
            navGuides: $docs.navGuides,
            navMethods: $docs.navMethods,
        })
    }
}
