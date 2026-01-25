import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * Alert type options for teacher alert configurations
 * Matches the CHECK constraint in DDL
 */
export type AlertType =
  | 'no_activity'
  | 'low_score'
  | 'declining_trend'
  | 'repeated_failures'
  | 'excessive_time'
  | 'low_engagement';

/**
 * Threshold unit options for alert thresholds
 * Matches the CHECK constraint in DDL
 */
export type ThresholdUnit = 'percentage' | 'days' | 'count' | 'minutes';

/**
 * TeacherAlertConfiguration Entity (progress_tracking.teacher_alert_configurations)
 *
 * @description Configuraciones personalizadas de alertas por profesor.
 * Permite a los profesores definir umbrales y preferencias de notificacion
 * para cada tipo de alerta de intervencion.
 *
 * @schema progress_tracking
 * @table teacher_alert_configurations
 *
 * IMPORTANTE:
 * - Soporta configuraciones globales (classroom_id = null) o por aula
 * - El constraint UNIQUE garantiza una sola configuracion por tipo/profesor/aula
 * - Las FK a profiles y classrooms son cross-schema (no se definen en TypeORM)
 *
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/20-teacher_alert_configurations.sql
 * @since US-PM-007
 */
@Entity({
  schema: DB_SCHEMAS.PROGRESS,
  name: DB_TABLES.PROGRESS.TEACHER_ALERT_CONFIGURATIONS,
})
@Index('idx_teacher_alert_config_teacher', ['teacher_id'])
@Index('idx_teacher_alert_config_tenant', ['tenant_id'])
@Index('idx_teacher_alert_config_type', ['alert_type'])
@Unique('teacher_alert_configurations_unique_config', [
  'teacher_id',
  'classroom_id',
  'alert_type',
])
export class TeacherAlertConfiguration {
  /**
   * Identificador unico de la configuracion (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del profesor que configura las alertas
   */
  @Column({ type: 'uuid' })
  teacher_id!: string;

  /**
   * ID del aula especifica. NULL indica configuracion global del profesor
   */
  @Column({ type: 'uuid', nullable: true })
  classroom_id?: string;

  /**
   * Tipo de alerta a configurar
   */
  @Column({ type: 'text' })
  alert_type!: AlertType;

  /**
   * Indica si este tipo de alerta esta habilitado
   */
  @Column({ type: 'boolean', default: true })
  is_enabled!: boolean;

  /**
   * Valor del umbral para disparar la alerta
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  threshold_value?: number;

  /**
   * Unidad del umbral: percentage, days, count, minutes
   */
  @Column({ type: 'text', nullable: true })
  threshold_unit?: ThresholdUnit;

  /**
   * Enviar notificacion por email
   */
  @Column({ type: 'boolean', default: false })
  notify_email!: boolean;

  /**
   * Mostrar notificacion en la aplicacion
   */
  @Column({ type: 'boolean', default: true })
  notify_in_app!: boolean;

  /**
   * Horas minimas entre alertas del mismo tipo para el mismo estudiante
   */
  @Column({ type: 'integer', default: 24 })
  cooldown_hours!: number;

  /**
   * Configuraciones adicionales especificas del tipo de alerta en formato JSON
   */
  @Column({ type: 'jsonb', nullable: true })
  custom_settings?: Record<string, unknown>;

  /**
   * ID del tenant para soporte multi-tenant
   */
  @Column({ type: 'uuid' })
  tenant_id!: string;

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
