import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * BulkSmsRecipientDto
 *
 * @description DTO para un destinatario individual en envio masivo
 */
export class BulkSmsRecipientDto {
  /**
   * Numero de telefono destino
   *
   * @example "+5215512345678"
   */
  @ApiProperty({
    description: 'Numero de telefono destino',
    example: '+5215512345678',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(16)
  @Matches(/^(\+)?[0-9]{10,15}$/)
  to!: string;

  /**
   * Contenido del mensaje SMS (personalizado por destinatario)
   *
   * @example "Hola Juan, tu pedido #123 ha sido enviado."
   */
  @ApiProperty({
    description: 'Contenido del mensaje SMS',
    example: 'Hola Juan, tu pedido #123 ha sido enviado.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1600)
  body!: string;
}

/**
 * BulkSmsDto
 *
 * @description DTO para envio masivo de SMS via Twilio
 * @version 1.0 (2026-02-03)
 *
 * Usado en: POST /notifications/sms/bulk
 *
 * Limites:
 * - Maximo 100 destinatarios por request
 * - Para volumenes mayores, usar queue o dividir en batches
 *
 * Rate limits Twilio:
 * - ~100 mensajes/segundo en cuentas upgrade
 * - ~1 mensaje/segundo en cuentas trial
 *
 * @example
 * {
 *   "recipients": [
 *     { "to": "+5215512345678", "body": "Hola Juan!" },
 *     { "to": "+5215587654321", "body": "Hola Maria!" }
 *   ],
 *   "metadata": { "campaign": "promo_2026", "batch": 1 }
 * }
 */
export class BulkSmsDto {
  /**
   * Array de destinatarios con sus mensajes personalizados
   *
   * - Minimo 1 destinatario
   * - Maximo 100 destinatarios por request
   * - Cada destinatario puede tener mensaje diferente
   *
   * @example [{ "to": "+5215512345678", "body": "Mensaje 1" }]
   */
  @ApiProperty({
    description: 'Array de destinatarios (max 100)',
    type: [BulkSmsRecipientDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 recipients per request' })
  @Type(() => BulkSmsRecipientDto)
  recipients!: BulkSmsRecipientDto[];

  /**
   * Metadata adicional para la operacion de envio masivo
   *
   * Util para tracking de campanas, auditorias, etc.
   *
   * @example { "campaign": "promo_2026", "batch": 1, "createdBy": "admin" }
   */
  @ApiPropertyOptional({
    description: 'Metadata adicional para tracking',
    example: { campaign: 'promo_2026', batch: 1, createdBy: 'admin' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
