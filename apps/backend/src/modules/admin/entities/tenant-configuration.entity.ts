import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { Tenant } from '../../auth/entities/tenant.entity';

/**
 * Tenant Config Types
 */
export type TenantConfigType = 'branding' | 'features' | 'limits' | 'permissions' | 'integrations' | 'other';

/**
 * TenantConfiguration Entity (system_configuration.tenant_configurations)
 *
 * @description Configuraciones especificas por tenant (multi-tenancy).
 * @schema system_configuration
 * @table tenant_configurations
 *
 * PROPOSITO:
 * Almacena configuraciones personalizadas por organizacion:
 * - Branding (colores, logos)
 * - Features habilitadas
 * - Limites de uso
 * - Permisos especiales
 * - Integraciones personalizadas
 *
 * EPICA RELACIONADA:
 * EXT-008 (White Label)
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/tenant_configurations.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.TENANT_CONFIGURATIONS })
@Index('idx_tenant_configurations_tenant_id', ['tenant_id'])
@Index('idx_tenant_configurations_key', ['config_key'])
@Index('idx_tenant_configurations_type', ['config_type'])
@Unique(['tenant_id', 'config_key'])
@Check('"config_type" IN (\'branding\', \'features\', \'limits\', \'permissions\', \'integrations\', \'other\')')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid' })
    tenant_id!: string;

  @Column({ type: 'varchar', length: 100 })
    config_key!: string;

  @Column({ type: 'jsonb' })
    config_value!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 50 })
    config_type!: TenantConfigType;

  @Column({ type: 'boolean', default: true })
    is_overridable!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
    tenant!: Tenant;
}
