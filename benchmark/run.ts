#!/usr/bin/env bun
/**
 * Mithril Benchmark Runner
 * 
 * A consolidated entry point for running various Mithril benchmarks.
 */

import {runDirectRenderBenchmark} from './direct-render-benchmark'
import {RenderBenchmark} from './render-performance'
import { 
    benchmarkGetNextSibling, 
    benchmarkMoveDOM, 
    benchmarkRemoveNodes, 
    benchmarkLISOptimization, 
} from './optimizations-benchmark'

// Parse command line arguments
const args = process.argv.slice(2)

/**
 * Show help message with available commands
 */
function showHelp() {
    console.log('Mithril Benchmark Tool')
    console.log('====================')
    console.log('Usage:')
    console.log('  bun benchmark/run.ts [benchmark-type]')
    console.log('\nAvailable benchmark types:')
    console.log('  direct         - Direct DOM rendering with JSDOM')
    console.log('  render         - Render performance benchmarks')
    console.log('  next-sibling   - Test getNextSibling optimization')
    console.log('  move-dom       - Test moveDOM optimization')
    console.log('  remove-nodes   - Test removeNodes optimization')
    console.log('  lis            - Test LIS algorithm optimization')
    console.log('  optimizations  - All optimization benchmarks')
    console.log('  all            - Run all benchmarks')
    console.log('  help           - Show this help message')
}

/**
 * Run the standard render performance benchmarks
 */
async function runRenderBenchmarks() {
    console.log('\nMithril Render Performance Benchmarks')
    console.log('===================================')
    
    const benchmark = new RenderBenchmark({iterations: 50})
    
    // Simple list operations
    const smallList = RenderBenchmark.generateList(10)
    const mediumList = RenderBenchmark.generateList(50)
    const largeList = RenderBenchmark.generateList(100)
    
    // Create shuffled and reversed lists for updates
    const smallListShuffled = RenderBenchmark.shuffleList(smallList)
    const mediumListShuffled = RenderBenchmark.shuffleList(mediumList)
    const smallListReversed = RenderBenchmark.reverseList(smallList)
    
    // Define benchmark tests
    benchmark
        .startGroup('List Creation')
        .add('Create 10 elements', [], smallList)
        .add('Create 50 elements', [], mediumList)
        .add('Create 100 elements', [], largeList)
        
        .startGroup('List Removal')
        .add('Remove 10 elements', smallList, [])
        .add('Remove 50 elements', mediumList, [])
        .add('Remove 100 elements', largeList, [])
        
        .startGroup('List Operations')
        .add('Reverse 10 elements', smallList, smallListReversed)
        .add('Shuffle 10 elements', smallList, smallListShuffled)
        .add('Shuffle 50 elements', mediumList, mediumListShuffled)
        
        .startGroup('Identical Render')
        .add('Re-render identical 10 elements', smallList, smallList)
        .add('Re-render identical 50 elements', mediumList, mediumList)
        .add('Re-render identical 100 elements', largeList, largeList)
    
    return benchmark.run()
}

/**
 * Run all optimization benchmarks
 */
async function runAllOptimizations() {
    console.log('\nRunning all optimization benchmarks...')
    await benchmarkGetNextSibling()
    await benchmarkMoveDOM()
    await benchmarkRemoveNodes()
    await benchmarkLISOptimization()
}

// ========================
// MAIN BENCHMARK EXECUTION
// ========================

// Display header
console.log('Mithril Benchmark Suite')
console.log('======================')

// Show help if requested or no args
if (args.includes('--help') || args.includes('-h') || args.includes('help') || args.length === 0) {
    showHelp()
    process.exit(0)
}

// Execute the benchmark based on the argument
try {
    if (args.includes('direct')) {
        await runDirectRenderBenchmark()
    } else if (args.includes('render')) {
        await runRenderBenchmarks()
    } else if (args.includes('next-sibling')) {
        await benchmarkGetNextSibling()
    } else if (args.includes('move-dom')) {
        await benchmarkMoveDOM()
    } else if (args.includes('remove-nodes')) {
        await benchmarkRemoveNodes()
    } else if (args.includes('lis')) {
        await benchmarkLISOptimization()
    } else if (args.includes('optimizations')) {
        await runAllOptimizations()
    } else if (args.includes('all')) {
        await runDirectRenderBenchmark()
        await runRenderBenchmarks()
        await runAllOptimizations()
    } else {
        console.log('Unknown benchmark type. Use help to see available options.')
        process.exit(1)
    }
} catch (error) {
    console.error('Error running benchmarks:', error)
    process.exit(1)
} 
