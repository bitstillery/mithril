import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

interface SandboxAttrs {
    /** Highlighted code block HTML (from Prism) */
    content: string
}

/**
 * Wrapper for JS code blocks. Live preview to be added later.
 */
export class Sandbox extends MithrilComponent<SandboxAttrs> {
    view(vnode: Vnode<SandboxAttrs>) {
        const {content = ''} = vnode.attrs ?? {}
        return m('div.docs-sandbox', m.trust(content))
    }
}
