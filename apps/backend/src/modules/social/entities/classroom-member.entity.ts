import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import {
  ClassroomMemberStatusEnum,
  EnrollmentMethodEnum,
} from '@shared/constants/enums.constants';
import { Classroom } from './classroom.entity';
import { Profile } from '../../auth/entities/profile.entity';

/**
 * ClassroomMember Entity (social_features.classroom_members)
 *
 * @description Membresía de estudiantes en aulas - relación many-to-many
 * @schema social_features
 * @table classroom_members
 *
 * IMPORTANTE:
 * - Relación many-to-many entre classrooms y students (profiles)
 * - UNIQUE constraint: (classroom_id, student_id) - un estudiante por aula
 * - Estados: active, inactive, withdrawn, completed
 * - Métodos de inscripción: teacher_invite, self_enroll, admin_add, bulk_import
 * - Tracking de calificaciones, asistencia, y notas del profesor
 * - Trigger: trg_update_classroom_count (actualiza current_students_count)
 *
 * RLS POLICIES (Row Level Security):
 * - classroom_members_read_student: Students can read their own memberships
 *   USING: student_id = current_user_profile_id()
 * - classroom_members_read_teacher: Teachers can read memberships of their classrooms
 *   USING: classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = current_user_profile_id())
 * - classroom_members_manage_teacher: Teachers can INSERT/UPDATE/DELETE memberships
 *   USING: classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = current_user_profile_id())
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql
 * @see RLS: apps/database/ddl/schemas/social_features/policies/classroom_members_policies.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.CLASSROOM_MEMBERS })
@Index('idx_classroom_members_classroom', ['classroom_id'])
@Index('idx_classroom_members_student', ['student_id'])
@Index('idx_classroom_members_classroom_status', ['classroom_id', 'status'], {
  where: "status = 'active'",
})
@Index('idx_classroom_members_active', ['student_id', 'status'], {
  where: "status = 'active'",
})
@Unique('classroom_members_classroom_id_student_id_key', ['classroom_id', 'student_id'])
export class ClassroomMember {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del aula (FK → social_features.classrooms)
   * UNIQUE con student_id: Cada estudiante aparece una vez por aula
   */
  @Column({ type: 'uuid' })
    classroom_id!: string;

  /**
   * Relación Many-to-One con Classroom
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Classroom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classroom_id' })
    classroom?: Classroom;

  /**
   * ID del estudiante (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
    student_id!: string;

  /**
   * Relación Many-to-One con Profile (student)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
    student?: Profile;

  // =====================================================
  // ENROLLMENT TRACKING
  // =====================================================

  /**
   * Fecha y hora de inscripción al aula
   */
  @Column({ type: 'timestamp with time zone' })
    enrollment_date!: Date;

  /**
   * Método de inscripción
   * Valores: teacher_invite, self_enroll, admin_add, bulk_import
   * FIX-2026-01-19: Tipado con enum para coherencia con CHECK constraint
   */
  @Column({
    type: 'text',
    default: EnrollmentMethodEnum.TEACHER_INVITE,
  })
    enrollment_method!: EnrollmentMethodEnum;

  /**
   * ID del usuario que inscribió al estudiante (FK → auth_management.profiles)
   * Puede ser profesor, admin, o el mismo estudiante (self_enroll)
   */
  @Column({ type: 'uuid', nullable: true })
    enrolled_by?: string;

  /**
   * Relación Many-to-One con Profile (quien inscribió)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Profile, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'enrolled_by' })
    enrolledByProfile?: Profile | null;

  // =====================================================
  // STATUS & STATE
  // =====================================================

  /**
   * Estado de la membresía
   * Valores: active, inactive, withdrawn, completed
   * FIX-2026-01-19: Tipado con enum para coherencia con CHECK constraint
   */
  @Column({
    type: 'text',
    default: ClassroomMemberStatusEnum.ACTIVE,
  })
    status!: ClassroomMemberStatusEnum;

  /**
   * Fecha y hora de retiro del aula
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    withdrawal_date?: Date;

  /**
   * Razón del retiro (si aplica)
   */
  @Column({ type: 'text', nullable: true })
    withdrawal_reason?: string;

  // =====================================================
  // STUDENT IDENTIFICATION
  // =====================================================

  /**
   * Número de matrícula del estudiante (identificador institucional)
   */
  @Column({ type: 'text', nullable: true })
    student_number?: string;

  // =====================================================
  // ACADEMIC PERFORMANCE
  // =====================================================

  /**
   * Calificación final (0.0 - 10.0)
   */
  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
    final_grade?: number;

  /**
   * Porcentaje de asistencia (0.00 - 100.00)
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    attendance_percentage?: number;

  // =====================================================
  // PERMISSIONS & CONFIGURATION
  // =====================================================

  /**
   * Permisos especiales del estudiante en el aula (JSONB)
   * Ejemplo: { can_post: true, can_comment: true, can_view_others: true }
   */
  @Column({ type: 'jsonb', default: {} })
    permissions: Record<string, unknown> = {};

  // =====================================================
  // NOTES & COMMENTS
  // =====================================================

  /**
   * Notas del profesor sobre el estudiante
   */
  @Column({ type: 'text', nullable: true })
    teacher_notes?: string;

  /**
   * Información de contacto de padres/tutores (JSONB)
   * Ejemplo: { parent_name: "...", phone: "...", email: "..." }
   */
  @Column({ type: 'jsonb', default: {} })
    parent_contact_info!: Record<string, unknown>;

  // =====================================================
  // METADATA & FLAGS
  // =====================================================

  /**
   * Metadatos adicionales en formato JSON
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * Flag de membresía activa
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   * Trigger: trg_classroom_members_updated_at
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
