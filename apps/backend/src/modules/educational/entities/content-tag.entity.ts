import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ContentTag Entity (educational_content.content_tags)
 *
 * @description Sistema de etiquetado de contenido educativo.
 * Permite asociar tags con categorías a cualquier tipo de contenido.
 * @schema educational_content
 * @table content_tags
 *
 * IMPORTANTE:
 * - UNIQUE constraint en (content_type, content_id, tag)
 * - content_type: module, exercise, assignment, resource
 *
 * @created TASK-022 P1-3 - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/content_tags.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.CONTENT_TAGS })
@Unique(['content_type', 'content_id', 'tag'])
@Index('idx_content_tags_content', ['content_type', 'content_id'])
@Index('idx_content_tags_tag', ['tag'])
export class ContentTag {
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
   * Texto del tag (e.g., "matemáticas", "lectura", "avanzado")
   */
  @Column({ type: 'varchar', length: 100 })
  tag!: string;

  /**
   * Categoría opcional del tag (e.g., "subject", "difficulty", "topic")
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  tag_category?: string | null;

  /**
   * ID del usuario que creó el tag (FK → auth.users)
   */
  @Column({ type: 'uuid', nullable: true })
  created_by?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
