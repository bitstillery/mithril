# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.11.1](https://github.com/bitstillery/mithril/compare/v3.11.0...v3.11.1) (2026-10-07)

### Bug Fixes

- **ssr:** escape < in the serialized state script ([175f26e](https://github.com/bitstillery/mithril/commit/175f26e5ae01246fb39037781e805a602836fef6))

### Performance Improvements

- **ssr:** render synchronously until a component's oninit is async ([2c74fe5](https://github.com/bitstillery/mithril/commit/2c74fe58bc319e1830ede8810eabd613bbf25999))
- **ssr:** walk a plain state's own keys when serializing it ([01f1337](https://github.com/bitstillery/mithril/commit/01f13371ff2e8cba90bcc42f49cdd3876f70769e))

## [3.11.0](https://github.com/bitstillery/mithril/compare/v3.10.0...v3.11.0) (2026-10-07)

### Features

- **router:** type m.route.Link's attrs ([f892cc4](https://github.com/bitstillery/mithril/commit/f892cc499a0687e00b9d83eb21361cf9fc6a263b))

### Bug Fixes

- **render:** stop redrawing a component from signals it no longer reads ([5e8c59e](https://github.com/bitstillery/mithril/commit/5e8c59e0464fc4833ad16bfc038f3675b38788d2))
- **signal:** let dropped computeds be collected and effects unsubscribe ([7ba3a52](https://github.com/bitstillery/mithril/commit/7ba3a520d03a3d2209b2816407f50e3b3bf32600))
- **signal:** redraw a component from a computed it read from cache ([97b4a7a](https://github.com/bitstillery/mithril/commit/97b4a7a41ce56f44b26fb8237b29638467529b47))
- **signal:** report a computed's value from peek() and watch() ([cfde108](https://github.com/bitstillery/mithril/commit/cfde108ca1288bc67c558814b3c9e2df43a98ebe))
- **ssr:** stop tracking components while rendering on the server ([9245fdd](https://github.com/bitstillery/mithril/commit/9245fdd2faf47d99721d2d34a1223c2e0b170703))
- **state:** drop collected computeds when a state array mutates ([3626ae4](https://github.com/bitstillery/mithril/commit/3626ae4eba3f3a1db70831a7a6ea3f7b5d20cdab))

### Performance Improvements

- **signal:** allocate a signal's subscriber set on first use ([ebcf1bd](https://github.com/bitstillery/mithril/commit/ebcf1bdb75a78fc0c49d9010e78077cdb9f89bb9))
- **ssr:** append attributes to one string instead of joining parts ([135caf1](https://github.com/bitstillery/mithril/commit/135caf1e33a7197b107fbcf4e702dbc785fcfe8c))
- **ssr:** append children in the sync renderer instead of map and join ([4a55a8a](https://github.com/bitstillery/mithril/commit/4a55a8a6cec9192696f588014b9f97e66764150e))
- **ssr:** escape text and attributes in one scan ([03d077d](https://github.com/bitstillery/mithril/commit/03d077d32d2fe53f3ffcf83c843e2e19c4c5a513))
- **state:** keep a state's original keys as an array until asked for a Set ([2b2a593](https://github.com/bitstillery/mithril/commit/2b2a59369b3043847e98537560fa36143d111952))
- **state:** look up an existing property signal first on every read ([0ba3ba4](https://github.com/bitstillery/mithril/commit/0ba3ba47ea63c184b59e9701f6b140aca020e927))
- **state:** run whole-array methods on a plain copy of a state array ([5a4d926](https://github.com/bitstillery/mithril/commit/5a4d926b8400be5f22a2eb7baed1a27055010ace))
- **state:** share the mutating-method set and parent link across states ([c0b4c5b](https://github.com/bitstillery/mithril/commit/c0b4c5bb18e416428a6efea5559b2317c5cf7df3))
- **url:** assign a plain query key without splitting it into levels ([db533cd](https://github.com/bitstillery/mithril/commit/db533cda28ecdad6d24e93a94c0caa2d46a82ad6))
- **url:** build a query string without encoding plain keys and values ([144eb25](https://github.com/bitstillery/mithril/commit/144eb25b602362a24c741ee0ca2d4dae9aa84e0c))
- **url:** skip the escape scan for a string without a percent sign ([0d546b3](https://github.com/bitstillery/mithril/commit/0d546b34237f25c8c363c1826ef739a65bc49aa7))

### Tests

- **bench:** measure a redraw whose output didn't change ([a67197a](https://github.com/bitstillery/mithril/commit/a67197ad17c13ccd9ac371321e35d6b14887ab8e))
- **bench:** measure route matching, URL helpers, Link and component redraws ([8a7bd04](https://github.com/bitstillery/mithril/commit/8a7bd0431f4086f966542bc455e0c91c0d5a6b5a))
- **bench:** measure server rendering and SSR state serialization ([37ab9e1](https://github.com/bitstillery/mithril/commit/37ab9e15146358b58a2682adb3530004a82f601f))
- **bench:** measure state trees, array mutators and Store persistence ([014c08f](https://github.com/bitstillery/mithril/commit/014c08f6b03525d736088c6cdd25988b92f88371))
- **ssr:** pin the exact HTML and serialized state the server produces ([7141f30](https://github.com/bitstillery/mithril/commit/7141f30a9614fe9ceb00dd6d5e88a0620e9385b2))
- **state:** pin what reflection on a state answers ([68c7311](https://github.com/bitstillery/mithril/commit/68c73110e0234fd4d09c3dc9e392ed3e70e22110))
- **url:** pin the query string and pathname helpers' output ([e3554e0](https://github.com/bitstillery/mithril/commit/e3554e0e67816a342368a87142f0e0d73673737d))

## [3.10.0](https://github.com/bitstillery/mithril/compare/v3.9.4...v3.10.0) (2026-10-06)

### Features

- **types:** type JSX element attrs and remove any from the library ([3d4cfda](https://github.com/bitstillery/mithril/commit/3d4cfdab23281b44362b26c838a9f53975b56881))

### Bug Fixes

- **router:** keep m.route.params in step with the current route ([fd312bb](https://github.com/bitstillery/mithril/commit/fd312bb8de321ddcc40e05eb6454a6cfe06ab861))

### Code Refactoring

- **router:** remove the unused server-side router ([f2b0a86](https://github.com/bitstillery/mithril/commit/f2b0a864430ba91871c99adbfa06619b2c0bb293))

### [3.9.4](https://github.com/bitstillery/mithril/compare/v3.9.3...v3.9.4) (2026-10-06)

### Bug Fixes

- **types:** accept any component class as a ComponentType ([2682882](https://github.com/bitstillery/mithril/commit/2682882ff748434f3c2ead1f64ea596f74d78517))

### [3.9.3](https://github.com/bitstillery/mithril/compare/v3.9.2...v3.9.3) (2026-10-06)

### Bug Fixes

- **state:** hold built-in objects as values instead of proxying them ([b5ff844](https://github.com/bitstillery/mithril/commit/b5ff844c123cc7d22b2c7f4292d8e0f1fbc3d825))
- **types:** type state properties without distributing over unions ([a8d49f9](https://github.com/bitstillery/mithril/commit/a8d49f94f19e30fdbd5edba4d54e61bda1a3a7ac))

### [3.9.2](https://github.com/bitstillery/mithril/compare/v3.9.1...v3.9.2) (2026-09-30)

### Bug Fixes

- **router:** resolve client-side redirects the way SSR does ([680ce0c](https://github.com/bitstillery/mithril/commit/680ce0c0acfc7a476646fec8c2fee0b9287e887e))

### [3.9.1](https://github.com/bitstillery/mithril/compare/v3.9.0...v3.9.1) (2026-09-30)

### Bug Fixes

- **render:** declare component hooks as methods ([b0dd6a9](https://github.com/bitstillery/mithril/commit/b0dd6a93defe20b1f8c8a975087e106c0556e05f))
- **router:** type route.param by what the router can return ([6bfde3f](https://github.com/bitstillery/mithril/commit/6bfde3f026149d97432ea305d8da20fdc06c3671))
- **state:** give each slot of a filled state array its own element ([41cda2c](https://github.com/bitstillery/mithril/commit/41cda2cc867ce5027028b335d10d1f28d35790fb))
- **state:** notify watchers when a state array's length changes ([7dc8a17](https://github.com/bitstillery/mithril/commit/7dc8a17b399b66f4184288b8e59f574876774bb2))
- **state:** wrap objects assigned to a state array index ([20e5a3f](https://github.com/bitstillery/mithril/commit/20e5a3ffda195b0a6e9a17347488d93551877fa3))

## [3.9.0](https://github.com/bitstillery/mithril/compare/v3.8.0...v3.9.0) (2026-09-29)

### Features

- **state:** type computed signals, tier partials and allowComputed ([a065522](https://github.com/bitstillery/mithril/commit/a065522467016d31d733fedbad99f16393c2a474))

### Bug Fixes

- **render:** accept null as a JSX key ([fe4e2e1](https://github.com/bitstillery/mithril/commit/fe4e2e1e6affb5904a8853957b75de296c6534b6))
- **state:** give records no `$` signals for their index signature ([30abdc6](https://github.com/bitstillery/mithril/commit/30abdc6d1ca6c3bfd54b1f722b29474f16ea8e9a))

## [3.8.0](https://github.com/bitstillery/mithril/compare/v3.7.1...v3.8.0) (2026-09-01)

### Features

- **querystring:** serialize arrays as a comma list ([adba5e4](https://github.com/bitstillery/mithril/commit/adba5e4fa5ef74315d869673d34086e61a627e4c))

### [3.7.1](https://github.com/bitstillery/mithril/compare/v3.7.0...v3.7.1) (2026-08-06)

### Bug Fixes

- **store:** mark the prefs cookie Secure on https ([ae214a4](https://github.com/bitstillery/mithril/commit/ae214a4278beebe79a9b1879002ddd9b75e7bff9))

### Performance Improvements

- **render:** restore new Array preallocation in hot paths ([bf84708](https://github.com/bitstillery/mithril/commit/bf84708e79c20b1db37b802371d533abadb7ac9f))
- **state:** collapse the property-signal lookup on the hot read path ([f6d7a8c](https://github.com/bitstillery/mithril/commit/f6d7a8c6452ab2b68ecb35ff0f253f0a6fd62189))

## [3.7.0](https://github.com/bitstillery/mithril/compare/v3.6.0...v3.7.0) (2026-06-18)

### Features

- add cookie store variant ([2ceb9d0](https://github.com/bitstillery/mithril/commit/2ceb9d084db9689b524bb2cfb87a583d84a969bf))

## [3.6.0](https://github.com/bitstillery/mithril/compare/v3.4.2...v3.6.0) (2026-06-09)

### Features

- **render:** improve hydration mismatch diagnostics and structured logging ([fbb47a1](https://github.com/bitstillery/mithril/commit/fbb47a133acc27f2ce85a92da173a118f7718249))
- **server:** add ssr summary logging and fix store blueprint for proxies ([8c71b45](https://github.com/bitstillery/mithril/commit/8c71b45721e024c872dd3697333c511b84bc5672))

### Bug Fixes

- **core:** mirror dynamic nested keys on state proxy target ([d041120](https://github.com/bitstillery/mithril/commit/d04112006caf50fd7d09fda2102b2ae45de219d3))
- **render:** deserialize nested state via proxy setter ([5aae7c8](https://github.com/bitstillery/mithril/commit/5aae7c8bbc8e702f710c31c026bf73dff1fd582c))
- **render:** share cachedAttrsIsStaticMap across bundles and capture redraw for async oninit ([43e5c91](https://github.com/bitstillery/mithril/commit/43e5c912784e3e1372e9e7436458b380e9a57417))
- **render:** skip fragment wrapper during hydration for SSR parity ([090ba29](https://github.com/bitstillery/mithril/commit/090ba2966b406ac69b419a04966da0202018a6b4))
- ssr query params ([ac4ce21](https://github.com/bitstillery/mithril/commit/ac4ce21fe7732c4b59e64334ae567fd284a5a9b2))

### Code Refactoring

- **render:** replace content-matching hydration with positional adoption ([3fe7459](https://github.com/bitstillery/mithril/commit/3fe74598bcecd5192c2a1361c6223ca382560baf))
- **render:** use module-scoped cached attrs static map ([25dd994](https://github.com/bitstillery/mithril/commit/25dd994d2ab083568caf999eb085eb73e6714783))

### [3.4.2](https://github.com/bitstillery/mithril/compare/v3.4.1...v3.4.2) (2026-03-30)

### Code Refactoring

- **router:** simplify route vnode keys and fragment wrapping ([8473878](https://github.com/bitstillery/mithril/commit/84738780))

### Tests

- **api:** add client router tests for vnode keys, remount fragment, and history state ([8ffa842](https://github.com/bitstillery/mithril/commit/8ffa8421))

### [3.4.1](https://github.com/bitstillery/mithril/compare/v3.4.0...v3.4.1) (2026-03-16)

### Bug Fixes

- **core:** serialize dynamically added lookup keys ([78355bf](https://github.com/bitstillery/mithril/commit/78355bfe6350c1693cf1ebaea8d255e802d2dccf))
- **release:** check npm login before publish ([d868025](https://github.com/bitstillery/mithril/commit/d868025823a88eff259d1b90c4dc381f9c0fa010))

## [3.4.0](https://github.com/bitstillery/mithril/compare/v3.3.4...v3.4.0) (2026-03-11)

### Features

- **bench:** add benchmarking suite with topic support ([6e18760](https://github.com/bitstillery/mithril/commit/6e187600abf6e1afa5730236b59ad329603336b7))

### Bug Fixes

- **state:** recurse into array elements in markAllComputedsDirty ([b6b531d](https://github.com/bitstillery/mithril/commit/b6b531d88d04c98e07b517704e12cb84fb4f4af4))

### [3.3.4](https://github.com/bitstillery/mithril/compare/v3.3.3...v3.3.4) (2026-03-10)

### [3.3.3](https://github.com/bitstillery/mithril/compare/v3.3.2...v3.3.3) (2026-03-10)

### [3.3.2](https://github.com/bitstillery/mithril/compare/v3.3.1...v3.3.2) (2026-03-10)

### [3.3.1](https://github.com/bitstillery/mithril/compare/v3.3.0...v3.3.1) (2026-03-10)

## [3.3.0](https://github.com/bitstillery/mithril/compare/v3.2.0...v3.3.0) (2026-03-10)

### Features

- **core:** notify parent signal when keys added/removed from nested state objects ([0711f1e](https://github.com/bitstillery/mithril/commit/0711f1ed1700a46666fc913b46df752a76a1d5b3))

### Bug Fixes

- **api:** only wrap in keyed fragment when remount is requested ([f2c0199](https://github.com/bitstillery/mithril/commit/f2c0199312ddc8dc73b7242cf2c3ac53848bb8b8))

## [3.2.0](https://github.com/bitstillery/mithril/compare/v3.1.2...v3.2.0) (2026-03-10)

### Features

- **api:** add remount option and awaitable route.set ([780800d](https://github.com/bitstillery/mithril/commit/780800d8072f640d1bf26bbe9575fbec5bac4c61))

### Bug Fixes

- **build:** revert release commit and tag when npm publish fails ([8588ac9](https://github.com/bitstillery/mithril/commit/8588ac9e6d59fc7723efbe6299f6d22744dcbcc9))

### [3.1.2](https://github.com/bitstillery/mithril/compare/v3.1.1...v3.1.2) (2026-03-10)

### [3.1.1](https://github.com/bitstillery/mithril/compare/v3.1.0...v3.1.1) (2026-03-10)

## 3.1.0 (2026-03-10)

### Features

- add bun-types dependency and enhance SSR server utilities ([5ca21cd](https://github.com/bitstillery/mithril/commit/5ca21cdcb9adedc6fbaff413873fd10e9037db0e))
- add signal & deep signal store ([0f3844e](https://github.com/bitstillery/mithril/commit/0f3844e5352708b5055ffe21d636079bc83a0e93))
- Add support for `timeout` to `m.request` ([#1966](https://github.com/bitstillery/mithril/issues/1966)) ([d50d53f](https://github.com/bitstillery/mithril/commit/d50d53f31d384b0eac83d4ea24dbe43c96e941fb))
- basic ssr ([f61a749](https://github.com/bitstillery/mithril/commit/f61a7499a453b35aef58162802e52ef0b5735548))
- bring back m.route.params() ([834dd02](https://github.com/bitstillery/mithril/commit/834dd0261043db05f3071bcceac510646cb3dca8))
- **docs:** add page crossfade transition and cleanup logging ([08d83da](https://github.com/bitstillery/mithril/commit/08d83da51bfaad6800c483ba393ede36b8bff734))
- **docs:** add performance demo monitoring and SSR tabs ([d524063](https://github.com/bitstillery/mithril/commit/d5240638990efe070d6e4af295f5c508a835dad4))
- **docs:** add Performance page with signals benchmark ([593a12b](https://github.com/bitstillery/mithril/commit/593a12b71dcf92e22e2f79107cc29bb99d2c5c2e))
- **docs:** add tippy tooltips, icon component, AA version badge, and improve logo styling ([d4181f2](https://github.com/bitstillery/mithril/commit/d4181f20e8c20fc47b9cfcf9235dd21cb2cc5435))
- **docs:** elaborate performance demo with accurate frame time and stress test ([14dc944](https://github.com/bitstillery/mithril/commit/14dc94484b367e3e325c9cf0d8e23eaf8a598fbb))
- **docs:** improve performance demo with configurable stress and monitoring ([fb88bba](https://github.com/bitstillery/mithril/commit/fb88bbaa4de4ee4caefbe5c74cfc99c27310a946))
- **docs:** persist perf sliders via Store, consolidate $docs ([7f982dc](https://github.com/bitstillery/mithril/commit/7f982dc3a930bed42281f8edaef08c5f9948aec4))
- **docs:** sandbox preview for js, jsx, and routing examples ([283d004](https://github.com/bitstillery/mithril/commit/283d004879948181be30228768d6e46d7362e67b))
- Don't reject m.request Promise if extract callback supplied ([#2006](https://github.com/bitstillery/mithril/issues/2006)) ([80b6a1a](https://github.com/bitstillery/mithril/commit/80b6a1af0d02309167788ed7a95aa1f275e07653))
- enhance computed signal behavior and add dynamic property tests ([a8ae37a](https://github.com/bitstillery/mithril/commit/a8ae37a5abf8b6eabe5da737b4a2d8fb7689de4d))
- enhance SSR state serialization with original key tracking and improved circular reference handling ([4b073cc](https://github.com/bitstillery/mithril/commit/4b073cc9dd8c0882909b03ec3259cd578d14de42))
- enhance store save functionality with configurable options ([cd18365](https://github.com/bitstillery/mithril/commit/cd18365f0c7fa74a18e8d3f8a066f663fef1006d))
- implement session management and enhance SSR capabilities ([fe2205c](https://github.com/bitstillery/mithril/commit/fe2205cc7b23f3e73455d3276c2bda5f1615fbda))
- implement SSR state serialization and deserialization utilities ([068b479](https://github.com/bitstillery/mithril/commit/068b4793a58d50eba3a1d546a74fd39db4adca6e))
- Make redraws when Promises returned by event handlers are completed ([61b82cc](https://github.com/bitstillery/mithril/commit/61b82cc92ce02af800d893b231b4ed8595f16037))
- Make streams publishable to NPM ([#1635](https://github.com/bitstillery/mithril/issues/1635)) ([e324cf6](https://github.com/bitstillery/mithril/commit/e324cf6b91a03bc5f58cd38088741313a58e7fd3))
- **ospec:** Allow custom reporters for CI reasons ([#2019](https://github.com/bitstillery/mithril/issues/2019)) ([#2020](https://github.com/bitstillery/mithril/issues/2020)) ([4a72829](https://github.com/bitstillery/mithril/commit/4a72829985454c370f838813a10c2d402971c4b9))
- **ospec:** Allow custom reporters for CI reasons ([#2019](https://github.com/bitstillery/mithril/issues/2019)) ([#2020](https://github.com/bitstillery/mithril/issues/2020)) ([78eeb2b](https://github.com/bitstillery/mithril/commit/78eeb2b365a300905d038b72dd3fcbe369ee77aa))
- partial integrate of release changes ([2d03dc5](https://github.com/bitstillery/mithril/commit/2d03dc5dad948f66160a8eeb4d35bf0fad6743dc))
- partial integrate to fix linting issue ([2a61e17](https://github.com/bitstillery/mithril/commit/2a61e17332e49165cfeaa5ee9d683159f038c383))
- perf testing ([#1789](https://github.com/bitstillery/mithril/issues/1789)) ([9a55a29](https://github.com/bitstillery/mithril/commit/9a55a290cc1ea0adccefd7a124d12eed7d43b903))
- Return empty string node for `false` values ([6170573](https://github.com/bitstillery/mithril/commit/6170573c290e980987cb1b1d9b78631e1b633f83))

### Bug Fixes

- Allow for changing focus in lifecycle hooks ([#1988](https://github.com/bitstillery/mithril/issues/1988)) ([4aac74e](https://github.com/bitstillery/mithril/commit/4aac74eff33a9f3e2765e611377353ec3a750e09))
- Allow for changing focus in lifecycle hooks ([#1988](https://github.com/bitstillery/mithril/issues/1988)) ([8b56c70](https://github.com/bitstillery/mithril/commit/8b56c7091169c0fb057d7afac041a23a4700bcdb))
- Bundler tests only pass when run from project root ([f375bdc](https://github.com/bitstillery/mithril/commit/f375bdc02e457288806ab7fee607415d81fc00c1))
- ci tests ([b957eeb](https://github.com/bitstillery/mithril/commit/b957eeb2757bb8527d74ecef7e47fc9e5bc2bc8d))
- closure compiler requires HTTPS now ([#2007](https://github.com/bitstillery/mithril/issues/2007)) ([460725d](https://github.com/bitstillery/mithril/commit/460725d5c1f7181d1b54963122c81d5cca3e4ee4))
- closure compiler requires HTTPS now ([#2007](https://github.com/bitstillery/mithril/issues/2007)) ([efb0e94](https://github.com/bitstillery/mithril/commit/efb0e94d99b78533475859bad3c1c84238fa17d5))
- **core:** align raw nested signal initialization ([7eedbb9](https://github.com/bitstillery/mithril/commit/7eedbb9a149a3feec07cf1b2af603a1c2e6b66d0))
- **core:** re-link array-backed state when returning $property ([1b5df28](https://github.com/bitstillery/mithril/commit/1b5df2876f083dcd8c50e247a9091ec5c185355c))
- **core:** remove accessor-driven signal repair ([51469d0](https://github.com/bitstillery/mithril/commit/51469d016e318ec278859b6a7dd88fb56e3b5e85))
- document error on master branch according to [#839](https://github.com/bitstillery/mithril/issues/839) ([414e80a](https://github.com/bitstillery/mithril/commit/414e80a1c99ac1f696c9d813e5978f390144e989))
- ensure \_subscribers initialization in Signal and ComputedSignal classes ([9369cea](https://github.com/bitstillery/mithril/commit/9369cea0f985637c37c760407da19c0806f0a8e8))
- ES3 props keyword bug in IE8; eslint errors ([8550501](https://github.com/bitstillery/mithril/commit/8550501fb215e2a9820e96826dc3f7f055dbb4e5))
- eslint rules ([69d04d8](https://github.com/bitstillery/mithril/commit/69d04d88dd53087a93e1a8b09e90bbe101109b81))
- example applications ([ebce961](https://github.com/bitstillery/mithril/commit/ebce961d2660cbfb370b55d4112a1b104683873d))
- For css class addition to svg elements ([f1f77c8](https://github.com/bitstillery/mithril/commit/f1f77c80b306cdd14d755b611e41febd7399e5cc))
- framework export ([e8cb1ce](https://github.com/bitstillery/mithril/commit/e8cb1ce7f52f3f37fda3ae6f9585fe7649d7fc14))
- github actions ([c9e57ef](https://github.com/bitstillery/mithril/commit/c9e57ef08f5c2d7c8152674f4e35a3c2dffc1bd5))
- linting ([ee61ae6](https://github.com/bitstillery/mithril/commit/ee61ae6913e5082f730fd4b526c9d638289f2681))
- linting ([9cc614a](https://github.com/bitstillery/mithril/commit/9cc614a4f0d8177a4929274749bc622ef4c5b29a))
- linting errors ([7b57652](https://github.com/bitstillery/mithril/commit/7b57652261c103e8a5457368195fe6c1ec56d7e6))
- m.route.param, not m.route.params :sweat: ([d119acc](https://github.com/bitstillery/mithril/commit/d119accb21e3b7f9ffb199e451ec8a3e464df549))
- **ospec:** Only run o.run() once ([#2142](https://github.com/bitstillery/mithril/issues/2142)) ([ceabe99](https://github.com/bitstillery/mithril/commit/ceabe993a3265dfbff6e2aeff84dcdc03d233419))
- proxy methods ([e9e436c](https://github.com/bitstillery/mithril/commit/e9e436c901f7de6cbcb5caad8a50abdfbf61c9dd))
- resolve critical nested store signalMap bug and enhance serialization handling ([6e559cd](https://github.com/bitstillery/mithril/commit/6e559cda14ae779ffebf77d66bdaf8fe45d4a973))
- route resolver ([e71ff8e](https://github.com/bitstillery/mithril/commit/e71ff8eebe0335bd80085862484b0b7b84b90c50))
- route.get ssr ([bb5cd76](https://github.com/bitstillery/mithril/commit/bb5cd76b549f3054f926e2a5c093b085491ad64e))
- scroll ([c64251e](https://github.com/bitstillery/mithril/commit/c64251e974a5253ef7bee09348919340e199d4ca))
- selector [value=""] is mishandled ([#1843](https://github.com/bitstillery/mithril/issues/1843)) ([73d9265](https://github.com/bitstillery/mithril/commit/73d9265c6d7e0e611e3a47392233d54d22ec7980))
- stat is undefined in some cornor case ([1403c66](https://github.com/bitstillery/mithril/commit/1403c66072db0bf6c75d8b410adf1cfac33f7ab8))
- **state:** unwrap signals in toSorted, toReversed, toSpliced ([3f2bf51](https://github.com/bitstillery/mithril/commit/3f2bf517304a17e6409d8e99521ad7286ff2f641))
- store save ([825dde6](https://github.com/bitstillery/mithril/commit/825dde648b0032cfa5c957f67313193c8e96d277))
- test ([9f616ce](https://github.com/bitstillery/mithril/commit/9f616ce798b48c76eece951e70969644460f4bf1))
- **test:** ensure Store tests have window/localStorage in CI ([40dc327](https://github.com/bitstillery/mithril/commit/40dc327757d43dd0c534ed420c59f3c75e58a99b))
- tests ([126f326](https://github.com/bitstillery/mithril/commit/126f326c33885636a6b1a00668b015f4f788ba15))
- tests ([80528fd](https://github.com/bitstillery/mithril/commit/80528fd7bf2273d3d26a233585ed974bf62e695f))
- typing errors ([e4ef6df](https://github.com/bitstillery/mithril/commit/e4ef6dfa1be6d8546c825214f45e0942b7deb170))
- Use loose comparison for non-string values ([5ab2cf4](https://github.com/bitstillery/mithril/commit/5ab2cf4172f6425f080c8ffda66c6093d6077c02)), closes [#1593](https://github.com/bitstillery/mithril/issues/1593)
