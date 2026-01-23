# ADR-0005: State Naming and Store Persistence

**Status**: Proposed  
**Date**: 2025-01-23  
**Related ADRs**: [ADR-0002](./0002-signals-implementation.md) (Signals implementation), [ADR-0004](./0004-ssr-state-serialization-signal-stores.md) (SSR state serialization)

## Context

Mithril currently provides a `store()` function (from ADR-0002) that creates reactive state objects using signals. The function name "store" is somewhat ambiguous - it could refer to the reactive primitive itself or a persistence mechanism. Additionally, Mithril lacks built-in persistence functionality for state management.

### Problem

**Current State:**

1. **Naming ambiguity**: The `store()` function name doesn't clearly distinguish between:
   - The reactive primitive (creating reactive state objects)
   - A persistence mechanism (saving/loading state)
   
2. **No persistence layer**: Mithril has no built-in way to:
   - Persist state to localStorage/sessionStorage
   - Restore state on application initialization
   - Manage persistent vs volatile vs session state
   - Clean up stale cached data

3. **No watch API**: While Signal class has a `watch()` method, there's no convenient top-level `watch()` function for subscribing to signal changes.

4. **File organization**: The current `store.ts` file mixes concerns - it contains the reactive primitive but could also contain persistence logic.

### Expected Behavior

After refactoring:

1. **Clear naming**: `state()` function clearly indicates it's the reactive primitive
2. **Persistence support**: `Store` class provides load/save/blueprint functionality
3. **Convenient watch API**: Top-level `watch()` function for signal subscriptions
4. **Better organization**: Separate files for reactive primitive (`state.ts`) and persistence (`store.ts`)

## Decision

We will refactor Mithril's state management to improve naming clarity and add persistence functionality:

1. **Rename `store()` to `state()`** - Better, more descriptive name for the reactive primitive
2. **Rename `store.ts` to `state.ts`** - File contains the reactive primitive
3. **Create new `store.ts`** - Contains `Store` class with persistence functionality
4. **Add `watch()` function** - Convenient API for watching signals: `watch(signal, callback)`
5. **Rename related types and functions** - `Store<T>` → `State<T>`, `registerStore()` → `registerState()`, etc.

### Architecture Overview

**File Structure:**

```
mithril/
├── state.ts          # Reactive primitive: state() function and watch()
├── store.ts          # Persistence wrapper: Store class
├── signal.ts         # Signal primitives (no changes)
└── ...
```

**API Changes:**

- `store(initial, name)` → `state(initial, name)` - Reactive primitive
- `Store<T>` type → `State<T>` type - Type for state() return value
- New `Store` class - Persistence wrapper that wraps `state()`
- New `watch()` function - Signal subscription helper

### Key Design Decisions

**1. Naming: `state()` vs `store()`**

- `state()` clearly indicates reactive state creation
- More intuitive and descriptive than "store" or "proxy"
- `Store` class name reserved for persistence wrapper
- Clear separation: `state()` = reactive primitive, `Store` = persistence

**2. File Organization**

- `state.ts` - Contains reactive primitive (`state()` function)
- `store.ts` - Contains persistence wrapper (`Store` class)
- Clear separation of concerns

**3. Store Class Design**

- Wraps `state()` internally for reactivity
- Provides `load()`, `save()`, `blueprint()` methods
- Handles localStorage/sessionStorage
- Supports persistent/volatile/session state templates
- Includes lookup TTL cleanup

**4. Watch Function**

- Simple API: `watch(signal, callback)`
- Only accepts Signal instances (not objects)
- Returns unsubscribe function
- Wraps Signal's existing `watch()` method

## Rationale

### Why Rename `store()` to `state()`

1. **Clarity**: "state" is more descriptive than "store" for reactive state
2. **Intuitive**: Developers immediately understand `state()` creates reactive state
3. **Consistency**: Aligns with common terminology in reactive frameworks
4. **Separation**: Clear distinction between reactive primitive (`state()`) and persistence (`Store`)

### Why Separate Files

1. **Single responsibility**: Each file has one clear purpose
2. **Better organization**: Easier to find and maintain code
3. **Clearer imports**: Import `state` from `state.ts`, `Store` from `store.ts`
4. **Scalability**: Easier to extend either primitive or persistence independently

### Why Store Class

1. **Persistence needs**: Many applications need localStorage/sessionStorage persistence
2. **Common pattern**: Load/save/blueprint pattern is widely used
3. **Template-based**: Persistent/volatile/session separation is useful
4. **Lookup cleanup**: TTL-based cleanup prevents stale data accumulation

### Why Watch Function

1. **Convenience**: Top-level function easier to use than `signal.watch()`
2. **Consistency**: Matches common reactive framework patterns
3. **Simplicity**: Single API for signal subscriptions
4. **Discoverability**: Easier to find than Signal class method

## Consequences

### Pros

- **Better naming**: `state()` is clearer than `store()` for reactive primitive
- **Persistence support**: Built-in load/save functionality
- **Clear separation**: Reactive primitive vs persistence wrapper
- **Better organization**: Separate files for different concerns
- **Convenient API**: `watch()` function for signal subscriptions
- **Type clarity**: `State<T>` vs `Store` class - no naming conflict

### Cons

- **Breaking change**: All code using `store()` must migrate to `state()`
- **File renames**: Tests, examples, and imports need updates
- **SSR updates**: SSR serialization functions need renaming
- **Documentation**: All docs need updates

### Risks

- **Migration effort**: Significant refactoring across codebase
- **Import updates**: Many files need import statement changes
- **Test updates**: All tests need updates
- **Example updates**: Examples need updates
- **Documentation**: Documentation needs comprehensive updates

## Alternatives Considered

**Option A: Keep `store()` name, add `Store` class**

- **Rejected**: Naming conflict - `store()` function and `Store` class confusing
- **Rejected**: "store" name ambiguous for reactive primitive

**Option B: Rename to `proxy()`**

- **Rejected**: "proxy" is too technical, not descriptive
- **Rejected**: Doesn't clearly indicate reactive state

**Option C: Rename to `state()`, keep single file**

- **Rejected**: Mixing reactive primitive and persistence in one file
- **Rejected**: Less clear organization

**Option D: Rename to `state()`, separate files (Chosen)**

- **Chosen**: Clear naming, good organization, no conflicts
- **Chosen**: Best separation of concerns

## Implementation Details

### Phase 1: Rename `store()` to `state()`

1. Rename `store.ts` → `state.ts`
2. Rename `store()` function → `state()`
3. Rename `Store<T>` type → `State<T>`
4. Update internal references:
   - `isStore` → `isState`
   - `storeCache` → `stateCache`
   - `registerStore()` → `registerState()`
   - `getRegisteredStores()` → `getRegisteredStates()`
   - `clearStoreRegistry()` → `clearStateRegistry()`
5. Rename test directory: `tests/store/` → `tests/state/`
6. Rename test file: `test-store.test.ts` → `test-state.test.ts`
7. Rename example directory: `examples/store/` → `examples/state/`
8. Rename example files: `store.ts` → `state.ts`, `store_debugger.tsx` → `state_debugger.tsx`
9. Update all imports across codebase
10. Update SSR serialization function names

### Phase 2: Create Store Class

**New file**: `mithril/store.ts`

```typescript
import {state, State} from './state'

export class Store<T extends Record<string, any>> {
    private stateInstance: State<T>
    private templates: {
        persistent: Partial<T>
        volatile: Partial<T>
        session: Partial<T>
    }
    private lookup_verify_interval: number | null
    private lookup_ttl: number
    
    constructor(options?: {lookup_ttl?: number})
    
    get state(): State<T>
    load(persistent: Partial<T>, volatile: Partial<T>, session?: Partial<T>): void
    save(): void
    blueprint(state: T, template: Partial<T>): Partial<T>
    clean_lookup(): void
    get(key: string): string
    get_session_storage(key: string): string
    set(key: string, item: object): void
    set_session(key: string, item: object): void
}
```

**Implementation:**

- `load()`: Restore from localStorage/sessionStorage, merge with templates, update state
- `save()`: Extract persistent/session data using blueprint, save to storage
- `blueprint()`: Deep merge only keys present in template (special handling for 'lookup' key)
- `clean_lookup()`: Remove outdated lookup entries based on TTL

### Phase 3: Add watch() Function

**File**: `mithril/state.ts`

```typescript
export function watch<T>(
    signal: Signal<T> | ComputedSignal<T>,
    callback: (newValue: T, oldValue: T) => void
): () => void {
    return signal.watch(callback)
}
```

### Phase 4: Update Exports

**File**: `mithril/index.ts`

```typescript
// Export state() function and watch()
export {state, watch} from './state'
export type {State} from './state'

// Export Store class
export {Store} from './store'

// Keep SSR exports
export {serializeStore, deserializeStore, ...} from './render/ssrState'
```

## Related ADRs

- [ADR-0002](./0002-signals-implementation.md) - Introduced `store()` function, now being renamed to `state()`
- [ADR-0004](./0004-ssr-state-serialization-signal-stores.md) - SSR serialization for stores, needs updates for `state()` naming

## References

- Signal implementation: `mithril/signal.ts`
- Current store implementation: `mithril/store.ts` (to be renamed to `state.ts`)
- SSR serialization: `mithril/render/ssrState.ts`
