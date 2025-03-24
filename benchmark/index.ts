#!/usr/bin/env bun
/**
 * Unified Mithril Benchmarking Tool
 * 
 * This script provides a consistent interface to run all Mithril benchmarks.
 * It focuses on pure JavaScript performance tests that don't require a DOM.
 */

import {bench, run, group} from 'mitata'

import m from '../render/hyperscript'
import fragment from '../render/fragment'

/**
 * Simple benchmark for basic operations
 */
async function runSimpleBenchmark() {
    console.log('\nRunning Simple Benchmarks:')
    console.log('=========================')
    
    group('Basic operations', () => {
        bench('String concatenation', () => {
            let result = ''
            for (let i = 0; i < 1000; i++) {
                result += i.toString()
            }
            return result
        })
        
        bench('Array push', () => {
            const arr: number[] = []
            for (let i = 0; i < 1000; i++) {
                arr.push(i)
            }
            return arr
        })
        
        bench('Object property access', () => {
            const obj = {a: 1, b: 2, c: 3, d: 4, e: 5}
            let sum = 0
            for (let i = 0; i < 1000; i++) {
                sum += obj.a + obj.b + obj.c + obj.d + obj.e
            }
            return sum
        })
        
        bench('Array access', () => {
            const arr = [1, 2, 3, 4, 5]
            let sum = 0
            for (let i = 0; i < 1000; i++) {
                sum += arr[0] + arr[1] + arr[2] + arr[3] + arr[4]
            }
            return sum
        })
    })
    
    return run({
        avg: true,
        json: false,
        colors: true,
        min_max: true,
        median: true,
        percentiles: true,
    })
}

/**
 * Benchmark pure vnode creation operations (no DOM)
 */
async function runVnodeOperationBenchmarks() {
    console.log('\nRunning Vnode Creation Benchmarks:')
    console.log('===============================')
    
    group('Vnode Creation', () => {
        bench('Simple div', () => {
            return m('div', {className: 'test'}, 'Hello')
        })
        
        bench('Nested vnodes', () => {
            return m('div', {className: 'parent'}, [
                m('h1', {className: 'title'}, 'Title'),
                m('p', {className: 'content'}, 'Content'),
                m('div', {className: 'footer'}, [
                    m('span', 'Footer'),
                    m('a', {href: '#'}, 'Link'),
                ]),
            ])
        })
        
        bench('Fragment with children', () => {
            return fragment({key: 'test-fragment'}, 
                m('div', 'Item 1'),
                m('div', 'Item 2'),
                m('div', 'Item 3'),
            )
        })
        
        bench('Array of vnodes', () => {
            const items = []
            for (let i = 0; i < 100; i++) {
                items.push(m('div', {key: `item-${i}`}, `Item ${i}`))
            }
            return items
        })
    })
    
    return run({
        avg: true,
        json: false,
        colors: true,
        min_max: true,
        median: true,
        percentiles: true,
    })
}

/**
 * Benchmark algorithms used in Mithril's render process
 */
async function runAlgorithmBenchmarks() {
    console.log('\nRunning Algorithm Benchmarks:')
    console.log('===========================')
    
    group('Array Manipulation', () => {
        // Set up test data
        const smallArray = Array.from({length: 100}, (_, i) => ({key: `key-${i}`, value: i}))
        const mediumArray = Array.from({length: 500}, (_, i) => ({key: `key-${i}`, value: i}))
        
        // Fisher-Yates shuffle implementation
        function shuffle(array: any[]) {
            const result = [...array]
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[result[i], result[j]] = [result[j], result[i]]
            }
            return result
        }
        
        bench('Find item by key (100 items)', () => {
            const targetKey = `key-${Math.floor(Math.random() * 100)}`
            return smallArray.find(item => item.key === targetKey)
        })
        
        bench('Find item by key (500 items)', () => {
            const targetKey = `key-${Math.floor(Math.random() * 500)}`
            return mediumArray.find(item => item.key === targetKey)
        })
        
        bench('Shuffle array (100 items)', () => {
            return shuffle(smallArray)
        })
        
        bench('Shuffle array (500 items)', () => {
            return shuffle(mediumArray)
        })
        
        bench('Map transformation (100 items)', () => {
            return smallArray.map(item => ({
                ...item,
                transformed: item.value * 2,
            }))
        })
        
        bench('Filter array (100 items)', () => {
            return smallArray.filter(item => item.value % 2 === 0)
        })
    })
    
    return run({
        avg: true,
        json: false,
        colors: true,
        min_max: true,
        median: true,
        percentiles: true,
    })
}

/**
 * Print benchmark help
 */
function printHelp() {
    console.log('Mithril Benchmark Tool')
    console.log('=====================')
    console.log('Usage:')
    console.log('  bun benchmark/index.ts [options]')
    console.log('\nOptions:')
    console.log('  --simple        Run simple JS operation benchmarks')
    console.log('  --vnode         Run vnode creation benchmarks')
    console.log('  --algorithms    Run algorithm benchmarks')
    console.log('  --all           Run all benchmarks (default)')
    console.log('  --help, -h      Show this help message')
}

/**
 * Main function
 */
async function main() {
    // Use Bun.argv for Bun compatibility
    const args = Bun.argv.slice(2)
    
    if (args.includes('--help') || args.includes('-h')) {
        printHelp()
        Bun.exit(0)
        return
    }
    
    console.log('Mithril Benchmarks')
    console.log('=================')
    
    try {
        if (args.includes('--simple')) {
            await runSimpleBenchmark()
        } else if (args.includes('--vnode')) {
            await runVnodeOperationBenchmarks()
        } else if (args.includes('--algorithms')) {
            await runAlgorithmBenchmarks()
        } else {
            // Default: run all benchmarks
            console.log('Running all benchmarks...')
            
            const simpleResults = await runSimpleBenchmark()
            console.log('\nSimple benchmark complete. Results:', simpleResults.length, 'benchmarks run')
            
            const vnodeResults = await runVnodeOperationBenchmarks()
            console.log('\nVnode benchmark complete. Results:', vnodeResults.length, 'benchmarks run')
            
            const algoResults = await runAlgorithmBenchmarks()
            console.log('\nAlgorithm benchmark complete. Results:', algoResults.length, 'benchmarks run')
        }
    } catch (error) {
        console.error('Error running benchmarks:', error)
        Bun.exit(1)
    }
}

// Run the benchmark if this is the main module
if (import.meta.url === Bun.main) {
    main()
}

export {
    runSimpleBenchmark,
    runVnodeOperationBenchmarks,
    runAlgorithmBenchmarks,
} 
