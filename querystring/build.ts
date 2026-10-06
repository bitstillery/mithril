import encodeURIComponentFast from '../util/encodeURIComponentFast'

// Appends `&key=value` to `query`; a value reaches the encoder as is, which coerces numbers, booleans and
// objects to strings.
function destructure(query: string, key: string, value: unknown): string {
    if (Array.isArray(value)) {
        // A comma list, not `key[0]=&key[1]=`: it is a third of the length, it survives a CDN
        // cache-key allowlist as a single parameter name, and RFC 3986 permits a bare comma in
        // a query. Each element is encoded on its own, so a comma *inside* a value stays `%2C`
        // and the list still splits unambiguously.
        if (value.length === 0) return query
        const name = encodeURIComponentFast(key)
        let list = ''
        for (let i = 0; i < value.length; i++) {
            const item: unknown = value[i]
            if (i > 0) list += ','
            if (item != null) list += encodeURIComponentFast(item)
        }
        return query + '&' + name + '=' + list
    }
    if (value !== null && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
        for (const i in value as Record<string, unknown>) {
            query = destructure(query, key + '[' + i + ']', (value as Record<string, unknown>)[i])
        }
        return query
    }
    const name = encodeURIComponentFast(key)
    return query + '&' + name + (value != null && value !== '' ? '=' + encodeURIComponentFast(value) : '')
}

export default function buildQueryString(object: object): string {
    if (Object.prototype.toString.call(object) !== '[object Object]') return ''

    let query = ''
    for (const key in object) {
        query = destructure(query, key, (object as Record<string, unknown>)[key])
    }
    return query.slice(1)
}
