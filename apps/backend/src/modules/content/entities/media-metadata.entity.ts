/**
 * MediaMetadata Entity
 *
 * Mapea a la tabla: content_management.media_metadata
 *
 * Metadatos extendidos de archivos multimedia (dimensiones, duración, codec, etc.)
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/media_metadata.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { MediaFile } from './media-file.entity';

@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.MEDIA_METADATA })
@Index(['mediaFileId'])
@Index(['resolution'])
export class MediaMetadata {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'media_file_id', unique: true })
  mediaFileId!: string;

  @Column('int', { name: 'duration_seconds', nullable: true })
  durationSeconds!: number | null;

  @Column('int', { nullable: true })
  width!: number | null;

  @Column('int', { nullable: true })
  height!: number | null;

  @Column('varchar', { length: 20, nullable: true })
  resolution!: string | null;

  @Column('int', { nullable: true })
  bitrate!: number | null;

  @Column('varchar', { length: 50, nullable: true })
  codec!: string | null;

  @Column('text', { name: 'thumbnail_url', nullable: true })
  thumbnailUrl!: string | null;

  @Column('text', { name: 'alt_text', nullable: true })
  altText!: string | null;

  @Column('text', { nullable: true })
  caption!: string | null;

  @Column('text', { name: 'copyright_info', nullable: true })
  copyrightInfo!: string | null;

  @Column('jsonb', { name: 'exif_data', nullable: true })
  exifData!: Record<string, unknown> | null;

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
  @OneToOne(() => MediaFile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_file_id' })
  mediaFile!: MediaFile;
}
