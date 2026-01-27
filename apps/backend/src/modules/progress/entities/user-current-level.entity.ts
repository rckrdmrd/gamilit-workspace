import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * UserCurrentLevel Entity (progress_tracking.user_current_level)
 *
 * @description Nivel actual del estudiante (denormalizado para performance)
 * @schema progress_tracking
 * @table user_current_level
 *
 * IMPORTANTE:
 * - user_id es PRIMARY KEY (no UUID generado)
 * - Incluye control de zona de desarrollo próximo
 * - Resultados de placement test
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/16-user_current_level.sql
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: DB_TABLES.PROGRESS.USER_CURRENT_LEVEL })
@Index('idx_user_current_level_level', ['current_level'])
@Index('idx_user_current_level_max_allowed', ['max_allowed_level'])
export class UserCurrentLevel {
  /**
   * ID del usuario - PRIMARY KEY (FK → auth_management.profiles)
   */
  @PrimaryColumn({ type: 'uuid' })
  user_id!: string;

  /**
   * Nivel actual del usuario (difficulty_level enum: beginner, elementary, intermediate, etc.)
   */
  @Column({ type: 'varchar', length: 50, default: 'beginner' })
  current_level!: string;

  /**
   * Nivel anterior (para tracking de cambios)
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  previous_level?: string;

  /**
   * Nivel máximo permitido según zona de desarrollo próximo (ZDP)
   */
  @Column({ type: 'varchar', length: 50, default: 'elementary' })
  max_allowed_level!: string;

  /**
   * Indica si el usuario completó el placement test inicial
   */
  @Column({ type: 'boolean', default: false })
  placement_test_completed!: boolean;

  /**
   * Score del placement test (0-100)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  placement_test_score?: number;

  /**
   * Fecha del placement test
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  placement_test_date?: Date;

  /**
   * Fecha del último cambio de nivel
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  level_changed_at?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
