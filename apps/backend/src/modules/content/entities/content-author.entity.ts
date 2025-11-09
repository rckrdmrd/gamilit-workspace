import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';
import { User } from '../../auth/entities/user.entity';

/**
 * ContentAuthor Entity (content_management.content_authors)
 *
 * @description Autores de contenido educativo (profesores, creadores).
 * @schema content_management
 * @table content_authors
 *
 * IMPORTANTE:
 * - Una fila por usuario (UNIQUE constraint en user_id)
 * - Tracking de contenido creado y publicado
 * - Rating promedio del contenido
 * - Featured y verified para destacar autores
 * - Áreas de expertise en array
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/content_authors.sql
 */
@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.CONTENT_AUTHORS })
@Unique(['user_id'])
@Index('idx_content_authors_user_id', ['user_id'])
@Index('idx_content_authors_is_featured', ['is_featured'], { where: 'is_featured = true' })
@Index('idx_content_authors_is_verified', ['is_verified'], { where: 'is_verified = true' })
@Index('idx_content_authors_average_rating', ['average_rating'])
export class ContentAuthor {
  /**
   * Identificador único del autor (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID del usuario asociado
   */
  @Column({ type: 'uuid' })
  user_id!: string;

  /**
   * Nombre público del autor para mostrar
   */
  @Column({ type: 'varchar', length: 255 })
  display_name!: string;

  /**
   * Biografía del autor
   */
  @Column({ type: 'text', nullable: true })
  bio?: string;

  /**
   * Áreas de expertise del autor
   * @example ['matemáticas', 'ciencias', 'comprensión lectora']
   */
  @Column({ type: 'text', array: true, nullable: true })
  expertise_areas?: string[];

  /**
   * Total de contenido creado
   */
  @Column({ type: 'integer', default: 0 })
  total_content_created!: number;

  /**
   * Total de contenido publicado
   */
  @Column({ type: 'integer', default: 0 })
  total_content_published!: number;

  /**
   * Rating promedio del contenido (0-5)
   */
  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  average_rating?: number;

  /**
   * Indica si el autor está destacado en la plataforma
   */
  @Column({ type: 'boolean', default: false })
  is_featured!: boolean;

  /**
   * Indica si el autor está verificado por la plataforma
   */
  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  /**
   * Fecha y hora de creación
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  /**
   * Fecha y hora de última actualización
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // =====================================================
  // Relaciones
  // =====================================================

  /**
   * Usuario asociado al autor
   * Relación ManyToOne: Un autor corresponde a un usuario
   * FK: content_authors.user_id → auth.users.id
   *
   * NOTA: ON DELETE CASCADE - Si se elimina el usuario, se elimina su perfil de autor
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
