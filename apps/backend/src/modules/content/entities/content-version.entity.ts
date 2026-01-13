/**
 * ContentVersion Entity
 *
 * Mapea a la tabla: content_management.content_versions
 *
 * @description Control de versiones para contenido educativo
 * @source apps/database/ddl/schemas/content_management/tables/04-content_versions.sql
 * @version 1.0.0 (2026-01-13) - GAP-004
 *
 * CARACTERÍSTICAS:
 * - Snapshot completo del contenido en cada versión
 * - Soporte para múltiples tipos de contenido (exercise, module, lesson, quiz)
 * - Historial de cambios con notas
 * - Estado de publicación
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Content types that can be versioned
 */
export type VersionableContentType = 'exercise' | 'module' | 'lesson' | 'quiz';

@Entity({
  schema: DB_SCHEMAS.CONTENT,
  name: DB_TABLES.CONTENT.CONTENT_VERSIONS,
})
@Index(['contentType', 'contentId'])
@Index(['tenantId'])
@Index(['createdBy'])
@Index(['createdAt'])
@Index(['contentType', 'contentId', 'versionNumber'], { unique: true })
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del tenant
   */
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  /**
   * Tipo de contenido: 'exercise', 'module', 'lesson', 'quiz'
   */
  @Column({ name: 'content_type', type: 'text' })
  contentType!: VersionableContentType;

  /**
   * ID del contenido versionado
   */
  @Column({ name: 'content_id', type: 'uuid' })
  contentId!: string;

  /**
   * Número de versión (auto-incrementa por content_type + content_id)
   */
  @Column({ name: 'version_number', type: 'integer' })
  versionNumber!: number;

  /**
   * Nombre opcional de la versión (ej: "v1.0", "beta")
   */
  @Column({ name: 'version_name', type: 'text', nullable: true })
  versionName?: string;

  /**
   * Snapshot completo del contenido en esta versión
   */
  @Column({ name: 'content_data', type: 'jsonb' })
  contentData!: Record<string, unknown>;

  /**
   * Resumen de los cambios
   */
  @Column({ name: 'change_summary', type: 'text', nullable: true })
  changeSummary?: string;

  /**
   * Notas detalladas de los cambios
   */
  @Column({ name: 'change_notes', type: 'text', nullable: true })
  changeNotes?: string;

  /**
   * Usuario que creó esta versión
   */
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  /**
   * Indica si esta versión está publicada
   */
  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  /**
   * Fecha de publicación
   */
  @Column({ name: 'published_at', type: 'timestamp with time zone', nullable: true })
  publishedAt?: Date;

  /**
   * Metadatos adicionales
   */
  @Column({ name: 'metadata', type: 'jsonb', default: '{}' })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
