# Mithril SSR Test Project

Simple Bun project to test and demonstrate server-side rendering with Mithril.

## Setup

```bash
# Install dependencies
bun install

# Run the server
bun run dev
```

Visit http://localhost:3000 to see the SSR in action.

## Features Demonstrated

- ✅ Basic SSR rendering
- ✅ Component rendering to HTML
- ✅ Async data fetching with `waitFor`
- ✅ TypeScript support
- ✅ JSX/TSX support (using Bun's native JSX runtime)
- ✅ Shared App component for server and client

## Project Structure

- `server.ts` - Bun HTTP server with SSR
- `index.tsx` - Document component that renders the full HTML structure
- `components/` - Mithril components
  - `App.tsx` - Main app component (shared between server and client)
  - `Home.tsx` - Home page component
  - `AsyncData.tsx` - Async data fetching example component
- `routes.ts` - Route definitions

## Testing SSR

1. Start the server: `bun run dev`
2. Visit http://localhost:3000
3. View page source to see server-rendered HTML
4. Check network tab - HTML includes rendered content (no client-side only rendering)

## Async Data Fetching

Visit http://localhost:3000/async to see async data fetching:
- Component uses `waitFor` in `oninit`
- Server waits for promise before rendering
- HTML includes fetched data
