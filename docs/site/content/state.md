<!--meta-description
Proxy-based reactive state with state()
-->

# State

`state()` creates [deepsignal](https://github.com/luisherranz/deepsignal)-style reactive state (inspired by [Luis Herranz](https://github.com/luisherranz)'s [DeepSignal](https://github.com/luisherranz/deepsignal)). Nested objects and arrays are reactive; function properties become computed signals.

**Why State on top of Signals?** Raw `signal()` and `computed()` work well for single values. Component state, however, is often structured—forms with nested fields, loading flags, dialogs, stepper config.

With `state()`, you define one reactive object. Mutate `$s.form.terms = true` or `$s.feedback.rating = 5` and the UI updates. No need to create a signal per field or call `.value` in templates.

Arrays are handled too. `$s.items.push(x)`, `$s.breadcrumbs.splice(0, n, ...newItems)`, and index assignment all trigger updates; nested arrays and objects stay reactive.

Use `signal()` for a single reactive primitive; use `state()` for the object-shaped state that components typically have. [SolidJS](https://www.solidjs.com/)'s `createStore` uses a similar pattern. See the [state implementation](https://github.com/bitstillery/mithril/blob/main/state.ts) for details.

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({
    count: 0,
    total: () => $s.count * 2,
})

class Counter extends MithrilComponent {
    view() {
        return (
            <div>
                <p>
                    Count: {$s.count}, Total: {$s.total}
                </p>
                <button onclick={() => $s.count++}>Increment</button>
            </div>
        )
    }
}

m.mount(document.getElementById('app'), Counter)
```

- Access properties normally for values
- Use `$` prefix (e.g. `$s.$count`) for raw signal access. When passing state to child components, use `model={prop.$field}` so the child receives the signal reference; updates flow back to the parent.
- Naming (second argument) is required for SSR serialization
- Components that read state auto-redraw when dependencies change

## Computed properties

Any **function property** in state becomes a computed signal. Reading the property runs the function and returns its result; the value is cached and re-evaluated only when dependencies change.

```tsx
const $s = state(
    {
        count: 0,
        doubled: () => $s.count * 2,
        items: [],
        total: () => $s.items.length,
    },
    'app',
)
```

- `$s.doubled` returns the current value (e.g. `0`, then `4` when `count` is 2)
- `$s.total` re-evaluates when `items` changes
- Computeds work in nested objects and **array elements** (e.g. `options: [{ _disabled: () => !valid }]`)

**Raw signal access.** Use the `$` prefix to get the underlying signal: `$s.$doubled` returns the `ComputedSignal`, useful for `watch()` or passing to components that expect a signal.

**Deferred evaluation.** When state depends on app context (routes, store, other globals) that is not ready at creation time, use `{ deferComputed: true }` and call `allowComputed()` when ready:

```tsx
const $s = state({step: 0, canProceed: () => $s.step > 0}, 'app', {deferComputed: true})
// ... after routes/context are ready:
;($s as any).allowComputed()
```

Until `allowComputed()` is called, computed properties return `undefined`. See [ADR-0013](../architecture/adr/0013-deferred-computed-evaluation.md) for details.
