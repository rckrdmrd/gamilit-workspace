/**
 * UserActivityLog Entity
 *
 * Mapea a la tabla: audit_logging.user_activity_logs
 *
 * Registro de actividad de usuarios para analytics y tracking de comportamiento.
 * Diferente de activity_log (admin dashboard) - este es para analytics detallado.
 *
 * @see DDL: apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Profile } from '../../auth/entities/profile.entity';
import { Tenant } from '../../auth/entities/tenant.entity';

export enum ActivityType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  EXERCISE_START = 'exercise_start',
  EXERCISE_COMPLETE = 'exercise_complete',
  MODULE_ACCESS = 'module_access',
  VIDEO_PLAY = 'video_play',
  RESOURCE_DOWNLOAD = 'resource_download',
  SEARCH_QUERY = 'search_query',
}

@Entity({ schema: DB_SCHEMAS.AUDIT, name: DB_TABLES.AUDIT.USER_ACTIVITY_LOGS })
@Index(['userId'])
@Index(['activityType'])
@Index(['sessionId'])
@Index(['createdAt'])
@Index(['moduleId'])
export class UserActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @Column('uuid', { name: 'tenant_id', nullable: true })
  tenantId!: string | null;

  @Column({
    type: 'text',
    name: 'activity_type',
  })
  activityType!: string;

  @Column('text', { name: 'action_detail', nullable: true })
  actionDetail!: string | null;

  @Column('text', { name: 'page_url', nullable: true })
  pageUrl!: string | null;

  @Column('text', { name: 'page_title', nullable: true })
  pageTitle!: string | null;

  @Column('text', { name: 'referrer_url', nullable: true })
  referrerUrl!: string | null;

  @Column('text', { name: 'session_id', nullable: true })
  sessionId!: string | null;

  @Column('interval', { name: 'session_duration', nullable: true })
  sessionDuration!: string | null;

  @Column('text', { name: 'element_id', nullable: true })
  elementId!: string | null;

  @Column('text', { name: 'element_type', nullable: true })
  elementType!: string | null;

  @Column('text', { name: 'element_text', nullable: true })
  elementText!: string | null;

  @Column('point', { nullable: true })
  coordinates!: string | null;

  @Column('uuid', { name: 'module_id', nullable: true })
  moduleId!: string | null;

  @Column('uuid', { name: 'exercise_id', nullable: true })
  exerciseId!: string | null;

  @Column('uuid', { name: 'classroom_id', nullable: true })
  classroomId!: string | null;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent!: string | null;

  @Column('inet', { name: 'ip_address', nullable: true })
  ipAddress!: string | null;

  @Column('text', { name: 'device_type', nullable: true })
  deviceType!: string | null;

  @Column('text', { name: 'browser_name', nullable: true })
  browserName!: string | null;

  @Column('text', { name: 'browser_version', nullable: true })
  browserVersion!: string | null;

  @Column('text', { name: 'screen_resolution', nullable: true })
  screenResolution!: string | null;

  @Column('int', { name: 'load_time_ms', nullable: true })
  loadTimeMs!: number | null;

  @Column('int', { name: 'interaction_time_ms', nullable: true })
  interactionTimeMs!: number | null;

  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Profile;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;
}
