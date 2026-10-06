export default function buildQueryString(object: object): string {
    if (Object.prototype.toString.call(object) !== '[object Object]') return ''

    const args: string[] = []
    // A value reaches encodeURIComponent() as is; it coerces numbers, booleans and objects to strings.
    function destructure(key: string, value: unknown) {
        if (Array.isArray(value)) {
            // A comma list, not `key[0]=&key[1]=`: it is a third of the length, it survives a CDN
            // cache-key allowlist as a single parameter name, and RFC 3986 permits a bare comma in
            // a query. Each element is encoded on its own, so a comma *inside* a value stays `%2C`
            // and the list still splits unambiguously.
            if (value.length === 0) return
            args.push(
                encodeURIComponent(key) +
                    '=' +
                    (value as unknown[]).map((item) => (item == null ? '' : encodeURIComponent(item as string))).join(','),
            )
        } else if (Object.prototype.toString.call(value) === '[object Object]') {
            for (const i in value as Record<string, unknown>) {
                destructure(key + '[' + i + ']', (value as Record<string, unknown>)[i])
            }
        } else
            args.push(encodeURIComponent(key) + (value != null && value !== '' ? '=' + encodeURIComponent(value as string) : ''))
    }

    for (const key in object) {
        destructure(key, (object as Record<string, unknown>)[key])
    }

    return args.join('&')
}
