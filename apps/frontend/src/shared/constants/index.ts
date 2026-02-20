/**
 * Constants Barrel Export
 *
 * Centralized export for all application constants.
 */

// Color palette
export * from './colors';

// Responsive breakpoints
export * from './breakpoints';

// API Endpoints (SSOT) - DEPRECATED: Use @/config/api.config instead
// export * from './api-endpoints';

// ENUMs (SSOT - Shared with Backend)
export * from './enums.constants';

// Exercise Feedback Messages
export * from './exerciseFeedback.constants';

// React Query cache constants
export { STALE_TIMES } from './queryKeys';
