/**
 * Lightweight performance monitor for the signals vs no-signals demo.
 * Uses native browser APIs only (no dependencies).
 * ADR-0015: Performance Demo Monitoring and Comparison
 */

export interface PerfStats {
    fps: number
    frameTimeMs: number
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

export function createPerformanceMonitor(): {
    startFrame: () => void
    endFrame: () => void
    getStats: () => PerfStats
    reset: () => void
} {
    if (typeof window === 'undefined') {
        return {
            startFrame: () => {},
            endFrame: () => {},
            getStats: () => ({fps: 0, frameTimeMs: 0}),
            reset: () => {},
        }
    }

    let frameStart = 0
    const frameTimes: number[] = []
    const fpsTimestamps: number[] = []
    let frameCount = 0

    return {
        startFrame() {
            frameStart = performance.now()
        },

        endFrame() {
            const now = performance.now()
            const delta = frameStart > 0 ? now - frameStart : 0

            frameCount++
            if (frameCount > WARMUP_FRAMES) {
                frameTimes.push(delta)
                if (frameTimes.length > FRAME_BUFFER_SIZE) {
                    frameTimes.shift()
                }
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
            }
        },

        reset() {
            frameStart = 0
            frameTimes.length = 0
            fpsTimestamps.length = 0
            frameCount = 0
        },
    }
}
