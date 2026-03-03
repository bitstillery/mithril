/**
 * Performance demo using per-row signals. Only changed rows re-render,
 * demonstrating the benefit of targeted updates vs full m.redraw() tree walk.
 */

import {MithrilComponent, Vnode} from '../../../index'
import m, {state} from '../../../index'
import {createEnv} from './env'
import {createPerformanceMonitor, type PerfStats} from './performance-monitor'
import {mountPerformanceStats} from './performance-stats'
import {TableRowWithSignal} from './table-row-with-signal'
import {$perfRows, $perfDepth, savePerfSettings, ROWS_MAX, ROWS_MIN, DEPTH_MAX, DEPTH_MIN} from './performance-config'
import type {DbRow} from './types'

interface RowSignal {
    row: DbRow
}

function getRowSignal(i: number): RowSignal {
    return state({row: {} as DbRow}, 'perf.row.' + i)
}

interface State {
    env: ReturnType<typeof createEnv> | null
    rafId: number | null
    lastRafTime: number
    lastRows: number
    lastDepth: number
    rowSignals: RowSignal[]
    monitor: ReturnType<typeof createPerformanceMonitor>
    unmountVisibility: (() => void) | null
}

const defaultStats: PerfStats = {fps: 0, frameTimeMs: 0, frameTimeP95Ms: 0, rendersPerFrame: 0}

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

export class PerformanceWithSignals extends MithrilComponent {
    oncreate(vnode: Vnode) {
        const compState = vnode.state as State
        const rows = $perfRows.rows
        const depth = $perfDepth.depth
        compState.env = createEnv(rows, depth)
        compState.env.mutations($perfDepth.mutations)
        compState.monitor = createPerformanceMonitor()
        compState.lastRafTime = 0
        compState.lastRows = rows
        compState.lastDepth = depth
        compState.unmountVisibility = null
        const totalRows = rows * depth
        compState.rowSignals = Array.from({length: totalRows}, (_, i) => getRowSignal(i))

        const update = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                compState.rafId = requestAnimationFrame(update)
                return
            }
            compState.rafId = requestAnimationFrame(update)
            const now = typeof performance !== 'undefined' ? performance.now() : 0
            if (compState.lastRafTime > 0) {
                compState.monitor.recordFrame(now - compState.lastRafTime)
            }
            compState.lastRafTime = now
            if (compState.env) {
                const result = compState.env.generateData()
                const data = result.toArray()
                const changedIndices = result.getChangedIndices()
                for (const i of changedIndices) {
                    if (compState.rowSignals[i]) {
                        compState.rowSignals[i]!.row = data[i]!
                    }
                }
            }
        }
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
        compState.unmountVisibility = () => document.removeEventListener('visibilitychange', handleVisibility)
    }

    onupdate(vnode: Vnode) {
        const compState = vnode.state as State
        const rows = $perfRows.rows
        const depth = $perfDepth.depth
        if ((rows !== compState.lastRows || depth !== compState.lastDepth) && compState.env) {
            compState.lastRows = rows
            compState.lastDepth = depth
            compState.env = createEnv(rows, depth)
            compState.env.mutations($perfDepth.mutations)
            const totalRows = rows * depth
            while (compState.rowSignals.length < totalRows) {
                compState.rowSignals.push(getRowSignal(compState.rowSignals.length))
            }
        }
    }

    onremove(vnode: Vnode) {
        const compState = vnode.state as State
        if (compState.rafId != null) {
            cancelAnimationFrame(compState.rafId)
        }
        compState.unmountVisibility?.()
    }

    view(vnode: Vnode) {
        const compState = vnode.state as State
        const rows = $perfRows.rows
        const depth = $perfDepth.depth
        const totalRows = rows * depth
        const rowSignals = compState.rowSignals ?? []
        const mutationsPct = $perfDepth.mutations * 100

        return (
            <div class='performance-demo'>
                <div class='performance-controls'>
                    <div class='performance-controls-stats'>
                        {m(StatsOverlay as any, {
                            getStats: () => compState.monitor?.getStats() ?? defaultStats,
                        })}
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
                                    savePerfSettings()
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
                                    savePerfSettings()
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
                                    $perfDepth.mutations = val
                                    compState.env?.mutations(val)
                                    savePerfSettings()
                                    m.redraw()
                                }}
                            />
                        </label>
                        <span class='performance-row-count' title='Total rows (items × depth)'>
                            {totalRows} total
                        </span>
                    </div>
                </div>
                <table class='table table-striped latest-data'>
                    <tbody>
                        {rowSignals.slice(0, totalRows).map((rowSignal, i) => (
                            <TableRowWithSignal key={`row-${i}`} rowSignal={rowSignal} />
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}
