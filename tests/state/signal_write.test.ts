import {describe, test, expect} from 'bun:test'

import m from '../../src/index'
import {Signal, effect} from '../../src/state/signal'
import {allowComputed, state, watch} from '../../src/state/state'
import {serializeStore} from '../../src/ssr/serialize'
import domMock from '../helpers/dom_mock'

import type {State, StateInternals} from '../../src/state/state'

type User = {name: string; email: string}
type Todo = {id: number; text: string; completed: boolean}

function makeState() {
    return state({
        user: {name: 'a', email: 'x'} as User,
        todos: [] as Todo[],
        when: new Date(0),
        index: new Map<string, number>(),
        count: 0,
    })
}

type Shape = ReturnType<typeof makeState>

/** Replaces `user` with a plain object, one way or the other. */
const writes: Record<string, (s: Shape, user: User) => void> = {
    signal: (s, user) => {
        s.$user.value = user
    },
    // The plain property write, which doesn't type-check; see the type tests below.
    trap: (s, user) => {
        Reflect.set(s, 'user', user)
    },
}

/** The root a nested state links to, which the proxy answers but `StateInternals` doesn't declare. */
function rootOf(value: object): unknown {
    return Reflect.get(value, '__rootState')
}

describe('writing through a state property signal', () => {
    for (const [route, write] of Object.entries(writes)) {
        describe(`via ${route}`, () => {
            test('a plain object becomes a nested state with its own signals', () => {
                const s = makeState()
                write(s, {name: 'b', email: 'y'})
                expect(s.user.$name).toBeInstanceOf(Signal)
                expect(s.user.name).toBe('b')
                expect((s.user as StateInternals).__isState).toBe(true)
            })

            test('watch() on a nested signal fires on a nested write', () => {
                const s = makeState()
                write(s, {name: 'b', email: 'y'})
                const seen: [string, string][] = []
                watch(s.user.$name, (next, previous) => seen.push([next, previous]))
                s.user.name = 'c'
                expect(seen).toEqual([['c', 'b']])
            })

            test('an effect reading the property re-runs on the write and on nested writes', () => {
                const s = makeState()
                const names: string[] = []
                const dispose = effect(() => {
                    names.push(s.user.name)
                })
                write(s, {name: 'b', email: 'y'})
                s.user.name = 'c'
                dispose()
                expect(names).toEqual(['a', 'b', 'c'])
            })

            test('a component reading the property redraws on the write and on nested writes', async () => {
                const $window = domMock()
                const root = $window.document.createElement('div') as unknown as Element
                const s = makeState()
                let renders = 0
                m.mount(root, {
                    view() {
                        renders++
                        return m('span', s.user.name)
                    },
                })
                write(s, {name: 'b', email: 'y'})
                await m.nextTick()
                expect(root.firstChild!.firstChild!.nodeValue).toBe('b')
                s.user.name = 'c'
                await m.nextTick()
                expect(root.firstChild!.firstChild!.nodeValue).toBe('c')
                expect(renders).toBe(3)
                m.mount(root, null)
            })

            test('the new nested state links to the root and serializes with it', () => {
                const s = makeState()
                write(s, {name: 'b', email: 'y'})
                expect(rootOf(s.user)).toBe(s)
                s.user.name = 'c'
                expect(serializeStore(s).user).toEqual({name: 'c', email: 'y'})
            })

            test('an existing state is kept as it is and adopted by the root', () => {
                const s = makeState()
                const other = state({name: 'o', email: 'p'})
                write(s, other)
                expect(s.user).toBe(other)
                expect(rootOf(other)).toBe(s)
            })

            test('a property that held a primitive becomes a nested state', () => {
                const s = state({user: null as User | null})
                const seen: unknown[] = []
                watch(s.$user, (next) => seen.push(next))
                if (route === 'signal') s.$user.value = {name: 'b', email: 'y'}
                else Reflect.set(s, 'user', {name: 'b', email: 'y'})
                expect(Reflect.get(s.user!, '$name')).toBeInstanceOf(Signal)
                expect(seen).toEqual([s.user])
            })
        })
    }

    test('computeds in an object written through the signal wait for a deferred root', () => {
        type Person = {name: string; greeting: (this: {name: string}) => string}
        const s = state({person: {name: 'a', greeting: () => ''} as Person}, undefined, {deferComputed: true})
        s.$person.value = {
            name: 'b',
            greeting() {
                return `hi ${this.name}`
            },
        }
        expect(s.person.greeting).toBeUndefined()
        allowComputed(s)
        expect(s.person.greeting).toBe('hi b')
        expect(s.person.$greeting).toBeInstanceOf(Signal)
    })

    test('an array written through the signal is a state array with push and element signals', () => {
        const s = makeState()
        s.$todos.value = [{id: 1, text: 't', completed: false}]
        let notified = 0
        watch(s.$todos, () => notified++)
        s.todos.push({id: 2, text: 'u', completed: true})
        expect(notified).toBe(1)
        expect(s.todos.length).toBe(2)
        expect(s.todos[1]!.$text).toBeInstanceOf(Signal)
        const texts: string[] = []
        watch(s.todos[0]!.$text, (text) => texts.push(text))
        s.todos[0]!.text = 'v'
        expect(texts).toEqual(['v'])
        expect(serializeStore(s).todos).toEqual([
            {id: 1, text: 'v', completed: false},
            {id: 2, text: 'u', completed: true},
        ])
    })

    test('a primitive array written through the signal has element signals', () => {
        const s = state({tags: [] as string[]})
        s.$tags.value = ['a', 'b']
        expect(Reflect.get(s.tags, '$1')).toBeInstanceOf(Signal)
        expect([...s.tags]).toEqual(['a', 'b'])
    })

    test('a Date or Map written through the signal is held as it is', () => {
        const s = makeState()
        const when = new Date(5)
        const index = new Map([['k', 1]])
        s.$when.value = when
        s.$index.value = index
        expect(s.when).toBe(when)
        expect(s.index).toBe(index)
        expect(s.index.get('k')).toBe(1)
    })

    test('a primitive write through the signal is unchanged', () => {
        const s = makeState()
        const seen: number[] = []
        watch(s.$count, (n) => seen.push(n))
        s.$count.value = 3
        expect(s.count).toBe(3)
        expect(seen).toEqual([3])
    })

    test('a computed signal stays read-only', () => {
        const s = state({
            count: 1,
            double: function (this: {count: number}) {
                return this.count * 2
            },
        })
        expect(() => {
            s.$double.value = 3
        }).toThrow('Computed signals are read-only')
    })
})

describe('writing through an array element signal', () => {
    type Item = number | {n: number}

    for (const route of ['signal', 'trap'] as const) {
        test(`an object replaces the element as a nested state (via ${route})`, () => {
            const s = state({items: [1, 2] as Item[]})
            let notified = 0
            watch(s.$items, () => notified++)
            if (route === 'signal') (Reflect.get(s.items, '$0') as Signal<Item>).value = {n: 5}
            else Reflect.set(s.items, 0, {n: 5})
            const element = s.items[0] as object
            expect(Reflect.get(element, '$n')).toBeInstanceOf(Signal)
            expect(Reflect.get(s.items, '$0')).toBe(element)
            expect(notified).toBe(1)
            expect(serializeStore(s).items).toEqual([{n: 5}, 2])
        })

        test(`a primitive keeps the element signal and notifies the array (via ${route})`, () => {
            const s = state({items: [1, 2] as Item[]})
            const element = Reflect.get(s.items, '$0') as Signal<Item>
            let notified = 0
            const seen: Item[] = []
            watch(s.$items, () => notified++)
            watch(element, (n) => seen.push(n))
            if (route === 'signal') element.value = 7
            else s.items[0] = 7
            expect(Reflect.get(s.items, '$0')).toBe(element)
            expect(s.items[0]).toBe(7)
            expect(seen).toEqual([7])
            expect(notified).toBe(1)
        })
    }
})

describe('state signal types', () => {
    test('a plain object or array writes through the signal without a cast', () => {
        const s = makeState()
        s.$user.value = {name: 'x', email: 'y'}
        s.$todos.value = [{id: 1, text: 't', completed: false}]
        const name: Signal<string> = s.$user.value.$name
        const plain: Signal<State<User>> = s.$user
        const count: Signal<number> = s.$count
        watch(s.$user, (next, previous) => {
            const signals: Signal<string>[] = [next.$name, previous.$email]
            void signals
        })
        expect([name, plain.peek().$name, count]).toHaveLength(3)

        // @ts-expect-error a plain write still has to match the declared shape: email is missing
        s.$user.value = {name: 'x'}
        // @ts-expect-error the property reads as a State, whose `$` signals a plain object lacks
        s.user = {name: 'x', email: 'y'}
    })
})
