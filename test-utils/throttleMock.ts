export interface ThrottleMock {
	schedule: (fn: () => void) => void
	fire: () => void
	queueLength: () => number
}

export default function throttleMock(): ThrottleMock {
	let queue: Array<() => void> = []
	return {
		schedule: function(fn: () => void) {
			queue.push(fn)
		},
		fire: function() {
			const tasks = queue
			queue = []
			tasks.forEach(function(fn) {fn()})
		},
		queueLength: function(){
			return queue.length
		}
	}
}
