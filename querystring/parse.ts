import decodeURIComponentSafe from '../util/decodeURIComponentSafe'

/**
 * A parameter as a URL can carry it. Path params are always strings; the querystring parser also turns
 * `true`/`false` into booleans and `a[]=`/`a[b]=` keys into arrays and objects.
 */
export type RouteParamValue = string | boolean | RouteParamValue[] | {[key: string]: RouteParamValue}
export type RouteParams = Record<string, RouteParamValue>

type ParamContainer = Record<string | number, RouteParamValue>

export default function parseQueryString(string: string | null | undefined): RouteParams {
    if (string === '' || string == null) return {}
    if (string.charAt(0) === '?') string = string.slice(1)

    const entries = string.split('&')
    const counters: Record<string, number> = {}
    const data: RouteParams = {}
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!.split('=')
        const key = decodeURIComponentSafe(entry[0]!)
        let value: RouteParamValue = entry.length === 2 ? decodeURIComponentSafe(entry[1]!) : ''

        if (value === 'true') value = true
        else if (value === 'false') value = false

        const levels = key.split(/\]\[?|\[/)
        // The object or array the next level is written into: `a[b][]=` walks data.a, then data.a.b.
        let cursor: ParamContainer = data
        if (key.indexOf('[') > -1) levels.pop()
        for (let j = 0; j < levels.length; j++) {
            const level = levels[j]!
            const nextLevel = levels[j + 1]
            // Past the last level nextLevel is undefined, which parseInt reads as NaN.
            const isNumber = nextLevel == '' || !isNaN(parseInt(nextLevel as string, 10))
            let finalLevel: string | number
            if (level === '') {
                const key = levels.slice(0, j).join()
                if (counters[key] == null) {
                    counters[key] = Array.isArray(cursor) ? cursor.length : 0
                }
                finalLevel = counters[key]++
            }
            // Disallow direct prototype pollution
            else if (level === '__proto__') break
            else {
                finalLevel = level
            }
            if (j === levels.length - 1) cursor[finalLevel] = value
            else {
                // Read own properties exclusively to disallow indirect
                // prototype pollution
                const desc = Object.getOwnPropertyDescriptor(cursor, finalLevel)
                let descValue: unknown = desc != null ? desc.value : undefined
                if (descValue == null) cursor[finalLevel] = descValue = isNumber ? [] : {}
                cursor = descValue as ParamContainer
            }
        }
    }
    return data
}
