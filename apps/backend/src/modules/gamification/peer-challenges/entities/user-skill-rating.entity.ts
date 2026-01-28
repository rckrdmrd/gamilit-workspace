import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * UserSkillRating Entity (social_features.user_skill_ratings)
 *
 * @description Skill ratings for users in peer challenges using ELO-based system.
 * @schema social_features
 * @table user_skill_ratings
 *
 * IMPORTANTE:
 * - Rating inicial: 1200 (standard ELO)
 * - K-Factor dinamico segun numero de partidas
 * - Historial de cambios en metadata (JSONB)
 *
 * @see Epic: EXT-009 - docs/03-fase-extensiones/EXT-009-peer-challenges/
 * @see ET-PEER-001-matchmaking.md - Skill Rating System
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'user_skill_ratings' })
@Index('idx_user_skill_ratings_user', ['user_id'], { unique: true })
@Index('idx_user_skill_ratings_rating', ['rating'])
@Index('idx_user_skill_ratings_games_played', ['games_played'])
export class UserSkillRating {
  /**
   * Identificador unico del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario (FK a auth_management.profiles)
   */
  @Column({ type: 'uuid', unique: true })
  user_id!: string;

  /**
   * Rating ELO actual del usuario
   * @default 1200 (standard ELO starting rating)
   */
  @Column({ type: 'integer', default: 1200 })
  rating!: number;

  /**
   * Numero total de partidas jugadas
   */
  @Column({ type: 'integer', default: 0 })
  games_played!: number;

  /**
   * Numero de victorias
   */
  @Column({ type: 'integer', default: 0 })
  wins!: number;

  /**
   * Numero de derrotas
   */
  @Column({ type: 'integer', default: 0 })
  losses!: number;

  /**
   * Numero de empates
   */
  @Column({ type: 'integer', default: 0 })
  draws!: number;

  /**
   * Racha actual de victorias/derrotas
   * Positivo = victorias consecutivas
   * Negativo = derrotas consecutivas
   */
  @Column({ type: 'integer', default: 0 })
  current_streak!: number;

  /**
   * Mejor racha de victorias historica
   */
  @Column({ type: 'integer', default: 0 })
  best_streak!: number;

  /**
   * Rating maximo alcanzado historicamente
   */
  @Column({ type: 'integer', default: 1200 })
  peak_rating!: number;

  /**
   * Rating minimo alcanzado historicamente
   */
  @Column({ type: 'integer', default: 1200 })
  lowest_rating!: number;

  /**
   * Historial de ratings recientes (ultimos 10 cambios)
   * @example [{ rating: 1250, change: +25, challengeId: "uuid", date: "2026-01-27T..." }]
   */
  @Column({ type: 'jsonb', default: [] })
  rating_history!: Array<{
    rating: number;
    change: number;
    challengeId: string;
    opponentId: string;
    result: 'win' | 'loss' | 'draw';
    date: string;
  }>;

  /**
   * Fecha de creacion
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  /**
   * Fecha de ultima actualizacion
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  /**
   * Metadatos adicionales
   */
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;
}
