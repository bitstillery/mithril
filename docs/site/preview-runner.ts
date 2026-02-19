/**
 * Preview iframe entry point. Exposes m, html, state, MithrilComponent to global, listens for code to run.
 */
import m, {state, MithrilComponent} from '../../index'
import {html} from '../../htm'

;(globalThis as any).m = m
;(globalThis as any).html = html
;(globalThis as any).state = state
;(globalThis as any).MithrilComponent = MithrilComponent

// Use m.mount for m.render so both go through the same code path (fixes standalone m.render)
m.render = (dom: Element, vnodes: any) => {
    m.mount(dom, {view: () => vnodes})
}

function getPreviewRoot(): HTMLElement {
    let el = document.getElementById('preview-root')
    if (!el) {
        el = document.createElement('div')
        el.id = 'preview-root'
        document.body.insertBefore(el, document.body.firstChild)
    }
    return el
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

addEventListener('message', (e: MessageEvent) => {
    const {type, code} = e.data ?? {}
    if (type !== 'run' || typeof code !== 'string') return
    const root = getPreviewRoot()
    try {
        root.innerHTML = ''
        // Indirect eval runs in global scope where m and html are defined
        ;(0, eval)(code)
    } catch (err) {
        const msg = err instanceof Error ? (err.stack ?? err.message) : String(err)
        root.innerHTML = `<pre style="color:#c00;padding:1em;font-family:monospace;white-space:pre-wrap">${escapeHtml(msg)}</pre>`
    }
})

// Signal ready after listener is set up (parent may post "run" immediately)
try {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({type: 'preview-ready'}, '*')
    }
} catch {
    /* cross-origin */
}
