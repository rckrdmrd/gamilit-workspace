import { Injectable, Logger } from '@nestjs/common';
import {
  UserNotFoundError,
  EmailAlreadyVerifiedError,
  InvalidTokenError,
  ExpiredTokenError,
  UsedTokenError,
} from '../errors/auth.errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { User, EmailVerificationToken } from '../entities';
import {
  VerifyEmailDto,
  } from '../dto';
import { MailService } from '@/modules/mail/mail.service';

/**
 * EmailVerificationService
 *
 * @description Servicio de verificación de email.
 *
 * @flow
 * 1. Usuario se registra (sendVerification automático)
 * 2. Sistema genera token y envía email
 * 3. Usuario recibe email con link + token
 * 4. Usuario hace clic en link (verifyEmail)
 * 5. Sistema valida token y marca email como verificado
 * 6. Token se marca como usado
 *
 * @use_cases
 * - Verificación al registrarse
 * - Re-verificación al cambiar email
 * - Reenvío de email de verificación
 *
 * @security
 * - Token hasheado en DB (SHA256)
 * - Expiración 24h
 * - Invalidar tokens anteriores
 * - No permitir verificar si ya está verificado
 */
@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  private readonly TOKEN_LENGTH_BYTES = 32;

  private readonly TOKEN_EXPIRATION_HOURS = 24;

  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,

    @InjectRepository(EmailVerificationToken, 'auth')
    private readonly tokenRepository: Repository<EmailVerificationToken>,

    private readonly mailService: MailService,
  ) {}

  /**
   * Enviar email de verificación
   * @param userAuthId - auth.users.id (NOT profile.id). Use req.user.user_id from controllers.
   */
  async sendVerification(userAuthId: string, email: string): Promise<{ message: string }> {
    // E11-FIX: userAuthId must be auth.users.id for auth.users + email_verification_tokens lookups
    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userAuthId },
    });

    if (!user) {
      throw new UserNotFoundError(userAuthId);
    }

    // 2. Verificar si ya está verificado
    // Fix: Usar email_confirmed_at en lugar de email_verified
    if (user.email_confirmed_at) {
      throw new EmailAlreadyVerifiedError();
    }

    // 3. Invalidar tokens anteriores
    await this.invalidatePreviousTokens(userAuthId);

    // 4. Generar token aleatorio
    const plainToken = this.generateSecureToken();

    // 5. Hashear token
    const hashedToken = this.hashToken(plainToken);

    // 6. Calcular expiración (24h)
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    // 7. Crear registro en DB (email_verification_tokens.user_id FK → auth.users)
    const verificationToken = this.tokenRepository.create({
      user_id: userAuthId,
      token: hashedToken,
      email: email,
      expires_at: expiresAt,
    });
    await this.tokenRepository.save(verificationToken);

    // 8. Enviar email con token plaintext
    try {
      await this.mailService.sendVerificationEmail(email, plainToken);
      this.logger.log(`Verification email sent to: ${email}`);
    } catch (error) {
      // Log error pero no fallar (el token ya está creado)
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      // En desarrollo, mostrar el token para testing
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`[DEV] Verification token for ${email}: ${plainToken}`);
      }
    }

    return { message: 'Email de verificación enviado' };
  }

  /**
   * Verificar email con token
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string; verified: boolean }> {
    // 1. Hashear token recibido
    const hashedToken = this.hashToken(dto.token);

    // 2. Buscar token en DB
    const verificationToken = await this.tokenRepository.findOne({
      where: { token: hashedToken },
    });

    if (!verificationToken) {
      throw new InvalidTokenError('Token invalido');
    }

    // 3. Validar con helpers
    if (verificationToken.isExpired()) {
      throw new ExpiredTokenError();
    }

    if (verificationToken.isUsed()) {
      throw new UsedTokenError();
    }

    // 4. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: verificationToken.user_id },
    });

    if (!user) {
      throw new UserNotFoundError(verificationToken.user_id);
    }

    // 5. Actualizar email_confirmed_at (marca email como verificado)
    // Fix: Usar email_confirmed_at en lugar de email_verified
    user.email_confirmed_at = new Date();
    await this.userRepository.save(user);

    // 6. Marcar token como usado
    verificationToken.used_at = new Date();
    await this.tokenRepository.save(verificationToken);

    return {
      message: 'Email verificado exitosamente',
      verified: true,
    };
  }

  /**
   * Reenviar email de verificación
   * @param userAuthId - auth.users.id (NOT profile.id). Use req.user.user_id from controllers.
   */
  async resendVerification(userAuthId: string): Promise<{ message: string }> {
    // E11-FIX: userAuthId must be auth.users.id for auth.users lookup
    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userAuthId },
    });

    if (!user) {
      throw new UserNotFoundError(userAuthId);
    }

    // 2. Verificar si ya está verificado
    // Fix: Usar email_confirmed_at en lugar de email_verified
    if (user.email_confirmed_at) {
      throw new EmailAlreadyVerifiedError();
    }

    // 3. Enviar nuevo email
    return this.sendVerification(userAuthId, user.email);
  }

  /**
   * Verificar estado de verificación
   * @param userAuthId - auth.users.id (NOT profile.id). Use req.user.user_id from controllers.
   */
  async checkVerificationStatus(userAuthId: string): Promise<{ verified: boolean }> {
    // E4-FIX: userAuthId must be auth.users.id for auth.users lookup
    const user = await this.userRepository.findOne({
      where: { id: userAuthId },
      select: ['id', 'email_confirmed_at'],
    });

    if (!user) {
      throw new UserNotFoundError(userAuthId);
    }

    return { verified: !!user.email_confirmed_at };
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
  async cleanExpiredTokens(daysToKeep: number = 30): Promise<number> {
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
