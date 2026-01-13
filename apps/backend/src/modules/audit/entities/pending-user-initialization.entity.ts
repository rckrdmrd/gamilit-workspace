/**
 * PendingUserInitialization Entity
 *
 * Mapea a la tabla: audit_logging.pending_user_initialization
 *
 * @description Registra usuarios cuya inicialización de gamificación falló
 * @source apps/database/ddl/schemas/audit_logging/tables/08-pending_user_initialization.sql
 * @version 1.0.0 (2026-01-13) - GAP-004
 *
 * PROPÓSITO:
 * Esta tabla registra los casos donde el trigger initialize_user_stats
 * falló al crear los registros de gamificación para un usuario nuevo.
 * Permite monitorear y reintentar la inicialización posteriormente.
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

/**
 * Status types for pending initialization
 */
export type PendingInitStatus =
  | 'pending'
  | 'retrying'
  | 'resolved'
  | 'failed'
  | 'manual';

@Entity({
  schema: DB_SCHEMAS.AUDIT,
  name: DB_TABLES.AUDIT.PENDING_USER_INITIALIZATION,
})
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['nextRetryAt'])
export class PendingUserInitialization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario que falló la inicialización
   */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /**
   * ID del profile (si existe)
   */
  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  profileId?: string;

  /**
   * ID del tenant
   */
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  /**
   * Mensaje de error
   */
  @Column({ name: 'error_message', type: 'text' })
  errorMessage!: string;

  /**
   * Código de error
   */
  @Column({ name: 'error_code', type: 'text', nullable: true })
  errorCode?: string;

  /**
   * Detalle del error
   */
  @Column({ name: 'error_detail', type: 'text', nullable: true })
  errorDetail?: string;

  /**
   * Nombre del trigger que falló
   */
  @Column({
    name: 'trigger_name',
    type: 'text',
    default: 'initialize_user_stats',
  })
  triggerName!: string;

  /**
   * Nombre de la función que falló
   */
  @Column({
    name: 'function_name',
    type: 'text',
    default: 'gamilit.initialize_user_stats',
  })
  functionName!: string;

  /**
   * Número de intentos de retry
   */
  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount!: number;

  /**
   * Máximo de reintentos
   */
  @Column({ name: 'max_retries', type: 'integer', default: 3 })
  maxRetries!: number;

  /**
   * Fecha del último reintento
   */
  @Column({ name: 'last_retry_at', type: 'timestamp with time zone', nullable: true })
  lastRetryAt?: Date;

  /**
   * Fecha del próximo reintento
   */
  @Column({ name: 'next_retry_at', type: 'timestamp with time zone', nullable: true })
  nextRetryAt?: Date;

  /**
   * Estado del registro
   * - pending: nuevo
   * - retrying: en proceso
   * - resolved: exitoso
   * - failed: agotó retries
   * - manual: requiere intervención
   */
  @Column({ name: 'status', type: 'text', default: 'pending' })
  status!: PendingInitStatus;

  /**
   * Fecha de resolución
   */
  @Column({ name: 'resolved_at', type: 'timestamp with time zone', nullable: true })
  resolvedAt?: Date;

  /**
   * Usuario que resolvió
   */
  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy?: string;

  /**
   * Notas de resolución
   */
  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
