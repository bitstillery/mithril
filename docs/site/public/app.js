var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// ../../util/hasOwn.ts
var hasOwn_default = {}.hasOwnProperty;

// ../../render/vnode.ts
class MithrilTsxComponent {
}
function Vnode(tag, key, attrs, children, text, dom) {
  return { tag, key: key ?? undefined, attrs: attrs ?? undefined, children: children ?? undefined, text: text ?? undefined, dom: dom ?? undefined, is: undefined, domSize: undefined, state: undefined, events: undefined, instance: undefined };
}
var normalize = function(node) {
  if (Array.isArray(node))
    return Vnode("[", undefined, undefined, normalizeChildren(node), undefined, undefined);
  if (node == null || typeof node === "boolean")
    return null;
  if (typeof node === "object")
    return node;
  return Vnode("#", undefined, undefined, String(node), undefined, undefined);
};
var normalizeChildren = function(input) {
  const children = new Array(input.length);
  let numKeyed = 0;
  for (let i = 0;i < input.length; i++) {
    children[i] = normalize(input[i]);
    if (children[i] !== null && children[i].key != null)
      numKeyed++;
  }
  if (numKeyed !== 0 && numKeyed !== input.length) {
    throw new TypeError(children.includes(null) ? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole." : "In fragments, vnodes must either all have keys or none have keys.");
  }
  return children;
};
Vnode.normalize = normalize;
Vnode.normalizeChildren = normalizeChildren;
var vnode_default = Vnode;

// ../../render/hyperscriptVnode.ts
function hyperscriptVnode(attrs, children) {
  if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
    if (children.length === 1 && Array.isArray(children[0]))
      children = children[0];
  } else {
    children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children];
    attrs = undefined;
  }
  return vnode_default("", attrs && attrs.key, attrs, children, null, null);
}

// ../../render/emptyAttrs.ts
var emptyAttrs_default = {};

// ../../render/cachedAttrsIsStaticMap.ts
var cachedAttrsIsStaticMap_default = new Map([[emptyAttrs_default, true]]);

// ../../render/trust.ts
function trust(html) {
  if (html == null)
    html = "";
  return vnode_default("<", undefined, undefined, html, undefined, undefined);
}

// ../../render/fragment.ts
function fragment(attrs, ...children) {
  const vnode = hyperscriptVnode(attrs, children);
  if (vnode.attrs == null)
    vnode.attrs = {};
  vnode.tag = "[";
  vnode.children = vnode_default.normalizeChildren(vnode.children);
  return vnode;
}

// ../../render/hyperscript.ts
var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
var selectorCache = Object.create(null);
function isEmpty(object) {
  for (const key in object)
    if (hasOwn_default.call(object, key))
      return false;
  return true;
}
function isFormAttributeKey(key) {
  return key === "value" || key === "checked" || key === "selectedIndex" || key === "selected";
}
function compileSelector(selector) {
  let match;
  let tag = "div";
  const classes = [];
  let attrs = {};
  let isStatic = true;
  while ((match = selectorParser.exec(selector)) !== null) {
    const type = match[1];
    const value = match[2];
    if (type === "" && value !== "")
      tag = value;
    else if (type === "#")
      attrs.id = value;
    else if (type === ".")
      classes.push(value);
    else if (match[3][0] === "[") {
      let attrValue = match[6];
      if (attrValue)
        attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
      if (match[4] === "class")
        classes.push(attrValue);
      else {
        attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
        if (isFormAttributeKey(match[4]))
          isStatic = false;
      }
    }
  }
  if (classes.length > 0)
    attrs.className = classes.join(" ");
  if (isEmpty(attrs))
    attrs = emptyAttrs_default;
  else
    cachedAttrsIsStaticMap_default.set(attrs, isStatic);
  return selectorCache[selector] = { tag, attrs, is: attrs.is };
}
function execSelector(state, vnode) {
  vnode.tag = state.tag;
  let attrs = vnode.attrs;
  if (attrs == null) {
    vnode.attrs = state.attrs;
    vnode.is = state.is;
    return vnode;
  }
  if (hasOwn_default.call(attrs, "class")) {
    if (attrs.class != null)
      attrs.className = attrs.class;
    attrs.class = null;
  }
  if (state.attrs !== emptyAttrs_default) {
    const className = attrs.className;
    attrs = Object.assign({}, state.attrs, attrs);
    if (state.attrs.className != null)
      attrs.className = className != null ? String(state.attrs.className) + " " + String(className) : state.attrs.className;
  }
  if (state.tag === "input" && hasOwn_default.call(attrs, "type")) {
    attrs = Object.assign({ type: attrs.type }, attrs);
  }
  vnode.is = attrs.is;
  vnode.attrs = attrs;
  return vnode;
}
function hyperscript(selector, attrs, ...children) {
  if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
    throw Error("The selector must be either a string or a component.");
  }
  const vnode = hyperscriptVnode(attrs, children);
  if (typeof selector === "string") {
    vnode.children = vnode_default.normalizeChildren(vnode.children);
    if (selector !== "[")
      return execSelector(selectorCache[selector] || compileSelector(selector), vnode);
  }
  if (vnode.attrs == null)
    vnode.attrs = {};
  vnode.tag = selector;
  return vnode;
}
hyperscript.trust = trust;
hyperscript.fragment = fragment;
hyperscript.Fragment = "[";
var hyperscript_default = hyperscript;

// ../../ssrContext.ts
var ssrStorage;
try {
  const { AsyncLocalStorage } = (()=>{throw new Error("Cannot require module "+"node:async_hooks");})();
  ssrStorage = new AsyncLocalStorage;
} catch {
  ssrStorage = {
    getStore: () => {
      return;
    },
    run: (_context, fn) => fn()
  };
}
function getSSRContext() {
  return ssrStorage.getStore();
}
function runWithContext(context, fn) {
  return ssrStorage.run(context, fn);
}

// ../../signal.ts
var currentEffect = null;
var componentSignalMap = new WeakMap;
var signalComponentMap = new WeakMap;
var currentComponent = null;
function setCurrentComponent(component) {
  currentComponent = component;
}
function clearCurrentComponent() {
  currentComponent = null;
}
function trackComponentSignal(component, signal) {
  if (!componentSignalMap.has(component)) {
    componentSignalMap.set(component, new Set);
  }
  componentSignalMap.get(component).add(signal);
  if (!signalComponentMap.has(signal)) {
    signalComponentMap.set(signal, new Set);
  }
  signalComponentMap.get(signal).add(component);
}
function getSignalComponents(signal) {
  return signalComponentMap.get(signal);
}
function clearComponentDependencies(component) {
  const signals = componentSignalMap.get(component);
  if (signals) {
    signals.forEach((signal) => {
      const components = signalComponentMap.get(signal);
      if (components) {
        components.delete(component);
        if (components.size === 0) {
          signalComponentMap.delete(signal);
        }
      }
    });
    componentSignalMap.delete(component);
  }
}
function setSignalRedrawCallback(callback) {
  signal.__redrawCallback = callback;
}

class Signal {
  _value;
  _subscribers = new Set;
  constructor(initial) {
    this._value = initial;
  }
  get value() {
    if (!this._subscribers) {
      this._subscribers = new Set;
    }
    if (currentEffect) {
      this._subscribers.add(currentEffect);
    }
    if (currentComponent) {
      trackComponentSignal(currentComponent, this);
    }
    return this._value;
  }
  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      if (!this._subscribers) {
        this._subscribers = new Set;
      }
      const context = getSSRContext();
      this._subscribers.forEach((fn) => {
        try {
          if (context) {
            runWithContext(context, () => {
              fn();
            });
          } else {
            fn();
          }
        } catch (e) {
          console.error("Error in signal subscriber:", e);
        }
      });
      if (signal.__redrawCallback) {
        signal.__redrawCallback(this);
      }
    }
  }
  subscribe(callback) {
    if (!this._subscribers) {
      this._subscribers = new Set;
    }
    this._subscribers.add(callback);
    return () => {
      if (this._subscribers) {
        this._subscribers.delete(callback);
      }
    };
  }
  watch(callback) {
    let oldValue = this._value;
    const unsubscribe = this.subscribe(() => {
      const newValue = this._value;
      callback(newValue, oldValue);
      oldValue = newValue;
    });
    return unsubscribe;
  }
  peek() {
    return this._value;
  }
}

class ComputedSignal extends Signal {
  _compute;
  _dependencies = new Set;
  _isDirty = true;
  _cachedValue;
  constructor(compute) {
    super(null);
    this._compute = compute;
  }
  get value() {
    if (currentEffect) {
      if (!this._subscribers) {
        this._subscribers = new Set;
      }
      this._subscribers.add(currentEffect);
    }
    if (this._isDirty) {
      this._dependencies.forEach((dep) => {
        dep.subscribe(() => this._markDirty())?.();
      });
      this._dependencies.clear();
      const previousEffect = currentEffect;
      currentEffect = () => {
        this._markDirty();
      };
      try {
        this._cachedValue = this._compute();
      } finally {
        currentEffect = previousEffect;
      }
      this._isDirty = false;
    }
    return this._cachedValue;
  }
  _markDirty() {
    if (!this._isDirty) {
      this._isDirty = true;
      if (!this._subscribers) {
        this._subscribers = new Set;
      }
      const context = getSSRContext();
      this._subscribers.forEach((fn) => {
        try {
          if (context) {
            runWithContext(context, () => {
              fn();
            });
          } else {
            fn();
          }
        } catch (e) {
          console.error("Error in computed signal subscriber:", e);
        }
      });
    }
  }
  set value(_newValue) {
    throw new Error("Computed signals are read-only");
  }
}
function signal(initial) {
  return new Signal(initial);
}

// ../../api/mount-redraw.ts
function mountRedrawFactory(render, schedule, console2) {
  const subscriptions = [];
  const componentToElement = new WeakMap;
  let pending = false;
  let offset = -1;
  function sync() {
    for (offset = 0;offset < subscriptions.length; offset += 2) {
      try {
        render(subscriptions[offset], vnode_default(subscriptions[offset + 1], null, null, null, null, null), redraw);
      } catch (e) {
        console2.error(e);
      }
    }
    offset = -1;
  }
  function redrawComponent(componentOrState) {
    let component = componentOrState;
    const stateToComponentMap = globalThis.__mithrilStateToComponent;
    if (stateToComponentMap && stateToComponentMap.has(componentOrState)) {
      component = stateToComponentMap.get(componentOrState);
    }
    const element = componentToElement.get(component);
    if (element) {
      try {
        render(element, vnode_default(component, null, null, null, null, null), redraw);
        return;
      } catch (e) {
        console2.error(e);
      }
    }
    const stateToDomMap = globalThis.__mithrilStateToDom;
    if (stateToDomMap && stateToDomMap.has(componentOrState)) {
      if (!pending) {
        pending = true;
        schedule(function() {
          pending = false;
          sync();
        });
        return;
      }
    }
    const index = subscriptions.indexOf(component);
    if (index >= 0 && index % 2 === 1) {
      const rootElement = subscriptions[index - 1];
      try {
        render(rootElement, vnode_default(component, null, null, null, null, null), redraw);
        return;
      } catch (e) {
        console2.error(e);
      }
    }
    if (!pending) {
      pending = true;
      schedule(function() {
        pending = false;
        sync();
      });
    }
  }
  function redraw(component) {
    if (component !== undefined) {
      redrawComponent(component);
      return;
    }
    if (!pending) {
      pending = true;
      schedule(function() {
        pending = false;
        sync();
      });
    }
  }
  redraw.sync = sync;
  redraw.signal = function(signal2) {
    const components = getSignalComponents(signal2);
    if (components) {
      components.forEach((component) => {
        redrawComponent(component);
      });
    }
  };
  function mount(root, component) {
    if (component != null && component.view == null && typeof component !== "function") {
      throw new TypeError("m.mount expects a component, not a vnode.");
    }
    const index = subscriptions.indexOf(root);
    if (index >= 0) {
      const oldComponent = subscriptions[index + 1];
      if (oldComponent) {
        componentToElement.delete(oldComponent);
      }
      subscriptions.splice(index, 2);
      if (index <= offset)
        offset -= 2;
      render(root, []);
    }
    if (component != null) {
      subscriptions.push(root, component);
      componentToElement.set(component, root);
      render(root, vnode_default(component, null, null, null, null, null), redraw);
    }
  }
  return { mount, redraw };
}

// ../../util/decodeURIComponentSafe.ts
var validUtf8Encodings = /%(?:[0-7]|(?!c[01]|e0%[89]|ed%[ab]|f0%8|f4%[9ab])(?:c|d|(?:e|f[0-4]%[89ab])[\da-f]%[89ab])[\da-f]%[89ab])[\da-f]/gi;
function decodeURIComponentSafe(str) {
  return String(str).replace(validUtf8Encodings, decodeURIComponent);
}

// ../../querystring/build.ts
function buildQueryString(object) {
  if (Object.prototype.toString.call(object) !== "[object Object]")
    return "";
  const args = [];
  function destructure(key, value) {
    if (Array.isArray(value)) {
      for (let i = 0;i < value.length; i++) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else if (Object.prototype.toString.call(value) === "[object Object]") {
      for (const i in value) {
        destructure(key + "[" + i + "]", value[i]);
      }
    } else
      args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
  }
  for (const key in object) {
    destructure(key, object[key]);
  }
  return args.join("&");
}

// ../../pathname/build.ts
function buildPathname(template, params) {
  if (/:([^\/\.-]+)(\.{3})?:/.test(template)) {
    throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");
  }
  if (params == null)
    return template;
  const queryIndex = template.indexOf("?");
  const hashIndex = template.indexOf("#");
  const queryEnd = hashIndex < 0 ? template.length : hashIndex;
  const pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  const path = template.slice(0, pathEnd);
  const query = {};
  Object.assign(query, params);
  const resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
    delete query[key];
    if (params[key] == null)
      return m;
    return variadic ? params[key] : encodeURIComponent(String(params[key]));
  });
  const newQueryIndex = resolved.indexOf("?");
  const newHashIndex = resolved.indexOf("#");
  const newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
  const newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
  let result = resolved.slice(0, newPathEnd);
  if (queryIndex >= 0)
    result += template.slice(queryIndex, queryEnd);
  if (newQueryIndex >= 0)
    result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
  const querystring = buildQueryString(query);
  if (querystring)
    result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
  if (hashIndex >= 0)
    result += template.slice(hashIndex);
  if (newHashIndex >= 0)
    result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
  return result;
}

// ../../querystring/parse.ts
function parseQueryString(string) {
  if (string === "" || string == null)
    return {};
  if (string.charAt(0) === "?")
    string = string.slice(1);
  const entries = string.split("&");
  const counters = {};
  const data = {};
  for (let i = 0;i < entries.length; i++) {
    const entry = entries[i].split("=");
    const key = decodeURIComponentSafe(entry[0]);
    let value = entry.length === 2 ? decodeURIComponentSafe(entry[1]) : "";
    if (value === "true")
      value = true;
    else if (value === "false")
      value = false;
    const levels = key.split(/\]\[?|\[/);
    let cursor = data;
    if (key.indexOf("[") > -1)
      levels.pop();
    for (let j = 0;j < levels.length; j++) {
      const level = levels[j];
      const nextLevel = levels[j + 1];
      const isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
      let finalLevel;
      if (level === "") {
        const key2 = levels.slice(0, j).join();
        if (counters[key2] == null) {
          counters[key2] = Array.isArray(cursor) ? cursor.length : 0;
        }
        finalLevel = counters[key2]++;
      } else if (level === "__proto__")
        break;
      else {
        finalLevel = level;
      }
      if (j === levels.length - 1)
        cursor[finalLevel] = value;
      else {
        const desc = Object.getOwnPropertyDescriptor(cursor, finalLevel);
        let descValue = desc != null ? desc.value : undefined;
        if (descValue == null)
          cursor[finalLevel] = descValue = isNumber ? [] : {};
        cursor = descValue;
      }
    }
  }
  return data;
}

// ../../pathname/parse.ts
function parsePathname(url) {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const queryEnd = hashIndex < 0 ? url.length : hashIndex;
  const pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  let path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");
  if (!path)
    path = "/";
  else {
    if (path[0] !== "/")
      path = "/" + path;
  }
  return {
    path,
    params: queryIndex < 0 ? {} : parseQueryString(url.slice(queryIndex + 1, queryEnd))
  };
}

// ../../pathname/compileTemplate.ts
function compileTemplate(template) {
  const templateData = parsePathname(template);
  const templateKeys = Object.keys(templateData.params);
  const keys = [];
  const regexp = new RegExp("^" + templateData.path.replace(/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g, function(m, key, extra) {
    if (key == null)
      return "\\" + m;
    keys.push({ k: key, r: extra === "..." });
    if (extra === "...")
      return "(.*)";
    if (extra === ".")
      return "([^/]+)\\.";
    return "([^/]+)" + (extra || "");
  }) + "\\/?$");
  return function(data) {
    for (let i = 0;i < templateKeys.length; i++) {
      if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]])
        return false;
    }
    if (!keys.length)
      return regexp.test(data.path);
    const values = regexp.exec(data.path);
    if (values == null)
      return false;
    for (let i = 0;i < keys.length; i++) {
      data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
    }
    return true;
  };
}

// ../../util/censor.ts
var magic = /^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$/;
function censor(attrs, extras) {
  const result = {};
  if (extras != null) {
    for (const key in attrs) {
      if (hasOwn_default.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
        result[key] = attrs[key];
      }
    }
  } else {
    for (const key in attrs) {
      if (hasOwn_default.call(attrs, key) && !magic.test(key)) {
        result[key] = attrs[key];
      }
    }
  }
  return result;
}

// ../../util/uri.ts
function getCurrentUrl() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.href;
  }
  if (typeof globalThis !== "undefined" && globalThis.__SSR_URL__) {
    return globalThis.__SSR_URL__;
  }
  return "";
}
function parseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return new URL(url, "http://localhost");
  }
}
function getPathname() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.pathname || "/";
  }
  const url = getCurrentUrl();
  if (!url)
    return "/";
  const parsed = parseUrl(url);
  return parsed.pathname || "/";
}
function getSearch() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.search || "";
  }
  const url = getCurrentUrl();
  if (!url)
    return "";
  const parsed = parseUrl(url);
  return parsed.search || "";
}
function getHash() {
  if (typeof window !== "undefined" && window.location) {
    return window.location.hash || "";
  }
  const url = getCurrentUrl();
  if (!url)
    return "";
  const parsed = parseUrl(url);
  return parsed.hash || "";
}

// ../../server/logger.ts
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  bgBlack: "\x1B[40m",
  bgRed: "\x1B[41m",
  bgGreen: "\x1B[42m",
  bgYellow: "\x1B[43m",
  bgBlue: "\x1B[44m",
  bgMagenta: "\x1B[45m",
  bgCyan: "\x1B[46m",
  bgWhite: "\x1B[47m"
};
var enableColors = !isBrowser && typeof process !== "undefined" && process.env && process.env.NO_COLOR !== "1" && process.env.NO_COLOR !== "true";
function colorize(text, color) {
  return enableColors ? `${color}${text}${colors.reset}` : text;
}
function getTimestamp() {
  const now = new Date;
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${ms}`;
}
function formatLevel(level) {
  const levelMap = {
    info: colorize("INFO", colors.bright + colors.cyan),
    debug: colorize("DEBUG", colors.bright + colors.blue),
    warn: colorize("WARN", colors.bright + colors.yellow),
    error: colorize("ERROR", colors.bright + colors.red)
  };
  return levelMap[level];
}

class Logger {
  prefix = "[SSR]";
  setPrefix(prefix) {
    this.prefix = prefix;
  }
  formatMessage(level, message, context) {
    const timestamp = colorize(getTimestamp(), colors.dim + colors.white);
    const levelStr = formatLevel(level);
    const prefixStr = colorize(this.prefix, this.prefix === "[SSR]" ? colors.bright + colors.magenta : colors.bright + colors.cyan);
    let displayMessage = message;
    if (context?.module) {
      displayMessage = `[${context.module}] ${message}`;
    }
    let contextStr = "";
    if (context) {
      const contextParts = [];
      if (context.method) {
        contextParts.push(colorize(context.method, colors.cyan));
      }
      if (context.pathname) {
        contextParts.push(colorize(context.pathname, colors.green));
      }
      if (context.route) {
        contextParts.push(colorize(`route:${context.route}`, colors.blue));
      }
      if (context.sessionId) {
        contextParts.push(colorize(`session:${context.sessionId.slice(0, 8)}...`, colors.dim + colors.white));
      }
      for (const [key, value] of Object.entries(context)) {
        if (!["method", "pathname", "route", "sessionId", "module"].includes(key)) {
          contextParts.push(colorize(`${key}:${value}`, colors.dim + colors.white));
        }
      }
      if (contextParts.length > 0) {
        contextStr = " " + contextParts.join(" ");
      }
    }
    return `${timestamp} ${prefixStr} ${levelStr}${contextStr} ${displayMessage}`;
  }
  formatContextForBrowser(context) {
    if (!context)
      return [];
    const parts = [];
    if (context.method)
      parts.push(`Method: ${context.method}`);
    if (context.pathname)
      parts.push(`Path: ${context.pathname}`);
    if (context.route)
      parts.push(`Route: ${context.route}`);
    if (context.sessionId)
      parts.push(`Session: ${context.sessionId.slice(0, 8)}...`);
    for (const [key, value] of Object.entries(context)) {
      if (!["method", "pathname", "route", "sessionId", "module"].includes(key)) {
        parts.push(`${key}: ${value}`);
      }
    }
    return parts;
  }
  getDisplayPrefix(context) {
    return this.prefix;
  }
  getDisplayMessage(message, context) {
    if (context?.module) {
      return `[${context.module}] ${message}`;
    }
    return message;
  }
  info(message, context) {
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const displayMessage = this.getDisplayMessage(message, context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #22d3ee; font-weight: bold";
      if (contextParts.length > 0) {
        console.group(`%c${displayPrefix}%c INFO%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        contextParts.forEach((part) => console.log(`  ${part}`));
        console.groupEnd();
      } else {
        console.log(`%c${displayPrefix}%c INFO%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.log(this.formatMessage("info", message, context));
    }
  }
  debug(message, context) {
    const shouldLog = globalThis.__SSR_MODE__ || isBrowser && typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
    if (!shouldLog)
      return;
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const displayMessage = this.getDisplayMessage(message, context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #4ade80; font-weight: bold";
      if (contextParts.length > 0) {
        console.group(`%c${displayPrefix}%c DEBUG%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        contextParts.forEach((part) => console.log(`  ${part}`));
        console.groupEnd();
      } else {
        console.log(`%c${displayPrefix}%c DEBUG%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.log(this.formatMessage("debug", message, context));
    }
  }
  warn(message, context) {
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const displayMessage = this.getDisplayMessage(message, context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #fbbf24; font-weight: bold";
      if (contextParts.length > 0) {
        console.group(`%c${displayPrefix}%c WARN%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        contextParts.forEach((part) => console.warn(`  ${part}`));
        console.groupEnd();
      } else {
        console.warn(`%c${displayPrefix}%c WARN%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.warn(this.formatMessage("warn", message, context));
    }
  }
  error(message, error, context) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const baseMessage = error ? `${message}: ${errorMessage}` : message;
    const displayMessage = this.getDisplayMessage(baseMessage, context);
    if (isBrowser) {
      const contextParts = this.formatContextForBrowser(context);
      const displayPrefix = this.getDisplayPrefix(context);
      const prefixStyle = displayPrefix === "[SSR]" ? "color: #d946ef; font-weight: bold" : "color: #3b82f6; font-weight: bold";
      const levelStyle = "color: #ef4444; font-weight: bold";
      if (contextParts.length > 0 || error) {
        console.group(`%c${displayPrefix}%c ERROR%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
        if (contextParts.length > 0) {
          contextParts.forEach((part) => console.error(`  ${part}`));
        }
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack);
        }
        console.groupEnd();
      } else {
        console.error(`%c${displayPrefix}%c ERROR%c ${displayMessage}`, prefixStyle, levelStyle, "color: inherit");
      }
    } else {
      console.error(this.formatMessage("error", baseMessage, context));
      if (error instanceof Error && error.stack) {
        const stackTrace = colorize(error.stack, colors.dim + colors.red);
        console.error(stackTrace);
      }
    }
  }
}
var logger = new Logger;

// ../../server/ssrLogger.ts
var logger2 = new Logger;
logger2.setPrefix("[SSR]");

// ../../api/router.ts
function router($window, mountRedraw) {
  let p = Promise.resolve();
  let scheduled = false;
  let ready = false;
  let hasBeenResolved = false;
  let dom;
  let compiled;
  let fallbackRoute;
  let currentResolver = null;
  let component = "div";
  let attrs = {};
  let currentPath;
  let lastUpdate = null;
  const RouterRoot = {
    onremove: function() {
      ready = hasBeenResolved = false;
      $window.removeEventListener("popstate", fireAsync, false);
    },
    view: function() {
      const routeAttrs = { ...attrs, routePath: currentPath || attrs.routePath, key: currentPath || attrs.key };
      const vnode = vnode_default(component, currentPath || attrs.key, routeAttrs, null, null, null);
      if (currentResolver)
        return currentResolver.render(vnode);
      return [vnode];
    }
  };
  const SKIP = route.SKIP = {};
  const REDIRECT = route.REDIRECT = Symbol("REDIRECT");
  route.redirect = function(path) {
    return { [REDIRECT]: path };
  };
  function isRedirect(value) {
    if (value == null || typeof value !== "object")
      return false;
    if (REDIRECT in value)
      return true;
    const symbolKeys = Object.getOwnPropertySymbols(value);
    if (symbolKeys.length > 0) {
      for (const sym of symbolKeys) {
        const desc = sym.description || "";
        if (desc.includes("REDIRECT") || desc === "REDIRECT") {
          const path = value[sym];
          if (typeof path === "string" && path.startsWith("/")) {
            return true;
          }
        }
      }
    }
    return false;
  }
  function getRedirectPath(redirectObj) {
    if (REDIRECT in redirectObj) {
      return redirectObj[REDIRECT];
    }
    const symbolKeys = Object.getOwnPropertySymbols(redirectObj);
    for (const sym of symbolKeys) {
      const path = redirectObj[sym];
      if (typeof path === "string" && path.startsWith("/")) {
        return path;
      }
    }
    throw new Error("Invalid redirect object: no redirect path found");
  }
  function resolveRoute() {
    scheduled = false;
    const hash = getHash();
    let prefix = hash;
    if (route.prefix[0] !== "#") {
      const search = getSearch();
      prefix = search + prefix;
      if (route.prefix[0] !== "?") {
        const pathname = getPathname();
        prefix = pathname + prefix;
        if (prefix[0] !== "/")
          prefix = "/" + prefix;
      }
    }
    const path = decodeURIComponentSafe(prefix).slice(route.prefix.length);
    const data = parsePathname(path);
    Object.assign(data.params, $window.history.state || {});
    function reject(e) {
      console.error(e);
      route.set(fallbackRoute, null, { replace: true });
    }
    loop(0);
    function loop(i) {
      if (!compiled)
        return;
      for (;i < compiled.length; i++) {
        if (compiled[i].check(data)) {
          let payload = compiled[i].component;
          const matchedRoute = compiled[i].route;
          const localComp = payload;
          const resolverWithRender = payload && typeof payload === "object" && payload.onmatch && payload.render && !payload.view && typeof payload !== "function" ? payload : null;
          const update = lastUpdate = function(comp) {
            if (update !== lastUpdate)
              return;
            if (comp === SKIP)
              return loop(i + 1);
            if (isRedirect(comp)) {
              const redirectPath = comp[REDIRECT];
              route.set(redirectPath, null);
              return;
            }
            if (resolverWithRender) {
              currentResolver = resolverWithRender;
              component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div";
            } else if (comp && typeof comp === "object" && comp.render && !comp.view && typeof comp !== "function") {
              currentResolver = comp;
              component = "div";
            } else {
              currentResolver = null;
              component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div";
            }
            attrs = data.params;
            currentPath = path;
            lastUpdate = null;
            if (hasBeenResolved)
              mountRedraw.redraw();
            else {
              hasBeenResolved = true;
              mountRedraw.mount(dom, RouterRoot);
            }
          };
          if (payload.view || typeof payload === "function") {
            payload = {};
            update(localComp);
          } else if (payload.onmatch) {
            p.then(function() {
              return payload.onmatch(data.params, path, matchedRoute);
            }).then(update, path === fallbackRoute ? null : reject);
          } else if (payload.render) {
            update(payload);
          } else
            update("div");
          return;
        }
      }
      if (path === fallbackRoute) {
        throw new Error("Could not resolve default route " + fallbackRoute + ".");
      }
      route.set(fallbackRoute, null, { replace: true });
    }
  }
  function fireAsync() {
    if (!scheduled) {
      scheduled = true;
      setTimeout(resolveRoute);
    }
  }
  function route(root, defaultRoute, routes) {
    if (!root)
      throw new TypeError("DOM element being rendered to does not exist.");
    compiled = Object.keys(routes).map(function(routePath) {
      if (routePath[0] !== "/")
        throw new SyntaxError("Routes must start with a '/'.");
      if (/:([^\/\.-]+)(\.{3})?:/.test(routePath)) {
        throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
      }
      return {
        route: routePath,
        component: routes[routePath],
        check: compileTemplate(routePath)
      };
    });
    fallbackRoute = defaultRoute;
    if (defaultRoute != null) {
      const defaultData = parsePathname(defaultRoute);
      if (!compiled.some(function(i) {
        return i.check(defaultData);
      })) {
        throw new ReferenceError("Default route doesn't match any known routes.");
      }
    }
    dom = root;
    $window.addEventListener("popstate", fireAsync, false);
    ready = true;
    resolveRoute();
  }
  route.set = function(path, data, options) {
    if (lastUpdate != null) {
      options = options || {};
      options.replace = true;
    }
    lastUpdate = null;
    path = buildPathname(path, data || {});
    if (ready) {
      fireAsync();
      const state = options ? options.state : null;
      const title = options ? options.title : null;
      if ($window?.history) {
        if (options && options.replace)
          $window.history.replaceState(state, title, route.prefix + path);
        else
          $window.history.pushState(state, title, route.prefix + path);
      }
    } else {
      if ($window?.location) {
        $window.location.href = route.prefix + path;
      }
    }
  };
  route.get = function() {
    if (currentPath === undefined) {
      return getPathname();
    }
    return currentPath;
  };
  route.prefix = "#!";
  route.link = function(vnode) {
    return route.Link.view(vnode);
  };
  route.Link = {
    view: function(vnode) {
      const child = hyperscript_default(vnode.attrs?.selector || "a", censor(vnode.attrs || {}, ["options", "params", "selector", "onclick"]), vnode.children);
      let options;
      let onclick;
      let href;
      if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
        child.attrs.href = null;
        child.attrs["aria-disabled"] = "true";
      } else {
        options = vnode.attrs?.options;
        onclick = vnode.attrs?.onclick;
        href = buildPathname(child.attrs.href || "", vnode.attrs?.params || {});
        const linkPrefix = $window == null ? "" : route.prefix;
        child.attrs.href = linkPrefix + href;
        child.attrs.onclick = function(e) {
          let result;
          if (typeof onclick === "function") {
            result = onclick.call(e.currentTarget, e);
          } else if (onclick == null || typeof onclick !== "object") {} else if (typeof onclick.handleEvent === "function") {
            onclick.handleEvent(e);
          }
          if (result !== false && !e.defaultPrevented && (e.button === 0 || e.which === 0 || e.which === 1) && (!e.currentTarget.target || e.currentTarget.target === "_self") && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
            if (typeof e.preventDefault === "function") {
              e.preventDefault();
            } else if (e.originalEvent && typeof e.originalEvent.preventDefault === "function") {
              e.originalEvent.preventDefault();
            }
            e.redraw = false;
            route.set(href, null, options);
          }
        };
      }
      return child;
    }
  };
  route.param = function(key) {
    return attrs && key != null ? attrs[key] : attrs;
  };
  route.params = attrs;
  route.resolve = async function(pathname, routes, renderToString, prefix = "", redirectDepth = 0) {
    const MAX_REDIRECT_DEPTH = 5;
    if (redirectDepth > MAX_REDIRECT_DEPTH) {
      throw new Error(`Maximum redirect depth (${MAX_REDIRECT_DEPTH}) exceeded. Possible redirect loop.`);
    }
    const savedPrefix = route.prefix;
    route.prefix = prefix;
    const savedCurrentPath = currentPath;
    currentPath = pathname || "/";
    try {
      const compiled2 = Object.keys(routes).map(function(routePath) {
        if (routePath[0] !== "/")
          throw new SyntaxError("Routes must start with a '/'.");
        if (/:([^\/\.-]+)(\.{3})?:/.test(routePath)) {
          throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
        }
        const routeValue = routes[routePath];
        const component2 = routeValue && typeof routeValue === "object" && "component" in routeValue ? routeValue.component : routeValue;
        return {
          route: routePath,
          component: component2,
          check: compileTemplate(routePath)
        };
      });
      const path = decodeURIComponentSafe(pathname || "/").slice(prefix.length);
      const data = parsePathname(path);
      attrs = data.params;
      for (const { route: matchedRoute, component: component2, check } of compiled2) {
        if (check(data)) {
          let payload = component2;
          if (payload && typeof payload === "object" && (("onmatch" in payload) || ("render" in payload))) {
            const resolver = payload;
            if (resolver.onmatch) {
              const result = resolver.onmatch(data.params, pathname, matchedRoute);
              if (result instanceof Promise) {
                payload = await result;
              } else if (result !== undefined) {
                payload = result;
              }
            }
            if (isRedirect(payload)) {
              const redirectPath = getRedirectPath(payload);
              logger2.info(`Redirecting to ${redirectPath}`, {
                pathname,
                route: matchedRoute,
                redirectPath
              });
              const originalSSRUrl = globalThis.__SSR_URL__;
              try {
                if (originalSSRUrl && typeof originalSSRUrl === "string") {
                  try {
                    const originalUrl = new URL(originalSSRUrl);
                    const redirectUrl = new URL(redirectPath, originalUrl.origin);
                    globalThis.__SSR_URL__ = redirectUrl.href;
                  } catch {
                    globalThis.__SSR_URL__ = redirectPath;
                  }
                } else {
                  globalThis.__SSR_URL__ = redirectPath;
                }
                const redirectResult = await route.resolve(redirectPath, routes, renderToString, prefix, redirectDepth + 1);
                const redirectHtml = typeof redirectResult === "string" ? redirectResult : redirectResult.html;
                if (!redirectHtml || redirectHtml.length === 0) {
                  logger2.warn("Empty redirect result", {
                    pathname,
                    redirectPath,
                    route: matchedRoute
                  });
                } else {
                  logger2.debug("Redirect resolved", {
                    pathname,
                    redirectPath,
                    htmlSize: redirectHtml.length
                  });
                }
                return redirectResult;
              } finally {
                globalThis.__SSR_URL__ = originalSSRUrl;
              }
            }
            if (resolver.render) {
              const isComponentType2 = payload != null && payload !== resolver && (typeof payload === "function" || typeof payload === "object" && ("view" in payload) && typeof payload.view === "function");
              if (isComponentType2) {
                try {
                  const componentVnode = hyperscript_default(payload, data.params);
                  const renderedVnode = resolver.render(componentVnode);
                  const result = await renderToString(renderedVnode);
                  const html = typeof result === "string" ? result : result.html;
                  if (html) {
                    logger2.info(`Rendered route component`, {
                      pathname,
                      route: matchedRoute,
                      htmlSize: html.length
                    });
                  }
                  return result;
                } catch (error) {
                  logger2.error("Route render failed", error, {
                    pathname,
                    route: matchedRoute
                  });
                  throw error;
                }
              }
            }
          }
          const isComponentType = payload != null && (typeof payload === "function" || typeof payload === "object" && ("view" in payload) && typeof payload.view === "function");
          if (isComponentType) {
            const vnode2 = hyperscript_default(payload, data.params);
            const result = await renderToString(vnode2);
            return typeof result === "string" ? result : result;
          }
          const vnode = hyperscript_default("div", data.params);
          return await renderToString(vnode);
        }
      }
      throw new Error(`No route found for ${pathname}`);
    } finally {
      route.prefix = savedPrefix;
      currentPath = savedCurrentPath;
    }
  };
  return route;
}

// ../../util/ssr.ts
var HYDRATION_DEBUG = typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
var hydrationErrorCount = 0;
var MAX_HYDRATION_ERRORS = 10;
function resetHydrationErrorCount() {
  hydrationErrorCount = 0;
}
function getComponentName(vnode) {
  if (!vnode)
    return "Unknown";
  if (typeof vnode.tag === "string")
    return vnode.tag;
  if (vnode.tag?.name)
    return vnode.tag.name;
  if (vnode.tag?.displayName)
    return vnode.tag.displayName;
  if (vnode.state?.constructor?.name)
    return vnode.state.constructor.name;
  return "Unknown";
}
function formatDOMElement(el) {
  const tagName = el.tagName.toLowerCase();
  let openTag = `<${tagName}`;
  if (el.id) {
    openTag += ` id="${el.id}"`;
  }
  if (el.className && typeof el.className === "string") {
    const classes = el.className.split(" ").filter((c) => c).slice(0, 3).join(" ");
    if (classes) {
      openTag += ` className="${classes}${el.className.split(" ").length > 3 ? "..." : ""}"`;
    }
  }
  openTag += ">";
  return { tagName, openTag, closeTag: `</${tagName}>` };
}
function formatVDOMTree(vnode, maxDepth = 6, currentDepth = 0, showComponentInstance = true) {
  if (!vnode || currentDepth >= maxDepth)
    return "";
  const indent = "  ".repeat(currentDepth);
  if (vnode.tag === "#") {
    const text = String(vnode.children || vnode.text || "").substring(0, 50);
    return `${indent}"${text}${String(vnode.children || vnode.text || "").length > 50 ? "..." : ""}"`;
  }
  if (vnode.tag === "[") {
    if (!vnode.children || !Array.isArray(vnode.children) || vnode.children.length === 0) {
      return `${indent}[fragment]`;
    }
    const validChildren = vnode.children.filter((c) => c != null).slice(0, 8);
    let result2 = `${indent}[fragment]
`;
    for (const child of validChildren) {
      result2 += formatVDOMTree(child, maxDepth, currentDepth + 1, showComponentInstance) + `
`;
    }
    if (vnode.children.filter((c) => c != null).length > 8) {
      result2 += `${indent}  ... (${vnode.children.filter((c) => c != null).length - 8} more)
`;
    }
    return result2.trimEnd();
  }
  const isComponent = typeof vnode.tag !== "string";
  const tagName = isComponent ? getComponentName(vnode) : vnode.tag;
  let result = `${indent}<${tagName}`;
  if (vnode.attrs?.key) {
    result += ` key="${vnode.attrs.key}"`;
  }
  if (vnode.attrs) {
    const importantAttrs = ["id", "class", "className"];
    for (const attr of importantAttrs) {
      if (vnode.attrs[attr]) {
        const value = typeof vnode.attrs[attr] === "string" ? vnode.attrs[attr] : String(vnode.attrs[attr]);
        result += ` ${attr}="${value.substring(0, 30)}${value.length > 30 ? "..." : ""}"`;
        break;
      }
    }
  }
  result += ">";
  if (isComponent && showComponentInstance && vnode.instance && currentDepth < maxDepth - 1) {
    const instanceTree = formatVDOMTree(vnode.instance, maxDepth, currentDepth + 1, showComponentInstance);
    if (instanceTree) {
      result += `
` + instanceTree;
    }
  }
  if (vnode.children && Array.isArray(vnode.children) && currentDepth < maxDepth - 1) {
    const validChildren = vnode.children.filter((c) => c != null).slice(0, 10);
    if (validChildren.length > 0) {
      result += `
`;
      for (const child of validChildren) {
        if (typeof child === "string" || typeof child === "number") {
          const text = String(child).substring(0, 50);
          result += `${indent}  "${text}${String(child).length > 50 ? "..." : ""}"
`;
        } else {
          const childTree = formatVDOMTree(child, maxDepth, currentDepth + 1, showComponentInstance);
          if (childTree) {
            result += childTree + `
`;
          }
        }
      }
      if (vnode.children.filter((c) => c != null).length > 10) {
        result += `${indent}  ... (${vnode.children.filter((c) => c != null).length - 10} more children)
`;
      }
    }
  } else if (vnode.text != null) {
    const text = String(vnode.text).substring(0, 50);
    result += ` "${text}${String(vnode.text).length > 50 ? "..." : ""}"`;
  }
  result += `${indent}</${tagName}>`;
  return result;
}
function formatCombinedStructure(parent, vnode, maxParents = 4) {
  if (!parent && !vnode)
    return "";
  const domElements = [];
  let current = parent;
  let depth = 0;
  while (current && depth < maxParents) {
    if (current.nodeType === 1) {
      const el = current;
      if (el.tagName !== "HTML" && el.tagName !== "BODY") {
        domElements.unshift(formatDOMElement(el));
      }
    }
    current = current.parentElement || current.parentNode;
    depth++;
  }
  const lines = [];
  domElements.forEach((el, i) => {
    lines.push("  ".repeat(i) + el.openTag);
  });
  if (vnode) {
    const vdomIndent = domElements.length;
    const vdomTree = formatVDOMTree(vnode, 4, 0, true);
    if (vdomTree) {
      const vdomLines = vdomTree.split(`
`);
      vdomLines.forEach((line) => {
        lines.push("  ".repeat(vdomIndent) + line);
      });
    }
  }
  for (let i = domElements.length - 1;i >= 0; i--) {
    lines.push("  ".repeat(i) + domElements[i].closeTag);
  }
  return lines.join(`
`);
}
function buildComponentPath(vnode, context) {
  const path = [];
  const traverseVnode = (v, depth = 0) => {
    if (!v || depth > 10)
      return false;
    const name = getComponentName(v);
    const isComponent = typeof v.tag !== "string" && name !== "Unknown" && name !== "Component" && name !== "AnonymousComponent";
    if (isComponent) {
      path.push(name);
    }
    if (v.instance && depth < 2) {
      if (traverseVnode(v.instance, depth + 1))
        return true;
    }
    if (v.children && Array.isArray(v.children) && depth < 2) {
      for (let i = 0;i < Math.min(v.children.length, 3); i++) {
        const child = v.children[i];
        if (child && traverseVnode(child, depth + 1))
          return true;
      }
    }
    return false;
  };
  if (context?.newVnode) {
    traverseVnode(context.newVnode);
    if (path.length > 0)
      return path;
  }
  if (context?.oldVnode) {
    traverseVnode(context.oldVnode);
    if (path.length > 0)
      return path;
  }
  if (vnode) {
    traverseVnode(vnode);
  }
  return path;
}
function formatComponentHierarchy(vnode, context) {
  if (!vnode)
    return "Unknown";
  const path = buildComponentPath(vnode, context);
  const immediateName = getComponentName(vnode);
  const isElement = typeof vnode.tag === "string";
  if (path.length > 0) {
    const pathStr = path.join(" → ");
    if (isElement && immediateName !== path[path.length - 1]) {
      return `${immediateName} in ${pathStr}`;
    } else {
      return pathStr;
    }
  }
  return immediateName;
}
function logHydrationError(operation, vnode, _element, error, context) {
  updateHydrationStats(vnode);
  hydrationErrorCount++;
  if (hydrationErrorCount > MAX_HYDRATION_ERRORS) {
    if (hydrationErrorCount === MAX_HYDRATION_ERRORS + 1) {
      const topComponents = Array.from(hydrationStats.componentMismatches.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => `${name}: ${count}`).join(", ");
      logger.warn(`Hydration errors throttled: More than ${MAX_HYDRATION_ERRORS} errors detected. Suppressing further logs to improve performance.`, {
        totalMismatches: hydrationStats.totalMismatches,
        topComponents: topComponents || "none"
      });
    }
    return;
  }
  const componentHierarchy = formatComponentHierarchy(vnode, context);
  const logContext = {
    componentPath: componentHierarchy,
    operation
  };
  if (context?.node) {
    logContext.affectedNode = context.node.nodeType === 1 ? `${context.node.tagName.toLowerCase()}` : "text";
  }
  if (HYDRATION_DEBUG) {
    const vnodeToShow = context?.oldVnode || vnode || context?.newVnode;
    try {
      const combinedStructure = formatCombinedStructure(context?.parent || null, vnodeToShow, 4);
      if (combinedStructure) {
        logContext.structure = combinedStructure;
      }
    } catch (_e) {
      if (vnodeToShow) {
        try {
          const vdomTree = formatVDOMTree(vnodeToShow, 4, 0, true);
          if (vdomTree) {
            logContext.vdomStructure = vdomTree;
          }
        } catch (_e2) {
          logContext.component = getComponentName(vnodeToShow);
        }
      }
    }
    if (context?.oldVnode && context?.newVnode) {
      try {
        const oldTree = formatVDOMTree(context.oldVnode, 3);
        const newTree = formatVDOMTree(context.newVnode, 3);
        if (oldTree)
          logContext.removing = oldTree;
        if (newTree)
          logContext.replacingWith = newTree;
      } catch (_e) {}
    }
  }
  if (operation.includes("removeChild") || operation.includes("removeDOM")) {
    logContext.handledGracefully = true;
  }
  logger.error(`Hydration error: ${operation}`, error, logContext);
}
var hydrationStats = {
  totalMismatches: 0,
  componentMismatches: new Map,
  lastMismatchTime: 0
};
function updateHydrationStats(vnode) {
  hydrationStats.totalMismatches++;
  hydrationStats.lastMismatchTime = Date.now();
  const componentName = getComponentName(vnode);
  const currentCount = hydrationStats.componentMismatches.get(componentName) || 0;
  hydrationStats.componentMismatches.set(componentName, currentCount + 1);
}

// ../../render/delayedRemoval.ts
var delayedRemoval_default = new WeakMap;

// ../../render/domFor.ts
function* domFor(vnode) {
  let dom = vnode.dom;
  let domSize = vnode.domSize;
  const generation = delayedRemoval_default.get(dom);
  do {
    const nextSibling = dom.nextSibling;
    if (delayedRemoval_default.get(dom) === generation) {
      yield dom;
      domSize--;
    }
    dom = nextSibling;
  } while (domSize);
}
var domFor_default = domFor;

// ../../render/render.ts
function renderFactory() {
  const nameSpace = {
    svg: "http://www.w3.org/2000/svg",
    math: "http://www.w3.org/1998/Math/MathML"
  };
  let currentRedraw;
  let currentRender;
  let hydrationMismatchCount = 0;
  const MAX_HYDRATION_MISMATCHES = 5;
  function getDocument(dom) {
    return dom.ownerDocument;
  }
  function getNameSpace(vnode) {
    return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag];
  }
  function checkState(vnode, original) {
    if (vnode.state !== original)
      throw new Error("'vnode.state' must not be modified.");
  }
  function callHook(vnode, ...args) {
    const original = vnode.state;
    try {
      return this.apply(original, [vnode, ...args]);
    } finally {
      checkState(vnode, original);
    }
  }
  function activeElement(dom) {
    try {
      return getDocument(dom).activeElement;
    } catch (_e) {
      return null;
    }
  }
  function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns, isHydrating = false, matchedNodes = null) {
    const createdMatchedNodes = matchedNodes == null && isHydrating && nextSibling == null;
    if (createdMatchedNodes) {
      matchedNodes = new Set;
    }
    for (let i = start;i < end; i++) {
      const vnode = vnodes[i];
      if (vnode != null) {
        createNode(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
      }
    }
    if (createdMatchedNodes && matchedNodes && parent.firstChild && nextSibling == null) {
      let node = parent.firstChild;
      while (node) {
        const next = node.nextSibling;
        if (!matchedNodes.has(node)) {
          try {
            parent.removeChild(node);
          } catch (e) {
            const error = e;
            logHydrationError("removeChild (root level cleanup)", null, parent instanceof Element ? parent : null, error, { parent: parent instanceof Element ? parent : undefined, node, matchedNodes });
          }
        }
        node = next;
      }
    }
  }
  function createNode(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    const tag = vnode.tag;
    if (typeof tag === "string") {
      vnode.state = {};
      if (vnode.attrs != null)
        initLifecycle(vnode.attrs, vnode, hooks, isHydrating);
      switch (tag) {
        case "#":
          createText(parent, vnode, nextSibling, isHydrating, matchedNodes);
          break;
        case "<":
          createHTML(parent, vnode, ns, nextSibling);
          break;
        case "[":
          createFragment(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
          break;
        default:
          createElement(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
      }
    } else
      createComponent(parent, vnode, hooks, ns, nextSibling, isHydrating, matchedNodes);
  }
  function createText(parent, vnode, nextSibling, isHydrating = false, matchedNodes = null) {
    let textNode;
    if (isHydrating && parent.firstChild && nextSibling == null && matchedNodes) {
      const expectedText = String(vnode.children || "").trim();
      let candidate = parent.firstChild;
      while (candidate) {
        if (candidate.nodeType === 3 && !matchedNodes.has(candidate)) {
          const candidateText = candidate;
          const candidateValue = candidateText.nodeValue || "";
          if (candidateValue === String(vnode.children) || expectedText && candidateValue.trim() === expectedText) {
            textNode = candidateText;
            matchedNodes.add(textNode);
            if (candidateValue !== String(vnode.children)) {
              textNode.nodeValue = String(vnode.children);
            }
            break;
          }
        }
        candidate = candidate.nextSibling;
      }
      if (!textNode) {
        textNode = getDocument(parent).createTextNode(vnode.children);
        insertDOM(parent, textNode, nextSibling);
      }
    } else {
      textNode = getDocument(parent).createTextNode(vnode.children);
      insertDOM(parent, textNode, nextSibling);
    }
    vnode.dom = textNode;
  }
  const possibleParents = { caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup" };
  function createHTML(parent, vnode, ns, nextSibling) {
    const match = vnode.children.match(/^\s*?<(\w+)/im) || [];
    let temp = getDocument(parent).createElement(possibleParents[match[1]] || "div");
    if (ns === "http://www.w3.org/2000/svg") {
      temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + vnode.children + "</svg>";
      temp = temp.firstChild;
    } else {
      temp.innerHTML = vnode.children;
    }
    vnode.dom = temp.firstChild;
    vnode.domSize = temp.childNodes.length;
    const fragment2 = getDocument(parent).createDocumentFragment();
    let child;
    while ((child = temp.firstChild) != null) {
      fragment2.appendChild(child);
    }
    insertDOM(parent, fragment2, nextSibling);
  }
  function createFragment(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    const fragment2 = getDocument(parent).createDocumentFragment();
    if (vnode.children != null) {
      const children = vnode.children;
      createNodes(fragment2, children, 0, children.length, hooks, null, ns, isHydrating, matchedNodes);
    }
    vnode.dom = fragment2.firstChild;
    vnode.domSize = fragment2.childNodes.length;
    insertDOM(parent, fragment2, nextSibling);
  }
  function createElement(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    const tag = vnode.tag;
    const attrs = vnode.attrs;
    const is = vnode.is;
    ns = getNameSpace(vnode) || ns;
    let element;
    if (isHydrating && parent.firstChild && nextSibling == null && matchedNodes) {
      let candidate = parent.firstChild;
      let fallbackCandidate = null;
      while (candidate) {
        if (candidate.nodeType === 1 && !matchedNodes.has(candidate)) {
          const candidateEl = candidate;
          const candidateTag = candidateEl.tagName || candidateEl.nodeName;
          if (candidateTag && candidateTag.toLowerCase() === tag.toLowerCase()) {
            if (!is || candidateEl.getAttribute("is") === is) {
              element = candidateEl;
              matchedNodes.add(element);
              break;
            }
            if (!fallbackCandidate) {
              fallbackCandidate = candidateEl;
            }
          }
        }
        candidate = candidate.nextSibling;
      }
      if (!element && fallbackCandidate) {
        element = fallbackCandidate;
        matchedNodes.add(element);
      }
      if (!element) {
        element = ns ? is ? getDocument(parent).createElementNS(ns, tag, { is }) : getDocument(parent).createElementNS(ns, tag) : is ? getDocument(parent).createElement(tag, { is }) : getDocument(parent).createElement(tag);
        insertDOM(parent, element, nextSibling);
      }
    } else {
      element = ns ? is ? getDocument(parent).createElementNS(ns, tag, { is }) : getDocument(parent).createElementNS(ns, tag) : is ? getDocument(parent).createElement(tag, { is }) : getDocument(parent).createElement(tag);
      insertDOM(parent, element, nextSibling);
    }
    vnode.dom = element;
    if (attrs != null) {
      setAttrs(vnode, attrs, ns);
    }
    if (!maybeSetContentEditable(vnode)) {
      if (vnode.children != null) {
        const children = vnode.children;
        const childMatchedNodes = isHydrating && element.firstChild ? new Set : null;
        createNodes(element, children, 0, children.length, hooks, null, ns, isHydrating, childMatchedNodes);
        if (isHydrating && childMatchedNodes && element.firstChild && childMatchedNodes.size > 0) {
          let node = element.firstChild;
          while (node) {
            const next = node.nextSibling;
            if (!childMatchedNodes.has(node)) {
              if (element.contains && element.contains(node)) {
                try {
                  element.removeChild(node);
                  hydrationMismatchCount++;
                } catch (e) {
                  const error = e;
                  if (!element.contains || !element.contains(node)) {
                    node = next;
                    continue;
                  }
                  hydrationMismatchCount++;
                  logHydrationError("removeChild (element children cleanup)", vnode, element, error, { parent: element, node, matchedNodes: childMatchedNodes });
                }
              }
            }
            node = next;
          }
        }
        if (vnode.tag === "select" && attrs != null)
          setLateSelectAttrs(vnode, attrs);
      }
    }
  }
  function initComponent(vnode, hooks, isHydrating = false) {
    let sentinel;
    if (typeof vnode.tag.view === "function") {
      vnode.state = Object.create(vnode.tag);
      sentinel = vnode.state.view;
      if (sentinel.$$reentrantLock$$ != null)
        return;
      sentinel.$$reentrantLock$$ = true;
    } else {
      vnode.state = undefined;
      sentinel = vnode.tag;
      if (sentinel.$$reentrantLock$$ != null)
        return;
      sentinel.$$reentrantLock$$ = true;
      vnode.state = vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function" ? new vnode.tag(vnode) : vnode.tag(vnode);
    }
    initLifecycle(vnode.state, vnode, hooks, isHydrating);
    if (vnode.attrs != null)
      initLifecycle(vnode.attrs, vnode, hooks, isHydrating);
    if (vnode.state && vnode.tag && !isHydrating) {
      globalThis.__mithrilStateToComponent = globalThis.__mithrilStateToComponent || new WeakMap;
      globalThis.__mithrilStateToComponent.set(vnode.state, vnode.tag);
    }
    if (vnode.state != null) {
      setCurrentComponent(vnode.state);
    }
    try {
      vnode.instance = vnode_default.normalize(callHook.call(vnode.state.view, vnode));
    } finally {
      if (vnode.state != null) {
        clearCurrentComponent();
      }
    }
    if (vnode.instance === vnode)
      throw Error("A view cannot return the vnode it received as argument");
    sentinel.$$reentrantLock$$ = null;
  }
  function createComponent(parent, vnode, hooks, ns, nextSibling, isHydrating = false, matchedNodes = null) {
    initComponent(vnode, hooks, isHydrating);
    if (vnode.instance != null) {
      createNode(parent, vnode.instance, hooks, ns, nextSibling, isHydrating, matchedNodes);
      vnode.dom = vnode.instance.dom;
      vnode.domSize = vnode.instance.domSize;
      if (vnode.state && vnode.dom && !isHydrating) {
        globalThis.__mithrilStateToDom = globalThis.__mithrilStateToDom || new WeakMap;
        globalThis.__mithrilStateToDom.set(vnode.state, vnode.dom);
      }
    } else {
      vnode.domSize = 0;
    }
  }
  function updateNodes(parent, old, vnodes, hooks, nextSibling, ns, isHydrating = false) {
    if (old === vnodes || old == null && vnodes == null)
      return;
    else if (old == null || old.length === 0)
      createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns, isHydrating);
    else if (vnodes == null || vnodes.length === 0)
      removeNodes(parent, old, 0, old.length);
    else {
      const isOldKeyed = old[0] != null && old[0].key != null;
      const isKeyed = vnodes[0] != null && vnodes[0].key != null;
      let start = 0, oldStart = 0, o, v;
      if (isOldKeyed !== isKeyed) {
        removeNodes(parent, old, 0, old.length);
        createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns, isHydrating);
      } else if (!isKeyed) {
        const commonLength = old.length < vnodes.length ? old.length : vnodes.length;
        while (oldStart < old.length && old[oldStart] == null)
          oldStart++;
        while (start < vnodes.length && vnodes[start] == null)
          start++;
        start = start < oldStart ? start : oldStart;
        for (;start < commonLength; start++) {
          o = old[start];
          v = vnodes[start];
          if (o === v || o == null && v == null)
            continue;
          else if (o == null)
            createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, old.length, nextSibling), isHydrating);
          else if (v == null)
            removeNode(parent, o);
          else
            updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, old.length, nextSibling), ns, isHydrating);
        }
        if (old.length > commonLength)
          removeNodes(parent, old, start, old.length);
        if (vnodes.length > commonLength)
          createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns, isHydrating);
      } else {
        let oldEnd = old.length - 1, end = vnodes.length - 1, oe, ve, topSibling;
        while (oldEnd >= oldStart && end >= start) {
          oe = old[oldEnd];
          ve = vnodes[end];
          if (oe == null || ve == null || oe.key !== ve.key)
            break;
          if (oe !== ve)
            updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating);
          if (ve.dom != null)
            nextSibling = ve.dom;
          oldEnd--, end--;
        }
        while (oldEnd >= oldStart && end >= start) {
          o = old[oldStart];
          v = vnodes[start];
          if (o == null || v == null || o.key !== v.key)
            break;
          oldStart++, start++;
          if (o !== v)
            updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, oldEnd + 1, nextSibling), ns, isHydrating);
        }
        while (oldEnd >= oldStart && end >= start) {
          if (start === end)
            break;
          o = old[oldStart];
          ve = vnodes[end];
          oe = old[oldEnd];
          v = vnodes[start];
          if (o == null || ve == null || oe == null || v == null || o.key !== ve.key || oe.key !== v.key)
            break;
          topSibling = getNextSibling(old, oldStart, oldEnd, nextSibling);
          moveDOM(parent, oe, topSibling);
          if (oe !== v)
            updateNode(parent, oe, v, hooks, topSibling, ns, isHydrating);
          if (++start <= --end)
            moveDOM(parent, o, nextSibling);
          if (o !== ve)
            updateNode(parent, o, ve, hooks, nextSibling, ns, isHydrating);
          if (ve.dom != null)
            nextSibling = ve.dom;
          oldStart++;
          oldEnd--;
          oe = old[oldEnd];
          ve = vnodes[end];
          o = old[oldStart];
          v = vnodes[start];
        }
        while (oldEnd >= oldStart && end >= start) {
          oe = old[oldEnd];
          ve = vnodes[end];
          if (oe == null || ve == null || oe.key !== ve.key)
            break;
          if (oe !== ve)
            updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating);
          if (ve.dom != null)
            nextSibling = ve.dom;
          oldEnd--, end--;
          oe = old[oldEnd];
          ve = vnodes[end];
        }
        if (start > end)
          removeNodes(parent, old, oldStart, oldEnd + 1);
        else if (oldStart > oldEnd)
          createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns, isHydrating);
        else {
          const originalNextSibling = nextSibling;
          let pos = 2147483647, matched = 0;
          const oldIndices = new Array(end - start + 1).fill(-1);
          const map = Object.create(null);
          for (let i = start;i <= end; i++) {
            if (vnodes[i] != null)
              map[vnodes[i].key] = i;
          }
          for (let i = oldEnd;i >= oldStart; i--) {
            oe = old[i];
            if (oe == null)
              continue;
            const newIndex = map[oe.key];
            if (newIndex != null) {
              pos = newIndex < pos ? newIndex : -1;
              oldIndices[newIndex - start] = i;
              ve = vnodes[newIndex];
              old[i] = null;
              if (oe !== ve)
                updateNode(parent, oe, ve, hooks, nextSibling, ns, isHydrating);
              if (ve != null && ve.dom != null)
                nextSibling = ve.dom;
              matched++;
            }
          }
          nextSibling = originalNextSibling;
          if (matched !== oldEnd - oldStart + 1)
            removeNodes(parent, old, oldStart, oldEnd + 1);
          if (matched === 0)
            createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns, isHydrating);
          else {
            if (pos === -1) {
              const lisIndices = makeLisIndices(oldIndices);
              let li = lisIndices.length - 1;
              for (let i = end;i >= start; i--) {
                ve = vnodes[i];
                if (ve == null)
                  continue;
                if (oldIndices[i - start] === -1)
                  createNode(parent, ve, hooks, ns, nextSibling, isHydrating);
                else {
                  if (lisIndices[li] === i - start)
                    li--;
                  else
                    moveDOM(parent, ve, nextSibling);
                }
                if (ve.dom != null)
                  nextSibling = ve.dom;
              }
            } else {
              for (let i = end;i >= start; i--) {
                ve = vnodes[i];
                if (ve == null)
                  continue;
                if (oldIndices[i - start] === -1)
                  createNode(parent, ve, hooks, ns, nextSibling, isHydrating);
                if (ve.dom != null)
                  nextSibling = ve.dom;
              }
            }
          }
        }
      }
    }
  }
  function updateNode(parent, old, vnode, hooks, nextSibling, ns, isHydrating = false) {
    const oldTag = old.tag, tag = vnode.tag;
    if (oldTag === tag && old.is === vnode.is) {
      vnode.state = old.state;
      vnode.events = old.events;
      if (shouldNotUpdate(vnode, old))
        return;
      if (typeof oldTag === "string") {
        if (vnode.attrs != null) {
          updateLifecycle(vnode.attrs, vnode, hooks);
        }
        switch (oldTag) {
          case "#":
            updateText(old, vnode);
            break;
          case "<":
            updateHTML(parent, old, vnode, ns, nextSibling);
            break;
          case "[":
            updateFragment(parent, old, vnode, hooks, nextSibling, ns, isHydrating);
            break;
          default:
            updateElement(old, vnode, hooks, ns, isHydrating);
        }
      } else
        updateComponent(parent, old, vnode, hooks, nextSibling, ns, isHydrating);
    } else {
      removeNode(parent, old, vnode);
      createNode(parent, vnode, hooks, ns, nextSibling, isHydrating);
    }
  }
  function updateText(old, vnode) {
    if (old.children.toString() !== vnode.children.toString()) {
      old.dom.nodeValue = vnode.children;
    }
    vnode.dom = old.dom;
  }
  function updateHTML(parent, old, vnode, ns, nextSibling) {
    if (old.children !== vnode.children) {
      removeDOM(parent, old);
      createHTML(parent, vnode, ns, nextSibling);
    } else {
      vnode.dom = old.dom;
      vnode.domSize = old.domSize;
    }
  }
  function updateFragment(parent, old, vnode, hooks, nextSibling, ns, isHydrating = false) {
    updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns, isHydrating);
    let domSize = 0;
    const children = vnode.children;
    vnode.dom = null;
    if (children != null) {
      for (let i = 0;i < children.length; i++) {
        const child = children[i];
        if (child != null && child.dom != null) {
          if (vnode.dom == null)
            vnode.dom = child.dom;
          domSize += child.domSize || 1;
        }
      }
    }
    vnode.domSize = domSize;
  }
  function updateElement(old, vnode, hooks, ns, isHydrating = false) {
    const element = vnode.dom = old.dom;
    ns = getNameSpace(vnode) || ns;
    if (old.attrs != vnode.attrs || vnode.attrs != null && !cachedAttrsIsStaticMap_default.get(vnode.attrs)) {
      updateAttrs(vnode, old.attrs, vnode.attrs, ns);
    }
    if (!maybeSetContentEditable(vnode)) {
      updateNodes(element, old.children, vnode.children, hooks, null, ns, isHydrating);
    }
  }
  function updateComponent(parent, old, vnode, hooks, nextSibling, ns, isHydrating = false) {
    if (vnode.state && vnode.tag && !isHydrating) {
      globalThis.__mithrilStateToComponent = globalThis.__mithrilStateToComponent || new WeakMap;
      globalThis.__mithrilStateToComponent.set(vnode.state, vnode.tag);
    }
    if (vnode.state != null) {
      setCurrentComponent(vnode.state);
    }
    try {
      vnode.instance = vnode_default.normalize(callHook.call(vnode.state.view, vnode));
    } finally {
      if (vnode.state != null) {
        clearCurrentComponent();
      }
    }
    if (vnode.instance === vnode)
      throw Error("A view cannot return the vnode it received as argument");
    updateLifecycle(vnode.state, vnode, hooks);
    if (vnode.attrs != null)
      updateLifecycle(vnode.attrs, vnode, hooks);
    if (vnode.instance != null) {
      if (old.instance == null)
        createNode(parent, vnode.instance, hooks, ns, nextSibling, isHydrating);
      else
        updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns, isHydrating);
      vnode.dom = vnode.instance.dom;
      vnode.domSize = vnode.instance.domSize;
      if (vnode.state && vnode.dom && !isHydrating) {
        globalThis.__mithrilStateToDom = globalThis.__mithrilStateToDom || new WeakMap;
        globalThis.__mithrilStateToDom.set(vnode.state, vnode.dom);
      }
    } else {
      if (old.instance != null)
        removeNode(parent, old.instance);
      vnode.domSize = 0;
    }
  }
  const lisTemp = [];
  function makeLisIndices(a) {
    const result = [0];
    let u = 0, v = 0;
    const il = lisTemp.length = a.length;
    for (let i = 0;i < il; i++)
      lisTemp[i] = a[i];
    for (let i = 0;i < il; ++i) {
      if (a[i] === -1)
        continue;
      const j = result[result.length - 1];
      if (a[j] < a[i]) {
        lisTemp[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        const c = (u >>> 1) + (v >>> 1) + (u & v & 1);
        if (a[result[c]] < a[i]) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (a[i] < a[result[u]]) {
        if (u > 0)
          lisTemp[i] = result[u - 1];
        result[u] = i;
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = lisTemp[v];
    }
    lisTemp.length = 0;
    return result;
  }
  function getNextSibling(vnodes, i, end, nextSibling) {
    for (;i < end; i++) {
      if (vnodes[i] != null && vnodes[i].dom != null)
        return vnodes[i].dom;
    }
    return nextSibling;
  }
  function moveDOM(parent, vnode, nextSibling) {
    if (vnode.dom != null) {
      let target;
      if (vnode.domSize == null || vnode.domSize === 1) {
        target = vnode.dom;
      } else {
        target = getDocument(parent).createDocumentFragment();
        for (const dom of domFor_default(vnode))
          target.appendChild(dom);
      }
      insertDOM(parent, target, nextSibling);
    }
  }
  function insertDOM(parent, dom, nextSibling) {
    if (nextSibling != null)
      parent.insertBefore(dom, nextSibling);
    else
      parent.appendChild(dom);
  }
  function maybeSetContentEditable(vnode) {
    if (vnode.attrs == null || vnode.attrs.contenteditable == null && vnode.attrs.contentEditable == null)
      return false;
    const children = vnode.children;
    if (children != null && children.length === 1 && children[0].tag === "<") {
      const content = children[0].children;
      if (vnode.dom.innerHTML !== content)
        vnode.dom.innerHTML = content;
    } else if (children != null && children.length !== 0)
      throw new Error("Child node of a contenteditable must be trusted.");
    return true;
  }
  function removeNodes(parent, vnodes, start, end) {
    for (let i = start;i < end; i++) {
      const vnode = vnodes[i];
      if (vnode != null)
        removeNode(parent, vnode);
    }
  }
  function tryBlockRemove(parent, vnode, source, counter) {
    const original = vnode.state;
    const result = callHook.call(source.onbeforeremove, vnode);
    if (result == null)
      return;
    const generation = currentRender;
    for (const dom of domFor_default(vnode))
      delayedRemoval_default.set(dom, generation);
    counter.v++;
    Promise.resolve(result).finally(function() {
      checkState(vnode, original);
      tryResumeRemove(parent, vnode, counter);
    });
  }
  function tryResumeRemove(parent, vnode, counter, newVnode) {
    if (--counter.v === 0) {
      onremove(vnode);
      removeDOM(parent, vnode, newVnode);
    }
  }
  function removeNode(parent, vnode, newVnode) {
    const counter = { v: 1 };
    if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function")
      tryBlockRemove(parent, vnode, vnode.state, counter);
    if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function")
      tryBlockRemove(parent, vnode, vnode.attrs, counter);
    tryResumeRemove(parent, vnode, counter, newVnode);
  }
  function removeDOM(parent, vnode, newVnode) {
    if (vnode.dom == null)
      return;
    if (vnode.domSize == null || vnode.domSize === 1) {
      const node = vnode.dom;
      if (parent.contains && parent.contains(node)) {
        try {
          parent.removeChild(node);
        } catch (e) {
          const error = e;
          if (!parent.contains || !parent.contains(node)) {
            return;
          }
          logHydrationError("removeDOM (single node)", vnode, parent instanceof Element ? parent : null, error, { parent: parent instanceof Element ? parent : undefined, node: vnode.dom, oldVnode: vnode, newVnode });
        }
      }
    } else {
      for (const dom of domFor_default(vnode)) {
        if (parent.contains && parent.contains(dom)) {
          try {
            parent.removeChild(dom);
          } catch (e) {
            const error = e;
            if (!parent.contains || !parent.contains(dom)) {
              continue;
            }
            logHydrationError("removeDOM (multiple nodes)", vnode, parent instanceof Element ? parent : null, error, { parent: parent instanceof Element ? parent : undefined, node: dom, oldVnode: vnode, newVnode });
          }
        }
      }
    }
  }
  function onremove(vnode) {
    if (typeof vnode.tag !== "string" && vnode.state != null) {
      clearComponentDependencies(vnode.state);
    }
    if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function")
      callHook.call(vnode.state.onremove, vnode);
    if (vnode.attrs && typeof vnode.attrs.onremove === "function")
      callHook.call(vnode.attrs.onremove, vnode);
    if (typeof vnode.tag !== "string") {
      if (vnode.instance != null)
        onremove(vnode.instance);
    } else {
      if (vnode.events != null)
        vnode.events._ = null;
      const children = vnode.children;
      if (Array.isArray(children)) {
        for (let i = 0;i < children.length; i++) {
          const child = children[i];
          if (child != null)
            onremove(child);
        }
      }
    }
  }
  function setAttrs(vnode, attrs, ns) {
    for (const key in attrs) {
      setAttr(vnode, key, null, attrs[key], ns);
    }
  }
  function setAttr(vnode, key, old, value, ns) {
    if (key === "key" || value == null || isLifecycleMethod(key) || old === value && !isFormAttribute(vnode, key) && typeof value !== "object")
      return;
    if (key[0] === "o" && key[1] === "n")
      return updateEvent(vnode, key, value);
    if (key.slice(0, 6) === "xlink:")
      vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
    else if (key === "style")
      updateStyle(vnode.dom, old, value);
    else if (hasPropertyKey(vnode, key, ns)) {
      if (key === "value") {
        if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value)
          return;
        if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value)
          return;
        if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value)
          return;
        if (vnode.tag === "input" && vnode.attrs.type === "file" && "" + value !== "") {
          console.error("`value` is read-only on file inputs!");
          return;
        }
      }
      if (vnode.tag === "input" && key === "type")
        vnode.dom.setAttribute(key, value);
      else
        vnode.dom[key] = value;
    } else {
      if (typeof value === "boolean") {
        if (value)
          vnode.dom.setAttribute(key, "");
        else
          vnode.dom.removeAttribute(key);
      } else
        vnode.dom.setAttribute(key === "className" ? "class" : key, value);
    }
  }
  function removeAttr(vnode, key, old, ns) {
    if (key === "key" || old == null || isLifecycleMethod(key))
      return;
    if (key[0] === "o" && key[1] === "n")
      updateEvent(vnode, key, undefined);
    else if (key === "style")
      updateStyle(vnode.dom, old, null);
    else if (hasPropertyKey(vnode, key, ns) && key !== "className" && key !== "title" && !(key === "value" && (vnode.tag === "option" || vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement(vnode.dom))) && !(vnode.tag === "input" && key === "type")) {
      vnode.dom[key] = null;
    } else {
      const nsLastIndex = key.indexOf(":");
      if (nsLastIndex !== -1)
        key = key.slice(nsLastIndex + 1);
      if (old !== false)
        vnode.dom.removeAttribute(key === "className" ? "class" : key);
    }
  }
  function setLateSelectAttrs(vnode, attrs) {
    if ("value" in attrs) {
      if (attrs.value === null) {
        if (vnode.dom.selectedIndex !== -1)
          vnode.dom.value = null;
      } else {
        const normalized = "" + attrs.value;
        if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
          vnode.dom.value = normalized;
        }
      }
    }
    if ("selectedIndex" in attrs)
      setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
  }
  function updateAttrs(vnode, old, attrs, ns) {
    let val;
    if (old != null) {
      if (old === attrs && !cachedAttrsIsStaticMap_default.has(attrs)) {
        console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
      }
      for (const key in old) {
        if ((val = old[key]) != null && (attrs == null || attrs[key] == null)) {
          removeAttr(vnode, key, val, ns);
        }
      }
    }
    if (attrs != null) {
      for (const key in attrs) {
        setAttr(vnode, key, old && old[key], attrs[key], ns);
      }
    }
  }
  function isFormAttribute(vnode, attr) {
    return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && (vnode.dom === activeElement(vnode.dom) || vnode.tag === "option" && vnode.dom.parentNode === activeElement(vnode.dom));
  }
  function isLifecycleMethod(attr) {
    return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate";
  }
  function hasPropertyKey(vnode, key, ns) {
    return ns === undefined && (vnode.tag.indexOf("-") > -1 || vnode.is || key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height") && key in vnode.dom;
  }
  function updateStyle(element, old, style) {
    if (old === style) {} else if (style == null) {
      element.style.cssText = "";
    } else if (typeof style !== "object") {
      element.style.cssText = style;
    } else if (old == null || typeof old !== "object") {
      element.style.cssText = "";
      for (const key in style) {
        const value = style[key];
        if (value != null) {
          if (key.includes("-"))
            element.style.setProperty(key, String(value));
          else
            element.style[key] = String(value);
        }
      }
    } else {
      for (const key in old) {
        if (old[key] != null && style[key] == null) {
          if (key.includes("-"))
            element.style.removeProperty(key);
          else
            element.style[key] = "";
        }
      }
      for (const key in style) {
        let value = style[key];
        if (value != null && (value = String(value)) !== String(old[key])) {
          if (key.includes("-"))
            element.style.setProperty(key, value);
          else
            element.style[key] = value;
        }
      }
    }
  }
  function EventDict() {
    this._ = currentRedraw;
  }
  EventDict.prototype = Object.create(null);
  EventDict.prototype.handleEvent = function(ev) {
    const handler = this["on" + ev.type];
    let result;
    if (typeof handler === "function")
      result = handler.call(ev.currentTarget, ev);
    else if (typeof handler.handleEvent === "function")
      handler.handleEvent(ev);
    const self = this;
    if (self._ != null) {
      if (ev.redraw !== false)
        (0, self._)();
      if (result != null && typeof result.then === "function") {
        Promise.resolve(result).then(function() {
          if (self._ != null && ev.redraw !== false)
            (0, self._)();
        });
      }
    }
    if (result === false) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };
  function updateEvent(vnode, key, value) {
    if (vnode.events != null) {
      vnode.events._ = currentRedraw;
      if (vnode.events[key] === value)
        return;
      if (value != null && (typeof value === "function" || typeof value === "object")) {
        if (vnode.events[key] == null)
          vnode.dom.addEventListener(key.slice(2), vnode.events, false);
        vnode.events[key] = value;
      } else {
        if (vnode.events[key] != null)
          vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
        vnode.events[key] = undefined;
      }
    } else if (value != null && (typeof value === "function" || typeof value === "object")) {
      vnode.events = new EventDict;
      vnode.dom.addEventListener(key.slice(2), vnode.events, false);
      vnode.events[key] = value;
    }
  }
  function initLifecycle(source, vnode, hooks, isHydrating = false) {
    if (typeof source.oninit === "function") {
      const context = {
        isSSR: false,
        isHydrating
      };
      const result = callHook.call(source.oninit, vnode, context);
      if (result != null && typeof result.then === "function" && currentRedraw != null) {
        Promise.resolve(result).then(function() {
          if (currentRedraw != null) {
            (0, currentRedraw)();
          }
        });
      }
    }
    if (typeof source.oncreate === "function")
      hooks.push(callHook.bind(source.oncreate, vnode));
  }
  function updateLifecycle(source, vnode, hooks) {
    if (typeof source.onupdate === "function")
      hooks.push(callHook.bind(source.onupdate, vnode));
  }
  function shouldNotUpdate(vnode, old) {
    do {
      if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
        const force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
        if (force !== undefined && !force)
          break;
      }
      if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
        const force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
        if (force !== undefined && !force)
          break;
      }
      return false;
    } while (false);
    vnode.dom = old.dom;
    vnode.domSize = old.domSize;
    vnode.instance = old.instance;
    vnode.attrs = old.attrs;
    vnode.children = old.children;
    vnode.text = old.text;
    return true;
  }
  let currentDOM = null;
  return function(dom, vnodes, redraw) {
    if (!dom)
      throw new TypeError("DOM element being rendered to does not exist.");
    if (currentDOM != null && dom.contains(currentDOM)) {
      throw new TypeError("Node is currently being rendered to and thus is locked.");
    }
    const prevRedraw = currentRedraw;
    const prevDOM = currentDOM;
    const hooks = [];
    const active = activeElement(dom);
    const namespace = dom.namespaceURI;
    currentDOM = dom;
    currentRedraw = typeof redraw === "function" ? redraw : undefined;
    currentRender = {};
    resetHydrationErrorCount();
    hydrationMismatchCount = 0;
    try {
      let isHydrating = dom.vnodes == null && dom.nodeType === 1 && "children" in dom && dom.children.length > 0;
      if (!isHydrating && dom.vnodes == null)
        dom.textContent = "";
      const normalized = vnode_default.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
      updateNodes(dom, dom.vnodes, normalized, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace, isHydrating);
      if (isHydrating && hydrationMismatchCount > MAX_HYDRATION_MISMATCHES) {
        logger.warn(`Hydration mismatch threshold exceeded. Clearing parent and re-rendering from client VDOM.`, {
          mismatchCount: hydrationMismatchCount,
          threshold: MAX_HYDRATION_MISMATCHES
        });
        dom.textContent = "";
        hydrationMismatchCount = 0;
        dom.vnodes = null;
        const overrideHooks = [];
        updateNodes(dom, null, normalized, overrideHooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace, false);
        for (let i = 0;i < overrideHooks.length; i++)
          overrideHooks[i]();
      }
      dom.vnodes = normalized;
      if (active != null && activeElement(dom) !== active && typeof active.focus === "function")
        active.focus();
      for (let i = 0;i < hooks.length; i++)
        hooks[i]();
    } finally {
      currentRedraw = prevRedraw;
      currentDOM = prevDOM;
    }
  };
}

// ../../util/next_tick.ts
async function next_tick() {
  if (typeof globalThis !== "undefined" && globalThis.__SSR_MODE__) {
    return Promise.resolve();
  }
  if (typeof queueMicrotask !== "undefined") {
    return new Promise((resolve) => {
      queueMicrotask(resolve);
    });
  }
  if (typeof Promise !== "undefined" && Promise.resolve) {
    return Promise.resolve();
  }
  if (typeof setTimeout !== "undefined") {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
  return Promise.resolve();
}
var next_tick_default = next_tick;

// ../../state.ts
var arrayParentSignalMap = new WeakMap;
var globalStateRegistry = new Map;

// ../../store.ts
var DEFAULT_LOOKUP_VERIFY_INTERVAL = 1000 * 10;
var DEFAULT_LOOKUP_TTL = 1000 * 60 * 60 * 24;

// ../../index.ts
var mountRedrawInstance = mountRedrawFactory(renderFactory(), typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame.bind(window) : setTimeout, console);
var router2 = router(typeof window !== "undefined" ? window : null, mountRedrawInstance);
var m = function m2() {
  return hyperscript_default.apply(this, arguments);
};
m.m = hyperscript_default;
m.trust = hyperscript_default.trust;
m.fragment = hyperscript_default.fragment;
m.Fragment = "[";
m.mount = mountRedrawInstance.mount;
m.route = router2;
m.render = renderFactory();
m.redraw = mountRedrawInstance.redraw;
m.parseQueryString = parseQueryString;
m.buildQueryString = buildQueryString;
m.parsePathname = parsePathname;
m.buildPathname = buildPathname;
m.vnode = vnode_default;
m.censor = censor;
m.next_tick = next_tick_default;
m.domFor = domFor_default;
setSignalRedrawCallback((sig) => {
  const components = getSignalComponents(sig);
  if (components) {
    components.forEach((component) => {
      m.redraw(component);
    });
  }
});
var mithril_default = m;

// components/layout.tsx
class Layout extends MithrilTsxComponent {
  view(vnode) {
    const { page, navGuides = "", navMethods = "", version = "2.3.8" } = vnode.attrs;
    const currentPath = vnode.attrs.routePath || (typeof window !== "undefined" ? mithril_default.route.get() : null) || "/";
    const isApiPage = currentPath.startsWith("/api") || currentPath.includes("hyperscript") || currentPath.includes("render") || currentPath.includes("mount") || currentPath.includes("route") || currentPath.includes("request") || currentPath.includes("parseQueryString") || currentPath.includes("buildQueryString") || currentPath.includes("buildPathname") || currentPath.includes("parsePathname") || currentPath.includes("trust") || currentPath.includes("fragment") || currentPath.includes("redraw") || currentPath.includes("censor") || currentPath.includes("stream");
    const navContent = isApiPage ? navMethods : navGuides;
    return /* @__PURE__ */ mithril_default(mithril_default.fragment, null, /* @__PURE__ */ mithril_default("header", null, /* @__PURE__ */ mithril_default("section", null, /* @__PURE__ */ mithril_default("a", {
      class: "hamburger",
      href: "javascript:;"
    }, "≡"), /* @__PURE__ */ mithril_default("h1", null, /* @__PURE__ */ mithril_default("img", {
      src: "/logo.svg",
      alt: "Mithril"
    }), "Mithril ", /* @__PURE__ */ mithril_default("span", {
      class: "version"
    }, "v", version)), /* @__PURE__ */ mithril_default("nav", null, /* @__PURE__ */ mithril_default(mithril_default.route.Link, {
      href: "/",
      selector: "a"
    }, "Guide"), /* @__PURE__ */ mithril_default(mithril_default.route.Link, {
      href: "/api.html",
      selector: "a"
    }, "API"), /* @__PURE__ */ mithril_default("a", {
      href: "https://mithril.zulipchat.com/"
    }, "Chat"), /* @__PURE__ */ mithril_default("a", {
      href: "https://github.com/MithrilJS/mithril.js"
    }, "GitHub")), navContent ? mithril_default.trust(navContent) : null)), /* @__PURE__ */ mithril_default("main", null, /* @__PURE__ */ mithril_default("div", {
      class: "body"
    }, /* @__PURE__ */ mithril_default("div", {
      innerHTML: page.content
    }), /* @__PURE__ */ mithril_default("div", {
      class: "footer"
    }, /* @__PURE__ */ mithril_default("div", null, "License: MIT. © Mithril Contributors."), /* @__PURE__ */ mithril_default("div", null, /* @__PURE__ */ mithril_default("a", {
      href: `https://github.com/MithrilJS/docs/edit/main/docs/${currentPath.replace(".html", ".md").replace(/^\//, "")}`
    }, "Edit"))))));
  }
  oncreate(vnode) {
    const hamburger = document.querySelector(".hamburger");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        document.body.className = document.body.className === "navigating" ? "" : "navigating";
      });
    }
    const navList = document.querySelector("h1 + ul");
    if (navList) {
      navList.addEventListener("click", () => {
        document.body.className = "";
      });
    }
  }
}

// components/doc-page.tsx
class DocPageComponent extends MithrilTsxComponent {
  view(vnode) {
    return mithril_default(Layout, {
      page: vnode.attrs.page,
      routePath: vnode.attrs.routePath,
      navGuides: vnode.attrs.navGuides,
      navMethods: vnode.attrs.navMethods,
      version: vnode.attrs.version
    });
  }
}

// node_modules/marked/lib/marked.esm.js
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
var escapeTest = /[&<>"']/;
var escapeReplace = new RegExp(escapeTest.source, "g");
var escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
var escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape$1(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html;
}
var caret = /(^|[^\[])\^/g;
function edit(regex, opt) {
  let source = typeof regex === "string" ? regex : regex.source;
  opt = opt || "";
  const obj = {
    replace: (name, val) => {
      let valSource = typeof val === "string" ? val : val.source;
      valSource = valSource.replace(caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(/%25/g, "%");
  } catch {
    return null;
  }
  return href;
}
var noopTest = { exec: () => null };
function splitCells(tableRow, count) {
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\")
      escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(/ \|/);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells[cells.length - 1].trim()) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count)
        cells.push("");
    }
  }
  for (;i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(/\\\|/g, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0;i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}
function outputLink(cap, link, raw, lexer) {
  const href = link.href;
  const title = link.title ? escape$1(link.title) : null;
  const text = cap[1].replace(/\\([\[\]])/g, "$1");
  if (cap[0].charAt(0) !== "!") {
    lexer.state.inLink = true;
    const token = {
      type: "link",
      raw,
      href,
      title,
      text,
      tokens: lexer.inlineTokens(text)
    };
    lexer.state.inLink = false;
    return token;
  }
  return {
    type: "image",
    raw,
    href,
    title,
    text: escape$1(text)
  };
}
function indentCodeCompensation(raw, text) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split(`
`).map((node) => {
    const matchIndentInNode = node.match(/^\s+/);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join(`
`);
}

class _Tokenizer {
  options;
  rules;
  lexer;
  constructor(options) {
    this.options = options || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(/^(?: {1,4}| {0,3}\t)/gm, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, `
`) : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "");
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (/#$/.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || / $/.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], `
`)
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines = rtrim(cap[0], `
`).split(`
`);
      let raw = "";
      let text = "";
      const tokens = [];
      while (lines.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i;
        for (i = 0;i < lines.length; i++) {
          if (/^ {0,3}>/.test(lines[i])) {
            currentLines.push(lines[i]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines[i]);
          } else {
            break;
          }
        }
        lines = lines.slice(i);
        const currentRaw = currentLines.join(`
`);
        const currentText = currentRaw.replace(/\n {0,3}((?:=+|-+) *)(?=\n|$)/g, `
    $1`).replace(/^ {0,3}>[ \t]?/gm, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text = text ? `${text}
${currentText}` : currentText;
        const top = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens, true);
        this.lexer.state.top = top;
        if (lines.length === 0) {
          break;
        }
        const lastToken = tokens[tokens.length - 1];
        if (lastToken?.type === "code") {
          break;
        } else if (lastToken?.type === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + `
` + lines.join(`
`);
          const newToken = this.blockquote(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
          break;
        } else if (lastToken?.type === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + `
` + lines.join(`
`);
          const newToken = this.list(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
          lines = newText.substring(tokens[tokens.length - 1].raw.length).split(`
`);
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split(`
`, 1)[0].replace(/^\t+/, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split(`
`, 1)[0];
        let blankLine = !line.trim();
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else if (blankLine) {
          indent = cap[1].length + 1;
        } else {
          indent = cap[2].search(/[^ ]/);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        if (blankLine && /^[ \t]*$/.test(nextLine)) {
          raw += nextLine + `
`;
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`);
          const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
          const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
          const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
          const htmlBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, "i");
          while (src) {
            const rawLine = src.split(`
`, 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(/\t/g, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(/[^ ]/) >= indent || !nextLine.trim()) {
              itemContents += `
` + nextLineWithoutTabs.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.replace(/\t/g, "    ").search(/[^ ]/) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += `
` + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + `
`;
            src = src.substring(rawLine.length + 1);
            line = nextLineWithoutTabs.slice(indent);
          }
        }
        if (!list.loose) {
          if (endsWithBlankLine) {
            list.loose = true;
          } else if (/\n[ \t]*\n[ \t]*$/.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = /^\[[ xX]\] /.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
          }
        }
        list.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list.raw += raw;
      }
      list.items[list.items.length - 1].raw = list.items[list.items.length - 1].raw.trimEnd();
      list.items[list.items.length - 1].text = list.items[list.items.length - 1].text.trimEnd();
      list.raw = list.raw.trimEnd();
      for (let i = 0;i < list.items.length; i++) {
        this.lexer.state.top = false;
        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
        if (!list.loose) {
          const spacers = list.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => /\n.*\n/.test(t.raw));
          list.loose = hasMultipleLineBreaks;
        }
      }
      if (list.loose) {
        for (let i = 0;i < list.items.length; i++) {
          list.items[i].loose = true;
        }
      }
      return list;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
      const href = cap[2] ? cap[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!/[:|]/.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(/^\||\| *$/g, "").split("|");
    const rows = cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, "").split(`
`) : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (/^ *-+: *$/.test(align)) {
        item.align.push("right");
      } else if (/^ *:-+: *$/.test(align)) {
        item.align.push("center");
      } else if (/^ *:-+ *$/.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i = 0;i < headers.length; i++) {
      item.header.push({
        text: headers[i],
        tokens: this.lexer.inline(headers[i]),
        header: true,
        align: item.align[i]
      });
    }
    for (const row of rows) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === `
` ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: escape$1(cap[1])
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && /^</.test(trimmedUrl)) {
        if (!/>$/.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
        if (link) {
          href = link[1];
          title = link[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (/^</.test(href)) {
        if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title ? title.replace(this.rules.inline.anyPunctuation, "$1") : title
      }, cap[0], this.lexer);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(/\s+/g, " ");
      const link = links[linkString.toLowerCase()];
      if (!link) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link, cap[0], this.lexer);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrongLDelim.exec(src);
    if (!match)
      return;
    if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
      return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim)
          continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0)
          continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [...match[0]][0].length;
        const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(/\n/g, " ");
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape$1(text, true);
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = escape$1(cap[1]);
        href = "mailto:" + text;
      } else {
        text = escape$1(cap[1]);
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = escape$1(cap[0]);
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? "";
        } while (prevCapZero !== cap[0]);
        text = escape$1(cap[0]);
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      let text;
      if (this.lexer.state.inRawBlock) {
        text = cap[0];
      } else {
        text = escape$1(cap[0]);
      }
      return {
        type: "text",
        raw: cap[0],
        text
      };
    }
  }
}
var newline = /^(?:[ \t]*(?:\n|$))+/;
var blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var bullet = /(?:[*+-]|\d{1,9}[.)])/;
var lheading = edit(/^(?!bull |blockCode|fences|blockquote|heading|html)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html))+?)\n {0,3}(=+|-+) *(?:\n+|$)/).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).getRegex();
var _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var blockText = /^[^\n]+/;
var _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
var def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
var _tag = "address|article|aside|base|basefont|blockquote|body|caption" + "|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption" + "|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe" + "|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option" + "|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title" + "|tr|track|ul";
var _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var html = edit("^ {0,3}(?:" + "<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)" + "|comment[^\\n]*(\\n+|$)" + "|<\\?[\\s\\S]*?(?:\\?>\\n*|$)" + "|<![A-Z][\\s\\S]*?(?:>\\n*|$)" + "|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)" + "|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)" + "|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)" + "|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)" + ")", "i").replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
var blockNormal = {
  blockquote,
  code: blockCode,
  def,
  fences,
  heading,
  hr,
  html,
  lheading,
  list,
  newline,
  paragraph,
  table: noopTest,
  text: blockText
};
var gfmTable = edit("^ *([^\\n ].*)\\n" + " {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)" + "(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockGfm = {
  ...blockNormal,
  table: gfmTable,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
};
var blockPedantic = {
  ...blockNormal,
  html: edit("^ *(?:comment *(?:\\n|\\s*$)" + "|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)" + `|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", _comment).replace(/tag/g, "(?!(?:" + "a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub" + "|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)" + "\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
};
var escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var br = /^( {2,}|\\)\n(?!\s*$)/;
var inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _punctuation = "\\p{P}\\p{S}";
var punctuation = edit(/^((?![*_])[\spunctuation])/, "u").replace(/punctuation/g, _punctuation).getRegex();
var blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
var emStrongLDelim = edit(/^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/, "u").replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimAst = edit("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)" + "|[^*]+(?=[^*])" + "|(?!\\*)[punct](\\*+)(?=[\\s]|$)" + "|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)" + "|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])" + "|[\\s](\\*+)(?!\\*)(?=[punct])" + "|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])" + "|[^punct\\s](\\*+)(?=[^punct\\s])", "gu").replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimUnd = edit("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)" + "|[^_]+(?=[^_])" + "|(?!_)[punct](_+)(?=[\\s]|$)" + "|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)" + "|(?!_)[punct\\s](_+)(?=[^punct\\s])" + "|[\\s](_+)(?!_)(?=[punct])" + "|(?!_)[punct](_+)(?!_)(?=[punct])", "gu").replace(/punct/g, _punctuation).getRegex();
var anyPunctuation = edit(/\\([punct])/, "gu").replace(/punct/g, _punctuation).getRegex();
var autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
var tag = edit("^comment" + "|^</[a-zA-Z][\\w:-]*\\s*>" + "|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>" + "|^<\\?[\\s\\S]*?\\?>" + "|^<![a-zA-Z]+\\s[\\s\\S]*?>" + "|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
var link = edit(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
var nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
var reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
var inlineNormal = {
  _backpedal: noopTest,
  anyPunctuation,
  autolink,
  blockSkip,
  br,
  code: inlineCode,
  del: noopTest,
  emStrongLDelim,
  emStrongRDelimAst,
  emStrongRDelimUnd,
  escape,
  link,
  nolink,
  punctuation,
  reflink,
  reflinkSearch,
  tag,
  text: inlineText,
  url: noopTest
};
var inlinePedantic = {
  ...inlineNormal,
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
};
var inlineGfm = {
  ...inlineNormal,
  escape: edit(escape).replace("])", "~|])").getRegex(),
  url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
var inlineBreaks = {
  ...inlineGfm,
  br: edit(br).replace("{2,}", "*").getRegex(),
  text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var block = {
  normal: blockNormal,
  gfm: blockGfm,
  pedantic: blockPedantic
};
var inline = {
  normal: inlineNormal,
  gfm: inlineGfm,
  breaks: inlineBreaks,
  pedantic: inlinePedantic
};

class _Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options) {
    this.tokens = [];
    this.tokens.links = Object.create(null);
    this.options = options || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer;
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  static get rules() {
    return {
      block,
      inline
    };
  }
  static lex(src, options) {
    const lexer = new _Lexer(options);
    return lexer.lex(src);
  }
  static lexInline(src, options) {
    const lexer = new _Lexer(options);
    return lexer.inlineTokens(src);
  }
  lex(src) {
    src = src.replace(/\r\n|\r/g, `
`);
    this.blockTokens(src, this.tokens);
    for (let i = 0;i < this.inlineQueue.length; i++) {
      const next = this.inlineQueue[i];
      this.inlineTokens(next.src, next.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens = [], lastParagraphClipped = false) {
    if (this.options.pedantic) {
      src = src.replace(/\t/g, "    ").replace(/^ +$/gm, "");
    }
    let token;
    let lastToken;
    let cutSrc;
    while (src) {
      if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        if (token.raw.length === 1 && tokens.length > 0) {
          tokens[tokens.length - 1].raw += `
`;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.text;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.raw;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        lastToken = tokens[tokens.length - 1];
        if (lastParagraphClipped && lastToken?.type === "paragraph") {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += `
` + token.raw;
          lastToken.text += `
` + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  inlineTokens(src, tokens = []) {
    let token, lastToken, cutSrc;
    let maskedSrc = src;
    let match;
    let keepPrevChar, prevChar;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
}

class _Renderer {
  options;
  parser;
  constructor(options) {
    this.options = options || _defaults;
  }
  space(token) {
    return "";
  }
  code({ text, lang, escaped }) {
    const langString = (lang || "").match(/^\S*/)?.[0];
    const code = text.replace(/\n$/, "") + `
`;
    if (!langString) {
      return "<pre><code>" + (escaped ? code : escape$1(code, true)) + `</code></pre>
`;
    }
    return '<pre><code class="language-' + escape$1(langString) + '">' + (escaped ? code : escape$1(code, true)) + `</code></pre>
`;
  }
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text }) {
    return text;
  }
  heading({ tokens, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>
`;
  }
  hr(token) {
    return `<hr>
`;
  }
  list(token) {
    const ordered = token.ordered;
    const start = token.start;
    let body = "";
    for (let j = 0;j < token.items.length; j++) {
      const item = token.items[j];
      body += this.listitem(item);
    }
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startAttr + `>
` + body + "</" + type + `>
`;
  }
  listitem(item) {
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " "
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>
`;
  }
  table(token) {
    let header = "";
    let cell = "";
    for (let j = 0;j < token.header.length; j++) {
      cell += this.tablecell(token.header[j]);
    }
    header += this.tablerow({ text: cell });
    let body = "";
    for (let j = 0;j < token.rows.length; j++) {
      const row = token.rows[j];
      cell = "";
      for (let k = 0;k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }
      body += this.tablerow({ text: cell });
    }
    if (body)
      body = `<tbody>${body}</tbody>`;
    return `<table>
` + `<thead>
` + header + `</thead>
` + body + `</table>
`;
  }
  tablerow({ text }) {
    return `<tr>
${text}</tr>
`;
  }
  tablecell(token) {
    const content = this.parser.parseInline(token.tokens);
    const type = token.header ? "th" : "td";
    const tag2 = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
    return tag2 + content + `</${type}>
`;
  }
  strong({ tokens }) {
    return `<strong>${this.parser.parseInline(tokens)}</strong>`;
  }
  em({ tokens }) {
    return `<em>${this.parser.parseInline(tokens)}</em>`;
  }
  codespan({ text }) {
    return `<code>${text}</code>`;
  }
  br(token) {
    return "<br>";
  }
  del({ tokens }) {
    return `<del>${this.parser.parseInline(tokens)}</del>`;
  }
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image({ href, title, text }) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += ">";
    return out;
  }
  text(token) {
    return "tokens" in token && token.tokens ? this.parser.parseInline(token.tokens) : token.text;
  }
}

class _TextRenderer {
  strong({ text }) {
    return text;
  }
  em({ text }) {
    return text;
  }
  codespan({ text }) {
    return text;
  }
  del({ text }) {
    return text;
  }
  html({ text }) {
    return text;
  }
  text({ text }) {
    return text;
  }
  link({ text }) {
    return "" + text;
  }
  image({ text }) {
    return "" + text;
  }
  br() {
    return "";
  }
}

class _Parser {
  options;
  renderer;
  textRenderer;
  constructor(options) {
    this.options = options || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer;
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer;
  }
  static parse(tokens, options) {
    const parser = new _Parser(options);
    return parser.parse(tokens);
  }
  static parseInline(tokens, options) {
    const parser = new _Parser(options);
    return parser.parseInline(tokens);
  }
  parse(tokens, top = true) {
    let out = "";
    for (let i = 0;i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "space": {
          out += this.renderer.space(token);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token);
          continue;
        }
        case "code": {
          out += this.renderer.code(token);
          continue;
        }
        case "table": {
          out += this.renderer.table(token);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token);
          continue;
        }
        case "list": {
          out += this.renderer.list(token);
          continue;
        }
        case "html": {
          out += this.renderer.html(token);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token);
          continue;
        }
        case "text": {
          let textToken = token;
          let body = this.renderer.text(textToken);
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += `
` + this.renderer.text(textToken);
          }
          if (top) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [{ type: "text", raw: body, text: body }]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = "";
    for (let i = 0;i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "escape": {
          out += renderer.text(token);
          break;
        }
        case "html": {
          out += renderer.html(token);
          break;
        }
        case "link": {
          out += renderer.link(token);
          break;
        }
        case "image": {
          out += renderer.image(token);
          break;
        }
        case "strong": {
          out += renderer.strong(token);
          break;
        }
        case "em": {
          out += renderer.em(token);
          break;
        }
        case "codespan": {
          out += renderer.codespan(token);
          break;
        }
        case "br": {
          out += renderer.br(token);
          break;
        }
        case "del": {
          out += renderer.del(token);
          break;
        }
        case "text": {
          out += renderer.text(token);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
}

class _Hooks {
  options;
  block;
  constructor(options) {
    this.options = options || _defaults;
  }
  static passThroughHooks = new Set([
    "preprocess",
    "postprocess",
    "processAllTokens"
  ]);
  preprocess(markdown) {
    return markdown;
  }
  postprocess(html2) {
    return html2;
  }
  processAllTokens(tokens) {
    return tokens;
  }
  provideLexer() {
    return this.block ? _Lexer.lex : _Lexer.lexInline;
  }
  provideParser() {
    return this.block ? _Parser.parse : _Parser.parseInline;
  }
}

class Marked {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = _Parser;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  walkTokens(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens2 = genericToken[childTokens].flat(Infinity);
              values = values.concat(this.walkTokens(tokens2, callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          if (!(prop in renderer)) {
            throw new Error(`renderer '${prop}' does not exist`);
          }
          if (["options", "parser"].includes(prop)) {
            continue;
          }
          const rendererProp = prop;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer[rendererProp];
          renderer[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          if (!(prop in tokenizer)) {
            throw new Error(`tokenizer '${prop}' does not exist`);
          }
          if (["options", "rules", "lexer"].includes(prop)) {
            continue;
          }
          const tokenizerProp = prop;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks;
        for (const prop in pack.hooks) {
          if (!(prop in hooks)) {
            throw new Error(`hook '${prop}' does not exist`);
          }
          if (["options", "block"].includes(prop)) {
            continue;
          }
          const hooksProp = prop;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(packWalktokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  lexer(src, options) {
    return _Lexer.lex(src, options ?? this.defaults);
  }
  parser(tokens, options) {
    return _Parser.parse(tokens, options ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse = (src, options) => {
      const origOpt = { ...options };
      const opt = { ...this.defaults, ...origOpt };
      const throwError = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer(src2, opt)).then((tokens) => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens = lexer(src, opt);
        if (opt.hooks) {
          tokens = opt.hooks.processAllTokens(tokens);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e) {
        return throwError(e);
      }
    };
    return parse;
  }
  onError(silent, async) {
    return (e) => {
      e.message += `
Please report this to https://github.com/markedjs/marked.`;
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape$1(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      throw e;
    };
  }
}
var markedInstance = new Marked;
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options) {
  markedInstance.setOptions(options);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

// markdown.ts
var {readFile} = (() => ({}));

// node:path
function assertPath(path) {
  if (typeof path !== "string")
    throw TypeError("Path must be a string. Received " + JSON.stringify(path));
}
function normalizeStringPosix(path, allowAboveRoot) {
  var res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, code;
  for (var i = 0;i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47)
      break;
    else
      code = 47;
    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1)
        ;
      else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1)
                res = "", lastSegmentLength = 0;
              else
                res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              lastSlash = i, dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "", lastSegmentLength = 0, lastSlash = i, dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += "/..";
          else
            res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += "/" + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i, dots = 0;
    } else if (code === 46 && dots !== -1)
      ++dots;
    else
      dots = -1;
  }
  return res;
}
function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root, base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir)
    return base;
  if (dir === pathObject.root)
    return dir + base;
  return dir + sep + base;
}
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false, cwd;
  for (var i = arguments.length - 1;i >= -1 && !resolvedAbsolute; i--) {
    var path;
    if (i >= 0)
      path = arguments[i];
    else {
      if (cwd === undefined)
        cwd = process.cwd();
      path = cwd;
    }
    if (assertPath(path), path.length === 0)
      continue;
    resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = path.charCodeAt(0) === 47;
  }
  if (resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute), resolvedAbsolute)
    if (resolvedPath.length > 0)
      return "/" + resolvedPath;
    else
      return "/";
  else if (resolvedPath.length > 0)
    return resolvedPath;
  else
    return ".";
}
function normalize2(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var isAbsolute = path.charCodeAt(0) === 47, trailingSeparator = path.charCodeAt(path.length - 1) === 47;
  if (path = normalizeStringPosix(path, !isAbsolute), path.length === 0 && !isAbsolute)
    path = ".";
  if (path.length > 0 && trailingSeparator)
    path += "/";
  if (isAbsolute)
    return "/" + path;
  return path;
}
function isAbsolute(path) {
  return assertPath(path), path.length > 0 && path.charCodeAt(0) === 47;
}
function join() {
  if (arguments.length === 0)
    return ".";
  var joined;
  for (var i = 0;i < arguments.length; ++i) {
    var arg = arguments[i];
    if (assertPath(arg), arg.length > 0)
      if (joined === undefined)
        joined = arg;
      else
        joined += "/" + arg;
  }
  if (joined === undefined)
    return ".";
  return normalize2(joined);
}
function relative(from, to) {
  if (assertPath(from), assertPath(to), from === to)
    return "";
  if (from = resolve(from), to = resolve(to), from === to)
    return "";
  var fromStart = 1;
  for (;fromStart < from.length; ++fromStart)
    if (from.charCodeAt(fromStart) !== 47)
      break;
  var fromEnd = from.length, fromLen = fromEnd - fromStart, toStart = 1;
  for (;toStart < to.length; ++toStart)
    if (to.charCodeAt(toStart) !== 47)
      break;
  var toEnd = to.length, toLen = toEnd - toStart, length = fromLen < toLen ? fromLen : toLen, lastCommonSep = -1, i = 0;
  for (;i <= length; ++i) {
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === 47)
          return to.slice(toStart + i + 1);
        else if (i === 0)
          return to.slice(toStart + i);
      } else if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === 47)
          lastCommonSep = i;
        else if (i === 0)
          lastCommonSep = 0;
      }
      break;
    }
    var fromCode = from.charCodeAt(fromStart + i), toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode)
      break;
    else if (fromCode === 47)
      lastCommonSep = i;
  }
  var out = "";
  for (i = fromStart + lastCommonSep + 1;i <= fromEnd; ++i)
    if (i === fromEnd || from.charCodeAt(i) === 47)
      if (out.length === 0)
        out += "..";
      else
        out += "/..";
  if (out.length > 0)
    return out + to.slice(toStart + lastCommonSep);
  else {
    if (toStart += lastCommonSep, to.charCodeAt(toStart) === 47)
      ++toStart;
    return to.slice(toStart);
  }
}
function _makeLong(path) {
  return path;
}
function dirname(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var code = path.charCodeAt(0), hasRoot = code === 47, end = -1, matchedSlash = true;
  for (var i = path.length - 1;i >= 1; --i)
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else
      matchedSlash = false;
  if (end === -1)
    return hasRoot ? "/" : ".";
  if (hasRoot && end === 1)
    return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  if (ext !== undefined && typeof ext !== "string")
    throw TypeError('"ext" argument must be a string');
  assertPath(path);
  var start = 0, end = -1, matchedSlash = true, i;
  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
    if (ext.length === path.length && ext === path)
      return "";
    var extIdx = ext.length - 1, firstNonSlashEnd = -1;
    for (i = path.length - 1;i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1)
          matchedSlash = false, firstNonSlashEnd = i + 1;
        if (extIdx >= 0)
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1)
              end = i;
          } else
            extIdx = -1, end = firstNonSlashEnd;
      }
    }
    if (start === end)
      end = firstNonSlashEnd;
    else if (end === -1)
      end = path.length;
    return path.slice(start, end);
  } else {
    for (i = path.length - 1;i >= 0; --i)
      if (path.charCodeAt(i) === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1)
        matchedSlash = false, end = i + 1;
    if (end === -1)
      return "";
    return path.slice(start, end);
  }
}
function extname(path) {
  assertPath(path);
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, preDotState = 0;
  for (var i = path.length - 1;i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    return "";
  return path.slice(startDot, end);
}
function format(pathObject) {
  if (pathObject === null || typeof pathObject !== "object")
    throw TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
  return _format("/", pathObject);
}
function parse(path) {
  assertPath(path);
  var ret = { root: "", dir: "", base: "", ext: "", name: "" };
  if (path.length === 0)
    return ret;
  var code = path.charCodeAt(0), isAbsolute2 = code === 47, start;
  if (isAbsolute2)
    ret.root = "/", start = 1;
  else
    start = 0;
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, i = path.length - 1, preDotState = 0;
  for (;i >= start; --i) {
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1)
      if (startPart === 0 && isAbsolute2)
        ret.base = ret.name = path.slice(1, end);
      else
        ret.base = ret.name = path.slice(startPart, end);
  } else {
    if (startPart === 0 && isAbsolute2)
      ret.name = path.slice(1, startDot), ret.base = path.slice(1, end);
    else
      ret.name = path.slice(startPart, startDot), ret.base = path.slice(startPart, end);
    ret.ext = path.slice(startDot, end);
  }
  if (startPart > 0)
    ret.dir = path.slice(0, startPart - 1);
  else if (isAbsolute2)
    ret.dir = "/";
  return ret;
}
var sep = "/";
var delimiter = ":";
var posix = ((p) => (p.posix = p, p))({ resolve, normalize: normalize2, isAbsolute, join, relative, _makeLong, dirname, basename, extname, format, parse, sep, delimiter, win32: null, posix: null });

// markdown.ts
marked.setOptions({
  gfm: true,
  breaks: false
});
var metaDescriptionRegex = /<!--meta-description\n([\s\S]+?)\n-->/m;
function extractMetaDescription(markdown, defaultDesc = "Mithril.js Documentation") {
  const match = markdown.match(metaDescriptionRegex);
  return match ? match[1].trim() : defaultDesc;
}
function extractTitle(markdown) {
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1] : "Mithril.js";
}
async function loadMarkdownFile(filePath) {
  const markdown = await readFile(filePath, "utf-8");
  const html2 = marked.parse(markdown);
  const title = extractTitle(markdown);
  const metaDescription = extractMetaDescription(markdown);
  return {
    title,
    content: html2,
    metaDescription
  };
}
async function loadMarkdownFromDocs(docName) {
  try {
    const docsPath = join(import.meta.dir, "../../../../docs/docs", `${docName}.md`);
    return await loadMarkdownFile(docsPath);
  } catch {
    return null;
  }
}

// nav.ts
var {readFile: readFile2} = (() => ({}));
async function getNavGuides() {
  try {
    const navPath = join(import.meta.dir, "../../../../docs/docs/nav-guides.md");
    const content = await readFile2(navPath, "utf-8");
    return marked.parse(content);
  } catch {
    return "";
  }
}
async function getNavMethods() {
  try {
    const navPath = join(import.meta.dir, "../../../../docs/docs/nav-methods.md");
    const content = await readFile2(navPath, "utf-8");
    return marked.parse(content);
  } catch {
    return "";
  }
}

// routes.ts
var routeMap = {
  "/": "index",
  "/installation.html": "installation",
  "/simple-application.html": "simple-application",
  "/learning-mithril.html": "learning-mithril",
  "/support.html": "support",
  "/jsx.html": "jsx",
  "/es6.html": "es6",
  "/animation.html": "animation",
  "/testing.html": "testing",
  "/examples.html": "examples",
  "/integrating-libs.html": "integrating-libs",
  "/paths.html": "paths",
  "/vnodes.html": "vnodes",
  "/components.html": "components",
  "/lifecycle-methods.html": "lifecycle-methods",
  "/keys.html": "keys",
  "/autoredraw.html": "autoredraw",
  "/contributing.html": "contributing",
  "/credits.html": "credits",
  "/code-of-conduct.html": "code-of-conduct",
  "/framework-comparison.html": "framework-comparison",
  "/archives.html": "archives",
  "/api.html": "api",
  "/hyperscript.html": "hyperscript",
  "/render.html": "render",
  "/mount.html": "mount",
  "/route.html": "route",
  "/request.html": "request",
  "/parseQueryString.html": "parseQueryString",
  "/buildQueryString.html": "buildQueryString",
  "/buildPathname.html": "buildPathname",
  "/parsePathname.html": "parsePathname",
  "/trust.html": "trust",
  "/fragment.html": "fragment",
  "/redraw.html": "redraw",
  "/censor.html": "censor",
  "/stream.html": "stream"
};
function createRoute(routePath, docName) {
  return {
    render: async (vnode) => {
      const actualRoutePath = vnode.attrs?.routePath || routePath;
      const [page, navGuides, navMethods] = await Promise.all([
        loadMarkdownFromDocs(docName),
        getNavGuides(),
        getNavMethods()
      ]);
      if (!page) {
        return mithril_default("div", [
          mithril_default("h1", "404 - Page Not Found"),
          mithril_default("p", `The page "${routePath}" could not be found.`)
        ]);
      }
      return mithril_default(DocPageComponent, {
        key: actualRoutePath,
        routePath: actualRoutePath,
        page,
        navGuides,
        navMethods
      });
    }
  };
}
function getRoutes() {
  const routes = {};
  for (const [path, docName] of Object.entries(routeMap)) {
    routes[path] = createRoute(path, docName);
  }
  return routes;
}

// client.tsx
var routes = getRoutes();
mithril_default.route(document.getElementById("app"), "/", routes);

//# debugId=8E3115C4E9D1596964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vdXRpbC9oYXNPd24udHMiLCAiLi4vLi4vLi4vcmVuZGVyL3Zub2RlLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9oeXBlcnNjcmlwdFZub2RlLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9lbXB0eUF0dHJzLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9jYWNoZWRBdHRyc0lzU3RhdGljTWFwLnRzIiwgIi4uLy4uLy4uL3JlbmRlci90cnVzdC50cyIsICIuLi8uLi8uLi9yZW5kZXIvZnJhZ21lbnQudHMiLCAiLi4vLi4vLi4vcmVuZGVyL2h5cGVyc2NyaXB0LnRzIiwgIi4uLy4uLy4uL3NzckNvbnRleHQudHMiLCAiLi4vLi4vLi4vc2lnbmFsLnRzIiwgIi4uLy4uLy4uL2FwaS9tb3VudC1yZWRyYXcudHMiLCAiLi4vLi4vLi4vdXRpbC9kZWNvZGVVUklDb21wb25lbnRTYWZlLnRzIiwgIi4uLy4uLy4uL3F1ZXJ5c3RyaW5nL2J1aWxkLnRzIiwgIi4uLy4uLy4uL3BhdGhuYW1lL2J1aWxkLnRzIiwgIi4uLy4uLy4uL3F1ZXJ5c3RyaW5nL3BhcnNlLnRzIiwgIi4uLy4uLy4uL3BhdGhuYW1lL3BhcnNlLnRzIiwgIi4uLy4uLy4uL3BhdGhuYW1lL2NvbXBpbGVUZW1wbGF0ZS50cyIsICIuLi8uLi8uLi91dGlsL2NlbnNvci50cyIsICIuLi8uLi8uLi91dGlsL3VyaS50cyIsICIuLi8uLi8uLi9zZXJ2ZXIvbG9nZ2VyLnRzIiwgIi4uLy4uLy4uL3NlcnZlci9zc3JMb2dnZXIudHMiLCAiLi4vLi4vLi4vYXBpL3JvdXRlci50cyIsICIuLi8uLi8uLi91dGlsL3Nzci50cyIsICIuLi8uLi8uLi9yZW5kZXIvZGVsYXllZFJlbW92YWwudHMiLCAiLi4vLi4vLi4vcmVuZGVyL2RvbUZvci50cyIsICIuLi8uLi8uLi9yZW5kZXIvcmVuZGVyLnRzIiwgIi4uLy4uLy4uL3V0aWwvbmV4dF90aWNrLnRzIiwgIi4uLy4uLy4uL3N0YXRlLnRzIiwgIi4uLy4uLy4uL3N0b3JlLnRzIiwgIi4uLy4uLy4uL2luZGV4LnRzIiwgIi4uL2NvbXBvbmVudHMvbGF5b3V0LnRzeCIsICIuLi9jb21wb25lbnRzL2RvYy1wYWdlLnRzeCIsICIuLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuZXNtLmpzIiwgIi4uL21hcmtkb3duLnRzIiwgIm5vZGU6cGF0aCIsICIuLi9uYXYudHMiLCAiLi4vcm91dGVzLnRzIiwgIi4uL2NsaWVudC50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLy8gVGhpcyBleGlzdHMgc28gSSdtIG9ubHkgc2F2aW5nIGl0IG9uY2UuXG5leHBvcnQgZGVmYXVsdCB7fS5oYXNPd25Qcm9wZXJ0eVxuIiwKICAgICIvLyBUeXBlIGRlZmluaXRpb25zIGZvciBNaXRocmlsIGNvbXBvbmVudHMgYW5kIHZub2Rlc1xuXG5leHBvcnQgaW50ZXJmYWNlIFZub2RlPEF0dHJzID0gUmVjb3JkPHN0cmluZywgYW55PiwgU3RhdGUgPSBhbnk+IHtcblx0dGFnOiBzdHJpbmcgfCBDb21wb25lbnQ8QXR0cnMsIFN0YXRlPiB8ICgoKSA9PiBDb21wb25lbnQ8QXR0cnMsIFN0YXRlPilcblx0a2V5Pzogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbFxuXHRhdHRycz86IEF0dHJzXG5cdGNoaWxkcmVuPzogQ2hpbGRyZW5cblx0dGV4dD86IHN0cmluZyB8IG51bWJlclxuXHRkb20/OiBOb2RlIHwgbnVsbFxuXHRpcz86IHN0cmluZ1xuXHRkb21TaXplPzogbnVtYmVyXG5cdHN0YXRlPzogU3RhdGVcblx0ZXZlbnRzPzogUmVjb3JkPHN0cmluZywgYW55PlxuXHRpbnN0YW5jZT86IGFueVxufVxuXG5leHBvcnQgdHlwZSBDaGlsZHJlbiA9IFZub2RlW10gfCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZFxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudDxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiB7XG5cdG9uaW5pdD86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gdm9pZFxuXHRvbmNyZWF0ZT86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gdm9pZFxuXHRvbmJlZm9yZXVwZGF0ZT86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPiwgb2xkOiBWbm9kZTxBdHRycywgU3RhdGU+KSA9PiBib29sZWFuIHwgdm9pZFxuXHRvbnVwZGF0ZT86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gdm9pZFxuXHRvbmJlZm9yZXJlbW92ZT86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gUHJvbWlzZTxhbnk+IHwgdm9pZFxuXHRvbnJlbW92ZT86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gdm9pZFxuXHR2aWV3OiAodm5vZGU6IFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IENoaWxkcmVuIHwgVm5vZGUgfCBudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RmFjdG9yeTxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiB7XG5cdCguLi5hcmdzOiBhbnlbXSk6IENvbXBvbmVudDxBdHRycywgU3RhdGU+XG5cdHZpZXc/OiAodm5vZGU6IFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IENoaWxkcmVuIHwgVm5vZGUgfCBudWxsXG59XG5cbmV4cG9ydCB0eXBlIENvbXBvbmVudFR5cGU8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4gPSBcblx0fCBDb21wb25lbnQ8QXR0cnMsIFN0YXRlPlxuXHR8IENvbXBvbmVudEZhY3Rvcnk8QXR0cnMsIFN0YXRlPlxuXHR8ICgoKSA9PiBDb21wb25lbnQ8QXR0cnMsIFN0YXRlPilcblx0fCAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gTWl0aHJpbFRzeENvbXBvbmVudDxBdHRycz4pXG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgVFNYL0pTWCBjbGFzcy1iYXNlZCBjb21wb25lbnRzXG4gKiBTaW1pbGFyIHRvIG1pdGhyaWwtdHN4LWNvbXBvbmVudCBwYWNrYWdlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNaXRocmlsVHN4Q29tcG9uZW50PEF0dHJzID0gUmVjb3JkPHN0cmluZywgYW55Pj4ge1xuXHRvbmluaXQ/KHZub2RlOiBWbm9kZTxBdHRycz4pOiB2b2lkXG5cdG9uY3JlYXRlPyh2bm9kZTogVm5vZGU8QXR0cnM+KTogdm9pZFxuXHRvbmJlZm9yZXVwZGF0ZT8odm5vZGU6IFZub2RlPEF0dHJzPiwgb2xkOiBWbm9kZTxBdHRycz4pOiBib29sZWFuIHwgdm9pZFxuXHRvbnVwZGF0ZT8odm5vZGU6IFZub2RlPEF0dHJzPik6IHZvaWRcblx0b25iZWZvcmVyZW1vdmU/KHZub2RlOiBWbm9kZTxBdHRycz4pOiBQcm9taXNlPGFueT4gfCB2b2lkXG5cdG9ucmVtb3ZlPyh2bm9kZTogVm5vZGU8QXR0cnM+KTogdm9pZFxuXHRhYnN0cmFjdCB2aWV3KHZub2RlOiBWbm9kZTxBdHRycz4pOiBDaGlsZHJlblxufVxuXG5mdW5jdGlvbiBWbm9kZSh0YWc6IGFueSwga2V5OiBzdHJpbmcgfCBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwgfCB1bmRlZmluZWQsIGNoaWxkcmVuOiBDaGlsZHJlbiB8IG51bGwgfCB1bmRlZmluZWQsIHRleHQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQsIGRvbTogTm9kZSB8IG51bGwgfCB1bmRlZmluZWQpOiBWbm9kZSB7XG5cdHJldHVybiB7dGFnOiB0YWcsIGtleToga2V5ID8/IHVuZGVmaW5lZCwgYXR0cnM6IGF0dHJzID8/IHVuZGVmaW5lZCwgY2hpbGRyZW46IGNoaWxkcmVuID8/IHVuZGVmaW5lZCwgdGV4dDogdGV4dCA/PyB1bmRlZmluZWQsIGRvbTogZG9tID8/IHVuZGVmaW5lZCwgaXM6IHVuZGVmaW5lZCwgZG9tU2l6ZTogdW5kZWZpbmVkLCBzdGF0ZTogdW5kZWZpbmVkLCBldmVudHM6IHVuZGVmaW5lZCwgaW5zdGFuY2U6IHVuZGVmaW5lZH1cbn1cbmNvbnN0IG5vcm1hbGl6ZSA9IGZ1bmN0aW9uKG5vZGU6IGFueSk6IFZub2RlIHwgbnVsbCB7XG5cdGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSByZXR1cm4gVm5vZGUoJ1snLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbm9ybWFsaXplQ2hpbGRyZW4obm9kZSkgYXMgQ2hpbGRyZW4sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxuXHRpZiAobm9kZSA9PSBudWxsIHx8IHR5cGVvZiBub2RlID09PSAnYm9vbGVhbicpIHJldHVybiBudWxsXG5cdGlmICh0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpIHJldHVybiBub2RlXG5cdHJldHVybiBWbm9kZSgnIycsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBTdHJpbmcobm9kZSksIHVuZGVmaW5lZCwgdW5kZWZpbmVkKVxufVxuXG5jb25zdCBub3JtYWxpemVDaGlsZHJlbiA9IGZ1bmN0aW9uKGlucHV0OiBhbnlbXSk6IChWbm9kZSB8IG51bGwpW10ge1xuXHQvLyBQcmVhbGxvY2F0ZSB0aGUgYXJyYXkgbGVuZ3RoIChpbml0aWFsbHkgaG9sZXkpIGFuZCBmaWxsIGV2ZXJ5IGluZGV4IGltbWVkaWF0ZWx5IGluIG9yZGVyLlxuXHQvLyBCZW5jaG1hcmtpbmcgc2hvd3MgYmV0dGVyIHBlcmZvcm1hbmNlIG9uIFY4LlxuXHRjb25zdCBjaGlsZHJlbiA9IG5ldyBBcnJheShpbnB1dC5sZW5ndGgpXG5cdC8vIENvdW50IHRoZSBudW1iZXIgb2Yga2V5ZWQgbm9ybWFsaXplZCB2bm9kZXMgZm9yIGNvbnNpc3RlbmN5IGNoZWNrLlxuXHQvLyBOb3RlOiB0aGlzIGlzIGEgcGVyZi1zZW5zaXRpdmUgY2hlY2suXG5cdC8vIEZ1biBmYWN0OiBtZXJnaW5nIHRoZSBsb29wIGxpa2UgdGhpcyBpcyBzb21laG93IGZhc3RlciB0aGFuIHNwbGl0dGluZ1xuXHQvLyB0aGUgY2hlY2sgd2l0aGluIHVwZGF0ZU5vZGVzKCksIG5vdGljZWFibHkgc28uXG5cdGxldCBudW1LZXllZCA9IDBcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuXHRcdGNoaWxkcmVuW2ldID0gbm9ybWFsaXplKGlucHV0W2ldKVxuXHRcdGlmIChjaGlsZHJlbltpXSAhPT0gbnVsbCAmJiBjaGlsZHJlbltpXSEua2V5ICE9IG51bGwpIG51bUtleWVkKytcblx0fVxuXHRpZiAobnVtS2V5ZWQgIT09IDAgJiYgbnVtS2V5ZWQgIT09IGlucHV0Lmxlbmd0aCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoY2hpbGRyZW4uaW5jbHVkZXMobnVsbClcblx0XHRcdD8gJ0luIGZyYWdtZW50cywgdm5vZGVzIG11c3QgZWl0aGVyIGFsbCBoYXZlIGtleXMgb3Igbm9uZSBoYXZlIGtleXMuIFlvdSBtYXkgd2lzaCB0byBjb25zaWRlciB1c2luZyBhbiBleHBsaWNpdCBrZXllZCBlbXB0eSBmcmFnbWVudCwgbS5mcmFnbWVudCh7a2V5OiAuLi59KSwgaW5zdGVhZCBvZiBhIGhvbGUuJ1xuXHRcdFx0OiAnSW4gZnJhZ21lbnRzLCB2bm9kZXMgbXVzdCBlaXRoZXIgYWxsIGhhdmUga2V5cyBvciBub25lIGhhdmUga2V5cy4nLFxuXHRcdClcblx0fVxuXHRyZXR1cm4gY2hpbGRyZW5cbn1cblxuOyhWbm9kZSBhcyBhbnkpLm5vcm1hbGl6ZSA9IG5vcm1hbGl6ZVxuOyhWbm9kZSBhcyBhbnkpLm5vcm1hbGl6ZUNoaWxkcmVuID0gbm9ybWFsaXplQ2hpbGRyZW5cblxuZXhwb3J0IGRlZmF1bHQgVm5vZGUgYXMgdHlwZW9mIFZub2RlICYge1xuXHRub3JtYWxpemU6IHR5cGVvZiBub3JtYWxpemVcblx0bm9ybWFsaXplQ2hpbGRyZW46IHR5cGVvZiBub3JtYWxpemVDaGlsZHJlblxufVxuIiwKICAgICJpbXBvcnQgVm5vZGUgZnJvbSAnLi92bm9kZSdcblxuLy8gTm90ZTogdGhlIHByb2Nlc3Npbmcgb2YgdmFyaWFkaWMgcGFyYW1ldGVycyBpcyBwZXJmLXNlbnNpdGl2ZS5cbi8vXG4vLyBJbiBuYXRpdmUgRVM2LCBpdCBtaWdodCBiZSBwcmVmZXJhYmxlIHRvIGRlZmluZSBoeXBlcnNjcmlwdCBhbmQgZnJhZ21lbnRcbi8vIGZhY3RvcmllcyB3aXRoIGEgZmluYWwgLi4uYXJncyBwYXJhbWV0ZXIgYW5kIGNhbGwgaHlwZXJzY3JpcHRWbm9kZSguLi5hcmdzKSxcbi8vIHNpbmNlIG1vZGVybiBlbmdpbmVzIGNhbiBvcHRpbWl6ZSBzcHJlYWQgY2FsbHMuXG4vL1xuLy8gSG93ZXZlciwgYmVuY2htYXJrcyBzaG93ZWQgdGhpcyB3YXMgbm90IGZhc3Rlci4gQXMgYSByZXN1bHQsIHNwcmVhZCBpcyB1c2VkXG4vLyBvbmx5IGluIHRoZSBwYXJhbWV0ZXIgbGlzdHMgb2YgaHlwZXJzY3JpcHQgYW5kIGZyYWdtZW50LCB3aGlsZSBhbiBhcnJheSBpc1xuLy8gcGFzc2VkIHRvIGh5cGVyc2NyaXB0Vm5vZGUuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoeXBlcnNjcmlwdFZub2RlKGF0dHJzOiBhbnksIGNoaWxkcmVuOiBhbnlbXSk6IGFueSB7XG5cdGlmIChhdHRycyA9PSBudWxsIHx8IHR5cGVvZiBhdHRycyA9PT0gJ29iamVjdCcgJiYgYXR0cnMudGFnID09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkoYXR0cnMpKSB7XG5cdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGNoaWxkcmVuWzBdKSkgY2hpbGRyZW4gPSBjaGlsZHJlblswXVxuXHR9IGVsc2Uge1xuXHRcdGNoaWxkcmVuID0gY2hpbGRyZW4ubGVuZ3RoID09PSAwICYmIEFycmF5LmlzQXJyYXkoYXR0cnMpID8gYXR0cnMgOiBbYXR0cnMsIC4uLmNoaWxkcmVuXVxuXHRcdGF0dHJzID0gdW5kZWZpbmVkXG5cdH1cblxuXHRyZXR1cm4gVm5vZGUoJycsIGF0dHJzICYmIGF0dHJzLmtleSwgYXR0cnMsIGNoaWxkcmVuLCBudWxsLCBudWxsKVxufVxuIiwKICAgICIvLyBUaGlzIGlzIGFuIGF0dHJzIG9iamVjdCB0aGF0IGlzIHVzZWQgYnkgZGVmYXVsdCB3aGVuIGF0dHJzIGlzIHVuZGVmaW5lZCBvciBudWxsLlxuZXhwb3J0IGRlZmF1bHQge31cbiIsCiAgICAiaW1wb3J0IGVtcHR5QXR0cnMgZnJvbSAnLi9lbXB0eUF0dHJzJ1xuXG4vLyBUaGlzIE1hcCBtYW5hZ2VzIHRoZSBmb2xsb3dpbmc6XG4vLyAtIFdoZXRoZXIgYW4gYXR0cnMgaXMgY2FjaGVkIGF0dHJzIGdlbmVyYXRlZCBieSBjb21waWxlU2VsZWN0b3IoKS5cbi8vIC0gV2hldGhlciB0aGUgY2FjaGVkIGF0dHJzIGlzIFwic3RhdGljXCIsIGkuZS4sIGRvZXMgbm90IGNvbnRhaW4gYW55IGZvcm0gYXR0cmlidXRlcy5cbi8vIFRoZXNlIGluZm9ybWF0aW9uIHdpbGwgYmUgdXNlZnVsIHRvIHNraXAgdXBkYXRpbmcgYXR0cnMgaW4gcmVuZGVyKCkuXG4vL1xuLy8gU2luY2UgdGhlIGF0dHJzIHVzZWQgYXMga2V5cyBpbiB0aGlzIG1hcCBhcmUgbm90IHJlbGVhc2VkIGZyb20gdGhlIHNlbGVjdG9yQ2FjaGUgb2JqZWN0LFxuLy8gdGhlcmUgaXMgbm8gcmlzayBvZiBtZW1vcnkgbGVha3MuIFRoZXJlZm9yZSwgTWFwIGlzIHVzZWQgaGVyZSBpbnN0ZWFkIG9mIFdlYWtNYXAuXG5leHBvcnQgZGVmYXVsdCBuZXcgTWFwKFtbZW1wdHlBdHRycywgdHJ1ZV1dKVxuIiwKICAgICJpbXBvcnQgVm5vZGUgZnJvbSAnLi92bm9kZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJ1c3QoaHRtbDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGFueSB7XG5cdGlmIChodG1sID09IG51bGwpIGh0bWwgPSAnJ1xuXHRyZXR1cm4gVm5vZGUoJzwnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgaHRtbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG59XG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuL3Zub2RlJ1xuaW1wb3J0IGh5cGVyc2NyaXB0Vm5vZGUgZnJvbSAnLi9oeXBlcnNjcmlwdFZub2RlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmcmFnbWVudChhdHRyczogYW55LCAuLi5jaGlsZHJlbjogYW55W10pOiBhbnkge1xuXHRjb25zdCB2bm9kZSA9IGh5cGVyc2NyaXB0Vm5vZGUoYXR0cnMsIGNoaWxkcmVuKVxuXG5cdGlmICh2bm9kZS5hdHRycyA9PSBudWxsKSB2bm9kZS5hdHRycyA9IHt9XG5cdHZub2RlLnRhZyA9ICdbJ1xuXHR2bm9kZS5jaGlsZHJlbiA9IFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKHZub2RlLmNoaWxkcmVuKVxuXHRyZXR1cm4gdm5vZGVcbn1cbiIsCiAgICAiaW1wb3J0IGhhc093biBmcm9tICcuLi91dGlsL2hhc093bidcblxuaW1wb3J0IFZub2RlIGZyb20gJy4vdm5vZGUnXG5pbXBvcnQgaHlwZXJzY3JpcHRWbm9kZSBmcm9tICcuL2h5cGVyc2NyaXB0Vm5vZGUnXG5pbXBvcnQgZW1wdHlBdHRycyBmcm9tICcuL2VtcHR5QXR0cnMnXG5pbXBvcnQgY2FjaGVkQXR0cnNJc1N0YXRpY01hcCBmcm9tICcuL2NhY2hlZEF0dHJzSXNTdGF0aWNNYXAnXG5pbXBvcnQgdHJ1c3QgZnJvbSAnLi90cnVzdCdcbmltcG9ydCBmcmFnbWVudCBmcm9tICcuL2ZyYWdtZW50J1xuXG5pbXBvcnQgdHlwZSB7Q29tcG9uZW50VHlwZSwgQ2hpbGRyZW4sIFZub2RlIGFzIFZub2RlVHlwZX0gZnJvbSAnLi92bm9kZSdcblxuZXhwb3J0IGludGVyZmFjZSBIeXBlcnNjcmlwdCB7XG5cdChzZWxlY3Rvcjogc3RyaW5nLCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSk6IFZub2RlVHlwZVxuXHQoc2VsZWN0b3I6IHN0cmluZywgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4sIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKTogVm5vZGVUeXBlXG5cdDxBdHRycywgU3RhdGU+KGNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxBdHRycywgU3RhdGU+LCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSk6IFZub2RlVHlwZTxBdHRycywgU3RhdGU+XG5cdDxBdHRycywgU3RhdGU+KGNvbXBvbmVudDogQ29tcG9uZW50VHlwZTxBdHRycywgU3RhdGU+LCBhdHRyczogQXR0cnMsIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKTogVm5vZGVUeXBlPEF0dHJzLCBTdGF0ZT5cblx0dHJ1c3QoaHRtbDogc3RyaW5nKTogVm5vZGVUeXBlXG5cdGZyYWdtZW50KGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCwgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pOiBWbm9kZVR5cGVcblx0RnJhZ21lbnQ6IHN0cmluZ1xufVxuXG5jb25zdCBzZWxlY3RvclBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbKC4rPykoPzpcXHMqPVxccyooXCJ8J3wpKCg/OlxcXFxbXCInXFxdXXwuKSo/KVxcNSk/XFxdKS9nXG5jb25zdCBzZWxlY3RvckNhY2hlOiBSZWNvcmQ8c3RyaW5nLCB7dGFnOiBzdHJpbmc7IGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+OyBpcz86IHN0cmluZ30+ID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG5mdW5jdGlvbiBpc0VtcHR5KG9iamVjdDogUmVjb3JkPHN0cmluZywgYW55Pik6IGJvb2xlYW4ge1xuXHRmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIGlmIChoYXNPd24uY2FsbChvYmplY3QsIGtleSkpIHJldHVybiBmYWxzZVxuXHRyZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBpc0Zvcm1BdHRyaWJ1dGVLZXkoa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcblx0cmV0dXJuIGtleSA9PT0gJ3ZhbHVlJyB8fCBrZXkgPT09ICdjaGVja2VkJyB8fCBrZXkgPT09ICdzZWxlY3RlZEluZGV4JyB8fCBrZXkgPT09ICdzZWxlY3RlZCdcbn1cblxuZnVuY3Rpb24gY29tcGlsZVNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiB7dGFnOiBzdHJpbmc7IGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+OyBpcz86IHN0cmluZ30ge1xuXHRsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGxcblx0bGV0IHRhZyA9ICdkaXYnXG5cdGNvbnN0IGNsYXNzZXM6IHN0cmluZ1tdID0gW11cblx0bGV0IGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0bGV0IGlzU3RhdGljID0gdHJ1ZVxuXHR3aGlsZSAoKG1hdGNoID0gc2VsZWN0b3JQYXJzZXIuZXhlYyhzZWxlY3RvcikpICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgdHlwZSA9IG1hdGNoWzFdXG5cdFx0Y29uc3QgdmFsdWUgPSBtYXRjaFsyXVxuXHRcdGlmICh0eXBlID09PSAnJyAmJiB2YWx1ZSAhPT0gJycpIHRhZyA9IHZhbHVlXG5cdFx0ZWxzZSBpZiAodHlwZSA9PT0gJyMnKSBhdHRycy5pZCA9IHZhbHVlXG5cdFx0ZWxzZSBpZiAodHlwZSA9PT0gJy4nKSBjbGFzc2VzLnB1c2godmFsdWUpXG5cdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09ICdbJykge1xuXHRcdFx0bGV0IGF0dHJWYWx1ZSA9IG1hdGNoWzZdXG5cdFx0XHRpZiAoYXR0clZhbHVlKSBhdHRyVmFsdWUgPSBhdHRyVmFsdWUucmVwbGFjZSgvXFxcXChbXCInXSkvZywgJyQxJykucmVwbGFjZSgvXFxcXFxcXFwvZywgJ1xcXFwnKVxuXHRcdFx0aWYgKG1hdGNoWzRdID09PSAnY2xhc3MnKSBjbGFzc2VzLnB1c2goYXR0clZhbHVlKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGF0dHJzW21hdGNoWzRdXSA9IGF0dHJWYWx1ZSA9PT0gJycgPyBhdHRyVmFsdWUgOiBhdHRyVmFsdWUgfHwgdHJ1ZVxuXHRcdFx0XHRpZiAoaXNGb3JtQXR0cmlidXRlS2V5KG1hdGNoWzRdKSkgaXNTdGF0aWMgPSBmYWxzZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBhdHRycy5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKVxuXHRpZiAoaXNFbXB0eShhdHRycykpIGF0dHJzID0gZW1wdHlBdHRyc1xuXHRlbHNlIGNhY2hlZEF0dHJzSXNTdGF0aWNNYXAuc2V0KGF0dHJzLCBpc1N0YXRpYylcblx0cmV0dXJuIHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdID0ge3RhZzogdGFnLCBhdHRyczogYXR0cnMsIGlzOiBhdHRycy5pc31cbn1cblxuZnVuY3Rpb24gZXhlY1NlbGVjdG9yKHN0YXRlOiB7dGFnOiBzdHJpbmc7IGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+OyBpcz86IHN0cmluZ30sIHZub2RlOiBhbnkpOiBhbnkge1xuXHR2bm9kZS50YWcgPSBzdGF0ZS50YWdcblxuXHRsZXQgYXR0cnMgPSB2bm9kZS5hdHRyc1xuXHRpZiAoYXR0cnMgPT0gbnVsbCkge1xuXHRcdHZub2RlLmF0dHJzID0gc3RhdGUuYXR0cnNcblx0XHR2bm9kZS5pcyA9IHN0YXRlLmlzXG5cdFx0cmV0dXJuIHZub2RlXG5cdH1cblxuXHRpZiAoaGFzT3duLmNhbGwoYXR0cnMsICdjbGFzcycpKSB7XG5cdFx0aWYgKGF0dHJzLmNsYXNzICE9IG51bGwpIGF0dHJzLmNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzXG5cdFx0YXR0cnMuY2xhc3MgPSBudWxsXG5cdH1cblxuXHRpZiAoc3RhdGUuYXR0cnMgIT09IGVtcHR5QXR0cnMpIHtcblx0XHRjb25zdCBjbGFzc05hbWUgPSBhdHRycy5jbGFzc05hbWVcblx0XHRhdHRycyA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmF0dHJzLCBhdHRycylcblxuXHRcdGlmIChzdGF0ZS5hdHRycy5jbGFzc05hbWUgIT0gbnVsbCkgYXR0cnMuY2xhc3NOYW1lID1cblx0XHRcdGNsYXNzTmFtZSAhPSBudWxsXG5cdFx0XHRcdD8gU3RyaW5nKHN0YXRlLmF0dHJzLmNsYXNzTmFtZSkgKyAnICcgKyBTdHJpbmcoY2xhc3NOYW1lKVxuXHRcdFx0XHQ6IHN0YXRlLmF0dHJzLmNsYXNzTmFtZVxuXHR9XG5cblx0Ly8gd29ya2Fyb3VuZCBmb3IgIzI2MjIgKHJlb3JkZXIga2V5cyBpbiBhdHRycyB0byBzZXQgXCJ0eXBlXCIgZmlyc3QpXG5cdC8vIFRoZSBET00gZG9lcyB0aGluZ3MgdG8gaW5wdXRzIGJhc2VkIG9uIHRoZSBcInR5cGVcIiwgc28gaXQgbmVlZHMgc2V0IGZpcnN0LlxuXHQvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9NaXRocmlsSlMvbWl0aHJpbC5qcy9pc3N1ZXMvMjYyMlxuXHRpZiAoc3RhdGUudGFnID09PSAnaW5wdXQnICYmIGhhc093bi5jYWxsKGF0dHJzLCAndHlwZScpKSB7XG5cdFx0YXR0cnMgPSBPYmplY3QuYXNzaWduKHt0eXBlOiBhdHRycy50eXBlfSwgYXR0cnMpXG5cdH1cblxuXHQvLyBUaGlzIHJlZHVjZXMgdGhlIGNvbXBsZXhpdHkgb2YgdGhlIGV2YWx1YXRpb24gb2YgXCJpc1wiIHdpdGhpbiB0aGUgcmVuZGVyIGZ1bmN0aW9uLlxuXHR2bm9kZS5pcyA9IGF0dHJzLmlzXG5cblx0dm5vZGUuYXR0cnMgPSBhdHRyc1xuXG5cdHJldHVybiB2bm9kZVxufVxuXG5mdW5jdGlvbiBoeXBlcnNjcmlwdChzZWxlY3Rvcjogc3RyaW5nIHwgQ29tcG9uZW50VHlwZSwgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCwgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pOiBhbnkge1xuXHRpZiAoc2VsZWN0b3IgPT0gbnVsbCB8fCB0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBzZWxlY3RvciAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgKHNlbGVjdG9yIGFzIGFueSkudmlldyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IEVycm9yKCdUaGUgc2VsZWN0b3IgbXVzdCBiZSBlaXRoZXIgYSBzdHJpbmcgb3IgYSBjb21wb25lbnQuJylcblx0fVxuXG5cdGNvbnN0IHZub2RlID0gaHlwZXJzY3JpcHRWbm9kZShhdHRycywgY2hpbGRyZW4pXG5cblx0aWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcblx0XHR2bm9kZS5jaGlsZHJlbiA9IFZub2RlLm5vcm1hbGl6ZUNoaWxkcmVuKHZub2RlLmNoaWxkcmVuKVxuXHRcdGlmIChzZWxlY3RvciAhPT0gJ1snKSByZXR1cm4gZXhlY1NlbGVjdG9yKHNlbGVjdG9yQ2FjaGVbc2VsZWN0b3JdIHx8IGNvbXBpbGVTZWxlY3RvcihzZWxlY3RvciksIHZub2RlKVxuXHR9XG5cblx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0dm5vZGUudGFnID0gc2VsZWN0b3Jcblx0cmV0dXJuIHZub2RlXG59XG5cbmh5cGVyc2NyaXB0LnRydXN0ID0gdHJ1c3RcblxuaHlwZXJzY3JpcHQuZnJhZ21lbnQgPSBmcmFnbWVudFxuaHlwZXJzY3JpcHQuRnJhZ21lbnQgPSAnWydcblxuZXhwb3J0IGRlZmF1bHQgaHlwZXJzY3JpcHRcbiIsCiAgICAiLyoqXG4gKiBSZXF1ZXN0LXNjb3BlZCBTU1IgY29udGV4dCB1c2luZyBBc3luY0xvY2FsU3RvcmFnZSAoTm9kZS9CdW4pLlxuICogRWFjaCBTU1IgcmVxdWVzdCBydW5zIGluc2lkZSBydW5XaXRoQ29udGV4dCgpOyBjb2RlIHRoYXQgbmVlZHMgdGhlIGN1cnJlbnRcbiAqIHJlcXVlc3QncyBzdG9yZSBvciBzdGF0ZSByZWdpc3RyeSBjYWxscyBnZXRTU1JDb250ZXh0KCkgYW5kIGdldHMgdGhhdFxuICogcmVxdWVzdCdzIGNvbnRleHQuIE5vIGdsb2JhbHMsIHNhZmUgdW5kZXIgY29uY3VycmVudCByZXF1ZXN0cy5cbiAqIEluIHRoZSBicm93c2VyLCBnZXRTU1JDb250ZXh0KCkgcmV0dXJucyB1bmRlZmluZWQgYW5kIHJ1bldpdGhDb250ZXh0IGp1c3QgcnVucyBmbi5cbiAqL1xudHlwZSBTdG9yYWdlTGlrZSA9IHtcblx0Z2V0U3RvcmUoKTogU1NSQWNjZXNzQ29udGV4dCB8IHVuZGVmaW5lZFxuXHRydW48VD4oY29udGV4dDogU1NSQWNjZXNzQ29udGV4dCwgZm46ICgpID0+IFQpOiBUXG59XG5cbmxldCBzc3JTdG9yYWdlOiBTdG9yYWdlTGlrZVxuXG50cnkge1xuXHRjb25zdCB7QXN5bmNMb2NhbFN0b3JhZ2V9ID0gcmVxdWlyZSgnbm9kZTphc3luY19ob29rcycpIGFzIHtBc3luY0xvY2FsU3RvcmFnZTogbmV3ICgpID0+IFN0b3JhZ2VMaWtlfVxuXHRzc3JTdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlKClcbn0gY2F0Y2gge1xuXHQvLyBCcm93c2VyIG9yIGVudmlyb25tZW50IHdpdGhvdXQgbm9kZTphc3luY19ob29rczsgbm8gcmVxdWVzdCBjb250ZXh0XG5cdHNzclN0b3JhZ2UgPSB7XG5cdFx0Z2V0U3RvcmU6ICgpID0+IHVuZGVmaW5lZCxcblx0XHRydW46IChfY29udGV4dCwgZm4pID0+IGZuKCksXG5cdH1cbn1cblxuLyoqXG4gKiBEYXRhIGZvciBhIHNpbmdsZSBTU1IgcmVxdWVzdC4gQ3JlYXRlZCBwZXIgcmVxdWVzdDsgb25seSB2aXNpYmxlIHRvIGNvZGVcbiAqIHRoYXQgcnVucyBpbnNpZGUgdGhlIHNhbWUgcnVuV2l0aENvbnRleHQoKSBjYWxsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNTUkFjY2Vzc0NvbnRleHQge1xuXHRzdG9yZT86IGFueVxuXHQvKiogUGVyLXJlcXVlc3Qgc3RhdGUgcmVnaXN0cnkgZm9yIHNlcmlhbGl6YXRpb247IGZyZXNoIE1hcCBwZXIgcmVxdWVzdC4gKi9cblx0c3RhdGVSZWdpc3RyeTogTWFwPHN0cmluZywge3N0YXRlOiBhbnk7IGluaXRpYWw6IGFueX0+XG5cdHNlc3Npb25JZD86IHN0cmluZ1xuXHRzZXNzaW9uRGF0YT86IGFueVxuXHQvKiogUGVyLXJlcXVlc3QgRXZlbnRFbWl0dGVyOyBwcmV2ZW50cyBldmVudCBsaXN0ZW5lcnMgZnJvbSBwZXJzaXN0aW5nIGJldHdlZW4gcmVxdWVzdHMuICovXG5cdGV2ZW50cz86IGFueVxuXHQvKiogUGVyLXJlcXVlc3Qgd2F0Y2hlciBjbGVhbnVwIGZ1bmN0aW9uczsgcHJldmVudHMgd2F0Y2hlcnMgZnJvbSBwZXJzaXN0aW5nIGJldHdlZW4gcmVxdWVzdHMuICovXG5cdHdhdGNoZXJzPzogQXJyYXk8KCkgPT4gdm9pZD5cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IFNTUiByZXF1ZXN0IGNvbnRleHQsIG9yIHVuZGVmaW5lZCBpZiB3ZSdyZSBub3QgaW5zaWRlXG4gKiBhIHJ1bldpdGhDb250ZXh0KCkgY2FsbCAoZS5nLiBvbiB0aGUgY2xpZW50IG9yIG91dHNpZGUgU1NSKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNTUkNvbnRleHQoKTogU1NSQWNjZXNzQ29udGV4dCB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBzc3JTdG9yYWdlLmdldFN0b3JlKClcbn1cblxuLyoqXG4gKiBSdW5zIGZuIHdpdGggY29udGV4dCBhcyB0aGUgY3VycmVudCBTU1IgY29udGV4dC4gVXNlZCBieSB0aGUgc2VydmVyIHNvIHRoYXRcbiAqIGdldFNTUkNvbnRleHQoKSByZXR1cm5zIHRoaXMgcmVxdWVzdCdzIGNvbnRleHQgZm9yIHRoZSBkdXJhdGlvbiBvZiBmbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bldpdGhDb250ZXh0PFQ+KGNvbnRleHQ6IFNTUkFjY2Vzc0NvbnRleHQsIGZuOiAoKSA9PiBUKTogVCB7XG5cdHJldHVybiBzc3JTdG9yYWdlLnJ1bihjb250ZXh0LCBmbilcbn1cblxuLyoqXG4gKiBDbGVhbiB1cCBhbGwgd2F0Y2hlcnMgcmVnaXN0ZXJlZCBpbiB0aGUgY3VycmVudCBTU1IgY29udGV4dC5cbiAqIENhbGxlZCBhdXRvbWF0aWNhbGx5IGF0IHRoZSBlbmQgb2YgcnVuV2l0aENvbnRleHRBc3luYywgYnV0IGNhbiBiZSBjYWxsZWQgbWFudWFsbHkgaWYgbmVlZGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW51cFdhdGNoZXJzKGNvbnRleHQ/OiBTU1JBY2Nlc3NDb250ZXh0KTogdm9pZCB7XG5cdGNvbnN0IGN0eCA9IGNvbnRleHQgfHwgZ2V0U1NSQ29udGV4dCgpXG5cdGlmIChjdHggJiYgY3R4LndhdGNoZXJzICYmIGN0eC53YXRjaGVycy5sZW5ndGggPiAwKSB7XG5cdFx0Y3R4LndhdGNoZXJzLmZvckVhY2godW53YXRjaCA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR1bndhdGNoKClcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBjbGVhbmluZyB1cCB3YXRjaGVyOicsIGUpXG5cdFx0XHR9XG5cdFx0fSlcblx0XHRjdHgud2F0Y2hlcnMubGVuZ3RoID0gMFxuXHR9XG59XG5cbi8qKlxuICogU2FtZSBhcyBydW5XaXRoQ29udGV4dCBidXQgZm9yIGFzeW5jIGZ1bmN0aW9ucy5cbiAqIEF1dG9tYXRpY2FsbHkgY2xlYW5zIHVwIHdhdGNoZXJzIGF0IHRoZSBlbmQgb2YgdGhlIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5XaXRoQ29udGV4dEFzeW5jPFQ+KFxuXHRjb250ZXh0OiBTU1JBY2Nlc3NDb250ZXh0LFxuXHRmbjogKCkgPT4gUHJvbWlzZTxUPixcbik6IFByb21pc2U8VD4ge1xuXHR0cnkge1xuXHRcdHJldHVybiBhd2FpdCBzc3JTdG9yYWdlLnJ1bihjb250ZXh0LCBmbilcblx0fSBmaW5hbGx5IHtcblx0XHQvLyBDbGVhbiB1cCB3YXRjaGVycyBhdCB0aGUgZW5kIG9mIFNTUiByZXF1ZXN0XG5cdFx0Y2xlYW51cFdhdGNoZXJzKGNvbnRleHQpXG5cdH1cbn1cbiIsCiAgICAiLy8gQ29yZSBzaWduYWwgcHJpbWl0aXZlIGZvciBmaW5lLWdyYWluZWQgcmVhY3Rpdml0eVxuXG5pbXBvcnQge2dldFNTUkNvbnRleHQsIHJ1bldpdGhDb250ZXh0fSBmcm9tICcuL3NzckNvbnRleHQnXG5cbi8vIEN1cnJlbnQgZWZmZWN0IGNvbnRleHQgZm9yIGRlcGVuZGVuY3kgdHJhY2tpbmdcbmxldCBjdXJyZW50RWZmZWN0OiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbFxuXG4vLyBDb21wb25lbnQtdG8tc2lnbmFsIGRlcGVuZGVuY3kgdHJhY2tpbmdcbmNvbnN0IGNvbXBvbmVudFNpZ25hbE1hcCA9IG5ldyBXZWFrTWFwPGFueSwgU2V0PFNpZ25hbDxhbnk+Pj4oKVxuY29uc3Qgc2lnbmFsQ29tcG9uZW50TWFwID0gbmV3IFdlYWtNYXA8U2lnbmFsPGFueT4sIFNldDxhbnk+PigpXG5cbi8vIEN1cnJlbnQgY29tcG9uZW50IGNvbnRleHQgZm9yIGNvbXBvbmVudC10by1zaWduYWwgZGVwZW5kZW5jeSB0cmFja2luZ1xubGV0IGN1cnJlbnRDb21wb25lbnQ6IGFueSA9IG51bGxcblxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnRDb21wb25lbnQoY29tcG9uZW50OiBhbnkpIHtcblx0Y3VycmVudENvbXBvbmVudCA9IGNvbXBvbmVudFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDdXJyZW50Q29tcG9uZW50KCkge1xuXHRjdXJyZW50Q29tcG9uZW50ID0gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudENvbXBvbmVudCgpIHtcblx0cmV0dXJuIGN1cnJlbnRDb21wb25lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrQ29tcG9uZW50U2lnbmFsKGNvbXBvbmVudDogYW55LCBzaWduYWw6IFNpZ25hbDxhbnk+KSB7XG5cdGlmICghY29tcG9uZW50U2lnbmFsTWFwLmhhcyhjb21wb25lbnQpKSB7XG5cdFx0Y29tcG9uZW50U2lnbmFsTWFwLnNldChjb21wb25lbnQsIG5ldyBTZXQoKSlcblx0fVxuXHRjb21wb25lbnRTaWduYWxNYXAuZ2V0KGNvbXBvbmVudCkhLmFkZChzaWduYWwpXG5cblx0aWYgKCFzaWduYWxDb21wb25lbnRNYXAuaGFzKHNpZ25hbCkpIHtcblx0XHRzaWduYWxDb21wb25lbnRNYXAuc2V0KHNpZ25hbCwgbmV3IFNldCgpKVxuXHR9XG5cdHNpZ25hbENvbXBvbmVudE1hcC5nZXQoc2lnbmFsKSEuYWRkKGNvbXBvbmVudClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudFNpZ25hbHMoY29tcG9uZW50OiBhbnkpOiBTZXQ8U2lnbmFsPGFueT4+IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGNvbXBvbmVudFNpZ25hbE1hcC5nZXQoY29tcG9uZW50KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2lnbmFsQ29tcG9uZW50cyhzaWduYWw6IFNpZ25hbDxhbnk+KTogU2V0PGFueT4gfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gc2lnbmFsQ29tcG9uZW50TWFwLmdldChzaWduYWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNvbXBvbmVudERlcGVuZGVuY2llcyhjb21wb25lbnQ6IGFueSkge1xuXHRjb25zdCBzaWduYWxzID0gY29tcG9uZW50U2lnbmFsTWFwLmdldChjb21wb25lbnQpXG5cdGlmIChzaWduYWxzKSB7XG5cdFx0c2lnbmFscy5mb3JFYWNoKHNpZ25hbCA9PiB7XG5cdFx0XHRjb25zdCBjb21wb25lbnRzID0gc2lnbmFsQ29tcG9uZW50TWFwLmdldChzaWduYWwpXG5cdFx0XHRpZiAoY29tcG9uZW50cykge1xuXHRcdFx0XHRjb21wb25lbnRzLmRlbGV0ZShjb21wb25lbnQpXG5cdFx0XHRcdGlmIChjb21wb25lbnRzLnNpemUgPT09IDApIHtcblx0XHRcdFx0XHRzaWduYWxDb21wb25lbnRNYXAuZGVsZXRlKHNpZ25hbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0Y29tcG9uZW50U2lnbmFsTWFwLmRlbGV0ZShjb21wb25lbnQpXG5cdH1cbn1cblxuLy8gU2V0IHVwIGNhbGxiYWNrIGZvciBzaWduYWwtdG8tY29tcG9uZW50IHJlZHJhdyBpbnRlZ3JhdGlvblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNpZ25hbFJlZHJhd0NhbGxiYWNrKGNhbGxiYWNrOiAoc2lnbmFsOiBTaWduYWw8YW55PikgPT4gdm9pZCkge1xuXHQoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjayA9IGNhbGxiYWNrXG59XG5cbi8qKlxuICogU2lnbmFsIGNsYXNzIC0gcmVhY3RpdmUgcHJpbWl0aXZlIHRoYXQgdHJhY2tzIHN1YnNjcmliZXJzXG4gKi9cbmV4cG9ydCBjbGFzcyBTaWduYWw8VD4ge1xuXHRwcml2YXRlIF92YWx1ZTogVFxuXHRwcml2YXRlIF9zdWJzY3JpYmVyczogU2V0PCgpID0+IHZvaWQ+ID0gbmV3IFNldCgpXG5cblx0Y29uc3RydWN0b3IoaW5pdGlhbDogVCkge1xuXHRcdHRoaXMuX3ZhbHVlID0gaW5pdGlhbFxuXHR9XG5cblx0Z2V0IHZhbHVlKCk6IFQge1xuXHRcdC8vIEVuc3VyZSBfc3Vic2NyaWJlcnMgaXMgaW5pdGlhbGl6ZWQgKGRlZmVuc2l2ZSBjaGVjaylcblx0XHRpZiAoIXRoaXMuX3N1YnNjcmliZXJzKSB7XG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBTZXQoKVxuXHRcdH1cblx0XHQvLyBUcmFjayBhY2Nlc3MgZHVyaW5nIHJlbmRlci9lZmZlY3Rcblx0XHRpZiAoY3VycmVudEVmZmVjdCkge1xuXHRcdFx0dGhpcy5fc3Vic2NyaWJlcnMuYWRkKGN1cnJlbnRFZmZlY3QpXG5cdFx0fVxuXHRcdC8vIFRyYWNrIGNvbXBvbmVudCBkZXBlbmRlbmN5XG5cdFx0aWYgKGN1cnJlbnRDb21wb25lbnQpIHtcblx0XHRcdHRyYWNrQ29tcG9uZW50U2lnbmFsKGN1cnJlbnRDb21wb25lbnQsIHRoaXMpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl92YWx1ZVxuXHR9XG5cblx0c2V0IHZhbHVlKG5ld1ZhbHVlOiBUKSB7XG5cdFx0aWYgKHRoaXMuX3ZhbHVlICE9PSBuZXdWYWx1ZSkge1xuXHRcdFx0dGhpcy5fdmFsdWUgPSBuZXdWYWx1ZVxuXHRcdFx0Ly8gRW5zdXJlIF9zdWJzY3JpYmVycyBpcyBpbml0aWFsaXplZCAoZGVmZW5zaXZlIGNoZWNrKVxuXHRcdFx0aWYgKCF0aGlzLl9zdWJzY3JpYmVycykge1xuXHRcdFx0XHR0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBTZXQoKVxuXHRcdFx0fVxuXHRcdFx0Ly8gTm90aWZ5IGFsbCBzdWJzY3JpYmVyc1xuXHRcdFx0Y29uc3QgY29udGV4dCA9IGdldFNTUkNvbnRleHQoKVxuXHRcdFx0dGhpcy5fc3Vic2NyaWJlcnMuZm9yRWFjaChmbiA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Ly8gQWx3YXlzIHJ1biB3YXRjaGVycyAtIHdyYXAgaW4gU1NSIGNvbnRleHQgaWYgYXZhaWxhYmxlXG5cdFx0XHRcdFx0aWYgKGNvbnRleHQpIHtcblx0XHRcdFx0XHRcdC8vIFJ1biB3YXRjaGVyIGluc2lkZSBTU1IgY29udGV4dCwgc2ltaWxhciB0byBldmVudHNcblx0XHRcdFx0XHRcdHJ1bldpdGhDb250ZXh0KGNvbnRleHQsICgpID0+IHtcblx0XHRcdFx0XHRcdFx0Zm4oKVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Zm4oKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gc2lnbmFsIHN1YnNjcmliZXI6JywgZSlcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC8vIFRyaWdnZXIgY29tcG9uZW50IHJlZHJhd3MgZm9yIGFmZmVjdGVkIGNvbXBvbmVudHNcblx0XHRcdC8vIFRoaXMgaXMgc2V0IHVwIGluIGluZGV4LnRzIGFmdGVyIG0ucmVkcmF3IGlzIGNyZWF0ZWRcblx0XHRcdGlmICgoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjaykge1xuXHRcdFx0XHQ7KHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2sodGhpcylcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3Vic2NyaWJlIHRvIHNpZ25hbCBjaGFuZ2VzXG5cdCAqL1xuXHRzdWJzY3JpYmUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcblx0XHQvLyBFbnN1cmUgX3N1YnNjcmliZXJzIGlzIGluaXRpYWxpemVkIChkZWZlbnNpdmUgY2hlY2spXG5cdFx0aWYgKCF0aGlzLl9zdWJzY3JpYmVycykge1xuXHRcdFx0dGhpcy5fc3Vic2NyaWJlcnMgPSBuZXcgU2V0KClcblx0XHR9XG5cdFx0dGhpcy5fc3Vic2NyaWJlcnMuYWRkKGNhbGxiYWNrKVxuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5fc3Vic2NyaWJlcnMpIHtcblx0XHRcdFx0dGhpcy5fc3Vic2NyaWJlcnMuZGVsZXRlKGNhbGxiYWNrKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBXYXRjaCBzaWduYWwgY2hhbmdlcyAoY29udmVuaWVuY2UgbWV0aG9kKVxuXHQgKi9cblx0d2F0Y2goY2FsbGJhY2s6IChuZXdWYWx1ZTogVCwgb2xkVmFsdWU6IFQpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcblx0XHRsZXQgb2xkVmFsdWUgPSB0aGlzLl92YWx1ZVxuXHRcdGNvbnN0IHVuc3Vic2NyaWJlID0gdGhpcy5zdWJzY3JpYmUoKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3VmFsdWUgPSB0aGlzLl92YWx1ZVxuXHRcdFx0Y2FsbGJhY2sobmV3VmFsdWUsIG9sZFZhbHVlKVxuXHRcdFx0b2xkVmFsdWUgPSBuZXdWYWx1ZVxuXHRcdH0pXG5cdFx0cmV0dXJuIHVuc3Vic2NyaWJlXG5cdH1cblxuXHQvKipcblx0ICogUGVlayBhdCB2YWx1ZSB3aXRob3V0IHN1YnNjcmliaW5nXG5cdCAqL1xuXHRwZWVrKCk6IFQge1xuXHRcdHJldHVybiB0aGlzLl92YWx1ZVxuXHR9XG59XG5cbi8qKlxuICogQ29tcHV0ZWQgc2lnbmFsIC0gYXV0b21hdGljYWxseSByZWNvbXB1dGVzIHdoZW4gZGVwZW5kZW5jaWVzIGNoYW5nZVxuICovXG5leHBvcnQgY2xhc3MgQ29tcHV0ZWRTaWduYWw8VD4gZXh0ZW5kcyBTaWduYWw8VD4ge1xuXHRwcml2YXRlIF9jb21wdXRlOiAoKSA9PiBUXG5cdHByaXZhdGUgX2RlcGVuZGVuY2llczogU2V0PFNpZ25hbDxhbnk+PiA9IG5ldyBTZXQoKVxuXHRwcml2YXRlIF9pc0RpcnR5ID0gdHJ1ZVxuXHRwcml2YXRlIF9jYWNoZWRWYWx1ZSE6IFRcblxuXHRjb25zdHJ1Y3Rvcihjb21wdXRlOiAoKSA9PiBUKSB7XG5cdFx0c3VwZXIobnVsbCBhcyBhbnkpIC8vIFdpbGwgYmUgY29tcHV0ZWQgb24gZmlyc3QgYWNjZXNzXG5cdFx0dGhpcy5fY29tcHV0ZSA9IGNvbXB1dGVcblx0fVxuXG5cdGdldCB2YWx1ZSgpOiBUIHtcblx0XHQvLyBUcmFjayBhY2Nlc3MgYnkgb3RoZXIgY29tcHV0ZWQgc2lnbmFscyAtIHRoaXMgZW5hYmxlcyBjb21wdXRlZC10by1jb21wdXRlZCBkZXBlbmRlbmN5IGNoYWluc1xuXHRcdC8vIFdoZW4gY29tcHV0ZWQgQiBhY2Nlc3NlcyBjb21wdXRlZCBBLCBBIHNob3VsZCBub3RpZnkgQiB3aGVuIEEncyBkZXBlbmRlbmNpZXMgY2hhbmdlXG5cdFx0aWYgKGN1cnJlbnRFZmZlY3QpIHtcblx0XHRcdC8vIEVuc3VyZSBfc3Vic2NyaWJlcnMgaXMgaW5pdGlhbGl6ZWQgKGRlZmVuc2l2ZSBjaGVjaylcblx0XHRcdGlmICghKHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMpIHtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMgPSBuZXcgU2V0KClcblx0XHRcdH1cblx0XHRcdDsodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycy5hZGQoY3VycmVudEVmZmVjdClcblx0XHR9XG5cblx0XHRpZiAodGhpcy5faXNEaXJ0eSkge1xuXHRcdFx0Ly8gQ2xlYXIgb2xkIGRlcGVuZGVuY2llc1xuXHRcdFx0dGhpcy5fZGVwZW5kZW5jaWVzLmZvckVhY2goZGVwID0+IHtcblx0XHRcdFx0ZGVwLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9tYXJrRGlydHkoKSk/LigpIC8vIFVuc3Vic2NyaWJlIG9sZFxuXHRcdFx0fSlcblx0XHRcdHRoaXMuX2RlcGVuZGVuY2llcy5jbGVhcigpXG5cblx0XHRcdC8vIFRyYWNrIGRlcGVuZGVuY2llcyBkdXJpbmcgY29tcHV0YXRpb25cblx0XHRcdGNvbnN0IHByZXZpb3VzRWZmZWN0ID0gY3VycmVudEVmZmVjdFxuXHRcdFx0Y3VycmVudEVmZmVjdCA9ICgpID0+IHtcblx0XHRcdFx0dGhpcy5fbWFya0RpcnR5KClcblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5fY2FjaGVkVmFsdWUgPSB0aGlzLl9jb21wdXRlKClcblx0XHRcdFx0Ly8gUmUtc3Vic2NyaWJlIHRvIG5ldyBkZXBlbmRlbmNpZXNcblx0XHRcdFx0Ly8gRGVwZW5kZW5jaWVzIGFyZSB0cmFja2VkIHZpYSB0aGUgY29tcHV0ZSBmdW5jdGlvbiBhY2Nlc3Npbmcgc2lnbmFsc1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0Y3VycmVudEVmZmVjdCA9IHByZXZpb3VzRWZmZWN0XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2lzRGlydHkgPSBmYWxzZVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fY2FjaGVkVmFsdWVcblx0fVxuXG5cdHByaXZhdGUgX21hcmtEaXJ0eSgpIHtcblx0XHRpZiAoIXRoaXMuX2lzRGlydHkpIHtcblx0XHRcdHRoaXMuX2lzRGlydHkgPSB0cnVlXG5cdFx0XHQvLyBFbnN1cmUgX3N1YnNjcmliZXJzIGlzIGluaXRpYWxpemVkIChkZWZlbnNpdmUgY2hlY2spXG5cdFx0XHRpZiAoISh0aGlzIGFzIGFueSkuX3N1YnNjcmliZXJzKSB7XG5cdFx0XHRcdCh0aGlzIGFzIGFueSkuX3N1YnNjcmliZXJzID0gbmV3IFNldCgpXG5cdFx0XHR9XG5cdFx0XHQvLyBOb3RpZnkgc3Vic2NyaWJlcnMgdGhhdCBjb21wdXRlZCB2YWx1ZSBjaGFuZ2VkXG5cdFx0XHRjb25zdCBjb250ZXh0ID0gZ2V0U1NSQ29udGV4dCgpXG5cdFx0XHQ7KHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMuZm9yRWFjaCgoZm46ICgpID0+IHZvaWQpID0+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0XHRcdFx0Ly8gUnVuIHdhdGNoZXIgaW5zaWRlIFNTUiBjb250ZXh0LCBzaW1pbGFyIHRvIGV2ZW50c1xuXHRcdFx0XHRcdFx0cnVuV2l0aENvbnRleHQoY29udGV4dCwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjb21wdXRlZCBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHNldCB2YWx1ZShfbmV3VmFsdWU6IFQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvbXB1dGVkIHNpZ25hbHMgYXJlIHJlYWQtb25seScpXG5cdH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBzaWduYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpZ25hbDxUPihpbml0aWFsOiBUKTogU2lnbmFsPFQ+IHtcblx0cmV0dXJuIG5ldyBTaWduYWwoaW5pdGlhbClcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBjb21wdXRlZCBzaWduYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVkPFQ+KGNvbXB1dGU6ICgpID0+IFQpOiBDb21wdXRlZFNpZ25hbDxUPiB7XG5cdHJldHVybiBuZXcgQ29tcHV0ZWRTaWduYWwoY29tcHV0ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gZWZmZWN0IHRoYXQgcnVucyB3aGVuIGRlcGVuZGVuY2llcyBjaGFuZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVmZmVjdChmbjogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuXHRjb25zdCBwcmV2aW91c0VmZmVjdCA9IGN1cnJlbnRFZmZlY3Rcblx0bGV0IGNsZWFudXA6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsXG5cdGxldCBpc0FjdGl2ZSA9IHRydWVcblxuXHRjb25zdCBlZmZlY3RGbiA9ICgpID0+IHtcblx0XHRpZiAoIWlzQWN0aXZlKSByZXR1cm5cblx0XHRcblx0XHQvLyBSdW4gY2xlYW51cCBpZiBleGlzdHNcblx0XHRpZiAoY2xlYW51cCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y2xlYW51cCgpXG5cdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gZWZmZWN0IGNsZWFudXA6JywgZSlcblx0XHRcdH1cblx0XHRcdGNsZWFudXAgPSBudWxsXG5cdFx0fVxuXG5cdFx0Ly8gVHJhY2sgZGVwZW5kZW5jaWVzXG5cdFx0Y3VycmVudEVmZmVjdCA9IGVmZmVjdEZuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZuKClcblx0XHRcdC8vIElmIGZuIHJldHVybnMgYSBjbGVhbnVwIGZ1bmN0aW9uLCBzdG9yZSBpdFxuXHRcdFx0aWYgKHR5cGVvZiByZXN1bHQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Y2xlYW51cCA9IHJlc3VsdFxuXHRcdFx0fVxuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gZWZmZWN0OicsIGUpXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGN1cnJlbnRFZmZlY3QgPSBwcmV2aW91c0VmZmVjdFxuXHRcdH1cblx0fVxuXG5cdC8vIFJ1biBlZmZlY3QgaW1tZWRpYXRlbHlcblx0ZWZmZWN0Rm4oKVxuXG5cdC8vIFJldHVybiBjbGVhbnVwIGZ1bmN0aW9uXG5cdHJldHVybiAoKSA9PiB7XG5cdFx0aXNBY3RpdmUgPSBmYWxzZVxuXHRcdGlmIChjbGVhbnVwKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjbGVhbnVwKClcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBlZmZlY3QgY2xlYW51cDonLCBlKVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBOb3RlOiBXZSBjYW4ndCB1bnN1YnNjcmliZSBmcm9tIHNpZ25hbHMgaGVyZSBiZWNhdXNlIHdlIGRvbid0IHRyYWNrIHRoZW1cblx0XHQvLyBUaGlzIGlzIGEgbGltaXRhdGlvbiAtIGluIGEgZnVsbCBpbXBsZW1lbnRhdGlvbiwgd2UnZCB0cmFjayBzaWduYWwgc3Vic2NyaXB0aW9uc1xuXHR9XG59XG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuLi9yZW5kZXIvdm5vZGUnXG5pbXBvcnQge2dldFNpZ25hbENvbXBvbmVudHMsIHR5cGUgU2lnbmFsfSBmcm9tICcuLi9zaWduYWwnXG5cbmltcG9ydCB0eXBlIHtDb21wb25lbnRUeXBlLCBDaGlsZHJlbiwgVm5vZGUgYXMgVm5vZGVUeXBlfSBmcm9tICcuLi9yZW5kZXIvdm5vZGUnXG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyIHtcblx0KHJvb3Q6IEVsZW1lbnQsIHZub2RlczogQ2hpbGRyZW4gfCBWbm9kZVR5cGUgfCBudWxsLCByZWRyYXc/OiAoKSA9PiB2b2lkKTogdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZHJhdyB7XG5cdChjb21wb25lbnQ/OiBDb21wb25lbnRUeXBlKTogdm9pZFxuXHRzeW5jKCk6IHZvaWRcblx0c2lnbmFsPzogKHNpZ25hbDogU2lnbmFsPGFueT4pID0+IHZvaWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3VudCB7XG5cdChyb290OiBFbGVtZW50LCBjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBudWxsKTogdm9pZFxufVxuXG5pbnRlcmZhY2UgU2NoZWR1bGUge1xuXHQoZm46ICgpID0+IHZvaWQpOiB2b2lkXG59XG5cbmludGVyZmFjZSBDb25zb2xlIHtcblx0ZXJyb3I6IChlOiBhbnkpID0+IHZvaWRcbn1cblxuaW50ZXJmYWNlIE1vdW50UmVkcmF3IHtcblx0bW91bnQ6IE1vdW50XG5cdHJlZHJhdzogUmVkcmF3XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vdW50UmVkcmF3RmFjdG9yeShyZW5kZXI6IFJlbmRlciwgc2NoZWR1bGU6IFNjaGVkdWxlLCBjb25zb2xlOiBDb25zb2xlKTogTW91bnRSZWRyYXcge1xuXHRjb25zdCBzdWJzY3JpcHRpb25zOiBBcnJheTxFbGVtZW50IHwgQ29tcG9uZW50VHlwZT4gPSBbXVxuXHRjb25zdCBjb21wb25lbnRUb0VsZW1lbnQgPSBuZXcgV2Vha01hcDxDb21wb25lbnRUeXBlLCBFbGVtZW50PigpXG5cdGxldCBwZW5kaW5nID0gZmFsc2Vcblx0bGV0IG9mZnNldCA9IC0xXG5cblx0ZnVuY3Rpb24gc3luYygpIHtcblx0XHRmb3IgKG9mZnNldCA9IDA7IG9mZnNldCA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyBvZmZzZXQgKz0gMikge1xuXHRcdFx0dHJ5IHsgcmVuZGVyKHN1YnNjcmlwdGlvbnNbb2Zmc2V0XSBhcyBFbGVtZW50LCBWbm9kZShzdWJzY3JpcHRpb25zW29mZnNldCArIDFdIGFzIENvbXBvbmVudFR5cGUsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpIH1cblx0XHRcdGNhdGNoKGUpIHsgY29uc29sZS5lcnJvcihlKSB9XG5cdFx0fVxuXHRcdG9mZnNldCA9IC0xXG5cdH1cblxuXHRmdW5jdGlvbiByZWRyYXdDb21wb25lbnQoY29tcG9uZW50T3JTdGF0ZTogQ29tcG9uZW50VHlwZSkge1xuXHRcdC8vIGNvbXBvbmVudE9yU3RhdGUgbWlnaHQgYmUgdm5vZGUuc3RhdGUgKGZyb20gc2lnbmFsIHRyYWNraW5nKSBvciBjb21wb25lbnQgb2JqZWN0XG5cdFx0Ly8gVHJ5IHRvIGZpbmQgdGhlIGFjdHVhbCBjb21wb25lbnQgb2JqZWN0IGlmIGl0J3Mgdm5vZGUuc3RhdGVcblx0XHRsZXQgY29tcG9uZW50ID0gY29tcG9uZW50T3JTdGF0ZVxuXHRcdGNvbnN0IHN0YXRlVG9Db21wb25lbnRNYXAgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Db21wb25lbnQgYXMgV2Vha01hcDxhbnksIENvbXBvbmVudFR5cGU+IHwgdW5kZWZpbmVkXG5cdFx0aWYgKHN0YXRlVG9Db21wb25lbnRNYXAgJiYgc3RhdGVUb0NvbXBvbmVudE1hcC5oYXMoY29tcG9uZW50T3JTdGF0ZSkpIHtcblx0XHRcdGNvbXBvbmVudCA9IHN0YXRlVG9Db21wb25lbnRNYXAuZ2V0KGNvbXBvbmVudE9yU3RhdGUpIVxuXHRcdH1cblx0XHRcblx0XHQvLyBGaXJzdCB0cnk6IGZpbmQgZWxlbWVudCBpbiBjb21wb25lbnRUb0VsZW1lbnQgKGZvciBtLm1vdW50IGNvbXBvbmVudHMpXG5cdFx0Ly8gQ2hlY2sgdGhpcyBmaXJzdCB0byBlbnN1cmUgc3luY2hyb25vdXMgcmVkcmF3cyBmb3IgbS5tb3VudCBjb21wb25lbnRzXG5cdFx0Y29uc3QgZWxlbWVudCA9IGNvbXBvbmVudFRvRWxlbWVudC5nZXQoY29tcG9uZW50KVxuXHRcdGlmIChlbGVtZW50KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZW5kZXIoZWxlbWVudCwgVm5vZGUoY29tcG9uZW50LCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgcmVkcmF3KVxuXHRcdFx0XHQvLyBJZiByZW5kZXIgc3VjY2VlZHMsIHdlJ3JlIGRvbmVcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKVxuXHRcdFx0XHQvLyBJZiByZW5kZXIgZmFpbHMsIGNvbnRpbnVlIHRvIG5leHQgY2hlY2sgKGZhbGwgdGhyb3VnaClcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gU2Vjb25kIHRyeTogZmluZCBET00gZWxlbWVudCBkaXJlY3RseSBmcm9tIGNvbXBvbmVudCBzdGF0ZSAoZm9yIHJvdXRlZCBjb21wb25lbnRzKVxuXHRcdC8vIE9ubHkgY2hlY2sgdGhpcyBpZiBjb21wb25lbnRUb0VsZW1lbnQgZGlkbid0IGZpbmQgYW55dGhpbmcgKG5vdCBhbiBtLm1vdW50IGNvbXBvbmVudClcblx0XHRjb25zdCBzdGF0ZVRvRG9tTWFwID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tIGFzIFdlYWtNYXA8YW55LCBFbGVtZW50PiB8IHVuZGVmaW5lZFxuXHRcdGlmIChzdGF0ZVRvRG9tTWFwICYmIHN0YXRlVG9Eb21NYXAuaGFzKGNvbXBvbmVudE9yU3RhdGUpKSB7XG5cdFx0XHQvLyBGb3Igcm91dGVkIGNvbXBvbmVudHMsIGFsd2F5cyB1c2UgZ2xvYmFsIHJlZHJhdyB0byBlbnN1cmUgUm91dGVyUm9vdCByZS1yZW5kZXJzIGNvcnJlY3RseVxuXHRcdFx0Ly8gUm91dGVyUm9vdCBuZWVkcyBjdXJyZW50UmVzb2x2ZXIgYW5kIGNvbXBvbmVudCB0byBiZSBzZXQgKGZyb20gcm91dGUgcmVzb2x1dGlvbilcblx0XHRcdC8vIEEgZGlyZWN0IHJlZHJhdyBtaWdodCB1c2Ugc3RhbGUgcm91dGUgc3RhdGUsIHNvIHdlIHRyaWdnZXIgYSBmdWxsIHN5bmMgaW5zdGVhZFxuXHRcdFx0Ly8gVGhpcyBlbnN1cmVzIFJvdXRlclJvb3QgcmUtcmVuZGVycyB3aXRoIHRoZSBjdXJyZW50IHJvdXRlLCBwcmVzZXJ2aW5nIExheW91dFxuXHRcdFx0aWYgKCFwZW5kaW5nKSB7XG5cdFx0XHRcdHBlbmRpbmcgPSB0cnVlXG5cdFx0XHRcdHNjaGVkdWxlKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHBlbmRpbmcgPSBmYWxzZVxuXHRcdFx0XHRcdHN5bmMoKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gVGhpcmQgdHJ5OiBmaW5kIGVsZW1lbnQgaW4gc3Vic2NyaXB0aW9uc1xuXHRcdGNvbnN0IGluZGV4ID0gc3Vic2NyaXB0aW9ucy5pbmRleE9mKGNvbXBvbmVudClcblx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCAlIDIgPT09IDEpIHtcblx0XHRcdGNvbnN0IHJvb3RFbGVtZW50ID0gc3Vic2NyaXB0aW9uc1tpbmRleCAtIDFdIGFzIEVsZW1lbnRcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlbmRlcihyb290RWxlbWVudCwgVm5vZGUoY29tcG9uZW50LCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgcmVkcmF3KVxuXHRcdFx0XHQvLyBJZiByZW5kZXIgc3VjY2VlZHMsIHdlJ3JlIGRvbmVcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKVxuXHRcdFx0XHQvLyBJZiByZW5kZXIgZmFpbHMsIGNvbnRpbnVlIHRvIGZhbGxiYWNrIChmYWxsIHRocm91Z2gpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vIEZpbmFsIGZhbGxiYWNrOiBjb21wb25lbnQgbm90IGZvdW5kIC0gdHJpZ2dlciBnbG9iYWwgcmVkcmF3XG5cdFx0Ly8gVGhpcyBoYW5kbGVzIGVkZ2UgY2FzZXMgd2hlcmUgY29tcG9uZW50IHRyYWNraW5nIGZhaWxlZFxuXHRcdGlmICghcGVuZGluZykge1xuXHRcdFx0cGVuZGluZyA9IHRydWVcblx0XHRcdHNjaGVkdWxlKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRwZW5kaW5nID0gZmFsc2Vcblx0XHRcdFx0c3luYygpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlZHJhdyhjb21wb25lbnQ/OiBDb21wb25lbnRUeXBlKSB7XG5cdFx0Ly8gQ29tcG9uZW50LWxldmVsIHJlZHJhd1xuXHRcdGlmIChjb21wb25lbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmVkcmF3Q29tcG9uZW50KGNvbXBvbmVudClcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdC8vIEdsb2JhbCByZWRyYXcgKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG5cdFx0aWYgKCFwZW5kaW5nKSB7XG5cdFx0XHRwZW5kaW5nID0gdHJ1ZVxuXHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHBlbmRpbmcgPSBmYWxzZVxuXHRcdFx0XHRzeW5jKClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0cmVkcmF3LnN5bmMgPSBzeW5jXG5cblx0Ly8gRXhwb3J0IGZ1bmN0aW9uIHRvIHJlZHJhdyBjb21wb25lbnRzIGFmZmVjdGVkIGJ5IHNpZ25hbCBjaGFuZ2VzXG5cdDsocmVkcmF3IGFzIGFueSkuc2lnbmFsID0gZnVuY3Rpb24oc2lnbmFsOiBTaWduYWw8YW55Pikge1xuXHRcdGNvbnN0IGNvbXBvbmVudHMgPSBnZXRTaWduYWxDb21wb25lbnRzKHNpZ25hbClcblx0XHRpZiAoY29tcG9uZW50cykge1xuXHRcdFx0Y29tcG9uZW50cy5mb3JFYWNoKGNvbXBvbmVudCA9PiB7XG5cdFx0XHRcdHJlZHJhd0NvbXBvbmVudChjb21wb25lbnQpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdW50KHJvb3Q6IEVsZW1lbnQsIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IG51bGwpIHtcblx0XHRpZiAoY29tcG9uZW50ICE9IG51bGwgJiYgKGNvbXBvbmVudCBhcyBhbnkpLnZpZXcgPT0gbnVsbCAmJiB0eXBlb2YgY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdtLm1vdW50IGV4cGVjdHMgYSBjb21wb25lbnQsIG5vdCBhIHZub2RlLicpXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5kZXggPSBzdWJzY3JpcHRpb25zLmluZGV4T2Yocm9vdClcblx0XHRpZiAoaW5kZXggPj0gMCkge1xuXHRcdFx0Y29uc3Qgb2xkQ29tcG9uZW50ID0gc3Vic2NyaXB0aW9uc1tpbmRleCArIDFdIGFzIENvbXBvbmVudFR5cGVcblx0XHRcdGlmIChvbGRDb21wb25lbnQpIHtcblx0XHRcdFx0Y29tcG9uZW50VG9FbGVtZW50LmRlbGV0ZShvbGRDb21wb25lbnQpXG5cdFx0XHR9XG5cdFx0XHRzdWJzY3JpcHRpb25zLnNwbGljZShpbmRleCwgMilcblx0XHRcdGlmIChpbmRleCA8PSBvZmZzZXQpIG9mZnNldCAtPSAyXG5cdFx0XHRyZW5kZXIocm9vdCwgW10pXG5cdFx0fVxuXG5cdFx0aWYgKGNvbXBvbmVudCAhPSBudWxsKSB7XG5cdFx0XHRzdWJzY3JpcHRpb25zLnB1c2gocm9vdCwgY29tcG9uZW50KVxuXHRcdFx0Y29tcG9uZW50VG9FbGVtZW50LnNldChjb21wb25lbnQsIHJvb3QpXG5cdFx0XHRyZW5kZXIocm9vdCwgVm5vZGUoY29tcG9uZW50LCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsKSwgcmVkcmF3KVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7bW91bnQ6IG1vdW50LCByZWRyYXc6IHJlZHJhd31cbn1cbiIsCiAgICAiLypcblBlcmNlbnQgZW5jb2RpbmdzIGVuY29kZSBVVEYtOCBieXRlcywgc28gdGhpcyByZWdleHAgbmVlZHMgdG8gbWF0Y2ggdGhhdC5cbkhlcmUncyBob3cgVVRGLTggZW5jb2RlcyBzdHVmZjpcbi0gYDAwLTdGYDogMS1ieXRlLCBmb3IgVSswMDAwLVUrMDA3RlxuLSBgQzItREYgODAtQkZgOiAyLWJ5dGUsIGZvciBVKzAwODAtVSswN0ZGXG4tIGBFMC1FRiA4MC1CRiA4MC1CRmA6IDMtYnl0ZSwgZW5jb2RlcyBVKzA4MDAtVStGRkZGXG4tIGBGMC1GNCA4MC1CRiA4MC1CRiA4MC1CRmA6IDQtYnl0ZSwgZW5jb2RlcyBVKzEwMDAwLVUrMTBGRkZGXG5JbiB0aGlzLCB0aGVyZSdzIGEgbnVtYmVyIG9mIGludmFsaWQgYnl0ZSBzZXF1ZW5jZXM6XG4tIGA4MC1CRmA6IENvbnRpbnVhdGlvbiBieXRlLCBpbnZhbGlkIGFzIHN0YXJ0XG4tIGBDMC1DMSA4MC1CRmA6IE92ZXJsb25nIGVuY29kaW5nIGZvciBVKzAwMDAtVSswMDdGXG4tIGBFMCA4MC05RiA4MC1CRmA6IE92ZXJsb25nIGVuY29kaW5nIGZvciBVKzAwODAtVSswN0ZGXG4tIGBFRCBBMC1CRiA4MC1CRmA6IEVuY29kaW5nIGZvciBVVEYtMTYgc3Vycm9nYXRlIFUrRDgwMC1VK0RGRkZcbi0gYEYwIDgwLThGIDgwLUJGIDgwLUJGYDogT3ZlcmxvbmcgZW5jb2RpbmcgZm9yIFUrMDgwMC1VK0ZGRkZcbi0gYEY0IDkwLUJGYDogUkZDIDM2MjkgcmVzdHJpY3RlZCBVVEYtOCB0byBvbmx5IGNvZGUgcG9pbnRzIFVURi0xNiBjb3VsZCBlbmNvZGUuXG4tIGBGNS1GRmA6IFJGQyAzNjI5IHJlc3RyaWN0ZWQgVVRGLTggdG8gb25seSBjb2RlIHBvaW50cyBVVEYtMTYgY291bGQgZW5jb2RlLlxuU28gaW4gcmVhbGl0eSwgb25seSB0aGUgZm9sbG93aW5nIHNlcXVlbmNlcyBjYW4gZW5jb2RlIGFyZSB2YWxpZCBjaGFyYWN0ZXJzOlxuLSAwMC03RlxuLSBDMi1ERiA4MC1CRlxuLSBFMCAgICBBMC1CRiA4MC1CRlxuLSBFMS1FQyA4MC1CRiA4MC1CRlxuLSBFRCAgICA4MC05RiA4MC1CRlxuLSBFRS1FRiA4MC1CRiA4MC1CRlxuLSBGMCAgICA5MC1CRiA4MC1CRiA4MC1CRlxuLSBGMS1GMyA4MC1CRiA4MC1CRiA4MC1CRlxuLSBGNCAgICA4MC04RiA4MC1CRiA4MC1CRlxuXG5UaGUgcmVnZXhwIGp1c3QgdHJpZXMgdG8gbWF0Y2ggdGhpcyBhcyBjb21wYWN0bHkgYXMgcG9zc2libGUuXG4qL1xuY29uc3QgdmFsaWRVdGY4RW5jb2RpbmdzID0gLyUoPzpbMC03XXwoPyFjWzAxXXxlMCVbODldfGVkJVthYl18ZjAlOHxmNCVbOWFiXSkoPzpjfGR8KD86ZXxmWzAtNF0lWzg5YWJdKVtcXGRhLWZdJVs4OWFiXSlbXFxkYS1mXSVbODlhYl0pW1xcZGEtZl0vZ2lcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShzdHI6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiBTdHJpbmcoc3RyKS5yZXBsYWNlKHZhbGlkVXRmOEVuY29kaW5ncywgZGVjb2RlVVJJQ29tcG9uZW50KVxufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZFF1ZXJ5U3RyaW5nKG9iamVjdDogUmVjb3JkPHN0cmluZywgYW55Pik6IHN0cmluZyB7XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHJldHVybiAnJ1xuXG5cdGNvbnN0IGFyZ3M6IHN0cmluZ1tdID0gW11cblx0ZnVuY3Rpb24gZGVzdHJ1Y3R1cmUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZGVzdHJ1Y3R1cmUoa2V5ICsgJ1snICsgaSArICddJywgdmFsdWVbaV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGkgaW4gdmFsdWUpIHtcblx0XHRcdFx0ZGVzdHJ1Y3R1cmUoa2V5ICsgJ1snICsgaSArICddJywgdmFsdWVbaV0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgYXJncy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09ICcnID8gJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6ICcnKSlcblx0fVxuXG5cdGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuXHRcdGRlc3RydWN0dXJlKGtleSwgb2JqZWN0W2tleV0pXG5cdH1cblxuXHRyZXR1cm4gYXJncy5qb2luKCcmJylcbn1cbiIsCiAgICAiaW1wb3J0IGJ1aWxkUXVlcnlTdHJpbmcgZnJvbSAnLi4vcXVlcnlzdHJpbmcvYnVpbGQnXG5cbi8vIFJldHVybnMgYHBhdGhgIGZyb20gYHRlbXBsYXRlYCArIGBwYXJhbXNgXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZFBhdGhuYW1lKHRlbXBsYXRlOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pik6IHN0cmluZyB7XG5cdGlmICgoLzooW15cXC9cXC4tXSspKFxcLnszfSk/Oi8pLnRlc3QodGVtcGxhdGUpKSB7XG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKCdUZW1wbGF0ZSBwYXJhbWV0ZXIgbmFtZXMgbXVzdCBiZSBzZXBhcmF0ZWQgYnkgZWl0aGVyIGEgXFwnL1xcJywgXFwnLVxcJywgb3IgXFwnLlxcJy4nKVxuXHR9XG5cdGlmIChwYXJhbXMgPT0gbnVsbCkgcmV0dXJuIHRlbXBsYXRlXG5cdGNvbnN0IHF1ZXJ5SW5kZXggPSB0ZW1wbGF0ZS5pbmRleE9mKCc/Jylcblx0Y29uc3QgaGFzaEluZGV4ID0gdGVtcGxhdGUuaW5kZXhPZignIycpXG5cdGNvbnN0IHF1ZXJ5RW5kID0gaGFzaEluZGV4IDwgMCA/IHRlbXBsYXRlLmxlbmd0aCA6IGhhc2hJbmRleFxuXHRjb25zdCBwYXRoRW5kID0gcXVlcnlJbmRleCA8IDAgPyBxdWVyeUVuZCA6IHF1ZXJ5SW5kZXhcblx0Y29uc3QgcGF0aCA9IHRlbXBsYXRlLnNsaWNlKDAsIHBhdGhFbmQpXG5cdGNvbnN0IHF1ZXJ5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblxuXHRPYmplY3QuYXNzaWduKHF1ZXJ5LCBwYXJhbXMpXG5cblx0Y29uc3QgcmVzb2x2ZWQgPSBwYXRoLnJlcGxhY2UoLzooW15cXC9cXC4tXSspKFxcLnszfSk/L2csIGZ1bmN0aW9uKG0sIGtleSwgdmFyaWFkaWMpIHtcblx0XHRkZWxldGUgcXVlcnlba2V5XVxuXHRcdC8vIElmIG5vIHN1Y2ggcGFyYW1ldGVyIGV4aXN0cywgZG9uJ3QgaW50ZXJwb2xhdGUgaXQuXG5cdFx0aWYgKHBhcmFtc1trZXldID09IG51bGwpIHJldHVybiBtXG5cdFx0Ly8gRXNjYXBlIG5vcm1hbCBwYXJhbWV0ZXJzLCBidXQgbm90IHZhcmlhZGljIG9uZXMuXG5cdFx0cmV0dXJuIHZhcmlhZGljID8gcGFyYW1zW2tleV0gOiBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHBhcmFtc1trZXldKSlcblx0fSlcblxuXHQvLyBJbiBjYXNlIHRoZSB0ZW1wbGF0ZSBzdWJzdGl0dXRpb24gYWRkcyBuZXcgcXVlcnkvaGFzaCBwYXJhbWV0ZXJzLlxuXHRjb25zdCBuZXdRdWVyeUluZGV4ID0gcmVzb2x2ZWQuaW5kZXhPZignPycpXG5cdGNvbnN0IG5ld0hhc2hJbmRleCA9IHJlc29sdmVkLmluZGV4T2YoJyMnKVxuXHRjb25zdCBuZXdRdWVyeUVuZCA9IG5ld0hhc2hJbmRleCA8IDAgPyByZXNvbHZlZC5sZW5ndGggOiBuZXdIYXNoSW5kZXhcblx0Y29uc3QgbmV3UGF0aEVuZCA9IG5ld1F1ZXJ5SW5kZXggPCAwID8gbmV3UXVlcnlFbmQgOiBuZXdRdWVyeUluZGV4XG5cdGxldCByZXN1bHQgPSByZXNvbHZlZC5zbGljZSgwLCBuZXdQYXRoRW5kKVxuXG5cdGlmIChxdWVyeUluZGV4ID49IDApIHJlc3VsdCArPSB0ZW1wbGF0ZS5zbGljZShxdWVyeUluZGV4LCBxdWVyeUVuZClcblx0aWYgKG5ld1F1ZXJ5SW5kZXggPj0gMCkgcmVzdWx0ICs9IChxdWVyeUluZGV4IDwgMCA/ICc/JyA6ICcmJykgKyByZXNvbHZlZC5zbGljZShuZXdRdWVyeUluZGV4LCBuZXdRdWVyeUVuZClcblx0Y29uc3QgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKHF1ZXJ5KVxuXHRpZiAocXVlcnlzdHJpbmcpIHJlc3VsdCArPSAocXVlcnlJbmRleCA8IDAgJiYgbmV3UXVlcnlJbmRleCA8IDAgPyAnPycgOiAnJicpICsgcXVlcnlzdHJpbmdcblx0aWYgKGhhc2hJbmRleCA+PSAwKSByZXN1bHQgKz0gdGVtcGxhdGUuc2xpY2UoaGFzaEluZGV4KVxuXHRpZiAobmV3SGFzaEluZGV4ID49IDApIHJlc3VsdCArPSAoaGFzaEluZGV4IDwgMCA/ICcnIDogJyYnKSArIHJlc29sdmVkLnNsaWNlKG5ld0hhc2hJbmRleClcblx0cmV0dXJuIHJlc3VsdFxufVxuIiwKICAgICJpbXBvcnQgZGVjb2RlVVJJQ29tcG9uZW50U2FmZSBmcm9tICcuLi91dGlsL2RlY29kZVVSSUNvbXBvbmVudFNhZmUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcoc3RyaW5nOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG5cdGlmIChzdHJpbmcgPT09ICcnIHx8IHN0cmluZyA9PSBudWxsKSByZXR1cm4ge31cblx0aWYgKHN0cmluZy5jaGFyQXQoMCkgPT09ICc/Jykgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDEpXG5cblx0Y29uc3QgZW50cmllcyA9IHN0cmluZy5zcGxpdCgnJicpXG5cdGNvbnN0IGNvdW50ZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge31cblx0Y29uc3QgZGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IGVudHJ5ID0gZW50cmllc1tpXS5zcGxpdCgnPScpXG5cdFx0Y29uc3Qga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShlbnRyeVswXSlcblx0XHRsZXQgdmFsdWU6IGFueSA9IGVudHJ5Lmxlbmd0aCA9PT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudFNhZmUoZW50cnlbMV0pIDogJydcblxuXHRcdGlmICh2YWx1ZSA9PT0gJ3RydWUnKSB2YWx1ZSA9IHRydWVcblx0XHRlbHNlIGlmICh2YWx1ZSA9PT0gJ2ZhbHNlJykgdmFsdWUgPSBmYWxzZVxuXG5cdFx0Y29uc3QgbGV2ZWxzID0ga2V5LnNwbGl0KC9cXF1cXFs/fFxcWy8pXG5cdFx0bGV0IGN1cnNvcjogYW55ID0gZGF0YVxuXHRcdGlmIChrZXkuaW5kZXhPZignWycpID4gLTEpIGxldmVscy5wb3AoKVxuXHRcdGZvciAobGV0IGogPSAwOyBqIDwgbGV2ZWxzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRjb25zdCBsZXZlbCA9IGxldmVsc1tqXVxuXHRcdFx0Y29uc3QgbmV4dExldmVsID0gbGV2ZWxzW2ogKyAxXVxuXHRcdFx0Y29uc3QgaXNOdW1iZXIgPSBuZXh0TGV2ZWwgPT0gJycgfHwgIWlzTmFOKHBhcnNlSW50KG5leHRMZXZlbCwgMTApKVxuXHRcdFx0bGV0IGZpbmFsTGV2ZWw6IHN0cmluZyB8IG51bWJlclxuXHRcdFx0aWYgKGxldmVsID09PSAnJykge1xuXHRcdFx0XHRjb25zdCBrZXkgPSBsZXZlbHMuc2xpY2UoMCwgaikuam9pbigpXG5cdFx0XHRcdGlmIChjb3VudGVyc1trZXldID09IG51bGwpIHtcblx0XHRcdFx0XHRjb3VudGVyc1trZXldID0gQXJyYXkuaXNBcnJheShjdXJzb3IpID8gY3Vyc29yLmxlbmd0aCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0XHRmaW5hbExldmVsID0gY291bnRlcnNba2V5XSsrXG5cdFx0XHR9XG5cdFx0XHQvLyBEaXNhbGxvdyBkaXJlY3QgcHJvdG90eXBlIHBvbGx1dGlvblxuXHRcdFx0ZWxzZSBpZiAobGV2ZWwgPT09ICdfX3Byb3RvX18nKSBicmVha1xuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGZpbmFsTGV2ZWwgPSBsZXZlbFxuXHRcdFx0fVxuXHRcdFx0aWYgKGogPT09IGxldmVscy5sZW5ndGggLSAxKSBjdXJzb3JbZmluYWxMZXZlbF0gPSB2YWx1ZVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdC8vIFJlYWQgb3duIHByb3BlcnRpZXMgZXhjbHVzaXZlbHkgdG8gZGlzYWxsb3cgaW5kaXJlY3Rcblx0XHRcdFx0Ly8gcHJvdG90eXBlIHBvbGx1dGlvblxuXHRcdFx0XHRjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjdXJzb3IsIGZpbmFsTGV2ZWwpXG5cdFx0XHRcdGxldCBkZXNjVmFsdWUgPSBkZXNjICE9IG51bGwgPyBkZXNjLnZhbHVlIDogdW5kZWZpbmVkXG5cdFx0XHRcdGlmIChkZXNjVmFsdWUgPT0gbnVsbCkgY3Vyc29yW2ZpbmFsTGV2ZWxdID0gZGVzY1ZhbHVlID0gaXNOdW1iZXIgPyBbXSA6IHt9XG5cdFx0XHRcdGN1cnNvciA9IGRlc2NWYWx1ZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZGF0YVxufVxuIiwKICAgICJpbXBvcnQgcGFyc2VRdWVyeVN0cmluZyBmcm9tICcuLi9xdWVyeXN0cmluZy9wYXJzZSdcblxuLy8gUmV0dXJucyBge3BhdGgsIHBhcmFtc31gIGZyb20gYHVybGBcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlUGF0aG5hbWUodXJsOiBzdHJpbmcpOiB7cGF0aDogc3RyaW5nOyBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT59IHtcblx0Y29uc3QgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/Jylcblx0Y29uc3QgaGFzaEluZGV4ID0gdXJsLmluZGV4T2YoJyMnKVxuXHRjb25zdCBxdWVyeUVuZCA9IGhhc2hJbmRleCA8IDAgPyB1cmwubGVuZ3RoIDogaGFzaEluZGV4XG5cdGNvbnN0IHBhdGhFbmQgPSBxdWVyeUluZGV4IDwgMCA/IHF1ZXJ5RW5kIDogcXVlcnlJbmRleFxuXHRsZXQgcGF0aCA9IHVybC5zbGljZSgwLCBwYXRoRW5kKS5yZXBsYWNlKC9cXC97Mix9L2csICcvJylcblxuXHRpZiAoIXBhdGgpIHBhdGggPSAnLydcblx0ZWxzZSB7XG5cdFx0aWYgKHBhdGhbMF0gIT09ICcvJykgcGF0aCA9ICcvJyArIHBhdGhcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHBhdGg6IHBhdGgsXG5cdFx0cGFyYW1zOiBxdWVyeUluZGV4IDwgMFxuXHRcdFx0PyB7fVxuXHRcdFx0OiBwYXJzZVF1ZXJ5U3RyaW5nKHVybC5zbGljZShxdWVyeUluZGV4ICsgMSwgcXVlcnlFbmQpKSxcblx0fVxufVxuIiwKICAgICJpbXBvcnQgcGFyc2VQYXRobmFtZSBmcm9tICcuL3BhcnNlJ1xuXG5pbnRlcmZhY2UgQ29tcGlsZWRUZW1wbGF0ZSB7XG5cdChkYXRhOiB7cGF0aDogc3RyaW5nOyBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT59KTogYm9vbGVhblxufVxuXG4vLyBDb21waWxlcyBhIHRlbXBsYXRlIGludG8gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgcmVzb2x2ZWQgcGF0aCAod2l0aG91dCBxdWVyeVxuLy8gc3RyaW5ncykgYW5kIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHRlbXBsYXRlIHBhcmFtZXRlcnMgd2l0aCB0aGVpclxuLy8gcGFyc2VkIHZhbHVlcy4gVGhpcyBleHBlY3RzIHRoZSBpbnB1dCBvZiB0aGUgY29tcGlsZWQgdGVtcGxhdGUgdG8gYmUgdGhlXG4vLyBvdXRwdXQgb2YgYHBhcnNlUGF0aG5hbWVgLiBOb3RlIHRoYXQgaXQgZG9lcyAqbm90KiByZW1vdmUgcXVlcnkgcGFyYW1ldGVyc1xuLy8gc3BlY2lmaWVkIGluIHRoZSB0ZW1wbGF0ZS5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZTogc3RyaW5nKTogQ29tcGlsZWRUZW1wbGF0ZSB7XG5cdGNvbnN0IHRlbXBsYXRlRGF0YSA9IHBhcnNlUGF0aG5hbWUodGVtcGxhdGUpXG5cdGNvbnN0IHRlbXBsYXRlS2V5cyA9IE9iamVjdC5rZXlzKHRlbXBsYXRlRGF0YS5wYXJhbXMpXG5cdGNvbnN0IGtleXM6IEFycmF5PHtrOiBzdHJpbmc7IHI6IGJvb2xlYW59PiA9IFtdXG5cdGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ14nICsgdGVtcGxhdGVEYXRhLnBhdGgucmVwbGFjZShcblx0XHQvLyBJIGVzY2FwZSBsaXRlcmFsIHRleHQgc28gcGVvcGxlIGNhbiB1c2UgdGhpbmdzIGxpa2UgYDpmaWxlLjpleHRgIG9yXG5cdFx0Ly8gYDpsYW5nLTpsb2NhbGVgIGluIHJvdXRlcy4gVGhpcyBpcyBhbGwgbWVyZ2VkIGludG8gb25lIHBhc3Mgc28gSVxuXHRcdC8vIGRvbid0IGFsc28gYWNjaWRlbnRhbGx5IGVzY2FwZSBgLWAgYW5kIG1ha2UgaXQgaGFyZGVyIHRvIGRldGVjdCBpdCB0b1xuXHRcdC8vIGJhbiBpdCBmcm9tIHRlbXBsYXRlIHBhcmFtZXRlcnMuXG5cdFx0LzooW15cXC8uLV0rKShcXC57M318XFwuKD8hXFwuKXwtKT98W1xcXFxeJCorLigpfFxcW1xcXXt9XS9nLFxuXHRcdGZ1bmN0aW9uKG0sIGtleSwgZXh0cmEpIHtcblx0XHRcdGlmIChrZXkgPT0gbnVsbCkgcmV0dXJuICdcXFxcJyArIG1cblx0XHRcdGtleXMucHVzaCh7azoga2V5LCByOiBleHRyYSA9PT0gJy4uLid9KVxuXHRcdFx0aWYgKGV4dHJhID09PSAnLi4uJykgcmV0dXJuICcoLiopJ1xuXHRcdFx0aWYgKGV4dHJhID09PSAnLicpIHJldHVybiAnKFteL10rKVxcXFwuJ1xuXHRcdFx0cmV0dXJuICcoW14vXSspJyArIChleHRyYSB8fCAnJylcblx0XHR9LFxuXHQpICsgJ1xcXFwvPyQnKVxuXHRyZXR1cm4gZnVuY3Rpb24oZGF0YToge3BhdGg6IHN0cmluZzsgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+fSk6IGJvb2xlYW4ge1xuXHRcdC8vIEZpcnN0LCBjaGVjayB0aGUgcGFyYW1zLiBVc3VhbGx5LCB0aGVyZSBpc24ndCBhbnksIGFuZCBpdCdzIGp1c3Rcblx0XHQvLyBjaGVja2luZyBhIHN0YXRpYyBzZXQuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0ZW1wbGF0ZUtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0ZW1wbGF0ZURhdGEucGFyYW1zW3RlbXBsYXRlS2V5c1tpXV0gIT09IGRhdGEucGFyYW1zW3RlbXBsYXRlS2V5c1tpXV0pIHJldHVybiBmYWxzZVxuXHRcdH1cblx0XHQvLyBJZiBubyBpbnRlcnBvbGF0aW9ucyBleGlzdCwgbGV0J3Mgc2tpcCBhbGwgdGhlIGNlcmVtb255XG5cdFx0aWYgKCFrZXlzLmxlbmd0aCkgcmV0dXJuIHJlZ2V4cC50ZXN0KGRhdGEucGF0aClcblx0XHRjb25zdCB2YWx1ZXMgPSByZWdleHAuZXhlYyhkYXRhLnBhdGgpXG5cdFx0aWYgKHZhbHVlcyA9PSBudWxsKSByZXR1cm4gZmFsc2Vcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGRhdGEucGFyYW1zW2tleXNbaV0ua10gPSBrZXlzW2ldLnIgPyB2YWx1ZXNbaSArIDFdIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tpICsgMV0pXG5cdFx0fVxuXHRcdHJldHVybiB0cnVlXG5cdH1cbn1cbiIsCiAgICAiLy8gTm90ZTogdGhpcyBpcyBtaWxkbHkgcGVyZi1zZW5zaXRpdmUuXG4vL1xuLy8gSXQgZG9lcyAqbm90KiB1c2UgYGRlbGV0ZWAgLSBkeW5hbWljIGBkZWxldGVgcyB1c3VhbGx5IGNhdXNlIG9iamVjdHMgdG8gYmFpbFxuLy8gb3V0IGludG8gZGljdGlvbmFyeSBtb2RlIGFuZCBqdXN0IGdlbmVyYWxseSBjYXVzZSBhIGJ1bmNoIG9mIG9wdGltaXphdGlvblxuLy8gaXNzdWVzIHdpdGhpbiBlbmdpbmVzLlxuLy9cbi8vIElkZWFsbHksIEkgd291bGQndmUgcHJlZmVycmVkIHRvIGRvIHRoaXMsIGlmIGl0IHdlcmVuJ3QgZm9yIHRoZSBvcHRpbWl6YXRpb25cbi8vIGlzc3Vlczpcbi8vXG4vLyBgYGB0c1xuLy8gY29uc3QgaGFzT3duID0gcmVxdWlyZShcIi4vaGFzT3duXCIpXG4vLyBjb25zdCBtYWdpYyA9IFtcbi8vICAgICBcImtleVwiLCBcIm9uaW5pdFwiLCBcIm9uY3JlYXRlXCIsIFwib25iZWZvcmV1cGRhdGVcIiwgXCJvbnVwZGF0ZVwiLFxuLy8gICAgIFwib25iZWZvcmVyZW1vdmVcIiwgXCJvbnJlbW92ZVwiLFxuLy8gXVxuLy8gZXhwb3J0IGRlZmF1bHQgKGF0dHJzLCBleHRyYXMpID0+IHtcbi8vICAgICBjb25zdCByZXN1bHQgPSBPYmplY3QuYXNzaWduKE9iamVjdC5jcmVhdGUobnVsbCksIGF0dHJzKVxuLy8gICAgIGZvciAoY29uc3Qga2V5IG9mIG1hZ2ljKSBkZWxldGUgcmVzdWx0W2tleV1cbi8vICAgICBpZiAoZXh0cmFzICE9IG51bGwpIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhcykgZGVsZXRlIHJlc3VsdFtrZXldXG4vLyAgICAgcmV0dXJuIHJlc3VsdFxuLy8gfVxuLy8gYGBgXG5cbmltcG9ydCBoYXNPd24gZnJvbSAnLi9oYXNPd24nXG5cbmNvbnN0IG1hZ2ljID0gL14oPzprZXl8b25pbml0fG9uY3JlYXRlfG9uYmVmb3JldXBkYXRlfG9udXBkYXRlfG9uYmVmb3JlcmVtb3ZlfG9ucmVtb3ZlKSQvXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNlbnNvcihhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiwgZXh0cmFzPzogc3RyaW5nW10pOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcblx0Y29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblxuXHRpZiAoZXh0cmFzICE9IG51bGwpIHtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuXHRcdFx0aWYgKGhhc093bi5jYWxsKGF0dHJzLCBrZXkpICYmICFtYWdpYy50ZXN0KGtleSkgJiYgZXh0cmFzLmluZGV4T2Yoa2V5KSA8IDApIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyc1trZXldXG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG5cdFx0XHRpZiAoaGFzT3duLmNhbGwoYXR0cnMsIGtleSkgJiYgIW1hZ2ljLnRlc3Qoa2V5KSkge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJzW2tleV1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0XG59XG4iLAogICAgIi8qKlxuICogSXNvbW9ycGhpYyBVUkkgQVBJIC0gd29ya3MgaW4gYm90aCBTU1IgKHNlcnZlcikgYW5kIGJyb3dzZXIgY29udGV4dHNcbiAqL1xuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBmdWxsIFVSTCAoaHJlZilcbiAqIFJldHVybnMgd2luZG93LmxvY2F0aW9uLmhyZWYgaW4gYnJvd3Nlciwgb3Igc2VydmVyJ3MgcmVxdWVzdCBVUkwgZHVyaW5nIFNTUlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFVybCgpOiBzdHJpbmcge1xuXHQvLyBQcmVmZXIgYnJvd3NlciBsb2NhdGlvbiB3aGVuIGF2YWlsYWJsZSAobW9yZSBkaXJlY3QpXG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pIHtcblx0XHRyZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWZcblx0fVxuXHRcblx0Ly8gRmFsbCBiYWNrIHRvIFNTUiBzZXJ2ZXIgVVJMICh3aGVuIGNsaWVudCBjb2RlIHJ1bnMgb24gc2VydmVyKVxuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnICYmIChnbG9iYWxUaGlzIGFzIGFueSkuX19TU1JfVVJMX18pIHtcblx0XHRyZXR1cm4gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1NTUl9VUkxfX1xuXHR9XG5cdFxuXHQvLyBGYWxsYmFjayAoc2hvdWxkbid0IGhhcHBlbilcblx0cmV0dXJuICcnXG59XG5cbi8qKlxuICogUGFyc2UgYSBVUkwgc3RyaW5nIGludG8gaXRzIGNvbXBvbmVudHNcbiAqL1xuZnVuY3Rpb24gcGFyc2VVcmwodXJsOiBzdHJpbmcpOiBVUkwge1xuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgVVJMKHVybClcblx0fSBjYXRjaCB7XG5cdFx0Ly8gRmFsbGJhY2sgZm9yIHJlbGF0aXZlIFVSTHNcblx0XHRyZXR1cm4gbmV3IFVSTCh1cmwsICdodHRwOi8vbG9jYWxob3N0Jylcblx0fVxufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBwYXRobmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aG5hbWUoKTogc3RyaW5nIHtcblx0Ly8gUHJlZmVyIGJyb3dzZXIgbG9jYXRpb24gd2hlbiBhdmFpbGFibGUgKG1vcmUgZGlyZWN0KVxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uKSB7XG5cdFx0cmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSB8fCAnLydcblx0fVxuXHRcblx0Ly8gRmFsbCBiYWNrIHRvIHBhcnNpbmcgU1NSIFVSTFxuXHRjb25zdCB1cmwgPSBnZXRDdXJyZW50VXJsKClcblx0aWYgKCF1cmwpIHJldHVybiAnLydcblx0XG5cdGNvbnN0IHBhcnNlZCA9IHBhcnNlVXJsKHVybClcblx0cmV0dXJuIHBhcnNlZC5wYXRobmFtZSB8fCAnLydcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgc2VhcmNoIHN0cmluZyAocXVlcnkgc3RyaW5nKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VhcmNoKCk6IHN0cmluZyB7XG5cdC8vIFByZWZlciBicm93c2VyIGxvY2F0aW9uIHdoZW4gYXZhaWxhYmxlIChtb3JlIGRpcmVjdClcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24uc2VhcmNoIHx8ICcnXG5cdH1cblx0XG5cdC8vIEZhbGwgYmFjayB0byBwYXJzaW5nIFNTUiBVUkxcblx0Y29uc3QgdXJsID0gZ2V0Q3VycmVudFVybCgpXG5cdGlmICghdXJsKSByZXR1cm4gJydcblx0XG5cdGNvbnN0IHBhcnNlZCA9IHBhcnNlVXJsKHVybClcblx0cmV0dXJuIHBhcnNlZC5zZWFyY2ggfHwgJydcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgaGFzaFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFzaCgpOiBzdHJpbmcge1xuXHQvLyBQcmVmZXIgYnJvd3NlciBsb2NhdGlvbiB3aGVuIGF2YWlsYWJsZSAobW9yZSBkaXJlY3QpXG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pIHtcblx0XHRyZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2ggfHwgJydcblx0fVxuXHRcblx0Ly8gRmFsbCBiYWNrIHRvIHBhcnNpbmcgU1NSIFVSTFxuXHRjb25zdCB1cmwgPSBnZXRDdXJyZW50VXJsKClcblx0aWYgKCF1cmwpIHJldHVybiAnJ1xuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4gcGFyc2VkLmhhc2ggfHwgJydcbn1cblxuLyoqXG4gKiBHZXQgYSBMb2NhdGlvbi1saWtlIG9iamVjdCB3aXRoIGFsbCBwcm9wZXJ0aWVzXG4gKiBDb21wYXRpYmxlIHdpdGggYnJvd3NlciBMb2NhdGlvbiBBUElcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJc29tb3JwaGljTG9jYXRpb24ge1xuXHRocmVmOiBzdHJpbmdcblx0cGF0aG5hbWU6IHN0cmluZ1xuXHRzZWFyY2g6IHN0cmluZ1xuXHRoYXNoOiBzdHJpbmdcblx0b3JpZ2luPzogc3RyaW5nXG5cdGhvc3Q/OiBzdHJpbmdcblx0aG9zdG5hbWU/OiBzdHJpbmdcblx0cG9ydD86IHN0cmluZ1xuXHRwcm90b2NvbD86IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYXRpb24oKTogSXNvbW9ycGhpY0xvY2F0aW9uIHtcblx0Y29uc3QgdXJsID0gZ2V0Q3VycmVudFVybCgpXG5cdGlmICghdXJsKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGhyZWY6ICcnLFxuXHRcdFx0cGF0aG5hbWU6ICcvJyxcblx0XHRcdHNlYXJjaDogJycsXG5cdFx0XHRoYXNoOiAnJyxcblx0XHR9XG5cdH1cblx0XG5cdGNvbnN0IHBhcnNlZCA9IHBhcnNlVXJsKHVybClcblx0cmV0dXJuIHtcblx0XHRocmVmOiBwYXJzZWQuaHJlZixcblx0XHRwYXRobmFtZTogcGFyc2VkLnBhdGhuYW1lIHx8ICcvJyxcblx0XHRzZWFyY2g6IHBhcnNlZC5zZWFyY2ggfHwgJycsXG5cdFx0aGFzaDogcGFyc2VkLmhhc2ggfHwgJycsXG5cdFx0b3JpZ2luOiBwYXJzZWQub3JpZ2luLFxuXHRcdGhvc3Q6IHBhcnNlZC5ob3N0LFxuXHRcdGhvc3RuYW1lOiBwYXJzZWQuaG9zdG5hbWUsXG5cdFx0cG9ydDogcGFyc2VkLnBvcnQsXG5cdFx0cHJvdG9jb2w6IHBhcnNlZC5wcm90b2NvbCxcblx0fVxufVxuIiwKICAgICIvKipcbiAqIElzb21vcnBoaWMgbG9nZ2VyIHdpdGggY29sb3JzIGFuZCBzdHJ1Y3R1cmVkIGxvZ2dpbmcuXG4gKiBXb3JrcyBpbiBib3RoIHNlcnZlciAoQnVuL05vZGUpIGFuZCBjbGllbnQgKGJyb3dzZXIpIGVudmlyb25tZW50cy5cbiAqIFByb3ZpZGVzIGluZm8sIGRlYnVnLCB3YXJuaW5nLCBhbmQgZXJyb3IgbG9nIGxldmVscyB3aXRoIGFwcHJvcHJpYXRlIGZvcm1hdHRpbmcuXG4gKi9cblxuLy8gRGV0ZWN0IGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBicm93c2VyIGVudmlyb25tZW50XG5jb25zdCBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG5cbi8vIEFOU0kgY29sb3IgY29kZXMgZm9yIHRlcm1pbmFsIG91dHB1dCAoc2VydmVyIG9ubHkpXG5jb25zdCBjb2xvcnMgPSB7XG5cdHJlc2V0OiAnXFx4MWJbMG0nLFxuXHRicmlnaHQ6ICdcXHgxYlsxbScsXG5cdGRpbTogJ1xceDFiWzJtJyxcblx0XG5cdC8vIFRleHQgY29sb3JzXG5cdGJsYWNrOiAnXFx4MWJbMzBtJyxcblx0cmVkOiAnXFx4MWJbMzFtJyxcblx0Z3JlZW46ICdcXHgxYlszMm0nLFxuXHR5ZWxsb3c6ICdcXHgxYlszM20nLFxuXHRibHVlOiAnXFx4MWJbMzRtJyxcblx0bWFnZW50YTogJ1xceDFiWzM1bScsXG5cdGN5YW46ICdcXHgxYlszNm0nLFxuXHR3aGl0ZTogJ1xceDFiWzM3bScsXG5cdFxuXHQvLyBCYWNrZ3JvdW5kIGNvbG9yc1xuXHRiZ0JsYWNrOiAnXFx4MWJbNDBtJyxcblx0YmdSZWQ6ICdcXHgxYls0MW0nLFxuXHRiZ0dyZWVuOiAnXFx4MWJbNDJtJyxcblx0YmdZZWxsb3c6ICdcXHgxYls0M20nLFxuXHRiZ0JsdWU6ICdcXHgxYls0NG0nLFxuXHRiZ01hZ2VudGE6ICdcXHgxYls0NW0nLFxuXHRiZ0N5YW46ICdcXHgxYls0Nm0nLFxuXHRiZ1doaXRlOiAnXFx4MWJbNDdtJyxcbn1cblxuLy8gQ2hlY2sgaWYgY29sb3JzIHNob3VsZCBiZSBlbmFibGVkIChzZXJ2ZXIgb25seSwgZGVmYXVsdDogdHJ1ZSwgY2FuIGJlIGRpc2FibGVkIHdpdGggTk9fQ09MT1IgZW52IHZhcilcbmNvbnN0IGVuYWJsZUNvbG9ycyA9ICFpc0Jyb3dzZXIgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52Lk5PX0NPTE9SICE9PSAnMScgJiYgcHJvY2Vzcy5lbnYuTk9fQ09MT1IgIT09ICd0cnVlJ1xuXG5mdW5jdGlvbiBjb2xvcml6ZSh0ZXh0OiBzdHJpbmcsIGNvbG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gZW5hYmxlQ29sb3JzID8gYCR7Y29sb3J9JHt0ZXh0fSR7Y29sb3JzLnJlc2V0fWAgOiB0ZXh0XG59XG5cbmZ1bmN0aW9uIGdldFRpbWVzdGFtcCgpOiBzdHJpbmcge1xuXHRjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG5cdGNvbnN0IGhvdXJzID0gU3RyaW5nKG5vdy5nZXRIb3VycygpKS5wYWRTdGFydCgyLCAnMCcpXG5cdGNvbnN0IG1pbnV0ZXMgPSBTdHJpbmcobm93LmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgJzAnKVxuXHRjb25zdCBzZWNvbmRzID0gU3RyaW5nKG5vdy5nZXRTZWNvbmRzKCkpLnBhZFN0YXJ0KDIsICcwJylcblx0Y29uc3QgbXMgPSBTdHJpbmcobm93LmdldE1pbGxpc2Vjb25kcygpKS5wYWRTdGFydCgzLCAnMCcpXG5cdHJldHVybiBgJHtob3Vyc306JHttaW51dGVzfToke3NlY29uZHN9LiR7bXN9YFxufVxuXG5mdW5jdGlvbiBmb3JtYXRMZXZlbChsZXZlbDogJ2luZm8nIHwgJ2RlYnVnJyB8ICd3YXJuJyB8ICdlcnJvcicpOiBzdHJpbmcge1xuXHRjb25zdCBsZXZlbE1hcCA9IHtcblx0XHRpbmZvOiBjb2xvcml6ZSgnSU5GTycsIGNvbG9ycy5icmlnaHQgKyBjb2xvcnMuY3lhbiksXG5cdFx0ZGVidWc6IGNvbG9yaXplKCdERUJVRycsIGNvbG9ycy5icmlnaHQgKyBjb2xvcnMuYmx1ZSksXG5cdFx0d2FybjogY29sb3JpemUoJ1dBUk4nLCBjb2xvcnMuYnJpZ2h0ICsgY29sb3JzLnllbGxvdyksXG5cdFx0ZXJyb3I6IGNvbG9yaXplKCdFUlJPUicsIGNvbG9ycy5icmlnaHQgKyBjb2xvcnMucmVkKSxcblx0fVxuXHRyZXR1cm4gbGV2ZWxNYXBbbGV2ZWxdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nQ29udGV4dCB7XG5cdHBhdGhuYW1lPzogc3RyaW5nXG5cdG1ldGhvZD86IHN0cmluZ1xuXHRzZXNzaW9uSWQ/OiBzdHJpbmdcblx0cm91dGU/OiBzdHJpbmdcblx0bW9kdWxlPzogc3RyaW5nIC8vIE1vZHVsZSBuYW1lIChlLmcuLCAnaWRlbnRpdHknLCAnb3JkZXInKSAtIHdpbGwgYmUgc2hvd24gYXMgW21vZHVsZV0gcHJlZml4XG5cdFtrZXk6IHN0cmluZ106IGFueVxufVxuXG5jbGFzcyBMb2dnZXIge1xuXHQvLyBEZWZhdWx0IHByZWZpeDogW1NTUl0gZm9yIHNlcnZlciBpbmZyYXN0cnVjdHVyZSwgW0FQUF0gZm9yIGFwcGxpY2F0aW9uIGNvZGVcblx0cHJpdmF0ZSBwcmVmaXg6IHN0cmluZyA9ICdbU1NSXSdcblx0XG5cdC8qKlxuXHQgKiBTZXQgdGhlIGxvZyBwcmVmaXggKGRlZmF1bHQ6ICdbU1NSXScgZm9yIGluZnJhc3RydWN0dXJlLCAnW0FQUF0nIGZvciBhcHBsaWNhdGlvbiBjb2RlKVxuXHQgKi9cblx0c2V0UHJlZml4KHByZWZpeDogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5wcmVmaXggPSBwcmVmaXhcblx0fVxuXHRcblx0cHJpdmF0ZSBmb3JtYXRNZXNzYWdlKGxldmVsOiAnaW5mbycgfCAnZGVidWcnIHwgJ3dhcm4nIHwgJ2Vycm9yJywgbWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogTG9nQ29udGV4dCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgdGltZXN0YW1wID0gY29sb3JpemUoZ2V0VGltZXN0YW1wKCksIGNvbG9ycy5kaW0gKyBjb2xvcnMud2hpdGUpXG5cdFx0Y29uc3QgbGV2ZWxTdHIgPSBmb3JtYXRMZXZlbChsZXZlbClcblx0XHRcblx0XHQvLyBBbHdheXMgdXNlIHRoZSBzZXQgcHJlZml4IChlLmcuLCBbQVBQXSBvciBbU1NSXSlcblx0XHRjb25zdCBwcmVmaXhTdHIgPSBjb2xvcml6ZSh0aGlzLnByZWZpeCwgdGhpcy5wcmVmaXggPT09ICdbU1NSXScgPyBjb2xvcnMuYnJpZ2h0ICsgY29sb3JzLm1hZ2VudGEgOiBjb2xvcnMuYnJpZ2h0ICsgY29sb3JzLmN5YW4pXG5cdFx0XG5cdFx0Ly8gSW5jbHVkZSBtb2R1bGUgaW4gbWVzc2FnZSBpZiBwcm92aWRlZFxuXHRcdGxldCBkaXNwbGF5TWVzc2FnZSA9IG1lc3NhZ2Vcblx0XHRpZiAoY29udGV4dD8ubW9kdWxlKSB7XG5cdFx0XHRkaXNwbGF5TWVzc2FnZSA9IGBbJHtjb250ZXh0Lm1vZHVsZX1dICR7bWVzc2FnZX1gXG5cdFx0fVxuXHRcdFxuXHRcdGxldCBjb250ZXh0U3RyID0gJydcblx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzOiBzdHJpbmdbXSA9IFtdXG5cdFx0XHRpZiAoY29udGV4dC5tZXRob2QpIHtcblx0XHRcdFx0Y29udGV4dFBhcnRzLnB1c2goY29sb3JpemUoY29udGV4dC5tZXRob2QsIGNvbG9ycy5jeWFuKSlcblx0XHRcdH1cblx0XHRcdGlmIChjb250ZXh0LnBhdGhuYW1lKSB7XG5cdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGNvbnRleHQucGF0aG5hbWUsIGNvbG9ycy5ncmVlbikpXG5cdFx0XHR9XG5cdFx0XHRpZiAoY29udGV4dC5yb3V0ZSkge1xuXHRcdFx0XHRjb250ZXh0UGFydHMucHVzaChjb2xvcml6ZShgcm91dGU6JHtjb250ZXh0LnJvdXRlfWAsIGNvbG9ycy5ibHVlKSlcblx0XHRcdH1cblx0XHRcdGlmIChjb250ZXh0LnNlc3Npb25JZCkge1xuXHRcdFx0XHRjb250ZXh0UGFydHMucHVzaChjb2xvcml6ZShgc2Vzc2lvbjoke2NvbnRleHQuc2Vzc2lvbklkLnNsaWNlKDAsIDgpfS4uLmAsIGNvbG9ycy5kaW0gKyBjb2xvcnMud2hpdGUpKVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBBZGQgYW55IGFkZGl0aW9uYWwgY29udGV4dCBmaWVsZHMgKGV4Y2x1ZGluZyBtb2R1bGUgd2hpY2ggaXMgc2hvd24gaW4gbWVzc2FnZSlcblx0XHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbnRleHQpKSB7XG5cdFx0XHRcdGlmICghWydtZXRob2QnLCAncGF0aG5hbWUnLCAncm91dGUnLCAnc2Vzc2lvbklkJywgJ21vZHVsZSddLmluY2x1ZGVzKGtleSkpIHtcblx0XHRcdFx0XHRjb250ZXh0UGFydHMucHVzaChjb2xvcml6ZShgJHtrZXl9OiR7dmFsdWV9YCwgY29sb3JzLmRpbSArIGNvbG9ycy53aGl0ZSkpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnRleHRTdHIgPSAnICcgKyBjb250ZXh0UGFydHMuam9pbignICcpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBgJHt0aW1lc3RhbXB9ICR7cHJlZml4U3RyfSAke2xldmVsU3RyfSR7Y29udGV4dFN0cn0gJHtkaXNwbGF5TWVzc2FnZX1gXG5cdH1cblx0XG5cdHByaXZhdGUgZm9ybWF0Q29udGV4dEZvckJyb3dzZXIoY29udGV4dD86IExvZ0NvbnRleHQpOiBzdHJpbmdbXSB7XG5cdFx0aWYgKCFjb250ZXh0KSByZXR1cm4gW11cblx0XHRcblx0XHRjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuXHRcdGlmIChjb250ZXh0Lm1ldGhvZCkgcGFydHMucHVzaChgTWV0aG9kOiAke2NvbnRleHQubWV0aG9kfWApXG5cdFx0aWYgKGNvbnRleHQucGF0aG5hbWUpIHBhcnRzLnB1c2goYFBhdGg6ICR7Y29udGV4dC5wYXRobmFtZX1gKVxuXHRcdGlmIChjb250ZXh0LnJvdXRlKSBwYXJ0cy5wdXNoKGBSb3V0ZTogJHtjb250ZXh0LnJvdXRlfWApXG5cdFx0aWYgKGNvbnRleHQuc2Vzc2lvbklkKSBwYXJ0cy5wdXNoKGBTZXNzaW9uOiAke2NvbnRleHQuc2Vzc2lvbklkLnNsaWNlKDAsIDgpfS4uLmApXG5cdFx0XG5cdFx0Ly8gQWRkIGFueSBhZGRpdGlvbmFsIGNvbnRleHQgZmllbGRzIChleGNsdWRpbmcgbW9kdWxlIHdoaWNoIGlzIHVzZWQgYXMgcHJlZml4KVxuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbnRleHQpKSB7XG5cdFx0XHRpZiAoIVsnbWV0aG9kJywgJ3BhdGhuYW1lJywgJ3JvdXRlJywgJ3Nlc3Npb25JZCcsICdtb2R1bGUnXS5pbmNsdWRlcyhrZXkpKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYCR7a2V5fTogJHt2YWx1ZX1gKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gcGFydHNcblx0fVxuXHRcblx0cHJpdmF0ZSBnZXREaXNwbGF5UHJlZml4KGNvbnRleHQ/OiBMb2dDb250ZXh0KTogc3RyaW5nIHtcblx0XHQvLyBBbHdheXMgdXNlIHRoZSBzZXQgcHJlZml4IChlLmcuLCBbY2xpZW50XSBvciBbU1NSXSlcblx0XHRyZXR1cm4gdGhpcy5wcmVmaXhcblx0fVxuXHRcblx0cHJpdmF0ZSBnZXREaXNwbGF5TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogc3RyaW5nIHtcblx0XHQvLyBJbmNsdWRlIG1vZHVsZSBpbiBtZXNzYWdlIGlmIHByb3ZpZGVkXG5cdFx0aWYgKGNvbnRleHQ/Lm1vZHVsZSkge1xuXHRcdFx0cmV0dXJuIGBbJHtjb250ZXh0Lm1vZHVsZX1dICR7bWVzc2FnZX1gXG5cdFx0fVxuXHRcdHJldHVybiBtZXNzYWdlXG5cdH1cblx0XG5cdGluZm8obWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogTG9nQ29udGV4dCk6IHZvaWQge1xuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXJ0cyA9IHRoaXMuZm9ybWF0Q29udGV4dEZvckJyb3dzZXIoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlQcmVmaXggPSB0aGlzLmdldERpc3BsYXlQcmVmaXgoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlNZXNzYWdlID0gdGhpcy5nZXREaXNwbGF5TWVzc2FnZShtZXNzYWdlLCBjb250ZXh0KVxuXHRcdFx0Ly8gVXNlIG11bHRpcGxlICVjIGZvciBkaWZmZXJlbnQgY29sb3JlZCBwYXJ0czogcHJlZml4LCBsZXZlbCwgbWVzc2FnZVxuXHRcdFx0Y29uc3QgcHJlZml4U3R5bGUgPSBkaXNwbGF5UHJlZml4ID09PSAnW1NTUl0nID8gJ2NvbG9yOiAjZDk0NmVmOyBmb250LXdlaWdodDogYm9sZCcgOiAnY29sb3I6ICMzYjgyZjY7IGZvbnQtd2VpZ2h0OiBib2xkJ1xuXHRcdFx0Y29uc3QgbGV2ZWxTdHlsZSA9ICdjb2xvcjogIzIyZDNlZTsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRcblx0XHRcdGlmIChjb250ZXh0UGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBJTkZPJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdFx0Y29udGV4dFBhcnRzLmZvckVhY2gocGFydCA9PiBjb25zb2xlLmxvZyhgICAke3BhcnR9YCkpXG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYCVjJHtkaXNwbGF5UHJlZml4fSVjIElORk8lYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLmZvcm1hdE1lc3NhZ2UoJ2luZm8nLCBtZXNzYWdlLCBjb250ZXh0KSlcblx0XHR9XG5cdH1cblx0XG5cdGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IExvZ0NvbnRleHQpOiB2b2lkIHtcblx0XHQvLyBPbmx5IGxvZyBkZWJ1ZyBtZXNzYWdlcyBpbiBTU1IgbW9kZSBvciBicm93c2VyIGRldiBtb2RlXG5cdFx0Y29uc3Qgc2hvdWxkTG9nID0gZ2xvYmFsVGhpcy5fX1NTUl9NT0RFX18gfHwgKGlzQnJvd3NlciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnY/Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpXG5cdFx0XG5cdFx0aWYgKCFzaG91bGRMb2cpIHJldHVyblxuXHRcdFxuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXJ0cyA9IHRoaXMuZm9ybWF0Q29udGV4dEZvckJyb3dzZXIoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlQcmVmaXggPSB0aGlzLmdldERpc3BsYXlQcmVmaXgoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlNZXNzYWdlID0gdGhpcy5nZXREaXNwbGF5TWVzc2FnZShtZXNzYWdlLCBjb250ZXh0KVxuXHRcdFx0Y29uc3QgcHJlZml4U3R5bGUgPSBkaXNwbGF5UHJlZml4ID09PSAnW1NTUl0nID8gJ2NvbG9yOiAjZDk0NmVmOyBmb250LXdlaWdodDogYm9sZCcgOiAnY29sb3I6ICMzYjgyZjY7IGZvbnQtd2VpZ2h0OiBib2xkJ1xuXHRcdFx0Y29uc3QgbGV2ZWxTdHlsZSA9ICdjb2xvcjogIzRhZGU4MDsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRcblx0XHRcdGlmIChjb250ZXh0UGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBERUJVRyVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHRcdGNvbnRleHRQYXJ0cy5mb3JFYWNoKHBhcnQgPT4gY29uc29sZS5sb2coYCAgJHtwYXJ0fWApKVxuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBERUJVRyVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuZm9ybWF0TWVzc2FnZSgnZGVidWcnLCBtZXNzYWdlLCBjb250ZXh0KSlcblx0XHR9XG5cdH1cblx0XG5cdHdhcm4obWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogTG9nQ29udGV4dCk6IHZvaWQge1xuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXJ0cyA9IHRoaXMuZm9ybWF0Q29udGV4dEZvckJyb3dzZXIoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlQcmVmaXggPSB0aGlzLmdldERpc3BsYXlQcmVmaXgoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlNZXNzYWdlID0gdGhpcy5nZXREaXNwbGF5TWVzc2FnZShtZXNzYWdlLCBjb250ZXh0KVxuXHRcdFx0Y29uc3QgcHJlZml4U3R5bGUgPSBkaXNwbGF5UHJlZml4ID09PSAnW1NTUl0nID8gJ2NvbG9yOiAjZDk0NmVmOyBmb250LXdlaWdodDogYm9sZCcgOiAnY29sb3I6ICMzYjgyZjY7IGZvbnQtd2VpZ2h0OiBib2xkJ1xuXHRcdFx0Y29uc3QgbGV2ZWxTdHlsZSA9ICdjb2xvcjogI2ZiYmYyNDsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRcblx0XHRcdGlmIChjb250ZXh0UGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zb2xlLmdyb3VwKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBXQVJOJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdFx0Y29udGV4dFBhcnRzLmZvckVhY2gocGFydCA9PiBjb25zb2xlLndhcm4oYCAgJHtwYXJ0fWApKVxuXHRcdFx0XHRjb25zb2xlLmdyb3VwRW5kKClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgJWMke2Rpc3BsYXlQcmVmaXh9JWMgV0FSTiVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2Fybih0aGlzLmZvcm1hdE1lc3NhZ2UoJ3dhcm4nLCBtZXNzYWdlLCBjb250ZXh0KSlcblx0XHR9XG5cdH1cblx0XG5cdGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I/OiBFcnJvciB8IHVua25vd24sIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogdm9pZCB7XG5cdFx0Y29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG5cdFx0Y29uc3QgYmFzZU1lc3NhZ2UgPSBlcnJvciA/IGAke21lc3NhZ2V9OiAke2Vycm9yTWVzc2FnZX1gIDogbWVzc2FnZVxuXHRcdGNvbnN0IGRpc3BsYXlNZXNzYWdlID0gdGhpcy5nZXREaXNwbGF5TWVzc2FnZShiYXNlTWVzc2FnZSwgY29udGV4dClcblx0XHRcblx0XHRpZiAoaXNCcm93c2VyKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGFydHMgPSB0aGlzLmZvcm1hdENvbnRleHRGb3JCcm93c2VyKGNvbnRleHQpXG5cdFx0XHRjb25zdCBkaXNwbGF5UHJlZml4ID0gdGhpcy5nZXREaXNwbGF5UHJlZml4KGNvbnRleHQpXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjZWY0NDQ0OyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwIHx8IGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIEVSUk9SJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0Y29udGV4dFBhcnRzLmZvckVhY2gocGFydCA9PiBjb25zb2xlLmVycm9yKGAgICR7cGFydH1gKSlcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5zdGFjaykge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ1N0YWNrIHRyYWNlOicsIGVycm9yLnN0YWNrKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihgJWMke2Rpc3BsYXlQcmVmaXh9JWMgRVJST1IlYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuZm9ybWF0TWVzc2FnZSgnZXJyb3InLCBiYXNlTWVzc2FnZSwgY29udGV4dCkpXG5cdFx0XHRpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5zdGFjaykge1xuXHRcdFx0XHRjb25zdCBzdGFja1RyYWNlID0gY29sb3JpemUoZXJyb3Iuc3RhY2ssIGNvbG9ycy5kaW0gKyBjb2xvcnMucmVkKVxuXHRcdFx0XHRjb25zb2xlLmVycm9yKHN0YWNrVHJhY2UpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8vIERlZmF1bHQgbG9nZ2VyIGluc3RhbmNlIGZvciBhcHBsaWNhdGlvbiBjb2RlICh3aWxsIGJlIHNldCB0byBbQVBQXSBieSBhcHAgaW5pdGlhbGl6YXRpb24pXG5leHBvcnQgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cbi8vIEV4cG9ydCBMb2dnZXIgY2xhc3MgZm9yIGNyZWF0aW5nIGN1c3RvbSBpbnN0YW5jZXNcbmV4cG9ydCB7TG9nZ2VyfVxuIiwKICAgICIvKipcbiAqIFNTUi1zcGVjaWZpYyBsb2dnZXIgaW5zdGFuY2UuXG4gKiBTU1IgaW5mcmFzdHJ1Y3R1cmUgY29kZSBzaG91bGQgaW1wb3J0IHtsb2dnZXJ9IGZyb20gdGhpcyBmaWxlXG4gKiB0byBnZXQgYSBsb2dnZXIgaW5zdGFuY2Ugd2l0aCBbU1NSXSBwcmVmaXguXG4gKi9cblxuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4vbG9nZ2VyJ1xuXG4vLyBDcmVhdGUgU1NSIGxvZ2dlciBpbnN0YW5jZSB3aXRoIFtTU1JdIHByZWZpeFxuY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcigpXG5sb2dnZXIuc2V0UHJlZml4KCdbU1NSXScpXG5cbmV4cG9ydCB7bG9nZ2VyfVxuIiwKICAgICJpbXBvcnQgVm5vZGUgZnJvbSAnLi4vcmVuZGVyL3Zub2RlJ1xuaW1wb3J0IGh5cGVyc2NyaXB0IGZyb20gJy4uL3JlbmRlci9oeXBlcnNjcmlwdCdcbmltcG9ydCBkZWNvZGVVUklDb21wb25lbnRTYWZlIGZyb20gJy4uL3V0aWwvZGVjb2RlVVJJQ29tcG9uZW50U2FmZSdcbmltcG9ydCBidWlsZFBhdGhuYW1lIGZyb20gJy4uL3BhdGhuYW1lL2J1aWxkJ1xuaW1wb3J0IHBhcnNlUGF0aG5hbWUgZnJvbSAnLi4vcGF0aG5hbWUvcGFyc2UnXG5pbXBvcnQgY29tcGlsZVRlbXBsYXRlIGZyb20gJy4uL3BhdGhuYW1lL2NvbXBpbGVUZW1wbGF0ZSdcbmltcG9ydCBjZW5zb3IgZnJvbSAnLi4vdXRpbC9jZW5zb3InXG5pbXBvcnQge2dldFBhdGhuYW1lLCBnZXRTZWFyY2gsIGdldEhhc2h9IGZyb20gJy4uL3V0aWwvdXJpJ1xuaW1wb3J0IHtsb2dnZXJ9IGZyb20gJy4uL3NlcnZlci9zc3JMb2dnZXInXG5cbmltcG9ydCB0eXBlIHtDb21wb25lbnRUeXBlLCBWbm9kZSBhcyBWbm9kZVR5cGV9IGZyb20gJy4uL3JlbmRlci92bm9kZSdcblxuLy8gUmVkaXJlY3RPYmplY3Qgd2lsbCBiZSBkZWZpbmVkIGFmdGVyIFJFRElSRUNUIHN5bWJvbCBpcyBjcmVhdGVkXG4vLyBVc2luZyBhIHR5cGUgdGhhdCByZWZlcmVuY2VzIHRoZSBzeW1ib2wgaW5kaXJlY3RseVxuZXhwb3J0IHR5cGUgUmVkaXJlY3RPYmplY3QgPSB7W2tleTogc3ltYm9sXTogc3RyaW5nfVxuXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlUmVzb2x2ZXI8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4ge1xuXHRvbm1hdGNoPzogKFxuXHRcdGFyZ3M6IEF0dHJzLFxuXHRcdHJlcXVlc3RlZFBhdGg6IHN0cmluZyxcblx0XHRyb3V0ZTogc3RyaW5nLFxuXHQpID0+IENvbXBvbmVudFR5cGU8QXR0cnMsIFN0YXRlPiB8IFByb21pc2U8Q29tcG9uZW50VHlwZTxBdHRycywgU3RhdGU+PiB8IFJlZGlyZWN0T2JqZWN0IHwgUHJvbWlzZTxSZWRpcmVjdE9iamVjdD4gfCB2b2lkXG5cdHJlbmRlcj86ICh2bm9kZTogVm5vZGVUeXBlPEF0dHJzLCBTdGF0ZT4pID0+IFZub2RlVHlwZVxufVxuXG5leHBvcnQgdHlwZSBTU1JTdGF0ZSA9IFJlY29yZDxzdHJpbmcsIGFueT5cbmV4cG9ydCB0eXBlIFNTUlJlc3VsdCA9IHN0cmluZyB8IHtodG1sOiBzdHJpbmc7IHN0YXRlOiBTU1JTdGF0ZX1cblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZSB7XG5cdChwYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIGFueT4sIHNob3VsZFJlcGxhY2VIaXN0b3J5PzogYm9vbGVhbik6IHZvaWRcblx0KHBhdGg6IHN0cmluZywgY29tcG9uZW50OiBDb21wb25lbnRUeXBlLCBzaG91bGRSZXBsYWNlSGlzdG9yeT86IGJvb2xlYW4pOiB2b2lkXG5cdHNldDogKHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgYW55PiwgZGF0YT86IGFueSkgPT4gdm9pZFxuXHRnZXQ6ICgpID0+IHN0cmluZyB8IHVuZGVmaW5lZFxuXHRwcmVmaXg6IHN0cmluZ1xuXHRsaW5rOiAodm5vZGU6IFZub2RlVHlwZSkgPT4gc3RyaW5nXG5cdHBhcmFtOiAoa2V5Pzogc3RyaW5nKSA9PiBhbnlcblx0cGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cdExpbms6IENvbXBvbmVudFR5cGVcblx0U0tJUDoge31cblx0UkVESVJFQ1Q6IHN5bWJvbFxuXHRyZWRpcmVjdDogKHBhdGg6IHN0cmluZykgPT4gUmVkaXJlY3RPYmplY3Rcblx0cmVzb2x2ZTogKFxuXHRcdHBhdGhuYW1lOiBzdHJpbmcsXG5cdFx0cm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlciB8IHtjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyfT4sXG5cdFx0cmVuZGVyVG9TdHJpbmc6ICh2bm9kZXM6IGFueSkgPT4gUHJvbWlzZTxTU1JSZXN1bHQ+LFxuXHRcdHByZWZpeD86IHN0cmluZyxcblx0KSA9PiBQcm9taXNlPFNTUlJlc3VsdD5cbn1cblxuaW50ZXJmYWNlIE1vdW50UmVkcmF3IHtcblx0bW91bnQ6IChyb290OiBFbGVtZW50LCBjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBudWxsKSA9PiB2b2lkXG5cdHJlZHJhdzogKCkgPT4gdm9pZFxufVxuXG5pbnRlcmZhY2UgUm91dGVPcHRpb25zIHtcblx0cmVwbGFjZT86IGJvb2xlYW5cblx0c3RhdGU/OiBhbnlcblx0dGl0bGU/OiBzdHJpbmcgfCBudWxsXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJvdXRlcigkd2luZG93OiBhbnksIG1vdW50UmVkcmF3OiBNb3VudFJlZHJhdykge1xuXHRsZXQgcCA9IFByb21pc2UucmVzb2x2ZSgpXG5cblx0bGV0IHNjaGVkdWxlZCA9IGZhbHNlXG5cblx0bGV0IHJlYWR5ID0gZmFsc2Vcblx0bGV0IGhhc0JlZW5SZXNvbHZlZCA9IGZhbHNlXG5cblx0bGV0IGRvbTogRWxlbWVudCB8IHVuZGVmaW5lZFxuXHRsZXQgY29tcGlsZWQ6IEFycmF5PHtyb3V0ZTogc3RyaW5nOyBjb21wb25lbnQ6IGFueTsgY2hlY2s6IChkYXRhOiB7cGF0aDogc3RyaW5nOyBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT59KSA9PiBib29sZWFufT4gfCB1bmRlZmluZWRcblx0bGV0IGZhbGxiYWNrUm91dGU6IHN0cmluZyB8IHVuZGVmaW5lZFxuXG5cdGxldCBjdXJyZW50UmVzb2x2ZXI6IFJvdXRlUmVzb2x2ZXIgfCBudWxsID0gbnVsbFxuXHRsZXQgY29tcG9uZW50OiBDb21wb25lbnRUeXBlIHwgc3RyaW5nID0gJ2Rpdidcblx0bGV0IGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0bGV0IGN1cnJlbnRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWRcblx0bGV0IGxhc3RVcGRhdGU6ICgoY29tcDogYW55KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsXG5cblx0Y29uc3QgUm91dGVyUm9vdDogQ29tcG9uZW50VHlwZSA9IHtcblx0XHRvbnJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZWFkeSA9IGhhc0JlZW5SZXNvbHZlZCA9IGZhbHNlXG5cdFx0XHQkd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZmlyZUFzeW5jLCBmYWxzZSlcblx0XHR9LFxuXHRcdHZpZXc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gVGhlIHJvdXRlIGhhcyBhbHJlYWR5IGJlZW4gcmVzb2x2ZWQuXG5cdFx0XHQvLyBUaGVyZWZvcmUsIHRoZSBmb2xsb3dpbmcgZWFybHkgcmV0dXJuIGlzIG5vdCBuZWVkZWQuXG5cdFx0XHQvLyBpZiAoIWhhc0JlZW5SZXNvbHZlZCkgcmV0dXJuXG5cblx0XHRcdC8vIFVzZSBjdXJyZW50UGF0aCBhcyBrZXkgdG8gZW5zdXJlIGNvbXBvbmVudCByZWNyZWF0aW9uIG9uIHJvdXRlIGNoYW5nZVxuXHRcdFx0Ly8gUGFzcyBjdXJyZW50UGF0aCBpbiBhdHRycyBzbyBSb3V0ZVJlc29sdmVyLnJlbmRlciBjYW4gdXNlIGl0IGZvciByb3V0ZVBhdGhcblx0XHRcdGNvbnN0IHJvdXRlQXR0cnMgPSB7Li4uYXR0cnMsIHJvdXRlUGF0aDogY3VycmVudFBhdGggfHwgYXR0cnMucm91dGVQYXRoLCBrZXk6IGN1cnJlbnRQYXRoIHx8IGF0dHJzLmtleX1cblx0XHRcdGNvbnN0IHZub2RlID0gVm5vZGUoY29tcG9uZW50LCBjdXJyZW50UGF0aCB8fCBhdHRycy5rZXksIHJvdXRlQXR0cnMsIG51bGwsIG51bGwsIG51bGwpXG5cdFx0XHRpZiAoY3VycmVudFJlc29sdmVyKSByZXR1cm4gY3VycmVudFJlc29sdmVyLnJlbmRlciEodm5vZGUgYXMgYW55KVxuXHRcdFx0Ly8gV3JhcCBpbiBhIGZyYWdtZW50IHRvIHByZXNlcnZlIGV4aXN0aW5nIGtleSBzZW1hbnRpY3Ncblx0XHRcdHJldHVybiBbdm5vZGVdXG5cdFx0fSxcblx0fVxuXG5cdGNvbnN0IFNLSVAgPSByb3V0ZS5TS0lQID0ge31cblx0XG5cdC8vIFJlZGlyZWN0IHN5bWJvbCBmb3IgaXNvbW9ycGhpYyByZWRpcmVjdCBoYW5kbGluZ1xuXHRjb25zdCBSRURJUkVDVCA9IHJvdXRlLlJFRElSRUNUID0gU3ltYm9sKCdSRURJUkVDVCcpXG5cdFxuXHQvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIHJlZGlyZWN0IG9iamVjdHNcblx0cm91dGUucmVkaXJlY3QgPSBmdW5jdGlvbihwYXRoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4ge1tSRURJUkVDVF06IHBhdGh9IGFzIFJlZGlyZWN0T2JqZWN0XG5cdH1cblx0XG5cdC8vIFR5cGUgZ3VhcmQgdG8gY2hlY2sgaWYgdmFsdWUgaXMgYSByZWRpcmVjdCBvYmplY3Rcblx0Ly8gTm90ZTogV2UgY2hlY2sgZm9yIGFueSBTeW1ib2wga2V5IHRoYXQgbWlnaHQgYmUgYSByZWRpcmVjdCwgbm90IGp1c3Qgb3VyIHNwZWNpZmljIFJFRElSRUNUIHN5bWJvbFxuXHQvLyBUaGlzIGFsbG93cyByZWRpcmVjdCBvYmplY3RzIGNyZWF0ZWQgYnkgZGlmZmVyZW50IHJvdXRlciBpbnN0YW5jZXMgdG8gYmUgZGV0ZWN0ZWRcblx0ZnVuY3Rpb24gaXNSZWRpcmVjdCh2YWx1ZTogYW55KTogdmFsdWUgaXMgUmVkaXJlY3RPYmplY3Qge1xuXHRcdGlmICh2YWx1ZSA9PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZVxuXHRcdC8vIENoZWNrIGlmIHRoaXMgb2JqZWN0IGhhcyBvdXIgUkVESVJFQ1Qgc3ltYm9sXG5cdFx0aWYgKFJFRElSRUNUIGluIHZhbHVlKSByZXR1cm4gdHJ1ZVxuXHRcdC8vIEFsc28gY2hlY2sgZm9yIGFueSBTeW1ib2wga2V5cyB0aGF0IG1pZ2h0IGJlIHJlZGlyZWN0IG9iamVjdHMgZnJvbSBvdGhlciByb3V0ZXIgaW5zdGFuY2VzXG5cdFx0Ly8gVGhpcyBoYW5kbGVzIHRoZSBjYXNlIHdoZXJlIHJlZGlyZWN0IG9iamVjdHMgYXJlIGNyZWF0ZWQgYnkgY2xpZW50LXNpZGUgbS5yb3V0ZS5yZWRpcmVjdFxuXHRcdC8vIGJ1dCBjaGVja2VkIGJ5IHNlcnZlci1zaWRlIHJvdXRlciAob3IgdmljZSB2ZXJzYSlcblx0XHRjb25zdCBzeW1ib2xLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh2YWx1ZSlcblx0XHRpZiAoc3ltYm9sS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0XHQvLyBDaGVjayBpZiBhbnkgc3ltYm9sIGtleSdzIGRlc2NyaXB0aW9uIHN1Z2dlc3RzIGl0J3MgYSByZWRpcmVjdFxuXHRcdFx0Ly8gT3IgY2hlY2sgaWYgdGhlIG9iamVjdCBoYXMgYSBzdHJpbmcgcHJvcGVydHkgdGhhdCBsb29rcyBsaWtlIGEgcGF0aFxuXHRcdFx0Zm9yIChjb25zdCBzeW0gb2Ygc3ltYm9sS2V5cykge1xuXHRcdFx0XHRjb25zdCBkZXNjID0gc3ltLmRlc2NyaXB0aW9uIHx8ICcnXG5cdFx0XHRcdGlmIChkZXNjLmluY2x1ZGVzKCdSRURJUkVDVCcpIHx8IGRlc2MgPT09ICdSRURJUkVDVCcpIHtcblx0XHRcdFx0XHRjb25zdCBwYXRoID0gdmFsdWVbc3ltXVxuXHRcdFx0XHRcdGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycgJiYgcGF0aC5zdGFydHNXaXRoKCcvJykpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cdFxuXHQvLyBIZWxwZXIgdG8gZXh0cmFjdCByZWRpcmVjdCBwYXRoIGZyb20gcmVkaXJlY3Qgb2JqZWN0IChoYW5kbGVzIGRpZmZlcmVudCBSRURJUkVDVCBzeW1ib2xzKVxuXHRmdW5jdGlvbiBnZXRSZWRpcmVjdFBhdGgocmVkaXJlY3RPYmo6IFJlZGlyZWN0T2JqZWN0KTogc3RyaW5nIHtcblx0XHQvLyBGaXJzdCB0cnkgb3VyIFJFRElSRUNUIHN5bWJvbFxuXHRcdGlmIChSRURJUkVDVCBpbiByZWRpcmVjdE9iaikge1xuXHRcdFx0cmV0dXJuIHJlZGlyZWN0T2JqW1JFRElSRUNUXVxuXHRcdH1cblx0XHQvLyBPdGhlcndpc2UsIGNoZWNrIGFsbCBzeW1ib2wga2V5c1xuXHRcdGNvbnN0IHN5bWJvbEtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHJlZGlyZWN0T2JqKVxuXHRcdGZvciAoY29uc3Qgc3ltIG9mIHN5bWJvbEtleXMpIHtcblx0XHRcdGNvbnN0IHBhdGggPSByZWRpcmVjdE9ialtzeW1dXG5cdFx0XHRpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnICYmIHBhdGguc3RhcnRzV2l0aCgnLycpKSB7XG5cdFx0XHRcdHJldHVybiBwYXRoXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWRpcmVjdCBvYmplY3Q6IG5vIHJlZGlyZWN0IHBhdGggZm91bmQnKVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVzb2x2ZVJvdXRlKCkge1xuXHRcdHNjaGVkdWxlZCA9IGZhbHNlXG5cdFx0Ly8gQ29uc2lkZXIgdGhlIHBhdGhuYW1lIGhvbGlzdGljYWxseS4gVGhlIHByZWZpeCBtaWdodCBldmVuIGJlIGludmFsaWQsXG5cdFx0Ly8gYnV0IHRoYXQncyBub3Qgb3VyIHByb2JsZW0uXG5cdFx0Ly8gVXNlIGlzb21vcnBoaWMgVVJJIEFQSSB1bmNvbmRpdGlvbmFsbHkgLSBpdCBoYW5kbGVzIGVudmlyb25tZW50IGRldGVjdGlvbiBpbnRlcm5hbGx5XG5cdFx0Y29uc3QgaGFzaCA9IGdldEhhc2goKVxuXHRcdGxldCBwcmVmaXggPSBoYXNoXG5cdFx0aWYgKHJvdXRlLnByZWZpeFswXSAhPT0gJyMnKSB7XG5cdFx0XHRjb25zdCBzZWFyY2ggPSBnZXRTZWFyY2goKVxuXHRcdFx0cHJlZml4ID0gc2VhcmNoICsgcHJlZml4XG5cdFx0XHRpZiAocm91dGUucHJlZml4WzBdICE9PSAnPycpIHtcblx0XHRcdFx0Y29uc3QgcGF0aG5hbWUgPSBnZXRQYXRobmFtZSgpXG5cdFx0XHRcdHByZWZpeCA9IHBhdGhuYW1lICsgcHJlZml4XG5cdFx0XHRcdGlmIChwcmVmaXhbMF0gIT09ICcvJykgcHJlZml4ID0gJy8nICsgcHJlZml4XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IHBhdGggPSBkZWNvZGVVUklDb21wb25lbnRTYWZlKHByZWZpeCkuc2xpY2Uocm91dGUucHJlZml4Lmxlbmd0aClcblx0XHRjb25zdCBkYXRhID0gcGFyc2VQYXRobmFtZShwYXRoKVxuXG5cdFx0T2JqZWN0LmFzc2lnbihkYXRhLnBhcmFtcywgJHdpbmRvdy5oaXN0b3J5LnN0YXRlIHx8IHt9KVxuXG5cdFx0ZnVuY3Rpb24gcmVqZWN0KGU6IGFueSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcihlKVxuXHRcdFx0cm91dGUuc2V0KGZhbGxiYWNrUm91dGUhLCBudWxsLCB7cmVwbGFjZTogdHJ1ZX0pXG5cdFx0fVxuXG5cdFx0bG9vcCgwKVxuXHRcdGZ1bmN0aW9uIGxvb3AoaTogbnVtYmVyKSB7XG5cdFx0XHRpZiAoIWNvbXBpbGVkKSByZXR1cm5cblx0XHRcdGZvciAoOyBpIDwgY29tcGlsZWQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGNvbXBpbGVkW2ldLmNoZWNrKGRhdGEpKSB7XG5cdFx0XHRcdFx0bGV0IHBheWxvYWQgPSBjb21waWxlZFtpXS5jb21wb25lbnRcblx0XHRcdFx0XHRjb25zdCBtYXRjaGVkUm91dGUgPSBjb21waWxlZFtpXS5yb3V0ZVxuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQ29tcCA9IHBheWxvYWRcblx0XHRcdFx0XHQvLyBTdG9yZSB0aGUgUm91dGVSZXNvbHZlciBpZiBwYXlsb2FkIGhhcyBib3RoIG9ubWF0Y2ggYW5kIHJlbmRlclxuXHRcdFx0XHRcdC8vIFRoaXMgYWxsb3dzIHVzIHRvIHByZXNlcnZlIHRoZSByZXNvbHZlciBldmVuIGFmdGVyIG9ubWF0Y2ggcmV0dXJucyBhIGNvbXBvbmVudFxuXHRcdFx0XHRcdGNvbnN0IHJlc29sdmVyV2l0aFJlbmRlciA9IHBheWxvYWQgJiYgdHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnICYmIHBheWxvYWQub25tYXRjaCAmJiBwYXlsb2FkLnJlbmRlciAmJiAhcGF5bG9hZC52aWV3ICYmIHR5cGVvZiBwYXlsb2FkICE9PSAnZnVuY3Rpb24nID8gcGF5bG9hZCA6IG51bGxcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb25zdCB1cGRhdGUgPSBsYXN0VXBkYXRlID0gZnVuY3Rpb24oY29tcDogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAodXBkYXRlICE9PSBsYXN0VXBkYXRlKSByZXR1cm5cblx0XHRcdFx0XHRcdGlmIChjb21wID09PSBTS0lQKSByZXR1cm4gbG9vcChpICsgMSlcblx0XHRcdFx0XHRcdC8vIEhhbmRsZSByZWRpcmVjdCBvYmplY3RzOiBleHBsaWNpdCByZWRpcmVjdCBzaWduYWxcblx0XHRcdFx0XHRcdGlmIChpc1JlZGlyZWN0KGNvbXApKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEV4dHJhY3QgcmVkaXJlY3QgdGFyZ2V0IHBhdGhcblx0XHRcdFx0XHRcdFx0Y29uc3QgcmVkaXJlY3RQYXRoID0gY29tcFtSRURJUkVDVF1cblx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBuYXZpZ2F0aW9uIHRvIHJlZGlyZWN0IHRhcmdldFxuXHRcdFx0XHRcdFx0XHRyb3V0ZS5zZXQocmVkaXJlY3RQYXRoLCBudWxsKVxuXHRcdFx0XHRcdFx0XHQvLyBTa2lwIHJlbmRlcmluZyBjdXJyZW50IHJvdXRlIC0gbmV3IHJvdXRlIHJlc29sdXRpb24gd2lsbCBoYW5kbGUgcmVkaXJlY3QgdGFyZ2V0XG5cdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBhIHByZXNlcnZlZCByZXNvbHZlciB3aXRoIHJlbmRlciwgdXNlIGl0XG5cdFx0XHRcdFx0XHRpZiAocmVzb2x2ZXJXaXRoUmVuZGVyKSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRSZXNvbHZlciA9IHJlc29sdmVyV2l0aFJlbmRlclxuXHRcdFx0XHRcdFx0XHRjb21wb25lbnQgPSBjb21wICE9IG51bGwgJiYgKHR5cGVvZiBjb21wLnZpZXcgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGNvbXAgPT09ICdmdW5jdGlvbicpID8gY29tcCA6ICdkaXYnXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBJZiBjb21wIGlzIGEgUm91dGVSZXNvbHZlciB3aXRoIHJlbmRlciwgc2V0IGN1cnJlbnRSZXNvbHZlciBpbnN0ZWFkIG9mIGNvbXBvbmVudFxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoY29tcCAmJiB0eXBlb2YgY29tcCA9PT0gJ29iamVjdCcgJiYgY29tcC5yZW5kZXIgJiYgIWNvbXAudmlldyAmJiB0eXBlb2YgY29tcCAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRjdXJyZW50UmVzb2x2ZXIgPSBjb21wXG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudCA9ICdkaXYnIC8vIFBsYWNlaG9sZGVyLCB3b24ndCBiZSB1c2VkIHNpbmNlIGN1cnJlbnRSZXNvbHZlci5yZW5kZXIgd2lsbCBiZSBjYWxsZWRcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRSZXNvbHZlciA9IG51bGxcblx0XHRcdFx0XHRcdFx0Y29tcG9uZW50ID0gY29tcCAhPSBudWxsICYmICh0eXBlb2YgY29tcC52aWV3ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBjb21wID09PSAnZnVuY3Rpb24nKSA/IGNvbXAgOiAnZGl2J1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YXR0cnMgPSBkYXRhLnBhcmFtc1xuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGggPSBwYXRoXG5cdFx0XHRcdFx0XHRsYXN0VXBkYXRlID0gbnVsbFxuXHRcdFx0XHRcdFx0aWYgKGhhc0JlZW5SZXNvbHZlZCkgbW91bnRSZWRyYXcucmVkcmF3KClcblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRoYXNCZWVuUmVzb2x2ZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRcdG1vdW50UmVkcmF3Lm1vdW50KGRvbSEsIFJvdXRlclJvb3QpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIFRoZXJlJ3Mgbm8gdW5kZXJzdGF0aW5nIGhvdyBtdWNoIEkgKndpc2gqIEkgY291bGRcblx0XHRcdFx0XHQvLyB1c2UgYGFzeW5jYC9gYXdhaXRgIGhlcmUuLi5cblx0XHRcdFx0XHRpZiAocGF5bG9hZC52aWV3IHx8IHR5cGVvZiBwYXlsb2FkID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRwYXlsb2FkID0ge31cblx0XHRcdFx0XHRcdHVwZGF0ZShsb2NhbENvbXApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHBheWxvYWQub25tYXRjaCkge1xuXHRcdFx0XHRcdFx0cC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcGF5bG9hZC5vbm1hdGNoIShkYXRhLnBhcmFtcywgcGF0aCwgbWF0Y2hlZFJvdXRlKVxuXHRcdFx0XHRcdFx0fSkudGhlbih1cGRhdGUsIHBhdGggPT09IGZhbGxiYWNrUm91dGUgPyBudWxsIDogcmVqZWN0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChwYXlsb2FkLnJlbmRlcikge1xuXHRcdFx0XHRcdFx0Ly8gUm91dGVSZXNvbHZlciB3aXRoIHJlbmRlciBtZXRob2QgLSB1cGRhdGUgd2l0aCByZXNvbHZlciBpdHNlbGZcblx0XHRcdFx0XHRcdHVwZGF0ZShwYXlsb2FkKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHVwZGF0ZSgnZGl2Jylcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAocGF0aCA9PT0gZmFsbGJhY2tSb3V0ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCByZXNvbHZlIGRlZmF1bHQgcm91dGUgJyArIGZhbGxiYWNrUm91dGUgKyAnLicpXG5cdFx0XHR9XG5cdFx0XHRyb3V0ZS5zZXQoZmFsbGJhY2tSb3V0ZSEsIG51bGwsIHtyZXBsYWNlOiB0cnVlfSlcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBmaXJlQXN5bmMoKSB7XG5cdFx0aWYgKCFzY2hlZHVsZWQpIHtcblx0XHRcdHNjaGVkdWxlZCA9IHRydWVcblx0XHRcdC8vIFRPRE86IGp1c3QgZG8gYG1vdW50UmVkcmF3LnJlZHJhdygpYCBoZXJlIGFuZCBlbGlkZSB0aGUgdGltZXJcblx0XHRcdC8vIGRlcGVuZGVuY3kuIE5vdGUgdGhhdCB0aGlzIHdpbGwgbXVjayB3aXRoIHRlc3RzIGEgKmxvdCosIHNvIGl0J3Ncblx0XHRcdC8vIG5vdCBhcyBlYXN5IG9mIGEgY2hhbmdlIGFzIGl0IHNvdW5kcy5cblx0XHRcdHNldFRpbWVvdXQocmVzb2x2ZVJvdXRlKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJvdXRlKHJvb3Q6IEVsZW1lbnQsIGRlZmF1bHRSb3V0ZTogc3RyaW5nLCByb3V0ZXM6IFJlY29yZDxzdHJpbmcsIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyPikge1xuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IFR5cGVFcnJvcignRE9NIGVsZW1lbnQgYmVpbmcgcmVuZGVyZWQgdG8gZG9lcyBub3QgZXhpc3QuJylcblxuXHRcdGNvbXBpbGVkID0gT2JqZWN0LmtleXMocm91dGVzKS5tYXAoZnVuY3Rpb24ocm91dGVQYXRoKSB7XG5cdFx0XHRpZiAocm91dGVQYXRoWzBdICE9PSAnLycpIHRocm93IG5ldyBTeW50YXhFcnJvcignUm91dGVzIG11c3Qgc3RhcnQgd2l0aCBhIFxcJy9cXCcuJylcblx0XHRcdGlmICgoLzooW15cXC9cXC4tXSspKFxcLnszfSk/Oi8pLnRlc3Qocm91dGVQYXRoKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1JvdXRlIHBhcmFtZXRlciBuYW1lcyBtdXN0IGJlIHNlcGFyYXRlZCB3aXRoIGVpdGhlciBcXCcvXFwnLCBcXCcuXFwnLCBvciBcXCctXFwnLicpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyb3V0ZTogcm91dGVQYXRoLFxuXHRcdFx0XHRjb21wb25lbnQ6IHJvdXRlc1tyb3V0ZVBhdGhdLFxuXHRcdFx0XHRjaGVjazogY29tcGlsZVRlbXBsYXRlKHJvdXRlUGF0aCksXG5cdFx0XHR9XG5cdFx0fSlcblx0XHRmYWxsYmFja1JvdXRlID0gZGVmYXVsdFJvdXRlXG5cdFx0aWYgKGRlZmF1bHRSb3V0ZSAhPSBudWxsKSB7XG5cdFx0XHRjb25zdCBkZWZhdWx0RGF0YSA9IHBhcnNlUGF0aG5hbWUoZGVmYXVsdFJvdXRlKVxuXG5cdFx0XHRpZiAoIWNvbXBpbGVkLnNvbWUoZnVuY3Rpb24oaSkgeyByZXR1cm4gaS5jaGVjayhkZWZhdWx0RGF0YSkgfSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdEZWZhdWx0IHJvdXRlIGRvZXNuXFwndCBtYXRjaCBhbnkga25vd24gcm91dGVzLicpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGRvbSA9IHJvb3RcblxuXHRcdCR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmaXJlQXN5bmMsIGZhbHNlKVxuXG5cdFx0cmVhZHkgPSB0cnVlXG5cblx0XHQvLyBUaGUgUm91dGVyUm9vdCBjb21wb25lbnQgaXMgbW91bnRlZCB3aGVuIHRoZSByb3V0ZSBpcyBmaXJzdCByZXNvbHZlZC5cblx0XHRyZXNvbHZlUm91dGUoKVxuXHR9XG5cdHJvdXRlLnNldCA9IGZ1bmN0aW9uKHBhdGg6IHN0cmluZywgZGF0YTogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwsIG9wdGlvbnM/OiBSb3V0ZU9wdGlvbnMpIHtcblx0XHRpZiAobGFzdFVwZGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXHRcdFx0b3B0aW9ucy5yZXBsYWNlID0gdHJ1ZVxuXHRcdH1cblx0XHRsYXN0VXBkYXRlID0gbnVsbFxuXG5cdFx0cGF0aCA9IGJ1aWxkUGF0aG5hbWUocGF0aCwgZGF0YSB8fCB7fSlcblx0XHRpZiAocmVhZHkpIHtcblx0XHRcdC8vIFJvdXRlciBpcyBpbml0aWFsaXplZCAtIHVzZSBoaXN0b3J5IEFQSSBmb3IgbmF2aWdhdGlvblxuXHRcdFx0ZmlyZUFzeW5jKClcblx0XHRcdGNvbnN0IHN0YXRlID0gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdGUgOiBudWxsXG5cdFx0XHRjb25zdCB0aXRsZSA9IG9wdGlvbnMgPyBvcHRpb25zLnRpdGxlIDogbnVsbFxuXHRcdFx0aWYgKCR3aW5kb3c/Lmhpc3RvcnkpIHtcblx0XHRcdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXBsYWNlKSAkd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgcm91dGUucHJlZml4ICsgcGF0aClcblx0XHRcdFx0ZWxzZSAkd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgcm91dGUucHJlZml4ICsgcGF0aClcblx0XHRcdH1cblx0XHRcdC8vIEluIFNTUiBjb250ZXh0IChubyAkd2luZG93KSwgbmF2aWdhdGlvbiBpcyBhIG5vLW9wIHNpbmNlIHdlJ3JlIGp1c3QgcmVuZGVyaW5nIEhUTUxcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBSb3V0ZXIgbm90IHlldCBpbml0aWFsaXplZCAtIHVzZSBsb2NhdGlvbi5ocmVmIGZvciBpbml0aWFsIG5hdmlnYXRpb25cblx0XHRcdGlmICgkd2luZG93Py5sb2NhdGlvbikge1xuXHRcdFx0XHQkd2luZG93LmxvY2F0aW9uLmhyZWYgPSByb3V0ZS5wcmVmaXggKyBwYXRoXG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBTU1IgY29udGV4dCAobm8gJHdpbmRvdyksIHRoaXMgaXMgYSBuby1vcCBzaW5jZSB3ZSdyZSBqdXN0IHJlbmRlcmluZyBIVE1MXG5cdFx0fVxuXHR9XG5cdHJvdXRlLmdldCA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIElmIGN1cnJlbnRQYXRoIGlzIG5vdCBzZXQgKGUuZy4sIGR1cmluZyBTU1IgYmVmb3JlIHJvdXRlLnJlc29sdmUgaXMgY2FsbGVkKSxcblx0XHQvLyBmYWxsIGJhY2sgdG8gZXh0cmFjdGluZyBwYXRobmFtZSBmcm9tIF9fU1NSX1VSTF9fIHVzaW5nIHRoZSBpc29tb3JwaGljIFVSSSBBUElcblx0XHRpZiAoY3VycmVudFBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIGdldFBhdGhuYW1lKClcblx0XHR9XG5cdFx0cmV0dXJuIGN1cnJlbnRQYXRoXG5cdH1cblx0cm91dGUucHJlZml4ID0gJyMhJ1xuXHRyb3V0ZS5saW5rID0gZnVuY3Rpb24odm5vZGU6IFZub2RlVHlwZSkge1xuXHRcdHJldHVybiByb3V0ZS5MaW5rLnZpZXcodm5vZGUpXG5cdH1cblx0cm91dGUuTGluayA9IHtcblx0XHR2aWV3OiBmdW5jdGlvbih2bm9kZTogVm5vZGVUeXBlKSB7XG5cdFx0XHQvLyBPbWl0IHRoZSB1c2VkIHBhcmFtZXRlcnMgZnJvbSB0aGUgcmVuZGVyZWQgZWxlbWVudCAtIHRoZXkgYXJlXG5cdFx0XHQvLyBpbnRlcm5hbC4gQWxzbywgY2Vuc29yIHRoZSB2YXJpb3VzIGxpZmVjeWNsZSBtZXRob2RzLlxuXHRcdFx0Ly9cblx0XHRcdC8vIFdlIGRvbid0IHN0cmlwIHRoZSBvdGhlciBwYXJhbWV0ZXJzIGJlY2F1c2UgZm9yIGNvbnZlbmllbmNlIHdlXG5cdFx0XHQvLyBsZXQgdGhlbSBiZSBzcGVjaWZpZWQgaW4gdGhlIHNlbGVjdG9yIGFzIHdlbGwuXG5cdFx0XHRjb25zdCBjaGlsZCA9IGh5cGVyc2NyaXB0KFxuXHRcdFx0XHR2bm9kZS5hdHRycz8uc2VsZWN0b3IgfHwgJ2EnLFxuXHRcdFx0XHRjZW5zb3Iodm5vZGUuYXR0cnMgfHwge30sIFsnb3B0aW9ucycsICdwYXJhbXMnLCAnc2VsZWN0b3InLCAnb25jbGljayddKSxcblx0XHRcdFx0dm5vZGUuY2hpbGRyZW4sXG5cdFx0XHQpXG5cdFx0XHRsZXQgb3B0aW9uczogUm91dGVPcHRpb25zIHwgdW5kZWZpbmVkXG5cdFx0XHRsZXQgb25jbGljazogYW55XG5cdFx0XHRsZXQgaHJlZjogc3RyaW5nXG5cblx0XHRcdC8vIExldCdzIHByb3ZpZGUgYSAqcmlnaHQqIHdheSB0byBkaXNhYmxlIGEgcm91dGUgbGluaywgcmF0aGVyIHRoYW5cblx0XHRcdC8vIGxldHRpbmcgcGVvcGxlIHNjcmV3IHVwIGFjY2Vzc2liaWxpdHkgb24gYWNjaWRlbnQuXG5cdFx0XHQvL1xuXHRcdFx0Ly8gVGhlIGF0dHJpYnV0ZSBpcyBjb2VyY2VkIHNvIHVzZXJzIGRvbid0IGdldCBzdXJwcmlzZWQgb3ZlclxuXHRcdFx0Ly8gYGRpc2FibGVkOiAwYCByZXN1bHRpbmcgaW4gYSBidXR0b24gdGhhdCdzIHNvbWVob3cgcm91dGFibGVcblx0XHRcdC8vIGRlc3BpdGUgYmVpbmcgdmlzaWJseSBkaXNhYmxlZC5cblx0XHRcdGlmIChjaGlsZC5hdHRycyEuZGlzYWJsZWQgPSBCb29sZWFuKGNoaWxkLmF0dHJzIS5kaXNhYmxlZCkpIHtcblx0XHRcdFx0Y2hpbGQuYXR0cnMhLmhyZWYgPSBudWxsXG5cdFx0XHRcdGNoaWxkLmF0dHJzIVsnYXJpYS1kaXNhYmxlZCddID0gJ3RydWUnXG5cdFx0XHRcdC8vIElmIHlvdSAqcmVhbGx5KiBkbyB3YW50IGFkZCBgb25jbGlja2Agb24gYSBkaXNhYmxlZCBsaW5rLCB1c2Vcblx0XHRcdFx0Ly8gYW4gYG9uY3JlYXRlYCBob29rIHRvIGFkZCBpdC5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9wdGlvbnMgPSB2bm9kZS5hdHRycz8ub3B0aW9uc1xuXHRcdFx0XHRvbmNsaWNrID0gdm5vZGUuYXR0cnM/Lm9uY2xpY2tcblx0XHRcdFx0Ly8gRWFzaWVyIHRvIGJ1aWxkIGl0IG5vdyB0byBrZWVwIGl0IGlzb21vcnBoaWMuXG5cdFx0XHRcdGhyZWYgPSBidWlsZFBhdGhuYW1lKGNoaWxkLmF0dHJzIS5ocmVmIHx8ICcnLCB2bm9kZS5hdHRycz8ucGFyYW1zIHx8IHt9KVxuXHRcdFx0XHQvLyBNYWtlIExpbmsgaXNvbW9ycGhpYyAtIHVzZSBlbXB0eSBwcmVmaXggb24gc2VydmVyIGZvciBwYXRobmFtZSByb3V0aW5nXG5cdFx0XHRcdC8vIE9uIHNlcnZlciAoJHdpbmRvdyBpcyBudWxsKTogYWx3YXlzIHVzZSBlbXB0eSBwcmVmaXggZm9yIGNsZWFuIFVSTHNcblx0XHRcdFx0Ly8gT24gY2xpZW50OiB1c2Ugcm91dGUucHJlZml4ICh3aGljaCBtYXkgYmUgJyMhJyBmb3IgaGFzaCByb3V0aW5nIG9yICcnIGZvciBwYXRobmFtZSByb3V0aW5nKVxuXHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgU1NSIGdlbmVyYXRlcyBjbGVhbiBwYXRobmFtZSBVUkxzIHdoaWxlIGNsaWVudCBjYW4gdXNlIGhhc2ggcm91dGluZyBpZiBjb25maWd1cmVkXG5cdFx0XHRcdGNvbnN0IGxpbmtQcmVmaXggPSAoJHdpbmRvdyA9PSBudWxsKSA/ICcnIDogcm91dGUucHJlZml4XG5cdFx0XHRcdGNoaWxkLmF0dHJzIS5ocmVmID0gbGlua1ByZWZpeCArIGhyZWZcblx0XHRcdFx0Y2hpbGQuYXR0cnMhLm9uY2xpY2sgPSBmdW5jdGlvbihlOiBhbnkpIHtcblx0XHRcdFx0XHRsZXQgcmVzdWx0OiBhbnlcblx0XHRcdFx0XHRpZiAodHlwZW9mIG9uY2xpY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IG9uY2xpY2suY2FsbChlLmN1cnJlbnRUYXJnZXQsIGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvbmNsaWNrID09IG51bGwgfHwgdHlwZW9mIG9uY2xpY2sgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0XHQvLyBkbyBub3RoaW5nXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygb25jbGljay5oYW5kbGVFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0b25jbGljay5oYW5kbGVFdmVudChlKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEFkYXB0ZWQgZnJvbSBSZWFjdCBSb3V0ZXIncyBpbXBsZW1lbnRhdGlvbjpcblx0XHRcdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vUmVhY3RUcmFpbmluZy9yZWFjdC1yb3V0ZXIvYmxvYi81MjBhMGFjZDQ4YWUxYjA2NmViMGIwN2Q2ZDRkMTc5MGExZDAyNDgyL3BhY2thZ2VzL3JlYWN0LXJvdXRlci1kb20vbW9kdWxlcy9MaW5rLmpzXG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyBUcnkgdG8gYmUgZmxleGlibGUgYW5kIGludHVpdGl2ZSBpbiBob3cgd2UgaGFuZGxlIGxpbmtzLlxuXHRcdFx0XHRcdC8vIEZ1biBmYWN0OiBsaW5rcyBhcmVuJ3QgYXMgb2J2aW91cyB0byBnZXQgcmlnaHQgYXMgeW91XG5cdFx0XHRcdFx0Ly8gd291bGQgZXhwZWN0LiBUaGVyZSdzIGEgbG90IG1vcmUgdmFsaWQgd2F5cyB0byBjbGljayBhXG5cdFx0XHRcdFx0Ly8gbGluayB0aGFuIHRoaXMsIGFuZCBvbmUgbWlnaHQgd2FudCB0byBub3Qgc2ltcGx5IGNsaWNrIGFcblx0XHRcdFx0XHQvLyBsaW5rLCBidXQgcmlnaHQgY2xpY2sgb3IgY29tbWFuZC1jbGljayBpdCB0byBjb3B5IHRoZVxuXHRcdFx0XHRcdC8vIGxpbmsgdGFyZ2V0LCBldGMuIE5vcGUsIHRoaXMgaXNuJ3QganVzdCBmb3IgYmxpbmQgcGVvcGxlLlxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdC8vIFNraXAgaWYgYG9uY2xpY2tgIHByZXZlbnRlZCBkZWZhdWx0XG5cdFx0XHRcdFx0XHRyZXN1bHQgIT09IGZhbHNlICYmICFlLmRlZmF1bHRQcmV2ZW50ZWQgJiZcblx0XHRcdFx0XHRcdC8vIElnbm9yZSBldmVyeXRoaW5nIGJ1dCBsZWZ0IGNsaWNrc1xuXHRcdFx0XHRcdFx0KGUuYnV0dG9uID09PSAwIHx8IGUud2hpY2ggPT09IDAgfHwgZS53aGljaCA9PT0gMSkgJiZcblx0XHRcdFx0XHRcdC8vIExldCB0aGUgYnJvd3NlciBoYW5kbGUgYHRhcmdldD1fYmxhbmtgLCBldGMuXG5cdFx0XHRcdFx0XHQoIWUuY3VycmVudFRhcmdldC50YXJnZXQgfHwgZS5jdXJyZW50VGFyZ2V0LnRhcmdldCA9PT0gJ19zZWxmJykgJiZcblx0XHRcdFx0XHRcdC8vIE5vIG1vZGlmaWVyIGtleXNcblx0XHRcdFx0XHRcdCFlLmN0cmxLZXkgJiYgIWUubWV0YUtleSAmJiAhZS5zaGlmdEtleSAmJiAhZS5hbHRLZXlcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmVseSBjYWxsIHByZXZlbnREZWZhdWx0IC0gZXZlbnQgbWlnaHQgYmUgd3JhcHBlZCBieSBNaXRocmlsXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGUucHJldmVudERlZmF1bHQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGUub3JpZ2luYWxFdmVudCAmJiB0eXBlb2YgZS5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGUub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQoZSBhcyBhbnkpLnJlZHJhdyA9IGZhbHNlXG5cdFx0XHRcdFx0XHRyb3V0ZS5zZXQoaHJlZiwgbnVsbCwgb3B0aW9ucylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaGlsZFxuXHRcdH0sXG5cdH1cblx0cm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXk/OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYXR0cnMgJiYga2V5ICE9IG51bGwgPyBhdHRyc1trZXldIDogYXR0cnNcblx0fVxuXHRyb3V0ZS5wYXJhbXMgPSBhdHRyc1xuXG5cdC8vIFNlcnZlci1zaWRlIHJvdXRlIHJlc29sdXRpb24gKGlzb21vcnBoaWMpXG5cdHJvdXRlLnJlc29sdmUgPSBhc3luYyBmdW5jdGlvbihcblx0XHRwYXRobmFtZTogc3RyaW5nLFxuXHRcdHJvdXRlczogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXIgfCB7Y29tcG9uZW50OiBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcn0+LFxuXHRcdHJlbmRlclRvU3RyaW5nOiAodm5vZGVzOiBhbnkpID0+IFByb21pc2U8U1NSUmVzdWx0Pixcblx0XHRwcmVmaXg6IHN0cmluZyA9ICcnLFxuXHRcdHJlZGlyZWN0RGVwdGg6IG51bWJlciA9IDAsXG5cdCk6IFByb21pc2U8U1NSUmVzdWx0PiB7XG5cdFx0Ly8gUHJldmVudCBpbmZpbml0ZSByZWRpcmVjdCBsb29wc1xuXHRcdGNvbnN0IE1BWF9SRURJUkVDVF9ERVBUSCA9IDVcblx0XHRpZiAocmVkaXJlY3REZXB0aCA+IE1BWF9SRURJUkVDVF9ERVBUSCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBNYXhpbXVtIHJlZGlyZWN0IGRlcHRoICgke01BWF9SRURJUkVDVF9ERVBUSH0pIGV4Y2VlZGVkLiBQb3NzaWJsZSByZWRpcmVjdCBsb29wLmApXG5cdFx0fVxuXHRcdC8vIFNhdmUgY3VycmVudCBwcmVmaXggYW5kIHNldCB0byBwcm92aWRlZCBwcmVmaXggZm9yIFNTUlxuXHRcdC8vIFRoaXMgZW5zdXJlcyBMaW5rIGNvbXBvbmVudHMgdXNlIHRoZSBjb3JyZWN0IHByZWZpeCBkdXJpbmcgc2VydmVyLXNpZGUgcmVuZGVyaW5nXG5cdFx0Y29uc3Qgc2F2ZWRQcmVmaXggPSByb3V0ZS5wcmVmaXhcblx0XHRyb3V0ZS5wcmVmaXggPSBwcmVmaXhcblx0XHQvLyBTYXZlIGN1cnJlbnQgcGF0aCB0byByZXN0b3JlIGFmdGVyIFNTUlxuXHRcdGNvbnN0IHNhdmVkQ3VycmVudFBhdGggPSBjdXJyZW50UGF0aFxuXHRcdFxuXHRcdC8vIFNldCBjdXJyZW50UGF0aCBpbW1lZGlhdGVseSBzbyBtLnJvdXRlLmdldCgpIHdvcmtzIGR1cmluZyBTU1Jcblx0XHQvLyBVc2UgcGF0aG5hbWUgKGZ1bGwgcGF0aCkgLSB0aGlzIGlzIHdoYXQgbS5yb3V0ZS5nZXQoKSBzaG91bGQgcmV0dXJuXG5cdFx0Y3VycmVudFBhdGggPSBwYXRobmFtZSB8fCAnLydcblx0XHRcblx0XHR0cnkge1xuXHRcdFx0Ly8gQ29tcGlsZSByb3V0ZXMgKHNhbWUgbG9naWMgYXMgaW4gcm91dGUoKSBmdW5jdGlvbilcblx0XHRcdGNvbnN0IGNvbXBpbGVkID0gT2JqZWN0LmtleXMocm91dGVzKS5tYXAoZnVuY3Rpb24ocm91dGVQYXRoKSB7XG5cdFx0XHRcdGlmIChyb3V0ZVBhdGhbMF0gIT09ICcvJykgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdSb3V0ZXMgbXVzdCBzdGFydCB3aXRoIGEgXFwnL1xcJy4nKVxuXHRcdFx0XHRpZiAoKC86KFteXFwvXFwuLV0rKShcXC57M30pPzovKS50ZXN0KHJvdXRlUGF0aCkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1JvdXRlIHBhcmFtZXRlciBuYW1lcyBtdXN0IGJlIHNlcGFyYXRlZCB3aXRoIGVpdGhlciBcXCcvXFwnLCBcXCcuXFwnLCBvciBcXCctXFwnLicpXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gSGFuZGxlIGJvdGggZm9ybWF0czogZGlyZWN0IGNvbXBvbmVudC9yZXNvbHZlciBvciB7Y29tcG9uZW50OiAuLi59XG5cdFx0XHRcdGNvbnN0IHJvdXRlVmFsdWUgPSByb3V0ZXNbcm91dGVQYXRoXVxuXHRcdFx0XHRjb25zdCBjb21wb25lbnQgPSAocm91dGVWYWx1ZSAmJiB0eXBlb2Ygcm91dGVWYWx1ZSA9PT0gJ29iamVjdCcgJiYgJ2NvbXBvbmVudCcgaW4gcm91dGVWYWx1ZSlcblx0XHRcdFx0XHQ/IChyb3V0ZVZhbHVlIGFzIHtjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyfSkuY29tcG9uZW50XG5cdFx0XHRcdFx0OiByb3V0ZVZhbHVlIGFzIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0cm91dGU6IHJvdXRlUGF0aCxcblx0XHRcdFx0XHRjb21wb25lbnQ6IGNvbXBvbmVudCxcblx0XHRcdFx0XHRjaGVjazogY29tcGlsZVRlbXBsYXRlKHJvdXRlUGF0aCksXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cblx0XHRcdC8vIFBhcnNlIHBhdGhuYW1lXG5cdFx0XHRjb25zdCBwYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShwYXRobmFtZSB8fCAnLycpLnNsaWNlKHByZWZpeC5sZW5ndGgpXG5cdFx0XHRjb25zdCBkYXRhID0gcGFyc2VQYXRobmFtZShwYXRoKVxuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgYXR0cnMgZm9yIFNTUiBzbyBtLnJvdXRlLnBhcmFtKCkgd29ya3MgZHVyaW5nIHNlcnZlci1zaWRlIHJlbmRlcmluZ1xuXHRcdFx0YXR0cnMgPSBkYXRhLnBhcmFtc1xuXG5cdFx0XHQvLyBGaW5kIG1hdGNoaW5nIHJvdXRlXG5cdFx0XHRmb3IgKGNvbnN0IHtyb3V0ZTogbWF0Y2hlZFJvdXRlLCBjb21wb25lbnQsIGNoZWNrfSBvZiBjb21waWxlZCkge1xuXHRcdFx0XHRpZiAoY2hlY2soZGF0YSkpIHtcblx0XHRcdFx0XHRsZXQgcGF5bG9hZCA9IGNvbXBvbmVudFxuXG5cdFx0XHRcdFx0Ly8gSGFuZGxlIFJvdXRlUmVzb2x2ZXJcblx0XHRcdFx0XHRpZiAocGF5bG9hZCAmJiB0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcgJiYgKCdvbm1hdGNoJyBpbiBwYXlsb2FkIHx8ICdyZW5kZXInIGluIHBheWxvYWQpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByZXNvbHZlciA9IHBheWxvYWQgYXMgUm91dGVSZXNvbHZlclxuXHRcdFx0XHRcdFx0aWYgKHJlc29sdmVyLm9ubWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gcmVzb2x2ZXIub25tYXRjaChkYXRhLnBhcmFtcywgcGF0aG5hbWUsIG1hdGNoZWRSb3V0ZSlcblx0XHRcdFx0XHRcdFx0aWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcblx0XHRcdFx0XHRcdFx0XHRwYXlsb2FkID0gYXdhaXQgcmVzdWx0XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRwYXlsb2FkID0gcmVzdWx0XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8gTm90ZTogSWYgb25tYXRjaCByZXR1cm5zIHVuZGVmaW5lZCwgcGF5bG9hZCByZW1haW5zIGFzIHRoZSBSb3V0ZVJlc29sdmVyXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIENoZWNrIGZvciByZWRpcmVjdCBCRUZPUkUgcHJvY2Vzc2luZyBhcyBjb21wb25lbnRcblx0XHRcdFx0XHRcdC8vIFRoaXMgcHJldmVudHMgcmVkaXJlY3Qgb2JqZWN0cyBmcm9tIGJlaW5nIHRyZWF0ZWQgYXMgY29tcG9uZW50c1xuXHRcdFx0XHRcdFx0aWYgKGlzUmVkaXJlY3QocGF5bG9hZCkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gRXh0cmFjdCByZWRpcmVjdCB0YXJnZXQgcGF0aCAoaGFuZGxlcyBkaWZmZXJlbnQgUkVESVJFQ1Qgc3ltYm9scylcblx0XHRcdFx0XHRcdFx0Y29uc3QgcmVkaXJlY3RQYXRoID0gZ2V0UmVkaXJlY3RQYXRoKHBheWxvYWQpXG5cdFx0XHRcdFx0XHRcdGxvZ2dlci5pbmZvKGBSZWRpcmVjdGluZyB0byAke3JlZGlyZWN0UGF0aH1gLCB7XG5cdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0cm91dGU6IG1hdGNoZWRSb3V0ZSxcblx0XHRcdFx0XHRcdFx0XHRyZWRpcmVjdFBhdGgsXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC8vIFVwZGF0ZSBfX1NTUl9VUkxfXyB0byByZWZsZWN0IHJlZGlyZWN0IHRhcmdldCBmb3IgcHJvcGVyIFVSTCBjb250ZXh0XG5cdFx0XHRcdFx0XHRcdC8vIFRoaXMgZW5zdXJlcyBnZXRDdXJyZW50VXJsKCkgYW5kIG90aGVyIFVSTC1kZXBlbmRlbnQgY29kZSB3b3JrIGNvcnJlY3RseVxuXHRcdFx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFNTUlVybCA9IGdsb2JhbFRoaXMuX19TU1JfVVJMX19cblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDb25zdHJ1Y3QgZnVsbCBVUkwgZm9yIHJlZGlyZWN0IHRhcmdldCBpZiB3ZSBoYXZlIG9yaWdpbmFsIFVSTCBjb250ZXh0XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9yaWdpbmFsU1NSVXJsICYmIHR5cGVvZiBvcmlnaW5hbFNTUlVybCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsVXJsID0gbmV3IFVSTChvcmlnaW5hbFNTUlVybClcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gQnVpbGQgcmVkaXJlY3QgdGFyZ2V0IFVSTCB1c2luZyBzYW1lIG9yaWdpblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCByZWRpcmVjdFVybCA9IG5ldyBVUkwocmVkaXJlY3RQYXRoLCBvcmlnaW5hbFVybC5vcmlnaW4pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdsb2JhbFRoaXMuX19TU1JfVVJMX18gPSByZWRpcmVjdFVybC5ocmVmXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gSWYgVVJMIGNvbnN0cnVjdGlvbiBmYWlscywganVzdCB1c2UgcmVkaXJlY3QgcGF0aCBhcy1pc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRnbG9iYWxUaGlzLl9fU1NSX1VSTF9fID0gcmVkaXJlY3RQYXRoXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGdsb2JhbFRoaXMuX19TU1JfVVJMX18gPSByZWRpcmVjdFBhdGhcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0Ly8gUmVjdXJzaXZlbHkgcmVzb2x2ZSByZWRpcmVjdCB0YXJnZXQgcm91dGVcblx0XHRcdFx0XHRcdFx0XHQvLyBUaGlzIHdpbGwgcmV0dXJuIFNTUlJlc3VsdCAoc3RyaW5nIG9yIHtodG1sLCBzdGF0ZX0pXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVkaXJlY3RSZXN1bHQgPSBhd2FpdCByb3V0ZS5yZXNvbHZlKHJlZGlyZWN0UGF0aCwgcm91dGVzLCByZW5kZXJUb1N0cmluZywgcHJlZml4LCByZWRpcmVjdERlcHRoICsgMSlcblx0XHRcdFx0XHRcdFx0XHRjb25zdCByZWRpcmVjdEh0bWwgPSB0eXBlb2YgcmVkaXJlY3RSZXN1bHQgPT09ICdzdHJpbmcnID8gcmVkaXJlY3RSZXN1bHQgOiByZWRpcmVjdFJlc3VsdC5odG1sXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFyZWRpcmVjdEh0bWwgfHwgcmVkaXJlY3RIdG1sLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLndhcm4oJ0VtcHR5IHJlZGlyZWN0IHJlc3VsdCcsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlZGlyZWN0UGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cm91dGU6IG1hdGNoZWRSb3V0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZygnUmVkaXJlY3QgcmVzb2x2ZWQnLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZWRpcmVjdFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGh0bWxTaXplOiByZWRpcmVjdEh0bWwubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlZGlyZWN0UmVzdWx0XG5cdFx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gUmVzdG9yZSBvcmlnaW5hbCBTU1IgVVJMIGFmdGVyIHJlZGlyZWN0IHJlc29sdXRpb25cblx0XHRcdFx0XHRcdFx0XHRnbG9iYWxUaGlzLl9fU1NSX1VSTF9fID0gb3JpZ2luYWxTU1JVcmxcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBJZiByZXNvbHZlciBoYXMgcmVuZGVyLCB1c2UgaXRcblx0XHRcdFx0XHRcdGlmIChyZXNvbHZlci5yZW5kZXIpIHtcblx0XHRcdFx0XHRcdFx0Ly8gT25seSByZW5kZXIgaWYgcGF5bG9hZCBpcyBhIHZhbGlkIGNvbXBvbmVudCAob25tYXRjaCByZXR1cm5lZCBhIGNvbXBvbmVudClcblx0XHRcdFx0XHRcdFx0Ly8gSWYgb25tYXRjaCByZXR1cm5lZCB1bmRlZmluZWQsIHBheWxvYWQgaXMgc3RpbGwgdGhlIFJvdXRlUmVzb2x2ZXIsIHdoaWNoIGlzIG5vdCBhIGNvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0NvbXBvbmVudFR5cGUgPSBwYXlsb2FkICE9IG51bGwgJiYgcGF5bG9hZCAhPT0gcmVzb2x2ZXIgJiYgKFxuXHRcdFx0XHRcdFx0XHRcdHR5cGVvZiBwYXlsb2FkID09PSAnZnVuY3Rpb24nIHx8XG5cdFx0XHRcdFx0XHRcdFx0KHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JyAmJiAndmlldycgaW4gcGF5bG9hZCAmJiB0eXBlb2YgKHBheWxvYWQgYXMgYW55KS52aWV3ID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRpZiAoaXNDb21wb25lbnRUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENyZWF0ZSBjb21wb25lbnQgdm5vZGUgdXNpbmcgaHlwZXJzY3JpcHRcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXBvbmVudFZub2RlID0gaHlwZXJzY3JpcHQocGF5bG9hZCBhcyBDb21wb25lbnRUeXBlLCBkYXRhLnBhcmFtcylcblx0XHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ2FsbCByZXNvbHZlci5yZW5kZXIgdG8gZ2V0IHRoZSBsYXlvdXQtd3JhcHBlZCB2bm9kZVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gcmVzb2x2ZXIucmVuZGVyIGRvZXM6IG0obGF5b3V0LCBudWxsLCBjb21wb25lbnRWbm9kZSlcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlbmRlcmVkVm5vZGUgPSByZXNvbHZlci5yZW5kZXIoY29tcG9uZW50Vm5vZGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCByZW5kZXJUb1N0cmluZyhyZW5kZXJlZFZub2RlKVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgaHRtbCA9IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnID8gcmVzdWx0IDogcmVzdWx0Lmh0bWxcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChodG1sKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxvZ2dlci5pbmZvKGBSZW5kZXJlZCByb3V0ZSBjb21wb25lbnRgLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm91dGU6IG1hdGNoZWRSb3V0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRodG1sU2l6ZTogaHRtbC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLmVycm9yKCdSb3V0ZSByZW5kZXIgZmFpbGVkJywgZXJyb3IsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJvdXRlOiBtYXRjaGVkUm91dGUsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8gSWYgcGF5bG9hZCBpcyBub3QgYSB2YWxpZCBjb21wb25lbnQsIHNraXAgcmVuZGVyaW5nXG5cdFx0XHRcdFx0XHRcdC8vIFRoaXMgaGFwcGVucyB3aGVuIG9ubWF0Y2ggcmV0dXJucyB1bmRlZmluZWQgLSByZW5kZXIgbmVlZHMgYSBjb21wb25lbnQgdG8gd29yayB3aXRoXG5cdFx0XHRcdFx0XHRcdC8vIEluIHRoaXMgY2FzZSwgd2Ugc2hvdWxkIGZhbGwgdGhyb3VnaCB0byB0aGUgY29tcG9uZW50IHJlbmRlcmluZyBsb2dpYyBiZWxvd1xuXHRcdFx0XHRcdFx0XHQvLyB3aGljaCB3aWxsIGhhbmRsZSB0aGUgUm91dGVSZXNvbHZlciBhcyBhIGNvbXBvbmVudCBpZiBpdCBoYXMgYSB2aWV3IG1ldGhvZFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFJlbmRlciBjb21wb25lbnRcblx0XHRcdFx0XHQvLyBDaGVjayBpZiBwYXlsb2FkIGlzIGEgQ29tcG9uZW50VHlwZSAobm90IGEgUm91dGVSZXNvbHZlcilcblx0XHRcdFx0XHRjb25zdCBpc0NvbXBvbmVudFR5cGUgPSBwYXlsb2FkICE9IG51bGwgJiYgKFxuXHRcdFx0XHRcdFx0dHlwZW9mIHBheWxvYWQgPT09ICdmdW5jdGlvbicgfHxcblx0XHRcdFx0XHRcdCh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcgJiYgJ3ZpZXcnIGluIHBheWxvYWQgJiYgdHlwZW9mIChwYXlsb2FkIGFzIGFueSkudmlldyA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0aWYgKGlzQ29tcG9uZW50VHlwZSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgdm5vZGUgPSBoeXBlcnNjcmlwdChwYXlsb2FkIGFzIENvbXBvbmVudFR5cGUsIGRhdGEucGFyYW1zKVxuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgcmVuZGVyVG9TdHJpbmcodm5vZGUpXG5cdFx0XHRcdFx0XHQvLyBIYW5kbGUgYm90aCBzdHJpbmcgKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpIGFuZCB7aHRtbCwgc3RhdGV9IHJldHVybiB0eXBlc1xuXHRcdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnID8gcmVzdWx0IDogcmVzdWx0XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gRmFsbGJhY2sgdG8gZGl2XG5cdFx0XHRcdFx0Y29uc3Qgdm5vZGUgPSBoeXBlcnNjcmlwdCgnZGl2JywgZGF0YS5wYXJhbXMpXG5cdFx0XHRcdFx0cmV0dXJuIGF3YWl0IHJlbmRlclRvU3RyaW5nKHZub2RlKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vIHJvdXRlIGZvdW5kXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE5vIHJvdXRlIGZvdW5kIGZvciAke3BhdGhuYW1lfWApXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdC8vIFJlc3RvcmUgb3JpZ2luYWwgcHJlZml4IGFuZCBjdXJyZW50UGF0aFxuXHRcdFx0cm91dGUucHJlZml4ID0gc2F2ZWRQcmVmaXhcblx0XHRcdGN1cnJlbnRQYXRoID0gc2F2ZWRDdXJyZW50UGF0aFxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByb3V0ZSBhcyB1bmtub3duIGFzIFJvdXRlICYgKChyb290OiBFbGVtZW50LCBkZWZhdWx0Um91dGU6IHN0cmluZywgcm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcj4pID0+IHZvaWQpICYge3JlZGlyZWN0OiAocGF0aDogc3RyaW5nKSA9PiBSZWRpcmVjdE9iamVjdH1cbn1cbiIsCiAgICAiLy8gU1NSIGFuZCBoeWRyYXRpb24gdXRpbGl0aWVzXG5cbmltcG9ydCB7bG9nZ2VyfSBmcm9tICcuLi9zZXJ2ZXIvbG9nZ2VyJ1xuXG4vLyBEZXZlbG9wbWVudC1vbmx5IGh5ZHJhdGlvbiBkZWJ1Z2dpbmdcbmV4cG9ydCBjb25zdCBIWURSQVRJT05fREVCVUcgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnY/Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbidcblxuLy8gVGhyb3R0bGUgaHlkcmF0aW9uIGVycm9yIGxvZ2dpbmcgdG8gYXZvaWQgcGVyZm9ybWFuY2UgaXNzdWVzXG5sZXQgaHlkcmF0aW9uRXJyb3JDb3VudCA9IDBcbmNvbnN0IE1BWF9IWURSQVRJT05fRVJST1JTID0gMTAgLy8gTGltaXQgbnVtYmVyIG9mIGVycm9ycyBsb2dnZWQgcGVyIHJlbmRlciBjeWNsZVxuXG4vLyBSZXNldCBlcnJvciBjb3VudCBhdCB0aGUgc3RhcnQgb2YgZWFjaCByZW5kZXIgY3ljbGVcbmV4cG9ydCBmdW5jdGlvbiByZXNldEh5ZHJhdGlvbkVycm9yQ291bnQoKTogdm9pZCB7XG5cdGh5ZHJhdGlvbkVycm9yQ291bnQgPSAwXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wb25lbnROYW1lKHZub2RlOiBhbnkpOiBzdHJpbmcge1xuXHRpZiAoIXZub2RlKSByZXR1cm4gJ1Vua25vd24nXG5cdGlmICh0eXBlb2Ygdm5vZGUudGFnID09PSAnc3RyaW5nJykgcmV0dXJuIHZub2RlLnRhZ1xuXHRpZiAodm5vZGUudGFnPy5uYW1lKSByZXR1cm4gdm5vZGUudGFnLm5hbWVcblx0aWYgKHZub2RlLnRhZz8uZGlzcGxheU5hbWUpIHJldHVybiB2bm9kZS50YWcuZGlzcGxheU5hbWVcblx0aWYgKHZub2RlLnN0YXRlPy5jb25zdHJ1Y3Rvcj8ubmFtZSkgcmV0dXJuIHZub2RlLnN0YXRlLmNvbnN0cnVjdG9yLm5hbWVcblx0cmV0dXJuICdVbmtub3duJ1xufVxuXG4vLyBGb3JtYXQgYSBET00gZWxlbWVudCBhcyBhbiBvcGVuaW5nIHRhZyBzdHJpbmdcbmZ1bmN0aW9uIGZvcm1hdERPTUVsZW1lbnQoZWw6IEVsZW1lbnQpOiB7dGFnTmFtZTogc3RyaW5nOyBvcGVuVGFnOiBzdHJpbmc7IGNsb3NlVGFnOiBzdHJpbmd9IHtcblx0Y29uc3QgdGFnTmFtZSA9IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuXHRsZXQgb3BlblRhZyA9IGA8JHt0YWdOYW1lfWBcblxuXHQvLyBBZGQgaW1wb3J0YW50IGF0dHJpYnV0ZXNcblx0aWYgKGVsLmlkKSB7XG5cdFx0b3BlblRhZyArPSBgIGlkPVwiJHtlbC5pZH1cImBcblx0fVxuXHRpZiAoZWwuY2xhc3NOYW1lICYmIHR5cGVvZiBlbC5jbGFzc05hbWUgPT09ICdzdHJpbmcnKSB7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpLmZpbHRlcihjID0+IGMpLnNsaWNlKDAsIDMpLmpvaW4oJyAnKVxuXHRcdGlmIChjbGFzc2VzKSB7XG5cdFx0XHRvcGVuVGFnICs9IGAgY2xhc3NOYW1lPVwiJHtjbGFzc2VzfSR7ZWwuY2xhc3NOYW1lLnNwbGl0KCcgJykubGVuZ3RoID4gMyA/ICcuLi4nIDogJyd9XCJgXG5cdFx0fVxuXHR9XG5cblx0b3BlblRhZyArPSAnPidcblx0cmV0dXJuIHt0YWdOYW1lLCBvcGVuVGFnLCBjbG9zZVRhZzogYDwvJHt0YWdOYW1lfT5gfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VkRPTVRyZWUodm5vZGU6IGFueSwgbWF4RGVwdGg6IG51bWJlciA9IDYsIGN1cnJlbnREZXB0aDogbnVtYmVyID0gMCwgc2hvd0NvbXBvbmVudEluc3RhbmNlOiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XG5cdGlmICghdm5vZGUgfHwgY3VycmVudERlcHRoID49IG1heERlcHRoKSByZXR1cm4gJydcblxuXHRjb25zdCBpbmRlbnQgPSAnICAnLnJlcGVhdChjdXJyZW50RGVwdGgpXG5cblx0Ly8gSGFuZGxlIHRleHQgbm9kZXNcblx0aWYgKHZub2RlLnRhZyA9PT0gJyMnKSB7XG5cdFx0Y29uc3QgdGV4dCA9IFN0cmluZyh2bm9kZS5jaGlsZHJlbiB8fCB2bm9kZS50ZXh0IHx8ICcnKS5zdWJzdHJpbmcoMCwgNTApXG5cdFx0cmV0dXJuIGAke2luZGVudH1cIiR7dGV4dH0ke1N0cmluZyh2bm9kZS5jaGlsZHJlbiB8fCB2bm9kZS50ZXh0IHx8ICcnKS5sZW5ndGggPiA1MCA/ICcuLi4nIDogJyd9XCJgXG5cdH1cblxuXHQvLyBIYW5kbGUgZnJhZ21lbnRzXG5cdGlmICh2bm9kZS50YWcgPT09ICdbJykge1xuXHRcdGlmICghdm5vZGUuY2hpbGRyZW4gfHwgIUFycmF5LmlzQXJyYXkodm5vZGUuY2hpbGRyZW4pIHx8IHZub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGAke2luZGVudH1bZnJhZ21lbnRdYFxuXHRcdH1cblx0XHRjb25zdCB2YWxpZENoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4uZmlsdGVyKChjOiBhbnkpID0+IGMgIT0gbnVsbCkuc2xpY2UoMCwgOClcblx0XHRsZXQgcmVzdWx0ID0gYCR7aW5kZW50fVtmcmFnbWVudF1cXG5gXG5cdFx0Zm9yIChjb25zdCBjaGlsZCBvZiB2YWxpZENoaWxkcmVuKSB7XG5cdFx0XHRyZXN1bHQgKz0gZm9ybWF0VkRPTVRyZWUoY2hpbGQsIG1heERlcHRoLCBjdXJyZW50RGVwdGggKyAxLCBzaG93Q29tcG9uZW50SW5zdGFuY2UpICsgJ1xcbidcblx0XHR9XG5cdFx0aWYgKHZub2RlLmNoaWxkcmVuLmZpbHRlcigoYzogYW55KSA9PiBjICE9IG51bGwpLmxlbmd0aCA+IDgpIHtcblx0XHRcdHJlc3VsdCArPSBgJHtpbmRlbnR9ICAuLi4gKCR7dm5vZGUuY2hpbGRyZW4uZmlsdGVyKChjOiBhbnkpID0+IGMgIT0gbnVsbCkubGVuZ3RoIC0gOH0gbW9yZSlcXG5gXG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQudHJpbUVuZCgpXG5cdH1cblxuXHRjb25zdCBpc0NvbXBvbmVudCA9IHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnXG5cdGNvbnN0IHRhZ05hbWUgPSBpc0NvbXBvbmVudCA/IGdldENvbXBvbmVudE5hbWUodm5vZGUpIDogdm5vZGUudGFnXG5cblx0bGV0IHJlc3VsdCA9IGAke2luZGVudH08JHt0YWdOYW1lfWBcblxuXHQvLyBBZGQga2V5IGlmIHByZXNlbnRcblx0aWYgKHZub2RlLmF0dHJzPy5rZXkpIHtcblx0XHRyZXN1bHQgKz0gYCBrZXk9XCIke3Zub2RlLmF0dHJzLmtleX1cImBcblx0fVxuXG5cdC8vIEFkZCBhIGZldyBpbXBvcnRhbnQgYXR0cmlidXRlcyBmb3IgZGVidWdnaW5nXG5cdGlmICh2bm9kZS5hdHRycykge1xuXHRcdGNvbnN0IGltcG9ydGFudEF0dHJzID0gWydpZCcsICdjbGFzcycsICdjbGFzc05hbWUnXVxuXHRcdGZvciAoY29uc3QgYXR0ciBvZiBpbXBvcnRhbnRBdHRycykge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzW2F0dHJdKSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gdHlwZW9mIHZub2RlLmF0dHJzW2F0dHJdID09PSAnc3RyaW5nJ1xuXHRcdFx0XHRcdD8gdm5vZGUuYXR0cnNbYXR0cl1cblx0XHRcdFx0XHQ6IFN0cmluZyh2bm9kZS5hdHRyc1thdHRyXSlcblx0XHRcdFx0cmVzdWx0ICs9IGAgJHthdHRyfT1cIiR7dmFsdWUuc3Vic3RyaW5nKDAsIDMwKX0ke3ZhbHVlLmxlbmd0aCA+IDMwID8gJy4uLicgOiAnJ31cImBcblx0XHRcdFx0YnJlYWsgLy8gT25seSBzaG93IGZpcnN0IGltcG9ydGFudCBhdHRyIHRvIGtlZXAgaXQgY29uY2lzZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJlc3VsdCArPSAnPidcblxuXHQvLyBGb3IgY29tcG9uZW50cywgc2hvdyB0aGVpciByZW5kZXJlZCBpbnN0YW5jZSAod2hhdCB0aGUgY29tcG9uZW50IGFjdHVhbGx5IHJlbmRlcnMpXG5cdC8vIFRoaXMgZ2l2ZXMgdXMgcGFyZW50IGNvbnRleHQgd2l0aG91dCBwZXJmb3JtYW5jZSBjb3N0XG5cdGlmIChpc0NvbXBvbmVudCAmJiBzaG93Q29tcG9uZW50SW5zdGFuY2UgJiYgdm5vZGUuaW5zdGFuY2UgJiYgY3VycmVudERlcHRoIDwgbWF4RGVwdGggLSAxKSB7XG5cdFx0Y29uc3QgaW5zdGFuY2VUcmVlID0gZm9ybWF0VkRPTVRyZWUodm5vZGUuaW5zdGFuY2UsIG1heERlcHRoLCBjdXJyZW50RGVwdGggKyAxLCBzaG93Q29tcG9uZW50SW5zdGFuY2UpXG5cdFx0aWYgKGluc3RhbmNlVHJlZSkge1xuXHRcdFx0cmVzdWx0ICs9ICdcXG4nICsgaW5zdGFuY2VUcmVlXG5cdFx0fVxuXHR9XG5cblx0Ly8gQWRkIGNoaWxkcmVuXG5cdGlmICh2bm9kZS5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KHZub2RlLmNoaWxkcmVuKSAmJiBjdXJyZW50RGVwdGggPCBtYXhEZXB0aCAtIDEpIHtcblx0XHRjb25zdCB2YWxpZENoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4uZmlsdGVyKChjOiBhbnkpID0+IGMgIT0gbnVsbCkuc2xpY2UoMCwgMTApXG5cdFx0aWYgKHZhbGlkQ2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0cmVzdWx0ICs9ICdcXG4nXG5cdFx0XHRmb3IgKGNvbnN0IGNoaWxkIG9mIHZhbGlkQ2hpbGRyZW4pIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBjaGlsZCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGNoaWxkID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdGNvbnN0IHRleHQgPSBTdHJpbmcoY2hpbGQpLnN1YnN0cmluZygwLCA1MClcblx0XHRcdFx0XHRyZXN1bHQgKz0gYCR7aW5kZW50fSAgXCIke3RleHR9JHtTdHJpbmcoY2hpbGQpLmxlbmd0aCA+IDUwID8gJy4uLicgOiAnJ31cIlxcbmBcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBjaGlsZFRyZWUgPSBmb3JtYXRWRE9NVHJlZShjaGlsZCwgbWF4RGVwdGgsIGN1cnJlbnREZXB0aCArIDEsIHNob3dDb21wb25lbnRJbnN0YW5jZSlcblx0XHRcdFx0XHRpZiAoY2hpbGRUcmVlKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgKz0gY2hpbGRUcmVlICsgJ1xcbidcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh2bm9kZS5jaGlsZHJlbi5maWx0ZXIoKGM6IGFueSkgPT4gYyAhPSBudWxsKS5sZW5ndGggPiAxMCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gYCR7aW5kZW50fSAgLi4uICgke3Zub2RlLmNoaWxkcmVuLmZpbHRlcigoYzogYW55KSA9PiBjICE9IG51bGwpLmxlbmd0aCAtIDEwfSBtb3JlIGNoaWxkcmVuKVxcbmBcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAodm5vZGUudGV4dCAhPSBudWxsKSB7XG5cdFx0Y29uc3QgdGV4dCA9IFN0cmluZyh2bm9kZS50ZXh0KS5zdWJzdHJpbmcoMCwgNTApXG5cdFx0cmVzdWx0ICs9IGAgXCIke3RleHR9JHtTdHJpbmcodm5vZGUudGV4dCkubGVuZ3RoID4gNTAgPyAnLi4uJyA6ICcnfVwiYFxuXHR9XG5cblx0cmVzdWx0ICs9IGAke2luZGVudH08LyR7dGFnTmFtZX0+YFxuXG5cdHJldHVybiByZXN1bHRcbn1cblxuLy8gQ29tYmluZSBET00gcGFyZW50IGNoYWluIHdpdGggVkRPTSBzdHJ1Y3R1cmUgaW50byBhIHNpbmdsZSBIVE1MLWxpa2UgdHJlZVxuZnVuY3Rpb24gZm9ybWF0Q29tYmluZWRTdHJ1Y3R1cmUocGFyZW50OiBFbGVtZW50IHwgTm9kZSB8IG51bGwsIHZub2RlOiBhbnksIG1heFBhcmVudHM6IG51bWJlciA9IDQpOiBzdHJpbmcge1xuXHRpZiAoIXBhcmVudCAmJiAhdm5vZGUpIHJldHVybiAnJ1xuXG5cdC8vIENvbGxlY3QgRE9NIHBhcmVudHMgKGZyb20gb3V0ZXJtb3N0IHRvIGlubmVybW9zdClcblx0Y29uc3QgZG9tRWxlbWVudHM6IHtvcGVuVGFnOiBzdHJpbmc7IGNsb3NlVGFnOiBzdHJpbmd9W10gPSBbXVxuXHRsZXQgY3VycmVudDogTm9kZSB8IG51bGwgPSBwYXJlbnRcblx0bGV0IGRlcHRoID0gMFxuXG5cdHdoaWxlIChjdXJyZW50ICYmIGRlcHRoIDwgbWF4UGFyZW50cykge1xuXHRcdGlmIChjdXJyZW50Lm5vZGVUeXBlID09PSAxKSB7IC8vIEVsZW1lbnQgbm9kZVxuXHRcdFx0Y29uc3QgZWwgPSBjdXJyZW50IGFzIEVsZW1lbnRcblx0XHRcdC8vIFNraXAgaHRtbCBhbmQgYm9keSB0YWdzIC0gdGhleSdyZSBub3QgdXNlZnVsIGNvbnRleHRcblx0XHRcdGlmIChlbC50YWdOYW1lICE9PSAnSFRNTCcgJiYgZWwudGFnTmFtZSAhPT0gJ0JPRFknKSB7XG5cdFx0XHRcdGRvbUVsZW1lbnRzLnVuc2hpZnQoZm9ybWF0RE9NRWxlbWVudChlbCkpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQgfHwgY3VycmVudC5wYXJlbnROb2RlXG5cdFx0ZGVwdGgrK1xuXHR9XG5cblx0Ly8gQnVpbGQgdGhlIGNvbWJpbmVkIG91dHB1dFxuXHRjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXVxuXG5cdC8vIE9wZW5pbmcgdGFncyBmb3IgRE9NIHBhcmVudHNcblx0ZG9tRWxlbWVudHMuZm9yRWFjaCgoZWwsIGkpID0+IHtcblx0XHRsaW5lcy5wdXNoKCcgICcucmVwZWF0KGkpICsgZWwub3BlblRhZylcblx0fSlcblxuXHQvLyBWRE9NIHN0cnVjdHVyZSAoaW5kZW50ZWQgaW5zaWRlIHRoZSBET00gcGFyZW50cylcblx0aWYgKHZub2RlKSB7XG5cdFx0Y29uc3QgdmRvbUluZGVudCA9IGRvbUVsZW1lbnRzLmxlbmd0aFxuXHRcdGNvbnN0IHZkb21UcmVlID0gZm9ybWF0VkRPTVRyZWUodm5vZGUsIDQsIDAsIHRydWUpXG5cdFx0aWYgKHZkb21UcmVlKSB7XG5cdFx0XHQvLyBJbmRlbnQgZWFjaCBsaW5lIG9mIHRoZSBWRE9NIHRyZWVcblx0XHRcdGNvbnN0IHZkb21MaW5lcyA9IHZkb21UcmVlLnNwbGl0KCdcXG4nKVxuXHRcdFx0dmRvbUxpbmVzLmZvckVhY2gobGluZSA9PiB7XG5cdFx0XHRcdGxpbmVzLnB1c2goJyAgJy5yZXBlYXQodmRvbUluZGVudCkgKyBsaW5lKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHQvLyBDbG9zaW5nIHRhZ3MgZm9yIERPTSBwYXJlbnRzIChpbiByZXZlcnNlIG9yZGVyKVxuXHRmb3IgKGxldCBpID0gZG9tRWxlbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRsaW5lcy5wdXNoKCcgICcucmVwZWF0KGkpICsgZG9tRWxlbWVudHNbaV0uY2xvc2VUYWcpXG5cdH1cblxuXHRyZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZnVuY3Rpb24gYnVpbGRDb21wb25lbnRQYXRoKHZub2RlOiBhbnksIGNvbnRleHQ/OiB7b2xkVm5vZGU/OiBhbnk7IG5ld1Zub2RlPzogYW55fSk6IHN0cmluZ1tdIHtcblx0Y29uc3QgcGF0aDogc3RyaW5nW10gPSBbXVxuXG5cdGNvbnN0IHRyYXZlcnNlVm5vZGUgPSAodjogYW55LCBkZXB0aDogbnVtYmVyID0gMCk6IGJvb2xlYW4gPT4ge1xuXHRcdGlmICghdiB8fCBkZXB0aCA+IDEwKSByZXR1cm4gZmFsc2VcblxuXHRcdGNvbnN0IG5hbWUgPSBnZXRDb21wb25lbnROYW1lKHYpXG5cdFx0Y29uc3QgaXNDb21wb25lbnQgPSB0eXBlb2Ygdi50YWcgIT09ICdzdHJpbmcnICYmIG5hbWUgIT09ICdVbmtub3duJyAmJiBuYW1lICE9PSAnQ29tcG9uZW50JyAmJiBuYW1lICE9PSAnQW5vbnltb3VzQ29tcG9uZW50J1xuXG5cdFx0aWYgKGlzQ29tcG9uZW50KSB7XG5cdFx0XHRwYXRoLnB1c2gobmFtZSlcblx0XHR9XG5cblx0XHRpZiAodi5pbnN0YW5jZSAmJiBkZXB0aCA8IDIpIHtcblx0XHRcdGlmICh0cmF2ZXJzZVZub2RlKHYuaW5zdGFuY2UsIGRlcHRoICsgMSkpIHJldHVybiB0cnVlXG5cdFx0fVxuXG5cdFx0aWYgKHYuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheSh2LmNoaWxkcmVuKSAmJiBkZXB0aCA8IDIpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4odi5jaGlsZHJlbi5sZW5ndGgsIDMpOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgY2hpbGQgPSB2LmNoaWxkcmVuW2ldXG5cdFx0XHRcdGlmIChjaGlsZCAmJiB0cmF2ZXJzZVZub2RlKGNoaWxkLCBkZXB0aCArIDEpKSByZXR1cm4gdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0aWYgKGNvbnRleHQ/Lm5ld1Zub2RlKSB7XG5cdFx0dHJhdmVyc2VWbm9kZShjb250ZXh0Lm5ld1Zub2RlKVxuXHRcdGlmIChwYXRoLmxlbmd0aCA+IDApIHJldHVybiBwYXRoXG5cdH1cblx0aWYgKGNvbnRleHQ/Lm9sZFZub2RlKSB7XG5cdFx0dHJhdmVyc2VWbm9kZShjb250ZXh0Lm9sZFZub2RlKVxuXHRcdGlmIChwYXRoLmxlbmd0aCA+IDApIHJldHVybiBwYXRoXG5cdH1cblxuXHRpZiAodm5vZGUpIHtcblx0XHR0cmF2ZXJzZVZub2RlKHZub2RlKVxuXHR9XG5cblx0cmV0dXJuIHBhdGhcbn1cblxuZnVuY3Rpb24gZm9ybWF0Q29tcG9uZW50SGllcmFyY2h5KHZub2RlOiBhbnksIGNvbnRleHQ/OiB7b2xkVm5vZGU/OiBhbnk7IG5ld1Zub2RlPzogYW55fSk6IHN0cmluZyB7XG5cdGlmICghdm5vZGUpIHJldHVybiAnVW5rbm93bidcblxuXHRjb25zdCBwYXRoID0gYnVpbGRDb21wb25lbnRQYXRoKHZub2RlLCBjb250ZXh0KVxuXHRjb25zdCBpbW1lZGlhdGVOYW1lID0gZ2V0Q29tcG9uZW50TmFtZSh2bm9kZSlcblx0Y29uc3QgaXNFbGVtZW50ID0gdHlwZW9mIHZub2RlLnRhZyA9PT0gJ3N0cmluZydcblxuXHRpZiAocGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgcGF0aFN0ciA9IHBhdGguam9pbignIOKGkiAnKVxuXHRcdGlmIChpc0VsZW1lbnQgJiYgaW1tZWRpYXRlTmFtZSAhPT0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdKSB7XG5cdFx0XHRyZXR1cm4gYCR7aW1tZWRpYXRlTmFtZX0gaW4gJHtwYXRoU3RyfWBcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHBhdGhTdHJcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gaW1tZWRpYXRlTmFtZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEh5ZHJhdGlvbkVycm9yQ29udGV4dCB7XG5cdHBhcmVudD86IEVsZW1lbnRcblx0bm9kZT86IE5vZGVcblx0bWF0Y2hlZE5vZGVzPzogU2V0PE5vZGU+XG5cdG9sZFZub2RlPzogYW55XG5cdG5ld1Zub2RlPzogYW55XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dIeWRyYXRpb25FcnJvcihcblx0b3BlcmF0aW9uOiBzdHJpbmcsXG5cdHZub2RlOiBhbnksXG5cdF9lbGVtZW50OiBFbGVtZW50IHwgbnVsbCxcblx0ZXJyb3I6IEVycm9yLFxuXHRjb250ZXh0PzogSHlkcmF0aW9uRXJyb3JDb250ZXh0LFxuKTogdm9pZCB7XG5cdC8vIFVwZGF0ZSBoeWRyYXRpb24gc3RhdGlzdGljc1xuXHR1cGRhdGVIeWRyYXRpb25TdGF0cyh2bm9kZSlcblx0XG5cdC8vIFRocm90dGxlIGVycm9yIGxvZ2dpbmcgdG8gYXZvaWQgcGVyZm9ybWFuY2UgaXNzdWVzXG5cdGh5ZHJhdGlvbkVycm9yQ291bnQrK1xuXHRpZiAoaHlkcmF0aW9uRXJyb3JDb3VudCA+IE1BWF9IWURSQVRJT05fRVJST1JTKSB7XG5cdFx0aWYgKGh5ZHJhdGlvbkVycm9yQ291bnQgPT09IE1BWF9IWURSQVRJT05fRVJST1JTICsgMSkge1xuXHRcdFx0Y29uc3QgdG9wQ29tcG9uZW50cyA9IEFycmF5LmZyb20oaHlkcmF0aW9uU3RhdHMuY29tcG9uZW50TWlzbWF0Y2hlcy5lbnRyaWVzKCkpXG5cdFx0XHRcdC5zb3J0KChhLCBiKSA9PiBiWzFdIC0gYVsxXSlcblx0XHRcdFx0LnNsaWNlKDAsIDUpXG5cdFx0XHRcdC5tYXAoKFtuYW1lLCBjb3VudF0pID0+IGAke25hbWV9OiAke2NvdW50fWApXG5cdFx0XHRcdC5qb2luKCcsICcpXG5cdFx0XHRcblx0XHRcdGxvZ2dlci53YXJuKGBIeWRyYXRpb24gZXJyb3JzIHRocm90dGxlZDogTW9yZSB0aGFuICR7TUFYX0hZRFJBVElPTl9FUlJPUlN9IGVycm9ycyBkZXRlY3RlZC4gU3VwcHJlc3NpbmcgZnVydGhlciBsb2dzIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UuYCwge1xuXHRcdFx0XHR0b3RhbE1pc21hdGNoZXM6IGh5ZHJhdGlvblN0YXRzLnRvdGFsTWlzbWF0Y2hlcyxcblx0XHRcdFx0dG9wQ29tcG9uZW50czogdG9wQ29tcG9uZW50cyB8fCAnbm9uZScsXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRyZXR1cm5cblx0fVxuXG5cdC8vIEJ1aWxkIHVzZXItZnJpZW5kbHkgY29tcG9uZW50IGhpZXJhcmNoeVxuXHRjb25zdCBjb21wb25lbnRIaWVyYXJjaHkgPSBmb3JtYXRDb21wb25lbnRIaWVyYXJjaHkodm5vZGUsIGNvbnRleHQpXG5cblx0Ly8gTG9nIGh5ZHJhdGlvbiBlcnJvciB3aXRoIHN0cnVjdHVyZWQgY29udGV4dFxuXHRjb25zdCBsb2dDb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuXHRcdGNvbXBvbmVudFBhdGg6IGNvbXBvbmVudEhpZXJhcmNoeSxcblx0XHRvcGVyYXRpb24sXG5cdH1cblx0XG5cdGlmIChjb250ZXh0Py5ub2RlKSB7XG5cdFx0bG9nQ29udGV4dC5hZmZlY3RlZE5vZGUgPSBjb250ZXh0Lm5vZGUubm9kZVR5cGUgPT09IDFcblx0XHRcdD8gYCR7KGNvbnRleHQubm9kZSBhcyBFbGVtZW50KS50YWdOYW1lLnRvTG93ZXJDYXNlKCl9YFxuXHRcdFx0OiAndGV4dCdcblx0fVxuXHRcblx0Ly8gSW5jbHVkZSBzdHJ1Y3R1cmUgaW5mbyBpbiBkZWJ1ZyBtb2RlXG5cdGlmIChIWURSQVRJT05fREVCVUcpIHtcblx0XHRjb25zdCB2bm9kZVRvU2hvdyA9IGNvbnRleHQ/Lm9sZFZub2RlIHx8IHZub2RlIHx8IGNvbnRleHQ/Lm5ld1Zub2RlXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGNvbWJpbmVkU3RydWN0dXJlID0gZm9ybWF0Q29tYmluZWRTdHJ1Y3R1cmUoY29udGV4dD8ucGFyZW50IHx8IG51bGwsIHZub2RlVG9TaG93LCA0KVxuXHRcdFx0aWYgKGNvbWJpbmVkU3RydWN0dXJlKSB7XG5cdFx0XHRcdGxvZ0NvbnRleHQuc3RydWN0dXJlID0gY29tYmluZWRTdHJ1Y3R1cmVcblx0XHRcdH1cblx0XHR9IGNhdGNoKF9lKSB7XG5cdFx0XHQvLyBGYWxsYmFjazogdHJ5IHRvIHNob3cgYXQgbGVhc3QgdGhlIFZET00gc3RydWN0dXJlXG5cdFx0XHRpZiAodm5vZGVUb1Nob3cpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCB2ZG9tVHJlZSA9IGZvcm1hdFZET01UcmVlKHZub2RlVG9TaG93LCA0LCAwLCB0cnVlKVxuXHRcdFx0XHRcdGlmICh2ZG9tVHJlZSkge1xuXHRcdFx0XHRcdFx0bG9nQ29udGV4dC52ZG9tU3RydWN0dXJlID0gdmRvbVRyZWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2goX2UyKSB7XG5cdFx0XHRcdFx0bG9nQ29udGV4dC5jb21wb25lbnQgPSBnZXRDb21wb25lbnROYW1lKHZub2RlVG9TaG93KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNob3cgd2hhdCdzIGJlaW5nIHJlbW92ZWQgdnMgd2hhdCdzIHJlcGxhY2luZyBpdCAoaWYgYm90aCBleGlzdClcblx0XHRpZiAoY29udGV4dD8ub2xkVm5vZGUgJiYgY29udGV4dD8ubmV3Vm5vZGUpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG9sZFRyZWUgPSBmb3JtYXRWRE9NVHJlZShjb250ZXh0Lm9sZFZub2RlLCAzKVxuXHRcdFx0XHRjb25zdCBuZXdUcmVlID0gZm9ybWF0VkRPTVRyZWUoY29udGV4dC5uZXdWbm9kZSwgMylcblx0XHRcdFx0aWYgKG9sZFRyZWUpIGxvZ0NvbnRleHQucmVtb3ZpbmcgPSBvbGRUcmVlXG5cdFx0XHRcdGlmIChuZXdUcmVlKSBsb2dDb250ZXh0LnJlcGxhY2luZ1dpdGggPSBuZXdUcmVlXG5cdFx0XHR9IGNhdGNoKF9lKSB7XG5cdFx0XHRcdC8vIFNpbGVudGx5IGZhaWwgaWYgZm9ybWF0dGluZyBkb2Vzbid0IHdvcmtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdGlmIChvcGVyYXRpb24uaW5jbHVkZXMoJ3JlbW92ZUNoaWxkJykgfHwgb3BlcmF0aW9uLmluY2x1ZGVzKCdyZW1vdmVET00nKSkge1xuXHRcdGxvZ0NvbnRleHQuaGFuZGxlZEdyYWNlZnVsbHkgPSB0cnVlXG5cdH1cblx0XG5cdGxvZ2dlci5lcnJvcihgSHlkcmF0aW9uIGVycm9yOiAke29wZXJhdGlvbn1gLCBlcnJvciwgbG9nQ29udGV4dClcbn1cblxuLy8gVHJhY2sgaHlkcmF0aW9uIHN0YXRpc3RpY3MgZm9yIGRlYnVnZ2luZ1xuaW50ZXJmYWNlIEh5ZHJhdGlvblN0YXRzIHtcblx0dG90YWxNaXNtYXRjaGVzOiBudW1iZXJcblx0Y29tcG9uZW50TWlzbWF0Y2hlczogTWFwPHN0cmluZywgbnVtYmVyPlxuXHRsYXN0TWlzbWF0Y2hUaW1lOiBudW1iZXJcbn1cblxubGV0IGh5ZHJhdGlvblN0YXRzOiBIeWRyYXRpb25TdGF0cyA9IHtcblx0dG90YWxNaXNtYXRjaGVzOiAwLFxuXHRjb21wb25lbnRNaXNtYXRjaGVzOiBuZXcgTWFwKCksXG5cdGxhc3RNaXNtYXRjaFRpbWU6IDAsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIeWRyYXRpb25TdGF0cygpOiBIeWRyYXRpb25TdGF0cyB7XG5cdHJldHVybiB7Li4uaHlkcmF0aW9uU3RhdHMsIGNvbXBvbmVudE1pc21hdGNoZXM6IG5ldyBNYXAoaHlkcmF0aW9uU3RhdHMuY29tcG9uZW50TWlzbWF0Y2hlcyl9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldEh5ZHJhdGlvblN0YXRzKCk6IHZvaWQge1xuXHRoeWRyYXRpb25TdGF0cyA9IHtcblx0XHR0b3RhbE1pc21hdGNoZXM6IDAsXG5cdFx0Y29tcG9uZW50TWlzbWF0Y2hlczogbmV3IE1hcCgpLFxuXHRcdGxhc3RNaXNtYXRjaFRpbWU6IDAsXG5cdH1cbn1cblxuLy8gVXBkYXRlIHN0YXRzIHdoZW4gaHlkcmF0aW9uIGVycm9yIG9jY3Vyc1xuZnVuY3Rpb24gdXBkYXRlSHlkcmF0aW9uU3RhdHModm5vZGU6IGFueSk6IHZvaWQge1xuXHRoeWRyYXRpb25TdGF0cy50b3RhbE1pc21hdGNoZXMrK1xuXHRoeWRyYXRpb25TdGF0cy5sYXN0TWlzbWF0Y2hUaW1lID0gRGF0ZS5ub3coKVxuXHRjb25zdCBjb21wb25lbnROYW1lID0gZ2V0Q29tcG9uZW50TmFtZSh2bm9kZSlcblx0Y29uc3QgY3VycmVudENvdW50ID0gaHlkcmF0aW9uU3RhdHMuY29tcG9uZW50TWlzbWF0Y2hlcy5nZXQoY29tcG9uZW50TmFtZSkgfHwgMFxuXHRoeWRyYXRpb25TdGF0cy5jb21wb25lbnRNaXNtYXRjaGVzLnNldChjb21wb25lbnROYW1lLCBjdXJyZW50Q291bnQgKyAxKVxufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBuZXcgV2Vha01hcDxOb2RlLCBudW1iZXI+KClcbiIsCiAgICAiaW1wb3J0IGRlbGF5ZWRSZW1vdmFsIGZyb20gJy4vZGVsYXllZFJlbW92YWwnXG5cbmltcG9ydCB0eXBlIHtWbm9kZX0gZnJvbSAnLi92bm9kZSdcblxuZnVuY3Rpb24qIGRvbUZvcih2bm9kZTogVm5vZGUpOiBHZW5lcmF0b3I8Tm9kZSwgdm9pZCwgdW5rbm93bj4ge1xuXHQvLyBUbyBhdm9pZCB1bmludGVuZGVkIG1hbmdsaW5nIG9mIHRoZSBpbnRlcm5hbCBidW5kbGVyLFxuXHQvLyBwYXJhbWV0ZXIgZGVzdHJ1Y3R1cmluZyBpcyBub3QgdXNlZCBoZXJlLlxuXHRsZXQgZG9tID0gdm5vZGUuZG9tXG5cdGxldCBkb21TaXplID0gdm5vZGUuZG9tU2l6ZVxuXHRjb25zdCBnZW5lcmF0aW9uID0gZGVsYXllZFJlbW92YWwuZ2V0KGRvbSEpXG5cdGRvIHtcblx0XHRjb25zdCBuZXh0U2libGluZyA9IGRvbSEubmV4dFNpYmxpbmdcblxuXHRcdGlmIChkZWxheWVkUmVtb3ZhbC5nZXQoZG9tISkgPT09IGdlbmVyYXRpb24pIHtcblx0XHRcdHlpZWxkIGRvbSFcblx0XHRcdGRvbVNpemUhLS1cblx0XHR9XG5cblx0XHRkb20gPSBuZXh0U2libGluZyBhcyBOb2RlIHwgbnVsbFxuXHR9XG5cdHdoaWxlIChkb21TaXplKVxufVxuXG5leHBvcnQgZGVmYXVsdCBkb21Gb3JcbiIsCiAgICAiaW1wb3J0IHtzZXRDdXJyZW50Q29tcG9uZW50LCBjbGVhckN1cnJlbnRDb21wb25lbnQsIGNsZWFyQ29tcG9uZW50RGVwZW5kZW5jaWVzfSBmcm9tICcuLi9zaWduYWwnXG5pbXBvcnQge2xvZ0h5ZHJhdGlvbkVycm9yLCByZXNldEh5ZHJhdGlvbkVycm9yQ291bnR9IGZyb20gJy4uL3V0aWwvc3NyJ1xuaW1wb3J0IHtsb2dnZXJ9IGZyb20gJy4uL3NlcnZlci9sb2dnZXInXG5cbmltcG9ydCBWbm9kZSBmcm9tICcuL3Zub2RlJ1xuaW1wb3J0IGRlbGF5ZWRSZW1vdmFsIGZyb20gJy4vZGVsYXllZFJlbW92YWwnXG5pbXBvcnQgZG9tRm9yIGZyb20gJy4vZG9tRm9yJ1xuaW1wb3J0IGNhY2hlZEF0dHJzSXNTdGF0aWNNYXAgZnJvbSAnLi9jYWNoZWRBdHRyc0lzU3RhdGljTWFwJ1xuXG5pbXBvcnQgdHlwZSB7Vm5vZGUgYXMgVm5vZGVUeXBlLCBDaGlsZHJlbn0gZnJvbSAnLi92bm9kZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyRmFjdG9yeSgpIHtcblx0Y29uc3QgbmFtZVNwYWNlOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuXHRcdHN2ZzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcblx0XHRtYXRoOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCcsXG5cdH1cblxuXHRsZXQgY3VycmVudFJlZHJhdzogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkXG5cdGxldCBjdXJyZW50UmVuZGVyOiBhbnlcblx0Ly8gVHJhY2sgaHlkcmF0aW9uIG1pc21hdGNoZXMgZm9yIG92ZXJyaWRlIG1vZGVcblx0bGV0IGh5ZHJhdGlvbk1pc21hdGNoQ291bnQgPSAwXG5cdGNvbnN0IE1BWF9IWURSQVRJT05fTUlTTUFUQ0hFUyA9IDVcblxuXHRmdW5jdGlvbiBnZXREb2N1bWVudChkb206IE5vZGUpOiBEb2N1bWVudCB7XG5cdFx0cmV0dXJuIGRvbS5vd25lckRvY3VtZW50IVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0TmFtZVNwYWNlKHZub2RlOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB2bm9kZS5hdHRycyAmJiB2bm9kZS5hdHRycy54bWxucyB8fCBuYW1lU3BhY2Vbdm5vZGUudGFnXVxuXHR9XG5cblx0Ly8gc2FuaXR5IGNoZWNrIHRvIGRpc2NvdXJhZ2UgcGVvcGxlIGZyb20gZG9pbmcgYHZub2RlLnN0YXRlID0gLi4uYFxuXHRmdW5jdGlvbiBjaGVja1N0YXRlKHZub2RlOiBhbnksIG9yaWdpbmFsOiBhbnkpIHtcblx0XHRpZiAodm5vZGUuc3RhdGUgIT09IG9yaWdpbmFsKSB0aHJvdyBuZXcgRXJyb3IoJ1xcJ3Zub2RlLnN0YXRlXFwnIG11c3Qgbm90IGJlIG1vZGlmaWVkLicpXG5cdH1cblxuXHQvLyBOb3RlOiB0aGUgaG9vayBpcyBwYXNzZWQgYXMgdGhlIGB0aGlzYCBhcmd1bWVudCB0byBhbGxvdyBwcm94eWluZyB0aGVcblx0Ly8gYXJndW1lbnRzIHdpdGhvdXQgcmVxdWlyaW5nIGEgZnVsbCBhcnJheSBhbGxvY2F0aW9uIHRvIGRvIHNvLiBJdCBhbHNvXG5cdC8vIHRha2VzIGFkdmFudGFnZSBvZiB0aGUgZmFjdCB0aGUgY3VycmVudCBgdm5vZGVgIGlzIHRoZSBmaXJzdCBhcmd1bWVudCBpblxuXHQvLyBhbGwgbGlmZWN5Y2xlIG1ldGhvZHMuXG5cdGZ1bmN0aW9uIGNhbGxIb29rKHRoaXM6IGFueSwgdm5vZGU6IGFueSwgLi4uYXJnczogYW55W10pIHtcblx0XHRjb25zdCBvcmlnaW5hbCA9IHZub2RlLnN0YXRlXG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB0aGlzLmFwcGx5KG9yaWdpbmFsLCBbdm5vZGUsIC4uLmFyZ3NdKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRjaGVja1N0YXRlKHZub2RlLCBvcmlnaW5hbClcblx0XHR9XG5cdH1cblxuXHQvLyBJRTExIChhdCBsZWFzdCkgdGhyb3dzIGFuIFVuc3BlY2lmaWVkRXJyb3Igd2hlbiBhY2Nlc3NpbmcgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCB3aGVuXG5cdC8vIGluc2lkZSBhbiBpZnJhbWUuIENhdGNoIGFuZCBzd2FsbG93IHRoaXMgZXJyb3IsIGFuZCBoZWF2eS1oYW5kaWRseSByZXR1cm4gbnVsbC5cblx0ZnVuY3Rpb24gYWN0aXZlRWxlbWVudChkb206IE5vZGUpOiBFbGVtZW50IHwgbnVsbCB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBnZXREb2N1bWVudChkb20pLmFjdGl2ZUVsZW1lbnRcblx0XHR9IGNhdGNoKF9lKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXHQvLyBjcmVhdGVcblx0ZnVuY3Rpb24gY3JlYXRlTm9kZXMocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGVzOiAoVm5vZGVUeXBlIHwgbnVsbClbXSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0Ly8gVHJhY2sgd2hpY2ggRE9NIG5vZGVzIHdlJ3ZlIG1hdGNoZWQgZHVyaW5nIGh5ZHJhdGlvbiB0byBhdm9pZCByZXVzaW5nIHRoZSBzYW1lIG5vZGUgdHdpY2Vcblx0XHQvLyBDcmVhdGUgYSBuZXcgc2V0IGlmIG5vdCBwcm92aWRlZCBhbmQgd2UncmUgaHlkcmF0aW5nIGF0IHRoZSByb290IGxldmVsXG5cdFx0Y29uc3QgY3JlYXRlZE1hdGNoZWROb2RlcyA9IG1hdGNoZWROb2RlcyA9PSBudWxsICYmIGlzSHlkcmF0aW5nICYmIG5leHRTaWJsaW5nID09IG51bGxcblx0XHRpZiAoY3JlYXRlZE1hdGNoZWROb2Rlcykge1xuXHRcdFx0bWF0Y2hlZE5vZGVzID0gbmV3IFNldDxOb2RlPigpXG5cdFx0fVxuXHRcdGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHRjb25zdCB2bm9kZSA9IHZub2Rlc1tpXVxuXHRcdFx0aWYgKHZub2RlICE9IG51bGwpIHtcblx0XHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZywgbWF0Y2hlZE5vZGVzKVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBBZnRlciBjcmVhdGluZy9tYXRjaGluZyBhbGwgbm9kZXMsIHJlbW92ZSBhbnkgdW5tYXRjaGVkIG5vZGVzIHRoYXQgcmVtYWluXG5cdFx0Ly8gT25seSBkbyB0aGlzIGF0IHRoZSByb290IGxldmVsIHRvIGF2b2lkIHJlbW92aW5nIG5vZGVzIHRoYXQgYXJlIHBhcnQgb2YgbWF0Y2hlZCBzdWJ0cmVlc1xuXHRcdGlmIChjcmVhdGVkTWF0Y2hlZE5vZGVzICYmIG1hdGNoZWROb2RlcyAmJiBwYXJlbnQuZmlyc3RDaGlsZCAmJiBuZXh0U2libGluZyA9PSBudWxsKSB7XG5cdFx0XHRsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBwYXJlbnQuZmlyc3RDaGlsZFxuXHRcdFx0d2hpbGUgKG5vZGUpIHtcblx0XHRcdFx0Y29uc3QgbmV4dDogTm9kZSB8IG51bGwgPSBub2RlLm5leHRTaWJsaW5nXG5cdFx0XHRcdGlmICghbWF0Y2hlZE5vZGVzLmhhcyhub2RlKSkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSlcblx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGVycm9yID0gZSBhcyBFcnJvclxuXHRcdFx0XHRcdFx0bG9nSHlkcmF0aW9uRXJyb3IoXG5cdFx0XHRcdFx0XHRcdCdyZW1vdmVDaGlsZCAocm9vdCBsZXZlbCBjbGVhbnVwKScsXG5cdFx0XHRcdFx0XHRcdG51bGwsIC8vIE5vIHZub2RlIGF0IHJvb3QgbGV2ZWxcblx0XHRcdFx0XHRcdFx0cGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHR7cGFyZW50OiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogdW5kZWZpbmVkLCBub2RlLCBtYXRjaGVkTm9kZXN9LFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmUtdGhyb3cgLSB3ZSd2ZSBhbHJlYWR5IGxvZ2dlZCB0aGUgZXJyb3Igd2l0aCBhbGwgZGV0YWlsc1xuXHRcdFx0XHRcdFx0Ly8gUmUtdGhyb3dpbmcgY2F1c2VzIHRoZSBicm93c2VyIHRvIGxvZyB0aGUgRE9NRXhjZXB0aW9uIHN0YWNrIHRyYWNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdG5vZGUgPSBuZXh0XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZU5vZGUocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UsIG1hdGNoZWROb2RlczogU2V0PE5vZGU+IHwgbnVsbCA9IG51bGwpIHtcblx0XHRjb25zdCB0YWcgPSB2bm9kZS50YWdcblx0XHRpZiAodHlwZW9mIHRhZyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHZub2RlLnN0YXRlID0ge31cblx0XHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSBpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdFx0c3dpdGNoICh0YWcpIHtcblx0XHRcdFx0Y2FzZSAnIyc6IGNyZWF0ZVRleHQocGFyZW50LCB2bm9kZSwgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpOyBicmVha1xuXHRcdFx0XHRjYXNlICc8JzogY3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBucywgbmV4dFNpYmxpbmcpOyBicmVha1xuXHRcdFx0XHRjYXNlICdbJzogY3JlYXRlRnJhZ21lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcyk7IGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6IGNyZWF0ZUVsZW1lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcylcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBjcmVhdGVDb21wb25lbnQocGFyZW50LCB2bm9kZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVUZXh0KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSwgbWF0Y2hlZE5vZGVzOiBTZXQ8Tm9kZT4gfCBudWxsID0gbnVsbCkge1xuXHRcdGxldCB0ZXh0Tm9kZTogVGV4dFxuXHRcdGlmIChpc0h5ZHJhdGluZyAmJiBwYXJlbnQuZmlyc3RDaGlsZCAmJiBuZXh0U2libGluZyA9PSBudWxsICYmIG1hdGNoZWROb2Rlcykge1xuXHRcdFx0Ly8gRHVyaW5nIGh5ZHJhdGlvbiwgdHJ5IHRvIHJldXNlIGV4aXN0aW5nIHRleHQgbm9kZVxuXHRcdFx0Ly8gTm9ybWFsaXplIHRleHQgZm9yIGNvbXBhcmlzb24gKHRyaW0gd2hpdGVzcGFjZSBkaWZmZXJlbmNlcylcblx0XHRcdGNvbnN0IGV4cGVjdGVkVGV4dCA9IFN0cmluZyh2bm9kZS5jaGlsZHJlbiB8fCAnJykudHJpbSgpXG5cdFx0XHRsZXQgY2FuZGlkYXRlOiBOb2RlIHwgbnVsbCA9IHBhcmVudC5maXJzdENoaWxkXG5cdFx0XHR3aGlsZSAoY2FuZGlkYXRlKSB7XG5cdFx0XHRcdGlmIChjYW5kaWRhdGUubm9kZVR5cGUgPT09IDMgJiYgIW1hdGNoZWROb2Rlcy5oYXMoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZVRleHQgPSBjYW5kaWRhdGUgYXMgVGV4dFxuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZVZhbHVlID0gY2FuZGlkYXRlVGV4dC5ub2RlVmFsdWUgfHwgJydcblx0XHRcdFx0XHQvLyBFeGFjdCBtYXRjaCBwcmVmZXJyZWQsIGJ1dCBhbHNvIGFjY2VwdCB0cmltbWVkIG1hdGNoIGZvciB3aGl0ZXNwYWNlIGRpZmZlcmVuY2VzXG5cdFx0XHRcdFx0aWYgKGNhbmRpZGF0ZVZhbHVlID09PSBTdHJpbmcodm5vZGUuY2hpbGRyZW4pIHx8IFxuXHRcdFx0XHRcdFx0KGV4cGVjdGVkVGV4dCAmJiBjYW5kaWRhdGVWYWx1ZS50cmltKCkgPT09IGV4cGVjdGVkVGV4dCkpIHtcblx0XHRcdFx0XHRcdHRleHROb2RlID0gY2FuZGlkYXRlVGV4dFxuXHRcdFx0XHRcdFx0bWF0Y2hlZE5vZGVzLmFkZCh0ZXh0Tm9kZSlcblx0XHRcdFx0XHRcdC8vIFVwZGF0ZSB0ZXh0IGNvbnRlbnQgaWYgdGhlcmUncyBhIG1pbm9yIGRpZmZlcmVuY2UgKHdoaXRlc3BhY2Ugbm9ybWFsaXphdGlvbilcblx0XHRcdFx0XHRcdGlmIChjYW5kaWRhdGVWYWx1ZSAhPT0gU3RyaW5nKHZub2RlLmNoaWxkcmVuKSkge1xuXHRcdFx0XHRcdFx0XHR0ZXh0Tm9kZS5ub2RlVmFsdWUgPSBTdHJpbmcodm5vZGUuY2hpbGRyZW4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBEb24ndCByZW1vdmUvcmVpbnNlcnQgLSBqdXN0IHJldXNlIHRoZSBleGlzdGluZyBub2RlIGluIHBsYWNlXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dFNpYmxpbmdcblx0XHRcdH1cblx0XHRcdC8vIElmIG5vIG1hdGNoaW5nIHRleHQgbm9kZSBmb3VuZCwgY3JlYXRlIG5ldyBvbmVcblx0XHRcdGlmICghdGV4dE5vZGUhKSB7XG5cdFx0XHRcdHRleHROb2RlID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZVRleHROb2RlKHZub2RlLmNoaWxkcmVuKVxuXHRcdFx0XHRpbnNlcnRET00ocGFyZW50LCB0ZXh0Tm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRleHROb2RlID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZVRleHROb2RlKHZub2RlLmNoaWxkcmVuKVxuXHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgdGV4dE5vZGUsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSB0ZXh0Tm9kZVxuXHR9XG5cdGNvbnN0IHBvc3NpYmxlUGFyZW50czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtjYXB0aW9uOiAndGFibGUnLCB0aGVhZDogJ3RhYmxlJywgdGJvZHk6ICd0YWJsZScsIHRmb290OiAndGFibGUnLCB0cjogJ3Rib2R5JywgdGg6ICd0cicsIHRkOiAndHInLCBjb2xncm91cDogJ3RhYmxlJywgY29sOiAnY29sZ3JvdXAnfVxuXHRmdW5jdGlvbiBjcmVhdGVIVE1MKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCkge1xuXHRcdGNvbnN0IG1hdGNoID0gdm5vZGUuY2hpbGRyZW4ubWF0Y2goL15cXHMqPzwoXFx3KykvaW0pIHx8IFtdXG5cdFx0Ly8gbm90IHVzaW5nIHRoZSBwcm9wZXIgcGFyZW50IG1ha2VzIHRoZSBjaGlsZCBlbGVtZW50KHMpIHZhbmlzaC5cblx0XHQvLyAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcblx0XHQvLyAgICAgZGl2LmlubmVySFRNTCA9IFwiPHRkPmk8L3RkPjx0ZD5qPC90ZD5cIlxuXHRcdC8vICAgICBjb25zb2xlLmxvZyhkaXYuaW5uZXJIVE1MKVxuXHRcdC8vIC0tPiBcImlqXCIsIG5vIDx0ZD4gaW4gc2lnaHQuXG5cdFx0bGV0IHRlbXAgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRWxlbWVudChwb3NzaWJsZVBhcmVudHNbbWF0Y2hbMV1dIHx8ICdkaXYnKVxuXHRcdGlmIChucyA9PT0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJykge1xuXHRcdFx0dGVtcC5pbm5lckhUTUwgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+JyArIHZub2RlLmNoaWxkcmVuICsgJzwvc3ZnPidcblx0XHRcdHRlbXAgPSB0ZW1wLmZpcnN0Q2hpbGQgYXMgSFRNTEVsZW1lbnRcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGVtcC5pbm5lckhUTUwgPSB2bm9kZS5jaGlsZHJlblxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSB0ZW1wLmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gdGVtcC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdGNvbnN0IGZyYWdtZW50ID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdGxldCBjaGlsZDogTm9kZSB8IG51bGxcblx0XHR3aGlsZSAoKGNoaWxkID0gdGVtcC5maXJzdENoaWxkKSAhPSBudWxsKSB7XG5cdFx0XHRmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0XHR9XG5cdFx0aW5zZXJ0RE9NKHBhcmVudCwgZnJhZ21lbnQsIG5leHRTaWJsaW5nKVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZUZyYWdtZW50KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0Y29uc3QgZnJhZ21lbnQgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGNyZWF0ZU5vZGVzKGZyYWdtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGZyYWdtZW50LmZpcnN0Q2hpbGRcblx0XHR2bm9kZS5kb21TaXplID0gZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGhcblx0XHRpbnNlcnRET00ocGFyZW50LCBmcmFnbWVudCwgbmV4dFNpYmxpbmcpXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlRWxlbWVudChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSwgbWF0Y2hlZE5vZGVzOiBTZXQ8Tm9kZT4gfCBudWxsID0gbnVsbCkge1xuXHRcdGNvbnN0IHRhZyA9IHZub2RlLnRhZ1xuXHRcdGNvbnN0IGF0dHJzID0gdm5vZGUuYXR0cnNcblx0XHRjb25zdCBpcyA9IHZub2RlLmlzXG5cblx0XHRucyA9IGdldE5hbWVTcGFjZSh2bm9kZSkgfHwgbnNcblxuXHRcdGxldCBlbGVtZW50OiBFbGVtZW50XG5cdFx0aWYgKGlzSHlkcmF0aW5nICYmIHBhcmVudC5maXJzdENoaWxkICYmIG5leHRTaWJsaW5nID09IG51bGwgJiYgbWF0Y2hlZE5vZGVzKSB7XG5cdFx0XHQvLyBEdXJpbmcgaHlkcmF0aW9uLCB0cnkgdG8gcmV1c2UgZXhpc3RpbmcgRE9NIG5vZGVcblx0XHRcdC8vIE9ubHkgbWF0Y2ggaWYgd2UncmUgYXBwZW5kaW5nIChuZXh0U2libGluZyA9PSBudWxsKSB0byBwcmVzZXJ2ZSBvcmRlclxuXHRcdFx0Ly8gRmluZCB0aGUgZmlyc3QgdW5tYXRjaGVkIGNoaWxkIGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSB0YWdcblx0XHRcdC8vIE1vcmUgbGVuaWVudCBtYXRjaGluZzogc2tpcCB0ZXh0IG5vZGVzIGFuZCBjb21tZW50cywgYWxsb3cgdGFnIG5hbWUgY2FzZSBkaWZmZXJlbmNlc1xuXHRcdFx0bGV0IGNhbmRpZGF0ZTogTm9kZSB8IG51bGwgPSBwYXJlbnQuZmlyc3RDaGlsZFxuXHRcdFx0bGV0IGZhbGxiYWNrQ2FuZGlkYXRlOiBFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0XHRcdHdoaWxlIChjYW5kaWRhdGUpIHtcblx0XHRcdFx0Ly8gU2tpcCB0ZXh0IG5vZGVzLCBjb21tZW50cywgYW5kIGFscmVhZHkgbWF0Y2hlZCBub2Rlc1xuXHRcdFx0XHRpZiAoY2FuZGlkYXRlLm5vZGVUeXBlID09PSAxICYmICFtYXRjaGVkTm9kZXMuaGFzKGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0XHRjb25zdCBjYW5kaWRhdGVFbCA9IGNhbmRpZGF0ZSBhcyBFbGVtZW50XG5cdFx0XHRcdFx0Ly8gQ2FzZS1pbnNlbnNpdGl2ZSB0YWcgbWF0Y2hpbmcgKGJyb3dzZXJzIG5vcm1hbGl6ZSB0byB1cHBlcmNhc2UgZm9yIHNvbWUgdGFncylcblx0XHRcdFx0XHQvLyBVc2UgdGFnTmFtZSBpZiBhdmFpbGFibGUsIGZhbGxiYWNrIHRvIG5vZGVOYW1lIChmb3IgRE9NIG1vY2tzKVxuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZVRhZyA9IChjYW5kaWRhdGVFbCBhcyBhbnkpLnRhZ05hbWUgfHwgY2FuZGlkYXRlRWwubm9kZU5hbWVcblx0XHRcdFx0XHRpZiAoY2FuZGlkYXRlVGFnICYmIGNhbmRpZGF0ZVRhZy50b0xvd2VyQ2FzZSgpID09PSB0YWcudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdFx0Ly8gUHJlZmVyIGV4YWN0IG1hdGNoIChpcyBhdHRyaWJ1dGUgbWF0Y2hlcyBpZiBzcGVjaWZpZWQpXG5cdFx0XHRcdFx0XHRpZiAoIWlzIHx8IGNhbmRpZGF0ZUVsLmdldEF0dHJpYnV0ZSgnaXMnKSA9PT0gaXMpIHtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudCA9IGNhbmRpZGF0ZUVsXG5cdFx0XHRcdFx0XHRcdG1hdGNoZWROb2Rlcy5hZGQoZWxlbWVudClcblx0XHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmVtb3ZlL3JlaW5zZXJ0IC0ganVzdCByZXVzZSB0aGUgZXhpc3Rpbmcgbm9kZSBpbiBwbGFjZVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gS2VlcCB0cmFjayBvZiBmaXJzdCBtYXRjaGluZyB0YWcgYXMgZmFsbGJhY2sgKGV2ZW4gaWYgaXMgYXR0cmlidXRlIGRvZXNuJ3QgbWF0Y2gpXG5cdFx0XHRcdFx0XHRpZiAoIWZhbGxiYWNrQ2FuZGlkYXRlKSB7XG5cdFx0XHRcdFx0XHRcdGZhbGxiYWNrQ2FuZGlkYXRlID0gY2FuZGlkYXRlRWxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FuZGlkYXRlID0gY2FuZGlkYXRlLm5leHRTaWJsaW5nXG5cdFx0XHR9XG5cdFx0XHQvLyBJZiBubyBleGFjdCBtYXRjaCBmb3VuZCBidXQgd2UgaGF2ZSBhIGZhbGxiYWNrLCB1c2UgaXRcblx0XHRcdC8vIFRoaXMgaGFuZGxlcyBjYXNlcyB3aGVyZSBpcyBhdHRyaWJ1dGUgZGlmZmVycyBidXQgdGFnIG1hdGNoZXNcblx0XHRcdGlmICghZWxlbWVudCEgJiYgZmFsbGJhY2tDYW5kaWRhdGUpIHtcblx0XHRcdFx0ZWxlbWVudCA9IGZhbGxiYWNrQ2FuZGlkYXRlXG5cdFx0XHRcdG1hdGNoZWROb2Rlcy5hZGQoZWxlbWVudClcblx0XHRcdH1cblx0XHRcdC8vIElmIHN0aWxsIG5vIG1hdGNoaW5nIGVsZW1lbnQgZm91bmQsIGNyZWF0ZSBuZXcgb25lXG5cdFx0XHRpZiAoIWVsZW1lbnQhKSB7XG5cdFx0XHRcdGVsZW1lbnQgPSBucyA/XG5cdFx0XHRcdFx0aXMgPyBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcsIHtpczogaXN9IGFzIGFueSkgOiBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcpIDpcblx0XHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZylcblx0XHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE5vcm1hbCBjcmVhdGlvbiBwYXRoXG5cdFx0XHRlbGVtZW50ID0gbnMgP1xuXHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50TlMobnMsIHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50TlMobnMsIHRhZykgOlxuXHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHRhZylcblx0XHRcdGluc2VydERPTShwYXJlbnQsIGVsZW1lbnQsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSBlbGVtZW50XG5cblx0XHRpZiAoYXR0cnMgIT0gbnVsbCkge1xuXHRcdFx0c2V0QXR0cnModm5vZGUsIGF0dHJzLCBucylcblx0XHR9XG5cblx0XHRpZiAoIW1heWJlU2V0Q29udGVudEVkaXRhYmxlKHZub2RlKSkge1xuXHRcdFx0aWYgKHZub2RlLmNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0XHQvLyBEdXJpbmcgaHlkcmF0aW9uLCBpZiB3ZSByZXVzZWQgYW4gZWxlbWVudCwgaXQgYWxyZWFkeSBoYXMgY2hpbGRyZW5cblx0XHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1hdGNoZWROb2RlcyBzZXQgZm9yIHRoaXMgZWxlbWVudCdzIGNoaWxkcmVuIHRvIGF2b2lkIGR1cGxpY2F0ZXNcblx0XHRcdFx0Y29uc3QgY2hpbGRNYXRjaGVkTm9kZXMgPSAoaXNIeWRyYXRpbmcgJiYgZWxlbWVudC5maXJzdENoaWxkKSA/IG5ldyBTZXQ8Tm9kZT4oKSA6IG51bGxcblx0XHRcdFx0Y3JlYXRlTm9kZXMoZWxlbWVudCwgY2hpbGRyZW4sIDAsIGNoaWxkcmVuLmxlbmd0aCwgaG9va3MsIG51bGwsIG5zLCBpc0h5ZHJhdGluZywgY2hpbGRNYXRjaGVkTm9kZXMpXG5cdFx0XHRcdC8vIEFmdGVyIGNyZWF0aW5nL21hdGNoaW5nIGNoaWxkcmVuLCByZW1vdmUgYW55IHVubWF0Y2hlZCBub2RlcyB0aGF0IHJlbWFpblxuXHRcdFx0XHQvLyBPbmx5IHJlbW92ZSB1bm1hdGNoZWQgbm9kZXMgaWYgd2UgYWN0dWFsbHkgbWF0Y2hlZCBzb21lIG5vZGVzICh0byBhdm9pZCBjbGVhcmluZyBldmVyeXRoaW5nKVxuXHRcdFx0XHRpZiAoaXNIeWRyYXRpbmcgJiYgY2hpbGRNYXRjaGVkTm9kZXMgJiYgZWxlbWVudC5maXJzdENoaWxkICYmIGNoaWxkTWF0Y2hlZE5vZGVzLnNpemUgPiAwKSB7XG5cdFx0XHRcdFx0bGV0IG5vZGU6IE5vZGUgfCBudWxsID0gZWxlbWVudC5maXJzdENoaWxkXG5cdFx0XHRcdFx0d2hpbGUgKG5vZGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5leHQ6IE5vZGUgfCBudWxsID0gbm9kZS5uZXh0U2libGluZ1xuXHRcdFx0XHRcdFx0aWYgKCFjaGlsZE1hdGNoZWROb2Rlcy5oYXMobm9kZSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVmVyaWZ5IG5vZGUgaXMgc3RpbGwgYSBjaGlsZCBiZWZvcmUgYXR0ZW1wdGluZyByZW1vdmFsXG5cdFx0XHRcdFx0XHRcdGlmIChlbGVtZW50LmNvbnRhaW5zICYmIGVsZW1lbnQuY29udGFpbnMobm9kZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0XHRcdFx0XHRcdFx0aHlkcmF0aW9uTWlzbWF0Y2hDb3VudCsrXG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBlcnJvciA9IGUgYXMgRXJyb3Jcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIG5vZGUgd2FzIGFscmVhZHkgcmVtb3ZlZCAobm90IGEgY2hpbGQgYW55bW9yZSlcblx0XHRcdFx0XHRcdFx0XHRcdGlmICghZWxlbWVudC5jb250YWlucyB8fCAhZWxlbWVudC5jb250YWlucyhub2RlKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBOb2RlIGFscmVhZHkgcmVtb3ZlZCwgc2tpcCBzaWxlbnRseVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRub2RlID0gbmV4dFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aHlkcmF0aW9uTWlzbWF0Y2hDb3VudCsrXG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dIeWRyYXRpb25FcnJvcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0J3JlbW92ZUNoaWxkIChlbGVtZW50IGNoaWxkcmVuIGNsZWFudXApJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dm5vZGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7cGFyZW50OiBlbGVtZW50LCBub2RlLCBtYXRjaGVkTm9kZXM6IGNoaWxkTWF0Y2hlZE5vZGVzfSxcblx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHRcdC8vIERvbid0IHJlLXRocm93IC0gd2UndmUgYWxyZWFkeSBsb2dnZWQgdGhlIGVycm9yIHdpdGggYWxsIGRldGFpbHNcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFJlLXRocm93aW5nIGNhdXNlcyB0aGUgYnJvd3NlciB0byBsb2cgdGhlIERPTUV4Y2VwdGlvbiBzdGFjayB0cmFjZVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyBOb2RlIG5vdCBpbiBwYXJlbnQsIGFscmVhZHkgcmVtb3ZlZCAtIHNraXAgc2lsZW50bHlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5vZGUgPSBuZXh0XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdzZWxlY3QnICYmIGF0dHJzICE9IG51bGwpIHNldExhdGVTZWxlY3RBdHRycyh2bm9kZSwgYXR0cnMpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIGluaXRDb21wb25lbnQodm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0bGV0IHNlbnRpbmVsOiBhbnlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZy52aWV3ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IE9iamVjdC5jcmVhdGUodm5vZGUudGFnKVxuXHRcdFx0c2VudGluZWwgPSB2bm9kZS5zdGF0ZS52aWV3XG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuXG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHR9IGVsc2Uge1xuXHRcdFx0dm5vZGUuc3RhdGUgPSB2b2lkIDBcblx0XHRcdHNlbnRpbmVsID0gdm5vZGUudGFnXG5cdFx0XHRpZiAoc2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgIT0gbnVsbCkgcmV0dXJuXG5cdFx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IHRydWVcblx0XHRcdHZub2RlLnN0YXRlID0gKHZub2RlLnRhZy5wcm90b3R5cGUgIT0gbnVsbCAmJiB0eXBlb2Ygdm5vZGUudGFnLnByb3RvdHlwZS52aWV3ID09PSAnZnVuY3Rpb24nKSA/IG5ldyB2bm9kZS50YWcodm5vZGUpIDogdm5vZGUudGFnKHZub2RlKVxuXHRcdH1cblx0XHRpbml0TGlmZWN5Y2xlKHZub2RlLnN0YXRlLCB2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSBpbml0TGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdFxuXHRcdC8vIFRyYWNrIGNvbXBvbmVudCBmb3Igc2lnbmFsIGRlcGVuZGVuY3kgdHJhY2tpbmdcblx0XHQvLyBTdG9yZSBtYXBwaW5nIGZyb20gdm5vZGUuc3RhdGUgdG8gdm5vZGUudGFnIChjb21wb25lbnQgb2JqZWN0KSBmb3IgcmVkcmF3XG5cdFx0aWYgKHZub2RlLnN0YXRlICYmIHZub2RlLnRhZyAmJiAhaXNIeWRyYXRpbmcpIHtcblx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Db21wb25lbnQgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Db21wb25lbnQgfHwgbmV3IFdlYWtNYXAoKVxuXHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudC5zZXQodm5vZGUuc3RhdGUsIHZub2RlLnRhZylcblx0XHR9XG5cdFx0Ly8gQWx3YXlzIHRyYWNrIGNvbXBvbmVudCBkZXBlbmRlbmNpZXMgZm9yIHNpZ25hbCB0cmFja2luZyAoZXZlbiBkdXJpbmcgaHlkcmF0aW9uKVxuXHRcdC8vIFRoaXMgYWxsb3dzIHNpZ25hbHMgdG8ga25vdyB3aGljaCBjb21wb25lbnRzIGRlcGVuZCBvbiB0aGVtXG5cdFx0Ly8gV2Ugb25seSBza2lwIG9uaW5pdCBkdXJpbmcgaHlkcmF0aW9uLCBub3Qgc2lnbmFsIHRyYWNraW5nXG5cdFx0Ly8gT25seSBzZXQgY3VycmVudENvbXBvbmVudCBpZiB2bm9kZS5zdGF0ZSBleGlzdHMgKGl0IG1pZ2h0IGJlIHVuZGVmaW5lZCBmb3Igc29tZSBjb21wb25lbnQgdHlwZXMpXG5cdFx0aWYgKHZub2RlLnN0YXRlICE9IG51bGwpIHtcblx0XHRcdHNldEN1cnJlbnRDb21wb25lbnQodm5vZGUuc3RhdGUpXG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHR2bm9kZS5pbnN0YW5jZSA9IFZub2RlLm5vcm1hbGl6ZShjYWxsSG9vay5jYWxsKHZub2RlLnN0YXRlLnZpZXcsIHZub2RlKSlcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKHZub2RlLnN0YXRlICE9IG51bGwpIHtcblx0XHRcdFx0Y2xlYXJDdXJyZW50Q29tcG9uZW50KClcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHZub2RlLmluc3RhbmNlID09PSB2bm9kZSkgdGhyb3cgRXJyb3IoJ0EgdmlldyBjYW5ub3QgcmV0dXJuIHRoZSB2bm9kZSBpdCByZWNlaXZlZCBhcyBhcmd1bWVudCcpXG5cdFx0c2VudGluZWwuJCRyZWVudHJhbnRMb2NrJCQgPSBudWxsXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0aW5pdENvbXBvbmVudCh2bm9kZSwgaG9va3MsIGlzSHlkcmF0aW5nKVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSB7XG5cdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpXG5cdFx0XHR2bm9kZS5kb20gPSB2bm9kZS5pbnN0YW5jZS5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSB2bm9kZS5pbnN0YW5jZS5kb21TaXplXG5cdFx0XHRcblx0XHRcdC8vIFN0b3JlIGNvbXBvbmVudCdzIERPTSBlbGVtZW50IGZvciBmaW5lLWdyYWluZWQgcmVkcmF3IChub3QgZHVyaW5nIGh5ZHJhdGlvbilcblx0XHRcdGlmICh2bm9kZS5zdGF0ZSAmJiB2bm9kZS5kb20gJiYgIWlzSHlkcmF0aW5nKSB7XG5cdFx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gfHwgbmV3IFdlYWtNYXAoKVxuXHRcdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tLnNldCh2bm9kZS5zdGF0ZSwgdm5vZGUuZG9tKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbVNpemUgPSAwXG5cdFx0fVxuXHR9XG5cblx0Ly8gdXBkYXRlXG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGVzKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIG9sZDogKFZub2RlVHlwZSB8IG51bGwpW10gfCBudWxsLCB2bm9kZXM6IChWbm9kZVR5cGUgfCBudWxsKVtdIHwgbnVsbCwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRpZiAob2xkID09PSB2bm9kZXMgfHwgb2xkID09IG51bGwgJiYgdm5vZGVzID09IG51bGwpIHJldHVyblxuXHRcdGVsc2UgaWYgKG9sZCA9PSBudWxsIHx8IG9sZC5sZW5ndGggPT09IDApIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzISwgMCwgdm5vZGVzIS5sZW5ndGgsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdGVsc2UgaWYgKHZub2RlcyA9PSBudWxsIHx8IHZub2Rlcy5sZW5ndGggPT09IDApIHJlbW92ZU5vZGVzKHBhcmVudCwgb2xkLCAwLCBvbGQubGVuZ3RoKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3QgaXNPbGRLZXllZCA9IG9sZFswXSAhPSBudWxsICYmIG9sZFswXSEua2V5ICE9IG51bGxcblx0XHRcdGNvbnN0IGlzS2V5ZWQgPSB2bm9kZXNbMF0gIT0gbnVsbCAmJiB2bm9kZXNbMF0hLmtleSAhPSBudWxsXG5cdFx0XHRsZXQgc3RhcnQgPSAwLCBvbGRTdGFydCA9IDAsIG86IGFueSwgdjogYW55XG5cdFx0XHRpZiAoaXNPbGRLZXllZCAhPT0gaXNLZXllZCkge1xuXHRcdFx0XHRyZW1vdmVOb2RlcyhwYXJlbnQsIG9sZCwgMCwgb2xkLmxlbmd0aClcblx0XHRcdFx0Y3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIDAsIHZub2Rlcy5sZW5ndGgsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0fSBlbHNlIGlmICghaXNLZXllZCkge1xuXHRcdFx0XHQvLyBEb24ndCBpbmRleCBwYXN0IHRoZSBlbmQgb2YgZWl0aGVyIGxpc3QgKGNhdXNlcyBkZW9wdHMpLlxuXHRcdFx0XHRjb25zdCBjb21tb25MZW5ndGggPSBvbGQubGVuZ3RoIDwgdm5vZGVzLmxlbmd0aCA/IG9sZC5sZW5ndGggOiB2bm9kZXMubGVuZ3RoXG5cdFx0XHRcdC8vIFJld2luZCBpZiBuZWNlc3NhcnkgdG8gdGhlIGZpcnN0IG5vbi1udWxsIGluZGV4IG9uIGVpdGhlciBzaWRlLlxuXHRcdFx0XHQvLyBXZSBjb3VsZCBhbHRlcm5hdGl2ZWx5IGVpdGhlciBleHBsaWNpdGx5IGNyZWF0ZSBvciByZW1vdmUgbm9kZXMgd2hlbiBgc3RhcnQgIT09IG9sZFN0YXJ0YFxuXHRcdFx0XHQvLyBidXQgdGhhdCB3b3VsZCBiZSBvcHRpbWl6aW5nIGZvciBzcGFyc2UgbGlzdHMgd2hpY2ggYXJlIG1vcmUgcmFyZSB0aGFuIGRlbnNlIG9uZXMuXG5cdFx0XHRcdHdoaWxlIChvbGRTdGFydCA8IG9sZC5sZW5ndGggJiYgb2xkW29sZFN0YXJ0XSA9PSBudWxsKSBvbGRTdGFydCsrXG5cdFx0XHRcdHdoaWxlIChzdGFydCA8IHZub2Rlcy5sZW5ndGggJiYgdm5vZGVzW3N0YXJ0XSA9PSBudWxsKSBzdGFydCsrXG5cdFx0XHRcdHN0YXJ0ID0gc3RhcnQgPCBvbGRTdGFydCA/IHN0YXJ0IDogb2xkU3RhcnRcblx0XHRcdFx0Zm9yICg7IHN0YXJ0IDwgY29tbW9uTGVuZ3RoOyBzdGFydCsrKSB7XG5cdFx0XHRcdFx0byA9IG9sZFtzdGFydF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHRcdGlmIChvID09PSB2IHx8IG8gPT0gbnVsbCAmJiB2ID09IG51bGwpIGNvbnRpbnVlXG5cdFx0XHRcdFx0ZWxzZSBpZiAobyA9PSBudWxsKSBjcmVhdGVOb2RlKHBhcmVudCwgdiwgaG9va3MsIG5zLCBnZXROZXh0U2libGluZyhvbGQsIHN0YXJ0ICsgMSwgb2xkLmxlbmd0aCwgbmV4dFNpYmxpbmcpLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0XHRlbHNlIGlmICh2ID09IG51bGwpIHJlbW92ZU5vZGUocGFyZW50LCBvKVxuXHRcdFx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG8sIHYsIGhvb2tzLCBnZXROZXh0U2libGluZyhvbGQsIHN0YXJ0ICsgMSwgb2xkLmxlbmd0aCwgbmV4dFNpYmxpbmcpLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9sZC5sZW5ndGggPiBjb21tb25MZW5ndGgpIHJlbW92ZU5vZGVzKHBhcmVudCwgb2xkLCBzdGFydCwgb2xkLmxlbmd0aClcblx0XHRcdFx0aWYgKHZub2Rlcy5sZW5ndGggPiBjb21tb25MZW5ndGgpIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgdm5vZGVzLmxlbmd0aCwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBrZXllZCBkaWZmXG5cdFx0XHRcdGxldCBvbGRFbmQgPSBvbGQubGVuZ3RoIC0gMSwgZW5kID0gdm5vZGVzLmxlbmd0aCAtIDEsIG9lOiBhbnksIHZlOiBhbnksIHRvcFNpYmxpbmc6IE5vZGUgfCBudWxsXG5cblx0XHRcdFx0Ly8gYm90dG9tLXVwXG5cdFx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdFx0b2UgPSBvbGRbb2xkRW5kXVxuXHRcdFx0XHRcdHZlID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0XHRpZiAob2UgPT0gbnVsbCB8fCB2ZSA9PSBudWxsIHx8IG9lLmtleSAhPT0gdmUua2V5KSBicmVha1xuXHRcdFx0XHRcdGlmIChvZSAhPT0gdmUpIHVwZGF0ZU5vZGUocGFyZW50LCBvZSwgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRvbGRFbmQtLSwgZW5kLS1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyB0b3AtZG93blxuXHRcdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHRcdG8gPSBvbGRbb2xkU3RhcnRdXG5cdFx0XHRcdFx0diA9IHZub2Rlc1tzdGFydF1cblx0XHRcdFx0XHRpZiAobyA9PSBudWxsIHx8IHYgPT0gbnVsbCB8fCBvLmtleSAhPT0gdi5rZXkpIGJyZWFrXG5cdFx0XHRcdFx0b2xkU3RhcnQrKywgc3RhcnQrK1xuXHRcdFx0XHRcdGlmIChvICE9PSB2KSB1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEsIG5leHRTaWJsaW5nKSwgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHN3YXBzIGFuZCBsaXN0IHJldmVyc2Fsc1xuXHRcdFx0XHR3aGlsZSAob2xkRW5kID49IG9sZFN0YXJ0ICYmIGVuZCA+PSBzdGFydCkge1xuXHRcdFx0XHRcdGlmIChzdGFydCA9PT0gZW5kKSBicmVha1xuXHRcdFx0XHRcdG8gPSBvbGRbb2xkU3RhcnRdXG5cdFx0XHRcdFx0dmUgPSB2bm9kZXNbZW5kXVxuXHRcdFx0XHRcdG9lID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHRcdGlmIChvID09IG51bGwgfHwgdmUgPT0gbnVsbCB8fCBvZSA9PSBudWxsIHx8IHYgPT0gbnVsbCB8fCBvLmtleSAhPT0gdmUua2V5IHx8IG9lLmtleSAhPT0gdi5rZXkpIGJyZWFrXG5cdFx0XHRcdFx0dG9wU2libGluZyA9IGdldE5leHRTaWJsaW5nKG9sZCwgb2xkU3RhcnQsIG9sZEVuZCwgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0bW92ZURPTShwYXJlbnQsIG9lLCB0b3BTaWJsaW5nKVxuXHRcdFx0XHRcdGlmIChvZSAhPT0gdikgdXBkYXRlTm9kZShwYXJlbnQsIG9lLCB2LCBob29rcywgdG9wU2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICgrK3N0YXJ0IDw9IC0tZW5kKSBtb3ZlRE9NKHBhcmVudCwgbywgbmV4dFNpYmxpbmcpXG5cdFx0XHRcdFx0aWYgKG8gIT09IHZlKSB1cGRhdGVOb2RlKHBhcmVudCwgbywgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRvbGRTdGFydCsrOyBvbGRFbmQtLVxuXHRcdFx0XHRcdG9lID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tlbmRdXG5cdFx0XHRcdFx0byA9IG9sZFtvbGRTdGFydF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGJvdHRvbSB1cCBvbmNlIGFnYWluXG5cdFx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdFx0b2UgPSBvbGRbb2xkRW5kXVxuXHRcdFx0XHRcdHZlID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0XHRpZiAob2UgPT0gbnVsbCB8fCB2ZSA9PSBudWxsIHx8IG9lLmtleSAhPT0gdmUua2V5KSBicmVha1xuXHRcdFx0XHRcdGlmIChvZSAhPT0gdmUpIHVwZGF0ZU5vZGUocGFyZW50LCBvZSwgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRvbGRFbmQtLSwgZW5kLS1cblx0XHRcdFx0XHRvZSA9IG9sZFtvbGRFbmRdXG5cdFx0XHRcdFx0dmUgPSB2bm9kZXNbZW5kXVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzdGFydCA+IGVuZCkgcmVtb3ZlTm9kZXMocGFyZW50LCBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQgKyAxKVxuXHRcdFx0XHRlbHNlIGlmIChvbGRTdGFydCA+IG9sZEVuZCkgY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCBlbmQgKyAxLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaW5zcGlyZWQgYnkgaXZpIGh0dHBzOi8vZ2l0aHViLmNvbS9pdmlqcy9pdmkvIGJ5IEJvcmlzIEthdWxcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbE5leHRTaWJsaW5nID0gbmV4dFNpYmxpbmdcblx0XHRcdFx0XHRsZXQgcG9zID0gMjE0NzQ4MzY0NywgbWF0Y2hlZCA9IDBcblx0XHRcdFx0XHRjb25zdCBvbGRJbmRpY2VzID0gbmV3IEFycmF5KGVuZCAtIHN0YXJ0ICsgMSkuZmlsbCgtMSlcblx0XHRcdFx0XHRjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwpIG1hcFt2bm9kZXNbaV0hLmtleSFdID0gaVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3IgKGxldCBpID0gb2xkRW5kOyBpID49IG9sZFN0YXJ0OyBpLS0pIHtcblx0XHRcdFx0XHRcdG9lID0gb2xkW2ldXG5cdFx0XHRcdFx0XHRpZiAob2UgPT0gbnVsbCkgY29udGludWVcblx0XHRcdFx0XHRcdGNvbnN0IG5ld0luZGV4ID0gbWFwW29lLmtleSFdXG5cdFx0XHRcdFx0XHRpZiAobmV3SW5kZXggIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRwb3MgPSAobmV3SW5kZXggPCBwb3MpID8gbmV3SW5kZXggOiAtMSAvLyBiZWNvbWVzIC0xIGlmIG5vZGVzIHdlcmUgcmUtb3JkZXJlZFxuXHRcdFx0XHRcdFx0XHRvbGRJbmRpY2VzW25ld0luZGV4IC0gc3RhcnRdID0gaVxuXHRcdFx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tuZXdJbmRleF1cblx0XHRcdFx0XHRcdFx0b2xkW2ldID0gbnVsbFxuXHRcdFx0XHRcdFx0XHRpZiAob2UgIT09IHZlKSB1cGRhdGVOb2RlKHBhcmVudCwgb2UsIHZlLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0XHRcdFx0aWYgKHZlICE9IG51bGwgJiYgdmUuZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gdmUuZG9tXG5cdFx0XHRcdFx0XHRcdG1hdGNoZWQrK1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRuZXh0U2libGluZyA9IG9yaWdpbmFsTmV4dFNpYmxpbmdcblx0XHRcdFx0XHRpZiAobWF0Y2hlZCAhPT0gb2xkRW5kIC0gb2xkU3RhcnQgKyAxKSByZW1vdmVOb2RlcyhwYXJlbnQsIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEpXG5cdFx0XHRcdFx0aWYgKG1hdGNoZWQgPT09IDApIGNyZWF0ZU5vZGVzKHBhcmVudCwgdm5vZGVzLCBzdGFydCwgZW5kICsgMSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAocG9zID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHQvLyB0aGUgaW5kaWNlcyBvZiB0aGUgaW5kaWNlcyBvZiB0aGUgaXRlbXMgdGhhdCBhcmUgcGFydCBvZiB0aGVcblx0XHRcdFx0XHRcdFx0Ly8gbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIGluIHRoZSBvbGRJbmRpY2VzIGxpc3Rcblx0XHRcdFx0XHRcdFx0Y29uc3QgbGlzSW5kaWNlcyA9IG1ha2VMaXNJbmRpY2VzKG9sZEluZGljZXMpXG5cdFx0XHRcdFx0XHRcdGxldCBsaSA9IGxpc0luZGljZXMubGVuZ3RoIC0gMVxuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gZW5kOyBpID49IHN0YXJ0OyBpLS0pIHtcblx0XHRcdFx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tpXVxuXHRcdFx0XHRcdFx0XHRcdGlmICh2ZSA9PSBudWxsKSBjb250aW51ZVxuXHRcdFx0XHRcdFx0XHRcdGlmIChvbGRJbmRpY2VzW2kgLSBzdGFydF0gPT09IC0xKSBjcmVhdGVOb2RlKHBhcmVudCwgdmUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGxpc0luZGljZXNbbGldID09PSBpIC0gc3RhcnQpIGxpLS1cblx0XHRcdFx0XHRcdFx0XHRcdGVsc2UgbW92ZURPTShwYXJlbnQsIHZlLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IHZlLmRvbVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gZW5kOyBpID49IHN0YXJ0OyBpLS0pIHtcblx0XHRcdFx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tpXVxuXHRcdFx0XHRcdFx0XHRcdGlmICh2ZSA9PSBudWxsKSBjb250aW51ZVxuXHRcdFx0XHRcdFx0XHRcdGlmIChvbGRJbmRpY2VzW2kgLSBzdGFydF0gPT09IC0xKSBjcmVhdGVOb2RlKHBhcmVudCwgdmUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdFx0XHRcdGlmICh2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVOb2RlKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIG9sZDogYW55LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGNvbnN0IG9sZFRhZyA9IG9sZC50YWcsIHRhZyA9IHZub2RlLnRhZ1xuXHRcdGlmIChvbGRUYWcgPT09IHRhZyAmJiBvbGQuaXMgPT09IHZub2RlLmlzKSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IG9sZC5zdGF0ZVxuXHRcdFx0dm5vZGUuZXZlbnRzID0gb2xkLmV2ZW50c1xuXHRcdFx0aWYgKHNob3VsZE5vdFVwZGF0ZSh2bm9kZSwgb2xkKSkgcmV0dXJuXG5cdFx0XHRpZiAodHlwZW9mIG9sZFRhZyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIHtcblx0XHRcdFx0XHR1cGRhdGVMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRcdFx0fVxuXHRcdFx0XHRzd2l0Y2ggKG9sZFRhZykge1xuXHRcdFx0XHRcdGNhc2UgJyMnOiB1cGRhdGVUZXh0KG9sZCwgdm5vZGUpOyBicmVha1xuXHRcdFx0XHRcdGNhc2UgJzwnOiB1cGRhdGVIVE1MKHBhcmVudCwgb2xkLCB2bm9kZSwgbnMsIG5leHRTaWJsaW5nKTsgYnJlYWtcblx0XHRcdFx0XHRjYXNlICdbJzogdXBkYXRlRnJhZ21lbnQocGFyZW50LCBvbGQsIHZub2RlLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZyk7IGJyZWFrXG5cdFx0XHRcdFx0ZGVmYXVsdDogdXBkYXRlRWxlbWVudChvbGQsIHZub2RlLCBob29rcywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHVwZGF0ZUNvbXBvbmVudChwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJlbW92ZU5vZGUocGFyZW50LCBvbGQsIHZub2RlKSAvLyBQYXNzIG5ldyB2bm9kZSBmb3IgY29udGV4dFxuXHRcdFx0Y3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlVGV4dChvbGQ6IGFueSwgdm5vZGU6IGFueSkge1xuXHRcdGlmIChvbGQuY2hpbGRyZW4udG9TdHJpbmcoKSAhPT0gdm5vZGUuY2hpbGRyZW4udG9TdHJpbmcoKSkge1xuXHRcdFx0b2xkLmRvbS5ub2RlVmFsdWUgPSB2bm9kZS5jaGlsZHJlblxuXHRcdH1cblx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlSFRNTChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCBvbGQ6IGFueSwgdm5vZGU6IGFueSwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsKSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbiAhPT0gdm5vZGUuY2hpbGRyZW4pIHtcblx0XHRcdHJlbW92ZURPTShwYXJlbnQsIG9sZClcblx0XHRcdGNyZWF0ZUhUTUwocGFyZW50LCB2bm9kZSwgbnMsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVGcmFnbWVudChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCBvbGQ6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHR1cGRhdGVOb2RlcyhwYXJlbnQsIG9sZC5jaGlsZHJlbiwgdm5vZGUuY2hpbGRyZW4sIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdGxldCBkb21TaXplID0gMFxuXHRcdGNvbnN0IGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHR2bm9kZS5kb20gPSBudWxsXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRpZiAoY2hpbGQgIT0gbnVsbCAmJiBjaGlsZC5kb20gIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmICh2bm9kZS5kb20gPT0gbnVsbCkgdm5vZGUuZG9tID0gY2hpbGQuZG9tXG5cdFx0XHRcdFx0ZG9tU2l6ZSArPSBjaGlsZC5kb21TaXplIHx8IDFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR2bm9kZS5kb21TaXplID0gZG9tU2l6ZVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnQob2xkOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGNvbnN0IGVsZW1lbnQgPSB2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0bnMgPSBnZXROYW1lU3BhY2Uodm5vZGUpIHx8IG5zXG5cblx0XHRpZiAob2xkLmF0dHJzICE9IHZub2RlLmF0dHJzIHx8ICh2bm9kZS5hdHRycyAhPSBudWxsICYmICFjYWNoZWRBdHRyc0lzU3RhdGljTWFwLmdldCh2bm9kZS5hdHRycykpKSB7XG5cdFx0XHR1cGRhdGVBdHRycyh2bm9kZSwgb2xkLmF0dHJzLCB2bm9kZS5hdHRycywgbnMpXG5cdFx0fVxuXHRcdGlmICghbWF5YmVTZXRDb250ZW50RWRpdGFibGUodm5vZGUpKSB7XG5cdFx0XHR1cGRhdGVOb2RlcyhlbGVtZW50LCBvbGQuY2hpbGRyZW4sIHZub2RlLmNoaWxkcmVuLCBob29rcywgbnVsbCwgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVDb21wb25lbnQocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgb2xkOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Ly8gVHJhY2sgY29tcG9uZW50IGZvciBzaWduYWwgZGVwZW5kZW5jeSB0cmFja2luZ1xuXHRcdC8vIFN0b3JlIG1hcHBpbmcgZnJvbSB2bm9kZS5zdGF0ZSB0byB2bm9kZS50YWcgKGNvbXBvbmVudCBvYmplY3QpIGZvciByZWRyYXdcblx0XHRpZiAodm5vZGUuc3RhdGUgJiYgdm5vZGUudGFnICYmICFpc0h5ZHJhdGluZykge1xuXHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCA9IChnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCB8fCBuZXcgV2Vha01hcCgpXG5cdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvQ29tcG9uZW50LnNldCh2bm9kZS5zdGF0ZSwgdm5vZGUudGFnKVxuXHRcdH1cblx0XHQvLyBBbHdheXMgdHJhY2sgY29tcG9uZW50IGRlcGVuZGVuY2llcyBmb3Igc2lnbmFsIHRyYWNraW5nIChldmVuIGR1cmluZyBoeWRyYXRpb24pXG5cdFx0Ly8gVGhpcyBhbGxvd3Mgc2lnbmFscyB0byBrbm93IHdoaWNoIGNvbXBvbmVudHMgZGVwZW5kIG9uIHRoZW1cblx0XHQvLyBXZSBvbmx5IHNraXAgb25pbml0IGR1cmluZyBoeWRyYXRpb24sIG5vdCBzaWduYWwgdHJhY2tpbmdcblx0XHQvLyBPbmx5IHNldCBjdXJyZW50Q29tcG9uZW50IGlmIHZub2RlLnN0YXRlIGV4aXN0cyAoaXQgbWlnaHQgYmUgdW5kZWZpbmVkIGZvciBzb21lIGNvbXBvbmVudCB0eXBlcylcblx0XHRpZiAodm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q3VycmVudENvbXBvbmVudCh2bm9kZS5zdGF0ZSlcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKGNhbGxIb29rLmNhbGwodm5vZGUuc3RhdGUudmlldywgdm5vZGUpKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAodm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjbGVhckN1cnJlbnRDb21wb25lbnQoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgPT09IHZub2RlKSB0aHJvdyBFcnJvcignQSB2aWV3IGNhbm5vdCByZXR1cm4gdGhlIHZub2RlIGl0IHJlY2VpdmVkIGFzIGFyZ3VtZW50Jylcblx0XHR1cGRhdGVMaWZlY3ljbGUodm5vZGUuc3RhdGUsIHZub2RlLCBob29rcylcblx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkgdXBkYXRlTGlmZWN5Y2xlKHZub2RlLmF0dHJzLCB2bm9kZSwgaG9va3MpXG5cdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdGlmIChvbGQuaW5zdGFuY2UgPT0gbnVsbCkgY3JlYXRlTm9kZShwYXJlbnQsIHZub2RlLmluc3RhbmNlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZylcblx0XHRcdGVsc2UgdXBkYXRlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0dm5vZGUuZG9tID0gdm5vZGUuaW5zdGFuY2UuZG9tXG5cdFx0XHR2bm9kZS5kb21TaXplID0gdm5vZGUuaW5zdGFuY2UuZG9tU2l6ZVxuXHRcdFx0XG5cdFx0XHQvLyBTdG9yZSBjb21wb25lbnQncyBET00gZWxlbWVudCBmb3IgZmluZS1ncmFpbmVkIHJlZHJhdyAobm90IGR1cmluZyBoeWRyYXRpb24pXG5cdFx0XHRpZiAodm5vZGUuc3RhdGUgJiYgdm5vZGUuZG9tICYmICFpc0h5ZHJhdGluZykge1xuXHRcdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tIHx8IG5ldyBXZWFrTWFwKClcblx0XHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0RvbS5zZXQodm5vZGUuc3RhdGUsIHZub2RlLmRvbSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRpZiAob2xkLmluc3RhbmNlICE9IG51bGwpIHJlbW92ZU5vZGUocGFyZW50LCBvbGQuaW5zdGFuY2UpXG5cdFx0XHR2bm9kZS5kb21TaXplID0gMFxuXHRcdH1cblx0fVxuXHQvLyBMaWZ0ZWQgZnJvbSBpdmkgaHR0cHM6Ly9naXRodWIuY29tL2l2aWpzL2l2aS9cblx0Ly8gdGFrZXMgYSBsaXN0IG9mIHVuaXF1ZSBudW1iZXJzICgtMSBpcyBzcGVjaWFsIGFuZCBjYW5cblx0Ly8gb2NjdXIgbXVsdGlwbGUgdGltZXMpIGFuZCByZXR1cm5zIGFuIGFycmF5IHdpdGggdGhlIGluZGljZXNcblx0Ly8gb2YgdGhlIGl0ZW1zIHRoYXQgYXJlIHBhcnQgb2YgdGhlIGxvbmdlc3QgaW5jcmVhc2luZ1xuXHQvLyBzdWJzZXF1ZW5jZVxuXHRjb25zdCBsaXNUZW1wOiBudW1iZXJbXSA9IFtdXG5cdGZ1bmN0aW9uIG1ha2VMaXNJbmRpY2VzKGE6IG51bWJlcltdKTogbnVtYmVyW10ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFswXVxuXHRcdGxldCB1ID0gMCwgdiA9IDBcblx0XHRjb25zdCBpbCA9IGxpc1RlbXAubGVuZ3RoID0gYS5sZW5ndGhcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlsOyBpKyspIGxpc1RlbXBbaV0gPSBhW2ldXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbDsgKytpKSB7XG5cdFx0XHRpZiAoYVtpXSA9PT0gLTEpIGNvbnRpbnVlXG5cdFx0XHRjb25zdCBqID0gcmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXVxuXHRcdFx0aWYgKGFbal0gPCBhW2ldKSB7XG5cdFx0XHRcdGxpc1RlbXBbaV0gPSBqXG5cdFx0XHRcdHJlc3VsdC5wdXNoKGkpXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHR9XG5cdFx0XHR1ID0gMFxuXHRcdFx0diA9IHJlc3VsdC5sZW5ndGggLSAxXG5cdFx0XHR3aGlsZSAodSA8IHYpIHtcblx0XHRcdFx0Ly8gRmFzdCBpbnRlZ2VyIGF2ZXJhZ2Ugd2l0aG91dCBvdmVyZmxvdy5cblx0XHRcdFx0IFxuXHRcdFx0XHRjb25zdCBjID0gKHUgPj4+IDEpICsgKHYgPj4+IDEpICsgKHUgJiB2ICYgMSlcblx0XHRcdFx0aWYgKGFbcmVzdWx0W2NdXSA8IGFbaV0pIHtcblx0XHRcdFx0XHR1ID0gYyArIDFcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2ID0gY1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYVtpXSA8IGFbcmVzdWx0W3VdXSkge1xuXHRcdFx0XHRpZiAodSA+IDApIGxpc1RlbXBbaV0gPSByZXN1bHRbdSAtIDFdXG5cdFx0XHRcdHJlc3VsdFt1XSA9IGlcblx0XHRcdH1cblx0XHR9XG5cdFx0dSA9IHJlc3VsdC5sZW5ndGhcblx0XHR2ID0gcmVzdWx0W3UgLSAxXVxuXHRcdHdoaWxlICh1LS0gPiAwKSB7XG5cdFx0XHRyZXN1bHRbdV0gPSB2XG5cdFx0XHR2ID0gbGlzVGVtcFt2XVxuXHRcdH1cblx0XHRsaXNUZW1wLmxlbmd0aCA9IDBcblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cblxuXHRmdW5jdGlvbiBnZXROZXh0U2libGluZyh2bm9kZXM6IChWbm9kZVR5cGUgfCBudWxsKVtdLCBpOiBudW1iZXIsIGVuZDogbnVtYmVyLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpOiBOb2RlIHwgbnVsbCB7XG5cdFx0Zm9yICg7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0aWYgKHZub2Rlc1tpXSAhPSBudWxsICYmIHZub2Rlc1tpXSEuZG9tICE9IG51bGwpIHJldHVybiB2bm9kZXNbaV0hLmRvbSFcblx0XHR9XG5cdFx0cmV0dXJuIG5leHRTaWJsaW5nXG5cdH1cblxuXHQvLyBUaGlzIGhhbmRsZXMgZnJhZ21lbnRzIHdpdGggem9tYmllIGNoaWxkcmVuIChyZW1vdmVkIGZyb20gdmRvbSwgYnV0IHBlcnNpc3RlZCBpbiBET00gdGhyb3VnaCBvbmJlZm9yZXJlbW92ZSlcblx0ZnVuY3Rpb24gbW92ZURPTShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpIHtcblx0XHRpZiAodm5vZGUuZG9tICE9IG51bGwpIHtcblx0XHRcdGxldCB0YXJnZXQ6IE5vZGVcblx0XHRcdGlmICh2bm9kZS5kb21TaXplID09IG51bGwgfHwgdm5vZGUuZG9tU2l6ZSA9PT0gMSkge1xuXHRcdFx0XHQvLyBkb24ndCBhbGxvY2F0ZSBmb3IgdGhlIGNvbW1vbiBjYXNlXG5cdFx0XHRcdHRhcmdldCA9IHZub2RlLmRvbVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0ID0gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHRcdFx0XHRmb3IgKGNvbnN0IGRvbSBvZiBkb21Gb3Iodm5vZGUpKSB0YXJnZXQuYXBwZW5kQ2hpbGQoZG9tKVxuXHRcdFx0fVxuXHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgdGFyZ2V0LCBuZXh0U2libGluZylcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBpbnNlcnRET00ocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgZG9tOiBOb2RlLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpIHtcblx0XHRpZiAobmV4dFNpYmxpbmcgIT0gbnVsbCkgcGFyZW50Lmluc2VydEJlZm9yZShkb20sIG5leHRTaWJsaW5nKVxuXHRcdGVsc2UgcGFyZW50LmFwcGVuZENoaWxkKGRvbSlcblx0fVxuXG5cdGZ1bmN0aW9uIG1heWJlU2V0Q29udGVudEVkaXRhYmxlKHZub2RlOiBhbnkpOiBib29sZWFuIHtcblx0XHRpZiAodm5vZGUuYXR0cnMgPT0gbnVsbCB8fCAoXG5cdFx0XHR2bm9kZS5hdHRycy5jb250ZW50ZWRpdGFibGUgPT0gbnVsbCAmJiAvLyBhdHRyaWJ1dGVcblx0XHRcdHZub2RlLmF0dHJzLmNvbnRlbnRFZGl0YWJsZSA9PSBudWxsIC8vIHByb3BlcnR5XG5cdFx0KSkgcmV0dXJuIGZhbHNlXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdGlmIChjaGlsZHJlbiAhPSBudWxsICYmIGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBjaGlsZHJlblswXS50YWcgPT09ICc8Jykge1xuXHRcdFx0Y29uc3QgY29udGVudCA9IGNoaWxkcmVuWzBdLmNoaWxkcmVuXG5cdFx0XHRpZiAodm5vZGUuZG9tLmlubmVySFRNTCAhPT0gY29udGVudCkgdm5vZGUuZG9tLmlubmVySFRNTCA9IGNvbnRlbnRcblx0XHR9XG5cdFx0ZWxzZSBpZiAoY2hpbGRyZW4gIT0gbnVsbCAmJiBjaGlsZHJlbi5sZW5ndGggIT09IDApIHRocm93IG5ldyBFcnJvcignQ2hpbGQgbm9kZSBvZiBhIGNvbnRlbnRlZGl0YWJsZSBtdXN0IGJlIHRydXN0ZWQuJylcblx0XHRyZXR1cm4gdHJ1ZVxuXHR9XG5cblx0Ly8gcmVtb3ZlXG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGVzKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlczogKFZub2RlVHlwZSB8IG51bGwpW10sIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG5cdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdGNvbnN0IHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkgcmVtb3ZlTm9kZShwYXJlbnQsIHZub2RlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB0cnlCbG9ja1JlbW92ZShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBzb3VyY2U6IGFueSwgY291bnRlcjoge3Y6IG51bWJlcn0pIHtcblx0XHRjb25zdCBvcmlnaW5hbCA9IHZub2RlLnN0YXRlXG5cdFx0Y29uc3QgcmVzdWx0ID0gY2FsbEhvb2suY2FsbChzb3VyY2Uub25iZWZvcmVyZW1vdmUsIHZub2RlKVxuXHRcdGlmIChyZXN1bHQgPT0gbnVsbCkgcmV0dXJuXG5cblx0XHRjb25zdCBnZW5lcmF0aW9uID0gY3VycmVudFJlbmRlclxuXHRcdGZvciAoY29uc3QgZG9tIG9mIGRvbUZvcih2bm9kZSkpIGRlbGF5ZWRSZW1vdmFsLnNldChkb20sIGdlbmVyYXRpb24pXG5cdFx0Y291bnRlci52KytcblxuXHRcdFByb21pc2UucmVzb2x2ZShyZXN1bHQpLmZpbmFsbHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRjaGVja1N0YXRlKHZub2RlLCBvcmlnaW5hbClcblx0XHRcdHRyeVJlc3VtZVJlbW92ZShwYXJlbnQsIHZub2RlLCBjb3VudGVyKVxuXHRcdH0pXG5cdH1cblx0ZnVuY3Rpb24gdHJ5UmVzdW1lUmVtb3ZlKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGNvdW50ZXI6IHt2OiBudW1iZXJ9LCBuZXdWbm9kZT86IGFueSkge1xuXHRcdGlmICgtLWNvdW50ZXIudiA9PT0gMCkge1xuXHRcdFx0b25yZW1vdmUodm5vZGUpXG5cdFx0XHRyZW1vdmVET00ocGFyZW50LCB2bm9kZSwgbmV3Vm5vZGUpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZU5vZGUocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgbmV3Vm5vZGU/OiBhbnkpIHtcblx0XHRjb25zdCBjb3VudGVyID0ge3Y6IDF9XG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnICYmIHR5cGVvZiB2bm9kZS5zdGF0ZS5vbmJlZm9yZXJlbW92ZSA9PT0gJ2Z1bmN0aW9uJykgdHJ5QmxvY2tSZW1vdmUocGFyZW50LCB2bm9kZSwgdm5vZGUuc3RhdGUsIGNvdW50ZXIpXG5cdFx0aWYgKHZub2RlLmF0dHJzICYmIHR5cGVvZiB2bm9kZS5hdHRycy5vbmJlZm9yZXJlbW92ZSA9PT0gJ2Z1bmN0aW9uJykgdHJ5QmxvY2tSZW1vdmUocGFyZW50LCB2bm9kZSwgdm5vZGUuYXR0cnMsIGNvdW50ZXIpXG5cdFx0dHJ5UmVzdW1lUmVtb3ZlKHBhcmVudCwgdm5vZGUsIGNvdW50ZXIsIG5ld1Zub2RlKVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZURPTShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBuZXdWbm9kZT86IGFueSkge1xuXHRcdGlmICh2bm9kZS5kb20gPT0gbnVsbCkgcmV0dXJuXG5cdFx0aWYgKHZub2RlLmRvbVNpemUgPT0gbnVsbCB8fCB2bm9kZS5kb21TaXplID09PSAxKSB7XG5cdFx0XHQvLyBDaGVjayBpZiBub2RlIGlzIHN0aWxsIGEgY2hpbGQgYmVmb3JlIGF0dGVtcHRpbmcgcmVtb3ZhbFxuXHRcdFx0Y29uc3Qgbm9kZSA9IHZub2RlLmRvbVxuXHRcdFx0aWYgKHBhcmVudC5jb250YWlucyAmJiBwYXJlbnQuY29udGFpbnMobm9kZSkpIHtcblx0XHRcdFx0Ly8gVmVyaWZ5IG5vZGUgaXMgYWN0dWFsbHkgYSBkaXJlY3Qgb3IgaW5kaXJlY3QgY2hpbGRcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSlcblx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0Y29uc3QgZXJyb3IgPSBlIGFzIEVycm9yXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgbm9kZSB3YXMgYWxyZWFkeSByZW1vdmVkIChub3QgYSBjaGlsZCBhbnltb3JlKVxuXHRcdFx0XHRcdGlmICghcGFyZW50LmNvbnRhaW5zIHx8ICFwYXJlbnQuY29udGFpbnMobm9kZSkpIHtcblx0XHRcdFx0XHRcdC8vIE5vZGUgYWxyZWFkeSByZW1vdmVkLCBza2lwIHNpbGVudGx5XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bG9nSHlkcmF0aW9uRXJyb3IoXG5cdFx0XHRcdFx0XHQncmVtb3ZlRE9NIChzaW5nbGUgbm9kZSknLFxuXHRcdFx0XHRcdFx0dm5vZGUsXG5cdFx0XHRcdFx0XHRwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogbnVsbCxcblx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0e3BhcmVudDogcGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IHVuZGVmaW5lZCwgbm9kZTogdm5vZGUuZG9tLCBvbGRWbm9kZTogdm5vZGUsIG5ld1Zub2RlOiBuZXdWbm9kZX0sXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC8vIERvbid0IHJlLXRocm93IC0gd2UndmUgYWxyZWFkeSBsb2dnZWQgdGhlIGVycm9yIHdpdGggYWxsIGRldGFpbHNcblx0XHRcdFx0XHQvLyBSZS10aHJvd2luZyBjYXVzZXMgdGhlIGJyb3dzZXIgdG8gbG9nIHRoZSBET01FeGNlcHRpb24gc3RhY2sgdHJhY2Vcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gTm9kZSBub3QgaW4gcGFyZW50LCBhbHJlYWR5IHJlbW92ZWQgLSBza2lwIHNpbGVudGx5XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoY29uc3QgZG9tIG9mIGRvbUZvcih2bm9kZSkpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgbm9kZSBpcyBzdGlsbCBhIGNoaWxkIGJlZm9yZSBhdHRlbXB0aW5nIHJlbW92YWxcblx0XHRcdFx0aWYgKHBhcmVudC5jb250YWlucyAmJiBwYXJlbnQuY29udGFpbnMoZG9tKSkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQoZG9tKVxuXHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgZXJyb3IgPSBlIGFzIEVycm9yXG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiBub2RlIHdhcyBhbHJlYWR5IHJlbW92ZWQgKG5vdCBhIGNoaWxkIGFueW1vcmUpXG5cdFx0XHRcdFx0XHRpZiAoIXBhcmVudC5jb250YWlucyB8fCAhcGFyZW50LmNvbnRhaW5zKGRvbSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gTm9kZSBhbHJlYWR5IHJlbW92ZWQsIHNraXAgc2lsZW50bHlcblx0XHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGxvZ0h5ZHJhdGlvbkVycm9yKFxuXHRcdFx0XHRcdFx0XHQncmVtb3ZlRE9NIChtdWx0aXBsZSBub2RlcyknLFxuXHRcdFx0XHRcdFx0XHR2bm9kZSxcblx0XHRcdFx0XHRcdFx0cGFyZW50IGluc3RhbmNlb2YgRWxlbWVudCA/IHBhcmVudCA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRcdFx0XHR7cGFyZW50OiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogdW5kZWZpbmVkLCBub2RlOiBkb20sIG9sZFZub2RlOiB2bm9kZSwgbmV3Vm5vZGU6IG5ld1Zub2RlfSxcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdC8vIERvbid0IHJlLXRocm93IC0gd2UndmUgYWxyZWFkeSBsb2dnZWQgdGhlIGVycm9yIHdpdGggYWxsIGRldGFpbHNcblx0XHRcdFx0XHRcdC8vIFJlLXRocm93aW5nIGNhdXNlcyB0aGUgYnJvd3NlciB0byBsb2cgdGhlIERPTUV4Y2VwdGlvbiBzdGFjayB0cmFjZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBOb2RlIG5vdCBpbiBwYXJlbnQsIGFscmVhZHkgcmVtb3ZlZCAtIHNraXAgc2lsZW50bHlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvbnJlbW92ZSh2bm9kZTogYW55KSB7XG5cdFx0Ly8gQ2xlYW4gdXAgc2lnbmFsIGRlcGVuZGVuY2llcyB3aGVuIGNvbXBvbmVudCBpcyByZW1vdmVkXG5cdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnICYmIHZub2RlLnN0YXRlICE9IG51bGwpIHtcblx0XHRcdGNsZWFyQ29tcG9uZW50RGVwZW5kZW5jaWVzKHZub2RlLnN0YXRlKVxuXHRcdH1cblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZub2RlLnN0YXRlLm9ucmVtb3ZlID09PSAnZnVuY3Rpb24nKSBjYWxsSG9vay5jYWxsKHZub2RlLnN0YXRlLm9ucmVtb3ZlLCB2bm9kZSlcblx0XHRpZiAodm5vZGUuYXR0cnMgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9ucmVtb3ZlID09PSAnZnVuY3Rpb24nKSBjYWxsSG9vay5jYWxsKHZub2RlLmF0dHJzLm9ucmVtb3ZlLCB2bm9kZSlcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycpIHtcblx0XHRcdGlmICh2bm9kZS5pbnN0YW5jZSAhPSBudWxsKSBvbnJlbW92ZSh2bm9kZS5pbnN0YW5jZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHZub2RlLmV2ZW50cyAhPSBudWxsKSB2bm9kZS5ldmVudHMuXyA9IG51bGxcblx0XHRcdGNvbnN0IGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHRcdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsKSBvbnJlbW92ZShjaGlsZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIGF0dHJzXG5cdGZ1bmN0aW9uIHNldEF0dHJzKHZub2RlOiBhbnksIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcblx0XHRcdHNldEF0dHIodm5vZGUsIGtleSwgbnVsbCwgYXR0cnNba2V5XSwgbnMpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHNldEF0dHIodm5vZGU6IGFueSwga2V5OiBzdHJpbmcsIG9sZDogYW55LCB2YWx1ZTogYW55LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleSA9PT0gJ2tleScgfHwgdmFsdWUgPT0gbnVsbCB8fCBpc0xpZmVjeWNsZU1ldGhvZChrZXkpIHx8IChvbGQgPT09IHZhbHVlICYmICFpc0Zvcm1BdHRyaWJ1dGUodm5vZGUsIGtleSkpICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVyblxuXHRcdGlmIChrZXlbMF0gPT09ICdvJyAmJiBrZXlbMV0gPT09ICduJykgcmV0dXJuIHVwZGF0ZUV2ZW50KHZub2RlLCBrZXksIHZhbHVlKVxuXHRcdGlmIChrZXkuc2xpY2UoMCwgNikgPT09ICd4bGluazonKSB2bm9kZS5kb20uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBrZXkuc2xpY2UoNiksIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykgdXBkYXRlU3R5bGUodm5vZGUuZG9tLCBvbGQsIHZhbHVlKVxuXHRcdGVsc2UgaWYgKGhhc1Byb3BlcnR5S2V5KHZub2RlLCBrZXksIG5zKSkge1xuXHRcdFx0aWYgKGtleSA9PT0gJ3ZhbHVlJykge1xuXHRcdFx0XHQvLyBPbmx5IGRvIHRoZSBjb2VyY2lvbiBpZiB3ZSdyZSBhY3R1YWxseSBnb2luZyB0byBjaGVjayB0aGUgdmFsdWUuXG5cdFx0XHRcdC8vIHNldHRpbmcgaW5wdXRbdmFsdWVdIHRvIHNhbWUgdmFsdWUgYnkgdHlwaW5nIG9uIGZvY3VzZWQgZWxlbWVudCBtb3ZlcyBjdXJzb3IgdG8gZW5kIGluIENocm9tZVxuXHRcdFx0XHQvLyBzZXR0aW5nIGlucHV0W3R5cGU9ZmlsZV1bdmFsdWVdIHRvIHNhbWUgdmFsdWUgY2F1c2VzIGFuIGVycm9yIHRvIGJlIGdlbmVyYXRlZCBpZiBpdCdzIG5vbi1lbXB0eVxuXHRcdFx0XHQvLyBtaW5sZW5ndGgvbWF4bGVuZ3RoIHZhbGlkYXRpb24gaXNuJ3QgcGVyZm9ybWVkIG9uIHNjcmlwdC1zZXQgdmFsdWVzKCMyMjU2KVxuXHRcdFx0XHRpZiAoKHZub2RlLnRhZyA9PT0gJ2lucHV0JyB8fCB2bm9kZS50YWcgPT09ICd0ZXh0YXJlYScpICYmIHZub2RlLmRvbS52YWx1ZSA9PT0gJycgKyB2YWx1ZSkgcmV0dXJuXG5cdFx0XHRcdC8vIHNldHRpbmcgc2VsZWN0W3ZhbHVlXSB0byBzYW1lIHZhbHVlIHdoaWxlIGhhdmluZyBzZWxlY3Qgb3BlbiBibGlua3Mgc2VsZWN0IGRyb3Bkb3duIGluIENocm9tZVxuXHRcdFx0XHRpZiAodm5vZGUudGFnID09PSAnc2VsZWN0JyAmJiBvbGQgIT09IG51bGwgJiYgdm5vZGUuZG9tLnZhbHVlID09PSAnJyArIHZhbHVlKSByZXR1cm5cblx0XHRcdFx0Ly8gc2V0dGluZyBvcHRpb25bdmFsdWVdIHRvIHNhbWUgdmFsdWUgd2hpbGUgaGF2aW5nIHNlbGVjdCBvcGVuIGJsaW5rcyBzZWxlY3QgZHJvcGRvd24gaW4gQ2hyb21lXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdvcHRpb24nICYmIG9sZCAhPT0gbnVsbCAmJiB2bm9kZS5kb20udmFsdWUgPT09ICcnICsgdmFsdWUpIHJldHVyblxuXHRcdFx0XHQvLyBzZXR0aW5nIGlucHV0W3R5cGU9ZmlsZV1bdmFsdWVdIHRvIGRpZmZlcmVudCB2YWx1ZSBpcyBhbiBlcnJvciBpZiBpdCdzIG5vbi1lbXB0eVxuXHRcdFx0XHQvLyBOb3QgaWRlYWwsIGJ1dCBpdCBhdCBsZWFzdCB3b3JrcyBhcm91bmQgdGhlIG1vc3QgY29tbW9uIHNvdXJjZSBvZiB1bmNhdWdodCBleGNlcHRpb25zIGZvciBub3cuXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdpbnB1dCcgJiYgdm5vZGUuYXR0cnMudHlwZSA9PT0gJ2ZpbGUnICYmICcnICsgdmFsdWUgIT09ICcnKSB7IGNvbnNvbGUuZXJyb3IoJ2B2YWx1ZWAgaXMgcmVhZC1vbmx5IG9uIGZpbGUgaW5wdXRzIScpOyByZXR1cm4gfVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgeW91IGFzc2lnbiBhbiBpbnB1dCB0eXBlIHRoYXQgaXMgbm90IHN1cHBvcnRlZCBieSBJRSAxMSB3aXRoIGFuIGFzc2lnbm1lbnQgZXhwcmVzc2lvbiwgYW4gZXJyb3Igd2lsbCBvY2N1ci5cblx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdpbnB1dCcgJiYga2V5ID09PSAndHlwZScpIHZub2RlLmRvbS5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSlcblx0XHRcdGVsc2Ugdm5vZGUuZG9tW2tleV0gPSB2YWx1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcblx0XHRcdFx0aWYgKHZhbHVlKSB2bm9kZS5kb20uc2V0QXR0cmlidXRlKGtleSwgJycpXG5cdFx0XHRcdGVsc2Ugdm5vZGUuZG9tLnJlbW92ZUF0dHJpYnV0ZShrZXkpXG5cdFx0XHR9XG5cdFx0XHRlbHNlIHZub2RlLmRvbS5zZXRBdHRyaWJ1dGUoa2V5ID09PSAnY2xhc3NOYW1lJyA/ICdjbGFzcycgOiBrZXksIHZhbHVlKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiByZW1vdmVBdHRyKHZub2RlOiBhbnksIGtleTogc3RyaW5nLCBvbGQ6IGFueSwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdGlmIChrZXkgPT09ICdrZXknIHx8IG9sZCA9PSBudWxsIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleSkpIHJldHVyblxuXHRcdGlmIChrZXlbMF0gPT09ICdvJyAmJiBrZXlbMV0gPT09ICduJykgdXBkYXRlRXZlbnQodm5vZGUsIGtleSwgdW5kZWZpbmVkKVxuXHRcdGVsc2UgaWYgKGtleSA9PT0gJ3N0eWxlJykgdXBkYXRlU3R5bGUodm5vZGUuZG9tLCBvbGQsIG51bGwpXG5cdFx0ZWxzZSBpZiAoXG5cdFx0XHRoYXNQcm9wZXJ0eUtleSh2bm9kZSwga2V5LCBucylcblx0XHRcdCYmIGtleSAhPT0gJ2NsYXNzTmFtZSdcblx0XHRcdCYmIGtleSAhPT0gJ3RpdGxlJyAvLyBjcmVhdGVzIFwibnVsbFwiIGFzIHRpdGxlXG5cdFx0XHQmJiAhKGtleSA9PT0gJ3ZhbHVlJyAmJiAoXG5cdFx0XHRcdHZub2RlLnRhZyA9PT0gJ29wdGlvbidcblx0XHRcdFx0fHwgdm5vZGUudGFnID09PSAnc2VsZWN0JyAmJiB2bm9kZS5kb20uc2VsZWN0ZWRJbmRleCA9PT0gLTEgJiYgdm5vZGUuZG9tID09PSBhY3RpdmVFbGVtZW50KHZub2RlLmRvbSlcblx0XHRcdCkpXG5cdFx0XHQmJiAhKHZub2RlLnRhZyA9PT0gJ2lucHV0JyAmJiBrZXkgPT09ICd0eXBlJylcblx0XHQpIHtcblx0XHRcdHZub2RlLmRvbVtrZXldID0gbnVsbFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBuc0xhc3RJbmRleCA9IGtleS5pbmRleE9mKCc6Jylcblx0XHRcdGlmIChuc0xhc3RJbmRleCAhPT0gLTEpIGtleSA9IGtleS5zbGljZShuc0xhc3RJbmRleCArIDEpXG5cdFx0XHRpZiAob2xkICE9PSBmYWxzZSkgdm5vZGUuZG9tLnJlbW92ZUF0dHJpYnV0ZShrZXkgPT09ICdjbGFzc05hbWUnID8gJ2NsYXNzJyA6IGtleSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gc2V0TGF0ZVNlbGVjdEF0dHJzKHZub2RlOiBhbnksIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG5cdFx0aWYgKCd2YWx1ZScgaW4gYXR0cnMpIHtcblx0XHRcdGlmIChhdHRycy52YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRpZiAodm5vZGUuZG9tLnNlbGVjdGVkSW5kZXggIT09IC0xKSB2bm9kZS5kb20udmFsdWUgPSBudWxsXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBub3JtYWxpemVkID0gJycgKyBhdHRycy52YWx1ZVxuXHRcdFx0XHRpZiAodm5vZGUuZG9tLnZhbHVlICE9PSBub3JtYWxpemVkIHx8IHZub2RlLmRvbS5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRcdHZub2RlLmRvbS52YWx1ZSA9IG5vcm1hbGl6ZWRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoJ3NlbGVjdGVkSW5kZXgnIGluIGF0dHJzKSBzZXRBdHRyKHZub2RlLCAnc2VsZWN0ZWRJbmRleCcsIG51bGwsIGF0dHJzLnNlbGVjdGVkSW5kZXgsIHVuZGVmaW5lZClcblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVBdHRycyh2bm9kZTogYW55LCBvbGQ6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0XHQvLyBTb21lIGF0dHJpYnV0ZXMgbWF5IE5PVCBiZSBjYXNlLXNlbnNpdGl2ZSAoZS5nLiBkYXRhLSoqKiksXG5cdFx0Ly8gc28gcmVtb3ZhbCBzaG91bGQgYmUgZG9uZSBmaXJzdCB0byBwcmV2ZW50IGFjY2lkZW50YWwgcmVtb3ZhbCBmb3IgbmV3bHkgc2V0dGluZyB2YWx1ZXMuXG5cdFx0bGV0IHZhbDogYW55XG5cdFx0aWYgKG9sZCAhPSBudWxsKSB7XG5cdFx0XHRpZiAob2xkID09PSBhdHRycyAmJiAhY2FjaGVkQXR0cnNJc1N0YXRpY01hcC5oYXMoYXR0cnMhKSkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ0RvblxcJ3QgcmV1c2UgYXR0cnMgb2JqZWN0LCB1c2UgbmV3IG9iamVjdCBmb3IgZXZlcnkgcmVkcmF3LCB0aGlzIHdpbGwgdGhyb3cgaW4gbmV4dCBtYWpvcicpXG5cdFx0XHR9XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBvbGQpIHtcblx0XHRcdFx0aWYgKCgodmFsID0gb2xkW2tleV0pICE9IG51bGwpICYmIChhdHRycyA9PSBudWxsIHx8IGF0dHJzW2tleV0gPT0gbnVsbCkpIHtcblx0XHRcdFx0XHRyZW1vdmVBdHRyKHZub2RlLCBrZXksIHZhbCwgbnMpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGF0dHJzICE9IG51bGwpIHtcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG5cdFx0XHRcdHNldEF0dHIodm5vZGUsIGtleSwgb2xkICYmIG9sZFtrZXldLCBhdHRyc1trZXldLCBucylcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaXNGb3JtQXR0cmlidXRlKHZub2RlOiBhbnksIGF0dHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBhdHRyID09PSAndmFsdWUnIHx8IGF0dHIgPT09ICdjaGVja2VkJyB8fCBhdHRyID09PSAnc2VsZWN0ZWRJbmRleCcgfHwgYXR0ciA9PT0gJ3NlbGVjdGVkJyAmJiAodm5vZGUuZG9tID09PSBhY3RpdmVFbGVtZW50KHZub2RlLmRvbSkgfHwgdm5vZGUudGFnID09PSAnb3B0aW9uJyAmJiB2bm9kZS5kb20ucGFyZW50Tm9kZSA9PT0gYWN0aXZlRWxlbWVudCh2bm9kZS5kb20pKVxuXHR9XG5cdGZ1bmN0aW9uIGlzTGlmZWN5Y2xlTWV0aG9kKGF0dHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBhdHRyID09PSAnb25pbml0JyB8fCBhdHRyID09PSAnb25jcmVhdGUnIHx8IGF0dHIgPT09ICdvbnVwZGF0ZScgfHwgYXR0ciA9PT0gJ29ucmVtb3ZlJyB8fCBhdHRyID09PSAnb25iZWZvcmVyZW1vdmUnIHx8IGF0dHIgPT09ICdvbmJlZm9yZXVwZGF0ZSdcblx0fVxuXHRmdW5jdGlvbiBoYXNQcm9wZXJ0eUtleSh2bm9kZTogYW55LCBrZXk6IHN0cmluZywgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuXHRcdC8vIEZpbHRlciBvdXQgbmFtZXNwYWNlZCBrZXlzXG5cdFx0cmV0dXJuIG5zID09PSB1bmRlZmluZWQgJiYgKFxuXHRcdFx0Ly8gSWYgaXQncyBhIGN1c3RvbSBlbGVtZW50LCBqdXN0IGtlZXAgaXQuXG5cdFx0XHR2bm9kZS50YWcuaW5kZXhPZignLScpID4gLTEgfHwgdm5vZGUuaXMgfHxcblx0XHRcdC8vIElmIGl0J3MgYSBub3JtYWwgZWxlbWVudCwgbGV0J3MgdHJ5IHRvIGF2b2lkIGEgZmV3IGJyb3dzZXIgYnVncy5cblx0XHRcdGtleSAhPT0gJ2hyZWYnICYmIGtleSAhPT0gJ2xpc3QnICYmIGtleSAhPT0gJ2Zvcm0nICYmIGtleSAhPT0gJ3dpZHRoJyAmJiBrZXkgIT09ICdoZWlnaHQnLy8gJiYga2V5ICE9PSBcInR5cGVcIlxuXHRcdFx0Ly8gRGVmZXIgdGhlIHByb3BlcnR5IGNoZWNrIHVudGlsICphZnRlciogd2UgY2hlY2sgZXZlcnl0aGluZy5cblx0XHQpICYmIGtleSBpbiB2bm9kZS5kb21cblx0fVxuXG5cdC8vIHN0eWxlXG5cdGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBvbGQ6IGFueSwgc3R5bGU6IGFueSkge1xuXHRcdGlmIChvbGQgPT09IHN0eWxlKSB7XG5cdFx0XHQvLyBTdHlsZXMgYXJlIGVxdWl2YWxlbnQsIGRvIG5vdGhpbmcuXG5cdFx0fSBlbHNlIGlmIChzdHlsZSA9PSBudWxsKSB7XG5cdFx0XHQvLyBOZXcgc3R5bGUgaXMgbWlzc2luZywganVzdCBjbGVhciBpdC5cblx0XHRcdGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9ICcnXG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc3R5bGUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHQvLyBOZXcgc3R5bGUgaXMgYSBzdHJpbmcsIGxldCBlbmdpbmUgZGVhbCB3aXRoIHBhdGNoaW5nLlxuXHRcdFx0ZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gc3R5bGVcblx0XHR9IGVsc2UgaWYgKG9sZCA9PSBudWxsIHx8IHR5cGVvZiBvbGQgIT09ICdvYmplY3QnKSB7XG5cdFx0XHQvLyBgb2xkYCBpcyBtaXNzaW5nIG9yIGEgc3RyaW5nLCBgc3R5bGVgIGlzIGFuIG9iamVjdC5cblx0XHRcdGVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9ICcnXG5cdFx0XHQvLyBBZGQgbmV3IHN0eWxlIHByb3BlcnRpZXNcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIHN0eWxlKSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gc3R5bGVba2V5XVxuXHRcdFx0XHRpZiAodmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmIChrZXkuaW5jbHVkZXMoJy0nKSkgZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0ZWxzZSAoZWxlbWVudC5zdHlsZSBhcyBhbnkpW2tleV0gPSBTdHJpbmcodmFsdWUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQm90aCBvbGQgJiBuZXcgYXJlIChkaWZmZXJlbnQpIG9iamVjdHMuXG5cdFx0XHQvLyBSZW1vdmUgc3R5bGUgcHJvcGVydGllcyB0aGF0IG5vIGxvbmdlciBleGlzdFxuXHRcdFx0Ly8gU3R5bGUgcHJvcGVydGllcyBtYXkgaGF2ZSB0d28gY2FzZXMoZGFzaC1jYXNlIGFuZCBjYW1lbENhc2UpLFxuXHRcdFx0Ly8gc28gcmVtb3ZhbCBzaG91bGQgYmUgZG9uZSBmaXJzdCB0byBwcmV2ZW50IGFjY2lkZW50YWwgcmVtb3ZhbCBmb3IgbmV3bHkgc2V0dGluZyB2YWx1ZXMuXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBvbGQpIHtcblx0XHRcdFx0aWYgKG9sZFtrZXldICE9IG51bGwgJiYgc3R5bGVba2V5XSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmNsdWRlcygnLScpKSBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSlcblx0XHRcdFx0XHRlbHNlIChlbGVtZW50LnN0eWxlIGFzIGFueSlba2V5XSA9ICcnXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFVwZGF0ZSBzdHlsZSBwcm9wZXJ0aWVzIHRoYXQgaGF2ZSBjaGFuZ2VkXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBzdHlsZSkge1xuXHRcdFx0XHRsZXQgdmFsdWUgPSBzdHlsZVtrZXldXG5cdFx0XHRcdGlmICh2YWx1ZSAhPSBudWxsICYmICh2YWx1ZSA9IFN0cmluZyh2YWx1ZSkpICE9PSBTdHJpbmcob2xkW2tleV0pKSB7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmNsdWRlcygnLScpKSBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpXG5cdFx0XHRcdFx0ZWxzZSAoZWxlbWVudC5zdHlsZSBhcyBhbnkpW2tleV0gPSB2YWx1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gSGVyZSdzIGFuIGV4cGxhbmF0aW9uIG9mIGhvdyB0aGlzIHdvcmtzOlxuXHQvLyAxLiBUaGUgZXZlbnQgbmFtZXMgYXJlIGFsd2F5cyAoYnkgZGVzaWduKSBwcmVmaXhlZCBieSBgb25gLlxuXHQvLyAyLiBUaGUgRXZlbnRMaXN0ZW5lciBpbnRlcmZhY2UgYWNjZXB0cyBlaXRoZXIgYSBmdW5jdGlvbiBvciBhbiBvYmplY3Rcblx0Ly8gICAgd2l0aCBhIGBoYW5kbGVFdmVudGAgbWV0aG9kLlxuXHQvLyAzLiBUaGUgb2JqZWN0IGRvZXMgbm90IGluaGVyaXQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAsIHRvIGF2b2lkXG5cdC8vICAgIGFueSBwb3RlbnRpYWwgaW50ZXJmZXJlbmNlIHdpdGggdGhhdCAoZS5nLiBzZXR0ZXJzKS5cblx0Ly8gNC4gVGhlIGV2ZW50IG5hbWUgaXMgcmVtYXBwZWQgdG8gdGhlIGhhbmRsZXIgYmVmb3JlIGNhbGxpbmcgaXQuXG5cdC8vIDUuIEluIGZ1bmN0aW9uLWJhc2VkIGV2ZW50IGhhbmRsZXJzLCBgZXYudGFyZ2V0ID09PSB0aGlzYC4gV2UgcmVwbGljYXRlXG5cdC8vICAgIHRoYXQgYmVsb3cuXG5cdC8vIDYuIEluIGZ1bmN0aW9uLWJhc2VkIGV2ZW50IGhhbmRsZXJzLCBgcmV0dXJuIGZhbHNlYCBwcmV2ZW50cyB0aGUgZGVmYXVsdFxuXHQvLyAgICBhY3Rpb24gYW5kIHN0b3BzIGV2ZW50IHByb3BhZ2F0aW9uLiBXZSByZXBsaWNhdGUgdGhhdCBiZWxvdy5cblx0ZnVuY3Rpb24gRXZlbnREaWN0KHRoaXM6IGFueSkge1xuXHRcdC8vIFNhdmUgdGhpcywgc28gdGhlIGN1cnJlbnQgcmVkcmF3IGlzIGNvcnJlY3RseSB0cmFja2VkLlxuXHRcdHRoaXMuXyA9IGN1cnJlbnRSZWRyYXdcblx0fVxuXHRFdmVudERpY3QucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXHRFdmVudERpY3QucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oZXY6IGFueSkge1xuXHRcdGNvbnN0IGhhbmRsZXIgPSB0aGlzWydvbicgKyBldi50eXBlXVxuXHRcdGxldCByZXN1bHQ6IGFueVxuXHRcdGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykgcmVzdWx0ID0gaGFuZGxlci5jYWxsKGV2LmN1cnJlbnRUYXJnZXQsIGV2KVxuXHRcdGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyLmhhbmRsZUV2ZW50ID09PSAnZnVuY3Rpb24nKSBoYW5kbGVyLmhhbmRsZUV2ZW50KGV2KVxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzXG5cdFx0aWYgKHNlbGYuXyAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXYucmVkcmF3ICE9PSBmYWxzZSkgKDAsIHNlbGYuXykoKVxuXHRcdFx0aWYgKHJlc3VsdCAhPSBudWxsICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmIChzZWxmLl8gIT0gbnVsbCAmJiBldi5yZWRyYXcgIT09IGZhbHNlKSAoMCwgc2VsZi5fKSgpXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG5cdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldi5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdH1cblx0fVxuXG5cdC8vIGV2ZW50XG5cdGZ1bmN0aW9uIHVwZGF0ZUV2ZW50KHZub2RlOiBhbnksIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG5cdFx0aWYgKHZub2RlLmV2ZW50cyAhPSBudWxsKSB7XG5cdFx0XHR2bm9kZS5ldmVudHMuXyA9IGN1cnJlbnRSZWRyYXdcblx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5XSA9PT0gdmFsdWUpIHJldHVyblxuXHRcdFx0aWYgKHZhbHVlICE9IG51bGwgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSkge1xuXHRcdFx0XHRpZiAodm5vZGUuZXZlbnRzW2tleV0gPT0gbnVsbCkgdm5vZGUuZG9tLmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2bm9kZS5ldmVudHMsIGZhbHNlKVxuXHRcdFx0XHR2bm9kZS5ldmVudHNba2V5XSA9IHZhbHVlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodm5vZGUuZXZlbnRzW2tleV0gIT0gbnVsbCkgdm5vZGUuZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2bm9kZS5ldmVudHMsIGZhbHNlKVxuXHRcdFx0XHR2bm9kZS5ldmVudHNba2V5XSA9IHVuZGVmaW5lZFxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpKSB7XG5cdFx0XHR2bm9kZS5ldmVudHMgPSBuZXcgKEV2ZW50RGljdCBhcyBhbnkpKClcblx0XHRcdHZub2RlLmRvbS5hZGRFdmVudExpc3RlbmVyKGtleS5zbGljZSgyKSwgdm5vZGUuZXZlbnRzLCBmYWxzZSlcblx0XHRcdHZub2RlLmV2ZW50c1trZXldID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvLyBsaWZlY3ljbGVcblx0ZnVuY3Rpb24gaW5pdExpZmVjeWNsZShzb3VyY2U6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Ly8gQWx3YXlzIGNhbGwgb25pbml0LCBidXQgcGFzcyBjb250ZXh0IHNvIGNvbXBvbmVudHMgY2FuIG1ha2UgaW50ZWxsaWdlbnQgZGVjaXNpb25zXG5cdFx0Ly8gQ29tcG9uZW50cyBjYW4gY2hlY2sgY29udGV4dC5pc1NTUiBvciBjb250ZXh0LmlzSHlkcmF0aW5nIHRvIGNvbmRpdGlvbmFsbHkgbG9hZCBkYXRhXG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25pbml0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0ge1xuXHRcdFx0XHRpc1NTUjogZmFsc2UsXG5cdFx0XHRcdGlzSHlkcmF0aW5nOiBpc0h5ZHJhdGluZyxcblx0XHRcdH1cblx0XHRcdGNvbnN0IHJlc3VsdCA9IGNhbGxIb29rLmNhbGwoc291cmNlLm9uaW5pdCwgdm5vZGUsIGNvbnRleHQpXG5cdFx0XHQvLyBBdXRvLXJlZHJhdyB3aGVuIGFzeW5jIG9uaW5pdCBjb21wbGV0ZXMgKGNsaWVudC1zaWRlIG9ubHkpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nICYmIGN1cnJlbnRSZWRyYXcgIT0gbnVsbCkge1xuXHRcdFx0XHRQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmIChjdXJyZW50UmVkcmF3ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3IgLSBDb21tYSBvcGVyYXRvciBpbnRlbnRpb25hbGx5IHVzZWQgdG8gY2FsbCB3aXRob3V0ICd0aGlzJyBiaW5kaW5nXG5cdFx0XHRcdFx0XHQoMCwgY3VycmVudFJlZHJhdykoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub25jcmVhdGUgPT09ICdmdW5jdGlvbicpIGhvb2tzLnB1c2goY2FsbEhvb2suYmluZChzb3VyY2Uub25jcmVhdGUsIHZub2RlKSlcblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVMaWZlY3ljbGUoc291cmNlOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPikge1xuXHRcdGlmICh0eXBlb2Ygc291cmNlLm9udXBkYXRlID09PSAnZnVuY3Rpb24nKSBob29rcy5wdXNoKGNhbGxIb29rLmJpbmQoc291cmNlLm9udXBkYXRlLCB2bm9kZSkpXG5cdH1cblx0ZnVuY3Rpb24gc2hvdWxkTm90VXBkYXRlKHZub2RlOiBhbnksIG9sZDogYW55KTogYm9vbGVhbiB7XG5cdFx0ZG8ge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JldXBkYXRlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdGNvbnN0IGZvcmNlID0gY2FsbEhvb2suY2FsbCh2bm9kZS5hdHRycy5vbmJlZm9yZXVwZGF0ZSwgdm5vZGUsIG9sZClcblx0XHRcdFx0aWYgKGZvcmNlICE9PSB1bmRlZmluZWQgJiYgIWZvcmNlKSBicmVha1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiB2bm9kZS50YWcgIT09ICdzdHJpbmcnICYmIHR5cGVvZiB2bm9kZS5zdGF0ZS5vbmJlZm9yZXVwZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRjb25zdCBmb3JjZSA9IGNhbGxIb29rLmNhbGwodm5vZGUuc3RhdGUub25iZWZvcmV1cGRhdGUsIHZub2RlLCBvbGQpXG5cdFx0XHRcdGlmIChmb3JjZSAhPT0gdW5kZWZpbmVkICYmICFmb3JjZSkgYnJlYWtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0gd2hpbGUgKGZhbHNlKSAgXG5cdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdHZub2RlLmRvbVNpemUgPSBvbGQuZG9tU2l6ZVxuXHRcdHZub2RlLmluc3RhbmNlID0gb2xkLmluc3RhbmNlXG5cdFx0Ly8gT25lIHdvdWxkIHRoaW5rIGhhdmluZyB0aGUgYWN0dWFsIGxhdGVzdCBhdHRyaWJ1dGVzIHdvdWxkIGJlIGlkZWFsLFxuXHRcdC8vIGJ1dCBpdCBkb2Vzbid0IGxldCB1cyBwcm9wZXJseSBkaWZmIGJhc2VkIG9uIG91ciBjdXJyZW50IGludGVybmFsXG5cdFx0Ly8gcmVwcmVzZW50YXRpb24uIFdlIGhhdmUgdG8gc2F2ZSBub3Qgb25seSB0aGUgb2xkIERPTSBpbmZvLCBidXQgYWxzb1xuXHRcdC8vIHRoZSBhdHRyaWJ1dGVzIHVzZWQgdG8gY3JlYXRlIGl0LCBhcyB3ZSBkaWZmICp0aGF0Kiwgbm90IGFnYWluc3QgdGhlXG5cdFx0Ly8gRE9NIGRpcmVjdGx5ICh3aXRoIGEgZmV3IGV4Y2VwdGlvbnMgaW4gYHNldEF0dHJgKS4gQW5kLCBvZiBjb3Vyc2UsIHdlXG5cdFx0Ly8gbmVlZCB0byBzYXZlIHRoZSBjaGlsZHJlbiBhbmQgdGV4dCBhcyB0aGV5IGFyZSBjb25jZXB0dWFsbHkgbm90XG5cdFx0Ly8gdW5saWtlIHNwZWNpYWwgXCJhdHRyaWJ1dGVzXCIgaW50ZXJuYWxseS5cblx0XHR2bm9kZS5hdHRycyA9IG9sZC5hdHRyc1xuXHRcdHZub2RlLmNoaWxkcmVuID0gb2xkLmNoaWxkcmVuXG5cdFx0dm5vZGUudGV4dCA9IG9sZC50ZXh0XG5cdFx0cmV0dXJuIHRydWVcblx0fVxuXG5cdGxldCBjdXJyZW50RE9NOiBFbGVtZW50IHwgbnVsbCA9IG51bGxcblxuXHRyZXR1cm4gZnVuY3Rpb24oZG9tOiBFbGVtZW50LCB2bm9kZXM6IENoaWxkcmVuIHwgVm5vZGVUeXBlIHwgbnVsbCwgcmVkcmF3PzogKCkgPT4gdm9pZCkge1xuXHRcdGlmICghZG9tKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdET00gZWxlbWVudCBiZWluZyByZW5kZXJlZCB0byBkb2VzIG5vdCBleGlzdC4nKVxuXHRcdGlmIChjdXJyZW50RE9NICE9IG51bGwgJiYgZG9tLmNvbnRhaW5zKGN1cnJlbnRET00pKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdOb2RlIGlzIGN1cnJlbnRseSBiZWluZyByZW5kZXJlZCB0byBhbmQgdGh1cyBpcyBsb2NrZWQuJylcblx0XHR9XG5cdFx0Y29uc3QgcHJldlJlZHJhdyA9IGN1cnJlbnRSZWRyYXdcblx0XHRjb25zdCBwcmV2RE9NID0gY3VycmVudERPTVxuXHRcdGNvbnN0IGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdXG5cdFx0Y29uc3QgYWN0aXZlID0gYWN0aXZlRWxlbWVudChkb20pXG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gZG9tLm5hbWVzcGFjZVVSSVxuXG5cdFx0Y3VycmVudERPTSA9IGRvbVxuXHRcdGN1cnJlbnRSZWRyYXcgPSB0eXBlb2YgcmVkcmF3ID09PSAnZnVuY3Rpb24nID8gcmVkcmF3IDogdW5kZWZpbmVkXG5cdFx0Y3VycmVudFJlbmRlciA9IHt9XG5cdFx0Ly8gUmVzZXQgaHlkcmF0aW9uIGVycm9yIGNvdW50ZXIgYW5kIG1pc21hdGNoIGNvdW50IGF0IHN0YXJ0IG9mIGVhY2ggcmVuZGVyIGN5Y2xlXG5cdFx0cmVzZXRIeWRyYXRpb25FcnJvckNvdW50KClcblx0XHRoeWRyYXRpb25NaXNtYXRjaENvdW50ID0gMFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBEZXRlY3QgaHlkcmF0aW9uOiBET00gaGFzIGNoaWxkcmVuIGJ1dCBubyB2bm9kZXMgdHJhY2tlZFxuXHRcdFx0Ly8gT25seSBjaGVjayBjaGlsZHJlbiBmb3IgRWxlbWVudCBub2RlcyAoRG9jdW1lbnRGcmFnbWVudCBkb2Vzbid0IGhhdmUgY2hpbGRyZW4gcHJvcGVydHkpXG5cdFx0XHRsZXQgaXNIeWRyYXRpbmcgPSAoZG9tIGFzIGFueSkudm5vZGVzID09IG51bGwgJiYgXG5cdFx0XHRcdGRvbS5ub2RlVHlwZSA9PT0gMSAmJiAvLyBFbGVtZW50IG5vZGVcblx0XHRcdFx0J2NoaWxkcmVuJyBpbiBkb20gJiZcblx0XHRcdFx0KGRvbSBhcyBFbGVtZW50KS5jaGlsZHJlbi5sZW5ndGggPiAwXG5cdFx0XHRcblx0XHRcdC8vIEZpcnN0IHRpbWUgcmVuZGVyaW5nIGludG8gYSBub2RlIGNsZWFycyBpdCBvdXQgKHVubGVzcyBoeWRyYXRpbmcpXG5cdFx0XHRpZiAoIWlzSHlkcmF0aW5nICYmIChkb20gYXMgYW55KS52bm9kZXMgPT0gbnVsbCkgZG9tLnRleHRDb250ZW50ID0gJydcblx0XHRcdGNvbnN0IG5vcm1hbGl6ZWQgPSAoVm5vZGUgYXMgYW55KS5ub3JtYWxpemVDaGlsZHJlbihBcnJheS5pc0FycmF5KHZub2RlcykgPyB2bm9kZXMgOiBbdm5vZGVzXSlcblx0XHRcdHVwZGF0ZU5vZGVzKGRvbSwgKGRvbSBhcyBhbnkpLnZub2Rlcywgbm9ybWFsaXplZCwgaG9va3MsIG51bGwsIChuYW1lc3BhY2UgPT09ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJyA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZSkgYXMgc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZylcblx0XHRcdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgd2UndmUgZXhjZWVkZWQgbWlzbWF0Y2ggdGhyZXNob2xkIGFmdGVyIHByb2Nlc3Npbmcgbm9kZXNcblx0XHRcdC8vIElmIHNvLCBjbGVhciBhbmQgcmUtcmVuZGVyIGZyb20gc2NyYXRjaCAoY2xpZW50IFZET00gd2lucylcblx0XHRcdGlmIChpc0h5ZHJhdGluZyAmJiBoeWRyYXRpb25NaXNtYXRjaENvdW50ID4gTUFYX0hZRFJBVElPTl9NSVNNQVRDSEVTKSB7XG5cdFx0XHRcdGxvZ2dlci53YXJuKGBIeWRyYXRpb24gbWlzbWF0Y2ggdGhyZXNob2xkIGV4Y2VlZGVkLiBDbGVhcmluZyBwYXJlbnQgYW5kIHJlLXJlbmRlcmluZyBmcm9tIGNsaWVudCBWRE9NLmAsIHtcblx0XHRcdFx0XHRtaXNtYXRjaENvdW50OiBoeWRyYXRpb25NaXNtYXRjaENvdW50LFxuXHRcdFx0XHRcdHRocmVzaG9sZDogTUFYX0hZRFJBVElPTl9NSVNNQVRDSEVTLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRkb20udGV4dENvbnRlbnQgPSAnJ1xuXHRcdFx0XHRoeWRyYXRpb25NaXNtYXRjaENvdW50ID0gMFxuXHRcdFx0XHQvLyBDbGVhciBvbGQgdm5vZGVzIGFuZCByZS1yZW5kZXIgd2l0aG91dCBoeWRyYXRpb24gZmxhZ1xuXHRcdFx0XHQ7KGRvbSBhcyBhbnkpLnZub2RlcyA9IG51bGxcblx0XHRcdFx0Ly8gUmUtcmVuZGVyIHdpdGggZnJlc2ggaG9va3MgYXJyYXkgKGhvb2tzIGZyb20gZmlyc3QgcmVuZGVyIGFyZSBkaXNjYXJkZWQpXG5cdFx0XHRcdGNvbnN0IG92ZXJyaWRlSG9va3M6IEFycmF5PCgpID0+IHZvaWQ+ID0gW11cblx0XHRcdFx0dXBkYXRlTm9kZXMoZG9tLCBudWxsLCBub3JtYWxpemVkLCBvdmVycmlkZUhvb2tzLCBudWxsLCAobmFtZXNwYWNlID09PSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcgPyB1bmRlZmluZWQgOiBuYW1lc3BhY2UpIGFzIHN0cmluZyB8IHVuZGVmaW5lZCwgZmFsc2UpXG5cdFx0XHRcdC8vIEV4ZWN1dGUgaG9va3MgZnJvbSBvdmVycmlkZSByZW5kZXJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvdmVycmlkZUhvb2tzLmxlbmd0aDsgaSsrKSBvdmVycmlkZUhvb2tzW2ldKClcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Oyhkb20gYXMgYW55KS52bm9kZXMgPSBub3JtYWxpemVkXG5cdFx0XHQvLyBgZG9jdW1lbnQuYWN0aXZlRWxlbWVudGAgY2FuIHJldHVybiBudWxsOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbnRlcmFjdGlvbi5odG1sI2RvbS1kb2N1bWVudC1hY3RpdmVlbGVtZW50XG5cdFx0XHRpZiAoYWN0aXZlICE9IG51bGwgJiYgYWN0aXZlRWxlbWVudChkb20pICE9PSBhY3RpdmUgJiYgdHlwZW9mIChhY3RpdmUgYXMgYW55KS5mb2N1cyA9PT0gJ2Z1bmN0aW9uJykgKGFjdGl2ZSBhcyBhbnkpLmZvY3VzKClcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyBpKyspIGhvb2tzW2ldKClcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Y3VycmVudFJlZHJhdyA9IHByZXZSZWRyYXdcblx0XHRcdGN1cnJlbnRET00gPSBwcmV2RE9NXG5cdFx0fVxuXHR9XG59XG4iLAogICAgIi8qKlxuICogSXNvbW9ycGhpYyBuZXh0X3RpY2sgdXRpbGl0eVxuICogXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIGFmdGVyIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBzdGFjayBjb21wbGV0ZXMuXG4gKiBcbiAqIC0gSW4gYnJvd3NlcjogVXNlcyBxdWV1ZU1pY3JvdGFzayBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZSwgZmFsbHMgYmFjayB0byBQcm9taXNlLnJlc29sdmUoKVxuICogLSBJbiBTU1I6IFJlc29sdmVzIGltbWVkaWF0ZWx5IHNpbmNlIFNTUiByZW5kZXJpbmcgaXMgc3luY2hyb25vdXMgYW5kIHRoZXJlJ3Mgbm8gZXZlbnQgbG9vcFxuICogXG4gKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgb24gdGhlIG5leHQgdGlja1xuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5hc3luYyBmdW5jdGlvbiBuZXh0X3RpY2soKTogUHJvbWlzZTx2b2lkPiB7XG5cdC8vIENoZWNrIGlmIHdlJ3JlIGluIFNTUiBtb2RlXG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbFRoaXMgYXMgYW55KS5fX1NTUl9NT0RFX18pIHtcblx0XHQvLyBJbiBTU1IgbW9kZSwgcmVzb2x2ZSBpbW1lZGlhdGVseSBzaW5jZSBTU1IgcmVuZGVyaW5nIGlzIHN5bmNocm9ub3VzXG5cdFx0Ly8gYW5kIHRoZXJlJ3Mgbm8gZXZlbnQgbG9vcCB0byBkZWZlciB0b1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHR9XG5cblx0Ly8gQnJvd3NlciBtb2RlOiB1c2UgcXVldWVNaWNyb3Rhc2sgZm9yIG9wdGltYWwgcGVyZm9ybWFuY2Vcblx0aWYgKHR5cGVvZiBxdWV1ZU1pY3JvdGFzayAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdHF1ZXVlTWljcm90YXNrKHJlc29sdmUpXG5cdFx0fSlcblx0fVxuXG5cdC8vIEZhbGxiYWNrOiB1c2UgUHJvbWlzZS5yZXNvbHZlKCkgZm9yIG9sZGVyIGVudmlyb25tZW50c1xuXHRpZiAodHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnICYmIFByb21pc2UucmVzb2x2ZSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHR9XG5cblx0Ly8gTGFzdCByZXNvcnQ6IHNldFRpbWVvdXQgKHNob3VsZG4ndCBoYXBwZW4gaW4gbW9kZXJuIGVudmlyb25tZW50cylcblx0aWYgKHR5cGVvZiBzZXRUaW1lb3V0ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZTogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlLCAwKVxuXHRcdH0pXG5cdH1cblxuXHQvLyBJZiBub3RoaW5nIGlzIGF2YWlsYWJsZSwgcmVzb2x2ZSBpbW1lZGlhdGVseVxuXHQvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gaW4gcHJhY3RpY2UsIGJ1dCBUeXBlU2NyaXB0IG5lZWRzIGEgcmV0dXJuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKSBhcyBQcm9taXNlPHZvaWQ+XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5leHRfdGlja1xuZXhwb3J0IHtuZXh0X3RpY2t9XG4iLAogICAgImltcG9ydCB7c2lnbmFsLCBjb21wdXRlZCwgU2lnbmFsLCBDb21wdXRlZFNpZ25hbH0gZnJvbSAnLi9zaWduYWwnXG5pbXBvcnQge2dldFNTUkNvbnRleHR9IGZyb20gJy4vc3NyQ29udGV4dCdcblxuLy8gV2Vha01hcCB0byBzdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZXMgZm9yIGFycmF5c1xuY29uc3QgYXJyYXlQYXJlbnRTaWduYWxNYXAgPSBuZXcgV2Vha01hcDxhbnksIFNpZ25hbDxhbnk+PigpXG5cbi8vIFR5cGUgZ3VhcmQgdG8gY2hlY2sgaWYgdmFsdWUgaXMgYSBTaWduYWxcbmZ1bmN0aW9uIGlzU2lnbmFsPFQ+KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBTaWduYWw8VD4ge1xuXHRyZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBTaWduYWwgfHwgdmFsdWUgaW5zdGFuY2VvZiBDb21wdXRlZFNpZ25hbFxufVxuXG4vLyBUeXBlIGd1YXJkIHRvIGNoZWNrIGlmIHZhbHVlIGlzIGFscmVhZHkgYSBzdGF0ZSAoaGFzIGJlZW4gd3JhcHBlZClcbmZ1bmN0aW9uIGlzU3RhdGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAodmFsdWUgYXMgYW55KS5fX2lzU3RhdGUgPT09IHRydWVcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHZhbHVlIGlzIGEgZ2V0L3NldCBkZXNjcmlwdG9yIG9iamVjdCAobGlrZSBKYXZhU2NyaXB0IHByb3BlcnR5IGRlc2NyaXB0b3JzKVxuICogVXNlZCB0byBkZXRlY3QgY29tcHV0ZWQgcHJvcGVydGllcyBkZWZpbmVkIGFzIHsgZ2V0OiAoKSA9PiBULCBzZXQ/OiAodmFsdWU6IFQpID0+IHZvaWQgfVxuICovXG5mdW5jdGlvbiBpc0dldFNldERlc2NyaXB0b3IodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiBcblx0ICAgICAgICh0eXBlb2YgdmFsdWUuZ2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWx1ZS5zZXQgPT09ICdmdW5jdGlvbicpXG59XG5cbi8qKlxuICogQ29udmVydCBhIHZhbHVlIHRvIGEgc2lnbmFsIGlmIGl0J3Mgbm90IGFscmVhZHkgb25lXG4gKi9cbmZ1bmN0aW9uIHRvU2lnbmFsPFQ+KHZhbHVlOiBUKTogU2lnbmFsPFQ+IHwgQ29tcHV0ZWRTaWduYWw8VD4ge1xuXHRpZiAoaXNTaWduYWwodmFsdWUpKSB7XG5cdFx0cmV0dXJuIHZhbHVlIGFzIFNpZ25hbDxUPiB8IENvbXB1dGVkU2lnbmFsPFQ+XG5cdH1cblx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdC8vIEZ1bmN0aW9uIHByb3BlcnRpZXMgYmVjb21lIGNvbXB1dGVkIHNpZ25hbHNcblx0XHRyZXR1cm4gY29tcHV0ZWQodmFsdWUgYXMgKCkgPT4gVClcblx0fVxuXHRyZXR1cm4gc2lnbmFsKHZhbHVlKVxufVxuXG4vLyBTdGF0ZSByZWdpc3RyeSBmb3IgU1NSIHNlcmlhbGl6YXRpb25cbi8vIFN0b3JlcyBib3RoIHN0YXRlIGluc3RhbmNlIGFuZCBvcmlnaW5hbCBpbml0aWFsIHN0YXRlICh3aXRoIGNvbXB1dGVkIHByb3BlcnRpZXMpXG5pbnRlcmZhY2UgU3RhdGVSZWdpc3RyeUVudHJ5IHtcblx0c3RhdGU6IGFueVxuXHRpbml0aWFsOiBhbnlcbn1cblxuY29uc3QgZ2xvYmFsU3RhdGVSZWdpc3RyeSA9IG5ldyBNYXA8c3RyaW5nLCBTdGF0ZVJlZ2lzdHJ5RW50cnk+KClcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByZWdpc3RyeSB0byB1c2U6IHBlci1yZXF1ZXN0IHJlZ2lzdHJ5IHdoZW4gaW5zaWRlIGFuIFNTUlxuICogcnVuV2l0aENvbnRleHQoKSwgb3RoZXJ3aXNlIHRoZSBnbG9iYWwgcmVnaXN0cnkgKGNsaWVudCBvciB0ZXN0cykuXG4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0ZVJlZ2lzdHJ5KCk6IE1hcDxzdHJpbmcsIFN0YXRlUmVnaXN0cnlFbnRyeT4ge1xuXHRjb25zdCBjdHggPSBnZXRTU1JDb250ZXh0KClcblx0aWYgKGN0eD8uc3RhdGVSZWdpc3RyeSkge1xuXHRcdHJldHVybiBjdHguc3RhdGVSZWdpc3RyeSBhcyBNYXA8c3RyaW5nLCBTdGF0ZVJlZ2lzdHJ5RW50cnk+XG5cdH1cblx0cmV0dXJuIGdsb2JhbFN0YXRlUmVnaXN0cnlcbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIHN0YXRlIGZvciBTU1Igc2VyaWFsaXphdGlvblxuICogQ2FsbGVkIGF1dG9tYXRpY2FsbHkgd2hlbiBzdGF0ZSBpcyBjcmVhdGVkIHdpdGggYSBuYW1lXG4gKiBAcGFyYW0gbmFtZSAtIFVuaXF1ZSBuYW1lIGZvciB0aGUgc3RhdGVcbiAqIEBwYXJhbSBzdGF0ZUluc3RhbmNlIC0gVGhlIHN0YXRlIGluc3RhbmNlIHRvIHJlZ2lzdGVyXG4gKiBAcGFyYW0gaW5pdGlhbCAtIE9yaWdpbmFsIGluaXRpYWwgc3RhdGUgKHdpdGggY29tcHV0ZWQgcHJvcGVydGllcykgZm9yIHJlc3RvcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclN0YXRlKG5hbWU6IHN0cmluZywgc3RhdGVJbnN0YW5jZTogYW55LCBpbml0aWFsOiBhbnkpOiB2b2lkIHtcblx0aWYgKCFuYW1lIHx8IHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyB8fCBuYW1lLnRyaW0oKSA9PT0gJycpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1N0YXRlIG5hbWUgaXMgcmVxdWlyZWQgYW5kIG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJylcblx0fVxuXG5cdGNvbnN0IHJlZ2lzdHJ5ID0gZ2V0Q3VycmVudFN0YXRlUmVnaXN0cnkoKVxuXG5cdC8vIFdhcm4gaW4gZGV2ZWxvcG1lbnQgaWYgbmFtZSBjb2xsaXNpb24gZGV0ZWN0ZWRcblx0aWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudj8uTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuXHRcdGlmIChyZWdpc3RyeS5oYXMobmFtZSkpIHtcblx0XHRcdGNvbnNvbGUud2FybihgU3RhdGUgbmFtZSBjb2xsaXNpb24gZGV0ZWN0ZWQ6IFwiJHtuYW1lfVwiLiBMYXN0IHJlZ2lzdGVyZWQgc3RhdGUgd2lsbCBiZSB1c2VkLmApXG5cdFx0fVxuXHR9XG5cblx0cmVnaXN0cnkuc2V0KG5hbWUsIHtzdGF0ZTogc3RhdGVJbnN0YW5jZSwgaW5pdGlhbH0pXG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSByZWdpc3RyeSBlbnRyeSBmb3IgYW4gZXhpc3Rpbmcgc3RhdGVcbiAqIFVzZWQgYnkgU3RvcmUgdG8gdXBkYXRlIGl0cyBcImluaXRpYWxcIiBzdGF0ZSBhZnRlciBsb2FkKCkgaXMgY2FsbGVkXG4gKiBAcGFyYW0gc3RhdGVJbnN0YW5jZSAtIFRoZSBzdGF0ZSBpbnN0YW5jZSB0byB1cGRhdGVcbiAqIEBwYXJhbSBpbml0aWFsIC0gTmV3IGluaXRpYWwgc3RhdGUgKG1lcmdlZCB0ZW1wbGF0ZXMgZm9yIFN0b3JlKVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU3RhdGVSZWdpc3RyeShzdGF0ZUluc3RhbmNlOiBhbnksIGluaXRpYWw6IGFueSk6IHZvaWQge1xuXHRjb25zdCByZWdpc3RyeSA9IGdldEN1cnJlbnRTdGF0ZVJlZ2lzdHJ5KClcblx0Ly8gRmluZCB0aGUgcmVnaXN0cnkgZW50cnkgZm9yIHRoaXMgc3RhdGUgYW5kIHVwZGF0ZSBpdHMgaW5pdGlhbCB2YWx1ZVxuXHRmb3IgKGNvbnN0IFtuYW1lLCBlbnRyeV0gb2YgcmVnaXN0cnkuZW50cmllcygpKSB7XG5cdFx0aWYgKGVudHJ5LnN0YXRlID09PSBzdGF0ZUluc3RhbmNlKSB7XG5cdFx0XHRyZWdpc3RyeS5zZXQobmFtZSwge3N0YXRlOiBzdGF0ZUluc3RhbmNlLCBpbml0aWFsfSlcblx0XHRcdHJldHVyblxuXHRcdH1cblx0fVxuXHQvLyBJZiBub3QgZm91bmQsIHRoaXMgaXMgYW4gZXJyb3IgY2FzZSAtIHN0YXRlIHNob3VsZCBiZSByZWdpc3RlcmVkXG5cdHRocm93IG5ldyBFcnJvcignU3RhdGUgaW5zdGFuY2Ugbm90IGZvdW5kIGluIHJlZ2lzdHJ5LiBTdGF0ZSBtdXN0IGJlIHJlZ2lzdGVyZWQgYmVmb3JlIHVwZGF0aW5nLicpXG59XG5cbi8qKlxuICogR2V0IGFsbCByZWdpc3RlcmVkIHN0YXRlc1xuICogUmV0dXJucyBNYXAgb2Ygc3RhdGUgbmFtZXMgdG8gcmVnaXN0cnkgZW50cmllcyAoc3RhdGUgaW5zdGFuY2UgYW5kIGluaXRpYWwgc3RhdGUpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWdpc3RlcmVkU3RhdGVzKCk6IE1hcDxzdHJpbmcsIFN0YXRlUmVnaXN0cnlFbnRyeT4ge1xuXHRyZXR1cm4gZ2V0Q3VycmVudFN0YXRlUmVnaXN0cnkoKVxufVxuXG4vKipcbiAqIENsZWFyIHRoZSBzdGF0ZSByZWdpc3RyeSAodXNlZnVsIGZvciB0ZXN0aW5nIG9yIGFmdGVyIHNlcmlhbGl6YXRpb24pLlxuICogQ2xlYXJzIHRoZSBjdXJyZW50IHJlZ2lzdHJ5IChwZXItcmVxdWVzdCBpbiBTU1IsIGdsb2JhbCBvbiBjbGllbnQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTdGF0ZVJlZ2lzdHJ5KCk6IHZvaWQge1xuXHRnZXRDdXJyZW50U3RhdGVSZWdpc3RyeSgpLmNsZWFyKClcbn1cblxuLyoqXG4gKiBEZWVwIHNpZ25hbCBzdGF0ZSAtIHdyYXBzIG9iamVjdHMvYXJyYXlzIHdpdGggUHJveHkgdG8gbWFrZSB0aGVtIHJlYWN0aXZlXG4gKiBAcGFyYW0gaW5pdGlhbCAtIEluaXRpYWwgc3RhdGUgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAtIFJlcXVpcmVkIG5hbWUgZm9yIFNTUiBzZXJpYWxpemF0aW9uIChtdXN0IGJlIG5vbi1lbXB0eSBzdHJpbmcpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55Pj4oaW5pdGlhbDogVCwgbmFtZTogc3RyaW5nKTogU3RhdGU8VD4ge1xuXHQvLyBWYWxpZGF0ZSBuYW1lIHBhcmFtZXRlclxuXHRpZiAoIW5hbWUgfHwgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IG5hbWUudHJpbSgpID09PSAnJykge1xuXHRcdHRocm93IG5ldyBFcnJvcignU3RhdGUgbmFtZSBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcnKVxuXHR9XG5cdGNvbnN0IHNpZ25hbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTaWduYWw8YW55PiB8IENvbXB1dGVkU2lnbmFsPGFueT4+KClcblx0Y29uc3Qgc3RhdGVDYWNoZSA9IG5ldyBXZWFrTWFwPG9iamVjdCwgYW55PigpXG5cblx0Ly8gQ29udmVydCBpbml0aWFsIHZhbHVlcyB0byBzaWduYWxzXG5cdC8vIHBhcmVudFNpZ25hbE1hcCBpcyBvcHRpb25hbCAtIGlmIHByb3ZpZGVkLCBuZXN0ZWQgc3RhdGVzIHdpbGwgdXNlIGl0XG5cdC8vIElmIG5vdCBwcm92aWRlZCwgZWFjaCBuZXN0ZWQgc3RhdGUgZ2V0cyBpdHMgb3duIHNpZ25hbE1hcFxuXHRmdW5jdGlvbiBpbml0aWFsaXplU2lnbmFscyhvYmo6IGFueSwgcGFyZW50U2lnbmFsTWFwPzogTWFwPHN0cmluZywgU2lnbmFsPGFueT4gfCBDb21wdXRlZFNpZ25hbDxhbnk+Pik6IGFueSB7XG5cdFx0aWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIG9ialxuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIGFscmVhZHkgd3JhcHBlZFxuXHRcdGlmIChpc1N0YXRlKG9iaikpIHtcblx0XHRcdHJldHVybiBvYmpcblx0XHR9XG5cblx0XHQvLyBDaGVjayBjYWNoZVxuXHRcdGlmIChzdGF0ZUNhY2hlLmhhcyhvYmopKSB7XG5cdFx0XHRyZXR1cm4gc3RhdGVDYWNoZS5nZXQob2JqKVxuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBhcnJheXNcblx0XHRpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG5cdFx0XHQvLyBBcnJheXMgZG9uJ3QgZ2V0IHRoZWlyIG93biBzaWduYWxNYXAgLSB0aGV5IHVzZSB0aGUgcGFyZW50J3Ncblx0XHRcdC8vIE5lc3RlZCBvYmplY3RzIEFORCBhcnJheXMgc2hvdWxkIGJlIHJlY3Vyc2l2ZWx5IHdyYXBwZWRcblx0XHRcdGNvbnN0IHNpZ25hbHMgPSBvYmoubWFwKGl0ZW0gPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmIGl0ZW0gIT09IG51bGwpIHtcblx0XHRcdFx0XHQvLyBSZWN1cnNpdmVseSB3cmFwIG5lc3RlZCBvYmplY3RzIEFORCBhcnJheXMgaW4gUHJveGllc1xuXHRcdFx0XHRcdHJldHVybiBpbml0aWFsaXplU2lnbmFscyhpdGVtLCB1bmRlZmluZWQpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRvU2lnbmFsKGl0ZW0pXG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0XHQvLyBMaXN0IG9mIG11dGF0aW5nIGFycmF5IG1ldGhvZHMgdGhhdCBzaG91bGQgdHJpZ2dlciB0aGUgcGFyZW50IHNpZ25hbFxuXHRcdFx0Y29uc3QgbXV0YXRpbmdNZXRob2RzID0gWydzcGxpY2UnLCAncHVzaCcsICdwb3AnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdyZXZlcnNlJywgJ3NvcnQnLCAnZmlsbCcsICdjb3B5V2l0aGluJ11cblx0XHRcdFxuXHRcdFx0Ly8gV3JhcCB0aGUgc2lnbmFscyBhcnJheSBkaXJlY3RseSAobm90IGEgY29weSkgc28gbXV0YXRpb25zIHN0YXkgaW4gc3luY1xuXHRcdFx0Ly8gU3RvcmUgcGFyZW50IHNpZ25hbCByZWZlcmVuY2UgZGlyZWN0bHkgb24gdGhlIFByb3h5IGZvciByZWxpYWJsZSBsb29rdXBcblx0XHRcdGNvbnN0IHdyYXBwZWQgPSBuZXcgUHJveHkoc2lnbmFscywge1xuXHRcdFx0XHRnZXQodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdFx0aWYgKHByb3AgPT09ICdfX2lzU3RhdGUnKSByZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdGlmIChwcm9wID09PSAnX19zaWduYWxzJykgcmV0dXJuIHNpZ25hbHNcblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gJ19fcGFyZW50U2lnbmFsJykge1xuXHRcdFx0XHRcdFx0Ly8gQWxsb3cgYWNjZXNzaW5nIHBhcmVudCBzaWduYWwgZGlyZWN0bHkgZm9yIGRlYnVnZ2luZ1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHByb3AgPT09IFN5bWJvbC50b1N0cmluZ1RhZykgcmV0dXJuICdBcnJheScgLy8gTWFrZSBBcnJheS5pc0FycmF5KCkgd29ya1xuXHRcdFx0XHRcdGlmIChwcm9wID09PSBTeW1ib2wuaXRlcmF0b3IpIHtcblx0XHRcdFx0XHRcdC8vIFByb3ZpZGUgY3VzdG9tIGl0ZXJhdG9yIHRoYXQgdW53cmFwcyBTaWduYWwgdmFsdWVzXG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24qICgpIHtcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzaWduYWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsc1tpXVxuXHRcdFx0XHRcdFx0XHRcdHlpZWxkIGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWdcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gJ2xlbmd0aCcpIHJldHVybiBzaWduYWxzLmxlbmd0aFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IHByb3BTdHIgPSBTdHJpbmcocHJvcClcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBDaGVjayBmb3IgJCBwcmVmaXggY29udmVudGlvbiAoZGVlcHNpZ25hbC1zdHlsZTogcmV0dXJucyByYXcgc2lnbmFsKVxuXHRcdFx0XHRcdGlmIChwcm9wU3RyLnN0YXJ0c1dpdGgoJyQnKSAmJiBwcm9wU3RyLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4U3RyID0gcHJvcFN0ci5zbGljZSgxKVxuXHRcdFx0XHRcdFx0aWYgKCFpc05hTihOdW1iZXIoaW5kZXhTdHIpKSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBpbmRleCA9IE51bWJlcihpbmRleFN0cilcblx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCBzaWduYWxzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHNbaW5kZXhdXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGlzU2lnbmFsKHNpZykgPyBzaWcgOiBzaWdcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnICYmICFpc05hTihOdW1iZXIocHJvcCkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBpbmRleCA9IE51bWJlcihwcm9wKVxuXHRcdFx0XHRcdFx0aWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCBzaWduYWxzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWxzW2luZGV4XVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gaXNTaWduYWwoc2lnKSA/IHNpZy52YWx1ZSA6IHNpZ1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcClcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBGb3IgYXJyYXkgbWV0aG9kcyB0aGF0IGl0ZXJhdGUgKG1hcCwgZmlsdGVyLCBmb3JFYWNoLCBldGMuKSwgYmluZCB0byB3cmFwcGVkIFByb3h5XG5cdFx0XHRcdFx0Ly8gc28gdGhleSBnbyB0aHJvdWdoIG91ciBnZXQgdHJhcCBmb3IgZWxlbWVudCBhY2Nlc3Ncblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xuXHRcdFx0XHRcdFx0Ly8gQXJyYXkgaXRlcmF0aW9uIG1ldGhvZHMgbmVlZCB0byB1c2UgdGhlIFByb3h5IHNvIGVsZW1lbnQgYWNjZXNzIGlzIHVud3JhcHBlZFxuXHRcdFx0XHRcdFx0Y29uc3QgaXRlcmF0aW9uTWV0aG9kcyA9IFsnbWFwJywgJ2ZpbHRlcicsICdmb3JFYWNoJywgJ3NvbWUnLCAnZXZlcnknLCAnZmluZCcsICdmaW5kSW5kZXgnLCAncmVkdWNlJywgJ3JlZHVjZVJpZ2h0J11cblx0XHRcdFx0XHRcdC8vIFNlYXJjaCBtZXRob2RzIGFsc28gbmVlZCB1bndyYXBwZWQgdmFsdWVzIGZvciBjb21wYXJpc29uXG5cdFx0XHRcdFx0XHRjb25zdCBzZWFyY2hNZXRob2RzID0gWydpbmNsdWRlcycsICdpbmRleE9mJywgJ2xhc3RJbmRleE9mJ11cblx0XHRcdFx0XHRcdC8vIE1ldGhvZHMgdGhhdCByZXR1cm4gbmV3IGFycmF5cyBvciBzdHJpbmdzIG5lZWQgdW53cmFwcGVkIHZhbHVlc1xuXHRcdFx0XHRcdFx0Y29uc3QgcmV0dXJuTWV0aG9kcyA9IFsnc2xpY2UnLCAnY29uY2F0JywgJ2ZsYXQnLCAnZmxhdE1hcCcsICdqb2luJywgJ3RvU3RyaW5nJywgJ3RvTG9jYWxlU3RyaW5nJ11cblx0XHRcdFx0XHRcdC8vIEl0ZXJhdG9yIG1ldGhvZHMgbmVlZCB1bndyYXBwZWQgdmFsdWVzXG5cdFx0XHRcdFx0XHRjb25zdCBpdGVyYXRvck1ldGhvZHMgPSBbJ2VudHJpZXMnLCAna2V5cycsICd2YWx1ZXMnXVxuXHRcdFx0XHRcdFx0aWYgKGl0ZXJhdGlvbk1ldGhvZHMuaW5jbHVkZXMocHJvcFN0cikgfHwgc2VhcmNoTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSB8fCBcblx0XHRcdFx0XHRcdFx0cmV0dXJuTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSB8fCBpdGVyYXRvck1ldGhvZHMuaW5jbHVkZXMocHJvcFN0cikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLmJpbmQod3JhcHBlZClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gSW50ZXJjZXB0IG11dGF0aW5nIG1ldGhvZHMgdG8gdHJpZ2dlciBwYXJlbnQgc2lnbmFsXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBtdXRhdGluZ01ldGhvZHMuaW5jbHVkZXMocHJvcFN0cikpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiguLi5hcmdzOiBhbnlbXSkge1xuXHRcdFx0XHRcdFx0XHQvLyBGb3Igc3BsaWNlLCB3ZSBuZWVkIHRvIGhhbmRsZSBpdCBzcGVjaWFsbHkgdG8gY29udmVydCBuZXcgaXRlbXMgdG8gc2lnbmFsc1xuXHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3NwbGljZScpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdGFydCA9IGFyZ3NbMF0gPz8gMFxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRlbGV0ZUNvdW50ID0gYXJnc1sxXSA/PyAoc2lnbmFscy5sZW5ndGggLSBzdGFydClcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBuZXdJdGVtcyA9IGFyZ3Muc2xpY2UoMilcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBDb252ZXJ0IG5ldyBpdGVtcyAtIG5lc3RlZCBhcnJheXMvb2JqZWN0cyBiZWNvbWUgUHJveGllcywgcHJpbWl0aXZlcyBiZWNvbWUgU2lnbmFsc1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5ld1NpZ25hbHMgPSBuZXdJdGVtcy5tYXAoaXRlbSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmIGl0ZW0gIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gV3JhcCBvYmplY3RzL2FycmF5cyBpbiBQcm94aWVzIChOT1QgaW4gU2lnbmFscyAtIHRoZSBQcm94eSBJUyB0aGUgdmFsdWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBpbml0aWFsaXplU2lnbmFscyhpdGVtLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdG9TaWduYWwoaXRlbSlcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdC8vIFVwZGF0ZSB0aGUgc2lnbmFscyBhcnJheSAodGFyZ2V0IGlzIHNpZ25hbHMgYXJyYXkpXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVtb3ZlZCA9IHNpZ25hbHMuc3BsaWNlKHN0YXJ0LCBkZWxldGVDb3VudCwgLi4ubmV3U2lnbmFscylcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBMb29rIHVwIHBhcmVudCBzaWduYWwgQUZURVIgbXV0YXRpb24gdG8gZW5zdXJlIHdlIGhhdmUgdGhlIGxhdGVzdCByZWZlcmVuY2Vcblx0XHRcdFx0XHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgd2UgZ2V0IHRoZSBzaWduYWwgZXZlbiBpZiBpdCB3YXMgc3RvcmVkIGFmdGVyIGFjY2Vzc2luZyB0aGUgbWV0aG9kXG5cdFx0XHRcdFx0XHRcdFx0Ly8gVHJ5IFdlYWtNYXAgZmlyc3QsIHRoZW4gZmFsbGJhY2sgdG8gZGlyZWN0IHByb3BlcnR5IGFjY2Vzc1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHBhcmVudFNpZ25hbCA9IGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBUcmlnZ2VyIHBhcmVudCBzaWduYWwgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdFx0XHRcdFx0Ly8gTm90aWZ5IHN1YnNjcmliZXJzIGRpcmVjdGx5IHNpbmNlIHRoZSBhcnJheSByZWZlcmVuY2UgaGFzbid0IGNoYW5nZWRcblx0XHRcdFx0XHRcdFx0XHRpZiAocGFyZW50U2lnbmFsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBBY2Nlc3MgdGhlIHNpZ25hbCdzIGludGVybmFsIHN1YnNjcmliZXJzIGFuZCBub3RpZnkgdGhlbVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3Vic2NyaWJlcnMgPSAocGFyZW50U2lnbmFsIGFzIGFueSkuX3N1YnNjcmliZXJzXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoc3Vic2NyaWJlcnMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlcnMuZm9yRWFjaCgoZm46ICgpID0+IHZvaWQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Zm4oKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gc2lnbmFsIHN1YnNjcmliZXI6JywgZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBBbHNvIHRyaWdnZXIgY29tcG9uZW50IHJlZHJhd3MgaWYgY2FsbGJhY2sgaXMgc2V0XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBfX3JlZHJhd0NhbGxiYWNrIGlzIHNldCBvbiB0aGUgc2lnbmFsIGZ1bmN0aW9uIGl0c2VsZlxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKChzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDsoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjayhwYXJlbnRTaWduYWwpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdC8vIFJldHVybiByZW1vdmVkIGl0ZW1zICh1bndyYXBwZWQpXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlbW92ZWQubWFwKHNpZyA9PiBpc1NpZ25hbChzaWcpID8gc2lnLnZhbHVlIDogc2lnKVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdC8vIEZvciBvdGhlciBtdXRhdGluZyBtZXRob2RzLCBjb252ZXJ0IG5ldyBpdGVtcyB0byBzaWduYWxzIGZpcnN0XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHJlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdGlmIChwcm9wU3RyID09PSAncHVzaCcgfHwgcHJvcFN0ciA9PT0gJ3Vuc2hpZnQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBuZXdJdGVtcyA9IGFyZ3Ncblx0XHRcdFx0XHRcdFx0XHRcdC8vIENvbnZlcnQgbmV3IGl0ZW1zIC0gbmVzdGVkIGFycmF5cy9vYmplY3RzIGJlY29tZSBQcm94aWVzLCBwcmltaXRpdmVzIGJlY29tZSBTaWduYWxzXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBuZXdTaWduYWxzID0gbmV3SXRlbXMubWFwKGl0ZW0gPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmIGl0ZW0gIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBXcmFwIG9iamVjdHMvYXJyYXlzIGluIFByb3hpZXMgKE5PVCBpbiBTaWduYWxzIC0gdGhlIFByb3h5IElTIHRoZSB2YWx1ZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaW5pdGlhbGl6ZVNpZ25hbHMoaXRlbSwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB0b1NpZ25hbChpdGVtKVxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwcm9wU3RyID09PSAncHVzaCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gc2lnbmFscy5wdXNoKC4uLm5ld1NpZ25hbHMpXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLnVuc2hpZnQoLi4ubmV3U2lnbmFscylcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHByb3BTdHIgPT09ICdwb3AnIHx8IHByb3BTdHIgPT09ICdzaGlmdCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENhbGwgb24gc2lnbmFscyBhcnJheSBkaXJlY3RseSBhbmQgdW53cmFwIHJlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByb3BTdHIgPT09ICdwb3AnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHMucG9wKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gc2lnICE9PSB1bmRlZmluZWQgPyAoaXNTaWduYWwoc2lnKSA/IHNpZy52YWx1ZSA6IHNpZykgOiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHMuc2hpZnQoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWcgIT09IHVuZGVmaW5lZCA/IChpc1NpZ25hbChzaWcpID8gc2lnLnZhbHVlIDogc2lnKSA6IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFN0ciA9PT0gJ3JldmVyc2UnIHx8IHByb3BTdHIgPT09ICdzb3J0Jykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gRm9yIHJldmVyc2Uvc29ydCwgYXBwbHkgdG8gc2lnbmFscyBhcnJheVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByb3BTdHIgPT09ICdyZXZlcnNlJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLnJldmVyc2UoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gc29ydCBuZWVkcyBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdGhhdCB3b3JrcyBvbiBzaWduYWxzXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXBhcmF0b3IgPSBhcmdzWzBdXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChjb21wYXJhdG9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gc2lnbmFscy5zb3J0KChhLCBiKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhVmFsID0gaXNTaWduYWwoYSkgPyBhLnZhbHVlIDogYVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYlZhbCA9IGlzU2lnbmFsKGIpID8gYi52YWx1ZSA6IGJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBjb21wYXJhdG9yKGFWYWwsIGJWYWwpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFWYWwgPSBpc1NpZ25hbChhKSA/IGEudmFsdWUgOiBhXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBiVmFsID0gaXNTaWduYWwoYikgPyBiLnZhbHVlIDogYlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFWYWwgPCBiVmFsID8gLTEgOiBhVmFsID4gYlZhbCA/IDEgOiAwXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFN0ciA9PT0gJ2ZpbGwnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmaWxsVmFsdWUgPSBhcmdzWzBdXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdGFydCA9IGFyZ3NbMV0gPz8gMFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZW5kID0gYXJnc1syXSA/PyBzaWduYWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZmlsbFNpZ25hbCA9IHRvU2lnbmFsKGZpbGxWYWx1ZSlcblx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNpZ25hbHNbaV0gPSBmaWxsU2lnbmFsXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBGb3Igb3RoZXIgbWV0aG9kcywganVzdCBhcHBseSB0byB0YXJnZXRcblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHZhbHVlLmFwcGx5KHRhcmdldCwgYXJncylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBwYXJlbnQgc2lnbmFsIGlmIGl0IGV4aXN0cyAobG9vayB1cCBhZ2FpbiBpbiBjYXNlIGl0IHdhcyBzdG9yZWQpXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudFBhcmVudFNpZ25hbCA9IGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHRcdFx0XHRpZiAoY3VycmVudFBhcmVudFNpZ25hbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gTm90aWZ5IHN1YnNjcmliZXJzIGRpcmVjdGx5IHNpbmNlIHRoZSBhcnJheSByZWZlcmVuY2UgaGFzbid0IGNoYW5nZWRcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN1YnNjcmliZXJzID0gKGN1cnJlbnRQYXJlbnRTaWduYWwgYXMgYW55KS5fc3Vic2NyaWJlcnNcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChzdWJzY3JpYmVycykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFsc28gdHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBpZiBjYWxsYmFjayBpcyBzZXRcblx0XHRcdFx0XHRcdFx0XHRcdC8vIF9fcmVkcmF3Q2FsbGJhY2sgaXMgc2V0IG9uIHRoZSBzaWduYWwgZnVuY3Rpb24gaXRzZWxmXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoKHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0OyhzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKGN1cnJlbnRQYXJlbnRTaWduYWwpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuYmluZCh0YXJnZXQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcihwcm9wKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4ID0gTnVtYmVyKHByb3ApXG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHNpZ25hbHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHNbaW5kZXhdXG5cdFx0XHRcdFx0XHRcdGlmIChpc1NpZ25hbChzaWcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2lnLnZhbHVlID0gdmFsdWVcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRzaWduYWxzW2luZGV4XSA9IHRvU2lnbmFsKHZhbHVlKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIFRyaWdnZXIgcGFyZW50IHNpZ25hbCBvbiBlbGVtZW50IGFzc2lnbm1lbnQgKGxvb2sgdXAgd2hlbiBjYWxsZWQpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcmVudFNpZ25hbCA9IGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudFNpZ25hbCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIE5vdGlmeSBzdWJzY3JpYmVycyBkaXJlY3RseSBzaW5jZSB0aGUgYXJyYXkgcmVmZXJlbmNlIGhhc24ndCBjaGFuZ2VkXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3Vic2NyaWJlcnMgPSAocGFyZW50U2lnbmFsIGFzIGFueSkuX3N1YnNjcmliZXJzXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHN1YnNjcmliZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gc2lnbmFsIHN1YnNjcmliZXI6JywgZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQWxzbyB0cmlnZ2VyIGNvbXBvbmVudCByZWRyYXdzIGlmIGNhbGxiYWNrIGlzIHNldFxuXHRcdFx0XHRcdFx0XHRcdGlmICgoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdFx0OyhzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKHBhcmVudFNpZ25hbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcCA9PT0gJ2xlbmd0aCcpIHtcblx0XHRcdFx0XHRcdFx0c2lnbmFscy5sZW5ndGggPSBOdW1iZXIodmFsdWUpXG5cdFx0XHRcdFx0XHRcdC8vIFRyaWdnZXIgcGFyZW50IHNpZ25hbCBvbiBsZW5ndGggY2hhbmdlIChsb29rIHVwIHdoZW4gY2FsbGVkKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXJlbnRTaWduYWwgPSBhcnJheVBhcmVudFNpZ25hbE1hcC5nZXQod3JhcHBlZCkgfHwgKHdyYXBwZWQgYXMgYW55KS5fcGFyZW50U2lnbmFsXG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRTaWduYWwpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBOb3RpZnkgc3Vic2NyaWJlcnMgZGlyZWN0bHkgc2luY2UgdGhlIGFycmF5IHJlZmVyZW5jZSBoYXNuJ3QgY2hhbmdlZFxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN1YnNjcmliZXJzID0gKHBhcmVudFNpZ25hbCBhcyBhbnkpLl9zdWJzY3JpYmVyc1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzdWJzY3JpYmVycykge1xuXHRcdFx0XHRcdFx0XHRcdFx0c3Vic2NyaWJlcnMuZm9yRWFjaCgoZm46ICgpID0+IHZvaWQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHNpZ25hbCBzdWJzY3JpYmVyOicsIGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdC8vIEFsc28gdHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBpZiBjYWxsYmFjayBpcyBzZXRcblx0XHRcdFx0XHRcdFx0XHRpZiAoKHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRcdDsoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjayhwYXJlbnRTaWduYWwpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3AsIHZhbHVlKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvd25LZXlzKF90YXJnZXQpIHtcblx0XHRcdFx0XHQvLyBSZXR1cm4gYXJyYXkgaW5kaWNlcyBhcyBrZXlzIGZvciBwcm9wZXIgZW51bWVyYXRpb24gKG5lZWRlZCBmb3IgQnVuJ3MgdG9FcXVhbClcblx0XHRcdFx0XHRjb25zdCBrZXlzOiAoc3RyaW5nIHwgc3ltYm9sKVtdID0gW11cblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNpZ25hbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGtleXMucHVzaChTdHJpbmcoaSkpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGtleXMucHVzaCgnbGVuZ3RoJylcblx0XHRcdFx0XHRyZXR1cm4ga2V5c1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdFx0Ly8gUHJvdmlkZSBwcm9wZXJ0eSBkZXNjcmlwdG9ycyBmb3IgYXJyYXkgaW5kaWNlcyAobmVlZGVkIGZvciBCdW4ncyB0b0VxdWFsKVxuXHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcihwcm9wKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4ID0gTnVtYmVyKHByb3ApXG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHNpZ25hbHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWU6ICgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWxzW2luZGV4XVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWdcblx0XHRcdFx0XHRcdFx0XHR9KSgpLFxuXHRcdFx0XHRcdFx0XHRcdHdyaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChwcm9wID09PSAnbGVuZ3RoJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHZhbHVlOiBzaWduYWxzLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0d3JpdGFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdFx0c3RhdGVDYWNoZS5zZXQob2JqLCB3cmFwcGVkKVxuXHRcdFx0cmV0dXJuIHdyYXBwZWRcblx0XHR9XG5cblx0XHQvLyBIYW5kbGUgb2JqZWN0c1xuXHRcdC8vIFN0b3JlIG9yaWdpbmFsIGtleXMgZm9yIFNTUiBzZXJpYWxpemF0aW9uICh0byBkaXN0aW5ndWlzaCBuZXN0ZWQgc3RhdGUga2V5cyBmcm9tIHBhcmVudCBrZXlzKVxuXHRcdGNvbnN0IG9yaWdpbmFsS2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXMob2JqKSlcblx0XHQvLyBFYWNoIG5lc3RlZCBzdGF0ZSBnZXRzIGl0cyBvd24gc2lnbmFsTWFwICh1bmxlc3MgcGFyZW50U2lnbmFsTWFwIGlzIGV4cGxpY2l0bHkgcHJvdmlkZWQpXG5cdFx0Ly8gVGhpcyBwcmV2ZW50cyBuZXN0ZWQgc3RhdGVzIGZyb20gc2hhcmluZyB0aGUgcGFyZW50J3Mgc2lnbmFsTWFwXG5cdFx0Y29uc3QgbmVzdGVkU2lnbmFsTWFwID0gcGFyZW50U2lnbmFsTWFwIHx8IG5ldyBNYXA8c3RyaW5nLCBTaWduYWw8YW55PiB8IENvbXB1dGVkU2lnbmFsPGFueT4+KClcblx0XHRjb25zdCB3cmFwcGVkID0gbmV3IFByb3h5KG9iaiwge1xuXHRcdFx0Z2V0KHRhcmdldCwgcHJvcCkge1xuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ19fb3JpZ2luYWxLZXlzJykgcmV0dXJuIG9yaWdpbmFsS2V5c1xuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ19faXNTdGF0ZScpIHJldHVybiB0cnVlXG5cdFx0XHRcdC8vIENoZWNrIGlmIF9fc2lnbmFsTWFwIHdhcyBleHBsaWNpdGx5IHNldCB0byBudWxsIChmb3IgZXJyb3IgdGVzdGluZylcblx0XHRcdFx0Ly8gSWYgc28sIHJldHVybiBudWxsOyBvdGhlcndpc2UgcmV0dXJuIHRoZSBuZXN0ZWRTaWduYWxNYXBcblx0XHRcdFx0aWYgKHByb3AgPT09ICdfX3NpZ25hbE1hcCcpIHtcblx0XHRcdFx0XHRjb25zdCBleHBsaWNpdFZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCAnX19zaWduYWxNYXAnKVxuXHRcdFx0XHRcdHJldHVybiBleHBsaWNpdFZhbHVlICE9PSB1bmRlZmluZWQgPyBleHBsaWNpdFZhbHVlIDogbmVzdGVkU2lnbmFsTWFwXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGNvbnN0IHByb3BTdHIgPSBTdHJpbmcocHJvcClcblx0XHRcdFx0XG5cdFx0XHRcdC8vIENoZWNrIGZvciAkIHByZWZpeCBjb252ZW50aW9uIChkZWVwc2lnbmFsLXN0eWxlOiByZXR1cm5zIHJhdyBzaWduYWwpXG5cdFx0XHRcdGlmIChwcm9wU3RyLnN0YXJ0c1dpdGgoJyQnKSAmJiBwcm9wU3RyLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRjb25zdCBrZXkgPSBwcm9wU3RyLnNsaWNlKDEpIC8vIFJlbW92ZSAkIHByZWZpeFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIEVuc3VyZSBzaWduYWwgZXhpc3RzIC0gaW5pdGlhbGl6ZSBpZiBuZWVkZWRcblx0XHRcdFx0XHQvLyBVc2UgdGhlIHNhbWUgaW5pdGlhbGl6YXRpb24gbG9naWMgYXMgcmVndWxhciBwcm9wZXJ0eSBhY2Nlc3Ncblx0XHRcdFx0XHRpZiAoIW5lc3RlZFNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0Ly8gRmlyc3QgdHJ5IHRvIGdldCBmcm9tIHRhcmdldCAob3JpZ2luYWwgb2JqZWN0KVxuXHRcdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxWYWx1ZSA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5KVxuXHRcdFx0XHRcdFx0aWYgKG9yaWdpbmFsVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvcmlnaW5hbFZhbHVlLmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChpc0dldFNldERlc2NyaXB0b3Iob3JpZ2luYWxWYWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBHZXQvc2V0IGRlc2NyaXB0b3IgLT4gY29tcHV0ZWQgc2lnbmFsIGZyb20gZ2V0IGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnaW5hbFZhbHVlLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjb21wdXRlZCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvcmlnaW5hbFZhbHVlLmdldC5jYWxsKHdyYXBwZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIGNvbXB1dGVkU2lnKVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBPbmx5IHNldHRlciwgbm8gZ2V0dGVyIC0gdHJlYXQgYXMgcmVndWxhciBzaWduYWwgd2l0aCB1bmRlZmluZWQgaW5pdGlhbCB2YWx1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBvcmlnaW5hbFZhbHVlID09PSAnb2JqZWN0JyAmJiBvcmlnaW5hbFZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEdldCB0aGUgYWxyZWFkeS13cmFwcGVkIHN0YXRlIGZyb20gdGhlIHdyYXBwZWQgb2JqZWN0XG5cdFx0XHRcdFx0XHRcdC8vIERvbid0IGNhbGwgaW5pdGlhbGl6ZVNpZ25hbHMgYWdhaW4gYXMgaXQgd291bGQgY3JlYXRlIGEgbmV3IHdyYXBwZWQgYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRTdGF0ZSA9ICh3cmFwcGVkIGFzIGFueSlba2V5XVxuXHRcdFx0XHRcdFx0XHRcdGlmIChuZXN0ZWRTdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gRmFsbGJhY2s6IGluaXRpYWxpemUgaWYgbm90IGFscmVhZHkgd3JhcHBlZFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgaW5pdGlhbGl6ZWQgPSBpbml0aWFsaXplU2lnbmFscyhvcmlnaW5hbFZhbHVlLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwoaW5pdGlhbGl6ZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShpbml0aWFsaXplZCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KGluaXRpYWxpemVkLCBzaWcpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwobmVzdGVkU3RhdGUpXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBTdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBmb3IgYXJyYXlzXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShuZXN0ZWRTdGF0ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSB0b1NpZ25hbChvcmlnaW5hbFZhbHVlKVxuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIFByb3BlcnR5IGRvZXNuJ3QgZXhpc3QgLSByZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gUmV0dXJuIHJhdyBzaWduYWwgb2JqZWN0IChub3QgdGhlIHZhbHVlKVxuXHRcdFx0XHRcdHJldHVybiBuZXN0ZWRTaWduYWxNYXAuZ2V0KGtleSlcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3Qga2V5ID0gcHJvcFN0clxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgd2UgaGF2ZSBhIHNpZ25hbCBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdFx0XHRpZiAoIW5lc3RlZFNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdC8vIFRyeSB0byBnZXQgZnJvbSB0YXJnZXQgZmlyc3QgKG9yaWdpbmFsIG9iamVjdCBwcm9wZXJ0aWVzKVxuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsVmFsdWUgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3ApXG5cdFx0XHRcdFx0aWYgKG9yaWdpbmFsVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0Ly8gSW5pdGlhbGl6ZSBzaWduYWwgZm9yIHRoaXMgcHJvcGVydHlcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHQvLyBGdW5jdGlvbiBwcm9wZXJ0eSAtPiBjb21wdXRlZCBzaWduYWxcblx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjb21wdXRlZCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQ2FsbCB0aGUgZnVuY3Rpb24gaW4gdGhlIGNvbnRleHQgb2YgdGhlIHN0YXRlXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsVmFsdWUuY2FsbCh3cmFwcGVkKVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGlzR2V0U2V0RGVzY3JpcHRvcihvcmlnaW5hbFZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBHZXQvc2V0IGRlc2NyaXB0b3IgLT4gY29tcHV0ZWQgc2lnbmFsIGZyb20gZ2V0IGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZS5nZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvcmlnaW5hbFZhbHVlLmdldC5jYWxsKHdyYXBwZWQpXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT25seSBzZXR0ZXIsIG5vIGdldHRlciAtIHRyZWF0IGFzIHJlZ3VsYXIgc2lnbmFsIHdpdGggdW5kZWZpbmVkIGluaXRpYWwgdmFsdWVcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwodW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdvYmplY3QnICYmIG9yaWdpbmFsVmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gTmVzdGVkIG9iamVjdCAtPiByZWN1cnNpdmUgc3RhdGUgd2l0aCBpdHMgb3duIHNpZ25hbE1hcFxuXHRcdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRTdGF0ZSA9IGluaXRpYWxpemVTaWduYWxzKG9yaWdpbmFsVmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKG5lc3RlZFN0YXRlKVxuXHRcdFx0XHRcdFx0XHQvLyBTdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBmb3IgYXJyYXlzXG5cdFx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChuZXN0ZWRTdGF0ZSwgc2lnKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBQcmltaXRpdmUgdmFsdWUgLT4gc2lnbmFsXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHRvU2lnbmFsKG9yaWdpbmFsVmFsdWUpXG5cdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIFByb3BlcnR5IGRvZXNuJ3QgZXhpc3QgaW4gb3JpZ2luYWwgb2JqZWN0XG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgY29tcHV0ZWQgcHJvcGVydHkgdGhhdCB3YXMgYWRkZWQgZHluYW1pY2FsbHlcblx0XHRcdFx0XHRcdC8vIEZvciBub3csIHJldHVybiB1bmRlZmluZWRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBzaWcgPSBuZXN0ZWRTaWduYWxNYXAuZ2V0KGtleSlcblx0XHRcdFx0aWYgKHNpZykge1xuXHRcdFx0XHRcdC8vIEFjY2VzcyBzaWduYWwudmFsdWUgdG8gdHJhY2sgY29tcG9uZW50IGRlcGVuZGVuY3lcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IHNpZy52YWx1ZVxuXHRcdFx0XHRcdC8vIEFsd2F5cyBlbnN1cmUgcGFyZW50IHNpZ25hbCBpcyBzdG9yZWQgZm9yIGFycmF5cyAoaW4gY2FzZSBpdCB3YXNuJ3Qgc3RvcmVkIGR1cmluZyBpbml0aWFsaXphdGlvbilcblx0XHRcdFx0XHQvLyBDaGVjayBmb3Igd3JhcHBlZCBhcnJheXMgYnkgbG9va2luZyBmb3IgX19pc1N0YXRlIGFuZCBfX3NpZ25hbHMgcHJvcGVydGllc1xuXHRcdFx0XHRcdC8vIEFycmF5LmlzQXJyYXkoKSBtYXkgcmV0dXJuIGZhbHNlIGZvciBQcm94aWVzLCBzbyB3ZSBjaGVjayBfX2lzU3RhdGUgaW5zdGVhZFxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0XHRpZiAoKHZhbHVlIGFzIGFueSkuX19pc1N0YXRlID09PSB0cnVlICYmIEFycmF5LmlzQXJyYXkoKHZhbHVlIGFzIGFueSkuX19zaWduYWxzKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBUaGlzIGlzIGEgd3JhcHBlZCBhcnJheSAtIHN0b3JlIHBhcmVudCBzaWduYWxcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KHZhbHVlLCBzaWcgYXMgU2lnbmFsPGFueT4pXG5cdFx0XHRcdFx0XHRcdC8vIEFsc28gc3RvcmUgZGlyZWN0bHkgb24gdGhlIFByb3h5IGFzIGEgZmFsbGJhY2tcblx0XHRcdFx0XHRcdFx0Oyh2YWx1ZSBhcyBhbnkpLl9wYXJlbnRTaWduYWwgPSBzaWcgYXMgU2lnbmFsPGFueT5cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gUmVndWxhciBhcnJheSAoc2hvdWxkbid0IGhhcHBlbiBidXQganVzdCBpbiBjYXNlKVxuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQodmFsdWUsIHNpZyBhcyBTaWduYWw8YW55Pilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBGYWxsYmFjayB0byBvcmlnaW5hbCBwcm9wZXJ0eVxuXHRcdFx0XHRyZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wKVxuXHRcdFx0fSxcblx0XHRcdHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG5cdFx0XHRcdGNvbnN0IGtleSA9IFN0cmluZyhwcm9wKVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQWxsb3cgc2V0dGluZyBfX3NpZ25hbE1hcCB0byBudWxsIGZvciB0ZXN0aW5nIGVycm9yIGNhc2VzXG5cdFx0XHRcdC8vIEJ1dCB3ZSdsbCBjaGVjayBpZiBpdCdzIGFjdHVhbGx5IGEgTWFwIHdoZW4gc2VyaWFsaXppbmcvZGVzZXJpYWxpemluZ1xuXHRcdFx0XHRpZiAoa2V5ID09PSAnX19zaWduYWxNYXAnKSB7XG5cdFx0XHRcdFx0Ly8gU3RvcmUgdGhlIHZhbHVlIGRpcmVjdGx5IG9uIHRoZSB0YXJnZXQgKGJ5cGFzcyBwcm94eSlcblx0XHRcdFx0XHQvLyBUaGlzIGFsbG93cyB0ZXN0cyB0byBjb3JydXB0IHRoZSBzdGF0ZSBmb3IgZXJyb3IgaGFuZGxpbmcgdGVzdHNcblx0XHRcdFx0XHRSZWZsZWN0LnNldCh0YXJnZXQsIHByb3AsIHZhbHVlKVxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIFByZXZlbnQgc2V0dGluZyBvdGhlciBpbnRlcm5hbCBwcm9wZXJ0aWVzXG5cdFx0XHRcdGlmIChrZXkgPT09ICdfX2lzU3RhdGUnIHx8IGtleSA9PT0gJ19fb3JpZ2luYWxLZXlzJyB8fCBrZXkgPT09ICdfX3NpZ25hbHMnKSB7XG5cdFx0XHRcdFx0Ly8gU2lsZW50bHkgaWdub3JlIGF0dGVtcHRzIHRvIHNldCBpbnRlcm5hbCBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIG9yaWdpbmFsIHByb3BlcnR5IHdhcyBhIGdldC9zZXQgZGVzY3JpcHRvclxuXHRcdFx0XHRjb25zdCBvcmlnaW5hbFZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wKVxuXHRcdFx0XHRpZiAoaXNHZXRTZXREZXNjcmlwdG9yKG9yaWdpbmFsVmFsdWUpKSB7XG5cdFx0XHRcdFx0Ly8gSGFuZGxlIGdldC9zZXQgZGVzY3JpcHRvclxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZS5zZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdC8vIENhbGwgdGhlIHNldHRlciBmdW5jdGlvblxuXHRcdFx0XHRcdFx0b3JpZ2luYWxWYWx1ZS5zZXQuY2FsbCh3cmFwcGVkLCB2YWx1ZSlcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZS5nZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdC8vIFJlYWQtb25seSBwcm9wZXJ0eSAoZ2V0IGJ1dCBubyBzZXQpXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBzZXQgcmVhZC1vbmx5IGNvbXB1dGVkIHByb3BlcnR5IFwiJHtrZXl9XCJgKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIG5ldyB2YWx1ZSBiZWluZyBzZXQgaXMgYSBnZXQvc2V0IGRlc2NyaXB0b3Jcblx0XHRcdFx0aWYgKGlzR2V0U2V0RGVzY3JpcHRvcih2YWx1ZSkpIHtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHdpdGggY29tcHV0ZWQgc2lnbmFsIGZyb20gZ2V0IGZ1bmN0aW9uXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZS5nZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY29tcHV0ZWQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuZ2V0LmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHQvLyBBbHNvIHVwZGF0ZSB0aGUgdGFyZ2V0IHNvIHNldHRlciBjYW4gYmUgZm91bmQgbGF0ZXJcblx0XHRcdFx0XHRcdFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBPbmx5IHNldHRlciwgbm8gZ2V0dGVyIC0gdHJlYXQgYXMgcmVndWxhciBzaWduYWwgd2l0aCB1bmRlZmluZWQgaW5pdGlhbCB2YWx1ZVxuXHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRSZWZsZWN0LnNldCh0YXJnZXQsIHByb3AsIHZhbHVlKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIFNraXAgY29tcHV0ZWQgcHJvcGVydGllcyAoZnVuY3Rpb25zKVxuXHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Ly8gUmVwbGFjZSBjb21wdXRlZCBzaWduYWxcblx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZS5jYWxsKHdyYXBwZWQpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFVwZGF0ZSBvciBjcmVhdGUgc2lnbmFsXG5cdFx0XHRcdGlmIChuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkpIHtcblx0XHRcdFx0XHRjb25zdCBzaWcgPSBuZXN0ZWRTaWduYWxNYXAuZ2V0KGtleSlcblx0XHRcdFx0XHRpZiAoc2lnICYmICEoc2lnIGluc3RhbmNlb2YgQ29tcHV0ZWRTaWduYWwpKSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHQvLyBOZXN0ZWQgb2JqZWN0IC0+IHJlY3Vyc2l2ZSBzdGF0ZSB3aXRoIGl0cyBvd24gc2lnbmFsTWFwXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gaW5pdGlhbGl6ZVNpZ25hbHModmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0Ly8gU3RvcmUgcGFyZW50IHNpZ25hbCByZWZlcmVuY2UgZm9yIGFycmF5c1xuXHRcdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShuZXN0ZWRTdGF0ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZyBhcyBTaWduYWw8YW55Pilcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQ7KHNpZyBhcyBTaWduYWw8YW55PikudmFsdWUgPSBuZXN0ZWRTdGF0ZVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0OyhzaWcgYXMgU2lnbmFsPGFueT4pLnZhbHVlID0gdmFsdWVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gUmVwbGFjZSBjb21wdXRlZCB3aXRoIHJlZ3VsYXIgc2lnbmFsXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiBBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRTdGF0ZSA9IGluaXRpYWxpemVTaWduYWxzKHZhbHVlLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgdG9TaWduYWwodmFsdWUpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBDcmVhdGUgbmV3IHNpZ25hbFxuXHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRTdGF0ZSA9IGluaXRpYWxpemVTaWduYWxzKHZhbHVlLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwobmVzdGVkU3RhdGUpXG5cdFx0XHRcdFx0XHQvLyBTdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBmb3IgYXJyYXlzXG5cdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShuZXN0ZWRTdGF0ZSkpIHtcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgdG9TaWduYWwodmFsdWUpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0aGFzKHRhcmdldCwgcHJvcCkge1xuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ19faXNTdGF0ZScgfHwgcHJvcCA9PT0gJ19fc2lnbmFsTWFwJykgcmV0dXJuIHRydWVcblx0XHRcdFx0Y29uc3QgcHJvcFN0ciA9IFN0cmluZyhwcm9wKVxuXHRcdFx0XHQvLyBDaGVjayBmb3IgJCBwcmVmaXhcblx0XHRcdFx0aWYgKHByb3BTdHIuc3RhcnRzV2l0aCgnJCcpICYmIHByb3BTdHIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGNvbnN0IGtleSA9IHByb3BTdHIuc2xpY2UoMSlcblx0XHRcdFx0XHRyZXR1cm4gbmVzdGVkU2lnbmFsTWFwLmhhcyhrZXkpIHx8IFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBuZXN0ZWRTaWduYWxNYXAuaGFzKHByb3BTdHIpIHx8IFJlZmxlY3QuaGFzKHRhcmdldCwgcHJvcClcblx0XHRcdH0sXG5cdFx0XHRvd25LZXlzKHRhcmdldCkge1xuXHRcdFx0XHRjb25zdCBrZXlzID0gbmV3IFNldChSZWZsZWN0Lm93bktleXModGFyZ2V0KSlcblx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLmZvckVhY2goKF8sIGtleSkgPT4ge1xuXHRcdFx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdFx0XHRrZXlzLmFkZCgnJCcgKyBrZXkpIC8vIEFsc28gaW5jbHVkZSAkIHByZWZpeCBrZXlzXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVybiBBcnJheS5mcm9tKGtleXMpXG5cdFx0XHR9LFxuXHRcdFx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcCkge1xuXHRcdFx0XHRjb25zdCBwcm9wU3RyID0gU3RyaW5nKHByb3ApXG5cdFx0XHRcdC8vIEhhbmRsZSAkIHByZWZpeFxuXHRcdFx0XHRpZiAocHJvcFN0ci5zdGFydHNXaXRoKCckJykgJiYgcHJvcFN0ci5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0Y29uc3Qga2V5ID0gcHJvcFN0ci5zbGljZSgxKVxuXHRcdFx0XHRcdGlmIChuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChuZXN0ZWRTaWduYWxNYXAuaGFzKHByb3BTdHIpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApXG5cdFx0XHR9LFxuXHRcdFx0ZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdGNvbnN0IGtleSA9IFN0cmluZyhwcm9wKVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBzaWduYWwgdG8gdW5kZWZpbmVkIHRvIG5vdGlmeSBzdWJzY3JpYmVyc1xuXHRcdFx0XHRpZiAobmVzdGVkU2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2lnID0gbmVzdGVkU2lnbmFsTWFwLmdldChrZXkpXG5cdFx0XHRcdFx0aWYgKHNpZyAmJiAhKHNpZyBpbnN0YW5jZW9mIENvbXB1dGVkU2lnbmFsKSkge1xuXHRcdFx0XHRcdFx0Ly8gU2V0IHNpZ25hbCB2YWx1ZSB0byB1bmRlZmluZWQgdG8gbm90aWZ5IHN1YnNjcmliZXJzXG5cdFx0XHRcdFx0XHQ7KHNpZyBhcyBTaWduYWw8YW55PikudmFsdWUgPSB1bmRlZmluZWRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gUmVtb3ZlIGZyb20gdGhlIHNpZ25hbCBtYXBcblx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuZGVsZXRlKGtleSlcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gRGVsZXRlIGZyb20gdGFyZ2V0XG5cdFx0XHRcdHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcClcblx0XHRcdH0sXG5cdFx0fSlcblxuXHRcdHN0YXRlQ2FjaGUuc2V0KG9iaiwgd3JhcHBlZClcblx0XHRyZXR1cm4gd3JhcHBlZFxuXHR9XG5cblx0Y29uc3Qgd3JhcHBlZCA9IGluaXRpYWxpemVTaWduYWxzKGluaXRpYWwpIGFzIFN0YXRlPFQ+XG5cdFxuXHQvLyBQcmUtaW5pdGlhbGl6ZSBhbGwgc2lnbmFscyBmcm9tIHRoZSBpbml0aWFsIG9iamVjdCBzbyB0aGV5J3JlIGF2YWlsYWJsZSBpbW1lZGlhdGVseVxuXHQvLyBUaGlzIGVuc3VyZXMgJHMuJHByb3BlcnR5IHdvcmtzIGV2ZW4gaWYgJHMucHJvcGVydHkgaGFzbid0IGJlZW4gYWNjZXNzZWQgeWV0XG5cdGlmICh0eXBlb2YgaW5pdGlhbCA9PT0gJ29iamVjdCcgJiYgaW5pdGlhbCAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShpbml0aWFsKSkge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGluaXRpYWwpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaW5pdGlhbCwga2V5KSkge1xuXHRcdFx0XHRpZiAoIXNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gaW5pdGlhbFtrZXldXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjb21wdXRlZCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZS5jYWxsKHdyYXBwZWQpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0c2lnbmFsTWFwLnNldChrZXksIGNvbXB1dGVkU2lnKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNHZXRTZXREZXNjcmlwdG9yKHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0Ly8gR2V0L3NldCBkZXNjcmlwdG9yIC0+IGNvbXB1dGVkIHNpZ25hbCBmcm9tIGdldCBmdW5jdGlvblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZS5nZXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjb21wdXRlZCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLmdldC5jYWxsKHdyYXBwZWQpXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIE9ubHkgc2V0dGVyLCBubyBnZXR0ZXIgLSB0cmVhdCBhcyByZWd1bGFyIHNpZ25hbCB3aXRoIHVuZGVmaW5lZCBpbml0aWFsIHZhbHVlXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbCh1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQgdGhlIGFscmVhZHktd3JhcHBlZCBzdGF0ZSBmcm9tIHN0YXRlQ2FjaGUgKGJ5cGFzcyBQcm94eSB0byBnZXQgdGhlIGFjdHVhbCB3cmFwcGVkIHZhbHVlKVxuXHRcdFx0XHRcdFx0Ly8gVGhpcyBlbnN1cmVzIHdlIGdldCB0aGUgc2FtZSB3cmFwcGVkIGFycmF5IHRoYXQgd2FzIGNyZWF0ZWQgZHVyaW5nIGluaXRpYWxpemVTaWduYWxzXG5cdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRTdGF0ZSA9IHN0YXRlQ2FjaGUuaGFzKHZhbHVlKSA/IHN0YXRlQ2FjaGUuZ2V0KHZhbHVlKSA6IGluaXRpYWxpemVTaWduYWxzKHZhbHVlLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwobmVzdGVkU3RhdGUpXG5cdFx0XHRcdFx0XHQvLyBBbHdheXMgc3RvcmUgcGFyZW50IHNpZ25hbCByZWZlcmVuY2UgZm9yIGFycmF5c1xuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgZm9yIHdyYXBwZWQgYXJyYXlzIGJ5IGxvb2tpbmcgZm9yIF9faXNTdGF0ZSBhbmQgX19zaWduYWxzIHByb3BlcnRpZXNcblx0XHRcdFx0XHRcdC8vIEFycmF5LmlzQXJyYXkoKSBtYXkgcmV0dXJuIGZhbHNlIGZvciBQcm94aWVzLCBzbyB3ZSBjaGVjayBfX2lzU3RhdGUgaW5zdGVhZFxuXHRcdFx0XHRcdFx0aWYgKG5lc3RlZFN0YXRlICYmIHR5cGVvZiBuZXN0ZWRTdGF0ZSA9PT0gJ29iamVjdCcgJiYgXG5cdFx0XHRcdFx0XHRcdCgobmVzdGVkU3RhdGUgYXMgYW55KS5fX2lzU3RhdGUgPT09IHRydWUgJiYgQXJyYXkuaXNBcnJheSgobmVzdGVkU3RhdGUgYXMgYW55KS5fX3NpZ25hbHMpKSkge1xuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdFx0Ly8gQWxzbyBzdG9yZSBkaXJlY3RseSBvbiB0aGUgUHJveHkgYXMgYSBmYWxsYmFja1xuXHRcdFx0XHRcdFx0XHQ7KG5lc3RlZFN0YXRlIGFzIGFueSkuX3BhcmVudFNpZ25hbCA9IHNpZ1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBGYWxsYmFjayBmb3IgcmVndWxhciBhcnJheXMgKHNob3VsZG4ndCBoYXBwZW4gYnV0IGp1c3QgaW4gY2FzZSlcblx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzaWduYWxNYXAuc2V0KGtleSwgc2lnKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzaWcgPSB0b1NpZ25hbCh2YWx1ZSlcblx0XHRcdFx0XHRcdHNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHQvLyBSZWdpc3RlciBzdGF0ZSBmb3IgU1NSIHNlcmlhbGl6YXRpb25cblx0Ly8gU3RvcmUgb3JpZ2luYWwgaW5pdGlhbCBzdGF0ZSAod2l0aCBjb21wdXRlZCBwcm9wZXJ0aWVzKSBmb3IgcmVzdG9yYXRpb24gYWZ0ZXIgZGVzZXJpYWxpemF0aW9uXG5cdHJlZ2lzdGVyU3RhdGUobmFtZSwgd3JhcHBlZCwgaW5pdGlhbClcblx0XG5cdHJldHVybiB3cmFwcGVkXG59XG5cbi8qKlxuICogU3RhdGUgdHlwZSAtIHJlYWN0aXZlIG9iamVjdCB3aXRoIHNpZ25hbC1iYXNlZCBwcm9wZXJ0aWVzXG4gKiBcbiAqIFN1cHBvcnRzOlxuICogLSBSZWd1bGFyIGFjY2VzczogYHN0YXRlLnByb3BgIHJldHVybnMgdW53cmFwcGVkIHZhbHVlXG4gKiAtIFNpZ25hbCBhY2Nlc3M6IGBzdGF0ZS4kcHJvcGAgcmV0dXJucyBTaWduYWwgaW5zdGFuY2UgKGhhbmRsZWQgYXQgcnVudGltZSlcbiAqIC0gRnVuY3Rpb25zIGJlY29tZSBjb21wdXRlZCBzaWduYWxzXG4gKiAtIE5lc3RlZCBvYmplY3RzIGJlY29tZSBTdGF0ZSBpbnN0YW5jZXNcbiAqIFxuICogTm90ZTogVGhlICQgcHJlZml4IGFjY2VzcyBpcyBoYW5kbGVkIHZpYSBQcm94eSBhdCBydW50aW1lLlxuICogVHlwZVNjcmlwdCdzIHR5cGUgc3lzdGVtIGNhbm5vdCBmdWxseSBleHByZXNzIHRoZSAkIHByZWZpeCBwYXR0ZXJuLFxuICogYnV0IHRoZSBpbXBsZW1lbnRhdGlvbiBjb3JyZWN0bHkgaGFuZGxlcyBpdC5cbiAqL1xuZXhwb3J0IHR5cGUgU3RhdGU8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4+ID0ge1xuXHRbSyBpbiBrZXlvZiBUXTogVFtLXSBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gaW5mZXIgUlxuXHRcdD8gUiAvLyBGdW5jdGlvbiBwcm9wZXJ0aWVzIHJldHVybiBjb21wdXRlZCB2YWx1ZVxuXHRcdDogVFtLXSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT5cblx0XHRcdD8gU3RhdGU8VFtLXT4gLy8gTmVzdGVkIG9iamVjdHMgYmVjb21lIHN0YXRlc1xuXHRcdFx0OiBUW0tdIC8vIFByaW1pdGl2ZSB2YWx1ZXNcbn0gJiB7XG5cdC8vIEluZGV4IHNpZ25hdHVyZSBmb3IgJCBwcmVmaXggYWNjZXNzIChydW50aW1lIG9ubHksIG5vdCBmdWxseSB0eXBlZClcblx0W2tleTogc3RyaW5nXTogYW55XG59XG5cbi8qKlxuICogV2F0Y2ggYSBzaWduYWwgZm9yIGNoYW5nZXNcbiAqIEBwYXJhbSBzaWduYWwgLSBUaGUgc2lnbmFsIHRvIHdhdGNoXG4gKiBAcGFyYW0gY2FsbGJhY2sgLSBDYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2hlbiBzaWduYWwgdmFsdWUgY2hhbmdlc1xuICogQHJldHVybnMgVW5zdWJzY3JpYmUgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhdGNoPFQ+KFxuXHRzaWduYWw6IFNpZ25hbDxUPiB8IENvbXB1dGVkU2lnbmFsPFQ+LFxuXHRjYWxsYmFjazogKG5ld1ZhbHVlOiBULCBvbGRWYWx1ZTogVCkgPT4gdm9pZCxcbik6ICgpID0+IHZvaWQge1xuXHRjb25zdCB1bndhdGNoID0gc2lnbmFsLndhdGNoKGNhbGxiYWNrKVxuXHRcblx0Ly8gUmVnaXN0ZXIgd2F0Y2hlciBpbiBTU1IgY29udGV4dCBmb3IgY2xlYW51cCBhdCBlbmQgb2YgcmVxdWVzdFxuXHRpZiAoZ2xvYmFsVGhpcy5fX1NTUl9NT0RFX18pIHtcblx0XHRjb25zdCBjb250ZXh0ID0gZ2V0U1NSQ29udGV4dCgpXG5cdFx0aWYgKGNvbnRleHQpIHtcblx0XHRcdGlmICghY29udGV4dC53YXRjaGVycykge1xuXHRcdFx0XHRjb250ZXh0LndhdGNoZXJzID0gW11cblx0XHRcdH1cblx0XHRcdGNvbnRleHQud2F0Y2hlcnMucHVzaCh1bndhdGNoKVxuXHRcdFx0Ly8gRHVyaW5nIFNTUiwgZmlyZSB3YXRjaGVyIGltbWVkaWF0ZWx5IHdpdGggY3VycmVudCB2YWx1ZSB0byBjYXRjaCBhbnkgY2hhbmdlc1xuXHRcdFx0Ly8gdGhhdCBoYXBwZW5lZCBiZWZvcmUgd2F0Y2hlciByZWdpc3RyYXRpb24gKGUuZy4sIGZyb20gcmVzdG9yZV9maWx0ZXJzX3NvcnQpXG5cdFx0XHQvLyBVc2UgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigpIHRvIGRlZmVyIGV4ZWN1dGlvbiB1bnRpbCBhZnRlciB1bndhdGNoIGlzIHJldHVybmVkLFxuXHRcdFx0Ly8gc28gY2FsbGJhY2tzIHRoYXQgcmVmZXJlbmNlIHVud2F0Y2ggd29uJ3QgY2F1c2UgUmVmZXJlbmNlRXJyb3Jcblx0XHRcdFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHNpZ25hbC5wZWVrKClcblx0XHRcdFx0XHRjYWxsYmFjayhjdXJyZW50VmFsdWUsIGN1cnJlbnRWYWx1ZSlcblx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgZmlyaW5nIGluaXRpYWwgd2F0Y2hlciBjYWxsYmFjazonLCBlKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXHRcblx0cmV0dXJuIHVud2F0Y2hcbn1cbiIsCiAgICAiaW1wb3J0IHtzdGF0ZSwgU3RhdGUsIHVwZGF0ZVN0YXRlUmVnaXN0cnl9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQge3NlcmlhbGl6ZVN0b3JlLCBkZXNlcmlhbGl6ZVN0b3JlfSBmcm9tICcuL3JlbmRlci9zc3JTdGF0ZSdcbmltcG9ydCB7Q29tcHV0ZWRTaWduYWx9IGZyb20gJy4vc2lnbmFsJ1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gcmVzdG9yZSBjb21wdXRlZCBwcm9wZXJ0aWVzIChzYW1lIGFzIGluIHNzclN0YXRlLnRzKVxuZnVuY3Rpb24gcmVzdG9yZUNvbXB1dGVkUHJvcGVydGllcyhzdGF0ZTogU3RhdGU8YW55PiwgaW5pdGlhbDogYW55KTogdm9pZCB7XG5cdGlmICghaW5pdGlhbCB8fCB0eXBlb2YgaW5pdGlhbCAhPT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm5cblx0fVxuXHRcblx0ZnVuY3Rpb24gaXNfb2JqZWN0KHY6IGFueSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2KVxuXHR9XG5cdFxuXHRmdW5jdGlvbiByZXN0b3JlKG9iajogYW55LCB0YXJnZXQ6IGFueSwgcHJlZml4OiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuXHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvYmpba2V5XVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdC8vIFNldCBmdW5jdGlvbiBwcm9wZXJ0eSAtIHN0YXRlIHByb3h5IHdpbGwgY29udmVydCB0byBDb21wdXRlZFNpZ25hbFxuXHRcdFx0XHRcdGNvbnN0IGtleXMgPSBwcmVmaXggPyBwcmVmaXguc3BsaXQoJy4nKS5maWx0ZXIoayA9PiBrKSA6IFtdXG5cdFx0XHRcdFx0bGV0IHRhcmdldFN0YXRlID0gdGFyZ2V0XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXRhcmdldFN0YXRlIHx8ICF0YXJnZXRTdGF0ZVtrZXlzW2ldXSkge1xuXHRcdFx0XHRcdFx0XHQvLyBOZXN0ZWQgc3RhdGUgZG9lc24ndCBleGlzdCB5ZXQsIHNraXBcblx0XHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0YXJnZXRTdGF0ZSA9IHRhcmdldFN0YXRlW2tleXNbaV1dXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0YXJnZXRTdGF0ZSkge1xuXHRcdFx0XHRcdFx0Ly8gQ2xlYXIgYW55IGV4aXN0aW5nIHNpZ25hbCBpbiBzaWduYWxNYXAgc28gZnVuY3Rpb24gaXMgcmUtaW5pdGlhbGl6ZWQgYXMgQ29tcHV0ZWRTaWduYWxcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdGFyZ2V0U3RhdGUgPT09ICdvYmplY3QnICYmICh0YXJnZXRTdGF0ZSBhcyBhbnkpLl9faXNTdGF0ZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWduYWxNYXAgPSAodGFyZ2V0U3RhdGUgYXMgYW55KS5fX3NpZ25hbE1hcFxuXHRcdFx0XHRcdFx0XHRpZiAoc2lnbmFsTWFwICYmIHNpZ25hbE1hcCBpbnN0YW5jZW9mIE1hcCkge1xuXHRcdFx0XHRcdFx0XHRcdHNpZ25hbE1hcC5kZWxldGUoa2V5KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0YXJnZXRTdGF0ZVtrZXldID0gdmFsdWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNfb2JqZWN0KHZhbHVlKSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2l2ZWx5IHJlc3RvcmUgbmVzdGVkIGNvbXB1dGVkIHByb3BlcnRpZXNcblx0XHRcdFx0XHRjb25zdCBuZXN0ZWRQcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LiR7a2V5fWAgOiBrZXlcblx0XHRcdFx0XHRyZXN0b3JlKHZhbHVlLCB0YXJnZXQsIG5lc3RlZFByZWZpeClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0cmVzdG9yZShpbml0aWFsLCBzdGF0ZSlcbn1cblxuLy8gVXRpbGl0eSBmdW5jdGlvbnMgZm9yIFN0b3JlIGNsYXNzXG5mdW5jdGlvbiBpc1N0YXRlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgKHZhbHVlIGFzIGFueSkuX19pc1N0YXRlID09PSB0cnVlXG59XG5cbmZ1bmN0aW9uIGlzX29iamVjdCh2OiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHYpXG59XG5cbmZ1bmN0aW9uIGNvcHlfb2JqZWN0PFQ+KG9iajogVCk6IFQge1xuXHRyZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxufVxuXG4vKipcbiAqIERlZXAgY29weSBvYmplY3Qgd2hpbGUgcHJlc2VydmluZyBmdW5jdGlvbnMgKGNvbXB1dGVkIHByb3BlcnRpZXMpXG4gKiBVc2VkIGZvciBtZXJnaW5nIHRlbXBsYXRlcyB0aGF0IG1heSBjb250YWluIGNvbXB1dGVkIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gY29weV9vYmplY3RfcHJlc2VydmVfZnVuY3Rpb25zPFQ+KG9iajogVCk6IFQge1xuXHRpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIG9ialxuXHR9XG5cdFxuXHRpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG5cdFx0cmV0dXJuIG9iai5tYXAoaXRlbSA9PiBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMoaXRlbSkpIGFzIFRcblx0fVxuXHRcblx0aWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gb2JqIGFzIFRcblx0fVxuXHRcblx0Y29uc3QgcmVzdWx0OiBhbnkgPSB7fVxuXHRmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcblx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSAob2JqIGFzIGFueSlba2V5XVxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHQvLyBQcmVzZXJ2ZSBmdW5jdGlvbnMgKGNvbXB1dGVkIHByb3BlcnRpZXMpXG5cdFx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERlZXAgY29weSBvdGhlciB2YWx1ZXNcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnModmFsdWUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQgYXMgVFxufVxuXG5mdW5jdGlvbiBtZXJnZV9kZWVwKHRhcmdldDogYW55LCAuLi5zb3VyY2VzOiBhbnlbXSk6IGFueSB7XG5cdGlmICghc291cmNlcy5sZW5ndGgpIHJldHVybiB0YXJnZXRcblx0Y29uc3Qgc291cmNlID0gc291cmNlcy5zaGlmdCgpXG5cblx0aWYgKGlzX29iamVjdCh0YXJnZXQpICYmIGlzX29iamVjdChzb3VyY2UpKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShzb3VyY2Vba2V5XSkgJiYgQXJyYXkuaXNBcnJheSh0YXJnZXRba2V5XSkpIHtcblx0XHRcdFx0Ly8gU3BsaWNlIHRoZSBjb250ZW50cyBvZiBzb3VyY2Vba2V5XSBpbnRvIHRhcmdldFtrZXldXG5cdFx0XHRcdHRhcmdldFtrZXldLnNwbGljZSgwLCB0YXJnZXRba2V5XS5sZW5ndGgsIC4uLnNvdXJjZVtrZXldKVxuXHRcdFx0fSBlbHNlIGlmIChpc19vYmplY3Qoc291cmNlW2tleV0pKSB7XG5cdFx0XHRcdGlmICghdGFyZ2V0W2tleV0pIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7W2tleV06IHt9fSlcblx0XHRcdFx0bWVyZ2VfZGVlcCh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRPYmplY3QuYXNzaWduKHRhcmdldCwge1trZXldOiBzb3VyY2Vba2V5XX0pXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG1lcmdlX2RlZXAodGFyZ2V0LCAuLi5zb3VyY2VzKVxufVxuXG5jb25zdCBERUZBVUxUX0xPT0tVUF9WRVJJRllfSU5URVJWQUwgPSAxMDAwICogMTAgLy8gMTAgc2Vjb25kc1xuY29uc3QgREVGQVVMVF9MT09LVVBfVFRMID0gMTAwMCAqIDYwICogNjAgKiAyNCAvLyAxIGRheVxuXG4vLyBDb3VudGVyIGZvciBnZW5lcmF0aW5nIHVuaXF1ZSBzdG9yZSBpbnN0YW5jZSBuYW1lc1xubGV0IHN0b3JlSW5zdGFuY2VDb3VudGVyID0gMFxuXG4vKipcbiAqIFN0b3JlIGNsYXNzIC0gd3JhcHMgc3RhdGUoKSB3aXRoIHBlcnNpc3RlbmNlIGZ1bmN0aW9uYWxpdHlcbiAqIFByb3ZpZGVzIGxvYWQvc2F2ZS9ibHVlcHJpbnQgbWV0aG9kcyBmb3IgbG9jYWxTdG9yYWdlL3Nlc3Npb25TdG9yYWdlIHBlcnNpc3RlbmNlXG4gKiBcbiAqIFN0YXRlIHR5cGVzOlxuICogLSBzYXZlZDogbG9jYWxTdG9yYWdlIChzdXJ2aXZlcyBicm93c2VyIHJlc3RhcnRzKVxuICogLSB0ZW1wb3Jhcnk6IG5vdCBwZXJzaXN0ZWQgKHJlc2V0cyBvbiByZWxvYWQpXG4gKiAtIHRhYjogc2Vzc2lvblN0b3JhZ2UgKHN1cnZpdmVzIHBhZ2UgcmVsb2FkcywgY2xlYXJzIHdoZW4gdGFiIGNsb3NlcylcbiAqIC0gc2Vzc2lvbjogc2VydmVyLXNpZGUgc2Vzc2lvbiBzdG9yYWdlIChyZXF1aXJlcyBiYWNrZW5kLCBoeWRyYXRlZCB2aWEgU1NSKVxuICovXG5leHBvcnQgY2xhc3MgU3RvcmU8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gPSBSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG5cdHByaXZhdGUgc3RhdGVJbnN0YW5jZTogU3RhdGU8VD5cblx0cHJpdmF0ZSB0ZW1wbGF0ZXMgPSB7XG5cdFx0c2F2ZWQ6IHt9IGFzIFBhcnRpYWw8VD4sXG5cdFx0dGVtcG9yYXJ5OiB7fSBhcyBQYXJ0aWFsPFQ+LFxuXHRcdHRhYjoge30gYXMgUGFydGlhbDxUPixcblx0XHRzZXNzaW9uOiB7fSBhcyBQYXJ0aWFsPFQ+LFxuXHR9XG5cdHByaXZhdGUgbG9va3VwX3ZlcmlmeV9pbnRlcnZhbDogbnVtYmVyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBsb29rdXBfdHRsOiBudW1iZXJcblx0cHJpdmF0ZSBjb21wdXRlZFByb3BlcnRpZXNTZXR1cD86ICgpID0+IHZvaWRcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiB7bG9va3VwX3R0bD86IG51bWJlcn0gPSB7bG9va3VwX3R0bDogREVGQVVMVF9MT09LVVBfVFRMfSkge1xuXHRcdHRoaXMubG9va3VwX3R0bCA9IG9wdGlvbnMubG9va3VwX3R0bCB8fCBERUZBVUxUX0xPT0tVUF9UVExcblx0XHQvLyBJbml0aWFsaXplIHdpdGggZW1wdHkgc3RhdGUsIHdpbGwgYmUgbG9hZGVkIGxhdGVyXG5cdFx0Ly8gR2VuZXJhdGUgdW5pcXVlIG5hbWUgZm9yIGVhY2ggU3RvcmUgaW5zdGFuY2UgdG8gYXZvaWQgY29sbGlzaW9uc1xuXHRcdGNvbnN0IGluc3RhbmNlTmFtZSA9IGBzdG9yZS5pbnN0YW5jZS4ke3N0b3JlSW5zdGFuY2VDb3VudGVyKyt9YFxuXHRcdHRoaXMuc3RhdGVJbnN0YW5jZSA9IHN0YXRlKHt9IGFzIFQsIGluc3RhbmNlTmFtZSlcblx0XHRcblx0XHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMubG9va3VwX3ZlcmlmeV9pbnRlcnZhbCkge1xuXHRcdFx0Ly8gQ2hlY2sgZXZlcnkgMTAgc2Vjb25kcyBmb3Igb3V0ZGF0ZWQgbG9va3VwIHBhdGhzLiBUaGlzIGlzXG5cdFx0XHQvLyB0byBrZWVwIHRoZSBsb29rdXAgc3RvcmUgY2xlYW4uXG5cdFx0XHR0aGlzLmxvb2t1cF92ZXJpZnlfaW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmNsZWFuX2xvb2t1cCgpXG5cdFx0XHR9LCBERUZBVUxUX0xPT0tVUF9WRVJJRllfSU5URVJWQUwpXG5cdFx0fVxuXHR9XG5cblx0Z2V0IHN0YXRlKCk6IFN0YXRlPFQ+IHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZUluc3RhbmNlXG5cdH1cblxuXHQvKipcblx0ICogTWVyZ2UgZGVlcCBvbiBvYmplY3QgYHN0YXRlYCwgYnV0IG9ubHkgdGhlIGtleS92YWx1ZXMgaW4gYGJsdWVwcmludGAuXG5cdCAqL1xuXHRibHVlcHJpbnQoc3RhdGU6IFQsIGJsdWVwcmludDogUGFydGlhbDxUPik6IFBhcnRpYWw8VD4ge1xuXHRcdGNvbnN0IHJlc3VsdDogYW55ID0ge31cblx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhibHVlcHJpbnQpKSB7XG5cdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXRlLCBrZXkpKSB7XG5cdFx0XHRcdGNvbnN0IGJsdWVwcmludFZhbHVlID0gKGJsdWVwcmludCBhcyBhbnkpW2tleV1cblx0XHRcdFx0Y29uc3Qgc3RhdGVWYWx1ZSA9IChzdGF0ZSBhcyBhbnkpW2tleV1cblx0XHRcdFx0aWYgKCghQXJyYXkuaXNBcnJheShibHVlcHJpbnRWYWx1ZSkgJiYgYmx1ZXByaW50VmFsdWUgIT09IG51bGwpICYmIGlzX29iamVjdChibHVlcHJpbnRWYWx1ZSkpIHtcblx0XHRcdFx0XHQvLyAoISkgQ29udmVudGlvbjogVGhlIGNvbnRlbnRzIG9mIGEgc3RhdGUga2V5IHdpdGggdGhlIG5hbWUgJ2xvb2t1cCcgaXNcblx0XHRcdFx0XHQvLyBhbHdheXMgb25lLW9uZSBjb3BpZWQgZnJvbSB0aGUgc3RhdGUsIGluc3RlYWQgb2YgYmVpbmdcblx0XHRcdFx0XHQvLyBibHVlcHJpbnRlZCBwZXIta2V5LiBUaGlzIGlzIHRvIGFjY29tb2RhdGUga2V5L3ZhbHVlXG5cdFx0XHRcdFx0Ly8gbG9va3Vwcywgd2l0aG91dCBoYXZpbmcgdG8gZGVmaW5lIGVhY2gga2V5IGluIHRoZVxuXHRcdFx0XHRcdC8vIHN0YXRlJ3MgcGVyc2lzdGVudCBzZWN0aW9uLlxuXHRcdFx0XHRcdGlmIChrZXkgPT09ICdsb29rdXAnKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRba2V5XSA9IGNvcHlfb2JqZWN0KHN0YXRlVmFsdWUpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtrZXldID0gdGhpcy5ibHVlcHJpbnQoc3RhdGVWYWx1ZSwgYmx1ZXByaW50VmFsdWUpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdFtrZXldID0gc3RhdGVWYWx1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQgYXMgUGFydGlhbDxUPlxuXHR9XG5cblx0Y2xlYW5fbG9va3VwKCkge1xuXHRcdC8vIFNraXAgZHVyaW5nIFNTUiAoc2VydmVyLXNpZGUgcmVuZGVyaW5nIGluIEJ1bilcblx0XHQvLyBDaGVjayBib3RoIHdpbmRvdyBleGlzdGVuY2UgYW5kIF9fU1NSX01PREVfXyBmbGFnIGZvciBzYWZldHlcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgZ2xvYmFsVGhpcy5fX1NTUl9NT0RFX18pIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRcblx0XHRsZXQgc3RvcmVfbW9kaWZpZWQgPSBmYWxzZVxuXHRcdGNvbnN0IGxvb2t1cCA9ICh0aGlzLnN0YXRlSW5zdGFuY2UgYXMgYW55KS5sb29rdXBcblx0XHRpZiAoIWxvb2t1cCkgcmV0dXJuXG5cdFx0XG5cdFx0Ly8gQnVpbGQgYSBuZXcgbG9va3VwIG9iamVjdCB3aXRoIG9ubHkgdmFsaWQgZW50cmllc1xuXHRcdGNvbnN0IG5ld0xvb2t1cDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG5cdFx0Ly8gR2V0IGtleXMgZmlyc3QgdG8gYXZvaWQgaXRlcmF0aW9uIGlzc3VlcyB3aGVuIGRlbGV0aW5nXG5cdFx0Ly8gRmlsdGVyIG91dCAkIHByZWZpeCBrZXlzIGFkZGVkIGJ5IHJlYWN0aXZlIHByb3h5XG5cdFx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGxvb2t1cCkuZmlsdGVyKGsgPT4gIWsuc3RhcnRzV2l0aCgnJCcpICYmIGsgIT09ICdfX2lzU3RhdGUnICYmIGsgIT09ICdfX3NpZ25hbE1hcCcpXG5cdFx0Zm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBsb29rdXBba2V5XVxuXHRcdFx0Ly8gUHJldmlvdXNseSBzdG9yZWQgdmFsdWVzIG1heSBub3QgaGF2ZSBhIG1vZGlmaWVkIHRpbWVzdGFtcC5cblx0XHRcdC8vIFNldCBpdCBub3csIGFuZCBsZXQgaXQgYmUgY2xlYW5lZCB1cCBhZnRlciB0aGUgaW50ZXJ2YWwuXG5cdFx0XHRpZiAoIXZhbHVlIHx8ICFpc19vYmplY3QodmFsdWUpKSB7XG5cdFx0XHRcdC8vIFNraXAgaW52YWxpZCBlbnRyaWVzXG5cdFx0XHRcdHN0b3JlX21vZGlmaWVkID0gdHJ1ZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCEodmFsdWUgYXMgYW55KS5tb2RpZmllZCkge1xuXHRcdFx0XHRcdCh2YWx1ZSBhcyBhbnkpLm1vZGlmaWVkID0gRGF0ZS5ub3coKVxuXHRcdFx0XHRcdHN0b3JlX21vZGlmaWVkID0gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICgodmFsdWUgYXMgYW55KS5tb2RpZmllZCA+PSAoRGF0ZS5ub3coKSAtIHRoaXMubG9va3VwX3R0bCkpIHtcblx0XHRcdFx0XHQvLyBLZWVwIGVudHJpZXMgdGhhdCBhcmUgbm90IGV4cGlyZWRcblx0XHRcdFx0XHRuZXdMb29rdXBba2V5XSA9IHZhbHVlXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5pbmZvKGBbc3RvcmVdIHJlbW92aW5nIG91dGRhdGVkIGxvb2t1cCBwYXRoOiAke2tleX1gKVxuXHRcdFx0XHRcdHN0b3JlX21vZGlmaWVkID0gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChzdG9yZV9tb2RpZmllZCkge1xuXHRcdFx0Ly8gUmVwbGFjZSBsb29rdXAgd2l0aCBjbGVhbmVkIHZlcnNpb25cblx0XHRcdCh0aGlzLnN0YXRlSW5zdGFuY2UgYXMgYW55KS5sb29rdXAgPSBuZXdMb29rdXBcblx0XHRcdHRoaXMuc2F2ZSgpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBrZXkgZnJvbSBsb2NhbCBzdG9yYWdlLiBJZiB0aGUgaXRlbSBkb2VzIG5vdCBleGlzdCBvclxuXHQgKiBjYW5ub3QgYmUgcmV0cmlldmVkLCB0aGUgZGVmYXVsdCBcInt9XCIgaXMgcmV0dXJuZWQuXG5cdCAqL1xuXHRnZXQoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuICd7fSdcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpIHx8ICd7fSdcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiAne30nXG5cdFx0fVxuXHR9XG5cblx0Z2V0X3RhYl9zdG9yYWdlKGtleTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAne30nXG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShrZXkpIHx8ICd7fSdcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiAne30nXG5cdFx0fVxuXHR9XG5cblx0bG9hZChzYXZlZDogUGFydGlhbDxUPiwgdGVtcG9yYXJ5OiBQYXJ0aWFsPFQ+LCB0YWI6IFBhcnRpYWw8VD4gPSB7fSBhcyBQYXJ0aWFsPFQ+LCBzZXNzaW9uOiBQYXJ0aWFsPFQ+ID0ge30gYXMgUGFydGlhbDxUPikge1xuXHRcdGNvbnN0IHJlc3RvcmVkX3N0YXRlID0ge1xuXHRcdFx0dGFiOiB0aGlzLmdldF90YWJfc3RvcmFnZSgnc3RvcmUnKSxcblx0XHRcdHN0b3JlOiB0aGlzLmdldCgnc3RvcmUnKSxcblx0XHR9XG5cblx0XHR0aGlzLnRlbXBsYXRlcyA9IHtcblx0XHRcdHNhdmVkLFxuXHRcdFx0dGVtcG9yYXJ5LFxuXHRcdFx0dGFiLFxuXHRcdFx0c2Vzc2lvbixcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0cmVzdG9yZWRfc3RhdGUuc3RvcmUgPSBKU09OLnBhcnNlKHJlc3RvcmVkX3N0YXRlLnN0b3JlKVxuXHRcdFx0cmVzdG9yZWRfc3RhdGUudGFiID0gSlNPTi5wYXJzZShyZXN0b3JlZF9zdGF0ZS50YWIpXG5cdFx0fSBjYXRjaChlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBbc3RvcmVdIGZhaWxlZCB0byBwYXJzZSBzdG9yZS90YWI6ICR7ZXJyfWApXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3RvcmVfc3RhdGUgPSBtZXJnZV9kZWVwKGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnNhdmVkKSwgY29weV9vYmplY3QocmVzdG9yZWRfc3RhdGUuc3RvcmUpKVxuXHRcdC8vIG92ZXJyaWRlIHdpdGggcHJldmlvdXMgaWRlbnRpdHkgZm9yIGEgYmV0dGVyIHZlcnNpb24gYnVtcCBleHBlcmllbmNlLlxuXHRcdGlmIChyZXN0b3JlZF9zdGF0ZS5zdG9yZSAmJiB0eXBlb2YgcmVzdG9yZWRfc3RhdGUuc3RvcmUgPT09ICdvYmplY3QnICYmICdpZGVudGl0eScgaW4gcmVzdG9yZWRfc3RhdGUuc3RvcmUpIHtcblx0XHRcdHN0b3JlX3N0YXRlLmlkZW50aXR5ID0gKHJlc3RvcmVkX3N0YXRlLnN0b3JlIGFzIGFueSkuaWRlbnRpdHlcblx0XHR9XG5cdFx0bGV0IHRhYl9zdGF0ZVxuXG5cdFx0aWYgKCFyZXN0b3JlZF9zdGF0ZS50YWIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbc3RvcmVdIGxvYWRpbmcgdGFiIHN0YXRlIGZyb20gbG9jYWwgc3RvcmUnKVxuXHRcdFx0dGFiX3N0YXRlID0gbWVyZ2VfZGVlcChjb3B5X29iamVjdCh0aGlzLnRlbXBsYXRlcy50YWIpLCBzdG9yZV9zdGF0ZS50YWIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbc3RvcmVdIHJlc3RvcmluZyBleGlzdGluZyB0YWIgc3RhdGUnKVxuXHRcdFx0dGFiX3N0YXRlID0gbWVyZ2VfZGVlcChjb3B5X29iamVjdCh0aGlzLnRlbXBsYXRlcy50YWIpLCBjb3B5X29iamVjdChyZXN0b3JlZF9zdGF0ZS50YWIpKVxuXHRcdH1cblx0XHRcblx0XHQvLyBBbHdheXMgbWVyZ2UgdGFiX3N0YXRlIGludG8gc3RvcmVfc3RhdGUgdG8gZW5zdXJlIGl0J3MgaW5jbHVkZWQgaW4gZmluYWxfc3RhdGVcblx0XHRtZXJnZV9kZWVwKHN0b3JlX3N0YXRlLCB7dGFiOiB0YWJfc3RhdGV9KVxuXG5cdFx0Ly8gTWVyZ2UgdGVtcG9yYXJ5IGludG8gc3RvcmVfc3RhdGVcblx0XHQvLyBOb3RlOiBjb3B5X29iamVjdCByZW1vdmVzIGZ1bmN0aW9ucywgYnV0IHRlbXBvcmFyeSBkYXRhIHNob3VsZG4ndCBoYXZlIGZ1bmN0aW9ucyBhbnl3YXlcblx0XHQvLyAoY29tcHV0ZWQgcHJvcGVydGllcyBhcmUgaGFuZGxlZCBzZXBhcmF0ZWx5IHZpYSBtZXJnZWRJbml0aWFsKVxuXHRcdGNvbnN0IHRlbXBfc3RhdGUgPSBtZXJnZV9kZWVwKHN0b3JlX3N0YXRlLCBjb3B5X29iamVjdCh0ZW1wb3JhcnkpKVxuXHRcdFxuXHRcdC8vIE1lcmdlIHNlc3Npb24gaW50byB0ZW1wX3N0YXRlIHRvIGNyZWF0ZSBmaW5hbF9zdGF0ZVxuXHRcdC8vIFNlc3Npb24gc3RhdGUgY29tZXMgZnJvbSBzZXJ2ZXIgKFNTUiksIG5vdCBsb2NhbFN0b3JhZ2Vcblx0XHRjb25zdCBmaW5hbF9zdGF0ZSA9IG1lcmdlX2RlZXAodGVtcF9zdGF0ZSwgY29weV9vYmplY3Qoc2Vzc2lvbikpXG5cdFx0XG5cdFx0Ly8gTWVyZ2UgdGVtcGxhdGVzIChpbmNsdWRpbmcgY29tcHV0ZWQgcHJvcGVydGllcykgaW50byBcIm1lcmdlZCBpbml0aWFsIHN0YXRlXCJcblx0XHQvLyBUaGlzIHdpbGwgYmUgc3RvcmVkIGluIHJlZ2lzdHJ5IHNvIGNvbXB1dGVkIHByb3BlcnRpZXMgY2FuIGJlIGF1dG9tYXRpY2FsbHkgcmVzdG9yZWRcblx0XHQvLyBVc2UgY29weV9vYmplY3RfcHJlc2VydmVfZnVuY3Rpb25zIHRvIGRlZXAgY29weSB3aGlsZSBwcmVzZXJ2aW5nIGZ1bmN0aW9uc1xuXHRcdC8vIE5vdGU6IHRhYiB0ZW1wbGF0ZSBzdHJ1Y3R1cmUgbmVlZHMgdG8gbWF0Y2ggZmluYWxfc3RhdGUgc3RydWN0dXJlIChuZXN0ZWQgdW5kZXIgJ3RhYicpXG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFNhdmVkID0gY29weV9vYmplY3RfcHJlc2VydmVfZnVuY3Rpb25zKHNhdmVkKVxuXHRcdGNvbnN0IG1lcmdlZEluaXRpYWxUZW1wb3JhcnkgPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnModGVtcG9yYXJ5KVxuXHRcdC8vIFRhYiB0ZW1wbGF0ZSBpcyBtZXJnZWQgaW50byBzdG9yZV9zdGF0ZS50YWIsIHNvIHdyYXAgaXQgaW4ge3RhYjogLi4ufVxuXHRcdGNvbnN0IG1lcmdlZEluaXRpYWxUYWIgPSB0YWIgJiYgT2JqZWN0LmtleXModGFiKS5sZW5ndGggPiAwID8ge3RhYjogY29weV9vYmplY3RfcHJlc2VydmVfZnVuY3Rpb25zKHRhYil9IDoge31cblx0XHQvLyBTZXNzaW9uIHRlbXBsYXRlIGlzIG1lcmdlZCBkaXJlY3RseSAobm8gbmVzdGluZyBuZWVkZWQsIHN0cnVjdHVyZSBtYXRjaGVzIGZpbmFsX3N0YXRlKVxuXHRcdGNvbnN0IG1lcmdlZEluaXRpYWxTZXNzaW9uID0gY29weV9vYmplY3RfcHJlc2VydmVfZnVuY3Rpb25zKHNlc3Npb24pXG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbCA9IG1lcmdlX2RlZXAoXG5cdFx0XHRtZXJnZWRJbml0aWFsU2F2ZWQsXG5cdFx0XHRtZXJnZWRJbml0aWFsVGVtcG9yYXJ5LFxuXHRcdFx0bWVyZ2VkSW5pdGlhbFRhYixcblx0XHRcdG1lcmdlZEluaXRpYWxTZXNzaW9uXG5cdFx0KVxuXHRcdFxuXHRcdC8vIFVwZGF0ZSByZWdpc3RyeSBlbnRyeSB0byBzdG9yZSBtZXJnZWQgdGVtcGxhdGVzIGFzIFwiaW5pdGlhbFwiIHN0YXRlXG5cdFx0Ly8gVGhpcyBhbGxvd3MgZGVzZXJpYWxpemVBbGxTdGF0ZXMoKSB0byBhdXRvbWF0aWNhbGx5IHJlc3RvcmUgY29tcHV0ZWQgcHJvcGVydGllc1xuXHRcdHVwZGF0ZVN0YXRlUmVnaXN0cnkodGhpcy5zdGF0ZUluc3RhbmNlLCBtZXJnZWRJbml0aWFsKVxuXHRcdFxuXHRcdC8vIFVzZSBkZXNlcmlhbGl6ZVN0b3JlKCkgaW5zdGVhZCBvZiBjdXN0b20gdXBkYXRlU3RhdGUoKVxuXHRcdC8vIFRoaXMgZW5zdXJlcyBjb25zaXN0ZW5jeSB3aXRoIFNTUiBkZXNlcmlhbGl6YXRpb24gbWVjaGFuaXNtXG5cdFx0ZGVzZXJpYWxpemVTdG9yZSh0aGlzLnN0YXRlSW5zdGFuY2UsIGZpbmFsX3N0YXRlKVxuXHRcdFxuXHRcdC8vIFJlc3RvcmUgY29tcHV0ZWQgcHJvcGVydGllcyBmcm9tIG1lcmdlZCB0ZW1wbGF0ZXNcblx0XHQvLyBUaGlzIGVuc3VyZXMgY29tcHV0ZWQgcHJvcGVydGllcyBhcmUgYXZhaWxhYmxlIGltbWVkaWF0ZWx5IGFmdGVyIGxvYWQoKVxuXHRcdC8vIE5vdGU6IG1lcmdlZEluaXRpYWwgY29udGFpbnMgYWxsIHRlbXBsYXRlcyAoc2F2ZWQsIHRlbXBvcmFyeSwgdGFiLCBzZXNzaW9uKSB3aXRoIGNvbXB1dGVkIHByb3BlcnRpZXNcblx0XHRyZXN0b3JlQ29tcHV0ZWRQcm9wZXJ0aWVzKHRoaXMuc3RhdGVJbnN0YW5jZSwgbWVyZ2VkSW5pdGlhbClcblx0XHRcblx0XHQvLyBOb3RlOiBzZXR1cENvbXB1dGVkUHJvcGVydGllcygpIGNhbGxiYWNrIGlzIG5vIGxvbmdlciBuZWVkZWQsIGJ1dCBrZXB0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cdFx0aWYgKHRoaXMuY29tcHV0ZWRQcm9wZXJ0aWVzU2V0dXApIHtcblx0XHRcdHRoaXMuY29tcHV0ZWRQcm9wZXJ0aWVzU2V0dXAoKVxuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgZnVuY3Rpb24gdG8gc2V0IHVwIGNvbXB1dGVkIHByb3BlcnRpZXMgYWZ0ZXIgZWFjaCBsb2FkKClcblx0ICogVGhpcyBlbnN1cmVzIGNvbXB1dGVkIHByb3BlcnRpZXMgYXJlIGFsd2F5cyBhdmFpbGFibGUsIGV2ZW4gYWZ0ZXIgcmVsb2FkaW5nIGZyb20gc3RvcmFnZVxuXHQgKi9cblx0c2V0dXBDb21wdXRlZFByb3BlcnRpZXMoc2V0dXBGbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuXHRcdHRoaXMuY29tcHV0ZWRQcm9wZXJ0aWVzU2V0dXAgPSBzZXR1cEZuXG5cdFx0Ly8gQ2FsbCBpbW1lZGlhdGVseSB0byBzZXQgdXAgY29tcHV0ZWQgcHJvcGVydGllcyBmb3IgY3VycmVudCBzdGF0ZVxuXHRcdHNldHVwRm4oKVxuXHR9XG5cblx0YXN5bmMgc2F2ZShvcHRpb25zPzoge3NhdmVkPzogYm9vbGVhbiwgdGFiPzogYm9vbGVhbiwgc2Vzc2lvbj86IGJvb2xlYW59KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gU2tpcCBzYXZpbmcgZHVyaW5nIFNTUiAoc2VydmVyLXNpZGUgcmVuZGVyaW5nIGluIEJ1bilcblx0XHQvLyBPbiB0aGUgc2VydmVyLCB0aGVyZSdzIG5vIGxvY2FsU3RvcmFnZS9zZXNzaW9uU3RvcmFnZSBhbmQgbm8gbmVlZCB0byBwZXJzaXN0IHN0YXRlXG5cdFx0aWYgKGdsb2JhbFRoaXMuX19TU1JfTU9ERV9fKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0XG5cdFx0Ly8gRGVmYXVsdCB0byBzYXZpbmcgYWxsIHN0b3JhZ2UgdHlwZXMgaWYgbm8gb3B0aW9ucyBwcm92aWRlZFxuXHRcdGNvbnN0IHNhdmVTYXZlZCA9IG9wdGlvbnM/LnNhdmVkID8/IChvcHRpb25zID09PSB1bmRlZmluZWQpXG5cdFx0Y29uc3Qgc2F2ZVRhYiA9IG9wdGlvbnM/LnRhYiA/PyAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKVxuXHRcdGNvbnN0IHNhdmVTZXNzaW9uID0gb3B0aW9ucz8uc2Vzc2lvbiA/PyAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKVxuXHRcdFxuXHRcdC8vIFVzZSBTU1Igc2VyaWFsaXphdGlvbiB3aGljaCBwcm9wZXJseSBoYW5kbGVzIFN0YXRlIG9iamVjdHMgYW5kIHNraXBzIENvbXB1dGVkU2lnbmFsIHByb3BlcnRpZXNcblx0XHQvLyBUaGlzIGlzIHRoZSBzYW1lIG1lY2hhbmlzbSB1c2VkIGZvciBTU1IsIGVuc3VyaW5nIGNvbnNpc3RlbmN5XG5cdFx0Y29uc3Qgc3RhdGVQbGFpbiA9IHNlcmlhbGl6ZVN0b3JlKHRoaXMuc3RhdGVJbnN0YW5jZSlcblx0XHRcblx0XHQvLyBTYXZlIHRvIGxvY2FsU3RvcmFnZSAoc2F2ZWQgc3RhdGUpXG5cdFx0aWYgKHNhdmVTYXZlZCAmJiB0aGlzLnRlbXBsYXRlcy5zYXZlZCkge1xuXHRcdFx0dGhpcy5zZXQoJ3N0b3JlJywgdGhpcy5ibHVlcHJpbnQoc3RhdGVQbGFpbiwgY29weV9vYmplY3QodGhpcy50ZW1wbGF0ZXMuc2F2ZWQpKSlcblx0XHR9XG5cdFx0XG5cdFx0Ly8gU2F2ZSB0byBzZXNzaW9uU3RvcmFnZSAodGFiIHN0YXRlKVxuXHRcdGlmIChzYXZlVGFiICYmIHRoaXMudGVtcGxhdGVzLnRhYikge1xuXHRcdFx0Y29uc3QgdGFiU3RhdGUgPSAodGhpcy5zdGF0ZUluc3RhbmNlIGFzIGFueSkudGFiXG5cdFx0XHRpZiAodGFiU3RhdGUpIHtcblx0XHRcdFx0Ly8gR2V0IHRoZSB0YWIgdGVtcGxhdGUgLSB1bndyYXAgaWYgaXQncyBuZXN0ZWQgdW5kZXIgYSAndGFiJyBrZXlcblx0XHRcdFx0Ly8gVGhlIHRlbXBsYXRlIG1pZ2h0IGJlOiB7IHRhYjogeyBzZXNzaW9uSWQsIC4uLiB9IH0gb3IgeyBzZXNzaW9uSWQsIC4uLiB9XG5cdFx0XHRcdC8vIFRoZSBzdGF0ZSBpcyBhbHdheXM6IHsgc2Vzc2lvbklkLCAuLi4gfVxuXHRcdFx0XHRjb25zdCB0YWJUZW1wbGF0ZSA9ICh0aGlzLnRlbXBsYXRlcy50YWIgYXMgYW55KS50YWIgfHwgdGhpcy50ZW1wbGF0ZXMudGFiXG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBDaGVjayBpZiB0YWIgaXMgYSBTdGF0ZSBvYmplY3Rcblx0XHRcdFx0aWYgKGlzU3RhdGUodGFiU3RhdGUpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGFiUGxhaW4gPSBzZXJpYWxpemVTdG9yZSh0YWJTdGF0ZSlcblx0XHRcdFx0XHQvLyBibHVlcHJpbnQgZXhwZWN0cyBib3RoIGFyZ3VtZW50cyB0byBoYXZlIHRoZSBzYW1lIHN0cnVjdHVyZVxuXHRcdFx0XHRcdHRoaXMuc2V0X3RhYignc3RvcmUnLCB0aGlzLmJsdWVwcmludCh0YWJQbGFpbiwgY29weV9vYmplY3QodGFiVGVtcGxhdGUpKSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBQbGFpbiBvYmplY3QgdGFiXG5cdFx0XHRcdFx0dGhpcy5zZXRfdGFiKCdzdG9yZScsIHRoaXMuYmx1ZXByaW50KHRhYlN0YXRlLCBjb3B5X29iamVjdCh0YWJUZW1wbGF0ZSkpKVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBObyB0YWIgc3RhdGUgLSBzYXZlIGVtcHR5IHRhYiBiYXNlZCBvbiB0ZW1wbGF0ZSBzdHJ1Y3R1cmVcblx0XHRcdFx0Y29uc3QgdGFiVGVtcGxhdGUgPSAodGhpcy50ZW1wbGF0ZXMudGFiIGFzIGFueSkudGFiIHx8IHRoaXMudGVtcGxhdGVzLnRhYlxuXHRcdFx0XHRpZiAodGFiVGVtcGxhdGUgJiYgT2JqZWN0LmtleXModGFiVGVtcGxhdGUpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHR0aGlzLnNldF90YWIoJ3N0b3JlJywgdGhpcy5ibHVlcHJpbnQoe30gYXMgYW55LCBjb3B5X29iamVjdCh0YWJUZW1wbGF0ZSkpKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuc2V0X3RhYignc3RvcmUnLCB7fSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBTYXZlIHRvIHNlc3Npb24gQVBJIChzZXNzaW9uIHN0YXRlKSAtIGFzeW5jIGJ5IG5hdHVyZVxuXHRcdC8vIE9ubHkgc2F2ZSBzZXNzaW9uIG9uIGNsaWVudCBzaWRlIChub3QgZHVyaW5nIFNTUilcblx0XHRpZiAoc2F2ZVNlc3Npb24gJiYgdGhpcy50ZW1wbGF0ZXMuc2Vzc2lvbiAmJiBPYmplY3Qua2V5cyh0aGlzLnRlbXBsYXRlcy5zZXNzaW9uKS5sZW5ndGggPiAwICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRjb25zdCBzZXNzaW9uRGF0YSA9IHRoaXMuYmx1ZXByaW50KHN0YXRlUGxhaW4sIGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnNlc3Npb24pKVxuXHRcdFx0XG5cdFx0XHQvLyBDYWxsIEFQSSBlbmRwb2ludCB3aXRoIGJhdGNoZWQgc2Vzc2lvbiB1cGRhdGVzXG5cdFx0XHRjb25zdCBlbmRwb2ludCA9ICcvYXBpL3Nlc3Npb24nXG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGVuZHBvaW50LCB7XG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcblx0XHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoc2Vzc2lvbkRhdGEpXG5cdFx0XHR9KVxuXG5cdFx0XHRcblx0XHRcdGlmICghcmVzcG9uc2Uub2spIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2F2ZSBzZXNzaW9uIHN0YXRlOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZXQoa2V5OiBzdHJpbmcsIGl0ZW06IG9iamVjdCk6IHZvaWQge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuXG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeShpdGVtKSlcblx0XHR9IGNhdGNoKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHVzZSBMb2NhbCBTdG9yYWdlOyBjb250aW51ZSB3aXRob3V0LicsIGVycilcblx0XHR9XG5cdH1cblxuXHRzZXRfdGFiKGtleTogc3RyaW5nLCBpdGVtOiBvYmplY3QpOiB2b2lkIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeShpdGVtKSlcblx0XHR9IGNhdGNoKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcignQ2Fubm90IHVzZSBTZXNzaW9uIFN0b3JhZ2U7IGNvbnRpbnVlIHdpdGhvdXQuJywgZXJyKVxuXHRcdH1cblx0fVxufVxuIiwKICAgICJpbXBvcnQgaHlwZXJzY3JpcHQgZnJvbSAnLi9yZW5kZXIvaHlwZXJzY3JpcHQnXG5pbXBvcnQgbW91bnRSZWRyYXdGYWN0b3J5IGZyb20gJy4vYXBpL21vdW50LXJlZHJhdydcbmltcG9ydCByb3V0ZXJGYWN0b3J5IGZyb20gJy4vYXBpL3JvdXRlcidcbmltcG9ydCByZW5kZXJGYWN0b3J5IGZyb20gJy4vcmVuZGVyL3JlbmRlcidcbmltcG9ydCBwYXJzZVF1ZXJ5U3RyaW5nIGZyb20gJy4vcXVlcnlzdHJpbmcvcGFyc2UnXG5pbXBvcnQgYnVpbGRRdWVyeVN0cmluZyBmcm9tICcuL3F1ZXJ5c3RyaW5nL2J1aWxkJ1xuaW1wb3J0IHBhcnNlUGF0aG5hbWUgZnJvbSAnLi9wYXRobmFtZS9wYXJzZSdcbmltcG9ydCBidWlsZFBhdGhuYW1lIGZyb20gJy4vcGF0aG5hbWUvYnVpbGQnXG5pbXBvcnQgVm5vZGVGYWN0b3J5LCB7TWl0aHJpbFRzeENvbXBvbmVudH0gZnJvbSAnLi9yZW5kZXIvdm5vZGUnXG5pbXBvcnQgY2Vuc29yIGZyb20gJy4vdXRpbC9jZW5zb3InXG5pbXBvcnQgbmV4dF90aWNrIGZyb20gJy4vdXRpbC9uZXh0X3RpY2snXG5pbXBvcnQgZG9tRm9yIGZyb20gJy4vcmVuZGVyL2RvbUZvcidcbmltcG9ydCB7c2lnbmFsLCBjb21wdXRlZCwgZWZmZWN0LCBTaWduYWwsIENvbXB1dGVkU2lnbmFsLCBzZXRTaWduYWxSZWRyYXdDYWxsYmFjaywgZ2V0U2lnbmFsQ29tcG9uZW50c30gZnJvbSAnLi9zaWduYWwnXG5pbXBvcnQge3N0YXRlLCB3YXRjaCwgcmVnaXN0ZXJTdGF0ZSwgZ2V0UmVnaXN0ZXJlZFN0YXRlc30gZnJvbSAnLi9zdGF0ZSdcblxuaW1wb3J0IHR5cGUge1Zub2RlLCBDaGlsZHJlbiwgQ29tcG9uZW50VHlwZX0gZnJvbSAnLi9yZW5kZXIvdm5vZGUnXG5pbXBvcnQgdHlwZSB7SHlwZXJzY3JpcHR9IGZyb20gJy4vcmVuZGVyL2h5cGVyc2NyaXB0J1xuaW1wb3J0IHR5cGUge1JvdXRlLCBSb3V0ZVJlc29sdmVyLCBSZWRpcmVjdE9iamVjdH0gZnJvbSAnLi9hcGkvcm91dGVyJ1xuaW1wb3J0IHR5cGUge1JlbmRlciwgUmVkcmF3LCBNb3VudH0gZnJvbSAnLi9hcGkvbW91bnQtcmVkcmF3J1xuXG5leHBvcnQgaW50ZXJmYWNlIE1pdGhyaWxTdGF0aWMge1xuXHRtOiBIeXBlcnNjcmlwdFxuXHR0cnVzdDogKGh0bWw6IHN0cmluZykgPT4gVm5vZGVcblx0ZnJhZ21lbnQ6IChhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwsIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKSA9PiBWbm9kZVxuXHRGcmFnbWVudDogc3RyaW5nXG5cdG1vdW50OiBNb3VudFxuXHRyb3V0ZTogUm91dGUgJiAoKHJvb3Q6IEVsZW1lbnQsIGRlZmF1bHRSb3V0ZTogc3RyaW5nLCByb3V0ZXM6IFJlY29yZDxzdHJpbmcsIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyPikgPT4gdm9pZCkgJiB7cmVkaXJlY3Q6IChwYXRoOiBzdHJpbmcpID0+IFJlZGlyZWN0T2JqZWN0fVxuXHRyZW5kZXI6IFJlbmRlclxuXHRyZWRyYXc6IFJlZHJhd1xuXHRwYXJzZVF1ZXJ5U3RyaW5nOiAocXVlcnlTdHJpbmc6IHN0cmluZykgPT4gUmVjb3JkPHN0cmluZywgYW55PlxuXHRidWlsZFF1ZXJ5U3RyaW5nOiAodmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiBzdHJpbmdcblx0cGFyc2VQYXRobmFtZTogKHBhdGhuYW1lOiBzdHJpbmcpID0+IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn1cblx0YnVpbGRQYXRobmFtZTogKHRlbXBsYXRlOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55PikgPT4gc3RyaW5nXG5cdHZub2RlOiB0eXBlb2YgVm5vZGVGYWN0b3J5XG5cdGNlbnNvcjogKGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBleHRyYXM/OiBzdHJpbmdbXSkgPT4gUmVjb3JkPHN0cmluZywgYW55PlxuXHRuZXh0X3RpY2s6ICgpID0+IFByb21pc2U8dm9pZD5cblx0ZG9tRm9yOiAodm5vZGU6IFZub2RlKSA9PiBHZW5lcmF0b3I8Tm9kZSwgdm9pZCwgdW5rbm93bj5cbn1cblxuY29uc3QgbW91bnRSZWRyYXdJbnN0YW5jZSA9IG1vdW50UmVkcmF3RmFjdG9yeShcblx0cmVuZGVyRmFjdG9yeSgpLFxuXHR0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJyA/IHJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBzZXRUaW1lb3V0LFxuXHRjb25zb2xlLFxuKVxuXG5jb25zdCByb3V0ZXIgPSByb3V0ZXJGYWN0b3J5KFxuXHR0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IG51bGwsXG5cdG1vdW50UmVkcmF3SW5zdGFuY2UsXG4pXG5cbmNvbnN0IG06IE1pdGhyaWxTdGF0aWMgJiBIeXBlcnNjcmlwdCA9IGZ1bmN0aW9uIG0odGhpczogYW55KSB7XG5cdHJldHVybiBoeXBlcnNjcmlwdC5hcHBseSh0aGlzLCBhcmd1bWVudHMgYXMgYW55KVxufSBhcyB1bmtub3duIGFzIE1pdGhyaWxTdGF0aWMgJiBIeXBlcnNjcmlwdFxuXG5tLm0gPSBoeXBlcnNjcmlwdCBhcyBIeXBlcnNjcmlwdFxubS50cnVzdCA9IGh5cGVyc2NyaXB0LnRydXN0XG5tLmZyYWdtZW50ID0gaHlwZXJzY3JpcHQuZnJhZ21lbnRcbm0uRnJhZ21lbnQgPSAnWydcbm0ubW91bnQgPSBtb3VudFJlZHJhd0luc3RhbmNlLm1vdW50XG5tLnJvdXRlID0gcm91dGVyIGFzIFJvdXRlICYgdHlwZW9mIHJvdXRlciAmIHtyZWRpcmVjdDogKHBhdGg6IHN0cmluZykgPT4gUmVkaXJlY3RPYmplY3R9XG5tLnJlbmRlciA9IHJlbmRlckZhY3RvcnkoKVxubS5yZWRyYXcgPSBtb3VudFJlZHJhd0luc3RhbmNlLnJlZHJhd1xubS5wYXJzZVF1ZXJ5U3RyaW5nID0gcGFyc2VRdWVyeVN0cmluZ1xubS5idWlsZFF1ZXJ5U3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZ1xubS5wYXJzZVBhdGhuYW1lID0gcGFyc2VQYXRobmFtZVxubS5idWlsZFBhdGhuYW1lID0gYnVpbGRQYXRobmFtZVxubS52bm9kZSA9IFZub2RlRmFjdG9yeVxubS5jZW5zb3IgPSBjZW5zb3Jcbm0ubmV4dF90aWNrID0gbmV4dF90aWNrXG5tLmRvbUZvciA9IGRvbUZvclxuXG4vLyBTZXQgdXAgc2lnbmFsLXRvLWNvbXBvbmVudCByZWRyYXcgaW50ZWdyYXRpb25cbnNldFNpZ25hbFJlZHJhd0NhbGxiYWNrKChzaWc6IFNpZ25hbDxhbnk+KSA9PiB7XG5cdGNvbnN0IGNvbXBvbmVudHMgPSBnZXRTaWduYWxDb21wb25lbnRzKHNpZylcblx0aWYgKGNvbXBvbmVudHMpIHtcblx0XHRjb21wb25lbnRzLmZvckVhY2goY29tcG9uZW50ID0+IHtcblx0XHRcdC8vIFVzZSB0aGUgY29tcG9uZW50LWxldmVsIHJlZHJhd1xuXHRcdFx0bS5yZWRyYXcoY29tcG9uZW50IGFzIGFueSlcblx0XHR9KVxuXHR9XG59KVxuXG4vLyBFeHBvcnQgc2lnbmFscyBBUElcbmV4cG9ydCB7c2lnbmFsLCBjb21wdXRlZCwgZWZmZWN0LCBTaWduYWwsIENvbXB1dGVkU2lnbmFsLCBzdGF0ZSwgd2F0Y2gsIHJlZ2lzdGVyU3RhdGUsIGdldFJlZ2lzdGVyZWRTdGF0ZXN9XG5leHBvcnQgdHlwZSB7U3RhdGV9IGZyb20gJy4vc3RhdGUnXG5cbi8vIEV4cG9ydCBTdG9yZSBjbGFzc1xuZXhwb3J0IHtTdG9yZX0gZnJvbSAnLi9zdG9yZSdcblxuLy8gRXhwb3J0IFNTUiB1dGlsaXRpZXNcbmV4cG9ydCB7c2VyaWFsaXplU3RvcmUsIGRlc2VyaWFsaXplU3RvcmUsIHNlcmlhbGl6ZUFsbFN0YXRlcywgZGVzZXJpYWxpemVBbGxTdGF0ZXN9IGZyb20gJy4vcmVuZGVyL3NzclN0YXRlJ1xuXG4vLyBFeHBvcnQgU1NSIHJlcXVlc3QgY29udGV4dCAoZm9yIHBlci1yZXF1ZXN0IHN0b3JlIGFuZCBzdGF0ZSByZWdpc3RyeSlcbmV4cG9ydCB7Z2V0U1NSQ29udGV4dCwgcnVuV2l0aENvbnRleHQsIHJ1bldpdGhDb250ZXh0QXN5bmMsIGNsZWFudXBXYXRjaGVyc30gZnJvbSAnLi9zc3JDb250ZXh0J1xuZXhwb3J0IHR5cGUge1NTUkFjY2Vzc0NvbnRleHR9IGZyb20gJy4vc3NyQ29udGV4dCdcblxuLy8gRXhwb3J0IGlzb21vcnBoaWMgbG9nZ2VyXG5leHBvcnQge2xvZ2dlciwgTG9nZ2VyfSBmcm9tICcuL3NlcnZlci9sb2dnZXInXG5leHBvcnQgdHlwZSB7TG9nQ29udGV4dH0gZnJvbSAnLi9zZXJ2ZXIvbG9nZ2VyJ1xuXG4vLyBFeHBvcnQgbmV4dF90aWNrIHV0aWxpdHlcbmV4cG9ydCB7bmV4dF90aWNrfSBmcm9tICcuL3V0aWwvbmV4dF90aWNrJ1xuXG4vLyBFeHBvcnQgVVJJIHV0aWxpdGllc1xuZXhwb3J0IHtnZXRDdXJyZW50VXJsLCBnZXRQYXRobmFtZSwgZ2V0U2VhcmNoLCBnZXRIYXNoLCBnZXRMb2NhdGlvbn0gZnJvbSAnLi91dGlsL3VyaSdcbmV4cG9ydCB0eXBlIHtJc29tb3JwaGljTG9jYXRpb259IGZyb20gJy4vdXRpbC91cmknXG5cbi8vIEV4cG9ydCBjb21wb25lbnQgYW5kIHZub2RlIHR5cGVzXG5leHBvcnQgdHlwZSB7Vm5vZGUsIENoaWxkcmVuLCBDb21wb25lbnQsIENvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFR5cGV9IGZyb20gJy4vcmVuZGVyL3Zub2RlJ1xuLy8gRXhwb3J0IE1pdGhyaWxUc3hDb21wb25lbnQgYXMgYSB2YWx1ZSAoY2xhc3MpIHNvIGl0IGNhbiBiZSBleHRlbmRlZCBhdCBydW50aW1lXG5leHBvcnQge01pdGhyaWxUc3hDb21wb25lbnR9XG5leHBvcnQgdHlwZSB7SHlwZXJzY3JpcHR9IGZyb20gJy4vcmVuZGVyL2h5cGVyc2NyaXB0J1xuZXhwb3J0IHR5cGUge1JvdXRlLCBSb3V0ZVJlc29sdmVyLCBSZWRpcmVjdE9iamVjdH0gZnJvbSAnLi9hcGkvcm91dGVyJ1xuZXhwb3J0IHR5cGUge1JlbmRlciwgUmVkcmF3LCBNb3VudH0gZnJvbSAnLi9hcGkvbW91bnQtcmVkcmF3J1xuXG5leHBvcnQgZGVmYXVsdCBtXG4iLAogICAgImltcG9ydCB7TWl0aHJpbFRzeENvbXBvbmVudCwgVm5vZGV9IGZyb20gJy4uLy4uLy4uL2luZGV4J1xuaW1wb3J0IG0gZnJvbSAnLi4vLi4vLi4vaW5kZXgnXG5pbXBvcnQge0RvY1BhZ2V9IGZyb20gJy4uL21hcmtkb3duJ1xuXG5pbnRlcmZhY2UgTGF5b3V0QXR0cnMge1xuXHRwYWdlOiBEb2NQYWdlXG5cdHJvdXRlUGF0aD86IHN0cmluZ1xuXHRuYXZHdWlkZXM/OiBzdHJpbmdcblx0bmF2TWV0aG9kcz86IHN0cmluZ1xuXHR2ZXJzaW9uPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjbGFzcyBMYXlvdXQgZXh0ZW5kcyBNaXRocmlsVHN4Q29tcG9uZW50PExheW91dEF0dHJzPiB7XG5cdHZpZXcodm5vZGU6IFZub2RlPExheW91dEF0dHJzPikge1xuXHRcdGNvbnN0IHtwYWdlLCBuYXZHdWlkZXMgPSAnJywgbmF2TWV0aG9kcyA9ICcnLCB2ZXJzaW9uID0gJzIuMy44J30gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IGN1cnJlbnRQYXRoID0gdm5vZGUuYXR0cnMucm91dGVQYXRoIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IG0ucm91dGUuZ2V0KCkgOiBudWxsKSB8fCAnLydcblx0XHRcblx0XHQvLyBEZXRlcm1pbmUgd2hpY2ggbmF2IHRvIHNob3cgYmFzZWQgb24gY3VycmVudCBwYXRoXG5cdFx0Y29uc3QgaXNBcGlQYWdlID0gY3VycmVudFBhdGguc3RhcnRzV2l0aCgnL2FwaScpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdoeXBlcnNjcmlwdCcpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdyZW5kZXInKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygnbW91bnQnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygncm91dGUnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygncmVxdWVzdCcpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdwYXJzZVF1ZXJ5U3RyaW5nJykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ2J1aWxkUXVlcnlTdHJpbmcnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygnYnVpbGRQYXRobmFtZScpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdwYXJzZVBhdGhuYW1lJykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ3RydXN0JykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ2ZyYWdtZW50JykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ3JlZHJhdycpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdjZW5zb3InKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygnc3RyZWFtJylcblx0XHRjb25zdCBuYXZDb250ZW50ID0gaXNBcGlQYWdlID8gbmF2TWV0aG9kcyA6IG5hdkd1aWRlc1xuXHRcdFxuXHRcdHJldHVybiA8PlxuXHRcdFx0PGhlYWRlcj5cblx0XHRcdFx0PHNlY3Rpb24+XG5cdFx0XHRcdFx0PGEgY2xhc3M9XCJoYW1idXJnZXJcIiBocmVmPVwiamF2YXNjcmlwdDo7XCI+4omhPC9hPlxuXHRcdFx0XHRcdDxoMT5cblx0XHRcdFx0XHRcdDxpbWcgc3JjPVwiL2xvZ28uc3ZnXCIgYWx0PVwiTWl0aHJpbFwiIC8+XG5cdFx0XHRcdFx0XHRNaXRocmlsIDxzcGFuIGNsYXNzPVwidmVyc2lvblwiPnZ7dmVyc2lvbn08L3NwYW4+XG5cdFx0XHRcdFx0PC9oMT5cblx0XHRcdFx0XHQ8bmF2PlxuXHRcdFx0XHRcdFx0PG0ucm91dGUuTGluayBocmVmPVwiL1wiIHNlbGVjdG9yPVwiYVwiPkd1aWRlPC9tLnJvdXRlLkxpbms+XG5cdFx0XHRcdFx0XHQ8bS5yb3V0ZS5MaW5rIGhyZWY9XCIvYXBpLmh0bWxcIiBzZWxlY3Rvcj1cImFcIj5BUEk8L20ucm91dGUuTGluaz5cblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJodHRwczovL21pdGhyaWwuenVsaXBjaGF0LmNvbS9cIj5DaGF0PC9hPlxuXHRcdFx0XHRcdFx0PGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9NaXRocmlsSlMvbWl0aHJpbC5qc1wiPkdpdEh1YjwvYT5cblx0XHRcdFx0XHQ8L25hdj5cblx0XHRcdFx0XHR7bmF2Q29udGVudCA/IG0udHJ1c3QobmF2Q29udGVudCkgOiBudWxsfVxuXHRcdFx0XHQ8L3NlY3Rpb24+XG5cdFx0XHQ8L2hlYWRlcj5cblx0XHRcdDxtYWluPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiYm9keVwiPlxuXHRcdFx0XHRcdDxkaXYgaW5uZXJIVE1MPXtwYWdlLmNvbnRlbnR9IC8+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvb3RlclwiPlxuXHRcdFx0XHRcdFx0PGRpdj5MaWNlbnNlOiBNSVQuICZjb3B5OyBNaXRocmlsIENvbnRyaWJ1dG9ycy48L2Rpdj5cblx0XHRcdFx0XHRcdDxkaXY+PGEgaHJlZj17YGh0dHBzOi8vZ2l0aHViLmNvbS9NaXRocmlsSlMvZG9jcy9lZGl0L21haW4vZG9jcy8ke2N1cnJlbnRQYXRoLnJlcGxhY2UoJy5odG1sJywgJy5tZCcpLnJlcGxhY2UoL15cXC8vLCAnJyl9YH0+RWRpdDwvYT48L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L21haW4+XG5cdFx0PC8+XG5cdH1cblx0XG5cdG9uY3JlYXRlKHZub2RlOiBWbm9kZTxMYXlvdXRBdHRycz4pIHtcblx0XHQvLyBTZXR1cCBoYW1idXJnZXIgbWVudVxuXHRcdGNvbnN0IGhhbWJ1cmdlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oYW1idXJnZXInKVxuXHRcdGlmIChoYW1idXJnZXIpIHtcblx0XHRcdGhhbWJ1cmdlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9PT0gJ25hdmlnYXRpbmcnID8gJycgOiAnbmF2aWdhdGluZydcblx0XHRcdH0pXG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNldHVwIG5hdiBtZW51IGNsb3NlIG9uIGNsaWNrXG5cdFx0Y29uc3QgbmF2TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2gxICsgdWwnKVxuXHRcdGlmIChuYXZMaXN0KSB7XG5cdFx0XHRuYXZMaXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxufVxuIiwKICAgICJpbXBvcnQge01pdGhyaWxUc3hDb21wb25lbnQsIFZub2RlfSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCBtIGZyb20gJy4uLy4uLy4uL2luZGV4J1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gJy4vbGF5b3V0J1xuaW1wb3J0IHtEb2NQYWdlfSBmcm9tICcuLi9tYXJrZG93bidcblxuaW50ZXJmYWNlIERvY1BhZ2VBdHRycyB7XG5cdHBhZ2U6IERvY1BhZ2Vcblx0cm91dGVQYXRoPzogc3RyaW5nXG5cdG5hdkd1aWRlcz86IHN0cmluZ1xuXHRuYXZNZXRob2RzPzogc3RyaW5nXG5cdHZlcnNpb24/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIERvY1BhZ2VDb21wb25lbnQgZXh0ZW5kcyBNaXRocmlsVHN4Q29tcG9uZW50PERvY1BhZ2VBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxEb2NQYWdlQXR0cnM+KSB7XG5cdFx0cmV0dXJuIG0oTGF5b3V0IGFzIGFueSwge1xuXHRcdFx0cGFnZTogdm5vZGUuYXR0cnMucGFnZSxcblx0XHRcdHJvdXRlUGF0aDogdm5vZGUuYXR0cnMucm91dGVQYXRoLFxuXHRcdFx0bmF2R3VpZGVzOiB2bm9kZS5hdHRycy5uYXZHdWlkZXMsXG5cdFx0XHRuYXZNZXRob2RzOiB2bm9kZS5hdHRycy5uYXZNZXRob2RzLFxuXHRcdFx0dmVyc2lvbjogdm5vZGUuYXR0cnMudmVyc2lvbixcblx0XHR9KVxuXHR9XG59XG4iLAogICAgIi8qKlxuICogbWFya2VkIHYxNC4xLjQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMjQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkXG4gKi9cblxuLyoqXG4gKiBETyBOT1QgRURJVCBUSElTIEZJTEVcbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgZnJvbSBmaWxlcyBpbiAuL3NyYy9cbiAqL1xuXG4vKipcbiAqIEdldHMgdGhlIG9yaWdpbmFsIG1hcmtlZCBkZWZhdWx0IG9wdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIF9nZXREZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgIGJyZWFrczogZmFsc2UsXG4gICAgICAgIGV4dGVuc2lvbnM6IG51bGwsXG4gICAgICAgIGdmbTogdHJ1ZSxcbiAgICAgICAgaG9va3M6IG51bGwsXG4gICAgICAgIHBlZGFudGljOiBmYWxzZSxcbiAgICAgICAgcmVuZGVyZXI6IG51bGwsXG4gICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgIHRva2VuaXplcjogbnVsbCxcbiAgICAgICAgd2Fsa1Rva2VuczogbnVsbCxcbiAgICB9O1xufVxubGV0IF9kZWZhdWx0cyA9IF9nZXREZWZhdWx0cygpO1xuZnVuY3Rpb24gY2hhbmdlRGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBfZGVmYXVsdHMgPSBuZXdEZWZhdWx0cztcbn1cblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cbmNvbnN0IGVzY2FwZVRlc3QgPSAvWyY8PlwiJ10vO1xuY29uc3QgZXNjYXBlUmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdC5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVUZXN0Tm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hKCNcXGR7MSw3fXwjW1h4XVthLWZBLUYwLTldezEsNn18XFx3Kyk7KS87XG5jb25zdCBlc2NhcGVSZXBsYWNlTm9FbmNvZGUgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3ROb0VuY29kZS5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVSZXBsYWNlbWVudHMgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxufTtcbmNvbnN0IGdldEVzY2FwZVJlcGxhY2VtZW50ID0gKGNoKSA9PiBlc2NhcGVSZXBsYWNlbWVudHNbY2hdO1xuZnVuY3Rpb24gZXNjYXBlJDEoaHRtbCwgZW5jb2RlKSB7XG4gICAgaWYgKGVuY29kZSkge1xuICAgICAgICBpZiAoZXNjYXBlVGVzdC50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2UsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGVzY2FwZVRlc3ROb0VuY29kZS50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBodG1sO1xufVxuY29uc3QgY2FyZXQgPSAvKF58W15cXFtdKVxcXi9nO1xuZnVuY3Rpb24gZWRpdChyZWdleCwgb3B0KSB7XG4gICAgbGV0IHNvdXJjZSA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcbiAgICBvcHQgPSBvcHQgfHwgJyc7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICByZXBsYWNlOiAobmFtZSwgdmFsKSA9PiB7XG4gICAgICAgICAgICBsZXQgdmFsU291cmNlID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgPyB2YWwgOiB2YWwuc291cmNlO1xuICAgICAgICAgICAgdmFsU291cmNlID0gdmFsU291cmNlLnJlcGxhY2UoY2FyZXQsICckMScpO1xuICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmFtZSwgdmFsU291cmNlKTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFJlZ2V4OiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIG9wdCk7XG4gICAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gY2xlYW5VcmwoaHJlZikge1xuICAgIHRyeSB7XG4gICAgICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBocmVmO1xufVxuY29uc3Qgbm9vcFRlc3QgPSB7IGV4ZWM6ICgpID0+IG51bGwgfTtcbmZ1bmN0aW9uIHNwbGl0Q2VsbHModGFibGVSb3csIGNvdW50KSB7XG4gICAgLy8gZW5zdXJlIHRoYXQgZXZlcnkgY2VsbC1kZWxpbWl0aW5nIHBpcGUgaGFzIGEgc3BhY2VcbiAgICAvLyBiZWZvcmUgaXQgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBlc2NhcGVkIHBpcGVcbiAgICBjb25zdCByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgKG1hdGNoLCBvZmZzZXQsIHN0cikgPT4ge1xuICAgICAgICBsZXQgZXNjYXBlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgY3VyciA9IG9mZnNldDtcbiAgICAgICAgd2hpbGUgKC0tY3VyciA+PSAwICYmIHN0cltjdXJyXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAgICAgLy8gc28gd2UgbGVhdmUgaXQgYWxvbmVcbiAgICAgICAgICAgIHJldHVybiAnfCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBhZGQgc3BhY2UgYmVmb3JlIHVuZXNjYXBlZCB8XG4gICAgICAgICAgICByZXR1cm4gJyB8JztcbiAgICAgICAgfVxuICAgIH0pLCBjZWxscyA9IHJvdy5zcGxpdCgvIFxcfC8pO1xuICAgIGxldCBpID0gMDtcbiAgICAvLyBGaXJzdC9sYXN0IGNlbGwgaW4gYSByb3cgY2Fubm90IGJlIGVtcHR5IGlmIGl0IGhhcyBubyBsZWFkaW5nL3RyYWlsaW5nIHBpcGVcbiAgICBpZiAoIWNlbGxzWzBdLnRyaW0oKSkge1xuICAgICAgICBjZWxscy5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAoY2VsbHMubGVuZ3RoID4gMCAmJiAhY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udHJpbSgpKSB7XG4gICAgICAgIGNlbGxzLnBvcCgpO1xuICAgIH1cbiAgICBpZiAoY291bnQpIHtcbiAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA+IGNvdW50KSB7XG4gICAgICAgICAgICBjZWxscy5zcGxpY2UoY291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KVxuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goJycpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGlzIGlnbm9yZWQgcGVyIHRoZSBnZm0gc3BlY1xuICAgICAgICBjZWxsc1tpXSA9IGNlbGxzW2ldLnRyaW0oKS5yZXBsYWNlKC9cXFxcXFx8L2csICd8Jyk7XG4gICAgfVxuICAgIHJldHVybiBjZWxscztcbn1cbi8qKlxuICogUmVtb3ZlIHRyYWlsaW5nICdjJ3MuIEVxdWl2YWxlbnQgdG8gc3RyLnJlcGxhY2UoL2MqJC8sICcnKS5cbiAqIC9jKiQvIGlzIHZ1bG5lcmFibGUgdG8gUkVET1MuXG4gKlxuICogQHBhcmFtIHN0clxuICogQHBhcmFtIGNcbiAqIEBwYXJhbSBpbnZlcnQgUmVtb3ZlIHN1ZmZpeCBvZiBub24tYyBjaGFycyBpbnN0ZWFkLiBEZWZhdWx0IGZhbHNleS5cbiAqL1xuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgICBpZiAobCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIC8vIExlbmd0aCBvZiBzdWZmaXggbWF0Y2hpbmcgdGhlIGludmVydCBjb25kaXRpb24uXG4gICAgbGV0IHN1ZmZMZW4gPSAwO1xuICAgIC8vIFN0ZXAgbGVmdCB1bnRpbCB3ZSBmYWlsIHRvIG1hdGNoIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICAgIHdoaWxlIChzdWZmTGVuIDwgbCkge1xuICAgICAgICBjb25zdCBjdXJyQ2hhciA9IHN0ci5jaGFyQXQobCAtIHN1ZmZMZW4gLSAxKTtcbiAgICAgICAgaWYgKGN1cnJDaGFyID09PSBjICYmICFpbnZlcnQpIHtcbiAgICAgICAgICAgIHN1ZmZMZW4rKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdXJyQ2hhciAhPT0gYyAmJiBpbnZlcnQpIHtcbiAgICAgICAgICAgIHN1ZmZMZW4rKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHIuc2xpY2UoMCwgbCAtIHN1ZmZMZW4pO1xufVxuZnVuY3Rpb24gZmluZENsb3NpbmdCcmFja2V0KHN0ciwgYikge1xuICAgIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBsZXQgbGV2ZWwgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdHJbaV0gPT09ICdcXFxcJykge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0cltpXSA9PT0gYlswXSkge1xuICAgICAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgICAgICAgIGxldmVsLS07XG4gICAgICAgICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBvdXRwdXRMaW5rKGNhcCwgbGluaywgcmF3LCBsZXhlcikge1xuICAgIGNvbnN0IGhyZWYgPSBsaW5rLmhyZWY7XG4gICAgY29uc3QgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlJDEobGluay50aXRsZSkgOiBudWxsO1xuICAgIGNvbnN0IHRleHQgPSBjYXBbMV0ucmVwbGFjZSgvXFxcXChbXFxbXFxdXSkvZywgJyQxJyk7XG4gICAgaWYgKGNhcFswXS5jaGFyQXQoMCkgIT09ICchJykge1xuICAgICAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0b2tlbnM6IGxleGVyLmlubGluZVRva2Vucyh0ZXh0KSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcmF3LFxuICAgICAgICBocmVmLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgdGV4dDogZXNjYXBlJDEodGV4dCksXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCB0ZXh0KSB7XG4gICAgY29uc3QgbWF0Y2hJbmRlbnRUb0NvZGUgPSByYXcubWF0Y2goL14oXFxzKykoPzpgYGApLyk7XG4gICAgaWYgKG1hdGNoSW5kZW50VG9Db2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRUb0NvZGUgPSBtYXRjaEluZGVudFRvQ29kZVsxXTtcbiAgICByZXR1cm4gdGV4dFxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoSW5kZW50SW5Ob2RlID0gbm9kZS5tYXRjaCgvXlxccysvKTtcbiAgICAgICAgaWYgKG1hdGNoSW5kZW50SW5Ob2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbaW5kZW50SW5Ob2RlXSA9IG1hdGNoSW5kZW50SW5Ob2RlO1xuICAgICAgICBpZiAoaW5kZW50SW5Ob2RlLmxlbmd0aCA+PSBpbmRlbnRUb0NvZGUubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5zbGljZShpbmRlbnRUb0NvZGUubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9KVxuICAgICAgICAuam9pbignXFxuJyk7XG59XG4vKipcbiAqIFRva2VuaXplclxuICovXG5jbGFzcyBfVG9rZW5pemVyIHtcbiAgICBvcHRpb25zO1xuICAgIHJ1bGVzOyAvLyBzZXQgYnkgdGhlIGxleGVyXG4gICAgbGV4ZXI7IC8vIHNldCBieSB0aGUgbGV4ZXJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgX2RlZmF1bHRzO1xuICAgIH1cbiAgICBzcGFjZShzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5uZXdsaW5lLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCAmJiBjYXBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3BhY2UnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2RlKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14oPzogezEsNH18IHswLDN9XFx0KS9nbSwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICAgICAgY29kZUJsb2NrU3R5bGU6ICdpbmRlbnRlZCcsXG4gICAgICAgICAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgICAgICAgICA/IHJ0cmltKHRleHQsICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICA6IHRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZlbmNlcyhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBjb25zdCByYXcgPSBjYXBbMF07XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIGNhcFszXSB8fCAnJyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgICAgICAgICByYXcsXG4gICAgICAgICAgICAgICAgbGFuZzogY2FwWzJdID8gY2FwWzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLCAnJDEnKSA6IGNhcFsyXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBoZWFkaW5nKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNhcFsyXS50cmltKCk7XG4gICAgICAgICAgICAvLyByZW1vdmUgdHJhaWxpbmcgI3NcbiAgICAgICAgICAgIGlmICgvIyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkID0gcnRyaW0odGV4dCwgJyMnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXRyaW1tZWQgfHwgLyAkLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbW1vbk1hcmsgcmVxdWlyZXMgc3BhY2UgYmVmb3JlIHRyYWlsaW5nICNzXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGhyKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaHInLFxuICAgICAgICAgICAgICAgIHJhdzogcnRyaW0oY2FwWzBdLCAnXFxuJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGJsb2NrcXVvdGUoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suYmxvY2txdW90ZS5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCBsaW5lcyA9IHJ0cmltKGNhcFswXSwgJ1xcbicpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIGxldCByYXcgPSAnJztcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgICAgICBjb25zdCB0b2tlbnMgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlIChsaW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGluQmxvY2txdW90ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBpO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgbGluZXMgdXAgdG8gYSBjb250aW51YXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eIHswLDN9Pi8udGVzdChsaW5lc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMaW5lcy5wdXNoKGxpbmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluQmxvY2txdW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWluQmxvY2txdW90ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudExpbmVzLnB1c2gobGluZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGluZXMgPSBsaW5lcy5zbGljZShpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50UmF3ID0gY3VycmVudExpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUZXh0ID0gY3VycmVudFJhd1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmVjZWRlIHNldGV4dCBjb250aW51YXRpb24gd2l0aCA0IHNwYWNlcyBzbyBpdCBpc24ndCBhIHNldGV4dFxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuIHswLDN9KCg/Oj0rfC0rKSAqKSg/PVxcbnwkKS9nLCAnXFxuICAgICQxJylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14gezAsM30+WyBcXHRdPy9nbSwgJycpO1xuICAgICAgICAgICAgICAgIHJhdyA9IHJhdyA/IGAke3Jhd31cXG4ke2N1cnJlbnRSYXd9YCA6IGN1cnJlbnRSYXc7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQgPyBgJHt0ZXh0fVxcbiR7Y3VycmVudFRleHR9YCA6IGN1cnJlbnRUZXh0O1xuICAgICAgICAgICAgICAgIC8vIHBhcnNlIGJsb2NrcXVvdGUgbGluZXMgYXMgdG9wIGxldmVsIHRva2Vuc1xuICAgICAgICAgICAgICAgIC8vIG1lcmdlIHBhcmFncmFwaHMgaWYgdGhpcyBpcyBhIGNvbnRpbnVhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGV4ZXIuc3RhdGUudG9wO1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKGN1cnJlbnRUZXh0LCB0b2tlbnMsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdG9wO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGNvbnRpbnVhdGlvbiB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuPy50eXBlID09PSAnY29kZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYmxvY2txdW90ZSBjb250aW51YXRpb24gY2Fubm90IGJlIHByZWNlZGVkIGJ5IGEgY29kZSBibG9ja1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobGFzdFRva2VuPy50eXBlID09PSAnYmxvY2txdW90ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jbHVkZSBjb250aW51YXRpb24gaW4gbmVzdGVkIGJsb2NrcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVG9rZW4gPSBsYXN0VG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSBvbGRUb2tlbi5yYXcgKyAnXFxuJyArIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUb2tlbiA9IHRoaXMuYmxvY2txdW90ZShuZXdUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IG5ld1Rva2VuO1xuICAgICAgICAgICAgICAgICAgICByYXcgPSByYXcuc3Vic3RyaW5nKDAsIHJhdy5sZW5ndGggLSBvbGRUb2tlbi5yYXcubGVuZ3RoKSArIG5ld1Rva2VuLnJhdztcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoIC0gb2xkVG9rZW4udGV4dC5sZW5ndGgpICsgbmV3VG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxhc3RUb2tlbj8udHlwZSA9PT0gJ2xpc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluY2x1ZGUgY29udGludWF0aW9uIGluIG5lc3RlZCBsaXN0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFRva2VuID0gbGFzdFRva2VuO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUZXh0ID0gb2xkVG9rZW4ucmF3ICsgJ1xcbicgKyBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VG9rZW4gPSB0aGlzLmxpc3QobmV3VGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gPSBuZXdUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgcmF3ID0gcmF3LnN1YnN0cmluZygwLCByYXcubGVuZ3RoIC0gbGFzdFRva2VuLnJhdy5sZW5ndGgpICsgbmV3VG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggLSBvbGRUb2tlbi5yYXcubGVuZ3RoKSArIG5ld1Rva2VuLnJhdztcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBuZXdUZXh0LnN1YnN0cmluZyh0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLnJhdy5sZW5ndGgpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2txdW90ZScsXG4gICAgICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgICAgIHRva2VucyxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaXN0KHNyYykge1xuICAgICAgICBsZXQgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saXN0LmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgbGV0IGJ1bGwgPSBjYXBbMV0udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgaXNvcmRlcmVkID0gYnVsbC5sZW5ndGggPiAxO1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICAgICAgcmF3OiAnJyxcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiBpc29yZGVyZWQsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsLnNsaWNlKDAsIC0xKSA6ICcnLFxuICAgICAgICAgICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGBcXFxcZHsxLDl9XFxcXCR7YnVsbC5zbGljZSgtMSl9YCA6IGBcXFxcJHtidWxsfWA7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGJ1bGwgOiAnWyorLV0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IG5leHQgbGlzdCBpdGVtXG4gICAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSBuZXcgUmVnRXhwKGBeKCB7MCwzfSR7YnVsbH0pKCg/OltcXHQgXVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgICBsZXQgZW5kc1dpdGhCbGFua0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgYnVsbGV0IHBvaW50IGNhbiBzdGFydCBhIG5ldyBMaXN0IEl0ZW1cbiAgICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZW5kRWFybHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgcmF3ID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1Db250ZW50cyA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICghKGNhcCA9IGl0ZW1SZWdleC5leGVjKHNyYykpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ydWxlcy5ibG9jay5oci50ZXN0KHNyYykpIHsgLy8gRW5kIGxpc3QgaWYgYnVsbGV0IHdhcyBhY3R1YWxseSBIUiAocG9zc2libHkgbW92ZSBpbnRvIGl0ZW1SZWdleD8pXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYXcgPSBjYXBbMF07XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZSA9IGNhcFsyXS5zcGxpdCgnXFxuJywgMSlbMF0ucmVwbGFjZSgvXlxcdCsvLCAodCkgPT4gJyAnLnJlcGVhdCgzICogdC5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dExpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgICAgIGxldCBibGFua0xpbmUgPSAhbGluZS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAyO1xuICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnRyaW1TdGFydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChibGFua0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gY2FwWzFdLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBjYXBbMl0uc2VhcmNoKC9bXiBdLyk7IC8vIEZpbmQgZmlyc3Qgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gaW5kZW50ID4gNCA/IDEgOiBpbmRlbnQ7IC8vIFRyZWF0IGluZGVudGVkIGNvZGUgYmxvY2tzICg+IDQgc3BhY2VzKSBhcyBoYXZpbmcgb25seSAxIGluZGVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSBjYXBbMV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lICYmIC9eWyBcXHRdKiQvLnRlc3QobmV4dExpbmUpKSB7IC8vIEl0ZW1zIGJlZ2luIHdpdGggYXQgbW9zdCBvbmUgYmxhbmsgbGluZVxuICAgICAgICAgICAgICAgICAgICByYXcgKz0gbmV4dExpbmUgKyAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhuZXh0TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kRWFybHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVuZEVhcmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRCdWxsZXRSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86WyorLV18XFxcXGR7MSw5fVsuKV0pKCg/OlsgXFx0XVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhyUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlbmNlc0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlxcYFxcYFxcYHx+fn4pYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRpbmdCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0jYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX08KD86W2Etel0uKj58IS0tKWAsICdpJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGxvd2luZyBsaW5lcyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gTGlzdCBJdGVtXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0xpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRMaW5lV2l0aG91dFRhYnM7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0TGluZSA9IHJhd0xpbmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZS1hbGlnbiB0byBmb2xsb3cgY29tbW9ubWFyayBuZXN0aW5nIHJ1bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dExpbmUgPSBuZXh0TGluZS5yZXBsYWNlKC9eIHsxLDR9KD89KCB7NH0pKlteIF0pL2csICcgICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRMaW5lV2l0aG91dFRhYnMgPSBuZXh0TGluZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRMaW5lV2l0aG91dFRhYnMgPSBuZXh0TGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgY29kZSBmZW5jZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBoZWFkaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgaHRtbCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWxCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBidWxsZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0QnVsbGV0UmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgcnVsZSBmb3VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGluZVdpdGhvdXRUYWJzLnNlYXJjaCgvW14gXS8pID49IGluZGVudCB8fCAhbmV4dExpbmUudHJpbSgpKSB7IC8vIERlZGVudCBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lV2l0aG91dFRhYnMuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBlbm91Z2ggaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwYXJhZ3JhcGggY29udGludWF0aW9uIHVubGVzcyBsYXN0IGxpbmUgd2FzIGEgZGlmZmVyZW50IGJsb2NrIGxldmVsIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKS5zZWFyY2goL1teIF0vKSA+PSA0KSB7IC8vIGluZGVudGVkIGNvZGUgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmxhbmtMaW5lICYmICFuZXh0TGluZS50cmltKCkpIHsgLy8gQ2hlY2sgaWYgY3VycmVudCBsaW5lIGlzIGJsYW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdyArPSByYXdMaW5lICsgJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhd0xpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV4dExpbmVXaXRob3V0VGFicy5zbGljZShpbmRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgaXRlbSBlbmRlZCB3aXRoIGEgYmxhbmsgbGluZSwgdGhlIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoQmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Lmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgvXFxuWyBcXHRdKlxcblsgXFx0XSokLy50ZXN0KHJhdykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNXaXRoQmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaXN0YXNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsZXQgaXNjaGVja2VkO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciB0YXNrIGxpc3QgaXRlbXNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgICAgICAgICAgICAgICBpc3Rhc2sgPSAvXlxcW1sgeFhdXFxdIC8uZXhlYyhpdGVtQ29udGVudHMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXN0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc2NoZWNrZWQgPSBpc3Rhc2tbMF0gIT09ICdbIF0gJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGl0ZW1Db250ZW50cy5yZXBsYWNlKC9eXFxbWyB4WF1cXF0gKy8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsaXN0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgICAgICAgICB0YXNrOiAhIWlzdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogaXNjaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW1Db250ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBbXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsaXN0LnJhdyArPSByYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEbyBub3QgY29uc3VtZSBuZXdsaW5lcyBhdCBlbmQgb2YgZmluYWwgaXRlbS4gQWx0ZXJuYXRpdmVseSwgbWFrZSBpdGVtUmVnZXggKnN0YXJ0KiB3aXRoIGFueSBuZXdsaW5lcyB0byBzaW1wbGlmeS9zcGVlZCB1cCBlbmRzV2l0aEJsYW5rTGluZSBsb2dpY1xuICAgICAgICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnJhdyA9IGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS5yYXcudHJpbUVuZCgpO1xuICAgICAgICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnRleHQgPSBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0udGV4dC50cmltRW5kKCk7XG4gICAgICAgICAgICBsaXN0LnJhdyA9IGxpc3QucmF3LnRyaW1FbmQoKTtcbiAgICAgICAgICAgIC8vIEl0ZW0gY2hpbGQgdG9rZW5zIGhhbmRsZWQgaGVyZSBhdCBlbmQgYmVjYXVzZSB3ZSBuZWVkZWQgdG8gaGF2ZSB0aGUgZmluYWwgaXRlbSB0byB0cmltIGl0IGZpcnN0XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxpc3QuaXRlbXNbaV0udG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2VucyhsaXN0Lml0ZW1zW2ldLnRleHQsIFtdKTtcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgbGlzdCBzaG91bGQgYmUgbG9vc2VcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BhY2VycyA9IGxpc3QuaXRlbXNbaV0udG9rZW5zLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc011bHRpcGxlTGluZUJyZWFrcyA9IHNwYWNlcnMubGVuZ3RoID4gMCAmJiBzcGFjZXJzLnNvbWUodCA9PiAvXFxuLipcXG4vLnRlc3QodC5yYXcpKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5sb29zZSA9IGhhc011bHRpcGxlTGluZUJyZWFrcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZXQgYWxsIGl0ZW1zIHRvIGxvb3NlIGlmIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICAgIGlmIChsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuaXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGh0bWwoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHRtbC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICBibG9jazogdHJ1ZSxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBwcmU6IGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScsXG4gICAgICAgICAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWYoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZGVmLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdGFnID0gY2FwWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGNhcFsyXSA/IGNhcFsyXS5yZXBsYWNlKC9ePCguKik+JC8sICckMScpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogJyc7XG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zdWJzdHJpbmcoMSwgY2FwWzNdLmxlbmd0aCAtIDEpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogY2FwWzNdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGVmJyxcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICAgICAgaHJlZixcbiAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGFibGUoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGFibGUuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoIWNhcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL1s6fF0vLnRlc3QoY2FwWzJdKSkge1xuICAgICAgICAgICAgLy8gZGVsaW1pdGVyIHJvdyBtdXN0IGhhdmUgYSBwaXBlICh8KSBvciBjb2xvbiAoOikgb3RoZXJ3aXNlIGl0IGlzIGEgc2V0ZXh0IGhlYWRpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJzID0gc3BsaXRDZWxscyhjYXBbMV0pO1xuICAgICAgICBjb25zdCBhbGlnbnMgPSBjYXBbMl0ucmVwbGFjZSgvXlxcfHxcXHwgKiQvZywgJycpLnNwbGl0KCd8Jyk7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBjYXBbM10gJiYgY2FwWzNdLnRyaW0oKSA/IGNhcFszXS5yZXBsYWNlKC9cXG5bIFxcdF0qJC8sICcnKS5zcGxpdCgnXFxuJykgOiBbXTtcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgIGhlYWRlcjogW10sXG4gICAgICAgICAgICBhbGlnbjogW10sXG4gICAgICAgICAgICByb3dzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGhlYWRlcnMubGVuZ3RoICE9PSBhbGlnbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBoZWFkZXIgYW5kIGFsaWduIGNvbHVtbnMgbXVzdCBiZSBlcXVhbCwgcm93cyBjYW4gYmUgZGlmZmVyZW50LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYWxpZ24gb2YgYWxpZ25zKSB7XG4gICAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ3JpZ2h0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ2NlbnRlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW0uYWxpZ24ucHVzaChudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZW0uaGVhZGVyLnB1c2goe1xuICAgICAgICAgICAgICAgIHRleHQ6IGhlYWRlcnNbaV0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShoZWFkZXJzW2ldKSxcbiAgICAgICAgICAgICAgICBoZWFkZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgYWxpZ246IGl0ZW0uYWxpZ25baV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICBpdGVtLnJvd3MucHVzaChzcGxpdENlbGxzKHJvdywgaXRlbS5oZWFkZXIubGVuZ3RoKS5tYXAoKGNlbGwsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjZWxsLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNlbGwpLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbjogaXRlbS5hbGlnbltpXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbiAgICBsaGVhZGluZyhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saGVhZGluZy5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXBbMV0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMV0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhZ3JhcGgoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sucGFyYWdyYXBoLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgICAgICAgIDogY2FwWzFdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHRleHQoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGV4dC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIHRleHQ6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFswXSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGVzY2FwZShzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZXNjYXBlLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBlc2NhcGUkMShjYXBbMV0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0YWcoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRhZy5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjwocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBpbkxpbms6IHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLFxuICAgICAgICAgICAgICAgIGluUmF3QmxvY2s6IHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayxcbiAgICAgICAgICAgICAgICBibG9jazogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaW5rKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZFVybCA9IGNhcFsyXS50cmltKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAvXjwvLnRlc3QodHJpbW1lZFVybCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjb21tb25tYXJrIHJlcXVpcmVzIG1hdGNoaW5nIGFuZ2xlIGJyYWNrZXRzXG4gICAgICAgICAgICAgICAgaWYgKCEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVuZGluZyBhbmdsZSBicmFja2V0IGNhbm5vdCBiZSBlc2NhcGVkXG4gICAgICAgICAgICAgICAgY29uc3QgcnRyaW1TbGFzaCA9IHJ0cmltKHRyaW1tZWRVcmwuc2xpY2UoMCwgLTEpLCAnXFxcXCcpO1xuICAgICAgICAgICAgICAgIGlmICgodHJpbW1lZFVybC5sZW5ndGggLSBydHJpbVNsYXNoLmxlbmd0aCkgJSAyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmaW5kIGNsb3NpbmcgcGFyZW50aGVzaXNcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UGFyZW5JbmRleCA9IGZpbmRDbG9zaW5nQnJhY2tldChjYXBbMl0sICcoKScpO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyZW5JbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gY2FwWzBdLmluZGV4T2YoJyEnKSA9PT0gMCA/IDUgOiA0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rTGVuID0gc3RhcnQgKyBjYXBbMV0ubGVuZ3RoICsgbGFzdFBhcmVuSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGhyZWYgPSBjYXBbMl07XG4gICAgICAgICAgICBsZXQgdGl0bGUgPSAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICAgICAgICAvLyBzcGxpdCBwZWRhbnRpYyBocmVmIGFuZCB0aXRsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSAvXihbXidcIl0qW15cXHNdKVxccysoWydcIl0pKC4qKVxcMi8uZXhlYyhocmVmKTtcbiAgICAgICAgICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gbGlua1sxXTtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHJlZiA9IGhyZWYudHJpbSgpO1xuICAgICAgICAgICAgaWYgKC9ePC8udGVzdChocmVmKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBlZGFudGljIGFsbG93cyBzdGFydGluZyBhbmdsZSBicmFja2V0IHdpdGhvdXQgZW5kaW5nIGFuZ2xlIGJyYWNrZXRcbiAgICAgICAgICAgICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZiA/IGhyZWYucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbiwgJyQxJykgOiBocmVmLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSA/IHRpdGxlLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogdGl0bGUsXG4gICAgICAgICAgICB9LCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZmxpbmsoc3JjLCBsaW5rcykge1xuICAgICAgICBsZXQgY2FwO1xuICAgICAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5rU3RyaW5nID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBsaW5rc1tsaW5rU3RyaW5nLnRvTG93ZXJDYXNlKCldO1xuICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwgbGluaywgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIgPSAnJykge1xuICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ0xEZWxpbS5leGVjKHNyYyk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIF8gY2FuJ3QgYmUgYmV0d2VlbiB0d28gYWxwaGFudW1lcmljcy4gXFxwe0x9XFxwe059IGluY2x1ZGVzIG5vbi1lbmdsaXNoIGFscGhhYmV0L251bWJlcnMgYXMgd2VsbFxuICAgICAgICBpZiAobWF0Y2hbM10gJiYgcHJldkNoYXIubWF0Y2goL1tcXHB7TH1cXHB7Tn1dL3UpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBuZXh0Q2hhciA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8ICcnO1xuICAgICAgICBpZiAoIW5leHRDaGFyIHx8ICFwcmV2Q2hhciB8fCB0aGlzLnJ1bGVzLmlubGluZS5wdW5jdHVhdGlvbi5leGVjKHByZXZDaGFyKSkge1xuICAgICAgICAgICAgLy8gdW5pY29kZSBSZWdleCBjb3VudHMgZW1vamkgYXMgMSBjaGFyOyBzcHJlYWQgaW50byBhcnJheSBmb3IgcHJvcGVyIGNvdW50ICh1c2VkIG11bHRpcGxlIHRpbWVzIGJlbG93KVxuICAgICAgICAgICAgY29uc3QgbExlbmd0aCA9IFsuLi5tYXRjaFswXV0ubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGxldCByRGVsaW0sIHJMZW5ndGgsIGRlbGltVG90YWwgPSBsTGVuZ3RoLCBtaWREZWxpbVRvdGFsID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGVuZFJlZyA9IG1hdGNoWzBdWzBdID09PSAnKicgPyB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ1JEZWxpbUFzdCA6IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nUkRlbGltVW5kO1xuICAgICAgICAgICAgZW5kUmVnLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAvLyBDbGlwIG1hc2tlZFNyYyB0byBzYW1lIHNlY3Rpb24gb2Ygc3RyaW5nIGFzIHNyYyAobW92ZSB0byBsZXhlcj8pXG4gICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoLTEgKiBzcmMubGVuZ3RoICsgbExlbmd0aCk7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gZW5kUmVnLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJEZWxpbSA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8IG1hdGNoWzNdIHx8IG1hdGNoWzRdIHx8IG1hdGNoWzVdIHx8IG1hdGNoWzZdO1xuICAgICAgICAgICAgICAgIGlmICghckRlbGltKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gc2tpcCBzaW5nbGUgKiBpbiBfX2FiYyphYmNfX1xuICAgICAgICAgICAgICAgIHJMZW5ndGggPSBbLi4uckRlbGltXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoWzNdIHx8IG1hdGNoWzRdKSB7IC8vIGZvdW5kIGFub3RoZXIgTGVmdCBEZWxpbVxuICAgICAgICAgICAgICAgICAgICBkZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtYXRjaFs1XSB8fCBtYXRjaFs2XSkgeyAvLyBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbVxuICAgICAgICAgICAgICAgICAgICBpZiAobExlbmd0aCAlIDMgJiYgISgobExlbmd0aCArIHJMZW5ndGgpICUgMykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZERlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBDb21tb25NYXJrIEVtcGhhc2lzIFJ1bGVzIDktMTBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxpbVRvdGFsIC09IHJMZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRlbGltVG90YWwgPiAwKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gSGF2ZW4ndCBmb3VuZCBlbm91Z2ggY2xvc2luZyBkZWxpbWl0ZXJzXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGV4dHJhIGNoYXJhY3RlcnMuICphKioqIC0+ICphKlxuICAgICAgICAgICAgICAgIHJMZW5ndGggPSBNYXRoLm1pbihyTGVuZ3RoLCByTGVuZ3RoICsgZGVsaW1Ub3RhbCArIG1pZERlbGltVG90YWwpO1xuICAgICAgICAgICAgICAgIC8vIGNoYXIgbGVuZ3RoIGNhbiBiZSA+MSBmb3IgdW5pY29kZSBjaGFyYWN0ZXJzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDaGFyTGVuZ3RoID0gWy4uLm1hdGNoWzBdXVswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gc3JjLnNsaWNlKDAsIGxMZW5ndGggKyBtYXRjaC5pbmRleCArIGxhc3RDaGFyTGVuZ3RoICsgckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGBlbWAgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBvZGQgY2hhciBjb3VudC4gKmEqKipcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5taW4obExlbmd0aCwgckxlbmd0aCkgJSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgJ3N0cm9uZycgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBldmVuIGNoYXIgY291bnQuICoqYSoqKlxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMiwgLTIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJvbmcnLFxuICAgICAgICAgICAgICAgICAgICByYXcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2Rlc3BhbihzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnJlcGxhY2UoL1xcbi9nLCAnICcpO1xuICAgICAgICAgICAgY29uc3QgaGFzTm9uU3BhY2VDaGFycyA9IC9bXiBdLy50ZXN0KHRleHQpO1xuICAgICAgICAgICAgY29uc3QgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMgPSAvXiAvLnRlc3QodGV4dCkgJiYgLyAkLy50ZXN0KHRleHQpO1xuICAgICAgICAgICAgaWYgKGhhc05vblNwYWNlQ2hhcnMgJiYgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMSh0ZXh0LCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvZGVzcGFuJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBicihzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYnIuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdicicsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlbChzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZGVsLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGVsJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXBbMl0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2VucyhjYXBbMl0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhdXRvbGluayhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYXV0b2xpbmsuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgICAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMShjYXBbMV0pO1xuICAgICAgICAgICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGVzY2FwZSQxKGNhcFsxXSk7XG4gICAgICAgICAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXJsKHNyYykge1xuICAgICAgICBsZXQgY2FwO1xuICAgICAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudXJsLmV4ZWMoc3JjKSkge1xuICAgICAgICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICAgICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZXNjYXBlJDEoY2FwWzBdKTtcbiAgICAgICAgICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcmV2Q2FwWmVybztcbiAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZDYXBaZXJvID0gY2FwWzBdO1xuICAgICAgICAgICAgICAgICAgICBjYXBbMF0gPSB0aGlzLnJ1bGVzLmlubGluZS5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKT8uWzBdID8/ICcnO1xuICAgICAgICAgICAgICAgIH0gd2hpbGUgKHByZXZDYXBaZXJvICE9PSBjYXBbMF0pO1xuICAgICAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMShjYXBbMF0pO1xuICAgICAgICAgICAgICAgIGlmIChjYXBbMV0gPT09ICd3d3cuJykge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gJ2h0dHA6Ly8nICsgY2FwWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaHJlZiA9IGNhcFswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5saW5lVGV4dChzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCB0ZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaykge1xuICAgICAgICAgICAgICAgIHRleHQgPSBjYXBbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZXNjYXBlJDEoY2FwWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgbmV3bGluZSA9IC9eKD86WyBcXHRdKig/OlxcbnwkKSkrLztcbmNvbnN0IGJsb2NrQ29kZSA9IC9eKCg/OiB7NH18IHswLDN9XFx0KVteXFxuXSsoPzpcXG4oPzpbIFxcdF0qKD86XFxufCQpKSopPykrLztcbmNvbnN0IGZlbmNlcyA9IC9eIHswLDN9KGB7Myx9KD89W15gXFxuXSooPzpcXG58JCkpfH57Myx9KShbXlxcbl0qKSg/OlxcbnwkKSg/OnwoW1xcc1xcU10qPykoPzpcXG58JCkpKD86IHswLDN9XFwxW35gXSogKig/PVxcbnwkKXwkKS87XG5jb25zdCBociA9IC9eIHswLDN9KCg/Oi1bXFx0IF0qKXszLH18KD86X1sgXFx0XSopezMsfXwoPzpcXCpbIFxcdF0qKXszLH0pKD86XFxuK3wkKS87XG5jb25zdCBoZWFkaW5nID0gL14gezAsM30oI3sxLDZ9KSg/PVxcc3wkKSguKikoPzpcXG4rfCQpLztcbmNvbnN0IGJ1bGxldCA9IC8oPzpbKistXXxcXGR7MSw5fVsuKV0pLztcbmNvbnN0IGxoZWFkaW5nID0gZWRpdCgvXig/IWJ1bGwgfGJsb2NrQ29kZXxmZW5jZXN8YmxvY2txdW90ZXxoZWFkaW5nfGh0bWwpKCg/Oi58XFxuKD8hXFxzKj9cXG58YnVsbCB8YmxvY2tDb2RlfGZlbmNlc3xibG9ja3F1b3RlfGhlYWRpbmd8aHRtbCkpKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8pXG4gICAgLnJlcGxhY2UoL2J1bGwvZywgYnVsbGV0KSAvLyBsaXN0cyBjYW4gaW50ZXJydXB0XG4gICAgLnJlcGxhY2UoL2Jsb2NrQ29kZS9nLCAvKD86IHs0fXwgezAsM31cXHQpLykgLy8gaW5kZW50ZWQgY29kZSBibG9ja3MgY2FuIGludGVycnVwdFxuICAgIC5yZXBsYWNlKC9mZW5jZXMvZywgLyB7MCwzfSg/OmB7Myx9fH57Myx9KS8pIC8vIGZlbmNlZCBjb2RlIGJsb2NrcyBjYW4gaW50ZXJydXB0XG4gICAgLnJlcGxhY2UoL2Jsb2NrcXVvdGUvZywgLyB7MCwzfT4vKSAvLyBibG9ja3F1b3RlIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgvaGVhZGluZy9nLCAvIHswLDN9I3sxLDZ9LykgLy8gQVRYIGhlYWRpbmcgY2FuIGludGVycnVwdFxuICAgIC5yZXBsYWNlKC9odG1sL2csIC8gezAsM308W15cXG4+XSs+XFxuLykgLy8gYmxvY2sgaHRtbCBjYW4gaW50ZXJydXB0XG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBfcGFyYWdyYXBoID0gL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXxmZW5jZXN8bGlzdHxodG1sfHRhYmxlfCArXFxuKVteXFxuXSspKikvO1xuY29uc3QgYmxvY2tUZXh0ID0gL15bXlxcbl0rLztcbmNvbnN0IF9ibG9ja0xhYmVsID0gLyg/IVxccypcXF0pKD86XFxcXC58W15cXFtcXF1cXFxcXSkrLztcbmNvbnN0IGRlZiA9IGVkaXQoL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuWyBcXHRdKik/KFtePFxcc11bXlxcc10qfDwuKj8+KSg/Oig/OiArKD86XFxuWyBcXHRdKik/fCAqXFxuWyBcXHRdKikodGl0bGUpKT8gKig/Olxcbit8JCkvKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9ibG9ja0xhYmVsKVxuICAgIC5yZXBsYWNlKCd0aXRsZScsIC8oPzpcIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnW14nXFxuXSooPzpcXG5bXidcXG5dKykqXFxuPyd8XFwoW14oKV0qXFwpKS8pXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBsaXN0ID0gZWRpdCgvXiggezAsM31idWxsKShbIFxcdF1bXlxcbl0rPyk/KD86XFxufCQpLylcbiAgICAucmVwbGFjZSgvYnVsbC9nLCBidWxsZXQpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBfdGFnID0gJ2FkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9uJ1xuICAgICsgJ3xjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbidcbiAgICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgICArICd8bGVnZW5kfGxpfGxpbmt8bWFpbnxtZW51fG1lbnVpdGVtfG1ldGF8bmF2fG5vZnJhbWVzfG9sfG9wdGdyb3VwfG9wdGlvbidcbiAgICArICd8cHxwYXJhbXxzZWFyY2h8c2VjdGlvbnxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlJ1xuICAgICsgJ3x0cnx0cmFja3x1bCc7XG5jb25zdCBfY29tbWVudCA9IC88IS0tKD86LT8+fFtcXHNcXFNdKj8oPzotLT58JCkpLztcbmNvbnN0IGh0bWwgPSBlZGl0KCdeIHswLDN9KD86JyAvLyBvcHRpb25hbCBpbmRlbnRhdGlvblxuICAgICsgJzwoc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbXFxcXHM+XVtcXFxcc1xcXFxTXSo/KD86PC9cXFxcMT5bXlxcXFxuXSpcXFxcbit8JCknIC8vICgxKVxuICAgICsgJ3xjb21tZW50W15cXFxcbl0qKFxcXFxuK3wkKScgLy8gKDIpXG4gICAgKyAnfDxcXFxcP1tcXFxcc1xcXFxTXSo/KD86XFxcXD8+XFxcXG4qfCQpJyAvLyAoMylcbiAgICArICd8PCFbQS1aXVtcXFxcc1xcXFxTXSo/KD86PlxcXFxuKnwkKScgLy8gKDQpXG4gICAgKyAnfDwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj8oPzpcXFxcXVxcXFxdPlxcXFxuKnwkKScgLy8gKDUpXG4gICAgKyAnfDwvPyh0YWcpKD86ICt8XFxcXG58Lz8+KVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFxcdF0qKStcXFxcbnwkKScgLy8gKDYpXG4gICAgKyAnfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFxcdF0qKStcXFxcbnwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuWyBcXHRdKikrXFxcXG58JCknIC8vICg3KSBjbG9zaW5nIHRhZ1xuICAgICsgJyknLCAnaScpXG4gICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBfY29tbWVudClcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZylcbiAgICAucmVwbGFjZSgnYXR0cmlidXRlJywgLyArW2EtekEtWjpfXVtcXHcuOi1dKig/OiAqPSAqXCJbXlwiXFxuXSpcInwgKj0gKidbXidcXG5dKid8ICo9ICpbXlxcc1wiJz08PmBdKyk/LylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IHBhcmFncmFwaCA9IGVkaXQoX3BhcmFncmFwaClcbiAgICAucmVwbGFjZSgnaHInLCBocilcbiAgICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0oPzpcXFxcc3wkKScpXG4gICAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleHQgaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAgIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IGJsb2NrcXVvdGUgPSBlZGl0KC9eKCB7MCwzfT4gPyhwYXJhZ3JhcGh8W15cXG5dKikoPzpcXG58JCkpKy8pXG4gICAgLnJlcGxhY2UoJ3BhcmFncmFwaCcsIHBhcmFncmFwaClcbiAgICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuY29uc3QgYmxvY2tOb3JtYWwgPSB7XG4gICAgYmxvY2txdW90ZSxcbiAgICBjb2RlOiBibG9ja0NvZGUsXG4gICAgZGVmLFxuICAgIGZlbmNlcyxcbiAgICBoZWFkaW5nLFxuICAgIGhyLFxuICAgIGh0bWwsXG4gICAgbGhlYWRpbmcsXG4gICAgbGlzdCxcbiAgICBuZXdsaW5lLFxuICAgIHBhcmFncmFwaCxcbiAgICB0YWJsZTogbm9vcFRlc3QsXG4gICAgdGV4dDogYmxvY2tUZXh0LFxufTtcbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuY29uc3QgZ2ZtVGFibGUgPSBlZGl0KCdeICooW15cXFxcbiBdLiopXFxcXG4nIC8vIEhlYWRlclxuICAgICsgJyB7MCwzfSgoPzpcXFxcfCAqKT86Py0rOj8gKig/OlxcXFx8ICo6Py0rOj8gKikqKD86XFxcXHwgKik/KScgLy8gQWxpZ25cbiAgICArICcoPzpcXFxcbigoPzooPyEgKlxcXFxufGhyfGhlYWRpbmd8YmxvY2txdW90ZXxjb2RlfGZlbmNlc3xsaXN0fGh0bWwpLiooPzpcXFxcbnwkKSkqKVxcXFxuKnwkKScpIC8vIENlbGxzXG4gICAgLnJlcGxhY2UoJ2hyJywgaHIpXG4gICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9KD86XFxcXHN8JCknKVxuICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgIC5yZXBsYWNlKCdjb2RlJywgJyg/OiB7NH18IHswLDN9XFx0KVteXFxcXG5dJylcbiAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gdGFibGVzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYmxvY2tHZm0gPSB7XG4gICAgLi4uYmxvY2tOb3JtYWwsXG4gICAgdGFibGU6IGdmbVRhYmxlLFxuICAgIHBhcmFncmFwaDogZWRpdChfcGFyYWdyYXBoKVxuICAgICAgICAucmVwbGFjZSgnaHInLCBocilcbiAgICAgICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9KD86XFxcXHN8JCknKVxuICAgICAgICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4dCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gICAgICAgIC5yZXBsYWNlKCd0YWJsZScsIGdmbVRhYmxlKSAvLyBpbnRlcnJ1cHQgcGFyYWdyYXBocyB3aXRoIHRhYmxlXG4gICAgICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgICAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgICAgIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gICAgICAgIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAgICAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBQZWRhbnRpYyBncmFtbWFyIChvcmlnaW5hbCBKb2huIEdydWJlcidzIGxvb3NlIG1hcmtkb3duIHNwZWNpZmljYXRpb24pXG4gKi9cbmNvbnN0IGJsb2NrUGVkYW50aWMgPSB7XG4gICAgLi4uYmxvY2tOb3JtYWwsXG4gICAgaHRtbDogZWRpdCgnXiAqKD86Y29tbWVudCAqKD86XFxcXG58XFxcXHMqJCknXG4gICAgICAgICsgJ3w8KHRhZylbXFxcXHNcXFxcU10rPzwvXFxcXDE+ICooPzpcXFxcbnsyLH18XFxcXHMqJCknIC8vIGNsb3NlZCB0YWdcbiAgICAgICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAgICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBfY29tbWVudClcbiAgICAgICAgLnJlcGxhY2UoL3RhZy9nLCAnKD8hKD86J1xuICAgICAgICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZXx2YXJ8c2FtcHxrYmR8c3ViJ1xuICAgICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICAgKyAnXFxcXGIpXFxcXHcrKD8hOnxbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG4gICAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogKyhbXCIoXVteXFxuXStbXCIpXSkpPyAqKD86XFxuK3wkKS8sXG4gICAgaGVhZGluZzogL14oI3sxLDZ9KSguKikoPzpcXG4rfCQpLyxcbiAgICBmZW5jZXM6IG5vb3BUZXN0LCAvLyBmZW5jZXMgbm90IHN1cHBvcnRlZFxuICAgIGxoZWFkaW5nOiAvXiguKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gICAgcGFyYWdyYXBoOiBlZGl0KF9wYXJhZ3JhcGgpXG4gICAgICAgIC5yZXBsYWNlKCdocicsIGhyKVxuICAgICAgICAucmVwbGFjZSgnaGVhZGluZycsICcgKiN7MSw2fSAqW15cXG5dJylcbiAgICAgICAgLnJlcGxhY2UoJ2xoZWFkaW5nJywgbGhlYWRpbmcpXG4gICAgICAgIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gICAgICAgIC5yZXBsYWNlKCd8ZmVuY2VzJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCd8bGlzdCcsICcnKVxuICAgICAgICAucmVwbGFjZSgnfGh0bWwnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ3x0YWcnLCAnJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBlc2NhcGUgPSAvXlxcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pLztcbmNvbnN0IGlubGluZUNvZGUgPSAvXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvO1xuY29uc3QgYnIgPSAvXiggezIsfXxcXFxcKVxcbig/IVxccyokKS87XG5jb25zdCBpbmxpbmVUZXh0ID0gL14oYCt8W15gXSkoPzooPz0gezIsfVxcbil8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl9dfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSkpLztcbi8vIGxpc3Qgb2YgdW5pY29kZSBwdW5jdHVhdGlvbiBtYXJrcywgcGx1cyBhbnkgbWlzc2luZyBjaGFyYWN0ZXJzIGZyb20gQ29tbW9uTWFyayBzcGVjXG5jb25zdCBfcHVuY3R1YXRpb24gPSAnXFxcXHB7UH1cXFxccHtTfSc7XG5jb25zdCBwdW5jdHVhdGlvbiA9IGVkaXQoL14oKD8hWypfXSlbXFxzcHVuY3R1YXRpb25dKS8sICd1JylcbiAgICAucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgX3B1bmN0dWF0aW9uKS5nZXRSZWdleCgpO1xuLy8gc2VxdWVuY2VzIGVtIHNob3VsZCBza2lwIG92ZXIgW3RpdGxlXShsaW5rKSwgYGNvZGVgLCA8aHRtbD5cbmNvbnN0IGJsb2NrU2tpcCA9IC9cXFtbXltcXF1dKj9cXF1cXCgoPzpcXFxcLnxbXlxcXFxcXChcXCldfFxcKCg/OlxcXFwufFteXFxcXFxcKFxcKV0pKlxcKSkqXFwpfGBbXmBdKj9gfDxbXjw+XSo/Pi9nO1xuY29uc3QgZW1TdHJvbmdMRGVsaW0gPSBlZGl0KC9eKD86XFwqKyg/OigoPyFcXCopW3B1bmN0XSl8W15cXHMqXSkpfF5fKyg/OigoPyFfKVtwdW5jdF0pfChbXlxcc19dKSkvLCAndScpXG4gICAgLnJlcGxhY2UoL3B1bmN0L2csIF9wdW5jdHVhdGlvbilcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IGVtU3Ryb25nUkRlbGltQXN0ID0gZWRpdCgnXlteXypdKj9fX1teXypdKj9cXFxcKlteXypdKj8oPz1fXyknIC8vIFNraXAgb3JwaGFuIGluc2lkZSBzdHJvbmdcbiAgICArICd8W14qXSsoPz1bXipdKScgLy8gQ29uc3VtZSB0byBkZWxpbVxuICAgICsgJ3woPyFcXFxcKilbcHVuY3RdKFxcXFwqKykoPz1bXFxcXHNdfCQpJyAvLyAoMSkgIyoqKiBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKFxcXFwqKykoPyFcXFxcKikoPz1bcHVuY3RcXFxcc118JCknIC8vICgyKSBhKioqIywgYSoqKiBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3woPyFcXFxcKilbcHVuY3RcXFxcc10oXFxcXCorKSg/PVtecHVuY3RcXFxcc10pJyAvLyAoMykgIyoqKmEsICoqKmEgY2FuIG9ubHkgYmUgTGVmdCBEZWxpbWl0ZXJcbiAgICArICd8W1xcXFxzXShcXFxcKispKD8hXFxcXCopKD89W3B1bmN0XSknIC8vICg0KSAqKiojIGNhbiBvbmx5IGJlIExlZnQgRGVsaW1pdGVyXG4gICAgKyAnfCg/IVxcXFwqKVtwdW5jdF0oXFxcXCorKSg/IVxcXFwqKSg/PVtwdW5jdF0pJyAvLyAoNSkgIyoqKiMgY2FuIGJlIGVpdGhlciBMZWZ0IG9yIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKFxcXFwqKykoPz1bXnB1bmN0XFxcXHNdKScsICdndScpIC8vICg2KSBhKioqYSBjYW4gYmUgZWl0aGVyIExlZnQgb3IgUmlnaHQgRGVsaW1pdGVyXG4gICAgLnJlcGxhY2UoL3B1bmN0L2csIF9wdW5jdHVhdGlvbilcbiAgICAuZ2V0UmVnZXgoKTtcbi8vICg2KSBOb3QgYWxsb3dlZCBmb3IgX1xuY29uc3QgZW1TdHJvbmdSRGVsaW1VbmQgPSBlZGl0KCdeW15fKl0qP1xcXFwqXFxcXCpbXl8qXSo/X1teXypdKj8oPz1cXFxcKlxcXFwqKScgLy8gU2tpcCBvcnBoYW4gaW5zaWRlIHN0cm9uZ1xuICAgICsgJ3xbXl9dKyg/PVteX10pJyAvLyBDb25zdW1lIHRvIGRlbGltXG4gICAgKyAnfCg/IV8pW3B1bmN0XShfKykoPz1bXFxcXHNdfCQpJyAvLyAoMSkgI19fXyBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKF8rKSg/IV8pKD89W3B1bmN0XFxcXHNdfCQpJyAvLyAoMikgYV9fXyMsIGFfX18gY2FuIG9ubHkgYmUgYSBSaWdodCBEZWxpbWl0ZXJcbiAgICArICd8KD8hXylbcHVuY3RcXFxcc10oXyspKD89W15wdW5jdFxcXFxzXSknIC8vICgzKSAjX19fYSwgX19fYSBjYW4gb25seSBiZSBMZWZ0IERlbGltaXRlclxuICAgICsgJ3xbXFxcXHNdKF8rKSg/IV8pKD89W3B1bmN0XSknIC8vICg0KSBfX18jIGNhbiBvbmx5IGJlIExlZnQgRGVsaW1pdGVyXG4gICAgKyAnfCg/IV8pW3B1bmN0XShfKykoPyFfKSg/PVtwdW5jdF0pJywgJ2d1JykgLy8gKDUpICNfX18jIGNhbiBiZSBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbWl0ZXJcbiAgICAucmVwbGFjZSgvcHVuY3QvZywgX3B1bmN0dWF0aW9uKVxuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYW55UHVuY3R1YXRpb24gPSBlZGl0KC9cXFxcKFtwdW5jdF0pLywgJ2d1JylcbiAgICAucmVwbGFjZSgvcHVuY3QvZywgX3B1bmN0dWF0aW9uKVxuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYXV0b2xpbmsgPSBlZGl0KC9ePChzY2hlbWU6W15cXHNcXHgwMC1cXHgxZjw+XSp8ZW1haWwpPi8pXG4gICAgLnJlcGxhY2UoJ3NjaGVtZScsIC9bYS16QS1aXVthLXpBLVowLTkrLi1dezEsMzF9LylcbiAgICAucmVwbGFjZSgnZW1haWwnLCAvW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXSsoQClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IF9pbmxpbmVDb21tZW50ID0gZWRpdChfY29tbWVudCkucmVwbGFjZSgnKD86LS0+fCQpJywgJy0tPicpLmdldFJlZ2V4KCk7XG5jb25zdCB0YWcgPSBlZGl0KCdeY29tbWVudCdcbiAgICArICd8XjwvW2EtekEtWl1bXFxcXHc6LV0qXFxcXHMqPicgLy8gc2VsZi1jbG9zaW5nIHRhZ1xuICAgICsgJ3xePFthLXpBLVpdW1xcXFx3LV0qKD86YXR0cmlidXRlKSo/XFxcXHMqLz8+JyAvLyBvcGVuIHRhZ1xuICAgICsgJ3xePFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz4nIC8vIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb24sIGUuZy4gPD9waHAgPz5cbiAgICArICd8XjwhW2EtekEtWl0rXFxcXHNbXFxcXHNcXFxcU10qPz4nIC8vIGRlY2xhcmF0aW9uLCBlLmcuIDwhRE9DVFlQRSBodG1sPlxuICAgICsgJ3xePCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+JykgLy8gQ0RBVEEgc2VjdGlvblxuICAgIC5yZXBsYWNlKCdjb21tZW50JywgX2lubGluZUNvbW1lbnQpXG4gICAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC9cXHMrW2EtekEtWjpfXVtcXHcuOi1dKig/Olxccyo9XFxzKlwiW15cIl0qXCJ8XFxzKj1cXHMqJ1teJ10qJ3xcXHMqPVxccypbXlxcc1wiJz08PmBdKyk/LylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IF9pbmxpbmVMYWJlbCA9IC8oPzpcXFsoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSpcXF18XFxcXC58YFteYF0qYHxbXlxcW1xcXVxcXFxgXSkqPy87XG5jb25zdCBsaW5rID0gZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKFxccyooaHJlZikoPzpcXHMrKHRpdGxlKSk/XFxzKlxcKS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgX2lubGluZUxhYmVsKVxuICAgIC5yZXBsYWNlKCdocmVmJywgLzwoPzpcXFxcLnxbXlxcbjw+XFxcXF0pKz58W15cXHNcXHgwMC1cXHgxZl0qLylcbiAgICAucmVwbGFjZSgndGl0bGUnLCAvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IHJlZmxpbmsgPSBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxbKHJlZilcXF0vKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9pbmxpbmVMYWJlbClcbiAgICAucmVwbGFjZSgncmVmJywgX2Jsb2NrTGFiZWwpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBub2xpbmsgPSBlZGl0KC9eIT9cXFsocmVmKVxcXSg/OlxcW1xcXSk/LylcbiAgICAucmVwbGFjZSgncmVmJywgX2Jsb2NrTGFiZWwpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCByZWZsaW5rU2VhcmNoID0gZWRpdCgncmVmbGlua3xub2xpbmsoPyFcXFxcKCknLCAnZycpXG4gICAgLnJlcGxhY2UoJ3JlZmxpbmsnLCByZWZsaW5rKVxuICAgIC5yZXBsYWNlKCdub2xpbmsnLCBub2xpbmspXG4gICAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5jb25zdCBpbmxpbmVOb3JtYWwgPSB7XG4gICAgX2JhY2twZWRhbDogbm9vcFRlc3QsIC8vIG9ubHkgdXNlZCBmb3IgR0ZNIHVybFxuICAgIGFueVB1bmN0dWF0aW9uLFxuICAgIGF1dG9saW5rLFxuICAgIGJsb2NrU2tpcCxcbiAgICBicixcbiAgICBjb2RlOiBpbmxpbmVDb2RlLFxuICAgIGRlbDogbm9vcFRlc3QsXG4gICAgZW1TdHJvbmdMRGVsaW0sXG4gICAgZW1TdHJvbmdSRGVsaW1Bc3QsXG4gICAgZW1TdHJvbmdSRGVsaW1VbmQsXG4gICAgZXNjYXBlLFxuICAgIGxpbmssXG4gICAgbm9saW5rLFxuICAgIHB1bmN0dWF0aW9uLFxuICAgIHJlZmxpbmssXG4gICAgcmVmbGlua1NlYXJjaCxcbiAgICB0YWcsXG4gICAgdGV4dDogaW5saW5lVGV4dCxcbiAgICB1cmw6IG5vb3BUZXN0LFxufTtcbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lUGVkYW50aWMgPSB7XG4gICAgLi4uaW5saW5lTm9ybWFsLFxuICAgIGxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXCgoLio/KVxcKS8pXG4gICAgICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9pbmxpbmVMYWJlbClcbiAgICAgICAgLmdldFJlZ2V4KCksXG4gICAgcmVmbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxccypcXFsoW15cXF1dKilcXF0vKVxuICAgICAgICAucmVwbGFjZSgnbGFiZWwnLCBfaW5saW5lTGFiZWwpXG4gICAgICAgIC5nZXRSZWdleCgpLFxufTtcbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cbmNvbnN0IGlubGluZUdmbSA9IHtcbiAgICAuLi5pbmxpbmVOb3JtYWwsXG4gICAgZXNjYXBlOiBlZGl0KGVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gICAgdXJsOiBlZGl0KC9eKCg/OmZ0cHxodHRwcz8pOlxcL1xcL3x3d3dcXC4pKD86W2EtekEtWjAtOVxcLV0rXFwuPykrW15cXHM8XSp8XmVtYWlsLywgJ2knKVxuICAgICAgICAucmVwbGFjZSgnZW1haWwnLCAvW0EtWmEtejAtOS5fKy1dKyhAKVthLXpBLVowLTktX10rKD86XFwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvKVxuICAgICAgICAuZ2V0UmVnZXgoKSxcbiAgICBfYmFja3BlZGFsOiAvKD86W14/IS4sOjsqXydcIn4oKSZdK3xcXChbXildKlxcKXwmKD8hW2EtekEtWjAtOV0rOyQpfFs/IS4sOjsqXydcIn4pXSsoPyEkKSkrLyxcbiAgICBkZWw6IC9eKH5+PykoPz1bXlxcc35dKSgoPzpcXFxcLnxbXlxcXFxdKSo/KD86XFxcXC58W15cXHN+XFxcXF0pKVxcMSg/PVtefl18JCkvLFxuICAgIHRleHQ6IC9eKFtgfl0rfFteYH5dKSg/Oig/PSB7Mix9XFxuKXwoPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCp+X118XFxiX3xodHRwcz86XFwvXFwvfGZ0cDpcXC9cXC98d3d3XFwufCQpfFteIF0oPz0gezIsfVxcbil8W15hLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0oPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApKSkvLFxufTtcbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lQnJlYWtzID0ge1xuICAgIC4uLmlubGluZUdmbSxcbiAgICBicjogZWRpdChicikucmVwbGFjZSgnezIsfScsICcqJykuZ2V0UmVnZXgoKSxcbiAgICB0ZXh0OiBlZGl0KGlubGluZUdmbS50ZXh0KVxuICAgICAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAgICAgLnJlcGxhY2UoL1xcezIsXFx9L2csICcqJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBleHBvcnRzXG4gKi9cbmNvbnN0IGJsb2NrID0ge1xuICAgIG5vcm1hbDogYmxvY2tOb3JtYWwsXG4gICAgZ2ZtOiBibG9ja0dmbSxcbiAgICBwZWRhbnRpYzogYmxvY2tQZWRhbnRpYyxcbn07XG5jb25zdCBpbmxpbmUgPSB7XG4gICAgbm9ybWFsOiBpbmxpbmVOb3JtYWwsXG4gICAgZ2ZtOiBpbmxpbmVHZm0sXG4gICAgYnJlYWtzOiBpbmxpbmVCcmVha3MsXG4gICAgcGVkYW50aWM6IGlubGluZVBlZGFudGljLFxufTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5jbGFzcyBfTGV4ZXIge1xuICAgIHRva2VucztcbiAgICBvcHRpb25zO1xuICAgIHN0YXRlO1xuICAgIHRva2VuaXplcjtcbiAgICBpbmxpbmVRdWV1ZTtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIC8vIFRva2VuTGlzdCBjYW5ub3QgYmUgY3JlYXRlZCBpbiBvbmUgZ29cbiAgICAgICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgICAgICAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IF9kZWZhdWx0cztcbiAgICAgICAgdGhpcy5vcHRpb25zLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IF9Ub2tlbml6ZXIoKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyO1xuICAgICAgICB0aGlzLnRva2VuaXplci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICB0aGlzLnRva2VuaXplci5sZXhlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuaW5saW5lUXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGluTGluazogZmFsc2UsXG4gICAgICAgICAgICBpblJhd0Jsb2NrOiBmYWxzZSxcbiAgICAgICAgICAgIHRvcDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcnVsZXMgPSB7XG4gICAgICAgICAgICBibG9jazogYmxvY2subm9ybWFsLFxuICAgICAgICAgICAgaW5saW5lOiBpbmxpbmUubm9ybWFsLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICBydWxlcy5ibG9jayA9IGJsb2NrLnBlZGFudGljO1xuICAgICAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLnBlZGFudGljO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgICAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2suZ2ZtO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgICAgICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuYnJlYWtzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmdmbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRva2VuaXplci5ydWxlcyA9IHJ1bGVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgUnVsZXNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IHJ1bGVzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgICBpbmxpbmUsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBMZXggTWV0aG9kXG4gICAgICovXG4gICAgc3RhdGljIGxleChzcmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGV4ZXIgPSBuZXcgX0xleGVyKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBMZXggSW5saW5lIE1ldGhvZFxuICAgICAqL1xuICAgIHN0YXRpYyBsZXhJbmxpbmUoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxleGVyID0gbmV3IF9MZXhlcihvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGxleGVyLmlubGluZVRva2VucyhzcmMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmVwcm9jZXNzaW5nXG4gICAgICovXG4gICAgbGV4KHNyYykge1xuICAgICAgICBzcmMgPSBzcmNcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKTtcbiAgICAgICAgdGhpcy5ibG9ja1Rva2VucyhzcmMsIHRoaXMudG9rZW5zKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlubGluZVF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5pbmxpbmVRdWV1ZVtpXTtcbiAgICAgICAgICAgIHRoaXMuaW5saW5lVG9rZW5zKG5leHQuc3JjLCBuZXh0LnRva2Vucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZSA9IFtdO1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gICAgfVxuICAgIGJsb2NrVG9rZW5zKHNyYywgdG9rZW5zID0gW10sIGxhc3RQYXJhZ3JhcGhDbGlwcGVkID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpLnJlcGxhY2UoL14gKyQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdG9rZW47XG4gICAgICAgIGxldCBsYXN0VG9rZW47XG4gICAgICAgIGxldCBjdXRTcmM7XG4gICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2suc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBuZXdsaW5lXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5zcGFjZShzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4ucmF3Lmxlbmd0aCA9PT0gMSAmJiB0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSdzIGEgc2luZ2xlIFxcbiBhcyBhIHNwYWNlciwgaXQncyB0ZXJtaW5hdGluZyB0aGUgbGFzdCBsaW5lLFxuICAgICAgICAgICAgICAgICAgICAvLyBzbyBtb3ZlIGl0IHRoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IHVubmVjZXNzYXJ5IHBhcmFncmFwaCB0YWdzXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0ucmF3ICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvZGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAvLyBBbiBpbmRlbnRlZCBjb2RlIGJsb2NrIGNhbm5vdCBpbnRlcnJ1cHQgYSBwYXJhZ3JhcGguXG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZlbmNlc1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZmVuY2VzKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGhlYWRpbmdcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhlYWRpbmcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaHJcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhyKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJsb2NrcXVvdGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gbGlzdFxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGlzdChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBodG1sXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5odG1sKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRlZlxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVmKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmOiB0b2tlbi5ocmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRva2VuLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRhYmxlIChnZm0pXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWJsZShzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBsaGVhZGluZ1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGhlYWRpbmcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgICAgICAgICAgLy8gcHJldmVudCBwYXJhZ3JhcGggY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICAgICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2suZm9yRWFjaCgoZ2V0U3RhcnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnRvcCAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5wYXJhZ3JhcGgoY3V0U3JjKSkpIHtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoQ2xpcHBlZCAmJiBsYXN0VG9rZW4/LnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoQ2xpcHBlZCA9IChjdXRTcmMubGVuZ3RoICE9PSBzcmMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGV4dFxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGV4dChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS50b3AgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgICBpbmxpbmUoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnB1c2goeyBzcmMsIHRva2VucyB9KTtcbiAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGV4aW5nL0NvbXBpbGluZ1xuICAgICAqL1xuICAgIGlubGluZVRva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmM7XG4gICAgICAgIC8vIFN0cmluZyB3aXRoIGxpbmtzIG1hc2tlZCB0byBhdm9pZCBpbnRlcmZlcmVuY2Ugd2l0aCBlbSBhbmQgc3Ryb25nXG4gICAgICAgIGxldCBtYXNrZWRTcmMgPSBzcmM7XG4gICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgbGV0IGtlZXBQcmV2Q2hhciwgcHJldkNoYXI7XG4gICAgICAgIC8vIE1hc2sgb3V0IHJlZmxpbmtzXG4gICAgICAgIGlmICh0aGlzLnRva2Vucy5saW5rcykge1xuICAgICAgICAgICAgY29uc3QgbGlua3MgPSBPYmplY3Qua2V5cyh0aGlzLnRva2Vucy5saW5rcyk7XG4gICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmtzLmluY2x1ZGVzKG1hdGNoWzBdLnNsaWNlKG1hdGNoWzBdLmxhc3RJbmRleE9mKCdbJykgKyAxLCAtMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgJ2EnLnJlcGVhdChtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5sYXN0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE1hc2sgb3V0IG90aGVyIGJsb2Nrc1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyAnYScucmVwZWF0KG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAubGFzdEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNYXNrIG91dCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnKysnICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5sYXN0SW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIGlmICgha2VlcFByZXZDaGFyKSB7XG4gICAgICAgICAgICAgICAgcHJldkNoYXIgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtlZXBQcmV2Q2hhciA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXNjYXBlXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lc2NhcGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGFnXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGxpbmtcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpbmsoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5yZWZsaW5rKHNyYywgdGhpcy50b2tlbnMubGlua3MpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZW0gJiBzdHJvbmdcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhcikpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvZGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGVzcGFuKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJyXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5icihzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkZWwgKGdmbSlcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlbChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhdXRvbGlua1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYXV0b2xpbmsoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXJsIChnZm0pXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaW5MaW5rICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnVybChzcmMpKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGV4dFxuICAgICAgICAgICAgLy8gcHJldmVudCBpbmxpbmVUZXh0IGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUuZm9yRWFjaCgoZ2V0U3RhcnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmlubGluZVRleHQoY3V0U3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnJhdy5zbGljZSgtMSkgIT09ICdfJykgeyAvLyBUcmFjayBwcmV2Q2hhciBiZWZvcmUgc3RyaW5nIG9mIF9fX18gc3RhcnRlZFxuICAgICAgICAgICAgICAgICAgICBwcmV2Q2hhciA9IHRva2VuLnJhdy5zbGljZSgtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGtlZXBQcmV2Q2hhciA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cbmNsYXNzIF9SZW5kZXJlciB7XG4gICAgb3B0aW9ucztcbiAgICBwYXJzZXI7IC8vIHNldCBieSB0aGUgcGFyc2VyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IF9kZWZhdWx0cztcbiAgICB9XG4gICAgc3BhY2UodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb2RlKHsgdGV4dCwgbGFuZywgZXNjYXBlZCB9KSB7XG4gICAgICAgIGNvbnN0IGxhbmdTdHJpbmcgPSAobGFuZyB8fCAnJykubWF0Y2goL15cXFMqLyk/LlswXTtcbiAgICAgICAgY29uc3QgY29kZSA9IHRleHQucmVwbGFjZSgvXFxuJC8sICcnKSArICdcXG4nO1xuICAgICAgICBpZiAoIWxhbmdTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICAgICAgICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUkMShjb2RlLCB0cnVlKSlcbiAgICAgICAgICAgICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCJsYW5ndWFnZS0nXG4gICAgICAgICAgICArIGVzY2FwZSQxKGxhbmdTdHJpbmcpXG4gICAgICAgICAgICArICdcIj4nXG4gICAgICAgICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZSQxKGNvZGUsIHRydWUpKVxuICAgICAgICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gICAgfVxuICAgIGJsb2NrcXVvdGUoeyB0b2tlbnMgfSkge1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy5wYXJzZXIucGFyc2UodG9rZW5zKTtcbiAgICAgICAgcmV0dXJuIGA8YmxvY2txdW90ZT5cXG4ke2JvZHl9PC9ibG9ja3F1b3RlPlxcbmA7XG4gICAgfVxuICAgIGh0bWwoeyB0ZXh0IH0pIHtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGhlYWRpbmcoeyB0b2tlbnMsIGRlcHRoIH0pIHtcbiAgICAgICAgcmV0dXJuIGA8aCR7ZGVwdGh9PiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKX08L2gke2RlcHRofT5cXG5gO1xuICAgIH1cbiAgICBocih0b2tlbikge1xuICAgICAgICByZXR1cm4gJzxocj5cXG4nO1xuICAgIH1cbiAgICBsaXN0KHRva2VuKSB7XG4gICAgICAgIGNvbnN0IG9yZGVyZWQgPSB0b2tlbi5vcmRlcmVkO1xuICAgICAgICBjb25zdCBzdGFydCA9IHRva2VuLnN0YXJ0O1xuICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLml0ZW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdG9rZW4uaXRlbXNbal07XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMubGlzdGl0ZW0oaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgICAgICAgY29uc3Qgc3RhcnRBdHRyID0gKG9yZGVyZWQgJiYgc3RhcnQgIT09IDEpID8gKCcgc3RhcnQ9XCInICsgc3RhcnQgKyAnXCInKSA6ICcnO1xuICAgICAgICByZXR1cm4gJzwnICsgdHlwZSArIHN0YXJ0QXR0ciArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbiAgICB9XG4gICAgbGlzdGl0ZW0oaXRlbSkge1xuICAgICAgICBsZXQgaXRlbUJvZHkgPSAnJztcbiAgICAgICAgaWYgKGl0ZW0udGFzaykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSB0aGlzLmNoZWNrYm94KHsgY2hlY2tlZDogISFpdGVtLmNoZWNrZWQgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5sb29zZSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vuc1swXS50b2tlbnMgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRva2Vucy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogY2hlY2tib3ggKyAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjaGVja2JveCArICcgJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbUJvZHkgKz0gY2hlY2tib3ggKyAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXRlbUJvZHkgKz0gdGhpcy5wYXJzZXIucGFyc2UoaXRlbS50b2tlbnMsICEhaXRlbS5sb29zZSk7XG4gICAgICAgIHJldHVybiBgPGxpPiR7aXRlbUJvZHl9PC9saT5cXG5gO1xuICAgIH1cbiAgICBjaGVja2JveCh7IGNoZWNrZWQgfSkge1xuICAgICAgICByZXR1cm4gJzxpbnB1dCAnXG4gICAgICAgICAgICArIChjaGVja2VkID8gJ2NoZWNrZWQ9XCJcIiAnIDogJycpXG4gICAgICAgICAgICArICdkaXNhYmxlZD1cIlwiIHR5cGU9XCJjaGVja2JveFwiPic7XG4gICAgfVxuICAgIHBhcmFncmFwaCh7IHRva2VucyB9KSB7XG4gICAgICAgIHJldHVybiBgPHA+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpfTwvcD5cXG5gO1xuICAgIH1cbiAgICB0YWJsZSh0b2tlbikge1xuICAgICAgICBsZXQgaGVhZGVyID0gJyc7XG4gICAgICAgIC8vIGhlYWRlclxuICAgICAgICBsZXQgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLmhlYWRlci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY2VsbCArPSB0aGlzLnRhYmxlY2VsbCh0b2tlbi5oZWFkZXJbal0pO1xuICAgICAgICB9XG4gICAgICAgIGhlYWRlciArPSB0aGlzLnRhYmxlcm93KHsgdGV4dDogY2VsbCB9KTtcbiAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0b2tlbi5yb3dzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0b2tlbi5yb3dzW2pdO1xuICAgICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCByb3cubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBjZWxsICs9IHRoaXMudGFibGVjZWxsKHJvd1trXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMudGFibGVyb3coeyB0ZXh0OiBjZWxsIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5KVxuICAgICAgICAgICAgYm9keSA9IGA8dGJvZHk+JHtib2R5fTwvdGJvZHk+YDtcbiAgICAgICAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICAgICAgICAgKyAnPHRoZWFkPlxcbidcbiAgICAgICAgICAgICsgaGVhZGVyXG4gICAgICAgICAgICArICc8L3RoZWFkPlxcbidcbiAgICAgICAgICAgICsgYm9keVxuICAgICAgICAgICAgKyAnPC90YWJsZT5cXG4nO1xuICAgIH1cbiAgICB0YWJsZXJvdyh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gYDx0cj5cXG4ke3RleHR9PC90cj5cXG5gO1xuICAgIH1cbiAgICB0YWJsZWNlbGwodG9rZW4pIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2VuLnRva2Vucyk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0b2tlbi5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgICAgICAgY29uc3QgdGFnID0gdG9rZW4uYWxpZ25cbiAgICAgICAgICAgID8gYDwke3R5cGV9IGFsaWduPVwiJHt0b2tlbi5hbGlnbn1cIj5gXG4gICAgICAgICAgICA6IGA8JHt0eXBlfT5gO1xuICAgICAgICByZXR1cm4gdGFnICsgY29udGVudCArIGA8LyR7dHlwZX0+XFxuYDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3BhbiBsZXZlbCByZW5kZXJlclxuICAgICAqL1xuICAgIHN0cm9uZyh7IHRva2VucyB9KSB7XG4gICAgICAgIHJldHVybiBgPHN0cm9uZz4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyl9PC9zdHJvbmc+YDtcbiAgICB9XG4gICAgZW0oeyB0b2tlbnMgfSkge1xuICAgICAgICByZXR1cm4gYDxlbT4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyl9PC9lbT5gO1xuICAgIH1cbiAgICBjb2Rlc3Bhbih7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gYDxjb2RlPiR7dGV4dH08L2NvZGU+YDtcbiAgICB9XG4gICAgYnIodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICc8YnI+JztcbiAgICB9XG4gICAgZGVsKHsgdG9rZW5zIH0pIHtcbiAgICAgICAgcmV0dXJuIGA8ZGVsPiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKX08L2RlbD5gO1xuICAgIH1cbiAgICBsaW5rKHsgaHJlZiwgdGl0bGUsIHRva2VucyB9KSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICAgICAgICBjb25zdCBjbGVhbkhyZWYgPSBjbGVhblVybChocmVmKTtcbiAgICAgICAgaWYgKGNsZWFuSHJlZiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgaHJlZiA9IGNsZWFuSHJlZjtcbiAgICAgICAgbGV0IG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgaW1hZ2UoeyBocmVmLCB0aXRsZSwgdGV4dCB9KSB7XG4gICAgICAgIGNvbnN0IGNsZWFuSHJlZiA9IGNsZWFuVXJsKGhyZWYpO1xuICAgICAgICBpZiAoY2xlYW5IcmVmID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICBocmVmID0gY2xlYW5IcmVmO1xuICAgICAgICBsZXQgb3V0ID0gYDxpbWcgc3JjPVwiJHtocmVmfVwiIGFsdD1cIiR7dGV4dH1cImA7XG4gICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgb3V0ICs9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gJz4nO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICB0ZXh0KHRva2VuKSB7XG4gICAgICAgIHJldHVybiAndG9rZW5zJyBpbiB0b2tlbiAmJiB0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dDtcbiAgICB9XG59XG5cbi8qKlxuICogVGV4dFJlbmRlcmVyXG4gKiByZXR1cm5zIG9ubHkgdGhlIHRleHR1YWwgcGFydCBvZiB0aGUgdG9rZW5cbiAqL1xuY2xhc3MgX1RleHRSZW5kZXJlciB7XG4gICAgLy8gbm8gbmVlZCBmb3IgYmxvY2sgbGV2ZWwgcmVuZGVyZXJzXG4gICAgc3Ryb25nKHsgdGV4dCB9KSB7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBlbSh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29kZXNwYW4oeyB0ZXh0IH0pIHtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGRlbCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgaHRtbCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgdGV4dCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgbGluayh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gJycgKyB0ZXh0O1xuICAgIH1cbiAgICBpbWFnZSh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gJycgKyB0ZXh0O1xuICAgIH1cbiAgICBicigpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cbmNsYXNzIF9QYXJzZXIge1xuICAgIG9wdGlvbnM7XG4gICAgcmVuZGVyZXI7XG4gICAgdGV4dFJlbmRlcmVyO1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBfZGVmYXVsdHM7XG4gICAgICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgX1JlbmRlcmVyKCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gICAgICAgIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdGhpcy5yZW5kZXJlci5wYXJzZXIgPSB0aGlzO1xuICAgICAgICB0aGlzLnRleHRSZW5kZXJlciA9IG5ldyBfVGV4dFJlbmRlcmVyKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBfUGFyc2VyKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gcGFyc2VyLnBhcnNlKHRva2Vucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBQYXJzZSBJbmxpbmUgTWV0aG9kXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlSW5saW5lKHRva2Vucywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgX1BhcnNlcihvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXJzZSBMb29wXG4gICAgICovXG4gICAgcGFyc2UodG9rZW5zLCB0b3AgPSB0cnVlKSB7XG4gICAgICAgIGxldCBvdXQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGFueVRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1thbnlUb2tlbi50eXBlXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdlbmVyaWNUb2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1tnZW5lcmljVG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCBnZW5lcmljVG9rZW4pO1xuICAgICAgICAgICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ3NwYWNlJywgJ2hyJywgJ2hlYWRpbmcnLCAnY29kZScsICd0YWJsZScsICdibG9ja3F1b3RlJywgJ2xpc3QnLCAnaHRtbCcsICdwYXJhZ3JhcGgnLCAndGV4dCddLmluY2x1ZGVzKGdlbmVyaWNUb2tlbi50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnNwYWNlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2hyJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ocih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5oZWFkaW5nKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrcXVvdGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGlzdCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5odG1sKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvZHkgPSB0aGlzLnJlbmRlcmVyLnRleHQodGV4dFRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgKyAxIDwgdG9rZW5zLmxlbmd0aCAmJiB0b2tlbnNbaSArIDFdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dFRva2VuID0gdG9rZW5zWysraV07XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5yZW5kZXJlci50ZXh0KHRleHRUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXc6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IFt7IHR5cGU6ICd0ZXh0JywgcmF3OiBib2R5LCB0ZXh0OiBib2R5IH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQgKz0gYm9keTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgSW5saW5lIFRva2Vuc1xuICAgICAqL1xuICAgIHBhcnNlSW5saW5lKHRva2VucywgcmVuZGVyZXIpIHtcbiAgICAgICAgcmVuZGVyZXIgPSByZW5kZXJlciB8fCB0aGlzLnJlbmRlcmVyO1xuICAgICAgICBsZXQgb3V0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhbnlUb2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbYW55VG9rZW4udHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbYW55VG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCBhbnlUb2tlbik7XG4gICAgICAgICAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnZXNjYXBlJywgJ2h0bWwnLCAnbGluaycsICdpbWFnZScsICdzdHJvbmcnLCAnZW0nLCAnY29kZXNwYW4nLCAnYnInLCAnZGVsJywgJ3RleHQnXS5pbmNsdWRlcyhhbnlUb2tlbi50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXNjYXBlJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaHRtbCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdsaW5rJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIubGluayh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdpbWFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmltYWdlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0cm9uZyc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnN0cm9uZyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdlbSc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmVtKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGVzcGFuJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuY29kZXNwYW4odG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnYnInOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSByZW5kZXJlci5icih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdkZWwnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSByZW5kZXJlci5kZWwodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG59XG5cbmNsYXNzIF9Ib29rcyB7XG4gICAgb3B0aW9ucztcbiAgICBibG9jaztcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgX2RlZmF1bHRzO1xuICAgIH1cbiAgICBzdGF0aWMgcGFzc1Rocm91Z2hIb29rcyA9IG5ldyBTZXQoW1xuICAgICAgICAncHJlcHJvY2VzcycsXG4gICAgICAgICdwb3N0cHJvY2VzcycsXG4gICAgICAgICdwcm9jZXNzQWxsVG9rZW5zJyxcbiAgICBdKTtcbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIG1hcmtkb3duIGJlZm9yZSBtYXJrZWRcbiAgICAgKi9cbiAgICBwcmVwcm9jZXNzKG1hcmtkb3duKSB7XG4gICAgICAgIHJldHVybiBtYXJrZG93bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvY2VzcyBIVE1MIGFmdGVyIG1hcmtlZCBpcyBmaW5pc2hlZFxuICAgICAqL1xuICAgIHBvc3Rwcm9jZXNzKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgYWxsIHRva2VucyBiZWZvcmUgd2FsayB0b2tlbnNcbiAgICAgKi9cbiAgICBwcm9jZXNzQWxsVG9rZW5zKHRva2Vucykge1xuICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGZ1bmN0aW9uIHRvIHRva2VuaXplIG1hcmtkb3duXG4gICAgICovXG4gICAgcHJvdmlkZUxleGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9jayA/IF9MZXhlci5sZXggOiBfTGV4ZXIubGV4SW5saW5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGZ1bmN0aW9uIHRvIHBhcnNlIHRva2Vuc1xuICAgICAqL1xuICAgIHByb3ZpZGVQYXJzZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrID8gX1BhcnNlci5wYXJzZSA6IF9QYXJzZXIucGFyc2VJbmxpbmU7XG4gICAgfVxufVxuXG5jbGFzcyBNYXJrZWQge1xuICAgIGRlZmF1bHRzID0gX2dldERlZmF1bHRzKCk7XG4gICAgb3B0aW9ucyA9IHRoaXMuc2V0T3B0aW9ucztcbiAgICBwYXJzZSA9IHRoaXMucGFyc2VNYXJrZG93bih0cnVlKTtcbiAgICBwYXJzZUlubGluZSA9IHRoaXMucGFyc2VNYXJrZG93bihmYWxzZSk7XG4gICAgUGFyc2VyID0gX1BhcnNlcjtcbiAgICBSZW5kZXJlciA9IF9SZW5kZXJlcjtcbiAgICBUZXh0UmVuZGVyZXIgPSBfVGV4dFJlbmRlcmVyO1xuICAgIExleGVyID0gX0xleGVyO1xuICAgIFRva2VuaXplciA9IF9Ub2tlbml6ZXI7XG4gICAgSG9va3MgPSBfSG9va3M7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICB0aGlzLnVzZSguLi5hcmdzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUnVuIGNhbGxiYWNrIGZvciBldmVyeSB0b2tlblxuICAgICAqL1xuICAgIHdhbGtUb2tlbnModG9rZW5zLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGNhbGxiYWNrLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZVRva2VuID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiB0YWJsZVRva2VuLmhlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdGFibGVUb2tlbi5yb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KHRoaXMud2Fsa1Rva2VucyhsaXN0VG9rZW4uaXRlbXMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlbmVyaWNUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5leHRlbnNpb25zPy5jaGlsZFRva2Vucz8uW2dlbmVyaWNUb2tlbi50eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW2dlbmVyaWNUb2tlbi50eXBlXS5mb3JFYWNoKChjaGlsZFRva2VucykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IGdlbmVyaWNUb2tlbltjaGlsZFRva2Vuc10uZmxhdChJbmZpbml0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnModG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZ2VuZXJpY1Rva2VuLnRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoZ2VuZXJpY1Rva2VuLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH1cbiAgICB1c2UoLi4uYXJncykge1xuICAgICAgICBjb25zdCBleHRlbnNpb25zID0gdGhpcy5kZWZhdWx0cy5leHRlbnNpb25zIHx8IHsgcmVuZGVyZXJzOiB7fSwgY2hpbGRUb2tlbnM6IHt9IH07XG4gICAgICAgIGFyZ3MuZm9yRWFjaCgocGFjaykgPT4ge1xuICAgICAgICAgICAgLy8gY29weSBvcHRpb25zIHRvIG5ldyBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSB7IC4uLnBhY2sgfTtcbiAgICAgICAgICAgIC8vIHNldCBhc3luYyB0byB0cnVlIGlmIGl0IHdhcyBzZXQgdG8gdHJ1ZSBiZWZvcmVcbiAgICAgICAgICAgIG9wdHMuYXN5bmMgPSB0aGlzLmRlZmF1bHRzLmFzeW5jIHx8IG9wdHMuYXN5bmMgfHwgZmFsc2U7XG4gICAgICAgICAgICAvLyA9PS0tIFBhcnNlIFwiYWRkb25cIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICAgICAgICAgIGlmIChwYWNrLmV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBwYWNrLmV4dGVuc2lvbnMuZm9yRWFjaCgoZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXh0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoJ3JlbmRlcmVyJyBpbiBleHQpIHsgLy8gUmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgZXh0ZW5zaW9uIHdpdGggZnVuYyB0byBydW4gbmV3IGV4dGVuc2lvbiBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IGV4dC5yZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBleHQucmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCd0b2tlbml6ZXInIGluIGV4dCkgeyAvLyBUb2tlbml6ZXIgRXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleHQubGV2ZWwgfHwgKGV4dC5sZXZlbCAhPT0gJ2Jsb2NrJyAmJiBleHQubGV2ZWwgIT09ICdpbmxpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBsZXZlbCBtdXN0IGJlICdibG9jaycgb3IgJ2lubGluZSdcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRMZXZlbCA9IGV4dGVuc2lvbnNbZXh0LmxldmVsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRMZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dExldmVsLnVuc2hpZnQoZXh0LnRva2VuaXplcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0gPSBbZXh0LnRva2VuaXplcl07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXh0LnN0YXJ0KSB7IC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGZvciBzdGFydCBvZiB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHQubGV2ZWwgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jayA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV4dC5sZXZlbCA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZSA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgnY2hpbGRUb2tlbnMnIGluIGV4dCAmJiBleHQuY2hpbGRUb2tlbnMpIHsgLy8gQ2hpbGQgdG9rZW5zIHRvIGJlIHZpc2l0ZWQgYnkgd2Fsa1Rva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1tleHQubmFtZV0gPSBleHQuY2hpbGRUb2tlbnM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvcHRzLmV4dGVuc2lvbnMgPSBleHRlbnNpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gPT0tLSBQYXJzZSBcIm92ZXJ3cml0ZVwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgICAgICAgICAgaWYgKHBhY2sucmVuZGVyZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IHRoaXMuZGVmYXVsdHMucmVuZGVyZXIgfHwgbmV3IF9SZW5kZXJlcih0aGlzLmRlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5yZW5kZXJlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShwcm9wIGluIHJlbmRlcmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGByZW5kZXJlciAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ3BhcnNlciddLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgb3B0aW9ucyBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXJQcm9wID0gcHJvcDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXJGdW5jID0gcGFjay5yZW5kZXJlcltyZW5kZXJlclByb3BdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSByZW5kZXJlcltyZW5kZXJlclByb3BdO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHJlbmRlcmVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyW3JlbmRlcmVyUHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IHJlbmRlcmVyRnVuYy5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2tlbml6ZXIgPSB0aGlzLmRlZmF1bHRzLnRva2VuaXplciB8fCBuZXcgX1Rva2VuaXplcih0aGlzLmRlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEocHJvcCBpbiB0b2tlbml6ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRva2VuaXplciAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ3J1bGVzJywgJ2xleGVyJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBvcHRpb25zLCBydWxlcywgYW5kIGxleGVyIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuaXplclByb3AgPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbml6ZXJGdW5jID0gcGFjay50b2tlbml6ZXJbdG9rZW5pemVyUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZUb2tlbml6ZXIgPSB0b2tlbml6ZXJbdG9rZW5pemVyUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgdG9rZW5pemVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgY2Fubm90IHR5cGUgdG9rZW5pemVyIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgIHRva2VuaXplclt0b2tlbml6ZXJQcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gdG9rZW5pemVyRnVuYy5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBwcmV2VG9rZW5pemVyLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vID09LS0gUGFyc2UgSG9va3MgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgICAgICAgICBpZiAocGFjay5ob29rcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvb2tzID0gdGhpcy5kZWZhdWx0cy5ob29rcyB8fCBuZXcgX0hvb2tzKCk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2suaG9va3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEocHJvcCBpbiBob29rcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaG9vayAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ2Jsb2NrJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBvcHRpb25zIGFuZCBibG9jayBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rc1Byb3AgPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rc0Z1bmMgPSBwYWNrLmhvb2tzW2hvb2tzUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZIb29rID0gaG9va3NbaG9va3NQcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9Ib29rcy5wYXNzVGhyb3VnaEhvb2tzLmhhcyhwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW5ub3QgdHlwZSBob29rIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBob29rc1tob29rc1Byb3BdID0gKGFyZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaG9va3NGdW5jLmNhbGwoaG9va3MsIGFyZykpLnRoZW4ocmV0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2SG9vay5jYWxsKGhvb2tzLCByZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gaG9va3NGdW5jLmNhbGwoaG9va3MsIGFyZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZIb29rLmNhbGwoaG9va3MsIHJldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW5ub3QgdHlwZSBob29rIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBob29rc1tob29rc1Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gaG9va3NGdW5jLmFwcGx5KGhvb2tzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBwcmV2SG9vay5hcHBseShob29rcywgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdHMuaG9va3MgPSBob29rcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vID09LS0gUGFyc2UgV2Fsa1Rva2VucyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICAgICAgICAgIGlmIChwYWNrLndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWxrVG9rZW5zID0gdGhpcy5kZWZhdWx0cy53YWxrVG9rZW5zO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhY2tXYWxrdG9rZW5zID0gcGFjay53YWxrVG9rZW5zO1xuICAgICAgICAgICAgICAgIG9wdHMud2Fsa1Rva2VucyA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHBhY2tXYWxrdG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQod2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHsgLi4udGhpcy5kZWZhdWx0cywgLi4ub3B0cyB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHNldE9wdGlvbnMob3B0KSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7IC4uLnRoaXMuZGVmYXVsdHMsIC4uLm9wdCB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgbGV4ZXIoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBfTGV4ZXIubGV4KHNyYywgb3B0aW9ucyA/PyB0aGlzLmRlZmF1bHRzKTtcbiAgICB9XG4gICAgcGFyc2VyKHRva2Vucywgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX1BhcnNlci5wYXJzZSh0b2tlbnMsIG9wdGlvbnMgPz8gdGhpcy5kZWZhdWx0cyk7XG4gICAgfVxuICAgIHBhcnNlTWFya2Rvd24oYmxvY2tUeXBlKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIGNvbnN0IHBhcnNlID0gKHNyYywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ09wdCA9IHsgLi4ub3B0aW9ucyB9O1xuICAgICAgICAgICAgY29uc3Qgb3B0ID0geyAuLi50aGlzLmRlZmF1bHRzLCAuLi5vcmlnT3B0IH07XG4gICAgICAgICAgICBjb25zdCB0aHJvd0Vycm9yID0gdGhpcy5vbkVycm9yKCEhb3B0LnNpbGVudCwgISFvcHQuYXN5bmMpO1xuICAgICAgICAgICAgLy8gdGhyb3cgZXJyb3IgaWYgYW4gZXh0ZW5zaW9uIHNldCBhc3luYyB0byB0cnVlIGJ1dCBwYXJzZSB3YXMgY2FsbGVkIHdpdGggYXN5bmM6IGZhbHNlXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5hc3luYyA9PT0gdHJ1ZSAmJiBvcmlnT3B0LmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IFRoZSBhc3luYyBvcHRpb24gd2FzIHNldCB0byB0cnVlIGJ5IGFuIGV4dGVuc2lvbi4gUmVtb3ZlIGFzeW5jOiBmYWxzZSBmcm9tIHRoZSBwYXJzZSBvcHRpb25zIG9iamVjdCB0byByZXR1cm4gYSBQcm9taXNlLicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICd1bmRlZmluZWQnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICdcbiAgICAgICAgICAgICAgICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgICAgICAgICBvcHQuaG9va3Mub3B0aW9ucyA9IG9wdDtcbiAgICAgICAgICAgICAgICBvcHQuaG9va3MuYmxvY2sgPSBibG9ja1R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsZXhlciA9IG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcm92aWRlTGV4ZXIoKSA6IChibG9ja1R5cGUgPyBfTGV4ZXIubGV4IDogX0xleGVyLmxleElubGluZSk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZXIgPSBvcHQuaG9va3MgPyBvcHQuaG9va3MucHJvdmlkZVBhcnNlcigpIDogKGJsb2NrVHlwZSA/IF9QYXJzZXIucGFyc2UgOiBfUGFyc2VyLnBhcnNlSW5saW5lKTtcbiAgICAgICAgICAgIGlmIChvcHQuYXN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYykgOiBzcmMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHNyYyA9PiBsZXhlcihzcmMsIG9wdCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRva2VucyA9PiBvcHQuaG9va3MgPyBvcHQuaG9va3MucHJvY2Vzc0FsbFRva2Vucyh0b2tlbnMpIDogdG9rZW5zKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih0b2tlbnMgPT4gb3B0LndhbGtUb2tlbnMgPyBQcm9taXNlLmFsbCh0aGlzLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2VucykpLnRoZW4oKCkgPT4gdG9rZW5zKSA6IHRva2VucylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odG9rZW5zID0+IHBhcnNlcih0b2tlbnMsIG9wdCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGh0bWwgPT4gb3B0Lmhvb2tzID8gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpIDogaHRtbClcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKHRocm93RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNyYyA9IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCB0b2tlbnMgPSBsZXhlcihzcmMsIG9wdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMgPSBvcHQuaG9va3MucHJvY2Vzc0FsbFRva2Vucyh0b2tlbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9IHBhcnNlcih0b2tlbnMsIG9wdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICAgICAgICBodG1sID0gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwYXJzZTtcbiAgICB9XG4gICAgb25FcnJvcihzaWxlbnQsIGFzeW5jKSB7XG4gICAgICAgIHJldHVybiAoZSkgPT4ge1xuICAgICAgICAgICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuICAgICAgICAgICAgaWYgKHNpbGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICAgICAgICAgICAgICsgZXNjYXBlJDEoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICsgJzwvcHJlPic7XG4gICAgICAgICAgICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5jb25zdCBtYXJrZWRJbnN0YW5jZSA9IG5ldyBNYXJrZWQoKTtcbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCkge1xuICAgIHJldHVybiBtYXJrZWRJbnN0YW5jZS5wYXJzZShzcmMsIG9wdCk7XG59XG4vKipcbiAqIFNldHMgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBIYXNoIG9mIG9wdGlvbnNcbiAqL1xubWFya2VkLm9wdGlvbnMgPVxuICAgIG1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgbWFya2VkSW5zdGFuY2Uuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgbWFya2VkLmRlZmF1bHRzID0gbWFya2VkSW5zdGFuY2UuZGVmYXVsdHM7XG4gICAgICAgIGNoYW5nZURlZmF1bHRzKG1hcmtlZC5kZWZhdWx0cyk7XG4gICAgICAgIHJldHVybiBtYXJrZWQ7XG4gICAgfTtcbi8qKlxuICogR2V0cyB0aGUgb3JpZ2luYWwgbWFya2VkIGRlZmF1bHQgb3B0aW9ucy5cbiAqL1xubWFya2VkLmdldERlZmF1bHRzID0gX2dldERlZmF1bHRzO1xubWFya2VkLmRlZmF1bHRzID0gX2RlZmF1bHRzO1xuLyoqXG4gKiBVc2UgRXh0ZW5zaW9uXG4gKi9cbm1hcmtlZC51c2UgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIG1hcmtlZEluc3RhbmNlLnVzZSguLi5hcmdzKTtcbiAgICBtYXJrZWQuZGVmYXVsdHMgPSBtYXJrZWRJbnN0YW5jZS5kZWZhdWx0cztcbiAgICBjaGFuZ2VEZWZhdWx0cyhtYXJrZWQuZGVmYXVsdHMpO1xuICAgIHJldHVybiBtYXJrZWQ7XG59O1xuLyoqXG4gKiBSdW4gY2FsbGJhY2sgZm9yIGV2ZXJ5IHRva2VuXG4gKi9cbm1hcmtlZC53YWxrVG9rZW5zID0gZnVuY3Rpb24gKHRva2VucywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbWFya2VkSW5zdGFuY2Uud2Fsa1Rva2Vucyh0b2tlbnMsIGNhbGxiYWNrKTtcbn07XG4vKipcbiAqIENvbXBpbGVzIG1hcmtkb3duIHRvIEhUTUwgd2l0aG91dCBlbmNsb3NpbmcgYHBgIHRhZy5cbiAqXG4gKiBAcGFyYW0gc3JjIFN0cmluZyBvZiBtYXJrZG93biBzb3VyY2UgdG8gYmUgY29tcGlsZWRcbiAqIEBwYXJhbSBvcHRpb25zIEhhc2ggb2Ygb3B0aW9uc1xuICogQHJldHVybiBTdHJpbmcgb2YgY29tcGlsZWQgSFRNTFxuICovXG5tYXJrZWQucGFyc2VJbmxpbmUgPSBtYXJrZWRJbnN0YW5jZS5wYXJzZUlubGluZTtcbi8qKlxuICogRXhwb3NlXG4gKi9cbm1hcmtlZC5QYXJzZXIgPSBfUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IF9QYXJzZXIucGFyc2U7XG5tYXJrZWQuUmVuZGVyZXIgPSBfUmVuZGVyZXI7XG5tYXJrZWQuVGV4dFJlbmRlcmVyID0gX1RleHRSZW5kZXJlcjtcbm1hcmtlZC5MZXhlciA9IF9MZXhlcjtcbm1hcmtlZC5sZXhlciA9IF9MZXhlci5sZXg7XG5tYXJrZWQuVG9rZW5pemVyID0gX1Rva2VuaXplcjtcbm1hcmtlZC5Ib29rcyA9IF9Ib29rcztcbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcbmNvbnN0IG9wdGlvbnMgPSBtYXJrZWQub3B0aW9ucztcbmNvbnN0IHNldE9wdGlvbnMgPSBtYXJrZWQuc2V0T3B0aW9ucztcbmNvbnN0IHVzZSA9IG1hcmtlZC51c2U7XG5jb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLndhbGtUb2tlbnM7XG5jb25zdCBwYXJzZUlubGluZSA9IG1hcmtlZC5wYXJzZUlubGluZTtcbmNvbnN0IHBhcnNlID0gbWFya2VkO1xuY29uc3QgcGFyc2VyID0gX1BhcnNlci5wYXJzZTtcbmNvbnN0IGxleGVyID0gX0xleGVyLmxleDtcblxuZXhwb3J0IHsgX0hvb2tzIGFzIEhvb2tzLCBfTGV4ZXIgYXMgTGV4ZXIsIE1hcmtlZCwgX1BhcnNlciBhcyBQYXJzZXIsIF9SZW5kZXJlciBhcyBSZW5kZXJlciwgX1RleHRSZW5kZXJlciBhcyBUZXh0UmVuZGVyZXIsIF9Ub2tlbml6ZXIgYXMgVG9rZW5pemVyLCBfZGVmYXVsdHMgYXMgZGVmYXVsdHMsIF9nZXREZWZhdWx0cyBhcyBnZXREZWZhdWx0cywgbGV4ZXIsIG1hcmtlZCwgb3B0aW9ucywgcGFyc2UsIHBhcnNlSW5saW5lLCBwYXJzZXIsIHNldE9wdGlvbnMsIHVzZSwgd2Fsa1Rva2VucyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFya2VkLmVzbS5qcy5tYXBcbiIsCiAgICAiaW1wb3J0IHttYXJrZWR9IGZyb20gJ21hcmtlZCdcbmltcG9ydCB7cmVhZEZpbGV9IGZyb20gJ2ZzL3Byb21pc2VzJ1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJ1xuXG4vLyBDb25maWd1cmUgbWFya2VkXG5tYXJrZWQuc2V0T3B0aW9ucyh7XG5cdGdmbTogdHJ1ZSxcblx0YnJlYWtzOiBmYWxzZSxcbn0pXG5cbmV4cG9ydCBpbnRlcmZhY2UgRG9jUGFnZSB7XG5cdHRpdGxlOiBzdHJpbmdcblx0Y29udGVudDogc3RyaW5nXG5cdG1ldGFEZXNjcmlwdGlvbjogc3RyaW5nXG59XG5cbmNvbnN0IG1ldGFEZXNjcmlwdGlvblJlZ2V4ID0gLzwhLS1tZXRhLWRlc2NyaXB0aW9uXFxuKFtcXHNcXFNdKz8pXFxuLS0+L21cblxuZnVuY3Rpb24gZXh0cmFjdE1ldGFEZXNjcmlwdGlvbihtYXJrZG93bjogc3RyaW5nLCBkZWZhdWx0RGVzYzogc3RyaW5nID0gJ01pdGhyaWwuanMgRG9jdW1lbnRhdGlvbicpOiBzdHJpbmcge1xuXHRjb25zdCBtYXRjaCA9IG1hcmtkb3duLm1hdGNoKG1ldGFEZXNjcmlwdGlvblJlZ2V4KVxuXHRyZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50cmltKCkgOiBkZWZhdWx0RGVzY1xufVxuXG5mdW5jdGlvbiBleHRyYWN0VGl0bGUobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IGgxTWF0Y2ggPSBtYXJrZG93bi5tYXRjaCgvXiNcXHMrKC4rKSQvbSlcblx0cmV0dXJuIGgxTWF0Y2ggPyBoMU1hdGNoWzFdIDogJ01pdGhyaWwuanMnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkTWFya2Rvd25GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPERvY1BhZ2U+IHtcblx0Y29uc3QgbWFya2Rvd24gPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04Jylcblx0Y29uc3QgaHRtbCA9IG1hcmtlZC5wYXJzZShtYXJrZG93bikgYXMgc3RyaW5nXG5cdGNvbnN0IHRpdGxlID0gZXh0cmFjdFRpdGxlKG1hcmtkb3duKVxuXHRjb25zdCBtZXRhRGVzY3JpcHRpb24gPSBleHRyYWN0TWV0YURlc2NyaXB0aW9uKG1hcmtkb3duKVxuXHRcblx0cmV0dXJuIHtcblx0XHR0aXRsZSxcblx0XHRjb250ZW50OiBodG1sLFxuXHRcdG1ldGFEZXNjcmlwdGlvbixcblx0fVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE1hcmtkb3duRnJvbURvY3MoZG9jTmFtZTogc3RyaW5nKTogUHJvbWlzZTxEb2NQYWdlIHwgbnVsbD4ge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBsb2FkIGZyb20gdGhlIGRvY3MgcmVwb1xuXHRcdGNvbnN0IGRvY3NQYXRoID0gam9pbihpbXBvcnQubWV0YS5kaXIsICcuLi8uLi8uLi8uLi9kb2NzL2RvY3MnLCBgJHtkb2NOYW1lfS5tZGApXG5cdFx0cmV0dXJuIGF3YWl0IGxvYWRNYXJrZG93bkZpbGUoZG9jc1BhdGgpXG5cdH0gY2F0Y2gge1xuXHRcdC8vIElmIG5vdCBmb3VuZCwgcmV0dXJuIG51bGxcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG4iLAogICAgImZ1bmN0aW9uIGFzc2VydFBhdGgocGF0aCl7aWYodHlwZW9mIHBhdGghPT1cInN0cmluZ1wiKXRocm93IFR5cGVFcnJvcihcIlBhdGggbXVzdCBiZSBhIHN0cmluZy4gUmVjZWl2ZWQgXCIrSlNPTi5zdHJpbmdpZnkocGF0aCkpfWZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsYWxsb3dBYm92ZVJvb3Qpe3ZhciByZXM9XCJcIixsYXN0U2VnbWVudExlbmd0aD0wLGxhc3RTbGFzaD0tMSxkb3RzPTAsY29kZTtmb3IodmFyIGk9MDtpPD1wYXRoLmxlbmd0aDsrK2kpe2lmKGk8cGF0aC5sZW5ndGgpY29kZT1wYXRoLmNoYXJDb2RlQXQoaSk7ZWxzZSBpZihjb2RlPT09NDcpYnJlYWs7ZWxzZSBjb2RlPTQ3O2lmKGNvZGU9PT00Nyl7aWYobGFzdFNsYXNoPT09aS0xfHxkb3RzPT09MSk7ZWxzZSBpZihsYXN0U2xhc2ghPT1pLTEmJmRvdHM9PT0yKXtpZihyZXMubGVuZ3RoPDJ8fGxhc3RTZWdtZW50TGVuZ3RoIT09Mnx8cmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aC0xKSE9PTQ2fHxyZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoLTIpIT09NDYpe2lmKHJlcy5sZW5ndGg+Mil7dmFyIGxhc3RTbGFzaEluZGV4PXJlcy5sYXN0SW5kZXhPZihcIi9cIik7aWYobGFzdFNsYXNoSW5kZXghPT1yZXMubGVuZ3RoLTEpe2lmKGxhc3RTbGFzaEluZGV4PT09LTEpcmVzPVwiXCIsbGFzdFNlZ21lbnRMZW5ndGg9MDtlbHNlIHJlcz1yZXMuc2xpY2UoMCxsYXN0U2xhc2hJbmRleCksbGFzdFNlZ21lbnRMZW5ndGg9cmVzLmxlbmd0aC0xLXJlcy5sYXN0SW5kZXhPZihcIi9cIik7bGFzdFNsYXNoPWksZG90cz0wO2NvbnRpbnVlfX1lbHNlIGlmKHJlcy5sZW5ndGg9PT0yfHxyZXMubGVuZ3RoPT09MSl7cmVzPVwiXCIsbGFzdFNlZ21lbnRMZW5ndGg9MCxsYXN0U2xhc2g9aSxkb3RzPTA7Y29udGludWV9fWlmKGFsbG93QWJvdmVSb290KXtpZihyZXMubGVuZ3RoPjApcmVzKz1cIi8uLlwiO2Vsc2UgcmVzPVwiLi5cIjtsYXN0U2VnbWVudExlbmd0aD0yfX1lbHNle2lmKHJlcy5sZW5ndGg+MClyZXMrPVwiL1wiK3BhdGguc2xpY2UobGFzdFNsYXNoKzEsaSk7ZWxzZSByZXM9cGF0aC5zbGljZShsYXN0U2xhc2grMSxpKTtsYXN0U2VnbWVudExlbmd0aD1pLWxhc3RTbGFzaC0xfWxhc3RTbGFzaD1pLGRvdHM9MH1lbHNlIGlmKGNvZGU9PT00NiYmZG90cyE9PS0xKSsrZG90cztlbHNlIGRvdHM9LTF9cmV0dXJuIHJlc31mdW5jdGlvbiBfZm9ybWF0KHNlcCxwYXRoT2JqZWN0KXt2YXIgZGlyPXBhdGhPYmplY3QuZGlyfHxwYXRoT2JqZWN0LnJvb3QsYmFzZT1wYXRoT2JqZWN0LmJhc2V8fChwYXRoT2JqZWN0Lm5hbWV8fFwiXCIpKyhwYXRoT2JqZWN0LmV4dHx8XCJcIik7aWYoIWRpcilyZXR1cm4gYmFzZTtpZihkaXI9PT1wYXRoT2JqZWN0LnJvb3QpcmV0dXJuIGRpcitiYXNlO3JldHVybiBkaXIrc2VwK2Jhc2V9ZnVuY3Rpb24gcmVzb2x2ZSgpe3ZhciByZXNvbHZlZFBhdGg9XCJcIixyZXNvbHZlZEFic29sdXRlPSExLGN3ZDtmb3IodmFyIGk9YXJndW1lbnRzLmxlbmd0aC0xO2k+PS0xJiYhcmVzb2x2ZWRBYnNvbHV0ZTtpLS0pe3ZhciBwYXRoO2lmKGk+PTApcGF0aD1hcmd1bWVudHNbaV07ZWxzZXtpZihjd2Q9PT12b2lkIDApY3dkPXByb2Nlc3MuY3dkKCk7cGF0aD1jd2R9aWYoYXNzZXJ0UGF0aChwYXRoKSxwYXRoLmxlbmd0aD09PTApY29udGludWU7cmVzb2x2ZWRQYXRoPXBhdGgrXCIvXCIrcmVzb2x2ZWRQYXRoLHJlc29sdmVkQWJzb2x1dGU9cGF0aC5jaGFyQ29kZUF0KDApPT09NDd9aWYocmVzb2x2ZWRQYXRoPW5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwhcmVzb2x2ZWRBYnNvbHV0ZSkscmVzb2x2ZWRBYnNvbHV0ZSlpZihyZXNvbHZlZFBhdGgubGVuZ3RoPjApcmV0dXJuXCIvXCIrcmVzb2x2ZWRQYXRoO2Vsc2UgcmV0dXJuXCIvXCI7ZWxzZSBpZihyZXNvbHZlZFBhdGgubGVuZ3RoPjApcmV0dXJuIHJlc29sdmVkUGF0aDtlbHNlIHJldHVyblwiLlwifWZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKXtpZihhc3NlcnRQYXRoKHBhdGgpLHBhdGgubGVuZ3RoPT09MClyZXR1cm5cIi5cIjt2YXIgaXNBYnNvbHV0ZT1wYXRoLmNoYXJDb2RlQXQoMCk9PT00Nyx0cmFpbGluZ1NlcGFyYXRvcj1wYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGgtMSk9PT00NztpZihwYXRoPW5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsIWlzQWJzb2x1dGUpLHBhdGgubGVuZ3RoPT09MCYmIWlzQWJzb2x1dGUpcGF0aD1cIi5cIjtpZihwYXRoLmxlbmd0aD4wJiZ0cmFpbGluZ1NlcGFyYXRvcilwYXRoKz1cIi9cIjtpZihpc0Fic29sdXRlKXJldHVyblwiL1wiK3BhdGg7cmV0dXJuIHBhdGh9ZnVuY3Rpb24gaXNBYnNvbHV0ZShwYXRoKXtyZXR1cm4gYXNzZXJ0UGF0aChwYXRoKSxwYXRoLmxlbmd0aD4wJiZwYXRoLmNoYXJDb2RlQXQoMCk9PT00N31mdW5jdGlvbiBqb2luKCl7aWYoYXJndW1lbnRzLmxlbmd0aD09PTApcmV0dXJuXCIuXCI7dmFyIGpvaW5lZDtmb3IodmFyIGk9MDtpPGFyZ3VtZW50cy5sZW5ndGg7KytpKXt2YXIgYXJnPWFyZ3VtZW50c1tpXTtpZihhc3NlcnRQYXRoKGFyZyksYXJnLmxlbmd0aD4wKWlmKGpvaW5lZD09PXZvaWQgMClqb2luZWQ9YXJnO2Vsc2Ugam9pbmVkKz1cIi9cIithcmd9aWYoam9pbmVkPT09dm9pZCAwKXJldHVyblwiLlwiO3JldHVybiBub3JtYWxpemUoam9pbmVkKX1mdW5jdGlvbiByZWxhdGl2ZShmcm9tLHRvKXtpZihhc3NlcnRQYXRoKGZyb20pLGFzc2VydFBhdGgodG8pLGZyb209PT10bylyZXR1cm5cIlwiO2lmKGZyb209cmVzb2x2ZShmcm9tKSx0bz1yZXNvbHZlKHRvKSxmcm9tPT09dG8pcmV0dXJuXCJcIjt2YXIgZnJvbVN0YXJ0PTE7Zm9yKDtmcm9tU3RhcnQ8ZnJvbS5sZW5ndGg7Kytmcm9tU3RhcnQpaWYoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkhPT00NylicmVhazt2YXIgZnJvbUVuZD1mcm9tLmxlbmd0aCxmcm9tTGVuPWZyb21FbmQtZnJvbVN0YXJ0LHRvU3RhcnQ9MTtmb3IoO3RvU3RhcnQ8dG8ubGVuZ3RoOysrdG9TdGFydClpZih0by5jaGFyQ29kZUF0KHRvU3RhcnQpIT09NDcpYnJlYWs7dmFyIHRvRW5kPXRvLmxlbmd0aCx0b0xlbj10b0VuZC10b1N0YXJ0LGxlbmd0aD1mcm9tTGVuPHRvTGVuP2Zyb21MZW46dG9MZW4sbGFzdENvbW1vblNlcD0tMSxpPTA7Zm9yKDtpPD1sZW5ndGg7KytpKXtpZihpPT09bGVuZ3RoKXtpZih0b0xlbj5sZW5ndGgpe2lmKHRvLmNoYXJDb2RlQXQodG9TdGFydCtpKT09PTQ3KXJldHVybiB0by5zbGljZSh0b1N0YXJ0K2krMSk7ZWxzZSBpZihpPT09MClyZXR1cm4gdG8uc2xpY2UodG9TdGFydCtpKX1lbHNlIGlmKGZyb21MZW4+bGVuZ3RoKXtpZihmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0K2kpPT09NDcpbGFzdENvbW1vblNlcD1pO2Vsc2UgaWYoaT09PTApbGFzdENvbW1vblNlcD0wfWJyZWFrfXZhciBmcm9tQ29kZT1mcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0K2kpLHRvQ29kZT10by5jaGFyQ29kZUF0KHRvU3RhcnQraSk7aWYoZnJvbUNvZGUhPT10b0NvZGUpYnJlYWs7ZWxzZSBpZihmcm9tQ29kZT09PTQ3KWxhc3RDb21tb25TZXA9aX12YXIgb3V0PVwiXCI7Zm9yKGk9ZnJvbVN0YXJ0K2xhc3RDb21tb25TZXArMTtpPD1mcm9tRW5kOysraSlpZihpPT09ZnJvbUVuZHx8ZnJvbS5jaGFyQ29kZUF0KGkpPT09NDcpaWYob3V0Lmxlbmd0aD09PTApb3V0Kz1cIi4uXCI7ZWxzZSBvdXQrPVwiLy4uXCI7aWYob3V0Lmxlbmd0aD4wKXJldHVybiBvdXQrdG8uc2xpY2UodG9TdGFydCtsYXN0Q29tbW9uU2VwKTtlbHNle2lmKHRvU3RhcnQrPWxhc3RDb21tb25TZXAsdG8uY2hhckNvZGVBdCh0b1N0YXJ0KT09PTQ3KSsrdG9TdGFydDtyZXR1cm4gdG8uc2xpY2UodG9TdGFydCl9fWZ1bmN0aW9uIF9tYWtlTG9uZyhwYXRoKXtyZXR1cm4gcGF0aH1mdW5jdGlvbiBkaXJuYW1lKHBhdGgpe2lmKGFzc2VydFBhdGgocGF0aCkscGF0aC5sZW5ndGg9PT0wKXJldHVyblwiLlwiO3ZhciBjb2RlPXBhdGguY2hhckNvZGVBdCgwKSxoYXNSb290PWNvZGU9PT00NyxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwO2Zvcih2YXIgaT1wYXRoLmxlbmd0aC0xO2k+PTE7LS1pKWlmKGNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpLGNvZGU9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7ZW5kPWk7YnJlYWt9fWVsc2UgbWF0Y2hlZFNsYXNoPSExO2lmKGVuZD09PS0xKXJldHVybiBoYXNSb290P1wiL1wiOlwiLlwiO2lmKGhhc1Jvb3QmJmVuZD09PTEpcmV0dXJuXCIvL1wiO3JldHVybiBwYXRoLnNsaWNlKDAsZW5kKX1mdW5jdGlvbiBiYXNlbmFtZShwYXRoLGV4dCl7aWYoZXh0IT09dm9pZCAwJiZ0eXBlb2YgZXh0IT09XCJzdHJpbmdcIil0aHJvdyBUeXBlRXJyb3IoJ1wiZXh0XCIgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZycpO2Fzc2VydFBhdGgocGF0aCk7dmFyIHN0YXJ0PTAsZW5kPS0xLG1hdGNoZWRTbGFzaD0hMCxpO2lmKGV4dCE9PXZvaWQgMCYmZXh0Lmxlbmd0aD4wJiZleHQubGVuZ3RoPD1wYXRoLmxlbmd0aCl7aWYoZXh0Lmxlbmd0aD09PXBhdGgubGVuZ3RoJiZleHQ9PT1wYXRoKXJldHVyblwiXCI7dmFyIGV4dElkeD1leHQubGVuZ3RoLTEsZmlyc3ROb25TbGFzaEVuZD0tMTtmb3IoaT1wYXRoLmxlbmd0aC0xO2k+PTA7LS1pKXt2YXIgY29kZT1wYXRoLmNoYXJDb2RlQXQoaSk7aWYoY29kZT09PTQ3KXtpZighbWF0Y2hlZFNsYXNoKXtzdGFydD1pKzE7YnJlYWt9fWVsc2V7aWYoZmlyc3ROb25TbGFzaEVuZD09PS0xKW1hdGNoZWRTbGFzaD0hMSxmaXJzdE5vblNsYXNoRW5kPWkrMTtpZihleHRJZHg+PTApaWYoY29kZT09PWV4dC5jaGFyQ29kZUF0KGV4dElkeCkpe2lmKC0tZXh0SWR4PT09LTEpZW5kPWl9ZWxzZSBleHRJZHg9LTEsZW5kPWZpcnN0Tm9uU2xhc2hFbmR9fWlmKHN0YXJ0PT09ZW5kKWVuZD1maXJzdE5vblNsYXNoRW5kO2Vsc2UgaWYoZW5kPT09LTEpZW5kPXBhdGgubGVuZ3RoO3JldHVybiBwYXRoLnNsaWNlKHN0YXJ0LGVuZCl9ZWxzZXtmb3IoaT1wYXRoLmxlbmd0aC0xO2k+PTA7LS1pKWlmKHBhdGguY2hhckNvZGVBdChpKT09PTQ3KXtpZighbWF0Y2hlZFNsYXNoKXtzdGFydD1pKzE7YnJlYWt9fWVsc2UgaWYoZW5kPT09LTEpbWF0Y2hlZFNsYXNoPSExLGVuZD1pKzE7aWYoZW5kPT09LTEpcmV0dXJuXCJcIjtyZXR1cm4gcGF0aC5zbGljZShzdGFydCxlbmQpfX1mdW5jdGlvbiBleHRuYW1lKHBhdGgpe2Fzc2VydFBhdGgocGF0aCk7dmFyIHN0YXJ0RG90PS0xLHN0YXJ0UGFydD0wLGVuZD0tMSxtYXRjaGVkU2xhc2g9ITAscHJlRG90U3RhdGU9MDtmb3IodmFyIGk9cGF0aC5sZW5ndGgtMTtpPj0wOy0taSl7dmFyIGNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpO2lmKGNvZGU9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7c3RhcnRQYXJ0PWkrMTticmVha31jb250aW51ZX1pZihlbmQ9PT0tMSltYXRjaGVkU2xhc2g9ITEsZW5kPWkrMTtpZihjb2RlPT09NDYpe2lmKHN0YXJ0RG90PT09LTEpc3RhcnREb3Q9aTtlbHNlIGlmKHByZURvdFN0YXRlIT09MSlwcmVEb3RTdGF0ZT0xfWVsc2UgaWYoc3RhcnREb3QhPT0tMSlwcmVEb3RTdGF0ZT0tMX1pZihzdGFydERvdD09PS0xfHxlbmQ9PT0tMXx8cHJlRG90U3RhdGU9PT0wfHxwcmVEb3RTdGF0ZT09PTEmJnN0YXJ0RG90PT09ZW5kLTEmJnN0YXJ0RG90PT09c3RhcnRQYXJ0KzEpcmV0dXJuXCJcIjtyZXR1cm4gcGF0aC5zbGljZShzdGFydERvdCxlbmQpfWZ1bmN0aW9uIGZvcm1hdChwYXRoT2JqZWN0KXtpZihwYXRoT2JqZWN0PT09bnVsbHx8dHlwZW9mIHBhdGhPYmplY3QhPT1cIm9iamVjdFwiKXRocm93IFR5cGVFcnJvcignVGhlIFwicGF0aE9iamVjdFwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyt0eXBlb2YgcGF0aE9iamVjdCk7cmV0dXJuIF9mb3JtYXQoXCIvXCIscGF0aE9iamVjdCl9ZnVuY3Rpb24gcGFyc2UocGF0aCl7YXNzZXJ0UGF0aChwYXRoKTt2YXIgcmV0PXtyb290OlwiXCIsZGlyOlwiXCIsYmFzZTpcIlwiLGV4dDpcIlwiLG5hbWU6XCJcIn07aWYocGF0aC5sZW5ndGg9PT0wKXJldHVybiByZXQ7dmFyIGNvZGU9cGF0aC5jaGFyQ29kZUF0KDApLGlzQWJzb2x1dGUyPWNvZGU9PT00NyxzdGFydDtpZihpc0Fic29sdXRlMilyZXQucm9vdD1cIi9cIixzdGFydD0xO2Vsc2Ugc3RhcnQ9MDt2YXIgc3RhcnREb3Q9LTEsc3RhcnRQYXJ0PTAsZW5kPS0xLG1hdGNoZWRTbGFzaD0hMCxpPXBhdGgubGVuZ3RoLTEscHJlRG90U3RhdGU9MDtmb3IoO2k+PXN0YXJ0Oy0taSl7aWYoY29kZT1wYXRoLmNoYXJDb2RlQXQoaSksY29kZT09PTQ3KXtpZighbWF0Y2hlZFNsYXNoKXtzdGFydFBhcnQ9aSsxO2JyZWFrfWNvbnRpbnVlfWlmKGVuZD09PS0xKW1hdGNoZWRTbGFzaD0hMSxlbmQ9aSsxO2lmKGNvZGU9PT00Nil7aWYoc3RhcnREb3Q9PT0tMSlzdGFydERvdD1pO2Vsc2UgaWYocHJlRG90U3RhdGUhPT0xKXByZURvdFN0YXRlPTF9ZWxzZSBpZihzdGFydERvdCE9PS0xKXByZURvdFN0YXRlPS0xfWlmKHN0YXJ0RG90PT09LTF8fGVuZD09PS0xfHxwcmVEb3RTdGF0ZT09PTB8fHByZURvdFN0YXRlPT09MSYmc3RhcnREb3Q9PT1lbmQtMSYmc3RhcnREb3Q9PT1zdGFydFBhcnQrMSl7aWYoZW5kIT09LTEpaWYoc3RhcnRQYXJ0PT09MCYmaXNBYnNvbHV0ZTIpcmV0LmJhc2U9cmV0Lm5hbWU9cGF0aC5zbGljZSgxLGVuZCk7ZWxzZSByZXQuYmFzZT1yZXQubmFtZT1wYXRoLnNsaWNlKHN0YXJ0UGFydCxlbmQpfWVsc2V7aWYoc3RhcnRQYXJ0PT09MCYmaXNBYnNvbHV0ZTIpcmV0Lm5hbWU9cGF0aC5zbGljZSgxLHN0YXJ0RG90KSxyZXQuYmFzZT1wYXRoLnNsaWNlKDEsZW5kKTtlbHNlIHJldC5uYW1lPXBhdGguc2xpY2Uoc3RhcnRQYXJ0LHN0YXJ0RG90KSxyZXQuYmFzZT1wYXRoLnNsaWNlKHN0YXJ0UGFydCxlbmQpO3JldC5leHQ9cGF0aC5zbGljZShzdGFydERvdCxlbmQpfWlmKHN0YXJ0UGFydD4wKXJldC5kaXI9cGF0aC5zbGljZSgwLHN0YXJ0UGFydC0xKTtlbHNlIGlmKGlzQWJzb2x1dGUyKXJldC5kaXI9XCIvXCI7cmV0dXJuIHJldH12YXIgc2VwPVwiL1wiLGRlbGltaXRlcj1cIjpcIixwb3NpeD0oKHApPT4ocC5wb3NpeD1wLHApKSh7cmVzb2x2ZSxub3JtYWxpemUsaXNBYnNvbHV0ZSxqb2luLHJlbGF0aXZlLF9tYWtlTG9uZyxkaXJuYW1lLGJhc2VuYW1lLGV4dG5hbWUsZm9ybWF0LHBhcnNlLHNlcCxkZWxpbWl0ZXIsd2luMzI6bnVsbCxwb3NpeDpudWxsfSk7dmFyIHBhdGhfZGVmYXVsdD1wb3NpeDtleHBvcnR7c2VwLHJlc29sdmUscmVsYXRpdmUscG9zaXgscGFyc2Usbm9ybWFsaXplLGpvaW4saXNBYnNvbHV0ZSxmb3JtYXQsZXh0bmFtZSxkaXJuYW1lLGRlbGltaXRlcixwYXRoX2RlZmF1bHQgYXMgZGVmYXVsdCxiYXNlbmFtZSxfbWFrZUxvbmd9OyIsCiAgICAiaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnZnMvcHJvbWlzZXMnXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnXG5pbXBvcnQge21hcmtlZH0gZnJvbSAnbWFya2VkJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TmF2R3VpZGVzKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgbmF2UGF0aCA9IGpvaW4oaW1wb3J0Lm1ldGEuZGlyLCAnLi4vLi4vLi4vLi4vZG9jcy9kb2NzL25hdi1ndWlkZXMubWQnKVxuXHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShuYXZQYXRoLCAndXRmLTgnKVxuXHRcdHJldHVybiBtYXJrZWQucGFyc2UoY29udGVudCkgYXMgc3RyaW5nXG5cdH0gY2F0Y2gge1xuXHRcdHJldHVybiAnJ1xuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROYXZNZXRob2RzKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgbmF2UGF0aCA9IGpvaW4oaW1wb3J0Lm1ldGEuZGlyLCAnLi4vLi4vLi4vLi4vZG9jcy9kb2NzL25hdi1tZXRob2RzLm1kJylcblx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUobmF2UGF0aCwgJ3V0Zi04Jylcblx0XHRyZXR1cm4gbWFya2VkLnBhcnNlKGNvbnRlbnQpIGFzIHN0cmluZ1xuXHR9IGNhdGNoIHtcblx0XHRyZXR1cm4gJydcblx0fVxufVxuIiwKICAgICJpbXBvcnQgbSBmcm9tICcuLi8uLi9pbmRleCdcbmltcG9ydCB7RG9jUGFnZUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2RvYy1wYWdlJ1xuaW1wb3J0IHtsb2FkTWFya2Rvd25Gcm9tRG9jc30gZnJvbSAnLi9tYXJrZG93bidcbmltcG9ydCB7Z2V0TmF2R3VpZGVzLCBnZXROYXZNZXRob2RzfSBmcm9tICcuL25hdidcbmltcG9ydCB0eXBlIHtDb21wb25lbnRUeXBlLCBWbm9kZX0gZnJvbSAnLi4vLi4vaW5kZXgnXG5pbXBvcnQgdHlwZSB7Um91dGVSZXNvbHZlcn0gZnJvbSAnLi4vLi4vYXBpL3JvdXRlcidcblxuLy8gTWFwIG9mIHJvdXRlIHBhdGhzIHRvIG1hcmtkb3duIGZpbGUgbmFtZXNcbmNvbnN0IHJvdXRlTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuXHQnLyc6ICdpbmRleCcsXG5cdCcvaW5zdGFsbGF0aW9uLmh0bWwnOiAnaW5zdGFsbGF0aW9uJyxcblx0Jy9zaW1wbGUtYXBwbGljYXRpb24uaHRtbCc6ICdzaW1wbGUtYXBwbGljYXRpb24nLFxuXHQnL2xlYXJuaW5nLW1pdGhyaWwuaHRtbCc6ICdsZWFybmluZy1taXRocmlsJyxcblx0Jy9zdXBwb3J0Lmh0bWwnOiAnc3VwcG9ydCcsXG5cdCcvanN4Lmh0bWwnOiAnanN4Jyxcblx0Jy9lczYuaHRtbCc6ICdlczYnLFxuXHQnL2FuaW1hdGlvbi5odG1sJzogJ2FuaW1hdGlvbicsXG5cdCcvdGVzdGluZy5odG1sJzogJ3Rlc3RpbmcnLFxuXHQnL2V4YW1wbGVzLmh0bWwnOiAnZXhhbXBsZXMnLFxuXHQnL2ludGVncmF0aW5nLWxpYnMuaHRtbCc6ICdpbnRlZ3JhdGluZy1saWJzJyxcblx0Jy9wYXRocy5odG1sJzogJ3BhdGhzJyxcblx0Jy92bm9kZXMuaHRtbCc6ICd2bm9kZXMnLFxuXHQnL2NvbXBvbmVudHMuaHRtbCc6ICdjb21wb25lbnRzJyxcblx0Jy9saWZlY3ljbGUtbWV0aG9kcy5odG1sJzogJ2xpZmVjeWNsZS1tZXRob2RzJyxcblx0Jy9rZXlzLmh0bWwnOiAna2V5cycsXG5cdCcvYXV0b3JlZHJhdy5odG1sJzogJ2F1dG9yZWRyYXcnLFxuXHQnL2NvbnRyaWJ1dGluZy5odG1sJzogJ2NvbnRyaWJ1dGluZycsXG5cdCcvY3JlZGl0cy5odG1sJzogJ2NyZWRpdHMnLFxuXHQnL2NvZGUtb2YtY29uZHVjdC5odG1sJzogJ2NvZGUtb2YtY29uZHVjdCcsXG5cdCcvZnJhbWV3b3JrLWNvbXBhcmlzb24uaHRtbCc6ICdmcmFtZXdvcmstY29tcGFyaXNvbicsXG5cdCcvYXJjaGl2ZXMuaHRtbCc6ICdhcmNoaXZlcycsXG5cdCcvYXBpLmh0bWwnOiAnYXBpJyxcblx0Jy9oeXBlcnNjcmlwdC5odG1sJzogJ2h5cGVyc2NyaXB0Jyxcblx0Jy9yZW5kZXIuaHRtbCc6ICdyZW5kZXInLFxuXHQnL21vdW50Lmh0bWwnOiAnbW91bnQnLFxuXHQnL3JvdXRlLmh0bWwnOiAncm91dGUnLFxuXHQnL3JlcXVlc3QuaHRtbCc6ICdyZXF1ZXN0Jyxcblx0Jy9wYXJzZVF1ZXJ5U3RyaW5nLmh0bWwnOiAncGFyc2VRdWVyeVN0cmluZycsXG5cdCcvYnVpbGRRdWVyeVN0cmluZy5odG1sJzogJ2J1aWxkUXVlcnlTdHJpbmcnLFxuXHQnL2J1aWxkUGF0aG5hbWUuaHRtbCc6ICdidWlsZFBhdGhuYW1lJyxcblx0Jy9wYXJzZVBhdGhuYW1lLmh0bWwnOiAncGFyc2VQYXRobmFtZScsXG5cdCcvdHJ1c3QuaHRtbCc6ICd0cnVzdCcsXG5cdCcvZnJhZ21lbnQuaHRtbCc6ICdmcmFnbWVudCcsXG5cdCcvcmVkcmF3Lmh0bWwnOiAncmVkcmF3Jyxcblx0Jy9jZW5zb3IuaHRtbCc6ICdjZW5zb3InLFxuXHQnL3N0cmVhbS5odG1sJzogJ3N0cmVhbScsXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJvdXRlKHJvdXRlUGF0aDogc3RyaW5nLCBkb2NOYW1lOiBzdHJpbmcpOiBSb3V0ZVJlc29sdmVyIHtcblx0cmV0dXJuIHtcblx0XHRyZW5kZXI6IGFzeW5jICh2bm9kZTogVm5vZGUpID0+IHtcblx0XHRcdGNvbnN0IGFjdHVhbFJvdXRlUGF0aCA9IHZub2RlLmF0dHJzPy5yb3V0ZVBhdGggfHwgcm91dGVQYXRoXG5cdFx0XHRjb25zdCBbcGFnZSwgbmF2R3VpZGVzLCBuYXZNZXRob2RzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0bG9hZE1hcmtkb3duRnJvbURvY3MoZG9jTmFtZSksXG5cdFx0XHRcdGdldE5hdkd1aWRlcygpLFxuXHRcdFx0XHRnZXROYXZNZXRob2RzKCksXG5cdFx0XHRdKVxuXHRcdFx0XG5cdFx0XHRpZiAoIXBhZ2UpIHtcblx0XHRcdFx0Ly8gUmV0dXJuIDQwNCBwYWdlXG5cdFx0XHRcdHJldHVybiBtKCdkaXYnLCBbXG5cdFx0XHRcdFx0bSgnaDEnLCAnNDA0IC0gUGFnZSBOb3QgRm91bmQnKSxcblx0XHRcdFx0XHRtKCdwJywgYFRoZSBwYWdlIFwiJHtyb3V0ZVBhdGh9XCIgY291bGQgbm90IGJlIGZvdW5kLmApLFxuXHRcdFx0XHRdKVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbShEb2NQYWdlQ29tcG9uZW50IGFzIHVua25vd24gYXMgYW55LCB7XG5cdFx0XHRcdGtleTogYWN0dWFsUm91dGVQYXRoLFxuXHRcdFx0XHRyb3V0ZVBhdGg6IGFjdHVhbFJvdXRlUGF0aCxcblx0XHRcdFx0cGFnZSxcblx0XHRcdFx0bmF2R3VpZGVzLFxuXHRcdFx0XHRuYXZNZXRob2RzLFxuXHRcdFx0fSlcblx0XHR9LFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3V0ZXMoKTogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXI+IHtcblx0Y29uc3Qgcm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlcj4gPSB7fVxuXHRcblx0Zm9yIChjb25zdCBbcGF0aCwgZG9jTmFtZV0gb2YgT2JqZWN0LmVudHJpZXMocm91dGVNYXApKSB7XG5cdFx0cm91dGVzW3BhdGhdID0gY3JlYXRlUm91dGUocGF0aCwgZG9jTmFtZSlcblx0fVxuXHRcblx0cmV0dXJuIHJvdXRlc1xufVxuIiwKICAgICJpbXBvcnQgbSBmcm9tICcuLi8uLi9pbmRleCdcbmltcG9ydCB7Z2V0Um91dGVzfSBmcm9tICcuL3JvdXRlcydcblxuLy8gSW5pdGlhbGl6ZSByb3V0ZXMgb24gY2xpZW50XG5jb25zdCByb3V0ZXMgPSBnZXRSb3V0ZXMoKVxuXG4vLyBTdGFydCBjbGllbnQtc2lkZSByb3V0aW5nXG5tLnJvdXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcHAnKSEsICcvJywgcm91dGVzKVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7O0FBQ0EsSUFBZSxrQkFBQyxFQUFFOzs7QUMwQ1gsTUFBZSxvQkFBaUQ7QUFRdkU7QUFFQSxTQUFTLEtBQUssQ0FBQyxLQUFVLEtBQXlDLE9BQStDLFVBQXVDLE1BQTBDLEtBQXFDO0FBQUEsRUFDdE8sT0FBTyxFQUFDLEtBQVUsS0FBSyxPQUFPLFdBQVcsT0FBTyxTQUFTLFdBQVcsVUFBVSxZQUFZLFdBQVcsTUFBTSxRQUFRLFdBQVcsS0FBSyxPQUFPLFdBQVcsSUFBSSxXQUFXLFNBQVMsV0FBVyxPQUFPLFdBQVcsUUFBUSxXQUFXLFVBQVUsVUFBUztBQUFBO0FBRWpQLElBQU0sWUFBWSxRQUFRLENBQUMsTUFBeUI7QUFBQSxFQUNuRCxJQUFJLE1BQU0sUUFBUSxJQUFJO0FBQUEsSUFBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLFdBQVcsa0JBQWtCLElBQUksR0FBZSxXQUFXLFNBQVM7QUFBQSxFQUMxSCxJQUFJLFFBQVEsUUFBUSxPQUFPLFNBQVM7QUFBQSxJQUFXLE9BQU87QUFBQSxFQUN0RCxJQUFJ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SyxTQUFTLFVBQVUsQ0FBQyxNQUFLO0FBQUEsRUFBQyxPQUFPLFdBQVcsSUFBSSxHQUFFLEtBQUssU0FBTyxLQUFHLEtBQUssV0FBVyxDQUFDLE1BQUk7QUFBQTtBQUFHLFNBQVMsSUFBSSxHQUFFO0FBQUEsRUFBQyxJQUFHLFVBQVUsV0FBUztBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUksSUFBSTtBQUFBLEVBQU8sU0FBUSxJQUFFLEVBQUUsSUFBRSxVQUFVLFFBQU8sRUFBRSxHQUFFO0FBQUEsSUFBQyxJQUFJLE1BQUksVUFBVTtBQUFBLElBQUcsSUFBRyxXQUFXLEdBQUcsR0FBRSxJQUFJLFNBQU87QUFBQSxNQUFFLElBQUcsV0FBYztBQUFBLFFBQUUsU0FBTztBQUFBLE1BQVM7QUFBQSxrQkFBUSxNQUFJO0FBQUEsRUFBRztBQUFBLEVBQUMsSUFBRyxXQUFjO0FBQUEsSUFBRSxPQUFNO0FBQUEsRUFBSSxPQUFPLFdBQVUsTUFBTTtBQUFBO0FBQUUsU0FBUyxRQUFRLENBQUMsTUFBSyxJQUFHO0FBQUEsRUFBQyxJQUFHLFdBQVcsSUFBSSxHQUFFLFdBQVcsRUFBRSxHQUFFLFNBQU87QUFBQSxJQUFHLE9BQU07QUFBQSxFQUFHLElBQUcsT0FBSyxRQUFRLElBQUksR0FBRSxLQUFHLFFBQVEsRUFBRSxHQUFFLFNBQU87QUFBQSxJQUFHLE9BQU07QUFBQSxFQUFHLElBQUksWUFBVTtBQUFBLEVBQUUsTUFBSyxZQUFVLEtBQUssUUFBTyxFQUFFO0FBQUEsSUFBVSxJQUFHLEtBQUssV0FBVyxTQUFTLE1BQUk7QUFBQSxNQUFHO0FBQUEsRUFBTSxJQUFJLFVBQVEsS0FBSyxRQUFPLFVBQVEsVUFBUSxXQUFVLFVBQVE7QUFBQSxFQUFFLE1BQUssVUFBUSxHQUFHLFFBQU8sRUFBRTtBQUFBLElBQVEsSUFBRyxHQUFHLFdBQVcsT0FBTyxNQUFJO0FBQUEsTUFBRztBQUFBLEVBQU0sSUFBSSxRQUFNLEdBQUcsUUFBTyxRQUFNLFFBQU0sU0FBUSxTQUFPLFVBQVEsUUFBTSxVQUFRLE9BQU0sZ0JBQWMsSUFBRyxJQUFFO0FBQUEsRUFBRSxNQUFLLEtBQUcsUUFBTyxFQUFFLEdBQUU7QUFBQSxJQUFDLElBQUcsTUFBSSxRQUFPO0FBQUEsTUFBQyxJQUFHLFFBQU0sUUFBTztBQUFBLFFBQUMsSUFBRyxHQUFHLFdBQVcsVUFBUSxDQUFDLE1BQUk7QUFBQSxVQUFHLE9BQU8sR0FBRyxNQUFNLFVBQVEsSUFBRSxDQUFDO0FBQUEsUUFBTyxTQUFHLE1BQUk7QUFBQSxVQUFFLE9BQU8sR0FBRyxNQUFNLFVBQVEsQ0FBQztBQUFBLE1BQUMsRUFBTSxTQUFHLFVBQVEsUUFBTztBQUFBLFFBQUMsSUFBRyxLQUFLLFdBQVcsWUFBVSxDQUFDLE1BQUk7QUFBQSxVQUFHLGdCQUFjO0FBQUEsUUFBTyxTQUFHLE1BQUk7QUFBQSxVQUFFLGdCQUFjO0FBQUEsTUFBQztBQUFBLE1BQUM7QUFBQSxJQUFLO0FBQUEsSUFBQyxJQUFJLFdBQVMsS0FBSyxXQUFXLFlBQVUsQ0FBQyxHQUFFLFNBQU8sR0FBRyxXQUFXLFVBQVEsQ0FBQztBQUFBLElBQUUsSUFBRyxhQUFXO0FBQUEsTUFBTztBQUFBLElBQVcsU0FBRyxhQUFXO0FBQUEsTUFBRyxnQkFBYztBQUFBLEVBQUM7QUFBQSxFQUFDLElBQUksTUFBSTtBQUFBLEVBQUcsS0FBSSxJQUFFLFlBQVUsZ0JBQWMsRUFBRSxLQUFHLFNBQVEsRUFBRTtBQUFBLElBQUUsSUFBRyxNQUFJLFdBQVMsS0FBSyxXQUFXLENBQUMsTUFBSTtBQUFBLE1BQUcsSUFBRyxJQUFJLFdBQVM7QUFBQSxRQUFFLE9BQUs7QUFBQSxNQUFVO0FBQUEsZUFBSztBQUFBLEVBQU0sSUFBRyxJQUFJLFNBQU87QUFBQSxJQUFFLE9BQU8sTUFBSSxHQUFHLE1BQU0sVUFBUSxhQUFhO0FBQUEsRUFBTTtBQUFBLElBQUMsSUFBRyxXQUFTLGVBQWMsR0FBRyxXQUFXLE9BQU8sTUFBSTtBQUFBLE1BQUcsRUFBRTtBQUFBLElBQVEsT0FBTyxHQUFHLE1BQU0sT0FBTztBQUFBO0FBQUE7QUFBRyxTQUFTLFNBQVMsQ0FBQyxNQUFLO0FBQUEsRUFBQyxPQUFPO0FBQUE7QUFBSyxTQUFTLE9BQU8sQ0FBQyxNQUFLO0FBQUEsRUFBQyxJQUFHLFdBQVcsSUFBSSxHQUFFLEtBQUssV0FBUztBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUksSUFBSSxPQUFLLEtBQUssV0FBVyxDQUFDLEdBQUUsVUFBUSxTQUFPLElBQUcsTUFBSSxJQUFHLGVBQWE7QUFBQSxFQUFHLFNBQVEsSUFBRSxLQUFLLFNBQU8sRUFBRSxLQUFHLEdBQUUsRUFBRTtBQUFBLElBQUUsSUFBRyxPQUFLLEtBQUssV0FBVyxDQUFDLEdBQUUsU0FBTyxJQUFHO0FBQUEsTUFBQyxJQUFHLENBQUMsY0FBYTtBQUFBLFFBQUMsTUFBSTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsSUFBQyxFQUFNO0FBQUEscUJBQWE7QUFBQSxFQUFHLElBQUcsUUFBTTtBQUFBLElBQUcsT0FBTyxVQUFRLE1BQUk7QUFBQSxFQUFJLElBQUcsV0FBUyxRQUFNO0FBQUEsSUFBRSxPQUFNO0FBQUEsRUFBSyxPQUFPLEtBQUssTUFBTSxHQUFFLEdBQUc7QUFBQTtBQUFFLFNBQVMsUUFBUSxDQUFDLE1BQUssS0FBSTtBQUFBLEVBQUMsSUFBRyxRQUFXLGFBQUcsT0FBTyxRQUFNO0FBQUEsSUFBUyxNQUFNLFVBQVUsaUNBQWlDO0FBQUEsRUFBRSxXQUFXLElBQUk7QUFBQSxFQUFFLElBQUksUUFBTSxHQUFFLE1BQUksSUFBRyxlQUFhLE1BQUc7QUFBQSxFQUFFLElBQUcsUUFBVyxhQUFHLElBQUksU0FBTyxLQUFHLElBQUksVUFBUSxLQUFLLFFBQU87QUFBQSxJQUFDLElBQUcsSUFBSSxXQUFTLEtBQUssVUFBUSxRQUFNO0FBQUEsTUFBSyxPQUFNO0FBQUEsSUFBRyxJQUFJLFNBQU8sSUFBSSxTQUFPLEdBQUUsbUJBQWlCO0FBQUEsSUFBRyxLQUFJLElBQUUsS0FBSyxTQUFPLEVBQUUsS0FBRyxHQUFFLEVBQUUsR0FBRTtBQUFBLE1BQUMsSUFBSSxPQUFLLEtBQUssV0FBVyxDQUFDO0FBQUEsTUFBRSxJQUFHLFNBQU8sSUFBRztBQUFBLFFBQUMsSUFBRyxDQUFDLGNBQWE7QUFBQSxVQUFDLFFBQU0sSUFBRTtBQUFBLFVBQUU7QUFBQSxRQUFLO0FBQUEsTUFBQyxFQUFLO0FBQUEsUUFBQyxJQUFHLHFCQUFtQjtBQUFBLFVBQUcsZUFBYSxPQUFHLG1CQUFpQixJQUFFO0FBQUEsUUFBRSxJQUFHLFVBQVE7QUFBQSxVQUFFLElBQUcsU0FBTyxJQUFJLFdBQVcsTUFBTSxHQUFFO0FBQUEsWUFBQyxJQUFHLEVBQUUsV0FBUztBQUFBLGNBQUcsTUFBSTtBQUFBLFVBQUMsRUFBTTtBQUFBLHFCQUFPLElBQUcsTUFBSTtBQUFBO0FBQUEsSUFBaUI7QUFBQSxJQUFDLElBQUcsVUFBUTtBQUFBLE1BQUksTUFBSTtBQUFBLElBQXNCLFNBQUcsUUFBTTtBQUFBLE1BQUcsTUFBSSxLQUFLO0FBQUEsSUFBTyxPQUFPLEtBQUssTUFBTSxPQUFNLEdBQUc7QUFBQSxFQUFDLEVBQUs7QUFBQSxJQUFDLEtBQUksSUFBRSxLQUFLLFNBQU8sRUFBRSxLQUFHLEdBQUUsRUFBRTtBQUFBLE1BQUUsSUFBRyxLQUFLLFdBQVcsQ0FBQyxNQUFJLElBQUc7QUFBQSxRQUFDLElBQUcsQ0FBQyxjQUFhO0FBQUEsVUFBQyxRQUFNLElBQUU7QUFBQSxVQUFFO0FBQUEsUUFBSztBQUFBLE1BQUMsRUFBTSxTQUFHLFFBQU07QUFBQSxRQUFHLGVBQWEsT0FBRyxNQUFJLElBQUU7QUFBQSxJQUFFLElBQUcsUUFBTTtBQUFBLE1BQUcsT0FBTTtBQUFBLElBQUcsT0FBTyxLQUFLLE1BQU0sT0FBTSxHQUFHO0FBQUE7QUFBQTtBQUFHLFNBQVMsT0FBTyxDQUFDLE1BQUs7QUFBQSxFQUFDLFdBQVcsSUFBSTtBQUFBLEVBQUUsSUFBSSxXQUFTLElBQUcsWUFBVSxHQUFFLE1BQUksSUFBRyxlQUFhLE1BQUcsY0FBWTtBQUFBLEVBQUUsU0FBUSxJQUFFLEtBQUssU0FBTyxFQUFFLEtBQUcsR0FBRSxFQUFFLEdBQUU7QUFBQSxJQUFDLElBQUksT0FBSyxLQUFLLFdBQVcsQ0FBQztBQUFBLElBQUUsSUFBRyxTQUFPLElBQUc7QUFBQSxNQUFDLElBQUcsQ0FBQyxjQUFhO0FBQUEsUUFBQyxZQUFVLElBQUU7QUFBQSxRQUFFO0FBQUEsTUFBSztBQUFBLE1BQUM7QUFBQSxJQUFRO0FBQUEsSUFBQyxJQUFHLFFBQU07QUFBQSxNQUFHLGVBQWEsT0FBRyxNQUFJLElBQUU7QUFBQSxJQUFFLElBQUcsU0FBTyxJQUFHO0FBQUEsTUFBQyxJQUFHLGFBQVc7QUFBQSxRQUFHLFdBQVM7QUFBQSxNQUFPLFNBQUcsZ0JBQWM7QUFBQSxRQUFFLGNBQVk7QUFBQSxJQUFDLEVBQU0sU0FBRyxhQUFXO0FBQUEsTUFBRyxjQUFZO0FBQUEsRUFBRTtBQUFBLEVBQUMsSUFBRyxhQUFXLE1BQUksUUFBTSxNQUFJLGdCQUFjLEtBQUcsZ0JBQWMsS0FBRyxhQUFXLE1BQUksS0FBRyxhQUFXLFlBQVU7QUFBQSxJQUFFLE9BQU07QUFBQSxFQUFHLE9BQU8sS0FBSyxNQUFNLFVBQVMsR0FBRztBQUFBO0FBQUUsU0FBUyxNQUFNLENBQUMsWUFBVztBQUFBLEVBQUMsSUFBRyxlQUFhLFFBQU0sT0FBTyxlQUFhO0FBQUEsSUFBUyxNQUFNLFVBQVUscUVBQW1FLE9BQU8sVUFBVTtBQUFBLEVBQUUsT0FBTyxRQUFRLEtBQUksVUFBVTtBQUFBO0FBQUUsU0FBUyxLQUFLLENBQUMsTUFBSztBQUFBLEVBQUMsV0FBVyxJQUFJO0FBQUEsRUFBRSxJQUFJLE1BQUksRUFBQyxNQUFLLElBQUcsS0FBSSxJQUFHLE1BQUssSUFBRyxLQUFJLElBQUcsTUFBSyxHQUFFO0FBQUEsRUFBRSxJQUFHLEtBQUssV0FBUztBQUFBLElBQUUsT0FBTztBQUFBLEVBQUksSUFBSSxPQUFLLEtBQUssV0FBVyxDQUFDLEdBQUUsY0FBWSxTQUFPLElBQUc7QUFBQSxFQUFNLElBQUc7QUFBQSxJQUFZLElBQUksT0FBSyxLQUFJLFFBQU07QUFBQSxFQUFPO0FBQUEsWUFBTTtBQUFBLEVBQUUsSUFBSSxXQUFTLElBQUcsWUFBVSxHQUFFLE1BQUksSUFBRyxlQUFhLE1BQUcsSUFBRSxLQUFLLFNBQU8sR0FBRSxjQUFZO0FBQUEsRUFBRSxNQUFLLEtBQUcsT0FBTSxFQUFFLEdBQUU7QUFBQSxJQUFDLElBQUcsT0FBSyxLQUFLLFdBQVcsQ0FBQyxHQUFFLFNBQU8sSUFBRztBQUFBLE1BQUMsSUFBRyxDQUFDLGNBQWE7QUFBQSxRQUFDLFlBQVUsSUFBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsTUFBQztBQUFBLElBQVE7QUFBQSxJQUFDLElBQUcsUUFBTTtBQUFBLE1BQUcsZUFBYSxPQUFHLE1BQUksSUFBRTtBQUFBLElBQUUsSUFBRyxTQUFPLElBQUc7QUFBQSxNQUFDLElBQUcsYUFBVztBQUFBLFFBQUcsV0FBUztBQUFBLE1BQU8sU0FBRyxnQkFBYztBQUFBLFFBQUUsY0FBWTtBQUFBLElBQUMsRUFBTSxTQUFHLGFBQVc7QUFBQSxNQUFHLGNBQVk7QUFBQSxFQUFFO0FBQUEsRUFBQyxJQUFHLGFBQVcsTUFBSSxRQUFNLE1BQUksZ0JBQWMsS0FBRyxnQkFBYyxLQUFHLGFBQVcsTUFBSSxLQUFHLGFBQVcsWUFBVSxHQUFFO0FBQUEsSUFBQyxJQUFHLFFBQU07QUFBQSxNQUFHLElBQUcsY0FBWSxLQUFHO0FBQUEsUUFBWSxJQUFJLE9BQUssSUFBSSxPQUFLLEtBQUssTUFBTSxHQUFFLEdBQUc7QUFBQSxNQUFPO0FBQUEsWUFBSSxPQUFLLElBQUksT0FBSyxLQUFLLE1BQU0sV0FBVSxHQUFHO0FBQUEsRUFBQyxFQUFLO0FBQUEsSUFBQyxJQUFHLGNBQVksS0FBRztBQUFBLE1BQVksSUFBSSxPQUFLLEtBQUssTUFBTSxHQUFFLFFBQVEsR0FBRSxJQUFJLE9BQUssS0FBSyxNQUFNLEdBQUUsR0FBRztBQUFBLElBQU87QUFBQSxVQUFJLE9BQUssS0FBSyxNQUFNLFdBQVUsUUFBUSxHQUFFLElBQUksT0FBSyxLQUFLLE1BQU0sV0FBVSxHQUFHO0FBQUEsSUFBRSxJQUFJLE1BQUksS0FBSyxNQUFNLFVBQVMsR0FBRztBQUFBO0FBQUEsRUFBRSxJQUFHLFlBQVU7QUFBQSxJQUFFLElBQUksTUFBSSxLQUFLLE1BQU0sR0FBRSxZQUFVLENBQUM7QUFBQSxFQUFPLFNBQUc7QUFBQSxJQUFZLElBQUksTUFBSTtBQUFBLEVBQUksT0FBTztBQUFBO0FBQUksSUFBSSxNQUFJO0FBQVIsSUFBWSxZQUFVO0FBQXRCLElBQTBCLFNBQU8sQ0FBQyxPQUFLLEVBQUUsUUFBTSxHQUFFLElBQUksRUFBQyxTQUFRLHVCQUFVLFlBQVcsTUFBSyxVQUFTLFdBQVUsU0FBUSxVQUFTLFNBQVEsUUFBTyxPQUFNLEtBQUksV0FBVSxPQUFNLE1BQUssT0FBTSxLQUFJLENBQUM7OztBREsvNE4sT0FBTyxXQUFXO0FBQUEsRUFDakIsS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUNULENBQUM7QUFRRCxJQUFNLHVCQUF1QjtBQUU3QixTQUFTLHNCQUFzQixDQUFDLFVBQWtCLGNBQXNCLDRCQUFvQztBQUFBLEVBQzNHLE1BQU0sUUFBUSxTQUFTLE1BQU0sb0JBQW9CO0FBQUEsRUFDakQsT0FBTyxRQUFRLE1BQU0sR0FBRyxLQUFLLElBQUk7QUFBQTtBQUdsQyxTQUFTLFlBQVksQ0FBQyxVQUEwQjtBQUFBLEVBQy9DLE1BQU0sVUFBVSxTQUFTLE1BQU0sYUFBYTtBQUFBLEVBQzVDLE9BQU8sVUFBVSxRQUFRLEtBQUs7QUFBQTtBQUcvQixlQUFzQixnQkFBZ0IsQ0FBQyxVQUFvQztBQUFBLEVBQzFFLE1BQU0sV0FBVyxNQUFNLFNBQVMsVUFBVSxPQUFPO0FBQUEsRUFDakQsTUFBTSxRQUFPLE9BQU8sTUFBTSxRQUFRO0FBQUEsRUFDbEMsTUFBTSxRQUFRLGFBQWEsUUFBUTtBQUFBLEVBQ25DLE1BQU0sa0JBQWtCLHVCQUF1QixRQUFRO0FBQUEsRUFFdkQsT0FBTztBQUFBLElBQ047QUFBQSxJQUNBLFNBQVM7QUFBQSxJQUNUO0FBQUEsRUFDRDtBQUFBO0FBR0QsZUFBc0Isb0JBQW9CLENBQUMsU0FBMEM7QUFBQSxFQUNwRixJQUFJO0FBQUEsSUFFSCxNQUFNLFdBQVcsS0FBSyxZQUFZLEtBQUsseUJBQXlCLEdBQUcsWUFBWTtBQUFBLElBQy9FLE9BQU8sTUFBTSxpQkFBaUIsUUFBUTtBQUFBLElBQ3JDLE1BQU07QUFBQSxJQUVQLE9BQU87QUFBQTtBQUFBOzs7QUVoRFQ7QUFJQSxlQUFzQixZQUFZLEdBQW9CO0FBQUEsRUFDckQsSUFBSTtBQUFBLElBQ0gsTUFBTSxVQUFVLEtBQUssWUFBWSxLQUFLLHFDQUFxQztBQUFBLElBQzNFLE1BQU0sVUFBVSxNQUFNLFVBQVMsU0FBUyxPQUFPO0FBQUEsSUFDL0MsT0FBTyxPQUFPLE1BQU0sT0FBTztBQUFBLElBQzFCLE1BQU07QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBO0FBSVQsZUFBc0IsYUFBYSxHQUFvQjtBQUFBLEVBQ3RELElBQUk7QUFBQSxJQUNILE1BQU0sVUFBVSxLQUFLLFlBQVksS0FBSyxzQ0FBc0M7QUFBQSxJQUM1RSxNQUFNLFVBQVUsTUFBTSxVQUFTLFNBQVMsT0FBTztBQUFBLElBQy9DLE9BQU8sT0FBTyxNQUFNLE9BQU87QUFBQSxJQUMxQixNQUFNO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQTs7O0FDWlQsSUFBTSxXQUFtQztBQUFBLEVBQ3hDLEtBQUs7QUFBQSxFQUNMLHNCQUFzQjtBQUFBLEVBQ3RCLDRCQUE0QjtBQUFBLEVBQzVCLDBCQUEwQjtBQUFBLEVBQzFCLGlCQUFpQjtBQUFBLEVBQ2pCLGFBQWE7QUFBQSxFQUNiLGFBQWE7QUFBQSxFQUNiLG1CQUFtQjtBQUFBLEVBQ25CLGlCQUFpQjtBQUFBLEVBQ2pCLGtCQUFrQjtBQUFBLEVBQ2xCLDBCQUEwQjtBQUFBLEVBQzFCLGVBQWU7QUFBQSxFQUNmLGdCQUFnQjtBQUFBLEVBQ2hCLG9CQUFvQjtBQUFBLEVBQ3BCLDJCQUEyQjtBQUFBLEVBQzNCLGNBQWM7QUFBQSxFQUNkLG9CQUFvQjtBQUFBLEVBQ3BCLHNCQUFzQjtBQUFBLEVBQ3RCLGlCQUFpQjtBQUFBLEVBQ2pCLHlCQUF5QjtBQUFBLEVBQ3pCLDhCQUE4QjtBQUFBLEVBQzlCLGtCQUFrQjtBQUFBLEVBQ2xCLGFBQWE7QUFBQSxFQUNiLHFCQUFxQjtBQUFBLEVBQ3JCLGdCQUFnQjtBQUFBLEVBQ2hCLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFBQSxFQUNmLGlCQUFpQjtBQUFBLEVBQ2pCLDBCQUEwQjtBQUFBLEVBQzFCLDBCQUEwQjtBQUFBLEVBQzFCLHVCQUF1QjtBQUFBLEVBQ3ZCLHVCQUF1QjtBQUFBLEVBQ3ZCLGVBQWU7QUFBQSxFQUNmLGtCQUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUNqQjtBQUVBLFNBQVMsV0FBVyxDQUFDLFdBQW1CLFNBQWdDO0FBQUEsRUFDdkUsT0FBTztBQUFBLElBQ04sUUFBUSxPQUFPLFVBQWlCO0FBQUEsTUFDL0IsTUFBTSxrQkFBa0IsTUFBTSxPQUFPLGFBQWE7QUFBQSxNQUNsRCxPQUFPLE1BQU0sV0FBVyxjQUFjLE1BQU0sUUFBUSxJQUFJO0FBQUEsUUFDdkQscUJBQXFCLE9BQU87QUFBQSxRQUM1QixhQUFhO0FBQUEsUUFDYixjQUFjO0FBQUEsTUFDZixDQUFDO0FBQUEsTUFFRCxJQUFJLENBQUMsTUFBTTtBQUFBLFFBRVYsT0FBTyxnQkFBRSxPQUFPO0FBQUEsVUFDZixnQkFBRSxNQUFNLHNCQUFzQjtBQUFBLFVBQzlCLGdCQUFFLEtBQUssYUFBYSxnQ0FBZ0M7QUFBQSxRQUNyRCxDQUFDO0FBQUEsTUFDRjtBQUFBLE1BRUEsT0FBTyxnQkFBRSxrQkFBb0M7QUFBQSxRQUM1QyxLQUFLO0FBQUEsUUFDTCxXQUFXO0FBQUEsUUFDWDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRCxDQUFDO0FBQUE7QUFBQSxFQUVIO0FBQUE7QUFHTSxTQUFTLFNBQVMsR0FBa0Q7QUFBQSxFQUMxRSxNQUFNLFNBQXdELENBQUM7QUFBQSxFQUUvRCxZQUFZLE1BQU0sWUFBWSxPQUFPLFFBQVEsUUFBUSxHQUFHO0FBQUEsSUFDdkQsT0FBTyxRQUFRLFlBQVksTUFBTSxPQUFPO0FBQUEsRUFDekM7QUFBQSxFQUVBLE9BQU87QUFBQTs7O0FDaEZSLElBQU0sU0FBUyxVQUFVO0FBR3pCLGdCQUFFLE1BQU0sU0FBUyxlQUFlLEtBQUssR0FBSSxLQUFLLE1BQU07IiwKICAiZGVidWdJZCI6ICI4RTMxMTVDNEU5RDE1OTY5NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
