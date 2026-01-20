import decodeURIComponentSafe from "../util/decodeURIComponentSafe.js"

export default function parseQueryString(string: string | null | undefined): Record<string, any> {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	const entries = string.split("&")
	const counters: Record<string, number> = {}
	const data: Record<string, any> = {}
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i].split("=")
		const key = decodeURIComponentSafe(entry[0])
		let value: any = entry.length === 2 ? decodeURIComponentSafe(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		const levels = key.split(/\]\[?|\[/)
		let cursor: any = data
		if (key.indexOf("[") > -1) levels.pop()
		for (let j = 0; j < levels.length; j++) {
			const level = levels[j]
			const nextLevel = levels[j + 1]
			const isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			let finalLevel: string | number
			if (level === "") {
				const key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				finalLevel = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			else {
				finalLevel = level
			}
			if (j === levels.length - 1) cursor[finalLevel] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				const desc = Object.getOwnPropertyDescriptor(cursor, finalLevel)
				let descValue = desc != null ? desc.value : undefined
				if (descValue == null) cursor[finalLevel] = descValue = isNumber ? [] : {}
				cursor = descValue
			}
		}
	}
	return data
}
