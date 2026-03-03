export const ROWS_MIN = 10
export const ROWS_MAX = 100
export const ROWS_DEFAULT = 80

export const DEPTH_MIN = 1
export const DEPTH_MAX = 20
export const DEPTH_DEFAULT = 10

// From global $s store (persistent via Store load/save)
import {$s, initStore} from '../store'

// Ensure store is loaded before we access perf (handles HMR or module load order)
if (!$s.state.perf) {
    initStore()
}

/** Both point to the same perf state; $s.state is a proxy so we always get current values. */
export const $perfRows = $s.state.perf
export const $perfDepth = $s.state.perf

export function savePerfSettings(): void {
    $s.save()
}
