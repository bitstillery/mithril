import buildQueryString from '../querystring/build'

// Returns `path` from `template` + `params`
export default function buildPathname(template: string, params: Record<string, any>): string {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError('Template parameter names must be separated by either a \'/\', \'-\', or \'.\'.')
	}
	if (params == null) return template
	const queryIndex = template.indexOf('?')
	const hashIndex = template.indexOf('#')
	const queryEnd = hashIndex < 0 ? template.length : hashIndex
	const pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	const path = template.slice(0, pathEnd)
	const query: Record<string, any> = {}

	Object.assign(query, params)

	const resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	const newQueryIndex = resolved.indexOf('?')
	const newHashIndex = resolved.indexOf('#')
	const newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	const newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	let result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? '?' : '&') + resolved.slice(newQueryIndex, newQueryEnd)
	const querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? '?' : '&') + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? '' : '&') + resolved.slice(newHashIndex)
	return result
}
