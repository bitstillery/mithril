<!--meta-description
Fine-grained reactivity with signal(), computed(), and effect()
-->

# Signals

Signals provide fine-grained reactivity: only components that read a signal re-render when it changes.

```tsx
import m, {signal, computed, effect} from '@bitstillery/mithril'

const count = signal(0)
const doubled = computed(() => count() * 2)

effect(() => {
    console.log(`Count: ${count()}, Doubled: ${doubled()}`)
})

count(5) // Logs: Count: 5, Doubled: 10
```

- `signal(initial)`: creates a reactive value; call as `signal()` to read, `signal(value)` to write
- `computed(fn)`: derives a value from other signals; re-evaluates when dependencies change
- `effect(fn)`: runs side effects when dependencies change

Components that read signals during render automatically re-render when those signals change. No manual `m.redraw()` needed.
