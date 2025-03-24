import {bench, run, group} from 'mitata'

import { JSDOM } from 'jsdom'
import renderFn from '../render/render'
import m from '../render/hyperscript'
import fragment from '../render/fragment'

/**
 * A benchmarking tool for Mithril's render function
 */
class RenderBenchmark {
    private $window: any
    private root: any
    private render: any
    private groups: any[] = []
    private currentGroup: string | null = null
    private benchOptions: any

    constructor(options: any = {}) {
    // Default configuration
        this.benchOptions = {
            iterations: 1000,
            ...options,
        }
    
        // Setup DOM environment
        this.setupDOM()
    }

    /**
   * Create a mock DOM environment for testing
   */
    private setupDOM() {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
        this.$window = dom.window
        this.root = this.$window.document.createElement('div')
        this.render = renderFn(this.$window)
    }

    /**
   * Reset the DOM before each test
   */
    private resetDOM() {
        this.root.childNodes = []
        this.root.innerHTML = ''
    }

    /**
   * Start a new group of benchmarks
   */
    startGroup(name: string) {
        this.currentGroup = name
        return this
    }

    /**
   * Add a benchmark test for rendering
   * 
   * @param name - Name of the benchmark test
   * @param initialVnodes - Initial virtual nodes to render
   * @param updatedVnodes - Updated virtual nodes to render in second pass
   */
    add(name: string, initialVnodes: any, updatedVnodes: any) {
        const groupName = this.currentGroup || 'default'
    
        if (!this.groups.find(g => g.name === groupName)) {
            this.groups.push({
                name: groupName,
                tests: [],
            })
        }
    
        const group = this.groups.find(g => g.name === groupName)
        group.tests.push({
            name, 
            fn: () => {
                this.resetDOM()
                this.render(this.root, initialVnodes)
                this.render(this.root, updatedVnodes)
            },
        })
    
        return this
    }

    /**
   * Run all the benchmarks
   */
    async run() {
        console.log('Running Mithril render benchmarks...')
        console.log('=====================================')
    
        // Register all benchmarks
        for (const g of this.groups) {
            if (g.tests.length > 0) {
                group(g.name, () => {
                    for (const test of g.tests) {
                        bench(test.name, test.fn)
                    }
                })
            }
        }
    
        // Run the benchmarks and print results
        const results = await run({
            avg: true,
            json: false,
            colors: true,
            min_max: true,
            median: true,
            percentiles: true,
        })
    
        return results
    }
  
    /**
   * Generate a list of vnodes of specified size with specified key pattern
   */
    static generateList(size: number, withKeys: boolean = true) {
        const result = []
    
        for (let i = 0; i < size; i++) {
            result.push(m('div', 
                withKeys ? {key: `key-${i}`} : undefined, 
                `Item ${i}`,
            ))
        }
    
        return result
    }
  
    /**
   * Generate a reversed list based on the input list
   */
    static reverseList(list: any[]) {
        return [...list].reverse()
    }
  
    /**
   * Generate a shuffled list based on the input list
   */
    static shuffleList(list: any[]) {
        const result = [...list]
    
        // Fisher-Yates shuffle
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]]
        }
    
        return result
    }
  
    /**
   * Generate a nested tree of vnodes with specified depth and width
   */
    static generateTree(depth: number, width: number, withKeys: boolean = true) {
        if (depth <= 0) return m('div', withKeys ? {key: 'leaf'} : undefined, 'Leaf Node')
    
        const children = []
        for (let i = 0; i < width; i++) {
            children.push(RenderBenchmark.generateTree(depth - 1, width, withKeys))
        }
    
        return m('div', 
            withKeys ? {key: `node-${depth}-${width}`} : undefined, 
            children,
        )
    }
}

// Standard benchmark scenarios
async function runStandardBenchmarks() {
    const benchmark = new RenderBenchmark({iterations: 100})
  
    // Simple list operations
    const smallList = RenderBenchmark.generateList(10)
    const mediumList = RenderBenchmark.generateList(100)
    const largeList = RenderBenchmark.generateList(1000)
  
    benchmark
        .startGroup('List Creation')
        .add('Create 10 elements', [], smallList)
        .add('Create 100 elements', [], mediumList)
        .add('Create 1000 elements', [], largeList)
    
        .startGroup('List Removal')
        .add('Remove 10 elements', smallList, [])
        .add('Remove 100 elements', mediumList, [])
        .add('Remove 1000 elements', largeList, [])
    
        .startGroup('List Operations')
        .add('Reverse 10 elements', smallList, RenderBenchmark.reverseList(smallList))
        .add('Reverse 100 elements', mediumList, RenderBenchmark.reverseList(mediumList))
        .add('Shuffle 10 elements', smallList, RenderBenchmark.shuffleList(smallList))
        .add('Shuffle 100 elements', mediumList, RenderBenchmark.shuffleList(mediumList))
  
    // Tree operations
    const smallTree = RenderBenchmark.generateTree(3, 3)
    const mediumTree = RenderBenchmark.generateTree(4, 4)
  
    benchmark
        .startGroup('Tree Operations')
        .add('Create small tree (3x3)', [], smallTree)
        .add('Create medium tree (4x4)', [], mediumTree)
        .add('Update small tree', smallTree, RenderBenchmark.generateTree(3, 3))
        .add('Update medium tree', mediumTree, RenderBenchmark.generateTree(4, 4))
  
    // Mixed operations with fragments
    const fragmentExample = [
        fragment({key: 'frag1'}, m('div', {key: 1}, 'Item 1'), m('div', {key: 2}, 'Item 2')),
        m('div', {key: 3}, 'Item 3'),
    ]
  
    const fragmentModified = [
        fragment({key: 'frag1'}, m('div', {key: 2}, 'Item 2'), m('div', {key: 1}, 'Item 1')),
        m('div', {key: 3}, 'Item 3'),
    ]
  
    benchmark
        .startGroup('Fragment Operations')
        .add('Fragment update', fragmentExample, fragmentModified)
  
    // Run all benchmarks
    return benchmark.run()
}

// Compare keyed vs non-keyed performance
async function compareKeyedVsNonKeyed() {
    const benchmark = new RenderBenchmark({iterations: 100})
  
    // Generate lists with and without keys
    const keyedList = RenderBenchmark.generateList(100, true)
    const nonKeyedList = RenderBenchmark.generateList(100, false)
  
    const keyedListReversed = RenderBenchmark.reverseList(keyedList)
    const nonKeyedListReversed = RenderBenchmark.reverseList(nonKeyedList)
  
    const keyedListShuffled = RenderBenchmark.shuffleList(keyedList)
    const nonKeyedListShuffled = RenderBenchmark.shuffleList(nonKeyedList)
  
    // Trees with and without keys
    const keyedTree = RenderBenchmark.generateTree(3, 3, true)
    const nonKeyedTree = RenderBenchmark.generateTree(3, 3, false)
  
    benchmark
        .startGroup('List Creation')
        .add('Keyed list creation', [], keyedList)
        .add('Non-keyed list creation', [], nonKeyedList)
    
        .startGroup('List Update')
        .add('Keyed list update', keyedList, keyedList)
        .add('Non-keyed list update', nonKeyedList, nonKeyedList)
    
        .startGroup('List Reordering')
        .add('Keyed list reverse', keyedList, keyedListReversed)
        .add('Non-keyed list reverse', nonKeyedList, nonKeyedListReversed)
        .add('Keyed list shuffle', keyedList, keyedListShuffled)
        .add('Non-keyed list shuffle', nonKeyedList, nonKeyedListShuffled)
    
        .startGroup('Tree Creation')
        .add('Keyed tree creation', [], keyedTree)
        .add('Non-keyed tree creation', [], nonKeyedTree)
  
    return benchmark.run()
}

// Main function to run benchmarks
async function main() {
    // Parse command line arguments
    const args = Bun.argv.slice(2)
  
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Mithril Render Benchmark Tool')
        console.log('============================')
        console.log('Usage:')
        console.log('  bun benchmark/render-performance.ts [options]')
        console.log('\nOptions:')
        console.log('  --standard       Run standard benchmarks (default)')
        console.log('  --keyed          Compare keyed vs non-keyed performance')
        console.log('  --all            Run all benchmarks')
        console.log('  --help, -h       Show this help message')
        process.exit(0)
    }
  
    if (args.includes('--all')) {
        console.log('Running all benchmarks...\n')
        await runStandardBenchmarks()
        console.log('\n')
        await compareKeyedVsNonKeyed()
    } else if (args.includes('--keyed')) {
        await compareKeyedVsNonKeyed()
    } else {
    // Default: run standard benchmarks
        await runStandardBenchmarks()
    }
}

// Run the benchmarks
if (import.meta.url === Bun.main) {
    main()
}

export {RenderBenchmark} 
