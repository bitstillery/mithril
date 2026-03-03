# @bitstillery/mithril

Mithril.js fork with fine-grained reactivity, SSR hydration, and built-in signals. Drop-in compatible with Mithril v2.x.

```bash
bun add @bitstillery/mithril
```

## Why

Mithril.js uses global `m.redraw()` — one state change re-renders **everything**. This fork adds component-level reactivity via signals so only affected components update.

| Feature          | Original            | This Fork                       |
| ---------------- | ------------------- | ------------------------------- |
| Reactivity       | Global `m.redraw()` | Fine-grained component updates  |
| State Management | Manual redraw calls | Signals with automatic tracking |
| SSR              | No hydration        | State serialization + hydration |
| TypeScript       | Community types     | Native                          |

Signals are opt-in. Existing Mithril code works unchanged.

**Docs**: [mithril.garage44.org](https://mithril.garage44.org)

## Signals

Zero-dependency reactive primitives with automatic dependency tracking:

```typescript
import {signal, computed, effect} from '@bitstillery/mithril'

const count = signal(0)
const doubled = computed(() => count() * 2)

effect(() => console.log(`${count()} × 2 = ${doubled()}`))
count(5) // Logs: 5 × 2 = 10
```

## Proxy State

Wraps signals in a proxy for ergonomic access. Components automatically track which properties they read and only re-render when those change.

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({count: 0, todos: [], totalTodos: () => $s.todos.length}, 'app')

class Counter extends MithrilComponent {
    view() {
        return (
            <div>
                <p>{$s.count}</p>
                <button onclick={() => $s.count++}>+</button>
            </div>
        )
    }
}

m.mount(document.body, Counter)
```

The second argument to `state()` is a name used for SSR serialization.

## SSR Hydration

```typescript
// Server
const {html, state} = await m.renderToString(App)
// Inject: <script id="__SSR_STATE__">${JSON.stringify(state)}</script>

// Client
import {deserializeAllStates} from '@bitstillery/mithril'

const el = document.getElementById('__SSR_STATE__')
if (el?.textContent) deserializeAllStates(JSON.parse(el.textContent))
m.mount(root, App)
```

## Persistent Store

`Store` wraps `state()` with localStorage/sessionStorage. Define a blueprint with defaults and which keys persist:

```typescript
import {Store} from '@bitstillery/mithril'

const store = new Store<{user: {name: string}; preferences: Record<string, any>}>()
store.blueprint(
    {user: {name: ''}, preferences: {}},
    {user: {name: ''}, preferences: {}}, // Keys here persist to storage
)
store.load({user: {name: 'John'}, preferences: {theme: 'dark'}})
store.state.user.name = 'Jane' // Auto-saves
```

## Examples

- [`examples/ssr/`](examples/ssr/) — Server-side rendering with hydration
- [`examples/state/`](examples/state/) — Signals, state, and Store patterns

## Development

```bash
bun install
bun test
```

## License

MIT — see [LICENSE](LICENSE).

## Credits

Originally created by Leo Horie. See the [Mithril.js contributors](https://github.com/MithrilJS/mithril.js/graphs/contributors) for the many people who made Mithril what it is.
