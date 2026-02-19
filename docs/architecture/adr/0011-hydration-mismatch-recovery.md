# ADR-0011: Hydration Mismatch Recovery

**Status**: Accepted  
**Date**: 2025-01-29  
**Related ADRs**: [ADR-0001](./0001-ssr-hydration.md) (SSR Hydration Support), [ADR-0004](./0004-ssr-state-serialization-signal-stores.md) (SSR State Serialization)

## Context

During SSR hydration, mismatches can occur between the server-rendered DOM and the client-side VDOM. These mismatches cause `Node.removeChild` errors when the hydration code attempts to remove DOM nodes that don't match the expected structure, leading to:

1. **Console errors**: `Node.removeChild: The node to be removed is not a child of this node`
2. **DOM inconsistencies**: Failed removals leave the DOM in an incorrect state
3. **Poor user experience**: Errors clutter the console and may cause visual glitches
4. **Cascading failures**: One mismatch can cause multiple subsequent errors

### Problem

**Current Behavior:**

1. **Hydration matching**: The code attempts to match server-rendered DOM nodes with client VDOM nodes
2. **Unmatched node removal**: When nodes don't match, the code tries to remove them
3. **Error on removal failure**: If a node was already removed or moved, `removeChild` throws an error
4. **No recovery**: Errors are caught and logged, but DOM manipulation fails silently, leaving inconsistent state

**Root Causes:**

- **Timing differences**: Async data loading can cause server/client render differences
- **Browser differences**: Text node normalization and whitespace handling vary
- **Component state differences**: Conditional rendering based on state that differs between server and client
- **Strict matching**: Current matching logic is too strict and doesn't handle common mismatch scenarios gracefully

### Expected Behavior

During hydration, the system should:

1. **Handle mismatches gracefully**: Don't throw errors when nodes can't be removed
2. **Recover automatically**: When mismatches occur, correct the DOM to match client VDOM
3. **Provide debugging info**: Log helpful context and statistics for developers
4. **Prevent cascading failures**: Stop error propagation when mismatches are severe

## Decision

We will implement a **client-authoritative hydration** approach with graceful degradation and automatic recovery mechanisms.

### Architecture Overview

The solution implements multiple layers of resilience:

1. **Resilient Node Removal**: Check if nodes exist before removal, handle errors gracefully
2. **Mismatch Tracking**: Count mismatches during hydration to detect severe cases
3. **Override Mode**: When mismatches exceed threshold, clear parent and re-render from client VDOM
4. **Enhanced Error Logging**: Provide actionable debugging information and statistics

### Key Design Principles

1. **Client VDOM is Authoritative**: When mismatches occur, trust the client-side VDOM over server-rendered DOM
2. **Graceful Recovery**: When node removal fails, skip it and continue hydration
3. **Fallback to Full Re-render**: For severe mismatches, clear parent and re-render from scratch
4. **Better Error Handling**: Improve error context and recovery strategies

## Rationale

This approach was chosen because:

1. **Follows industry patterns**: Similar to React's `suppressHydrationWarning`, Preact's mutative hydration, and Vue's `data-allow-mismatch`
2. **Minimal breaking changes**: Changes are internal to hydration logic, no component changes required
3. **Progressive degradation**: Handles minor mismatches gracefully, falls back for severe cases
4. **Developer-friendly**: Provides actionable debugging information without overwhelming console

### Alternatives Considered

**Option 1: Suppress All Errors**

- Just catch and ignore all removal errors
- **Rejected**: Hides real issues, doesn't fix root cause

**Option 2: Always Clear and Re-render**

- Never try to match, always clear parent on hydration
- **Rejected**: Loses benefits of hydration (preserving DOM state, scroll position, etc.)

**Option 3: Strict Matching Only**

- Fail fast on any mismatch, require perfect alignment
- **Rejected**: Too brittle, breaks on legitimate differences (whitespace, browser differences)

**Option 4: Component-Level Recovery**

- Require components to handle their own hydration mismatches
- **Rejected**: Too much burden on developers, error-prone

## Implementation Details

### 1. Resilient Node Removal

**File**: `render/render.ts` - `removeDOM` function

**Changes**:

- Check if node exists in parent before attempting removal using `parent.contains(node)`
- If node doesn't exist, skip removal silently (already removed)
- If removal fails for other reasons, log error but continue execution

**Code Pattern**:

```typescript
if (parent.contains && parent.contains(node)) {
    try {
        parent.removeChild(node)
    } catch (e) {
        // Check if node was already removed
        if (!parent.contains || !parent.contains(node)) {
            return // Skip silently
        }
        // Log error but continue
    }
}
```

### 2. Improved Child Cleanup

**File**: `render/render.ts` - `createElement` function

**Changes**:

- Verify nodes are still children before attempting removal
- Track hydration mismatches during cleanup
- Increment mismatch counter when removals fail

**Implementation**:

```typescript
if (element.contains && element.contains(node)) {
    try {
        element.removeChild(node)
        hydrationMismatchCount++
    } catch (e) {
        // Handle gracefully, track mismatch
    }
}
```

### 3. Hydration Mismatch Counter and Override Mode

**File**: `render/render.ts` - `render` function

**Changes**:

- Track mismatch count during hydration
- If mismatches exceed threshold (5), switch to override mode
- Override mode clears parent and re-renders from client VDOM

**Implementation**:

```typescript
let hydrationMismatchCount = 0
const MAX_HYDRATION_MISMATCHES = 5

// During hydration, increment counter on mismatches
// After processing nodes, check threshold
if (isHydrating && hydrationMismatchCount > MAX_HYDRATION_MISMATCHES) {
    // Clear and re-render from client VDOM
    dom.textContent = ''
    updateNodes(dom, null, normalized, hooks, null, ns, false)
}
```

### 4. More Lenient Node Matching

**File**: `render/render.ts` - `createText` and `createElement` functions

**Changes**:

- Text node matching handles whitespace differences (trimmed comparison)
- Element matching is case-insensitive
- Better handling of text nodes and comments during matching

**Text Node Matching**:

```typescript
// Normalize text for comparison (trim whitespace differences)
const expectedText = String(vnode.children || '').trim()
if (candidateValue === String(vnode.children) || (expectedText && candidateValue.trim() === expectedText)) {
    // Match found, reuse node
}
```

**Element Matching**:

```typescript
// Case-insensitive tag matching
if (candidateEl.tagName.toLowerCase() === tag.toLowerCase()) {
    // Match found, reuse element
}
```

### 5. Enhanced Error Logging

**File**: `util/ssr.ts` - `logHydrationError` function

**Changes**:

- Add recovery suggestions to error messages
- Track hydration statistics (total mismatches, per-component counts)
- Export `getHydrationStats()` and `resetHydrationStats()` for debugging
- Show top components with mismatches when errors are throttled

**New Functions**:

```typescript
export function getHydrationStats(): HydrationStats
export function resetHydrationStats(): void
```

**Statistics Tracking**:

- Total mismatches across all renders
- Per-component mismatch counts
- Last mismatch timestamp

## Consequences

### Pros

- **Resilient**: Handles DOM removal errors gracefully without breaking hydration
- **Automatic recovery**: Override mode prevents cascading failures
- **Better debugging**: Enhanced error context and statistics help identify root causes
- **Backward compatible**: No component changes required
- **Performance**: Minimal overhead (only checks when needed)
- **Industry-aligned**: Follows patterns from React, Preact, and Vue

### Cons

- **Complexity**: Adds complexity to hydration logic
- **Mismatch threshold**: Threshold value (5) is somewhat arbitrary, may need tuning
- **Override mode cost**: Full re-render in override mode loses some hydration benefits
- **Error suppression**: Some legitimate errors might be silently handled

### Risks

- **False sense of security**: Errors are handled, but root causes might not be fixed
- **Performance impact**: Override mode causes full re-render (should be rare)
- **Threshold tuning**: May need adjustment based on real-world usage
- **Edge cases**: Some edge cases might not be handled correctly

## Migration Path

**Phase 1: Core Resilience** (Completed)

1. ✅ Implement resilient node removal
2. ✅ Improve child cleanup logic
3. ✅ Add mismatch counter

**Phase 2: Recovery Mechanisms** (Completed)

1. ✅ Implement override mode
2. ✅ Enhance node matching logic
3. ✅ Improve error logging

**Phase 3: Monitoring and Tuning** (Future)

1. Monitor mismatch statistics in production
2. Tune threshold based on real-world data
3. Add optional strict mode for development

## Testing Strategy

1. **Unit Tests**:
    - Test `removeDOM` with nodes already removed
    - Test hydration with mismatched DOM structures
    - Test override mode activation

2. **Integration Tests**:
    - Test full hydration cycle with mismatches
    - Test recovery from various mismatch scenarios
    - Test that client VDOM correctly overrides server DOM

3. **Manual Testing**:
    - Test with real components (e.g., `DashboardOffersWidget`)
    - Verify no console errors during hydration
    - Verify DOM ends up in correct state

## Success Criteria

- ✅ No `removeChild` errors during hydration
- ✅ DOM ends up matching client VDOM correctly
- ✅ Hydration errors logged with actionable context
- ✅ Performance impact minimal (<5% overhead)
- ✅ Works with existing components without changes

## References

- [ADR-0001: SSR Hydration Support](./0001-ssr-hydration.md)
- [ADR-0004: SSR State Serialization](./0004-ssr-state-serialization-signal-stores.md)
- React `suppressHydrationWarning`: https://react.dev/reference/react-dom/client/hydrateRoot
- Preact Mutative Hydration: https://github.com/preactjs/preact/wiki/Understanding-Hydration-Mismatches
- Vue `data-allow-mismatch`: https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch

## Implementation Files

- `render/render.ts`: Core hydration logic improvements
- `util/ssr.ts`: Enhanced error logging and statistics
