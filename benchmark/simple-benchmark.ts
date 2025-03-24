import {bench, run, group} from 'mitata'

console.log('Simple benchmark starting...')

// Set up the benchmark
const setupBenchmark = () => {
    // Simple benchmark to test if mitata is working
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
    })
}

// Main function
const main = async() => {
    console.log('Setting up benchmarks...')
    setupBenchmark()
    
    console.log('Running benchmarks...')
    try {
        const results = await run()
        console.log('Benchmarks complete!')
        console.log('Results:', results)
    } catch (error) {
        console.error('Error running benchmarks:', error)
    }
}

// Run the main function
main()
