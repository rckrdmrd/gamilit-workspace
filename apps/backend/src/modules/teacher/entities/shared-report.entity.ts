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
  EDIT = 'edit',
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

  @Column({ name: 'shared_by', type: 'uuid' })
    sharedById!: string;

  @Column({ name: 'shared_with', type: 'uuid' })
    sharedWithId!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId!: string;

  // FIX AUDIT-B2: DDL uses VARCHAR(20) with CHECK constraint, not PostgreSQL ENUM type
  @Column({
    name: 'permission_level',
    type: 'varchar',
    length: 20,
    default: SharePermission.VIEW,
  })
    permission!: SharePermission;

  @Column({ name: 'share_message', type: 'text', nullable: true })
    message!: string | null;

  @Column({ name: 'accessed_at', type: 'timestamptz', nullable: true })
    accessedAt!: Date | null;

  @Column({ name: 'access_count', type: 'int', default: 0 })
    accessCount!: number;

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
