/**
 * LogDetailModal - Displays full details of a single audit log entry.
 *
 * Extracted from AdminAuditLogsPage to comply with SRP.
 * Uses useModalBehavior for Escape-close and body scroll lock.
 *
 * @see US-AE-011 - Visor de Audit Logs
 */

import { motion } from 'framer-motion';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Shield, X, CheckCircle, XCircle } from 'lucide-react';
import type { AuditLogEntry } from '@/services/api/adminTypes';

interface LogDetailModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
}

/**
 * Format a date string to a full Spanish locale representation.
 */
function formatDetailDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
  useModalBehavior(!!log, onClose);

  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-xl bg-detective-bg-secondary p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-detective-text">Detalle del Log</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-bg hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-lg bg-detective-bg p-4">
            <div className="mb-2 text-sm font-medium text-gray-400">Estado</div>
            {log.success ? (
              <span className="inline-flex items-center gap-2 rounded-md bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400">
                <CheckCircle className="h-4 w-4" />
                Autenticacion Exitosa
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400">
                <XCircle className="h-4 w-4" />
                Autenticacion Fallida
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">Email</div>
              <div className="text-detective-text">{log.email}</div>
            </div>

            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">Fecha y Hora</div>
              <div className="text-detective-text">{formatDetailDate(log.attemptedAt)}</div>
            </div>

            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">Direccion IP</div>
              <div className="text-detective-text">{log.ipAddress || 'No disponible'}</div>
            </div>

            <div className="rounded-lg bg-detective-bg p-4">
              <div className="mb-1 text-sm font-medium text-gray-400">ID de Usuario</div>
              <div className="font-mono text-sm text-detective-text">{log.userId || 'N/A'}</div>
            </div>
          </div>

          {/* User Agent */}
          <div className="rounded-lg bg-detective-bg p-4">
            <div className="mb-1 text-sm font-medium text-gray-400">User Agent</div>
            <div className="break-words text-sm text-detective-text">
              {log.userAgent || 'No disponible'}
            </div>
          </div>

          {/* Failure Reason (if failed) */}
          {!log.success && log.failureReason && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="mb-1 text-sm font-medium text-red-400">Razon del Fallo</div>
              <div className="text-sm text-red-300">{log.failureReason}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <DetectiveButton variant="secondary" onClick={onClose}>
            Cerrar
          </DetectiveButton>
        </div>
      </motion.div>
    </div>
  );
};
