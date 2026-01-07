import {
  IsUUID,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateStatus, CertificateType } from '../entities/certificate.entity';

/**
 * DTO for generating a new certificate
 * @see EPIC 10.2 - Digital Certificates System
 */
export class GenerateCertificateDto {
  @ApiProperty({
    description: 'ID del usuario que recibe el certificado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  user_id!: string;

  @ApiProperty({
    description: 'ID del módulo completado',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  module_id!: string;

  @ApiPropertyOptional({
    description: 'ID del tenant/organización',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  tenant_id?: string;

  @ApiPropertyOptional({
    description: 'ID del classroom',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  classroom_id?: string;
}

/**
 * DTO for revoking a certificate
 */
export class RevokeCertificateDto {
  @ApiProperty({
    description: 'Razón de la revocación',
    example: 'El estudiante fue removido del curso',
  })
  @IsString()
  reason!: string;
}

/**
 * DTO for certificate response
 */
export class CertificateResponseDto {
  @ApiProperty({
    description: 'ID único del certificado',
    example: '990e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  user_id!: string;

  @ApiPropertyOptional({
    description: 'ID del módulo',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  module_id?: string;

  @ApiPropertyOptional({
    description: 'ID del tenant',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  tenant_id?: string;

  @ApiPropertyOptional({
    description: 'ID del classroom',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  classroom_id?: string;

  @ApiProperty({
    description: 'Tipo de certificado',
    enum: CertificateType,
    example: CertificateType.MODULE_COMPLETION,
  })
  certificate_type!: CertificateType;

  @ApiProperty({
    description: 'Título del certificado',
    example: 'Certificado de Completación',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Descripción del logro',
    example: 'Por completar exitosamente el módulo de Comprensión Literal',
  })
  description?: string;

  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan Pérez García',
  })
  student_name!: string;

  @ApiProperty({
    description: 'Nombre del logro/módulo',
    example: 'Comprensión Literal - Nivel 1',
  })
  achievement_name!: string;

  @ApiProperty({
    description: 'Código de verificación único',
    example: 'CERT-ABCD-1234-EFGH',
  })
  verification_code!: string;

  @ApiPropertyOptional({
    description: 'URL pública de verificación',
    example: 'https://gamilit.com/verify/CERT-ABCD-1234-EFGH',
  })
  verification_url?: string;

  @ApiProperty({
    description: 'Puntaje final obtenido',
    example: 92.5,
  })
  final_score!: number;

  @ApiProperty({
    description: 'Total XP ganados',
    example: 500,
  })
  total_xp_earned!: number;

  @ApiProperty({
    description: 'Total ML Coins ganados',
    example: 250,
  })
  total_ml_coins_earned!: number;

  @ApiProperty({
    description: 'Tiempo total dedicado',
    example: '02:30:45',
  })
  time_spent!: string;

  @ApiProperty({
    description: 'Número de ejercicios completados',
    example: 15,
  })
  exercises_completed!: number;

  @ApiProperty({
    description: 'Estado del certificado',
    enum: CertificateStatus,
    example: CertificateStatus.ISSUED,
  })
  status!: CertificateStatus;

  @ApiPropertyOptional({
    description: 'Fecha de emisión',
    example: '2025-01-15T10:00:00Z',
  })
  issued_at?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de expiración',
    example: '2026-01-15T10:00:00Z',
  })
  expires_at?: Date;

  @ApiPropertyOptional({
    description: 'URL del PDF generado',
    example: 'https://storage.gamilit.com/certificates/cert-123.pdf',
  })
  pdf_url?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-15T10:00:00Z',
  })
  created_at!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-15T10:00:00Z',
  })
  updated_at!: Date;
}

/**
 * DTO for certificate verification response
 */
export class CertificateVerificationDto {
  @ApiProperty({
    description: 'Indica si el certificado es válido',
    example: true,
  })
  is_valid!: boolean;

  @ApiPropertyOptional({
    description: 'Datos del certificado si es válido',
  })
  certificate?: CertificateResponseDto;

  @ApiPropertyOptional({
    description: 'Mensaje de error si no es válido',
    example: 'Certificate has been revoked',
  })
  error?: string;
}



/**
 * DTO for listing certificates with pagination
 */
export class GetCertificatesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: CertificateStatus,
  })
  @IsEnum(CertificateStatus)
  @IsOptional()
  status?: CertificateStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de certificado',
    enum: CertificateType,
  })
  @IsEnum(CertificateType)
  @IsOptional()
  certificate_type?: CertificateType;

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Offset para paginación',
    example: 0,
    minimum: 0,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}
