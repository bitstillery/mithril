# Mithril State Example

This example comprehensively demonstrates Mithril's signal-based state system - one of the most important features of the new Mithril implementation. The state provides fine-grained reactivity and is the foundation for SSR state serialization.

## Features Demonstrated

### Core State Features

1. **Basic Signal Access**: Direct property access (`state.property`)
2. **Raw Signal Access**: `$` prefix convention (`state.$property`) to get Signal instances
3. **Computed Properties**: Function properties automatically become ComputedSignal
4. **Nested States**: Nested objects become reactive states automatically
5. **Arrays with States**: Arrays containing objects become states
6. **Dynamic Properties**: Properties can be added at runtime

### Signal API Methods

7. **Subscribe**: `signal.subscribe(callback)` - Subscribe to signal changes
8. **Watch**: `signal.watch(callback)` - Watch with old/new value tracking
9. **Peek**: `signal.peek()` - Access value without subscribing

### Advanced Features

10. **Effects**: `effect(fn)` - Reactive side effects that run when dependencies change
11. **Nested Property Access**: Deep property access maintains reactivity (`store.user.name`)
12. **Array Element Signals**: Access signals for array elements (`store.items.$0`)

## Running the Example

```bash
bun run dev
```

Then open `index.html` in your browser.

## State Setup

The state (`state.ts`) demonstrates:
- **Required name parameter**: `state(initial, 'state.example')` - name is required for SSR serialization support
- Primitive values (`count`)
- Nested objects (`user`) - automatically becomes nested state
- Arrays (`todos`) - array elements become states
- Computed properties:
  - Function properties: `totalTodos: () => ...` (automatically computed)
  - `_` prefix: `_incompleteTodos: () => ...` (backward compatibility)

## Components

### Basic Usage
- **Counter**: Simple counter demonstrating basic signal updates
- **TodoList**: Todo list with computed properties showing totals
- **UserProfile**: User profile with nested signal updates

### Advanced Features
- **NestedAccess**: Demonstrates accessing nested state properties and their signals
- **ArraySignals**: Shows how to access signals for array elements via `$` prefix
- **DynamicProperties**: Demonstrates adding properties dynamically at runtime
- **SignalPropExample**: Shows passing raw signals as component props
- **SignalMethods**: Demonstrates `subscribe()`, `watch()`, and `peek()` methods
- **Effects**: Shows reactive side effects with `effect()` function
- **StateDebugger**: Real-time state viewer (updates automatically)

## Key Concepts

### Fine-Grained Reactivity
- Signals provide fine-grained reactivity
- Components automatically track signal dependencies
- Only components using changed signals re-render
- No unnecessary re-renders

### Store Features
- **Required naming**: All stores must have a name (enables SSR serialization)
- **Auto-registration**: Stores register themselves automatically
- **Nested reactivity**: Nested stores maintain independent reactivity
- **Computed signals**: Function properties become ComputedSignal automatically
- **Signal access**: Use `$` prefix to access raw Signal instances

### Signal API
- **subscribe()**: Subscribe to changes (returns unsubscribe function)
- **watch()**: Watch with old/new value tracking
- **peek()**: Access value without creating subscription
- **effect()**: Create reactive side effects

### Important Notes
- State name is required for SSR support (but SSR is optional)
- Nested states get their own `signalMap` (prevents cross-contamination)
- Computed signals are skipped during SSR serialization (recreated on client)
- Dynamic properties automatically become reactive signals
