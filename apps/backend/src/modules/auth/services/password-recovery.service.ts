import { Injectable, Logger } from '@nestjs/common';
import {
  InvalidTokenError,
  UserNotFoundError,
} from '../errors/auth.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, PasswordResetToken } from '../entities';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  } from '../dto';
import { MailService } from '@/modules/mail/mail.service';
import { SessionManagementService } from './session-management.service';

/**
 * PasswordRecoveryService
 *
 * @description Servicio de recuperación de contraseña.
 *
 * @flow
 * 1. Usuario solicita reset (requestReset)
 * 2. Sistema genera token y envía email
 * 3. Usuario recibe email con link + token
 * 4. Usuario ingresa nueva contraseña (resetPassword)
 * 5. Sistema valida token y actualiza password
 * 6. Token se marca como usado
 * 7. Todas las sesiones se invalidan
 *
 * @security
 * - Token hasheado en DB (SHA256)
 * - Expiración corta (1h)
 * - No revelar si email existe
 * - Invalidar tokens anteriores
 * - Logout global al cambiar password
 */
@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);

  private readonly TOKEN_LENGTH_BYTES = 32;

  private readonly TOKEN_EXPIRATION_HOURS = 1;

  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,

    @InjectRepository(PasswordResetToken, 'auth')
    private readonly tokenRepository: Repository<PasswordResetToken>,

    private readonly mailService: MailService,

    private readonly sessionManagementService: SessionManagementService,
  ) {}

  /**
   * Solicitar reset de contraseña
   */
  async requestReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    // 1. Buscar usuario (no revelar si existe)
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    // Siempre retornar mensaje genérico (seguridad)
    const genericMessage =
      'Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña.';

    if (!user) {
      return { message: genericMessage };
    }

    // 2. Invalidar tokens anteriores
    await this.invalidatePreviousTokens(user.id);

    // 3. Generar token aleatorio
    const plainToken = this.generateSecureToken();

    // 4. Hashear token
    const hashedToken = this.hashToken(plainToken);

    // 5. Calcular expiración (1h)
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    // 6. Crear registro en DB
    const resetToken = this.tokenRepository.create({
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt,
    });
    await this.tokenRepository.save(resetToken);

    // 7. Enviar email con token plaintext
    try {
      await this.mailService.sendPasswordResetEmail(user.email, plainToken);
      this.logger.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      // Log error pero NO fallar (por seguridad, no revelar errores)
      this.logger.error(`Failed to send password reset email to ${user.email}:`, error);
      // En desarrollo, mostrar el token para testing
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`[DEV] Password reset token for ${user.email}: ${plainToken}`);
      }
    }

    return { message: genericMessage };
  }

  /**
   * Validar token de reset
   */
  async validateToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    // 1. Hashear token recibido
    const hashedToken = this.hashToken(token);

    // 2. Buscar token en DB
    const resetToken = await this.tokenRepository.findOne({
      where: { token: hashedToken },
    });

    if (!resetToken) {
      return { valid: false };
    }

    // 3. Validar con helpers
    if (!resetToken.isValid()) {
      return { valid: false };
    }

    return { valid: true, userId: resetToken.user_id };
  }

  /**
   * Resetear contraseña con token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // 1. Validar token
    const validation = await this.validateToken(dto.token);

    if (!validation.valid || !validation.userId) {
      throw new InvalidTokenError('Token invalido o expirado');
    }

    // 2. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: validation.userId },
    });

    if (!user) {
      throw new UserNotFoundError(validation.userId);
    }

    // 3. Hashear nuevo password
    const hashedPassword = await bcrypt.hash(dto.new_password, 10);

    // 4. Actualizar password
    user.encrypted_password = hashedPassword;
    await this.userRepository.save(user);

    // 5. Marcar token como usado
    const hashedToken = this.hashToken(dto.token);
    await this.tokenRepository.update(
      { token: hashedToken },
      { used_at: new Date() },
    );

    // 6. Invalidar todas las sesiones (logout global de seguridad)
    try {
      // Revocar todas las sesiones excepto ninguna (currentSessionId vacío = revocar todas)
      // Usamos un UUID inexistente para asegurar que se cierren TODAS las sesiones
      const result = await this.sessionManagementService.revokeAllSessions(user.id, '00000000-0000-0000-0000-000000000000');
      this.logger.log(`Revoked ${result.count} sessions for user ${user.id} after password reset`);
    } catch (error) {
      // Log pero no fallar - la contraseña ya fue cambiada
      this.logger.error(`Failed to revoke sessions for user ${user.id}:`, error);
    }

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Invalidar tokens anteriores del usuario
   */
  async invalidatePreviousTokens(userId: string): Promise<void> {
    await this.tokenRepository.update(
      { user_id: userId, used_at: IsNull() },
      { used_at: new Date() },
    );
  }

  /**
   * Limpiar tokens expirados (cron job)
   */
  async cleanExpiredTokens(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Helper: Generar token aleatorio seguro
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH_BYTES).toString('hex');
  }

  /**
   * Helper: Hashear token con SHA256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
