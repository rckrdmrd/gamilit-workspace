/**
 * Student Progress DTOs
 *
 * DTOs alineados con las interfaces del frontend para el modal de detalle de estudiante.
 * Estos DTOs resuelven los GAPs identificados en TASK-2026-01-18-005:
 * - GAP-SDM-001: Estructura plana en lugar de anidada
 * - GAP-SDM-002: Nombres de campos coinciden con frontend
 * - GAP-SDM-003: Campos adicionales incluidos
 *
 * @see apps/frontend/src/services/api/teacher/studentProgressApi.ts
 * @see orchestration/analisis/ANALISIS-STUDENT-DETAIL-MODAL-2026-01-18.md
 */

import { ApiProperty } from '@nestjs/swagger';

// Note: GetStudentProgressQueryDto is defined in analytics.dto.ts and exported from there
// to avoid duplication.

// ============================================================================
// MODULE PROGRESS DTO (para array module_progress)
// ============================================================================

/**
 * Progreso por modulo - estructura alineada con frontend
 * @see StudentProgress.module_progress en studentProgressApi.ts
 */
export class ModuleProgressDto {
  @ApiProperty({
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    module_id!: string;

  @ApiProperty({
    description: 'Module name',
    example: 'Modulo 1: Comprension Literal',
  })
    module_name!: string;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 75.5,
  })
    progress_percentage!: number;

  @ApiProperty({
    description: 'Average score for this module (0-100)',
    example: 82.3,
  })
    score!: number;

  @ApiProperty({
    description: 'Number of exercises completed in this module',
    example: 12,
  })
    exercises_completed!: number;

  @ApiProperty({
    description: 'Total exercises in this module',
    example: 15,
  })
    exercises_total!: number;
}

// ============================================================================
// STUDENT PROGRESS RESPONSE DTO
// ============================================================================

/**
 * Respuesta completa de progreso de estudiante - estructura PLANA
 * Alineada con frontend StudentProgress interface
 *
 * @see apps/frontend/src/services/api/teacher/studentProgressApi.ts:32-51
 */
export class StudentProgressResponseDto {
  @ApiProperty({
    description: 'Student ID (user_id)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    student_id!: string;

  @ApiProperty({
    description: 'Student full name',
    example: 'Juan Perez Garcia',
  })
    student_name!: string;

  @ApiProperty({
    description: 'Overall progress percentage (0-100)',
    example: 68.5,
  })
    overall_progress!: number;

  @ApiProperty({
    description: 'Number of modules completed',
    example: 3,
  })
    modules_completed!: number;

  @ApiProperty({
    description: 'Total number of modules',
    example: 5,
  })
    modules_total!: number;

  @ApiProperty({
    description: 'Number of exercises completed',
    example: 45,
  })
    exercises_completed!: number;

  @ApiProperty({
    description: 'Total number of exercises',
    example: 60,
  })
    exercises_total!: number;

  @ApiProperty({
    description: 'Average score across all exercises (0-100)',
    example: 78.2,
  })
    average_score!: number;

  @ApiProperty({
    description: 'Total time spent in minutes',
    example: 245,
  })
    time_spent_minutes!: number;

  @ApiProperty({
    description: 'Last activity timestamp (ISO string)',
    example: '2026-01-18T14:30:00Z',
  })
    last_activity!: string;

  @ApiProperty({
    description: 'Progress breakdown by module',
    type: [ModuleProgressDto],
  })
    module_progress!: ModuleProgressDto[];
}

// ============================================================================
// STUDENT STATS RESPONSE DTO
// ============================================================================

/**
 * Estadisticas de estudiante - estructura alineada con frontend
 * Incluye campos de gamificacion requeridos por StudentDetailModal
 *
 * @see apps/frontend/src/services/api/teacher/studentProgressApi.ts:74-91
 * @see apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx:204-246
 */
export class StudentStatsResponseDto {
  @ApiProperty({
    description: 'Student ID (user_id)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    student_id!: string;

  @ApiProperty({
    description: 'Total number of learning sessions',
    example: 42,
  })
    total_sessions!: number;

  @ApiProperty({
    description: 'Average session duration in minutes',
    example: 25.5,
  })
    average_session_duration!: number;

  @ApiProperty({
    description: 'Total time spent in seconds',
    example: 14700,
  })
    total_time_spent!: number;

  @ApiProperty({
    description: 'Total exercises attempted',
    example: 65,
  })
    exercises_attempted!: number;

  @ApiProperty({
    description: 'Exercises completed successfully',
    example: 52,
  })
    exercises_completed!: number;

  @ApiProperty({
    description: 'Exercises failed (not completed correctly)',
    example: 13,
  })
    exercises_failed!: number;

  @ApiProperty({
    description: 'Average score across all submissions (0-100)',
    example: 78.5,
  })
    average_score!: number;

  @ApiProperty({
    description: 'Highest score achieved (0-100)',
    example: 100,
  })
    highest_score!: number;

  @ApiProperty({
    description: 'Lowest score achieved (0-100)',
    example: 45,
  })
    lowest_score!: number;

  @ApiProperty({
    description: 'Completion rate percentage',
    example: 80.0,
  })
    completion_rate!: number;

  @ApiProperty({
    description: 'First attempt success rate (0-100)',
    example: 65.3,
  })
    first_attempt_success_rate!: number;

  @ApiProperty({
    description: 'Total powerups used',
    example: 8,
  })
    powerups_used!: number;

  @ApiProperty({
    description: 'Total hints used across all exercises',
    example: 23,
  })
    hints_used!: number;

  @ApiProperty({
    description: 'Current streak in days',
    example: 5,
  })
    streak_current!: number;

  @ApiProperty({
    description: 'Longest streak achieved in days',
    example: 12,
  })
    streak_longest!: number;
}
