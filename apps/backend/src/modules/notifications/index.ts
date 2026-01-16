// Module
export * from './notifications.module';

// Entities (Sistema Consolidado)
export * from './entities/multichannel';

// Services (Sistema Consolidado)
export * from './services/notification.service';
export * from './services/notification-template.service';
export * from './services/notification-preference.service';
export * from './services/notification-queue.service';
export * from './services/user-device.service';

// Controllers (Sistema Consolidado)
export * from './controllers';

// DTOs (importados desde shared)
export { NotificationResponseDto } from '@shared/dto/notifications/notification-response.dto';
export { CreateNotificationDto } from '@shared/dto/notifications/create-notification.dto';
export * from './dto/get-notifications-query.dto';
export * from './dto/paginated-notifications.dto';
