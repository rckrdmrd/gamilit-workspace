/**
 * LtiGradePassback Entity
 *
 * Mapea a la tabla: lti_integration.lti_grade_passback
 *
 * Registro de envío de calificaciones a LMS externos vía LTI AGS
 * (Assignment and Grade Services).
 *
 * @see DDL: apps/database/ddl/schemas/lti_integration/tables/03-lti_grade_passback.sql
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
import { LtiSession } from './lti-session.entity';
import { Profile } from '../../auth/entities/profile.entity';
import { ActivityProgress, GradingProgress, PassbackStatus } from '../enums/lti-grade-passback.enums';

// Re-export enums for backward compatibility
export { ActivityProgress, GradingProgress, PassbackStatus } from '../enums/lti-grade-passback.enums';

@Entity({ schema: DB_SCHEMAS.LTI_INTEGRATION, name: DB_TABLES.LTI.LTI_GRADE_PASSBACK })
@Index(['sessionId'])
@Index(['userId'])
@Index(['consumerId'])
@Index(['passbackStatus'])
@Index(['passbackStatus', 'nextRetryAt'])
@Index(['lineitemUrl'])
@Index(['createdAt'])
export class LtiGradePassback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relaciones
  @Column('uuid', { name: 'session_id' })
  sessionId!: string;

  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @Column('uuid', { name: 'consumer_id' })
  consumerId!: string;

  // AGS Lineitem (assignment en el LMS)
  @Column('text', { name: 'lineitem_url' })
  lineitemUrl!: string; // URL del lineitem en el LMS

  @Column('text', { name: 'lineitem_id', nullable: true })
  lineitemId!: string | null; // ID del lineitem

  @Column('text', { name: 'lineitem_label', nullable: true })
  lineitemLabel!: string | null; // Etiqueta del assignment

  // Calificación
  @Column('decimal', { name: 'score_given', precision: 5, scale: 2, nullable: true })
  scoreGiven!: number | null;

  @Column('decimal', { name: 'score_maximum', precision: 5, scale: 2, default: 100 })
  scoreMaximum!: number;

  @Column('decimal', { name: 'score_percentage', precision: 5, scale: 2, nullable: true })
  scorePercentage!: number | null;

  // Activity Progress (LTI Spec)
  @Column({
    type: 'text',
    name: 'activity_progress',
    nullable: true,
  })
  activityProgress!: ActivityProgress | null;

  // Grading Progress (LTI Spec)
  @Column({
    type: 'text',
    name: 'grading_progress',
    nullable: true,
  })
  gradingProgress!: GradingProgress | null;

  // Comentario/Feedback (opcional)
  @Column('text', { nullable: true })
  comment!: string | null;

  // Estado del passback
  @Column({
    type: 'text',
    name: 'passback_status',
    default: PassbackStatus.PENDING,
  })
  passbackStatus!: PassbackStatus;

  // Respuesta del LMS
  @Column('jsonb', { name: 'lms_response', nullable: true })
  lmsResponse!: Record<string, unknown> | null;

  @Column('int', { name: 'lms_response_code', nullable: true })
  lmsResponseCode!: number | null;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage!: string | null;

  // Intentos
  @Column('int', { name: 'attempt_count', default: 0 })
  attemptCount!: number;

  @Column('int', { name: 'max_retries', default: 3 })
  maxRetries!: number;

  @Column('timestamp with time zone', { name: 'next_retry_at', nullable: true })
  nextRetryAt!: Date | null;

  // Auditoría
  @Column('timestamp with time zone', { name: 'graded_at', nullable: true })
  gradedAt!: Date | null; // Cuándo se calificó en Gamilit

  @Column('timestamp with time zone', { name: 'first_sent_at', nullable: true })
  firstSentAt!: Date | null; // Primer intento de envío

  @Column('timestamp with time zone', { name: 'last_sent_at', nullable: true })
  lastSentAt!: Date | null; // Último intento

  @Column('timestamp with time zone', { name: 'success_at', nullable: true })
  successAt!: Date | null; // Cuándo se confirmó éxito

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  // Metadata
  @Column('jsonb', { default: {} })
  metadata!: Record<string, unknown>;

  // Relaciones
  @ManyToOne(() => LtiSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: LtiSession;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Profile;

  @ManyToOne(() => LtiConsumer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consumer_id' })
  consumer!: LtiConsumer;
}
