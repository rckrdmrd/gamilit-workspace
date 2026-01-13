/**
 * UserActivityLog Entity
 *
 * Mapea a la tabla: audit_logging.user_activity_logs
 *
 * @description Registro de actividad de usuarios para analytics
 * @source apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql
 * @version 1.0.0 (2026-01-13) - GAP-004
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Activity types allowed in the system
 */
export type ActivityType =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'exercise_start'
  | 'exercise_complete'
  | 'module_access'
  | 'video_play'
  | 'resource_download'
  | 'search_query';

@Entity({
  schema: DB_SCHEMAS.AUDIT,
  name: DB_TABLES.AUDIT.USER_ACTIVITY_LOGS,
})
@Index(['userId'])
@Index(['tenantId'])
@Index(['activityType'])
@Index(['sessionId'])
@Index(['moduleId'])
@Index(['createdAt'])
export class UserActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario que realizó la actividad
   */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /**
   * ID del tenant/organización
   */
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  /**
   * Tipo de actividad
   */
  @Column({ name: 'activity_type', type: 'text' })
  activityType!: ActivityType;

  /**
   * Detalle de la acción realizada
   */
  @Column({ name: 'action_detail', type: 'text', nullable: true })
  actionDetail?: string;

  /**
   * URL de la página
   */
  @Column({ name: 'page_url', type: 'text', nullable: true })
  pageUrl?: string;

  /**
   * Título de la página
   */
  @Column({ name: 'page_title', type: 'text', nullable: true })
  pageTitle?: string;

  /**
   * URL de referencia
   */
  @Column({ name: 'referrer_url', type: 'text', nullable: true })
  referrerUrl?: string;

  /**
   * ID de la sesión
   */
  @Column({ name: 'session_id', type: 'text', nullable: true })
  sessionId?: string;

  /**
   * Duración de la sesión
   */
  @Column({ name: 'session_duration', type: 'interval', nullable: true })
  sessionDuration?: string;

  /**
   * ID del elemento HTML interactuado
   */
  @Column({ name: 'element_id', type: 'text', nullable: true })
  elementId?: string;

  /**
   * Tipo de elemento HTML
   */
  @Column({ name: 'element_type', type: 'text', nullable: true })
  elementType?: string;

  /**
   * Texto del elemento
   */
  @Column({ name: 'element_text', type: 'text', nullable: true })
  elementText?: string;

  /**
   * Coordenadas del click (punto x,y)
   */
  @Column({ name: 'coordinates', type: 'point', nullable: true })
  coordinates?: string;

  /**
   * ID del módulo educativo (referencia débil intencional)
   */
  @Column({ name: 'module_id', type: 'uuid', nullable: true })
  moduleId?: string;

  /**
   * ID del ejercicio (referencia débil intencional)
   */
  @Column({ name: 'exercise_id', type: 'uuid', nullable: true })
  exerciseId?: string;

  /**
   * ID del aula/salón (referencia débil intencional)
   */
  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
  classroomId?: string;

  /**
   * User agent del navegador
   */
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  /**
   * Dirección IP del usuario
   */
  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string;

  /**
   * Tipo de dispositivo (desktop, mobile, tablet)
   */
  @Column({ name: 'device_type', type: 'text', nullable: true })
  deviceType?: string;

  /**
   * Nombre del navegador
   */
  @Column({ name: 'browser_name', type: 'text', nullable: true })
  browserName?: string;

  /**
   * Versión del navegador
   */
  @Column({ name: 'browser_version', type: 'text', nullable: true })
  browserVersion?: string;

  /**
   * Resolución de pantalla
   */
  @Column({ name: 'screen_resolution', type: 'text', nullable: true })
  screenResolution?: string;

  /**
   * Tiempo de carga en milisegundos
   */
  @Column({ name: 'load_time_ms', type: 'integer', nullable: true })
  loadTimeMs?: number;

  /**
   * Tiempo de interacción en milisegundos
   */
  @Column({ name: 'interaction_time_ms', type: 'integer', nullable: true })
  interactionTimeMs?: number;

  /**
   * Metadatos adicionales en formato JSON
   */
  @Column({ name: 'metadata', type: 'jsonb', default: '{}' })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
