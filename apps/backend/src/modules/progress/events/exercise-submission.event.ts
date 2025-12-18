/**
 * Exercise Submission Event
 *
 * @description Evento emitido cuando un estudiante envía un ejercicio M4-M5
 * que requiere revisión manual por parte del docente.
 *
 * @version 1.0 (2025-12-05) - BE-P2-008: Notificaciones para docentes
 */

/**
 * Payload del evento 'student.exercise.submitted'
 *
 * @description Contiene toda la información necesaria para notificar al docente
 * sobre una nueva submission de ejercicio que requiere revisión manual.
 */
export interface ExerciseSubmissionEventPayload {
  /**
   * ID del estudiante que envió el ejercicio (profiles.id)
   */
  studentId: string;

  /**
   * Nombre del estudiante para mostrar en la notificación
   */
  studentName: string;

  /**
   * Tipo de ejercicio (video_carta_curie, diario_multimedia, etc.)
   */
  exerciseType: string;

  /**
   * Título del ejercicio
   */
  exerciseTitle: string;

  /**
   * ID del ejercicio (exercises.id)
   */
  exerciseId: string;

  /**
   * ID de la submission (exercise_submissions.id)
   */
  submissionId: string;

  /**
   * ID del módulo al que pertenece el ejercicio
   */
  moduleId: string;

  /**
   * Nombre del módulo
   */
  moduleName?: string;

  /**
   * ID del docente que debe revisar (profiles.id)
   * Se obtiene desde classroom_assignments
   */
  teacherId: string;

  /**
   * Email del docente (para envío de email si está habilitado)
   */
  teacherEmail: string;

  /**
   * Timestamp del evento
   */
  timestamp: Date;
}

/**
 * Nombre del evento
 */
export const EXERCISE_SUBMISSION_EVENT = 'student.exercise.submitted';
