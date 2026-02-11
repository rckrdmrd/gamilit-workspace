/**
 * LearningPathModule Entity
 *
 * @description Junction table mapping modules to learning paths with ordering.
 * Defines which educational_content.modules belong to each learning path
 * and in what sequence they should be completed.
 *
 * FIX H-036: Missing junction table for learning paths.
 *
 * @schema progress_tracking
 * @table learning_path_modules
 * @see DDL: apps/database/ddl/schemas/progress_tracking/tables/learning_path_modules.sql
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { LearningPath } from './learning-path.entity';

@Entity({
  schema: DB_SCHEMAS.PROGRESS,
  name: DB_TABLES.PROGRESS.LEARNING_PATH_MODULES,
})
@Index('idx_learning_path_modules_path_id', ['learning_path_id'])
@Index('idx_learning_path_modules_module_id', ['module_id'])
@Index('idx_learning_path_modules_sequence', ['learning_path_id', 'sequence_order'])
@Unique('learning_path_modules_path_module_key', ['learning_path_id', 'module_id'])
@Unique('learning_path_modules_path_sequence_key', ['learning_path_id', 'sequence_order'])
export class LearningPathModule {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * FK to the learning path (ON DELETE CASCADE)
   */
  @Column({ name: 'learning_path_id', type: 'uuid' })
    learning_path_id!: string;

  /**
   * FK to educational_content.modules (ON DELETE CASCADE)
   * Cross-schema: progress_tracking → educational_content
   */
  @Column({ name: 'module_id', type: 'uuid' })
    module_id!: string;

  /**
   * Position in the learning path (1-based, must be > 0)
   */
  @Column({ name: 'sequence_order', type: 'integer' })
    sequence_order!: number;

  /**
   * Whether this module is optional in the path
   */
  @Column({ name: 'is_optional', type: 'boolean', default: false })
    is_optional!: boolean;

  /**
   * Minimum completion % required to advance (0-100, default 100)
   */
  @Column({
    name: 'minimum_completion_percentage',
    type: 'integer',
    default: 100,
    nullable: true,
  })
    minimum_completion_percentage?: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * Learning path this module belongs to
   */
  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learning_path_id' })
    learningPath?: LearningPath;

  /**
   * Module entity (cross-datasource)
   * NOTE: Module is in educational_content schema (different datasource).
   * Use module_id UUID for manual resolution in services.
   */
  // @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'module_id' })
  // module?: Module;
}
