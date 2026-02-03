/**
 * Guild Mission Entity
 *
 * @description Represents a mission/challenge assigned to a guild.
 * Guild members collaborate to complete missions and earn rewards.
 *
 * @module social/entities
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 * @schema social_features
 * @table guild_missions
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS } from '@shared/constants/database.constants';
import { Guild } from './guild.entity';

/**
 * Types of guild missions
 */
export enum GuildMissionType {
  EXERCISES_COMPLETED = 'exercises_completed',
  TOTAL_SCORE = 'total_score',
  STREAK_DAYS = 'streak_days',
  PERFECT_SCORES = 'perfect_scores',
  SUBJECTS_COMPLETED = 'subjects_completed',
  TIME_SPENT = 'time_spent',
}

/**
 * Difficulty levels for guild missions
 */
export enum GuildMissionDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EPIC = 'epic',
}

/**
 * Status of a guild mission
 */
export enum GuildMissionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'guild_missions' })
@Index('idx_guild_missions_guild', ['guildId'])
@Index('idx_guild_missions_status', ['status'])
@Index('idx_guild_missions_guild_status', ['guildId', 'status'])
@Index('idx_guild_missions_expires', ['expiresAt'])
export class GuildMission {
  /**
   * Unique identifier (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID of the guild this mission belongs to (FK to guilds)
   */
  @Column({ name: 'guild_id', type: 'uuid' })
  guildId: string;

  /**
   * Mission title
   */
  @Column({ type: 'varchar', length: 100 })
  title: string;

  /**
   * Mission description
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Type of mission (what metric to track)
   */
  @Column({ name: 'mission_type', type: 'varchar', length: 30 })
  missionType: GuildMissionType;

  /**
   * Target value to reach to complete the mission
   */
  @Column({ name: 'target_value', type: 'integer' })
  targetValue: number;

  /**
   * Current progress value
   */
  @Column({ name: 'current_value', type: 'integer', default: 0 })
  currentValue: number;

  /**
   * XP reward for completing the mission
   */
  @Column({ name: 'reward_xp', type: 'integer', default: 100 })
  rewardXp: number;

  /**
   * Coins reward for completing the mission
   */
  @Column({ name: 'reward_coins', type: 'integer', default: 50 })
  rewardCoins: number;

  /**
   * Difficulty level of the mission
   */
  @Column({ type: 'varchar', length: 20, default: GuildMissionDifficulty.NORMAL })
  difficulty: GuildMissionDifficulty;

  /**
   * Current status of the mission
   */
  @Column({ type: 'varchar', length: 20, default: GuildMissionStatus.ACTIVE })
  status: GuildMissionStatus;

  /**
   * When the mission starts
   */
  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  /**
   * When the mission expires (null = no expiration)
   */
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  /**
   * When the mission was completed
   */
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  /**
   * When the mission was created
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * The guild this mission belongs to
   */
  @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;
}
