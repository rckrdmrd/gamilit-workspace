import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { Classroom } from './classroom.entity';
import { Profile } from '../../auth/entities/profile.entity';
import { Tenant } from '../../auth/entities/tenant.entity';

/**
 * Enum for teacher roles in classroom
 */
export enum TeacherClassroomRole {
  OWNER = 'owner',
  TEACHER = 'teacher',
  ASSISTANT = 'assistant',
}

/**
 * TeacherClassroom Entity (social_features.teacher_classrooms)
 *
 * @description Relación many-to-many entre teachers y classrooms con roles
 * @schema social_features
 * @table teacher_classrooms
 *
 * IMPORTANTE:
 * - Permite múltiples teachers por classroom con diferentes roles
 * - owner: Creador del classroom, permisos completos
 * - teacher: Permisos completos de enseñanza
 * - assistant: Permisos limitados de apoyo
 * - Un teacher puede tener múltiples classrooms
 * - Un classroom puede tener múltiples teachers
 * - Constraint UNIQUE(teacher_id, classroom_id) previene duplicados
 *
 * RLS POLICIES (Row Level Security):
 * - teacher_classrooms_read_teacher: Teachers can read their own assignments
 *   USING: teacher_id = current_user_profile_id()
 * - teacher_classrooms_read_admin: Admins can read all assignments in their tenant
 *   USING: tenant_id = current_tenant_id() AND is_admin()
 * - teacher_classrooms_update_admin: Only admins can modify teacher assignments
 *   USING: tenant_id = current_tenant_id() AND is_admin()
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql
 * @see RLS: apps/database/ddl/schemas/social_features/policies/teacher_classrooms_policies.sql
 */
@Entity({
  schema: DB_SCHEMAS.SOCIAL,
  name: DB_TABLES.SOCIAL.TEACHER_CLASSROOMS,
})
@Index('idx_teacher_classrooms_teacher_id', ['teacher_id'])
@Index('idx_teacher_classrooms_classroom_id', ['classroom_id'])
@Index('idx_teacher_classrooms_role', ['role'])
@Index('idx_teacher_classrooms_tenant_id', ['tenant_id']) // FIX-2026-01-19: Added missing index
@Unique('teacher_classrooms_teacher_id_classroom_id_key', ['teacher_id', 'classroom_id']) // FIX-2026-01-19: Added UNIQUE constraint from DDL
export class TeacherClassroom {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * ID del teacher (FK → auth_management.profiles.id)
   * Referencia al perfil del usuario con rol teacher
   */
  @Column({ type: 'uuid' })
    teacher_id!: string;

  /**
   * Relación Many-to-One con Profile (teacher)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
    teacher?: Profile;

  /**
   * ID del classroom (FK → social_features.classrooms.id)
   */
  @Column({ type: 'uuid' })
    classroom_id!: string;

  /**
   * Relación Many-to-One con Classroom
   */
  @ManyToOne(() => Classroom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classroom_id' })
    classroom!: Classroom;

  /**
   * ID del tenant propietario (FK → auth_management.tenants)
   */
  @Column({ type: 'uuid' })
    tenant_id!: string;

  /**
   * Relación Many-to-One con Tenant
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

  // =====================================================
  // ROLE & STATUS
  // =====================================================

  /**
   * Rol del teacher en el classroom
   * - owner: Creador, permisos completos
   * - teacher: Permisos de enseñanza completos
   * - assistant: Permisos limitados
   */
  @Column({
    type: 'varchar',
    length: 50,
    default: TeacherClassroomRole.TEACHER,
  })
    role!: TeacherClassroomRole;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de asignación
   */
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
    assigned_at!: Date;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;
}
