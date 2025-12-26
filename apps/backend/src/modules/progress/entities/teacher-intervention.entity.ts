import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * Tipos de intervención docente
 */
export type InterventionType =
  | 'one_on_one_session'
  | 'parent_contact'
  | 'resource_assignment'
  | 'peer_tutoring'
  | 'accommodation'
  | 'referral'
  | 'behavior_plan'
  | 'progress_check'
  | 'encouragement'
  | 'schedule_adjustment'
  | 'other';

/**
 * Estados de intervención
 */
export type InterventionStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

/**
 * Prioridades de intervención
 */
export type InterventionPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * TeacherIntervention Entity (progress_tracking.teacher_interventions)
 *
 * @description Registra acciones de intervención docente para estudiantes en riesgo
 * @schema progress_tracking
 * @table teacher_interventions
 *
 * IMPORTANTE:
 * - Tracking completo de intervenciones docentes
 * - Incluye scheduling, outcomes, parent contact, efectividad
 * - Soporta follow-ups y multi-step interventions
 * - Vinculado opcionalmente a alertas de intervención
 *
 * USE CASES:
 * - Contacto con padres
 * - Sesiones uno a uno
 * - Asignación de recursos
 * - Tutoría entre pares
 * - Ajustes de acomodación
 * - Follow-up tracking
 *
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/17-teacher_interventions.sql
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: DB_TABLES.PROGRESS.TEACHER_INTERVENTIONS })
@Index('idx_teacher_interventions_alert', ['alert_id'])
@Index('idx_teacher_interventions_student', ['student_id'])
@Index('idx_teacher_interventions_teacher', ['teacher_id'])
@Index('idx_teacher_interventions_classroom', ['classroom_id'])
@Index('idx_teacher_interventions_status', ['status'])
@Index('idx_teacher_interventions_type', ['intervention_type'])
@Index('idx_teacher_interventions_tenant', ['tenant_id'])
export class TeacherIntervention {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // ALERT REFERENCE (OPTIONAL)
  // =====================================================

  /**
   * ID de la alerta de intervención (FK → progress_tracking.student_intervention_alerts)
   * Nullable - puede ser intervención standalone
   */
  @Column({ type: 'uuid', nullable: true })
  alert_id?: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del estudiante (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
  student_id!: string;

  /**
   * ID del profesor (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
  teacher_id!: string;

  /**
   * ID del aula (FK → social_features.classrooms)
   */
  @Column({ type: 'uuid', nullable: true })
  classroom_id?: string;

  // =====================================================
  // INTERVENTION DETAILS
  // =====================================================

  /**
   * Tipo de intervención
   */
  @Column({ type: 'text' })
  intervention_type!: InterventionType;

  /**
   * Título de la intervención
   */
  @Column({ type: 'text' })
  title!: string;

  /**
   * Descripción detallada de la intervención
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  // =====================================================
  // ACTION TRACKING
  // =====================================================

  /**
   * Acción tomada
   */
  @Column({ type: 'text' })
  action_taken!: string;

  /**
   * Resultado de la intervención
   */
  @Column({ type: 'text', nullable: true })
  outcome?: string;

  // =====================================================
  // SCHEDULING
  // =====================================================

  /**
   * Fecha programada de la intervención
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  scheduled_date?: Date;

  /**
   * Fecha de completación de la intervención
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_date?: Date;

  // =====================================================
  // STATUS TRACKING
  // =====================================================

  /**
   * Estado de la intervención
   */
  @Column({ type: 'text', default: 'planned' })
  status!: InterventionStatus;

  /**
   * Prioridad de la intervención
   */
  @Column({ type: 'text', default: 'medium' })
  priority!: InterventionPriority;

  // =====================================================
  // FOLLOW-UP
  // =====================================================

  /**
   * Indica si se requiere seguimiento
   */
  @Column({ type: 'boolean', default: false })
  follow_up_required!: boolean;

  /**
   * Fecha de seguimiento programada
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  follow_up_date?: Date;

  /**
   * Notas de seguimiento
   */
  @Column({ type: 'text', nullable: true })
  follow_up_notes?: string;

  // =====================================================
  // PARENT COMMUNICATION
  // =====================================================

  /**
   * Indica si se contactó a los padres
   */
  @Column({ type: 'boolean', default: false })
  parent_contacted!: boolean;

  /**
   * Fecha de contacto con padres
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  parent_contact_date?: Date;

  /**
   * Notas del contacto con padres
   */
  @Column({ type: 'text', nullable: true })
  parent_contact_notes?: string;

  // =====================================================
  // EFFECTIVENESS TRACKING
  // =====================================================

  /**
   * Rating de efectividad (1-5)
   */
  @Column({ type: 'integer', nullable: true })
  effectiveness_rating?: number;

  /**
   * Respuesta del estudiante a la intervención
   */
  @Column({ type: 'text', nullable: true })
  student_response?: string;

  // =====================================================
  // METADATA
  // =====================================================

  /**
   * Notas adicionales
   */
  @Column({ type: 'text', nullable: true })
  notes?: string;

  /**
   * Metadatos adicionales en formato JSON
   */
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  // =====================================================
  // MULTI-TENANT
  // =====================================================

  /**
   * ID del tenant (FK → auth_management.tenants)
   */
  @Column({ type: 'uuid' })
  tenant_id!: string;

  // =====================================================
  // AUDIT FIELDS
  // =====================================================

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
