/**
 * Logger Utility
 *
 * Winston-based structured logging utility.
 * 12-Factor App compliant: logs to stdout only as JSON (Factor XI).
 * File transports removed — log aggregation handled by external systems (PM2, Docker, CloudWatch).
 */

import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

// Note: This creates a circular dependency during build.
// Environment variables are accessed directly via process.env as a workaround.
const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

/**
 * AsyncLocalStorage for correlation IDs (request tracing)
 */
export const correlationStorage = new AsyncLocalStorage<{ correlationId: string }>();

/**
 * JSON format for structured logging (production)
 * Includes: timestamp, level, message, service, version, environment, correlationId
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format((info) => {
    const store = correlationStorage.getStore();
    if (store?.correlationId) {
      info.correlationId = store.correlationId;
    }
    return info;
  })(),
  winston.format.json(),
);

/**
 * Human-readable format for development
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, correlationId }) => {
    const cid = correlationId ? ` [${correlationId}]` : '';
    return stack
      ? `${timestamp} ${level}${cid}: ${message}\n${stack}`
      : `${timestamp} ${level}${cid}: ${message}`;
  }),
);

/**
 * Winston Logger Instance
 *
 * Production: JSON to stdout only (12-Factor compliant)
 * Development: Human-readable colored output to stdout
 */
export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    service: 'gamilit-backend',
    version: process.env.APP_VERSION || '1.0.0',
    environment: nodeEnv,
  },
  transports: [
    new winston.transports.Console({
      format: nodeEnv === 'production' ? jsonFormat : devFormat,
    }),
  ],
});

/**
 * Helper logging functions
 */
export const log = {
  info: (message: string, ...meta: unknown[]) => logger.info(message, ...meta),
  warn: (message: string, ...meta: unknown[]) => logger.warn(message, ...meta),
  error: (message: string, error?: unknown) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack });
    } else {
      logger.error(message, error);
    }
  },
  debug: (message: string, ...meta: unknown[]) => logger.debug(message, ...meta),
};

export default logger;
