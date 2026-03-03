/**
 * Stats overlay for the performance demo.
 * Updates via direct DOM writes (throttled to 500ms) to avoid measuring our own overhead.
 * ADR-0015: Performance Demo Monitoring and Comparison
 */

import type {PerfStats} from './performance-monitor'

const UPDATE_INTERVAL_MS = 500

export function mountPerformanceStats(container: HTMLElement, getStats: () => PerfStats): () => void {
    const el = document.createElement('div')
    el.className = 'performance-stats'
    el.setAttribute('aria-live', 'polite')
    container.appendChild(el)

    const intervalId = setInterval(() => {
        const {fps, frameTimeMs, frameTimeP95Ms} = getStats()
        const fpsClass = fps >= 55 ? 'fps-good' : fps >= 45 ? 'fps-warn' : 'fps-bad'
        el.textContent = ''
        el.className = `performance-stats ${fpsClass}`
        el.appendChild(
            document.createTextNode(`FPS: ${fps} | Frame: ${frameTimeMs.toFixed(1)}ms (P95: ${frameTimeP95Ms.toFixed(1)}ms)`),
        )
    }, UPDATE_INTERVAL_MS)

    return () => {
        clearInterval(intervalId)
        el.remove()
    }
}
