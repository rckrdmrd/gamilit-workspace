import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { Tenant } from '../../auth/entities/tenant.entity';
import { Profile } from '../../auth/entities/profile.entity';

/**
 * Metric Type for performance measurements
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';

/**
 * PerformanceMetric Entity (audit_logging.performance_metrics)
 *
 * @description Metricas de rendimiento del sistema.
 * @schema audit_logging
 * @table performance_metrics
 *
 * PROPOSITO:
 * Registra metricas de rendimiento para monitoreo del sistema:
 * - Tiempos de respuesta de endpoints
 * - Contadores de operaciones
 * - Uso de recursos
 * - Metricas de negocio
 *
 * TIPOS DE METRICAS:
 * - counter: Valores acumulativos (requests totales)
 * - gauge: Valores puntuales (usuarios activos)
 * - histogram: Distribuciones (latencias)
 * - timer: Duraciones (tiempo de respuesta)
 *
 * @see DDL: apps/database/ddl/schemas/audit_logging/tables/02-performance_metrics.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.AUDIT, name: DB_TABLES.AUDIT.PERFORMANCE_METRICS })
@Index('idx_perf_metrics_name', ['metric_name'])
@Index('idx_perf_metrics_type', ['metric_type'])
@Index('idx_perf_metrics_category', ['category'])
@Index('idx_perf_metrics_measured', ['measured_at'])
@Check('"metric_type" IN (\'counter\', \'gauge\', \'histogram\', \'timer\')')
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'uuid', nullable: true })
    tenant_id?: string;

  @Column({ type: 'text' })
    metric_name!: string;

  @Column({ type: 'text' })
    metric_type!: MetricType;

  @Column({ type: 'text', nullable: true })
    category?: string;

  @Column({ type: 'numeric' })
    metric_value!: number;

  @Column({ type: 'text', nullable: true })
    unit?: string;

  @Column({ type: 'text', nullable: true })
    endpoint?: string;

  @Column({ type: 'text', nullable: true })
    operation?: string;

  @Column({ type: 'text', nullable: true })
    module_name?: string;

  @Column({ type: 'text', nullable: true })
    function_name?: string;

  @Column({ type: 'text', nullable: true })
    request_id?: string;

  @Column({ type: 'text', nullable: true })
    session_id?: string;

  @Column({ type: 'uuid', nullable: true })
    user_id?: string;

  @Column({ type: 'jsonb', default: {} })
    dimensions!: Record<string, unknown>;

  @Column({ type: 'text', array: true, nullable: true })
    tags?: string[];

  @Column({ type: 'timestamp with time zone', nullable: true })
    measured_at?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  // Relaciones
  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'user_id' })
    user?: Profile;
}
