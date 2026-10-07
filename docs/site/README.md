# Mithril Docs Site

The documentation site for Mithril, Bitstillery edition — server-rendered with this library and Bun.

## Setup

```bash
bun install
```

## Development

```bash
bun run dev
```

This starts the development server with hot reloading at `http://localhost:3000`.

## Build

```bash
bun run build
```

This builds the client bundle for production.

## Production

```bash
bun run start
```

## Structure

- `server.ts` - SSR server using Bun
- `client.tsx` - Client-side hydration
- `routes.ts` - Route definitions mapping paths to markdown files
- `components/` - React-like components using Mithril TSX
- `markdown.ts` - Markdown parsing utilities
- `nav.ts` - Navigation menu loading
- `public/` - Static assets (CSS, images, HTML template)
- `build.ts` - Build script for client bundle

## Features

- Server-side rendering (SSR) with hydration
- Markdown to HTML conversion
- Navigation menus (guides and API)
- Hot module reloading in development

## Notes

Pages are the Markdown files in `content/`; the sidebar is parsed from `content/nav-guides.md` and
`content/nav-methods.md`. A path with no matching file renders the 404 page.
