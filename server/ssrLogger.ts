/**
 * SSR-specific logger instance.
 * SSR infrastructure code should import {logger} from this file
 * to get a logger instance with [ssr] prefix.
 */

import {Logger} from './logger'

// Create SSR logger instance with [ssr] prefix
const logger = new Logger()
logger.setPrefix('[ssr]')

export {logger}
