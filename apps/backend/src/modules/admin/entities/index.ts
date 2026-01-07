/**
 * Admin Entities - Barrel Export
 *
 * @description Exportacion centralizada de entidades del modulo Admin
 * @module admin/entities
 *
 * Entidades incluidas:
 * - SystemSetting: Configuracion global de la plataforma
 * - FeatureFlag: Feature flags para activacion gradual de funcionalidades
 * - NotificationSettings: Configuracion de notificaciones por usuario
 * - NotificationSettingsGlobal: Configuracion GLOBAL de notificaciones del sistema (AUDIT-003)
 * - BulkOperation: Registro de operaciones bulk/masivas (EXT-002)
 * - AdminReport: Reportes generados por administradores (EXT-002)
 * - SystemAlert: Alertas del sistema para monitoreo
 * - RateLimit: Configuracion de rate limiting para endpoints/operaciones (AUDIT-003)
 * - AuditLog: Re-export de audit module para queries de auditoria
 */

export { SystemSetting } from './system-setting.entity';
export { FeatureFlag } from './feature-flag.entity';
export { NotificationSettings } from './notification-settings.entity';
export { NotificationSettingsGlobal, NotificationChannel, NotificationPriority } from './notification-settings-global.entity'; // AUDIT-003
export { BulkOperation } from './bulk-operation.entity';
export { AdminReport } from './admin-report.entity';
export { SystemAlert } from './system-alert.entity';
export { RateLimit, RateLimitScope, RateLimitResourceType } from './rate-limit.entity'; // AUDIT-003

export { GamificationParameter, ParameterValueType, ParameterScope } from './gamification-parameter.entity'; // P1-002 (Parametros de gamificacion)

// Audit Logging Entities - AUDIT-003
export { PerformanceMetric, MetricType } from './performance-metric.entity';
export { SystemLog, LogLevel, Environment } from './system-log.entity';
export { ActivityLog, UserActivity } from './activity-log.entity'; // UserActivity es alias deprecated de ActivityLog

// Config Avanzada Entities - AUDIT-003
export { ApiConfiguration, ApiServiceType } from './api-configuration.entity';
export { EnvironmentConfig, ConfigEnvironment } from './environment-config.entity';
export { TenantConfiguration, TenantConfigType } from './tenant-configuration.entity';

// Re-export AuditLog from audit module
// Permite queries de auditoria directamente desde admin sin duplicar entity
export { AuditLog, ActorType, Severity, Status } from '../../audit/entities/audit-log.entity';
