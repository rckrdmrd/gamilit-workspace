import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { DB_TABLES, GamilityRoleEnum, UserStatusEnum } from '@shared/constants';

/**
 * User Entity (auth.users)
 *
 * @description Tabla de usuarios del sistema con autenticación y roles.
 * @schema auth
 * @table users
 *
 * IMPORTANTE:
 * - La tabla está en el schema 'auth' (NO en auth_management schema)
 * - El campo encrypted_password tiene @Exclude() para NO serializar en respuestas
 * - Relaciones: OneToOne a Profile (en profiles table)
 *
 * @see DDL: apps/database/ddl/schemas/auth/tables/01-users.sql
 */
@Entity({ schema: 'auth', name: DB_TABLES.AUTH.USERS })
@Index('idx_auth_users_email', ['email'])
@Index('idx_auth_users_role', ['role'])
export class User {
  /**
   * Identificador único del usuario (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Correo electrónico único del usuario
   */
  @Column({ type: 'text', unique: true })
  email!: string;

  /**
   * Contraseña encriptada del usuario
   * IMPORTANTE: Este campo NO se serializa en respuestas (@Exclude)
   */
  @Column({ type: 'text', name: 'encrypted_password' })
  @Exclude()
  encrypted_password!: string;

  /**
   * Rol del usuario en el sistema (student, admin_teacher, super_admin)
   */
  @Column({
    type: 'enum',
    enum: GamilityRoleEnum,
    default: GamilityRoleEnum.STUDENT,
  })
  role!: GamilityRoleEnum;

  /**
   * ID del tenant al que pertenece el usuario
   * NOTA: Esta columna NO existe en la tabla auth.users actual
   * La relación con tenant se maneja a través de auth_management.profiles
   */
  // @Column({ type: 'uuid', nullable: true })
  // tenant_id?: string;

  /**
   * Estado del usuario en el sistema
   * NOTA: Esta columna NO existe en la tabla auth.users actual
   * El estado se maneja a través de deleted_at para soft deletes
   */
  // @Column({
  //   type: 'enum',
  //   enum: UserStatusEnum,
  //   default: UserStatusEnum.ACTIVE,
  // })
  // status: UserStatusEnum;

  /**
   * Indica si el email ha sido verificado
   * NOTA: Esta columna NO existe en la tabla auth.users actual
   * Se verifica a través de email_confirmed_at (si tiene valor, está verificado)
   */
  // @Column({ type: 'boolean', default: false })
  // email_verified: boolean;

  /**
   * Fecha y hora de confirmación del email
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  email_confirmed_at?: Date;

  /**
   * Fecha y hora del último inicio de sesión
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_sign_in_at?: Date;

  /**
   * Metadatos adicionales del usuario en formato JSON
   */
  @Column({ type: 'jsonb', default: {} })
  raw_user_meta_data!: Record<string, any>;

  /**
   * Fecha y hora de eliminación lógica (soft delete)
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // =====================================================
  // Relaciones
  // =====================================================

  /**
   * Perfil del usuario (auth_management.profiles)
   * Relación OneToOne: Un usuario tiene un perfil
   * FK: profiles.user_id → users.id
   *
   * NOTA: La relación se define manualmente ya que cruza schemas (auth → auth_management)
   */
  // @OneToOne(() => Profile, (profile) => profile.user)
  // profile?: Profile;

  // Relaciones futuras:
  // @OneToMany(() => UserSession, (session) => session.user)
  // sessions?: UserSession[];

  // @OneToMany(() => AuthProvider, (provider) => provider.user)
  // auth_providers?: AuthProvider[];

  // @OneToMany(() => EmailVerificationToken, (token) => token.user)
  // email_verification_tokens?: EmailVerificationToken[];

  // @OneToMany(() => PasswordResetToken, (token) => token.user)
  // password_reset_tokens?: PasswordResetToken[];

  // @OneToMany(() => SecurityEvent, (event) => event.user)
  // security_events?: SecurityEvent[];
}
