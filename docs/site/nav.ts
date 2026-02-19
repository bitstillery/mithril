import {readFile} from 'fs/promises'
import {join} from 'path'
import {marked} from 'marked'
import type {NavSection} from './store'

export async function getNavGuides(): Promise<string> {
    if (typeof window !== 'undefined') return ''
    try {
        const content = await readFile(join(import.meta.dir, 'content', 'nav-guides.md'), 'utf-8')
        return marked.parse(content) as string
    } catch {
        return ''
    }
}

export async function getNavMethods(): Promise<string> {
    if (typeof window !== 'undefined') return ''
    try {
        const content = await readFile(join(import.meta.dir, 'content', 'nav-methods.md'), 'utf-8')
        return marked.parse(content) as string
    } catch {
        return ''
    }
}

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/

function parseNavToStructure(markdown: string): NavSection[] {
    const sections: NavSection[] = []
    let currentSection: NavSection | null = null

    for (const line of markdown.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue

        const linkMatch = trimmed.match(linkRegex)
        const isNested = line.startsWith('\t') || line.startsWith('  ')

        if (linkMatch) {
            const [, text, href] = linkMatch
            const external = href.startsWith('http')
            if (isNested && currentSection) {
                currentSection.links.push({text, href, external})
            } else {
                currentSection = {title: text, links: [{text, href, external}]}
                sections.push(currentSection)
            }
        } else if (!isNested && trimmed.startsWith('- ')) {
            const title = trimmed.slice(2).trim()
            currentSection = {title, links: []}
            sections.push(currentSection)
        }
    }
    return sections
}

export async function getNavGuidesStructure(): Promise<NavSection[]> {
    if (typeof window !== 'undefined') return []
    try {
        const content = await readFile(join(import.meta.dir, 'content', 'nav-guides.md'), 'utf-8')
        return parseNavToStructure(content)
    } catch {
        return []
    }
}

export async function getNavMethodsStructure(): Promise<NavSection[]> {
    if (typeof window !== 'undefined') return []
    try {
        const content = await readFile(join(import.meta.dir, 'content', 'nav-methods.md'), 'utf-8')
        return parseNavToStructure(content)
    } catch {
        return []
    }
}
