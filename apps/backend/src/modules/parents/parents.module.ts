/**
 * ParentsModule
 *
 * EXT-010 Parent Notifications + EXT-011 Parent Portal
 *
 * @description Module for parent portal features including:
 * - Parent authentication and account management
 * - Student linking and verification
 * - Weekly progress reports for students
 * - Real-time alerts (low performance, achievements, inactivity)
 * - Notification preference management
 * - Dashboard with student progress
 * - Report history and archival
 *
 * @see docs/03-fase-extensiones/EXT-010-parent-notifications/
 * @see docs/03-fase-extensiones/EXT-011-parent-portal/
 * @created 2026-01-27
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities from auth module
import {
  ParentAccount,
  ParentStudentLink,
  ParentNotification,
  Profile,
  User,
} from '@/modules/auth/entities';

// Services
import {
  WeeklyReportService,
  ReportContentAggregatorService,
  ParentAlertService,
  ParentPreferencesService,
  WeeklyReportCronService,
  ParentAuthService,
  ParentDashboardService,
} from './services';

// External modules
import { MailModule } from '@/modules/mail/mail.module';

@Module({
  imports: [
    // Mail module for sending emails
    MailModule,

    // JWT module for parent authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),

    // Auth entities (parent-related)
    TypeOrmModule.forFeature(
      [
        ParentAccount,
        ParentStudentLink,
        ParentNotification,
        Profile,
        User,
      ],
      'auth',
    ),
  ],
  providers: [
    // EXT-011 Parent Portal services
    ParentAuthService,
    ParentDashboardService,

    // EXT-010 Parent Notifications services
    WeeklyReportService,
    ReportContentAggregatorService,
    ParentAlertService,
    ParentPreferencesService,

    // Cron job service
    WeeklyReportCronService,
  ],
  exports: [
    // Export services for use in other modules
    ParentAuthService,
    ParentDashboardService,
    WeeklyReportService,
    ReportContentAggregatorService,
    ParentAlertService,
    ParentPreferencesService,
    WeeklyReportCronService,
  ],
})
export class ParentsModule {}
