/**
 * AssignmentSubmission Entity
 *
 * Mapea a la tabla: public.assignment_submissions
 *
 * Representa las entregas de estudiantes para un assignment
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

export enum SubmissionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity({ schema: 'public', name: 'assignment_submissions' })
@Index(['assignment_id'])
@Index(['student_id'])
@Index(['status'])
@Index(['graded_by'])
@Index(['submitted_at'])
@Unique(['assignment_id', 'student_id'])
export class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'assignment_id' })
  assignmentId!: string;

  @Column('uuid', { name: 'student_id' })
  studentId!: string;

  @Column('timestamp with time zone', { name: 'submitted_at', nullable: true })
  submittedAt!: Date | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: SubmissionStatus.NOT_STARTED,
  })
  status!: SubmissionStatus;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  score!: number | null;

  @Column('text', { nullable: true })
  feedback!: string | null;

  @Column('timestamp with time zone', { name: 'graded_at', nullable: true })
  gradedAt!: Date | null;

  @Column('uuid', { name: 'graded_by', nullable: true })
  gradedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  // Relations
  // @ManyToOne(() => Assignment, assignment => assignment.submissions)
  // @JoinColumn({ name: 'assignment_id' })
  // assignment: Assignment;

  // @ManyToOne(() => Profile)
  // @JoinColumn({ name: 'student_id' })
  // student: Profile;

  // @ManyToOne(() => Classroom)
  // @JoinColumn({ name: 'classroom_id' })
  // classroom: Classroom;

  // @ManyToOne(() => Profile)
  // @JoinColumn({ name: 'graded_by' })
  // gradedByTeacher: Profile;
}
