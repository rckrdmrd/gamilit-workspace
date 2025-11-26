import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { Profile } from '../../auth/entities/profile.entity';
import { Tenant } from '../../auth/entities/tenant.entity';

/**
 * SystemAlert Entity (audit_logging.system_alerts)
 *
 * @description Alertas del sistema para monitoreo y notificación de eventos críticos.
 * @schema audit_logging
 * @table system_alerts
 *
 * IMPORTANTE:
 * - Alertas de rendimiento, errores, seguridad, recursos y anomalías
 * - Estados: open (nueva), acknowledged (reconocida), resolved (resuelta), suppressed (suprimida)
 * - Severidades: low, medium, high, critical (ordenadas por prioridad)
 * - Incluye tracking de usuarios que reconocieron/resolvieron la alerta
 * - Soporta métricas y contexto adicional en formato JSONB
 * - Row Level Security habilitada
 *
 * @see DDL: apps/database/ddl/schemas/audit_logging/tables/system_alerts.sql
 */
@Entity({ schema: DB_SCHEMAS.AUDIT, name: DB_TABLES.AUDIT.SYSTEM_ALERTS })
@Index('idx_alerts_open', ['status', 'severity'], { where: "status = 'open'" })
@Index('idx_alerts_severity', ['severity'])
@Index('idx_alerts_status', ['status'])
@Index('idx_alerts_triggered', ['triggered_at'])
@Index('idx_alerts_type', ['alert_type'])
@Check(`"alert_type" IN ('performance_degradation', 'high_error_rate', 'security_breach', 'resource_limit', 'service_outage', 'data_anomaly')`)
@Check(`"severity" IN ('low', 'medium', 'high', 'critical')`)
@Check(`"status" IN ('open', 'acknowledged', 'resolved', 'suppressed')`)
export class SystemAlert {
  /**
   * Identificador único de la alerta (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del tenant (nullable para alertas globales)
   */
  @Column({ type: 'uuid', nullable: true })
  tenant_id?: string;

  /**
   * Tipo de alerta
   * Valores: performance_degradation, high_error_rate, security_breach, resource_limit, service_outage, data_anomaly
   */
  @Column({ type: 'text' })
  alert_type!: 'performance_degradation' | 'high_error_rate' | 'security_breach' | 'resource_limit' | 'service_outage' | 'data_anomaly';

  /**
   * Nivel de severidad de la alerta
   * Valores: low, medium, high, critical (ordenados por prioridad)
   */
  @Column({ type: 'text' })
  severity!: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Título de la alerta
   */
  @Column({ type: 'text' })
  title!: string;

  /**
   * Descripción detallada de la alerta
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Sistema que originó la alerta
   * @example 'backend', 'database', 'storage'
   */
  @Column({ type: 'text', nullable: true })
  source_system?: string;

  /**
   * Módulo específico que originó la alerta
   * @example 'gamification', 'auth', 'content'
   */
  @Column({ type: 'text', nullable: true })
  source_module?: string;

  /**
   * Código de error relacionado (si aplica)
   */
  @Column({ type: 'text', nullable: true })
  error_code?: string;

  /**
   * Número de usuarios afectados
   */
  @Column({ type: 'integer', default: 0 })
  affected_users!: number;

  /**
   * Estado actual de la alerta
   * Valores: open, acknowledged, resolved, suppressed
   */
  @Column({ type: 'text', default: 'open' })
  status!: 'open' | 'acknowledged' | 'resolved' | 'suppressed';

  /**
   * Nota de reconocimiento (cuando status = acknowledged)
   */
  @Column({ type: 'text', nullable: true })
  acknowledgment_note?: string;

  /**
   * Nota de resolución (cuando status = resolved)
   */
  @Column({ type: 'text', nullable: true })
  resolution_note?: string;

  /**
   * ID del usuario que reconoció la alerta
   */
  @Column({ type: 'uuid', nullable: true })
  acknowledged_by?: string;

  /**
   * Fecha y hora de reconocimiento
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  acknowledged_at?: Date;

  /**
   * ID del usuario que resolvió la alerta
   */
  @Column({ type: 'uuid', nullable: true })
  resolved_by?: string;

  /**
   * Fecha y hora de resolución
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at?: Date;

  /**
   * Indica si se envió notificación
   */
  @Column({ type: 'boolean', default: false })
  notification_sent!: boolean;

  /**
   * Nivel de escalación (1-5, default 1)
   */
  @Column({ type: 'integer', default: 1 })
  escalation_level!: number;

  /**
   * Indica si la alerta se auto-resuelve
   */
  @Column({ type: 'boolean', default: false })
  auto_resolve!: boolean;

  /**
   * Indica si se deben suprimir alertas similares
   */
  @Column({ type: 'boolean', default: false })
  suppress_similar!: boolean;

  /**
   * Datos de contexto adicionales en formato JSONB
   * @example { "endpoint": "/api/users", "statusCode": 500, "requestId": "abc123" }
   */
  @Column({ type: 'jsonb', default: {} })
  context_data!: Record<string, any>;

  /**
   * Métricas asociadas en formato JSONB
   * @example { "responseTime": 5000, "errorRate": 0.15, "cpuUsage": 0.95 }
   */
  @Column({ type: 'jsonb', default: {} })
  metrics!: Record<string, any>;

  /**
   * Array de IDs de alertas relacionadas
   */
  @Column({ type: 'uuid', array: true, nullable: true })
  related_alerts?: string[];

  /**
   * Fecha y hora en que se disparó la alerta
   */
  @Column({ type: 'timestamp with time zone', default: () => 'NOW()' })
  triggered_at!: Date;

  /**
   * Fecha y hora de creación
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  /**
   * Fecha y hora de última actualización
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // =====================================================
  // Relaciones
  // =====================================================

  /**
   * Tenant asociado (opcional, null para alertas globales)
   * Relación ManyToOne: Muchas alertas pueden pertenecer a un tenant
   * FK: system_alerts.tenant_id → auth_management.tenants.id
   */
  @ManyToOne(() => Tenant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant?: Tenant;

  /**
   * Usuario que reconoció la alerta
   * Relación ManyToOne: Muchas alertas pueden ser reconocidas por un usuario
   * FK: system_alerts.acknowledged_by → auth_management.profiles.id
   */
  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by', referencedColumnName: 'id' })
  acknowledger?: Profile;

  /**
   * Usuario que resolvió la alerta
   * Relación ManyToOne: Muchas alertas pueden ser resueltas por un usuario
   * FK: system_alerts.resolved_by → auth_management.profiles.id
   */
  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'resolved_by', referencedColumnName: 'id' })
  resolver?: Profile;
}
