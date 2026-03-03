import {state} from '../../../index'

export const ROWS_MIN = 10
export const ROWS_MAX = 100
export const ROWS_DEFAULT = 80

export const DEPTH_MIN = 1
export const DEPTH_MAX = 20
export const DEPTH_DEFAULT = 10

export const $perfRows = state({rows: ROWS_DEFAULT}, 'performance.rows')
export const $perfDepth = state({depth: DEPTH_DEFAULT}, 'performance.depth')
