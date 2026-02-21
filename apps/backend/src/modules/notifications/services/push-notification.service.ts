import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { UserDeviceService } from './user-device.service';

/**
 * PushNotificationService
 *
 * @description Servicio para envío de push notifications via Web Push API nativo
 * @version 2.0 (2025-11-29) - Reemplazado Firebase por web-push nativo
 *
 * Web Push Protocol:
 * - No requiere servicios externos (Firebase, OneSignal, etc.)
 * - Usa claves VAPID generadas localmente
 * - Compatible con Chrome, Firefox, Edge, Safari 16.4+
 * - Funciona con cualquier servidor (no vendor lock-in)
 *
 * Flujo:
 * 1. Backend genera par de claves VAPID (pública + privada)
 * 2. Frontend solicita permiso y obtiene PushSubscription
 * 3. Frontend envía subscription a backend (guardada en user_devices)
 * 4. Backend usa web-push para enviar notificaciones
 *
 * Inicialización:
 * - onModuleInit() lee variables de entorno (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
 * - Se configuran claves VAPID con webpush.setVapidDetails()
 * - Si no están configuradas, el servicio queda deshabilitado (graceful degradation)
 *
 * Estructura de PushSubscription:
 * {
 *   endpoint: "https://fcm.googleapis.com/fcm/send/...",
 *   keys: {
 *     p256dh: "BN...",  // Public key
 *     auth: "aB..."     // Auth secret
 *   }
 * }
 *
 * Manejo de errores:
 * - 410 Gone: subscripción expirada (se invalida automáticamente)
 * - 404 Not Found: subscripción no encontrada (se invalida automáticamente)
 * - Network errors: se propaga el error para retry en cola
 * - No initialized: retorna false (graceful degradation)
 *
 * IMPORTANTE:
 * - El deviceToken ahora es un JSON string de PushSubscription
 * - Las subscriptions pueden expirar (browser revoca permisos)
 * - La invalidación de subscriptions es crítica para evitar errores repetidos
 *
 * Generación de claves VAPID:
 * ```bash
 * npx web-push generate-vapid-keys
 * ```
 *
 * Referencias:
 * - https://www.npmjs.com/package/web-push
 * - https://developer.mozilla.org/en-US/docs/Web/API/Push_API
 * - https://web.dev/push-notifications-overview/
 */
@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);

  private isInitialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly userDeviceService: UserDeviceService,
  ) { }

  async onModuleInit() {
    this.initializeWebPush();
  }

  /**
   * Initialize Web Push with VAPID keys
   *
   * Lee variables de entorno y configura Web Push con claves VAPID
   * Si falta alguna variable, el servicio queda deshabilitado
   *
   * @private
   */
  private initializeWebPush(): void {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') ||
      'mailto:admin@gamilit.com';

    if (!publicKey || !privateKey) {
      this.logger.warn(
        'VAPID keys not configured. Push notifications will be disabled.',
      );
      this.logger.warn('Generate keys with: npx web-push generate-vapid-keys');
      return;
    }

    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.isInitialized = true;
      this.logger.log('Web Push initialized successfully with VAPID keys');
    } catch (error) {
      this.logger.error('Failed to initialize Web Push:', error);
    }
  }

  /**
   * Check if push service is available
   *
   * @returns true si Web Push está inicializado y disponible
   *
   * @example
   * if (this.pushService.isAvailable()) {
   *   await this.pushService.sendToUser(userId, notification);
   * }
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Get VAPID public key for frontend subscription
   *
   * El frontend necesita la clave pública VAPID para crear subscripciones
   *
   * @returns VAPID public key o null si no está configurado
   *
   * @example
   * // Frontend usage:
   * const vapidPublicKey = await fetch('/api/notifications/devices/vapid-public-key');
   * const subscription = await registration.pushManager.subscribe({
   *   userVisibleOnly: true,
   *   applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
   * });
   */
  getVapidPublicKey(): string | null {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') || null;
  }

  /**
   * Send push notification to a single subscription
   *
   * @param subscription - PushSubscription object from frontend
   * @param payload - Notification payload
   * @returns true if successful, false if failed
   * @throws InvalidSubscriptionError si la subscription es inválida/expirada
   *
   * @example
   * const subscription = {
   *   endpoint: "https://fcm.googleapis.com/fcm/send/...",
   *   keys: { p256dh: "BN...", auth: "aB..." }
   * };
   * await this.pushService.sendToSubscription(subscription, {
   *   title: 'Nueva insignia',
   *   body: 'Has ganado la insignia "Explorador"',
   *   icon: '/badges/explorer.png'
   * });
   */
  async sendToSubscription(
    subscription: Record<string, unknown>,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, unknown>;
    },
  ): Promise<boolean> {
    if (!this.isInitialized) {
      this.logger.warn('Web Push not initialized. Skipping notification.');
      return false;
    }

    try {
      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        tag: payload.tag || 'gamilit-notification',
        data: payload.data || {},
        // Vibration pattern (200ms on, 100ms off, 200ms on)
        vibrate: [200, 100, 200],
        // Require interaction: false = auto-dismiss after timeout
        requireInteraction: false,
      });

      await webpush.sendNotification(subscription, notificationPayload);
      this.logger.debug('Push notification sent successfully');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send push: ${message}`);

      // Handle expired/invalid subscriptions (410 Gone, 404 Not Found)
      const statusCode = (error as Record<string, unknown>)?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        this.logger.warn(
          `Subscription expired or invalid (status: ${statusCode})`,
        );
        throw new InvalidSubscriptionError(statusCode as number);
      }

      throw error;
    }
  }

  /**
   * Send push notification to a device by token
   *
   * The token stored in user_devices is actually a JSON-stringified PushSubscription
   *
   * @param deviceToken - JSON string of PushSubscription
   * @param payload - Notification payload
   * @returns true if successful
   * @throws InvalidSubscriptionError si el token es inválido/expirado
   *
   * @example
   * const token = '{"endpoint":"https://fcm.googleapis.com/...","keys":{...}}';
   * await this.pushService.sendToDevice(token, {
   *   title: 'Nueva tarea',
   *   body: 'Tienes una nueva tarea asignada'
   * });
   */
  async sendToDevice(
    deviceToken: string,
    payload: {
      title: string;
      body: string;
      icon?: string;
      data?: Record<string, unknown>;
    },
  ): Promise<boolean> {
    try {
      // Parse the subscription from token
      const subscription = JSON.parse(
        deviceToken,
      ) as any;
      return await this.sendToSubscription(subscription, payload);
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.logger.error('Invalid device token format (not valid JSON)');
        throw new InvalidSubscriptionError(400);
      }
      throw error;
    }
  }

  /**
   * Send push notification to all devices of a user
   *
   * Obtiene dispositivos activos del usuario y envía push notification
   * Invalida automáticamente subscriptions expiradas detectadas por Web Push
   *
   * @param userId - User ID
   * @param payload - Notification payload
   * @returns Results with success and failure counts
   *
   * @example
   * const result = await this.pushService.sendToUser(
   *   'user-uuid',
   *   { title: 'Nuevo evento', body: 'Se ha publicado un nuevo evento' },
   * );
   * console.log(`Sent to ${result.successCount} devices`);
   * console.log(`Failed: ${result.failureCount}, Invalid: ${result.invalidTokens.length}`);
   */
  async sendToUser(
    userId: string,
    payload: {
      title: string;
      body: string;
      icon?: string;
      data?: Record<string, unknown>;
    },
  ): Promise<{
    successCount: number;
    failureCount: number;
    invalidTokens: string[];
  }> {
    // Get user's active devices
    const devices = await this.userDeviceService.getActiveDevicesByUser(userId);

    if (devices.length === 0) {
      this.logger.debug(`No active devices for user ${userId}`);
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    for (const device of devices) {
      try {
        const success = await this.sendToDevice(device.deviceToken, payload);
        if (success) {
          successCount++;
          // Update last used
          await this.userDeviceService.updateLastUsed(device.id);
        } else {
          failureCount++;
        }
      } catch (error) {
        failureCount++;
        if (error instanceof InvalidSubscriptionError) {
          invalidTokens.push(device.deviceToken);
          // Invalidate the device
          try {
            await this.userDeviceService.invalidateDevice(
              userId,
              device.deviceToken,
            );
            this.logger.debug(
              `Invalidated expired subscription for user ${userId}`,
            );
          } catch (invalidateError) {
            this.logger.error(
              `Failed to invalidate device: ${invalidateError}`,
            );
          }
        }
      }
    }

    this.logger.debug(
      `Push to user ${userId}: ${successCount} success, ${failureCount} failed`,
    );

    return { successCount, failureCount, invalidTokens };
  }

  /**
   * Generate new VAPID keys (utility method for setup)
   *
   * Run this once to generate keys, then save to environment variables
   *
   * @returns Object with publicKey and privateKey
   * @static
   *
   * @example
   * // En consola de NestJS o script de setup:
   * const keys = PushNotificationService.generateVapidKeys();
   * console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
   * console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
   */
  static generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}

/**
 * Error for invalid/expired subscriptions
 *
 * Se lanza cuando Web Push devuelve 410 Gone o 404 Not Found
 * Permite al caller manejar el error específicamente (invalidar device)
 */
export class InvalidSubscriptionError extends Error {
  constructor(public readonly statusCode: number) {
    super(`Invalid or expired subscription (status: ${statusCode})`);
    this.name = 'InvalidSubscriptionError';
  }
}
