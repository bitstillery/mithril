/**
 * Isomorphic logger with colors and structured logging.
 * Works in both server (Bun/Node) and client (browser) environments.
 * Provides info, debug, warning, and error log levels with appropriate formatting.
 */

// Detect if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

// ANSI color codes for terminal output (server only)
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
}

// ANSI colors for server/terminal. In browser we use %c for proper DevTools styling.
const enableColors =
    !isBrowser &&
    (typeof process === 'undefined' || !process?.env || (process.env.NO_COLOR !== '1' && process.env.NO_COLOR !== 'true'))

function colorize(text: string, color: string): string {
    return enableColors ? `${color}${text}${colors.reset}` : text
}

function getTimestamp(): string {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const ms = String(now.getMilliseconds()).padStart(3, '0')
    return `${hours}:${minutes}:${seconds}.${ms}`
}

function formatLevel(level: 'info' | 'debug' | 'warn' | 'error'): string {
    const levelMap = {
        info: colorize('info', colors.bright + colors.cyan),
        debug: colorize('debug', colors.dim + colors.blue),
        warn: colorize('warn', colors.bright + colors.yellow),
        error: colorize('error', colors.bright + colors.red),
    }
    return levelMap[level]
}

function formatPrefixForServer(prefix: string): string {
    if (prefix === '[ssr]') {
        return colorize(prefix, colors.bright + colors.magenta)
    }
    return colorize(prefix, colors.dim + colors.cyan)
}

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

/** UTF-8 byte length of a string (for SSR response size). */
export function utf8ByteLength(s: string): number {
    return textEncoder ? textEncoder.encode(s).length : s.length
}

export interface SsrPageSummaryFields {
    bytesHtml: number
    bytesState: number
    method: string
    msTotal: number
    pathname: string
}

/**
 * One-line SSR summary for the terminal: dim labels, bright path, yellow numbers.
 * Use with {@link Logger.infoRaw} so the body is not flattened into dim context.
 */
export function formatSsrPageSummaryLine(fields: SsrPageSummaryFields): string {
    const d = (s: string) => colorize(s, colors.dim + colors.white)
    const n = (v: number) => colorize(String(Math.round(v * 100) / 100), colors.bright + colors.yellow)
    const path = colorize(fields.pathname, colors.green)
    const method = colorize(fields.method, colors.cyan)
    return `${d('page')} ${method} ${path} ${d('ms')} ${n(fields.msTotal)} ${d('body')} ${n(fields.bytesHtml)}${d('B')} ${d('state')} ${n(fields.bytesState)}${d('B')}`
}

export interface LogContext {
    pathname?: string
    method?: string
    sessionId?: string
    route?: string
    module?: string // Module name (e.g., 'identity', 'order') - will be shown as [module] prefix
    [key: string]: any
}

const RESERVED_CONTEXT_KEYS = new Set(['method', 'pathname', 'route', 'sessionId', 'module'])

/** Serialize non-primitive context for terminal logs (avoids [object Object]). */
function formatContextValueForServer(value: unknown): string {
    if (value === undefined) return 'undefined'
    if (value === null) return 'null'
    const t = typeof value
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint') return String(value)
    if (value instanceof Error) return value.stack ?? value.message
    try {
        return JSON.stringify(value)
    } catch {
        return String(value)
    }
}

class Logger {
    // Default prefix: [ssr] for server infrastructure, [app] for application code
    private prefix: string = '[ssr]'

    /**
     * Set the log prefix (default: '[ssr]' for infrastructure, '[app]' for application code)
     */
    setPrefix(prefix: string): void {
        this.prefix = prefix
    }

    private formatMessage(level: 'info' | 'debug' | 'warn' | 'error', message: string, context?: LogContext): string {
        const timestamp = colorize(getTimestamp(), colors.dim + colors.white)
        const levelStr = formatLevel(level)

        const prefixStr = formatPrefixForServer(this.prefix)
        const isDebug = level === 'debug'

        // Include module in message if provided
        let displayMessage = message
        if (context?.module) {
            displayMessage = `[${context.module}] ${message}`
        }
        if (isDebug) {
            displayMessage = colorize(displayMessage, colors.dim + colors.white)
        }

        let contextStr = ''
        if (context) {
            const contextParts: string[] = []
            const methodColor = isDebug ? colors.dim + colors.cyan : colors.cyan
            const pathColor = isDebug ? colors.dim + colors.green : colors.green
            const routeColor = isDebug ? colors.dim + colors.blue : colors.blue
            const extraColor = isDebug ? colors.dim + colors.blue : colors.dim + colors.white
            if (context.method) {
                contextParts.push(colorize(context.method, methodColor))
            }
            if (context.pathname) {
                contextParts.push(colorize(context.pathname, pathColor))
            }
            if (context.route) {
                contextParts.push(colorize(`route:${context.route}`, routeColor))
            }
            if (context.sessionId) {
                contextParts.push(colorize(`session:${context.sessionId.slice(0, 8)}...`, extraColor))
            }

            // Add any additional context fields (excluding module which is shown in message)
            for (const [key, value] of Object.entries(context)) {
                if (!RESERVED_CONTEXT_KEYS.has(key)) {
                    contextParts.push(colorize(`${key}:${formatContextValueForServer(value)}`, extraColor))
                }
            }

            if (contextParts.length > 0) {
                contextStr = ' ' + contextParts.join(' ')
            }
        }

        return `${timestamp} ${prefixStr} ${levelStr}${contextStr} ${displayMessage}`
    }

    /**
     * Emit context in DevTools-friendly form: objects/arrays are passed as separate arguments so
     * they stay expandable instead of becoming "[object Object]" strings.
     */
    private logBrowserContext(logFn: typeof console.log, context: LogContext): void {
        if (context.method != null) logFn('  method:', context.method)
        if (context.pathname != null) logFn('  pathname:', context.pathname)
        if (context.route != null) logFn('  route:', context.route)
        if (context.sessionId != null) logFn('  sessionId:', `${context.sessionId.slice(0, 8)}...`)

        for (const [key, value] of Object.entries(context)) {
            if (RESERVED_CONTEXT_KEYS.has(key)) continue
            const label = `  ${key}:`
            if (value !== null && typeof value === 'object') {
                logFn(label, value)
            } else {
                logFn(label, value as string | number | boolean | undefined)
            }
        }
    }

    private logBrowser(
        level: 'info' | 'debug' | 'warn' | 'error',
        message: string,
        context?: LogContext,
        error?: Error | unknown,
    ): void {
        const displayMessage = context?.module ? `[${context.module}] ${message}` : message
        const prefixStyle = this.prefix === '[ssr]' ? 'color: #d946ef; font-weight: bold' : 'color: #64748b; font-weight: normal'
        const levelStyles: Record<string, string> = {
            info: 'color: #22d3ee; font-weight: bold',
            debug: 'color: #64748b; font-weight: normal',
            warn: 'color: #fbbf24; font-weight: bold',
            error: 'color: #ef4444; font-weight: bold',
        }
        const bodyStyle = level === 'debug' ? 'color: #94a3b8; font-weight: normal' : 'color: inherit'
        const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
        const hasContext = context != null && Object.keys(context).length > 0
        if (hasContext || error) {
            console.group(`%c${this.prefix}%c ${level}%c ${displayMessage}`, prefixStyle, levelStyles[level], bodyStyle)
            if (context && hasContext) {
                this.logBrowserContext(logFn, context)
            }
            if (error instanceof Error && error.stack) {
                console.error('Stack trace:', error.stack)
            }
            console.groupEnd()
        } else {
            logFn(`%c${this.prefix}%c ${level}%c ${displayMessage}`, prefixStyle, levelStyles[level], bodyStyle)
        }
    }

    info(message: string, context?: LogContext): void {
        if (isBrowser) {
            this.logBrowser('info', message, context)
        } else {
            console.log(this.formatMessage('info', message, context))
        }
    }

    /**
     * Server only: log one info line whose body may already contain ANSI (e.g. {@link formatSsrPageSummaryLine}).
     */
    infoRaw(messageBody: string): void {
        if (isBrowser) {
            console.log(`${this.prefix} info ${messageBody}`)
            return
        }
        const timestamp = colorize(getTimestamp(), colors.dim + colors.white)
        const levelStr = formatLevel('info')
        const prefixStr = formatPrefixForServer(this.prefix)
        console.log(`${timestamp} ${prefixStr} ${levelStr} ${messageBody}`)
    }

    debug(message: string, context?: LogContext): void {
        const shouldLog =
            globalThis.__SSR_MODE__ || (isBrowser && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production')
        if (!shouldLog) return

        if (isBrowser) {
            this.logBrowser('debug', message, context)
        } else {
            console.log(this.formatMessage('debug', message, context))
        }
    }

    warn(message: string, context?: LogContext): void {
        if (isBrowser) {
            this.logBrowser('warn', message, context)
        } else {
            console.warn(this.formatMessage('warn', message, context))
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const baseMessage = error ? `${message}: ${errorMessage}` : message

        if (isBrowser) {
            this.logBrowser('error', baseMessage, context, error)
        } else {
            console.error(this.formatMessage('error', baseMessage, context))
            if (error instanceof Error && error.stack) {
                const stackTrace = colorize(error.stack, colors.dim + colors.red)
                console.error(stackTrace)
            }
        }
    }
}

// Default logger instance for application code (will be set to [app] by app initialization)
export const logger = new Logger()

// Export Logger class for creating custom instances
export {Logger}
