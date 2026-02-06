import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * UserReport Entity
 *
 * @description Reportes de usuarios para moderación.
 * Soporta reportes polimórficos (usuarios, mensajes, retos, gremios, etc.)
 * @table social_features.user_reports
 * @ticket GAP-SOC-005
 * @fix H-031 (Safety features missing for EdTech)
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.USER_REPORTS })
@Index('idx_user_reports_reporter_id', ['reporterId'])
@Index('idx_user_reports_status', ['status'])
@Index('idx_user_reports_priority', ['priority'])
@Index('idx_user_reports_report_type', ['reportType'])
export class UserReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Reporter
  @Column({ name: 'reporter_id', type: 'uuid' })
  reporterId!: string;

  // Reported entity (polymorphic)
  @Column({ name: 'report_type', type: 'varchar', length: 50 })
  reportType!: string;

  @Column({ name: 'reported_user_id', type: 'uuid', nullable: true })
  reportedUserId!: string | null;

  @Column({ name: 'reported_entity_id', type: 'uuid', nullable: true })
  reportedEntityId!: string | null;

  @Column({ name: 'reported_entity_type', type: 'varchar', length: 50, nullable: true })
  reportedEntityType!: string | null;

  // Report details
  @Column({ type: 'varchar', length: 100 })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'evidence_urls', type: 'text', array: true, nullable: true })
  evidenceUrls!: string[] | null;

  // Moderation
  @Column({ type: 'varchar', length: 50, default: 'open' })
  status!: string;

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  priority!: string;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo!: string | null;

  // Resolution
  @Column({ type: 'varchar', length: 100, nullable: true })
  resolution!: string | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes!: string | null;

  @Column({ name: 'action_taken', type: 'varchar', length: 100, nullable: true })
  actionTaken!: string | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy!: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  // Timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
