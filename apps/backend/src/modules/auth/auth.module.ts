import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import {
  User,
  Profile,
  Tenant,
  Role, // ✨ NUEVO - RBAC
  UserRole,
  Membership,
  AuthProvider,
  AuthAttempt,
  UserSession,
  EmailVerificationToken,
  PasswordResetToken,
  SecurityEvent, // ✨ NUEVO - P0 (Auditoría de seguridad)
  ParentAccount, // ✨ NUEVO - 2026-01-14 (Portal de padres EXT-010)
  ParentStudentLink, // ✨ NUEVO - 2026-01-14 (Vinculación padre-estudiante)
  ParentNotification, // ✨ NUEVO - 2026-01-14 (Notificaciones a padres)
  TwoFactorToken, // ✨ NUEVO - GAP-P0-001 (2FA)
} from './entities';

// Services
import {
  AuthService,
  SessionManagementService,
  SecurityService,
  PasswordRecoveryService,
  EmailVerificationService,
  TwoFactorAuthService,
} from './services';

// Controllers
import { AuthController, PasswordController, UsersController } from './controllers';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Constants

// External modules
import { MailModule } from '@/modules/mail/mail.module';
import { GamificationModule } from '@/modules/gamification/gamification.module';

// Gamification entities for getUserStatistics (GAP-008)
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';
import { UserRank } from '@/modules/gamification/entities/user-rank.entity';
import { UserAchievement } from '@/modules/gamification/entities/user-achievement.entity';
import { Achievement } from '@/modules/gamification/entities/achievement.entity';
import { MLCoinsTransaction } from '@/modules/gamification/entities/ml-coins-transaction.entity';

// Progress tracking entities for getUserStatistics (GAP-008)
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';

/**
 * AuthModule
 *
 * @description Módulo de autenticación completo.
 *
 * @exports
 * - AuthService (para usar en otros módulos)
 * - SessionManagementService
 * - EmailVerificationService
 *
 * @imports
 * - JwtModule (con config async desde env)
 * - PassportModule (para strategies)
 * - TypeOrmModule (con multi-schema para auth + auth_management)
 */
@Module({
  imports: [
    // Mail module for sending emails
    MailModule,

    // Gamification module (Inventory Service)
    GamificationModule,

    // Passport configuration
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT configuration (async con env vars)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-only-jwt-secret-not-for-production',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        } as JwtModuleOptions['signOptions'],
      }),
      inject: [ConfigService],
    }),

    // TypeORM entities - Connection 'auth' handles schema 'auth_management'
    // Note: 'auth' is the connection name defined in app.module.ts
    // The actual schema 'auth_management' is specified in entity decorators
    TypeOrmModule.forFeature(
      [
        User,
        Profile,
        Tenant,
        Role, // ✨ NUEVO - RBAC
        UserRole,
        Membership,
        AuthProvider,
        AuthAttempt,
        UserSession,
        EmailVerificationToken,
        PasswordResetToken,
        SecurityEvent, // ✨ NUEVO - P0 (Auditoría de seguridad)
        ParentAccount, // ✨ NUEVO - 2026-01-14 (Portal de padres EXT-010)
        ParentStudentLink, // ✨ NUEVO - 2026-01-14 (Vinculación padre-estudiante)
        ParentNotification, // ✨ NUEVO - 2026-01-14 (Notificaciones a padres)
        TwoFactorToken, // ✨ NUEVO - GAP-P0-001 (2FA)
      ],
      'auth',
    ),

    // TypeORM entities - Connection 'gamification' for getUserStatistics (GAP-008)
    TypeOrmModule.forFeature(
      [
        UserStats,
        UserRank,
        UserAchievement,
        Achievement,
        MLCoinsTransaction,
      ],
      'gamification',
    ),

    // TypeORM entities - Connection 'progress' for getUserStatistics (GAP-008)
    TypeOrmModule.forFeature(
      [
        ExerciseSubmission,
      ],
      'progress',
    ),
  ],
  controllers: [AuthController, PasswordController, UsersController],
  providers: [
    // Services
    AuthService,
    SessionManagementService,
    SecurityService,
    PasswordRecoveryService,
    EmailVerificationService,
    TwoFactorAuthService,

    // Strategies
    JwtStrategy,
  ],
  exports: [
    // Exportar services para usar en otros módulos
    AuthService,
    SessionManagementService,
    EmailVerificationService,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
