/**
 * Guild Entity
 *
 * @description Guilds are groups of users that collaborate and compete together.
 * Users can create guilds, invite members, and participate in guild missions.
 *
 * @module social/entities
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 * @schema social_features
 * @table guilds
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { DB_SCHEMAS } from '@shared/constants/database.constants';
import { GuildMember } from './guild-member.entity';

@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'guilds' })
@Index('idx_guilds_name', ['name'], { unique: true })
@Index('idx_guilds_leader', ['leaderId'])
@Index('idx_guilds_public_active', ['isPublic', 'isActive'])
@Index('idx_guilds_xp', ['totalXp'])
export class Guild {
  /**
   * Unique identifier (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Guild name (unique, max 30 characters)
   */
  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  /**
   * Guild description
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * ID of the guild emblem (FK to guild_emblems)
   */
  @Column({ name: 'emblem_id', type: 'integer', default: 1 })
  emblemId: number;

  /**
   * ID of the guild leader (FK to profiles)
   */
  @Column({ name: 'leader_id', type: 'uuid' })
  leaderId: string;

  /**
   * Current member count
   */
  @Column({ name: 'member_count', type: 'integer', default: 1 })
  memberCount: number;

  /**
   * Guild level (calculated from XP)
   */
  @Column({ type: 'integer', default: 1 })
  level: number;

  /**
   * Total XP accumulated by the guild
   */
  @Column({ name: 'total_xp', type: 'bigint', default: 0 })
  totalXp: number;

  /**
   * Whether the guild is public and accepts join requests
   */
  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  /**
   * Whether the guild is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * Last update timestamp
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Last activity timestamp (updated when members contribute)
   */
  @Column({ name: 'last_activity_at', type: 'timestamptz', nullable: true })
  lastActivityAt: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * Guild members
   */
  @OneToMany(() => GuildMember, (member) => member.guild)
  members: GuildMember[];
}
