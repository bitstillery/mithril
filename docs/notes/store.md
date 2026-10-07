---
topic: store
triggers: [state/store.ts, Store, ssr/session.ts, skipStates, '/api/session', 'cookie tier', 'lookup TTL']
updated: 2026-10-07
---

# Store and persistence

`state()` is the reactive primitive; `Store` wraps one `state()` and adds persistence tiers. The
primitive used to be called `store()`. Keeping that name beside a `Store` class read as one thing,
and `proxy()` was turned down as naming the mechanism rather than the meaning.

## The tiers are one object

Every tier lands in the same `store.state`; the templates passed to `load()` only decide which keys
each tier writes back, via `blueprint()`. Nothing in the state says which tier a key came from, so a
key named in two templates is written to both.

The sessionStorage tier is called `tab` because `session` was ambiguous with a server session, and
the name is now taken by the server tier. Unlike the other tiers, its template is written flat and
`load()` mounts it under `state.tab`.

Two key names are magic. `blueprint()` copies any `lookup` whole instead of per template key, so
free-form caches don't need every key declared; the top-level one is also written to localStorage
on every `save()`, whatever the options. A top-level `identity` is taken from localStorage as a
whole, not merged over the template.

In the browser every `Store` starts a 10-second interval that drops `lookup` entries older than
`lookup_ttl` and then calls a full `save()`. Nothing clears that interval, so a short-lived `Store`
keeps it running.

## SSR overwrites stored preferences

The server has no localStorage or sessionStorage, so a server-side `load()` builds `saved` and `tab`
from template defaults only. The SSR state therefore holds defaults where the user has stored
values, and `deserializeAllStates()` assigns top-level keys wholesale. Calling it on a `Store`'s
state after `load()` puts the defaults back over the user's preferences.

An earlier design had stored tiers survive hydration while temporary and session keys came from the
server. That was never built. The working pattern is the docs site's `client.tsx`: pass the Store's
state in `skipStates`, then `deserializeStore()` only the keys that should come from the server.

The `cookie` tier exists because localStorage never reaches the server. Values the first paint
depends on (theme, layout) rendered with defaults and flashed on hydration. A cookie arrives with
the document request, so the server can render with it. During SSR there is no `document`, so the
app parses the request cookie itself and passes the values as the `cookie` template; `load()` merges
the cookie tier last, so it wins. Browsers cap a cookie at about 4 KB and it ships on every request,
which is why writes over `MAX_COOKIE_BYTES` are skipped with a warning, not truncated.

`save()` does nothing in an SSR process: `__SSR_MODE__` is set as soon as `ssr/response.ts` is
imported, not per request.

## SSR registration

`load()` updates the state registry entry of the Store's state and throws if there is none. Inside
an SSR request the current registry is the per-request one, so a `Store` built at module load
(registered in the global registry) has to be registered in the request first, with
`registerState()` or `copyGlobalStatesToContext()`.

The automatic name is `store.instance.N`, a counter in construction order, so the server and the
client only match it if they construct their Stores in the same order. Apps register under a fixed
name instead.

A `Store` is one object. A module-level `Store` that is reloaded per request is shared by
concurrent renders; the per-request registry does not isolate its values.

## Server session tier

The `session` tier has no browser storage. Its values reach the client only through the SSR state,
and `save({session: true})` sends them back with a POST to `/api/session`. The session id travels in
an HttpOnly cookie that `createSSRResponse()` sets, so the client never handles it.

- Off by default: a bare `save()` writes localStorage, sessionStorage and the cookie, never the
  network. The original design included the session tier in a bare `save()`.
- `createSessionUpdateHandler()` reads only `body.session_data` or `body.session`. The session
  template therefore has to nest its keys under one of those names, or the server stores `{}`.
- `MemorySessionStore.updateSession()` merges only the top level, so each POST replaces the whole
  stored session subtree. No partial update and no debounce: one request per call.
- `MemorySessionStore` is a reference implementation: in memory, so it is lost on restart (the
  intended lifecycle for this tier), and expired sessions are only removed when the app calls
  `cleanup()`.

Not built from the original design: a `GET /api/session/:id` endpoint (the SSR state already
delivers the data), and server-side JWT decoding to tie sessions to users, which is left to the app.
`getSessionByUserId()` is all the library provides for that.
