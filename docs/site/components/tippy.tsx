import tippy from 'tippy.js'
import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

import 'tippy.js/dist/tippy.css'

export interface TippyAttrs {
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    /** Optional fixed id for SSR hydration (avoids mismatch from random ids) */
    id?: string
}

/**
 * Wraps an element with a Tippy.js tooltip.
 */
export class Tippy extends MithrilComponent<TippyAttrs> {
    id = 'docs-tippy-' + Math.random().toString(36).slice(2, 11)
    tippyInstance: any = null

    oncreate(vn: Vnode<TippyAttrs>) {
        const attrs = vn.attrs
        if (!attrs) return
        const tid = attrs.id ?? this.id
        const el = document.getElementById(tid)
        if (el) {
            this.tippyInstance = tippy(el, {
                content: attrs.content,
                placement: attrs.placement ?? 'top',
                allowHTML: false,
                delay: 200,
                theme: 'docs-one-dark',
            })
        }
    }

    onremove() {
        if (this.tippyInstance) {
            this.tippyInstance.destroy()
            this.tippyInstance = null
        }
    }

    view(vnode: Vnode<TippyAttrs>) {
        const tid = vnode.attrs?.id ?? this.id
        return (
            <span id={tid} class='docs-tippy-wrap'>
                {vnode.children}
            </span>
        )
    }
}
