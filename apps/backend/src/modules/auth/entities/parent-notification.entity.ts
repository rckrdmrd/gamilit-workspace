/**
 * ParentNotification Entity
 *
 * Mapea a la tabla: auth_management.parent_notifications
 *
 * Notificaciones para padres sobre el progreso de estudiantes.
 * Incluye resúmenes diarios, semanales, mensuales y alertas.
 *
 * @see DDL: apps/database/ddl/schemas/auth_management/tables/16-parent_notifications.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Profile } from './profile.entity';
import { ParentAccount } from './parent-account.entity';

export enum ParentNotificationType {
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  LOW_PERFORMANCE = 'low_performance',
  INACTIVITY_ALERT = 'inactivity_alert',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_PROMOTION = 'rank_promotion',
  ASSIGNMENT_DUE = 'assignment_due',
  ASSIGNMENT_SUBMITTED = 'assignment_submitted',
  RECOMMENDATION = 'recommendation',
  CUSTOM = 'custom',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ParentNotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  ARCHIVED = 'archived',
}

@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.PARENT_NOTIFICATIONS })
@Index(['parentAccountId'])
@Index(['studentId'])
@Index(['notificationType'])
@Index(['status'])
@Index(['priority'])
@Index(['createdAt'])
export class ParentNotification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'parent_account_id' })
  parentAccountId!: string;

  @Column('uuid', { name: 'student_id' })
  studentId!: string;

  @Column({
    type: 'text',
    name: 'notification_type',
  })
  notificationType!: ParentNotificationType;

  @Column('text')
  title!: string;

  @Column('text')
  message!: string;

  @Column('text', { nullable: true })
  summary!: string | null;

  @Column('jsonb', { name: 'student_snapshot', default: {} })
  studentSnapshot!: Record<string, unknown>;

  @Column({
    type: 'text',
    default: NotificationPriority.NORMAL,
  })
  priority!: NotificationPriority;

  @Column('boolean', { name: 'sent_via_email', default: false })
  sentViaEmail!: boolean;

  @Column('boolean', { name: 'sent_via_in_app', default: false })
  sentViaInApp!: boolean;

  @Column('boolean', { name: 'sent_via_push', default: false })
  sentViaPush!: boolean;

  @Column({
    type: 'text',
    default: ParentNotificationStatus.PENDING,
  })
  status!: ParentNotificationStatus;

  @Column('text', { name: 'related_entity_type', nullable: true })
  relatedEntityType!: string | null;

  @Column('uuid', { name: 'related_entity_id', nullable: true })
  relatedEntityId!: string | null;

  @Column('text', { name: 'action_url', nullable: true })
  actionUrl!: string | null;

  @Column('timestamp with time zone', { name: 'scheduled_for', nullable: true })
  scheduledFor!: Date | null;

  @Column('timestamp with time zone', { name: 'sent_at', nullable: true })
  sentAt!: Date | null;

  @Column('timestamp with time zone', { name: 'read_at', nullable: true })
  readAt!: Date | null;

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

  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  // Relaciones
  @ManyToOne(() => ParentAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount!: ParentAccount;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Profile;
}
