# Signal vDOM Path: Analysis and Non-Breaking Performance Recommendations

## 1. Does the Signal Component-Level Update Path Work as Intended?

**Short answer: Partially. It works for m.mount roots but not for nested components.**

### Current Flow ([api/mount-redraw.ts](api/mount-redraw.ts))

When a signal fires, `__redrawCallback` is invoked, which calls `m.redraw(component)` for each component in `getSignalComponents(signal)`. Then `redrawComponent` runs:

1. **componentToElement** (m.mount roots): If the component is an m.mount root, we do `render(element, Vnode(component, ...))` — a targeted redraw. This works.

2. **stateToDomMap** (nested/routed components): When the component is nested (e.g. TableRowWithSignal inside a route), we have `stateToDomMap.has(componentOrState)`. The current code **always does full sync** here:

    ```ts
    if (stateToDomMap && stateToDomMap.has(componentOrState)) {
        // For routed components, always use global redraw...
        if (!pending) {
            pending = true
            schedule(function () {
                pending = false
                sync()
            })
        }
        return
    }
    ```

    So nested components that read signals **never** get targeted redraw. We always schedule a full tree walk. The comment cites RouterRoot/Layout correctness.

3. **subscriptions** (fallback): Tries to find the component in the subscriptions array and render at the root element.

4. **Final fallback**: Full sync.

### Implication

For the performance demo with 200 `TableRowWithSignal` components (nested under a route), every signal update triggers a **full sync**. The signal path does not do component-level updates for nested components. The "efficient redraws with Signal dependency tracking" only applies to m.mount roots.

---

## 2. Non-Breaking Performance Ideas from v3 PR (#2982)

The [v3 proposal](https://github.com/MithrilJS/mithril.js/pull/2982) achieves ~20% bundle reduction and ~35% memory reduction, but most gains come from breaking changes (smaller vnodes, different API). These are **non-breaking** ideas that could apply to the current codebase:

### 2.1 Insertion Helper Simplification

v3 note: `parent.append(child)` is equivalent to `parent.insertBefore(child, null)`. The insertion helper could be simplified. Low risk, small code-size win.

### 2.2 Style Property Update Flow

PR #2985 (updateStyle improvements) was merged into v2. Check if there are further optimizations from v3’s style handling that don’t change behavior.

### 2.3 Avoid Redundant Allocations in Hot Paths

- **trackComponentSignal**: Skip `Set.add` when the component already tracks the signal (same signal read multiple times in one render). Reduces work per `signal.value` read.
- **Map lookups**: Use a single `.get()` and check for undefined instead of `.has()` + `.get()` where both are used.

### 2.4 Batching Signal Redraws (Without Threshold)

When many signals fire in one tick, we can:

- Collect affected components in a `Set` (deduplicate).
- Flush once per microtask via `queueMicrotask`.

This avoids N synchronous redraws when N signals fire. No threshold or full-sync fallback — just deduplication and deferred flush. Simpler than the previous batching approach.

---

## 3. Restoring Targeted Redraw for Nested Components (If Desired)

To get real component-level updates for nested components (e.g. TableRowWithSignal), we would need:

1. **stateToVnodeMap**: Store `{tag, attrs, key}` per component (as before) so we can reconstruct the vnode for `render(element, Vnode(...))`.
2. **Targeted redraw**: When `stateToDomMap` and `stateToVnodeMap` have the component and `element.isConnected`, call `render(element, Vnode(tag, key, attrs, ...))` instead of full sync.
3. **Same-tag handling for table elements**: For components that return `tr`/`td`/`th`, pass `instance.children` to `render` to avoid invalid nesting. Apply this **only** to table tags (`tr`, `td`, `th`), not to `div` or other elements, to avoid the docs-container regression.

The current “always full sync for stateToDomMap” was a deliberate choice for RouterRoot correctness. Re-enabling targeted redraw would need careful validation that route resolution and Layout still behave correctly.

---

## 4. Recommended Non-Breaking Improvements (Priority Order)

| Priority | Change                                                                                       | Risk     | Benefit                                                              |
| -------- | -------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| 1        | **trackComponentSignal**: early return when `set.has(signal)`                                | Very low | Fewer Set ops per render when the same signal is read multiple times |
| 2        | **Batching**: collect components in Set, flush via queueMicrotask                            | Low      | Avoids N sync redraws when many signals fire                         |
| 3        | **Single lookup**: use `.get()` and check for undefined instead of `.has()` + `.get()`       | Very low | Fewer WeakMap lookups in redraw path                                 |
| 4        | **Module-level maps**: replace globalThis with module-level WeakMaps                         | Low      | Cleaner, avoids globalThis and `\|\| new WeakMap()`                  |
| 5        | **Cleanup in onremove**: delete from stateToDomMap/stateToVnodeMap when component is removed | Low      | Avoids stale entries (WeakMap helps, but explicit delete is clearer) |

---

## 5. What to Avoid (Based on Recent Regressions)

- **Same-tag optimization for non-table elements**: Applying it to `div` caused invalid nesting (docs-container christmas tree). Restrict to `tr`, `td`, `th` if used at all.
- **Threshold-based full-sync fallback**: Added complexity and made behavior depend on component count. Simpler to always do targeted redraws when possible, or to keep the current “full sync for nested” behavior until targeted redraw is proven correct.

---

## 6. Summary

- **Signal path**: Component-level updates work for m.mount roots. For nested components, we always do full sync.
- **Non-breaking perf**: Focus on trackComponentSignal optimization, batching without threshold, single lookup, module-level maps, and onremove cleanup.
- **Targeted redraw for nested components**: Possible but requires stateToVnodeMap, careful same-tag handling (table only), and validation against RouterRoot/Layout.
