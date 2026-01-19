/**
 * ExerciseTypeRubric Entity
 *
 * Mapea a la tabla: educational_content.exercise_type_rubrics
 *
 * Rúbricas estándar por tipo de ejercicio.
 * Define criterios de evaluación para M3, M4, M5 que requieren calificación manual.
 *
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/27-exercise_type_rubrics.sql
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

/**
 * Estructura de criterio de evaluación
 * FIX TASK-2026-01-18-011: Agregado campo id opcional (definido en seeds de BD)
 */
export interface RubricCriteria {
  id?: string; // ID único del criterio (definido en seeds, ej: "clasificacion", "veredicto")
  name: string;
  description: string;
  weight: number; // Porcentaje (suma total = 100)
  levels: {
    score: number;
    label: string;
    description: string;
  }[];
}

@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.EXERCISE_TYPE_RUBRICS })
@Index(['exerciseType'])
@Index(['moduleCode'])
@Index(['isDefault'])
export class ExerciseTypeRubric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'exercise_type', length: 100, unique: true })
  exerciseType!: string;

  @Column('varchar', { name: 'rubric_name', length: 255 })
  rubricName!: string;

  @Column('jsonb')
  criteria!: RubricCriteria[];

  @Column('int', { name: 'total_weight', default: 100 })
  totalWeight!: number; // Validación: suma de weights debe ser 100

  @Column('boolean', { name: 'is_default', default: true })
  isDefault!: boolean;

  @Column('varchar', { name: 'module_code', length: 50, nullable: true })
  moduleCode!: string | null; // Informativo: M3, M4, M5

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
