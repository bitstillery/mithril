import m from "./index.js"

if (typeof module !== "undefined") {
	(module as any)["exports"] = m
} else {
	(window as any).m = m
}

export default m
