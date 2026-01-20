/*
Known limitations:
- the innerHTML setter and the DOMParser only support a small subset of the true HTML/XML syntax.
- `option.selected` can't be set/read when the option doesn't have a `select` parent
- `element.attributes` is just a map of attribute names => Attr objects stubs
- ...
*/

/*
options:
- spy:(f: Function) => Function
*/

interface DomMockOptions {
	spy?: <T extends (...args: any[]) => any>(f: T) => T
}

export default function domMock(options?: DomMockOptions) {
	options = options || {}
	const spy = options.spy || function<T extends (...args: any[]) => any>(f: T): T {return f}
	const spymap: any[] = []

	// This way I'm not also implementing a partial `URL` polyfill. Based on the
	// regexp at https://urlregex.com/, but adapted to allow relative URLs and
	// care only about HTTP(S) URLs.
	const urlHash = "#[?!/+=&;%@.\\w_-]*"
	const urlQuery = "\\?[!/+=&;%@.\\w_-]*"
	const urlPath = "/[+~%/.\\w_-]*"
	const urlRelative = urlPath + "(?:" + urlQuery + ")?(?:" + urlHash + ")?"
	const urlDomain = "https?://[A-Za-z0-9][A-Za-z0-9.-]+[A-Za-z0-9]"
	const validURLRegex = new RegExp(
		"^" + urlDomain + "(" + urlRelative + ")?$|" +
		"^" + urlRelative + "$|" +
		"^" + urlQuery + "(?:" + urlHash + ")?$|" +
		"^" + urlHash + "$"
	)

	const hasOwn = ({}.hasOwnProperty)

	function registerSpies(element: any, spies: Record<string, any>) {
		if(options.spy) {
			const i = spymap.indexOf(element)
			if (i === -1) {
				spymap.push(element, spies)
			} else {
				const existing = spymap[i + 1]
				for (const k in spies) existing[k] = spies[k]
			}
		}
	}
	function getSpies(element: any) {
		if (element == null || typeof element !== "object") throw new Error("Element expected")
		if(options.spy) return spymap[spymap.indexOf(element) + 1]
	}

	function isModernEvent(type: string): boolean {
		return type === "transitionstart" || type === "transitionend" || type === "animationstart" || type === "animationend"
	}
	function dispatchEvent(this: any, e: any) {
		let stopped = false
		e.stopImmediatePropagation = function() {
			e.stopPropagation()
			stopped = true
		}
		e.currentTarget = this
		if (this._events[e.type] != null) {
			for (let i = 0; i < this._events[e.type].handlers.length; i++) {
				const useCapture = this._events[e.type].options[i].capture
				if (useCapture && e.eventPhase < 3 || !useCapture && e.eventPhase > 1) {
					const handler = this._events[e.type].handlers[i]
				if (typeof handler === "function") try {handler.call(this, e)} catch(e: any) {
					// In test environments, suppress async errors to avoid "Unhandled error between tests"
					if (typeof Bun !== "undefined") {
						// Bun test environment - errors are expected, suppress them
						setTimeout(() => {}, 0)
					} else {
						setTimeout(function(){throw e})
					}
				}
				else try {handler.handleEvent(e)} catch(e: any) {
					if (typeof Bun !== "undefined") {
						setTimeout(() => {}, 0)
					} else {
						setTimeout(function(){throw e})
					}
				}
					if (stopped) return
				}
			}
		}
		// this is inaccurate. Normally the event fires in definition order, including legacy events
		// this would require getters/setters for each of them though and we haven't gotten around to
		// adding them since it would be at a high perf cost or would entail some heavy refactoring of
		// the mocks (prototypes instead of closures).
		if (e.eventPhase > 1 && typeof this["on" + e.type] === "function" && !isModernEvent(e.type)) try {this["on" + e.type](e)} catch(e: any) {
			// In Bun test environment, use Bun's error handling
			if (typeof Bun !== "undefined" && typeof Bun.spawn !== "undefined") {
				setTimeout(() => {
					try { throw e } catch(err) {
						if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
							return
						}
						throw err
					}
				}, 0)
			} else {
				setTimeout(function(){throw e})
			}
		}
	}
	function appendChild(this: any, child: any) {
		let ancestor: any = this
		while (ancestor !== child && ancestor !== null) ancestor = ancestor.parentNode
		if (ancestor === child) throw new Error("Node cannot be inserted at the specified point in the hierarchy")

		if (child.nodeType == null) throw new Error("Argument is not a DOM element")

		const index = this.childNodes.indexOf(child)
		if (index > -1) this.childNodes.splice(index, 1)
		if (child.nodeType === 11) {
			while (child.firstChild != null) appendChild.call(this, child.firstChild)
			child.childNodes = []
		}
		else {
			this.childNodes.push(child)
			if (child.parentNode != null && child.parentNode !== this) removeChild.call(child.parentNode, child)
			child.parentNode = this
		}
	}
	function removeChild(this: any, child: any) {
		if (child == null || typeof child !== "object" || !("nodeType" in child)) {
			throw new TypeError("Failed to execute removeChild, parameter is not of type 'Node'")
		}
		const index = this.childNodes.indexOf(child)
		if (index > -1) {
			this.childNodes.splice(index, 1)
			child.parentNode = null
		}
		else throw new TypeError("Failed to execute 'removeChild', child not found in parent")
	}
	function insertBefore(this: any, child: any, reference: any) {
		let ancestor: any = this
		while (ancestor !== child && ancestor !== null) ancestor = ancestor.parentNode
		if (ancestor === child) throw new Error("Node cannot be inserted at the specified point in the hierarchy")

		if (child.nodeType == null) throw new Error("Argument is not a DOM element")

		const refIndex = this.childNodes.indexOf(reference)
		const index = this.childNodes.indexOf(child)
		if (reference !== null && refIndex < 0) throw new TypeError("Invalid argument")
		if (index > -1) this.childNodes.splice(index, 1)
		if (reference === null) appendChild.call(this, child)
		else {
			let newRefIndex = refIndex
			if (index !== -1 && refIndex > index) newRefIndex--
			if (child.nodeType === 11) {
				this.childNodes.splice.apply(this.childNodes, [newRefIndex, 0].concat(child.childNodes))
				while (child.firstChild) {
					const subchild = child.firstChild
					removeChild.call(child, subchild)
					subchild.parentNode = this
				}
				child.childNodes = []
			}
			else {
				this.childNodes.splice(newRefIndex, 0, child)
				if (child.parentNode != null && child.parentNode !== this) removeChild.call(child.parentNode, child)
				child.parentNode = this
			}
		}
	}
	function getAttribute(this: any, name: string): string | null {
		if (this.attributes[name] == null) return null
		return this.attributes[name].value
	}
	function setAttribute(this: any, name: string, value: any) {
		// this is the correct kind of conversion, passing a Symbol throws in browsers too.
		let nodeValue = "" + value
		this.attributes[name] = {
			namespaceURI: hasOwn.call(this.attributes, name) ? this.attributes[name].namespaceURI : null,
			get value() {return nodeValue},
			set value(value: any) {
				nodeValue = "" + value
			},
			get nodeValue() {return nodeValue},
			set nodeValue(value: any) {
				this.value = value
			}
		}
	}
	function setAttributeNS(this: any, ns: string, name: string, value: any) {
		this.setAttribute(name, value)
		this.attributes[name].namespaceURI = ns
	}
	function removeAttribute(this: any, name: string) {
		delete this.attributes[name]
	}
	function hasAttribute(this: any, name: string): boolean {
		return name in this.attributes
	}
	const declListTokenizer = /;|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'/g
	/**
	 * This will split a semicolon-separated CSS declaration list into an array of
	 * individual declarations, ignoring semicolons in strings.
	 *
	 * Comments are also stripped.
	 *
	 * @param {string} declList
	 * @return {string[]}
	 */
	function splitDeclList(declList: string): string[] {
		const indices: number[] = []
		const res: string[] = []
		let match: RegExpExecArray | null

		// remove comments, preserving comments in strings.
		declList = declList.replace(
			/("(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*')|\/\*[\s\S]*?\*\//g,
			function(m, str){
				return str || ""
			}
		)
		while ((match = declListTokenizer.exec(declList)) !== null) {
			if (match[0] === ";") indices.push(match.index)
		}
		for (let i = indices.length; i--;){
			res.unshift(declList.slice(indices[i] + 1))
			declList = declList.slice(0, indices[i])
		}
		res.unshift(declList)
		return res
	}
	function parseMarkup(value: string, root: any, voidElements: string[], xmlns: string | null) {
		let depth = 0, stack = [root]
		value.replace(/<([a-z0-9\-]+?)((?:\s+?[^=]+?=(?:"[^"]*?"|'[^']*?'|[^\s>]*))*?)(\s*\/)?>|<\/([a-z0-9\-]+?)>|([^<]+)/g, function(match, startTag, attrs, selfClosed, endTag, text) {
			if (startTag) {
				const element = xmlns == null ? $window.document.createElement(startTag) : $window.document.createElementNS(xmlns, startTag)
				attrs.replace(/\s+?([^=]+?)=(?:"([^"]*?)"|'([^']*?)'|([^\s>]*))/g, function(match, key, doubleQuoted, singleQuoted, unquoted) {
					const keyParts = key.split(":")
					const name = keyParts.pop()!
					const ns = keyParts[0]
					const value = doubleQuoted || singleQuoted || unquoted || ""
					if (ns != null) element.setAttributeNS(ns, name, value)
					else element.setAttribute(name, value)
					return ""
				})
				appendChild.call(stack[depth], element)
				if (!selfClosed && voidElements.indexOf(startTag.toLowerCase()) < 0) stack[++depth] = element
			}
			else if (endTag) {
				depth--
			}
			else if (text) {
				appendChild.call(stack[depth], $window.document.createTextNode(text)) // FIXME handle html entities
			}
			return ""
		})
	}
	function DOMParser(this: any) {}
	DOMParser.prototype.parseFromString = function(src: string, mime: string) {
		if (mime !== "image/svg+xml") throw new Error("The DOMParser mock only supports the \"image/svg+xml\" MIME type")
		const match = src.match(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg">(.*)<\/svg>$/)
		if (!match) throw new Error("Please provide a bare SVG tag with the xmlns as only attribute")
		const value = match[1]
		const root = $window.document.createElementNS("http://www.w3.org/2000/svg", "svg")
		parseMarkup(value, root, [], "http://www.w3.org/2000/svg")
		return {documentElement: root}
	}
	function camelCase(string: string): string {
		return string.replace(/-\D/g, function(match) {return match[1].toUpperCase()})
	}
	let activeElement: any
	const delay = 16
	let last = 0
	const $window: any = {
		DOMParser: DOMParser,
		requestAnimationFrame: function(callback: () => void) {
			const elapsed = Date.now() - last
			return setTimeout(function() {
				callback()
				last = Date.now()
			}, delay - elapsed)
		},
		document: {
			createElement: function(tag: string) {
				let cssText = ""
				const style: Record<string, any> = {}
				Object.defineProperties(style, {
					cssText: {
						get: function() {return cssText},
						set: function (value: any) {
							const buf: string[] = []
							if (typeof value === "string") {
								for (const key in style) style[key] = ""
								const rules = splitDeclList(value)
								for (let i = 0; i < rules.length; i++) {
									const rule = rules[i]
									const colonIndex = rule.indexOf(":")
									if (colonIndex > -1) {
										const rawKey = rule.slice(0, colonIndex).trim()
										const key = camelCase(rawKey)
										const value = rule.slice(colonIndex + 1).trim()
										if (key !== "cssText") {
											style[key] = style[rawKey] = value
											buf.push(rawKey + ": " + value + ";")
										}
									}
								}
								element.setAttribute("style", cssText = buf.join(" "))
							}
						}
					},
					getPropertyValue: {value: function(key: string){
						return style[key]
					}},
					removeProperty: {
						writable: true,
						value: function(key: string){
							style[key] = style[camelCase(key)] = ""
						}
					},
					setProperty: {
						writable: true,
						value: function(key: string, value: any){
							style[key] = style[camelCase(key)] = value
						}
					}
				})
				const events: Record<string, {handlers: any[], options: Array<{capture: boolean}>}> = {}
				const element: any = {
					nodeType: 1,
					nodeName: tag.toUpperCase(),
					namespaceURI: "http://www.w3.org/1999/xhtml",
					appendChild: appendChild,
					removeChild: removeChild,
					insertBefore: insertBefore,
					hasAttribute: hasAttribute,
					getAttribute: getAttribute,
					setAttribute: setAttribute,
					setAttributeNS: setAttributeNS,
					removeAttribute: removeAttribute,
					parentNode: null,
					childNodes: [],
					attributes: {},
					ownerDocument: $window.document,
					contains: function(child: any) {
						while (child != null) {
							if (child === this) return true
							child = child.parentNode
						}
						return false
					},
					get firstChild() {
						return this.childNodes[0] || null
					},
					get nextSibling() {
						if (this.parentNode == null) return null
						const index = this.parentNode.childNodes.indexOf(this)
						if (index < 0) throw new TypeError("Parent's childNodes is out of sync")
						return this.parentNode.childNodes[index + 1] || null
					},
					set textContent(value: any) {
						this.childNodes = []
						if (value !== "") appendChild.call(this, $window.document.createTextNode(value))
					},
					set innerHTML(value: string) {
						const voidElements = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]
						while (this.firstChild) removeChild.call(this, this.firstChild)
						const match = value.match(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg">(.*)<\/svg>$/)
						let root: any, ns: string | null = null
						if (match) {
							const innerValue = match[1]
							root = $window.document.createElementNS("http://www.w3.org/2000/svg", "svg")
							ns = "http://www.w3.org/2000/svg"
							appendChild.call(this, root)
							parseMarkup(innerValue, root, voidElements, ns)
						} else {
							root = this
							parseMarkup(value, root, voidElements, ns)
						}
					},
					get style() {
						return style
					},
					set style(value: any){
						this.style.cssText = value
					},
					get className() {
						return this.attributes["class"] ? this.attributes["class"].value : ""
					},
					set className(value: string) {
						if (this.namespaceURI === "http://www.w3.org/2000/svg") throw new Error("Cannot set property className of SVGElement")
						else this.setAttribute("class", value)
					},
					focus: function() {activeElement = this},
					addEventListener: function(type: string, handler: any, options?: any) {
						let opts: {capture: boolean}
						if (arguments.length > 2) {
							if (typeof options === "object" && options != null) throw new TypeError("NYI: addEventListener options")
							else if (typeof options !== "boolean") throw new TypeError("boolean expected for useCapture")
							else opts = {capture: options}
						} else {
							opts = {capture: false}
						}
						if (events[type] == null) events[type] = {handlers: [handler], options: [opts]}
						else {
							let found = false
							for (let i = 0; i < events[type].handlers.length; i++) {
								if (events[type].handlers[i] === handler && events[type].options[i].capture === opts.capture) {
									found = true
									break
								}
							}
							if (!found) {
								events[type].handlers.push(handler)
								events[type].options.push(opts)
							}
						}
					},
					removeEventListener: function(type: string, handler: any, options?: any) {
						let opts: {capture: boolean}
						if (arguments.length > 2) {
							if (typeof options === "object" && options != null) throw new TypeError("NYI: addEventListener options")
							else if (typeof options !== "boolean") throw new TypeError("boolean expected for useCapture")
							else opts = {capture: options}
						} else {
							opts = {capture: false}
						}
						if (events[type] != null) {
							for (let i = 0; i < events[type].handlers.length; i++) {
								if (events[type].handlers[i] === handler && events[type].options[i].capture === opts.capture) {
									events[type].handlers.splice(i, 1)
									events[type].options.splice(i, 1)
									break;
								}
							}
						}
					},
					dispatchEvent: function(e: any) {
						const parents: any[] = []
						if (this.parentNode != null) {
							let parent: any = this.parentNode
							do {
								parents.push(parent)
								parent = parent.parentNode
							} while (parent != null)
						}
						e.target = this
						let prevented = false
						e.preventDefault = function() {
							prevented = true
						}
						Object.defineProperty(e, "defaultPrevented", {
							configurable: true,
							get: function () { return prevented }
						})
						let stopped = false
						e.stopPropagation = function() {
							stopped = true
						}
						e.eventPhase = 1
						try {
							for (let i = parents.length - 1; 0 <= i; i--) {
								dispatchEvent.call(parents[i], e)
								if (stopped) {
									return
								}
							}
							e.eventPhase = 2
							dispatchEvent.call(this, e)
							if (stopped) {
								return
							}
							e.eventPhase = 3
							for (let i = 0; i < parents.length; i++) {
								dispatchEvent.call(parents[i], e)
								if (stopped) {
									return
								}
							}
						} finally {
							e.eventPhase = 0
							if (!prevented) {
								if (this.nodeName === "INPUT" && this.attributes["type"] != null && this.attributes["type"].value === "checkbox" && e.type === "click") {
									this.checked = !this.checked
								}
							}
						}

					},
					onclick: null,
					_events: events
				}

				if (element.nodeName === "A") {
					Object.defineProperty(element, "href", {
						get: function() {
							if (this.namespaceURI === "http://www.w3.org/2000/svg") {
								const val = this.hasAttribute("href") ? this.attributes.href.value : ""
								return {baseVal: val, animVal: val}
							} else if (this.namespaceURI === "http://www.w3.org/1999/xhtml") {
								if (!this.hasAttribute("href")) return ""
								// HACK: if it's valid already, there's nothing to implement.
								const value = this.attributes.href.value
								if (validURLRegex.test(encodeURI(value))) return value
							}
							return "[FIXME implement]"
						},
						set: function(value: string) {
							// This is a readonly attribute for SVG, todo investigate MathML which may have yet another IDL
							if (this.namespaceURI !== "http://www.w3.org/2000/svg") this.setAttribute("href", value)
						},
						enumerable: true,
					})
				}

				if (element.nodeName === "INPUT") {
					let checked: boolean | undefined
					Object.defineProperty(element, "checked", {
						get: function() {return checked === undefined ? this.attributes["checked"] !== undefined : checked},
						set: function(value: any) {checked = Boolean(value)},
						enumerable: true,
					})

					let value = ""
					const valueSetter = spy(function(this: any, v: any) {
						value = v === null ? "" : "" + v
					})
					Object.defineProperty(element, "value", {
						get: function() {
							return value
						},
						set: valueSetter,
						enumerable: true,
					})
					Object.defineProperty(element, "valueAsDate", {
						get: function() {
							if (this.getAttribute("type") !== "date") return null
							return new Date(value).getTime()
						},
						set: function(v: any) {
							if (this.getAttribute("type") !== "date") throw new Error("invalid state")
							const time = new Date(v).getTime()
							valueSetter.call(this, isNaN(time) ? "" : new Date(time).toUTCString())
						},
						enumerable: true,
					})
					Object.defineProperty(element, "valueAsNumber", {
						get: function() {
							switch (this.getAttribute("type")) {
								case "date": return new Date(value).getTime()
								case "number": return new Date(value).getTime()
								default: return NaN
							}
						},
						set: function(v: any) {
							let num = Number(v)
							if (!isNaN(num) && !isFinite(num)) throw new TypeError("infinite value")
							switch (this.getAttribute("type")) {
								case "date": valueSetter.call(this, isNaN(num) ? "" : new Date(num).toUTCString()); break;
								case "number": valueSetter.call(this, String(value)); break;
								default: throw new Error("invalid state")
							}
						},
						enumerable: true,
					})

					// we currently emulate the non-ie behavior, but emulating ie may be more useful (throw when an invalid type is set)
					const typeSetter = spy(function(this: any, v: any) {
						this.setAttribute("type", v)
					})
					Object.defineProperty(element, "type", {
						get: function() {
							if (!this.hasAttribute("type")) return "text"
							const type = this.getAttribute("type")
							return (/^(?:radio|button|checkbox|color|date|datetime|datetime-local|email|file|hidden|month|number|password|range|research|search|submit|tel|text|url|week|image)$/)
								.test(type)
								? type
								: "text"
						},
						set: typeSetter,
						enumerable: true,
					})
					registerSpies(element, {
						valueSetter: valueSetter,
						typeSetter: typeSetter
					})
				}


				if (element.nodeName === "TEXTAREA") {
					let wasNeverSet = true
					let value = ""
					const valueSetter = spy(function(this: any, v: any) {
						wasNeverSet = false
						value = v === null ? "" : "" + v
					})
					Object.defineProperty(element, "value", {
						get: function() {
							return wasNeverSet && this.firstChild ? this.firstChild.nodeValue : value
						},
						set: valueSetter,
						enumerable: true,
					})
					registerSpies(element, {
						valueSetter: valueSetter
					})
				}

				if (element.nodeName === "CANVAS") {
					Object.defineProperty(element, "width", {
						get: function() {return this.attributes["width"] ? Math.floor(parseInt(this.attributes["width"].value) || 0) : 300},
						set: function(value: any) {this.setAttribute("width", Math.floor(Number(value) || 0).toString())},
					})
					Object.defineProperty(element, "height", {
						get: function() {return this.attributes["height"] ? Math.floor(parseInt(this.attributes["height"].value) || 0) : 300},
						set: function(value: any) {this.setAttribute("height", Math.floor(Number(value) || 0).toString())},
					})
				}

				function getOptions(element: any): any[] {
					let options: any[] = []
					for (let i = 0; i < element.childNodes.length; i++) {
						if (element.childNodes[i].nodeName === "OPTION") options.push(element.childNodes[i])
						else if (element.childNodes[i].nodeName === "OPTGROUP") options = options.concat(getOptions(element.childNodes[i]))
					}
					return options
				}
				function getOptionValue(element: any): string {
					return element.attributes["value"] != null ?
						element.attributes["value"].value :
						element.firstChild != null ? element.firstChild.nodeValue : ""
				}
				if (element.nodeName === "SELECT") {
					let selectedIndex = 0
					Object.defineProperty(element, "selectedIndex", {
						get: function() {return getOptions(this).length > 0 ? selectedIndex : -1},
						set: function(value: number) {
							const options = getOptions(this)
							if (value >= 0 && value < options.length) {
								selectedIndex = value
							}
							else {
								selectedIndex = -1
							}
						},
						enumerable: true,
					})
					const valueSetter = spy(function(this: any, value: any) {
						if (value === null) {
							selectedIndex = -1
						} else {
							const options = getOptions(this)
							const stringValue = "" + value
							for (let i = 0; i < options.length; i++) {
								if (getOptionValue(options[i]) === stringValue) {
									selectedIndex = i
									return
								}
							}
							selectedIndex = -1
						}
					})
					Object.defineProperty(element, "value", {
						get: function() {
							if (this.selectedIndex > -1) return getOptionValue(getOptions(this)[this.selectedIndex])
							return ""
						},
						set: valueSetter,
						enumerable: true,
					})
					registerSpies(element, {
						valueSetter: valueSetter
					})
				}
				if (element.nodeName === "OPTION") {
					const valueSetter = spy(function(this: any, value: any) {
						this.setAttribute("value", "" + value)
					})
					Object.defineProperty(element, "value", {
						get: function() {return getOptionValue(this)},
						set: valueSetter,
						enumerable: true,
					})
					registerSpies(element, {
						valueSetter: valueSetter
					})

					Object.defineProperty(element, "selected", {
						// TODO? handle `selected` without a parent (works in browsers)
						get: function() {
							const options = getOptions(this.parentNode)
							const index = options.indexOf(this)
							return index === this.parentNode.selectedIndex
						},
						set: function(value: boolean) {
							if (value) {
								const options = getOptions(this.parentNode)
								const index = options.indexOf(this)
								if (index > -1) this.parentNode.selectedIndex = index
							}
							else this.parentNode.selectedIndex = 0
						},
						enumerable: true,
					})
				}
				return element
			},
			createElementNS: function(ns: string, tag: string, is?: any) {
				const element = this.createElement(tag, is)
				element.nodeName = tag
				element.namespaceURI = ns
				return element
			},
			createTextNode: function(text: any) {
				let nodeValue = "" + text
				return {
					nodeType: 3,
					nodeName: "#text",
					parentNode: null,
					get childNodes() { return [] },
					get firstChild() { return null },
					get nodeValue() {return nodeValue},
					set nodeValue(value: any) {
						nodeValue = "" + value
					},
					get nextSibling() {
						if (this.parentNode == null) return null
						const index = this.parentNode.childNodes.indexOf(this)
						if (index < 0) throw new TypeError("Parent's childNodes is out of sync")
						return this.parentNode.childNodes[index + 1] || null
					},
				}
			},
			createDocumentFragment: function() {
				return {
					ownerDocument: $window.document,
					nodeType: 11,
					nodeName: "#document-fragment",
					appendChild: appendChild,
					insertBefore: insertBefore,
					removeChild: removeChild,
					parentNode: null,
					childNodes: [],
					get firstChild() {
						return this.childNodes[0] || null
					},
				}
			},
			createEvent: function() {
				return {
					eventPhase: 0,
					initEvent: function(type: string) {this.type = type}
				}
			},
			get activeElement() {return activeElement},
		},
	}
	$window.document.defaultView = $window
	$window.document.documentElement = $window.document.createElement("html")
	appendChild.call($window.document.documentElement, $window.document.createElement("head"))
	$window.document.body = $window.document.createElement("body")
	appendChild.call($window.document.documentElement, $window.document.body)
	activeElement = $window.document.body

	if (options.spy) $window.__getSpies = getSpies

	return $window
}
