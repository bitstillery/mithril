#!/usr/bin/env bun
/**
 * Mithril Benchmark Runner
 * 
 * A consolidated entry point for running various Mithril benchmarks.
 */

import {runDirectRenderBenchmark} from './direct-render-benchmark'
import {RenderBenchmark} from './render-performance'
import {OptimizationsBenchmark} from './optimizations-benchmark'

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
    console.log('  direct      - Direct DOM rendering with JSDOM')
    console.log('  render      - Standard render operations')
    console.log('  keyed       - Compare keyed vs non-keyed performance')
    console.log('  optimize    - Test optimization impact')
    console.log('  nextsibling - Test getNextSibling optimization')
    console.log('  movedom     - Test moveDOM optimization')
    console.log('  removenodes - Test removeNodes optimization')
    console.log('  lis         - Test LIS algorithm optimization')
    console.log('  all         - Run all benchmarks')
    console.log('  help        - Show this help message')
}

/**
 * Run standard render benchmarks
 */
async function runStandardBenchmarks() {
    console.log('\nRunning standard render benchmarks...')
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
    
    return benchmark.run()
}

/**
 * Compare keyed vs non-keyed performance
 */
async function runKeyedVsNonKeyedBenchmark() {
    console.log('\nRunning keyed vs non-keyed comparison...')
    const benchmark = new RenderBenchmark({iterations: 100})
    
    // Generate lists with and without keys
    const keyedList = RenderBenchmark.generateList(100, true)
    const nonKeyedList = RenderBenchmark.generateList(100, false)
    
    benchmark
        .startGroup('List Operations')
        .add('Keyed list creation', [], keyedList)
        .add('Non-keyed list creation', [], nonKeyedList)
        .add('Keyed list reverse', keyedList, RenderBenchmark.reverseList(keyedList))
        .add('Non-keyed list reverse', nonKeyedList, RenderBenchmark.reverseList(nonKeyedList))
        .add('Keyed list shuffle', keyedList, RenderBenchmark.shuffleList(keyedList))
        .add('Non-keyed list shuffle', nonKeyedList, RenderBenchmark.shuffleList(nonKeyedList))
    
    return benchmark.run()
}

/**
 * Run benchmarks for getNextSibling optimization
 */
async function runGetNextSiblingBenchmark() {
    console.log('\nTesting getNextSibling optimization...')
    const benchmark = new OptimizationsBenchmark({iterations: 50})
    
    // Create sparse lists of different sizes
    const smallSparseList = OptimizationsBenchmark.generateSparseList(50)
    const mediumSparseList = OptimizationsBenchmark.generateSparseList(200)
    
    // Create regular lists for comparison
    const smallList = OptimizationsBenchmark.generateList(50)
    const mediumList = OptimizationsBenchmark.generateList(200)
    
    benchmark
        .startGroup('Sparse List Updates')
        .add('Update sparse list (50 items)', smallSparseList, OptimizationsBenchmark.shuffleList(smallSparseList))
        .add('Update regular list (50 items)', smallList, OptimizationsBenchmark.shuffleList(smallList))
        .add('Update sparse list (200 items)', mediumSparseList, OptimizationsBenchmark.shuffleList(mediumSparseList))
        .add('Update regular list (200 items)', mediumList, OptimizationsBenchmark.shuffleList(mediumList))
    
    return benchmark.run()
}

/**
 * Run benchmarks for moveDOM optimization
 */
async function runMoveDOMBenchmark() {
    console.log('\nTesting moveDOM optimization...')
    const benchmark = new OptimizationsBenchmark({iterations: 50})
    
    // Create fragment lists with different sizes
    const smallFragmentList = OptimizationsBenchmark.generateFragmentList(10, 3)
    const mediumFragmentList = OptimizationsBenchmark.generateFragmentList(20, 5)
    
    benchmark
        .startGroup('Fragment Operations')
        .add('Create small fragment list', [], smallFragmentList)
        .add('Create medium fragment list', [], mediumFragmentList)
        .add('Reverse small fragment list', 
            smallFragmentList, 
            OptimizationsBenchmark.reverseList(smallFragmentList))
        .add('Shuffle small fragment list', 
            smallFragmentList, 
            OptimizationsBenchmark.shuffleList(smallFragmentList))
    
    return benchmark.run()
}

/**
 * Run benchmarks for removeNodes optimization
 */
async function runRemoveNodesBenchmark() {
    console.log('\nTesting removeNodes optimization...')
    const benchmark = new OptimizationsBenchmark({iterations: 50})
    
    // Create lists with different removal patterns
    const {initial: smallInitial, withRemovals: smallWithRemovals} = 
        OptimizationsBenchmark.generateListWithRemovals(100, [2, 5])
    
    const {initial: mediumInitial, withRemovals: mediumWithRemovals} = 
        OptimizationsBenchmark.generateListWithRemovals(500, [3, 7])
    
    benchmark
        .startGroup('Partial Removals')
        .add('Small list with removals (100→~60 items)', smallInitial, smallWithRemovals)
        .add('Medium list with removals (500→~300 items)', mediumInitial, mediumWithRemovals)
        
        .startGroup('Complete Removals')
        .add('Complete removal of small list (100→0)', smallInitial, [])
        .add('Complete removal of medium list (500→0)', mediumInitial, [])
    
    return benchmark.run()
}

/**
 * Run benchmarks for LIS algorithm optimization
 */
async function runLISBenchmark() {
    console.log('\nTesting LIS algorithm optimization...')
    const benchmark = new OptimizationsBenchmark({iterations: 50})
    
    // Create keyed lists of different sizes
    const smallList = OptimizationsBenchmark.generateList(50)
    const mediumList = OptimizationsBenchmark.generateList(200)
    
    // Create shuffled versions that will trigger LIS algorithm
    const smallListComplexShuffle = [
        ...smallList.slice(smallList.length / 2),
        ...smallList.slice(0, smallList.length / 2),
    ]
    
    const mediumListComplexShuffle = [
        ...mediumList.slice(mediumList.length / 3 * 2),
        ...mediumList.slice(0, mediumList.length / 3),
        ...mediumList.slice(mediumList.length / 3, mediumList.length / 3 * 2),
    ]
    
    benchmark
        .startGroup('Complex List Reordering')
        .add('Complex reordering - small list (50 items)', smallList, smallListComplexShuffle)
        .add('Complex reordering - medium list (200 items)', mediumList, mediumListComplexShuffle)
    
    return benchmark.run()
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
if (args.includes('direct')) {
    runDirectRenderBenchmark().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('render')) {
    runStandardBenchmarks().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('keyed')) {
    runKeyedVsNonKeyedBenchmark().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('optimize')) {
    Promise.all([
        runGetNextSiblingBenchmark(),
        runMoveDOMBenchmark(),
        runRemoveNodesBenchmark(),
        runLISBenchmark(),
    ]).catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('nextsibling')) {
    runGetNextSiblingBenchmark().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('movedom')) {
    runMoveDOMBenchmark().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('removenodes')) {
    runRemoveNodesBenchmark().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('lis')) {
    runLISBenchmark().catch(error => {
        console.error('Error running benchmark:', error)
    })
} else if (args.includes('all')) {
    console.log('Running all benchmarks...')
    Promise.all([
        runDirectRenderBenchmark(),
        runStandardBenchmarks(),
        runKeyedVsNonKeyedBenchmark(),
        runGetNextSiblingBenchmark(),
        runMoveDOMBenchmark(),
        runRemoveNodesBenchmark(),
        runLISBenchmark(),
    ]).catch(error => {
        console.error('Error running benchmark:', error)
    })
} else {
    console.log('Unknown benchmark type. Use --help to see available options.')
    process.exit(1)
} 
