/**
 * Tasks Module
 *
 * Scheduled tasks and cron jobs for the application
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GamificationModule } from '../gamification/gamification.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MissionsCronService } from './services/missions-cron.service';
import { NotificationsCronService } from './services/notifications-cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GamificationModule,
    NotificationsModule,
  ],
  providers: [
    MissionsCronService,
    NotificationsCronService,
  ],
  exports: [
    MissionsCronService,
    NotificationsCronService,
  ],
})
export class TasksModule {}
