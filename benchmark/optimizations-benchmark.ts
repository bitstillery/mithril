import m from '../render/hyperscript'
import fragment from '../render/fragment'

import {RenderBenchmark} from './render-performance'

/**
 * A benchmarking tool specifically for measuring the impact of optimizations
 * on key rendering operations that were improved
 */
class OptimizationsBenchmark extends RenderBenchmark {
    /**
   * Generate a list with adjacent empty slots (nulls)
   * This tests the binary search getNextSibling optimization
   */
    static generateSparseList(size: number, emptyFrequency: number = 3) {
        const result = []
    
        for (let i = 0; i < size; i++) {
            if (i % emptyFrequency === 0) {
                result.push(null)
            } else {
                result.push(m('div', {key: `key-${i}`}, `Item ${i}`))
            }
        }
    
        return result
    }
  
    /**
   * Generate a list of vnodes with large domSize
   * This tests the moveDOM optimization for fragments
   */
    static generateFragmentList(size: number, fragmentSize: number = 5) {
        const result = []
    
        for (let i = 0; i < size; i++) {
            const fragmentChildren = []
            for (let j = 0; j < fragmentSize; j++) {
                fragmentChildren.push(m('div', {key: `key-${i}-${j}`}, `Item ${i}-${j}`))
            }
            result.push(fragment({key: `fragment-${i}`}, ...fragmentChildren))
        }
    
        return result
    }
  
    /**
   * Generate a large list where some items will be removed
   * This tests the batch removal optimization
   */
    static generateListWithRemovals(size: number, removalPattern: number[] = [2, 5, 8]) {
        const initial = []
    
        for (let i = 0; i < size; i++) {
            initial.push(m('div', {key: `key-${i}`}, `Item ${i}`))
        }
    
        // Create a version with some items removed
        const withRemovals = initial.filter((_, index) => {
            return !removalPattern.some(pattern => index % pattern === 0)
        })
    
        return {initial, withRemovals}
    }
}

/**
 * Run benchmarks focused on getNextSibling optimization
 */
async function benchmarkGetNextSibling() {
    console.log('\nTesting getNextSibling optimization:')
    console.log('----------------------------------')
  
    const benchmark = new OptimizationsBenchmark({iterations: 50})
  
    // Create sparse lists of different sizes
    const smallSparseList = OptimizationsBenchmark.generateSparseList(50)
    const mediumSparseList = OptimizationsBenchmark.generateSparseList(200)
    const largeSparseList = OptimizationsBenchmark.generateSparseList(1000)
  
    // Create regular lists for comparison
    const smallList = OptimizationsBenchmark.generateList(50)
    const mediumList = OptimizationsBenchmark.generateList(200)
    const largeList = OptimizationsBenchmark.generateList(1000)
  
    // Test with different patterns of updates
    benchmark
        .startGroup('Sparse List Updates')
        .add('Update sparse list (50 items)', smallSparseList, OptimizationsBenchmark.shuffleList(smallSparseList))
        .add('Update regular list (50 items)', smallList, OptimizationsBenchmark.shuffleList(smallList))
        .add('Update sparse list (200 items)', mediumSparseList, OptimizationsBenchmark.shuffleList(mediumSparseList))
        .add('Update regular list (200 items)', mediumList, OptimizationsBenchmark.shuffleList(mediumList))
        .add('Update sparse list (1000 items)', largeSparseList, OptimizationsBenchmark.shuffleList(largeSparseList))
        .add('Update regular list (1000 items)', largeList, OptimizationsBenchmark.shuffleList(largeList))
  
    return benchmark.run()
}

/**
 * Run benchmarks focused on moveDOM optimization for fragments
 */
async function benchmarkMoveDOM() {
    console.log('\nTesting moveDOM optimization:')
    console.log('--------------------------')
  
    const benchmark = new OptimizationsBenchmark({iterations: 50})
  
    // Create fragment lists with different sizes
    const smallFragmentList = OptimizationsBenchmark.generateFragmentList(10, 3) // 10 fragments, 3 items each
    const mediumFragmentList = OptimizationsBenchmark.generateFragmentList(20, 5) // 20 fragments, 5 items each
    const largeFragmentList = OptimizationsBenchmark.generateFragmentList(10, 10) // 10 fragments, 10 items each
  
    // Test different operations on fragments
    benchmark
        .startGroup('Fragment Creation')
        .add('Create small fragment list', [], smallFragmentList)
        .add('Create medium fragment list', [], mediumFragmentList)
        .add('Create large fragment list', [], largeFragmentList)
    
        .startGroup('Fragment Reordering')
        .add('Reverse small fragment list', smallFragmentList, OptimizationsBenchmark.reverseList(smallFragmentList))
        .add('Reverse medium fragment list', mediumFragmentList, OptimizationsBenchmark.reverseList(mediumFragmentList))
        .add('Shuffle small fragment list', smallFragmentList, OptimizationsBenchmark.shuffleList(smallFragmentList))
        .add('Shuffle medium fragment list', mediumFragmentList, OptimizationsBenchmark.shuffleList(mediumFragmentList))
  
    return benchmark.run()
}

/**
 * Run benchmarks focused on batch removal optimization
 */
async function benchmarkRemoveNodes() {
    console.log('\nTesting removeNodes optimization:')
    console.log('------------------------------')
  
    const benchmark = new OptimizationsBenchmark({iterations: 50})
  
    // Create lists with different removal patterns
    const {initial: smallInitial, withRemovals: smallWithRemovals} = 
    OptimizationsBenchmark.generateListWithRemovals(100, [2, 5])
  
    const {initial: mediumInitial, withRemovals: mediumWithRemovals} = 
    OptimizationsBenchmark.generateListWithRemovals(500, [3, 7])
  
    const {initial: largeInitial, withRemovals: largeWithRemovals} = 
    OptimizationsBenchmark.generateListWithRemovals(1000, [2, 5, 7])
  
    // Test removal operations
    benchmark
        .startGroup('Partial Removals')
        .add('Small list with sparse removals (100→~60 items)', smallInitial, smallWithRemovals)
        .add('Medium list with sparse removals (500→~300 items)', mediumInitial, mediumWithRemovals)
        .add('Large list with sparse removals (1000→~600 items)', largeInitial, largeWithRemovals)
    
        .startGroup('Complete Removals')
        .add('Complete removal of small list (100→0)', smallInitial, [])
        .add('Complete removal of medium list (500→0)', mediumInitial, [])
        .add('Complete removal of large list (1000→0)', largeInitial, [])
  
    return benchmark.run()
}

/**
 * Run benchmarks focused on LIS algorithm optimization
 */
async function benchmarkLISOptimization() {
    console.log('\nTesting LIS algorithm optimization:')
    console.log('--------------------------------')
  
    const benchmark = new OptimizationsBenchmark({iterations: 50})
  
    // Create keyed lists of different sizes
    const smallList = OptimizationsBenchmark.generateList(50)
    const mediumList = OptimizationsBenchmark.generateList(200)
    const largeList = OptimizationsBenchmark.generateList(500)
  
    // Create shuffled versions that will trigger LIS algorithm
    // We'll create specific shuffle patterns that force complex LIS calculations
    const smallListComplexShuffle = [
        ...smallList.slice(smallList.length / 2),
        ...smallList.slice(0, smallList.length / 2),
    ]
  
    const mediumListComplexShuffle = [
        ...mediumList.slice(mediumList.length / 3 * 2),
        ...mediumList.slice(0, mediumList.length / 3),
        ...mediumList.slice(mediumList.length / 3, mediumList.length / 3 * 2),
    ]
  
    const largeListComplexShuffle = [
        ...largeList.slice(largeList.length / 4 * 3),
        ...largeList.slice(largeList.length / 4, largeList.length / 4 * 2),
        ...largeList.slice(0, largeList.length / 4),
        ...largeList.slice(largeList.length / 4 * 2, largeList.length / 4 * 3),
    ]
  
    // Test LIS-triggering operations
    benchmark
        .startGroup('Complex List Reordering')
        .add('Complex reordering - small list (50 items)', smallList, smallListComplexShuffle)
        .add('Complex reordering - medium list (200 items)', mediumList, mediumListComplexShuffle)
        .add('Complex reordering - large list (500 items)', largeList, largeListComplexShuffle)
  
    return benchmark.run()
}

/**
 * Main function to run all optimization benchmarks
 */
async function main() {
    // Parse command line arguments
    const args = Bun.argv.slice(2)
  
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Mithril Optimizations Benchmark Tool')
        console.log('=================================')
        console.log('Usage:')
        console.log('  bun benchmark/optimizations-benchmark.ts [options]')
        console.log('\nOptions:')
        console.log('  --next-sibling    Test getNextSibling optimization')
        console.log('  --move-dom        Test moveDOM optimization')
        console.log('  --remove-nodes    Test removeNodes optimization')
        console.log('  --lis             Test LIS algorithm optimization')
        console.log('  --all             Run all optimization benchmarks (default)')
        console.log('  --help, -h        Show this help message')
        Bun.exit(0)
    }
  
    console.log('Mithril Optimizations Benchmark')
    console.log('==============================')
  
    if (args.includes('--next-sibling')) {
        await benchmarkGetNextSibling()
    } else if (args.includes('--move-dom')) {
        await benchmarkMoveDOM()
    } else if (args.includes('--remove-nodes')) {
        await benchmarkRemoveNodes()
    } else if (args.includes('--lis')) {
        await benchmarkLISOptimization()
    } else {
    // Default: run all optimization benchmarks
        console.log('Running all optimization benchmarks...')
        await benchmarkGetNextSibling()
        await benchmarkMoveDOM()
        await benchmarkRemoveNodes()
        await benchmarkLISOptimization()
    }
}

// Run the benchmarks
if (import.meta.url === Bun.main) {
    main()
}

export {OptimizationsBenchmark} 
