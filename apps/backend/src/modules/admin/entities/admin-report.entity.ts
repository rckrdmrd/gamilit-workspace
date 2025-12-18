import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { User } from '../../auth/entities/user.entity';

/**
 * AdminReport Entity (admin_dashboard.admin_reports)
 *
 * @description Registro de reportes generados por administradores del sistema
 * @schema admin_dashboard
 * @table admin_reports
 *
 * IMPORTANTE:
 * - Almacena reportes generados de forma asíncrona (PDF, Excel, CSV)
 * - Estados: pending → generating → completed/failed
 * - Los reportes tienen expiración automática (expires_at)
 * - Cleanup automático elimina reportes vencidos (>30 días)
 *
 * DISEÑO:
 * - Similar a BulkOperation pero para generación de archivos de reportes
 * - En producción: integrar con BullMQ para procesamiento en background
 * - file_url apunta al archivo generado (almacenamiento local o S3)
 *
 * @see DDL: apps/database/ddl/schemas/admin_dashboard/tables/08-admin_reports.sql
 * @related EXT-002 (Admin Extendido - Reports)
 */
@Entity({ schema: DB_SCHEMAS.ADMIN_DASHBOARD, name: DB_TABLES.ADMIN.ADMIN_REPORTS })
@Index('idx_admin_reports_status', ['status'])
@Index('idx_admin_reports_requested_by', ['requested_by'])
@Index('idx_admin_reports_type', ['report_type'])
@Index('idx_admin_reports_created_at', ['created_at'])
@Index('idx_admin_reports_expires_at', ['expires_at'])
@Check('"status" IN (\'pending\', \'generating\', \'completed\', \'failed\')')
@Check('"file_size" >= 0')
export class AdminReport {
  /**
   * Identificador único del reporte (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Tipo de reporte generado
   * Valores: 'users', 'progress', 'engagement', 'gamification', 'content', 'assignments'
   * @example 'users'
   */
  @Column({ type: 'varchar', length: 50 })
    report_type!: string;

  /**
   * Formato del archivo de reporte
   * Valores: 'pdf', 'excel', 'csv'
   * @example 'excel'
   */
  @Column({ type: 'varchar', length: 20 })
    report_format!: string;

  /**
   * Estado actual de la generación del reporte
   * Estados: 'pending', 'generating', 'completed', 'failed'
   */
  @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: 'pending' | 'generating' | 'completed' | 'failed';

  /**
   * URL del archivo de reporte generado
   * Puede ser ruta local (/reports/...) o URL de S3/cloud storage
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
    file_url?: string;

  /**
   * Tamaño del archivo generado en bytes
   */
  @Column({ type: 'integer', nullable: true })
    file_size?: number;

  /**
   * Metadata del reporte (filtros, parámetros, configuración)
   * Formato: { startDate: '2025-01-01', endDate: '2025-12-31', classroomId: 'abc', ... }
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * Mensaje de error si la generación falla
   */
  @Column({ type: 'text', nullable: true })
    error_message?: string;

  /**
   * UUID del administrador que solicitó el reporte
   */
  @Column({ type: 'uuid' })
    requested_by!: string;

  /**
   * Relación con el usuario que solicitó el reporte
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
    admin!: User;

  /**
   * Timestamp de creación de la solicitud (Mexico timezone)
   */
  @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

  /**
   * Timestamp de completitud de la generación
   */
  @Column({ type: 'timestamp', nullable: true })
    completed_at?: Date;

  /**
   * Fecha de expiración del reporte (para cleanup automático)
   * Por defecto: created_at + 30 días
   */
  @Column({ type: 'timestamp', nullable: true })
    expires_at?: Date;
}
