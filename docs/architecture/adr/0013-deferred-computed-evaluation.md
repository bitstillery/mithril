# ADR-0013: Deferred Computed Property Evaluation

**Status**: Proposed  
**Date**: 2025-02-12  
**Related ADRs**:

- [ADR-0002](./0002-signals-implementation.md) (Custom Signals Implementation)
- [ADR-0012](./0012-mithril-signals-store-ssr-architecture.md) (Mithril Signals, Store, and SSR Architecture Overview)

## Context

Computed properties in Mithril's signal state are created from function properties (or getters) and are evaluated **lazily** on first property access. The compute function often closes over application globals such as:

- The global state store (`$s`)
- Context objects (e.g. `ContextProvider` instances)
- Other application-specific singletons or routing state

If the first access to a computed property happens before these dependencies are ready—for example during module load, before `store.load()` completes, or before a context is fully initialized—the compute function runs in an incomplete environment and can throw, return wrong data, or cause subtle bugs.

**Problem**: There is no way to tell the state layer "do not evaluate computeds yet; I will signal when the application is ready." Consumers need a way to create state with computeds that depend on not-yet-available globals and to enable evaluation only after a readiness step (e.g. after `store.load()`, after route/context setup).

## Decision

We will support **deferred computed evaluation** via an optional state-level gate:

1. **State option**: `state(initial, name?, options?)` accepts `options?: { deferComputed?: boolean }`. When `deferComputed: true`, computed properties are created but their compute functions are not run until the gate is opened.

2. **Gated evaluation**: For state created with `deferComputed: true`, each computed is wrapped so that until the gate is opened, reading the property returns `undefined` and does not execute the real compute (so no dependency tracking and no access to unready globals).

3. **Explicit readiness**: The state proxy exposes a method (e.g. `allowComputed()` or `ready()`) that:
   - Sets the "computed allowed" flag on that state and any nested state.
   - Marks all computeds in that state tree as dirty so the next property access runs the real compute.

4. **Signal API**: `ComputedSignal` gains a public way to be marked dirty (e.g. `markDirty()`) so the state layer can invalidate deferred computeds when the gate is opened.

Applications that need deferred computeds will:

- Create state with `state(initial, name, { deferComputed: true })`.
- After their setup is complete (e.g. after `store.load()`, after context/route is ready), call `stateInstance.allowComputed()` (or `store.ready()` when using the Store).

## Rationale

- **Explicit over implicit**: Readiness is under application control; no heuristics or timing assumptions.
- **Minimal API**: A single option and a single method; no new concepts for consumers who do not need deferral.
- **Compatible with existing behavior**: When `deferComputed` is not set (default), behavior is unchanged.
- **Fits Store and context**: Store can call `allowComputed()` on its state after `load()`; context providers can call it on their state after `onpageload` or when the context becomes active.

## Consequences

### Pros

- Computeds that depend on `$s`, context, or other app globals can be defined at state creation time without running before those globals exist.
- Clear lifecycle: create state → complete app/context setup → call `allowComputed()` → computeds evaluate on next access.
- No change for existing state that does not use `deferComputed`.

### Cons

- Until `allowComputed()` is called, deferred computeds read as `undefined`; this can be ambiguous if the real computed value is also `undefined`.
- Applications must remember to call `allowComputed()` (or `store.ready()`) at the right time; forgetting delays or prevents correct computed values.

### Risks

- Nested state and pre-initialization paths must consistently respect the same flag so that all computeds in a deferred state tree are gated.

## Alternatives Considered

- **Global "computed ready" switch**: A single global flag would affect all state; harder to scope to a specific store or context and more prone to ordering issues.
- **Return a sentinel instead of `undefined`**: Would allow distinguishing "not yet evaluated" from "evaluated to undefined" but adds API surface and sentinel-handling in the proxy; can be added later if needed.
- **Throw until ready**: Throwing when reading a deferred computed before `allowComputed()` would force handling but would break any code that touches state during init; returning `undefined` is safer for gradual adoption.

## Implementation Details

- **signal.ts**: Add a public method on `ComputedSignal` (e.g. `markDirty()`) that invokes the existing dirty-marking logic so the state layer can invalidate computeds when opening the gate.
- **state.ts**:
  - Add optional third parameter `options?: { deferComputed?: boolean }` to `state()`.
  - Store a flag on the state proxy (e.g. `__computedAllowed`), defaulting to `true` when not deferred, `false` when `deferComputed: true`.
  - When creating a computed for a deferred state, wrap the compute: if the flag is false, return `undefined` without running the real compute; otherwise run the real compute.
  - Implement `allowComputed()` on the state proxy: set the flag to `true` on this state and nested states, then walk all signal maps and call `markDirty()` on every `ComputedSignal`.
- **store.ts** (optional): Add `ready()` that calls `this.state.allowComputed()` so apps can do `store.load(...); store.ready();`.

## References

- Plan: Defer computed evaluation (Cursor plan)
- [state.ts](../../../state.ts) – state creation and proxy
- [signal.ts](../../../signal.ts) – ComputedSignal
