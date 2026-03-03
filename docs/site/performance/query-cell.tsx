import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import type {Query} from './types'

interface Attrs {
    query: Query
}

export class QueryCell extends MithrilComponent<Attrs> {
    view(vnode: Vnode<Attrs>) {
        const {query} = vnode.attrs ?? {}
        if (!query) return <td />
        return <td class={query.elapsedClassName}>{query.formatElapsed}</td>
    }
}
