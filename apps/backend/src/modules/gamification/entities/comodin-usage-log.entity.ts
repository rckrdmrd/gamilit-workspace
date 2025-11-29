import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { ComodinTypeEnum } from '@shared/constants/enums.constants';

/**
 * ComodinUsageLog Entity (gamification_system.comodin_usage_log)
 *
 * @description Registro historico de uso de comodines por usuario.
 *              Almacena cuando, donde y como se uso cada comodin.
 *
 * @schema gamification_system
 * @table comodin_usage_log
 *
 * Tipos de comodines:
 * - pistas: Revela pistas sobre la respuesta correcta
 * - vision_lectora: Resalta parrafos clave del texto
 * - segunda_oportunidad: Permite reintentar un ejercicio
 *
 * @see DDL: apps/database/ddl/schemas/gamification_system/tables/14-comodin_usage_log.sql
 * @see Spec: docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-002-comodines.md
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.COMODIN_USAGE_LOG })
@Index('idx_comodin_usage_log_user_id', ['user_id'])
@Index('idx_comodin_usage_log_type', ['comodin_type'])
@Index('idx_comodin_usage_log_used_at', ['used_at'])
@Unique(['user_id', 'exercise_id', 'attempt_id', 'comodin_type'])
export class ComodinUsageLog {
  /**
   * Identificador unico del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * ID del usuario que uso el comodin
   * FK -> auth_management.profiles(id)
   */
  @Column({ type: 'uuid' })
    user_id!: string;

  /**
   * Tipo de comodin usado
   * ENUM: pistas, vision_lectora, segunda_oportunidad
   */
  @Column({
    type: 'text',
    enum: ComodinTypeEnum,
  })
    comodin_type!: ComodinTypeEnum;

  // =====================================================
  // CONTEXTO DE USO
  // =====================================================

  /**
   * ID del ejercicio donde se uso el comodin
   */
  @Column({ type: 'uuid', nullable: true })
    exercise_id?: string;

  /**
   * ID del intento especifico
   */
  @Column({ type: 'uuid', nullable: true })
    attempt_id?: string;

  /**
   * ID del modulo asociado
   */
  @Column({ type: 'uuid', nullable: true })
    module_id?: string;

  // =====================================================
  // EFECTO DEL COMODIN
  // =====================================================

  /**
   * Descripcion del efecto aplicado
   * Ejemplos: "revealed_hint_1", "highlighted_paragraph_3"
   */
  @Column({ type: 'text', nullable: true })
    effect_applied?: string;

  /**
   * Valor especifico proporcionado al usuario (JSONB)
   * Ejemplo: hint text, highlighted text
   */
  @Column({ type: 'jsonb', nullable: true })
    value_provided?: Record<string, any>;

  /**
   * Contexto adicional del uso (JSONB)
   * Ejemplo: tiempo restante, intentos previos
   */
  @Column({ type: 'jsonb', default: {} })
    usage_context!: Record<string, any>;

  // =====================================================
  // TIMESTAMP
  // =====================================================

  /**
   * Fecha y hora de uso del comodin
   */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    used_at!: Date;
}
