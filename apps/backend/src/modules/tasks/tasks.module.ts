/**
 * Tasks Module
 *
 * Scheduled tasks and cron jobs for the application
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationModule } from '../gamification/gamification.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserAchievement } from '../gamification/entities';
import { MissionsCronService } from './services/missions-cron.service';
import { NotificationsCronService } from './services/notifications-cron.service';
import { AchievementReconciliationCronService } from './services/achievement-reconciliation-cron.service';
import { MaterializedViewsCronService } from './services/materialized-views-cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GamificationModule,
    NotificationsModule,
    // Import UserAchievement for AchievementReconciliationCronService
    TypeOrmModule.forFeature([UserAchievement], 'gamification'),
  ],
  providers: [
    MissionsCronService,
    NotificationsCronService,
    AchievementReconciliationCronService,
    MaterializedViewsCronService,
  ],
  exports: [
    MissionsCronService,
    NotificationsCronService,
    AchievementReconciliationCronService,
    MaterializedViewsCronService,
  ],
})
export class TasksModule {}
