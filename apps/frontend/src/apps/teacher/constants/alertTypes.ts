/**
 * Alert Types and Priorities Configuration
 *
 * Centralized configuration for teacher intervention alerts.
 * Used in TeacherAlertsPage and related components.
 *
 * @module apps/teacher/constants/alertTypes
 */

/**
 * Alert Type Definition
 */
export interface AlertTypeConfig {
  value: string;
  label: string;
  icon: string;
  description: string;
}

/**
 * Alert Priority Definition
 */
export interface AlertPriorityConfig {
  value: string;
  label: string;
  color: string;
  textColor: string;
  icon: string;
}

/**
 * Alert Types - Define the types of student alerts
 */
export const ALERT_TYPES: AlertTypeConfig[] = [
  {
    value: 'no_activity',
    label: 'Sin Actividad',
    icon: '🚨',
    description: 'Estudiantes inactivos >7 dias',
  },
  {
    value: 'low_score',
    label: 'Bajo Rendimiento',
    icon: '⚠️',
    description: 'Promedio <60%',
  },
  {
    value: 'declining_trend',
    label: 'Tendencia Decreciente',
    icon: '📉',
    description: 'Rendimiento en declive',
  },
  {
    value: 'repeated_failures',
    label: 'Fallos Repetidos',
    icon: '🎯',
    description: 'Multiples intentos fallidos',
  },
  {
    value: 'excessive_time',
    label: 'Tiempo Excesivo',
    icon: '⏱️',
    description: 'Tiempo >2x del promedio',
  },
  {
    value: 'low_engagement',
    label: 'Bajo Engagement',
    icon: '📊',
    description: '<3 ejercicios o <30 min/semana',
  },
];

/**
 * Alert Priorities - Define severity levels
 */
export const ALERT_PRIORITIES: AlertPriorityConfig[] = [
  {
    value: 'critical',
    label: 'Crítica',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    icon: '🔴',
  },
  {
    value: 'high',
    label: 'Alta',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: '🟠',
  },
  {
    value: 'medium',
    label: 'Media',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: '🟡',
  },
  {
    value: 'low',
    label: 'Baja',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: '🔵',
  },
];

/**
 * Get alert type configuration by value
 */
export const getAlertTypeConfig = (value: string): AlertTypeConfig | undefined => {
  return ALERT_TYPES.find((type) => type.value === value);
};

/**
 * Get priority configuration by value
 */
export const getPriorityConfig = (value: string): AlertPriorityConfig | undefined => {
  return ALERT_PRIORITIES.find((priority) => priority.value === value);
};

/**
 * Type values for TypeScript type safety
 */
export type AlertTypeValue = (typeof ALERT_TYPES)[number]['value'];
export type AlertPriorityValue = (typeof ALERT_PRIORITIES)[number]['value'];
