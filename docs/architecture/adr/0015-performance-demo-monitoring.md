# ADR-0015: Performance Demo Monitoring and Comparison

**Status**: Proposed  
**Date**: 2025-03-03  
**Related ADRs**:

- [ADR-0002](./0002-signals-implementation.md) (Custom Signals Implementation)
- [ADR-0012](./0012-mithril-signals-store-ssr-architecture.md) (Mithril Signals, Store, and SSR Architecture Overview)
- [ADR-0014](./0014-documentation-modernization.md) (Documentation Modernization)

## Context

The docs site includes a Performance page that demonstrates the difference between updating a table with `m.redraw()` every frame (without signals) versus using `state()` for reactivity (with signals). To make this comparison meaningful, we need a reliable way to measure and display the performance difference. The demo should stress the renderer enough to show a visible gap—e.g. nested components so the vdom tree is deeper and `m.redraw()` must walk every node.

## Decision

We will add performance monitoring to the demo using native browser APIs (no dependencies) and restructure the demo to make the comparison fair and measurable:

### Monitoring Approach

- **Metrics**: FPS (rolling 1s window) and frame time (median of last 60 frames, after 60-frame warm-up)
- **Measurement**: `performance.now()` at start/end of each RAF callback; same scope for both implementations
- **Stats display**: Direct DOM writes, throttled to 500ms—no Mithril in the stats path to avoid measuring our own overhead
- **Tab visibility**: Stop the RAF loop when `document.visibilityState === 'hidden'`; restart when visible

### Demo Structure

- **Nested components**: Refactor the table into `TableRow` and `QueryCell` components to deepen the vdom tree and stress the renderer
- **Rename "cluster"**: Replace DBMon-style names (`cluster`, `cluster N slave`) with generic labels (`item-N`, `item-N-replica`)
- **Mount for fair measurement**: Use `m.mount` for each demo container so signal updates trigger synchronous component-level redraw; our frame-time measurement then includes the DOM work (with `m.render`, signal redraw falls back to deferred full sync)

### Inactive Tab Behavior

- Only the active tab's component is mounted; the inactive demo is not in the DOM
- When switching tabs, the old component unmounts (onremove cancels RAF) and the new one mounts

## Rationale

- **Native APIs only**: No external dependencies; `performance.now()` and rolling buffers are sufficient
- **Median over mean**: Frame time is noisy (GC, other tabs); median is robust to outliers
- **Warm-up period**: Early frames are slower due to JIT and layout; discard first 60
- **Nested components**: Without signals, `m.redraw()` walks the entire tree; with signals, only the component that reads the signal re-renders. Deeper trees amplify the difference
- **m.mount requirement**: Verified in code—signal redraw is synchronous only when the component is in `componentToElement` (i.e. an `m.mount` root). With `m.render`, we'd measure scheduling overhead, not the actual render

## Consequences

### Pros

- Clear, comparable metrics (FPS, frame time) for both implementations
- No dependencies; minimal code
- Fair measurement when demos are mounted correctly
- Nested structure makes the performance gap more visible

### Cons

- Requires refactoring layout to use `m.mount` for demo containers
- Stats display uses direct DOM writes (outside Mithril) for accuracy

### Risks

- On very fast hardware, the difference may be subtle at default row count; row-count control (optional enhancement) can amplify

## Alternatives Considered

- **Compare tab (side-by-side)**: Rejected—user preferred per-tab stats; switching tabs to compare
- **External library (e.g. stats.js)**: Rejected—native APIs suffice; avoid dependencies
- **Mean instead of median**: Rejected—median is more robust to GC spikes
- **Keep flat vdom**: Rejected—nested components stress the renderer and better demonstrate the tree-walk cost signals avoid

## Implementation Details

The detailed plan lives in the Cursor plan file. Summary:

1. Create `performance-monitor.ts` (FPS queue, frame-time ring buffer, median, warm-up)
2. Create `performance-stats.tsx` (throttled direct DOM updates)
3. Create `table-row.tsx` and `query-cell.tsx` (nested components)
4. Update `env.ts` (rename cluster→item)
5. Integrate monitor and visibility handling into both demos
6. Refactor layout/PerformancePage to use `m.mount` for demo containers
7. Add stats overlay and styling

## References

- Plan: Performance Monitoring Plan (Cursor)
- DBMon benchmark: Classic database-monitoring UI used in framework perf comparisons; inspired the original demo structure
