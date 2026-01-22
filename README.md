# @bitstillery/mithril

> A modern TypeScript fork of Mithril.js with **fine-grained reactivity**, **SSR hydration**, and **zero external dependencies** for signals.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Why This Fork Exists

Mithril.js is famously lightweight and fast, but uses a global `m.redraw()` that updates **all** mounted components—even when only one piece of state changes. This fork adds **fine-grained reactivity** via custom signals, **proper SSR hydration**, and full TypeScript support—all while maintaining backward compatibility.

> **Meta**: This entire fork was generated using [Cursor's Composer 1](https://cursor.sh), with AI taking the lead on implementation. From the TypeScript migration to the custom signals implementation and SSR hydration—every line of code was written by AI, guided by human architectural decisions and direction. A significant portion of the generated code benefited from context provided by other working projects, demonstrating how AI coding tools can leverage existing codebases to produce production-ready implementations.

## What Makes This Special

### Fine-Grained Reactivity

Only components using changed state re-render. Custom signals implementation built from scratch—no external dependencies.

```tsx
import { MithrilTsxComponent, Vnode } from '@bitstillery/mithril'
import { store } from '@bitstillery/mithril'

// Create a reactive store
const $s = store({
  count: 0,
  user: { name: 'John', email: 'john@example.com' },
  todos: [],
  // Computed properties work automatically
  totalTodos: () => $s.todos.length,
})

// Component only re-renders when $s.count changes
class Counter extends MithrilTsxComponent {
  view(vnode: Vnode) {
    return (
      <div>
        <p>Count: {$s.count}</p>
        <button onclick={() => $s.count++}>Increment</button>
      </div>
    )
  }
}
```

Only components reading changed state re-render. This uses component-level redraws, not global VDOM diffing.

### SSR Hydration

Server-side rendering with state preservation. Signal values are serialized on the server and restored on the client before hydration.

```typescript
// Server
const html = await m.renderToString(App)
const state = serializeState($s)

// Client
deserializeState($s, state)
m.mount(root, App)
```

Components skip `oninit` during hydration since state is already restored. Computed properties are excluded from serialization and reinitialized on the client.

### Zero External Dependencies

Custom signals implementation built from scratch—no Preact Signals or other packages. Two APIs:
- **Raw signals**: `signal()`, `computed()`, `effect()` - direct primitives
- **Signal proxy store**: `store()` - Proxy-based API (inspired by DeepSignal)

Concepts borrowed from Preact Signals, DeepSignal, Mithril PR #3036, and SolidJS—but all code is original, designed specifically for Mithril.

### TypeScript First

Full TypeScript rewrite with proper types. Import TypeScript source directly with Bun—no build step required.

## Quick Start

```bash
bun add @bitstillery/mithril
```

```tsx
import m from '@bitstillery/mithril'
import { MithrilTsxComponent, Vnode, store } from '@bitstillery/mithril'

// Create reactive state
const $s = store({
  count: 0,
  message: 'Hello, Mithril!'
})

// Component with fine-grained updates
class App extends MithrilTsxComponent {
  view(vnode: Vnode) {
    return (
      <div>
        <h1>{$s.message}</h1>
        <p>Count: {$s.count}</p>
        <button onclick={() => {
          $s.count++
          // Only components reading $s.count re-render
        }}>
          Increment
        </button>
      </div>
    )
  }
}

m.mount(document.body, App)
```

## Signals API

### Basic Signals

```typescript
import { signal, computed, effect } from '@bitstillery/mithril'

const count = signal(0)
const doubled = computed(() => count.value * 2)

effect(() => {
  console.log(`Count is now: ${count.value}`)
})

count.value = 5 // Effect runs, components update
```

### Signal Proxy Store

The `store()` function provides a Proxy-based API that wraps signals, giving you a convenient object-like interface while using signals under the hood (inspired by DeepSignal's approach).

```typescript
import { store } from '@bitstillery/mithril'

// Create a signal proxy store
const $s = store({
  user: {
    name: 'John',
    email: 'john@example.com',
    // Nested reactivity works automatically
  },
  todos: [
    { id: 1, text: 'Learn Mithril', done: false }
  ],
  // Computed properties (no prefix needed)
  totalTodos: () => $s.todos.length,
  completedTodos: () => $s.todos.filter(t => t.done).length,
})

// Access values (returns unwrapped value, tracks dependency)
$s.user.name // 'John'

// Access raw signals (for passing as props)
$s.$user.name // Signal object
```

The proxy store automatically converts properties to signals, handles nested objects/arrays, and provides the `$` prefix convention for accessing raw signals.

### Component-Level Redraws

```tsx
import { MithrilTsxComponent, Vnode } from '@bitstillery/mithril'

// Component A reads $s.count
class ComponentA extends MithrilTsxComponent {
  view(vnode: Vnode) {
    return <div>Count: {$s.count}</div>
  }
}

// Component B reads $s.user.name
class ComponentB extends MithrilTsxComponent {
  view(vnode: Vnode) {
    return <div>User: {$s.user.name}</div>
  }
}

// When $s.count changes, only ComponentA re-renders
// ComponentB doesn't re-render (fine-grained reactivity)
```

## SSR Example

See [`examples/ssr/`](examples/ssr/) for a complete SSR example with:
- Server-side rendering
- State serialization
- Client hydration
- Async data loading

## Store Example

See [`examples/store/`](examples/store/) for signals/store examples:
- Basic store usage
- Computed properties
- Signal props
- Component patterns

## Architecture Decisions

This project documents architectural decisions in [ADRs](docs/architecture/adr/):

- **[ADR-0001](docs/architecture/adr/0001-ssr-hydration.md)**: SSR Hydration Support
- **[ADR-0002](docs/architecture/adr/0002-signals-implementation.md)**: Custom Signals Implementation
- **[ADR-0003](docs/architecture/adr/0003-typescript-typing-consolidation.md)**: TypeScript Typing Consolidation

## Differences from Original Mithril.js

| Feature | Original Mithril.js | This Fork |
|---------|-------------------|-----------|
| Reactivity | Global `m.redraw()` | Fine-grained component-level redraws |
| State Management | Manual redraw calls | Signals + proxy store with automatic tracking |
| SSR Hydration | State loss, duplicate calls | Proper state preservation |
| TypeScript | Community types | Native TypeScript implementation |
| Signals | No | Yes (Custom implementation) |
| Build Step | Required | Optional (Bun) |

## Backward Compatibility

**100% API compatible** with Mithril.js v2.x. Existing `m.redraw()` behavior unchanged. Signals are opt-in.

## Development

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

## Documentation

- **Usage**: See [Mithril.js documentation](https://mithril.js.org) (API compatible)
- **Signals**: See [`examples/store/`](examples/store/)
- **SSR**: See [`examples/ssr/`](examples/ssr/)
- **Architecture**: See [`docs/architecture/`](docs/architecture/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## So Long, and Thanks for All the Fish

This is a fork of [Mithril.js](https://github.com/MithrilJS/mithril.js), built on the foundation laid by **Leo Horie** and the Mithril.js community. Special thanks to prominent contributors including **Pat Cavit**, **Claudia Meadows**, **Zoli Kahan**, **Alec Embke**, **Barney Carroll**, **Dominic Gannaway**, **Boris Letocha**, and **Joel Richard**.

This implementation was built with code and concepts from:

- **[Preact Signals](https://preactjs.com/guide/v10/signals/)** - Signal primitive, computed signals, dependency tracking
- **[DeepSignal](https://github.com/luisherranz/deepsignal)** - Deep reactivity patterns with Proxy
- **[Mithril PR #3036](https://github.com/MithrilJS/mithril.js/pull/3036)** - Component-level redraw pattern
- **SolidJS** - Fine-grained reactivity concepts

Code from these projects was used as context during AI-assisted development. The final implementation is original, written specifically for Mithril's architecture.
