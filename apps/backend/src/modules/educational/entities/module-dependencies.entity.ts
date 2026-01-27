import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS } from '@shared/constants/database.constants';

/**
 * ModuleDependencies Entity (educational_content.module_dependencies)
 *
 * @description Dependencias entre módulos (prerrequisitos)
 * @schema educational_content
 * @table module_dependencies
 *
 * IMPORTANTE:
 * - UNIQUE constraint en (module_id, prerequisite_module_id)
 * - CHECK constraint: module_id != prerequisite_module_id
 * - dependency_type: required, recommended, optional
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/module_dependencies.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: 'module_dependencies' })
@Unique(['module_id', 'prerequisite_module_id'])
@Index('idx_module_dependencies_module_id', ['module_id'])
@Index('idx_module_dependencies_prerequisite_id', ['prerequisite_module_id'])
@Index('idx_module_dependencies_type', ['dependency_type'])
export class ModuleDependencies {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del módulo que tiene el prerrequisito (FK → educational_content.modules)
   */
  @Column({ type: 'uuid' })
  module_id!: string;

  /**
   * ID del módulo que debe completarse primero (FK → educational_content.modules)
   */
  @Column({ type: 'uuid' })
  prerequisite_module_id!: string;

  /**
   * Tipo de dependencia: required (obligatorio), recommended (recomendado), optional (opcional)
   */
  @Column({ type: 'varchar', length: 50, default: 'required' })
  dependency_type!: string;

  /**
   * Porcentaje mínimo de completitud del prerrequisito requerido (0-100)
   */
  @Column({ type: 'integer', default: 100 })
  minimum_completion_percentage!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
