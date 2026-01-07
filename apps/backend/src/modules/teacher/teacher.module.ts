import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

// Auth entities
import { Profile } from '@modules/auth/entities/profile.entity';
import { User } from '@modules/auth/entities/user.entity';

// Social entities
import { ClassroomMember } from '@modules/social/entities/classroom-member.entity';
import { TeacherClassroom } from '@modules/social/entities/teacher-classroom.entity';
import { Classroom } from '@modules/social/entities/classroom.entity';

// Progress entities
import { ExerciseSubmission } from '@modules/progress/entities/exercise-submission.entity';
import { ExerciseAttempt } from '@modules/progress/entities/exercise-attempt.entity';
import { ModuleProgress } from '@modules/progress/entities/module-progress.entity';
import { ManualReview } from '@modules/progress/entities/manual-review.entity';

// Educational entities
import { Module as EducationalModule } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';

// Gamification entities
import { UserStats } from '@modules/gamification/entities/user-stats.entity';
import { Achievement } from '@modules/gamification/entities/achievement.entity';
import { UserAchievement } from '@modules/gamification/entities/user-achievement.entity';

// Content entities
import { Assignment } from '@modules/assignments/entities/assignment.entity';
import { AssignmentSubmission } from '@modules/assignments/entities/assignment-submission.entity';

// Teacher entities
import { StudentInterventionAlert } from './entities/student-intervention-alert.entity';
import { Message, MessageParticipant } from './entities/message.entity';
import { TeacherContent } from './entities/teacher-content.entity';
import { TeacherReport } from './entities/teacher-report.entity';

// Controllers
import { TeacherClassroomsController } from './controllers/teacher-classrooms.controller';
import { TeacherController } from './controllers/teacher.controller';
import { TeacherGradesController } from './controllers/teacher-grades.controller';
import { InterventionAlertsController } from './controllers/intervention-alerts.controller';
import { TeacherCommunicationController } from './controllers/teacher-communication.controller';
import { TeacherContentController } from './controllers/teacher-content.controller';
import { ExerciseResponsesController } from './controllers/exercise-responses.controller';
import { ManualReviewController } from './controllers/manual-review.controller';

// Services
import {
  StudentBlockingService,
  TeacherDashboardService,
  StudentProgressService,
  GradingService,
  AnalyticsService,
  StudentRiskAlertService,
  ReportsService,
  TeacherClassroomsCrudService,
  InterventionAlertsService,
  TeacherContentService,
  BonusCoinsService,
  ExerciseResponsesService,
  StorageService,
  TeacherReportsService,
  RubricScoringService,
} from './services';
import { TeacherMessagesService } from './services/teacher-messages.service';
import { ManualReviewService } from './services/manual-review.service';

// Guards
import { TeacherGuard, ClassroomOwnershipGuard } from './guards';

// External modules
import { ProgressModule } from '@modules/progress/progress.module';
// P0-04: Added 2025-12-18 - NotificationsModule for StudentRiskAlertService
import { NotificationsModule } from '@modules/notifications/notifications.module';
// FIX GAP-LOW-001: AuditModule for review event tracking
import { AuditModule } from '@modules/audit/audit.module';

/**
 * TeacherModule
 *
 * @description Comprehensive module for teacher functionalities
 * @module teacher
 *
 * Features:
 * - Student Blocking/Permissions
 * - Classroom Management
 * - Dashboard & Analytics
 * - Student Progress Tracking
 * - Grading & Feedback
 * - Student Insights (AI-powered)
 * - Risk Alerts & Monitoring
 * - Report Generation (PDF/Excel)
 *
 * Controllers:
 * - TeacherClassroomsController: Gestión de estudiantes en aulas
 * - TeacherController: Analytics, progress, grading, insights, reports
 * - TeacherGradesController: Grades management (view of submissions with scores)
 * - TeacherCommunicationController: Comunicación con estudiantes (mensajes, anuncios, feedback)
 *
 * Services:
 * - StudentBlockingService: Bloqueo y permisos de estudiantes
 * - TeacherDashboardService: Dashboard statistics and summaries
 * - StudentProgressService: Student progress tracking and notes
 * - GradingService: Exercise grading and feedback
 * - AnalyticsService: Analytics and student insights (with caching)
 * - StudentRiskAlertService: Automated risk monitoring (CRON)
 * - ReportsService: PDF/Excel report generation
 * - TeacherMessagesService: Comunicación con estudiantes (mensajes, anuncios, feedback)
 *
 * Guards:
 * - TeacherGuard: Verificar rol de profesor
 * - ClassroomOwnershipGuard: Verificar acceso a aula
 */
@Module({
  imports: [
    // Cache configuration for AnalyticsService
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // Maximum number of items in cache
      isGlobal: false,
    }),

    // Schedule module for StudentRiskAlertService CRON jobs
    ScheduleModule.forRoot(),

    // Import ProgressModule for ExerciseSubmissionService (needed for reward distribution)
    ProgressModule,

    // P0-04: Import NotificationsModule for StudentRiskAlertService
    NotificationsModule,

    // FIX GAP-LOW-001: Import AuditModule for review event tracking
    AuditModule,

    // Entities from 'auth' datasource
    TypeOrmModule.forFeature([Profile, User], 'auth'),

    // Entities from 'social' datasource
    TypeOrmModule.forFeature([ClassroomMember, TeacherClassroom, Classroom, TeacherReport], 'social'),

    // Entities from 'progress' datasource
    TypeOrmModule.forFeature(
      [ExerciseSubmission, ExerciseAttempt, ModuleProgress, ManualReview],
      'progress',
    ),

    // Entities from 'educational' datasource
    TypeOrmModule.forFeature([EducationalModule, Exercise], 'educational'),

    // Entities from 'gamification' datasource
    TypeOrmModule.forFeature([UserStats, Achievement, UserAchievement], 'gamification'),

    // Entities from 'educational' datasource (schema: educational_content)
    // CORRECTED (2025-12-18): Cambiado de 'content' a 'educational'
    // Assignment, AssignmentSubmission y TeacherContent pertenecen a educational_content schema
    TypeOrmModule.forFeature([Assignment, AssignmentSubmission, TeacherContent], 'educational'),

    // Entities from 'progress' datasource (teacher entities)
    TypeOrmModule.forFeature([StudentInterventionAlert], 'progress'),

    // Entities from 'communication' datasource (teacher messages)
    TypeOrmModule.forFeature([Message, MessageParticipant], 'communication'),
  ],
  controllers: [
    TeacherClassroomsController,
    TeacherController,
    TeacherGradesController,
    InterventionAlertsController,
    TeacherCommunicationController,
    TeacherContentController,
    ExerciseResponsesController,
    ManualReviewController,
  ],
  providers: [
    // Core services
    StudentBlockingService,
    TeacherDashboardService,
    StudentProgressService,
    GradingService,
    AnalyticsService,
    StudentRiskAlertService,
    ReportsService,
    TeacherClassroomsCrudService,
    InterventionAlertsService,
    TeacherMessagesService,
    TeacherContentService,
    BonusCoinsService,
    ExerciseResponsesService,
    StorageService,
    TeacherReportsService,
    ManualReviewService,
    RubricScoringService,

    // Guards
    TeacherGuard,
    ClassroomOwnershipGuard,
  ],
  exports: [
    StudentBlockingService,
    TeacherDashboardService,
    StudentProgressService,
    GradingService,
    AnalyticsService,
    ReportsService,
    TeacherClassroomsCrudService,
    TeacherMessagesService,
    TeacherContentService,
    ExerciseResponsesService,
    ManualReviewService,
    RubricScoringService,
  ],
})
export class TeacherModule {}
