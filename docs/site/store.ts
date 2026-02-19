import {state} from '../../index'
import type {DocPage} from './markdown'

export interface NavSection {
    title: string
    links: Array<{text: string; href: string; external?: boolean}>
}

export const $docs = state(
    {
        page: null as DocPage | null,
        navGuides: [] as NavSection[],
        navMethods: [] as NavSection[],
        loading: true,
        error: null as string | null,
        routePath: '/',
    },
    'docs',
)
