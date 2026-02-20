/**
 * @deprecated Phase 4A migration: All API files moved to services/api/.
 * This barrel re-exports from new locations for backward compatibility.
 * Import directly from the new paths instead:
 *   - @/services/api/gamification/gamificationAPI
 *   - @/services/api/progress/progressAPI
 *   - @/services/api/branding/brandingAPI
 *   - @/services/api/admin/ltiAPI
 */
export { default as apiClient } from '@/services/api/apiClient';
export * from '@/services/api/gamification/gamificationAPI';
export * from '@/services/api/progress/progressAPI';
export * from '@/services/api/branding/brandingAPI';
export * from '@/services/api/admin/ltiAPI';
