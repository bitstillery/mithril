<!--meta-description
Persistent state with Store and blueprint()
-->

# Store

`Store` wraps `state()` with persistence. Use `blueprint()` to define which properties persist where: localStorage (saved), sessionStorage (tab), or volatile.

```tsx
import {Store} from '@bitstillery/mithril'

const store = new Store<{user: {name: string}; preferences: Record<string, unknown>}>()

store.blueprint(
    {user: {name: ''}, preferences: {}},
    {
        user: {name: ''},
        preferences: {},
    },
)

store.load({user: {name: 'John'}, preferences: {}})

store.state.user.name = 'Jane' // Auto-saves to localStorage
```

During SSR, Store skips storage access and hydrates from serialized state.
