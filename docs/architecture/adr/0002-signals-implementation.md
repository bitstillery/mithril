# ADR-0002: Custom Signals Implementation for Mithril

**Status**: Proposed  
**Date**: 2025-01-XX  
**Related ADRs**: [ADR-0001](./0001-ssr-hydration.md) (Signals build on SSR hydration support)

## Context

Mithril currently uses `m.redraw()` to trigger re-renders, which redraws **ALL** mounted components. This is inefficient - components that don't need updates still re-render. Additionally, there's no automatic dependency tracking, requiring manual redraw management.

We need fine-grained reactivity where only components using changed state re-render, similar to Preact Signals and deepsignal patterns. However, we want a custom implementation specifically designed for Mithril, not integrating external packages.

### Problem

**Current Mithril Architecture:**
- Uses `m.redraw()` to trigger re-renders
- `m.redraw()` redraws **ALL** mounted components (inefficient)
- Components re-render on every `redraw()` call
- No automatic dependency tracking
- Manual redraw management

**Requirements:**
- Fine-grained reactivity (only update components using changed signals)
- Automatic dependency tracking
- Seamless SSR/hydration support (builds on ADR-0001)
- Backward compatibility (existing `m.redraw()` unchanged)
- Proxy store paradigm compatibility (computed properties, watchers)

## Decision

We will build a **completely custom signals implementation from scratch** for Mithril. We will **NOT integrate the Preact Signals package** (`@preact/signals-core` or any other) - instead, we'll implement our own signals system inspired by Preact Signals and deepsignal concepts, but designed specifically for Mithril's architecture.

### Key Decision: Custom Implementation (No External Package)

- **No dependency on `@preact/signals-core`** or any Preact Signals package
- **Pure Mithril implementation** - built from scratch
- **Inspired by concepts** from Preact Signals and deepsignal (not their code)
- **Tailored for Mithril** - perfect integration with redraw system and SSR
- **Self-contained** - no external dependencies

## Rationale

### Why Custom Implementation

1. **Easier to work with**: Complete control, no package constraints
2. **No external dependencies**: Self-contained, smaller bundle
3. **Perfect Mithril integration**: Designed specifically for Mithril's needs
4. **Avoid Preact Signals' issues**: Build hydration correctly from the start
5. **Full control**: Can optimize for Mithril's specific use cases

### Concepts to Borrow (Not Code)

**From Preact Signals:**
- Core signal primitive concept (value storage, subscriber tracking)
- Computed signals concept (dependency tracking, caching)
- Effect tracking concept (automatic dependency detection)
- **We implement these ourselves** - no package dependency

**From DeepSignal:**
- Deep reactivity with Proxy concept
- Nested object/array handling pattern
- **We implement these ourselves** - no package dependency

**From both:**
- Automatic dependency tracking pattern
- Fine-grained updates pattern
- **We implement these ourselves** - no package dependency

### Alternatives Considered

**Option A: Integrate Preact Signals Package**
- **Rejected**: Would require adapting Preact Signals to Mithril's architecture
- **Rejected**: Preact Signals has known hydration issues
- **Rejected**: Less control over implementation details

**Option B: Signals + Proxy Hybrid**
- Keep proxy system, add signals as alternative
- **Rejected**: Adds complexity, dual systems to maintain
- **Note**: We may provide compatibility layer, but signals are primary

**Option C: Custom Implementation (Chosen)**
- Build completely custom signals from scratch
- **Chosen**: Full control, perfect Mithril integration, no external dependencies

## Implementation Details

### Architecture Overview

**Core Components:**

1. **Signal Primitive** (`mithril/signal.ts`):
   - `signal<T>(initial: T)`: Create a signal
   - `computed<T>(fn: () => T)`: Create a computed signal
   - `effect(fn: () => void)`: Create an effect that tracks signal accesses

2. **Deep Signal Store** (`mithril/store.ts`):
   - `store<T>(initial: T)`: Create a deep signal store (like deepsignal)
   - Uses Proxy to wrap nested objects/arrays
   - Automatically converts properties to signals
   - Provides proxy-like API

3. **Mithril Integration** (`render/render.ts`):
   - Track signal accesses during component render
   - Map component-to-signal dependencies
   - Component-level redraws (only affected components)
   - Use component-level redraw API (like PR #3036's `m.redraw(component)`)

4. **SSR Support** (`render/ssrState.ts`):
   - Serialize signal values (extract `.value`)
   - Recreate signals on client with serialized values
   - Handle hydration properly (builds on ADR-0001)

### Fine-Grained Reactivity Mechanism

**Problem**: `m.redraw()` redraws the entire vdom (all mounted components), which is inefficient.

**Research Findings:**

Different frameworks use different approaches:

1. **Preact Signals**:
   - Uses component-level re-renders + VDOM diffing
   - Components subscribe to signals during render (via `setState` integration)
   - Only components that read `signal.value` re-render when signal changes
   - Can bypass VDOM for direct signal-to-DOM bindings (text/attributes)
   - Still uses VDOM diffing, but only for affected components

2. **SolidJS**:
   - NO VDOM at all
   - Direct DOM updates via fine-grained reactivity
   - Expressions subscribe to signals, update DOM directly
   - No component re-renders, no VDOM diffing

3. **Component-Level Redraws (PR #3036 reference)**:
   - Still uses VDOM diffing
   - Only redraws specific components instead of all components
   - More efficient than global redraw, but still does full VDOM diff for affected components

**Decision Required:**

We need to choose the right approach for Mithril. Options:

**Option A: Component-Level Redraws (like PR #3036)**
- Track component-to-signal dependencies
- When signal changes, call `m.redraw(component)` for affected components only
- Still uses VDOM diffing, but only for affected components
- **Pros**: Simpler integration, maintains VDOM model
- **Cons**: Still does VDOM diffing for affected components

**Option B: VDOM-Specific Tracking**
- Track which specific VDOM nodes depend on which signals
- Update only those VDOM nodes when signals change
- More granular than component-level
- **Pros**: More fine-grained than component-level
- **Cons**: More complex implementation, still uses VDOM diffing

**Option C: Direct DOM Updates (like SolidJS)**
- Bypass VDOM entirely for signal updates
- Track signal-to-DOM bindings directly
- Update DOM nodes directly when signals change
- **Pros**: Most performant, no VDOM diffing overhead
- **Cons**: Biggest architectural change, requires careful integration with VDOM

**Recommendation**: Start with Option A (component-level redraws) for initial implementation, evaluate Option C (direct DOM updates) for future optimization.

**Implementation (Option A - Initial Approach):**
- Build component-to-signal dependency map during render
- When signal changes, look up affected components
- Call `redrawComponent(component)` instead of global `m.redraw()`
- **Performance benefit**: Only update what changed, not entire vdom
- **Note**: PR #3036 was a reference example - we'll implement similar pattern but integrated with signals

### Backward Compatibility

**Requirement**: Must not break existing Mithril behavior - large application depends on it.

**Solution:**
- Existing `m.redraw()` behavior unchanged (still redraws all components)
- Signals are opt-in: only components using signals get fine-grained updates
- No breaking changes to existing APIs
- Can migrate components gradually

### Proxy Store Paradigm Compatibility

**Requirement**: Must support existing proxy features: computed properties (`_` prefix) and watchers (`watch()`).

**Computed Properties - Multiple Patterns Supported:**

1. **Function properties** (no prefix needed):
   ```typescript
   store({ count: 0, total: () => items.length })
   // total becomes computed signal automatically
   ```

2. **`_` prefix** (for backward compatibility):
   ```typescript
   store({ count: 0, _total: () => items.length })
   // Still works, same as function property
   ```

3. **Explicit `computed()`**:
   ```typescript
   store({ count: 0, total: computed(() => items.length) })
   // Most explicit
   ```

**Why `_` prefix isn't needed with signals:**
- Proxy system needed `_` prefix because primitives are passed by value
- Signals system: Functions are automatically detected
- Store wrapper can detect function properties
- Automatically convert to computed signals
- No prefix needed: `total: () => items.length` works perfectly
- Still supports `_` prefix for backward compatibility

**Watchers - Improved API:**

1. **Store-level watching** (for compatibility):
   ```typescript
   watch(store, callback) // Watch entire store
   ```

2. **Direct signal watching** (improved):
   ```typescript
   watch(signal, callback) // Watch specific signal directly
   signal.watch(callback) // Convenience method
   ```

**Why improved**: Signals are objects (by reference), don't need `watch(store, 'key')` pattern. Can watch signals directly without key indirection.

### Component-Level Redraw Implementation

**Requirement**: Need mechanism for fine-grained updates (not global `m.redraw()`).

**Research Context:**
- PR #3036 was provided as a reference example of component-level redraws
- Preact Signals uses component re-renders (via `setState` integration)
- SolidJS bypasses VDOM entirely with direct DOM updates

**Decision:**
- Start with component-level redraw approach (similar to PR #3036 pattern)
- Track component-to-signal dependencies during render
- When signal changes, redraw only affected components
- Future: Evaluate direct DOM updates (like SolidJS) for further optimization

**Implementation:**
- Build component-to-signal dependency map during render
- Create component-level redraw API (similar to PR #3036's `m.redraw(component)`)
- Track component-to-signal mapping: Know which components to redraw
- Performance benefit: Only update what changed, not entire vdom
- **Note**: This is an initial approach - may evolve to direct DOM updates later

### SSR/Hydration Support

**Builds on ADR-0001**: Signals use the same state serialization approach.

**Implementation:**
- Extract signal values for serialization (extract `.value`)
- Handle nested signals (deep signal objects)
- Skip computed signals (functions)
- Recreate signals on client with serialized values
- Restore signal subscriptions
- Skip `oninit` during hydration (like proxy approach)

**Example:**
```typescript
// Server-side
const html = await m.renderToString(App)
const state = serializeSignals($s) // Extract .value from all signals

// Client-side
const state = deserializeSignals(ssrState)
restoreSignals($s, state) // Restore signal values
m.mount(root, App) // Hydrate
```

## Consequences

### Pros

- **Completely custom implementation**: Built from scratch specifically for Mithril
- **No external packages**: No dependency on Preact Signals or any other package
- **Full control**: Can optimize specifically for Mithril's needs
- **Proven concepts**: Based on successful patterns (Preact Signals, deepsignal) - we learn from them, implement ourselves
- **Perfect integration**: Designed from the start for Mithril's redraw system
- **SSR/hydration**: Built-in support, not workarounds (builds on ADR-0001)
- **Self-contained**: No external dependencies, smaller bundle, easier to maintain
- **Fine-grained reactivity**: Only update components using changed signals (huge performance benefit)
- **Component-level redraws**: Based on PR #3036 pattern, much more efficient than global redraw
- **Automatic dependency tracking**: Less manual redraw management
- **Backward compatible**: Existing `m.redraw()` unchanged, no breaking changes
- **Avoid Preact Signals' issues**: By building custom, we avoid their hydration problems
- **Proxy API compatibility**: Supports computed properties and watchers

### Cons

- **Implementation effort**: Building completely from scratch takes time (but gives full control)
- **Backward compatibility risk**: Must ensure no breaking changes (critical for large app)
- **Proxy API compatibility**: Must support computed properties and watchers
- **Component-level redraw**: Need to implement/integrate PR #3036 pattern
- **Testing required**: Extensive testing of existing functionality + new features
- **Migration effort**: From proxy system to signals (but API compatibility helps)
- **Unknown performance**: Need benchmarking (but should be significantly better)
- **No package to lean on**: Must implement everything ourselves (but this is also a pro - full control)

### Risks

**High Risk Areas:**

1. **Backward compatibility**: Must not break existing Mithril behavior
   - **Mitigation**: Existing `m.redraw()` behavior unchanged, signals are opt-in
   - **Fallback**: Can disable signals feature if issues arise

2. **Component-level redraw implementation**: Need efficient component redraw API
   - **Mitigation**: Integrate PR #3036 pattern or build similar API
   - **Fallback**: Fall back to `m.redraw()` if component-level fails

3. **Custom implementation complexity**: Building signals completely from scratch
   - **Mitigation**: Study Preact Signals/deepsignal concepts (not code) for inspiration
   - **Advantage**: Complete control, easier to work with than integrating a package

4. **Migration complexity**: Existing code uses proxy
   - **Mitigation**: Compatibility layer, gradual migration

5. **Signal serialization**: Complex nested structures
   - **Mitigation**: Thorough testing, handle edge cases
   - **Fallback**: Manual serialization hooks

**Medium Risk Areas:**

1. **Performance**: Unknown performance characteristics in Mithril
   - **Mitigation**: Benchmark before/after

2. **API design**: Getting the API right
   - **Mitigation**: Prototype first, gather feedback

## Implementation Phases

### Phase 1: Core Signals Implementation

**1.1 Build Custom Signals Core**
- No external dependencies - build everything from scratch
- Create `mithril/signal.ts` with custom signal implementation
- Create `mithril/store.ts` with signal store implementation
- Implement deep signal wrapper (inspired by deepsignal concept, but our own code)

**1.2 Fine-Grained Redraw Integration**
- Modify `render/render.ts` to track signal accesses per component
- Build component-to-signal dependency map
- Implement component-level redraw (based on PR #3036 pattern)
- When signal changes, redraw only affected components (not all)
- Ensure backward compatibility: Existing `m.redraw()` unchanged

**1.3 Basic API**
```typescript
import m from 'mithril'
import { store } from 'mithril/store'

// Global store
const $s = store({
  user: { name: '', email: '' },
  cart: { items: [] },
})

// Component usage
export const MyComponent = {
  view() {
    // Accessing $s.user.name automatically tracks dependency
    return m('div', $s.user.name)
    // When $s.user.name changes, component auto-redraws
  }
}
```

### Phase 2: SSR/Hydration Support

**2.1 Signal Serialization**
- Extract signal values for serialization
- Handle nested signals (deep signal objects)
- Skip computed signals (functions)

**2.2 Hydration**
- Recreate signals from serialized values
- Restore signal subscriptions
- Skip `oninit` during hydration (like proxy approach)

**2.3 Integration with ADR-0001**
- Use same state serialization registry from ADR-0001
- Signals register themselves for serialization
- Works seamlessly with proxy state serialization

### Phase 3: Advanced Features

**3.1 Computed Properties & Signals**
- Support function properties (no prefix needed)
- Support `_` prefix (for backward compatibility)
- Support explicit `computed()` calls
- Functions excluded from serialization
- Reinitialize on client

**3.2 Watchers & Effects**
- Implement improved `watch()` API for signals
- `watch(store, callback)` - watch entire store (for compatibility)
- `watch(signal, callback)` - watch specific signal directly (improved)
- `signal.watch(callback)` - convenience method
- Integrate `effect()` with Mithril lifecycle
- Clean up watchers/effects on component removal

**3.3 CollectionProxy Integration**
- Migrate CollectionProxy to use signals
- Maintain same API, use signals internally
- Better performance with fine-grained reactivity

### Phase 4: Migration & Optimization

**4.1 Proxy Compatibility Layer**
- Provide `proxy()` wrapper that uses signals internally
- Maintain backward compatibility
- Gradual migration path

**4.2 Performance Optimization**
- Fine-grained reactivity (only update what changed)
- Automatic batching
- Lazy signal evaluation

## Testing Strategy

### Unit Tests

1. Signal store creation and updates
2. Deep signal reactivity (nested objects)
3. Computed signals (`computed()` function)
4. Computed properties (`_` prefix pattern, like proxy)
5. Watchers (`watch()` API - improved for signals)
6. Signal serialization/deserialization
7. Computed properties excluded from serialization

### Integration Tests

1. Component re-rendering on signal changes (fine-grained)
2. Computed properties in components (function properties, `_` prefix, explicit `computed()`)
3. Watchers firing on signal changes
4. SSR rendering with signals
5. Hydration with signal state
6. Computed properties (functions reinitialized on client)
7. Migration from proxy to signals
8. Watch API (improved - direct signal watching, store-level for compatibility)

### Performance Tests

1. Fine-grained reactivity (only update changed components)
2. Batch updates
3. Large state objects
4. Comparison with proxy system

## Example Projects

### SSR Test (`examples/ssr/`)

- **Purpose**: Demonstrate SSR/hydration with signals
- **Features**: Server-side rendering, hydration, async data loading
- **Status**: Existing example (needs signals integration)

### Store Test (`examples/store/`) - NEW

- **Purpose**: Demonstrate correct signals/store usage patterns
- **Features**:
  - Basic store setup and initialization
  - Component usage with signals
  - Computed properties (function properties, `_` prefix for backward compat, explicit `computed()`)
  - Watchers (`watch()` API - store-level and direct signal watching)
  - Fine-grained updates demonstration
  - Performance comparison examples
  - Best practices and patterns

## References

- ADR-0001: SSR Hydration Support
- Mithril PR #3036: Component-Level Redraws (reference example, not exact implementation)
- Preact Signals: https://preactjs.com/guide/v10/signals/ (component re-renders + VDOM diffing)
- SolidJS: https://www.solidjs.com/ (direct DOM updates, no VDOM)
- DeepSignal: https://github.com/luisherranz/deepsignal (concepts only, not code)
- Mithril render system: `render/render.ts`
- Mithril SSR: `render/renderToString.ts`
- Mithril mount/redraw: `api/mount-redraw.ts`

## Research Notes

### How Other Frameworks Handle Fine-Grained Reactivity

**Preact Signals:**
- Uses component re-renders via `setState` integration
- Components subscribe to signals during render
- Only subscribing components re-render (still uses VDOM diffing)
- Can bypass VDOM for direct signal-to-DOM bindings

**SolidJS:**
- No VDOM - direct DOM updates
- Expressions subscribe to signals
- Updates DOM nodes directly when signals change
- Most performant approach, but requires different architecture

**Key Insight:**
- Component-level redraws (PR #3036) were a reference example
- Need to decide: component re-renders (Preact) vs direct DOM updates (SolidJS)
- Initial implementation will use component-level redraws, evaluate direct DOM updates later
