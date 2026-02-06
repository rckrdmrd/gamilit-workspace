/**
 * AssignmentStudent Entity
 *
 * Mapea a la tabla: educational_content.assignment_students
 *
 * Tabla M2M para asignación de assignments a estudiantes individuales.
 * Incluye campos de submission, grading y tracking agregados via ALTER TABLE.
 *
 * FIX H-023: Agregadas 20 columnas de grading/submission del ALTER script
 * (24-alter_assignment_students.sql)
 *
 * @see DDL: /apps/database/ddl/schemas/educational_content/tables/07-assignment_students.sql
 * @see ALTER: /apps/database/ddl/schemas/educational_content/tables/24-alter_assignment_students.sql
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import {
  DB_SCHEMAS,
  DB_TABLES,
} from '../../../shared/constants/database.constants';

@Entity({
  schema: DB_SCHEMAS.EDUCATIONAL,
  name: DB_TABLES.EDUCATIONAL.ASSIGNMENT_STUDENTS,
})
@Index(['assignmentId'])
@Index(['studentId'])
@Unique(['assignmentId', 'studentId'])
export class AssignmentStudent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'assignment_id' })
  assignmentId!: string;

  @Column('uuid', { name: 'student_id' })
  studentId!: string;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt!: Date;

  // === Submission tracking (from ALTER script) ===

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  @Column({ name: 'submission_data', type: 'jsonb', default: {} })
  submissionData!: Record<string, unknown>;

  @Column({ name: 'submission_url', type: 'text', nullable: true })
  submissionUrl!: string | null;

  @Column({ name: 'submission_files', type: 'jsonb', default: [] })
  submissionFiles!: unknown[];

  // === Grading fields ===

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score!: number | null;

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxScore!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage!: number | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy!: string | null;

  @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
  gradedAt!: Date | null;

  // === Status tracking ===

  @Column({ type: 'varchar', length: 50, default: 'assigned' })
  status!: string;

  // === Attempt tracking ===

  @Column({ name: 'attempt_number', type: 'integer', default: 1 })
  attemptNumber!: number;

  @Column({ name: 'max_attempts', type: 'integer', default: 1 })
  maxAttempts!: number;

  // === Late submission ===

  @Column({ name: 'is_late', type: 'boolean', default: false })
  isLate!: boolean;

  @Column({ name: 'late_penalty_applied', type: 'decimal', precision: 5, scale: 2, default: 0 })
  latePenaltyApplied!: number;

  // === Grading rubric results ===

  @Column({ name: 'rubric_scores', type: 'jsonb', default: {} })
  rubricScores!: Record<string, unknown>;

  // === Teacher notes and flags ===

  @Column({ name: 'teacher_notes', type: 'text', nullable: true })
  teacherNotes!: string | null;

  @Column({ name: 'flagged_for_review', type: 'boolean', default: false })
  flaggedForReview!: boolean;

  @Column({ name: 'flag_reason', type: 'text', nullable: true })
  flagReason!: string | null;

  // === Audit ===

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
