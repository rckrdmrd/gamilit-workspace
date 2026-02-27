import { NotFoundError, BusinessRuleError, ValidationError, ForbiddenError, ConflictError } from '@shared/exceptions';

export class ShopItemNotFoundError extends NotFoundError {
  constructor(itemId?: string) {
    super('Item', itemId);
  }
}

export class UserStatsNotFoundError extends NotFoundError {
  constructor(userId?: string) {
    super('User stats', userId);
  }
}

export class ItemNotAvailableError extends BusinessRuleError {
  constructor(itemName: string) {
    super(`Item ${itemName} is not available for purchase`, 'ITEM_NOT_AVAILABLE');
  }
}

export class InsufficientStockError extends BusinessRuleError {
  constructor(available: number, requested: number) {
    super(`Insufficient stock. Available: ${available}, Requested: ${requested}`, 'INSUFFICIENT_STOCK');
  }
}

export class MaxPurchasesReachedError extends BusinessRuleError {
  constructor(limit: number) {
    super(`Maximum purchases per user reached (${limit})`, 'MAX_PURCHASES_REACHED');
  }
}

export class InsufficientCoinsError extends BusinessRuleError {
  constructor(required: number, available: number) {
    super(`Insufficient ML Coins. Required: ${required}, Available: ${available}`, 'INSUFFICIENT_COINS');
  }
}

export class InsufficientRankError extends BusinessRuleError {
  constructor(required: string, current: string) {
    super(`Required rank: ${required} (or higher). Current rank: ${current}`, 'INSUFFICIENT_RANK');
  }
}

export class InsufficientLevelError extends BusinessRuleError {
  constructor(required: number, current: number) {
    super(`Required level: ${required}. Current level: ${current}`, 'INSUFFICIENT_LEVEL');
  }
}

export class RequiredAchievementMissingError extends BusinessRuleError {
  constructor(achievementId: string) {
    super(`Required achievement not unlocked: ${achievementId}`, 'REQUIRED_ACHIEVEMENT_MISSING');
  }
}

export class InvalidQuantityError extends ValidationError {
  constructor() {
    super('Quantity must be greater than 0', 'INVALID_QUANTITY');
  }
}

export class ItemNotFoundError extends NotFoundError {
  constructor(itemId?: string) {
    super('Item', itemId);
  }
}

export class ConsumableItemEquipError extends ValidationError {
  constructor() {
    super('Cannot equip consumable items. Use them from inventory.', 'CONSUMABLE_ITEM_EQUIP');
  }
}

export class ItemNotOwnedError extends ForbiddenError {
  constructor() {
    super('You do not own this item', 'ITEM_NOT_OWNED');
  }
}

export class ItemNotEquippedError extends NotFoundError {
  constructor() {
    super('Item not currently equipped');
  }
}

export class ProfileNotFoundError extends NotFoundError {
  constructor(userId?: string) {
    super('Profile', userId);
  }
}

export class UserStatsAlreadyExistsError extends ConflictError {
  constructor(userId: string) {
    super(`User ${userId} already has stats`, 'USER_STATS_ALREADY_EXISTS');
  }
}

export class NonNumericFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field ${field} is not numeric`, 'NON_NUMERIC_FIELD');
  }
}
