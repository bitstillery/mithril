<!--meta-description
Persistent state with Store: localStorage, sessionStorage, and SSR
-->

# Store

Some state should survive page reloads—user preferences, form drafts, cart contents. `state()` is reactive but resets when the user refreshes. **Store** wraps `state()` with persistence: you define which parts go to localStorage (saved), sessionStorage (tab), or stay volatile (temporary). Call `store.save()` when you want to persist; on load, Store hydrates from storage. During SSR, Store skips storage and hydrates from serialized state.

**Typical use.** Create a Store, call `load(saved, temporary, tab)` with template objects. The first argument defines what persists to localStorage; the second is volatile; the third goes to sessionStorage (survives reload, clears when the tab closes). Access `store.state` like `state()`—properties are reactive. Call `ready()` after load if you have computed properties that depend on other app state (e.g. `$s`, routes). For SSR, pass a fourth `session` template and hydrate from the server.

```tsx
import m, {Store, MithrilComponent} from '@bitstillery/mithril'

const store = new Store<{count: number}>()
store.load({count: 0}, {}, {}) // saved, temporary, tab — count persists to localStorage

class App extends MithrilComponent {
    view() {
        return (
            <div>
                <p>Count: {store.state.count} (persists across reloads)</p>
                <button
                    onclick={() => {
                        store.state.count++
                        store.save()
                    }}
                >
                    Increment
                </button>
            </div>
        )
    }
}

m.mount(document.getElementById('app'), App)
```

- **`load(saved, temporary, tab, session?)`** — Merge templates; restore from localStorage/sessionStorage (or SSR payload). `saved` → localStorage, `tab` → sessionStorage, `temporary` → volatile.
- **`save()`** — Persist current state to storage. Call after user actions (e.g. login, filter change, cart update).
- **`blueprint(state, template)`** — Extract a subset of state for persistence; used internally by `save()`.
- **`ready()`** — Enable computed properties (call after load when computeds depend on app context).
- During SSR, Store skips `localStorage`/`sessionStorage` and hydrates from serialized state injected by the server.
