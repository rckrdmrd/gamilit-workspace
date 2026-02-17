/**
 * Economy API - Centralized exports
 *
 * Re-exports all economy-related API functions for easy imports
 */

export * from './economyAPI';
export * from './comodinesAPI';
export {
  getInventory as getPowerUpInventory,
  purchasePowerUp,
  applyPowerUp,
  getAvailablePowerUps,
} from './inventoryAPI';
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
} from './shopAPI';
