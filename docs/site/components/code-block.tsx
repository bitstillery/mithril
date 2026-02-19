import {MithrilComponent, Vnode} from '../../../index'
import m from '../../../index'

interface CodeBlockAttrs {
    code: string
    lang: string
}

interface CodeBlockState {
    editorView?: import('@codemirror/view').EditorView
}

/**
 * View-only CodeMirror block: syntax highlighting with One Dark theme, no line numbers.
 * Used for static code blocks (e.g. HTML) that don't need an editable sandbox.
 */
export class CodeBlock extends MithrilComponent<CodeBlockAttrs> {
    view(vnode: Vnode<CodeBlockAttrs>) {
        const {code = '', lang = ''} = vnode.attrs ?? {}
        const state = vnode.state as CodeBlockState

        return m('div.docs-code-block', {
            oncreate: async (ev: {dom: HTMLElement}) => {
                if (typeof window === 'undefined') return
                const {EditorView} = await import('codemirror')
                const {EditorState} = await import('@codemirror/state')
                const {oneDark} = await import('@codemirror/theme-one-dark')

                let langExtension
                const langLower = lang.toLowerCase()
                if (langLower === 'html' || langLower === 'xml' || langLower === 'htm') {
                    const {html} = await import('@codemirror/lang-html')
                    langExtension = html()
                } else if (langLower === 'json') {
                    const {json} = await import('@codemirror/lang-json')
                    langExtension = json()
                } else {
                    // js, javascript, jsx, and fallback for unknown
                    const {javascript} = await import('@codemirror/lang-javascript')
                    langExtension = javascript({jsx: langLower === 'jsx'})
                }

                state.editorView = new EditorView({
                    state: EditorState.create({
                        doc: code,
                        extensions: [
                            EditorState.readOnly.of(true),
                            EditorView.editable.of(false),
                            langExtension,
                            oneDark,
                        ],
                    }),
                    parent: ev.dom,
                })
            },
            onremove: () => {
                state.editorView?.destroy()
            },
        })
    }
}
