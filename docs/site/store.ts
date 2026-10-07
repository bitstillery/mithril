import {Store} from '../../src/index'
import {deserializeStore} from '../../src/ssr/serialize'
import type {DocPage} from './markdown'

export interface NavSection {
    title: string
    links: Array<{text: string; href: string; external?: boolean}>
}

export interface DocsState {
    page: DocPage | null
    pendingPage: DocPage | null
    navGuides: NavSection[]
    navMethods: NavSection[]
    pendingNavGuides: NavSection[]
    pendingNavMethods: NavSection[]
    loading: boolean
    error: string | null
    routePath: string
}

/** Global site store: perf (persisted), docs (volatile). */
export interface SiteStoreState {
    perf: {rows: number; depth: number; mutations: number}
    docs: DocsState
}

/** Persisted to localStorage — survives reload. */
const saved: Partial<SiteStoreState> = {
    perf: {rows: 80, depth: 10, mutations: 0.5},
}

/** Volatile — not persisted (docs comes from SSR/hydration). */
const temporary: Partial<SiteStoreState> = {
    docs: {
        page: null,
        pendingPage: null,
        navGuides: [],
        navMethods: [],
        pendingNavGuides: [],
        pendingNavMethods: [],
        loading: true,
        error: null,
        routePath: '/',
    },
}

/** SessionStorage — survives reload, clears when tab closes. */
const tab: Partial<SiteStoreState> = {}

/** Docs-specific key so other apps on the same origin keep their own storage. */
const DOCS_STORAGE_KEY = 'mithril-docs-store'

export const $s = new Store<SiteStoreState>({storageKey: DOCS_STORAGE_KEY})

/** Call at app bootstrap to load persisted state from localStorage. */
export function initStore(): void {
    $s.load(saved, temporary, tab)
}

// Ensure store is populated so $docs exists (needed for SSR and client)
initStore()

/** Docs state lives in the store (volatile, hydrated from SSR). */
export const $docs = $s.state.docs
