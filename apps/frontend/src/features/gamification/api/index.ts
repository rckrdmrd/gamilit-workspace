/**
 * Gamification API - Centralized Re-exports
 *
 * NOTE: La funcionalidad original de gamificationAPI.ts fue migrada y
 * distribuida en múltiples ubicaciones según la nueva arquitectura:
 *
 * - gamificationApi (consolidado): @/services/api/gamification/gamificationAPI.ts
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

// Re-export desde services/api (API consolidada principal)
export { gamificationApi } from '@/services/api/gamification/gamificationAPI';
export type { UserGamificationSummary } from '@/services/api/gamification/gamificationAPI';

// Re-export APIs específicas por dominio
export * from '../ranks/api/ranksAPI';
// REC-008: achievementsAPI deprecated — use gamificationApi from @/services/api/gamification/gamificationAPI.ts
export * from '../economy/api/economyAPI';
export * from '../economy/api/comodinesAPI';
export {
  getShopCategories,
  getShopItems as getShopItemsLegacy,
  getShopItemById,
  purchaseShopItem,
  getUserPurchases,
  checkItemOwnership,
  getEffectivePrice,
  hasActiveDiscount,
  getDiscountPercentage,
} from '../economy/api/shopAPI';
export {
  getInventory as getPowerUpInventory,
  purchasePowerUp,
  applyPowerUp,
  getAvailablePowerUps,
} from '../economy/api/inventoryAPI';
