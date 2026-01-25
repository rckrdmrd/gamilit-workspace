import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import * as entities from './entities';
import * as services from './services';
import * as controllers from './controllers';
import { PendingActivitiesService } from './services/pending-activities.service';
import { RecentActivityService } from './services/recent-activity.service';
// TASK-2026-01-18-015 Sprint 3: Import new services
import { EngagementMetricsService } from './services/engagement-metrics.service';
import { SessionCleanupService } from './services/session-cleanup.service';
import { Module as EducationalModule } from '../educational/entities/module.entity';
import { Exercise } from '../educational/entities/exercise.entity';
import { Profile } from '../auth/entities/profile.entity';
import { GamificationModule } from '../gamification/gamification.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
// FIX GAP-LOW-003: WebSocket for real-time balance updates
import { WebSocketModule } from '../websocket/websocket.module';

/**
 * ProgressModule
 *
 * @description Módulo de Progress Tracking para gestión de progreso de estudiantes.
 *
 * Responsabilidades:
 * - Tracking de progreso por módulo educativo
 * - Gestión de sesiones de aprendizaje
 * - Registro de intentos y envíos de ejercicios
 * - Misiones programadas para aulas (classroom-based)
 * - Analytics y estadísticas de aprendizaje
 * - Notas de profesores sobre estudiantes
 * - Certificados digitales con verificación QR [EPIC 10.2]
 *
 * Entidades (9):
 * - ModuleProgress: Progreso de estudiantes por módulo
 * - LearningSession: Sesiones de aprendizaje con tracking de tiempo
 * - ExerciseAttempt: Intentos individuales de ejercicios
 * - ExerciseSubmission: Envíos finales y calificaciones
 * - ScheduledMission: Misiones programadas con deadlines
 * - TeacherNote: Notas de profesores sobre estudiantes
 * - EngagementMetrics: Métricas diarias de engagement
 * - MasteryTracking: Seguimiento de dominio de temas
 * - Certificate: Certificados digitales [EPIC 10.2]
 *
 * Services (6):
 * - ModuleProgressService: 11 métodos CRUD + analytics
 * - LearningSessionService: 8 métodos de tracking de sesiones
 * - ExerciseAttemptService: 12 métodos de intentos y scoring
 * - ExerciseSubmissionService: 13 métodos de submissions y grading
 * - ScheduledMissionService: 13 métodos de misiones colectivas
 * - CertificateService: Generación y verificación de certificados [EPIC 10.2]
 *
 * Controllers (6):
 * - ModuleProgressController: 10 endpoints REST
 * - LearningSessionController: 8 endpoints REST
 * - ExerciseAttemptController: 9 endpoints REST
 * - ExerciseSubmissionController: 11 endpoints REST
 * - ScheduledMissionController: 9 endpoints REST
 * - CertificateController: 7 endpoints REST [EPIC 10.2]
 *
 * Total: 54 endpoints REST API
 *
 * @see /docs/02-especificaciones-tecnicas/apis/progress-api/README.md
 */
@NestModule({
  imports: [
    // TASK-2026-01-18-015 Sprint 3: Schedule module for cron jobs
    ScheduleModule.forRoot(),
    // Connection 'progress' handles schema 'progress_tracking'
    TypeOrmModule.forFeature(
      [
        entities.ModuleProgress,
        entities.LearningSession,
        entities.ExerciseAttempt,
        entities.ExerciseSubmission,
        entities.ScheduledMission,
        entities.TeacherNote, // ✨ NUEVO - P0 (Notas del profesor)
        entities.EngagementMetrics, // ✨ NUEVO - P2 (Analytics)
        entities.MasteryTracking, // ✨ NUEVO - P2 (Adaptive Learning)
        entities.LearningPath, // ✨ NUEVO - P2 (Rutas de aprendizaje)
        entities.UserLearningPath, // ✨ NUEVO - P2 (Usuarios en rutas)
        entities.ProgressSnapshot, // ✨ NUEVO - P2 (Snapshots históricos)
        entities.SkillAssessment, // ✨ NUEVO - P2 (Evaluaciones de habilidades)
        entities.Certificate, // ✨ NUEVO - EPIC 10.2 (Certificados digitales)
        entities.TeacherAlertConfiguration, // ✨ NUEVO - US-PM-007 (Config alertas profesor)
      ],
      'progress',
    ),
    // Import Module and Exercise entities from educational schema
    TypeOrmModule.forFeature([EducationalModule, Exercise], 'educational'),
    // Import Profile entity from auth schema (for ExerciseSubmissionService)
    TypeOrmModule.forFeature([Profile], 'auth'),
    // Import GamificationModule for MLCoinsService and UserStatsService
    GamificationModule,
    // Import NotificationsModule for teacher notifications (BE-P2-008)
    NotificationsModule,
    // Import MailModule for email notifications (BE-P2-008)
    MailModule,
    // FIX GAP-LOW-003: WebSocket for real-time balance updates
    WebSocketModule,
  ],
  providers: [
    services.ModuleProgressService,
    services.LearningSessionService,
    services.ExerciseAttemptService,
    services.ExerciseSubmissionService,
    services.ScheduledMissionService,
    services.CertificateService, // ✨ NUEVO - EPIC 10.2
    PendingActivitiesService,
    RecentActivityService,
    // TASK-2026-01-18-015 Sprint 3: Backend robustness services
    EngagementMetricsService,
    SessionCleanupService,
  ],
  controllers: [
    controllers.ModuleProgressController,
    controllers.LearningSessionController,
    controllers.ExerciseAttemptController,
    controllers.ExerciseSubmissionController,
    controllers.ScheduledMissionController,
    controllers.CertificateController, // ✨ NUEVO - EPIC 10.2
  ],
  exports: [
    services.ModuleProgressService,
    services.LearningSessionService,
    services.ExerciseAttemptService,
    services.ExerciseSubmissionService,
    services.ScheduledMissionService,
    services.CertificateService, // ✨ NUEVO - EPIC 10.2
    // TASK-2026-01-18-015 Sprint 3: Export for use in teacher module
    EngagementMetricsService,
  ],
})
export class ProgressModule {}
