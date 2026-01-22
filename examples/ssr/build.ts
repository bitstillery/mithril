import {mkdir} from 'fs/promises'
import {join} from 'path'

import {build} from 'bun'

const publicDir = join(import.meta.dir, 'public')

// Ensure public directory exists
await mkdir(publicDir, {recursive: true})

// Build client bundle
const result = await build({
	entrypoints: ['client.tsx'],
	outdir: publicDir,
	format: 'esm',
	target: 'browser',
	jsx: {
		factory: 'm',
		fragmentFactory: 'm.fragment',
		runtime: 'classic',
	},
	minify: false,
	sourcemap: 'inline',
	naming: 'app.js',
	outfile: join(publicDir, 'app.js'),
})

if (!result.success) {
	console.error('Build failed:', result.logs)
	process.exit(1)
}

console.log('Build complete! Output:', publicDir)
