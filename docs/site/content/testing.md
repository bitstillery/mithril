<!--meta-description
Testing Mithril apps with bun test
-->

# Testing

Use `bun test`. No JSDOM needed — test vnodes and state directly.

## State

```ts
import {describe, expect, test} from 'bun:test'
import {state} from '@bitstillery/mithril'

describe('Counter', () => {
    test('updates reactively', () => {
        const s = state({count: 0}, 'test.counter')
        expect(s.count).toBe(0)
        s.count = 5
        expect(s.count).toBe(5)
    })

    test('computed values track dependencies', () => {
        const s = state({count: 0, doubled: () => s.count * 2}, 'test.computed')
        expect(s.doubled).toBe(0)
        s.count = 3
        expect(s.doubled).toBe(6)
    })
})
```

## Components

```ts
import {describe, expect, test} from 'bun:test'
import m from '@bitstillery/mithril'

const Greeter = {
    view: (vnode: m.Vnode<{name: string}>) => m('span', `Hello, ${vnode.attrs.name}`),
}

describe('Greeter', () => {
    test('renders vnode with attrs', () => {
        const out = m(Greeter, {name: 'World'})
        expect(out.tag).toBe('span')
        expect(out.children).toBe('Hello, World')
    })
})
```

Test the API and behavior, not implementation details. Keep tests minimal and focused.
