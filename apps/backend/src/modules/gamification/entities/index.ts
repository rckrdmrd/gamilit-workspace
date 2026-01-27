/**
 * Gamification Entities - Barrel Export
 *
 * @description Exporta todas las entities del módulo de gamificación.
 * @usage import { UserStats, UserRank, Achievement } from '@/modules/gamification/entities';
 */

export * from './user-stats.entity';
export * from './user-rank.entity';
export * from './achievement.entity';
export * from './ml-coins-transaction.entity';
export * from './mission.entity';
export * from './classroom-mission.entity';
export * from './comodines-inventory.entity';
export * from './user-achievement.entity';
export * from './achievement-category.entity';
// Notification entity moved to @/modules/notifications/entities/notification.entity
export * from './leaderboard-metadata.entity';
export * from './active-boost.entity';
export * from './inventory-transaction.entity';
export * from './maya-rank.entity';
export * from './comodin-usage-log.entity';
export * from './shop-category.entity';
export * from './shop-item.entity';
export * from './user-purchase.entity';
export * from './mission-template.entity';
export * from './comodin-usage-tracking.entity'; // ✨ NUEVO - TASK-2026-01-27 (Coherencia DDL)
