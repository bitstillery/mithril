import m from '../../../index'

export const Home = {
	view: (_vnode: m.Vnode<any>) => {
		return <div>
			<h2>Welcome to Mithril SSR</h2>
			<p>This page was rendered on the server!</p>
			<ul>
				<li>Server-side rendering works</li>
				<li>Components render to HTML</li>
				<li>TypeScript support included</li>
			</ul>
		</div>		
	},
}
