# ADR-0001: SSR Hydration Support

**Status**: Accepted  
**Date**: 2025-01-XX  
**Related ADRs**: [ADR-0002](./0002-signals-implementation.md) (Signals implementation builds on this)

## Context

Mithril supports Server-Side Rendering (SSR) via `m.renderToString()`, which renders components to HTML on the server. However, when the client hydrates this HTML, components re-run their `oninit` lifecycle hooks, causing component state to be reset and losing the SSR-rendered data.

### Problem

**Current Behavior:**

1. **Server-side rendering (SSR)**:
   - `renderToString` calls `oninit` with `waitFor` parameter
   - Promises are tracked and awaited before final render
   - Server renders HTML with loaded data
   - HTML sent to client includes the rendered data

2. **Client-side hydration**:
   - `m.mount()` calls `render()` which calls `initComponent()`
   - `initComponent()` calls `initLifecycle()` which calls `oninit` again
   - `oninit` is called WITHOUT `waitFor` parameter on client
   - Component state is reinitialized, losing SSR data
   - Component shows "Loading..." even though DOM already has the data

**Root Cause:**

The issue is in `render.ts`: when mounting to an element, if `dom.vnodes == null`, it clears `textContent`. However, there's no hydration detection mechanism. During hydration:
- DOM already contains SSR-rendered HTML
- `oninit` is called again, resetting component state
- Component re-renders with initial state, overwriting SSR content

### Expected Behavior

During hydration, components should:
1. **Preserve SSR state**: If data was loaded on server, don't refetch on client
2. **Detect hydration**: Skip or modify `oninit` behavior when DOM already has content
3. **Only refetch on navigation**: Only reload data when user navigates to the route

## Decision

We will implement a **generic state serialization approach** with hydration detection that works with the proxy-based state system.

### Architecture Overview

The solution uses a **state serialization registry** that works generically with:
- Global state (`$s` - single unified store)
- Component-level proxy state (`this.data = proxy({...})`)
- CollectionProxy instances (`CollectionProxy.state`)
- Future signals support (signals with proxy store)

### Key Design Principles

1. **State Registry**: Track all proxy objects that need hydration
2. **SSR Serialization**: Serialize state to JSON in `<script id="__SSR_STATE__">` tag
3. **Hydration Detection**: Detect when mounting to existing DOM
4. **State Restoration**: Restore state before component initialization
5. **Generic API**: Works with any proxy object without component changes

## Rationale

This approach was chosen because:

1. **Generic**: Works with any proxy object automatically
2. **No component changes**: Components don't need to know about hydration
3. **State preservation**: Both global and component state preserved
4. **Simple**: Skip `oninit` during hydration, state already restored
5. **Future-proof**: Works seamlessly with signals when added (see ADR-0002)

### Alternatives Considered

**Option 1: Component-Level Solution**
- Modify components to detect hydration themselves
- **Rejected**: Requires changes to every component, error-prone

**Option 2: State Serialization Only**
- Serialize state but still call `oninit`
- **Rejected**: Components would still refetch data unnecessarily

**Option 3: New `onhydrate` Hook**
- Add separate lifecycle hook for hydration
- **Rejected**: Adds complexity, most components don't need special hydration logic

## Implementation Details

### 1. State Serialization System

**New file: `render/ssrState.ts`**

- `registerState(key: string, state: any)`: Register proxy state for serialization
- `serializeState()`: Convert all registered states to JSON
- `deserializeState(json: string)`: Restore states from JSON
- Works with nested proxy objects
- **Skips computed properties**: Properties starting with `_` are excluded from serialization (functions reinitialized on client)

**Integration points:**
- `renderToString`: Call `serializeState()` after rendering
- `server.ts`: Inject serialized state into HTML template
- `mount.ts`: Call `deserializeState()` before mounting

### 2. Hydration Detection

**`render/render.ts` modifications:**

- Check if `dom` has children before clearing
- If children exist AND `dom.vnodes == null`, we're hydrating
- Pass `isHydrating: boolean` flag through render pipeline
- Skip `oninit` during hydration (state already restored from serialization)

### 3. Component State Registration

**Helper utility: `common/lib/ssr.ts`**

```typescript
export function registerComponentState(component: any, stateKey: string, state: any) {
  // Register component state for SSR serialization
  // Automatically called when component uses proxy()
}
```

**Automatic registration:**
- Wrap `proxy()` function to auto-register on server
- Or provide `ssrProxy()` wrapper that registers state
- Components opt-in by using `ssrProxy()` instead of `proxy()`

### 4. Global State Integration

**`common/app.ts` modifications:**

- After `store.load()`, register the unified global store `$s` for SSR
- Serialize `$s` (which contains all persistent, volatile, session data)
- Restore `$s` before component initialization
- Computed properties (starting with `_`) are excluded and reinitialized on client

### 5. Lifecycle Hook Enhancement

**Approach: Skip `oninit` during hydration**

- Detect hydration in `initLifecycle()`
- Skip calling `oninit` if `isHydrating === true`
- State already restored from serialization

### Component Usage (No Changes Required)

Components continue to work as-is:

```typescript
export class MyComponent {
  data = proxy({ loading: true, items: [] })
  
  async oninit() {
    // This will be skipped during hydration
    // State already restored from SSR
    this.data.items = await fetchItems()
    this.data.loading = false
  }
}
```

**For opt-in explicit registration:**

```typescript
import {ssrProxy} from '@bitstillery/common/lib/ssr'

export class MyComponent {
  data = ssrProxy('my-component', { loading: true, items: [] })
  // Automatically registered for SSR serialization
}
```

### Global State Usage

Single global store (`$s`) automatically serialized:

```typescript
// In app.ts
store.load(saved, temporary, tab)
// $s is the unified store containing all state
// Only $s needs to be registered for SSR
registerState('$s', $s)
```

**Computed properties handling:**

- Properties starting with `_` are computed functions (e.g., `_total`, `_filteredItems`)
- These are **excluded** from serialization
- Reinitialized on client when accessed (via proxy's computed cache)

### Serialization Details: Computed Properties

**Computed properties** (properties starting with `_`) are handled specially:

1. **Excluded from serialization**:
   - Properties like `_total`, `_filteredItems`, `_computed` are functions
   - These are not serialized (functions can't be JSON serialized anyway)
   - They're reinitialized on client when first accessed

2. **How it works**:
   ```typescript
   const state = proxy({
     items: [1, 2, 3],           // Serialized ✅
     loading: false,             // Serialized ✅
     _total: () => items.length,  // Excluded ❌ (computed function)
   })
   
   // On server: serialize { items: [1,2,3], loading: false }
   // On client: restore { items: [1,2,3], loading: false }
   // _total() reinitialized when accessed (via proxy's computed cache)
   ```

3. **Implementation**:
   - Serialization function checks property names
   - If property starts with `_`, skip it
   - On deserialization, computed properties remain undefined until accessed
   - Proxy's computed cache handles reinitialization automatically

### Special Considerations for CollectionProxy

**CollectionProxy** (`common/lib/collection.ts`) uses `proxy()` for its state:

```typescript
state: CollectionState = proxy({ loading: true, items: [], ... })
```

**Handling:**
- CollectionProxy instances can be registered like any proxy
- Serialize `state` property (the proxy object)
- Restore and reassign to `collection.state`
- CollectionProxy methods/transforms preserved (not serialized)

### Files to Modify

1. **New files**:
   - `render/ssrState.ts` - State registry and serialization
   - `common/lib/ssr.ts` - SSR utilities (optional `ssrProxy` wrapper)

2. **Modified files**:
   - `render/renderToString.ts` - Collect and return serialized state
   - `render/render.ts` - Hydration detection and skip `oninit`
   - `api/mount-redraw.ts` - Restore state before mounting
   - `examples/ssr/server.ts` - Inject state into HTML
   - `common/lib/proxy.ts` - Optional auto-registration
   - `common/app.ts` - Register global store `$s`

### Future Signals Support

**Signals compatibility:**

This approach will work seamlessly with signals when added (see ADR-0002):

- Signals store can be registered like any proxy object
- Signal values are serialized (just like proxy state)
- Signal subscriptions/computed values (if using `_` prefix) excluded from serialization
- Same hydration pattern: restore signal state, skip initialization during hydration

**Example (future with signals):**

```typescript
// Signals with proxy store
const signalStore = proxy({
  count: signal(0),
  _computed: signal(() => count() * 2), // Computed signal
})

// Automatically handled:
// - `count` signal value serialized
// - `_computed` excluded (reinitialized on client)
// - Signal subscriptions restored on hydration
```

## Consequences

### Pros

- **Generic solution**: Works with any proxy object automatically
- **No component changes**: Components don't need to know about hydration
- **State preservation**: Both global and component state preserved
- **Simple implementation**: Skip `oninit` during hydration, state already restored
- **Future-proof**: Works seamlessly with signals (see ADR-0002)
- **Computed properties**: Handled correctly (excluded from serialization)

### Cons

- **Implementation complexity**: Requires state registry and serialization system
- **Bundle size**: Adds serialization/deserialization code
- **State size**: Serialized state increases HTML size
- **Circular references**: Need to handle circular references in state

### Risks

- **State synchronization**: Must ensure state is restored before component initialization
- **Memory leaks**: State registry must be cleared after serialization
- **Performance**: Serialization/deserialization adds overhead (minimal)

## Migration Path

**Phase 1: Core Infrastructure**
1. Implement state registry and serialization
2. Add hydration detection
3. Skip `oninit` during hydration

**Phase 2: Auto-Registration**
1. Auto-register proxy objects created during SSR
2. Auto-register global store `$s`
3. Test with simple components
4. Verify computed properties (`_` prefix) are excluded

**Phase 3: Complex State**
1. Handle CollectionProxy
2. Handle nested proxy objects
3. Handle circular references

**Phase 4: Optimization**
1. Only serialize changed state
2. Compress serialized state
3. Lazy deserialization

## Testing Strategy

1. Test SSR renders data correctly
2. Test hydration preserves SSR data (no "Loading" flash)
3. Test navigation still triggers data fetch
4. Test components without SSR still work normally
5. Test computed properties are excluded from serialization
6. Test global state (`$s`) serialization and restoration
7. Test CollectionProxy state serialization

## References

- Mithril SSR implementation: `render/renderToString.ts`
- Mithril mount implementation: `mount.ts`
- Proxy system: `common/lib/proxy.ts`
- CollectionProxy: `common/lib/collection.ts`
