---
topic: signals-and-state
triggers:
    [
        state/signal.ts,
        state/state.ts,
        ComputedSignal,
        allowComputed,
        deferComputed,
        'computed reads undefined',
        'component-level redraw',
    ]
updated: 2026-10-07
---

# Signals and state()

The signal core is written from scratch, after the ideas of Preact Signals and deepsignal but
none of their code. `@preact/signals-core` was rejected because it would have to be bent around
Mithril's redraw model and its hydration story was known to be weak; a hybrid that kept the old
Proxy state beside signals was rejected as two systems to maintain. The package still has no
runtime dependency besides `htm`.

## How a signal reaches the screen

Signals redraw at component granularity and still diff the vdom of what they redraw. A
SolidJS-style path that writes signal values straight into DOM nodes, skipping the vdom, was
considered and never pursued; per-vnode tracking likewise.

- A component subscribes to the signals its `view()` reads, and nothing else: reads in `oninit`,
  `onbeforeupdate`, event handlers or other hooks don't register. Each update re-registers from
  scratch, so a signal only an earlier render read stops redrawing it.
- Signal-driven redraws are coalesced per microtask (`index.ts`), while `m.redraw()` waits for an
  animation frame. `m.redraw()` with no argument still redraws everything, and is still what a
  change to non-signal data needs.
- A nested component is redrawn by re-rendering its parent element's vnode list with a fresh
  vnode in its slot, built from the key and attrs its parent last gave it. When it can't be
  located that way (detached, or never rendered outside hydration) the redraw falls back to a
  full sync. Hydration doesn't record those locations, so the first signal change after
  hydrating redraws everything once.

## Computeds

A computed is lazy: nothing runs until the first read, and a dependency change only marks it
dirty. It notifies on the clean-to-dirty edge, with no equality check on the recomputed value,
so:

- a component reading a computed redraws whenever any of its dependencies changes, even if the
  result comes out the same;
- `watch()` on a computed can fire with `newValue === oldValue`, as can `watch()` on a signal
  whose array was mutated in place (`trigger()` without a new reference).

A computed's subscription on its dependencies holds it weakly, because `state()` makes one per
function property, read or not, and a long-lived signal must not pin them all. One that a watcher
or effect observes is kept alive separately.

`effect()` is standalone: it is not tied to a component's lifecycle and runs until its disposer
is called.

## state() conventions

- **Every function-valued property is a computed**, called with the state proxy as `this`. The
  old Proxy store's `_` prefix for computeds is gone, and with it any way to keep a callback in
  state as plain data. A `{get, set}` object is read as a computed descriptor for the same reason.
- `state.$key` returns the raw signal rather than its value. It exists because a primitive read
  through the proxy is a copy: a child component that has to write back gets `$key`, replacing
  the earlier `[object, 'key']` tuple that needed an adapter.
- Date, Map, Set, RegExp, typed arrays and the like are held as plain values, not proxied, so
  mutating one in place notifies nobody; replace it.

## Deferred computeds

A computed's function often closes over app globals (a store, a context, routing) that don't
exist yet when the state is built. `state(initial, name, {deferComputed: true})` makes every
computed in the tree read `undefined` without running until `allowComputed()` opens the gate on
the root, which then marks them all dirty. `Store` always builds its state this way and opens the
gate at the end of `load()` (`ready()`), so a store's computeds read `undefined` before `load()`.

Rejected: a global switch (can't be scoped to one store or context, and invites ordering bugs); a
"not yet" sentinel instead of `undefined` (more API and proxy handling, for telling apart a
computed whose real value is `undefined`); throwing until ready (breaks any code touching state
during init).

## Computeds across serialization

Computeds are never serialized. Deserializing replaces each nested object with a fresh state
built from plain JSON, which drops the computeds it held, so the registry keeps each state's
original `initial` (functions included) next to the instance and re-applies its function
properties after `deserializeAllStates()`. `Store.load()` takes the same path with its merged
tier templates (`updateStateRegistry`), rather than a loader of its own; the earlier manual
`setupComputedProperties()` callback survives only for compatibility.

A state's name is optional: an unnamed state is never registered, so it is neither serialized nor
hydrated. A repeated name replaces the earlier registration, with a warning outside production.

During SSR a `watch()` callback also fires once, a microtask after registration, with the current
value as both arguments, so it catches changes made before it was registered;
`runWithContextAsync()` unwatches it when the request ends.
