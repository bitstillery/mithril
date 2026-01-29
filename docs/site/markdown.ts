import {marked} from 'marked'
import {readFile} from 'fs/promises'
import {join} from 'path'

// Configure marked
marked.setOptions({
	gfm: true,
	breaks: false,
})

export interface DocPage {
	title: string
	content: string
	metaDescription: string
}

const metaDescriptionRegex = /<!--meta-description\n([\s\S]+?)\n-->/m

function extractMetaDescription(markdown: string, defaultDesc: string = 'Mithril.js Documentation'): string {
	const match = markdown.match(metaDescriptionRegex)
	return match ? match[1].trim() : defaultDesc
}

function extractTitle(markdown: string): string {
	const h1Match = markdown.match(/^#\s+(.+)$/m)
	return h1Match ? h1Match[1] : 'Mithril.js'
}

export async function loadMarkdownFile(filePath: string): Promise<DocPage> {
	const markdown = await readFile(filePath, 'utf-8')
	const html = marked.parse(markdown) as string
	const title = extractTitle(markdown)
	const metaDescription = extractMetaDescription(markdown)
	
	return {
		title,
		content: html,
		metaDescription,
	}
}

export async function loadMarkdownFromDocs(docName: string): Promise<DocPage | null> {
	try {
		// Load from the docs repo
		// From mithril/docs/site, go up 3 levels to get to /home/jeroen/code
		const docsPath = join(import.meta.dir, '../../..', 'docs', 'docs', `${docName}.md`)
		return await loadMarkdownFile(docsPath)
	} catch (error) {
		// Log error for debugging
		console.error(`Failed to load markdown: ${docName}`, error)
		return null
	}
}
