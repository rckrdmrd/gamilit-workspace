import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * GuildEmblem Entity
 *
 * @description Catálogo de emblemas disponibles para personalizar gremios.
 * @table social_features.guild_emblems
 * @ticket DB-GAM-013
 * @fix H-017 (Missing entity)
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.GUILD_EMBLEMS })
@Index('idx_guild_emblems_category', ['category'])
export class GuildEmblem {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 30, default: 'standard' })
  category!: string;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium!: boolean;

  @Column({ name: 'required_level', type: 'integer', default: 1 })
  requiredLevel!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
