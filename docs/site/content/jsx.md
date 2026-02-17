<!--meta-description
Explanation, examples, and build notes on how to use JSX in your Mithril.js-based apps
-->

# JSX

-   [Description](#description)
-   [Setup for JavaScript](#setup-for-javascript)
-   [Production build](#production-build)
-   [Using Babel with Webpack](#using-babel-with-webpack)
-   [Setup for TypeScript](#setup-for-typescript)
-   [Using Closure Components in TypeScript with JSX](#using-closure-components-in-typescript-with-jsx)
-   [Differences with React](#differences-with-react)
-   [JSX vs hyperscript](#jsx-vs-hyperscript)
-   [Tips and Tricks](#tips-and-tricks)

---

### Description

JSX is a syntax extension that enables you to write HTML tags interspersed with JavaScript. It's not part of any JavaScript standards and it's not required for building applications, but it may be more pleasing to use depending on you or your team's preferences.

```jsx
function MyComponent() {
	return {
		view: () => m("main", [m("h1", "Hello world")]),
	};
}

// can be written as:

function MyComponent() {
	return {
		view: () => (
			<main>
				<h1>Hello world</h1>
			</main>
		),
	};
}
```

When using JSX, it's possible to interpolate JavaScript expressions within JSX tags by using curly braces:

```jsx
var greeting = "Hello";
var url = "https://google.com";
var link = <a href={url}>{greeting}!</a>;
// yields <a href="https://google.com">Hello!</a>
```

Components can be used by using a convention of uppercasing the first letter of the component name or by accessing it as a property:

```jsx
m.render(document.body, <MyComponent />)
// equivalent to m.render(document.body, m(MyComponent))
<m.route.Link href="/home">Go home</m.route.Link>
// equivalent to m(m.route.Link, {href: "/home"}, "Go home")
```

---

### Setup for JavaScript

When using JavaScript, the simplest way to use JSX is via a [Babel](https://babeljs.io/) plugin. (For TypeScript, follow the [instructions below](#setup-tsx-jsx-in-typescript).)

Babel requires npm, which is automatically installed when you install [Node.js](https://nodejs.org/en/). Once npm is installed, create a project folder and run this command:

```bash
npm init -y
```

If you want to use Webpack and Babel together, [skip to the section below](#using-babel-with-webpack).

To install Babel as a standalone tool, use this command:

```bash
npm install @babel/core @babel/cli @babel/preset-env @babel/plugin-transform-react-jsx --save-dev
```

Create a `.babelrc` file:

```json
{
	"presets": ["@babel/preset-env"],
	"plugins": [
		[
			"@babel/plugin-transform-react-jsx",
			{
				"pragma": "m",
				"pragmaFrag": "'['"
			}
		]
	]
}
```

To run Babel, setup an npm script. Open `package.json` and add this entry under `"scripts"`:

```json
{
	"name": "my-project",
	"scripts": {
		"babel": "babel src --out-dir bin --source-maps"
	}
}
```

You can now run Babel using this command:

```bash
npm run babel
```

#### Using Babel with Webpack

If you haven't already installed Webpack as a bundler, use this command:

```bash
npm install webpack webpack-cli --save-dev
```

You can integrate Babel to Webpack by following these steps.

```bash
npm install @babel/core babel-loader @babel/preset-env @babel/plugin-transform-react-jsx --save-dev
```

Create a `.babelrc` file:

```json
{
	"presets": ["@babel/preset-env"],
	"plugins": [
		[
			"@babel/plugin-transform-react-jsx",
			{
				"pragma": "m",
				"pragmaFrag": "'['"
			}
		]
	]
}
```

Next, create a file called `webpack.config.js`

```jsx
const path = require("path");

module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, "./bin"),
		filename: "app.js",
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /\/node_modules\//,
				use: {
					loader: "babel-loader",
				},
			},
		],
	},
	resolve: {
		extensions: [".js", ".jsx"],
	},
};
```

For those familiar with Webpack already, please note that adding the Babel options to the `babel-loader` section of your `webpack.config.js` will throw an error, so you need to include them in the separate `.babelrc` file.

This configuration assumes the source code file for the application entry point is in `src/index.js`, and this will output the bundle to `bin/app.js`.

To run the bundler, setup an npm script. Open `package.json` and add this entry under `"scripts"`:

```json
{
	"name": "my-project",
	"scripts": {
		"start": "webpack --mode development --watch"
	}
}
```

You can now then run the bundler by running this from the command line:

```bash
npm start
```

#### Production build

To generate a minified file, open `package.json` and add a new npm script called `build`:

```json
{
	"name": "my-project",
	"scripts": {
		"start": "webpack -d --watch",
		"build": "webpack -p"
	}
}
```

You can use hooks in your production environment to run the production build script automatically. Here's an example for [Heroku](https://www.heroku.com/):

```json
{
	"name": "my-project",
	"scripts": {
		"start": "webpack -d --watch",
		"build": "webpack -p",
		"heroku-postbuild": "webpack -p"
	}
}
```

#### Making `m` accessible globally

In order to access `m` globally from all your project first import `webpack` in your `webpack.config.js` like this:

```js
const webpack = require('webpack')
```

Then create a new plugin in the `plugins` property of the Webpack configuration object:

```js
{
	plugins: [
		new webpack.ProvidePlugin({
			m: "mithril",
		}),
	];
}
```

See [the Webpack docs](https://webpack.js.org/plugins/provide-plugin/) for more information on `ProvidePlugin`.

---

### Setup for TypeScript

When using [TypeScript](https://www.typescriptlang.org/), all you need to do is tell TypeScript how to handle JSX code correctly. Since TypeScript can transpile JSX on its own, you don't need any other tools like Babel to do it for you. (More information can be found [here](https://www.typescriptlang.org/docs/handbook/jsx.html).)

Add `jsx` and `jsxFactory` to `compilerOptions` in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "m",
    "jsxFragmentFactory": "m.Fragment"
  }
}
```

This setup should be enough to get most JSX functionality working.

#### Using closure components in TypeScript with JSX
>Because of https://github.com/microsoft/TypeScript/issues/21699, we advise against using [closure components](components.md#closure-component-state) in TypeScript for now. Either use [class components](components.md#class-component-state) without attribute inspection or Hyperscript instead (see the list of alternatives below the code example).

TypeScript only expects an attribute object as a parameter. But Mithril.js provides a `Vnode` object instead. This leads to the editor showing faulty parameters even though the JSX would compile correctly. If you want to use closure components in TypeScript, you need to trick the TypeScript error checking.


For example, if you try to compile this code:

```tsx
interface Attributes {
  greet: string
}
function ChildComponent(vNode: Vnode<Attributes>): m.Component<Attributes> {
  return {
    view: () => <div>{vNode.attrs.greet}</div>
  };
}

function ParentComponent() {
  return {
    view: () => <div>
      <ChildComponent greet="Hello World"/>
    </div>
  };
}
```

TypeScript will report this error:

```
TS2739: Type { greet: string; } is missing the following properties from type Vnode<{}, {}>: tag, attrs, state
TS2786: ChildComponent cannot be used as a JSX component.
```

There are a few options to circumvent that problem:
1. Instead of `<div><ChildComponent greet="Hello World"/></div>`, use [hyperscript](hyperscript.md) instead: `<div>{m(ChildComponent, {greet: "Hello World"})}</div>`.
2. Use [class components](components.md#class-component-state) instead. Class components will not show any errors. But TypeScript will not be able to autocomplete or inspect attributes (in this example `greet` would be unknown when used in `ParentComponent`).
3. Create a "translation function" (like `TsClosureComponent()` in the example below) to trick TypeScript.

The following code will work without errors:

```tsx
// Use this helper to force TypeScript to treat closure components as valid JSX components
export function TsClosureComponent<T>(create: Mithril.ClosureComponent<T>) {
  return create as any as (
    (attrs: T & Mithril.CommonAttributes<T, unknown>) => JSX.Element
  )
}


interface Attributes {
  greet: string
}
// We slightly altered the definition of `ChildComponent` by using `TsClosureComponent`
const ChildComponent = TsClosureComponent<Attributes>(vNode => {
  return {
    view: () => <div>{vNode.attrs.greet}</div>
  };
})

function ParentComponent() {
  return {
    view: () => <div>
      <ChildComponent greet="Hello World"/>
    </div>
  };
}

```

This also works with generics, as long as you define the generic as part of the wrapped component:

```typescript jsx
function ChildComponentImpl<T>() {
  // ...
}

const ChildComponent = TsClosureComponent(ChildComponentImpl);

const jsx = <div>
  <ChildComponent<SomeClass> />
</div>
```


### Differences with React

JSX in Mithril.js has some subtle but important differences compared to JSX in React.

#### Attribute and style property case conventions

React requires you use the camel-cased DOM property names instead of HTML attribute names for all attributes other than `data-*` and `aria-*` attributes. For example, with React, you have to use `className` instead of `class` and `htmlFor` instead of `for`. In Mithril.js, it's more idiomatic to use the lowercase HTML attribute names instead. Mithril.js always falls back to `setAttribute` if a property doesn't exist, letting you just always use HTML attributes. Note that in most cases, the DOM property and HTML attribute names are either the same or very similar. For example, the property names for `value` and `checked` for inputs are the same as the attribute names for them, and the property name for the global `tabindex` HTML attribute is just `tabIndex` property. There's only a few exceptions, like the `className` property for the global `class` attribute and the `htmlFor` property for the `for` HTML form control attribute.

Similarly, React always uses the camel-cased style property names exposed in the DOM via properties of `elem.style` (like `cssHeight` and `backgroundColor`). Mithril.js supports both that and the kebab-cased CSS property names (like `height` and `background-color`), and the hyphenated CSS names are the preferred idiom. Only `cssHeight`, `cssFloat`, and some vendor-prefixed properties differ in more than case.

#### DOM events

React upper-cases the first character of all event handlers: `onClick` listens for `click` events and `onSubmit` for `submit` events. Some are further altered as their multiple words concatenated together. For instance, `onMouseMove` listens for `mousemove` events. Mithril.js does not do this case mapping but instead just prepends `on` to the native event, so you'd add listeners for `onclick` and `onmousemove` to listen to those two events respectively. This corresponds much more closely to HTML's naming scheme and is much more intuitive if you come from an HTML or vanilla DOM background.

React supports scheduling event listeners during the capture phase, as events first descend from the top to their target (as opposed to the bubble phase, when events ascend back out to the top), by appending `Capture` to that event. Mithril.js currently has no equivalent for this. If you need such event listeners, you can manually add and remove your own listeners in [lifecycle hooks](lifecycle-methods.md).

---

### JSX vs hyperscript

JSX and hyperscript are two different syntaxes you can use for specifying vnodes, and they have different tradeoffs:

-   JSX is much more approachable if you're coming from an HTML/XML background and are more comfortable specifying DOM elements with that kind of syntax. It is also slightly cleaner in many cases since it uses fewer punctuation and the attributes contain less visual noise, so many people find it much easier to read. And of course, many common editors provide autocomplete support for DOM elements in the same way they do for HTML. However, it requires an extra build step to use, editor support isn't as broad as it is with normal JS, and it's considerably more verbose. It's also a bit more verbose when dealing with a lot of dynamic content because you have to use interpolations for everything.

-   Hyperscript is more approachable if you come from a backend JS background that doesn't involve much HTML or XML. It's more concise with less redundancy, and it provides a CSS-like sugar for static classes, IDs, and other attributes. It also can be used with no build step at all, although [you can add one if you wish](https://github.com/MithrilJS/mopt). And it's slightly easier to work with in the face of a lot of dynamic content, because you don't need to "interpolate" anything. However, the terseness does make it harder to read for some people, especially those less experienced and coming from a front end HTML/CSS/XML background, and I'm not aware of any plugins that auto-complete parts of hyperscript selectors like IDs, classes, and attributes.

You can see the tradeoffs come into play in more complex trees. For instance, consider this hyperscript tree, adapted from a real-world project by [@dead-claudia](https://github.com/dead-claudia) with some alterations for clarity and readability:

```javascript
function SummaryView() {
	let tag, posts;

	function init({ attrs }) {
		Model.sendView(attrs.tag != null);
		if (attrs.tag != null) {
			tag = attrs.tag.toLowerCase();
			posts = Model.getTag(tag);
		} else {
			tag = undefined;
			posts = Model.posts;
		}
	}

	function feed(type, href) {
		return m(".feed", [
			type,
			m("a", { href }, m("img.feed-icon[src=./feed-icon-16.gif]")),
		]);
	}

	return {
		oninit: init,
		// To ensure the tag gets properly diffed on route change.
		onbeforeupdate: init,
		view: () =>
			m(".blog-summary", [
				m("p", "My ramblings about everything"),

				m(".feeds", [
					feed("Atom", "blog.atom.xml"),
					feed("RSS", "blog.rss.xml"),
				]),

				tag != null
					? m(TagHeader, { len: posts.length, tag })
					: m(".summary-header", [
							m(
								".summary-title",
								"Posts, sorted by most recent."
							),
							m(TagSearch),
					  ]),

				m(
					".blog-list",
					posts.map((post) =>
						m(
							m.route.Link,
							{
								class: "blog-entry",
								href: `/posts/${post.url}`,
							},
							[
								m(
									".post-date",
									post.date.toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})
								),

								m(".post-stub", [
									m(".post-title", post.title),
									m(".post-preview", post.preview, "..."),
								]),

								m(TagList, { post, tag }),
							]
						)
					)
				),
			]),
	};
}
```

Here's the exact equivalent of the above code, using JSX instead. You can see how the two syntaxes differ just in this bit, and what tradeoffs apply.

```jsx
function SummaryView() {
	let tag, posts;

	function init({ attrs }) {
		Model.sendView(attrs.tag != null);
		if (attrs.tag != null) {
			tag = attrs.tag.toLowerCase();
			posts = Model.getTag(tag);
		} else {
			tag = undefined;
			posts = Model.posts;
		}
	}

	function feed(type, href) {
		return (
			<div class="feed">
				{type}
				<a href={href}>
					<img class="feed-icon" src="./feed-icon-16.gif" />
				</a>
			</div>
		);
	}

	return {
		oninit: init,
		// To ensure the tag gets properly diffed on route change.
		onbeforeupdate: init,
		view: () => (
			<div class="blog-summary">
				<p>My ramblings about everything</p>

				<div class="feeds">
					{feed("Atom", "blog.atom.xml")}
					{feed("RSS", "blog.rss.xml")}
				</div>

				{tag != null ? (
					<TagHeader len={posts.length} tag={tag} />
				) : (
					<div class="summary-header">
						<div class="summary-title">
							Posts, sorted by most recent
						</div>
						<TagSearch />
					</div>
				)}

				<div class="blog-list">
					{posts.map((post) => (
						<m.route.Link
							class="blog-entry"
							href={`/posts/${post.url}`}
						>
							<div class="post-date">
								{post.date.toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</div>

							<div class="post-stub">
								<div class="post-title">{post.title}</div>
								<div class="post-preview">
									{post.preview}...
								</div>
							</div>

							<TagList post={post} tag={tag} />
						</m.route.Link>
					))}
				</div>
			</div>
		),
	};
}
```

---

### Tips and tricks

#### Converting HTML to JSX

In Mithril.js, well-formed HTML is generally valid JSX. Little more than just pasting raw HTML is required for things to just work. About the only things you'd normally have to do are change unquoted property values like `attr=value` to `attr="value"` and change void elements like `<input>` to `<input />`, this being due to JSX being based on XML and not HTML.

When using hyperscript, you often need to translate HTML to hyperscript syntax to use it. To help speed up this process along, you can use a [community-created HTML-to-Mithril-template converter](https://arthurclemens.github.io/mithril-template-converter/index.html) to do much of it for you.
