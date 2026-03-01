/**
 * SystemAlertsPanel Component
 *
 * Panel displaying system alerts with dismissible functionality.
 * Shows critical system events, errors, warnings, and security alerts.
 *
 * Features:
 * - Alert cards with priority sorting
 * - Alert types (error, warning, info, security)
 * - Severity indicators (high, medium, low)
 * - Timestamp display
 * - Dismiss button with animation
 * - View details modal
 * - Auto-refresh
 * - Empty state when no alerts
 */

import { useState, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Shield, X, Eye, CheckCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Modal } from '@shared/components/common/Modal';
import type { SystemAlert } from '../../types';

interface SystemAlertsPanelProps {
  alerts: SystemAlert[];
  loading?: boolean;
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
}

export const SystemAlertsPanel = ({
  alerts,
  loading = false,
  onDismiss,
  onDismissAll,
}: SystemAlertsPanelProps) => {
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'security':
        return Shield;
      case 'info':
      default:
        return Info;
    }
  };

  const getAlertColors = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500',
          text: 'text-red-500',
          icon: 'text-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500',
          text: 'text-yellow-500',
          icon: 'text-yellow-500',
        };
      case 'low':
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500',
          text: 'text-blue-500',
          icon: 'text-blue-500',
        };
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleViewDetails = (alert: SystemAlert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  const handleDismiss = (alertId: string) => {
    if (onDismiss) {
      onDismiss(alertId);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DetectiveCard>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-detective-subtitle">System Alerts</h3>
          <p className="text-detective-small text-gray-400">
            {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
          </p>
        </div>

        {alerts.length > 0 && onDismissAll && (
          <button
            onClick={onDismissAll}
            className="hover:bg-detective-bg-tertiary text-detective-small rounded-lg bg-detective-bg-secondary px-4 py-2 transition-colors"
          >
            Dismiss All
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="custom-scrollbar max-h-[600px] space-y-3 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </motion.div>
            </div>
          ) : alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h4 className="mb-2 text-detective-base font-semibold">All Systems Operational</h4>
              <p className="text-detective-small text-gray-400">No active alerts or warnings</p>
            </motion.div>
          ) : (
            alerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                index={index}
                onDismiss={handleDismiss}
                onViewDetails={handleViewDetails}
                getAlertIcon={getAlertIcon}
                getAlertColors={getAlertColors}
                formatTimestamp={formatTimestamp}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        {selectedAlert && (
          <div className="p-6">
            <div className="mb-6 flex items-start gap-4">
              {(() => {
                const Icon = getAlertIcon(selectedAlert.type);
                const colors = getAlertColors(selectedAlert.severity);
                return (
                  <div className={`p-3 ${colors.bg} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                );
              })()}
              <div className="flex-1">
                <h3 className="text-detective-subtitle mb-1">{selectedAlert.title}</h3>
                <div className="text-detective-small flex items-center gap-3 text-gray-400">
                  <span className="capitalize">{selectedAlert.type}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedAlert.severity} severity</span>
                  <span>•</span>
                  <span>
                    {selectedAlert.timestamp
                      ? new Date(selectedAlert.timestamp).toLocaleString('es-ES')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-detective-base font-semibold">Message</h4>
                <p className="text-detective-small text-gray-400">{selectedAlert.message}</p>
              </div>

              <div>
                <h4 className="mb-2 text-detective-base font-semibold">Details</h4>
                <div className="rounded-lg bg-detective-bg-secondary p-4">
                  <pre className="text-detective-small whitespace-pre-wrap font-mono text-gray-400">
                    {selectedAlert.details}
                  </pre>
                </div>
              </div>

              {selectedAlert.affectedResources && selectedAlert.affectedResources.length > 0 && (
                <div>
                  <h4 className="mb-2 text-detective-base font-semibold">Affected Resources</h4>
                  <ul className="space-y-1">
                    {selectedAlert.affectedResources.map((resource, i) => (
                      <li
                        key={i}
                        className="text-detective-small flex items-center gap-2 text-gray-400"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-detective-orange" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-detective-base font-semibold">Source</h4>
                <p className="text-detective-small text-gray-400">{selectedAlert.source}</p>
              </div>

              {selectedAlert.actionRequired && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <p className="text-detective-small font-semibold text-yellow-500">
                    ⚠️ Action Required
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DetectiveCard>
  );
};

// ============================================================================
// ALERT CARD COMPONENT
// ============================================================================

interface AlertCardProps {
  alert: SystemAlert;
  index: number;
  onDismiss: (id: string) => void;
  onViewDetails: (alert: SystemAlert) => void;
  getAlertIcon: (type: string) => ElementType;
  getAlertColors: (severity: string) => any;
  formatTimestamp: (date: Date) => string;
}

const AlertCard = ({
  alert,
  index,
  onDismiss,
  onViewDetails,
  getAlertIcon,
  getAlertColors,
  formatTimestamp,
}: AlertCardProps) => {
  const Icon = getAlertIcon(alert.type);
  const colors = getAlertColors(alert.severity);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 ${colors.bg} border-l-4 ${colors.border} group rounded-lg transition-shadow hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h4 className="truncate text-detective-base font-semibold">{alert.title}</h4>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${colors.bg} ${colors.text} border ${colors.border} whitespace-nowrap`}
            >
              {alert.severity.toUpperCase()}
            </span>
          </div>

          <p className="text-detective-small mb-3 line-clamp-2 text-gray-400" title={alert.message}>{alert.message}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="capitalize">{alert.type}</span>
              <span>•</span>
              <span>{formatTimestamp(alert.timestamp)}</span>
              {alert.actionRequired && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-yellow-500">Action Required</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onViewDetails(alert)}
                className="rounded-lg p-1.5 transition-colors hover:bg-detective-bg-secondary"
                title="View details"
              >
                <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="rounded-lg p-1.5 transition-colors hover:bg-detective-bg-secondary"
                title="Dismiss alert"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
