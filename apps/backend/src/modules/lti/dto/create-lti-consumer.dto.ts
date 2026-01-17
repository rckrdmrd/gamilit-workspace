import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEmail,
  IsObject,
} from 'class-validator';

/**
 * CreateLtiConsumerDto
 *
 * @description DTO para registrar un nuevo LMS consumer vía LTI 1.3
 */
export class CreateLtiConsumerDto {
  @ApiProperty({
    description: 'Issuer identifier del LMS (platform_id)',
    example: 'https://canvas.instructure.com',
  })
  @IsUrl({}, { message: 'platformId debe ser una URL válida' })
  @IsNotEmpty()
  platformId!: string;

  @ApiProperty({
    description: 'OAuth2 client_id asignado por el LMS',
    example: '10000000000001',
  })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiPropertyOptional({
    description: 'LTI deployment ID (para multi-deployment)',
    example: '1:abc123',
  })
  @IsString()
  @IsOptional()
  deploymentId?: string;

  @ApiProperty({
    description: 'URL del JWKS público del LMS para validar tokens',
    example: 'https://canvas.instructure.com/api/lti/security/jwks',
  })
  @IsUrl()
  @IsNotEmpty()
  publicKeysetUrl!: string;

  @ApiProperty({
    description: 'Token endpoint OAuth2',
    example: 'https://canvas.instructure.com/login/oauth2/token',
  })
  @IsUrl()
  @IsNotEmpty()
  accessTokenUrl!: string;

  @ApiProperty({
    description: 'Authorization endpoint OIDC',
    example: 'https://canvas.instructure.com/api/lti/authorize_redirect',
  })
  @IsUrl()
  @IsNotEmpty()
  authorizationUrl!: string;

  @ApiProperty({
    description: 'Nombre descriptivo del LMS',
    example: 'Canvas UAM Xochimilco',
  })
  @IsString()
  @IsNotEmpty()
  platformName!: string;

  @ApiPropertyOptional({
    description: 'Versión del LMS',
    example: '2024.01',
  })
  @IsString()
  @IsOptional()
  platformVersion?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto del administrador del LMS',
    example: 'admin@uam.mx',
  })
  @IsEmail()
  @IsOptional()
  platformContactEmail?: string;

  @ApiPropertyOptional({
    description: 'ID del tenant para multi-tenancy',
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Soporta Deep Linking (selección de contenido)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  supportsDeepLinking?: boolean;

  @ApiPropertyOptional({
    description: 'Soporta NRPS (Names and Role Provisioning)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  supportsNrps?: boolean;

  @ApiPropertyOptional({
    description: 'Soporta AGS (Assignment and Grade Services)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  supportsAgs?: boolean;

  @ApiPropertyOptional({
    description: 'Parámetros custom para el consumer',
    default: {},
  })
  @IsObject()
  @IsOptional()
  customParameters?: Record<string, unknown>;
}
