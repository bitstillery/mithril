import {MithrilComponent} from '../../../src/index'
import type {Vnode} from '../../../src/index'
import m from '../../../src/index'
import {PerformanceDemoBase} from './performance_demo_base'
import {$perfRows} from './performance_config'
import type {DbRow} from './types'

interface State {
    data: DbRow[]
}

export class PerformanceWithoutSignals extends MithrilComponent {
    override oncreate(vnode: Vnode) {
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
