import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * Environment Types
 */
export type ConfigEnvironment = 'development' | 'staging' | 'production' | 'test';

/**
 * EnvironmentConfig Entity (system_configuration.environment_config)
 *
 * @description Configuracion por entorno (dev, staging, prod).
 * @schema system_configuration
 * @table environment_config
 *
 * PROPOSITO:
 * Almacena configuraciones que varian por entorno:
 * - Limites y quotas
 * - URLs de servicios
 * - Flags de debug
 * - Configuraciones sensibles
 *
 * SEGURIDAD:
 * - Valores sensibles marcados con is_sensitive
 * - Valores encriptados marcados con is_encrypted
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/environment_config.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.ENVIRONMENT_CONFIG })
@Index('idx_environment_config_environment', ['environment'])
@Index('idx_environment_config_key', ['config_key'])
@Unique(['environment', 'config_key'])
@Check('"environment" IN (\'development\', \'staging\', \'production\', \'test\')')
export class EnvironmentConfig {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'varchar', length: 50 })
    environment!: ConfigEnvironment;

  @Column({ type: 'varchar', length: 100 })
    config_key!: string;

  @Column({ type: 'text' })
    config_value!: string;

  @Column({ type: 'boolean', default: false })
    is_encrypted!: boolean;

  @Column({ type: 'boolean', default: false })
    is_sensitive!: boolean;

  @Column({ type: 'text', nullable: true })
    description?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
