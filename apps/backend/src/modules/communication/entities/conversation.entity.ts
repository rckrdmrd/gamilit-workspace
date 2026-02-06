import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * Conversation Entity
 *
 * @description Contenedor de conversaciones para mensajería grupal.
 * Soporta conversaciones directas (1-1), grupales y vinculadas a classroom.
 * @table communication.conversations
 * @ticket GAP-SOC-003
 * @fix H-017 (Missing entity)
 */
@Entity({ schema: DB_SCHEMAS.COMMUNICATION, name: DB_TABLES.COMMUNICATION.CONVERSATIONS })
@Index('idx_conversations_created_by', ['createdBy'])
@Index('idx_conversations_type', ['conversationType'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'conversation_type', type: 'varchar', length: 30, default: 'direct' })
  conversationType!: string;

  @Column({ name: 'classroom_id', type: 'uuid', nullable: true })
  classroomId!: string | null;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived!: boolean;

  @Column({ name: 'is_readonly', type: 'boolean', default: false })
  isReadonly!: boolean;

  @Column({ name: 'allow_reactions', type: 'boolean', default: true })
  allowReactions!: boolean;

  @Column({ name: 'allow_replies', type: 'boolean', default: true })
  allowReplies!: boolean;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'last_message_id', type: 'uuid', nullable: true })
  lastMessageId!: string | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt!: Date | null;

  @Column({ name: 'last_message_preview', type: 'text', nullable: true })
  lastMessagePreview!: string | null;

  @Column({ name: 'message_count', type: 'integer', default: 0 })
  messageCount!: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
