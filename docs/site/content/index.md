<!--meta-description
Mithril with Signals, Store, SSR. Basic TSX example.
-->

# About

[Mithril](https://mithril.js.org/) is a small JavaScript framework for building single-page applications. It uses components, vnodes, and a virtual DOM.

This fork extends it with **Signals** for fine-grained reactivity—components re-render only when their dependencies change—plus **Store** for persistent state (localStorage, sessionStorage), **SSR** with hydration, and **htm** for JSX-like syntax without a build step. We drop **Stream** and the built-in request API (use `fetch()` instead), and ship TypeScript and Bun by default.

```bash
bun add @bitstillery/mithril
```

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({count: 0}, 'app.state')

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

See [Signals](signals.md), [State](state.md), [Store](store.md), [SSR](ssr.md).
