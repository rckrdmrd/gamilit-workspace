import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS } from '@shared/constants/database.constants';

/**
 * ContentMetadata Entity (educational_content.content_metadata)
 *
 * @description Metadatos adicionales para contenido educativo
 * @schema educational_content
 * @table content_metadata
 *
 * IMPORTANTE:
 * - UNIQUE constraint en (content_type, content_id, metadata_key)
 * - content_type: module, exercise, assignment, resource
 * - metadata_value es JSONB para flexibilidad
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/content_metadata.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: 'content_metadata' })
@Unique(['content_type', 'content_id', 'metadata_key'])
@Index('idx_content_metadata_content', ['content_type', 'content_id'])
@Index('idx_content_metadata_key', ['metadata_key'])
export class ContentMetadata {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Tipo de contenido: module, exercise, assignment, resource
   */
  @Column({ type: 'varchar', length: 50 })
  content_type!: string;

  /**
   * ID del contenido en su tabla respectiva
   */
  @Column({ type: 'uuid' })
  content_id!: string;

  /**
   * Clave del metadata (e.g., "difficulty_level", "estimated_time", "standards")
   */
  @Column({ type: 'varchar', length: 100 })
  metadata_key!: string;

  /**
   * Valor del metadata en formato JSONB para almacenamiento flexible
   */
  @Column({ type: 'jsonb' })
  metadata_value!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
