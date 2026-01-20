# @bitstillery/mithril

A modern TypeScript fork of [Mithril.js](https://github.com/MithrilJS/mithril.js) - a lightweight, fast client-side JavaScript framework for building Single Page Applications.

## What is Mithril?

Mithril is a modern client-side JavaScript framework for building Single Page Applications. It's small, fast and provides routing utilities out of the box.

This fork (`@bitstillery/mithril`) has been modernized with:
- **TypeScript** - Full TypeScript support with type definitions included
- **Bun** - Uses Bun runtime for development, testing, and bundling
- **Modern tooling** - ESLint, oxlint, and modern development workflows
- **No build step required** - Import TypeScript source files directly

## Installation

### npm / bun

```bash
npm install @bitstillery/mithril
# or
bun add @bitstillery/mithril
```

### Using with Bun (Recommended)

Since this package uses TypeScript source files directly, you can import it without any build step when using Bun:

```typescript
import m from '@bitstillery/mithril'

// Use Mithril directly
m.mount(document.body, {
  view: () => m('div', 'Hello, world!')
})
```

### Using with other bundlers

For use with other bundlers (webpack, vite, etc.), you may need to configure TypeScript support or use a build step.

## Development

This project uses [Bun](https://bun.sh) for development and testing.

### Prerequisites

- [Bun](https://bun.sh) (latest version)

### Setup

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run linting
bun run lint

# Run performance tests
bun run perf
```

### Project Structure

- `index.ts` - Main entry point
- `api/` - Core API modules (mount, redraw, router)
- `render/` - Rendering engine
- `pathname/` - Pathname utilities
- `querystring/` - Query string utilities
- `util/` - Utility functions
- `test-utils/` - Testing utilities

## Differences from Original Mithril.js

This fork maintains API compatibility with the original Mithril.js but includes:

- **TypeScript**: Full TypeScript rewrite with type definitions
- **Modern tooling**: Bun, ESLint, oxlint
- **Removed modules**: `request` and `stream` modules have been removed
- **No build artifacts**: Uses TypeScript source directly

## Documentation

For usage documentation, see the [original Mithril.js documentation](https://mithril.js.org).

The API is compatible with Mithril.js v2.x, so existing Mithril.js documentation and examples apply.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

This is a fork of [Mithril.js](https://github.com/MithrilJS/mithril.js) by Leo Horie and contributors.

---

Thanks for using Mithril! 🎁
