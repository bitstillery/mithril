import mountRedrawFactory from './api/mount-redraw'
import renderFactory from './render/render'

const mountRedraw = mountRedrawFactory(
	renderFactory(),
	typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
	console,
)

export default mountRedraw.mount
