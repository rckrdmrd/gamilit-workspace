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
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { ExerciseSubmission } from './exercise-submission.entity';

/**
 * ManualReview Entity (progress_tracking.manual_reviews)
 *
 * @description Evaluaciones manuales de ejercicios creativos (Módulos 4 y 5) por docentes
 * @schema progress_tracking
 * @table manual_reviews
 *
 * IMPORTANTE:
 * - Relacionada con ExerciseSubmission (1:1)
 * - Utilizada para módulos que requieren evaluación manual (MOD-04-DIGITAL, MOD-05-PRODUCCION)
 * - Soporta rúbricas flexibles mediante JSONB
 * - Estados: pending, in_progress, completed, returned
 *
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/06-manual_reviews.sql
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: DB_TABLES.PROGRESS.MANUAL_REVIEWS })
@Index('idx_manual_reviews_submission', ['submissionId'])
@Index('idx_manual_reviews_reviewer', ['reviewerId'])
@Index('idx_manual_reviews_status', ['status'])
export class ManualReview {
  /**
   * Identificador único del manual review (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del submission evaluado (FK → progress_tracking.exercise_submissions)
   * CONSTRAINT: unique_submission_review (un solo review por submission)
   */
  @Column({ name: 'submission_id', type: 'uuid' })
    submissionId!: string;

  /**
   * ID del docente revisor (FK → auth_management.profiles)
   */
  @Column({ name: 'reviewer_id', type: 'uuid' })
    reviewerId!: string;

  // =====================================================
  // EVALUATION DATA
  // =====================================================

  /**
   * Puntuaciones por criterio de rúbrica (JSONB)
   * Estructura: {"creativity": 25, "accuracy": 30, "presentation": 20}
   */
  @Column({ name: 'rubric_scores', type: 'jsonb', default: {} })
    rubricScores!: Record<string, number>;

  /**
   * Puntuación total calculada (0-100)
   */
  @Column({ name: 'total_score', type: 'int', nullable: true })
    totalScore?: number | null;

  /**
   * Comentarios generales del docente sobre el trabajo
   */
  @Column({ name: 'general_feedback', type: 'text', nullable: true })
    generalFeedback?: string | null;

  /**
   * Feedback detallado por sección/criterio (JSONB)
   * Estructura flexible según necesidades del ejercicio
   */
  @Column({ name: 'detailed_feedback', type: 'jsonb', nullable: true })
    detailedFeedback?: Record<string, unknown> | null;

  // =====================================================
  // STATUS & WORKFLOW
  // =====================================================

  /**
   * Estado del review
   * Valores: pending, in_progress, completed, returned
   */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: 'pending' | 'in_progress' | 'completed' | 'returned';

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora en que el docente inició la revisión
   */
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt?: Date | null;

  /**
   * Fecha y hora en que se completó la evaluación
   */
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt?: Date | null;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * Relación con ExerciseSubmission
   */
  @ManyToOne(() => ExerciseSubmission)
  @JoinColumn({ name: 'submission_id' })
    submission?: ExerciseSubmission;
}
