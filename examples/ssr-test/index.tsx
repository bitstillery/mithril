import m from '@bitstillery/mithril'

interface DocumentAttrs {
	title?: string
	appHtml: string
}

export const Document = {
	view: (vnode: any) => {
		const attrs = vnode.attrs as DocumentAttrs
		const title = attrs.title || 'Mithril SSR Test'

		return (
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>{title}</title>
					<style>
						{`
						body { font-family: system-ui, sans-serif; margin: 2rem; }
						.container { max-width: 800px; margin: 0 auto; }
						nav { margin: 1rem 0; }
						nav a { margin-right: 1rem; color: #0066cc; text-decoration: none; }
						nav a:hover { text-decoration: underline; }
						nav a.active { font-weight: bold; text-decoration: underline; }
						`}
					</style>
				</head>
				<body>
					<div id="app">{m.trust(attrs.appHtml)}</div>
					<script type="module">{m.trust(`
						// Client-side hydration
						import m from '@bitstillery/mithril'
						import {App} from './components/App.js'

						// Mount the same App component to hydrate
						m.mount(document.getElementById('app'), App)
					`)}</script>
				</body>
			</html>
		)
	},
}
