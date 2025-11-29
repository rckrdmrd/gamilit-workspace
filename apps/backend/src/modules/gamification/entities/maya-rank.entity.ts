import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { MayaRank } from '@shared/constants/enums.constants';

/**
 * MayaRankEntity (gamification_system.maya_ranks)
 *
 * @description Configuración de los rangos maya del sistema.
 *              Define umbrales de XP, bonificaciones y requisitos para cada rango.
 *              Progresión: Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan
 *
 * @schema gamification_system
 * @table maya_ranks
 *
 * IMPORTANTE:
 * - Esta es una tabla de CONFIGURACIÓN, no de historial de usuario
 * - Define los parámetros de cada rango del sistema
 * - Diferente de UserRank que guarda el historial de rangos de usuarios
 *
 * @see DDL: apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql
 * @see ENUM: apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.MAYA_RANKS })
@Index('idx_maya_ranks_order', ['rank_order'])
@Index('idx_maya_ranks_xp_range', ['min_xp_required', 'max_xp_threshold'])
@Index('idx_maya_ranks_active', ['is_active'], { where: 'is_active = true' })
@Unique(['rank_name'])
@Unique(['rank_order'])
export class MayaRankEntity {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // RANK IDENTIFICATION
  // =====================================================

  /**
   * Nombre del rango maya (ENUM)
   * UNIQUE: Solo un registro por rango
   */
  @Column({
    type: 'text',
    enum: MayaRank,
  })
    rank_name!: MayaRank;

  /**
   * Nombre mostrable del rango
   */
  @Column({ type: 'text' })
    display_name!: string;

  /**
   * Descripción del rango
   */
  @Column({ type: 'text' })
    description!: string;

  // =====================================================
  // XP THRESHOLDS
  // =====================================================

  /**
   * XP mínimo requerido para alcanzar este rango
   */
  @Column({ type: 'bigint' })
    min_xp_required!: number;

  /**
   * XP máximo (umbral superior) para este rango
   * NULL significa que es el rango máximo
   */
  @Column({ type: 'bigint', nullable: true })
    max_xp_threshold?: number;

  // =====================================================
  // BONUSES & MULTIPLIERS
  // =====================================================

  /**
   * Bonus de ML Coins al alcanzar este rango
   */
  @Column({ type: 'integer', default: 0 })
    ml_coins_bonus!: number;

  /**
   * Multiplicador de XP para este rango (1.00-3.00)
   */
  @Column({ type: 'numeric', precision: 3, scale: 2, default: 1.00 })
    xp_multiplier!: number;

  // =====================================================
  // REQUIREMENTS
  // =====================================================

  /**
   * Misiones requeridas para desbloquear este rango
   */
  @Column({ type: 'integer', nullable: true, default: 0 })
    missions_required?: number;

  /**
   * Módulos requeridos para desbloquear este rango
   */
  @Column({ type: 'integer', nullable: true, default: 0 })
    modules_required?: number;

  // =====================================================
  // VISUAL ASSETS
  // =====================================================

  /**
   * Beneficios especiales del rango (JSONB array)
   */
  @Column({ type: 'jsonb', default: [] })
    perks!: string[];

  /**
   * URL del ícono del rango
   */
  @Column({ type: 'text', nullable: true })
    icon?: string;

  /**
   * Color del rango (formato HEX: #XXXXXX)
   */
  @Column({ type: 'text', nullable: true })
    color?: string;

  /**
   * URL de la imagen del badge
   */
  @Column({ type: 'text', nullable: true })
    badge_image_url?: string;

  // =====================================================
  // ORDER & PROGRESSION
  // =====================================================

  /**
   * Orden del rango en la progresión (1-5)
   * UNIQUE: Cada rango tiene un orden único
   */
  @Column({ type: 'integer' })
    rank_order!: number;

  /**
   * Siguiente rango en la progresión
   * NULL para el rango máximo (K'uk'ulkan)
   */
  @Column({
    type: 'text',
    nullable: true,
    enum: MayaRank,
  })
    next_rank?: MayaRank;

  // =====================================================
  // STATUS CONTROL
  // =====================================================

  /**
   * Indica si el rango está activo en el sistema
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  // =====================================================
  // AUDIT
  // =====================================================

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;
}
