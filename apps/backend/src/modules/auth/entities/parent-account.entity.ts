/**
 * ParentAccount Entity
 *
 * Mapea a la tabla: auth_management.parent_accounts
 *
 * Cuentas de padres/tutores con configuración del portal de padres.
 * Parte del Epic EXT-010 (Parent Notifications).
 *
 * @see DDL: apps/database/ddl/schemas/auth_management/tables/14-parent_accounts.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Profile } from './profile.entity';
import { RelationshipType, NotificationFrequency, ReportFormat } from '@/modules/parents/enums/parent-account.enums';

export { RelationshipType, NotificationFrequency, ReportFormat };

@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.PARENT_ACCOUNTS })
@Index(['profileId'])
@Index(['isActive'])
@Index(['isVerified'])
@Index(['notificationFrequency'])
export class ParentAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'profile_id', unique: true })
  profileId!: string;

  @Column({
    type: 'text',
    name: 'relationship_type',
    nullable: true,
  })
  relationshipType!: RelationshipType | null;

  @Column({
    type: 'text',
    name: 'notification_frequency',
    default: NotificationFrequency.WEEKLY,
  })
  notificationFrequency!: NotificationFrequency;

  @Column('boolean', { name: 'alert_on_low_performance', default: true })
  alertOnLowPerformance!: boolean;

  @Column('int', { name: 'alert_on_inactivity_days', default: 7 })
  alertOnInactivityDays!: number;

  @Column('boolean', { name: 'alert_on_achievement_unlocked', default: true })
  alertOnAchievementUnlocked!: boolean;

  @Column('boolean', { name: 'alert_on_rank_promotion', default: true })
  alertOnRankPromotion!: boolean;

  @Column({
    type: 'text',
    name: 'preferred_report_format',
    default: ReportFormat.EMAIL,
  })
  preferredReportFormat!: ReportFormat;

  @Column('text', { name: 'preferred_language', default: 'es-MX' })
  preferredLanguage!: string;

  @Column('jsonb', {
    name: 'dashboard_widgets',
    default: ['progress', 'achievements', 'activity', 'recommendations'],
  })
  dashboardWidgets!: string[];

  @Column('boolean', { name: 'can_view_detailed_progress', default: true })
  canViewDetailedProgress!: boolean;

  @Column('boolean', { name: 'can_view_exercise_attempts', default: true })
  canViewExerciseAttempts!: boolean;

  @Column('boolean', { name: 'can_receive_alerts', default: true })
  canReceiveAlerts!: boolean;

  @Column('boolean', { name: 'can_download_reports', default: true })
  canDownloadReports!: boolean;

  @Column('boolean', { name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

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

  @Column('timestamp with time zone', { name: 'last_login_at', nullable: true })
  lastLoginAt!: Date | null;

  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  // Relaciones
  @OneToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile!: Profile;
}
