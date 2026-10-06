/**
 * Mithril benchmarking suite.
 * Run: bun run bench [topic]
 * Topics: hyperscript | render | router | signal | state | store-hot-path | vnode-alloc
 * Omit topic to run all benchmarks.
 */
import {run} from 'mitata'

const topic = process.argv[2]?.toLowerCase()

switch (topic) {
    case 'hyperscript':
        await import('./scenarios/hyperscript')
        break
    case 'render':
        await import('./scenarios/render')
        break
    case 'router':
        await import('./scenarios/router')
        break
    case 'signal':
        await import('./scenarios/signal')
        break
    case 'state':
        await import('./scenarios/state')
        break
    case 'store-hot-path':
        await import('./scenarios/store-hot-path')
        break
    case 'vnode-alloc':
        await import('./scenarios/vnode-alloc')
        break
    case undefined:
    case '':
        await import('./scenarios/hyperscript')
        await import('./scenarios/render')
        await import('./scenarios/router')
        await import('./scenarios/signal')
        await import('./scenarios/state')
        await import('./scenarios/store-hot-path')
        await import('./scenarios/vnode-alloc')
        break
    default:
        console.error(`Unknown topic: ${topic}`)
        console.error('Topics: hyperscript, render, router, signal, state, store-hot-path, vnode-alloc')
        process.exit(1)
}

await run()
