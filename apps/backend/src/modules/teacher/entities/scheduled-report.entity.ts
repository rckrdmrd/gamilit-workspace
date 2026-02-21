/**
 * ScheduledReport Entity
 *
 * TASK-2026-01-18-015 Sprint 5 Task 5.1
 * Represents scheduled report configurations for automatic generation.
 * Maps to: social_features.scheduled_reports
 *
 * FIX H-025: 4 column name mismatches corrected + 5 missing columns added:
 *   - schedule_name → report_name (DDL column name)
 *   - last_generated_at → last_run_at (DDL column name)
 *   - total_runs → run_count (DDL column name)
 *   - send_email → notify_email (DDL column name)
 *   + template_id, time_of_day (deprecated), timezone, is_active (deprecated), last_error
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Frequency options for scheduled reports
 */
export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

/**
 * Status of a scheduled report
 */
export enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

/**
 * Entity for scheduled report configurations
 */
@Entity({ name: DB_TABLES.SOCIAL.SCHEDULED_REPORTS, schema: DB_SCHEMAS.SOCIAL })
export class ScheduledReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
  classroomId!: string | null;

  // FIX H-025: DDL column is report_name (not schedule_name)
  @Column({ name: 'report_name', length: 255 })
  reportName!: string;

  @Column({ name: 'report_type', length: 50 })
  reportType!: string;

  @Column({ name: 'report_format', length: 10, default: 'pdf' })
  reportFormat!: string;

  @Column({ name: 'template_id', type: 'varchar', length: 50, nullable: true })
  templateId!: string | null;

  @Column({ name: 'student_ids', type: 'uuid', array: true, nullable: true })
  studentIds!: string[] | null;

  // FIX AUDIT-B2: DDL uses VARCHAR(20) with CHECK constraint, not PostgreSQL ENUM type
  @Column({
    name: 'frequency',
    type: 'varchar',
    length: 20,
    default: ScheduleFrequency.WEEKLY,
  })
  frequency!: ScheduleFrequency;

  @Column({ name: 'day_of_week', type: 'int', nullable: true })
  dayOfWeek!: number | null;

  @Column({ name: 'day_of_month', type: 'int', nullable: true })
  dayOfMonth!: number | null;

  /** @deprecated Use preferredHour instead */
  @Column({ name: 'time_of_day', type: 'time', default: '08:00:00' })
  timeOfDay!: string;

  @Column({ name: 'preferred_hour', type: 'int', nullable: true })
  preferredHour!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'America/Mexico_City' })
  timezone!: string;

  /** @deprecated Use status instead */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // FIX AUDIT-B2: DDL uses VARCHAR(20) with CHECK constraint, not PostgreSQL ENUM type
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: ScheduleStatus.ACTIVE,
  })
  status!: ScheduleStatus;

  // FIX H-025: DDL column is last_run_at (not last_generated_at)
  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true })
  lastRunAt!: Date | null;

  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true })
  nextRunAt!: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  // FIX H-025: DDL column is run_count (not total_runs)
  @Column({ name: 'run_count', type: 'int', default: 0 })
  runCount!: number;

  // FIX H-025: DDL column is notify_email (not send_email)
  @Column({ name: 'notify_email', type: 'boolean', default: false })
  notifyEmail!: boolean;

  @Column({ name: 'email_recipients', type: 'text', array: true, nullable: true })
  emailRecipients!: string[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
