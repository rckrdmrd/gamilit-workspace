/**
 * Tasks Module
 *
 * Scheduled tasks and cron jobs for the application.
 * Cron services are conditionally registered based on CRON_ENABLED env var.
 * When disabled, ScheduleModule is not loaded and cron providers are not instantiated.
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationModule } from '../gamification/gamification.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserAchievement, Mission } from '../gamification/entities';
import { MissionsCronService } from './services/missions-cron.service';
import { NotificationsCronService } from './services/notifications-cron.service';
import { AchievementReconciliationCronService } from './services/achievement-reconciliation-cron.service';
import { MaterializedViewsCronService } from './services/materialized-views-cron.service';
import { PendingInitializationsCronService } from './services/pending-initializations-cron.service';
import { AuditModule } from '../audit/audit.module';

const CRON_ENABLED = (process.env.CRON_ENABLED || 'true').toLowerCase() !== 'false';

const cronProviders = CRON_ENABLED
  ? [
    MissionsCronService,
    NotificationsCronService,
    AchievementReconciliationCronService,
    MaterializedViewsCronService,
    PendingInitializationsCronService,
  ]
  : [];

@Module({
  imports: [
    ...(CRON_ENABLED ? [ScheduleModule.forRoot()] : []),
    GamificationModule,
    NotificationsModule,
    // Import entities for cron services (AchievementReconciliation + MissionsCron)
    TypeOrmModule.forFeature([UserAchievement, Mission], 'gamification'),
    AuditModule,
  ],
  providers: cronProviders,
  exports: cronProviders,
})
export class TasksModule { }
