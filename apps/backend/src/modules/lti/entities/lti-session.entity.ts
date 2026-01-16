/**
 * LtiSession Entity
 *
 * Mapea a la tabla: lti_integration.lti_sessions
 *
 * Sesiones activas de LTI - tracking de launches desde LMS externos.
 *
 * @see DDL: apps/database/ddl/schemas/lti_integration/tables/02-lti_sessions.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { LtiConsumer } from './lti-consumer.entity';
import { Profile } from '../../auth/entities/profile.entity';

@Entity({ schema: DB_SCHEMAS.LTI_INTEGRATION, name: DB_TABLES.LTI.LTI_SESSIONS })
@Index(['consumerId'])
@Index(['userId'])
@Index(['launchId'])
@Index(['contextId'])
@Index(['resourceLinkId'])
@Index(['isActive'])
@Index(['launchedAt'])
@Index(['consumerId', 'lmsUserId'])
export class LtiSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relaciones
  @Column('uuid', { name: 'consumer_id' })
  consumerId!: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId!: string | null;

  // Identificadores LTI
  @Column('text', { name: 'launch_id' })
  launchId!: string; // ID único del launch

  @Column('text', { name: 'message_type' })
  messageType!: string; // LtiResourceLinkRequest, LtiDeepLinkingRequest, etc.

  // Contexto del LMS
  @Column('text', { name: 'context_id', nullable: true })
  contextId!: string | null; // Course ID en el LMS

  @Column('text', { name: 'context_label', nullable: true })
  contextLabel!: string | null; // Código del curso (e.g., "CS101")

  @Column('text', { name: 'context_title', nullable: true })
  contextTitle!: string | null; // Nombre del curso

  // Resource Link
  @Column('text', { name: 'resource_link_id', nullable: true })
  resourceLinkId!: string | null; // ID del resource link

  @Column('text', { name: 'resource_link_title', nullable: true })
  resourceLinkTitle!: string | null; // Título del contenido/assignment

  @Column('text', { name: 'resource_link_description', nullable: true })
  resourceLinkDescription!: string | null;

  // Usuario en el LMS
  @Column('text', { name: 'lms_user_id', nullable: true })
  lmsUserId!: string | null; // User ID en el LMS

  @Column('text', { name: 'lms_user_email', nullable: true })
  lmsUserEmail!: string | null;

  @Column('text', { name: 'lms_user_name', nullable: true })
  lmsUserName!: string | null;

  @Column('text', { name: 'lms_user_roles', array: true, nullable: true })
  lmsUserRoles!: string[] | null; // Roles en el LMS (Learner, Instructor, etc.)

  // Claims del JWT
  @Column('jsonb', { name: 'id_token_claims', default: {} })
  idTokenClaims!: Record<string, unknown>;

  // Configuración de la sesión
  @Column('text', { default: 'es-MX' })
  locale!: string;

  @Column('text', { nullable: true })
  timezone!: string | null;

  // Return URL (para volver al LMS)
  @Column('text', { name: 'return_url', nullable: true })
  returnUrl!: string | null;

  // Estado de la sesión
  @Column('text', { name: 'session_state', nullable: true })
  sessionState!: string | null;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  // Auditoría
  @CreateDateColumn({
    name: 'launched_at',
    type: 'timestamp with time zone',
  })
  launchedAt!: Date;

  @Column('timestamp with time zone', { name: 'last_activity_at', nullable: true })
  lastActivityAt!: Date | null;

  @Column('timestamp with time zone', { name: 'ended_at', nullable: true })
  endedAt!: Date | null;

  // Metadata
  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  // Relaciones
  @ManyToOne(() => LtiConsumer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consumer_id' })
  consumer!: LtiConsumer;

  @ManyToOne(() => Profile, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: Profile | null;
}
