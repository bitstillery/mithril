// @ts-nocheck
import pushStateMock from './pushStateMock'
import domMock from './domMock'

interface BrowserMockOptions {
    window?: any
}

export default function browserMock(env?: BrowserMockOptions) {
    env = env || {}
    const $window: any = (env.window = {})

    const dom = domMock()
    for (const key in dom) {
        if (!$window[key]) $window[key] = (dom as any)[key]
    }
    pushStateMock({window: $window})

    return $window
}
