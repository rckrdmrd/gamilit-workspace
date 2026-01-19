/**
 * TeacherReport Entity (social_features.teacher_reports)
 *
 * @description Metadatos de reportes generados por profesores
 * @schema social_features
 * @table teacher_reports
 *
 * IMPORTANTE:
 * - Almacena metadata de reportes generados (no el contenido)
 * - Tipos: individual, classroom, progress, analytics
 * - Formatos: pdf, excel, csv
 * - Vinculado opcionalmente a un classroom específico
 * - Tracking de período cubierto y número de estudiantes
 *
 * RLS POLICIES (Row Level Security):
 * - teacher_reports_teacher_policy: Teachers can read/write their own reports
 *   USING: teacher_id = current_user_profile_id()
 *   WITH CHECK: teacher_id = current_user_profile_id()
 * - teacher_reports_admin_policy: Admins can read all reports in their tenant
 *   USING: tenant_id = current_tenant_id() AND is_admin()
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/08-teacher_reports.sql
 * @see RLS: apps/database/ddl/schemas/social_features/policies/teacher_reports_policies.sql
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import {
  TeacherReportTypeEnum,
  TeacherReportFormatEnum,
} from '@/shared/constants/enums.constants';
import { Profile } from '../../auth/entities/profile.entity';
import { Tenant } from '../../auth/entities/tenant.entity';
import { Classroom } from '../../social/entities/classroom.entity';

/**
 * Entity for teacher-generated reports metadata
 *
 * FIX-2026-01-19: Added all 5 indices from DDL for query optimization
 */
@Entity({ name: DB_TABLES.SOCIAL.TEACHER_REPORTS, schema: DB_SCHEMAS.SOCIAL })
@Index('idx_teacher_reports_teacher_id', ['teacherId'])
@Index('idx_teacher_reports_tenant_id', ['tenantId'])
@Index('idx_teacher_reports_generated_at', ['generatedAt'])
@Index('idx_teacher_reports_classroom_id', ['classroomId'], { where: 'classroom_id IS NOT NULL' })
@Index('idx_teacher_reports_report_type', ['reportType'])
export class TeacherReport {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
    teacherId!: string;

  /**
   * Relación Many-to-One con Profile (teacher)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
    teacher?: Profile;

  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
    classroomId!: string | null;

  /**
   * Relación Many-to-One con Classroom (opcional)
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Classroom, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'classroom_id' })
    classroom?: Classroom | null;

  @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId!: string;

  /**
   * Relación Many-to-One con Tenant
   * FIX-2026-01-19: Agregada relación faltante para coherencia DDL-Backend
   */
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

  @Column({ name: 'report_name', length: 255 })
    reportName!: string;

  /**
   * Tipo de reporte
   * FIX-2026-01-19: Tipado con enum para coherencia con CHECK constraint
   */
  @Column({ name: 'report_type', length: 50 })
    reportType!: TeacherReportTypeEnum;

  /**
   * Formato de exportación
   * FIX-2026-01-19: Tipado con enum para coherencia con CHECK constraint
   */
  @Column({ name: 'report_format', length: 10 })
    reportFormat!: TeacherReportFormatEnum;

  @Column({ name: 'student_count', type: 'int', default: 0 })
    studentCount!: number;

  @Column({ name: 'period_start', type: 'date', nullable: true })
    periodStart!: Date | null;

  @Column({ name: 'period_end', type: 'date', nullable: true })
    periodEnd!: Date | null;

  @Column({ name: 'file_path', type: 'text', nullable: true })
    filePath!: string | null;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
    fileSizeBytes!: number | null;

  @Column({ name: 'generated_at', type: 'timestamptz', default: () => 'NOW()' })
    generatedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
