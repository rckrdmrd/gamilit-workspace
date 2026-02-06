import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { AuthProviderEnum } from '@shared/constants/enums.constants';

/**
 * AuthProvider Entity
 *
 * @description Configuración de proveedores de autenticación OAuth/Social.
 * Tabla de configuración global (NO per-user). Define qué proveedores
 * OAuth están habilitados y sus credenciales.
 * @table auth_management.auth_providers
 *
 * FIX H-021: Entity completamente reescrita para alinear con DDL.
 * Antes: modelo per-user (user_id, access_token, refresh_token)
 * Ahora: modelo de configuración global (client_id, client_secret, URLs OAuth)
 *
 * SEGURIDAD:
 * - client_secret tiene @Exclude() para NO serializar en respuestas
 * - NUNCA exponer credenciales OAuth en DTOs de respuesta
 *
 * @see DDL: /apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql
 */
@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.AUTH_PROVIDERS })
@Unique(['providerName'])
@Index('idx_auth_providers_enabled', ['isEnabled'])
@Index('idx_auth_providers_priority', ['priority'])
export class AuthProvider {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'provider_name',
    type: 'enum',
    enum: AuthProviderEnum,
  })
  providerName!: AuthProviderEnum;

  @Column({ name: 'display_name', type: 'text' })
  displayName!: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: false })
  isEnabled!: boolean;

  @Column({ name: 'client_id', type: 'text', nullable: true })
  @Exclude()
  clientId!: string | null;

  @Column({ name: 'client_secret', type: 'text', nullable: true })
  @Exclude()
  clientSecret!: string | null;

  @Column({ name: 'authorization_url', type: 'text', nullable: true })
  authorizationUrl!: string | null;

  @Column({ name: 'token_url', type: 'text', nullable: true })
  tokenUrl!: string | null;

  @Column({ name: 'user_info_url', type: 'text', nullable: true })
  userInfoUrl!: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  scope!: string[] | null;

  @Column({ name: 'redirect_uri', type: 'text', nullable: true })
  redirectUri!: string | null;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  iconUrl!: string | null;

  @Column({ name: 'button_color', type: 'text', nullable: true })
  buttonColor!: string | null;

  @Column({ type: 'integer', default: 100 })
  priority!: number;

  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
