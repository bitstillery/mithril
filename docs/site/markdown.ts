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
	// Only load markdown on server (Bun/Node.js), not in browser
	if (typeof window !== 'undefined') {
		return null
	}
	
	try {
		// Load from in-repo content (mithril/docs/site/content/)
		const docsPath = join(import.meta.dir, 'content', `${docName}.md`)
		return await loadMarkdownFile(docsPath)
	} catch {
		return null
	}
}
