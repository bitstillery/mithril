import {describe, test, expect, afterAll} from 'bun:test'

import components from '../../test-utils/components'
import m from '../../render/hyperscript'
import {spy} from '../test-helpers'

describe('test-utils/components', () => {
	const testSpy = spy(function(component: any) {
		return function() {
			test('works', () => {
				expect(typeof component.kind).toBe('string')

				const methods = {oninit: function() {}, view: function() {}}

				let cmp1: any, cmp2: any

				if (component.kind === 'POJO') {
					cmp1 = component.create()
					cmp2 = component.create(methods)
				} else if (component.kind === 'constructible') {
					cmp1 = new (component.create() as any)()
					cmp2 = new (component.create(methods) as any)()
				} else if (component.kind === 'closure') {
					cmp1 = component.create()()
					cmp2 = component.create(methods)()
				} else {
					throw new Error('unexpected component kind')
				}

				expect(cmp1 != null).toBe(true)
				expect(typeof cmp1.view).toBe('function')

				const vnode = cmp1.view()

				expect(vnode != null).toBe(true)
				expect(vnode).toEqual(m('div'))

				if (component.kind !== 'constructible') {
					expect(cmp2).toEqual(methods)
				} else {
					// deepEquals doesn't search the prototype, do it manually
					expect(cmp2 != null).toBe(true)
					expect(cmp2.view).toBe(methods.view)
					expect(cmp2.oninit).toBe(methods.oninit)
				}
			})
		}
	})
	afterAll(() => {
		expect(testSpy.callCount).toBe(3)
	})
	components.forEach(function(component) {
		describe(component.kind, testSpy(component))
	})
})
