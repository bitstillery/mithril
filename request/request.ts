import buildPathname from "../pathname/build.js"
import hasOwn from "../util/hasOwn.js"
import type { RequestOptions } from "../index.js"

interface RequestFunction {
	<T = any>(url: string, args?: RequestOptions<T>): Promise<T>
	<T = any>(args: RequestOptions<T> & {url: string}): Promise<T>
}

export default function requestFactory($window: any, oncompletion?: () => void): {request: RequestFunction} {
	function PromiseProxy(this: any, executor: any) {
		return new Promise(executor)
	}

	function makeRequest<T = any>(url: string, args: RequestOptions<T>): Promise<T> {
		return new Promise(function(resolve, reject) {
			url = buildPathname(url, args.params || {})
			const method = args.method != null ? args.method.toUpperCase() : "GET"
			const body = args.body
			const assumeJSON = (args.serialize == null || args.serialize === JSON.stringify) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams)
			const responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			let xhr = new $window.XMLHttpRequest()
			let aborted = false
			let isTimeout = false
			const original = xhr
			let replacedAbort: (() => void) | undefined

			const abort = xhr.abort
			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (const key in args.headers) {
				if (hasOwn.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev: any) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						const success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						let response: any = ev.target.response
						let message: string

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") {
								// Handle no-content which will not parse.
								try { response = JSON.parse(ev.target.responseText) }
								catch (e) { response = null }
							}
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							// success stays true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}

						if (success) {
							if (typeof args.type === "function") {
								if (Array.isArray(response)) {
									for (let i = 0; i < response.length; i++) {
										response[i] = new args.type!(response[i])
									}
								}
								else response = new args.type!(response)
							}
							resolve(response)
						}
						else {
							const completeErrorResponse = function() {
								try { message = ev.target.responseText }
								catch (e) { message = response }
								const error: any = new Error(message)
								error.code = ev.target.status
								error.response = response
								reject(error)
							}

							if (xhr.status === 0) {
								// Use setTimeout to push this code block onto the event queue
								// This allows `xhr.ontimeout` to run in the case that there is a timeout
								// Without this setTimeout, `xhr.ontimeout` doesn't have a chance to reject
								// as `xhr.onreadystatechange` will run before it
								setTimeout(function() {
									if (isTimeout) return
									completeErrorResponse()
								})
							} else completeErrorResponse()
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			xhr.ontimeout = function (ev: any) {
				isTimeout = true
				const error: any = new Error("Request timed out")
				error.code = ev.target.status
				reject(error)
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort!.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		})
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	;(PromiseProxy as any).__proto__ = Promise

	function hasHeader(args: RequestOptions<any>, name: string): boolean {
		if (!args.headers) return false
		for (const key in args.headers) {
			if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true
		}
		return false
	}

	return {
		request: function<T = any>(url: string | RequestOptions<T> & {url: string}, args?: RequestOptions<T>): Promise<T> {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			const promise = makeRequest<T>(url, args!)
			if (args!.background === true) return promise
			let count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise: Promise<T>): Promise<T> {
				const then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				(promise as any).constructor = PromiseProxy
				(promise as any).then = function() {
					count++
					const next = then.apply(promise, arguments as any)
					next.then(complete, function(e: any) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}
}
