/**
 * SSR-specific logger instance.
 * SSR infrastructure code should import {logger} from this file
 * to get a logger instance with [SSR] prefix.
 */

import {Logger} from './logger'

// Create SSR logger instance with [SSR] prefix
const logger = new Logger()
logger.setPrefix('[SSR]')

export {logger}
