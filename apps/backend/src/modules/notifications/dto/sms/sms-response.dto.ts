import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * SmsResponseDto
 *
 * @description DTO de respuesta para envio de SMS individual
 * @version 1.0 (2026-02-03)
 *
 * Usado en responses de: POST /notifications/sms/send
 *
 * @example
 * {
 *   "success": true,
 *   "messageId": "SM1234567890abcdef1234567890abcdef",
 *   "status": "queued",
 *   "to": "+5255****5678"
 * }
 */
export class SmsResponseDto {
  /**
   * Indica si el envio fue exitoso
   */
  @ApiProperty({
    description: 'Indica si el envio fue exitoso',
    example: true,
  })
  success!: boolean;

  /**
   * ID del mensaje en Twilio (SID)
   *
   * Solo presente si success=true
   * Formato: SM + 32 caracteres hexadecimales
   *
   * @example "SM1234567890abcdef1234567890abcdef"
   */
  @ApiPropertyOptional({
    description: 'ID del mensaje en Twilio (SID)',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  messageId?: string;

  /**
   * Estado del mensaje en Twilio
   *
   * Estados posibles:
   * - queued: En cola para envio
   * - sending: Enviando
   * - sent: Enviado al carrier
   * - delivered: Entregado al dispositivo
   * - failed: Fallo el envio
   * - undelivered: No se pudo entregar
   *
   * Solo presente si success=true
   *
   * @example "queued"
   */
  @ApiPropertyOptional({
    description: 'Estado del mensaje en Twilio',
    example: 'queued',
    enum: ['queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered'],
  })
  status?: string;

  /**
   * Numero de telefono destino (enmascarado por privacidad)
   *
   * @example "+5255****5678"
   */
  @ApiPropertyOptional({
    description: 'Numero destino (enmascarado)',
    example: '+5255****5678',
  })
  to?: string;

  /**
   * Mensaje de error si el envio fallo
   *
   * Solo presente si success=false
   *
   * @example "Invalid phone number"
   */
  @ApiPropertyOptional({
    description: 'Mensaje de error (si fallo)',
    example: 'Invalid phone number',
  })
  error?: string;

  /**
   * Codigo de error de Twilio
   *
   * Solo presente si success=false
   * Ver: https://www.twilio.com/docs/api/errors
   *
   * @example 21211
   */
  @ApiPropertyOptional({
    description: 'Codigo de error de Twilio',
    example: 21211,
  })
  errorCode?: number;
}

/**
 * BulkSmsResultDto
 *
 * @description DTO para resultado individual en envio masivo
 */
export class BulkSmsResultDto {
  /**
   * Numero de telefono destino (enmascarado)
   */
  @ApiProperty({
    description: 'Numero destino (enmascarado)',
    example: '+5255****5678',
  })
  to!: string;

  /**
   * Indica si el envio fue exitoso
   */
  @ApiProperty({
    description: 'Indica si el envio fue exitoso',
    example: true,
  })
  success!: boolean;

  /**
   * ID del mensaje si fue exitoso
   */
  @ApiPropertyOptional({
    description: 'ID del mensaje en Twilio',
    example: 'SM1234567890abcdef1234567890abcdef',
  })
  messageId?: string;

  /**
   * Mensaje de error si fallo
   */
  @ApiPropertyOptional({
    description: 'Mensaje de error (si fallo)',
    example: 'Invalid phone number',
  })
  error?: string;
}

/**
 * BulkSmsResponseDto
 *
 * @description DTO de respuesta para envio masivo de SMS
 * @version 1.0 (2026-02-03)
 *
 * Usado en responses de: POST /notifications/sms/bulk
 *
 * @example
 * {
 *   "sent": 8,
 *   "failed": 2,
 *   "total": 10,
 *   "results": [
 *     { "to": "+5255****5678", "success": true, "messageId": "SM..." },
 *     { "to": "+5255****4321", "success": false, "error": "Invalid phone" }
 *   ]
 * }
 */
export class BulkSmsResponseDto {
  /**
   * Numero de mensajes enviados exitosamente
   */
  @ApiProperty({
    description: 'Mensajes enviados exitosamente',
    example: 8,
  })
  sent!: number;

  /**
   * Numero de mensajes que fallaron
   */
  @ApiProperty({
    description: 'Mensajes que fallaron',
    example: 2,
  })
  failed!: number;

  /**
   * Total de mensajes procesados
   */
  @ApiProperty({
    description: 'Total de mensajes procesados',
    example: 10,
  })
  total!: number;

  /**
   * Resultados detallados por destinatario
   */
  @ApiProperty({
    description: 'Resultados detallados por destinatario',
    type: [BulkSmsResultDto],
  })
  results!: BulkSmsResultDto[];
}

/**
 * SmsStatusResponseDto
 *
 * @description DTO de respuesta para verificar configuracion de SMS
 * @version 1.0 (2026-02-03)
 *
 * Usado en responses de: GET /notifications/sms/status
 *
 * @example
 * {
 *   "configured": true,
 *   "available": true,
 *   "fromNumber": "+1234****7890"
 * }
 */
export class SmsStatusResponseDto {
  /**
   * Indica si Twilio esta configurado (credenciales presentes)
   */
  @ApiProperty({
    description: 'Indica si Twilio esta configurado',
    example: true,
  })
  configured!: boolean;

  /**
   * Indica si el servicio esta disponible para enviar SMS
   */
  @ApiProperty({
    description: 'Indica si el servicio esta disponible',
    example: true,
  })
  available!: boolean;

  /**
   * Numero de telefono de origen (enmascarado)
   *
   * Solo presente si configured=true
   */
  @ApiPropertyOptional({
    description: 'Numero de origen (enmascarado)',
    example: '+1234****7890',
  })
  fromNumber?: string | null;
}
