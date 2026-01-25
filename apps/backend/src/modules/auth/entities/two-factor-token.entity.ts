import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants';
import { User } from './user.entity';

/**
 * TwoFactorToken Entity
 *
 * @description Two-factor authentication configuration and OTP tokens.
 *
 * Supported methods:
 * - email: OTP sent via email
 * - sms: OTP sent via SMS (future)
 * - authenticator: TOTP apps like Google Authenticator (future)
 *
 * @see DDL: auth_management.two_factor_tokens
 * @security
 * - OTP tokens are hashed (SHA256) before storage
 * - Authenticator secrets are encrypted
 * - Rate limiting via attempts_count and locked_until
 */
@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.TWO_FACTOR_TOKENS })
@Index(['user_id'])
@Index(['user_id', 'is_enabled'])
export class TwoFactorToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 20 })
  method!: 'email' | 'sms' | 'authenticator';

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  secret_key!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  token_hash!: string | null;

  @Column({ type: 'boolean', default: false })
  is_enabled!: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verified_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  attempts_count!: number;

  @Column({ type: 'timestamptz', nullable: true })
  last_attempt_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until!: Date | null;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  backup_codes_encrypted!: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Helpers
  /**
   * Check if OTP token has expired
   */
  isExpired(): boolean {
    if (!this.expires_at) return true;
    return new Date() > this.expires_at;
  }

  /**
   * Check if account is locked due to too many attempts
   */
  isLocked(): boolean {
    if (!this.locked_until) return false;
    return new Date() < this.locked_until;
  }

  /**
   * Check if OTP can be verified (not expired, not locked)
   */
  canVerify(): boolean {
    return !this.isExpired() && !this.isLocked();
  }
}
