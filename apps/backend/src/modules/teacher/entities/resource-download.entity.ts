/**
 * ResourceDownload Entity
 *
 * @description Entity for tracking downloads of shared educational resources
 * @module modules/teacher/entities/resource-download
 * @database educational_content.resource_downloads
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS } from '@/shared/constants/database.constants';
import { TeacherContent } from './teacher-content.entity';
import { Profile } from '@modules/auth/entities/profile.entity';

/**
 * Entity for tracking resource downloads
 *
 * Represents a download event when a teacher downloads a shared educational resource.
 *
 * @see apps/database/ddl/schemas/educational_content/tables/30-resource_downloads.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: 'resource_downloads' })
export class ResourceDownload {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid', name: 'resource_id' })
    resource_id!: string;

  @Column({ type: 'uuid', name: 'downloaded_by' })
    downloaded_by!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'downloaded_at' })
    downloaded_at!: Date;

  // Relations
  @ManyToOne(() => TeacherContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
    resource!: TeacherContent;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'downloaded_by' })
    downloader!: Profile;
}
