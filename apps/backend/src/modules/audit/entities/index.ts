/**
 * Audit Entities - Barrel Export
 *
 * @description Exporta todas las entities del módulo de auditoría.
 * @usage import { AuditLog, UserActivityLog, PendingUserInitialization } from '@/modules/audit/entities';
 */

export * from './audit-log.entity';
export * from './user-activity-log.entity'; // ✨ NUEVO - 2026-01-14 (Analytics de actividad)
export * from './pending-user-initialization.entity'; // ✨ NUEVO - 2026-01-14 (Control de inicialización)
