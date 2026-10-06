# Mithril Bitstillery

A small, fast framework for building web apps — [Mithril.js](https://mithril.js.org), with state
that keeps the page up to date by itself.

Mithril Bitstillery keeps what Mithril already does well — a tiny footprint, plain JavaScript, a
built-in router — and adds the pieces most apps end up building on their own:

- **The page follows your data.** Change a value and every part of the screen that shows it
  updates. No manual redraws, no subscriptions to wire up.
- **Pages rendered on the server.** Send finished HTML for a fast first paint and for search
  engines; the browser picks up right where the server left off, data included.
- **Values that survive a reload.** Choose which settings to remember, and they are saved in the
  browser and restored on the next visit.

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
[state](docs/site/content/state.md), [server rendering](docs/site/content/ssr.md) and
[saved settings](docs/site/content/store.md). The rest of
[`docs/site/content/`](docs/site/content/) covers everything Mithril already offers.

Prefer reading working code? Two small example apps live in this repository:

- [`examples/state/`](examples/state/) — keeping state, derived values and saved settings
- [`examples/ssr/`](examples/ssr/) — rendering on the server and continuing in the browser

## Contributing

```bash
bun install
bun test
```

## License

MIT — see [LICENSE](LICENSE).

## Credits

Mithril was created by Leo Horie. Thanks to all the
[Mithril.js contributors](https://github.com/MithrilJS/mithril.js/graphs/contributors) who made it
what it is.
