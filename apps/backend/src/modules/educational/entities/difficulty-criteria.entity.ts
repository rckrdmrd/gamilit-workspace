import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { DifficultyLevelEnum } from '@shared/constants/enums.constants';

/**
 * DifficultyCriteria Entity (educational_content.difficulty_criteria)
 *
 * @description Criterios especificos de cada nivel de dificultad CEFR.
 *              Define rangos de vocabulario, complejidad de oraciones,
 *              recompensas y requisitos de promocion.
 *
 * @schema educational_content
 * @table difficulty_criteria
 *
 * Niveles CEFR:
 * - A1 (beginner) - A2 (elementary)
 * - B1 (pre_intermediate) - B2 (intermediate) - B2+ (upper_intermediate)
 * - C1 (advanced) - C2 (proficient) - C2+ (native)
 *
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/20-difficulty_criteria.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.DIFFICULTY_CRITERIA })
@Index('idx_difficulty_criteria_cefr', ['cefr_level'])
export class DifficultyCriteria {
  /**
   * Nivel de dificultad (Primary Key - ENUM)
   * Nota: Esta tabla usa el ENUM como PK, no un UUID
   */
  @PrimaryColumn({
    type: 'text',
    enum: DifficultyLevelEnum,
  })
    level!: DifficultyLevelEnum;

  // =====================================================
  // CRITERIOS DE COMPLEJIDAD
  // =====================================================

  /**
   * Minimo de palabras de vocabulario requerido para este nivel
   */
  @Column({ type: 'integer' })
    vocab_range_min!: number;

  /**
   * Maximo de palabras de vocabulario para este nivel
   */
  @Column({ type: 'integer', nullable: true })
    vocab_range_max?: number;

  /**
   * Longitud minima de oraciones (palabras)
   */
  @Column({ type: 'integer' })
    sentence_length_min!: number;

  /**
   * Longitud maxima de oraciones (palabras)
   */
  @Column({ type: 'integer', nullable: true })
    sentence_length_max?: number;

  /**
   * Multiplicador de tiempo permitido
   * Ejemplo: 3.00 = 3x mas tiempo que nivel nativo
   */
  @Column({ type: 'numeric', precision: 3, scale: 2, default: 1.0 })
    time_multiplier!: number;

  // =====================================================
  // RECOMPENSAS
  // =====================================================

  /**
   * XP base otorgada por completar ejercicio en este nivel
   */
  @Column({ type: 'integer', default: 10 })
    base_xp!: number;

  /**
   * Monedas base otorgadas por completar ejercicio en este nivel
   */
  @Column({ type: 'integer', default: 5 })
    base_coins!: number;

  // =====================================================
  // CRITERIOS DE PROMOCION
  // =====================================================

  /**
   * Tasa de exito minima requerida para promocion (0-100)
   * Ejemplo: 80.00 = 80%
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 80.00 })
    promotion_success_rate!: number;

  /**
   * Numero minimo de ejercicios requeridos para promocion
   */
  @Column({ type: 'integer', default: 30 })
    promotion_min_exercises!: number;

  /**
   * Umbral de tiempo para promocion
   * Ejemplo: 1.50 = debe completar en 1.5x o menos del tiempo base
   */
  @Column({ type: 'numeric', precision: 3, scale: 2, default: 1.50 })
    promotion_time_threshold!: number;

  // =====================================================
  // METADATOS
  // =====================================================

  /**
   * Nivel CEFR correspondiente (A1, A2, B1, B2, C1, C2, C2+)
   */
  @Column({ type: 'varchar', length: 5 })
    cefr_level!: string;

  /**
   * Descripcion del nivel
   */
  @Column({ type: 'text' })
    description!: string;

  // =====================================================
  // AUDIT
  // =====================================================

  /**
   * Fecha y hora de creacion del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de ultima actualizacion del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
