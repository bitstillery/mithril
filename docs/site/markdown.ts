import {marked} from 'marked'
import {gfmHeadingId, getHeadingList} from 'marked-gfm-heading-id'
import {readFile} from 'fs/promises'
import {join} from 'path'

marked.use(gfmHeadingId())

// Configure marked - add language-* class for Prism.js highlighting
marked.use({
    gfm: true,
    breaks: false,
    renderer: {
        code(token: {text: string; lang?: string}) {
            const lang = token.lang || ''
            const langClass = lang ? `language-${lang}` : ''
            const escaped = (token.text || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
            return langClass
                ? `<pre class="${langClass}"><code class="${langClass}">${escaped}</code></pre>\n`
                : `<pre><code>${escaped}</code></pre>\n`
        },
    },
})

export interface DocPage {
    title: string
    content: string
    metaDescription: string
    /** Table of contents for sidebar - generated from headings */
    pageToc?: string
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

const h1UlHrPattern = /(<h1[^>]*>[\s\S]*?<\/h1>\s*)(<ul[^>]*>[\s\S]*?<\/ul>)(\s*<hr\/?>)/

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function buildPageTocFromHeadings(): string | undefined {
    const headings = getHeadingList()
    const subHeadings = headings.filter((h) => h.level === 3)
    if (subHeadings.length === 0) return undefined
    const items = subHeadings
        .map((h) => `<li><a href="#${h.id}">${escapeHtml(h.raw)}</a></li>`)
        .join('\n')
    return `<ul class="docs-sidebar-toc">\n${items}\n</ul>`
}

export async function loadMarkdownFile(filePath: string): Promise<DocPage> {
    const markdown = await readFile(filePath, 'utf-8')
    let html = marked.parse(markdown) as string
    const title = extractTitle(markdown)
    const metaDescription = extractMetaDescription(markdown)

    const pageToc = buildPageTocFromHeadings()

    const match = html.match(h1UlHrPattern)
    if (match && typeof match.index === 'number') {
        html = html.slice(0, match.index) + match[1] + html.slice(match.index + match[0].length)
    }

    return {
        title,
        content: html,
        metaDescription,
        pageToc,
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
