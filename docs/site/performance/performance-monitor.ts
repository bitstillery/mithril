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
            getStats: () => ({fps: 0, frameTimeMs: 0, frameTimeP95Ms: 0}),
            reset: () => {},
        }
    }

    const frameTimes: number[] = []
    const fpsTimestamps: number[] = []
    let frameCount = 0

    return {
        recordFrame(frameDurationMs: number) {
            frameCount++
            if (frameCount > WARMUP_FRAMES) {
                frameTimes.push(frameDurationMs)
                if (frameTimes.length > FRAME_BUFFER_SIZE) {
                    frameTimes.shift()
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
            }
        },

        reset() {
            frameTimes.length = 0
            fpsTimestamps.length = 0
            frameCount = 0
        },
    }
}
