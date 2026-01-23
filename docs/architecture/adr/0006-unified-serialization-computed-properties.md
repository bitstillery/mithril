# ADR-0006: Unified Serialization/Deserialization and Computed Property Restoration

**Status**: Proposed  
**Date**: 2025-01-23  
**Related ADRs**: [ADR-0004](./0004-ssr-state-serialization-signal-stores.md) (SSR state serialization), [ADR-0005](./0005-state-naming-and-store-persistence.md) (State naming and Store persistence)

## Context

ADR-0004 introduced SSR state serialization for signal stores, and ADR-0005 introduced the `Store` class for persistence. Currently, there are inconsistencies in how serialization/deserialization and computed properties are handled:

### Problem

**Current State:**

1. **Inconsistent deserialization mechanisms**:
   - Store's `load()` method uses a custom `updateState()` function
   - SSR uses `deserializeStore()` from `render/ssrState.ts`
   - Two different code paths for the same operation

2. **Computed properties not automatically restored**:
   - Regular `state()` instances: Computed properties (function properties) are lost after SSR deserialization
   - Store instances: Require manual `setupComputedProperties()` callback to restore computed properties
   - Computed properties must be manually re-setup after every deserialization

3. **State registry doesn't preserve initial state**:
   - Registry only stores the state instance, not the original initial state
   - No way to restore computed properties after deserialization
   - Computed properties must be manually tracked and restored

4. **Store and regular state instances use different mechanisms**:
   - Store has its own computed property restoration logic
   - Regular state instances have no automatic restoration
   - Inconsistent developer experience

### Expected Behavior

After implementation:

1. **Unified deserialization**: Store and SSR use the same `deserializeStore()` mechanism
2. **Automatic computed property restoration**: Computed properties are automatically restored after deserialization for both regular `state()` instances and Store instances
3. **No manual setup required**: Computed properties "just work" after SSR deserialization
4. **Consistent mechanism**: Both Store and regular state instances use the same restoration mechanism

## Decision

We will unify serialization/deserialization mechanisms and implement automatic computed property restoration:

1. **Unify Store deserialization**: Replace Store's custom `updateState()` with `deserializeStore()` from `render/ssrState.ts`
2. **Store initial state in registry**: Modify state registry to store both state instance and original initial state (with computed properties)
3. **Auto-restore computed properties**: After `deserializeAllStates()` completes, automatically restore computed properties from stored initial states
4. **Store uses same mechanism**: Store's `load()` updates registry with merged templates, allowing unified restoration

### Architecture Overview

**State Registry Enhancement:**

- Change registry from `Map<string, State>` to `Map<string, {state: State, initial: any}>`
- Store original initial state (with function properties) when `state()` is called
- Store merged templates (with function properties) when Store's `load()` is called

**Unified Deserialization:**

- Store's `load()` uses `deserializeStore()` instead of custom `updateState()`
- Same mechanism for Store and SSR deserialization
- Consistent handling of signals, nested states, arrays, and computed properties

**Computed Property Restoration:**

- After `deserializeAllStates()` completes, iterate through all registered states
- Restore function properties from stored initial states
- State proxy automatically converts functions to ComputedSignal instances
- Works for both regular `state()` instances and Store instances

### Key Design Decisions

**1. Registry Structure Change**

- **Before**: `Map<string, State>` - Only stores state instance
- **After**: `Map<string, {state: State, initial: any}>` - Stores both state and initial state
- **Rationale**: Need to preserve original initial state (with computed properties) for restoration
- **Impact**: Breaking change, but acceptable since API is new and only used in tests/examples

**2. Unified Deserialization**

- Store's `load()` uses `deserializeStore()` instead of custom `updateState()`
- Same code path for Store and SSR deserialization
- **Rationale**: Consistency, maintainability, single source of truth
- **Impact**: Store's deserialization now uses proven SSR mechanism

**3. Automatic Computed Property Restoration**

- After `deserializeAllStates()`, automatically restore computed properties
- Extract function properties from stored initial states
- Set them on state instances (proxy converts to ComputedSignal)
- **Rationale**: No manual setup required, consistent behavior
- **Impact**: Computed properties "just work" after deserialization

**4. Store Merges Templates into Registry**

- When Store's `load()` is called, merge templates (persistent, volatile, session)
- Update registry entry with merged templates as "initial" state
- Allows Store to use same restoration mechanism as regular state instances
- **Rationale**: Unified mechanism, no special cases
- **Impact**: Store computed properties restored automatically like regular state instances

## Rationale

### Why Unify Deserialization Mechanisms

1. **Consistency**: Same code path for Store and SSR ensures identical behavior
2. **Maintainability**: Single implementation to maintain and test
3. **Reliability**: Proven SSR mechanism used for Store deserialization
4. **Simplicity**: No need to maintain two different deserialization implementations

### Why Store Initial State in Registry

1. **Preservation**: Original initial state (with computed properties) is preserved
2. **Restoration**: Can restore computed properties after deserialization
3. **Unified mechanism**: Same approach for regular state instances and Store instances
4. **Simplicity**: No need for separate tracking of computed properties

### Why Automatic Restoration

1. **Developer experience**: Computed properties "just work" without manual setup
2. **Consistency**: Same behavior for regular state instances and Store instances
3. **Reliability**: Automatic restoration ensures computed properties are always available
4. **Simplicity**: No need for `setupComputedProperties()` callback

### Why Store Updates Registry

1. **Unified mechanism**: Store uses same restoration mechanism as regular state instances
2. **Consistency**: No special cases or different code paths
3. **Simplicity**: Single restoration logic handles all state instances
4. **Reliability**: Proven mechanism used for all state types

## Consequences

### Pros

- **Unified mechanism**: Store and SSR use same serialization/deserialization code
- **Automatic restoration**: Computed properties automatically restored after deserialization
- **Consistent behavior**: Same mechanism for regular state instances and Store instances
- **Better developer experience**: No manual setup required for computed properties
- **Maintainability**: Single implementation to maintain and test
- **Reliability**: Proven SSR mechanism used for Store deserialization

### Cons

- **Breaking change**: Registry structure change breaks existing code (but acceptable since API is new)
- **Memory overhead**: Storing initial states in registry uses additional memory
- **Complexity**: Registry structure is more complex (but provides better functionality)

### Risks

- **Registry structure change**: Need to update all code that uses `getRegisteredStates()`
- **Nested computed properties**: Need to ensure restoration handles nested computed properties correctly
- **Store load() timing**: Need to ensure registry is updated at correct time
- **Edge cases**: Multiple `load()` calls, computed properties referencing other computed properties

## Alternatives Considered

**Option A: Keep separate mechanisms**

- **Rejected**: Inconsistent behavior, duplicate code, harder to maintain
- **Rationale**: Unification provides better consistency and maintainability

**Option B: Manual computed property restoration**

- **Rejected**: Requires `setupComputedProperties()` callback, inconsistent developer experience
- **Rationale**: Automatic restoration provides better developer experience

**Option C: Store computed properties separately**

- **Rejected**: Additional complexity, separate tracking mechanism needed
- **Rationale**: Storing in registry provides unified mechanism

**Option D: Unified mechanism with automatic restoration (Chosen)**

- **Chosen**: Consistent behavior, automatic restoration, unified mechanism
- **Rationale**: Best developer experience and maintainability

## Implementation Details

### Phase 1: Update State Registry

**File**: `state.ts`

1. Change registry structure: `Map<string, {state: State, initial: any}>`
2. Update `registerState()` to accept and store initial state
3. Update `state()` to pass initial state to `registerState()`
4. Add `updateStateRegistry()` helper for Store to update registry entry
5. Update `getRegisteredStates()` to return registry entries (or provide backward-compatible wrapper)

### Phase 2: Unify Store Deserialization

**File**: `store.ts`

1. Replace `updateState()` with `deserializeStore()` from `render/ssrState.ts`
2. Merge templates (persistent, volatile, session) before deserialization
3. Update registry entry with merged templates as "initial" state
4. Use `deserializeStore()` for core deserialization

### Phase 3: Auto-Restore Computed Properties

**File**: `render/ssrState.ts`

1. Create `restoreComputedProperties(state, initial)` helper function
2. Extract function properties from initial state recursively
3. Set function properties on state instance (proxy converts to ComputedSignal)
4. Update `deserializeAllStates()` to restore computed properties after deserialization

### Phase 4: Update Tests and Examples

**Files**: `tests/**/*.test.ts`, `examples/**/*.ts`

1. Update tests to handle new registry structure
2. Update examples to remove `setupComputedProperties()` calls
3. Add tests for computed property restoration
4. Add tests for Store computed property restoration

## Related ADRs

- [ADR-0004](./0004-ssr-state-serialization-signal-stores.md) - Introduced SSR state serialization, now being unified with Store
- [ADR-0005](./0005-state-naming-and-store-persistence.md) - Introduced Store class, now using unified deserialization mechanism

## References

- State implementation: `mithril/state.ts`
- Store implementation: `mithril/store.ts`
- SSR serialization: `mithril/render/ssrState.ts`
- SSR example: `examples/ssr/`
