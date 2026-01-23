# @bitstillery/mithril

> Mithril.js with **fine-grained reactivity**, **SSR hydration**, and **zero-dependency signals**.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## The Problem

Mithril.js uses global `m.redraw()`—one state change updates **all** components. This fork adds fine-grained reactivity: only components using changed state re-render.

## What Makes This Different

### Signal Proxy Store

Proxy-based reactive state with automatic dependency tracking. No manual redraw calls.

```tsx
import { store } from '@bitstillery/mithril'

const $s = store({
  count: 0,
  user: { name: 'John' },
  todos: [],
  totalTodos: () => $s.todos.length, // Computed
})

// Component only re-renders when $s.count changes
class Counter extends MithrilTsxComponent {
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

### SSR Hydration

Server-side rendering with state preservation. `renderToString` automatically serializes state; restore it on the client before mounting.

```typescript
// Server
const { html, state } = await m.renderToString(App)
// Inject: <script id="__SSR_STATE__">${JSON.stringify(state)}</script>

// Client
import { deserializeAllStates } from '@bitstillery/mithril'

const ssrState = document.getElementById('__SSR_STATE__')
if (ssrState?.textContent) {
  deserializeAllStates(JSON.parse(ssrState.textContent))
}
m.mount(root, App)
```

### Zero Dependencies

Custom signals implementation—no Preact Signals or other packages. Two APIs:
- **Raw signals**: `signal()`, `computed()`, `effect()`
- **Proxy store**: `store()` - DeepSignal-inspired API

## Quick Start

```bash
bun add @bitstillery/mithril
```

```tsx
import m, { store, MithrilTsxComponent } from '@bitstillery/mithril'

const $s = store({ count: 0 })

class App extends MithrilTsxComponent {
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
- **Store**: [`examples/store/`](examples/store/) - Signals and state management patterns

## Differences from Mithril.js

| Feature | Original | This Fork |
|---------|----------|-----------|
| Reactivity | Global `m.redraw()` | Fine-grained component updates |
| State Management | Manual redraw calls | Signals with automatic tracking |
| SSR Hydration | State loss | Proper state preservation |
| TypeScript | Community types | Native TypeScript |

**100% API compatible** with Mithril.js v2.x. Signals are opt-in.

## Development

```bash
bun install
bun test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## So Long, and Thanks for All the Fish

This is a fork of [Mithril.js](https://github.com/MithrilJS/mithril.js), built on the foundation laid by **Leo Horie** and the Mithril.js community. Special thanks to prominent contributors including **Pat Cavit**, **Claudia Meadows**, **Zoli Kahan**, **Alec Embke**, **Barney Carroll**, **Dominic Gannaway**, **Boris Letocha**, and **Joel Richard**.

This fork was built through a collaboration between AI and human direction: AI handled the implementation details, while human intent—documented in [Architecture Decision Records](docs/architecture/adr/)—provided general direction and architectural choices. Signals came from good prior experience; SSR emerged naturally as we built. This isn't typical vibe coding—intent and details matter, even if the full impact isn't always clear upfront.

This implementation draws inspiration from:
- **[Preact Signals](https://preactjs.com/guide/v10/signals/)** - Signal primitive, computed signals, dependency tracking
- **[DeepSignal](https://github.com/luisherranz/deepsignal)** - Deep reactivity patterns with Proxy
- **[Mithril PR #3036](https://github.com/MithrilJS/mithril.js/pull/3036)** - Component-level redraw pattern
- **SolidJS** - Fine-grained reactivity concepts
