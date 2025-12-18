/**
 * Assignments Module
 *
 * Provides assignment management for teachers
 *
 * UPDATED (2025-11-08):
 * - Agregada entidad AssignmentExercise
 * - Agregada entidad AssignmentStudent
 *
 * CORRECTED (2025-12-18):
 * - Datasource cambiado de 'content' a 'educational' para entidades Assignment
 * - AssignmentClassroom usa datasource 'social' (pertenece a schema social_features)
 * - Fixes EntityMetadataNotFoundError en /teacher/assignments
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentClassroom } from '@/modules/social/entities/assignment-classroom.entity';
import { AssignmentExercise } from './entities/assignment-exercise.entity';
import { AssignmentStudent } from './entities/assignment-student.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { AssignmentsService } from './services/assignments.service';
import { AssignmentsController } from './controllers/assignments.controller';
import { StudentAssignmentsController } from './controllers/student-assignments.controller';

@Module({
  imports: [
    // Entidades educational_content → datasource 'educational'
    // Assignment, AssignmentExercise, AssignmentStudent, AssignmentSubmission pertenecen a schema educational_content
    TypeOrmModule.forFeature(
      [
        Assignment,
        AssignmentExercise,
        AssignmentStudent,
        AssignmentSubmission,
      ],
      'educational',
    ),
    // AssignmentClassroom → datasource 'social' (pertenece a schema social_features)
    TypeOrmModule.forFeature(
      [
        AssignmentClassroom,
      ],
      'social',
    ),
  ],
  controllers: [AssignmentsController, StudentAssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
