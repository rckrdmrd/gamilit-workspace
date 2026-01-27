import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS } from '@shared/constants/database.constants';

/**
 * ModuleCompletionTracking Entity (progress_tracking.module_completion_tracking)
 *
 * @description Seguimiento detallado de completitud de módulos por usuario
 * @schema progress_tracking
 * @table module_completion_tracking
 *
 * IMPORTANTE:
 * - UNIQUE constraint en (user_id, module_id)
 * - Status enum: not_started, in_progress, completed, mastered
 * - Tracking de tiempo y ejercicios
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/module_completion_tracking.sql
 */
@Entity({ schema: DB_SCHEMAS.PROGRESS, name: 'module_completion_tracking' })
@Unique(['user_id', 'module_id'])
@Index('idx_module_completion_user_id', ['user_id'])
@Index('idx_module_completion_module_id', ['module_id'])
@Index('idx_module_completion_status', ['status'])
@Index('idx_module_completion_percentage', ['completion_percentage'])
@Index('idx_module_completion_user_status', ['user_id', 'status'])
export class ModuleCompletionTracking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
  user_id!: string;

  /**
   * ID del módulo educativo (FK → educational_content.modules)
   */
  @Column({ type: 'uuid' })
  module_id!: string;

  /**
   * Porcentaje de completitud (0-100)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completion_percentage!: number;

  /**
   * Ejercicios completados
   */
  @Column({ type: 'integer', default: 0 })
  exercises_completed!: number;

  /**
   * Total de ejercicios en el módulo
   */
  @Column({ type: 'integer', default: 0 })
  exercises_total!: number;

  /**
   * Tiempo total dedicado (segundos)
   */
  @Column({ type: 'integer', default: 0 })
  time_spent_seconds!: number;

  /**
   * Fecha de inicio del módulo
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  started_at?: Date;

  /**
   * Fecha de completitud del módulo
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at?: Date;

  /**
   * Fecha de última actividad
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_activity_at?: Date;

  /**
   * Estado: not_started, in_progress, completed, mastered
   */
  @Column({ type: 'varchar', length: 50, default: 'not_started' })
  status!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
