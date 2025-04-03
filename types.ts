/**
 * Source: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mithril
 * See LICENSE_TYPES.md for the licensing terms (MIT)
 */
import render from '@bitstillery/mithril/render/render'
import request from '@bitstillery/mithril/request/request'

export interface CommonAttributes<Attrs, State> {
    /** The oninit hook is called before a vnode is touched by the virtual DOM engine. */
    oninit?(this: State, vnode: Vnode<Attrs, State>): any
    /** The oncreate hook is called after a DOM element is created and attached to the document. */
    oncreate?(this: State, vnode: VnodeDOM<Attrs, State>): any
    /** The onbeforeremove hook is called before a DOM element is detached from the document. If a Promise is returned, Mithril only detaches the DOM element after the promise completes. */
    onbeforeremove?(this: State, vnode: VnodeDOM<Attrs, State>): Promise<any> | void
    /** The onremove hook is called before a DOM element is removed from the document. */
    onremove?(this: State, vnode: VnodeDOM<Attrs, State>): any
    /** The onbeforeupdate hook is called before a vnode is diffed in a update. */
    onbeforeupdate?(this: State, vnode: Vnode<Attrs, State>, old: VnodeDOM<Attrs, State>): boolean | void
    /** The onupdate hook is called after a DOM element is updated, while attached to the document. */
    onupdate?(this: State, vnode: VnodeDOM<Attrs, State>): any
    /** A key to optionally associate with this element. */
    key?: string | number | undefined
}

export interface Hyperscript {
    /** Creates a virtual element (Vnode). */
    <Attrs, State>(
        component: ComponentTypes<Attrs, State>,
        attributes: Attrs & CommonAttributes<Attrs, State>,
        ...args: Children[]
    ): Vnode<Attrs, State>
    /** Creates a virtual element (Vnode). */
    (selector: string, attributes: Attributes, ...children: Children[]): Vnode<any, any>
    /** Creates a virtual element (Vnode). */
    <Attrs, State>(component: ComponentTypes<Attrs, State>, ...args: Children[]): Vnode<Attrs, State>
    /** Creates a virtual element (Vnode). */
    (selector: string, ...children: Children[]): Vnode<any, any>
    /** Creates a fragment virtual element (Vnode). */
    fragment(
        attrs: CommonAttributes<any, any> & { [key: string]: any },
        children: ChildArrayOrPrimitive,
    ): Vnode<any, any>
    /** Turns an HTML string into a virtual element (Vnode). Do not use trust on unsanitized user input. */
    trust(html: string): Vnode<any, any>
}

export interface RouteResolver<Attrs = {}, State = {}> {
    /** The onmatch hook is called when the router needs to find a component to render. */
    onmatch?(
        this: this,
        args: Attrs,
        requestedPath: string,
        route: string,
    ): ComponentTypes<any, any> | Promise<any> | void
    /** The render method is called on every redraw for a matching route. */
    render?(this: this, vnode: Vnode<Attrs, State>): Children
}

/** This represents a key-value mapping linking routes to components. */

export interface RouteDefs {
    /** The key represents the route. The value represents the corresponding component. */
    [url: string]: ComponentTypes<any, any> | RouteResolver<any, any>
}

export interface RouteOptions {
    /** Routing parameters. If path has routing parameter slots, the properties of this object are interpolated into the path string. */
    replace?: boolean | undefined
    /** The state object to pass to the underlying history.pushState / history.replaceState call. */
    state?: any
    /** The title string to pass to the underlying history.pushState / history.replaceState call. */
    title?: string | undefined
}

export interface RouteLinkAttrs extends Attributes {
    href: string
    selector?: string | ComponentTypes<any> | undefined
    options?: RouteOptions | undefined
}

export interface Route {
    /** Creates application routes and mounts Components and/or RouteResolvers to a DOM element. */
    (element: Element, defaultRoute: string, routes: RouteDefs): void
    /** Returns the last fully resolved routing path, without the prefix. */
    get(): string
    /** Redirects to a matching route or to the default route if no matching routes can be found. */
    set(route: string, data?: any, options?: RouteOptions): void
    /** Defines a router prefix which is a fragment of the URL that dictates the underlying strategy used by the router. */
    prefix: string
    /** This Component renders a link <a href> that will use the current routing strategy */
    Link: Component<RouteLinkAttrs>
    /** Returns the named parameter value from the current route. */
    param(name: string): string
    /** Gets all route parameters. */
    param(): any
    /** Special value to SKIP current route */
    SKIP: any
}

export interface RequestOptions<T> {
    /** The HTTP method to use. */
    method?: string | undefined
    /** The data to be interpolated into the URL and serialized into the querystring. */
    params?: { [key: string]: any } | undefined
    /** The data to be serialized into the request body. */
    body?:
        | (XMLHttpRequest['send'] extends (x: infer R) => any ? R : never)
        | (object & { [id: string]: any })
        | undefined
    /** Whether the request should be asynchronous. Defaults to true. */
    async?: boolean | undefined
    /** A username for HTTP authorization. */
    user?: string | undefined
    /** A password for HTTP authorization. */
    password?: string | undefined
    /** Whether to send cookies to 3rd party domains. */
    withCredentials?: boolean | undefined
    /** Exposes the underlying XMLHttpRequest object for low-level configuration. */
    config?(xhr: XMLHttpRequest, options: this): XMLHttpRequest | void
    /** Headers to append to the request before sending it. */
    headers?: { [key: string]: string } | undefined
    /** A constructor to be applied to each object in the response. */
    type?: new(o: any) => any
    /** A serialization method to be applied to data. Defaults to JSON.stringify, or if options.data is an instance of FormData, defaults to the identity function. */
    serialize?(data: any): any
    /** A deserialization method to be applied to the response. Defaults to a small wrapper around JSON.parse that returns null for empty responses. */
    deserialize?(data: string): T
    /** A hook to specify how the XMLHttpRequest response should be read. Useful for reading response headers and cookies. Defaults to a function that returns xhr.responseText */
    extract?(xhr: XMLHttpRequest, options: this): T
    /**
     * Force the use of the HTTP body section for data in GET requests when set to true,
     * or the use of querystring for other HTTP methods when set to false.
     * Defaults to false for GET requests and true for other methods.
    */
    useBody?: boolean | undefined
    /** If false, redraws mounted components upon completion of the request. If true, it does not. */
    background?: boolean | undefined
    /** Milliseconds a request can take before automatically being terminated. */
    timeout?: number | undefined
    /** The expected type of the response, as a legal value of XMLHttpRequest.responseType. */
    responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | undefined
}

export interface JsonpOptions {
    /** The data to be interpolated into the URL and serialized into the querystring. */
    params?: { [id: string]: any } | undefined
    /** The data to be serialized into the request body. */
    body?: any
    /** A constructor to be applied to each object in the response. */
    type?: new(o: any) => any
    /** The name of the function that will be called as the callback. */
    callbackName?: string | undefined
    /** The name of the querystring parameter name that specifies the callback name. */
    callbackKey?: string | undefined
    /** If false, redraws mounted components upon completion of the request. If true, it does not. */
    background?: boolean | undefined
}

export interface Redraw {
    /** Manually triggers an asynchronous redraw of mounted components. */
    (): void
    /** Manually triggers a synchronous redraw of mounted components. */
    sync(): void
}

export type Params = object & ParamsRec

export interface ParamsRec {
    // Ideally, it'd be this:
    // `[key: string | number]: Params | !symbol & !object`
    [key: string]: string | number | boolean | null | undefined | Params;
}

export interface Static extends Hyperscript {
    censor: typeof censor
    route: Route
    mount: typeof mount
    render: typeof render
    redraw: Redraw
    request: typeof request
    jsonp: typeof jsonp
    /** Returns an object with key/value pairs parsed from a string of the form: ?a=1&b=2 */
    parseQueryString(queryString: string): Params
    /** Turns the key/value pairs of an object into a string of the form: a=1&b=2 */
    buildQueryString(values: Params): string
    /** Parse path name */
    parsePathname(url: string): { path: string; params: Params }
    /** Build path name */
    buildPathname(template: string, params?: Params): string
}

// Vnode children types
export type Child = Vnode<any, any> | string | number | boolean | null | undefined
export interface ChildArray extends Array<Children> {}
export type Children = Child | ChildArray
export type ChildArrayOrPrimitive = ChildArray | string | number | boolean

/** Virtual DOM nodes, or vnodes, are Javascript objects that represent an element (or parts of the DOM). */
export interface Vnode<Attrs = {}, State = {}> {
    /** The nodeName of a DOM element. It may also be the string [ if a vnode is a fragment, # if it's a text vnode, or < if it's a trusted HTML vnode. Additionally, it may be a component. */
    tag: string | ComponentTypes<Attrs, State>
    /** A hashmap of DOM attributes, events, properties and lifecycle methods. */
    attrs: Attrs
    /** An object that is persisted between redraws. In component vnodes, state is a shallow clone of the component object. */
    state: State
    /** The value used to map a DOM element to its respective item in an array of data. */
    key?: string | number | undefined
    /** In most vnode types, the children property is an array of vnodes. For text and trusted HTML vnodes, The children property is either a string, a number or a boolean. */
    children?: ChildArrayOrPrimitive | undefined
    /**
     * This is used instead of children if a vnode contains a text node as its only child.
     * This is done for performance reasons.
     * Component vnodes never use the text property even if they have a text node as their only child.
     */
    text?: string | number | boolean | undefined
}

// In some lifecycle methods, Vnode will have a dom property

// and possibly a domSize property.

export interface VnodeDOM<Attrs = {}, State = {}> extends Vnode<Attrs, State> {
    /** Points to the element that corresponds to the vnode. */
    dom: Element
    /** This defines the number of DOM elements that the vnode represents (starting from the element referenced by the dom property). */
    domSize?: number | undefined
}

export type _NoLifecycle<T> = Omit<T, keyof Component>
export interface CVnode<A = {}> extends Vnode<A, ClassComponent<A>> {}
export interface CVnodeDOM<A = {}> extends VnodeDOM<A, ClassComponent<A>> {}

/**
 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
 * Any Javascript object that has a view method can be used as a Mithril component.
 * Components can be consumed via the m() utility.
*/
export interface Component<Attrs = {}, State = {}> {
    /** The oninit hook is called before a vnode is touched by the virtual DOM engine. */
    oninit?(this: _NoLifecycle<this & State>, vnode: Vnode<Attrs, _NoLifecycle<this & State>>): any
    /** The oncreate hook is called after a DOM element is created and attached to the document. */
    oncreate?(this: _NoLifecycle<this & State>, vnode: VnodeDOM<Attrs, _NoLifecycle<this & State>>): any
    /** The onbeforeremove hook is called before a DOM element is detached from the document. If a Promise is returned, Mithril only detaches the DOM element after the promise completes. */
    onbeforeremove?(
        this: _NoLifecycle<this & State>,
        vnode: VnodeDOM<Attrs, _NoLifecycle<this & State>>,
    ): Promise<any> | void
    /** The onremove hook is called before a DOM element is removed from the document. */
    onremove?(this: _NoLifecycle<this & State>, vnode: VnodeDOM<Attrs, _NoLifecycle<this & State>>): any
    /** The onbeforeupdate hook is called before a vnode is diffed in a update. */
    onbeforeupdate?(
        this: _NoLifecycle<this & State>,
        vnode: Vnode<Attrs, _NoLifecycle<this & State>>,
        old: VnodeDOM<Attrs, _NoLifecycle<this & State>>,
    ): boolean | void

    /** The onupdate hook is called after a DOM element is updated, while attached to the document. */
    onupdate?(this: _NoLifecycle<this & State>, vnode: VnodeDOM<Attrs, _NoLifecycle<this & State>>): any
    /** Creates a view out of virtual elements. */
    view(this: _NoLifecycle<this & State>, vnode: Vnode<Attrs, _NoLifecycle<this & State>>): Children | null | void
}


/**
* Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
* Any class that implements a view method can be used as a Mithril component.
* Components can be consumed via the m() utility.
*/
interface ClassComponent<A = {}> {
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

/**
 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
 * Any function that returns an object with a view method can be used as a Mithril component.
 * Components can be consumed via the m() utility.
 */
export type FactoryComponent<A = {}> = (vnode: Vnode<A>) => Component<A>;

/**
* Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
* Any function that returns an object with a view method can be used as a Mithril component.
* Components can be consumed via the m() utility.
*/
export type ClosureComponent<A = {}> = FactoryComponent<A>;

/**
 * Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse.
 * Any Javascript object that has a view method is a Mithril component. Components can be consumed via the m() utility.
*/
export type Comp<Attrs = {}, State = {}> = _NoLifecycle<State> & Component<Attrs, _NoLifecycle<State>>;

/** Components are a mechanism to encapsulate parts of a view to make code easier to organize and/or reuse. Components can be consumed via the m() utility. */
export type ComponentTypes<A = {}, S = {}> =
    | Component<A, S>
    | { new(vnode: CVnode<A>): ClassComponent<A> }
    | FactoryComponent<A>

/** This represents the attributes available for configuring virtual elements, beyond the applicable DOM attributes. */
export interface Attributes extends CommonAttributes<any, any> {
    /** The class name(s) for this virtual element, as a space-separated list. */
    className?: string | undefined
    /** The class name(s) for this virtual element, as a space-separated list. */
    class?: string | undefined
    /** Any other virtual element properties, including attributes and event handlers. */
    [property: string]: any
}
