import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * UserBlock Entity
 *
 * @description Bloqueos entre usuarios para seguridad social.
 * Previene mensajes y solicitudes de retos entre usuarios bloqueados.
 * @table social_features.user_blocks
 * @ticket GAP-SOC-004
 * @fix H-031 (Safety features missing for EdTech)
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.USER_BLOCKS })
@Unique(['blockerId', 'blockedId'])
@Index('idx_user_blocks_blocker_id', ['blockerId'])
@Index('idx_user_blocks_blocked_id', ['blockedId'])
export class UserBlock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'blocker_id', type: 'uuid' })
  blockerId!: string;

  @Column({ name: 'blocked_id', type: 'uuid' })
  blockedId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
