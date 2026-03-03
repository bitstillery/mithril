export interface Query {
    formatElapsed: string
    elapsedClassName: string
    query: string
    elapsed?: number
    waiting?: boolean
}

export interface LastSample {
    nbQueries: number
    countClassName: string
    topFiveQueries: Query[]
    queries?: Query[]
}

export interface DbRow {
    dbname: string
    lastSample?: LastSample
}
