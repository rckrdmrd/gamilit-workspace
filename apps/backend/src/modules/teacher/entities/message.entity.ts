import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * Message Type Enum
 * Tipos de mensaje soportados en el sistema
 */
export type MessageType =
  | 'direct'
  | 'classroom_announcement'
  | 'classroom_chat'
  | 'private_feedback'
  | 'assignment_comment'
  | 'system';

/**
 * Message Priority Enum
 */
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Moderation Status Enum
 */
export type ModerationStatus = 'approved' | 'pending' | 'flagged' | 'removed';

/**
 * Message Entity
 *
 * @description Entidad para mensajes de comunicación entre teachers y estudiantes
 * @table communication.messages
 * @schema communication
 *
 * ISS-SYNC-001: Entity alineada con DDL 2026-01-04
 *
 * Tipos de mensaje soportados:
 * - direct: Mensaje directo entre teacher y estudiante
 * - classroom_announcement: Anuncio a classroom completo
 * - classroom_chat: Chat en classroom
 * - private_feedback: Feedback privado sobre tareas
 * - assignment_comment: Comentario en una tarea específica
 * - system: Mensajes del sistema
 *
 * @see DDL: /apps/database/ddl/schemas/communication/tables/01-messages.sql
 */
@Entity(DB_TABLES.COMMUNICATION.MESSAGES, { schema: DB_SCHEMAS.COMMUNICATION })
@Index('idx_messages_sender', ['senderId', 'createdAt'])
@Index('idx_messages_recipient', ['recipientId', 'createdAt'])
@Index('idx_messages_classroom', ['classroomId', 'createdAt'])
@Index('idx_messages_thread', ['threadId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =========================================================================
  // Message relationships
  // =========================================================================

  @Column('uuid', { name: 'sender_id' })
  @Index()
  senderId!: string;

  @Column('uuid', { name: 'recipient_id', nullable: true })
  @Index()
  recipientId!: string | null;

  @Column('uuid', { name: 'classroom_id', nullable: true })
  @Index()
  classroomId!: string | null;

  @Column('uuid', { name: 'thread_id', nullable: true })
  threadId!: string | null;

  @Column('uuid', { name: 'parent_message_id', nullable: true })
  parentMessageId!: string | null;

  @ManyToOne(() => Message, (message) => message.replies, { nullable: true })
  @JoinColumn({ name: 'parent_message_id' })
  parentMessage!: Message | null;

  @OneToMany(() => Message, (message) => message.parentMessage)
  replies!: Message[];

  // =========================================================================
  // Message content
  // =========================================================================

  @Column('varchar', { length: 255, nullable: true })
  subject!: string | null;

  @Column('text')
  content!: string;

  @Column('varchar', { name: 'message_type', length: 50, default: 'direct' })
  messageType!: MessageType;

  @Column('jsonb', { default: '[]' })
  attachments!: Record<string, unknown>[];

  // =========================================================================
  // Message status
  // =========================================================================

  @Column('boolean', { name: 'is_read', default: false })
  isRead!: boolean;

  @Column('timestamptz', { name: 'read_at', nullable: true })
  readAt!: Date | null;

  @Column('boolean', { name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @Column('timestamptz', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column('uuid', { name: 'deleted_by', nullable: true })
  deletedBy!: string | null;

  // =========================================================================
  // Priority and flags
  // =========================================================================

  @Column('varchar', { length: 20, default: 'normal' })
  priority!: MessagePriority;

  @Column('boolean', { name: 'is_pinned', default: false })
  isPinned!: boolean;

  @Column('boolean', { name: 'is_archived', default: false })
  isArchived!: boolean;

  @Column('boolean', { name: 'requires_response', default: false })
  requiresResponse!: boolean;

  @Column('timestamptz', { name: 'response_deadline', nullable: true })
  responseDeadline!: Date | null;

  // =========================================================================
  // Reactions and engagement
  // =========================================================================

  @Column('jsonb', { default: '{}' })
  reactions!: Record<string, string[]>;

  // =========================================================================
  // Moderation
  // =========================================================================

  @Column('boolean', { name: 'is_flagged', default: false })
  isFlagged!: boolean;

  @Column('text', { name: 'flagged_reason', nullable: true })
  flaggedReason!: string | null;

  @Column('uuid', { name: 'flagged_by', nullable: true })
  flaggedBy!: string | null;

  @Column('timestamptz', { name: 'flagged_at', nullable: true })
  flaggedAt!: Date | null;

  @Column('varchar', { name: 'moderation_status', length: 50, default: 'approved' })
  moderationStatus!: ModerationStatus;

  // =========================================================================
  // Metadata
  // =========================================================================

  @Column('jsonb', { default: '{}' })
  metadata!: Record<string, unknown>;

  // =========================================================================
  // Audit fields
  // =========================================================================

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column('timestamptz', { name: 'edited_at', nullable: true })
  editedAt!: Date | null;

  @Column('int', { name: 'edit_count', default: 0 })
  editCount!: number;

  // =========================================================================
  // Virtual fields (loaded via separate queries)
  // =========================================================================

  /**
   * Virtual field para recipients (cargado via MessageParticipant)
   */
  recipients?: { userId: string; userName: string; isRead: boolean }[];

  /**
   * Virtual field para sender name (cargado via join con profiles)
   */
  senderName?: string;

  /**
   * Virtual field para sender avatar (cargado via join con profiles)
   */
  senderAvatar?: string;
}

/**
 * MessageParticipant Entity
 *
 * @description Participantes de mensajes (sender/recipient/cc)
 * @table communication.message_participants
 * @schema communication
 *
 * Define los participantes de cada mensaje y su estado de lectura individual.
 * Permite implementar funcionalidad de "marcar como leído" por usuario.
 *
 * Roles:
 * - sender: Usuario que envió el mensaje
 * - recipient: Destinatario principal
 * - cc: Copia para conocimiento
 *
 * @see DDL: /apps/database/ddl/schemas/communication/tables/02-message_participants.sql
 */
@Entity(DB_TABLES.COMMUNICATION.MESSAGE_PARTICIPANTS, { schema: DB_SCHEMAS.COMMUNICATION })
@Index('idx_message_participants_message_id', ['messageId'])
@Index('idx_message_participants_user_id', ['userId'])
@Index('idx_message_participants_unread', ['userId', 'messageId'])
export class MessageParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'message_id' })
  @Index()
  messageId!: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message!: Message;

  @Column('uuid', { name: 'user_id' })
  @Index()
  userId!: string;

  @Column('varchar', { length: 20, default: 'recipient' })
  role!: 'sender' | 'recipient' | 'cc';

  @Column('boolean', { name: 'is_read', default: false })
  isRead!: boolean;

  @Column('timestamptz', { name: 'read_at', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
