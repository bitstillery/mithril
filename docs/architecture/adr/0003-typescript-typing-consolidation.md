# ADR-0003: TypeScript Typing Consolidation

**Status**: Proposed  
**Date**: 2025-01-XX  
**Related ADRs**: [ADR-0002](./0002-signals-implementation.md) (Signals implementation requires proper Store<T> typing)

## Context

Mithril currently has TypeScript type definitions split between `index.d.ts` (declaration file) and implementation files. This creates maintenance overhead and makes it harder to keep types in sync with implementation. Additionally, the `Store<T>` type in `store.ts` has parsing errors and doesn't properly support the `$` prefix convention for accessing raw signals (like deepsignal).

### Problem

**Current State:**

1. **Type definitions in `index.d.ts`**:
   - Types are separated from implementation
   - Risk of types getting out of sync with implementation
   - Harder to maintain and understand

2. **`Store<T>` type parsing error**:
   - `store.ts(319,14)`: TypeScript parser error with mapped type syntax
   - Current type doesn't support `$` prefix access (`store.$property` returns raw signal)
   - Need proper typing for deepsignal-like unwrapping pattern

3. **Missing `MithrilTsxComponent` support**:
   - Frontend applications use class-based TSX components
   - No TypeScript support for this pattern
   - Need to add `MithrilTsxComponent` abstract base class

4. **Type checking issues**:
   - Some files have type errors that need fixing
   - Need to ensure proper type inference without runtime changes
   - Must not add runtime checks just to satisfy TypeScript

### Requirements

- Consolidate types from `index.d.ts` into implementation files
- Fix `Store<T>` type to support regular access and `$` prefix access
- Add `MithrilTsxComponent` support for class-based TSX components
- Ensure all type fixes use assertions and inference only - no runtime code changes
- Maintain backward compatibility with existing code

## Decision

We will consolidate all TypeScript type definitions into their respective implementation files and fix the `Store<T>` type to properly support signal unwrapping and `$` prefix access, following patterns similar to deepsignal.

### Key Decisions

1. **Move types to implementation files**: Each file exports its own types
2. **Fix `Store<T>` with intersection types**: Use mapped type + index signature pattern (like deepsignal)
3. **Add `MithrilTsxComponent`**: Abstract base class for class-based TSX components
4. **Type-only fixes**: Use type assertions (`as Type`) and inference, never add runtime checks
5. **Remove `index.d.ts`**: After consolidation, remove the separate declaration file

## Rationale

### Why Consolidate Types

1. **Single source of truth**: Types live with their implementation
2. **Easier maintenance**: Changes to implementation can update types in same file
3. **Better IDE support**: Types are co-located with code they describe
4. **Standard practice**: Modern TypeScript projects prefer inline types

### Why Fix Store<T> Type

1. **Parsing error**: Current type causes TypeScript compiler errors
2. **Missing `$` prefix support**: Runtime supports `store.$property` but types don't
3. **DeepSignal pattern**: Need proper typing for deepsignal-like unwrapping
4. **Type safety**: Proper types prevent runtime errors

### Why Add MithrilTsxComponent

1. **Frontend applications use it**: Existing codebase uses class-based TSX components
2. **Type safety**: Need proper TypeScript support for this pattern
3. **Future-proofing**: Enables better DX for class-based components

### Alternatives Considered

**Option A: Keep `index.d.ts`**
- **Rejected**: Creates maintenance overhead, types can drift from implementation

**Option B: Use separate `.d.ts` files per module**
- **Rejected**: Still separates types from implementation, harder to maintain

**Option C: Consolidate into implementation files (Chosen)**
- **Chosen**: Single source of truth, easier maintenance, standard practice

**Option D: Exclude `store.ts` from type checking**
- **Rejected**: User explicitly wants proper typing, not exclusions

## Implementation Details

### 1. Fix Store<T> Type Definition

**File**: `store.ts`

**Current Problem**: Parsing error with mapped type syntax. Need to support:
- Regular access: `store.property` → unwrapped value
- Signal access: `store.$property` → raw Signal instance
- Function properties → computed values
- Nested objects → Store instances

**Solution**: Use intersection type pattern similar to deepsignal:

```typescript
export type Store<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? R  // Function properties return computed value
    : T[K] extends Record<string, any>
    ? Store<T[K]>  // Nested objects become stores
    : T[K]  // Primitive values
} & {
  // Index signature for $ prefix access (runtime only, typed as Signal)
  [key: `$${string}`]: Signal<any> | ComputedSignal<any>
}
```

**Note**: If template literal types cause parser issues, use simpler index signature:
```typescript
} & {
  [key: string]: any  // Fallback for $ prefix access
}
```

### 2. Move Types from index.d.ts to Implementation Files

**Files to update**:

- **`render/vnode.ts`**: Add `Vnode`, `Children`, `Component`, `ComponentFactory`, `ComponentType`, `MithrilTsxComponent`
- **`render/hyperscript.ts`**: Add `Hyperscript` interface
- **`api/router.ts`**: Add `Route`, `RouteResolver` interfaces
- **`api/mount-redraw.ts`**: Add `Render`, `Redraw`, `Mount` interfaces
- **`index.ts`**: Add `MithrilStatic` interface, re-export all types

**Strategy**:
- Add type definitions at the top of each implementation file using `export interface` or `export type`
- Update `index.ts` to re-export all types from their source files
- Remove `index.d.ts` after consolidation
- Update `package.json` to remove `"types": "./index.d.ts"` from exports (or point to `index.ts`)

### 3. Add MithrilTsxComponent Support

**File**: `render/vnode.ts`

**Add**:
```typescript
/**
 * Abstract base class for TSX/JSX class-based components
 * Similar to mithril-tsx-component package
 */
export abstract class MithrilTsxComponent<Attrs = Record<string, any>> {
  oninit?(vnode: Vnode<Attrs>): void
  oncreate?(vnode: Vnode<Attrs>): void
  onbeforeupdate?(vnode: Vnode<Attrs>, old: Vnode<Attrs>): boolean | void
  onupdate?(vnode: Vnode<Attrs>): void
  onbeforeremove?(vnode: Vnode<Attrs>): Promise<any> | void
  onremove?(vnode: Vnode<Attrs>): void
  abstract view(vnode: Vnode<Attrs>): Children
}
```

**Update `ComponentType`** to include `MithrilTsxComponent`:
```typescript
export type ComponentType<Attrs = Record<string, any>, State = any> = 
  | Component<Attrs, State>
  | ComponentFactory<Attrs, State>
  | (() => Component<Attrs, State>)
  | (new (...args: any[]) => MithrilTsxComponent<Attrs>)
```

### 4. Fix Type Imports Throughout Codebase

**Files to update**:
- `store.ts` - Change `import type { ComponentType } from './index'` to `import type { ComponentType } from './render/vnode'`
- `render/hyperscript.ts` - Update imports
- `api/router.ts` - Update imports
- `api/mount-redraw.ts` - Update imports
- `render/render.ts` - Update imports
- `render/renderToString.ts` - Update imports
- `server.ts` - Update imports to use consolidated types
- All other files importing from `index.d.ts`

**Strategy**: Use `import type` statements pointing to the new locations in implementation files.

### 5. Fix Type Assertions (No Runtime Changes)

**Key Principle**: Use type assertions (`as Type`) and type guards only. Never add runtime checks like `if (x == null)` just for TypeScript.

**Examples of acceptable fixes**:
- `const vnode = Vnode(...) as Vnode<Attrs>` - type assertion
- `(Vnode as any).normalize(...)` - bypassing static method typing issues
- `route as unknown as Route & ((...) => void)` - complex intersection types

**Examples of unacceptable fixes**:
- Adding `if (dom == null) return` checks
- Changing `key ?? undefined` to `key || undefined`
- Adding `typeof children !== 'boolean'` filters

### 6. Handle Static Method Typing

**Problem**: `Vnode.normalize` and `Vnode.normalizeChildren` are attached at runtime but TypeScript doesn't recognize them.

**Solution**: 
- Export `Vnode` function with intersection type including static methods
- Use `(Vnode as any).normalize` at call sites where needed
- Or define a separate type for the function with static methods

**Pattern**:
```typescript
function Vnode(...): Vnode { ... }
Vnode.normalize = function(...): Vnode | null { ... }
Vnode.normalizeChildren = function(...): (Vnode | null)[] { ... }

export default Vnode as typeof Vnode & {
  normalize: typeof Vnode.normalize
  normalizeChildren: typeof Vnode.normalizeChildren
}
```

## Consequences

### Pros

- **Single source of truth**: Types live with implementation
- **Easier maintenance**: Changes to implementation can update types in same file
- **Better IDE support**: Types are co-located with code
- **Proper Store<T> typing**: Supports both regular access and `$` prefix access
- **MithrilTsxComponent support**: Enables class-based TSX components
- **No runtime overhead**: All fixes are type-only
- **Backward compatible**: No breaking changes to existing code

### Cons

- **Migration effort**: Need to update all import statements
- **Initial complexity**: Consolidating types requires careful coordination
- **Store<T> type complexity**: Complex mapped types can be hard to understand
- **Type assertions needed**: Some complex cases require `as any` or similar

### Risks

**High Risk Areas:**

1. **Breaking existing imports**: Changing import paths could break existing code
   - **Mitigation**: Update all imports systematically, test thoroughly
   - **Fallback**: Can keep `index.d.ts` temporarily during migration

2. **Store<T> type complexity**: Complex mapped types might cause parser issues
   - **Mitigation**: Use simpler intersection type if template literals fail
   - **Fallback**: Use index signature with `any` type

3. **Static method typing**: TypeScript doesn't handle runtime-attached methods well
   - **Mitigation**: Use type assertions at call sites
   - **Fallback**: Define separate type for function with static methods

**Medium Risk Areas:**

1. **Type inference issues**: Some complex types might not infer correctly
   - **Mitigation**: Use explicit type annotations where needed
   - **Fallback**: Use `as any` sparingly for edge cases

2. **Import path changes**: Many files need import updates
   - **Mitigation**: Systematic update, verify with type checker
   - **Fallback**: Can update incrementally

## Implementation Order

1. Fix `Store<T>` type in `store.ts` (resolve parsing error first)
2. Add types to `render/vnode.ts` (including `MithrilTsxComponent`)
3. Add types to `render/hyperscript.ts`
4. Add types to `api/router.ts`
5. Add types to `api/mount-redraw.ts`
6. Update `index.ts` to export all types and define `MithrilStatic`
7. Update all import statements throughout codebase
8. Remove `index.d.ts`
9. Update `package.json` exports to remove `types` field (or point to `index.ts`)
10. Run `bun run tsgo` to verify all errors are resolved

## Success Criteria

- [ ] `bun run tsgo` passes with no errors
- [ ] `Store<T>` properly types regular access and `$` prefix access
- [ ] All types moved from `index.d.ts` to implementation files
- [ ] `MithrilTsxComponent` exported and usable
- [ ] No runtime code changes (verify with `bun test`)
- [ ] All existing tests still pass
- [ ] Type inference works correctly (no unnecessary explicit types)

## Testing Strategy

1. **Type checking**: Run `bun run tsgo` to verify no type errors
2. **Runtime tests**: Run `bun test` to ensure no functional changes
3. **Import verification**: Check that all imports resolve correctly
4. **Store typing**: Test `Store<T>` with various object shapes
5. **MithrilTsxComponent**: Verify class-based components type correctly

## References

- ADR-0002: Custom Signals Implementation (requires proper Store<T> typing)
- DeepSignal: https://github.com/luisherranz/deepsignal (typing patterns)
- TypeScript Mapped Types: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
- TypeScript Template Literal Types: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
- Mithril render system: `render/render.ts`
- Mithril store: `store.ts`
