<!--meta-description
An API cheatsheet for Mithril.js
-->

# API Cheatsheet

Here are examples for the most commonly used methods. If a method is not listed below, it's meant for advanced usage.

#### m(selector, attrs, children) - [docs](hyperscript.md)

```javascript
m('div.class#id', {title: 'title'}, ['children'])
```

---

#### m.mount(element, component) - [docs](mount.md)

```javascript
var state = {
    count: 0,
    inc: function () {
        state.count++
    },
}

var Counter = {
    view: function () {
        return m('div', {onclick: state.inc}, state.count)
    },
}

m.mount(document.body, Counter)
```

---

#### m.route(root, defaultRoute, routes) - [docs](route.md)

```javascript
var Home = {
    view: function () {
        return 'Welcome'
    },
}

m.route(document.body, '/home', {
    '/home': Home, // defines `https://example.com/#!/home`
})
```

#### m.route.set(path) - [docs](route.md#mrouteset)

```javascript
var Home = {
    view: function () {
        return m('div', 'Home')
    },
}
var Page1 = {
    view: function () {
        return m('div', 'Page 1')
    },
}
m.route(document.body, '/home', {'/home': Home, '/page1': Page1})
m.route.set('/page1')
// Output: Page 1
```

#### m.route.get() - [docs](route.md#mrouteget)

```javascript
var Home = {
    view: function () {
        return m('div', 'Route: ' + m.route.get())
    },
}
m.route(document.body, '/home', {'/home': Home})
// Output: Route: /home
```

#### m.route.prefix = prefix - [docs](route.md#mrouteprefix)

Invoke this before `m.route()` to change the routing prefix.

```javascript
m.route.prefix = '#!'
var Home = {
    view: function () {
        return m('div', 'Prefix: ' + m.route.prefix)
    },
}
m.route(document.body, '/', {'/': Home})
// Output: Prefix: #!
```

#### m(m.route.Link, ...) - [docs](route.md#mroutelink)

```javascript
var Home = {
    view: function () {
        return m('div', m(m.route.Link, {href: '/home'}, 'Go to home page'))
    },
}
m.route(document.body, '/home', {'/home': Home})
// Output: clickable link "Go to home page"
```

---

#### m.parseQueryString(querystring) - [docs](parseQueryString.md)

```javascript
var object = m.parseQueryString('a=1&b=2')
m.render(document.body, m('pre', JSON.stringify(object)))
// Output: {"a":"1","b":"2"}
```

---

#### m.buildQueryString(object) - [docs](buildQueryString.md)

```javascript
var querystring = m.buildQueryString({a: '1', b: '2'})
m.render(document.body, m('pre', querystring))
// Output: a=1&b=2
```

---

#### m.trust(htmlString) - [docs](trust.md)

```javascript
m.render(document.body, m.trust('<h1>Hello</h1>'))
```

---

#### m.redraw() - [docs](redraw.md)

```javascript
var count = 0
function inc() {
    setInterval(function () {
        count++
        m.redraw()
    }, 1000)
}

var Counter = {
    oninit: inc,
    view: function () {
        return m('div', count)
    },
}

m.mount(document.body, Counter)
```
