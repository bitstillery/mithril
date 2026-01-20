import m from '@bitstillery/mithril'

import {routes} from '../routes'

interface AppAttrs {
    initialPath?: string
}

export const App = {
    oninit: (vnode: any) => {
        // Initialize client-side routing if we're in the browser
        if (typeof window !== 'undefined') {
            m.route.prefix = ''
            // Set initial route if provided, otherwise use current pathname
            const pathname = vnode.attrs.initialPath || window.location.pathname
            m.route.set(pathname, {}, {replace: true})
        }
    },

    view: (vnode: any) => {
        const attrs = vnode.attrs as AppAttrs

        // Determine current route
        let currentPath = '/'

        if (typeof window !== 'undefined') {
            // Client-side: use m.route
            currentPath = m.route.get()
        } else {
            // Server-side: use initialPath from attrs
            currentPath = attrs.initialPath || '/'
        }

        const currentRoute = routes[currentPath] || routes['/']
        const CurrentComponent = currentRoute.component

        return <div class="container">
            <h1>Mithril SSR Test</h1>
            <nav>
                <a
                    href="/"
                    onclick={(e: MouseEvent) => {
                        if (typeof window !== 'undefined') {
                            e.preventDefault()
                            m.route.set('/')
                        }
                    }}
                    class={currentPath === '/' ? 'active' : ''}
                >
                    Home
                </a>
                <a
                    href="/async"
                    onclick={(e: MouseEvent) => {
                        if (typeof window !== 'undefined') {
                            e.preventDefault()
                            m.route.set('/async')
                        }
                    }}
                    class={currentPath === '/async' ? 'active' : ''}
                >
                    Async Data
                </a>
            </nav>
            <main>
                <CurrentComponent />
            </main>
        </div>
        
    },
}
