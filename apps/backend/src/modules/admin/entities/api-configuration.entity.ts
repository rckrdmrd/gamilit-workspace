import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * API Service Types
 */
export type ApiServiceType = 'oauth' | 'payment' | 'email' | 'sms' | 'storage' | 'analytics' | 'other';

/**
 * ApiConfiguration Entity (system_configuration.api_configuration)
 *
 * @description Configuracion de APIs y servicios externos.
 * @schema system_configuration
 * @table api_configuration
 *
 * PROPOSITO:
 * Almacena configuracion para integraciones con servicios externos:
 * - Proveedores OAuth (Google, Microsoft, etc.)
 * - Pasarelas de pago
 * - Servicios de email/SMS
 * - Storage (S3, etc.)
 * - Analytics externos
 *
 * SEGURIDAD:
 * - api_key y api_secret estan encriptados
 * - RLS habilitado
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/api_configuration.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.API_CONFIGURATION })
@Index('idx_api_configuration_service_name', ['service_name'])
@Index('idx_api_configuration_service_type', ['service_type'])
@Index('idx_api_configuration_is_active', ['is_active'])
@Check('"service_type" IN (\'oauth\', \'payment\', \'email\', \'sms\', \'storage\', \'analytics\', \'other\')')
export class ApiConfiguration {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
    service_name!: string;

  @Column({ type: 'varchar', length: 50 })
    service_type!: ApiServiceType;

  @Column({ type: 'text' })
    api_endpoint!: string;

  @Column({ type: 'text', nullable: true })
    api_key_encrypted?: string;

  @Column({ type: 'text', nullable: true })
    api_secret_encrypted?: string;

  @Column({ type: 'jsonb', nullable: true })
    additional_config?: Record<string, unknown>;

  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  @Column({ type: 'integer', nullable: true })
    rate_limit_per_minute?: number;

  @Column({ type: 'integer', default: 30 })
    timeout_seconds!: number;

  @Column({ type: 'integer', default: 3 })
    retry_attempts!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
