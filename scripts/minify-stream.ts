#!/usr/bin/env bun
/* eslint-disable no-process-exit */

import { readFile, writeFile } from "fs/promises"
import { resolve, dirname } from "path"
import { gzipSync } from "zlib"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function format(n: number): string {
	return n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
}

async function minify() {
	const input = resolve(__dirname, "../stream/stream.ts")
	const output = resolve(__dirname, "../stream/stream.min.js")
	
	// Use Bun to build and minify
	const result = await Bun.build({
		entrypoints: [input],
		outdir: resolve(__dirname, "../stream"),
		minify: true,
		target: "browser",
	})
	
	if (!result.success) {
		throw new Error("Build failed: " + result.logs.map(l => l.message).join(", "))
	}
	
	// Read the minified output
	const minifiedCode = await readFile(output.replace(".ts", ".js"), "utf-8")
	await writeFile(output, minifiedCode, "utf-8")
	
	const original = await readFile(input, "utf-8")
	const originalSize = Buffer.byteLength(original, "utf-8")
	const compressedSize = Buffer.byteLength(minifiedCode, "utf-8")
	const originalGzipSize = gzipSync(original).byteLength
	const compressedGzipSize = gzipSync(minifiedCode).byteLength

	console.log("Original size: " + format(originalGzipSize) + " bytes gzipped (" + format(originalSize) + " bytes uncompressed)")
	console.log("Compiled size: " + format(compressedGzipSize) + " bytes gzipped (" + format(compressedSize) + " bytes uncompressed)")
}

minify().catch((e) => {
	console.error(e.stack)
	process.exitCode = 1
	process.exit()
})
