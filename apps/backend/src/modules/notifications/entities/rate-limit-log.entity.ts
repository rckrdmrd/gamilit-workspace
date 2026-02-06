import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * RateLimitLog Entity
 *
 * @description Audit log de decisiones de rate limiting en notificaciones.
 * Registra cuándo una notificación fue permitida o bloqueada por rate limits.
 * @table notifications.rate_limit_logs
 * @fix H-017 (Missing entity)
 */
@Entity({ schema: DB_SCHEMAS.NOTIFICATIONS, name: DB_TABLES.NOTIFICATIONS.RATE_LIMIT_LOGS })
@Index('idx_rate_limit_logs_user_id', ['userId'])
@Index('idx_rate_limit_logs_channel', ['channel'])
export class RateLimitLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  channel!: string;

  @Column({ type: 'varchar', length: 20 })
  action!: string;

  @Column({ name: 'limit_value', type: 'integer' })
  limitValue!: number;

  @Column({ name: 'current_count', type: 'integer' })
  currentCount!: number;

  @Column({ name: 'window_seconds', type: 'integer' })
  windowSeconds!: number;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
