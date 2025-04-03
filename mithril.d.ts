import {Attributes, Children, Hyperscript, Vnode, Route, Params, Static, Redraw, Component, ComponentTypes} from './types'

// Define function m as the Hyperscript function
declare function m(): Hyperscript;
declare function m<Attrs, State>(component: ComponentTypes<Attrs, State>, ...args: Children[]): Vnode<Attrs, State>;
declare function m<Attrs, State>(component: ComponentTypes<Attrs, State>, attributes: Attrs & Attributes, ...args: Children[]): Vnode<Attrs, State>;
declare function m(selector: string, ...children: Children[]): Vnode<any, any>;
declare function m(selector: string, attributes: Attributes, ...children: Children[]): Vnode<any, any>;
declare function m(selector: any, ...args: any[]): Vnode<any, any>;

// Define namespace m that matches the official implementation
declare namespace m {
    // Type re-exports
    type Vnode<A = any, S = any> = import('./types').Vnode<A, S>;
    type Children = import('./types').Children;
    type Component<A = any, S = any> = import('./types').Component<A, S>;
    interface ClassComponent<A = any> {
        /** The oninit hook is called before a vnode is touched by the virtual DOM engine. */
        oninit?(vnode: Vnode<A, this>): any
        /** The oncreate hook is called after a DOM element is created and attached to the document. */
        oncreate?(vnode: VnodeDOM<A, this>): any
        /** The onbeforeremove hook is called before a DOM element is detached from the document. If a Promise is returned, Mithril only detaches the DOM element after the promise completes. */
        onbeforeremove?(vnode: VnodeDOM<A, this>): Promise<any> | void
        /** The onremove hook is called before a DOM element is removed from the document. */
        onremove?(vnode: VnodeDOM<A, this>): any
        /** The onbeforeupdate hook is called before a vnode is diffed in a update. */
        onbeforeupdate?(vnode: Vnode<A, this>, old: VnodeDOM<A, this>): boolean | void
        /** The onupdate hook is called after a DOM element is updated, while attached to the document. */
        onupdate?(vnode: VnodeDOM<A, this>): any
        /** Creates a view out of virtual elements. */
        view(vnode: Vnode<A, this>): Children | null | void
    }
    type CVnode<A = any> = import('./types').CVnode<A>;
    type CVnodeDOM<A = any> = import('./types').CVnodeDOM<A>;
    type VnodeDOM<A = any, S = any> = import('./types').VnodeDOM<A, S>;
    
    // Core
    function trust(html: string): Vnode<any, any>;
    function fragment(attrs: Attributes, children: Children[]): Vnode<any, any>;
    const Fragment: string;
    
    // Mount/render
    function mount(element: Element, component: ComponentTypes<any, any>): void;
    function render(element: Element, vnodes: Children): void;
    const redraw: Redraw;
    
    // Routing
    const route: Route & {
        /** Redirects to a matching route or to the default route if no matching routes can be found */
        set(route: string, data?: any, options?: any): void;
    };
    
    // Request/JSON
    function request<T>(url: string, options?: any): Promise<T>;
    function request<T>(options: any): Promise<T>;
    function jsonp<T>(options: any): Promise<T>;
    
    // Utilities
    function parseQueryString(queryString: string): Params;
    function buildQueryString(values: Params): string;
    function parsePathname(url: string): { path: string; params: Params };
    function buildPathname(template: string, params?: Params): string;
    
    // Virtual DOM
    const Vnode: {
        <Attrs, State>(tag: ComponentTypes<Attrs, State>, key?: string, attrs?: Attrs, children?: Children[], text?: string, dom?: Element): Vnode<Attrs, State>;
    };
    
    // Support functions
    function censor(data: any): any;
    function domFor(vnode: Vnode<any, any>): Element;
}

declare global {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Element extends Vnode {}

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicAttributes extends Attributes {
            children?: Children | HTMLCollection;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface IntrinsicClassAttributes extends Attributes {}

        interface IntrinsicElements {
            // HTML
            a: Attributes
            abbr: Attributes
            address: Attributes
            area: Attributes
            article: Attributes
            aside: Attributes
            audio: Attributes
            b: Attributes
            base: Attributes
            bdi: Attributes
            bdo: Attributes
            big: Attributes
            blockquote: Attributes
            body: Attributes
            br: Attributes
            button: Attributes
            canvas: Attributes
            caption: Attributes
            cite: Attributes
            code: Attributes
            col: Attributes
            colgroup: Attributes
            data: Attributes
            datalist: Attributes
            dd: Attributes
            del: Attributes
            details: Attributes
            dfn: Attributes
            dialog: Attributes
            div: Attributes
            dl: Attributes
            dt: Attributes
            em: Attributes
            embed: Attributes
            fieldset: Attributes
            figcaption: Attributes
            figure: Attributes
            footer: Attributes
            form: Attributes
            h1: Attributes
            h2: Attributes
            h3: Attributes
            h4: Attributes
            h5: Attributes
            h6: Attributes
            head: Attributes
            header: Attributes
            hgroup: Attributes
            hr: Attributes
            html: Attributes
            i: Attributes
            iframe: Attributes
            img: Attributes
            input: Attributes
            ins: Attributes
            kbd: Attributes
            keygen: Attributes
            label: Attributes
            legend: Attributes
            li: Attributes
            link: Attributes
            main: Attributes
            map: Attributes
            mark: Attributes
            menu: Attributes
            menuitem: Attributes
            meta: Attributes
            meter: Attributes
            nav: Attributes
            noindex: Attributes
            noscript: Attributes
            object: Attributes
            ol: Attributes
            optgroup: Attributes
            option: Attributes
            output: Attributes
            p: Attributes
            param: Attributes
            picture: Attributes
            pre: Attributes
            progress: Attributes
            q: Attributes
            rp: Attributes
            rt: Attributes
            ruby: Attributes
            s: Attributes
            samp: Attributes
            script: Attributes
            section: Attributes
            select: Attributes
            small: Attributes
            source: Attributes
            span: Attributes
            strong: Attributes
            style: Attributes
            sub: Attributes
            summary: Attributes
            sup: Attributes
            table: Attributes
            template: Attributes
            tbody: Attributes
            td: Attributes
            textarea: Attributes
            tfoot: Attributes
            th: Attributes
            thead: Attributes
            time: Attributes
            title: Attributes
            tr: Attributes
            track: Attributes
            u: Attributes
            ul: Attributes
            var: Attributes
            video: Attributes
            wbr: Attributes
            webview: Attributes
            svg: Attributes
            animate: Attributes
            animateMotion: Attributes
            animateTransform: Attributes
            circle: Attributes
            clipPath: Attributes
            defs: Attributes
            desc: Attributes
            ellipse: Attributes
            feBlend: Attributes
            feColorMatrix: Attributes
            feComponentTransfer: Attributes
            feComposite: Attributes
            feConvolveMatrix: Attributes
            feDiffuseLighting: Attributes
            feDisplacementMap: Attributes
            feDistantLight: Attributes
            feDropShadow: Attributes
            feFlood: Attributes
            feFuncA: Attributes
            feFuncB: Attributes
            feFuncG: Attributes
            feFuncR: Attributes
            feGaussianBlur: Attributes
            feImage: Attributes
            feMerge: Attributes
            feMergeNode: Attributes
            feMorphology: Attributes
            feOffset: Attributes
            fePointLight: Attributes
            feSpecularLighting: Attributes
            feSpotLight: Attributes
            feTile: Attributes
            feTurbulence: Attributes
            filter: Attributes
            foreignObject: Attributes
            g: Attributes
            image: Attributes
            line: Attributes
            linearGradient: Attributes
            marker: Attributes
            mask: Attributes
            metadata: Attributes
            mpath: Attributes
            path: Attributes
            pattern: Attributes
            polygon: Attributes
            polyline: Attributes
            radialGradient: Attributes
            rect: Attributes
            stop: Attributes
            switch: Attributes
            symbol: Attributes
            text: Attributes
            textPath: Attributes
            tspan: Attributes
            use: Attributes
            view: Attributes
            // Special Mithril type
            "[": Attributes
        }
    }
}

// Export as both namespace and default
export as namespace m
export default m