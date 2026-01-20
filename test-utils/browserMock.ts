import pushStateMock from "./pushStateMock.js"
import domMock from "./domMock.js"
import xhrMock from "./xhrMock.js"

interface BrowserMockOptions {
	window?: any
}

export default function browserMock(env?: BrowserMockOptions) {
	env = env || {}
	const $window: any = env.window = {}

	const dom = domMock()
	const xhr = xhrMock()
	for (const key in dom) {
		if (!$window[key]) $window[key] = (dom as any)[key]
	}
	for (const key in xhr) {
		if (!$window[key]) $window[key] = (xhr as any)[key]
	}
	pushStateMock({window: $window})

	return $window
}
