/**
 * MetricsHistory Entity (admin_dashboard.metrics_history)
 *
 * @description Historial de metricas del sistema para monitoreo.
 * @schema admin_dashboard
 * @table metrics_history
 *
 * PROPOSITO:
 * Almacena metricas del sistema recolectadas periodicamente para:
 * - Monitoreo historico de uso de memoria/CPU
 * - Analisis de tendencias de rendimiento
 * - Dashboard de administracion (AdminMonitoringPage)
 *
 * @see DDL: apps/database/ddl/schemas/admin_dashboard/tables/09-metrics_history.sql
 * @created TASK-MONITORING-HISTORY-PERSISTENCE (2026-01-07)
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

@Entity({ schema: DB_SCHEMAS.ADMIN_DASHBOARD, name: DB_TABLES.ADMIN.METRICS_HISTORY })
@Index('idx_metrics_history_recorded_at', ['recorded_at'])
@Index('idx_metrics_history_created_at', ['created_at'])
export class MetricsHistory {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Timestamp de cuando se registro la metrica
   */
  @Column({ type: 'timestamp with time zone' })
    recorded_at!: Date;

  // =====================================================
  // Metricas de memoria
  // =====================================================

  @Column({ type: 'numeric', precision: 10, scale: 2 })
    memory_total_mb!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
    memory_used_mb!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
    memory_free_mb!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
    memory_usage_percent!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    heap_used_mb?: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    heap_total_mb?: number;

  // =====================================================
  // Metricas de CPU
  // =====================================================

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    cpu_user_ms?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    cpu_system_ms?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    cpu_usage_percent?: number;

  @Column({ type: 'integer', nullable: true })
    cpu_cores?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    load_average_1m?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    load_average_5m?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    load_average_15m?: number;

  // =====================================================
  // Metricas del proceso
  // =====================================================

  @Column({ type: 'integer', nullable: true })
    process_uptime_seconds?: number;

  @Column({ type: 'integer', nullable: true })
    active_handles?: number;

  @Column({ type: 'integer', nullable: true })
    active_requests?: number;

  // =====================================================
  // Metricas del sistema
  // =====================================================

  @Column({ type: 'integer', nullable: true })
    system_uptime_seconds?: number;

  // =====================================================
  // Metadata
  // =====================================================

  @Column({ type: 'varchar', length: 20, nullable: true })
    node_version?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
    platform?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
    hostname?: string;

  // =====================================================
  // Auditoria
  // =====================================================

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;
}
