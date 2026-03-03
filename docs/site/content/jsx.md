<!--meta-description
Hyperscript, TSX, and htm — three ways to write Mithril views.
-->

# View syntax

Mithril views can be written in three ways:

---

### Hyperscript

Plain JavaScript — no build step. Use `m(tag, attrs, children)`:

```js
m('div', {class: 'card'}, [m('h1', 'Title'), m('button', {onclick: () => alert('hi')}, 'Click')])
```

---

### TSX

JSX with Bun — set `jsxFactory: "m"` in `tsconfig.json`. See [About](/).

```tsx
<div class='card'>
    <h1>Title</h1>
    <button onclick={() => alert('hi')}>Click</button>
</div>
```

---

### htm

[JSX-like syntax](https://github.com/developit/htm) without a build step — uses tagged template literals:

```tsx
import m from '@bitstillery/mithril'
import {html} from '@bitstillery/mithril/htm'

const view = () => html`
    <div class="card">
        <h1>Title</h1>
        <button onclick=${() => alert('hi')}>Click</button>
    </div>
`
```

Use `class` and `onclick` (HTML-style), not `className` or `onClick`. Components: `<${Component} />` placeholder syntax.
