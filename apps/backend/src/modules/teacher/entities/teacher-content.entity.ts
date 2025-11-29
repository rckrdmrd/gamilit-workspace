/**
 * TeacherContent Entity
 *
 * @description Entity para contenido educativo personalizado creado por teachers
 * @module modules/teacher/entities/teacher-content
 * @database educational_content.teacher_content
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entity para contenido educativo personalizado de teachers
 *
 * Representa contenido creado por teachers (ejercicios personalizados, worksheets, etc.)
 * Mapea a: educational_content.teacher_content
 *
 * @see apps/database/ddl/schemas/educational_content/tables/25-teacher_content.sql
 */
@Entity({ schema: 'educational_content', name: 'teacher_content' })
export class TeacherContent {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // Ownership
  @Column({ type: 'uuid', name: 'teacher_id' })
    teacher_id!: string;

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
    tenant_id!: string | null;

  // Content identification
  @Column({ type: 'varchar', length: 255 })
    title!: string;

  @Column({ type: 'text', nullable: true })
    description?: string | null;

  @Column({ type: 'varchar', length: 50, name: 'content_type' })
    content_type!: string;

  // Content body
  @Column({ type: 'jsonb', name: 'content_data', default: {} })
    content_data!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
    instructions?: string | null;

  @Column({ type: 'jsonb', name: 'learning_objectives', default: [] })
    learning_objectives!: string[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
    prerequisites?: string[] | null;

  // Classification
  @Column({ type: 'varchar', length: 100, name: 'subject_area', nullable: true })
    subject_area?: string | null;

  @Column({ type: 'varchar', length: 50, name: 'grade_level', nullable: true })
    grade_level?: string | null;

  @Column({ type: 'varchar', length: 20, name: 'difficulty_level', nullable: true })
    difficulty_level?: string | null;

  @Column({ type: 'int', name: 'estimated_duration_minutes', nullable: true })
    estimated_duration_minutes?: number | null;

  // Media and attachments
  @Column({ type: 'jsonb', name: 'media_resources', default: [] })
    media_resources!: any[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
    attachments?: any[] | null;

  // Classroom assignment
  @Column({ type: 'jsonb', name: 'target_classrooms', default: [] })
    target_classrooms!: string[];

  // Sharing and visibility
  @Column({ type: 'varchar', length: 50, default: 'private' })
    visibility!: string;

  @Column({ type: 'boolean', name: 'is_shared', default: false })
    is_shared!: boolean;

  @Column({ type: 'jsonb', name: 'shared_with_teachers', default: [] })
    shared_with_teachers!: string[];

  @Column({ type: 'boolean', name: 'allow_modifications', default: false })
    allow_modifications!: boolean;

  // Publishing and approval
  @Column({ type: 'varchar', length: 50, default: 'draft' })
    status!: string;

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
    published_at?: Date | null;

  @Column({ type: 'int', name: 'published_version', default: 1 })
    published_version!: number;

  @Column({ type: 'boolean', name: 'requires_approval', default: false })
    requires_approval!: boolean;

  @Column({ type: 'uuid', name: 'approved_by', nullable: true })
    approved_by?: string | null;

  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
    approved_at?: Date | null;

  // Usage tracking
  @Column({ type: 'int', name: 'times_assigned', default: 0 })
    times_assigned!: number;

  @Column({ type: 'int', name: 'times_completed', default: 0 })
    times_completed!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_score', nullable: true })
    average_score?: number | null;

  @Column({
    type: 'int',
    name: 'average_duration_minutes',
    nullable: true,
  })
    average_duration_minutes?: number | null;

  // Tags and categorization
  @Column({ type: 'jsonb', default: [] })
    tags!: string[];

  @Column({ type: 'jsonb', default: [] })
    keywords!: string[];

  // Gamification
  @Column({ type: 'int', name: 'points_value', default: 0 })
    points_value!: number;

  @Column({ type: 'int', name: 'ml_coins_reward', default: 0 })
    ml_coins_reward!: number;

  // Quality metrics
  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'student_rating', nullable: true })
    student_rating?: number | null;

  @Column({ type: 'int', name: 'rating_count', default: 0 })
    rating_count!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'teacher_rating', nullable: true })
    teacher_rating?: number | null;

  @Column({ type: 'int', name: 'teacher_rating_count', default: 0 })
    teacher_rating_count!: number;

  // Licensing and attribution
  @Column({ type: 'varchar', length: 100, nullable: true })
    license?: string | null;

  @Column({ type: 'text', nullable: true })
    attribution?: string | null;

  @Column({ type: 'uuid', name: 'based_on_content_id', nullable: true })
    based_on_content_id?: string | null;

  // Versioning
  @Column({ type: 'int', name: 'version_number', default: 1 })
    version_number!: number;

  @Column({ type: 'boolean', name: 'is_latest_version', default: true })
    is_latest_version!: boolean;

  @Column({ type: 'uuid', name: 'previous_version_id', nullable: true })
    previous_version_id?: string | null;

  // Metadata
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, any>;

  // Flags
  @Column({ type: 'boolean', name: 'is_active', default: true })
    is_active!: boolean;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
    is_featured!: boolean;

  @Column({ type: 'boolean', name: 'is_template', default: false })
    is_template!: boolean;

  // Audit fields
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updated_at!: Date;

  @Column({ type: 'timestamptz', name: 'last_used_at', nullable: true })
    last_used_at?: Date | null;
}
