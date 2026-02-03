/**
 * SMS DTOs (SMS-001)
 *
 * @description Exporta DTOs para integracion Twilio SMS
 * @version 1.0 (2026-02-03)
 *
 * DTOs exportados:
 * - SendSmsDto: Envio individual de SMS
 * - BulkSmsDto: Envio masivo de SMS
 * - SmsResponseDto: Respuesta de envio individual
 * - BulkSmsResponseDto: Respuesta de envio masivo
 * - SmsStatusResponseDto: Estado de configuracion
 */

export { SendSmsDto } from './send-sms.dto';
export { BulkSmsDto, BulkSmsRecipientDto } from './bulk-sms.dto';
export {
  SmsResponseDto,
  BulkSmsResponseDto,
  BulkSmsResultDto,
  SmsStatusResponseDto,
} from './sms-response.dto';
