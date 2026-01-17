import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES, GamilityRoleEnum } from '@shared/constants';
import { Profile } from '../../auth/entities/profile.entity';

/**
 * Estrategias de rollout disponibles
 */
export type RolloutStrategy = 'all' | 'percentage' | 'whitelist' | 'beta_users' | 'gradual';

/**
 * Categorías de feature flags
 */
export type FeatureFlagCategory = 'gamification' | 'educational' | 'admin' | 'social' | 'integration';

/**
 * FeatureFlag Entity (system_configuration.feature_flags)
 *
 * @description Feature flags para activación gradual de funcionalidades.
 * @schema system_configuration
 * @table feature_flags
 *
 * IMPORTANTE:
 * - Permite activar/desactivar features dinámicamente sin redespliegue
 * - Soporta rollout gradual por porcentaje de usuarios
 * - Puede dirigirse a usuarios específicos o roles
 * - Soporta overrides por tenant y classroom
 * - Puede tener período de validez (starts_at/ends_at)
 * - Maneja dependencias y conflictos entre flags
 * - Row Level Security habilitada
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/06-feature_flags.sql
 * @see TASK-2026-01-17-001: Completado para alinear con DDL
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.FEATURE_FLAGS })
@Index('idx_feature_flags_key', ['flag_key'])
@Index('idx_feature_flags_enabled', ['flag_key'], { where: 'is_enabled = true' })
@Index('idx_feature_flags_category', ['category', 'is_enabled'])
@Index('idx_feature_flags_system_wide', ['is_system_wide', 'is_enabled'])
@Check('"rollout_percentage" >= 0 AND "rollout_percentage" <= 100')
@Check("rollout_strategy IN ('all', 'percentage', 'whitelist', 'beta_users', 'gradual')")
export class FeatureFlag {
  /**
   * Identificador único de la feature flag (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // FEATURE IDENTIFICATION
  // =====================================================

  /**
   * Clave única de la feature (snake_case)
   * @example 'enable_gamification', 'allow_ai_hints', 'maya_ranks_system'
   */
  @Column({ type: 'varchar', length: 100, unique: true })
    flag_key!: string;

  /**
   * Nombre descriptivo de la feature
   * @example 'Nuevo Sistema de Rankings Maya'
   */
  @Column({ type: 'varchar', length: 255 })
    flag_name!: string;

  /**
   * Descripción de la funcionalidad
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Categoría de la feature flag
   * @example 'gamification', 'educational', 'admin', 'social', 'integration'
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
    category?: FeatureFlagCategory;

  // =====================================================
  // FEATURE STATUS
  // =====================================================

  /**
   * Indica si la feature está habilitada
   */
  @Column({ type: 'boolean', default: false })
    is_enabled!: boolean;

  /**
   * Si es system-wide, no puede ser sobrescrito por tenant/classroom
   * Si es false, permite overrides por tenant o classroom
   */
  @Column({ type: 'boolean', default: true })
    is_system_wide!: boolean;

  // =====================================================
  // ROLLOUT CONFIGURATION
  // =====================================================

  /**
   * Porcentaje de usuarios con acceso (0-100)
   * 0 = ninguno, 100 = todos
   * Usado para rollout gradual
   */
  @Column({ type: 'integer', default: 100 })
    rollout_percentage!: number;

  /**
   * Estrategia de rollout
   * @example 'all', 'percentage', 'whitelist', 'beta_users', 'gradual'
   */
  @Column({ type: 'varchar', length: 50, default: 'all' })
    rollout_strategy!: RolloutStrategy;

  // =====================================================
  // USER TARGETING
  // =====================================================

  /**
   * Array de UUIDs de usuarios específicos con acceso (whitelist)
   * Útil para testing o early access
   */
  @Column({ type: 'uuid', array: true, default: [] })
    target_users!: string[];

  /**
   * Array de roles con acceso a la feature
   * Valores: student, admin_teacher, super_admin
   */
  @Column({ type: 'enum', enum: GamilityRoleEnum, array: true, default: [] })
    target_roles!: GamilityRoleEnum[];

  // =====================================================
  // TIME WINDOWS
  // =====================================================

  /**
   * Fecha y hora de inicio de la feature
   * Null = sin restricción de inicio
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    starts_at?: Date;

  /**
   * Fecha y hora de fin de la feature
   * Null = sin restricción de fin
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    ends_at?: Date;

  // =====================================================
  // DEPENDENCIES & CONFLICTS
  // =====================================================

  /**
   * Array de flag_keys que deben estar habilitadas para esta flag
   * @example ["base_gamification", "user_levels"]
   */
  @Column({ type: 'jsonb', default: [] })
    depends_on_flags!: string[];

  /**
   * Array de flag_keys que no pueden estar habilitadas junto con esta
   * @example ["legacy_scoring", "old_ranking_system"]
   */
  @Column({ type: 'jsonb', default: [] })
    conflicts_with!: string[];

  // =====================================================
  // CONFIGURATION
  // =====================================================

  /**
   * Valor por defecto cuando la flag está habilitada
   * @example true, {"max_items": 10}
   */
  @Column({ type: 'jsonb', default: true })
    default_value!: unknown;

  /**
   * JSON Schema para validar configuración
   */
  @Column({ type: 'jsonb', nullable: true })
    config_schema?: Record<string, unknown>;

  /**
   * Opciones de configuración adicionales
   */
  @Column({ type: 'jsonb', default: {} })
    config_options!: Record<string, unknown>;

  // =====================================================
  // TENANT/SCOPE OVERRIDES
  // =====================================================

  /**
   * Overrides por tenant
   * @example {"tenant-uuid-1": true, "tenant-uuid-2": false}
   */
  @Column({ type: 'jsonb', default: {} })
    tenant_overrides!: Record<string, boolean>;

  /**
   * Overrides por classroom
   * @example {"classroom-uuid-1": {"enabled": true, "config": {...}}}
   */
  @Column({ type: 'jsonb', default: {} })
    classroom_overrides!: Record<string, { enabled: boolean; config?: Record<string, unknown> }>;

  // =====================================================
  // ACCESS CONTROL
  // =====================================================

  /**
   * Rol mínimo requerido para modificar esta flag
   * @example 'super_admin', 'admin_teacher'
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
    required_role?: string;

  /**
   * Si los usuarios pueden cambiar esta flag para sí mismos
   */
  @Column({ type: 'boolean', default: false })
    is_user_configurable!: boolean;

  // =====================================================
  // METADATA
  // =====================================================

  /**
   * Tags para organización/categorización
   * @example ["beta", "experimental", "phase-2"]
   */
  @Column({ type: 'jsonb', default: [] })
    tags!: string[];

  /**
   * URL a la documentación de la feature
   */
  @Column({ type: 'text', nullable: true })
    documentation_url?: string;

  /**
   * Historial de cambios de la flag
   */
  @Column({ type: 'text', nullable: true })
    changelog?: string;

  // =====================================================
  // LIFECYCLE & AUDIT
  // =====================================================

  /**
   * ID del usuario que creó la feature flag
   */
  @Column({ type: 'uuid', nullable: true })
    created_by?: string;

  /**
   * Fecha y hora de creación
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de última actualización
   * Trigger: system_configuration.update_feature_flags_timestamp()
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  /**
   * Cuándo la flag fue habilitada por última vez
   * Actualizado automáticamente por trigger
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    enabled_at?: Date;

  /**
   * Cuándo la flag fue deshabilitada por última vez
   * Actualizado automáticamente por trigger
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    disabled_at?: Date;

  /**
   * Cuándo la flag fue marcada como deprecated
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    deprecated_at?: Date;

  /**
   * Fecha planeada de eliminación
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    will_be_removed_at?: Date;

  // =====================================================
  // RELACIONES
  // =====================================================

  /**
   * Usuario que creó la feature flag
   * Relación ManyToOne: Muchas feature flags pueden ser creadas por un usuario
   * FK: feature_flags.created_by → auth_management.profiles.id
   */
  @ManyToOne(() => Profile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
    creator?: Profile;

  // =====================================================
  // CAMPOS LEGACY (para compatibilidad, mapeo a columnas DDL)
  // =====================================================

  /**
   * @deprecated Usar flag_key. Alias para compatibilidad.
   */
  get feature_key(): string {
    return this.flag_key;
  }

  set feature_key(value: string) {
    this.flag_key = value;
  }

  /**
   * @deprecated Usar flag_name. Alias para compatibilidad.
   */
  get feature_name(): string {
    return this.flag_name;
  }

  set feature_name(value: string) {
    this.flag_name = value;
  }
}
