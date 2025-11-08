/**
 * Tasks Module
 *
 * Scheduled tasks and cron jobs for the application
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MissionsModule } from '../missions/missions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MissionsCronService } from './services/missions-cron.service';
import { NotificationsCronService } from './services/notifications-cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MissionsModule,
    NotificationsModule,
  ],
  providers: [MissionsCronService, NotificationsCronService],
  exports: [MissionsCronService, NotificationsCronService],
})
export class TasksModule {}
