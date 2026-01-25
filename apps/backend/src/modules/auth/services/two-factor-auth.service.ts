import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { TwoFactorToken, Profile } from '../entities';

/**
 * TwoFactorAuthService
 *
 * @description Service for two-factor authentication management.
 *
 * Supported methods:
 * - email: OTP sent via email (implemented)
 * - sms: OTP sent via SMS (future)
 * - authenticator: TOTP apps (future)
 *
 * @security
 * - OTP tokens hashed with SHA256 before storage
 * - 6-digit OTP expires in 10 minutes
 * - Max 5 attempts before lockout (15 minutes)
 */
@Injectable()
export class TwoFactorAuthService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;

  constructor(
    @InjectRepository(TwoFactorToken, 'auth')
    private readonly twoFactorRepository: Repository<TwoFactorToken>,

    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Get 2FA status for user
   */
  async getStatus(userId: string): Promise<{ enabled: boolean; method: string | null }> {
    const config = await this.twoFactorRepository.findOne({
      where: { user_id: userId, is_enabled: true },
    });

    return {
      enabled: !!config?.is_enabled,
      method: config?.method || null,
    };
  }

  /**
   * Initiate 2FA setup
   * Generates OTP and returns it (in production, would send via email/sms)
   */
  async setup2FA(
    userId: string,
    method: 'email' | 'sms' | 'authenticator',
  ): Promise<{ message: string; expiresAt: Date }> {
    // Check if already has 2FA enabled
    const existing = await this.twoFactorRepository.findOne({
      where: { user_id: userId, is_enabled: true },
    });

    if (existing) {
      throw new BadRequestException('2FA ya está habilitado. Desactívalo primero para cambiar el método.');
    }

    // Generate 6-digit OTP
    const otp = this.generateOTP();
    const hashedOtp = this.hashOTP(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete any existing unverified setup for this user
    await this.twoFactorRepository.delete({
      user_id: userId,
      is_enabled: false,
    });

    // Create new 2FA config
    const twoFactorConfig = this.twoFactorRepository.create({
      user_id: userId,
      method,
      token_hash: hashedOtp,
      expires_at: expiresAt,
      is_enabled: false,
      is_verified: false,
    });

    await this.twoFactorRepository.save(twoFactorConfig);

    // TODO: In production, send OTP via email/sms based on method
    // For now, log it (remove in production!)
    console.log(`[2FA SETUP] OTP for user ${userId}: ${otp}`);

    return {
      message: `Código de verificación enviado a tu ${method === 'email' ? 'correo' : 'dispositivo'}`,
      expiresAt,
    };
  }

  /**
   * Verify 2FA setup (enable 2FA after successful verification)
   */
  async verifySetup(userId: string, code: string): Promise<{ message: string; backupCodes?: string[] }> {
    const config = await this.twoFactorRepository.findOne({
      where: { user_id: userId, is_enabled: false, is_verified: false },
    });

    if (!config) {
      throw new NotFoundException('No hay configuración de 2FA pendiente');
    }

    // Check if locked
    if (config.isLocked()) {
      throw new BadRequestException(
        `Demasiados intentos. Intenta de nuevo en ${this.LOCKOUT_MINUTES} minutos.`
      );
    }

    // Check if expired
    if (config.isExpired()) {
      await this.twoFactorRepository.delete({ id: config.id });
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    // Verify code
    const hashedCode = this.hashOTP(code);
    if (hashedCode !== config.token_hash) {
      // Increment attempts
      config.attempts_count += 1;
      config.last_attempt_at = new Date();

      if (config.attempts_count >= this.MAX_ATTEMPTS) {
        config.locked_until = new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000);
      }

      await this.twoFactorRepository.save(config);
      throw new UnauthorizedException('Código incorrecto');
    }

    // Enable 2FA
    config.is_enabled = true;
    config.is_verified = true;
    config.verified_at = new Date();
    config.token_hash = null; // Clear the setup OTP
    config.attempts_count = 0;

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    config.backup_codes_encrypted = JSON.stringify(backupCodes.map(c => this.hashOTP(c)));

    await this.twoFactorRepository.save(config);

    return {
      message: '2FA habilitado correctamente',
      backupCodes, // Return plaintext backup codes ONCE
    };
  }

  /**
   * Send OTP for login verification
   */
  async sendLoginOTP(userId: string): Promise<{ message: string; expiresAt: Date }> {
    const config = await this.twoFactorRepository.findOne({
      where: { user_id: userId, is_enabled: true },
    });

    if (!config) {
      throw new BadRequestException('2FA no está habilitado para este usuario');
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const hashedOtp = this.hashOTP(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Update config with new OTP
    config.token_hash = hashedOtp;
    config.expires_at = expiresAt;
    config.attempts_count = 0;
    config.locked_until = null;

    await this.twoFactorRepository.save(config);

    // TODO: Send OTP via configured method
    console.log(`[2FA LOGIN] OTP for user ${userId}: ${otp}`);

    return {
      message: 'Código de verificación enviado',
      expiresAt,
    };
  }

  /**
   * Verify OTP for login
   */
  async verifyLoginOTP(userId: string, code: string): Promise<{ valid: boolean }> {
    const config = await this.twoFactorRepository.findOne({
      where: { user_id: userId, is_enabled: true },
    });

    if (!config) {
      throw new BadRequestException('2FA no está habilitado');
    }

    // Check if locked
    if (config.isLocked()) {
      throw new BadRequestException(
        `Cuenta bloqueada. Intenta de nuevo en ${this.LOCKOUT_MINUTES} minutos.`
      );
    }

    // Check if expired
    if (config.isExpired()) {
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    // Check regular OTP
    const hashedCode = this.hashOTP(code);
    if (hashedCode === config.token_hash) {
      // Clear OTP after successful use
      config.token_hash = null;
      config.attempts_count = 0;
      await this.twoFactorRepository.save(config);
      return { valid: true };
    }

    // Check backup codes
    if (config.backup_codes_encrypted) {
      const backupCodes: string[] = JSON.parse(config.backup_codes_encrypted);
      const index = backupCodes.indexOf(hashedCode);

      if (index !== -1) {
        // Remove used backup code
        backupCodes.splice(index, 1);
        config.backup_codes_encrypted = JSON.stringify(backupCodes);
        config.attempts_count = 0;
        await this.twoFactorRepository.save(config);
        return { valid: true };
      }
    }

    // Invalid code
    config.attempts_count += 1;
    config.last_attempt_at = new Date();

    if (config.attempts_count >= this.MAX_ATTEMPTS) {
      config.locked_until = new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000);
    }

    await this.twoFactorRepository.save(config);
    throw new UnauthorizedException('Código incorrecto');
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<{ message: string }> {
    // Note: Password validation should be done in controller using AuthService
    const config = await this.twoFactorRepository.findOne({
      where: { user_id: userId, is_enabled: true },
    });

    if (!config) {
      throw new BadRequestException('2FA no está habilitado');
    }

    await this.twoFactorRepository.delete({ id: config.id });

    return { message: '2FA deshabilitado correctamente' };
  }

  /**
   * Resend OTP (for both setup and login)
   */
  async resendOTP(userId: string): Promise<{ message: string; expiresAt: Date }> {
    const config = await this.twoFactorRepository.findOne({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    if (!config) {
      throw new NotFoundException('No hay configuración de 2FA');
    }

    // Check rate limiting (can't resend within 1 minute)
    if (config.last_attempt_at) {
      const lastSent = new Date(config.last_attempt_at).getTime();
      const now = Date.now();
      if (now - lastSent < 60000) {
        throw new BadRequestException('Espera 1 minuto antes de solicitar otro código');
      }
    }

    // Generate new OTP
    const otp = this.generateOTP();
    const hashedOtp = this.hashOTP(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    config.token_hash = hashedOtp;
    config.expires_at = expiresAt;
    config.attempts_count = 0;
    config.locked_until = null;
    config.last_attempt_at = new Date();

    await this.twoFactorRepository.save(config);

    // TODO: Send OTP via configured method
    console.log(`[2FA RESEND] OTP for user ${userId}: ${otp}`);

    return {
      message: 'Nuevo código enviado',
      expiresAt,
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Generate random 6-digit OTP
   */
  private generateOTP(): string {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }

  /**
   * Hash OTP using SHA256
   */
  private hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Generate 8 backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
