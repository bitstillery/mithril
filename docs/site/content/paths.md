<!--meta-description
Documentation on how to work with paths in Mithril.js
-->

# Path Handling

[`m.route`](route.md) uses paths to generate the URLs you navigate to. Paths are also useful with [`m.buildPathname`](buildPathname.md) when constructing URLs for `fetch()` or other HTTP calls.

### Path types

There are two general types of paths: raw paths and parameterized paths.

- Raw paths are simply strings used directly as URLs. Nothing is substituted or even split. It's just normalized with all the parameters appended to the end.
- Parameterized paths let you insert values into paths, escaped by default for convenience and safety against URL injection.

For [routes](route.md), paths can only be absolute URL path names without schemes or domains.

### Path parameters

Path parameters are themselves pretty simple. They come in two forms:

- `:foo` - This injects a simple `params.foo` into the URL, escaping its value first.
- `:foo...` - This injects a raw `params.foo` path into the URL without escaping anything.

You're probably wondering what that `params` object is supposed to be. It's the `params` in [`m.route.set(path, params)`](route.md#mrouteset) or [`m.buildPathname(path, params)`](buildPathname.md) for building URLs.

When receiving routes via [`m.route(root, defaultRoute, routes)`](route.md#signature), you can use these parameters to _extract_ values from routes. They work basically the same way as generating the paths, just in the opposite direction.

```javascript
// Edit a single item
m.route(document.body, '/edit/1', {
    '/edit/:id': {
        view: function () {
            return [m(Menu), m('h1', 'Editing user ' + m.route.param('id'))]
        },
    },
})

// Edit an item identified by path
m.route(document.body, '/edit/pictures/image.jpg', {
    '/edit/:file...': {
        view: function () {
            return [m(Menu), m('h1', 'Editing file ' + m.route.param('file'))]
        },
    },
})
```

In the first example, assuming you're navigating to the default route in each, `m.route.param("id")` would be read as `"1"` and `m.route.param("file")` would be read as `pictures/image.jpg`.

Path parameters may be delimited by either a `/`, `-`, or `.`. This lets you have dynamic path segments, and they're considerably more flexible than just a path name. For example, you could match against routes like `"/edit/:name.:ext"` for editing based on file extension or `"/:lang-:region/view"` for a localized route.

Path parameters are greedy: given a declared route `"/edit/:name.:ext"`, if you navigate to `/edit/file.test.png`, the parameters extracted will be `{name: "file.test", ext: "png"}`, not `{name: "file", ext: "test.png"}`. Similarly, given `"/route/:path.../view/:child..."`, if you go to `/route/foo/view/bar/view/baz`, the parameters extracted will be `{path: "foo/view/bar", child: "baz"}`.

### Parameter normalization

Path parameters that are interpolated into path names are omitted from the query string, for convenience and to keep the path name reasonably readable. For example, `m.buildPathname` produces `https://example.com/api/user/1/connections?sort=name-asc`, omitting the duplicate `id=1` in the URL string:

```javascript
var url = m.buildPathname('https://example.com/api/user/:userID/connections', {
    userID: 1,
    sort: 'name-asc',
})
fetch(url)
```

You can also specify parameters explicitly in the path template. This is equivalent:

```javascript
var url = m.buildPathname('https://example.com/api/user/:userID/connections?sort=name-asc', {
    userID: 1,
})
fetch(url)
```

You can mix path and query parameters. This produces `GET /api/user/1/connections?sort=name-asc&first=10`:

```javascript
var url = m.buildPathname('https://example.com/api/user/:userID/connections?sort=name-asc', {
    userID: 1,
    first: 10,
})
fetch(url)
```

This even extends to route matching: you can match against a route _with_ explicit query strings. It retains the matched parameter for convenience, so you can still access them via vnode parameters or via [`m.route.param`](route.md#mrouteparam). Note that although this _is_ possible, it's not generally recommended, since you should prefer paths for pages. It could sometimes useful if you need to generate a somewhat different view just for a particular file type, but it still logically is a query-like parameter, not a whole separate page.

```javascript
// Note: this is generally *not* recommended - you should prefer paths for route
// declarations, not query strings.
m.route(document.body, '/edit/1', {
    '/edit?type=image': {
        view: function () {
            return [m(Menu), m('h1', 'Editing photo')]
        },
    },
    '/edit': {
        view: function () {
            return [m(Menu), m('h1', 'Editing ' + m.route.param('type'))]
        },
    },
})
```

Query parameters are implicitly consumed - you don't need to name them to accept them. You can match based on an existing value, like in `"/edit?type=image"`, but you don't need to use `"/edit?type=:type"` to accept the value. In fact, Mithril.js would treat that as you trying to literally match against `m.route.param("type") === ":type"`, so you probably don't want to do that. In short, use `m.route.param("key")` or route component attributes to read query parameters.

### Path normalization

Parsed paths are always returned with all the duplicate parameters and extra slashes dropped, and they always start with a slash. These little differences often get in the way, and it makes routing and path handling a lot more complicated than it should be. Mithril.js internally normalizes paths for routing, but it does not expose the current, normalized route directly. (You could compute it via [`m.parsePathname(m.route.get()).path`](parsePathname.md).)

When parameters are deduplicated during matching, parameters in the query string are preferred over parameters in the path name, and parameters towards the end of the URL are preferred over parameters closer to the start of the URL.

### Path escaping

There are some characters that, if you want to use them literally, you need to escape. Conveniently, `encodeURIComponent` encodes these (and more), and when you substitute parameters and add query parameters, they're encoded as necessary using this. Here's the ones Mithril.js interprets:

- `:` = `%3A`
- `/` = `%2F` (required only in paths)
- `%` = `%25`
- `?` = `%3F` (required only in paths)
- `#` = `%23`

Of course, there's others you have to escape per the URL spec, like spaces. But as already noted, `encodeURIComponent` does that for you, and Mithril.js uses that implicitly when you substitute parameters. So you only really need to care if you're specifying parameters explicitly like in `m.buildPathname("https://example.com/api/user/User%20Name/:field", {field: ...})`.
