/**
 * Mithril benchmarking suite.
 * Run: bun run bench [topic]
 * Topics: hyperscript | render | signal | state
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
    case 'signal':
        await import('./scenarios/signal')
        break
    case 'state':
        await import('./scenarios/state')
        break
    case undefined:
    case '':
        await import('./scenarios/hyperscript')
        await import('./scenarios/render')
        await import('./scenarios/signal')
        await import('./scenarios/state')
        break
    default:
        console.error(`Unknown topic: ${topic}`)
        console.error('Topics: hyperscript, render, signal, state')
        process.exit(1)
}

await run()
