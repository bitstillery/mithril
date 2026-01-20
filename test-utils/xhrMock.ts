import parseQueryString from '../querystring/parse'

import callAsync from './callAsync'
import parseURL from './parseURL'

interface RouteHandler {
	(rawUrl: string, url: string, query: Record<string, any>, body: any): {status: number; responseText: string} | Promise<{status: number; responseText: string}>
}

export default function xhrMock() {
	let routes: Record<string, RouteHandler> = {}
	const serverErrorHandler = function(url: string): {status: number; responseText: string} {
		return {status: 500, responseText: 'server error, most likely the URL was not defined ' + url}
	}

	function FormData() {}
	const $window: any = {
		FormData: FormData,
		URLSearchParams: URLSearchParams,
		XMLHttpRequest: function XMLHttpRequest(this: any) {
			const args: any = {}
			const headers: Record<string, string> = {}
			let aborted = false
			this.setRequestHeader = function(header: string, value: string) {
				/*
				 the behavior of setHeader is not your expected setX API.
				 If the header is already set, it'll merge with whatever you add
				 rather than overwrite
				 Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader
				 */
				if (headers[header]) {
					headers[header] += ', ' + value
				} else {
					headers[header] = value
				}
			}
			this.getRequestHeader = function(header: string) {
				return headers[header]
			}
			this.open = function(method: string, url: string, async?: boolean, user?: string, password?: string) {
				const urlData = parseURL(url, {protocol: 'http:', hostname: 'localhost', port: '', pathname: '/'})
				args.rawUrl = url
				args.method = method
				args.pathname = urlData.pathname
				args.search = urlData.search
				args.async = async != null ? async : true
				args.user = user
				args.password = password
			}
			this.responseType = ''
			this.response = null
			this.timeout = 0
			Object.defineProperty(this, 'responseText', {get: function() {
				if (this.responseType === '' || this.responseType === 'text') {
					return this.response
				} else {
					throw new Error('Failed to read the \'responseText\' property from \'XMLHttpRequest\': The value is only accessible if the object\'s \'responseType\' is \'\' or \'text\' (was \'' + this.responseType + '\').')
				}
			}})
			this.send = function(body: any) {
				const self = this
				
				const completeResponse = function(data: {status: number; responseText: string}) {
					self._responseCompleted = true
					if (!aborted) {
						self.status = data.status
						// Match spec
						if (self.responseType === 'json') {
							try { self.response = JSON.parse(data.responseText) }
							catch(_e) { /* ignore */ }
						} else {
							self.response = data.responseText
						}
					} else {
						self.status = 0
					}
					self.readyState = 4
					if (args.async === true) {
						callAsync(function() {
							if (typeof self.onreadystatechange === 'function') self.onreadystatechange({target: self})
						} as any)
					}
				}

				let data: {status: number; responseText: string} | Promise<{status: number; responseText: string}>
				if (!aborted) {
					const handler = routes[args.method + ' ' + args.pathname] || serverErrorHandler.bind(null, args.pathname)
					data = handler({rawUrl: args.rawUrl, url: args.pathname, query: args.search || {}, body: body || null})
				}

				if (typeof self.timeout === 'number' && self.timeout > 0) {
					setTimeout(function() {
						if (self._responseCompleted) {
							return
						}

						self.status = 0
						if (typeof self.ontimeout === 'function') self.ontimeout({target: self, type:'timeout'})
					}, self.timeout)
				}

				if (data instanceof Promise) {
					data.then(completeResponse)
				} else {
					completeResponse(data)
				}
			}
			this.abort = function() {
				aborted = true
			}
		},
		document: {
			createElement: function(tag: string) {
				return {nodeName: tag.toUpperCase(), parentNode: null}
			},
			documentElement: {
				appendChild: function(element: any) {
					element.parentNode = this
					if (element.nodeName === 'SCRIPT') {
						const urlData = parseURL(element.src, {protocol: 'http:', hostname: 'localhost', port: '', pathname: '/'})
						const handler = routes['GET ' + urlData.pathname] || serverErrorHandler.bind(null, element.src)
						const data = handler({url: urlData.pathname, query: urlData.search, body: null})
						parseQueryString(urlData.search)
						callAsync(function() {
							if (data.status === 200) {
								new Function('$window', 'with ($window) return ' + data.responseText).call($window, $window)
							}
							else if (typeof element.onerror === 'function') {
								element.onerror({type: 'error'})
							}
						} as any)
					}
				},
				removeChild: function(element: any) {
					element.parentNode = null
				},
			},
		},
		$defineRoutes: function(rules: Record<string, RouteHandler>) {
			routes = rules
		},
	}
	return $window
}
