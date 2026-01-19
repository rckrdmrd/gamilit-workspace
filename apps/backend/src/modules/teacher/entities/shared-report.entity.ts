/**
 * SharedReport Entity
 *
 * TASK-2026-01-18-015 Sprint 5 Task 5.3
 * Represents shared report configurations between teachers.
 * Maps to: social_features.shared_reports
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { TeacherReport } from './teacher-report.entity';

/**
 * Permission level for shared reports
 */
export enum SharePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
}

/**
 * Entity for tracking report sharing between teachers
 */
@Entity({ name: DB_TABLES.SOCIAL.SHARED_REPORTS, schema: DB_SCHEMAS.SOCIAL })
export class SharedReport {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ name: 'report_id', type: 'uuid' })
    reportId!: string;

  @Column({ name: 'shared_by_id', type: 'uuid' })
    sharedById!: string;

  @Column({ name: 'shared_with_id', type: 'uuid' })
    sharedWithId!: string;

  @Column({
    name: 'permission',
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.VIEW,
  })
    permission!: SharePermission;

  @Column({ name: 'message', type: 'text', nullable: true })
    message!: string | null;

  @Column({ name: 'viewed_at', type: 'timestamptz', nullable: true })
    viewedAt!: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
    expiresAt!: Date | null;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
    isRevoked!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

  // Relations
  @ManyToOne(() => TeacherReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
    report!: TeacherReport;
}
