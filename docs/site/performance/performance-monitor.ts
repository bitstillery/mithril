/**
 * Lightweight performance monitor for the signals vs no-signals demo.
 * Uses native browser APIs only (no dependencies).
 * ADR-0015: Performance Demo Monitoring and Comparison
 *
 * Measures full frame duration (time between rAF callbacks) because m.redraw()
 * schedules the actual DOM work for the next frame—measuring inside our callback
 * would only capture scheduling overhead (~0ms), not the real render cost.
 */

export interface PerfStats {
    fps: number
    frameTimeMs: number
    frameTimeP95Ms: number
    /** Row components rendered in the last frame (TableRow/TableRowWithSignal view() calls) */
    rendersPerFrame: number
}

/** Call from row component view() to count renders. Used for performance comparison. */
let frameRenderCount = 0
export function recordComponentRender(): void {
    frameRenderCount++
}

function getAndResetFrameRenderCount(): number {
    const count = frameRenderCount
    frameRenderCount = 0
    return count
}

const WARMUP_FRAMES = 60
const FRAME_BUFFER_SIZE = 60
const FPS_WINDOW_MS = 1000

function median(arr: number[]): number {
    if (arr.length === 0) return 0
    const sorted = [...arr].toSorted((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
}

function percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0
    const sorted = [...arr].toSorted((a, b) => a - b)
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)] ?? 0
}

export function createPerformanceMonitor(): {
    recordFrame: (frameDurationMs: number) => void
    getStats: () => PerfStats
    reset: () => void
} {
    if (typeof window === 'undefined') {
        return {
            recordFrame: () => {},
            getStats: () => ({fps: 0, frameTimeMs: 0, frameTimeP95Ms: 0, rendersPerFrame: 0}),
            reset: () => {},
        }
    }

    const frameTimes: number[] = []
    const fpsTimestamps: number[] = []
    const renderCounts: number[] = []
    let frameCount = 0
    let lastRendersPerFrame = 0

    return {
        recordFrame(frameDurationMs: number) {
            lastRendersPerFrame = getAndResetFrameRenderCount()
            frameCount++
            if (frameCount > WARMUP_FRAMES) {
                frameTimes.push(frameDurationMs)
                if (frameTimes.length > FRAME_BUFFER_SIZE) {
                    frameTimes.shift()
                }
                renderCounts.push(lastRendersPerFrame)
                if (renderCounts.length > FRAME_BUFFER_SIZE) {
                    renderCounts.shift()
                }
                const now = performance.now()
                fpsTimestamps.push(now)
                while (fpsTimestamps.length > 0 && fpsTimestamps[0]! <= now - FPS_WINDOW_MS) {
                    fpsTimestamps.shift()
                }
            }
        },

        getStats(): PerfStats {
            return {
                fps: fpsTimestamps.length,
                frameTimeMs: frameTimes.length > 0 ? median(frameTimes) : 0,
                frameTimeP95Ms: frameTimes.length > 0 ? percentile(frameTimes, 95) : 0,
                rendersPerFrame: renderCounts.length > 0 ? Math.round(median(renderCounts)) : lastRendersPerFrame,
            }
        },

        reset() {
            frameTimes.length = 0
            fpsTimestamps.length = 0
            renderCounts.length = 0
            frameCount = 0
            lastRendersPerFrame = 0
            getAndResetFrameRenderCount()
        },
    }
}
