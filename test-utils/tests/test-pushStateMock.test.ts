import {test, beforeEach, describe, expect} from 'bun:test'

import pushStateMock from '../../test-utils/pushStateMock'
import callAsync from '../../test-utils/callAsync'
import {spy} from '../../test-utils/test-helpers'

describe('pushStateMock', () => {
	let $window: ReturnType<typeof pushStateMock>

	beforeEach(() => {
		$window = pushStateMock()
	})

	describe('initial state', () => {
		test('has url on page load', () => {
			expect($window.location.href).toBe('http://localhost/')
		})
	})

	describe('set href', () => {
		test('changes url on location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'http://localhost/a'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a')
		})
		test('changes url on relative location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'a'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a')
			expect($window.location.pathname).toBe('/a')
		})
		test('changes url on dotdot location.href change', () => {
			$window.location.href = 'a'
			const old = $window.location.href
			$window.location.href = '..'

			expect(old).toBe('http://localhost/a')
			expect($window.location.href).toBe('http://localhost/')
			expect($window.location.pathname).toBe('/')
		})
		test('changes url on deep dotdot location.href change', () => {
			$window.location.href = 'a/b/c'
			const old = $window.location.href
			$window.location.href = '..'

			expect(old).toBe('http://localhost/a/b/c')
			expect($window.location.href).toBe('http://localhost/a')
			expect($window.location.pathname).toBe('/a')
		})
		test('does not change url on dotdot location.href change from root', () => {
			const old = $window.location.href
			$window.location.href = '..'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/')
			expect($window.location.pathname).toBe('/')
		})
		test('changes url on dot relative location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'a'
			$window.location.href = './b'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/b')
			expect($window.location.pathname).toBe('/b')
		})
		test('does not change url on dot location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'a'
			$window.location.href = '.'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a')
			expect($window.location.pathname).toBe('/a')
		})
		test('changes url on hash-only location.href change', () => {
			const old = $window.location.href
			$window.location.href = '#a'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/#a')
			expect($window.location.hash).toBe('#a')
		})
		test('changes url on search-only location.href change', () => {
			const old = $window.location.href
			$window.location.href = '?a'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/?a')
			expect($window.location.search).toBe('?a')
		})
		test('changes hash on location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'http://localhost/a#b'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a#b')
			expect($window.location.hash).toBe('#b')
		})
		test('changes search on location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'http://localhost/a?b'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a?b')
			expect($window.location.search).toBe('?b')
		})
		test('changes search and hash on location.href change', () => {
			const old = $window.location.href
			$window.location.href = 'http://localhost/a?b#c'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a?b#c')
			expect($window.location.search).toBe('?b')
			expect($window.location.hash).toBe('#c')
		})
		test('handles search with search and hash', () => {
			const old = $window.location.href
			$window.location.href = 'http://localhost/a?b?c#d'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a?b?c#d')
			expect($window.location.search).toBe('?b?c')
			expect($window.location.hash).toBe('#d')
		})
		test('handles hash with search and hash', () => {
			const old = $window.location.href
			$window.location.href = 'http://localhost/a#b?c#d'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a#b?c#d')
			expect($window.location.search).toBe('')
			expect($window.location.hash).toBe('#b?c#d')
		})
	})
	describe('set search', () => {
		test('changes url on location.search change', () => {
			const old = $window.location.href
			$window.location.search = '?b'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/?b')
			expect($window.location.search).toBe('?b')
		})
	})
	describe('set hash', () => {
		test('changes url on location.hash change', () => {
			const old = $window.location.href
			$window.location.hash = '#b'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/#b')
			expect($window.location.hash).toBe('#b')
		})
	})
	describe('set pathname', () => {
		test('changes url on location.pathname change', () => {
			const old = $window.location.href
			$window.location.pathname = '/a'

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a')
			expect($window.location.pathname).toBe('/a')
		})
	})
	describe('set protocol', () => {
		test('setting protocol throws', (done) => {
			try {
				$window.location.protocol = 'https://'
			}
			catch(e) {
				return done()
			}
			throw new Error('Expected an error')
		})
	})
	describe('set port', () => {
		test('setting origin changes href', () => {
			const old = $window.location.href
			$window.location.port = '81'

			expect(old).toBe('http://localhost/')
			expect($window.location.port).toBe('81')
			expect($window.location.href).toBe('http://localhost:81/')
		})
	})
	describe('set hostname', () => {
		test('setting hostname changes href', () => {
			const old = $window.location.href
			$window.location.hostname = '127.0.0.1'

			expect(old).toBe('http://localhost/')
			expect($window.location.hostname).toBe('127.0.0.1')
			expect($window.location.href).toBe('http://127.0.0.1/')
		})
	})
	describe('set origin', () => {
		test('setting origin is ignored', () => {
			const old = $window.location.href
			$window.location.origin = 'http://127.0.0.1'

			expect(old).toBe('http://localhost/')
			expect($window.location.origin).toBe('http://localhost')
		})
	})
	describe('set host', () => {
		test('setting host is ignored', () => {
			const old = $window.location.href
			$window.location.host = 'http://127.0.0.1'

			expect(old).toBe('http://localhost/')
			expect($window.location.host).toBe('localhost')
		})
	})
	describe('pushState', () => {
		test('changes url on pushstate', () => {
			const old = $window.location.href
			$window.history.pushState(null, null, 'http://localhost/a')

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/a')
		})
		test('changes search on pushstate', () => {
			const old = $window.location.href
			$window.history.pushState(null, null, 'http://localhost/?a')

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/?a')
			expect($window.location.search).toBe('?a')
		})
		test('changes search on relative pushstate', () => {
			const old = $window.location.href
			$window.history.pushState(null, null, '?a')

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/?a')
			expect($window.location.search).toBe('?a')
		})
		test('changes hash on pushstate', () => {
			const old = $window.location.href
			$window.history.pushState(null, null, 'http://localhost/#a')

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/#a')
			expect($window.location.hash).toBe('#a')
		})
		test('changes hash on relative pushstate', () => {
			const old = $window.location.href
			$window.history.pushState(null, null, '#a')

			expect(old).toBe('http://localhost/')
			expect($window.location.href).toBe('http://localhost/#a')
			expect($window.location.hash).toBe('#a')
		})
	})
	describe('onpopstate', () => {
		test('history.back() without history does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('history.back() after pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'http://localhost/a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].type).toBe('popstate')
		})
		test('history.back() after relative pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('history.back() after search pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'http://localhost/?a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('history.back() after relative search pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, '?a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('history.back() after hash pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'http://localhost/#a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('history.back() after relative hash pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, '#a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('history.back() after replacestate does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.replaceState(null, null, 'http://localhost/a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('history.back() after relative replacestate does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.replaceState(null, null, 'a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('history.back() after relative search replacestate does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.replaceState(null, null, '?a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('history.back() after relative hash replacestate does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.replaceState(null, null, '#a')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('history.forward() after pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'http://localhost/a')
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
		})
		test('history.forward() after relative pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'a')
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
		})
		test('history.forward() after search pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'http://localhost/?a')
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
		})
		test('history.forward() after relative search pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, '?a')
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
		})
		test('history.forward() after hash pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, 'http://localhost/#a')
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
		})
		test('history.forward() after relative hash pushstate triggers onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.pushState(null, null, '#a')
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
		})
		test('history.forward() without history does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('history navigation without history does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.back()
			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('reverse history navigation without history does not trigger onpopstate', () => {
			$window.onpopstate = spy()
			$window.history.forward()
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('onpopstate has correct url during call', (done) => {
			$window.location.href = 'a'
			$window.onpopstate = function() {
				expect($window.location.href).toBe('http://localhost/a')
				done()
			}
			$window.history.pushState(null, null, 'b')
			$window.history.back()
		})
		test('replaceState does not break forward history', () => {
			$window.onpopstate = spy()

			$window.history.pushState(null, null, 'b')
			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
			expect($window.location.href).toBe('http://localhost/')

			$window.history.replaceState(null, null, 'a')

			expect($window.location.href).toBe('http://localhost/a')

			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
			expect($window.location.href).toBe('http://localhost/b')
		})
		test('pushstate retains state', () => {
			$window.onpopstate = spy()

			$window.history.pushState({a: 1}, null, '#a')
			$window.history.pushState({b: 2}, null, '#b')

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(0)

			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(1)
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].type).toBe('popstate')
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].state).toEqual({a: 1})

			$window.history.back()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(2)
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].type).toBe('popstate')
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].state).toBe(null)

			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(3)
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].type).toBe('popstate')
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].state).toEqual({a: 1})

			$window.history.forward()

			expect(($window.onpopstate as ReturnType<typeof spy>).callCount).toBe(4)
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].type).toBe('popstate')
			expect(($window.onpopstate as ReturnType<typeof spy>).args[0].state).toEqual({b: 2})
		})
		test('replacestate replaces state', () => {
			$window.onpopstate = spy(pop)

			$window.history.replaceState({a: 1}, null, 'a')

			expect($window.history.state).toEqual({a: 1})

			$window.history.pushState(null, null, 'a')
			$window.history.back()

			function pop(e: any) {
				expect(e.state).toEqual({a: 1})
				expect($window.history.state).toEqual({a: 1})
			}
		})
	})
	describe('onhashchance', () => {
		test('onhashchange triggers on location.href change', (done) => {
			$window.onhashchange = spy()
			$window.location.href = 'http://localhost/#a'

			callAsync(function() {
				expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(1)
				expect(($window.onhashchange as ReturnType<typeof spy>).args[0].type).toBe('hashchange')
				done()
			})
		})
		test('onhashchange triggers on relative location.href change', (done) => {
			$window.onhashchange = spy()
			$window.location.href = '#a'

			callAsync(function() {
				expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(1)
				done()
			})
		})
		test('onhashchange triggers on location.hash change', (done) => {
			$window.onhashchange = spy()
			$window.location.hash = '#a'

			callAsync(function() {
				expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(1)
				done()
			})
		})
		test('onhashchange does not trigger on page change', (done) => {
			$window.onhashchange = spy()
			$window.location.href = 'http://localhost/a'

			callAsync(function() {
				expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
				done()
			})
		})
		test('onhashchange does not trigger on page change with different hash', (done) => {
			$window.location.href = 'http://localhost/#a'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.location.href = 'http://localhost/a#b'

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
					done()
				})
			})
		})
		test('onhashchange does not trigger on page change with same hash', (done) => {
			$window.location.href = 'http://localhost/#b'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.location.href = 'http://localhost/a#b'

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
					done()
				})
			})
		})
		test('onhashchange triggers on history.back()', (done) => {
			$window.location.href = '#a'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(1)
					done()
				})
			})
		})
		test('onhashchange triggers on history.forward()', (done) => {
			$window.location.href = '#a'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()
				callAsync(function() {
					$window.history.forward()

					callAsync(function() {
						expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(2)
						done()
					})
				})
			})
		})
		test('onhashchange triggers once when the hash changes twice in a single tick', (done) => {
			$window.location.href = '#a'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()
				$window.history.forward()

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(1)
					done()
				})
			})
		})
		test('onhashchange does not trigger on history.back() that causes page change with different hash', (done) => {
			$window.location.href = '#a'
			$window.location.href = 'a#b'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
					done()
				})
			})
		})
		test('onhashchange does not trigger on history.back() that causes page change with same hash', (done) => {
			$window.location.href = '#a'
			$window.location.href = 'a#a'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
					done()
				})
			})
		})
		test('onhashchange does not trigger on history.forward() that causes page change with different hash', (done) => {
			$window.location.href = '#a'
			$window.location.href = 'a#b'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()
				$window.history.forward()

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
					done()
				})
			})
		})
		test('onhashchange does not trigger on history.forward() that causes page change with same hash', (done) => {
			$window.location.href = '#a'
			$window.location.href = 'a#b'
			callAsync(function() {
				$window.onhashchange = spy()
				$window.history.back()
				$window.history.forward()

				callAsync(function() {
					expect(($window.onhashchange as ReturnType<typeof spy>).callCount).toBe(0)
					done()
				})
			})
		})
	})
	describe('onunload', () => {
		test('onunload triggers on location.href change', () => {
			$window.onunload = spy()
			$window.location.href = 'http://localhost/a'

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(1)
			expect(($window.onunload as ReturnType<typeof spy>).args[0].type).toBe('unload')
		})
		test('onunload triggers on relative location.href change', () => {
			$window.onunload = spy()
			$window.location.href = 'a'

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('onunload triggers on search change via location.href', () => {
			$window.onunload = spy()
			$window.location.href = 'http://localhost/?a'

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('onunload triggers on relative search change via location.href', () => {
			$window.onunload = spy()
			$window.location.href = '?a'

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(1)
		})
		test('onunload does not trigger on hash change via location.href', () => {
			$window.onunload = spy()
			$window.location.href = 'http://localhost/#a'

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('onunload does not trigger on relative hash change via location.href', () => {
			$window.onunload = spy()
			$window.location.href = '#a'

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('onunload does not trigger on hash-only history.back()', () => {
			$window.location.href = '#a'
			$window.onunload = spy()
			$window.history.back()

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('onunload does not trigger on hash-only history.forward()', () => {
			$window.location.href = '#a'
			$window.history.back()
			$window.onunload = spy()
			$window.history.forward()

			expect(($window.onunload as ReturnType<typeof spy>).callCount).toBe(0)
		})
		test('onunload has correct url during call via location.href change', (done) => {
			$window.onunload = function() {
				expect($window.location.href).toBe('http://localhost/')
				done()
			}
			$window.location.href = 'a'
		})
		test('onunload has correct url during call via location.search change', (done) => {
			$window.onunload = function() {
				expect($window.location.href).toBe('http://localhost/')
				done()
			}
			$window.location.search = '?a'
		})
	})
})
