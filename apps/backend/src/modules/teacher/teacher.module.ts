/**
 * Teacher Module
 *
 * Module for teacher-specific functionality
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { ModuleProgress } from '@/modules/progress/entities/module-progress.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { Assignment } from '@/modules/assignments/entities/assignment.entity';
import { AssignmentSubmission } from '@/modules/assignments/entities/assignment-submission.entity';
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
    TypeOrmModule.forFeature([Profile, User], 'auth'),
    TypeOrmModule.forFeature([Classroom, ClassroomMember], 'social'),
    TypeOrmModule.forFeature([Assignment, AssignmentSubmission], 'content'),
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
