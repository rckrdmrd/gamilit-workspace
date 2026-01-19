import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { Profile } from '../../auth/entities/profile.entity';
import { Tenant } from '../../auth/entities/tenant.entity';
import { School } from './school.entity';

/**
 * Classroom Entity (social_features.classrooms)
 *
 * @description Aulas virtuales para organizar estudiantes por clase
 * @schema social_features
 * @table classrooms
 *
 * IMPORTANTE:
 * - Representa aulas virtuales donde se agrupan estudiantes
 * - Puede estar vinculada a una escuela (school_id) o ser independiente
 * - code: Código único de acceso al aula (ej: "MAT-301-2024")
 * - Soporta profesor principal + co-profesores (array)
 * - Configuración de capacidad, horarios, y ajustes de inscripción
 *
 * RLS POLICIES (Row Level Security):
 * - classrooms_read_student: Students can read classrooms they belong to
 *   USING: id IN (SELECT classroom_id FROM classroom_members WHERE student_id = current_user_profile_id())
 * - classrooms_read_teacher: Teachers can read their own classrooms
 *   USING: teacher_id = current_user_profile_id() OR current_user_profile_id() = ANY(co_teachers)
 * - classrooms_read_admin: Admins can read all classrooms in their tenant
 *   USING: tenant_id = current_tenant_id() AND is_admin()
 * - classrooms_insert_teacher: Teachers can create classrooms
 *   WITH CHECK: teacher_id = current_user_profile_id()
 * - classrooms_update_teacher: Teachers can update their own classrooms
 *   USING: teacher_id = current_user_profile_id()
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/03-classrooms.sql
 * @see RLS: apps/database/ddl/schemas/social_features/policies/classrooms_policies.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.CLASSROOMS })
@Index('idx_classrooms_school', ['school_id'])
@Index('idx_classrooms_teacher', ['teacher_id'])
@Index('idx_classrooms_code', ['code'])
@Index('idx_classrooms_active', ['is_active'], { where: 'is_active = true' })
@Index('idx_classrooms_not_deleted', ['created_at'], { where: 'is_deleted = false' })
@Index('idx_classrooms_teacher_active', ['teacher_id', 'is_active'], { where: 'is_active = true' }) // FIX-2026-01-19: Added composite index from teacher-portal-indexes.sql
export class Classroom {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // MULTI-TENANT & OWNERSHIP
  // =====================================================

  /**
   * ID de la escuela (FK → social_features.schools) - Nullable
   * Null = aula independiente sin vinculación a escuela
   */
  @Column({ type: 'uuid', nullable: true })
    school_id?: string;

  /**
   * Relación Many-to-One con School (opcional)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => School, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'school_id' })
    school?: School | null;

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
  // BASIC INFORMATION
  // =====================================================

  /**
   * Nombre del aula (ej: "Matemáticas 3A", "Lectura Avanzada")
   */
  @Column({ type: 'text' })
    name!: string;

  /**
   * Código único de acceso (ej: "MAT-301-2024")
   * UNIQUE constraint aplicado
   */
  @Column({ type: 'text', unique: true, nullable: true })
    code?: string;

  /**
   * Descripción del aula
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  // =====================================================
  // ACADEMIC CLASSIFICATION
  // =====================================================

  /**
   * Nivel de grado (ej: "6", "7", "8")
   */
  @Column({ type: 'text', nullable: true })
    grade_level?: string;

  /**
   * Sección (ej: "A", "B", "C")
   */
  @Column({ type: 'text', nullable: true })
    section?: string;

  /**
   * Materia o asignatura
   */
  @Column({ type: 'text', nullable: true })
    subject?: string;

  /**
   * Año académico (ej: "2024-2025")
   */
  @Column({ type: 'text', nullable: true })
    academic_year?: string;

  /**
   * Semestre (ej: "1", "2", "Anual")
   */
  @Column({ type: 'text', nullable: true })
    semester?: string;

  // =====================================================
  // TEACHERS
  // =====================================================

  /**
   * ID del profesor principal (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
    teacher_id!: string;

  /**
   * Relación Many-to-One con Profile (teacher principal)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
    teacher?: Profile;

  /**
   * IDs de co-profesores (array de UUIDs)
   */
  @Column({ type: 'uuid', array: true, nullable: true })
    co_teachers?: string[];

  // =====================================================
  // CAPACITY & STATS
  // =====================================================

  /**
   * Capacidad máxima de estudiantes
   */
  @Column({ type: 'integer', default: 40 })
    capacity!: number;

  /**
   * Contador actual de estudiantes
   */
  @Column({ type: 'integer', default: 0 })
    current_students_count!: number;

  // =====================================================
  // CONFIGURATION & SETTINGS
  // =====================================================

  /**
   * Configuraciones del aula en formato JSON
   * Default: require_approval=true, visible_in_directory=true, allow_self_enrollment=false
   */
  @Column({
    type: 'jsonb',
    default: {
      require_approval: true,
      visible_in_directory: true,
      allow_self_enrollment: false,
    },
  })
    settings!: Record<string, unknown>;

  /**
   * Horario de clases en formato JSON (array de objetos)
   * Estructura: [{ day: "lunes", start_time: "08:00", end_time: "10:00" }, ...]
   */
  @Column({ type: 'jsonb', default: [] })
    schedule: any[] = [];

  /**
   * URL de reunión virtual (Zoom, Meet, Teams, etc.)
   */
  @Column({ type: 'text', nullable: true })
    meeting_url?: string;

  // =====================================================
  // STATUS FLAGS
  // =====================================================

  /**
   * Aula activa (puede aceptar nuevos estudiantes)
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  /**
   * Aula archivada (completada, ciclo anterior)
   */
  @Column({ type: 'boolean', default: false })
    is_archived!: boolean;

  /**
   * Soft delete flag
   * Cuando true, el aula está eliminada pero los datos se preservan para auditoría.
   * Backend filtra con WHERE is_deleted = FALSE.
   * @see DDL: idx_classrooms_not_deleted (índice parcial)
   */
  @Column({ type: 'boolean', default: false })
    is_deleted!: boolean;

  // =====================================================
  // TIME RANGE
  // =====================================================

  /**
   * Fecha de inicio del curso
   */
  @Column({ type: 'date', nullable: true })
    start_date?: Date;

  /**
   * Fecha de fin del curso
   */
  @Column({ type: 'date', nullable: true })
    end_date?: Date;

  // =====================================================
  // METADATA & AUDIT
  // =====================================================

  /**
   * Metadatos adicionales en formato JSON
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   * Trigger: trg_classrooms_updated_at
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
