/**
 * ContentVersion Entity
 *
 * Mapea a la tabla: content_management.content_versions
 *
 * Historial de versiones de contenido educativo.
 * Permite versionado y rollback de ejercicios, módulos, etc.
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/04-content_versions.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Profile } from '../../auth/entities/profile.entity';
import { Tenant } from '../../auth/entities/tenant.entity';

@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.CONTENT_VERSIONS })
@Unique(['contentType', 'contentId', 'versionNumber'])
@Index(['contentType', 'contentId'])
@Index(['tenantId'])
@Index(['createdBy'])
@Index(['createdAt'])
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'tenant_id', nullable: true })
  tenantId!: string | null;

  @Column('text', { name: 'content_type' })
  contentType!: string; // 'exercise', 'module', 'lesson', 'quiz'

  @Column('uuid', { name: 'content_id' })
  contentId!: string;

  @Column('int', { name: 'version_number' })
  versionNumber!: number;

  @Column('text', { name: 'version_name', nullable: true })
  versionName!: string | null; // e.g., "v1.0", "beta"

  @Column('jsonb', { name: 'content_data' })
  contentData!: Record<string, unknown>; // Full snapshot

  @Column('text', { name: 'change_summary', nullable: true })
  changeSummary!: string | null;

  @Column('text', { name: 'change_notes', nullable: true })
  changeNotes!: string | null;

  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @Column('boolean', { name: 'is_published', default: false })
  isPublished!: boolean;

  @Column('timestamp with time zone', { name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  // Relaciones
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator!: Profile | null;
}
