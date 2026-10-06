import Vnode from './vnode'

import type {RenderVnode} from './vnode'

export default function trust(html: string | null | undefined): RenderVnode {
    if (html == null) html = ''
    return Vnode('<', undefined, undefined, html, undefined, undefined)
}
