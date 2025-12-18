import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Notification Entity (Sistema Consolidado)
 *
 * Mapea a la tabla: notifications.notifications
 *
 * @description Notificaciones multi-canal del sistema (EXT-003)
 * @source apps/database/ddl/schemas/notifications/tables/01-notifications.sql
 * @version 2.0 (2025-11-28) - Sincronizado con DDL real, consolidado con gamification
 *
 * IMPORTANTE:
 * - Esta es la ÚNICA tabla de notificaciones del sistema
 * - Reemplaza gamification_system.notifications (deprecated)
 * - Soporte para 3 canales: in_app, email, push
 * - Tipos permitidos: achievement, mission, assignment, social, system, gamification
 *
 * Flujo de envío:
 * 1. Se crea notificación (trigger o service)
 * 2. Se puede encolar en notification_queue para procesamiento asíncrono
 * 3. Se registra en notification_logs el resultado
 *
 * NOTA sobre relaciones:
 * - userId es UUID pero NO tiene decorador @ManyToOne a User
 * - Razón: User está en datasource 'auth', Notification en 'notifications'
 * - TypeORM no soporta relaciones cross-datasource
 */
@Entity({
  schema: DB_SCHEMAS.NOTIFICATIONS,
  name: DB_TABLES.NOTIFICATIONS.NOTIFICATIONS,
})
@Index(['userId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
@Index(['expiresAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * ID del usuario destinatario
   * FK en DB: → auth.users(id) ON DELETE CASCADE
   */
  @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

  /**
   * Tipo de notificación
   * Valores permitidos: achievement, mission, assignment, social, system, gamification
   */
  @Column({ type: 'varchar', length: 50 })
    type!: string;

  /**
   * Título de la notificación
   * Máximo 255 caracteres
   */
  @Column({ type: 'varchar', length: 255 })
    title!: string;

  /**
   * Mensaje/contenido de la notificación
   */
  @Column({ type: 'text' })
    message!: string;

  /**
   * Datos adicionales específicos del tipo (JSONB)
   * Ejemplos:
   * - achievement: { achievement_id, achievement_name, xp_reward, coins_reward }
   * - mission: { mission_id, mission_name }
   * - assignment: { assignment_id, due_date }
   */
  @Column({ type: 'jsonb', nullable: true, default: {} })
    data?: Record<string, unknown>;

  /**
   * Prioridad de la notificación
   * Valores: low, normal, high, urgent
   */
  @Column({ type: 'varchar', length: 20, default: 'normal' })
    priority!: string;

  /**
   * Canales de envío (array)
   * Valores: in_app, email, push
   */
  @Column({ type: 'varchar', array: true, default: ['in_app'] })
    channels!: string[];

  /**
   * Estado de la notificación
   * Valores: pending, sent, read, failed
   */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: string;

  /**
   * Fecha de lectura
   */
  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
    readAt?: Date;

  /**
   * Fecha de envío
   */
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
    sentAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt!: Date;

  /**
   * Fecha de expiración (opcional)
   */
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt?: Date;

  /**
   * Metadata adicional (JSONB)
   * Para datos que no encajan en 'data': icon, action_url, related_entity_type/id
   */
  @Column({ type: 'jsonb', nullable: true, default: {} })
    metadata?: Record<string, unknown>;
}
