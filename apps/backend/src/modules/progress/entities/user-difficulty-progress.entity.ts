import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS } from '@shared/constants/database.constants';

/**
 * UserDifficultyProgress Entity (progress_tracking.user_difficulty_progress)
 *
 * @description Tracking del progreso de cada usuario por nivel de dificultad CEFR
 * @schema progress_tracking
 * @table user_difficulty_progress
 *
 * IMPORTANTE:
 * - Composite PRIMARY KEY (user_id, difficulty_level)
 * - success_rate y avg_time_per_exercise son columnas calculadas en DDL
 * - Tracking de promoción entre niveles
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/15-user_difficulty_progress.sql
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: 'user_difficulty_progress' })
@Index('idx_user_difficulty_progress_user', ['user_id'])
@Index('idx_user_difficulty_progress_level', ['difficulty_level'])
export class UserDifficultyProgress {
  /**
   * ID del usuario - parte de PRIMARY KEY (FK → auth_management.profiles)
   */
  @PrimaryColumn({ type: 'uuid' })
  user_id!: string;

  /**
   * Nivel de dificultad CEFR - parte de PRIMARY KEY
   */
  @PrimaryColumn({ type: 'varchar', length: 50 })
  difficulty_level!: string;

  /**
   * Ejercicios intentados en este nivel
   */
  @Column({ type: 'integer', default: 0 })
  exercises_attempted!: number;

  /**
   * Ejercicios completados
   */
  @Column({ type: 'integer', default: 0 })
  exercises_completed!: number;

  /**
   * Ejercicios correctos en primer intento
   */
  @Column({ type: 'integer', default: 0 })
  exercises_correct_first_attempt!: number;

  /**
   * Tiempo total dedicado (segundos)
   */
  @Column({ type: 'bigint', default: 0 })
  total_time_spent_seconds!: number;

  /**
   * Indica si cumple criterios para promoción al siguiente nivel
   */
  @Column({ type: 'boolean', default: false })
  is_ready_for_promotion!: boolean;

  /**
   * Fecha de promoción al siguiente nivel
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  promoted_at?: Date;

  /**
   * Fecha del primer intento en este nivel
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  first_attempt_at?: Date;

  /**
   * Fecha del último intento
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_attempt_at?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
