---
topic: ssr
triggers:
    [
        src/server.ts,
        ssr/response.ts,
        ssr/context.ts,
        ssr/render_to_string.ts,
        ssr/serialize.ts,
        createSSRResponse,
        route.resolve,
        route.redirect,
        deserializeAllStates,
        isHydrating,
        '__SSR_STATE__',
        'hydration mismatch',
    ]
updated: 2026-10-07
---

# Server rendering and hydration

SSR is Bun-only by choice: `ssr/response.ts` uses Bun types and serving helpers, and a
runtime-neutral layer was judged not worth it while Bun is required anyway. The helpers stop short
of a framework (routes, context setup and the template stay with the app), which was rejected as
taking away too much flexibility. Related: [signals-and-state.md](signals-and-state.md) (computeds
across serialization, optional state names, `watch()` during SSR) and [store.md](store.md) (Store
tiers under SSR, the session tier).

## oninit on both sides

`oninit(vnode, context)` runs on the server and on the client; `context` carries `isSSR` and
`isHydrating`. On the server a promise returned from `oninit` delays only that component's view,
sibling async `oninit`s run concurrently, and a throwing or rejecting `oninit` still renders its
view. A throwing view rejects the whole render. There is a single pass: the `PromiseTracker`
second pass belonged to a `waitFor` argument that `oninit` no longer receives.

The original design skipped `oninit` while hydrating; e20ab7f3 reverted that without recording why.
Components now decide with `context.isHydrating`. A separate `onhydrate` hook was rejected because most components need no
hydration-specific logic.

On the client the hydrating view renders right after `oninit` returns, without awaiting it. An
`oninit` that resets fields and refetches therefore patches the server's DOM back to its loading
state; guard the fetch with `isHydrating`.

## What the state script carries

Only named states in the current registry are serialized, and on the client only states that
already exist when `deserializeAllStates()` runs are restored; unknown names are skipped. A named
state created in a component constructor during mount does not exist yet, so its server values are
dropped. First-paint data has to live in module- or app-level named state, restored before
`m.mount`/`m.route`.

Values come out as JSON.stringify would write them: a Date as its ISO string, an object reachable
twice in full at each place, and only a real cycle broken with `null`. A Map becomes its entries
array and a Set its values array. Nothing is tagged, so deserialization restores these as strings
and arrays; a state that needs a Date or Map back rebuilds it. A type-tagging scheme was not added
because no restored state needed one.

Names are explicit because the alternatives match unreliably across server and client: names
derived from component class names collide, a hash of the state's shape breaks when the shape
changes, and a hash of its content differs as soon as the values do.

## Request isolation is partial

`createSSRResponse()` runs each request in `AsyncLocalStorage`, which isolates the state registry
and `watch()` cleanup. Process-wide on the server, and so shared by concurrent requests that
interleave at an awaited `oninit`: the router singleton's current path, params and prefix (what
`m.route.get()`/`m.route.param()` read), `globalThis.__SSR_URL__` (what `getCurrentUrl()` reads),
and any module-level state.

## Hydration

`render()` treats a root as hydrating when it has element children and no vnodes, so SSR output
with only text under the root is cleared and re-rendered. The client tree must mirror the server
tree vnode for vnode: an extra fragment at the route root, for instance, leaves a blank root (see
`RouterRoot` in `router/router.ts`).

Matching is positional below the root: a tag mismatch creates a fresh element at that spot and
unclaimed leftovers are removed, so the client vdom wins node by node. The earlier content
matching broke on adjacent text runs, which the HTML parser merges into one text node (3fe74598).
Rejected: clearing and re-rendering on every hydration (loses scroll and focus), strict matching
(breaks on whitespace and browser differences), and silencing removal errors without repairing the
DOM.

## Redirects

`onmatch` returns `m.route.redirect(path)`. On the server `route.resolve()` renders the target in
the same request and returns it as a 200 at the requested URL; the client router then runs the
same `onmatch` and moves the URL. More than five chained redirects throw. An HTTP 302 was rejected
because it covers only the server path, exceptions because redirects are control flow, and a
returned `undefined` because it was ambiguous with skipping a route. The marker symbol is not
`Symbol.for`, so `isRedirect()` also accepts any symbol whose description contains `REDIRECT` with
a `/`-rooted path, to recognize redirects built by another copy of the router module.

## Server helpers

- A path that matches no route throws, so `createSSRResponse()` answers 500; filter to known routes
  before calling it.
- `getBunProcessedTemplate()` fetches the app's own `/__template__` route on each call to get Bun's
  processed HTML (HMR scripts, asset URLs), and falls back to the raw file without them.
