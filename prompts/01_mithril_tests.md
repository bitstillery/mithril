# Converting ospec Tests to Bun's Test Runner

## Import Changes
- FROM: `var o = require("ospec")`, `var moduleName = require("path/to/module")`
- TO: `import { describe, test, expect, beforeEach, mock } from "bun:test";`, `import moduleName from "path/to/module";`

## Test Structure Changes
- FROM: `o.spec("component name", function() { o.beforeEach(function() { /* setup */ }) o("test description", function() { o(actual).equals(expected) }) })`
- TO: `describe("component name", () => { beforeEach(() => { /* setup */ }); test("test description", () => { expect(actual).toBe(expected) }); });`

## Assertion Changes
- FROM: `o(value).equals(expected)`, `o(value).notEquals(expected)`, `o(value).deepEquals(expected)`
- TO: `expect(value).toBe(expected)`, `expect(value).not.toBe(expected)`, `expect(value).toEqual(expected)`

## Mock/Spy Function Changes
- FROM: `var spy = o.spy()` or `var spy = o.spy(function() { return originalFunction() })`
- Access with: `spy.callCount`, `spy.calls // [{this: context, args: [arg1, arg2]}]`
- TO: `const mockFn = mock(() => {})` or `const spy = mock(originalFunction)`
- Access with: `spy.mock.calls.length`, `spy.mock.calls // [[arg1, arg2], [arg1, arg2]]`

## Function Context (`this`) Handling
- IMPORTANT: Use regular functions (`function() {}`) instead of arrow functions (`() => {}`) when:
  1. The function needs to access `this` (e.g., component methods, lifecycle hooks)
  2. The function is a constructor or needs to be used with `new`
  3. Testing code that relies on `this` context binding

For example:

```javascript
// CORRECT - preserves this binding
const methods = {
view: mock(function(vnode) {
expect(this).toBe(vnode.state);
return "";
})
}
// INCORRECT - this won't be bound properly
const methods = {
view: mock((vnode) => {
expect(this).toBe(vnode.state); // Will fail
return "";
})
}


## Constructor Function Testing
- When testing constructor functions (classes):
  1. Define the actual constructor rather than mocking it
  2. Mock individual methods on the prototype
  3. Use the constructor directly in tests

Example:
```
javascript
// CORRECT
function Component(vnode) {
// Constructor logic
}
Component.prototype.view = mock(function() {
expect(this instanceof Component).toBe(true);
return "";
});
render(root, [m(Component)]);
// INCORRECT
const Component = mock(() => { / constructor logic / });
Component.prototype.view = mock(() => { return ""; });
render(root, [m(Component)]);
```

## Special Cases
1. Mock assertion format: Bun uses arrays of parameter arrays, not objects with context and args
2. Spy parameters: With domMock, pass `mock` directly: `const $window = domMock({spy: mock});`
3. ES6 Syntax: Use `const`/`let` instead of `var`, arrow functions (where appropriate), etc.
4. Spies with context: `this` context in spy calls not directly available in Bun's mocks

## Steps
1. Convert imports
2. Update test structure
3. Refactor assertions
4. Update mock/spy functions and assertions
5. Modernize syntax
6. Carefully handle functions that need `this` binding
7. Properly handle constructor functions
8. Verify all tests pass
