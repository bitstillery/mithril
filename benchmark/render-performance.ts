#!/usr/bin/env bun
/**
 * Render Performance Benchmark using JSDOM
 */

import {bench, run, group} from 'mitata'
import {JSDOM} from 'jsdom'

import renderFn from '../render/render'
import m from '../render/hyperscript'
import fragment from '../render/fragment'

/**
 * A benchmarking tool for Mithril's render function
 */
class RenderBenchmark {
    private dom: JSDOM
    private window: any
    private document: any
    private root: any
    private render: any
    private groups: any[] = []
    private currentGroup: string | null = null
    private benchmarkOptions: any

    constructor(options: any = {}) {
        // Default configuration
        this.benchmarkOptions = {
            iterations: 1000,
            ...options,
        }
    
        // Setup DOM environment
        this.setupDOM()
    }

    /**
     * Create a JSDOM environment for testing
     */
    private setupDOM() {
        this.dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
        this.window = this.dom.window
        this.document = this.window.document
        this.root = this.document.createElement('div')
        this.document.body.appendChild(this.root)
        this.render = renderFn(this.window)
    }

    /**
     * Reset the DOM before each test
     */
    private resetDOM() {
        // Completely recreate the DOM to avoid node reference issues
        this.setupDOM()
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
        
        // Create a benchmark function that's safer
        const benchFn = () => {
            this.resetDOM()
            this.render(this.root, initialVnodes)
            this.render(this.root, updatedVnodes)
            // Return something to prevent optimization
            return this.root.innerHTML.length
        }
        
        group.tests.push({
            name, 
            fn: benchFn,
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
    
        // Run the benchmarks
        return run({
            colors: true,
            min_max: true,
            median: true,
            percentiles: true,
        })
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

// Export for use in run.ts
export {RenderBenchmark}

// If run directly, execute standard benchmarks
if (import.meta.main) {
    console.log('Starting render benchmark...')
    
    const benchmark = new RenderBenchmark({iterations: 100})
    
    // Simple list operations
    const smallList = RenderBenchmark.generateList(10)
    const mediumList = RenderBenchmark.generateList(100)
    
    benchmark
        .startGroup('List Operations')
        .add('Create 10 elements', [], smallList)
        .add('Create 100 elements', [], mediumList)
        .add('Update 10 elements', smallList, RenderBenchmark.shuffleList(smallList))
    
    // Run the benchmark
    benchmark.run().catch(error => {
        console.error('Error running benchmarks:', error)
    })
} 
