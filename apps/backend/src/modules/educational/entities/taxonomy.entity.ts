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
 * Taxonomy Entity (educational_content.taxonomies)
 *
 * @description Taxonomías educativas (Bloom, SOLO, Webb DOK, custom)
 * @schema educational_content
 * @table taxonomies
 *
 * IMPORTANTE:
 * - name es UNIQUE
 * - taxonomy_type: bloom, solo, webb, custom
 * - levels es JSONB array con estructura de niveles
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/educational_content/tables/taxonomies.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: DB_TABLES.EDUCATIONAL.TAXONOMIES })
@Index('idx_taxonomies_type', ['taxonomy_type'])
@Index('idx_taxonomies_is_active', ['is_active'])
export class Taxonomy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Nombre de la taxonomía (único)
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  /**
   * Descripción de la taxonomía
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Tipo de taxonomía: bloom (Bloom's Taxonomy), solo (SOLO Taxonomy), webb (Webb's DOK), custom
   */
  @Column({ type: 'varchar', length: 50 })
  taxonomy_type!: string;

  /**
   * JSONB array de niveles de la taxonomía con descripciones
   * Estructura: [{ level: number, name: string, description: string }]
   */
  @Column({ type: 'jsonb' })
  levels!: Array<{ level: number; name: string; description: string }>;

  /**
   * Indica si esta taxonomía está activa para uso
   */
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
