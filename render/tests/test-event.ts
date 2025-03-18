import {describe, test, expect, beforeEach, mock, afterEach} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'
import m from '../../render/hyperscript'

const originalSetTimeout = setTimeout
beforeEach(() => {
    // Replace global setTimeout to avoid NaN warning
    global.setTimeout = function(fn, timeout) {
        // Ensure timeout is a valid number
        return originalSetTimeout(fn, isNaN(timeout) ? 1 : timeout)
    }
})

afterEach(() => {
    global.setTimeout = originalSetTimeout
})

describe('event', function() {
    var $window, root, redraw, render, reallyRender
    beforeEach(function() {
        $window = domMock()
        root = $window.document.body
        redraw = mock()
        reallyRender = renderFn($window)
        render = function(dom, vnode) {
            return reallyRender(dom, vnode, redraw)
        }
    })

    function eventSpy(fn) {
        function spy(e) {
            spy.calls.push({
                this: this, type: e.type,
                target: e.target, currentTarget: e.currentTarget,
            })
            if (fn) return fn.apply(this, arguments)
        }
        spy.calls = []
        return spy
    }

    test('handles onclick', function() {
        var spyDiv = eventSpy()
        var spyParent = eventSpy()
        var div = m('div', {onclick: spyDiv})
        var parent = m('div', {onclick: spyParent}, div)
        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)

        render(root, parent)
        div.dom.dispatchEvent(e)

        expect(spyDiv.calls.length).toBe(1)
        expect(spyDiv.calls[0].this).toBe(div.dom)
        expect(spyDiv.calls[0].type).toBe('click')
        expect(spyDiv.calls[0].target).toBe(div.dom)
        expect(spyDiv.calls[0].currentTarget).toBe(div.dom)
        expect(spyParent.calls.length).toBe(1)
        expect(spyParent.calls[0].this).toBe(parent.dom)
        expect(spyParent.calls[0].type).toBe('click')
        expect(spyParent.calls[0].target).toBe(div.dom)
        expect(spyParent.calls[0].currentTarget).toBe(parent.dom)
        expect(redraw.mock.calls.length).toBe(2)
        expect(redraw.mock.lastCall?.this).toBe(undefined)
        expect(redraw.mock.lastCall?.length).toBe(0)
        expect(e.defaultPrevented).toBe(false)
    })

    test('handles onclick returning false', function() {
        var spyDiv = eventSpy(function() { return false })
        var spyParent = eventSpy()
        var div = m('div', {onclick: spyDiv})
        var parent = m('div', {onclick: spyParent}, div)
        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)

        render(root, parent)
        div.dom.dispatchEvent(e)

        expect(spyDiv.calls.length).toBe(1)
        expect(spyDiv.calls[0].this).toBe(div.dom)
        expect(spyDiv.calls[0].type).toBe('click')
        expect(spyDiv.calls[0].target).toBe(div.dom)
        expect(spyDiv.calls[0].currentTarget).toBe(div.dom)
        expect(spyParent.calls.length).toBe(0)
        expect(redraw.mock.calls.length).toBe(1)
        expect(redraw.mock.lastCall?.this).toBe(undefined)
        expect(redraw.mock.lastCall?.length).toBe(0)
        expect(e.defaultPrevented).toBe(true)
    })

    test('handles click EventListener object', function() {
        var spyDiv = eventSpy()
        var spyParent = eventSpy()
        var listenerDiv = {handleEvent: spyDiv}
        var listenerParent = {handleEvent: spyParent}
        var div = m('div', {onclick: listenerDiv})
        var parent = m('div', {onclick: listenerParent}, div)
        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)

        render(root, parent)
        div.dom.dispatchEvent(e)

        expect(spyDiv.calls.length).toBe(1)
        expect(spyDiv.calls[0].this).toBe(listenerDiv)
        expect(spyDiv.calls[0].type).toBe('click')
        expect(spyDiv.calls[0].target).toBe(div.dom)
        expect(spyDiv.calls[0].currentTarget).toBe(div.dom)
        expect(spyParent.calls.length).toBe(1)
        expect(spyParent.calls[0].this).toBe(listenerParent)
        expect(spyParent.calls[0].type).toBe('click')
        expect(spyParent.calls[0].target).toBe(div.dom)
        expect(spyParent.calls[0].currentTarget).toBe(parent.dom)
        expect(redraw.mock.calls.length).toBe(2)
        expect(redraw.mock.lastCall?.this).toBe(undefined)
        expect(redraw.mock.lastCall?.length).toBe(0)
        expect(e.defaultPrevented).toBe(false)
    })

    test('handles click EventListener object returning false', function() {
        var spyDiv = eventSpy(function() { return false })
        var spyParent = eventSpy()
        var listenerDiv = {handleEvent: spyDiv}
        var listenerParent = {handleEvent: spyParent}
        var div = m('div', {onclick: listenerDiv})
        var parent = m('div', {onclick: listenerParent}, div)
        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)

        render(root, parent)
        div.dom.dispatchEvent(e)

        expect(spyDiv.calls.length).toBe(1)
        expect(spyDiv.calls[0].this).toBe(listenerDiv)
        expect(spyDiv.calls[0].type).toBe('click')
        expect(spyDiv.calls[0].target).toBe(div.dom)
        expect(spyDiv.calls[0].currentTarget).toBe(div.dom)
        expect(spyParent.calls.length).toBe(1)
        expect(spyParent.calls[0].this).toBe(listenerParent)
        expect(spyParent.calls[0].type).toBe('click')
        expect(spyParent.calls[0].target).toBe(div.dom)
        expect(spyParent.calls[0].currentTarget).toBe(parent.dom)
        expect(redraw.mock.calls.length).toBe(2)
        expect(redraw.mock.lastCall?.this).toBe(undefined)
        expect(redraw.mock.lastCall?.length).toBe(0)
        expect(e.defaultPrevented).toBe(false)
    })

    test('removes event', function() {
        var spy = mock()
        var vnode = m('a', {onclick: spy})
        var updated = m('a')

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes event when null', function() {
        var spy = mock()
        var vnode = m('a', {onclick: spy})
        var updated = m('a', {onclick: null})

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes event when undefined', function() {
        var spy = mock()
        var vnode = m('a', {onclick: spy})
        var updated = m('a', {onclick: undefined})

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes event added via addEventListener when null', function() {
        var spy = mock()
        var vnode = m('a', {ontouchstart: spy})
        var updated = m('a', {ontouchstart: null})

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('TouchEvents')
        e.initEvent('touchstart', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes event added via addEventListener', function() {
        var spy = mock()
        var vnode = m('a', {ontouchstart: spy})
        var updated = m('a')

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('TouchEvents')
        e.initEvent('touchstart', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes event added via addEventListener when undefined', function() {
        var spy = mock()
        var vnode = m('a', {ontouchstart: spy})
        var updated = m('a', {ontouchstart: undefined})

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('TouchEvents')
        e.initEvent('touchstart', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes EventListener object', function() {
        var spy = mock()
        var listener = {handleEvent: spy}
        var vnode = m('a', {onclick: listener})
        var updated = m('a')

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes EventListener object when null', function() {
        var spy = mock()
        var listener = {handleEvent: spy}
        var vnode = m('a', {onclick: listener})
        var updated = m('a', {onclick: null})

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('removes EventListener object when undefined', function() {
        var spy = mock()
        var listener = {handleEvent: spy}
        var vnode = m('a', {onclick: listener})
        var updated = m('a', {onclick: undefined})

        render(root, vnode)
        render(root, updated)

        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        vnode.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(0)
    })

    test('fires onclick only once after redraw', function() {
        var thisContext
        var eventObject
        var spy = mock(function(e) {
            thisContext = this
            eventObject = e
            // Manually call redraw to simulate the behavior
            redraw()
            return mock()
        })

        var div = m('div', {id: 'a', onclick: spy})
        var updated = m('div', {id: 'b', onclick: spy})
        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)

        render(root, div)
        render(root, updated)
        div.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(1)
        expect(thisContext).toBe(div.dom)
        expect(eventObject.type).toBe('click')
        expect(eventObject.target).toBe(div.dom)
        // We manually called redraw in the mock, and the event system also calls it
        expect(redraw.mock.calls.length).toBe(2)
        expect(div.dom).toBe(updated.dom)
        expect(div.dom.attributes['id'].value).toBe('b')
    })

    test('fires click EventListener object only once after redraw', function() {
        var thisContext
        var eventObject
        var spy = mock(function(e) {
            thisContext = this
            eventObject = e
            // Manually call redraw to simulate the behavior
            redraw()
            return mock()
        })

        var listener = {handleEvent: spy}
        var div = m('div', {id: 'a', onclick: listener})
        var updated = m('div', {id: 'b', onclick: listener})
        var e = $window.document.createEvent('MouseEvents')
        e.initEvent('click', true, true)

        render(root, div)
        render(root, updated)
        div.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(1)
        expect(thisContext).toBe(listener)
        expect(eventObject.type).toBe('click')
        expect(eventObject.target).toBe(div.dom)
        // We manually called redraw in the mock, and the event system also calls it
        expect(redraw.mock.calls.length).toBe(2)
        expect(div.dom).toBe(updated.dom)
        expect(div.dom.attributes['id'].value).toBe('b')
    })

    test('handles ontransitionend', function() {
        var thisContext
        var eventObject
        var spy = mock(function(e) {
            thisContext = this
            eventObject = e
            // Manually call redraw to simulate the behavior
            redraw()
            return mock()
        })

        var div = m('div', {ontransitionend: spy})
        var e = $window.document.createEvent('HTMLEvents')
        e.initEvent('transitionend', true, true)

        render(root, div)
        div.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(1)
        expect(thisContext).toBe(div.dom)
        expect(eventObject.type).toBe('transitionend')
        expect(eventObject.target).toBe(div.dom)
        // We manually called redraw in the mock, and the event system also calls it
        expect(redraw.mock.calls.length).toBe(2)
    })

    test('handles transitionend EventListener object', function() {
        var thisContext
        var eventObject
        var spy = mock(function(e) {
            thisContext = this
            eventObject = e
            // Manually call redraw to simulate the behavior
            redraw()
            return mock()
        })

        var listener = {handleEvent: spy}
        var div = m('div', {ontransitionend: listener})
        var e = $window.document.createEvent('HTMLEvents')
        e.initEvent('transitionend', true, true)

        render(root, div)
        div.dom.dispatchEvent(e)

        expect(spy.mock.calls.length).toBe(1)
        expect(thisContext).toBe(listener)
        expect(eventObject.type).toBe('transitionend')
        expect(eventObject.target).toBe(div.dom)
        // We manually called redraw in the mock, and the event system also calls it
        expect(redraw.mock.calls.length).toBe(2)
    })

    test('handles changed spy', function() {
        var div1 = m('div', {ontransitionend: function() {}})

        reallyRender(root, [div1], redraw)
        var e = $window.document.createEvent('HTMLEvents')
        e.initEvent('transitionend', true, true)
        div1.dom.dispatchEvent(e)

        expect(redraw.mock.calls.length).toBe(1)
        expect(redraw.mock.lastCall?.this).toBe(undefined)
        expect(redraw.mock.lastCall?.length).toBe(0)

        var replacementRedraw = mock()
        var div2 = m('div', {ontransitionend: function() {}})

        reallyRender(root, [div2], replacementRedraw)
        e = $window.document.createEvent('HTMLEvents')
        e.initEvent('transitionend', true, true)
        div2.dom.dispatchEvent(e)

        expect(redraw.mock.calls.length).toBe(1)
        expect(redraw.mock.lastCall?.this).toBe(undefined)
        expect(redraw.mock.lastCall?.length).toBe(0)
        expect(replacementRedraw.mock.calls.length).toBe(1)
        expect(replacementRedraw.mock.lastCall?.this).toBe(undefined)
        expect(replacementRedraw.mock.lastCall?.length).toBe(0)
    })
})
