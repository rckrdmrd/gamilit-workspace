import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { Tenant } from '../../auth/entities/tenant.entity';
import { Profile } from '../../auth/entities/profile.entity';

/**
 * Log Level Types
 */
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

/**
 * Environment Types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * SystemLog Entity (audit_logging.system_logs)
 *
 * @description Logs del sistema - errores, advertencias, informacion de debugging.
 * @schema audit_logging
 * @table system_logs
 *
 * PROPOSITO:
 * Registra logs del sistema para monitoreo y debugging:
 * - Errores y excepciones
 * - Advertencias del sistema
 * - Informacion de debugging
 * - Trazas de ejecucion
 *
 * NIVELES:
 * - TRACE: Trazas detalladas
 * - DEBUG: Informacion de debugging
 * - INFO: Informacion general
 * - WARN: Advertencias
 * - ERROR: Errores recuperables
 * - FATAL: Errores criticos
 *
 * @see DDL: apps/database/ddl/schemas/audit_logging/tables/04-system_logs.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.AUDIT, name: DB_TABLES.AUDIT.SYSTEM_LOGS })
@Index('idx_system_logs_level', ['log_level'])
@Index('idx_system_logs_created', ['created_at'])
@Index('idx_system_logs_user', ['user_id'])
@Check('"log_level" IN (\'TRACE\', \'DEBUG\', \'INFO\', \'WARN\', \'ERROR\', \'FATAL\')')
@Check('"environment" IN (\'development\', \'staging\', \'production\')')
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid', nullable: true })
    tenant_id?: string;

  @Column({ type: 'text' })
    log_level!: LogLevel;

  @Column({ type: 'text', nullable: true })
    logger_name?: string;

  @Column({ type: 'text' })
    message!: string;

  @Column({ type: 'text', nullable: true })
    module_name?: string;

  @Column({ type: 'text', nullable: true })
    function_name?: string;

  @Column({ type: 'integer', nullable: true })
    line_number?: number;

  @Column({ type: 'text', nullable: true })
    file_path?: string;

  @Column({ type: 'text', nullable: true })
    request_id?: string;

  @Column({ type: 'text', nullable: true })
    session_id?: string;

  @Column({ type: 'uuid', nullable: true })
    user_id?: string;

  @Column({ type: 'inet', nullable: true })
    ip_address?: string;

  @Column({ type: 'text', nullable: true })
    exception_type?: string;

  @Column({ type: 'text', nullable: true })
    exception_message?: string;

  @Column({ type: 'text', nullable: true })
    stack_trace?: string;

  @Column({ type: 'integer', nullable: true })
    execution_time_ms?: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    memory_usage_mb?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    cpu_usage_percent?: number;

  @Column({ type: 'text', default: 'production' })
    environment!: Environment;

  @Column({ type: 'text', nullable: true })
    server_name?: string;

  @Column({ type: 'text', nullable: true })
    thread_id?: string;

  @Column({ type: 'text', nullable: true })
    correlation_id?: string;

  @Column({ type: 'jsonb', default: {} })
    extra_data!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  // Relaciones
  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'user_id' })
    user?: Profile;
}
