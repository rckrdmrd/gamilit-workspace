/**
 * ExerciseValidationAudit Entity
 *
 * Mapea a la tabla: educational_content.exercise_validation_audit
 *
 * Auditoría completa de todas las validaciones de ejercicios.
 * Almacena snapshot inmutable para trazabilidad y recálculo.
 *
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/26-exercise_validation_audit.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Exercise } from './exercise.entity';

@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.EXERCISE_VALIDATION_AUDIT })
@Index(['exerciseId', 'userId'])
@Index(['userId', 'submittedAt'])
@Index(['isRecalculated', 'recalculatedAt'])
@Index(['hasDiscrepancy', 'exerciseId'])
@Index(['validationFunctionUsed'])
@Index(['exerciseId', 'attemptNumber'])
@Index(['validationTimestamp'])
export class ExerciseValidationAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'exercise_id' })
  exerciseId!: string;

  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @Column('int', { name: 'attempt_number' })
  attemptNumber!: number;

  // Snapshot de respuesta enviada (INMUTABLE - para trazabilidad)
  @Column('jsonb', { name: 'submitted_answer' })
  submittedAnswer!: Record<string, unknown>;

  @Column('timestamp with time zone', { name: 'submitted_at' })
  submittedAt!: Date;

  // Snapshot del ejercicio en el momento de la validación
  @Column('jsonb', { name: 'exercise_snapshot' })
  exerciseSnapshot!: Record<string, unknown>;

  // Snapshot de configuración de validación usada
  @Column('jsonb', { name: 'validation_config_snapshot' })
  validationConfigSnapshot!: Record<string, unknown>;

  // Resultado de la validación
  @Column('boolean', { name: 'is_correct' })
  isCorrect!: boolean;

  @Column('int')
  score!: number;

  @Column('int', { name: 'max_score' })
  maxScore!: number;

  @Column('text', { nullable: true })
  feedback!: string | null;

  @Column('jsonb', { name: 'validation_details', nullable: true })
  validationDetails!: Record<string, unknown> | null;

  // Información de validación
  @Column('text', { name: 'validation_function_used' })
  validationFunctionUsed!: string;

  @Column('timestamp with time zone', { name: 'validation_timestamp' })
  validationTimestamp!: Date;

  @Column('int', { name: 'validation_duration_ms', nullable: true })
  validationDurationMs!: number | null;

  // Información de recálculo
  @Column('boolean', { name: 'is_recalculated', default: false })
  isRecalculated!: boolean;

  @Column('timestamp with time zone', { name: 'recalculated_at', nullable: true })
  recalculatedAt!: Date | null;

  @Column('uuid', { name: 'recalculated_by', nullable: true })
  recalculatedBy!: string | null;

  @Column('text', { name: 'recalculation_reason', nullable: true })
  recalculationReason!: string | null;

  @Column('uuid', { name: 'original_audit_id', nullable: true })
  originalAuditId!: string | null;

  // Flags de auditoría
  @Column('boolean', { name: 'has_discrepancy', default: false })
  hasDiscrepancy!: boolean;

  @Column('text', { name: 'discrepancy_type', nullable: true })
  discrepancyType!: string | null;

  @Column('text', { name: 'discrepancy_notes', nullable: true })
  discrepancyNotes!: string | null;

  // Metadatos
  @Column('jsonb', { name: 'client_metadata', default: {} })
  clientMetadata!: Record<string, unknown>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => Exercise, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'exercise_id' })
  exercise!: Exercise;

  // Self-reference para recálculos
  @ManyToOne(() => ExerciseValidationAudit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'original_audit_id' })
  originalAudit!: ExerciseValidationAudit | null;
}
