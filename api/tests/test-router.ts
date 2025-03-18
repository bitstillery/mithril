// Low-priority TODO: remove the dependency on the renderer here.
import {describe, test, expect, beforeEach, mock} from 'bun:test';

import browserMock from '../../test-utils/browserMock';
import throttleMocker from '../../test-utils/throttleMock';
import m from '../../render/hyperscript';
import coreRenderer from '../../render/render';
import apiMountRedraw from '../../api/mount-redraw';
import apiRouter from '../../api/router';

describe('route', function() {
    // Note: the `n` parameter used in calls to this are generally found by
    // either trial-and-error or by studying the source. If tests are failing,
    // find the failing assertions, set `n` to about 10 on the preceding call to
    // `waitCycles`, then drop them down incrementally until it fails. The last
    // one to succeed is the one you want to keep. And just do that for each
    // failing assertion, and it'll eventually work.
    //
    // This is effectively what I did when designing this and hooking everything
    // up. (It would be so much easier to just be able to run the calls with a
    // different event loop and just turn it until I get what I want, but JS
    // lacks that functionality.)

    // Use precisely what `m.route` uses, for consistency and to ensure timings
    // are aligned.
    function waitCycles(n) {
        n = Math.max(n, 1)
        return new Promise(function(resolve) {
            return loop()
            function loop() {
                if (n === 0) resolve()
                else { n--; setTimeout(loop, 4) }
            }
        })
    }

    void [{protocol: 'http:', hostname: 'localhost'}, {protocol: 'file:', hostname: '/'}, {protocol: 'http:', hostname: 'ööö'}].forEach(function(env) {
        void ['#', '?', '', '#!', '?!', '/foo', '/föö'].forEach(function(prefix) {
            describe('using prefix `' + prefix + '` starting on ' + env.protocol + '//' + env.hostname, function() {
                let $window, root, mountRedraw, route, throttleMock
                let nextID = 0
                let currentTest = 0

                // Once done, a root should no longer be alive. This verifies
                // that, and it's a *very* subtle test bug that can lead to
                // some rather unusual consequences. If this fails, use
                // `waitCycles(n)` to avoid this.
                function lock(func) {
                    let id = currentTest
                    let start = Date.now()
                    try {
                        throw new Error()
                    } catch (trace) {
                        return function() {
                            // This *will* cause a test failure.
                            if (id != null && id !== currentTest) {
                                id = undefined
                                trace.message = 'called ' +
									(Date.now() - start) + 'ms after test end'
                                console.error(trace.stack)
                                expect('in test').toBe('not in test')
                            }
                            return func.apply(this, arguments)
                        }
                    }
                }

                // In case it doesn't get reset
                let realError = console.error

                beforeEach(function() {
                    currentTest = nextID++
                    $window = browserMock(env)
                    $window.setTimeout = setTimeout
                    // $window.setImmediate = setImmediate
                    throttleMock = throttleMocker()

                    root = $window.document.body

                    mountRedraw = apiMountRedraw(coreRenderer($window), throttleMock.schedule, console)
                    route = apiRouter($window, mountRedraw)
                    route.prefix = prefix
                    console.error = function() {
                        realError.call(this, new Error('Unexpected `console.error` call'))
                        realError.apply(this, arguments)
                    }
                })

                test('throws on invalid `root` DOM node', function() {
                    let threw = false
                    try {
                        route(null, '/', {'/':{view: lock(function() {})}})
                    } catch (e) {
                        threw = true
                    }
                    expect(threw).toBe(true)
                })

                test('renders into `root`', function() {
                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    expect(root.firstChild.nodeName).toBe('DIV')
                })

                test('resolves to route with escaped unicode', function() {
                    $window.location.href = prefix + '/%C3%B6?%C3%B6=%C3%B6'
                    route(root, '/ö', {
                        '/ö' : {
                            view: lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    expect(root.firstChild.nodeName).toBe('DIV')
                })

                test('resolves to route with unicode', function() {
                    $window.location.href = prefix + '/ö?ö=ö'
                    route(root, '/ö', {
                        '/ö' : {
                            view: lock(function() {
                                return JSON.stringify(route.param()) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe('{"ö":"ö"} /ö?ö=ö')
                })

                test('resolves to route with matching invalid escape', function() {
                    $window.location.href = prefix + '/%C3%B6abc%def'
                    route(root, '/öabc%def', {
                        '/öabc%def' : {
                            view: lock(function() {
                                return route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe('/öabc%def')
                })

                test('handles parameterized route', function() {
                    $window.location.href = prefix + '/test/x'
                    route(root, '/test/:a', {
                        '/test/:a' : {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe(
                        '{"a":"x"} {"a":"x"} /test/x',
                    )
                })

                test('handles multi-parameterized route', function() {
                    $window.location.href = prefix + '/test/x/y'
                    route(root, '/test/:a/:b', {
                        '/test/:a/:b' : {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe(
                        '{"a":"x","b":"y"} {"a":"x","b":"y"} /test/x/y',
                    )
                })

                test('handles rest parameterized route', function() {
                    $window.location.href = prefix + '/test/x/y'
                    route(root, '/test/:a...', {
                        '/test/:a...' : {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe(
                        '{"a":"x/y"} {"a":"x/y"} /test/x/y',
                    )
                })

                test('keeps trailing / in rest parameterized route', function() {
                    $window.location.href = prefix + '/test/d/'
                    route(root, '/test/:a...', {
                        '/test/:a...' : {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe(
                        '{"a":"d/"} {"a":"d/"} /test/d/',
                    )
                })

                test('handles route with search', function() {
                    $window.location.href = prefix + '/test?a=b&c=d'
                    route(root, '/test', {
                        '/test' : {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe(
                        '{"a":"b","c":"d"} {"a":"b","c":"d"} /test?a=b&c=d',
                    )
                })

                test('redirects to default route if no match', function() {
                    $window.location.href = prefix + '/test'
                    route(root, '/other', {
                        '/other': {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    return waitCycles(1).then(function() {
                        expect(root.firstChild.nodeValue).toBe('{} {} /other')
                    })
                })

                test('handles out of order routes', function() {
                    $window.location.href = prefix + '/z/y/x'

                    route(root, '/z/y/x', {
                        '/z/y/x': {
                            view: lock(function() { return '1' }),
                        },
                        '/:a...': {
                            view: lock(function() { return '2' }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe('1')
                })

                test('handles reverse out of order routes', function() {
                    $window.location.href = prefix + '/z/y/x'

                    route(root, '/z/y/x', {
                        '/:a...': {
                            view: lock(function() { return '2' }),
                        },
                        '/z/y/x': {
                            view: lock(function() { return '1' }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe('2')
                })

                test('resolves to route on fallback mode', function() {
                    $window.location.href = 'file://' + prefix + '/test'

                    route(root, '/test', {
                        '/test' : {
                            view: lock(function(vnode) {
                                return JSON.stringify(route.param()) + ' ' +
									JSON.stringify(vnode.attrs) + ' ' +
									route.get()
                            }),
                        },
                    })

                    expect(root.firstChild.nodeValue).toBe('{} {} /test')
                })

                test('routed mount points only redraw asynchronously (POJO component)', function() {
                    let view = mock()

                    $window.location.href = prefix + '/'
                    route(root, '/', {'/':{view:view}})

                    expect(view.mock.calls.length).toBe(1)

                    mountRedraw.redraw()

                    expect(view.mock.calls.length).toBe(1)

                    throttleMock.fire()

                    expect(view.mock.calls.length).toBe(2)
                })

                test('routed mount points only redraw asynchronously (constructible component)', function() {
                    let view = mock()

                    let Cmp = lock(function() {})
                    Cmp.prototype.view = lock(view)

                    $window.location.href = prefix + '/'
                    route(root, '/', {'/':Cmp})

                    expect(view.mock.calls.length).toBe(1)

                    mountRedraw.redraw()

                    expect(view.mock.calls.length).toBe(1)

                    throttleMock.fire()

                    expect(view.mock.calls.length).toBe(2)
                })

                test('routed mount points only redraw asynchronously (closure component)', function() {
                    let view = mock()

                    function Cmp() {return {view: lock(view)}}

                    $window.location.href = prefix + '/'
                    route(root, '/', {'/':lock(Cmp)})

                    expect(view.mock.calls.length).toBe(1)

                    mountRedraw.redraw()

                    expect(view.mock.calls.length).toBe(1)

                    throttleMock.fire()

                    expect(view.mock.calls.length).toBe(2)
                })

                test('subscribes correctly and removes when unmounted', function() {
                    $window.location.href = prefix + '/'

                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    expect(root.firstChild.nodeName).toBe('DIV')

                    mountRedraw.mount(root)

                    expect(root.childNodes.length).toBe(0)
                })

                test('default route doesn\'t break back button', function() {
                    $window.location.href = 'http://old.com'
                    $window.location.href = 'http://new.com'

                    route(root, '/a', {
                        '/a' : {
                            view: lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    return waitCycles(1).then(function() {
                        expect(root.firstChild.nodeName).toBe('DIV')

                        expect(route.get()).toBe('/a')

                        $window.history.back()

                        expect($window.location.pathname).toBe('/')
                        expect($window.location.hostname).toBe('old.com')
                    })
                })

                test('default route does not inherit params', function() {
                    $window.location.href = '/invalid?foo=bar'
                    route(root, '/a', {
                        '/a' : {
                            oninit: lock(function(vnode) {
                                expect(vnode.attrs.foo).toBeUndefined()
                            }),
                            view: lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    return waitCycles(1)
                })

                test('redraws when render function is executed', function() {
                    let onupdate = mock()
                    let oninit = mock()

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m('div', {
                                    oninit: oninit,
                                    onupdate: onupdate,
                                })
                            }),
                        },
                    })

                    expect(oninit.mock.calls.length).toBe(1)

                    mountRedraw.redraw()
                    throttleMock.fire()

                    expect(onupdate.mock.calls.length).toBe(1)
                })

                test('redraws on events', function() {
                    let onupdate = mock()
                    let oninit = mock()
                    let onclick = mock()
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m('div', {
                                    oninit: oninit,
                                    onupdate: onupdate,
                                    onclick: onclick,
                                })
                            }),
                        },
                    })

                    root.firstChild.dispatchEvent(e)

                    expect(oninit.mock.calls.length).toBe(1)

                    expect(onclick.mock.calls.length).toBe(1)
                    expect(onclick.mock.calls[0][0].target).toBe(root.firstChild)
                    expect(onclick.mock.calls[0][0].type).toBe('click')

                    throttleMock.fire()
                    expect(onupdate.mock.calls.length).toBe(1)
                })

                test('event handlers can skip redraw', function() {
                    let onupdate = mock()
                    let oninit = mock()
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m('div', {
                                    oninit: oninit,
                                    onupdate: onupdate,
                                    onclick: lock(function(e) {
                                        e.redraw = false
                                    }),
                                })
                            }),
                        },
                    })

                    expect(oninit.mock.calls.length).toBe(1)

                    root.firstChild.dispatchEvent(e)
                    throttleMock.fire()

                    // Wrapped to ensure no redraw fired
                    return waitCycles(1).then(function() {
                        expect(onupdate.mock.calls.length).toBe(0)
                    })
                })

                test('changes location on route.Link', function() {
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 0

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {href: '/test'})
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    let slash = prefix[0] === '/' ? '' : '/'

                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))

                    root.firstChild.dispatchEvent(e)
                    throttleMock.fire()
                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : '') + 'test')
                })

                test('passes options on route.Link', function() {
                    let opts = {}
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 0
                    $window.location.href = prefix + '/'

                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {
                                    href: '/test',
                                    options: opts,
                                })
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })
                    route.set = mock(route.set)

                    root.firstChild.dispatchEvent(e)

                    expect(route.set.mock.calls.length).toBe(1)
                    expect(route.set.mock.calls[0][2]).toBe(opts)
                })

                test('passes params on route.Link', function() {
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 0
                    $window.location.href = prefix + '/'

                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {
                                    href: '/test',
                                    params: {key: 'value'},
                                })
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })
                    route.set = mock(route.set)

                    root.firstChild.dispatchEvent(e)

                    expect(route.set.mock.calls.length).toBe(1)
                    expect(route.set.mock.calls[0][0]).toBe('/test?key=value')
                })

                test('route.Link can render without routes or dom access', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {href: '/test', foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('A')
                    expect(root.firstChild.href).toBe(prefix + '/test')
                    expect(root.firstChild.hasAttribute('aria-disabled')).toBe(false)
                    expect(root.firstChild.hasAttribute('disabled')).toBe(false)
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link keeps magic attributes from being double-called', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    let oninit = mock()
                    let oncreate = mock()
                    let onbeforeupdate = mock()
                    let onupdate = mock()
                    let onbeforeremove = mock()
                    let onremove = mock()

                    render(root, m(route.Link, {
                        href: '/test',
                        oninit: oninit,
                        oncreate: oncreate,
                        onbeforeupdate: onbeforeupdate,
                        onupdate: onupdate,
                        onbeforeremove: onbeforeremove,
                        onremove: onremove,
                    }, 'text'))

                    expect(oninit.mock.calls.length).toBe(1)
                    expect(oncreate.mock.calls.length).toBe(1)
                    expect(onbeforeupdate.mock.calls.length).toBe(0)
                    expect(onupdate.mock.calls.length).toBe(0)
                    expect(onbeforeremove.mock.calls.length).toBe(0)
                    expect(onremove.mock.calls.length).toBe(0)

                    render(root, m(route.Link, {
                        href: '/test',
                        oninit: oninit,
                        oncreate: oncreate,
                        onbeforeupdate: onbeforeupdate,
                        onupdate: onupdate,
                        onbeforeremove: onbeforeremove,
                        onremove: onremove,
                    }, 'text'))

                    expect(oninit.mock.calls.length).toBe(1)
                    expect(oncreate.mock.calls.length).toBe(1)
                    expect(onbeforeupdate.mock.calls.length).toBe(1)
                    expect(onupdate.mock.calls.length).toBe(1)
                    expect(onbeforeremove.mock.calls.length).toBe(0)
                    expect(onremove.mock.calls.length).toBe(0)

                    render(root, [])

                    expect(oninit.mock.calls.length).toBe(1)
                    expect(oncreate.mock.calls.length).toBe(1)
                    expect(onbeforeupdate.mock.calls.length).toBe(1)
                    expect(onupdate.mock.calls.length).toBe(1)
                    expect(onbeforeremove.mock.calls.length).toBe(1)
                    expect(onremove.mock.calls.length).toBe(1)
                })

                test('route.Link can render other tag without routes or dom access', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {selector: 'button', href: '/test', foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('BUTTON')
                    expect(root.firstChild.attributes['href'].value).toBe(prefix + '/test')
                    expect(root.firstChild.hasAttribute('aria-disabled')).toBe(false)
                    expect(root.firstChild.hasAttribute('disabled')).toBe(false)
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link can render other selector without routes or dom access', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {selector: 'button[href=/test]', foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('BUTTON')
                    expect(root.firstChild.attributes['href'].value).toBe(prefix + '/test')
                    expect(root.firstChild.hasAttribute('aria-disabled')).toBe(false)
                    expect(root.firstChild.hasAttribute('disabled')).toBe(false)
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link can render not disabled', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {href: '/test', disabled: false, foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('A')
                    expect(root.firstChild.href).toBe(prefix + '/test')
                    expect(root.firstChild.hasAttribute('aria-disabled')).toBe(false)
                    expect(root.firstChild.hasAttribute('disabled')).toBe(false)
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link can render falsy disabled', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {href: '/test', disabled: 0, foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('A')
                    expect(root.firstChild.href).toBe(prefix + '/test')
                    expect(root.firstChild.hasAttribute('aria-disabled')).toBe(false)
                    expect(root.firstChild.hasAttribute('disabled')).toBe(false)
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link can render disabled', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {href: '/test', disabled: true, foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('A')
                    expect(root.firstChild.href).toBe('')
                    expect(root.firstChild.attributes['aria-disabled'].value).toBe('true')
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.attributes['disabled'].value).toBe('')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link can render truthy disabled', function() {
                    $window = browserMock(env)
                    let render = coreRenderer($window)
                    route = apiRouter(null, null)
                    route.prefix = prefix
                    root = $window.document.body

                    render(root, m(route.Link, {href: '/test', disabled: 1, foo: 'bar'}, 'text'))

                    expect(root.childNodes.length).toBe(1)
                    expect(root.firstChild.nodeName).toBe('A')
                    expect(root.firstChild.href).toBe('')
                    expect(root.firstChild.attributes['aria-disabled'].value).toBe('true')
                    expect(root.firstChild.attributes['foo'].value).toBe('bar')
                    expect(root.firstChild.attributes['disabled'].value).toBe('')
                    expect(root.firstChild.childNodes.length).toBe(1)
                    expect(root.firstChild.firstChild.nodeName).toBe('#text')
                    expect(root.firstChild.firstChild.nodeValue).toBe('text')
                })

                test('route.Link doesn\'t redraw on wrong button', function() {
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 10

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {href: '/test'})
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    let slash = prefix[0] === '/' ? '' : '/'

                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))

                    root.firstChild.dispatchEvent(e)
                    throttleMock.fire()
                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))
                })

                test('route.Link doesn\'t redraw on preventDefault', function() {
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 0

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {
                                    href: '/test',
                                    onclick: function(e) {
                                        e.preventDefault()
                                    },
                                })
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    let slash = prefix[0] === '/' ? '' : '/'

                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))

                    root.firstChild.dispatchEvent(e)
                    throttleMock.fire()
                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))
                })

                test('route.Link doesn\'t redraw on preventDefault in handleEvent', function() {
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 0

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {
                                    href: '/test',
                                    onclick: {
                                        handleEvent: function(e) {
                                            e.preventDefault()
                                        },
                                    },
                                })
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    let slash = prefix[0] === '/' ? '' : '/'

                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))

                    root.firstChild.dispatchEvent(e)
                    throttleMock.fire()
                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))
                })

                test('route.Link doesn\'t redraw on return false', function() {
                    let e = $window.document.createEvent('MouseEvents')

                    e.initEvent('click', true, true)
                    e.button = 0

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            view: lock(function() {
                                return m(route.Link, {
                                    href: '/test',
                                    onclick: function() {
                                        return false
                                    },
                                })
                            }),
                        },
                        '/test' : {
                            view : lock(function() {
                                return m('div')
                            }),
                        },
                    })

                    let slash = prefix[0] === '/' ? '' : '/'

                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))

                    root.firstChild.dispatchEvent(e)
                    throttleMock.fire()
                    expect($window.location.href).toBe(env.protocol + '//' + (env.hostname === '/' ? '' : env.hostname) + slash + (prefix ? prefix + '/' : ''))
                })

                test('accepts RouteResolver with onmatch that returns Component', function() {
                    let matchCount = 0
                    let renderCount = 0
                    let Component = {
                        view: lock(function() {
                            return m('span')
                        }),
                    }

                    let resolver = {
                        onmatch: lock(function(args, requestedPath, route) {
                            matchCount++

                            expect(args.id).toBe('abc')
                            expect(requestedPath).toBe('/abc')
                            expect(route).toBe('/:id')
                            expect(this).toBe(resolver)
                            return Component
                        }),
                        render: lock(function(vnode) {
                            renderCount++

                            expect(vnode.attrs.id).toBe('abc')
                            expect(this).toBe(resolver)

                            return vnode
                        }),
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id' : resolver,
                    })

                    return waitCycles(1).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(1)
                        expect(root.firstChild.nodeName).toBe('SPAN')
                    })
                })

                test('accepts RouteResolver with onmatch that returns route.SKIP', function() {
                    let match1Count = 0
                    let match2Count = 0
                    let render1 = mock()
                    let render2Count = 0
                    let Component = {
                        view: lock(function() {
                            return m('span')
                        }),
                    }

                    let resolver1 = {
                        onmatch: lock(function(args, requestedPath, key) {
                            match1Count++

                            expect(args.id1).toBe('abc')
                            expect(requestedPath).toBe('/abc')
                            expect(key).toBe('/:id1')
                            expect(this).toBe(resolver1)
                            return route.SKIP
                        }),
                        render: lock(render1),
                    }

                    let resolver2 = {
                        onmatch: function(args, requestedPath, key) {
                            match2Count++

                            expect(args.id2).toBe('abc')
                            expect(requestedPath).toBe('/abc')
                            expect(key).toBe('/:id2')
                            expect(this).toBe(resolver2)
                            return Component
                        },
                        render: function(vnode) {
                            render2Count++

                            expect(vnode.attrs.id2).toBe('abc')
                            expect(this).toBe(resolver2)
                            expect(render1.mock.calls.length).toBe(0)

                            return vnode
                        },
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id1' : resolver1,
                        '/:id2' : resolver2,
                    })

                    return waitCycles(4).then(function() {
                        expect(match1Count).toBe(1)
                        expect(match2Count).toBe(1)
                        expect(render2Count).toBe(1)
                        expect(render1.mock.calls.length).toBe(0)
                        expect(root.firstChild.nodeName).toBe('SPAN')
                    })
                })

                test('accepts RouteResolver with onmatch that returns Promise<Component>', function() {
                    let matchCount = 0
                    let renderCount = 0
                    let Component = {
                        view: lock(function() {
                            return m('span')
                        }),
                    }

                    let resolver = {
                        onmatch: lock(function(args, requestedPath, route) {
                            matchCount++

                            expect(args.id).toBe('abc')
                            expect(requestedPath).toBe('/abc')
                            expect(route).toBe('/:id')
                            expect(this).toBe(resolver)
                            return Promise.resolve(Component)
                        }),
                        render: lock(function(vnode) {
                            renderCount++

                            expect(vnode.attrs.id).toBe('abc')
                            expect(this).toBe(resolver)

                            return vnode
                        }),
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id' : resolver,
                    })

                    return waitCycles(10).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(1)
                        expect(root.firstChild.nodeName).toBe('SPAN')
                    })
                })

                test('accepts RouteResolver with onmatch that returns Promise<undefined>', function() {
                    let matchCount = 0
                    let renderCount = 0

                    let resolver = {
                        onmatch: lock(function(args, requestedPath, route) {
                            matchCount++

                            expect(args.id).toBe('abc')
                            expect(requestedPath).toBe('/abc')
                            expect(route).toBe('/:id')
                            expect(this).toBe(resolver)
                            return Promise.resolve()
                        }),
                        render: lock(function(vnode) {
                            renderCount++

                            expect(vnode.attrs.id).toBe('abc')
                            expect(this).toBe(resolver)

                            return vnode
                        }),
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id' : resolver,
                    })

                    return waitCycles(2).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(1)
                        expect(root.firstChild.nodeName).toBe('DIV')
                    })
                })

                test('accepts RouteResolver with onmatch that returns Promise<any>', function() {
                    let matchCount = 0
                    let renderCount = 0

                    let resolver = {
                        onmatch: lock(function(args, requestedPath, route) {
                            matchCount++

                            expect(args.id).toBe('abc')
                            expect(requestedPath).toBe('/abc')
                            expect(route).toBe('/:id')
                            expect(this).toBe(resolver)
                            return Promise.resolve([])
                        }),
                        render: lock(function(vnode) {
                            renderCount++

                            expect(vnode.attrs.id).toBe('abc')
                            expect(this).toBe(resolver)

                            return vnode
                        }),
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id' : resolver,
                    })

                    return waitCycles(2).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(1)
                        expect(root.firstChild.nodeName).toBe('DIV')
                    })
                })

                test('accepts RouteResolver with onmatch that returns rejected Promise', function() {
                    let matchCount = 0
                    let renderCount = 0
                    let spy = mock()
                    let error = new Error('error')
                    let errorSpy = console.error = mock()

                    let resolver = {
                        onmatch: lock(function() {
                            matchCount++
                            return Promise.reject(error)
                        }),
                        render: lock(function(vnode) {
                            renderCount++
                            return vnode
                        }),
                    }

                    $window.location.href = prefix + '/test/1'
                    route(root, '/default', {
                        '/default' : {view: spy},
                        '/test/:id' : resolver,
                    })

                    return waitCycles(3).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(0)
                        expect(spy.mock.calls.length).toBe(1)
                        expect(errorSpy.mock.calls.length).toBe(1)
                        expect(errorSpy.mock.calls[0][0]).toBe(error)
                    })
                })

                test('accepts RouteResolver without `render` method as payload', function() {
                    let matchCount = 0
                    let Component = {
                        view: lock(function() {
                            return m('div')
                        }),
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id' : {
                            onmatch: lock(function(args, requestedPath, route) {
                                matchCount++

                                expect(args.id).toBe('abc')
                                expect(requestedPath).toBe('/abc')
                                expect(route).toBe('/:id')

                                return Component
                            }),
                        },
                    })

                    return waitCycles(2).then(function() {
                        expect(matchCount).toBe(1)
                        expect(root.firstChild.nodeName).toBe('DIV')
                    })
                })

                test('changing `key` param resets the component', function() {
                    let oninit = mock()
                    let Component = {
                        oninit: oninit,
                        view: lock(function() {
                            return m('div')
                        }),
                    }
                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:key': Component,
                    })
                    return waitCycles(1).then(function() {
                        expect(oninit.mock.calls.length).toBe(1)
                        route.set('/def')
                        return waitCycles(1).then(function() {
                            throttleMock.fire()
                            expect(oninit.mock.calls.length).toBe(2)
                        })
                    })
                })

                test('accepts RouteResolver without `onmatch` method as payload', function() {
                    let renderCount = 0
                    let Component = {
                        view: lock(function() {
                            return m('div')
                        }),
                    }

                    $window.location.href = prefix + '/abc'
                    route(root, '/abc', {
                        '/:id' : {
                            render: lock(function(vnode) {
                                renderCount++

                                expect(vnode.attrs.id).toBe('abc')

                                return m(Component)
                            }),
                        },
                    })

                    expect(root.firstChild.nodeName).toBe('DIV')
                    expect(renderCount).toBe(1)
                })

                test('RouteResolver `render` does not have component semantics', function() {
                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            render: lock(function() {
                                return m('div', m('p'))
                            }),
                        },
                        '/b' : {
                            render: lock(function() {
                                return m('div', m('a'))
                            }),
                        },
                    })

                    let dom = root.firstChild
                    let child = dom.firstChild

                    expect(root.firstChild.nodeName).toBe('DIV')

                    route.set('/b')

                    return waitCycles(1).then(function() {
                        throttleMock.fire()

                        expect(root.firstChild).toBe(dom)
                        expect(root.firstChild.firstChild).not.toBe(child)
                    })
                })

                test('calls onmatch and view correct number of times', function() {
                    let matchCount = 0
                    let renderCount = 0
                    let Component = {
                        view: lock(function() {
                            return m('div')
                        }),
                    }

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            onmatch: lock(function() {
                                matchCount++
                                return Component
                            }),
                            render: lock(function(vnode) {
                                renderCount++
                                return vnode
                            }),
                        },
                    })

                    return waitCycles(1).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(1)

                        mountRedraw.redraw()
                        throttleMock.fire()

                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(2)
                    })
                })

                test('calls onmatch and view correct number of times when not onmatch returns undefined', function() {
                    let matchCount = 0
                    let renderCount = 0
                    let Component = {
                        view: lock(function() {
                            return m('div')
                        }),
                    }

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/' : {
                            onmatch: lock(function() {
                                matchCount++
                            }),
                            render: lock(function() {
                                renderCount++
                                return m(Component)
                            }),
                        },
                    })

                    return waitCycles(2).then(function() {
                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(1)

                        mountRedraw.redraw()
                        throttleMock.fire()

                        expect(matchCount).toBe(1)
                        expect(renderCount).toBe(2)
                    })
                })

                test('onmatch can redirect to another route', function() {
                    let redirected = false
                    let render = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/b')
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            view: lock(function() {
                                redirected = true
                            }),
                        },
                    })

                    return waitCycles(2).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                    })
                })

                test('onmatch can redirect to another route that has RouteResolver with only onmatch', function() {
                    let redirected = false
                    let render = mock()
                    let view = mock(function() {return m('div')})

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/b', {}, {state: {a: 5}})
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            onmatch: lock(function() {
                                redirected = true
                                return {view: lock(view)}
                            }),
                        },
                    })

                    return waitCycles(3).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                        expect(view.mock.calls.length).toBe(1)
                        expect(root.childNodes.length).toBe(1)
                        expect(root.firstChild.nodeName).toBe('DIV')
                        expect($window.history.state).toEqual({a: 5})
                    })
                })

                test('onmatch can redirect to another route that has RouteResolver with only render', function() {
                    let redirected = false
                    let render = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/b')
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            render: lock(function() {
                                redirected = true
                            }),
                        },
                    })

                    return waitCycles(2).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                    })
                })

                test('onmatch can redirect to another route that has RouteResolver whose onmatch resolves asynchronously', function() {
                    let redirected = false
                    let render = mock()
                    let view = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/b')
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            onmatch: lock(function() {
                                redirected = true
                                return waitCycles(1).then(function() {
                                    return {view: view}
                                })
                            }),
                        },
                    })

                    return waitCycles(6).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                        expect(view.mock.calls.length).toBe(1)
                    })
                })

                test('onmatch can redirect to another route asynchronously', function() {
                    let redirected = false
                    let render = mock()
                    let view = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            onmatch: lock(function() {
                                waitCycles(1).then(function() {route.set('/b')})
                                return new Promise(function() {})
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            onmatch: lock(function() {
                                redirected = true
                                return {view: lock(view)}
                            }),
                        },
                    })

                    return waitCycles(5).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                        expect(view.mock.calls.length).toBe(1)
                    })
                })

                test('onmatch can redirect with window.history.back()', function() {

                    let render = mock()
                    let component = {view: mock()}

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a' : {
                            onmatch: lock(function() {
                                return component
                            }),
                            render: lock(function(vnode) {
                                return vnode
                            }),
                        },
                        '/b' : {
                            onmatch: lock(function() {
                                $window.history.back()
                                return new Promise(function() {})
                            }),
                            render: lock(render),
                        },
                    })

                    return waitCycles(2).then(function() {
                        throttleMock.fire()

                        route.set('/b')
                        expect(render.mock.calls.length).toBe(0)
                        expect(component.view.mock.calls.length).toBe(1)

                        return waitCycles(4).then(function() {
                            throttleMock.fire()

                            expect(render.mock.calls.length).toBe(0)
                            expect(component.view.mock.calls.length).toBe(2)
                        })
                    })
                })

                test('onmatch can redirect to a non-existent route that defaults to a RouteResolver with onmatch', function() {
                    let redirected = false
                    let render = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/b', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/c')
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            onmatch: lock(function() {
                                redirected = true
                                return {view: lock(function() {})}
                            }),
                        },
                    })

                    return waitCycles(3).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                    })
                })

                test('onmatch can redirect to a non-existent route that defaults to a RouteResolver with render', function() {
                    let redirected = false
                    let render = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/b', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/c')
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            render: lock(function() {
                                redirected = true
                            }),
                        },
                    })

                    return waitCycles(3).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                    })
                })

                test('onmatch can redirect to a non-existent route that defaults to a component', function() {
                    let redirected = false
                    let render = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/b', {
                        '/a' : {
                            onmatch: lock(function() {
                                route.set('/c')
                            }),
                            render: lock(render),
                        },
                        '/b' : {
                            view: lock(function() {
                                redirected = true
                            }),
                        },
                    })

                    return waitCycles(3).then(function() {
                        expect(render.mock.calls.length).toBe(0)
                        expect(redirected).toBe(true)
                    })
                })

                test('the previous view redraws while onmatch resolution is pending (#1268)', function() {
                    let view = mock()
                    let onmatch = mock(function() {
                        return new Promise(function() {})
                    })

                    $window.location.href = prefix + '/a'
                    route(root, '/', {
                        '/a': {view: lock(view)},
                        '/b': {onmatch: lock(onmatch)},
                        '/': {view: lock(function() {})},
                    })

                    expect(view.mock.calls.length).toBe(1)
                    expect(onmatch.mock.calls.length).toBe(0)

                    route.set('/b')

                    return waitCycles(1).then(function() {
                        expect(view.mock.calls.length).toBe(1)
                        expect(onmatch.mock.calls.length).toBe(1)

                        mountRedraw.redraw()
                        throttleMock.fire()

                        expect(view.mock.calls.length).toBe(2)
                        expect(onmatch.mock.calls.length).toBe(1)
                    })
                })

                test('when two async routes are racing, the last one set cancels the finalization of the first', function(done) {
                    let renderA = mock()
                    let renderB = mock()
                    let onmatchA = mock(function() {
                        return waitCycles(3)
                    })

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a': {
                            onmatch: lock(onmatchA),
                            render: lock(renderA),
                        },
                        '/b': {
                            onmatch: lock(function() {
                                var p = new Promise(function(fulfill) {
                                    expect(onmatchA.mock.calls.length).toBe(1)
                                    expect(renderA.mock.calls.length).toBe(0)
                                    expect(renderB.mock.calls.length).toBe(0)

                                    waitCycles(3).then(function() {
                                        expect(onmatchA.mock.calls.length).toBe(1)
                                        expect(renderA.mock.calls.length).toBe(0)
                                        expect(renderB.mock.calls.length).toBe(0)

                                        fulfill()
                                        return p
                                    }).then(function() {
                                        return waitCycles(1)
                                    }).then(function() {
                                        expect(onmatchA.mock.calls.length).toBe(1)
                                        expect(renderA.mock.calls.length).toBe(0)
                                        expect(renderB.mock.calls.length).toBe(1)
                                    }).then(done, done)
                                })
                                return p
                            }),
                            render: lock(renderB),
                        },
                    })

                    waitCycles(1).then(lock(function() {
                        expect(onmatchA.mock.calls.length).toBe(1)
                        expect(renderA.mock.calls.length).toBe(0)
                        expect(renderB.mock.calls.length).toBe(0)
                        route.set('/b')
                        expect(onmatchA.mock.calls.length).toBe(1)
                        expect(renderA.mock.calls.length).toBe(0)
                        expect(renderB.mock.calls.length).toBe(0)
                    }))
                })

                test('m.route.set(m.route.get()) re-runs the resolution logic (#1180)', function() {
                    let onmatch = mock()
                    let render = mock(function() {return m('div')})

                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/': {
                            onmatch: lock(onmatch),
                            render: lock(render),
                        },
                    })

                    return waitCycles(1).then(function() {
                        throttleMock.fire()

                        expect(onmatch.mock.calls.length).toBe(1)
                        expect(render.mock.calls.length).toBe(1)

                        route.set(route.get())

                        return waitCycles(2).then(function() {
                            throttleMock.fire()

                            expect(onmatch.mock.calls.length).toBe(2)
                            expect(render.mock.calls.length).toBe(2)
                        })
                    })
                })

                test('m.route.get() returns the last fully resolved route (#1276)', function() {
                    $window.location.href = prefix + '/'

                    route(root, '/', {
                        '/': {view: lock(function() {})},
                        '/2': {
                            onmatch: lock(function() {
                                return new Promise(function() {})
                            }),
                        },
                    })

                    expect(route.get()).toBe('/')

                    route.set('/2')

                    return waitCycles(1).then(function() {
                        expect(route.get()).toBe('/')
                    })
                })

                test('routing with RouteResolver works more than once', function() {
                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a': {
                            render: lock(function() {
                                return m('a', 'a')
                            }),
                        },
                        '/b': {
                            render: lock(function() {
                                return m('b', 'b')
                            }),
                        },
                    })

                    route.set('/b')

                    return waitCycles(1).then(function() {
                        throttleMock.fire()

                        expect(root.firstChild.nodeName).toBe('B')

                        route.set('/a')

                        return waitCycles(1).then(function() {
                            throttleMock.fire()

                            expect(root.firstChild.nodeName).toBe('A')
                        })
                    })
                })

                test('calling route.set invalidates pending onmatch resolution', function() {
                    let rendered = false
                    let resolved
                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a': {
                            onmatch: lock(function() {
                                return waitCycles(2).then(function() {
                                    return {view: lock(function() {rendered = true})}
                                })
                            }),
                            render: lock(function() {
                                rendered = true
                                resolved = 'a'
                            }),
                        },
                        '/b': {
                            view: lock(function() {
                                resolved = 'b'
                            }),
                        },
                    })

                    route.set('/b')

                    return waitCycles(1).then(function() {
                        expect(rendered).toBe(false)
                        expect(resolved).toBe('b')

                        return waitCycles(1).then(function() {
                            expect(rendered).toBe(false)
                            expect(resolved).toBe('b')
                        })
                    })
                })

                test('route changes activate onbeforeremove', function() {
                    let spy = mock()

                    $window.location.href = prefix + '/a'
                    route(root, '/a', {
                        '/a': {
                            onbeforeremove: lock(spy),
                            view: lock(function() {}),
                        },
                        '/b': {
                            view: lock(function() {}),
                        },
                    })

                    route.set('/b')

                    // setting the route is asynchronous
                    return waitCycles(1).then(function() {
                        throttleMock.fire()
                        expect(spy.mock.calls.length).toBe(1)
                    })
                })

                test('asynchronous route.set in onmatch works', function() {
                    let rendered = false, resolved
                    route(root, '/a', {
                        '/a': {
                            onmatch: lock(function() {
                                return Promise.resolve().then(lock(function() {
                                    route.set('/b')
                                }))
                            }),
                            render: lock(function() {
                                rendered = true
                                resolved = 'a'
                            }),
                        },
                        '/b': {
                            view: lock(function() {
                                resolved = 'b'
                            }),
                        },
                    })

                    // tick for popstate for /a
                    // tick for onmatch
                    // tick for promise in onmatch
                    // tick for onpopstate for /b
                    return waitCycles(4).then(function() {
                        expect(rendered).toBe(false)
                        expect(resolved).toBe('b')
                    })
                })

                test('throttles', function() {
                    let i = 0
                    $window.location.href = prefix + '/'
                    route(root, '/', {
                        '/': {view: lock(function() {i++})},
                    })
                    let before = i

                    mountRedraw.redraw()
                    mountRedraw.redraw()
                    mountRedraw.redraw()
                    mountRedraw.redraw()
                    let after = i

                    throttleMock.fire()

                    expect(before).toBe(1) // routes synchronously
                    expect(after).toBe(1) // redraws asynchronously
                    expect(i).toBe(2)
                })

                test('m.route.param is available outside of route handlers', function() {
                    $window.location.href = prefix + '/'

                    route(root, '/1', {
                        '/:id' : {
                            view : lock(function() {
                                expect(route.param('id')).toBe('1')

                                return m('div')
                            }),
                        },
                    })

                    expect(route.param('id')).toBe(undefined);
                    expect(route.param()).toBeUndefined();

                    return waitCycles(1).then(function() {
                        expect(route.param('id')).toBe('1')
                        expect(route.param()).toEqual({id:'1'})
                    })
                })
            })
        })
    })
})
