import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TwilioService } from '../services/twilio.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { GamilityRoleEnum } from '@/shared/constants/enums.constants';
import {
  SendSmsDto,
  BulkSmsDto,
  SmsResponseDto,
  BulkSmsResponseDto,
  SmsStatusResponseDto,
} from '../dto/sms';

/**
 * SmsController
 *
 * @description Controller para envio de SMS via Twilio
 * @version 1.0 (2026-02-03)
 *
 * Rutas: /notifications/sms/*
 *
 * Endpoints:
 * - POST /sms/send - Enviar SMS individual
 * - POST /sms/bulk - Envio masivo de SMS
 * - GET /sms/status - Verificar configuracion
 *
 * Seguridad:
 * - Todos los endpoints requieren autenticacion JWT
 * - Endpoints de envio requieren rol ADMIN
 * - Endpoint de status disponible para usuarios autenticados
 *
 * IMPORTANTE:
 * - Los SMS tienen costo por mensaje
 * - Respetar rate limits de Twilio
 * - Mensajes largos (>160 chars) se segmentan
 * - Verificar que TWILIO_* esten configurados en .env
 *
 * Integracion con NotificationQueue:
 * - Para envios masivos, considerar usar el sistema de cola
 * - La cola permite reintentos automaticos y tracking
 */
@ApiTags('notifications-sms')
@Controller('notifications/sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmsController {
  private readonly logger = new Logger(SmsController.name);

  constructor(private readonly twilioService: TwilioService) {}

  /**
   * POST /notifications/sms/send
   *
   * Enviar SMS individual
   *
   * Casos de uso:
   * - Codigos de verificacion (OTP)
   * - Notificaciones urgentes
   * - Alertas de seguridad
   * - Recordatorios personalizados
   *
   * @param sendDto - Datos del SMS (destinatario y mensaje)
   * @returns Resultado del envio
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Enviar SMS individual',
    description:
      'Envia un SMS a un numero de telefono especifico via Twilio. ' +
      'Requiere rol ADMIN. El numero debe estar en formato E.164 o ' +
      'nacional (10 digitos, se agrega +52 automaticamente).',
  })
  @ApiResponse({
    status: 200,
    description: 'SMS enviado exitosamente',
    type: SmsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos o numero de telefono incorrecto',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol ADMIN)',
  })
  @ApiResponse({
    status: 503,
    description: 'Twilio no configurado',
  })
  async sendSms(@Body() sendDto: SendSmsDto): Promise<SmsResponseDto> {
    this.logger.log(`SMS send request to: ${this.maskPhone(sendDto.to)}`);

    if (!this.twilioService.isAvailable()) {
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    const result = await this.twilioService.sendSms(sendDto.to, sendDto.body);

    return {
      success: result.success,
      messageId: result.messageId,
      status: result.status,
      to: this.maskPhone(sendDto.to),
      error: result.error,
      errorCode: result.errorCode,
    };
  }

  /**
   * POST /notifications/sms/bulk
   *
   * Envio masivo de SMS
   *
   * Casos de uso:
   * - Campanas de marketing
   * - Notificaciones a grupos
   * - Alertas masivas
   * - Recordatorios en batch
   *
   * Limites:
   * - Maximo 100 destinatarios por request
   * - Para volumenes mayores, dividir en batches
   *
   * @param bulkDto - Array de destinatarios con sus mensajes
   * @returns Estadisticas del envio masivo
   */
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(GamilityRoleEnum.ADMIN_TEACHER, GamilityRoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Envio masivo de SMS',
    description:
      'Envia SMS a multiples destinatarios (max 100 por request). ' +
      'Cada destinatario puede tener un mensaje personalizado. ' +
      'Requiere rol ADMIN. Los envios se procesan secuencialmente ' +
      'para respetar rate limits de Twilio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Envio masivo completado',
    type: BulkSmsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos o excede limite de destinatarios',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol ADMIN)',
  })
  @ApiResponse({
    status: 503,
    description: 'Twilio no configurado',
  })
  async sendBulkSms(@Body() bulkDto: BulkSmsDto): Promise<BulkSmsResponseDto> {
    this.logger.log(`Bulk SMS request for ${bulkDto.recipients.length} recipients`);

    if (!this.twilioService.isAvailable()) {
      return {
        sent: 0,
        failed: bulkDto.recipients.length,
        total: bulkDto.recipients.length,
        results: bulkDto.recipients.map((r) => ({
          to: this.maskPhone(r.to),
          success: false,
          error: 'SMS service not configured',
        })),
      };
    }

    const result = await this.twilioService.sendBulkSms(bulkDto.recipients);

    return {
      sent: result.sent,
      failed: result.failed,
      total: bulkDto.recipients.length,
      results: result.results,
    };
  }

  /**
   * GET /notifications/sms/status
   *
   * Verificar configuracion de Twilio
   *
   * Util para:
   * - Health checks
   * - Verificar que el servicio este disponible
   * - Debug de configuracion
   *
   * @returns Estado de configuracion del servicio
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar configuracion de SMS',
    description:
      'Retorna el estado de configuracion del servicio SMS (Twilio). ' +
      'Indica si las credenciales estan configuradas y el servicio disponible.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de configuracion',
    type: SmsStatusResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  getStatus(): SmsStatusResponseDto {
    const configStatus = this.twilioService.getConfigStatus();

    return {
      configured: configStatus.configured,
      available: this.twilioService.isAvailable(),
      fromNumber: configStatus.fromNumber,
    };
  }

  /**
   * Mask phone number for logging
   *
   * @private
   * @param phone - Phone number to mask
   * @returns Masked phone number
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 8) {
      return '****';
    }
    const prefix = phone.substring(0, 4);
    const suffix = phone.substring(phone.length - 4);
    return `${prefix}****${suffix}`;
  }
}
