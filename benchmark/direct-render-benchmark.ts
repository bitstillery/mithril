#!/usr/bin/env bun
/**
 * Direct Render Benchmark using JSDOM
 * 
 * This benchmark measures render function performance using JSDOM for DOM operations.
 */

import {bench, run, group} from 'mitata'
import {JSDOM} from 'jsdom'

import renderFn from '../render/render'
import m from '../render/hyperscript'

/**
 * Run direct render benchmark using JSDOM
 */
export async function runDirectRenderBenchmark() {
    // Setup JSDOM environment
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    const window = dom.window
    const document = window.document
    const render = renderFn(window)
    
    // Create a root element for rendering
    const root = document.createElement('div')
    document.body.appendChild(root)
    
    // Generate test data
    const simpleVnode = m('div', {id: 'test'}, 'Hello World')
    const complexVnode = m('div', {id: 'parent'}, [
        m('h1', 'Title'),
        m('p', 'Paragraph 1'),
        m('p', 'Paragraph 2'),
        m('ul', [
            m('li', 'Item 1'),
            m('li', 'Item 2'),
            m('li', 'Item 3'),
        ]),
    ])
    
    // Helper to generate lists of nodes
    const generateList = (count: number) => Array.from(
        {length: count}, 
        (_, i) => m('div', {key: `item-${i}`}, `Item ${i}`),
    )
    
    // Create test lists
    const list10 = generateList(10)
    const list50 = generateList(50)
    const list100 = generateList(100)
    const list10Shuffled = [...list10].reverse()
    
    // Define benchmarks
    console.log('Mithril Direct Render Benchmark')
    console.log('==============================')
    
    // Test DOM element creation
    group('Create DOM Elements', () => {
        bench('Simple node', () => {
            render(root, simpleVnode)
            return root.outerHTML.length
        })
        
        bench('Complex node', () => {
            render(root, complexVnode)
            return root.outerHTML.length
        })
        
        bench('List of 10 nodes', () => {
            render(root, list10)
            return root.outerHTML.length
        })
        
        bench('List of 50 nodes', () => {
            render(root, list50)
            return root.outerHTML.length
        })
        
        bench('List of 100 nodes', () => {
            render(root, list100)
            return root.outerHTML.length
        })
    })
    
    // Test DOM element updates
    group('Update DOM Elements', () => {
        bench('Re-render identical simple node', () => {
            render(root, simpleVnode)
            render(root, simpleVnode)
            return root.outerHTML.length
        })
        
        bench('Re-render identical complex node', () => {
            render(root, complexVnode)
            render(root, complexVnode)
            return root.outerHTML.length
        })
        
        bench('Update list order (10 items)', () => {
            render(root, list10)
            render(root, list10Shuffled)
            return root.outerHTML.length
        })
        
        bench('Create then remove list (10 items)', () => {
            render(root, list10)
            render(root, [])
            return root.outerHTML.length
        })
        
        bench('Create then replace with different list (10→50)', () => {
            render(root, list10)
            render(root, list50)
            return root.outerHTML.length
        })
    })
    
    // Run the benchmark
    return run({
        avg: true,
        json: false,
        colors: true,
        min_max: true,
        median: true,
        percentiles: true,
    })
}

// If run directly, execute the benchmark immediately
if (import.meta.main) {
    console.log('Starting direct benchmark...')
    // Execute the benchmark directly
    const benchmarkPromise = run({
        avg: true,
        json: false,
        colors: true,
        min_max: true,
        median: true,
        percentiles: true,
    })
    
    // Handle the promise result
    benchmarkPromise.then(result => {
        console.log('Benchmark complete')
    }).catch(error => {
        console.error('Error in benchmark:', error)
    })
} 
