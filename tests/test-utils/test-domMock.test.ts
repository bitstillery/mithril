import {describe, test, expect, beforeEach, afterEach} from 'bun:test'

import {spy} from '../../test-utils/test-helpers'
import domMock from '../../test-utils/domMock'

describe('domMock', () => {
	let $document: any, $window: any
	beforeEach(() => {
		$window = domMock()
		$document = $window.document
	})

	describe('createElement', () => {
		test('works', () => {
			let node = $document.createElement('div')

			expect(node.nodeType).toBe(1)
			expect(node.nodeName).toBe('DIV')
			expect(node.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
			expect(node.parentNode).toBe(null)
			expect(node.childNodes.length).toBe(0)
			expect(node.firstChild).toBe(null)
			expect(node.nextSibling).toBe(null)
		})
	})

	describe('createElementNS', () => {
		test('works', () => {
			let node = $document.createElementNS('http://www.w3.org/2000/svg', 'svg')

			expect(node.nodeType).toBe(1)
			expect(node.nodeName).toBe('svg')
			expect(node.namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(node.parentNode).toBe(null)
			expect(node.childNodes.length).toBe(0)
			expect(node.firstChild).toBe(null)
			expect(node.nextSibling).toBe(null)
		})
	})

	describe('createTextNode', () => {
		test('works', () => {
			let node = $document.createTextNode('abc')

			expect(node.nodeType).toBe(3)
			expect(node.nodeName).toBe('#text')
			expect(node.parentNode).toBe(null)
			expect(node.nodeValue).toBe('abc')
		})
		test('works w/ number', () => {
			let node = $document.createTextNode(123)

			expect(node.nodeValue).toBe('123')
		})
		test('works w/ null', () => {
			let node = $document.createTextNode(null)

			expect(node.nodeValue).toBe('null')
		})
		test('works w/ undefined', () => {
			let node = $document.createTextNode(undefined)

			expect(node.nodeValue).toBe('undefined')
		})
		test('works w/ object', () => {
			let node = $document.createTextNode({})

			expect(node.nodeValue).toBe('[object Object]')
		})
		test('does not unescape HTML', () => {
			let node = $document.createTextNode('<a>&amp;</a>')

			expect(node.nodeValue).toBe('<a>&amp;</a>')
		})
		test('nodeValue casts to string', () => {
			let node = $document.createTextNode('a')
			node.nodeValue = true

			expect(node.nodeValue).toBe('true')
		})
		if (typeof Symbol === 'function') {
			test('doesn\'t work with symbols', () => {
				let threw = false
				try {
					$document.createTextNode(Symbol('nono'))
				} catch(_e) {
					threw = true
				}
				expect(threw).toBe(true)
			})
			test('symbols can\'t be used as nodeValue', () => {
				let threw = false
				try {
					let node = $document.createTextNode('a')
					node.nodeValue = Symbol('nono')
				} catch(_e) {
					threw = true
				}
				expect(threw).toBe(true)
			})
		}
	})

	describe('createDocumentFragment', () => {
		test('works', () => {
			let node = $document.createDocumentFragment()

			expect(node.nodeType).toBe(11)
			expect(node.nodeName).toBe('#document-fragment')
			expect(node.parentNode).toBe(null)
			expect(node.childNodes.length).toBe(0)
			expect(node.firstChild).toBe(null)
		})
	})

	describe('appendChild', () => {
		test('works', () => {
			let parent = $document.createElement('div')
			let child = $document.createElement('a')
			parent.appendChild(child)

			expect(parent.childNodes.length).toBe(1)
			expect(parent.childNodes[0]).toBe(child)
			expect(parent.firstChild).toBe(child)
			expect(child.parentNode).toBe(parent)
		})
		test('moves existing', () => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			parent.appendChild(b)
			parent.appendChild(a)

			expect(parent.childNodes.length).toBe(2)
			expect(parent.childNodes[0]).toBe(b)
			expect(parent.childNodes[1]).toBe(a)
			expect(parent.firstChild).toBe(b)
			expect(parent.firstChild.nextSibling).toBe(a)
			expect(a.parentNode).toBe(parent)
			expect(b.parentNode).toBe(parent)
		})
		test('removes from old parent', () => {
			let parent = $document.createElement('div')
			let source = $document.createElement('span')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			source.appendChild(b)
			parent.appendChild(b)

			expect(source.childNodes.length).toBe(0)
		})
		test('transfers from fragment', () => {
			let parent = $document.createElement('div')
			let a = $document.createDocumentFragment('a')
			let b = $document.createElement('b')
			let c = $document.createElement('c')
			a.appendChild(b)
			a.appendChild(c)
			parent.appendChild(a)

			expect(parent.childNodes.length).toBe(2)
			expect(parent.childNodes[0]).toBe(b)
			expect(parent.childNodes[1]).toBe(c)
			expect(parent.firstChild).toBe(b)
			expect(parent.firstChild.nextSibling).toBe(c)
			expect(a.childNodes.length).toBe(0)
			expect(a.firstChild).toBe(null)
			expect(a.parentNode).toBe(null)
			expect(b.parentNode).toBe(parent)
			expect(c.parentNode).toBe(parent)
		})
		test('throws if appended to self', (done) => {
			let div = $document.createElement('div')
			try {div.appendChild(div)}
			catch(_e) {done()}
		})
		test('throws if appended to child', (done) => {
			let parent = $document.createElement('div')
			let child = $document.createElement('a')
			parent.appendChild(child)
			try {child.appendChild(parent)}
			catch(_e) {done()}
		})
		test('throws if child is not element', (done) => {
			let parent = $document.createElement('div')
			let child = 1
			try {parent.appendChild(child)}
			catch(_e) {done()}
		})
	})

	describe('removeChild', () => {
		test('works', () => {
			let parent = $document.createElement('div')
			let child = $document.createElement('a')
			parent.appendChild(child)
			parent.removeChild(child)

			expect(parent.childNodes.length).toBe(0)
			expect(parent.firstChild).toBe(null)
			expect(child.parentNode).toBe(null)
		})
		test('throws if not a child', (done) => {
			let parent = $document.createElement('div')
			let child = $document.createElement('a')
			try {parent.removeChild(child)}
			catch(_e) {done()}
		})
	})

	describe('insertBefore', () => {
		test('works', () => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			parent.insertBefore(b, a)

			expect(parent.childNodes.length).toBe(2)
			expect(parent.childNodes[0]).toBe(b)
			expect(parent.childNodes[1]).toBe(a)
			expect(parent.firstChild).toBe(b)
			expect(parent.firstChild.nextSibling).toBe(a)
			expect(a.parentNode).toBe(parent)
			expect(b.parentNode).toBe(parent)
		})
		test('moves existing', () => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			parent.appendChild(b)
			parent.insertBefore(b, a)

			expect(parent.childNodes.length).toBe(2)
			expect(parent.childNodes[0]).toBe(b)
			expect(parent.childNodes[1]).toBe(a)
			expect(parent.firstChild).toBe(b)
			expect(parent.firstChild.nextSibling).toBe(a)
			expect(a.parentNode).toBe(parent)
			expect(b.parentNode).toBe(parent)
		})
		test('moves existing node forward but not at the end', () => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			let c = $document.createElement('c')
			parent.appendChild(a)
			parent.appendChild(b)
			parent.appendChild(c)
			parent.insertBefore(a, c)

			expect(parent.childNodes.length).toBe(3)
			expect(parent.childNodes[0]).toBe(b)
			expect(parent.childNodes[1]).toBe(a)
			expect(parent.childNodes[2]).toBe(c)
			expect(parent.firstChild).toBe(b)
			expect(parent.firstChild.nextSibling).toBe(a)
			expect(parent.firstChild.nextSibling.nextSibling).toBe(c)
			expect(a.parentNode).toBe(parent)
			expect(b.parentNode).toBe(parent)
			expect(c.parentNode).toBe(parent)

		})
		test('removes from old parent', () => {
			let parent = $document.createElement('div')
			let source = $document.createElement('span')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			source.appendChild(b)
			parent.insertBefore(b, a)

			expect(source.childNodes.length).toBe(0)
		})
		test('transfers from fragment', () => {
			let parent = $document.createElement('div')
			let ref = $document.createElement('span')
			let a = $document.createDocumentFragment('a')
			let b = $document.createElement('b')
			let c = $document.createElement('c')
			parent.appendChild(ref)
			a.appendChild(b)
			a.appendChild(c)
			parent.insertBefore(a, ref)

			expect(parent.childNodes.length).toBe(3)
			expect(parent.childNodes[0]).toBe(b)
			expect(parent.childNodes[1]).toBe(c)
			expect(parent.childNodes[2]).toBe(ref)
			expect(parent.firstChild).toBe(b)
			expect(parent.firstChild.nextSibling).toBe(c)
			expect(parent.firstChild.nextSibling.nextSibling).toBe(ref)
			expect(a.childNodes.length).toBe(0)
			expect(a.firstChild).toBe(null)
			expect(a.parentNode).toBe(null)
			expect(b.parentNode).toBe(parent)
			expect(c.parentNode).toBe(parent)
		})
		test('appends if second arg is null', () => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			parent.insertBefore(b, null)

			expect(parent.childNodes.length).toBe(2)
			expect(parent.childNodes[0]).toBe(a)
			expect(parent.childNodes[1]).toBe(b)
			expect(parent.firstChild).toBe(a)
			expect(parent.firstChild.nextSibling).toBe(b)
			expect(a.parentNode).toBe(parent)
		})
		test('throws if appended to self', (done) => {
			let div = $document.createElement('div')
			let a = $document.createElement('a')
			div.appendChild(a)
			try {div.isnertBefore(div, a)}
			catch(_e) {done()}
		})
		test('throws if appended to child', (done) => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			parent.appendChild(a)
			a.appendChild(b)
			try {a.insertBefore(parent, b)}
			catch(_e) {done()}
		})
		test('throws if child is not element', (done) => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			parent.appendChild(a)
			try {parent.insertBefore(1, a)}
			catch(_e) {done()}
		})
		test('throws if inserted before itself', (done) => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			try {parent.insertBefore(a, a)}
			catch(_e) {done()}
		})
		test('throws if second arg is undefined', (done) => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			try {parent.insertBefore(a)}
			catch(_e) {done()}
		})
		test('throws if reference is not child', (done) => {
			let parent = $document.createElement('div')
			let a = $document.createElement('a')
			let b = $document.createElement('b')
			try {parent.insertBefore(a, b)}
			catch(_e) {done()}
		})
	})

	describe('getAttribute', () => {
		test('works', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', 'aaa')

			expect(div.getAttribute('id')).toBe('aaa')
		})
		test('works for attributes with a namespace', () => {
			let div = $document.createElement('div')
			div.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'aaa')

			expect(div.getAttribute('href')).toBe('aaa')
		})
	})

	describe('setAttribute', () => {
		test('works', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', 'aaa')

			expect(div.attributes['id'].value).toBe('aaa')
			expect(div.attributes['id'].nodeValue).toBe('aaa')
			expect(div.attributes['id'].namespaceURI).toBe(null)
		})
		test('works w/ number', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', 123)

			expect(div.attributes['id'].value).toBe('123')
		})
		test('works w/ null', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', null)

			expect(div.attributes['id'].value).toBe('null')
		})
		test('works w/ undefined', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', undefined)

			expect(div.attributes['id'].value).toBe('undefined')
		})
		test('works w/ object', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', {})

			expect(div.attributes['id'].value).toBe('[object Object]')
		})
		test('setting via attributes map stringifies', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', 'a')
			div.attributes['id'].value = 123

			expect(div.attributes['id'].value).toBe('123')

			div.attributes['id'].nodeValue = 456

			expect(div.attributes['id'].value).toBe('456')
		})
	})
	describe('hasAttribute', () => {
		test('works', () => {
			let div = $document.createElement('div')

			expect(div.hasAttribute('id')).toBe(false)

			div.setAttribute('id', 'aaa')

			expect(div.hasAttribute('id')).toBe(true)

			div.removeAttribute('id')

			expect(div.hasAttribute('id')).toBe(false)
		})
	})

	describe('setAttributeNS', () => {
		test('works', () => {
			let a = $document.createElementNS('http://www.w3.org/2000/svg', 'a')
			a.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/aaa')

			expect(a.href).toEqual({baseVal: '/aaa', animVal: '/aaa'})
			expect(a.attributes['href'].value).toBe('/aaa')
			expect(a.attributes['href'].namespaceURI).toBe('http://www.w3.org/1999/xlink')
		})
		test('works w/ number', () => {
			let a = $document.createElementNS('http://www.w3.org/2000/svg', 'a')
			a.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 123)

			expect(a.href).toEqual({baseVal: '123', animVal: '123'})
			expect(a.attributes['href'].value).toBe('123')
			expect(a.attributes['href'].namespaceURI).toBe('http://www.w3.org/1999/xlink')
		})
		test('attributes with a namespace can be querried, updated and removed with non-NS functions', () => {
			let a = $document.createElementNS('http://www.w3.org/2000/svg', 'a')
			a.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/aaa')

			expect(a.hasAttribute('href')).toBe(true)
			expect(a.getAttribute('href')).toBe('/aaa')

			a.setAttribute('href', '/bbb')

			expect(a.href).toEqual({baseVal: '/bbb', animVal: '/bbb'})
			expect(a.getAttribute('href')).toBe('/bbb')
			expect(a.attributes['href'].value).toBe('/bbb')
			expect(a.attributes['href'].namespaceURI).toBe('http://www.w3.org/1999/xlink')

			a.removeAttribute('href')

			expect(a.hasAttribute('href')).toBe(false)
			expect(a.getAttribute('href')).toBe(null)
			expect('href' in a.attributes).toBe(false)
		})
	})

	describe('removeAttribute', () => {
		test('works', () => {
			let div = $document.createElement('div')
			div.setAttribute('id', 'aaa')
			div.removeAttribute('id')

			expect('id' in div.attributes).toBe(false)
		})
	})

	describe('textContent', () => {
		test('works', () => {
			let div = $document.createElement('div')
			div.textContent = 'aaa'

			expect(div.childNodes.length).toBe(1)
			expect(div.firstChild.nodeType).toBe(3)
			expect(div.firstChild.nodeValue).toBe('aaa')
		})
		test('works with empty string', () => {
			let div = $document.createElement('div')
			div.textContent = ''

			expect(div.childNodes.length).toBe(0)
		})
	})

	describe('innerHTML', () => {
		test('works', () => {
			let div = $document.createElement('div')
			div.innerHTML = '<br /><a class=\'aaa\' id=\'xyz\'>123<b class="bbb"></b>234<br class=ccc>345</a>'
			expect(div.childNodes.length).toBe(2)
			expect(div.childNodes[0].nodeType).toBe(1)
			expect(div.childNodes[0].nodeName).toBe('BR')
			expect(div.childNodes[1].nodeType).toBe(1)
			expect(div.childNodes[1].nodeName).toBe('A')
			expect(div.childNodes[1].attributes['class'].value).toBe('aaa')
			expect(div.childNodes[1].attributes['id'].value).toBe('xyz')
			expect(div.childNodes[1].childNodes[0].nodeType).toBe(3)
			expect(div.childNodes[1].childNodes[0].nodeValue).toBe('123')
			expect(div.childNodes[1].childNodes[1].nodeType).toBe(1)
			expect(div.childNodes[1].childNodes[1].nodeName).toBe('B')
			expect(div.childNodes[1].childNodes[1].attributes['class'].value).toBe('bbb')
			expect(div.childNodes[1].childNodes[2].nodeType).toBe(3)
			expect(div.childNodes[1].childNodes[2].nodeValue).toBe('234')
			expect(div.childNodes[1].childNodes[3].nodeType).toBe(1)
			expect(div.childNodes[1].childNodes[3].nodeName).toBe('BR')
			expect(div.childNodes[1].childNodes[3].attributes['class'].value).toBe('ccc')
			expect(div.childNodes[1].childNodes[4].nodeType).toBe(3)
			expect(div.childNodes[1].childNodes[4].nodeValue).toBe('345')
		})
		test('headers work', () => {
			let div = $document.createElement('div')
			div.innerHTML = '<h1></h1><h2></h2><h3></h3><h4></h4><h5></h5><h6></h6>'
			expect(div.childNodes.length).toBe(6)
			expect(div.childNodes[0].nodeType).toBe(1)
			expect(div.childNodes[0].nodeName).toBe('H1')
			expect(div.childNodes[1].nodeType).toBe(1)
			expect(div.childNodes[1].nodeName).toBe('H2')
			expect(div.childNodes[2].nodeType).toBe(1)
			expect(div.childNodes[2].nodeName).toBe('H3')
			expect(div.childNodes[3].nodeType).toBe(1)
			expect(div.childNodes[3].nodeName).toBe('H4')
			expect(div.childNodes[4].nodeType).toBe(1)
			expect(div.childNodes[4].nodeName).toBe('H5')
			expect(div.childNodes[5].nodeType).toBe(1)
			expect(div.childNodes[5].nodeName).toBe('H6')
		})
		test('detaches old elements', () => {
			let div = $document.createElement('div')
			let a = $document.createElement('a')
			div.appendChild(a)
			div.innerHTML = '<b></b>'

			expect(a.parentNode).toBe(null)
		})
		test('empty SVG document', () => {
			let div = $document.createElement('div')
			div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'

			expect(typeof div.firstChild).not.toBe(undefined)
			expect(div.firstChild.nodeName).toBe('svg')
			expect(div.firstChild.namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(div.firstChild.childNodes.length).toBe(0)
		})
		test('text elements', () => {
			let div = $document.createElement('div')
			div.innerHTML =
				'<svg xmlns="http://www.w3.org/2000/svg">'
					+ '<text>hello</text>'
					+ '<text> </text>'
					+ '<text>world</text>'
				+ '</svg>'

			expect(div.firstChild.nodeName).toBe('svg')
			expect(div.firstChild.namespaceURI).toBe('http://www.w3.org/2000/svg')

			let nodes = div.firstChild.childNodes
			expect(nodes.length).toBe(3)
			expect(nodes[0].nodeName).toBe('text')
			expect(nodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(nodes[0].childNodes.length).toBe(1)
			expect(nodes[0].childNodes[0].nodeName).toBe('#text')
			expect(nodes[0].childNodes[0].nodeValue).toBe('hello')
			expect(nodes[1].nodeName).toBe('text')
			expect(nodes[1].namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(nodes[1].childNodes.length).toBe(1)
			expect(nodes[1].childNodes[0].nodeName).toBe('#text')
			expect(nodes[1].childNodes[0].nodeValue).toBe(' ')
			expect(nodes[2].nodeName).toBe('text')
			expect(nodes[2].namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(nodes[2].childNodes.length).toBe(1)
			expect(nodes[2].childNodes[0].nodeName).toBe('#text')
			expect(nodes[2].childNodes[0].nodeValue).toBe('world')
		})
	})
	describe('focus', () => {
		test('body is active by default', () => {
			expect($document.documentElement.nodeName).toBe('HTML')
			expect($document.body.nodeName).toBe('BODY')
			expect($document.documentElement.firstChild.nodeName).toBe('HEAD')
			expect($document.documentElement).toBe($document.body.parentNode)
			expect($document.activeElement).toBe($document.body)
		})
		test('focus changes activeElement', () => {
			let input = $document.createElement('input')
			$document.body.appendChild(input)
			input.focus()

			expect($document.activeElement).toBe(input)

			$document.body.removeChild(input)
		})
	})
	describe('style', () => {
		test('has style property', () => {
			let div = $document.createElement('div')

			expect(typeof div.style).toBe('object')
		})
		test('setting style.cssText string works', () => {
			let div = $document.createElement('div')
			div.style.cssText = 'background-color: red; border-bottom: 1px solid red;'

			expect(div.style.backgroundColor).toBe('red')
			expect(div.style.borderBottom).toBe('1px solid red')
			expect(div.attributes.style.value).toBe('background-color: red; border-bottom: 1px solid red;')
		})
		test('removing via setting style.cssText string works', () => {
			let div = $document.createElement('div')
			div.style.cssText = 'background: red;'
			div.style.cssText = ''

			expect(div.style.background).toBe('')
			expect(div.attributes.style.value).toBe('')
		})
		test('the final semicolon is optional when setting style.cssText', () => {
			let div = $document.createElement('div')
			div.style.cssText = 'background: red'

			expect(div.style.background).toBe('red')
			expect(div.style.cssText).toBe('background: red;')
			expect(div.attributes.style.value).toBe('background: red;')
		})
		test('\'cssText\' as a property name is ignored when setting style.cssText', () => {
			let div = $document.createElement('div')
			div.style.cssText = 'cssText: red;'

			expect(div.style.cssText).toBe('')
		})
		test('setting style.cssText that has a semi-colon in a strings', () => {
			let div = $document.createElement('div')
			div.style.cssText = 'background: url(\';\'); font-family: ";"'

			expect(div.style.background).toBe('url(\';\')')
			expect(div.style.fontFamily).toBe('";"')
			expect(div.style.cssText).toBe('background: url(\';\'); font-family: ";";')
		})
		test('comments in style.cssText are stripped', () => {
			let div = $document.createElement('div')
			div.style.cssText = '/**/background/*:*/: /*>;)*/red/**/;/**/'

			expect(div.style.background).toBe('red')
			expect(div.style.cssText).toBe('background: red;')

		})
		test('comments in strings in style.cssText are preserved', () => {
			let div = $document.createElement('div')
			div.style.cssText = 'background: url(\'/*foo*/\')'

			expect(div.style.background).toBe('url(\'/*foo*/\')')

		})
		test('setting style updates style.cssText', () => {
			let div = $document.createElement('div')
			div.style = 'background: red;'

			expect(div.style.background).toBe('red')
			expect(div.style.cssText).toBe('background: red;')

		})
	})
	describe('events', () => {
		describe('click', () => {
			let clickSpy, div, e
			beforeEach(() => {
				clickSpy = spy()
				div = $document.createElement('div')
				e = $document.createEvent('MouseEvents')
				e.initEvent('click', true, true)

				$document.body.appendChild(div)
			})
			afterEach(() => {
				$document.body.removeChild(div)
			})

			test('has onclick', () => {
				expect('onclick' in div).toBe(true)
			})
			test('addEventListener works', () => {
				div.addEventListener('click', clickSpy, false)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(1)
				expect((clickSpy as ReturnType<typeof spy>).this).toBe(div)
				expect((clickSpy as ReturnType<typeof spy>).args[0].type).toBe('click')
				expect((clickSpy as ReturnType<typeof spy>).args[0].target).toBe(div)
			})
			test('removeEventListener works (bubbling phase)', () => {
				div.addEventListener('click', clickSpy, false)
				div.removeEventListener('click', clickSpy, false)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('removeEventListener works (capture phase)', () => {
				div.addEventListener('click', clickSpy, true)
				div.removeEventListener('click', clickSpy, true)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('removeEventListener is selective (bubbling phase)', () => {
				let other = spy()
				div.addEventListener('click', clickSpy, false)
				div.addEventListener('click', other, false)
				div.removeEventListener('click', clickSpy, false)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(0)
				expect((other as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('removeEventListener is selective (capture phase)', () => {
				let other = spy()
				div.addEventListener('click', clickSpy, true)
				div.addEventListener('click', other, true)
				div.removeEventListener('click', clickSpy, true)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(0)
				expect((other as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('removeEventListener only removes the handler related to a given phase (1/2)', () => {
				clickSpy = spy((e: any) => {expect(e.eventPhase).toBe(3)})
				$document.body.addEventListener('click', clickSpy, true)
				$document.body.addEventListener('click', clickSpy, false)
				$document.body.removeEventListener('click', clickSpy, true)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('removeEventListener only removes the handler related to a given phase (2/2)', () => {
				clickSpy = spy((e: any) => {expect(e.eventPhase).toBe(1)})
				$document.body.addEventListener('click', clickSpy, true)
				$document.body.addEventListener('click', clickSpy, false)
				$document.body.removeEventListener('click', clickSpy, false)
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('click fires onclick', () => {
				div.onclick = clickSpy
				div.dispatchEvent(e)

				expect((clickSpy as ReturnType<typeof spy>).callCount).toBe(1)
				expect((clickSpy as ReturnType<typeof spy>).this).toBe(div)
				expect((clickSpy as ReturnType<typeof spy>).args[0].type).toBe('click')
				expect((clickSpy as ReturnType<typeof spy>).args[0].target).toBe(div)
			})
			test('click without onclick doesn\'t throw', (done) => {
				div.dispatchEvent(e)
				done()
			})
		})
		describe('transitionend', () => {
			let transitionSpy, div, e
			beforeEach(() => {
				transitionSpy = spy()
				div = $document.createElement('div')
				e = $document.createEvent('HTMLEvents')
				e.initEvent('transitionend', true, true)

				$document.body.appendChild(div)
			})
			afterEach(() => {
				$document.body.removeChild(div)
			})

			test('ontransitionend does not fire', (done) => {
				div.ontransitionend = transitionSpy
				div.dispatchEvent(e)

				expect((transitionSpy as ReturnType<typeof spy>).callCount).toBe(0)
				done()
			})
		})
		describe('capture and bubbling phases', () => {
			let div, e
			beforeEach(() => {
				div = $document.createElement('div')
				e = $document.createEvent('MouseEvents')
				e.initEvent('click', true, true)

				$document.body.appendChild(div)
			})
			afterEach(() => {
				$document.body.removeChild(div)
			})
			test('capture and bubbling events both fire on the target in the order they were defined, regardless of the phase', () => {
				let sequence = []
				let capture = spy((ev: any) => {
					sequence.push('capture')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(2)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe(div)
				})
				let bubble = spy((ev: any) => {
					sequence.push('bubble')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(2)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe(div)
				})

				div.addEventListener('click', bubble, false)
				div.addEventListener('click', capture, true)
				div.dispatchEvent(e)

				expect((capture as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubble as ReturnType<typeof spy>).callCount).toBe(1)
				expect(sequence).toEqual(['bubble', 'capture'])
			})
			test('capture and bubbling events both fire on the parent', () => {
				let sequence = []
				let capture = spy((ev: any) => {
					sequence.push('capture')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(1)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe($document.body)
				})
				let bubble = spy((ev: any) => {
					sequence.push('bubble')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(3)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe($document.body)
				})

				$document.body.addEventListener('click', bubble, false)
				$document.body.addEventListener('click', capture, true)
				div.dispatchEvent(e)

				expect((capture as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubble as ReturnType<typeof spy>).callCount).toBe(1)
				expect(sequence).toEqual(['capture', 'bubble'])
			})
			test('useCapture defaults to false', () => {
				let sequence = []
				let parent = spy((ev: any) => {
					sequence.push('parent')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(3)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe($document.body)
				})
				let target = spy((ev: any) => {
					sequence.push('target')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(2)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe(div)
				})

				$document.body.addEventListener('click', parent)
				div.addEventListener('click', target)
				div.dispatchEvent(e)

				expect((parent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((target as ReturnType<typeof spy>).callCount).toBe(1)
				expect(sequence).toEqual(['target', 'parent'])
			})
			test('legacy handlers fire on the bubbling phase', () => {
				let sequence = []
				let parent = spy((ev: any) => {
					sequence.push('parent')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(3)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe($document.body)
				})
				let target = spy((ev: any) => {
					sequence.push('target')

					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(2)
					expect(ev.target).toBe(div)
					expect(ev.currentTarget).toBe(div)
				})

				$document.body.addEventListener('click', parent)
				$document.body.onclick = parent
				div.addEventListener('click', target)
				div.dispatchEvent(e)

				expect((parent as ReturnType<typeof spy>).callCount).toBe(2)
				expect((target as ReturnType<typeof spy>).callCount).toBe(1)
				expect(sequence).toEqual(['target', 'parent', 'parent'])
			})
			test('events do not propagate to child nodes', () => {
				let target = spy((ev: any) => {
					expect(ev).toBe(e)
					expect(ev.eventPhase).toBe(2)
					expect(ev.target).toBe($document.body)
					expect(ev.currentTarget).toBe($document.body)
				})
				let child = spy(() => {
				})

				$document.body.addEventListener('click', target)
				div.addEventListener('click', child)
				$document.body.dispatchEvent(e)

				expect((target as ReturnType<typeof spy>).callCount).toBe(1)
				expect((child as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopPropagation 1/6', () => {
				let capParent = spy((e: any) => {e.stopPropagation()})
				let capTarget = spy()
				let bubTarget = spy()
				let legacyTarget = spy()
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopPropagation 2/6', () => {
				let capParent = spy()
				let capTarget = spy((e: any) => {e.stopPropagation()})
				let bubTarget = spy()
				let legacyTarget = spy()
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})

			test('e.stopPropagation 3/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let bubTarget = spy((e: any) => {e.stopPropagation()})
				let legacyTarget = spy()
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopPropagation 4/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let bubTarget = spy()
				let legacyTarget = spy((e: any) => {e.stopPropagation()})
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopPropagation 5/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let bubTarget = spy()
				let legacyTarget = spy()
				let bubParent = spy((e: any) => {e.stopPropagation()})
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('e.stopPropagation 6/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let legacyTarget = spy()
				let bubTarget = spy()
				let bubParent = spy()
				let legacyParent = spy((e: any) => {e.stopPropagation()})

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('e.stopImmediatePropagation 1/6', () => {
				let capParent = spy((e: any) => {e.stopImmediatePropagation()})
				let capTarget = spy()
				let bubTarget = spy()
				let legacyTarget = spy()
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopImmediatePropagation 2/6', () => {
				let capParent = spy()
				let capTarget = spy((e: any) => {e.stopImmediatePropagation()})
				let bubTarget = spy()
				let legacyTarget = spy()
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})

			test('e.stopImmediatePropagation 3/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let bubTarget = spy((e: any) => {e.stopImmediatePropagation()})
				let legacyTarget = spy()
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(0)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopImmediatePropagation 4/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let bubTarget = spy()
				let legacyTarget = spy((e: any) => {e.stopImmediatePropagation()})
				let bubParent = spy()
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(0)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopImmediatePropagation 5/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let bubTarget = spy()
				let legacyTarget = spy()
				let bubParent = spy((e: any) => {e.stopImmediatePropagation()})
				let legacyParent = spy()

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(0)
			})
			test('e.stopImmediatePropagation 6/6', () => {
				let capParent = spy()
				let capTarget = spy()
				let legacyTarget = spy()
				let bubTarget = spy()
				let bubParent = spy()
				let legacyParent = spy((e: any) => {e.stopImmediatePropagation()})

				$document.body.addEventListener('click', capParent, true)
				$document.body.addEventListener('click', bubParent, false)
				$document.body.onclick = legacyParent

				div.addEventListener('click', capTarget, true)
				div.addEventListener('click', bubTarget, false)
				div.onclick = legacyTarget

				div.dispatchEvent(e)

				expect((capParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((capTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyTarget as ReturnType<typeof spy>).callCount).toBe(1)
				expect((bubParent as ReturnType<typeof spy>).callCount).toBe(1)
				expect((legacyParent as ReturnType<typeof spy>).callCount).toBe(1)
			})
			test('errors thrown in handlers don\'t interrupt the chain', () => {
				let errMsg = 'The presence of these six errors in the log is expected in non-Node.js environments'
				let handler = spy(() => {throw errMsg})

				$document.body.addEventListener('click', handler, true)
				$document.body.addEventListener('click', handler, false)
				$document.body.onclick = handler

				div.addEventListener('click', handler, true)
				div.addEventListener('click', handler, false)
				div.onclick = handler

				div.dispatchEvent(e)

				expect((handler as ReturnType<typeof spy>).callCount).toBe(6)
				// In Bun, errors are suppressed in domMock, so the test just verifies
				// that all handlers were called despite errors being thrown
			})
		})
	})
	describe('attributes', () => {
		describe('a[href]', () => {
			test('is empty string if no attribute', () => {
				let a = $document.createElement('a')

				expect(a.href).toBe('')
				expect(a.attributes['href']).toBe(undefined)
			})
			test('is path if attribute is set', () => {
				let a = $document.createElement('a')
				a.setAttribute('href', '')

				expect(a.href).not.toBe('')
				expect(a.attributes['href'].value).toBe('')
			})
			test('is path if property is set', () => {
				let a = $document.createElement('a')
				a.href = ''

				expect(a.href).not.toBe('')
				expect(a.attributes['href'].value).toBe('')
			})
			test('property is read-only for SVG elements', () => {
				let a = $document.createElementNS('http://www.w3.org/2000/svg', 'a')
				a.href = '/foo'

				expect(a.href).toEqual({baseVal: '', animVal: ''})
				expect('href' in a.attributes).toBe(false)
			})
		})
		describe('input[checked]', () => {
			test('only exists in input elements', () => {
				let input = $document.createElement('input')
				let a = $document.createElement('a')

				expect('checked' in input).toBe(true)
				expect('checked' in a).toBe(false)
			})
			test('tracks attribute value when unset', () => {
				let input = $document.createElement('input')
				input.setAttribute('type', 'checkbox')

				expect(input.checked).toBe(false)
				expect(input.attributes['checked']).toBe(undefined)

				input.setAttribute('checked', '')

				expect(input.checked).toBe(true)
				expect(input.attributes['checked'].value).toBe('')

				input.removeAttribute('checked')

				expect(input.checked).toBe(false)
				expect(input.attributes['checked']).toBe(undefined)
			})
			test('does not track attribute value when set', () => {
				let input = $document.createElement('input')
				input.setAttribute('type', 'checkbox')
				input.checked = true

				expect(input.checked).toBe(true)
				expect(input.attributes['checked']).toBe(undefined)

				input.checked = false
				input.setAttribute('checked', '')

				input.checked = true
				input.removeAttribute('checked')

				expect(input.checked).toBe(true)
			})
			test('toggles on click', () => {
				let input = $document.createElement('input')
				input.setAttribute('type', 'checkbox')
				input.checked = false

				let e = $document.createEvent('MouseEvents')
				e.initEvent('click', true, true)
				input.dispatchEvent(e)

				expect(input.checked).toBe(true)
			})
			test('doesn\'t toggle on click when preventDefault() is used', () => {
				let input = $document.createElement('input')
				input.setAttribute('type', 'checkbox')
				input.checked = false
				input.onclick = (e: any) => {e.preventDefault()}

				let e = $document.createEvent('MouseEvents')
				e.initEvent('click', true, true)
				input.dispatchEvent(e)

				expect(input.checked).toBe(false)
			})
		})
		describe('input[value]', () => {
			test('only exists in input elements', () => {
				let input = $document.createElement('input')
				let a = $document.createElement('a')

				expect('value' in input).toBe(true)
				expect('value' in a).toBe(false)
			})
			test('converts null to \'\'', () => {
				let input = $document.createElement('input')
				input.value = 'x'

				expect(input.value).toBe('x')

				input.value = null

				expect(input.value).toBe('')
			})
			test('converts values to strings', () => {
				let input = $document.createElement('input')
				input.value = 5

				expect(input.value).toBe('5')

				input.value = 0

				expect(input.value).toBe('0')

				input.value = undefined

				expect(input.value).toBe('undefined')
			})
			if (typeof Symbol === 'function') test('throws when set to a symbol', () => {
				let threw = false
				let input = $document.createElement('input')
				try {
					input.value = Symbol('')
				} catch(e) {
					expect(e instanceof TypeError).toBe(true)
					threw = true
				}

				expect(input.value).toBe('')
				expect(threw).toBe(true)
			})
		})
		describe('input[type]', () => {
			test('only exists in input elements', () => {
				let input = $document.createElement('input')
				let a = $document.createElement('a')

				expect('type' in input).toBe(true)
				expect('type' in a).toBe(false)
			})
			test('is \'text\' by default', () => {
				let input = $document.createElement('input')

				expect(input.type).toBe('text')
			})
			'radio|button|checkbox|color|date|datetime|datetime-local|email|file|hidden|month|number|password|range|research|search|submit|tel|text|url|week|image'
				.split('|').forEach(function(type) {
					test('can be set to ' + type, () => {
						let input = $document.createElement('input')
						input.type = type

						expect(input.getAttribute('type')).toBe(type)
						expect(input.type).toBe(type)
					})
					test('bad values set the attribute, but the getter corrects to \'text\', ' + type, () => {
						let input = $document.createElement('input')
						input.type = 'badbad' + type

						expect(input.getAttribute('type')).toBe('badbad' + type)
						expect(input.type).toBe('text')
					})
				})
		})
		describe('textarea[value]', () => {
			test('reads from child if no value was ever set', () => {
				let textarea = $document.createElement('textarea')
				textarea.appendChild($document.createTextNode('aaa'))

				expect(textarea.value).toBe('aaa')
			})
			test('ignores child if value set', () => {
				let textarea = $document.createElement('textarea')
				textarea.value = null
				textarea.appendChild($document.createTextNode('aaa'))

				expect(textarea.value).toBe('')
			})
			test('textarea[value] doesn\'t reflect `attributes.value`', () => {
				let textarea = $document.createElement('textarea')
				textarea.value = 'aaa'
				textarea.setAttribute('value', 'bbb')

				expect(textarea.value).toBe('aaa')
			})
		})
		describe('select[value] and select[selectedIndex]', () => {
			test('only exist in select elements', () => {
				let select = $document.createElement('select')
				let a = $document.createElement('a')

				expect('value' in select).toBe(true)
				expect('value' in a).toBe(false)

				expect('selectedIndex' in select).toBe(true)
				expect('selectedIndex' in a).toBe(false)
			})
			test('value defaults to value at first index', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				expect(select.value).toBe('a')
				expect(select.selectedIndex).toBe(0)
			})
			test('value falls back to child nodeValue if no attribute', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.appendChild($document.createTextNode('a'))
				let option2 = $document.createElement('option')
				option2.appendChild($document.createTextNode('b'))
				select.appendChild(option1)
				select.appendChild(option2)

				expect(select.value).toBe('a')
				expect(select.selectedIndex).toBe(0)
				expect(select.childNodes[0].selected).toBe(true)
				expect(select.childNodes[0].value).toBe('a')
				expect(select.childNodes[1].value).toBe('b')
			})
			test('value defaults to invalid if no options', () => {
				let select = $document.createElement('select')

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(-1)
			})
			test('setting valid value works', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				let option3 = $document.createElement('option')
				option3.setAttribute('value', '')
				select.appendChild(option3)

				let option4 = $document.createElement('option')
				option4.setAttribute('value', 'null')
				select.appendChild(option4)

				select.value = 'b'

				expect(select.value).toBe('b')
				expect(select.selectedIndex).toBe(1)

				select.value = ''

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(2)

				select.value = 'null'

				expect(select.value).toBe('null')
				expect(select.selectedIndex).toBe(3)

				select.value = null

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(-1)
			})
			test('setting valid value works with type conversion', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', '0')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'undefined')
				select.appendChild(option2)

				let option3 = $document.createElement('option')
				option3.setAttribute('value', '')
				select.appendChild(option3)

				select.value = 0

				expect(select.value).toBe('0')
				expect(select.selectedIndex).toBe(0)

				select.value = undefined

				expect(select.value).toBe('undefined')
				expect(select.selectedIndex).toBe(1)

				if (typeof Symbol === 'function') {
					let threw = false
					try {
						select.value = Symbol('x')
					} catch(_e) {
						threw = true
					}
					expect(threw).toBe(true)
					expect(select.value).toBe('undefined')
					expect(select.selectedIndex).toBe(1)
				}
			})
			test('option.value = null is converted to \'null\'', () => {
				let option = $document.createElement('option')
				option.value = null

				expect(option.value).toBe('null')
			})
			test('setting valid value works with optgroup', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')

				let option3 = $document.createElement('option')
				option3.setAttribute('value', 'c')

				let optgroup = $document.createElement('optgroup')
				optgroup.appendChild(option1)
				optgroup.appendChild(option2)
				select.appendChild(optgroup)
				select.appendChild(option3)

				select.value = 'b'

				expect(select.value).toBe('b')
				expect(select.selectedIndex).toBe(1)
			})
			test('setting valid selectedIndex works', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				select.selectedIndex = 1

				expect(select.value).toBe('b')
				expect(select.selectedIndex).toBe(1)
			})
			test('setting option[selected] works', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				select.childNodes[1].selected = true

				expect(select.value).toBe('b')
				expect(select.selectedIndex).toBe(1)
			})
			test('unsetting option[selected] works', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				select.childNodes[1].selected = true
				select.childNodes[1].selected = false

				expect(select.value).toBe('a')
				expect(select.selectedIndex).toBe(0)
			})
			test('setting invalid value yields a selectedIndex of -1 and value of empty string', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				select.value = 'c'

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(-1)
			})
			test('setting invalid selectedIndex yields a selectedIndex of -1 and value of empty string', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', 'b')
				select.appendChild(option2)

				select.selectedIndex = -2

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(-1)
			})
			test('setting invalid value yields a selectedIndex of -1 and value of empty string even when there\'s an option whose value is empty string', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', '')
				select.appendChild(option2)

				select.value = 'c'

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(-1)
			})
			test('setting invalid selectedIndex yields a selectedIndex of -1 and value of empty string even when there\'s an option whose value is empty string', () => {
				let select = $document.createElement('select')

				let option1 = $document.createElement('option')
				option1.setAttribute('value', 'a')
				select.appendChild(option1)

				let option2 = $document.createElement('option')
				option2.setAttribute('value', '')
				select.appendChild(option2)

				select.selectedIndex = -2

				expect(select.value).toBe('')
				expect(select.selectedIndex).toBe(-1)
			})
		})
		describe('canvas width and height', () => {
			test('setting property works', () => {
				let canvas = $document.createElement('canvas')

				canvas.width = 100
				expect(canvas.attributes['width'].value).toBe('100')
				expect(canvas.width).toBe(100)

				canvas.height = 100
				expect(canvas.attributes['height'].value).toBe('100')
				expect(canvas.height).toBe(100)
			})
			test('setting string casts to number', () => {
				let canvas = $document.createElement('canvas')

				canvas.width = '100'
				expect(canvas.attributes['width'].value).toBe('100')
				expect(canvas.width).toBe(100)

				canvas.height = '100'
				expect(canvas.attributes['height'].value).toBe('100')
				expect(canvas.height).toBe(100)
			})
			test('setting float casts to int', () => {
				let canvas = $document.createElement('canvas')

				canvas.width = 1.2
				expect(canvas.attributes['width'].value).toBe('1')
				expect(canvas.width).toBe(1)

				canvas.height = 1.2
				expect(canvas.attributes['height'].value).toBe('1')
				expect(canvas.height).toBe(1)
			})
			test('setting percentage fails', () => {
				let canvas = $document.createElement('canvas')

				canvas.width = '100%'
				expect(canvas.attributes['width'].value).toBe('0')
				expect(canvas.width).toBe(0)

				canvas.height = '100%'
				expect(canvas.attributes['height'].value).toBe('0')
				expect(canvas.height).toBe(0)
			})
			test('setting attribute works', () => {
				let canvas = $document.createElement('canvas')

				canvas.setAttribute('width', '100%')
				expect(canvas.attributes['width'].value).toBe('100%')
				expect(canvas.width).toBe(100)

				canvas.setAttribute('height', '100%')
				expect(canvas.attributes['height'].value).toBe('100%')
				expect(canvas.height).toBe(100)
			})
		})
	})
	describe('className', () => {
		test('works', () => {
			let el = $document.createElement('div')
			el.className = 'a'

			expect(el.className).toBe('a')
			expect(el.attributes['class'].value).toBe('a')
		})
		test('setter throws in svg', (done) => {
			let el = $document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			try {
				el.className = 'a'
			}
			catch(_e) {
				done()
			}
		})
	})
	describe('spies', () => {
		let $window: any
		beforeEach(() => {
			$window = domMock({spy: spy})
		})
		test('basics', () => {
			expect(typeof $window.__getSpies).toBe('function')
			expect('__getSpies' in domMock()).toBe(false)
		})
		test('input elements have spies on value and type setters', () => {
			let input = $window.document.createElement('input')

			let spies = $window.__getSpies(input)

			expect(typeof spies).toBe('object')
			expect(spies).not.toBe(null)
			expect(typeof spies.valueSetter).toBe('function')
			expect(typeof spies.typeSetter).toBe('function')
			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(0)
			expect((spies.typeSetter as ReturnType<typeof spy>).callCount).toBe(0)

			input.value = 'aaa'
			input.type = 'radio'

			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(1)
			expect((spies.valueSetter as ReturnType<typeof spy>).this).toBe(input)
			expect((spies.valueSetter as ReturnType<typeof spy>).args[0]).toBe('aaa')

			expect((spies.typeSetter as ReturnType<typeof spy>).callCount).toBe(1)
			expect((spies.typeSetter as ReturnType<typeof spy>).this).toBe(input)
			expect((spies.typeSetter as ReturnType<typeof spy>).args[0]).toBe('radio')
		})
		test('select elements have spies on value setters', () => {
			let select = $window.document.createElement('select')

			let spies = $window.__getSpies(select)

			expect(typeof spies).toBe('object')
			expect(spies).not.toBe(null)
			expect(typeof spies.valueSetter).toBe('function')
			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(0)

			select.value = 'aaa'

			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(1)
			expect((spies.valueSetter as ReturnType<typeof spy>).this).toBe(select)
			expect((spies.valueSetter as ReturnType<typeof spy>).args[0]).toBe('aaa')
		})
		test('option elements have spies on value setters', () => {
			let option = $window.document.createElement('option')

			let spies = $window.__getSpies(option)

			expect(typeof spies).toBe('object')
			expect(spies).not.toBe(null)
			expect(typeof spies.valueSetter).toBe('function')
			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(0)

			option.value = 'aaa'

			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(1)
			expect((spies.valueSetter as ReturnType<typeof spy>).this).toBe(option)
			expect((spies.valueSetter as ReturnType<typeof spy>).args[0]).toBe('aaa')
		})
		test('textarea elements have spies on value setters', () => {
			let textarea = $window.document.createElement('textarea')

			let spies = $window.__getSpies(textarea)

			expect(typeof spies).toBe('object')
			expect(spies).not.toBe(null)
			expect(typeof spies.valueSetter).toBe('function')
			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(0)

			textarea.value = 'aaa'

			expect((spies.valueSetter as ReturnType<typeof spy>).callCount).toBe(1)
			expect((spies.valueSetter as ReturnType<typeof spy>).this).toBe(textarea)
			expect((spies.valueSetter as ReturnType<typeof spy>).args[0]).toBe('aaa')
		})
	})
	describe('DOMParser for SVG', () => {
		let $DOMParser: any
		beforeEach(() => {
			$DOMParser = $window.DOMParser
		})
		test('basics', () => {
			expect(typeof $DOMParser).toBe('function')

			let parser = new $DOMParser()

			expect(parser instanceof $DOMParser).toBe(true)
			expect(typeof parser.parseFromString).toBe('function')
		})
		test('empty document', () => {
			let parser = new $DOMParser()
			let doc = parser.parseFromString(
				'<svg xmlns="http://www.w3.org/2000/svg"></svg>',
				'image/svg+xml',
			)

			expect(typeof doc.documentElement).not.toBe(undefined)
			expect(doc.documentElement.nodeName).toBe('svg')
			expect(doc.documentElement.namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(doc.documentElement.childNodes.length).toBe(0)
		})
		test('text elements', () => {
			let parser = new $DOMParser()
			let doc = parser.parseFromString(
				'<svg xmlns="http://www.w3.org/2000/svg">'
					+ '<text>hello</text>'
					+ '<text> </text>'
					+ '<text>world</text>'
				+ '</svg>',
				'image/svg+xml',
			)

			expect(doc.documentElement.nodeName).toBe('svg')
			expect(doc.documentElement.namespaceURI).toBe('http://www.w3.org/2000/svg')

			let nodes = doc.documentElement.childNodes
			expect(nodes.length).toBe(3)
			expect(nodes[0].nodeName).toBe('text')
			expect(nodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(nodes[0].childNodes.length).toBe(1)
			expect(nodes[0].childNodes[0].nodeName).toBe('#text')
			expect(nodes[0].childNodes[0].nodeValue).toBe('hello')
			expect(nodes[1].nodeName).toBe('text')
			expect(nodes[1].namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(nodes[1].childNodes.length).toBe(1)
			expect(nodes[1].childNodes[0].nodeName).toBe('#text')
			expect(nodes[1].childNodes[0].nodeValue).toBe(' ')
			expect(nodes[2].nodeName).toBe('text')
			expect(nodes[2].namespaceURI).toBe('http://www.w3.org/2000/svg')
			expect(nodes[2].childNodes.length).toBe(1)
			expect(nodes[2].childNodes[0].nodeName).toBe('#text')
			expect(nodes[2].childNodes[0].nodeValue).toBe('world')
		})
	})
})
