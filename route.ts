import mountRedraw from './api/mount-redraw'
import routerFactory from './api/router'
import renderFactory from './render/render'

const mountRedrawInstance = mountRedraw(
	renderFactory(),
	typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
	console,
)

export default routerFactory(typeof window !== 'undefined' ? window : null, mountRedrawInstance)
