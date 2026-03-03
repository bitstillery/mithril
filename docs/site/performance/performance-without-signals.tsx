import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {PerformanceDemoBase} from './performance-demo-base'
import {$perfRows} from './performance-config'
import type {DbRow} from './types'

interface State {
    data: DbRow[]
}

export class PerformanceWithoutSignals extends MithrilComponent {
    oncreate(vnode: Vnode) {
        const state = vnode.state as State
        state.data = []
    }

    view(vnode: Vnode) {
        const state = vnode.state as State
        const rows = $perfRows.rows
        return m(PerformanceDemoBase as any, {
            rows,
            data: state.data,
            onFrame: (data: DbRow[]) => {
                state.data = data
                m.redraw()
            },
            deferFirstFrame: false,
        })
    }
}
