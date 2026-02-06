import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Notification } from './notification.entity';

/**
 * NotificationLog Entity
 *
 * Mapea a la tabla: notifications.notification_logs
 *
 * @description Registro de intentos de envío de notificaciones (EXT-003)
 * @source orchestration/database/DB-115/HANDOFF-TO-BACKEND.md
 * @version 1.1 (2026-02-05) - FIX H-024: Alineado con DDL (varchar lengths, removed extra columns)
 *
 * IMPORTANTE:
 * - Un log por cada intento de envío por canal
 * - Tracking completo de éxitos/fallos por proveedor externo
 * - Almacena external_id del proveedor (SendGrid, FCM, etc.)
 * - Útil para debugging y auditoría de entregas
 *
 * Características:
 * - Una notificación puede tener múltiples logs (uno por canal)
 * - Estados: 'sent', 'failed', 'pending'
 * - Metadata JSONB para información adicional del proveedor
 * - External ID permite hacer tracking con proveedor externo
 *
 * Flujo de creación:
 * 1. Worker procesa notification_queue
 * 2. Intenta enviar por canal (email, push)
 * 3. Proveedor externo devuelve resultado
 * 4. Se crea log con status y external_id
 * 5. Si falla, se registra error_message
 *
 * Ejemplos de external_id:
 * - Email (SendGrid): "<20231113120000.1234567@sendgrid.net>"
 * - Push (FCM): "projects/gamilit/messages/0:1234567890123456"
 *
 * Casos de uso:
 * - Verificar si un email fue entregado exitosamente
 * - Debugging de fallos de envío
 * - Auditoría de notificaciones enviadas
 * - Tracking con proveedores externos
 */
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATION_LOGS,
})
@Index(['notificationId'])
@Index(['channel'])
@Index(['status'])
@Index(['sentAt'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * ID de la notificación
   *
   * Relación: @ManyToOne a Notification
   *
   * FK en DB: → notifications.notifications(id) ON DELETE CASCADE
   */
  @Column({ name: 'notification_id', type: 'uuid' })
    notificationId!: string;

  /**
   * Relación con la notificación
   *
   * Un log pertenece a una notificación
   * Una notificación puede tener múltiples logs (uno por canal)
   */
  @ManyToOne(() => Notification, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'notification_id' })
    notification!: Notification;

  /**
   * Canal por el que se intentó enviar
   *
   * Valores posibles:
   * - 'in_app' - Notificación in-app (siempre exitosa si llega aquí)
   * - 'email' - Email (SendGrid, AWS SES, etc.)
   * - 'push' - Push notification (FCM, APNS, etc.)
   *
   * IMPORTANTE: Un log por canal
   */
  // FIX H-024: DDL channel is VARCHAR(20)
  @Column({ type: 'varchar', length: 20 })
    channel!: string;

  /**
   * Estado del envío
   * Valores: 'sent', 'delivered', 'failed', 'bounced'
   */
  // FIX H-024: DDL status is VARCHAR(20)
  @Column({ type: 'varchar', length: 20 })
    status!: string;

  /**
   * Fecha y hora en que se envió exitosamente
   *
   * Solo se llena si status='sent'
   *
   * @optional
   */
  @Column({ name: 'sent_at', type: 'timestamp with time zone', nullable: true })
    sentAt?: Date;

  /**
   * Fecha y hora en que fue entregado
   *
   * Solo se llena si status='delivered'
   * Indica confirmación de entrega del proveedor
   *
   * @optional
   */
  @Column({ name: 'delivered_at', type: 'timestamp with time zone', nullable: true })
    deliveredAt?: Date;

  /**
   * Mensaje de error si el envío falló
   *
   * Contiene el error devuelto por el proveedor externo
   *
   * Ejemplos:
   * - Email: "Invalid email address", "User unsubscribed", "Mailbox full"
   * - Push: "Device token invalid", "App uninstalled", "Notification disabled"
   *
   * Útil para debugging y mostrar al admin
   *
   * @optional Solo si status='failed'
   */
  @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string;

  /**
   * ID externo del proveedor (SendGrid, FCM, etc.)
   * NOTE: NOT in current DDL - needs ALTER TABLE to add external_id column
   * Actively used by notification-delivery.service.ts for webhook tracking
   */
  @Column({ name: 'external_id', type: 'varchar', length: 255, nullable: true })
    externalId?: string;

  /**
   * Respuesta del proveedor externo
   *
   * Respuesta completa del proveedor (SendGrid, Firebase, etc.)
   *
   * Ejemplos:
   * - Email (SendGrid): { status_code, message_id, headers }
   * - Push (FCM): { success, message_id, error_code }
   *
   * Útil para debugging y auditoría
   *
   * @optional
   */
  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
    providerResponse?: Record<string, unknown>;

  /**
   * Metadata adicional del proveedor en JSONB
   *
   * Información adicional devuelta por el proveedor
   *
   * Ejemplos:
   * - Email: { smtp_response, bounce_type, recipient_status }
   * - Push: { platform, device_info, delivery_time }
   *
   * Útil para debugging avanzado
   *
   * @optional
   */
  @Column({ type: 'jsonb', nullable: true, default: {} })
    metadata?: Record<string, unknown>;

  /**
   * NOTE: NOT in current DDL - needs ALTER TABLE to add created_at column
   * Actively used by services for ordering and filtering
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;
}
