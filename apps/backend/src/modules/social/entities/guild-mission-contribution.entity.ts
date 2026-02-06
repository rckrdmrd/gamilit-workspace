/**
 * GuildMissionContribution Entity
 *
 * @description Individual member contributions to guild missions.
 * Immutable audit trail of contributions - no updated_at.
 *
 * FIX H-017: Entity created for DDL table guild_mission_contributions
 *
 * @schema social_features
 * @table guild_mission_contributions
 * @see DDL: apps/database/ddl/schemas/social_features/tables/24-guild_missions.sql
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({
  schema: DB_SCHEMAS.SOCIAL,
  name: DB_TABLES.SOCIAL.GUILD_MISSION_CONTRIBUTIONS,
})
@Index('idx_guild_mission_contributions_mission', ['missionId'])
@Index('idx_guild_mission_contributions_user', ['userId'])
@Index('idx_guild_mission_contributions_contributed_at', ['contributedAt'])
@Unique('guild_mission_contributions_unique', ['missionId', 'userId', 'contributedAt'])
export class GuildMissionContribution {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * ID of the guild mission (FK → social_features.guild_missions)
   */
  @Column({ name: 'mission_id', type: 'uuid' })
    missionId!: string;

  /**
   * ID of the contributing user (FK → auth_management.profiles)
   */
  @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

  /**
   * Amount of contribution (must be > 0)
   * DDL CHECK: contribution_value > 0
   */
  @Column({ name: 'contribution_value', type: 'integer' })
    contributionValue!: number;

  /**
   * When the contribution was made
   */
  @Column({
    name: 'contributed_at',
    type: 'timestamp with time zone',
    default: () => 'gamilit.now_mexico()',
  })
    contributedAt!: Date;
}
