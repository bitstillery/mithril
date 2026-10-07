# Mithril, Bitstillery edition

A small, fast framework for building web apps — [Mithril.js](https://mithril.js.org), with state
that keeps the page up to date by itself.

This edition keeps what Mithril already does well — a tiny footprint, plain JavaScript, a
built-in router — and adds the pieces most apps end up building on their own: signals and reactive
state, server rendering and saved settings, written in TypeScript and developed with Bun.

## Why this Mithril

**Signals: the page follows your data.** Plain Mithril redraws the whole app after every event.
Here, your app's values are signals, and Mithril notes which components read which signal — so when
one changes, only the components that show it redraw. No manual `m.redraw()`, no subscriptions to wire up. Most of the time you won't see the
signals at all: `state()` turns a plain object into one, and its functions become derived values
that recompute when what they read changes. For a single value, or code outside a component,
`signal()`, `computed()`, `effect()` and `watch()` are there to use directly.

**TypeScript all the way through.** The library is written in strict TypeScript and ships its
source, so there is no `@types` package and no build step between you and the code you step into
in a debugger. Your state, your JSX attributes, your routes and `m.route.Link` are all typed, and
the library itself contains no `any`.

**Server rendering built in.** Render a route to HTML on the server for a fast first paint and for
search engines. Components can load their data in an async `oninit`; the server waits for it,
sends the HTML together with the state it produced, and the browser takes over without fetching or
rendering twice. Helpers wire this into a Bun server in a few lines, with sessions included.

**A store for what should outlast the page.** `Store` builds on `state()` and decides per value
where it lives: in `localStorage` across visits, in `sessionStorage` for the tab, in a server
session, in a small cookie so the server can render your preferences without a flash, or nowhere
at all.

**Kept fast, and measured.** Redraws are batched, signals are cheap to create and read, and the
server renderer, state proxy and URL helpers have each been tuned. A benchmark suite covers
rendering, signals, state, the store, the router and SSR, so every change can be checked against
the numbers instead of a hunch.

**Bun from start to finish.** Install, develop, test and benchmark with Bun — `bun index.html` is
enough to start a project, `bun test` runs the suite. No bundler or test-runner configuration to
maintain.

Mithril v2 apps carry over as they are, except for `m.request` and streams, which give way to the
browser's own `fetch()`. From there you can adopt the new pieces one component at a time.

## A first look

```tsx
import m, {state} from '@bitstillery/mithril'

const $s = state({count: 0})

const Counter = {
    view: () => <button onclick={() => $s.count++}>Clicked {$s.count} times</button>,
}

m.mount(document.body, Counter)
```

Clicking the button changes `$s.count`, and the button redraws because it shows that value.
Nothing else is needed.

## Getting started

```bash
bun add @bitstillery/mithril
```

Then read the [setup guide](docs/site/content/index.md), followed by the guides on
[signals](docs/site/content/signals.md), [state](docs/site/content/state.md), [server rendering](docs/site/content/ssr.md) and
[the store](docs/site/content/store.md). The rest of [`docs/site/content/`](docs/site/content/)
covers everything Mithril already offers.

Prefer reading working code? Two small example apps live in this repository:

- [`examples/state/`](examples/state/) — keeping state, derived values and saved settings
- [`examples/ssr/`](examples/ssr/) — rendering on the server and continuing in the browser

## Development

```bash
bun install
bun test       # the test suite
bun run lint   # formatting, lint and type-check
bun run bench  # benchmarks; `bun run bench:render` and friends run one topic
```

## License

MIT — see [LICENSE](LICENSE).

## Credits

Mithril was created by Leo Horie. Thanks to all the
[Mithril.js contributors](https://github.com/MithrilJS/mithril.js/graphs/contributors) who made it
what it is.
