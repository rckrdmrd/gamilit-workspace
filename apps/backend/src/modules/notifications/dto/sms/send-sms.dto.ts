import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * SendSmsDto
 *
 * @description DTO para enviar un SMS individual via Twilio
 * @version 1.0 (2026-02-03)
 *
 * Usado en: POST /notifications/sms/send
 *
 * Formato de telefono:
 * - Recomendado: formato E.164 (+521234567890)
 * - Alternativo: 10 digitos (se agrega +52 automaticamente)
 *
 * Limitaciones:
 * - Mensaje maximo: 1600 caracteres
 * - Mensajes >160 chars se segmentan automaticamente
 * - Cada segmento tiene costo individual
 *
 * @example
 * {
 *   "to": "+5215512345678",
 *   "body": "Tu codigo de verificacion es: 123456",
 *   "metadata": { "type": "verification", "userId": "uuid..." }
 * }
 */
export class SendSmsDto {
  /**
   * Numero de telefono destino
   *
   * Formatos aceptados:
   * - E.164 (recomendado): +521234567890
   * - Nacional Mexico (10 digitos): 5512345678
   * - Con codigo de pais (12 digitos): 525512345678
   *
   * @example "+5215512345678"
   */
  @ApiProperty({
    description: 'Numero de telefono destino (formato E.164 recomendado)',
    example: '+5215512345678',
    minLength: 10,
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Phone number must have at least 10 digits' })
  @MaxLength(16, { message: 'Phone number must have at most 16 characters' })
  @Matches(/^(\+)?[0-9]{10,15}$/, {
    message: 'Phone number must contain only digits and optionally start with +',
  })
  to!: string;

  /**
   * Contenido del mensaje SMS
   *
   * - Maximo 1600 caracteres
   * - Mensajes >160 chars se dividen en segmentos
   * - Caracteres especiales (unicode) reducen capacidad a 70 chars/segmento
   *
   * @example "Tu codigo de verificacion es: 123456. Valido por 10 minutos."
   */
  @ApiProperty({
    description: 'Contenido del mensaje SMS (max 1600 caracteres)',
    example: 'Tu codigo de verificacion es: 123456. Valido por 10 minutos.',
    minLength: 1,
    maxLength: 1600,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1600, { message: 'Message must not exceed 1600 characters' })
  body!: string;

  /**
   * Metadata adicional (opcional)
   *
   * Se almacena en logs pero no se envia en el SMS
   * Util para tracking y auditoria
   *
   * @example { "type": "verification", "userId": "uuid...", "templateKey": "sms_otp" }
   */
  @ApiPropertyOptional({
    description: 'Metadata adicional para tracking (no se envia en SMS)',
    example: { type: 'verification', userId: 'uuid...', templateKey: 'sms_otp' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
