/**
 * Progress Tracking Services - Barrel Export
 *
 * @description Exporta todos los servicios CORE del módulo de Progress Tracking
 * @usage import { ModuleProgressService, LearningSessionService, ExerciseAttemptService } from '@/modules/progress/services';
 *
 * Services incluidos:
 * - ModuleProgressService: Gestión de progreso por módulo
 * - LearningSessionService: Tracking de sesiones de aprendizaje
 * - ExerciseAttemptService: Gestión de intentos de ejercicios
 * - ExerciseSubmissionService: Envíos finales y calificaciones
 * - ScheduledMissionService: Misiones programadas para aulas
 * - CertificateService: Generación y verificación de certificados [EPIC 10.2]
 * - EngagementMetricsService: Métricas diarias de engagement [TASK-2026-01-18-015]
 * - SessionCleanupService: Limpieza de sesiones huérfanas [TASK-2026-01-18-015]
 */

export * from './module-progress.service';
export * from './learning-session.service';
export * from './exercise-attempt.service';
export * from './exercise-submission.service';
export * from './scheduled-mission.service';
export * from './certificate.service';
// TASK-2026-01-18-015 Sprint 3: Backend robustness services
export * from './engagement-metrics.service';
export * from './session-cleanup.service';
