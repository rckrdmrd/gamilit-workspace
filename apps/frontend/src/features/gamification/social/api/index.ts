/**
 * Social API - Barrel Exports
 *
 * REC-008: achievementsAPI is deprecated. Use gamificationApi from
 * @/lib/api/gamification.api.ts for all achievement operations.
 * achievementsAPI re-export removed to prevent new consumers.
 */
export * from './inventory.api';
export { default as socialAPI } from './socialAPI';
