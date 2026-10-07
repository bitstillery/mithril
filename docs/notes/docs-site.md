---
topic: docs-site
triggers: [docs/site, performance_page.tsx, PerformanceMount, VERSION_AA_TOOLTIP, 'perf demo']
updated: 2026-10-07
---

# Docs site and the performance demo

## What the docs cover

The site in `docs/site/` started as the upstream Mithril.js docs. It was rewritten rather than
patched: a patch set over upstream would have to be kept in sync with docs this edition no longer
tracks, and a thin overlay would have left upstream-only pages (Stream, `m.request`) visible and
wrong. Pages for things this edition dropped were deleted, not marked deprecated: Stream, the
request API (examples use `fetch()`), the framework comparison page and its charts, "ES6 on legacy
browsers", and the Jobs/Releases links (the footer's npm badge shows the published version
instead). Testing docs describe `bun test`, not ospec, and all tooling is shown as Bun. Keep
examples minimal and leave out comparisons with other frameworks. The edition credits upstream
(`content/credits.md`) but does not aim to merge back into it.

## The "AA" badge is dormant

`layout.tsx` renders `vX AA` with a tooltip ("AI-Augmented") only when the version ends in `-AA`.
The version comes from `package.json`, which carried `-AA` until the 2026-03-03 commit `000728b3`
switched to plain semver for releases. Since then the header shows a plain `vX.Y.Z` and the badge
code never runs unless a `version` attr ending in `-AA` is passed to the layout.

## Performance demo (`/performance`)

Two tabs render the same DBMon-style table (rows named `item-N`, `item-N-replica`): one calls
`m.redraw()` every animation frame, the other writes changed rows into per-row `state()` objects.
Rows are split into `TableRow`/`TableRowWithSignal` plus `QueryCell` components so the tree is deep
enough for a full redraw to cost something. Before 2026-10-07 the signal tab also redrew every row,
because the targeted redraw could not reach rows inside a `<tbody>` (see
[signals-and-state.md](signals-and-state.md)), so numbers taken before then compare two full redraws. The items/depth/update-rate sliders persist through the
site `Store` (`$s.state.perf`).

Measurement choices, and what lost:

- Frame time is the gap between successive rAF callbacks, not the time spent inside one. Timing
  the callback body (the original plan) reads ~0 ms, because `m.redraw()` only schedules the DOM
  work for the next frame.
- The stats show the median and P95 of the last 60 frames after a 60-frame warm-up, because the
  mean is dominated by GC pauses and early JIT/layout frames.
- No stats library (stats.js was considered): `performance.now()` and a ring buffer were enough.
- The stats overlay writes to the DOM directly every 500 ms, outside Mithril, so drawing the
  numbers does not add to the redraws being measured.
- Only the active tab is mounted; switching tabs unmounts the other demo, whose `onremove`
  cancels its rAF loop. A side-by-side "compare" tab was turned down in favour of per-tab stats.

Each demo is mounted with its own `m.mount` inside `PerformanceMount`, whose `onbeforeupdate`
returns `false` while the tab is unchanged so redraws of the docs layout do not reach inside the
demo.
