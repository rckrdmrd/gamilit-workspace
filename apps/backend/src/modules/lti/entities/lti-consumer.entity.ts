/**
 * LtiConsumer Entity
 *
 * Mapea a la tabla: lti_integration.lti_consumers
 *
 * Configuración de LMS externos que integran con Gamilit vía LTI 1.3.
 * Incluye OAuth 2.0 / OIDC configuration.
 *
 * @see DDL: apps/database/ddl/schemas/lti_integration/tables/01-lti_consumers.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';
import { Tenant } from '../../auth/entities/tenant.entity';
import { Profile } from '../../auth/entities/profile.entity';

@Entity({ schema: DB_SCHEMAS.LTI_INTEGRATION, name: DB_TABLES.LTI.LTI_CONSUMERS })
@Unique(['platformId', 'clientId', 'deploymentId'])
@Index(['platformId'])
@Index(['clientId'])
@Index(['tenantId'])
@Index(['isActive'])
export class LtiConsumer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Identificación LTI 1.3
  @Column('text', { name: 'platform_id' })
  platformId!: string; // Issuer identifier (e.g., https://canvas.instructure.com)

  @Column('text', { name: 'client_id' })
  clientId!: string; // OAuth2 client_id

  @Column('text', { name: 'deployment_id', nullable: true })
  deploymentId!: string | null; // LTI deployment ID

  // Configuración OAuth 2.0 / OIDC
  @Column('text', { name: 'public_keyset_url' })
  publicKeysetUrl!: string; // JWKS URL para validar tokens

  @Column('text', { name: 'access_token_url' })
  accessTokenUrl!: string; // Token endpoint

  @Column('text', { name: 'authorization_url' })
  authorizationUrl!: string; // Authorization endpoint

  // Metadata
  @Column('text', { name: 'platform_name' })
  platformName!: string; // Nombre del LMS (e.g., "Canvas UAM")

  @Column('text', { name: 'platform_version', nullable: true })
  platformVersion!: string | null;

  @Column('text', { name: 'platform_contact_email', nullable: true })
  platformContactEmail!: string | null;

  // Configuración de tenant (multi-tenancy)
  @Column('uuid', { name: 'tenant_id', nullable: true })
  tenantId!: string | null;

  // Configuración LTI Advantage
  @Column('boolean', { name: 'supports_deep_linking', default: false })
  supportsDeepLinking!: boolean;

  @Column('boolean', { name: 'supports_nrps', default: false })
  supportsNrps!: boolean; // Names and Role Provisioning Services

  @Column('boolean', { name: 'supports_ags', default: false })
  supportsAgs!: boolean; // Assignment and Grade Services

  // Credenciales (LTI 1.1 legacy - opcional)
  @Column('text', { name: 'consumer_key', nullable: true })
  consumerKey!: string | null;

  @Column('text', { name: 'consumer_secret', nullable: true })
  consumerSecret!: string | null;

  // Configuración adicional
  @Column('jsonb', { name: 'custom_parameters', default: {} })
  customParameters!: Record<string, unknown>;

  // Estado
  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Column('boolean', { name: 'is_verified', default: false })
  isVerified!: boolean;

  // Auditoría
  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;

  @Column('timestamp with time zone', { name: 'last_used_at', nullable: true })
  lastUsedAt!: Date | null;

  // Relaciones
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant | null;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator!: Profile | null;
}
