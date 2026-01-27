import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ComodinUsageTracking Entity (gamification_system.comodin_usage_tracking)
 *
 * @description Tracking de uso de comodines por intento para validar límites
 * @schema gamification_system
 * @table comodin_usage_tracking
 *
 * IMPORTANTE:
 * - UNIQUE constraint en (user_id, exercise_id, attempt_id)
 * - Límites: máx 3 pistas, 1 visión lectora, 1 segunda oportunidad por intento
 * - CHECK constraints en DDL para validar límites
 *
 * @created TASK-2026-01-27-AUDITORIA-DOC-GAMILIT - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/gamification_system/tables/15-comodin_usage_tracking.sql
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.COMODIN_USAGE_TRACKING })
@Unique(['user_id', 'exercise_id', 'attempt_id'])
@Index('idx_comodin_tracking_user_id', ['user_id'])
@Index('idx_comodin_tracking_exercise', ['exercise_id'])
@Index('idx_comodin_tracking_attempt', ['attempt_id'])
export class ComodinUsageTracking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
  user_id!: string;

  /**
   * ID del ejercicio
   */
  @Column({ type: 'uuid' })
  exercise_id!: string;

  /**
   * ID del intento de ejercicio
   */
  @Column({ type: 'uuid' })
  attempt_id!: string;

  /**
   * Pistas usadas en este intento (máx 3)
   */
  @Column({ type: 'integer', default: 0 })
  pistas_used!: number;

  /**
   * Visión Lectora usada en este intento (máx 1)
   */
  @Column({ type: 'integer', default: 0 })
  vision_lectora_used!: number;

  /**
   * Segunda Oportunidad usada en este intento (máx 1)
   */
  @Column({ type: 'integer', default: 0 })
  segunda_oportunidad_used!: number;

  /**
   * Indica si se alcanzó el límite de pistas
   */
  @Column({ type: 'boolean', default: false })
  pistas_limit_reached!: boolean;

  /**
   * Indica si se alcanzó el límite de visión lectora
   */
  @Column({ type: 'boolean', default: false })
  vision_lectora_limit_reached!: boolean;

  /**
   * Indica si se alcanzó el límite de segunda oportunidad
   */
  @Column({ type: 'boolean', default: false })
  segunda_oportunidad_limit_reached!: boolean;

  /**
   * Fecha de inicio del tracking
   */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  started_at!: Date;

  /**
   * Fecha del último uso de comodín
   */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  last_used_at!: Date;
}
