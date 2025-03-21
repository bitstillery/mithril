import parseQueryString from '../querystring/parse'

// Returns `{path, params}` from `url`
export default function(url) {
    var queryIndex = url.indexOf('?')
    var hashIndex = url.indexOf('#')
    var queryEnd = hashIndex < 0 ? url.length : hashIndex
    var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
    var path = url.slice(0, pathEnd).replace(/\/{2,}/g, '/')

    if (!path) path = '/'
    else {
        if (path[0] !== '/') path = '/' + path
    }
    return {
        path: path,
        params: queryIndex < 0
            ? {}
            : parseQueryString(url.slice(queryIndex + 1, queryEnd)),
    }
}
