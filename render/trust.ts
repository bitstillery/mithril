import Vnode from "./vnode.js"

export default function trust(html: string | null | undefined): any {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}
