import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Mail Service
 *
 * ISSUE: NOTIF-001 - Integración Email Service
 * FECHA: 2025-12-05
 * SPRINT: Sprint 0 - Día 2
 *
 * Gestiona el envío de emails usando Nodemailer
 * Soporta: SMTP, SendGrid (via SMTP)
 *
 * Características:
 * - Configuración SMTP flexible
 * - Soporte SendGrid via API Key
 * - Retry logic con backoff exponencial
 * - Templates HTML con estilos inline
 * - Fallback a modo logging si no hay configuración
 */
@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  private readonly logger = new Logger(MailService.name);

  private readonly frontendUrl: string;

  private readonly from: string;

  private readonly maxRetries = 3;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3005');
    this.from = this.configService.get<string>('SMTP_FROM', 'GAMILIT <notifications@gamilit.com>');
    this.initializeTransporter();
  }

  /**
   * Inicializar transporter de Nodemailer
   * Soporta SMTP genérico y SendGrid
   */
  private initializeTransporter() {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (sendgridApiKey) {
      // Configuración SendGrid via SMTP
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: sendgridApiKey,
        },
      });
      this.logger.log('Email service initialized with SendGrid');
    } else {
      // Configuración SMTP genérico
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
      const smtpUser = this.configService.get<string>('SMTP_USER');
      const smtpPass = this.configService.get<string>('SMTP_PASS');
      const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

      if (!smtpHost || !smtpUser || !smtpPass) {
        this.logger.warn('SMTP credentials not configured. Emails will be logged only.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Email service initialized with SMTP');
    }

    // Verificar conexión
    if (this.transporter) {
      this.transporter.verify((error: Error | null) => {
        if (error) {
          this.logger.error('Email transport verification failed:', error);
        } else {
          this.logger.log('Email service ready to send emails');
        }
      });
    }
  }

  /**
   * Verificar si el servicio está disponible
   */
  isAvailable(): boolean {
    return this.transporter !== null;
  }

  /**
   * Enviar email genérico con retry logic
   *
   * @param to - Destinatario(s)
   * @param subject - Asunto del email
   * @param html - Contenido HTML
   * @param text - Contenido texto plano (opcional)
   * @returns true si se envió exitosamente
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
  ): Promise<boolean> {
    // Si no hay transporter, solo loggear
    if (!this.transporter) {
      this.logger.warn(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`Email content preview: ${html.substring(0, 200)}...`);
      return false;
    }

    let lastError: unknown;

    // Retry logic con backoff exponencial
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const info = await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          html,
          text: text || this.stripHtml(html),
        });

        this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
        return true;
      } catch (error: unknown) {
        lastError = error;
        this.logger.warn(
          `Email send attempt ${attempt}/${this.maxRetries} failed:`,
          error instanceof Error ? error.message : String(error),
        );

        if (attempt < this.maxRetries) {
          // Backoff exponencial: 1s, 3s, 9s
          const delayMs = 1000 * Math.pow(3, attempt - 1);
          await this.sleep(delayMs);
        }
      }
    }

    this.logger.error(`Failed to send email to ${to} after ${this.maxRetries} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Enviar email de notificación genérica
   * Usado por el sistema de notificaciones
   */
  async sendNotificationEmail(
    to: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string,
  ): Promise<boolean> {
    const html = this.buildNotificationTemplate(title, message, actionUrl, actionText);

    return this.sendEmail(to, title, html);
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string, token: string, userName?: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password/${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperacion de Contrasena</h1>
            <p>GAMILIT Platform</p>
          </div>
          <div class="content">
            <p>Hola ${userName || 'Usuario'},</p>
            <p>Recibimos una solicitud para restablecer la contrasena de tu cuenta en GAMILIT.</p>
            <p>Haz clic en el siguiente boton para crear una nueva contrasena:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contrasena</a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e0e0e0; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <p><strong>Este enlace expirara en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            <p>Saludos,<br>El equipo de GAMILIT</p>
          </div>
          <div class="footer">
            <p>Este es un correo automatico, por favor no respondas.</p>
            <p>&copy; 2025 GAMILIT - Plataforma Educativa Gamificada</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Recuperacion de Contrasena - GAMILIT', htmlContent);
    this.logger.log(`Password reset email sent to: ${email}`);
  }

  /**
   * Enviar email de verificación de cuenta
   */
  async sendVerificationEmail(email: string, token: string, userName?: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email/${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verifica tu Email</h1>
            <p>GAMILIT Platform</p>
          </div>
          <div class="content">
            <p>Bienvenido/a ${userName || 'Usuario'}!</p>
            <p>Gracias por registrarte en GAMILIT. Para completar tu registro, por favor verifica tu direccion de correo electronico.</p>
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verificar Email</a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e0e0e0; padding: 10px; border-radius: 5px;">
              ${verifyUrl}
            </p>
            <p><strong>Este enlace expirara en 24 horas.</strong></p>
            <p>Nos vemos pronto en GAMILIT!</p>
            <p>Saludos,<br>El equipo de GAMILIT</p>
          </div>
          <div class="footer">
            <p>Este es un correo automatico, por favor no respondas.</p>
            <p>&copy; 2025 GAMILIT - Plataforma Educativa Gamificada</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Verifica tu Email - GAMILIT', htmlContent);
    this.logger.log(`Verification email sent to: ${email}`);
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(email: string, userName: string, role: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenido/a a GAMILIT!</h1>
            <p>Plataforma Educativa Gamificada</p>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Estamos emocionados de tenerte como ${role === 'student' ? 'estudiante' : 'profesor'}!</p>

            <h3>Comienza tu aventura:</h3>
            <div class="feature">
              <strong>Modulos Educativos</strong>
              <p>Accede a contenido educativo de calidad adaptado a tu nivel.</p>
            </div>
            <div class="feature">
              <strong>Sistema de Rangos Maya</strong>
              <p>Progresa desde Ajaw hasta K'uk'ulkan y desbloquea recompensas.</p>
            </div>
            <div class="feature">
              <strong>ML Coins</strong>
              <p>Gana monedas virtuales y usa power-ups para mejorar tu aprendizaje.</p>
            </div>

            <p style="text-align: center;">
              <a href="${this.frontendUrl}/dashboard" class="button">Ir al Dashboard</a>
            </p>

            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>Feliz aprendizaje!</p>
            <p>Saludos,<br>El equipo de GAMILIT</p>
          </div>
          <div class="footer">
            <p>Este es un correo automatico, por favor no respondas.</p>
            <p>&copy; 2025 GAMILIT - Plataforma Educativa Gamificada</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Bienvenido/a a GAMILIT!', htmlContent);
    this.logger.log(`Welcome email sent to: ${email}`);
  }

  /**
   * Template genérico para notificaciones
   */
  private buildNotificationTemplate(
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string,
  ): string {
    const actionButton = actionUrl
      ? `
        <p style="text-align: center;">
          <a href="${actionUrl}" class="button">${actionText || 'Ver detalles'}</a>
        </p>
      `
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
            <p>GAMILIT Platform</p>
          </div>
          <div class="content">
            <p>${message}</p>
            ${actionButton}
            <p>Saludos,<br>El equipo de GAMILIT</p>
          </div>
          <div class="footer">
            <p>Este es un correo automatico, por favor no respondas.</p>
            <p>&copy; 2025 GAMILIT - Plataforma Educativa Gamificada</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Convertir HTML a texto plano simple
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Helper: Sleep para backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
