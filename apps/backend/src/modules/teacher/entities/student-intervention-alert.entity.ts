import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Profile } from '../../auth/entities/profile.entity';
import { Classroom } from '../../social/entities/classroom.entity';
import { DB_SCHEMAS } from '@/shared/constants/database.constants';
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@shared/types/intervention-alerts.types';

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertType from @shared/types
 */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertSeverity from @shared/types
 */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertStatus from @shared/types
 */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;

/**
 * Student Intervention Alert Entity
 *
 * @description Entity para alertas automáticas de intervención estudiantil.
 * Generadas por la función SQL generate_student_alerts() que analiza patrones de:
 * - Inactividad prolongada (no_activity)
 * - Calificaciones bajas (low_score)
 * - Tendencias descendentes (declining_trend)
 * - Fallos repetidos (repeated_failures)
 * - Tiempo excesivo en ejercicios (excessive_time)
 * - Bajo engagement (low_engagement)
 *
 * @schema progress_tracking
 * @table student_intervention_alerts
 *
 * @see apps/database/ddl/schemas/progress_tracking/functions/generate_student_alerts.sql
 *
 * Features:
 * - Generación automática por CRON job
 * - Severidad: low, medium, high, critical
 * - Estado: active, acknowledged, resolved, dismissed
 * - Tracking de quién acknowledge/resuelve la alerta
 * - Métricas JSON con datos específicos del problema
 * - Multi-tenant support
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: 'student_intervention_alerts' })
@Index('idx_intervention_alerts_student', ['student_id'])
@Index('idx_intervention_alerts_classroom', ['classroom_id'])
@Index('idx_intervention_alerts_status', ['status'])
@Index('idx_intervention_alerts_severity', ['severity'])
@Index('idx_intervention_alerts_type', ['alert_type'])
@Index('idx_intervention_alerts_generated', ['generated_at'])
@Index('idx_intervention_alerts_tenant', ['tenant_id'])
export class StudentInterventionAlert {
  /**
   * Identificador único de la alerta (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // MULTI-TENANT & RELATIONS
  // =====================================================

  /**
   * ID del tenant propietario (FK → auth_management.tenants)
   */
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenant_id!: string;

  /**
   * ID del estudiante afectado (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid', name: 'student_id' })
  student_id!: string;

  /**
   * Relación Many-to-One con Profile (estudiante)
   */
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'student_id' })
  student?: Profile;

  /**
   * ID del classroom relacionado (FK → social_features.classrooms)
   * Nullable: algunas alertas pueden ser globales
   */
  @Column({ type: 'uuid', name: 'classroom_id', nullable: true })
  classroom_id?: string | null;

  /**
   * Relación Many-to-One con Classroom
   */
  @ManyToOne(() => Classroom)
  @JoinColumn({ name: 'classroom_id' })
  classroom?: Classroom | null;

  // =====================================================
  // ALERT DETAILS
  // =====================================================

  /**
   * Tipo de alerta
   * @enum AlertType
   */
  @Column({
    type: 'text',
    name: 'alert_type',
  })
  alert_type!: AlertType;

  /**
   * Nivel de severidad
   * @enum AlertSeverity
   */
  @Column({
    type: 'text',
  })
  severity!: AlertSeverity;

  /**
   * Título descriptivo de la alerta (generado automáticamente)
   */
  @Column({ type: 'text' })
  title!: string;

  /**
   * Descripción detallada del problema (generado automáticamente)
   */
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  /**
   * Métricas específicas de la alerta en formato JSON
   * Ejemplos:
   * - no_activity: { days_inactive: 7, last_activity: '2025-11-17' }
   * - low_score: { avg_score: 45, exercises_count: 5 }
   * - declining_trend: { score_drop: 30, period: '7 days' }
   */
  @Column({ type: 'jsonb', nullable: true })
  metrics?: Record<string, any> | null;

  // =====================================================
  // STATUS & WORKFLOW
  // =====================================================

  /**
   * Estado actual de la alerta
   * @enum AlertStatus
   * @default 'active'
   */
  @Column({
    type: 'text',
    default: AlertStatus.ACTIVE,
  })
  status!: AlertStatus;

  /**
   * Fecha y hora de generación de la alerta
   */
  @Column({ type: 'timestamp with time zone', name: 'generated_at', default: () => 'NOW()' })
  generated_at!: Date;

  /**
   * Fecha y hora cuando se reconoció la alerta (acknowledged)
   */
  @Column({ type: 'timestamp with time zone', name: 'acknowledged_at', nullable: true })
  acknowledged_at?: Date | null;

  /**
   * ID del teacher que reconoció la alerta
   */
  @Column({ type: 'uuid', name: 'acknowledged_by', nullable: true })
  acknowledged_by?: string | null;

  /**
   * Relación con el teacher que acknowledge
   */
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledged_by_user?: Profile | null;

  /**
   * Fecha y hora cuando se resolvió la alerta
   */
  @Column({ type: 'timestamp with time zone', name: 'resolved_at', nullable: true })
  resolved_at?: Date | null;

  /**
   * ID del teacher que resolvió la alerta
   */
  @Column({ type: 'uuid', name: 'resolved_by', nullable: true })
  resolved_by?: string | null;

  /**
   * Relación con el teacher que resolvió
   */
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'resolved_by' })
  resolved_by_user?: Profile | null;

  /**
   * Notas de resolución (acciones tomadas)
   */
  @Column({ type: 'text', name: 'resolution_notes', nullable: true })
  resolution_notes?: string | null;

  // =====================================================
  // AUDIT TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updated_at!: Date;
}
