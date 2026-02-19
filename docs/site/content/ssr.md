<!--meta-description
Server-side rendering with hydration for fast first paint and SEO
-->

# Server-side Rendering (SSR)

- [Description](#description)
- [How it works](#how-it-works)
- [Why use SSR](#why-use-ssr)
- [This documentation site](#this-documentation-site)
- [Usage](#usage)

---

### Description

Server-side rendering (SSR) means your Mithril app is rendered to HTML on the server and sent to the browser. The browser shows that HTML immediately, then the client-side code "hydrates" it—attaching event handlers and making it interactive—without re-rendering the DOM.

---

### How it works

1. **Server:** A request hits your server. Mithril runs your route component and calls `m.renderToString` to produce HTML. Any state you register with `state(initial, name)` is serialized alongside it.
2. **Response:** The server injects the HTML into your template (e.g. into `#app`) and embeds the serialized state in a `<script id="__SSR_STATE__">` tag.
3. **Client:** The browser receives the page and shows the HTML right away. Your client script runs, calls `deserializeAllStates()` to restore state, then runs `m.mount(root, App)`. Mithril diffes the existing DOM with the vnode tree and attaches event handlers. No full re-render—hydration is fast.

---

### Why use SSR

- **Fast first paint** — Users see content as soon as the HTML arrives, without waiting for JavaScript.
- **SEO** — Search engines receive fully rendered HTML, so your content is indexable.
- **Progressive enhancement** — If JS is slow or blocked, the page still shows useful content.

---

### This documentation site

This Mithril.js documentation site uses SSR. When you open a page like `/hyperscript` or `/mount`, the server renders the full layout—header, sidebar, and markdown content—and sends it in the first response. The client hydrates the DOM, and navigation stays fast because subsequent route changes can be client-side. The `createSSRResponse` helper in the Mithril server package wires up routing, template injection, and state serialization with minimal server code.

---

### Usage

**Server:**

```typescript
const {html, state} = await m.renderToString(App)
// Inject html into #app and state into:
// <script id="__SSR_STATE__">${JSON.stringify(state)}</script>
```

**Client:**

```typescript
import {deserializeAllStates} from '@bitstillery/mithril'

const ssrState = document.getElementById('__SSR_STATE__')
if (ssrState?.textContent) {
    deserializeAllStates(JSON.parse(ssrState.textContent))
}
m.mount(root, App)
```

State registered with `state(initial, name)` is serialized on the server and restored before mount.
