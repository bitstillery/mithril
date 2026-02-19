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
        debug: colorize('debug', colors.bright + colors.blue),
        warn: colorize('warn', colors.bright + colors.yellow),
        error: colorize('error', colors.bright + colors.red),
    }
    return levelMap[level]
}

export interface LogContext {
    pathname?: string
    method?: string
    sessionId?: string
    route?: string
    module?: string // Module name (e.g., 'identity', 'order') - will be shown as [module] prefix
    [key: string]: any
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

        // Always use the set prefix (e.g., [app] or [ssr])
        const prefixStr = colorize(
            this.prefix,
            this.prefix === '[ssr]' ? colors.bright + colors.magenta : colors.bright + colors.cyan,
        )

        // Include module in message if provided
        let displayMessage = message
        if (context?.module) {
            displayMessage = `[${context.module}] ${message}`
        }

        let contextStr = ''
        if (context) {
            const contextParts: string[] = []
            if (context.method) {
                contextParts.push(colorize(context.method, colors.cyan))
            }
            if (context.pathname) {
                contextParts.push(colorize(context.pathname, colors.green))
            }
            if (context.route) {
                contextParts.push(colorize(`route:${context.route}`, colors.blue))
            }
            if (context.sessionId) {
                contextParts.push(colorize(`session:${context.sessionId.slice(0, 8)}...`, colors.dim + colors.white))
            }

            // Add any additional context fields (excluding module which is shown in message)
            for (const [key, value] of Object.entries(context)) {
                if (!['method', 'pathname', 'route', 'sessionId', 'module'].includes(key)) {
                    contextParts.push(colorize(`${key}:${value}`, colors.dim + colors.white))
                }
            }

            if (contextParts.length > 0) {
                contextStr = ' ' + contextParts.join(' ')
            }
        }

        return `${timestamp} ${prefixStr} ${levelStr}${contextStr} ${displayMessage}`
    }

    private formatContextForBrowser(context?: LogContext): string[] {
        if (!context) return []
        const parts: string[] = []
        if (context.method) parts.push(`Method: ${context.method}`)
        if (context.pathname) parts.push(`Path: ${context.pathname}`)
        if (context.route) parts.push(`Route: ${context.route}`)
        if (context.sessionId) parts.push(`Session: ${context.sessionId.slice(0, 8)}...`)
        for (const [key, value] of Object.entries(context)) {
            if (!['method', 'pathname', 'route', 'sessionId', 'module'].includes(key)) {
                parts.push(`${key}: ${value}`)
            }
        }
        return parts
    }

    private logBrowser(
        level: 'info' | 'debug' | 'warn' | 'error',
        message: string,
        context?: LogContext,
        error?: Error | unknown,
    ): void {
        const displayMessage = context?.module ? `[${context.module}] ${message}` : message
        const prefixStyle = this.prefix === '[ssr]' ? 'color: #d946ef; font-weight: bold' : 'color: #3b82f6; font-weight: bold'
        const levelStyles: Record<string, string> = {
            info: 'color: #22d3ee; font-weight: bold',
            debug: 'color: #4ade80; font-weight: bold',
            warn: 'color: #fbbf24; font-weight: bold',
            error: 'color: #ef4444; font-weight: bold',
        }
        const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
        const contextParts = this.formatContextForBrowser(context)
        if (contextParts.length > 0 || error) {
            console.group(`%c${this.prefix}%c ${level}%c ${displayMessage}`, prefixStyle, levelStyles[level], 'color: inherit')
            contextParts.forEach((part) => logFn(`  ${part}`))
            if (error instanceof Error && error.stack) {
                console.error('Stack trace:', error.stack)
            }
            console.groupEnd()
        } else {
            logFn(`%c${this.prefix}%c ${level}%c ${displayMessage}`, prefixStyle, levelStyles[level], 'color: inherit')
        }
    }

    info(message: string, context?: LogContext): void {
        if (isBrowser) {
            this.logBrowser('info', message, context)
        } else {
            console.log(this.formatMessage('info', message, context))
        }
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
