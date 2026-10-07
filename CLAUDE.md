# CLAUDE.md — Mithril, Bitstillery edition

This is its own line of Mithril, not a fork that tracks upstream Mithril.js. Change it freely; don't
weigh changes against upstream compatibility or contribution.

- **Layout:** the library is in `src/` (by area: `render/`, `router/`, `state/`, `ssr/`, `log/`,
  `util/`), and `tests/` mirrors it. Files are snake_case. Anything consumers import goes through an
  entry in `package.json` `exports`, never a deep path.
- **Bun, not Node.** Develop, test and benchmark with Bun, and say "Bun" (or "server-side") in docs
  and comments where you'd otherwise write "Node.js".
- **Nothing is done until it lints and type-checks:** `bun run lint` (oxfmt, oxlint, `tsc`).
- **Tests:** `bun test`.
- **Performance changes need numbers:** `bun run bench <topic>` (hyperscript, render, signal, state,
  …) before and after; a stable ~10% shift is meaningful. `bun run bench:profile` writes a CPU
  profile for hunting regressions.
- **Commits** use Conventional Commits, `type(scope): subject`, with a body saying why for
  `feat`/`fix`/`perf` and anything touching 5+ files — the decision and what it beat live there.
  This repository is public: keep names of private products and customers out of commits, comments
  and docs.
- **Standing facts** — non-obvious behaviour, rejected options with the reason they lost, external
  constraints, dated measurements — go in a topic note under [`docs/notes/`](docs/notes/README.md),
  edited in place. Read the matching note before changing a design it covers.
