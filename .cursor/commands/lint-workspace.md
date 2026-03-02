# Lint Workspace Command

Lint the Mithril codebase. Focuses on fixing types at interface definitions using TypeScript inference strategy.

## Usage

```
/lint-workspace
```

## Workflow

1. **Run linting checks**:

    ```bash
    bun run lint:ts-format   # oxfmt
    bun run lint:ts-syntax   # oxlint
    bun run lint:ts-types    # tsgo (TypeScript types)
    ```

    Or run all at once: `bun run lint:ts`

2. **Analyze TypeScript errors**:
    - Read error messages carefully
    - Identify types causing issues
    - Trace errors back to interface/type definitions

3. **Fix types at source**:
    - Find interface/type definitions (trace through imports)
    - Update definitions to match actual usage patterns
    - Use type inference to simplify code
    - Avoid adding conditionals just to satisfy TypeScript

4. **Apply fixes**:
    - Fix interface/type definitions first
    - Let TypeScript inference work where possible
    - Only add type guards if value truly can be undefined/null
    - Remove unnecessary explicit types
    - **Do NOT introduce helper functions** to work around type errors — use inline assertions (`as Type`) at usage sites or fix the type definition

## TypeScript Inference Strategy

**CRITICAL: Fix types at interface definitions, not at usage sites.**

**CRITICAL: Do not change runtime functionality.** Type fixes must be type-only changes (e.g. widening
interface types, adding `| null`, changing annotations). Never alter control flow, add/remove conditionals,
change function signatures in ways that affect runtime behavior, or modify emitted JavaScript.

**CRITICAL: Never use inline imports.** Always add imports at the top of the file. For example:

- `import type { ... } from '...'` — use top-level imports
- `import('...').Type` — NEVER use inline import syntax

**CRITICAL: Never replace mutation with reassignment.** Preserve in-place mutation semantics. For example:

- `arr.splice(0, arr.length, ...items)` mutates the array in place and keeps the same reference
- `arr = items` reassigns the variable and breaks the reference — NEVER do this as a "fix"
- Same for `obj.prop = x` vs replacing the whole object

### Principles

1. **Trace to source**: When seeing type errors, find the interface/type definition
2. **Fix at definition**: Update the interface/type to match reality
3. **Use inference**: Let TypeScript infer types instead of explicit annotations
4. **Avoid conditionals**: Don't add `if (x !== undefined)` checks just for TypeScript
5. **Avoid assertions**: Don't use `as Type` or `!` - fix the underlying type
6. **No runtime changes**: Only change types, annotations, and interfaces — never runtime logic
7. **Preserve mutation semantics**: Never replace `splice`, `push`, or in-place object updates with reassignment — reactivity depends on keeping the same reference
8. **No inline imports**: Always add imports at the top of the file — never use `import('...').Type` inline
9. **No helper functions for typing**: Do NOT create wrapper/getter helpers to fix type errors. Use inline `as Type` at the usage site or fix the interface/type definition

### Examples

**❌ Bad: Adding conditionals everywhere**

```tsx
// Interface says optional, but it's always present
interface User {
    name?: string
}

// Bad: Adding checks everywhere
if (user?.name) {
    console.log(user.name)
}
```

**✅ Good: Fix the interface**

```tsx
// Fix at source - make it required if it's always present
interface User {
    name: string
}

// No conditionals needed
console.log(user.name)
```

**❌ Bad: Type assertions**

```tsx
const value = data as ExpectedType
const result = maybeNull!.property
```

**✅ Good: Fix type definition**

```tsx
// Fix function signature or interface
function processData(data: ExpectedType): Result {
    // Type is correct, no assertion needed
}
```

**❌ Bad: Replacing mutation with reassignment**

```tsx
// Original: arr.splice(0, arr.length, ...items) — keeps same reference
this.data.options = result // BAD: breaks reactivity, new reference
```

**✅ Good: Preserve in-place mutation**

```tsx
this.data.options.splice(0, this.data.options.length, ...result) // Same reference, reactive
```

**❌ Bad: Explicit types when inference works**

```tsx
const items: string[] = ['a', 'b', 'c']
const user: User = {name: 'John'}
```

**✅ Good: Use inference**

```tsx
const items = ['a', 'b', 'c'] // inferred as string[]
const user = {name: 'John'} // inferred from usage
```

### Error Handling Workflow

1. **Read error**: Understand the type mismatch
2. **Find type**: Locate the interface/type definition causing the issue
3. **Trace imports**: Follow imports to find where type is defined
4. **Determine cause**: Is the type definition wrong or the usage?
5. **Fix at source**: Update interface/type definition when possible
6. **Use inference**: Remove explicit types when TypeScript can infer
7. **Add guards only if needed**: If value can legitimately be undefined/null

## Output Format

- Group errors by file
- Show error count per file
- Focus on root cause (interface definitions)
- Minimize token usage by showing only relevant errors
- Highlight which interfaces/types need fixing

## Token Optimization

- Focus on interface/type definitions, not all usage sites
- Show error messages and affected interfaces
- Batch similar errors together
- Don't repeat information across files
