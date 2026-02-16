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
class MithrilComponent {
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
              if (!resolver.onmatch || payload === resolver) {
                try {
                  logger2.debug("Calling render-only resolver", {
                    pathname,
                    route: matchedRoute
                  });
                  const resolverVnode = hyperscript_default(resolver, {
                    ...data.params,
                    routePath: pathname
                  });
                  const renderedVnode = resolver.render(resolverVnode);
                  const result = await renderToString(renderedVnode);
                  const html = typeof result === "string" ? result : result.html;
                  if (html) {
                    logger2.info(`Rendered route with render-only resolver`, {
                      pathname,
                      route: matchedRoute,
                      htmlSize: html.length
                    });
                  }
                  return result;
                } catch (error) {
                  logger2.error("Route render-only resolver failed", error, {
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
class Layout extends MithrilComponent {
  view(vnode) {
    const isServer = typeof window === "undefined";
    const { page, navGuides = "", navMethods = "", version = "2.3.8" } = vnode.attrs;
    console.log("[Layout] view called, isServer:", isServer, "has page:", !!page, "has content:", !!page?.content, "content length:", page?.content?.length || 0);
    if (!page || !page.content) {
      console.log("[Layout] No page or content, rendering loading state");
      return mithril_default("div", "Loading...");
    }
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
    }, "GitHub")), navContent && navContent.trim() ? mithril_default.trust(navContent) : null)), /* @__PURE__ */ mithril_default("main", null, /* @__PURE__ */ mithril_default("div", {
      class: "body"
    }, mithril_default.trust(page.content), /* @__PURE__ */ mithril_default("div", {
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
class DocPageComponent extends MithrilComponent {
  view(vnode) {
    const isServer = typeof window === "undefined";
    console.log("[DocPageComponent] view called, isServer:", isServer, "has page:", !!vnode.attrs.page);
    if (!vnode.attrs.page) {
      console.log("[DocPageComponent] No page data, rendering error");
      return mithril_default("div", "No page data");
    }
    console.log("[DocPageComponent] Rendering Layout with page title:", vnode.attrs.page.title);
    const result = mithril_default(Layout, {
      page: vnode.attrs.page,
      routePath: vnode.attrs.routePath,
      navGuides: vnode.attrs.navGuides,
      navMethods: vnode.attrs.navMethods,
      version: vnode.attrs.version
    });
    console.log("[DocPageComponent] Layout vnode created");
    return result;
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
  if (typeof window !== "undefined" || !import.meta.dir) {
    console.log("[loadMarkdownFromDocs] Browser context, skipping load");
    return null;
  }
  try {
    const docsPath = join(import.meta.dir, "../../..", "docs", "docs", `${docName}.md`);
    console.log("[loadMarkdownFromDocs] Loading from path:", docsPath);
    const result = await loadMarkdownFile(docsPath);
    console.log("[loadMarkdownFromDocs] Successfully loaded:", docName, "title:", result.title, "content length:", result.content.length);
    return result;
  } catch (error) {
    console.error(`[loadMarkdownFromDocs] Failed to load markdown: ${docName}`, error);
    if (error instanceof Error) {
      console.error(`[loadMarkdownFromDocs] Error details:`, error.message, error.stack);
    }
    return null;
  }
}

// nav.ts
var {readFile: readFile2} = (() => ({}));
async function getNavGuides() {
  if (typeof window !== "undefined" || !import.meta.dir) {
    return "";
  }
  try {
    const navPath = join(import.meta.dir, "../../..", "docs", "docs", "nav-guides.md");
    const content = await readFile2(navPath, "utf-8");
    return marked.parse(content);
  } catch (error) {
    console.error("Failed to load nav-guides.md", error);
    return "";
  }
}
async function getNavMethods() {
  if (typeof window !== "undefined" || !import.meta.dir) {
    return "";
  }
  try {
    const navPath = join(import.meta.dir, "../../..", "docs", "docs", "nav-methods.md");
    const content = await readFile2(navPath, "utf-8");
    return marked.parse(content);
  } catch (error) {
    console.error("Failed to load nav-methods.md", error);
    return "";
  }
}

// components/doc-loader.tsx
class DocLoader extends MithrilComponent {
  page = null;
  navGuides = "";
  navMethods = "";
  loading = true;
  error = null;
  async oninit(vnode) {
    const isServer = typeof window === "undefined";
    console.log("[DocLoader] oninit called, isServer:", isServer, "docName:", vnode.attrs.docName, "routePath:", vnode.attrs.routePath);
    if (!isServer) {
      console.log("[DocLoader] Client-side: skipping data load, relying on SSR");
      this.loading = false;
      this.page = null;
      return;
    }
    try {
      console.log("[DocLoader] Server-side: Loading doc:", vnode.attrs.docName, "path:", vnode.attrs.routePath);
      const [page, navGuides, navMethods] = await Promise.all([
        loadMarkdownFromDocs(vnode.attrs.docName),
        getNavGuides(),
        getNavMethods()
      ]);
      console.log("[DocLoader] Server-side: Loaded results - page:", page ? `yes (title: ${page.title}, content length: ${page.content.length})` : "no", "navGuides:", navGuides.length, "chars", "navMethods:", navMethods.length, "chars");
      if (!page) {
        this.error = `Page "${vnode.attrs.routePath}" not found`;
        console.error("[DocLoader] Server-side: Page not found:", vnode.attrs.docName);
      } else {
        this.page = page;
        this.navGuides = navGuides;
        this.navMethods = navMethods;
        console.log("[DocLoader] Server-side: Data loaded successfully");
      }
    } catch (err) {
      console.error("[DocLoader] Server-side: Error loading:", err);
      if (err instanceof Error) {
        console.error("[DocLoader] Server-side: Error stack:", err.stack);
      }
      this.error = err instanceof Error ? err.message : "Unknown error";
    } finally {
      this.loading = false;
      console.log("[DocLoader] Server-side: oninit complete, loading:", this.loading, "has page:", !!this.page, "error:", this.error);
    }
  }
  view(vnode) {
    const isServer = typeof window === "undefined";
    console.log("[DocLoader] view called, isServer:", isServer, "loading:", this.loading, "has page:", !!this.page, "error:", this.error);
    if (!isServer && !this.page && !this.loading) {
      console.log("[DocLoader] Client-side: No page data, rendering placeholder");
      return mithril_default("div", { style: "display: none" }, "Hydrating...");
    }
    if (this.loading) {
      console.log("[DocLoader] Still loading, rendering loading state");
      return mithril_default("div", "Loading...");
    }
    if (this.error || !this.page) {
      console.log("[DocLoader] Error or no page, rendering 404");
      return mithril_default("div", [
        mithril_default("h1", "404 - Page Not Found"),
        mithril_default("p", this.error || `The page "${vnode.attrs.routePath}" could not be found.`)
      ]);
    }
    console.log("[DocLoader] Rendering DocPageComponent with page title:", this.page.title);
    const result = mithril_default(DocPageComponent, {
      page: this.page,
      routePath: vnode.attrs.routePath,
      navGuides: this.navGuides,
      navMethods: this.navMethods
    });
    if (!result || !result.tag) {
      console.error("[DocLoader] Invalid vnode from DocPageComponent, result:", result);
      return mithril_default("div", "Error rendering page");
    }
    console.log("[DocLoader] DocPageComponent vnode created, tag:", typeof result.tag === "string" ? result.tag : result.tag.name || "component");
    return result;
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
    render: (vnode) => {
      const actualRoutePath = vnode.attrs?.routePath || routePath;
      console.log("[createRoute] Rendering route:", routePath, "docName:", docName, "actualRoutePath:", actualRoutePath);
      const result = mithril_default(DocLoader, {
        key: actualRoutePath,
        routePath: actualRoutePath,
        docName
      });
      if (!result || !result.tag) {
        console.error("[createRoute] Invalid vnode returned for route:", routePath, "result:", result);
        return mithril_default("div", `Error loading route: ${routePath}`);
      }
      console.log("[createRoute] Created vnode for route:", routePath, "tag type:", typeof result.tag === "string" ? result.tag : "component");
      return result;
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

//# debugId=673284523716037E64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vdXRpbC9oYXNPd24udHMiLCAiLi4vLi4vLi4vcmVuZGVyL3Zub2RlLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9oeXBlcnNjcmlwdFZub2RlLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9lbXB0eUF0dHJzLnRzIiwgIi4uLy4uLy4uL3JlbmRlci9jYWNoZWRBdHRyc0lzU3RhdGljTWFwLnRzIiwgIi4uLy4uLy4uL3JlbmRlci90cnVzdC50cyIsICIuLi8uLi8uLi9yZW5kZXIvZnJhZ21lbnQudHMiLCAiLi4vLi4vLi4vcmVuZGVyL2h5cGVyc2NyaXB0LnRzIiwgIi4uLy4uLy4uL3NzckNvbnRleHQudHMiLCAiLi4vLi4vLi4vc2lnbmFsLnRzIiwgIi4uLy4uLy4uL2FwaS9tb3VudC1yZWRyYXcudHMiLCAiLi4vLi4vLi4vdXRpbC9kZWNvZGVVUklDb21wb25lbnRTYWZlLnRzIiwgIi4uLy4uLy4uL3F1ZXJ5c3RyaW5nL2J1aWxkLnRzIiwgIi4uLy4uLy4uL3BhdGhuYW1lL2J1aWxkLnRzIiwgIi4uLy4uLy4uL3F1ZXJ5c3RyaW5nL3BhcnNlLnRzIiwgIi4uLy4uLy4uL3BhdGhuYW1lL3BhcnNlLnRzIiwgIi4uLy4uLy4uL3BhdGhuYW1lL2NvbXBpbGVUZW1wbGF0ZS50cyIsICIuLi8uLi8uLi91dGlsL2NlbnNvci50cyIsICIuLi8uLi8uLi91dGlsL3VyaS50cyIsICIuLi8uLi8uLi9zZXJ2ZXIvbG9nZ2VyLnRzIiwgIi4uLy4uLy4uL3NlcnZlci9zc3JMb2dnZXIudHMiLCAiLi4vLi4vLi4vYXBpL3JvdXRlci50cyIsICIuLi8uLi8uLi91dGlsL3Nzci50cyIsICIuLi8uLi8uLi9yZW5kZXIvZGVsYXllZFJlbW92YWwudHMiLCAiLi4vLi4vLi4vcmVuZGVyL2RvbUZvci50cyIsICIuLi8uLi8uLi9yZW5kZXIvcmVuZGVyLnRzIiwgIi4uLy4uLy4uL3V0aWwvbmV4dF90aWNrLnRzIiwgIi4uLy4uLy4uL3N0YXRlLnRzIiwgIi4uLy4uLy4uL3N0b3JlLnRzIiwgIi4uLy4uLy4uL2luZGV4LnRzIiwgIi4uL2NvbXBvbmVudHMvbGF5b3V0LnRzeCIsICIuLi9jb21wb25lbnRzL2RvYy1wYWdlLnRzeCIsICIuLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuZXNtLmpzIiwgIi4uL21hcmtkb3duLnRzIiwgIm5vZGU6cGF0aCIsICIuLi9uYXYudHMiLCAiLi4vY29tcG9uZW50cy9kb2MtbG9hZGVyLnRzeCIsICIuLi9yb3V0ZXMudHMiLCAiLi4vY2xpZW50LnRzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvLyBUaGlzIGV4aXN0cyBzbyBJJ20gb25seSBzYXZpbmcgaXQgb25jZS5cbmV4cG9ydCBkZWZhdWx0IHt9Lmhhc093blByb3BlcnR5XG4iLAogICAgIi8vIFR5cGUgZGVmaW5pdGlvbnMgZm9yIE1pdGhyaWwgY29tcG9uZW50cyBhbmQgdm5vZGVzXG5cbmV4cG9ydCBpbnRlcmZhY2UgVm5vZGU8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBTdGF0ZSA9IGFueT4ge1xuXHR0YWc6IHN0cmluZyB8IENvbXBvbmVudDxBdHRycywgU3RhdGU+IHwgKCgpID0+IENvbXBvbmVudDxBdHRycywgU3RhdGU+KVxuXHRrZXk/OiBzdHJpbmcgfCBudW1iZXIgfCBudWxsXG5cdGF0dHJzPzogQXR0cnNcblx0Y2hpbGRyZW4/OiBDaGlsZHJlblxuXHR0ZXh0Pzogc3RyaW5nIHwgbnVtYmVyXG5cdGRvbT86IE5vZGUgfCBudWxsXG5cdGlzPzogc3RyaW5nXG5cdGRvbVNpemU/OiBudW1iZXJcblx0c3RhdGU/OiBTdGF0ZVxuXHRldmVudHM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cdGluc3RhbmNlPzogYW55XG59XG5cbmV4cG9ydCB0eXBlIENoaWxkcmVuID0gVm5vZGVbXSB8IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50PEF0dHJzID0gUmVjb3JkPHN0cmluZywgYW55PiwgU3RhdGUgPSBhbnk+IHtcblx0b25pbml0PzogKHZub2RlOiBWbm9kZTxBdHRycywgU3RhdGU+KSA9PiB2b2lkXG5cdG9uY3JlYXRlPzogKHZub2RlOiBWbm9kZTxBdHRycywgU3RhdGU+KSA9PiB2b2lkXG5cdG9uYmVmb3JldXBkYXRlPzogKHZub2RlOiBWbm9kZTxBdHRycywgU3RhdGU+LCBvbGQ6IFZub2RlPEF0dHJzLCBTdGF0ZT4pID0+IGJvb2xlYW4gfCB2b2lkXG5cdG9udXBkYXRlPzogKHZub2RlOiBWbm9kZTxBdHRycywgU3RhdGU+KSA9PiB2b2lkXG5cdG9uYmVmb3JlcmVtb3ZlPzogKHZub2RlOiBWbm9kZTxBdHRycywgU3RhdGU+KSA9PiBQcm9taXNlPGFueT4gfCB2b2lkXG5cdG9ucmVtb3ZlPzogKHZub2RlOiBWbm9kZTxBdHRycywgU3RhdGU+KSA9PiB2b2lkXG5cdHZpZXc6ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gQ2hpbGRyZW4gfCBWbm9kZSB8IG51bGxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRGYWN0b3J5PEF0dHJzID0gUmVjb3JkPHN0cmluZywgYW55PiwgU3RhdGUgPSBhbnk+IHtcblx0KC4uLmFyZ3M6IGFueVtdKTogQ29tcG9uZW50PEF0dHJzLCBTdGF0ZT5cblx0dmlldz86ICh2bm9kZTogVm5vZGU8QXR0cnMsIFN0YXRlPikgPT4gQ2hpbGRyZW4gfCBWbm9kZSB8IG51bGxcbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50VHlwZTxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiA9IFxuXHR8IENvbXBvbmVudDxBdHRycywgU3RhdGU+XG5cdHwgQ29tcG9uZW50RmFjdG9yeTxBdHRycywgU3RhdGU+XG5cdHwgKCgpID0+IENvbXBvbmVudDxBdHRycywgU3RhdGU+KVxuXHR8IChuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBNaXRocmlsVHN4Q29tcG9uZW50PEF0dHJzPilcblxuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBUU1gvSlNYIGNsYXNzLWJhc2VkIGNvbXBvbmVudHNcbiAqIFNpbWlsYXIgdG8gbWl0aHJpbC10c3gtY29tcG9uZW50IHBhY2thZ2VcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1pdGhyaWxUc3hDb21wb25lbnQ8QXR0cnMgPSBSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG5cdG9uaW5pdD8odm5vZGU6IFZub2RlPEF0dHJzPik6IHZvaWRcblx0b25jcmVhdGU/KHZub2RlOiBWbm9kZTxBdHRycz4pOiB2b2lkXG5cdG9uYmVmb3JldXBkYXRlPyh2bm9kZTogVm5vZGU8QXR0cnM+LCBvbGQ6IFZub2RlPEF0dHJzPik6IGJvb2xlYW4gfCB2b2lkXG5cdG9udXBkYXRlPyh2bm9kZTogVm5vZGU8QXR0cnM+KTogdm9pZFxuXHRvbmJlZm9yZXJlbW92ZT8odm5vZGU6IFZub2RlPEF0dHJzPik6IFByb21pc2U8YW55PiB8IHZvaWRcblx0b25yZW1vdmU/KHZub2RlOiBWbm9kZTxBdHRycz4pOiB2b2lkXG5cdGFic3RyYWN0IHZpZXcodm5vZGU6IFZub2RlPEF0dHJzPik6IENoaWxkcmVuXG59XG5cbmZ1bmN0aW9uIFZub2RlKHRhZzogYW55LCBrZXk6IHN0cmluZyB8IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCB8IHVuZGVmaW5lZCwgY2hpbGRyZW46IENoaWxkcmVuIHwgbnVsbCB8IHVuZGVmaW5lZCwgdGV4dDogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCwgZG9tOiBOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFZub2RlIHtcblx0cmV0dXJuIHt0YWc6IHRhZywga2V5OiBrZXkgPz8gdW5kZWZpbmVkLCBhdHRyczogYXR0cnMgPz8gdW5kZWZpbmVkLCBjaGlsZHJlbjogY2hpbGRyZW4gPz8gdW5kZWZpbmVkLCB0ZXh0OiB0ZXh0ID8/IHVuZGVmaW5lZCwgZG9tOiBkb20gPz8gdW5kZWZpbmVkLCBpczogdW5kZWZpbmVkLCBkb21TaXplOiB1bmRlZmluZWQsIHN0YXRlOiB1bmRlZmluZWQsIGV2ZW50czogdW5kZWZpbmVkLCBpbnN0YW5jZTogdW5kZWZpbmVkfVxufVxuY29uc3Qgbm9ybWFsaXplID0gZnVuY3Rpb24obm9kZTogYW55KTogVm5vZGUgfCBudWxsIHtcblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHJldHVybiBWbm9kZSgnWycsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBub3JtYWxpemVDaGlsZHJlbihub2RlKSBhcyBDaGlsZHJlbiwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG5cdGlmIChub2RlID09IG51bGwgfHwgdHlwZW9mIG5vZGUgPT09ICdib29sZWFuJykgcmV0dXJuIG51bGxcblx0aWYgKHR5cGVvZiBub2RlID09PSAnb2JqZWN0JykgcmV0dXJuIG5vZGVcblx0cmV0dXJuIFZub2RlKCcjJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFN0cmluZyhub2RlKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpXG59XG5cbmNvbnN0IG5vcm1hbGl6ZUNoaWxkcmVuID0gZnVuY3Rpb24oaW5wdXQ6IGFueVtdKTogKFZub2RlIHwgbnVsbClbXSB7XG5cdC8vIFByZWFsbG9jYXRlIHRoZSBhcnJheSBsZW5ndGggKGluaXRpYWxseSBob2xleSkgYW5kIGZpbGwgZXZlcnkgaW5kZXggaW1tZWRpYXRlbHkgaW4gb3JkZXIuXG5cdC8vIEJlbmNobWFya2luZyBzaG93cyBiZXR0ZXIgcGVyZm9ybWFuY2Ugb24gVjguXG5cdGNvbnN0IGNoaWxkcmVuID0gbmV3IEFycmF5KGlucHV0Lmxlbmd0aClcblx0Ly8gQ291bnQgdGhlIG51bWJlciBvZiBrZXllZCBub3JtYWxpemVkIHZub2RlcyBmb3IgY29uc2lzdGVuY3kgY2hlY2suXG5cdC8vIE5vdGU6IHRoaXMgaXMgYSBwZXJmLXNlbnNpdGl2ZSBjaGVjay5cblx0Ly8gRnVuIGZhY3Q6IG1lcmdpbmcgdGhlIGxvb3AgbGlrZSB0aGlzIGlzIHNvbWVob3cgZmFzdGVyIHRoYW4gc3BsaXR0aW5nXG5cdC8vIHRoZSBjaGVjayB3aXRoaW4gdXBkYXRlTm9kZXMoKSwgbm90aWNlYWJseSBzby5cblx0bGV0IG51bUtleWVkID0gMFxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2hpbGRyZW5baV0gPSBub3JtYWxpemUoaW5wdXRbaV0pXG5cdFx0aWYgKGNoaWxkcmVuW2ldICE9PSBudWxsICYmIGNoaWxkcmVuW2ldIS5rZXkgIT0gbnVsbCkgbnVtS2V5ZWQrK1xuXHR9XG5cdGlmIChudW1LZXllZCAhPT0gMCAmJiBudW1LZXllZCAhPT0gaW5wdXQubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihjaGlsZHJlbi5pbmNsdWRlcyhudWxsKVxuXHRcdFx0PyAnSW4gZnJhZ21lbnRzLCB2bm9kZXMgbXVzdCBlaXRoZXIgYWxsIGhhdmUga2V5cyBvciBub25lIGhhdmUga2V5cy4gWW91IG1heSB3aXNoIHRvIGNvbnNpZGVyIHVzaW5nIGFuIGV4cGxpY2l0IGtleWVkIGVtcHR5IGZyYWdtZW50LCBtLmZyYWdtZW50KHtrZXk6IC4uLn0pLCBpbnN0ZWFkIG9mIGEgaG9sZS4nXG5cdFx0XHQ6ICdJbiBmcmFnbWVudHMsIHZub2RlcyBtdXN0IGVpdGhlciBhbGwgaGF2ZSBrZXlzIG9yIG5vbmUgaGF2ZSBrZXlzLicsXG5cdFx0KVxuXHR9XG5cdHJldHVybiBjaGlsZHJlblxufVxuXG47KFZub2RlIGFzIGFueSkubm9ybWFsaXplID0gbm9ybWFsaXplXG47KFZub2RlIGFzIGFueSkubm9ybWFsaXplQ2hpbGRyZW4gPSBub3JtYWxpemVDaGlsZHJlblxuXG5leHBvcnQgZGVmYXVsdCBWbm9kZSBhcyB0eXBlb2YgVm5vZGUgJiB7XG5cdG5vcm1hbGl6ZTogdHlwZW9mIG5vcm1hbGl6ZVxuXHRub3JtYWxpemVDaGlsZHJlbjogdHlwZW9mIG5vcm1hbGl6ZUNoaWxkcmVuXG59XG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuL3Zub2RlJ1xuXG4vLyBOb3RlOiB0aGUgcHJvY2Vzc2luZyBvZiB2YXJpYWRpYyBwYXJhbWV0ZXJzIGlzIHBlcmYtc2Vuc2l0aXZlLlxuLy9cbi8vIEluIG5hdGl2ZSBFUzYsIGl0IG1pZ2h0IGJlIHByZWZlcmFibGUgdG8gZGVmaW5lIGh5cGVyc2NyaXB0IGFuZCBmcmFnbWVudFxuLy8gZmFjdG9yaWVzIHdpdGggYSBmaW5hbCAuLi5hcmdzIHBhcmFtZXRlciBhbmQgY2FsbCBoeXBlcnNjcmlwdFZub2RlKC4uLmFyZ3MpLFxuLy8gc2luY2UgbW9kZXJuIGVuZ2luZXMgY2FuIG9wdGltaXplIHNwcmVhZCBjYWxscy5cbi8vXG4vLyBIb3dldmVyLCBiZW5jaG1hcmtzIHNob3dlZCB0aGlzIHdhcyBub3QgZmFzdGVyLiBBcyBhIHJlc3VsdCwgc3ByZWFkIGlzIHVzZWRcbi8vIG9ubHkgaW4gdGhlIHBhcmFtZXRlciBsaXN0cyBvZiBoeXBlcnNjcmlwdCBhbmQgZnJhZ21lbnQsIHdoaWxlIGFuIGFycmF5IGlzXG4vLyBwYXNzZWQgdG8gaHlwZXJzY3JpcHRWbm9kZS5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGh5cGVyc2NyaXB0Vm5vZGUoYXR0cnM6IGFueSwgY2hpbGRyZW46IGFueVtdKTogYW55IHtcblx0aWYgKGF0dHJzID09IG51bGwgfHwgdHlwZW9mIGF0dHJzID09PSAnb2JqZWN0JyAmJiBhdHRycy50YWcgPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShhdHRycykpIHtcblx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIEFycmF5LmlzQXJyYXkoY2hpbGRyZW5bMF0pKSBjaGlsZHJlbiA9IGNoaWxkcmVuWzBdXG5cdH0gZWxzZSB7XG5cdFx0Y2hpbGRyZW4gPSBjaGlsZHJlbi5sZW5ndGggPT09IDAgJiYgQXJyYXkuaXNBcnJheShhdHRycykgPyBhdHRycyA6IFthdHRycywgLi4uY2hpbGRyZW5dXG5cdFx0YXR0cnMgPSB1bmRlZmluZWRcblx0fVxuXG5cdHJldHVybiBWbm9kZSgnJywgYXR0cnMgJiYgYXR0cnMua2V5LCBhdHRycywgY2hpbGRyZW4sIG51bGwsIG51bGwpXG59XG4iLAogICAgIi8vIFRoaXMgaXMgYW4gYXR0cnMgb2JqZWN0IHRoYXQgaXMgdXNlZCBieSBkZWZhdWx0IHdoZW4gYXR0cnMgaXMgdW5kZWZpbmVkIG9yIG51bGwuXG5leHBvcnQgZGVmYXVsdCB7fVxuIiwKICAgICJpbXBvcnQgZW1wdHlBdHRycyBmcm9tICcuL2VtcHR5QXR0cnMnXG5cbi8vIFRoaXMgTWFwIG1hbmFnZXMgdGhlIGZvbGxvd2luZzpcbi8vIC0gV2hldGhlciBhbiBhdHRycyBpcyBjYWNoZWQgYXR0cnMgZ2VuZXJhdGVkIGJ5IGNvbXBpbGVTZWxlY3RvcigpLlxuLy8gLSBXaGV0aGVyIHRoZSBjYWNoZWQgYXR0cnMgaXMgXCJzdGF0aWNcIiwgaS5lLiwgZG9lcyBub3QgY29udGFpbiBhbnkgZm9ybSBhdHRyaWJ1dGVzLlxuLy8gVGhlc2UgaW5mb3JtYXRpb24gd2lsbCBiZSB1c2VmdWwgdG8gc2tpcCB1cGRhdGluZyBhdHRycyBpbiByZW5kZXIoKS5cbi8vXG4vLyBTaW5jZSB0aGUgYXR0cnMgdXNlZCBhcyBrZXlzIGluIHRoaXMgbWFwIGFyZSBub3QgcmVsZWFzZWQgZnJvbSB0aGUgc2VsZWN0b3JDYWNoZSBvYmplY3QsXG4vLyB0aGVyZSBpcyBubyByaXNrIG9mIG1lbW9yeSBsZWFrcy4gVGhlcmVmb3JlLCBNYXAgaXMgdXNlZCBoZXJlIGluc3RlYWQgb2YgV2Vha01hcC5cbmV4cG9ydCBkZWZhdWx0IG5ldyBNYXAoW1tlbXB0eUF0dHJzLCB0cnVlXV0pXG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuL3Zub2RlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cnVzdChodG1sOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogYW55IHtcblx0aWYgKGh0bWwgPT0gbnVsbCkgaHRtbCA9ICcnXG5cdHJldHVybiBWbm9kZSgnPCcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBodG1sLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcbn1cbiIsCiAgICAiaW1wb3J0IFZub2RlIGZyb20gJy4vdm5vZGUnXG5pbXBvcnQgaHlwZXJzY3JpcHRWbm9kZSBmcm9tICcuL2h5cGVyc2NyaXB0Vm5vZGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZyYWdtZW50KGF0dHJzOiBhbnksIC4uLmNoaWxkcmVuOiBhbnlbXSk6IGFueSB7XG5cdGNvbnN0IHZub2RlID0gaHlwZXJzY3JpcHRWbm9kZShhdHRycywgY2hpbGRyZW4pXG5cblx0aWYgKHZub2RlLmF0dHJzID09IG51bGwpIHZub2RlLmF0dHJzID0ge31cblx0dm5vZGUudGFnID0gJ1snXG5cdHZub2RlLmNoaWxkcmVuID0gVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4odm5vZGUuY2hpbGRyZW4pXG5cdHJldHVybiB2bm9kZVxufVxuIiwKICAgICJpbXBvcnQgaGFzT3duIGZyb20gJy4uL3V0aWwvaGFzT3duJ1xuXG5pbXBvcnQgVm5vZGUgZnJvbSAnLi92bm9kZSdcbmltcG9ydCBoeXBlcnNjcmlwdFZub2RlIGZyb20gJy4vaHlwZXJzY3JpcHRWbm9kZSdcbmltcG9ydCBlbXB0eUF0dHJzIGZyb20gJy4vZW1wdHlBdHRycydcbmltcG9ydCBjYWNoZWRBdHRyc0lzU3RhdGljTWFwIGZyb20gJy4vY2FjaGVkQXR0cnNJc1N0YXRpY01hcCdcbmltcG9ydCB0cnVzdCBmcm9tICcuL3RydXN0J1xuaW1wb3J0IGZyYWdtZW50IGZyb20gJy4vZnJhZ21lbnQnXG5cbmltcG9ydCB0eXBlIHtDb21wb25lbnRUeXBlLCBDaGlsZHJlbiwgVm5vZGUgYXMgVm5vZGVUeXBlfSBmcm9tICcuL3Zub2RlJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEh5cGVyc2NyaXB0IHtcblx0KHNlbGVjdG9yOiBzdHJpbmcsIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKTogVm5vZGVUeXBlXG5cdChzZWxlY3Rvcjogc3RyaW5nLCBhdHRyczogUmVjb3JkPHN0cmluZywgYW55PiwgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pOiBWbm9kZVR5cGVcblx0PEF0dHJzLCBTdGF0ZT4oY29tcG9uZW50OiBDb21wb25lbnRUeXBlPEF0dHJzLCBTdGF0ZT4sIC4uLmNoaWxkcmVuOiBDaGlsZHJlbltdKTogVm5vZGVUeXBlPEF0dHJzLCBTdGF0ZT5cblx0PEF0dHJzLCBTdGF0ZT4oY29tcG9uZW50OiBDb21wb25lbnRUeXBlPEF0dHJzLCBTdGF0ZT4sIGF0dHJzOiBBdHRycywgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pOiBWbm9kZVR5cGU8QXR0cnMsIFN0YXRlPlxuXHR0cnVzdChodG1sOiBzdHJpbmcpOiBWbm9kZVR5cGVcblx0ZnJhZ21lbnQoYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSk6IFZub2RlVHlwZVxuXHRGcmFnbWVudDogc3RyaW5nXG59XG5cbmNvbnN0IHNlbGVjdG9yUGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsoLis/KSg/Olxccyo9XFxzKihcInwnfCkoKD86XFxcXFtcIidcXF1dfC4pKj8pXFw1KT9cXF0pL2dcbmNvbnN0IHNlbGVjdG9yQ2FjaGU6IFJlY29yZDxzdHJpbmcsIHt0YWc6IHN0cmluZzsgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT47IGlzPzogc3RyaW5nfT4gPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbmZ1bmN0aW9uIGlzRW1wdHkob2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogYm9vbGVhbiB7XG5cdGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkgaWYgKGhhc093bi5jYWxsKG9iamVjdCwga2V5KSkgcmV0dXJuIGZhbHNlXG5cdHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGlzRm9ybUF0dHJpYnV0ZUtleShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRyZXR1cm4ga2V5ID09PSAndmFsdWUnIHx8IGtleSA9PT0gJ2NoZWNrZWQnIHx8IGtleSA9PT0gJ3NlbGVjdGVkSW5kZXgnIHx8IGtleSA9PT0gJ3NlbGVjdGVkJ1xufVxuXG5mdW5jdGlvbiBjb21waWxlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHt0YWc6IHN0cmluZzsgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT47IGlzPzogc3RyaW5nfSB7XG5cdGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbFxuXHRsZXQgdGFnID0gJ2Rpdidcblx0Y29uc3QgY2xhc3Nlczogc3RyaW5nW10gPSBbXVxuXHRsZXQgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXHRsZXQgaXNTdGF0aWMgPSB0cnVlXG5cdHdoaWxlICgobWF0Y2ggPSBzZWxlY3RvclBhcnNlci5leGVjKHNlbGVjdG9yKSkgIT09IG51bGwpIHtcblx0XHRjb25zdCB0eXBlID0gbWF0Y2hbMV1cblx0XHRjb25zdCB2YWx1ZSA9IG1hdGNoWzJdXG5cdFx0aWYgKHR5cGUgPT09ICcnICYmIHZhbHVlICE9PSAnJykgdGFnID0gdmFsdWVcblx0XHRlbHNlIGlmICh0eXBlID09PSAnIycpIGF0dHJzLmlkID0gdmFsdWVcblx0XHRlbHNlIGlmICh0eXBlID09PSAnLicpIGNsYXNzZXMucHVzaCh2YWx1ZSlcblx0XHRlbHNlIGlmIChtYXRjaFszXVswXSA9PT0gJ1snKSB7XG5cdFx0XHRsZXQgYXR0clZhbHVlID0gbWF0Y2hbNl1cblx0XHRcdGlmIChhdHRyVmFsdWUpIGF0dHJWYWx1ZSA9IGF0dHJWYWx1ZS5yZXBsYWNlKC9cXFxcKFtcIiddKS9nLCAnJDEnKS5yZXBsYWNlKC9cXFxcXFxcXC9nLCAnXFxcXCcpXG5cdFx0XHRpZiAobWF0Y2hbNF0gPT09ICdjbGFzcycpIGNsYXNzZXMucHVzaChhdHRyVmFsdWUpXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YXR0cnNbbWF0Y2hbNF1dID0gYXR0clZhbHVlID09PSAnJyA/IGF0dHJWYWx1ZSA6IGF0dHJWYWx1ZSB8fCB0cnVlXG5cdFx0XHRcdGlmIChpc0Zvcm1BdHRyaWJ1dGVLZXkobWF0Y2hbNF0pKSBpc1N0YXRpYyA9IGZhbHNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChjbGFzc2VzLmxlbmd0aCA+IDApIGF0dHJzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpXG5cdGlmIChpc0VtcHR5KGF0dHJzKSkgYXR0cnMgPSBlbXB0eUF0dHJzXG5cdGVsc2UgY2FjaGVkQXR0cnNJc1N0YXRpY01hcC5zZXQoYXR0cnMsIGlzU3RhdGljKVxuXHRyZXR1cm4gc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0gPSB7dGFnOiB0YWcsIGF0dHJzOiBhdHRycywgaXM6IGF0dHJzLmlzfVxufVxuXG5mdW5jdGlvbiBleGVjU2VsZWN0b3Ioc3RhdGU6IHt0YWc6IHN0cmluZzsgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT47IGlzPzogc3RyaW5nfSwgdm5vZGU6IGFueSk6IGFueSB7XG5cdHZub2RlLnRhZyA9IHN0YXRlLnRhZ1xuXG5cdGxldCBhdHRycyA9IHZub2RlLmF0dHJzXG5cdGlmIChhdHRycyA9PSBudWxsKSB7XG5cdFx0dm5vZGUuYXR0cnMgPSBzdGF0ZS5hdHRyc1xuXHRcdHZub2RlLmlzID0gc3RhdGUuaXNcblx0XHRyZXR1cm4gdm5vZGVcblx0fVxuXG5cdGlmIChoYXNPd24uY2FsbChhdHRycywgJ2NsYXNzJykpIHtcblx0XHRpZiAoYXR0cnMuY2xhc3MgIT0gbnVsbCkgYXR0cnMuY2xhc3NOYW1lID0gYXR0cnMuY2xhc3Ncblx0XHRhdHRycy5jbGFzcyA9IG51bGxcblx0fVxuXG5cdGlmIChzdGF0ZS5hdHRycyAhPT0gZW1wdHlBdHRycykge1xuXHRcdGNvbnN0IGNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzTmFtZVxuXHRcdGF0dHJzID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuYXR0cnMsIGF0dHJzKVxuXG5cdFx0aWYgKHN0YXRlLmF0dHJzLmNsYXNzTmFtZSAhPSBudWxsKSBhdHRycy5jbGFzc05hbWUgPVxuXHRcdFx0Y2xhc3NOYW1lICE9IG51bGxcblx0XHRcdFx0PyBTdHJpbmcoc3RhdGUuYXR0cnMuY2xhc3NOYW1lKSArICcgJyArIFN0cmluZyhjbGFzc05hbWUpXG5cdFx0XHRcdDogc3RhdGUuYXR0cnMuY2xhc3NOYW1lXG5cdH1cblxuXHQvLyB3b3JrYXJvdW5kIGZvciAjMjYyMiAocmVvcmRlciBrZXlzIGluIGF0dHJzIHRvIHNldCBcInR5cGVcIiBmaXJzdClcblx0Ly8gVGhlIERPTSBkb2VzIHRoaW5ncyB0byBpbnB1dHMgYmFzZWQgb24gdGhlIFwidHlwZVwiLCBzbyBpdCBuZWVkcyBzZXQgZmlyc3QuXG5cdC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL01pdGhyaWxKUy9taXRocmlsLmpzL2lzc3Vlcy8yNjIyXG5cdGlmIChzdGF0ZS50YWcgPT09ICdpbnB1dCcgJiYgaGFzT3duLmNhbGwoYXR0cnMsICd0eXBlJykpIHtcblx0XHRhdHRycyA9IE9iamVjdC5hc3NpZ24oe3R5cGU6IGF0dHJzLnR5cGV9LCBhdHRycylcblx0fVxuXG5cdC8vIFRoaXMgcmVkdWNlcyB0aGUgY29tcGxleGl0eSBvZiB0aGUgZXZhbHVhdGlvbiBvZiBcImlzXCIgd2l0aGluIHRoZSByZW5kZXIgZnVuY3Rpb24uXG5cdHZub2RlLmlzID0gYXR0cnMuaXNcblxuXHR2bm9kZS5hdHRycyA9IGF0dHJzXG5cblx0cmV0dXJuIHZub2RlXG59XG5cbmZ1bmN0aW9uIGh5cGVyc2NyaXB0KHNlbGVjdG9yOiBzdHJpbmcgfCBDb21wb25lbnRUeXBlLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsLCAuLi5jaGlsZHJlbjogQ2hpbGRyZW5bXSk6IGFueSB7XG5cdGlmIChzZWxlY3RvciA9PSBudWxsIHx8IHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIHNlbGVjdG9yICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiAoc2VsZWN0b3IgYXMgYW55KS52aWV3ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgRXJyb3IoJ1RoZSBzZWxlY3RvciBtdXN0IGJlIGVpdGhlciBhIHN0cmluZyBvciBhIGNvbXBvbmVudC4nKVxuXHR9XG5cblx0Y29uc3Qgdm5vZGUgPSBoeXBlcnNjcmlwdFZub2RlKGF0dHJzLCBjaGlsZHJlbilcblxuXHRpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuXHRcdHZub2RlLmNoaWxkcmVuID0gVm5vZGUubm9ybWFsaXplQ2hpbGRyZW4odm5vZGUuY2hpbGRyZW4pXG5cdFx0aWYgKHNlbGVjdG9yICE9PSAnWycpIHJldHVybiBleGVjU2VsZWN0b3Ioc2VsZWN0b3JDYWNoZVtzZWxlY3Rvcl0gfHwgY29tcGlsZVNlbGVjdG9yKHNlbGVjdG9yKSwgdm5vZGUpXG5cdH1cblxuXHRpZiAodm5vZGUuYXR0cnMgPT0gbnVsbCkgdm5vZGUuYXR0cnMgPSB7fVxuXHR2bm9kZS50YWcgPSBzZWxlY3RvclxuXHRyZXR1cm4gdm5vZGVcbn1cblxuaHlwZXJzY3JpcHQudHJ1c3QgPSB0cnVzdFxuXG5oeXBlcnNjcmlwdC5mcmFnbWVudCA9IGZyYWdtZW50XG5oeXBlcnNjcmlwdC5GcmFnbWVudCA9ICdbJ1xuXG5leHBvcnQgZGVmYXVsdCBoeXBlcnNjcmlwdFxuIiwKICAgICIvKipcbiAqIFJlcXVlc3Qtc2NvcGVkIFNTUiBjb250ZXh0IHVzaW5nIEFzeW5jTG9jYWxTdG9yYWdlIChOb2RlL0J1bikuXG4gKiBFYWNoIFNTUiByZXF1ZXN0IHJ1bnMgaW5zaWRlIHJ1bldpdGhDb250ZXh0KCk7IGNvZGUgdGhhdCBuZWVkcyB0aGUgY3VycmVudFxuICogcmVxdWVzdCdzIHN0b3JlIG9yIHN0YXRlIHJlZ2lzdHJ5IGNhbGxzIGdldFNTUkNvbnRleHQoKSBhbmQgZ2V0cyB0aGF0XG4gKiByZXF1ZXN0J3MgY29udGV4dC4gTm8gZ2xvYmFscywgc2FmZSB1bmRlciBjb25jdXJyZW50IHJlcXVlc3RzLlxuICogSW4gdGhlIGJyb3dzZXIsIGdldFNTUkNvbnRleHQoKSByZXR1cm5zIHVuZGVmaW5lZCBhbmQgcnVuV2l0aENvbnRleHQganVzdCBydW5zIGZuLlxuICovXG50eXBlIFN0b3JhZ2VMaWtlID0ge1xuXHRnZXRTdG9yZSgpOiBTU1JBY2Nlc3NDb250ZXh0IHwgdW5kZWZpbmVkXG5cdHJ1bjxUPihjb250ZXh0OiBTU1JBY2Nlc3NDb250ZXh0LCBmbjogKCkgPT4gVCk6IFRcbn1cblxubGV0IHNzclN0b3JhZ2U6IFN0b3JhZ2VMaWtlXG5cbnRyeSB7XG5cdGNvbnN0IHtBc3luY0xvY2FsU3RvcmFnZX0gPSByZXF1aXJlKCdub2RlOmFzeW5jX2hvb2tzJykgYXMge0FzeW5jTG9jYWxTdG9yYWdlOiBuZXcgKCkgPT4gU3RvcmFnZUxpa2V9XG5cdHNzclN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2UoKVxufSBjYXRjaCB7XG5cdC8vIEJyb3dzZXIgb3IgZW52aXJvbm1lbnQgd2l0aG91dCBub2RlOmFzeW5jX2hvb2tzOyBubyByZXF1ZXN0IGNvbnRleHRcblx0c3NyU3RvcmFnZSA9IHtcblx0XHRnZXRTdG9yZTogKCkgPT4gdW5kZWZpbmVkLFxuXHRcdHJ1bjogKF9jb250ZXh0LCBmbikgPT4gZm4oKSxcblx0fVxufVxuXG4vKipcbiAqIERhdGEgZm9yIGEgc2luZ2xlIFNTUiByZXF1ZXN0LiBDcmVhdGVkIHBlciByZXF1ZXN0OyBvbmx5IHZpc2libGUgdG8gY29kZVxuICogdGhhdCBydW5zIGluc2lkZSB0aGUgc2FtZSBydW5XaXRoQ29udGV4dCgpIGNhbGwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU1NSQWNjZXNzQ29udGV4dCB7XG5cdHN0b3JlPzogYW55XG5cdC8qKiBQZXItcmVxdWVzdCBzdGF0ZSByZWdpc3RyeSBmb3Igc2VyaWFsaXphdGlvbjsgZnJlc2ggTWFwIHBlciByZXF1ZXN0LiAqL1xuXHRzdGF0ZVJlZ2lzdHJ5OiBNYXA8c3RyaW5nLCB7c3RhdGU6IGFueTsgaW5pdGlhbDogYW55fT5cblx0c2Vzc2lvbklkPzogc3RyaW5nXG5cdHNlc3Npb25EYXRhPzogYW55XG5cdC8qKiBQZXItcmVxdWVzdCBFdmVudEVtaXR0ZXI7IHByZXZlbnRzIGV2ZW50IGxpc3RlbmVycyBmcm9tIHBlcnNpc3RpbmcgYmV0d2VlbiByZXF1ZXN0cy4gKi9cblx0ZXZlbnRzPzogYW55XG5cdC8qKiBQZXItcmVxdWVzdCB3YXRjaGVyIGNsZWFudXAgZnVuY3Rpb25zOyBwcmV2ZW50cyB3YXRjaGVycyBmcm9tIHBlcnNpc3RpbmcgYmV0d2VlbiByZXF1ZXN0cy4gKi9cblx0d2F0Y2hlcnM/OiBBcnJheTwoKSA9PiB2b2lkPlxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgU1NSIHJlcXVlc3QgY29udGV4dCwgb3IgdW5kZWZpbmVkIGlmIHdlJ3JlIG5vdCBpbnNpZGVcbiAqIGEgcnVuV2l0aENvbnRleHQoKSBjYWxsIChlLmcuIG9uIHRoZSBjbGllbnQgb3Igb3V0c2lkZSBTU1IpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U1NSQ29udGV4dCgpOiBTU1JBY2Nlc3NDb250ZXh0IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIHNzclN0b3JhZ2UuZ2V0U3RvcmUoKVxufVxuXG4vKipcbiAqIFJ1bnMgZm4gd2l0aCBjb250ZXh0IGFzIHRoZSBjdXJyZW50IFNTUiBjb250ZXh0LiBVc2VkIGJ5IHRoZSBzZXJ2ZXIgc28gdGhhdFxuICogZ2V0U1NSQ29udGV4dCgpIHJldHVybnMgdGhpcyByZXF1ZXN0J3MgY29udGV4dCBmb3IgdGhlIGR1cmF0aW9uIG9mIGZuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuV2l0aENvbnRleHQ8VD4oY29udGV4dDogU1NSQWNjZXNzQ29udGV4dCwgZm46ICgpID0+IFQpOiBUIHtcblx0cmV0dXJuIHNzclN0b3JhZ2UucnVuKGNvbnRleHQsIGZuKVxufVxuXG4vKipcbiAqIENsZWFuIHVwIGFsbCB3YXRjaGVycyByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IFNTUiBjb250ZXh0LlxuICogQ2FsbGVkIGF1dG9tYXRpY2FsbHkgYXQgdGhlIGVuZCBvZiBydW5XaXRoQ29udGV4dEFzeW5jLCBidXQgY2FuIGJlIGNhbGxlZCBtYW51YWxseSBpZiBuZWVkZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwV2F0Y2hlcnMoY29udGV4dD86IFNTUkFjY2Vzc0NvbnRleHQpOiB2b2lkIHtcblx0Y29uc3QgY3R4ID0gY29udGV4dCB8fCBnZXRTU1JDb250ZXh0KClcblx0aWYgKGN0eCAmJiBjdHgud2F0Y2hlcnMgJiYgY3R4LndhdGNoZXJzLmxlbmd0aCA+IDApIHtcblx0XHRjdHgud2F0Y2hlcnMuZm9yRWFjaCh1bndhdGNoID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHVud2F0Y2goKVxuXHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNsZWFuaW5nIHVwIHdhdGNoZXI6JywgZSlcblx0XHRcdH1cblx0XHR9KVxuXHRcdGN0eC53YXRjaGVycy5sZW5ndGggPSAwXG5cdH1cbn1cblxuLyoqXG4gKiBTYW1lIGFzIHJ1bldpdGhDb250ZXh0IGJ1dCBmb3IgYXN5bmMgZnVuY3Rpb25zLlxuICogQXV0b21hdGljYWxseSBjbGVhbnMgdXAgd2F0Y2hlcnMgYXQgdGhlIGVuZCBvZiB0aGUgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldpdGhDb250ZXh0QXN5bmM8VD4oXG5cdGNvbnRleHQ6IFNTUkFjY2Vzc0NvbnRleHQsXG5cdGZuOiAoKSA9PiBQcm9taXNlPFQ+LFxuKTogUHJvbWlzZTxUPiB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IHNzclN0b3JhZ2UucnVuKGNvbnRleHQsIGZuKVxuXHR9IGZpbmFsbHkge1xuXHRcdC8vIENsZWFuIHVwIHdhdGNoZXJzIGF0IHRoZSBlbmQgb2YgU1NSIHJlcXVlc3Rcblx0XHRjbGVhbnVwV2F0Y2hlcnMoY29udGV4dClcblx0fVxufVxuIiwKICAgICIvLyBDb3JlIHNpZ25hbCBwcmltaXRpdmUgZm9yIGZpbmUtZ3JhaW5lZCByZWFjdGl2aXR5XG5cbmltcG9ydCB7Z2V0U1NSQ29udGV4dCwgcnVuV2l0aENvbnRleHR9IGZyb20gJy4vc3NyQ29udGV4dCdcblxuLy8gQ3VycmVudCBlZmZlY3QgY29udGV4dCBmb3IgZGVwZW5kZW5jeSB0cmFja2luZ1xubGV0IGN1cnJlbnRFZmZlY3Q6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsXG5cbi8vIENvbXBvbmVudC10by1zaWduYWwgZGVwZW5kZW5jeSB0cmFja2luZ1xuY29uc3QgY29tcG9uZW50U2lnbmFsTWFwID0gbmV3IFdlYWtNYXA8YW55LCBTZXQ8U2lnbmFsPGFueT4+PigpXG5jb25zdCBzaWduYWxDb21wb25lbnRNYXAgPSBuZXcgV2Vha01hcDxTaWduYWw8YW55PiwgU2V0PGFueT4+KClcblxuLy8gQ3VycmVudCBjb21wb25lbnQgY29udGV4dCBmb3IgY29tcG9uZW50LXRvLXNpZ25hbCBkZXBlbmRlbmN5IHRyYWNraW5nXG5sZXQgY3VycmVudENvbXBvbmVudDogYW55ID0gbnVsbFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudENvbXBvbmVudChjb21wb25lbnQ6IGFueSkge1xuXHRjdXJyZW50Q29tcG9uZW50ID0gY29tcG9uZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckN1cnJlbnRDb21wb25lbnQoKSB7XG5cdGN1cnJlbnRDb21wb25lbnQgPSBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50Q29tcG9uZW50KCkge1xuXHRyZXR1cm4gY3VycmVudENvbXBvbmVudFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tDb21wb25lbnRTaWduYWwoY29tcG9uZW50OiBhbnksIHNpZ25hbDogU2lnbmFsPGFueT4pIHtcblx0aWYgKCFjb21wb25lbnRTaWduYWxNYXAuaGFzKGNvbXBvbmVudCkpIHtcblx0XHRjb21wb25lbnRTaWduYWxNYXAuc2V0KGNvbXBvbmVudCwgbmV3IFNldCgpKVxuXHR9XG5cdGNvbXBvbmVudFNpZ25hbE1hcC5nZXQoY29tcG9uZW50KSEuYWRkKHNpZ25hbClcblxuXHRpZiAoIXNpZ25hbENvbXBvbmVudE1hcC5oYXMoc2lnbmFsKSkge1xuXHRcdHNpZ25hbENvbXBvbmVudE1hcC5zZXQoc2lnbmFsLCBuZXcgU2V0KCkpXG5cdH1cblx0c2lnbmFsQ29tcG9uZW50TWFwLmdldChzaWduYWwpIS5hZGQoY29tcG9uZW50KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50U2lnbmFscyhjb21wb25lbnQ6IGFueSk6IFNldDxTaWduYWw8YW55Pj4gfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gY29tcG9uZW50U2lnbmFsTWFwLmdldChjb21wb25lbnQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTaWduYWxDb21wb25lbnRzKHNpZ25hbDogU2lnbmFsPGFueT4pOiBTZXQ8YW55PiB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBzaWduYWxDb21wb25lbnRNYXAuZ2V0KHNpZ25hbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyQ29tcG9uZW50RGVwZW5kZW5jaWVzKGNvbXBvbmVudDogYW55KSB7XG5cdGNvbnN0IHNpZ25hbHMgPSBjb21wb25lbnRTaWduYWxNYXAuZ2V0KGNvbXBvbmVudClcblx0aWYgKHNpZ25hbHMpIHtcblx0XHRzaWduYWxzLmZvckVhY2goc2lnbmFsID0+IHtcblx0XHRcdGNvbnN0IGNvbXBvbmVudHMgPSBzaWduYWxDb21wb25lbnRNYXAuZ2V0KHNpZ25hbClcblx0XHRcdGlmIChjb21wb25lbnRzKSB7XG5cdFx0XHRcdGNvbXBvbmVudHMuZGVsZXRlKGNvbXBvbmVudClcblx0XHRcdFx0aWYgKGNvbXBvbmVudHMuc2l6ZSA9PT0gMCkge1xuXHRcdFx0XHRcdHNpZ25hbENvbXBvbmVudE1hcC5kZWxldGUoc2lnbmFsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRjb21wb25lbnRTaWduYWxNYXAuZGVsZXRlKGNvbXBvbmVudClcblx0fVxufVxuXG4vLyBTZXQgdXAgY2FsbGJhY2sgZm9yIHNpZ25hbC10by1jb21wb25lbnQgcmVkcmF3IGludGVncmF0aW9uXG5leHBvcnQgZnVuY3Rpb24gc2V0U2lnbmFsUmVkcmF3Q2FsbGJhY2soY2FsbGJhY2s6IChzaWduYWw6IFNpZ25hbDxhbnk+KSA9PiB2b2lkKSB7XG5cdChzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrID0gY2FsbGJhY2tcbn1cblxuLyoqXG4gKiBTaWduYWwgY2xhc3MgLSByZWFjdGl2ZSBwcmltaXRpdmUgdGhhdCB0cmFja3Mgc3Vic2NyaWJlcnNcbiAqL1xuZXhwb3J0IGNsYXNzIFNpZ25hbDxUPiB7XG5cdHByaXZhdGUgX3ZhbHVlOiBUXG5cdHByaXZhdGUgX3N1YnNjcmliZXJzOiBTZXQ8KCkgPT4gdm9pZD4gPSBuZXcgU2V0KClcblxuXHRjb25zdHJ1Y3Rvcihpbml0aWFsOiBUKSB7XG5cdFx0dGhpcy5fdmFsdWUgPSBpbml0aWFsXG5cdH1cblxuXHRnZXQgdmFsdWUoKTogVCB7XG5cdFx0Ly8gRW5zdXJlIF9zdWJzY3JpYmVycyBpcyBpbml0aWFsaXplZCAoZGVmZW5zaXZlIGNoZWNrKVxuXHRcdGlmICghdGhpcy5fc3Vic2NyaWJlcnMpIHtcblx0XHRcdHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IFNldCgpXG5cdFx0fVxuXHRcdC8vIFRyYWNrIGFjY2VzcyBkdXJpbmcgcmVuZGVyL2VmZmVjdFxuXHRcdGlmIChjdXJyZW50RWZmZWN0KSB7XG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycy5hZGQoY3VycmVudEVmZmVjdClcblx0XHR9XG5cdFx0Ly8gVHJhY2sgY29tcG9uZW50IGRlcGVuZGVuY3lcblx0XHRpZiAoY3VycmVudENvbXBvbmVudCkge1xuXHRcdFx0dHJhY2tDb21wb25lbnRTaWduYWwoY3VycmVudENvbXBvbmVudCwgdGhpcylcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3ZhbHVlXG5cdH1cblxuXHRzZXQgdmFsdWUobmV3VmFsdWU6IFQpIHtcblx0XHRpZiAodGhpcy5fdmFsdWUgIT09IG5ld1ZhbHVlKSB7XG5cdFx0XHR0aGlzLl92YWx1ZSA9IG5ld1ZhbHVlXG5cdFx0XHQvLyBFbnN1cmUgX3N1YnNjcmliZXJzIGlzIGluaXRpYWxpemVkIChkZWZlbnNpdmUgY2hlY2spXG5cdFx0XHRpZiAoIXRoaXMuX3N1YnNjcmliZXJzKSB7XG5cdFx0XHRcdHRoaXMuX3N1YnNjcmliZXJzID0gbmV3IFNldCgpXG5cdFx0XHR9XG5cdFx0XHQvLyBOb3RpZnkgYWxsIHN1YnNjcmliZXJzXG5cdFx0XHRjb25zdCBjb250ZXh0ID0gZ2V0U1NSQ29udGV4dCgpXG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycy5mb3JFYWNoKGZuID0+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHQvLyBBbHdheXMgcnVuIHdhdGNoZXJzIC0gd3JhcCBpbiBTU1IgY29udGV4dCBpZiBhdmFpbGFibGVcblx0XHRcdFx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0XHRcdFx0Ly8gUnVuIHdhdGNoZXIgaW5zaWRlIFNTUiBjb250ZXh0LCBzaW1pbGFyIHRvIGV2ZW50c1xuXHRcdFx0XHRcdFx0cnVuV2l0aENvbnRleHQoY29udGV4dCwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0Ly8gVHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBmb3IgYWZmZWN0ZWQgY29tcG9uZW50c1xuXHRcdFx0Ly8gVGhpcyBpcyBzZXQgdXAgaW4gaW5kZXgudHMgYWZ0ZXIgbS5yZWRyYXcgaXMgY3JlYXRlZFxuXHRcdFx0aWYgKChzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKSB7XG5cdFx0XHRcdDsoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjayh0aGlzKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTdWJzY3JpYmUgdG8gc2lnbmFsIGNoYW5nZXNcblx0ICovXG5cdHN1YnNjcmliZShjYWxsYmFjazogKCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuXHRcdC8vIEVuc3VyZSBfc3Vic2NyaWJlcnMgaXMgaW5pdGlhbGl6ZWQgKGRlZmVuc2l2ZSBjaGVjaylcblx0XHRpZiAoIXRoaXMuX3N1YnNjcmliZXJzKSB7XG5cdFx0XHR0aGlzLl9zdWJzY3JpYmVycyA9IG5ldyBTZXQoKVxuXHRcdH1cblx0XHR0aGlzLl9zdWJzY3JpYmVycy5hZGQoY2FsbGJhY2spXG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGlmICh0aGlzLl9zdWJzY3JpYmVycykge1xuXHRcdFx0XHR0aGlzLl9zdWJzY3JpYmVycy5kZWxldGUoY2FsbGJhY2spXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFdhdGNoIHNpZ25hbCBjaGFuZ2VzIChjb252ZW5pZW5jZSBtZXRob2QpXG5cdCAqL1xuXHR3YXRjaChjYWxsYmFjazogKG5ld1ZhbHVlOiBULCBvbGRWYWx1ZTogVCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuXHRcdGxldCBvbGRWYWx1ZSA9IHRoaXMuX3ZhbHVlXG5cdFx0Y29uc3QgdW5zdWJzY3JpYmUgPSB0aGlzLnN1YnNjcmliZSgoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlXG5cdFx0XHRjYWxsYmFjayhuZXdWYWx1ZSwgb2xkVmFsdWUpXG5cdFx0XHRvbGRWYWx1ZSA9IG5ld1ZhbHVlXG5cdFx0fSlcblx0XHRyZXR1cm4gdW5zdWJzY3JpYmVcblx0fVxuXG5cdC8qKlxuXHQgKiBQZWVrIGF0IHZhbHVlIHdpdGhvdXQgc3Vic2NyaWJpbmdcblx0ICovXG5cdHBlZWsoKTogVCB7XG5cdFx0cmV0dXJuIHRoaXMuX3ZhbHVlXG5cdH1cbn1cblxuLyoqXG4gKiBDb21wdXRlZCBzaWduYWwgLSBhdXRvbWF0aWNhbGx5IHJlY29tcHV0ZXMgd2hlbiBkZXBlbmRlbmNpZXMgY2hhbmdlXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wdXRlZFNpZ25hbDxUPiBleHRlbmRzIFNpZ25hbDxUPiB7XG5cdHByaXZhdGUgX2NvbXB1dGU6ICgpID0+IFRcblx0cHJpdmF0ZSBfZGVwZW5kZW5jaWVzOiBTZXQ8U2lnbmFsPGFueT4+ID0gbmV3IFNldCgpXG5cdHByaXZhdGUgX2lzRGlydHkgPSB0cnVlXG5cdHByaXZhdGUgX2NhY2hlZFZhbHVlITogVFxuXG5cdGNvbnN0cnVjdG9yKGNvbXB1dGU6ICgpID0+IFQpIHtcblx0XHRzdXBlcihudWxsIGFzIGFueSkgLy8gV2lsbCBiZSBjb21wdXRlZCBvbiBmaXJzdCBhY2Nlc3Ncblx0XHR0aGlzLl9jb21wdXRlID0gY29tcHV0ZVxuXHR9XG5cblx0Z2V0IHZhbHVlKCk6IFQge1xuXHRcdC8vIFRyYWNrIGFjY2VzcyBieSBvdGhlciBjb21wdXRlZCBzaWduYWxzIC0gdGhpcyBlbmFibGVzIGNvbXB1dGVkLXRvLWNvbXB1dGVkIGRlcGVuZGVuY3kgY2hhaW5zXG5cdFx0Ly8gV2hlbiBjb21wdXRlZCBCIGFjY2Vzc2VzIGNvbXB1dGVkIEEsIEEgc2hvdWxkIG5vdGlmeSBCIHdoZW4gQSdzIGRlcGVuZGVuY2llcyBjaGFuZ2Vcblx0XHRpZiAoY3VycmVudEVmZmVjdCkge1xuXHRcdFx0Ly8gRW5zdXJlIF9zdWJzY3JpYmVycyBpcyBpbml0aWFsaXplZCAoZGVmZW5zaXZlIGNoZWNrKVxuXHRcdFx0aWYgKCEodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycykge1xuXHRcdFx0XHQodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycyA9IG5ldyBTZXQoKVxuXHRcdFx0fVxuXHRcdFx0Oyh0aGlzIGFzIGFueSkuX3N1YnNjcmliZXJzLmFkZChjdXJyZW50RWZmZWN0KVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9pc0RpcnR5KSB7XG5cdFx0XHQvLyBDbGVhciBvbGQgZGVwZW5kZW5jaWVzXG5cdFx0XHR0aGlzLl9kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xuXHRcdFx0XHRkZXAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX21hcmtEaXJ0eSgpKT8uKCkgLy8gVW5zdWJzY3JpYmUgb2xkXG5cdFx0XHR9KVxuXHRcdFx0dGhpcy5fZGVwZW5kZW5jaWVzLmNsZWFyKClcblxuXHRcdFx0Ly8gVHJhY2sgZGVwZW5kZW5jaWVzIGR1cmluZyBjb21wdXRhdGlvblxuXHRcdFx0Y29uc3QgcHJldmlvdXNFZmZlY3QgPSBjdXJyZW50RWZmZWN0XG5cdFx0XHRjdXJyZW50RWZmZWN0ID0gKCkgPT4ge1xuXHRcdFx0XHR0aGlzLl9tYXJrRGlydHkoKVxuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLl9jYWNoZWRWYWx1ZSA9IHRoaXMuX2NvbXB1dGUoKVxuXHRcdFx0XHQvLyBSZS1zdWJzY3JpYmUgdG8gbmV3IGRlcGVuZGVuY2llc1xuXHRcdFx0XHQvLyBEZXBlbmRlbmNpZXMgYXJlIHRyYWNrZWQgdmlhIHRoZSBjb21wdXRlIGZ1bmN0aW9uIGFjY2Vzc2luZyBzaWduYWxzXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRjdXJyZW50RWZmZWN0ID0gcHJldmlvdXNFZmZlY3Rcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5faXNEaXJ0eSA9IGZhbHNlXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9jYWNoZWRWYWx1ZVxuXHR9XG5cblx0cHJpdmF0ZSBfbWFya0RpcnR5KCkge1xuXHRcdGlmICghdGhpcy5faXNEaXJ0eSkge1xuXHRcdFx0dGhpcy5faXNEaXJ0eSA9IHRydWVcblx0XHRcdC8vIEVuc3VyZSBfc3Vic2NyaWJlcnMgaXMgaW5pdGlhbGl6ZWQgKGRlZmVuc2l2ZSBjaGVjaylcblx0XHRcdGlmICghKHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMpIHtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5fc3Vic2NyaWJlcnMgPSBuZXcgU2V0KClcblx0XHRcdH1cblx0XHRcdC8vIE5vdGlmeSBzdWJzY3JpYmVycyB0aGF0IGNvbXB1dGVkIHZhbHVlIGNoYW5nZWRcblx0XHRcdGNvbnN0IGNvbnRleHQgPSBnZXRTU1JDb250ZXh0KClcblx0XHRcdDsodGhpcyBhcyBhbnkpLl9zdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdFx0XHQvLyBSdW4gd2F0Y2hlciBpbnNpZGUgU1NSIGNvbnRleHQsIHNpbWlsYXIgdG8gZXZlbnRzXG5cdFx0XHRcdFx0XHRydW5XaXRoQ29udGV4dChjb250ZXh0LCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGNvbXB1dGVkIHNpZ25hbCBzdWJzY3JpYmVyOicsIGUpXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0c2V0IHZhbHVlKF9uZXdWYWx1ZTogVCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQ29tcHV0ZWQgc2lnbmFscyBhcmUgcmVhZC1vbmx5Jylcblx0fVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHNpZ25hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2lnbmFsPFQ+KGluaXRpYWw6IFQpOiBTaWduYWw8VD4ge1xuXHRyZXR1cm4gbmV3IFNpZ25hbChpbml0aWFsKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIGNvbXB1dGVkIHNpZ25hbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZWQ8VD4oY29tcHV0ZTogKCkgPT4gVCk6IENvbXB1dGVkU2lnbmFsPFQ+IHtcblx0cmV0dXJuIG5ldyBDb21wdXRlZFNpZ25hbChjb21wdXRlKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlZmZlY3QgdGhhdCBydW5zIHdoZW4gZGVwZW5kZW5jaWVzIGNoYW5nZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZWZmZWN0KGZuOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG5cdGNvbnN0IHByZXZpb3VzRWZmZWN0ID0gY3VycmVudEVmZmVjdFxuXHRsZXQgY2xlYW51cDogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGxcblx0bGV0IGlzQWN0aXZlID0gdHJ1ZVxuXG5cdGNvbnN0IGVmZmVjdEZuID0gKCkgPT4ge1xuXHRcdGlmICghaXNBY3RpdmUpIHJldHVyblxuXHRcdFxuXHRcdC8vIFJ1biBjbGVhbnVwIGlmIGV4aXN0c1xuXHRcdGlmIChjbGVhbnVwKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjbGVhbnVwKClcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBlZmZlY3QgY2xlYW51cDonLCBlKVxuXHRcdFx0fVxuXHRcdFx0Y2xlYW51cCA9IG51bGxcblx0XHR9XG5cblx0XHQvLyBUcmFjayBkZXBlbmRlbmNpZXNcblx0XHRjdXJyZW50RWZmZWN0ID0gZWZmZWN0Rm5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gZm4oKVxuXHRcdFx0Ly8gSWYgZm4gcmV0dXJucyBhIGNsZWFudXAgZnVuY3Rpb24sIHN0b3JlIGl0XG5cdFx0XHRpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRjbGVhbnVwID0gcmVzdWx0XG5cdFx0XHR9XG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBlZmZlY3Q6JywgZSlcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Y3VycmVudEVmZmVjdCA9IHByZXZpb3VzRWZmZWN0XG5cdFx0fVxuXHR9XG5cblx0Ly8gUnVuIGVmZmVjdCBpbW1lZGlhdGVseVxuXHRlZmZlY3RGbigpXG5cblx0Ly8gUmV0dXJuIGNsZWFudXAgZnVuY3Rpb25cblx0cmV0dXJuICgpID0+IHtcblx0XHRpc0FjdGl2ZSA9IGZhbHNlXG5cdFx0aWYgKGNsZWFudXApIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNsZWFudXAoKVxuXHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGVmZmVjdCBjbGVhbnVwOicsIGUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIE5vdGU6IFdlIGNhbid0IHVuc3Vic2NyaWJlIGZyb20gc2lnbmFscyBoZXJlIGJlY2F1c2Ugd2UgZG9uJ3QgdHJhY2sgdGhlbVxuXHRcdC8vIFRoaXMgaXMgYSBsaW1pdGF0aW9uIC0gaW4gYSBmdWxsIGltcGxlbWVudGF0aW9uLCB3ZSdkIHRyYWNrIHNpZ25hbCBzdWJzY3JpcHRpb25zXG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IFZub2RlIGZyb20gJy4uL3JlbmRlci92bm9kZSdcbmltcG9ydCB7Z2V0U2lnbmFsQ29tcG9uZW50cywgdHlwZSBTaWduYWx9IGZyb20gJy4uL3NpZ25hbCdcblxuaW1wb3J0IHR5cGUge0NvbXBvbmVudFR5cGUsIENoaWxkcmVuLCBWbm9kZSBhcyBWbm9kZVR5cGV9IGZyb20gJy4uL3JlbmRlci92bm9kZSdcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXIge1xuXHQocm9vdDogRWxlbWVudCwgdm5vZGVzOiBDaGlsZHJlbiB8IFZub2RlVHlwZSB8IG51bGwsIHJlZHJhdz86ICgpID0+IHZvaWQpOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVkcmF3IHtcblx0KGNvbXBvbmVudD86IENvbXBvbmVudFR5cGUpOiB2b2lkXG5cdHN5bmMoKTogdm9pZFxuXHRzaWduYWw/OiAoc2lnbmFsOiBTaWduYWw8YW55PikgPT4gdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1vdW50IHtcblx0KHJvb3Q6IEVsZW1lbnQsIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IG51bGwpOiB2b2lkXG59XG5cbmludGVyZmFjZSBTY2hlZHVsZSB7XG5cdChmbjogKCkgPT4gdm9pZCk6IHZvaWRcbn1cblxuaW50ZXJmYWNlIENvbnNvbGUge1xuXHRlcnJvcjogKGU6IGFueSkgPT4gdm9pZFxufVxuXG5pbnRlcmZhY2UgTW91bnRSZWRyYXcge1xuXHRtb3VudDogTW91bnRcblx0cmVkcmF3OiBSZWRyYXdcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbW91bnRSZWRyYXdGYWN0b3J5KHJlbmRlcjogUmVuZGVyLCBzY2hlZHVsZTogU2NoZWR1bGUsIGNvbnNvbGU6IENvbnNvbGUpOiBNb3VudFJlZHJhdyB7XG5cdGNvbnN0IHN1YnNjcmlwdGlvbnM6IEFycmF5PEVsZW1lbnQgfCBDb21wb25lbnRUeXBlPiA9IFtdXG5cdGNvbnN0IGNvbXBvbmVudFRvRWxlbWVudCA9IG5ldyBXZWFrTWFwPENvbXBvbmVudFR5cGUsIEVsZW1lbnQ+KClcblx0bGV0IHBlbmRpbmcgPSBmYWxzZVxuXHRsZXQgb2Zmc2V0ID0gLTFcblxuXHRmdW5jdGlvbiBzeW5jKCkge1xuXHRcdGZvciAob2Zmc2V0ID0gMDsgb2Zmc2V0IDwgc3Vic2NyaXB0aW9ucy5sZW5ndGg7IG9mZnNldCArPSAyKSB7XG5cdFx0XHR0cnkgeyByZW5kZXIoc3Vic2NyaXB0aW9uc1tvZmZzZXRdIGFzIEVsZW1lbnQsIFZub2RlKHN1YnNjcmlwdGlvbnNbb2Zmc2V0ICsgMV0gYXMgQ29tcG9uZW50VHlwZSwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCksIHJlZHJhdykgfVxuXHRcdFx0Y2F0Y2goZSkgeyBjb25zb2xlLmVycm9yKGUpIH1cblx0XHR9XG5cdFx0b2Zmc2V0ID0gLTFcblx0fVxuXG5cdGZ1bmN0aW9uIHJlZHJhd0NvbXBvbmVudChjb21wb25lbnRPclN0YXRlOiBDb21wb25lbnRUeXBlKSB7XG5cdFx0Ly8gY29tcG9uZW50T3JTdGF0ZSBtaWdodCBiZSB2bm9kZS5zdGF0ZSAoZnJvbSBzaWduYWwgdHJhY2tpbmcpIG9yIGNvbXBvbmVudCBvYmplY3Rcblx0XHQvLyBUcnkgdG8gZmluZCB0aGUgYWN0dWFsIGNvbXBvbmVudCBvYmplY3QgaWYgaXQncyB2bm9kZS5zdGF0ZVxuXHRcdGxldCBjb21wb25lbnQgPSBjb21wb25lbnRPclN0YXRlXG5cdFx0Y29uc3Qgc3RhdGVUb0NvbXBvbmVudE1hcCA9IChnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCBhcyBXZWFrTWFwPGFueSwgQ29tcG9uZW50VHlwZT4gfCB1bmRlZmluZWRcblx0XHRpZiAoc3RhdGVUb0NvbXBvbmVudE1hcCAmJiBzdGF0ZVRvQ29tcG9uZW50TWFwLmhhcyhjb21wb25lbnRPclN0YXRlKSkge1xuXHRcdFx0Y29tcG9uZW50ID0gc3RhdGVUb0NvbXBvbmVudE1hcC5nZXQoY29tcG9uZW50T3JTdGF0ZSkhXG5cdFx0fVxuXHRcdFxuXHRcdC8vIEZpcnN0IHRyeTogZmluZCBlbGVtZW50IGluIGNvbXBvbmVudFRvRWxlbWVudCAoZm9yIG0ubW91bnQgY29tcG9uZW50cylcblx0XHQvLyBDaGVjayB0aGlzIGZpcnN0IHRvIGVuc3VyZSBzeW5jaHJvbm91cyByZWRyYXdzIGZvciBtLm1vdW50IGNvbXBvbmVudHNcblx0XHRjb25zdCBlbGVtZW50ID0gY29tcG9uZW50VG9FbGVtZW50LmdldChjb21wb25lbnQpXG5cdFx0aWYgKGVsZW1lbnQpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlbmRlcihlbGVtZW50LCBWbm9kZShjb21wb25lbnQsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBzdWNjZWVkcywgd2UncmUgZG9uZVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBmYWlscywgY29udGludWUgdG8gbmV4dCBjaGVjayAoZmFsbCB0aHJvdWdoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBTZWNvbmQgdHJ5OiBmaW5kIERPTSBlbGVtZW50IGRpcmVjdGx5IGZyb20gY29tcG9uZW50IHN0YXRlIChmb3Igcm91dGVkIGNvbXBvbmVudHMpXG5cdFx0Ly8gT25seSBjaGVjayB0aGlzIGlmIGNvbXBvbmVudFRvRWxlbWVudCBkaWRuJ3QgZmluZCBhbnl0aGluZyAobm90IGFuIG0ubW91bnQgY29tcG9uZW50KVxuXHRcdGNvbnN0IHN0YXRlVG9Eb21NYXAgPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gYXMgV2Vha01hcDxhbnksIEVsZW1lbnQ+IHwgdW5kZWZpbmVkXG5cdFx0aWYgKHN0YXRlVG9Eb21NYXAgJiYgc3RhdGVUb0RvbU1hcC5oYXMoY29tcG9uZW50T3JTdGF0ZSkpIHtcblx0XHRcdC8vIEZvciByb3V0ZWQgY29tcG9uZW50cywgYWx3YXlzIHVzZSBnbG9iYWwgcmVkcmF3IHRvIGVuc3VyZSBSb3V0ZXJSb290IHJlLXJlbmRlcnMgY29ycmVjdGx5XG5cdFx0XHQvLyBSb3V0ZXJSb290IG5lZWRzIGN1cnJlbnRSZXNvbHZlciBhbmQgY29tcG9uZW50IHRvIGJlIHNldCAoZnJvbSByb3V0ZSByZXNvbHV0aW9uKVxuXHRcdFx0Ly8gQSBkaXJlY3QgcmVkcmF3IG1pZ2h0IHVzZSBzdGFsZSByb3V0ZSBzdGF0ZSwgc28gd2UgdHJpZ2dlciBhIGZ1bGwgc3luYyBpbnN0ZWFkXG5cdFx0XHQvLyBUaGlzIGVuc3VyZXMgUm91dGVyUm9vdCByZS1yZW5kZXJzIHdpdGggdGhlIGN1cnJlbnQgcm91dGUsIHByZXNlcnZpbmcgTGF5b3V0XG5cdFx0XHRpZiAoIXBlbmRpbmcpIHtcblx0XHRcdFx0cGVuZGluZyA9IHRydWVcblx0XHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cGVuZGluZyA9IGZhbHNlXG5cdFx0XHRcdFx0c3luYygpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvLyBUaGlyZCB0cnk6IGZpbmQgZWxlbWVudCBpbiBzdWJzY3JpcHRpb25zXG5cdFx0Y29uc3QgaW5kZXggPSBzdWJzY3JpcHRpb25zLmluZGV4T2YoY29tcG9uZW50KVxuXHRcdGlmIChpbmRleCA+PSAwICYmIGluZGV4ICUgMiA9PT0gMSkge1xuXHRcdFx0Y29uc3Qgcm9vdEVsZW1lbnQgPSBzdWJzY3JpcHRpb25zW2luZGV4IC0gMV0gYXMgRWxlbWVudFxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmVuZGVyKHJvb3RFbGVtZW50LCBWbm9kZShjb21wb25lbnQsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBzdWNjZWVkcywgd2UncmUgZG9uZVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpXG5cdFx0XHRcdC8vIElmIHJlbmRlciBmYWlscywgY29udGludWUgdG8gZmFsbGJhY2sgKGZhbGwgdGhyb3VnaClcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gRmluYWwgZmFsbGJhY2s6IGNvbXBvbmVudCBub3QgZm91bmQgLSB0cmlnZ2VyIGdsb2JhbCByZWRyYXdcblx0XHQvLyBUaGlzIGhhbmRsZXMgZWRnZSBjYXNlcyB3aGVyZSBjb21wb25lbnQgdHJhY2tpbmcgZmFpbGVkXG5cdFx0aWYgKCFwZW5kaW5nKSB7XG5cdFx0XHRwZW5kaW5nID0gdHJ1ZVxuXHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHBlbmRpbmcgPSBmYWxzZVxuXHRcdFx0XHRzeW5jKClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVkcmF3KGNvbXBvbmVudD86IENvbXBvbmVudFR5cGUpIHtcblx0XHQvLyBDb21wb25lbnQtbGV2ZWwgcmVkcmF3XG5cdFx0aWYgKGNvbXBvbmVudCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZWRyYXdDb21wb25lbnQoY29tcG9uZW50KVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gR2xvYmFsIHJlZHJhdyAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSlcblx0XHRpZiAoIXBlbmRpbmcpIHtcblx0XHRcdHBlbmRpbmcgPSB0cnVlXG5cdFx0XHRzY2hlZHVsZShmdW5jdGlvbigpIHtcblx0XHRcdFx0cGVuZGluZyA9IGZhbHNlXG5cdFx0XHRcdHN5bmMoKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRyZWRyYXcuc3luYyA9IHN5bmNcblxuXHQvLyBFeHBvcnQgZnVuY3Rpb24gdG8gcmVkcmF3IGNvbXBvbmVudHMgYWZmZWN0ZWQgYnkgc2lnbmFsIGNoYW5nZXNcblx0OyhyZWRyYXcgYXMgYW55KS5zaWduYWwgPSBmdW5jdGlvbihzaWduYWw6IFNpZ25hbDxhbnk+KSB7XG5cdFx0Y29uc3QgY29tcG9uZW50cyA9IGdldFNpZ25hbENvbXBvbmVudHMoc2lnbmFsKVxuXHRcdGlmIChjb21wb25lbnRzKSB7XG5cdFx0XHRjb21wb25lbnRzLmZvckVhY2goY29tcG9uZW50ID0+IHtcblx0XHRcdFx0cmVkcmF3Q29tcG9uZW50KGNvbXBvbmVudClcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbW91bnQocm9vdDogRWxlbWVudCwgY29tcG9uZW50OiBDb21wb25lbnRUeXBlIHwgbnVsbCkge1xuXHRcdGlmIChjb21wb25lbnQgIT0gbnVsbCAmJiAoY29tcG9uZW50IGFzIGFueSkudmlldyA9PSBudWxsICYmIHR5cGVvZiBjb21wb25lbnQgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ20ubW91bnQgZXhwZWN0cyBhIGNvbXBvbmVudCwgbm90IGEgdm5vZGUuJylcblx0XHR9XG5cblx0XHRjb25zdCBpbmRleCA9IHN1YnNjcmlwdGlvbnMuaW5kZXhPZihyb290KVxuXHRcdGlmIChpbmRleCA+PSAwKSB7XG5cdFx0XHRjb25zdCBvbGRDb21wb25lbnQgPSBzdWJzY3JpcHRpb25zW2luZGV4ICsgMV0gYXMgQ29tcG9uZW50VHlwZVxuXHRcdFx0aWYgKG9sZENvbXBvbmVudCkge1xuXHRcdFx0XHRjb21wb25lbnRUb0VsZW1lbnQuZGVsZXRlKG9sZENvbXBvbmVudClcblx0XHRcdH1cblx0XHRcdHN1YnNjcmlwdGlvbnMuc3BsaWNlKGluZGV4LCAyKVxuXHRcdFx0aWYgKGluZGV4IDw9IG9mZnNldCkgb2Zmc2V0IC09IDJcblx0XHRcdHJlbmRlcihyb290LCBbXSlcblx0XHR9XG5cblx0XHRpZiAoY29tcG9uZW50ICE9IG51bGwpIHtcblx0XHRcdHN1YnNjcmlwdGlvbnMucHVzaChyb290LCBjb21wb25lbnQpXG5cdFx0XHRjb21wb25lbnRUb0VsZW1lbnQuc2V0KGNvbXBvbmVudCwgcm9vdClcblx0XHRcdHJlbmRlcihyb290LCBWbm9kZShjb21wb25lbnQsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwpLCByZWRyYXcpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHttb3VudDogbW91bnQsIHJlZHJhdzogcmVkcmF3fVxufVxuIiwKICAgICIvKlxuUGVyY2VudCBlbmNvZGluZ3MgZW5jb2RlIFVURi04IGJ5dGVzLCBzbyB0aGlzIHJlZ2V4cCBuZWVkcyB0byBtYXRjaCB0aGF0LlxuSGVyZSdzIGhvdyBVVEYtOCBlbmNvZGVzIHN0dWZmOlxuLSBgMDAtN0ZgOiAxLWJ5dGUsIGZvciBVKzAwMDAtVSswMDdGXG4tIGBDMi1ERiA4MC1CRmA6IDItYnl0ZSwgZm9yIFUrMDA4MC1VKzA3RkZcbi0gYEUwLUVGIDgwLUJGIDgwLUJGYDogMy1ieXRlLCBlbmNvZGVzIFUrMDgwMC1VK0ZGRkZcbi0gYEYwLUY0IDgwLUJGIDgwLUJGIDgwLUJGYDogNC1ieXRlLCBlbmNvZGVzIFUrMTAwMDAtVSsxMEZGRkZcbkluIHRoaXMsIHRoZXJlJ3MgYSBudW1iZXIgb2YgaW52YWxpZCBieXRlIHNlcXVlbmNlczpcbi0gYDgwLUJGYDogQ29udGludWF0aW9uIGJ5dGUsIGludmFsaWQgYXMgc3RhcnRcbi0gYEMwLUMxIDgwLUJGYDogT3ZlcmxvbmcgZW5jb2RpbmcgZm9yIFUrMDAwMC1VKzAwN0Zcbi0gYEUwIDgwLTlGIDgwLUJGYDogT3ZlcmxvbmcgZW5jb2RpbmcgZm9yIFUrMDA4MC1VKzA3RkZcbi0gYEVEIEEwLUJGIDgwLUJGYDogRW5jb2RpbmcgZm9yIFVURi0xNiBzdXJyb2dhdGUgVStEODAwLVUrREZGRlxuLSBgRjAgODAtOEYgODAtQkYgODAtQkZgOiBPdmVybG9uZyBlbmNvZGluZyBmb3IgVSswODAwLVUrRkZGRlxuLSBgRjQgOTAtQkZgOiBSRkMgMzYyOSByZXN0cmljdGVkIFVURi04IHRvIG9ubHkgY29kZSBwb2ludHMgVVRGLTE2IGNvdWxkIGVuY29kZS5cbi0gYEY1LUZGYDogUkZDIDM2MjkgcmVzdHJpY3RlZCBVVEYtOCB0byBvbmx5IGNvZGUgcG9pbnRzIFVURi0xNiBjb3VsZCBlbmNvZGUuXG5TbyBpbiByZWFsaXR5LCBvbmx5IHRoZSBmb2xsb3dpbmcgc2VxdWVuY2VzIGNhbiBlbmNvZGUgYXJlIHZhbGlkIGNoYXJhY3RlcnM6XG4tIDAwLTdGXG4tIEMyLURGIDgwLUJGXG4tIEUwICAgIEEwLUJGIDgwLUJGXG4tIEUxLUVDIDgwLUJGIDgwLUJGXG4tIEVEICAgIDgwLTlGIDgwLUJGXG4tIEVFLUVGIDgwLUJGIDgwLUJGXG4tIEYwICAgIDkwLUJGIDgwLUJGIDgwLUJGXG4tIEYxLUYzIDgwLUJGIDgwLUJGIDgwLUJGXG4tIEY0ICAgIDgwLThGIDgwLUJGIDgwLUJGXG5cblRoZSByZWdleHAganVzdCB0cmllcyB0byBtYXRjaCB0aGlzIGFzIGNvbXBhY3RseSBhcyBwb3NzaWJsZS5cbiovXG5jb25zdCB2YWxpZFV0ZjhFbmNvZGluZ3MgPSAvJSg/OlswLTddfCg/IWNbMDFdfGUwJVs4OV18ZWQlW2FiXXxmMCU4fGY0JVs5YWJdKSg/OmN8ZHwoPzplfGZbMC00XSVbODlhYl0pW1xcZGEtZl0lWzg5YWJdKVtcXGRhLWZdJVs4OWFiXSlbXFxkYS1mXS9naVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWNvZGVVUklDb21wb25lbnRTYWZlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UodmFsaWRVdGY4RW5jb2RpbmdzLCBkZWNvZGVVUklDb21wb25lbnQpXG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkUXVlcnlTdHJpbmcob2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcblx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpICE9PSAnW29iamVjdCBPYmplY3RdJykgcmV0dXJuICcnXG5cblx0Y29uc3QgYXJnczogc3RyaW5nW10gPSBbXVxuXHRmdW5jdGlvbiBkZXN0cnVjdHVyZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkgKyAnWycgKyBpICsgJ10nLCB2YWx1ZVtpXSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRcdGZvciAoY29uc3QgaSBpbiB2YWx1ZSkge1xuXHRcdFx0XHRkZXN0cnVjdHVyZShrZXkgKyAnWycgKyBpICsgJ10nLCB2YWx1ZVtpXSlcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBhcmdzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSAhPT0gJycgPyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpIDogJycpKVxuXHR9XG5cblx0Zm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG5cdFx0ZGVzdHJ1Y3R1cmUoa2V5LCBvYmplY3Rba2V5XSlcblx0fVxuXG5cdHJldHVybiBhcmdzLmpvaW4oJyYnKVxufVxuIiwKICAgICJpbXBvcnQgYnVpbGRRdWVyeVN0cmluZyBmcm9tICcuLi9xdWVyeXN0cmluZy9idWlsZCdcblxuLy8gUmV0dXJucyBgcGF0aGAgZnJvbSBgdGVtcGxhdGVgICsgYHBhcmFtc2BcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkUGF0aG5hbWUodGVtcGxhdGU6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcblx0aWYgKCgvOihbXlxcL1xcLi1dKykoXFwuezN9KT86LykudGVzdCh0ZW1wbGF0ZSkpIHtcblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1RlbXBsYXRlIHBhcmFtZXRlciBuYW1lcyBtdXN0IGJlIHNlcGFyYXRlZCBieSBlaXRoZXIgYSBcXCcvXFwnLCBcXCctXFwnLCBvciBcXCcuXFwnLicpXG5cdH1cblx0aWYgKHBhcmFtcyA9PSBudWxsKSByZXR1cm4gdGVtcGxhdGVcblx0Y29uc3QgcXVlcnlJbmRleCA9IHRlbXBsYXRlLmluZGV4T2YoJz8nKVxuXHRjb25zdCBoYXNoSW5kZXggPSB0ZW1wbGF0ZS5pbmRleE9mKCcjJylcblx0Y29uc3QgcXVlcnlFbmQgPSBoYXNoSW5kZXggPCAwID8gdGVtcGxhdGUubGVuZ3RoIDogaGFzaEluZGV4XG5cdGNvbnN0IHBhdGhFbmQgPSBxdWVyeUluZGV4IDwgMCA/IHF1ZXJ5RW5kIDogcXVlcnlJbmRleFxuXHRjb25zdCBwYXRoID0gdGVtcGxhdGUuc2xpY2UoMCwgcGF0aEVuZClcblx0Y29uc3QgcXVlcnk6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXG5cdE9iamVjdC5hc3NpZ24ocXVlcnksIHBhcmFtcylcblxuXHRjb25zdCByZXNvbHZlZCA9IHBhdGgucmVwbGFjZSgvOihbXlxcL1xcLi1dKykoXFwuezN9KT8vZywgZnVuY3Rpb24obSwga2V5LCB2YXJpYWRpYykge1xuXHRcdGRlbGV0ZSBxdWVyeVtrZXldXG5cdFx0Ly8gSWYgbm8gc3VjaCBwYXJhbWV0ZXIgZXhpc3RzLCBkb24ndCBpbnRlcnBvbGF0ZSBpdC5cblx0XHRpZiAocGFyYW1zW2tleV0gPT0gbnVsbCkgcmV0dXJuIG1cblx0XHQvLyBFc2NhcGUgbm9ybWFsIHBhcmFtZXRlcnMsIGJ1dCBub3QgdmFyaWFkaWMgb25lcy5cblx0XHRyZXR1cm4gdmFyaWFkaWMgPyBwYXJhbXNba2V5XSA6IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcocGFyYW1zW2tleV0pKVxuXHR9KVxuXG5cdC8vIEluIGNhc2UgdGhlIHRlbXBsYXRlIHN1YnN0aXR1dGlvbiBhZGRzIG5ldyBxdWVyeS9oYXNoIHBhcmFtZXRlcnMuXG5cdGNvbnN0IG5ld1F1ZXJ5SW5kZXggPSByZXNvbHZlZC5pbmRleE9mKCc/Jylcblx0Y29uc3QgbmV3SGFzaEluZGV4ID0gcmVzb2x2ZWQuaW5kZXhPZignIycpXG5cdGNvbnN0IG5ld1F1ZXJ5RW5kID0gbmV3SGFzaEluZGV4IDwgMCA/IHJlc29sdmVkLmxlbmd0aCA6IG5ld0hhc2hJbmRleFxuXHRjb25zdCBuZXdQYXRoRW5kID0gbmV3UXVlcnlJbmRleCA8IDAgPyBuZXdRdWVyeUVuZCA6IG5ld1F1ZXJ5SW5kZXhcblx0bGV0IHJlc3VsdCA9IHJlc29sdmVkLnNsaWNlKDAsIG5ld1BhdGhFbmQpXG5cblx0aWYgKHF1ZXJ5SW5kZXggPj0gMCkgcmVzdWx0ICs9IHRlbXBsYXRlLnNsaWNlKHF1ZXJ5SW5kZXgsIHF1ZXJ5RW5kKVxuXHRpZiAobmV3UXVlcnlJbmRleCA+PSAwKSByZXN1bHQgKz0gKHF1ZXJ5SW5kZXggPCAwID8gJz8nIDogJyYnKSArIHJlc29sdmVkLnNsaWNlKG5ld1F1ZXJ5SW5kZXgsIG5ld1F1ZXJ5RW5kKVxuXHRjb25zdCBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcocXVlcnkpXG5cdGlmIChxdWVyeXN0cmluZykgcmVzdWx0ICs9IChxdWVyeUluZGV4IDwgMCAmJiBuZXdRdWVyeUluZGV4IDwgMCA/ICc/JyA6ICcmJykgKyBxdWVyeXN0cmluZ1xuXHRpZiAoaGFzaEluZGV4ID49IDApIHJlc3VsdCArPSB0ZW1wbGF0ZS5zbGljZShoYXNoSW5kZXgpXG5cdGlmIChuZXdIYXNoSW5kZXggPj0gMCkgcmVzdWx0ICs9IChoYXNoSW5kZXggPCAwID8gJycgOiAnJicpICsgcmVzb2x2ZWQuc2xpY2UobmV3SGFzaEluZGV4KVxuXHRyZXR1cm4gcmVzdWx0XG59XG4iLAogICAgImltcG9ydCBkZWNvZGVVUklDb21wb25lbnRTYWZlIGZyb20gJy4uL3V0aWwvZGVjb2RlVVJJQ29tcG9uZW50U2FmZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHJpbmc6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcblx0aWYgKHN0cmluZyA9PT0gJycgfHwgc3RyaW5nID09IG51bGwpIHJldHVybiB7fVxuXHRpZiAoc3RyaW5nLmNoYXJBdCgwKSA9PT0gJz8nKSBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMSlcblxuXHRjb25zdCBlbnRyaWVzID0gc3RyaW5nLnNwbGl0KCcmJylcblx0Y29uc3QgY291bnRlcnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fVxuXHRjb25zdCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgZW50cnkgPSBlbnRyaWVzW2ldLnNwbGl0KCc9Jylcblx0XHRjb25zdCBrZXkgPSBkZWNvZGVVUklDb21wb25lbnRTYWZlKGVudHJ5WzBdKVxuXHRcdGxldCB2YWx1ZTogYW55ID0gZW50cnkubGVuZ3RoID09PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50U2FmZShlbnRyeVsxXSkgOiAnJ1xuXG5cdFx0aWYgKHZhbHVlID09PSAndHJ1ZScpIHZhbHVlID0gdHJ1ZVxuXHRcdGVsc2UgaWYgKHZhbHVlID09PSAnZmFsc2UnKSB2YWx1ZSA9IGZhbHNlXG5cblx0XHRjb25zdCBsZXZlbHMgPSBrZXkuc3BsaXQoL1xcXVxcWz98XFxbLylcblx0XHRsZXQgY3Vyc29yOiBhbnkgPSBkYXRhXG5cdFx0aWYgKGtleS5pbmRleE9mKCdbJykgPiAtMSkgbGV2ZWxzLnBvcCgpXG5cdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBsZXZlbHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGNvbnN0IGxldmVsID0gbGV2ZWxzW2pdXG5cdFx0XHRjb25zdCBuZXh0TGV2ZWwgPSBsZXZlbHNbaiArIDFdXG5cdFx0XHRjb25zdCBpc051bWJlciA9IG5leHRMZXZlbCA9PSAnJyB8fCAhaXNOYU4ocGFyc2VJbnQobmV4dExldmVsLCAxMCkpXG5cdFx0XHRsZXQgZmluYWxMZXZlbDogc3RyaW5nIHwgbnVtYmVyXG5cdFx0XHRpZiAobGV2ZWwgPT09ICcnKSB7XG5cdFx0XHRcdGNvbnN0IGtleSA9IGxldmVscy5zbGljZSgwLCBqKS5qb2luKClcblx0XHRcdFx0aWYgKGNvdW50ZXJzW2tleV0gPT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvdW50ZXJzW2tleV0gPSBBcnJheS5pc0FycmF5KGN1cnNvcikgPyBjdXJzb3IubGVuZ3RoIDogMFxuXHRcdFx0XHR9XG5cdFx0XHRcdGZpbmFsTGV2ZWwgPSBjb3VudGVyc1trZXldKytcblx0XHRcdH1cblx0XHRcdC8vIERpc2FsbG93IGRpcmVjdCBwcm90b3R5cGUgcG9sbHV0aW9uXG5cdFx0XHRlbHNlIGlmIChsZXZlbCA9PT0gJ19fcHJvdG9fXycpIGJyZWFrXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0ZmluYWxMZXZlbCA9IGxldmVsXG5cdFx0XHR9XG5cdFx0XHRpZiAoaiA9PT0gbGV2ZWxzLmxlbmd0aCAtIDEpIGN1cnNvcltmaW5hbExldmVsXSA9IHZhbHVlXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Ly8gUmVhZCBvd24gcHJvcGVydGllcyBleGNsdXNpdmVseSB0byBkaXNhbGxvdyBpbmRpcmVjdFxuXHRcdFx0XHQvLyBwcm90b3R5cGUgcG9sbHV0aW9uXG5cdFx0XHRcdGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGN1cnNvciwgZmluYWxMZXZlbClcblx0XHRcdFx0bGV0IGRlc2NWYWx1ZSA9IGRlc2MgIT0gbnVsbCA/IGRlc2MudmFsdWUgOiB1bmRlZmluZWRcblx0XHRcdFx0aWYgKGRlc2NWYWx1ZSA9PSBudWxsKSBjdXJzb3JbZmluYWxMZXZlbF0gPSBkZXNjVmFsdWUgPSBpc051bWJlciA/IFtdIDoge31cblx0XHRcdFx0Y3Vyc29yID0gZGVzY1ZhbHVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkYXRhXG59XG4iLAogICAgImltcG9ydCBwYXJzZVF1ZXJ5U3RyaW5nIGZyb20gJy4uL3F1ZXJ5c3RyaW5nL3BhcnNlJ1xuXG4vLyBSZXR1cm5zIGB7cGF0aCwgcGFyYW1zfWAgZnJvbSBgdXJsYFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VQYXRobmFtZSh1cmw6IHN0cmluZyk6IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn0ge1xuXHRjb25zdCBxdWVyeUluZGV4ID0gdXJsLmluZGV4T2YoJz8nKVxuXHRjb25zdCBoYXNoSW5kZXggPSB1cmwuaW5kZXhPZignIycpXG5cdGNvbnN0IHF1ZXJ5RW5kID0gaGFzaEluZGV4IDwgMCA/IHVybC5sZW5ndGggOiBoYXNoSW5kZXhcblx0Y29uc3QgcGF0aEVuZCA9IHF1ZXJ5SW5kZXggPCAwID8gcXVlcnlFbmQgOiBxdWVyeUluZGV4XG5cdGxldCBwYXRoID0gdXJsLnNsaWNlKDAsIHBhdGhFbmQpLnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKVxuXG5cdGlmICghcGF0aCkgcGF0aCA9ICcvJ1xuXHRlbHNlIHtcblx0XHRpZiAocGF0aFswXSAhPT0gJy8nKSBwYXRoID0gJy8nICsgcGF0aFxuXHR9XG5cdHJldHVybiB7XG5cdFx0cGF0aDogcGF0aCxcblx0XHRwYXJhbXM6IHF1ZXJ5SW5kZXggPCAwXG5cdFx0XHQ/IHt9XG5cdFx0XHQ6IHBhcnNlUXVlcnlTdHJpbmcodXJsLnNsaWNlKHF1ZXJ5SW5kZXggKyAxLCBxdWVyeUVuZCkpLFxuXHR9XG59XG4iLAogICAgImltcG9ydCBwYXJzZVBhdGhuYW1lIGZyb20gJy4vcGFyc2UnXG5cbmludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlIHtcblx0KGRhdGE6IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn0pOiBib29sZWFuXG59XG5cbi8vIENvbXBpbGVzIGEgdGVtcGxhdGUgaW50byBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSByZXNvbHZlZCBwYXRoICh3aXRob3V0IHF1ZXJ5XG4vLyBzdHJpbmdzKSBhbmQgcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgdGVtcGxhdGUgcGFyYW1ldGVycyB3aXRoIHRoZWlyXG4vLyBwYXJzZWQgdmFsdWVzLiBUaGlzIGV4cGVjdHMgdGhlIGlucHV0IG9mIHRoZSBjb21waWxlZCB0ZW1wbGF0ZSB0byBiZSB0aGVcbi8vIG91dHB1dCBvZiBgcGFyc2VQYXRobmFtZWAuIE5vdGUgdGhhdCBpdCBkb2VzICpub3QqIHJlbW92ZSBxdWVyeSBwYXJhbWV0ZXJzXG4vLyBzcGVjaWZpZWQgaW4gdGhlIHRlbXBsYXRlLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlOiBzdHJpbmcpOiBDb21waWxlZFRlbXBsYXRlIHtcblx0Y29uc3QgdGVtcGxhdGVEYXRhID0gcGFyc2VQYXRobmFtZSh0ZW1wbGF0ZSlcblx0Y29uc3QgdGVtcGxhdGVLZXlzID0gT2JqZWN0LmtleXModGVtcGxhdGVEYXRhLnBhcmFtcylcblx0Y29uc3Qga2V5czogQXJyYXk8e2s6IHN0cmluZzsgcjogYm9vbGVhbn0+ID0gW11cblx0Y29uc3QgcmVnZXhwID0gbmV3IFJlZ0V4cCgnXicgKyB0ZW1wbGF0ZURhdGEucGF0aC5yZXBsYWNlKFxuXHRcdC8vIEkgZXNjYXBlIGxpdGVyYWwgdGV4dCBzbyBwZW9wbGUgY2FuIHVzZSB0aGluZ3MgbGlrZSBgOmZpbGUuOmV4dGAgb3Jcblx0XHQvLyBgOmxhbmctOmxvY2FsZWAgaW4gcm91dGVzLiBUaGlzIGlzIGFsbCBtZXJnZWQgaW50byBvbmUgcGFzcyBzbyBJXG5cdFx0Ly8gZG9uJ3QgYWxzbyBhY2NpZGVudGFsbHkgZXNjYXBlIGAtYCBhbmQgbWFrZSBpdCBoYXJkZXIgdG8gZGV0ZWN0IGl0IHRvXG5cdFx0Ly8gYmFuIGl0IGZyb20gdGVtcGxhdGUgcGFyYW1ldGVycy5cblx0XHQvOihbXlxcLy4tXSspKFxcLnszfXxcXC4oPyFcXC4pfC0pP3xbXFxcXF4kKisuKCl8XFxbXFxde31dL2csXG5cdFx0ZnVuY3Rpb24obSwga2V5LCBleHRyYSkge1xuXHRcdFx0aWYgKGtleSA9PSBudWxsKSByZXR1cm4gJ1xcXFwnICsgbVxuXHRcdFx0a2V5cy5wdXNoKHtrOiBrZXksIHI6IGV4dHJhID09PSAnLi4uJ30pXG5cdFx0XHRpZiAoZXh0cmEgPT09ICcuLi4nKSByZXR1cm4gJyguKiknXG5cdFx0XHRpZiAoZXh0cmEgPT09ICcuJykgcmV0dXJuICcoW14vXSspXFxcXC4nXG5cdFx0XHRyZXR1cm4gJyhbXi9dKyknICsgKGV4dHJhIHx8ICcnKVxuXHRcdH0sXG5cdCkgKyAnXFxcXC8/JCcpXG5cdHJldHVybiBmdW5jdGlvbihkYXRhOiB7cGF0aDogc3RyaW5nOyBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT59KTogYm9vbGVhbiB7XG5cdFx0Ly8gRmlyc3QsIGNoZWNrIHRoZSBwYXJhbXMuIFVzdWFsbHksIHRoZXJlIGlzbid0IGFueSwgYW5kIGl0J3MganVzdFxuXHRcdC8vIGNoZWNraW5nIGEgc3RhdGljIHNldC5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRlbXBsYXRlS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRlbXBsYXRlRGF0YS5wYXJhbXNbdGVtcGxhdGVLZXlzW2ldXSAhPT0gZGF0YS5wYXJhbXNbdGVtcGxhdGVLZXlzW2ldXSkgcmV0dXJuIGZhbHNlXG5cdFx0fVxuXHRcdC8vIElmIG5vIGludGVycG9sYXRpb25zIGV4aXN0LCBsZXQncyBza2lwIGFsbCB0aGUgY2VyZW1vbnlcblx0XHRpZiAoIWtleXMubGVuZ3RoKSByZXR1cm4gcmVnZXhwLnRlc3QoZGF0YS5wYXRoKVxuXHRcdGNvbnN0IHZhbHVlcyA9IHJlZ2V4cC5leGVjKGRhdGEucGF0aClcblx0XHRpZiAodmFsdWVzID09IG51bGwpIHJldHVybiBmYWxzZVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZGF0YS5wYXJhbXNba2V5c1tpXS5rXSA9IGtleXNbaV0uciA/IHZhbHVlc1tpICsgMV0gOiBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2kgKyAxXSlcblx0XHR9XG5cdFx0cmV0dXJuIHRydWVcblx0fVxufVxuIiwKICAgICIvLyBOb3RlOiB0aGlzIGlzIG1pbGRseSBwZXJmLXNlbnNpdGl2ZS5cbi8vXG4vLyBJdCBkb2VzICpub3QqIHVzZSBgZGVsZXRlYCAtIGR5bmFtaWMgYGRlbGV0ZWBzIHVzdWFsbHkgY2F1c2Ugb2JqZWN0cyB0byBiYWlsXG4vLyBvdXQgaW50byBkaWN0aW9uYXJ5IG1vZGUgYW5kIGp1c3QgZ2VuZXJhbGx5IGNhdXNlIGEgYnVuY2ggb2Ygb3B0aW1pemF0aW9uXG4vLyBpc3N1ZXMgd2l0aGluIGVuZ2luZXMuXG4vL1xuLy8gSWRlYWxseSwgSSB3b3VsZCd2ZSBwcmVmZXJyZWQgdG8gZG8gdGhpcywgaWYgaXQgd2VyZW4ndCBmb3IgdGhlIG9wdGltaXphdGlvblxuLy8gaXNzdWVzOlxuLy9cbi8vIGBgYHRzXG4vLyBjb25zdCBoYXNPd24gPSByZXF1aXJlKFwiLi9oYXNPd25cIilcbi8vIGNvbnN0IG1hZ2ljID0gW1xuLy8gICAgIFwia2V5XCIsIFwib25pbml0XCIsIFwib25jcmVhdGVcIiwgXCJvbmJlZm9yZXVwZGF0ZVwiLCBcIm9udXBkYXRlXCIsXG4vLyAgICAgXCJvbmJlZm9yZXJlbW92ZVwiLCBcIm9ucmVtb3ZlXCIsXG4vLyBdXG4vLyBleHBvcnQgZGVmYXVsdCAoYXR0cnMsIGV4dHJhcykgPT4ge1xuLy8gICAgIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShudWxsKSwgYXR0cnMpXG4vLyAgICAgZm9yIChjb25zdCBrZXkgb2YgbWFnaWMpIGRlbGV0ZSByZXN1bHRba2V5XVxuLy8gICAgIGlmIChleHRyYXMgIT0gbnVsbCkgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFzKSBkZWxldGUgcmVzdWx0W2tleV1cbi8vICAgICByZXR1cm4gcmVzdWx0XG4vLyB9XG4vLyBgYGBcblxuaW1wb3J0IGhhc093biBmcm9tICcuL2hhc093bidcblxuY29uc3QgbWFnaWMgPSAvXig/OmtleXxvbmluaXR8b25jcmVhdGV8b25iZWZvcmV1cGRhdGV8b251cGRhdGV8b25iZWZvcmVyZW1vdmV8b25yZW1vdmUpJC9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2Vuc29yKGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBleHRyYXM/OiBzdHJpbmdbXSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuXHRjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXG5cdGlmIChleHRyYXMgIT0gbnVsbCkge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGF0dHJzKSB7XG5cdFx0XHRpZiAoaGFzT3duLmNhbGwoYXR0cnMsIGtleSkgJiYgIW1hZ2ljLnRlc3Qoa2V5KSAmJiBleHRyYXMuaW5kZXhPZihrZXkpIDwgMCkge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJzW2tleV1cblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcblx0XHRcdGlmIChoYXNPd24uY2FsbChhdHRycywga2V5KSAmJiAhbWFnaWMudGVzdChrZXkpKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cnNba2V5XVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRcbn1cbiIsCiAgICAiLyoqXG4gKiBJc29tb3JwaGljIFVSSSBBUEkgLSB3b3JrcyBpbiBib3RoIFNTUiAoc2VydmVyKSBhbmQgYnJvd3NlciBjb250ZXh0c1xuICovXG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IGZ1bGwgVVJMIChocmVmKVxuICogUmV0dXJucyB3aW5kb3cubG9jYXRpb24uaHJlZiBpbiBicm93c2VyLCBvciBzZXJ2ZXIncyByZXF1ZXN0IFVSTCBkdXJpbmcgU1NSXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50VXJsKCk6IHN0cmluZyB7XG5cdC8vIFByZWZlciBicm93c2VyIGxvY2F0aW9uIHdoZW4gYXZhaWxhYmxlIChtb3JlIGRpcmVjdClcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZlxuXHR9XG5cdFxuXHQvLyBGYWxsIGJhY2sgdG8gU1NSIHNlcnZlciBVUkwgKHdoZW4gY2xpZW50IGNvZGUgcnVucyBvbiBzZXJ2ZXIpXG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbFRoaXMgYXMgYW55KS5fX1NTUl9VUkxfXykge1xuXHRcdHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fU1NSX1VSTF9fXG5cdH1cblx0XG5cdC8vIEZhbGxiYWNrIChzaG91bGRuJ3QgaGFwcGVuKVxuXHRyZXR1cm4gJydcbn1cblxuLyoqXG4gKiBQYXJzZSBhIFVSTCBzdHJpbmcgaW50byBpdHMgY29tcG9uZW50c1xuICovXG5mdW5jdGlvbiBwYXJzZVVybCh1cmw6IHN0cmluZyk6IFVSTCB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBVUkwodXJsKVxuXHR9IGNhdGNoIHtcblx0XHQvLyBGYWxsYmFjayBmb3IgcmVsYXRpdmUgVVJMc1xuXHRcdHJldHVybiBuZXcgVVJMKHVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKVxuXHR9XG59XG5cbi8qKlxuICogR2V0IHRoZSBjdXJyZW50IHBhdGhuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRobmFtZSgpOiBzdHJpbmcge1xuXHQvLyBQcmVmZXIgYnJvd3NlciBsb2NhdGlvbiB3aGVuIGF2YWlsYWJsZSAobW9yZSBkaXJlY3QpXG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pIHtcblx0XHRyZXR1cm4gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lIHx8ICcvJ1xuXHR9XG5cdFxuXHQvLyBGYWxsIGJhY2sgdG8gcGFyc2luZyBTU1IgVVJMXG5cdGNvbnN0IHVybCA9IGdldEN1cnJlbnRVcmwoKVxuXHRpZiAoIXVybCkgcmV0dXJuICcvJ1xuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4gcGFyc2VkLnBhdGhuYW1lIHx8ICcvJ1xufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBzZWFyY2ggc3RyaW5nIChxdWVyeSBzdHJpbmcpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWFyY2goKTogc3RyaW5nIHtcblx0Ly8gUHJlZmVyIGJyb3dzZXIgbG9jYXRpb24gd2hlbiBhdmFpbGFibGUgKG1vcmUgZGlyZWN0KVxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmxvY2F0aW9uKSB7XG5cdFx0cmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggfHwgJydcblx0fVxuXHRcblx0Ly8gRmFsbCBiYWNrIHRvIHBhcnNpbmcgU1NSIFVSTFxuXHRjb25zdCB1cmwgPSBnZXRDdXJyZW50VXJsKClcblx0aWYgKCF1cmwpIHJldHVybiAnJ1xuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4gcGFyc2VkLnNlYXJjaCB8fCAnJ1xufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCBoYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIYXNoKCk6IHN0cmluZyB7XG5cdC8vIFByZWZlciBicm93c2VyIGxvY2F0aW9uIHdoZW4gYXZhaWxhYmxlIChtb3JlIGRpcmVjdClcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuXHRcdHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCB8fCAnJ1xuXHR9XG5cdFxuXHQvLyBGYWxsIGJhY2sgdG8gcGFyc2luZyBTU1IgVVJMXG5cdGNvbnN0IHVybCA9IGdldEN1cnJlbnRVcmwoKVxuXHRpZiAoIXVybCkgcmV0dXJuICcnXG5cdFxuXHRjb25zdCBwYXJzZWQgPSBwYXJzZVVybCh1cmwpXG5cdHJldHVybiBwYXJzZWQuaGFzaCB8fCAnJ1xufVxuXG4vKipcbiAqIEdldCBhIExvY2F0aW9uLWxpa2Ugb2JqZWN0IHdpdGggYWxsIHByb3BlcnRpZXNcbiAqIENvbXBhdGlibGUgd2l0aCBicm93c2VyIExvY2F0aW9uIEFQSVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElzb21vcnBoaWNMb2NhdGlvbiB7XG5cdGhyZWY6IHN0cmluZ1xuXHRwYXRobmFtZTogc3RyaW5nXG5cdHNlYXJjaDogc3RyaW5nXG5cdGhhc2g6IHN0cmluZ1xuXHRvcmlnaW4/OiBzdHJpbmdcblx0aG9zdD86IHN0cmluZ1xuXHRob3N0bmFtZT86IHN0cmluZ1xuXHRwb3J0Pzogc3RyaW5nXG5cdHByb3RvY29sPzogc3RyaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhdGlvbigpOiBJc29tb3JwaGljTG9jYXRpb24ge1xuXHRjb25zdCB1cmwgPSBnZXRDdXJyZW50VXJsKClcblx0aWYgKCF1cmwpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aHJlZjogJycsXG5cdFx0XHRwYXRobmFtZTogJy8nLFxuXHRcdFx0c2VhcmNoOiAnJyxcblx0XHRcdGhhc2g6ICcnLFxuXHRcdH1cblx0fVxuXHRcblx0Y29uc3QgcGFyc2VkID0gcGFyc2VVcmwodXJsKVxuXHRyZXR1cm4ge1xuXHRcdGhyZWY6IHBhcnNlZC5ocmVmLFxuXHRcdHBhdGhuYW1lOiBwYXJzZWQucGF0aG5hbWUgfHwgJy8nLFxuXHRcdHNlYXJjaDogcGFyc2VkLnNlYXJjaCB8fCAnJyxcblx0XHRoYXNoOiBwYXJzZWQuaGFzaCB8fCAnJyxcblx0XHRvcmlnaW46IHBhcnNlZC5vcmlnaW4sXG5cdFx0aG9zdDogcGFyc2VkLmhvc3QsXG5cdFx0aG9zdG5hbWU6IHBhcnNlZC5ob3N0bmFtZSxcblx0XHRwb3J0OiBwYXJzZWQucG9ydCxcblx0XHRwcm90b2NvbDogcGFyc2VkLnByb3RvY29sLFxuXHR9XG59XG4iLAogICAgIi8qKlxuICogSXNvbW9ycGhpYyBsb2dnZXIgd2l0aCBjb2xvcnMgYW5kIHN0cnVjdHVyZWQgbG9nZ2luZy5cbiAqIFdvcmtzIGluIGJvdGggc2VydmVyIChCdW4vTm9kZSkgYW5kIGNsaWVudCAoYnJvd3NlcikgZW52aXJvbm1lbnRzLlxuICogUHJvdmlkZXMgaW5mbywgZGVidWcsIHdhcm5pbmcsIGFuZCBlcnJvciBsb2cgbGV2ZWxzIHdpdGggYXBwcm9wcmlhdGUgZm9ybWF0dGluZy5cbiAqL1xuXG4vLyBEZXRlY3QgaWYgd2UncmUgcnVubmluZyBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnRcbmNvbnN0IGlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcblxuLy8gQU5TSSBjb2xvciBjb2RlcyBmb3IgdGVybWluYWwgb3V0cHV0IChzZXJ2ZXIgb25seSlcbmNvbnN0IGNvbG9ycyA9IHtcblx0cmVzZXQ6ICdcXHgxYlswbScsXG5cdGJyaWdodDogJ1xceDFiWzFtJyxcblx0ZGltOiAnXFx4MWJbMm0nLFxuXHRcblx0Ly8gVGV4dCBjb2xvcnNcblx0YmxhY2s6ICdcXHgxYlszMG0nLFxuXHRyZWQ6ICdcXHgxYlszMW0nLFxuXHRncmVlbjogJ1xceDFiWzMybScsXG5cdHllbGxvdzogJ1xceDFiWzMzbScsXG5cdGJsdWU6ICdcXHgxYlszNG0nLFxuXHRtYWdlbnRhOiAnXFx4MWJbMzVtJyxcblx0Y3lhbjogJ1xceDFiWzM2bScsXG5cdHdoaXRlOiAnXFx4MWJbMzdtJyxcblx0XG5cdC8vIEJhY2tncm91bmQgY29sb3JzXG5cdGJnQmxhY2s6ICdcXHgxYls0MG0nLFxuXHRiZ1JlZDogJ1xceDFiWzQxbScsXG5cdGJnR3JlZW46ICdcXHgxYls0Mm0nLFxuXHRiZ1llbGxvdzogJ1xceDFiWzQzbScsXG5cdGJnQmx1ZTogJ1xceDFiWzQ0bScsXG5cdGJnTWFnZW50YTogJ1xceDFiWzQ1bScsXG5cdGJnQ3lhbjogJ1xceDFiWzQ2bScsXG5cdGJnV2hpdGU6ICdcXHgxYls0N20nLFxufVxuXG4vLyBDaGVjayBpZiBjb2xvcnMgc2hvdWxkIGJlIGVuYWJsZWQgKHNlcnZlciBvbmx5LCBkZWZhdWx0OiB0cnVlLCBjYW4gYmUgZGlzYWJsZWQgd2l0aCBOT19DT0xPUiBlbnYgdmFyKVxuY29uc3QgZW5hYmxlQ29sb3JzID0gIWlzQnJvd3NlciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnYgJiYgcHJvY2Vzcy5lbnYuTk9fQ09MT1IgIT09ICcxJyAmJiBwcm9jZXNzLmVudi5OT19DT0xPUiAhPT0gJ3RydWUnXG5cbmZ1bmN0aW9uIGNvbG9yaXplKHRleHQ6IHN0cmluZywgY29sb3I6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiBlbmFibGVDb2xvcnMgPyBgJHtjb2xvcn0ke3RleHR9JHtjb2xvcnMucmVzZXR9YCA6IHRleHRcbn1cblxuZnVuY3Rpb24gZ2V0VGltZXN0YW1wKCk6IHN0cmluZyB7XG5cdGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcblx0Y29uc3QgaG91cnMgPSBTdHJpbmcobm93LmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJylcblx0Y29uc3QgbWludXRlcyA9IFN0cmluZyhub3cuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpXG5cdGNvbnN0IHNlY29uZHMgPSBTdHJpbmcobm93LmdldFNlY29uZHMoKSkucGFkU3RhcnQoMiwgJzAnKVxuXHRjb25zdCBtcyA9IFN0cmluZyhub3cuZ2V0TWlsbGlzZWNvbmRzKCkpLnBhZFN0YXJ0KDMsICcwJylcblx0cmV0dXJuIGAke2hvdXJzfToke21pbnV0ZXN9OiR7c2Vjb25kc30uJHttc31gXG59XG5cbmZ1bmN0aW9uIGZvcm1hdExldmVsKGxldmVsOiAnaW5mbycgfCAnZGVidWcnIHwgJ3dhcm4nIHwgJ2Vycm9yJyk6IHN0cmluZyB7XG5cdGNvbnN0IGxldmVsTWFwID0ge1xuXHRcdGluZm86IGNvbG9yaXplKCdJTkZPJywgY29sb3JzLmJyaWdodCArIGNvbG9ycy5jeWFuKSxcblx0XHRkZWJ1ZzogY29sb3JpemUoJ0RFQlVHJywgY29sb3JzLmJyaWdodCArIGNvbG9ycy5ibHVlKSxcblx0XHR3YXJuOiBjb2xvcml6ZSgnV0FSTicsIGNvbG9ycy5icmlnaHQgKyBjb2xvcnMueWVsbG93KSxcblx0XHRlcnJvcjogY29sb3JpemUoJ0VSUk9SJywgY29sb3JzLmJyaWdodCArIGNvbG9ycy5yZWQpLFxuXHR9XG5cdHJldHVybiBsZXZlbE1hcFtsZXZlbF1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dDb250ZXh0IHtcblx0cGF0aG5hbWU/OiBzdHJpbmdcblx0bWV0aG9kPzogc3RyaW5nXG5cdHNlc3Npb25JZD86IHN0cmluZ1xuXHRyb3V0ZT86IHN0cmluZ1xuXHRtb2R1bGU/OiBzdHJpbmcgLy8gTW9kdWxlIG5hbWUgKGUuZy4sICdpZGVudGl0eScsICdvcmRlcicpIC0gd2lsbCBiZSBzaG93biBhcyBbbW9kdWxlXSBwcmVmaXhcblx0W2tleTogc3RyaW5nXTogYW55XG59XG5cbmNsYXNzIExvZ2dlciB7XG5cdC8vIERlZmF1bHQgcHJlZml4OiBbU1NSXSBmb3Igc2VydmVyIGluZnJhc3RydWN0dXJlLCBbQVBQXSBmb3IgYXBwbGljYXRpb24gY29kZVxuXHRwcml2YXRlIHByZWZpeDogc3RyaW5nID0gJ1tTU1JdJ1xuXHRcblx0LyoqXG5cdCAqIFNldCB0aGUgbG9nIHByZWZpeCAoZGVmYXVsdDogJ1tTU1JdJyBmb3IgaW5mcmFzdHJ1Y3R1cmUsICdbQVBQXScgZm9yIGFwcGxpY2F0aW9uIGNvZGUpXG5cdCAqL1xuXHRzZXRQcmVmaXgocHJlZml4OiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLnByZWZpeCA9IHByZWZpeFxuXHR9XG5cdFxuXHRwcml2YXRlIGZvcm1hdE1lc3NhZ2UobGV2ZWw6ICdpbmZvJyB8ICdkZWJ1ZycgfCAnd2FybicgfCAnZXJyb3InLCBtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogc3RyaW5nIHtcblx0XHRjb25zdCB0aW1lc3RhbXAgPSBjb2xvcml6ZShnZXRUaW1lc3RhbXAoKSwgY29sb3JzLmRpbSArIGNvbG9ycy53aGl0ZSlcblx0XHRjb25zdCBsZXZlbFN0ciA9IGZvcm1hdExldmVsKGxldmVsKVxuXHRcdFxuXHRcdC8vIEFsd2F5cyB1c2UgdGhlIHNldCBwcmVmaXggKGUuZy4sIFtBUFBdIG9yIFtTU1JdKVxuXHRcdGNvbnN0IHByZWZpeFN0ciA9IGNvbG9yaXplKHRoaXMucHJlZml4LCB0aGlzLnByZWZpeCA9PT0gJ1tTU1JdJyA/IGNvbG9ycy5icmlnaHQgKyBjb2xvcnMubWFnZW50YSA6IGNvbG9ycy5icmlnaHQgKyBjb2xvcnMuY3lhbilcblx0XHRcblx0XHQvLyBJbmNsdWRlIG1vZHVsZSBpbiBtZXNzYWdlIGlmIHByb3ZpZGVkXG5cdFx0bGV0IGRpc3BsYXlNZXNzYWdlID0gbWVzc2FnZVxuXHRcdGlmIChjb250ZXh0Py5tb2R1bGUpIHtcblx0XHRcdGRpc3BsYXlNZXNzYWdlID0gYFske2NvbnRleHQubW9kdWxlfV0gJHttZXNzYWdlfWBcblx0XHR9XG5cdFx0XG5cdFx0bGV0IGNvbnRleHRTdHIgPSAnJ1xuXHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGFydHM6IHN0cmluZ1tdID0gW11cblx0XHRcdGlmIChjb250ZXh0Lm1ldGhvZCkge1xuXHRcdFx0XHRjb250ZXh0UGFydHMucHVzaChjb2xvcml6ZShjb250ZXh0Lm1ldGhvZCwgY29sb3JzLmN5YW4pKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbnRleHQucGF0aG5hbWUpIHtcblx0XHRcdFx0Y29udGV4dFBhcnRzLnB1c2goY29sb3JpemUoY29udGV4dC5wYXRobmFtZSwgY29sb3JzLmdyZWVuKSlcblx0XHRcdH1cblx0XHRcdGlmIChjb250ZXh0LnJvdXRlKSB7XG5cdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGByb3V0ZToke2NvbnRleHQucm91dGV9YCwgY29sb3JzLmJsdWUpKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGNvbnRleHQuc2Vzc2lvbklkKSB7XG5cdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGBzZXNzaW9uOiR7Y29udGV4dC5zZXNzaW9uSWQuc2xpY2UoMCwgOCl9Li4uYCwgY29sb3JzLmRpbSArIGNvbG9ycy53aGl0ZSkpXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIEFkZCBhbnkgYWRkaXRpb25hbCBjb250ZXh0IGZpZWxkcyAoZXhjbHVkaW5nIG1vZHVsZSB3aGljaCBpcyBzaG93biBpbiBtZXNzYWdlKVxuXHRcdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29udGV4dCkpIHtcblx0XHRcdFx0aWYgKCFbJ21ldGhvZCcsICdwYXRobmFtZScsICdyb3V0ZScsICdzZXNzaW9uSWQnLCAnbW9kdWxlJ10uaW5jbHVkZXMoa2V5KSkge1xuXHRcdFx0XHRcdGNvbnRleHRQYXJ0cy5wdXNoKGNvbG9yaXplKGAke2tleX06JHt2YWx1ZX1gLCBjb2xvcnMuZGltICsgY29sb3JzLndoaXRlKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoY29udGV4dFBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29udGV4dFN0ciA9ICcgJyArIGNvbnRleHRQYXJ0cy5qb2luKCcgJylcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIGAke3RpbWVzdGFtcH0gJHtwcmVmaXhTdHJ9ICR7bGV2ZWxTdHJ9JHtjb250ZXh0U3RyfSAke2Rpc3BsYXlNZXNzYWdlfWBcblx0fVxuXHRcblx0cHJpdmF0ZSBmb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0PzogTG9nQ29udGV4dCk6IHN0cmluZ1tdIHtcblx0XHRpZiAoIWNvbnRleHQpIHJldHVybiBbXVxuXHRcdFxuXHRcdGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG5cdFx0aWYgKGNvbnRleHQubWV0aG9kKSBwYXJ0cy5wdXNoKGBNZXRob2Q6ICR7Y29udGV4dC5tZXRob2R9YClcblx0XHRpZiAoY29udGV4dC5wYXRobmFtZSkgcGFydHMucHVzaChgUGF0aDogJHtjb250ZXh0LnBhdGhuYW1lfWApXG5cdFx0aWYgKGNvbnRleHQucm91dGUpIHBhcnRzLnB1c2goYFJvdXRlOiAke2NvbnRleHQucm91dGV9YClcblx0XHRpZiAoY29udGV4dC5zZXNzaW9uSWQpIHBhcnRzLnB1c2goYFNlc3Npb246ICR7Y29udGV4dC5zZXNzaW9uSWQuc2xpY2UoMCwgOCl9Li4uYClcblx0XHRcblx0XHQvLyBBZGQgYW55IGFkZGl0aW9uYWwgY29udGV4dCBmaWVsZHMgKGV4Y2x1ZGluZyBtb2R1bGUgd2hpY2ggaXMgdXNlZCBhcyBwcmVmaXgpXG5cdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29udGV4dCkpIHtcblx0XHRcdGlmICghWydtZXRob2QnLCAncGF0aG5hbWUnLCAncm91dGUnLCAnc2Vzc2lvbklkJywgJ21vZHVsZSddLmluY2x1ZGVzKGtleSkpIHtcblx0XHRcdFx0cGFydHMucHVzaChgJHtrZXl9OiAke3ZhbHVlfWApXG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiBwYXJ0c1xuXHR9XG5cdFxuXHRwcml2YXRlIGdldERpc3BsYXlQcmVmaXgoY29udGV4dD86IExvZ0NvbnRleHQpOiBzdHJpbmcge1xuXHRcdC8vIEFsd2F5cyB1c2UgdGhlIHNldCBwcmVmaXggKGUuZy4sIFtjbGllbnRdIG9yIFtTU1JdKVxuXHRcdHJldHVybiB0aGlzLnByZWZpeFxuXHR9XG5cdFxuXHRwcml2YXRlIGdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IExvZ0NvbnRleHQpOiBzdHJpbmcge1xuXHRcdC8vIEluY2x1ZGUgbW9kdWxlIGluIG1lc3NhZ2UgaWYgcHJvdmlkZWRcblx0XHRpZiAoY29udGV4dD8ubW9kdWxlKSB7XG5cdFx0XHRyZXR1cm4gYFske2NvbnRleHQubW9kdWxlfV0gJHttZXNzYWdlfWBcblx0XHR9XG5cdFx0cmV0dXJuIG1lc3NhZ2Vcblx0fVxuXHRcblx0aW5mbyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogdm9pZCB7XG5cdFx0aWYgKGlzQnJvd3Nlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzID0gdGhpcy5mb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheVByZWZpeCA9IHRoaXMuZ2V0RGlzcGxheVByZWZpeChjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIGNvbnRleHQpXG5cdFx0XHQvLyBVc2UgbXVsdGlwbGUgJWMgZm9yIGRpZmZlcmVudCBjb2xvcmVkIHBhcnRzOiBwcmVmaXgsIGxldmVsLCBtZXNzYWdlXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjMjJkM2VlOyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIElORk8lYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0XHRjb250ZXh0UGFydHMuZm9yRWFjaChwYXJ0ID0+IGNvbnNvbGUubG9nKGAgICR7cGFydH1gKSlcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgJWMke2Rpc3BsYXlQcmVmaXh9JWMgSU5GTyVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuZm9ybWF0TWVzc2FnZSgnaW5mbycsIG1lc3NhZ2UsIGNvbnRleHQpKVxuXHRcdH1cblx0fVxuXHRcblx0ZGVidWcobWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogTG9nQ29udGV4dCk6IHZvaWQge1xuXHRcdC8vIE9ubHkgbG9nIGRlYnVnIG1lc3NhZ2VzIGluIFNTUiBtb2RlIG9yIGJyb3dzZXIgZGV2IG1vZGVcblx0XHRjb25zdCBzaG91bGRMb2cgPSBnbG9iYWxUaGlzLl9fU1NSX01PREVfXyB8fCAoaXNCcm93c2VyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudj8uTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJylcblx0XHRcblx0XHRpZiAoIXNob3VsZExvZykgcmV0dXJuXG5cdFx0XG5cdFx0aWYgKGlzQnJvd3Nlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzID0gdGhpcy5mb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheVByZWZpeCA9IHRoaXMuZ2V0RGlzcGxheVByZWZpeChjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIGNvbnRleHQpXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjNGFkZTgwOyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIERFQlVHJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdFx0Y29udGV4dFBhcnRzLmZvckVhY2gocGFydCA9PiBjb25zb2xlLmxvZyhgICAke3BhcnR9YCkpXG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYCVjJHtkaXNwbGF5UHJlZml4fSVjIERFQlVHJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5mb3JtYXRNZXNzYWdlKCdkZWJ1ZycsIG1lc3NhZ2UsIGNvbnRleHQpKVxuXHRcdH1cblx0fVxuXHRcblx0d2FybihtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBMb2dDb250ZXh0KTogdm9pZCB7XG5cdFx0aWYgKGlzQnJvd3Nlcikge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhcnRzID0gdGhpcy5mb3JtYXRDb250ZXh0Rm9yQnJvd3Nlcihjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheVByZWZpeCA9IHRoaXMuZ2V0RGlzcGxheVByZWZpeChjb250ZXh0KVxuXHRcdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIGNvbnRleHQpXG5cdFx0XHRjb25zdCBwcmVmaXhTdHlsZSA9IGRpc3BsYXlQcmVmaXggPT09ICdbU1NSXScgPyAnY29sb3I6ICNkOTQ2ZWY7IGZvbnQtd2VpZ2h0OiBib2xkJyA6ICdjb2xvcjogIzNiODJmNjsgZm9udC13ZWlnaHQ6IGJvbGQnXG5cdFx0XHRjb25zdCBsZXZlbFN0eWxlID0gJ2NvbG9yOiAjZmJiZjI0OyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdFxuXHRcdFx0aWYgKGNvbnRleHRQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXAoYCVjJHtkaXNwbGF5UHJlZml4fSVjIFdBUk4lYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0XHRjb250ZXh0UGFydHMuZm9yRWFjaChwYXJ0ID0+IGNvbnNvbGUud2FybihgICAke3BhcnR9YCkpXG5cdFx0XHRcdGNvbnNvbGUuZ3JvdXBFbmQoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBXQVJOJWMgJHtkaXNwbGF5TWVzc2FnZX1gLCBwcmVmaXhTdHlsZSwgbGV2ZWxTdHlsZSwgJ2NvbG9yOiBpbmhlcml0Jylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKHRoaXMuZm9ybWF0TWVzc2FnZSgnd2FybicsIG1lc3NhZ2UsIGNvbnRleHQpKVxuXHRcdH1cblx0fVxuXHRcblx0ZXJyb3IobWVzc2FnZTogc3RyaW5nLCBlcnJvcj86IEVycm9yIHwgdW5rbm93biwgY29udGV4dD86IExvZ0NvbnRleHQpOiB2b2lkIHtcblx0XHRjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcilcblx0XHRjb25zdCBiYXNlTWVzc2FnZSA9IGVycm9yID8gYCR7bWVzc2FnZX06ICR7ZXJyb3JNZXNzYWdlfWAgOiBtZXNzYWdlXG5cdFx0Y29uc3QgZGlzcGxheU1lc3NhZ2UgPSB0aGlzLmdldERpc3BsYXlNZXNzYWdlKGJhc2VNZXNzYWdlLCBjb250ZXh0KVxuXHRcdFxuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXJ0cyA9IHRoaXMuZm9ybWF0Q29udGV4dEZvckJyb3dzZXIoY29udGV4dClcblx0XHRcdGNvbnN0IGRpc3BsYXlQcmVmaXggPSB0aGlzLmdldERpc3BsYXlQcmVmaXgoY29udGV4dClcblx0XHRcdGNvbnN0IHByZWZpeFN0eWxlID0gZGlzcGxheVByZWZpeCA9PT0gJ1tTU1JdJyA/ICdjb2xvcjogI2Q5NDZlZjsgZm9udC13ZWlnaHQ6IGJvbGQnIDogJ2NvbG9yOiAjM2I4MmY2OyBmb250LXdlaWdodDogYm9sZCdcblx0XHRcdGNvbnN0IGxldmVsU3R5bGUgPSAnY29sb3I6ICNlZjQ0NDQ7IGZvbnQtd2VpZ2h0OiBib2xkJ1xuXHRcdFx0XG5cdFx0XHRpZiAoY29udGV4dFBhcnRzLmxlbmd0aCA+IDAgfHwgZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5ncm91cChgJWMke2Rpc3BsYXlQcmVmaXh9JWMgRVJST1IlYyAke2Rpc3BsYXlNZXNzYWdlfWAsIHByZWZpeFN0eWxlLCBsZXZlbFN0eWxlLCAnY29sb3I6IGluaGVyaXQnKVxuXHRcdFx0XHRpZiAoY29udGV4dFBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb250ZXh0UGFydHMuZm9yRWFjaChwYXJ0ID0+IGNvbnNvbGUuZXJyb3IoYCAgJHtwYXJ0fWApKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLnN0YWNrKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignU3RhY2sgdHJhY2U6JywgZXJyb3Iuc3RhY2spXG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGAlYyR7ZGlzcGxheVByZWZpeH0lYyBFUlJPUiVjICR7ZGlzcGxheU1lc3NhZ2V9YCwgcHJlZml4U3R5bGUsIGxldmVsU3R5bGUsICdjb2xvcjogaW5oZXJpdCcpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5mb3JtYXRNZXNzYWdlKCdlcnJvcicsIGJhc2VNZXNzYWdlLCBjb250ZXh0KSlcblx0XHRcdGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLnN0YWNrKSB7XG5cdFx0XHRcdGNvbnN0IHN0YWNrVHJhY2UgPSBjb2xvcml6ZShlcnJvci5zdGFjaywgY29sb3JzLmRpbSArIGNvbG9ycy5yZWQpXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3Ioc3RhY2tUcmFjZSlcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLy8gRGVmYXVsdCBsb2dnZXIgaW5zdGFuY2UgZm9yIGFwcGxpY2F0aW9uIGNvZGUgKHdpbGwgYmUgc2V0IHRvIFtBUFBdIGJ5IGFwcCBpbml0aWFsaXphdGlvbilcbmV4cG9ydCBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKClcblxuLy8gRXhwb3J0IExvZ2dlciBjbGFzcyBmb3IgY3JlYXRpbmcgY3VzdG9tIGluc3RhbmNlc1xuZXhwb3J0IHtMb2dnZXJ9XG4iLAogICAgIi8qKlxuICogU1NSLXNwZWNpZmljIGxvZ2dlciBpbnN0YW5jZS5cbiAqIFNTUiBpbmZyYXN0cnVjdHVyZSBjb2RlIHNob3VsZCBpbXBvcnQge2xvZ2dlcn0gZnJvbSB0aGlzIGZpbGVcbiAqIHRvIGdldCBhIGxvZ2dlciBpbnN0YW5jZSB3aXRoIFtTU1JdIHByZWZpeC5cbiAqL1xuXG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi9sb2dnZXInXG5cbi8vIENyZWF0ZSBTU1IgbG9nZ2VyIGluc3RhbmNlIHdpdGggW1NTUl0gcHJlZml4XG5jb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKClcbmxvZ2dlci5zZXRQcmVmaXgoJ1tTU1JdJylcblxuZXhwb3J0IHtsb2dnZXJ9XG4iLAogICAgImltcG9ydCBWbm9kZSBmcm9tICcuLi9yZW5kZXIvdm5vZGUnXG5pbXBvcnQgaHlwZXJzY3JpcHQgZnJvbSAnLi4vcmVuZGVyL2h5cGVyc2NyaXB0J1xuaW1wb3J0IGRlY29kZVVSSUNvbXBvbmVudFNhZmUgZnJvbSAnLi4vdXRpbC9kZWNvZGVVUklDb21wb25lbnRTYWZlJ1xuaW1wb3J0IGJ1aWxkUGF0aG5hbWUgZnJvbSAnLi4vcGF0aG5hbWUvYnVpbGQnXG5pbXBvcnQgcGFyc2VQYXRobmFtZSBmcm9tICcuLi9wYXRobmFtZS9wYXJzZSdcbmltcG9ydCBjb21waWxlVGVtcGxhdGUgZnJvbSAnLi4vcGF0aG5hbWUvY29tcGlsZVRlbXBsYXRlJ1xuaW1wb3J0IGNlbnNvciBmcm9tICcuLi91dGlsL2NlbnNvcidcbmltcG9ydCB7Z2V0UGF0aG5hbWUsIGdldFNlYXJjaCwgZ2V0SGFzaH0gZnJvbSAnLi4vdXRpbC91cmknXG5pbXBvcnQge2xvZ2dlcn0gZnJvbSAnLi4vc2VydmVyL3NzckxvZ2dlcidcblxuaW1wb3J0IHR5cGUge0NvbXBvbmVudFR5cGUsIFZub2RlIGFzIFZub2RlVHlwZX0gZnJvbSAnLi4vcmVuZGVyL3Zub2RlJ1xuXG4vLyBSZWRpcmVjdE9iamVjdCB3aWxsIGJlIGRlZmluZWQgYWZ0ZXIgUkVESVJFQ1Qgc3ltYm9sIGlzIGNyZWF0ZWRcbi8vIFVzaW5nIGEgdHlwZSB0aGF0IHJlZmVyZW5jZXMgdGhlIHN5bWJvbCBpbmRpcmVjdGx5XG5leHBvcnQgdHlwZSBSZWRpcmVjdE9iamVjdCA9IHtba2V5OiBzeW1ib2xdOiBzdHJpbmd9XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVSZXNvbHZlcjxBdHRycyA9IFJlY29yZDxzdHJpbmcsIGFueT4sIFN0YXRlID0gYW55PiB7XG5cdG9ubWF0Y2g/OiAoXG5cdFx0YXJnczogQXR0cnMsXG5cdFx0cmVxdWVzdGVkUGF0aDogc3RyaW5nLFxuXHRcdHJvdXRlOiBzdHJpbmcsXG5cdCkgPT4gQ29tcG9uZW50VHlwZTxBdHRycywgU3RhdGU+IHwgUHJvbWlzZTxDb21wb25lbnRUeXBlPEF0dHJzLCBTdGF0ZT4+IHwgUmVkaXJlY3RPYmplY3QgfCBQcm9taXNlPFJlZGlyZWN0T2JqZWN0PiB8IHZvaWRcblx0cmVuZGVyPzogKHZub2RlOiBWbm9kZVR5cGU8QXR0cnMsIFN0YXRlPikgPT4gVm5vZGVUeXBlXG59XG5cbmV4cG9ydCB0eXBlIFNTUlN0YXRlID0gUmVjb3JkPHN0cmluZywgYW55PlxuZXhwb3J0IHR5cGUgU1NSUmVzdWx0ID0gc3RyaW5nIHwge2h0bWw6IHN0cmluZzsgc3RhdGU6IFNTUlN0YXRlfVxuXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlIHtcblx0KHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgYW55Piwgc2hvdWxkUmVwbGFjZUhpc3Rvcnk/OiBib29sZWFuKTogdm9pZFxuXHQocGF0aDogc3RyaW5nLCBjb21wb25lbnQ6IENvbXBvbmVudFR5cGUsIHNob3VsZFJlcGxhY2VIaXN0b3J5PzogYm9vbGVhbik6IHZvaWRcblx0c2V0OiAocGF0aDogc3RyaW5nLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBkYXRhPzogYW55KSA9PiB2b2lkXG5cdGdldDogKCkgPT4gc3RyaW5nIHwgdW5kZWZpbmVkXG5cdHByZWZpeDogc3RyaW5nXG5cdGxpbms6ICh2bm9kZTogVm5vZGVUeXBlKSA9PiBzdHJpbmdcblx0cGFyYW06IChrZXk/OiBzdHJpbmcpID0+IGFueVxuXHRwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT5cblx0TGluazogQ29tcG9uZW50VHlwZVxuXHRTS0lQOiB7fVxuXHRSRURJUkVDVDogc3ltYm9sXG5cdHJlZGlyZWN0OiAocGF0aDogc3RyaW5nKSA9PiBSZWRpcmVjdE9iamVjdFxuXHRyZXNvbHZlOiAoXG5cdFx0cGF0aG5hbWU6IHN0cmluZyxcblx0XHRyb3V0ZXM6IFJlY29yZDxzdHJpbmcsIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyIHwge2NvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXJ9Pixcblx0XHRyZW5kZXJUb1N0cmluZzogKHZub2RlczogYW55KSA9PiBQcm9taXNlPFNTUlJlc3VsdD4sXG5cdFx0cHJlZml4Pzogc3RyaW5nLFxuXHQpID0+IFByb21pc2U8U1NSUmVzdWx0PlxufVxuXG5pbnRlcmZhY2UgTW91bnRSZWRyYXcge1xuXHRtb3VudDogKHJvb3Q6IEVsZW1lbnQsIGNvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IG51bGwpID0+IHZvaWRcblx0cmVkcmF3OiAoKSA9PiB2b2lkXG59XG5cbmludGVyZmFjZSBSb3V0ZU9wdGlvbnMge1xuXHRyZXBsYWNlPzogYm9vbGVhblxuXHRzdGF0ZT86IGFueVxuXHR0aXRsZT86IHN0cmluZyB8IG51bGxcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVyKCR3aW5kb3c6IGFueSwgbW91bnRSZWRyYXc6IE1vdW50UmVkcmF3KSB7XG5cdGxldCBwID0gUHJvbWlzZS5yZXNvbHZlKClcblxuXHRsZXQgc2NoZWR1bGVkID0gZmFsc2VcblxuXHRsZXQgcmVhZHkgPSBmYWxzZVxuXHRsZXQgaGFzQmVlblJlc29sdmVkID0gZmFsc2VcblxuXHRsZXQgZG9tOiBFbGVtZW50IHwgdW5kZWZpbmVkXG5cdGxldCBjb21waWxlZDogQXJyYXk8e3JvdXRlOiBzdHJpbmc7IGNvbXBvbmVudDogYW55OyBjaGVjazogKGRhdGE6IHtwYXRoOiBzdHJpbmc7IHBhcmFtczogUmVjb3JkPHN0cmluZywgYW55Pn0pID0+IGJvb2xlYW59PiB8IHVuZGVmaW5lZFxuXHRsZXQgZmFsbGJhY2tSb3V0ZTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cblx0bGV0IGN1cnJlbnRSZXNvbHZlcjogUm91dGVSZXNvbHZlciB8IG51bGwgPSBudWxsXG5cdGxldCBjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBzdHJpbmcgPSAnZGl2J1xuXHRsZXQgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuXHRsZXQgY3VycmVudFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZFxuXHRsZXQgbGFzdFVwZGF0ZTogKChjb21wOiBhbnkpID0+IHZvaWQpIHwgbnVsbCA9IG51bGxcblxuXHRjb25zdCBSb3V0ZXJSb290OiBDb21wb25lbnRUeXBlID0ge1xuXHRcdG9ucmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJlYWR5ID0gaGFzQmVlblJlc29sdmVkID0gZmFsc2Vcblx0XHRcdCR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmaXJlQXN5bmMsIGZhbHNlKVxuXHRcdH0sXG5cdFx0dmlldzogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaGUgcm91dGUgaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZC5cblx0XHRcdC8vIFRoZXJlZm9yZSwgdGhlIGZvbGxvd2luZyBlYXJseSByZXR1cm4gaXMgbm90IG5lZWRlZC5cblx0XHRcdC8vIGlmICghaGFzQmVlblJlc29sdmVkKSByZXR1cm5cblxuXHRcdFx0Ly8gVXNlIGN1cnJlbnRQYXRoIGFzIGtleSB0byBlbnN1cmUgY29tcG9uZW50IHJlY3JlYXRpb24gb24gcm91dGUgY2hhbmdlXG5cdFx0XHQvLyBQYXNzIGN1cnJlbnRQYXRoIGluIGF0dHJzIHNvIFJvdXRlUmVzb2x2ZXIucmVuZGVyIGNhbiB1c2UgaXQgZm9yIHJvdXRlUGF0aFxuXHRcdFx0Y29uc3Qgcm91dGVBdHRycyA9IHsuLi5hdHRycywgcm91dGVQYXRoOiBjdXJyZW50UGF0aCB8fCBhdHRycy5yb3V0ZVBhdGgsIGtleTogY3VycmVudFBhdGggfHwgYXR0cnMua2V5fVxuXHRcdFx0Y29uc3Qgdm5vZGUgPSBWbm9kZShjb21wb25lbnQsIGN1cnJlbnRQYXRoIHx8IGF0dHJzLmtleSwgcm91dGVBdHRycywgbnVsbCwgbnVsbCwgbnVsbClcblx0XHRcdGlmIChjdXJyZW50UmVzb2x2ZXIpIHJldHVybiBjdXJyZW50UmVzb2x2ZXIucmVuZGVyISh2bm9kZSBhcyBhbnkpXG5cdFx0XHQvLyBXcmFwIGluIGEgZnJhZ21lbnQgdG8gcHJlc2VydmUgZXhpc3Rpbmcga2V5IHNlbWFudGljc1xuXHRcdFx0cmV0dXJuIFt2bm9kZV1cblx0XHR9LFxuXHR9XG5cblx0Y29uc3QgU0tJUCA9IHJvdXRlLlNLSVAgPSB7fVxuXHRcblx0Ly8gUmVkaXJlY3Qgc3ltYm9sIGZvciBpc29tb3JwaGljIHJlZGlyZWN0IGhhbmRsaW5nXG5cdGNvbnN0IFJFRElSRUNUID0gcm91dGUuUkVESVJFQ1QgPSBTeW1ib2woJ1JFRElSRUNUJylcblx0XG5cdC8vIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgcmVkaXJlY3Qgb2JqZWN0c1xuXHRyb3V0ZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHBhdGg6IHN0cmluZykge1xuXHRcdHJldHVybiB7W1JFRElSRUNUXTogcGF0aH0gYXMgUmVkaXJlY3RPYmplY3Rcblx0fVxuXHRcblx0Ly8gVHlwZSBndWFyZCB0byBjaGVjayBpZiB2YWx1ZSBpcyBhIHJlZGlyZWN0IG9iamVjdFxuXHQvLyBOb3RlOiBXZSBjaGVjayBmb3IgYW55IFN5bWJvbCBrZXkgdGhhdCBtaWdodCBiZSBhIHJlZGlyZWN0LCBub3QganVzdCBvdXIgc3BlY2lmaWMgUkVESVJFQ1Qgc3ltYm9sXG5cdC8vIFRoaXMgYWxsb3dzIHJlZGlyZWN0IG9iamVjdHMgY3JlYXRlZCBieSBkaWZmZXJlbnQgcm91dGVyIGluc3RhbmNlcyB0byBiZSBkZXRlY3RlZFxuXHRmdW5jdGlvbiBpc1JlZGlyZWN0KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBSZWRpcmVjdE9iamVjdCB7XG5cdFx0aWYgKHZhbHVlID09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlXG5cdFx0Ly8gQ2hlY2sgaWYgdGhpcyBvYmplY3QgaGFzIG91ciBSRURJUkVDVCBzeW1ib2xcblx0XHRpZiAoUkVESVJFQ1QgaW4gdmFsdWUpIHJldHVybiB0cnVlXG5cdFx0Ly8gQWxzbyBjaGVjayBmb3IgYW55IFN5bWJvbCBrZXlzIHRoYXQgbWlnaHQgYmUgcmVkaXJlY3Qgb2JqZWN0cyBmcm9tIG90aGVyIHJvdXRlciBpbnN0YW5jZXNcblx0XHQvLyBUaGlzIGhhbmRsZXMgdGhlIGNhc2Ugd2hlcmUgcmVkaXJlY3Qgb2JqZWN0cyBhcmUgY3JlYXRlZCBieSBjbGllbnQtc2lkZSBtLnJvdXRlLnJlZGlyZWN0XG5cdFx0Ly8gYnV0IGNoZWNrZWQgYnkgc2VydmVyLXNpZGUgcm91dGVyIChvciB2aWNlIHZlcnNhKVxuXHRcdGNvbnN0IHN5bWJvbEtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHZhbHVlKVxuXHRcdGlmIChzeW1ib2xLZXlzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIENoZWNrIGlmIGFueSBzeW1ib2wga2V5J3MgZGVzY3JpcHRpb24gc3VnZ2VzdHMgaXQncyBhIHJlZGlyZWN0XG5cdFx0XHQvLyBPciBjaGVjayBpZiB0aGUgb2JqZWN0IGhhcyBhIHN0cmluZyBwcm9wZXJ0eSB0aGF0IGxvb2tzIGxpa2UgYSBwYXRoXG5cdFx0XHRmb3IgKGNvbnN0IHN5bSBvZiBzeW1ib2xLZXlzKSB7XG5cdFx0XHRcdGNvbnN0IGRlc2MgPSBzeW0uZGVzY3JpcHRpb24gfHwgJydcblx0XHRcdFx0aWYgKGRlc2MuaW5jbHVkZXMoJ1JFRElSRUNUJykgfHwgZGVzYyA9PT0gJ1JFRElSRUNUJykge1xuXHRcdFx0XHRcdGNvbnN0IHBhdGggPSB2YWx1ZVtzeW1dXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJyAmJiBwYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblx0XG5cdC8vIEhlbHBlciB0byBleHRyYWN0IHJlZGlyZWN0IHBhdGggZnJvbSByZWRpcmVjdCBvYmplY3QgKGhhbmRsZXMgZGlmZmVyZW50IFJFRElSRUNUIHN5bWJvbHMpXG5cdGZ1bmN0aW9uIGdldFJlZGlyZWN0UGF0aChyZWRpcmVjdE9iajogUmVkaXJlY3RPYmplY3QpOiBzdHJpbmcge1xuXHRcdC8vIEZpcnN0IHRyeSBvdXIgUkVESVJFQ1Qgc3ltYm9sXG5cdFx0aWYgKFJFRElSRUNUIGluIHJlZGlyZWN0T2JqKSB7XG5cdFx0XHRyZXR1cm4gcmVkaXJlY3RPYmpbUkVESVJFQ1RdXG5cdFx0fVxuXHRcdC8vIE90aGVyd2lzZSwgY2hlY2sgYWxsIHN5bWJvbCBrZXlzXG5cdFx0Y29uc3Qgc3ltYm9sS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocmVkaXJlY3RPYmopXG5cdFx0Zm9yIChjb25zdCBzeW0gb2Ygc3ltYm9sS2V5cykge1xuXHRcdFx0Y29uc3QgcGF0aCA9IHJlZGlyZWN0T2JqW3N5bV1cblx0XHRcdGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycgJiYgcGF0aC5zdGFydHNXaXRoKCcvJykpIHtcblx0XHRcdFx0cmV0dXJuIHBhdGhcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlZGlyZWN0IG9iamVjdDogbm8gcmVkaXJlY3QgcGF0aCBmb3VuZCcpXG5cdH1cblxuXHRmdW5jdGlvbiByZXNvbHZlUm91dGUoKSB7XG5cdFx0c2NoZWR1bGVkID0gZmFsc2Vcblx0XHQvLyBDb25zaWRlciB0aGUgcGF0aG5hbWUgaG9saXN0aWNhbGx5LiBUaGUgcHJlZml4IG1pZ2h0IGV2ZW4gYmUgaW52YWxpZCxcblx0XHQvLyBidXQgdGhhdCdzIG5vdCBvdXIgcHJvYmxlbS5cblx0XHQvLyBVc2UgaXNvbW9ycGhpYyBVUkkgQVBJIHVuY29uZGl0aW9uYWxseSAtIGl0IGhhbmRsZXMgZW52aXJvbm1lbnQgZGV0ZWN0aW9uIGludGVybmFsbHlcblx0XHRjb25zdCBoYXNoID0gZ2V0SGFzaCgpXG5cdFx0bGV0IHByZWZpeCA9IGhhc2hcblx0XHRpZiAocm91dGUucHJlZml4WzBdICE9PSAnIycpIHtcblx0XHRcdGNvbnN0IHNlYXJjaCA9IGdldFNlYXJjaCgpXG5cdFx0XHRwcmVmaXggPSBzZWFyY2ggKyBwcmVmaXhcblx0XHRcdGlmIChyb3V0ZS5wcmVmaXhbMF0gIT09ICc/Jykge1xuXHRcdFx0XHRjb25zdCBwYXRobmFtZSA9IGdldFBhdGhuYW1lKClcblx0XHRcdFx0cHJlZml4ID0gcGF0aG5hbWUgKyBwcmVmaXhcblx0XHRcdFx0aWYgKHByZWZpeFswXSAhPT0gJy8nKSBwcmVmaXggPSAnLycgKyBwcmVmaXhcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgcGF0aCA9IGRlY29kZVVSSUNvbXBvbmVudFNhZmUocHJlZml4KS5zbGljZShyb3V0ZS5wcmVmaXgubGVuZ3RoKVxuXHRcdGNvbnN0IGRhdGEgPSBwYXJzZVBhdGhuYW1lKHBhdGgpXG5cblx0XHRPYmplY3QuYXNzaWduKGRhdGEucGFyYW1zLCAkd2luZG93Lmhpc3Rvcnkuc3RhdGUgfHwge30pXG5cblx0XHRmdW5jdGlvbiByZWplY3QoZTogYW55KSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKGUpXG5cdFx0XHRyb3V0ZS5zZXQoZmFsbGJhY2tSb3V0ZSEsIG51bGwsIHtyZXBsYWNlOiB0cnVlfSlcblx0XHR9XG5cblx0XHRsb29wKDApXG5cdFx0ZnVuY3Rpb24gbG9vcChpOiBudW1iZXIpIHtcblx0XHRcdGlmICghY29tcGlsZWQpIHJldHVyblxuXHRcdFx0Zm9yICg7IGkgPCBjb21waWxlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoY29tcGlsZWRbaV0uY2hlY2soZGF0YSkpIHtcblx0XHRcdFx0XHRsZXQgcGF5bG9hZCA9IGNvbXBpbGVkW2ldLmNvbXBvbmVudFxuXHRcdFx0XHRcdGNvbnN0IG1hdGNoZWRSb3V0ZSA9IGNvbXBpbGVkW2ldLnJvdXRlXG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxDb21wID0gcGF5bG9hZFxuXHRcdFx0XHRcdC8vIFN0b3JlIHRoZSBSb3V0ZVJlc29sdmVyIGlmIHBheWxvYWQgaGFzIGJvdGggb25tYXRjaCBhbmQgcmVuZGVyXG5cdFx0XHRcdFx0Ly8gVGhpcyBhbGxvd3MgdXMgdG8gcHJlc2VydmUgdGhlIHJlc29sdmVyIGV2ZW4gYWZ0ZXIgb25tYXRjaCByZXR1cm5zIGEgY29tcG9uZW50XG5cdFx0XHRcdFx0Y29uc3QgcmVzb2x2ZXJXaXRoUmVuZGVyID0gcGF5bG9hZCAmJiB0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcgJiYgcGF5bG9hZC5vbm1hdGNoICYmIHBheWxvYWQucmVuZGVyICYmICFwYXlsb2FkLnZpZXcgJiYgdHlwZW9mIHBheWxvYWQgIT09ICdmdW5jdGlvbicgPyBwYXlsb2FkIDogbnVsbFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IHVwZGF0ZSA9IGxhc3RVcGRhdGUgPSBmdW5jdGlvbihjb21wOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICh1cGRhdGUgIT09IGxhc3RVcGRhdGUpIHJldHVyblxuXHRcdFx0XHRcdFx0aWYgKGNvbXAgPT09IFNLSVApIHJldHVybiBsb29wKGkgKyAxKVxuXHRcdFx0XHRcdFx0Ly8gSGFuZGxlIHJlZGlyZWN0IG9iamVjdHM6IGV4cGxpY2l0IHJlZGlyZWN0IHNpZ25hbFxuXHRcdFx0XHRcdFx0aWYgKGlzUmVkaXJlY3QoY29tcCkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gRXh0cmFjdCByZWRpcmVjdCB0YXJnZXQgcGF0aFxuXHRcdFx0XHRcdFx0XHRjb25zdCByZWRpcmVjdFBhdGggPSBjb21wW1JFRElSRUNUXVxuXHRcdFx0XHRcdFx0XHQvLyBUcmlnZ2VyIG5hdmlnYXRpb24gdG8gcmVkaXJlY3QgdGFyZ2V0XG5cdFx0XHRcdFx0XHRcdHJvdXRlLnNldChyZWRpcmVjdFBhdGgsIG51bGwpXG5cdFx0XHRcdFx0XHRcdC8vIFNraXAgcmVuZGVyaW5nIGN1cnJlbnQgcm91dGUgLSBuZXcgcm91dGUgcmVzb2x1dGlvbiB3aWxsIGhhbmRsZSByZWRpcmVjdCB0YXJnZXRcblx0XHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGEgcHJlc2VydmVkIHJlc29sdmVyIHdpdGggcmVuZGVyLCB1c2UgaXRcblx0XHRcdFx0XHRcdGlmIChyZXNvbHZlcldpdGhSZW5kZXIpIHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFJlc29sdmVyID0gcmVzb2x2ZXJXaXRoUmVuZGVyXG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudCA9IGNvbXAgIT0gbnVsbCAmJiAodHlwZW9mIGNvbXAudmlldyA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgY29tcCA9PT0gJ2Z1bmN0aW9uJykgPyBjb21wIDogJ2Rpdidcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIElmIGNvbXAgaXMgYSBSb3V0ZVJlc29sdmVyIHdpdGggcmVuZGVyLCBzZXQgY3VycmVudFJlc29sdmVyIGluc3RlYWQgb2YgY29tcG9uZW50XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChjb21wICYmIHR5cGVvZiBjb21wID09PSAnb2JqZWN0JyAmJiBjb21wLnJlbmRlciAmJiAhY29tcC52aWV3ICYmIHR5cGVvZiBjb21wICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRSZXNvbHZlciA9IGNvbXBcblx0XHRcdFx0XHRcdFx0Y29tcG9uZW50ID0gJ2RpdicgLy8gUGxhY2Vob2xkZXIsIHdvbid0IGJlIHVzZWQgc2luY2UgY3VycmVudFJlc29sdmVyLnJlbmRlciB3aWxsIGJlIGNhbGxlZFxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y3VycmVudFJlc29sdmVyID0gbnVsbFxuXHRcdFx0XHRcdFx0XHRjb21wb25lbnQgPSBjb21wICE9IG51bGwgJiYgKHR5cGVvZiBjb21wLnZpZXcgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGNvbXAgPT09ICdmdW5jdGlvbicpID8gY29tcCA6ICdkaXYnXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRhdHRycyA9IGRhdGEucGFyYW1zXG5cdFx0XHRcdFx0XHRjdXJyZW50UGF0aCA9IHBhdGhcblx0XHRcdFx0XHRcdGxhc3RVcGRhdGUgPSBudWxsXG5cdFx0XHRcdFx0XHRpZiAoaGFzQmVlblJlc29sdmVkKSBtb3VudFJlZHJhdy5yZWRyYXcoKVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGhhc0JlZW5SZXNvbHZlZCA9IHRydWVcblx0XHRcdFx0XHRcdFx0bW91bnRSZWRyYXcubW91bnQoZG9tISwgUm91dGVyUm9vdClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gVGhlcmUncyBubyB1bmRlcnN0YXRpbmcgaG93IG11Y2ggSSAqd2lzaCogSSBjb3VsZFxuXHRcdFx0XHRcdC8vIHVzZSBgYXN5bmNgL2Bhd2FpdGAgaGVyZS4uLlxuXHRcdFx0XHRcdGlmIChwYXlsb2FkLnZpZXcgfHwgdHlwZW9mIHBheWxvYWQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHBheWxvYWQgPSB7fVxuXHRcdFx0XHRcdFx0dXBkYXRlKGxvY2FsQ29tcClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAocGF5bG9hZC5vbm1hdGNoKSB7XG5cdFx0XHRcdFx0XHRwLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBwYXlsb2FkLm9ubWF0Y2ghKGRhdGEucGFyYW1zLCBwYXRoLCBtYXRjaGVkUm91dGUpXG5cdFx0XHRcdFx0XHR9KS50aGVuKHVwZGF0ZSwgcGF0aCA9PT0gZmFsbGJhY2tSb3V0ZSA/IG51bGwgOiByZWplY3QpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHBheWxvYWQucmVuZGVyKSB7XG5cdFx0XHRcdFx0XHQvLyBSb3V0ZVJlc29sdmVyIHdpdGggcmVuZGVyIG1ldGhvZCAtIHVwZGF0ZSB3aXRoIHJlc29sdmVyIGl0c2VsZlxuXHRcdFx0XHRcdFx0dXBkYXRlKHBheWxvYWQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgdXBkYXRlKCdkaXYnKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwYXRoID09PSBmYWxsYmFja1JvdXRlKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHJlc29sdmUgZGVmYXVsdCByb3V0ZSAnICsgZmFsbGJhY2tSb3V0ZSArICcuJylcblx0XHRcdH1cblx0XHRcdHJvdXRlLnNldChmYWxsYmFja1JvdXRlISwgbnVsbCwge3JlcGxhY2U6IHRydWV9KVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGZpcmVBc3luYygpIHtcblx0XHRpZiAoIXNjaGVkdWxlZCkge1xuXHRcdFx0c2NoZWR1bGVkID0gdHJ1ZVxuXHRcdFx0Ly8gVE9ETzoganVzdCBkbyBgbW91bnRSZWRyYXcucmVkcmF3KClgIGhlcmUgYW5kIGVsaWRlIHRoZSB0aW1lclxuXHRcdFx0Ly8gZGVwZW5kZW5jeS4gTm90ZSB0aGF0IHRoaXMgd2lsbCBtdWNrIHdpdGggdGVzdHMgYSAqbG90Kiwgc28gaXQnc1xuXHRcdFx0Ly8gbm90IGFzIGVhc3kgb2YgYSBjaGFuZ2UgYXMgaXQgc291bmRzLlxuXHRcdFx0c2V0VGltZW91dChyZXNvbHZlUm91dGUpXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcm91dGUocm9vdDogRWxlbWVudCwgZGVmYXVsdFJvdXRlOiBzdHJpbmcsIHJvdXRlczogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXI+KSB7XG5cdFx0aWYgKCFyb290KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdET00gZWxlbWVudCBiZWluZyByZW5kZXJlZCB0byBkb2VzIG5vdCBleGlzdC4nKVxuXG5cdFx0Y29tcGlsZWQgPSBPYmplY3Qua2V5cyhyb3V0ZXMpLm1hcChmdW5jdGlvbihyb3V0ZVBhdGgpIHtcblx0XHRcdGlmIChyb3V0ZVBhdGhbMF0gIT09ICcvJykgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdSb3V0ZXMgbXVzdCBzdGFydCB3aXRoIGEgXFwnL1xcJy4nKVxuXHRcdFx0aWYgKCgvOihbXlxcL1xcLi1dKykoXFwuezN9KT86LykudGVzdChyb3V0ZVBhdGgpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBTeW50YXhFcnJvcignUm91dGUgcGFyYW1ldGVyIG5hbWVzIG11c3QgYmUgc2VwYXJhdGVkIHdpdGggZWl0aGVyIFxcJy9cXCcsIFxcJy5cXCcsIG9yIFxcJy1cXCcuJylcblx0XHRcdH1cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJvdXRlOiByb3V0ZVBhdGgsXG5cdFx0XHRcdGNvbXBvbmVudDogcm91dGVzW3JvdXRlUGF0aF0sXG5cdFx0XHRcdGNoZWNrOiBjb21waWxlVGVtcGxhdGUocm91dGVQYXRoKSxcblx0XHRcdH1cblx0XHR9KVxuXHRcdGZhbGxiYWNrUm91dGUgPSBkZWZhdWx0Um91dGVcblx0XHRpZiAoZGVmYXVsdFJvdXRlICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IGRlZmF1bHREYXRhID0gcGFyc2VQYXRobmFtZShkZWZhdWx0Um91dGUpXG5cblx0XHRcdGlmICghY29tcGlsZWQuc29tZShmdW5jdGlvbihpKSB7IHJldHVybiBpLmNoZWNrKGRlZmF1bHREYXRhKSB9KSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0RlZmF1bHQgcm91dGUgZG9lc25cXCd0IG1hdGNoIGFueSBrbm93biByb3V0ZXMuJylcblx0XHRcdH1cblx0XHR9XG5cdFx0ZG9tID0gcm9vdFxuXG5cdFx0JHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZpcmVBc3luYywgZmFsc2UpXG5cblx0XHRyZWFkeSA9IHRydWVcblxuXHRcdC8vIFRoZSBSb3V0ZXJSb290IGNvbXBvbmVudCBpcyBtb3VudGVkIHdoZW4gdGhlIHJvdXRlIGlzIGZpcnN0IHJlc29sdmVkLlxuXHRcdHJlc29sdmVSb3V0ZSgpXG5cdH1cblx0cm91dGUuc2V0ID0gZnVuY3Rpb24ocGF0aDogc3RyaW5nLCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCwgb3B0aW9ucz86IFJvdXRlT3B0aW9ucykge1xuXHRcdGlmIChsYXN0VXBkYXRlICE9IG51bGwpIHtcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cdFx0XHRvcHRpb25zLnJlcGxhY2UgPSB0cnVlXG5cdFx0fVxuXHRcdGxhc3RVcGRhdGUgPSBudWxsXG5cblx0XHRwYXRoID0gYnVpbGRQYXRobmFtZShwYXRoLCBkYXRhIHx8IHt9KVxuXHRcdGlmIChyZWFkeSkge1xuXHRcdFx0Ly8gUm91dGVyIGlzIGluaXRpYWxpemVkIC0gdXNlIGhpc3RvcnkgQVBJIGZvciBuYXZpZ2F0aW9uXG5cdFx0XHRmaXJlQXN5bmMoKVxuXHRcdFx0Y29uc3Qgc3RhdGUgPSBvcHRpb25zID8gb3B0aW9ucy5zdGF0ZSA6IG51bGxcblx0XHRcdGNvbnN0IHRpdGxlID0gb3B0aW9ucyA/IG9wdGlvbnMudGl0bGUgOiBudWxsXG5cdFx0XHRpZiAoJHdpbmRvdz8uaGlzdG9yeSkge1xuXHRcdFx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlcGxhY2UpICR3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCByb3V0ZS5wcmVmaXggKyBwYXRoKVxuXHRcdFx0XHRlbHNlICR3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCByb3V0ZS5wcmVmaXggKyBwYXRoKVxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gU1NSIGNvbnRleHQgKG5vICR3aW5kb3cpLCBuYXZpZ2F0aW9uIGlzIGEgbm8tb3Agc2luY2Ugd2UncmUganVzdCByZW5kZXJpbmcgSFRNTFxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdC8vIFJvdXRlciBub3QgeWV0IGluaXRpYWxpemVkIC0gdXNlIGxvY2F0aW9uLmhyZWYgZm9yIGluaXRpYWwgbmF2aWdhdGlvblxuXHRcdFx0aWYgKCR3aW5kb3c/LmxvY2F0aW9uKSB7XG5cdFx0XHRcdCR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJvdXRlLnByZWZpeCArIHBhdGhcblx0XHRcdH1cblx0XHRcdC8vIEluIFNTUiBjb250ZXh0IChubyAkd2luZG93KSwgdGhpcyBpcyBhIG5vLW9wIHNpbmNlIHdlJ3JlIGp1c3QgcmVuZGVyaW5nIEhUTUxcblx0XHR9XG5cdH1cblx0cm91dGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gSWYgY3VycmVudFBhdGggaXMgbm90IHNldCAoZS5nLiwgZHVyaW5nIFNTUiBiZWZvcmUgcm91dGUucmVzb2x2ZSBpcyBjYWxsZWQpLFxuXHRcdC8vIGZhbGwgYmFjayB0byBleHRyYWN0aW5nIHBhdGhuYW1lIGZyb20gX19TU1JfVVJMX18gdXNpbmcgdGhlIGlzb21vcnBoaWMgVVJJIEFQSVxuXHRcdGlmIChjdXJyZW50UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gZ2V0UGF0aG5hbWUoKVxuXHRcdH1cblx0XHRyZXR1cm4gY3VycmVudFBhdGhcblx0fVxuXHRyb3V0ZS5wcmVmaXggPSAnIyEnXG5cdHJvdXRlLmxpbmsgPSBmdW5jdGlvbih2bm9kZTogVm5vZGVUeXBlKSB7XG5cdFx0cmV0dXJuIHJvdXRlLkxpbmsudmlldyh2bm9kZSlcblx0fVxuXHRyb3V0ZS5MaW5rID0ge1xuXHRcdHZpZXc6IGZ1bmN0aW9uKHZub2RlOiBWbm9kZVR5cGUpIHtcblx0XHRcdC8vIE9taXQgdGhlIHVzZWQgcGFyYW1ldGVycyBmcm9tIHRoZSByZW5kZXJlZCBlbGVtZW50IC0gdGhleSBhcmVcblx0XHRcdC8vIGludGVybmFsLiBBbHNvLCBjZW5zb3IgdGhlIHZhcmlvdXMgbGlmZWN5Y2xlIG1ldGhvZHMuXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2UgZG9uJ3Qgc3RyaXAgdGhlIG90aGVyIHBhcmFtZXRlcnMgYmVjYXVzZSBmb3IgY29udmVuaWVuY2Ugd2Vcblx0XHRcdC8vIGxldCB0aGVtIGJlIHNwZWNpZmllZCBpbiB0aGUgc2VsZWN0b3IgYXMgd2VsbC5cblx0XHRcdGNvbnN0IGNoaWxkID0gaHlwZXJzY3JpcHQoXG5cdFx0XHRcdHZub2RlLmF0dHJzPy5zZWxlY3RvciB8fCAnYScsXG5cdFx0XHRcdGNlbnNvcih2bm9kZS5hdHRycyB8fCB7fSwgWydvcHRpb25zJywgJ3BhcmFtcycsICdzZWxlY3RvcicsICdvbmNsaWNrJ10pLFxuXHRcdFx0XHR2bm9kZS5jaGlsZHJlbixcblx0XHRcdClcblx0XHRcdGxldCBvcHRpb25zOiBSb3V0ZU9wdGlvbnMgfCB1bmRlZmluZWRcblx0XHRcdGxldCBvbmNsaWNrOiBhbnlcblx0XHRcdGxldCBocmVmOiBzdHJpbmdcblxuXHRcdFx0Ly8gTGV0J3MgcHJvdmlkZSBhICpyaWdodCogd2F5IHRvIGRpc2FibGUgYSByb3V0ZSBsaW5rLCByYXRoZXIgdGhhblxuXHRcdFx0Ly8gbGV0dGluZyBwZW9wbGUgc2NyZXcgdXAgYWNjZXNzaWJpbGl0eSBvbiBhY2NpZGVudC5cblx0XHRcdC8vXG5cdFx0XHQvLyBUaGUgYXR0cmlidXRlIGlzIGNvZXJjZWQgc28gdXNlcnMgZG9uJ3QgZ2V0IHN1cnByaXNlZCBvdmVyXG5cdFx0XHQvLyBgZGlzYWJsZWQ6IDBgIHJlc3VsdGluZyBpbiBhIGJ1dHRvbiB0aGF0J3Mgc29tZWhvdyByb3V0YWJsZVxuXHRcdFx0Ly8gZGVzcGl0ZSBiZWluZyB2aXNpYmx5IGRpc2FibGVkLlxuXHRcdFx0aWYgKGNoaWxkLmF0dHJzIS5kaXNhYmxlZCA9IEJvb2xlYW4oY2hpbGQuYXR0cnMhLmRpc2FibGVkKSkge1xuXHRcdFx0XHRjaGlsZC5hdHRycyEuaHJlZiA9IG51bGxcblx0XHRcdFx0Y2hpbGQuYXR0cnMhWydhcmlhLWRpc2FibGVkJ10gPSAndHJ1ZSdcblx0XHRcdFx0Ly8gSWYgeW91ICpyZWFsbHkqIGRvIHdhbnQgYWRkIGBvbmNsaWNrYCBvbiBhIGRpc2FibGVkIGxpbmssIHVzZVxuXHRcdFx0XHQvLyBhbiBgb25jcmVhdGVgIGhvb2sgdG8gYWRkIGl0LlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3B0aW9ucyA9IHZub2RlLmF0dHJzPy5vcHRpb25zXG5cdFx0XHRcdG9uY2xpY2sgPSB2bm9kZS5hdHRycz8ub25jbGlja1xuXHRcdFx0XHQvLyBFYXNpZXIgdG8gYnVpbGQgaXQgbm93IHRvIGtlZXAgaXQgaXNvbW9ycGhpYy5cblx0XHRcdFx0aHJlZiA9IGJ1aWxkUGF0aG5hbWUoY2hpbGQuYXR0cnMhLmhyZWYgfHwgJycsIHZub2RlLmF0dHJzPy5wYXJhbXMgfHwge30pXG5cdFx0XHRcdC8vIE1ha2UgTGluayBpc29tb3JwaGljIC0gdXNlIGVtcHR5IHByZWZpeCBvbiBzZXJ2ZXIgZm9yIHBhdGhuYW1lIHJvdXRpbmdcblx0XHRcdFx0Ly8gT24gc2VydmVyICgkd2luZG93IGlzIG51bGwpOiBhbHdheXMgdXNlIGVtcHR5IHByZWZpeCBmb3IgY2xlYW4gVVJMc1xuXHRcdFx0XHQvLyBPbiBjbGllbnQ6IHVzZSByb3V0ZS5wcmVmaXggKHdoaWNoIG1heSBiZSAnIyEnIGZvciBoYXNoIHJvdXRpbmcgb3IgJycgZm9yIHBhdGhuYW1lIHJvdXRpbmcpXG5cdFx0XHRcdC8vIFRoaXMgZW5zdXJlcyBTU1IgZ2VuZXJhdGVzIGNsZWFuIHBhdGhuYW1lIFVSTHMgd2hpbGUgY2xpZW50IGNhbiB1c2UgaGFzaCByb3V0aW5nIGlmIGNvbmZpZ3VyZWRcblx0XHRcdFx0Y29uc3QgbGlua1ByZWZpeCA9ICgkd2luZG93ID09IG51bGwpID8gJycgOiByb3V0ZS5wcmVmaXhcblx0XHRcdFx0Y2hpbGQuYXR0cnMhLmhyZWYgPSBsaW5rUHJlZml4ICsgaHJlZlxuXHRcdFx0XHRjaGlsZC5hdHRycyEub25jbGljayA9IGZ1bmN0aW9uKGU6IGFueSkge1xuXHRcdFx0XHRcdGxldCByZXN1bHQ6IGFueVxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb25jbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gb25jbGljay5jYWxsKGUuY3VycmVudFRhcmdldCwgZSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG9uY2xpY2sgPT0gbnVsbCB8fCB0eXBlb2Ygb25jbGljayAhPT0gJ29iamVjdCcpIHtcblx0XHRcdFx0XHRcdC8vIGRvIG5vdGhpbmdcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBvbmNsaWNrLmhhbmRsZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvbmNsaWNrLmhhbmRsZUV2ZW50KGUpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQWRhcHRlZCBmcm9tIFJlYWN0IFJvdXRlcidzIGltcGxlbWVudGF0aW9uOlxuXHRcdFx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9SZWFjdFRyYWluaW5nL3JlYWN0LXJvdXRlci9ibG9iLzUyMGEwYWNkNDhhZTFiMDY2ZWIwYjA3ZDZkNGQxNzkwYTFkMDI0ODIvcGFja2FnZXMvcmVhY3Qtcm91dGVyLWRvbS9tb2R1bGVzL0xpbmsuanNcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vIFRyeSB0byBiZSBmbGV4aWJsZSBhbmQgaW50dWl0aXZlIGluIGhvdyB3ZSBoYW5kbGUgbGlua3MuXG5cdFx0XHRcdFx0Ly8gRnVuIGZhY3Q6IGxpbmtzIGFyZW4ndCBhcyBvYnZpb3VzIHRvIGdldCByaWdodCBhcyB5b3Vcblx0XHRcdFx0XHQvLyB3b3VsZCBleHBlY3QuIFRoZXJlJ3MgYSBsb3QgbW9yZSB2YWxpZCB3YXlzIHRvIGNsaWNrIGFcblx0XHRcdFx0XHQvLyBsaW5rIHRoYW4gdGhpcywgYW5kIG9uZSBtaWdodCB3YW50IHRvIG5vdCBzaW1wbHkgY2xpY2sgYVxuXHRcdFx0XHRcdC8vIGxpbmssIGJ1dCByaWdodCBjbGljayBvciBjb21tYW5kLWNsaWNrIGl0IHRvIGNvcHkgdGhlXG5cdFx0XHRcdFx0Ly8gbGluayB0YXJnZXQsIGV0Yy4gTm9wZSwgdGhpcyBpc24ndCBqdXN0IGZvciBibGluZCBwZW9wbGUuXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0Ly8gU2tpcCBpZiBgb25jbGlja2AgcHJldmVudGVkIGRlZmF1bHRcblx0XHRcdFx0XHRcdHJlc3VsdCAhPT0gZmFsc2UgJiYgIWUuZGVmYXVsdFByZXZlbnRlZCAmJlxuXHRcdFx0XHRcdFx0Ly8gSWdub3JlIGV2ZXJ5dGhpbmcgYnV0IGxlZnQgY2xpY2tzXG5cdFx0XHRcdFx0XHQoZS5idXR0b24gPT09IDAgfHwgZS53aGljaCA9PT0gMCB8fCBlLndoaWNoID09PSAxKSAmJlxuXHRcdFx0XHRcdFx0Ly8gTGV0IHRoZSBicm93c2VyIGhhbmRsZSBgdGFyZ2V0PV9ibGFua2AsIGV0Yy5cblx0XHRcdFx0XHRcdCghZS5jdXJyZW50VGFyZ2V0LnRhcmdldCB8fCBlLmN1cnJlbnRUYXJnZXQudGFyZ2V0ID09PSAnX3NlbGYnKSAmJlxuXHRcdFx0XHRcdFx0Ly8gTm8gbW9kaWZpZXIga2V5c1xuXHRcdFx0XHRcdFx0IWUuY3RybEtleSAmJiAhZS5tZXRhS2V5ICYmICFlLnNoaWZ0S2V5ICYmICFlLmFsdEtleVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0Ly8gU2FmZWx5IGNhbGwgcHJldmVudERlZmF1bHQgLSBldmVudCBtaWdodCBiZSB3cmFwcGVkIGJ5IE1pdGhyaWxcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZS5wcmV2ZW50RGVmYXVsdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZS5vcmlnaW5hbEV2ZW50ICYmIHR5cGVvZiBlLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0ZS5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdChlIGFzIGFueSkucmVkcmF3ID0gZmFsc2Vcblx0XHRcdFx0XHRcdHJvdXRlLnNldChocmVmLCBudWxsLCBvcHRpb25zKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNoaWxkXG5cdFx0fSxcblx0fVxuXHRyb3V0ZS5wYXJhbSA9IGZ1bmN0aW9uKGtleT86IHN0cmluZykge1xuXHRcdHJldHVybiBhdHRycyAmJiBrZXkgIT0gbnVsbCA/IGF0dHJzW2tleV0gOiBhdHRyc1xuXHR9XG5cdHJvdXRlLnBhcmFtcyA9IGF0dHJzXG5cblx0Ly8gU2VydmVyLXNpZGUgcm91dGUgcmVzb2x1dGlvbiAoaXNvbW9ycGhpYylcblx0cm91dGUucmVzb2x2ZSA9IGFzeW5jIGZ1bmN0aW9uKFxuXHRcdHBhdGhuYW1lOiBzdHJpbmcsXG5cdFx0cm91dGVzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnRUeXBlIHwgUm91dGVSZXNvbHZlciB8IHtjb21wb25lbnQ6IENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyfT4sXG5cdFx0cmVuZGVyVG9TdHJpbmc6ICh2bm9kZXM6IGFueSkgPT4gUHJvbWlzZTxTU1JSZXN1bHQ+LFxuXHRcdHByZWZpeDogc3RyaW5nID0gJycsXG5cdFx0cmVkaXJlY3REZXB0aDogbnVtYmVyID0gMCxcblx0KTogUHJvbWlzZTxTU1JSZXN1bHQ+IHtcblx0XHQvLyBQcmV2ZW50IGluZmluaXRlIHJlZGlyZWN0IGxvb3BzXG5cdFx0Y29uc3QgTUFYX1JFRElSRUNUX0RFUFRIID0gNVxuXHRcdGlmIChyZWRpcmVjdERlcHRoID4gTUFYX1JFRElSRUNUX0RFUFRIKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE1heGltdW0gcmVkaXJlY3QgZGVwdGggKCR7TUFYX1JFRElSRUNUX0RFUFRIfSkgZXhjZWVkZWQuIFBvc3NpYmxlIHJlZGlyZWN0IGxvb3AuYClcblx0XHR9XG5cdFx0Ly8gU2F2ZSBjdXJyZW50IHByZWZpeCBhbmQgc2V0IHRvIHByb3ZpZGVkIHByZWZpeCBmb3IgU1NSXG5cdFx0Ly8gVGhpcyBlbnN1cmVzIExpbmsgY29tcG9uZW50cyB1c2UgdGhlIGNvcnJlY3QgcHJlZml4IGR1cmluZyBzZXJ2ZXItc2lkZSByZW5kZXJpbmdcblx0XHRjb25zdCBzYXZlZFByZWZpeCA9IHJvdXRlLnByZWZpeFxuXHRcdHJvdXRlLnByZWZpeCA9IHByZWZpeFxuXHRcdC8vIFNhdmUgY3VycmVudCBwYXRoIHRvIHJlc3RvcmUgYWZ0ZXIgU1NSXG5cdFx0Y29uc3Qgc2F2ZWRDdXJyZW50UGF0aCA9IGN1cnJlbnRQYXRoXG5cdFx0XG5cdFx0Ly8gU2V0IGN1cnJlbnRQYXRoIGltbWVkaWF0ZWx5IHNvIG0ucm91dGUuZ2V0KCkgd29ya3MgZHVyaW5nIFNTUlxuXHRcdC8vIFVzZSBwYXRobmFtZSAoZnVsbCBwYXRoKSAtIHRoaXMgaXMgd2hhdCBtLnJvdXRlLmdldCgpIHNob3VsZCByZXR1cm5cblx0XHRjdXJyZW50UGF0aCA9IHBhdGhuYW1lIHx8ICcvJ1xuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBDb21waWxlIHJvdXRlcyAoc2FtZSBsb2dpYyBhcyBpbiByb3V0ZSgpIGZ1bmN0aW9uKVxuXHRcdFx0Y29uc3QgY29tcGlsZWQgPSBPYmplY3Qua2V5cyhyb3V0ZXMpLm1hcChmdW5jdGlvbihyb3V0ZVBhdGgpIHtcblx0XHRcdFx0aWYgKHJvdXRlUGF0aFswXSAhPT0gJy8nKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1JvdXRlcyBtdXN0IHN0YXJ0IHdpdGggYSBcXCcvXFwnLicpXG5cdFx0XHRcdGlmICgoLzooW15cXC9cXC4tXSspKFxcLnszfSk/Oi8pLnRlc3Qocm91dGVQYXRoKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBTeW50YXhFcnJvcignUm91dGUgcGFyYW1ldGVyIG5hbWVzIG11c3QgYmUgc2VwYXJhdGVkIHdpdGggZWl0aGVyIFxcJy9cXCcsIFxcJy5cXCcsIG9yIFxcJy1cXCcuJylcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBIYW5kbGUgYm90aCBmb3JtYXRzOiBkaXJlY3QgY29tcG9uZW50L3Jlc29sdmVyIG9yIHtjb21wb25lbnQ6IC4uLn1cblx0XHRcdFx0Y29uc3Qgcm91dGVWYWx1ZSA9IHJvdXRlc1tyb3V0ZVBhdGhdXG5cdFx0XHRcdGNvbnN0IGNvbXBvbmVudCA9IChyb3V0ZVZhbHVlICYmIHR5cGVvZiByb3V0ZVZhbHVlID09PSAnb2JqZWN0JyAmJiAnY29tcG9uZW50JyBpbiByb3V0ZVZhbHVlKVxuXHRcdFx0XHRcdD8gKHJvdXRlVmFsdWUgYXMge2NvbXBvbmVudDogQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXJ9KS5jb21wb25lbnRcblx0XHRcdFx0XHQ6IHJvdXRlVmFsdWUgYXMgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXJcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRyb3V0ZTogcm91dGVQYXRoLFxuXHRcdFx0XHRcdGNvbXBvbmVudDogY29tcG9uZW50LFxuXHRcdFx0XHRcdGNoZWNrOiBjb21waWxlVGVtcGxhdGUocm91dGVQYXRoKSxcblx0XHRcdFx0fVxuXHRcdFx0fSlcblxuXHRcdFx0Ly8gUGFyc2UgcGF0aG5hbWVcblx0XHRcdGNvbnN0IHBhdGggPSBkZWNvZGVVUklDb21wb25lbnRTYWZlKHBhdGhuYW1lIHx8ICcvJykuc2xpY2UocHJlZml4Lmxlbmd0aClcblx0XHRcdGNvbnN0IGRhdGEgPSBwYXJzZVBhdGhuYW1lKHBhdGgpXG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZSBhdHRycyBmb3IgU1NSIHNvIG0ucm91dGUucGFyYW0oKSB3b3JrcyBkdXJpbmcgc2VydmVyLXNpZGUgcmVuZGVyaW5nXG5cdFx0XHRhdHRycyA9IGRhdGEucGFyYW1zXG5cblx0XHRcdC8vIEZpbmQgbWF0Y2hpbmcgcm91dGVcblx0XHRcdGZvciAoY29uc3Qge3JvdXRlOiBtYXRjaGVkUm91dGUsIGNvbXBvbmVudCwgY2hlY2t9IG9mIGNvbXBpbGVkKSB7XG5cdFx0XHRcdGlmIChjaGVjayhkYXRhKSkge1xuXHRcdFx0XHRcdGxldCBwYXlsb2FkID0gY29tcG9uZW50XG5cblx0XHRcdFx0XHQvLyBIYW5kbGUgUm91dGVSZXNvbHZlclxuXHRcdFx0XHRcdGlmIChwYXlsb2FkICYmIHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JyAmJiAoJ29ubWF0Y2gnIGluIHBheWxvYWQgfHwgJ3JlbmRlcicgaW4gcGF5bG9hZCkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc29sdmVyID0gcGF5bG9hZCBhcyBSb3V0ZVJlc29sdmVyXG5cdFx0XHRcdFx0XHRpZiAocmVzb2x2ZXIub25tYXRjaCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSByZXNvbHZlci5vbm1hdGNoKGRhdGEucGFyYW1zLCBwYXRobmFtZSwgbWF0Y2hlZFJvdXRlKVxuXHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0XHRcdFx0XHRcdHBheWxvYWQgPSBhd2FpdCByZXN1bHRcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdHBheWxvYWQgPSByZXN1bHRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyBOb3RlOiBJZiBvbm1hdGNoIHJldHVybnMgdW5kZWZpbmVkLCBwYXlsb2FkIHJlbWFpbnMgYXMgdGhlIFJvdXRlUmVzb2x2ZXJcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgZm9yIHJlZGlyZWN0IEJFRk9SRSBwcm9jZXNzaW5nIGFzIGNvbXBvbmVudFxuXHRcdFx0XHRcdFx0Ly8gVGhpcyBwcmV2ZW50cyByZWRpcmVjdCBvYmplY3RzIGZyb20gYmVpbmcgdHJlYXRlZCBhcyBjb21wb25lbnRzXG5cdFx0XHRcdFx0XHRpZiAoaXNSZWRpcmVjdChwYXlsb2FkKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBFeHRyYWN0IHJlZGlyZWN0IHRhcmdldCBwYXRoIChoYW5kbGVzIGRpZmZlcmVudCBSRURJUkVDVCBzeW1ib2xzKVxuXHRcdFx0XHRcdFx0XHRjb25zdCByZWRpcmVjdFBhdGggPSBnZXRSZWRpcmVjdFBhdGgocGF5bG9hZClcblx0XHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oYFJlZGlyZWN0aW5nIHRvICR7cmVkaXJlY3RQYXRofWAsIHtcblx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdHJlZGlyZWN0UGF0aCxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0Ly8gVXBkYXRlIF9fU1NSX1VSTF9fIHRvIHJlZmxlY3QgcmVkaXJlY3QgdGFyZ2V0IGZvciBwcm9wZXIgVVJMIGNvbnRleHRcblx0XHRcdFx0XHRcdFx0Ly8gVGhpcyBlbnN1cmVzIGdldEN1cnJlbnRVcmwoKSBhbmQgb3RoZXIgVVJMLWRlcGVuZGVudCBjb2RlIHdvcmsgY29ycmVjdGx5XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsU1NSVXJsID0gZ2xvYmFsVGhpcy5fX1NTUl9VUkxfX1xuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIENvbnN0cnVjdCBmdWxsIFVSTCBmb3IgcmVkaXJlY3QgdGFyZ2V0IGlmIHdlIGhhdmUgb3JpZ2luYWwgVVJMIGNvbnRleHRcblx0XHRcdFx0XHRcdFx0XHRpZiAob3JpZ2luYWxTU1JVcmwgJiYgdHlwZW9mIG9yaWdpbmFsU1NSVXJsID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxVcmwgPSBuZXcgVVJMKG9yaWdpbmFsU1NSVXJsKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBCdWlsZCByZWRpcmVjdCB0YXJnZXQgVVJMIHVzaW5nIHNhbWUgb3JpZ2luXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlZGlyZWN0VXJsID0gbmV3IFVSTChyZWRpcmVjdFBhdGgsIG9yaWdpbmFsVXJsLm9yaWdpbilcblx0XHRcdFx0XHRcdFx0XHRcdFx0Z2xvYmFsVGhpcy5fX1NTUl9VUkxfXyA9IHJlZGlyZWN0VXJsLmhyZWZcblx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBJZiBVUkwgY29uc3RydWN0aW9uIGZhaWxzLCBqdXN0IHVzZSByZWRpcmVjdCBwYXRoIGFzLWlzXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdsb2JhbFRoaXMuX19TU1JfVVJMX18gPSByZWRpcmVjdFBhdGhcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Z2xvYmFsVGhpcy5fX1NTUl9VUkxfXyA9IHJlZGlyZWN0UGF0aFxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQvLyBSZWN1cnNpdmVseSByZXNvbHZlIHJlZGlyZWN0IHRhcmdldCByb3V0ZVxuXHRcdFx0XHRcdFx0XHRcdC8vIFRoaXMgd2lsbCByZXR1cm4gU1NSUmVzdWx0IChzdHJpbmcgb3Ige2h0bWwsIHN0YXRlfSlcblx0XHRcdFx0XHRcdFx0XHRjb25zdCByZWRpcmVjdFJlc3VsdCA9IGF3YWl0IHJvdXRlLnJlc29sdmUocmVkaXJlY3RQYXRoLCByb3V0ZXMsIHJlbmRlclRvU3RyaW5nLCBwcmVmaXgsIHJlZGlyZWN0RGVwdGggKyAxKVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlZGlyZWN0SHRtbCA9IHR5cGVvZiByZWRpcmVjdFJlc3VsdCA9PT0gJ3N0cmluZycgPyByZWRpcmVjdFJlc3VsdCA6IHJlZGlyZWN0UmVzdWx0Lmh0bWxcblx0XHRcdFx0XHRcdFx0XHRpZiAoIXJlZGlyZWN0SHRtbCB8fCByZWRpcmVjdEh0bWwubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIud2FybignRW1wdHkgcmVkaXJlY3QgcmVzdWx0Jywge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVkaXJlY3RQYXRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKCdSZWRpcmVjdCByZXNvbHZlZCcsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlZGlyZWN0UGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0aHRtbFNpemU6IHJlZGlyZWN0SHRtbC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVkaXJlY3RSZXN1bHRcblx0XHRcdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdFx0XHQvLyBSZXN0b3JlIG9yaWdpbmFsIFNTUiBVUkwgYWZ0ZXIgcmVkaXJlY3QgcmVzb2x1dGlvblxuXHRcdFx0XHRcdFx0XHRcdGdsb2JhbFRoaXMuX19TU1JfVVJMX18gPSBvcmlnaW5hbFNTUlVybFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIElmIHJlc29sdmVyIGhhcyByZW5kZXIsIHVzZSBpdFxuXHRcdFx0XHRcdFx0aWYgKHJlc29sdmVyLnJlbmRlcikge1xuXHRcdFx0XHRcdFx0XHQvLyBPbmx5IHJlbmRlciBpZiBwYXlsb2FkIGlzIGEgdmFsaWQgY29tcG9uZW50IChvbm1hdGNoIHJldHVybmVkIGEgY29tcG9uZW50KVxuXHRcdFx0XHRcdFx0XHQvLyBJZiBvbm1hdGNoIHJldHVybmVkIHVuZGVmaW5lZCwgcGF5bG9hZCBpcyBzdGlsbCB0aGUgUm91dGVSZXNvbHZlciwgd2hpY2ggaXMgbm90IGEgY29tcG9uZW50XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGlzQ29tcG9uZW50VHlwZSA9IHBheWxvYWQgIT0gbnVsbCAmJiBwYXlsb2FkICE9PSByZXNvbHZlciAmJiAoXG5cdFx0XHRcdFx0XHRcdFx0dHlwZW9mIHBheWxvYWQgPT09ICdmdW5jdGlvbicgfHxcblx0XHRcdFx0XHRcdFx0XHQodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnICYmICd2aWV3JyBpbiBwYXlsb2FkICYmIHR5cGVvZiAocGF5bG9hZCBhcyBhbnkpLnZpZXcgPT09ICdmdW5jdGlvbicpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdGlmIChpc0NvbXBvbmVudFR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ3JlYXRlIGNvbXBvbmVudCB2bm9kZSB1c2luZyBoeXBlcnNjcmlwdFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcG9uZW50Vm5vZGUgPSBoeXBlcnNjcmlwdChwYXlsb2FkIGFzIENvbXBvbmVudFR5cGUsIGRhdGEucGFyYW1zKVxuXHRcdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDYWxsIHJlc29sdmVyLnJlbmRlciB0byBnZXQgdGhlIGxheW91dC13cmFwcGVkIHZub2RlXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyByZXNvbHZlci5yZW5kZXIgZG9lczogbShsYXlvdXQsIG51bGwsIGNvbXBvbmVudFZub2RlKVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVuZGVyZWRWbm9kZSA9IHJlc29sdmVyLnJlbmRlcihjb21wb25lbnRWbm9kZSlcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlbmRlclRvU3RyaW5nKHJlbmRlcmVkVm5vZGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBodG1sID0gdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgPyByZXN1bHQgOiByZXN1bHQuaHRtbFxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGh0bWwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oYFJlbmRlcmVkIHJvdXRlIGNvbXBvbmVudGAsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGh0bWxTaXplOiBodG1sLmxlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIuZXJyb3IoJ1JvdXRlIHJlbmRlciBmYWlsZWQnLCBlcnJvciwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cm91dGU6IG1hdGNoZWRSb3V0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBlcnJvclxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0Ly8gSWYgcmVzb2x2ZXIgaGFzIHJlbmRlciBidXQgbm8gb25tYXRjaCAob3Igb25tYXRjaCByZXR1cm5lZCB1bmRlZmluZWQpLFxuXHRcdFx0XHRcdFx0XHQvLyBjYWxsIHJlbmRlciB3aXRoIGEgdm5vZGUgdGhhdCBoYXMgdGhlIHJlc29sdmVyIGl0c2VsZiBhcyB0aGUgdGFnXG5cdFx0XHRcdFx0XHRcdC8vIFRoaXMgYWxsb3dzIHJlbmRlci1vbmx5IHJlc29sdmVycyB0byB3b3JrXG5cdFx0XHRcdFx0XHRcdGlmICghcmVzb2x2ZXIub25tYXRjaCB8fCBwYXlsb2FkID09PSByZXNvbHZlcikge1xuXHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsb2dnZXIuZGVidWcoJ0NhbGxpbmcgcmVuZGVyLW9ubHkgcmVzb2x2ZXInLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZTogbWF0Y2hlZFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENyZWF0ZSBhIHZub2RlIHdpdGggdGhlIHJlc29sdmVyIGFzIHRhZyBhbmQgcm91dGVQYXRoIGluIGF0dHJzXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCByZXNvbHZlclZub2RlID0gaHlwZXJzY3JpcHQocmVzb2x2ZXIgYXMgYW55LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC4uLmRhdGEucGFyYW1zLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyb3V0ZVBhdGg6IHBhdGhuYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlbmRlcmVkVm5vZGUgPSByZXNvbHZlci5yZW5kZXIocmVzb2x2ZXJWbm9kZSlcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlbmRlclRvU3RyaW5nKHJlbmRlcmVkVm5vZGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBodG1sID0gdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgPyByZXN1bHQgOiByZXN1bHQuaHRtbFxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGh0bWwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oYFJlbmRlcmVkIHJvdXRlIHdpdGggcmVuZGVyLW9ubHkgcmVzb2x2ZXJgLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cm91dGU6IG1hdGNoZWRSb3V0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRodG1sU2l6ZTogaHRtbC5sZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLmVycm9yKCdSb3V0ZSByZW5kZXItb25seSByZXNvbHZlciBmYWlsZWQnLCBlcnJvciwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXRobmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cm91dGU6IG1hdGNoZWRSb3V0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBlcnJvclxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvLyBJZiBwYXlsb2FkIGlzIG5vdCBhIHZhbGlkIGNvbXBvbmVudCwgc2tpcCByZW5kZXJpbmdcblx0XHRcdFx0XHRcdFx0Ly8gVGhpcyBoYXBwZW5zIHdoZW4gb25tYXRjaCByZXR1cm5zIHVuZGVmaW5lZCAtIHJlbmRlciBuZWVkcyBhIGNvbXBvbmVudCB0byB3b3JrIHdpdGhcblx0XHRcdFx0XHRcdFx0Ly8gSW4gdGhpcyBjYXNlLCB3ZSBzaG91bGQgZmFsbCB0aHJvdWdoIHRvIHRoZSBjb21wb25lbnQgcmVuZGVyaW5nIGxvZ2ljIGJlbG93XG5cdFx0XHRcdFx0XHRcdC8vIHdoaWNoIHdpbGwgaGFuZGxlIHRoZSBSb3V0ZVJlc29sdmVyIGFzIGEgY29tcG9uZW50IGlmIGl0IGhhcyBhIHZpZXcgbWV0aG9kXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gUmVuZGVyIGNvbXBvbmVudFxuXHRcdFx0XHRcdC8vIENoZWNrIGlmIHBheWxvYWQgaXMgYSBDb21wb25lbnRUeXBlIChub3QgYSBSb3V0ZVJlc29sdmVyKVxuXHRcdFx0XHRcdGNvbnN0IGlzQ29tcG9uZW50VHlwZSA9IHBheWxvYWQgIT0gbnVsbCAmJiAoXG5cdFx0XHRcdFx0XHR0eXBlb2YgcGF5bG9hZCA9PT0gJ2Z1bmN0aW9uJyB8fFxuXHRcdFx0XHRcdFx0KHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JyAmJiAndmlldycgaW4gcGF5bG9hZCAmJiB0eXBlb2YgKHBheWxvYWQgYXMgYW55KS52aWV3ID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHRpZiAoaXNDb21wb25lbnRUeXBlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB2bm9kZSA9IGh5cGVyc2NyaXB0KHBheWxvYWQgYXMgQ29tcG9uZW50VHlwZSwgZGF0YS5wYXJhbXMpXG5cdFx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCByZW5kZXJUb1N0cmluZyh2bm9kZSlcblx0XHRcdFx0XHRcdC8vIEhhbmRsZSBib3RoIHN0cmluZyAoYmFja3dhcmQgY29tcGF0aWJpbGl0eSkgYW5kIHtodG1sLCBzdGF0ZX0gcmV0dXJuIHR5cGVzXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycgPyByZXN1bHQgOiByZXN1bHRcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBGYWxsYmFjayB0byBkaXZcblx0XHRcdFx0XHRjb25zdCB2bm9kZSA9IGh5cGVyc2NyaXB0KCdkaXYnLCBkYXRhLnBhcmFtcylcblx0XHRcdFx0XHRyZXR1cm4gYXdhaXQgcmVuZGVyVG9TdHJpbmcodm5vZGUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gTm8gcm91dGUgZm91bmRcblx0XHRcdHRocm93IG5ldyBFcnJvcihgTm8gcm91dGUgZm91bmQgZm9yICR7cGF0aG5hbWV9YClcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Ly8gUmVzdG9yZSBvcmlnaW5hbCBwcmVmaXggYW5kIGN1cnJlbnRQYXRoXG5cdFx0XHRyb3V0ZS5wcmVmaXggPSBzYXZlZFByZWZpeFxuXHRcdFx0Y3VycmVudFBhdGggPSBzYXZlZEN1cnJlbnRQYXRoXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJvdXRlIGFzIHVua25vd24gYXMgUm91dGUgJiAoKHJvb3Q6IEVsZW1lbnQsIGRlZmF1bHRSb3V0ZTogc3RyaW5nLCByb3V0ZXM6IFJlY29yZDxzdHJpbmcsIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyPikgPT4gdm9pZCkgJiB7cmVkaXJlY3Q6IChwYXRoOiBzdHJpbmcpID0+IFJlZGlyZWN0T2JqZWN0fVxufVxuIiwKICAgICIvLyBTU1IgYW5kIGh5ZHJhdGlvbiB1dGlsaXRpZXNcblxuaW1wb3J0IHtsb2dnZXJ9IGZyb20gJy4uL3NlcnZlci9sb2dnZXInXG5cbi8vIERldmVsb3BtZW50LW9ubHkgaHlkcmF0aW9uIGRlYnVnZ2luZ1xuZXhwb3J0IGNvbnN0IEhZRFJBVElPTl9ERUJVRyA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudj8uTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJ1xuXG4vLyBUaHJvdHRsZSBoeWRyYXRpb24gZXJyb3IgbG9nZ2luZyB0byBhdm9pZCBwZXJmb3JtYW5jZSBpc3N1ZXNcbmxldCBoeWRyYXRpb25FcnJvckNvdW50ID0gMFxuY29uc3QgTUFYX0hZRFJBVElPTl9FUlJPUlMgPSAxMCAvLyBMaW1pdCBudW1iZXIgb2YgZXJyb3JzIGxvZ2dlZCBwZXIgcmVuZGVyIGN5Y2xlXG5cbi8vIFJlc2V0IGVycm9yIGNvdW50IGF0IHRoZSBzdGFydCBvZiBlYWNoIHJlbmRlciBjeWNsZVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0SHlkcmF0aW9uRXJyb3JDb3VudCgpOiB2b2lkIHtcblx0aHlkcmF0aW9uRXJyb3JDb3VudCA9IDBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudE5hbWUodm5vZGU6IGFueSk6IHN0cmluZyB7XG5cdGlmICghdm5vZGUpIHJldHVybiAnVW5rbm93bidcblx0aWYgKHR5cGVvZiB2bm9kZS50YWcgPT09ICdzdHJpbmcnKSByZXR1cm4gdm5vZGUudGFnXG5cdGlmICh2bm9kZS50YWc/Lm5hbWUpIHJldHVybiB2bm9kZS50YWcubmFtZVxuXHRpZiAodm5vZGUudGFnPy5kaXNwbGF5TmFtZSkgcmV0dXJuIHZub2RlLnRhZy5kaXNwbGF5TmFtZVxuXHRpZiAodm5vZGUuc3RhdGU/LmNvbnN0cnVjdG9yPy5uYW1lKSByZXR1cm4gdm5vZGUuc3RhdGUuY29uc3RydWN0b3IubmFtZVxuXHRyZXR1cm4gJ1Vua25vd24nXG59XG5cbi8vIEZvcm1hdCBhIERPTSBlbGVtZW50IGFzIGFuIG9wZW5pbmcgdGFnIHN0cmluZ1xuZnVuY3Rpb24gZm9ybWF0RE9NRWxlbWVudChlbDogRWxlbWVudCk6IHt0YWdOYW1lOiBzdHJpbmc7IG9wZW5UYWc6IHN0cmluZzsgY2xvc2VUYWc6IHN0cmluZ30ge1xuXHRjb25zdCB0YWdOYW1lID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpXG5cdGxldCBvcGVuVGFnID0gYDwke3RhZ05hbWV9YFxuXG5cdC8vIEFkZCBpbXBvcnRhbnQgYXR0cmlidXRlc1xuXHRpZiAoZWwuaWQpIHtcblx0XHRvcGVuVGFnICs9IGAgaWQ9XCIke2VsLmlkfVwiYFxuXHR9XG5cdGlmIChlbC5jbGFzc05hbWUgJiYgdHlwZW9mIGVsLmNsYXNzTmFtZSA9PT0gJ3N0cmluZycpIHtcblx0XHRjb25zdCBjbGFzc2VzID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJykuZmlsdGVyKGMgPT4gYykuc2xpY2UoMCwgMykuam9pbignICcpXG5cdFx0aWYgKGNsYXNzZXMpIHtcblx0XHRcdG9wZW5UYWcgKz0gYCBjbGFzc05hbWU9XCIke2NsYXNzZXN9JHtlbC5jbGFzc05hbWUuc3BsaXQoJyAnKS5sZW5ndGggPiAzID8gJy4uLicgOiAnJ31cImBcblx0XHR9XG5cdH1cblxuXHRvcGVuVGFnICs9ICc+J1xuXHRyZXR1cm4ge3RhZ05hbWUsIG9wZW5UYWcsIGNsb3NlVGFnOiBgPC8ke3RhZ05hbWV9PmB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRWRE9NVHJlZSh2bm9kZTogYW55LCBtYXhEZXB0aDogbnVtYmVyID0gNiwgY3VycmVudERlcHRoOiBudW1iZXIgPSAwLCBzaG93Q29tcG9uZW50SW5zdGFuY2U6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0aWYgKCF2bm9kZSB8fCBjdXJyZW50RGVwdGggPj0gbWF4RGVwdGgpIHJldHVybiAnJ1xuXG5cdGNvbnN0IGluZGVudCA9ICcgICcucmVwZWF0KGN1cnJlbnREZXB0aClcblxuXHQvLyBIYW5kbGUgdGV4dCBub2Rlc1xuXHRpZiAodm5vZGUudGFnID09PSAnIycpIHtcblx0XHRjb25zdCB0ZXh0ID0gU3RyaW5nKHZub2RlLmNoaWxkcmVuIHx8IHZub2RlLnRleHQgfHwgJycpLnN1YnN0cmluZygwLCA1MClcblx0XHRyZXR1cm4gYCR7aW5kZW50fVwiJHt0ZXh0fSR7U3RyaW5nKHZub2RlLmNoaWxkcmVuIHx8IHZub2RlLnRleHQgfHwgJycpLmxlbmd0aCA+IDUwID8gJy4uLicgOiAnJ31cImBcblx0fVxuXG5cdC8vIEhhbmRsZSBmcmFnbWVudHNcblx0aWYgKHZub2RlLnRhZyA9PT0gJ1snKSB7XG5cdFx0aWYgKCF2bm9kZS5jaGlsZHJlbiB8fCAhQXJyYXkuaXNBcnJheSh2bm9kZS5jaGlsZHJlbikgfHwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gYCR7aW5kZW50fVtmcmFnbWVudF1gXG5cdFx0fVxuXHRcdGNvbnN0IHZhbGlkQ2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbi5maWx0ZXIoKGM6IGFueSkgPT4gYyAhPSBudWxsKS5zbGljZSgwLCA4KVxuXHRcdGxldCByZXN1bHQgPSBgJHtpbmRlbnR9W2ZyYWdtZW50XVxcbmBcblx0XHRmb3IgKGNvbnN0IGNoaWxkIG9mIHZhbGlkQ2hpbGRyZW4pIHtcblx0XHRcdHJlc3VsdCArPSBmb3JtYXRWRE9NVHJlZShjaGlsZCwgbWF4RGVwdGgsIGN1cnJlbnREZXB0aCArIDEsIHNob3dDb21wb25lbnRJbnN0YW5jZSkgKyAnXFxuJ1xuXHRcdH1cblx0XHRpZiAodm5vZGUuY2hpbGRyZW4uZmlsdGVyKChjOiBhbnkpID0+IGMgIT0gbnVsbCkubGVuZ3RoID4gOCkge1xuXHRcdFx0cmVzdWx0ICs9IGAke2luZGVudH0gIC4uLiAoJHt2bm9kZS5jaGlsZHJlbi5maWx0ZXIoKGM6IGFueSkgPT4gYyAhPSBudWxsKS5sZW5ndGggLSA4fSBtb3JlKVxcbmBcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdC50cmltRW5kKClcblx0fVxuXG5cdGNvbnN0IGlzQ29tcG9uZW50ID0gdHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZydcblx0Y29uc3QgdGFnTmFtZSA9IGlzQ29tcG9uZW50ID8gZ2V0Q29tcG9uZW50TmFtZSh2bm9kZSkgOiB2bm9kZS50YWdcblxuXHRsZXQgcmVzdWx0ID0gYCR7aW5kZW50fTwke3RhZ05hbWV9YFxuXG5cdC8vIEFkZCBrZXkgaWYgcHJlc2VudFxuXHRpZiAodm5vZGUuYXR0cnM/LmtleSkge1xuXHRcdHJlc3VsdCArPSBgIGtleT1cIiR7dm5vZGUuYXR0cnMua2V5fVwiYFxuXHR9XG5cblx0Ly8gQWRkIGEgZmV3IGltcG9ydGFudCBhdHRyaWJ1dGVzIGZvciBkZWJ1Z2dpbmdcblx0aWYgKHZub2RlLmF0dHJzKSB7XG5cdFx0Y29uc3QgaW1wb3J0YW50QXR0cnMgPSBbJ2lkJywgJ2NsYXNzJywgJ2NsYXNzTmFtZSddXG5cdFx0Zm9yIChjb25zdCBhdHRyIG9mIGltcG9ydGFudEF0dHJzKSB7XG5cdFx0XHRpZiAodm5vZGUuYXR0cnNbYXR0cl0pIHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2Ygdm5vZGUuYXR0cnNbYXR0cl0gPT09ICdzdHJpbmcnXG5cdFx0XHRcdFx0PyB2bm9kZS5hdHRyc1thdHRyXVxuXHRcdFx0XHRcdDogU3RyaW5nKHZub2RlLmF0dHJzW2F0dHJdKVxuXHRcdFx0XHRyZXN1bHQgKz0gYCAke2F0dHJ9PVwiJHt2YWx1ZS5zdWJzdHJpbmcoMCwgMzApfSR7dmFsdWUubGVuZ3RoID4gMzAgPyAnLi4uJyA6ICcnfVwiYFxuXHRcdFx0XHRicmVhayAvLyBPbmx5IHNob3cgZmlyc3QgaW1wb3J0YW50IGF0dHIgdG8ga2VlcCBpdCBjb25jaXNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmVzdWx0ICs9ICc+J1xuXG5cdC8vIEZvciBjb21wb25lbnRzLCBzaG93IHRoZWlyIHJlbmRlcmVkIGluc3RhbmNlICh3aGF0IHRoZSBjb21wb25lbnQgYWN0dWFsbHkgcmVuZGVycylcblx0Ly8gVGhpcyBnaXZlcyB1cyBwYXJlbnQgY29udGV4dCB3aXRob3V0IHBlcmZvcm1hbmNlIGNvc3Rcblx0aWYgKGlzQ29tcG9uZW50ICYmIHNob3dDb21wb25lbnRJbnN0YW5jZSAmJiB2bm9kZS5pbnN0YW5jZSAmJiBjdXJyZW50RGVwdGggPCBtYXhEZXB0aCAtIDEpIHtcblx0XHRjb25zdCBpbnN0YW5jZVRyZWUgPSBmb3JtYXRWRE9NVHJlZSh2bm9kZS5pbnN0YW5jZSwgbWF4RGVwdGgsIGN1cnJlbnREZXB0aCArIDEsIHNob3dDb21wb25lbnRJbnN0YW5jZSlcblx0XHRpZiAoaW5zdGFuY2VUcmVlKSB7XG5cdFx0XHRyZXN1bHQgKz0gJ1xcbicgKyBpbnN0YW5jZVRyZWVcblx0XHR9XG5cdH1cblxuXHQvLyBBZGQgY2hpbGRyZW5cblx0aWYgKHZub2RlLmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkodm5vZGUuY2hpbGRyZW4pICYmIGN1cnJlbnREZXB0aCA8IG1heERlcHRoIC0gMSkge1xuXHRcdGNvbnN0IHZhbGlkQ2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbi5maWx0ZXIoKGM6IGFueSkgPT4gYyAhPSBudWxsKS5zbGljZSgwLCAxMClcblx0XHRpZiAodmFsaWRDaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXN1bHQgKz0gJ1xcbidcblx0XHRcdGZvciAoY29uc3QgY2hpbGQgb2YgdmFsaWRDaGlsZHJlbikge1xuXHRcdFx0XHRpZiAodHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgY2hpbGQgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGV4dCA9IFN0cmluZyhjaGlsZCkuc3Vic3RyaW5nKDAsIDUwKVxuXHRcdFx0XHRcdHJlc3VsdCArPSBgJHtpbmRlbnR9ICBcIiR7dGV4dH0ke1N0cmluZyhjaGlsZCkubGVuZ3RoID4gNTAgPyAnLi4uJyA6ICcnfVwiXFxuYFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGNoaWxkVHJlZSA9IGZvcm1hdFZET01UcmVlKGNoaWxkLCBtYXhEZXB0aCwgY3VycmVudERlcHRoICsgMSwgc2hvd0NvbXBvbmVudEluc3RhbmNlKVxuXHRcdFx0XHRcdGlmIChjaGlsZFRyZWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSBjaGlsZFRyZWUgKyAnXFxuJ1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHZub2RlLmNoaWxkcmVuLmZpbHRlcigoYzogYW55KSA9PiBjICE9IG51bGwpLmxlbmd0aCA+IDEwKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBgJHtpbmRlbnR9ICAuLi4gKCR7dm5vZGUuY2hpbGRyZW4uZmlsdGVyKChjOiBhbnkpID0+IGMgIT0gbnVsbCkubGVuZ3RoIC0gMTB9IG1vcmUgY2hpbGRyZW4pXFxuYFxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmICh2bm9kZS50ZXh0ICE9IG51bGwpIHtcblx0XHRjb25zdCB0ZXh0ID0gU3RyaW5nKHZub2RlLnRleHQpLnN1YnN0cmluZygwLCA1MClcblx0XHRyZXN1bHQgKz0gYCBcIiR7dGV4dH0ke1N0cmluZyh2bm9kZS50ZXh0KS5sZW5ndGggPiA1MCA/ICcuLi4nIDogJyd9XCJgXG5cdH1cblxuXHRyZXN1bHQgKz0gYCR7aW5kZW50fTwvJHt0YWdOYW1lfT5gXG5cblx0cmV0dXJuIHJlc3VsdFxufVxuXG4vLyBDb21iaW5lIERPTSBwYXJlbnQgY2hhaW4gd2l0aCBWRE9NIHN0cnVjdHVyZSBpbnRvIGEgc2luZ2xlIEhUTUwtbGlrZSB0cmVlXG5mdW5jdGlvbiBmb3JtYXRDb21iaW5lZFN0cnVjdHVyZShwYXJlbnQ6IEVsZW1lbnQgfCBOb2RlIHwgbnVsbCwgdm5vZGU6IGFueSwgbWF4UGFyZW50czogbnVtYmVyID0gNCk6IHN0cmluZyB7XG5cdGlmICghcGFyZW50ICYmICF2bm9kZSkgcmV0dXJuICcnXG5cblx0Ly8gQ29sbGVjdCBET00gcGFyZW50cyAoZnJvbSBvdXRlcm1vc3QgdG8gaW5uZXJtb3N0KVxuXHRjb25zdCBkb21FbGVtZW50czoge29wZW5UYWc6IHN0cmluZzsgY2xvc2VUYWc6IHN0cmluZ31bXSA9IFtdXG5cdGxldCBjdXJyZW50OiBOb2RlIHwgbnVsbCA9IHBhcmVudFxuXHRsZXQgZGVwdGggPSAwXG5cblx0d2hpbGUgKGN1cnJlbnQgJiYgZGVwdGggPCBtYXhQYXJlbnRzKSB7XG5cdFx0aWYgKGN1cnJlbnQubm9kZVR5cGUgPT09IDEpIHsgLy8gRWxlbWVudCBub2RlXG5cdFx0XHRjb25zdCBlbCA9IGN1cnJlbnQgYXMgRWxlbWVudFxuXHRcdFx0Ly8gU2tpcCBodG1sIGFuZCBib2R5IHRhZ3MgLSB0aGV5J3JlIG5vdCB1c2VmdWwgY29udGV4dFxuXHRcdFx0aWYgKGVsLnRhZ05hbWUgIT09ICdIVE1MJyAmJiBlbC50YWdOYW1lICE9PSAnQk9EWScpIHtcblx0XHRcdFx0ZG9tRWxlbWVudHMudW5zaGlmdChmb3JtYXRET01FbGVtZW50KGVsKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0Y3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudCB8fCBjdXJyZW50LnBhcmVudE5vZGVcblx0XHRkZXB0aCsrXG5cdH1cblxuXHQvLyBCdWlsZCB0aGUgY29tYmluZWQgb3V0cHV0XG5cdGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdXG5cblx0Ly8gT3BlbmluZyB0YWdzIGZvciBET00gcGFyZW50c1xuXHRkb21FbGVtZW50cy5mb3JFYWNoKChlbCwgaSkgPT4ge1xuXHRcdGxpbmVzLnB1c2goJyAgJy5yZXBlYXQoaSkgKyBlbC5vcGVuVGFnKVxuXHR9KVxuXG5cdC8vIFZET00gc3RydWN0dXJlIChpbmRlbnRlZCBpbnNpZGUgdGhlIERPTSBwYXJlbnRzKVxuXHRpZiAodm5vZGUpIHtcblx0XHRjb25zdCB2ZG9tSW5kZW50ID0gZG9tRWxlbWVudHMubGVuZ3RoXG5cdFx0Y29uc3QgdmRvbVRyZWUgPSBmb3JtYXRWRE9NVHJlZSh2bm9kZSwgNCwgMCwgdHJ1ZSlcblx0XHRpZiAodmRvbVRyZWUpIHtcblx0XHRcdC8vIEluZGVudCBlYWNoIGxpbmUgb2YgdGhlIFZET00gdHJlZVxuXHRcdFx0Y29uc3QgdmRvbUxpbmVzID0gdmRvbVRyZWUuc3BsaXQoJ1xcbicpXG5cdFx0XHR2ZG9tTGluZXMuZm9yRWFjaChsaW5lID0+IHtcblx0XHRcdFx0bGluZXMucHVzaCgnICAnLnJlcGVhdCh2ZG9tSW5kZW50KSArIGxpbmUpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdC8vIENsb3NpbmcgdGFncyBmb3IgRE9NIHBhcmVudHMgKGluIHJldmVyc2Ugb3JkZXIpXG5cdGZvciAobGV0IGkgPSBkb21FbGVtZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdGxpbmVzLnB1c2goJyAgJy5yZXBlYXQoaSkgKyBkb21FbGVtZW50c1tpXS5jbG9zZVRhZylcblx0fVxuXG5cdHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxufVxuXG5mdW5jdGlvbiBidWlsZENvbXBvbmVudFBhdGgodm5vZGU6IGFueSwgY29udGV4dD86IHtvbGRWbm9kZT86IGFueTsgbmV3Vm5vZGU/OiBhbnl9KTogc3RyaW5nW10ge1xuXHRjb25zdCBwYXRoOiBzdHJpbmdbXSA9IFtdXG5cblx0Y29uc3QgdHJhdmVyc2VWbm9kZSA9ICh2OiBhbnksIGRlcHRoOiBudW1iZXIgPSAwKTogYm9vbGVhbiA9PiB7XG5cdFx0aWYgKCF2IHx8IGRlcHRoID4gMTApIHJldHVybiBmYWxzZVxuXG5cdFx0Y29uc3QgbmFtZSA9IGdldENvbXBvbmVudE5hbWUodilcblx0XHRjb25zdCBpc0NvbXBvbmVudCA9IHR5cGVvZiB2LnRhZyAhPT0gJ3N0cmluZycgJiYgbmFtZSAhPT0gJ1Vua25vd24nICYmIG5hbWUgIT09ICdDb21wb25lbnQnICYmIG5hbWUgIT09ICdBbm9ueW1vdXNDb21wb25lbnQnXG5cblx0XHRpZiAoaXNDb21wb25lbnQpIHtcblx0XHRcdHBhdGgucHVzaChuYW1lKVxuXHRcdH1cblxuXHRcdGlmICh2Lmluc3RhbmNlICYmIGRlcHRoIDwgMikge1xuXHRcdFx0aWYgKHRyYXZlcnNlVm5vZGUodi5pbnN0YW5jZSwgZGVwdGggKyAxKSkgcmV0dXJuIHRydWVcblx0XHR9XG5cblx0XHRpZiAodi5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KHYuY2hpbGRyZW4pICYmIGRlcHRoIDwgMikge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1pbih2LmNoaWxkcmVuLmxlbmd0aCwgMyk7IGkrKykge1xuXHRcdFx0XHRjb25zdCBjaGlsZCA9IHYuY2hpbGRyZW5baV1cblx0XHRcdFx0aWYgKGNoaWxkICYmIHRyYXZlcnNlVm5vZGUoY2hpbGQsIGRlcHRoICsgMSkpIHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRpZiAoY29udGV4dD8ubmV3Vm5vZGUpIHtcblx0XHR0cmF2ZXJzZVZub2RlKGNvbnRleHQubmV3Vm5vZGUpXG5cdFx0aWYgKHBhdGgubGVuZ3RoID4gMCkgcmV0dXJuIHBhdGhcblx0fVxuXHRpZiAoY29udGV4dD8ub2xkVm5vZGUpIHtcblx0XHR0cmF2ZXJzZVZub2RlKGNvbnRleHQub2xkVm5vZGUpXG5cdFx0aWYgKHBhdGgubGVuZ3RoID4gMCkgcmV0dXJuIHBhdGhcblx0fVxuXG5cdGlmICh2bm9kZSkge1xuXHRcdHRyYXZlcnNlVm5vZGUodm5vZGUpXG5cdH1cblxuXHRyZXR1cm4gcGF0aFxufVxuXG5mdW5jdGlvbiBmb3JtYXRDb21wb25lbnRIaWVyYXJjaHkodm5vZGU6IGFueSwgY29udGV4dD86IHtvbGRWbm9kZT86IGFueTsgbmV3Vm5vZGU/OiBhbnl9KTogc3RyaW5nIHtcblx0aWYgKCF2bm9kZSkgcmV0dXJuICdVbmtub3duJ1xuXG5cdGNvbnN0IHBhdGggPSBidWlsZENvbXBvbmVudFBhdGgodm5vZGUsIGNvbnRleHQpXG5cdGNvbnN0IGltbWVkaWF0ZU5hbWUgPSBnZXRDb21wb25lbnROYW1lKHZub2RlKVxuXHRjb25zdCBpc0VsZW1lbnQgPSB0eXBlb2Ygdm5vZGUudGFnID09PSAnc3RyaW5nJ1xuXG5cdGlmIChwYXRoLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBwYXRoU3RyID0gcGF0aC5qb2luKCcg4oaSICcpXG5cdFx0aWYgKGlzRWxlbWVudCAmJiBpbW1lZGlhdGVOYW1lICE9PSBwYXRoW3BhdGgubGVuZ3RoIC0gMV0pIHtcblx0XHRcdHJldHVybiBgJHtpbW1lZGlhdGVOYW1lfSBpbiAke3BhdGhTdHJ9YFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gcGF0aFN0clxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBpbW1lZGlhdGVOYW1lXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSHlkcmF0aW9uRXJyb3JDb250ZXh0IHtcblx0cGFyZW50PzogRWxlbWVudFxuXHRub2RlPzogTm9kZVxuXHRtYXRjaGVkTm9kZXM/OiBTZXQ8Tm9kZT5cblx0b2xkVm5vZGU/OiBhbnlcblx0bmV3Vm5vZGU/OiBhbnlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0h5ZHJhdGlvbkVycm9yKFxuXHRvcGVyYXRpb246IHN0cmluZyxcblx0dm5vZGU6IGFueSxcblx0X2VsZW1lbnQ6IEVsZW1lbnQgfCBudWxsLFxuXHRlcnJvcjogRXJyb3IsXG5cdGNvbnRleHQ/OiBIeWRyYXRpb25FcnJvckNvbnRleHQsXG4pOiB2b2lkIHtcblx0Ly8gVXBkYXRlIGh5ZHJhdGlvbiBzdGF0aXN0aWNzXG5cdHVwZGF0ZUh5ZHJhdGlvblN0YXRzKHZub2RlKVxuXHRcblx0Ly8gVGhyb3R0bGUgZXJyb3IgbG9nZ2luZyB0byBhdm9pZCBwZXJmb3JtYW5jZSBpc3N1ZXNcblx0aHlkcmF0aW9uRXJyb3JDb3VudCsrXG5cdGlmIChoeWRyYXRpb25FcnJvckNvdW50ID4gTUFYX0hZRFJBVElPTl9FUlJPUlMpIHtcblx0XHRpZiAoaHlkcmF0aW9uRXJyb3JDb3VudCA9PT0gTUFYX0hZRFJBVElPTl9FUlJPUlMgKyAxKSB7XG5cdFx0XHRjb25zdCB0b3BDb21wb25lbnRzID0gQXJyYXkuZnJvbShoeWRyYXRpb25TdGF0cy5jb21wb25lbnRNaXNtYXRjaGVzLmVudHJpZXMoKSlcblx0XHRcdFx0LnNvcnQoKGEsIGIpID0+IGJbMV0gLSBhWzFdKVxuXHRcdFx0XHQuc2xpY2UoMCwgNSlcblx0XHRcdFx0Lm1hcCgoW25hbWUsIGNvdW50XSkgPT4gYCR7bmFtZX06ICR7Y291bnR9YClcblx0XHRcdFx0LmpvaW4oJywgJylcblx0XHRcdFxuXHRcdFx0bG9nZ2VyLndhcm4oYEh5ZHJhdGlvbiBlcnJvcnMgdGhyb3R0bGVkOiBNb3JlIHRoYW4gJHtNQVhfSFlEUkFUSU9OX0VSUk9SU30gZXJyb3JzIGRldGVjdGVkLiBTdXBwcmVzc2luZyBmdXJ0aGVyIGxvZ3MgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS5gLCB7XG5cdFx0XHRcdHRvdGFsTWlzbWF0Y2hlczogaHlkcmF0aW9uU3RhdHMudG90YWxNaXNtYXRjaGVzLFxuXHRcdFx0XHR0b3BDb21wb25lbnRzOiB0b3BDb21wb25lbnRzIHx8ICdub25lJyxcblx0XHRcdH0pXG5cdFx0fVxuXHRcdHJldHVyblxuXHR9XG5cblx0Ly8gQnVpbGQgdXNlci1mcmllbmRseSBjb21wb25lbnQgaGllcmFyY2h5XG5cdGNvbnN0IGNvbXBvbmVudEhpZXJhcmNoeSA9IGZvcm1hdENvbXBvbmVudEhpZXJhcmNoeSh2bm9kZSwgY29udGV4dClcblxuXHQvLyBMb2cgaHlkcmF0aW9uIGVycm9yIHdpdGggc3RydWN0dXJlZCBjb250ZXh0XG5cdGNvbnN0IGxvZ0NvbnRleHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG5cdFx0Y29tcG9uZW50UGF0aDogY29tcG9uZW50SGllcmFyY2h5LFxuXHRcdG9wZXJhdGlvbixcblx0fVxuXHRcblx0aWYgKGNvbnRleHQ/Lm5vZGUpIHtcblx0XHRsb2dDb250ZXh0LmFmZmVjdGVkTm9kZSA9IGNvbnRleHQubm9kZS5ub2RlVHlwZSA9PT0gMVxuXHRcdFx0PyBgJHsoY29udGV4dC5ub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUudG9Mb3dlckNhc2UoKX1gXG5cdFx0XHQ6ICd0ZXh0J1xuXHR9XG5cdFxuXHQvLyBJbmNsdWRlIHN0cnVjdHVyZSBpbmZvIGluIGRlYnVnIG1vZGVcblx0aWYgKEhZRFJBVElPTl9ERUJVRykge1xuXHRcdGNvbnN0IHZub2RlVG9TaG93ID0gY29udGV4dD8ub2xkVm5vZGUgfHwgdm5vZGUgfHwgY29udGV4dD8ubmV3Vm5vZGVcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY29tYmluZWRTdHJ1Y3R1cmUgPSBmb3JtYXRDb21iaW5lZFN0cnVjdHVyZShjb250ZXh0Py5wYXJlbnQgfHwgbnVsbCwgdm5vZGVUb1Nob3csIDQpXG5cdFx0XHRpZiAoY29tYmluZWRTdHJ1Y3R1cmUpIHtcblx0XHRcdFx0bG9nQ29udGV4dC5zdHJ1Y3R1cmUgPSBjb21iaW5lZFN0cnVjdHVyZVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2goX2UpIHtcblx0XHRcdC8vIEZhbGxiYWNrOiB0cnkgdG8gc2hvdyBhdCBsZWFzdCB0aGUgVkRPTSBzdHJ1Y3R1cmVcblx0XHRcdGlmICh2bm9kZVRvU2hvdykge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IHZkb21UcmVlID0gZm9ybWF0VkRPTVRyZWUodm5vZGVUb1Nob3csIDQsIDAsIHRydWUpXG5cdFx0XHRcdFx0aWYgKHZkb21UcmVlKSB7XG5cdFx0XHRcdFx0XHRsb2dDb250ZXh0LnZkb21TdHJ1Y3R1cmUgPSB2ZG9tVHJlZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaChfZTIpIHtcblx0XHRcdFx0XHRsb2dDb250ZXh0LmNvbXBvbmVudCA9IGdldENvbXBvbmVudE5hbWUodm5vZGVUb1Nob3cpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gU2hvdyB3aGF0J3MgYmVpbmcgcmVtb3ZlZCB2cyB3aGF0J3MgcmVwbGFjaW5nIGl0IChpZiBib3RoIGV4aXN0KVxuXHRcdGlmIChjb250ZXh0Py5vbGRWbm9kZSAmJiBjb250ZXh0Py5uZXdWbm9kZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb2xkVHJlZSA9IGZvcm1hdFZET01UcmVlKGNvbnRleHQub2xkVm5vZGUsIDMpXG5cdFx0XHRcdGNvbnN0IG5ld1RyZWUgPSBmb3JtYXRWRE9NVHJlZShjb250ZXh0Lm5ld1Zub2RlLCAzKVxuXHRcdFx0XHRpZiAob2xkVHJlZSkgbG9nQ29udGV4dC5yZW1vdmluZyA9IG9sZFRyZWVcblx0XHRcdFx0aWYgKG5ld1RyZWUpIGxvZ0NvbnRleHQucmVwbGFjaW5nV2l0aCA9IG5ld1RyZWVcblx0XHRcdH0gY2F0Y2goX2UpIHtcblx0XHRcdFx0Ly8gU2lsZW50bHkgZmFpbCBpZiBmb3JtYXR0aW5nIGRvZXNuJ3Qgd29ya1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0aWYgKG9wZXJhdGlvbi5pbmNsdWRlcygncmVtb3ZlQ2hpbGQnKSB8fCBvcGVyYXRpb24uaW5jbHVkZXMoJ3JlbW92ZURPTScpKSB7XG5cdFx0bG9nQ29udGV4dC5oYW5kbGVkR3JhY2VmdWxseSA9IHRydWVcblx0fVxuXHRcblx0bG9nZ2VyLmVycm9yKGBIeWRyYXRpb24gZXJyb3I6ICR7b3BlcmF0aW9ufWAsIGVycm9yLCBsb2dDb250ZXh0KVxufVxuXG4vLyBUcmFjayBoeWRyYXRpb24gc3RhdGlzdGljcyBmb3IgZGVidWdnaW5nXG5pbnRlcmZhY2UgSHlkcmF0aW9uU3RhdHMge1xuXHR0b3RhbE1pc21hdGNoZXM6IG51bWJlclxuXHRjb21wb25lbnRNaXNtYXRjaGVzOiBNYXA8c3RyaW5nLCBudW1iZXI+XG5cdGxhc3RNaXNtYXRjaFRpbWU6IG51bWJlclxufVxuXG5sZXQgaHlkcmF0aW9uU3RhdHM6IEh5ZHJhdGlvblN0YXRzID0ge1xuXHR0b3RhbE1pc21hdGNoZXM6IDAsXG5cdGNvbXBvbmVudE1pc21hdGNoZXM6IG5ldyBNYXAoKSxcblx0bGFzdE1pc21hdGNoVGltZTogMCxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEh5ZHJhdGlvblN0YXRzKCk6IEh5ZHJhdGlvblN0YXRzIHtcblx0cmV0dXJuIHsuLi5oeWRyYXRpb25TdGF0cywgY29tcG9uZW50TWlzbWF0Y2hlczogbmV3IE1hcChoeWRyYXRpb25TdGF0cy5jb21wb25lbnRNaXNtYXRjaGVzKX1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0SHlkcmF0aW9uU3RhdHMoKTogdm9pZCB7XG5cdGh5ZHJhdGlvblN0YXRzID0ge1xuXHRcdHRvdGFsTWlzbWF0Y2hlczogMCxcblx0XHRjb21wb25lbnRNaXNtYXRjaGVzOiBuZXcgTWFwKCksXG5cdFx0bGFzdE1pc21hdGNoVGltZTogMCxcblx0fVxufVxuXG4vLyBVcGRhdGUgc3RhdHMgd2hlbiBoeWRyYXRpb24gZXJyb3Igb2NjdXJzXG5mdW5jdGlvbiB1cGRhdGVIeWRyYXRpb25TdGF0cyh2bm9kZTogYW55KTogdm9pZCB7XG5cdGh5ZHJhdGlvblN0YXRzLnRvdGFsTWlzbWF0Y2hlcysrXG5cdGh5ZHJhdGlvblN0YXRzLmxhc3RNaXNtYXRjaFRpbWUgPSBEYXRlLm5vdygpXG5cdGNvbnN0IGNvbXBvbmVudE5hbWUgPSBnZXRDb21wb25lbnROYW1lKHZub2RlKVxuXHRjb25zdCBjdXJyZW50Q291bnQgPSBoeWRyYXRpb25TdGF0cy5jb21wb25lbnRNaXNtYXRjaGVzLmdldChjb21wb25lbnROYW1lKSB8fCAwXG5cdGh5ZHJhdGlvblN0YXRzLmNvbXBvbmVudE1pc21hdGNoZXMuc2V0KGNvbXBvbmVudE5hbWUsIGN1cnJlbnRDb3VudCArIDEpXG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IG5ldyBXZWFrTWFwPE5vZGUsIG51bWJlcj4oKVxuIiwKICAgICJpbXBvcnQgZGVsYXllZFJlbW92YWwgZnJvbSAnLi9kZWxheWVkUmVtb3ZhbCdcblxuaW1wb3J0IHR5cGUge1Zub2RlfSBmcm9tICcuL3Zub2RlJ1xuXG5mdW5jdGlvbiogZG9tRm9yKHZub2RlOiBWbm9kZSk6IEdlbmVyYXRvcjxOb2RlLCB2b2lkLCB1bmtub3duPiB7XG5cdC8vIFRvIGF2b2lkIHVuaW50ZW5kZWQgbWFuZ2xpbmcgb2YgdGhlIGludGVybmFsIGJ1bmRsZXIsXG5cdC8vIHBhcmFtZXRlciBkZXN0cnVjdHVyaW5nIGlzIG5vdCB1c2VkIGhlcmUuXG5cdGxldCBkb20gPSB2bm9kZS5kb21cblx0bGV0IGRvbVNpemUgPSB2bm9kZS5kb21TaXplXG5cdGNvbnN0IGdlbmVyYXRpb24gPSBkZWxheWVkUmVtb3ZhbC5nZXQoZG9tISlcblx0ZG8ge1xuXHRcdGNvbnN0IG5leHRTaWJsaW5nID0gZG9tIS5uZXh0U2libGluZ1xuXG5cdFx0aWYgKGRlbGF5ZWRSZW1vdmFsLmdldChkb20hKSA9PT0gZ2VuZXJhdGlvbikge1xuXHRcdFx0eWllbGQgZG9tIVxuXHRcdFx0ZG9tU2l6ZSEtLVxuXHRcdH1cblxuXHRcdGRvbSA9IG5leHRTaWJsaW5nIGFzIE5vZGUgfCBudWxsXG5cdH1cblx0d2hpbGUgKGRvbVNpemUpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRvbUZvclxuIiwKICAgICJpbXBvcnQge3NldEN1cnJlbnRDb21wb25lbnQsIGNsZWFyQ3VycmVudENvbXBvbmVudCwgY2xlYXJDb21wb25lbnREZXBlbmRlbmNpZXN9IGZyb20gJy4uL3NpZ25hbCdcbmltcG9ydCB7bG9nSHlkcmF0aW9uRXJyb3IsIHJlc2V0SHlkcmF0aW9uRXJyb3JDb3VudH0gZnJvbSAnLi4vdXRpbC9zc3InXG5pbXBvcnQge2xvZ2dlcn0gZnJvbSAnLi4vc2VydmVyL2xvZ2dlcidcblxuaW1wb3J0IFZub2RlIGZyb20gJy4vdm5vZGUnXG5pbXBvcnQgZGVsYXllZFJlbW92YWwgZnJvbSAnLi9kZWxheWVkUmVtb3ZhbCdcbmltcG9ydCBkb21Gb3IgZnJvbSAnLi9kb21Gb3InXG5pbXBvcnQgY2FjaGVkQXR0cnNJc1N0YXRpY01hcCBmcm9tICcuL2NhY2hlZEF0dHJzSXNTdGF0aWNNYXAnXG5cbmltcG9ydCB0eXBlIHtWbm9kZSBhcyBWbm9kZVR5cGUsIENoaWxkcmVufSBmcm9tICcuL3Zub2RlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXJGYWN0b3J5KCkge1xuXHRjb25zdCBuYW1lU3BhY2U6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG5cdFx0c3ZnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLFxuXHRcdG1hdGg6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJyxcblx0fVxuXG5cdGxldCBjdXJyZW50UmVkcmF3OiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWRcblx0bGV0IGN1cnJlbnRSZW5kZXI6IGFueVxuXHQvLyBUcmFjayBoeWRyYXRpb24gbWlzbWF0Y2hlcyBmb3Igb3ZlcnJpZGUgbW9kZVxuXHRsZXQgaHlkcmF0aW9uTWlzbWF0Y2hDb3VudCA9IDBcblx0Y29uc3QgTUFYX0hZRFJBVElPTl9NSVNNQVRDSEVTID0gNVxuXG5cdGZ1bmN0aW9uIGdldERvY3VtZW50KGRvbTogTm9kZSk6IERvY3VtZW50IHtcblx0XHRyZXR1cm4gZG9tLm93bmVyRG9jdW1lbnQhXG5cdH1cblxuXHRmdW5jdGlvbiBnZXROYW1lU3BhY2Uodm5vZGU6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHZub2RlLmF0dHJzICYmIHZub2RlLmF0dHJzLnhtbG5zIHx8IG5hbWVTcGFjZVt2bm9kZS50YWddXG5cdH1cblxuXHQvLyBzYW5pdHkgY2hlY2sgdG8gZGlzY291cmFnZSBwZW9wbGUgZnJvbSBkb2luZyBgdm5vZGUuc3RhdGUgPSAuLi5gXG5cdGZ1bmN0aW9uIGNoZWNrU3RhdGUodm5vZGU6IGFueSwgb3JpZ2luYWw6IGFueSkge1xuXHRcdGlmICh2bm9kZS5zdGF0ZSAhPT0gb3JpZ2luYWwpIHRocm93IG5ldyBFcnJvcignXFwndm5vZGUuc3RhdGVcXCcgbXVzdCBub3QgYmUgbW9kaWZpZWQuJylcblx0fVxuXG5cdC8vIE5vdGU6IHRoZSBob29rIGlzIHBhc3NlZCBhcyB0aGUgYHRoaXNgIGFyZ3VtZW50IHRvIGFsbG93IHByb3h5aW5nIHRoZVxuXHQvLyBhcmd1bWVudHMgd2l0aG91dCByZXF1aXJpbmcgYSBmdWxsIGFycmF5IGFsbG9jYXRpb24gdG8gZG8gc28uIEl0IGFsc29cblx0Ly8gdGFrZXMgYWR2YW50YWdlIG9mIHRoZSBmYWN0IHRoZSBjdXJyZW50IGB2bm9kZWAgaXMgdGhlIGZpcnN0IGFyZ3VtZW50IGluXG5cdC8vIGFsbCBsaWZlY3ljbGUgbWV0aG9kcy5cblx0ZnVuY3Rpb24gY2FsbEhvb2sodGhpczogYW55LCB2bm9kZTogYW55LCAuLi5hcmdzOiBhbnlbXSkge1xuXHRcdGNvbnN0IG9yaWdpbmFsID0gdm5vZGUuc3RhdGVcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXBwbHkob3JpZ2luYWwsIFt2bm9kZSwgLi4uYXJnc10pXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGNoZWNrU3RhdGUodm5vZGUsIG9yaWdpbmFsKVxuXHRcdH1cblx0fVxuXG5cdC8vIElFMTEgKGF0IGxlYXN0KSB0aHJvd3MgYW4gVW5zcGVjaWZpZWRFcnJvciB3aGVuIGFjY2Vzc2luZyBkb2N1bWVudC5hY3RpdmVFbGVtZW50IHdoZW5cblx0Ly8gaW5zaWRlIGFuIGlmcmFtZS4gQ2F0Y2ggYW5kIHN3YWxsb3cgdGhpcyBlcnJvciwgYW5kIGhlYXZ5LWhhbmRpZGx5IHJldHVybiBudWxsLlxuXHRmdW5jdGlvbiBhY3RpdmVFbGVtZW50KGRvbTogTm9kZSk6IEVsZW1lbnQgfCBudWxsIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIGdldERvY3VtZW50KGRvbSkuYWN0aXZlRWxlbWVudFxuXHRcdH0gY2F0Y2goX2UpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHR9XG5cdC8vIGNyZWF0ZVxuXHRmdW5jdGlvbiBjcmVhdGVOb2RlcyhwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZXM6IChWbm9kZVR5cGUgfCBudWxsKVtdLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UsIG1hdGNoZWROb2RlczogU2V0PE5vZGU+IHwgbnVsbCA9IG51bGwpIHtcblx0XHQvLyBUcmFjayB3aGljaCBET00gbm9kZXMgd2UndmUgbWF0Y2hlZCBkdXJpbmcgaHlkcmF0aW9uIHRvIGF2b2lkIHJldXNpbmcgdGhlIHNhbWUgbm9kZSB0d2ljZVxuXHRcdC8vIENyZWF0ZSBhIG5ldyBzZXQgaWYgbm90IHByb3ZpZGVkIGFuZCB3ZSdyZSBoeWRyYXRpbmcgYXQgdGhlIHJvb3QgbGV2ZWxcblx0XHRjb25zdCBjcmVhdGVkTWF0Y2hlZE5vZGVzID0gbWF0Y2hlZE5vZGVzID09IG51bGwgJiYgaXNIeWRyYXRpbmcgJiYgbmV4dFNpYmxpbmcgPT0gbnVsbFxuXHRcdGlmIChjcmVhdGVkTWF0Y2hlZE5vZGVzKSB7XG5cdFx0XHRtYXRjaGVkTm9kZXMgPSBuZXcgU2V0PE5vZGU+KClcblx0XHR9XG5cdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdGNvbnN0IHZub2RlID0gdm5vZGVzW2ldXG5cdFx0XHRpZiAodm5vZGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nLCBtYXRjaGVkTm9kZXMpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIEFmdGVyIGNyZWF0aW5nL21hdGNoaW5nIGFsbCBub2RlcywgcmVtb3ZlIGFueSB1bm1hdGNoZWQgbm9kZXMgdGhhdCByZW1haW5cblx0XHQvLyBPbmx5IGRvIHRoaXMgYXQgdGhlIHJvb3QgbGV2ZWwgdG8gYXZvaWQgcmVtb3Zpbmcgbm9kZXMgdGhhdCBhcmUgcGFydCBvZiBtYXRjaGVkIHN1YnRyZWVzXG5cdFx0aWYgKGNyZWF0ZWRNYXRjaGVkTm9kZXMgJiYgbWF0Y2hlZE5vZGVzICYmIHBhcmVudC5maXJzdENoaWxkICYmIG5leHRTaWJsaW5nID09IG51bGwpIHtcblx0XHRcdGxldCBub2RlOiBOb2RlIHwgbnVsbCA9IHBhcmVudC5maXJzdENoaWxkXG5cdFx0XHR3aGlsZSAobm9kZSkge1xuXHRcdFx0XHRjb25zdCBuZXh0OiBOb2RlIHwgbnVsbCA9IG5vZGUubmV4dFNpYmxpbmdcblx0XHRcdFx0aWYgKCFtYXRjaGVkTm9kZXMuaGFzKG5vZGUpKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgZXJyb3IgPSBlIGFzIEVycm9yXG5cdFx0XHRcdFx0XHRsb2dIeWRyYXRpb25FcnJvcihcblx0XHRcdFx0XHRcdFx0J3JlbW92ZUNoaWxkIChyb290IGxldmVsIGNsZWFudXApJyxcblx0XHRcdFx0XHRcdFx0bnVsbCwgLy8gTm8gdm5vZGUgYXQgcm9vdCBsZXZlbFxuXHRcdFx0XHRcdFx0XHRwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogbnVsbCxcblx0XHRcdFx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdFx0XHRcdHtwYXJlbnQ6IHBhcmVudCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBwYXJlbnQgOiB1bmRlZmluZWQsIG5vZGUsIG1hdGNoZWROb2Rlc30sXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQvLyBEb24ndCByZS10aHJvdyAtIHdlJ3ZlIGFscmVhZHkgbG9nZ2VkIHRoZSBlcnJvciB3aXRoIGFsbCBkZXRhaWxzXG5cdFx0XHRcdFx0XHQvLyBSZS10aHJvd2luZyBjYXVzZXMgdGhlIGJyb3dzZXIgdG8gbG9nIHRoZSBET01FeGNlcHRpb24gc3RhY2sgdHJhY2Vcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0bm9kZSA9IG5leHRcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlTm9kZShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSwgbWF0Y2hlZE5vZGVzOiBTZXQ8Tm9kZT4gfCBudWxsID0gbnVsbCkge1xuXHRcdGNvbnN0IHRhZyA9IHZub2RlLnRhZ1xuXHRcdGlmICh0eXBlb2YgdGFnID09PSAnc3RyaW5nJykge1xuXHRcdFx0dm5vZGUuc3RhdGUgPSB7fVxuXHRcdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIGluaXRMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcywgaXNIeWRyYXRpbmcpXG5cdFx0XHRzd2l0Y2ggKHRhZykge1xuXHRcdFx0XHRjYXNlICcjJzogY3JlYXRlVGV4dChwYXJlbnQsIHZub2RlLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcyk7IGJyZWFrXG5cdFx0XHRcdGNhc2UgJzwnOiBjcmVhdGVIVE1MKHBhcmVudCwgdm5vZGUsIG5zLCBuZXh0U2libGluZyk7IGJyZWFrXG5cdFx0XHRcdGNhc2UgJ1snOiBjcmVhdGVGcmFnbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZywgbWF0Y2hlZE5vZGVzKTsgYnJlYWtcblx0XHRcdFx0ZGVmYXVsdDogY3JlYXRlRWxlbWVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZywgbWF0Y2hlZE5vZGVzKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGNyZWF0ZUNvbXBvbmVudChwYXJlbnQsIHZub2RlLCBob29rcywgbnMsIG5leHRTaWJsaW5nLCBpc0h5ZHJhdGluZywgbWF0Y2hlZE5vZGVzKVxuXHR9XG5cdGZ1bmN0aW9uIGNyZWF0ZVRleHQocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0bGV0IHRleHROb2RlOiBUZXh0XG5cdFx0aWYgKGlzSHlkcmF0aW5nICYmIHBhcmVudC5maXJzdENoaWxkICYmIG5leHRTaWJsaW5nID09IG51bGwgJiYgbWF0Y2hlZE5vZGVzKSB7XG5cdFx0XHQvLyBEdXJpbmcgaHlkcmF0aW9uLCB0cnkgdG8gcmV1c2UgZXhpc3RpbmcgdGV4dCBub2RlXG5cdFx0XHQvLyBOb3JtYWxpemUgdGV4dCBmb3IgY29tcGFyaXNvbiAodHJpbSB3aGl0ZXNwYWNlIGRpZmZlcmVuY2VzKVxuXHRcdFx0Y29uc3QgZXhwZWN0ZWRUZXh0ID0gU3RyaW5nKHZub2RlLmNoaWxkcmVuIHx8ICcnKS50cmltKClcblx0XHRcdGxldCBjYW5kaWRhdGU6IE5vZGUgfCBudWxsID0gcGFyZW50LmZpcnN0Q2hpbGRcblx0XHRcdHdoaWxlIChjYW5kaWRhdGUpIHtcblx0XHRcdFx0aWYgKGNhbmRpZGF0ZS5ub2RlVHlwZSA9PT0gMyAmJiAhbWF0Y2hlZE5vZGVzLmhhcyhjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FuZGlkYXRlVGV4dCA9IGNhbmRpZGF0ZSBhcyBUZXh0XG5cdFx0XHRcdFx0Y29uc3QgY2FuZGlkYXRlVmFsdWUgPSBjYW5kaWRhdGVUZXh0Lm5vZGVWYWx1ZSB8fCAnJ1xuXHRcdFx0XHRcdC8vIEV4YWN0IG1hdGNoIHByZWZlcnJlZCwgYnV0IGFsc28gYWNjZXB0IHRyaW1tZWQgbWF0Y2ggZm9yIHdoaXRlc3BhY2UgZGlmZmVyZW5jZXNcblx0XHRcdFx0XHRpZiAoY2FuZGlkYXRlVmFsdWUgPT09IFN0cmluZyh2bm9kZS5jaGlsZHJlbikgfHwgXG5cdFx0XHRcdFx0XHQoZXhwZWN0ZWRUZXh0ICYmIGNhbmRpZGF0ZVZhbHVlLnRyaW0oKSA9PT0gZXhwZWN0ZWRUZXh0KSkge1xuXHRcdFx0XHRcdFx0dGV4dE5vZGUgPSBjYW5kaWRhdGVUZXh0XG5cdFx0XHRcdFx0XHRtYXRjaGVkTm9kZXMuYWRkKHRleHROb2RlKVxuXHRcdFx0XHRcdFx0Ly8gVXBkYXRlIHRleHQgY29udGVudCBpZiB0aGVyZSdzIGEgbWlub3IgZGlmZmVyZW5jZSAod2hpdGVzcGFjZSBub3JtYWxpemF0aW9uKVxuXHRcdFx0XHRcdFx0aWYgKGNhbmRpZGF0ZVZhbHVlICE9PSBTdHJpbmcodm5vZGUuY2hpbGRyZW4pKSB7XG5cdFx0XHRcdFx0XHRcdHRleHROb2RlLm5vZGVWYWx1ZSA9IFN0cmluZyh2bm9kZS5jaGlsZHJlbilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIERvbid0IHJlbW92ZS9yZWluc2VydCAtIGp1c3QgcmV1c2UgdGhlIGV4aXN0aW5nIG5vZGUgaW4gcGxhY2Vcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZS5uZXh0U2libGluZ1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgbm8gbWF0Y2hpbmcgdGV4dCBub2RlIGZvdW5kLCBjcmVhdGUgbmV3IG9uZVxuXHRcdFx0aWYgKCF0ZXh0Tm9kZSEpIHtcblx0XHRcdFx0dGV4dE5vZGUgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlVGV4dE5vZGUodm5vZGUuY2hpbGRyZW4pXG5cdFx0XHRcdGluc2VydERPTShwYXJlbnQsIHRleHROb2RlLCBuZXh0U2libGluZylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGV4dE5vZGUgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlVGV4dE5vZGUodm5vZGUuY2hpbGRyZW4pXG5cdFx0XHRpbnNlcnRET00ocGFyZW50LCB0ZXh0Tm9kZSwgbmV4dFNpYmxpbmcpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IHRleHROb2RlXG5cdH1cblx0Y29uc3QgcG9zc2libGVQYXJlbnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge2NhcHRpb246ICd0YWJsZScsIHRoZWFkOiAndGFibGUnLCB0Ym9keTogJ3RhYmxlJywgdGZvb3Q6ICd0YWJsZScsIHRyOiAndGJvZHknLCB0aDogJ3RyJywgdGQ6ICd0cicsIGNvbGdyb3VwOiAndGFibGUnLCBjb2w6ICdjb2xncm91cCd9XG5cdGZ1bmN0aW9uIGNyZWF0ZUhUTUwocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsKSB7XG5cdFx0Y29uc3QgbWF0Y2ggPSB2bm9kZS5jaGlsZHJlbi5tYXRjaCgvXlxccyo/PChcXHcrKS9pbSkgfHwgW11cblx0XHQvLyBub3QgdXNpbmcgdGhlIHByb3BlciBwYXJlbnQgbWFrZXMgdGhlIGNoaWxkIGVsZW1lbnQocykgdmFuaXNoLlxuXHRcdC8vICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuXHRcdC8vICAgICBkaXYuaW5uZXJIVE1MID0gXCI8dGQ+aTwvdGQ+PHRkPmo8L3RkPlwiXG5cdFx0Ly8gICAgIGNvbnNvbGUubG9nKGRpdi5pbm5lckhUTUwpXG5cdFx0Ly8gLS0+IFwiaWpcIiwgbm8gPHRkPiBpbiBzaWdodC5cblx0XHRsZXQgdGVtcCA9IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50KHBvc3NpYmxlUGFyZW50c1ttYXRjaFsxXV0gfHwgJ2RpdicpXG5cdFx0aWYgKG5zID09PSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnKSB7XG5cdFx0XHR0ZW1wLmlubmVySFRNTCA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj4nICsgdm5vZGUuY2hpbGRyZW4gKyAnPC9zdmc+J1xuXHRcdFx0dGVtcCA9IHRlbXAuZmlyc3RDaGlsZCBhcyBIVE1MRWxlbWVudFxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0ZW1wLmlubmVySFRNTCA9IHZub2RlLmNoaWxkcmVuXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IHRlbXAuZmlyc3RDaGlsZFxuXHRcdHZub2RlLmRvbVNpemUgPSB0ZW1wLmNoaWxkTm9kZXMubGVuZ3RoXG5cdFx0Y29uc3QgZnJhZ21lbnQgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0bGV0IGNoaWxkOiBOb2RlIHwgbnVsbFxuXHRcdHdoaWxlICgoY2hpbGQgPSB0ZW1wLmZpcnN0Q2hpbGQpICE9IG51bGwpIHtcblx0XHRcdGZyYWdtZW50LmFwcGVuZENoaWxkKGNoaWxkKVxuXHRcdH1cblx0XHRpbnNlcnRET00ocGFyZW50LCBmcmFnbWVudCwgbmV4dFNpYmxpbmcpXG5cdH1cblx0ZnVuY3Rpb24gY3JlYXRlRnJhZ21lbnQocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UsIG1hdGNoZWROb2RlczogU2V0PE5vZGU+IHwgbnVsbCA9IG51bGwpIHtcblx0XHRjb25zdCBmcmFnbWVudCA9IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblx0XHRpZiAodm5vZGUuY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0Y3JlYXRlTm9kZXMoZnJhZ21lbnQsIGNoaWxkcmVuLCAwLCBjaGlsZHJlbi5sZW5ndGgsIGhvb2tzLCBudWxsLCBucywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcylcblx0XHR9XG5cdFx0dm5vZGUuZG9tID0gZnJhZ21lbnQuZmlyc3RDaGlsZFxuXHRcdHZub2RlLmRvbVNpemUgPSBmcmFnbWVudC5jaGlsZE5vZGVzLmxlbmd0aFxuXHRcdGluc2VydERPTShwYXJlbnQsIGZyYWdtZW50LCBuZXh0U2libGluZylcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlLCBtYXRjaGVkTm9kZXM6IFNldDxOb2RlPiB8IG51bGwgPSBudWxsKSB7XG5cdFx0Y29uc3QgdGFnID0gdm5vZGUudGFnXG5cdFx0Y29uc3QgYXR0cnMgPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IGlzID0gdm5vZGUuaXNcblxuXHRcdG5zID0gZ2V0TmFtZVNwYWNlKHZub2RlKSB8fCBuc1xuXG5cdFx0bGV0IGVsZW1lbnQ6IEVsZW1lbnRcblx0XHRpZiAoaXNIeWRyYXRpbmcgJiYgcGFyZW50LmZpcnN0Q2hpbGQgJiYgbmV4dFNpYmxpbmcgPT0gbnVsbCAmJiBtYXRjaGVkTm9kZXMpIHtcblx0XHRcdC8vIER1cmluZyBoeWRyYXRpb24sIHRyeSB0byByZXVzZSBleGlzdGluZyBET00gbm9kZVxuXHRcdFx0Ly8gT25seSBtYXRjaCBpZiB3ZSdyZSBhcHBlbmRpbmcgKG5leHRTaWJsaW5nID09IG51bGwpIHRvIHByZXNlcnZlIG9yZGVyXG5cdFx0XHQvLyBGaW5kIHRoZSBmaXJzdCB1bm1hdGNoZWQgY2hpbGQgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHRhZ1xuXHRcdFx0Ly8gTW9yZSBsZW5pZW50IG1hdGNoaW5nOiBza2lwIHRleHQgbm9kZXMgYW5kIGNvbW1lbnRzLCBhbGxvdyB0YWcgbmFtZSBjYXNlIGRpZmZlcmVuY2VzXG5cdFx0XHRsZXQgY2FuZGlkYXRlOiBOb2RlIHwgbnVsbCA9IHBhcmVudC5maXJzdENoaWxkXG5cdFx0XHRsZXQgZmFsbGJhY2tDYW5kaWRhdGU6IEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXHRcdFx0d2hpbGUgKGNhbmRpZGF0ZSkge1xuXHRcdFx0XHQvLyBTa2lwIHRleHQgbm9kZXMsIGNvbW1lbnRzLCBhbmQgYWxyZWFkeSBtYXRjaGVkIG5vZGVzXG5cdFx0XHRcdGlmIChjYW5kaWRhdGUubm9kZVR5cGUgPT09IDEgJiYgIW1hdGNoZWROb2Rlcy5oYXMoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRcdGNvbnN0IGNhbmRpZGF0ZUVsID0gY2FuZGlkYXRlIGFzIEVsZW1lbnRcblx0XHRcdFx0XHQvLyBDYXNlLWluc2Vuc2l0aXZlIHRhZyBtYXRjaGluZyAoYnJvd3NlcnMgbm9ybWFsaXplIHRvIHVwcGVyY2FzZSBmb3Igc29tZSB0YWdzKVxuXHRcdFx0XHRcdC8vIFVzZSB0YWdOYW1lIGlmIGF2YWlsYWJsZSwgZmFsbGJhY2sgdG8gbm9kZU5hbWUgKGZvciBET00gbW9ja3MpXG5cdFx0XHRcdFx0Y29uc3QgY2FuZGlkYXRlVGFnID0gKGNhbmRpZGF0ZUVsIGFzIGFueSkudGFnTmFtZSB8fCBjYW5kaWRhdGVFbC5ub2RlTmFtZVxuXHRcdFx0XHRcdGlmIChjYW5kaWRhdGVUYWcgJiYgY2FuZGlkYXRlVGFnLnRvTG93ZXJDYXNlKCkgPT09IHRhZy50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0XHQvLyBQcmVmZXIgZXhhY3QgbWF0Y2ggKGlzIGF0dHJpYnV0ZSBtYXRjaGVzIGlmIHNwZWNpZmllZClcblx0XHRcdFx0XHRcdGlmICghaXMgfHwgY2FuZGlkYXRlRWwuZ2V0QXR0cmlidXRlKCdpcycpID09PSBpcykge1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50ID0gY2FuZGlkYXRlRWxcblx0XHRcdFx0XHRcdFx0bWF0Y2hlZE5vZGVzLmFkZChlbGVtZW50KVxuXHRcdFx0XHRcdFx0XHQvLyBEb24ndCByZW1vdmUvcmVpbnNlcnQgLSBqdXN0IHJldXNlIHRoZSBleGlzdGluZyBub2RlIGluIHBsYWNlXG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBLZWVwIHRyYWNrIG9mIGZpcnN0IG1hdGNoaW5nIHRhZyBhcyBmYWxsYmFjayAoZXZlbiBpZiBpcyBhdHRyaWJ1dGUgZG9lc24ndCBtYXRjaClcblx0XHRcdFx0XHRcdGlmICghZmFsbGJhY2tDYW5kaWRhdGUpIHtcblx0XHRcdFx0XHRcdFx0ZmFsbGJhY2tDYW5kaWRhdGUgPSBjYW5kaWRhdGVFbFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjYW5kaWRhdGUgPSBjYW5kaWRhdGUubmV4dFNpYmxpbmdcblx0XHRcdH1cblx0XHRcdC8vIElmIG5vIGV4YWN0IG1hdGNoIGZvdW5kIGJ1dCB3ZSBoYXZlIGEgZmFsbGJhY2ssIHVzZSBpdFxuXHRcdFx0Ly8gVGhpcyBoYW5kbGVzIGNhc2VzIHdoZXJlIGlzIGF0dHJpYnV0ZSBkaWZmZXJzIGJ1dCB0YWcgbWF0Y2hlc1xuXHRcdFx0aWYgKCFlbGVtZW50ISAmJiBmYWxsYmFja0NhbmRpZGF0ZSkge1xuXHRcdFx0XHRlbGVtZW50ID0gZmFsbGJhY2tDYW5kaWRhdGVcblx0XHRcdFx0bWF0Y2hlZE5vZGVzLmFkZChlbGVtZW50KVxuXHRcdFx0fVxuXHRcdFx0Ly8gSWYgc3RpbGwgbm8gbWF0Y2hpbmcgZWxlbWVudCBmb3VuZCwgY3JlYXRlIG5ldyBvbmVcblx0XHRcdGlmICghZWxlbWVudCEpIHtcblx0XHRcdFx0ZWxlbWVudCA9IG5zID9cblx0XHRcdFx0XHRpcyA/IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50TlMobnMsIHRhZywge2lzOiBpc30gYXMgYW55KSA6IGdldERvY3VtZW50KHBhcmVudCBhcyBFbGVtZW50KS5jcmVhdGVFbGVtZW50TlMobnMsIHRhZykgOlxuXHRcdFx0XHRcdGlzID8gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZUVsZW1lbnQodGFnLCB7aXM6IGlzfSBhcyBhbnkpIDogZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZUVsZW1lbnQodGFnKVxuXHRcdFx0XHRpbnNlcnRET00ocGFyZW50LCBlbGVtZW50LCBuZXh0U2libGluZylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTm9ybWFsIGNyZWF0aW9uIHBhdGhcblx0XHRcdGVsZW1lbnQgPSBucyA/XG5cdFx0XHRcdGlzID8gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZUVsZW1lbnROUyhucywgdGFnLCB7aXM6IGlzfSBhcyBhbnkpIDogZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZUVsZW1lbnROUyhucywgdGFnKSA6XG5cdFx0XHRcdGlzID8gZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZUVsZW1lbnQodGFnLCB7aXM6IGlzfSBhcyBhbnkpIDogZ2V0RG9jdW1lbnQocGFyZW50IGFzIEVsZW1lbnQpLmNyZWF0ZUVsZW1lbnQodGFnKVxuXHRcdFx0aW5zZXJ0RE9NKHBhcmVudCwgZWxlbWVudCwgbmV4dFNpYmxpbmcpXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IGVsZW1lbnRcblxuXHRcdGlmIChhdHRycyAhPSBudWxsKSB7XG5cdFx0XHRzZXRBdHRycyh2bm9kZSwgYXR0cnMsIG5zKVxuXHRcdH1cblxuXHRcdGlmICghbWF5YmVTZXRDb250ZW50RWRpdGFibGUodm5vZGUpKSB7XG5cdFx0XHRpZiAodm5vZGUuY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0XHRjb25zdCBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0XHRcdC8vIER1cmluZyBoeWRyYXRpb24sIGlmIHdlIHJldXNlZCBhbiBlbGVtZW50LCBpdCBhbHJlYWR5IGhhcyBjaGlsZHJlblxuXHRcdFx0XHQvLyBDcmVhdGUgYSBuZXcgbWF0Y2hlZE5vZGVzIHNldCBmb3IgdGhpcyBlbGVtZW50J3MgY2hpbGRyZW4gdG8gYXZvaWQgZHVwbGljYXRlc1xuXHRcdFx0XHRjb25zdCBjaGlsZE1hdGNoZWROb2RlcyA9IChpc0h5ZHJhdGluZyAmJiBlbGVtZW50LmZpcnN0Q2hpbGQpID8gbmV3IFNldDxOb2RlPigpIDogbnVsbFxuXHRcdFx0XHRjcmVhdGVOb2RlcyhlbGVtZW50LCBjaGlsZHJlbiwgMCwgY2hpbGRyZW4ubGVuZ3RoLCBob29rcywgbnVsbCwgbnMsIGlzSHlkcmF0aW5nLCBjaGlsZE1hdGNoZWROb2Rlcylcblx0XHRcdFx0Ly8gQWZ0ZXIgY3JlYXRpbmcvbWF0Y2hpbmcgY2hpbGRyZW4sIHJlbW92ZSBhbnkgdW5tYXRjaGVkIG5vZGVzIHRoYXQgcmVtYWluXG5cdFx0XHRcdC8vIE9ubHkgcmVtb3ZlIHVubWF0Y2hlZCBub2RlcyBpZiB3ZSBhY3R1YWxseSBtYXRjaGVkIHNvbWUgbm9kZXMgKHRvIGF2b2lkIGNsZWFyaW5nIGV2ZXJ5dGhpbmcpXG5cdFx0XHRcdGlmIChpc0h5ZHJhdGluZyAmJiBjaGlsZE1hdGNoZWROb2RlcyAmJiBlbGVtZW50LmZpcnN0Q2hpbGQgJiYgY2hpbGRNYXRjaGVkTm9kZXMuc2l6ZSA+IDApIHtcblx0XHRcdFx0XHRsZXQgbm9kZTogTm9kZSB8IG51bGwgPSBlbGVtZW50LmZpcnN0Q2hpbGRcblx0XHRcdFx0XHR3aGlsZSAobm9kZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgbmV4dDogTm9kZSB8IG51bGwgPSBub2RlLm5leHRTaWJsaW5nXG5cdFx0XHRcdFx0XHRpZiAoIWNoaWxkTWF0Y2hlZE5vZGVzLmhhcyhub2RlKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBWZXJpZnkgbm9kZSBpcyBzdGlsbCBhIGNoaWxkIGJlZm9yZSBhdHRlbXB0aW5nIHJlbW92YWxcblx0XHRcdFx0XHRcdFx0aWYgKGVsZW1lbnQuY29udGFpbnMgJiYgZWxlbWVudC5jb250YWlucyhub2RlKSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlbGVtZW50LnJlbW92ZUNoaWxkKG5vZGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRoeWRyYXRpb25NaXNtYXRjaENvdW50Kytcblx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGVycm9yID0gZSBhcyBFcnJvclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgbm9kZSB3YXMgYWxyZWFkeSByZW1vdmVkIChub3QgYSBjaGlsZCBhbnltb3JlKVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFlbGVtZW50LmNvbnRhaW5zIHx8ICFlbGVtZW50LmNvbnRhaW5zKG5vZGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIE5vZGUgYWxyZWFkeSByZW1vdmVkLCBza2lwIHNpbGVudGx5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vZGUgPSBuZXh0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRoeWRyYXRpb25NaXNtYXRjaENvdW50Kytcblx0XHRcdFx0XHRcdFx0XHRcdGxvZ0h5ZHJhdGlvbkVycm9yKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQncmVtb3ZlQ2hpbGQgKGVsZW1lbnQgY2hpbGRyZW4gY2xlYW51cCknLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2bm9kZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtwYXJlbnQ6IGVsZW1lbnQsIG5vZGUsIG1hdGNoZWROb2RlczogY2hpbGRNYXRjaGVkTm9kZXN9LFxuXHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmUtdGhyb3cgLSB3ZSd2ZSBhbHJlYWR5IGxvZ2dlZCB0aGUgZXJyb3Igd2l0aCBhbGwgZGV0YWlsc1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gUmUtdGhyb3dpbmcgY2F1c2VzIHRoZSBicm93c2VyIHRvIGxvZyB0aGUgRE9NRXhjZXB0aW9uIHN0YWNrIHRyYWNlXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vIE5vZGUgbm90IGluIHBhcmVudCwgYWxyZWFkeSByZW1vdmVkIC0gc2tpcCBzaWxlbnRseVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bm9kZSA9IG5leHRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gJ3NlbGVjdCcgJiYgYXR0cnMgIT0gbnVsbCkgc2V0TGF0ZVNlbGVjdEF0dHJzKHZub2RlLCBhdHRycylcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gaW5pdENvbXBvbmVudCh2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRsZXQgc2VudGluZWw6IGFueVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnLnZpZXcgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZub2RlLnN0YXRlID0gT2JqZWN0LmNyZWF0ZSh2bm9kZS50YWcpXG5cdFx0XHRzZW50aW5lbCA9IHZub2RlLnN0YXRlLnZpZXdcblx0XHRcdGlmIChzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCAhPSBudWxsKSByZXR1cm5cblx0XHRcdHNlbnRpbmVsLiQkcmVlbnRyYW50TG9jayQkID0gdHJ1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2bm9kZS5zdGF0ZSA9IHZvaWQgMFxuXHRcdFx0c2VudGluZWwgPSB2bm9kZS50YWdcblx0XHRcdGlmIChzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCAhPSBudWxsKSByZXR1cm5cblx0XHRcdHNlbnRpbmVsLiQkcmVlbnRyYW50TG9jayQkID0gdHJ1ZVxuXHRcdFx0dm5vZGUuc3RhdGUgPSAodm5vZGUudGFnLnByb3RvdHlwZSAhPSBudWxsICYmIHR5cGVvZiB2bm9kZS50YWcucHJvdG90eXBlLnZpZXcgPT09ICdmdW5jdGlvbicpID8gbmV3IHZub2RlLnRhZyh2bm9kZSkgOiB2bm9kZS50YWcodm5vZGUpXG5cdFx0fVxuXHRcdGluaXRMaWZlY3ljbGUodm5vZGUuc3RhdGUsIHZub2RlLCBob29rcywgaXNIeWRyYXRpbmcpXG5cdFx0aWYgKHZub2RlLmF0dHJzICE9IG51bGwpIGluaXRMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcywgaXNIeWRyYXRpbmcpXG5cdFx0XG5cdFx0Ly8gVHJhY2sgY29tcG9uZW50IGZvciBzaWduYWwgZGVwZW5kZW5jeSB0cmFja2luZ1xuXHRcdC8vIFN0b3JlIG1hcHBpbmcgZnJvbSB2bm9kZS5zdGF0ZSB0byB2bm9kZS50YWcgKGNvbXBvbmVudCBvYmplY3QpIGZvciByZWRyYXdcblx0XHRpZiAodm5vZGUuc3RhdGUgJiYgdm5vZGUudGFnICYmICFpc0h5ZHJhdGluZykge1xuXHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCA9IChnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0NvbXBvbmVudCB8fCBuZXcgV2Vha01hcCgpXG5cdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvQ29tcG9uZW50LnNldCh2bm9kZS5zdGF0ZSwgdm5vZGUudGFnKVxuXHRcdH1cblx0XHQvLyBBbHdheXMgdHJhY2sgY29tcG9uZW50IGRlcGVuZGVuY2llcyBmb3Igc2lnbmFsIHRyYWNraW5nIChldmVuIGR1cmluZyBoeWRyYXRpb24pXG5cdFx0Ly8gVGhpcyBhbGxvd3Mgc2lnbmFscyB0byBrbm93IHdoaWNoIGNvbXBvbmVudHMgZGVwZW5kIG9uIHRoZW1cblx0XHQvLyBXZSBvbmx5IHNraXAgb25pbml0IGR1cmluZyBoeWRyYXRpb24sIG5vdCBzaWduYWwgdHJhY2tpbmdcblx0XHQvLyBPbmx5IHNldCBjdXJyZW50Q29tcG9uZW50IGlmIHZub2RlLnN0YXRlIGV4aXN0cyAoaXQgbWlnaHQgYmUgdW5kZWZpbmVkIGZvciBzb21lIGNvbXBvbmVudCB0eXBlcylcblx0XHRpZiAodm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0c2V0Q3VycmVudENvbXBvbmVudCh2bm9kZS5zdGF0ZSlcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdHZub2RlLmluc3RhbmNlID0gVm5vZGUubm9ybWFsaXplKGNhbGxIb29rLmNhbGwodm5vZGUuc3RhdGUudmlldywgdm5vZGUpKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAodm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRjbGVhckN1cnJlbnRDb21wb25lbnQoKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgPT09IHZub2RlKSB0aHJvdyBFcnJvcignQSB2aWV3IGNhbm5vdCByZXR1cm4gdGhlIHZub2RlIGl0IHJlY2VpdmVkIGFzIGFyZ3VtZW50Jylcblx0XHRzZW50aW5lbC4kJHJlZW50cmFudExvY2skJCA9IG51bGxcblx0fVxuXHRmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UsIG1hdGNoZWROb2RlczogU2V0PE5vZGU+IHwgbnVsbCA9IG51bGwpIHtcblx0XHRpbml0Q29tcG9uZW50KHZub2RlLCBob29rcywgaXNIeWRyYXRpbmcpXG5cdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIHtcblx0XHRcdGNyZWF0ZU5vZGUocGFyZW50LCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcsIG1hdGNoZWROb2Rlcylcblx0XHRcdHZub2RlLmRvbSA9IHZub2RlLmluc3RhbmNlLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IHZub2RlLmluc3RhbmNlLmRvbVNpemVcblx0XHRcdFxuXHRcdFx0Ly8gU3RvcmUgY29tcG9uZW50J3MgRE9NIGVsZW1lbnQgZm9yIGZpbmUtZ3JhaW5lZCByZWRyYXcgKG5vdCBkdXJpbmcgaHlkcmF0aW9uKVxuXHRcdFx0aWYgKHZub2RlLnN0YXRlICYmIHZub2RlLmRvbSAmJiAhaXNIeWRyYXRpbmcpIHtcblx0XHRcdFx0OyhnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0RvbSA9IChnbG9iYWxUaGlzIGFzIGFueSkuX19taXRocmlsU3RhdGVUb0RvbSB8fCBuZXcgV2Vha01hcCgpXG5cdFx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20uc2V0KHZub2RlLnN0YXRlLCB2bm9kZS5kb20pXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IDBcblx0XHR9XG5cdH1cblxuXHQvLyB1cGRhdGVcblx0ZnVuY3Rpb24gdXBkYXRlTm9kZXMocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgb2xkOiAoVm5vZGVUeXBlIHwgbnVsbClbXSB8IG51bGwsIHZub2RlczogKFZub2RlVHlwZSB8IG51bGwpW10gfCBudWxsLCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGlmIChvbGQgPT09IHZub2RlcyB8fCBvbGQgPT0gbnVsbCAmJiB2bm9kZXMgPT0gbnVsbCkgcmV0dXJuXG5cdFx0ZWxzZSBpZiAob2xkID09IG51bGwgfHwgb2xkLmxlbmd0aCA9PT0gMCkgY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMhLCAwLCB2bm9kZXMhLmxlbmd0aCwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0ZWxzZSBpZiAodm5vZGVzID09IG51bGwgfHwgdm5vZGVzLmxlbmd0aCA9PT0gMCkgcmVtb3ZlTm9kZXMocGFyZW50LCBvbGQsIDAsIG9sZC5sZW5ndGgpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBpc09sZEtleWVkID0gb2xkWzBdICE9IG51bGwgJiYgb2xkWzBdIS5rZXkgIT0gbnVsbFxuXHRcdFx0Y29uc3QgaXNLZXllZCA9IHZub2Rlc1swXSAhPSBudWxsICYmIHZub2Rlc1swXSEua2V5ICE9IG51bGxcblx0XHRcdGxldCBzdGFydCA9IDAsIG9sZFN0YXJ0ID0gMCwgbzogYW55LCB2OiBhbnlcblx0XHRcdGlmIChpc09sZEtleWVkICE9PSBpc0tleWVkKSB7XG5cdFx0XHRcdHJlbW92ZU5vZGVzKHBhcmVudCwgb2xkLCAwLCBvbGQubGVuZ3RoKVxuXHRcdFx0XHRjcmVhdGVOb2RlcyhwYXJlbnQsIHZub2RlcywgMCwgdm5vZGVzLmxlbmd0aCwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHR9IGVsc2UgaWYgKCFpc0tleWVkKSB7XG5cdFx0XHRcdC8vIERvbid0IGluZGV4IHBhc3QgdGhlIGVuZCBvZiBlaXRoZXIgbGlzdCAoY2F1c2VzIGRlb3B0cykuXG5cdFx0XHRcdGNvbnN0IGNvbW1vbkxlbmd0aCA9IG9sZC5sZW5ndGggPCB2bm9kZXMubGVuZ3RoID8gb2xkLmxlbmd0aCA6IHZub2Rlcy5sZW5ndGhcblx0XHRcdFx0Ly8gUmV3aW5kIGlmIG5lY2Vzc2FyeSB0byB0aGUgZmlyc3Qgbm9uLW51bGwgaW5kZXggb24gZWl0aGVyIHNpZGUuXG5cdFx0XHRcdC8vIFdlIGNvdWxkIGFsdGVybmF0aXZlbHkgZWl0aGVyIGV4cGxpY2l0bHkgY3JlYXRlIG9yIHJlbW92ZSBub2RlcyB3aGVuIGBzdGFydCAhPT0gb2xkU3RhcnRgXG5cdFx0XHRcdC8vIGJ1dCB0aGF0IHdvdWxkIGJlIG9wdGltaXppbmcgZm9yIHNwYXJzZSBsaXN0cyB3aGljaCBhcmUgbW9yZSByYXJlIHRoYW4gZGVuc2Ugb25lcy5cblx0XHRcdFx0d2hpbGUgKG9sZFN0YXJ0IDwgb2xkLmxlbmd0aCAmJiBvbGRbb2xkU3RhcnRdID09IG51bGwpIG9sZFN0YXJ0Kytcblx0XHRcdFx0d2hpbGUgKHN0YXJ0IDwgdm5vZGVzLmxlbmd0aCAmJiB2bm9kZXNbc3RhcnRdID09IG51bGwpIHN0YXJ0Kytcblx0XHRcdFx0c3RhcnQgPSBzdGFydCA8IG9sZFN0YXJ0ID8gc3RhcnQgOiBvbGRTdGFydFxuXHRcdFx0XHRmb3IgKDsgc3RhcnQgPCBjb21tb25MZW5ndGg7IHN0YXJ0KyspIHtcblx0XHRcdFx0XHRvID0gb2xkW3N0YXJ0XVxuXHRcdFx0XHRcdHYgPSB2bm9kZXNbc3RhcnRdXG5cdFx0XHRcdFx0aWYgKG8gPT09IHYgfHwgbyA9PSBudWxsICYmIHYgPT0gbnVsbCkgY29udGludWVcblx0XHRcdFx0XHRlbHNlIGlmIChvID09IG51bGwpIGNyZWF0ZU5vZGUocGFyZW50LCB2LCBob29rcywgbnMsIGdldE5leHRTaWJsaW5nKG9sZCwgc3RhcnQgKyAxLCBvbGQubGVuZ3RoLCBuZXh0U2libGluZyksIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdGVsc2UgaWYgKHYgPT0gbnVsbCkgcmVtb3ZlTm9kZShwYXJlbnQsIG8pXG5cdFx0XHRcdFx0ZWxzZSB1cGRhdGVOb2RlKHBhcmVudCwgbywgdiwgaG9va3MsIGdldE5leHRTaWJsaW5nKG9sZCwgc3RhcnQgKyAxLCBvbGQubGVuZ3RoLCBuZXh0U2libGluZyksIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob2xkLmxlbmd0aCA+IGNvbW1vbkxlbmd0aCkgcmVtb3ZlTm9kZXMocGFyZW50LCBvbGQsIHN0YXJ0LCBvbGQubGVuZ3RoKVxuXHRcdFx0XHRpZiAodm5vZGVzLmxlbmd0aCA+IGNvbW1vbkxlbmd0aCkgY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCB2bm9kZXMubGVuZ3RoLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGtleWVkIGRpZmZcblx0XHRcdFx0bGV0IG9sZEVuZCA9IG9sZC5sZW5ndGggLSAxLCBlbmQgPSB2bm9kZXMubGVuZ3RoIC0gMSwgb2U6IGFueSwgdmU6IGFueSwgdG9wU2libGluZzogTm9kZSB8IG51bGxcblxuXHRcdFx0XHQvLyBib3R0b20tdXBcblx0XHRcdFx0d2hpbGUgKG9sZEVuZCA+PSBvbGRTdGFydCAmJiBlbmQgPj0gc3RhcnQpIHtcblx0XHRcdFx0XHRvZSA9IG9sZFtvbGRFbmRdXG5cdFx0XHRcdFx0dmUgPSB2bm9kZXNbZW5kXVxuXHRcdFx0XHRcdGlmIChvZSA9PSBudWxsIHx8IHZlID09IG51bGwgfHwgb2Uua2V5ICE9PSB2ZS5rZXkpIGJyZWFrXG5cdFx0XHRcdFx0aWYgKG9lICE9PSB2ZSkgdXBkYXRlTm9kZShwYXJlbnQsIG9lLCB2ZSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0aWYgKHZlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IHZlLmRvbVxuXHRcdFx0XHRcdG9sZEVuZC0tLCBlbmQtLVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHRvcC1kb3duXG5cdFx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdFx0byA9IG9sZFtvbGRTdGFydF1cblx0XHRcdFx0XHR2ID0gdm5vZGVzW3N0YXJ0XVxuXHRcdFx0XHRcdGlmIChvID09IG51bGwgfHwgdiA9PSBudWxsIHx8IG8ua2V5ICE9PSB2LmtleSkgYnJlYWtcblx0XHRcdFx0XHRvbGRTdGFydCsrLCBzdGFydCsrXG5cdFx0XHRcdFx0aWYgKG8gIT09IHYpIHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2LCBob29rcywgZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRTdGFydCwgb2xkRW5kICsgMSwgbmV4dFNpYmxpbmcpLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gc3dhcHMgYW5kIGxpc3QgcmV2ZXJzYWxzXG5cdFx0XHRcdHdoaWxlIChvbGRFbmQgPj0gb2xkU3RhcnQgJiYgZW5kID49IHN0YXJ0KSB7XG5cdFx0XHRcdFx0aWYgKHN0YXJ0ID09PSBlbmQpIGJyZWFrXG5cdFx0XHRcdFx0byA9IG9sZFtvbGRTdGFydF1cblx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tlbmRdXG5cdFx0XHRcdFx0b2UgPSBvbGRbb2xkRW5kXVxuXHRcdFx0XHRcdHYgPSB2bm9kZXNbc3RhcnRdXG5cdFx0XHRcdFx0aWYgKG8gPT0gbnVsbCB8fCB2ZSA9PSBudWxsIHx8IG9lID09IG51bGwgfHwgdiA9PSBudWxsIHx8IG8ua2V5ICE9PSB2ZS5rZXkgfHwgb2Uua2V5ICE9PSB2LmtleSkgYnJlYWtcblx0XHRcdFx0XHR0b3BTaWJsaW5nID0gZ2V0TmV4dFNpYmxpbmcob2xkLCBvbGRTdGFydCwgb2xkRW5kLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRtb3ZlRE9NKHBhcmVudCwgb2UsIHRvcFNpYmxpbmcpXG5cdFx0XHRcdFx0aWYgKG9lICE9PSB2KSB1cGRhdGVOb2RlKHBhcmVudCwgb2UsIHYsIGhvb2tzLCB0b3BTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0aWYgKCsrc3RhcnQgPD0gLS1lbmQpIG1vdmVET00ocGFyZW50LCBvLCBuZXh0U2libGluZylcblx0XHRcdFx0XHRpZiAobyAhPT0gdmUpIHVwZGF0ZU5vZGUocGFyZW50LCBvLCB2ZSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0aWYgKHZlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IHZlLmRvbVxuXHRcdFx0XHRcdG9sZFN0YXJ0Kys7IG9sZEVuZC0tXG5cdFx0XHRcdFx0b2UgPSBvbGRbb2xkRW5kXVxuXHRcdFx0XHRcdHZlID0gdm5vZGVzW2VuZF1cblx0XHRcdFx0XHRvID0gb2xkW29sZFN0YXJ0XVxuXHRcdFx0XHRcdHYgPSB2bm9kZXNbc3RhcnRdXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gYm90dG9tIHVwIG9uY2UgYWdhaW5cblx0XHRcdFx0d2hpbGUgKG9sZEVuZCA+PSBvbGRTdGFydCAmJiBlbmQgPj0gc3RhcnQpIHtcblx0XHRcdFx0XHRvZSA9IG9sZFtvbGRFbmRdXG5cdFx0XHRcdFx0dmUgPSB2bm9kZXNbZW5kXVxuXHRcdFx0XHRcdGlmIChvZSA9PSBudWxsIHx8IHZlID09IG51bGwgfHwgb2Uua2V5ICE9PSB2ZS5rZXkpIGJyZWFrXG5cdFx0XHRcdFx0aWYgKG9lICE9PSB2ZSkgdXBkYXRlTm9kZShwYXJlbnQsIG9lLCB2ZSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0aWYgKHZlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IHZlLmRvbVxuXHRcdFx0XHRcdG9sZEVuZC0tLCBlbmQtLVxuXHRcdFx0XHRcdG9lID0gb2xkW29sZEVuZF1cblx0XHRcdFx0XHR2ZSA9IHZub2Rlc1tlbmRdXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHN0YXJ0ID4gZW5kKSByZW1vdmVOb2RlcyhwYXJlbnQsIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCArIDEpXG5cdFx0XHRcdGVsc2UgaWYgKG9sZFN0YXJ0ID4gb2xkRW5kKSBjcmVhdGVOb2RlcyhwYXJlbnQsIHZub2Rlcywgc3RhcnQsIGVuZCArIDEsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHQvLyBpbnNwaXJlZCBieSBpdmkgaHR0cHM6Ly9naXRodWIuY29tL2l2aWpzL2l2aS8gYnkgQm9yaXMgS2F1bFxuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsTmV4dFNpYmxpbmcgPSBuZXh0U2libGluZ1xuXHRcdFx0XHRcdGxldCBwb3MgPSAyMTQ3NDgzNjQ3LCBtYXRjaGVkID0gMFxuXHRcdFx0XHRcdGNvbnN0IG9sZEluZGljZXMgPSBuZXcgQXJyYXkoZW5kIC0gc3RhcnQgKyAxKS5maWxsKC0xKVxuXHRcdFx0XHRcdGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IE9iamVjdC5jcmVhdGUobnVsbClcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmICh2bm9kZXNbaV0gIT0gbnVsbCkgbWFwW3Zub2Rlc1tpXSEua2V5IV0gPSBpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSBvbGRFbmQ7IGkgPj0gb2xkU3RhcnQ7IGktLSkge1xuXHRcdFx0XHRcdFx0b2UgPSBvbGRbaV1cblx0XHRcdFx0XHRcdGlmIChvZSA9PSBudWxsKSBjb250aW51ZVxuXHRcdFx0XHRcdFx0Y29uc3QgbmV3SW5kZXggPSBtYXBbb2Uua2V5IV1cblx0XHRcdFx0XHRcdGlmIChuZXdJbmRleCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdHBvcyA9IChuZXdJbmRleCA8IHBvcykgPyBuZXdJbmRleCA6IC0xIC8vIGJlY29tZXMgLTEgaWYgbm9kZXMgd2VyZSByZS1vcmRlcmVkXG5cdFx0XHRcdFx0XHRcdG9sZEluZGljZXNbbmV3SW5kZXggLSBzdGFydF0gPSBpXG5cdFx0XHRcdFx0XHRcdHZlID0gdm5vZGVzW25ld0luZGV4XVxuXHRcdFx0XHRcdFx0XHRvbGRbaV0gPSBudWxsXG5cdFx0XHRcdFx0XHRcdGlmIChvZSAhPT0gdmUpIHVwZGF0ZU5vZGUocGFyZW50LCBvZSwgdmUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XHRcdFx0XHRpZiAodmUgIT0gbnVsbCAmJiB2ZS5kb20gIT0gbnVsbCkgbmV4dFNpYmxpbmcgPSB2ZS5kb21cblx0XHRcdFx0XHRcdFx0bWF0Y2hlZCsrXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG5leHRTaWJsaW5nID0gb3JpZ2luYWxOZXh0U2libGluZ1xuXHRcdFx0XHRcdGlmIChtYXRjaGVkICE9PSBvbGRFbmQgLSBvbGRTdGFydCArIDEpIHJlbW92ZU5vZGVzKHBhcmVudCwgb2xkLCBvbGRTdGFydCwgb2xkRW5kICsgMSlcblx0XHRcdFx0XHRpZiAobWF0Y2hlZCA9PT0gMCkgY3JlYXRlTm9kZXMocGFyZW50LCB2bm9kZXMsIHN0YXJ0LCBlbmQgKyAxLCBob29rcywgbmV4dFNpYmxpbmcsIG5zLCBpc0h5ZHJhdGluZylcblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChwb3MgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdC8vIHRoZSBpbmRpY2VzIG9mIHRoZSBpbmRpY2VzIG9mIHRoZSBpdGVtcyB0aGF0IGFyZSBwYXJ0IG9mIHRoZVxuXHRcdFx0XHRcdFx0XHQvLyBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2UgaW4gdGhlIG9sZEluZGljZXMgbGlzdFxuXHRcdFx0XHRcdFx0XHRjb25zdCBsaXNJbmRpY2VzID0gbWFrZUxpc0luZGljZXMob2xkSW5kaWNlcylcblx0XHRcdFx0XHRcdFx0bGV0IGxpID0gbGlzSW5kaWNlcy5sZW5ndGggLSAxXG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBlbmQ7IGkgPj0gc3RhcnQ7IGktLSkge1xuXHRcdFx0XHRcdFx0XHRcdHZlID0gdm5vZGVzW2ldXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZlID09IG51bGwpIGNvbnRpbnVlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9sZEluZGljZXNbaSAtIHN0YXJ0XSA9PT0gLTEpIGNyZWF0ZU5vZGUocGFyZW50LCB2ZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAobGlzSW5kaWNlc1tsaV0gPT09IGkgLSBzdGFydCkgbGktLVxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxzZSBtb3ZlRE9NKHBhcmVudCwgdmUsIG5leHRTaWJsaW5nKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRpZiAodmUuZG9tICE9IG51bGwpIG5leHRTaWJsaW5nID0gdmUuZG9tXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBlbmQ7IGkgPj0gc3RhcnQ7IGktLSkge1xuXHRcdFx0XHRcdFx0XHRcdHZlID0gdm5vZGVzW2ldXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZlID09IG51bGwpIGNvbnRpbnVlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9sZEluZGljZXNbaSAtIHN0YXJ0XSA9PT0gLTEpIGNyZWF0ZU5vZGUocGFyZW50LCB2ZSwgaG9va3MsIG5zLCBuZXh0U2libGluZywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZlLmRvbSAhPSBudWxsKSBuZXh0U2libGluZyA9IHZlLmRvbVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZU5vZGUocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgb2xkOiBhbnksIHZub2RlOiBhbnksIGhvb2tzOiBBcnJheTwoKSA9PiB2b2lkPiwgbmV4dFNpYmxpbmc6IE5vZGUgfCBudWxsLCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Y29uc3Qgb2xkVGFnID0gb2xkLnRhZywgdGFnID0gdm5vZGUudGFnXG5cdFx0aWYgKG9sZFRhZyA9PT0gdGFnICYmIG9sZC5pcyA9PT0gdm5vZGUuaXMpIHtcblx0XHRcdHZub2RlLnN0YXRlID0gb2xkLnN0YXRlXG5cdFx0XHR2bm9kZS5ldmVudHMgPSBvbGQuZXZlbnRzXG5cdFx0XHRpZiAoc2hvdWxkTm90VXBkYXRlKHZub2RlLCBvbGQpKSByZXR1cm5cblx0XHRcdGlmICh0eXBlb2Ygb2xkVGFnID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5hdHRycywgdm5vZGUsIGhvb2tzKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHN3aXRjaCAob2xkVGFnKSB7XG5cdFx0XHRcdFx0Y2FzZSAnIyc6IHVwZGF0ZVRleHQob2xkLCB2bm9kZSk7IGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSAnPCc6IHVwZGF0ZUhUTUwocGFyZW50LCBvbGQsIHZub2RlLCBucywgbmV4dFNpYmxpbmcpOyBicmVha1xuXHRcdFx0XHRcdGNhc2UgJ1snOiB1cGRhdGVGcmFnbWVudChwYXJlbnQsIG9sZCwgdm5vZGUsIGhvb2tzLCBuZXh0U2libGluZywgbnMsIGlzSHlkcmF0aW5nKTsgYnJlYWtcblx0XHRcdFx0XHRkZWZhdWx0OiB1cGRhdGVFbGVtZW50KG9sZCwgdm5vZGUsIGhvb2tzLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgdXBkYXRlQ29tcG9uZW50KHBhcmVudCwgb2xkLCB2bm9kZSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVtb3ZlTm9kZShwYXJlbnQsIG9sZCwgdm5vZGUpIC8vIFBhc3MgbmV3IHZub2RlIGZvciBjb250ZXh0XG5cdFx0XHRjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nKVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVUZXh0KG9sZDogYW55LCB2bm9kZTogYW55KSB7XG5cdFx0aWYgKG9sZC5jaGlsZHJlbi50b1N0cmluZygpICE9PSB2bm9kZS5jaGlsZHJlbi50b1N0cmluZygpKSB7XG5cdFx0XHRvbGQuZG9tLm5vZGVWYWx1ZSA9IHZub2RlLmNoaWxkcmVuXG5cdFx0fVxuXHRcdHZub2RlLmRvbSA9IG9sZC5kb21cblx0fVxuXHRmdW5jdGlvbiB1cGRhdGVIVE1MKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIG9sZDogYW55LCB2bm9kZTogYW55LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBuZXh0U2libGluZzogTm9kZSB8IG51bGwpIHtcblx0XHRpZiAob2xkLmNoaWxkcmVuICE9PSB2bm9kZS5jaGlsZHJlbikge1xuXHRcdFx0cmVtb3ZlRE9NKHBhcmVudCwgb2xkKVxuXHRcdFx0Y3JlYXRlSFRNTChwYXJlbnQsIHZub2RlLCBucywgbmV4dFNpYmxpbmcpXG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dm5vZGUuZG9tID0gb2xkLmRvbVxuXHRcdFx0dm5vZGUuZG9tU2l6ZSA9IG9sZC5kb21TaXplXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUZyYWdtZW50KHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIG9sZDogYW55LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCwgaXNIeWRyYXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdHVwZGF0ZU5vZGVzKHBhcmVudCwgb2xkLmNoaWxkcmVuLCB2bm9kZS5jaGlsZHJlbiwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0bGV0IGRvbVNpemUgPSAwXG5cdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdHZub2RlLmRvbSA9IG51bGxcblx0XHRpZiAoY2hpbGRyZW4gIT0gbnVsbCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdFx0XHRcdGlmIChjaGlsZCAhPSBudWxsICYmIGNoaWxkLmRvbSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKHZub2RlLmRvbSA9PSBudWxsKSB2bm9kZS5kb20gPSBjaGlsZC5kb21cblx0XHRcdFx0XHRkb21TaXplICs9IGNoaWxkLmRvbVNpemUgfHwgMVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHZub2RlLmRvbVNpemUgPSBkb21TaXplXG5cdH1cblx0ZnVuY3Rpb24gdXBkYXRlRWxlbWVudChvbGQ6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkLCBpc0h5ZHJhdGluZzogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgZWxlbWVudCA9IHZub2RlLmRvbSA9IG9sZC5kb21cblx0XHRucyA9IGdldE5hbWVTcGFjZSh2bm9kZSkgfHwgbnNcblxuXHRcdGlmIChvbGQuYXR0cnMgIT0gdm5vZGUuYXR0cnMgfHwgKHZub2RlLmF0dHJzICE9IG51bGwgJiYgIWNhY2hlZEF0dHJzSXNTdGF0aWNNYXAuZ2V0KHZub2RlLmF0dHJzKSkpIHtcblx0XHRcdHVwZGF0ZUF0dHJzKHZub2RlLCBvbGQuYXR0cnMsIHZub2RlLmF0dHJzLCBucylcblx0XHR9XG5cdFx0aWYgKCFtYXliZVNldENvbnRlbnRFZGl0YWJsZSh2bm9kZSkpIHtcblx0XHRcdHVwZGF0ZU5vZGVzKGVsZW1lbnQsIG9sZC5jaGlsZHJlbiwgdm5vZGUuY2hpbGRyZW4sIGhvb2tzLCBudWxsLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUNvbXBvbmVudChwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCBvbGQ6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+LCBuZXh0U2libGluZzogTm9kZSB8IG51bGwsIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHQvLyBUcmFjayBjb21wb25lbnQgZm9yIHNpZ25hbCBkZXBlbmRlbmN5IHRyYWNraW5nXG5cdFx0Ly8gU3RvcmUgbWFwcGluZyBmcm9tIHZub2RlLnN0YXRlIHRvIHZub2RlLnRhZyAoY29tcG9uZW50IG9iamVjdCkgZm9yIHJlZHJhd1xuXHRcdGlmICh2bm9kZS5zdGF0ZSAmJiB2bm9kZS50YWcgJiYgIWlzSHlkcmF0aW5nKSB7XG5cdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvQ29tcG9uZW50ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvQ29tcG9uZW50IHx8IG5ldyBXZWFrTWFwKClcblx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Db21wb25lbnQuc2V0KHZub2RlLnN0YXRlLCB2bm9kZS50YWcpXG5cdFx0fVxuXHRcdC8vIEFsd2F5cyB0cmFjayBjb21wb25lbnQgZGVwZW5kZW5jaWVzIGZvciBzaWduYWwgdHJhY2tpbmcgKGV2ZW4gZHVyaW5nIGh5ZHJhdGlvbilcblx0XHQvLyBUaGlzIGFsbG93cyBzaWduYWxzIHRvIGtub3cgd2hpY2ggY29tcG9uZW50cyBkZXBlbmQgb24gdGhlbVxuXHRcdC8vIFdlIG9ubHkgc2tpcCBvbmluaXQgZHVyaW5nIGh5ZHJhdGlvbiwgbm90IHNpZ25hbCB0cmFja2luZ1xuXHRcdC8vIE9ubHkgc2V0IGN1cnJlbnRDb21wb25lbnQgaWYgdm5vZGUuc3RhdGUgZXhpc3RzIChpdCBtaWdodCBiZSB1bmRlZmluZWQgZm9yIHNvbWUgY29tcG9uZW50IHR5cGVzKVxuXHRcdGlmICh2bm9kZS5zdGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRzZXRDdXJyZW50Q29tcG9uZW50KHZub2RlLnN0YXRlKVxuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0dm5vZGUuaW5zdGFuY2UgPSBWbm9kZS5ub3JtYWxpemUoY2FsbEhvb2suY2FsbCh2bm9kZS5zdGF0ZS52aWV3LCB2bm9kZSkpXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmICh2bm9kZS5zdGF0ZSAhPSBudWxsKSB7XG5cdFx0XHRcdGNsZWFyQ3VycmVudENvbXBvbmVudCgpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh2bm9kZS5pbnN0YW5jZSA9PT0gdm5vZGUpIHRocm93IEVycm9yKCdBIHZpZXcgY2Fubm90IHJldHVybiB0aGUgdm5vZGUgaXQgcmVjZWl2ZWQgYXMgYXJndW1lbnQnKVxuXHRcdHVwZGF0ZUxpZmVjeWNsZSh2bm9kZS5zdGF0ZSwgdm5vZGUsIGhvb2tzKVxuXHRcdGlmICh2bm9kZS5hdHRycyAhPSBudWxsKSB1cGRhdGVMaWZlY3ljbGUodm5vZGUuYXR0cnMsIHZub2RlLCBob29rcylcblx0XHRpZiAodm5vZGUuaW5zdGFuY2UgIT0gbnVsbCkge1xuXHRcdFx0aWYgKG9sZC5pbnN0YW5jZSA9PSBudWxsKSBjcmVhdGVOb2RlKHBhcmVudCwgdm5vZGUuaW5zdGFuY2UsIGhvb2tzLCBucywgbmV4dFNpYmxpbmcsIGlzSHlkcmF0aW5nKVxuXHRcdFx0ZWxzZSB1cGRhdGVOb2RlKHBhcmVudCwgb2xkLmluc3RhbmNlLCB2bm9kZS5pbnN0YW5jZSwgaG9va3MsIG5leHRTaWJsaW5nLCBucywgaXNIeWRyYXRpbmcpXG5cdFx0XHR2bm9kZS5kb20gPSB2bm9kZS5pbnN0YW5jZS5kb21cblx0XHRcdHZub2RlLmRvbVNpemUgPSB2bm9kZS5pbnN0YW5jZS5kb21TaXplXG5cdFx0XHRcblx0XHRcdC8vIFN0b3JlIGNvbXBvbmVudCdzIERPTSBlbGVtZW50IGZvciBmaW5lLWdyYWluZWQgcmVkcmF3IChub3QgZHVyaW5nIGh5ZHJhdGlvbilcblx0XHRcdGlmICh2bm9kZS5zdGF0ZSAmJiB2bm9kZS5kb20gJiYgIWlzSHlkcmF0aW5nKSB7XG5cdFx0XHRcdDsoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fbWl0aHJpbFN0YXRlVG9Eb20gfHwgbmV3IFdlYWtNYXAoKVxuXHRcdFx0XHQ7KGdsb2JhbFRoaXMgYXMgYW55KS5fX21pdGhyaWxTdGF0ZVRvRG9tLnNldCh2bm9kZS5zdGF0ZSwgdm5vZGUuZG9tKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmIChvbGQuaW5zdGFuY2UgIT0gbnVsbCkgcmVtb3ZlTm9kZShwYXJlbnQsIG9sZC5pbnN0YW5jZSlcblx0XHRcdHZub2RlLmRvbVNpemUgPSAwXG5cdFx0fVxuXHR9XG5cdC8vIExpZnRlZCBmcm9tIGl2aSBodHRwczovL2dpdGh1Yi5jb20vaXZpanMvaXZpL1xuXHQvLyB0YWtlcyBhIGxpc3Qgb2YgdW5pcXVlIG51bWJlcnMgKC0xIGlzIHNwZWNpYWwgYW5kIGNhblxuXHQvLyBvY2N1ciBtdWx0aXBsZSB0aW1lcykgYW5kIHJldHVybnMgYW4gYXJyYXkgd2l0aCB0aGUgaW5kaWNlc1xuXHQvLyBvZiB0aGUgaXRlbXMgdGhhdCBhcmUgcGFydCBvZiB0aGUgbG9uZ2VzdCBpbmNyZWFzaW5nXG5cdC8vIHN1YnNlcXVlbmNlXG5cdGNvbnN0IGxpc1RlbXA6IG51bWJlcltdID0gW11cblx0ZnVuY3Rpb24gbWFrZUxpc0luZGljZXMoYTogbnVtYmVyW10pOiBudW1iZXJbXSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gWzBdXG5cdFx0bGV0IHUgPSAwLCB2ID0gMFxuXHRcdGNvbnN0IGlsID0gbGlzVGVtcC5sZW5ndGggPSBhLmxlbmd0aFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaWw7IGkrKykgbGlzVGVtcFtpXSA9IGFbaV1cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlsOyArK2kpIHtcblx0XHRcdGlmIChhW2ldID09PSAtMSkgY29udGludWVcblx0XHRcdGNvbnN0IGogPSByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdXG5cdFx0XHRpZiAoYVtqXSA8IGFbaV0pIHtcblx0XHRcdFx0bGlzVGVtcFtpXSA9IGpcblx0XHRcdFx0cmVzdWx0LnB1c2goaSlcblx0XHRcdFx0Y29udGludWVcblx0XHRcdH1cblx0XHRcdHUgPSAwXG5cdFx0XHR2ID0gcmVzdWx0Lmxlbmd0aCAtIDFcblx0XHRcdHdoaWxlICh1IDwgdikge1xuXHRcdFx0XHQvLyBGYXN0IGludGVnZXIgYXZlcmFnZSB3aXRob3V0IG92ZXJmbG93LlxuXHRcdFx0XHQgXG5cdFx0XHRcdGNvbnN0IGMgPSAodSA+Pj4gMSkgKyAodiA+Pj4gMSkgKyAodSAmIHYgJiAxKVxuXHRcdFx0XHRpZiAoYVtyZXN1bHRbY11dIDwgYVtpXSkge1xuXHRcdFx0XHRcdHUgPSBjICsgMVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHYgPSBjXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhW2ldIDwgYVtyZXN1bHRbdV1dKSB7XG5cdFx0XHRcdGlmICh1ID4gMCkgbGlzVGVtcFtpXSA9IHJlc3VsdFt1IC0gMV1cblx0XHRcdFx0cmVzdWx0W3VdID0gaVxuXHRcdFx0fVxuXHRcdH1cblx0XHR1ID0gcmVzdWx0Lmxlbmd0aFxuXHRcdHYgPSByZXN1bHRbdSAtIDFdXG5cdFx0d2hpbGUgKHUtLSA+IDApIHtcblx0XHRcdHJlc3VsdFt1XSA9IHZcblx0XHRcdHYgPSBsaXNUZW1wW3ZdXG5cdFx0fVxuXHRcdGxpc1RlbXAubGVuZ3RoID0gMFxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdGZ1bmN0aW9uIGdldE5leHRTaWJsaW5nKHZub2RlczogKFZub2RlVHlwZSB8IG51bGwpW10sIGk6IG51bWJlciwgZW5kOiBudW1iZXIsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCk6IE5vZGUgfCBudWxsIHtcblx0XHRmb3IgKDsgaSA8IGVuZDsgaSsrKSB7XG5cdFx0XHRpZiAodm5vZGVzW2ldICE9IG51bGwgJiYgdm5vZGVzW2ldIS5kb20gIT0gbnVsbCkgcmV0dXJuIHZub2Rlc1tpXSEuZG9tIVxuXHRcdH1cblx0XHRyZXR1cm4gbmV4dFNpYmxpbmdcblx0fVxuXG5cdC8vIFRoaXMgaGFuZGxlcyBmcmFnbWVudHMgd2l0aCB6b21iaWUgY2hpbGRyZW4gKHJlbW92ZWQgZnJvbSB2ZG9tLCBidXQgcGVyc2lzdGVkIGluIERPTSB0aHJvdWdoIG9uYmVmb3JlcmVtb3ZlKVxuXHRmdW5jdGlvbiBtb3ZlRE9NKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCkge1xuXHRcdGlmICh2bm9kZS5kb20gIT0gbnVsbCkge1xuXHRcdFx0bGV0IHRhcmdldDogTm9kZVxuXHRcdFx0aWYgKHZub2RlLmRvbVNpemUgPT0gbnVsbCB8fCB2bm9kZS5kb21TaXplID09PSAxKSB7XG5cdFx0XHRcdC8vIGRvbid0IGFsbG9jYXRlIGZvciB0aGUgY29tbW9uIGNhc2Vcblx0XHRcdFx0dGFyZ2V0ID0gdm5vZGUuZG9tXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXJnZXQgPSBnZXREb2N1bWVudChwYXJlbnQgYXMgRWxlbWVudCkuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdFx0XHRcdGZvciAoY29uc3QgZG9tIG9mIGRvbUZvcih2bm9kZSkpIHRhcmdldC5hcHBlbmRDaGlsZChkb20pXG5cdFx0XHR9XG5cdFx0XHRpbnNlcnRET00ocGFyZW50LCB0YXJnZXQsIG5leHRTaWJsaW5nKVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGluc2VydERPTShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCBkb206IE5vZGUsIG5leHRTaWJsaW5nOiBOb2RlIHwgbnVsbCkge1xuXHRcdGlmIChuZXh0U2libGluZyAhPSBudWxsKSBwYXJlbnQuaW5zZXJ0QmVmb3JlKGRvbSwgbmV4dFNpYmxpbmcpXG5cdFx0ZWxzZSBwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tKVxuXHR9XG5cblx0ZnVuY3Rpb24gbWF5YmVTZXRDb250ZW50RWRpdGFibGUodm5vZGU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdGlmICh2bm9kZS5hdHRycyA9PSBudWxsIHx8IChcblx0XHRcdHZub2RlLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA9PSBudWxsICYmIC8vIGF0dHJpYnV0ZVxuXHRcdFx0dm5vZGUuYXR0cnMuY29udGVudEVkaXRhYmxlID09IG51bGwgLy8gcHJvcGVydHlcblx0XHQpKSByZXR1cm4gZmFsc2Vcblx0XHRjb25zdCBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cdFx0aWYgKGNoaWxkcmVuICE9IG51bGwgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdLnRhZyA9PT0gJzwnKSB7XG5cdFx0XHRjb25zdCBjb250ZW50ID0gY2hpbGRyZW5bMF0uY2hpbGRyZW5cblx0XHRcdGlmICh2bm9kZS5kb20uaW5uZXJIVE1MICE9PSBjb250ZW50KSB2bm9kZS5kb20uaW5uZXJIVE1MID0gY29udGVudFxuXHRcdH1cblx0XHRlbHNlIGlmIChjaGlsZHJlbiAhPSBudWxsICYmIGNoaWxkcmVuLmxlbmd0aCAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKCdDaGlsZCBub2RlIG9mIGEgY29udGVudGVkaXRhYmxlIG11c3QgYmUgdHJ1c3RlZC4nKVxuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHQvLyByZW1vdmVcblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZXMocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGVzOiAoVm5vZGVUeXBlIHwgbnVsbClbXSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpIHtcblx0XHRmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuXHRcdFx0Y29uc3Qgdm5vZGUgPSB2bm9kZXNbaV1cblx0XHRcdGlmICh2bm9kZSAhPSBudWxsKSByZW1vdmVOb2RlKHBhcmVudCwgdm5vZGUpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHRyeUJsb2NrUmVtb3ZlKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIHNvdXJjZTogYW55LCBjb3VudGVyOiB7djogbnVtYmVyfSkge1xuXHRcdGNvbnN0IG9yaWdpbmFsID0gdm5vZGUuc3RhdGVcblx0XHRjb25zdCByZXN1bHQgPSBjYWxsSG9vay5jYWxsKHNvdXJjZS5vbmJlZm9yZXJlbW92ZSwgdm5vZGUpXG5cdFx0aWYgKHJlc3VsdCA9PSBudWxsKSByZXR1cm5cblxuXHRcdGNvbnN0IGdlbmVyYXRpb24gPSBjdXJyZW50UmVuZGVyXG5cdFx0Zm9yIChjb25zdCBkb20gb2YgZG9tRm9yKHZub2RlKSkgZGVsYXllZFJlbW92YWwuc2V0KGRvbSwgZ2VuZXJhdGlvbilcblx0XHRjb3VudGVyLnYrK1xuXG5cdFx0UHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkuZmluYWxseShmdW5jdGlvbigpIHtcblx0XHRcdGNoZWNrU3RhdGUodm5vZGUsIG9yaWdpbmFsKVxuXHRcdFx0dHJ5UmVzdW1lUmVtb3ZlKHBhcmVudCwgdm5vZGUsIGNvdW50ZXIpXG5cdFx0fSlcblx0fVxuXHRmdW5jdGlvbiB0cnlSZXN1bWVSZW1vdmUocGFyZW50OiBFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCwgdm5vZGU6IGFueSwgY291bnRlcjoge3Y6IG51bWJlcn0sIG5ld1Zub2RlPzogYW55KSB7XG5cdFx0aWYgKC0tY291bnRlci52ID09PSAwKSB7XG5cdFx0XHRvbnJlbW92ZSh2bm9kZSlcblx0XHRcdHJlbW92ZURPTShwYXJlbnQsIHZub2RlLCBuZXdWbm9kZSlcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlTm9kZShwYXJlbnQ6IEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LCB2bm9kZTogYW55LCBuZXdWbm9kZT86IGFueSkge1xuXHRcdGNvbnN0IGNvdW50ZXIgPSB7djogMX1cblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZub2RlLnN0YXRlLm9uYmVmb3JlcmVtb3ZlID09PSAnZnVuY3Rpb24nKSB0cnlCbG9ja1JlbW92ZShwYXJlbnQsIHZub2RlLCB2bm9kZS5zdGF0ZSwgY291bnRlcilcblx0XHRpZiAodm5vZGUuYXR0cnMgJiYgdHlwZW9mIHZub2RlLmF0dHJzLm9uYmVmb3JlcmVtb3ZlID09PSAnZnVuY3Rpb24nKSB0cnlCbG9ja1JlbW92ZShwYXJlbnQsIHZub2RlLCB2bm9kZS5hdHRycywgY291bnRlcilcblx0XHR0cnlSZXN1bWVSZW1vdmUocGFyZW50LCB2bm9kZSwgY291bnRlciwgbmV3Vm5vZGUpXG5cdH1cblx0ZnVuY3Rpb24gcmVtb3ZlRE9NKHBhcmVudDogRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsIHZub2RlOiBhbnksIG5ld1Zub2RlPzogYW55KSB7XG5cdFx0aWYgKHZub2RlLmRvbSA9PSBudWxsKSByZXR1cm5cblx0XHRpZiAodm5vZGUuZG9tU2l6ZSA9PSBudWxsIHx8IHZub2RlLmRvbVNpemUgPT09IDEpIHtcblx0XHRcdC8vIENoZWNrIGlmIG5vZGUgaXMgc3RpbGwgYSBjaGlsZCBiZWZvcmUgYXR0ZW1wdGluZyByZW1vdmFsXG5cdFx0XHRjb25zdCBub2RlID0gdm5vZGUuZG9tXG5cdFx0XHRpZiAocGFyZW50LmNvbnRhaW5zICYmIHBhcmVudC5jb250YWlucyhub2RlKSkge1xuXHRcdFx0XHQvLyBWZXJpZnkgbm9kZSBpcyBhY3R1YWxseSBhIGRpcmVjdCBvciBpbmRpcmVjdCBjaGlsZFxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZChub2RlKVxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRjb25zdCBlcnJvciA9IGUgYXMgRXJyb3Jcblx0XHRcdFx0XHQvLyBDaGVjayBpZiBub2RlIHdhcyBhbHJlYWR5IHJlbW92ZWQgKG5vdCBhIGNoaWxkIGFueW1vcmUpXG5cdFx0XHRcdFx0aWYgKCFwYXJlbnQuY29udGFpbnMgfHwgIXBhcmVudC5jb250YWlucyhub2RlKSkge1xuXHRcdFx0XHRcdFx0Ly8gTm9kZSBhbHJlYWR5IHJlbW92ZWQsIHNraXAgc2lsZW50bHlcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsb2dIeWRyYXRpb25FcnJvcihcblx0XHRcdFx0XHRcdCdyZW1vdmVET00gKHNpbmdsZSBub2RlKScsXG5cdFx0XHRcdFx0XHR2bm9kZSxcblx0XHRcdFx0XHRcdHBhcmVudCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBwYXJlbnQgOiBudWxsLFxuXHRcdFx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdFx0XHR7cGFyZW50OiBwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogdW5kZWZpbmVkLCBub2RlOiB2bm9kZS5kb20sIG9sZFZub2RlOiB2bm9kZSwgbmV3Vm5vZGU6IG5ld1Zub2RlfSxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgcmUtdGhyb3cgLSB3ZSd2ZSBhbHJlYWR5IGxvZ2dlZCB0aGUgZXJyb3Igd2l0aCBhbGwgZGV0YWlsc1xuXHRcdFx0XHRcdC8vIFJlLXRocm93aW5nIGNhdXNlcyB0aGUgYnJvd3NlciB0byBsb2cgdGhlIERPTUV4Y2VwdGlvbiBzdGFjayB0cmFjZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBOb2RlIG5vdCBpbiBwYXJlbnQsIGFscmVhZHkgcmVtb3ZlZCAtIHNraXAgc2lsZW50bHlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChjb25zdCBkb20gb2YgZG9tRm9yKHZub2RlKSkge1xuXHRcdFx0XHQvLyBDaGVjayBpZiBub2RlIGlzIHN0aWxsIGEgY2hpbGQgYmVmb3JlIGF0dGVtcHRpbmcgcmVtb3ZhbFxuXHRcdFx0XHRpZiAocGFyZW50LmNvbnRhaW5zICYmIHBhcmVudC5jb250YWlucyhkb20pKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZChkb20pXG5cdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBlcnJvciA9IGUgYXMgRXJyb3Jcblx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIG5vZGUgd2FzIGFscmVhZHkgcmVtb3ZlZCAobm90IGEgY2hpbGQgYW55bW9yZSlcblx0XHRcdFx0XHRcdGlmICghcGFyZW50LmNvbnRhaW5zIHx8ICFwYXJlbnQuY29udGFpbnMoZG9tKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBOb2RlIGFscmVhZHkgcmVtb3ZlZCwgc2tpcCBzaWxlbnRseVxuXHRcdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bG9nSHlkcmF0aW9uRXJyb3IoXG5cdFx0XHRcdFx0XHRcdCdyZW1vdmVET00gKG11bHRpcGxlIG5vZGVzKScsXG5cdFx0XHRcdFx0XHRcdHZub2RlLFxuXHRcdFx0XHRcdFx0XHRwYXJlbnQgaW5zdGFuY2VvZiBFbGVtZW50ID8gcGFyZW50IDogbnVsbCxcblx0XHRcdFx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdFx0XHRcdHtwYXJlbnQ6IHBhcmVudCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBwYXJlbnQgOiB1bmRlZmluZWQsIG5vZGU6IGRvbSwgb2xkVm5vZGU6IHZub2RlLCBuZXdWbm9kZTogbmV3Vm5vZGV9LFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0Ly8gRG9uJ3QgcmUtdGhyb3cgLSB3ZSd2ZSBhbHJlYWR5IGxvZ2dlZCB0aGUgZXJyb3Igd2l0aCBhbGwgZGV0YWlsc1xuXHRcdFx0XHRcdFx0Ly8gUmUtdGhyb3dpbmcgY2F1c2VzIHRoZSBicm93c2VyIHRvIGxvZyB0aGUgRE9NRXhjZXB0aW9uIHN0YWNrIHRyYWNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIE5vZGUgbm90IGluIHBhcmVudCwgYWxyZWFkeSByZW1vdmVkIC0gc2tpcCBzaWxlbnRseVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9ucmVtb3ZlKHZub2RlOiBhbnkpIHtcblx0XHQvLyBDbGVhbiB1cCBzaWduYWwgZGVwZW5kZW5jaWVzIHdoZW4gY29tcG9uZW50IGlzIHJlbW92ZWRcblx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycgJiYgdm5vZGUuc3RhdGUgIT0gbnVsbCkge1xuXHRcdFx0Y2xlYXJDb21wb25lbnREZXBlbmRlbmNpZXModm5vZGUuc3RhdGUpXG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnICE9PSAnc3RyaW5nJyAmJiB0eXBlb2Ygdm5vZGUuc3RhdGUub25yZW1vdmUgPT09ICdmdW5jdGlvbicpIGNhbGxIb29rLmNhbGwodm5vZGUuc3RhdGUub25yZW1vdmUsIHZub2RlKVxuXHRcdGlmICh2bm9kZS5hdHRycyAmJiB0eXBlb2Ygdm5vZGUuYXR0cnMub25yZW1vdmUgPT09ICdmdW5jdGlvbicpIGNhbGxIb29rLmNhbGwodm5vZGUuYXR0cnMub25yZW1vdmUsIHZub2RlKVxuXHRcdGlmICh0eXBlb2Ygdm5vZGUudGFnICE9PSAnc3RyaW5nJykge1xuXHRcdFx0aWYgKHZub2RlLmluc3RhbmNlICE9IG51bGwpIG9ucmVtb3ZlKHZub2RlLmluc3RhbmNlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodm5vZGUuZXZlbnRzICE9IG51bGwpIHZub2RlLmV2ZW50cy5fID0gbnVsbFxuXHRcdFx0Y29uc3QgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdFx0XHRcdFx0aWYgKGNoaWxkICE9IG51bGwpIG9ucmVtb3ZlKGNoaWxkKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gYXR0cnNcblx0ZnVuY3Rpb24gc2V0QXR0cnModm5vZGU6IGFueSwgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4sIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBhdHRycykge1xuXHRcdFx0c2V0QXR0cih2bm9kZSwga2V5LCBudWxsLCBhdHRyc1trZXldLCBucylcblx0XHR9XG5cdH1cblx0ZnVuY3Rpb24gc2V0QXR0cih2bm9kZTogYW55LCBrZXk6IHN0cmluZywgb2xkOiBhbnksIHZhbHVlOiBhbnksIG5zOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0XHRpZiAoa2V5ID09PSAna2V5JyB8fCB2YWx1ZSA9PSBudWxsIHx8IGlzTGlmZWN5Y2xlTWV0aG9kKGtleSkgfHwgKG9sZCA9PT0gdmFsdWUgJiYgIWlzRm9ybUF0dHJpYnV0ZSh2bm9kZSwga2V5KSkgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgcmV0dXJuXG5cdFx0aWYgKGtleVswXSA9PT0gJ28nICYmIGtleVsxXSA9PT0gJ24nKSByZXR1cm4gdXBkYXRlRXZlbnQodm5vZGUsIGtleSwgdmFsdWUpXG5cdFx0aWYgKGtleS5zbGljZSgwLCA2KSA9PT0gJ3hsaW5rOicpIHZub2RlLmRvbS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIGtleS5zbGljZSg2KSwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB1cGRhdGVTdHlsZSh2bm9kZS5kb20sIG9sZCwgdmFsdWUpXG5cdFx0ZWxzZSBpZiAoaGFzUHJvcGVydHlLZXkodm5vZGUsIGtleSwgbnMpKSB7XG5cdFx0XHRpZiAoa2V5ID09PSAndmFsdWUnKSB7XG5cdFx0XHRcdC8vIE9ubHkgZG8gdGhlIGNvZXJjaW9uIGlmIHdlJ3JlIGFjdHVhbGx5IGdvaW5nIHRvIGNoZWNrIHRoZSB2YWx1ZS5cblx0XHRcdFx0Ly8gc2V0dGluZyBpbnB1dFt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSBieSB0eXBpbmcgb24gZm9jdXNlZCBlbGVtZW50IG1vdmVzIGN1cnNvciB0byBlbmQgaW4gQ2hyb21lXG5cdFx0XHRcdC8vIHNldHRpbmcgaW5wdXRbdHlwZT1maWxlXVt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSBjYXVzZXMgYW4gZXJyb3IgdG8gYmUgZ2VuZXJhdGVkIGlmIGl0J3Mgbm9uLWVtcHR5XG5cdFx0XHRcdC8vIG1pbmxlbmd0aC9tYXhsZW5ndGggdmFsaWRhdGlvbiBpc24ndCBwZXJmb3JtZWQgb24gc2NyaXB0LXNldCB2YWx1ZXMoIzIyNTYpXG5cdFx0XHRcdGlmICgodm5vZGUudGFnID09PSAnaW5wdXQnIHx8IHZub2RlLnRhZyA9PT0gJ3RleHRhcmVhJykgJiYgdm5vZGUuZG9tLnZhbHVlID09PSAnJyArIHZhbHVlKSByZXR1cm5cblx0XHRcdFx0Ly8gc2V0dGluZyBzZWxlY3RbdmFsdWVdIHRvIHNhbWUgdmFsdWUgd2hpbGUgaGF2aW5nIHNlbGVjdCBvcGVuIGJsaW5rcyBzZWxlY3QgZHJvcGRvd24gaW4gQ2hyb21lXG5cdFx0XHRcdGlmICh2bm9kZS50YWcgPT09ICdzZWxlY3QnICYmIG9sZCAhPT0gbnVsbCAmJiB2bm9kZS5kb20udmFsdWUgPT09ICcnICsgdmFsdWUpIHJldHVyblxuXHRcdFx0XHQvLyBzZXR0aW5nIG9wdGlvblt2YWx1ZV0gdG8gc2FtZSB2YWx1ZSB3aGlsZSBoYXZpbmcgc2VsZWN0IG9wZW4gYmxpbmtzIHNlbGVjdCBkcm9wZG93biBpbiBDaHJvbWVcblx0XHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gJ29wdGlvbicgJiYgb2xkICE9PSBudWxsICYmIHZub2RlLmRvbS52YWx1ZSA9PT0gJycgKyB2YWx1ZSkgcmV0dXJuXG5cdFx0XHRcdC8vIHNldHRpbmcgaW5wdXRbdHlwZT1maWxlXVt2YWx1ZV0gdG8gZGlmZmVyZW50IHZhbHVlIGlzIGFuIGVycm9yIGlmIGl0J3Mgbm9uLWVtcHR5XG5cdFx0XHRcdC8vIE5vdCBpZGVhbCwgYnV0IGl0IGF0IGxlYXN0IHdvcmtzIGFyb3VuZCB0aGUgbW9zdCBjb21tb24gc291cmNlIG9mIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgZm9yIG5vdy5cblx0XHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gJ2lucHV0JyAmJiB2bm9kZS5hdHRycy50eXBlID09PSAnZmlsZScgJiYgJycgKyB2YWx1ZSAhPT0gJycpIHsgY29uc29sZS5lcnJvcignYHZhbHVlYCBpcyByZWFkLW9ubHkgb24gZmlsZSBpbnB1dHMhJyk7IHJldHVybiB9XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiB5b3UgYXNzaWduIGFuIGlucHV0IHR5cGUgdGhhdCBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFIDExIHdpdGggYW4gYXNzaWdubWVudCBleHByZXNzaW9uLCBhbiBlcnJvciB3aWxsIG9jY3VyLlxuXHRcdFx0aWYgKHZub2RlLnRhZyA9PT0gJ2lucHV0JyAmJiBrZXkgPT09ICd0eXBlJykgdm5vZGUuZG9tLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKVxuXHRcdFx0ZWxzZSB2bm9kZS5kb21ba2V5XSA9IHZhbHVlXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuXHRcdFx0XHRpZiAodmFsdWUpIHZub2RlLmRvbS5zZXRBdHRyaWJ1dGUoa2V5LCAnJylcblx0XHRcdFx0ZWxzZSB2bm9kZS5kb20ucmVtb3ZlQXR0cmlidXRlKGtleSlcblx0XHRcdH1cblx0XHRcdGVsc2Ugdm5vZGUuZG9tLnNldEF0dHJpYnV0ZShrZXkgPT09ICdjbGFzc05hbWUnID8gJ2NsYXNzJyA6IGtleSwgdmFsdWUpXG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIHJlbW92ZUF0dHIodm5vZGU6IGFueSwga2V5OiBzdHJpbmcsIG9sZDogYW55LCBuczogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGtleSA9PT0gJ2tleScgfHwgb2xkID09IG51bGwgfHwgaXNMaWZlY3ljbGVNZXRob2Qoa2V5KSkgcmV0dXJuXG5cdFx0aWYgKGtleVswXSA9PT0gJ28nICYmIGtleVsxXSA9PT0gJ24nKSB1cGRhdGVFdmVudCh2bm9kZSwga2V5LCB1bmRlZmluZWQpXG5cdFx0ZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB1cGRhdGVTdHlsZSh2bm9kZS5kb20sIG9sZCwgbnVsbClcblx0XHRlbHNlIGlmIChcblx0XHRcdGhhc1Byb3BlcnR5S2V5KHZub2RlLCBrZXksIG5zKVxuXHRcdFx0JiYga2V5ICE9PSAnY2xhc3NOYW1lJ1xuXHRcdFx0JiYga2V5ICE9PSAndGl0bGUnIC8vIGNyZWF0ZXMgXCJudWxsXCIgYXMgdGl0bGVcblx0XHRcdCYmICEoa2V5ID09PSAndmFsdWUnICYmIChcblx0XHRcdFx0dm5vZGUudGFnID09PSAnb3B0aW9uJ1xuXHRcdFx0XHR8fCB2bm9kZS50YWcgPT09ICdzZWxlY3QnICYmIHZub2RlLmRvbS5zZWxlY3RlZEluZGV4ID09PSAtMSAmJiB2bm9kZS5kb20gPT09IGFjdGl2ZUVsZW1lbnQodm5vZGUuZG9tKVxuXHRcdFx0KSlcblx0XHRcdCYmICEodm5vZGUudGFnID09PSAnaW5wdXQnICYmIGtleSA9PT0gJ3R5cGUnKVxuXHRcdCkge1xuXHRcdFx0dm5vZGUuZG9tW2tleV0gPSBudWxsXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG5zTGFzdEluZGV4ID0ga2V5LmluZGV4T2YoJzonKVxuXHRcdFx0aWYgKG5zTGFzdEluZGV4ICE9PSAtMSkga2V5ID0ga2V5LnNsaWNlKG5zTGFzdEluZGV4ICsgMSlcblx0XHRcdGlmIChvbGQgIT09IGZhbHNlKSB2bm9kZS5kb20ucmVtb3ZlQXR0cmlidXRlKGtleSA9PT0gJ2NsYXNzTmFtZScgPyAnY2xhc3MnIDoga2V5KVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBzZXRMYXRlU2VsZWN0QXR0cnModm5vZGU6IGFueSwgYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcblx0XHRpZiAoJ3ZhbHVlJyBpbiBhdHRycykge1xuXHRcdFx0aWYgKGF0dHJzLnZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdGlmICh2bm9kZS5kb20uc2VsZWN0ZWRJbmRleCAhPT0gLTEpIHZub2RlLmRvbS52YWx1ZSA9IG51bGxcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5vcm1hbGl6ZWQgPSAnJyArIGF0dHJzLnZhbHVlXG5cdFx0XHRcdGlmICh2bm9kZS5kb20udmFsdWUgIT09IG5vcm1hbGl6ZWQgfHwgdm5vZGUuZG9tLnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG5cdFx0XHRcdFx0dm5vZGUuZG9tLnZhbHVlID0gbm9ybWFsaXplZFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICgnc2VsZWN0ZWRJbmRleCcgaW4gYXR0cnMpIHNldEF0dHIodm5vZGUsICdzZWxlY3RlZEluZGV4JywgbnVsbCwgYXR0cnMuc2VsZWN0ZWRJbmRleCwgdW5kZWZpbmVkKVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUF0dHJzKHZub2RlOiBhbnksIG9sZDogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCwgbnM6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdC8vIFNvbWUgYXR0cmlidXRlcyBtYXkgTk9UIGJlIGNhc2Utc2Vuc2l0aXZlIChlLmcuIGRhdGEtKioqKSxcblx0XHQvLyBzbyByZW1vdmFsIHNob3VsZCBiZSBkb25lIGZpcnN0IHRvIHByZXZlbnQgYWNjaWRlbnRhbCByZW1vdmFsIGZvciBuZXdseSBzZXR0aW5nIHZhbHVlcy5cblx0XHRsZXQgdmFsOiBhbnlcblx0XHRpZiAob2xkICE9IG51bGwpIHtcblx0XHRcdGlmIChvbGQgPT09IGF0dHJzICYmICFjYWNoZWRBdHRyc0lzU3RhdGljTWFwLmhhcyhhdHRycyEpKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybignRG9uXFwndCByZXVzZSBhdHRycyBvYmplY3QsIHVzZSBuZXcgb2JqZWN0IGZvciBldmVyeSByZWRyYXcsIHRoaXMgd2lsbCB0aHJvdyBpbiBuZXh0IG1ham9yJylcblx0XHRcdH1cblx0XHRcdGZvciAoY29uc3Qga2V5IGluIG9sZCkge1xuXHRcdFx0XHRpZiAoKCh2YWwgPSBvbGRba2V5XSkgIT0gbnVsbCkgJiYgKGF0dHJzID09IG51bGwgfHwgYXR0cnNba2V5XSA9PSBudWxsKSkge1xuXHRcdFx0XHRcdHJlbW92ZUF0dHIodm5vZGUsIGtleSwgdmFsLCBucylcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoYXR0cnMgIT0gbnVsbCkge1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcblx0XHRcdFx0c2V0QXR0cih2bm9kZSwga2V5LCBvbGQgJiYgb2xkW2tleV0sIGF0dHJzW2tleV0sIG5zKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBpc0Zvcm1BdHRyaWJ1dGUodm5vZGU6IGFueSwgYXR0cjogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGF0dHIgPT09ICd2YWx1ZScgfHwgYXR0ciA9PT0gJ2NoZWNrZWQnIHx8IGF0dHIgPT09ICdzZWxlY3RlZEluZGV4JyB8fCBhdHRyID09PSAnc2VsZWN0ZWQnICYmICh2bm9kZS5kb20gPT09IGFjdGl2ZUVsZW1lbnQodm5vZGUuZG9tKSB8fCB2bm9kZS50YWcgPT09ICdvcHRpb24nICYmIHZub2RlLmRvbS5wYXJlbnROb2RlID09PSBhY3RpdmVFbGVtZW50KHZub2RlLmRvbSkpXG5cdH1cblx0ZnVuY3Rpb24gaXNMaWZlY3ljbGVNZXRob2QoYXR0cjogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGF0dHIgPT09ICdvbmluaXQnIHx8IGF0dHIgPT09ICdvbmNyZWF0ZScgfHwgYXR0ciA9PT0gJ29udXBkYXRlJyB8fCBhdHRyID09PSAnb25yZW1vdmUnIHx8IGF0dHIgPT09ICdvbmJlZm9yZXJlbW92ZScgfHwgYXR0ciA9PT0gJ29uYmVmb3JldXBkYXRlJ1xuXHR9XG5cdGZ1bmN0aW9uIGhhc1Byb3BlcnR5S2V5KHZub2RlOiBhbnksIGtleTogc3RyaW5nLCBuczogc3RyaW5nIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0Ly8gRmlsdGVyIG91dCBuYW1lc3BhY2VkIGtleXNcblx0XHRyZXR1cm4gbnMgPT09IHVuZGVmaW5lZCAmJiAoXG5cdFx0XHQvLyBJZiBpdCdzIGEgY3VzdG9tIGVsZW1lbnQsIGp1c3Qga2VlcCBpdC5cblx0XHRcdHZub2RlLnRhZy5pbmRleE9mKCctJykgPiAtMSB8fCB2bm9kZS5pcyB8fFxuXHRcdFx0Ly8gSWYgaXQncyBhIG5vcm1hbCBlbGVtZW50LCBsZXQncyB0cnkgdG8gYXZvaWQgYSBmZXcgYnJvd3NlciBidWdzLlxuXHRcdFx0a2V5ICE9PSAnaHJlZicgJiYga2V5ICE9PSAnbGlzdCcgJiYga2V5ICE9PSAnZm9ybScgJiYga2V5ICE9PSAnd2lkdGgnICYmIGtleSAhPT0gJ2hlaWdodCcvLyAmJiBrZXkgIT09IFwidHlwZVwiXG5cdFx0XHQvLyBEZWZlciB0aGUgcHJvcGVydHkgY2hlY2sgdW50aWwgKmFmdGVyKiB3ZSBjaGVjayBldmVyeXRoaW5nLlxuXHRcdCkgJiYga2V5IGluIHZub2RlLmRvbVxuXHR9XG5cblx0Ly8gc3R5bGVcblx0ZnVuY3Rpb24gdXBkYXRlU3R5bGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9sZDogYW55LCBzdHlsZTogYW55KSB7XG5cdFx0aWYgKG9sZCA9PT0gc3R5bGUpIHtcblx0XHRcdC8vIFN0eWxlcyBhcmUgZXF1aXZhbGVudCwgZG8gbm90aGluZy5cblx0XHR9IGVsc2UgaWYgKHN0eWxlID09IG51bGwpIHtcblx0XHRcdC8vIE5ldyBzdHlsZSBpcyBtaXNzaW5nLCBqdXN0IGNsZWFyIGl0LlxuXHRcdFx0ZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJydcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzdHlsZSAhPT0gJ29iamVjdCcpIHtcblx0XHRcdC8vIE5ldyBzdHlsZSBpcyBhIHN0cmluZywgbGV0IGVuZ2luZSBkZWFsIHdpdGggcGF0Y2hpbmcuXG5cdFx0XHRlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBzdHlsZVxuXHRcdH0gZWxzZSBpZiAob2xkID09IG51bGwgfHwgdHlwZW9mIG9sZCAhPT0gJ29iamVjdCcpIHtcblx0XHRcdC8vIGBvbGRgIGlzIG1pc3Npbmcgb3IgYSBzdHJpbmcsIGBzdHlsZWAgaXMgYW4gb2JqZWN0LlxuXHRcdFx0ZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gJydcblx0XHRcdC8vIEFkZCBuZXcgc3R5bGUgcHJvcGVydGllc1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gc3R5bGUpIHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzdHlsZVtrZXldXG5cdFx0XHRcdGlmICh2YWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGtleS5pbmNsdWRlcygnLScpKSBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGtleSwgU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHRlbHNlIChlbGVtZW50LnN0eWxlIGFzIGFueSlba2V5XSA9IFN0cmluZyh2YWx1ZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBCb3RoIG9sZCAmIG5ldyBhcmUgKGRpZmZlcmVudCkgb2JqZWN0cy5cblx0XHRcdC8vIFJlbW92ZSBzdHlsZSBwcm9wZXJ0aWVzIHRoYXQgbm8gbG9uZ2VyIGV4aXN0XG5cdFx0XHQvLyBTdHlsZSBwcm9wZXJ0aWVzIG1heSBoYXZlIHR3byBjYXNlcyhkYXNoLWNhc2UgYW5kIGNhbWVsQ2FzZSksXG5cdFx0XHQvLyBzbyByZW1vdmFsIHNob3VsZCBiZSBkb25lIGZpcnN0IHRvIHByZXZlbnQgYWNjaWRlbnRhbCByZW1vdmFsIGZvciBuZXdseSBzZXR0aW5nIHZhbHVlcy5cblx0XHRcdGZvciAoY29uc3Qga2V5IGluIG9sZCkge1xuXHRcdFx0XHRpZiAob2xkW2tleV0gIT0gbnVsbCAmJiBzdHlsZVtrZXldID09IG51bGwpIHtcblx0XHRcdFx0XHRpZiAoa2V5LmluY2x1ZGVzKCctJykpIGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KVxuXHRcdFx0XHRcdGVsc2UgKGVsZW1lbnQuc3R5bGUgYXMgYW55KVtrZXldID0gJydcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gVXBkYXRlIHN0eWxlIHByb3BlcnRpZXMgdGhhdCBoYXZlIGNoYW5nZWRcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIHN0eWxlKSB7XG5cdFx0XHRcdGxldCB2YWx1ZSA9IHN0eWxlW2tleV1cblx0XHRcdFx0aWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gU3RyaW5nKHZhbHVlKSkgIT09IFN0cmluZyhvbGRba2V5XSkpIHtcblx0XHRcdFx0XHRpZiAoa2V5LmluY2x1ZGVzKCctJykpIGVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSlcblx0XHRcdFx0XHRlbHNlIChlbGVtZW50LnN0eWxlIGFzIGFueSlba2V5XSA9IHZhbHVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBIZXJlJ3MgYW4gZXhwbGFuYXRpb24gb2YgaG93IHRoaXMgd29ya3M6XG5cdC8vIDEuIFRoZSBldmVudCBuYW1lcyBhcmUgYWx3YXlzIChieSBkZXNpZ24pIHByZWZpeGVkIGJ5IGBvbmAuXG5cdC8vIDIuIFRoZSBFdmVudExpc3RlbmVyIGludGVyZmFjZSBhY2NlcHRzIGVpdGhlciBhIGZ1bmN0aW9uIG9yIGFuIG9iamVjdFxuXHQvLyAgICB3aXRoIGEgYGhhbmRsZUV2ZW50YCBtZXRob2QuXG5cdC8vIDMuIFRoZSBvYmplY3QgZG9lcyBub3QgaW5oZXJpdCBmcm9tIGBPYmplY3QucHJvdG90eXBlYCwgdG8gYXZvaWRcblx0Ly8gICAgYW55IHBvdGVudGlhbCBpbnRlcmZlcmVuY2Ugd2l0aCB0aGF0IChlLmcuIHNldHRlcnMpLlxuXHQvLyA0LiBUaGUgZXZlbnQgbmFtZSBpcyByZW1hcHBlZCB0byB0aGUgaGFuZGxlciBiZWZvcmUgY2FsbGluZyBpdC5cblx0Ly8gNS4gSW4gZnVuY3Rpb24tYmFzZWQgZXZlbnQgaGFuZGxlcnMsIGBldi50YXJnZXQgPT09IHRoaXNgLiBXZSByZXBsaWNhdGVcblx0Ly8gICAgdGhhdCBiZWxvdy5cblx0Ly8gNi4gSW4gZnVuY3Rpb24tYmFzZWQgZXZlbnQgaGFuZGxlcnMsIGByZXR1cm4gZmFsc2VgIHByZXZlbnRzIHRoZSBkZWZhdWx0XG5cdC8vICAgIGFjdGlvbiBhbmQgc3RvcHMgZXZlbnQgcHJvcGFnYXRpb24uIFdlIHJlcGxpY2F0ZSB0aGF0IGJlbG93LlxuXHRmdW5jdGlvbiBFdmVudERpY3QodGhpczogYW55KSB7XG5cdFx0Ly8gU2F2ZSB0aGlzLCBzbyB0aGUgY3VycmVudCByZWRyYXcgaXMgY29ycmVjdGx5IHRyYWNrZWQuXG5cdFx0dGhpcy5fID0gY3VycmVudFJlZHJhd1xuXHR9XG5cdEV2ZW50RGljdC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cdEV2ZW50RGljdC5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbihldjogYW55KSB7XG5cdFx0Y29uc3QgaGFuZGxlciA9IHRoaXNbJ29uJyArIGV2LnR5cGVdXG5cdFx0bGV0IHJlc3VsdDogYW55XG5cdFx0aWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSByZXN1bHQgPSBoYW5kbGVyLmNhbGwoZXYuY3VycmVudFRhcmdldCwgZXYpXG5cdFx0ZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIuaGFuZGxlRXZlbnQgPT09ICdmdW5jdGlvbicpIGhhbmRsZXIuaGFuZGxlRXZlbnQoZXYpXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXNcblx0XHRpZiAoc2VsZi5fICE9IG51bGwpIHtcblx0XHRcdGlmIChldi5yZWRyYXcgIT09IGZhbHNlKSAoMCwgc2VsZi5fKSgpXG5cdFx0XHRpZiAocmVzdWx0ICE9IG51bGwgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHNlbGYuXyAhPSBudWxsICYmIGV2LnJlZHJhdyAhPT0gZmFsc2UpICgwLCBzZWxmLl8pKClcblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcblx0XHRcdGV2LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0fVxuXHR9XG5cblx0Ly8gZXZlbnRcblx0ZnVuY3Rpb24gdXBkYXRlRXZlbnQodm5vZGU6IGFueSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcblx0XHRpZiAodm5vZGUuZXZlbnRzICE9IG51bGwpIHtcblx0XHRcdHZub2RlLmV2ZW50cy5fID0gY3VycmVudFJlZHJhd1xuXHRcdFx0aWYgKHZub2RlLmV2ZW50c1trZXldID09PSB2YWx1ZSkgcmV0dXJuXG5cdFx0XHRpZiAodmFsdWUgIT0gbnVsbCAmJiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpKSB7XG5cdFx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5XSA9PSBudWxsKSB2bm9kZS5kb20uYWRkRXZlbnRMaXN0ZW5lcihrZXkuc2xpY2UoMiksIHZub2RlLmV2ZW50cywgZmFsc2UpXG5cdFx0XHRcdHZub2RlLmV2ZW50c1trZXldID0gdmFsdWVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh2bm9kZS5ldmVudHNba2V5XSAhPSBudWxsKSB2bm9kZS5kb20ucmVtb3ZlRXZlbnRMaXN0ZW5lcihrZXkuc2xpY2UoMiksIHZub2RlLmV2ZW50cywgZmFsc2UpXG5cdFx0XHRcdHZub2RlLmV2ZW50c1trZXldID0gdW5kZWZpbmVkXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSAhPSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykpIHtcblx0XHRcdHZub2RlLmV2ZW50cyA9IG5ldyAoRXZlbnREaWN0IGFzIGFueSkoKVxuXHRcdFx0dm5vZGUuZG9tLmFkZEV2ZW50TGlzdGVuZXIoa2V5LnNsaWNlKDIpLCB2bm9kZS5ldmVudHMsIGZhbHNlKVxuXHRcdFx0dm5vZGUuZXZlbnRzW2tleV0gPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8vIGxpZmVjeWNsZVxuXHRmdW5jdGlvbiBpbml0TGlmZWN5Y2xlKHNvdXJjZTogYW55LCB2bm9kZTogYW55LCBob29rczogQXJyYXk8KCkgPT4gdm9pZD4sIGlzSHlkcmF0aW5nOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHQvLyBBbHdheXMgY2FsbCBvbmluaXQsIGJ1dCBwYXNzIGNvbnRleHQgc28gY29tcG9uZW50cyBjYW4gbWFrZSBpbnRlbGxpZ2VudCBkZWNpc2lvbnNcblx0XHQvLyBDb21wb25lbnRzIGNhbiBjaGVjayBjb250ZXh0LmlzU1NSIG9yIGNvbnRleHQuaXNIeWRyYXRpbmcgdG8gY29uZGl0aW9uYWxseSBsb2FkIGRhdGFcblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmluaXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNvbnN0IGNvbnRleHQgPSB7XG5cdFx0XHRcdGlzU1NSOiBmYWxzZSxcblx0XHRcdFx0aXNIeWRyYXRpbmc6IGlzSHlkcmF0aW5nLFxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgcmVzdWx0ID0gY2FsbEhvb2suY2FsbChzb3VyY2Uub25pbml0LCB2bm9kZSwgY29udGV4dClcblx0XHRcdC8vIEF1dG8tcmVkcmF3IHdoZW4gYXN5bmMgb25pbml0IGNvbXBsZXRlcyAoY2xpZW50LXNpZGUgb25seSlcblx0XHRcdGlmIChyZXN1bHQgIT0gbnVsbCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgJiYgY3VycmVudFJlZHJhdyAhPSBudWxsKSB7XG5cdFx0XHRcdFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKGN1cnJlbnRSZWRyYXcgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvciAtIENvbW1hIG9wZXJhdG9yIGludGVudGlvbmFsbHkgdXNlZCB0byBjYWxsIHdpdGhvdXQgJ3RoaXMnIGJpbmRpbmdcblx0XHRcdFx0XHRcdCgwLCBjdXJyZW50UmVkcmF3KSgpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodHlwZW9mIHNvdXJjZS5vbmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykgaG9va3MucHVzaChjYWxsSG9vay5iaW5kKHNvdXJjZS5vbmNyZWF0ZSwgdm5vZGUpKVxuXHR9XG5cdGZ1bmN0aW9uIHVwZGF0ZUxpZmVjeWNsZShzb3VyY2U6IGFueSwgdm5vZGU6IGFueSwgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+KSB7XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2Uub251cGRhdGUgPT09ICdmdW5jdGlvbicpIGhvb2tzLnB1c2goY2FsbEhvb2suYmluZChzb3VyY2Uub251cGRhdGUsIHZub2RlKSlcblx0fVxuXHRmdW5jdGlvbiBzaG91bGROb3RVcGRhdGUodm5vZGU6IGFueSwgb2xkOiBhbnkpOiBib29sZWFuIHtcblx0XHRkbyB7XG5cdFx0XHRpZiAodm5vZGUuYXR0cnMgIT0gbnVsbCAmJiB0eXBlb2Ygdm5vZGUuYXR0cnMub25iZWZvcmV1cGRhdGUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Y29uc3QgZm9yY2UgPSBjYWxsSG9vay5jYWxsKHZub2RlLmF0dHJzLm9uYmVmb3JldXBkYXRlLCB2bm9kZSwgb2xkKVxuXHRcdFx0XHRpZiAoZm9yY2UgIT09IHVuZGVmaW5lZCAmJiAhZm9yY2UpIGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIHZub2RlLnRhZyAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIHZub2RlLnN0YXRlLm9uYmVmb3JldXBkYXRlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdGNvbnN0IGZvcmNlID0gY2FsbEhvb2suY2FsbCh2bm9kZS5zdGF0ZS5vbmJlZm9yZXVwZGF0ZSwgdm5vZGUsIG9sZClcblx0XHRcdFx0aWYgKGZvcmNlICE9PSB1bmRlZmluZWQgJiYgIWZvcmNlKSBicmVha1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fSB3aGlsZSAoZmFsc2UpICBcblx0XHR2bm9kZS5kb20gPSBvbGQuZG9tXG5cdFx0dm5vZGUuZG9tU2l6ZSA9IG9sZC5kb21TaXplXG5cdFx0dm5vZGUuaW5zdGFuY2UgPSBvbGQuaW5zdGFuY2Vcblx0XHQvLyBPbmUgd291bGQgdGhpbmsgaGF2aW5nIHRoZSBhY3R1YWwgbGF0ZXN0IGF0dHJpYnV0ZXMgd291bGQgYmUgaWRlYWwsXG5cdFx0Ly8gYnV0IGl0IGRvZXNuJ3QgbGV0IHVzIHByb3Blcmx5IGRpZmYgYmFzZWQgb24gb3VyIGN1cnJlbnQgaW50ZXJuYWxcblx0XHQvLyByZXByZXNlbnRhdGlvbi4gV2UgaGF2ZSB0byBzYXZlIG5vdCBvbmx5IHRoZSBvbGQgRE9NIGluZm8sIGJ1dCBhbHNvXG5cdFx0Ly8gdGhlIGF0dHJpYnV0ZXMgdXNlZCB0byBjcmVhdGUgaXQsIGFzIHdlIGRpZmYgKnRoYXQqLCBub3QgYWdhaW5zdCB0aGVcblx0XHQvLyBET00gZGlyZWN0bHkgKHdpdGggYSBmZXcgZXhjZXB0aW9ucyBpbiBgc2V0QXR0cmApLiBBbmQsIG9mIGNvdXJzZSwgd2Vcblx0XHQvLyBuZWVkIHRvIHNhdmUgdGhlIGNoaWxkcmVuIGFuZCB0ZXh0IGFzIHRoZXkgYXJlIGNvbmNlcHR1YWxseSBub3Rcblx0XHQvLyB1bmxpa2Ugc3BlY2lhbCBcImF0dHJpYnV0ZXNcIiBpbnRlcm5hbGx5LlxuXHRcdHZub2RlLmF0dHJzID0gb2xkLmF0dHJzXG5cdFx0dm5vZGUuY2hpbGRyZW4gPSBvbGQuY2hpbGRyZW5cblx0XHR2bm9kZS50ZXh0ID0gb2xkLnRleHRcblx0XHRyZXR1cm4gdHJ1ZVxuXHR9XG5cblx0bGV0IGN1cnJlbnRET006IEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXG5cdHJldHVybiBmdW5jdGlvbihkb206IEVsZW1lbnQsIHZub2RlczogQ2hpbGRyZW4gfCBWbm9kZVR5cGUgfCBudWxsLCByZWRyYXc/OiAoKSA9PiB2b2lkKSB7XG5cdFx0aWYgKCFkb20pIHRocm93IG5ldyBUeXBlRXJyb3IoJ0RPTSBlbGVtZW50IGJlaW5nIHJlbmRlcmVkIHRvIGRvZXMgbm90IGV4aXN0LicpXG5cdFx0aWYgKGN1cnJlbnRET00gIT0gbnVsbCAmJiBkb20uY29udGFpbnMoY3VycmVudERPTSkpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ05vZGUgaXMgY3VycmVudGx5IGJlaW5nIHJlbmRlcmVkIHRvIGFuZCB0aHVzIGlzIGxvY2tlZC4nKVxuXHRcdH1cblx0XHRjb25zdCBwcmV2UmVkcmF3ID0gY3VycmVudFJlZHJhd1xuXHRcdGNvbnN0IHByZXZET00gPSBjdXJyZW50RE9NXG5cdFx0Y29uc3QgaG9va3M6IEFycmF5PCgpID0+IHZvaWQ+ID0gW11cblx0XHRjb25zdCBhY3RpdmUgPSBhY3RpdmVFbGVtZW50KGRvbSlcblx0XHRjb25zdCBuYW1lc3BhY2UgPSBkb20ubmFtZXNwYWNlVVJJXG5cblx0XHRjdXJyZW50RE9NID0gZG9tXG5cdFx0Y3VycmVudFJlZHJhdyA9IHR5cGVvZiByZWRyYXcgPT09ICdmdW5jdGlvbicgPyByZWRyYXcgOiB1bmRlZmluZWRcblx0XHRjdXJyZW50UmVuZGVyID0ge31cblx0XHQvLyBSZXNldCBoeWRyYXRpb24gZXJyb3IgY291bnRlciBhbmQgbWlzbWF0Y2ggY291bnQgYXQgc3RhcnQgb2YgZWFjaCByZW5kZXIgY3ljbGVcblx0XHRyZXNldEh5ZHJhdGlvbkVycm9yQ291bnQoKVxuXHRcdGh5ZHJhdGlvbk1pc21hdGNoQ291bnQgPSAwXG5cdFx0dHJ5IHtcblx0XHRcdC8vIERldGVjdCBoeWRyYXRpb246IERPTSBoYXMgY2hpbGRyZW4gYnV0IG5vIHZub2RlcyB0cmFja2VkXG5cdFx0XHQvLyBPbmx5IGNoZWNrIGNoaWxkcmVuIGZvciBFbGVtZW50IG5vZGVzIChEb2N1bWVudEZyYWdtZW50IGRvZXNuJ3QgaGF2ZSBjaGlsZHJlbiBwcm9wZXJ0eSlcblx0XHRcdGxldCBpc0h5ZHJhdGluZyA9IChkb20gYXMgYW55KS52bm9kZXMgPT0gbnVsbCAmJiBcblx0XHRcdFx0ZG9tLm5vZGVUeXBlID09PSAxICYmIC8vIEVsZW1lbnQgbm9kZVxuXHRcdFx0XHQnY2hpbGRyZW4nIGluIGRvbSAmJlxuXHRcdFx0XHQoZG9tIGFzIEVsZW1lbnQpLmNoaWxkcmVuLmxlbmd0aCA+IDBcblx0XHRcdFxuXHRcdFx0Ly8gRmlyc3QgdGltZSByZW5kZXJpbmcgaW50byBhIG5vZGUgY2xlYXJzIGl0IG91dCAodW5sZXNzIGh5ZHJhdGluZylcblx0XHRcdGlmICghaXNIeWRyYXRpbmcgJiYgKGRvbSBhcyBhbnkpLnZub2RlcyA9PSBudWxsKSBkb20udGV4dENvbnRlbnQgPSAnJ1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZCA9IChWbm9kZSBhcyBhbnkpLm5vcm1hbGl6ZUNoaWxkcmVuKEFycmF5LmlzQXJyYXkodm5vZGVzKSA/IHZub2RlcyA6IFt2bm9kZXNdKVxuXHRcdFx0dXBkYXRlTm9kZXMoZG9tLCAoZG9tIGFzIGFueSkudm5vZGVzLCBub3JtYWxpemVkLCBob29rcywgbnVsbCwgKG5hbWVzcGFjZSA9PT0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnID8gdW5kZWZpbmVkIDogbmFtZXNwYWNlKSBhcyBzdHJpbmcgfCB1bmRlZmluZWQsIGlzSHlkcmF0aW5nKVxuXHRcdFx0XG5cdFx0XHQvLyBDaGVjayBpZiB3ZSd2ZSBleGNlZWRlZCBtaXNtYXRjaCB0aHJlc2hvbGQgYWZ0ZXIgcHJvY2Vzc2luZyBub2Rlc1xuXHRcdFx0Ly8gSWYgc28sIGNsZWFyIGFuZCByZS1yZW5kZXIgZnJvbSBzY3JhdGNoIChjbGllbnQgVkRPTSB3aW5zKVxuXHRcdFx0aWYgKGlzSHlkcmF0aW5nICYmIGh5ZHJhdGlvbk1pc21hdGNoQ291bnQgPiBNQVhfSFlEUkFUSU9OX01JU01BVENIRVMpIHtcblx0XHRcdFx0bG9nZ2VyLndhcm4oYEh5ZHJhdGlvbiBtaXNtYXRjaCB0aHJlc2hvbGQgZXhjZWVkZWQuIENsZWFyaW5nIHBhcmVudCBhbmQgcmUtcmVuZGVyaW5nIGZyb20gY2xpZW50IFZET00uYCwge1xuXHRcdFx0XHRcdG1pc21hdGNoQ291bnQ6IGh5ZHJhdGlvbk1pc21hdGNoQ291bnQsXG5cdFx0XHRcdFx0dGhyZXNob2xkOiBNQVhfSFlEUkFUSU9OX01JU01BVENIRVMsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGRvbS50ZXh0Q29udGVudCA9ICcnXG5cdFx0XHRcdGh5ZHJhdGlvbk1pc21hdGNoQ291bnQgPSAwXG5cdFx0XHRcdC8vIENsZWFyIG9sZCB2bm9kZXMgYW5kIHJlLXJlbmRlciB3aXRob3V0IGh5ZHJhdGlvbiBmbGFnXG5cdFx0XHRcdDsoZG9tIGFzIGFueSkudm5vZGVzID0gbnVsbFxuXHRcdFx0XHQvLyBSZS1yZW5kZXIgd2l0aCBmcmVzaCBob29rcyBhcnJheSAoaG9va3MgZnJvbSBmaXJzdCByZW5kZXIgYXJlIGRpc2NhcmRlZClcblx0XHRcdFx0Y29uc3Qgb3ZlcnJpZGVIb29rczogQXJyYXk8KCkgPT4gdm9pZD4gPSBbXVxuXHRcdFx0XHR1cGRhdGVOb2Rlcyhkb20sIG51bGwsIG5vcm1hbGl6ZWQsIG92ZXJyaWRlSG9va3MsIG51bGwsIChuYW1lc3BhY2UgPT09ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJyA/IHVuZGVmaW5lZCA6IG5hbWVzcGFjZSkgYXMgc3RyaW5nIHwgdW5kZWZpbmVkLCBmYWxzZSlcblx0XHRcdFx0Ly8gRXhlY3V0ZSBob29rcyBmcm9tIG92ZXJyaWRlIHJlbmRlclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG92ZXJyaWRlSG9va3MubGVuZ3RoOyBpKyspIG92ZXJyaWRlSG9va3NbaV0oKVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQ7KGRvbSBhcyBhbnkpLnZub2RlcyA9IG5vcm1hbGl6ZWRcblx0XHRcdC8vIGBkb2N1bWVudC5hY3RpdmVFbGVtZW50YCBjYW4gcmV0dXJuIG51bGw6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2ludGVyYWN0aW9uLmh0bWwjZG9tLWRvY3VtZW50LWFjdGl2ZWVsZW1lbnRcblx0XHRcdGlmIChhY3RpdmUgIT0gbnVsbCAmJiBhY3RpdmVFbGVtZW50KGRvbSkgIT09IGFjdGl2ZSAmJiB0eXBlb2YgKGFjdGl2ZSBhcyBhbnkpLmZvY3VzID09PSAnZnVuY3Rpb24nKSAoYWN0aXZlIGFzIGFueSkuZm9jdXMoKVxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7IGkrKykgaG9va3NbaV0oKVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRjdXJyZW50UmVkcmF3ID0gcHJldlJlZHJhd1xuXHRcdFx0Y3VycmVudERPTSA9IHByZXZET01cblx0XHR9XG5cdH1cbn1cbiIsCiAgICAiLyoqXG4gKiBJc29tb3JwaGljIG5leHRfdGljayB1dGlsaXR5XG4gKiBcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgYWZ0ZXIgdGhlIGN1cnJlbnQgZXhlY3V0aW9uIHN0YWNrIGNvbXBsZXRlcy5cbiAqIFxuICogLSBJbiBicm93c2VyOiBVc2VzIHF1ZXVlTWljcm90YXNrIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlLCBmYWxscyBiYWNrIHRvIFByb21pc2UucmVzb2x2ZSgpXG4gKiAtIEluIFNTUjogUmVzb2x2ZXMgaW1tZWRpYXRlbHkgc2luY2UgU1NSIHJlbmRlcmluZyBpcyBzeW5jaHJvbm91cyBhbmQgdGhlcmUncyBubyBldmVudCBsb29wXG4gKiBcbiAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyBvbiB0aGUgbmV4dCB0aWNrXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbmFzeW5jIGZ1bmN0aW9uIG5leHRfdGljaygpOiBQcm9taXNlPHZvaWQ+IHtcblx0Ly8gQ2hlY2sgaWYgd2UncmUgaW4gU1NSIG1vZGVcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fU1NSX01PREVfXykge1xuXHRcdC8vIEluIFNTUiBtb2RlLCByZXNvbHZlIGltbWVkaWF0ZWx5IHNpbmNlIFNTUiByZW5kZXJpbmcgaXMgc3luY2hyb25vdXNcblx0XHQvLyBhbmQgdGhlcmUncyBubyBldmVudCBsb29wIHRvIGRlZmVyIHRvXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdH1cblxuXHQvLyBCcm93c2VyIG1vZGU6IHVzZSBxdWV1ZU1pY3JvdGFzayBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZVxuXHRpZiAodHlwZW9mIHF1ZXVlTWljcm90YXNrICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuXHRcdFx0cXVldWVNaWNyb3Rhc2socmVzb2x2ZSlcblx0XHR9KVxuXHR9XG5cblx0Ly8gRmFsbGJhY2s6IHVzZSBQcm9taXNlLnJlc29sdmUoKSBmb3Igb2xkZXIgZW52aXJvbm1lbnRzXG5cdGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gJ3VuZGVmaW5lZCcgJiYgUHJvbWlzZS5yZXNvbHZlKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdH1cblxuXHQvLyBMYXN0IHJlc29ydDogc2V0VGltZW91dCAoc2hvdWxkbid0IGhhcHBlbiBpbiBtb2Rlcm4gZW52aXJvbm1lbnRzKVxuXHRpZiAodHlwZW9mIHNldFRpbWVvdXQgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlOiAoKSA9PiB2b2lkKSA9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KHJlc29sdmUsIDApXG5cdFx0fSlcblx0fVxuXG5cdC8vIElmIG5vdGhpbmcgaXMgYXZhaWxhYmxlLCByZXNvbHZlIGltbWVkaWF0ZWx5XG5cdC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBpbiBwcmFjdGljZSwgYnV0IFR5cGVTY3JpcHQgbmVlZHMgYSByZXR1cm5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpIGFzIFByb21pc2U8dm9pZD5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV4dF90aWNrXG5leHBvcnQge25leHRfdGlja31cbiIsCiAgICAiaW1wb3J0IHtzaWduYWwsIGNvbXB1dGVkLCBTaWduYWwsIENvbXB1dGVkU2lnbmFsfSBmcm9tICcuL3NpZ25hbCdcbmltcG9ydCB7Z2V0U1NSQ29udGV4dH0gZnJvbSAnLi9zc3JDb250ZXh0J1xuXG4vLyBXZWFrTWFwIHRvIHN0b3JlIHBhcmVudCBzaWduYWwgcmVmZXJlbmNlcyBmb3IgYXJyYXlzXG5jb25zdCBhcnJheVBhcmVudFNpZ25hbE1hcCA9IG5ldyBXZWFrTWFwPGFueSwgU2lnbmFsPGFueT4+KClcblxuLy8gVHlwZSBndWFyZCB0byBjaGVjayBpZiB2YWx1ZSBpcyBhIFNpZ25hbFxuZnVuY3Rpb24gaXNTaWduYWw8VD4odmFsdWU6IGFueSk6IHZhbHVlIGlzIFNpZ25hbDxUPiB7XG5cdHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFNpZ25hbCB8fCB2YWx1ZSBpbnN0YW5jZW9mIENvbXB1dGVkU2lnbmFsXG59XG5cbi8vIFR5cGUgZ3VhcmQgdG8gY2hlY2sgaWYgdmFsdWUgaXMgYWxyZWFkeSBhIHN0YXRlIChoYXMgYmVlbiB3cmFwcGVkKVxuZnVuY3Rpb24gaXNTdGF0ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICh2YWx1ZSBhcyBhbnkpLl9faXNTdGF0ZSA9PT0gdHJ1ZVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYSBnZXQvc2V0IGRlc2NyaXB0b3Igb2JqZWN0IChsaWtlIEphdmFTY3JpcHQgcHJvcGVydHkgZGVzY3JpcHRvcnMpXG4gKiBVc2VkIHRvIGRldGVjdCBjb21wdXRlZCBwcm9wZXJ0aWVzIGRlZmluZWQgYXMgeyBnZXQ6ICgpID0+IFQsIHNldD86ICh2YWx1ZTogVCkgPT4gdm9pZCB9XG4gKi9cbmZ1bmN0aW9uIGlzR2V0U2V0RGVzY3JpcHRvcih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIFxuXHQgICAgICAgKHR5cGVvZiB2YWx1ZS5nZXQgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHZhbHVlLnNldCA9PT0gJ2Z1bmN0aW9uJylcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgdmFsdWUgdG8gYSBzaWduYWwgaWYgaXQncyBub3QgYWxyZWFkeSBvbmVcbiAqL1xuZnVuY3Rpb24gdG9TaWduYWw8VD4odmFsdWU6IFQpOiBTaWduYWw8VD4gfCBDb21wdXRlZFNpZ25hbDxUPiB7XG5cdGlmIChpc1NpZ25hbCh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gdmFsdWUgYXMgU2lnbmFsPFQ+IHwgQ29tcHV0ZWRTaWduYWw8VD5cblx0fVxuXHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Ly8gRnVuY3Rpb24gcHJvcGVydGllcyBiZWNvbWUgY29tcHV0ZWQgc2lnbmFsc1xuXHRcdHJldHVybiBjb21wdXRlZCh2YWx1ZSBhcyAoKSA9PiBUKVxuXHR9XG5cdHJldHVybiBzaWduYWwodmFsdWUpXG59XG5cbi8vIFN0YXRlIHJlZ2lzdHJ5IGZvciBTU1Igc2VyaWFsaXphdGlvblxuLy8gU3RvcmVzIGJvdGggc3RhdGUgaW5zdGFuY2UgYW5kIG9yaWdpbmFsIGluaXRpYWwgc3RhdGUgKHdpdGggY29tcHV0ZWQgcHJvcGVydGllcylcbmludGVyZmFjZSBTdGF0ZVJlZ2lzdHJ5RW50cnkge1xuXHRzdGF0ZTogYW55XG5cdGluaXRpYWw6IGFueVxufVxuXG5jb25zdCBnbG9iYWxTdGF0ZVJlZ2lzdHJ5ID0gbmV3IE1hcDxzdHJpbmcsIFN0YXRlUmVnaXN0cnlFbnRyeT4oKVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlZ2lzdHJ5IHRvIHVzZTogcGVyLXJlcXVlc3QgcmVnaXN0cnkgd2hlbiBpbnNpZGUgYW4gU1NSXG4gKiBydW5XaXRoQ29udGV4dCgpLCBvdGhlcndpc2UgdGhlIGdsb2JhbCByZWdpc3RyeSAoY2xpZW50IG9yIHRlc3RzKS5cbiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXRlUmVnaXN0cnkoKTogTWFwPHN0cmluZywgU3RhdGVSZWdpc3RyeUVudHJ5PiB7XG5cdGNvbnN0IGN0eCA9IGdldFNTUkNvbnRleHQoKVxuXHRpZiAoY3R4Py5zdGF0ZVJlZ2lzdHJ5KSB7XG5cdFx0cmV0dXJuIGN0eC5zdGF0ZVJlZ2lzdHJ5IGFzIE1hcDxzdHJpbmcsIFN0YXRlUmVnaXN0cnlFbnRyeT5cblx0fVxuXHRyZXR1cm4gZ2xvYmFsU3RhdGVSZWdpc3RyeVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgc3RhdGUgZm9yIFNTUiBzZXJpYWxpemF0aW9uXG4gKiBDYWxsZWQgYXV0b21hdGljYWxseSB3aGVuIHN0YXRlIGlzIGNyZWF0ZWQgd2l0aCBhIG5hbWVcbiAqIEBwYXJhbSBuYW1lIC0gVW5pcXVlIG5hbWUgZm9yIHRoZSBzdGF0ZVxuICogQHBhcmFtIHN0YXRlSW5zdGFuY2UgLSBUaGUgc3RhdGUgaW5zdGFuY2UgdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSBpbml0aWFsIC0gT3JpZ2luYWwgaW5pdGlhbCBzdGF0ZSAod2l0aCBjb21wdXRlZCBwcm9wZXJ0aWVzKSBmb3IgcmVzdG9yYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU3RhdGUobmFtZTogc3RyaW5nLCBzdGF0ZUluc3RhbmNlOiBhbnksIGluaXRpYWw6IGFueSk6IHZvaWQge1xuXHRpZiAoIW5hbWUgfHwgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IG5hbWUudHJpbSgpID09PSAnJykge1xuXHRcdHRocm93IG5ldyBFcnJvcignU3RhdGUgbmFtZSBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcnKVxuXHR9XG5cblx0Y29uc3QgcmVnaXN0cnkgPSBnZXRDdXJyZW50U3RhdGVSZWdpc3RyeSgpXG5cblx0Ly8gV2FybiBpbiBkZXZlbG9wbWVudCBpZiBuYW1lIGNvbGxpc2lvbiBkZXRlY3RlZFxuXHRpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Py5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG5cdFx0aWYgKHJlZ2lzdHJ5LmhhcyhuYW1lKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBTdGF0ZSBuYW1lIGNvbGxpc2lvbiBkZXRlY3RlZDogXCIke25hbWV9XCIuIExhc3QgcmVnaXN0ZXJlZCBzdGF0ZSB3aWxsIGJlIHVzZWQuYClcblx0XHR9XG5cdH1cblxuXHRyZWdpc3RyeS5zZXQobmFtZSwge3N0YXRlOiBzdGF0ZUluc3RhbmNlLCBpbml0aWFsfSlcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIHJlZ2lzdHJ5IGVudHJ5IGZvciBhbiBleGlzdGluZyBzdGF0ZVxuICogVXNlZCBieSBTdG9yZSB0byB1cGRhdGUgaXRzIFwiaW5pdGlhbFwiIHN0YXRlIGFmdGVyIGxvYWQoKSBpcyBjYWxsZWRcbiAqIEBwYXJhbSBzdGF0ZUluc3RhbmNlIC0gVGhlIHN0YXRlIGluc3RhbmNlIHRvIHVwZGF0ZVxuICogQHBhcmFtIGluaXRpYWwgLSBOZXcgaW5pdGlhbCBzdGF0ZSAobWVyZ2VkIHRlbXBsYXRlcyBmb3IgU3RvcmUpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdGF0ZVJlZ2lzdHJ5KHN0YXRlSW5zdGFuY2U6IGFueSwgaW5pdGlhbDogYW55KTogdm9pZCB7XG5cdGNvbnN0IHJlZ2lzdHJ5ID0gZ2V0Q3VycmVudFN0YXRlUmVnaXN0cnkoKVxuXHQvLyBGaW5kIHRoZSByZWdpc3RyeSBlbnRyeSBmb3IgdGhpcyBzdGF0ZSBhbmQgdXBkYXRlIGl0cyBpbml0aWFsIHZhbHVlXG5cdGZvciAoY29uc3QgW25hbWUsIGVudHJ5XSBvZiByZWdpc3RyeS5lbnRyaWVzKCkpIHtcblx0XHRpZiAoZW50cnkuc3RhdGUgPT09IHN0YXRlSW5zdGFuY2UpIHtcblx0XHRcdHJlZ2lzdHJ5LnNldChuYW1lLCB7c3RhdGU6IHN0YXRlSW5zdGFuY2UsIGluaXRpYWx9KVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG5cdC8vIElmIG5vdCBmb3VuZCwgdGhpcyBpcyBhbiBlcnJvciBjYXNlIC0gc3RhdGUgc2hvdWxkIGJlIHJlZ2lzdGVyZWRcblx0dGhyb3cgbmV3IEVycm9yKCdTdGF0ZSBpbnN0YW5jZSBub3QgZm91bmQgaW4gcmVnaXN0cnkuIFN0YXRlIG11c3QgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgdXBkYXRpbmcuJylcbn1cblxuLyoqXG4gKiBHZXQgYWxsIHJlZ2lzdGVyZWQgc3RhdGVzXG4gKiBSZXR1cm5zIE1hcCBvZiBzdGF0ZSBuYW1lcyB0byByZWdpc3RyeSBlbnRyaWVzIChzdGF0ZSBpbnN0YW5jZSBhbmQgaW5pdGlhbCBzdGF0ZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlZ2lzdGVyZWRTdGF0ZXMoKTogTWFwPHN0cmluZywgU3RhdGVSZWdpc3RyeUVudHJ5PiB7XG5cdHJldHVybiBnZXRDdXJyZW50U3RhdGVSZWdpc3RyeSgpXG59XG5cbi8qKlxuICogQ2xlYXIgdGhlIHN0YXRlIHJlZ2lzdHJ5ICh1c2VmdWwgZm9yIHRlc3Rpbmcgb3IgYWZ0ZXIgc2VyaWFsaXphdGlvbikuXG4gKiBDbGVhcnMgdGhlIGN1cnJlbnQgcmVnaXN0cnkgKHBlci1yZXF1ZXN0IGluIFNTUiwgZ2xvYmFsIG9uIGNsaWVudCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclN0YXRlUmVnaXN0cnkoKTogdm9pZCB7XG5cdGdldEN1cnJlbnRTdGF0ZVJlZ2lzdHJ5KCkuY2xlYXIoKVxufVxuXG4vKipcbiAqIERlZXAgc2lnbmFsIHN0YXRlIC0gd3JhcHMgb2JqZWN0cy9hcnJheXMgd2l0aCBQcm94eSB0byBtYWtlIHRoZW0gcmVhY3RpdmVcbiAqIEBwYXJhbSBpbml0aWFsIC0gSW5pdGlhbCBzdGF0ZSBvYmplY3RcbiAqIEBwYXJhbSBuYW1lIC0gUmVxdWlyZWQgbmFtZSBmb3IgU1NSIHNlcmlhbGl6YXRpb24gKG11c3QgYmUgbm9uLWVtcHR5IHN0cmluZylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXRlPFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+Pihpbml0aWFsOiBULCBuYW1lOiBzdHJpbmcpOiBTdGF0ZTxUPiB7XG5cdC8vIFZhbGlkYXRlIG5hbWUgcGFyYW1ldGVyXG5cdGlmICghbmFtZSB8fCB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgfHwgbmFtZS50cmltKCkgPT09ICcnKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdTdGF0ZSBuYW1lIGlzIHJlcXVpcmVkIGFuZCBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpXG5cdH1cblx0Y29uc3Qgc2lnbmFsTWFwID0gbmV3IE1hcDxzdHJpbmcsIFNpZ25hbDxhbnk+IHwgQ29tcHV0ZWRTaWduYWw8YW55Pj4oKVxuXHRjb25zdCBzdGF0ZUNhY2hlID0gbmV3IFdlYWtNYXA8b2JqZWN0LCBhbnk+KClcblxuXHQvLyBDb252ZXJ0IGluaXRpYWwgdmFsdWVzIHRvIHNpZ25hbHNcblx0Ly8gcGFyZW50U2lnbmFsTWFwIGlzIG9wdGlvbmFsIC0gaWYgcHJvdmlkZWQsIG5lc3RlZCBzdGF0ZXMgd2lsbCB1c2UgaXRcblx0Ly8gSWYgbm90IHByb3ZpZGVkLCBlYWNoIG5lc3RlZCBzdGF0ZSBnZXRzIGl0cyBvd24gc2lnbmFsTWFwXG5cdGZ1bmN0aW9uIGluaXRpYWxpemVTaWduYWxzKG9iajogYW55LCBwYXJlbnRTaWduYWxNYXA/OiBNYXA8c3RyaW5nLCBTaWduYWw8YW55PiB8IENvbXB1dGVkU2lnbmFsPGFueT4+KTogYW55IHtcblx0XHRpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gb2JqXG5cdFx0fVxuXG5cdFx0Ly8gQ2hlY2sgaWYgYWxyZWFkeSB3cmFwcGVkXG5cdFx0aWYgKGlzU3RhdGUob2JqKSkge1xuXHRcdFx0cmV0dXJuIG9ialxuXHRcdH1cblxuXHRcdC8vIENoZWNrIGNhY2hlXG5cdFx0aWYgKHN0YXRlQ2FjaGUuaGFzKG9iaikpIHtcblx0XHRcdHJldHVybiBzdGF0ZUNhY2hlLmdldChvYmopXG5cdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGFycmF5c1xuXHRcdGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcblx0XHRcdC8vIEFycmF5cyBkb24ndCBnZXQgdGhlaXIgb3duIHNpZ25hbE1hcCAtIHRoZXkgdXNlIHRoZSBwYXJlbnQnc1xuXHRcdFx0Ly8gTmVzdGVkIG9iamVjdHMgQU5EIGFycmF5cyBzaG91bGQgYmUgcmVjdXJzaXZlbHkgd3JhcHBlZFxuXHRcdFx0Y29uc3Qgc2lnbmFscyA9IG9iai5tYXAoaXRlbSA9PiB7XG5cdFx0XHRcdGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2l2ZWx5IHdyYXAgbmVzdGVkIG9iamVjdHMgQU5EIGFycmF5cyBpbiBQcm94aWVzXG5cdFx0XHRcdFx0cmV0dXJuIGluaXRpYWxpemVTaWduYWxzKGl0ZW0sIHVuZGVmaW5lZClcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdG9TaWduYWwoaXRlbSlcblx0XHRcdH0pXG5cdFx0XHRcblx0XHRcdC8vIExpc3Qgb2YgbXV0YXRpbmcgYXJyYXkgbWV0aG9kcyB0aGF0IHNob3VsZCB0cmlnZ2VyIHRoZSBwYXJlbnQgc2lnbmFsXG5cdFx0XHRjb25zdCBtdXRhdGluZ01ldGhvZHMgPSBbJ3NwbGljZScsICdwdXNoJywgJ3BvcCcsICdzaGlmdCcsICd1bnNoaWZ0JywgJ3JldmVyc2UnLCAnc29ydCcsICdmaWxsJywgJ2NvcHlXaXRoaW4nXVxuXHRcdFx0XG5cdFx0XHQvLyBXcmFwIHRoZSBzaWduYWxzIGFycmF5IGRpcmVjdGx5IChub3QgYSBjb3B5KSBzbyBtdXRhdGlvbnMgc3RheSBpbiBzeW5jXG5cdFx0XHQvLyBTdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBkaXJlY3RseSBvbiB0aGUgUHJveHkgZm9yIHJlbGlhYmxlIGxvb2t1cFxuXHRcdFx0Y29uc3Qgd3JhcHBlZCA9IG5ldyBQcm94eShzaWduYWxzLCB7XG5cdFx0XHRcdGdldCh0YXJnZXQsIHByb3ApIHtcblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gJ19faXNTdGF0ZScpIHJldHVybiB0cnVlXG5cdFx0XHRcdFx0aWYgKHByb3AgPT09ICdfX3NpZ25hbHMnKSByZXR1cm4gc2lnbmFsc1xuXHRcdFx0XHRcdGlmIChwcm9wID09PSAnX19wYXJlbnRTaWduYWwnKSB7XG5cdFx0XHRcdFx0XHQvLyBBbGxvdyBhY2Nlc3NpbmcgcGFyZW50IHNpZ25hbCBkaXJlY3RseSBmb3IgZGVidWdnaW5nXG5cdFx0XHRcdFx0XHRyZXR1cm4gYXJyYXlQYXJlbnRTaWduYWxNYXAuZ2V0KHdyYXBwZWQpIHx8ICh3cmFwcGVkIGFzIGFueSkuX3BhcmVudFNpZ25hbFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAocHJvcCA9PT0gU3ltYm9sLnRvU3RyaW5nVGFnKSByZXR1cm4gJ0FycmF5JyAvLyBNYWtlIEFycmF5LmlzQXJyYXkoKSB3b3JrXG5cdFx0XHRcdFx0aWYgKHByb3AgPT09IFN5bWJvbC5pdGVyYXRvcikge1xuXHRcdFx0XHRcdFx0Ly8gUHJvdmlkZSBjdXN0b20gaXRlcmF0b3IgdGhhdCB1bndyYXBzIFNpZ25hbCB2YWx1ZXNcblx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiogKCkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNpZ25hbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWxzW2ldXG5cdFx0XHRcdFx0XHRcdFx0eWllbGQgaXNTaWduYWwoc2lnKSA/IHNpZy52YWx1ZSA6IHNpZ1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChwcm9wID09PSAnbGVuZ3RoJykgcmV0dXJuIHNpZ25hbHMubGVuZ3RoXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc3QgcHJvcFN0ciA9IFN0cmluZyhwcm9wKVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIENoZWNrIGZvciAkIHByZWZpeCBjb252ZW50aW9uIChkZWVwc2lnbmFsLXN0eWxlOiByZXR1cm5zIHJhdyBzaWduYWwpXG5cdFx0XHRcdFx0aWYgKHByb3BTdHIuc3RhcnRzV2l0aCgnJCcpICYmIHByb3BTdHIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgaW5kZXhTdHIgPSBwcm9wU3RyLnNsaWNlKDEpXG5cdFx0XHRcdFx0XHRpZiAoIWlzTmFOKE51bWJlcihpbmRleFN0cikpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGluZGV4ID0gTnVtYmVyKGluZGV4U3RyKVxuXHRcdFx0XHRcdFx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHNpZ25hbHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsc1tpbmRleF1cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaXNTaWduYWwoc2lnKSA/IHNpZyA6IHNpZ1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKE51bWJlcihwcm9wKSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGluZGV4ID0gTnVtYmVyKHByb3ApXG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHNpZ25hbHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHNbaW5kZXhdXG5cdFx0XHRcdFx0XHRcdHJldHVybiBpc1NpZ25hbChzaWcpID8gc2lnLnZhbHVlIDogc2lnXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wKVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIEZvciBhcnJheSBtZXRob2RzIHRoYXQgaXRlcmF0ZSAobWFwLCBmaWx0ZXIsIGZvckVhY2gsIGV0Yy4pLCBiaW5kIHRvIHdyYXBwZWQgUHJveHlcblx0XHRcdFx0XHQvLyBzbyB0aGV5IGdvIHRocm91Z2ggb3VyIGdldCB0cmFwIGZvciBlbGVtZW50IGFjY2Vzc1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgQXJyYXkuaXNBcnJheSh0YXJnZXQpKSB7XG5cdFx0XHRcdFx0XHQvLyBBcnJheSBpdGVyYXRpb24gbWV0aG9kcyBuZWVkIHRvIHVzZSB0aGUgUHJveHkgc28gZWxlbWVudCBhY2Nlc3MgaXMgdW53cmFwcGVkXG5cdFx0XHRcdFx0XHRjb25zdCBpdGVyYXRpb25NZXRob2RzID0gWydtYXAnLCAnZmlsdGVyJywgJ2ZvckVhY2gnLCAnc29tZScsICdldmVyeScsICdmaW5kJywgJ2ZpbmRJbmRleCcsICdyZWR1Y2UnLCAncmVkdWNlUmlnaHQnXVxuXHRcdFx0XHRcdFx0Ly8gU2VhcmNoIG1ldGhvZHMgYWxzbyBuZWVkIHVud3JhcHBlZCB2YWx1ZXMgZm9yIGNvbXBhcmlzb25cblx0XHRcdFx0XHRcdGNvbnN0IHNlYXJjaE1ldGhvZHMgPSBbJ2luY2x1ZGVzJywgJ2luZGV4T2YnLCAnbGFzdEluZGV4T2YnXVxuXHRcdFx0XHRcdFx0Ly8gTWV0aG9kcyB0aGF0IHJldHVybiBuZXcgYXJyYXlzIG9yIHN0cmluZ3MgbmVlZCB1bndyYXBwZWQgdmFsdWVzXG5cdFx0XHRcdFx0XHRjb25zdCByZXR1cm5NZXRob2RzID0gWydzbGljZScsICdjb25jYXQnLCAnZmxhdCcsICdmbGF0TWFwJywgJ2pvaW4nLCAndG9TdHJpbmcnLCAndG9Mb2NhbGVTdHJpbmcnXVxuXHRcdFx0XHRcdFx0Ly8gSXRlcmF0b3IgbWV0aG9kcyBuZWVkIHVud3JhcHBlZCB2YWx1ZXNcblx0XHRcdFx0XHRcdGNvbnN0IGl0ZXJhdG9yTWV0aG9kcyA9IFsnZW50cmllcycsICdrZXlzJywgJ3ZhbHVlcyddXG5cdFx0XHRcdFx0XHRpZiAoaXRlcmF0aW9uTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSB8fCBzZWFyY2hNZXRob2RzLmluY2x1ZGVzKHByb3BTdHIpIHx8IFxuXHRcdFx0XHRcdFx0XHRyZXR1cm5NZXRob2RzLmluY2x1ZGVzKHByb3BTdHIpIHx8IGl0ZXJhdG9yTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuYmluZCh3cmFwcGVkKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBJbnRlcmNlcHQgbXV0YXRpbmcgbWV0aG9kcyB0byB0cmlnZ2VyIHBhcmVudCBzaWduYWxcblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIG11dGF0aW5nTWV0aG9kcy5pbmNsdWRlcyhwcm9wU3RyKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEZvciBzcGxpY2UsIHdlIG5lZWQgdG8gaGFuZGxlIGl0IHNwZWNpYWxseSB0byBjb252ZXJ0IG5ldyBpdGVtcyB0byBzaWduYWxzXG5cdFx0XHRcdFx0XHRcdGlmIChwcm9wU3RyID09PSAnc3BsaWNlJykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN0YXJ0ID0gYXJnc1swXSA/PyAwXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgZGVsZXRlQ291bnQgPSBhcmdzWzFdID8/IChzaWduYWxzLmxlbmd0aCAtIHN0YXJ0KVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5ld0l0ZW1zID0gYXJncy5zbGljZSgyKVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdC8vIENvbnZlcnQgbmV3IGl0ZW1zIC0gbmVzdGVkIGFycmF5cy9vYmplY3RzIGJlY29tZSBQcm94aWVzLCBwcmltaXRpdmVzIGJlY29tZSBTaWduYWxzXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgbmV3U2lnbmFscyA9IG5ld0l0ZW1zLm1hcChpdGVtID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBXcmFwIG9iamVjdHMvYXJyYXlzIGluIFByb3hpZXMgKE5PVCBpbiBTaWduYWxzIC0gdGhlIFByb3h5IElTIHRoZSB2YWx1ZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGluaXRpYWxpemVTaWduYWxzKGl0ZW0sIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB0b1NpZ25hbChpdGVtKVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBzaWduYWxzIGFycmF5ICh0YXJnZXQgaXMgc2lnbmFscyBhcnJheSlcblx0XHRcdFx0XHRcdFx0XHRjb25zdCByZW1vdmVkID0gc2lnbmFscy5zcGxpY2Uoc3RhcnQsIGRlbGV0ZUNvdW50LCAuLi5uZXdTaWduYWxzKVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdC8vIExvb2sgdXAgcGFyZW50IHNpZ25hbCBBRlRFUiBtdXRhdGlvbiB0byBlbnN1cmUgd2UgaGF2ZSB0aGUgbGF0ZXN0IHJlZmVyZW5jZVxuXHRcdFx0XHRcdFx0XHRcdC8vIFRoaXMgZW5zdXJlcyB3ZSBnZXQgdGhlIHNpZ25hbCBldmVuIGlmIGl0IHdhcyBzdG9yZWQgYWZ0ZXIgYWNjZXNzaW5nIHRoZSBtZXRob2Rcblx0XHRcdFx0XHRcdFx0XHQvLyBUcnkgV2Vha01hcCBmaXJzdCwgdGhlbiBmYWxsYmFjayB0byBkaXJlY3QgcHJvcGVydHkgYWNjZXNzXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcGFyZW50U2lnbmFsID0gYXJyYXlQYXJlbnRTaWduYWxNYXAuZ2V0KHdyYXBwZWQpIHx8ICh3cmFwcGVkIGFzIGFueSkuX3BhcmVudFNpZ25hbFxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdC8vIFRyaWdnZXIgcGFyZW50IHNpZ25hbCBpZiBpdCBleGlzdHNcblx0XHRcdFx0XHRcdFx0XHQvLyBOb3RpZnkgc3Vic2NyaWJlcnMgZGlyZWN0bHkgc2luY2UgdGhlIGFycmF5IHJlZmVyZW5jZSBoYXNuJ3QgY2hhbmdlZFxuXHRcdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRTaWduYWwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFjY2VzcyB0aGUgc2lnbmFsJ3MgaW50ZXJuYWwgc3Vic2NyaWJlcnMgYW5kIG5vdGlmeSB0aGVtXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdWJzY3JpYmVycyA9IChwYXJlbnRTaWduYWwgYXMgYW55KS5fc3Vic2NyaWJlcnNcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChzdWJzY3JpYmVycykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFsc28gdHJpZ2dlciBjb21wb25lbnQgcmVkcmF3cyBpZiBjYWxsYmFjayBpcyBzZXRcblx0XHRcdFx0XHRcdFx0XHRcdC8vIF9fcmVkcmF3Q2FsbGJhY2sgaXMgc2V0IG9uIHRoZSBzaWduYWwgZnVuY3Rpb24gaXRzZWxmXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoKHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0OyhzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKHBhcmVudFNpZ25hbClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gUmV0dXJuIHJlbW92ZWQgaXRlbXMgKHVud3JhcHBlZClcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVtb3ZlZC5tYXAoc2lnID0+IGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWcpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gRm9yIG90aGVyIG11dGF0aW5nIG1ldGhvZHMsIGNvbnZlcnQgbmV3IGl0ZW1zIHRvIHNpZ25hbHMgZmlyc3Rcblx0XHRcdFx0XHRcdFx0XHRsZXQgcmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHByb3BTdHIgPT09ICdwdXNoJyB8fCBwcm9wU3RyID09PSAndW5zaGlmdCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5ld0l0ZW1zID0gYXJnc1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ29udmVydCBuZXcgaXRlbXMgLSBuZXN0ZWQgYXJyYXlzL29iamVjdHMgYmVjb21lIFByb3hpZXMsIHByaW1pdGl2ZXMgYmVjb21lIFNpZ25hbHNcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5ld1NpZ25hbHMgPSBuZXdJdGVtcy5tYXAoaXRlbSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFdyYXAgb2JqZWN0cy9hcnJheXMgaW4gUHJveGllcyAoTk9UIGluIFNpZ25hbHMgLSB0aGUgUHJveHkgSVMgdGhlIHZhbHVlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBpbml0aWFsaXplU2lnbmFscyhpdGVtLCB1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRvU2lnbmFsKGl0ZW0pXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHByb3BTdHIgPT09ICdwdXNoJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLnB1c2goLi4ubmV3U2lnbmFscylcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZ25hbHMudW5zaGlmdCguLi5uZXdTaWduYWxzKVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocHJvcFN0ciA9PT0gJ3BvcCcgfHwgcHJvcFN0ciA9PT0gJ3NoaWZ0Jykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQ2FsbCBvbiBzaWduYWxzIGFycmF5IGRpcmVjdGx5IGFuZCB1bndyYXAgcmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3BvcCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFscy5wb3AoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWcgIT09IHVuZGVmaW5lZCA/IChpc1NpZ25hbChzaWcpID8gc2lnLnZhbHVlIDogc2lnKSA6IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFscy5zaGlmdCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZyAhPT0gdW5kZWZpbmVkID8gKGlzU2lnbmFsKHNpZykgPyBzaWcudmFsdWUgOiBzaWcpIDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwcm9wU3RyID09PSAncmV2ZXJzZScgfHwgcHJvcFN0ciA9PT0gJ3NvcnQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBGb3IgcmV2ZXJzZS9zb3J0LCBhcHBseSB0byBzaWduYWxzIGFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocHJvcFN0ciA9PT0gJ3JldmVyc2UnKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZ25hbHMucmV2ZXJzZSgpXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBzb3J0IG5lZWRzIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0aGF0IHdvcmtzIG9uIHNpZ25hbHNcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29tcGFyYXRvciA9IGFyZ3NbMF1cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGNvbXBhcmF0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBzaWduYWxzLnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFWYWwgPSBpc1NpZ25hbChhKSA/IGEudmFsdWUgOiBhXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBiVmFsID0gaXNTaWduYWwoYikgPyBiLnZhbHVlIDogYlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGNvbXBhcmF0b3IoYVZhbCwgYlZhbClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZ25hbHMuc29ydCgoYSwgYikgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYVZhbCA9IGlzU2lnbmFsKGEpID8gYS52YWx1ZSA6IGFcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGJWYWwgPSBpc1NpZ25hbChiKSA/IGIudmFsdWUgOiBiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVZhbCA8IGJWYWwgPyAtMSA6IGFWYWwgPiBiVmFsID8gMSA6IDBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwcm9wU3RyID09PSAnZmlsbCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGZpbGxWYWx1ZSA9IGFyZ3NbMF1cblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHN0YXJ0ID0gYXJnc1sxXSA/PyAwXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBlbmQgPSBhcmdzWzJdID8/IHNpZ25hbHMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmaWxsU2lnbmFsID0gdG9TaWduYWwoZmlsbFZhbHVlKVxuXHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2lnbmFsc1tpXSA9IGZpbGxTaWduYWxcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHNpZ25hbHMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEZvciBvdGhlciBtZXRob2RzLCBqdXN0IGFwcGx5IHRvIHRhcmdldFxuXHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdmFsdWUuYXBwbHkodGFyZ2V0LCBhcmdzKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHQvLyBUcmlnZ2VyIHBhcmVudCBzaWduYWwgaWYgaXQgZXhpc3RzIChsb29rIHVwIGFnYWluIGluIGNhc2UgaXQgd2FzIHN0b3JlZClcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50UGFyZW50U2lnbmFsID0gYXJyYXlQYXJlbnRTaWduYWxNYXAuZ2V0KHdyYXBwZWQpIHx8ICh3cmFwcGVkIGFzIGFueSkuX3BhcmVudFNpZ25hbFxuXHRcdFx0XHRcdFx0XHRcdGlmIChjdXJyZW50UGFyZW50U2lnbmFsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBOb3RpZnkgc3Vic2NyaWJlcnMgZGlyZWN0bHkgc2luY2UgdGhlIGFycmF5IHJlZmVyZW5jZSBoYXNuJ3QgY2hhbmdlZFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3Vic2NyaWJlcnMgPSAoY3VycmVudFBhcmVudFNpZ25hbCBhcyBhbnkpLl9zdWJzY3JpYmVyc1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHN1YnNjcmliZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXJzLmZvckVhY2goKGZuOiAoKSA9PiB2b2lkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHNpZ25hbCBzdWJzY3JpYmVyOicsIGUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gQWxzbyB0cmlnZ2VyIGNvbXBvbmVudCByZWRyYXdzIGlmIGNhbGxiYWNrIGlzIHNldFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gX19yZWRyYXdDYWxsYmFjayBpcyBzZXQgb24gdGhlIHNpZ25hbCBmdW5jdGlvbiBpdHNlbGZcblx0XHRcdFx0XHRcdFx0XHRcdGlmICgoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQ7KHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2soY3VycmVudFBhcmVudFNpZ25hbClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZS5iaW5kKHRhcmdldClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oTnVtYmVyKHByb3ApKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgaW5kZXggPSBOdW1iZXIocHJvcClcblx0XHRcdFx0XHRcdGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgc2lnbmFscy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsc1tpbmRleF1cblx0XHRcdFx0XHRcdFx0aWYgKGlzU2lnbmFsKHNpZykpIHtcblx0XHRcdFx0XHRcdFx0XHRzaWcudmFsdWUgPSB2YWx1ZVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHNpZ25hbHNbaW5kZXhdID0gdG9TaWduYWwodmFsdWUpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBwYXJlbnQgc2lnbmFsIG9uIGVsZW1lbnQgYXNzaWdubWVudCAobG9vayB1cCB3aGVuIGNhbGxlZClcblx0XHRcdFx0XHRcdFx0Y29uc3QgcGFyZW50U2lnbmFsID0gYXJyYXlQYXJlbnRTaWduYWxNYXAuZ2V0KHdyYXBwZWQpIHx8ICh3cmFwcGVkIGFzIGFueSkuX3BhcmVudFNpZ25hbFxuXHRcdFx0XHRcdFx0XHRpZiAocGFyZW50U2lnbmFsKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gTm90aWZ5IHN1YnNjcmliZXJzIGRpcmVjdGx5IHNpbmNlIHRoZSBhcnJheSByZWZlcmVuY2UgaGFzbid0IGNoYW5nZWRcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdWJzY3JpYmVycyA9IChwYXJlbnRTaWduYWwgYXMgYW55KS5fc3Vic2NyaWJlcnNcblx0XHRcdFx0XHRcdFx0XHRpZiAoc3Vic2NyaWJlcnMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHN1YnNjcmliZXJzLmZvckVhY2goKGZuOiAoKSA9PiB2b2lkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Zm4oKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBpbiBzaWduYWwgc3Vic2NyaWJlcjonLCBlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQvLyBBbHNvIHRyaWdnZXIgY29tcG9uZW50IHJlZHJhd3MgaWYgY2FsbGJhY2sgaXMgc2V0XG5cdFx0XHRcdFx0XHRcdFx0aWYgKChzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQ7KHNpZ25hbCBhcyBhbnkpLl9fcmVkcmF3Q2FsbGJhY2socGFyZW50U2lnbmFsKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwcm9wID09PSAnbGVuZ3RoJykge1xuXHRcdFx0XHRcdFx0XHRzaWduYWxzLmxlbmd0aCA9IE51bWJlcih2YWx1ZSlcblx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBwYXJlbnQgc2lnbmFsIG9uIGxlbmd0aCBjaGFuZ2UgKGxvb2sgdXAgd2hlbiBjYWxsZWQpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcmVudFNpZ25hbCA9IGFycmF5UGFyZW50U2lnbmFsTWFwLmdldCh3cmFwcGVkKSB8fCAod3JhcHBlZCBhcyBhbnkpLl9wYXJlbnRTaWduYWxcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudFNpZ25hbCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIE5vdGlmeSBzdWJzY3JpYmVycyBkaXJlY3RseSBzaW5jZSB0aGUgYXJyYXkgcmVmZXJlbmNlIGhhc24ndCBjaGFuZ2VkXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3Vic2NyaWJlcnMgPSAocGFyZW50U2lnbmFsIGFzIGFueSkuX3N1YnNjcmliZXJzXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHN1YnNjcmliZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdWJzY3JpYmVycy5mb3JFYWNoKChmbjogKCkgPT4gdm9pZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW4gc2lnbmFsIHN1YnNjcmliZXI6JywgZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQWxzbyB0cmlnZ2VyIGNvbXBvbmVudCByZWRyYXdzIGlmIGNhbGxiYWNrIGlzIHNldFxuXHRcdFx0XHRcdFx0XHRcdGlmICgoc2lnbmFsIGFzIGFueSkuX19yZWRyYXdDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdFx0OyhzaWduYWwgYXMgYW55KS5fX3JlZHJhd0NhbGxiYWNrKHBhcmVudFNpZ25hbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG93bktleXMoX3RhcmdldCkge1xuXHRcdFx0XHRcdC8vIFJldHVybiBhcnJheSBpbmRpY2VzIGFzIGtleXMgZm9yIHByb3BlciBlbnVtZXJhdGlvbiAobmVlZGVkIGZvciBCdW4ncyB0b0VxdWFsKVxuXHRcdFx0XHRcdGNvbnN0IGtleXM6IChzdHJpbmcgfCBzeW1ib2wpW10gPSBbXVxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc2lnbmFscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKFN0cmluZyhpKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0a2V5cy5wdXNoKCdsZW5ndGgnKVxuXHRcdFx0XHRcdHJldHVybiBrZXlzXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApIHtcblx0XHRcdFx0XHQvLyBQcm92aWRlIHByb3BlcnR5IGRlc2NyaXB0b3JzIGZvciBhcnJheSBpbmRpY2VzIChuZWVkZWQgZm9yIEJ1bidzIHRvRXF1YWwpXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oTnVtYmVyKHByb3ApKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgaW5kZXggPSBOdW1iZXIocHJvcClcblx0XHRcdFx0XHRcdGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgc2lnbmFscy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbHNbaW5kZXhdXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaXNTaWduYWwoc2lnKSA/IHNpZy52YWx1ZSA6IHNpZ1xuXHRcdFx0XHRcdFx0XHRcdH0pKCksXG5cdFx0XHRcdFx0XHRcdFx0d3JpdGFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHByb3AgPT09ICdsZW5ndGgnKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0dmFsdWU6IHNpZ25hbHMubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHR3cml0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcClcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0XHRzdGF0ZUNhY2hlLnNldChvYmosIHdyYXBwZWQpXG5cdFx0XHRyZXR1cm4gd3JhcHBlZFxuXHRcdH1cblxuXHRcdC8vIEhhbmRsZSBvYmplY3RzXG5cdFx0Ly8gU3RvcmUgb3JpZ2luYWwga2V5cyBmb3IgU1NSIHNlcmlhbGl6YXRpb24gKHRvIGRpc3Rpbmd1aXNoIG5lc3RlZCBzdGF0ZSBrZXlzIGZyb20gcGFyZW50IGtleXMpXG5cdFx0Y29uc3Qgb3JpZ2luYWxLZXlzID0gbmV3IFNldChPYmplY3Qua2V5cyhvYmopKVxuXHRcdC8vIEVhY2ggbmVzdGVkIHN0YXRlIGdldHMgaXRzIG93biBzaWduYWxNYXAgKHVubGVzcyBwYXJlbnRTaWduYWxNYXAgaXMgZXhwbGljaXRseSBwcm92aWRlZClcblx0XHQvLyBUaGlzIHByZXZlbnRzIG5lc3RlZCBzdGF0ZXMgZnJvbSBzaGFyaW5nIHRoZSBwYXJlbnQncyBzaWduYWxNYXBcblx0XHRjb25zdCBuZXN0ZWRTaWduYWxNYXAgPSBwYXJlbnRTaWduYWxNYXAgfHwgbmV3IE1hcDxzdHJpbmcsIFNpZ25hbDxhbnk+IHwgQ29tcHV0ZWRTaWduYWw8YW55Pj4oKVxuXHRcdGNvbnN0IHdyYXBwZWQgPSBuZXcgUHJveHkob2JqLCB7XG5cdFx0XHRnZXQodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdGlmIChwcm9wID09PSAnX19vcmlnaW5hbEtleXMnKSByZXR1cm4gb3JpZ2luYWxLZXlzXG5cdFx0XHRcdGlmIChwcm9wID09PSAnX19pc1N0YXRlJykgcmV0dXJuIHRydWVcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgX19zaWduYWxNYXAgd2FzIGV4cGxpY2l0bHkgc2V0IHRvIG51bGwgKGZvciBlcnJvciB0ZXN0aW5nKVxuXHRcdFx0XHQvLyBJZiBzbywgcmV0dXJuIG51bGw7IG90aGVyd2lzZSByZXR1cm4gdGhlIG5lc3RlZFNpZ25hbE1hcFxuXHRcdFx0XHRpZiAocHJvcCA9PT0gJ19fc2lnbmFsTWFwJykge1xuXHRcdFx0XHRcdGNvbnN0IGV4cGxpY2l0VmFsdWUgPSBSZWZsZWN0LmdldCh0YXJnZXQsICdfX3NpZ25hbE1hcCcpXG5cdFx0XHRcdFx0cmV0dXJuIGV4cGxpY2l0VmFsdWUgIT09IHVuZGVmaW5lZCA/IGV4cGxpY2l0VmFsdWUgOiBuZXN0ZWRTaWduYWxNYXBcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Y29uc3QgcHJvcFN0ciA9IFN0cmluZyhwcm9wKVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yICQgcHJlZml4IGNvbnZlbnRpb24gKGRlZXBzaWduYWwtc3R5bGU6IHJldHVybnMgcmF3IHNpZ25hbClcblx0XHRcdFx0aWYgKHByb3BTdHIuc3RhcnRzV2l0aCgnJCcpICYmIHByb3BTdHIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGNvbnN0IGtleSA9IHByb3BTdHIuc2xpY2UoMSkgLy8gUmVtb3ZlICQgcHJlZml4XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gRW5zdXJlIHNpZ25hbCBleGlzdHMgLSBpbml0aWFsaXplIGlmIG5lZWRlZFxuXHRcdFx0XHRcdC8vIFVzZSB0aGUgc2FtZSBpbml0aWFsaXphdGlvbiBsb2dpYyBhcyByZWd1bGFyIHByb3BlcnR5IGFjY2Vzc1xuXHRcdFx0XHRcdGlmICghbmVzdGVkU2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHQvLyBGaXJzdCB0cnkgdG8gZ2V0IGZyb20gdGFyZ2V0IChvcmlnaW5hbCBvYmplY3QpXG5cdFx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFZhbHVlID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXkpXG5cdFx0XHRcdFx0XHRpZiAob3JpZ2luYWxWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY29tcHV0ZWQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsVmFsdWUuY2FsbCh3cmFwcGVkKVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIGNvbXB1dGVkU2lnKVxuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGlzR2V0U2V0RGVzY3JpcHRvcihvcmlnaW5hbFZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIEdldC9zZXQgZGVzY3JpcHRvciAtPiBjb21wdXRlZCBzaWduYWwgZnJvbSBnZXQgZnVuY3Rpb25cblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsVmFsdWUuZ2V0LmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIE9ubHkgc2V0dGVyLCBubyBnZXR0ZXIgLSB0cmVhdCBhcyByZWd1bGFyIHNpZ25hbCB3aXRoIHVuZGVmaW5lZCBpbml0aWFsIHZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwodW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdvYmplY3QnICYmIG9yaWdpbmFsVmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gR2V0IHRoZSBhbHJlYWR5LXdyYXBwZWQgc3RhdGUgZnJvbSB0aGUgd3JhcHBlZCBvYmplY3Rcblx0XHRcdFx0XHRcdFx0Ly8gRG9uJ3QgY2FsbCBpbml0aWFsaXplU2lnbmFscyBhZ2FpbiBhcyBpdCB3b3VsZCBjcmVhdGUgYSBuZXcgd3JhcHBlZCBhcnJheVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gKHdyYXBwZWQgYXMgYW55KVtrZXldXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG5lc3RlZFN0YXRlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBGYWxsYmFjazogaW5pdGlhbGl6ZSBpZiBub3QgYWxyZWFkeSB3cmFwcGVkXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBpbml0aWFsaXplZCA9IGluaXRpYWxpemVTaWduYWxzKG9yaWdpbmFsVmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChpbml0aWFsaXplZClcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGluaXRpYWxpemVkKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQoaW5pdGlhbGl6ZWQsIHNpZylcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdFx0XHRcdC8vIFN0b3JlIHBhcmVudCBzaWduYWwgcmVmZXJlbmNlIGZvciBhcnJheXNcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHRvU2lnbmFsKG9yaWdpbmFsVmFsdWUpXG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gUHJvcGVydHkgZG9lc24ndCBleGlzdCAtIHJldHVybiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBSZXR1cm4gcmF3IHNpZ25hbCBvYmplY3QgKG5vdCB0aGUgdmFsdWUpXG5cdFx0XHRcdFx0cmV0dXJuIG5lc3RlZFNpZ25hbE1hcC5nZXQoa2V5KVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRjb25zdCBrZXkgPSBwcm9wU3RyXG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBDaGVjayBpZiB3ZSBoYXZlIGEgc2lnbmFsIGZvciB0aGlzIHByb3BlcnR5XG5cdFx0XHRcdGlmICghbmVzdGVkU2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0Ly8gVHJ5IHRvIGdldCBmcm9tIHRhcmdldCBmaXJzdCAob3JpZ2luYWwgb2JqZWN0IHByb3BlcnRpZXMpXG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxWYWx1ZSA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcClcblx0XHRcdFx0XHRpZiAob3JpZ2luYWxWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHQvLyBJbml0aWFsaXplIHNpZ25hbCBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnaW5hbFZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEZ1bmN0aW9uIHByb3BlcnR5IC0+IGNvbXB1dGVkIHNpZ25hbFxuXHRcdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDYWxsIHRoZSBmdW5jdGlvbiBpbiB0aGUgY29udGV4dCBvZiB0aGUgc3RhdGVcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb3JpZ2luYWxWYWx1ZS5jYWxsKHdyYXBwZWQpXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNHZXRTZXREZXNjcmlwdG9yKG9yaWdpbmFsVmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEdldC9zZXQgZGVzY3JpcHRvciAtPiBjb21wdXRlZCBzaWduYWwgZnJvbSBnZXQgZnVuY3Rpb25cblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnaW5hbFZhbHVlLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY29tcHV0ZWQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsVmFsdWUuZ2V0LmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBPbmx5IHNldHRlciwgbm8gZ2V0dGVyIC0gdHJlYXQgYXMgcmVndWxhciBzaWduYWwgd2l0aCB1bmRlZmluZWQgaW5pdGlhbCB2YWx1ZVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbCh1bmRlZmluZWQpXG5cdFx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gJ29iamVjdCcgJiYgb3JpZ2luYWxWYWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHQvLyBOZXN0ZWQgb2JqZWN0IC0+IHJlY3Vyc2l2ZSBzdGF0ZSB3aXRoIGl0cyBvd24gc2lnbmFsTWFwXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gaW5pdGlhbGl6ZVNpZ25hbHMob3JpZ2luYWxWYWx1ZSwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwobmVzdGVkU3RhdGUpXG5cdFx0XHRcdFx0XHRcdC8vIFN0b3JlIHBhcmVudCBzaWduYWwgcmVmZXJlbmNlIGZvciBhcnJheXNcblx0XHRcdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkobmVzdGVkU3RhdGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0YXJyYXlQYXJlbnRTaWduYWxNYXAuc2V0KG5lc3RlZFN0YXRlLCBzaWcpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIFByaW1pdGl2ZSB2YWx1ZSAtPiBzaWduYWxcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gdG9TaWduYWwob3JpZ2luYWxWYWx1ZSlcblx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gUHJvcGVydHkgZG9lc24ndCBleGlzdCBpbiBvcmlnaW5hbCBvYmplY3Rcblx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBjb21wdXRlZCBwcm9wZXJ0eSB0aGF0IHdhcyBhZGRlZCBkeW5hbWljYWxseVxuXHRcdFx0XHRcdFx0Ly8gRm9yIG5vdywgcmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHNpZyA9IG5lc3RlZFNpZ25hbE1hcC5nZXQoa2V5KVxuXHRcdFx0XHRpZiAoc2lnKSB7XG5cdFx0XHRcdFx0Ly8gQWNjZXNzIHNpZ25hbC52YWx1ZSB0byB0cmFjayBjb21wb25lbnQgZGVwZW5kZW5jeVxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gc2lnLnZhbHVlXG5cdFx0XHRcdFx0Ly8gQWx3YXlzIGVuc3VyZSBwYXJlbnQgc2lnbmFsIGlzIHN0b3JlZCBmb3IgYXJyYXlzIChpbiBjYXNlIGl0IHdhc24ndCBzdG9yZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uKVxuXHRcdFx0XHRcdC8vIENoZWNrIGZvciB3cmFwcGVkIGFycmF5cyBieSBsb29raW5nIGZvciBfX2lzU3RhdGUgYW5kIF9fc2lnbmFscyBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0Ly8gQXJyYXkuaXNBcnJheSgpIG1heSByZXR1cm4gZmFsc2UgZm9yIFByb3hpZXMsIHNvIHdlIGNoZWNrIF9faXNTdGF0ZSBpbnN0ZWFkXG5cdFx0XHRcdFx0aWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0XHRcdGlmICgodmFsdWUgYXMgYW55KS5fX2lzU3RhdGUgPT09IHRydWUgJiYgQXJyYXkuaXNBcnJheSgodmFsdWUgYXMgYW55KS5fX3NpZ25hbHMpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgYSB3cmFwcGVkIGFycmF5IC0gc3RvcmUgcGFyZW50IHNpZ25hbFxuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQodmFsdWUsIHNpZyBhcyBTaWduYWw8YW55Pilcblx0XHRcdFx0XHRcdFx0Ly8gQWxzbyBzdG9yZSBkaXJlY3RseSBvbiB0aGUgUHJveHkgYXMgYSBmYWxsYmFja1xuXHRcdFx0XHRcdFx0XHQ7KHZhbHVlIGFzIGFueSkuX3BhcmVudFNpZ25hbCA9IHNpZyBhcyBTaWduYWw8YW55PlxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBSZWd1bGFyIGFycmF5IChzaG91bGRuJ3QgaGFwcGVuIGJ1dCBqdXN0IGluIGNhc2UpXG5cdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldCh2YWx1ZSwgc2lnIGFzIFNpZ25hbDxhbnk+KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEZhbGxiYWNrIHRvIG9yaWdpbmFsIHByb3BlcnR5XG5cdFx0XHRcdHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3ApXG5cdFx0XHR9LFxuXHRcdFx0c2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcblx0XHRcdFx0Y29uc3Qga2V5ID0gU3RyaW5nKHByb3ApXG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBBbGxvdyBzZXR0aW5nIF9fc2lnbmFsTWFwIHRvIG51bGwgZm9yIHRlc3RpbmcgZXJyb3IgY2FzZXNcblx0XHRcdFx0Ly8gQnV0IHdlJ2xsIGNoZWNrIGlmIGl0J3MgYWN0dWFsbHkgYSBNYXAgd2hlbiBzZXJpYWxpemluZy9kZXNlcmlhbGl6aW5nXG5cdFx0XHRcdGlmIChrZXkgPT09ICdfX3NpZ25hbE1hcCcpIHtcblx0XHRcdFx0XHQvLyBTdG9yZSB0aGUgdmFsdWUgZGlyZWN0bHkgb24gdGhlIHRhcmdldCAoYnlwYXNzIHByb3h5KVxuXHRcdFx0XHRcdC8vIFRoaXMgYWxsb3dzIHRlc3RzIHRvIGNvcnJ1cHQgdGhlIHN0YXRlIGZvciBlcnJvciBoYW5kbGluZyB0ZXN0c1xuXHRcdFx0XHRcdFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gUHJldmVudCBzZXR0aW5nIG90aGVyIGludGVybmFsIHByb3BlcnRpZXNcblx0XHRcdFx0aWYgKGtleSA9PT0gJ19faXNTdGF0ZScgfHwga2V5ID09PSAnX19vcmlnaW5hbEtleXMnIHx8IGtleSA9PT0gJ19fc2lnbmFscycpIHtcblx0XHRcdFx0XHQvLyBTaWxlbnRseSBpZ25vcmUgYXR0ZW1wdHMgdG8gc2V0IGludGVybmFsIHByb3BlcnRpZXNcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgb3JpZ2luYWwgcHJvcGVydHkgd2FzIGEgZ2V0L3NldCBkZXNjcmlwdG9yXG5cdFx0XHRcdGNvbnN0IG9yaWdpbmFsVmFsdWUgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3ApXG5cdFx0XHRcdGlmIChpc0dldFNldERlc2NyaXB0b3Iob3JpZ2luYWxWYWx1ZSkpIHtcblx0XHRcdFx0XHQvLyBIYW5kbGUgZ2V0L3NldCBkZXNjcmlwdG9yXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnaW5hbFZhbHVlLnNldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0Ly8gQ2FsbCB0aGUgc2V0dGVyIGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRvcmlnaW5hbFZhbHVlLnNldC5jYWxsKHdyYXBwZWQsIHZhbHVlKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBvcmlnaW5hbFZhbHVlLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0Ly8gUmVhZC1vbmx5IHByb3BlcnR5IChnZXQgYnV0IG5vIHNldClcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCByZWFkLW9ubHkgY29tcHV0ZWQgcHJvcGVydHkgXCIke2tleX1cImApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgbmV3IHZhbHVlIGJlaW5nIHNldCBpcyBhIGdldC9zZXQgZGVzY3JpcHRvclxuXHRcdFx0XHRpZiAoaXNHZXRTZXREZXNjcmlwdG9yKHZhbHVlKSkge1xuXHRcdFx0XHRcdC8vIFJlcGxhY2Ugd2l0aCBjb21wdXRlZCBzaWduYWwgZnJvbSBnZXQgZnVuY3Rpb25cblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29tcHV0ZWRTaWcgPSBjb21wdXRlZCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB2YWx1ZS5nZXQuY2FsbCh3cmFwcGVkKVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRcdC8vIEFsc28gdXBkYXRlIHRoZSB0YXJnZXQgc28gc2V0dGVyIGNhbiBiZSBmb3VuZCBsYXRlclxuXHRcdFx0XHRcdFx0UmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSlcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIE9ubHkgc2V0dGVyLCBubyBnZXR0ZXIgLSB0cmVhdCBhcyByZWd1bGFyIHNpZ25hbCB3aXRoIHVuZGVmaW5lZCBpbml0aWFsIHZhbHVlXG5cdFx0XHRcdFx0XHRjb25zdCBzaWcgPSBzaWduYWwodW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gU2tpcCBjb21wdXRlZCBwcm9wZXJ0aWVzIChmdW5jdGlvbnMpXG5cdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIGNvbXB1dGVkIHNpZ25hbFxuXHRcdFx0XHRcdGNvbnN0IGNvbXB1dGVkU2lnID0gY29tcHV0ZWQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBjb21wdXRlZFNpZylcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVXBkYXRlIG9yIGNyZWF0ZSBzaWduYWxcblx0XHRcdFx0aWYgKG5lc3RlZFNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdGNvbnN0IHNpZyA9IG5lc3RlZFNpZ25hbE1hcC5nZXQoa2V5KVxuXHRcdFx0XHRcdGlmIChzaWcgJiYgIShzaWcgaW5zdGFuY2VvZiBDb21wdXRlZFNpZ25hbCkpIHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE5lc3RlZCBvYmplY3QgLT4gcmVjdXJzaXZlIHN0YXRlIHdpdGggaXRzIG93biBzaWduYWxNYXBcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmVzdGVkU3RhdGUgPSBpbml0aWFsaXplU2lnbmFscyh2YWx1ZSwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0XHQvLyBTdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBmb3IgYXJyYXlzXG5cdFx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChuZXN0ZWRTdGF0ZSwgc2lnIGFzIFNpZ25hbDxhbnk+KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdDsoc2lnIGFzIFNpZ25hbDxhbnk+KS52YWx1ZSA9IG5lc3RlZFN0YXRlXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQ7KHNpZyBhcyBTaWduYWw8YW55PikudmFsdWUgPSB2YWx1ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBSZXBsYWNlIGNvbXB1dGVkIHdpdGggcmVndWxhciBzaWduYWxcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsICYmIEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gaW5pdGlhbGl6ZVNpZ25hbHModmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKG5lc3RlZFN0YXRlKVxuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdFx0bmVzdGVkU2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCB0b1NpZ25hbCh2YWx1ZSkpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBuZXcgc2lnbmFsXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gaW5pdGlhbGl6ZVNpZ25hbHModmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdC8vIFN0b3JlIHBhcmVudCBzaWduYWwgcmVmZXJlbmNlIGZvciBhcnJheXNcblx0XHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5lc3RlZFN0YXRlKSkge1xuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5zZXQoa2V5LCB0b1NpZ25hbCh2YWx1ZSkpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdH0sXG5cdFx0XHRoYXModGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdGlmIChwcm9wID09PSAnX19pc1N0YXRlJyB8fCBwcm9wID09PSAnX19zaWduYWxNYXAnKSByZXR1cm4gdHJ1ZVxuXHRcdFx0XHRjb25zdCBwcm9wU3RyID0gU3RyaW5nKHByb3ApXG5cdFx0XHRcdC8vIENoZWNrIGZvciAkIHByZWZpeFxuXHRcdFx0XHRpZiAocHJvcFN0ci5zdGFydHNXaXRoKCckJykgJiYgcHJvcFN0ci5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0Y29uc3Qga2V5ID0gcHJvcFN0ci5zbGljZSgxKVxuXHRcdFx0XHRcdHJldHVybiBuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkgfHwgUmVmbGVjdC5oYXModGFyZ2V0LCBrZXkpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG5lc3RlZFNpZ25hbE1hcC5oYXMocHJvcFN0cikgfHwgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wKVxuXHRcdFx0fSxcblx0XHRcdG93bktleXModGFyZ2V0KSB7XG5cdFx0XHRcdGNvbnN0IGtleXMgPSBuZXcgU2V0KFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpKVxuXHRcdFx0XHRuZXN0ZWRTaWduYWxNYXAuZm9yRWFjaCgoXywga2V5KSA9PiB7XG5cdFx0XHRcdFx0a2V5cy5hZGQoa2V5KVxuXHRcdFx0XHRcdGtleXMuYWRkKCckJyArIGtleSkgLy8gQWxzbyBpbmNsdWRlICQgcHJlZml4IGtleXNcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIEFycmF5LmZyb20oa2V5cylcblx0XHRcdH0sXG5cdFx0XHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BTdHIgPSBTdHJpbmcocHJvcClcblx0XHRcdFx0Ly8gSGFuZGxlICQgcHJlZml4XG5cdFx0XHRcdGlmIChwcm9wU3RyLnN0YXJ0c1dpdGgoJyQnKSAmJiBwcm9wU3RyLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRjb25zdCBrZXkgPSBwcm9wU3RyLnNsaWNlKDEpXG5cdFx0XHRcdFx0aWYgKG5lc3RlZFNpZ25hbE1hcC5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG5lc3RlZFNpZ25hbE1hcC5oYXMocHJvcFN0cikpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcClcblx0XHRcdH0sXG5cdFx0XHRkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3ApIHtcblx0XHRcdFx0Y29uc3Qga2V5ID0gU3RyaW5nKHByb3ApXG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIHNpZ25hbCB0byB1bmRlZmluZWQgdG8gbm90aWZ5IHN1YnNjcmliZXJzXG5cdFx0XHRcdGlmIChuZXN0ZWRTaWduYWxNYXAuaGFzKGtleSkpIHtcblx0XHRcdFx0XHRjb25zdCBzaWcgPSBuZXN0ZWRTaWduYWxNYXAuZ2V0KGtleSlcblx0XHRcdFx0XHRpZiAoc2lnICYmICEoc2lnIGluc3RhbmNlb2YgQ29tcHV0ZWRTaWduYWwpKSB7XG5cdFx0XHRcdFx0XHQvLyBTZXQgc2lnbmFsIHZhbHVlIHRvIHVuZGVmaW5lZCB0byBub3RpZnkgc3Vic2NyaWJlcnNcblx0XHRcdFx0XHRcdDsoc2lnIGFzIFNpZ25hbDxhbnk+KS52YWx1ZSA9IHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBSZW1vdmUgZnJvbSB0aGUgc2lnbmFsIG1hcFxuXHRcdFx0XHRcdG5lc3RlZFNpZ25hbE1hcC5kZWxldGUoa2V5KVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBEZWxldGUgZnJvbSB0YXJnZXRcblx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wKVxuXHRcdFx0fSxcblx0XHR9KVxuXG5cdFx0c3RhdGVDYWNoZS5zZXQob2JqLCB3cmFwcGVkKVxuXHRcdHJldHVybiB3cmFwcGVkXG5cdH1cblxuXHRjb25zdCB3cmFwcGVkID0gaW5pdGlhbGl6ZVNpZ25hbHMoaW5pdGlhbCkgYXMgU3RhdGU8VD5cblx0XG5cdC8vIFByZS1pbml0aWFsaXplIGFsbCBzaWduYWxzIGZyb20gdGhlIGluaXRpYWwgb2JqZWN0IHNvIHRoZXkncmUgYXZhaWxhYmxlIGltbWVkaWF0ZWx5XG5cdC8vIFRoaXMgZW5zdXJlcyAkcy4kcHJvcGVydHkgd29ya3MgZXZlbiBpZiAkcy5wcm9wZXJ0eSBoYXNuJ3QgYmVlbiBhY2Nlc3NlZCB5ZXRcblx0aWYgKHR5cGVvZiBpbml0aWFsID09PSAnb2JqZWN0JyAmJiBpbml0aWFsICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KGluaXRpYWwpKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gaW5pdGlhbCkge1xuXHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChpbml0aWFsLCBrZXkpKSB7XG5cdFx0XHRcdGlmICghc2lnbmFsTWFwLmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBpbml0aWFsW2tleV1cblx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHZhbHVlLmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRzaWduYWxNYXAuc2V0KGtleSwgY29tcHV0ZWRTaWcpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpc0dldFNldERlc2NyaXB0b3IodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQvc2V0IGRlc2NyaXB0b3IgLT4gY29tcHV0ZWQgc2lnbmFsIGZyb20gZ2V0IGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlLmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb21wdXRlZFNpZyA9IGNvbXB1dGVkKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWUuZ2V0LmNhbGwod3JhcHBlZClcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0c2lnbmFsTWFwLnNldChrZXksIGNvbXB1dGVkU2lnKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gT25seSBzZXR0ZXIsIG5vIGdldHRlciAtIHRyZWF0IGFzIHJlZ3VsYXIgc2lnbmFsIHdpdGggdW5kZWZpbmVkIGluaXRpYWwgdmFsdWVcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lnID0gc2lnbmFsKHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdFx0c2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdC8vIEdldCB0aGUgYWxyZWFkeS13cmFwcGVkIHN0YXRlIGZyb20gc3RhdGVDYWNoZSAoYnlwYXNzIFByb3h5IHRvIGdldCB0aGUgYWN0dWFsIHdyYXBwZWQgdmFsdWUpXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMgd2UgZ2V0IHRoZSBzYW1lIHdyYXBwZWQgYXJyYXkgdGhhdCB3YXMgY3JlYXRlZCBkdXJpbmcgaW5pdGlhbGl6ZVNpZ25hbHNcblx0XHRcdFx0XHRcdGNvbnN0IG5lc3RlZFN0YXRlID0gc3RhdGVDYWNoZS5oYXModmFsdWUpID8gc3RhdGVDYWNoZS5nZXQodmFsdWUpIDogaW5pdGlhbGl6ZVNpZ25hbHModmFsdWUsIHVuZGVmaW5lZClcblx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHNpZ25hbChuZXN0ZWRTdGF0ZSlcblx0XHRcdFx0XHRcdC8vIEFsd2F5cyBzdG9yZSBwYXJlbnQgc2lnbmFsIHJlZmVyZW5jZSBmb3IgYXJyYXlzXG5cdFx0XHRcdFx0XHQvLyBDaGVjayBmb3Igd3JhcHBlZCBhcnJheXMgYnkgbG9va2luZyBmb3IgX19pc1N0YXRlIGFuZCBfX3NpZ25hbHMgcHJvcGVydGllc1xuXHRcdFx0XHRcdFx0Ly8gQXJyYXkuaXNBcnJheSgpIG1heSByZXR1cm4gZmFsc2UgZm9yIFByb3hpZXMsIHNvIHdlIGNoZWNrIF9faXNTdGF0ZSBpbnN0ZWFkXG5cdFx0XHRcdFx0XHRpZiAobmVzdGVkU3RhdGUgJiYgdHlwZW9mIG5lc3RlZFN0YXRlID09PSAnb2JqZWN0JyAmJiBcblx0XHRcdFx0XHRcdFx0KChuZXN0ZWRTdGF0ZSBhcyBhbnkpLl9faXNTdGF0ZSA9PT0gdHJ1ZSAmJiBBcnJheS5pc0FycmF5KChuZXN0ZWRTdGF0ZSBhcyBhbnkpLl9fc2lnbmFscykpKSB7XG5cdFx0XHRcdFx0XHRcdGFycmF5UGFyZW50U2lnbmFsTWFwLnNldChuZXN0ZWRTdGF0ZSwgc2lnKVxuXHRcdFx0XHRcdFx0XHQvLyBBbHNvIHN0b3JlIGRpcmVjdGx5IG9uIHRoZSBQcm94eSBhcyBhIGZhbGxiYWNrXG5cdFx0XHRcdFx0XHRcdDsobmVzdGVkU3RhdGUgYXMgYW55KS5fcGFyZW50U2lnbmFsID0gc2lnXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobmVzdGVkU3RhdGUpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIEZhbGxiYWNrIGZvciByZWd1bGFyIGFycmF5cyAoc2hvdWxkbid0IGhhcHBlbiBidXQganVzdCBpbiBjYXNlKVxuXHRcdFx0XHRcdFx0XHRhcnJheVBhcmVudFNpZ25hbE1hcC5zZXQobmVzdGVkU3RhdGUsIHNpZylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNpZ25hbE1hcC5zZXQoa2V5LCBzaWcpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNpZyA9IHRvU2lnbmFsKHZhbHVlKVxuXHRcdFx0XHRcdFx0c2lnbmFsTWFwLnNldChrZXksIHNpZylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0XG5cdC8vIFJlZ2lzdGVyIHN0YXRlIGZvciBTU1Igc2VyaWFsaXphdGlvblxuXHQvLyBTdG9yZSBvcmlnaW5hbCBpbml0aWFsIHN0YXRlICh3aXRoIGNvbXB1dGVkIHByb3BlcnRpZXMpIGZvciByZXN0b3JhdGlvbiBhZnRlciBkZXNlcmlhbGl6YXRpb25cblx0cmVnaXN0ZXJTdGF0ZShuYW1lLCB3cmFwcGVkLCBpbml0aWFsKVxuXHRcblx0cmV0dXJuIHdyYXBwZWRcbn1cblxuLyoqXG4gKiBTdGF0ZSB0eXBlIC0gcmVhY3RpdmUgb2JqZWN0IHdpdGggc2lnbmFsLWJhc2VkIHByb3BlcnRpZXNcbiAqIFxuICogU3VwcG9ydHM6XG4gKiAtIFJlZ3VsYXIgYWNjZXNzOiBgc3RhdGUucHJvcGAgcmV0dXJucyB1bndyYXBwZWQgdmFsdWVcbiAqIC0gU2lnbmFsIGFjY2VzczogYHN0YXRlLiRwcm9wYCByZXR1cm5zIFNpZ25hbCBpbnN0YW5jZSAoaGFuZGxlZCBhdCBydW50aW1lKVxuICogLSBGdW5jdGlvbnMgYmVjb21lIGNvbXB1dGVkIHNpZ25hbHNcbiAqIC0gTmVzdGVkIG9iamVjdHMgYmVjb21lIFN0YXRlIGluc3RhbmNlc1xuICogXG4gKiBOb3RlOiBUaGUgJCBwcmVmaXggYWNjZXNzIGlzIGhhbmRsZWQgdmlhIFByb3h5IGF0IHJ1bnRpbWUuXG4gKiBUeXBlU2NyaXB0J3MgdHlwZSBzeXN0ZW0gY2Fubm90IGZ1bGx5IGV4cHJlc3MgdGhlICQgcHJlZml4IHBhdHRlcm4sXG4gKiBidXQgdGhlIGltcGxlbWVudGF0aW9uIGNvcnJlY3RseSBoYW5kbGVzIGl0LlxuICovXG5leHBvcnQgdHlwZSBTdGF0ZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55Pj4gPSB7XG5cdFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgKC4uLmFyZ3M6IGFueVtdKSA9PiBpbmZlciBSXG5cdFx0PyBSIC8vIEZ1bmN0aW9uIHByb3BlcnRpZXMgcmV0dXJuIGNvbXB1dGVkIHZhbHVlXG5cdFx0OiBUW0tdIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PlxuXHRcdFx0PyBTdGF0ZTxUW0tdPiAvLyBOZXN0ZWQgb2JqZWN0cyBiZWNvbWUgc3RhdGVzXG5cdFx0XHQ6IFRbS10gLy8gUHJpbWl0aXZlIHZhbHVlc1xufSAmIHtcblx0Ly8gSW5kZXggc2lnbmF0dXJlIGZvciAkIHByZWZpeCBhY2Nlc3MgKHJ1bnRpbWUgb25seSwgbm90IGZ1bGx5IHR5cGVkKVxuXHRba2V5OiBzdHJpbmddOiBhbnlcbn1cblxuLyoqXG4gKiBXYXRjaCBhIHNpZ25hbCBmb3IgY2hhbmdlc1xuICogQHBhcmFtIHNpZ25hbCAtIFRoZSBzaWduYWwgdG8gd2F0Y2hcbiAqIEBwYXJhbSBjYWxsYmFjayAtIENhbGxiYWNrIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHNpZ25hbCB2YWx1ZSBjaGFuZ2VzXG4gKiBAcmV0dXJucyBVbnN1YnNjcmliZSBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gd2F0Y2g8VD4oXG5cdHNpZ25hbDogU2lnbmFsPFQ+IHwgQ29tcHV0ZWRTaWduYWw8VD4sXG5cdGNhbGxiYWNrOiAobmV3VmFsdWU6IFQsIG9sZFZhbHVlOiBUKSA9PiB2b2lkLFxuKTogKCkgPT4gdm9pZCB7XG5cdGNvbnN0IHVud2F0Y2ggPSBzaWduYWwud2F0Y2goY2FsbGJhY2spXG5cdFxuXHQvLyBSZWdpc3RlciB3YXRjaGVyIGluIFNTUiBjb250ZXh0IGZvciBjbGVhbnVwIGF0IGVuZCBvZiByZXF1ZXN0XG5cdGlmIChnbG9iYWxUaGlzLl9fU1NSX01PREVfXykge1xuXHRcdGNvbnN0IGNvbnRleHQgPSBnZXRTU1JDb250ZXh0KClcblx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0aWYgKCFjb250ZXh0LndhdGNoZXJzKSB7XG5cdFx0XHRcdGNvbnRleHQud2F0Y2hlcnMgPSBbXVxuXHRcdFx0fVxuXHRcdFx0Y29udGV4dC53YXRjaGVycy5wdXNoKHVud2F0Y2gpXG5cdFx0XHQvLyBEdXJpbmcgU1NSLCBmaXJlIHdhdGNoZXIgaW1tZWRpYXRlbHkgd2l0aCBjdXJyZW50IHZhbHVlIHRvIGNhdGNoIGFueSBjaGFuZ2VzXG5cdFx0XHQvLyB0aGF0IGhhcHBlbmVkIGJlZm9yZSB3YXRjaGVyIHJlZ2lzdHJhdGlvbiAoZS5nLiwgZnJvbSByZXN0b3JlX2ZpbHRlcnNfc29ydClcblx0XHRcdC8vIFVzZSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCkgdG8gZGVmZXIgZXhlY3V0aW9uIHVudGlsIGFmdGVyIHVud2F0Y2ggaXMgcmV0dXJuZWQsXG5cdFx0XHQvLyBzbyBjYWxsYmFja3MgdGhhdCByZWZlcmVuY2UgdW53YXRjaCB3b24ndCBjYXVzZSBSZWZlcmVuY2VFcnJvclxuXHRcdFx0UHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFZhbHVlID0gc2lnbmFsLnBlZWsoKVxuXHRcdFx0XHRcdGNhbGxiYWNrKGN1cnJlbnRWYWx1ZSwgY3VycmVudFZhbHVlKVxuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBmaXJpbmcgaW5pdGlhbCB3YXRjaGVyIGNhbGxiYWNrOicsIGUpXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cdFxuXHRyZXR1cm4gdW53YXRjaFxufVxuIiwKICAgICJpbXBvcnQge3N0YXRlLCBTdGF0ZSwgdXBkYXRlU3RhdGVSZWdpc3RyeX0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7c2VyaWFsaXplU3RvcmUsIGRlc2VyaWFsaXplU3RvcmV9IGZyb20gJy4vcmVuZGVyL3NzclN0YXRlJ1xuaW1wb3J0IHtDb21wdXRlZFNpZ25hbH0gZnJvbSAnLi9zaWduYWwnXG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byByZXN0b3JlIGNvbXB1dGVkIHByb3BlcnRpZXMgKHNhbWUgYXMgaW4gc3NyU3RhdGUudHMpXG5mdW5jdGlvbiByZXN0b3JlQ29tcHV0ZWRQcm9wZXJ0aWVzKHN0YXRlOiBTdGF0ZTxhbnk+LCBpbml0aWFsOiBhbnkpOiB2b2lkIHtcblx0aWYgKCFpbml0aWFsIHx8IHR5cGVvZiBpbml0aWFsICE9PSAnb2JqZWN0Jykge1xuXHRcdHJldHVyblxuXHR9XG5cdFxuXHRmdW5jdGlvbiBpc19vYmplY3QodjogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHYpXG5cdH1cblx0XG5cdGZ1bmN0aW9uIHJlc3RvcmUob2JqOiBhbnksIHRhcmdldDogYW55LCBwcmVmaXg6IHN0cmluZyA9ICcnKTogdm9pZCB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG5cdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldXG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0Ly8gU2V0IGZ1bmN0aW9uIHByb3BlcnR5IC0gc3RhdGUgcHJveHkgd2lsbCBjb252ZXJ0IHRvIENvbXB1dGVkU2lnbmFsXG5cdFx0XHRcdFx0Y29uc3Qga2V5cyA9IHByZWZpeCA/IHByZWZpeC5zcGxpdCgnLicpLmZpbHRlcihrID0+IGspIDogW11cblx0XHRcdFx0XHRsZXQgdGFyZ2V0U3RhdGUgPSB0YXJnZXRcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGlmICghdGFyZ2V0U3RhdGUgfHwgIXRhcmdldFN0YXRlW2tleXNbaV1dKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE5lc3RlZCBzdGF0ZSBkb2Vzbid0IGV4aXN0IHlldCwgc2tpcFxuXHRcdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRhcmdldFN0YXRlID0gdGFyZ2V0U3RhdGVba2V5c1tpXV1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhcmdldFN0YXRlKSB7XG5cdFx0XHRcdFx0XHQvLyBDbGVhciBhbnkgZXhpc3Rpbmcgc2lnbmFsIGluIHNpZ25hbE1hcCBzbyBmdW5jdGlvbiBpcyByZS1pbml0aWFsaXplZCBhcyBDb21wdXRlZFNpZ25hbFxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0YXJnZXRTdGF0ZSA9PT0gJ29iamVjdCcgJiYgKHRhcmdldFN0YXRlIGFzIGFueSkuX19pc1N0YXRlKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZ25hbE1hcCA9ICh0YXJnZXRTdGF0ZSBhcyBhbnkpLl9fc2lnbmFsTWFwXG5cdFx0XHRcdFx0XHRcdGlmIChzaWduYWxNYXAgJiYgc2lnbmFsTWFwIGluc3RhbmNlb2YgTWFwKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2lnbmFsTWFwLmRlbGV0ZShrZXkpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRhcmdldFN0YXRlW2tleV0gPSB2YWx1ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChpc19vYmplY3QodmFsdWUpKSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzaXZlbHkgcmVzdG9yZSBuZXN0ZWQgY29tcHV0ZWQgcHJvcGVydGllc1xuXHRcdFx0XHRcdGNvbnN0IG5lc3RlZFByZWZpeCA9IHByZWZpeCA/IGAke3ByZWZpeH0uJHtrZXl9YCA6IGtleVxuXHRcdFx0XHRcdHJlc3RvcmUodmFsdWUsIHRhcmdldCwgbmVzdGVkUHJlZml4KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdFxuXHRyZXN0b3JlKGluaXRpYWwsIHN0YXRlKVxufVxuXG4vLyBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgU3RvcmUgY2xhc3NcbmZ1bmN0aW9uIGlzU3RhdGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAodmFsdWUgYXMgYW55KS5fX2lzU3RhdGUgPT09IHRydWVcbn1cblxuZnVuY3Rpb24gaXNfb2JqZWN0KHY6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdiAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodilcbn1cblxuZnVuY3Rpb24gY29weV9vYmplY3Q8VD4ob2JqOiBUKTogVCB7XG5cdHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpXG59XG5cbi8qKlxuICogRGVlcCBjb3B5IG9iamVjdCB3aGlsZSBwcmVzZXJ2aW5nIGZ1bmN0aW9ucyAoY29tcHV0ZWQgcHJvcGVydGllcylcbiAqIFVzZWQgZm9yIG1lcmdpbmcgdGVtcGxhdGVzIHRoYXQgbWF5IGNvbnRhaW4gY29tcHV0ZWQgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnM8VD4ob2JqOiBUKTogVCB7XG5cdGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4gb2JqXG5cdH1cblx0XG5cdGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcblx0XHRyZXR1cm4gb2JqLm1hcChpdGVtID0+IGNvcHlfb2JqZWN0X3ByZXNlcnZlX2Z1bmN0aW9ucyhpdGVtKSkgYXMgVFxuXHR9XG5cdFxuXHRpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBvYmogYXMgVFxuXHR9XG5cdFxuXHRjb25zdCByZXN1bHQ6IGFueSA9IHt9XG5cdGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuXHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IChvYmogYXMgYW55KVtrZXldXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdC8vIFByZXNlcnZlIGZ1bmN0aW9ucyAoY29tcHV0ZWQgcHJvcGVydGllcylcblx0XHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gRGVlcCBjb3B5IG90aGVyIHZhbHVlc1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGNvcHlfb2JqZWN0X3ByZXNlcnZlX2Z1bmN0aW9ucyh2YWx1ZSlcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdCBhcyBUXG59XG5cbmZ1bmN0aW9uIG1lcmdlX2RlZXAodGFyZ2V0OiBhbnksIC4uLnNvdXJjZXM6IGFueVtdKTogYW55IHtcblx0aWYgKCFzb3VyY2VzLmxlbmd0aCkgcmV0dXJuIHRhcmdldFxuXHRjb25zdCBzb3VyY2UgPSBzb3VyY2VzLnNoaWZ0KClcblxuXHRpZiAoaXNfb2JqZWN0KHRhcmdldCkgJiYgaXNfb2JqZWN0KHNvdXJjZSkpIHtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHNvdXJjZVtrZXldKSAmJiBBcnJheS5pc0FycmF5KHRhcmdldFtrZXldKSkge1xuXHRcdFx0XHQvLyBTcGxpY2UgdGhlIGNvbnRlbnRzIG9mIHNvdXJjZVtrZXldIGludG8gdGFyZ2V0W2tleV1cblx0XHRcdFx0dGFyZ2V0W2tleV0uc3BsaWNlKDAsIHRhcmdldFtrZXldLmxlbmd0aCwgLi4uc291cmNlW2tleV0pXG5cdFx0XHR9IGVsc2UgaWYgKGlzX29iamVjdChzb3VyY2Vba2V5XSkpIHtcblx0XHRcdFx0aWYgKCF0YXJnZXRba2V5XSkgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHtba2V5XToge319KVxuXHRcdFx0XHRtZXJnZV9kZWVwKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7W2tleV06IHNvdXJjZVtrZXldfSlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbWVyZ2VfZGVlcCh0YXJnZXQsIC4uLnNvdXJjZXMpXG59XG5cbmNvbnN0IERFRkFVTFRfTE9PS1VQX1ZFUklGWV9JTlRFUlZBTCA9IDEwMDAgKiAxMCAvLyAxMCBzZWNvbmRzXG5jb25zdCBERUZBVUxUX0xPT0tVUF9UVEwgPSAxMDAwICogNjAgKiA2MCAqIDI0IC8vIDEgZGF5XG5cbi8vIENvdW50ZXIgZm9yIGdlbmVyYXRpbmcgdW5pcXVlIHN0b3JlIGluc3RhbmNlIG5hbWVzXG5sZXQgc3RvcmVJbnN0YW5jZUNvdW50ZXIgPSAwXG5cbi8qKlxuICogU3RvcmUgY2xhc3MgLSB3cmFwcyBzdGF0ZSgpIHdpdGggcGVyc2lzdGVuY2UgZnVuY3Rpb25hbGl0eVxuICogUHJvdmlkZXMgbG9hZC9zYXZlL2JsdWVwcmludCBtZXRob2RzIGZvciBsb2NhbFN0b3JhZ2Uvc2Vzc2lvblN0b3JhZ2UgcGVyc2lzdGVuY2VcbiAqIFxuICogU3RhdGUgdHlwZXM6XG4gKiAtIHNhdmVkOiBsb2NhbFN0b3JhZ2UgKHN1cnZpdmVzIGJyb3dzZXIgcmVzdGFydHMpXG4gKiAtIHRlbXBvcmFyeTogbm90IHBlcnNpc3RlZCAocmVzZXRzIG9uIHJlbG9hZClcbiAqIC0gdGFiOiBzZXNzaW9uU3RvcmFnZSAoc3Vydml2ZXMgcGFnZSByZWxvYWRzLCBjbGVhcnMgd2hlbiB0YWIgY2xvc2VzKVxuICogLSBzZXNzaW9uOiBzZXJ2ZXItc2lkZSBzZXNzaW9uIHN0b3JhZ2UgKHJlcXVpcmVzIGJhY2tlbmQsIGh5ZHJhdGVkIHZpYSBTU1IpXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA9IFJlY29yZDxzdHJpbmcsIGFueT4+IHtcblx0cHJpdmF0ZSBzdGF0ZUluc3RhbmNlOiBTdGF0ZTxUPlxuXHRwcml2YXRlIHRlbXBsYXRlcyA9IHtcblx0XHRzYXZlZDoge30gYXMgUGFydGlhbDxUPixcblx0XHR0ZW1wb3Jhcnk6IHt9IGFzIFBhcnRpYWw8VD4sXG5cdFx0dGFiOiB7fSBhcyBQYXJ0aWFsPFQ+LFxuXHRcdHNlc3Npb246IHt9IGFzIFBhcnRpYWw8VD4sXG5cdH1cblx0cHJpdmF0ZSBsb29rdXBfdmVyaWZ5X2ludGVydmFsOiBudW1iZXIgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGxvb2t1cF90dGw6IG51bWJlclxuXHRwcml2YXRlIGNvbXB1dGVkUHJvcGVydGllc1NldHVwPzogKCkgPT4gdm9pZFxuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtsb29rdXBfdHRsPzogbnVtYmVyfSA9IHtsb29rdXBfdHRsOiBERUZBVUxUX0xPT0tVUF9UVEx9KSB7XG5cdFx0dGhpcy5sb29rdXBfdHRsID0gb3B0aW9ucy5sb29rdXBfdHRsIHx8IERFRkFVTFRfTE9PS1VQX1RUTFxuXHRcdC8vIEluaXRpYWxpemUgd2l0aCBlbXB0eSBzdGF0ZSwgd2lsbCBiZSBsb2FkZWQgbGF0ZXJcblx0XHQvLyBHZW5lcmF0ZSB1bmlxdWUgbmFtZSBmb3IgZWFjaCBTdG9yZSBpbnN0YW5jZSB0byBhdm9pZCBjb2xsaXNpb25zXG5cdFx0Y29uc3QgaW5zdGFuY2VOYW1lID0gYHN0b3JlLmluc3RhbmNlLiR7c3RvcmVJbnN0YW5jZUNvdW50ZXIrK31gXG5cdFx0dGhpcy5zdGF0ZUluc3RhbmNlID0gc3RhdGUoe30gYXMgVCwgaW5zdGFuY2VOYW1lKVxuXHRcdFxuXHRcdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAhdGhpcy5sb29rdXBfdmVyaWZ5X2ludGVydmFsKSB7XG5cdFx0XHQvLyBDaGVjayBldmVyeSAxMCBzZWNvbmRzIGZvciBvdXRkYXRlZCBsb29rdXAgcGF0aHMuIFRoaXMgaXNcblx0XHRcdC8vIHRvIGtlZXAgdGhlIGxvb2t1cCBzdG9yZSBjbGVhbi5cblx0XHRcdHRoaXMubG9va3VwX3ZlcmlmeV9pbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuY2xlYW5fbG9va3VwKClcblx0XHRcdH0sIERFRkFVTFRfTE9PS1VQX1ZFUklGWV9JTlRFUlZBTClcblx0XHR9XG5cdH1cblxuXHRnZXQgc3RhdGUoKTogU3RhdGU8VD4ge1xuXHRcdHJldHVybiB0aGlzLnN0YXRlSW5zdGFuY2Vcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXJnZSBkZWVwIG9uIG9iamVjdCBgc3RhdGVgLCBidXQgb25seSB0aGUga2V5L3ZhbHVlcyBpbiBgYmx1ZXByaW50YC5cblx0ICovXG5cdGJsdWVwcmludChzdGF0ZTogVCwgYmx1ZXByaW50OiBQYXJ0aWFsPFQ+KTogUGFydGlhbDxUPiB7XG5cdFx0Y29uc3QgcmVzdWx0OiBhbnkgPSB7fVxuXHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGJsdWVwcmludCkpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdGUsIGtleSkpIHtcblx0XHRcdFx0Y29uc3QgYmx1ZXByaW50VmFsdWUgPSAoYmx1ZXByaW50IGFzIGFueSlba2V5XVxuXHRcdFx0XHRjb25zdCBzdGF0ZVZhbHVlID0gKHN0YXRlIGFzIGFueSlba2V5XVxuXHRcdFx0XHRpZiAoKCFBcnJheS5pc0FycmF5KGJsdWVwcmludFZhbHVlKSAmJiBibHVlcHJpbnRWYWx1ZSAhPT0gbnVsbCkgJiYgaXNfb2JqZWN0KGJsdWVwcmludFZhbHVlKSkge1xuXHRcdFx0XHRcdC8vICghKSBDb252ZW50aW9uOiBUaGUgY29udGVudHMgb2YgYSBzdGF0ZSBrZXkgd2l0aCB0aGUgbmFtZSAnbG9va3VwJyBpc1xuXHRcdFx0XHRcdC8vIGFsd2F5cyBvbmUtb25lIGNvcGllZCBmcm9tIHRoZSBzdGF0ZSwgaW5zdGVhZCBvZiBiZWluZ1xuXHRcdFx0XHRcdC8vIGJsdWVwcmludGVkIHBlci1rZXkuIFRoaXMgaXMgdG8gYWNjb21vZGF0ZSBrZXkvdmFsdWVcblx0XHRcdFx0XHQvLyBsb29rdXBzLCB3aXRob3V0IGhhdmluZyB0byBkZWZpbmUgZWFjaCBrZXkgaW4gdGhlXG5cdFx0XHRcdFx0Ly8gc3RhdGUncyBwZXJzaXN0ZW50IHNlY3Rpb24uXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gJ2xvb2t1cCcpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtrZXldID0gY29weV9vYmplY3Qoc3RhdGVWYWx1ZSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVzdWx0W2tleV0gPSB0aGlzLmJsdWVwcmludChzdGF0ZVZhbHVlLCBibHVlcHJpbnRWYWx1ZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBzdGF0ZVZhbHVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdCBhcyBQYXJ0aWFsPFQ+XG5cdH1cblxuXHRjbGVhbl9sb29rdXAoKSB7XG5cdFx0Ly8gU2tpcCBkdXJpbmcgU1NSIChzZXJ2ZXItc2lkZSByZW5kZXJpbmcgaW4gQnVuKVxuXHRcdC8vIENoZWNrIGJvdGggd2luZG93IGV4aXN0ZW5jZSBhbmQgX19TU1JfTU9ERV9fIGZsYWcgZm9yIHNhZmV0eVxuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCBnbG9iYWxUaGlzLl9fU1NSX01PREVfXykge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdFxuXHRcdGxldCBzdG9yZV9tb2RpZmllZCA9IGZhbHNlXG5cdFx0Y29uc3QgbG9va3VwID0gKHRoaXMuc3RhdGVJbnN0YW5jZSBhcyBhbnkpLmxvb2t1cFxuXHRcdGlmICghbG9va3VwKSByZXR1cm5cblx0XHRcblx0XHQvLyBCdWlsZCBhIG5ldyBsb29rdXAgb2JqZWN0IHdpdGggb25seSB2YWxpZCBlbnRyaWVzXG5cdFx0Y29uc3QgbmV3TG9va3VwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0XHQvLyBHZXQga2V5cyBmaXJzdCB0byBhdm9pZCBpdGVyYXRpb24gaXNzdWVzIHdoZW4gZGVsZXRpbmdcblx0XHQvLyBGaWx0ZXIgb3V0ICQgcHJlZml4IGtleXMgYWRkZWQgYnkgcmVhY3RpdmUgcHJveHlcblx0XHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMobG9va3VwKS5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKCckJykgJiYgayAhPT0gJ19faXNTdGF0ZScgJiYgayAhPT0gJ19fc2lnbmFsTWFwJylcblx0XHRmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGxvb2t1cFtrZXldXG5cdFx0XHQvLyBQcmV2aW91c2x5IHN0b3JlZCB2YWx1ZXMgbWF5IG5vdCBoYXZlIGEgbW9kaWZpZWQgdGltZXN0YW1wLlxuXHRcdFx0Ly8gU2V0IGl0IG5vdywgYW5kIGxldCBpdCBiZSBjbGVhbmVkIHVwIGFmdGVyIHRoZSBpbnRlcnZhbC5cblx0XHRcdGlmICghdmFsdWUgfHwgIWlzX29iamVjdCh2YWx1ZSkpIHtcblx0XHRcdFx0Ly8gU2tpcCBpbnZhbGlkIGVudHJpZXNcblx0XHRcdFx0c3RvcmVfbW9kaWZpZWQgPSB0cnVlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoISh2YWx1ZSBhcyBhbnkpLm1vZGlmaWVkKSB7XG5cdFx0XHRcdFx0KHZhbHVlIGFzIGFueSkubW9kaWZpZWQgPSBEYXRlLm5vdygpXG5cdFx0XHRcdFx0c3RvcmVfbW9kaWZpZWQgPSB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCh2YWx1ZSBhcyBhbnkpLm1vZGlmaWVkID49IChEYXRlLm5vdygpIC0gdGhpcy5sb29rdXBfdHRsKSkge1xuXHRcdFx0XHRcdC8vIEtlZXAgZW50cmllcyB0aGF0IGFyZSBub3QgZXhwaXJlZFxuXHRcdFx0XHRcdG5ld0xvb2t1cFtrZXldID0gdmFsdWVcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmluZm8oYFtzdG9yZV0gcmVtb3Zpbmcgb3V0ZGF0ZWQgbG9va3VwIHBhdGg6ICR7a2V5fWApXG5cdFx0XHRcdFx0c3RvcmVfbW9kaWZpZWQgPSB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHN0b3JlX21vZGlmaWVkKSB7XG5cdFx0XHQvLyBSZXBsYWNlIGxvb2t1cCB3aXRoIGNsZWFuZWQgdmVyc2lvblxuXHRcdFx0KHRoaXMuc3RhdGVJbnN0YW5jZSBhcyBhbnkpLmxvb2t1cCA9IG5ld0xvb2t1cFxuXHRcdFx0dGhpcy5zYXZlKClcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGtleSBmcm9tIGxvY2FsIHN0b3JhZ2UuIElmIHRoZSBpdGVtIGRvZXMgbm90IGV4aXN0IG9yXG5cdCAqIGNhbm5vdCBiZSByZXRyaWV2ZWQsIHRoZSBkZWZhdWx0IFwie31cIiBpcyByZXR1cm5lZC5cblx0ICovXG5cdGdldChrZXk6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gJ3t9J1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkgfHwgJ3t9J1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuICd7fSdcblx0XHR9XG5cdH1cblxuXHRnZXRfdGFiX3N0b3JhZ2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuICd7fSdcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSkgfHwgJ3t9J1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuICd7fSdcblx0XHR9XG5cdH1cblxuXHRsb2FkKHNhdmVkOiBQYXJ0aWFsPFQ+LCB0ZW1wb3Jhcnk6IFBhcnRpYWw8VD4sIHRhYjogUGFydGlhbDxUPiA9IHt9IGFzIFBhcnRpYWw8VD4sIHNlc3Npb246IFBhcnRpYWw8VD4gPSB7fSBhcyBQYXJ0aWFsPFQ+KSB7XG5cdFx0Y29uc3QgcmVzdG9yZWRfc3RhdGUgPSB7XG5cdFx0XHR0YWI6IHRoaXMuZ2V0X3RhYl9zdG9yYWdlKCdzdG9yZScpLFxuXHRcdFx0c3RvcmU6IHRoaXMuZ2V0KCdzdG9yZScpLFxuXHRcdH1cblxuXHRcdHRoaXMudGVtcGxhdGVzID0ge1xuXHRcdFx0c2F2ZWQsXG5cdFx0XHR0ZW1wb3JhcnksXG5cdFx0XHR0YWIsXG5cdFx0XHRzZXNzaW9uLFxuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRyZXN0b3JlZF9zdGF0ZS5zdG9yZSA9IEpTT04ucGFyc2UocmVzdG9yZWRfc3RhdGUuc3RvcmUpXG5cdFx0XHRyZXN0b3JlZF9zdGF0ZS50YWIgPSBKU09OLnBhcnNlKHJlc3RvcmVkX3N0YXRlLnRhYilcblx0XHR9IGNhdGNoKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coYFtzdG9yZV0gZmFpbGVkIHRvIHBhcnNlIHN0b3JlL3RhYjogJHtlcnJ9YClcblx0XHR9XG5cblx0XHRjb25zdCBzdG9yZV9zdGF0ZSA9IG1lcmdlX2RlZXAoY29weV9vYmplY3QodGhpcy50ZW1wbGF0ZXMuc2F2ZWQpLCBjb3B5X29iamVjdChyZXN0b3JlZF9zdGF0ZS5zdG9yZSkpXG5cdFx0Ly8gb3ZlcnJpZGUgd2l0aCBwcmV2aW91cyBpZGVudGl0eSBmb3IgYSBiZXR0ZXIgdmVyc2lvbiBidW1wIGV4cGVyaWVuY2UuXG5cdFx0aWYgKHJlc3RvcmVkX3N0YXRlLnN0b3JlICYmIHR5cGVvZiByZXN0b3JlZF9zdGF0ZS5zdG9yZSA9PT0gJ29iamVjdCcgJiYgJ2lkZW50aXR5JyBpbiByZXN0b3JlZF9zdGF0ZS5zdG9yZSkge1xuXHRcdFx0c3RvcmVfc3RhdGUuaWRlbnRpdHkgPSAocmVzdG9yZWRfc3RhdGUuc3RvcmUgYXMgYW55KS5pZGVudGl0eVxuXHRcdH1cblx0XHRsZXQgdGFiX3N0YXRlXG5cblx0XHRpZiAoIXJlc3RvcmVkX3N0YXRlLnRhYikge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tzdG9yZV0gbG9hZGluZyB0YWIgc3RhdGUgZnJvbSBsb2NhbCBzdG9yZScpXG5cdFx0XHR0YWJfc3RhdGUgPSBtZXJnZV9kZWVwKGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnRhYiksIHN0b3JlX3N0YXRlLnRhYilcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tzdG9yZV0gcmVzdG9yaW5nIGV4aXN0aW5nIHRhYiBzdGF0ZScpXG5cdFx0XHR0YWJfc3RhdGUgPSBtZXJnZV9kZWVwKGNvcHlfb2JqZWN0KHRoaXMudGVtcGxhdGVzLnRhYiksIGNvcHlfb2JqZWN0KHJlc3RvcmVkX3N0YXRlLnRhYikpXG5cdFx0fVxuXHRcdFxuXHRcdC8vIEFsd2F5cyBtZXJnZSB0YWJfc3RhdGUgaW50byBzdG9yZV9zdGF0ZSB0byBlbnN1cmUgaXQncyBpbmNsdWRlZCBpbiBmaW5hbF9zdGF0ZVxuXHRcdG1lcmdlX2RlZXAoc3RvcmVfc3RhdGUsIHt0YWI6IHRhYl9zdGF0ZX0pXG5cblx0XHQvLyBNZXJnZSB0ZW1wb3JhcnkgaW50byBzdG9yZV9zdGF0ZVxuXHRcdC8vIE5vdGU6IGNvcHlfb2JqZWN0IHJlbW92ZXMgZnVuY3Rpb25zLCBidXQgdGVtcG9yYXJ5IGRhdGEgc2hvdWxkbid0IGhhdmUgZnVuY3Rpb25zIGFueXdheVxuXHRcdC8vIChjb21wdXRlZCBwcm9wZXJ0aWVzIGFyZSBoYW5kbGVkIHNlcGFyYXRlbHkgdmlhIG1lcmdlZEluaXRpYWwpXG5cdFx0Y29uc3QgdGVtcF9zdGF0ZSA9IG1lcmdlX2RlZXAoc3RvcmVfc3RhdGUsIGNvcHlfb2JqZWN0KHRlbXBvcmFyeSkpXG5cdFx0XG5cdFx0Ly8gTWVyZ2Ugc2Vzc2lvbiBpbnRvIHRlbXBfc3RhdGUgdG8gY3JlYXRlIGZpbmFsX3N0YXRlXG5cdFx0Ly8gU2Vzc2lvbiBzdGF0ZSBjb21lcyBmcm9tIHNlcnZlciAoU1NSKSwgbm90IGxvY2FsU3RvcmFnZVxuXHRcdGNvbnN0IGZpbmFsX3N0YXRlID0gbWVyZ2VfZGVlcCh0ZW1wX3N0YXRlLCBjb3B5X29iamVjdChzZXNzaW9uKSlcblx0XHRcblx0XHQvLyBNZXJnZSB0ZW1wbGF0ZXMgKGluY2x1ZGluZyBjb21wdXRlZCBwcm9wZXJ0aWVzKSBpbnRvIFwibWVyZ2VkIGluaXRpYWwgc3RhdGVcIlxuXHRcdC8vIFRoaXMgd2lsbCBiZSBzdG9yZWQgaW4gcmVnaXN0cnkgc28gY29tcHV0ZWQgcHJvcGVydGllcyBjYW4gYmUgYXV0b21hdGljYWxseSByZXN0b3JlZFxuXHRcdC8vIFVzZSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMgdG8gZGVlcCBjb3B5IHdoaWxlIHByZXNlcnZpbmcgZnVuY3Rpb25zXG5cdFx0Ly8gTm90ZTogdGFiIHRlbXBsYXRlIHN0cnVjdHVyZSBuZWVkcyB0byBtYXRjaCBmaW5hbF9zdGF0ZSBzdHJ1Y3R1cmUgKG5lc3RlZCB1bmRlciAndGFiJylcblx0XHRjb25zdCBtZXJnZWRJbml0aWFsU2F2ZWQgPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMoc2F2ZWQpXG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFRlbXBvcmFyeSA9IGNvcHlfb2JqZWN0X3ByZXNlcnZlX2Z1bmN0aW9ucyh0ZW1wb3JhcnkpXG5cdFx0Ly8gVGFiIHRlbXBsYXRlIGlzIG1lcmdlZCBpbnRvIHN0b3JlX3N0YXRlLnRhYiwgc28gd3JhcCBpdCBpbiB7dGFiOiAuLi59XG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFRhYiA9IHRhYiAmJiBPYmplY3Qua2V5cyh0YWIpLmxlbmd0aCA+IDAgPyB7dGFiOiBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnModGFiKX0gOiB7fVxuXHRcdC8vIFNlc3Npb24gdGVtcGxhdGUgaXMgbWVyZ2VkIGRpcmVjdGx5IChubyBuZXN0aW5nIG5lZWRlZCwgc3RydWN0dXJlIG1hdGNoZXMgZmluYWxfc3RhdGUpXG5cdFx0Y29uc3QgbWVyZ2VkSW5pdGlhbFNlc3Npb24gPSBjb3B5X29iamVjdF9wcmVzZXJ2ZV9mdW5jdGlvbnMoc2Vzc2lvbilcblx0XHRjb25zdCBtZXJnZWRJbml0aWFsID0gbWVyZ2VfZGVlcChcblx0XHRcdG1lcmdlZEluaXRpYWxTYXZlZCxcblx0XHRcdG1lcmdlZEluaXRpYWxUZW1wb3JhcnksXG5cdFx0XHRtZXJnZWRJbml0aWFsVGFiLFxuXHRcdFx0bWVyZ2VkSW5pdGlhbFNlc3Npb25cblx0XHQpXG5cdFx0XG5cdFx0Ly8gVXBkYXRlIHJlZ2lzdHJ5IGVudHJ5IHRvIHN0b3JlIG1lcmdlZCB0ZW1wbGF0ZXMgYXMgXCJpbml0aWFsXCIgc3RhdGVcblx0XHQvLyBUaGlzIGFsbG93cyBkZXNlcmlhbGl6ZUFsbFN0YXRlcygpIHRvIGF1dG9tYXRpY2FsbHkgcmVzdG9yZSBjb21wdXRlZCBwcm9wZXJ0aWVzXG5cdFx0dXBkYXRlU3RhdGVSZWdpc3RyeSh0aGlzLnN0YXRlSW5zdGFuY2UsIG1lcmdlZEluaXRpYWwpXG5cdFx0XG5cdFx0Ly8gVXNlIGRlc2VyaWFsaXplU3RvcmUoKSBpbnN0ZWFkIG9mIGN1c3RvbSB1cGRhdGVTdGF0ZSgpXG5cdFx0Ly8gVGhpcyBlbnN1cmVzIGNvbnNpc3RlbmN5IHdpdGggU1NSIGRlc2VyaWFsaXphdGlvbiBtZWNoYW5pc21cblx0XHRkZXNlcmlhbGl6ZVN0b3JlKHRoaXMuc3RhdGVJbnN0YW5jZSwgZmluYWxfc3RhdGUpXG5cdFx0XG5cdFx0Ly8gUmVzdG9yZSBjb21wdXRlZCBwcm9wZXJ0aWVzIGZyb20gbWVyZ2VkIHRlbXBsYXRlc1xuXHRcdC8vIFRoaXMgZW5zdXJlcyBjb21wdXRlZCBwcm9wZXJ0aWVzIGFyZSBhdmFpbGFibGUgaW1tZWRpYXRlbHkgYWZ0ZXIgbG9hZCgpXG5cdFx0Ly8gTm90ZTogbWVyZ2VkSW5pdGlhbCBjb250YWlucyBhbGwgdGVtcGxhdGVzIChzYXZlZCwgdGVtcG9yYXJ5LCB0YWIsIHNlc3Npb24pIHdpdGggY29tcHV0ZWQgcHJvcGVydGllc1xuXHRcdHJlc3RvcmVDb21wdXRlZFByb3BlcnRpZXModGhpcy5zdGF0ZUluc3RhbmNlLCBtZXJnZWRJbml0aWFsKVxuXHRcdFxuXHRcdC8vIE5vdGU6IHNldHVwQ29tcHV0ZWRQcm9wZXJ0aWVzKCkgY2FsbGJhY2sgaXMgbm8gbG9uZ2VyIG5lZWRlZCwgYnV0IGtlcHQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcblx0XHRpZiAodGhpcy5jb21wdXRlZFByb3BlcnRpZXNTZXR1cCkge1xuXHRcdFx0dGhpcy5jb21wdXRlZFByb3BlcnRpZXNTZXR1cCgpXG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUmVnaXN0ZXIgYSBmdW5jdGlvbiB0byBzZXQgdXAgY29tcHV0ZWQgcHJvcGVydGllcyBhZnRlciBlYWNoIGxvYWQoKVxuXHQgKiBUaGlzIGVuc3VyZXMgY29tcHV0ZWQgcHJvcGVydGllcyBhcmUgYWx3YXlzIGF2YWlsYWJsZSwgZXZlbiBhZnRlciByZWxvYWRpbmcgZnJvbSBzdG9yYWdlXG5cdCAqL1xuXHRzZXR1cENvbXB1dGVkUHJvcGVydGllcyhzZXR1cEZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG5cdFx0dGhpcy5jb21wdXRlZFByb3BlcnRpZXNTZXR1cCA9IHNldHVwRm5cblx0XHQvLyBDYWxsIGltbWVkaWF0ZWx5IHRvIHNldCB1cCBjb21wdXRlZCBwcm9wZXJ0aWVzIGZvciBjdXJyZW50IHN0YXRlXG5cdFx0c2V0dXBGbigpXG5cdH1cblxuXHRhc3luYyBzYXZlKG9wdGlvbnM/OiB7c2F2ZWQ/OiBib29sZWFuLCB0YWI/OiBib29sZWFuLCBzZXNzaW9uPzogYm9vbGVhbn0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyBTa2lwIHNhdmluZyBkdXJpbmcgU1NSIChzZXJ2ZXItc2lkZSByZW5kZXJpbmcgaW4gQnVuKVxuXHRcdC8vIE9uIHRoZSBzZXJ2ZXIsIHRoZXJlJ3Mgbm8gbG9jYWxTdG9yYWdlL3Nlc3Npb25TdG9yYWdlIGFuZCBubyBuZWVkIHRvIHBlcnNpc3Qgc3RhdGVcblx0XHRpZiAoZ2xvYmFsVGhpcy5fX1NTUl9NT0RFX18pIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRcblx0XHQvLyBEZWZhdWx0IHRvIHNhdmluZyBhbGwgc3RvcmFnZSB0eXBlcyBpZiBubyBvcHRpb25zIHByb3ZpZGVkXG5cdFx0Y29uc3Qgc2F2ZVNhdmVkID0gb3B0aW9ucz8uc2F2ZWQgPz8gKG9wdGlvbnMgPT09IHVuZGVmaW5lZClcblx0XHRjb25zdCBzYXZlVGFiID0gb3B0aW9ucz8udGFiID8/IChvcHRpb25zID09PSB1bmRlZmluZWQpXG5cdFx0Y29uc3Qgc2F2ZVNlc3Npb24gPSBvcHRpb25zPy5zZXNzaW9uID8/IChvcHRpb25zID09PSB1bmRlZmluZWQpXG5cdFx0XG5cdFx0Ly8gVXNlIFNTUiBzZXJpYWxpemF0aW9uIHdoaWNoIHByb3Blcmx5IGhhbmRsZXMgU3RhdGUgb2JqZWN0cyBhbmQgc2tpcHMgQ29tcHV0ZWRTaWduYWwgcHJvcGVydGllc1xuXHRcdC8vIFRoaXMgaXMgdGhlIHNhbWUgbWVjaGFuaXNtIHVzZWQgZm9yIFNTUiwgZW5zdXJpbmcgY29uc2lzdGVuY3lcblx0XHRjb25zdCBzdGF0ZVBsYWluID0gc2VyaWFsaXplU3RvcmUodGhpcy5zdGF0ZUluc3RhbmNlKVxuXHRcdFxuXHRcdC8vIFNhdmUgdG8gbG9jYWxTdG9yYWdlIChzYXZlZCBzdGF0ZSlcblx0XHRpZiAoc2F2ZVNhdmVkICYmIHRoaXMudGVtcGxhdGVzLnNhdmVkKSB7XG5cdFx0XHR0aGlzLnNldCgnc3RvcmUnLCB0aGlzLmJsdWVwcmludChzdGF0ZVBsYWluLCBjb3B5X29iamVjdCh0aGlzLnRlbXBsYXRlcy5zYXZlZCkpKVxuXHRcdH1cblx0XHRcblx0XHQvLyBTYXZlIHRvIHNlc3Npb25TdG9yYWdlICh0YWIgc3RhdGUpXG5cdFx0aWYgKHNhdmVUYWIgJiYgdGhpcy50ZW1wbGF0ZXMudGFiKSB7XG5cdFx0XHRjb25zdCB0YWJTdGF0ZSA9ICh0aGlzLnN0YXRlSW5zdGFuY2UgYXMgYW55KS50YWJcblx0XHRcdGlmICh0YWJTdGF0ZSkge1xuXHRcdFx0XHQvLyBHZXQgdGhlIHRhYiB0ZW1wbGF0ZSAtIHVud3JhcCBpZiBpdCdzIG5lc3RlZCB1bmRlciBhICd0YWInIGtleVxuXHRcdFx0XHQvLyBUaGUgdGVtcGxhdGUgbWlnaHQgYmU6IHsgdGFiOiB7IHNlc3Npb25JZCwgLi4uIH0gfSBvciB7IHNlc3Npb25JZCwgLi4uIH1cblx0XHRcdFx0Ly8gVGhlIHN0YXRlIGlzIGFsd2F5czogeyBzZXNzaW9uSWQsIC4uLiB9XG5cdFx0XHRcdGNvbnN0IHRhYlRlbXBsYXRlID0gKHRoaXMudGVtcGxhdGVzLnRhYiBhcyBhbnkpLnRhYiB8fCB0aGlzLnRlbXBsYXRlcy50YWJcblx0XHRcdFx0XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRhYiBpcyBhIFN0YXRlIG9iamVjdFxuXHRcdFx0XHRpZiAoaXNTdGF0ZSh0YWJTdGF0ZSkpIHtcblx0XHRcdFx0XHRjb25zdCB0YWJQbGFpbiA9IHNlcmlhbGl6ZVN0b3JlKHRhYlN0YXRlKVxuXHRcdFx0XHRcdC8vIGJsdWVwcmludCBleHBlY3RzIGJvdGggYXJndW1lbnRzIHRvIGhhdmUgdGhlIHNhbWUgc3RydWN0dXJlXG5cdFx0XHRcdFx0dGhpcy5zZXRfdGFiKCdzdG9yZScsIHRoaXMuYmx1ZXByaW50KHRhYlBsYWluLCBjb3B5X29iamVjdCh0YWJUZW1wbGF0ZSkpKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIFBsYWluIG9iamVjdCB0YWJcblx0XHRcdFx0XHR0aGlzLnNldF90YWIoJ3N0b3JlJywgdGhpcy5ibHVlcHJpbnQodGFiU3RhdGUsIGNvcHlfb2JqZWN0KHRhYlRlbXBsYXRlKSkpXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIHRhYiBzdGF0ZSAtIHNhdmUgZW1wdHkgdGFiIGJhc2VkIG9uIHRlbXBsYXRlIHN0cnVjdHVyZVxuXHRcdFx0XHRjb25zdCB0YWJUZW1wbGF0ZSA9ICh0aGlzLnRlbXBsYXRlcy50YWIgYXMgYW55KS50YWIgfHwgdGhpcy50ZW1wbGF0ZXMudGFiXG5cdFx0XHRcdGlmICh0YWJUZW1wbGF0ZSAmJiBPYmplY3Qua2V5cyh0YWJUZW1wbGF0ZSkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0X3RhYignc3RvcmUnLCB0aGlzLmJsdWVwcmludCh7fSBhcyBhbnksIGNvcHlfb2JqZWN0KHRhYlRlbXBsYXRlKSkpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRfdGFiKCdzdG9yZScsIHt9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNhdmUgdG8gc2Vzc2lvbiBBUEkgKHNlc3Npb24gc3RhdGUpIC0gYXN5bmMgYnkgbmF0dXJlXG5cdFx0Ly8gT25seSBzYXZlIHNlc3Npb24gb24gY2xpZW50IHNpZGUgKG5vdCBkdXJpbmcgU1NSKVxuXHRcdGlmIChzYXZlU2Vzc2lvbiAmJiB0aGlzLnRlbXBsYXRlcy5zZXNzaW9uICYmIE9iamVjdC5rZXlzKHRoaXMudGVtcGxhdGVzLnNlc3Npb24pLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdGNvbnN0IHNlc3Npb25EYXRhID0gdGhpcy5ibHVlcHJpbnQoc3RhdGVQbGFpbiwgY29weV9vYmplY3QodGhpcy50ZW1wbGF0ZXMuc2Vzc2lvbikpXG5cdFx0XHRcblx0XHRcdC8vIENhbGwgQVBJIGVuZHBvaW50IHdpdGggYmF0Y2hlZCBzZXNzaW9uIHVwZGF0ZXNcblx0XHRcdGNvbnN0IGVuZHBvaW50ID0gJy9hcGkvc2Vzc2lvbidcblx0XHRcdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZW5kcG9pbnQsIHtcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShzZXNzaW9uRGF0YSlcblx0XHRcdH0pXG5cblx0XHRcdFxuXHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzYXZlIHNlc3Npb24gc3RhdGU6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNldChrZXk6IHN0cmluZywgaXRlbTogb2JqZWN0KTogdm9pZCB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm5cblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxuXHRcdH0gY2F0Y2goZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3QgdXNlIExvY2FsIFN0b3JhZ2U7IGNvbnRpbnVlIHdpdGhvdXQuJywgZXJyKVxuXHRcdH1cblx0fVxuXG5cdHNldF90YWIoa2V5OiBzdHJpbmcsIGl0ZW06IG9iamVjdCk6IHZvaWQge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuXG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxuXHRcdH0gY2F0Y2goZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdDYW5ub3QgdXNlIFNlc3Npb24gU3RvcmFnZTsgY29udGludWUgd2l0aG91dC4nLCBlcnIpXG5cdFx0fVxuXHR9XG59XG4iLAogICAgImltcG9ydCBoeXBlcnNjcmlwdCBmcm9tICcuL3JlbmRlci9oeXBlcnNjcmlwdCdcbmltcG9ydCBtb3VudFJlZHJhd0ZhY3RvcnkgZnJvbSAnLi9hcGkvbW91bnQtcmVkcmF3J1xuaW1wb3J0IHJvdXRlckZhY3RvcnkgZnJvbSAnLi9hcGkvcm91dGVyJ1xuaW1wb3J0IHJlbmRlckZhY3RvcnkgZnJvbSAnLi9yZW5kZXIvcmVuZGVyJ1xuaW1wb3J0IHBhcnNlUXVlcnlTdHJpbmcgZnJvbSAnLi9xdWVyeXN0cmluZy9wYXJzZSdcbmltcG9ydCBidWlsZFF1ZXJ5U3RyaW5nIGZyb20gJy4vcXVlcnlzdHJpbmcvYnVpbGQnXG5pbXBvcnQgcGFyc2VQYXRobmFtZSBmcm9tICcuL3BhdGhuYW1lL3BhcnNlJ1xuaW1wb3J0IGJ1aWxkUGF0aG5hbWUgZnJvbSAnLi9wYXRobmFtZS9idWlsZCdcbmltcG9ydCBWbm9kZUZhY3RvcnksIHtNaXRocmlsVHN4Q29tcG9uZW50fSBmcm9tICcuL3JlbmRlci92bm9kZSdcbmltcG9ydCBjZW5zb3IgZnJvbSAnLi91dGlsL2NlbnNvcidcbmltcG9ydCBuZXh0X3RpY2sgZnJvbSAnLi91dGlsL25leHRfdGljaydcbmltcG9ydCBkb21Gb3IgZnJvbSAnLi9yZW5kZXIvZG9tRm9yJ1xuaW1wb3J0IHtzaWduYWwsIGNvbXB1dGVkLCBlZmZlY3QsIFNpZ25hbCwgQ29tcHV0ZWRTaWduYWwsIHNldFNpZ25hbFJlZHJhd0NhbGxiYWNrLCBnZXRTaWduYWxDb21wb25lbnRzfSBmcm9tICcuL3NpZ25hbCdcbmltcG9ydCB7c3RhdGUsIHdhdGNoLCByZWdpc3RlclN0YXRlLCBnZXRSZWdpc3RlcmVkU3RhdGVzfSBmcm9tICcuL3N0YXRlJ1xuXG5pbXBvcnQgdHlwZSB7Vm5vZGUsIENoaWxkcmVuLCBDb21wb25lbnRUeXBlfSBmcm9tICcuL3JlbmRlci92bm9kZSdcbmltcG9ydCB0eXBlIHtIeXBlcnNjcmlwdH0gZnJvbSAnLi9yZW5kZXIvaHlwZXJzY3JpcHQnXG5pbXBvcnQgdHlwZSB7Um91dGUsIFJvdXRlUmVzb2x2ZXIsIFJlZGlyZWN0T2JqZWN0fSBmcm9tICcuL2FwaS9yb3V0ZXInXG5pbXBvcnQgdHlwZSB7UmVuZGVyLCBSZWRyYXcsIE1vdW50fSBmcm9tICcuL2FwaS9tb3VudC1yZWRyYXcnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTWl0aHJpbFN0YXRpYyB7XG5cdG06IEh5cGVyc2NyaXB0XG5cdHRydXN0OiAoaHRtbDogc3RyaW5nKSA9PiBWbm9kZVxuXHRmcmFnbWVudDogKGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCwgLi4uY2hpbGRyZW46IENoaWxkcmVuW10pID0+IFZub2RlXG5cdEZyYWdtZW50OiBzdHJpbmdcblx0bW91bnQ6IE1vdW50XG5cdHJvdXRlOiBSb3V0ZSAmICgocm9vdDogRWxlbWVudCwgZGVmYXVsdFJvdXRlOiBzdHJpbmcsIHJvdXRlczogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXI+KSA9PiB2b2lkKSAmIHtyZWRpcmVjdDogKHBhdGg6IHN0cmluZykgPT4gUmVkaXJlY3RPYmplY3R9XG5cdHJlbmRlcjogUmVuZGVyXG5cdHJlZHJhdzogUmVkcmF3XG5cdHBhcnNlUXVlcnlTdHJpbmc6IChxdWVyeVN0cmluZzogc3RyaW5nKSA9PiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cdGJ1aWxkUXVlcnlTdHJpbmc6ICh2YWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IHN0cmluZ1xuXHRwYXJzZVBhdGhuYW1lOiAocGF0aG5hbWU6IHN0cmluZykgPT4ge3BhdGg6IHN0cmluZzsgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+fVxuXHRidWlsZFBhdGhuYW1lOiAodGVtcGxhdGU6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiBzdHJpbmdcblx0dm5vZGU6IHR5cGVvZiBWbm9kZUZhY3Rvcnlcblx0Y2Vuc29yOiAoYXR0cnM6IFJlY29yZDxzdHJpbmcsIGFueT4sIGV4dHJhcz86IHN0cmluZ1tdKSA9PiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cdG5leHRfdGljazogKCkgPT4gUHJvbWlzZTx2b2lkPlxuXHRkb21Gb3I6ICh2bm9kZTogVm5vZGUpID0+IEdlbmVyYXRvcjxOb2RlLCB2b2lkLCB1bmtub3duPlxufVxuXG5jb25zdCBtb3VudFJlZHJhd0luc3RhbmNlID0gbW91bnRSZWRyYXdGYWN0b3J5KFxuXHRyZW5kZXJGYWN0b3J5KCksXG5cdHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KSA6IHNldFRpbWVvdXQsXG5cdGNvbnNvbGUsXG4pXG5cbmNvbnN0IHJvdXRlciA9IHJvdXRlckZhY3RvcnkoXG5cdHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogbnVsbCxcblx0bW91bnRSZWRyYXdJbnN0YW5jZSxcbilcblxuY29uc3QgbTogTWl0aHJpbFN0YXRpYyAmIEh5cGVyc2NyaXB0ID0gZnVuY3Rpb24gbSh0aGlzOiBhbnkpIHtcblx0cmV0dXJuIGh5cGVyc2NyaXB0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyBhcyBhbnkpXG59IGFzIHVua25vd24gYXMgTWl0aHJpbFN0YXRpYyAmIEh5cGVyc2NyaXB0XG5cbm0ubSA9IGh5cGVyc2NyaXB0IGFzIEh5cGVyc2NyaXB0XG5tLnRydXN0ID0gaHlwZXJzY3JpcHQudHJ1c3Rcbm0uZnJhZ21lbnQgPSBoeXBlcnNjcmlwdC5mcmFnbWVudFxubS5GcmFnbWVudCA9ICdbJ1xubS5tb3VudCA9IG1vdW50UmVkcmF3SW5zdGFuY2UubW91bnRcbm0ucm91dGUgPSByb3V0ZXIgYXMgUm91dGUgJiB0eXBlb2Ygcm91dGVyICYge3JlZGlyZWN0OiAocGF0aDogc3RyaW5nKSA9PiBSZWRpcmVjdE9iamVjdH1cbm0ucmVuZGVyID0gcmVuZGVyRmFjdG9yeSgpXG5tLnJlZHJhdyA9IG1vdW50UmVkcmF3SW5zdGFuY2UucmVkcmF3XG5tLnBhcnNlUXVlcnlTdHJpbmcgPSBwYXJzZVF1ZXJ5U3RyaW5nXG5tLmJ1aWxkUXVlcnlTdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nXG5tLnBhcnNlUGF0aG5hbWUgPSBwYXJzZVBhdGhuYW1lXG5tLmJ1aWxkUGF0aG5hbWUgPSBidWlsZFBhdGhuYW1lXG5tLnZub2RlID0gVm5vZGVGYWN0b3J5XG5tLmNlbnNvciA9IGNlbnNvclxubS5uZXh0X3RpY2sgPSBuZXh0X3RpY2tcbm0uZG9tRm9yID0gZG9tRm9yXG5cbi8vIFNldCB1cCBzaWduYWwtdG8tY29tcG9uZW50IHJlZHJhdyBpbnRlZ3JhdGlvblxuc2V0U2lnbmFsUmVkcmF3Q2FsbGJhY2soKHNpZzogU2lnbmFsPGFueT4pID0+IHtcblx0Y29uc3QgY29tcG9uZW50cyA9IGdldFNpZ25hbENvbXBvbmVudHMoc2lnKVxuXHRpZiAoY29tcG9uZW50cykge1xuXHRcdGNvbXBvbmVudHMuZm9yRWFjaChjb21wb25lbnQgPT4ge1xuXHRcdFx0Ly8gVXNlIHRoZSBjb21wb25lbnQtbGV2ZWwgcmVkcmF3XG5cdFx0XHRtLnJlZHJhdyhjb21wb25lbnQgYXMgYW55KVxuXHRcdH0pXG5cdH1cbn0pXG5cbi8vIEV4cG9ydCBzaWduYWxzIEFQSVxuZXhwb3J0IHtzaWduYWwsIGNvbXB1dGVkLCBlZmZlY3QsIFNpZ25hbCwgQ29tcHV0ZWRTaWduYWwsIHN0YXRlLCB3YXRjaCwgcmVnaXN0ZXJTdGF0ZSwgZ2V0UmVnaXN0ZXJlZFN0YXRlc31cbmV4cG9ydCB0eXBlIHtTdGF0ZX0gZnJvbSAnLi9zdGF0ZSdcblxuLy8gRXhwb3J0IFN0b3JlIGNsYXNzXG5leHBvcnQge1N0b3JlfSBmcm9tICcuL3N0b3JlJ1xuXG4vLyBFeHBvcnQgU1NSIHV0aWxpdGllc1xuZXhwb3J0IHtzZXJpYWxpemVTdG9yZSwgZGVzZXJpYWxpemVTdG9yZSwgc2VyaWFsaXplQWxsU3RhdGVzLCBkZXNlcmlhbGl6ZUFsbFN0YXRlc30gZnJvbSAnLi9yZW5kZXIvc3NyU3RhdGUnXG5cbi8vIEV4cG9ydCBTU1IgcmVxdWVzdCBjb250ZXh0IChmb3IgcGVyLXJlcXVlc3Qgc3RvcmUgYW5kIHN0YXRlIHJlZ2lzdHJ5KVxuZXhwb3J0IHtnZXRTU1JDb250ZXh0LCBydW5XaXRoQ29udGV4dCwgcnVuV2l0aENvbnRleHRBc3luYywgY2xlYW51cFdhdGNoZXJzfSBmcm9tICcuL3NzckNvbnRleHQnXG5leHBvcnQgdHlwZSB7U1NSQWNjZXNzQ29udGV4dH0gZnJvbSAnLi9zc3JDb250ZXh0J1xuXG4vLyBFeHBvcnQgaXNvbW9ycGhpYyBsb2dnZXJcbmV4cG9ydCB7bG9nZ2VyLCBMb2dnZXJ9IGZyb20gJy4vc2VydmVyL2xvZ2dlcidcbmV4cG9ydCB0eXBlIHtMb2dDb250ZXh0fSBmcm9tICcuL3NlcnZlci9sb2dnZXInXG5cbi8vIEV4cG9ydCBuZXh0X3RpY2sgdXRpbGl0eVxuZXhwb3J0IHtuZXh0X3RpY2t9IGZyb20gJy4vdXRpbC9uZXh0X3RpY2snXG5cbi8vIEV4cG9ydCBVUkkgdXRpbGl0aWVzXG5leHBvcnQge2dldEN1cnJlbnRVcmwsIGdldFBhdGhuYW1lLCBnZXRTZWFyY2gsIGdldEhhc2gsIGdldExvY2F0aW9ufSBmcm9tICcuL3V0aWwvdXJpJ1xuZXhwb3J0IHR5cGUge0lzb21vcnBoaWNMb2NhdGlvbn0gZnJvbSAnLi91dGlsL3VyaSdcblxuLy8gRXhwb3J0IGNvbXBvbmVudCBhbmQgdm5vZGUgdHlwZXNcbmV4cG9ydCB0eXBlIHtWbm9kZSwgQ2hpbGRyZW4sIENvbXBvbmVudCwgQ29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50VHlwZX0gZnJvbSAnLi9yZW5kZXIvdm5vZGUnXG4vLyBFeHBvcnQgTWl0aHJpbFRzeENvbXBvbmVudCBhcyBhIHZhbHVlIChjbGFzcykgc28gaXQgY2FuIGJlIGV4dGVuZGVkIGF0IHJ1bnRpbWVcbmV4cG9ydCB7TWl0aHJpbFRzeENvbXBvbmVudH1cbmV4cG9ydCB0eXBlIHtIeXBlcnNjcmlwdH0gZnJvbSAnLi9yZW5kZXIvaHlwZXJzY3JpcHQnXG5leHBvcnQgdHlwZSB7Um91dGUsIFJvdXRlUmVzb2x2ZXIsIFJlZGlyZWN0T2JqZWN0fSBmcm9tICcuL2FwaS9yb3V0ZXInXG5leHBvcnQgdHlwZSB7UmVuZGVyLCBSZWRyYXcsIE1vdW50fSBmcm9tICcuL2FwaS9tb3VudC1yZWRyYXcnXG5cbmV4cG9ydCBkZWZhdWx0IG1cbiIsCiAgICAiaW1wb3J0IHtNaXRocmlsVHN4Q29tcG9uZW50LCBWbm9kZX0gZnJvbSAnLi4vLi4vLi4vaW5kZXgnXG5pbXBvcnQgbSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCB7RG9jUGFnZX0gZnJvbSAnLi4vbWFya2Rvd24nXG5cbmludGVyZmFjZSBMYXlvdXRBdHRycyB7XG5cdHBhZ2U6IERvY1BhZ2Vcblx0cm91dGVQYXRoPzogc3RyaW5nXG5cdG5hdkd1aWRlcz86IHN0cmluZ1xuXHRuYXZNZXRob2RzPzogc3RyaW5nXG5cdHZlcnNpb24/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIExheW91dCBleHRlbmRzIE1pdGhyaWxUc3hDb21wb25lbnQ8TGF5b3V0QXR0cnM+IHtcblx0dmlldyh2bm9kZTogVm5vZGU8TGF5b3V0QXR0cnM+KSB7XG5cdFx0Y29uc3QgaXNTZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xuXHRcdGNvbnN0IHtwYWdlLCBuYXZHdWlkZXMgPSAnJywgbmF2TWV0aG9kcyA9ICcnLCB2ZXJzaW9uID0gJzIuMy44J30gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnNvbGUubG9nKCdbTGF5b3V0XSB2aWV3IGNhbGxlZCwgaXNTZXJ2ZXI6JywgaXNTZXJ2ZXIsICdoYXMgcGFnZTonLCAhIXBhZ2UsICdoYXMgY29udGVudDonLCAhIShwYWdlPy5jb250ZW50KSwgJ2NvbnRlbnQgbGVuZ3RoOicsIHBhZ2U/LmNvbnRlbnQ/Lmxlbmd0aCB8fCAwKVxuXHRcdFxuXHRcdGlmICghcGFnZSB8fCAhcGFnZS5jb250ZW50KSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW0xheW91dF0gTm8gcGFnZSBvciBjb250ZW50LCByZW5kZXJpbmcgbG9hZGluZyBzdGF0ZScpXG5cdFx0XHRyZXR1cm4gbSgnZGl2JywgJ0xvYWRpbmcuLi4nKVxuXHRcdH1cblx0XHRcblx0XHRjb25zdCBjdXJyZW50UGF0aCA9IHZub2RlLmF0dHJzLnJvdXRlUGF0aCB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyBtLnJvdXRlLmdldCgpIDogbnVsbCkgfHwgJy8nXG5cdFx0XG5cdFx0Ly8gRGV0ZXJtaW5lIHdoaWNoIG5hdiB0byBzaG93IGJhc2VkIG9uIGN1cnJlbnQgcGF0aFxuXHRcdGNvbnN0IGlzQXBpUGFnZSA9IGN1cnJlbnRQYXRoLnN0YXJ0c1dpdGgoJy9hcGknKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygnaHlwZXJzY3JpcHQnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygncmVuZGVyJykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ21vdW50JykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ3JvdXRlJykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ3JlcXVlc3QnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygncGFyc2VRdWVyeVN0cmluZycpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdidWlsZFF1ZXJ5U3RyaW5nJykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ2J1aWxkUGF0aG5hbWUnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygncGFyc2VQYXRobmFtZScpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCd0cnVzdCcpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdmcmFnbWVudCcpIHx8IGN1cnJlbnRQYXRoLmluY2x1ZGVzKCdyZWRyYXcnKSB8fCBjdXJyZW50UGF0aC5pbmNsdWRlcygnY2Vuc29yJykgfHwgY3VycmVudFBhdGguaW5jbHVkZXMoJ3N0cmVhbScpXG5cdFx0Y29uc3QgbmF2Q29udGVudCA9IGlzQXBpUGFnZSA/IG5hdk1ldGhvZHMgOiBuYXZHdWlkZXNcblx0XHRcblx0XHRyZXR1cm4gPD5cblx0XHRcdDxoZWFkZXI+XG5cdFx0XHRcdDxzZWN0aW9uPlxuXHRcdFx0XHRcdDxhIGNsYXNzPVwiaGFtYnVyZ2VyXCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPuKJoTwvYT5cblx0XHRcdFx0XHQ8aDE+XG5cdFx0XHRcdFx0XHQ8aW1nIHNyYz1cIi9sb2dvLnN2Z1wiIGFsdD1cIk1pdGhyaWxcIiAvPlxuXHRcdFx0XHRcdFx0TWl0aHJpbCA8c3BhbiBjbGFzcz1cInZlcnNpb25cIj52e3ZlcnNpb259PC9zcGFuPlxuXHRcdFx0XHRcdDwvaDE+XG5cdFx0XHRcdFx0PG5hdj5cblx0XHRcdFx0XHRcdDxtLnJvdXRlLkxpbmsgaHJlZj1cIi9cIiBzZWxlY3Rvcj1cImFcIj5HdWlkZTwvbS5yb3V0ZS5MaW5rPlxuXHRcdFx0XHRcdFx0PG0ucm91dGUuTGluayBocmVmPVwiL2FwaS5odG1sXCIgc2VsZWN0b3I9XCJhXCI+QVBJPC9tLnJvdXRlLkxpbms+XG5cdFx0XHRcdFx0XHQ8YSBocmVmPVwiaHR0cHM6Ly9taXRocmlsLnp1bGlwY2hhdC5jb20vXCI+Q2hhdDwvYT5cblx0XHRcdFx0XHRcdDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vTWl0aHJpbEpTL21pdGhyaWwuanNcIj5HaXRIdWI8L2E+XG5cdFx0XHRcdFx0PC9uYXY+XG5cdFx0XHRcdFx0e25hdkNvbnRlbnQgJiYgbmF2Q29udGVudC50cmltKCkgPyBtLnRydXN0KG5hdkNvbnRlbnQpIDogbnVsbH1cblx0XHRcdFx0PC9zZWN0aW9uPlxuXHRcdFx0PC9oZWFkZXI+XG5cdFx0XHQ8bWFpbj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cImJvZHlcIj5cblx0XHRcdFx0XHR7bS50cnVzdChwYWdlLmNvbnRlbnQpfVxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb290ZXJcIj5cblx0XHRcdFx0XHRcdDxkaXY+TGljZW5zZTogTUlULiAmY29weTsgTWl0aHJpbCBDb250cmlidXRvcnMuPC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2PjxhIGhyZWY9e2BodHRwczovL2dpdGh1Yi5jb20vTWl0aHJpbEpTL2RvY3MvZWRpdC9tYWluL2RvY3MvJHtjdXJyZW50UGF0aC5yZXBsYWNlKCcuaHRtbCcsICcubWQnKS5yZXBsYWNlKC9eXFwvLywgJycpfWB9PkVkaXQ8L2E+PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9tYWluPlxuXHRcdDwvPlxuXHR9XG5cdFxuXHRvbmNyZWF0ZSh2bm9kZTogVm5vZGU8TGF5b3V0QXR0cnM+KSB7XG5cdFx0Ly8gU2V0dXAgaGFtYnVyZ2VyIG1lbnVcblx0XHRjb25zdCBoYW1idXJnZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGFtYnVyZ2VyJylcblx0XHRpZiAoaGFtYnVyZ2VyKSB7XG5cdFx0XHRoYW1idXJnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPT09ICduYXZpZ2F0aW5nJyA/ICcnIDogJ25hdmlnYXRpbmcnXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRcblx0XHQvLyBTZXR1cCBuYXYgbWVudSBjbG9zZSBvbiBjbGlja1xuXHRcdGNvbnN0IG5hdkxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoMSArIHVsJylcblx0XHRpZiAobmF2TGlzdCkge1xuXHRcdFx0bmF2TGlzdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJ1xuXHRcdFx0fSlcblx0XHR9XG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IHtNaXRocmlsVHN4Q29tcG9uZW50LCBWbm9kZX0gZnJvbSAnLi4vLi4vLi4vaW5kZXgnXG5pbXBvcnQgbSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCB7TGF5b3V0fSBmcm9tICcuL2xheW91dCdcbmltcG9ydCB7RG9jUGFnZX0gZnJvbSAnLi4vbWFya2Rvd24nXG5cbmludGVyZmFjZSBEb2NQYWdlQXR0cnMge1xuXHRwYWdlOiBEb2NQYWdlXG5cdHJvdXRlUGF0aD86IHN0cmluZ1xuXHRuYXZHdWlkZXM/OiBzdHJpbmdcblx0bmF2TWV0aG9kcz86IHN0cmluZ1xuXHR2ZXJzaW9uPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjbGFzcyBEb2NQYWdlQ29tcG9uZW50IGV4dGVuZHMgTWl0aHJpbFRzeENvbXBvbmVudDxEb2NQYWdlQXR0cnM+IHtcblx0dmlldyh2bm9kZTogVm5vZGU8RG9jUGFnZUF0dHJzPikge1xuXHRcdGNvbnN0IGlzU2VydmVyID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcblx0XHRjb25zb2xlLmxvZygnW0RvY1BhZ2VDb21wb25lbnRdIHZpZXcgY2FsbGVkLCBpc1NlcnZlcjonLCBpc1NlcnZlciwgJ2hhcyBwYWdlOicsICEhdm5vZGUuYXR0cnMucGFnZSlcblx0XHRcblx0XHRpZiAoIXZub2RlLmF0dHJzLnBhZ2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbRG9jUGFnZUNvbXBvbmVudF0gTm8gcGFnZSBkYXRhLCByZW5kZXJpbmcgZXJyb3InKVxuXHRcdFx0cmV0dXJuIG0oJ2RpdicsICdObyBwYWdlIGRhdGEnKVxuXHRcdH1cblx0XHRcblx0XHRjb25zb2xlLmxvZygnW0RvY1BhZ2VDb21wb25lbnRdIFJlbmRlcmluZyBMYXlvdXQgd2l0aCBwYWdlIHRpdGxlOicsIHZub2RlLmF0dHJzLnBhZ2UudGl0bGUpXG5cdFx0Y29uc3QgcmVzdWx0ID0gbShMYXlvdXQgYXMgYW55LCB7XG5cdFx0XHRwYWdlOiB2bm9kZS5hdHRycy5wYWdlLFxuXHRcdFx0cm91dGVQYXRoOiB2bm9kZS5hdHRycy5yb3V0ZVBhdGgsXG5cdFx0XHRuYXZHdWlkZXM6IHZub2RlLmF0dHJzLm5hdkd1aWRlcyxcblx0XHRcdG5hdk1ldGhvZHM6IHZub2RlLmF0dHJzLm5hdk1ldGhvZHMsXG5cdFx0XHR2ZXJzaW9uOiB2bm9kZS5hdHRycy52ZXJzaW9uLFxuXHRcdH0pXG5cdFx0Y29uc29sZS5sb2coJ1tEb2NQYWdlQ29tcG9uZW50XSBMYXlvdXQgdm5vZGUgY3JlYXRlZCcpXG5cdFx0cmV0dXJuIHJlc3VsdFxuXHR9XG59XG4iLAogICAgIi8qKlxuICogbWFya2VkIHYxNC4xLjQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMjQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkXG4gKi9cblxuLyoqXG4gKiBETyBOT1QgRURJVCBUSElTIEZJTEVcbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgZnJvbSBmaWxlcyBpbiAuL3NyYy9cbiAqL1xuXG4vKipcbiAqIEdldHMgdGhlIG9yaWdpbmFsIG1hcmtlZCBkZWZhdWx0IG9wdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIF9nZXREZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgIGJyZWFrczogZmFsc2UsXG4gICAgICAgIGV4dGVuc2lvbnM6IG51bGwsXG4gICAgICAgIGdmbTogdHJ1ZSxcbiAgICAgICAgaG9va3M6IG51bGwsXG4gICAgICAgIHBlZGFudGljOiBmYWxzZSxcbiAgICAgICAgcmVuZGVyZXI6IG51bGwsXG4gICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgIHRva2VuaXplcjogbnVsbCxcbiAgICAgICAgd2Fsa1Rva2VuczogbnVsbCxcbiAgICB9O1xufVxubGV0IF9kZWZhdWx0cyA9IF9nZXREZWZhdWx0cygpO1xuZnVuY3Rpb24gY2hhbmdlRGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBfZGVmYXVsdHMgPSBuZXdEZWZhdWx0cztcbn1cblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cbmNvbnN0IGVzY2FwZVRlc3QgPSAvWyY8PlwiJ10vO1xuY29uc3QgZXNjYXBlUmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdC5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVUZXN0Tm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hKCNcXGR7MSw3fXwjW1h4XVthLWZBLUYwLTldezEsNn18XFx3Kyk7KS87XG5jb25zdCBlc2NhcGVSZXBsYWNlTm9FbmNvZGUgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3ROb0VuY29kZS5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVSZXBsYWNlbWVudHMgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxufTtcbmNvbnN0IGdldEVzY2FwZVJlcGxhY2VtZW50ID0gKGNoKSA9PiBlc2NhcGVSZXBsYWNlbWVudHNbY2hdO1xuZnVuY3Rpb24gZXNjYXBlJDEoaHRtbCwgZW5jb2RlKSB7XG4gICAgaWYgKGVuY29kZSkge1xuICAgICAgICBpZiAoZXNjYXBlVGVzdC50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2UsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGVzY2FwZVRlc3ROb0VuY29kZS50ZXN0KGh0bWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBodG1sO1xufVxuY29uc3QgY2FyZXQgPSAvKF58W15cXFtdKVxcXi9nO1xuZnVuY3Rpb24gZWRpdChyZWdleCwgb3B0KSB7XG4gICAgbGV0IHNvdXJjZSA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcbiAgICBvcHQgPSBvcHQgfHwgJyc7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgICByZXBsYWNlOiAobmFtZSwgdmFsKSA9PiB7XG4gICAgICAgICAgICBsZXQgdmFsU291cmNlID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgPyB2YWwgOiB2YWwuc291cmNlO1xuICAgICAgICAgICAgdmFsU291cmNlID0gdmFsU291cmNlLnJlcGxhY2UoY2FyZXQsICckMScpO1xuICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmFtZSwgdmFsU291cmNlKTtcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFJlZ2V4OiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIG9wdCk7XG4gICAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gY2xlYW5VcmwoaHJlZikge1xuICAgIHRyeSB7XG4gICAgICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBocmVmO1xufVxuY29uc3Qgbm9vcFRlc3QgPSB7IGV4ZWM6ICgpID0+IG51bGwgfTtcbmZ1bmN0aW9uIHNwbGl0Q2VsbHModGFibGVSb3csIGNvdW50KSB7XG4gICAgLy8gZW5zdXJlIHRoYXQgZXZlcnkgY2VsbC1kZWxpbWl0aW5nIHBpcGUgaGFzIGEgc3BhY2VcbiAgICAvLyBiZWZvcmUgaXQgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBlc2NhcGVkIHBpcGVcbiAgICBjb25zdCByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgKG1hdGNoLCBvZmZzZXQsIHN0cikgPT4ge1xuICAgICAgICBsZXQgZXNjYXBlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgY3VyciA9IG9mZnNldDtcbiAgICAgICAgd2hpbGUgKC0tY3VyciA+PSAwICYmIHN0cltjdXJyXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAgICAgLy8gc28gd2UgbGVhdmUgaXQgYWxvbmVcbiAgICAgICAgICAgIHJldHVybiAnfCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBhZGQgc3BhY2UgYmVmb3JlIHVuZXNjYXBlZCB8XG4gICAgICAgICAgICByZXR1cm4gJyB8JztcbiAgICAgICAgfVxuICAgIH0pLCBjZWxscyA9IHJvdy5zcGxpdCgvIFxcfC8pO1xuICAgIGxldCBpID0gMDtcbiAgICAvLyBGaXJzdC9sYXN0IGNlbGwgaW4gYSByb3cgY2Fubm90IGJlIGVtcHR5IGlmIGl0IGhhcyBubyBsZWFkaW5nL3RyYWlsaW5nIHBpcGVcbiAgICBpZiAoIWNlbGxzWzBdLnRyaW0oKSkge1xuICAgICAgICBjZWxscy5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAoY2VsbHMubGVuZ3RoID4gMCAmJiAhY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udHJpbSgpKSB7XG4gICAgICAgIGNlbGxzLnBvcCgpO1xuICAgIH1cbiAgICBpZiAoY291bnQpIHtcbiAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA+IGNvdW50KSB7XG4gICAgICAgICAgICBjZWxscy5zcGxpY2UoY291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KVxuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goJycpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGlzIGlnbm9yZWQgcGVyIHRoZSBnZm0gc3BlY1xuICAgICAgICBjZWxsc1tpXSA9IGNlbGxzW2ldLnRyaW0oKS5yZXBsYWNlKC9cXFxcXFx8L2csICd8Jyk7XG4gICAgfVxuICAgIHJldHVybiBjZWxscztcbn1cbi8qKlxuICogUmVtb3ZlIHRyYWlsaW5nICdjJ3MuIEVxdWl2YWxlbnQgdG8gc3RyLnJlcGxhY2UoL2MqJC8sICcnKS5cbiAqIC9jKiQvIGlzIHZ1bG5lcmFibGUgdG8gUkVET1MuXG4gKlxuICogQHBhcmFtIHN0clxuICogQHBhcmFtIGNcbiAqIEBwYXJhbSBpbnZlcnQgUmVtb3ZlIHN1ZmZpeCBvZiBub24tYyBjaGFycyBpbnN0ZWFkLiBEZWZhdWx0IGZhbHNleS5cbiAqL1xuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgICBpZiAobCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIC8vIExlbmd0aCBvZiBzdWZmaXggbWF0Y2hpbmcgdGhlIGludmVydCBjb25kaXRpb24uXG4gICAgbGV0IHN1ZmZMZW4gPSAwO1xuICAgIC8vIFN0ZXAgbGVmdCB1bnRpbCB3ZSBmYWlsIHRvIG1hdGNoIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICAgIHdoaWxlIChzdWZmTGVuIDwgbCkge1xuICAgICAgICBjb25zdCBjdXJyQ2hhciA9IHN0ci5jaGFyQXQobCAtIHN1ZmZMZW4gLSAxKTtcbiAgICAgICAgaWYgKGN1cnJDaGFyID09PSBjICYmICFpbnZlcnQpIHtcbiAgICAgICAgICAgIHN1ZmZMZW4rKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdXJyQ2hhciAhPT0gYyAmJiBpbnZlcnQpIHtcbiAgICAgICAgICAgIHN1ZmZMZW4rKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHIuc2xpY2UoMCwgbCAtIHN1ZmZMZW4pO1xufVxuZnVuY3Rpb24gZmluZENsb3NpbmdCcmFja2V0KHN0ciwgYikge1xuICAgIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBsZXQgbGV2ZWwgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdHJbaV0gPT09ICdcXFxcJykge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0cltpXSA9PT0gYlswXSkge1xuICAgICAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgICAgICAgIGxldmVsLS07XG4gICAgICAgICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBvdXRwdXRMaW5rKGNhcCwgbGluaywgcmF3LCBsZXhlcikge1xuICAgIGNvbnN0IGhyZWYgPSBsaW5rLmhyZWY7XG4gICAgY29uc3QgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlJDEobGluay50aXRsZSkgOiBudWxsO1xuICAgIGNvbnN0IHRleHQgPSBjYXBbMV0ucmVwbGFjZSgvXFxcXChbXFxbXFxdXSkvZywgJyQxJyk7XG4gICAgaWYgKGNhcFswXS5jaGFyQXQoMCkgIT09ICchJykge1xuICAgICAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0b2tlbnM6IGxleGVyLmlubGluZVRva2Vucyh0ZXh0KSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgcmF3LFxuICAgICAgICBocmVmLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgdGV4dDogZXNjYXBlJDEodGV4dCksXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCB0ZXh0KSB7XG4gICAgY29uc3QgbWF0Y2hJbmRlbnRUb0NvZGUgPSByYXcubWF0Y2goL14oXFxzKykoPzpgYGApLyk7XG4gICAgaWYgKG1hdGNoSW5kZW50VG9Db2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRUb0NvZGUgPSBtYXRjaEluZGVudFRvQ29kZVsxXTtcbiAgICByZXR1cm4gdGV4dFxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoSW5kZW50SW5Ob2RlID0gbm9kZS5tYXRjaCgvXlxccysvKTtcbiAgICAgICAgaWYgKG1hdGNoSW5kZW50SW5Ob2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbaW5kZW50SW5Ob2RlXSA9IG1hdGNoSW5kZW50SW5Ob2RlO1xuICAgICAgICBpZiAoaW5kZW50SW5Ob2RlLmxlbmd0aCA+PSBpbmRlbnRUb0NvZGUubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5zbGljZShpbmRlbnRUb0NvZGUubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9KVxuICAgICAgICAuam9pbignXFxuJyk7XG59XG4vKipcbiAqIFRva2VuaXplclxuICovXG5jbGFzcyBfVG9rZW5pemVyIHtcbiAgICBvcHRpb25zO1xuICAgIHJ1bGVzOyAvLyBzZXQgYnkgdGhlIGxleGVyXG4gICAgbGV4ZXI7IC8vIHNldCBieSB0aGUgbGV4ZXJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgX2RlZmF1bHRzO1xuICAgIH1cbiAgICBzcGFjZShzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5uZXdsaW5lLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCAmJiBjYXBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3BhY2UnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2RlKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14oPzogezEsNH18IHswLDN9XFx0KS9nbSwgJycpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICAgICAgY29kZUJsb2NrU3R5bGU6ICdpbmRlbnRlZCcsXG4gICAgICAgICAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgICAgICAgICAgICA/IHJ0cmltKHRleHQsICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICA6IHRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZlbmNlcyhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBjb25zdCByYXcgPSBjYXBbMF07XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIGNhcFszXSB8fCAnJyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgICAgICAgICByYXcsXG4gICAgICAgICAgICAgICAgbGFuZzogY2FwWzJdID8gY2FwWzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLCAnJDEnKSA6IGNhcFsyXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBoZWFkaW5nKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGNhcFsyXS50cmltKCk7XG4gICAgICAgICAgICAvLyByZW1vdmUgdHJhaWxpbmcgI3NcbiAgICAgICAgICAgIGlmICgvIyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkID0gcnRyaW0odGV4dCwgJyMnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXRyaW1tZWQgfHwgLyAkLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbW1vbk1hcmsgcmVxdWlyZXMgc3BhY2UgYmVmb3JlIHRyYWlsaW5nICNzXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGhyKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnaHInLFxuICAgICAgICAgICAgICAgIHJhdzogcnRyaW0oY2FwWzBdLCAnXFxuJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGJsb2NrcXVvdGUoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suYmxvY2txdW90ZS5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCBsaW5lcyA9IHJ0cmltKGNhcFswXSwgJ1xcbicpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIGxldCByYXcgPSAnJztcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gJyc7XG4gICAgICAgICAgICBjb25zdCB0b2tlbnMgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlIChsaW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGluQmxvY2txdW90ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBpO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgbGluZXMgdXAgdG8gYSBjb250aW51YXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eIHswLDN9Pi8udGVzdChsaW5lc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRMaW5lcy5wdXNoKGxpbmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluQmxvY2txdW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWluQmxvY2txdW90ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudExpbmVzLnB1c2gobGluZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGluZXMgPSBsaW5lcy5zbGljZShpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50UmF3ID0gY3VycmVudExpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUZXh0ID0gY3VycmVudFJhd1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmVjZWRlIHNldGV4dCBjb250aW51YXRpb24gd2l0aCA0IHNwYWNlcyBzbyBpdCBpc24ndCBhIHNldGV4dFxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxuIHswLDN9KCg/Oj0rfC0rKSAqKSg/PVxcbnwkKS9nLCAnXFxuICAgICQxJylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL14gezAsM30+WyBcXHRdPy9nbSwgJycpO1xuICAgICAgICAgICAgICAgIHJhdyA9IHJhdyA/IGAke3Jhd31cXG4ke2N1cnJlbnRSYXd9YCA6IGN1cnJlbnRSYXc7XG4gICAgICAgICAgICAgICAgdGV4dCA9IHRleHQgPyBgJHt0ZXh0fVxcbiR7Y3VycmVudFRleHR9YCA6IGN1cnJlbnRUZXh0O1xuICAgICAgICAgICAgICAgIC8vIHBhcnNlIGJsb2NrcXVvdGUgbGluZXMgYXMgdG9wIGxldmVsIHRva2Vuc1xuICAgICAgICAgICAgICAgIC8vIG1lcmdlIHBhcmFncmFwaHMgaWYgdGhpcyBpcyBhIGNvbnRpbnVhdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGV4ZXIuc3RhdGUudG9wO1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKGN1cnJlbnRUZXh0LCB0b2tlbnMsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdG9wO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGNvbnRpbnVhdGlvbiB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuPy50eXBlID09PSAnY29kZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYmxvY2txdW90ZSBjb250aW51YXRpb24gY2Fubm90IGJlIHByZWNlZGVkIGJ5IGEgY29kZSBibG9ja1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobGFzdFRva2VuPy50eXBlID09PSAnYmxvY2txdW90ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jbHVkZSBjb250aW51YXRpb24gaW4gbmVzdGVkIGJsb2NrcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVG9rZW4gPSBsYXN0VG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSBvbGRUb2tlbi5yYXcgKyAnXFxuJyArIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUb2tlbiA9IHRoaXMuYmxvY2txdW90ZShuZXdUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IG5ld1Rva2VuO1xuICAgICAgICAgICAgICAgICAgICByYXcgPSByYXcuc3Vic3RyaW5nKDAsIHJhdy5sZW5ndGggLSBvbGRUb2tlbi5yYXcubGVuZ3RoKSArIG5ld1Rva2VuLnJhdztcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoIC0gb2xkVG9rZW4udGV4dC5sZW5ndGgpICsgbmV3VG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxhc3RUb2tlbj8udHlwZSA9PT0gJ2xpc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluY2x1ZGUgY29udGludWF0aW9uIGluIG5lc3RlZCBsaXN0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFRva2VuID0gbGFzdFRva2VuO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdUZXh0ID0gb2xkVG9rZW4ucmF3ICsgJ1xcbicgKyBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VG9rZW4gPSB0aGlzLmxpc3QobmV3VGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gPSBuZXdUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgcmF3ID0gcmF3LnN1YnN0cmluZygwLCByYXcubGVuZ3RoIC0gbGFzdFRva2VuLnJhdy5sZW5ndGgpICsgbmV3VG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggLSBvbGRUb2tlbi5yYXcubGVuZ3RoKSArIG5ld1Rva2VuLnJhdztcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBuZXdUZXh0LnN1YnN0cmluZyh0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLnJhdy5sZW5ndGgpLnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2txdW90ZScsXG4gICAgICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgICAgIHRva2VucyxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaXN0KHNyYykge1xuICAgICAgICBsZXQgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saXN0LmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgbGV0IGJ1bGwgPSBjYXBbMV0udHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgaXNvcmRlcmVkID0gYnVsbC5sZW5ndGggPiAxO1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgICAgICAgICAgcmF3OiAnJyxcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiBpc29yZGVyZWQsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsLnNsaWNlKDAsIC0xKSA6ICcnLFxuICAgICAgICAgICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGBcXFxcZHsxLDl9XFxcXCR7YnVsbC5zbGljZSgtMSl9YCA6IGBcXFxcJHtidWxsfWA7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGJ1bGwgOiAnWyorLV0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IG5leHQgbGlzdCBpdGVtXG4gICAgICAgICAgICBjb25zdCBpdGVtUmVnZXggPSBuZXcgUmVnRXhwKGBeKCB7MCwzfSR7YnVsbH0pKCg/OltcXHQgXVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgICBsZXQgZW5kc1dpdGhCbGFua0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgYnVsbGV0IHBvaW50IGNhbiBzdGFydCBhIG5ldyBMaXN0IEl0ZW1cbiAgICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgICAgICBsZXQgZW5kRWFybHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgcmF3ID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1Db250ZW50cyA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICghKGNhcCA9IGl0ZW1SZWdleC5leGVjKHNyYykpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ydWxlcy5ibG9jay5oci50ZXN0KHNyYykpIHsgLy8gRW5kIGxpc3QgaWYgYnVsbGV0IHdhcyBhY3R1YWxseSBIUiAocG9zc2libHkgbW92ZSBpbnRvIGl0ZW1SZWdleD8pXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYXcgPSBjYXBbMF07XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZSA9IGNhcFsyXS5zcGxpdCgnXFxuJywgMSlbMF0ucmVwbGFjZSgvXlxcdCsvLCAodCkgPT4gJyAnLnJlcGVhdCgzICogdC5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dExpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgICAgIGxldCBibGFua0xpbmUgPSAhbGluZS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAyO1xuICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnRyaW1TdGFydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChibGFua0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gY2FwWzFdLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBjYXBbMl0uc2VhcmNoKC9bXiBdLyk7IC8vIEZpbmQgZmlyc3Qgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gaW5kZW50ID4gNCA/IDEgOiBpbmRlbnQ7IC8vIFRyZWF0IGluZGVudGVkIGNvZGUgYmxvY2tzICg+IDQgc3BhY2VzKSBhcyBoYXZpbmcgb25seSAxIGluZGVudFxuICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSBjYXBbMV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lICYmIC9eWyBcXHRdKiQvLnRlc3QobmV4dExpbmUpKSB7IC8vIEl0ZW1zIGJlZ2luIHdpdGggYXQgbW9zdCBvbmUgYmxhbmsgbGluZVxuICAgICAgICAgICAgICAgICAgICByYXcgKz0gbmV4dExpbmUgKyAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhuZXh0TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kRWFybHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVuZEVhcmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRCdWxsZXRSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86WyorLV18XFxcXGR7MSw5fVsuKV0pKCg/OlsgXFx0XVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhyUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlbmNlc0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlxcYFxcYFxcYHx+fn4pYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRpbmdCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0jYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX08KD86W2Etel0uKj58IS0tKWAsICdpJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGxvd2luZyBsaW5lcyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gTGlzdCBJdGVtXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0xpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRMaW5lV2l0aG91dFRhYnM7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0TGluZSA9IHJhd0xpbmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZS1hbGlnbiB0byBmb2xsb3cgY29tbW9ubWFyayBuZXN0aW5nIHJ1bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dExpbmUgPSBuZXh0TGluZS5yZXBsYWNlKC9eIHsxLDR9KD89KCB7NH0pKlteIF0pL2csICcgICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRMaW5lV2l0aG91dFRhYnMgPSBuZXh0TGluZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRMaW5lV2l0aG91dFRhYnMgPSBuZXh0TGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgY29kZSBmZW5jZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBoZWFkaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgaHRtbCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGh0bWxCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBidWxsZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0QnVsbGV0UmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgcnVsZSBmb3VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGluZVdpdGhvdXRUYWJzLnNlYXJjaCgvW14gXS8pID49IGluZGVudCB8fCAhbmV4dExpbmUudHJpbSgpKSB7IC8vIERlZGVudCBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lV2l0aG91dFRhYnMuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBlbm91Z2ggaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwYXJhZ3JhcGggY29udGludWF0aW9uIHVubGVzcyBsYXN0IGxpbmUgd2FzIGEgZGlmZmVyZW50IGJsb2NrIGxldmVsIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKS5zZWFyY2goL1teIF0vKSA+PSA0KSB7IC8vIGluZGVudGVkIGNvZGUgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYmxhbmtMaW5lICYmICFuZXh0TGluZS50cmltKCkpIHsgLy8gQ2hlY2sgaWYgY3VycmVudCBsaW5lIGlzIGJsYW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdyArPSByYXdMaW5lICsgJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhd0xpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lID0gbmV4dExpbmVXaXRob3V0VGFicy5zbGljZShpbmRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgaXRlbSBlbmRlZCB3aXRoIGEgYmxhbmsgbGluZSwgdGhlIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZHNXaXRoQmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0Lmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICgvXFxuWyBcXHRdKlxcblsgXFx0XSokLy50ZXN0KHJhdykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHNXaXRoQmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaXN0YXNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsZXQgaXNjaGVja2VkO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciB0YXNrIGxpc3QgaXRlbXNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgICAgICAgICAgICAgICBpc3Rhc2sgPSAvXlxcW1sgeFhdXFxdIC8uZXhlYyhpdGVtQ29udGVudHMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXN0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc2NoZWNrZWQgPSBpc3Rhc2tbMF0gIT09ICdbIF0gJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGl0ZW1Db250ZW50cy5yZXBsYWNlKC9eXFxbWyB4WF1cXF0gKy8sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsaXN0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgICAgICAgICB0YXNrOiAhIWlzdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogaXNjaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW1Db250ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zOiBbXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsaXN0LnJhdyArPSByYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEbyBub3QgY29uc3VtZSBuZXdsaW5lcyBhdCBlbmQgb2YgZmluYWwgaXRlbS4gQWx0ZXJuYXRpdmVseSwgbWFrZSBpdGVtUmVnZXggKnN0YXJ0KiB3aXRoIGFueSBuZXdsaW5lcyB0byBzaW1wbGlmeS9zcGVlZCB1cCBlbmRzV2l0aEJsYW5rTGluZSBsb2dpY1xuICAgICAgICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnJhdyA9IGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS5yYXcudHJpbUVuZCgpO1xuICAgICAgICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnRleHQgPSBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0udGV4dC50cmltRW5kKCk7XG4gICAgICAgICAgICBsaXN0LnJhdyA9IGxpc3QucmF3LnRyaW1FbmQoKTtcbiAgICAgICAgICAgIC8vIEl0ZW0gY2hpbGQgdG9rZW5zIGhhbmRsZWQgaGVyZSBhdCBlbmQgYmVjYXVzZSB3ZSBuZWVkZWQgdG8gaGF2ZSB0aGUgZmluYWwgaXRlbSB0byB0cmltIGl0IGZpcnN0XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxpc3QuaXRlbXNbaV0udG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2VucyhsaXN0Lml0ZW1zW2ldLnRleHQsIFtdKTtcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgbGlzdCBzaG91bGQgYmUgbG9vc2VcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BhY2VycyA9IGxpc3QuaXRlbXNbaV0udG9rZW5zLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc011bHRpcGxlTGluZUJyZWFrcyA9IHNwYWNlcnMubGVuZ3RoID4gMCAmJiBzcGFjZXJzLnNvbWUodCA9PiAvXFxuLipcXG4vLnRlc3QodC5yYXcpKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5sb29zZSA9IGhhc011bHRpcGxlTGluZUJyZWFrcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZXQgYWxsIGl0ZW1zIHRvIGxvb3NlIGlmIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICAgIGlmIChsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QuaXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGh0bWwoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHRtbC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICBibG9jazogdHJ1ZSxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBwcmU6IGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScsXG4gICAgICAgICAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWYoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZGVmLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdGFnID0gY2FwWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGNhcFsyXSA/IGNhcFsyXS5yZXBsYWNlKC9ePCguKik+JC8sICckMScpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogJyc7XG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zdWJzdHJpbmcoMSwgY2FwWzNdLmxlbmd0aCAtIDEpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogY2FwWzNdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGVmJyxcbiAgICAgICAgICAgICAgICB0YWcsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICAgICAgaHJlZixcbiAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGFibGUoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGFibGUuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoIWNhcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL1s6fF0vLnRlc3QoY2FwWzJdKSkge1xuICAgICAgICAgICAgLy8gZGVsaW1pdGVyIHJvdyBtdXN0IGhhdmUgYSBwaXBlICh8KSBvciBjb2xvbiAoOikgb3RoZXJ3aXNlIGl0IGlzIGEgc2V0ZXh0IGhlYWRpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJzID0gc3BsaXRDZWxscyhjYXBbMV0pO1xuICAgICAgICBjb25zdCBhbGlnbnMgPSBjYXBbMl0ucmVwbGFjZSgvXlxcfHxcXHwgKiQvZywgJycpLnNwbGl0KCd8Jyk7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBjYXBbM10gJiYgY2FwWzNdLnRyaW0oKSA/IGNhcFszXS5yZXBsYWNlKC9cXG5bIFxcdF0qJC8sICcnKS5zcGxpdCgnXFxuJykgOiBbXTtcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgIGhlYWRlcjogW10sXG4gICAgICAgICAgICBhbGlnbjogW10sXG4gICAgICAgICAgICByb3dzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGhlYWRlcnMubGVuZ3RoICE9PSBhbGlnbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBoZWFkZXIgYW5kIGFsaWduIGNvbHVtbnMgbXVzdCBiZSBlcXVhbCwgcm93cyBjYW4gYmUgZGlmZmVyZW50LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgYWxpZ24gb2YgYWxpZ25zKSB7XG4gICAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ3JpZ2h0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ2NlbnRlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChhbGlnbikpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmFsaWduLnB1c2goJ2xlZnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW0uYWxpZ24ucHVzaChudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZW0uaGVhZGVyLnB1c2goe1xuICAgICAgICAgICAgICAgIHRleHQ6IGhlYWRlcnNbaV0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShoZWFkZXJzW2ldKSxcbiAgICAgICAgICAgICAgICBoZWFkZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgYWxpZ246IGl0ZW0uYWxpZ25baV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICBpdGVtLnJvd3MucHVzaChzcGxpdENlbGxzKHJvdywgaXRlbS5oZWFkZXIubGVuZ3RoKS5tYXAoKGNlbGwsIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjZWxsLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNlbGwpLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbjogaXRlbS5hbGlnbltpXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cbiAgICBsaGVhZGluZyhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saGVhZGluZy5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXBbMV0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMV0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhZ3JhcGgoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sucGFyYWdyYXBoLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgICAgICAgIDogY2FwWzFdO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHRleHQoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGV4dC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIHRleHQ6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFswXSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGVzY2FwZShzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZXNjYXBlLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBlc2NhcGUkMShjYXBbMV0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0YWcoc3JjKSB7XG4gICAgICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRhZy5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjwocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICBpbkxpbms6IHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLFxuICAgICAgICAgICAgICAgIGluUmF3QmxvY2s6IHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayxcbiAgICAgICAgICAgICAgICBibG9jazogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaW5rKHNyYykge1xuICAgICAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZFVybCA9IGNhcFsyXS50cmltKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAvXjwvLnRlc3QodHJpbW1lZFVybCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjb21tb25tYXJrIHJlcXVpcmVzIG1hdGNoaW5nIGFuZ2xlIGJyYWNrZXRzXG4gICAgICAgICAgICAgICAgaWYgKCEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVuZGluZyBhbmdsZSBicmFja2V0IGNhbm5vdCBiZSBlc2NhcGVkXG4gICAgICAgICAgICAgICAgY29uc3QgcnRyaW1TbGFzaCA9IHJ0cmltKHRyaW1tZWRVcmwuc2xpY2UoMCwgLTEpLCAnXFxcXCcpO1xuICAgICAgICAgICAgICAgIGlmICgodHJpbW1lZFVybC5sZW5ndGggLSBydHJpbVNsYXNoLmxlbmd0aCkgJSAyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmaW5kIGNsb3NpbmcgcGFyZW50aGVzaXNcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UGFyZW5JbmRleCA9IGZpbmRDbG9zaW5nQnJhY2tldChjYXBbMl0sICcoKScpO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyZW5JbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gY2FwWzBdLmluZGV4T2YoJyEnKSA9PT0gMCA/IDUgOiA0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rTGVuID0gc3RhcnQgKyBjYXBbMV0ubGVuZ3RoICsgbGFzdFBhcmVuSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGhyZWYgPSBjYXBbMl07XG4gICAgICAgICAgICBsZXQgdGl0bGUgPSAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICAgICAgICAvLyBzcGxpdCBwZWRhbnRpYyBocmVmIGFuZCB0aXRsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSAvXihbXidcIl0qW15cXHNdKVxccysoWydcIl0pKC4qKVxcMi8uZXhlYyhocmVmKTtcbiAgICAgICAgICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gbGlua1sxXTtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHJlZiA9IGhyZWYudHJpbSgpO1xuICAgICAgICAgICAgaWYgKC9ePC8udGVzdChocmVmKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBlZGFudGljIGFsbG93cyBzdGFydGluZyBhbmdsZSBicmFja2V0IHdpdGhvdXQgZW5kaW5nIGFuZ2xlIGJyYWNrZXRcbiAgICAgICAgICAgICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZiA/IGhyZWYucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbiwgJyQxJykgOiBocmVmLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSA/IHRpdGxlLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sICckMScpIDogdGl0bGUsXG4gICAgICAgICAgICB9LCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZmxpbmsoc3JjLCBsaW5rcykge1xuICAgICAgICBsZXQgY2FwO1xuICAgICAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5rU3RyaW5nID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBsaW5rc1tsaW5rU3RyaW5nLnRvTG93ZXJDYXNlKCldO1xuICAgICAgICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwgbGluaywgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIgPSAnJykge1xuICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ0xEZWxpbS5leGVjKHNyYyk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIF8gY2FuJ3QgYmUgYmV0d2VlbiB0d28gYWxwaGFudW1lcmljcy4gXFxwe0x9XFxwe059IGluY2x1ZGVzIG5vbi1lbmdsaXNoIGFscGhhYmV0L251bWJlcnMgYXMgd2VsbFxuICAgICAgICBpZiAobWF0Y2hbM10gJiYgcHJldkNoYXIubWF0Y2goL1tcXHB7TH1cXHB7Tn1dL3UpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBuZXh0Q2hhciA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8ICcnO1xuICAgICAgICBpZiAoIW5leHRDaGFyIHx8ICFwcmV2Q2hhciB8fCB0aGlzLnJ1bGVzLmlubGluZS5wdW5jdHVhdGlvbi5leGVjKHByZXZDaGFyKSkge1xuICAgICAgICAgICAgLy8gdW5pY29kZSBSZWdleCBjb3VudHMgZW1vamkgYXMgMSBjaGFyOyBzcHJlYWQgaW50byBhcnJheSBmb3IgcHJvcGVyIGNvdW50ICh1c2VkIG11bHRpcGxlIHRpbWVzIGJlbG93KVxuICAgICAgICAgICAgY29uc3QgbExlbmd0aCA9IFsuLi5tYXRjaFswXV0ubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGxldCByRGVsaW0sIHJMZW5ndGgsIGRlbGltVG90YWwgPSBsTGVuZ3RoLCBtaWREZWxpbVRvdGFsID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGVuZFJlZyA9IG1hdGNoWzBdWzBdID09PSAnKicgPyB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ1JEZWxpbUFzdCA6IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nUkRlbGltVW5kO1xuICAgICAgICAgICAgZW5kUmVnLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAvLyBDbGlwIG1hc2tlZFNyYyB0byBzYW1lIHNlY3Rpb24gb2Ygc3RyaW5nIGFzIHNyYyAobW92ZSB0byBsZXhlcj8pXG4gICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoLTEgKiBzcmMubGVuZ3RoICsgbExlbmd0aCk7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gZW5kUmVnLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJEZWxpbSA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8IG1hdGNoWzNdIHx8IG1hdGNoWzRdIHx8IG1hdGNoWzVdIHx8IG1hdGNoWzZdO1xuICAgICAgICAgICAgICAgIGlmICghckRlbGltKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gc2tpcCBzaW5nbGUgKiBpbiBfX2FiYyphYmNfX1xuICAgICAgICAgICAgICAgIHJMZW5ndGggPSBbLi4uckRlbGltXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoWzNdIHx8IG1hdGNoWzRdKSB7IC8vIGZvdW5kIGFub3RoZXIgTGVmdCBEZWxpbVxuICAgICAgICAgICAgICAgICAgICBkZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtYXRjaFs1XSB8fCBtYXRjaFs2XSkgeyAvLyBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbVxuICAgICAgICAgICAgICAgICAgICBpZiAobExlbmd0aCAlIDMgJiYgISgobExlbmd0aCArIHJMZW5ndGgpICUgMykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZERlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBDb21tb25NYXJrIEVtcGhhc2lzIFJ1bGVzIDktMTBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxpbVRvdGFsIC09IHJMZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRlbGltVG90YWwgPiAwKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gSGF2ZW4ndCBmb3VuZCBlbm91Z2ggY2xvc2luZyBkZWxpbWl0ZXJzXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGV4dHJhIGNoYXJhY3RlcnMuICphKioqIC0+ICphKlxuICAgICAgICAgICAgICAgIHJMZW5ndGggPSBNYXRoLm1pbihyTGVuZ3RoLCByTGVuZ3RoICsgZGVsaW1Ub3RhbCArIG1pZERlbGltVG90YWwpO1xuICAgICAgICAgICAgICAgIC8vIGNoYXIgbGVuZ3RoIGNhbiBiZSA+MSBmb3IgdW5pY29kZSBjaGFyYWN0ZXJzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDaGFyTGVuZ3RoID0gWy4uLm1hdGNoWzBdXVswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gc3JjLnNsaWNlKDAsIGxMZW5ndGggKyBtYXRjaC5pbmRleCArIGxhc3RDaGFyTGVuZ3RoICsgckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGBlbWAgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBvZGQgY2hhciBjb3VudC4gKmEqKipcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5taW4obExlbmd0aCwgckxlbmd0aCkgJSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgJ3N0cm9uZycgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBldmVuIGNoYXIgY291bnQuICoqYSoqKlxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMiwgLTIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJvbmcnLFxuICAgICAgICAgICAgICAgICAgICByYXcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2Rlc3BhbihzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnJlcGxhY2UoL1xcbi9nLCAnICcpO1xuICAgICAgICAgICAgY29uc3QgaGFzTm9uU3BhY2VDaGFycyA9IC9bXiBdLy50ZXN0KHRleHQpO1xuICAgICAgICAgICAgY29uc3QgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMgPSAvXiAvLnRlc3QodGV4dCkgJiYgLyAkLy50ZXN0KHRleHQpO1xuICAgICAgICAgICAgaWYgKGhhc05vblNwYWNlQ2hhcnMgJiYgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMSh0ZXh0LCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvZGVzcGFuJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBicihzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYnIuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdicicsXG4gICAgICAgICAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlbChzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZGVsLmV4ZWMoc3JjKTtcbiAgICAgICAgaWYgKGNhcCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGVsJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXBbMl0sXG4gICAgICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2VucyhjYXBbMl0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhdXRvbGluayhzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYXV0b2xpbmsuZXhlYyhzcmMpO1xuICAgICAgICBpZiAoY2FwKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgICAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMShjYXBbMV0pO1xuICAgICAgICAgICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IGVzY2FwZSQxKGNhcFsxXSk7XG4gICAgICAgICAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXJsKHNyYykge1xuICAgICAgICBsZXQgY2FwO1xuICAgICAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudXJsLmV4ZWMoc3JjKSkge1xuICAgICAgICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICAgICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZXNjYXBlJDEoY2FwWzBdKTtcbiAgICAgICAgICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcmV2Q2FwWmVybztcbiAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZDYXBaZXJvID0gY2FwWzBdO1xuICAgICAgICAgICAgICAgICAgICBjYXBbMF0gPSB0aGlzLnJ1bGVzLmlubGluZS5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKT8uWzBdID8/ICcnO1xuICAgICAgICAgICAgICAgIH0gd2hpbGUgKHByZXZDYXBaZXJvICE9PSBjYXBbMF0pO1xuICAgICAgICAgICAgICAgIHRleHQgPSBlc2NhcGUkMShjYXBbMF0pO1xuICAgICAgICAgICAgICAgIGlmIChjYXBbMV0gPT09ICd3d3cuJykge1xuICAgICAgICAgICAgICAgICAgICBocmVmID0gJ2h0dHA6Ly8nICsgY2FwWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaHJlZiA9IGNhcFswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5saW5lVGV4dChzcmMpIHtcbiAgICAgICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKHNyYyk7XG4gICAgICAgIGlmIChjYXApIHtcbiAgICAgICAgICAgIGxldCB0ZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaykge1xuICAgICAgICAgICAgICAgIHRleHQgPSBjYXBbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZXNjYXBlJDEoY2FwWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgbmV3bGluZSA9IC9eKD86WyBcXHRdKig/OlxcbnwkKSkrLztcbmNvbnN0IGJsb2NrQ29kZSA9IC9eKCg/OiB7NH18IHswLDN9XFx0KVteXFxuXSsoPzpcXG4oPzpbIFxcdF0qKD86XFxufCQpKSopPykrLztcbmNvbnN0IGZlbmNlcyA9IC9eIHswLDN9KGB7Myx9KD89W15gXFxuXSooPzpcXG58JCkpfH57Myx9KShbXlxcbl0qKSg/OlxcbnwkKSg/OnwoW1xcc1xcU10qPykoPzpcXG58JCkpKD86IHswLDN9XFwxW35gXSogKig/PVxcbnwkKXwkKS87XG5jb25zdCBociA9IC9eIHswLDN9KCg/Oi1bXFx0IF0qKXszLH18KD86X1sgXFx0XSopezMsfXwoPzpcXCpbIFxcdF0qKXszLH0pKD86XFxuK3wkKS87XG5jb25zdCBoZWFkaW5nID0gL14gezAsM30oI3sxLDZ9KSg/PVxcc3wkKSguKikoPzpcXG4rfCQpLztcbmNvbnN0IGJ1bGxldCA9IC8oPzpbKistXXxcXGR7MSw5fVsuKV0pLztcbmNvbnN0IGxoZWFkaW5nID0gZWRpdCgvXig/IWJ1bGwgfGJsb2NrQ29kZXxmZW5jZXN8YmxvY2txdW90ZXxoZWFkaW5nfGh0bWwpKCg/Oi58XFxuKD8hXFxzKj9cXG58YnVsbCB8YmxvY2tDb2RlfGZlbmNlc3xibG9ja3F1b3RlfGhlYWRpbmd8aHRtbCkpKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8pXG4gICAgLnJlcGxhY2UoL2J1bGwvZywgYnVsbGV0KSAvLyBsaXN0cyBjYW4gaW50ZXJydXB0XG4gICAgLnJlcGxhY2UoL2Jsb2NrQ29kZS9nLCAvKD86IHs0fXwgezAsM31cXHQpLykgLy8gaW5kZW50ZWQgY29kZSBibG9ja3MgY2FuIGludGVycnVwdFxuICAgIC5yZXBsYWNlKC9mZW5jZXMvZywgLyB7MCwzfSg/OmB7Myx9fH57Myx9KS8pIC8vIGZlbmNlZCBjb2RlIGJsb2NrcyBjYW4gaW50ZXJydXB0XG4gICAgLnJlcGxhY2UoL2Jsb2NrcXVvdGUvZywgLyB7MCwzfT4vKSAvLyBibG9ja3F1b3RlIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgvaGVhZGluZy9nLCAvIHswLDN9I3sxLDZ9LykgLy8gQVRYIGhlYWRpbmcgY2FuIGludGVycnVwdFxuICAgIC5yZXBsYWNlKC9odG1sL2csIC8gezAsM308W15cXG4+XSs+XFxuLykgLy8gYmxvY2sgaHRtbCBjYW4gaW50ZXJydXB0XG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBfcGFyYWdyYXBoID0gL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXxmZW5jZXN8bGlzdHxodG1sfHRhYmxlfCArXFxuKVteXFxuXSspKikvO1xuY29uc3QgYmxvY2tUZXh0ID0gL15bXlxcbl0rLztcbmNvbnN0IF9ibG9ja0xhYmVsID0gLyg/IVxccypcXF0pKD86XFxcXC58W15cXFtcXF1cXFxcXSkrLztcbmNvbnN0IGRlZiA9IGVkaXQoL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuWyBcXHRdKik/KFtePFxcc11bXlxcc10qfDwuKj8+KSg/Oig/OiArKD86XFxuWyBcXHRdKik/fCAqXFxuWyBcXHRdKikodGl0bGUpKT8gKig/Olxcbit8JCkvKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9ibG9ja0xhYmVsKVxuICAgIC5yZXBsYWNlKCd0aXRsZScsIC8oPzpcIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnW14nXFxuXSooPzpcXG5bXidcXG5dKykqXFxuPyd8XFwoW14oKV0qXFwpKS8pXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBsaXN0ID0gZWRpdCgvXiggezAsM31idWxsKShbIFxcdF1bXlxcbl0rPyk/KD86XFxufCQpLylcbiAgICAucmVwbGFjZSgvYnVsbC9nLCBidWxsZXQpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBfdGFnID0gJ2FkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9uJ1xuICAgICsgJ3xjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbidcbiAgICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgICArICd8bGVnZW5kfGxpfGxpbmt8bWFpbnxtZW51fG1lbnVpdGVtfG1ldGF8bmF2fG5vZnJhbWVzfG9sfG9wdGdyb3VwfG9wdGlvbidcbiAgICArICd8cHxwYXJhbXxzZWFyY2h8c2VjdGlvbnxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlJ1xuICAgICsgJ3x0cnx0cmFja3x1bCc7XG5jb25zdCBfY29tbWVudCA9IC88IS0tKD86LT8+fFtcXHNcXFNdKj8oPzotLT58JCkpLztcbmNvbnN0IGh0bWwgPSBlZGl0KCdeIHswLDN9KD86JyAvLyBvcHRpb25hbCBpbmRlbnRhdGlvblxuICAgICsgJzwoc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbXFxcXHM+XVtcXFxcc1xcXFxTXSo/KD86PC9cXFxcMT5bXlxcXFxuXSpcXFxcbit8JCknIC8vICgxKVxuICAgICsgJ3xjb21tZW50W15cXFxcbl0qKFxcXFxuK3wkKScgLy8gKDIpXG4gICAgKyAnfDxcXFxcP1tcXFxcc1xcXFxTXSo/KD86XFxcXD8+XFxcXG4qfCQpJyAvLyAoMylcbiAgICArICd8PCFbQS1aXVtcXFxcc1xcXFxTXSo/KD86PlxcXFxuKnwkKScgLy8gKDQpXG4gICAgKyAnfDwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj8oPzpcXFxcXVxcXFxdPlxcXFxuKnwkKScgLy8gKDUpXG4gICAgKyAnfDwvPyh0YWcpKD86ICt8XFxcXG58Lz8+KVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFxcdF0qKStcXFxcbnwkKScgLy8gKDYpXG4gICAgKyAnfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFxcdF0qKStcXFxcbnwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuWyBcXHRdKikrXFxcXG58JCknIC8vICg3KSBjbG9zaW5nIHRhZ1xuICAgICsgJyknLCAnaScpXG4gICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBfY29tbWVudClcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZylcbiAgICAucmVwbGFjZSgnYXR0cmlidXRlJywgLyArW2EtekEtWjpfXVtcXHcuOi1dKig/OiAqPSAqXCJbXlwiXFxuXSpcInwgKj0gKidbXidcXG5dKid8ICo9ICpbXlxcc1wiJz08PmBdKyk/LylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IHBhcmFncmFwaCA9IGVkaXQoX3BhcmFncmFwaClcbiAgICAucmVwbGFjZSgnaHInLCBocilcbiAgICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0oPzpcXFxcc3wkKScpXG4gICAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleHQgaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAgIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IGJsb2NrcXVvdGUgPSBlZGl0KC9eKCB7MCwzfT4gPyhwYXJhZ3JhcGh8W15cXG5dKikoPzpcXG58JCkpKy8pXG4gICAgLnJlcGxhY2UoJ3BhcmFncmFwaCcsIHBhcmFncmFwaClcbiAgICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuY29uc3QgYmxvY2tOb3JtYWwgPSB7XG4gICAgYmxvY2txdW90ZSxcbiAgICBjb2RlOiBibG9ja0NvZGUsXG4gICAgZGVmLFxuICAgIGZlbmNlcyxcbiAgICBoZWFkaW5nLFxuICAgIGhyLFxuICAgIGh0bWwsXG4gICAgbGhlYWRpbmcsXG4gICAgbGlzdCxcbiAgICBuZXdsaW5lLFxuICAgIHBhcmFncmFwaCxcbiAgICB0YWJsZTogbm9vcFRlc3QsXG4gICAgdGV4dDogYmxvY2tUZXh0LFxufTtcbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuY29uc3QgZ2ZtVGFibGUgPSBlZGl0KCdeICooW15cXFxcbiBdLiopXFxcXG4nIC8vIEhlYWRlclxuICAgICsgJyB7MCwzfSgoPzpcXFxcfCAqKT86Py0rOj8gKig/OlxcXFx8ICo6Py0rOj8gKikqKD86XFxcXHwgKik/KScgLy8gQWxpZ25cbiAgICArICcoPzpcXFxcbigoPzooPyEgKlxcXFxufGhyfGhlYWRpbmd8YmxvY2txdW90ZXxjb2RlfGZlbmNlc3xsaXN0fGh0bWwpLiooPzpcXFxcbnwkKSkqKVxcXFxuKnwkKScpIC8vIENlbGxzXG4gICAgLnJlcGxhY2UoJ2hyJywgaHIpXG4gICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9KD86XFxcXHN8JCknKVxuICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgIC5yZXBsYWNlKCdjb2RlJywgJyg/OiB7NH18IHswLDN9XFx0KVteXFxcXG5dJylcbiAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gdGFibGVzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYmxvY2tHZm0gPSB7XG4gICAgLi4uYmxvY2tOb3JtYWwsXG4gICAgdGFibGU6IGdmbVRhYmxlLFxuICAgIHBhcmFncmFwaDogZWRpdChfcGFyYWdyYXBoKVxuICAgICAgICAucmVwbGFjZSgnaHInLCBocilcbiAgICAgICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9KD86XFxcXHN8JCknKVxuICAgICAgICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4dCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gICAgICAgIC5yZXBsYWNlKCd0YWJsZScsIGdmbVRhYmxlKSAvLyBpbnRlcnJ1cHQgcGFyYWdyYXBocyB3aXRoIHRhYmxlXG4gICAgICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgICAgICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gICAgICAgIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gICAgICAgIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAgICAgICAucmVwbGFjZSgndGFnJywgX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBQZWRhbnRpYyBncmFtbWFyIChvcmlnaW5hbCBKb2huIEdydWJlcidzIGxvb3NlIG1hcmtkb3duIHNwZWNpZmljYXRpb24pXG4gKi9cbmNvbnN0IGJsb2NrUGVkYW50aWMgPSB7XG4gICAgLi4uYmxvY2tOb3JtYWwsXG4gICAgaHRtbDogZWRpdCgnXiAqKD86Y29tbWVudCAqKD86XFxcXG58XFxcXHMqJCknXG4gICAgICAgICsgJ3w8KHRhZylbXFxcXHNcXFxcU10rPzwvXFxcXDE+ICooPzpcXFxcbnsyLH18XFxcXHMqJCknIC8vIGNsb3NlZCB0YWdcbiAgICAgICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAgICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBfY29tbWVudClcbiAgICAgICAgLnJlcGxhY2UoL3RhZy9nLCAnKD8hKD86J1xuICAgICAgICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZXx2YXJ8c2FtcHxrYmR8c3ViJ1xuICAgICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICAgKyAnXFxcXGIpXFxcXHcrKD8hOnxbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG4gICAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogKyhbXCIoXVteXFxuXStbXCIpXSkpPyAqKD86XFxuK3wkKS8sXG4gICAgaGVhZGluZzogL14oI3sxLDZ9KSguKikoPzpcXG4rfCQpLyxcbiAgICBmZW5jZXM6IG5vb3BUZXN0LCAvLyBmZW5jZXMgbm90IHN1cHBvcnRlZFxuICAgIGxoZWFkaW5nOiAvXiguKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gICAgcGFyYWdyYXBoOiBlZGl0KF9wYXJhZ3JhcGgpXG4gICAgICAgIC5yZXBsYWNlKCdocicsIGhyKVxuICAgICAgICAucmVwbGFjZSgnaGVhZGluZycsICcgKiN7MSw2fSAqW15cXG5dJylcbiAgICAgICAgLnJlcGxhY2UoJ2xoZWFkaW5nJywgbGhlYWRpbmcpXG4gICAgICAgIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gICAgICAgIC5yZXBsYWNlKCd8ZmVuY2VzJywgJycpXG4gICAgICAgIC5yZXBsYWNlKCd8bGlzdCcsICcnKVxuICAgICAgICAucmVwbGFjZSgnfGh0bWwnLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ3x0YWcnLCAnJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBlc2NhcGUgPSAvXlxcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pLztcbmNvbnN0IGlubGluZUNvZGUgPSAvXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvO1xuY29uc3QgYnIgPSAvXiggezIsfXxcXFxcKVxcbig/IVxccyokKS87XG5jb25zdCBpbmxpbmVUZXh0ID0gL14oYCt8W15gXSkoPzooPz0gezIsfVxcbil8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl9dfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSkpLztcbi8vIGxpc3Qgb2YgdW5pY29kZSBwdW5jdHVhdGlvbiBtYXJrcywgcGx1cyBhbnkgbWlzc2luZyBjaGFyYWN0ZXJzIGZyb20gQ29tbW9uTWFyayBzcGVjXG5jb25zdCBfcHVuY3R1YXRpb24gPSAnXFxcXHB7UH1cXFxccHtTfSc7XG5jb25zdCBwdW5jdHVhdGlvbiA9IGVkaXQoL14oKD8hWypfXSlbXFxzcHVuY3R1YXRpb25dKS8sICd1JylcbiAgICAucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgX3B1bmN0dWF0aW9uKS5nZXRSZWdleCgpO1xuLy8gc2VxdWVuY2VzIGVtIHNob3VsZCBza2lwIG92ZXIgW3RpdGxlXShsaW5rKSwgYGNvZGVgLCA8aHRtbD5cbmNvbnN0IGJsb2NrU2tpcCA9IC9cXFtbXltcXF1dKj9cXF1cXCgoPzpcXFxcLnxbXlxcXFxcXChcXCldfFxcKCg/OlxcXFwufFteXFxcXFxcKFxcKV0pKlxcKSkqXFwpfGBbXmBdKj9gfDxbXjw+XSo/Pi9nO1xuY29uc3QgZW1TdHJvbmdMRGVsaW0gPSBlZGl0KC9eKD86XFwqKyg/OigoPyFcXCopW3B1bmN0XSl8W15cXHMqXSkpfF5fKyg/OigoPyFfKVtwdW5jdF0pfChbXlxcc19dKSkvLCAndScpXG4gICAgLnJlcGxhY2UoL3B1bmN0L2csIF9wdW5jdHVhdGlvbilcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IGVtU3Ryb25nUkRlbGltQXN0ID0gZWRpdCgnXlteXypdKj9fX1teXypdKj9cXFxcKlteXypdKj8oPz1fXyknIC8vIFNraXAgb3JwaGFuIGluc2lkZSBzdHJvbmdcbiAgICArICd8W14qXSsoPz1bXipdKScgLy8gQ29uc3VtZSB0byBkZWxpbVxuICAgICsgJ3woPyFcXFxcKilbcHVuY3RdKFxcXFwqKykoPz1bXFxcXHNdfCQpJyAvLyAoMSkgIyoqKiBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKFxcXFwqKykoPyFcXFxcKikoPz1bcHVuY3RcXFxcc118JCknIC8vICgyKSBhKioqIywgYSoqKiBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3woPyFcXFxcKilbcHVuY3RcXFxcc10oXFxcXCorKSg/PVtecHVuY3RcXFxcc10pJyAvLyAoMykgIyoqKmEsICoqKmEgY2FuIG9ubHkgYmUgTGVmdCBEZWxpbWl0ZXJcbiAgICArICd8W1xcXFxzXShcXFxcKispKD8hXFxcXCopKD89W3B1bmN0XSknIC8vICg0KSAqKiojIGNhbiBvbmx5IGJlIExlZnQgRGVsaW1pdGVyXG4gICAgKyAnfCg/IVxcXFwqKVtwdW5jdF0oXFxcXCorKSg/IVxcXFwqKSg/PVtwdW5jdF0pJyAvLyAoNSkgIyoqKiMgY2FuIGJlIGVpdGhlciBMZWZ0IG9yIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKFxcXFwqKykoPz1bXnB1bmN0XFxcXHNdKScsICdndScpIC8vICg2KSBhKioqYSBjYW4gYmUgZWl0aGVyIExlZnQgb3IgUmlnaHQgRGVsaW1pdGVyXG4gICAgLnJlcGxhY2UoL3B1bmN0L2csIF9wdW5jdHVhdGlvbilcbiAgICAuZ2V0UmVnZXgoKTtcbi8vICg2KSBOb3QgYWxsb3dlZCBmb3IgX1xuY29uc3QgZW1TdHJvbmdSRGVsaW1VbmQgPSBlZGl0KCdeW15fKl0qP1xcXFwqXFxcXCpbXl8qXSo/X1teXypdKj8oPz1cXFxcKlxcXFwqKScgLy8gU2tpcCBvcnBoYW4gaW5zaWRlIHN0cm9uZ1xuICAgICsgJ3xbXl9dKyg/PVteX10pJyAvLyBDb25zdW1lIHRvIGRlbGltXG4gICAgKyAnfCg/IV8pW3B1bmN0XShfKykoPz1bXFxcXHNdfCQpJyAvLyAoMSkgI19fXyBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlclxuICAgICsgJ3xbXnB1bmN0XFxcXHNdKF8rKSg/IV8pKD89W3B1bmN0XFxcXHNdfCQpJyAvLyAoMikgYV9fXyMsIGFfX18gY2FuIG9ubHkgYmUgYSBSaWdodCBEZWxpbWl0ZXJcbiAgICArICd8KD8hXylbcHVuY3RcXFxcc10oXyspKD89W15wdW5jdFxcXFxzXSknIC8vICgzKSAjX19fYSwgX19fYSBjYW4gb25seSBiZSBMZWZ0IERlbGltaXRlclxuICAgICsgJ3xbXFxcXHNdKF8rKSg/IV8pKD89W3B1bmN0XSknIC8vICg0KSBfX18jIGNhbiBvbmx5IGJlIExlZnQgRGVsaW1pdGVyXG4gICAgKyAnfCg/IV8pW3B1bmN0XShfKykoPyFfKSg/PVtwdW5jdF0pJywgJ2d1JykgLy8gKDUpICNfX18jIGNhbiBiZSBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbWl0ZXJcbiAgICAucmVwbGFjZSgvcHVuY3QvZywgX3B1bmN0dWF0aW9uKVxuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYW55UHVuY3R1YXRpb24gPSBlZGl0KC9cXFxcKFtwdW5jdF0pLywgJ2d1JylcbiAgICAucmVwbGFjZSgvcHVuY3QvZywgX3B1bmN0dWF0aW9uKVxuICAgIC5nZXRSZWdleCgpO1xuY29uc3QgYXV0b2xpbmsgPSBlZGl0KC9ePChzY2hlbWU6W15cXHNcXHgwMC1cXHgxZjw+XSp8ZW1haWwpPi8pXG4gICAgLnJlcGxhY2UoJ3NjaGVtZScsIC9bYS16QS1aXVthLXpBLVowLTkrLi1dezEsMzF9LylcbiAgICAucmVwbGFjZSgnZW1haWwnLCAvW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXSsoQClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IF9pbmxpbmVDb21tZW50ID0gZWRpdChfY29tbWVudCkucmVwbGFjZSgnKD86LS0+fCQpJywgJy0tPicpLmdldFJlZ2V4KCk7XG5jb25zdCB0YWcgPSBlZGl0KCdeY29tbWVudCdcbiAgICArICd8XjwvW2EtekEtWl1bXFxcXHc6LV0qXFxcXHMqPicgLy8gc2VsZi1jbG9zaW5nIHRhZ1xuICAgICsgJ3xePFthLXpBLVpdW1xcXFx3LV0qKD86YXR0cmlidXRlKSo/XFxcXHMqLz8+JyAvLyBvcGVuIHRhZ1xuICAgICsgJ3xePFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz4nIC8vIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb24sIGUuZy4gPD9waHAgPz5cbiAgICArICd8XjwhW2EtekEtWl0rXFxcXHNbXFxcXHNcXFxcU10qPz4nIC8vIGRlY2xhcmF0aW9uLCBlLmcuIDwhRE9DVFlQRSBodG1sPlxuICAgICsgJ3xePCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+JykgLy8gQ0RBVEEgc2VjdGlvblxuICAgIC5yZXBsYWNlKCdjb21tZW50JywgX2lubGluZUNvbW1lbnQpXG4gICAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC9cXHMrW2EtekEtWjpfXVtcXHcuOi1dKig/Olxccyo9XFxzKlwiW15cIl0qXCJ8XFxzKj1cXHMqJ1teJ10qJ3xcXHMqPVxccypbXlxcc1wiJz08PmBdKyk/LylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IF9pbmxpbmVMYWJlbCA9IC8oPzpcXFsoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSpcXF18XFxcXC58YFteYF0qYHxbXlxcW1xcXVxcXFxgXSkqPy87XG5jb25zdCBsaW5rID0gZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKFxccyooaHJlZikoPzpcXHMrKHRpdGxlKSk/XFxzKlxcKS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgX2lubGluZUxhYmVsKVxuICAgIC5yZXBsYWNlKCdocmVmJywgLzwoPzpcXFxcLnxbXlxcbjw+XFxcXF0pKz58W15cXHNcXHgwMC1cXHgxZl0qLylcbiAgICAucmVwbGFjZSgndGl0bGUnLCAvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLylcbiAgICAuZ2V0UmVnZXgoKTtcbmNvbnN0IHJlZmxpbmsgPSBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxbKHJlZilcXF0vKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9pbmxpbmVMYWJlbClcbiAgICAucmVwbGFjZSgncmVmJywgX2Jsb2NrTGFiZWwpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCBub2xpbmsgPSBlZGl0KC9eIT9cXFsocmVmKVxcXSg/OlxcW1xcXSk/LylcbiAgICAucmVwbGFjZSgncmVmJywgX2Jsb2NrTGFiZWwpXG4gICAgLmdldFJlZ2V4KCk7XG5jb25zdCByZWZsaW5rU2VhcmNoID0gZWRpdCgncmVmbGlua3xub2xpbmsoPyFcXFxcKCknLCAnZycpXG4gICAgLnJlcGxhY2UoJ3JlZmxpbmsnLCByZWZsaW5rKVxuICAgIC5yZXBsYWNlKCdub2xpbmsnLCBub2xpbmspXG4gICAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5jb25zdCBpbmxpbmVOb3JtYWwgPSB7XG4gICAgX2JhY2twZWRhbDogbm9vcFRlc3QsIC8vIG9ubHkgdXNlZCBmb3IgR0ZNIHVybFxuICAgIGFueVB1bmN0dWF0aW9uLFxuICAgIGF1dG9saW5rLFxuICAgIGJsb2NrU2tpcCxcbiAgICBicixcbiAgICBjb2RlOiBpbmxpbmVDb2RlLFxuICAgIGRlbDogbm9vcFRlc3QsXG4gICAgZW1TdHJvbmdMRGVsaW0sXG4gICAgZW1TdHJvbmdSRGVsaW1Bc3QsXG4gICAgZW1TdHJvbmdSRGVsaW1VbmQsXG4gICAgZXNjYXBlLFxuICAgIGxpbmssXG4gICAgbm9saW5rLFxuICAgIHB1bmN0dWF0aW9uLFxuICAgIHJlZmxpbmssXG4gICAgcmVmbGlua1NlYXJjaCxcbiAgICB0YWcsXG4gICAgdGV4dDogaW5saW5lVGV4dCxcbiAgICB1cmw6IG5vb3BUZXN0LFxufTtcbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lUGVkYW50aWMgPSB7XG4gICAgLi4uaW5saW5lTm9ybWFsLFxuICAgIGxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXCgoLio/KVxcKS8pXG4gICAgICAgIC5yZXBsYWNlKCdsYWJlbCcsIF9pbmxpbmVMYWJlbClcbiAgICAgICAgLmdldFJlZ2V4KCksXG4gICAgcmVmbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxccypcXFsoW15cXF1dKilcXF0vKVxuICAgICAgICAucmVwbGFjZSgnbGFiZWwnLCBfaW5saW5lTGFiZWwpXG4gICAgICAgIC5nZXRSZWdleCgpLFxufTtcbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cbmNvbnN0IGlubGluZUdmbSA9IHtcbiAgICAuLi5pbmxpbmVOb3JtYWwsXG4gICAgZXNjYXBlOiBlZGl0KGVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gICAgdXJsOiBlZGl0KC9eKCg/OmZ0cHxodHRwcz8pOlxcL1xcL3x3d3dcXC4pKD86W2EtekEtWjAtOVxcLV0rXFwuPykrW15cXHM8XSp8XmVtYWlsLywgJ2knKVxuICAgICAgICAucmVwbGFjZSgnZW1haWwnLCAvW0EtWmEtejAtOS5fKy1dKyhAKVthLXpBLVowLTktX10rKD86XFwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvKVxuICAgICAgICAuZ2V0UmVnZXgoKSxcbiAgICBfYmFja3BlZGFsOiAvKD86W14/IS4sOjsqXydcIn4oKSZdK3xcXChbXildKlxcKXwmKD8hW2EtekEtWjAtOV0rOyQpfFs/IS4sOjsqXydcIn4pXSsoPyEkKSkrLyxcbiAgICBkZWw6IC9eKH5+PykoPz1bXlxcc35dKSgoPzpcXFxcLnxbXlxcXFxdKSo/KD86XFxcXC58W15cXHN+XFxcXF0pKVxcMSg/PVtefl18JCkvLFxuICAgIHRleHQ6IC9eKFtgfl0rfFteYH5dKSg/Oig/PSB7Mix9XFxuKXwoPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCp+X118XFxiX3xodHRwcz86XFwvXFwvfGZ0cDpcXC9cXC98d3d3XFwufCQpfFteIF0oPz0gezIsfVxcbil8W15hLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0oPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApKSkvLFxufTtcbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lQnJlYWtzID0ge1xuICAgIC4uLmlubGluZUdmbSxcbiAgICBicjogZWRpdChicikucmVwbGFjZSgnezIsfScsICcqJykuZ2V0UmVnZXgoKSxcbiAgICB0ZXh0OiBlZGl0KGlubGluZUdmbS50ZXh0KVxuICAgICAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAgICAgLnJlcGxhY2UoL1xcezIsXFx9L2csICcqJylcbiAgICAgICAgLmdldFJlZ2V4KCksXG59O1xuLyoqXG4gKiBleHBvcnRzXG4gKi9cbmNvbnN0IGJsb2NrID0ge1xuICAgIG5vcm1hbDogYmxvY2tOb3JtYWwsXG4gICAgZ2ZtOiBibG9ja0dmbSxcbiAgICBwZWRhbnRpYzogYmxvY2tQZWRhbnRpYyxcbn07XG5jb25zdCBpbmxpbmUgPSB7XG4gICAgbm9ybWFsOiBpbmxpbmVOb3JtYWwsXG4gICAgZ2ZtOiBpbmxpbmVHZm0sXG4gICAgYnJlYWtzOiBpbmxpbmVCcmVha3MsXG4gICAgcGVkYW50aWM6IGlubGluZVBlZGFudGljLFxufTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5jbGFzcyBfTGV4ZXIge1xuICAgIHRva2VucztcbiAgICBvcHRpb25zO1xuICAgIHN0YXRlO1xuICAgIHRva2VuaXplcjtcbiAgICBpbmxpbmVRdWV1ZTtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIC8vIFRva2VuTGlzdCBjYW5ub3QgYmUgY3JlYXRlZCBpbiBvbmUgZ29cbiAgICAgICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgICAgICAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IF9kZWZhdWx0cztcbiAgICAgICAgdGhpcy5vcHRpb25zLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IF9Ub2tlbml6ZXIoKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyO1xuICAgICAgICB0aGlzLnRva2VuaXplci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICB0aGlzLnRva2VuaXplci5sZXhlciA9IHRoaXM7XG4gICAgICAgIHRoaXMuaW5saW5lUXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGluTGluazogZmFsc2UsXG4gICAgICAgICAgICBpblJhd0Jsb2NrOiBmYWxzZSxcbiAgICAgICAgICAgIHRvcDogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcnVsZXMgPSB7XG4gICAgICAgICAgICBibG9jazogYmxvY2subm9ybWFsLFxuICAgICAgICAgICAgaW5saW5lOiBpbmxpbmUubm9ybWFsLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICBydWxlcy5ibG9jayA9IGJsb2NrLnBlZGFudGljO1xuICAgICAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLnBlZGFudGljO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgICAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2suZ2ZtO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgICAgICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuYnJlYWtzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmdmbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRva2VuaXplci5ydWxlcyA9IHJ1bGVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgUnVsZXNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IHJ1bGVzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgICBpbmxpbmUsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBMZXggTWV0aG9kXG4gICAgICovXG4gICAgc3RhdGljIGxleChzcmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGV4ZXIgPSBuZXcgX0xleGVyKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBMZXggSW5saW5lIE1ldGhvZFxuICAgICAqL1xuICAgIHN0YXRpYyBsZXhJbmxpbmUoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxleGVyID0gbmV3IF9MZXhlcihvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGxleGVyLmlubGluZVRva2VucyhzcmMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmVwcm9jZXNzaW5nXG4gICAgICovXG4gICAgbGV4KHNyYykge1xuICAgICAgICBzcmMgPSBzcmNcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKTtcbiAgICAgICAgdGhpcy5ibG9ja1Rva2VucyhzcmMsIHRoaXMudG9rZW5zKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlubGluZVF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5pbmxpbmVRdWV1ZVtpXTtcbiAgICAgICAgICAgIHRoaXMuaW5saW5lVG9rZW5zKG5leHQuc3JjLCBuZXh0LnRva2Vucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZSA9IFtdO1xuICAgICAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gICAgfVxuICAgIGJsb2NrVG9rZW5zKHNyYywgdG9rZW5zID0gW10sIGxhc3RQYXJhZ3JhcGhDbGlwcGVkID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpLnJlcGxhY2UoL14gKyQvZ20sICcnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdG9rZW47XG4gICAgICAgIGxldCBsYXN0VG9rZW47XG4gICAgICAgIGxldCBjdXRTcmM7XG4gICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2suc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBuZXdsaW5lXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5zcGFjZShzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4ucmF3Lmxlbmd0aCA9PT0gMSAmJiB0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSdzIGEgc2luZ2xlIFxcbiBhcyBhIHNwYWNlciwgaXQncyB0ZXJtaW5hdGluZyB0aGUgbGFzdCBsaW5lLFxuICAgICAgICAgICAgICAgICAgICAvLyBzbyBtb3ZlIGl0IHRoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IHVubmVjZXNzYXJ5IHBhcmFncmFwaCB0YWdzXG4gICAgICAgICAgICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0ucmF3ICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvZGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAvLyBBbiBpbmRlbnRlZCBjb2RlIGJsb2NrIGNhbm5vdCBpbnRlcnJ1cHQgYSBwYXJhZ3JhcGguXG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZlbmNlc1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZmVuY2VzKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGhlYWRpbmdcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhlYWRpbmcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaHJcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhyKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJsb2NrcXVvdGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gbGlzdFxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGlzdChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBodG1sXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5odG1sKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRlZlxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVmKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCF0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmOiB0b2tlbi5ocmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRva2VuLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRhYmxlIChnZm0pXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWJsZShzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBsaGVhZGluZ1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGhlYWRpbmcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgICAgICAgICAgLy8gcHJldmVudCBwYXJhZ3JhcGggY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICAgICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2suZm9yRWFjaCgoZ2V0U3RhcnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnRvcCAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5wYXJhZ3JhcGgoY3V0U3JjKSkpIHtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoQ2xpcHBlZCAmJiBsYXN0VG9rZW4/LnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoQ2xpcHBlZCA9IChjdXRTcmMubGVuZ3RoICE9PSBzcmMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGV4dFxuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGV4dChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZS50b3AgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgICBpbmxpbmUoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnB1c2goeyBzcmMsIHRva2VucyB9KTtcbiAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGV4aW5nL0NvbXBpbGluZ1xuICAgICAqL1xuICAgIGlubGluZVRva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmM7XG4gICAgICAgIC8vIFN0cmluZyB3aXRoIGxpbmtzIG1hc2tlZCB0byBhdm9pZCBpbnRlcmZlcmVuY2Ugd2l0aCBlbSBhbmQgc3Ryb25nXG4gICAgICAgIGxldCBtYXNrZWRTcmMgPSBzcmM7XG4gICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgbGV0IGtlZXBQcmV2Q2hhciwgcHJldkNoYXI7XG4gICAgICAgIC8vIE1hc2sgb3V0IHJlZmxpbmtzXG4gICAgICAgIGlmICh0aGlzLnRva2Vucy5saW5rcykge1xuICAgICAgICAgICAgY29uc3QgbGlua3MgPSBPYmplY3Qua2V5cyh0aGlzLnRva2Vucy5saW5rcyk7XG4gICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmtzLmluY2x1ZGVzKG1hdGNoWzBdLnNsaWNlKG1hdGNoWzBdLmxhc3RJbmRleE9mKCdbJykgKyAxLCAtMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgJ2EnLnJlcGVhdChtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5sYXN0SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE1hc2sgb3V0IG90aGVyIGJsb2Nrc1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyAnYScucmVwZWF0KG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAubGFzdEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNYXNrIG91dCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnKysnICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5sYXN0SW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIGlmICgha2VlcFByZXZDaGFyKSB7XG4gICAgICAgICAgICAgICAgcHJldkNoYXIgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtlZXBQcmV2Q2hhciA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXNjYXBlXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lc2NhcGUoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGFnXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWcoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGxpbmtcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpbmsoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5yZWZsaW5rKHNyYywgdGhpcy50b2tlbnMubGlua3MpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZW0gJiBzdHJvbmdcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhcikpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvZGVcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGVzcGFuKHNyYykpIHtcbiAgICAgICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJyXG4gICAgICAgICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5icihzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkZWwgKGdmbSlcbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlbChzcmMpKSB7XG4gICAgICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhdXRvbGlua1xuICAgICAgICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYXV0b2xpbmsoc3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdXJsIChnZm0pXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaW5MaW5rICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnVybChzcmMpKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGV4dFxuICAgICAgICAgICAgLy8gcHJldmVudCBpbmxpbmVUZXh0IGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUuZm9yRWFjaCgoZ2V0U3RhcnRJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmlubGluZVRleHQoY3V0U3JjKSkge1xuICAgICAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnJhdy5zbGljZSgtMSkgIT09ICdfJykgeyAvLyBUcmFjayBwcmV2Q2hhciBiZWZvcmUgc3RyaW5nIG9mIF9fX18gc3RhcnRlZFxuICAgICAgICAgICAgICAgICAgICBwcmV2Q2hhciA9IHRva2VuLnJhdy5zbGljZSgtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGtlZXBQcmV2Q2hhciA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cbmNsYXNzIF9SZW5kZXJlciB7XG4gICAgb3B0aW9ucztcbiAgICBwYXJzZXI7IC8vIHNldCBieSB0aGUgcGFyc2VyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IF9kZWZhdWx0cztcbiAgICB9XG4gICAgc3BhY2UodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb2RlKHsgdGV4dCwgbGFuZywgZXNjYXBlZCB9KSB7XG4gICAgICAgIGNvbnN0IGxhbmdTdHJpbmcgPSAobGFuZyB8fCAnJykubWF0Y2goL15cXFMqLyk/LlswXTtcbiAgICAgICAgY29uc3QgY29kZSA9IHRleHQucmVwbGFjZSgvXFxuJC8sICcnKSArICdcXG4nO1xuICAgICAgICBpZiAoIWxhbmdTdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICAgICAgICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUkMShjb2RlLCB0cnVlKSlcbiAgICAgICAgICAgICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCJsYW5ndWFnZS0nXG4gICAgICAgICAgICArIGVzY2FwZSQxKGxhbmdTdHJpbmcpXG4gICAgICAgICAgICArICdcIj4nXG4gICAgICAgICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZSQxKGNvZGUsIHRydWUpKVxuICAgICAgICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gICAgfVxuICAgIGJsb2NrcXVvdGUoeyB0b2tlbnMgfSkge1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy5wYXJzZXIucGFyc2UodG9rZW5zKTtcbiAgICAgICAgcmV0dXJuIGA8YmxvY2txdW90ZT5cXG4ke2JvZHl9PC9ibG9ja3F1b3RlPlxcbmA7XG4gICAgfVxuICAgIGh0bWwoeyB0ZXh0IH0pIHtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGhlYWRpbmcoeyB0b2tlbnMsIGRlcHRoIH0pIHtcbiAgICAgICAgcmV0dXJuIGA8aCR7ZGVwdGh9PiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKX08L2gke2RlcHRofT5cXG5gO1xuICAgIH1cbiAgICBocih0b2tlbikge1xuICAgICAgICByZXR1cm4gJzxocj5cXG4nO1xuICAgIH1cbiAgICBsaXN0KHRva2VuKSB7XG4gICAgICAgIGNvbnN0IG9yZGVyZWQgPSB0b2tlbi5vcmRlcmVkO1xuICAgICAgICBjb25zdCBzdGFydCA9IHRva2VuLnN0YXJ0O1xuICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLml0ZW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdG9rZW4uaXRlbXNbal07XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMubGlzdGl0ZW0oaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgICAgICAgY29uc3Qgc3RhcnRBdHRyID0gKG9yZGVyZWQgJiYgc3RhcnQgIT09IDEpID8gKCcgc3RhcnQ9XCInICsgc3RhcnQgKyAnXCInKSA6ICcnO1xuICAgICAgICByZXR1cm4gJzwnICsgdHlwZSArIHN0YXJ0QXR0ciArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbiAgICB9XG4gICAgbGlzdGl0ZW0oaXRlbSkge1xuICAgICAgICBsZXQgaXRlbUJvZHkgPSAnJztcbiAgICAgICAgaWYgKGl0ZW0udGFzaykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSB0aGlzLmNoZWNrYm94KHsgY2hlY2tlZDogISFpdGVtLmNoZWNrZWQgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5sb29zZSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vuc1swXS50b2tlbnMgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRva2Vucy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogY2hlY2tib3ggKyAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjaGVja2JveCArICcgJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbUJvZHkgKz0gY2hlY2tib3ggKyAnICc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaXRlbUJvZHkgKz0gdGhpcy5wYXJzZXIucGFyc2UoaXRlbS50b2tlbnMsICEhaXRlbS5sb29zZSk7XG4gICAgICAgIHJldHVybiBgPGxpPiR7aXRlbUJvZHl9PC9saT5cXG5gO1xuICAgIH1cbiAgICBjaGVja2JveCh7IGNoZWNrZWQgfSkge1xuICAgICAgICByZXR1cm4gJzxpbnB1dCAnXG4gICAgICAgICAgICArIChjaGVja2VkID8gJ2NoZWNrZWQ9XCJcIiAnIDogJycpXG4gICAgICAgICAgICArICdkaXNhYmxlZD1cIlwiIHR5cGU9XCJjaGVja2JveFwiPic7XG4gICAgfVxuICAgIHBhcmFncmFwaCh7IHRva2VucyB9KSB7XG4gICAgICAgIHJldHVybiBgPHA+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpfTwvcD5cXG5gO1xuICAgIH1cbiAgICB0YWJsZSh0b2tlbikge1xuICAgICAgICBsZXQgaGVhZGVyID0gJyc7XG4gICAgICAgIC8vIGhlYWRlclxuICAgICAgICBsZXQgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLmhlYWRlci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY2VsbCArPSB0aGlzLnRhYmxlY2VsbCh0b2tlbi5oZWFkZXJbal0pO1xuICAgICAgICB9XG4gICAgICAgIGhlYWRlciArPSB0aGlzLnRhYmxlcm93KHsgdGV4dDogY2VsbCB9KTtcbiAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0b2tlbi5yb3dzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0b2tlbi5yb3dzW2pdO1xuICAgICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCByb3cubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICBjZWxsICs9IHRoaXMudGFibGVjZWxsKHJvd1trXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMudGFibGVyb3coeyB0ZXh0OiBjZWxsIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5KVxuICAgICAgICAgICAgYm9keSA9IGA8dGJvZHk+JHtib2R5fTwvdGJvZHk+YDtcbiAgICAgICAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICAgICAgICAgKyAnPHRoZWFkPlxcbidcbiAgICAgICAgICAgICsgaGVhZGVyXG4gICAgICAgICAgICArICc8L3RoZWFkPlxcbidcbiAgICAgICAgICAgICsgYm9keVxuICAgICAgICAgICAgKyAnPC90YWJsZT5cXG4nO1xuICAgIH1cbiAgICB0YWJsZXJvdyh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gYDx0cj5cXG4ke3RleHR9PC90cj5cXG5gO1xuICAgIH1cbiAgICB0YWJsZWNlbGwodG9rZW4pIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2VuLnRva2Vucyk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0b2tlbi5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgICAgICAgY29uc3QgdGFnID0gdG9rZW4uYWxpZ25cbiAgICAgICAgICAgID8gYDwke3R5cGV9IGFsaWduPVwiJHt0b2tlbi5hbGlnbn1cIj5gXG4gICAgICAgICAgICA6IGA8JHt0eXBlfT5gO1xuICAgICAgICByZXR1cm4gdGFnICsgY29udGVudCArIGA8LyR7dHlwZX0+XFxuYDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3BhbiBsZXZlbCByZW5kZXJlclxuICAgICAqL1xuICAgIHN0cm9uZyh7IHRva2VucyB9KSB7XG4gICAgICAgIHJldHVybiBgPHN0cm9uZz4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyl9PC9zdHJvbmc+YDtcbiAgICB9XG4gICAgZW0oeyB0b2tlbnMgfSkge1xuICAgICAgICByZXR1cm4gYDxlbT4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyl9PC9lbT5gO1xuICAgIH1cbiAgICBjb2Rlc3Bhbih7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gYDxjb2RlPiR7dGV4dH08L2NvZGU+YDtcbiAgICB9XG4gICAgYnIodG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICc8YnI+JztcbiAgICB9XG4gICAgZGVsKHsgdG9rZW5zIH0pIHtcbiAgICAgICAgcmV0dXJuIGA8ZGVsPiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKX08L2RlbD5gO1xuICAgIH1cbiAgICBsaW5rKHsgaHJlZiwgdGl0bGUsIHRva2VucyB9KSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICAgICAgICBjb25zdCBjbGVhbkhyZWYgPSBjbGVhblVybChocmVmKTtcbiAgICAgICAgaWYgKGNsZWFuSHJlZiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgaHJlZiA9IGNsZWFuSHJlZjtcbiAgICAgICAgbGV0IG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgaW1hZ2UoeyBocmVmLCB0aXRsZSwgdGV4dCB9KSB7XG4gICAgICAgIGNvbnN0IGNsZWFuSHJlZiA9IGNsZWFuVXJsKGhyZWYpO1xuICAgICAgICBpZiAoY2xlYW5IcmVmID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICBocmVmID0gY2xlYW5IcmVmO1xuICAgICAgICBsZXQgb3V0ID0gYDxpbWcgc3JjPVwiJHtocmVmfVwiIGFsdD1cIiR7dGV4dH1cImA7XG4gICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgb3V0ICs9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcbiAgICAgICAgfVxuICAgICAgICBvdXQgKz0gJz4nO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICB0ZXh0KHRva2VuKSB7XG4gICAgICAgIHJldHVybiAndG9rZW5zJyBpbiB0b2tlbiAmJiB0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlci5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dDtcbiAgICB9XG59XG5cbi8qKlxuICogVGV4dFJlbmRlcmVyXG4gKiByZXR1cm5zIG9ubHkgdGhlIHRleHR1YWwgcGFydCBvZiB0aGUgdG9rZW5cbiAqL1xuY2xhc3MgX1RleHRSZW5kZXJlciB7XG4gICAgLy8gbm8gbmVlZCBmb3IgYmxvY2sgbGV2ZWwgcmVuZGVyZXJzXG4gICAgc3Ryb25nKHsgdGV4dCB9KSB7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBlbSh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29kZXNwYW4oeyB0ZXh0IH0pIHtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGRlbCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgaHRtbCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgdGV4dCh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgbGluayh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gJycgKyB0ZXh0O1xuICAgIH1cbiAgICBpbWFnZSh7IHRleHQgfSkge1xuICAgICAgICByZXR1cm4gJycgKyB0ZXh0O1xuICAgIH1cbiAgICBicigpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cbmNsYXNzIF9QYXJzZXIge1xuICAgIG9wdGlvbnM7XG4gICAgcmVuZGVyZXI7XG4gICAgdGV4dFJlbmRlcmVyO1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBfZGVmYXVsdHM7XG4gICAgICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgX1JlbmRlcmVyKCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gICAgICAgIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdGhpcy5yZW5kZXJlci5wYXJzZXIgPSB0aGlzO1xuICAgICAgICB0aGlzLnRleHRSZW5kZXJlciA9IG5ldyBfVGV4dFJlbmRlcmVyKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2UodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBfUGFyc2VyKG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gcGFyc2VyLnBhcnNlKHRva2Vucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBQYXJzZSBJbmxpbmUgTWV0aG9kXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlSW5saW5lKHRva2Vucywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgX1BhcnNlcihvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXJzZSBMb29wXG4gICAgICovXG4gICAgcGFyc2UodG9rZW5zLCB0b3AgPSB0cnVlKSB7XG4gICAgICAgIGxldCBvdXQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGFueVRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1thbnlUb2tlbi50eXBlXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdlbmVyaWNUb2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1tnZW5lcmljVG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCBnZW5lcmljVG9rZW4pO1xuICAgICAgICAgICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ3NwYWNlJywgJ2hyJywgJ2hlYWRpbmcnLCAnY29kZScsICd0YWJsZScsICdibG9ja3F1b3RlJywgJ2xpc3QnLCAnaHRtbCcsICdwYXJhZ3JhcGgnLCAndGV4dCddLmluY2x1ZGVzKGdlbmVyaWNUb2tlbi50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnNwYWNlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2hyJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ocih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5oZWFkaW5nKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrcXVvdGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGlzdCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5odG1sKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJvZHkgPSB0aGlzLnJlbmRlcmVyLnRleHQodGV4dFRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgKyAxIDwgdG9rZW5zLmxlbmd0aCAmJiB0b2tlbnNbaSArIDFdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dFRva2VuID0gdG9rZW5zWysraV07XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5yZW5kZXJlci50ZXh0KHRleHRUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXc6IGJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnM6IFt7IHR5cGU6ICd0ZXh0JywgcmF3OiBib2R5LCB0ZXh0OiBib2R5IH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQgKz0gYm9keTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgSW5saW5lIFRva2Vuc1xuICAgICAqL1xuICAgIHBhcnNlSW5saW5lKHRva2VucywgcmVuZGVyZXIpIHtcbiAgICAgICAgcmVuZGVyZXIgPSByZW5kZXJlciB8fCB0aGlzLnJlbmRlcmVyO1xuICAgICAgICBsZXQgb3V0ID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBhbnlUb2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbYW55VG9rZW4udHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbYW55VG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCBhbnlUb2tlbik7XG4gICAgICAgICAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnZXNjYXBlJywgJ2h0bWwnLCAnbGluaycsICdpbWFnZScsICdzdHJvbmcnLCAnZW0nLCAnY29kZXNwYW4nLCAnYnInLCAnZGVsJywgJ3RleHQnXS5pbmNsdWRlcyhhbnlUb2tlbi50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGFueVRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXNjYXBlJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaHRtbCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdsaW5rJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIubGluayh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdpbWFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmltYWdlKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ3N0cm9uZyc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnN0cm9uZyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdlbSc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmVtKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGVzcGFuJzoge1xuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuY29kZXNwYW4odG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnYnInOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSByZW5kZXJlci5icih0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdkZWwnOiB7XG4gICAgICAgICAgICAgICAgICAgIG91dCArPSByZW5kZXJlci5kZWwodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG59XG5cbmNsYXNzIF9Ib29rcyB7XG4gICAgb3B0aW9ucztcbiAgICBibG9jaztcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgX2RlZmF1bHRzO1xuICAgIH1cbiAgICBzdGF0aWMgcGFzc1Rocm91Z2hIb29rcyA9IG5ldyBTZXQoW1xuICAgICAgICAncHJlcHJvY2VzcycsXG4gICAgICAgICdwb3N0cHJvY2VzcycsXG4gICAgICAgICdwcm9jZXNzQWxsVG9rZW5zJyxcbiAgICBdKTtcbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIG1hcmtkb3duIGJlZm9yZSBtYXJrZWRcbiAgICAgKi9cbiAgICBwcmVwcm9jZXNzKG1hcmtkb3duKSB7XG4gICAgICAgIHJldHVybiBtYXJrZG93bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJvY2VzcyBIVE1MIGFmdGVyIG1hcmtlZCBpcyBmaW5pc2hlZFxuICAgICAqL1xuICAgIHBvc3Rwcm9jZXNzKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgYWxsIHRva2VucyBiZWZvcmUgd2FsayB0b2tlbnNcbiAgICAgKi9cbiAgICBwcm9jZXNzQWxsVG9rZW5zKHRva2Vucykge1xuICAgICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGZ1bmN0aW9uIHRvIHRva2VuaXplIG1hcmtkb3duXG4gICAgICovXG4gICAgcHJvdmlkZUxleGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9jayA/IF9MZXhlci5sZXggOiBfTGV4ZXIubGV4SW5saW5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcm92aWRlIGZ1bmN0aW9uIHRvIHBhcnNlIHRva2Vuc1xuICAgICAqL1xuICAgIHByb3ZpZGVQYXJzZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrID8gX1BhcnNlci5wYXJzZSA6IF9QYXJzZXIucGFyc2VJbmxpbmU7XG4gICAgfVxufVxuXG5jbGFzcyBNYXJrZWQge1xuICAgIGRlZmF1bHRzID0gX2dldERlZmF1bHRzKCk7XG4gICAgb3B0aW9ucyA9IHRoaXMuc2V0T3B0aW9ucztcbiAgICBwYXJzZSA9IHRoaXMucGFyc2VNYXJrZG93bih0cnVlKTtcbiAgICBwYXJzZUlubGluZSA9IHRoaXMucGFyc2VNYXJrZG93bihmYWxzZSk7XG4gICAgUGFyc2VyID0gX1BhcnNlcjtcbiAgICBSZW5kZXJlciA9IF9SZW5kZXJlcjtcbiAgICBUZXh0UmVuZGVyZXIgPSBfVGV4dFJlbmRlcmVyO1xuICAgIExleGVyID0gX0xleGVyO1xuICAgIFRva2VuaXplciA9IF9Ub2tlbml6ZXI7XG4gICAgSG9va3MgPSBfSG9va3M7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICB0aGlzLnVzZSguLi5hcmdzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUnVuIGNhbGxiYWNrIGZvciBldmVyeSB0b2tlblxuICAgICAqL1xuICAgIHdhbGtUb2tlbnModG9rZW5zLCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGNhbGxiYWNrLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZVRva2VuID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiB0YWJsZVRva2VuLmhlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdGFibGVUb2tlbi5yb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KHRoaXMud2Fsa1Rva2VucyhsaXN0VG9rZW4uaXRlbXMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlbmVyaWNUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5leHRlbnNpb25zPy5jaGlsZFRva2Vucz8uW2dlbmVyaWNUb2tlbi50eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW2dlbmVyaWNUb2tlbi50eXBlXS5mb3JFYWNoKChjaGlsZFRva2VucykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IGdlbmVyaWNUb2tlbltjaGlsZFRva2Vuc10uZmxhdChJbmZpbml0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnModG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZ2VuZXJpY1Rva2VuLnRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoZ2VuZXJpY1Rva2VuLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH1cbiAgICB1c2UoLi4uYXJncykge1xuICAgICAgICBjb25zdCBleHRlbnNpb25zID0gdGhpcy5kZWZhdWx0cy5leHRlbnNpb25zIHx8IHsgcmVuZGVyZXJzOiB7fSwgY2hpbGRUb2tlbnM6IHt9IH07XG4gICAgICAgIGFyZ3MuZm9yRWFjaCgocGFjaykgPT4ge1xuICAgICAgICAgICAgLy8gY29weSBvcHRpb25zIHRvIG5ldyBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSB7IC4uLnBhY2sgfTtcbiAgICAgICAgICAgIC8vIHNldCBhc3luYyB0byB0cnVlIGlmIGl0IHdhcyBzZXQgdG8gdHJ1ZSBiZWZvcmVcbiAgICAgICAgICAgIG9wdHMuYXN5bmMgPSB0aGlzLmRlZmF1bHRzLmFzeW5jIHx8IG9wdHMuYXN5bmMgfHwgZmFsc2U7XG4gICAgICAgICAgICAvLyA9PS0tIFBhcnNlIFwiYWRkb25cIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICAgICAgICAgIGlmIChwYWNrLmV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBwYWNrLmV4dGVuc2lvbnMuZm9yRWFjaCgoZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXh0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoJ3JlbmRlcmVyJyBpbiBleHQpIHsgLy8gUmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZSZW5kZXJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgZXh0ZW5zaW9uIHdpdGggZnVuYyB0byBydW4gbmV3IGV4dGVuc2lvbiBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IGV4dC5yZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBleHQucmVuZGVyZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCd0b2tlbml6ZXInIGluIGV4dCkgeyAvLyBUb2tlbml6ZXIgRXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleHQubGV2ZWwgfHwgKGV4dC5sZXZlbCAhPT0gJ2Jsb2NrJyAmJiBleHQubGV2ZWwgIT09ICdpbmxpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBsZXZlbCBtdXN0IGJlICdibG9jaycgb3IgJ2lubGluZSdcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRMZXZlbCA9IGV4dGVuc2lvbnNbZXh0LmxldmVsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRMZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dExldmVsLnVuc2hpZnQoZXh0LnRva2VuaXplcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0gPSBbZXh0LnRva2VuaXplcl07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXh0LnN0YXJ0KSB7IC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGZvciBzdGFydCBvZiB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHQubGV2ZWwgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jayA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV4dC5sZXZlbCA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZSA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgnY2hpbGRUb2tlbnMnIGluIGV4dCAmJiBleHQuY2hpbGRUb2tlbnMpIHsgLy8gQ2hpbGQgdG9rZW5zIHRvIGJlIHZpc2l0ZWQgYnkgd2Fsa1Rva2Vuc1xuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1tleHQubmFtZV0gPSBleHQuY2hpbGRUb2tlbnM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvcHRzLmV4dGVuc2lvbnMgPSBleHRlbnNpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gPT0tLSBQYXJzZSBcIm92ZXJ3cml0ZVwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgICAgICAgICAgaWYgKHBhY2sucmVuZGVyZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IHRoaXMuZGVmYXVsdHMucmVuZGVyZXIgfHwgbmV3IF9SZW5kZXJlcih0aGlzLmRlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5yZW5kZXJlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShwcm9wIGluIHJlbmRlcmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGByZW5kZXJlciAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ3BhcnNlciddLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgb3B0aW9ucyBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXJQcm9wID0gcHJvcDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZXJGdW5jID0gcGFjay5yZW5kZXJlcltyZW5kZXJlclByb3BdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSByZW5kZXJlcltyZW5kZXJlclByb3BdO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHJlbmRlcmVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyW3JlbmRlcmVyUHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IHJlbmRlcmVyRnVuYy5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0IHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b2tlbml6ZXIgPSB0aGlzLmRlZmF1bHRzLnRva2VuaXplciB8fCBuZXcgX1Rva2VuaXplcih0aGlzLmRlZmF1bHRzKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEocHJvcCBpbiB0b2tlbml6ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRva2VuaXplciAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ3J1bGVzJywgJ2xleGVyJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBvcHRpb25zLCBydWxlcywgYW5kIGxleGVyIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRva2VuaXplclByb3AgPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbml6ZXJGdW5jID0gcGFjay50b2tlbml6ZXJbdG9rZW5pemVyUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZUb2tlbml6ZXIgPSB0b2tlbml6ZXJbdG9rZW5pemVyUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgdG9rZW5pemVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgY2Fubm90IHR5cGUgdG9rZW5pemVyIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgIHRva2VuaXplclt0b2tlbml6ZXJQcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gdG9rZW5pemVyRnVuYy5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBwcmV2VG9rZW5pemVyLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vID09LS0gUGFyc2UgSG9va3MgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgICAgICAgICBpZiAocGFjay5ob29rcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvb2tzID0gdGhpcy5kZWZhdWx0cy5ob29rcyB8fCBuZXcgX0hvb2tzKCk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2suaG9va3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEocHJvcCBpbiBob29rcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaG9vayAnJHtwcm9wfScgZG9lcyBub3QgZXhpc3RgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoWydvcHRpb25zJywgJ2Jsb2NrJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBvcHRpb25zIGFuZCBibG9jayBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rc1Byb3AgPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBob29rc0Z1bmMgPSBwYWNrLmhvb2tzW2hvb2tzUHJvcF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZIb29rID0gaG9va3NbaG9va3NQcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9Ib29rcy5wYXNzVGhyb3VnaEhvb2tzLmhhcyhwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW5ub3QgdHlwZSBob29rIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBob29rc1tob29rc1Byb3BdID0gKGFyZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRzLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaG9va3NGdW5jLmNhbGwoaG9va3MsIGFyZykpLnRoZW4ocmV0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2SG9vay5jYWxsKGhvb2tzLCByZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gaG9va3NGdW5jLmNhbGwoaG9va3MsIGFyZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZIb29rLmNhbGwoaG9va3MsIHJldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW5ub3QgdHlwZSBob29rIGZ1bmN0aW9uIGR5bmFtaWNhbGx5XG4gICAgICAgICAgICAgICAgICAgICAgICBob29rc1tob29rc1Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gaG9va3NGdW5jLmFwcGx5KGhvb2tzLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQgPSBwcmV2SG9vay5hcHBseShob29rcywgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdHMuaG9va3MgPSBob29rcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vID09LS0gUGFyc2UgV2Fsa1Rva2VucyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICAgICAgICAgIGlmIChwYWNrLndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWxrVG9rZW5zID0gdGhpcy5kZWZhdWx0cy53YWxrVG9rZW5zO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhY2tXYWxrdG9rZW5zID0gcGFjay53YWxrVG9rZW5zO1xuICAgICAgICAgICAgICAgIG9wdHMud2Fsa1Rva2VucyA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHBhY2tXYWxrdG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQod2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kZWZhdWx0cyA9IHsgLi4udGhpcy5kZWZhdWx0cywgLi4ub3B0cyB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHNldE9wdGlvbnMob3B0KSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7IC4uLnRoaXMuZGVmYXVsdHMsIC4uLm9wdCB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgbGV4ZXIoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBfTGV4ZXIubGV4KHNyYywgb3B0aW9ucyA/PyB0aGlzLmRlZmF1bHRzKTtcbiAgICB9XG4gICAgcGFyc2VyKHRva2Vucywgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gX1BhcnNlci5wYXJzZSh0b2tlbnMsIG9wdGlvbnMgPz8gdGhpcy5kZWZhdWx0cyk7XG4gICAgfVxuICAgIHBhcnNlTWFya2Rvd24oYmxvY2tUeXBlKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIGNvbnN0IHBhcnNlID0gKHNyYywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ09wdCA9IHsgLi4ub3B0aW9ucyB9O1xuICAgICAgICAgICAgY29uc3Qgb3B0ID0geyAuLi50aGlzLmRlZmF1bHRzLCAuLi5vcmlnT3B0IH07XG4gICAgICAgICAgICBjb25zdCB0aHJvd0Vycm9yID0gdGhpcy5vbkVycm9yKCEhb3B0LnNpbGVudCwgISFvcHQuYXN5bmMpO1xuICAgICAgICAgICAgLy8gdGhyb3cgZXJyb3IgaWYgYW4gZXh0ZW5zaW9uIHNldCBhc3luYyB0byB0cnVlIGJ1dCBwYXJzZSB3YXMgY2FsbGVkIHdpdGggYXN5bmM6IGZhbHNlXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0cy5hc3luYyA9PT0gdHJ1ZSAmJiBvcmlnT3B0LmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IFRoZSBhc3luYyBvcHRpb24gd2FzIHNldCB0byB0cnVlIGJ5IGFuIGV4dGVuc2lvbi4gUmVtb3ZlIGFzeW5jOiBmYWxzZSBmcm9tIHRoZSBwYXJzZSBvcHRpb25zIG9iamVjdCB0byByZXR1cm4gYSBQcm9taXNlLicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzcmMgPT09ICd1bmRlZmluZWQnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICdcbiAgICAgICAgICAgICAgICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgICAgICAgICBvcHQuaG9va3Mub3B0aW9ucyA9IG9wdDtcbiAgICAgICAgICAgICAgICBvcHQuaG9va3MuYmxvY2sgPSBibG9ja1R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsZXhlciA9IG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcm92aWRlTGV4ZXIoKSA6IChibG9ja1R5cGUgPyBfTGV4ZXIubGV4IDogX0xleGVyLmxleElubGluZSk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZXIgPSBvcHQuaG9va3MgPyBvcHQuaG9va3MucHJvdmlkZVBhcnNlcigpIDogKGJsb2NrVHlwZSA/IF9QYXJzZXIucGFyc2UgOiBfUGFyc2VyLnBhcnNlSW5saW5lKTtcbiAgICAgICAgICAgIGlmIChvcHQuYXN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYykgOiBzcmMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHNyYyA9PiBsZXhlcihzcmMsIG9wdCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRva2VucyA9PiBvcHQuaG9va3MgPyBvcHQuaG9va3MucHJvY2Vzc0FsbFRva2Vucyh0b2tlbnMpIDogdG9rZW5zKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih0b2tlbnMgPT4gb3B0LndhbGtUb2tlbnMgPyBQcm9taXNlLmFsbCh0aGlzLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2VucykpLnRoZW4oKCkgPT4gdG9rZW5zKSA6IHRva2VucylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odG9rZW5zID0+IHBhcnNlcih0b2tlbnMsIG9wdCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGh0bWwgPT4gb3B0Lmhvb2tzID8gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpIDogaHRtbClcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKHRocm93RXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNyYyA9IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCB0b2tlbnMgPSBsZXhlcihzcmMsIG9wdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbnMgPSBvcHQuaG9va3MucHJvY2Vzc0FsbFRva2Vucyh0b2tlbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaHRtbCA9IHBhcnNlcih0b2tlbnMsIG9wdCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICAgICAgICBodG1sID0gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwYXJzZTtcbiAgICB9XG4gICAgb25FcnJvcihzaWxlbnQsIGFzeW5jKSB7XG4gICAgICAgIHJldHVybiAoZSkgPT4ge1xuICAgICAgICAgICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuICAgICAgICAgICAgaWYgKHNpbGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICAgICAgICAgICAgICsgZXNjYXBlJDEoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICsgJzwvcHJlPic7XG4gICAgICAgICAgICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5jb25zdCBtYXJrZWRJbnN0YW5jZSA9IG5ldyBNYXJrZWQoKTtcbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCkge1xuICAgIHJldHVybiBtYXJrZWRJbnN0YW5jZS5wYXJzZShzcmMsIG9wdCk7XG59XG4vKipcbiAqIFNldHMgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBIYXNoIG9mIG9wdGlvbnNcbiAqL1xubWFya2VkLm9wdGlvbnMgPVxuICAgIG1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgbWFya2VkSW5zdGFuY2Uuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgbWFya2VkLmRlZmF1bHRzID0gbWFya2VkSW5zdGFuY2UuZGVmYXVsdHM7XG4gICAgICAgIGNoYW5nZURlZmF1bHRzKG1hcmtlZC5kZWZhdWx0cyk7XG4gICAgICAgIHJldHVybiBtYXJrZWQ7XG4gICAgfTtcbi8qKlxuICogR2V0cyB0aGUgb3JpZ2luYWwgbWFya2VkIGRlZmF1bHQgb3B0aW9ucy5cbiAqL1xubWFya2VkLmdldERlZmF1bHRzID0gX2dldERlZmF1bHRzO1xubWFya2VkLmRlZmF1bHRzID0gX2RlZmF1bHRzO1xuLyoqXG4gKiBVc2UgRXh0ZW5zaW9uXG4gKi9cbm1hcmtlZC51c2UgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIG1hcmtlZEluc3RhbmNlLnVzZSguLi5hcmdzKTtcbiAgICBtYXJrZWQuZGVmYXVsdHMgPSBtYXJrZWRJbnN0YW5jZS5kZWZhdWx0cztcbiAgICBjaGFuZ2VEZWZhdWx0cyhtYXJrZWQuZGVmYXVsdHMpO1xuICAgIHJldHVybiBtYXJrZWQ7XG59O1xuLyoqXG4gKiBSdW4gY2FsbGJhY2sgZm9yIGV2ZXJ5IHRva2VuXG4gKi9cbm1hcmtlZC53YWxrVG9rZW5zID0gZnVuY3Rpb24gKHRva2VucywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbWFya2VkSW5zdGFuY2Uud2Fsa1Rva2Vucyh0b2tlbnMsIGNhbGxiYWNrKTtcbn07XG4vKipcbiAqIENvbXBpbGVzIG1hcmtkb3duIHRvIEhUTUwgd2l0aG91dCBlbmNsb3NpbmcgYHBgIHRhZy5cbiAqXG4gKiBAcGFyYW0gc3JjIFN0cmluZyBvZiBtYXJrZG93biBzb3VyY2UgdG8gYmUgY29tcGlsZWRcbiAqIEBwYXJhbSBvcHRpb25zIEhhc2ggb2Ygb3B0aW9uc1xuICogQHJldHVybiBTdHJpbmcgb2YgY29tcGlsZWQgSFRNTFxuICovXG5tYXJrZWQucGFyc2VJbmxpbmUgPSBtYXJrZWRJbnN0YW5jZS5wYXJzZUlubGluZTtcbi8qKlxuICogRXhwb3NlXG4gKi9cbm1hcmtlZC5QYXJzZXIgPSBfUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IF9QYXJzZXIucGFyc2U7XG5tYXJrZWQuUmVuZGVyZXIgPSBfUmVuZGVyZXI7XG5tYXJrZWQuVGV4dFJlbmRlcmVyID0gX1RleHRSZW5kZXJlcjtcbm1hcmtlZC5MZXhlciA9IF9MZXhlcjtcbm1hcmtlZC5sZXhlciA9IF9MZXhlci5sZXg7XG5tYXJrZWQuVG9rZW5pemVyID0gX1Rva2VuaXplcjtcbm1hcmtlZC5Ib29rcyA9IF9Ib29rcztcbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcbmNvbnN0IG9wdGlvbnMgPSBtYXJrZWQub3B0aW9ucztcbmNvbnN0IHNldE9wdGlvbnMgPSBtYXJrZWQuc2V0T3B0aW9ucztcbmNvbnN0IHVzZSA9IG1hcmtlZC51c2U7XG5jb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLndhbGtUb2tlbnM7XG5jb25zdCBwYXJzZUlubGluZSA9IG1hcmtlZC5wYXJzZUlubGluZTtcbmNvbnN0IHBhcnNlID0gbWFya2VkO1xuY29uc3QgcGFyc2VyID0gX1BhcnNlci5wYXJzZTtcbmNvbnN0IGxleGVyID0gX0xleGVyLmxleDtcblxuZXhwb3J0IHsgX0hvb2tzIGFzIEhvb2tzLCBfTGV4ZXIgYXMgTGV4ZXIsIE1hcmtlZCwgX1BhcnNlciBhcyBQYXJzZXIsIF9SZW5kZXJlciBhcyBSZW5kZXJlciwgX1RleHRSZW5kZXJlciBhcyBUZXh0UmVuZGVyZXIsIF9Ub2tlbml6ZXIgYXMgVG9rZW5pemVyLCBfZGVmYXVsdHMgYXMgZGVmYXVsdHMsIF9nZXREZWZhdWx0cyBhcyBnZXREZWZhdWx0cywgbGV4ZXIsIG1hcmtlZCwgb3B0aW9ucywgcGFyc2UsIHBhcnNlSW5saW5lLCBwYXJzZXIsIHNldE9wdGlvbnMsIHVzZSwgd2Fsa1Rva2VucyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFya2VkLmVzbS5qcy5tYXBcbiIsCiAgICAiaW1wb3J0IHttYXJrZWR9IGZyb20gJ21hcmtlZCdcbmltcG9ydCB7cmVhZEZpbGV9IGZyb20gJ2ZzL3Byb21pc2VzJ1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJ1xuXG4vLyBDb25maWd1cmUgbWFya2VkXG5tYXJrZWQuc2V0T3B0aW9ucyh7XG5cdGdmbTogdHJ1ZSxcblx0YnJlYWtzOiBmYWxzZSxcbn0pXG5cbmV4cG9ydCBpbnRlcmZhY2UgRG9jUGFnZSB7XG5cdHRpdGxlOiBzdHJpbmdcblx0Y29udGVudDogc3RyaW5nXG5cdG1ldGFEZXNjcmlwdGlvbjogc3RyaW5nXG59XG5cbmNvbnN0IG1ldGFEZXNjcmlwdGlvblJlZ2V4ID0gLzwhLS1tZXRhLWRlc2NyaXB0aW9uXFxuKFtcXHNcXFNdKz8pXFxuLS0+L21cblxuZnVuY3Rpb24gZXh0cmFjdE1ldGFEZXNjcmlwdGlvbihtYXJrZG93bjogc3RyaW5nLCBkZWZhdWx0RGVzYzogc3RyaW5nID0gJ01pdGhyaWwuanMgRG9jdW1lbnRhdGlvbicpOiBzdHJpbmcge1xuXHRjb25zdCBtYXRjaCA9IG1hcmtkb3duLm1hdGNoKG1ldGFEZXNjcmlwdGlvblJlZ2V4KVxuXHRyZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50cmltKCkgOiBkZWZhdWx0RGVzY1xufVxuXG5mdW5jdGlvbiBleHRyYWN0VGl0bGUobWFya2Rvd246IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IGgxTWF0Y2ggPSBtYXJrZG93bi5tYXRjaCgvXiNcXHMrKC4rKSQvbSlcblx0cmV0dXJuIGgxTWF0Y2ggPyBoMU1hdGNoWzFdIDogJ01pdGhyaWwuanMnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkTWFya2Rvd25GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPERvY1BhZ2U+IHtcblx0Y29uc3QgbWFya2Rvd24gPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04Jylcblx0Y29uc3QgaHRtbCA9IG1hcmtlZC5wYXJzZShtYXJrZG93bikgYXMgc3RyaW5nXG5cdGNvbnN0IHRpdGxlID0gZXh0cmFjdFRpdGxlKG1hcmtkb3duKVxuXHRjb25zdCBtZXRhRGVzY3JpcHRpb24gPSBleHRyYWN0TWV0YURlc2NyaXB0aW9uKG1hcmtkb3duKVxuXHRcblx0cmV0dXJuIHtcblx0XHR0aXRsZSxcblx0XHRjb250ZW50OiBodG1sLFxuXHRcdG1ldGFEZXNjcmlwdGlvbixcblx0fVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE1hcmtkb3duRnJvbURvY3MoZG9jTmFtZTogc3RyaW5nKTogUHJvbWlzZTxEb2NQYWdlIHwgbnVsbD4ge1xuXHQvLyBPbmx5IGxvYWQgbWFya2Rvd24gb24gc2VydmVyIChCdW4vTm9kZS5qcyksIG5vdCBpbiBicm93c2VyXG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyB8fCAhaW1wb3J0Lm1ldGEuZGlyKSB7XG5cdFx0Ly8gSW4gYnJvd3NlciwgcmV0dXJuIG51bGwgLSBkYXRhIHNob3VsZCBjb21lIGZyb20gU1NSXG5cdFx0Y29uc29sZS5sb2coJ1tsb2FkTWFya2Rvd25Gcm9tRG9jc10gQnJvd3NlciBjb250ZXh0LCBza2lwcGluZyBsb2FkJylcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cdFxuXHR0cnkge1xuXHRcdC8vIExvYWQgZnJvbSB0aGUgZG9jcyByZXBvXG5cdFx0Ly8gRnJvbSBtaXRocmlsL2RvY3Mvc2l0ZSwgZ28gdXAgMyBsZXZlbHMgdG8gZ2V0IHRvIC9ob21lL2plcm9lbi9jb2RlXG5cdFx0Y29uc3QgZG9jc1BhdGggPSBqb2luKGltcG9ydC5tZXRhLmRpciwgJy4uLy4uLy4uJywgJ2RvY3MnLCAnZG9jcycsIGAke2RvY05hbWV9Lm1kYClcblx0XHRjb25zb2xlLmxvZygnW2xvYWRNYXJrZG93bkZyb21Eb2NzXSBMb2FkaW5nIGZyb20gcGF0aDonLCBkb2NzUGF0aClcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBsb2FkTWFya2Rvd25GaWxlKGRvY3NQYXRoKVxuXHRcdGNvbnNvbGUubG9nKCdbbG9hZE1hcmtkb3duRnJvbURvY3NdIFN1Y2Nlc3NmdWxseSBsb2FkZWQ6JywgZG9jTmFtZSwgJ3RpdGxlOicsIHJlc3VsdC50aXRsZSwgJ2NvbnRlbnQgbGVuZ3RoOicsIHJlc3VsdC5jb250ZW50Lmxlbmd0aClcblx0XHRyZXR1cm4gcmVzdWx0XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gTG9nIGVycm9yIGZvciBkZWJ1Z2dpbmdcblx0XHRjb25zb2xlLmVycm9yKGBbbG9hZE1hcmtkb3duRnJvbURvY3NdIEZhaWxlZCB0byBsb2FkIG1hcmtkb3duOiAke2RvY05hbWV9YCwgZXJyb3IpXG5cdFx0aWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoYFtsb2FkTWFya2Rvd25Gcm9tRG9jc10gRXJyb3IgZGV0YWlsczpgLCBlcnJvci5tZXNzYWdlLCBlcnJvci5zdGFjaylcblx0XHR9XG5cdFx0cmV0dXJuIG51bGxcblx0fVxufVxuIiwKICAgICJmdW5jdGlvbiBhc3NlcnRQYXRoKHBhdGgpe2lmKHR5cGVvZiBwYXRoIT09XCJzdHJpbmdcIil0aHJvdyBUeXBlRXJyb3IoXCJQYXRoIG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkIFwiK0pTT04uc3RyaW5naWZ5KHBhdGgpKX1mdW5jdGlvbiBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLGFsbG93QWJvdmVSb290KXt2YXIgcmVzPVwiXCIsbGFzdFNlZ21lbnRMZW5ndGg9MCxsYXN0U2xhc2g9LTEsZG90cz0wLGNvZGU7Zm9yKHZhciBpPTA7aTw9cGF0aC5sZW5ndGg7KytpKXtpZihpPHBhdGgubGVuZ3RoKWNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpO2Vsc2UgaWYoY29kZT09PTQ3KWJyZWFrO2Vsc2UgY29kZT00NztpZihjb2RlPT09NDcpe2lmKGxhc3RTbGFzaD09PWktMXx8ZG90cz09PTEpO2Vsc2UgaWYobGFzdFNsYXNoIT09aS0xJiZkb3RzPT09Mil7aWYocmVzLmxlbmd0aDwyfHxsYXN0U2VnbWVudExlbmd0aCE9PTJ8fHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGgtMSkhPT00Nnx8cmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aC0yKSE9PTQ2KXtpZihyZXMubGVuZ3RoPjIpe3ZhciBsYXN0U2xhc2hJbmRleD1yZXMubGFzdEluZGV4T2YoXCIvXCIpO2lmKGxhc3RTbGFzaEluZGV4IT09cmVzLmxlbmd0aC0xKXtpZihsYXN0U2xhc2hJbmRleD09PS0xKXJlcz1cIlwiLGxhc3RTZWdtZW50TGVuZ3RoPTA7ZWxzZSByZXM9cmVzLnNsaWNlKDAsbGFzdFNsYXNoSW5kZXgpLGxhc3RTZWdtZW50TGVuZ3RoPXJlcy5sZW5ndGgtMS1yZXMubGFzdEluZGV4T2YoXCIvXCIpO2xhc3RTbGFzaD1pLGRvdHM9MDtjb250aW51ZX19ZWxzZSBpZihyZXMubGVuZ3RoPT09Mnx8cmVzLmxlbmd0aD09PTEpe3Jlcz1cIlwiLGxhc3RTZWdtZW50TGVuZ3RoPTAsbGFzdFNsYXNoPWksZG90cz0wO2NvbnRpbnVlfX1pZihhbGxvd0Fib3ZlUm9vdCl7aWYocmVzLmxlbmd0aD4wKXJlcys9XCIvLi5cIjtlbHNlIHJlcz1cIi4uXCI7bGFzdFNlZ21lbnRMZW5ndGg9Mn19ZWxzZXtpZihyZXMubGVuZ3RoPjApcmVzKz1cIi9cIitwYXRoLnNsaWNlKGxhc3RTbGFzaCsxLGkpO2Vsc2UgcmVzPXBhdGguc2xpY2UobGFzdFNsYXNoKzEsaSk7bGFzdFNlZ21lbnRMZW5ndGg9aS1sYXN0U2xhc2gtMX1sYXN0U2xhc2g9aSxkb3RzPTB9ZWxzZSBpZihjb2RlPT09NDYmJmRvdHMhPT0tMSkrK2RvdHM7ZWxzZSBkb3RzPS0xfXJldHVybiByZXN9ZnVuY3Rpb24gX2Zvcm1hdChzZXAscGF0aE9iamVjdCl7dmFyIGRpcj1wYXRoT2JqZWN0LmRpcnx8cGF0aE9iamVjdC5yb290LGJhc2U9cGF0aE9iamVjdC5iYXNlfHwocGF0aE9iamVjdC5uYW1lfHxcIlwiKSsocGF0aE9iamVjdC5leHR8fFwiXCIpO2lmKCFkaXIpcmV0dXJuIGJhc2U7aWYoZGlyPT09cGF0aE9iamVjdC5yb290KXJldHVybiBkaXIrYmFzZTtyZXR1cm4gZGlyK3NlcCtiYXNlfWZ1bmN0aW9uIHJlc29sdmUoKXt2YXIgcmVzb2x2ZWRQYXRoPVwiXCIscmVzb2x2ZWRBYnNvbHV0ZT0hMSxjd2Q7Zm9yKHZhciBpPWFyZ3VtZW50cy5sZW5ndGgtMTtpPj0tMSYmIXJlc29sdmVkQWJzb2x1dGU7aS0tKXt2YXIgcGF0aDtpZihpPj0wKXBhdGg9YXJndW1lbnRzW2ldO2Vsc2V7aWYoY3dkPT09dm9pZCAwKWN3ZD1wcm9jZXNzLmN3ZCgpO3BhdGg9Y3dkfWlmKGFzc2VydFBhdGgocGF0aCkscGF0aC5sZW5ndGg9PT0wKWNvbnRpbnVlO3Jlc29sdmVkUGF0aD1wYXRoK1wiL1wiK3Jlc29sdmVkUGF0aCxyZXNvbHZlZEFic29sdXRlPXBhdGguY2hhckNvZGVBdCgwKT09PTQ3fWlmKHJlc29sdmVkUGF0aD1ub3JtYWxpemVTdHJpbmdQb3NpeChyZXNvbHZlZFBhdGgsIXJlc29sdmVkQWJzb2x1dGUpLHJlc29sdmVkQWJzb2x1dGUpaWYocmVzb2x2ZWRQYXRoLmxlbmd0aD4wKXJldHVyblwiL1wiK3Jlc29sdmVkUGF0aDtlbHNlIHJldHVyblwiL1wiO2Vsc2UgaWYocmVzb2x2ZWRQYXRoLmxlbmd0aD4wKXJldHVybiByZXNvbHZlZFBhdGg7ZWxzZSByZXR1cm5cIi5cIn1mdW5jdGlvbiBub3JtYWxpemUocGF0aCl7aWYoYXNzZXJ0UGF0aChwYXRoKSxwYXRoLmxlbmd0aD09PTApcmV0dXJuXCIuXCI7dmFyIGlzQWJzb2x1dGU9cGF0aC5jaGFyQ29kZUF0KDApPT09NDcsdHJhaWxpbmdTZXBhcmF0b3I9cGF0aC5jaGFyQ29kZUF0KHBhdGgubGVuZ3RoLTEpPT09NDc7aWYocGF0aD1ub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCFpc0Fic29sdXRlKSxwYXRoLmxlbmd0aD09PTAmJiFpc0Fic29sdXRlKXBhdGg9XCIuXCI7aWYocGF0aC5sZW5ndGg+MCYmdHJhaWxpbmdTZXBhcmF0b3IpcGF0aCs9XCIvXCI7aWYoaXNBYnNvbHV0ZSlyZXR1cm5cIi9cIitwYXRoO3JldHVybiBwYXRofWZ1bmN0aW9uIGlzQWJzb2x1dGUocGF0aCl7cmV0dXJuIGFzc2VydFBhdGgocGF0aCkscGF0aC5sZW5ndGg+MCYmcGF0aC5jaGFyQ29kZUF0KDApPT09NDd9ZnVuY3Rpb24gam9pbigpe2lmKGFyZ3VtZW50cy5sZW5ndGg9PT0wKXJldHVyblwiLlwiO3ZhciBqb2luZWQ7Zm9yKHZhciBpPTA7aTxhcmd1bWVudHMubGVuZ3RoOysraSl7dmFyIGFyZz1hcmd1bWVudHNbaV07aWYoYXNzZXJ0UGF0aChhcmcpLGFyZy5sZW5ndGg+MClpZihqb2luZWQ9PT12b2lkIDApam9pbmVkPWFyZztlbHNlIGpvaW5lZCs9XCIvXCIrYXJnfWlmKGpvaW5lZD09PXZvaWQgMClyZXR1cm5cIi5cIjtyZXR1cm4gbm9ybWFsaXplKGpvaW5lZCl9ZnVuY3Rpb24gcmVsYXRpdmUoZnJvbSx0byl7aWYoYXNzZXJ0UGF0aChmcm9tKSxhc3NlcnRQYXRoKHRvKSxmcm9tPT09dG8pcmV0dXJuXCJcIjtpZihmcm9tPXJlc29sdmUoZnJvbSksdG89cmVzb2x2ZSh0byksZnJvbT09PXRvKXJldHVyblwiXCI7dmFyIGZyb21TdGFydD0xO2Zvcig7ZnJvbVN0YXJ0PGZyb20ubGVuZ3RoOysrZnJvbVN0YXJ0KWlmKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpIT09NDcpYnJlYWs7dmFyIGZyb21FbmQ9ZnJvbS5sZW5ndGgsZnJvbUxlbj1mcm9tRW5kLWZyb21TdGFydCx0b1N0YXJ0PTE7Zm9yKDt0b1N0YXJ0PHRvLmxlbmd0aDsrK3RvU3RhcnQpaWYodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSE9PTQ3KWJyZWFrO3ZhciB0b0VuZD10by5sZW5ndGgsdG9MZW49dG9FbmQtdG9TdGFydCxsZW5ndGg9ZnJvbUxlbjx0b0xlbj9mcm9tTGVuOnRvTGVuLGxhc3RDb21tb25TZXA9LTEsaT0wO2Zvcig7aTw9bGVuZ3RoOysraSl7aWYoaT09PWxlbmd0aCl7aWYodG9MZW4+bGVuZ3RoKXtpZih0by5jaGFyQ29kZUF0KHRvU3RhcnQraSk9PT00NylyZXR1cm4gdG8uc2xpY2UodG9TdGFydCtpKzEpO2Vsc2UgaWYoaT09PTApcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQraSl9ZWxzZSBpZihmcm9tTGVuPmxlbmd0aCl7aWYoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCtpKT09PTQ3KWxhc3RDb21tb25TZXA9aTtlbHNlIGlmKGk9PT0wKWxhc3RDb21tb25TZXA9MH1icmVha312YXIgZnJvbUNvZGU9ZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCtpKSx0b0NvZGU9dG8uY2hhckNvZGVBdCh0b1N0YXJ0K2kpO2lmKGZyb21Db2RlIT09dG9Db2RlKWJyZWFrO2Vsc2UgaWYoZnJvbUNvZGU9PT00NylsYXN0Q29tbW9uU2VwPWl9dmFyIG91dD1cIlwiO2ZvcihpPWZyb21TdGFydCtsYXN0Q29tbW9uU2VwKzE7aTw9ZnJvbUVuZDsrK2kpaWYoaT09PWZyb21FbmR8fGZyb20uY2hhckNvZGVBdChpKT09PTQ3KWlmKG91dC5sZW5ndGg9PT0wKW91dCs9XCIuLlwiO2Vsc2Ugb3V0Kz1cIi8uLlwiO2lmKG91dC5sZW5ndGg+MClyZXR1cm4gb3V0K3RvLnNsaWNlKHRvU3RhcnQrbGFzdENvbW1vblNlcCk7ZWxzZXtpZih0b1N0YXJ0Kz1sYXN0Q29tbW9uU2VwLHRvLmNoYXJDb2RlQXQodG9TdGFydCk9PT00NykrK3RvU3RhcnQ7cmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQpfX1mdW5jdGlvbiBfbWFrZUxvbmcocGF0aCl7cmV0dXJuIHBhdGh9ZnVuY3Rpb24gZGlybmFtZShwYXRoKXtpZihhc3NlcnRQYXRoKHBhdGgpLHBhdGgubGVuZ3RoPT09MClyZXR1cm5cIi5cIjt2YXIgY29kZT1wYXRoLmNoYXJDb2RlQXQoMCksaGFzUm9vdD1jb2RlPT09NDcsZW5kPS0xLG1hdGNoZWRTbGFzaD0hMDtmb3IodmFyIGk9cGF0aC5sZW5ndGgtMTtpPj0xOy0taSlpZihjb2RlPXBhdGguY2hhckNvZGVBdChpKSxjb2RlPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe2VuZD1pO2JyZWFrfX1lbHNlIG1hdGNoZWRTbGFzaD0hMTtpZihlbmQ9PT0tMSlyZXR1cm4gaGFzUm9vdD9cIi9cIjpcIi5cIjtpZihoYXNSb290JiZlbmQ9PT0xKXJldHVyblwiLy9cIjtyZXR1cm4gcGF0aC5zbGljZSgwLGVuZCl9ZnVuY3Rpb24gYmFzZW5hbWUocGF0aCxleHQpe2lmKGV4dCE9PXZvaWQgMCYmdHlwZW9mIGV4dCE9PVwic3RyaW5nXCIpdGhyb3cgVHlwZUVycm9yKCdcImV4dFwiIGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTthc3NlcnRQYXRoKHBhdGgpO3ZhciBzdGFydD0wLGVuZD0tMSxtYXRjaGVkU2xhc2g9ITAsaTtpZihleHQhPT12b2lkIDAmJmV4dC5sZW5ndGg+MCYmZXh0Lmxlbmd0aDw9cGF0aC5sZW5ndGgpe2lmKGV4dC5sZW5ndGg9PT1wYXRoLmxlbmd0aCYmZXh0PT09cGF0aClyZXR1cm5cIlwiO3ZhciBleHRJZHg9ZXh0Lmxlbmd0aC0xLGZpcnN0Tm9uU2xhc2hFbmQ9LTE7Zm9yKGk9cGF0aC5sZW5ndGgtMTtpPj0wOy0taSl7dmFyIGNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpO2lmKGNvZGU9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7c3RhcnQ9aSsxO2JyZWFrfX1lbHNle2lmKGZpcnN0Tm9uU2xhc2hFbmQ9PT0tMSltYXRjaGVkU2xhc2g9ITEsZmlyc3ROb25TbGFzaEVuZD1pKzE7aWYoZXh0SWR4Pj0wKWlmKGNvZGU9PT1leHQuY2hhckNvZGVBdChleHRJZHgpKXtpZigtLWV4dElkeD09PS0xKWVuZD1pfWVsc2UgZXh0SWR4PS0xLGVuZD1maXJzdE5vblNsYXNoRW5kfX1pZihzdGFydD09PWVuZCllbmQ9Zmlyc3ROb25TbGFzaEVuZDtlbHNlIGlmKGVuZD09PS0xKWVuZD1wYXRoLmxlbmd0aDtyZXR1cm4gcGF0aC5zbGljZShzdGFydCxlbmQpfWVsc2V7Zm9yKGk9cGF0aC5sZW5ndGgtMTtpPj0wOy0taSlpZihwYXRoLmNoYXJDb2RlQXQoaSk9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7c3RhcnQ9aSsxO2JyZWFrfX1lbHNlIGlmKGVuZD09PS0xKW1hdGNoZWRTbGFzaD0hMSxlbmQ9aSsxO2lmKGVuZD09PS0xKXJldHVyblwiXCI7cmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsZW5kKX19ZnVuY3Rpb24gZXh0bmFtZShwYXRoKXthc3NlcnRQYXRoKHBhdGgpO3ZhciBzdGFydERvdD0tMSxzdGFydFBhcnQ9MCxlbmQ9LTEsbWF0Y2hlZFNsYXNoPSEwLHByZURvdFN0YXRlPTA7Zm9yKHZhciBpPXBhdGgubGVuZ3RoLTE7aT49MDstLWkpe3ZhciBjb2RlPXBhdGguY2hhckNvZGVBdChpKTtpZihjb2RlPT09NDcpe2lmKCFtYXRjaGVkU2xhc2gpe3N0YXJ0UGFydD1pKzE7YnJlYWt9Y29udGludWV9aWYoZW5kPT09LTEpbWF0Y2hlZFNsYXNoPSExLGVuZD1pKzE7aWYoY29kZT09PTQ2KXtpZihzdGFydERvdD09PS0xKXN0YXJ0RG90PWk7ZWxzZSBpZihwcmVEb3RTdGF0ZSE9PTEpcHJlRG90U3RhdGU9MX1lbHNlIGlmKHN0YXJ0RG90IT09LTEpcHJlRG90U3RhdGU9LTF9aWYoc3RhcnREb3Q9PT0tMXx8ZW5kPT09LTF8fHByZURvdFN0YXRlPT09MHx8cHJlRG90U3RhdGU9PT0xJiZzdGFydERvdD09PWVuZC0xJiZzdGFydERvdD09PXN0YXJ0UGFydCsxKXJldHVyblwiXCI7cmV0dXJuIHBhdGguc2xpY2Uoc3RhcnREb3QsZW5kKX1mdW5jdGlvbiBmb3JtYXQocGF0aE9iamVjdCl7aWYocGF0aE9iamVjdD09PW51bGx8fHR5cGVvZiBwYXRoT2JqZWN0IT09XCJvYmplY3RcIil0aHJvdyBUeXBlRXJyb3IoJ1RoZSBcInBhdGhPYmplY3RcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcrdHlwZW9mIHBhdGhPYmplY3QpO3JldHVybiBfZm9ybWF0KFwiL1wiLHBhdGhPYmplY3QpfWZ1bmN0aW9uIHBhcnNlKHBhdGgpe2Fzc2VydFBhdGgocGF0aCk7dmFyIHJldD17cm9vdDpcIlwiLGRpcjpcIlwiLGJhc2U6XCJcIixleHQ6XCJcIixuYW1lOlwiXCJ9O2lmKHBhdGgubGVuZ3RoPT09MClyZXR1cm4gcmV0O3ZhciBjb2RlPXBhdGguY2hhckNvZGVBdCgwKSxpc0Fic29sdXRlMj1jb2RlPT09NDcsc3RhcnQ7aWYoaXNBYnNvbHV0ZTIpcmV0LnJvb3Q9XCIvXCIsc3RhcnQ9MTtlbHNlIHN0YXJ0PTA7dmFyIHN0YXJ0RG90PS0xLHN0YXJ0UGFydD0wLGVuZD0tMSxtYXRjaGVkU2xhc2g9ITAsaT1wYXRoLmxlbmd0aC0xLHByZURvdFN0YXRlPTA7Zm9yKDtpPj1zdGFydDstLWkpe2lmKGNvZGU9cGF0aC5jaGFyQ29kZUF0KGkpLGNvZGU9PT00Nyl7aWYoIW1hdGNoZWRTbGFzaCl7c3RhcnRQYXJ0PWkrMTticmVha31jb250aW51ZX1pZihlbmQ9PT0tMSltYXRjaGVkU2xhc2g9ITEsZW5kPWkrMTtpZihjb2RlPT09NDYpe2lmKHN0YXJ0RG90PT09LTEpc3RhcnREb3Q9aTtlbHNlIGlmKHByZURvdFN0YXRlIT09MSlwcmVEb3RTdGF0ZT0xfWVsc2UgaWYoc3RhcnREb3QhPT0tMSlwcmVEb3RTdGF0ZT0tMX1pZihzdGFydERvdD09PS0xfHxlbmQ9PT0tMXx8cHJlRG90U3RhdGU9PT0wfHxwcmVEb3RTdGF0ZT09PTEmJnN0YXJ0RG90PT09ZW5kLTEmJnN0YXJ0RG90PT09c3RhcnRQYXJ0KzEpe2lmKGVuZCE9PS0xKWlmKHN0YXJ0UGFydD09PTAmJmlzQWJzb2x1dGUyKXJldC5iYXNlPXJldC5uYW1lPXBhdGguc2xpY2UoMSxlbmQpO2Vsc2UgcmV0LmJhc2U9cmV0Lm5hbWU9cGF0aC5zbGljZShzdGFydFBhcnQsZW5kKX1lbHNle2lmKHN0YXJ0UGFydD09PTAmJmlzQWJzb2x1dGUyKXJldC5uYW1lPXBhdGguc2xpY2UoMSxzdGFydERvdCkscmV0LmJhc2U9cGF0aC5zbGljZSgxLGVuZCk7ZWxzZSByZXQubmFtZT1wYXRoLnNsaWNlKHN0YXJ0UGFydCxzdGFydERvdCkscmV0LmJhc2U9cGF0aC5zbGljZShzdGFydFBhcnQsZW5kKTtyZXQuZXh0PXBhdGguc2xpY2Uoc3RhcnREb3QsZW5kKX1pZihzdGFydFBhcnQ+MClyZXQuZGlyPXBhdGguc2xpY2UoMCxzdGFydFBhcnQtMSk7ZWxzZSBpZihpc0Fic29sdXRlMilyZXQuZGlyPVwiL1wiO3JldHVybiByZXR9dmFyIHNlcD1cIi9cIixkZWxpbWl0ZXI9XCI6XCIscG9zaXg9KChwKT0+KHAucG9zaXg9cCxwKSkoe3Jlc29sdmUsbm9ybWFsaXplLGlzQWJzb2x1dGUsam9pbixyZWxhdGl2ZSxfbWFrZUxvbmcsZGlybmFtZSxiYXNlbmFtZSxleHRuYW1lLGZvcm1hdCxwYXJzZSxzZXAsZGVsaW1pdGVyLHdpbjMyOm51bGwscG9zaXg6bnVsbH0pO3ZhciBwYXRoX2RlZmF1bHQ9cG9zaXg7ZXhwb3J0e3NlcCxyZXNvbHZlLHJlbGF0aXZlLHBvc2l4LHBhcnNlLG5vcm1hbGl6ZSxqb2luLGlzQWJzb2x1dGUsZm9ybWF0LGV4dG5hbWUsZGlybmFtZSxkZWxpbWl0ZXIscGF0aF9kZWZhdWx0IGFzIGRlZmF1bHQsYmFzZW5hbWUsX21ha2VMb25nfTsiLAogICAgImltcG9ydCB7cmVhZEZpbGV9IGZyb20gJ2ZzL3Byb21pc2VzJ1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJ1xuaW1wb3J0IHttYXJrZWR9IGZyb20gJ21hcmtlZCdcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5hdkd1aWRlcygpOiBQcm9taXNlPHN0cmluZz4ge1xuXHQvLyBPbmx5IGxvYWQgbmF2IG9uIHNlcnZlciwgbm90IGluIGJyb3dzZXJcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnIHx8ICFpbXBvcnQubWV0YS5kaXIpIHtcblx0XHRyZXR1cm4gJydcblx0fVxuXHRcblx0dHJ5IHtcblx0XHRjb25zdCBuYXZQYXRoID0gam9pbihpbXBvcnQubWV0YS5kaXIsICcuLi8uLi8uLicsICdkb2NzJywgJ2RvY3MnLCAnbmF2LWd1aWRlcy5tZCcpXG5cdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKG5hdlBhdGgsICd1dGYtOCcpXG5cdFx0cmV0dXJuIG1hcmtlZC5wYXJzZShjb250ZW50KSBhcyBzdHJpbmdcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBuYXYtZ3VpZGVzLm1kJywgZXJyb3IpXG5cdFx0cmV0dXJuICcnXG5cdH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5hdk1ldGhvZHMoKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0Ly8gT25seSBsb2FkIG5hdiBvbiBzZXJ2ZXIsIG5vdCBpbiBicm93c2VyXG5cdGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyB8fCAhaW1wb3J0Lm1ldGEuZGlyKSB7XG5cdFx0cmV0dXJuICcnXG5cdH1cblx0XG5cdHRyeSB7XG5cdFx0Y29uc3QgbmF2UGF0aCA9IGpvaW4oaW1wb3J0Lm1ldGEuZGlyLCAnLi4vLi4vLi4nLCAnZG9jcycsICdkb2NzJywgJ25hdi1tZXRob2RzLm1kJylcblx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgcmVhZEZpbGUobmF2UGF0aCwgJ3V0Zi04Jylcblx0XHRyZXR1cm4gbWFya2VkLnBhcnNlKGNvbnRlbnQpIGFzIHN0cmluZ1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIG5hdi1tZXRob2RzLm1kJywgZXJyb3IpXG5cdFx0cmV0dXJuICcnXG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IHtNaXRocmlsVHN4Q29tcG9uZW50LCBWbm9kZSwgQ29tcG9uZW50fSBmcm9tICcuLi8uLi8uLi9pbmRleCdcbmltcG9ydCBtIGZyb20gJy4uLy4uLy4uL2luZGV4J1xuaW1wb3J0IHtEb2NQYWdlQ29tcG9uZW50fSBmcm9tICcuL2RvYy1wYWdlJ1xuaW1wb3J0IHtsb2FkTWFya2Rvd25Gcm9tRG9jc30gZnJvbSAnLi4vbWFya2Rvd24nXG5pbXBvcnQge2dldE5hdkd1aWRlcywgZ2V0TmF2TWV0aG9kc30gZnJvbSAnLi4vbmF2J1xuXG5pbnRlcmZhY2UgRG9jTG9hZGVyQXR0cnMge1xuXHRkb2NOYW1lOiBzdHJpbmdcblx0cm91dGVQYXRoOiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIERvY0xvYWRlciBleHRlbmRzIE1pdGhyaWxUc3hDb21wb25lbnQ8RG9jTG9hZGVyQXR0cnM+IHtcblx0cHJpdmF0ZSBwYWdlOiBhbnkgPSBudWxsXG5cdHByaXZhdGUgbmF2R3VpZGVzOiBzdHJpbmcgPSAnJ1xuXHRwcml2YXRlIG5hdk1ldGhvZHM6IHN0cmluZyA9ICcnXG5cdHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcblx0cHJpdmF0ZSBlcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGxcblxuXHRhc3luYyBvbmluaXQodm5vZGU6IFZub2RlPERvY0xvYWRlckF0dHJzPikge1xuXHRcdGNvbnN0IGlzU2VydmVyID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCdcblx0XHRjb25zb2xlLmxvZygnW0RvY0xvYWRlcl0gb25pbml0IGNhbGxlZCwgaXNTZXJ2ZXI6JywgaXNTZXJ2ZXIsICdkb2NOYW1lOicsIHZub2RlLmF0dHJzLmRvY05hbWUsICdyb3V0ZVBhdGg6Jywgdm5vZGUuYXR0cnMucm91dGVQYXRoKVxuXHRcdFxuXHRcdC8vIE9uIGNsaWVudCAoYnJvd3NlciksIHNraXAgbG9hZGluZyAtIGRhdGEgc2hvdWxkIGNvbWUgZnJvbSBTU1IgaHlkcmF0aW9uXG5cdFx0Ly8gVGhlIEhUTUwgaXMgYWxyZWFkeSByZW5kZXJlZCBieSB0aGUgc2VydmVyLCB3ZSBqdXN0IG5lZWQgdG8gaHlkcmF0ZVxuXHRcdGlmICghaXNTZXJ2ZXIpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbRG9jTG9hZGVyXSBDbGllbnQtc2lkZTogc2tpcHBpbmcgZGF0YSBsb2FkLCByZWx5aW5nIG9uIFNTUicpXG5cdFx0XHR0aGlzLmxvYWRpbmcgPSBmYWxzZVxuXHRcdFx0dGhpcy5wYWdlID0gbnVsbCAvLyBXaWxsIGJlIHNldCBpZiBuZWVkZWQgZm9yIGNsaWVudC1zaWRlIG5hdlxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNlcnZlci1zaWRlOiBsb2FkIHRoZSBtYXJrZG93biBmaWxlc1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW0RvY0xvYWRlcl0gU2VydmVyLXNpZGU6IExvYWRpbmcgZG9jOicsIHZub2RlLmF0dHJzLmRvY05hbWUsICdwYXRoOicsIHZub2RlLmF0dHJzLnJvdXRlUGF0aClcblx0XHRcdGNvbnN0IFtwYWdlLCBuYXZHdWlkZXMsIG5hdk1ldGhvZHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRsb2FkTWFya2Rvd25Gcm9tRG9jcyh2bm9kZS5hdHRycy5kb2NOYW1lKSxcblx0XHRcdFx0Z2V0TmF2R3VpZGVzKCksXG5cdFx0XHRcdGdldE5hdk1ldGhvZHMoKSxcblx0XHRcdF0pXG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nKCdbRG9jTG9hZGVyXSBTZXJ2ZXItc2lkZTogTG9hZGVkIHJlc3VsdHMgLSBwYWdlOicsIHBhZ2UgPyBgeWVzICh0aXRsZTogJHtwYWdlLnRpdGxlfSwgY29udGVudCBsZW5ndGg6ICR7cGFnZS5jb250ZW50Lmxlbmd0aH0pYCA6ICdubycsIFxuXHRcdFx0XHQnbmF2R3VpZGVzOicsIG5hdkd1aWRlcy5sZW5ndGgsICdjaGFycycsICduYXZNZXRob2RzOicsIG5hdk1ldGhvZHMubGVuZ3RoLCAnY2hhcnMnKVxuXHRcdFx0XG5cdFx0XHRpZiAoIXBhZ2UpIHtcblx0XHRcdFx0dGhpcy5lcnJvciA9IGBQYWdlIFwiJHt2bm9kZS5hdHRycy5yb3V0ZVBhdGh9XCIgbm90IGZvdW5kYFxuXHRcdFx0XHRjb25zb2xlLmVycm9yKCdbRG9jTG9hZGVyXSBTZXJ2ZXItc2lkZTogUGFnZSBub3QgZm91bmQ6Jywgdm5vZGUuYXR0cnMuZG9jTmFtZSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucGFnZSA9IHBhZ2Vcblx0XHRcdFx0dGhpcy5uYXZHdWlkZXMgPSBuYXZHdWlkZXNcblx0XHRcdFx0dGhpcy5uYXZNZXRob2RzID0gbmF2TWV0aG9kc1xuXHRcdFx0XHRjb25zb2xlLmxvZygnW0RvY0xvYWRlcl0gU2VydmVyLXNpZGU6IERhdGEgbG9hZGVkIHN1Y2Nlc3NmdWxseScpXG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdbRG9jTG9hZGVyXSBTZXJ2ZXItc2lkZTogRXJyb3IgbG9hZGluZzonLCBlcnIpXG5cdFx0XHRpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignW0RvY0xvYWRlcl0gU2VydmVyLXNpZGU6IEVycm9yIHN0YWNrOicsIGVyci5zdGFjaylcblx0XHRcdH1cblx0XHRcdHRoaXMuZXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMubG9hZGluZyA9IGZhbHNlXG5cdFx0XHRjb25zb2xlLmxvZygnW0RvY0xvYWRlcl0gU2VydmVyLXNpZGU6IG9uaW5pdCBjb21wbGV0ZSwgbG9hZGluZzonLCB0aGlzLmxvYWRpbmcsICdoYXMgcGFnZTonLCAhIXRoaXMucGFnZSwgJ2Vycm9yOicsIHRoaXMuZXJyb3IpXG5cdFx0fVxuXHR9XG5cblx0dmlldyh2bm9kZTogVm5vZGU8RG9jTG9hZGVyQXR0cnM+KSB7XG5cdFx0Y29uc3QgaXNTZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJ1xuXHRcdGNvbnNvbGUubG9nKCdbRG9jTG9hZGVyXSB2aWV3IGNhbGxlZCwgaXNTZXJ2ZXI6JywgaXNTZXJ2ZXIsICdsb2FkaW5nOicsIHRoaXMubG9hZGluZywgJ2hhcyBwYWdlOicsICEhdGhpcy5wYWdlLCAnZXJyb3I6JywgdGhpcy5lcnJvcilcblx0XHRcblx0XHQvLyBPbiBjbGllbnQsIGlmIHdlIGRvbid0IGhhdmUgcGFnZSBkYXRhLCB0cnkgdG8gZXh0cmFjdCBpdCBmcm9tIFNTUiBzdGF0ZSBvciBzaG93IHBsYWNlaG9sZGVyXG5cdFx0Ly8gRm9yIG5vdywgb24gY2xpZW50IHdlJ2xsIHJlbmRlciBhIHBsYWNlaG9sZGVyIHRoYXQgd2lsbCBiZSByZXBsYWNlZCBieSBoeWRyYXRpb25cblx0XHRpZiAoIWlzU2VydmVyICYmICF0aGlzLnBhZ2UgJiYgIXRoaXMubG9hZGluZykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tEb2NMb2FkZXJdIENsaWVudC1zaWRlOiBObyBwYWdlIGRhdGEsIHJlbmRlcmluZyBwbGFjZWhvbGRlcicpXG5cdFx0XHQvLyBDbGllbnQtc2lkZTogcmVuZGVyIGEgcGxhY2Vob2xkZXIgdGhhdCBtYXRjaGVzIFNTUiBzdHJ1Y3R1cmVcblx0XHRcdC8vIFRoZSBhY3R1YWwgY29udGVudCBzaG91bGQgYWxyZWFkeSBiZSBpbiB0aGUgRE9NIGZyb20gU1NSXG5cdFx0XHRyZXR1cm4gbSgnZGl2Jywge3N0eWxlOiAnZGlzcGxheTogbm9uZSd9LCAnSHlkcmF0aW5nLi4uJylcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHRoaXMubG9hZGluZykge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tEb2NMb2FkZXJdIFN0aWxsIGxvYWRpbmcsIHJlbmRlcmluZyBsb2FkaW5nIHN0YXRlJylcblx0XHRcdHJldHVybiBtKCdkaXYnLCAnTG9hZGluZy4uLicpXG5cdFx0fVxuXHRcdFxuXHRcdGlmICh0aGlzLmVycm9yIHx8ICF0aGlzLnBhZ2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbRG9jTG9hZGVyXSBFcnJvciBvciBubyBwYWdlLCByZW5kZXJpbmcgNDA0Jylcblx0XHRcdHJldHVybiBtKCdkaXYnLCBbXG5cdFx0XHRcdG0oJ2gxJywgJzQwNCAtIFBhZ2UgTm90IEZvdW5kJyksXG5cdFx0XHRcdG0oJ3AnLCB0aGlzLmVycm9yIHx8IGBUaGUgcGFnZSBcIiR7dm5vZGUuYXR0cnMucm91dGVQYXRofVwiIGNvdWxkIG5vdCBiZSBmb3VuZC5gKSxcblx0XHRcdF0pXG5cdFx0fVxuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCdbRG9jTG9hZGVyXSBSZW5kZXJpbmcgRG9jUGFnZUNvbXBvbmVudCB3aXRoIHBhZ2UgdGl0bGU6JywgdGhpcy5wYWdlLnRpdGxlKVxuXHRcdGNvbnN0IHJlc3VsdCA9IG0oRG9jUGFnZUNvbXBvbmVudCBhcyBhbnksIHtcblx0XHRcdHBhZ2U6IHRoaXMucGFnZSxcblx0XHRcdHJvdXRlUGF0aDogdm5vZGUuYXR0cnMucm91dGVQYXRoLFxuXHRcdFx0bmF2R3VpZGVzOiB0aGlzLm5hdkd1aWRlcyxcblx0XHRcdG5hdk1ldGhvZHM6IHRoaXMubmF2TWV0aG9kcyxcblx0XHR9KVxuXHRcdGlmICghcmVzdWx0IHx8ICFyZXN1bHQudGFnKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdbRG9jTG9hZGVyXSBJbnZhbGlkIHZub2RlIGZyb20gRG9jUGFnZUNvbXBvbmVudCwgcmVzdWx0OicsIHJlc3VsdClcblx0XHRcdHJldHVybiBtKCdkaXYnLCAnRXJyb3IgcmVuZGVyaW5nIHBhZ2UnKVxuXHRcdH1cblx0XHRjb25zb2xlLmxvZygnW0RvY0xvYWRlcl0gRG9jUGFnZUNvbXBvbmVudCB2bm9kZSBjcmVhdGVkLCB0YWc6JywgdHlwZW9mIHJlc3VsdC50YWcgPT09ICdzdHJpbmcnID8gcmVzdWx0LnRhZyA6IHJlc3VsdC50YWcubmFtZSB8fCAnY29tcG9uZW50Jylcblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cbn1cbiIsCiAgICAiaW1wb3J0IG0gZnJvbSAnLi4vLi4vaW5kZXgnXG5pbXBvcnQge0RvY0xvYWRlcn0gZnJvbSAnLi9jb21wb25lbnRzL2RvYy1sb2FkZXInXG5pbXBvcnQgdHlwZSB7Q29tcG9uZW50VHlwZSwgVm5vZGV9IGZyb20gJy4uLy4uL2luZGV4J1xuaW1wb3J0IHR5cGUge1JvdXRlUmVzb2x2ZXJ9IGZyb20gJy4uLy4uL2FwaS9yb3V0ZXInXG5cbi8vIE1hcCBvZiByb3V0ZSBwYXRocyB0byBtYXJrZG93biBmaWxlIG5hbWVzXG5jb25zdCByb3V0ZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcblx0Jy8nOiAnaW5kZXgnLFxuXHQnL2luc3RhbGxhdGlvbi5odG1sJzogJ2luc3RhbGxhdGlvbicsXG5cdCcvc2ltcGxlLWFwcGxpY2F0aW9uLmh0bWwnOiAnc2ltcGxlLWFwcGxpY2F0aW9uJyxcblx0Jy9sZWFybmluZy1taXRocmlsLmh0bWwnOiAnbGVhcm5pbmctbWl0aHJpbCcsXG5cdCcvc3VwcG9ydC5odG1sJzogJ3N1cHBvcnQnLFxuXHQnL2pzeC5odG1sJzogJ2pzeCcsXG5cdCcvZXM2Lmh0bWwnOiAnZXM2Jyxcblx0Jy9hbmltYXRpb24uaHRtbCc6ICdhbmltYXRpb24nLFxuXHQnL3Rlc3RpbmcuaHRtbCc6ICd0ZXN0aW5nJyxcblx0Jy9leGFtcGxlcy5odG1sJzogJ2V4YW1wbGVzJyxcblx0Jy9pbnRlZ3JhdGluZy1saWJzLmh0bWwnOiAnaW50ZWdyYXRpbmctbGlicycsXG5cdCcvcGF0aHMuaHRtbCc6ICdwYXRocycsXG5cdCcvdm5vZGVzLmh0bWwnOiAndm5vZGVzJyxcblx0Jy9jb21wb25lbnRzLmh0bWwnOiAnY29tcG9uZW50cycsXG5cdCcvbGlmZWN5Y2xlLW1ldGhvZHMuaHRtbCc6ICdsaWZlY3ljbGUtbWV0aG9kcycsXG5cdCcva2V5cy5odG1sJzogJ2tleXMnLFxuXHQnL2F1dG9yZWRyYXcuaHRtbCc6ICdhdXRvcmVkcmF3Jyxcblx0Jy9jb250cmlidXRpbmcuaHRtbCc6ICdjb250cmlidXRpbmcnLFxuXHQnL2NyZWRpdHMuaHRtbCc6ICdjcmVkaXRzJyxcblx0Jy9jb2RlLW9mLWNvbmR1Y3QuaHRtbCc6ICdjb2RlLW9mLWNvbmR1Y3QnLFxuXHQnL2ZyYW1ld29yay1jb21wYXJpc29uLmh0bWwnOiAnZnJhbWV3b3JrLWNvbXBhcmlzb24nLFxuXHQnL2FyY2hpdmVzLmh0bWwnOiAnYXJjaGl2ZXMnLFxuXHQnL2FwaS5odG1sJzogJ2FwaScsXG5cdCcvaHlwZXJzY3JpcHQuaHRtbCc6ICdoeXBlcnNjcmlwdCcsXG5cdCcvcmVuZGVyLmh0bWwnOiAncmVuZGVyJyxcblx0Jy9tb3VudC5odG1sJzogJ21vdW50Jyxcblx0Jy9yb3V0ZS5odG1sJzogJ3JvdXRlJyxcblx0Jy9yZXF1ZXN0Lmh0bWwnOiAncmVxdWVzdCcsXG5cdCcvcGFyc2VRdWVyeVN0cmluZy5odG1sJzogJ3BhcnNlUXVlcnlTdHJpbmcnLFxuXHQnL2J1aWxkUXVlcnlTdHJpbmcuaHRtbCc6ICdidWlsZFF1ZXJ5U3RyaW5nJyxcblx0Jy9idWlsZFBhdGhuYW1lLmh0bWwnOiAnYnVpbGRQYXRobmFtZScsXG5cdCcvcGFyc2VQYXRobmFtZS5odG1sJzogJ3BhcnNlUGF0aG5hbWUnLFxuXHQnL3RydXN0Lmh0bWwnOiAndHJ1c3QnLFxuXHQnL2ZyYWdtZW50Lmh0bWwnOiAnZnJhZ21lbnQnLFxuXHQnL3JlZHJhdy5odG1sJzogJ3JlZHJhdycsXG5cdCcvY2Vuc29yLmh0bWwnOiAnY2Vuc29yJyxcblx0Jy9zdHJlYW0uaHRtbCc6ICdzdHJlYW0nLFxufVxuXG5mdW5jdGlvbiBjcmVhdGVSb3V0ZShyb3V0ZVBhdGg6IHN0cmluZywgZG9jTmFtZTogc3RyaW5nKTogUm91dGVSZXNvbHZlciB7XG5cdHJldHVybiB7XG5cdFx0cmVuZGVyOiAodm5vZGU6IFZub2RlKSA9PiB7XG5cdFx0XHQvLyBVc2Ugcm91dGVQYXRoIGZyb20gcm91dGVyJ3Mgdm5vZGUgYXR0cnMgKHBhc3NlZCBieSByb3V0ZS5yZXNvbHZlKVxuXHRcdFx0Y29uc3QgYWN0dWFsUm91dGVQYXRoID0gdm5vZGUuYXR0cnM/LnJvdXRlUGF0aCB8fCByb3V0ZVBhdGhcblx0XHRcdGNvbnNvbGUubG9nKCdbY3JlYXRlUm91dGVdIFJlbmRlcmluZyByb3V0ZTonLCByb3V0ZVBhdGgsICdkb2NOYW1lOicsIGRvY05hbWUsICdhY3R1YWxSb3V0ZVBhdGg6JywgYWN0dWFsUm91dGVQYXRoKVxuXHRcdFx0Ly8gUmV0dXJuIERvY0xvYWRlciBjb21wb25lbnQgd2hpY2ggd2lsbCBsb2FkIGRhdGEgaW4gb25pbml0XG5cdFx0XHRjb25zdCByZXN1bHQgPSBtKERvY0xvYWRlciBhcyB1bmtub3duIGFzIGFueSwge1xuXHRcdFx0XHRrZXk6IGFjdHVhbFJvdXRlUGF0aCxcblx0XHRcdFx0cm91dGVQYXRoOiBhY3R1YWxSb3V0ZVBhdGgsXG5cdFx0XHRcdGRvY05hbWUsXG5cdFx0XHR9KVxuXHRcdFx0Ly8gRW5zdXJlIHdlIGFsd2F5cyByZXR1cm4gYSB2YWxpZCB2bm9kZVxuXHRcdFx0aWYgKCFyZXN1bHQgfHwgIXJlc3VsdC50YWcpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignW2NyZWF0ZVJvdXRlXSBJbnZhbGlkIHZub2RlIHJldHVybmVkIGZvciByb3V0ZTonLCByb3V0ZVBhdGgsICdyZXN1bHQ6JywgcmVzdWx0KVxuXHRcdFx0XHRyZXR1cm4gbSgnZGl2JywgYEVycm9yIGxvYWRpbmcgcm91dGU6ICR7cm91dGVQYXRofWApXG5cdFx0XHR9XG5cdFx0XHRjb25zb2xlLmxvZygnW2NyZWF0ZVJvdXRlXSBDcmVhdGVkIHZub2RlIGZvciByb3V0ZTonLCByb3V0ZVBhdGgsICd0YWcgdHlwZTonLCB0eXBlb2YgcmVzdWx0LnRhZyA9PT0gJ3N0cmluZycgPyByZXN1bHQudGFnIDogJ2NvbXBvbmVudCcpXG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fSxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um91dGVzKCk6IFJlY29yZDxzdHJpbmcsIENvbXBvbmVudFR5cGUgfCBSb3V0ZVJlc29sdmVyPiB7XG5cdGNvbnN0IHJvdXRlczogUmVjb3JkPHN0cmluZywgQ29tcG9uZW50VHlwZSB8IFJvdXRlUmVzb2x2ZXI+ID0ge31cblx0XG5cdGZvciAoY29uc3QgW3BhdGgsIGRvY05hbWVdIG9mIE9iamVjdC5lbnRyaWVzKHJvdXRlTWFwKSkge1xuXHRcdHJvdXRlc1twYXRoXSA9IGNyZWF0ZVJvdXRlKHBhdGgsIGRvY05hbWUpXG5cdH1cblx0XG5cdHJldHVybiByb3V0ZXNcbn1cbiIsCiAgICAiaW1wb3J0IG0gZnJvbSAnLi4vLi4vaW5kZXgnXG5pbXBvcnQge2dldFJvdXRlc30gZnJvbSAnLi9yb3V0ZXMnXG5cbi8vIEluaXRpYWxpemUgcm91dGVzIG9uIGNsaWVudFxuY29uc3Qgcm91dGVzID0gZ2V0Um91dGVzKClcblxuLy8gU3RhcnQgY2xpZW50LXNpZGUgcm91dGluZ1xubS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJykhLCAnLycsIHJvdXRlcylcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7OztBQUNBLElBQWUsa0JBQUMsRUFBRTs7O0FDMENYLE1BQWUsb0JBQWlEO0FBUXZFO0FBRUEsU0FBUyxLQUFLLENBQUMsS0FBVSxLQUF5QyxPQUErQyxVQUF1QyxNQUEwQyxLQUFxQztBQUFBLEVBQ3RPLE9BQU8sRUFBQyxLQUFVLEtBQUssT0FBTyxXQUFXLE9BQU8sU0FBUyxXQUFXLFVBQVUsWUFBWSxXQUFXLE1BQU0sUUFBUSxXQUFXLEtBQUssT0FBTyxXQUFXLElBQUksV0FBVyxTQUFTLFdBQVcsT0FBTyxXQUFXLFFBQVEsV0FBVyxVQUFVLFVBQVM7QUFBQTtBQUVqUCxJQUFNLFlBQVksUUFBUSxDQUFDLE1BQXlCO0FBQUEsRUFDbkQsSUFBSSxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQUcsT0FBTyxNQUFNLEtBQUssV0FBVyxXQUFXLGtCQUFrQixJQUFJLEdBQWUsV0FBVyxTQUFTO0FBQUEsRUFDMUgsSUFBSSxRQUFRLFFBQVEsT0FBTyxTQUFTO0FBQUEsSUFBVyxPQUFPO0FBQUEsRUFDdEQsSUFBSSxPQUFPLFNBQVM7QUFBQSxJQUFVLE9BQU87QUFBQSxFQUNyQyxPQUFPLE1BQU0sS0FBSyxXQUFXLFdBQVcsT0FBTyxJQUFJLEdBQUcsV0FBVyxTQUFTO0FBQUE7QUFHM0UsSUFBTSxvQkFBb0IsUUFBUSxDQUFDLE9BQWdDO0FBQUEsRUFHbEUsTUFBTSxXQUFXLElBQUksTUFBTSxNQUFNLE1BQU07QUFBQSxFQUt2QyxJQUFJLFdBQVc7QUFBQSxFQUNmLFNBQVMsSUFBSSxFQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxJQUN0QyxTQUFTLEtBQUssVUFBVSxNQUFNLEVBQUU7QUFBQSxJQUNoQyxJQUFJLFNBQVMsT0FBTyxRQUFRLFNBQVMsR0FBSSxPQUFPO0FBQUEsTUFBTTtBQUFBLEVBQ3ZEO0FBQUEsRUFDQSxJQUFJLGFBQWEsS0FBSyxhQUFhLE1BQU0sUUFBUTtBQUFBLElBQ2hELE1BQU0sSUFBSSxVQUFVLFNBQVMsU0FBUyxJQUFJLElBQ3ZDLGtMQUNBLG1FQUNIO0FBQUEsRUFDRDtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBR04sTUFBYyxZQUFZO0FBQzFCLE1BQWMsb0JBQW9CO0FBRXBDLElBQWU7OztBQzdFZixTQUF3QixnQkFBZ0IsQ0FBQyxPQUFZLFVBQXNCO0FBQUEsRUFDMUUsSUFBSSxTQUFTLFFBQVEsT0FBTyxVQUFVLFlBQVksTUFBTSxPQUFPLFFBQVEsQ0FBQyxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsSUFDN0YsSUFBSSxTQUFTLFdBQVcsS0FBSyxNQUFNLFFBQVEsU0FBUyxFQUFFO0FBQUEsTUFBRyxXQUFXLFNBQVM7QUFBQSxFQUM5RSxFQUFPO0FBQUEsSUFDTixXQUFXLFNBQVMsV0FBVyxLQUFLLE1BQU0sUUFBUSxLQUFLLElBQUksUUFBUSxDQUFDLE9BQU8sR0FBRyxRQUFRO0FBQUEsSUFDdEYsUUFBUTtBQUFBO0FBQUEsRUFHVCxPQUFPLGNBQU0sSUFBSSxTQUFTLE1BQU0sS0FBSyxPQUFPLFVBQVUsTUFBTSxJQUFJO0FBQUE7OztBQ2xCakUsSUFBZSxzQkFBQzs7O0FDUWhCLElBQWUscUNBQUksSUFBSSxDQUFDLENBQUMsb0JBQVksSUFBSSxDQUFDLENBQUM7OztBQ1AzQyxTQUF3QixLQUFLLENBQUMsTUFBc0M7QUFBQSxFQUNuRSxJQUFJLFFBQVE7QUFBQSxJQUFNLE9BQU87QUFBQSxFQUN6QixPQUFPLGNBQU0sS0FBSyxXQUFXLFdBQVcsTUFBTSxXQUFXLFNBQVM7QUFBQTs7O0FDRG5FLFNBQXdCLFFBQVEsQ0FBQyxVQUFlLFVBQXNCO0FBQUEsRUFDckUsTUFBTSxRQUFRLGlCQUFpQixPQUFPLFFBQVE7QUFBQSxFQUU5QyxJQUFJLE1BQU0sU0FBUztBQUFBLElBQU0sTUFBTSxRQUFRLENBQUM7QUFBQSxFQUN4QyxNQUFNLE1BQU07QUFBQSxFQUNaLE1BQU0sV0FBVyxjQUFNLGtCQUFrQixNQUFNLFFBQVE7QUFBQSxFQUN2RCxPQUFPO0FBQUE7OztBQ1lSLElBQU0saUJBQWlCO0FBQ3ZCLElBQU0sZ0JBQXdGLE9BQU8sT0FBTyxJQUFJO0FBRWhILFNBQVMsT0FBTyxDQUFDLFFBQXNDO0FBQUEsRUFDdEQsV0FBVyxPQUFPO0FBQUEsSUFBUSxJQUFJLGVBQU8sS0FBSyxRQUFRLEdBQUc7QUFBQSxNQUFHLE9BQU87QUFBQSxFQUMvRCxPQUFPO0FBQUE7QUFHUixTQUFTLGtCQUFrQixDQUFDLEtBQXNCO0FBQUEsRUFDakQsT0FBTyxRQUFRLFdBQVcsUUFBUSxhQUFhLFFBQVEsbUJBQW1CLFFBQVE7QUFBQTtBQUduRixTQUFTLGVBQWUsQ0FBQyxVQUEwRTtBQUFBLEVBQ2xHLElBQUk7QUFBQSxFQUNKLElBQUksTUFBTTtBQUFBLEVBQ1YsTUFBTSxVQUFvQixDQUFDO0FBQUEsRUFDM0IsSUFBSSxRQUE2QixDQUFDO0FBQUEsRUFDbEMsSUFBSSxXQUFXO0FBQUEsRUFDZixRQUFRLFFBQVEsZUFBZSxLQUFLLFFBQVEsT0FBTyxNQUFNO0FBQUEsSUFDeEQsTUFBTSxPQUFPLE1BQU07QUFBQSxJQUNuQixNQUFNLFFBQVEsTUFBTTtBQUFBLElBQ3BCLElBQUksU0FBUyxNQUFNLFVBQVU7QUFBQSxNQUFJLE1BQU07QUFBQSxJQUNsQyxTQUFJLFNBQVM7QUFBQSxNQUFLLE1BQU0sS0FBSztBQUFBLElBQzdCLFNBQUksU0FBUztBQUFBLE1BQUssUUFBUSxLQUFLLEtBQUs7QUFBQSxJQUNwQyxTQUFJLE1BQU0sR0FBRyxPQUFPLEtBQUs7QUFBQSxNQUM3QixJQUFJLFlBQVksTUFBTTtBQUFBLE1BQ3RCLElBQUk7QUFBQSxRQUFXLFlBQVksVUFBVSxRQUFRLGFBQWEsSUFBSSxFQUFFLFFBQVEsU0FBUyxJQUFJO0FBQUEsTUFDckYsSUFBSSxNQUFNLE9BQU87QUFBQSxRQUFTLFFBQVEsS0FBSyxTQUFTO0FBQUEsTUFDM0M7QUFBQSxRQUNKLE1BQU0sTUFBTSxNQUFNLGNBQWMsS0FBSyxZQUFZLGFBQWE7QUFBQSxRQUM5RCxJQUFJLG1CQUFtQixNQUFNLEVBQUU7QUFBQSxVQUFHLFdBQVc7QUFBQTtBQUFBLElBRS9DO0FBQUEsRUFDRDtBQUFBLEVBQ0EsSUFBSSxRQUFRLFNBQVM7QUFBQSxJQUFHLE1BQU0sWUFBWSxRQUFRLEtBQUssR0FBRztBQUFBLEVBQzFELElBQUksUUFBUSxLQUFLO0FBQUEsSUFBRyxRQUFRO0FBQUEsRUFDdkI7QUFBQSxtQ0FBdUIsSUFBSSxPQUFPLFFBQVE7QUFBQSxFQUMvQyxPQUFPLGNBQWMsWUFBWSxFQUFDLEtBQVUsT0FBYyxJQUFJLE1BQU0sR0FBRTtBQUFBO0FBR3ZFLFNBQVMsWUFBWSxDQUFDLE9BQStELE9BQWlCO0FBQUEsRUFDckcsTUFBTSxNQUFNLE1BQU07QUFBQSxFQUVsQixJQUFJLFFBQVEsTUFBTTtBQUFBLEVBQ2xCLElBQUksU0FBUyxNQUFNO0FBQUEsSUFDbEIsTUFBTSxRQUFRLE1BQU07QUFBQSxJQUNwQixNQUFNLEtBQUssTUFBTTtBQUFBLElBQ2pCLE9BQU87QUFBQSxFQUNSO0FBQUEsRUFFQSxJQUFJLGVBQU8sS0FBSyxPQUFPLE9BQU8sR0FBRztBQUFBLElBQ2hDLElBQUksTUFBTSxTQUFTO0FBQUEsTUFBTSxNQUFNLFlBQVksTUFBTTtBQUFBLElBQ2pELE1BQU0sUUFBUTtBQUFBLEVBQ2Y7QUFBQSxFQUVBLElBQUksTUFBTSxVQUFVLG9CQUFZO0FBQUEsSUFDL0IsTUFBTSxZQUFZLE1BQU07QUFBQSxJQUN4QixRQUFRLE9BQU8sT0FBTyxDQUFDLEdBQUcsTUFBTSxPQUFPLEtBQUs7QUFBQSxJQUU1QyxJQUFJLE1BQU0sTUFBTSxhQUFhO0FBQUEsTUFBTSxNQUFNLFlBQ3hDLGFBQWEsT0FDVixPQUFPLE1BQU0sTUFBTSxTQUFTLElBQUksTUFBTSxPQUFPLFNBQVMsSUFDdEQsTUFBTSxNQUFNO0FBQUEsRUFDakI7QUFBQSxFQUtBLElBQUksTUFBTSxRQUFRLFdBQVcsZUFBTyxLQUFLLE9BQU8sTUFBTSxHQUFHO0FBQUEsSUFDeEQsUUFBUSxPQUFPLE9BQU8sRUFBQyxNQUFNLE1BQU0sS0FBSSxHQUFHLEtBQUs7QUFBQSxFQUNoRDtBQUFBLEVBR0EsTUFBTSxLQUFLLE1BQU07QUFBQSxFQUVqQixNQUFNLFFBQVE7QUFBQSxFQUVkLE9BQU87QUFBQTtBQUdSLFNBQVMsV0FBVyxDQUFDLFVBQWtDLFVBQXVDLFVBQTJCO0FBQUEsRUFDeEgsSUFBSSxZQUFZLFFBQVEsT0FBTyxhQUFhLFlBQVksT0FBTyxhQUFhLGNBQWMsT0FBUSxTQUFpQixTQUFTLFlBQVk7QUFBQSxJQUN2SSxNQUFNLE1BQU0sc0RBQXNEO0FBQUEsRUFDbkU7QUFBQSxFQUVBLE1BQU0sUUFBUSxpQkFBaUIsT0FBTyxRQUFRO0FBQUEsRUFFOUMsSUFBSSxPQUFPLGFBQWEsVUFBVTtBQUFBLElBQ2pDLE1BQU0sV0FBVyxjQUFNLGtCQUFrQixNQUFNLFFBQVE7QUFBQSxJQUN2RCxJQUFJLGFBQWE7QUFBQSxNQUFLLE9BQU8sYUFBYSxjQUFjLGFBQWEsZ0JBQWdCLFFBQVEsR0FBRyxLQUFLO0FBQUEsRUFDdEc7QUFBQSxFQUVBLElBQUksTUFBTSxTQUFTO0FBQUEsSUFBTSxNQUFNLFFBQVEsQ0FBQztBQUFBLEVBQ3hDLE1BQU0sTUFBTTtBQUFBLEVBQ1osT0FBTztBQUFBO0FBR1IsWUFBWSxRQUFRO0FBRXBCLFlBQVksV0FBVztBQUN2QixZQUFZLFdBQVc7QUFFdkIsSUFBZTs7O0FDL0dmLElBQUk7QUFFSixJQUFJO0FBQUEsRUFDSCxRQUFPO0FBQUEsRUFDUCxhQUFhLElBQUk7QUFBQSxFQUNoQixNQUFNO0FBQUEsRUFFUCxhQUFhO0FBQUEsSUFDWixVQUFVLE1BQUc7QUFBQSxNQUFHO0FBQUE7QUFBQSxJQUNoQixLQUFLLENBQUMsVUFBVSxPQUFPLEdBQUc7QUFBQSxFQUMzQjtBQUFBO0FBdUJNLFNBQVMsYUFBYSxHQUFpQztBQUFBLEVBQzdELE9BQU8sV0FBVyxTQUFTO0FBQUE7QUFPckIsU0FBUyxjQUFpQixDQUFDLFNBQTJCLElBQWdCO0FBQUEsRUFDNUUsT0FBTyxXQUFXLElBQUksU0FBUyxFQUFFO0FBQUE7OztBQ2pEbEMsSUFBSSxnQkFBcUM7QUFHekMsSUFBTSxxQkFBcUIsSUFBSTtBQUMvQixJQUFNLHFCQUFxQixJQUFJO0FBRy9CLElBQUksbUJBQXdCO0FBRXJCLFNBQVMsbUJBQW1CLENBQUMsV0FBZ0I7QUFBQSxFQUNuRCxtQkFBbUI7QUFBQTtBQUdiLFNBQVMscUJBQXFCLEdBQUc7QUFBQSxFQUN2QyxtQkFBbUI7QUFBQTtBQU9iLFNBQVMsb0JBQW9CLENBQUMsV0FBZ0IsUUFBcUI7QUFBQSxFQUN6RSxJQUFJLENBQUMsbUJBQW1CLElBQUksU0FBUyxHQUFHO0FBQUEsSUFDdkMsbUJBQW1CLElBQUksV0FBVyxJQUFJLEdBQUs7QUFBQSxFQUM1QztBQUFBLEVBQ0EsbUJBQW1CLElBQUksU0FBUyxFQUFHLElBQUksTUFBTTtBQUFBLEVBRTdDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxNQUFNLEdBQUc7QUFBQSxJQUNwQyxtQkFBbUIsSUFBSSxRQUFRLElBQUksR0FBSztBQUFBLEVBQ3pDO0FBQUEsRUFDQSxtQkFBbUIsSUFBSSxNQUFNLEVBQUcsSUFBSSxTQUFTO0FBQUE7QUFPdkMsU0FBUyxtQkFBbUIsQ0FBQyxRQUEyQztBQUFBLEVBQzlFLE9BQU8sbUJBQW1CLElBQUksTUFBTTtBQUFBO0FBRzlCLFNBQVMsMEJBQTBCLENBQUMsV0FBZ0I7QUFBQSxFQUMxRCxNQUFNLFVBQVUsbUJBQW1CLElBQUksU0FBUztBQUFBLEVBQ2hELElBQUksU0FBUztBQUFBLElBQ1osUUFBUSxRQUFRLFlBQVU7QUFBQSxNQUN6QixNQUFNLGFBQWEsbUJBQW1CLElBQUksTUFBTTtBQUFBLE1BQ2hELElBQUksWUFBWTtBQUFBLFFBQ2YsV0FBVyxPQUFPLFNBQVM7QUFBQSxRQUMzQixJQUFJLFdBQVcsU0FBUyxHQUFHO0FBQUEsVUFDMUIsbUJBQW1CLE9BQU8sTUFBTTtBQUFBLFFBQ2pDO0FBQUEsTUFDRDtBQUFBLEtBQ0E7QUFBQSxJQUNELG1CQUFtQixPQUFPLFNBQVM7QUFBQSxFQUNwQztBQUFBO0FBSU0sU0FBUyx1QkFBdUIsQ0FBQyxVQUF5QztBQUFBLEVBQy9FLE9BQWUsbUJBQW1CO0FBQUE7QUFBQTtBQU03QixNQUFNLE9BQVU7QUFBQSxFQUNkO0FBQUEsRUFDQSxlQUFnQyxJQUFJO0FBQUEsRUFFNUMsV0FBVyxDQUFDLFNBQVk7QUFBQSxJQUN2QixLQUFLLFNBQVM7QUFBQTtBQUFBLE1BR1gsS0FBSyxHQUFNO0FBQUEsSUFFZCxJQUFJLENBQUMsS0FBSyxjQUFjO0FBQUEsTUFDdkIsS0FBSyxlQUFlLElBQUk7QUFBQSxJQUN6QjtBQUFBLElBRUEsSUFBSSxlQUFlO0FBQUEsTUFDbEIsS0FBSyxhQUFhLElBQUksYUFBYTtBQUFBLElBQ3BDO0FBQUEsSUFFQSxJQUFJLGtCQUFrQjtBQUFBLE1BQ3JCLHFCQUFxQixrQkFBa0IsSUFBSTtBQUFBLElBQzVDO0FBQUEsSUFDQSxPQUFPLEtBQUs7QUFBQTtBQUFBLE1BR1QsS0FBSyxDQUFDLFVBQWE7QUFBQSxJQUN0QixJQUFJLEtBQUssV0FBVyxVQUFVO0FBQUEsTUFDN0IsS0FBSyxTQUFTO0FBQUEsTUFFZCxJQUFJLENBQUMsS0FBSyxjQUFjO0FBQUEsUUFDdkIsS0FBSyxlQUFlLElBQUk7QUFBQSxNQUN6QjtBQUFBLE1BRUEsTUFBTSxVQUFVLGNBQWM7QUFBQSxNQUM5QixLQUFLLGFBQWEsUUFBUSxRQUFNO0FBQUEsUUFDL0IsSUFBSTtBQUFBLFVBRUgsSUFBSSxTQUFTO0FBQUEsWUFFWixlQUFlLFNBQVMsTUFBTTtBQUFBLGNBQzdCLEdBQUc7QUFBQSxhQUNIO0FBQUEsVUFDRixFQUFPO0FBQUEsWUFDTixHQUFHO0FBQUE7QUFBQSxVQUVILE9BQU0sR0FBRztBQUFBLFVBQ1YsUUFBUSxNQUFNLCtCQUErQixDQUFDO0FBQUE7QUFBQSxPQUUvQztBQUFBLE1BR0QsSUFBSyxPQUFlLGtCQUFrQjtBQUFBLFFBQ25DLE9BQWUsaUJBQWlCLElBQUk7QUFBQSxNQUN2QztBQUFBLElBQ0Q7QUFBQTtBQUFBLEVBTUQsU0FBUyxDQUFDLFVBQWtDO0FBQUEsSUFFM0MsSUFBSSxDQUFDLEtBQUssY0FBYztBQUFBLE1BQ3ZCLEtBQUssZUFBZSxJQUFJO0FBQUEsSUFDekI7QUFBQSxJQUNBLEtBQUssYUFBYSxJQUFJLFFBQVE7QUFBQSxJQUM5QixPQUFPLE1BQU07QUFBQSxNQUNaLElBQUksS0FBSyxjQUFjO0FBQUEsUUFDdEIsS0FBSyxhQUFhLE9BQU8sUUFBUTtBQUFBLE1BQ2xDO0FBQUE7QUFBQTtBQUFBLEVBT0YsS0FBSyxDQUFDLFVBQTBEO0FBQUEsSUFDL0QsSUFBSSxXQUFXLEtBQUs7QUFBQSxJQUNwQixNQUFNLGNBQWMsS0FBSyxVQUFVLE1BQU07QUFBQSxNQUN4QyxNQUFNLFdBQVcsS0FBSztBQUFBLE1BQ3RCLFNBQVMsVUFBVSxRQUFRO0FBQUEsTUFDM0IsV0FBVztBQUFBLEtBQ1g7QUFBQSxJQUNELE9BQU87QUFBQTtBQUFBLEVBTVIsSUFBSSxHQUFNO0FBQUEsSUFDVCxPQUFPLEtBQUs7QUFBQTtBQUVkO0FBQUE7QUFLTyxNQUFNLHVCQUEwQixPQUFVO0FBQUEsRUFDeEM7QUFBQSxFQUNBLGdCQUFrQyxJQUFJO0FBQUEsRUFDdEMsV0FBVztBQUFBLEVBQ1g7QUFBQSxFQUVSLFdBQVcsQ0FBQyxTQUFrQjtBQUFBLElBQzdCLE1BQU0sSUFBVztBQUFBLElBQ2pCLEtBQUssV0FBVztBQUFBO0FBQUEsTUFHYixLQUFLLEdBQU07QUFBQSxJQUdkLElBQUksZUFBZTtBQUFBLE1BRWxCLElBQUksQ0FBRSxLQUFhLGNBQWM7QUFBQSxRQUMvQixLQUFhLGVBQWUsSUFBSTtBQUFBLE1BQ2xDO0FBQUEsTUFDRSxLQUFhLGFBQWEsSUFBSSxhQUFhO0FBQUEsSUFDOUM7QUFBQSxJQUVBLElBQUksS0FBSyxVQUFVO0FBQUEsTUFFbEIsS0FBSyxjQUFjLFFBQVEsU0FBTztBQUFBLFFBQ2pDLElBQUksVUFBVSxNQUFNLEtBQUssV0FBVyxDQUFDLElBQUk7QUFBQSxPQUN6QztBQUFBLE1BQ0QsS0FBSyxjQUFjLE1BQU07QUFBQSxNQUd6QixNQUFNLGlCQUFpQjtBQUFBLE1BQ3ZCLGdCQUFnQixNQUFNO0FBQUEsUUFDckIsS0FBSyxXQUFXO0FBQUE7QUFBQSxNQUdqQixJQUFJO0FBQUEsUUFDSCxLQUFLLGVBQWUsS0FBSyxTQUFTO0FBQUEsZ0JBR2pDO0FBQUEsUUFDRCxnQkFBZ0I7QUFBQTtBQUFBLE1BR2pCLEtBQUssV0FBVztBQUFBLElBQ2pCO0FBQUEsSUFDQSxPQUFPLEtBQUs7QUFBQTtBQUFBLEVBR0wsVUFBVSxHQUFHO0FBQUEsSUFDcEIsSUFBSSxDQUFDLEtBQUssVUFBVTtBQUFBLE1BQ25CLEtBQUssV0FBVztBQUFBLE1BRWhCLElBQUksQ0FBRSxLQUFhLGNBQWM7QUFBQSxRQUMvQixLQUFhLGVBQWUsSUFBSTtBQUFBLE1BQ2xDO0FBQUEsTUFFQSxNQUFNLFVBQVUsY0FBYztBQUFBLE1BQzVCLEtBQWEsYUFBYSxRQUFRLENBQUMsT0FBbUI7QUFBQSxRQUN2RCxJQUFJO0FBQUEsVUFDSCxJQUFJLFNBQVM7QUFBQSxZQUVaLGVBQWUsU0FBUyxNQUFNO0FBQUEsY0FDN0IsR0FBRztBQUFBLGFBQ0g7QUFBQSxVQUNGLEVBQU87QUFBQSxZQUNOLEdBQUc7QUFBQTtBQUFBLFVBRUgsT0FBTSxHQUFHO0FBQUEsVUFDVixRQUFRLE1BQU0sd0NBQXdDLENBQUM7QUFBQTtBQUFBLE9BRXhEO0FBQUEsSUFDRjtBQUFBO0FBQUEsTUFHRyxLQUFLLENBQUMsV0FBYztBQUFBLElBQ3ZCLE1BQU0sSUFBSSxNQUFNLGdDQUFnQztBQUFBO0FBRWxEO0FBS08sU0FBUyxNQUFTLENBQUMsU0FBdUI7QUFBQSxFQUNoRCxPQUFPLElBQUksT0FBTyxPQUFPO0FBQUE7OztBQ3pOMUIsU0FBd0Isa0JBQWtCLENBQUMsUUFBZ0IsVUFBb0IsVUFBK0I7QUFBQSxFQUM3RyxNQUFNLGdCQUFnRCxDQUFDO0FBQUEsRUFDdkQsTUFBTSxxQkFBcUIsSUFBSTtBQUFBLEVBQy9CLElBQUksVUFBVTtBQUFBLEVBQ2QsSUFBSSxTQUFTO0FBQUEsRUFFYixTQUFTLElBQUksR0FBRztBQUFBLElBQ2YsS0FBSyxTQUFTLEVBQUcsU0FBUyxjQUFjLFFBQVEsVUFBVSxHQUFHO0FBQUEsTUFDNUQsSUFBSTtBQUFBLFFBQUUsT0FBTyxjQUFjLFNBQW9CLGNBQU0sY0FBYyxTQUFTLElBQXFCLE1BQU0sTUFBTSxNQUFNLE1BQU0sSUFBSSxHQUFHLE1BQU07QUFBQSxRQUN0SSxPQUFNLEdBQUc7QUFBQSxRQUFFLFNBQVEsTUFBTSxDQUFDO0FBQUE7QUFBQSxJQUMzQjtBQUFBLElBQ0EsU0FBUztBQUFBO0FBQUEsRUFHVixTQUFTLGVBQWUsQ0FBQyxrQkFBaUM7QUFBQSxJQUd6RCxJQUFJLFlBQVk7QUFBQSxJQUNoQixNQUFNLHNCQUF1QixXQUFtQjtBQUFBLElBQ2hELElBQUksdUJBQXVCLG9CQUFvQixJQUFJLGdCQUFnQixHQUFHO0FBQUEsTUFDckUsWUFBWSxvQkFBb0IsSUFBSSxnQkFBZ0I7QUFBQSxJQUNyRDtBQUFBLElBSUEsTUFBTSxVQUFVLG1CQUFtQixJQUFJLFNBQVM7QUFBQSxJQUNoRCxJQUFJLFNBQVM7QUFBQSxNQUNaLElBQUk7QUFBQSxRQUNILE9BQU8sU0FBUyxjQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxJQUFJLEdBQUcsTUFBTTtBQUFBLFFBRXRFO0FBQUEsUUFDQyxPQUFNLEdBQUc7QUFBQSxRQUNWLFNBQVEsTUFBTSxDQUFDO0FBQUE7QUFBQSxJQUdqQjtBQUFBLElBSUEsTUFBTSxnQkFBaUIsV0FBbUI7QUFBQSxJQUMxQyxJQUFJLGlCQUFpQixjQUFjLElBQUksZ0JBQWdCLEdBQUc7QUFBQSxNQUt6RCxJQUFJLENBQUMsU0FBUztBQUFBLFFBQ2IsVUFBVTtBQUFBLFFBQ1YsU0FBUyxRQUFRLEdBQUc7QUFBQSxVQUNuQixVQUFVO0FBQUEsVUFDVixLQUFLO0FBQUEsU0FDTDtBQUFBLFFBQ0Q7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLElBR0EsTUFBTSxRQUFRLGNBQWMsUUFBUSxTQUFTO0FBQUEsSUFDN0MsSUFBSSxTQUFTLEtBQUssUUFBUSxNQUFNLEdBQUc7QUFBQSxNQUNsQyxNQUFNLGNBQWMsY0FBYyxRQUFRO0FBQUEsTUFDMUMsSUFBSTtBQUFBLFFBQ0gsT0FBTyxhQUFhLGNBQU0sV0FBVyxNQUFNLE1BQU0sTUFBTSxNQUFNLElBQUksR0FBRyxNQUFNO0FBQUEsUUFFMUU7QUFBQSxRQUNDLE9BQU0sR0FBRztBQUFBLFFBQ1YsU0FBUSxNQUFNLENBQUM7QUFBQTtBQUFBLElBR2pCO0FBQUEsSUFJQSxJQUFJLENBQUMsU0FBUztBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsU0FBUyxRQUFRLEdBQUc7QUFBQSxRQUNuQixVQUFVO0FBQUEsUUFDVixLQUFLO0FBQUEsT0FDTDtBQUFBLElBQ0Y7QUFBQTtBQUFBLEVBR0QsU0FBUyxNQUFNLENBQUMsV0FBMkI7QUFBQSxJQUUxQyxJQUFJLGNBQWMsV0FBVztBQUFBLE1BQzVCLGdCQUFnQixTQUFTO0FBQUEsTUFDekI7QUFBQSxJQUNEO0FBQUEsSUFHQSxJQUFJLENBQUMsU0FBUztBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsU0FBUyxRQUFRLEdBQUc7QUFBQSxRQUNuQixVQUFVO0FBQUEsUUFDVixLQUFLO0FBQUEsT0FDTDtBQUFBLElBQ0Y7QUFBQTtBQUFBLEVBR0QsT0FBTyxPQUFPO0FBQUEsRUFHWixPQUFlLFNBQVMsUUFBUSxDQUFDLFNBQXFCO0FBQUEsSUFDdkQsTUFBTSxhQUFhLG9CQUFvQixPQUFNO0FBQUEsSUFDN0MsSUFBSSxZQUFZO0FBQUEsTUFDZixXQUFXLFFBQVEsZUFBYTtBQUFBLFFBQy9CLGdCQUFnQixTQUFTO0FBQUEsT0FDekI7QUFBQSxJQUNGO0FBQUE7QUFBQSxFQUdELFNBQVMsS0FBSyxDQUFDLE1BQWUsV0FBaUM7QUFBQSxJQUM5RCxJQUFJLGFBQWEsUUFBUyxVQUFrQixRQUFRLFFBQVEsT0FBTyxjQUFjLFlBQVk7QUFBQSxNQUM1RixNQUFNLElBQUksVUFBVSwyQ0FBMkM7QUFBQSxJQUNoRTtBQUFBLElBRUEsTUFBTSxRQUFRLGNBQWMsUUFBUSxJQUFJO0FBQUEsSUFDeEMsSUFBSSxTQUFTLEdBQUc7QUFBQSxNQUNmLE1BQU0sZUFBZSxjQUFjLFFBQVE7QUFBQSxNQUMzQyxJQUFJLGNBQWM7QUFBQSxRQUNqQixtQkFBbUIsT0FBTyxZQUFZO0FBQUEsTUFDdkM7QUFBQSxNQUNBLGNBQWMsT0FBTyxPQUFPLENBQUM7QUFBQSxNQUM3QixJQUFJLFNBQVM7QUFBQSxRQUFRLFVBQVU7QUFBQSxNQUMvQixPQUFPLE1BQU0sQ0FBQyxDQUFDO0FBQUEsSUFDaEI7QUFBQSxJQUVBLElBQUksYUFBYSxNQUFNO0FBQUEsTUFDdEIsY0FBYyxLQUFLLE1BQU0sU0FBUztBQUFBLE1BQ2xDLG1CQUFtQixJQUFJLFdBQVcsSUFBSTtBQUFBLE1BQ3RDLE9BQU8sTUFBTSxjQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTSxJQUFJLEdBQUcsTUFBTTtBQUFBLElBQ3BFO0FBQUE7QUFBQSxFQUdELE9BQU8sRUFBQyxPQUFjLE9BQWM7QUFBQTs7O0FDeElyQyxJQUFNLHFCQUFxQjtBQUUzQixTQUF3QixzQkFBc0IsQ0FBQyxLQUFxQjtBQUFBLEVBQ25FLE9BQU8sT0FBTyxHQUFHLEVBQUUsUUFBUSxvQkFBb0Isa0JBQWtCO0FBQUE7OztBQy9CbEUsU0FBd0IsZ0JBQWdCLENBQUMsUUFBcUM7QUFBQSxFQUM3RSxJQUFJLE9BQU8sVUFBVSxTQUFTLEtBQUssTUFBTSxNQUFNO0FBQUEsSUFBbUIsT0FBTztBQUFBLEVBRXpFLE1BQU0sT0FBaUIsQ0FBQztBQUFBLEVBQ3hCLFNBQVMsV0FBVyxDQUFDLEtBQWEsT0FBWTtBQUFBLElBQzdDLElBQUksTUFBTSxRQUFRLEtBQUssR0FBRztBQUFBLE1BQ3pCLFNBQVMsSUFBSSxFQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxRQUN0QyxZQUFZLE1BQU0sTUFBTSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQUEsTUFDMUM7QUFBQSxJQUNELEVBQ0ssU0FBSSxPQUFPLFVBQVUsU0FBUyxLQUFLLEtBQUssTUFBTSxtQkFBbUI7QUFBQSxNQUNyRSxXQUFXLEtBQUssT0FBTztBQUFBLFFBQ3RCLFlBQVksTUFBTSxNQUFNLElBQUksS0FBSyxNQUFNLEVBQUU7QUFBQSxNQUMxQztBQUFBLElBQ0QsRUFDSztBQUFBLFdBQUssS0FBSyxtQkFBbUIsR0FBRyxLQUFLLFNBQVMsUUFBUSxVQUFVLEtBQUssTUFBTSxtQkFBbUIsS0FBSyxJQUFJLEdBQUc7QUFBQTtBQUFBLEVBR2hILFdBQVcsT0FBTyxRQUFRO0FBQUEsSUFDekIsWUFBWSxLQUFLLE9BQU8sSUFBSTtBQUFBLEVBQzdCO0FBQUEsRUFFQSxPQUFPLEtBQUssS0FBSyxHQUFHO0FBQUE7OztBQ25CckIsU0FBd0IsYUFBYSxDQUFDLFVBQWtCLFFBQXFDO0FBQUEsRUFDNUYsSUFBSyx3QkFBeUIsS0FBSyxRQUFRLEdBQUc7QUFBQSxJQUM3QyxNQUFNLElBQUksWUFBWSwwRUFBZ0Y7QUFBQSxFQUN2RztBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQUEsSUFBTSxPQUFPO0FBQUEsRUFDM0IsTUFBTSxhQUFhLFNBQVMsUUFBUSxHQUFHO0FBQUEsRUFDdkMsTUFBTSxZQUFZLFNBQVMsUUFBUSxHQUFHO0FBQUEsRUFDdEMsTUFBTSxXQUFXLFlBQVksSUFBSSxTQUFTLFNBQVM7QUFBQSxFQUNuRCxNQUFNLFVBQVUsYUFBYSxJQUFJLFdBQVc7QUFBQSxFQUM1QyxNQUFNLE9BQU8sU0FBUyxNQUFNLEdBQUcsT0FBTztBQUFBLEVBQ3RDLE1BQU0sUUFBNkIsQ0FBQztBQUFBLEVBRXBDLE9BQU8sT0FBTyxPQUFPLE1BQU07QUFBQSxFQUUzQixNQUFNLFdBQVcsS0FBSyxRQUFRLHlCQUF5QixRQUFRLENBQUMsR0FBRyxLQUFLLFVBQVU7QUFBQSxJQUNqRixPQUFPLE1BQU07QUFBQSxJQUViLElBQUksT0FBTyxRQUFRO0FBQUEsTUFBTSxPQUFPO0FBQUEsSUFFaEMsT0FBTyxXQUFXLE9BQU8sT0FBTyxtQkFBbUIsT0FBTyxPQUFPLElBQUksQ0FBQztBQUFBLEdBQ3RFO0FBQUEsRUFHRCxNQUFNLGdCQUFnQixTQUFTLFFBQVEsR0FBRztBQUFBLEVBQzFDLE1BQU0sZUFBZSxTQUFTLFFBQVEsR0FBRztBQUFBLEVBQ3pDLE1BQU0sY0FBYyxlQUFlLElBQUksU0FBUyxTQUFTO0FBQUEsRUFDekQsTUFBTSxhQUFhLGdCQUFnQixJQUFJLGNBQWM7QUFBQSxFQUNyRCxJQUFJLFNBQVMsU0FBUyxNQUFNLEdBQUcsVUFBVTtBQUFBLEVBRXpDLElBQUksY0FBYztBQUFBLElBQUcsVUFBVSxTQUFTLE1BQU0sWUFBWSxRQUFRO0FBQUEsRUFDbEUsSUFBSSxpQkFBaUI7QUFBQSxJQUFHLFdBQVcsYUFBYSxJQUFJLE1BQU0sT0FBTyxTQUFTLE1BQU0sZUFBZSxXQUFXO0FBQUEsRUFDMUcsTUFBTSxjQUFjLGlCQUFpQixLQUFLO0FBQUEsRUFDMUMsSUFBSTtBQUFBLElBQWEsV0FBVyxhQUFhLEtBQUssZ0JBQWdCLElBQUksTUFBTSxPQUFPO0FBQUEsRUFDL0UsSUFBSSxhQUFhO0FBQUEsSUFBRyxVQUFVLFNBQVMsTUFBTSxTQUFTO0FBQUEsRUFDdEQsSUFBSSxnQkFBZ0I7QUFBQSxJQUFHLFdBQVcsWUFBWSxJQUFJLEtBQUssT0FBTyxTQUFTLE1BQU0sWUFBWTtBQUFBLEVBQ3pGLE9BQU87QUFBQTs7O0FDcENSLFNBQXdCLGdCQUFnQixDQUFDLFFBQXdEO0FBQUEsRUFDaEcsSUFBSSxXQUFXLE1BQU0sVUFBVTtBQUFBLElBQU0sT0FBTyxDQUFDO0FBQUEsRUFDN0MsSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNO0FBQUEsSUFBSyxTQUFTLE9BQU8sTUFBTSxDQUFDO0FBQUEsRUFFckQsTUFBTSxVQUFVLE9BQU8sTUFBTSxHQUFHO0FBQUEsRUFDaEMsTUFBTSxXQUFtQyxDQUFDO0FBQUEsRUFDMUMsTUFBTSxPQUE0QixDQUFDO0FBQUEsRUFDbkMsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUFBLElBQ3hDLE1BQU0sUUFBUSxRQUFRLEdBQUcsTUFBTSxHQUFHO0FBQUEsSUFDbEMsTUFBTSxNQUFNLHVCQUF1QixNQUFNLEVBQUU7QUFBQSxJQUMzQyxJQUFJLFFBQWEsTUFBTSxXQUFXLElBQUksdUJBQXVCLE1BQU0sRUFBRSxJQUFJO0FBQUEsSUFFekUsSUFBSSxVQUFVO0FBQUEsTUFBUSxRQUFRO0FBQUEsSUFDekIsU0FBSSxVQUFVO0FBQUEsTUFBUyxRQUFRO0FBQUEsSUFFcEMsTUFBTSxTQUFTLElBQUksTUFBTSxVQUFVO0FBQUEsSUFDbkMsSUFBSSxTQUFjO0FBQUEsSUFDbEIsSUFBSSxJQUFJLFFBQVEsR0FBRyxJQUFJO0FBQUEsTUFBSSxPQUFPLElBQUk7QUFBQSxJQUN0QyxTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQUEsTUFDdkMsTUFBTSxRQUFRLE9BQU87QUFBQSxNQUNyQixNQUFNLFlBQVksT0FBTyxJQUFJO0FBQUEsTUFDN0IsTUFBTSxXQUFXLGFBQWEsTUFBTSxDQUFDLE1BQU0sU0FBUyxXQUFXLEVBQUUsQ0FBQztBQUFBLE1BQ2xFLElBQUk7QUFBQSxNQUNKLElBQUksVUFBVSxJQUFJO0FBQUEsUUFDakIsTUFBTSxPQUFNLE9BQU8sTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLO0FBQUEsUUFDcEMsSUFBSSxTQUFTLFNBQVEsTUFBTTtBQUFBLFVBQzFCLFNBQVMsUUFBTyxNQUFNLFFBQVEsTUFBTSxJQUFJLE9BQU8sU0FBUztBQUFBLFFBQ3pEO0FBQUEsUUFDQSxhQUFhLFNBQVM7QUFBQSxNQUN2QixFQUVLLFNBQUksVUFBVTtBQUFBLFFBQWE7QUFBQSxNQUMzQjtBQUFBLFFBQ0osYUFBYTtBQUFBO0FBQUEsTUFFZCxJQUFJLE1BQU0sT0FBTyxTQUFTO0FBQUEsUUFBRyxPQUFPLGNBQWM7QUFBQSxNQUM3QztBQUFBLFFBR0osTUFBTSxPQUFPLE9BQU8seUJBQXlCLFFBQVEsVUFBVTtBQUFBLFFBQy9ELElBQUksWUFBWSxRQUFRLE9BQU8sS0FBSyxRQUFRO0FBQUEsUUFDNUMsSUFBSSxhQUFhO0FBQUEsVUFBTSxPQUFPLGNBQWMsWUFBWSxXQUFXLENBQUMsSUFBSSxDQUFDO0FBQUEsUUFDekUsU0FBUztBQUFBO0FBQUEsSUFFWDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLE9BQU87QUFBQTs7O0FDN0NSLFNBQXdCLGFBQWEsQ0FBQyxLQUEwRDtBQUFBLEVBQy9GLE1BQU0sYUFBYSxJQUFJLFFBQVEsR0FBRztBQUFBLEVBQ2xDLE1BQU0sWUFBWSxJQUFJLFFBQVEsR0FBRztBQUFBLEVBQ2pDLE1BQU0sV0FBVyxZQUFZLElBQUksSUFBSSxTQUFTO0FBQUEsRUFDOUMsTUFBTSxVQUFVLGFBQWEsSUFBSSxXQUFXO0FBQUEsRUFDNUMsSUFBSSxPQUFPLElBQUksTUFBTSxHQUFHLE9BQU8sRUFBRSxRQUFRLFdBQVcsR0FBRztBQUFBLEVBRXZELElBQUksQ0FBQztBQUFBLElBQU0sT0FBTztBQUFBLEVBQ2I7QUFBQSxJQUNKLElBQUksS0FBSyxPQUFPO0FBQUEsTUFBSyxPQUFPLE1BQU07QUFBQTtBQUFBLEVBRW5DLE9BQU87QUFBQSxJQUNOO0FBQUEsSUFDQSxRQUFRLGFBQWEsSUFDbEIsQ0FBQyxJQUNELGlCQUFpQixJQUFJLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQztBQUFBLEVBQ3hEO0FBQUE7OztBQ1JELFNBQXdCLGVBQWUsQ0FBQyxVQUFvQztBQUFBLEVBQzNFLE1BQU0sZUFBZSxjQUFjLFFBQVE7QUFBQSxFQUMzQyxNQUFNLGVBQWUsT0FBTyxLQUFLLGFBQWEsTUFBTTtBQUFBLEVBQ3BELE1BQU0sT0FBdUMsQ0FBQztBQUFBLEVBQzlDLE1BQU0sU0FBUyxJQUFJLE9BQU8sTUFBTSxhQUFhLEtBQUssUUFLakQsc0RBQ0EsUUFBUSxDQUFDLEdBQUcsS0FBSyxPQUFPO0FBQUEsSUFDdkIsSUFBSSxPQUFPO0FBQUEsTUFBTSxPQUFPLE9BQU87QUFBQSxJQUMvQixLQUFLLEtBQUssRUFBQyxHQUFHLEtBQUssR0FBRyxVQUFVLE1BQUssQ0FBQztBQUFBLElBQ3RDLElBQUksVUFBVTtBQUFBLE1BQU8sT0FBTztBQUFBLElBQzVCLElBQUksVUFBVTtBQUFBLE1BQUssT0FBTztBQUFBLElBQzFCLE9BQU8sYUFBYSxTQUFTO0FBQUEsR0FFL0IsSUFBSSxPQUFPO0FBQUEsRUFDWCxPQUFPLFFBQVEsQ0FBQyxNQUE0RDtBQUFBLElBRzNFLFNBQVMsSUFBSSxFQUFHLElBQUksYUFBYSxRQUFRLEtBQUs7QUFBQSxNQUM3QyxJQUFJLGFBQWEsT0FBTyxhQUFhLFFBQVEsS0FBSyxPQUFPLGFBQWE7QUFBQSxRQUFLLE9BQU87QUFBQSxJQUNuRjtBQUFBLElBRUEsSUFBSSxDQUFDLEtBQUs7QUFBQSxNQUFRLE9BQU8sT0FBTyxLQUFLLEtBQUssSUFBSTtBQUFBLElBQzlDLE1BQU0sU0FBUyxPQUFPLEtBQUssS0FBSyxJQUFJO0FBQUEsSUFDcEMsSUFBSSxVQUFVO0FBQUEsTUFBTSxPQUFPO0FBQUEsSUFDM0IsU0FBUyxJQUFJLEVBQUcsSUFBSSxLQUFLLFFBQVEsS0FBSztBQUFBLE1BQ3JDLEtBQUssT0FBTyxLQUFLLEdBQUcsS0FBSyxLQUFLLEdBQUcsSUFBSSxPQUFPLElBQUksS0FBSyxtQkFBbUIsT0FBTyxJQUFJLEVBQUU7QUFBQSxJQUN0RjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUE7OztBQ2pCVCxJQUFNLFFBQVE7QUFFZCxTQUF3QixNQUFNLENBQUMsT0FBNEIsUUFBd0M7QUFBQSxFQUNsRyxNQUFNLFNBQThCLENBQUM7QUFBQSxFQUVyQyxJQUFJLFVBQVUsTUFBTTtBQUFBLElBQ25CLFdBQVcsT0FBTyxPQUFPO0FBQUEsTUFDeEIsSUFBSSxlQUFPLEtBQUssT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRyxLQUFLLE9BQU8sUUFBUSxHQUFHLElBQUksR0FBRztBQUFBLFFBQzNFLE9BQU8sT0FBTyxNQUFNO0FBQUEsTUFDckI7QUFBQSxJQUNEO0FBQUEsRUFDRCxFQUFPO0FBQUEsSUFDTixXQUFXLE9BQU8sT0FBTztBQUFBLE1BQ3hCLElBQUksZUFBTyxLQUFLLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsR0FBRztBQUFBLFFBQ2hELE9BQU8sT0FBTyxNQUFNO0FBQUEsTUFDckI7QUFBQSxJQUNEO0FBQUE7QUFBQSxFQUdELE9BQU87QUFBQTs7O0FDcENELFNBQVMsYUFBYSxHQUFXO0FBQUEsRUFFdkMsSUFBSSxPQUFPLFdBQVcsZUFBZSxPQUFPLFVBQVU7QUFBQSxJQUNyRCxPQUFPLE9BQU8sU0FBUztBQUFBLEVBQ3hCO0FBQUEsRUFHQSxJQUFJLE9BQU8sZUFBZSxlQUFnQixXQUFtQixhQUFhO0FBQUEsSUFDekUsT0FBUSxXQUFtQjtBQUFBLEVBQzVCO0FBQUEsRUFHQSxPQUFPO0FBQUE7QUFNUixTQUFTLFFBQVEsQ0FBQyxLQUFrQjtBQUFBLEVBQ25DLElBQUk7QUFBQSxJQUNILE9BQU8sSUFBSSxJQUFJLEdBQUc7QUFBQSxJQUNqQixNQUFNO0FBQUEsSUFFUCxPQUFPLElBQUksSUFBSSxLQUFLLGtCQUFrQjtBQUFBO0FBQUE7QUFPakMsU0FBUyxXQUFXLEdBQVc7QUFBQSxFQUVyQyxJQUFJLE9BQU8sV0FBVyxlQUFlLE9BQU8sVUFBVTtBQUFBLElBQ3JELE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFBQSxFQUNwQztBQUFBLEVBR0EsTUFBTSxNQUFNLGNBQWM7QUFBQSxFQUMxQixJQUFJLENBQUM7QUFBQSxJQUFLLE9BQU87QUFBQSxFQUVqQixNQUFNLFNBQVMsU0FBUyxHQUFHO0FBQUEsRUFDM0IsT0FBTyxPQUFPLFlBQVk7QUFBQTtBQU1wQixTQUFTLFNBQVMsR0FBVztBQUFBLEVBRW5DLElBQUksT0FBTyxXQUFXLGVBQWUsT0FBTyxVQUFVO0FBQUEsSUFDckQsT0FBTyxPQUFPLFNBQVMsVUFBVTtBQUFBLEVBQ2xDO0FBQUEsRUFHQSxNQUFNLE1BQU0sY0FBYztBQUFBLEVBQzFCLElBQUksQ0FBQztBQUFBLElBQUssT0FBTztBQUFBLEVBRWpCLE1BQU0sU0FBUyxTQUFTLEdBQUc7QUFBQSxFQUMzQixPQUFPLE9BQU8sVUFBVTtBQUFBO0FBTWxCLFNBQVMsT0FBTyxHQUFXO0FBQUEsRUFFakMsSUFBSSxPQUFPLFdBQVcsZUFBZSxPQUFPLFVBQVU7QUFBQSxJQUNyRCxPQUFPLE9BQU8sU0FBUyxRQUFRO0FBQUEsRUFDaEM7QUFBQSxFQUdBLE1BQU0sTUFBTSxjQUFjO0FBQUEsRUFDMUIsSUFBSSxDQUFDO0FBQUEsSUFBSyxPQUFPO0FBQUEsRUFFakIsTUFBTSxTQUFTLFNBQVMsR0FBRztBQUFBLEVBQzNCLE9BQU8sT0FBTyxRQUFRO0FBQUE7OztBQzVFdkIsSUFBTSxZQUFZLE9BQU8sV0FBVyxlQUFlLE9BQU8sYUFBYTtBQUd2RSxJQUFNLFNBQVM7QUFBQSxFQUNkLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxFQUNSLEtBQUs7QUFBQSxFQUdMLE9BQU87QUFBQSxFQUNQLEtBQUs7QUFBQSxFQUNMLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxFQUNSLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxFQUNULE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUdQLFNBQVM7QUFBQSxFQUNULE9BQU87QUFBQSxFQUNQLFNBQVM7QUFBQSxFQUNULFVBQVU7QUFBQSxFQUNWLFFBQVE7QUFBQSxFQUNSLFdBQVc7QUFBQSxFQUNYLFFBQVE7QUFBQSxFQUNSLFNBQVM7QUFDVjtBQUdBLElBQU0sZUFBZSxDQUFDLGFBQWEsT0FBTyxZQUFZLGVBQWUsUUFBUSxPQUFPLFFBQVEsSUFBSSxhQUFhLE9BQU8sUUFBUSxJQUFJLGFBQWE7QUFFN0ksU0FBUyxRQUFRLENBQUMsTUFBYyxPQUF1QjtBQUFBLEVBQ3RELE9BQU8sZUFBZSxHQUFHLFFBQVEsT0FBTyxPQUFPLFVBQVU7QUFBQTtBQUcxRCxTQUFTLFlBQVksR0FBVztBQUFBLEVBQy9CLE1BQU0sTUFBTSxJQUFJO0FBQUEsRUFDaEIsTUFBTSxRQUFRLE9BQU8sSUFBSSxTQUFTLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUFBLEVBQ3BELE1BQU0sVUFBVSxPQUFPLElBQUksV0FBVyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFBQSxFQUN4RCxNQUFNLFVBQVUsT0FBTyxJQUFJLFdBQVcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQUEsRUFDeEQsTUFBTSxLQUFLLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQUEsRUFDeEQsT0FBTyxHQUFHLFNBQVMsV0FBVyxXQUFXO0FBQUE7QUFHMUMsU0FBUyxXQUFXLENBQUMsT0FBb0Q7QUFBQSxFQUN4RSxNQUFNLFdBQVc7QUFBQSxJQUNoQixNQUFNLFNBQVMsUUFBUSxPQUFPLFNBQVMsT0FBTyxJQUFJO0FBQUEsSUFDbEQsT0FBTyxTQUFTLFNBQVMsT0FBTyxTQUFTLE9BQU8sSUFBSTtBQUFBLElBQ3BELE1BQU0sU0FBUyxRQUFRLE9BQU8sU0FBUyxPQUFPLE1BQU07QUFBQSxJQUNwRCxPQUFPLFNBQVMsU0FBUyxPQUFPLFNBQVMsT0FBTyxHQUFHO0FBQUEsRUFDcEQ7QUFBQSxFQUNBLE9BQU8sU0FBUztBQUFBO0FBQUE7QUFZakIsTUFBTSxPQUFPO0FBQUEsRUFFSixTQUFpQjtBQUFBLEVBS3pCLFNBQVMsQ0FBQyxRQUFzQjtBQUFBLElBQy9CLEtBQUssU0FBUztBQUFBO0FBQUEsRUFHUCxhQUFhLENBQUMsT0FBNEMsU0FBaUIsU0FBOEI7QUFBQSxJQUNoSCxNQUFNLFlBQVksU0FBUyxhQUFhLEdBQUcsT0FBTyxNQUFNLE9BQU8sS0FBSztBQUFBLElBQ3BFLE1BQU0sV0FBVyxZQUFZLEtBQUs7QUFBQSxJQUdsQyxNQUFNLFlBQVksU0FBUyxLQUFLLFFBQVEsS0FBSyxXQUFXLFVBQVUsT0FBTyxTQUFTLE9BQU8sVUFBVSxPQUFPLFNBQVMsT0FBTyxJQUFJO0FBQUEsSUFHOUgsSUFBSSxpQkFBaUI7QUFBQSxJQUNyQixJQUFJLFNBQVMsUUFBUTtBQUFBLE1BQ3BCLGlCQUFpQixJQUFJLFFBQVEsV0FBVztBQUFBLElBQ3pDO0FBQUEsSUFFQSxJQUFJLGFBQWE7QUFBQSxJQUNqQixJQUFJLFNBQVM7QUFBQSxNQUNaLE1BQU0sZUFBeUIsQ0FBQztBQUFBLE1BQ2hDLElBQUksUUFBUSxRQUFRO0FBQUEsUUFDbkIsYUFBYSxLQUFLLFNBQVMsUUFBUSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQUEsTUFDeEQ7QUFBQSxNQUNBLElBQUksUUFBUSxVQUFVO0FBQUEsUUFDckIsYUFBYSxLQUFLLFNBQVMsUUFBUSxVQUFVLE9BQU8sS0FBSyxDQUFDO0FBQUEsTUFDM0Q7QUFBQSxNQUNBLElBQUksUUFBUSxPQUFPO0FBQUEsUUFDbEIsYUFBYSxLQUFLLFNBQVMsU0FBUyxRQUFRLFNBQVMsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUNsRTtBQUFBLE1BQ0EsSUFBSSxRQUFRLFdBQVc7QUFBQSxRQUN0QixhQUFhLEtBQUssU0FBUyxXQUFXLFFBQVEsVUFBVSxNQUFNLEdBQUcsQ0FBQyxRQUFRLE9BQU8sTUFBTSxPQUFPLEtBQUssQ0FBQztBQUFBLE1BQ3JHO0FBQUEsTUFHQSxZQUFZLEtBQUssVUFBVSxPQUFPLFFBQVEsT0FBTyxHQUFHO0FBQUEsUUFDbkQsSUFBSSxDQUFDLENBQUMsVUFBVSxZQUFZLFNBQVMsYUFBYSxRQUFRLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFBQSxVQUMxRSxhQUFhLEtBQUssU0FBUyxHQUFHLE9BQU8sU0FBUyxPQUFPLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFBQSxRQUN6RTtBQUFBLE1BQ0Q7QUFBQSxNQUVBLElBQUksYUFBYSxTQUFTLEdBQUc7QUFBQSxRQUM1QixhQUFhLE1BQU0sYUFBYSxLQUFLLEdBQUc7QUFBQSxNQUN6QztBQUFBLElBQ0Q7QUFBQSxJQUVBLE9BQU8sR0FBRyxhQUFhLGFBQWEsV0FBVyxjQUFjO0FBQUE7QUFBQSxFQUd0RCx1QkFBdUIsQ0FBQyxTQUFnQztBQUFBLElBQy9ELElBQUksQ0FBQztBQUFBLE1BQVMsT0FBTyxDQUFDO0FBQUEsSUFFdEIsTUFBTSxRQUFrQixDQUFDO0FBQUEsSUFDekIsSUFBSSxRQUFRO0FBQUEsTUFBUSxNQUFNLEtBQUssV0FBVyxRQUFRLFFBQVE7QUFBQSxJQUMxRCxJQUFJLFFBQVE7QUFBQSxNQUFVLE1BQU0sS0FBSyxTQUFTLFFBQVEsVUFBVTtBQUFBLElBQzVELElBQUksUUFBUTtBQUFBLE1BQU8sTUFBTSxLQUFLLFVBQVUsUUFBUSxPQUFPO0FBQUEsSUFDdkQsSUFBSSxRQUFRO0FBQUEsTUFBVyxNQUFNLEtBQUssWUFBWSxRQUFRLFVBQVUsTUFBTSxHQUFHLENBQUMsTUFBTTtBQUFBLElBR2hGLFlBQVksS0FBSyxVQUFVLE9BQU8sUUFBUSxPQUFPLEdBQUc7QUFBQSxNQUNuRCxJQUFJLENBQUMsQ0FBQyxVQUFVLFlBQVksU0FBUyxhQUFhLFFBQVEsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUFBLFFBQzFFLE1BQU0sS0FBSyxHQUFHLFFBQVEsT0FBTztBQUFBLE1BQzlCO0FBQUEsSUFDRDtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsRUFHQSxnQkFBZ0IsQ0FBQyxTQUE4QjtBQUFBLElBRXRELE9BQU8sS0FBSztBQUFBO0FBQUEsRUFHTCxpQkFBaUIsQ0FBQyxTQUFpQixTQUE4QjtBQUFBLElBRXhFLElBQUksU0FBUyxRQUFRO0FBQUEsTUFDcEIsT0FBTyxJQUFJLFFBQVEsV0FBVztBQUFBLElBQy9CO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUdSLElBQUksQ0FBQyxTQUFpQixTQUE0QjtBQUFBLElBQ2pELElBQUksV0FBVztBQUFBLE1BQ2QsTUFBTSxlQUFlLEtBQUssd0JBQXdCLE9BQU87QUFBQSxNQUN6RCxNQUFNLGdCQUFnQixLQUFLLGlCQUFpQixPQUFPO0FBQUEsTUFDbkQsTUFBTSxpQkFBaUIsS0FBSyxrQkFBa0IsU0FBUyxPQUFPO0FBQUEsTUFFOUQsTUFBTSxjQUFjLGtCQUFrQixVQUFVLHNDQUFzQztBQUFBLE1BQ3RGLE1BQU0sYUFBYTtBQUFBLE1BRW5CLElBQUksYUFBYSxTQUFTLEdBQUc7QUFBQSxRQUM1QixRQUFRLE1BQU0sS0FBSywwQkFBMEIsa0JBQWtCLGFBQWEsWUFBWSxnQkFBZ0I7QUFBQSxRQUN4RyxhQUFhLFFBQVEsVUFBUSxRQUFRLElBQUksS0FBSyxNQUFNLENBQUM7QUFBQSxRQUNyRCxRQUFRLFNBQVM7QUFBQSxNQUNsQixFQUFPO0FBQUEsUUFDTixRQUFRLElBQUksS0FBSywwQkFBMEIsa0JBQWtCLGFBQWEsWUFBWSxnQkFBZ0I7QUFBQTtBQUFBLElBRXhHLEVBQU87QUFBQSxNQUNOLFFBQVEsSUFBSSxLQUFLLGNBQWMsUUFBUSxTQUFTLE9BQU8sQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUkxRCxLQUFLLENBQUMsU0FBaUIsU0FBNEI7QUFBQSxJQUVsRCxNQUFNLFlBQVksV0FBVyxnQkFBaUIsYUFBYSxPQUFPLFlBQVksZUFBZSxRQUFRLEtBQUssYUFBYTtBQUFBLElBRXZILElBQUksQ0FBQztBQUFBLE1BQVc7QUFBQSxJQUVoQixJQUFJLFdBQVc7QUFBQSxNQUNkLE1BQU0sZUFBZSxLQUFLLHdCQUF3QixPQUFPO0FBQUEsTUFDekQsTUFBTSxnQkFBZ0IsS0FBSyxpQkFBaUIsT0FBTztBQUFBLE1BQ25ELE1BQU0saUJBQWlCLEtBQUssa0JBQWtCLFNBQVMsT0FBTztBQUFBLE1BQzlELE1BQU0sY0FBYyxrQkFBa0IsVUFBVSxzQ0FBc0M7QUFBQSxNQUN0RixNQUFNLGFBQWE7QUFBQSxNQUVuQixJQUFJLGFBQWEsU0FBUyxHQUFHO0FBQUEsUUFDNUIsUUFBUSxNQUFNLEtBQUssMkJBQTJCLGtCQUFrQixhQUFhLFlBQVksZ0JBQWdCO0FBQUEsUUFDekcsYUFBYSxRQUFRLFVBQVEsUUFBUSxJQUFJLEtBQUssTUFBTSxDQUFDO0FBQUEsUUFDckQsUUFBUSxTQUFTO0FBQUEsTUFDbEIsRUFBTztBQUFBLFFBQ04sUUFBUSxJQUFJLEtBQUssMkJBQTJCLGtCQUFrQixhQUFhLFlBQVksZ0JBQWdCO0FBQUE7QUFBQSxJQUV6RyxFQUFPO0FBQUEsTUFDTixRQUFRLElBQUksS0FBSyxjQUFjLFNBQVMsU0FBUyxPQUFPLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFJM0QsSUFBSSxDQUFDLFNBQWlCLFNBQTRCO0FBQUEsSUFDakQsSUFBSSxXQUFXO0FBQUEsTUFDZCxNQUFNLGVBQWUsS0FBSyx3QkFBd0IsT0FBTztBQUFBLE1BQ3pELE1BQU0sZ0JBQWdCLEtBQUssaUJBQWlCLE9BQU87QUFBQSxNQUNuRCxNQUFNLGlCQUFpQixLQUFLLGtCQUFrQixTQUFTLE9BQU87QUFBQSxNQUM5RCxNQUFNLGNBQWMsa0JBQWtCLFVBQVUsc0NBQXNDO0FBQUEsTUFDdEYsTUFBTSxhQUFhO0FBQUEsTUFFbkIsSUFBSSxhQUFhLFNBQVMsR0FBRztBQUFBLFFBQzVCLFFBQVEsTUFBTSxLQUFLLDBCQUEwQixrQkFBa0IsYUFBYSxZQUFZLGdCQUFnQjtBQUFBLFFBQ3hHLGFBQWEsUUFBUSxVQUFRLFFBQVEsS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUFBLFFBQ3RELFFBQVEsU0FBUztBQUFBLE1BQ2xCLEVBQU87QUFBQSxRQUNOLFFBQVEsS0FBSyxLQUFLLDBCQUEwQixrQkFBa0IsYUFBYSxZQUFZLGdCQUFnQjtBQUFBO0FBQUEsSUFFekcsRUFBTztBQUFBLE1BQ04sUUFBUSxLQUFLLEtBQUssY0FBYyxRQUFRLFNBQVMsT0FBTyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBSTNELEtBQUssQ0FBQyxTQUFpQixPQUF5QixTQUE0QjtBQUFBLElBQzNFLE1BQU0sZUFBZSxpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQUEsSUFDMUUsTUFBTSxjQUFjLFFBQVEsR0FBRyxZQUFZLGlCQUFpQjtBQUFBLElBQzVELE1BQU0saUJBQWlCLEtBQUssa0JBQWtCLGFBQWEsT0FBTztBQUFBLElBRWxFLElBQUksV0FBVztBQUFBLE1BQ2QsTUFBTSxlQUFlLEtBQUssd0JBQXdCLE9BQU87QUFBQSxNQUN6RCxNQUFNLGdCQUFnQixLQUFLLGlCQUFpQixPQUFPO0FBQUEsTUFDbkQsTUFBTSxjQUFjLGtCQUFrQixVQUFVLHNDQUFzQztBQUFBLE1BQ3RGLE1BQU0sYUFBYTtBQUFBLE1BRW5CLElBQUksYUFBYSxTQUFTLEtBQUssT0FBTztBQUFBLFFBQ3JDLFFBQVEsTUFBTSxLQUFLLDJCQUEyQixrQkFBa0IsYUFBYSxZQUFZLGdCQUFnQjtBQUFBLFFBQ3pHLElBQUksYUFBYSxTQUFTLEdBQUc7QUFBQSxVQUM1QixhQUFhLFFBQVEsVUFBUSxRQUFRLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFBQSxRQUN4RDtBQUFBLFFBQ0EsSUFBSSxpQkFBaUIsU0FBUyxNQUFNLE9BQU87QUFBQSxVQUMxQyxRQUFRLE1BQU0sZ0JBQWdCLE1BQU0sS0FBSztBQUFBLFFBQzFDO0FBQUEsUUFDQSxRQUFRLFNBQVM7QUFBQSxNQUNsQixFQUFPO0FBQUEsUUFDTixRQUFRLE1BQU0sS0FBSywyQkFBMkIsa0JBQWtCLGFBQWEsWUFBWSxnQkFBZ0I7QUFBQTtBQUFBLElBRTNHLEVBQU87QUFBQSxNQUNOLFFBQVEsTUFBTSxLQUFLLGNBQWMsU0FBUyxhQUFhLE9BQU8sQ0FBQztBQUFBLE1BQy9ELElBQUksaUJBQWlCLFNBQVMsTUFBTSxPQUFPO0FBQUEsUUFDMUMsTUFBTSxhQUFhLFNBQVMsTUFBTSxPQUFPLE9BQU8sTUFBTSxPQUFPLEdBQUc7QUFBQSxRQUNoRSxRQUFRLE1BQU0sVUFBVTtBQUFBLE1BQ3pCO0FBQUE7QUFBQTtBQUdIO0FBR08sSUFBTSxTQUFTLElBQUk7OztBQ3pQMUIsSUFBTSxVQUFTLElBQUk7QUFDbkIsUUFBTyxVQUFVLE9BQU87OztBQ2tEeEIsU0FBd0IsTUFBTSxDQUFDLFNBQWMsYUFBMEI7QUFBQSxFQUN0RSxJQUFJLElBQUksUUFBUSxRQUFRO0FBQUEsRUFFeEIsSUFBSSxZQUFZO0FBQUEsRUFFaEIsSUFBSSxRQUFRO0FBQUEsRUFDWixJQUFJLGtCQUFrQjtBQUFBLEVBRXRCLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUVKLElBQUksa0JBQXdDO0FBQUEsRUFDNUMsSUFBSSxZQUFvQztBQUFBLEVBQ3hDLElBQUksUUFBNkIsQ0FBQztBQUFBLEVBQ2xDLElBQUk7QUFBQSxFQUNKLElBQUksYUFBMkM7QUFBQSxFQUUvQyxNQUFNLGFBQTRCO0FBQUEsSUFDakMsVUFBVSxRQUFRLEdBQUc7QUFBQSxNQUNwQixRQUFRLGtCQUFrQjtBQUFBLE1BQzFCLFFBQVEsb0JBQW9CLFlBQVksV0FBVyxLQUFLO0FBQUE7QUFBQSxJQUV6RCxNQUFNLFFBQVEsR0FBRztBQUFBLE1BT2hCLE1BQU0sYUFBYSxLQUFJLE9BQU8sV0FBVyxlQUFlLE1BQU0sV0FBVyxLQUFLLGVBQWUsTUFBTSxJQUFHO0FBQUEsTUFDdEcsTUFBTSxRQUFRLGNBQU0sV0FBVyxlQUFlLE1BQU0sS0FBSyxZQUFZLE1BQU0sTUFBTSxJQUFJO0FBQUEsTUFDckYsSUFBSTtBQUFBLFFBQWlCLE9BQU8sZ0JBQWdCLE9BQVEsS0FBWTtBQUFBLE1BRWhFLE9BQU8sQ0FBQyxLQUFLO0FBQUE7QUFBQSxFQUVmO0FBQUEsRUFFQSxNQUFNLE9BQU8sTUFBTSxPQUFPLENBQUM7QUFBQSxFQUczQixNQUFNLFdBQVcsTUFBTSxXQUFXLE9BQU8sVUFBVTtBQUFBLEVBR25ELE1BQU0sV0FBVyxRQUFRLENBQUMsTUFBYztBQUFBLElBQ3ZDLE9BQU8sR0FBRSxXQUFXLEtBQUk7QUFBQTtBQUFBLEVBTXpCLFNBQVMsVUFBVSxDQUFDLE9BQXFDO0FBQUEsSUFDeEQsSUFBSSxTQUFTLFFBQVEsT0FBTyxVQUFVO0FBQUEsTUFBVSxPQUFPO0FBQUEsSUFFdkQsSUFBSSxZQUFZO0FBQUEsTUFBTyxPQUFPO0FBQUEsSUFJOUIsTUFBTSxhQUFhLE9BQU8sc0JBQXNCLEtBQUs7QUFBQSxJQUNyRCxJQUFJLFdBQVcsU0FBUyxHQUFHO0FBQUEsTUFHMUIsV0FBVyxPQUFPLFlBQVk7QUFBQSxRQUM3QixNQUFNLE9BQU8sSUFBSSxlQUFlO0FBQUEsUUFDaEMsSUFBSSxLQUFLLFNBQVMsVUFBVSxLQUFLLFNBQVMsWUFBWTtBQUFBLFVBQ3JELE1BQU0sT0FBTyxNQUFNO0FBQUEsVUFDbkIsSUFBSSxPQUFPLFNBQVMsWUFBWSxLQUFLLFdBQVcsR0FBRyxHQUFHO0FBQUEsWUFDckQsT0FBTztBQUFBLFVBQ1I7QUFBQSxRQUNEO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLEVBSVIsU0FBUyxlQUFlLENBQUMsYUFBcUM7QUFBQSxJQUU3RCxJQUFJLFlBQVksYUFBYTtBQUFBLE1BQzVCLE9BQU8sWUFBWTtBQUFBLElBQ3BCO0FBQUEsSUFFQSxNQUFNLGFBQWEsT0FBTyxzQkFBc0IsV0FBVztBQUFBLElBQzNELFdBQVcsT0FBTyxZQUFZO0FBQUEsTUFDN0IsTUFBTSxPQUFPLFlBQVk7QUFBQSxNQUN6QixJQUFJLE9BQU8sU0FBUyxZQUFZLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFBQSxRQUNyRCxPQUFPO0FBQUEsTUFDUjtBQUFBLElBQ0Q7QUFBQSxJQUNBLE1BQU0sSUFBSSxNQUFNLGlEQUFpRDtBQUFBO0FBQUEsRUFHbEUsU0FBUyxZQUFZLEdBQUc7QUFBQSxJQUN2QixZQUFZO0FBQUEsSUFJWixNQUFNLE9BQU8sUUFBUTtBQUFBLElBQ3JCLElBQUksU0FBUztBQUFBLElBQ2IsSUFBSSxNQUFNLE9BQU8sT0FBTyxLQUFLO0FBQUEsTUFDNUIsTUFBTSxTQUFTLFVBQVU7QUFBQSxNQUN6QixTQUFTLFNBQVM7QUFBQSxNQUNsQixJQUFJLE1BQU0sT0FBTyxPQUFPLEtBQUs7QUFBQSxRQUM1QixNQUFNLFdBQVcsWUFBWTtBQUFBLFFBQzdCLFNBQVMsV0FBVztBQUFBLFFBQ3BCLElBQUksT0FBTyxPQUFPO0FBQUEsVUFBSyxTQUFTLE1BQU07QUFBQSxNQUN2QztBQUFBLElBQ0Q7QUFBQSxJQUNBLE1BQU0sT0FBTyx1QkFBdUIsTUFBTSxFQUFFLE1BQU0sTUFBTSxPQUFPLE1BQU07QUFBQSxJQUNyRSxNQUFNLE9BQU8sY0FBYyxJQUFJO0FBQUEsSUFFL0IsT0FBTyxPQUFPLEtBQUssUUFBUSxRQUFRLFFBQVEsU0FBUyxDQUFDLENBQUM7QUFBQSxJQUV0RCxTQUFTLE1BQU0sQ0FBQyxHQUFRO0FBQUEsTUFDdkIsUUFBUSxNQUFNLENBQUM7QUFBQSxNQUNmLE1BQU0sSUFBSSxlQUFnQixNQUFNLEVBQUMsU0FBUyxLQUFJLENBQUM7QUFBQTtBQUFBLElBR2hELEtBQUssQ0FBQztBQUFBLElBQ04sU0FBUyxJQUFJLENBQUMsR0FBVztBQUFBLE1BQ3hCLElBQUksQ0FBQztBQUFBLFFBQVU7QUFBQSxNQUNmLE1BQU8sSUFBSSxTQUFTLFFBQVEsS0FBSztBQUFBLFFBQ2hDLElBQUksU0FBUyxHQUFHLE1BQU0sSUFBSSxHQUFHO0FBQUEsVUFDNUIsSUFBSSxVQUFVLFNBQVMsR0FBRztBQUFBLFVBQzFCLE1BQU0sZUFBZSxTQUFTLEdBQUc7QUFBQSxVQUNqQyxNQUFNLFlBQVk7QUFBQSxVQUdsQixNQUFNLHFCQUFxQixXQUFXLE9BQU8sWUFBWSxZQUFZLFFBQVEsV0FBVyxRQUFRLFVBQVUsQ0FBQyxRQUFRLFFBQVEsT0FBTyxZQUFZLGFBQWEsVUFBVTtBQUFBLFVBRXJLLE1BQU0sU0FBUyxhQUFhLFFBQVEsQ0FBQyxNQUFXO0FBQUEsWUFDL0MsSUFBSSxXQUFXO0FBQUEsY0FBWTtBQUFBLFlBQzNCLElBQUksU0FBUztBQUFBLGNBQU0sT0FBTyxLQUFLLElBQUksQ0FBQztBQUFBLFlBRXBDLElBQUksV0FBVyxJQUFJLEdBQUc7QUFBQSxjQUVyQixNQUFNLGVBQWUsS0FBSztBQUFBLGNBRTFCLE1BQU0sSUFBSSxjQUFjLElBQUk7QUFBQSxjQUU1QjtBQUFBLFlBQ0Q7QUFBQSxZQUVBLElBQUksb0JBQW9CO0FBQUEsY0FDdkIsa0JBQWtCO0FBQUEsY0FDbEIsWUFBWSxRQUFRLFNBQVMsT0FBTyxLQUFLLFNBQVMsY0FBYyxPQUFPLFNBQVMsY0FBYyxPQUFPO0FBQUEsWUFDdEcsRUFFSyxTQUFJLFFBQVEsT0FBTyxTQUFTLFlBQVksS0FBSyxVQUFVLENBQUMsS0FBSyxRQUFRLE9BQU8sU0FBUyxZQUFZO0FBQUEsY0FDckcsa0JBQWtCO0FBQUEsY0FDbEIsWUFBWTtBQUFBLFlBQ2IsRUFBTztBQUFBLGNBQ04sa0JBQWtCO0FBQUEsY0FDbEIsWUFBWSxRQUFRLFNBQVMsT0FBTyxLQUFLLFNBQVMsY0FBYyxPQUFPLFNBQVMsY0FBYyxPQUFPO0FBQUE7QUFBQSxZQUV0RyxRQUFRLEtBQUs7QUFBQSxZQUNiLGNBQWM7QUFBQSxZQUNkLGFBQWE7QUFBQSxZQUNiLElBQUk7QUFBQSxjQUFpQixZQUFZLE9BQU87QUFBQSxZQUNuQztBQUFBLGNBQ0osa0JBQWtCO0FBQUEsY0FDbEIsWUFBWSxNQUFNLEtBQU0sVUFBVTtBQUFBO0FBQUE7QUFBQSxVQUtwQyxJQUFJLFFBQVEsUUFBUSxPQUFPLFlBQVksWUFBWTtBQUFBLFlBQ2xELFVBQVUsQ0FBQztBQUFBLFlBQ1gsT0FBTyxTQUFTO0FBQUEsVUFDakIsRUFDSyxTQUFJLFFBQVEsU0FBUztBQUFBLFlBQ3pCLEVBQUUsS0FBSyxRQUFRLEdBQUc7QUFBQSxjQUNqQixPQUFPLFFBQVEsUUFBUyxLQUFLLFFBQVEsTUFBTSxZQUFZO0FBQUEsYUFDdkQsRUFBRSxLQUFLLFFBQVEsU0FBUyxnQkFBZ0IsT0FBTyxNQUFNO0FBQUEsVUFDdkQsRUFDSyxTQUFJLFFBQVEsUUFBUTtBQUFBLFlBRXhCLE9BQU8sT0FBTztBQUFBLFVBQ2YsRUFDSztBQUFBLG1CQUFPLEtBQUs7QUFBQSxVQUNqQjtBQUFBLFFBQ0Q7QUFBQSxNQUNEO0FBQUEsTUFFQSxJQUFJLFNBQVMsZUFBZTtBQUFBLFFBQzNCLE1BQU0sSUFBSSxNQUFNLHFDQUFxQyxnQkFBZ0IsR0FBRztBQUFBLE1BQ3pFO0FBQUEsTUFDQSxNQUFNLElBQUksZUFBZ0IsTUFBTSxFQUFDLFNBQVMsS0FBSSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBSWpELFNBQVMsU0FBUyxHQUFHO0FBQUEsSUFDcEIsSUFBSSxDQUFDLFdBQVc7QUFBQSxNQUNmLFlBQVk7QUFBQSxNQUlaLFdBQVcsWUFBWTtBQUFBLElBQ3hCO0FBQUE7QUFBQSxFQUdELFNBQVMsS0FBSyxDQUFDLE1BQWUsY0FBc0IsUUFBdUQ7QUFBQSxJQUMxRyxJQUFJLENBQUM7QUFBQSxNQUFNLE1BQU0sSUFBSSxVQUFVLCtDQUErQztBQUFBLElBRTlFLFdBQVcsT0FBTyxLQUFLLE1BQU0sRUFBRSxJQUFJLFFBQVEsQ0FBQyxXQUFXO0FBQUEsTUFDdEQsSUFBSSxVQUFVLE9BQU87QUFBQSxRQUFLLE1BQU0sSUFBSSxZQUFZLCtCQUFpQztBQUFBLE1BQ2pGLElBQUssd0JBQXlCLEtBQUssU0FBUyxHQUFHO0FBQUEsUUFDOUMsTUFBTSxJQUFJLFlBQVksdUVBQTZFO0FBQUEsTUFDcEc7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLFdBQVcsT0FBTztBQUFBLFFBQ2xCLE9BQU8sZ0JBQWdCLFNBQVM7QUFBQSxNQUNqQztBQUFBLEtBQ0E7QUFBQSxJQUNELGdCQUFnQjtBQUFBLElBQ2hCLElBQUksZ0JBQWdCLE1BQU07QUFBQSxNQUN6QixNQUFNLGNBQWMsY0FBYyxZQUFZO0FBQUEsTUFFOUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsR0FBRztBQUFBLFFBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVztBQUFBLE9BQUcsR0FBRztBQUFBLFFBQ2hFLE1BQU0sSUFBSSxlQUFlLCtDQUFnRDtBQUFBLE1BQzFFO0FBQUEsSUFDRDtBQUFBLElBQ0EsTUFBTTtBQUFBLElBRU4sUUFBUSxpQkFBaUIsWUFBWSxXQUFXLEtBQUs7QUFBQSxJQUVyRCxRQUFRO0FBQUEsSUFHUixhQUFhO0FBQUE7QUFBQSxFQUVkLE1BQU0sTUFBTSxRQUFRLENBQUMsTUFBYyxNQUFrQyxTQUF3QjtBQUFBLElBQzVGLElBQUksY0FBYyxNQUFNO0FBQUEsTUFDdkIsVUFBVSxXQUFXLENBQUM7QUFBQSxNQUN0QixRQUFRLFVBQVU7QUFBQSxJQUNuQjtBQUFBLElBQ0EsYUFBYTtBQUFBLElBRWIsT0FBTyxjQUFjLE1BQU0sUUFBUSxDQUFDLENBQUM7QUFBQSxJQUNyQyxJQUFJLE9BQU87QUFBQSxNQUVWLFVBQVU7QUFBQSxNQUNWLE1BQU0sUUFBUSxVQUFVLFFBQVEsUUFBUTtBQUFBLE1BQ3hDLE1BQU0sUUFBUSxVQUFVLFFBQVEsUUFBUTtBQUFBLE1BQ3hDLElBQUksU0FBUyxTQUFTO0FBQUEsUUFDckIsSUFBSSxXQUFXLFFBQVE7QUFBQSxVQUFTLFFBQVEsUUFBUSxhQUFhLE9BQU8sT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUFBLFFBQ3pGO0FBQUEsa0JBQVEsUUFBUSxVQUFVLE9BQU8sT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUFBLE1BQ2pFO0FBQUEsSUFFRCxFQUNLO0FBQUEsTUFFSixJQUFJLFNBQVMsVUFBVTtBQUFBLFFBQ3RCLFFBQVEsU0FBUyxPQUFPLE1BQU0sU0FBUztBQUFBLE1BQ3hDO0FBQUE7QUFBQTtBQUFBLEVBSUYsTUFBTSxNQUFNLFFBQVEsR0FBRztBQUFBLElBR3RCLElBQUksZ0JBQWdCLFdBQVc7QUFBQSxNQUM5QixPQUFPLFlBQVk7QUFBQSxJQUNwQjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsRUFFUixNQUFNLFNBQVM7QUFBQSxFQUNmLE1BQU0sT0FBTyxRQUFRLENBQUMsT0FBa0I7QUFBQSxJQUN2QyxPQUFPLE1BQU0sS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLEVBRTdCLE1BQU0sT0FBTztBQUFBLElBQ1osTUFBTSxRQUFRLENBQUMsT0FBa0I7QUFBQSxNQU1oQyxNQUFNLFFBQVEsb0JBQ2IsTUFBTSxPQUFPLFlBQVksS0FDekIsT0FBTyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxVQUFVLFlBQVksU0FBUyxDQUFDLEdBQ3RFLE1BQU0sUUFDUDtBQUFBLE1BQ0EsSUFBSTtBQUFBLE1BQ0osSUFBSTtBQUFBLE1BQ0osSUFBSTtBQUFBLE1BUUosSUFBSSxNQUFNLE1BQU8sV0FBVyxRQUFRLE1BQU0sTUFBTyxRQUFRLEdBQUc7QUFBQSxRQUMzRCxNQUFNLE1BQU8sT0FBTztBQUFBLFFBQ3BCLE1BQU0sTUFBTyxtQkFBbUI7QUFBQSxNQUdqQyxFQUFPO0FBQUEsUUFDTixVQUFVLE1BQU0sT0FBTztBQUFBLFFBQ3ZCLFVBQVUsTUFBTSxPQUFPO0FBQUEsUUFFdkIsT0FBTyxjQUFjLE1BQU0sTUFBTyxRQUFRLElBQUksTUFBTSxPQUFPLFVBQVUsQ0FBQyxDQUFDO0FBQUEsUUFLdkUsTUFBTSxhQUFjLFdBQVcsT0FBUSxLQUFLLE1BQU07QUFBQSxRQUNsRCxNQUFNLE1BQU8sT0FBTyxhQUFhO0FBQUEsUUFDakMsTUFBTSxNQUFPLFVBQVUsUUFBUSxDQUFDLEdBQVE7QUFBQSxVQUN2QyxJQUFJO0FBQUEsVUFDSixJQUFJLE9BQU8sWUFBWSxZQUFZO0FBQUEsWUFDbEMsU0FBUyxRQUFRLEtBQUssRUFBRSxlQUFlLENBQUM7QUFBQSxVQUN6QyxFQUFPLFNBQUksV0FBVyxRQUFRLE9BQU8sWUFBWSxVQUFVLENBRTNELEVBQU8sU0FBSSxPQUFPLFFBQVEsZ0JBQWdCLFlBQVk7QUFBQSxZQUNyRCxRQUFRLFlBQVksQ0FBQztBQUFBLFVBQ3RCO0FBQUEsVUFXQSxJQUVDLFdBQVcsU0FBUyxDQUFDLEVBQUUscUJBRXRCLEVBQUUsV0FBVyxLQUFLLEVBQUUsVUFBVSxLQUFLLEVBQUUsVUFBVSxPQUUvQyxDQUFDLEVBQUUsY0FBYyxVQUFVLEVBQUUsY0FBYyxXQUFXLFlBRXZELENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxZQUFZLENBQUMsRUFBRSxRQUM3QztBQUFBLFlBRUQsSUFBSSxPQUFPLEVBQUUsbUJBQW1CLFlBQVk7QUFBQSxjQUMzQyxFQUFFLGVBQWU7QUFBQSxZQUNsQixFQUFPLFNBQUksRUFBRSxpQkFBaUIsT0FBTyxFQUFFLGNBQWMsbUJBQW1CLFlBQVk7QUFBQSxjQUNuRixFQUFFLGNBQWMsZUFBZTtBQUFBLFlBQ2hDO0FBQUEsWUFDQyxFQUFVLFNBQVM7QUFBQSxZQUNwQixNQUFNLElBQUksTUFBTSxNQUFNLE9BQU87QUFBQSxVQUM5QjtBQUFBO0FBQUE7QUFBQSxNQUdGLE9BQU87QUFBQTtBQUFBLEVBRVQ7QUFBQSxFQUNBLE1BQU0sUUFBUSxRQUFRLENBQUMsS0FBYztBQUFBLElBQ3BDLE9BQU8sU0FBUyxPQUFPLE9BQU8sTUFBTSxPQUFPO0FBQUE7QUFBQSxFQUU1QyxNQUFNLFNBQVM7QUFBQSxFQUdmLE1BQU0sVUFBVSxjQUFjLENBQzdCLFVBQ0EsUUFDQSxnQkFDQSxTQUFpQixJQUNqQixnQkFBd0IsR0FDSDtBQUFBLElBRXJCLE1BQU0scUJBQXFCO0FBQUEsSUFDM0IsSUFBSSxnQkFBZ0Isb0JBQW9CO0FBQUEsTUFDdkMsTUFBTSxJQUFJLE1BQU0sMkJBQTJCLHVEQUF1RDtBQUFBLElBQ25HO0FBQUEsSUFHQSxNQUFNLGNBQWMsTUFBTTtBQUFBLElBQzFCLE1BQU0sU0FBUztBQUFBLElBRWYsTUFBTSxtQkFBbUI7QUFBQSxJQUl6QixjQUFjLFlBQVk7QUFBQSxJQUUxQixJQUFJO0FBQUEsTUFFSCxNQUFNLFlBQVcsT0FBTyxLQUFLLE1BQU0sRUFBRSxJQUFJLFFBQVEsQ0FBQyxXQUFXO0FBQUEsUUFDNUQsSUFBSSxVQUFVLE9BQU87QUFBQSxVQUFLLE1BQU0sSUFBSSxZQUFZLCtCQUFpQztBQUFBLFFBQ2pGLElBQUssd0JBQXlCLEtBQUssU0FBUyxHQUFHO0FBQUEsVUFDOUMsTUFBTSxJQUFJLFlBQVksdUVBQTZFO0FBQUEsUUFDcEc7QUFBQSxRQUVBLE1BQU0sYUFBYSxPQUFPO0FBQUEsUUFDMUIsTUFBTSxhQUFhLGNBQWMsT0FBTyxlQUFlLFlBQVksZUFBZSxhQUM5RSxXQUEwRCxZQUMzRDtBQUFBLFFBQ0gsT0FBTztBQUFBLFVBQ04sT0FBTztBQUFBLFVBQ1AsV0FBVztBQUFBLFVBQ1gsT0FBTyxnQkFBZ0IsU0FBUztBQUFBLFFBQ2pDO0FBQUEsT0FDQTtBQUFBLE1BR0QsTUFBTSxPQUFPLHVCQUF1QixZQUFZLEdBQUcsRUFBRSxNQUFNLE9BQU8sTUFBTTtBQUFBLE1BQ3hFLE1BQU0sT0FBTyxjQUFjLElBQUk7QUFBQSxNQUcvQixRQUFRLEtBQUs7QUFBQSxNQUdiLGFBQVksT0FBTyxjQUFjLHVCQUFXLFdBQVUsV0FBVTtBQUFBLFFBQy9ELElBQUksTUFBTSxJQUFJLEdBQUc7QUFBQSxVQUNoQixJQUFJLFVBQVU7QUFBQSxVQUdkLElBQUksV0FBVyxPQUFPLFlBQVksY0FBYSxhQUFhLGFBQVcsWUFBWSxXQUFVO0FBQUEsWUFDNUYsTUFBTSxXQUFXO0FBQUEsWUFDakIsSUFBSSxTQUFTLFNBQVM7QUFBQSxjQUNyQixNQUFNLFNBQVMsU0FBUyxRQUFRLEtBQUssUUFBUSxVQUFVLFlBQVk7QUFBQSxjQUNuRSxJQUFJLGtCQUFrQixTQUFTO0FBQUEsZ0JBQzlCLFVBQVUsTUFBTTtBQUFBLGNBQ2pCLEVBQU8sU0FBSSxXQUFXLFdBQVc7QUFBQSxnQkFDaEMsVUFBVTtBQUFBLGNBQ1g7QUFBQSxZQUVEO0FBQUEsWUFJQSxJQUFJLFdBQVcsT0FBTyxHQUFHO0FBQUEsY0FFeEIsTUFBTSxlQUFlLGdCQUFnQixPQUFPO0FBQUEsY0FDNUMsUUFBTyxLQUFLLGtCQUFrQixnQkFBZ0I7QUFBQSxnQkFDN0M7QUFBQSxnQkFDQSxPQUFPO0FBQUEsZ0JBQ1A7QUFBQSxjQUNELENBQUM7QUFBQSxjQUdELE1BQU0saUJBQWlCLFdBQVc7QUFBQSxjQUNsQyxJQUFJO0FBQUEsZ0JBRUgsSUFBSSxrQkFBa0IsT0FBTyxtQkFBbUIsVUFBVTtBQUFBLGtCQUN6RCxJQUFJO0FBQUEsb0JBQ0gsTUFBTSxjQUFjLElBQUksSUFBSSxjQUFjO0FBQUEsb0JBRTFDLE1BQU0sY0FBYyxJQUFJLElBQUksY0FBYyxZQUFZLE1BQU07QUFBQSxvQkFDNUQsV0FBVyxjQUFjLFlBQVk7QUFBQSxvQkFDcEMsTUFBTTtBQUFBLG9CQUVQLFdBQVcsY0FBYztBQUFBO0FBQUEsZ0JBRTNCLEVBQU87QUFBQSxrQkFDTixXQUFXLGNBQWM7QUFBQTtBQUFBLGdCQUkxQixNQUFNLGlCQUFpQixNQUFNLE1BQU0sUUFBUSxjQUFjLFFBQVEsZ0JBQWdCLFFBQVEsZ0JBQWdCLENBQUM7QUFBQSxnQkFDMUcsTUFBTSxlQUFlLE9BQU8sbUJBQW1CLFdBQVcsaUJBQWlCLGVBQWU7QUFBQSxnQkFDMUYsSUFBSSxDQUFDLGdCQUFnQixhQUFhLFdBQVcsR0FBRztBQUFBLGtCQUMvQyxRQUFPLEtBQUsseUJBQXlCO0FBQUEsb0JBQ3BDO0FBQUEsb0JBQ0E7QUFBQSxvQkFDQSxPQUFPO0FBQUEsa0JBQ1IsQ0FBQztBQUFBLGdCQUNGLEVBQU87QUFBQSxrQkFDTixRQUFPLE1BQU0scUJBQXFCO0FBQUEsb0JBQ2pDO0FBQUEsb0JBQ0E7QUFBQSxvQkFDQSxVQUFVLGFBQWE7QUFBQSxrQkFDeEIsQ0FBQztBQUFBO0FBQUEsZ0JBRUYsT0FBTztBQUFBLHdCQUNOO0FBQUEsZ0JBRUQsV0FBVyxjQUFjO0FBQUE7QUFBQSxZQUUzQjtBQUFBLFlBR0EsSUFBSSxTQUFTLFFBQVE7QUFBQSxjQUdwQixNQUFNLG1CQUFrQixXQUFXLFFBQVEsWUFBWSxhQUN0RCxPQUFPLFlBQVksY0FDbEIsT0FBTyxZQUFZLGFBQVksVUFBVSxZQUFXLE9BQVEsUUFBZ0IsU0FBUztBQUFBLGNBR3ZGLElBQUksa0JBQWlCO0FBQUEsZ0JBQ3BCLElBQUk7QUFBQSxrQkFFSCxNQUFNLGlCQUFpQixvQkFBWSxTQUEwQixLQUFLLE1BQU07QUFBQSxrQkFJeEUsTUFBTSxnQkFBZ0IsU0FBUyxPQUFPLGNBQWM7QUFBQSxrQkFDcEQsTUFBTSxTQUFTLE1BQU0sZUFBZSxhQUFhO0FBQUEsa0JBQ2pELE1BQU0sT0FBTyxPQUFPLFdBQVcsV0FBVyxTQUFTLE9BQU87QUFBQSxrQkFDMUQsSUFBSSxNQUFNO0FBQUEsb0JBQ1QsUUFBTyxLQUFLLDRCQUE0QjtBQUFBLHNCQUN2QztBQUFBLHNCQUNBLE9BQU87QUFBQSxzQkFDUCxVQUFVLEtBQUs7QUFBQSxvQkFDaEIsQ0FBQztBQUFBLGtCQUNGO0FBQUEsa0JBQ0EsT0FBTztBQUFBLGtCQUNOLE9BQU0sT0FBTztBQUFBLGtCQUNkLFFBQU8sTUFBTSx1QkFBdUIsT0FBTztBQUFBLG9CQUMxQztBQUFBLG9CQUNBLE9BQU87QUFBQSxrQkFDUixDQUFDO0FBQUEsa0JBQ0QsTUFBTTtBQUFBO0FBQUEsY0FFUjtBQUFBLGNBS0EsSUFBSSxDQUFDLFNBQVMsV0FBVyxZQUFZLFVBQVU7QUFBQSxnQkFDOUMsSUFBSTtBQUFBLGtCQUNILFFBQU8sTUFBTSxnQ0FBZ0M7QUFBQSxvQkFDNUM7QUFBQSxvQkFDQSxPQUFPO0FBQUEsa0JBQ1IsQ0FBQztBQUFBLGtCQUVELE1BQU0sZ0JBQWdCLG9CQUFZLFVBQWlCO0FBQUEsdUJBQy9DLEtBQUs7QUFBQSxvQkFDUixXQUFXO0FBQUEsa0JBQ1osQ0FBQztBQUFBLGtCQUNELE1BQU0sZ0JBQWdCLFNBQVMsT0FBTyxhQUFhO0FBQUEsa0JBQ25ELE1BQU0sU0FBUyxNQUFNLGVBQWUsYUFBYTtBQUFBLGtCQUNqRCxNQUFNLE9BQU8sT0FBTyxXQUFXLFdBQVcsU0FBUyxPQUFPO0FBQUEsa0JBQzFELElBQUksTUFBTTtBQUFBLG9CQUNULFFBQU8sS0FBSyw0Q0FBNEM7QUFBQSxzQkFDdkQ7QUFBQSxzQkFDQSxPQUFPO0FBQUEsc0JBQ1AsVUFBVSxLQUFLO0FBQUEsb0JBQ2hCLENBQUM7QUFBQSxrQkFDRjtBQUFBLGtCQUNBLE9BQU87QUFBQSxrQkFDTixPQUFNLE9BQU87QUFBQSxrQkFDZCxRQUFPLE1BQU0scUNBQXFDLE9BQU87QUFBQSxvQkFDeEQ7QUFBQSxvQkFDQSxPQUFPO0FBQUEsa0JBQ1IsQ0FBQztBQUFBLGtCQUNELE1BQU07QUFBQTtBQUFBLGNBRVI7QUFBQSxZQUtEO0FBQUEsVUFDRDtBQUFBLFVBSUEsTUFBTSxrQkFBa0IsV0FBVyxTQUNsQyxPQUFPLFlBQVksY0FDbEIsT0FBTyxZQUFZLGFBQVksVUFBVSxZQUFXLE9BQVEsUUFBZ0IsU0FBUztBQUFBLFVBRXZGLElBQUksaUJBQWlCO0FBQUEsWUFDcEIsTUFBTSxTQUFRLG9CQUFZLFNBQTBCLEtBQUssTUFBTTtBQUFBLFlBQy9ELE1BQU0sU0FBUyxNQUFNLGVBQWUsTUFBSztBQUFBLFlBRXpDLE9BQU8sT0FBTyxXQUFXLFdBQVcsU0FBUztBQUFBLFVBQzlDO0FBQUEsVUFHQSxNQUFNLFFBQVEsb0JBQVksT0FBTyxLQUFLLE1BQU07QUFBQSxVQUM1QyxPQUFPLE1BQU0sZUFBZSxLQUFLO0FBQUEsUUFDbEM7QUFBQSxNQUNEO0FBQUEsTUFHQSxNQUFNLElBQUksTUFBTSxzQkFBc0IsVUFBVTtBQUFBLGNBQy9DO0FBQUEsTUFFRCxNQUFNLFNBQVM7QUFBQSxNQUNmLGNBQWM7QUFBQTtBQUFBO0FBQUEsRUFJaEIsT0FBTztBQUFBOzs7QUM1bkJELElBQU0sa0JBQWtCLE9BQU8sWUFBWSxlQUFlLFFBQVEsS0FBSyxhQUFhO0FBRzNGLElBQUksc0JBQXNCO0FBQzFCLElBQU0sdUJBQXVCO0FBR3RCLFNBQVMsd0JBQXdCLEdBQVM7QUFBQSxFQUNoRCxzQkFBc0I7QUFBQTtBQUdoQixTQUFTLGdCQUFnQixDQUFDLE9BQW9CO0FBQUEsRUFDcEQsSUFBSSxDQUFDO0FBQUEsSUFBTyxPQUFPO0FBQUEsRUFDbkIsSUFBSSxPQUFPLE1BQU0sUUFBUTtBQUFBLElBQVUsT0FBTyxNQUFNO0FBQUEsRUFDaEQsSUFBSSxNQUFNLEtBQUs7QUFBQSxJQUFNLE9BQU8sTUFBTSxJQUFJO0FBQUEsRUFDdEMsSUFBSSxNQUFNLEtBQUs7QUFBQSxJQUFhLE9BQU8sTUFBTSxJQUFJO0FBQUEsRUFDN0MsSUFBSSxNQUFNLE9BQU8sYUFBYTtBQUFBLElBQU0sT0FBTyxNQUFNLE1BQU0sWUFBWTtBQUFBLEVBQ25FLE9BQU87QUFBQTtBQUlSLFNBQVMsZ0JBQWdCLENBQUMsSUFBbUU7QUFBQSxFQUM1RixNQUFNLFVBQVUsR0FBRyxRQUFRLFlBQVk7QUFBQSxFQUN2QyxJQUFJLFVBQVUsSUFBSTtBQUFBLEVBR2xCLElBQUksR0FBRyxJQUFJO0FBQUEsSUFDVixXQUFXLFFBQVEsR0FBRztBQUFBLEVBQ3ZCO0FBQUEsRUFDQSxJQUFJLEdBQUcsYUFBYSxPQUFPLEdBQUcsY0FBYyxVQUFVO0FBQUEsSUFDckQsTUFBTSxVQUFVLEdBQUcsVUFBVSxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQUssQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHO0FBQUEsSUFDM0UsSUFBSSxTQUFTO0FBQUEsTUFDWixXQUFXLGVBQWUsVUFBVSxHQUFHLFVBQVUsTUFBTSxHQUFHLEVBQUUsU0FBUyxJQUFJLFFBQVE7QUFBQSxJQUNsRjtBQUFBLEVBQ0Q7QUFBQSxFQUVBLFdBQVc7QUFBQSxFQUNYLE9BQU8sRUFBQyxTQUFTLFNBQVMsVUFBVSxLQUFLLFdBQVU7QUFBQTtBQUc3QyxTQUFTLGNBQWMsQ0FBQyxPQUFZLFdBQW1CLEdBQUcsZUFBdUIsR0FBRyx3QkFBaUMsTUFBYztBQUFBLEVBQ3pJLElBQUksQ0FBQyxTQUFTLGdCQUFnQjtBQUFBLElBQVUsT0FBTztBQUFBLEVBRS9DLE1BQU0sU0FBUyxLQUFLLE9BQU8sWUFBWTtBQUFBLEVBR3ZDLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxJQUN0QixNQUFNLE9BQU8sT0FBTyxNQUFNLFlBQVksTUFBTSxRQUFRLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUFBLElBQ3ZFLE9BQU8sR0FBRyxVQUFVLE9BQU8sT0FBTyxNQUFNLFlBQVksTUFBTSxRQUFRLEVBQUUsRUFBRSxTQUFTLEtBQUssUUFBUTtBQUFBLEVBQzdGO0FBQUEsRUFHQSxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQUEsSUFDdEIsSUFBSSxDQUFDLE1BQU0sWUFBWSxDQUFDLE1BQU0sUUFBUSxNQUFNLFFBQVEsS0FBSyxNQUFNLFNBQVMsV0FBVyxHQUFHO0FBQUEsTUFDckYsT0FBTyxHQUFHO0FBQUEsSUFDWDtBQUFBLElBQ0EsTUFBTSxnQkFBZ0IsTUFBTSxTQUFTLE9BQU8sQ0FBQyxNQUFXLEtBQUssSUFBSSxFQUFFLE1BQU0sR0FBRyxDQUFDO0FBQUEsSUFDN0UsSUFBSSxVQUFTLEdBQUc7QUFBQTtBQUFBLElBQ2hCLFdBQVcsU0FBUyxlQUFlO0FBQUEsTUFDbEMsV0FBVSxlQUFlLE9BQU8sVUFBVSxlQUFlLEdBQUcscUJBQXFCLElBQUk7QUFBQTtBQUFBLElBQ3RGO0FBQUEsSUFDQSxJQUFJLE1BQU0sU0FBUyxPQUFPLENBQUMsTUFBVyxLQUFLLElBQUksRUFBRSxTQUFTLEdBQUc7QUFBQSxNQUM1RCxXQUFVLEdBQUcsZ0JBQWdCLE1BQU0sU0FBUyxPQUFPLENBQUMsTUFBVyxLQUFLLElBQUksRUFBRSxTQUFTO0FBQUE7QUFBQSxJQUNwRjtBQUFBLElBQ0EsT0FBTyxRQUFPLFFBQVE7QUFBQSxFQUN2QjtBQUFBLEVBRUEsTUFBTSxjQUFjLE9BQU8sTUFBTSxRQUFRO0FBQUEsRUFDekMsTUFBTSxVQUFVLGNBQWMsaUJBQWlCLEtBQUssSUFBSSxNQUFNO0FBQUEsRUFFOUQsSUFBSSxTQUFTLEdBQUcsVUFBVTtBQUFBLEVBRzFCLElBQUksTUFBTSxPQUFPLEtBQUs7QUFBQSxJQUNyQixVQUFVLFNBQVMsTUFBTSxNQUFNO0FBQUEsRUFDaEM7QUFBQSxFQUdBLElBQUksTUFBTSxPQUFPO0FBQUEsSUFDaEIsTUFBTSxpQkFBaUIsQ0FBQyxNQUFNLFNBQVMsV0FBVztBQUFBLElBQ2xELFdBQVcsUUFBUSxnQkFBZ0I7QUFBQSxNQUNsQyxJQUFJLE1BQU0sTUFBTSxPQUFPO0FBQUEsUUFDdEIsTUFBTSxRQUFRLE9BQU8sTUFBTSxNQUFNLFVBQVUsV0FDeEMsTUFBTSxNQUFNLFFBQ1osT0FBTyxNQUFNLE1BQU0sS0FBSztBQUFBLFFBQzNCLFVBQVUsSUFBSSxTQUFTLE1BQU0sVUFBVSxHQUFHLEVBQUUsSUFBSSxNQUFNLFNBQVMsS0FBSyxRQUFRO0FBQUEsUUFDNUU7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUVBLFVBQVU7QUFBQSxFQUlWLElBQUksZUFBZSx5QkFBeUIsTUFBTSxZQUFZLGVBQWUsV0FBVyxHQUFHO0FBQUEsSUFDMUYsTUFBTSxlQUFlLGVBQWUsTUFBTSxVQUFVLFVBQVUsZUFBZSxHQUFHLHFCQUFxQjtBQUFBLElBQ3JHLElBQUksY0FBYztBQUFBLE1BQ2pCLFVBQVU7QUFBQSxJQUFPO0FBQUEsSUFDbEI7QUFBQSxFQUNEO0FBQUEsRUFHQSxJQUFJLE1BQU0sWUFBWSxNQUFNLFFBQVEsTUFBTSxRQUFRLEtBQUssZUFBZSxXQUFXLEdBQUc7QUFBQSxJQUNuRixNQUFNLGdCQUFnQixNQUFNLFNBQVMsT0FBTyxDQUFDLE1BQVcsS0FBSyxJQUFJLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFBQSxJQUM5RSxJQUFJLGNBQWMsU0FBUyxHQUFHO0FBQUEsTUFDN0IsVUFBVTtBQUFBO0FBQUEsTUFDVixXQUFXLFNBQVMsZUFBZTtBQUFBLFFBQ2xDLElBQUksT0FBTyxVQUFVLFlBQVksT0FBTyxVQUFVLFVBQVU7QUFBQSxVQUMzRCxNQUFNLE9BQU8sT0FBTyxLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUU7QUFBQSxVQUMxQyxVQUFVLEdBQUcsWUFBWSxPQUFPLE9BQU8sS0FBSyxFQUFFLFNBQVMsS0FBSyxRQUFRO0FBQUE7QUFBQSxRQUNyRSxFQUFPO0FBQUEsVUFDTixNQUFNLFlBQVksZUFBZSxPQUFPLFVBQVUsZUFBZSxHQUFHLHFCQUFxQjtBQUFBLFVBQ3pGLElBQUksV0FBVztBQUFBLFlBQ2QsVUFBVSxZQUFZO0FBQUE7QUFBQSxVQUN2QjtBQUFBO0FBQUEsTUFFRjtBQUFBLE1BQ0EsSUFBSSxNQUFNLFNBQVMsT0FBTyxDQUFDLE1BQVcsS0FBSyxJQUFJLEVBQUUsU0FBUyxJQUFJO0FBQUEsUUFDN0QsVUFBVSxHQUFHLGdCQUFnQixNQUFNLFNBQVMsT0FBTyxDQUFDLE1BQVcsS0FBSyxJQUFJLEVBQUUsU0FBUztBQUFBO0FBQUEsTUFDcEY7QUFBQSxJQUNEO0FBQUEsRUFDRCxFQUFPLFNBQUksTUFBTSxRQUFRLE1BQU07QUFBQSxJQUM5QixNQUFNLE9BQU8sT0FBTyxNQUFNLElBQUksRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUFBLElBQy9DLFVBQVUsS0FBSyxPQUFPLE9BQU8sTUFBTSxJQUFJLEVBQUUsU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNoRTtBQUFBLEVBRUEsVUFBVSxHQUFHLFdBQVc7QUFBQSxFQUV4QixPQUFPO0FBQUE7QUFJUixTQUFTLHVCQUF1QixDQUFDLFFBQStCLE9BQVksYUFBcUIsR0FBVztBQUFBLEVBQzNHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFBQSxJQUFPLE9BQU87QUFBQSxFQUc5QixNQUFNLGNBQXFELENBQUM7QUFBQSxFQUM1RCxJQUFJLFVBQXVCO0FBQUEsRUFDM0IsSUFBSSxRQUFRO0FBQUEsRUFFWixPQUFPLFdBQVcsUUFBUSxZQUFZO0FBQUEsSUFDckMsSUFBSSxRQUFRLGFBQWEsR0FBRztBQUFBLE1BQzNCLE1BQU0sS0FBSztBQUFBLE1BRVgsSUFBSSxHQUFHLFlBQVksVUFBVSxHQUFHLFlBQVksUUFBUTtBQUFBLFFBQ25ELFlBQVksUUFBUSxpQkFBaUIsRUFBRSxDQUFDO0FBQUEsTUFDekM7QUFBQSxJQUNEO0FBQUEsSUFDQSxVQUFVLFFBQVEsaUJBQWlCLFFBQVE7QUFBQSxJQUMzQztBQUFBLEVBQ0Q7QUFBQSxFQUdBLE1BQU0sUUFBa0IsQ0FBQztBQUFBLEVBR3pCLFlBQVksUUFBUSxDQUFDLElBQUksTUFBTTtBQUFBLElBQzlCLE1BQU0sS0FBSyxLQUFLLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTztBQUFBLEdBQ3RDO0FBQUEsRUFHRCxJQUFJLE9BQU87QUFBQSxJQUNWLE1BQU0sYUFBYSxZQUFZO0FBQUEsSUFDL0IsTUFBTSxXQUFXLGVBQWUsT0FBTyxHQUFHLEdBQUcsSUFBSTtBQUFBLElBQ2pELElBQUksVUFBVTtBQUFBLE1BRWIsTUFBTSxZQUFZLFNBQVMsTUFBTTtBQUFBLENBQUk7QUFBQSxNQUNyQyxVQUFVLFFBQVEsVUFBUTtBQUFBLFFBQ3pCLE1BQU0sS0FBSyxLQUFLLE9BQU8sVUFBVSxJQUFJLElBQUk7QUFBQSxPQUN6QztBQUFBLElBQ0Y7QUFBQSxFQUNEO0FBQUEsRUFHQSxTQUFTLElBQUksWUFBWSxTQUFTLEVBQUcsS0FBSyxHQUFHLEtBQUs7QUFBQSxJQUNqRCxNQUFNLEtBQUssS0FBSyxPQUFPLENBQUMsSUFBSSxZQUFZLEdBQUcsUUFBUTtBQUFBLEVBQ3BEO0FBQUEsRUFFQSxPQUFPLE1BQU0sS0FBSztBQUFBLENBQUk7QUFBQTtBQUd2QixTQUFTLGtCQUFrQixDQUFDLE9BQVksU0FBc0Q7QUFBQSxFQUM3RixNQUFNLE9BQWlCLENBQUM7QUFBQSxFQUV4QixNQUFNLGdCQUFnQixDQUFDLEdBQVEsUUFBZ0IsTUFBZTtBQUFBLElBQzdELElBQUksQ0FBQyxLQUFLLFFBQVE7QUFBQSxNQUFJLE9BQU87QUFBQSxJQUU3QixNQUFNLE9BQU8saUJBQWlCLENBQUM7QUFBQSxJQUMvQixNQUFNLGNBQWMsT0FBTyxFQUFFLFFBQVEsWUFBWSxTQUFTLGFBQWEsU0FBUyxlQUFlLFNBQVM7QUFBQSxJQUV4RyxJQUFJLGFBQWE7QUFBQSxNQUNoQixLQUFLLEtBQUssSUFBSTtBQUFBLElBQ2Y7QUFBQSxJQUVBLElBQUksRUFBRSxZQUFZLFFBQVEsR0FBRztBQUFBLE1BQzVCLElBQUksY0FBYyxFQUFFLFVBQVUsUUFBUSxDQUFDO0FBQUEsUUFBRyxPQUFPO0FBQUEsSUFDbEQ7QUFBQSxJQUVBLElBQUksRUFBRSxZQUFZLE1BQU0sUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLEdBQUc7QUFBQSxNQUN6RCxTQUFTLElBQUksRUFBRyxJQUFJLEtBQUssSUFBSSxFQUFFLFNBQVMsUUFBUSxDQUFDLEdBQUcsS0FBSztBQUFBLFFBQ3hELE1BQU0sUUFBUSxFQUFFLFNBQVM7QUFBQSxRQUN6QixJQUFJLFNBQVMsY0FBYyxPQUFPLFFBQVEsQ0FBQztBQUFBLFVBQUcsT0FBTztBQUFBLE1BQ3REO0FBQUEsSUFDRDtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsRUFHUixJQUFJLFNBQVMsVUFBVTtBQUFBLElBQ3RCLGNBQWMsUUFBUSxRQUFRO0FBQUEsSUFDOUIsSUFBSSxLQUFLLFNBQVM7QUFBQSxNQUFHLE9BQU87QUFBQSxFQUM3QjtBQUFBLEVBQ0EsSUFBSSxTQUFTLFVBQVU7QUFBQSxJQUN0QixjQUFjLFFBQVEsUUFBUTtBQUFBLElBQzlCLElBQUksS0FBSyxTQUFTO0FBQUEsTUFBRyxPQUFPO0FBQUEsRUFDN0I7QUFBQSxFQUVBLElBQUksT0FBTztBQUFBLElBQ1YsY0FBYyxLQUFLO0FBQUEsRUFDcEI7QUFBQSxFQUVBLE9BQU87QUFBQTtBQUdSLFNBQVMsd0JBQXdCLENBQUMsT0FBWSxTQUFvRDtBQUFBLEVBQ2pHLElBQUksQ0FBQztBQUFBLElBQU8sT0FBTztBQUFBLEVBRW5CLE1BQU0sT0FBTyxtQkFBbUIsT0FBTyxPQUFPO0FBQUEsRUFDOUMsTUFBTSxnQkFBZ0IsaUJBQWlCLEtBQUs7QUFBQSxFQUM1QyxNQUFNLFlBQVksT0FBTyxNQUFNLFFBQVE7QUFBQSxFQUV2QyxJQUFJLEtBQUssU0FBUyxHQUFHO0FBQUEsSUFDcEIsTUFBTSxVQUFVLEtBQUssS0FBSyxLQUFJO0FBQUEsSUFDOUIsSUFBSSxhQUFhLGtCQUFrQixLQUFLLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekQsT0FBTyxHQUFHLG9CQUFvQjtBQUFBLElBQy9CLEVBQU87QUFBQSxNQUNOLE9BQU87QUFBQTtBQUFBLEVBRVQ7QUFBQSxFQUVBLE9BQU87QUFBQTtBQVdELFNBQVMsaUJBQWlCLENBQ2hDLFdBQ0EsT0FDQSxVQUNBLE9BQ0EsU0FDTztBQUFBLEVBRVAscUJBQXFCLEtBQUs7QUFBQSxFQUcxQjtBQUFBLEVBQ0EsSUFBSSxzQkFBc0Isc0JBQXNCO0FBQUEsSUFDL0MsSUFBSSx3QkFBd0IsdUJBQXVCLEdBQUc7QUFBQSxNQUNyRCxNQUFNLGdCQUFnQixNQUFNLEtBQUssZUFBZSxvQkFBb0IsUUFBUSxDQUFDLEVBQzNFLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUMxQixNQUFNLEdBQUcsQ0FBQyxFQUNWLElBQUksRUFBRSxNQUFNLFdBQVcsR0FBRyxTQUFTLE9BQU8sRUFDMUMsS0FBSyxJQUFJO0FBQUEsTUFFWCxPQUFPLEtBQUsseUNBQXlDLDBGQUEwRjtBQUFBLFFBQzlJLGlCQUFpQixlQUFlO0FBQUEsUUFDaEMsZUFBZSxpQkFBaUI7QUFBQSxNQUNqQyxDQUFDO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBQUEsRUFHQSxNQUFNLHFCQUFxQix5QkFBeUIsT0FBTyxPQUFPO0FBQUEsRUFHbEUsTUFBTSxhQUFrQztBQUFBLElBQ3ZDLGVBQWU7QUFBQSxJQUNmO0FBQUEsRUFDRDtBQUFBLEVBRUEsSUFBSSxTQUFTLE1BQU07QUFBQSxJQUNsQixXQUFXLGVBQWUsUUFBUSxLQUFLLGFBQWEsSUFDakQsR0FBSSxRQUFRLEtBQWlCLFFBQVEsWUFBWSxNQUNqRDtBQUFBLEVBQ0o7QUFBQSxFQUdBLElBQUksaUJBQWlCO0FBQUEsSUFDcEIsTUFBTSxjQUFjLFNBQVMsWUFBWSxTQUFTLFNBQVM7QUFBQSxJQUMzRCxJQUFJO0FBQUEsTUFDSCxNQUFNLG9CQUFvQix3QkFBd0IsU0FBUyxVQUFVLE1BQU0sYUFBYSxDQUFDO0FBQUEsTUFDekYsSUFBSSxtQkFBbUI7QUFBQSxRQUN0QixXQUFXLFlBQVk7QUFBQSxNQUN4QjtBQUFBLE1BQ0MsT0FBTSxJQUFJO0FBQUEsTUFFWCxJQUFJLGFBQWE7QUFBQSxRQUNoQixJQUFJO0FBQUEsVUFDSCxNQUFNLFdBQVcsZUFBZSxhQUFhLEdBQUcsR0FBRyxJQUFJO0FBQUEsVUFDdkQsSUFBSSxVQUFVO0FBQUEsWUFDYixXQUFXLGdCQUFnQjtBQUFBLFVBQzVCO0FBQUEsVUFDQyxPQUFNLEtBQUs7QUFBQSxVQUNaLFdBQVcsWUFBWSxpQkFBaUIsV0FBVztBQUFBO0FBQUEsTUFFckQ7QUFBQTtBQUFBLElBSUQsSUFBSSxTQUFTLFlBQVksU0FBUyxVQUFVO0FBQUEsTUFDM0MsSUFBSTtBQUFBLFFBQ0gsTUFBTSxVQUFVLGVBQWUsUUFBUSxVQUFVLENBQUM7QUFBQSxRQUNsRCxNQUFNLFVBQVUsZUFBZSxRQUFRLFVBQVUsQ0FBQztBQUFBLFFBQ2xELElBQUk7QUFBQSxVQUFTLFdBQVcsV0FBVztBQUFBLFFBQ25DLElBQUk7QUFBQSxVQUFTLFdBQVcsZ0JBQWdCO0FBQUEsUUFDdkMsT0FBTSxJQUFJO0FBQUEsSUFHYjtBQUFBLEVBQ0Q7QUFBQSxFQUVBLElBQUksVUFBVSxTQUFTLGFBQWEsS0FBSyxVQUFVLFNBQVMsV0FBVyxHQUFHO0FBQUEsSUFDekUsV0FBVyxvQkFBb0I7QUFBQSxFQUNoQztBQUFBLEVBRUEsT0FBTyxNQUFNLG9CQUFvQixhQUFhLE9BQU8sVUFBVTtBQUFBO0FBVWhFLElBQUksaUJBQWlDO0FBQUEsRUFDcEMsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCLElBQUk7QUFBQSxFQUN6QixrQkFBa0I7QUFDbkI7QUFlQSxTQUFTLG9CQUFvQixDQUFDLE9BQWtCO0FBQUEsRUFDL0MsZUFBZTtBQUFBLEVBQ2YsZUFBZSxtQkFBbUIsS0FBSyxJQUFJO0FBQUEsRUFDM0MsTUFBTSxnQkFBZ0IsaUJBQWlCLEtBQUs7QUFBQSxFQUM1QyxNQUFNLGVBQWUsZUFBZSxvQkFBb0IsSUFBSSxhQUFhLEtBQUs7QUFBQSxFQUM5RSxlQUFlLG9CQUFvQixJQUFJLGVBQWUsZUFBZSxDQUFDO0FBQUE7OztBQ3JYdkUsSUFBZSw2QkFBSTs7O0FDSW5CLFVBQVUsTUFBTSxDQUFDLE9BQThDO0FBQUEsRUFHOUQsSUFBSSxNQUFNLE1BQU07QUFBQSxFQUNoQixJQUFJLFVBQVUsTUFBTTtBQUFBLEVBQ3BCLE1BQU0sYUFBYSx1QkFBZSxJQUFJLEdBQUk7QUFBQSxFQUMxQyxHQUFHO0FBQUEsSUFDRixNQUFNLGNBQWMsSUFBSztBQUFBLElBRXpCLElBQUksdUJBQWUsSUFBSSxHQUFJLE1BQU0sWUFBWTtBQUFBLE1BQzVDLE1BQU07QUFBQSxNQUNOO0FBQUEsSUFDRDtBQUFBLElBRUEsTUFBTTtBQUFBLEVBQ1AsU0FDTztBQUFBO0FBR1IsSUFBZTs7O0FDWmYsU0FBd0IsYUFBYSxHQUFHO0FBQUEsRUFDdkMsTUFBTSxZQUFvQztBQUFBLElBQ3pDLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxFQUNQO0FBQUEsRUFFQSxJQUFJO0FBQUEsRUFDSixJQUFJO0FBQUEsRUFFSixJQUFJLHlCQUF5QjtBQUFBLEVBQzdCLE1BQU0sMkJBQTJCO0FBQUEsRUFFakMsU0FBUyxXQUFXLENBQUMsS0FBcUI7QUFBQSxJQUN6QyxPQUFPLElBQUk7QUFBQTtBQUFBLEVBR1osU0FBUyxZQUFZLENBQUMsT0FBZ0M7QUFBQSxJQUNyRCxPQUFPLE1BQU0sU0FBUyxNQUFNLE1BQU0sU0FBUyxVQUFVLE1BQU07QUFBQTtBQUFBLEVBSTVELFNBQVMsVUFBVSxDQUFDLE9BQVksVUFBZTtBQUFBLElBQzlDLElBQUksTUFBTSxVQUFVO0FBQUEsTUFBVSxNQUFNLElBQUksTUFBTSxxQ0FBdUM7QUFBQTtBQUFBLEVBT3RGLFNBQVMsUUFBUSxDQUFZLFVBQWUsTUFBYTtBQUFBLElBQ3hELE1BQU0sV0FBVyxNQUFNO0FBQUEsSUFDdkIsSUFBSTtBQUFBLE1BQ0gsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFBQSxjQUMzQztBQUFBLE1BQ0QsV0FBVyxPQUFPLFFBQVE7QUFBQTtBQUFBO0FBQUEsRUFNNUIsU0FBUyxhQUFhLENBQUMsS0FBMkI7QUFBQSxJQUNqRCxJQUFJO0FBQUEsTUFDSCxPQUFPLFlBQVksR0FBRyxFQUFFO0FBQUEsTUFDdkIsT0FBTSxJQUFJO0FBQUEsTUFDWCxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBSVQsU0FBUyxXQUFXLENBQUMsUUFBb0MsUUFBOEIsT0FBZSxLQUFhLE9BQTBCLGFBQTBCLElBQXdCLGNBQXVCLE9BQU8sZUFBaUMsTUFBTTtBQUFBLElBR25RLE1BQU0sc0JBQXNCLGdCQUFnQixRQUFRLGVBQWUsZUFBZTtBQUFBLElBQ2xGLElBQUkscUJBQXFCO0FBQUEsTUFDeEIsZUFBZSxJQUFJO0FBQUEsSUFDcEI7QUFBQSxJQUNBLFNBQVMsSUFBSSxNQUFPLElBQUksS0FBSyxLQUFLO0FBQUEsTUFDakMsTUFBTSxRQUFRLE9BQU87QUFBQSxNQUNyQixJQUFJLFNBQVMsTUFBTTtBQUFBLFFBQ2xCLFdBQVcsUUFBUSxPQUFPLE9BQU8sSUFBSSxhQUFhLGFBQWEsWUFBWTtBQUFBLE1BQzVFO0FBQUEsSUFDRDtBQUFBLElBR0EsSUFBSSx1QkFBdUIsZ0JBQWdCLE9BQU8sY0FBYyxlQUFlLE1BQU07QUFBQSxNQUNwRixJQUFJLE9BQW9CLE9BQU87QUFBQSxNQUMvQixPQUFPLE1BQU07QUFBQSxRQUNaLE1BQU0sT0FBb0IsS0FBSztBQUFBLFFBQy9CLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxHQUFHO0FBQUEsVUFDNUIsSUFBSTtBQUFBLFlBQ0gsT0FBTyxZQUFZLElBQUk7QUFBQSxZQUN0QixPQUFNLEdBQUc7QUFBQSxZQUNWLE1BQU0sUUFBUTtBQUFBLFlBQ2Qsa0JBQ0Msb0NBQ0EsTUFDQSxrQkFBa0IsVUFBVSxTQUFTLE1BQ3JDLE9BQ0EsRUFBQyxRQUFRLGtCQUFrQixVQUFVLFNBQVMsV0FBVyxNQUFNLGFBQVksQ0FDNUU7QUFBQTtBQUFBLFFBSUY7QUFBQSxRQUNBLE9BQU87QUFBQSxNQUNSO0FBQUEsSUFDRDtBQUFBO0FBQUEsRUFFRCxTQUFTLFVBQVUsQ0FBQyxRQUFvQyxPQUFZLE9BQTBCLElBQXdCLGFBQTBCLGNBQXVCLE9BQU8sZUFBaUMsTUFBTTtBQUFBLElBQ3BOLE1BQU0sTUFBTSxNQUFNO0FBQUEsSUFDbEIsSUFBSSxPQUFPLFFBQVEsVUFBVTtBQUFBLE1BQzVCLE1BQU0sUUFBUSxDQUFDO0FBQUEsTUFDZixJQUFJLE1BQU0sU0FBUztBQUFBLFFBQU0sY0FBYyxNQUFNLE9BQU8sT0FBTyxPQUFPLFdBQVc7QUFBQSxNQUM3RSxRQUFRO0FBQUEsYUFDRjtBQUFBLFVBQUssV0FBVyxRQUFRLE9BQU8sYUFBYSxhQUFhLFlBQVk7QUFBQSxVQUFHO0FBQUEsYUFDeEU7QUFBQSxVQUFLLFdBQVcsUUFBUSxPQUFPLElBQUksV0FBVztBQUFBLFVBQUc7QUFBQSxhQUNqRDtBQUFBLFVBQUssZUFBZSxRQUFRLE9BQU8sT0FBTyxJQUFJLGFBQWEsYUFBYSxZQUFZO0FBQUEsVUFBRztBQUFBO0FBQUEsVUFDbkYsY0FBYyxRQUFRLE9BQU8sT0FBTyxJQUFJLGFBQWEsYUFBYSxZQUFZO0FBQUE7QUFBQSxJQUV6RixFQUNLO0FBQUEsc0JBQWdCLFFBQVEsT0FBTyxPQUFPLElBQUksYUFBYSxhQUFhLFlBQVk7QUFBQTtBQUFBLEVBRXRGLFNBQVMsVUFBVSxDQUFDLFFBQW9DLE9BQVksYUFBMEIsY0FBdUIsT0FBTyxlQUFpQyxNQUFNO0FBQUEsSUFDbEssSUFBSTtBQUFBLElBQ0osSUFBSSxlQUFlLE9BQU8sY0FBYyxlQUFlLFFBQVEsY0FBYztBQUFBLE1BRzVFLE1BQU0sZUFBZSxPQUFPLE1BQU0sWUFBWSxFQUFFLEVBQUUsS0FBSztBQUFBLE1BQ3ZELElBQUksWUFBeUIsT0FBTztBQUFBLE1BQ3BDLE9BQU8sV0FBVztBQUFBLFFBQ2pCLElBQUksVUFBVSxhQUFhLEtBQUssQ0FBQyxhQUFhLElBQUksU0FBUyxHQUFHO0FBQUEsVUFDN0QsTUFBTSxnQkFBZ0I7QUFBQSxVQUN0QixNQUFNLGlCQUFpQixjQUFjLGFBQWE7QUFBQSxVQUVsRCxJQUFJLG1CQUFtQixPQUFPLE1BQU0sUUFBUSxLQUMxQyxnQkFBZ0IsZUFBZSxLQUFLLE1BQU0sY0FBZTtBQUFBLFlBQzFELFdBQVc7QUFBQSxZQUNYLGFBQWEsSUFBSSxRQUFRO0FBQUEsWUFFekIsSUFBSSxtQkFBbUIsT0FBTyxNQUFNLFFBQVEsR0FBRztBQUFBLGNBQzlDLFNBQVMsWUFBWSxPQUFPLE1BQU0sUUFBUTtBQUFBLFlBQzNDO0FBQUEsWUFFQTtBQUFBLFVBQ0Q7QUFBQSxRQUNEO0FBQUEsUUFDQSxZQUFZLFVBQVU7QUFBQSxNQUN2QjtBQUFBLE1BRUEsSUFBSSxDQUFDLFVBQVc7QUFBQSxRQUNmLFdBQVcsWUFBWSxNQUFpQixFQUFFLGVBQWUsTUFBTSxRQUFRO0FBQUEsUUFDdkUsVUFBVSxRQUFRLFVBQVUsV0FBVztBQUFBLE1BQ3hDO0FBQUEsSUFDRCxFQUFPO0FBQUEsTUFDTixXQUFXLFlBQVksTUFBaUIsRUFBRSxlQUFlLE1BQU0sUUFBUTtBQUFBLE1BQ3ZFLFVBQVUsUUFBUSxVQUFVLFdBQVc7QUFBQTtBQUFBLElBRXhDLE1BQU0sTUFBTTtBQUFBO0FBQUEsRUFFYixNQUFNLGtCQUEwQyxFQUFDLFNBQVMsU0FBUyxPQUFPLFNBQVMsT0FBTyxTQUFTLE9BQU8sU0FBUyxJQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksTUFBTSxVQUFVLFNBQVMsS0FBSyxXQUFVO0FBQUEsRUFDdEwsU0FBUyxVQUFVLENBQUMsUUFBb0MsT0FBWSxJQUF3QixhQUEwQjtBQUFBLElBQ3JILE1BQU0sUUFBUSxNQUFNLFNBQVMsTUFBTSxlQUFlLEtBQUssQ0FBQztBQUFBLElBTXhELElBQUksT0FBTyxZQUFZLE1BQWlCLEVBQUUsY0FBYyxnQkFBZ0IsTUFBTSxPQUFPLEtBQUs7QUFBQSxJQUMxRixJQUFJLE9BQU8sOEJBQThCO0FBQUEsTUFDeEMsS0FBSyxZQUFZLDZDQUE2QyxNQUFNLFdBQVc7QUFBQSxNQUMvRSxPQUFPLEtBQUs7QUFBQSxJQUNiLEVBQU87QUFBQSxNQUNOLEtBQUssWUFBWSxNQUFNO0FBQUE7QUFBQSxJQUV4QixNQUFNLE1BQU0sS0FBSztBQUFBLElBQ2pCLE1BQU0sVUFBVSxLQUFLLFdBQVc7QUFBQSxJQUNoQyxNQUFNLFlBQVcsWUFBWSxNQUFpQixFQUFFLHVCQUF1QjtBQUFBLElBQ3ZFLElBQUk7QUFBQSxJQUNKLFFBQVEsUUFBUSxLQUFLLGVBQWUsTUFBTTtBQUFBLE1BQ3pDLFVBQVMsWUFBWSxLQUFLO0FBQUEsSUFDM0I7QUFBQSxJQUNBLFVBQVUsUUFBUSxXQUFVLFdBQVc7QUFBQTtBQUFBLEVBRXhDLFNBQVMsY0FBYyxDQUFDLFFBQW9DLE9BQVksT0FBMEIsSUFBd0IsYUFBMEIsY0FBdUIsT0FBTyxlQUFpQyxNQUFNO0FBQUEsSUFDeE4sTUFBTSxZQUFXLFlBQVksTUFBaUIsRUFBRSx1QkFBdUI7QUFBQSxJQUN2RSxJQUFJLE1BQU0sWUFBWSxNQUFNO0FBQUEsTUFDM0IsTUFBTSxXQUFXLE1BQU07QUFBQSxNQUN2QixZQUFZLFdBQVUsVUFBVSxHQUFHLFNBQVMsUUFBUSxPQUFPLE1BQU0sSUFBSSxhQUFhLFlBQVk7QUFBQSxJQUMvRjtBQUFBLElBQ0EsTUFBTSxNQUFNLFVBQVM7QUFBQSxJQUNyQixNQUFNLFVBQVUsVUFBUyxXQUFXO0FBQUEsSUFDcEMsVUFBVSxRQUFRLFdBQVUsV0FBVztBQUFBO0FBQUEsRUFFeEMsU0FBUyxhQUFhLENBQUMsUUFBb0MsT0FBWSxPQUEwQixJQUF3QixhQUEwQixjQUF1QixPQUFPLGVBQWlDLE1BQU07QUFBQSxJQUN2TixNQUFNLE1BQU0sTUFBTTtBQUFBLElBQ2xCLE1BQU0sUUFBUSxNQUFNO0FBQUEsSUFDcEIsTUFBTSxLQUFLLE1BQU07QUFBQSxJQUVqQixLQUFLLGFBQWEsS0FBSyxLQUFLO0FBQUEsSUFFNUIsSUFBSTtBQUFBLElBQ0osSUFBSSxlQUFlLE9BQU8sY0FBYyxlQUFlLFFBQVEsY0FBYztBQUFBLE1BSzVFLElBQUksWUFBeUIsT0FBTztBQUFBLE1BQ3BDLElBQUksb0JBQW9DO0FBQUEsTUFDeEMsT0FBTyxXQUFXO0FBQUEsUUFFakIsSUFBSSxVQUFVLGFBQWEsS0FBSyxDQUFDLGFBQWEsSUFBSSxTQUFTLEdBQUc7QUFBQSxVQUM3RCxNQUFNLGNBQWM7QUFBQSxVQUdwQixNQUFNLGVBQWdCLFlBQW9CLFdBQVcsWUFBWTtBQUFBLFVBQ2pFLElBQUksZ0JBQWdCLGFBQWEsWUFBWSxNQUFNLElBQUksWUFBWSxHQUFHO0FBQUEsWUFFckUsSUFBSSxDQUFDLE1BQU0sWUFBWSxhQUFhLElBQUksTUFBTSxJQUFJO0FBQUEsY0FDakQsVUFBVTtBQUFBLGNBQ1YsYUFBYSxJQUFJLE9BQU87QUFBQSxjQUV4QjtBQUFBLFlBQ0Q7QUFBQSxZQUVBLElBQUksQ0FBQyxtQkFBbUI7QUFBQSxjQUN2QixvQkFBb0I7QUFBQSxZQUNyQjtBQUFBLFVBQ0Q7QUFBQSxRQUNEO0FBQUEsUUFDQSxZQUFZLFVBQVU7QUFBQSxNQUN2QjtBQUFBLE1BR0EsSUFBSSxDQUFDLFdBQVksbUJBQW1CO0FBQUEsUUFDbkMsVUFBVTtBQUFBLFFBQ1YsYUFBYSxJQUFJLE9BQU87QUFBQSxNQUN6QjtBQUFBLE1BRUEsSUFBSSxDQUFDLFNBQVU7QUFBQSxRQUNkLFVBQVUsS0FDVCxLQUFLLFlBQVksTUFBaUIsRUFBRSxnQkFBZ0IsSUFBSSxLQUFLLEVBQUMsR0FBTSxDQUFRLElBQUksWUFBWSxNQUFpQixFQUFFLGdCQUFnQixJQUFJLEdBQUcsSUFDdEksS0FBSyxZQUFZLE1BQWlCLEVBQUUsY0FBYyxLQUFLLEVBQUMsR0FBTSxDQUFRLElBQUksWUFBWSxNQUFpQixFQUFFLGNBQWMsR0FBRztBQUFBLFFBQzNILFVBQVUsUUFBUSxTQUFTLFdBQVc7QUFBQSxNQUN2QztBQUFBLElBQ0QsRUFBTztBQUFBLE1BRU4sVUFBVSxLQUNULEtBQUssWUFBWSxNQUFpQixFQUFFLGdCQUFnQixJQUFJLEtBQUssRUFBQyxHQUFNLENBQVEsSUFBSSxZQUFZLE1BQWlCLEVBQUUsZ0JBQWdCLElBQUksR0FBRyxJQUN0SSxLQUFLLFlBQVksTUFBaUIsRUFBRSxjQUFjLEtBQUssRUFBQyxHQUFNLENBQVEsSUFBSSxZQUFZLE1BQWlCLEVBQUUsY0FBYyxHQUFHO0FBQUEsTUFDM0gsVUFBVSxRQUFRLFNBQVMsV0FBVztBQUFBO0FBQUEsSUFFdkMsTUFBTSxNQUFNO0FBQUEsSUFFWixJQUFJLFNBQVMsTUFBTTtBQUFBLE1BQ2xCLFNBQVMsT0FBTyxPQUFPLEVBQUU7QUFBQSxJQUMxQjtBQUFBLElBRUEsSUFBSSxDQUFDLHdCQUF3QixLQUFLLEdBQUc7QUFBQSxNQUNwQyxJQUFJLE1BQU0sWUFBWSxNQUFNO0FBQUEsUUFDM0IsTUFBTSxXQUFXLE1BQU07QUFBQSxRQUd2QixNQUFNLG9CQUFxQixlQUFlLFFBQVEsYUFBYyxJQUFJLE1BQWM7QUFBQSxRQUNsRixZQUFZLFNBQVMsVUFBVSxHQUFHLFNBQVMsUUFBUSxPQUFPLE1BQU0sSUFBSSxhQUFhLGlCQUFpQjtBQUFBLFFBR2xHLElBQUksZUFBZSxxQkFBcUIsUUFBUSxjQUFjLGtCQUFrQixPQUFPLEdBQUc7QUFBQSxVQUN6RixJQUFJLE9BQW9CLFFBQVE7QUFBQSxVQUNoQyxPQUFPLE1BQU07QUFBQSxZQUNaLE1BQU0sT0FBb0IsS0FBSztBQUFBLFlBQy9CLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEdBQUc7QUFBQSxjQUVqQyxJQUFJLFFBQVEsWUFBWSxRQUFRLFNBQVMsSUFBSSxHQUFHO0FBQUEsZ0JBQy9DLElBQUk7QUFBQSxrQkFDSCxRQUFRLFlBQVksSUFBSTtBQUFBLGtCQUN4QjtBQUFBLGtCQUNDLE9BQU0sR0FBRztBQUFBLGtCQUNWLE1BQU0sUUFBUTtBQUFBLGtCQUVkLElBQUksQ0FBQyxRQUFRLFlBQVksQ0FBQyxRQUFRLFNBQVMsSUFBSSxHQUFHO0FBQUEsb0JBRWpELE9BQU87QUFBQSxvQkFDUDtBQUFBLGtCQUNEO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQSxrQkFDQywwQ0FDQSxPQUNBLFNBQ0EsT0FDQSxFQUFDLFFBQVEsU0FBUyxNQUFNLGNBQWMsa0JBQWlCLENBQ3hEO0FBQUE7QUFBQSxjQUlGO0FBQUEsWUFFRDtBQUFBLFlBQ0EsT0FBTztBQUFBLFVBQ1I7QUFBQSxRQUNEO0FBQUEsUUFDQSxJQUFJLE1BQU0sUUFBUSxZQUFZLFNBQVM7QUFBQSxVQUFNLG1CQUFtQixPQUFPLEtBQUs7QUFBQSxNQUM3RTtBQUFBLElBQ0Q7QUFBQTtBQUFBLEVBRUQsU0FBUyxhQUFhLENBQUMsT0FBWSxPQUEwQixjQUF1QixPQUFPO0FBQUEsSUFDMUYsSUFBSTtBQUFBLElBQ0osSUFBSSxPQUFPLE1BQU0sSUFBSSxTQUFTLFlBQVk7QUFBQSxNQUN6QyxNQUFNLFFBQVEsT0FBTyxPQUFPLE1BQU0sR0FBRztBQUFBLE1BQ3JDLFdBQVcsTUFBTSxNQUFNO0FBQUEsTUFDdkIsSUFBSSxTQUFTLHFCQUFxQjtBQUFBLFFBQU07QUFBQSxNQUN4QyxTQUFTLG9CQUFvQjtBQUFBLElBQzlCLEVBQU87QUFBQSxNQUNOLE1BQU0sUUFBYTtBQUFBLE1BQ25CLFdBQVcsTUFBTTtBQUFBLE1BQ2pCLElBQUksU0FBUyxxQkFBcUI7QUFBQSxRQUFNO0FBQUEsTUFDeEMsU0FBUyxvQkFBb0I7QUFBQSxNQUM3QixNQUFNLFFBQVMsTUFBTSxJQUFJLGFBQWEsUUFBUSxPQUFPLE1BQU0sSUFBSSxVQUFVLFNBQVMsYUFBYyxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLEtBQUs7QUFBQTtBQUFBLElBRXZJLGNBQWMsTUFBTSxPQUFPLE9BQU8sT0FBTyxXQUFXO0FBQUEsSUFDcEQsSUFBSSxNQUFNLFNBQVM7QUFBQSxNQUFNLGNBQWMsTUFBTSxPQUFPLE9BQU8sT0FBTyxXQUFXO0FBQUEsSUFJN0UsSUFBSSxNQUFNLFNBQVMsTUFBTSxPQUFPLENBQUMsYUFBYTtBQUFBLE1BQzNDLFdBQW1CLDRCQUE2QixXQUFtQiw2QkFBNkIsSUFBSTtBQUFBLE1BQ3BHLFdBQW1CLDBCQUEwQixJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUc7QUFBQSxJQUMxRTtBQUFBLElBS0EsSUFBSSxNQUFNLFNBQVMsTUFBTTtBQUFBLE1BQ3hCLG9CQUFvQixNQUFNLEtBQUs7QUFBQSxJQUNoQztBQUFBLElBQ0EsSUFBSTtBQUFBLE1BQ0gsTUFBTSxXQUFXLGNBQU0sVUFBVSxTQUFTLEtBQUssTUFBTSxNQUFNLE1BQU0sS0FBSyxDQUFDO0FBQUEsY0FDdEU7QUFBQSxNQUNELElBQUksTUFBTSxTQUFTLE1BQU07QUFBQSxRQUN4QixzQkFBc0I7QUFBQSxNQUN2QjtBQUFBO0FBQUEsSUFFRCxJQUFJLE1BQU0sYUFBYTtBQUFBLE1BQU8sTUFBTSxNQUFNLHdEQUF3RDtBQUFBLElBQ2xHLFNBQVMsb0JBQW9CO0FBQUE7QUFBQSxFQUU5QixTQUFTLGVBQWUsQ0FBQyxRQUFvQyxPQUFZLE9BQTBCLElBQXdCLGFBQTBCLGNBQXVCLE9BQU8sZUFBaUMsTUFBTTtBQUFBLElBQ3pOLGNBQWMsT0FBTyxPQUFPLFdBQVc7QUFBQSxJQUN2QyxJQUFJLE1BQU0sWUFBWSxNQUFNO0FBQUEsTUFDM0IsV0FBVyxRQUFRLE1BQU0sVUFBVSxPQUFPLElBQUksYUFBYSxhQUFhLFlBQVk7QUFBQSxNQUNwRixNQUFNLE1BQU0sTUFBTSxTQUFTO0FBQUEsTUFDM0IsTUFBTSxVQUFVLE1BQU0sU0FBUztBQUFBLE1BRy9CLElBQUksTUFBTSxTQUFTLE1BQU0sT0FBTyxDQUFDLGFBQWE7QUFBQSxRQUMzQyxXQUFtQixzQkFBdUIsV0FBbUIsdUJBQXVCLElBQUk7QUFBQSxRQUN4RixXQUFtQixvQkFBb0IsSUFBSSxNQUFNLE9BQU8sTUFBTSxHQUFHO0FBQUEsTUFDcEU7QUFBQSxJQUNELEVBQ0s7QUFBQSxNQUNKLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQSxFQUtsQixTQUFTLFdBQVcsQ0FBQyxRQUFvQyxLQUFrQyxRQUFxQyxPQUEwQixhQUEwQixJQUF3QixjQUF1QixPQUFPO0FBQUEsSUFDek8sSUFBSSxRQUFRLFVBQVUsT0FBTyxRQUFRLFVBQVU7QUFBQSxNQUFNO0FBQUEsSUFDaEQsU0FBSSxPQUFPLFFBQVEsSUFBSSxXQUFXO0FBQUEsTUFBRyxZQUFZLFFBQVEsUUFBUyxHQUFHLE9BQVEsUUFBUSxPQUFPLGFBQWEsSUFBSSxXQUFXO0FBQUEsSUFDeEgsU0FBSSxVQUFVLFFBQVEsT0FBTyxXQUFXO0FBQUEsTUFBRyxZQUFZLFFBQVEsS0FBSyxHQUFHLElBQUksTUFBTTtBQUFBLElBQ2pGO0FBQUEsTUFDSixNQUFNLGFBQWEsSUFBSSxNQUFNLFFBQVEsSUFBSSxHQUFJLE9BQU87QUFBQSxNQUNwRCxNQUFNLFVBQVUsT0FBTyxNQUFNLFFBQVEsT0FBTyxHQUFJLE9BQU87QUFBQSxNQUN2RCxJQUFJLFFBQVEsR0FBRyxXQUFXLEdBQUcsR0FBUTtBQUFBLE1BQ3JDLElBQUksZUFBZSxTQUFTO0FBQUEsUUFDM0IsWUFBWSxRQUFRLEtBQUssR0FBRyxJQUFJLE1BQU07QUFBQSxRQUN0QyxZQUFZLFFBQVEsUUFBUSxHQUFHLE9BQU8sUUFBUSxPQUFPLGFBQWEsSUFBSSxXQUFXO0FBQUEsTUFDbEYsRUFBTyxTQUFJLENBQUMsU0FBUztBQUFBLFFBRXBCLE1BQU0sZUFBZSxJQUFJLFNBQVMsT0FBTyxTQUFTLElBQUksU0FBUyxPQUFPO0FBQUEsUUFJdEUsT0FBTyxXQUFXLElBQUksVUFBVSxJQUFJLGFBQWE7QUFBQSxVQUFNO0FBQUEsUUFDdkQsT0FBTyxRQUFRLE9BQU8sVUFBVSxPQUFPLFVBQVU7QUFBQSxVQUFNO0FBQUEsUUFDdkQsUUFBUSxRQUFRLFdBQVcsUUFBUTtBQUFBLFFBQ25DLE1BQU8sUUFBUSxjQUFjLFNBQVM7QUFBQSxVQUNyQyxJQUFJLElBQUk7QUFBQSxVQUNSLElBQUksT0FBTztBQUFBLFVBQ1gsSUFBSSxNQUFNLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFBQSxZQUFNO0FBQUEsVUFDbEMsU0FBSSxLQUFLO0FBQUEsWUFBTSxXQUFXLFFBQVEsR0FBRyxPQUFPLElBQUksZUFBZSxLQUFLLFFBQVEsR0FBRyxJQUFJLFFBQVEsV0FBVyxHQUFHLFdBQVc7QUFBQSxVQUNwSCxTQUFJLEtBQUs7QUFBQSxZQUFNLFdBQVcsUUFBUSxDQUFDO0FBQUEsVUFDbkM7QUFBQSx1QkFBVyxRQUFRLEdBQUcsR0FBRyxPQUFPLGVBQWUsS0FBSyxRQUFRLEdBQUcsSUFBSSxRQUFRLFdBQVcsR0FBRyxJQUFJLFdBQVc7QUFBQSxRQUM5RztBQUFBLFFBQ0EsSUFBSSxJQUFJLFNBQVM7QUFBQSxVQUFjLFlBQVksUUFBUSxLQUFLLE9BQU8sSUFBSSxNQUFNO0FBQUEsUUFDekUsSUFBSSxPQUFPLFNBQVM7QUFBQSxVQUFjLFlBQVksUUFBUSxRQUFRLE9BQU8sT0FBTyxRQUFRLE9BQU8sYUFBYSxJQUFJLFdBQVc7QUFBQSxNQUN4SCxFQUFPO0FBQUEsUUFFTixJQUFJLFNBQVMsSUFBSSxTQUFTLEdBQUcsTUFBTSxPQUFPLFNBQVMsR0FBRyxJQUFTLElBQVM7QUFBQSxRQUd4RSxPQUFPLFVBQVUsWUFBWSxPQUFPLE9BQU87QUFBQSxVQUMxQyxLQUFLLElBQUk7QUFBQSxVQUNULEtBQUssT0FBTztBQUFBLFVBQ1osSUFBSSxNQUFNLFFBQVEsTUFBTSxRQUFRLEdBQUcsUUFBUSxHQUFHO0FBQUEsWUFBSztBQUFBLFVBQ25ELElBQUksT0FBTztBQUFBLFlBQUksV0FBVyxRQUFRLElBQUksSUFBSSxPQUFPLGFBQWEsSUFBSSxXQUFXO0FBQUEsVUFDN0UsSUFBSSxHQUFHLE9BQU87QUFBQSxZQUFNLGNBQWMsR0FBRztBQUFBLFVBQ3JDLFVBQVU7QUFBQSxRQUNYO0FBQUEsUUFFQSxPQUFPLFVBQVUsWUFBWSxPQUFPLE9BQU87QUFBQSxVQUMxQyxJQUFJLElBQUk7QUFBQSxVQUNSLElBQUksT0FBTztBQUFBLFVBQ1gsSUFBSSxLQUFLLFFBQVEsS0FBSyxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQUEsWUFBSztBQUFBLFVBQy9DLFlBQVk7QUFBQSxVQUNaLElBQUksTUFBTTtBQUFBLFlBQUcsV0FBVyxRQUFRLEdBQUcsR0FBRyxPQUFPLGVBQWUsS0FBSyxVQUFVLFNBQVMsR0FBRyxXQUFXLEdBQUcsSUFBSSxXQUFXO0FBQUEsUUFDckg7QUFBQSxRQUVBLE9BQU8sVUFBVSxZQUFZLE9BQU8sT0FBTztBQUFBLFVBQzFDLElBQUksVUFBVTtBQUFBLFlBQUs7QUFBQSxVQUNuQixJQUFJLElBQUk7QUFBQSxVQUNSLEtBQUssT0FBTztBQUFBLFVBQ1osS0FBSyxJQUFJO0FBQUEsVUFDVCxJQUFJLE9BQU87QUFBQSxVQUNYLElBQUksS0FBSyxRQUFRLE1BQU0sUUFBUSxNQUFNLFFBQVEsS0FBSyxRQUFRLEVBQUUsUUFBUSxHQUFHLE9BQU8sR0FBRyxRQUFRLEVBQUU7QUFBQSxZQUFLO0FBQUEsVUFDaEcsYUFBYSxlQUFlLEtBQUssVUFBVSxRQUFRLFdBQVc7QUFBQSxVQUM5RCxRQUFRLFFBQVEsSUFBSSxVQUFVO0FBQUEsVUFDOUIsSUFBSSxPQUFPO0FBQUEsWUFBRyxXQUFXLFFBQVEsSUFBSSxHQUFHLE9BQU8sWUFBWSxJQUFJLFdBQVc7QUFBQSxVQUMxRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQUEsWUFBSyxRQUFRLFFBQVEsR0FBRyxXQUFXO0FBQUEsVUFDcEQsSUFBSSxNQUFNO0FBQUEsWUFBSSxXQUFXLFFBQVEsR0FBRyxJQUFJLE9BQU8sYUFBYSxJQUFJLFdBQVc7QUFBQSxVQUMzRSxJQUFJLEdBQUcsT0FBTztBQUFBLFlBQU0sY0FBYyxHQUFHO0FBQUEsVUFDckM7QUFBQSxVQUFZO0FBQUEsVUFDWixLQUFLLElBQUk7QUFBQSxVQUNULEtBQUssT0FBTztBQUFBLFVBQ1osSUFBSSxJQUFJO0FBQUEsVUFDUixJQUFJLE9BQU87QUFBQSxRQUNaO0FBQUEsUUFFQSxPQUFPLFVBQVUsWUFBWSxPQUFPLE9BQU87QUFBQSxVQUMxQyxLQUFLLElBQUk7QUFBQSxVQUNULEtBQUssT0FBTztBQUFBLFVBQ1osSUFBSSxNQUFNLFFBQVEsTUFBTSxRQUFRLEdBQUcsUUFBUSxHQUFHO0FBQUEsWUFBSztBQUFBLFVBQ25ELElBQUksT0FBTztBQUFBLFlBQUksV0FBVyxRQUFRLElBQUksSUFBSSxPQUFPLGFBQWEsSUFBSSxXQUFXO0FBQUEsVUFDN0UsSUFBSSxHQUFHLE9BQU87QUFBQSxZQUFNLGNBQWMsR0FBRztBQUFBLFVBQ3JDLFVBQVU7QUFBQSxVQUNWLEtBQUssSUFBSTtBQUFBLFVBQ1QsS0FBSyxPQUFPO0FBQUEsUUFDYjtBQUFBLFFBQ0EsSUFBSSxRQUFRO0FBQUEsVUFBSyxZQUFZLFFBQVEsS0FBSyxVQUFVLFNBQVMsQ0FBQztBQUFBLFFBQ3pELFNBQUksV0FBVztBQUFBLFVBQVEsWUFBWSxRQUFRLFFBQVEsT0FBTyxNQUFNLEdBQUcsT0FBTyxhQUFhLElBQUksV0FBVztBQUFBLFFBQ3RHO0FBQUEsVUFFSixNQUFNLHNCQUFzQjtBQUFBLFVBQzVCLElBQUksTUFBTSxZQUFZLFVBQVU7QUFBQSxVQUNoQyxNQUFNLGFBQWEsSUFBSSxNQUFNLE1BQU0sUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFO0FBQUEsVUFDckQsTUFBTSxNQUE4QixPQUFPLE9BQU8sSUFBSTtBQUFBLFVBQ3RELFNBQVMsSUFBSSxNQUFPLEtBQUssS0FBSyxLQUFLO0FBQUEsWUFDbEMsSUFBSSxPQUFPLE1BQU07QUFBQSxjQUFNLElBQUksT0FBTyxHQUFJLE9BQVE7QUFBQSxVQUMvQztBQUFBLFVBQ0EsU0FBUyxJQUFJLE9BQVEsS0FBSyxVQUFVLEtBQUs7QUFBQSxZQUN4QyxLQUFLLElBQUk7QUFBQSxZQUNULElBQUksTUFBTTtBQUFBLGNBQU07QUFBQSxZQUNoQixNQUFNLFdBQVcsSUFBSSxHQUFHO0FBQUEsWUFDeEIsSUFBSSxZQUFZLE1BQU07QUFBQSxjQUNyQixNQUFPLFdBQVcsTUFBTyxXQUFXO0FBQUEsY0FDcEMsV0FBVyxXQUFXLFNBQVM7QUFBQSxjQUMvQixLQUFLLE9BQU87QUFBQSxjQUNaLElBQUksS0FBSztBQUFBLGNBQ1QsSUFBSSxPQUFPO0FBQUEsZ0JBQUksV0FBVyxRQUFRLElBQUksSUFBSSxPQUFPLGFBQWEsSUFBSSxXQUFXO0FBQUEsY0FDN0UsSUFBSSxNQUFNLFFBQVEsR0FBRyxPQUFPO0FBQUEsZ0JBQU0sY0FBYyxHQUFHO0FBQUEsY0FDbkQ7QUFBQSxZQUNEO0FBQUEsVUFDRDtBQUFBLFVBQ0EsY0FBYztBQUFBLFVBQ2QsSUFBSSxZQUFZLFNBQVMsV0FBVztBQUFBLFlBQUcsWUFBWSxRQUFRLEtBQUssVUFBVSxTQUFTLENBQUM7QUFBQSxVQUNwRixJQUFJLFlBQVk7QUFBQSxZQUFHLFlBQVksUUFBUSxRQUFRLE9BQU8sTUFBTSxHQUFHLE9BQU8sYUFBYSxJQUFJLFdBQVc7QUFBQSxVQUM3RjtBQUFBLFlBQ0osSUFBSSxRQUFRLElBQUk7QUFBQSxjQUdmLE1BQU0sYUFBYSxlQUFlLFVBQVU7QUFBQSxjQUM1QyxJQUFJLEtBQUssV0FBVyxTQUFTO0FBQUEsY0FDN0IsU0FBUyxJQUFJLElBQUssS0FBSyxPQUFPLEtBQUs7QUFBQSxnQkFDbEMsS0FBSyxPQUFPO0FBQUEsZ0JBQ1osSUFBSSxNQUFNO0FBQUEsa0JBQU07QUFBQSxnQkFDaEIsSUFBSSxXQUFXLElBQUksV0FBVztBQUFBLGtCQUFJLFdBQVcsUUFBUSxJQUFJLE9BQU8sSUFBSSxhQUFhLFdBQVc7QUFBQSxnQkFDdkY7QUFBQSxrQkFDSixJQUFJLFdBQVcsUUFBUSxJQUFJO0FBQUEsb0JBQU87QUFBQSxrQkFDN0I7QUFBQSw0QkFBUSxRQUFRLElBQUksV0FBVztBQUFBO0FBQUEsZ0JBRXJDLElBQUksR0FBRyxPQUFPO0FBQUEsa0JBQU0sY0FBYyxHQUFHO0FBQUEsY0FDdEM7QUFBQSxZQUNELEVBQU87QUFBQSxjQUNOLFNBQVMsSUFBSSxJQUFLLEtBQUssT0FBTyxLQUFLO0FBQUEsZ0JBQ2xDLEtBQUssT0FBTztBQUFBLGdCQUNaLElBQUksTUFBTTtBQUFBLGtCQUFNO0FBQUEsZ0JBQ2hCLElBQUksV0FBVyxJQUFJLFdBQVc7QUFBQSxrQkFBSSxXQUFXLFFBQVEsSUFBSSxPQUFPLElBQUksYUFBYSxXQUFXO0FBQUEsZ0JBQzVGLElBQUksR0FBRyxPQUFPO0FBQUEsa0JBQU0sY0FBYyxHQUFHO0FBQUEsY0FDdEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9OLFNBQVMsVUFBVSxDQUFDLFFBQW9DLEtBQVUsT0FBWSxPQUEwQixhQUEwQixJQUF3QixjQUF1QixPQUFPO0FBQUEsSUFDdkwsTUFBTSxTQUFTLElBQUksS0FBSyxNQUFNLE1BQU07QUFBQSxJQUNwQyxJQUFJLFdBQVcsT0FBTyxJQUFJLE9BQU8sTUFBTSxJQUFJO0FBQUEsTUFDMUMsTUFBTSxRQUFRLElBQUk7QUFBQSxNQUNsQixNQUFNLFNBQVMsSUFBSTtBQUFBLE1BQ25CLElBQUksZ0JBQWdCLE9BQU8sR0FBRztBQUFBLFFBQUc7QUFBQSxNQUNqQyxJQUFJLE9BQU8sV0FBVyxVQUFVO0FBQUEsUUFDL0IsSUFBSSxNQUFNLFNBQVMsTUFBTTtBQUFBLFVBQ3hCLGdCQUFnQixNQUFNLE9BQU8sT0FBTyxLQUFLO0FBQUEsUUFDMUM7QUFBQSxRQUNBLFFBQVE7QUFBQSxlQUNGO0FBQUEsWUFBSyxXQUFXLEtBQUssS0FBSztBQUFBLFlBQUc7QUFBQSxlQUM3QjtBQUFBLFlBQUssV0FBVyxRQUFRLEtBQUssT0FBTyxJQUFJLFdBQVc7QUFBQSxZQUFHO0FBQUEsZUFDdEQ7QUFBQSxZQUFLLGVBQWUsUUFBUSxLQUFLLE9BQU8sT0FBTyxhQUFhLElBQUksV0FBVztBQUFBLFlBQUc7QUFBQTtBQUFBLFlBQzFFLGNBQWMsS0FBSyxPQUFPLE9BQU8sSUFBSSxXQUFXO0FBQUE7QUFBQSxNQUUzRCxFQUNLO0FBQUEsd0JBQWdCLFFBQVEsS0FBSyxPQUFPLE9BQU8sYUFBYSxJQUFJLFdBQVc7QUFBQSxJQUM3RSxFQUNLO0FBQUEsTUFDSixXQUFXLFFBQVEsS0FBSyxLQUFLO0FBQUEsTUFDN0IsV0FBVyxRQUFRLE9BQU8sT0FBTyxJQUFJLGFBQWEsV0FBVztBQUFBO0FBQUE7QUFBQSxFQUcvRCxTQUFTLFVBQVUsQ0FBQyxLQUFVLE9BQVk7QUFBQSxJQUN6QyxJQUFJLElBQUksU0FBUyxTQUFTLE1BQU0sTUFBTSxTQUFTLFNBQVMsR0FBRztBQUFBLE1BQzFELElBQUksSUFBSSxZQUFZLE1BQU07QUFBQSxJQUMzQjtBQUFBLElBQ0EsTUFBTSxNQUFNLElBQUk7QUFBQTtBQUFBLEVBRWpCLFNBQVMsVUFBVSxDQUFDLFFBQW9DLEtBQVUsT0FBWSxJQUF3QixhQUEwQjtBQUFBLElBQy9ILElBQUksSUFBSSxhQUFhLE1BQU0sVUFBVTtBQUFBLE1BQ3BDLFVBQVUsUUFBUSxHQUFHO0FBQUEsTUFDckIsV0FBVyxRQUFRLE9BQU8sSUFBSSxXQUFXO0FBQUEsSUFDMUMsRUFDSztBQUFBLE1BQ0osTUFBTSxNQUFNLElBQUk7QUFBQSxNQUNoQixNQUFNLFVBQVUsSUFBSTtBQUFBO0FBQUE7QUFBQSxFQUd0QixTQUFTLGNBQWMsQ0FBQyxRQUFvQyxLQUFVLE9BQVksT0FBMEIsYUFBMEIsSUFBd0IsY0FBdUIsT0FBTztBQUFBLElBQzNMLFlBQVksUUFBUSxJQUFJLFVBQVUsTUFBTSxVQUFVLE9BQU8sYUFBYSxJQUFJLFdBQVc7QUFBQSxJQUNyRixJQUFJLFVBQVU7QUFBQSxJQUNkLE1BQU0sV0FBVyxNQUFNO0FBQUEsSUFDdkIsTUFBTSxNQUFNO0FBQUEsSUFDWixJQUFJLFlBQVksTUFBTTtBQUFBLE1BQ3JCLFNBQVMsSUFBSSxFQUFHLElBQUksU0FBUyxRQUFRLEtBQUs7QUFBQSxRQUN6QyxNQUFNLFFBQVEsU0FBUztBQUFBLFFBQ3ZCLElBQUksU0FBUyxRQUFRLE1BQU0sT0FBTyxNQUFNO0FBQUEsVUFDdkMsSUFBSSxNQUFNLE9BQU87QUFBQSxZQUFNLE1BQU0sTUFBTSxNQUFNO0FBQUEsVUFDekMsV0FBVyxNQUFNLFdBQVc7QUFBQSxRQUM3QjtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsSUFDQSxNQUFNLFVBQVU7QUFBQTtBQUFBLEVBRWpCLFNBQVMsYUFBYSxDQUFDLEtBQVUsT0FBWSxPQUEwQixJQUF3QixjQUF1QixPQUFPO0FBQUEsSUFDNUgsTUFBTSxVQUFVLE1BQU0sTUFBTSxJQUFJO0FBQUEsSUFDaEMsS0FBSyxhQUFhLEtBQUssS0FBSztBQUFBLElBRTVCLElBQUksSUFBSSxTQUFTLE1BQU0sU0FBVSxNQUFNLFNBQVMsUUFBUSxDQUFDLCtCQUF1QixJQUFJLE1BQU0sS0FBSyxHQUFJO0FBQUEsTUFDbEcsWUFBWSxPQUFPLElBQUksT0FBTyxNQUFNLE9BQU8sRUFBRTtBQUFBLElBQzlDO0FBQUEsSUFDQSxJQUFJLENBQUMsd0JBQXdCLEtBQUssR0FBRztBQUFBLE1BQ3BDLFlBQVksU0FBUyxJQUFJLFVBQVUsTUFBTSxVQUFVLE9BQU8sTUFBTSxJQUFJLFdBQVc7QUFBQSxJQUNoRjtBQUFBO0FBQUEsRUFFRCxTQUFTLGVBQWUsQ0FBQyxRQUFvQyxLQUFVLE9BQVksT0FBMEIsYUFBMEIsSUFBd0IsY0FBdUIsT0FBTztBQUFBLElBRzVMLElBQUksTUFBTSxTQUFTLE1BQU0sT0FBTyxDQUFDLGFBQWE7QUFBQSxNQUMzQyxXQUFtQiw0QkFBNkIsV0FBbUIsNkJBQTZCLElBQUk7QUFBQSxNQUNwRyxXQUFtQiwwQkFBMEIsSUFBSSxNQUFNLE9BQU8sTUFBTSxHQUFHO0FBQUEsSUFDMUU7QUFBQSxJQUtBLElBQUksTUFBTSxTQUFTLE1BQU07QUFBQSxNQUN4QixvQkFBb0IsTUFBTSxLQUFLO0FBQUEsSUFDaEM7QUFBQSxJQUNBLElBQUk7QUFBQSxNQUNILE1BQU0sV0FBVyxjQUFNLFVBQVUsU0FBUyxLQUFLLE1BQU0sTUFBTSxNQUFNLEtBQUssQ0FBQztBQUFBLGNBQ3RFO0FBQUEsTUFDRCxJQUFJLE1BQU0sU0FBUyxNQUFNO0FBQUEsUUFDeEIsc0JBQXNCO0FBQUEsTUFDdkI7QUFBQTtBQUFBLElBRUQsSUFBSSxNQUFNLGFBQWE7QUFBQSxNQUFPLE1BQU0sTUFBTSx3REFBd0Q7QUFBQSxJQUNsRyxnQkFBZ0IsTUFBTSxPQUFPLE9BQU8sS0FBSztBQUFBLElBQ3pDLElBQUksTUFBTSxTQUFTO0FBQUEsTUFBTSxnQkFBZ0IsTUFBTSxPQUFPLE9BQU8sS0FBSztBQUFBLElBQ2xFLElBQUksTUFBTSxZQUFZLE1BQU07QUFBQSxNQUMzQixJQUFJLElBQUksWUFBWTtBQUFBLFFBQU0sV0FBVyxRQUFRLE1BQU0sVUFBVSxPQUFPLElBQUksYUFBYSxXQUFXO0FBQUEsTUFDM0Y7QUFBQSxtQkFBVyxRQUFRLElBQUksVUFBVSxNQUFNLFVBQVUsT0FBTyxhQUFhLElBQUksV0FBVztBQUFBLE1BQ3pGLE1BQU0sTUFBTSxNQUFNLFNBQVM7QUFBQSxNQUMzQixNQUFNLFVBQVUsTUFBTSxTQUFTO0FBQUEsTUFHL0IsSUFBSSxNQUFNLFNBQVMsTUFBTSxPQUFPLENBQUMsYUFBYTtBQUFBLFFBQzNDLFdBQW1CLHNCQUF1QixXQUFtQix1QkFBdUIsSUFBSTtBQUFBLFFBQ3hGLFdBQW1CLG9CQUFvQixJQUFJLE1BQU0sT0FBTyxNQUFNLEdBQUc7QUFBQSxNQUNwRTtBQUFBLElBQ0QsRUFDSztBQUFBLE1BQ0osSUFBSSxJQUFJLFlBQVk7QUFBQSxRQUFNLFdBQVcsUUFBUSxJQUFJLFFBQVE7QUFBQSxNQUN6RCxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUEsRUFRbEIsTUFBTSxVQUFvQixDQUFDO0FBQUEsRUFDM0IsU0FBUyxjQUFjLENBQUMsR0FBdUI7QUFBQSxJQUM5QyxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsSUFDakIsSUFBSSxJQUFJLEdBQUcsSUFBSTtBQUFBLElBQ2YsTUFBTSxLQUFLLFFBQVEsU0FBUyxFQUFFO0FBQUEsSUFDOUIsU0FBUyxJQUFJLEVBQUcsSUFBSSxJQUFJO0FBQUEsTUFBSyxRQUFRLEtBQUssRUFBRTtBQUFBLElBQzVDLFNBQVMsSUFBSSxFQUFHLElBQUksSUFBSSxFQUFFLEdBQUc7QUFBQSxNQUM1QixJQUFJLEVBQUUsT0FBTztBQUFBLFFBQUk7QUFBQSxNQUNqQixNQUFNLElBQUksT0FBTyxPQUFPLFNBQVM7QUFBQSxNQUNqQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUk7QUFBQSxRQUNoQixRQUFRLEtBQUs7QUFBQSxRQUNiLE9BQU8sS0FBSyxDQUFDO0FBQUEsUUFDYjtBQUFBLE1BQ0Q7QUFBQSxNQUNBLElBQUk7QUFBQSxNQUNKLElBQUksT0FBTyxTQUFTO0FBQUEsTUFDcEIsT0FBTyxJQUFJLEdBQUc7QUFBQSxRQUdiLE1BQU0sS0FBSyxNQUFNLE1BQU0sTUFBTSxNQUFNLElBQUksSUFBSTtBQUFBLFFBQzNDLElBQUksRUFBRSxPQUFPLE1BQU0sRUFBRSxJQUFJO0FBQUEsVUFDeEIsSUFBSSxJQUFJO0FBQUEsUUFDVCxFQUNLO0FBQUEsVUFDSixJQUFJO0FBQUE7QUFBQSxNQUVOO0FBQUEsTUFDQSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sS0FBSztBQUFBLFFBQ3hCLElBQUksSUFBSTtBQUFBLFVBQUcsUUFBUSxLQUFLLE9BQU8sSUFBSTtBQUFBLFFBQ25DLE9BQU8sS0FBSztBQUFBLE1BQ2I7QUFBQSxJQUNEO0FBQUEsSUFDQSxJQUFJLE9BQU87QUFBQSxJQUNYLElBQUksT0FBTyxJQUFJO0FBQUEsSUFDZixPQUFPLE1BQU0sR0FBRztBQUFBLE1BQ2YsT0FBTyxLQUFLO0FBQUEsTUFDWixJQUFJLFFBQVE7QUFBQSxJQUNiO0FBQUEsSUFDQSxRQUFRLFNBQVM7QUFBQSxJQUNqQixPQUFPO0FBQUE7QUFBQSxFQUdSLFNBQVMsY0FBYyxDQUFDLFFBQThCLEdBQVcsS0FBYSxhQUF1QztBQUFBLElBQ3BILE1BQU8sSUFBSSxLQUFLLEtBQUs7QUFBQSxNQUNwQixJQUFJLE9BQU8sTUFBTSxRQUFRLE9BQU8sR0FBSSxPQUFPO0FBQUEsUUFBTSxPQUFPLE9BQU8sR0FBSTtBQUFBLElBQ3BFO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUlSLFNBQVMsT0FBTyxDQUFDLFFBQW9DLE9BQVksYUFBMEI7QUFBQSxJQUMxRixJQUFJLE1BQU0sT0FBTyxNQUFNO0FBQUEsTUFDdEIsSUFBSTtBQUFBLE1BQ0osSUFBSSxNQUFNLFdBQVcsUUFBUSxNQUFNLFlBQVksR0FBRztBQUFBLFFBRWpELFNBQVMsTUFBTTtBQUFBLE1BQ2hCLEVBQU87QUFBQSxRQUNOLFNBQVMsWUFBWSxNQUFpQixFQUFFLHVCQUF1QjtBQUFBLFFBQy9ELFdBQVcsT0FBTyxlQUFPLEtBQUs7QUFBQSxVQUFHLE9BQU8sWUFBWSxHQUFHO0FBQUE7QUFBQSxNQUV4RCxVQUFVLFFBQVEsUUFBUSxXQUFXO0FBQUEsSUFDdEM7QUFBQTtBQUFBLEVBR0QsU0FBUyxTQUFTLENBQUMsUUFBb0MsS0FBVyxhQUEwQjtBQUFBLElBQzNGLElBQUksZUFBZTtBQUFBLE1BQU0sT0FBTyxhQUFhLEtBQUssV0FBVztBQUFBLElBQ3hEO0FBQUEsYUFBTyxZQUFZLEdBQUc7QUFBQTtBQUFBLEVBRzVCLFNBQVMsdUJBQXVCLENBQUMsT0FBcUI7QUFBQSxJQUNyRCxJQUFJLE1BQU0sU0FBUyxRQUNsQixNQUFNLE1BQU0sbUJBQW1CLFFBQy9CLE1BQU0sTUFBTSxtQkFBbUI7QUFBQSxNQUM3QixPQUFPO0FBQUEsSUFDVixNQUFNLFdBQVcsTUFBTTtBQUFBLElBQ3ZCLElBQUksWUFBWSxRQUFRLFNBQVMsV0FBVyxLQUFLLFNBQVMsR0FBRyxRQUFRLEtBQUs7QUFBQSxNQUN6RSxNQUFNLFVBQVUsU0FBUyxHQUFHO0FBQUEsTUFDNUIsSUFBSSxNQUFNLElBQUksY0FBYztBQUFBLFFBQVMsTUFBTSxJQUFJLFlBQVk7QUFBQSxJQUM1RCxFQUNLLFNBQUksWUFBWSxRQUFRLFNBQVMsV0FBVztBQUFBLE1BQUcsTUFBTSxJQUFJLE1BQU0sa0RBQWtEO0FBQUEsSUFDdEgsT0FBTztBQUFBO0FBQUEsRUFJUixTQUFTLFdBQVcsQ0FBQyxRQUFvQyxRQUE4QixPQUFlLEtBQWE7QUFBQSxJQUNsSCxTQUFTLElBQUksTUFBTyxJQUFJLEtBQUssS0FBSztBQUFBLE1BQ2pDLE1BQU0sUUFBUSxPQUFPO0FBQUEsTUFDckIsSUFBSSxTQUFTO0FBQUEsUUFBTSxXQUFXLFFBQVEsS0FBSztBQUFBLElBQzVDO0FBQUE7QUFBQSxFQUVELFNBQVMsY0FBYyxDQUFDLFFBQW9DLE9BQVksUUFBYSxTQUFzQjtBQUFBLElBQzFHLE1BQU0sV0FBVyxNQUFNO0FBQUEsSUFDdkIsTUFBTSxTQUFTLFNBQVMsS0FBSyxPQUFPLGdCQUFnQixLQUFLO0FBQUEsSUFDekQsSUFBSSxVQUFVO0FBQUEsTUFBTTtBQUFBLElBRXBCLE1BQU0sYUFBYTtBQUFBLElBQ25CLFdBQVcsT0FBTyxlQUFPLEtBQUs7QUFBQSxNQUFHLHVCQUFlLElBQUksS0FBSyxVQUFVO0FBQUEsSUFDbkUsUUFBUTtBQUFBLElBRVIsUUFBUSxRQUFRLE1BQU0sRUFBRSxRQUFRLFFBQVEsR0FBRztBQUFBLE1BQzFDLFdBQVcsT0FBTyxRQUFRO0FBQUEsTUFDMUIsZ0JBQWdCLFFBQVEsT0FBTyxPQUFPO0FBQUEsS0FDdEM7QUFBQTtBQUFBLEVBRUYsU0FBUyxlQUFlLENBQUMsUUFBb0MsT0FBWSxTQUFzQixVQUFnQjtBQUFBLElBQzlHLElBQUksRUFBRSxRQUFRLE1BQU0sR0FBRztBQUFBLE1BQ3RCLFNBQVMsS0FBSztBQUFBLE1BQ2QsVUFBVSxRQUFRLE9BQU8sUUFBUTtBQUFBLElBQ2xDO0FBQUE7QUFBQSxFQUVELFNBQVMsVUFBVSxDQUFDLFFBQW9DLE9BQVksVUFBZ0I7QUFBQSxJQUNuRixNQUFNLFVBQVUsRUFBQyxHQUFHLEVBQUM7QUFBQSxJQUNyQixJQUFJLE9BQU8sTUFBTSxRQUFRLFlBQVksT0FBTyxNQUFNLE1BQU0sbUJBQW1CO0FBQUEsTUFBWSxlQUFlLFFBQVEsT0FBTyxNQUFNLE9BQU8sT0FBTztBQUFBLElBQ3pJLElBQUksTUFBTSxTQUFTLE9BQU8sTUFBTSxNQUFNLG1CQUFtQjtBQUFBLE1BQVksZUFBZSxRQUFRLE9BQU8sTUFBTSxPQUFPLE9BQU87QUFBQSxJQUN2SCxnQkFBZ0IsUUFBUSxPQUFPLFNBQVMsUUFBUTtBQUFBO0FBQUEsRUFFakQsU0FBUyxTQUFTLENBQUMsUUFBb0MsT0FBWSxVQUFnQjtBQUFBLElBQ2xGLElBQUksTUFBTSxPQUFPO0FBQUEsTUFBTTtBQUFBLElBQ3ZCLElBQUksTUFBTSxXQUFXLFFBQVEsTUFBTSxZQUFZLEdBQUc7QUFBQSxNQUVqRCxNQUFNLE9BQU8sTUFBTTtBQUFBLE1BQ25CLElBQUksT0FBTyxZQUFZLE9BQU8sU0FBUyxJQUFJLEdBQUc7QUFBQSxRQUU3QyxJQUFJO0FBQUEsVUFDSCxPQUFPLFlBQVksSUFBSTtBQUFBLFVBQ3RCLE9BQU0sR0FBRztBQUFBLFVBQ1YsTUFBTSxRQUFRO0FBQUEsVUFFZCxJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsT0FBTyxTQUFTLElBQUksR0FBRztBQUFBLFlBRS9DO0FBQUEsVUFDRDtBQUFBLFVBQ0Esa0JBQ0MsMkJBQ0EsT0FDQSxrQkFBa0IsVUFBVSxTQUFTLE1BQ3JDLE9BQ0EsRUFBQyxRQUFRLGtCQUFrQixVQUFVLFNBQVMsV0FBVyxNQUFNLE1BQU0sS0FBSyxVQUFVLE9BQU8sU0FBa0IsQ0FDOUc7QUFBQTtBQUFBLE1BSUY7QUFBQSxJQUVELEVBQU87QUFBQSxNQUNOLFdBQVcsT0FBTyxlQUFPLEtBQUssR0FBRztBQUFBLFFBRWhDLElBQUksT0FBTyxZQUFZLE9BQU8sU0FBUyxHQUFHLEdBQUc7QUFBQSxVQUM1QyxJQUFJO0FBQUEsWUFDSCxPQUFPLFlBQVksR0FBRztBQUFBLFlBQ3JCLE9BQU0sR0FBRztBQUFBLFlBQ1YsTUFBTSxRQUFRO0FBQUEsWUFFZCxJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsT0FBTyxTQUFTLEdBQUcsR0FBRztBQUFBLGNBRTlDO0FBQUEsWUFDRDtBQUFBLFlBQ0Esa0JBQ0MsOEJBQ0EsT0FDQSxrQkFBa0IsVUFBVSxTQUFTLE1BQ3JDLE9BQ0EsRUFBQyxRQUFRLGtCQUFrQixVQUFVLFNBQVMsV0FBVyxNQUFNLEtBQUssVUFBVSxPQUFPLFNBQWtCLENBQ3hHO0FBQUE7QUFBQSxRQUlGO0FBQUEsTUFFRDtBQUFBO0FBQUE7QUFBQSxFQUlGLFNBQVMsUUFBUSxDQUFDLE9BQVk7QUFBQSxJQUU3QixJQUFJLE9BQU8sTUFBTSxRQUFRLFlBQVksTUFBTSxTQUFTLE1BQU07QUFBQSxNQUN6RCwyQkFBMkIsTUFBTSxLQUFLO0FBQUEsSUFDdkM7QUFBQSxJQUNBLElBQUksT0FBTyxNQUFNLFFBQVEsWUFBWSxPQUFPLE1BQU0sTUFBTSxhQUFhO0FBQUEsTUFBWSxTQUFTLEtBQUssTUFBTSxNQUFNLFVBQVUsS0FBSztBQUFBLElBQzFILElBQUksTUFBTSxTQUFTLE9BQU8sTUFBTSxNQUFNLGFBQWE7QUFBQSxNQUFZLFNBQVMsS0FBSyxNQUFNLE1BQU0sVUFBVSxLQUFLO0FBQUEsSUFDeEcsSUFBSSxPQUFPLE1BQU0sUUFBUSxVQUFVO0FBQUEsTUFDbEMsSUFBSSxNQUFNLFlBQVk7QUFBQSxRQUFNLFNBQVMsTUFBTSxRQUFRO0FBQUEsSUFDcEQsRUFBTztBQUFBLE1BQ04sSUFBSSxNQUFNLFVBQVU7QUFBQSxRQUFNLE1BQU0sT0FBTyxJQUFJO0FBQUEsTUFDM0MsTUFBTSxXQUFXLE1BQU07QUFBQSxNQUN2QixJQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFBQSxRQUM1QixTQUFTLElBQUksRUFBRyxJQUFJLFNBQVMsUUFBUSxLQUFLO0FBQUEsVUFDekMsTUFBTSxRQUFRLFNBQVM7QUFBQSxVQUN2QixJQUFJLFNBQVM7QUFBQSxZQUFNLFNBQVMsS0FBSztBQUFBLFFBQ2xDO0FBQUEsTUFDRDtBQUFBO0FBQUE7QUFBQSxFQUtGLFNBQVMsUUFBUSxDQUFDLE9BQVksT0FBNEIsSUFBd0I7QUFBQSxJQUNqRixXQUFXLE9BQU8sT0FBTztBQUFBLE1BQ3hCLFFBQVEsT0FBTyxLQUFLLE1BQU0sTUFBTSxNQUFNLEVBQUU7QUFBQSxJQUN6QztBQUFBO0FBQUEsRUFFRCxTQUFTLE9BQU8sQ0FBQyxPQUFZLEtBQWEsS0FBVSxPQUFZLElBQXdCO0FBQUEsSUFDdkYsSUFBSSxRQUFRLFNBQVMsU0FBUyxRQUFRLGtCQUFrQixHQUFHLEtBQU0sUUFBUSxTQUFTLENBQUMsZ0JBQWdCLE9BQU8sR0FBRyxLQUFNLE9BQU8sVUFBVTtBQUFBLE1BQVU7QUFBQSxJQUM5SSxJQUFJLElBQUksT0FBTyxPQUFPLElBQUksT0FBTztBQUFBLE1BQUssT0FBTyxZQUFZLE9BQU8sS0FBSyxLQUFLO0FBQUEsSUFDMUUsSUFBSSxJQUFJLE1BQU0sR0FBRyxDQUFDLE1BQU07QUFBQSxNQUFVLE1BQU0sSUFBSSxlQUFlLGdDQUFnQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEtBQUs7QUFBQSxJQUN6RyxTQUFJLFFBQVE7QUFBQSxNQUFTLFlBQVksTUFBTSxLQUFLLEtBQUssS0FBSztBQUFBLElBQ3RELFNBQUksZUFBZSxPQUFPLEtBQUssRUFBRSxHQUFHO0FBQUEsTUFDeEMsSUFBSSxRQUFRLFNBQVM7QUFBQSxRQUtwQixLQUFLLE1BQU0sUUFBUSxXQUFXLE1BQU0sUUFBUSxlQUFlLE1BQU0sSUFBSSxVQUFVLEtBQUs7QUFBQSxVQUFPO0FBQUEsUUFFM0YsSUFBSSxNQUFNLFFBQVEsWUFBWSxRQUFRLFFBQVEsTUFBTSxJQUFJLFVBQVUsS0FBSztBQUFBLFVBQU87QUFBQSxRQUU5RSxJQUFJLE1BQU0sUUFBUSxZQUFZLFFBQVEsUUFBUSxNQUFNLElBQUksVUFBVSxLQUFLO0FBQUEsVUFBTztBQUFBLFFBRzlFLElBQUksTUFBTSxRQUFRLFdBQVcsTUFBTSxNQUFNLFNBQVMsVUFBVSxLQUFLLFVBQVUsSUFBSTtBQUFBLFVBQUUsUUFBUSxNQUFNLHNDQUFzQztBQUFBLFVBQUc7QUFBQSxRQUFPO0FBQUEsTUFDaEo7QUFBQSxNQUVBLElBQUksTUFBTSxRQUFRLFdBQVcsUUFBUTtBQUFBLFFBQVEsTUFBTSxJQUFJLGFBQWEsS0FBSyxLQUFLO0FBQUEsTUFDekU7QUFBQSxjQUFNLElBQUksT0FBTztBQUFBLElBQ3ZCLEVBQU87QUFBQSxNQUNOLElBQUksT0FBTyxVQUFVLFdBQVc7QUFBQSxRQUMvQixJQUFJO0FBQUEsVUFBTyxNQUFNLElBQUksYUFBYSxLQUFLLEVBQUU7QUFBQSxRQUNwQztBQUFBLGdCQUFNLElBQUksZ0JBQWdCLEdBQUc7QUFBQSxNQUNuQyxFQUNLO0FBQUEsY0FBTSxJQUFJLGFBQWEsUUFBUSxjQUFjLFVBQVUsS0FBSyxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR3hFLFNBQVMsVUFBVSxDQUFDLE9BQVksS0FBYSxLQUFVLElBQXdCO0FBQUEsSUFDOUUsSUFBSSxRQUFRLFNBQVMsT0FBTyxRQUFRLGtCQUFrQixHQUFHO0FBQUEsTUFBRztBQUFBLElBQzVELElBQUksSUFBSSxPQUFPLE9BQU8sSUFBSSxPQUFPO0FBQUEsTUFBSyxZQUFZLE9BQU8sS0FBSyxTQUFTO0FBQUEsSUFDbEUsU0FBSSxRQUFRO0FBQUEsTUFBUyxZQUFZLE1BQU0sS0FBSyxLQUFLLElBQUk7QUFBQSxJQUNyRCxTQUNKLGVBQWUsT0FBTyxLQUFLLEVBQUUsS0FDMUIsUUFBUSxlQUNSLFFBQVEsV0FDUixFQUFFLFFBQVEsWUFDWixNQUFNLFFBQVEsWUFDWCxNQUFNLFFBQVEsWUFBWSxNQUFNLElBQUksa0JBQWtCLE1BQU0sTUFBTSxRQUFRLGNBQWMsTUFBTSxHQUFHLE9BRWxHLEVBQUUsTUFBTSxRQUFRLFdBQVcsUUFBUSxTQUNyQztBQUFBLE1BQ0QsTUFBTSxJQUFJLE9BQU87QUFBQSxJQUNsQixFQUFPO0FBQUEsTUFDTixNQUFNLGNBQWMsSUFBSSxRQUFRLEdBQUc7QUFBQSxNQUNuQyxJQUFJLGdCQUFnQjtBQUFBLFFBQUksTUFBTSxJQUFJLE1BQU0sY0FBYyxDQUFDO0FBQUEsTUFDdkQsSUFBSSxRQUFRO0FBQUEsUUFBTyxNQUFNLElBQUksZ0JBQWdCLFFBQVEsY0FBYyxVQUFVLEdBQUc7QUFBQTtBQUFBO0FBQUEsRUFHbEYsU0FBUyxrQkFBa0IsQ0FBQyxPQUFZLE9BQTRCO0FBQUEsSUFDbkUsSUFBSSxXQUFXLE9BQU87QUFBQSxNQUNyQixJQUFJLE1BQU0sVUFBVSxNQUFNO0FBQUEsUUFDekIsSUFBSSxNQUFNLElBQUksa0JBQWtCO0FBQUEsVUFBSSxNQUFNLElBQUksUUFBUTtBQUFBLE1BQ3ZELEVBQU87QUFBQSxRQUNOLE1BQU0sYUFBYSxLQUFLLE1BQU07QUFBQSxRQUM5QixJQUFJLE1BQU0sSUFBSSxVQUFVLGNBQWMsTUFBTSxJQUFJLGtCQUFrQixJQUFJO0FBQUEsVUFDckUsTUFBTSxJQUFJLFFBQVE7QUFBQSxRQUNuQjtBQUFBO0FBQUEsSUFFRjtBQUFBLElBQ0EsSUFBSSxtQkFBbUI7QUFBQSxNQUFPLFFBQVEsT0FBTyxpQkFBaUIsTUFBTSxNQUFNLGVBQWUsU0FBUztBQUFBO0FBQUEsRUFFbkcsU0FBUyxXQUFXLENBQUMsT0FBWSxLQUFpQyxPQUFtQyxJQUF3QjtBQUFBLElBRzVILElBQUk7QUFBQSxJQUNKLElBQUksT0FBTyxNQUFNO0FBQUEsTUFDaEIsSUFBSSxRQUFRLFNBQVMsQ0FBQywrQkFBdUIsSUFBSSxLQUFNLEdBQUc7QUFBQSxRQUN6RCxRQUFRLEtBQUssMEZBQTJGO0FBQUEsTUFDekc7QUFBQSxNQUNBLFdBQVcsT0FBTyxLQUFLO0FBQUEsUUFDdEIsS0FBTSxNQUFNLElBQUksU0FBUyxTQUFVLFNBQVMsUUFBUSxNQUFNLFFBQVEsT0FBTztBQUFBLFVBQ3hFLFdBQVcsT0FBTyxLQUFLLEtBQUssRUFBRTtBQUFBLFFBQy9CO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxJQUNBLElBQUksU0FBUyxNQUFNO0FBQUEsTUFDbEIsV0FBVyxPQUFPLE9BQU87QUFBQSxRQUN4QixRQUFRLE9BQU8sS0FBSyxPQUFPLElBQUksTUFBTSxNQUFNLE1BQU0sRUFBRTtBQUFBLE1BQ3BEO0FBQUEsSUFDRDtBQUFBO0FBQUEsRUFFRCxTQUFTLGVBQWUsQ0FBQyxPQUFZLE1BQXVCO0FBQUEsSUFDM0QsT0FBTyxTQUFTLFdBQVcsU0FBUyxhQUFhLFNBQVMsbUJBQW1CLFNBQVMsZUFBZSxNQUFNLFFBQVEsY0FBYyxNQUFNLEdBQUcsS0FBSyxNQUFNLFFBQVEsWUFBWSxNQUFNLElBQUksZUFBZSxjQUFjLE1BQU0sR0FBRztBQUFBO0FBQUEsRUFFMU4sU0FBUyxpQkFBaUIsQ0FBQyxNQUF1QjtBQUFBLElBQ2pELE9BQU8sU0FBUyxZQUFZLFNBQVMsY0FBYyxTQUFTLGNBQWMsU0FBUyxjQUFjLFNBQVMsb0JBQW9CLFNBQVM7QUFBQTtBQUFBLEVBRXhJLFNBQVMsY0FBYyxDQUFDLE9BQVksS0FBYSxJQUFpQztBQUFBLElBRWpGLE9BQU8sT0FBTyxjQUViLE1BQU0sSUFBSSxRQUFRLEdBQUcsSUFBSSxNQUFNLE1BQU0sTUFFckMsUUFBUSxVQUFVLFFBQVEsVUFBVSxRQUFRLFVBQVUsUUFBUSxXQUFXLFFBQVEsYUFFN0UsT0FBTyxNQUFNO0FBQUE7QUFBQSxFQUluQixTQUFTLFdBQVcsQ0FBQyxTQUFzQixLQUFVLE9BQVk7QUFBQSxJQUNoRSxJQUFJLFFBQVEsT0FBTyxDQUVuQixFQUFPLFNBQUksU0FBUyxNQUFNO0FBQUEsTUFFekIsUUFBUSxNQUFNLFVBQVU7QUFBQSxJQUN6QixFQUFPLFNBQUksT0FBTyxVQUFVLFVBQVU7QUFBQSxNQUVyQyxRQUFRLE1BQU0sVUFBVTtBQUFBLElBQ3pCLEVBQU8sU0FBSSxPQUFPLFFBQVEsT0FBTyxRQUFRLFVBQVU7QUFBQSxNQUVsRCxRQUFRLE1BQU0sVUFBVTtBQUFBLE1BRXhCLFdBQVcsT0FBTyxPQUFPO0FBQUEsUUFDeEIsTUFBTSxRQUFRLE1BQU07QUFBQSxRQUNwQixJQUFJLFNBQVMsTUFBTTtBQUFBLFVBQ2xCLElBQUksSUFBSSxTQUFTLEdBQUc7QUFBQSxZQUFHLFFBQVEsTUFBTSxZQUFZLEtBQUssT0FBTyxLQUFLLENBQUM7QUFBQSxVQUM5RDtBQUFBLFlBQUMsUUFBUSxNQUFjLE9BQU8sT0FBTyxLQUFLO0FBQUEsUUFDaEQ7QUFBQSxNQUNEO0FBQUEsSUFDRCxFQUFPO0FBQUEsTUFLTixXQUFXLE9BQU8sS0FBSztBQUFBLFFBQ3RCLElBQUksSUFBSSxRQUFRLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFBQSxVQUMzQyxJQUFJLElBQUksU0FBUyxHQUFHO0FBQUEsWUFBRyxRQUFRLE1BQU0sZUFBZSxHQUFHO0FBQUEsVUFDbEQ7QUFBQSxZQUFDLFFBQVEsTUFBYyxPQUFPO0FBQUEsUUFDcEM7QUFBQSxNQUNEO0FBQUEsTUFFQSxXQUFXLE9BQU8sT0FBTztBQUFBLFFBQ3hCLElBQUksUUFBUSxNQUFNO0FBQUEsUUFDbEIsSUFBSSxTQUFTLFNBQVMsUUFBUSxPQUFPLEtBQUssT0FBTyxPQUFPLElBQUksSUFBSSxHQUFHO0FBQUEsVUFDbEUsSUFBSSxJQUFJLFNBQVMsR0FBRztBQUFBLFlBQUcsUUFBUSxNQUFNLFlBQVksS0FBSyxLQUFLO0FBQUEsVUFDdEQ7QUFBQSxZQUFDLFFBQVEsTUFBYyxPQUFPO0FBQUEsUUFDcEM7QUFBQSxNQUNEO0FBQUE7QUFBQTtBQUFBLEVBZUYsU0FBUyxTQUFTLEdBQVk7QUFBQSxJQUU3QixLQUFLLElBQUk7QUFBQTtBQUFBLEVBRVYsVUFBVSxZQUFZLE9BQU8sT0FBTyxJQUFJO0FBQUEsRUFDeEMsVUFBVSxVQUFVLGNBQWMsUUFBUSxDQUFDLElBQVM7QUFBQSxJQUNuRCxNQUFNLFVBQVUsS0FBSyxPQUFPLEdBQUc7QUFBQSxJQUMvQixJQUFJO0FBQUEsSUFDSixJQUFJLE9BQU8sWUFBWTtBQUFBLE1BQVksU0FBUyxRQUFRLEtBQUssR0FBRyxlQUFlLEVBQUU7QUFBQSxJQUN4RSxTQUFJLE9BQU8sUUFBUSxnQkFBZ0I7QUFBQSxNQUFZLFFBQVEsWUFBWSxFQUFFO0FBQUEsSUFDMUUsTUFBTSxPQUFPO0FBQUEsSUFDYixJQUFJLEtBQUssS0FBSyxNQUFNO0FBQUEsTUFDbkIsSUFBSSxHQUFHLFdBQVc7QUFBQSxTQUFRLEdBQUcsS0FBSyxHQUFHO0FBQUEsTUFDckMsSUFBSSxVQUFVLFFBQVEsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUFBLFFBQ3hELFFBQVEsUUFBUSxNQUFNLEVBQUUsS0FBSyxRQUFRLEdBQUc7QUFBQSxVQUN2QyxJQUFJLEtBQUssS0FBSyxRQUFRLEdBQUcsV0FBVztBQUFBLGFBQVEsR0FBRyxLQUFLLEdBQUc7QUFBQSxTQUN2RDtBQUFBLE1BQ0Y7QUFBQSxJQUNEO0FBQUEsSUFDQSxJQUFJLFdBQVcsT0FBTztBQUFBLE1BQ3JCLEdBQUcsZUFBZTtBQUFBLE1BQ2xCLEdBQUcsZ0JBQWdCO0FBQUEsSUFDcEI7QUFBQTtBQUFBLEVBSUQsU0FBUyxXQUFXLENBQUMsT0FBWSxLQUFhLE9BQVk7QUFBQSxJQUN6RCxJQUFJLE1BQU0sVUFBVSxNQUFNO0FBQUEsTUFDekIsTUFBTSxPQUFPLElBQUk7QUFBQSxNQUNqQixJQUFJLE1BQU0sT0FBTyxTQUFTO0FBQUEsUUFBTztBQUFBLE1BQ2pDLElBQUksU0FBUyxTQUFTLE9BQU8sVUFBVSxjQUFjLE9BQU8sVUFBVSxXQUFXO0FBQUEsUUFDaEYsSUFBSSxNQUFNLE9BQU8sUUFBUTtBQUFBLFVBQU0sTUFBTSxJQUFJLGlCQUFpQixJQUFJLE1BQU0sQ0FBQyxHQUFHLE1BQU0sUUFBUSxLQUFLO0FBQUEsUUFDM0YsTUFBTSxPQUFPLE9BQU87QUFBQSxNQUNyQixFQUFPO0FBQUEsUUFDTixJQUFJLE1BQU0sT0FBTyxRQUFRO0FBQUEsVUFBTSxNQUFNLElBQUksb0JBQW9CLElBQUksTUFBTSxDQUFDLEdBQUcsTUFBTSxRQUFRLEtBQUs7QUFBQSxRQUM5RixNQUFNLE9BQU8sT0FBTztBQUFBO0FBQUEsSUFFdEIsRUFBTyxTQUFJLFNBQVMsU0FBUyxPQUFPLFVBQVUsY0FBYyxPQUFPLFVBQVUsV0FBVztBQUFBLE1BQ3ZGLE1BQU0sU0FBUyxJQUFLO0FBQUEsTUFDcEIsTUFBTSxJQUFJLGlCQUFpQixJQUFJLE1BQU0sQ0FBQyxHQUFHLE1BQU0sUUFBUSxLQUFLO0FBQUEsTUFDNUQsTUFBTSxPQUFPLE9BQU87QUFBQSxJQUNyQjtBQUFBO0FBQUEsRUFJRCxTQUFTLGFBQWEsQ0FBQyxRQUFhLE9BQVksT0FBMEIsY0FBdUIsT0FBTztBQUFBLElBR3ZHLElBQUksT0FBTyxPQUFPLFdBQVcsWUFBWTtBQUFBLE1BQ3hDLE1BQU0sVUFBVTtBQUFBLFFBQ2YsT0FBTztBQUFBLFFBQ1A7QUFBQSxNQUNEO0FBQUEsTUFDQSxNQUFNLFNBQVMsU0FBUyxLQUFLLE9BQU8sUUFBUSxPQUFPLE9BQU87QUFBQSxNQUUxRCxJQUFJLFVBQVUsUUFBUSxPQUFPLE9BQU8sU0FBUyxjQUFjLGlCQUFpQixNQUFNO0FBQUEsUUFDakYsUUFBUSxRQUFRLE1BQU0sRUFBRSxLQUFLLFFBQVEsR0FBRztBQUFBLFVBQ3ZDLElBQUksaUJBQWlCLE1BQU07QUFBQSxhQUV6QixHQUFHLGVBQWU7QUFBQSxVQUNwQjtBQUFBLFNBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRDtBQUFBLElBQ0EsSUFBSSxPQUFPLE9BQU8sYUFBYTtBQUFBLE1BQVksTUFBTSxLQUFLLFNBQVMsS0FBSyxPQUFPLFVBQVUsS0FBSyxDQUFDO0FBQUE7QUFBQSxFQUU1RixTQUFTLGVBQWUsQ0FBQyxRQUFhLE9BQVksT0FBMEI7QUFBQSxJQUMzRSxJQUFJLE9BQU8sT0FBTyxhQUFhO0FBQUEsTUFBWSxNQUFNLEtBQUssU0FBUyxLQUFLLE9BQU8sVUFBVSxLQUFLLENBQUM7QUFBQTtBQUFBLEVBRTVGLFNBQVMsZUFBZSxDQUFDLE9BQVksS0FBbUI7QUFBQSxJQUN2RCxHQUFHO0FBQUEsTUFDRixJQUFJLE1BQU0sU0FBUyxRQUFRLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixZQUFZO0FBQUEsUUFDNUUsTUFBTSxRQUFRLFNBQVMsS0FBSyxNQUFNLE1BQU0sZ0JBQWdCLE9BQU8sR0FBRztBQUFBLFFBQ2xFLElBQUksVUFBVSxhQUFhLENBQUM7QUFBQSxVQUFPO0FBQUEsTUFDcEM7QUFBQSxNQUNBLElBQUksT0FBTyxNQUFNLFFBQVEsWUFBWSxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsWUFBWTtBQUFBLFFBQ3RGLE1BQU0sUUFBUSxTQUFTLEtBQUssTUFBTSxNQUFNLGdCQUFnQixPQUFPLEdBQUc7QUFBQSxRQUNsRSxJQUFJLFVBQVUsYUFBYSxDQUFDO0FBQUEsVUFBTztBQUFBLE1BQ3BDO0FBQUEsTUFDQSxPQUFPO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxNQUFNLE1BQU0sSUFBSTtBQUFBLElBQ2hCLE1BQU0sVUFBVSxJQUFJO0FBQUEsSUFDcEIsTUFBTSxXQUFXLElBQUk7QUFBQSxJQVFyQixNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ2xCLE1BQU0sV0FBVyxJQUFJO0FBQUEsSUFDckIsTUFBTSxPQUFPLElBQUk7QUFBQSxJQUNqQixPQUFPO0FBQUE7QUFBQSxFQUdSLElBQUksYUFBNkI7QUFBQSxFQUVqQyxPQUFPLFFBQVEsQ0FBQyxLQUFjLFFBQXFDLFFBQXFCO0FBQUEsSUFDdkYsSUFBSSxDQUFDO0FBQUEsTUFBSyxNQUFNLElBQUksVUFBVSwrQ0FBK0M7QUFBQSxJQUM3RSxJQUFJLGNBQWMsUUFBUSxJQUFJLFNBQVMsVUFBVSxHQUFHO0FBQUEsTUFDbkQsTUFBTSxJQUFJLFVBQVUseURBQXlEO0FBQUEsSUFDOUU7QUFBQSxJQUNBLE1BQU0sYUFBYTtBQUFBLElBQ25CLE1BQU0sVUFBVTtBQUFBLElBQ2hCLE1BQU0sUUFBMkIsQ0FBQztBQUFBLElBQ2xDLE1BQU0sU0FBUyxjQUFjLEdBQUc7QUFBQSxJQUNoQyxNQUFNLFlBQVksSUFBSTtBQUFBLElBRXRCLGFBQWE7QUFBQSxJQUNiLGdCQUFnQixPQUFPLFdBQVcsYUFBYSxTQUFTO0FBQUEsSUFDeEQsZ0JBQWdCLENBQUM7QUFBQSxJQUVqQix5QkFBeUI7QUFBQSxJQUN6Qix5QkFBeUI7QUFBQSxJQUN6QixJQUFJO0FBQUEsTUFHSCxJQUFJLGNBQWUsSUFBWSxVQUFVLFFBQ3hDLElBQUksYUFBYSxLQUNqQixjQUFjLE9BQ2IsSUFBZ0IsU0FBUyxTQUFTO0FBQUEsTUFHcEMsSUFBSSxDQUFDLGVBQWdCLElBQVksVUFBVTtBQUFBLFFBQU0sSUFBSSxjQUFjO0FBQUEsTUFDbkUsTUFBTSxhQUFjLGNBQWMsa0JBQWtCLE1BQU0sUUFBUSxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLE1BQzdGLFlBQVksS0FBTSxJQUFZLFFBQVEsWUFBWSxPQUFPLE1BQU8sY0FBYyxpQ0FBaUMsWUFBWSxXQUFrQyxXQUFXO0FBQUEsTUFJeEssSUFBSSxlQUFlLHlCQUF5QiwwQkFBMEI7QUFBQSxRQUNyRSxPQUFPLEtBQUssNkZBQTZGO0FBQUEsVUFDeEcsZUFBZTtBQUFBLFVBQ2YsV0FBVztBQUFBLFFBQ1osQ0FBQztBQUFBLFFBQ0QsSUFBSSxjQUFjO0FBQUEsUUFDbEIseUJBQXlCO0FBQUEsUUFFdkIsSUFBWSxTQUFTO0FBQUEsUUFFdkIsTUFBTSxnQkFBbUMsQ0FBQztBQUFBLFFBQzFDLFlBQVksS0FBSyxNQUFNLFlBQVksZUFBZSxNQUFPLGNBQWMsaUNBQWlDLFlBQVksV0FBa0MsS0FBSztBQUFBLFFBRTNKLFNBQVMsSUFBSSxFQUFHLElBQUksY0FBYyxRQUFRO0FBQUEsVUFBSyxjQUFjLEdBQUc7QUFBQSxNQUNqRTtBQUFBLE1BRUUsSUFBWSxTQUFTO0FBQUEsTUFFdkIsSUFBSSxVQUFVLFFBQVEsY0FBYyxHQUFHLE1BQU0sVUFBVSxPQUFRLE9BQWUsVUFBVTtBQUFBLFFBQWEsT0FBZSxNQUFNO0FBQUEsTUFDMUgsU0FBUyxJQUFJLEVBQUcsSUFBSSxNQUFNLFFBQVE7QUFBQSxRQUFLLE1BQU0sR0FBRztBQUFBLGNBQy9DO0FBQUEsTUFDRCxnQkFBZ0I7QUFBQSxNQUNoQixhQUFhO0FBQUE7QUFBQTtBQUFBOzs7QUNobENoQixlQUFlLFNBQVMsR0FBa0I7QUFBQSxFQUV6QyxJQUFJLE9BQU8sZUFBZSxlQUFnQixXQUFtQixjQUFjO0FBQUEsSUFHMUUsT0FBTyxRQUFRLFFBQVE7QUFBQSxFQUN4QjtBQUFBLEVBR0EsSUFBSSxPQUFPLG1CQUFtQixhQUFhO0FBQUEsSUFDMUMsT0FBTyxJQUFJLFFBQWMsQ0FBQyxZQUFZO0FBQUEsTUFDckMsZUFBZSxPQUFPO0FBQUEsS0FDdEI7QUFBQSxFQUNGO0FBQUEsRUFHQSxJQUFJLE9BQU8sWUFBWSxlQUFlLFFBQVEsU0FBUztBQUFBLElBQ3RELE9BQU8sUUFBUSxRQUFRO0FBQUEsRUFDeEI7QUFBQSxFQUdBLElBQUksT0FBTyxlQUFlLGFBQWE7QUFBQSxJQUN0QyxPQUFPLElBQUksUUFBYyxDQUFDLFlBQXdCO0FBQUEsTUFDakQsV0FBVyxTQUFTLENBQUM7QUFBQSxLQUNyQjtBQUFBLEVBQ0Y7QUFBQSxFQUlBLE9BQU8sUUFBUSxRQUFRO0FBQUE7QUFHeEIsSUFBZTs7O0FDdkNmLElBQU0sdUJBQXVCLElBQUk7QUEwQ2pDLElBQU0sc0JBQXNCLElBQUk7OztBQ3lFaEMsSUFBTSxpQ0FBaUMsT0FBTztBQUM5QyxJQUFNLHFCQUFxQixPQUFPLEtBQUssS0FBSzs7O0FDakY1QyxJQUFNLHNCQUFzQixtQkFDM0IsY0FBYyxHQUNkLE9BQU8sMEJBQTBCLGNBQWMsc0JBQXNCLEtBQUssTUFBTSxJQUFJLFlBQ3BGLE9BQ0Q7QUFFQSxJQUFNLFVBQVMsT0FDZCxPQUFPLFdBQVcsY0FBYyxTQUFTLE1BQ3pDLG1CQUNEO0FBRUEsSUFBTSxJQUFpQyxTQUFTLEVBQUMsR0FBWTtBQUFBLEVBQzVELE9BQU8sb0JBQVksTUFBTSxNQUFNLFNBQWdCO0FBQUE7QUFHaEQsRUFBRSxJQUFJO0FBQ04sRUFBRSxRQUFRLG9CQUFZO0FBQ3RCLEVBQUUsV0FBVyxvQkFBWTtBQUN6QixFQUFFLFdBQVc7QUFDYixFQUFFLFFBQVEsb0JBQW9CO0FBQzlCLEVBQUUsUUFBUTtBQUNWLEVBQUUsU0FBUyxjQUFjO0FBQ3pCLEVBQUUsU0FBUyxvQkFBb0I7QUFDL0IsRUFBRSxtQkFBbUI7QUFDckIsRUFBRSxtQkFBbUI7QUFDckIsRUFBRSxnQkFBZ0I7QUFDbEIsRUFBRSxnQkFBZ0I7QUFDbEIsRUFBRSxRQUFRO0FBQ1YsRUFBRSxTQUFTO0FBQ1gsRUFBRSxZQUFZO0FBQ2QsRUFBRSxTQUFTO0FBR1gsd0JBQXdCLENBQUMsUUFBcUI7QUFBQSxFQUM3QyxNQUFNLGFBQWEsb0JBQW9CLEdBQUc7QUFBQSxFQUMxQyxJQUFJLFlBQVk7QUFBQSxJQUNmLFdBQVcsUUFBUSxlQUFhO0FBQUEsTUFFL0IsRUFBRSxPQUFPLFNBQWdCO0FBQUEsS0FDekI7QUFBQSxFQUNGO0FBQUEsQ0FDQTtBQW1DRCxJQUFlOzs7QUN2R1IsTUFBTSxlQUFlLG9CQUFpQztBQUFBLEVBQzVELElBQUksQ0FBQyxPQUEyQjtBQUFBLElBQy9CLE1BQU0sV0FBVyxPQUFPLFdBQVc7QUFBQSxJQUNuQyxRQUFPLE1BQU0sWUFBWSxJQUFJLGFBQWEsSUFBSSxVQUFVLFlBQVcsTUFBTTtBQUFBLElBQ3pFLFFBQVEsSUFBSSxtQ0FBbUMsVUFBVSxhQUFhLENBQUMsQ0FBQyxNQUFNLGdCQUFnQixDQUFDLENBQUUsTUFBTSxTQUFVLG1CQUFtQixNQUFNLFNBQVMsVUFBVSxDQUFDO0FBQUEsSUFFOUosSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVM7QUFBQSxNQUMzQixRQUFRLElBQUksc0RBQXNEO0FBQUEsTUFDbEUsT0FBTyxnQkFBRSxPQUFPLFlBQVk7QUFBQSxJQUM3QjtBQUFBLElBRUEsTUFBTSxjQUFjLE1BQU0sTUFBTSxjQUFjLE9BQU8sV0FBVyxjQUFjLGdCQUFFLE1BQU0sSUFBSSxJQUFJLFNBQVM7QUFBQSxJQUd2RyxNQUFNLFlBQVksWUFBWSxXQUFXLE1BQU0sS0FBSyxZQUFZLFNBQVMsYUFBYSxLQUFLLFlBQVksU0FBUyxRQUFRLEtBQUssWUFBWSxTQUFTLE9BQU8sS0FBSyxZQUFZLFNBQVMsT0FBTyxLQUFLLFlBQVksU0FBUyxTQUFTLEtBQUssWUFBWSxTQUFTLGtCQUFrQixLQUFLLFlBQVksU0FBUyxrQkFBa0IsS0FBSyxZQUFZLFNBQVMsZUFBZSxLQUFLLFlBQVksU0FBUyxlQUFlLEtBQUssWUFBWSxTQUFTLE9BQU8sS0FBSyxZQUFZLFNBQVMsVUFBVSxLQUFLLFlBQVksU0FBUyxRQUFRLEtBQUssWUFBWSxTQUFTLFFBQVEsS0FBSyxZQUFZLFNBQVMsUUFBUTtBQUFBLElBQ2xqQixNQUFNLGFBQWEsWUFBWSxhQUFhO0FBQUEsSUFFNUMsdUJBQU8sZ0VBQ04sZ0JBZUUsVUFmRixzQkFDQyxnQkFhRSxXQWJGLHNCQUNDLGdCQUEyQyxLQUEzQztBQUFBLE1BQUcsT0FBTTtBQUFBLE1BQVksTUFBSztBQUFBLE9BQTFCLEdBQTJDLG1CQUMzQyxnQkFHRSxNQUhGLHNCQUNDLGdCQUFDLE9BQUQ7QUFBQSxNQUFLLEtBQUk7QUFBQSxNQUFZLEtBQUk7QUFBQSxLQUFVLEdBRHBDLDRCQUVTLGdCQUFrQyxRQUFsQztBQUFBLE1BQU0sT0FBTTtBQUFBLE9BQVosS0FBd0IsT0FBVSxDQUN6QyxtQkFDRixnQkFLRSxPQUxGLHNCQUNDLGdCQUEyQyxnQkFBRSxNQUFNLE1BQW5EO0FBQUEsTUFBYyxNQUFLO0FBQUEsTUFBSSxVQUFTO0FBQUEsT0FBaEMsT0FBMkMsbUJBQzNDLGdCQUFpRCxnQkFBRSxNQUFNLE1BQXpEO0FBQUEsTUFBYyxNQUFLO0FBQUEsTUFBWSxVQUFTO0FBQUEsT0FBeEMsS0FBaUQsbUJBQ2pELGdCQUErQyxLQUEvQztBQUFBLE1BQUcsTUFBSztBQUFBLE9BQVIsTUFBK0MsbUJBQy9DLGdCQUEwRCxLQUExRDtBQUFBLE1BQUcsTUFBSztBQUFBLE9BQVIsUUFBMEQsQ0FDekQsR0FDRCxjQUFjLFdBQVcsS0FBSyxJQUFJLGdCQUFFLE1BQU0sVUFBVSxJQUFJLElBQ3hELENBQ0QsbUJBQ0YsZ0JBUUUsUUFSRixzQkFDQyxnQkFNRSxPQU5GO0FBQUEsTUFBSyxPQUFNO0FBQUEsT0FDVCxnQkFBRSxNQUFNLEtBQUssT0FBTyxtQkFDckIsZ0JBR0UsT0FIRjtBQUFBLE1BQUssT0FBTTtBQUFBLHVCQUNWLGdCQUFpRCxPQUFqRCw2Q0FBaUQsbUJBQ2pELGdCQUFzSSxPQUF0SSxzQkFBSyxnQkFBNkgsS0FBN0g7QUFBQSxNQUFHLE1BQU0sb0RBQW9ELFlBQVksUUFBUSxTQUFTLEtBQUssRUFBRSxRQUFRLE9BQU8sRUFBRTtBQUFBLE9BQWxILE1BQTZILENBQUksQ0FDckksQ0FDRCxDQUNELENBQ0Q7QUFBQTtBQUFBLEVBR0gsUUFBUSxDQUFDLE9BQTJCO0FBQUEsSUFFbkMsTUFBTSxZQUFZLFNBQVMsY0FBYyxZQUFZO0FBQUEsSUFDckQsSUFBSSxXQUFXO0FBQUEsTUFDZCxVQUFVLGlCQUFpQixTQUFTLE1BQU07QUFBQSxRQUN6QyxTQUFTLEtBQUssWUFBWSxTQUFTLEtBQUssY0FBYyxlQUFlLEtBQUs7QUFBQSxPQUMxRTtBQUFBLElBQ0Y7QUFBQSxJQUdBLE1BQU0sVUFBVSxTQUFTLGNBQWMsU0FBUztBQUFBLElBQ2hELElBQUksU0FBUztBQUFBLE1BQ1osUUFBUSxpQkFBaUIsU0FBUyxNQUFNO0FBQUEsUUFDdkMsU0FBUyxLQUFLLFlBQVk7QUFBQSxPQUMxQjtBQUFBLElBQ0Y7QUFBQTtBQUVGOzs7QUM5RE8sTUFBTSx5QkFBeUIsb0JBQWtDO0FBQUEsRUFDdkUsSUFBSSxDQUFDLE9BQTRCO0FBQUEsSUFDaEMsTUFBTSxXQUFXLE9BQU8sV0FBVztBQUFBLElBQ25DLFFBQVEsSUFBSSw2Q0FBNkMsVUFBVSxhQUFhLENBQUMsQ0FBQyxNQUFNLE1BQU0sSUFBSTtBQUFBLElBRWxHLElBQUksQ0FBQyxNQUFNLE1BQU0sTUFBTTtBQUFBLE1BQ3RCLFFBQVEsSUFBSSxrREFBa0Q7QUFBQSxNQUM5RCxPQUFPLGdCQUFFLE9BQU8sY0FBYztBQUFBLElBQy9CO0FBQUEsSUFFQSxRQUFRLElBQUksd0RBQXdELE1BQU0sTUFBTSxLQUFLLEtBQUs7QUFBQSxJQUMxRixNQUFNLFNBQVMsZ0JBQUUsUUFBZTtBQUFBLE1BQy9CLE1BQU0sTUFBTSxNQUFNO0FBQUEsTUFDbEIsV0FBVyxNQUFNLE1BQU07QUFBQSxNQUN2QixXQUFXLE1BQU0sTUFBTTtBQUFBLE1BQ3ZCLFlBQVksTUFBTSxNQUFNO0FBQUEsTUFDeEIsU0FBUyxNQUFNLE1BQU07QUFBQSxJQUN0QixDQUFDO0FBQUEsSUFDRCxRQUFRLElBQUkseUNBQXlDO0FBQUEsSUFDckQsT0FBTztBQUFBO0FBRVQ7OztBQ3BCQSxTQUFTLFlBQVksR0FBRztBQUFBLEVBQ3BCLE9BQU87QUFBQSxJQUNILE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxJQUNMLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxFQUNoQjtBQUFBO0FBRUosSUFBSSxZQUFZLGFBQWE7QUFDN0IsU0FBUyxjQUFjLENBQUMsYUFBYTtBQUFBLEVBQ2pDLFlBQVk7QUFBQTtBQU1oQixJQUFNLGFBQWE7QUFDbkIsSUFBTSxnQkFBZ0IsSUFBSSxPQUFPLFdBQVcsUUFBUSxHQUFHO0FBQ3ZELElBQU0scUJBQXFCO0FBQzNCLElBQU0sd0JBQXdCLElBQUksT0FBTyxtQkFBbUIsUUFBUSxHQUFHO0FBQ3ZFLElBQU0scUJBQXFCO0FBQUEsRUFDdkIsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUNUO0FBQ0EsSUFBTSx1QkFBdUIsQ0FBQyxPQUFPLG1CQUFtQjtBQUN4RCxTQUFTLFFBQVEsQ0FBQyxNQUFNLFFBQVE7QUFBQSxFQUM1QixJQUFJLFFBQVE7QUFBQSxJQUNSLElBQUksV0FBVyxLQUFLLElBQUksR0FBRztBQUFBLE1BQ3ZCLE9BQU8sS0FBSyxRQUFRLGVBQWUsb0JBQW9CO0FBQUEsSUFDM0Q7QUFBQSxFQUNKLEVBQ0s7QUFBQSxJQUNELElBQUksbUJBQW1CLEtBQUssSUFBSSxHQUFHO0FBQUEsTUFDL0IsT0FBTyxLQUFLLFFBQVEsdUJBQXVCLG9CQUFvQjtBQUFBLElBQ25FO0FBQUE7QUFBQSxFQUVKLE9BQU87QUFBQTtBQUVYLElBQU0sUUFBUTtBQUNkLFNBQVMsSUFBSSxDQUFDLE9BQU8sS0FBSztBQUFBLEVBQ3RCLElBQUksU0FBUyxPQUFPLFVBQVUsV0FBVyxRQUFRLE1BQU07QUFBQSxFQUN2RCxNQUFNLE9BQU87QUFBQSxFQUNiLE1BQU0sTUFBTTtBQUFBLElBQ1IsU0FBUyxDQUFDLE1BQU0sUUFBUTtBQUFBLE1BQ3BCLElBQUksWUFBWSxPQUFPLFFBQVEsV0FBVyxNQUFNLElBQUk7QUFBQSxNQUNwRCxZQUFZLFVBQVUsUUFBUSxPQUFPLElBQUk7QUFBQSxNQUN6QyxTQUFTLE9BQU8sUUFBUSxNQUFNLFNBQVM7QUFBQSxNQUN2QyxPQUFPO0FBQUE7QUFBQSxJQUVYLFVBQVUsTUFBTTtBQUFBLE1BQ1osT0FBTyxJQUFJLE9BQU8sUUFBUSxHQUFHO0FBQUE7QUFBQSxFQUVyQztBQUFBLEVBQ0EsT0FBTztBQUFBO0FBRVgsU0FBUyxRQUFRLENBQUMsTUFBTTtBQUFBLEVBQ3BCLElBQUk7QUFBQSxJQUNBLE9BQU8sVUFBVSxJQUFJLEVBQUUsUUFBUSxRQUFRLEdBQUc7QUFBQSxJQUU5QyxNQUFNO0FBQUEsSUFDRixPQUFPO0FBQUE7QUFBQSxFQUVYLE9BQU87QUFBQTtBQUVYLElBQU0sV0FBVyxFQUFFLE1BQU0sTUFBTSxLQUFLO0FBQ3BDLFNBQVMsVUFBVSxDQUFDLFVBQVUsT0FBTztBQUFBLEVBR2pDLE1BQU0sTUFBTSxTQUFTLFFBQVEsT0FBTyxDQUFDLE9BQU8sUUFBUSxRQUFRO0FBQUEsSUFDeEQsSUFBSSxVQUFVO0FBQUEsSUFDZCxJQUFJLE9BQU87QUFBQSxJQUNYLE9BQU8sRUFBRSxRQUFRLEtBQUssSUFBSSxVQUFVO0FBQUEsTUFDaEMsVUFBVSxDQUFDO0FBQUEsSUFDZixJQUFJLFNBQVM7QUFBQSxNQUdULE9BQU87QUFBQSxJQUNYLEVBQ0s7QUFBQSxNQUVELE9BQU87QUFBQTtBQUFBLEdBRWQsR0FBRyxRQUFRLElBQUksTUFBTSxLQUFLO0FBQUEsRUFDM0IsSUFBSSxJQUFJO0FBQUEsRUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRztBQUFBLElBQ2xCLE1BQU0sTUFBTTtBQUFBLEVBQ2hCO0FBQUEsRUFDQSxJQUFJLE1BQU0sU0FBUyxLQUFLLENBQUMsTUFBTSxNQUFNLFNBQVMsR0FBRyxLQUFLLEdBQUc7QUFBQSxJQUNyRCxNQUFNLElBQUk7QUFBQSxFQUNkO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFBQSxJQUNQLElBQUksTUFBTSxTQUFTLE9BQU87QUFBQSxNQUN0QixNQUFNLE9BQU8sS0FBSztBQUFBLElBQ3RCLEVBQ0s7QUFBQSxNQUNELE9BQU8sTUFBTSxTQUFTO0FBQUEsUUFDbEIsTUFBTSxLQUFLLEVBQUU7QUFBQTtBQUFBLEVBRXpCO0FBQUEsRUFDQSxNQUFPLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxJQUUxQixNQUFNLEtBQUssTUFBTSxHQUFHLEtBQUssRUFBRSxRQUFRLFNBQVMsR0FBRztBQUFBLEVBQ25EO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFVWCxTQUFTLEtBQUssQ0FBQyxLQUFLLEdBQUcsUUFBUTtBQUFBLEVBQzNCLE1BQU0sSUFBSSxJQUFJO0FBQUEsRUFDZCxJQUFJLE1BQU0sR0FBRztBQUFBLElBQ1QsT0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLElBQUksVUFBVTtBQUFBLEVBRWQsT0FBTyxVQUFVLEdBQUc7QUFBQSxJQUNoQixNQUFNLFdBQVcsSUFBSSxPQUFPLElBQUksVUFBVSxDQUFDO0FBQUEsSUFDM0MsSUFBSSxhQUFhLEtBQUssQ0FBQyxRQUFRO0FBQUEsTUFDM0I7QUFBQSxJQUNKLEVBQ0ssU0FBSSxhQUFhLEtBQUssUUFBUTtBQUFBLE1BQy9CO0FBQUEsSUFDSixFQUNLO0FBQUEsTUFDRDtBQUFBO0FBQUEsRUFFUjtBQUFBLEVBQ0EsT0FBTyxJQUFJLE1BQU0sR0FBRyxJQUFJLE9BQU87QUFBQTtBQUVuQyxTQUFTLGtCQUFrQixDQUFDLEtBQUssR0FBRztBQUFBLEVBQ2hDLElBQUksSUFBSSxRQUFRLEVBQUUsRUFBRSxNQUFNLElBQUk7QUFBQSxJQUMxQixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQUEsRUFDWixTQUFTLElBQUksRUFBRyxJQUFJLElBQUksUUFBUSxLQUFLO0FBQUEsSUFDakMsSUFBSSxJQUFJLE9BQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQUEsSUFDSixFQUNLLFNBQUksSUFBSSxPQUFPLEVBQUUsSUFBSTtBQUFBLE1BQ3RCO0FBQUEsSUFDSixFQUNLLFNBQUksSUFBSSxPQUFPLEVBQUUsSUFBSTtBQUFBLE1BQ3RCO0FBQUEsTUFDQSxJQUFJLFFBQVEsR0FBRztBQUFBLFFBQ1gsT0FBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBR1gsU0FBUyxVQUFVLENBQUMsS0FBSyxNQUFNLEtBQUssT0FBTztBQUFBLEVBQ3ZDLE1BQU0sT0FBTyxLQUFLO0FBQUEsRUFDbEIsTUFBTSxRQUFRLEtBQUssUUFBUSxTQUFTLEtBQUssS0FBSyxJQUFJO0FBQUEsRUFDbEQsTUFBTSxPQUFPLElBQUksR0FBRyxRQUFRLGVBQWUsSUFBSTtBQUFBLEVBQy9DLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEtBQUs7QUFBQSxJQUMxQixNQUFNLE1BQU0sU0FBUztBQUFBLElBQ3JCLE1BQU0sUUFBUTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLFFBQVEsTUFBTSxhQUFhLElBQUk7QUFBQSxJQUNuQztBQUFBLElBQ0EsTUFBTSxNQUFNLFNBQVM7QUFBQSxJQUNyQixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsTUFBTSxTQUFTLElBQUk7QUFBQSxFQUN2QjtBQUFBO0FBRUosU0FBUyxzQkFBc0IsQ0FBQyxLQUFLLE1BQU07QUFBQSxFQUN2QyxNQUFNLG9CQUFvQixJQUFJLE1BQU0sZUFBZTtBQUFBLEVBQ25ELElBQUksc0JBQXNCLE1BQU07QUFBQSxJQUM1QixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsTUFBTSxlQUFlLGtCQUFrQjtBQUFBLEVBQ3ZDLE9BQU8sS0FDRixNQUFNO0FBQUEsQ0FBSSxFQUNWLElBQUksVUFBUTtBQUFBLElBQ2IsTUFBTSxvQkFBb0IsS0FBSyxNQUFNLE1BQU07QUFBQSxJQUMzQyxJQUFJLHNCQUFzQixNQUFNO0FBQUEsTUFDNUIsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUNBLE9BQU8sZ0JBQWdCO0FBQUEsSUFDdkIsSUFBSSxhQUFhLFVBQVUsYUFBYSxRQUFRO0FBQUEsTUFDNUMsT0FBTyxLQUFLLE1BQU0sYUFBYSxNQUFNO0FBQUEsSUFDekM7QUFBQSxJQUNBLE9BQU87QUFBQSxHQUNWLEVBQ0ksS0FBSztBQUFBLENBQUk7QUFBQTtBQUFBO0FBS2xCLE1BQU0sV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixLQUFLLFVBQVUsV0FBVztBQUFBO0FBQUEsRUFFOUIsS0FBSyxDQUFDLEtBQUs7QUFBQSxJQUNQLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxRQUFRLEtBQUssR0FBRztBQUFBLElBQzdDLElBQUksT0FBTyxJQUFJLEdBQUcsU0FBUyxHQUFHO0FBQUEsTUFDMUIsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsTUFDYjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosSUFBSSxDQUFDLEtBQUs7QUFBQSxJQUNOLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssR0FBRztBQUFBLElBQzFDLElBQUksS0FBSztBQUFBLE1BQ0wsTUFBTSxPQUFPLElBQUksR0FBRyxRQUFRLDBCQUEwQixFQUFFO0FBQUEsTUFDeEQsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsUUFDVCxnQkFBZ0I7QUFBQSxRQUNoQixNQUFNLENBQUMsS0FBSyxRQUFRLFdBQ2QsTUFBTSxNQUFNO0FBQUEsQ0FBSSxJQUNoQjtBQUFBLE1BQ1Y7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLE1BQU0sQ0FBQyxLQUFLO0FBQUEsSUFDUixNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sT0FBTyxLQUFLLEdBQUc7QUFBQSxJQUM1QyxJQUFJLEtBQUs7QUFBQSxNQUNMLE1BQU0sTUFBTSxJQUFJO0FBQUEsTUFDaEIsTUFBTSxPQUFPLHVCQUF1QixLQUFLLElBQUksTUFBTSxFQUFFO0FBQUEsTUFDckQsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLE1BQU0sSUFBSSxLQUFLLElBQUksR0FBRyxLQUFLLEVBQUUsUUFBUSxLQUFLLE1BQU0sT0FBTyxnQkFBZ0IsSUFBSSxJQUFJLElBQUk7QUFBQSxRQUNuRjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLE9BQU8sQ0FBQyxLQUFLO0FBQUEsSUFDVCxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFBQSxJQUM3QyxJQUFJLEtBQUs7QUFBQSxNQUNMLElBQUksT0FBTyxJQUFJLEdBQUcsS0FBSztBQUFBLE1BRXZCLElBQUksS0FBSyxLQUFLLElBQUksR0FBRztBQUFBLFFBQ2pCLE1BQU0sVUFBVSxNQUFNLE1BQU0sR0FBRztBQUFBLFFBQy9CLElBQUksS0FBSyxRQUFRLFVBQVU7QUFBQSxVQUN2QixPQUFPLFFBQVEsS0FBSztBQUFBLFFBQ3hCLEVBQ0ssU0FBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLE9BQU8sR0FBRztBQUFBLFVBRXJDLE9BQU8sUUFBUSxLQUFLO0FBQUEsUUFDeEI7QUFBQSxNQUNKO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLElBQUk7QUFBQSxRQUNULE9BQU8sSUFBSSxHQUFHO0FBQUEsUUFDZDtBQUFBLFFBQ0EsUUFBUSxLQUFLLE1BQU0sT0FBTyxJQUFJO0FBQUEsTUFDbEM7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLEVBQUUsQ0FBQyxLQUFLO0FBQUEsSUFDSixNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUc7QUFBQSxJQUN4QyxJQUFJLEtBQUs7QUFBQSxNQUNMLE9BQU87QUFBQSxRQUNILE1BQU07QUFBQSxRQUNOLEtBQUssTUFBTSxJQUFJLElBQUk7QUFBQSxDQUFJO0FBQUEsTUFDM0I7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLFVBQVUsQ0FBQyxLQUFLO0FBQUEsSUFDWixNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sV0FBVyxLQUFLLEdBQUc7QUFBQSxJQUNoRCxJQUFJLEtBQUs7QUFBQSxNQUNMLElBQUksUUFBUSxNQUFNLElBQUksSUFBSTtBQUFBLENBQUksRUFBRSxNQUFNO0FBQUEsQ0FBSTtBQUFBLE1BQzFDLElBQUksTUFBTTtBQUFBLE1BQ1YsSUFBSSxPQUFPO0FBQUEsTUFDWCxNQUFNLFNBQVMsQ0FBQztBQUFBLE1BQ2hCLE9BQU8sTUFBTSxTQUFTLEdBQUc7QUFBQSxRQUNyQixJQUFJLGVBQWU7QUFBQSxRQUNuQixNQUFNLGVBQWUsQ0FBQztBQUFBLFFBQ3RCLElBQUk7QUFBQSxRQUNKLEtBQUssSUFBSSxFQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxVQUUvQixJQUFJLFdBQVcsS0FBSyxNQUFNLEVBQUUsR0FBRztBQUFBLFlBQzNCLGFBQWEsS0FBSyxNQUFNLEVBQUU7QUFBQSxZQUMxQixlQUFlO0FBQUEsVUFDbkIsRUFDSyxTQUFJLENBQUMsY0FBYztBQUFBLFlBQ3BCLGFBQWEsS0FBSyxNQUFNLEVBQUU7QUFBQSxVQUM5QixFQUNLO0FBQUEsWUFDRDtBQUFBO0FBQUEsUUFFUjtBQUFBLFFBQ0EsUUFBUSxNQUFNLE1BQU0sQ0FBQztBQUFBLFFBQ3JCLE1BQU0sYUFBYSxhQUFhLEtBQUs7QUFBQSxDQUFJO0FBQUEsUUFDekMsTUFBTSxjQUFjLFdBRWYsUUFBUSxrQ0FBa0M7QUFBQSxPQUFVLEVBQ3BELFFBQVEsb0JBQW9CLEVBQUU7QUFBQSxRQUNuQyxNQUFNLE1BQU0sR0FBRztBQUFBLEVBQVEsZUFBZTtBQUFBLFFBQ3RDLE9BQU8sT0FBTyxHQUFHO0FBQUEsRUFBUyxnQkFBZ0I7QUFBQSxRQUcxQyxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU07QUFBQSxRQUM3QixLQUFLLE1BQU0sTUFBTSxNQUFNO0FBQUEsUUFDdkIsS0FBSyxNQUFNLFlBQVksYUFBYSxRQUFRLElBQUk7QUFBQSxRQUNoRCxLQUFLLE1BQU0sTUFBTSxNQUFNO0FBQUEsUUFFdkIsSUFBSSxNQUFNLFdBQVcsR0FBRztBQUFBLFVBQ3BCO0FBQUEsUUFDSjtBQUFBLFFBQ0EsTUFBTSxZQUFZLE9BQU8sT0FBTyxTQUFTO0FBQUEsUUFDekMsSUFBSSxXQUFXLFNBQVMsUUFBUTtBQUFBLFVBRTVCO0FBQUEsUUFDSixFQUNLLFNBQUksV0FBVyxTQUFTLGNBQWM7QUFBQSxVQUV2QyxNQUFNLFdBQVc7QUFBQSxVQUNqQixNQUFNLFVBQVUsU0FBUyxNQUFNO0FBQUEsSUFBTyxNQUFNLEtBQUs7QUFBQSxDQUFJO0FBQUEsVUFDckQsTUFBTSxXQUFXLEtBQUssV0FBVyxPQUFPO0FBQUEsVUFDeEMsT0FBTyxPQUFPLFNBQVMsS0FBSztBQUFBLFVBQzVCLE1BQU0sSUFBSSxVQUFVLEdBQUcsSUFBSSxTQUFTLFNBQVMsSUFBSSxNQUFNLElBQUksU0FBUztBQUFBLFVBQ3BFLE9BQU8sS0FBSyxVQUFVLEdBQUcsS0FBSyxTQUFTLFNBQVMsS0FBSyxNQUFNLElBQUksU0FBUztBQUFBLFVBQ3hFO0FBQUEsUUFDSixFQUNLLFNBQUksV0FBVyxTQUFTLFFBQVE7QUFBQSxVQUVqQyxNQUFNLFdBQVc7QUFBQSxVQUNqQixNQUFNLFVBQVUsU0FBUyxNQUFNO0FBQUEsSUFBTyxNQUFNLEtBQUs7QUFBQSxDQUFJO0FBQUEsVUFDckQsTUFBTSxXQUFXLEtBQUssS0FBSyxPQUFPO0FBQUEsVUFDbEMsT0FBTyxPQUFPLFNBQVMsS0FBSztBQUFBLFVBQzVCLE1BQU0sSUFBSSxVQUFVLEdBQUcsSUFBSSxTQUFTLFVBQVUsSUFBSSxNQUFNLElBQUksU0FBUztBQUFBLFVBQ3JFLE9BQU8sS0FBSyxVQUFVLEdBQUcsS0FBSyxTQUFTLFNBQVMsSUFBSSxNQUFNLElBQUksU0FBUztBQUFBLFVBQ3ZFLFFBQVEsUUFBUSxVQUFVLE9BQU8sT0FBTyxTQUFTLEdBQUcsSUFBSSxNQUFNLEVBQUUsTUFBTTtBQUFBLENBQUk7QUFBQSxVQUMxRTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosSUFBSSxDQUFDLEtBQUs7QUFBQSxJQUNOLElBQUksTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssR0FBRztBQUFBLElBQ3hDLElBQUksS0FBSztBQUFBLE1BQ0wsSUFBSSxPQUFPLElBQUksR0FBRyxLQUFLO0FBQUEsTUFDdkIsTUFBTSxZQUFZLEtBQUssU0FBUztBQUFBLE1BQ2hDLE1BQU0sT0FBTztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sS0FBSztBQUFBLFFBQ0wsU0FBUztBQUFBLFFBQ1QsT0FBTyxZQUFZLENBQUMsS0FBSyxNQUFNLEdBQUcsRUFBRSxJQUFJO0FBQUEsUUFDeEMsT0FBTztBQUFBLFFBQ1AsT0FBTyxDQUFDO0FBQUEsTUFDWjtBQUFBLE1BQ0EsT0FBTyxZQUFZLGFBQWEsS0FBSyxNQUFNLEVBQUUsTUFBTSxLQUFLO0FBQUEsTUFDeEQsSUFBSSxLQUFLLFFBQVEsVUFBVTtBQUFBLFFBQ3ZCLE9BQU8sWUFBWSxPQUFPO0FBQUEsTUFDOUI7QUFBQSxNQUVBLE1BQU0sWUFBWSxJQUFJLE9BQU8sV0FBVyxrQ0FBbUM7QUFBQSxNQUMzRSxJQUFJLG9CQUFvQjtBQUFBLE1BRXhCLE9BQU8sS0FBSztBQUFBLFFBQ1IsSUFBSSxXQUFXO0FBQUEsUUFDZixJQUFJLE1BQU07QUFBQSxRQUNWLElBQUksZUFBZTtBQUFBLFFBQ25CLElBQUksRUFBRSxNQUFNLFVBQVUsS0FBSyxHQUFHLElBQUk7QUFBQSxVQUM5QjtBQUFBLFFBQ0o7QUFBQSxRQUNBLElBQUksS0FBSyxNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUcsR0FBRztBQUFBLFVBQy9CO0FBQUEsUUFDSjtBQUFBLFFBQ0EsTUFBTSxJQUFJO0FBQUEsUUFDVixNQUFNLElBQUksVUFBVSxJQUFJLE1BQU07QUFBQSxRQUM5QixJQUFJLE9BQU8sSUFBSSxHQUFHLE1BQU07QUFBQSxHQUFNLENBQUMsRUFBRSxHQUFHLFFBQVEsUUFBUSxDQUFDLE1BQU0sSUFBSSxPQUFPLElBQUksRUFBRSxNQUFNLENBQUM7QUFBQSxRQUNuRixJQUFJLFdBQVcsSUFBSSxNQUFNO0FBQUEsR0FBTSxDQUFDLEVBQUU7QUFBQSxRQUNsQyxJQUFJLFlBQVksQ0FBQyxLQUFLLEtBQUs7QUFBQSxRQUMzQixJQUFJLFNBQVM7QUFBQSxRQUNiLElBQUksS0FBSyxRQUFRLFVBQVU7QUFBQSxVQUN2QixTQUFTO0FBQUEsVUFDVCxlQUFlLEtBQUssVUFBVTtBQUFBLFFBQ2xDLEVBQ0ssU0FBSSxXQUFXO0FBQUEsVUFDaEIsU0FBUyxJQUFJLEdBQUcsU0FBUztBQUFBLFFBQzdCLEVBQ0s7QUFBQSxVQUNELFNBQVMsSUFBSSxHQUFHLE9BQU8sTUFBTTtBQUFBLFVBQzdCLFNBQVMsU0FBUyxJQUFJLElBQUk7QUFBQSxVQUMxQixlQUFlLEtBQUssTUFBTSxNQUFNO0FBQUEsVUFDaEMsVUFBVSxJQUFJLEdBQUc7QUFBQTtBQUFBLFFBRXJCLElBQUksYUFBYSxXQUFXLEtBQUssUUFBUSxHQUFHO0FBQUEsVUFDeEMsT0FBTyxXQUFXO0FBQUE7QUFBQSxVQUNsQixNQUFNLElBQUksVUFBVSxTQUFTLFNBQVMsQ0FBQztBQUFBLFVBQ3ZDLFdBQVc7QUFBQSxRQUNmO0FBQUEsUUFDQSxJQUFJLENBQUMsVUFBVTtBQUFBLFVBQ1gsTUFBTSxrQkFBa0IsSUFBSSxPQUFPLFFBQVEsS0FBSyxJQUFJLEdBQUcsU0FBUyxDQUFDLHFEQUFzRDtBQUFBLFVBQ3ZILE1BQU0sVUFBVSxJQUFJLE9BQU8sUUFBUSxLQUFLLElBQUksR0FBRyxTQUFTLENBQUMscURBQXFEO0FBQUEsVUFDOUcsTUFBTSxtQkFBbUIsSUFBSSxPQUFPLFFBQVEsS0FBSyxJQUFJLEdBQUcsU0FBUyxDQUFDLGtCQUFrQjtBQUFBLFVBQ3BGLE1BQU0sb0JBQW9CLElBQUksT0FBTyxRQUFRLEtBQUssSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLO0FBQUEsVUFDeEUsTUFBTSxpQkFBaUIsSUFBSSxPQUFPLFFBQVEsS0FBSyxJQUFJLEdBQUcsU0FBUyxDQUFDLHVCQUF1QixHQUFHO0FBQUEsVUFFMUYsT0FBTyxLQUFLO0FBQUEsWUFDUixNQUFNLFVBQVUsSUFBSSxNQUFNO0FBQUEsR0FBTSxDQUFDLEVBQUU7QUFBQSxZQUNuQyxJQUFJO0FBQUEsWUFDSixXQUFXO0FBQUEsWUFFWCxJQUFJLEtBQUssUUFBUSxVQUFVO0FBQUEsY0FDdkIsV0FBVyxTQUFTLFFBQVEsMkJBQTJCLElBQUk7QUFBQSxjQUMzRCxzQkFBc0I7QUFBQSxZQUMxQixFQUNLO0FBQUEsY0FDRCxzQkFBc0IsU0FBUyxRQUFRLE9BQU8sTUFBTTtBQUFBO0FBQUEsWUFHeEQsSUFBSSxpQkFBaUIsS0FBSyxRQUFRLEdBQUc7QUFBQSxjQUNqQztBQUFBLFlBQ0o7QUFBQSxZQUVBLElBQUksa0JBQWtCLEtBQUssUUFBUSxHQUFHO0FBQUEsY0FDbEM7QUFBQSxZQUNKO0FBQUEsWUFFQSxJQUFJLGVBQWUsS0FBSyxRQUFRLEdBQUc7QUFBQSxjQUMvQjtBQUFBLFlBQ0o7QUFBQSxZQUVBLElBQUksZ0JBQWdCLEtBQUssUUFBUSxHQUFHO0FBQUEsY0FDaEM7QUFBQSxZQUNKO0FBQUEsWUFFQSxJQUFJLFFBQVEsS0FBSyxRQUFRLEdBQUc7QUFBQSxjQUN4QjtBQUFBLFlBQ0o7QUFBQSxZQUNBLElBQUksb0JBQW9CLE9BQU8sTUFBTSxLQUFLLFVBQVUsQ0FBQyxTQUFTLEtBQUssR0FBRztBQUFBLGNBQ2xFLGdCQUFnQjtBQUFBLElBQU8sb0JBQW9CLE1BQU0sTUFBTTtBQUFBLFlBQzNELEVBQ0s7QUFBQSxjQUVELElBQUksV0FBVztBQUFBLGdCQUNYO0FBQUEsY0FDSjtBQUFBLGNBRUEsSUFBSSxLQUFLLFFBQVEsT0FBTyxNQUFNLEVBQUUsT0FBTyxNQUFNLEtBQUssR0FBRztBQUFBLGdCQUNqRDtBQUFBLGNBQ0o7QUFBQSxjQUNBLElBQUksaUJBQWlCLEtBQUssSUFBSSxHQUFHO0FBQUEsZ0JBQzdCO0FBQUEsY0FDSjtBQUFBLGNBQ0EsSUFBSSxrQkFBa0IsS0FBSyxJQUFJLEdBQUc7QUFBQSxnQkFDOUI7QUFBQSxjQUNKO0FBQUEsY0FDQSxJQUFJLFFBQVEsS0FBSyxJQUFJLEdBQUc7QUFBQSxnQkFDcEI7QUFBQSxjQUNKO0FBQUEsY0FDQSxnQkFBZ0I7QUFBQSxJQUFPO0FBQUE7QUFBQSxZQUUzQixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsS0FBSyxHQUFHO0FBQUEsY0FDaEMsWUFBWTtBQUFBLFlBQ2hCO0FBQUEsWUFDQSxPQUFPLFVBQVU7QUFBQTtBQUFBLFlBQ2pCLE1BQU0sSUFBSSxVQUFVLFFBQVEsU0FBUyxDQUFDO0FBQUEsWUFDdEMsT0FBTyxvQkFBb0IsTUFBTSxNQUFNO0FBQUEsVUFDM0M7QUFBQSxRQUNKO0FBQUEsUUFDQSxJQUFJLENBQUMsS0FBSyxPQUFPO0FBQUEsVUFFYixJQUFJLG1CQUFtQjtBQUFBLFlBQ25CLEtBQUssUUFBUTtBQUFBLFVBQ2pCLEVBQ0ssU0FBSSxvQkFBb0IsS0FBSyxHQUFHLEdBQUc7QUFBQSxZQUNwQyxvQkFBb0I7QUFBQSxVQUN4QjtBQUFBLFFBQ0o7QUFBQSxRQUNBLElBQUksU0FBUztBQUFBLFFBQ2IsSUFBSTtBQUFBLFFBRUosSUFBSSxLQUFLLFFBQVEsS0FBSztBQUFBLFVBQ2xCLFNBQVMsY0FBYyxLQUFLLFlBQVk7QUFBQSxVQUN4QyxJQUFJLFFBQVE7QUFBQSxZQUNSLFlBQVksT0FBTyxPQUFPO0FBQUEsWUFDMUIsZUFBZSxhQUFhLFFBQVEsZ0JBQWdCLEVBQUU7QUFBQSxVQUMxRDtBQUFBLFFBQ0o7QUFBQSxRQUNBLEtBQUssTUFBTSxLQUFLO0FBQUEsVUFDWixNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsTUFBTSxDQUFDLENBQUM7QUFBQSxVQUNSLFNBQVM7QUFBQSxVQUNULE9BQU87QUFBQSxVQUNQLE1BQU07QUFBQSxVQUNOLFFBQVEsQ0FBQztBQUFBLFFBQ2IsQ0FBQztBQUFBLFFBQ0QsS0FBSyxPQUFPO0FBQUEsTUFDaEI7QUFBQSxNQUVBLEtBQUssTUFBTSxLQUFLLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxTQUFTLEdBQUcsSUFBSSxRQUFRO0FBQUEsTUFDdEYsS0FBSyxNQUFNLEtBQUssTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLE1BQU0sS0FBSyxNQUFNLFNBQVMsR0FBRyxLQUFLLFFBQVE7QUFBQSxNQUN4RixLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVE7QUFBQSxNQUU1QixTQUFTLElBQUksRUFBRyxJQUFJLEtBQUssTUFBTSxRQUFRLEtBQUs7QUFBQSxRQUN4QyxLQUFLLE1BQU0sTUFBTSxNQUFNO0FBQUEsUUFDdkIsS0FBSyxNQUFNLEdBQUcsU0FBUyxLQUFLLE1BQU0sWUFBWSxLQUFLLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUFBLFFBQ3BFLElBQUksQ0FBQyxLQUFLLE9BQU87QUFBQSxVQUViLE1BQU0sVUFBVSxLQUFLLE1BQU0sR0FBRyxPQUFPLE9BQU8sT0FBSyxFQUFFLFNBQVMsT0FBTztBQUFBLFVBQ25FLE1BQU0sd0JBQXdCLFFBQVEsU0FBUyxLQUFLLFFBQVEsS0FBSyxPQUFLLFNBQVMsS0FBSyxFQUFFLEdBQUcsQ0FBQztBQUFBLFVBQzFGLEtBQUssUUFBUTtBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxLQUFLLE9BQU87QUFBQSxRQUNaLFNBQVMsSUFBSSxFQUFHLElBQUksS0FBSyxNQUFNLFFBQVEsS0FBSztBQUFBLFVBQ3hDLEtBQUssTUFBTSxHQUFHLFFBQVE7QUFBQSxRQUMxQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNYO0FBQUE7QUFBQSxFQUVKLElBQUksQ0FBQyxLQUFLO0FBQUEsSUFDTixNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxLQUFLLEdBQUc7QUFBQSxJQUMxQyxJQUFJLEtBQUs7QUFBQSxNQUNMLE1BQU0sUUFBUTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFFBQ1AsS0FBSyxJQUFJO0FBQUEsUUFDVCxLQUFLLElBQUksT0FBTyxTQUFTLElBQUksT0FBTyxZQUFZLElBQUksT0FBTztBQUFBLFFBQzNELE1BQU0sSUFBSTtBQUFBLE1BQ2Q7QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNYO0FBQUE7QUFBQSxFQUVKLEdBQUcsQ0FBQyxLQUFLO0FBQUEsSUFDTCxNQUFNLE1BQU0sS0FBSyxNQUFNLE1BQU0sSUFBSSxLQUFLLEdBQUc7QUFBQSxJQUN6QyxJQUFJLEtBQUs7QUFBQSxNQUNMLE1BQU0sTUFBTSxJQUFJLEdBQUcsWUFBWSxFQUFFLFFBQVEsUUFBUSxHQUFHO0FBQUEsTUFDcEQsTUFBTSxPQUFPLElBQUksS0FBSyxJQUFJLEdBQUcsUUFBUSxZQUFZLElBQUksRUFBRSxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFnQixJQUFJLElBQUk7QUFBQSxNQUN6RyxNQUFNLFFBQVEsSUFBSSxLQUFLLElBQUksR0FBRyxVQUFVLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQyxFQUFFLFFBQVEsS0FBSyxNQUFNLE9BQU8sZ0JBQWdCLElBQUksSUFBSSxJQUFJO0FBQUEsTUFDcEgsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLEtBQUssSUFBSTtBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosS0FBSyxDQUFDLEtBQUs7QUFBQSxJQUNQLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxNQUFNLEtBQUssR0FBRztBQUFBLElBQzNDLElBQUksQ0FBQyxLQUFLO0FBQUEsTUFDTjtBQUFBLElBQ0o7QUFBQSxJQUNBLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFLEdBQUc7QUFBQSxNQUV0QjtBQUFBLElBQ0o7QUFBQSxJQUNBLE1BQU0sVUFBVSxXQUFXLElBQUksRUFBRTtBQUFBLElBQ2pDLE1BQU0sU0FBUyxJQUFJLEdBQUcsUUFBUSxjQUFjLEVBQUUsRUFBRSxNQUFNLEdBQUc7QUFBQSxJQUN6RCxNQUFNLE9BQU8sSUFBSSxNQUFNLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLFFBQVEsYUFBYSxFQUFFLEVBQUUsTUFBTTtBQUFBLENBQUksSUFBSSxDQUFDO0FBQUEsSUFDdEYsTUFBTSxPQUFPO0FBQUEsTUFDVCxNQUFNO0FBQUEsTUFDTixLQUFLLElBQUk7QUFBQSxNQUNULFFBQVEsQ0FBQztBQUFBLE1BQ1QsT0FBTyxDQUFDO0FBQUEsTUFDUixNQUFNLENBQUM7QUFBQSxJQUNYO0FBQUEsSUFDQSxJQUFJLFFBQVEsV0FBVyxPQUFPLFFBQVE7QUFBQSxNQUVsQztBQUFBLElBQ0o7QUFBQSxJQUNBLFdBQVcsU0FBUyxRQUFRO0FBQUEsTUFDeEIsSUFBSSxZQUFZLEtBQUssS0FBSyxHQUFHO0FBQUEsUUFDekIsS0FBSyxNQUFNLEtBQUssT0FBTztBQUFBLE1BQzNCLEVBQ0ssU0FBSSxhQUFhLEtBQUssS0FBSyxHQUFHO0FBQUEsUUFDL0IsS0FBSyxNQUFNLEtBQUssUUFBUTtBQUFBLE1BQzVCLEVBQ0ssU0FBSSxZQUFZLEtBQUssS0FBSyxHQUFHO0FBQUEsUUFDOUIsS0FBSyxNQUFNLEtBQUssTUFBTTtBQUFBLE1BQzFCLEVBQ0s7QUFBQSxRQUNELEtBQUssTUFBTSxLQUFLLElBQUk7QUFBQTtBQUFBLElBRTVCO0FBQUEsSUFDQSxTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxLQUFLO0FBQUEsTUFDckMsS0FBSyxPQUFPLEtBQUs7QUFBQSxRQUNiLE1BQU0sUUFBUTtBQUFBLFFBQ2QsUUFBUSxLQUFLLE1BQU0sT0FBTyxRQUFRLEVBQUU7QUFBQSxRQUNwQyxRQUFRO0FBQUEsUUFDUixPQUFPLEtBQUssTUFBTTtBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNMO0FBQUEsSUFDQSxXQUFXLE9BQU8sTUFBTTtBQUFBLE1BQ3BCLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLE9BQU8sTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLE1BQU07QUFBQSxRQUNoRSxPQUFPO0FBQUEsVUFDSCxNQUFNO0FBQUEsVUFDTixRQUFRLEtBQUssTUFBTSxPQUFPLElBQUk7QUFBQSxVQUM5QixRQUFRO0FBQUEsVUFDUixPQUFPLEtBQUssTUFBTTtBQUFBLFFBQ3RCO0FBQUEsT0FDSCxDQUFDO0FBQUEsSUFDTjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsRUFFWCxRQUFRLENBQUMsS0FBSztBQUFBLElBQ1YsTUFBTSxNQUFNLEtBQUssTUFBTSxNQUFNLFNBQVMsS0FBSyxHQUFHO0FBQUEsSUFDOUMsSUFBSSxLQUFLO0FBQUEsTUFDTCxPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLElBQUk7QUFBQSxRQUNULE9BQU8sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLE1BQU0sSUFBSTtBQUFBLFFBQ3RDLE1BQU0sSUFBSTtBQUFBLFFBQ1YsUUFBUSxLQUFLLE1BQU0sT0FBTyxJQUFJLEVBQUU7QUFBQSxNQUNwQztBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosU0FBUyxDQUFDLEtBQUs7QUFBQSxJQUNYLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxVQUFVLEtBQUssR0FBRztBQUFBLElBQy9DLElBQUksS0FBSztBQUFBLE1BQ0wsTUFBTSxPQUFPLElBQUksR0FBRyxPQUFPLElBQUksR0FBRyxTQUFTLENBQUMsTUFBTTtBQUFBLElBQzVDLElBQUksR0FBRyxNQUFNLEdBQUcsRUFBRSxJQUNsQixJQUFJO0FBQUEsTUFDVixPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLElBQUk7QUFBQSxRQUNUO0FBQUEsUUFDQSxRQUFRLEtBQUssTUFBTSxPQUFPLElBQUk7QUFBQSxNQUNsQztBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosSUFBSSxDQUFDLEtBQUs7QUFBQSxJQUNOLE1BQU0sTUFBTSxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssR0FBRztBQUFBLElBQzFDLElBQUksS0FBSztBQUFBLE1BQ0wsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsUUFDVCxNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVEsS0FBSyxNQUFNLE9BQU8sSUFBSSxFQUFFO0FBQUEsTUFDcEM7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLE1BQU0sQ0FBQyxLQUFLO0FBQUEsSUFDUixNQUFNLE1BQU0sS0FBSyxNQUFNLE9BQU8sT0FBTyxLQUFLLEdBQUc7QUFBQSxJQUM3QyxJQUFJLEtBQUs7QUFBQSxNQUNMLE9BQU87QUFBQSxRQUNILE1BQU07QUFBQSxRQUNOLEtBQUssSUFBSTtBQUFBLFFBQ1QsTUFBTSxTQUFTLElBQUksRUFBRTtBQUFBLE1BQ3pCO0FBQUEsSUFDSjtBQUFBO0FBQUEsRUFFSixHQUFHLENBQUMsS0FBSztBQUFBLElBQ0wsTUFBTSxNQUFNLEtBQUssTUFBTSxPQUFPLElBQUksS0FBSyxHQUFHO0FBQUEsSUFDMUMsSUFBSSxLQUFLO0FBQUEsTUFDTCxJQUFJLENBQUMsS0FBSyxNQUFNLE1BQU0sVUFBVSxRQUFRLEtBQUssSUFBSSxFQUFFLEdBQUc7QUFBQSxRQUNsRCxLQUFLLE1BQU0sTUFBTSxTQUFTO0FBQUEsTUFDOUIsRUFDSyxTQUFJLEtBQUssTUFBTSxNQUFNLFVBQVUsVUFBVSxLQUFLLElBQUksRUFBRSxHQUFHO0FBQUEsUUFDeEQsS0FBSyxNQUFNLE1BQU0sU0FBUztBQUFBLE1BQzlCO0FBQUEsTUFDQSxJQUFJLENBQUMsS0FBSyxNQUFNLE1BQU0sY0FBYyxpQ0FBaUMsS0FBSyxJQUFJLEVBQUUsR0FBRztBQUFBLFFBQy9FLEtBQUssTUFBTSxNQUFNLGFBQWE7QUFBQSxNQUNsQyxFQUNLLFNBQUksS0FBSyxNQUFNLE1BQU0sY0FBYyxtQ0FBbUMsS0FBSyxJQUFJLEVBQUUsR0FBRztBQUFBLFFBQ3JGLEtBQUssTUFBTSxNQUFNLGFBQWE7QUFBQSxNQUNsQztBQUFBLE1BQ0EsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsUUFDVCxRQUFRLEtBQUssTUFBTSxNQUFNO0FBQUEsUUFDekIsWUFBWSxLQUFLLE1BQU0sTUFBTTtBQUFBLFFBQzdCLE9BQU87QUFBQSxRQUNQLE1BQU0sSUFBSTtBQUFBLE1BQ2Q7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLElBQUksQ0FBQyxLQUFLO0FBQUEsSUFDTixNQUFNLE1BQU0sS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLEdBQUc7QUFBQSxJQUMzQyxJQUFJLEtBQUs7QUFBQSxNQUNMLE1BQU0sYUFBYSxJQUFJLEdBQUcsS0FBSztBQUFBLE1BQy9CLElBQUksQ0FBQyxLQUFLLFFBQVEsWUFBWSxLQUFLLEtBQUssVUFBVSxHQUFHO0FBQUEsUUFFakQsSUFBSSxDQUFFLEtBQUssS0FBSyxVQUFVLEdBQUk7QUFBQSxVQUMxQjtBQUFBLFFBQ0o7QUFBQSxRQUVBLE1BQU0sYUFBYSxNQUFNLFdBQVcsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDdEQsS0FBSyxXQUFXLFNBQVMsV0FBVyxVQUFVLE1BQU0sR0FBRztBQUFBLFVBQ25EO0FBQUEsUUFDSjtBQUFBLE1BQ0osRUFDSztBQUFBLFFBRUQsTUFBTSxpQkFBaUIsbUJBQW1CLElBQUksSUFBSSxJQUFJO0FBQUEsUUFDdEQsSUFBSSxpQkFBaUIsSUFBSTtBQUFBLFVBQ3JCLE1BQU0sUUFBUSxJQUFJLEdBQUcsUUFBUSxHQUFHLE1BQU0sSUFBSSxJQUFJO0FBQUEsVUFDOUMsTUFBTSxVQUFVLFFBQVEsSUFBSSxHQUFHLFNBQVM7QUFBQSxVQUN4QyxJQUFJLEtBQUssSUFBSSxHQUFHLFVBQVUsR0FBRyxjQUFjO0FBQUEsVUFDM0MsSUFBSSxLQUFLLElBQUksR0FBRyxVQUFVLEdBQUcsT0FBTyxFQUFFLEtBQUs7QUFBQSxVQUMzQyxJQUFJLEtBQUs7QUFBQSxRQUNiO0FBQUE7QUFBQSxNQUVKLElBQUksT0FBTyxJQUFJO0FBQUEsTUFDZixJQUFJLFFBQVE7QUFBQSxNQUNaLElBQUksS0FBSyxRQUFRLFVBQVU7QUFBQSxRQUV2QixNQUFNLE9BQU8sZ0NBQWdDLEtBQUssSUFBSTtBQUFBLFFBQ3RELElBQUksTUFBTTtBQUFBLFVBQ04sT0FBTyxLQUFLO0FBQUEsVUFDWixRQUFRLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0osRUFDSztBQUFBLFFBQ0QsUUFBUSxJQUFJLEtBQUssSUFBSSxHQUFHLE1BQU0sR0FBRyxFQUFFLElBQUk7QUFBQTtBQUFBLE1BRTNDLE9BQU8sS0FBSyxLQUFLO0FBQUEsTUFDakIsSUFBSSxLQUFLLEtBQUssSUFBSSxHQUFHO0FBQUEsUUFDakIsSUFBSSxLQUFLLFFBQVEsWUFBWSxDQUFFLEtBQUssS0FBSyxVQUFVLEdBQUk7QUFBQSxVQUVuRCxPQUFPLEtBQUssTUFBTSxDQUFDO0FBQUEsUUFDdkIsRUFDSztBQUFBLFVBQ0QsT0FBTyxLQUFLLE1BQU0sR0FBRyxFQUFFO0FBQUE7QUFBQSxNQUUvQjtBQUFBLE1BQ0EsT0FBTyxXQUFXLEtBQUs7QUFBQSxRQUNuQixNQUFNLE9BQU8sS0FBSyxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFnQixJQUFJLElBQUk7QUFBQSxRQUNwRSxPQUFPLFFBQVEsTUFBTSxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFnQixJQUFJLElBQUk7QUFBQSxNQUMzRSxHQUFHLElBQUksSUFBSSxLQUFLLEtBQUs7QUFBQSxJQUN6QjtBQUFBO0FBQUEsRUFFSixPQUFPLENBQUMsS0FBSyxPQUFPO0FBQUEsSUFDaEIsSUFBSTtBQUFBLElBQ0osS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLFFBQVEsS0FBSyxHQUFHLE9BQ3JDLE1BQU0sS0FBSyxNQUFNLE9BQU8sT0FBTyxLQUFLLEdBQUcsSUFBSTtBQUFBLE1BQy9DLE1BQU0sY0FBYyxJQUFJLE1BQU0sSUFBSSxJQUFJLFFBQVEsUUFBUSxHQUFHO0FBQUEsTUFDekQsTUFBTSxPQUFPLE1BQU0sV0FBVyxZQUFZO0FBQUEsTUFDMUMsSUFBSSxDQUFDLE1BQU07QUFBQSxRQUNQLE1BQU0sT0FBTyxJQUFJLEdBQUcsT0FBTyxDQUFDO0FBQUEsUUFDNUIsT0FBTztBQUFBLFVBQ0gsTUFBTTtBQUFBLFVBQ04sS0FBSztBQUFBLFVBQ0w7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLE1BQ0EsT0FBTyxXQUFXLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLO0FBQUEsSUFDbkQ7QUFBQTtBQUFBLEVBRUosUUFBUSxDQUFDLEtBQUssV0FBVyxXQUFXLElBQUk7QUFBQSxJQUNwQyxJQUFJLFFBQVEsS0FBSyxNQUFNLE9BQU8sZUFBZSxLQUFLLEdBQUc7QUFBQSxJQUNyRCxJQUFJLENBQUM7QUFBQSxNQUNEO0FBQUEsSUFFSixJQUFJLE1BQU0sTUFBTSxTQUFTLE1BQU0sZUFBZTtBQUFBLE1BQzFDO0FBQUEsSUFDSixNQUFNLFdBQVcsTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUFBLElBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxLQUFLLE1BQU0sT0FBTyxZQUFZLEtBQUssUUFBUSxHQUFHO0FBQUEsTUFFeEUsTUFBTSxVQUFVLENBQUMsR0FBRyxNQUFNLEVBQUUsRUFBRSxTQUFTO0FBQUEsTUFDdkMsSUFBSSxRQUFRLFNBQVMsYUFBYSxTQUFTLGdCQUFnQjtBQUFBLE1BQzNELE1BQU0sU0FBUyxNQUFNLEdBQUcsT0FBTyxNQUFNLEtBQUssTUFBTSxPQUFPLG9CQUFvQixLQUFLLE1BQU0sT0FBTztBQUFBLE1BQzdGLE9BQU8sWUFBWTtBQUFBLE1BRW5CLFlBQVksVUFBVSxNQUFNLEtBQUssSUFBSSxTQUFTLE9BQU87QUFBQSxNQUNyRCxRQUFRLFFBQVEsT0FBTyxLQUFLLFNBQVMsTUFBTSxNQUFNO0FBQUEsUUFDN0MsU0FBUyxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLE1BQU07QUFBQSxRQUMzRSxJQUFJLENBQUM7QUFBQSxVQUNEO0FBQUEsUUFDSixVQUFVLENBQUMsR0FBRyxNQUFNLEVBQUU7QUFBQSxRQUN0QixJQUFJLE1BQU0sTUFBTSxNQUFNLElBQUk7QUFBQSxVQUN0QixjQUFjO0FBQUEsVUFDZDtBQUFBLFFBQ0osRUFDSyxTQUFJLE1BQU0sTUFBTSxNQUFNLElBQUk7QUFBQSxVQUMzQixJQUFJLFVBQVUsS0FBSyxHQUFHLFVBQVUsV0FBVyxJQUFJO0FBQUEsWUFDM0MsaUJBQWlCO0FBQUEsWUFDakI7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUFBLFFBQ0EsY0FBYztBQUFBLFFBQ2QsSUFBSSxhQUFhO0FBQUEsVUFDYjtBQUFBLFFBRUosVUFBVSxLQUFLLElBQUksU0FBUyxVQUFVLGFBQWEsYUFBYTtBQUFBLFFBRWhFLE1BQU0saUJBQWlCLENBQUMsR0FBRyxNQUFNLEVBQUUsRUFBRSxHQUFHO0FBQUEsUUFDeEMsTUFBTSxNQUFNLElBQUksTUFBTSxHQUFHLFVBQVUsTUFBTSxRQUFRLGlCQUFpQixPQUFPO0FBQUEsUUFFekUsSUFBSSxLQUFLLElBQUksU0FBUyxPQUFPLElBQUksR0FBRztBQUFBLFVBQ2hDLE1BQU0sUUFBTyxJQUFJLE1BQU0sR0FBRyxFQUFFO0FBQUEsVUFDNUIsT0FBTztBQUFBLFlBQ0gsTUFBTTtBQUFBLFlBQ047QUFBQSxZQUNBO0FBQUEsWUFDQSxRQUFRLEtBQUssTUFBTSxhQUFhLEtBQUk7QUFBQSxVQUN4QztBQUFBLFFBQ0o7QUFBQSxRQUVBLE1BQU0sT0FBTyxJQUFJLE1BQU0sR0FBRyxFQUFFO0FBQUEsUUFDNUIsT0FBTztBQUFBLFVBQ0gsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQSxRQUFRLEtBQUssTUFBTSxhQUFhLElBQUk7QUFBQSxRQUN4QztBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLFFBQVEsQ0FBQyxLQUFLO0FBQUEsSUFDVixNQUFNLE1BQU0sS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLEdBQUc7QUFBQSxJQUMzQyxJQUFJLEtBQUs7QUFBQSxNQUNMLElBQUksT0FBTyxJQUFJLEdBQUcsUUFBUSxPQUFPLEdBQUc7QUFBQSxNQUNwQyxNQUFNLG1CQUFtQixPQUFPLEtBQUssSUFBSTtBQUFBLE1BQ3pDLE1BQU0sMEJBQTBCLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxNQUNqRSxJQUFJLG9CQUFvQix5QkFBeUI7QUFBQSxRQUM3QyxPQUFPLEtBQUssVUFBVSxHQUFHLEtBQUssU0FBUyxDQUFDO0FBQUEsTUFDNUM7QUFBQSxNQUNBLE9BQU8sU0FBUyxNQUFNLElBQUk7QUFBQSxNQUMxQixPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLElBQUk7QUFBQSxRQUNUO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosRUFBRSxDQUFDLEtBQUs7QUFBQSxJQUNKLE1BQU0sTUFBTSxLQUFLLE1BQU0sT0FBTyxHQUFHLEtBQUssR0FBRztBQUFBLElBQ3pDLElBQUksS0FBSztBQUFBLE1BQ0wsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsTUFDYjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosR0FBRyxDQUFDLEtBQUs7QUFBQSxJQUNMLE1BQU0sTUFBTSxLQUFLLE1BQU0sT0FBTyxJQUFJLEtBQUssR0FBRztBQUFBLElBQzFDLElBQUksS0FBSztBQUFBLE1BQ0wsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsUUFDVCxNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVEsS0FBSyxNQUFNLGFBQWEsSUFBSSxFQUFFO0FBQUEsTUFDMUM7QUFBQSxJQUNKO0FBQUE7QUFBQSxFQUVKLFFBQVEsQ0FBQyxLQUFLO0FBQUEsSUFDVixNQUFNLE1BQU0sS0FBSyxNQUFNLE9BQU8sU0FBUyxLQUFLLEdBQUc7QUFBQSxJQUMvQyxJQUFJLEtBQUs7QUFBQSxNQUNMLElBQUksTUFBTTtBQUFBLE1BQ1YsSUFBSSxJQUFJLE9BQU8sS0FBSztBQUFBLFFBQ2hCLE9BQU8sU0FBUyxJQUFJLEVBQUU7QUFBQSxRQUN0QixPQUFPLFlBQVk7QUFBQSxNQUN2QixFQUNLO0FBQUEsUUFDRCxPQUFPLFNBQVMsSUFBSSxFQUFFO0FBQUEsUUFDdEIsT0FBTztBQUFBO0FBQUEsTUFFWCxPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLElBQUk7QUFBQSxRQUNUO0FBQUEsUUFDQTtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ0o7QUFBQSxZQUNJLE1BQU07QUFBQSxZQUNOLEtBQUs7QUFBQSxZQUNMO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBO0FBQUEsRUFFSixHQUFHLENBQUMsS0FBSztBQUFBLElBQ0wsSUFBSTtBQUFBLElBQ0osSUFBSSxNQUFNLEtBQUssTUFBTSxPQUFPLElBQUksS0FBSyxHQUFHLEdBQUc7QUFBQSxNQUN2QyxJQUFJLE1BQU07QUFBQSxNQUNWLElBQUksSUFBSSxPQUFPLEtBQUs7QUFBQSxRQUNoQixPQUFPLFNBQVMsSUFBSSxFQUFFO0FBQUEsUUFDdEIsT0FBTyxZQUFZO0FBQUEsTUFDdkIsRUFDSztBQUFBLFFBRUQsSUFBSTtBQUFBLFFBQ0osR0FBRztBQUFBLFVBQ0MsY0FBYyxJQUFJO0FBQUEsVUFDbEIsSUFBSSxLQUFLLEtBQUssTUFBTSxPQUFPLFdBQVcsS0FBSyxJQUFJLEVBQUUsSUFBSSxNQUFNO0FBQUEsUUFDL0QsU0FBUyxnQkFBZ0IsSUFBSTtBQUFBLFFBQzdCLE9BQU8sU0FBUyxJQUFJLEVBQUU7QUFBQSxRQUN0QixJQUFJLElBQUksT0FBTyxRQUFRO0FBQUEsVUFDbkIsT0FBTyxZQUFZLElBQUk7QUFBQSxRQUMzQixFQUNLO0FBQUEsVUFDRCxPQUFPLElBQUk7QUFBQTtBQUFBO0FBQUEsTUFHbkIsT0FBTztBQUFBLFFBQ0gsTUFBTTtBQUFBLFFBQ04sS0FBSyxJQUFJO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNKO0FBQUEsWUFDSSxNQUFNO0FBQUEsWUFDTixLQUFLO0FBQUEsWUFDTDtBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQTtBQUFBLEVBRUosVUFBVSxDQUFDLEtBQUs7QUFBQSxJQUNaLE1BQU0sTUFBTSxLQUFLLE1BQU0sT0FBTyxLQUFLLEtBQUssR0FBRztBQUFBLElBQzNDLElBQUksS0FBSztBQUFBLE1BQ0wsSUFBSTtBQUFBLE1BQ0osSUFBSSxLQUFLLE1BQU0sTUFBTSxZQUFZO0FBQUEsUUFDN0IsT0FBTyxJQUFJO0FBQUEsTUFDZixFQUNLO0FBQUEsUUFDRCxPQUFPLFNBQVMsSUFBSSxFQUFFO0FBQUE7QUFBQSxNQUUxQixPQUFPO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixLQUFLLElBQUk7QUFBQSxRQUNUO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQTtBQUVSO0FBS0EsSUFBTSxVQUFVO0FBQ2hCLElBQU0sWUFBWTtBQUNsQixJQUFNLFNBQVM7QUFDZixJQUFNLEtBQUs7QUFDWCxJQUFNLFVBQVU7QUFDaEIsSUFBTSxTQUFTO0FBQ2YsSUFBTSxXQUFXLEtBQUssb0pBQW9KLEVBQ3JLLFFBQVEsU0FBUyxNQUFNLEVBQ3ZCLFFBQVEsY0FBYyxtQkFBbUIsRUFDekMsUUFBUSxXQUFXLHVCQUF1QixFQUMxQyxRQUFRLGVBQWUsU0FBUyxFQUNoQyxRQUFRLFlBQVksY0FBYyxFQUNsQyxRQUFRLFNBQVMsbUJBQW1CLEVBQ3BDLFNBQVM7QUFDZCxJQUFNLGFBQWE7QUFDbkIsSUFBTSxZQUFZO0FBQ2xCLElBQU0sY0FBYztBQUNwQixJQUFNLE1BQU0sS0FBSyw2R0FBNkcsRUFDekgsUUFBUSxTQUFTLFdBQVcsRUFDNUIsUUFBUSxTQUFTLDhEQUE4RCxFQUMvRSxTQUFTO0FBQ2QsSUFBTSxPQUFPLEtBQUssc0NBQXNDLEVBQ25ELFFBQVEsU0FBUyxNQUFNLEVBQ3ZCLFNBQVM7QUFDZCxJQUFNLE9BQU8sZ0VBQ1AsNkVBQ0EseUVBQ0EsNEVBQ0Esd0VBQ0E7QUFDTixJQUFNLFdBQVc7QUFDakIsSUFBTSxPQUFPLEtBQUssZUFDWix3RUFDQSw0QkFDQSxrQ0FDQSxrQ0FDQSw4Q0FDQSw2REFDQSwySEFDQSwyR0FDQSxLQUFLLEdBQUcsRUFDVCxRQUFRLFdBQVcsUUFBUSxFQUMzQixRQUFRLE9BQU8sSUFBSSxFQUNuQixRQUFRLGFBQWEsMEVBQTBFLEVBQy9GLFNBQVM7QUFDZCxJQUFNLFlBQVksS0FBSyxVQUFVLEVBQzVCLFFBQVEsTUFBTSxFQUFFLEVBQ2hCLFFBQVEsV0FBVyx1QkFBdUIsRUFDMUMsUUFBUSxhQUFhLEVBQUUsRUFDdkIsUUFBUSxVQUFVLEVBQUUsRUFDcEIsUUFBUSxjQUFjLFNBQVMsRUFDL0IsUUFBUSxVQUFVLGdEQUFnRCxFQUNsRSxRQUFRLFFBQVEsd0JBQXdCLEVBQ3hDLFFBQVEsUUFBUSw2REFBNkQsRUFDN0UsUUFBUSxPQUFPLElBQUksRUFDbkIsU0FBUztBQUNkLElBQU0sYUFBYSxLQUFLLHlDQUF5QyxFQUM1RCxRQUFRLGFBQWEsU0FBUyxFQUM5QixTQUFTO0FBSWQsSUFBTSxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLE1BQU07QUFBQSxFQUNOO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLE9BQU87QUFBQSxFQUNQLE1BQU07QUFDVjtBQUlBLElBQU0sV0FBVyxLQUFLLHNCQUNoQiwyREFDQSxzRkFBc0YsRUFDdkYsUUFBUSxNQUFNLEVBQUUsRUFDaEIsUUFBUSxXQUFXLHVCQUF1QixFQUMxQyxRQUFRLGNBQWMsU0FBUyxFQUMvQixRQUFRLFFBQVEseUJBQXlCLEVBQ3pDLFFBQVEsVUFBVSxnREFBZ0QsRUFDbEUsUUFBUSxRQUFRLHdCQUF3QixFQUN4QyxRQUFRLFFBQVEsNkRBQTZELEVBQzdFLFFBQVEsT0FBTyxJQUFJLEVBQ25CLFNBQVM7QUFDZCxJQUFNLFdBQVc7QUFBQSxLQUNWO0FBQUEsRUFDSCxPQUFPO0FBQUEsRUFDUCxXQUFXLEtBQUssVUFBVSxFQUNyQixRQUFRLE1BQU0sRUFBRSxFQUNoQixRQUFRLFdBQVcsdUJBQXVCLEVBQzFDLFFBQVEsYUFBYSxFQUFFLEVBQ3ZCLFFBQVEsU0FBUyxRQUFRLEVBQ3pCLFFBQVEsY0FBYyxTQUFTLEVBQy9CLFFBQVEsVUFBVSxnREFBZ0QsRUFDbEUsUUFBUSxRQUFRLHdCQUF3QixFQUN4QyxRQUFRLFFBQVEsNkRBQTZELEVBQzdFLFFBQVEsT0FBTyxJQUFJLEVBQ25CLFNBQVM7QUFDbEI7QUFJQSxJQUFNLGdCQUFnQjtBQUFBLEtBQ2Y7QUFBQSxFQUNILE1BQU0sS0FBSyxpQ0FDTCwrQ0FDQSxrRUFBc0UsRUFDdkUsUUFBUSxXQUFXLFFBQVEsRUFDM0IsUUFBUSxRQUFRLFdBQ2Ysd0VBQ0EsZ0VBQ0EsK0JBQStCLEVBQ2hDLFNBQVM7QUFBQSxFQUNkLEtBQUs7QUFBQSxFQUNMLFNBQVM7QUFBQSxFQUNULFFBQVE7QUFBQSxFQUNSLFVBQVU7QUFBQSxFQUNWLFdBQVcsS0FBSyxVQUFVLEVBQ3JCLFFBQVEsTUFBTSxFQUFFLEVBQ2hCLFFBQVEsV0FBVztBQUFBLEVBQWlCLEVBQ3BDLFFBQVEsWUFBWSxRQUFRLEVBQzVCLFFBQVEsVUFBVSxFQUFFLEVBQ3BCLFFBQVEsY0FBYyxTQUFTLEVBQy9CLFFBQVEsV0FBVyxFQUFFLEVBQ3JCLFFBQVEsU0FBUyxFQUFFLEVBQ25CLFFBQVEsU0FBUyxFQUFFLEVBQ25CLFFBQVEsUUFBUSxFQUFFLEVBQ2xCLFNBQVM7QUFDbEI7QUFJQSxJQUFNLFNBQVM7QUFDZixJQUFNLGFBQWE7QUFDbkIsSUFBTSxLQUFLO0FBQ1gsSUFBTSxhQUFhO0FBRW5CLElBQU0sZUFBZTtBQUNyQixJQUFNLGNBQWMsS0FBSyw4QkFBOEIsR0FBRyxFQUNyRCxRQUFRLGdCQUFnQixZQUFZLEVBQUUsU0FBUztBQUVwRCxJQUFNLFlBQVk7QUFDbEIsSUFBTSxpQkFBaUIsS0FBSyxxRUFBcUUsR0FBRyxFQUMvRixRQUFRLFVBQVUsWUFBWSxFQUM5QixTQUFTO0FBQ2QsSUFBTSxvQkFBb0IsS0FBSyxzQ0FDekIsbUJBQ0EscUNBQ0EsOENBQ0EsNENBQ0EsbUNBQ0EsNENBQ0EscUNBQXFDLElBQUksRUFDMUMsUUFBUSxVQUFVLFlBQVksRUFDOUIsU0FBUztBQUVkLElBQU0sb0JBQW9CLEtBQUssNENBQ3pCLG1CQUNBLGlDQUNBLDBDQUNBLHdDQUNBLCtCQUNBLHFDQUFxQyxJQUFJLEVBQzFDLFFBQVEsVUFBVSxZQUFZLEVBQzlCLFNBQVM7QUFDZCxJQUFNLGlCQUFpQixLQUFLLGVBQWUsSUFBSSxFQUMxQyxRQUFRLFVBQVUsWUFBWSxFQUM5QixTQUFTO0FBQ2QsSUFBTSxXQUFXLEtBQUsscUNBQXFDLEVBQ3RELFFBQVEsVUFBVSw4QkFBOEIsRUFDaEQsUUFBUSxTQUFTLDhJQUE4SSxFQUMvSixTQUFTO0FBQ2QsSUFBTSxpQkFBaUIsS0FBSyxRQUFRLEVBQUUsUUFBUSxhQUFhLEtBQUssRUFBRSxTQUFTO0FBQzNFLElBQU0sTUFBTSxLQUFLLGFBQ1gsOEJBQ0EsNkNBQ0EseUJBQ0EsZ0NBQ0Esa0NBQWtDLEVBQ25DLFFBQVEsV0FBVyxjQUFjLEVBQ2pDLFFBQVEsYUFBYSw2RUFBNkUsRUFDbEcsU0FBUztBQUNkLElBQU0sZUFBZTtBQUNyQixJQUFNLE9BQU8sS0FBSywrQ0FBK0MsRUFDNUQsUUFBUSxTQUFTLFlBQVksRUFDN0IsUUFBUSxRQUFRLHNDQUFzQyxFQUN0RCxRQUFRLFNBQVMsNkRBQTZELEVBQzlFLFNBQVM7QUFDZCxJQUFNLFVBQVUsS0FBSyx5QkFBeUIsRUFDekMsUUFBUSxTQUFTLFlBQVksRUFDN0IsUUFBUSxPQUFPLFdBQVcsRUFDMUIsU0FBUztBQUNkLElBQU0sU0FBUyxLQUFLLHVCQUF1QixFQUN0QyxRQUFRLE9BQU8sV0FBVyxFQUMxQixTQUFTO0FBQ2QsSUFBTSxnQkFBZ0IsS0FBSyx5QkFBeUIsR0FBRyxFQUNsRCxRQUFRLFdBQVcsT0FBTyxFQUMxQixRQUFRLFVBQVUsTUFBTSxFQUN4QixTQUFTO0FBSWQsSUFBTSxlQUFlO0FBQUEsRUFDakIsWUFBWTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLE1BQU07QUFBQSxFQUNOLEtBQUs7QUFBQSxFQUNMO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixLQUFLO0FBQ1Q7QUFJQSxJQUFNLGlCQUFpQjtBQUFBLEtBQ2hCO0FBQUEsRUFDSCxNQUFNLEtBQUsseUJBQXlCLEVBQy9CLFFBQVEsU0FBUyxZQUFZLEVBQzdCLFNBQVM7QUFBQSxFQUNkLFNBQVMsS0FBSywrQkFBK0IsRUFDeEMsUUFBUSxTQUFTLFlBQVksRUFDN0IsU0FBUztBQUNsQjtBQUlBLElBQU0sWUFBWTtBQUFBLEtBQ1g7QUFBQSxFQUNILFFBQVEsS0FBSyxNQUFNLEVBQUUsUUFBUSxNQUFNLE1BQU0sRUFBRSxTQUFTO0FBQUEsRUFDcEQsS0FBSyxLQUFLLG9FQUFvRSxHQUFHLEVBQzVFLFFBQVEsU0FBUywyRUFBMkUsRUFDNUYsU0FBUztBQUFBLEVBQ2QsWUFBWTtBQUFBLEVBQ1osS0FBSztBQUFBLEVBQ0wsTUFBTTtBQUNWO0FBSUEsSUFBTSxlQUFlO0FBQUEsS0FDZDtBQUFBLEVBQ0gsSUFBSSxLQUFLLEVBQUUsRUFBRSxRQUFRLFFBQVEsR0FBRyxFQUFFLFNBQVM7QUFBQSxFQUMzQyxNQUFNLEtBQUssVUFBVSxJQUFJLEVBQ3BCLFFBQVEsUUFBUSxlQUFlLEVBQy9CLFFBQVEsV0FBVyxHQUFHLEVBQ3RCLFNBQVM7QUFDbEI7QUFJQSxJQUFNLFFBQVE7QUFBQSxFQUNWLFFBQVE7QUFBQSxFQUNSLEtBQUs7QUFBQSxFQUNMLFVBQVU7QUFDZDtBQUNBLElBQU0sU0FBUztBQUFBLEVBQ1gsUUFBUTtBQUFBLEVBQ1IsS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsVUFBVTtBQUNkO0FBQUE7QUFLQSxNQUFNLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUVqQixLQUFLLFNBQVMsQ0FBQztBQUFBLElBQ2YsS0FBSyxPQUFPLFFBQVEsT0FBTyxPQUFPLElBQUk7QUFBQSxJQUN0QyxLQUFLLFVBQVUsV0FBVztBQUFBLElBQzFCLEtBQUssUUFBUSxZQUFZLEtBQUssUUFBUSxhQUFhLElBQUk7QUFBQSxJQUN2RCxLQUFLLFlBQVksS0FBSyxRQUFRO0FBQUEsSUFDOUIsS0FBSyxVQUFVLFVBQVUsS0FBSztBQUFBLElBQzlCLEtBQUssVUFBVSxRQUFRO0FBQUEsSUFDdkIsS0FBSyxjQUFjLENBQUM7QUFBQSxJQUNwQixLQUFLLFFBQVE7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLFlBQVk7QUFBQSxNQUNaLEtBQUs7QUFBQSxJQUNUO0FBQUEsSUFDQSxNQUFNLFFBQVE7QUFBQSxNQUNWLE9BQU8sTUFBTTtBQUFBLE1BQ2IsUUFBUSxPQUFPO0FBQUEsSUFDbkI7QUFBQSxJQUNBLElBQUksS0FBSyxRQUFRLFVBQVU7QUFBQSxNQUN2QixNQUFNLFFBQVEsTUFBTTtBQUFBLE1BQ3BCLE1BQU0sU0FBUyxPQUFPO0FBQUEsSUFDMUIsRUFDSyxTQUFJLEtBQUssUUFBUSxLQUFLO0FBQUEsTUFDdkIsTUFBTSxRQUFRLE1BQU07QUFBQSxNQUNwQixJQUFJLEtBQUssUUFBUSxRQUFRO0FBQUEsUUFDckIsTUFBTSxTQUFTLE9BQU87QUFBQSxNQUMxQixFQUNLO0FBQUEsUUFDRCxNQUFNLFNBQVMsT0FBTztBQUFBO0FBQUEsSUFFOUI7QUFBQSxJQUNBLEtBQUssVUFBVSxRQUFRO0FBQUE7QUFBQSxhQUtoQixLQUFLLEdBQUc7QUFBQSxJQUNmLE9BQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQTtBQUFBLFNBS0csR0FBRyxDQUFDLEtBQUssU0FBUztBQUFBLElBQ3JCLE1BQU0sUUFBUSxJQUFJLE9BQU8sT0FBTztBQUFBLElBQ2hDLE9BQU8sTUFBTSxJQUFJLEdBQUc7QUFBQTtBQUFBLFNBS2pCLFNBQVMsQ0FBQyxLQUFLLFNBQVM7QUFBQSxJQUMzQixNQUFNLFFBQVEsSUFBSSxPQUFPLE9BQU87QUFBQSxJQUNoQyxPQUFPLE1BQU0sYUFBYSxHQUFHO0FBQUE7QUFBQSxFQUtqQyxHQUFHLENBQUMsS0FBSztBQUFBLElBQ0wsTUFBTSxJQUNELFFBQVEsWUFBWTtBQUFBLENBQUk7QUFBQSxJQUM3QixLQUFLLFlBQVksS0FBSyxLQUFLLE1BQU07QUFBQSxJQUNqQyxTQUFTLElBQUksRUFBRyxJQUFJLEtBQUssWUFBWSxRQUFRLEtBQUs7QUFBQSxNQUM5QyxNQUFNLE9BQU8sS0FBSyxZQUFZO0FBQUEsTUFDOUIsS0FBSyxhQUFhLEtBQUssS0FBSyxLQUFLLE1BQU07QUFBQSxJQUMzQztBQUFBLElBQ0EsS0FBSyxjQUFjLENBQUM7QUFBQSxJQUNwQixPQUFPLEtBQUs7QUFBQTtBQUFBLEVBRWhCLFdBQVcsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxHQUFHLHVCQUF1QixPQUFPO0FBQUEsSUFDeEQsSUFBSSxLQUFLLFFBQVEsVUFBVTtBQUFBLE1BQ3ZCLE1BQU0sSUFBSSxRQUFRLE9BQU8sTUFBTSxFQUFFLFFBQVEsVUFBVSxFQUFFO0FBQUEsSUFDekQ7QUFBQSxJQUNBLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLElBQUk7QUFBQSxJQUNKLE9BQU8sS0FBSztBQUFBLE1BQ1IsSUFBSSxLQUFLLFFBQVEsY0FDVixLQUFLLFFBQVEsV0FBVyxTQUN4QixLQUFLLFFBQVEsV0FBVyxNQUFNLEtBQUssQ0FBQyxpQkFBaUI7QUFBQSxRQUNwRCxJQUFJLFFBQVEsYUFBYSxLQUFLLEVBQUUsT0FBTyxLQUFLLEdBQUcsS0FBSyxNQUFNLEdBQUc7QUFBQSxVQUN6RCxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFVBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsVUFDakIsT0FBTztBQUFBLFFBQ1g7QUFBQSxRQUNBLE9BQU87QUFBQSxPQUNWLEdBQUc7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxRQUFRLEtBQUssVUFBVSxNQUFNLEdBQUcsR0FBRztBQUFBLFFBQ25DLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsSUFBSSxNQUFNLElBQUksV0FBVyxLQUFLLE9BQU8sU0FBUyxHQUFHO0FBQUEsVUFHN0MsT0FBTyxPQUFPLFNBQVMsR0FBRyxPQUFPO0FBQUE7QUFBQSxRQUNyQyxFQUNLO0FBQUEsVUFDRCxPQUFPLEtBQUssS0FBSztBQUFBO0FBQUEsUUFFckI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLEtBQUssR0FBRyxHQUFHO0FBQUEsUUFDbEMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxZQUFZLE9BQU8sT0FBTyxTQUFTO0FBQUEsUUFFbkMsSUFBSSxjQUFjLFVBQVUsU0FBUyxlQUFlLFVBQVUsU0FBUyxTQUFTO0FBQUEsVUFDNUUsVUFBVSxPQUFPO0FBQUEsSUFBTyxNQUFNO0FBQUEsVUFDOUIsVUFBVSxRQUFRO0FBQUEsSUFBTyxNQUFNO0FBQUEsVUFDL0IsS0FBSyxZQUFZLEtBQUssWUFBWSxTQUFTLEdBQUcsTUFBTSxVQUFVO0FBQUEsUUFDbEUsRUFDSztBQUFBLFVBQ0QsT0FBTyxLQUFLLEtBQUs7QUFBQTtBQUFBLFFBRXJCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxRQUFRLEtBQUssVUFBVSxPQUFPLEdBQUcsR0FBRztBQUFBLFFBQ3BDLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsT0FBTyxLQUFLLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsUUFBUSxHQUFHLEdBQUc7QUFBQSxRQUNyQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLEdBQUcsR0FBRyxHQUFHO0FBQUEsUUFDaEMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxRQUFRLEtBQUssVUFBVSxXQUFXLEdBQUcsR0FBRztBQUFBLFFBQ3hDLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsT0FBTyxLQUFLLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsS0FBSyxHQUFHLEdBQUc7QUFBQSxRQUNsQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLEtBQUssR0FBRyxHQUFHO0FBQUEsUUFDbEMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxRQUFRLEtBQUssVUFBVSxJQUFJLEdBQUcsR0FBRztBQUFBLFFBQ2pDLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsWUFBWSxPQUFPLE9BQU8sU0FBUztBQUFBLFFBQ25DLElBQUksY0FBYyxVQUFVLFNBQVMsZUFBZSxVQUFVLFNBQVMsU0FBUztBQUFBLFVBQzVFLFVBQVUsT0FBTztBQUFBLElBQU8sTUFBTTtBQUFBLFVBQzlCLFVBQVUsUUFBUTtBQUFBLElBQU8sTUFBTTtBQUFBLFVBQy9CLEtBQUssWUFBWSxLQUFLLFlBQVksU0FBUyxHQUFHLE1BQU0sVUFBVTtBQUFBLFFBQ2xFLEVBQ0ssU0FBSSxDQUFDLEtBQUssT0FBTyxNQUFNLE1BQU0sTUFBTTtBQUFBLFVBQ3BDLEtBQUssT0FBTyxNQUFNLE1BQU0sT0FBTztBQUFBLFlBQzNCLE1BQU0sTUFBTTtBQUFBLFlBQ1osT0FBTyxNQUFNO0FBQUEsVUFDakI7QUFBQSxRQUNKO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsTUFBTSxHQUFHLEdBQUc7QUFBQSxRQUNuQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLFNBQVMsR0FBRyxHQUFHO0FBQUEsUUFDdEMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BR0EsU0FBUztBQUFBLE1BQ1QsSUFBSSxLQUFLLFFBQVEsY0FBYyxLQUFLLFFBQVEsV0FBVyxZQUFZO0FBQUEsUUFDL0QsSUFBSSxhQUFhO0FBQUEsUUFDakIsTUFBTSxVQUFVLElBQUksTUFBTSxDQUFDO0FBQUEsUUFDM0IsSUFBSTtBQUFBLFFBQ0osS0FBSyxRQUFRLFdBQVcsV0FBVyxRQUFRLENBQUMsa0JBQWtCO0FBQUEsVUFDMUQsWUFBWSxjQUFjLEtBQUssRUFBRSxPQUFPLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDdkQsSUFBSSxPQUFPLGNBQWMsWUFBWSxhQUFhLEdBQUc7QUFBQSxZQUNqRCxhQUFhLEtBQUssSUFBSSxZQUFZLFNBQVM7QUFBQSxVQUMvQztBQUFBLFNBQ0g7QUFBQSxRQUNELElBQUksYUFBYSxZQUFZLGNBQWMsR0FBRztBQUFBLFVBQzFDLFNBQVMsSUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDO0FBQUEsUUFDNUM7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLEtBQUssTUFBTSxRQUFRLFFBQVEsS0FBSyxVQUFVLFVBQVUsTUFBTSxJQUFJO0FBQUEsUUFDOUQsWUFBWSxPQUFPLE9BQU8sU0FBUztBQUFBLFFBQ25DLElBQUksd0JBQXdCLFdBQVcsU0FBUyxhQUFhO0FBQUEsVUFDekQsVUFBVSxPQUFPO0FBQUEsSUFBTyxNQUFNO0FBQUEsVUFDOUIsVUFBVSxRQUFRO0FBQUEsSUFBTyxNQUFNO0FBQUEsVUFDL0IsS0FBSyxZQUFZLElBQUk7QUFBQSxVQUNyQixLQUFLLFlBQVksS0FBSyxZQUFZLFNBQVMsR0FBRyxNQUFNLFVBQVU7QUFBQSxRQUNsRSxFQUNLO0FBQUEsVUFDRCxPQUFPLEtBQUssS0FBSztBQUFBO0FBQUEsUUFFckIsdUJBQXdCLE9BQU8sV0FBVyxJQUFJO0FBQUEsUUFDOUMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQztBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsS0FBSyxHQUFHLEdBQUc7QUFBQSxRQUNsQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLFlBQVksT0FBTyxPQUFPLFNBQVM7QUFBQSxRQUNuQyxJQUFJLGFBQWEsVUFBVSxTQUFTLFFBQVE7QUFBQSxVQUN4QyxVQUFVLE9BQU87QUFBQSxJQUFPLE1BQU07QUFBQSxVQUM5QixVQUFVLFFBQVE7QUFBQSxJQUFPLE1BQU07QUFBQSxVQUMvQixLQUFLLFlBQVksSUFBSTtBQUFBLFVBQ3JCLEtBQUssWUFBWSxLQUFLLFlBQVksU0FBUyxHQUFHLE1BQU0sVUFBVTtBQUFBLFFBQ2xFLEVBQ0s7QUFBQSxVQUNELE9BQU8sS0FBSyxLQUFLO0FBQUE7QUFBQSxRQUVyQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLElBQUksS0FBSztBQUFBLFFBQ0wsTUFBTSxTQUFTLDRCQUE0QixJQUFJLFdBQVcsQ0FBQztBQUFBLFFBQzNELElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxVQUNyQixRQUFRLE1BQU0sTUFBTTtBQUFBLFVBQ3BCO0FBQUEsUUFDSixFQUNLO0FBQUEsVUFDRCxNQUFNLElBQUksTUFBTSxNQUFNO0FBQUE7QUFBQSxNQUU5QjtBQUFBLElBQ0o7QUFBQSxJQUNBLEtBQUssTUFBTSxNQUFNO0FBQUEsSUFDakIsT0FBTztBQUFBO0FBQUEsRUFFWCxNQUFNLENBQUMsS0FBSyxTQUFTLENBQUMsR0FBRztBQUFBLElBQ3JCLEtBQUssWUFBWSxLQUFLLEVBQUUsS0FBSyxPQUFPLENBQUM7QUFBQSxJQUNyQyxPQUFPO0FBQUE7QUFBQSxFQUtYLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDM0IsSUFBSSxPQUFPLFdBQVc7QUFBQSxJQUV0QixJQUFJLFlBQVk7QUFBQSxJQUNoQixJQUFJO0FBQUEsSUFDSixJQUFJLGNBQWM7QUFBQSxJQUVsQixJQUFJLEtBQUssT0FBTyxPQUFPO0FBQUEsTUFDbkIsTUFBTSxRQUFRLE9BQU8sS0FBSyxLQUFLLE9BQU8sS0FBSztBQUFBLE1BQzNDLElBQUksTUFBTSxTQUFTLEdBQUc7QUFBQSxRQUNsQixRQUFRLFFBQVEsS0FBSyxVQUFVLE1BQU0sT0FBTyxjQUFjLEtBQUssU0FBUyxNQUFNLE1BQU07QUFBQSxVQUNoRixJQUFJLE1BQU0sU0FBUyxNQUFNLEdBQUcsTUFBTSxNQUFNLEdBQUcsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRztBQUFBLFlBQ25FLFlBQVksVUFBVSxNQUFNLEdBQUcsTUFBTSxLQUFLLElBQUksTUFBTSxJQUFJLE9BQU8sTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLE1BQU0sVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sY0FBYyxTQUFTO0FBQUEsVUFDbks7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUVBLFFBQVEsUUFBUSxLQUFLLFVBQVUsTUFBTSxPQUFPLFVBQVUsS0FBSyxTQUFTLE1BQU0sTUFBTTtBQUFBLE1BQzVFLFlBQVksVUFBVSxNQUFNLEdBQUcsTUFBTSxLQUFLLElBQUksTUFBTSxJQUFJLE9BQU8sTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLE1BQU0sVUFBVSxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sVUFBVSxTQUFTO0FBQUEsSUFDL0o7QUFBQSxJQUVBLFFBQVEsUUFBUSxLQUFLLFVBQVUsTUFBTSxPQUFPLGVBQWUsS0FBSyxTQUFTLE1BQU0sTUFBTTtBQUFBLE1BQ2pGLFlBQVksVUFBVSxNQUFNLEdBQUcsTUFBTSxLQUFLLElBQUksT0FBTyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sT0FBTyxlQUFlLFNBQVM7QUFBQSxJQUM3SDtBQUFBLElBQ0EsT0FBTyxLQUFLO0FBQUEsTUFDUixJQUFJLENBQUMsY0FBYztBQUFBLFFBQ2YsV0FBVztBQUFBLE1BQ2Y7QUFBQSxNQUNBLGVBQWU7QUFBQSxNQUVmLElBQUksS0FBSyxRQUFRLGNBQ1YsS0FBSyxRQUFRLFdBQVcsVUFDeEIsS0FBSyxRQUFRLFdBQVcsT0FBTyxLQUFLLENBQUMsaUJBQWlCO0FBQUEsUUFDckQsSUFBSSxRQUFRLGFBQWEsS0FBSyxFQUFFLE9BQU8sS0FBSyxHQUFHLEtBQUssTUFBTSxHQUFHO0FBQUEsVUFDekQsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxVQUNwQyxPQUFPLEtBQUssS0FBSztBQUFBLFVBQ2pCLE9BQU87QUFBQSxRQUNYO0FBQUEsUUFDQSxPQUFPO0FBQUEsT0FDVixHQUFHO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsT0FBTyxHQUFHLEdBQUc7QUFBQSxRQUNwQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLElBQUksR0FBRyxHQUFHO0FBQUEsUUFDakMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxZQUFZLE9BQU8sT0FBTyxTQUFTO0FBQUEsUUFDbkMsSUFBSSxhQUFhLE1BQU0sU0FBUyxVQUFVLFVBQVUsU0FBUyxRQUFRO0FBQUEsVUFDakUsVUFBVSxPQUFPLE1BQU07QUFBQSxVQUN2QixVQUFVLFFBQVEsTUFBTTtBQUFBLFFBQzVCLEVBQ0s7QUFBQSxVQUNELE9BQU8sS0FBSyxLQUFLO0FBQUE7QUFBQSxRQUVyQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsS0FBSyxHQUFHLEdBQUc7QUFBQSxRQUNsQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLFFBQVEsS0FBSyxLQUFLLE9BQU8sS0FBSyxHQUFHO0FBQUEsUUFDeEQsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxZQUFZLE9BQU8sT0FBTyxTQUFTO0FBQUEsUUFDbkMsSUFBSSxhQUFhLE1BQU0sU0FBUyxVQUFVLFVBQVUsU0FBUyxRQUFRO0FBQUEsVUFDakUsVUFBVSxPQUFPLE1BQU07QUFBQSxVQUN2QixVQUFVLFFBQVEsTUFBTTtBQUFBLFFBQzVCLEVBQ0s7QUFBQSxVQUNELE9BQU8sS0FBSyxLQUFLO0FBQUE7QUFBQSxRQUVyQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsU0FBUyxLQUFLLFdBQVcsUUFBUSxHQUFHO0FBQUEsUUFDM0QsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxRQUFRLEtBQUssVUFBVSxTQUFTLEdBQUcsR0FBRztBQUFBLFFBQ3RDLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsT0FBTyxLQUFLLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksUUFBUSxLQUFLLFVBQVUsR0FBRyxHQUFHLEdBQUc7QUFBQSxRQUNoQyxNQUFNLElBQUksVUFBVSxNQUFNLElBQUksTUFBTTtBQUFBLFFBQ3BDLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFFQSxJQUFJLFFBQVEsS0FBSyxVQUFVLElBQUksR0FBRyxHQUFHO0FBQUEsUUFDakMsTUFBTSxJQUFJLFVBQVUsTUFBTSxJQUFJLE1BQU07QUFBQSxRQUNwQyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BRUEsSUFBSSxRQUFRLEtBQUssVUFBVSxTQUFTLEdBQUcsR0FBRztBQUFBLFFBQ3RDLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsT0FBTyxLQUFLLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksQ0FBQyxLQUFLLE1BQU0sV0FBVyxRQUFRLEtBQUssVUFBVSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQ3pELE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsT0FBTyxLQUFLLEtBQUs7QUFBQSxRQUNqQjtBQUFBLE1BQ0o7QUFBQSxNQUdBLFNBQVM7QUFBQSxNQUNULElBQUksS0FBSyxRQUFRLGNBQWMsS0FBSyxRQUFRLFdBQVcsYUFBYTtBQUFBLFFBQ2hFLElBQUksYUFBYTtBQUFBLFFBQ2pCLE1BQU0sVUFBVSxJQUFJLE1BQU0sQ0FBQztBQUFBLFFBQzNCLElBQUk7QUFBQSxRQUNKLEtBQUssUUFBUSxXQUFXLFlBQVksUUFBUSxDQUFDLGtCQUFrQjtBQUFBLFVBQzNELFlBQVksY0FBYyxLQUFLLEVBQUUsT0FBTyxLQUFLLEdBQUcsT0FBTztBQUFBLFVBQ3ZELElBQUksT0FBTyxjQUFjLFlBQVksYUFBYSxHQUFHO0FBQUEsWUFDakQsYUFBYSxLQUFLLElBQUksWUFBWSxTQUFTO0FBQUEsVUFDL0M7QUFBQSxTQUNIO0FBQUEsUUFDRCxJQUFJLGFBQWEsWUFBWSxjQUFjLEdBQUc7QUFBQSxVQUMxQyxTQUFTLElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQztBQUFBLFFBQzVDO0FBQUEsTUFDSjtBQUFBLE1BQ0EsSUFBSSxRQUFRLEtBQUssVUFBVSxXQUFXLE1BQU0sR0FBRztBQUFBLFFBQzNDLE1BQU0sSUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNO0FBQUEsUUFDcEMsSUFBSSxNQUFNLElBQUksTUFBTSxFQUFFLE1BQU0sS0FBSztBQUFBLFVBQzdCLFdBQVcsTUFBTSxJQUFJLE1BQU0sRUFBRTtBQUFBLFFBQ2pDO0FBQUEsUUFDQSxlQUFlO0FBQUEsUUFDZixZQUFZLE9BQU8sT0FBTyxTQUFTO0FBQUEsUUFDbkMsSUFBSSxhQUFhLFVBQVUsU0FBUyxRQUFRO0FBQUEsVUFDeEMsVUFBVSxPQUFPLE1BQU07QUFBQSxVQUN2QixVQUFVLFFBQVEsTUFBTTtBQUFBLFFBQzVCLEVBQ0s7QUFBQSxVQUNELE9BQU8sS0FBSyxLQUFLO0FBQUE7QUFBQSxRQUVyQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLElBQUksS0FBSztBQUFBLFFBQ0wsTUFBTSxTQUFTLDRCQUE0QixJQUFJLFdBQVcsQ0FBQztBQUFBLFFBQzNELElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxVQUNyQixRQUFRLE1BQU0sTUFBTTtBQUFBLFVBQ3BCO0FBQUEsUUFDSixFQUNLO0FBQUEsVUFDRCxNQUFNLElBQUksTUFBTSxNQUFNO0FBQUE7QUFBQSxNQUU5QjtBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUVmO0FBQUE7QUFLQSxNQUFNLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixLQUFLLFVBQVUsV0FBVztBQUFBO0FBQUEsRUFFOUIsS0FBSyxDQUFDLE9BQU87QUFBQSxJQUNULE9BQU87QUFBQTtBQUFBLEVBRVgsSUFBSSxHQUFHLE1BQU0sTUFBTSxXQUFXO0FBQUEsSUFDMUIsTUFBTSxjQUFjLFFBQVEsSUFBSSxNQUFNLE1BQU0sSUFBSTtBQUFBLElBQ2hELE1BQU0sT0FBTyxLQUFLLFFBQVEsT0FBTyxFQUFFLElBQUk7QUFBQTtBQUFBLElBQ3ZDLElBQUksQ0FBQyxZQUFZO0FBQUEsTUFDYixPQUFPLGlCQUNBLFVBQVUsT0FBTyxTQUFTLE1BQU0sSUFBSSxLQUNyQztBQUFBO0FBQUEsSUFDVjtBQUFBLElBQ0EsT0FBTyxnQ0FDRCxTQUFTLFVBQVUsSUFDbkIsUUFDQyxVQUFVLE9BQU8sU0FBUyxNQUFNLElBQUksS0FDckM7QUFBQTtBQUFBO0FBQUEsRUFFVixVQUFVLEdBQUcsVUFBVTtBQUFBLElBQ25CLE1BQU0sT0FBTyxLQUFLLE9BQU8sTUFBTSxNQUFNO0FBQUEsSUFDckMsT0FBTztBQUFBLEVBQWlCO0FBQUE7QUFBQTtBQUFBLEVBRTVCLElBQUksR0FBRyxRQUFRO0FBQUEsSUFDWCxPQUFPO0FBQUE7QUFBQSxFQUVYLE9BQU8sR0FBRyxRQUFRLFNBQVM7QUFBQSxJQUN2QixPQUFPLEtBQUssU0FBUyxLQUFLLE9BQU8sWUFBWSxNQUFNLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFFOUQsRUFBRSxDQUFDLE9BQU87QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFFWCxJQUFJLENBQUMsT0FBTztBQUFBLElBQ1IsTUFBTSxVQUFVLE1BQU07QUFBQSxJQUN0QixNQUFNLFFBQVEsTUFBTTtBQUFBLElBQ3BCLElBQUksT0FBTztBQUFBLElBQ1gsU0FBUyxJQUFJLEVBQUcsSUFBSSxNQUFNLE1BQU0sUUFBUSxLQUFLO0FBQUEsTUFDekMsTUFBTSxPQUFPLE1BQU0sTUFBTTtBQUFBLE1BQ3pCLFFBQVEsS0FBSyxTQUFTLElBQUk7QUFBQSxJQUM5QjtBQUFBLElBQ0EsTUFBTSxPQUFPLFVBQVUsT0FBTztBQUFBLElBQzlCLE1BQU0sWUFBYSxXQUFXLFVBQVUsSUFBTSxhQUFhLFFBQVEsTUFBTztBQUFBLElBQzFFLE9BQU8sTUFBTSxPQUFPLFlBQVk7QUFBQSxJQUFRLE9BQU8sT0FBTyxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBRWpFLFFBQVEsQ0FBQyxNQUFNO0FBQUEsSUFDWCxJQUFJLFdBQVc7QUFBQSxJQUNmLElBQUksS0FBSyxNQUFNO0FBQUEsTUFDWCxNQUFNLFdBQVcsS0FBSyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUMxRCxJQUFJLEtBQUssT0FBTztBQUFBLFFBQ1osSUFBSSxLQUFLLE9BQU8sU0FBUyxLQUFLLEtBQUssT0FBTyxHQUFHLFNBQVMsYUFBYTtBQUFBLFVBQy9ELEtBQUssT0FBTyxHQUFHLE9BQU8sV0FBVyxNQUFNLEtBQUssT0FBTyxHQUFHO0FBQUEsVUFDdEQsSUFBSSxLQUFLLE9BQU8sR0FBRyxVQUFVLEtBQUssT0FBTyxHQUFHLE9BQU8sU0FBUyxLQUFLLEtBQUssT0FBTyxHQUFHLE9BQU8sR0FBRyxTQUFTLFFBQVE7QUFBQSxZQUN2RyxLQUFLLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxXQUFXLE1BQU0sS0FBSyxPQUFPLEdBQUcsT0FBTyxHQUFHO0FBQUEsVUFDOUU7QUFBQSxRQUNKLEVBQ0s7QUFBQSxVQUNELEtBQUssT0FBTyxRQUFRO0FBQUEsWUFDaEIsTUFBTTtBQUFBLFlBQ04sS0FBSyxXQUFXO0FBQUEsWUFDaEIsTUFBTSxXQUFXO0FBQUEsVUFDckIsQ0FBQztBQUFBO0FBQUEsTUFFVCxFQUNLO0FBQUEsUUFDRCxZQUFZLFdBQVc7QUFBQTtBQUFBLElBRS9CO0FBQUEsSUFDQSxZQUFZLEtBQUssT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLO0FBQUEsSUFDdkQsT0FBTyxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBRWxCLFFBQVEsR0FBRyxXQUFXO0FBQUEsSUFDbEIsT0FBTyxhQUNBLFVBQVUsZ0JBQWdCLE1BQzNCO0FBQUE7QUFBQSxFQUVWLFNBQVMsR0FBRyxVQUFVO0FBQUEsSUFDbEIsT0FBTyxNQUFNLEtBQUssT0FBTyxZQUFZLE1BQU07QUFBQTtBQUFBO0FBQUEsRUFFL0MsS0FBSyxDQUFDLE9BQU87QUFBQSxJQUNULElBQUksU0FBUztBQUFBLElBRWIsSUFBSSxPQUFPO0FBQUEsSUFDWCxTQUFTLElBQUksRUFBRyxJQUFJLE1BQU0sT0FBTyxRQUFRLEtBQUs7QUFBQSxNQUMxQyxRQUFRLEtBQUssVUFBVSxNQUFNLE9BQU8sRUFBRTtBQUFBLElBQzFDO0FBQUEsSUFDQSxVQUFVLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQUEsSUFDdEMsSUFBSSxPQUFPO0FBQUEsSUFDWCxTQUFTLElBQUksRUFBRyxJQUFJLE1BQU0sS0FBSyxRQUFRLEtBQUs7QUFBQSxNQUN4QyxNQUFNLE1BQU0sTUFBTSxLQUFLO0FBQUEsTUFDdkIsT0FBTztBQUFBLE1BQ1AsU0FBUyxJQUFJLEVBQUcsSUFBSSxJQUFJLFFBQVEsS0FBSztBQUFBLFFBQ2pDLFFBQVEsS0FBSyxVQUFVLElBQUksRUFBRTtBQUFBLE1BQ2pDO0FBQUEsTUFDQSxRQUFRLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQUEsSUFDeEM7QUFBQSxJQUNBLElBQUk7QUFBQSxNQUNBLE9BQU8sVUFBVTtBQUFBLElBQ3JCLE9BQU87QUFBQSxJQUNEO0FBQUEsSUFDQSxTQUNBO0FBQUEsSUFDQSxPQUNBO0FBQUE7QUFBQTtBQUFBLEVBRVYsUUFBUSxHQUFHLFFBQVE7QUFBQSxJQUNmLE9BQU87QUFBQSxFQUFTO0FBQUE7QUFBQTtBQUFBLEVBRXBCLFNBQVMsQ0FBQyxPQUFPO0FBQUEsSUFDYixNQUFNLFVBQVUsS0FBSyxPQUFPLFlBQVksTUFBTSxNQUFNO0FBQUEsSUFDcEQsTUFBTSxPQUFPLE1BQU0sU0FBUyxPQUFPO0FBQUEsSUFDbkMsTUFBTSxPQUFNLE1BQU0sUUFDWixJQUFJLGVBQWUsTUFBTSxZQUN6QixJQUFJO0FBQUEsSUFDVixPQUFPLE9BQU0sVUFBVSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBS2hDLE1BQU0sR0FBRyxVQUFVO0FBQUEsSUFDZixPQUFPLFdBQVcsS0FBSyxPQUFPLFlBQVksTUFBTTtBQUFBO0FBQUEsRUFFcEQsRUFBRSxHQUFHLFVBQVU7QUFBQSxJQUNYLE9BQU8sT0FBTyxLQUFLLE9BQU8sWUFBWSxNQUFNO0FBQUE7QUFBQSxFQUVoRCxRQUFRLEdBQUcsUUFBUTtBQUFBLElBQ2YsT0FBTyxTQUFTO0FBQUE7QUFBQSxFQUVwQixFQUFFLENBQUMsT0FBTztBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsRUFFWCxHQUFHLEdBQUcsVUFBVTtBQUFBLElBQ1osT0FBTyxRQUFRLEtBQUssT0FBTyxZQUFZLE1BQU07QUFBQTtBQUFBLEVBRWpELElBQUksR0FBRyxNQUFNLE9BQU8sVUFBVTtBQUFBLElBQzFCLE1BQU0sT0FBTyxLQUFLLE9BQU8sWUFBWSxNQUFNO0FBQUEsSUFDM0MsTUFBTSxZQUFZLFNBQVMsSUFBSTtBQUFBLElBQy9CLElBQUksY0FBYyxNQUFNO0FBQUEsTUFDcEIsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUNBLE9BQU87QUFBQSxJQUNQLElBQUksTUFBTSxjQUFjLE9BQU87QUFBQSxJQUMvQixJQUFJLE9BQU87QUFBQSxNQUNQLE9BQU8sYUFBYSxRQUFRO0FBQUEsSUFDaEM7QUFBQSxJQUNBLE9BQU8sTUFBTSxPQUFPO0FBQUEsSUFDcEIsT0FBTztBQUFBO0FBQUEsRUFFWCxLQUFLLEdBQUcsTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUN6QixNQUFNLFlBQVksU0FBUyxJQUFJO0FBQUEsSUFDL0IsSUFBSSxjQUFjLE1BQU07QUFBQSxNQUNwQixPQUFPO0FBQUEsSUFDWDtBQUFBLElBQ0EsT0FBTztBQUFBLElBQ1AsSUFBSSxNQUFNLGFBQWEsY0FBYztBQUFBLElBQ3JDLElBQUksT0FBTztBQUFBLE1BQ1AsT0FBTyxXQUFXO0FBQUEsSUFDdEI7QUFBQSxJQUNBLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLEVBRVgsSUFBSSxDQUFDLE9BQU87QUFBQSxJQUNSLE9BQU8sWUFBWSxTQUFTLE1BQU0sU0FBUyxLQUFLLE9BQU8sWUFBWSxNQUFNLE1BQU0sSUFBSSxNQUFNO0FBQUE7QUFFakc7QUFBQTtBQU1BLE1BQU0sY0FBYztBQUFBLEVBRWhCLE1BQU0sR0FBRyxRQUFRO0FBQUEsSUFDYixPQUFPO0FBQUE7QUFBQSxFQUVYLEVBQUUsR0FBRyxRQUFRO0FBQUEsSUFDVCxPQUFPO0FBQUE7QUFBQSxFQUVYLFFBQVEsR0FBRyxRQUFRO0FBQUEsSUFDZixPQUFPO0FBQUE7QUFBQSxFQUVYLEdBQUcsR0FBRyxRQUFRO0FBQUEsSUFDVixPQUFPO0FBQUE7QUFBQSxFQUVYLElBQUksR0FBRyxRQUFRO0FBQUEsSUFDWCxPQUFPO0FBQUE7QUFBQSxFQUVYLElBQUksR0FBRyxRQUFRO0FBQUEsSUFDWCxPQUFPO0FBQUE7QUFBQSxFQUVYLElBQUksR0FBRyxRQUFRO0FBQUEsSUFDWCxPQUFPLEtBQUs7QUFBQTtBQUFBLEVBRWhCLEtBQUssR0FBRyxRQUFRO0FBQUEsSUFDWixPQUFPLEtBQUs7QUFBQTtBQUFBLEVBRWhCLEVBQUUsR0FBRztBQUFBLElBQ0QsT0FBTztBQUFBO0FBRWY7QUFBQTtBQUtBLE1BQU0sUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixLQUFLLFVBQVUsV0FBVztBQUFBLElBQzFCLEtBQUssUUFBUSxXQUFXLEtBQUssUUFBUSxZQUFZLElBQUk7QUFBQSxJQUNyRCxLQUFLLFdBQVcsS0FBSyxRQUFRO0FBQUEsSUFDN0IsS0FBSyxTQUFTLFVBQVUsS0FBSztBQUFBLElBQzdCLEtBQUssU0FBUyxTQUFTO0FBQUEsSUFDdkIsS0FBSyxlQUFlLElBQUk7QUFBQTtBQUFBLFNBS3JCLEtBQUssQ0FBQyxRQUFRLFNBQVM7QUFBQSxJQUMxQixNQUFNLFNBQVMsSUFBSSxRQUFRLE9BQU87QUFBQSxJQUNsQyxPQUFPLE9BQU8sTUFBTSxNQUFNO0FBQUE7QUFBQSxTQUt2QixXQUFXLENBQUMsUUFBUSxTQUFTO0FBQUEsSUFDaEMsTUFBTSxTQUFTLElBQUksUUFBUSxPQUFPO0FBQUEsSUFDbEMsT0FBTyxPQUFPLFlBQVksTUFBTTtBQUFBO0FBQUEsRUFLcEMsS0FBSyxDQUFDLFFBQVEsTUFBTSxNQUFNO0FBQUEsSUFDdEIsSUFBSSxNQUFNO0FBQUEsSUFDVixTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQUEsTUFDcEMsTUFBTSxXQUFXLE9BQU87QUFBQSxNQUV4QixJQUFJLEtBQUssUUFBUSxjQUFjLEtBQUssUUFBUSxXQUFXLGFBQWEsS0FBSyxRQUFRLFdBQVcsVUFBVSxTQUFTLE9BQU87QUFBQSxRQUNsSCxNQUFNLGVBQWU7QUFBQSxRQUNyQixNQUFNLE1BQU0sS0FBSyxRQUFRLFdBQVcsVUFBVSxhQUFhLE1BQU0sS0FBSyxFQUFFLFFBQVEsS0FBSyxHQUFHLFlBQVk7QUFBQSxRQUNwRyxJQUFJLFFBQVEsU0FBUyxDQUFDLENBQUMsU0FBUyxNQUFNLFdBQVcsUUFBUSxTQUFTLGNBQWMsUUFBUSxRQUFRLGFBQWEsTUFBTSxFQUFFLFNBQVMsYUFBYSxJQUFJLEdBQUc7QUFBQSxVQUM5SSxPQUFPLE9BQU87QUFBQSxVQUNkO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBLE1BQU0sUUFBUTtBQUFBLE1BQ2QsUUFBUSxNQUFNO0FBQUEsYUFDTCxTQUFTO0FBQUEsVUFDVixPQUFPLEtBQUssU0FBUyxNQUFNLEtBQUs7QUFBQSxVQUNoQztBQUFBLFFBQ0o7QUFBQSxhQUNLLE1BQU07QUFBQSxVQUNQLE9BQU8sS0FBSyxTQUFTLEdBQUcsS0FBSztBQUFBLFVBQzdCO0FBQUEsUUFDSjtBQUFBLGFBQ0ssV0FBVztBQUFBLFVBQ1osT0FBTyxLQUFLLFNBQVMsUUFBUSxLQUFLO0FBQUEsVUFDbEM7QUFBQSxRQUNKO0FBQUEsYUFDSyxRQUFRO0FBQUEsVUFDVCxPQUFPLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxVQUMvQjtBQUFBLFFBQ0o7QUFBQSxhQUNLLFNBQVM7QUFBQSxVQUNWLE9BQU8sS0FBSyxTQUFTLE1BQU0sS0FBSztBQUFBLFVBQ2hDO0FBQUEsUUFDSjtBQUFBLGFBQ0ssY0FBYztBQUFBLFVBQ2YsT0FBTyxLQUFLLFNBQVMsV0FBVyxLQUFLO0FBQUEsVUFDckM7QUFBQSxRQUNKO0FBQUEsYUFDSyxRQUFRO0FBQUEsVUFDVCxPQUFPLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxVQUMvQjtBQUFBLFFBQ0o7QUFBQSxhQUNLLFFBQVE7QUFBQSxVQUNULE9BQU8sS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLFVBQy9CO0FBQUEsUUFDSjtBQUFBLGFBQ0ssYUFBYTtBQUFBLFVBQ2QsT0FBTyxLQUFLLFNBQVMsVUFBVSxLQUFLO0FBQUEsVUFDcEM7QUFBQSxRQUNKO0FBQUEsYUFDSyxRQUFRO0FBQUEsVUFDVCxJQUFJLFlBQVk7QUFBQSxVQUNoQixJQUFJLE9BQU8sS0FBSyxTQUFTLEtBQUssU0FBUztBQUFBLFVBQ3ZDLE9BQU8sSUFBSSxJQUFJLE9BQU8sVUFBVSxPQUFPLElBQUksR0FBRyxTQUFTLFFBQVE7QUFBQSxZQUMzRCxZQUFZLE9BQU8sRUFBRTtBQUFBLFlBQ3JCLFFBQVE7QUFBQSxJQUFPLEtBQUssU0FBUyxLQUFLLFNBQVM7QUFBQSxVQUMvQztBQUFBLFVBQ0EsSUFBSSxLQUFLO0FBQUEsWUFDTCxPQUFPLEtBQUssU0FBUyxVQUFVO0FBQUEsY0FDM0IsTUFBTTtBQUFBLGNBQ04sS0FBSztBQUFBLGNBQ0wsTUFBTTtBQUFBLGNBQ04sUUFBUSxDQUFDLEVBQUUsTUFBTSxRQUFRLEtBQUssTUFBTSxNQUFNLEtBQUssQ0FBQztBQUFBLFlBQ3BELENBQUM7QUFBQSxVQUNMLEVBQ0s7QUFBQSxZQUNELE9BQU87QUFBQTtBQUFBLFVBRVg7QUFBQSxRQUNKO0FBQUEsaUJBQ1M7QUFBQSxVQUNMLE1BQU0sU0FBUyxpQkFBaUIsTUFBTSxPQUFPO0FBQUEsVUFDN0MsSUFBSSxLQUFLLFFBQVEsUUFBUTtBQUFBLFlBQ3JCLFFBQVEsTUFBTSxNQUFNO0FBQUEsWUFDcEIsT0FBTztBQUFBLFVBQ1gsRUFDSztBQUFBLFlBQ0QsTUFBTSxJQUFJLE1BQU0sTUFBTTtBQUFBO0FBQUEsUUFFOUI7QUFBQTtBQUFBLElBRVI7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLEVBS1gsV0FBVyxDQUFDLFFBQVEsVUFBVTtBQUFBLElBQzFCLFdBQVcsWUFBWSxLQUFLO0FBQUEsSUFDNUIsSUFBSSxNQUFNO0FBQUEsSUFDVixTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQUEsTUFDcEMsTUFBTSxXQUFXLE9BQU87QUFBQSxNQUV4QixJQUFJLEtBQUssUUFBUSxjQUFjLEtBQUssUUFBUSxXQUFXLGFBQWEsS0FBSyxRQUFRLFdBQVcsVUFBVSxTQUFTLE9BQU87QUFBQSxRQUNsSCxNQUFNLE1BQU0sS0FBSyxRQUFRLFdBQVcsVUFBVSxTQUFTLE1BQU0sS0FBSyxFQUFFLFFBQVEsS0FBSyxHQUFHLFFBQVE7QUFBQSxRQUM1RixJQUFJLFFBQVEsU0FBUyxDQUFDLENBQUMsVUFBVSxRQUFRLFFBQVEsU0FBUyxVQUFVLE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTSxFQUFFLFNBQVMsU0FBUyxJQUFJLEdBQUc7QUFBQSxVQUNoSSxPQUFPLE9BQU87QUFBQSxVQUNkO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBLE1BQU0sUUFBUTtBQUFBLE1BQ2QsUUFBUSxNQUFNO0FBQUEsYUFDTCxVQUFVO0FBQUEsVUFDWCxPQUFPLFNBQVMsS0FBSyxLQUFLO0FBQUEsVUFDMUI7QUFBQSxRQUNKO0FBQUEsYUFDSyxRQUFRO0FBQUEsVUFDVCxPQUFPLFNBQVMsS0FBSyxLQUFLO0FBQUEsVUFDMUI7QUFBQSxRQUNKO0FBQUEsYUFDSyxRQUFRO0FBQUEsVUFDVCxPQUFPLFNBQVMsS0FBSyxLQUFLO0FBQUEsVUFDMUI7QUFBQSxRQUNKO0FBQUEsYUFDSyxTQUFTO0FBQUEsVUFDVixPQUFPLFNBQVMsTUFBTSxLQUFLO0FBQUEsVUFDM0I7QUFBQSxRQUNKO0FBQUEsYUFDSyxVQUFVO0FBQUEsVUFDWCxPQUFPLFNBQVMsT0FBTyxLQUFLO0FBQUEsVUFDNUI7QUFBQSxRQUNKO0FBQUEsYUFDSyxNQUFNO0FBQUEsVUFDUCxPQUFPLFNBQVMsR0FBRyxLQUFLO0FBQUEsVUFDeEI7QUFBQSxRQUNKO0FBQUEsYUFDSyxZQUFZO0FBQUEsVUFDYixPQUFPLFNBQVMsU0FBUyxLQUFLO0FBQUEsVUFDOUI7QUFBQSxRQUNKO0FBQUEsYUFDSyxNQUFNO0FBQUEsVUFDUCxPQUFPLFNBQVMsR0FBRyxLQUFLO0FBQUEsVUFDeEI7QUFBQSxRQUNKO0FBQUEsYUFDSyxPQUFPO0FBQUEsVUFDUixPQUFPLFNBQVMsSUFBSSxLQUFLO0FBQUEsVUFDekI7QUFBQSxRQUNKO0FBQUEsYUFDSyxRQUFRO0FBQUEsVUFDVCxPQUFPLFNBQVMsS0FBSyxLQUFLO0FBQUEsVUFDMUI7QUFBQSxRQUNKO0FBQUEsaUJBQ1M7QUFBQSxVQUNMLE1BQU0sU0FBUyxpQkFBaUIsTUFBTSxPQUFPO0FBQUEsVUFDN0MsSUFBSSxLQUFLLFFBQVEsUUFBUTtBQUFBLFlBQ3JCLFFBQVEsTUFBTSxNQUFNO0FBQUEsWUFDcEIsT0FBTztBQUFBLFVBQ1gsRUFDSztBQUFBLFlBQ0QsTUFBTSxJQUFJLE1BQU0sTUFBTTtBQUFBO0FBQUEsUUFFOUI7QUFBQTtBQUFBLElBRVI7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUVmO0FBQUE7QUFFQSxNQUFNLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUFBLEVBQ0EsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixLQUFLLFVBQVUsV0FBVztBQUFBO0FBQUEsU0FFdkIsbUJBQW1CLElBQUksSUFBSTtBQUFBLElBQzlCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKLENBQUM7QUFBQSxFQUlELFVBQVUsQ0FBQyxVQUFVO0FBQUEsSUFDakIsT0FBTztBQUFBO0FBQUEsRUFLWCxXQUFXLENBQUMsT0FBTTtBQUFBLElBQ2QsT0FBTztBQUFBO0FBQUEsRUFLWCxnQkFBZ0IsQ0FBQyxRQUFRO0FBQUEsSUFDckIsT0FBTztBQUFBO0FBQUEsRUFLWCxZQUFZLEdBQUc7QUFBQSxJQUNYLE9BQU8sS0FBSyxRQUFRLE9BQU8sTUFBTSxPQUFPO0FBQUE7QUFBQSxFQUs1QyxhQUFhLEdBQUc7QUFBQSxJQUNaLE9BQU8sS0FBSyxRQUFRLFFBQVEsUUFBUSxRQUFRO0FBQUE7QUFFcEQ7QUFBQTtBQUVBLE1BQU0sT0FBTztBQUFBLEVBQ1QsV0FBVyxhQUFhO0FBQUEsRUFDeEIsVUFBVSxLQUFLO0FBQUEsRUFDZixRQUFRLEtBQUssY0FBYyxJQUFJO0FBQUEsRUFDL0IsY0FBYyxLQUFLLGNBQWMsS0FBSztBQUFBLEVBQ3RDLFNBQVM7QUFBQSxFQUNULFdBQVc7QUFBQSxFQUNYLGVBQWU7QUFBQSxFQUNmLFFBQVE7QUFBQSxFQUNSLFlBQVk7QUFBQSxFQUNaLFFBQVE7QUFBQSxFQUNSLFdBQVcsSUFBSSxNQUFNO0FBQUEsSUFDakIsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBO0FBQUEsRUFLcEIsVUFBVSxDQUFDLFFBQVEsVUFBVTtBQUFBLElBQ3pCLElBQUksU0FBUyxDQUFDO0FBQUEsSUFDZCxXQUFXLFNBQVMsUUFBUTtBQUFBLE1BQ3hCLFNBQVMsT0FBTyxPQUFPLFNBQVMsS0FBSyxNQUFNLEtBQUssQ0FBQztBQUFBLE1BQ2pELFFBQVEsTUFBTTtBQUFBLGFBQ0wsU0FBUztBQUFBLFVBQ1YsTUFBTSxhQUFhO0FBQUEsVUFDbkIsV0FBVyxRQUFRLFdBQVcsUUFBUTtBQUFBLFlBQ2xDLFNBQVMsT0FBTyxPQUFPLEtBQUssV0FBVyxLQUFLLFFBQVEsUUFBUSxDQUFDO0FBQUEsVUFDakU7QUFBQSxVQUNBLFdBQVcsT0FBTyxXQUFXLE1BQU07QUFBQSxZQUMvQixXQUFXLFFBQVEsS0FBSztBQUFBLGNBQ3BCLFNBQVMsT0FBTyxPQUFPLEtBQUssV0FBVyxLQUFLLFFBQVEsUUFBUSxDQUFDO0FBQUEsWUFDakU7QUFBQSxVQUNKO0FBQUEsVUFDQTtBQUFBLFFBQ0o7QUFBQSxhQUNLLFFBQVE7QUFBQSxVQUNULE1BQU0sWUFBWTtBQUFBLFVBQ2xCLFNBQVMsT0FBTyxPQUFPLEtBQUssV0FBVyxVQUFVLE9BQU8sUUFBUSxDQUFDO0FBQUEsVUFDakU7QUFBQSxRQUNKO0FBQUEsaUJBQ1M7QUFBQSxVQUNMLE1BQU0sZUFBZTtBQUFBLFVBQ3JCLElBQUksS0FBSyxTQUFTLFlBQVksY0FBYyxhQUFhLE9BQU87QUFBQSxZQUM1RCxLQUFLLFNBQVMsV0FBVyxZQUFZLGFBQWEsTUFBTSxRQUFRLENBQUMsZ0JBQWdCO0FBQUEsY0FDN0UsTUFBTSxVQUFTLGFBQWEsYUFBYSxLQUFLLFFBQVE7QUFBQSxjQUN0RCxTQUFTLE9BQU8sT0FBTyxLQUFLLFdBQVcsU0FBUSxRQUFRLENBQUM7QUFBQSxhQUMzRDtBQUFBLFVBQ0wsRUFDSyxTQUFJLGFBQWEsUUFBUTtBQUFBLFlBQzFCLFNBQVMsT0FBTyxPQUFPLEtBQUssV0FBVyxhQUFhLFFBQVEsUUFBUSxDQUFDO0FBQUEsVUFDekU7QUFBQSxRQUNKO0FBQUE7QUFBQSxJQUVSO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUVYLEdBQUcsSUFBSSxNQUFNO0FBQUEsSUFDVCxNQUFNLGFBQWEsS0FBSyxTQUFTLGNBQWMsRUFBRSxXQUFXLENBQUMsR0FBRyxhQUFhLENBQUMsRUFBRTtBQUFBLElBQ2hGLEtBQUssUUFBUSxDQUFDLFNBQVM7QUFBQSxNQUVuQixNQUFNLE9BQU8sS0FBSyxLQUFLO0FBQUEsTUFFdkIsS0FBSyxRQUFRLEtBQUssU0FBUyxTQUFTLEtBQUssU0FBUztBQUFBLE1BRWxELElBQUksS0FBSyxZQUFZO0FBQUEsUUFDakIsS0FBSyxXQUFXLFFBQVEsQ0FBQyxRQUFRO0FBQUEsVUFDN0IsSUFBSSxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ1gsTUFBTSxJQUFJLE1BQU0seUJBQXlCO0FBQUEsVUFDN0M7QUFBQSxVQUNBLElBQUksY0FBYyxLQUFLO0FBQUEsWUFDbkIsTUFBTSxlQUFlLFdBQVcsVUFBVSxJQUFJO0FBQUEsWUFDOUMsSUFBSSxjQUFjO0FBQUEsY0FFZCxXQUFXLFVBQVUsSUFBSSxRQUFRLFFBQVMsSUFBSSxPQUFNO0FBQUEsZ0JBQ2hELElBQUksTUFBTSxJQUFJLFNBQVMsTUFBTSxNQUFNLEtBQUk7QUFBQSxnQkFDdkMsSUFBSSxRQUFRLE9BQU87QUFBQSxrQkFDZixNQUFNLGFBQWEsTUFBTSxNQUFNLEtBQUk7QUFBQSxnQkFDdkM7QUFBQSxnQkFDQSxPQUFPO0FBQUE7QUFBQSxZQUVmLEVBQ0s7QUFBQSxjQUNELFdBQVcsVUFBVSxJQUFJLFFBQVEsSUFBSTtBQUFBO0FBQUEsVUFFN0M7QUFBQSxVQUNBLElBQUksZUFBZSxLQUFLO0FBQUEsWUFDcEIsSUFBSSxDQUFDLElBQUksU0FBVSxJQUFJLFVBQVUsV0FBVyxJQUFJLFVBQVUsVUFBVztBQUFBLGNBQ2pFLE1BQU0sSUFBSSxNQUFNLDZDQUE2QztBQUFBLFlBQ2pFO0FBQUEsWUFDQSxNQUFNLFdBQVcsV0FBVyxJQUFJO0FBQUEsWUFDaEMsSUFBSSxVQUFVO0FBQUEsY0FDVixTQUFTLFFBQVEsSUFBSSxTQUFTO0FBQUEsWUFDbEMsRUFDSztBQUFBLGNBQ0QsV0FBVyxJQUFJLFNBQVMsQ0FBQyxJQUFJLFNBQVM7QUFBQTtBQUFBLFlBRTFDLElBQUksSUFBSSxPQUFPO0FBQUEsY0FDWCxJQUFJLElBQUksVUFBVSxTQUFTO0FBQUEsZ0JBQ3ZCLElBQUksV0FBVyxZQUFZO0FBQUEsa0JBQ3ZCLFdBQVcsV0FBVyxLQUFLLElBQUksS0FBSztBQUFBLGdCQUN4QyxFQUNLO0FBQUEsa0JBQ0QsV0FBVyxhQUFhLENBQUMsSUFBSSxLQUFLO0FBQUE7QUFBQSxjQUUxQyxFQUNLLFNBQUksSUFBSSxVQUFVLFVBQVU7QUFBQSxnQkFDN0IsSUFBSSxXQUFXLGFBQWE7QUFBQSxrQkFDeEIsV0FBVyxZQUFZLEtBQUssSUFBSSxLQUFLO0FBQUEsZ0JBQ3pDLEVBQ0s7QUFBQSxrQkFDRCxXQUFXLGNBQWMsQ0FBQyxJQUFJLEtBQUs7QUFBQTtBQUFBLGNBRTNDO0FBQUEsWUFDSjtBQUFBLFVBQ0o7QUFBQSxVQUNBLElBQUksaUJBQWlCLE9BQU8sSUFBSSxhQUFhO0FBQUEsWUFDekMsV0FBVyxZQUFZLElBQUksUUFBUSxJQUFJO0FBQUEsVUFDM0M7QUFBQSxTQUNIO0FBQUEsUUFDRCxLQUFLLGFBQWE7QUFBQSxNQUN0QjtBQUFBLE1BRUEsSUFBSSxLQUFLLFVBQVU7QUFBQSxRQUNmLE1BQU0sV0FBVyxLQUFLLFNBQVMsWUFBWSxJQUFJLFVBQVUsS0FBSyxRQUFRO0FBQUEsUUFDdEUsV0FBVyxRQUFRLEtBQUssVUFBVTtBQUFBLFVBQzlCLElBQUksRUFBRSxRQUFRLFdBQVc7QUFBQSxZQUNyQixNQUFNLElBQUksTUFBTSxhQUFhLHNCQUFzQjtBQUFBLFVBQ3ZEO0FBQUEsVUFDQSxJQUFJLENBQUMsV0FBVyxRQUFRLEVBQUUsU0FBUyxJQUFJLEdBQUc7QUFBQSxZQUV0QztBQUFBLFVBQ0o7QUFBQSxVQUNBLE1BQU0sZUFBZTtBQUFBLFVBQ3JCLE1BQU0sZUFBZSxLQUFLLFNBQVM7QUFBQSxVQUNuQyxNQUFNLGVBQWUsU0FBUztBQUFBLFVBRTlCLFNBQVMsZ0JBQWdCLElBQUksVUFBUztBQUFBLFlBQ2xDLElBQUksTUFBTSxhQUFhLE1BQU0sVUFBVSxLQUFJO0FBQUEsWUFDM0MsSUFBSSxRQUFRLE9BQU87QUFBQSxjQUNmLE1BQU0sYUFBYSxNQUFNLFVBQVUsS0FBSTtBQUFBLFlBQzNDO0FBQUEsWUFDQSxPQUFPLE9BQU87QUFBQTtBQUFBLFFBRXRCO0FBQUEsUUFDQSxLQUFLLFdBQVc7QUFBQSxNQUNwQjtBQUFBLE1BQ0EsSUFBSSxLQUFLLFdBQVc7QUFBQSxRQUNoQixNQUFNLFlBQVksS0FBSyxTQUFTLGFBQWEsSUFBSSxXQUFXLEtBQUssUUFBUTtBQUFBLFFBQ3pFLFdBQVcsUUFBUSxLQUFLLFdBQVc7QUFBQSxVQUMvQixJQUFJLEVBQUUsUUFBUSxZQUFZO0FBQUEsWUFDdEIsTUFBTSxJQUFJLE1BQU0sY0FBYyxzQkFBc0I7QUFBQSxVQUN4RDtBQUFBLFVBQ0EsSUFBSSxDQUFDLFdBQVcsU0FBUyxPQUFPLEVBQUUsU0FBUyxJQUFJLEdBQUc7QUFBQSxZQUU5QztBQUFBLFVBQ0o7QUFBQSxVQUNBLE1BQU0sZ0JBQWdCO0FBQUEsVUFDdEIsTUFBTSxnQkFBZ0IsS0FBSyxVQUFVO0FBQUEsVUFDckMsTUFBTSxnQkFBZ0IsVUFBVTtBQUFBLFVBR2hDLFVBQVUsaUJBQWlCLElBQUksVUFBUztBQUFBLFlBQ3BDLElBQUksTUFBTSxjQUFjLE1BQU0sV0FBVyxLQUFJO0FBQUEsWUFDN0MsSUFBSSxRQUFRLE9BQU87QUFBQSxjQUNmLE1BQU0sY0FBYyxNQUFNLFdBQVcsS0FBSTtBQUFBLFlBQzdDO0FBQUEsWUFDQSxPQUFPO0FBQUE7QUFBQSxRQUVmO0FBQUEsUUFDQSxLQUFLLFlBQVk7QUFBQSxNQUNyQjtBQUFBLE1BRUEsSUFBSSxLQUFLLE9BQU87QUFBQSxRQUNaLE1BQU0sUUFBUSxLQUFLLFNBQVMsU0FBUyxJQUFJO0FBQUEsUUFDekMsV0FBVyxRQUFRLEtBQUssT0FBTztBQUFBLFVBQzNCLElBQUksRUFBRSxRQUFRLFFBQVE7QUFBQSxZQUNsQixNQUFNLElBQUksTUFBTSxTQUFTLHNCQUFzQjtBQUFBLFVBQ25EO0FBQUEsVUFDQSxJQUFJLENBQUMsV0FBVyxPQUFPLEVBQUUsU0FBUyxJQUFJLEdBQUc7QUFBQSxZQUVyQztBQUFBLFVBQ0o7QUFBQSxVQUNBLE1BQU0sWUFBWTtBQUFBLFVBQ2xCLE1BQU0sWUFBWSxLQUFLLE1BQU07QUFBQSxVQUM3QixNQUFNLFdBQVcsTUFBTTtBQUFBLFVBQ3ZCLElBQUksT0FBTyxpQkFBaUIsSUFBSSxJQUFJLEdBQUc7QUFBQSxZQUVuQyxNQUFNLGFBQWEsQ0FBQyxRQUFRO0FBQUEsY0FDeEIsSUFBSSxLQUFLLFNBQVMsT0FBTztBQUFBLGdCQUNyQixPQUFPLFFBQVEsUUFBUSxVQUFVLEtBQUssT0FBTyxHQUFHLENBQUMsRUFBRSxLQUFLLFVBQU87QUFBQSxrQkFDM0QsT0FBTyxTQUFTLEtBQUssT0FBTyxJQUFHO0FBQUEsaUJBQ2xDO0FBQUEsY0FDTDtBQUFBLGNBQ0EsTUFBTSxNQUFNLFVBQVUsS0FBSyxPQUFPLEdBQUc7QUFBQSxjQUNyQyxPQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUc7QUFBQTtBQUFBLFVBRXZDLEVBQ0s7QUFBQSxZQUVELE1BQU0sYUFBYSxJQUFJLFVBQVM7QUFBQSxjQUM1QixJQUFJLE1BQU0sVUFBVSxNQUFNLE9BQU8sS0FBSTtBQUFBLGNBQ3JDLElBQUksUUFBUSxPQUFPO0FBQUEsZ0JBQ2YsTUFBTSxTQUFTLE1BQU0sT0FBTyxLQUFJO0FBQUEsY0FDcEM7QUFBQSxjQUNBLE9BQU87QUFBQTtBQUFBO0FBQUEsUUFHbkI7QUFBQSxRQUNBLEtBQUssUUFBUTtBQUFBLE1BQ2pCO0FBQUEsTUFFQSxJQUFJLEtBQUssWUFBWTtBQUFBLFFBQ2pCLE1BQU0sYUFBYSxLQUFLLFNBQVM7QUFBQSxRQUNqQyxNQUFNLGlCQUFpQixLQUFLO0FBQUEsUUFDNUIsS0FBSyxhQUFhLFFBQVMsQ0FBQyxPQUFPO0FBQUEsVUFDL0IsSUFBSSxTQUFTLENBQUM7QUFBQSxVQUNkLE9BQU8sS0FBSyxlQUFlLEtBQUssTUFBTSxLQUFLLENBQUM7QUFBQSxVQUM1QyxJQUFJLFlBQVk7QUFBQSxZQUNaLFNBQVMsT0FBTyxPQUFPLFdBQVcsS0FBSyxNQUFNLEtBQUssQ0FBQztBQUFBLFVBQ3ZEO0FBQUEsVUFDQSxPQUFPO0FBQUE7QUFBQSxNQUVmO0FBQUEsTUFDQSxLQUFLLFdBQVcsS0FBSyxLQUFLLGFBQWEsS0FBSztBQUFBLEtBQy9DO0FBQUEsSUFDRCxPQUFPO0FBQUE7QUFBQSxFQUVYLFVBQVUsQ0FBQyxLQUFLO0FBQUEsSUFDWixLQUFLLFdBQVcsS0FBSyxLQUFLLGFBQWEsSUFBSTtBQUFBLElBQzNDLE9BQU87QUFBQTtBQUFBLEVBRVgsS0FBSyxDQUFDLEtBQUssU0FBUztBQUFBLElBQ2hCLE9BQU8sT0FBTyxJQUFJLEtBQUssV0FBVyxLQUFLLFFBQVE7QUFBQTtBQUFBLEVBRW5ELE1BQU0sQ0FBQyxRQUFRLFNBQVM7QUFBQSxJQUNwQixPQUFPLFFBQVEsTUFBTSxRQUFRLFdBQVcsS0FBSyxRQUFRO0FBQUE7QUFBQSxFQUV6RCxhQUFhLENBQUMsV0FBVztBQUFBLElBRXJCLE1BQU0sUUFBUSxDQUFDLEtBQUssWUFBWTtBQUFBLE1BQzVCLE1BQU0sVUFBVSxLQUFLLFFBQVE7QUFBQSxNQUM3QixNQUFNLE1BQU0sS0FBSyxLQUFLLGFBQWEsUUFBUTtBQUFBLE1BQzNDLE1BQU0sYUFBYSxLQUFLLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsSUFBSSxLQUFLO0FBQUEsTUFFekQsSUFBSSxLQUFLLFNBQVMsVUFBVSxRQUFRLFFBQVEsVUFBVSxPQUFPO0FBQUEsUUFDekQsT0FBTyxXQUFXLElBQUksTUFBTSxvSUFBb0ksQ0FBQztBQUFBLE1BQ3JLO0FBQUEsTUFFQSxJQUFJLE9BQU8sUUFBUSxlQUFlLFFBQVEsTUFBTTtBQUFBLFFBQzVDLE9BQU8sV0FBVyxJQUFJLE1BQU0sZ0RBQWdELENBQUM7QUFBQSxNQUNqRjtBQUFBLE1BQ0EsSUFBSSxPQUFPLFFBQVEsVUFBVTtBQUFBLFFBQ3pCLE9BQU8sV0FBVyxJQUFJLE1BQU0sMENBQ3RCLE9BQU8sVUFBVSxTQUFTLEtBQUssR0FBRyxJQUFJLG1CQUFtQixDQUFDO0FBQUEsTUFDcEU7QUFBQSxNQUNBLElBQUksSUFBSSxPQUFPO0FBQUEsUUFDWCxJQUFJLE1BQU0sVUFBVTtBQUFBLFFBQ3BCLElBQUksTUFBTSxRQUFRO0FBQUEsTUFDdEI7QUFBQSxNQUNBLE1BQU0sUUFBUSxJQUFJLFFBQVEsSUFBSSxNQUFNLGFBQWEsSUFBSyxZQUFZLE9BQU8sTUFBTSxPQUFPO0FBQUEsTUFDdEYsTUFBTSxTQUFTLElBQUksUUFBUSxJQUFJLE1BQU0sY0FBYyxJQUFLLFlBQVksUUFBUSxRQUFRLFFBQVE7QUFBQSxNQUM1RixJQUFJLElBQUksT0FBTztBQUFBLFFBQ1gsT0FBTyxRQUFRLFFBQVEsSUFBSSxRQUFRLElBQUksTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQzdELEtBQUssVUFBTyxNQUFNLE1BQUssR0FBRyxDQUFDLEVBQzNCLEtBQUssWUFBVSxJQUFJLFFBQVEsSUFBSSxNQUFNLGlCQUFpQixNQUFNLElBQUksTUFBTSxFQUN0RSxLQUFLLFlBQVUsSUFBSSxhQUFhLFFBQVEsSUFBSSxLQUFLLFdBQVcsUUFBUSxJQUFJLFVBQVUsQ0FBQyxFQUFFLEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxFQUNoSCxLQUFLLFlBQVUsT0FBTyxRQUFRLEdBQUcsQ0FBQyxFQUNsQyxLQUFLLFdBQVEsSUFBSSxRQUFRLElBQUksTUFBTSxZQUFZLEtBQUksSUFBSSxLQUFJLEVBQzNELE1BQU0sVUFBVTtBQUFBLE1BQ3pCO0FBQUEsTUFDQSxJQUFJO0FBQUEsUUFDQSxJQUFJLElBQUksT0FBTztBQUFBLFVBQ1gsTUFBTSxJQUFJLE1BQU0sV0FBVyxHQUFHO0FBQUEsUUFDbEM7QUFBQSxRQUNBLElBQUksU0FBUyxNQUFNLEtBQUssR0FBRztBQUFBLFFBQzNCLElBQUksSUFBSSxPQUFPO0FBQUEsVUFDWCxTQUFTLElBQUksTUFBTSxpQkFBaUIsTUFBTTtBQUFBLFFBQzlDO0FBQUEsUUFDQSxJQUFJLElBQUksWUFBWTtBQUFBLFVBQ2hCLEtBQUssV0FBVyxRQUFRLElBQUksVUFBVTtBQUFBLFFBQzFDO0FBQUEsUUFDQSxJQUFJLFFBQU8sT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUM3QixJQUFJLElBQUksT0FBTztBQUFBLFVBQ1gsUUFBTyxJQUFJLE1BQU0sWUFBWSxLQUFJO0FBQUEsUUFDckM7QUFBQSxRQUNBLE9BQU87QUFBQSxRQUVYLE9BQU8sR0FBRztBQUFBLFFBQ04sT0FBTyxXQUFXLENBQUM7QUFBQTtBQUFBO0FBQUEsSUFHM0IsT0FBTztBQUFBO0FBQUEsRUFFWCxPQUFPLENBQUMsUUFBUSxPQUFPO0FBQUEsSUFDbkIsT0FBTyxDQUFDLE1BQU07QUFBQSxNQUNWLEVBQUUsV0FBVztBQUFBO0FBQUEsTUFDYixJQUFJLFFBQVE7QUFBQSxRQUNSLE1BQU0sTUFBTSxtQ0FDTixTQUFTLEVBQUUsVUFBVSxJQUFJLElBQUksSUFDN0I7QUFBQSxRQUNOLElBQUksT0FBTztBQUFBLFVBQ1AsT0FBTyxRQUFRLFFBQVEsR0FBRztBQUFBLFFBQzlCO0FBQUEsUUFDQSxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0EsSUFBSSxPQUFPO0FBQUEsUUFDUCxPQUFPLFFBQVEsT0FBTyxDQUFDO0FBQUEsTUFDM0I7QUFBQSxNQUNBLE1BQU07QUFBQTtBQUFBO0FBR2xCO0FBRUEsSUFBTSxpQkFBaUIsSUFBSTtBQUMzQixTQUFTLE1BQU0sQ0FBQyxLQUFLLEtBQUs7QUFBQSxFQUN0QixPQUFPLGVBQWUsTUFBTSxLQUFLLEdBQUc7QUFBQTtBQU94QyxPQUFPLFVBQ0gsT0FBTyxhQUFhLFFBQVMsQ0FBQyxTQUFTO0FBQUEsRUFDbkMsZUFBZSxXQUFXLE9BQU87QUFBQSxFQUNqQyxPQUFPLFdBQVcsZUFBZTtBQUFBLEVBQ2pDLGVBQWUsT0FBTyxRQUFRO0FBQUEsRUFDOUIsT0FBTztBQUFBO0FBS2YsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sV0FBVztBQUlsQixPQUFPLE1BQU0sUUFBUyxJQUFJLE1BQU07QUFBQSxFQUM1QixlQUFlLElBQUksR0FBRyxJQUFJO0FBQUEsRUFDMUIsT0FBTyxXQUFXLGVBQWU7QUFBQSxFQUNqQyxlQUFlLE9BQU8sUUFBUTtBQUFBLEVBQzlCLE9BQU87QUFBQTtBQUtYLE9BQU8sYUFBYSxRQUFTLENBQUMsUUFBUSxVQUFVO0FBQUEsRUFDNUMsT0FBTyxlQUFlLFdBQVcsUUFBUSxRQUFRO0FBQUE7QUFTckQsT0FBTyxjQUFjLGVBQWU7QUFJcEMsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sU0FBUyxRQUFRO0FBQ3hCLE9BQU8sV0FBVztBQUNsQixPQUFPLGVBQWU7QUFDdEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxRQUFRLE9BQU87QUFDdEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sUUFBUTtBQUNmLE9BQU8sUUFBUTtBQUNmLElBQU0sVUFBVSxPQUFPO0FBQ3ZCLElBQU0sYUFBYSxPQUFPO0FBQzFCLElBQU0sTUFBTSxPQUFPO0FBQ25CLElBQU0sYUFBYSxPQUFPO0FBQzFCLElBQU0sY0FBYyxPQUFPO0FBRTNCLElBQU0sU0FBUyxRQUFRO0FBQ3ZCLElBQU0sUUFBUSxPQUFPOzs7QUNsOEVyQjs7O0FDREEsU0FBUyxVQUFVLENBQUMsTUFBSztBQUFBLEVBQUMsSUFBRyxPQUFPLFNBQU87QUFBQSxJQUFTLE1BQU0sVUFBVSxxQ0FBbUMsS0FBSyxVQUFVLElBQUksQ0FBQztBQUFBO0FBQUUsU0FBUyxvQkFBb0IsQ0FBQyxNQUFLLGdCQUFlO0FBQUEsRUFBQyxJQUFJLE1BQUksSUFBRyxvQkFBa0IsR0FBRSxZQUFVLElBQUcsT0FBSyxHQUFFO0FBQUEsRUFBSyxTQUFRLElBQUUsRUFBRSxLQUFHLEtBQUssUUFBTyxFQUFFLEdBQUU7QUFBQSxJQUFDLElBQUcsSUFBRSxLQUFLO0FBQUEsTUFBTyxPQUFLLEtBQUssV0FBVyxDQUFDO0FBQUEsSUFBTyxTQUFHLFNBQU87QUFBQSxNQUFHO0FBQUEsSUFBVztBQUFBLGFBQUs7QUFBQSxJQUFHLElBQUcsU0FBTyxJQUFHO0FBQUEsTUFBQyxJQUFHLGNBQVksSUFBRSxLQUFHLFNBQU87QUFBQTtBQUFBLE1BQVEsU0FBRyxjQUFZLElBQUUsS0FBRyxTQUFPLEdBQUU7QUFBQSxRQUFDLElBQUcsSUFBSSxTQUFPLEtBQUcsc0JBQW9CLEtBQUcsSUFBSSxXQUFXLElBQUksU0FBTyxDQUFDLE1BQUksTUFBSSxJQUFJLFdBQVcsSUFBSSxTQUFPLENBQUMsTUFBSSxJQUFHO0FBQUEsVUFBQyxJQUFHLElBQUksU0FBTyxHQUFFO0FBQUEsWUFBQyxJQUFJLGlCQUFlLElBQUksWUFBWSxHQUFHO0FBQUEsWUFBRSxJQUFHLG1CQUFpQixJQUFJLFNBQU8sR0FBRTtBQUFBLGNBQUMsSUFBRyxtQkFBaUI7QUFBQSxnQkFBRyxNQUFJLElBQUcsb0JBQWtCO0FBQUEsY0FBTztBQUFBLHNCQUFJLElBQUksTUFBTSxHQUFFLGNBQWMsR0FBRSxvQkFBa0IsSUFBSSxTQUFPLElBQUUsSUFBSSxZQUFZLEdBQUc7QUFBQSxjQUFFLFlBQVUsR0FBRSxPQUFLO0FBQUEsY0FBRTtBQUFBLFlBQVE7QUFBQSxVQUFDLEVBQU0sU0FBRyxJQUFJLFdBQVMsS0FBRyxJQUFJLFdBQVMsR0FBRTtBQUFBLFlBQUMsTUFBSSxJQUFHLG9CQUFrQixHQUFFLFlBQVUsR0FBRSxPQUFLO0FBQUEsWUFBRTtBQUFBLFVBQVE7QUFBQSxRQUFDO0FBQUEsUUFBQyxJQUFHLGdCQUFlO0FBQUEsVUFBQyxJQUFHLElBQUksU0FBTztBQUFBLFlBQUUsT0FBSztBQUFBLFVBQVc7QUFBQSxrQkFBSTtBQUFBLFVBQUssb0JBQWtCO0FBQUEsUUFBQztBQUFBLE1BQUMsRUFBSztBQUFBLFFBQUMsSUFBRyxJQUFJLFNBQU87QUFBQSxVQUFFLE9BQUssTUFBSSxLQUFLLE1BQU0sWUFBVSxHQUFFLENBQUM7QUFBQSxRQUFPO0FBQUEsZ0JBQUksS0FBSyxNQUFNLFlBQVUsR0FBRSxDQUFDO0FBQUEsUUFBRSxvQkFBa0IsSUFBRSxZQUFVO0FBQUE7QUFBQSxNQUFFLFlBQVUsR0FBRSxPQUFLO0FBQUEsSUFBQyxFQUFNLFNBQUcsU0FBTyxNQUFJLFNBQU87QUFBQSxNQUFHLEVBQUU7QUFBQSxJQUFVO0FBQUEsYUFBSztBQUFBLEVBQUU7QUFBQSxFQUFDLE9BQU87QUFBQTtBQUFJLFNBQVMsT0FBTyxDQUFDLEtBQUksWUFBVztBQUFBLEVBQUMsSUFBSSxNQUFJLFdBQVcsT0FBSyxXQUFXLE1BQUssT0FBSyxXQUFXLFNBQU8sV0FBVyxRQUFNLE9BQUssV0FBVyxPQUFLO0FBQUEsRUFBSSxJQUFHLENBQUM7QUFBQSxJQUFJLE9BQU87QUFBQSxFQUFLLElBQUcsUUFBTSxXQUFXO0FBQUEsSUFBSyxPQUFPLE1BQUk7QUFBQSxFQUFLLE9BQU8sTUFBSSxNQUFJO0FBQUE7QUFBSyxTQUFTLE9BQU8sR0FBRTtBQUFBLEVBQUMsSUFBSSxlQUFhLElBQUcsbUJBQWlCLE9BQUc7QUFBQSxFQUFJLFNBQVEsSUFBRSxVQUFVLFNBQU8sRUFBRSxLQUFHLE1BQUksQ0FBQyxrQkFBaUIsS0FBSTtBQUFBLElBQUMsSUFBSTtBQUFBLElBQUssSUFBRyxLQUFHO0FBQUEsTUFBRSxPQUFLLFVBQVU7QUFBQSxJQUFPO0FBQUEsTUFBQyxJQUFHLFFBQVc7QUFBQSxRQUFFLE1BQUksUUFBUSxJQUFJO0FBQUEsTUFBRSxPQUFLO0FBQUE7QUFBQSxJQUFJLElBQUcsV0FBVyxJQUFJLEdBQUUsS0FBSyxXQUFTO0FBQUEsTUFBRTtBQUFBLElBQVMsZUFBYSxPQUFLLE1BQUksY0FBYSxtQkFBaUIsS0FBSyxXQUFXLENBQUMsTUFBSTtBQUFBLEVBQUU7QUFBQSxFQUFDLElBQUcsZUFBYSxxQkFBcUIsY0FBYSxDQUFDLGdCQUFnQixHQUFFO0FBQUEsSUFBaUIsSUFBRyxhQUFhLFNBQU87QUFBQSxNQUFFLE9BQU0sTUFBSTtBQUFBLElBQWtCO0FBQUEsYUFBTTtBQUFBLEVBQVMsU0FBRyxhQUFhLFNBQU87QUFBQSxJQUFFLE9BQU87QUFBQSxFQUFrQjtBQUFBLFdBQU07QUFBQTtBQUFJLFNBQVMsVUFBUyxDQUFDLE1BQUs7QUFBQSxFQUFDLElBQUcsV0FBVyxJQUFJLEdBQUUsS0FBSyxXQUFTO0FBQUEsSUFBRSxPQUFNO0FBQUEsRUFBSSxJQUFJLGFBQVcsS0FBSyxXQUFXLENBQUMsTUFBSSxJQUFHLG9CQUFrQixLQUFLLFdBQVcsS0FBSyxTQUFPLENBQUMsTUFBSTtBQUFBLEVBQUcsSUFBRyxPQUFLLHFCQUFxQixNQUFLLENBQUMsVUFBVSxHQUFFLEtBQUssV0FBUyxLQUFHLENBQUM7QUFBQSxJQUFXLE9BQUs7QUFBQSxFQUFJLElBQUcsS0FBSyxTQUFPLEtBQUc7QUFBQSxJQUFrQixRQUFNO0FBQUEsRUFBSSxJQUFHO0FBQUEsSUFBVyxPQUFNLE1BQUk7QUFBQSxFQUFLLE9BQU87QUFBQTtBQUFLLFNBQVMsVUFBVSxDQUFDLE1BQUs7QUFBQSxFQUFDLE9BQU8sV0FBVyxJQUFJLEdBQUUsS0FBSyxTQUFPLEtBQUcsS0FBSyxXQUFXLENBQUMsTUFBSTtBQUFBO0FBQUcsU0FBUyxJQUFJLEdBQUU7QUFBQSxFQUFDLElBQUcsVUFBVSxXQUFTO0FBQUEsSUFBRSxPQUFNO0FBQUEsRUFBSSxJQUFJO0FBQUEsRUFBTyxTQUFRLElBQUUsRUFBRSxJQUFFLFVBQVUsUUFBTyxFQUFFLEdBQUU7QUFBQSxJQUFDLElBQUksTUFBSSxVQUFVO0FBQUEsSUFBRyxJQUFHLFdBQVcsR0FBRyxHQUFFLElBQUksU0FBTztBQUFBLE1BQUUsSUFBRyxXQUFjO0FBQUEsUUFBRSxTQUFPO0FBQUEsTUFBUztBQUFBLGtCQUFRLE1BQUk7QUFBQSxFQUFHO0FBQUEsRUFBQyxJQUFHLFdBQWM7QUFBQSxJQUFFLE9BQU07QUFBQSxFQUFJLE9BQU8sV0FBVSxNQUFNO0FBQUE7QUFBRSxTQUFTLFFBQVEsQ0FBQyxNQUFLLElBQUc7QUFBQSxFQUFDLElBQUcsV0FBVyxJQUFJLEdBQUUsV0FBVyxFQUFFLEdBQUUsU0FBTztBQUFBLElBQUcsT0FBTTtBQUFBLEVBQUcsSUFBRyxPQUFLLFFBQVEsSUFBSSxHQUFFLEtBQUcsUUFBUSxFQUFFLEdBQUUsU0FBTztBQUFBLElBQUcsT0FBTTtBQUFBLEVBQUcsSUFBSSxZQUFVO0FBQUEsRUFBRSxNQUFLLFlBQVUsS0FBSyxRQUFPLEVBQUU7QUFBQSxJQUFVLElBQUcsS0FBSyxXQUFXLFNBQVMsTUFBSTtBQUFBLE1BQUc7QUFBQSxFQUFNLElBQUksVUFBUSxLQUFLLFFBQU8sVUFBUSxVQUFRLFdBQVUsVUFBUTtBQUFBLEVBQUUsTUFBSyxVQUFRLEdBQUcsUUFBTyxFQUFFO0FBQUEsSUFBUSxJQUFHLEdBQUcsV0FBVyxPQUFPLE1BQUk7QUFBQSxNQUFHO0FBQUEsRUFBTSxJQUFJLFFBQU0sR0FBRyxRQUFPLFFBQU0sUUFBTSxTQUFRLFNBQU8sVUFBUSxRQUFNLFVBQVEsT0FBTSxnQkFBYyxJQUFHLElBQUU7QUFBQSxFQUFFLE1BQUssS0FBRyxRQUFPLEVBQUUsR0FBRTtBQUFBLElBQUMsSUFBRyxNQUFJLFFBQU87QUFBQSxNQUFDLElBQUcsUUFBTSxRQUFPO0FBQUEsUUFBQyxJQUFHLEdBQUcsV0FBVyxVQUFRLENBQUMsTUFBSTtBQUFBLFVBQUcsT0FBTyxHQUFHLE1BQU0sVUFBUSxJQUFFLENBQUM7QUFBQSxRQUFPLFNBQUcsTUFBSTtBQUFBLFVBQUUsT0FBTyxHQUFHLE1BQU0sVUFBUSxDQUFDO0FBQUEsTUFBQyxFQUFNLFNBQUcsVUFBUSxRQUFPO0FBQUEsUUFBQyxJQUFHLEtBQUssV0FBVyxZQUFVLENBQUMsTUFBSTtBQUFBLFVBQUcsZ0JBQWM7QUFBQSxRQUFPLFNBQUcsTUFBSTtBQUFBLFVBQUUsZ0JBQWM7QUFBQSxNQUFDO0FBQUEsTUFBQztBQUFBLElB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QSxJQUFPLE9BQU8sS0FBSyxNQUFNLE9BQU0sR0FBRztBQUFBLEVBQUMsRUFBSztBQUFBLElBQUMsS0FBSSxJQUFFLEtBQUssU0FBTyxFQUFFLEtBQUcsR0FBRSxFQUFFO0FBQUEsTUFBRSxJQUFHLEtBQUssV0FBVyxDQUFDLE1BQUksSUFBRztBQUFBLFFBQUMsSUFBRyxDQUFDLGNBQWE7QUFBQSxVQUFDLFFBQU0sSUFBRTtBQUFBLFVBQUU7QUFBQSxRQUFLO0FBQUEsTUFBQyxFQUFNLFNBQUcsUUFBTTtBQUFBLFFBQUcsZUFBYSxPQUFHLE1BQUksSUFBRTtBQUFBLElBQUUsSUFBRyxRQUFNO0FBQUEsTUFBRyxPQUFNO0FBQUEsSUFBRyxPQUFPLEtBQUssTUFBTSxPQUFNLEdBQUc7QUFBQTtBQUFBO0FBQUcsU0FBUyxPQUFPLENBQUMsTUFBSztBQUFBLEVBQUMsV0FBVyxJQUFJO0FBQUEsRUFBRSxJQUFJLFdBQVMsSUFBRyxZQUFVLEdBQUUsTUFBSSxJQUFHLGVBQWEsTUFBRyxjQUFZO0FBQUEsRUFBRSxTQUFRLElBQUUsS0FBSyxTQUFPLEVBQUUsS0FBRyxHQUFFLEVBQUUsR0FBRTtBQUFBLElBQUMsSUFBSSxPQUFLLEtBQUssV0FBVyxDQUFDO0FBQUEsSUFBRSxJQUFHLFNBQU8sSUFBRztBQUFBLE1BQUMsSUFBRyxDQUFDLGNBQWE7QUFBQSxRQUFDLFlBQVUsSUFBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsTUFBQztBQUFBLElBQVE7QUFBQSxJQUFDLElBQUcsUUFBTTtBQUFBLE1BQUcsZUFBYSxPQUFHLE1BQUksSUFBRTtBQUFBLElBQUUsSUFBRyxTQUFPLElBQUc7QUFBQSxNQUFDLElBQUcsYUFBVztBQUFBLFFBQUcsV0FBUztBQUFBLE1BQU8sU0FBRyxnQkFBYztBQUFBLFFBQUUsY0FBWTtBQUFBLElBQUMsRUFBTSxTQUFHLGFBQVc7QUFBQSxNQUFHLGNBQVk7QUFBQSxFQUFFO0FBQUEsRUFBQyxJQUFHLGFBQVcsTUFBSSxRQUFNLE1BQUksZ0JBQWMsS0FBRyxnQkFBYyxLQUFHLGFBQVcs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USxDQUFDLFVBQWlCO0FBQUEsTUFFekIsTUFBTSxrQkFBa0IsTUFBTSxPQUFPLGFBQWE7QUFBQSxNQUNsRCxRQUFRLElBQUksa0NBQWtDLFdBQVcsWUFBWSxTQUFTLG9CQUFvQixlQUFlO0FBQUEsTUFFakgsTUFBTSxTQUFTLGdCQUFFLFdBQTZCO0FBQUEsUUFDN0MsS0FBSztBQUFBLFFBQ0wsV0FBVztBQUFBLFFBQ1g7QUFBQSxNQUNELENBQUM7QUFBQSxNQUVELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxLQUFLO0FBQUEsUUFDM0IsUUFBUSxNQUFNLG1EQUFtRCxXQUFXLFdBQVcsTUFBTTtBQUFBLFFBQzdGLE9BQU8sZ0JBQUUsT0FBTyx3QkFBd0IsV0FBVztBQUFBLE1BQ3BEO0FBQUEsTUFDQSxRQUFRLElBQUksMENBQTBDLFdBQVcsYUFBYSxPQUFPLE9BQU8sUUFBUSxXQUFXLE9BQU8sTUFBTSxXQUFXO0FBQUEsTUFDdkksT0FBTztBQUFBO0FBQUEsRUFFVDtBQUFBO0FBR00sU0FBUyxTQUFTLEdBQWtEO0FBQUEsRUFDMUUsTUFBTSxTQUF3RCxDQUFDO0FBQUEsRUFFL0QsWUFBWSxNQUFNLFlBQVksT0FBTyxRQUFRLFFBQVEsR0FBRztBQUFBLElBQ3ZELE9BQU8sUUFBUSxZQUFZLE1BQU0sT0FBTztBQUFBLEVBQ3pDO0FBQUEsRUFFQSxPQUFPO0FBQUE7OztBQ3hFUixJQUFNLFNBQVMsVUFBVTtBQUd6QixnQkFBRSxNQUFNLFNBQVMsZUFBZSxLQUFLLEdBQUksS0FBSyxNQUFNOyIsCiAgImRlYnVnSWQiOiAiNjczMjg0NTIzNzE2MDM3RTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
