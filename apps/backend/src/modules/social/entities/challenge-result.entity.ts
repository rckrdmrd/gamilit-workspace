import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ChallengeResult Entity (social_features.challenge_results)
 *
 * @description Resultados finales de peer challenges con rankings y distribución de recompensas
 * @schema social_features
 * @table challenge_results
 *
 * IMPORTANTE:
 * - Almacena resultados finales de desafíos entre pares
 * - Incluye ganadores (1°, 2°, 3° lugar)
 * - Tracking de XP y ML Coins distribuidos
 * - Leaderboard final y estadísticas detalladas en JSONB
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/13-challenge_results.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.CHALLENGE_RESULTS })
@Index('idx_challenge_results_challenge', ['challenge_id'])
@Index('idx_challenge_results_winner', ['winner_id'])
@Index('idx_challenge_results_calculated_at', ['calculated_at'])
export class ChallengeResult {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // CHALLENGE REFERENCE
  // =====================================================

  /**
   * ID del desafío (FK → social_features.peer_challenges)
   * UNIQUE constraint - solo un resultado por desafío
   */
  @Column({ type: 'uuid', unique: true })
  challenge_id!: string;

  // =====================================================
  // WINNERS (PODIUM)
  // =====================================================

  /**
   * ID del ganador (1er lugar) (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid', nullable: true })
  winner_id?: string;

  /**
   * ID del segundo lugar (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid', nullable: true })
  second_place_id?: string;

  /**
   * ID del tercer lugar (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid', nullable: true })
  third_place_id?: string;

  // =====================================================
  // GENERAL STATISTICS
  // =====================================================

  /**
   * Total de participantes en el desafío
   */
  @Column({ type: 'integer' })
  total_participants!: number;

  /**
   * Participantes que completaron el desafío
   */
  @Column({ type: 'integer', nullable: true })
  participants_completed?: number;

  /**
   * Participantes que abandonaron el desafío
   */
  @Column({ type: 'integer', nullable: true })
  participants_forfeit?: number;

  // =====================================================
  // SCORES
  // =====================================================

  /**
   * Puntaje del ganador
   */
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  winning_score?: number;

  /**
   * Puntaje promedio de todos los participantes
   */
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  average_score?: number;

  /**
   * Mayor precisión alcanzada (porcentaje)
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  highest_accuracy?: number;

  // =====================================================
  // TIMING
  // =====================================================

  /**
   * Tiempo promedio de completación (segundos)
   */
  @Column({ type: 'integer', nullable: true })
  average_completion_time_seconds?: number;

  /**
   * Tiempo más rápido de completación (segundos)
   */
  @Column({ type: 'integer', nullable: true })
  fastest_completion_time_seconds?: number;

  // =====================================================
  // REWARDS
  // =====================================================

  /**
   * Total de XP distribuido a todos los participantes
   */
  @Column({ type: 'integer', default: 0 })
  total_xp_distributed!: number;

  /**
   * Total de ML Coins distribuidas a todos los participantes
   */
  @Column({ type: 'integer', default: 0 })
  total_ml_coins_distributed!: number;

  /**
   * Indica si las recompensas ya fueron distribuidas
   */
  @Column({ type: 'boolean', default: false })
  rewards_distributed!: boolean;

  // =====================================================
  // DETAILED DATA (JSONB)
  // =====================================================

  /**
   * Leaderboard final en formato JSONB
   * Array de { user_id, rank, score, time }
   */
  @Column({ type: 'jsonb', default: [] })
  final_leaderboard!: Array<{
    user_id: string;
    rank: number;
    score: number;
    time?: number;
  }>;

  /**
   * Estadísticas adicionales (accuracy, attempts, etc.)
   */
  @Column({ type: 'jsonb', default: {} })
  statistics!: Record<string, unknown>;

  /**
   * Metadatos adicionales
   */
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de cálculo de resultados
   */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  calculated_at!: Date;

  /**
   * Fecha y hora de distribución de recompensas
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  rewards_distributed_at?: Date;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
