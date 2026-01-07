import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@/shared/constants/enums.constants';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Interface para data JSONB
 *
 * @description Datos adicionales específicos para cada tipo de notificación
 * @source docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md:53-71
 * @version 2.0 (2025-11-07) - Alineado con documentación oficial
 */
export interface NotificationData {
  achievement_id?: string;
  achievement_name?: string;
  achievement_icon?: string;
  rank?: string;
  previous_rank?: string;
  friend_id?: string;
  friend_name?: string;
  guild_id?: string;          // Usa "guild" según terminología oficial
  guild_name?: string;
  mission_id?: string;
  mission_name?: string;
  level?: number;
  coins_amount?: number;
  current_streak?: number;
  exercise_id?: string;
  reference_url?: string;
  [key: string]: any;
}

/**
 * Notification Entity (SISTEMA BÁSICO - DEPRECATED)
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!!                          DEPRECATED                                  !!!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * @deprecated Usar NotificationService (sistema consolidado) en su lugar
 * @migration Fecha: 2026-01-04
 *
 * MIGRAR A:
 *   - Entity: entities/multichannel/notification.entity.ts
 *   - Service: services/notification.service.ts (NotificationService)
 *   - Schema: notifications.notifications
 *
 * RAZÓN DE DEPRECACIÓN:
 *   - gamification_system.notifications está deprecated
 *   - El nuevo sistema multi-canal soporta: in_app, email, push
 *   - Todos los triggers de BD ya usan notifications.notifications
 *
 * CAMBIOS DE API:
 *   - NotificationsService.sendNotification() → NotificationService.create()
 *   - read: boolean → status: 'pending' | 'sent' | 'read' | 'failed'
 *   - type: enum → type: string
 *   - Nuevos campos: channels[], readAt, sentAt, expiresAt, metadata
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * Mapea a la tabla: gamification_system.notifications (DEPRECATED)
 *
 * @description Notificaciones de usuario para eventos del sistema
 * @version 3.1 (2026-01-04) - DEPRECATED - Migrar a sistema consolidado
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.NOTIFICATIONS })
@Index(['userId'])
@Index(['type'])
@Index(['userId', 'read'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column('uuid', { name: 'user_id' })
    userId!: string;

  /**
   * Tipo de notificación
   *
   * IMPORTANTE: Usa NotificationTypeEnum que está sincronizado con:
   * - DDL: public.notification_type ENUM
   * - Docs: TYPES-NOTIFICATIONS.md
   * - Total: 11 tipos de notificaciones
   *
   * @see NotificationTypeEnum para lista completa de tipos
   */
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
    type!: NotificationTypeEnum;

  @Column('text')
    title!: string;

  @Column('text')
    message!: string;

  /**
   * Datos adicionales en formato JSONB
   *
   * Estructura varía según el tipo de notificación:
   * - achievement_unlocked: achievement_id, achievement_name, achievement_icon
   * - rank_up: rank, previous_rank
   * - friend_request: friend_id, friend_name
   * - guild_invitation: guild_id, guild_name
   * - mission_completed: mission_id, mission_name
   * - level_up: level
   * - message_received: (información del remitente)
   * - ml_coins_earned: coins_amount
   * - streak_milestone: current_streak
   * - exercise_feedback: exercise_id
   *
   * @see NotificationData interface para estructura completa
   */
  @Column('jsonb', { nullable: true })
    data!: NotificationData | null;

  /**
   * Prioridad de la notificación (urgencia de visualización)
   *
   * Define la urgencia de visualización y entrega de la notificación:
   * - low: Notificaciones informativas, sin urgencia (ej: level_up, ml_coins_earned)
   * - medium: Notificaciones estándar (DEFAULT) (ej: achievement_unlocked, rank_up)
   * - high: Notificaciones urgentes (ej: system_announcement, message_received)
   *
   * @see NotificationPriorityEnum para valores válidos
   * @see NOTIFICATION_PRIORITY_BY_TYPE para categorización automática por tipo
   * @version 3.0 (2025-11-08) - Agregada columna priority
   */
  @Column({
    type: 'enum',
    enum: NotificationPriorityEnum,
    enumName: 'notification_priority',
    default: NotificationPriorityEnum.MEDIUM,
  })
    priority!: NotificationPriorityEnum;

  /**
   * Indica si la notificación fue leída por el usuario
   */
  @Column('boolean', { default: false })
    read!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;

  // Relación con User (Profile)
  // TODO: Descomentar cuando Profile entity esté disponible
  // @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // user: Profile;
}
