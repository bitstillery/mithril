<!--meta-description
Proxy-based reactive state with state()
-->

# State

`state()` creates deepsignal-style reactive state. Nested objects and arrays are reactive; function properties become computed signals.

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state(
    {
        count: 0,
        total: () => $s.count * 2,
    },
    'app.state',
)

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

- Access properties normally for values
- Use `$` prefix (e.g. `$s.$count`) for raw signal access
- Naming (second argument) is required for SSR serialization
- Components that read state auto-redraw when dependencies change
