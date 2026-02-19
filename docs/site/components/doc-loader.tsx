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
                    loadMarkdownFromDocs(attrs.docName, attrs.routePath),
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
            // Scroll to top when navigating to a new page (unless URL has hash - let browser scroll to anchor)
            if (!window.location.hash) {
                window.scrollTo(0, 0)
            }
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
                    $docs.loading = false
                } else {
                    const {page, navGuidesStructure, navMethodsStructure} = await res.json()
                    ;($docs as any).pendingPage = page
                    ;($docs as any).pendingNavGuides = navGuidesStructure ?? []
                    ;($docs as any).pendingNavMethods = navMethodsStructure ?? []
                    $docs.routePath = attrs.routePath
                    m.redraw()
                }
            } catch (err) {
                $docs.error = err instanceof Error ? err.message : 'Unknown error'
                $docs.loading = false
                m.redraw()
            }
        }
    }

    view() {
        const page =
            $docs.loading && $docs.page
                ? $docs.page // Keep previous page visible while loading new one
                : $docs.loading
                  ? {title: '', content: '<p>Loading...</p>', metaDescription: '', pageToc: ''}
                  : $docs.error || !$docs.page
                    ? {
                          title: 'Not Found',
                          content: `<h1>404 - Page Not Found</h1><p>${$docs.error || `The page "${$docs.routePath}" could not be found.`}</p>`,
                          metaDescription: '',
                          pageToc: '',
                      }
                    : $docs.page
        const pendingPage = $docs.pendingPage
        const navGuides = pendingPage ? $docs.pendingNavGuides : $docs.navGuides
        const navMethods = pendingPage ? $docs.pendingNavMethods : $docs.navMethods
        const onTransitionEnd =
            typeof window !== 'undefined' && pendingPage
                ? () => {
                      $docs.page = $docs.pendingPage
                      ;($docs as any).navGuides = $docs.pendingNavGuides
                      ;($docs as any).navMethods = $docs.pendingNavMethods
                      ;($docs as any).pendingPage = null
                      ;($docs as any).pendingNavGuides = []
                      ;($docs as any).pendingNavMethods = []
                      $docs.loading = false
                      m.redraw()
                  }
                : undefined
        return m(DocPageComponent as any, {
            page,
            pendingPage: pendingPage ?? undefined,
            onTransitionEnd,
            routePath: $docs.routePath,
            navGuides,
            navMethods,
        })
    }
}
