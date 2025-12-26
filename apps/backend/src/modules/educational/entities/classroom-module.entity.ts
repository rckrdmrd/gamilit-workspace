import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ClassroomModule Entity (educational_content.classroom_modules)
 *
 * @description Manages module assignments to classrooms
 * @schema educational_content
 * @table classroom_modules
 *
 * IMPORTANTE:
 * - Asigna módulos educativos a aulas específicas
 * - Permite configuración por aula (retries, time limits, scoring)
 * - Soporta override de parámetros por aula
 * - Incluye tracking de orden de visualización y fechas límite
 *
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/23-classroom_modules.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.CLASSROOM_MODULES })
@Index('idx_classroom_modules_classroom', ['classroom_id'])
@Index('idx_classroom_modules_module', ['module_id'])
@Index('idx_classroom_modules_assigned_by', ['assigned_by', 'assigned_date'])
export class ClassroomModule {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // FOREIGN KEYS
  // =====================================================

  /**
   * ID del aula (FK → social_features.classrooms)
   */
  @Column({ type: 'uuid' })
  classroom_id!: string;

  /**
   * ID del módulo (FK → educational_content.modules)
   */
  @Column({ type: 'uuid' })
  module_id!: string;

  /**
   * ID del profesor que asignó el módulo (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid', nullable: true })
  assigned_by?: string;

  // =====================================================
  // ASSIGNMENT TRACKING
  // =====================================================

  /**
   * Fecha de asignación del módulo al aula
   */
  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  assigned_date!: Date;

  /**
   * Fecha límite para completar el módulo
   */
  @Column({ type: 'date', nullable: true })
  due_date?: Date;

  // =====================================================
  // STATUS & CONFIGURATION
  // =====================================================

  /**
   * Módulo activo en el aula
   */
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  /**
   * Orden de visualización (0-indexed)
   */
  @Column({ type: 'integer', default: 0 })
  display_order!: number;

  /**
   * Configuración específica del módulo para esta aula (JSONB)
   * Estructura:
   * {
   *   "allow_retries": true,
   *   "max_attempts": 3,
   *   "points_multiplier": 1.0,
   *   "unlock_date": "2025-01-15",
   *   "is_optional": false,
   *   "prerequisites": ["module-uuid-1", "module-uuid-2"]
   * }
   */
  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>;

  // =====================================================
  // COMPLETION TRACKING OVERRIDES
  // =====================================================

  /**
   * Override del puntaje mínimo para aprobar (0-100)
   */
  @Column({ type: 'integer', nullable: true })
  custom_passing_score?: number;

  /**
   * Override del límite de tiempo en minutos
   */
  @Column({ type: 'integer', nullable: true })
  time_limit_minutes?: number;

  // =====================================================
  // AUDIT FIELDS
  // =====================================================

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
