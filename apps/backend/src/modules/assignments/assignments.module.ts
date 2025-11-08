/**
 * Assignments Module
 *
 * Provides assignment management for teachers
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentClassroom } from './entities/assignment-classroom.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { AssignmentsService } from './services/assignments.service';
import { AssignmentsController } from './controllers/assignments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Assignment, AssignmentClassroom, AssignmentSubmission],
      'content', // Use content_management connection
    ),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
