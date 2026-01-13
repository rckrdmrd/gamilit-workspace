/**
 * UserFollow Entity
 *
 * Mapea a la tabla: social_features.user_follows
 *
 * @description Sistema de seguimiento entre usuarios
 * @source apps/database/ddl/schemas/social_features/tables/user_follows.sql
 * @version 1.0.0 (2026-01-13) - GAP-004
 *
 * CARACTERÍSTICAS:
 * - Relación unidireccional (follower -> following)
 * - Constraint para evitar auto-seguimiento
 * - Índices para búsqueda eficiente de seguidores/seguidos
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

@Entity({
  schema: DB_SCHEMAS.SOCIAL,
  name: DB_TABLES.SOCIAL.USER_FOLLOWS,
})
@Index(['followerId'])
@Index(['followingId'])
@Index(['followedAt'])
@Unique(['followerId', 'followingId'])
@Check('"follower_id" != "following_id"')
export class UserFollow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Usuario que sigue (el que realiza la acción de seguir)
   */
  @Column({ name: 'follower_id', type: 'uuid' })
  followerId!: string;

  /**
   * Usuario siendo seguido
   */
  @Column({ name: 'following_id', type: 'uuid' })
  followingId!: string;

  /**
   * Fecha en que se inició el seguimiento
   */
  @CreateDateColumn({ name: 'followed_at', type: 'timestamp with time zone' })
  followedAt!: Date;
}
