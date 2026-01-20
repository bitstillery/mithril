import mountRedraw from "./api/mount-redraw.js"
import requestFactory from "./request/request.js"
import renderFactory from "./render/render.js"

const mountRedrawInstance = mountRedraw(
	renderFactory(),
	typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame.bind(window) : setTimeout,
	console
)

export default requestFactory(typeof window !== "undefined" ? window : null, mountRedrawInstance.redraw)
