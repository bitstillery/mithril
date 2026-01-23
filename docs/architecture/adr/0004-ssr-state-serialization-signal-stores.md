# ADR-0004: SSR State Serialization for Signal Stores

**Status**: Proposed  
**Date**: 2025-01-23  
**Related ADRs**: [ADR-0001](./0001-ssr-hydration.md) (SSR hydration support), [ADR-0002](./0002-signals-implementation.md) (Signals implementation)

## Context

ADR-0001 describes a generic state serialization approach for SSR hydration, but it was designed for proxy-based stores. We now have a signal-based `store()` API (from ADR-0002) that uses a Proxy wrapper around signals (inspired by deepsignal). We need to implement SSR state serialization specifically for this signal store architecture.

### Problem

**Current Behavior:**

1. **Server-side rendering (SSR)**:
   - `renderToString` calls `oninit` with `waitFor` parameter
   - Components populate signal stores during `oninit`
   - Server renders HTML with loaded data
   - HTML sent to client includes the rendered data

2. **Client-side hydration**:
   - `oninit` is skipped during hydration (correct, per ADR-0001)
   - However, signal store state is **not restored**
   - Components show empty/initial state instead of SSR-rendered data
   - Example: Component shows "No data" even though server rendered "Data loaded from server!"

**Root Cause:**

- Signal stores are created fresh on client with initial values
- No mechanism to serialize store state from server and restore it on client
- Stores can be module-level (shared across component instances) or global (not bound to components)
- Need a generic solution that works for both component-bound and global stores

### Expected Behavior

During hydration, signal stores should:
1. **Preserve SSR state**: Store values populated on server should be restored on client
2. **Work generically**: Support both component-bound stores and global stores
3. **Handle nested stores**: Recursively serialize/deserialize nested store structures
4. **Skip computed signals**: ComputedSignal instances are functions and should be recreated on client

## Decision

We will implement a **state serialization system** specifically designed for signal stores that:

1. **Requires explicit naming**: All stores must have a name parameter for SSR serialization
2. **Auto-registers stores**: Stores register themselves internally when created (if name provided)
3. **Serializes signal values**: Extracts `.value` from signals in `__signalMap`, skipping ComputedSignal
4. **Handles nested stores**: Recursively serializes/deserializes nested store structures
5. **Injects state into HTML**: Serialized state embedded in `<script id="__SSR_STATE__">` tag
6. **Restores before hydration**: State restored on client before component mounting

### Architecture Overview

The solution consists of:

1. **Store API Enhancement**: `store()` function accepts required `name` parameter
2. **State Registry**: Internal registry tracks stores by name for serialization
3. **Serialization Module**: `render/ssrState.ts` handles serialization/deserialization
4. **SSR Integration**: `renderToString` returns serialized state along with HTML
5. **Client Integration**: Client reads and restores state before mounting

### Key Design Decisions

**1. Explicit Naming (Required)**

- `store(initial, name)` - `name` parameter is **required**
- If `name` is not provided, `store()` throws an error
- Ensures consistent keys on server and client
- Prevents silent failures and naming collisions
- Simple and unambiguous API

**2. Auto-Registration**

- Stores register themselves internally when created
- No manual `registerState()` calls needed
- Registration happens automatically via `store()` function
- Same name on server and client ensures matching

**3. Signal Value Extraction**

- Access `store.__signalMap` directly (bypasses proxy)
- Extract `.value` from each Signal
- Skip ComputedSignal instances (they're functions, recreated on client)
- Handle nested stores recursively via `__isStore` flag

**4. Nested Store Support**

- Stores can contain nested stores (e.g., `store({user: {name: 'John'}})`)
- Recursively serialize/deserialize nested structures
- Preserve structure in serialized output
- Nested stores are a primary use case, not an edge case

## Rationale

### Why Explicit Naming

1. **Consistency**: Same name on server and client ensures reliable matching
2. **Simplicity**: No complex auto-detection logic needed
3. **Clarity**: Developer explicitly controls store identification
4. **Prevents issues**: Throwing error for missing name prevents silent failures
5. **Fail-fast**: Error at store creation time, not during SSR serialization

### Why Auto-Registration

1. **Developer experience**: No manual registration calls needed
2. **Consistency**: Stores always registered when created
3. **Less error-prone**: Can't forget to register a store
4. **Clean API**: Registration is an implementation detail

### Why Signal Value Extraction

1. **Proxy structure**: Stores are Proxy objects wrapping signals
2. **Direct access**: `__signalMap` provides direct access to signals (bypasses proxy)
3. **Computed signals**: ComputedSignal instances are functions, can't be serialized
4. **Nested stores**: Recursive handling needed for nested structures

### Why Nested Store Support

1. **Used in codebase**: Nested stores are actively used
2. **Store implementation**: Automatically creates nested stores for nested objects
3. **Completeness**: Must handle all store structures properly

## Consequences

### Pros

- **Generic solution**: Works with any signal store automatically
- **Simple API**: Explicit naming is clear and unambiguous
- **No component changes**: Components don't need to know about serialization
- **State preservation**: Both component-bound and global state preserved
- **Nested support**: Handles complex store structures
- **Future-proof**: Works seamlessly with signals architecture

### Cons

- **Required naming**: All stores must have names (but this is a new API, no legacy code)
- **Strict API**: Missing name throws error (fail-fast approach)
- **Implementation complexity**: Requires state registry and serialization system
- **Bundle size**: Adds serialization/deserialization code
- **State size**: Serialized state increases HTML size

### Risks

- **State synchronization**: Must ensure state is restored before component initialization
- **Name collisions**: Multiple stores with same name (mitigated by requiring explicit names)
- **Circular references**: Need to handle circular references in nested stores
- **Performance**: Serialization/deserialization adds overhead (minimal)

## Alternatives Considered

**Option 1: Optional Naming**

- `store(initial, name?)` - name optional
- Stores without names work normally, just no SSR support
- **Rejected**: Causes issues later - unclear which stores are SSR-enabled, potential silent failures, inconsistent behavior

**Option 2: Auto-Detection**

- Auto-generate names from component class names
- Use hash of store structure as key
- **Rejected**: Brittle (structure can change), name collisions, complex implementation

**Option 3: Manual Registration**

- Require explicit `registerState(name, store)` calls
- **Rejected**: More boilerplate, error-prone, less clean API

**Option 4: Hash-Based Keys**

- Use hash of serialized state as key
- **Rejected**: State changes between server/client, hash would differ, stores wouldn't match

## Implementation Details

### Store API

```typescript
store<T>(initial: T, name: string): Store<T>
```

- `name` parameter is **required**
- If `name` is not provided or is empty, `store()` throws an error
- Store registers itself internally with the provided name
- Registration happens automatically when store is created

### State Registry (`render/ssrState.ts`)

**Registry:**
- Internal Map tracking stores by name
- Stores register themselves when created (after name validation)
- `getRegisteredStates()`: Get all registered stores
- `clearRegistry()`: Clear registry after serialization

**Serialization:**
- `serializeStore(store)`: Extract signal values from store
  - Access `store.__signalMap` to get all signals
  - Skip ComputedSignal instances
  - Get `.value` from each Signal
  - Recursively serialize nested stores
- `serializeAllStates()`: Serialize all registered stores
  - Returns `Record<string, any>` mapping names to serialized state

**Deserialization:**
- `deserializeStore(store, serialized)`: Restore signal values into store
  - Access `store.__signalMap` to check existing signals
  - Set `signal.value = serialized[key]` for existing signals
  - Use `store[key] = value` for new signals (proxy setter creates signal)
  - Recursively deserialize nested stores
- `deserializeAllStates(serialized)`: Restore all states
  - Requires stores to be registered with same names on client

### SSR Integration

**Server-side (`render/renderToString.ts`):**
- After final render pass, call `serializeAllStates()`
- Return both HTML and serialized state
- Return type: `Promise<{html: string, state: Record<string, any>}>`

**Server-side (`examples/ssr/server.ts`):**
- Extract serialized state from `renderToString` result
- Inject into HTML: `<script id="__SSR_STATE__" type="application/json">${JSON.stringify(state)}</script>`

**Client-side (`examples/ssr/client.tsx`):**
- Before `m.route()` or `m.mount()`, read `__SSR_STATE__` script tag
- Stores are already registered (auto-registered when modules load)
- Call `deserializeAllStates()` to restore state
- Then proceed with normal mounting

### Component Usage

```typescript
// Module-level store
const state = store({
  loading: false,
  data: undefined
}, 'AsyncData.state')

// Global store
const globalStore = store({
  user: null
}, 'globalStore')

// Component instance store
export class MyComponent {
  state = store({
    items: []
  }, 'MyComponent.state')
}
```

### Serialization Details

**Store Structure (Proxy-based):**
- `store.__isStore === true`: Identifies store objects
- `store.__signalMap`: `Map<string, Signal | ComputedSignal>` containing all signals
- `store.property`: Returns signal value (via proxy getter)
- `store.$property`: Returns raw Signal object (deepsignal-style)

**Signal Extraction:**
- Access `store.__signalMap` directly (bypasses proxy)
- For each entry in `__signalMap`:
  - Skip if signal is `ComputedSignal` instance
  - Get `.value` from Signal
  - If value is a store (`value.__isStore === true`), recursively serialize
  - If value is an array, serialize each element

**Nested Stores:**
- When serializing a signal value, check if `value.__isStore === true`
- If nested store, recursively call `serializeStore(value)`
- Preserve structure in serialized output

**Computed Signals:**
- ComputedSignal instances are detected via `instanceof ComputedSignal`
- Skipped from serialization (they're functions/computed, recreated on client)
- Recreated on client when accessed via proxy getter

## Testing Strategy

1. Test serialization of simple store
2. Test serialization of nested stores (primary use case)
3. Test serialization of stores with arrays
4. Test deserialization restores values correctly (including nested stores)
5. Test SSR → hydration preserves state
6. Test navigation still works (stores not restored on navigation)
7. Test computed signals are skipped
8. Test circular reference handling
9. Test missing name throws error (store creation fails)
10. Test empty name throws error (store creation fails)
11. Test name collision detection (development warning)

## Migration Path

1. **Phase 1**: Implement core serialization/deserialization (`render/ssrState.ts`)
2. **Phase 2**: Update `store.ts` to accept required `name` parameter and auto-register
3. **Phase 3**: Update `renderToString` to return serialized state
4. **Phase 4**: Update server to inject state into HTML
5. **Phase 5**: Update client to restore state before mounting
6. **Phase 6**: Update example component to use named stores
7. **Phase 7**: Test and refine

## References

- ADR-0001: SSR Hydration Support
- ADR-0002: Custom Signals Implementation
- Mithril SSR implementation: `render/renderToString.ts`
- Mithril store implementation: `store.ts`
- Signal implementation: `signal.ts`
