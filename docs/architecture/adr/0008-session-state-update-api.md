# ADR-0008: Session State Update API

**Status**: Proposed  
**Date**: 2025-01-23  
**Related ADRs**: [ADR-0007](./0007-store-ssr-persistence-strategy.md) (Store SSR and Persistence Strategy)

## Context

ADR-0007 introduced server-side session state as a fourth state type in the Store API. Session state is:
- Server-side storage tied to session ID/cookie
- Hydrated via SSR (comes from server during initial render)
- Not stored in localStorage (unlike `saved` and `tab` state)

However, ADR-0007 didn't specify how client-side updates to session state are persisted back to the server. This is needed for:
- User preferences that should persist across page reloads
- Session-scoped data that should survive page navigation
- State that should clear on server restart (unlike localStorage)

### Problem

**Current State:**

1. **Session state hydration**: Works via SSR - server provides session data during initial render
2. **Client-side updates**: Can modify properties defined in session template (e.g., `store.state.session_data.*` if template defines `session_data` key), but changes are lost on reload
3. **No persistence mechanism**: No API to save session state updates back to server
4. **Unclear lifecycle**: Not documented how session state persists across reloads vs clears on restart

**Missing Functionality:**

- API endpoint to accept session state updates from client
- Mechanism to store updated session state in server session store
- Integration with SSR to return updated session state on next request
- Clear documentation of session state lifecycle

### Expected Behavior

After implementation:

1. **Client can update session state**: Modify properties defined in session template using normal setters (structure depends on template, e.g., `store.state.session_data.*` if template defines `session_data` key)
2. **Unified save API**: `store.save()` can save to specific storage types or all storage types
3. **Automatic batching**: Session state updates are batched/debounced when saving via `store.save()`
4. **Selective saving**: `store.save({saved: true, tab: true, session: true})` or `store.save()` for all
5. **Updates persist across reloads**: Session state updates saved to server via blueprint extraction, returned via SSR on next request
6. **Updates clear on server restart**: Session state stored in-memory, lost when server restarts
7. **Unified API**: Same setters for all state types - blueprint determines which properties belong to session storage

## Decision

We will implement a session state update API integrated into `store.save()`:

1. **API Endpoint**: `POST /api/session` - Accepts session state updates (RESTful endpoint)
2. **Unified save API**: `store.save()` accepts options to specify which storage types to save
3. **Default behavior**: `store.save()` saves all storage types (saved, tab, session)
4. **Selective saving**: `store.save({saved: true})` or `store.save({session: true})` saves only specified types
5. **Batched updates**: Multiple session state changes are batched into single API call when saving
6. **Session Storage**: Updates stored in `sessionStore` tied to session ID
7. **SSR Integration**: Updated session state returned via `getSessionData()` during SSR
8. **Lifecycle**: Session state persists across page reloads but clears on server restart

### Architecture Overview

**Session State Update Flow:**

```
1. Client updates: store.state.session_data.serverData = "new value" (or any property defined in session template)
   - Properties updated in unified store.state (all state types coexist)

2. Client calls: store.save() or store.save({session: true})
   - Can specify which storage types to save: {saved: true, tab: true, session: true}
   - If no options provided, saves all storage types

3. Multiple updates batched: merge_deep(store.state, {session_data: {...}, saved: {...}})
   - Multiple session property changes batched when store.save() is called
   - Single API call for all session updates in the batch

4. Store extracts session properties using blueprint:
   - blueprint(store.state, sessionTemplate) → extracts only properties defined in session template
   - Blueprint filters unified state based on template structure

5. Store calls: POST /api/session { session_data: { serverData: "new value", ... } }
   - Extracted data structure matches session template structure
   - Single API call for all batched session updates

6. Server stores: sessionStore.updateSession(sessionId, { session_data: { ... } })
   - Server stores under 'session_data' key in sessionStore.data

7. On next SSR: getSessionData() reads from sessionStore and returns updated session state
8. Client hydrates: Updated session state restored via SSR deserialization into unified store.state
```

**Key Design:**

- **Unified state model**: All state types coexist in `store.state` (saved, temporary, tab, session properties)
- **Blueprint extraction**: `blueprint(store.state, sessionTemplate)` extracts only properties defined in session template
- **Template structure**: Session template defines which properties in `store.state` are session-bound (can be at any nesting level)
- **Session ID from cookie**: Server extracts session ID from HTTP cookie
- **Partial updates**: API accepts partial session state (only properties that changed)
- **Merge with existing**: Server merges updates with existing session data
- **SSR integration**: Updated session state automatically included in SSR hydration

**API Contract:**

```typescript
// POST /api/session
// Headers: Cookie: sessionId=...
// Body: { session: { serverData?: string, user?: {...}, ... } }  // Structure matches session template
// Response: { success: true }
```

**Blueprint Usage:**

The blueprint function extracts only properties from `store.state` that are defined in the session template:

```typescript
// Session template defines structure:
const sessionTemplate = {
  session_data: {
    user: { id: null, name: '', role: '' },
    serverData: '',
    lastServerUpdate: 0
  }
}

// Unified store.state has all properties:
store.state = {
  saved: { username: '...', ... },
  temporary: { message: '...', ... },
  tab: { sessionId: '...', ... },
  session_data: { user: { id: '...', ... }, serverData: '...', ... }
}

// Blueprint extracts only session properties:
const sessionData = blueprint(store.state, sessionTemplate)
// Result: { session_data: { user: {...}, serverData: '...', lastServerUpdate: ... } }
```

**Server Implementation:**

```typescript
// In server.ts
async function handleSessionUpdate(req: Request): Promise<Response> {
  const cookies = req.headers.get('cookie') || ''
  const sessionIdMatch = cookies.match(/sessionId=([^;]+)/)
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : null
  
  if (!sessionId) {
    return new Response('No session ID', { status: 401 })
  }
  
  const body = await req.json()
  const sessionData = body.session || {}  // Structure matches session template
  
  // Update session store with new session state
  // Server stores under 'session' key in sessionStore.data
  sessionStore.updateSession(sessionId, { session: sessionData })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**Store.save() Implementation:**

```typescript
// Store.save() with options to specify storage types - async by default
class Store {
  async save(options?: {saved?: boolean, tab?: boolean, session?: boolean}): Promise<void> {
    // Default to saving all storage types if no options provided
    const saveSaved = options?.saved ?? (options === undefined)
    const saveTab = options?.tab ?? (options === undefined)
    const saveSession = options?.session ?? (options === undefined)
    
    // Save to localStorage (saved state) - wrapped in Promise for consistency
    if (saveSaved && this.templates.saved) {
      const statePlain = serializeStore(this.stateInstance)
      const savedData = this.blueprint(statePlain, copy_object(this.templates.saved))
      this.set('store', savedData)
      // localStorage is sync, but wrapped in Promise.resolve() for consistent async API
    }
    
    // Save to sessionStorage (tab state) - wrapped in Promise for consistency
    if (saveTab && this.templates.tab) {
      const tabState = (this.stateInstance as any).tab
      if (tabState) {
        const tabPlain = isState(tabState) ? serializeStore(tabState) : tabState
        const tabTemplate = (this.templates.tab as any).tab || this.templates.tab
        const tabData = this.blueprint(tabPlain, copy_object(tabTemplate))
        this.set_tab('store', tabData)
        // sessionStorage is sync, but wrapped in Promise.resolve() for consistent async API
      }
    }
    
    // Save to session API (session state) - async by nature
    if (saveSession && this.templates.session) {
      const statePlain = serializeStore(this.stateInstance)
      const sessionData = this.blueprint(statePlain, copy_object(this.templates.session))
      
      // Call API endpoint with batched session updates
      // Note: sessionData structure matches template (e.g., { session_data: {...} })
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)  // e.g., { session_data: {...} }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to save session state: ${response.statusText}`)
      }
    }
  }
}
```

## Rationale

### Why Unified save() API with Options

1. **Unified interface**: Single `store.save()` method for all storage types (saved, tab, session)
2. **Async by default**: `store.save()` returns Promise for consistent API (even localStorage wrapped)
3. **Explicit control**: Developer chooses when to persist and which storage types to save
4. **Selective saving**: Can save only specific storage types: `store.save({session: true})`
5. **Batched updates**: Multiple changes (e.g., from `merge_deep`) result in single API call per storage type
6. **Performance**: Single API call per storage type when saving, efficient batching
7. **Consistency**: Same async API pattern for localStorage, sessionStorage, and session API
8. **Error handling**: Can use try/catch with await for proper error handling
9. **Flexibility**: Can save all types (`store.save()`) or specific types (`store.save({saved: true})`)

### Why Store in sessionStore

1. **Session isolation**: Each session ID has its own state
2. **SSR integration**: `getSessionData()` can read from sessionStore
3. **Lifecycle**: In-memory storage clears on server restart (desired behavior)
4. **Simplicity**: Uses existing sessionStore infrastructure
5. **Upgrade path**: Can be upgraded to Redis/database later

### Why Blueprint Extraction

1. **Template compliance**: Only properties defined in session template are extracted
2. **Unified state model**: Blueprint filters unified `store.state` to extract session properties
3. **Structure preservation**: Extracted data structure matches session template structure
4. **Flexibility**: Template can define properties at any nesting level

### Why Partial Updates

1. **Efficiency**: Only send changed properties
2. **Flexibility**: Client can update any session property independently
3. **Blueprint compliance**: Blueprint extracts only properties defined in template
4. **Merge behavior**: Server merges with existing session data

### Why Session ID from Cookie

1. **Security**: Session ID already established via cookie
2. **No client state**: Client doesn't need to track session ID
3. **Standard pattern**: Matches common session management patterns
4. **SSR compatibility**: Same session ID used for SSR hydration

## Consequences

### Pros

- **Unified save API**: Single `store.save()` method for all storage types
- **Selective saving**: Can save specific storage types or all types
- **Batched updates**: Multiple changes result in single API call per storage type (efficient)
- **Explicit control**: Developer chooses when to persist
- **Session state persistence**: Client updates persist across page reloads
- **Clear lifecycle**: Persists across reloads, clears on server restart
- **Unified API**: Same setters for all state types
- **SSR integration**: Updated state automatically hydrated on next request
- **Consistency**: Same pattern for localStorage, sessionStorage, and session API

### Cons

- **Network request**: Requires HTTP call to persist session updates (async)
- **Async operation**: `store.save()` is async by default (even localStorage wrapped in Promise for consistency)
- **Explicit save**: Requires calling `store.save()` (not automatic)
- **Error handling**: Need to handle API failures (can use try/catch with await)
- **Backend dependency**: Requires backend session storage
- **In-memory limitations**: Lost on server restart (can be mitigated with Redis/database)
- **API consistency**: localStorage/sessionStorage are sync but wrapped in async API (minor overhead)

### Risks

- **Race conditions**: Multiple rapid updates batched, but last write wins (acceptable for session state)
- **Explicit save required**: Developer must remember to call `store.save()` (not automatic)
- **Session expiration**: Updates might fail if session expired
- **Network failures**: Updates might not persist if API call fails (Store can retry)
- **State consistency**: Client state might diverge from server state if update fails (can detect on next SSR)
- **Security**: Need to validate session ID and prevent unauthorized updates

## Alternatives Considered

**Option A: Automatic save on every change**

- **Rejected**: Too many network requests, performance impact
- **Rationale**: Would cause excessive API calls on rapid state changes

**Option B: Save session state in localStorage**

- **Rejected**: Defeats purpose of server session state
- **Rationale**: Session state should be server-controlled, not client-controlled

**Option C: WebSocket for real-time sync**

- **Rejected**: Overkill for session state, adds complexity
- **Rationale**: HTTP endpoint is sufficient for session state updates

**Option D: Explicit save via store.save()**

- **Rejected**: Session state requires async network call, different from sync localStorage
- **Rationale**: Would require separate API, less convenient than automatic persistence

**Option E: Unified save() API with selective storage options (Chosen)**

- **Chosen**: Unified `store.save()` with options to specify storage types
- **Rationale**: Best balance of explicit control, performance, and API consistency
- **Implementation**: `store.save()` accepts options `{saved?: boolean, tab?: boolean, session?: boolean}`, defaults to all if not specified
- **Batching**: Multiple session updates batched into single API call when `store.save({session: true})` is called

## Implementation Details

### Server-Side Changes

1. **Add API endpoint** (`examples/ssr/server.ts`):
   - `POST /api/session` - Accept session state updates (RESTful endpoint)
   - Extract session ID from cookie
   - Update `sessionStore` with new session data
   - Return success response

2. **Update `getSessionData()`** (`examples/ssr/server.ts`):
   - Read session state from `sessionStore.data.session_data` if it exists
   - Merge with default session data
   - Return merged session state for SSR hydration

3. **Update `sessionStore.updateSession()`** (`examples/ssr/sessionStore.ts`):
   - Handle nested `session_data` data structure
   - Merge updates with existing session data
   - Preserve other session data (userId, createdAt, etc.)

### Client-Side Changes

1. **Update Store.save() method** (`store.ts`):
   - Make method async: `async save(options?: {saved?: boolean, tab?: boolean, session?: boolean}): Promise<void>`
   - Add options parameter to specify which storage types to save
   - Default to saving all storage types if no options provided
   - Wrap localStorage/sessionStorage saves in Promise.resolve() for consistency (even though they're sync)
   - Extract session properties using blueprint when `session: true` (or default)
   - Batch multiple session updates into single API call
   - Call API endpoint `/api/session` with batched session updates (await the fetch)
   - Throw errors for failed API calls (can be caught with try/catch)

2. **Add UI controls** (`examples/ssr/components/store_demo.tsx`):
   - Input field for `serverData`
   - Button to save session state: `store.save({session: true})` or `store.save()`
   - Show loading/error states if needed

### Integration Points

- **Unified state model**: All state types coexist in `store.state`, blueprint extracts session properties
- **Blueprint extraction**: `blueprint(store.state, sessionTemplate)` filters unified state to extract only session properties
- **SSR hydration**: Updated session state automatically included via `getSessionData()`
- **Session lifecycle**: State persists across reloads, clears on server restart
- **Template structure**: Session template defines which properties in `store.state` are session-bound (can be at any nesting level)

## Examples

### Basic Usage

```typescript
// Update session state (unified state model - all properties coexist)
// Structure depends on session template - using 'session_data' to avoid confusion with storage type:
store.state.session_data.serverData = "Updated server data"

// Save session state explicitly (async)
await store.save({session: true})
// Extracts session properties using blueprint and calls POST /api/session

// Save all storage types (saved, tab, session) - async
await store.save()
// Saves to localStorage, sessionStorage, and session API
// localStorage/sessionStorage wrapped in Promise for consistency

// Save only specific storage types
await store.save({saved: true, session: true})
// Saves to localStorage and session API, skips sessionStorage

// Example: Multiple updates batched together
merge_deep(store.state, {
  session_data: { serverData: "new value", user: { name: "John" } },
  saved: { username: "user123" }
})
// Save all changes with single async call
await store.save()
// Batches all session updates into single API call
// POST /api/session { session_data: { serverData: "new value", user: { name: "John" }, ... } }

// Error handling
try {
  await store.save({session: true})
} catch (error) {
  console.error('Failed to save session state:', error)
}

// On next page reload, updated session state is hydrated via SSR into unified store.state
```

### UI Component

```tsx
<div>
  {/* Using 'session_data' property name to avoid confusion with 'session' storage type: */}
  <input
    value={store.state.session_data.serverData}
    oninput={(e) => {
      store.state.session_data.serverData = e.target.value
      // Updates unified store.state - blueprint determines this is session-bound
    }}
  />
  <button onclick={async () => {
    // Save session state explicitly (async)
    // Note: State changes already triggered redraw via signals, save() only persists data
    try {
      await store.save({session: true})
      // Extracts session properties using blueprint and calls API
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }}>
    Save Session State
  </button>
  
  {/* Multiple updates batched when save() is called */}
  <button onclick={async () => {
    // Multiple session updates batched into single API call
    merge_deep(store.state, {
      session_data: {
        serverData: "Updated",
        user: { name: "John" }
      },
      saved: { username: "user123" }
    })
    // State changes automatically trigger redraw via signals
    // Save all changes - batches session updates into single API call
    try {
      await store.save()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }}>
    Update Multiple Properties
  </button>
</div>
```

### Server Endpoint

```typescript
// POST /api/session
async function handleSessionUpdate(req: Request): Promise<Response> {
  const sessionId = extractSessionId(req)
  const { session_data } = await req.json()  // Property name avoids confusion with storage type
  
  sessionStore.updateSession(sessionId, { session_data })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

## References

- ADR-0007: Store SSR and Persistence Strategy
- Session Store Implementation: `examples/ssr/sessionStore.ts`
- Store API: `store.ts`
- SSR State Serialization: `render/ssrState.ts`
