<!--meta-description
Documentation on m.buildQueryString(), which converts an object like {a: "1", b: "2"} into a string like "a=1&b=2"
-->

# buildQueryString(object)

- [Description](#description)
- [Signature](#signature)
- [How it works](#how-it-works)

---

### Description

Turns an object into a string of form `a=1&b=2`

```javascript
var querystring = m.buildQueryString({a: '1', b: '2'})
// "a=1&b=2"
```

---

### Signature

`querystring = m.buildQueryString(object)`

| Argument    | Type     | Required | Description                                   |
| ----------- | -------- | -------- | --------------------------------------------- |
| `query`     | `Object` | Yes      | A key-value map to be converted into a string |
| **returns** | `String` |          | A string representing the input object        |

[How to read signatures](signatures.md)

---

### How it works

The `m.buildQueryString` creates a querystring from an object. It's useful for manipulating URLs

```javascript
var querystring = m.buildQueryString({a: 1, b: 2})

// querystring is "a=1&b=2"
```

#### Arrays

An array is serialized as a comma list. Elements are encoded individually, so a comma inside a
value stays `%2C` and the list still splits unambiguously.

```javascript
var querystring = m.buildQueryString({a: ['hello', 'world']})

// querystring is "a=hello,world"
```

Note that `m.parseQueryString` cannot reverse this on its own — `a=hello,world` reads back as the
string `"hello,world"`, because nothing in the query string says whether a value is one item or
many. Split it where you know the arity. The indexed form (`a[0]=hello&a[1]=world`) is still
parsed into an array, so older URLs keep working.

#### Deep data structures

Nested objects are serialized in a way that is understood by popular web application servers such as PHP, Rails and ExpressJS

```javascript
var querystring = m.buildQueryString({a: {b: 'hello'}})

// querystring is "a[b]=hello"
```
