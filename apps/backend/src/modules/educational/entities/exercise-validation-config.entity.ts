/**
 * ExerciseValidationConfig Entity
 *
 * Mapea a la tabla: educational_content.exercise_validation_config
 *
 * Configuración de validación de respuestas por tipo de ejercicio.
 * Define qué función SQL usar y sus parámetros (Sistema Dual ADR-008).
 *
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/22-exercise_validation_config.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.EXERCISE_VALIDATION_CONFIG })
@Index(['exerciseType'])
@Index(['validationFunction'])
export class ExerciseValidationConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', { name: 'exercise_type', unique: true })
  exerciseType!: string; // Referencia al enum exercise_type

  @Column('text', { name: 'validation_function' })
  validationFunction!: string; // Nombre de función SQL a llamar

  @Column('boolean', { name: 'case_sensitive', default: false })
  caseSensitive!: boolean;

  @Column('boolean', { name: 'allow_partial_credit', default: false })
  allowPartialCredit!: boolean;

  @Column('decimal', {
    name: 'fuzzy_matching_threshold',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  fuzzyMatchingThreshold!: number | null; // 0.00 - 1.00

  @Column('boolean', { name: 'normalize_text', default: true })
  normalizeText!: boolean;

  @Column('jsonb', { name: 'special_rules', default: {} })
  specialRules!: Record<string, unknown>;

  @Column('int', { name: 'default_max_points', default: 100 })
  defaultMaxPoints!: number;

  @Column('int', { name: 'default_passing_score', default: 70 })
  defaultPassingScore!: number;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column('jsonb', { nullable: true })
  examples!: Record<string, unknown>[] | null;

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
}
