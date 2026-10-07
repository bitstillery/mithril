# Mithril, Bitstillery edition

[Mithril.js](https://mithril.js.org) with signals, reactive state, server rendering and a persistent
store. Strict TypeScript, developed with Bun.

- **Signals** — components redraw when a signal they read changes; no `m.redraw()`. `state()` makes
  a plain object reactive, its functions become computeds. `signal()`, `computed()`, `effect()` and
  `watch()` for direct use.
- **TypeScript** — ships its source, no `@types` package or build step. State, JSX attributes, routes
  and `m.route.Link` are typed; the library has no `any`.
- **SSR** — async `oninit` is awaited on the server; HTML and state go to the client, which hydrates
  without refetching. Bun server helpers with sessions included.
- **Store** — per-value persistence: `localStorage`, `sessionStorage`, server session, or a cookie the
  server can render from.
- **Measured** — batched redraws, and a benchmark suite covering render, signals, state, store, router
  and SSR.

Mithril v2 apps run unchanged, except `m.request` and streams: use `fetch()`.

```tsx
import m, {state} from '@bitstillery/mithril'

const $s = state({count: 0})

m.mount(document.body, {
    view: () => <button onclick={() => $s.count++}>Clicked {$s.count} times</button>,
})
```

## Getting started

```bash
bun add @bitstillery/mithril
```

Guides: [setup](docs/site/content/index.md), [signals](docs/site/content/signals.md),
[state](docs/site/content/state.md), [SSR](docs/site/content/ssr.md),
[store](docs/site/content/store.md); the rest of [`docs/site/content/`](docs/site/content/) covers
core Mithril. Example apps: [`examples/state/`](examples/state/), [`examples/ssr/`](examples/ssr/).

## Development

```bash
bun install
bun test       # tests
bun run lint   # format, lint, type-check
bun run bench  # benchmarks; bench:render etc. for one topic
```

## License

MIT — see [LICENSE](LICENSE). Mithril was created by Leo Horie; thanks to all
[Mithril.js contributors](https://github.com/MithrilJS/mithril.js/graphs/contributors).
