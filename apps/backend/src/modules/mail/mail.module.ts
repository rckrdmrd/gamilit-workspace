import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * MailModule
 *
 * @description Módulo de envío de emails usando Nodemailer.
 *
 * @exports
 * - MailService (para usar en otros módulos)
 *
 * @usage
 * - Importar MailModule en módulos que requieran envío de emails
 * - Inyectar MailService en services que necesiten enviar emails
 *
 * @note
 * - Requiere configuración SMTP en variables de entorno
 * - Si no hay SMTP configurado, los emails se loggean en consola
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
