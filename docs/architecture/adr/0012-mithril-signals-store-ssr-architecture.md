# ADR-0012: Mithril Signals, Store, and SSR Architecture Overview

**Status**: Accepted  
**Date**: 2025-02-02  
**Related ADRs**: 
- [ADR-0001](./0001-ssr-hydration.md) (SSR Hydration Support)
- [ADR-0002](./0002-signals-implementation.md) (Custom Signals Implementation)
- [ADR-0004](./0004-ssr-state-serialization-signal-stores.md) (SSR State Serialization)
- [ADR-0007](./0007-store-ssr-persistence-strategy.md) (Store SSR and Persistence Strategy)
- [ADR-0009](./0009-ssr-server-abstraction.md) (SSR Server Component Abstraction)

## Context

Mithril.js has been extended with signal-based state management, a Store class for persistence, and full SSR support. These changes represent a significant architectural evolution from the original Proxy-based approach. This ADR provides a comprehensive overview of the architecture and how it differs from the previous implementation.

### Previous Architecture

**Proxy-based State**:
- Proxy objects with manual `m.redraw()` calls
- Global redraws: All components re-render on any change
- Manual dependency tracking
- Model references: `model={[refObject, 'key']}` array format
- No SSR support

### Current Architecture

**Signal-based State**:
- Signal state with automatic component-level redraws
- Fine-grained reactivity: Only affected components re-render
- Automatic dependency tracking during render
- Model references: `model={refObject.$key}` direct signal access
- Full SSR support with hydration

## Decision

We have implemented a complete signal-based architecture for Mithril with:

1. **Signal State Management**: Fine-grained reactivity system with automatic component-level redraws
2. **Store Class**: Persistent state management with localStorage/sessionStorage/session support
3. **Server-Side Rendering**: Full SSR support with state serialization and hydration
4. **API Compatibility**: `watch()` API unchanged, model reference pattern updated

## Rationale

### Why Signals Over Proxy

1. **Performance**: Component-level redraws are much more efficient than global redraws
2. **Automatic Dependency Tracking**: No manual redraw management needed
3. **SSR Support**: Signals work seamlessly with SSR serialization/hydration
4. **Fine-Grained Reactivity**: Only update what changed, not entire application

### Why State Naming Requirement

All states must have names for SSR serialization:
- **SSR State Matching**: Names match server-serialized state with client instances
- **State Registry**: Names used as keys for serialization/deserialization
- **Fail-Fast Design**: Error at state creation prevents silent SSR failures
- **Consistency**: Same name on server/client ensures reliable matching

### Why New Model Reference Pattern

**Old**: `model={[refObject, 'key']}` - Array format requiring `modelref_adapter()`
**New**: `model={refObject.$key}` - Direct signal access

Benefits:
- Cleaner API: Direct access instead of array format
- No adapter needed: Signal accessed directly
- Type-safe: Better TypeScript support
- Consistent: Uses same `$` prefix convention as signal access

## Consequences

### Pros

**Performance**:
- Fine-grained reactivity: Only update what changed
- Component-level redraws: Much more efficient than global redraw
- SSR: Faster initial page load, better SEO

**Developer Experience**:
- Automatic dependency tracking: No manual redraw management
- Type-safe: Full TypeScript support
- SSR-aware: Works seamlessly in SSR and client contexts
- Cleaner API: Direct signal access vs array format

**State Management**:
- Persistent state: localStorage, sessionStorage, session support
- Computed properties: Automatic derived state
- SSR hydration: State preserved from server to client

### Cons

**Migration Effort**:
- Existing code uses Proxy pattern - requires migration
- Model references need updating: `[ref, 'key']` → `ref.$key`
- State naming required (new requirement)

**Complexity**:
- Signal system adds complexity vs simple Proxy
- SSR serialization/deserialization adds overhead
- Per-request isolation requires careful state management

### Risks

**Backward Compatibility**:
- Old Proxy code still works but won't benefit from signals
- Gradual migration path needed
- `watch()` API unchanged (mitigates migration risk)

**State Naming**:
- Missing names cause errors (fail-fast design)
- Name collisions possible (mitigated by explicit naming requirement)

## Implementation Details

### Signal Architecture

**Core Components**:
- `Signal<T>`: Reactive primitive tracking subscribers
- `ComputedSignal<T>`: Automatically recomputes when dependencies change
- `effect()`: Runs side effects when dependencies change
- `state()`: Deep signal state with Proxy wrapper

**Component Integration**:
- Component-to-signal dependency tracking via WeakMaps
- Automatic component redraws when signals change
- SSR-aware (watchers run in SSR context)

### Store Class

**Persistence Types**:
- **saved**: localStorage (survives browser restarts)
- **temporary**: Not persisted (resets on reload)
- **tab**: sessionStorage (survives page reloads)
- **session**: Server-side session storage (hydrated via SSR)

**Key Features**:
- Deep merging of templates with persisted state
- Computed properties preserved (functions reinitialized after load)
- Session state sync via `/api/session` endpoint
- SSR-aware (skips localStorage/sessionStorage during SSR)

### SSR Architecture

**SSR Context** (`ssrContext.ts`):
- Uses `AsyncLocalStorage` (Node/Bun) for request-scoped context
- Per-request state registry, store, session data, EventEmitter
- Automatic watcher cleanup at end of request

**State Serialization** (`render/ssrState.ts`):
- Extracts signal values from state
- Skips `ComputedSignal` instances (functions recreated on client)
- Handles nested states and circular references
- Injects state into HTML: `<script id="__SSR_STATE__">`

**SSR Flow**:
1. Server: Create per-request context → Render → Serialize states → Inject into HTML
2. Client: Read `__SSR_STATE__` → Deserialize states → Restore computed properties → Hydrate

### API Comparison

**State Management**:
- Old: Proxy with manual `m.redraw()` → Global redraws
- New: Signals with automatic component-level redraws

**Watch API**:
- Same: `watch()` API unchanged - works with both Proxy and Signals

**Model References**:
- Old: `model={[refObject, 'key']}` - Array format
- New: `model={refObject.$key}` - Direct signal access

**Redraw Behavior**:
- Old: `m.redraw()` - redraws entire application
- New: `m.redraw(component)` - redraws only affected components (automatic via signals)

## Portal POC Implementation

The Portal application demonstrates real-world usage:

**Server Setup**:
- Per-request store creation: `new Store()` per request
- Session management via `MemorySessionStore`
- Route-based SSR (only specific routes are SSR'd)

**Client Setup**:
- `prepareAppState()` handles three modes: `'ssr'`, `'hydration'`, `'spa'`
- Unified state preparation for all modes
- State registered with name `'portalStore'`

## Migration Path

**Gradual Migration**:
1. New code uses signals/Store
2. Existing Proxy code continues to work
3. Migrate model references: `[ref, 'key']` → `ref.$key`
4. Migrate components to use signals for fine-grained reactivity

**Backward Compatibility**:
- `watch()` API unchanged
- Proxy code still works (just doesn't get signal benefits)
- Can migrate incrementally

## Testing Strategy

1. Test signal reactivity (component-level redraws)
2. Test Store persistence (localStorage, sessionStorage, session)
3. Test SSR serialization/deserialization
4. Test hydration (state preserved from server)
5. Test computed properties (restored after deserialization)
6. Test model reference migration (`[ref, 'key']` → `ref.$key`)

## References

- **Signal Implementation**: `signal.ts`
- **State Implementation**: `state.ts`
- **Store Implementation**: `store.ts`
- **SSR Implementation**: `server/ssr.ts`, `render/ssrState.ts`
- **Portal POC**: `frontend/portal/src/`
- **Related ADRs**: See Related ADRs section above
