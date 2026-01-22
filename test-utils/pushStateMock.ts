// @ts-nocheck
import parseURL from './parseURL'
import callAsync from './callAsync'

interface HistoryEntry {
	url: string
	isNew: boolean
	state: any
	title: string | null
}

interface PushStateMockOptions {
	window?: any
	protocol?: string
	hostname?: string
}

function debouncedAsync(f: () => void) {
	let ref: ReturnType<typeof setTimeout> | null = null
	return function() {
		if (ref != null) return
		ref = callAsync(function() {
			ref = null
			f()
		} as any)
	}
}

export default function pushStateMock(options?: PushStateMockOptions) {
	if (options == null) options = {}

	const $window: any = options.window || {}
	let protocol = options.protocol || 'http:'
	let hostname = options.hostname || 'localhost'
	let port = ''
	let pathname = '/'
	let search = ''
	let hash = ''

	let past: HistoryEntry[] = [{url: getURL(), isNew: true, state: null, title: null}], future: HistoryEntry[] = []

	function getURL(): string {
		if (protocol === 'file:') return protocol + '//' + pathname + search + hash
		return protocol + '//' + hostname + prefix(':', port) + pathname + search + hash
	}
	function setURL(value: string): boolean {
		const data = parseURL(value, {protocol: protocol, hostname: hostname, port: port, pathname: pathname})
		let isNew = false
		if (data.protocol != null && data.protocol !== protocol) {
			protocol = data.protocol
			isNew = true
		}
		if (data.hostname != null && data.hostname !== hostname) {
			hostname = data.hostname
			isNew = true
		}
		if (data.port != null && data.port !== port) {
			port = data.port
			isNew = true
		}
		if (data.pathname != null && data.pathname !== pathname) {
			pathname = data.pathname
			isNew = true
		}
		if (data.search != null && data.search !== search) {
			search = data.search
			isNew = true
		}
		if (data.hash != null && data.hash !== hash) {
			hash = data.hash
			if (!isNew) {
				hashchange()
			}
		}
		return isNew
	}

	function prefix(prefix: string, value: string): string {
		if (value === '') return ''
		return (value.charAt(0) !== prefix ? prefix : '') + value
	}
	function _hashchange() {
		if (typeof $window.onhashchange === 'function') $window.onhashchange({type: 'hashchange'})
	}
	const hashchange = debouncedAsync(_hashchange)
	function popstate() {
		if (typeof $window.onpopstate === 'function') $window.onpopstate({type: 'popstate', state: $window.history.state})
	}
	function unload() {
		if (typeof $window.onunload === 'function') $window.onunload({type: 'unload'})
	}

	$window.location = {
		get protocol() {
			return protocol
		},
		get hostname() {
			return hostname
		},
		get port() {
			return port
		},
		get pathname() {
			return pathname
		},
		get search() {
			return search
		},
		get hash() {
			return hash
		},
		get origin() {
			if (protocol === 'file:') return 'null'
			return protocol + '//' + hostname + prefix(':', port)
		},
		get host() {
			if (protocol === 'file:') return ''
			return hostname + prefix(':', port)
		},
		get href() {
			return getURL()
		},

		set protocol(value: string) {
			throw new Error('Protocol is read-only')
		},
		set hostname(value: string) {
			unload()
			past.push({url: getURL(), isNew: true, state: null, title: null})
			future = []
			hostname = value
		},
		set port(value: string) {
			if (protocol === 'file:') throw new Error('Port is read-only under `file://` protocol')
			unload()
			past.push({url: getURL(), isNew: true, state: null, title: null})
			future = []
			port = value
		},
		set pathname(value: string) {
			if (protocol === 'file:') throw new Error('Pathname is read-only under `file://` protocol')
			unload()
			past.push({url: getURL(), isNew: true, state: null, title: null})
			future = []
			pathname = prefix('/', value)
		},
		set search(value: string) {
			unload()
			past.push({url: getURL(), isNew: true, state: null, title: null})
			future = []
			search = prefix('?', value)
		},
		set hash(value: string) {
			const oldHash = hash
			past.push({url: getURL(), isNew: false, state: null, title: null})
			future = []
			hash = prefix('#', value)
			if (oldHash != hash) hashchange()
		},

		set origin(value: string) {
			// origin is writable but ignored
		},
		set host(value: string) {
			// host is writable but ignored in Chrome
		},
		set href(value: string) {
			const url = getURL()
			const isNew = setURL(value)
			if (isNew) {
				setURL(url)
				unload()
				setURL(value)
			}
			past.push({url: url, isNew: isNew, state: null, title: null})
			future = []
		},
	}
	$window.history = {
		pushState: function(state: any, title: string | null, url: string) {
			past.push({url: getURL(), isNew: false, state: state, title: title})
			future = []
			setURL(url)
		},
		replaceState: function(state: any, title: string | null, url: string) {
			const entry = past[past.length - 1]
			entry.state = state
			entry.title = title
			setURL(url)
		},
		back: function() {
			if (past.length > 1) {
				const entry = past.pop()!
				if (entry.isNew) unload()
				future.push({url: getURL(), isNew: false, state: entry.state, title: entry.title})
				setURL(entry.url)
				if (!entry.isNew) popstate()
			}
		},
		forward: function() {
			const entry = future.pop()
			if (entry != null) {
				if (entry.isNew) unload()
				past.push({url: getURL(), isNew: false, state: entry.state, title: entry.title})
				setURL(entry.url)
				if (!entry.isNew) popstate()
			}
		},
		get state() {
			return past.length === 0 ? null : past[past.length - 1].state
		},
	}
	$window.onpopstate = null
	$window.onhashchange = null
	$window.onunload = null

	$window.addEventListener = function(name: string, handler: any) {
		$window['on' + name] = handler
	}

	$window.removeEventListener = function(name: string, handler: any) {
		$window['on' + name] = handler
	}

	return $window
}
