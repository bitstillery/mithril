// The characters encodeURIComponent() leaves alone: A-Z a-z 0-9 - _ . ! ~ * ' ( )
function isUnreserved(c: number): boolean {
    return (
        (c >= 97 && c <= 122) ||
        (c >= 65 && c <= 90) ||
        (c >= 48 && c <= 57) ||
        c === 45 ||
        c === 95 ||
        c === 46 ||
        c === 33 ||
        c === 126 ||
        c === 42 ||
        c === 39 ||
        c === 40 ||
        c === 41
    )
}

// Same result as encodeURIComponent(), which is slow to call even on the short, plain keys and
// values URLs mostly carry: those are returned as they are.
export default function encodeURIComponentFast(value: unknown): string {
    const type = typeof value
    if (type !== 'string' && type !== 'number' && type !== 'boolean') return encodeURIComponent(value as string)
    const str = type === 'string' ? (value as string) : String(value)
    for (let i = 0; i < str.length; i++) {
        if (!isUnreserved(str.charCodeAt(i))) return encodeURIComponent(str)
    }
    return str
}
