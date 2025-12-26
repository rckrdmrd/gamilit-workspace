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
 * Tipos de valor para parámetros de gamificación
 */
export type ParameterValueType = 'number' | 'string' | 'boolean' | 'object' | 'array';

/**
 * Alcance del parámetro
 */
export type ParameterScope = 'global' | 'tenant' | 'classroom' | 'student' | 'teacher';

/**
 * GamificationParameter Entity (system_configuration.gamification_parameters)
 *
 * @description Parámetros configurables de gamificación con soporte para overrides
 * @schema system_configuration
 * @table gamification_parameters
 *
 * IMPORTANTE:
 * - Configuración centralizada de mecánicas de gamificación
 * - Soporte para overrides por tenant y classroom
 * - Incluye validación de rangos y valores permitidos
 * - Tracking de uso y deprecación
 *
 * CATEGORÍAS:
 * - points: Configuración de puntos
 * - levels: Configuración de niveles
 * - ranks: Configuración de rangos maya
 * - badges: Configuración de insignias
 * - rewards: Configuración de recompensas
 * - penalties: Configuración de penalizaciones
 * - multipliers: Multiplicadores de XP/coins
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/02-gamification_parameters.sql
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.GAMIFICATION_PARAMETERS })
@Index('idx_gamification_parameters_key', ['param_key'])
@Index('idx_gamification_parameters_category', ['category', 'is_active'])
@Index('idx_gamification_parameters_scope', ['scope', 'is_active'])
export class GamificationParameter {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // PARAMETER IDENTIFICATION
  // =====================================================

  /**
   * Clave única del parámetro (ej: 'points_per_exercise', 'xp_multiplier_weekend')
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  param_key!: string;

  /**
   * Nombre legible del parámetro
   */
  @Column({ type: 'varchar', length: 255 })
  param_name!: string;

  /**
   * Descripción del parámetro
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Categoría del parámetro
   * Valores: 'points', 'levels', 'ranks', 'badges', 'rewards', 'penalties', 'multipliers'
   */
  @Column({ type: 'varchar', length: 50 })
  category!: string;

  // =====================================================
  // PARAMETER VALUE
  // =====================================================

  /**
   * Valor actual del parámetro (JSONB)
   */
  @Column({ type: 'jsonb' })
  param_value!: unknown;

  /**
   * Valor por defecto del parámetro (JSONB)
   */
  @Column({ type: 'jsonb' })
  default_value!: unknown;

  /**
   * Tipo de valor
   */
  @Column({ type: 'varchar', length: 50 })
  value_type!: ParameterValueType;

  // =====================================================
  // VALIDATION
  // =====================================================

  /**
   * Valor mínimo permitido (para tipos numéricos)
   */
  @Column({ type: 'numeric', nullable: true })
  min_value?: number;

  /**
   * Valor máximo permitido (para tipos numéricos)
   */
  @Column({ type: 'numeric', nullable: true })
  max_value?: number;

  /**
   * Valores permitidos para parámetros tipo enum (JSONB array)
   */
  @Column({ type: 'jsonb', nullable: true })
  allowed_values?: unknown[];

  /**
   * Reglas de validación adicionales (JSONB)
   */
  @Column({ type: 'jsonb', default: {} })
  validation_rules!: Record<string, unknown>;

  // =====================================================
  // SCOPE & APPLICABILITY
  // =====================================================

  /**
   * Alcance del parámetro
   */
  @Column({ type: 'varchar', length: 50, default: 'global' })
  scope!: ParameterScope;

  /**
   * Indica si el parámetro es gestionado por el sistema (no editable via UI)
   */
  @Column({ type: 'boolean', default: false })
  is_system_managed!: boolean;

  /**
   * Indica si el parámetro puede ser sobreescrito en scopes inferiores
   */
  @Column({ type: 'boolean', default: true })
  is_overridable!: boolean;

  // =====================================================
  // OVERRIDES
  // =====================================================

  /**
   * Overrides por tenant (JSONB)
   * Ejemplo: {"tenant-uuid-1": 100, "tenant-uuid-2": 150}
   */
  @Column({ type: 'jsonb', default: {} })
  tenant_overrides!: Record<string, unknown>;

  /**
   * Overrides por classroom (JSONB)
   * Ejemplo: {"classroom-uuid-1": {"value": 200, "reason": "Advanced class"}}
   */
  @Column({ type: 'jsonb', default: {} })
  classroom_overrides!: Record<string, unknown>;

  // =====================================================
  // IMPACT & RELATIONSHIPS
  // =====================================================

  /**
   * Sistemas afectados por este parámetro (JSONB array)
   * Ejemplo: ["xp_calculation", "level_progression", "rank_advancement"]
   */
  @Column({ type: 'jsonb', default: [] })
  affects_systems!: string[];

  /**
   * Dependencias del parámetro (JSONB array)
   * Ejemplo: [{"param": "enable_gamification", "required_value": true}]
   */
  @Column({ type: 'jsonb', default: [] })
  depends_on!: Array<{ param: string; required_value: unknown }>;

  // =====================================================
  // USAGE TRACKING
  // =====================================================

  /**
   * Contador de veces que se ha modificado
   */
  @Column({ type: 'integer', default: 0 })
  usage_count!: number;

  /**
   * ID del último usuario que modificó (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid', nullable: true })
  last_modified_by?: string;

  /**
   * Fecha de última modificación
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_modified_at?: Date;

  // =====================================================
  // METADATA
  // =====================================================

  /**
   * Tags para categorización (JSONB array)
   */
  @Column({ type: 'jsonb', default: [] })
  tags!: string[];

  /**
   * Documentación del parámetro
   */
  @Column({ type: 'text', nullable: true })
  documentation?: string;

  /**
   * Ejemplos de uso (JSONB array)
   */
  @Column({ type: 'jsonb', default: [] })
  examples!: unknown[];

  // =====================================================
  // LIFECYCLE
  // =====================================================

  /**
   * Parámetro activo
   */
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  /**
   * Parámetro deprecado
   */
  @Column({ type: 'boolean', default: false })
  is_deprecated!: boolean;

  /**
   * Fecha de deprecación
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  deprecated_at?: Date;

  /**
   * Razón de deprecación
   */
  @Column({ type: 'text', nullable: true })
  deprecated_reason?: string;

  /**
   * Clave del parámetro que reemplaza a este
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  replacement_param_key?: string;

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
