<!--meta-description
Setup Mithril with Bun
-->

# Setup

```bash
bun add @bitstillery/mithril
```

Types are built-in; no `@types` package needed.

### Basic application

1. Scaffold a project: `bun init my-app`, `cd my-app`, `bun add @bitstillery/mithril`

2. Add to `package.json`: `"dev": "bun run --watch src/index.tsx"`

3. Create `src/index.tsx`:

```tsx
import m, {state, MithrilComponent} from '@bitstillery/mithril'

const $s = state({count: 0})

class App extends MithrilComponent {
    view() {
        return (
            <div>
                <p>Count: {$s.count}</p>
                <button onclick={() => $s.count++}>Add</button>
            </div>
        )
    }
}

m.mount(document.getElementById('app'), App)
```

4. Create `index.html` with `<div id="app"></div>` and `<script type="module" src="src/index.tsx"></script>`

5. Run `bun run dev`

Use `fetch()` for HTTP (e.g. in `oninit`). Use `m.route` for multiple views. See [route](route.md) and [Store](store.md). For TSX, set `"jsx": "react-jsx"` in `tsconfig.json`, or use [htm](jsx.md#htm).
