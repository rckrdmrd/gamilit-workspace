/**
 * AssignmentExercise Entity
 *
 * Mapea a la tabla: educational_content.assignment_exercises
 *
 * Tabla M2M que vincula assignments con exercises del catálogo educativo.
 * Permite:
 * - Reutilizar exercises existentes en múltiples assignments
 * - Mantener orden de presentación con order_index
 * - Configurar points_override por exercise
 *
 * CREADO (2025-11-08): Implementación de funcionalidad faltante crítica
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
      Index,
  Unique,
} from 'typeorm';
import {
  DB_SCHEMAS,
  DB_TABLES,
} from '../../../shared/constants/database.constants';

@Entity({
  schema: DB_SCHEMAS.EDUCATIONAL,
  name: DB_TABLES.EDUCATIONAL.ASSIGNMENT_EXERCISES,
})
// CORRECTED (2025-12-18): Usar nombres de propiedades en lugar de nombres de columnas
@Index(['assignmentId'])
@Index(['exerciseId'])
@Index(['orderIndex'])
@Unique(['assignmentId', 'exerciseId'])
export class AssignmentExercise {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column('uuid', { name: 'assignment_id' })
    assignmentId!: string;

  @Column('uuid', { name: 'exercise_id' })
    exerciseId!: string;

  @Column('integer', { name: 'order_index' })
    orderIndex!: number;

  @Column('decimal', {
    name: 'points_override',
    precision: 5,
    scale: 2,
    nullable: true,
  })
    pointsOverride?: number | null;

  @Column('boolean', { name: 'is_required', default: true })
    isRequired!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

  // Relations (commented out - uncomment when Assignment and Exercise entities are fully configured)
  // @ManyToOne(() => Assignment, assignment => assignment.assignmentExercises)
  // @JoinColumn({ name: 'assignment_id' })
  // assignment!: Assignment;

  // @ManyToOne(() => Exercise)
  // @JoinColumn({ name: 'exercise_id' })
  // exercise!: Exercise;
}
