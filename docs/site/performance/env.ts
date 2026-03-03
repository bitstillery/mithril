import type {DbRow, Query} from './types'

function formatElapsed(value: number): string {
    let str = value.toFixed(2)
    if (value > 60) {
        const minutes = Math.floor(value / 60)
        const comps = (value % 60).toFixed(2).split('.')
        const seconds = comps[0].padStart(2, '0')
        const ms = comps[1]
        str = `${minutes}:${seconds}.${ms}`
    }
    return str
}

function getElapsedClassName(elapsed: number): string {
    let className = 'Query elapsed'
    if (elapsed >= 10.0) {
        className += ' warn_long'
    } else if (elapsed >= 1.0) {
        className += ' warn'
    } else {
        className += ' short'
    }
    return className
}

function countClassName(queries: number): string {
    let countClassName = 'label'
    if (queries >= 20) {
        countClassName += ' label-important'
    } else if (queries >= 10) {
        countClassName += ' label-warning'
    } else {
        countClassName += ' label-success'
    }
    return countClassName
}

function updateQuery(object: Partial<Query> | null): Query {
    const obj = object ?? {}
    const elapsed = Math.random() * 15
    let query = 'SELECT blah FROM something'
    if (Math.random() < 0.2) query = '<IDLE> in transaction'
    if (Math.random() < 0.1) query = 'vacuum'
    return {
        elapsed,
        formatElapsed: formatElapsed(elapsed),
        elapsedClassName: getElapsedClassName(elapsed),
        query,
        waiting: Math.random() < 0.5,
        ...obj,
    }
}

function cleanQuery(value?: Partial<Query> | null): Query {
    if (value) {
        return {
            formatElapsed: '',
            elapsedClassName: '',
            query: '',
        }
    }
    return {
        query: '***',
        formatElapsed: '',
        elapsedClassName: '',
    }
}

function generateRow(object: DbRow | null, keepIdentity: boolean, mutCounter: number): DbRow {
    const nbQueries = Math.floor(Math.random() * 10 + 1)
    const obj: DbRow = object ?? {dbname: ''}
    ;(obj as any).lastMutationId = mutCounter
    ;(obj as any).nbQueries = nbQueries

    if (!obj.lastSample) {
        obj.lastSample = {nbQueries: 0, countClassName: ''}
    }

    if (keepIdentity) {
        if (!obj.lastSample.queries) {
            obj.lastSample.queries = []
            for (let l = 0; l < 12; l++) {
                obj.lastSample!.queries!.push(cleanQuery())
            }
        }
        for (let j = 0; j < obj.lastSample!.queries!.length; j++) {
            const value = obj.lastSample!.queries![j]
            if (j <= nbQueries) {
                obj.lastSample!.queries![j] = updateQuery(value)
            } else {
                obj.lastSample!.queries![j] = cleanQuery()
            }
        }
    } else {
        obj.lastSample!.queries = []
        for (let j = 0; j < 12; j++) {
            if (j < nbQueries) {
                obj.lastSample!.queries!.push(updateQuery(cleanQuery()))
            } else {
                obj.lastSample!.queries!.push(cleanQuery())
            }
        }
    }

    obj.lastSample!.nbQueries = nbQueries
    obj.lastSample!.countClassName = countClassName(nbQueries)

    return obj
}

export interface GenerateResult {
    toArray: () => DbRow[]
    getChangedIndices: () => number[]
}

export interface EnvConfig {
    rows: number
    depth: number
    mutations: (value?: number) => number
    generateData: (keepIdentity?: boolean) => GenerateResult
}

export function createEnv(rows = 15, depth = 10): EnvConfig {
    let counter = 0
    let data: DbRow[] | null = null
    let oldData: DbRow[] | null = null
    let mutationsValue = 0.5

    const DEPTHS = depth
    const depthSuffix = (d: number) => (d === 0 ? '' : d === 1 ? '-replica' : `-replica-${d}`)

    function getData(keepIdentity?: boolean): GenerateResult {
        const keep = keepIdentity ?? false
        if (!keep) {
            data = []
            for (let i = 1; i <= rows; i++) {
                for (let d = 0; d < DEPTHS; d++) {
                    data.push({dbname: `item-${i}${depthSuffix(d)}`, depth: d} as DbRow)
                }
            }
        }
        if (!data) {
            data = []
            for (let i = 1; i <= rows; i++) {
                for (let d = 0; d < DEPTHS; d++) {
                    data.push({dbname: `item-${i}${depthSuffix(d)}`, depth: d})
                }
            }
            oldData = data
        }

        const changedIndices: number[] = []
        for (let i = 0; i < data!.length; i++) {
            const row = data![i]
            if (!keep && oldData && oldData[i]) {
                row.lastSample = oldData[i].lastSample
            }
            if (!row.lastSample || Math.random() < mutationsValue) {
                counter++
                if (!keep) {
                    row.lastSample = undefined
                }
                generateRow(row, keep, counter)
                changedIndices.push(i)
            } else {
                data![i] = oldData![i]
            }
        }
        oldData = data
        return {
            toArray: () => data!,
            getChangedIndices: () => changedIndices,
        }
    }

    function mutations(value?: number): number {
        if (value !== undefined) {
            mutationsValue = value
            return mutationsValue
        }
        return mutationsValue
    }

    return {
        rows,
        depth,
        mutations,
        generateData: getData,
    }
}
