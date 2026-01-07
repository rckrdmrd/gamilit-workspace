import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { Profile } from '../../auth/entities/profile.entity';

/**
 * ActivityLog Entity (audit_logging.activity_log)
 *
 * @description Log de actividad para monitoreo administrativo y dashboard.
 * @schema audit_logging
 * @table activity_log
 *
 * PROPOSITO:
 * Registra actividades de usuarios para:
 * - Dashboard de administración
 * - Monitoreo de comportamiento
 * - Auditoría de acciones
 * - Analytics de uso
 * - Detección de anomalías
 *
 * TIPOS DE ACCIÓN:
 * - login, logout
 * - page_view, button_click
 * - exercise_start, exercise_complete
 * - achievement_unlock, rank_promotion
 * - profile_update, settings_change
 *
 * @see DDL: apps/database/ddl/schemas/audit_logging/tables/06-activity_log.sql
 * @migrated Audit 2026-01-04 - Migrado desde user_activity
 */
@Entity({ schema: DB_SCHEMAS.AUDIT, name: DB_TABLES.AUDIT.ACTIVITY_LOG })
@Index('idx_activity_log_user_id', ['user_id'])
@Index('idx_activity_log_action_type', ['action_type'])
@Index('idx_activity_log_created_at', ['created_at'])
@Index('idx_activity_log_user_created', ['user_id', 'created_at'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid' })
    user_id!: string;

  @Column({ type: 'varchar', length: 100 })
    action_type!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
    entity_type?: string;

  @Column({ type: 'uuid', nullable: true })
    entity_id?: string;

  @Column({ type: 'text' })
    description!: string;

  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  @Column({ type: 'inet', nullable: true })
    ip_address?: string;

  @Column({ type: 'text', nullable: true })
    user_agent?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  // Relaciones
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user!: Profile;

  /**
   * @deprecated Usar action_type en su lugar
   * Alias de compatibilidad para código legacy
   */
  get activity_type(): string {
    return this.action_type;
  }

  set activity_type(value: string) {
    this.action_type = value;
  }
}

/**
 * @deprecated Usar ActivityLog en su lugar
 * Alias de compatibilidad para código legacy - Será eliminado en v2.0
 */
export { ActivityLog as UserActivity };
