/**
 * PendingUserInitialization Entity
 *
 * Mapea a la tabla: audit_logging.pending_user_initialization
 *
 * Registra usuarios cuya inicialización de gamificación falló.
 * Permite reintentos automáticos y resolución manual.
 *
 * @see DDL: apps/database/ddl/schemas/audit_logging/tables/08-pending_user_initialization.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

export enum InitializationStatus {
  PENDING = 'pending',
  RETRYING = 'retrying',
  RESOLVED = 'resolved',
  FAILED = 'failed',
  MANUAL = 'manual',
}

@Entity({ schema: DB_SCHEMAS.AUDIT, name: DB_TABLES.AUDIT.PENDING_USER_INITIALIZATION })
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['nextRetryAt'])
export class PendingUserInitialization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @Column('uuid', { name: 'profile_id', nullable: true })
  profileId!: string | null;

  @Column('uuid', { name: 'tenant_id', nullable: true })
  tenantId!: string | null;

  @Column('text', { name: 'error_message' })
  errorMessage!: string;

  @Column('text', { name: 'error_code', nullable: true })
  errorCode!: string | null;

  @Column('text', { name: 'error_detail', nullable: true })
  errorDetail!: string | null;

  @Column('text', { name: 'trigger_name', default: 'initialize_user_stats' })
  triggerName!: string;

  @Column('text', { name: 'function_name', default: 'gamilit.initialize_user_stats' })
  functionName!: string;

  @Column('int', { name: 'retry_count', default: 0 })
  retryCount!: number;

  @Column('int', { name: 'max_retries', default: 3 })
  maxRetries!: number;

  @Column('timestamp with time zone', { name: 'last_retry_at', nullable: true })
  lastRetryAt!: Date | null;

  @Column('timestamp with time zone', { name: 'next_retry_at', nullable: true })
  nextRetryAt!: Date | null;

  @Column({
    type: 'text',
    default: InitializationStatus.PENDING,
  })
  status!: InitializationStatus;

  @Column('timestamp with time zone', { name: 'resolved_at', nullable: true })
  resolvedAt!: Date | null;

  @Column('uuid', { name: 'resolved_by', nullable: true })
  resolvedBy!: string | null;

  @Column('text', { name: 'resolution_notes', nullable: true })
  resolutionNotes!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;
}
