# Notes

Standing facts about this codebase that neither the code nor `git log` holds. **Not** a decision
log — decisions go in the body of the commit that implements them.

## Commit or note?

Ask: _will this still be true after the next ten commits?_

- **No — it explains one diff** → the commit body, frozen with the code it describes.
- **Yes — it constrains future work** → a note here, edited in place when it stops being true.

What belongs here: non-obvious runtime behaviour, **rejected options** with the reason they lost,
**external constraints** (browser limits, Bun), **measurements** with date and method, and
directions abandoned without a diff. What doesn't: what the code says, plans and proposals, and
anything a code change would falsify — that is a comment next to the code.

## Format

One topic per file, named for the topic, free prose with no mandatory sections. The only
structure is the frontmatter:

```yaml
---
topic: ssr
triggers: [server/ssr.ts, deserializeAllStates, 'hydration mismatch'] # when to read this
updated: 2026-10-07
---
```

If a note passes ~100 lines it is probably narrating. Cut it.

## Index

| Note                                           | Covers                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| [`signals-and-state.md`](signals-and-state.md) | Component-level redraws, computeds, `state()` conventions, deferred gate |
| [`ssr.md`](ssr.md)                             | `oninit` on both sides, the state script, request isolation, redirects   |
| [`store.md`](store.md)                         | Persistence tiers, SSR overwriting stored preferences, the session tier  |
| [`docs-site.md`](docs-site.md)                 | What the docs dropped from upstream, the performance demo's measurements |
