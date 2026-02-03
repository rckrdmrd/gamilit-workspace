/**
 * Notifications Controllers (EXT-003)
 *
 * @description Exporta controllers para sistema multi-canal de notificaciones
 * @version 1.3 (2026-02-03) - Added NotificationAnalyticsController (Sprint 1.5 Audit)
 *
 * Controllers exportados:
 * 1. NotificationMultiChannelController - Creacion de notificaciones multi-canal
 * 2. NotificationPreferencesController - Gestion de preferencias por usuario
 * 3. NotificationDevicesController - Gestion de dispositivos para push
 * 4. NotificationTemplatesController - Gestion de templates
 * 5. NotificationRateLimitController - Metricas y gestion de rate limits
 * 6. SmsController - Envio de SMS via Twilio
 * 7. NotificationAnalyticsController - Analytics, delivery tracking, error logging
 *
 * IMPORTANTE:
 * - NotificationsController (sistema basico) ya existe y se mantiene
 * - Estos controllers complementan el sistema basico con funcionalidad multi-canal
 * - Rutas base diferenciadas para evitar conflictos
 */

export { NotificationMultiChannelController } from './notification-multichannel.controller';
export { NotificationPreferencesController } from './notification-preferences.controller';
export { NotificationDevicesController } from './notification-devices.controller';
export { NotificationTemplatesController } from './notification-templates.controller';
export { NotificationRateLimitController } from './notification-rate-limit.controller';
export { SmsController } from './sms.controller';
export { NotificationAnalyticsController } from './notification-analytics.controller';
export { NotificationsController } from './notifications.controller';
