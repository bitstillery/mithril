# Mithril Docs Site

A minimal SSR-based documentation site for Mithril.js, built using Bun and Mithril SSR patterns.

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
- Responsive design matching the Mithril.js website
- Hot module reloading in development

## Notes

The site expects markdown files to be in `/home/jeroen/code/docs/docs/`. If files are not found, a 404 page will be displayed.
