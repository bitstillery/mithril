import {describe, test, expect, beforeEach, mock} from 'bun:test'

import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render';
import m from '../../render/hyperscript'

describe('render', function() {
    let $window, root, render
    beforeEach(function() {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    test('initializes without DOM', function() {
        renderFn()
    })

    test('renders plain text', function() {
        render(root, 'a')
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0].nodeValue).toBe('a')
    })

    test('updates plain text', function() {
        render(root, 'a')
        render(root, 'b')
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0].nodeValue).toBe('b')
    })

    test('renders a number', function() {
        render(root, 1)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0].nodeValue).toBe('1')
    })

    test('updates a number', function() {
        render(root, 1)
        render(root, 2)
        expect(root.childNodes.length).toBe(1)
        expect(root.childNodes[0].nodeValue).toBe('2')
    })

    test('overwrites existing content', function() {
        const vnodes = []

        root.appendChild($window.document.createElement('div'));

        render(root, vnodes)

        expect(root.childNodes.length).toBe(0)
    })

    test('throws on invalid root node', function() {
        let threw = false
        try {
            render(null, [])
        } catch (e) {
            threw = true
        }
        expect(threw).toBe(true)
    })

    test('does not enter infinite loop when oninit triggers render and view throws with an object literal component', function(done) {
        const A = {
            oninit: init,
            view: function() {throw new Error('error')},
        }
        function run() {
            render(root, m(A))
        }
        function init() {
            setTimeout(function() {
                let threwInner = false
                try {run()} catch (e) {threwInner = true}

                expect(threwInner).toBe(false)
                done()
            }, 0)
        }

        let threwOuter = false
        try {run()} catch (e) {threwOuter = true}

        expect(threwOuter).toBe(true)
    })
    test('does not try to re-initialize a constructibe component whose view has thrown', function() {
        const oninit = mock()
        const onbeforeupdate = mock()
        function A() {}
        A.prototype.view = function() {throw new Error('error')}
        A.prototype.oninit = oninit
        A.prototype.onbeforeupdate = onbeforeupdate
        let throwCount = 0

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)
    })
    test('does not try to re-initialize a constructible component whose oninit has thrown', function() {
        const oninit = mock(function() {throw new Error('error')})
        const onbeforeupdate = mock()
        function A() {}
        A.prototype.view = function() {}
        A.prototype.oninit = oninit
        A.prototype.onbeforeupdate = onbeforeupdate
        let throwCount = 0

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)
    })
    test('does not try to re-initialize a constructible component whose constructor has thrown', function() {
        const oninit = mock()
        const onbeforeupdate = mock()
        function A() {throw new Error('error')}
        A.prototype.view = function() {}
        A.prototype.oninit = oninit
        A.prototype.onbeforeupdate = onbeforeupdate
        let throwCount = 0

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(0)
        expect(onbeforeupdate.mock.calls.length).toBe(0)

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(0)
        expect(onbeforeupdate.mock.calls.length).toBe(0)
    })
    test('does not try to re-initialize a closure component whose view has thrown', function() {
        const oninit = mock()
        const onbeforeupdate = mock()
        function A() {
            return {
                view: function() {throw new Error('error')},
                oninit: oninit,
                onbeforeupdate: onbeforeupdate,
            }
        }
        let throwCount = 0
        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)
    })
    test('does not try to re-initialize a closure component whose oninit has thrown', function() {
        const oninit = mock(function() {throw new Error('error')})
        const onbeforeupdate = mock()
        function A() {
            return {
                view: function() {},
                oninit: oninit,
                onbeforeupdate: onbeforeupdate,
            }
        }
        let throwCount = 0
        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
        expect(oninit.mock.calls.length).toBe(1)
        expect(onbeforeupdate.mock.calls.length).toBe(0)
    })
    test('does not try to re-initialize a closure component whose closure has thrown', function() {
        function A() {
            throw new Error('error')
        }
        let throwCount = 0
        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)

        try {render(root, m(A))} catch (e) {throwCount++}

        expect(throwCount).toBe(1)
    })
    test('lifecycle methods work in keyed children of recycled keyed', function() {
        const createA = mock()
        const updateA = mock()
        const removeA = mock()
        const createB = mock()
        const updateB = mock()
        const removeB = mock()
        const a = function() {
            return m('div', {key: 1},
                m('div', {key: 11, oncreate: createA, onupdate: updateA, onremove: removeA}),
                m('div', {key: 12}),
            )
        }
        const b = function() {
            return m('div', {key: 2},
                m('div', {key: 21, oncreate: createB, onupdate: updateB, onremove: removeB}),
                m('div', {key: 22}),
            )
        }
        render(root, a())
        render(root, b())
        render(root, a())

        expect(createA.mock.calls.length).toBe(2)
        expect(updateA.mock.calls.length).toBe(0)
        expect(removeA.mock.calls.length).toBe(1)
        expect(createB.mock.calls.length).toBe(1)
        expect(updateB.mock.calls.length).toBe(0)
        expect(removeB.mock.calls.length).toBe(1)
    })
    test('lifecycle methods work in unkeyed children of recycled keyed', function() {
        const createA = mock()
        const updateA = mock()
        const removeA = mock()
        const createB = mock()
        const updateB = mock()
        const removeB = mock()
        const a = function() {
            return m('div', {key: 1},
                m('div', {oncreate: createA, onupdate: updateA, onremove: removeA}),
            )
        }
        const b = function() {
            return m('div', {key: 2},
                m('div', {oncreate: createB, onupdate: updateB, onremove: removeB}),
            )
        }
        render(root, a())
        render(root, b())
        render(root, a())

        expect(createA.mock.calls.length).toBe(2)
        expect(updateA.mock.calls.length).toBe(0)
        expect(removeA.mock.calls.length).toBe(1)
        expect(createB.mock.calls.length).toBe(1)
        expect(updateB.mock.calls.length).toBe(0)
        expect(removeB.mock.calls.length).toBe(1)
    })
    test('update lifecycle methods work on children of recycled keyed', function() {
        const createA = mock()
        const updateA = mock()
        const removeA = mock()
        const createB = mock()
        const updateB = mock()
        const removeB = mock()

        const a = function() {
            return m('div', {key: 1},
                m('div', {oncreate: createA, onupdate: updateA, onremove: removeA}),
            )
        }
        const b = function() {
            return m('div', {key: 2},
                m('div', {oncreate: createB, onupdate: updateB, onremove: removeB}),
            )
        }
        render(root, a())
        render(root, a())
        expect(createA.mock.calls.length).toBe(1)
        expect(updateA.mock.calls.length).toBe(1)
        expect(removeA.mock.calls.length).toBe(0)

        render(root, b())
        expect(createA.mock.calls.length).toBe(1)
        expect(updateA.mock.calls.length).toBe(1)
        expect(removeA.mock.calls.length).toBe(1)

        render(root, a())
        render(root, a())

        expect(createA.mock.calls.length).toBe(2)
        expect(updateA.mock.calls.length).toBe(2)
        expect(removeA.mock.calls.length).toBe(1)
    })
    test('svg namespace is preserved in keyed diff (#1820)', function() {
        // note that this only exerciese one branch of the keyed diff algo
        let svg = m('svg',
            m('g', {key: 0}),
            m('g', {key: 1}),
        )
        render(root, svg)

        expect(svg.dom.namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(svg.dom.childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(svg.dom.childNodes[1].namespaceURI).toBe('http://www.w3.org/2000/svg')

        svg = m('svg',
            m('g', {key: 1, x: 1}),
            m('g', {key: 2, x: 2}),
        )
        render(root, svg)

        expect(svg.dom.namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(svg.dom.childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
        expect(svg.dom.childNodes[1].namespaceURI).toBe('http://www.w3.org/2000/svg')
    })
    test('the namespace of the root is passed to children', function() {
        render(root, m('svg'))
        expect(root.childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
        render(root.childNodes[0], m('g'))
        expect(root.childNodes[0].childNodes[0].namespaceURI).toBe('http://www.w3.org/2000/svg')
    })
    test('does not allow reentrant invocations', function() {
        const thrown = []
        function A() {
            let updated = false
            try {render(root, m(A))} catch (e) {thrown.push('construct')}
            return {
                oninit: function() {
                    try {render(root, m(A))} catch (e) {thrown.push('oninit')}
                },
                oncreate: function() {
                    try {render(root, m(A))} catch (e) {thrown.push('oncreate')}
                },
                onbeforeupdate: function() {
                    try {render(root, m(A))} catch (e) {thrown.push('onbeforeupdate')}
                },
                onupdate: function() {
                    if (updated) return
                    updated = true
                    try {render(root, m(A))} catch (e) {thrown.push('onupdate')}
                },
                onbeforeremove: function() {
                    try {render(root, m(A))} catch (e) {thrown.push('onbeforeremove')}
                },
                onremove: function() {
                    try {render(root, m(A))} catch (e) {thrown.push('onremove')}
                },
                view: function() {
                    try {render(root, m(A))} catch (e) {thrown.push('view')}
                },
            }
        }
        render(root, m(A))
        expect(thrown).toEqual([
            'construct',
            'oninit',
            'view',
            'oncreate',
        ])
        render(root, m(A))
        expect(thrown).toEqual([
            'construct',
            'oninit',
            'view',
            'oncreate',
            'onbeforeupdate',
            'view',
            'onupdate',
        ])
        render(root, [])
        expect(thrown).toEqual([
            'construct',
            'oninit',
            'view',
            'oncreate',
            'onbeforeupdate',
            'view',
            'onupdate',
            'onbeforeremove',
            'onremove',
        ])
    })
})
