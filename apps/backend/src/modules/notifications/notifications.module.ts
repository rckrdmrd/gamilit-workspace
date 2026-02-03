import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ========== SISTEMA CONSOLIDADO (notifications schema - EXT-003) ==========
// Entities
import {
  NotificationTemplate,
  Notification,
  NotificationPreference,
  NotificationLog,
  NotificationQueue,
  UserDevice,
} from './entities/multichannel';

// Services
import { NotificationTemplateService } from './services/notification-template.service';
import { TemplateI18nService } from './services/template-i18n.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationService } from './services/notification.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { UserDeviceService } from './services/user-device.service';
import { PushNotificationService } from './services/push-notification.service';
import { TwilioService } from './services/twilio.service';
import { NotificationRateLimitService } from './services/rate-limit.service';
// Sprint 1.5 Audit Services (2026-02-03)
import { NotificationDeliveryService } from './services/notification-delivery.service';
import { NotificationErrorService } from './services/notification-error.service';
import { NotificationAnalyticsService } from './services/notification-analytics.service';

// Controllers
import {
  NotificationMultiChannelController,
  NotificationPreferencesController,
  NotificationDevicesController,
  NotificationTemplatesController,
  NotificationRateLimitController,
  NotificationAnalyticsController,
} from './controllers';
import { SmsController } from './controllers/sms.controller';

// Guards
import { NotificationRateLimitGuard } from './guards';

// ========== SISTEMA BÁSICO (MIGRADO 2026-01-07) ==========
// NOTA: El sistema básico (gamification_system.notifications) fue migrado
// al sistema consolidado (notifications.notifications).
// El NotificationsController ahora usa NotificationService.

// Controller principal (migrado a NotificationService)
import { NotificationsController } from './controllers/notifications.controller';

// Other modules
import { WebSocketModule } from '../websocket/websocket.module';
import { MailModule } from '../mail/mail.module';

/**
 * NotificationsModule
 *
 * @description Módulo de notificaciones multi-canal consolidado
 * @version 3.6 (2026-02-03) - Sprint 1.5 Audit (Delivery tracking, Error logging, Analytics)
 *
 * SISTEMA CONSOLIDADO (notifications schema):
 * - Notificaciones multi-canal (in_app, email, push, sms)
 * - Templates con interpolación de variables
 * - Preferencias por usuario y tipo
 * - Cola asíncrona para procesamiento
 * - Dispositivos para push notifications
 * - Push notifications via Web Push API nativo (VAPID)
 * - SMS via Twilio API
 * - Rate limiting por usuario/canal/tenant
 * - Delivery tracking (pending, sent, delivered, failed, bounced)
 * - Error logging with categorization and retry tracking
 * - Analytics (open/click tracking, metrics aggregation)
 * - 6 Entities (notifications datasource)
 * - 11 Services (including audit services)
 * - 8 Controllers
 *
 * NOTA: El sistema básico (gamification_system.notifications) ha sido
 * deprecated y consolidado en este módulo. Todos los triggers de
 * gamificación ahora insertan directamente en notifications.notifications.
 *
 * PUSH NOTIFICATIONS:
 * - PushNotificationService usa librería web-push (Web Push API estándar)
 * - No requiere servicios externos (Firebase, OneSignal, etc.)
 * - Usa claves VAPID generadas localmente (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
 * - Compatible con Chrome, Firefox, Edge, Safari 16.4+
 * - Integrado con NotificationQueueService para procesamiento asíncrono
 * - Manejo automático de subscriptions expiradas/inválidas
 * - Requiere configuración de variables de entorno (VAPID_*)
 *
 * RATE LIMITING:
 * - NotificationRateLimitService para controlar envíos por usuario/canal
 * - NotificationRateLimitGuard para proteger endpoints
 * - Límites configurables por canal: in_app (50/min), email (10/h), push (30/min), sms (5/h)
 * - Límite global por usuario: 100/hora
 * - Límite por tenant: 1000/hora
 */
@Module({
  imports: [
    // Sistema consolidado (notifications datasource)
    TypeOrmModule.forFeature(
      [
        NotificationTemplate,
        Notification,
        NotificationPreference,
        NotificationLog,
        NotificationQueue,
        UserDevice,
      ],
      'notifications',
    ),

    // NOTA: Sistema básico (gamification datasource) REMOVIDO 2026-01-07
    // gamification_system.notifications ya no existe - consolidado en notifications.notifications

    WebSocketModule,
    MailModule,
  ],
  controllers: [
    // Sistema consolidado (multi-canal)
    NotificationMultiChannelController,
    NotificationPreferencesController,
    NotificationDevicesController,
    NotificationTemplatesController,
    NotificationRateLimitController, // Rate limit metrics (2026-02-03)
    SmsController, // SMS via Twilio (2026-02-03)
    NotificationAnalyticsController, // Analytics, delivery tracking, errors (Sprint 1.5)

    // Controller principal (usa NotificationService consolidado)
    NotificationsController,
  ],
  providers: [
    // Sistema consolidado
    NotificationTemplateService,
    TemplateI18nService, // Advanced templates with Handlebars, i18n, versioning (2026-02-03)
    NotificationPreferenceService,
    NotificationService,
    NotificationQueueService,
    UserDeviceService,
    PushNotificationService,
    TwilioService, // SMS via Twilio (2026-02-03)
    NotificationRateLimitService, // Rate limiting (2026-02-03)
    NotificationRateLimitGuard, // Rate limit guard (2026-02-03)
    // Sprint 1.5 Audit Services (2026-02-03)
    NotificationDeliveryService, // Delivery tracking
    NotificationErrorService, // Error logging with categorization
    NotificationAnalyticsService, // Open/click tracking, metrics

    // NOTA: NotificationsService (deprecated) REMOVIDO 2026-01-07
  ],
  exports: [
    // Exportar para uso en otros módulos
    NotificationService, // Sistema consolidado
    NotificationQueueService, // Para workers/cron jobs
    NotificationRateLimitService, // Para uso en otros módulos
    NotificationRateLimitGuard, // Para usar en otros controllers
    TemplateI18nService, // Para uso con i18n en otros módulos
    // Sprint 1.5 Audit exports
    NotificationDeliveryService, // For external delivery status updates
    NotificationErrorService, // For logging errors from other services
    NotificationAnalyticsService, // For analytics in dashboards
  ],
})
export class NotificationsModule {}
