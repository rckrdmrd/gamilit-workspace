import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * Rate Limit Scope Types
 */
export type RateLimitScope = 'ip' | 'user' | 'consumer' | 'global';

/**
 * Rate Limit Resource Types
 */
export type RateLimitResourceType = 'endpoint' | 'operation';

/**
 * RateLimit Entity (system_configuration.rate_limits)
 *
 * @description Configuracion de limites de tasa para endpoints y operaciones.
 * @schema system_configuration
 * @table rate_limits
 *
 * PROPOSITO:
 * Define limites de tasa (rate limiting) para proteger la API de uso excesivo
 * y garantizar disponibilidad del servicio.
 *
 * ALCANCE:
 * - Limites por endpoint especifico
 * - Limites por operacion (login, register, etc.)
 * - Configuracion por scope (IP, usuario, consumer, global)
 * - Capacidad de burst para picos temporales
 *
 * CASOS DE USO:
 * 1. Proteccion contra ataques de fuerza bruta (login attempts)
 * 2. Limites de API para consumidores LTI
 * 3. Throttling de operaciones costosas
 * 4. Fair usage entre usuarios
 *
 * @see DDL: apps/database/ddl/schemas/system_configuration/tables/04-rate_limits.sql
 * @created AUDIT-003 (2026-01-04)
 */
@Entity({ schema: DB_SCHEMAS.SYSTEM_CONFIGURATION, name: DB_TABLES.SYSTEM.RATE_LIMITS })
@Index('idx_rate_limits_resource', ['resource_type', 'resource_identifier'])
@Index('idx_rate_limits_scope', ['scope'])
@Index('idx_rate_limits_enabled', ['is_enabled'], { where: 'is_enabled = true' })
@Unique(['resource_type', 'resource_identifier', 'scope'])
@Check('"resource_type" IN (\'endpoint\', \'operation\')')
@Check('"scope" IN (\'ip\', \'user\', \'consumer\', \'global\')')
export class RateLimit {
  /**
   * Identificador unico de la configuracion (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Tipo de recurso a limitar: endpoint (URL) u operation (accion logica)
   */
  @Column({ type: 'text' })
    resource_type!: RateLimitResourceType;

  /**
   * Identificador del recurso.
   * @example
   * - endpoint: /api/auth/login, /api/exercises/:id
   * - operation: login_attempt, register_user, submit_exercise
   */
  @Column({ type: 'text' })
    resource_identifier!: string;

  /**
   * Numero maximo de requests permitidos en la ventana de tiempo
   */
  @Column({ type: 'integer' })
    max_requests!: number;

  /**
   * Ventana de tiempo en segundos.
   * @example 60 = 1 minuto, 3600 = 1 hora, 86400 = 1 dia
   */
  @Column({ type: 'integer' })
    window_seconds!: number;

  /**
   * Ambito del limite:
   * - ip: Por direccion IP
   * - user: Por usuario autenticado
   * - consumer: Por consumidor LTI
   * - global: Global para todos
   */
  @Column({ type: 'text' })
    scope!: RateLimitScope;

  /**
   * Si el limite esta activo. Permite desactivar temporalmente sin eliminar configuracion.
   */
  @Column({ type: 'boolean', default: true })
    is_enabled!: boolean;

  /**
   * Tamano del burst permitido. Permite picos temporales por encima del limite base.
   * NULL = sin burst allowance
   */
  @Column({ type: 'integer', nullable: true })
    burst_size?: number;

  /**
   * Descripcion del proposito de este limite
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Metadatos adicionales en formato JSON. Puede incluir:
   * - error_message: Mensaje personalizado al exceder limite
   * - retry_after_strategy: Estrategia para Retry-After header
   * - exemptions: Lista de IPs o usuarios exentos
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * Fecha y hora de creacion
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de ultima actualizacion
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
