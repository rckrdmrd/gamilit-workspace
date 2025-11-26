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
import { Profile } from '@modules/auth/entities/profile.entity';
import { Classroom } from '@modules/social/entities/classroom.entity';

/**
 * Message Entity
 *
 * @description Entidad para mensajes de comunicación entre teachers y estudiantes
 * @table communication.messages
 * @schema communication
 *
 * Tipos de mensaje soportados:
 * - direct: Mensaje directo entre teacher y estudiante
 * - classroom_announcement: Anuncio a classroom completo
 * - classroom_chat: Chat en classroom
 * - private_feedback: Feedback privado sobre tareas
 * - assignment_comment: Comentario en una tarea específica
 *
 * Relaciones:
 * - sender: Usuario que envía el mensaje (teacher)
 * - classroom: Classroom asociado (nullable)
 * - parentMessage: Mensaje padre para respuestas (nullable)
 * - replies: Respuestas a este mensaje
 *
 * @see DDL: /apps/database/ddl/schemas/communication/tables/01-messages.sql
 * @see Database-Agent: Tabla creada 2025-11-19
 */
@Entity('messages', { schema: 'communication' })
@Index('idx_messages_sender_id', ['senderId'])
@Index('idx_messages_conversation_id', ['conversationId'])
@Index('idx_messages_classroom_id', ['classroomId'])
@Index('idx_messages_type', ['type'])
@Index('idx_messages_tenant_id', ['tenantId'])
@Index('idx_messages_created_at', ['createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'sender_id' })
  @Index()
  senderId!: string;

  // ❌ CROSS-DATASOURCE RELATION DISABLED
  // TypeORM no soporta @ManyToOne entre diferentes datasources
  // Message está en 'communication' datasource, Profile está en 'auth' datasource
  // Solución: Mantener solo senderId UUID, hacer join manual en service cuando sea necesario
  // Ver: BACKEND_INVENTORY.yml - multi_datasource_architecture.cross_database_pattern
  // @ManyToOne(() => Profile, { nullable: false })
  // @JoinColumn({ name: 'sender_id' })
  // sender!: Profile;

  @Column('uuid', { name: 'conversation_id', nullable: true })
  conversationId!: string | null;

  @Column({
    type: 'text',
    enum: ['direct', 'classroom_announcement', 'classroom_chat', 'private_feedback', 'assignment_comment'],
  })
  type!: 'direct' | 'classroom_announcement' | 'classroom_chat' | 'private_feedback' | 'assignment_comment';

  @Column('text')
  subject!: string;

  @Column('text')
  content!: string;

  @Column('text', { name: 'attachment_url', nullable: true })
  attachmentUrl!: string | null;

  @Column('uuid', { name: 'classroom_id', nullable: true })
  @Index()
  classroomId!: string | null;

  // ❌ CROSS-DATASOURCE RELATION DISABLED
  // TypeORM no soporta @ManyToOne entre diferentes datasources
  // Message está en 'communication' datasource, Classroom está en 'social' datasource
  // Solución: Mantener solo classroomId UUID, hacer join manual en service cuando sea necesario
  // @ManyToOne(() => Classroom, { nullable: true })
  // @JoinColumn({ name: 'classroom_id' })
  // classroom!: Classroom | null;

  @Column('uuid', { name: 'assignment_id', nullable: true })
  assignmentId!: string | null;

  @Column('boolean', { name: 'is_read', default: false })
  isRead!: boolean;

  @Column('timestamptz', { name: 'read_at', nullable: true })
  readAt!: Date | null;

  @Column('uuid', { name: 'parent_message_id', nullable: true })
  parentMessageId!: string | null;

  @ManyToOne(() => Message, message => message.replies, { nullable: true })
  @JoinColumn({ name: 'parent_message_id' })
  parentMessage!: Message | null;

  @OneToMany(() => Message, message => message.parentMessage)
  replies!: Message[];

  @Column('uuid', { name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column('timestamptz', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  /**
   * Virtual field para recipients
   * Se carga vía query con MessageParticipant
   */
  recipients?: { userId: string; userName: string; isRead: boolean }[];
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
 * @see Database-Agent: Tabla creada 2025-11-19
 */
@Entity('message_participants', { schema: 'communication' })
@Index('idx_message_participants_message_id', ['messageId'])
@Index('idx_message_participants_user_id', ['userId'])
@Index('idx_message_participants_is_read', ['isRead'])
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

  // ❌ CROSS-DATASOURCE RELATION DISABLED
  // TypeORM no soporta @ManyToOne entre diferentes datasources
  // MessageParticipant está en 'communication' datasource, Profile está en 'auth' datasource
  // Solución: Mantener solo userId UUID, hacer join manual en service cuando sea necesario
  // @ManyToOne(() => Profile, { nullable: false })
  // @JoinColumn({ name: 'user_id' })
  // user!: Profile;

  @Column({
    type: 'text',
    enum: ['sender', 'recipient', 'cc'],
  })
  role!: 'sender' | 'recipient' | 'cc';

  @Column('boolean', { name: 'is_read', default: false })
  isRead!: boolean;

  @Column('timestamptz', { name: 'read_at', nullable: true })
  readAt!: Date | null;
}
