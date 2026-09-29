/// <reference types="../../index" />

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any
    }
    interface ElementAttributesProperty {
        __tsx_attrs: any
    }
}

// Side-effect CSS imports are bundled by Bun; TS 7 checks side-effect imports by default.
declare module '*.css'
