import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

/** Transform code for browser eval: strip imports, inject root when needed. */
function prepareCodeForPreview(code: string): string {
    let out = code
        // ES module imports (works for mithril, @bitstillery/mithril, etc.)
        .replace(/^\s*import\s+\{?\s*html\s*\}?\s+from\s+["'][^"']*mithril[^"']*["']\s*;?\s*$/gm, '')
        .replace(/^\s*import\s+m\s+from\s+["'][^"']*mithril[^"']*["']\s*;?\s*$/gm, '')
        .replace(/^\s*import\s+\{[^}]*\}\s+from\s+["'][^"']*mithril[^"']*["']\s*;?\s*$/gm, '')
        .replace(/^\s*import\s+m\s*,\s*\{[^}]*\}\s+from\s+["'][^"']*mithril[^"']*["']\s*;?\s*$/gm, '')
        // CommonJS: var m = require('mithril') → var m = globalThis.m
        .replace(/(\b(?:var|let|const)\s+\w+\s*=\s*)require\s*\(\s*["'][^"']*mithril[^"']*["']\s*\)/g, '$1globalThis.m')
        // CommonJS: module.exports (not available in browser eval)
        .replace(/^\s*module\.exports\s*=\s*[^;]+;?\s*$/gm, '')
        .replace(/\n\n+/g, '\n\n')
        .trim()

    // Use dedicated mount div so clearing never removes the script; body would break updates
    const mountEl = 'document.getElementById("preview-root")'
    if (/\broot\b/.test(out)) {
        if (!/\b(?:var|let|const)\s+root\b/.test(out)) {
            out = `var root = ${mountEl}\n` + out
        } else {
            out = out.replace(/(\b(?:var|let|const)\s+root\s*=\s*)document\.body\b/g, `$1${mountEl}`)
        }
    }
    // m.render/m.mount/m.route(document.body, ...) → use preview-root
    out = out.replace(/m\.(render|mount|route)\s*\(\s*document\.body\s*,/g, `m.$1(${mountEl},`)
    // document.getElementById('app') common in docs examples — preview has preview-root
    out = out.replace(/document\.getElementById\s*\(\s*['"]app['"]\s*\)/g, mountEl)
    // m.route fragment: stub route components that aren't defined in this block
    const routeMatch = out.match(/m\.route\s*\(\s*\w+\s*,\s*[^,]+,\s*\{([^}]+)\}/s)
    if (routeMatch) {
        const routeBody = routeMatch[1]
        const refs = [...routeBody.matchAll(/['"][^'"]*['"]\s*:\s*(\w+)/g)].map((m) => m[1])
        const defined = new Set([...out.matchAll(/\b(?:var|let|const|function)\s+(\w+)/g)].map((m) => m[1]))
        const stubs: string[] = []
        for (const name of refs) {
            if (!defined.has(name)) {
                stubs.push(`var ${name}={view:function(){return m('div',${JSON.stringify(name)})}}`)
                defined.add(name)
            }
        }
        if (stubs.length > 0) out = stubs.join(';') + '\n' + out
    }
    // Component-only: define component but no mount/render/route — mount it
    if (!/m\.(render|mount|route)\s*\(/.test(out) && /(?:var|let|const)\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\{\s*view\s*:/.test(out)) {
        const match = out.match(/(?:var|let|const)\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\{\s*view\s*:/)
        if (match) {
            const name = match[1]
            if (!/\broot\b/.test(out)) out = `var root = ${mountEl}\n` + out
            out = out + `\nm.mount(root, ${name})`
        }
    }
    return out
}

interface SandboxAttrs {
    /** Raw source code for the editor */
    code: string
    /** Language: js runs directly in iframe, jsx is compiled on server first */
    lang?: 'js' | 'jsx'
}

interface SandboxState {
    editorView?: import('@codemirror/view').EditorView
    iframeRef?: HTMLIFrameElement
    debounceTimer?: ReturnType<typeof setTimeout>
    runId?: number
}

/**
 * Code editor with live preview. JS/htm runs directly; JSX is compiled on the server.
 */
export class Sandbox extends MithrilComponent<SandboxAttrs> {
    run(vnode: Vnode<SandboxAttrs>) {
        const state = vnode.state as SandboxState
        const attrs = (vnode.attrs ?? {}) as SandboxAttrs
        const rawCode = state.editorView?.state.doc.toString() ?? attrs.code ?? ''
        const code = prepareCodeForPreview(rawCode)
        const lang = attrs.lang ?? 'js'

        const runCode = (js: string) => {
            const iframe = state.iframeRef
            if (!iframe?.contentWindow) return
            iframe.contentWindow.postMessage({type: 'run', code: js}, '*')
        }

        if (lang === 'jsx') {
            const runId = (state.runId ?? 0) + 1
            state.runId = runId
            fetch('/api/transpile', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code}),
            })
                .then((r) => r.json())
                .then((res: {code?: string; error?: string}) => {
                    if (state.runId !== runId) return
                    if (res.error) throw new Error(res.error)
                    runCode(res.code!)
                })
                .catch((err) => {
                    if (state.runId !== runId) return
                    runCode(`(function(){ throw new Error(${JSON.stringify(String(err))}) })()`)
                })
        } else {
            runCode(code)
        }
    }

    view(vnode: Vnode<SandboxAttrs>) {
        const {code = '', lang = 'js'} = vnode.attrs ?? {}
        const state = vnode.state as SandboxState

        return m('div.docs-sandbox', [
            m('div.docs-sandbox-editor', {
                oncreate: async (ev: {dom: HTMLElement}) => {
                    if (typeof window === 'undefined') return
                    const {EditorView, basicSetup} = await import('codemirror')
                    const {javascript} = await import('@codemirror/lang-javascript')
                    const {oneDark} = await import('@codemirror/theme-one-dark')
                    const {EditorState} = await import('@codemirror/state')

                    const scheduleRun = () => {
                        if (state.debounceTimer) clearTimeout(state.debounceTimer)
                        state.debounceTimer = setTimeout(() => this.run(vnode), 400)
                    }
                    const updateListener = EditorView.updateListener.of((update) => {
                        if (update.docChanged) scheduleRun()
                    })

                    state.editorView = new EditorView({
                        state: EditorState.create({
                            doc: code,
                            extensions: [basicSetup, javascript({jsx: lang === 'jsx'}), oneDark, updateListener],
                        }),
                        parent: ev.dom,
                    })
                },
                onremove: () => {
                    if (state.debounceTimer) clearTimeout(state.debounceTimer)
                    state.editorView?.destroy()
                },
            }),
            m('div.docs-sandbox-preview', [
                m('iframe.docs-sandbox-iframe', {
                    sandbox: 'allow-scripts allow-same-origin',
                    src: '/preview.html',
                    oncreate: (ev: {dom: HTMLIFrameElement}) => {
                        state.iframeRef = ev.dom
                        let hasRun = false
                        const doRun = () => {
                            if (hasRun) return
                            hasRun = true
                            window.removeEventListener('message', onReady)
                            this.run(vnode)
                        }
                        const onReady = (e: MessageEvent) => {
                            if (e.source === ev.dom.contentWindow && e.data?.type === 'preview-ready') {
                                doRun()
                            }
                        }
                        window.addEventListener('message', onReady)
                        ev.dom.addEventListener('load', () => {
                            setTimeout(doRun, 150)
                        })
                    },
                    onremove: () => {
                        state.iframeRef = undefined
                    },
                }),
            ]),
        ])
    }
}
