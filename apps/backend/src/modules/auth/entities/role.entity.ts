import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '../../../shared/constants/database.constants';

/**
 * Role Entity
 *
 * @description Representa los roles del sistema para RBAC (Role-Based Access Control)
 * @schema auth_management
 * @table roles
 *
 * Roles del sistema:
 * - student: Estudiante
 * - teacher: Profesor
 * - parent: Padre/Tutor
 * - admin: Administrador
 * - content_creator: Creador de contenido
 * - school_admin: Administrador de escuela
 */
@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.ROLES })
export class Role {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Nombre único del rol
   * @example 'student', 'teacher', 'admin'
   */
  @Column({ type: 'varchar', unique: true })
    name!: string;

  /**
   * Descripción del rol
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Permisos del rol en formato JSON
   * @example { "can_create_content": true, "can_delete_users": false }
   */
  @Column({ type: 'jsonb', default: {} })
    permissions!: Record<string, boolean>;

  /**
   * Indica si el rol está activo
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  /**
   * Fecha de creación
   */
  @CreateDateColumn()
    created_at!: Date;

  /**
   * Fecha de última actualización
   */
  @UpdateDateColumn()
    updated_at!: Date;

  // ============================================================================
  // RELACIONES
  // ============================================================================

  // FIX H-022: @ManyToMany removed - DDL user_roles is NOT a standard junction table.
  // user_roles has `role` ENUM column (not `role_id` FK to roles table)
  // user_roles.user_id → profiles(id) (not users(id))
  // Access user-role mappings via UserRole entity instead.
}
