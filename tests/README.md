# Mithril Test Suite

This directory contains all tests for Mithril, organized by module.

## Structure

```
tests/
├── api/              # API tests (mount, redraw, router)
├── pathname/         # Pathname parsing/building tests
├── querystring/      # Query string parsing/building tests
├── render/           # Rendering and VDOM tests
├── signal/           # Signal primitive tests
├── store/            # Store (deep signal) tests
├── util/             # Utility function tests
└── test-utils/       # Test utility tests
```

## Running Tests

Run all tests:
```bash
bun test
```

Run specific test suite:
```bash
bun test tests/signal/
bun test tests/store/
```

## Test Conventions

- Test files use `.test.ts` or `.test.js` extension
- Tests use Bun's built-in test framework (`bun:test`)
- Legacy tests may use `ospec` (being migrated gradually)

## Adding New Tests

When adding tests for new features:

1. Create test files in the appropriate module directory
2. Use descriptive names: `test-<feature>.test.ts`
3. Follow existing test patterns
4. Ensure tests are isolated and can run independently
