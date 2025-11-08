/**
 * Assignment Entity
 *
 * Mapea a la tabla: public.assignments
 *
 * Representa tareas, exámenes, prácticas y quizzes asignados por profesores
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export enum AssignmentType {
  PRACTICE = 'practice',
  QUIZ = 'quiz',
  EXAM = 'exam',
  HOMEWORK = 'homework',
}

@Entity({ schema: 'public', name: 'assignments' })
@Index(['teacher_id'])
@Index(['is_published'])
@Index(['assignment_type'])
@Index(['due_date'])
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'teacher_id' })
  @Index()
  teacherId!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'assignment_type',
  })
  assignmentType!: AssignmentType;

  @Column('integer', { name: 'total_points', default: 100 })
  totalPoints!: number;

  @Column('timestamp with time zone', { name: 'due_date', nullable: true })
  dueDate!: Date | null;

  @Column('boolean', { name: 'is_published', default: false })
  isPublished!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  // Relation to teacher (User/Profile)
  // @ManyToOne(() => Profile)
  // @JoinColumn({ name: 'teacher_id' })
  // teacher: Profile;

  // Relation to assignment_classrooms (join table)
  // @OneToMany(() => AssignmentClassroom, ac => ac.assignment)
  // assignmentClassrooms: AssignmentClassroom[];

  // Relation to submissions
  // @OneToMany(() => AssignmentSubmission, submission => submission.assignment)
  // submissions: AssignmentSubmission[];
}
