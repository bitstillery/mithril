// Note: this is mildly perf-sensitive.
//
// It does *not* use `delete` - dynamic `delete`s usually cause objects to bail
// out into dictionary mode and just generally cause a bunch of optimization
// issues within engines.
//
// Ideally, I would've preferred to do this, if it weren't for the optimization
// issues:
//
// ```ts
// const hasOwn = require("./hasOwn")
// const magic = [
//     "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
//     "onbeforeremove", "onremove",
// ]
// export default (attrs, extras) => {
//     const result = Object.assign(Object.create(null), attrs)
//     for (const key of magic) delete result[key]
//     if (extras != null) for (const key of extras) delete result[key]
//     return result
// }
// ```

import hasOwn from './hasOwn'

const magic = /^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$/

// The result holds a subset of attrs' own keys: the lifecycle hooks, `key` and `extras` are left out.
export default function censor<T extends object>(attrs: T, extras?: string[]): Partial<T> {
    const result: Record<string, unknown> = {}

    if (extras != null) {
        for (const key in attrs) {
            if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
                result[key] = (attrs as Record<string, unknown>)[key]
            }
        }
    } else {
        for (const key in attrs) {
            if (hasOwn.call(attrs, key) && !magic.test(key)) {
                result[key] = (attrs as Record<string, unknown>)[key]
            }
        }
    }

    return result as Partial<T>
}
