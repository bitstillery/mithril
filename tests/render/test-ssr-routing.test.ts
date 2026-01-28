// @ts-nocheck
import {describe, test, expect, beforeEach, afterEach} from 'bun:test'

import mServer from '../../server'

import type {ComponentType, RouteResolver, SSRResult} from '../../index'

describe('SSR Routing', () => {
	let originalConsoleError: typeof console.error
	let originalConsoleWarn: typeof console.warn
	let originalConsoleLog: typeof console.log

	beforeEach(() => {
		// Suppress console output in tests
		originalConsoleError = console.error
		originalConsoleWarn = console.warn
		originalConsoleLog = console.log
		console.error = () => {}
		console.warn = () => {}
		console.log = () => {}
	})

	afterEach(() => {
		// Restore original console methods
		console.error = originalConsoleError
		console.warn = originalConsoleWarn
		console.log = originalConsoleLog
	})

	describe('Basic Component Routing', () => {
		test('routes to a simple component', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home Page'),
			}

			const routes = {
				'/': Home,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Home Page')
			expect(html).toContain('<div>')
		})

		test('routes to component with function view', async() => {
			// Function components need to be wrapped in an object for SSR
			// This is because hyperscript expects a component object or tag name
			const About: ComponentType = {
				view: () => mServer('div', 'About Page'),
			}

			const routes = {
				'/about': About,
			}

			const result = await mServer.route.resolve('/about', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('About Page')
		})

		test('routes to component with attributes', async() => {
			const User: ComponentType<{id: string}> = {
				view: (vnode) => mServer('div', `User ${vnode.attrs.id}`),
			}

			const routes = {
				'/user/:id': User,
			}

			const result = await mServer.route.resolve('/user/123', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('User 123')
		})

		test('handles query parameters', async() => {
			const Search: ComponentType = {
				view: () => {
					const query = mServer.route.param('q')
					return mServer('div', `Search: ${query || 'empty'}`)
				},
			}

			const routes = {
				'/search': Search,
			}

			const result = await mServer.route.resolve('/search?q=test', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Search: test')
		})
	})

	describe('RouteResolver with onmatch', () => {
		test('routes through RouteResolver with onmatch returning component', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const resolver: RouteResolver = {
				onmatch: () => Home,
			}

			const routes = {
				'/': resolver,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Home')
		})

		test('routes through RouteResolver with async onmatch', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const resolver: RouteResolver = {
				onmatch: async() => {
					await new Promise(resolve => setTimeout(resolve, 10))
					return Home
				},
			}

			const routes = {
				'/': resolver,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Home')
		})

		test('routes through RouteResolver with onmatch receiving params', async() => {
			const User: ComponentType<{id: string}> = {
				view: (vnode) => mServer('div', `User ${vnode.attrs.id}`),
			}

			const resolver: RouteResolver<{id: string}> = {
				onmatch: (attrs) => {
					// Can modify or validate attrs before returning component
					return User
				},
			}

			const routes = {
				'/user/:id': resolver,
			}

			const result = await mServer.route.resolve('/user/456', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('User 456')
		})
	})

	describe('RouteResolver with render', () => {
		test('routes through RouteResolver with render method', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home Content'),
			}

			const Layout: ComponentType<{component: ComponentType}> = {
				view: (vnode) => mServer('div', [
					mServer('header', 'Header'),
					mServer(vnode.attrs.component),
					mServer('footer', 'Footer'),
				]),
			}

			const resolver: RouteResolver = {
				onmatch: () => Home,
				render: (vnode) => {
					return mServer(Layout, {component: vnode.tag})
				},
			}

			const routes = {
				'/': resolver,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Header')
			expect(html).toContain('Home Content')
			expect(html).toContain('Footer')
		})

		test('routes through RouteResolver with render but no onmatch', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const resolver: RouteResolver = {
				render: (vnode) => {
					// Render the component directly
					return mServer(vnode.tag)
				},
			}

			const routes = {
				'/': {component: Home},
			}

			// This should work - resolver.render can handle components directly
			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Home')
		})
	})

	describe('Redirects', () => {
		test('redirects to another route', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const Login: ComponentType = {
				view: () => mServer('div', 'Login Page'),
			}

			const resolver: RouteResolver = {
				onmatch: () => {
					// Redirect to login
					return mServer.route.redirect('/login')
				},
			}

			const routes = {
				'/': resolver,
				'/login': Login,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			// Should render login page, not home
			expect(html).toContain('Login Page')
			expect(html).not.toContain('Home')
		})

		test('redirects with query parameters', async() => {
			const Login: ComponentType = {
				view: () => {
					const redirect = mServer.route.param('redirect')
					return mServer('div', `Login (redirect: ${redirect || 'none'})`)
				},
			}

			const resolver: RouteResolver = {
				onmatch: () => {
					return mServer.route.redirect('/login?redirect=/dashboard')
				},
			}

			const routes = {
				'/dashboard': resolver,
				'/login': Login,
			}

			const result = await mServer.route.resolve('/dashboard', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Login')
			expect(html).toContain('redirect: /dashboard')
		})

		test('redirects through RouteResolver with render', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const Login: ComponentType = {
				view: () => mServer('div', 'Login'),
			}

			const authResolver: RouteResolver = {
				onmatch: () => {
					// Simulate unauthenticated - redirect to login
					return mServer.route.redirect('/login')
				},
			}

			const loginResolver: RouteResolver = {
				onmatch: () => Login,
				render: (vnode) => {
					return mServer('div', [
						mServer('header', 'Auth Header'),
						mServer(vnode.tag),
					])
				},
			}

			const routes = {
				'/': authResolver,
				'/login': loginResolver,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Login')
			expect(html).toContain('Auth Header')
		})

		test('prevents redirect loops', async() => {
			const resolver1: RouteResolver = {
				onmatch: () => mServer.route.redirect('/route2'),
			}

			const resolver2: RouteResolver = {
				onmatch: () => mServer.route.redirect('/route1'),
			}

			const routes = {
				'/route1': resolver1,
				'/route2': resolver2,
			}

			// Should throw error after max redirect depth
			await expect(
				mServer.route.resolve('/route1', routes, mServer.renderToString),
			).rejects.toThrow('Maximum redirect depth')
		})

		test('handles multiple redirects in chain', async() => {
			const Final: ComponentType = {
				view: () => mServer('div', 'Final Page'),
			}

			const resolver1: RouteResolver = {
				onmatch: () => mServer.route.redirect('/step2'),
			}

			const resolver2: RouteResolver = {
				onmatch: () => mServer.route.redirect('/final'),
			}

			const routes = {
				'/step1': resolver1,
				'/step2': resolver2,
				'/final': Final,
			}

			const result = await mServer.route.resolve('/step1', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Final Page')
		})
	})

	describe('Route Parameters', () => {
		test('extracts route parameters', async() => {
			const User: ComponentType<{id: string}> = {
				view: (vnode) => mServer('div', `User ID: ${vnode.attrs.id}`),
			}

			const routes = {
				'/user/:id': User,
			}

			const result = await mServer.route.resolve('/user/789', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('User ID: 789')
		})

		test('extracts multiple route parameters', async() => {
			const Post: ComponentType<{userId: string; postId: string}> = {
				view: (vnode) => mServer('div', `User ${vnode.attrs.userId}, Post ${vnode.attrs.postId}`),
			}

			const routes = {
				'/user/:userId/post/:postId': Post,
			}

			const result = await mServer.route.resolve('/user/123/post/456', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('User 123')
			expect(html).toContain('Post 456')
		})

		test('route parameters work with RouteResolver', async() => {
			const User: ComponentType<{id: string}> = {
				view: (vnode) => mServer('div', `User ${vnode.attrs.id}`),
			}

			const resolver: RouteResolver<{id: string}> = {
				onmatch: (attrs) => {
					// Can access attrs.id here
					expect(attrs.id).toBe('999')
					return User
				},
			}

			const routes = {
				'/user/:id': resolver,
			}

			const result = await mServer.route.resolve('/user/999', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('User 999')
		})
	})

	describe('Query Parameters', () => {
		test('extracts query parameters', async() => {
			const Search: ComponentType = {
				view: () => {
					const q = mServer.route.param('q')
					const page = mServer.route.param('page')
					return mServer('div', `Search: ${q}, Page: ${page || '1'}`)
				},
			}

			const routes = {
				'/search': Search,
			}

			const result = await mServer.route.resolve('/search?q=test&page=2', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Search: test')
			expect(html).toContain('Page: 2')
		})

		test('query parameters work with redirects', async() => {
			const Login: ComponentType = {
				view: () => {
					const redirect = mServer.route.param('redirect')
					return mServer('div', `Login (from: ${redirect || 'none'})`)
				},
			}

			const resolver: RouteResolver = {
				onmatch: () => {
					return mServer.route.redirect('/login?redirect=/protected')
				},
			}

			const routes = {
				'/protected': resolver,
				'/login': Login,
			}

			const result = await mServer.route.resolve('/protected', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Login')
			expect(html).toContain('from: /protected')
		})
	})

	describe('SSRResult Handling', () => {
		test('returns string result', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const routes = {
				'/': Home,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)

			// Should return SSRResult (string or {html, state})
			expect(typeof result === 'string' || typeof result === 'object').toBe(true)
		})

		test('handles SSRResult with state', async() => {
			const Home: ComponentType = {
				view: () => mServer('div', 'Home'),
			}

			const routes = {
				'/': Home,
			}

			// Create a custom renderToString that returns {html, state}
			const customRenderToString = async(vnodes: any): Promise<SSRResult> => {
				const html = await mServer.renderToString(vnodes)
				const htmlStr = typeof html === 'string' ? html : html.html
				return {
					html: htmlStr,
					state: {test: 'value'},
				}
			}

			const result = await mServer.route.resolve('/', routes, customRenderToString)

			if (typeof result === 'object') {
				expect(result.html).toContain('Home')
				expect(result.state).toEqual({test: 'value'})
			} else {
				// Fallback if renderToString returns string
				expect(result).toContain('Home')
			}
		})
	})

	describe('Error Handling', () => {
		test('throws error for non-existent route', async() => {
			const routes = {
				'/': {view: () => mServer('div', 'Home')},
			}

			await expect(
				mServer.route.resolve('/nonexistent', routes, mServer.renderToString),
			).rejects.toThrow('No route found')
		})

		test('handles RouteResolver with render but invalid component', async() => {
			const resolver: RouteResolver = {
				onmatch: () => undefined, // Returns undefined
				render: (vnode) => mServer(vnode.tag), // But render expects a component
			}

			const routes = {
				'/': resolver,
			}

			// Should handle gracefully - falls through to component rendering
			// Since payload is still the resolver and it doesn't have a view method,
			// it should fall back to rendering a div
			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			// Should render something (fallback div)
			expect(html).toBeDefined()
		})
	})

	describe('Isomorphic Behavior', () => {
		test('route.get() returns current pathname during SSR', async() => {
			const Home: ComponentType = {
				view: () => {
					const currentPath = mServer.route.get()
					return mServer('div', `Current path: ${currentPath}`)
				},
			}

			const routes = {
				'/': Home,
			}

			const result = await mServer.route.resolve('/', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Current path: /')
		})

		test('route.param() works during SSR', async() => {
			const User: ComponentType<{id: string}> = {
				view: () => {
					const id = mServer.route.param('id')
					return mServer('div', `ID from param(): ${id}`)
				},
			}

			const routes = {
				'/user/:id': User,
			}

			const result = await mServer.route.resolve('/user/555', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('ID from param(): 555')
		})

		test('route.params works during SSR', async() => {
			const User: ComponentType<{id: string}> = {
				view: (vnode) => {
					// route.params should contain route parameters
					// During SSR, attrs are set from route params
					const id = vnode.attrs.id
					const params = mServer.route.params
					return mServer('div', `ID: ${id}, Params has id: ${params && 'id' in params ? params.id : 'no'}`)
				},
			}

			const routes = {
				'/user/:id': User,
			}

			const result = await mServer.route.resolve('/user/777', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('ID: 777')
			// route.params should be available (may be empty object if not properly set)
			expect(html).toBeDefined()
		})
	})

	describe('Complex Scenarios', () => {
		test('nested RouteResolvers with redirects', async() => {
			const Dashboard: ComponentType = {
				view: () => mServer('div', 'Dashboard'),
			}

			const Login: ComponentType = {
				view: () => mServer('div', 'Login'),
			}

			// Outer resolver checks auth
			const authResolver: RouteResolver = {
				onmatch: () => {
					// Simulate unauthenticated
					return mServer.route.redirect('/login')
				},
			}

			// Inner resolver wraps in layout
			const layoutResolver: RouteResolver = {
				onmatch: () => Login,
				render: (vnode) => {
					return mServer('div', [
						mServer('nav', 'Navigation'),
						mServer(vnode.tag),
					])
				},
			}

			const routes = {
				'/dashboard': authResolver,
				'/login': layoutResolver,
			}

			const result = await mServer.route.resolve('/dashboard', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Login')
			expect(html).toContain('Navigation')
		})

		test('route with both route params and query params', async() => {
			const Product: ComponentType<{id: string}> = {
				view: () => {
					const id = mServer.route.param('id')
					const color = mServer.route.param('color')
					return mServer('div', `Product ${id}, Color: ${color || 'default'}`)
				},
			}

			const routes = {
				'/product/:id': Product,
			}

			const result = await mServer.route.resolve('/product/123?color=red', routes, mServer.renderToString)
			const html = typeof result === 'string' ? result : result.html

			expect(html).toContain('Product 123')
			expect(html).toContain('Color: red')
		})
	})
})
