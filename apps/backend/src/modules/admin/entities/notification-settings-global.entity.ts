import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * Notification Channel Types
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

/**
 * Notification Priority Types
 */
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

/**
 * NotificationSettingsGlobal Entity (system_configuration.notification_settings_global)
 *
 * @description Configuracion GLOBAL de notificaciones a nivel de sistema.
 * @schema system_configuration
 * @table notification_settings_global
 *
 * PROPOSITO:
 * Define configuracion a nivel de sistema para tipos de notificaciones.
 * Configuracion GLOBAL que aplica por defecto a todos los usuarios.
 *
 * DIFERENCIA CON auth_management.notification_settings:
 * - Esta tabla: Configuracion GLOBAL del sistema (sin user_id)
 * - auth_management.notification_settings: Preferencias POR USUARIO (con user_id NOT NULL)
 *
 * ALCANCE:
 * - Templates de notificaciones por tipo
 * - Canales habilitados globalmente
 * - Throttling y batching de notificaciones
 * - Prioridades por defecto
 *
 * CASOS DE USO:
 * 1. Definir que notificaciones estan habilitadas a nivel sistema
 * 2. Configurar templates para cada tipo de notificacion
 * 3. Establecer throttling para evitar spam
 * 4. Configurar batching de notificaciones similares
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/05-notification_settings_global.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.NOTIFICATION_SETTINGS_GLOBAL })
@Index('idx_notification_global_type', ['notification_type'])
@Index('idx_notification_global_channel', ['channel'])
@Index('idx_notification_global_enabled', ['is_enabled'], { where: 'is_enabled = true' })
@Unique(['notification_type', 'channel'])
@Check('"channel" IN (\'email\', \'sms\', \'push\', \'in_app\')')
@Check('"priority" IS NULL OR "priority" IN (\'urgent\', \'high\', \'normal\', \'low\')')
export class NotificationSettingsGlobal {
  /**
   * Identificador unico de la configuracion (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Tipo de notificacion.
   * @example achievement_unlocked, rank_promotion, message_received, assignment_due
   */
  @Column({ type: 'text' })
    notification_type!: string;

  /**
   * Canal de entrega de la notificacion:
   * - email: Correo electronico
   * - sms: Mensaje de texto
   * - push: Notificacion push (movil/web)
   * - in_app: Notificacion dentro de la app
   */
  @Column({ type: 'text' })
    channel!: NotificationChannel;

  /**
   * Si este tipo de notificacion esta habilitado globalmente.
   * false = ningun usuario recibira esta notificacion, sin importar sus preferencias.
   */
  @Column({ type: 'boolean', default: true })
    is_enabled!: boolean;

  /**
   * Prioridad de la notificacion:
   * - urgent: Requiere accion inmediata
   * - high: Importante pero no urgente
   * - normal: Informativa estandar
   * - low: Informativa de baja prioridad
   */
  @Column({ type: 'text', nullable: true })
    priority?: NotificationPriority;

  /**
   * ID del template a usar para renderizar la notificacion.
   * Referencia a content_management.content_templates (si existe).
   * NULL = usar template por defecto del sistema.
   */
  @Column({ type: 'uuid', nullable: true })
    template_id?: string;

  /**
   * Minutos minimos entre notificaciones del mismo tipo al mismo usuario.
   * 0 = sin throttling (enviar siempre).
   * @example 60 = maximo 1 notificacion por hora de este tipo
   */
  @Column({ type: 'integer', default: 0 })
    throttle_minutes!: number;

  /**
   * Si se deben agrupar notificaciones similares antes de enviar.
   * true = esperar batch_window_minutes y enviar resumen.
   * false = enviar cada notificacion individualmente.
   */
  @Column({ type: 'boolean', default: false })
    batch_enabled!: boolean;

  /**
   * Ventana de tiempo para agrupar notificaciones en batch.
   * Solo aplicable si batch_enabled = true.
   * @example 30 = agrupar notificaciones de los ultimos 30 minutos
   */
  @Column({ type: 'integer', nullable: true })
    batch_window_minutes?: number;

  /**
   * Configuracion adicional en formato JSON. Puede incluir:
   * - sender_name: Nombre del remitente
   * - sender_email: Email del remitente
   * - cc: Lista de emails en copia
   * - reply_to: Email de respuesta
   * - attachments_enabled: Si permite adjuntos
   * - rich_formatting: Si usa formato HTML
   * - include_unsubscribe_link: Si incluye link de baja
   */
  @Column({ type: 'jsonb', default: {} })
    settings!: Record<string, unknown>;

  /**
   * Fecha y hora de creacion
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de ultima actualizacion
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
