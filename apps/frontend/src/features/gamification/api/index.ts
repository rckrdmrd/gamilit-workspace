/**
 * Gamification API - Centralized Re-exports
 *
 * NOTE: La funcionalidad original de gamificationAPI.ts fue migrada y
 * distribuida en múltiples ubicaciones según la nueva arquitectura:
 *
 * - gamificationApi (consolidado): @/lib/api/gamification.api.ts
 * - ranksAPI: @/features/gamification/ranks/api/ranksAPI.ts
 * - achievementsAPI: @/features/gamification/social/api/achievementsAPI.ts
 * - economyAPI: @/features/gamification/economy/api/economyAPI.ts
 * - comodinesAPI: @/features/gamification/economy/api/comodinesAPI.ts
 * - shopAPI: @/features/gamification/economy/api/shopAPI.ts
 *
 * Este archivo provee re-exports para compatibilidad con imports existentes.
 *
 * @migration TASK-2026-01-18-003 - Análisis Comparativo Gamilit
 */

// Re-export desde lib/api (API consolidada principal)
export { gamificationApi } from '@/lib/api/gamification.api';
export type { UserGamificationSummary } from '@/lib/api/gamification.api';

// Re-export APIs específicas por dominio
export * from '../ranks/api/ranksAPI';
export * from '../social/api/achievementsAPI';
export * from '../economy/api/economyAPI';
export * from '../economy/api/comodinesAPI';
export * from '../economy/api/shopAPI';
export * from '../economy/api/inventoryAPI';
