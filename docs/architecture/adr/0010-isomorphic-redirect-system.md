# ADR-0010: Isomorphic Redirect System for Mithril Router

**Status**: Proposed  
**Date**: 2025-01-28  
**Related ADRs**: [ADR-0001](./0001-ssr-hydration.md) (SSR support), [ADR-0009](./0009-ssr-server-abstraction.md) (SSR server abstraction)

## Context

Mithril's router supports both browser and SSR (Server-Side Rendering) environments. Currently, route resolvers use `undefined` as a signal for redirects, which causes several problems:

### Problems with Current Approach

1. **Ambiguous semantics**: `undefined` could mean "skip route", "error occurred", or "redirect needed"
2. **Hardcoded redirect targets**: SSR router hardcodes `/login` as redirect target, making it inflexible
3. **Browser timing issues**: `m.route.set()` is called but route resolution may continue, causing race conditions
4. **No type safety**: Can't specify redirect target dynamically with TypeScript validation
5. **Invalid component errors**: When `onmatch` returns `undefined`, the resolver object itself can be passed as a component tag, causing `TypeError: component is not a function` in `serializeComponent`

### Current Behavior

**Browser:**
- `require_auth` calls `m.route.set('/login')` and returns `undefined`
- Router skips rendering current route
- New route resolution handles `/login`

**SSR:**
- `require_auth` returns `undefined`
- Router detects `undefined` and hardcodes redirect to `/login`
- Recursively resolves `/login` route

**Issues:**
- No way to specify custom redirect targets
- Redirect objects can leak into component rendering
- Type system can't validate redirects
- Hardcoded logic makes it hard to maintain

## Decision

We will implement an **explicit redirect object system** similar to the existing `SKIP` pattern, using a Symbol-based approach that works isomorphically in both browser and SSR environments.

### Architecture Overview

1. **Redirect Object**: Create `{ [REDIRECT]: path }` objects using a Symbol key
2. **Type Safety**: Add `RedirectObject` type and type guards
3. **Browser Router**: Detect redirect objects and trigger navigation via `m.route.set()`
4. **SSR Router**: Detect redirect objects and recursively resolve target route
5. **Early Detection**: Check for redirects immediately after `onmatch` returns, before component processing

## Implementation

### Redirect Infrastructure

Add redirect symbol and helper function to router API:

```typescript
// In mithril/api/router.ts
const REDIRECT = route.REDIRECT = Symbol('REDIRECT')

route.redirect = function(path: string): RedirectObject {
  return {[REDIRECT]: path} as RedirectObject
}

function isRedirect(value: any): value is RedirectObject {
  return value != null && typeof value === 'object' && REDIRECT in value
}
```

### Type Definitions

Update `RouteResolver` interface:

```typescript
export type RedirectObject = {[key: symbol]: string}

export interface RouteResolver<Attrs = Record<string, any>, State = any> {
  onmatch?: (
    args: Attrs,
    requestedPath: string,
    route: string,
  ) => ComponentType<Attrs, State> | Promise<ComponentType<Attrs, State>> | RedirectObject | Promise<RedirectObject> | void
  render?: (vnode: VnodeType<Attrs, State>) => VnodeType
}
```

### Browser Router Handling

Update browser router `update()` function to detect redirects:

```typescript
if (isRedirect(comp)) {
  const redirectPath = comp[REDIRECT]
  route.set(redirectPath, null)
  return // Skip rendering - new route resolution handles redirect
}
```

### SSR Router Handling

Update SSR router `route.resolve()` to handle redirects:

```typescript
// After onmatch returns
if (isRedirect(payload)) {
  const redirectPath = payload[REDIRECT]
  // Recursively resolve redirect target with depth tracking
  return await route.resolve(redirectPath, routes, renderToString, prefix, redirectDepth + 1)
}
```

**Critical**: Check for redirects **BEFORE** processing as component to prevent redirect objects from reaching `resolver.render()` or component creation.

### Auth Functions

Update authentication helpers to return redirect objects:

```typescript
export function require_auth(component) {
  if (!$s.identity.token && !$s.identity.user.artkey) {
    const redirect_to = encodeURIComponent(getCurrentUrl())
    if (!redirect_to.includes('dashboard')) {
      return m.route.redirect(`/login?redirect=${redirect_to}`)
    } else {
      return m.route.redirect('/login')
    }
  }
  return component
}
```

### Invalid Component Error Prevention

Add validation in `serializeComponent` to detect RouteResolver objects:

```typescript
// Validate component before processing
if (component != null && typeof component === 'object' && !Array.isArray(component)) {
  if ('onmatch' in component && 'render' in component && !('view' in component)) {
    // RouteResolver object, not a component
    console.error('RouteResolver object passed as component')
    return ''
  }
}
```

## Rationale

### Why Redirect Objects Instead of `undefined`?

1. **Explicit intent**: Clear signal that redirect is needed
2. **Type safety**: TypeScript can validate redirect objects
3. **Flexible targets**: Supports dynamic redirect paths with query params
4. **Isomorphic**: Same object works in both browser and SSR
5. **Debuggable**: Easy to inspect in logs and debuggers

### Why Symbol-Based Approach?

1. **Prevents collisions**: Symbol keys won't conflict with other object properties
2. **Type-safe**: Can create type guards for redirect objects
3. **Serialization-safe**: Symbols don't serialize, preventing accidental exposure
4. **Similar to SKIP**: Follows existing pattern in codebase

### Why Recursive Resolution in SSR?

1. **Cleaner than hardcoding**: No need to hardcode `/login` in router
2. **Flexible**: Supports any redirect target dynamically
3. **Consistent**: Same redirect object works everywhere
4. **Maintainable**: Redirect logic lives in auth functions, not router

### Why Early Detection?

1. **Prevents errors**: Redirect objects never reach component rendering
2. **Performance**: Fail fast, don't process invalid data
3. **Clarity**: Clear separation between redirect handling and component rendering

## Consequences

### Positive

- **Explicit redirects**: Clear intent when redirect is needed
- **Type safety**: TypeScript validates redirect objects
- **Isomorphic**: Works consistently in browser and SSR
- **Flexible**: Supports dynamic redirect targets
- **Maintainable**: No hardcoded redirect logic in router
- **Debuggable**: Redirect objects are easy to inspect
- **Error prevention**: Prevents invalid component errors

### Negative

- **Breaking change**: Existing code using `undefined` for redirects needs updating
- **Migration required**: Auth functions need to be updated
- **Complexity**: Adds redirect depth tracking to prevent loops

### Risks

- **Redirect loops**: Need depth tracking to prevent infinite redirects (mitigated with max depth check)
- **Type compatibility**: Need to ensure redirect objects work across module boundaries
- **Performance**: Recursive resolution adds call stack depth (mitigated with depth limit)

## Alternatives Considered

### 1. HTTP Redirect Responses (302/307)

**Approach**: Return HTTP redirect response in SSR, let browser handle navigation

**Rejected because**:
- Doesn't work for browser-side redirects
- Loses SSR benefits (no pre-rendered content)
- Requires different handling for browser vs SSR

### 2. Special Component Type

**Approach**: Create a `RedirectComponent` that triggers redirects

**Rejected because**:
- Components are for rendering, not navigation
- Would still need special handling in router
- Less explicit than redirect objects

### 3. Exception-Based Redirects

**Approach**: Throw special redirect exceptions, catch in router

**Rejected because**:
- Exceptions are for errors, not control flow
- Performance overhead
- Harder to debug

### 4. Keep `undefined` but Fix Detection

**Approach**: Improve `undefined` detection and handling

**Rejected because**:
- Still ambiguous (could mean skip route)
- No type safety
- Hardcoded redirect targets still needed

## Implementation Status

**Current Status**: ✅ Fully implemented and tested

- ✅ Redirect infrastructure added (`REDIRECT` symbol, `route.redirect()`)
- ✅ Browser router redirect handling
- ✅ SSR router redirect handling with depth tracking
- ✅ Auth functions updated to return redirect objects
- ✅ Type definitions updated
- ✅ Invalid component error prevention added
- ✅ Return type fixed (`Promise<SSRResult>` instead of `Promise<string>`)
- ✅ `route.redirect()` exposed in server-side router
- ✅ Comprehensive test suite added (`tests/render/test-ssr-routing.test.ts`)

**Test Coverage**:
- Basic component routing
- RouteResolver with onmatch
- RouteResolver with render
- Redirects (single, chained, with query params)
- Redirect loop prevention
- Route parameters
- Query parameters
- SSRResult handling (string and {html, state})
- Error handling
- Isomorphic behavior verification

## Related ADRs

- [ADR-0001](./0001-ssr-hydration.md): SSR Hydration Support - Provides SSR foundation
- [ADR-0009](./0009-ssr-server-abstraction.md): SSR Server Abstraction - SSR server utilities

## References

- Mithril Router API: `mithril/api/router.ts`
- Route Resolver Pattern: Similar to `SKIP` object pattern
- Implementation Plan: `.cursor/plans/isomorphic_redirect_system_for_mithril_router_1f6fd739.plan.md`
