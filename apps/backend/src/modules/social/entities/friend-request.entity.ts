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
 * FriendRequest Entity (social_features.friend_requests)
 *
 * @description Solicitudes de amistad entre usuarios - tracking de solicitudes pendientes
 * @schema social_features
 * @table friend_requests
 *
 * IMPORTANTE:
 * - Gestiona solicitudes de amistad (diferente de friendships que son relaciones aceptadas)
 * - Estados: pending, accepted, rejected, cancelled
 * - UNIQUE constraint: (requester_id, recipient_id) - previene solicitudes duplicadas
 * - CHECK constraint: requester_id <> recipient_id - previene auto-solicitud
 * - Al aceptarse, se crea registro en friendships
 *
 * @see DDL: apps/database/ddl/schemas/social_features/tables/10-friend_requests.sql
 */
@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.FRIEND_REQUESTS })
@Index('idx_friend_requests_requester', ['requester_id'])
@Index('idx_friend_requests_recipient', ['recipient_id'])
@Index('idx_friend_requests_status', ['status'])
@Unique('friend_requests_unique', ['requester_id', 'recipient_id'])
export class FriendRequest {
  /**
   * Identificador único del registro (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * ID del usuario que envía la solicitud (FK → auth_management.profiles)
   * UNIQUE con recipient_id: Previene solicitudes duplicadas
   * CHECK: requester_id <> recipient_id (no puede enviarse solicitud a sí mismo)
   */
  @Column({ type: 'uuid' })
    requester_id!: string;

  /**
   * ID del usuario que recibe la solicitud (FK → auth_management.profiles)
   */
  @Column({ type: 'uuid' })
    recipient_id!: string;

  // =====================================================
  // STATUS & CONTENT
  // =====================================================

  /**
   * Estado de la solicitud
   * Valores: pending, accepted, rejected, cancelled
   * - pending: Solicitud enviada, esperando respuesta
   * - accepted: Aceptada (se crea registro en friendships)
   * - rejected: Rechazada por el destinatario
   * - cancelled: Cancelada por el solicitante
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
    status!: string;

  /**
   * Mensaje opcional del solicitante
   */
  @Column({ type: 'text', nullable: true })
    message?: string;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * Fecha y hora de creación de la solicitud
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de respuesta (aceptación/rechazo)
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    responded_at?: Date;
}
