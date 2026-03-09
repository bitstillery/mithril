// @ts-nocheck
/**
 * Shared localStorage and sessionStorage mocks for tests.
 * Used by test preload (ensures window exists before any test) and Store tests.
 */
export const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
    }
})()

export const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
    }
})()

export function setupWindowMock(): void {
    if (typeof globalThis === 'undefined') return
    if (typeof (globalThis as any).window !== 'undefined') return

    ;(globalThis as any).window = {
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
        setInterval: (_fn: () => void, _delay: number) => 1,
        clearInterval: () => {},
    }
}
