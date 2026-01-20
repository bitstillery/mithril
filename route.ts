import mountRedraw from "./api/mount-redraw.js"
import routerFactory from "./api/router.js"
import renderFactory from "./render/render.js"

const mountRedrawInstance = mountRedraw(
	renderFactory(),
	typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame.bind(window) : setTimeout,
	console
)

export default routerFactory(typeof window !== "undefined" ? window : null, mountRedrawInstance)
