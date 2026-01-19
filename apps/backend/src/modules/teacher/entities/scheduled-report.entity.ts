/**
 * ScheduledReport Entity
 *
 * TASK-2026-01-18-015 Sprint 5 Task 5.1
 * Represents scheduled report configurations for automatic generation.
 * Maps to: social_features.scheduled_reports
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
  BIWEEKLY = 'biweekly',
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

  @Column({ name: 'schedule_name', length: 255 })
    scheduleName!: string;

  @Column({ name: 'report_type', length: 50 })
    reportType!: string;

  @Column({ name: 'report_format', length: 10 })
    reportFormat!: string;

  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
    classroomId!: string | null;

  @Column({ name: 'student_ids', type: 'uuid', array: true, nullable: true })
    studentIds!: string[] | null;

  @Column({
    name: 'frequency',
    type: 'enum',
    enum: ScheduleFrequency,
    default: ScheduleFrequency.WEEKLY,
  })
    frequency!: ScheduleFrequency;

  @Column({ name: 'day_of_week', type: 'int', nullable: true })
    dayOfWeek!: number | null; // 0-6 (Sunday-Saturday) for weekly/biweekly

  @Column({ name: 'day_of_month', type: 'int', nullable: true })
    dayOfMonth!: number | null; // 1-31 for monthly

  @Column({ name: 'preferred_hour', type: 'int', default: 8 })
    preferredHour!: number; // Hour of day to generate (0-23)

  @Column({
    name: 'status',
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
    status!: ScheduleStatus;

  @Column({ name: 'last_generated_at', type: 'timestamptz', nullable: true })
    lastGeneratedAt!: Date | null;

  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true })
    nextRunAt!: Date | null;

  @Column({ name: 'total_runs', type: 'int', default: 0 })
    totalRuns!: number;

  @Column({ name: 'send_email', type: 'boolean', default: true })
    sendEmail!: boolean;

  @Column({ name: 'email_recipients', type: 'text', array: true, nullable: true })
    emailRecipients!: string[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
