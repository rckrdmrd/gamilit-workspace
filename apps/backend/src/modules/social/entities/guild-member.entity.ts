/**
 * Guild Member Entity
 *
 * @description Represents membership of a user in a guild.
 * Tracks role, contribution XP, and missions completed.
 *
 * @module social/entities
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 * @schema social_features
 * @table guild_members
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
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { Guild } from './guild.entity';

/**
 * Roles that a member can have in a guild
 */
export enum GuildMemberRole {
  LEADER = 'leader',
  OFFICER = 'officer',
  MEMBER = 'member',
}

@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.GUILD_MEMBERS })
@Index('idx_guild_members_guild', ['guildId'])
@Index('idx_guild_members_user', ['userId'], { unique: true })
@Index('idx_guild_members_role', ['role'])
export class GuildMember {
  /**
   * Unique identifier (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID of the guild (FK to guilds)
   */
  @Column({ name: 'guild_id', type: 'uuid' })
  guildId: string;

  /**
   * ID of the user (FK to profiles) - unique, user can only be in one guild
   */
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  /**
   * Role of the member in the guild
   */
  @Column({ type: 'varchar', length: 20, default: GuildMemberRole.MEMBER })
  role: GuildMemberRole;

  /**
   * XP contributed to the guild by this member
   */
  @Column({ name: 'contribution_xp', type: 'bigint', default: 0 })
  contributionXp: number;

  /**
   * Number of guild missions completed by this member
   */
  @Column({ name: 'missions_completed', type: 'integer', default: 0 })
  missionsCompleted: number;

  /**
   * When the member joined the guild
   */
  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;

  /**
   * Last time this member contributed XP to the guild
   */
  @Column({ name: 'last_contribution_at', type: 'timestamptz', nullable: true })
  lastContributionAt: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * The guild this membership belongs to
   */
  @ManyToOne(() => Guild, (guild) => guild.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;
}
