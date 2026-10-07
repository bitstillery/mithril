/**
 * The state read path as it actually runs during a render.
 *
 * `bench/scenarios/state.ts` measures state creation and reads with no component context. That misses
 * the case that dominates a real app: reads that happen INSIDE a component's `view()`, where
 * `currentComponent` is set and every read also records a dependency. In a portal render profile the
 * proxy `get` traps plus signal access were the largest non-Mithril block, so this is the path worth
 * optimising against.
 *
 * Per tracked property read the framework currently does, roughly:
 *   1. proxy `get` trap  — internal-name comparisons, `$`-prefix check
 *   2. `ensurePropertySignal` — Map lookup
 *   3. `signal.value` getter — subscriber check, then `trackComponentRead`
 *   4. `trackComponentRead` — one compare when this render already read the signal, else a compare
 *      with the read at the same position in the component's last render
 *
 * State is created OUTSIDE each benchmark body so these measure reads, not construction.
 *
 * Run: bun run bench store-hot-path
 *
 * IMPORTANT: validate any winner on V8 as well (in-app via `bun cli profile`, or node). Bun is JSC, and
 * the two engines disagree sharply on exactly this kind of code — a `new Array` vs `Array.from` change in
 * render/vnode.ts measured ~2.6x on JSC and ~15x on V8.
 */
import {bench, summary} from 'mitata'

import {state, clearStateRegistry} from '../../src/index'
import {setCurrentComponent, clearCurrentComponent} from '../../src/state/signal'

clearStateRegistry()

/** Stand-in for a component instance; identity is all the dependency tracker uses. */
const component = {name: 'BenchComponent'}

/** A state shaped like real app state: a mix of scalars, and nesting a view would walk. */
function make_state() {
    return state({
        artkey: 1,
        collapsed: false,
        count: 0,
        env: {layout: 'desktop', uri: '/', width: 1400},
        identity: {token: 'abc', user: {artkey: 2, first_name: 'A', language: 'en-GB'}},
        language: 'en-GB',
        name: 'test',
    })
}

const flat = make_state()
const tracked = make_state()
const nested = make_state()
const many = make_state()

// Pre-warm so every benchmark measures the steady state (signals created, dependencies already
// recorded) rather than first-access construction, which happens once per property in a real session.
setCurrentComponent(component)
void tracked.count
void nested.identity.user.first_name
void many.artkey
void many.language
void many.name
void many.collapsed
void many.env.uri
clearCurrentComponent()

summary(() => {
    bench('read flat — no component (untracked)', () => {
        let sum = 0
        for (let i = 0; i < 100; i++) sum += flat.count
        return sum
    })

    bench('read flat — inside a render (tracked)', () => {
        setCurrentComponent(component)
        let sum = 0
        for (let i = 0; i < 100; i++) sum += tracked.count
        clearCurrentComponent()
        return sum
    })
})

summary(() => {
    bench('read depth-1 — tracked', () => {
        setCurrentComponent(component)
        let s = ''
        for (let i = 0; i < 100; i++) s = nested.language
        clearCurrentComponent()
        return s
    })

    // Each level is its own proxy + signal, so cost scales with depth — and app views routinely read
    // things like `$s.identity.user.first_name`.
    bench('read depth-3 — tracked', () => {
        setCurrentComponent(component)
        let s = ''
        for (let i = 0; i < 100; i++) s = nested.identity.user.first_name
        clearCurrentComponent()
        return s
    })
})

bench('read 6 distinct props — tracked (a small view body)', () => {
    setCurrentComponent(component)
    let acc: any = 0
    for (let i = 0; i < 100; i++) {
        acc = many.artkey + many.language.length + many.name.length + (many.collapsed ? 1 : 0) + many.env.uri.length
    }
    clearCurrentComponent()
    return acc
})

/**
 * The one optimisation here that needs no framework change, only a habit in view code.
 *
 * Every level of a chained read is its own proxy trap + signal access + dependency record, so
 * `$s.identity.user.first_name` costs roughly three times `$s.language` — and a view that reads the same
 * deep path several times pays that each time. Reading it once into a local collapses the repeats to a
 * plain variable read, and the dependency is still recorded (the first read does it), so reactivity is
 * unchanged.
 */
summary(() => {
    const deep = make_state()

    bench('deep path read 5x — repeated (naive view)', () => {
        setCurrentComponent(component)
        let acc = 0
        for (let i = 0; i < 100; i++) {
            acc =
                deep.identity.user.first_name.length +
                deep.identity.user.artkey +
                deep.identity.user.language.length +
                deep.identity.user.first_name.length +
                deep.identity.user.artkey
        }
        clearCurrentComponent()
        return acc
    })

    bench('deep path read 5x — hoisted into a local', () => {
        setCurrentComponent(component)
        let acc = 0
        for (let i = 0; i < 100; i++) {
            const user = deep.identity.user
            acc = user.first_name.length + user.artkey + user.language.length + user.first_name.length + user.artkey
        }
        clearCurrentComponent()
        return acc
    })
})

summary(() => {
    const write_target = make_state()
    bench('write — unchanged value (dedupes, no notify)', () => {
        for (let i = 0; i < 100; i++) write_target.count = 0
    })

    bench('write — changed value (notifies)', () => {
        for (let i = 0; i < 100; i++) write_target.count = i
    })
})
