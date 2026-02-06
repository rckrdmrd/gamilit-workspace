import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ConversationParticipant Entity
 *
 * @description Participantes en conversaciones grupales.
 * Tracking de membresía, roles, preferencias de notificación y estado de lectura.
 * @table communication.conversation_participants
 * @ticket GAP-SOC-003
 * @fix H-017 (Missing entity)
 */
@Entity({ schema: DB_SCHEMAS.COMMUNICATION, name: DB_TABLES.COMMUNICATION.CONVERSATION_PARTICIPANTS })
@Unique(['conversationId', 'userId'])
@Index('idx_conv_participants_conversation_id', ['conversationId'])
@Index('idx_conv_participants_user_id', ['userId'])
export class ConversationParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role!: string;

  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  @Column({ name: 'left_at', type: 'timestamptz', nullable: true })
  leftAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_muted', type: 'boolean', default: false })
  isMuted!: boolean;

  @Column({ name: 'muted_until', type: 'timestamptz', nullable: true })
  mutedUntil!: Date | null;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt!: Date | null;

  @Column({ name: 'last_read_message_id', type: 'uuid', nullable: true })
  lastReadMessageId!: string | null;

  @Column({ name: 'unread_count', type: 'integer', default: 0 })
  unreadCount!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname!: string | null;

  @Column({ name: 'show_notifications', type: 'boolean', default: true })
  showNotifications!: boolean;

  @Column({ name: 'pin_order', type: 'integer', nullable: true })
  pinOrder!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
