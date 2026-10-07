# Tests

The tree mirrors `src/`: a test for `src/state/store.ts` lives at `tests/state/store.test.ts`.
`helpers/` holds the DOM, history and storage mocks, each with its own test beside it;
`helpers/test_helpers.ts` is preloaded for every run (`bunfig.toml`).

```bash
bun test                # everything
bun test tests/state/   # one area
```

`render/manual/` holds HTML pages for checking browser behaviour by hand; `bun test` doesn't run
them.
