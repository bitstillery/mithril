# ADR-0007: Store SSR and Persistence Strategy

**Status**: Proposed  
**Date**: 2025-01-23  
**Related ADRs**: [ADR-0005](./0005-state-naming-and-store-persistence.md) (State naming and Store persistence), [ADR-0006](./0006-unified-serialization-computed-properties.md) (Unified serialization/computed properties)

## Context

ADR-0005 introduced the `Store` class with three types of state: persistent (localStorage), volatile (not persisted), and session (sessionStorage). ADR-0006 unified Store's serialization/deserialization with SSR. However, there's a conceptual conflict between client-side persistent state and SSR state.

### Problem

**Current State:**

1. **Persistent state (localStorage)**:
   - Client-side only storage
   - Persists across browser sessions
   - Not available on server (no localStorage in Bun)
   - Makes sense for user preferences, settings, etc.

2. **Session state (sessionStorage)**:
   - Client-side only storage
   - Persists for browser tab session
   - Not available on server
   - Name is confusing - suggests server session, but it's browser sessionStorage

3. **SSR state**:
   - Server-rendered state serialized and sent to client
   - Used for hydration to match server-rendered content
   - Overwrites client-side state during deserialization
   - Different purpose than persistent storage

**Conflicts:**

1. **Naming confusion**: "session" suggests server session, but it's actually browser sessionStorage
2. **SSR vs persistence**: SSR state overwrites localStorage state, potentially losing user preferences
3. **Server-side persistence**: No mechanism for server-side persistent storage tied to user sessions
4. **State precedence**: Unclear which state takes precedence: SSR state or localStorage state
5. **Authentication flow**: After login, SSR needs to know user is authenticated, but JWT token is only in localStorage (client-side)

### Expected Behavior

After implementation:

1. **Clear separation**: Client-side persistence vs server-side session-bound state
2. **SSR hydration**: SSR state hydrates initial render without losing user preferences
3. **Server session support**: Optional fourth state type for server session-bound data
4. **Clear naming**: Rename "session" to avoid confusion with server sessions
5. **Authentication integration**: After login, SSR can determine user is authenticated via session state (JWT token decoded on server, identity included in session)

## Decision

We will clarify the relationship between Store persistence and SSR, and add support for server session-bound state:

1. **Clarify current "session" naming**: Rename to "tab" to clearly indicate tab-specific storage (sessionStorage)
2. **Add optional session state**: Fourth state type for server session-bound data (requires backend)
3. **Define state precedence**: SSR state hydrates, but user preferences persist
4. **Document SSR vs persistence strategy**: Clear guidance on when to use each

### Architecture Overview

**Unified State Architecture:**

The Store uses a **unified state model** where all storage types are mingled together in a single `store.state` object. Templates act as **blueprints** that determine which properties belong to which storage type.

**Key Design:**
- **Single unified state**: All state lives in `store.state` (persistent, volatile, tab, session properties coexist)
- **Templates as blueprints**: Templates define which properties belong to which storage type
- **Blueprint function**: `blueprint(state, template)` extracts only properties defined in template
- **Load process**: Properties from different storage types are merged into unified `store.state`
- **Save process**: `blueprint()` filters unified state to extract properties for each storage type

**State Types:**

1. **Persistent** (localStorage):
   - Client-side only
   - Survives browser restarts
   - Use for: User preferences, settings, cached data
   - Not available on server
   - **Template defines**: Which properties in `store.state` are persistent

2. **Volatile**:
   - Not persisted anywhere
   - Resets on page reload
   - Use for: UI state, temporary data
   - Available on both server and client
   - **Template defines**: Which properties in `store.state` are volatile

3. **Tab** (renamed from "session", sessionStorage):
   - Client-side only
   - Survives page reloads but clears when tab closes
   - Use for: Tab-specific state, temporary user data
   - Not available on server
   - **Name change**: Rename to avoid confusion with server sessions
   - **Template defines**: Which properties in `store.state` are tab-specific

4. **Session** (new, optional):
   - Server-side session storage (requires backend)
   - Tied to server session ID/cookie
   - Tied to user via session-to-user mapping (in-memory session store)
   - Hydrated via SSR state serialization (comes from server, not localStorage)
   - Not stored in localStorage - only exists via SSR state
   - Use for: Server-rendered data, session-bound content, user-specific state
   - Setting state: Uses same setters as other state variants (e.g., `store.state.user.field = value` where `user` is defined in session template)
   - Requires: Backend session storage mechanism (HTTP endpoint + in-memory session store)
   - **Template defines**: Which properties in `store.state` are server session-bound (no need for explicit `session` key - templates define any properties at any nesting level)

**Example:**
```typescript
// Unified state - all properties coexist
store.state = {
  count: 5,                    // persistent (defined in persistent template)
  currentView: 'home',         // volatile (defined in volatile template)
  sessionId: 'abc123',         // tab (defined in tab template)
  user: {                      // session (defined in session template)
    id: 'user123',
    name: 'John',
    preferences: {...}
  }
}

// Templates define what goes where (blueprints):
const persistent = { count: 0 }                    // Only 'count' is persistent
const volatile = { currentView: 'home' }          // Only 'currentView' is volatile
const tab = { sessionId: '' }                     // Only 'sessionId' is tab-specific
const session = {                           // Only 'user' and nested properties are server-bound
  user: {
    id: null,
    name: '',
    preferences: {}
  }
}

// Save uses blueprint to extract properties:
localStorage.setItem('store', JSON.stringify(blueprint(store.state, persistent)))     // Only 'count'
sessionStorage.setItem('store', JSON.stringify(blueprint(store.state, tab)))          // Only 'sessionId'
// Session saved via HTTP endpoint: blueprint(store.state, session)       // Only 'user.*'
```

**State Precedence:**

1. **Initial load (with SSR)**:
   - Load persistent state from localStorage (preserved, not overwritten by SSR)
   - Load tab state from sessionStorage (preserved, not overwritten by SSR)
   - Hydrate volatile state with SSR state (overwritten for hydration correctness)
   - Hydrate session state with SSR state (comes from server, not localStorage)
   - Restore computed properties

2. **Subsequent navigation (client-side)**:
   - Persistent state persists (localStorage, not overwritten by SSR)
   - Tab state persists (sessionStorage, not overwritten by SSR)
   - Volatile state reset and hydrated with SSR state (overwritten)
   - Session state hydrated with SSR state (from server)
   - User preferences (persistent/tab) preserved across SSR hydration

### Key Design Decisions

**1. Rename "session" to "tab"**

- **Current**: `session` parameter in `load()` → sessionStorage
- **Proposed**: `tab` parameter → sessionStorage
- **Rationale**: Clear, concise name that accurately describes tab-specific storage
- **Impact**: Breaking change, but clearer naming

**2. Add Optional Server Session State**

- **New parameter**: `session` in `load()` (optional)
- **Requires**: Backend session storage mechanism
- **Hydrated via**: SSR state serialization
- **Rationale**: Supports server-rendered, session-bound data
- **Impact**: New feature, backward compatible (optional)

**3. State Precedence Strategy**

- **Volatile state**: Overwritten by SSR state (not persisted, so SSR takes precedence)
- **Persistent state**: NOT overwritten by SSR state (user preferences preserved)
- **Tab state**: NOT overwritten by SSR state (tab-specific preferences preserved)
- **Session state**: Comes from SSR state (not stored in localStorage, only via SSR)
- **Rationale**: Balance between hydration correctness (volatile/session) and user experience (persistent/tab)
- **Impact**: Selective overwrite logic - volatile/session overwritten, persistent/tab preserved

**4. Server-Side Store Behavior**

- **On server**: Store's `load()` skips localStorage/sessionStorage (returns `'{}'`)
- **On server**: Volatile and session state are available
- **On server**: Session retrieved from backend HTTP endpoint
- **On server**: Session state serialized and included in SSR state
- **Rationale**: Server doesn't have browser storage, session comes from backend
- **Impact**: Store works differently on server vs client, but API is consistent

**5. Unified State with Blueprint Templates**

- **Unified state model**: All storage types coexist in single `store.state` object
- **Templates as blueprints**: Templates define which properties belong to which storage type
- **Blueprint function**: `blueprint(state, template)` extracts only properties defined in template
- **Load process**: Properties from different storage types merged into unified `store.state`
- **Save process**: `blueprint()` filters unified state to extract properties for each storage type
- **Rationale**: Single unified API, templates determine persistence strategy
- **Impact**: Developers define templates to control what goes where, Store handles the rest

**6. Session-to-User Mapping**

- **Session management**: Backend maintains in-memory session store
- **Session-to-user mapping**: Each session ID maps to a user identifier
- **Session creation**: Sessions created on first request, tied to user (via auth/login)
- **Session lifecycle**: Sessions persist in memory until expiration or logout
- **Simplicity**: In-memory storage for now (can be upgraded to Redis/database later)
- **Rationale**: Simple mechanism to tie server sessions to users
- **Impact**: Backend needs session management, but Store API remains unchanged

## Rationale

### Why Rename "session" to "tab"

1. **Clarity**: "session" is ambiguous - could mean browser session or server session
2. **Accuracy**: "tab" accurately describes tab-specific storage (sessionStorage)
3. **Conciseness**: Shorter, more intuitive name
4. **Future-proofing**: Leaves "session" available for server sessions
5. **Developer experience**: Clearer intent when reading code

### Why Add Server Session State

1. **Real-world need**: Many apps need server session-bound data
2. **SSR integration**: Server session data needs to be hydrated via SSR
3. **Separation of concerns**: Different from browser sessionStorage
4. **Flexibility**: Optional feature - apps without server sessions don't need it

### Why Define State Precedence

1. **Hydration correctness**: SSR state must match server-rendered content
2. **User experience**: User preferences should persist
3. **Predictability**: Clear rules for which state wins
4. **Documentation**: Helps developers understand behavior

### Why Server-Side Behavior Differs

1. **Reality**: Server doesn't have browser storage APIs (localStorage/sessionStorage)
2. **SSR needs**: Server needs to render with server session data from backend
3. **Hydration**: Server session data serialized and sent to client via SSR state
4. **Consistency**: Setting server session state uses same setters as other state types
5. **Simplicity**: Store gracefully handles missing storage APIs, backend handles persistence

### Why Session-to-User Mapping

1. **User context**: Server sessions need to be tied to users for personalized content
2. **Security**: Sessions should be scoped to authenticated users
3. **State isolation**: Each user's session state should be isolated
4. **Simplicity**: In-memory storage is simple to implement and sufficient for many use cases
5. **Upgrade path**: Can be upgraded to Redis/database later without changing Store API

## Consequences

### Pros

- **Clearer naming**: "tab" is more concise and accurate than "session"
- **Server session support**: Enables server-rendered, session-bound data
- **Better SSR integration**: Clear strategy for SSR vs persistence
- **Flexibility**: Optional server session feature
- **Documentation**: Clear guidance on state types and precedence

### Cons

- **Breaking change**: Renaming "session" to "tab"
- **Complexity**: Four state types instead of three
- **Backend requirement**: Server session requires backend implementation (HTTP endpoints + session store)
- **Session management**: Backend needs to manage session lifecycle and user mapping
- **In-memory limitations**: In-memory storage doesn't persist across server restarts
- **Merge logic**: May need complex merge logic for state precedence

### Risks

- **Naming migration**: All code using "session" needs updates
- **State precedence conflicts**: SSR state vs user preferences
- **Backend dependency**: Server session requires backend session storage and user mapping
- **Session persistence**: In-memory storage lost on server restart (can be mitigated with Redis/database)
- **Session security**: Need to ensure session IDs are secure and properly validated
- **Complexity**: More state types = more complexity for developers

## Alternatives Considered

**Option A: Keep current naming, add server session**

- **Rejected**: "session" name is too ambiguous
- **Rationale**: Confusion between browser sessionStorage and server sessions

**Option B: Don't add server session, document current behavior**

- **Rejected**: Real need for server session-bound data in SSR apps
- **Rationale**: Many apps need server session data hydrated via SSR

**Option C: Separate SSR state from Store persistence**

- **Rejected**: Store should handle all state types consistently
- **Rationale**: Unified API is better than separate mechanisms

**Option D: Rename and add server session (Chosen)**

- **Chosen**: Clear naming + server session support
- **Rationale**: Best balance of clarity and functionality

## Implementation Details

### Phase 1: Rename "session" to "tab"

**File**: `store.ts`

1. Rename `session` parameter to `tab` in `load()` method
2. Update internal references (`this.templates.session` → `this.templates.tab`)
3. Update `get_session_storage()` → `get_tab_storage()`
4. Update `set_session()` → `set_tab()`
5. Update `save()` method to use new naming

### Phase 2: Add Server Session Support

**File**: `store.ts`

1. Add `session` parameter to `load()` (optional)
2. Merge session into final_state for SSR (unified state model)
3. Include session in mergedInitial for computed properties
4. Update `save()` to use `blueprint()` for session (extract only properties defined in template)
5. Ensure `blueprint()` correctly filters session properties from unified state

**Backend Files** (example SSR application):

1. Create in-memory session store (`examples/ssr/sessionStore.ts`)
   - Map session IDs to user IDs and session data
   - Provide create/get/update/delete methods
   - Handle session expiration

2. Add HTTP endpoints (`examples/ssr/server.ts`)
   - GET `/api/session/:sessionId` - Retrieve session data
   - POST `/api/session/:sessionId` - Save session data
   - Session middleware to extract/create session IDs from requests
   - JWT middleware to decode tokens and identify users
   - Session-to-user mapping via JWT user ID claim (e.g., `sub`, `userId`, or custom claim)

**Backend Integration** (application-specific):

Server session state is handled via HTTP endpoints and in-memory session store. The backend provides:
- In-memory session store mapping session IDs to user IDs and session data
- GET endpoint to retrieve server session state for a session ID
- POST/PUT endpoint to save server session state for a session ID
- Session creation/management (tie sessions to users)
- JWT token validation and user identification

**Authentication Flow with Server Sessions:**

The typical flow is: **SSR → Client → Login → Session**

1. **Initial SSR (unauthenticated)**:
   - No JWT token in request
   - Server creates anonymous session (no userId)
   - Session state is empty or contains default values
   - SSR renders with unauthenticated state

2. **Client-side login**:
   - User enters credentials → gets pre-auth token
   - User enters OTP → gets JWT token
   - JWT token contains user ID (e.g., `sub`, `userId`, or custom claim) and `exp` (expiration)
   - JWT token stored in localStorage (client-side)
   - Identity state set with user ID, expiration, token, and user data
   - User data fetched and populated in identity state

3. **Post-login SSR**:
   - JWT token sent to server (via cookie or Authorization header)
   - Server decodes JWT to extract user ID (e.g., `sub`, `userId`, or custom claim)
   - Server creates/retrieves session tied to user ID
   - Server fetches user data and includes in session state
   - Session state includes identity: `{user: {...}, id: "...", ...}`
   - SSR renders with authenticated state

4. **Subsequent SSR requests**:
   - JWT token validated on server
   - Session retrieved/updated for that user
   - Session state includes current user identity
   - SSR renders with proper user context

```typescript
// Backend: In-memory session store
interface SessionStore {
  sessions: Map<string, {
    userId: string | null // null for anonymous sessions
    data: Record<string, any>
    createdAt: Date
    expiresAt: Date
  }>
  
  createSession(userId: string | null): string // Returns sessionId
  getSession(sessionId: string): { userId: string | null, data: Record<string, any> } | null
  getSessionByUserId(userId: string): string | null // Returns sessionId
  updateSession(sessionId: string, data: Record<string, any>): void
  deleteSession(sessionId: string): void
}

// On server-side (during SSR):
// 1. Extract JWT token from request (cookie or Authorization header)
const jwtToken = getJWTFromRequest(req)
let userId: string | null = null
let sessionId: string | null = null

if (jwtToken) {
  // Decode JWT to get user ID (e.g., from 'sub', 'userId', or custom claim)
  const claims = jwtDecode(jwtToken)
  userId = claims.sub || claims.userId || claims.user_id // Use standard or custom claim
  
  // Find existing session for this user, or create new one
  sessionId = sessionStore.getSessionByUserId(userId) || sessionStore.createSession(userId)
} else {
  // No JWT token - anonymous session
  sessionId = getSessionIdFromRequest(req) || sessionStore.createSession(null)
}

const session = sessionStore.getSession(sessionId)
let serverData = session?.data || {}

// 2. If authenticated, include identity in session state
if (userId) {
  const userData = await getUserData(userId) // Fetch user data from backend
  serverData = {
    ...serverData,
    user: {  // Properties defined in session template (e.g., 'user')
      id: userId,
      name: userData.name,
      preferences: userData.preferences,
      // Note: token not included in session (security)
    }
  }
}

// 3. Pass serverData as session template to Store.load()
// Templates define which properties belong to which storage type
store.load(persistent, volatile, tab, serverData)

// 4. Server session state is serialized with SSR state and sent to client

// On client-side (after SSR hydration):
// 1. Server session state is hydrated from SSR state
// 2. Identity is available: store.state.user.id (where 'user' is defined in session template)
// 3. Setting session state uses same setters (properties defined in session template):
store.state.user.preferences.theme = 'dark'

// 4. Changes can be persisted back to server via HTTP endpoint:
// Use blueprint to extract only properties defined in session template
const sessionData = store.blueprint(store.state, sessionTemplate)
await fetch(`/api/session/${sessionId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include JWT
  },
  body: JSON.stringify(sessionData)  // Only properties defined in session template
})
```

**Key Authentication Points:**
- JWT token contains user ID (e.g., `sub`, `userId`, or custom claim) - decoded on server
- Server creates/retrieves session tied to user ID
- Identity included in session template (user data, id) - properties defined in session template
- JWT token itself NOT stored in session template (security)
- After login, SSR can determine login state via properties defined in session template (e.g., `store.state.user.id`)
- Identity checks work via properties defined in session template (e.g., `store.state.user.id`)

**Key Points:**
- **Unified state model**: All state types (persistent, volatile, tab, session) coexist in `store.state`
- **Templates as blueprints**: Templates define which properties belong to which storage type
- **Blueprint function**: Used to extract properties for each storage type during save/load
- Server session state is NOT stored in localStorage
- Server session state comes from SSR state serialization
- Setting server session state uses the same reactive setters as other state types
- Backend maintains in-memory session store mapping sessions to users
- Sessions are tied to users via session-to-user mapping
- In-memory storage for simplicity (can be upgraded to Redis/database later)

**Blueprint Function Usage:**
```typescript
// Save: Extract only properties defined in template
const persistentData = blueprint(store.state, persistentTemplate)  // Only persistent properties
const tabData = blueprint(store.state, tabTemplate)              // Only tab properties
const sessionData = blueprint(store.state, sessionTemplate) // Only session properties

// Load: Merge properties from different storage types into unified state
store.state = merge(persistentData, volatileData, tabData, sessionData)
```

### Phase 3: Define State Precedence

**File**: `store.ts`, `render/ssrState.ts`

1. Document state precedence in code comments
2. Consider merge strategy for SSR state vs user preferences
3. Update `deserializeAllStates()` to handle precedence
4. Add tests for state precedence scenarios

### Phase 4: Update Documentation and Examples

**Files**: `examples/**/*.ts`, `docs/**/*.md`

1. Update examples to use `tab` instead of `session`
2. Add example of server session usage
3. Document state precedence strategy
4. Update ADR-0005 to reference this ADR

## Related ADRs

- [ADR-0005](./0005-state-naming-and-store-persistence.md) - Introduced Store with persistent/volatile/session, now being refined
- [ADR-0006](./0006-unified-serialization-computed-properties.md) - Unified serialization, now needs SSR persistence strategy

## References

- Store implementation: `mithril/store.ts`
- SSR serialization: `mithril/render/ssrState.ts`
- Browser storage APIs: localStorage, sessionStorage
- Server session storage: Application-specific (cookies, Redis, database, etc.)
