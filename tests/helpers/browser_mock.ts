import pushStateMock from './push_state_mock'
import domMock from './dom_mock'

import type {PushStateWindow} from './push_state_mock'
import type {MockWindow} from './dom_mock'

interface BrowserMockOptions {
    /** Receives the window the mock builds. */
    window?: object
}

export type BrowserMockWindow = MockWindow & PushStateWindow

export default function browserMock(env?: BrowserMockOptions): BrowserMockWindow {
    env = env || {}
    const $window: any = (env.window = {})

    const dom = domMock()
    for (const key in dom) {
        if (!$window[key]) $window[key] = (dom as any)[key]
    }
    pushStateMock({window: $window})

    return $window as BrowserMockWindow
}
