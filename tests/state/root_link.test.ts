import {describe, expect, test} from 'bun:test'

import {state} from '../../src/index'

interface Item {
    name: string
    tags: {label: string}[]
}

function rootOf(value: object): object | undefined {
    return (value as {__rootState?: object}).__rootState
}

describe('root link of nested states', () => {
    for (const deferComputed of [false, true]) {
        describe(deferComputed ? 'with deferComputed' : 'without deferComputed', () => {
            test('objects inside arrays share the root of the state', () => {
                const s = state<{items: Item[]}>({items: [{name: 'a', tags: [{label: 'x'}]}]}, undefined, {deferComputed})

                expect(rootOf(s.items[0]!)).toBe(s)
                expect(rootOf(s.items[0]!.tags[0]!)).toBe(s)
            })

            test('objects added to an array later share the root too', () => {
                const s = state<{items: Item[]}>({items: []}, undefined, {deferComputed})

                s.items.push({name: 'b', tags: [{label: 'y'}]})
                s.items.splice(1, 0, {name: 'c', tags: []})
                s.$items.value = [{name: 'd', tags: [{label: 'z'}]}]

                expect(rootOf(s.items[0]!)).toBe(s)
                expect(rootOf(s.items[0]!.tags[0]!)).toBe(s)
            })
        })
    }
})
