#!/usr/bin/env bun
/**
 * Mithril Benchmark Runner
 * 
 * A simple wrapper around the benchmark system that provides better UX 
 * for running benchmarks and visualizing results.
 */

import {runSimpleBenchmark, runVnodeOperationBenchmarks, runAlgorithmBenchmarks} from './index'

// ASCII art banner
const banner = `
==================================
    MITHRIL BENCHMARK SUITE
==================================
`

/**
 * Display a formatted header
 */
function displayHeader(title: string): void {
    const line = '='.repeat(title.length + 4)
    console.log(`\n${line}`)
    console.log(`  ${title}  `)
    console.log(`${line}\n`)
}

/**
 * Run the benchmarks with formatted output
 */
async function runWithFormatting(): Promise<void> {
    console.log(banner)
    
    try {
        // Simple benchmarks
        displayHeader('Running Simple Benchmarks')
        console.time('Simple benchmarks completed in')
        await runSimpleBenchmark()
        console.timeEnd('Simple benchmarks completed in')
        
        // Vnode benchmarks
        displayHeader('Running Vnode Creation Benchmarks')
        console.time('Vnode benchmarks completed in')
        await runVnodeOperationBenchmarks()
        console.timeEnd('Vnode benchmarks completed in')
        
        // Algorithm benchmarks
        displayHeader('Running Algorithm Benchmarks')
        console.time('Algorithm benchmarks completed in')
        await runAlgorithmBenchmarks()
        console.timeEnd('Algorithm benchmarks completed in')
        
        console.log('\n✅ All benchmarks completed successfully!\n')
    } catch (error) {
        console.error('\n❌ Error running benchmarks:', error)
        Bun.exit(1)
    }
}

// Run the benchmarks
runWithFormatting() 
