# @bitstillery/mithril

> Mithril.js with **fine-grained reactivity**, **SSR hydration**, and **zero-dependency signals**.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## The Problem

Mithril.js uses global `m.redraw()`—one state change updates **all** components. This fork adds fine-grained reactivity: only components using changed state re-render.

## What Makes This Different

### Signals

Fine-grained reactivity primitives with automatic dependency tracking. Zero-dependency implementation—no Preact Signals or other packages.

```typescript
import {signal, computed, effect} from '@bitstillery/mithril'

const count = signal(0)
const doubled = computed(() => count() * 2)

effect(() => {
    console.log(`Count: ${count()}, Doubled: ${doubled()}`)
})

count(5) // Logs: Count: 5, Doubled: 10
```

### Signal State

Proxy-based reactive state that makes signals developer-friendly. Automatic dependency tracking with no manual redraw calls.

```tsx
import {state} from '@bitstillery/mithril'

const $s = state(
    {
        count: 0,
        user: {name: 'John'},
        todos: [],
        totalTodos: () => $s.todos.length, // Computed
    },
    'my.state',
) // Name required for SSR serialization

// Component only re-renders when $s.count changes
class Counter extends MithrilComponent {
    view() {
        return (
            <div>
                <p>Count: {$s.count}</p>
                <button onclick={() => $s.count++}>Increment</button>
            </div>
        )
    }
}
```

### Persistent Store

State persistence with automatic serialization. The `Store` class wraps `state()` with localStorage/sessionStorage support, seamlessly integrating with SSR hydration.

```typescript
import {Store} from '@bitstillery/mithril'

const store = new Store<{user: {name: string}; preferences: Record<string, any>}>()

// Define what persists vs what's volatile
store.blueprint(
    {user: {name: ''}, preferences: {}},
    {
        user: {name: ''}, // Persistent
        preferences: {}, // Persistent
    },
)

// Load from storage, or initialize with defaults
store.load({user: {name: 'John'}, preferences: {theme: 'dark'}})

// State is reactive and automatically saves on changes
store.state.user.name = 'Jane' // Auto-saves to localStorage
```

### SSR Hydration

Server-side rendering with state preservation. `renderToString` automatically serializes state; restore it on the client before mounting.

```typescript
// Server
const {html, state} = await m.renderToString(App)
// Inject: <script id="__SSR_STATE__">${JSON.stringify(state)}</script>

// Client
import {deserializeAllStates} from '@bitstillery/mithril'

const ssrState = document.getElementById('__SSR_STATE__')
if (ssrState?.textContent) {
    deserializeAllStates(JSON.parse(ssrState.textContent))
}
m.mount(root, App)
```

## The Complete Picture

These features build on each other: signals provide the foundation for fine-grained reactivity, proxy-based state makes them developer-friendly, `Store` adds persistence for localStorage/sessionStorage, and SSR hydration enables search-engine friendly websites. The result? State that "just works"—from initial render through hydration, user interactions, and page refreshes—all while maintaining Mithril's familiar API.

## Quick Start

```bash
bun add @bitstillery/mithril
```

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({count: 0}, 'app.state') // Name required for SSR

class App extends MithrilComponent {
    view() {
        return (
            <div>
                <p>Count: {$s.count}</p>
                <button onclick={() => $s.count++}>Increment</button>
            </div>
        )
    }
}

m.mount(document.body, App)
```

## Examples

- **SSR**: [`examples/ssr/`](examples/ssr/) - Server-side rendering with hydration
- **State**: [`examples/state/`](examples/state/) - Signals, state management, and Store persistence patterns

## Differences from Mithril.js

| Feature          | Original            | This Fork                       |
| ---------------- | ------------------- | ------------------------------- |
| Reactivity       | Global `m.redraw()` | Fine-grained component updates  |
| State Management | Manual redraw calls | Signals with automatic tracking |
| SSR Hydration    | State loss          | Proper state preservation       |
| TypeScript       | Community types     | Native TypeScript               |

**100% API compatible** with Mithril.js v2.x. Signals are opt-in.

## Development

```bash
bun install
bun test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Mithril.js was originally written by Leo Horie, but it is where it is today thanks to the hard work and great ideas of many people.

Special thanks to:

- Pat Cavit, who exposed most of the public API for Mithril.js 1.0, brought in test coverage and automated the publishing process
- Claudia Meadows, who brought in linting, modernized the test suite and has been a strong voice in design discussions
- Zoli Kahan, who replaced the original Promise implementation with one that actually worked properly
- Alec Embke, who single-handedly wrote the JSON-P implementation
- Barney Carroll, who suggested many great ideas and relentlessly pushed Mithril.js to the limit to uncover design issues prior to Mithril.js 1.0
- Dominic Gannaway, who offered insanely meticulous technical insight into rendering performance
- Boris Letocha, whose search space reduction algorithm is the basis for Mithril.js' virtual DOM engine
- Joel Richard, whose monomorphic virtual DOM structure is the basis for Mithril.js' vnode implementation
- Simon Friis Vindum, whose open source work was an inspiration to many design decisions for Mithril.js 1.0
- Boris Kaul, for his awesome work on the benchmarking tools used to develop Mithril.js
- Leon Sorokin, for writing a DOM instrumentation tool that helped improve performance in Mithril.js 1.0
- Jordan Walke, whose work on React was prior art to the implementation of keys in Mithril.js
- Pierre-Yves Gérardy, who consistently makes high quality contributions
- Gyandeep Singh, who contributed significant IE performance improvements

Other people who also deserve recognition:

- Arthur Clemens - creator of [Polythene](https://github.com/ArthurClemens/Polythene) and the [HTML-to-Mithril converter](https://arthurclemens.github.io/mithril-template-converter/index.html)
- Stephan Hoyer - creator of [mithril-node-render](https://github.com/StephanHoyer/mithril-node-render), [mithril-query](https://github.com/StephanHoyer/mithril-query) and [mithril-source-hint](https://github.com/StephanHoyer/mithril-source-hint)
- the countless people who have reported and fixed bugs, participated in discussions, and helped promote Mithril.js
