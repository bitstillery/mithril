<!--meta-description
Mithril with Signals, Store, SSR. Setup with Bun development tooling.
-->

# About

This package extends [Mithril](https://mithril.js.org/) with **Signals** for fine-grained reactivity—components re-render only when their dependencies change—plus **Store** for persistent state (localStorage, sessionStorage), **SSR** with hydration, and **htm** for JSX-like syntax without a build step. Stream and the built-in request API are removed (use `fetch()` instead). TypeScript and Bun by default.

## Setup with Bun

```bash
bun add @bitstillery/mithril
```

Types are built-in; no `@types` package needed.

### Full example

1. `bun init my-app` — choose **Blank**. Then `cd my-app` and `bun add @bitstillery/mithril`

2. Add to `package.json` scripts: `"dev": "bun index.html"`

3. Add to `tsconfig.json` under `compilerOptions`: `"jsx": "react"`, `"jsxFactory": "m"`, `"jsxFragmentFactory": "m.Fragment"`

4. Create `src/index.tsx`:

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({count: 0})

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

m.mount(document.getElementById('app'), App)
```

5. Create `index.html` at project root:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="src/index.tsx"></script>
    </body>
</html>
```

6. `bun run dev` → http://localhost:3000
