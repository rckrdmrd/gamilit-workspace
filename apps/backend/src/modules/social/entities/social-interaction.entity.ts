import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * SocialInteraction Entity (social_features.social_interactions)
 *
 * @description Registro de interacciones sociales entre usuarios.
 * Soporta likes, comments, shares, mentions, badges, help requests/provided.
 * @schema social_features
 * @table social_interactions
 *
 * @created TASK-022 P1-3 - Coherencia DDL-Entity
 * @see DDL: apps/database/ddl/schemas/social_features/tables/social_interactions.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.SOCIAL_INTERACTIONS })
@Index('idx_social_interactions_user_id', ['user_id'])
@Index('idx_social_interactions_type', ['interaction_type'])
@Index('idx_social_interactions_created_at', ['created_at'])
export class SocialInteraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario que realiza la interacción (FK → auth.users)
   */
  @Column({ type: 'uuid' })
  user_id!: string;

  /**
   * ID del usuario objetivo (FK → auth.users), nullable para interacciones sin target
   */
  @Column({ type: 'uuid', nullable: true })
  target_user_id?: string | null;

  /**
   * Tipo de interacción: like, comment, share, mention, badge_given, help_request, help_provided
   */
  @Column({ type: 'varchar', length: 50 })
  interaction_type!: string;

  /**
   * Tipo de contenido con el que se interactúa (opcional)
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  content_type?: string | null;

  /**
   * ID del contenido con el que se interactúa (opcional)
   */
  @Column({ type: 'uuid', nullable: true })
  content_id?: string | null;

  /**
   * Datos adicionales de la interacción (JSONB)
   */
  @Column({ type: 'jsonb', nullable: true })
  interaction_data?: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
