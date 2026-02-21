/**
 * Audit Log Enums
 *
 * Extracted from audit-log.entity.ts to avoid architecture violations
 * (DTOs should not import from entity files).
 */

export enum ActorType {
  USER = 'user',
  SYSTEM = 'system',
  API = 'api',
  CRON = 'cron',
}

export enum Severity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum Status {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
}
