/**
 * Alert Utilities
 *
 * Shared utility functions for alert components.
 * Used by AlertCard and AlertasTab to ensure consistency.
 *
 * @module alertUtils
 * @date 2025-12-15
 */

import type { SystemAlertSeverity, SystemAlertStatus } from '@/services/api/adminTypes';

/**
 * Get severity badge color classes (solid background + text)
 * Used by AlertCard for prominent severity badges
 */
export function getSeverityColor(severity: SystemAlertSeverity): string {
  const colors: Record<SystemAlertSeverity, string> = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-gray-900',
    low: 'bg-blue-500 text-white',
  };
  return colors[severity];
}

/**
 * Get severity color with transparent background and border
 * Used by AlertasTab for more subtle severity badges
 */
export function getSeverityColorWithBorder(severity: SystemAlertSeverity): string {
  const colors: Record<SystemAlertSeverity, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };
  return colors[severity];
}

/**
 * Get status color classes (transparent bg with border)
 * Used by AlertCard for status badges
 */
export function getStatusColor(status: SystemAlertStatus): string {
  const colors: Record<SystemAlertStatus, string> = {
    open: 'bg-red-500/20 text-red-400 border-red-500/50',
    acknowledged: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
    suppressed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };
  return colors[status];
}

/**
 * Get status text color only (for inline text without background)
 * Used by AlertasTab for status labels
 */
export function getStatusTextColor(status: SystemAlertStatus): string {
  const colors: Record<SystemAlertStatus, string> = {
    open: 'text-red-400',
    acknowledged: 'text-yellow-400',
    resolved: 'text-green-400',
    suppressed: 'text-gray-400',
  };
  return colors[status];
}

/**
 * Get severity label in Spanish
 */
export function getSeverityLabel(severity: SystemAlertSeverity): string {
  const labels: Record<SystemAlertSeverity, string> = {
    critical: 'Critica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
  return labels[severity];
}

/**
 * Get status label in Spanish
 */
export function getStatusLabel(status: SystemAlertStatus): string {
  const labels: Record<SystemAlertStatus, string> = {
    open: 'Abierta',
    acknowledged: 'Reconocida',
    resolved: 'Resuelta',
    suppressed: 'Suprimida',
  };
  return labels[status];
}

/**
 * Format timestamp for compact relative display
 * Used by AlertasTab (e.g., "Hace 5m", "Hace 2h")
 */
export function formatAlertTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `Hace ${minutes}m`;
  } else if (hours < 24) {
    return `Hace ${hours}h`;
  } else if (days < 7) {
    return `Hace ${days}d`;
  } else {
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }
}

/**
 * Format timestamp with more detail
 * Used by AlertCard (e.g., "Hace 5 min", "Hace 2 horas", "Hace 3 dias")
 */
export function formatAlertTimestampDetailed(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} horas`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
