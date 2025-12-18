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
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationService } from './services/notification.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { UserDeviceService } from './services/user-device.service';
import { PushNotificationService } from './services/push-notification.service';

// Controllers
import {
  NotificationMultiChannelController,
  NotificationPreferencesController,
  NotificationDevicesController,
  NotificationTemplatesController,
} from './controllers';

// ========== SISTEMA BÁSICO (gamification_system.notifications) ==========
// Entity básica
import { Notification as NotificationBasic } from './entities/notification.entity';

// Service básico
import { NotificationsService } from './services/notifications.service';

// Controller básico
import { NotificationsController } from './controllers/notifications.controller';

// Other modules
import { WebSocketModule } from '../websocket/websocket.module';
import { MailModule } from '../mail/mail.module';

/**
 * NotificationsModule
 *
 * @description Módulo de notificaciones multi-canal consolidado
 * @version 3.2 (2025-11-29) - Migrado de Firebase a Web Push nativo
 *
 * SISTEMA CONSOLIDADO (notifications schema):
 * - Notificaciones multi-canal (in_app, email, push)
 * - Templates con interpolación de variables
 * - Preferencias por usuario y tipo
 * - Cola asíncrona para procesamiento
 * - Dispositivos para push notifications
 * - Push notifications via Web Push API nativo (VAPID)
 * - 6 Entities (notifications datasource)
 * - 6 Services (PushNotificationService con web-push)
 * - 4 Controllers
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

    // Sistema básico (gamification datasource)
    TypeOrmModule.forFeature([NotificationBasic], 'gamification'),

    WebSocketModule,
    MailModule,
  ],
  controllers: [
    // Sistema consolidado
    NotificationMultiChannelController,
    NotificationPreferencesController,
    NotificationDevicesController,
    NotificationTemplatesController,

    // Sistema básico
    NotificationsController,
  ],
  providers: [
    // Sistema consolidado
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationService,
    NotificationQueueService,
    UserDeviceService,
    PushNotificationService,

    // Sistema básico
    NotificationsService,
  ],
  exports: [
    // Exportar para uso en otros módulos
    NotificationService, // Sistema consolidado
    NotificationQueueService, // Para workers/cron jobs
    NotificationsService, // Sistema básico
  ],
})
export class NotificationsModule {}
