# ADR-0009: SSR Server Component Abstraction

**Status**: Proposed  
**Date**: 2025-01-23  
**Related ADRs**: [ADR-0001](./0001-ssr-hydration.md) (SSR Hydration Support), [ADR-0008](./0008-session-state-update-api.md) (Session State Update API)

## Context

The SSR example (`examples/ssr/server.ts`) contains server-side rendering logic that is useful for any SSR application using Mithril. Currently, this logic is embedded in the example and not easily reusable. Developers building SSR applications need to copy and adapt this code, leading to duplication and inconsistency.

### Problem

**Current State:**

1. **SSR logic embedded in example**: Server-side rendering, state management, and session handling are all in `examples/ssr/server.ts`
2. **Not reusable**: Other applications need to copy and adapt the example code
3. **Session management mixed with SSR**: Session store and SSR rendering are tightly coupled in the example
4. **No abstraction**: No reusable utilities for common SSR patterns
5. **Server utilities scattered**: Server-related code is in `server.ts` but SSR utilities are in example

**Issues:**

- Code duplication across SSR applications
- Inconsistent implementations
- Hard to maintain (changes need to be copied to all applications)
- Difficult to test SSR logic independently
- No clear organization for server-side utilities

### Expected Behavior

After implementation:

1. **Reusable SSR utilities**: Common SSR patterns available in `server/utils/` directory
2. **Bun-specific APIs acceptable**: SSR requires Bun, so Bun-specific APIs are fine
3. **Session abstraction**: Session management abstracted via interface, not concrete implementation
4. **Organized structure**: Server utilities organized in `server/` directory (e.g., `server/utils/session.ts`)
5. **Easy to use**: Simple API for creating SSR responses and handling session updates
6. **Backward compatible**: Existing example continues to work, now uses abstracted utilities

## Decision

We will abstract reusable SSR server components from the example into the Mithril library:

1. **Create `server/` directory**: New directory structure for server-side utilities
2. **Organize utilities**: Place SSR utilities in `server/utils/` (e.g., `server/utils/session.ts`, `server/utils/ssr.ts`)
3. **SSR Response Creator**: `createSSRResponse()` function for rendering routes and injecting state
4. **Session Management Helpers**: Generic helpers for session ID extraction and session update handling
5. **Session Store Interface**: Define interface for session stores (allows different implementations)
6. **Bun-specific APIs**: Use Bun-specific APIs as required (SSR requires Bun)
7. **Export from `server.ts`**: Make SSR utilities available via `mithril/server`

### Architecture Overview

**Reusable Components:**

1. **`createSSRResponse()`**: Bun-specific SSR response creator
   - Clears state registry
   - Initializes store with session data (via callback)
   - Renders route to HTML
   - Injects serialized state into HTML template
   - Returns Response with session cookie

2. **`createSessionUpdateHandler()`**: Generic session update API handler factory
   - Accepts session store interface
   - Handles POST `/api/session` requests
   - Extracts session ID from cookies
   - Updates session store with state

3. **Session Store Interface**: Abstract interface for session management
   - `getSession(sessionId): SessionData | null`
   - `updateSession(sessionId, data): void`
   - `createSession(userId): string`
   - Applications provide their own implementation

**Key Design:**

- **Bun-specific APIs**: SSR utilities use Bun APIs (SSR requires Bun)
- **Session abstraction**: Session store provided via interface, not concrete class
- **Callbacks for customization**: Store initialization, route resolution via callbacks
- **Organized structure**: Server utilities in `server/utils/` directory

**API Design:**

```typescript
// server/utils/session.ts

export interface SessionStore {
  getSession(sessionId: string): SessionData | null
  updateSession(sessionId: string, data: Record<string, any>): void
  createSession(userId: string | null): string
}

export interface SessionData {
  userId: string | null
  data: Record<string, any>
  createdAt: Date
  expiresAt: Date
}

// server/utils/ssr.ts

export interface SSROptions {
  routes: Record<string, any>
  initStore: (sessionData: any) => void
  getSessionData: (req: Request) => {sessionData: any, sessionId: string}
  getHtmlTemplate: () => Promise<string>
  appSelector?: string  // Default: '#app'
  stateScriptId?: string  // Default: '__SSR_STATE__'
}

export async function createSSRResponse(
  pathname: string,
  req: Request,
  options: SSROptions
): Promise<Response>

export function createSessionUpdateHandler(
  sessionStore: SessionStore,
  extractSessionId: (req: Request) => string | null
): (req: Request) => Promise<Response>
```

## Rationale

### Why Abstract SSR Components

1. **Reusability**: Common SSR patterns should be reusable across applications
2. **Consistency**: Standardized SSR implementation reduces bugs and inconsistencies
3. **Maintainability**: Single source of truth for SSR logic
4. **Developer experience**: Easier to build SSR applications with reusable utilities
5. **Testing**: Abstracted utilities can be tested independently

### Why Bun-Specific APIs

1. **SSR requirement**: SSR requires Bun runtime, so Bun-specific APIs are acceptable
2. **Simpler implementation**: No need for framework abstraction layer
3. **Better performance**: Direct Bun APIs are more efficient than abstractions
4. **Consistency**: All SSR utilities use same runtime, reducing complexity

### Why Session Store Interface

1. **Flexibility**: Applications can use Redis, database, or in-memory stores
2. **Testability**: Easy to mock for testing
3. **Separation of concerns**: SSR logic separate from session storage implementation
4. **Upgrade path**: Applications can upgrade session storage without changing SSR code

### Why Callbacks for Customization

1. **Flexibility**: Applications customize store initialization, route resolution
2. **Framework integration**: Works with different routing and state management approaches
3. **Backward compatible**: Existing code patterns continue to work

## Consequences

### Pros

- **Reusability**: SSR utilities can be used across applications
- **Consistency**: Standardized SSR implementation
- **Maintainability**: Single source of truth for SSR logic
- **Bun integration**: Direct use of Bun APIs for optimal performance
- **Session flexibility**: Applications choose their own session storage
- **Developer experience**: Easier to build SSR applications
- **Organized structure**: Clear separation in `server/utils/` directory

### Cons

- **Abstraction overhead**: Additional layer of abstraction
- **API surface**: New APIs to learn and maintain
- **Breaking changes**: Changes to abstracted APIs affect all users
- **Documentation**: Need to document new APIs and patterns
- **Bun requirement**: SSR utilities require Bun runtime (acceptable trade-off)

### Risks

- **Over-abstraction**: Too much abstraction makes it harder to customize
- **API design**: Poor API design makes utilities hard to use
- **Bun lock-in**: SSR utilities tied to Bun (acceptable for SSR requirement)
- **Session interface**: Interface may not cover all use cases
- **Migration**: Existing code needs to migrate to new APIs

## Alternatives Considered

**Option A: Keep SSR logic in example only**

- **Rejected**: Leads to code duplication and inconsistency
- **Rationale**: Common patterns should be reusable

**Option B: Framework-specific abstractions (Bun-only)**

- **Chosen**: SSR requires Bun, so Bun-specific APIs are acceptable
- **Rationale**: No need for framework abstraction when Bun is required

**Option C: Full SSR framework**

- **Rejected**: Too much abstraction, loses flexibility
- **Rationale**: Utilities provide common patterns without forcing structure

**Option D: Abstract reusable utilities (Chosen)**

- **Chosen**: Balance of reusability and flexibility
- **Rationale**: Provides common patterns while allowing customization

## Implementation Details

### New Directory Structure: `server/utils/`

Create new utilities directory:
- `server/utils/session.ts` - Session store interface and helpers
- `server/utils/ssr.ts` - SSR response creation and session update handlers

### New File: `server/utils/session.ts`

```typescript
export interface SessionStore {
  getSession(sessionId: string): SessionData | null
  updateSession(sessionId: string, data: Record<string, any>): void
  createSession(userId: string | null): string
}

export interface SessionData {
  userId: string | null
  data: Record<string, any>
  createdAt: Date
  expiresAt: Date
}

export function extractSessionId(req: Request): string | null {
  const cookies = req.headers.get('cookie') || ''
  const sessionIdMatch = cookies.match(/sessionId=([^;]+)/)
  return sessionIdMatch ? sessionIdMatch[1] : null
}
```

### New File: `server/utils/ssr.ts`

```typescript
import m from '../../server'
import {clearStateRegistry} from '../../state'
import {serializeAllStates} from '../../render/ssrState'
import type {SessionStore} from './session'

export interface SessionStore {
  getSession(sessionId: string): SessionData | null
  updateSession(sessionId: string, data: Record<string, any>): void
  createSession(userId: string | null): string
}

export interface SessionData {
  userId: string | null
  data: Record<string, any>
  createdAt: Date
  expiresAt: Date
}

export interface SSROptions {
  routes: Record<string, any>
  initStore: (sessionData: any) => void
  getSessionData: (req: Request) => {sessionData: any, sessionId: string}
  getHtmlTemplate: () => Promise<string>
  appSelector?: string
  stateScriptId?: string
}

export async function createSSRResponse(
  pathname: string,
  req: Request,
  options: SSROptions
): Promise<Response> {
  // Clear state registry
  clearStateRegistry()
  
  // Initialize store with session data
  const {sessionData, sessionId} = options.getSessionData(req)
  options.initStore(sessionData)
  
  // Render route to HTML
  const result = await m.route.resolve(pathname, options.routes, m.renderToString)
  const appHtml = typeof result === 'string' ? result : result.html
  const serializedState = typeof result === 'string' ? {} : result.state
  
  // Get HTML template
  let html = await options.getHtmlTemplate()
  
  // Inject SSR content and state
  const appSelector = options.appSelector || '#app'
  html = html.replace(`<div id="${appSelector.slice(1)}"></div>`, `<div id="${appSelector.slice(1)}">${appHtml}</div>`)
  
  const stateScriptId = options.stateScriptId || '__SSR_STATE__'
  const stateScript = `<script id="${stateScriptId}" type="application/json">${JSON.stringify(serializedState)}</script>`
  html = html.replace('</head>', `${stateScript}</head>`)
  
  // Return response with session cookie
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax`,
    },
  })
}

export function createSessionUpdateHandler(
  sessionStore: SessionStore,
  extractSessionId: (req: Request) => string | null
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const sessionId = extractSessionId(req)
    
    if (!sessionId) {
      return new Response('No session ID', { status: 401 })
    }
    
    try {
      const body = await req.json()
      const sessionData = body.session_data || body.session || {}
      sessionStore.updateSession(sessionId, { session_data: sessionData })
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error updating session:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

export function createSessionUpdateHandler(
  sessionStore: SessionStore,
  extractSessionId: (req: Request) => string | null
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const sessionId = extractSessionId(req)
    
    if (!sessionId) {
      return new Response('No session ID', { status: 401 })
    }
    
    try {
      const body = await req.json()
      const sessionData = body.session_data || body.session || {}
      sessionStore.updateSession(sessionId, { session_data: sessionData })
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error updating session:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
```

### Update `server.ts`

```typescript
// Export SSR server utilities
export * from './utils/ssr'
export * from './utils/session'
```

### Refactor `examples/ssr/server.ts`

```typescript
import {readFile} from 'fs/promises'
import {join} from 'path'
import {createSSRResponse, createSessionUpdateHandler} from '../../server/utils/ssr'
import {extractSessionId} from '../../server/utils/session'
import {sessionStore} from './sessionStore'
import {initStore} from './store'
import {routes} from './routes'
import htmlTemplate from './public/index.html'

// Use abstracted SSR utilities
const handleSSR = async (pathname: string, req: Request) => {
  return await createSSRResponse(pathname, req, {
    routes,
    initStore,
    getSessionData: (req) => getSessionData(req),
    getHtmlTemplate: getProcessedTemplate,
  })
}

const handleSessionUpdate = createSessionUpdateHandler(
  sessionStore,
  extractSessionId
)
```

## Examples

### Basic Usage

```typescript
import {createSSRResponse, createSessionUpdateHandler} from 'mithril/server/utils/ssr'
import {extractSessionId} from 'mithril/server/utils/session'

// Create SSR response
const response = await createSSRResponse(pathname, req, {
  routes: myRoutes,
  initStore: (sessionData) => {
    // Initialize your store with session data
    myStore.init(sessionData)
  },
  getSessionData: (req) => {
    // Extract session data from request
    return {sessionData: {...}, sessionId: '...'}
  },
  getHtmlTemplate: async () => {
    // Get HTML template
    return await readFile('index.html', 'utf-8')
  }
})

// Create session update handler
const sessionHandler = createSessionUpdateHandler(mySessionStore, extractSessionId)
```

### Bun Server Integration

```typescript
import {createSSRResponse} from 'mithril/server/utils/ssr'
import {createSessionUpdateHandler} from 'mithril/server/utils/ssr'
import {extractSessionId} from 'mithril/server/utils/session'

Bun.serve({
  async fetch(req) {
    const url = new URL(req.url)
    
    if (url.pathname === '/api/session' && req.method === 'POST') {
      return await handleSessionUpdate(req)
    }
    
    if (shouldSSR(url.pathname)) {
      return await createSSRResponse(url.pathname, req, options)
    }
    
    return undefined
  }
})
```

## References

- ADR-0001: SSR Hydration Support
- ADR-0008: Session State Update API
- SSR Example: `examples/ssr/server.ts`
- Session Store Example: `examples/ssr/sessionStore.ts`
