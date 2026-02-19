<!--meta-description
Fine-grained reactivity with signals (inspired by Preact Signals)
-->

# Signals

Traditional Mithril re-renders the whole tree when state changes. Signals add *fine-grained reactivity*: only components that actually read a signal re-render when it changes. The implementation was inspired by [Preact Signals](https://preactjs.com/guide/v10/signals).

**How it works.** When a component's `view` runs, any signal or state property it accesses is tracked. When that value changes later, only that component (and its subtree) re-renders—not the entire app. Dependencies are automatic; no manual `m.redraw()` needed.

For component state, **`state()`** is the preferred API: define a reactive object, access properties directly, and function properties become computed values. For single values or use outside components, use the low-level primitives: **`signal()`** (reactive value), **`computed()`** (derived value), and **`effect()`** (side effects when dependencies change).

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({count: 0, doubled: () => $s.count * 2}, 'app.state')

class App extends MithrilComponent {
    view() {
        return (
            <div>
                <p>Count: {$s.count}, Doubled: {$s.doubled}</p>
                <button onclick={() => $s.count++}>Increment</button>
            </div>
        )
    }
}

m.mount(document.getElementById('app'), App)
```

- **`state(initial, name)`** — reactive object; access properties directly in components, no `.value`
- **`signal(initial)`** — low-level primitive; use `.value` for read/write outside components
- **`computed(fn)`** — derives a value from other signals; re-evaluates when dependencies change
- **`effect(fn)`** — runs side effects when dependencies change

See [State](state.md) for structured component state; use `signal()` when you need a single reactive primitive.
