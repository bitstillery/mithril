import {describe, test, expect, beforeEach} from 'bun:test'

import m from '../../render/hyperscript'
import domMock from '../../test-utils/domMock'
import renderFn from '../../render/render'

describe('render/hyperscript integration', () => {
    let $window, root, render
    beforeEach(() => {
        $window = domMock()
        root = $window.document.createElement('div')
        render = renderFn($window)
    })

    describe('setting class', () => {
        test('selector only', () => {
            render(root, m('.foo'))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })

        test('class only', () => {
            render(root, m('div', {class: 'foo'}))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })

        test('className only', () => {
            render(root, m('div', {className: 'foo'}))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })

        test('selector and class', () => {
            render(root, m('.bar', {class: 'foo'}))

            expect(root.firstChild.className.split(' ').sort()).toEqual(['bar', 'foo'])
        })

        test('selector and className', () => {
            render(root, m('.bar', {className: 'foo'}))

            expect(root.firstChild.className.split(' ').sort()).toEqual(['bar', 'foo'])
        })

        test('selector and a null class', () => {
            render(root, m('.foo', {class: null}))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })

        test('selector and a null className', () => {
            render(root, m('.foo', {className: null}))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })

        test('selector and an undefined class', () => {
            render(root, m('.foo', {class: undefined}))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })

        test('selector and an undefined className', () => {
            render(root, m('.foo', {className: undefined}))

            expect(root.firstChild.className.includes('foo')).toBe(true)
        })
    })

    describe('updating class', () => {
        describe('from selector only', () => {
            test('to selector only', () => {
                render(root, m('.foo1'))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.foo1'))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.foo1'))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.foo1'))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.foo1'))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.foo1'))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.foo1'))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.foo1'))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.foo1'))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from class only', () => {
            test('to selector only', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('div', {class: 'foo2'}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from ', () => {
            test('to selector only', () => {
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from className only', () => {
            test('to selector only', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('div', {className: 'foo1'}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from selector and class', () => {
            test('to selector only', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.bar1', {class: 'foo1'}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from selector and className', () => {
            test('to selector only', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.bar1', {className: 'foo1'}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from  and a null class', () => {
            test('to selector only', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.foo1', {class: null}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from selector and a null className', () => {
            test('to selector only', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.foo1', {className: null}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from selector and an undefined class', () => {
            test('to selector only', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.foo1', {class: undefined}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })

        describe('from selector and an undefined className', () => {
            test('to selector only', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.foo2'))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to class only', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('div', {class: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to className only', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('div', {className: 'foo2'}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and class', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.bar2', {class: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and className', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.bar2', {className: 'foo2'}))

                expect(root.firstChild.className.split(' ').sort()).toEqual(['bar2', 'foo2'])
            })

            test('to selector and a null class', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.foo2', {class: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and a null className', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.foo2', {className: null}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined class', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.foo2', {class: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })

            test('to selector and an undefined className', () => {
                render(root, m('.foo1', {className: undefined}))
                render(root, m('.foo2', {className: undefined}))

                expect(root.firstChild.className.includes('foo2')).toBe(true)
            })
        })
    })
})
