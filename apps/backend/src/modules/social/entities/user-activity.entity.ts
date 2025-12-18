import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * UserActivity Entity (social_features.user_activities)
 *
 * @description Registro de actividades de usuarios para el Activity Feed
 * @schema social_features
 * @table user_activities
 *
 * IMPORTANTE:
 * - Almacena actividades públicas de usuarios (achievements, level_ups, exercises, etc.)
 * - activity_type: achievement, level_up, streak, friend_request, exercise, challenge, guild, rankup
 * - metadata: JSONB con datos adicionales (achievementId, exerciseId, newRank, etc.)
 * - is_public: Controla visibilidad en el feed de amigos
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/09-user_activities.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.USER_ACTIVITIES })
@Index('idx_user_activities_user_id', ['user_id'])
@Index('idx_user_activities_created_at', ['created_at'])
@Index('idx_user_activities_type', ['activity_type'])
@Index('idx_user_activities_is_public', ['is_public'])
export class UserActivity {
  /**
   * Identificador único de la actividad (UUID)
   */
  @PrimaryGeneratedColumn('uuid', { name: 'activity_id' })
    activity_id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del usuario que realizó la actividad (FK → auth.users)
   */
  @Column({ type: 'uuid' })
    user_id!: string;

  // =====================================================
  // ACTIVITY DATA
  // =====================================================

  /**
   * Tipo de actividad
   * Valores: achievement, level_up, streak, friend_request, exercise, challenge, guild, rankup
   */
  @Column({ type: 'varchar', length: 50 })
    activity_type!: string;

  /**
   * Título de la actividad (breve resumen)
   */
  @Column({ type: 'varchar', length: 255 })
    title!: string;

  /**
   * Descripción detallada de la actividad
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Metadatos adicionales en formato JSONB
   * Ejemplos:
   * - { achievementId: 'uuid', achievementName: 'string' }
   * - { exerciseId: 'uuid', exerciseName: 'string', score: number }
   * - { newRank: 'string', oldRank: 'string' }
   * - { challengeId: 'uuid' }
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * Indica si la actividad es visible para amigos
   */
  @Column({ type: 'boolean', default: true })
    is_public!: boolean;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de creación de la actividad
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;
}
