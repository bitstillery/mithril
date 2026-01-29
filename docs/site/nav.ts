import {readFile} from 'fs/promises'
import {join} from 'path'
import {marked} from 'marked'

export async function getNavGuides(): Promise<string> {
	// Only load nav on server, not in browser
	if (typeof window !== 'undefined' || !import.meta.dir) {
		return ''
	}
	
	try {
		const navPath = join(import.meta.dir, '../../..', 'docs', 'docs', 'nav-guides.md')
		const content = await readFile(navPath, 'utf-8')
		return marked.parse(content) as string
	} catch (error) {
		console.error('Failed to load nav-guides.md', error)
		return ''
	}
}

export async function getNavMethods(): Promise<string> {
	// Only load nav on server, not in browser
	if (typeof window !== 'undefined' || !import.meta.dir) {
		return ''
	}
	
	try {
		const navPath = join(import.meta.dir, '../../..', 'docs', 'docs', 'nav-methods.md')
		const content = await readFile(navPath, 'utf-8')
		return marked.parse(content) as string
	} catch (error) {
		console.error('Failed to load nav-methods.md', error)
		return ''
	}
}
