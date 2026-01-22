import {describe, test, expect} from 'bun:test'

import {signal, computed, effect} from '../../signal'

describe('Signal', () => {
	test('creates a signal with initial value', () => {
		const s = signal(42)
		expect(s.value).toBe(42)
	})

	test('updates signal value', () => {
		const s = signal(0)
		s.value = 10
		expect(s.value).toBe(10)
	})

	test('notifies subscribers on value change', () => {
		const s = signal(0)
		let notified = false
		s.subscribe(() => {
			notified = true
		})
		s.value = 1
		expect(notified).toBe(true)
	})

	test('peek returns value without subscribing', () => {
		const s = signal(42)
		const value = s.peek()
		expect(value).toBe(42)
		// Should not track dependency
		expect(s.peek()).toBe(42)
	})

	test('watch provides old and new values', () => {
		const s = signal(0)
		let newVal: number | undefined
		let oldVal: number | undefined
		s.watch((newValue, oldValue) => {
			newVal = newValue
			oldVal = oldValue
		})
		s.value = 10
		expect(newVal).toBe(10)
		expect(oldVal).toBe(0)
	})
})

describe('ComputedSignal', () => {
	test('creates computed signal', () => {
		const a = signal(1)
		const b = signal(2)
		const sum = computed(() => a.value + b.value)
		expect(sum.value).toBe(3)
	})

	test('recomputes when dependencies change', () => {
		const a = signal(1)
		const b = signal(2)
		const sum = computed(() => a.value + b.value)
		expect(sum.value).toBe(3)
		a.value = 10
		expect(sum.value).toBe(12)
	})

	test('computed signal is read-only', () => {
		const a = signal(1)
		const doubled = computed(() => a.value * 2)
		expect(() => {
			;(doubled as any).value = 10
		}).toThrow()
	})

	test('caches computed value', () => {
		let computeCount = 0
		const a = signal(1)
		const doubled = computed(() => {
			computeCount++
			return a.value * 2
		})
		expect(doubled.value).toBe(2)
		expect(computeCount).toBe(1)
		expect(doubled.value).toBe(2) // Should use cache
		expect(computeCount).toBe(1)
		a.value = 2
		expect(doubled.value).toBe(4) // Should recompute
		expect(computeCount).toBe(2)
	})
})

describe('effect', () => {
	test('runs effect immediately', () => {
		let ran = false
		effect(() => {
			ran = true
		})
		expect(ran).toBe(true)
	})

	test('runs effect when dependencies change', () => {
		const s = signal(0)
		let count = 0
		effect(() => {
			s.value // Track dependency
			count++
		})
		expect(count).toBe(1)
		s.value = 1
		expect(count).toBe(2)
	})

	test('cleanup function runs on effect re-run', () => {
		const s = signal(0)
		let cleanupRan = false
		effect(() => {
			s.value
			return () => {
				cleanupRan = true
			}
		})
		expect(cleanupRan).toBe(false)
		s.value = 1
		expect(cleanupRan).toBe(true)
	})

	test('cleanup function runs on dispose', () => {
		const s = signal(0)
		let cleanupRan = false
		const dispose = effect(() => {
			s.value
			return () => {
				cleanupRan = true
			}
		})
		dispose()
		expect(cleanupRan).toBe(true)
	})
})
