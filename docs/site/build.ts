import {mkdir} from 'fs/promises'
import {join} from 'path'

import {build} from 'bun'

const publicDir = join(import.meta.dir, 'public')
// Use source template (has client.tsx), not public/index.html which is build output
const indexHtml = join(import.meta.dir, 'index.html')

// Ensure public directory exists
await mkdir(publicDir, {recursive: true})

// Build from HTML entry point - index.html references client.tsx, Bun bundles it
const result = await build({
    entrypoints: [indexHtml],
    outdir: publicDir,
    target: 'browser',
    jsx: {
        factory: 'm',
        fragment: 'm.Fragment',
        runtime: 'classic',
    },
    minify: false,
})

if (!result.success) {
    console.error('Build failed:', result.logs)
    process.exit(1)
}

console.log('Build complete! Output:', publicDir)
