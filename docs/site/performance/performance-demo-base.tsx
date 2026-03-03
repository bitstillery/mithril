/**
 * Shared performance demo logic: rAF loop, env, monitor, visibility handling.
 * Each demo (with/without signals) provides data and onFrame callback.
 */

import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'
import {createEnv} from './env'
import {createPerformanceMonitor, type PerfStats} from './performance-monitor'
import {mountPerformanceStats} from './performance-stats'
import {TableRow} from './table-row'
import {$perfRows, $perfDepth, ROWS_MAX, ROWS_MIN, DEPTH_MAX, DEPTH_MIN} from './performance-config'
import type {DbRow} from './types'

export interface PerformanceDemoAttrs {
    rows?: number
    data: DbRow[]
    onFrame: (data: DbRow[], changedIndices?: number[]) => void
    deferFirstFrame?: boolean
}

interface State {
    env: ReturnType<typeof createEnv> | null
    rafId: number | null
    lastRafTime: number
    lastRows: number
    lastDepth: number
    monitor: ReturnType<typeof createPerformanceMonitor>
    unmountVisibility: (() => void) | null
}

const defaultStats: PerfStats = {fps: 0, frameTimeMs: 0, frameTimeP95Ms: 0}

const StatsOverlay = {
    view(vnode: Vnode<{getStats: () => PerfStats}>) {
        return <div class='performance-stats-container' />
    },
    oncreate(vnode: Vnode<{getStats: () => PerfStats}>) {
        const state = vnode.state as {unmount?: () => void}
        const getStats = vnode.attrs?.getStats ?? (() => defaultStats)
        state.unmount = mountPerformanceStats(vnode.dom as HTMLElement, getStats)
    },
    onremove(vnode: Vnode<{getStats: () => PerfStats}>) {
        ;(vnode.state as {unmount?: () => void}).unmount?.()
    },
}

export const PerformanceDemoBase = {
    oncreate(vnode: Vnode<PerformanceDemoAttrs>) {
        const state = vnode.state as State
        const rows = vnode.attrs?.rows ?? 80
        const depth = $perfDepth.depth
        const onFrame = vnode.attrs?.onFrame ?? (() => {})
        const deferFirstFrame = vnode.attrs?.deferFirstFrame ?? false

        state.env = createEnv(rows, depth)
        state.monitor = createPerformanceMonitor()
        state.lastRafTime = 0
        state.lastRows = rows
        state.lastDepth = depth
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
                const result = state.env.generateData()
                onFrame(result.toArray(), result.getChangedIndices())
            }
        }

        if (deferFirstFrame) {
            requestAnimationFrame(update)
        } else {
            update()
        }

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
    },

    onupdate(vnode: Vnode<PerformanceDemoAttrs>) {
        const state = vnode.state as State
        const rows = vnode.attrs?.rows ?? 80
        const depth = $perfDepth.depth
        if ((rows !== state.lastRows || depth !== state.lastDepth) && state.env) {
            state.lastRows = rows
            state.lastDepth = depth
            state.env = createEnv(rows, depth)
        }
    },

    onremove(vnode: Vnode<PerformanceDemoAttrs>) {
        const state = vnode.state as State
        if (state.rafId != null) {
            cancelAnimationFrame(state.rafId)
        }
        state.unmountVisibility?.()
    },

    view(vnode: Vnode<PerformanceDemoAttrs>) {
        const state = vnode.state as State
        const data = vnode.attrs?.data ?? []

        const mutationsPct = (state.env?.mutations() ?? 0.5) * 100
        const rows = $perfRows.rows
        const depth = $perfDepth.depth
        return (
            <div class='performance-demo'>
                <div class='performance-controls'>
                    <div class='performance-controls-stats'>
                        {m(StatsOverlay as any, {getStats: () => state.monitor?.getStats() ?? defaultStats})}
                    </div>
                    <div class='performance-controls-sliders'>
                        <label class='performance-slider-label' title='Number of top-level items'>
                            items: {rows}
                            <input
                                type='range'
                                class='performance-slider'
                                min={ROWS_MIN}
                                max={ROWS_MAX}
                                value={rows}
                                oninput={(e: Event) => {
                                    $perfRows.rows = (e.target as HTMLInputElement).valueAsNumber
                                    m.redraw()
                                }}
                            />
                        </label>
                        <label class='performance-slider-label' title='Nested rows per item (depth)'>
                            depth: {depth}
                            <input
                                type='range'
                                class='performance-slider'
                                min={DEPTH_MIN}
                                max={DEPTH_MAX}
                                value={depth}
                                oninput={(e: Event) => {
                                    $perfDepth.depth = (e.target as HTMLInputElement).valueAsNumber
                                    m.redraw()
                                }}
                            />
                        </label>
                        <label class='performance-slider-label' title='Share of rows that get new data each frame'>
                            update rate: {mutationsPct.toFixed(0)}%
                            <input
                                type='range'
                                class='performance-slider'
                                min={0}
                                max={100}
                                value={mutationsPct}
                                oninput={(e: Event) => {
                                    const val = (e.target as HTMLInputElement).valueAsNumber / 100
                                    state.env?.mutations(val)
                                    m.redraw()
                                }}
                            />
                        </label>
                        <span class='performance-row-count' title='Total rows (items × depth)'>
                            {data.length} total
                        </span>
                    </div>
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
    },
}
