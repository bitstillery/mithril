# Mithril Bitstillery

Mithril Bitstillery extends Mithril with integrated state management, SSR hydration, watchers, and a signal/proxy store. Drop-in compatible with Mithril v2.x.

```bash
bun add @bitstillery/mithril
```

## Strengths

Mithril Bitstillery focuses on **state management**, **SSR**, **watchers**, and **developer experience** around its signal/proxy store:

| Feature          | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| Proxy State      | Reactive objects with nested objects, arrays, computeds             |
| State Management | `state()` + `Store` for persistence (localStorage, session)         |
| SSR              | Full server-side rendering with state serialization + hydration     |
| Watchers         | `watch()` for observing signal changes; `effect()` for side effects |
| DX               | Automatic dependency tracking, no manual redraw for signals         |

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

`state()` creates reactive objects. Components track which properties they read and only re-render when those change.

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

## Watchers

`watch()` observes signal changes:

```typescript
import {state, watch} from '@bitstillery/mithril'

const $s = state({count: 0}, 'app')
const unwatch = watch($s.$count, (newVal, oldVal) => console.log(`${oldVal} → ${newVal}`))
$s.count++ // triggers callback
unwatch() // stop observing
```

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
