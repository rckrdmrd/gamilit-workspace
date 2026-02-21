import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Module as ModuleEntity,
  Exercise,
  AssessmentRubric,
  MediaResource,
  MediaAttachment,
  ContentApproval,
  ExerciseValidationConfig, // ✨ NUEVO - 2026-01-14 (Sistema Dual ADR-008)
  ExerciseTypeRubric, // ✨ NUEVO - 2026-01-14 (Rúbricas por tipo M4-M5)
  ExerciseValidationAudit, // ✨ NUEVO - 2026-01-14 (Auditoría de validaciones)
  ClassroomModule, // FIX P2: Missing forFeature
  ContentMetadata, // FIX P2: Missing forFeature
  ContentTag, // FIX P2: Missing forFeature
  DifficultyCriteria, // FIX P2: Missing forFeature
  ExerciseMechanicMapping, // FIX P2: Missing forFeature
  ModuleDependencies, // FIX P2: Missing forFeature
  Taxonomy, // FIX P2: Missing forFeature
} from './entities';
import { Profile } from '../auth/entities/profile.entity';
import { ClassroomMember } from '../social/entities/classroom-member.entity';
import { AssignmentClassroom } from '../social/entities/assignment-classroom.entity';
import { AssignmentExercise } from '../assignments/entities/assignment-exercise.entity';
import {
  ModulesService,
  ExercisesService,
  MediaService,
  ExerciseTypeRubricService,
  ExerciseValidationConfigService,
  ExerciseValidationAuditService,
} from './services';
import { MediaStorageService } from './services/media-storage.service';
import {
  ModulesController,
  ExercisesController,
  MediaController,
} from './controllers';
import { MediaUploadController } from './controllers/media-upload.controller';
import { ExerciseValidationController } from './controllers/exercise-validation.controller';
import { ProgressModule } from '../progress/progress.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { GamificationModule } from '../gamification/gamification.module';

/**
 * EducationalModule
 *
 * Módulo NestJS que encapsula toda la lógica educativa.
 * Incluye:
 * - Módulos educativos (con contenido estructurado)
 * - Ejercicios (27+ tipos diferentes)
 * - Recursos multimedia (imágenes, videos, audio, documentos)
 * - Rúbricas de evaluación
 *
 * Exporta tres servicios principales:
 * - ModulesService: Gestión de módulos
 * - ExercisesService: Gestión de ejercicios
 * - MediaService: Gestión de recursos multimedia
 *
 * Expone tres controladores REST:
 * - ModulesController: API para módulos educativos
 * - ExercisesController: API para ejercicios
 * - MediaController: API para recursos multimedia
 */
@Module({
  imports: [
    // Connection 'educational' handles schema 'educational_content'
    TypeOrmModule.forFeature(
      [
        ModuleEntity,
        Exercise,
        AssessmentRubric,
        MediaResource,
        MediaAttachment,
        ContentApproval,
        AssignmentExercise,
        ExerciseValidationConfig, // ✨ NUEVO - 2026-01-14 (Sistema Dual ADR-008)
        ExerciseTypeRubric, // ✨ NUEVO - 2026-01-14 (Rúbricas por tipo M4-M5)
        ExerciseValidationAudit, // ✨ NUEVO - 2026-01-14 (Auditoría de validaciones)
        ClassroomModule, // FIX P2: Missing forFeature (P1-002)
        ContentMetadata, // FIX P2: Missing forFeature (DDL coherence)
        ContentTag, // FIX P2: Missing forFeature (DDL coherence)
        DifficultyCriteria, // FIX P2: Missing forFeature (P1-001)
        ExerciseMechanicMapping, // FIX P2: Missing forFeature (DDL coherence)
        ModuleDependencies, // FIX P2: Missing forFeature (DDL coherence)
        Taxonomy, // FIX P2: Missing forFeature (DDL coherence)
      ],
      'educational',
    ),
    // Import Profile entity from auth schema (for ExercisesController)
    TypeOrmModule.forFeature([Profile], 'auth'),
    // GAP-C06: Import entities from social schema for RLS
    TypeOrmModule.forFeature([ClassroomMember, AssignmentClassroom], 'social'),
    // Import ProgressModule to access ExerciseSubmissionService for submit endpoint
    ProgressModule,
    // F1-A: WebSocket events for gamification (exercise submit flow)
    WebSocketModule,
    GamificationModule,
  ],
  controllers: [
    ModulesController,
    ExercisesController,
    MediaController,
    MediaUploadController,
    ExerciseValidationController,
  ],
  providers: [
    ModulesService,
    ExercisesService,
    MediaService,
    MediaStorageService,
    ExerciseTypeRubricService,
    ExerciseValidationConfigService,
    ExerciseValidationAuditService,
  ],
  exports: [
    ModulesService,
    ExercisesService,
    MediaService,
    MediaStorageService,
    ExerciseTypeRubricService,
    ExerciseValidationConfigService,
    ExerciseValidationAuditService,
  ],
})
export class EducationalModule {}
