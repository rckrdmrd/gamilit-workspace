/**
 * ParentStudentLink Entity
 *
 * Mapea a la tabla: auth_management.parent_student_links
 *
 * Vinculación N:M entre padres/tutores y estudiantes.
 * Incluye verificación y permisos granulares.
 *
 * @see DDL: apps/database/ddl/schemas/auth_management/tables/15-parent_student_links.sql
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
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Profile } from './profile.entity';
import { ParentAccount } from './parent-account.entity';

export enum ParentRelationshipType {
  MOTHER = 'mother',
  FATHER = 'father',
  GUARDIAN = 'guardian',
  TUTOR = 'tutor',
  STEPPARENT = 'stepparent',
  GRANDPARENT = 'grandparent',
  OTHER = 'other',
}

export enum LinkStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.PARENT_STUDENT_LINKS })
@Unique(['parentAccountId', 'studentId'])
@Index(['parentAccountId'])
@Index(['studentId'])
@Index(['linkStatus'])
export class ParentStudentLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'parent_account_id' })
  parentAccountId!: string;

  @Column('uuid', { name: 'student_id' })
  studentId!: string;

  @Column({
    type: 'text',
    name: 'relationship_type',
  })
  relationshipType!: ParentRelationshipType;

  @Column('boolean', { name: 'can_view_progress', default: true })
  canViewProgress!: boolean;

  @Column('boolean', { name: 'can_view_grades', default: true })
  canViewGrades!: boolean;

  @Column('boolean', { name: 'can_receive_notifications', default: true })
  canReceiveNotifications!: boolean;

  @Column('boolean', { name: 'can_contact_teachers', default: false })
  canContactTeachers!: boolean;

  @Column({
    type: 'text',
    name: 'link_status',
    default: LinkStatus.PENDING,
  })
  linkStatus!: LinkStatus;

  @Column('boolean', { name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column('uuid', { name: 'verified_by', nullable: true })
  verifiedBy!: string | null;

  @Column('timestamp with time zone', { name: 'verified_at', nullable: true })
  verifiedAt!: Date | null;

  @Column('text', { name: 'verification_code', nullable: true })
  verificationCode!: string | null;

  @Column('timestamp with time zone', { name: 'verification_code_expires_at', nullable: true })
  verificationCodeExpiresAt!: Date | null;

  @Column('int', { name: 'verification_attempts', default: 0 })
  verificationAttempts!: number;

  @Column('boolean', { name: 'student_approval_required', default: false })
  studentApprovalRequired!: boolean;

  @Column('boolean', { name: 'student_approved', nullable: true })
  studentApproved!: boolean | null;

  @Column('timestamp with time zone', { name: 'student_approved_at', nullable: true })
  studentApprovedAt!: Date | null;

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

  @Column('timestamp with time zone', { name: 'activated_at', nullable: true })
  activatedAt!: Date | null;

  @Column('timestamp with time zone', { name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;

  @Column('uuid', { name: 'revoked_by', nullable: true })
  revokedBy!: string | null;

  @Column('text', { name: 'revocation_reason', nullable: true })
  revocationReason!: string | null;

  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  // Relaciones
  @ManyToOne(() => ParentAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_account_id' })
  parentAccount!: ParentAccount;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Profile;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifier!: Profile | null;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'revoked_by' })
  revoker!: Profile | null;
}
