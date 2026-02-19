import m from '../../../index'
import {MithrilComponent, Vnode} from '../../../index'

import {svg} from './icons'

export interface IconAttrs {
    name: keyof typeof svg
    class?: string
    /** Width/height in px (default 16) */
    size?: number
}

/**
 * Renders an SVG icon by name. Uses the same pattern as discover/common Icon.
 */
export class Icon extends MithrilComponent<IconAttrs> {
    view(vnode: Vnode<IconAttrs>) {
        const {name, class: cls, size = 16} = vnode.attrs ?? {}
        const path = name ? svg[name] : ''
        if (!path) return null
        return (
            <svg
                class={cls}
                width={String(size)}
                height={String(size)}
                viewBox='0 0 24 24'
                fill='currentColor'
                aria-hidden='true'
            >
                {m.trust(path)}
            </svg>
        )
    }
}
