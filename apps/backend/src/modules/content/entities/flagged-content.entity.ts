/**
 * FlaggedContent Entity
 *
 * Mapea a la tabla: content_management.flagged_content
 *
 * Contenido marcado para revisión/moderación.
 * Incluye reportes de usuarios y estado de revisión.
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/05-flagged_content.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  // ManyToOne, // Comentado - relaciones cross-connection deshabilitadas
  // JoinColumn, // Comentado - relaciones cross-connection deshabilitadas
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
// import { User } from '../../auth/entities/user.entity'; // Comentado - conexión separada

export enum FlaggedContentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REMOVED = 'removed',
}

export enum FlaggedContentPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.FLAGGED_CONTENT })
@Index(['contentType'])
@Index(['contentId'])
@Index(['status'])
@Index(['priority'])
@Index(['reportedBy'])
@Index(['reviewedBy'])
@Index(['createdAt'])
export class FlaggedContent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'content_type', length: 50 })
  contentType!: string; // 'exercise', 'comment', 'profile', 'post', 'message'

  @Column('uuid', { name: 'content_id' })
  contentId!: string;

  @Column('text', { name: 'content_preview', nullable: true })
  contentPreview!: string | null;

  @Column('uuid', { name: 'reported_by' })
  reportedBy!: string;

  @Column('varchar', { length: 255 })
  reason!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: FlaggedContentStatus.PENDING,
  })
  status!: FlaggedContentStatus;

  @Column({
    type: 'varchar',
    length: 20,
    default: FlaggedContentPriority.MEDIUM,
  })
  priority!: FlaggedContentPriority;

  @Column('uuid', { name: 'reviewed_by', nullable: true })
  reviewedBy!: string | null;

  @Column('timestamp with time zone', { name: 'reviewed_at', nullable: true })
  reviewedAt!: Date | null;

  @Column('text', { name: 'review_notes', nullable: true })
  reviewNotes!: string | null;

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

  // Relaciones
  // NOTA: Relaciones comentadas - entidades en conexión separada ('content')
  // User está en conexión 'auth', causa error de metadata cross-connection
  // Los FK columns (reported_by, reviewed_by) se mantienen para integridad referencial en BD
  //
  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'reported_by' })
  // reporter!: User;

  // @ManyToOne(() => User, { nullable: true })
  // @JoinColumn({ name: 'reviewed_by' })
  // reviewer!: User | null;
}
