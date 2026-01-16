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
 * UserFollow Entity (social_features.user_follows)
 *
 * @description Sistema de seguimiento entre usuarios
 * @schema social_features
 * @table user_follows
 *
 * IMPORTANTE:
 * - Gestiona relaciones de seguimiento entre usuarios
 * - UNIQUE constraint: (follower_id, following_id) - previene duplicados
 * - CHECK constraint: follower_id <> following_id - previene auto-seguimiento
 * - Un usuario puede seguir a muchos y ser seguido por muchos (many-to-many)
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/user_follows.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.USER_FOLLOWS })
@Index('idx_user_follows_follower_id', ['follower_id'])
@Index('idx_user_follows_following_id', ['following_id'])
@Index('idx_user_follows_followed_at', ['followed_at'])
@Unique('user_follows_follower_following_key', ['follower_id', 'following_id'])
export class UserFollow {
  /**
   * Identificador unico del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del usuario que sigue (FK → auth.users)
   * UNIQUE con following_id: Previene seguimientos duplicados
   * CHECK: follower_id <> following_id (no puede seguirse a si mismo)
   */
  @Column({ type: 'uuid' })
    follower_id!: string;

  /**
   * ID del usuario que es seguido (FK → auth.users)
   */
  @Column({ type: 'uuid' })
    following_id!: string;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora del seguimiento
   */
  @CreateDateColumn({ type: 'timestamptz' })
    followed_at!: Date;
}
