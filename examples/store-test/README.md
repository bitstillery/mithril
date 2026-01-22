# Mithril Signals Example

This example demonstrates the usage of Mithril's signals system for fine-grained reactivity.

## Features Demonstrated

1. **Basic Signal Usage**: Counter component showing simple signal updates
2. **Computed Properties**: TodoList component with computed properties (function properties and `_` prefix)
3. **Nested Signals**: UserProfile component showing nested object reactivity
4. **Fine-Grained Updates**: Each component only re-renders when its dependencies change

## Running the Example

```bash
bun run dev
```

Then open `index.html` in your browser.

## Store Setup

The store (`store.ts`) demonstrates:
- Primitive values (`count`)
- Nested objects (`user`)
- Arrays (`todos`)
- Computed properties:
  - Function properties: `totalTodos: () => ...`
  - `_` prefix: `_incompleteTodos: () => ...`

## Components

- **Counter**: Simple counter with increment/decrement/reset
- **TodoList**: Todo list with computed totals
- **UserProfile**: User profile with nested signal updates

## Key Concepts

- Signals provide fine-grained reactivity
- Components automatically track signal dependencies
- Only components using changed signals re-render
- Computed properties are automatically detected
- Both function properties and `_` prefix are supported
