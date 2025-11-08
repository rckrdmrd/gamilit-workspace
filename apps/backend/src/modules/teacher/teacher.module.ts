/**
 * Teacher Module
 *
 * Module for teacher-specific functionality
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ModuleProgress } from '@/modules/progress/entities/module-progress.entity';
import {
  TeacherDashboardService,
  StudentProgressService,
  GradingService,
  AnalyticsService,
} from './services';
import { TeacherController } from './controllers/teacher.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExerciseSubmission, ModuleProgress], 'progress'),
    TypeOrmModule.forFeature([Profile], 'auth'),
  ],
  controllers: [TeacherController],
  providers: [
    TeacherDashboardService,
    StudentProgressService,
    GradingService,
    AnalyticsService,
  ],
  exports: [
    TeacherDashboardService,
    StudentProgressService,
    GradingService,
    AnalyticsService,
  ],
})
export class TeacherModule {}
