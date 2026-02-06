/**
 * TeamVsTeamChallenge Entity
 *
 * @description Team-based competitive challenges with full lifecycle.
 * Supports guild wars, classroom battles, tournament matches.
 *
 * FIX H-039: Entity created for DDL table team_vs_team_challenges (37+ columns)
 * NOTE: This is DIFFERENT from team_challenges (simple team-challenge assignments).
 *
 * @schema social_features
 * @table team_vs_team_challenges
 * @see DDL: apps/database/ddl/schemas/social_features/tables/27-team_vs_team_challenges.sql
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({
  schema: DB_SCHEMAS.SOCIAL,
  name: DB_TABLES.SOCIAL.TEAM_VS_TEAM_CHALLENGES,
})
@Index('idx_team_vs_team_challenges_status', ['status'])
@Index('idx_team_vs_team_challenges_team_a_captain', ['teamACaptainId'])
@Index('idx_team_vs_team_challenges_team_b_captain', ['teamBCaptainId'])
@Index('idx_team_vs_team_challenges_created_by', ['createdBy'])
export class TeamVsTeamChallenge {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // ============================================================================
  // CHALLENGE INFO
  // ============================================================================

  /**
   * Challenge title (min 3 chars)
   */
  @Column({ type: 'varchar', length: 200 })
    title!: string;

  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Type of challenge
   * Values: team_vs_team, guild_war, classroom_battle, tournament_match
   */
  @Column({
    name: 'challenge_type',
    type: 'varchar',
    length: 50,
    default: 'team_vs_team',
  })
    challengeType!: string;

  // ============================================================================
  // TEAM A (Challenger)
  // ============================================================================

  /**
   * Type of Team A: guild, classroom, team, custom
   */
  @Column({ name: 'team_a_type', type: 'varchar', length: 50 })
    teamAType!: string;

  @Column({ name: 'team_a_id', type: 'uuid', nullable: true })
    teamAId?: string;

  @Column({ name: 'team_a_name', type: 'varchar', length: 100, nullable: true })
    teamAName?: string;

  /**
   * Array of team A member profile UUIDs (NOT NULL, at least 1)
   */
  @Column({ name: 'team_a_members', type: 'uuid', array: true })
    teamAMembers!: string[];

  /**
   * Team A captain (FK → auth_management.profiles, ON DELETE RESTRICT)
   */
  @Column({ name: 'team_a_captain_id', type: 'uuid' })
    teamACaptainId!: string;

  // ============================================================================
  // TEAM B (Challenged)
  // ============================================================================

  @Column({ name: 'team_b_type', type: 'varchar', length: 50, nullable: true })
    teamBType?: string;

  @Column({ name: 'team_b_id', type: 'uuid', nullable: true })
    teamBId?: string;

  @Column({ name: 'team_b_name', type: 'varchar', length: 100, nullable: true })
    teamBName?: string;

  @Column({ name: 'team_b_members', type: 'uuid', array: true, nullable: true })
    teamBMembers?: string[];

  /**
   * Team B captain (FK → auth_management.profiles, ON DELETE RESTRICT)
   */
  @Column({ name: 'team_b_captain_id', type: 'uuid', nullable: true })
    teamBCaptainId?: string;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  @Column({ name: 'min_team_size', type: 'integer', default: 2 })
    minTeamSize!: number;

  @Column({ name: 'max_team_size', type: 'integer', default: 5 })
    maxTeamSize!: number;

  /**
   * Exercise UUIDs for the challenge
   */
  @Column({ name: 'exercise_ids', type: 'uuid', array: true, nullable: true })
    exerciseIds?: string[];

  /**
   * Module ID (FK → educational_content.modules, ON DELETE SET NULL)
   */
  @Column({ name: 'module_id', type: 'uuid', nullable: true })
    moduleId?: string;

  @Column({ name: 'time_limit_minutes', type: 'integer', nullable: true })
    timeLimitMinutes?: number;

  /**
   * Scoring method: total_points, average, best_n, time_based, accuracy
   */
  @Column({
    name: 'scoring_method',
    type: 'varchar',
    length: 50,
    default: 'total_points',
  })
    scoringMethod!: string;

  @Column({ name: 'best_n_count', type: 'integer', default: 3 })
    bestNCount!: number;

  /**
   * Rewards configuration (winner/loser/draw bonuses)
   */
  @Column({ type: 'jsonb', default: {} })
    rewards!: Record<string, unknown>;

  // ============================================================================
  // STATUS & RESULTS
  // ============================================================================

  /**
   * Lifecycle status: pending, accepted, in_progress, completed, cancelled, expired, declined
   */
  @Column({ type: 'varchar', length: 50, default: 'pending' })
    status!: string;

  /**
   * Winner: 'a', 'b', or 'draw' (null if not completed)
   */
  @Column({ name: 'winner_team', type: 'varchar', length: 10, nullable: true })
    winnerTeam?: string;

  @Column({ name: 'team_a_score', type: 'integer', default: 0 })
    teamAScore!: number;

  @Column({ name: 'team_b_score', type: 'integer', default: 0 })
    teamBScore!: number;

  @Column({ name: 'team_a_accuracy', type: 'numeric', precision: 5, scale: 2, nullable: true })
    teamAAccuracy?: number;

  @Column({ name: 'team_b_accuracy', type: 'numeric', precision: 5, scale: 2, nullable: true })
    teamBAccuracy?: number;

  @Column({ name: 'team_a_avg_time_seconds', type: 'integer', nullable: true })
    teamAAvgTimeSeconds?: number;

  @Column({ name: 'team_b_avg_time_seconds', type: 'integer', nullable: true })
    teamBAvgTimeSeconds?: number;

  @Column({ name: 'results_detail', type: 'jsonb', default: {} })
    resultsDetail!: Record<string, unknown>;

  // ============================================================================
  // LIFECYCLE TIMESTAMPS
  // ============================================================================

  /**
   * Creator (FK → auth_management.profiles, ON DELETE RESTRICT)
   */
  @Column({ name: 'created_by', type: 'uuid' })
    createdBy!: string;

  @Column({ name: 'invitation_expires_at', type: 'timestamp with time zone', nullable: true })
    invitationExpiresAt?: Date;

  @Column({ name: 'accepted_at', type: 'timestamp with time zone', nullable: true })
    acceptedAt?: Date;

  @Column({ name: 'starts_at', type: 'timestamp with time zone', nullable: true })
    startsAt?: Date;

  @Column({ name: 'ends_at', type: 'timestamp with time zone', nullable: true })
    endsAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
    completedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt!: Date;
}
