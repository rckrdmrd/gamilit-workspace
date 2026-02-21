/**
 * ResourceComment Entity
 *
 * @description Entity for teacher comments on shared educational resources
 * @module modules/teacher/entities/resource-comment
 * @database educational_content.resource_comments
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS } from '@/shared/constants/database.constants';
import { TeacherContent } from './teacher-content.entity';
import { Profile } from '@modules/auth/entities/profile.entity';

/**
 * Entity for teacher comments on shared resources
 *
 * Represents a comment left by a teacher on a shared educational resource.
 * Supports soft delete via is_deleted flag for moderation.
 *
 * @see apps/database/ddl/schemas/educational_content/tables/29-resource_comments.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: 'resource_comments' })
export class ResourceComment {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid', name: 'resource_id' })
    resource_id!: string;

  @Column({ type: 'uuid', name: 'author_id' })
    author_id!: string;

  @Column({ type: 'text' })
    text!: string;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
    is_deleted!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updated_at!: Date;

  // Relations
  @ManyToOne(() => TeacherContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
    resource!: TeacherContent;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
    author!: Profile;
}
