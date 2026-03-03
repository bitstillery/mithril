import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {createEnv} from './env'
import {createPerformanceMonitor} from './performance-monitor'
import {mountPerformanceStats} from './performance-stats'
import {TableRow} from './table-row'
import type {DbRow} from './types'

interface State {
    data: DbRow[]
    env: ReturnType<typeof createEnv> | null
    rafId: number | null
    lastRafTime: number
    monitor: ReturnType<typeof createPerformanceMonitor>
    unmountVisibility: (() => void) | null
}

const StatsOverlay = {
    view(vnode: Vnode<{getStats: () => {fps: number; frameTimeMs: number}}>) {
        return <div class='performance-stats-container' />
    },
    oncreate(vnode: Vnode<{getStats: () => {fps: number; frameTimeMs: number}}>) {
        const state = vnode.state as {unmount?: () => void}
        const getStats = vnode.attrs?.getStats ?? (() => ({fps: 0, frameTimeMs: 0}))
        state.unmount = mountPerformanceStats(vnode.dom as HTMLElement, getStats)
    },
    onremove(vnode: Vnode<{getStats: () => {fps: number; frameTimeMs: number}}>) {
        ;(vnode.state as {unmount?: () => void}).unmount?.()
    },
}

export class PerformanceWithoutSignals extends MithrilComponent {
    oncreate(vnode: Vnode) {
        const state = vnode.state as State
        state.env = createEnv(80)
        state.data = []
        state.monitor = createPerformanceMonitor()
        state.lastRafTime = 0
        state.unmountVisibility = null

        const update = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                state.rafId = requestAnimationFrame(update)
                return
            }
            state.rafId = requestAnimationFrame(update)
            const now = typeof performance !== 'undefined' ? performance.now() : 0
            if (state.lastRafTime > 0) {
                state.monitor.recordFrame(now - state.lastRafTime)
            }
            state.lastRafTime = now
            if (state.env) {
                state.data = state.env.generateData().toArray()
                m.redraw()
            }
        }
        update()

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                if (state.rafId != null) {
                    cancelAnimationFrame(state.rafId)
                    state.rafId = null
                }
            } else {
                if (state.rafId == null) update()
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        state.unmountVisibility = () => document.removeEventListener('visibilitychange', handleVisibility)
    }

    onremove(vnode: Vnode) {
        const state = vnode.state as State
        if (state.rafId != null) {
            cancelAnimationFrame(state.rafId)
        }
        state.unmountVisibility?.()
    }

    view(vnode: Vnode) {
        const state = vnode.state as State
        const data = state?.data ?? []

        const mutationsPct = (state.env?.mutations() ?? 0.5) * 100
        return (
            <div class='performance-demo'>
                <div class='performance-controls'>
                    <label>mutations: {mutationsPct.toFixed(0)}%</label>
                    <input
                        type='range'
                        min={0}
                        max={100}
                        value={mutationsPct}
                        oninput={(e: Event) => {
                            const val = (e.target as HTMLInputElement).valueAsNumber / 100
                            state.env?.mutations(val)
                            m.redraw()
                        }}
                    />
                    {m(StatsOverlay as any, {getStats: () => state.monitor?.getStats() ?? {fps: 0, frameTimeMs: 0}})}
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
