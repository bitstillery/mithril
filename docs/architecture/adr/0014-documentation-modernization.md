# ADR-0014: Documentation Modernization for Bitstillery Mithril Fork

**Status**: Proposed  
**Date**: 2025-02-19  
**Related ADRs**:

- [ADR-0012](./0012-mithril-signals-store-ssr-architecture.md) (Mithril Signals, Store, and SSR Architecture Overview)

## Context

The Bitstillery Mithril fork has diverged from upstream Mithril.js: Stream and `m.request` were removed; Signals, Store, SSR, and htm were added. The codebase is TypeScript-first and uses Bun. The current docs target the original Mithril.js—npm, Node, ospec, Stream, `m.request`, framework comparisons—and do not reflect the fork's features or tooling.

We need a plan to modernize the docs so they accurately describe this fork. At the same time, we want to signal clearly to the Mithril community: this is not an attempt to replace Mithril, but an experiment by Bitstillery to add functionality we would like to see. We will discuss with the community whether these changes can be contributed upstream.

## Decision

We will modernize the documentation according to the following principles and changes:

### Guiding Principles

1. **Plain, straightforward docs**: No framework comparison charts or marketing fluff.
2. **Minimal examples**: Keep examples to the minimum needed to illustrate essential principles.
3. **Mithril branding**: Keep "Mithril" as the product name; use "AA" (AI Augmented) as version suffix. We will reconsider if the community has objections.
4. **Bun only**: Replace all npm, Node, and ES6 references with Bun (`bun i`, `bun run`, `bunx`).
5. **Honest about AI**: Almost everything in this codebase was AI-generated; we aim for quality regardless.

### Additions (new pages)

- **Signals** (`content/signals.md`): `signal()`, `computed()`, `effect()`, fine-grained reactivity
- **State** (`content/state.md`): `state()` deepsignal-style reactive state
- **Store** (`content/store.md`): `Store` class, persistence, `blueprint()`
- **SSR** (`content/ssr.md`): `renderToString`, hydration, `deserializeAllStates()`
- **htm**: Update `content/jsx.md` with `@bitstillery/mithril/htm`

### Removals

- **Stream** (`content/stream.md`): Remove page, nav entry, route
- **m.request** (`content/request.md`): Remove page; replace usages with `fetch()` in examples
- **ospec**: Rewrite testing docs for `bun test`
- **Framework comparison**: Remove page and charts
- **ES6+ on legacy browsers** (`content/es6.md`): Remove—obsolete with Bun
- **Jobs, Releases links**: Remove; use npm badge for package version

### Branding and Links

- Repository: `github.com/bitstillery/mithril`
- Package: `@bitstillery/mithril`
- Version display: `{version}-AA`

## Rationale

- **Accurate docs**: Users need documentation that matches what the fork provides, not upstream Mithril.js.
- **Clarity over completeness**: Minimal examples and no framework comparisons keep the docs focused.
- **Bun alignment**: The project uses Bun; docs should reflect that to avoid confusion.
- **Community transparency**: Stating that we are not replacing Mithril and that AI was used builds trust.

## Consequences

### Pros

- Docs will match the fork's API and tooling.
- New features (Signals, Store, SSR, htm) have dedicated pages.
- Removed features no longer confuse users.
- Clear positioning for the Mithril community.

### Cons

- Significant rewrite effort.
- Upstream Mithril users may find the docs less familiar.
- Ongoing maintenance as the fork evolves.

### Risks

- Risk of regressions or broken links during the transition.
- Risk of documentation drift if changes are not applied consistently.

## Alternatives Considered

- **Keep upstream docs with patches**: Would require maintaining a patch set; harder to keep in sync.
- **Minimal fork-specific overlay**: Would leave outdated content (Stream, m.request) visible; confusing.
- **Full rewrite from scratch**: Chosen—cleaner than patching, and the plan provides structure.

## Implementation Details

The detailed plan lives in [docs/DOCS_MODERNIZATION_PLAN.md](../../DOCS_MODERNIZATION_PLAN.md). Phases:

1. Branding, links, version suffix
2. Remove Stream, m.request, framework comparisons
3. Update nav, routes, layout
4. Rewrite index, installation, testing
5. Update route, simple-application, jsx, contributing
6. Create signals, state, store, ssr pages
7. External links audit

## References

- [DOCS_MODERNIZATION_PLAN.md](../../DOCS_MODERNIZATION_PLAN.md)
