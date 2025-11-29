/**
 * Admin Entities - Barrel Export
 *
 * @description Exportación centralizada de entidades del módulo Admin
 * @module admin/entities
 *
 * Entidades incluidas:
 * - SystemSetting: Configuración global de la plataforma
 * - FeatureFlag: Feature flags para activación gradual de funcionalidades
 * - NotificationSettings: Configuración de notificaciones por usuario
 * - BulkOperation: Registro de operaciones bulk/masivas (EXT-002)
 * - AdminReport: Reportes generados por administradores (EXT-002)
 * - SystemAlert: Alertas del sistema para monitoreo
 * - AuditLog: Re-export de audit module para queries de auditoría
 */

export { SystemSetting } from './system-setting.entity';
export { FeatureFlag } from './feature-flag.entity';
export { NotificationSettings } from './notification-settings.entity';
export { BulkOperation } from './bulk-operation.entity';
export { AdminReport } from './admin-report.entity';
export { SystemAlert } from './system-alert.entity';

// Re-export AuditLog from audit module
// Permite queries de auditoría directamente desde admin sin duplicar entity
export { AuditLog, ActorType, Severity, Status } from '../../audit/entities/audit-log.entity';
