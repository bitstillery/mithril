import parseQueryString from '../querystring/parse'

import callAsync from './callAsync'
import parseURL from './parseURL'

export default function() {
    var routes = {}
    // var callback = "callback"
    var serverErrorHandler = function(url) {
        return {status: 500, responseText: 'server error, most likely the URL was not defined ' + url}
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    function FormData() {}
    var $window = {
        FormData: FormData,
        URLSearchParams: URLSearchParams,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        XMLHttpRequest: function XMLHttpRequest() {
            var args = {}
            var headers = {}
            var aborted = false
            this.setRequestHeader = function(header, value) {
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
            this.getRequestHeader = function(header) {
                return headers[header]
            }
            this.open = function(method, url, async, user, password) {
                var urlData = parseURL(url, {protocol: 'http:', hostname: 'localhost', port: '', pathname: '/'})
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
            this.send = function(body) {
                var self = this
				
                var completeResponse = function(data) {
                    self._responseCompleted = true
                    if (!aborted) {
                        self.status = data.status
                        // Match spec
                        if (self.responseType === 'json') {
                            try { self.response = JSON.parse(data.responseText) }
                            catch (e) { /* ignore */ }
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
                        })
                    }
                }

                var data
                if (!aborted) {
                    var handler = routes[args.method + ' ' + args.pathname] || serverErrorHandler.bind(null, args.pathname)
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
            createElement: function(tag) {
                return {nodeName: tag.toUpperCase(), parentNode: null}
            },
            documentElement: {
                appendChild: function(element) {
                    element.parentNode = this
                    if (element.nodeName === 'SCRIPT') {
                        var urlData = parseURL(element.src, {protocol: 'http:', hostname: 'localhost', port: '', pathname: '/'})
                        var handler = routes['GET ' + urlData.pathname] || serverErrorHandler.bind(null, element.src)
                        var data = handler({url: urlData.pathname, query: urlData.search, body: null})
                        parseQueryString(urlData.search)
                        callAsync(function() {
                            if (data.status === 200) {
                                new Function('$window', 'with ($window) return ' + data.responseText).call($window, $window)
                            }
                            else if (typeof element.onerror === 'function') {
                                element.onerror({type: 'error'})
                            }
                        })
                    }
                },
                removeChild: function(element) {
                    element.parentNode = null
                },
            },
        },
        $defineRoutes: function(rules) {
            routes = rules
        },
    }
    return $window
}
