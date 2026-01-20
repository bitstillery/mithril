import parseQueryString from "../querystring/parse.js"

// Returns `{path, params}` from `url`
export default function parsePathname(url: string): {path: string, params: Record<string, any>} {
	const queryIndex = url.indexOf("?")
	const hashIndex = url.indexOf("#")
	const queryEnd = hashIndex < 0 ? url.length : hashIndex
	const pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	let path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}
