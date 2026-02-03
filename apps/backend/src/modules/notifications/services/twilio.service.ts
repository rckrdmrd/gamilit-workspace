import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

/**
 * Twilio error interface for type-safe error handling
 */
interface TwilioError extends Error {
  code?: number;
}

/**
 * TwilioService
 *
 * @description Servicio para envio de SMS via Twilio API
 * @version 1.0 (2026-02-03) - Integracion SMS para notificaciones
 *
 * Twilio SMS API:
 * - Envio de SMS a nivel mundial
 * - Soporte para mensajes largos (segmentacion automatica)
 * - Tracking de estado de mensajes
 * - Manejo de errores y reintentos
 *
 * Flujo:
 * 1. Backend inicializa cliente Twilio con credenciales
 * 2. NotificationQueueService encola SMS para procesamiento asincrono
 * 3. TwilioService envia SMS via API
 * 4. Se registra resultado en logs de notificaciones
 *
 * Inicializacion:
 * - onModuleInit() lee variables de entorno (TWILIO_*)
 * - Si no estan configuradas, el servicio queda deshabilitado (graceful degradation)
 *
 * Configuracion requerida:
 * - TWILIO_ACCOUNT_SID: SID de la cuenta Twilio
 * - TWILIO_AUTH_TOKEN: Token de autenticacion
 * - TWILIO_PHONE_NUMBER: Numero de telefono de origen (formato E.164: +1234567890)
 *
 * Formato de telefonos:
 * - Formato E.164 recomendado: +521234567890 (Mexico)
 * - Si no tiene codigo de pais, se agrega +52 (Mexico) por defecto
 *
 * Costos:
 * - SMS a Mexico: ~$0.0075 USD por segmento
 * - SMS internacional: varia por destino
 * - Mensajes largos (>160 chars) se dividen en segmentos
 *
 * Referencias:
 * - https://www.twilio.com/docs/sms
 * - https://www.twilio.com/docs/sms/api/message-resource
 */
@Injectable()
export class TwilioService implements OnModuleInit {
  private readonly logger = new Logger(TwilioService.name);

  private client: Twilio | null = null;
  private fromNumber: string = '';
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.initializeTwilio();
  }

  /**
   * Initialize Twilio client with credentials
   *
   * Lee variables de entorno y configura cliente Twilio
   * Si falta alguna variable, el servicio queda deshabilitado
   *
   * @private
   */
  private initializeTwilio(): void {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const phoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !phoneNumber) {
      this.logger.warn(
        'Twilio credentials not fully configured. SMS notifications will be disabled.',
      );
      this.logger.warn(
        'Required variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER',
      );
      return;
    }

    try {
      this.client = new Twilio(accountSid, authToken);
      this.fromNumber = phoneNumber;
      this.isInitialized = true;
      this.logger.log('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
    }
  }

  /**
   * Check if Twilio service is available
   *
   * @returns true si Twilio esta inicializado y disponible
   *
   * @example
   * if (this.twilioService.isAvailable()) {
   *   await this.twilioService.sendSms(phoneNumber, message);
   * }
   */
  isAvailable(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Get configuration status for health checks
   *
   * @returns Object con estado de configuracion
   */
  getConfigStatus(): {
    configured: boolean;
    fromNumber: string | null;
  } {
    return {
      configured: this.isInitialized,
      fromNumber: this.isInitialized ? this.maskPhoneNumber(this.fromNumber) : null,
    };
  }

  /**
   * Send SMS to a single recipient
   *
   * @param to - Numero de telefono destino (con o sin codigo de pais)
   * @param body - Contenido del mensaje (max 1600 chars, se segmenta si es mayor a 160)
   * @returns Resultado del envio con messageId o error
   *
   * @example
   * const result = await this.twilioService.sendSms(
   *   '+5215512345678',
   *   'Tu codigo de verificacion es: 123456'
   * );
   * if (result.success) {
   *   console.log('SMS enviado:', result.messageId);
   * }
   */
  async sendSms(
    to: string,
    body: string,
  ): Promise<{
    success: boolean;
    messageId?: string;
    status?: string;
    error?: string;
    errorCode?: number;
  }> {
    if (!this.client) {
      this.logger.warn('Twilio not configured. Skipping SMS.');
      return { success: false, error: 'Twilio not configured' };
    }

    const formattedTo = this.formatPhoneNumber(to);

    // Validar formato de numero
    if (!this.isValidPhoneNumber(formattedTo)) {
      this.logger.error(`Invalid phone number format: ${to}`);
      return { success: false, error: 'Invalid phone number format' };
    }

    // Validar longitud del mensaje
    if (body.length > 1600) {
      this.logger.error('Message body exceeds maximum length (1600 characters)');
      return { success: false, error: 'Message body too long (max 1600 characters)' };
    }

    try {
      const message: MessageInstance = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to: formattedTo,
      });

      this.logger.log(
        `SMS sent successfully to ${this.maskPhoneNumber(formattedTo)}: ${message.sid}`,
      );

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
      };
    } catch (error: unknown) {
      const twilioError = error as TwilioError;
      const errorCode = twilioError.code || 0;
      const errorMessage = twilioError.message || 'Unknown error';

      this.logger.error(
        `Failed to send SMS to ${this.maskPhoneNumber(formattedTo)}: [${errorCode}] ${errorMessage}`,
      );

      // Clasificar errores comunes de Twilio
      let userFriendlyError = errorMessage;
      if (errorCode === 21211) {
        userFriendlyError = 'Invalid phone number';
      } else if (errorCode === 21608) {
        userFriendlyError = 'Unverified phone number (trial account)';
      } else if (errorCode === 21610) {
        userFriendlyError = 'Phone number is blacklisted';
      } else if (errorCode === 21614) {
        userFriendlyError = 'Invalid phone number for region';
      } else if (errorCode === 30003) {
        userFriendlyError = 'Unreachable destination number';
      } else if (errorCode === 30004) {
        userFriendlyError = 'Message blocked';
      } else if (errorCode === 30005) {
        userFriendlyError = 'Unknown destination number';
      } else if (errorCode === 30006) {
        userFriendlyError = 'Landline or unreachable carrier';
      } else if (errorCode === 30007) {
        userFriendlyError = 'Carrier rejected message';
      }

      return {
        success: false,
        error: userFriendlyError,
        errorCode,
      };
    }
  }

  /**
   * Send SMS to multiple recipients
   *
   * Procesa envios secuencialmente para respetar rate limits de Twilio
   * (~100 mensajes por segundo en cuentas upgrade)
   *
   * @param recipients - Array de destinatarios con numero y mensaje
   * @returns Estadisticas de envio
   *
   * @example
   * const result = await this.twilioService.sendBulkSms([
   *   { to: '+5215512345678', body: 'Hola Juan!' },
   *   { to: '+5215587654321', body: 'Hola Maria!' },
   * ]);
   * console.log(`Enviados: ${result.sent}, Fallidos: ${result.failed}`);
   */
  async sendBulkSms(
    recipients: Array<{ to: string; body: string }>,
  ): Promise<{
    sent: number;
    failed: number;
    results: Array<{
      to: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    if (!this.client) {
      this.logger.warn('Twilio not configured. Skipping bulk SMS.');
      return {
        sent: 0,
        failed: recipients.length,
        results: recipients.map((r) => ({
          to: r.to,
          success: false,
          error: 'Twilio not configured',
        })),
      };
    }

    let sent = 0;
    let failed = 0;
    const results: Array<{
      to: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    for (const recipient of recipients) {
      const result = await this.sendSms(recipient.to, recipient.body);

      results.push({
        to: this.maskPhoneNumber(recipient.to),
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Pequena pausa entre envios para evitar rate limiting
      if (recipients.length > 10) {
        await this.delay(50);
      }
    }

    this.logger.log(`Bulk SMS completed: ${sent} sent, ${failed} failed`);

    return { sent, failed, results };
  }

  /**
   * Get message status by SID
   *
   * Util para verificar estado de entrega de un mensaje enviado
   *
   * @param messageSid - SID del mensaje retornado por sendSms
   * @returns Estado del mensaje o null si no se encuentra
   *
   * @example
   * const status = await this.twilioService.getMessageStatus('SM1234...');
   * // { sid: 'SM...', status: 'delivered', to: '+52...', ... }
   */
  async getMessageStatus(messageSid: string): Promise<{
    sid: string;
    status: string;
    to: string;
    dateSent: Date | null;
    errorCode: number | null;
    errorMessage: string | null;
  } | null> {
    if (!this.client) {
      return null;
    }

    try {
      const message = await this.client.messages(messageSid).fetch();

      return {
        sid: message.sid,
        status: message.status,
        to: this.maskPhoneNumber(message.to),
        dateSent: message.dateSent,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error: unknown) {
      const twilioError = error as TwilioError;
      this.logger.error(`Failed to get message status: ${twilioError.message}`);
      return null;
    }
  }

  /**
   * Format phone number to E.164 format
   *
   * Asegura que el numero tenga codigo de pais
   * Default: +52 (Mexico)
   *
   * @private
   * @param phone - Numero de telefono (con o sin codigo de pais)
   * @returns Numero en formato E.164
   *
   * @example
   * formatPhoneNumber('5512345678')     // '+525512345678'
   * formatPhoneNumber('+525512345678')  // '+525512345678'
   * formatPhoneNumber('15512345678')    // '+5215512345678'
   */
  private formatPhoneNumber(phone: string): string {
    // Remover espacios, guiones y parentesis
    const cleaned = phone.replace(/[\s\-()]/g, '');

    // Si ya tiene + al inicio, asumir que esta en formato correcto
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // Si empieza con 00, reemplazar por +
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.substring(2);
    }

    // Si tiene 10 digitos (numero mexicano sin codigo de pais)
    if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
      return '+52' + cleaned;
    }

    // Si tiene 11 digitos empezando con 1 (numero mexicano con 1 para celular)
    if (cleaned.length === 11 && cleaned.startsWith('1') && /^\d+$/.test(cleaned)) {
      return '+52' + cleaned;
    }

    // Si tiene 12 digitos empezando con 52 (numero mexicano con codigo de pais)
    if (cleaned.length === 12 && cleaned.startsWith('52') && /^\d+$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // Si tiene 13 digitos empezando con 521 (numero mexicano completo)
    if (cleaned.length === 13 && cleaned.startsWith('521') && /^\d+$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // Por defecto, agregar + si es solo numeros
    if (/^\d+$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // Si no cumple ningun formato, retornar tal cual (fallara validacion)
    return cleaned;
  }

  /**
   * Validate phone number format
   *
   * Verifica que el numero este en formato E.164 valido
   *
   * @private
   * @param phone - Numero de telefono a validar
   * @returns true si el formato es valido
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Formato E.164: + seguido de 7-15 digitos
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    return e164Regex.test(phone);
  }

  /**
   * Mask phone number for logging (privacy)
   *
   * @private
   * @param phone - Numero de telefono
   * @returns Numero enmascarado
   *
   * @example
   * maskPhoneNumber('+525512345678') // '+5255****5678'
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 8) {
      return '****';
    }
    const prefix = phone.substring(0, 4);
    const suffix = phone.substring(phone.length - 4);
    return `${prefix}****${suffix}`;
  }

  /**
   * Delay utility for rate limiting
   *
   * @private
   * @param ms - Milliseconds to wait
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
