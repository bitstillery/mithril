import {MithrilComponent, Vnode} from '../../../index'
import m, {state} from '../../../index'
import {createEnv} from './env'
import {createPerformanceMonitor} from './performance-monitor'
import {mountPerformanceStats} from './performance-stats'
import {TableRow} from './table-row'
import type {DbRow} from './types'

interface State {
    env: ReturnType<typeof createEnv> | null
    rafId: number | null
    $s: ReturnType<typeof state<{data: DbRow[]}>>
    monitor: ReturnType<typeof createPerformanceMonitor>
}

const StatsOverlay = {
    view(vnode: Vnode<{getStats: () => {fps: number; frameTimeMs: number}}>) {
        return <div class='performance-stats-container' />
    },
    oncreate(vnode: Vnode<{getStats: () => {fps: number; frameTimeMs: number}}>) {
        const getStats = vnode.attrs?.getStats ?? (() => ({fps: 0, frameTimeMs: 0}))
        ;(vnode.state as {unmount?: () => void}).unmount = mountPerformanceStats(vnode.dom as HTMLElement, getStats)
    },
    onremove(vnode: Vnode<{getStats: () => {fps: number; frameTimeMs: number}}>) {
        ;(vnode.state as {unmount?: () => void}).unmount?.()
    },
}

export class PerformanceWithSignals extends MithrilComponent {
    oninit(vnode: Vnode) {
        const compState = vnode.state as State
        compState.$s = state({data: [] as DbRow[]}, 'performance.signals.data')
    }

    oncreate(vnode: Vnode) {
        const compState = vnode.state as State
        compState.env = createEnv(15)
        compState.monitor = createPerformanceMonitor()

        const update = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                compState.rafId = requestAnimationFrame(update)
                return
            }
            compState.rafId = requestAnimationFrame(update)
            compState.monitor.startFrame()
            if (compState.env) {
                ;(compState.$s as {data: DbRow[]}).data = compState.env.generateData().toArray()
            }
            compState.monitor.endFrame()
        }
        // Defer first update to avoid "Node is locked" - signal write triggers sync redraw during mount
        requestAnimationFrame(update)

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                if (compState.rafId != null) {
                    cancelAnimationFrame(compState.rafId)
                    compState.rafId = null
                }
            } else {
                if (compState.rafId == null) update()
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        ;(compState as any).unmountVisibility = () => document.removeEventListener('visibilitychange', handleVisibility)
    }

    onremove(vnode: Vnode) {
        const compState = vnode.state as State
        if (compState.rafId != null) {
            cancelAnimationFrame(compState.rafId)
        }
        ;(compState as any).unmountVisibility?.()
    }

    view(vnode: Vnode) {
        const compState = vnode.state as State
        const data = compState.$s?.data ?? []

        const mutationsPct = (compState.env?.mutations() ?? 0.5) * 100
        return (
            <div class='performance-demo'>
                {m(StatsOverlay as any, {
                    getStats: () => compState.monitor?.getStats() ?? {fps: 0, frameTimeMs: 0},
                })}
                <div style='display: flex; align-items: center; gap: 8px; margin-bottom: 10px;'>
                    <label>mutations: {mutationsPct.toFixed(0)}%</label>
                    <input
                        type='range'
                        min={0}
                        max={100}
                        value={mutationsPct}
                        style='margin: 0;'
                        oninput={(e: Event) => {
                            const val = (e.target as HTMLInputElement).valueAsNumber / 100
                            compState.env?.mutations(val)
                            m.redraw()
                        }}
                    />
                </div>
                <table class='table table-striped latest-data'>
                    <tbody>
                        {data.map((row) => (
                            <TableRow key={row.dbname} row={row} />
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}
