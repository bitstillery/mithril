/* eslint-disable */
export interface Stream<T = any> {
	(): T
	(value: T): T
	map<U>(fn: (value: T) => U): Stream<U>
	end: Stream<boolean>
	toJSON(): T
	_changing(): void
	_map<U>(fn: (value: T) => U, ignoreInitial: boolean): Stream<U>
	_unregisterChild(child: Stream<any>): void
	_state: "pending" | "active" | "changing" | "ended"
	_parents: Stream<any>[]
	constructor: typeof Stream
	"fantasy-land/map": <U>(fn: (value: T) => U) => Stream<U>
	"fantasy-land/ap": <U>(x: Stream<(value: T) => U>) => Stream<U>
}

interface StreamConstructor {
	<T = any>(value?: T): Stream<T>
	SKIP: {}
	HALT: {}
	lift: <T extends any[], R>(fn: (...args: T) => R, ...streams: Stream<T[number]>[]) => Stream<R[]>
	scan: <T, U>(fn: (acc: U, value: T) => U, acc: U, origin: Stream<T>) => Stream<U>
	merge: <T>(streams: Stream<T>[]) => Stream<T[]>
	combine: <T extends any[], R>(fn: (...args: [...T, T[]]) => R, streams: Stream<T[number]>[]) => Stream<R>
	scanMerge: <T, U>(tuples: Array<[Stream<T>, (acc: U, value: T) => U]>, seed: U) => Stream<U>
	"fantasy-land/of": <T>(value: T) => Stream<T>
}

function Stream<T = any>(this: any, value?: T): Stream<T> {
	const dependentStreams: Stream<any>[] = []
	const dependentFns: Array<(value: T) => any> = []

	function stream(v?: T): T {
		if (arguments.length && v !== Stream.SKIP) {
			value = v as T
			if (open(stream)) {
				stream._changing()
				stream._state = "active"
				// Cloning the list to ensure it's still iterated in intended
				// order
				dependentStreams.slice().forEach(function(s, i) {
					if (open(s)) s((dependentFns.slice() as any)[i](value))
				})
			}
		}

		return value!
	}

	stream.constructor = Stream
	stream._state = arguments.length && value !== Stream.SKIP ? "active" : "pending"
	stream._parents = []

	stream._changing = function() {
		if (open(stream)) stream._state = "changing"
		dependentStreams.forEach(function(s) {
			s._changing()
		})
	}

	stream._map = function<U>(fn: (value: T) => U, ignoreInitial: boolean): Stream<U> {
		const target = ignoreInitial ? Stream<U>() : Stream<U>(fn(value!))
		target._parents.push(stream)
		dependentStreams.push(target)
		dependentFns.push(fn as any)
		return target
	}

	stream.map = function<U>(fn: (value: T) => U): Stream<U> {
		return stream._map(fn, stream._state !== "active")
	}

	let end: Stream<boolean> | undefined
	function createEnd(): Stream<boolean> {
		end = Stream<boolean>()
		end.map(function(value: boolean) {
			if (value === true) {
				stream._parents.forEach(function (p) {p._unregisterChild(stream)})
				stream._state = "ended"
				stream._parents.length = dependentStreams.length = dependentFns.length = 0
			}
			return value
		})
		return end
	}

	stream.toJSON = function() { return value != null && typeof (value as any).toJSON === "function" ? (value as any).toJSON() : value }

	stream["fantasy-land/map"] = stream.map
	stream["fantasy-land/ap"] = function<U>(x: Stream<(value: T) => U>) { return combine(function(s1: Stream<(value: T) => U>, s2: Stream<T>) { return s1()(s2()) }, [x, stream]) }

	stream._unregisterChild = function(child: Stream<any>) {
		const childIndex = dependentStreams.indexOf(child)
		if (childIndex !== -1) {
			dependentStreams.splice(childIndex, 1)
			dependentFns.splice(childIndex, 1)
		}
	}

	Object.defineProperty(stream, "end", {
		get: function() { return end || createEnd() }
	})

	return stream as Stream<T>
}

function combine<T extends any[], R>(fn: (...args: [...T, T[]]) => R, streams: Stream<T[number]>[]): Stream<R> {
	let ready = streams.every(function(s) {
		if (s.constructor !== Stream)
			throw new Error("Ensure that each item passed to stream.combine/stream.merge/lift is a stream.")
		return s._state === "active"
	})
	const stream = ready
		? Stream<R>(fn.apply(null, streams.concat([streams]) as any))
		: Stream<R>()

	const changed: Stream<T[number]>[] = []

	const mappers = streams.map(function(s) {
		return s._map(function(value: T[number]) {
			changed.push(s)
			if (ready || streams.every(function(s) { return s._state !== "pending" })) {
				ready = true
				stream(fn.apply(null, streams.concat([changed]) as any))
				changed.length = 0
			}
			return value
		}, true)
	})

	const endStream = stream.end.map(function(value: boolean) {
		if (value === true) {
			mappers.forEach(function(mapper) { mapper.end(true) })
			endStream.end(true)
		}
		return undefined
	})

	return stream
}

function merge<T>(streams: Stream<T>[]): Stream<T[]> {
	return combine(function() { return streams.map(function(s) { return s() }) }, streams)
}

function scan<T, U>(fn: (acc: U, value: T) => U, acc: U, origin: Stream<T>): Stream<U> {
	const stream = origin.map(function(v: T) {
		const next = fn(acc, v)
		if (next !== Stream.SKIP) acc = next
		return next
	})
	stream(acc)
	return stream
}

function scanMerge<T, U>(tuples: Array<[Stream<T>, (acc: U, value: T) => U]>, seed: U): Stream<U> {
	const streams = tuples.map(function(tuple) { return tuple[0] })

	const stream = combine(function() {
		const changed = arguments[arguments.length - 1] as Stream<T>[]
		streams.forEach(function(stream, i) {
			if (changed.indexOf(stream) > -1)
				seed = tuples[i][1](seed, stream())
		})

		return seed
	}, streams)

	stream(seed)

	return stream
}

function lift<T extends any[], R>(fn: (...args: T) => R, ...streams: Stream<T[number]>[]): Stream<R[]> {
	return merge(streams).map(function(streams: T[number][]) {
		return fn.apply(undefined, streams as any)
	})
}

function open(s: Stream<any>): boolean {
	return s._state === "pending" || s._state === "active" || s._state === "changing"
}

(Stream as any).SKIP = {}
(Stream as any).lift = lift
(Stream as any).scan = scan
(Stream as any).merge = merge
(Stream as any).combine = combine
(Stream as any).scanMerge = scanMerge
(Stream as any)["fantasy-land/of"] = Stream

let warnedHalt = false
Object.defineProperty(Stream, "HALT", {
	get: function() {
		if (!warnedHalt) console.log("HALT is deprecated and has been renamed to SKIP");
		warnedHalt = true
		return Stream.SKIP
	}
})

export default Stream as StreamConstructor & typeof Stream
