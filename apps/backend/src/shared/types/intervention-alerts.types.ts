/**
 * Tipos para alertas de intervención estudiantil
 * @description Alertas pedagógicas generadas automáticamente para detectar
 * estudiantes que necesitan intervención del profesor
 * @module Teacher Portal
 * @table progress_tracking.student_intervention_alerts
 * @version 1.0
 */

/**
 * Tipos de alerta de intervención
 * Cada tipo indica una condición que requiere atención del profesor
 */
export enum InterventionAlertType {
  /** Sin actividad en plataforma por período extendido */
  NO_ACTIVITY = 'no_activity',
  /** Puntaje por debajo del umbral aceptable */
  LOW_SCORE = 'low_score',
  /** Tendencia negativa en desempeño */
  DECLINING_TREND = 'declining_trend',
  /** Múltiples intentos fallidos consecutivos */
  REPEATED_FAILURES = 'repeated_failures',
  /** Tiempo excesivo en ejercicios */
  EXCESSIVE_TIME = 'excessive_time',
  /** Bajo nivel de engagement/participación */
  LOW_ENGAGEMENT = 'low_engagement',
}

/**
 * Severidad de la alerta
 */
export enum InterventionAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Estado de la alerta en su ciclo de vida
 */
export enum InterventionAlertStatus {
  /** Alerta activa, pendiente de atención */
  ACTIVE = 'active',
  /** Profesor ha visto la alerta */
  ACKNOWLEDGED = 'acknowledged',
  /** Alerta resuelta con acción */
  RESOLVED = 'resolved',
  /** Alerta descartada sin acción */
  DISMISSED = 'dismissed',
}

/**
 * Interface para datos de una alerta de intervención
 */
export interface InterventionAlertData {
  id: string;
  studentId: string;
  classroomId: string;
  type: InterventionAlertType;
  severity: InterventionAlertSeverity;
  status: InterventionAlertStatus;
  message: string;
  details?: Record<string, unknown>;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}
