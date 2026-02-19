<!--meta-description
Server-side rendering with hydration
-->

# SSR

Server-side rendering with state preservation.

**Server:**

```tsx
const {html, state} = await m.renderToString(App)
// Inject: <script id="__SSR_STATE__">${JSON.stringify(state)}</script>
```

**Client:**

```tsx
import {deserializeAllStates} from '@bitstillery/mithril'

const ssrState = document.getElementById('__SSR_STATE__')
if (ssrState?.textContent) {
    deserializeAllStates(JSON.parse(ssrState.textContent))
}
m.mount(root, App)
```

State registered with `state(initial, name)` is serialized on the server and restored before mount.
