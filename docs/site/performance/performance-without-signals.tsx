import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {createEnv} from './env'
import type {DbRow} from './types'

interface State {
    data: DbRow[]
    env: ReturnType<typeof createEnv> | null
    rafId: number | null
}

export class PerformanceWithoutSignals extends MithrilComponent {
    oncreate(vnode: Vnode) {
        const state = vnode.state as State
        const container = vnode.dom as HTMLElement
        state.env = createEnv(container, 15)
        state.data = []

        const update = () => {
            state.rafId = requestAnimationFrame(update)
            if (state.env) {
                state.data = state.env.generateData().toArray()
                m.redraw()
            }
        }
        update()
    }

    onremove(vnode: Vnode) {
        const state = vnode.state as State
        if (state.rafId != null) {
            cancelAnimationFrame(state.rafId)
        }
    }

    view(vnode: Vnode) {
        const state = vnode.state as State
        const data = state?.data ?? []

        return m('div.performance-demo', [
            m('table.table.table-striped.latest-data', [
                m(
                    'tbody',
                    data.map((db) =>
                        m('tr', {key: db.dbname}, [
                            m('td.dbname', db.dbname),
                            m('td.query-count', [
                                m(
                                    'span',
                                    {
                                        class: db.lastSample?.countClassName ?? 'label',
                                    },
                                    db.lastSample?.nbQueries ?? 0,
                                ),
                            ]),
                            ...(db.lastSample?.topFiveQueries ?? []).map((query) =>
                                m('td', {class: query.elapsedClassName}, [
                                    query.formatElapsed,
                                    m('div.popover.left', [m('div.popover-content', query.query), m('div.arrow')]),
                                ]),
                            ),
                        ]),
                    ),
                ),
            ]),
        ])
    }
}
