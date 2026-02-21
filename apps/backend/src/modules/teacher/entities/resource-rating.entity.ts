/**
 * ResourceRating Entity
 *
 * @description Entity for teacher ratings on shared educational resources
 * @module modules/teacher/entities/resource-rating
 * @database educational_content.resource_ratings
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS } from '@/shared/constants/database.constants';
import { TeacherContent } from './teacher-content.entity';
import { Profile } from '@modules/auth/entities/profile.entity';

/**
 * Entity for teacher ratings on shared resources
 *
 * Represents a rating (1-5) given by a teacher to a shared resource.
 * Each teacher can rate a resource only once (UNIQUE constraint on resource_id + teacher_id).
 *
 * @see apps/database/ddl/schemas/educational_content/tables/28-resource_ratings.sql
 */
@Entity({ schema: DB_SCHEMAS.EDUCATIONAL, name: 'resource_ratings' })
@Unique(['resource_id', 'teacher_id'])
export class ResourceRating {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid', name: 'resource_id' })
    resource_id!: string;

  @Column({ type: 'uuid', name: 'teacher_id' })
    teacher_id!: string;

  @Column({ type: 'smallint' })
    rating!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updated_at!: Date;

  // Relations
  @ManyToOne(() => TeacherContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
    resource!: TeacherContent;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
    teacher!: Profile;
}
