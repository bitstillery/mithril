import mountRedraw from './api/mount-redraw'
import requestFactory from './request/request'
import renderFactory from './render/render'

const mountRedrawInstance = mountRedraw(
	renderFactory(),
	typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : setTimeout,
	console,
)

export default requestFactory(typeof window !== 'undefined' ? window : null, mountRedrawInstance.redraw)
