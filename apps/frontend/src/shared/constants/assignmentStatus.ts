/**
 * Assignment Status Configuration
 *
 * Shared status config for student assignment pages.
 * Replaces identical duplicates in AssignmentsPage and AssignmentDetailPage.
 *
 * @module shared/constants/assignmentStatus
 */

import { ClipboardList, Clock, CheckCircle, GraduationCap, AlertCircle } from 'lucide-react';
import type React from 'react';

export type AssignmentStatus = 'assigned' | 'in_progress' | 'submitted' | 'graded' | 'late';

export interface AssignmentStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ASSIGNMENT_STATUS_CONFIG: Record<AssignmentStatus, AssignmentStatusConfig> = {
  assigned: {
    label: 'Pendiente',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: ClipboardList,
  },
  in_progress: {
    label: 'En Progreso',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  submitted: {
    label: 'Enviada',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: CheckCircle,
  },
  graded: {
    label: 'Calificada',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: GraduationCap,
  },
  late: {
    label: 'Retrasada',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: AlertCircle,
  },
};

/**
 * Get status config for a given status string, with fallback.
 */
export function getAssignmentStatusConfig(status: string): AssignmentStatusConfig {
  return (
    ASSIGNMENT_STATUS_CONFIG[status as AssignmentStatus] ?? ASSIGNMENT_STATUS_CONFIG.assigned
  );
}
