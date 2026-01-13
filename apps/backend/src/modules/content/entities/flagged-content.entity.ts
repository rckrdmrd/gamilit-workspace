/**
 * FlaggedContent Entity
 *
 * Mapea a la tabla: content_management.flagged_content
 *
 * @description Sistema de moderación de contenido reportado
 * @source apps/database/ddl/schemas/content_management/tables/05-flagged_content.sql
 * @version 1.0.0 (2026-01-13) - GAP-004
 *
 * CARACTERÍSTICAS:
 * - Soporte para múltiples tipos de contenido (exercise, comment, profile, post, message)
 * - Estados de moderación (pending, approved, rejected, removed)
 * - Prioridad configurable
 * - Historial de revisión
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Content types that can be flagged
 */
export type FlaggableContentType =
  | 'exercise'
  | 'comment'
  | 'profile'
  | 'post'
  | 'message';

/**
 * Moderation status
 */
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'removed';

/**
 * Priority levels
 */
export type ModerationPriority = 'high' | 'medium' | 'low';

@Entity({
  schema: DB_SCHEMAS.CONTENT,
  name: DB_TABLES.CONTENT.FLAGGED_CONTENT,
})
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

  /**
   * Tipo de contenido reportado
   */
  @Column({ name: 'content_type', type: 'varchar', length: 50 })
  contentType!: FlaggableContentType;

  /**
   * ID del contenido reportado
   */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId!: string;

  /**
   * Vista previa del contenido para revisión rápida
   */
  @Column({ name: 'content_preview', type: 'text', nullable: true })
  contentPreview?: string;

  /**
   * Usuario que reportó el contenido
   */
  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy!: string;

  /**
   * Razón del reporte
   */
  @Column({ name: 'reason', type: 'varchar', length: 255 })
  reason!: string;

  /**
   * Descripción detallada del reporte
   */
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  /**
   * Estado de moderación
   */
  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status!: ModerationStatus;

  /**
   * Prioridad del reporte
   */
  @Column({ name: 'priority', type: 'varchar', length: 20, default: 'medium' })
  priority!: ModerationPriority;

  /**
   * Moderador que revisó el reporte
   */
  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  /**
   * Fecha de revisión
   */
  @Column({ name: 'reviewed_at', type: 'timestamp with time zone', nullable: true })
  reviewedAt?: Date;

  /**
   * Notas de la revisión
   */
  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
