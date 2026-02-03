/**
 * Guild Join Request Entity
 *
 * @description Represents a request from a user to join a guild.
 * Leaders and officers can approve or reject these requests.
 *
 * @module social/entities
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 * @schema social_features
 * @table guild_join_requests
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
 * Status of a guild join request
 */
export enum GuildJoinRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity({ schema: DB_SCHEMAS.SOCIAL, name: 'guild_join_requests' })
@Index('idx_guild_join_requests_guild', ['guildId'])
@Index('idx_guild_join_requests_requester', ['requesterId'])
@Index('idx_guild_join_requests_status', ['status'])
@Index('idx_guild_join_requests_guild_status', ['guildId', 'status'])
export class GuildJoinRequest {
  /**
   * Unique identifier (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID of the guild being requested to join (FK to guilds)
   */
  @Column({ name: 'guild_id', type: 'uuid' })
  guildId: string;

  /**
   * ID of the user requesting to join (FK to profiles)
   */
  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  /**
   * Optional message from the requester
   */
  @Column({ type: 'text', nullable: true })
  message: string;

  /**
   * Current status of the request
   */
  @Column({ type: 'varchar', length: 20, default: GuildJoinRequestStatus.PENDING })
  status: GuildJoinRequestStatus;

  /**
   * ID of the user who responded to the request (FK to profiles)
   */
  @Column({ name: 'responded_by', type: 'uuid', nullable: true })
  respondedBy: string;

  /**
   * When the request was created
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * When the request was responded to
   */
  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date;

  // =====================================================
  // RELATIONS
  // =====================================================

  /**
   * The guild this request is for
   */
  @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;
}
