import {MithrilComponent, Vnode} from '../../../index'
import m, {state} from '../../../index'
import {createEnv} from './env'
import type {DbRow} from './types'

interface State {
    env: ReturnType<typeof createEnv> | null
    rafId: number | null
    $s: ReturnType<typeof state<{data: DbRow[]}>>
}

export class PerformanceWithSignals extends MithrilComponent {
    oninit(vnode: Vnode) {
        const compState = vnode.state as State
        compState.$s = state({data: [] as DbRow[]}, 'performance.signals.data')
    }

    oncreate(vnode: Vnode) {
        const compState = vnode.state as State
        const container = vnode.dom as HTMLElement
        compState.env = createEnv(container, 15)

        const update = () => {
            compState.rafId = requestAnimationFrame(update)
            if (compState.env) {
                ;(compState.$s as {data: DbRow[]}).data = compState.env.generateData().toArray()
            }
        }
        update()
    }

    onremove(vnode: Vnode) {
        const compState = vnode.state as State
        if (compState.rafId != null) {
            cancelAnimationFrame(compState.rafId)
        }
    }

    view(vnode: Vnode) {
        const compState = vnode.state as State
        const data = compState.$s?.data ?? []

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
